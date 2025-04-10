import{_ as s,c as a,a as e,o as p}from"./app-CT9FvwxE.js";const t="/blog/assets/postgres-fdw-async-ClJzYyz-.png",l={};function c(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-fdw-asynchronous-execution" tabindex="-1"><a class="header-anchor" href="#postgresql-fdw-asynchronous-execution"><span>PostgreSQL - FDW Asynchronous Execution</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 07 / 05 17:49</p><p>Hangzhou, Zhejiang, China</p><hr><p>Foreign Data Wrapper（FDW）是 PostgreSQL 提供的一个非常有意思的特性，中文翻译为 <strong>外部数据包装器</strong>。从字面意思上，PostgreSQL 数据库能够通过 FDW 扩展来操作当前数据库以外的数据。这些外部的数据源可以是：</p><ul><li>文件</li><li>关系型数据库（PostgreSQL / Oracle / MySQL / ...）</li><li>非关系型数据库</li><li>Git 仓库</li><li>网页</li><li>大数据平台（Hadoop / Hive / ...）</li><li>...（尽情遐想）😏</li></ul><p>PostgreSQL 内核中定义了 FDW 回调函数接口，这个接口在形式上是一个装满了函数指针的结构体 <code>FdwRoutine</code>。这些函数指针会在 PostgreSQL 内核的优化器和执行器的关键位置上被回调，以完成操纵外部数据。服务于每一种外部数据源的 FDW 都需要提供一个 <code>FdwRoutine</code> 结构体。如果要对一种新的外部数据源实现 FDW 扩展，主要工作就是填充 <code>FdwRoutine</code> 结构体中的函数指针，实现对这种外部数据源的操作逻辑。</p><p>由于涉及到操纵数据库外部的数据，一个不可避免的因素出现了：性能。与操作数据库内的数据不同，操纵外部数据可能会带来额外的网络 I/O 开销和计算开销（序列化/反序列化）。受制于目前 PostgreSQL 内核执行器的执行模型，使用 FDW 操纵外部数据使用了与操纵本地数据一致的 <strong>同步执行模型</strong>，在性能有很大的提升空间。</p><p>PostgreSQL 14 首次为 FDW 引入了 <strong>异步执行模型</strong>。虽然目前支持的场景较为有限，但依旧能够有效并行化一些操纵远程数据的场景，提升执行效率。本文将从原理和实现上对异步执行功能进行分析。源码版本基于 PostgreSQL 14 的稳定分支 <code>REL_14_STABLE</code>，commit 号截止至：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit fb81a93a6442e55d8c7376a01c27cb5d6c062c80</span>
<span class="line">Author: Thomas Munro &lt;tmunro@postgresql.org&gt;</span>
<span class="line">Date:   Fri Jul 1 12:05:52 2022 +1200</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><h3 id="fdw" tabindex="-1"><a class="header-anchor" href="#fdw"><span>FDW</span></a></h3><p>FDW 是 PostgreSQL 提供的一个特性，它能够让用户在 PostgreSQL 中创建 <strong>外部表（Foreign Table）</strong>。外部表将被作为代理，用于访问外部数据源。当用户对外部表发起查询时，FDW 会负责把查询进行一定的形式转换后访问外部数据源，并负责将外部数据源返回的数据转换回 PostgreSQL 的结果形式，让用户觉得查询一个外部数据源好像和查询一个数据库内的普通表一样没什么区别。目前 PostgreSQL 官方提供了两个 FDW 实现：</p><ul><li><code>file_fdw</code>：使用户能够创建代表普通文件的外部表</li><li><code>postgres_fdw</code>：使用户能够创建代表另一个 PostgreSQL 数据库表的外部表</li></ul><p>其余大量的第三方 FDW 插件及其源码可以参考 <a href="https://wiki.postgresql.org/wiki/Foreign_data_wrappers" target="_blank" rel="noopener noreferrer">这里</a>，它们都实现了 FDW 对外暴露出的函数接口 <a href="https://www.postgresql.org/docs/14/fdw-callbacks.html" target="_blank" rel="noopener noreferrer"><code>FdwRoutine</code></a>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * FdwRoutine is the struct returned by a foreign-data wrapper&#39;s handler</span>
<span class="line"> * function.  It provides pointers to the callback functions needed by the</span>
<span class="line"> * planner and executor.</span>
<span class="line"> *</span>
<span class="line"> * More function pointers are likely to be added in the future.  Therefore</span>
<span class="line"> * it&#39;s recommended that the handler initialize the struct with</span>
<span class="line"> * makeNode(FdwRoutine) so that all fields are set to NULL.  This will</span>
<span class="line"> * ensure that no fields are accidentally left undefined.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">FdwRoutine</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    NodeTag     type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Functions for scanning foreign tables */</span></span>
<span class="line">    GetForeignRelSize_function GetForeignRelSize<span class="token punctuation">;</span></span>
<span class="line">    GetForeignPaths_function GetForeignPaths<span class="token punctuation">;</span></span>
<span class="line">    GetForeignPlan_function GetForeignPlan<span class="token punctuation">;</span></span>
<span class="line">    BeginForeignScan_function BeginForeignScan<span class="token punctuation">;</span></span>
<span class="line">    IterateForeignScan_function IterateForeignScan<span class="token punctuation">;</span></span>
<span class="line">    ReScanForeignScan_function ReScanForeignScan<span class="token punctuation">;</span></span>
<span class="line">    EndForeignScan_function EndForeignScan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Remaining functions are optional.  Set the pointer to NULL for any that</span>
<span class="line">     * are not provided.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Functions for remote-join planning */</span></span>
<span class="line">    GetForeignJoinPaths_function GetForeignJoinPaths<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Functions for remote upper-relation (post scan/join) planning */</span></span>
<span class="line">    GetForeignUpperPaths_function GetForeignUpperPaths<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Functions for updating foreign tables */</span></span>
<span class="line">    AddForeignUpdateTargets_function AddForeignUpdateTargets<span class="token punctuation">;</span></span>
<span class="line">    PlanForeignModify_function PlanForeignModify<span class="token punctuation">;</span></span>
<span class="line">    BeginForeignModify_function BeginForeignModify<span class="token punctuation">;</span></span>
<span class="line">    ExecForeignInsert_function ExecForeignInsert<span class="token punctuation">;</span></span>
<span class="line">    ExecForeignBatchInsert_function ExecForeignBatchInsert<span class="token punctuation">;</span></span>
<span class="line">    GetForeignModifyBatchSize_function GetForeignModifyBatchSize<span class="token punctuation">;</span></span>
<span class="line">    ExecForeignUpdate_function ExecForeignUpdate<span class="token punctuation">;</span></span>
<span class="line">    ExecForeignDelete_function ExecForeignDelete<span class="token punctuation">;</span></span>
<span class="line">    EndForeignModify_function EndForeignModify<span class="token punctuation">;</span></span>
<span class="line">    BeginForeignInsert_function BeginForeignInsert<span class="token punctuation">;</span></span>
<span class="line">    EndForeignInsert_function EndForeignInsert<span class="token punctuation">;</span></span>
<span class="line">    IsForeignRelUpdatable_function IsForeignRelUpdatable<span class="token punctuation">;</span></span>
<span class="line">    PlanDirectModify_function PlanDirectModify<span class="token punctuation">;</span></span>
<span class="line">    BeginDirectModify_function BeginDirectModify<span class="token punctuation">;</span></span>
<span class="line">    IterateDirectModify_function IterateDirectModify<span class="token punctuation">;</span></span>
<span class="line">    EndDirectModify_function EndDirectModify<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Functions for SELECT FOR UPDATE/SHARE row locking */</span></span>
<span class="line">    GetForeignRowMarkType_function GetForeignRowMarkType<span class="token punctuation">;</span></span>
<span class="line">    RefetchForeignRow_function RefetchForeignRow<span class="token punctuation">;</span></span>
<span class="line">    RecheckForeignScan_function RecheckForeignScan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for EXPLAIN */</span></span>
<span class="line">    ExplainForeignScan_function ExplainForeignScan<span class="token punctuation">;</span></span>
<span class="line">    ExplainForeignModify_function ExplainForeignModify<span class="token punctuation">;</span></span>
<span class="line">    ExplainDirectModify_function ExplainDirectModify<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for ANALYZE */</span></span>
<span class="line">    AnalyzeForeignTable_function AnalyzeForeignTable<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for IMPORT FOREIGN SCHEMA */</span></span>
<span class="line">    ImportForeignSchema_function ImportForeignSchema<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for TRUNCATE */</span></span>
<span class="line">    ExecForeignTruncate_function ExecForeignTruncate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for parallelism under Gather node */</span></span>
<span class="line">    IsForeignScanParallelSafe_function IsForeignScanParallelSafe<span class="token punctuation">;</span></span>
<span class="line">    EstimateDSMForeignScan_function EstimateDSMForeignScan<span class="token punctuation">;</span></span>
<span class="line">    InitializeDSMForeignScan_function InitializeDSMForeignScan<span class="token punctuation">;</span></span>
<span class="line">    ReInitializeDSMForeignScan_function ReInitializeDSMForeignScan<span class="token punctuation">;</span></span>
<span class="line">    InitializeWorkerForeignScan_function InitializeWorkerForeignScan<span class="token punctuation">;</span></span>
<span class="line">    ShutdownForeignScan_function ShutdownForeignScan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for path reparameterization. */</span></span>
<span class="line">    ReparameterizeForeignPathByChild_function ReparameterizeForeignPathByChild<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for asynchronous execution */</span></span>
<span class="line">    IsForeignPathAsyncCapable_function IsForeignPathAsyncCapable<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncRequest_function ForeignAsyncRequest<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncConfigureWait_function ForeignAsyncConfigureWait<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncNotify_function ForeignAsyncNotify<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> FdwRoutine<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如注释所描述，这些函数指针会在 PostgreSQL 内核的优化器和执行器中被回调，完成 FDW 所需要实现的功能。比如 <code>postgres_fdw</code> 就会在这些回调函数中使用 <a href="https://www.postgresql.org/docs/current/libpq.html" target="_blank" rel="noopener noreferrer">libpq</a>（PostgreSQL 客户端与服务端进程交互的 API 协议 C 语言库）与一个远程的 PostgreSQL 数据库建立连接并获取数据。FDW 能够在一定程度上体现 PostgreSQL 的可扩展性。</p><h3 id="execution-model-of-postgresql-executor" tabindex="-1"><a class="header-anchor" href="#execution-model-of-postgresql-executor"><span>Execution Model of PostgreSQL Executor</span></a></h3><p>PostgreSQL 内核的执行器使用 <strong>迭代器模型</strong>（又称火山模型，流水线模型）设计。与多数编程语言使用迭代器的方式类似，执行器包含了三个执行阶段：</p><ul><li>初始化（打开迭代器）</li><li>执行（如果还有更多数据，则获取数据）</li><li>清理（关闭迭代器）</li></ul><p>对照 Java 迭代器：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> items <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> iter <span class="token operator">=</span> items<span class="token punctuation">.</span><span class="token function">iterator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span>iter<span class="token punctuation">.</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">String</span> next <span class="token operator">=</span> iter<span class="token punctuation">.</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">// iter close is done by GC</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>执行器的每一个物理算子都会实现这三个函数。当 PostgreSQL 的 planner 输出一棵物理计划树以后，在执行器初始化阶段，执行器会从计划树根节点的物理算子开始，调用物理算子的初始化函数；这个物理算子的初始化函数又会递归调用其下层算子的初始化函数，直到执行流到达计划树的叶子节点。执行器执行阶段和清理阶段的逻辑也采用了类似的递归形式实现。</p><p>PostgreSQL 内核中的绝大多数物理算子都是一元或二元的，即该算子需要从自己的一个或两个下层物理算子（孩子节点）中获取元组，并完成在当前物理算子中需要完成的事。物理算子是一元还是二元可以通过 <code>EXPLAIN</code> 命令从执行计划中看出来。</p><p>比如说 Sort（排序）算子就是一个一元算子，它只需要从它的下层物理算子获取所有元组，并根据排序的 key 完成排序，然后将排序后的第一个元组返回上层物理算子即可：</p><blockquote><p>在 PostgreSQL <code>EXPLAIN</code> 打印的物理计划中，<code>-&gt;</code> 的缩进层次对应了物理计划树的层级关系。</p></blockquote><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token operator">-</span><span class="token operator">&gt;</span>  Sort  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">5726599.94</span><span class="token punctuation">.</span><span class="token number">.5789078</span><span class="token number">.79</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">24991540</span> width<span class="token operator">=</span><span class="token number">9</span><span class="token punctuation">)</span></span>
<span class="line">      Sort <span class="token keyword">Key</span>: lineitem_1<span class="token punctuation">.</span>l_orderkey</span>
<span class="line">      <span class="token operator">-</span><span class="token operator">&gt;</span>  Parallel Seq Scan <span class="token keyword">on</span> lineitem lineitem_1  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.1374457</span><span class="token number">.40</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">24991540</span> width<span class="token operator">=</span><span class="token number">9</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而 Hash Join（哈希连接）算子就是一个二元算子，它需要先从一个下层物理算子中获取所有元组并构造哈希表，然后从另一个下层物理算子中依次获取元组，并在哈希表中进行哈希探测和连接：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token operator">-</span><span class="token operator">&gt;</span>  <span class="token keyword">Hash</span> <span class="token keyword">Join</span>  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">6032162.96</span><span class="token punctuation">.</span><span class="token number">.6658785</span><span class="token number">.84</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">138372</span> width<span class="token operator">=</span><span class="token number">24</span><span class="token punctuation">)</span></span>
<span class="line">      <span class="token keyword">Hash</span> Cond: <span class="token punctuation">(</span>orders<span class="token punctuation">.</span>o_orderkey <span class="token operator">=</span> lineitem_1<span class="token punctuation">.</span>l_orderkey<span class="token punctuation">)</span></span>
<span class="line">      <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> orders  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.410917</span><span class="token number">.44</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">15000544</span> width<span class="token operator">=</span><span class="token number">20</span><span class="token punctuation">)</span></span>
<span class="line">      <span class="token operator">-</span><span class="token operator">&gt;</span>  <span class="token keyword">Hash</span>  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">6029892.31</span><span class="token punctuation">.</span><span class="token number">.6029892</span><span class="token number">.31</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">138372</span> width<span class="token operator">=</span><span class="token number">4</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="append-operator" tabindex="-1"><a class="header-anchor" href="#append-operator"><span>Append Operator</span></a></h3><p>Append 是所有算子中的一个奇葩，它破坏了上述计划树类似二叉树的结构。让我们试想，假设要扫描一个带有多于两个子分区的分区表，如果只能产生一棵二叉树，那么会产生一个什么样的计划树呢？形状一定会很奇怪吧。😅</p><p>让我们看看目前 PostgreSQL 对分区表扫描的执行计划吧：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line">                              QUERY <span class="token keyword">PLAN</span></span>
<span class="line"><span class="token comment">----------------------------------------------------------------------</span></span>
<span class="line"> Append  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.307</span><span class="token number">.30</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">15820</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p0  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p1  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p2  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p3  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p4  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p5  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Seq Scan <span class="token keyword">on</span> mc2p_default  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">0.00</span><span class="token punctuation">.</span><span class="token number">.32</span><span class="token number">.60</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">2260</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Append 算子就是用来解决这个问题的，它可以有多于两个下层物理算子。事实上，在 Append 算子 <code>src/backend/executor/nodeAppend.c</code> 的注释中就可以了解到，Append 算子并不使用其它物理算子所使用的 <strong>左右孩子指针</strong> 来引用下层算子，而是持有一个 <strong>链表</strong>，链表中包含了它需要引用的所有下层物理算子，个数不受限。下层物理算子的子树被称为子计划：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> *   NOTES</span>
<span class="line"> *      Each append node contains a list of one or more subplans which</span>
<span class="line"> *      must be iteratively processed (forwards or backwards).</span>
<span class="line"> *      Tuples are retrieved by executing the &#39;whichplan&#39;th subplan</span>
<span class="line"> *      until the subplan stops returning tuples, at which point that</span>
<span class="line"> *      plan is shut down and the next started up.</span>
<span class="line"> *</span>
<span class="line"> *      Append nodes don&#39;t make use of their left and right</span>
<span class="line"> *      subtrees, rather they maintain a list of subplans so</span>
<span class="line"> *      a typical append node looks like this in the plan tree:</span>
<span class="line"> *</span>
<span class="line"> *                 ...</span>
<span class="line"> *                 /</span>
<span class="line"> *              Append -------+------+------+--- nil</span>
<span class="line"> *              /   \\         |      |      |</span>
<span class="line"> *            nil   nil      ...    ...    ...</span>
<span class="line"> *                               subplans</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如注释所示意的，在执行器的执行阶段，Append 算子会依次从它的下层物理算子（子计划）中获取元组并返回上层算子，当一个子计划中的数据枯竭（返回 NULL）后，就开始从下一个子计划开始获取，直到压榨完链表中所有的子计划为止。</p><p>因为 Append 算子的特殊性，它被广泛用于需要将来自多方的数据进行融合的场合，包括 FDW。比如说一个分区表的子分区分布在多个 PostgreSQL 实例上，就需要通过 Append 算子来做汇聚：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line">                                       QUERY <span class="token keyword">PLAN</span></span>
<span class="line"><span class="token comment">----------------------------------------------------------------------------------------</span></span>
<span class="line"> Aggregate  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">8882.01</span><span class="token punctuation">.</span><span class="token number">.8882</span><span class="token number">.02</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">1</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   Output: <span class="token function">count</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Append  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.8382</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">200001</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p1 pt_1  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.3641</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">100000</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct1</span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p2 pt_2  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.3641</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">100000</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct2</span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p3 pt_3  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.100</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">1</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct3</span>
<span class="line"><span class="token punctuation">(</span><span class="token number">9</span> <span class="token keyword">rows</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们就需要注意了：Append 算子是依次 <strong>串行同步</strong> 地执行每一个子计划的。当其中某个子计划与其在数据库内执行相比需要执行较长时间（通过网络 I/O 外发请求 + 在远程机器上执行）时，FDW 的性能是相当低的。这也是之前 PostgreSQL 执行模型的一个局限：只考虑了如何执行数据库内的操作，并没有为 FDW 这种场景做专门的优化。</p><h2 id="asynchronized-execution" tabindex="-1"><a class="header-anchor" href="#asynchronized-execution"><span>Asynchronized Execution</span></a></h2><p>经过上面的分析可以发现，在 FDW 场景中，PostgreSQL 的执行模型有着很大的提升空间。原先，一个子计划需要等待前一个子计划执行完毕以后才可以开始执行。那么能不能一次性让所有的外库子计划全部开始执行，然后开始同步执行一部分库内的计划，同时等待所有外库子计划的执行结果呢？这样所有外库都在并行执行查询，而等待外库执行结果的时间又可以被用于执行库内的计划，从而能够极大提升执行效率。</p><p>这就是 PostgreSQL 14 引入的 <strong>FDW 异步执行</strong> 特性的设计思路。目前这一特性暂时只被实现在了 Append 算子与其直接下游 ForeignScan 算子之间，且暂时仅支持 <code>postgres_fdw</code> 的异步执行。未来或许会再做扩展。其主要的实现思路为：</p><ul><li>在 Append 算子的实现 <code>src/backend/executor/nodeAppend.c</code> 中，引入对同步子计划和异步子计划的分别处理 <ul><li><code>ExecAppendAsyncBegin()</code></li><li><code>ExecAppendAsyncGetNext()</code></li><li><code>ExecAppendAsyncRequest()</code></li><li><code>ExecAppendAsyncEventWait()</code></li><li><code>ExecAsyncAppendResponse()</code></li></ul></li><li>在 <code>src/backend/executor/execAsync.c</code> 中，引入了异步执行的抽象中间层 <ul><li><code>ExecAsyncRequest()</code></li><li><code>ExecAsyncConfigureWait()</code></li><li><code>ExecAsyncNotify()</code></li><li><code>ExecAsyncResponse()</code></li><li><code>ExecAsyncRequestPending()</code></li><li><code>ExecAsyncRequestDone()</code></li></ul></li><li>在外部表扫描层 <code>src/backend/executor/nodeForeignScan.c</code> 中，将执行流引入 FDW 的异步执行函数中 <ul><li><code>ExecAsyncForeignScanRequest()</code></li><li><code>ExecAsyncForeignScanConfigureWait()</code></li><li><code>ExecAsyncForeignScanNotify()</code></li></ul></li><li>在 <code>postgres_fdw</code> 的实现 <code>contrib/postgres_fdw/postgres_fdw.c</code> 中，实现支持异步执行的接口函数 <ul><li><code>postgresForeignAsyncRequest()</code></li><li><code>postgresForeignAsyncConfigureWait()</code></li><li><code>postgresForeignAsyncNotify()</code></li></ul></li></ul><p>从上述函数命名可以看出，FDW 的异步执行功能实现在四个层次上。其中，上层的 Append 算子会调用异步抽象层的函数，异步抽象层的函数进而调用 ForeignScan 算子的函数，再进而调用 <code>postgres_fdw</code> 的异步执行函数。整体操作分为三个步骤：</p><ol><li>异步发送请求（只发送请求，不等待结果）</li><li>配置等待事件集合，轮询等待事件</li><li>等待事件触发后，封装执行结果并返回给上层（Append）算子</li></ol><p>函数调用关系为：</p><p><img src="`+t+`" alt="postgres-fdw-async"></p><p>接下来从上到下对每一层的代码进行分析。</p><blockquote><p>源代码中的 <code>//</code> 注释是本人添加的说明。由于 PostgreSQL 内核中不允许出现这种风格的注释，我正好使用这种注释风格与原有内核注释加以区别。</p></blockquote><h3 id="append-算子" tabindex="-1"><a class="header-anchor" href="#append-算子"><span>Append 算子</span></a></h3><p>首先，FDW 异步执行特性引入了一个新的选项 <code>async_capable</code>。它同时是一个服务器级别和表级别的选项，指示对应的数据库服务器和服务器上的表是否可以被异步执行。表级别的选项将会覆盖服务器级别的选项。只要外部表的这个参数被设置为 <code>true</code>，那么优化器就会产生异步执行的计划树：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line">                                          QUERY <span class="token keyword">PLAN</span></span>
<span class="line"><span class="token comment">----------------------------------------------------------------------------------------------</span></span>
<span class="line"> Aggregate  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">8882.01</span><span class="token punctuation">.</span><span class="token number">.8882</span><span class="token number">.02</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">1</span> width<span class="token operator">=</span><span class="token number">8</span><span class="token punctuation">)</span></span>
<span class="line">   Output: <span class="token function">count</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">   <span class="token operator">-</span><span class="token operator">&gt;</span>  Append  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.8382</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">200001</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  Async <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p1 pt_1  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.3641</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">100000</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct1</span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  Async <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p2 pt_2  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.3641</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">100000</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct2</span>
<span class="line">         <span class="token operator">-</span><span class="token operator">&gt;</span>  Async <span class="token keyword">Foreign</span> Scan <span class="token keyword">on</span> <span class="token keyword">public</span><span class="token punctuation">.</span>p3 pt_3  <span class="token punctuation">(</span>cost<span class="token operator">=</span><span class="token number">100.00</span><span class="token punctuation">.</span><span class="token number">.100</span><span class="token number">.00</span> <span class="token keyword">rows</span><span class="token operator">=</span><span class="token number">1</span> width<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">               Remote <span class="token keyword">SQL</span>: <span class="token keyword">SELECT</span> <span class="token boolean">NULL</span> <span class="token keyword">FROM</span> <span class="token keyword">public</span><span class="token punctuation">.</span>loct3</span>
<span class="line"><span class="token punctuation">(</span><span class="token number">9</span> <span class="token keyword">rows</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execinitappend" tabindex="-1"><a class="header-anchor" href="#execinitappend"><span>ExecInitAppend</span></a></h4><p>在 Append 算子的初始化阶段，即函数 <code>ExecInitAppend()</code> 中，需要为其下层所有的子计划分配好 <code>PlanState</code> 指针数组以便能够引用下层算子，然后递归调用每一个下层算子的初始化函数。在这个过程中，顺便统计一下哪几个子计划是可以被异步执行的：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">// 分配指向所有下层算子 PlanState 的指针数组</span></span>
<span class="line">appendplanstates <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">palloc</span><span class="token punctuation">(</span>nplans <span class="token operator">*</span></span>
<span class="line">                                         <span class="token keyword">sizeof</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * call ExecInitNode on each of the valid plans to be executed and save</span>
<span class="line"> * the results into the appendplanstates array.</span>
<span class="line"> *</span>
<span class="line"> * While at it, find out the first valid partial plan.</span>
<span class="line"> */</span></span>
<span class="line">j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">asyncplans <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">nasyncplans <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">firstvalid <span class="token operator">=</span> nplans<span class="token punctuation">;</span></span>
<span class="line">i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 遍历每一个合法子计划，递归调用每一个下层算子的初始化函数</span></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>validsubplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan       <span class="token operator">*</span>initNode <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">list_nth</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Record async subplans.  When executing EvalPlanQual, we treat them</span>
<span class="line">     * as sync ones; don&#39;t do this when initializing an EvalPlanQual plan</span>
<span class="line">     * tree.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 在 bitmap 中记录异步子计划的个数和位置</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>initNode<span class="token operator">-&gt;</span>async_capable <span class="token operator">&amp;&amp;</span> estate<span class="token operator">-&gt;</span>es_epq_active <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        asyncplans <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span>asyncplans<span class="token punctuation">,</span> j<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        nasyncplans<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Record the lowest appendplans index which is a valid partial plan.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 记录好第一个将要被执行的下层算子</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>i <span class="token operator">&gt;=</span> node<span class="token operator">-&gt;</span>first_partial_plan <span class="token operator">&amp;&amp;</span> j <span class="token operator">&lt;</span> firstvalid<span class="token punctuation">)</span></span>
<span class="line">        firstvalid <span class="token operator">=</span> j<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 把下层算子构建完成的 PlanState 记录到刚才分配的指针数组中</span></span>
<span class="line">    appendplanstates<span class="token punctuation">[</span>j<span class="token operator">++</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span>initNode<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在明确哪些子计划需要被异步执行以后，还需要为每一个异步子计划分配一个 <code>AsyncRequest</code> 结构体。这个结构体被用于与下层算子传递请求状态和执行结果：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">// 如果有异步执行的子计划</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>nasyncplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 分配所有子计划的 AsyncRequest 的指针数组</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_asyncrequests <span class="token operator">=</span> <span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">palloc0</span><span class="token punctuation">(</span>nplans <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 通过 bitmap 找到每一个需要被异步执行的子计划</span></span>
<span class="line">    i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>asyncplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 分配 AsyncRequest 结构体内存</span></span>
<span class="line">        areq <span class="token operator">=</span> <span class="token function">palloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span>AsyncRequest<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 数据请求方：Append 算子</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>requestor <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> appendstate<span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 被请求方：Append 算子的下层算子（ForeignScan 算子）</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>requestee <span class="token operator">=</span> appendplanstates<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>request_index <span class="token operator">=</span> i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// AsyncRequest 中保存的状态和结果的初始化</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>request_complete <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        appendstate<span class="token operator">-&gt;</span>as_asyncrequests<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> areq<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 为异步子计划分配元组缓存槽</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_asyncresults <span class="token operator">=</span> <span class="token punctuation">(</span>TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">palloc0</span><span class="token punctuation">(</span>nasyncplans <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>TupleTableSlot <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 对合法的同步子计划和异步子计划进行分类</span></span>
<span class="line">    <span class="token comment">// 分别保存到不同的 bitmap 中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>appendstate<span class="token operator">-&gt;</span>as_valid_subplans <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">classify_matching_subplans</span><span class="token punctuation">(</span>appendstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execappend" tabindex="-1"><a class="header-anchor" href="#execappend"><span>ExecAppend</span></a></h4><p>当 Append 算子第一次被执行时，将会立刻开启所有异步子计划的执行。当然，由于是异步的，所以只是把请求发出去了，并不阻塞等待结果。通过调用异步抽象层的 <code>ExecAppendAsyncBegin()</code> 完成：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * If this is the first call after Init or ReScan, we need to do the</span>
<span class="line"> * initialization work.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token comment">// 第一次调用 ExecAppend，需要选择第一个子计划开始执行</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_begun<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">==</span> INVALID_SUBPLAN_INDEX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Nothing to do if there are no subplans */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nplans <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果有异步子计划，立刻开始执行</span></span>
<span class="line">    <span class="token comment">/* If there are any async subplans, begin executing them. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ExecAppendAsyncBegin</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 选择下一个要被同步执行的计划</span></span>
<span class="line">    <span class="token comment">// 如果同步子计划和异步子计划都没有了，就向上层算子返回空槽，Append 的执行结束</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If no sync subplan has been chosen, we must choose one before</span>
<span class="line">     * proceeding.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span><span class="token function">choose_next_subplan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">||</span></span>
<span class="line">           <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&gt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&lt;</span> node<span class="token operator">-&gt;</span>as_nplans<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 第一次 ExecAppend 的初始化完毕，下次不再进入</span></span>
<span class="line">    <span class="token comment">/* And we&#39;re initialized. */</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_begun <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>初始化结束后，就是不断从子计划中递归获取元组了。让我们看看异步执行做了什么样的改造：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">// 接上一段代码的初始化，目前 ExecAppend 的初始化已结束</span></span>
<span class="line"><span class="token comment">// 应该已经选中了一个子计划准备开始执行</span></span>
<span class="line"><span class="token comment">// 从当前选中的子计划开始不断调用 ExecProcNode 递归获取元组</span></span>
<span class="line"><span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState  <span class="token operator">*</span>subnode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 首先，尝试从刚才已经开启执行的异步子计划中获取一个元组</span></span>
<span class="line">    <span class="token comment">// 如果能够获取到一个元组，那么立刻返回</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * try to get a tuple from an async subplan if any</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">||</span> <span class="token operator">!</span><span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecAppendAsyncGetNext</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token operator">&amp;</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 没能从任何异步子计划中获取到元组</span></span>
<span class="line">    <span class="token comment">// 那么找到目前正在被执行的同步子计划</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * figure out which sync subplan we are currently processing</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&gt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&lt;</span> node<span class="token operator">-&gt;</span>as_nplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    subnode <span class="token operator">=</span> node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">[</span>node<span class="token operator">-&gt;</span>as_whichplan<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 从同步子计划中获取一个元组</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get a tuple from the subplan</span>
<span class="line">     */</span></span>
<span class="line">    result <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>subnode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 同步子计划的结果非空，那么返回结果</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If the subplan gave us something then return it as-is. We do</span>
<span class="line">         * NOT make use of the result slot that was set up in</span>
<span class="line">         * ExecInitAppend; there&#39;s no need for it.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 同步子计划结果为空，</span></span>
<span class="line">    <span class="token comment">// 说明这个同步子计划执行结束，需要选择下一个被执行的同步子计划</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 在结束这个同步子计划的迭代前</span></span>
<span class="line">    <span class="token comment">// 先对异步子计划的等待事件集合来一次轮询</span></span>
<span class="line">    <span class="token comment">// 这样下一次循环或许可以从异步子计划中获取到元组</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * wait or poll for async events if any. We do this before checking</span>
<span class="line">     * for the end of iteration, because it might drain the remaining</span>
<span class="line">     * async subplans.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// 轮询，并处理触发的事件</span></span>
<span class="line">        <span class="token function">ExecAppendAsyncEventWait</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果同步子计划和异步子计划全部执行完毕，那么返回空槽结束 Append 算子的执行</span></span>
<span class="line">    <span class="token comment">// 否则指向下一个将要被执行的同步子计划</span></span>
<span class="line">    <span class="token comment">/* choose new sync subplan; if no sync/async subplans, we&#39;re done */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span><span class="token function">choose_next_subplan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 进入下一次循环</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后我们进一步分析上面的代码中用到的几个异步执行函数。</p><h4 id="execappendasyncbegin" tabindex="-1"><a class="header-anchor" href="#execappendasyncbegin"><span>ExecAppendAsyncBegin</span></a></h4><p>该函数用于向所有合法的异步子计划请求元组。由于是异步执行，因此只管发送请求，不管接收结果。其中将会调用到下一层（也就是异步抽象层）的 <code>ExecAsyncRequest()</code> 函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAppendAsyncBegin</span>
<span class="line"> *</span>
<span class="line"> *      Begin executing designed async-capable subplans.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAppendAsyncBegin</span><span class="token punctuation">(</span>AppendState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Initialize state variables. */</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">=</span> <span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_valid_subplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">=</span> <span class="token function">bms_num_members</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_valid_asyncplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果没有任何异步子计划需要被执行，那么直接返回</span></span>
<span class="line">    <span class="token comment">/* Nothing to do if there are no valid async subplans. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 通过 bitmap 遍历每一个合法的异步子计划</span></span>
<span class="line">    <span class="token comment">/* Make a request for each of the valid async subplans. */</span></span>
<span class="line">    i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_valid_asyncplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        AsyncRequest <span class="token operator">*</span>areq <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_asyncrequests<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>request_index <span class="token operator">==</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Do the actual work. */</span></span>
<span class="line">        <span class="token comment">// 调用异步抽象层的函数，向异步子计划请求元组</span></span>
<span class="line">        <span class="token function">ExecAsyncRequest</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execappendasyncgetnext" tabindex="-1"><a class="header-anchor" href="#execappendasyncgetnext"><span>ExecAppendAsyncGetNext</span></a></h4><p>该函数从任意一个异步子计划中获取下一个元组，并保存到输入参数中的元组缓存槽 <code>result</code> 中。如果函数结束时元组缓存槽中包含了有效结果，那么函数返回 <code>true</code>，否则返回 <code>false</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAppendAsyncGetNext</span>
<span class="line"> *</span>
<span class="line"> *      Get the next tuple from any of the asynchronous subplans.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">ExecAppendAsyncGetNext</span><span class="token punctuation">(</span>AppendState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>result<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token operator">*</span>result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* We should never be called when there are no valid async subplans. */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 异步地请求子计划</span></span>
<span class="line">    <span class="token comment">// 如果该函数在 result 中产生了有效结果，那么直接返回 true</span></span>
<span class="line">    <span class="token comment">/* Request a tuple asynchronously. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecAppendAsyncRequest</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 没有产生有效结果</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 还有异步子计划没执行完</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 轮询等待事件</span></span>
<span class="line">        <span class="token comment">// 如果有就绪事件，并触发回调并保存执行结果</span></span>
<span class="line">        <span class="token comment">/* Wait or poll for async events. */</span></span>
<span class="line">        <span class="token function">ExecAppendAsyncEventWait</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 异步地请求子计划</span></span>
<span class="line">        <span class="token comment">// 如果该函数在 result 中产生了有效结果，那么直接返回 true</span></span>
<span class="line">        <span class="token comment">/* Request a tuple asynchronously. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecAppendAsyncRequest</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 没能从异步子计划中获取到任何元组</span></span>
<span class="line">        <span class="token comment">// 如果目前还有同步计划没执行完，那么跳出循环，先去执行同步子计划</span></span>
<span class="line">        <span class="token comment">/* Break from loop if there&#39;s any sync subplan that isn&#39;t complete. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 如果同步子计划已全部执行完，只剩下异步子计划了</span></span>
<span class="line">        <span class="token comment">// 那么循环从这里绕回，继续等待异步子计划的执行结果</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 至此，异步计划已全部执行完</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If all sync subplans are complete, we&#39;re totally done scanning the</span>
<span class="line">     * given node.  Otherwise, we&#39;re done with the asynchronous stuff but must</span>
<span class="line">     * continue scanning the sync subplans.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 如果同步计划也全都执行完了，那么整个 Append 算子的执行就结束了，向上级算子返回空槽</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token operator">*</span>result <span class="token operator">=</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 这一轮调用没能得到任何有效结果，返回 false</span></span>
<span class="line">    <span class="token keyword">return</span> false<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execappendasyncrequest" tabindex="-1"><a class="header-anchor" href="#execappendasyncrequest"><span>ExecAppendAsyncRequest</span></a></h4><p>该函数用于异步地请求一个元组，也会调用异步抽象层的 <code>ExecAsyncRequest()</code>。同样，如果函数结束时元组缓存槽 <code>result</code> 中包含了有效结果，那么函数返回 <code>true</code>，否则返回 <code>false</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAppendAsyncRequest</span>
<span class="line"> *</span>
<span class="line"> *      Request a tuple asynchronously.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token comment">// 如果调用中包含有效结果，那么返回 true</span></span>
<span class="line"><span class="token function">ExecAppendAsyncRequest</span><span class="token punctuation">(</span>AppendState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>result<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>needrequest<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果不需要向任何异步子计划发送请求，那么直接返回</span></span>
<span class="line">    <span class="token comment">/* Nothing to do if there are no async subplans needing a new request. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncresults <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> false<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果已有异步计划产生结果了</span></span>
<span class="line">    <span class="token comment">// 那么使返回结果槽指向对应异步子计划的结果槽，然后直接返回</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If there are any asynchronously-generated results that have not yet</span>
<span class="line">     * been returned, we have nothing to do; just return one of them.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncresults <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token operator">--</span>node<span class="token operator">-&gt;</span>as_nasyncresults<span class="token punctuation">;</span></span>
<span class="line">        <span class="token operator">*</span>result <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_asyncresults<span class="token punctuation">[</span>node<span class="token operator">-&gt;</span>as_nasyncresults<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 至此，说明所有异步子计划的结果槽都已经空了</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 根据 bitmap 为每一个需要被请求的异步子计划发送请求</span></span>
<span class="line">    <span class="token comment">// 并重置 bitmap</span></span>
<span class="line">    <span class="token comment">/* Make a new request for each of the async subplans that need it. */</span></span>
<span class="line">    needrequest <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">;</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_needrequest <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>needrequest<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        AsyncRequest <span class="token operator">*</span>areq <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_asyncrequests<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 发起请求</span></span>
<span class="line">        <span class="token comment">// 如果异步子计划产生结果</span></span>
<span class="line">        <span class="token comment">// 那么将子计划的元组缓存槽加入到 Append 节点的结果槽数组中</span></span>
<span class="line">        <span class="token comment">/* Do the actual work. */</span></span>
<span class="line">        <span class="token function">ExecAsyncRequest</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">bms_free</span><span class="token punctuation">(</span>needrequest<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 当前已有异步子计划产生了结果</span></span>
<span class="line">    <span class="token comment">// 使返回结果槽指向 Append 节点结果槽中的最后一个槽，并返回</span></span>
<span class="line">    <span class="token comment">/* Return one of the asynchronously-generated results if any. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncresults <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token operator">--</span>node<span class="token operator">-&gt;</span>as_nasyncresults<span class="token punctuation">;</span></span>
<span class="line">        <span class="token operator">*</span>result <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_asyncresults<span class="token punctuation">[</span>node<span class="token operator">-&gt;</span>as_nasyncresults<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 至此，没有获取到任何有效结果，返回 false</span></span>
<span class="line">    <span class="token keyword">return</span> false<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execappendasynceventwait" tabindex="-1"><a class="header-anchor" href="#execappendasynceventwait"><span>ExecAppendAsyncEventWait</span></a></h4><p>该函数用于配制所有异步子计划想要监听的事件集合，然后向 OS 内核轮询这个事件集合。如果触发了监听事件，那么回调并处理事件。其中用到了异步抽象层的 <code>ExecAsyncConfigureWait()</code> 以配置监听事件，以及 <code>ExecAsyncNotify()</code> 以处理事件。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAppendAsyncEventWait</span>
<span class="line"> *</span>
<span class="line"> *      Wait or poll for file descriptor events and fire callbacks.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAppendAsyncEventWait</span><span class="token punctuation">(</span>AppendState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         nevents <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_nasyncplans <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">long</span>        timeout <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">?</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    WaitEvent   occurred_event<span class="token punctuation">[</span>EVENT_BUFFER_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         noccurred<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* We should never be called when there are no valid async subplans. */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 创建一个事件等待集合</span></span>
<span class="line">    <span class="token comment">// 添加监听 PostMaster 退出的事件</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_eventset <span class="token operator">=</span> <span class="token function">CreateWaitEventSet</span><span class="token punctuation">(</span>CurrentMemoryContext<span class="token punctuation">,</span> nevents<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">AddWaitEventToSet</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">,</span> WL_EXIT_ON_PM_DEATH<span class="token punctuation">,</span> PGINVALID_SOCKET<span class="token punctuation">,</span></span>
<span class="line">                      <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 对每一个异步子计划，如果当前子计划的请求已经发送</span></span>
<span class="line">    <span class="token comment">// 那么将子计划需要监听的文件描述符添加到事件等待集合中</span></span>
<span class="line">    <span class="token comment">/* Give each waiting subplan a chance to add an event. */</span></span>
<span class="line">    i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_asyncplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        AsyncRequest <span class="token operator">*</span>areq <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_asyncrequests<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecAsyncConfigureWait</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果除了监听 PostMaster 进程退出以外没有其它事件需要监听了</span></span>
<span class="line">    <span class="token comment">// 即没有任何异步子计划的事件需要监听，那么直接返回</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * No need for further processing if there are no configured events other</span>
<span class="line">     * than the postmaster death event.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">GetNumRegisteredWaitEvents</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">FreeWaitEventSet</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>as_eventset <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 最多只监听 EVENT_BUFFER_SIZE 个事件</span></span>
<span class="line">    <span class="token comment">// 因为 WaitEvent 数组的空间有限</span></span>
<span class="line">    <span class="token comment">/* We wait on at most EVENT_BUFFER_SIZE events. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>nevents <span class="token operator">&gt;</span> EVENT_BUFFER_SIZE<span class="token punctuation">)</span></span>
<span class="line">        nevents <span class="token operator">=</span> EVENT_BUFFER_SIZE<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If the timeout is -1, wait until at least one event occurs.  If the</span>
<span class="line">     * timeout is 0, poll for events, but do not wait at all.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 向 OS 内核轮询！</span></span>
<span class="line">    noccurred <span class="token operator">=</span> <span class="token function">WaitEventSetWait</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">,</span> timeout<span class="token punctuation">,</span> occurred_event<span class="token punctuation">,</span></span>
<span class="line">                                 nevents<span class="token punctuation">,</span> WAIT_EVENT_APPEND_READY<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">FreeWaitEventSet</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_eventset <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>noccurred <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 处理本轮轮询中触发的事件</span></span>
<span class="line">    <span class="token comment">/* Deliver notifications. */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> noccurred<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        WaitEvent  <span class="token operator">*</span>w <span class="token operator">=</span> <span class="token operator">&amp;</span>occurred_event<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Each waiting subplan should have registered its wait event with</span>
<span class="line">         * user_data pointing back to its AsyncRequest.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">// 异步子计划的 Socket 读事件被触发</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>w<span class="token operator">-&gt;</span>events <span class="token operator">&amp;</span> WL_SOCKET_READABLE<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            AsyncRequest <span class="token operator">*</span>areq <span class="token operator">=</span> <span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span><span class="token punctuation">)</span> w<span class="token operator">-&gt;</span>user_data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Mark it as no longer needing a callback.  We must do this</span>
<span class="line">                 * before dispatching the callback in case the callback resets</span>
<span class="line">                 * the flag.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token comment">// 复位异步子计划的请求状态</span></span>
<span class="line">                areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* Do the actual work. */</span></span>
<span class="line">                <span class="token comment">// 处理 Socket 读事件</span></span>
<span class="line">                <span class="token function">ExecAsyncNotify</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execasyncappendresponse" tabindex="-1"><a class="header-anchor" href="#execasyncappendresponse"><span>ExecAsyncAppendResponse</span></a></h4><p>这个函数比较特殊。前几个函数都是 Append 算子的函数主动调用下层（异步抽象层）的函数；而这是一个回调函数，由异步抽象层函数获取到结果以后调用，将获取到的执行结果保存到 Append 算子的返回结果槽中。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAsyncAppendResponse</span>
<span class="line"> *</span>
<span class="line"> *      Receive a response from an asynchronous request we made.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncAppendResponse</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    AppendState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>AppendState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestor<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>slot <span class="token operator">=</span> areq<span class="token operator">-&gt;</span>result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The result should be a TupleTableSlot or NULL. */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>slot <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> <span class="token function">IsA</span><span class="token punctuation">(</span>slot<span class="token punctuation">,</span> TupleTableSlot<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 异步子计划的请求还没有获取到结果，那么直接返回</span></span>
<span class="line">    <span class="token comment">/* Nothing to do if the request is pending. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>areq<span class="token operator">-&gt;</span>request_complete<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* The request would have been pending for a callback. */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 异步子计划已经获取到结果</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果子计划的返回结果槽为空，那么说明这个异步子计划的执行已经结束</span></span>
<span class="line">    <span class="token comment">// 递减剩余的异步子计划数量，然后返回</span></span>
<span class="line">    <span class="token comment">/* If the result is NULL or an empty slot, there&#39;s nothing more to do. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* The ending subplan wouldn&#39;t have been pending for a callback. */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token operator">--</span>node<span class="token operator">-&gt;</span>as_nasyncremain<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果子计划的返回结果槽不为空</span></span>
<span class="line">    <span class="token comment">// 那么将返回结果槽保存到 Append 算子的 as_asyncresults 数组中</span></span>
<span class="line">    <span class="token comment">/* Save result so we can return it. */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncresults <span class="token operator">&lt;</span> node<span class="token operator">-&gt;</span>as_nasyncplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_asyncresults<span class="token punctuation">[</span>node<span class="token operator">-&gt;</span>as_nasyncresults<span class="token operator">++</span><span class="token punctuation">]</span> <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 标记这个异步子计划，表示它准备好进行下一次请求</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Mark the subplan that returned a result as ready for a new request.  We</span>
<span class="line">     * don&#39;t launch another one here immediately because it might complete.</span>
<span class="line">     */</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>as_needrequest <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">,</span></span>
<span class="line">                                          areq<span class="token operator">-&gt;</span>request_index<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="异步抽象层" tabindex="-1"><a class="header-anchor" href="#异步抽象层"><span>异步抽象层</span></a></h3><p>这一层存在的目的应该是为了在两层物理算子之间传递请求状态和执行结果，并方便以后支持其它算子的异步化改造。下面直接开始分析这一层次上的所有函数。</p><h4 id="execasyncrequest" tabindex="-1"><a class="header-anchor" href="#execasyncrequest"><span>ExecAsyncRequest</span></a></h4><p>该函数被 Append 算子的 <code>ExecAppendAsyncBegin()</code> 和 <code>ExecAppendAsyncRequest()</code> 调用，主要功能是异步地向下层的 ForeignScan 算子请求元组，执行结果不通过返回值返回。如果下层算子产生了有效结果，那么回调上层 Append 算子的函数传递执行结果。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Asynchronously request a tuple from a designed async-capable node.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncRequest</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 目前的被请求者算子仅支持 ForeignScan</span></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 向 ForeignScan 算子异步请求结果</span></span>
<span class="line">        <span class="token keyword">case</span> T_ForeignScanState<span class="token operator">:</span></span>
<span class="line">            <span class="token function">ExecAsyncForeignScanRequest</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token comment">/* If the node doesn&#39;t support async, caller messed up. */</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果子计划产生了结果，那么调用请求者（Append）算子的回调函数</span></span>
<span class="line">    <span class="token function">ExecAsyncResponse</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execasyncconfigurewait" tabindex="-1"><a class="header-anchor" href="#execasyncconfigurewait"><span>ExecAsyncConfigureWait</span></a></h4><p>该函数被 Append 算子的 <code>ExecAppendAsyncEventWait()</code> 调用，将调用下层 ForeignScan 算子的相应函数以便 FDW 能够配置自己想要监听的文件描述符和及其读事件。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Give the asynchronous node a chance to configure the file descriptor event</span>
<span class="line"> * for which it wishes to wait.  We expect the node-type specific callback to</span>
<span class="line"> * make a single call of the following form:</span>
<span class="line"> *</span>
<span class="line"> * AddWaitEventToSet(set, WL_SOCKET_READABLE, fd, NULL, areq);</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncConfigureWait</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 目前唯一合法的下层节点是 ForeignScan</span></span>
<span class="line">        <span class="token keyword">case</span> T_ForeignScanState<span class="token operator">:</span></span>
<span class="line">            <span class="token function">ExecAsyncForeignScanConfigureWait</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token comment">/* If the node doesn&#39;t support async, caller messed up. */</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execasyncnotify" tabindex="-1"><a class="header-anchor" href="#execasyncnotify"><span>ExecAsyncNotify</span></a></h4><p>该函数被 Append 算子的 <code>ExecAppendAsyncEventWait()</code> 函数调用，说明下层算子正在监听的文件描述符上触发了读事件。所以该函数将调用下层 ForeignScan 算子的相应函数，从正在监听的文件描述符上获取数据并组装元组；然后回调 Append 算子的 <code>ExecAsyncAppendResponse()</code> 函数传递元组。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Call the asynchronous node back when a relevant event has occurred.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncNotify</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 调用 ForeignScan 算子的相应函数</span></span>
<span class="line">        <span class="token comment">// 使其从文件描述符上获取数据并组装元组</span></span>
<span class="line">        <span class="token keyword">case</span> T_ForeignScanState<span class="token operator">:</span></span>
<span class="line">            <span class="token function">ExecAsyncForeignScanNotify</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token comment">/* If the node doesn&#39;t support async, caller messed up. */</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 回调，传递元组到 Append 算子中</span></span>
<span class="line">    <span class="token function">ExecAsyncResponse</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execasyncresponse" tabindex="-1"><a class="header-anchor" href="#execasyncresponse"><span>ExecAsyncResponse</span></a></h4><p>该函数用于触发上层算子的回调函数，以传递从 FDW 获取到的元组。目前支持的上层算子只有 Append。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Call the requestor back when an asynchronous node has produced a result.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncResponse</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestor<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 目前合法的请求方算子只有 Append</span></span>
<span class="line">        <span class="token comment">// 回调并传递结果元组</span></span>
<span class="line">        <span class="token keyword">case</span> T_AppendState<span class="token operator">:</span></span>
<span class="line">            <span class="token function">ExecAsyncAppendResponse</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token comment">/* If the node doesn&#39;t support async, caller messed up. */</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestor<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="execasyncrequestpending-execasyncrequestdone" tabindex="-1"><a class="header-anchor" href="#execasyncrequestpending-execasyncrequestdone"><span>ExecAsyncRequestPending / ExecAsyncRequestDone</span></a></h4><p>这两个函数用于保存一个异步请求的进行状态和执行结果。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * A requestee node should call this function to deliver the tuple to its</span>
<span class="line"> * requestor node.  The requestee node can call this from its ExecAsyncRequest</span>
<span class="line"> * or ExecAsyncNotify callback.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncRequestDone</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>result<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 请求已完成</span></span>
<span class="line">    <span class="token comment">// 状态：完成</span></span>
<span class="line">    <span class="token comment">// 结果：在参数中</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>request_complete <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>result <span class="token operator">=</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * A requestee node should call this function to indicate that it is pending</span>
<span class="line"> * for a callback.  The requestee node can call this from its ExecAsyncRequest</span>
<span class="line"> * or ExecAsyncNotify callback.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncRequestPending</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 新的请求已经发起</span></span>
<span class="line">    <span class="token comment">// 状态：未完成，进行中</span></span>
<span class="line">    <span class="token comment">// 结果：空</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>request_complete <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="foreignscan-算子" tabindex="-1"><a class="header-anchor" href="#foreignscan-算子"><span>ForeignScan 算子</span></a></h3><p>从这一层中可以看出，异步执行特性在 FDW API 中加入了四个新的函数指针：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">FdwRoutine</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for asynchronous execution */</span></span>
<span class="line">    IsForeignPathAsyncCapable_function IsForeignPathAsyncCapable<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncRequest_function ForeignAsyncRequest<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncConfigureWait_function ForeignAsyncConfigureWait<span class="token punctuation">;</span></span>
<span class="line">    ForeignAsyncNotify_function ForeignAsyncNotify<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> FdwRoutine<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中第一个函数指针被 PostgreSQL 优化器用于判断是否可以产生一个带有异步执行的执行计划。后面三个函数指针被执行器分别用于：异步发起请求、轮询请求结果、回调处理请求结果。</p><p>由于目前异步执行仅对 <code>postgres_fdw</code> 做了支持，因此这一层目前的逻辑很简单：就是转而调用 <code>postgres_fdw</code> 对应功能的函数指针。这一层存在的意义是，方便以后对其它的 FDW 插件也支持异步执行。下面简单列出被异步抽象层调用的三个函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAsyncForeignScanRequest</span>
<span class="line"> *</span>
<span class="line"> *      Asynchronously request a tuple from a designed async-capable node</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncForeignScanRequest</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    FdwRoutine <span class="token operator">*</span>fdwroutine <span class="token operator">=</span> node<span class="token operator">-&gt;</span>fdwroutine<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fdwroutine<span class="token operator">-&gt;</span>ForeignAsyncRequest <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    fdwroutine<span class="token operator">-&gt;</span><span class="token function">ForeignAsyncRequest</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAsyncForeignScanConfigureWait</span>
<span class="line"> *</span>
<span class="line"> *      In async mode, configure for a wait</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncForeignScanConfigureWait</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    FdwRoutine <span class="token operator">*</span>fdwroutine <span class="token operator">=</span> node<span class="token operator">-&gt;</span>fdwroutine<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fdwroutine<span class="token operator">-&gt;</span>ForeignAsyncConfigureWait <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    fdwroutine<span class="token operator">-&gt;</span><span class="token function">ForeignAsyncConfigureWait</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecAsyncForeignScanNotify</span>
<span class="line"> *</span>
<span class="line"> *      Callback invoked when a relevant event has occurred</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecAsyncForeignScanNotify</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    FdwRoutine <span class="token operator">*</span>fdwroutine <span class="token operator">=</span> node<span class="token operator">-&gt;</span>fdwroutine<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fdwroutine<span class="token operator">-&gt;</span>ForeignAsyncNotify <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    fdwroutine<span class="token operator">-&gt;</span><span class="token function">ForeignAsyncNotify</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="postgres-fdw" tabindex="-1"><a class="header-anchor" href="#postgres-fdw"><span>Postgres FDW</span></a></h3><p>在 <code>postgres_fdw</code> 中对 FDW API 中新增的四个函数指针进行了实现。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Foreign-data wrapper handler function: return a struct with pointers</span>
<span class="line"> * to my callback routines.</span>
<span class="line"> */</span></span>
<span class="line">Datum</span>
<span class="line"><span class="token function">postgres_fdw_handler</span><span class="token punctuation">(</span>PG_FUNCTION_ARGS<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    FdwRoutine <span class="token operator">*</span>routine <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>FdwRoutine<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Support functions for asynchronous execution */</span></span>
<span class="line">    routine<span class="token operator">-&gt;</span>IsForeignPathAsyncCapable <span class="token operator">=</span> postgresIsForeignPathAsyncCapable<span class="token punctuation">;</span></span>
<span class="line">    routine<span class="token operator">-&gt;</span>ForeignAsyncRequest <span class="token operator">=</span> postgresForeignAsyncRequest<span class="token punctuation">;</span></span>
<span class="line">    routine<span class="token operator">-&gt;</span>ForeignAsyncConfigureWait <span class="token operator">=</span> postgresForeignAsyncConfigureWait<span class="token punctuation">;</span></span>
<span class="line">    routine<span class="token operator">-&gt;</span>ForeignAsyncNotify <span class="token operator">=</span> postgresForeignAsyncNotify<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">PG_RETURN_POINTER</span><span class="token punctuation">(</span>routine<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="postgresisforeignpathasynccapable" tabindex="-1"><a class="header-anchor" href="#postgresisforeignpathasynccapable"><span>postgresIsForeignPathAsyncCapable</span></a></h4><p>这个函数会被优化器回调，判断是否可以对一个外部表产生异步执行计划。其逻辑非常简单：判断外部表选项中的 <code>async_capable</code> 是否为 <code>true</code> 即可：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * postgresIsForeignPathAsyncCapable</span>
<span class="line"> *      Check whether a given ForeignPath node is async-capable.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">postgresIsForeignPathAsyncCapable</span><span class="token punctuation">(</span>ForeignPath <span class="token operator">*</span>path<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    RelOptInfo <span class="token operator">*</span>rel <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>Path <span class="token operator">*</span><span class="token punctuation">)</span> path<span class="token punctuation">)</span><span class="token operator">-&gt;</span>parent<span class="token punctuation">;</span></span>
<span class="line">    PgFdwRelationInfo <span class="token operator">*</span>fpinfo <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwRelationInfo <span class="token operator">*</span><span class="token punctuation">)</span> rel<span class="token operator">-&gt;</span>fdw_private<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> fpinfo<span class="token operator">-&gt;</span>async_capable<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="postgresforeignasyncrequest" tabindex="-1"><a class="header-anchor" href="#postgresforeignasyncrequest"><span>postgresForeignAsyncRequest</span></a></h4><p>该函数承接上层算子异步地请求元组的要求。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * postgresForeignAsyncRequest</span>
<span class="line"> *      Asynchronously request next tuple from a foreign PostgreSQL table.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">postgresForeignAsyncRequest</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">produce_tuple_asynchronously</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Asynchronously produce next tuple from a foreign PostgreSQL table.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">produce_tuple_asynchronously</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">,</span> bool fetch<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line">    AsyncRequest <span class="token operator">*</span>pendingAreq <span class="token operator">=</span> fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 目前请求还没有开始</span></span>
<span class="line">    <span class="token comment">/* This should not be called if the request is currently in-process */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>areq <span class="token operator">!=</span> pendingAreq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 下一个要返回的元组的 index 已经超出元组数组的长度了</span></span>
<span class="line">    <span class="token comment">// 说明 FDW 中缓存的元组已经被消耗殆尽，需要 FETCH 更多元组</span></span>
<span class="line">    <span class="token comment">/* Fetch some more tuples, if we&#39;ve run out */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&gt;=</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* No point in another fetch if we already detected EOF, though */</span></span>
<span class="line">        <span class="token comment">// 当前连接还没有到达 EOF</span></span>
<span class="line">        <span class="token comment">// 占用连接，并发送 FETCH 请求</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>fsstate<span class="token operator">-&gt;</span>eof_reached<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* Mark the request as pending for a callback */</span></span>
<span class="line">            <span class="token function">ExecAsyncRequestPending</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* Begin another fetch if requested and if no pending request */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>fetch <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>pendingAreq<span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">fetch_more_data_begin</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">// 当前连接已经到达 EOF</span></span>
<span class="line">        <span class="token comment">// 将连接状态设置为已完成，并向上层传递空的结果</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* There&#39;s nothing more to do; just return a NULL pointer */</span></span>
<span class="line">            result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* Mark the request as complete */</span></span>
<span class="line">            <span class="token function">ExecAsyncRequestDone</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// FDW 缓存的元组还没有被消耗殆尽</span></span>
<span class="line">    <span class="token comment">// 那么调用 ForeignScan 节点的 next 函数获取一个元组</span></span>
<span class="line">    <span class="token comment">// ForeignScan 节点的 next 函数最终也会调用到 FDW 的 routine 函数中：</span></span>
<span class="line">    <span class="token comment">// IterateDirectModify / IterateForeignScan</span></span>
<span class="line">    <span class="token comment">/* Get a tuple from the ForeignScan node */</span></span>
<span class="line">    result <span class="token operator">=</span> areq<span class="token operator">-&gt;</span>requestee<span class="token operator">-&gt;</span><span class="token function">ExecProcNodeReal</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 返回元组不为空，本次请求成功</span></span>
<span class="line">    <span class="token comment">// 将本次请求的状态设置为完成，将结果元组保存，返回</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Mark the request as complete */</span></span>
<span class="line">        <span class="token function">ExecAsyncRequestDone</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 返回元组为空，说明 FDW 中缓存的元组已经消耗殆尽</span></span>
<span class="line">    <span class="token comment">/* We must have run out of tuples */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&gt;=</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Fetch some more tuples, if we&#39;ve not detected EOF yet */</span></span>
<span class="line">    <span class="token comment">// 当前连接还没有到达 EOF</span></span>
<span class="line">    <span class="token comment">// 占用连接，并发送 FETCH 请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>fsstate<span class="token operator">-&gt;</span>eof_reached<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Mark the request as pending for a callback */</span></span>
<span class="line">        <span class="token function">ExecAsyncRequestPending</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* Begin another fetch if requested and if no pending request */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>fetch <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>pendingAreq<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">fetch_more_data_begin</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token comment">// 当前连接已经到达 EOF</span></span>
<span class="line">    <span class="token comment">// 将连接状态设置为已完成，并向上层传递空的结果</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* There&#39;s nothing more to do; just return a NULL pointer */</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* Mark the request as complete */</span></span>
<span class="line">        <span class="token function">ExecAsyncRequestDone</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Begin an asynchronous data fetch.</span>
<span class="line"> *</span>
<span class="line"> * Note: this function assumes there is no currently-in-progress asynchronous</span>
<span class="line"> * data fetch.</span>
<span class="line"> *</span>
<span class="line"> * Note: fetch_more_data must be called to fetch the result.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">fetch_more_data_begin</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span>        sql<span class="token punctuation">[</span><span class="token number">64</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 此时连接已经被当前这次请求占用</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Create the cursor synchronously. */</span></span>
<span class="line">    <span class="token comment">// 如果用于 FETCH 的 cursor 还没有被创建</span></span>
<span class="line">    <span class="token comment">// 那么同步地创建 cursor</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>fsstate<span class="token operator">-&gt;</span>cursor_exists<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">create_cursor</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* We will send this query, but not wait for the response. */</span></span>
<span class="line">    <span class="token function">snprintf</span><span class="token punctuation">(</span>sql<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>sql<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;FETCH %d FROM c%u&quot;</span><span class="token punctuation">,</span></span>
<span class="line">             fsstate<span class="token operator">-&gt;</span>fetch_size<span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>cursor_number<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 通过 libpq 库发送 FETCH 请求，不等待结果</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PQsendQuery</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">,</span> sql<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">pgfdw_report_error</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">,</span> false<span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>query<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Remember that the request is in process */</span></span>
<span class="line">    fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq <span class="token operator">=</span> areq<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="postgresforeignasyncconfigurewait" tabindex="-1"><a class="header-anchor" href="#postgresforeignasyncconfigurewait"><span>postgresForeignAsyncConfigureWait</span></a></h4><p>该函数主要用于把需要监听的文件描述符（与外部数据库的连接）及其 Socket 读事件添加到等待事件集合中，以便后续的事件轮询。如果当前已经有可以返回的元组，那么直接返回。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * postgresForeignAsyncConfigureWait</span>
<span class="line"> *      Configure a file descriptor event for which we wish to wait.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">postgresForeignAsyncConfigureWait</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line">    AsyncRequest <span class="token operator">*</span>pendingAreq <span class="token operator">=</span> fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq<span class="token punctuation">;</span></span>
<span class="line">    AppendState <span class="token operator">*</span>requestor <span class="token operator">=</span> <span class="token punctuation">(</span>AppendState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestor<span class="token punctuation">;</span></span>
<span class="line">    WaitEventSet <span class="token operator">*</span>set <span class="token operator">=</span> requestor<span class="token operator">-&gt;</span>as_eventset<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接目前应当已经被一个请求占用了</span></span>
<span class="line">    <span class="token comment">/* This should not be called unless callback_pending */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If process_pending_request() has been invoked on the given request</span>
<span class="line">     * before we get here, we might have some tuples already; in which case</span>
<span class="line">     * complete the request</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 如果已经有元组缓存在 FDW 中</span></span>
<span class="line">    <span class="token comment">// 那么将结果返回给请求方（Append 算子），并按需开启下一次异步请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&lt;</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 将当前元组返回上层</span></span>
<span class="line">        <span class="token comment">// 如果有需要，异步请求下一个元组</span></span>
<span class="line">        <span class="token function">complete_pending_request</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 如果请求已经结束，那么直接返回</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>request_complete<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 如果请求还未结束，那么新一轮请求应该已经被发起了</span></span>
<span class="line">        <span class="token comment">// 此时请求的状态应该是进行中</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 此时 FDW 中已经没有缓存元组了</span></span>
<span class="line">    <span class="token comment">/* We must have run out of tuples */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&gt;=</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 等待事件集合中应该已经注册了监听 PostMaster 退出的事件</span></span>
<span class="line">    <span class="token comment">/* The core code would have registered postmaster death event */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">GetNumRegisteredWaitEvents</span><span class="token punctuation">(</span>set<span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Begin an asynchronous data fetch if not already done */</span></span>
<span class="line">    <span class="token comment">// 如果 FETCH 请求还没有开始，那么现在开始</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>pendingAreq<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">fetch_more_data_begin</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将 Socket 的读事件添加到等待事件集合中</span></span>
<span class="line">    <span class="token function">AddWaitEventToSet</span><span class="token punctuation">(</span>set<span class="token punctuation">,</span> WL_SOCKET_READABLE<span class="token punctuation">,</span> <span class="token function">PQsocket</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                      <span class="token constant">NULL</span><span class="token punctuation">,</span> areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Complete a pending asynchronous request.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">complete_pending_request</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* The request would have been pending for a callback */</span></span>
<span class="line">    <span class="token comment">// 目前连接应该正被本次请求占用</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Unlike AsyncNotify, we unset callback_pending ourselves */</span></span>
<span class="line">    <span class="token comment">// 释放当前 FETCH 请求对连接的占用</span></span>
<span class="line">    areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* We begin a fetch afterwards if necessary; don&#39;t fetch */</span></span>
<span class="line">    <span class="token comment">// 如果有需要，重新占用连接并发起下一次 FETCH 请求</span></span>
<span class="line">    <span class="token function">produce_tuple_asynchronously</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Unlike AsyncNotify, we call ExecAsyncResponse ourselves */</span></span>
<span class="line">    <span class="token comment">// 将本轮请求的结果传递给 Append 算子</span></span>
<span class="line">    <span class="token function">ExecAsyncResponse</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Also, we do instrumentation ourselves, if required */</span></span>
<span class="line">    <span class="token comment">// 统计元组个数</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token operator">-&gt;</span>instrument<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">InstrUpdateTupleCount</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>requestee<span class="token operator">-&gt;</span>instrument<span class="token punctuation">,</span></span>
<span class="line">                              <span class="token function">TupIsNull</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>result<span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token number">0.0</span> <span class="token operator">:</span> <span class="token number">1.0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Process a pending asynchronous request.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">process_pending_request</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate PG_USED_FOR_ASSERTS_ONLY <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The request would have been pending for a callback */</span></span>
<span class="line">    <span class="token comment">// 此时连接应该正被一个请求占用</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The request should be currently in-process */</span></span>
<span class="line">    <span class="token comment">// 当前正在占用连接的请求应该就是传入参数中的请求</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq <span class="token operator">==</span> areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 接收 FETCH 请求的结果，组装并缓存元组</span></span>
<span class="line">    <span class="token function">fetch_more_data</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If we didn&#39;t get any tuples, must be end of data; complete the request</span>
<span class="line">     * now.  Otherwise, we postpone completing the request until we are called</span>
<span class="line">     * from postgresForeignAsyncConfigureWait()/postgresForeignAsyncNotify().</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 如果 FETCH 的结果中没有任何元组</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&gt;=</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Unlike AsyncNotify, we unset callback_pending ourselves */</span></span>
<span class="line">        <span class="token comment">// 结束占用连接</span></span>
<span class="line">        areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* Mark the request as complete */</span></span>
<span class="line">        <span class="token comment">// 连接已完成，将结果设置为 NULL</span></span>
<span class="line">        <span class="token function">ExecAsyncRequestDone</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* Unlike AsyncNotify, we call ExecAsyncResponse ourselves */</span></span>
<span class="line">        <span class="token comment">// 回调 Append 算子的函数，传递执行结果</span></span>
<span class="line">        <span class="token function">ExecAsyncResponse</span><span class="token punctuation">(</span>areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="postgresforeignasyncnotify" tabindex="-1"><a class="header-anchor" href="#postgresforeignasyncnotify"><span>postgresForeignAsyncNotify</span></a></h4><p>该函数用于处理监听的文件描述符上触发的 Socket 读事件。读事件被触发后，该函数可以从文件描述符上获取数据。将获取到的数据组装为元组后，保存在 FDW 内用于缓存元组的数组中。其它函数可以调用 ForeignScan 算子的 <code>ForeignNext()</code> 函数进而调用到 FDW 的 <code>IterateForeignScan</code> 函数指针，从而获取 FDW 缓存的元组。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * postgresForeignAsyncNotify</span>
<span class="line"> *      Fetch some more tuples from a file descriptor that becomes ready,</span>
<span class="line"> *      requesting next tuple.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">postgresForeignAsyncNotify</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForeignScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span><span class="token punctuation">)</span> areq<span class="token operator">-&gt;</span>requestee<span class="token punctuation">;</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The core code would have initialized the callback_pending flag */</span></span>
<span class="line">    <span class="token comment">// 此时请求状态已经被设置为结束了</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>areq<span class="token operator">-&gt;</span>callback_pending<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If process_pending_request() has been invoked on the given request</span>
<span class="line">     * before we get here, we might have some tuples already; in which case</span>
<span class="line">     * produce the next tuple</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">// 如果 FDW 中还有缓存的元组，那么异步请求下一个元组并返回</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&lt;</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">produce_tuple_asynchronously</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// FDW 缓存的元组已经消耗殆尽</span></span>
<span class="line">    <span class="token comment">/* We must have run out of tuples */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">&gt;=</span> fsstate<span class="token operator">-&gt;</span>num_tuples<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The request should be currently in-process */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq <span class="token operator">==</span> areq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* On error, report the original query, not the FETCH. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">PQconsumeInput</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">pgfdw_report_error</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">,</span> false<span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>query<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 获取数据并组装为元组</span></span>
<span class="line">    <span class="token function">fetch_more_data</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 异步请求下一个元组</span></span>
<span class="line">    <span class="token function">produce_tuple_asynchronously</span><span class="token punctuation">(</span>areq<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Fetch some more rows from the node&#39;s cursor.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">fetch_more_data</span><span class="token punctuation">(</span>ForeignScanState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PgFdwScanState <span class="token operator">*</span>fsstate <span class="token operator">=</span> <span class="token punctuation">(</span>PgFdwScanState <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>fdw_state<span class="token punctuation">;</span></span>
<span class="line">    PGresult   <span class="token operator">*</span><span class="token keyword">volatile</span> res <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    MemoryContext oldcontext<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We&#39;ll store the tuples in the batch_cxt.  First, flush the previous</span>
<span class="line">     * batch.</span>
<span class="line">     */</span></span>
<span class="line">    fsstate<span class="token operator">-&gt;</span>tuples <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">MemoryContextReset</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>batch_cxt<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    oldcontext <span class="token operator">=</span> <span class="token function">MemoryContextSwitchTo</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>batch_cxt<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* PGresult must be released before leaving this function. */</span></span>
<span class="line">    <span class="token function">PG_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        PGconn     <span class="token operator">*</span>conn <span class="token operator">=</span> fsstate<span class="token operator">-&gt;</span>conn<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span>         numrows<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 异步执行</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>async_capable<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * The query was already sent by an earlier call to</span>
<span class="line">             * fetch_more_data_begin.  So now we just fetch the result.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token comment">// 因为 FETCH 的请求已经在之前被发出去了</span></span>
<span class="line">            <span class="token comment">// 所以这里直接获取 FETCH 的结果</span></span>
<span class="line">            res <span class="token operator">=</span> <span class="token function">pgfdw_get_result</span><span class="token punctuation">(</span>conn<span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>query<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* On error, report the original query, not the FETCH. */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PQresultStatus</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span> <span class="token operator">!=</span> PGRES_TUPLES_OK<span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">pgfdw_report_error</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> res<span class="token punctuation">,</span> conn<span class="token punctuation">,</span> false<span class="token punctuation">,</span> fsstate<span class="token operator">-&gt;</span>query<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* Reset per-connection state */</span></span>
<span class="line">            fsstate<span class="token operator">-&gt;</span>conn_state<span class="token operator">-&gt;</span>pendingAreq <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// ...</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 分配在 FDW 中缓存元组的内存</span></span>
<span class="line">        <span class="token comment">/* Convert the data into HeapTuples */</span></span>
<span class="line">        numrows <span class="token operator">=</span> <span class="token function">PQntuples</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        fsstate<span class="token operator">-&gt;</span>tuples <span class="token operator">=</span> <span class="token punctuation">(</span>HeapTuple <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">palloc0</span><span class="token punctuation">(</span>numrows <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>HeapTuple<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        fsstate<span class="token operator">-&gt;</span>num_tuples <span class="token operator">=</span> numrows<span class="token punctuation">;</span></span>
<span class="line">        fsstate<span class="token operator">-&gt;</span>next_tuple <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 遍历获取到的每一行数据</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> numrows<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">IsA</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan<span class="token punctuation">,</span> ForeignScan<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 组装元组</span></span>
<span class="line">            fsstate<span class="token operator">-&gt;</span>tuples<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span></span>
<span class="line">                <span class="token function">make_tuple_from_result_row</span><span class="token punctuation">(</span>res<span class="token punctuation">,</span> i<span class="token punctuation">,</span></span>
<span class="line">                                           fsstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">,</span></span>
<span class="line">                                           fsstate<span class="token operator">-&gt;</span>attinmeta<span class="token punctuation">,</span></span>
<span class="line">                                           fsstate<span class="token operator">-&gt;</span>retrieved_attrs<span class="token punctuation">,</span></span>
<span class="line">                                           node<span class="token punctuation">,</span></span>
<span class="line">                                           fsstate<span class="token operator">-&gt;</span>temp_cxt<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Update fetch_ct_2 */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>fsstate<span class="token operator">-&gt;</span>fetch_ct_2 <span class="token operator">&lt;</span> <span class="token number">2</span><span class="token punctuation">)</span></span>
<span class="line">            fsstate<span class="token operator">-&gt;</span>fetch_ct_2<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Must be EOF if we didn&#39;t get as many tuples as we asked for. */</span></span>
<span class="line">        fsstate<span class="token operator">-&gt;</span>eof_reached <span class="token operator">=</span> <span class="token punctuation">(</span>numrows <span class="token operator">&lt;</span> fsstate<span class="token operator">-&gt;</span>fetch_size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_FINALLY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>res<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">PQclear</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_END_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">MemoryContextSwitchTo</span><span class="token punctuation">(</span>oldcontext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>吃透上面的代码后可以发现，异步执行特性遵循一个很重要的原则：<strong>尽量不让任何人闲着</strong> 😂。当代码执行到 Append 算子时，它会立刻对所有的外表子计划发起异步请求，然后马上开始执行需要在本地执行的子计划，并不阻塞等待外表子计划的执行结果。之后执行流每次进入 Append 算子时，都会轮询 I/O 事件查看外表子计划的异步执行结果是否已经产生——如果产生，那么获取结果，并立刻发送下一轮的异步请求。这样，无论是当前数据库还是远程数据库，都在尽可能地并行推进一个物理计划的执行。其性能自然会优于原先的同步阻塞执行模型。</p><p>这让我想起了一个现实生活中的例子。前段时间我去办理户籍业务，由于当时是周末，只开了一个服务窗口，所以我排了大约一个多小时的队才办理成功。在排队的一个多小时里，我好奇地观察了这个窗口的业务处理流程，发现了一个很有意思的现象：窗口工作人员会把到号的人喊到窗口，然后把一个表格给到号的人现场填写，工作人员等待表格填写完毕后，将表格中的内容录入系统完成办理。绝大部分时候，表格录入的时间远小于表格填写的时间。这里或许有两个可以优化的点：</p><ol><li>其它正在排队的人可以利用排队时间填写表格</li><li>工作人员等待表格填写的时间，可以用于录入其他人的表格</li></ol><p>这里我们不去讨论现实生活中的种种复杂因素，比如表格可能会被填错，需要窗口人员现场指导等。我只是觉得这个过程像极了 FDW：表格填写对应了耗时较久的外部数据操作；表格录入对应了耗时较短的库内数据操作。FDW 的异步执行就是通过上述两个优化点，提升了运行效率。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://github.com/postgres/postgres/commit/27e1f14563cf982f1f4d71e21ef247866662a052" target="_blank" rel="noopener noreferrer">GitHub - postgres/postgres - Add support for asynchronous execution</a></p><p><a href="https://www.highgo.ca/2021/06/28/parallel-execution-of-postgres_fdw-scans-in-pg-14-important-step-forward-for-horizontal-scaling/" target="_blank" rel="noopener noreferrer">Parallel execution of postgres_fdw scan’s in PG-14 (Important step forward for horizontal scaling)</a></p><p><a href="https://thoughtbot.com/blog/postgres-foreign-data-wrapper" target="_blank" rel="noopener noreferrer">PostgreSQL&#39;s Foreign Data Wrapper</a></p><p><a href="https://www.postgresql.org/docs/current/libpq.html" target="_blank" rel="noopener noreferrer">PostgreSQL: Documentation - Chapter 34. libpq — C Library</a></p><p><a href="https://www.postgresql.org/docs/14/fdw-callbacks.html" target="_blank" rel="noopener noreferrer">PostgreSQL: Documentation - 57.2. Foreign Data Wrapper Callback Routines</a></p>`,128)]))}const u=s(l,[["render",c],["__file","PostgreSQL FDW Async Execution.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20FDW%20Async%20Execution.html","title":"PostgreSQL - FDW Asynchronous Execution","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[{"level":3,"title":"FDW","slug":"fdw","link":"#fdw","children":[]},{"level":3,"title":"Execution Model of PostgreSQL Executor","slug":"execution-model-of-postgresql-executor","link":"#execution-model-of-postgresql-executor","children":[]},{"level":3,"title":"Append Operator","slug":"append-operator","link":"#append-operator","children":[]}]},{"level":2,"title":"Asynchronized Execution","slug":"asynchronized-execution","link":"#asynchronized-execution","children":[{"level":3,"title":"Append 算子","slug":"append-算子","link":"#append-算子","children":[]},{"level":3,"title":"异步抽象层","slug":"异步抽象层","link":"#异步抽象层","children":[]},{"level":3,"title":"ForeignScan 算子","slug":"foreignscan-算子","link":"#foreignscan-算子","children":[]},{"level":3,"title":"Postgres FDW","slug":"postgres-fdw","link":"#postgres-fdw","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL FDW Async Execution.md"}');export{u as comp,r as data};
