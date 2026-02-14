import{_ as s,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const p={};function i(c,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-sequential-scan" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-sequential-scan"><span>PostgreSQL - Executor: Sequential Scan</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 06 / 27 23:42</p><p>Hangzhou, Zhejiang, China</p><hr><p>对 PostgreSQL 执行器的执行流程进行分析后，看看最简单的顺序扫描算子是如何实现的。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p>优化器输出的查询计划树是二叉树的形式。二叉树的节点有着最基本的结构定义，并根据不同类型的操作实现继承关系。最基本的计划树节点的结构定义如下。其中，由 <code>type</code> 来指定计划节点的类型。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      Plan node</span>
<span class="line"> *</span>
<span class="line"> * All plan nodes &quot;derive&quot; from the Plan structure by having the</span>
<span class="line"> * Plan structure as the first field.  This ensures that everything works</span>
<span class="line"> * when nodes are cast to Plan&#39;s.  (node pointers are frequently cast to Plan*</span>
<span class="line"> * when passed around generically in the executor)</span>
<span class="line"> *</span>
<span class="line"> * We never actually instantiate any Plan nodes; this is just the common</span>
<span class="line"> * abstract superclass for all Plan-type nodes.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Plan</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    NodeTag     type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * estimated execution costs for plan (see costsize.c for more info)</span>
<span class="line">     */</span></span>
<span class="line">    Cost        startup_cost<span class="token punctuation">;</span>   <span class="token comment">/* cost expended before fetching any tuples */</span></span>
<span class="line">    Cost        total_cost<span class="token punctuation">;</span>     <span class="token comment">/* total cost (assuming all tuples fetched) */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * planner&#39;s estimate of result size of this plan step</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">double</span>      plan_rows<span class="token punctuation">;</span>      <span class="token comment">/* number of rows plan is expected to emit */</span></span>
<span class="line">    <span class="token keyword">int</span>         plan_width<span class="token punctuation">;</span>     <span class="token comment">/* average row width in bytes */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * information needed for parallel query</span>
<span class="line">     */</span></span>
<span class="line">    bool        parallel_aware<span class="token punctuation">;</span> <span class="token comment">/* engage parallel-aware logic? */</span></span>
<span class="line">    bool        parallel_safe<span class="token punctuation">;</span>  <span class="token comment">/* OK to use as part of parallel plan? */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * information needed for asynchronous execution</span>
<span class="line">     */</span></span>
<span class="line">    bool        async_capable<span class="token punctuation">;</span>  <span class="token comment">/* engage asynchronous-capable logic? */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Common structural data for all Plan types.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">int</span>         plan_node_id<span class="token punctuation">;</span>   <span class="token comment">/* unique across entire final plan tree */</span></span>
<span class="line">    List       <span class="token operator">*</span>targetlist<span class="token punctuation">;</span>     <span class="token comment">/* target list to be computed at this node */</span></span>
<span class="line">    List       <span class="token operator">*</span>qual<span class="token punctuation">;</span>           <span class="token comment">/* implicitly-ANDed qual conditions */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">Plan</span> <span class="token operator">*</span>lefttree<span class="token punctuation">;</span>      <span class="token comment">/* input plan tree(s) */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">Plan</span> <span class="token operator">*</span>righttree<span class="token punctuation">;</span></span>
<span class="line">    List       <span class="token operator">*</span>initPlan<span class="token punctuation">;</span>       <span class="token comment">/* Init Plan nodes (un-correlated expr</span>
<span class="line">                                 * subselects) */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Information for management of parameter-change-driven rescanning</span>
<span class="line">     *</span>
<span class="line">     * extParam includes the paramIDs of all external PARAM_EXEC params</span>
<span class="line">     * affecting this plan node or its children.  setParam params from the</span>
<span class="line">     * node&#39;s initPlans are not included, but their extParams are.</span>
<span class="line">     *</span>
<span class="line">     * allParam includes all the extParam paramIDs, plus the IDs of local</span>
<span class="line">     * params that affect the node (i.e., the setParams of its initplans).</span>
<span class="line">     * These are _all_ the PARAM_EXEC params that affect this node.</span>
<span class="line">     */</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>extParam<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>allParam<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Plan<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>任何类型计划节点都要继承自这个最基本的 <code>Plan</code> 结构，并在其结构体中将 <code>Plan</code> 作为第一个成员变量，使得将子类型的计划节点指针强制转换为 <code>Plan *</code> 时能够直接引用到 <code>Plan</code> 结构体内的变量。这和 C++ 的对象继承行为一致。这里以扫描计划节点为例：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * ==========</span>
<span class="line"> * Scan nodes</span>
<span class="line"> * ==========</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Scan</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    Index       scanrelid<span class="token punctuation">;</span>      <span class="token comment">/* relid is index into the range table */</span></span>
<span class="line"><span class="token punctuation">}</span> Scan<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这也是所有扫描节点的父类。任何扫描计划节点都要继承自这个结构体，并将 <code>Scan</code> 作为第一个成员变量。以最简单的顺序扫描 (sequential scan) 节点为例：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      sequential scan node</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> Scan SeqScan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      table sample scan node</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">SampleScan</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Scan        scan<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* use struct pointer to avoid including parsenodes.h here */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">TableSampleClause</span> <span class="token operator">*</span>tablesample<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> SampleScan<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>好吧，由于顺序扫描过于简单，除了 <code>Scan</code> 的变量以外没有任何扩展变量了；对于 <code>SampleScan</code>，除了第一个成员变量 <code>scan</code> 外，还有完成其对应功能的其它成员变量。</p><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h2><p>之前已经分析过，在执行器的 <code>ExecInitNode()</code> 函数中有一个 <code>switch</code> 语句，根据查询计划节点的类型 (<code>NodeTag</code>) 调用相应的 <code>ExecInitXXX()</code>。对于顺序扫描节点，自然是调用 <code>ExecInitSeqScan()</code>。传入参数为顺序扫描的计划节点，以及计划执行的全局状态：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInitSeqScan</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">SeqScanState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitSeqScan</span><span class="token punctuation">(</span>SeqScan <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    SeqScanState <span class="token operator">*</span>scanstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Once upon a time it was possible to have an outerPlan of a SeqScan, but</span>
<span class="line">     * not any more.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">innerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create state structure</span>
<span class="line">     */</span></span>
<span class="line">    scanstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>SeqScanState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecSeqScan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Miscellaneous initialization</span>
<span class="line">     *</span>
<span class="line">     * create expression context for node</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * open the scan relation</span>
<span class="line">     */</span></span>
<span class="line">    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation <span class="token operator">=</span></span>
<span class="line">        <span class="token function">ExecOpenScanRelation</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span></span>
<span class="line">                             node<span class="token operator">-&gt;</span>scanrelid<span class="token punctuation">,</span></span>
<span class="line">                             eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* and create slot with the appropriate rowtype */</span></span>
<span class="line">    <span class="token function">ExecInitScanTupleSlot</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span></span>
<span class="line">                          <span class="token function">RelationGetDescr</span><span class="token punctuation">(</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                          <span class="token function">table_slot_callbacks</span><span class="token punctuation">(</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize result type and projection.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTypeTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecAssignScanProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child expressions</span>
<span class="line">     */</span></span>
<span class="line">    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span></span>
<span class="line">        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> scanstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> scanstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，顺序扫描节点不再允许有任何左右孩子节点了，必须是计划树的叶子节点。然后根据当前的计划节点构造相对应的 <code>PlanState</code> 节点：<code>SeqScanState</code>。然后将计划执行阶段的节点回调函数 <code>ExecProcNode</code> 函数指针设置为函数 <code>ExecSeqScan()</code>。值得一提的是，<code>PlanState</code> 也满足类似 <code>Plan</code> 的继承关系：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *               Scan State Information</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   ScanState information</span>
<span class="line"> *</span>
<span class="line"> *      ScanState extends PlanState for node types that represent</span>
<span class="line"> *      scans of an underlying relation.  It can also be used for nodes</span>
<span class="line"> *      that scan the output of an underlying plan node --- in that case,</span>
<span class="line"> *      only ScanTupleSlot is actually useful, and it refers to the tuple</span>
<span class="line"> *      retrieved from the subplan.</span>
<span class="line"> *</span>
<span class="line"> *      currentRelation    relation being scanned (NULL if none)</span>
<span class="line"> *      currentScanDesc    current scan descriptor for scan (NULL if none)</span>
<span class="line"> *      ScanTupleSlot      pointer to slot in tuple table holding scan tuple</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ScanState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    Relation    ss_currentRelation<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">TableScanDescData</span> <span class="token operator">*</span>ss_currentScanDesc<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>ss_ScanTupleSlot<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> ScanState<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   SeqScanState information</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">SeqScanState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ScanState   ss<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    Size        pscan_len<span class="token punctuation">;</span>      <span class="token comment">/* size of parallel heap scan descriptor */</span></span>
<span class="line"><span class="token punctuation">}</span> SeqScanState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="sequential-scan-execution" tabindex="-1"><a class="header-anchor" href="#sequential-scan-execution"><span>Sequential Scan Execution</span></a></h2><p>如上所述，顺序扫描计划节点的执行回调函数被设置为 <code>ExecSeqScan()</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecSeqScan(node)</span>
<span class="line"> *</span>
<span class="line"> *      Scans the relation sequentially and returns the next qualifying</span>
<span class="line"> *      tuple.</span>
<span class="line"> *      We call the ExecScan() routine and pass it the appropriate</span>
<span class="line"> *      access method functions.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecSeqScan</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    SeqScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>SeqScanState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">ExecScan</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span>ExecScanAccessMtd<span class="token punctuation">)</span> SeqNext<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span>ExecScanRecheckMtd<span class="token punctuation">)</span> SeqRecheck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里，所有与扫描相关的操作又被抽象到了 <code>ExecScan()</code> 函数中，被各种扫描操作复用。每种扫描操作需要提供 <code>accessMtd</code> 和 <code>recheckMtd</code> 两个回调函数指针。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * prototypes from functions in execScan.c</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> TupleTableSlot <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>ExecScanAccessMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token function">bool</span> <span class="token punctuation">(</span><span class="token operator">*</span>ExecScanRecheckMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>accessMtd</code> 用于使用特定的扫描方式 <strong>返回下一个元组</strong>。对于顺序扫描来说，上述调用指定 <code>SeqNext()</code> 函数顺序扫描下一个元组并返回：</p><ul><li>如果扫描描述符为空，那么立刻初始化一个，并维护在 <code>SeqScanState</code> 中</li><li>调用 <code>table_scan_getnextslot()</code> 获取下一个元组</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *                      Scan Support</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      SeqNext</span>
<span class="line"> *</span>
<span class="line"> *      This is a workhorse for ExecSeqScan</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">SeqNext</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    TableScanDesc scandesc<span class="token punctuation">;</span></span>
<span class="line">    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span></span>
<span class="line">    ScanDirection direction<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get information from the estate and scan state</span>
<span class="line">     */</span></span>
<span class="line">    scandesc <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc<span class="token punctuation">;</span></span>
<span class="line">    estate <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state<span class="token punctuation">;</span></span>
<span class="line">    direction <span class="token operator">=</span> estate<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span></span>
<span class="line">    slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>scandesc <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We reach here if the scan is not parallel, or if we&#39;re serially</span>
<span class="line">         * executing a scan that was planned to be parallel.</span>
<span class="line">         */</span></span>
<span class="line">        scandesc <span class="token operator">=</span> <span class="token function">table_beginscan</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">,</span></span>
<span class="line">                                   estate<span class="token operator">-&gt;</span>es_snapshot<span class="token punctuation">,</span></span>
<span class="line">                                   <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc <span class="token operator">=</span> scandesc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get the next tuple from the table</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">table_scan_getnextslot</span><span class="token punctuation">(</span>scandesc<span class="token punctuation">,</span> direction<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> slot<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * SeqRecheck -- access method routine to recheck a tuple in EvalPlanQual</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">SeqRecheck</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Note that unlike IndexScan, SeqScan never use keys in heap_beginscan</span>
<span class="line">     * (and this is very bad) - so, here we do not check are keys ok or not.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再来看看 <code>ExecScan()</code> 中的通用扫描动作，以及如何调用上述两个回调函数。其中有一个核心死循环，用于不同获取元组：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecScan</span>
<span class="line"> *</span>
<span class="line"> *      Scans the relation using the &#39;access method&#39; indicated and</span>
<span class="line"> *      returns the next qualifying tuple.</span>
<span class="line"> *      The access method returns the next tuple and ExecScan() is</span>
<span class="line"> *      responsible for checking the tuple returned against the qual-clause.</span>
<span class="line"> *</span>
<span class="line"> *      A &#39;recheck method&#39; must also be provided that can check an</span>
<span class="line"> *      arbitrary tuple of the relation against any qual conditions</span>
<span class="line"> *      that are implemented internal to the access method.</span>
<span class="line"> *</span>
<span class="line"> *      Conditions:</span>
<span class="line"> *        -- the &quot;cursor&quot; maintained by the AMI is positioned at the tuple</span>
<span class="line"> *           returned previously.</span>
<span class="line"> *</span>
<span class="line"> *      Initial States:</span>
<span class="line"> *        -- the relation indicated is opened for scanning so that the</span>
<span class="line"> *           &quot;cursor&quot; is positioned before the first qualifying tuple.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecScan</span><span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">,</span></span>
<span class="line">         ExecScanAccessMtd accessMtd<span class="token punctuation">,</span>   <span class="token comment">/* function returning a tuple */</span></span>
<span class="line">         ExecScanRecheckMtd recheckMtd<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>qual<span class="token punctuation">;</span></span>
<span class="line">    ProjectionInfo <span class="token operator">*</span>projInfo<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Fetch data from node</span>
<span class="line">     */</span></span>
<span class="line">    qual <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>qual<span class="token punctuation">;</span></span>
<span class="line">    projInfo <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">;</span></span>
<span class="line">    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* interrupt checks are in ExecScanFetch */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If we have neither a qual to check nor a projection to do, just skip</span>
<span class="line">     * all the overhead and return the raw scan tuple.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>qual <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>projInfo<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">ExecScanFetch</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> accessMtd<span class="token punctuation">,</span> recheckMtd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Reset per-tuple memory context to free any expression evaluation</span>
<span class="line">     * storage allocated in the previous tuple cycle.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get a tuple from the access method.  Loop until we obtain a tuple that</span>
<span class="line">     * passes the qualification.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        slot <span class="token operator">=</span> <span class="token function">ExecScanFetch</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> accessMtd<span class="token punctuation">,</span> recheckMtd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * if the slot returned by the accessMtd contains NULL, then it means</span>
<span class="line">         * there is nothing more to scan so we just return an empty slot,</span>
<span class="line">         * being careful to use the projection result slot so it has correct</span>
<span class="line">         * tupleDesc.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>projInfo<span class="token operator">-&gt;</span>pi_state<span class="token punctuation">.</span>resultslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                <span class="token keyword">return</span> slot<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * place the current tuple into the expr context</span>
<span class="line">         */</span></span>
<span class="line">        econtext<span class="token operator">-&gt;</span>ecxt_scantuple <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * check that the current tuple satisfies the qual-clause</span>
<span class="line">         *</span>
<span class="line">         * check for non-null qual here to avoid a function call to ExecQual()</span>
<span class="line">         * when the qual is null ... saves only a few cycles, but they add up</span>
<span class="line">         * ...</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>qual <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>qual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Found a satisfactory scan tuple.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Form a projection tuple, store it in the result tuple slot</span>
<span class="line">                 * and return it.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Here, we aren&#39;t projecting, so just return scan tuple.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">return</span> slot<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            <span class="token function">InstrCountFiltered1</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Tuple fails qual, so free per-tuple memory and try again.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在死循环中，调用 <code>ExecScanFetch()</code> 并传入两个回调函数指针获取元组。在这个函数中折腾了一大堆，在函数返回前调用了 <code>accessMtd</code> 函数指针：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Run the node-type-specific access method function to get the next tuple</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token operator">*</span>accessMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ending" tabindex="-1"><a class="header-anchor" href="#ending"><span>Ending</span></a></h2><p>执行结束时，调用 <code>ExecEndNode()</code>。与初始化类似，其中也有一个核心的 <code>switch</code> 函数，根据计划节点的类型，调用相应的 <code>ExecEndXXX()</code>。这里显然将会调用 <code>ExecEndSeqScan()</code>，完成所有的清理工作：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecEndSeqScan</span>
<span class="line"> *</span>
<span class="line"> *      frees any storage allocated through C routines.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndSeqScan</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    TableScanDesc scanDesc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get information from node</span>
<span class="line">     */</span></span>
<span class="line">    scanDesc <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Free the exprcontext</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * clean out the tuple table</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * close heap scan</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>scanDesc <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">table_endscan</span><span class="token punctuation">(</span>scanDesc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>顺序扫描已经是最简单的扫描算子了，后续考虑看一下索引扫描算子，看看实现上有什么特别的地方。暂时没有向下研究至存储级别的实现：heap 表似乎定义了自己的 access method，与具体扫描操作的实现解耦。</p>`,35)]))}const o=s(p,[["render",i],["__file","PostgreSQL Executor Sequential Scan.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Sequential%20Scan.html","title":"PostgreSQL - Executor: Sequential Scan","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":2,"title":"Sequential Scan Execution","slug":"sequential-scan-execution","link":"#sequential-scan-execution","children":[]},{"level":2,"title":"Ending","slug":"ending","link":"#ending","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Sequential Scan.md"}');export{o as comp,u as data};
