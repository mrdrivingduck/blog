import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},c=e(`<h1 id="postgresql-executor-sequential-scan" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-sequential-scan" aria-hidden="true">#</a> PostgreSQL - Executor: Sequential Scan</h1><p>Created by : Mr Dk.</p><p>2021 / 06 / 27 23:42</p><p>Hangzhou, Zhejiang, China</p><hr><p>对 PostgreSQL 执行器的执行流程进行分析后，看看最简单的顺序扫描算子是如何实现的。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h2><p>优化器输出的查询计划树是二叉树的形式。二叉树的节点有着最基本的结构定义，并根据不同类型的操作实现继承关系。最基本的计划树节点的结构定义如下。其中，由 <code>type</code> 来指定计划节点的类型。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      Plan node
 *
 * All plan nodes &quot;derive&quot; from the Plan structure by having the
 * Plan structure as the first field.  This ensures that everything works
 * when nodes are cast to Plan&#39;s.  (node pointers are frequently cast to Plan*
 * when passed around generically in the executor)
 *
 * We never actually instantiate any Plan nodes; this is just the common
 * abstract superclass for all Plan-type nodes.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Plan</span>
<span class="token punctuation">{</span>
    NodeTag     type<span class="token punctuation">;</span>

    <span class="token comment">/*
     * estimated execution costs for plan (see costsize.c for more info)
     */</span>
    Cost        startup_cost<span class="token punctuation">;</span>   <span class="token comment">/* cost expended before fetching any tuples */</span>
    Cost        total_cost<span class="token punctuation">;</span>     <span class="token comment">/* total cost (assuming all tuples fetched) */</span>

    <span class="token comment">/*
     * planner&#39;s estimate of result size of this plan step
     */</span>
    <span class="token keyword">double</span>      plan_rows<span class="token punctuation">;</span>      <span class="token comment">/* number of rows plan is expected to emit */</span>
    <span class="token keyword">int</span>         plan_width<span class="token punctuation">;</span>     <span class="token comment">/* average row width in bytes */</span>

    <span class="token comment">/*
     * information needed for parallel query
     */</span>
    bool        parallel_aware<span class="token punctuation">;</span> <span class="token comment">/* engage parallel-aware logic? */</span>
    bool        parallel_safe<span class="token punctuation">;</span>  <span class="token comment">/* OK to use as part of parallel plan? */</span>

    <span class="token comment">/*
     * information needed for asynchronous execution
     */</span>
    bool        async_capable<span class="token punctuation">;</span>  <span class="token comment">/* engage asynchronous-capable logic? */</span>

    <span class="token comment">/*
     * Common structural data for all Plan types.
     */</span>
    <span class="token keyword">int</span>         plan_node_id<span class="token punctuation">;</span>   <span class="token comment">/* unique across entire final plan tree */</span>
    List       <span class="token operator">*</span>targetlist<span class="token punctuation">;</span>     <span class="token comment">/* target list to be computed at this node */</span>
    List       <span class="token operator">*</span>qual<span class="token punctuation">;</span>           <span class="token comment">/* implicitly-ANDed qual conditions */</span>
    <span class="token keyword">struct</span> <span class="token class-name">Plan</span> <span class="token operator">*</span>lefttree<span class="token punctuation">;</span>      <span class="token comment">/* input plan tree(s) */</span>
    <span class="token keyword">struct</span> <span class="token class-name">Plan</span> <span class="token operator">*</span>righttree<span class="token punctuation">;</span>
    List       <span class="token operator">*</span>initPlan<span class="token punctuation">;</span>       <span class="token comment">/* Init Plan nodes (un-correlated expr
                                 * subselects) */</span>

    <span class="token comment">/*
     * Information for management of parameter-change-driven rescanning
     *
     * extParam includes the paramIDs of all external PARAM_EXEC params
     * affecting this plan node or its children.  setParam params from the
     * node&#39;s initPlans are not included, but their extParams are.
     *
     * allParam includes all the extParam paramIDs, plus the IDs of local
     * params that affect the node (i.e., the setParams of its initplans).
     * These are _all_ the PARAM_EXEC params that affect this node.
     */</span>
    Bitmapset  <span class="token operator">*</span>extParam<span class="token punctuation">;</span>
    Bitmapset  <span class="token operator">*</span>allParam<span class="token punctuation">;</span>
<span class="token punctuation">}</span> Plan<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>任何类型计划节点都要继承自这个最基本的 <code>Plan</code> 结构，并在其结构体中将 <code>Plan</code> 作为第一个成员变量，使得将子类型的计划节点指针强制转换为 <code>Plan *</code> 时能够直接引用到 <code>Plan</code> 结构体内的变量。这和 C++ 的对象继承行为一致。这里以扫描计划节点为例：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * ==========
 * Scan nodes
 * ==========
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Scan</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
    Index       scanrelid<span class="token punctuation">;</span>      <span class="token comment">/* relid is index into the range table */</span>
<span class="token punctuation">}</span> Scan<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这也是所有扫描节点的父类。任何扫描计划节点都要继承自这个结构体，并将 <code>Scan</code> 作为第一个成员变量。以最简单的顺序扫描 (sequential scan) 节点为例：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      sequential scan node
 * ----------------
 */</span>
<span class="token keyword">typedef</span> Scan SeqScan<span class="token punctuation">;</span>

<span class="token comment">/* ----------------
 *      table sample scan node
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">SampleScan</span>
<span class="token punctuation">{</span>
    Scan        scan<span class="token punctuation">;</span>
    <span class="token comment">/* use struct pointer to avoid including parsenodes.h here */</span>
    <span class="token keyword">struct</span> <span class="token class-name">TableSampleClause</span> <span class="token operator">*</span>tablesample<span class="token punctuation">;</span>
<span class="token punctuation">}</span> SampleScan<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>好吧，由于顺序扫描过于简单，除了 <code>Scan</code> 的变量以外没有任何扩展变量了；对于 <code>SampleScan</code>，除了第一个成员变量 <code>scan</code> 外，还有完成其对应功能的其它成员变量。</p><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization" aria-hidden="true">#</a> Initialization</h2><p>之前已经分析过，在执行器的 <code>ExecInitNode()</code> 函数中有一个 <code>switch</code> 语句，根据查询计划节点的类型 (<code>NodeTag</code>) 调用相应的 <code>ExecInitXXX()</code>。对于顺序扫描节点，自然是调用 <code>ExecInitSeqScan()</code>。传入参数为顺序扫描的计划节点，以及计划执行的全局状态：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitSeqScan
 * ----------------------------------------------------------------
 */</span>
SeqScanState <span class="token operator">*</span>
<span class="token function">ExecInitSeqScan</span><span class="token punctuation">(</span>SeqScan <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    SeqScanState <span class="token operator">*</span>scanstate<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Once upon a time it was possible to have an outerPlan of a SeqScan, but
     * not any more.
     */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">innerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    scanstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>SeqScanState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecSeqScan<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Miscellaneous initialization
     *
     * create expression context for node
     */</span>
    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * open the scan relation
     */</span>
    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation <span class="token operator">=</span>
        <span class="token function">ExecOpenScanRelation</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span>
                             node<span class="token operator">-&gt;</span>scanrelid<span class="token punctuation">,</span>
                             eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* and create slot with the appropriate rowtype */</span>
    <span class="token function">ExecInitScanTupleSlot</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span>
                          <span class="token function">RelationGetDescr</span><span class="token punctuation">(</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">)</span><span class="token punctuation">,</span>
                          <span class="token function">table_slot_callbacks</span><span class="token punctuation">(</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result type and projection.
     */</span>
    <span class="token function">ExecInitResultTypeTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecAssignScanProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child expressions
     */</span>
    scanstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span>
        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> scanstate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> scanstate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，顺序扫描节点不再允许有任何左右孩子节点了，必须是计划树的叶子节点。然后根据当前的计划节点构造相对应的 <code>PlanState</code> 节点：<code>SeqScanState</code>。然后将计划执行阶段的节点回调函数 <code>ExecProcNode</code> 函数指针设置为函数 <code>ExecSeqScan()</code>。值得一提的是，<code>PlanState</code> 也满足类似 <code>Plan</code> 的继承关系：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *               Scan State Information
 * ----------------------------------------------------------------
 */</span>

<span class="token comment">/* ----------------
 *   ScanState information
 *
 *      ScanState extends PlanState for node types that represent
 *      scans of an underlying relation.  It can also be used for nodes
 *      that scan the output of an underlying plan node --- in that case,
 *      only ScanTupleSlot is actually useful, and it refers to the tuple
 *      retrieved from the subplan.
 *
 *      currentRelation    relation being scanned (NULL if none)
 *      currentScanDesc    current scan descriptor for scan (NULL if none)
 *      ScanTupleSlot      pointer to slot in tuple table holding scan tuple
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ScanState</span>
<span class="token punctuation">{</span>
    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    Relation    ss_currentRelation<span class="token punctuation">;</span>
    <span class="token keyword">struct</span> <span class="token class-name">TableScanDescData</span> <span class="token operator">*</span>ss_currentScanDesc<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>ss_ScanTupleSlot<span class="token punctuation">;</span>
<span class="token punctuation">}</span> ScanState<span class="token punctuation">;</span>

<span class="token comment">/* ----------------
 *   SeqScanState information
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">SeqScanState</span>
<span class="token punctuation">{</span>
    ScanState   ss<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    Size        pscan_len<span class="token punctuation">;</span>      <span class="token comment">/* size of parallel heap scan descriptor */</span>
<span class="token punctuation">}</span> SeqScanState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="sequential-scan-execution" tabindex="-1"><a class="header-anchor" href="#sequential-scan-execution" aria-hidden="true">#</a> Sequential Scan Execution</h2><p>如上所述，顺序扫描计划节点的执行回调函数被设置为 <code>ExecSeqScan()</code>：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecSeqScan(node)
 *
 *      Scans the relation sequentially and returns the next qualifying
 *      tuple.
 *      We call the ExecScan() routine and pass it the appropriate
 *      access method functions.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>
<span class="token function">ExecSeqScan</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    SeqScanState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>SeqScanState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token function">ExecScan</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span>ExecScanAccessMtd<span class="token punctuation">)</span> SeqNext<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span>ExecScanRecheckMtd<span class="token punctuation">)</span> SeqRecheck<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里，所有与扫描相关的操作又被抽象到了 <code>ExecScan()</code> 函数中，被各种扫描操作复用。每种扫描操作需要提供 <code>accessMtd</code> 和 <code>recheckMtd</code> 两个回调函数指针。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * prototypes from functions in execScan.c
 */</span>
<span class="token keyword">typedef</span> TupleTableSlot <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>ExecScanAccessMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">typedef</span> <span class="token function">bool</span> <span class="token punctuation">(</span><span class="token operator">*</span>ExecScanRecheckMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>accessMtd</code> 用于使用特定的扫描方式 <strong>返回下一个元组</strong>。对于顺序扫描来说，上述调用指定 <code>SeqNext()</code> 函数顺序扫描下一个元组并返回：</p><ul><li>如果扫描描述符为空，那么立刻初始化一个，并维护在 <code>SeqScanState</code> 中</li><li>调用 <code>table_scan_getnextslot()</code> 获取下一个元组</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *                      Scan Support
 * ----------------------------------------------------------------
 */</span>

<span class="token comment">/* ----------------------------------------------------------------
 *      SeqNext
 *
 *      This is a workhorse for ExecSeqScan
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>
<span class="token function">SeqNext</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    TableScanDesc scandesc<span class="token punctuation">;</span>
    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span>
    ScanDirection direction<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span>

    <span class="token comment">/*
     * get information from the estate and scan state
     */</span>
    scandesc <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc<span class="token punctuation">;</span>
    estate <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state<span class="token punctuation">;</span>
    direction <span class="token operator">=</span> estate<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span>
    slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>scandesc <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * We reach here if the scan is not parallel, or if we&#39;re serially
         * executing a scan that was planned to be parallel.
         */</span>
        scandesc <span class="token operator">=</span> <span class="token function">table_beginscan</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentRelation<span class="token punctuation">,</span>
                                   estate<span class="token operator">-&gt;</span>es_snapshot<span class="token punctuation">,</span>
                                   <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc <span class="token operator">=</span> scandesc<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * get the next tuple from the table
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">table_scan_getnextslot</span><span class="token punctuation">(</span>scandesc<span class="token punctuation">,</span> direction<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">/*
 * SeqRecheck -- access method routine to recheck a tuple in EvalPlanQual
 */</span>
<span class="token keyword">static</span> bool
<span class="token function">SeqRecheck</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Note that unlike IndexScan, SeqScan never use keys in heap_beginscan
     * (and this is very bad) - so, here we do not check are keys ok or not.
     */</span>
    <span class="token keyword">return</span> true<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再来看看 <code>ExecScan()</code> 中的通用扫描动作，以及如何调用上述两个回调函数。其中有一个核心死循环，用于不同获取元组：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecScan
 *
 *      Scans the relation using the &#39;access method&#39; indicated and
 *      returns the next qualifying tuple.
 *      The access method returns the next tuple and ExecScan() is
 *      responsible for checking the tuple returned against the qual-clause.
 *
 *      A &#39;recheck method&#39; must also be provided that can check an
 *      arbitrary tuple of the relation against any qual conditions
 *      that are implemented internal to the access method.
 *
 *      Conditions:
 *        -- the &quot;cursor&quot; maintained by the AMI is positioned at the tuple
 *           returned previously.
 *
 *      Initial States:
 *        -- the relation indicated is opened for scanning so that the
 *           &quot;cursor&quot; is positioned before the first qualifying tuple.
 * ----------------------------------------------------------------
 */</span>
TupleTableSlot <span class="token operator">*</span>
<span class="token function">ExecScan</span><span class="token punctuation">(</span>ScanState <span class="token operator">*</span>node<span class="token punctuation">,</span>
         ExecScanAccessMtd accessMtd<span class="token punctuation">,</span>   <span class="token comment">/* function returning a tuple */</span>
         ExecScanRecheckMtd recheckMtd<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span>
    ExprState  <span class="token operator">*</span>qual<span class="token punctuation">;</span>
    ProjectionInfo <span class="token operator">*</span>projInfo<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Fetch data from node
     */</span>
    qual <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>qual<span class="token punctuation">;</span>
    projInfo <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">;</span>
    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span>

    <span class="token comment">/* interrupt checks are in ExecScanFetch */</span>

    <span class="token comment">/*
     * If we have neither a qual to check nor a projection to do, just skip
     * all the overhead and return the raw scan tuple.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>qual <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>projInfo<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token function">ExecScanFetch</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> accessMtd<span class="token punctuation">,</span> recheckMtd<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * Reset per-tuple memory context to free any expression evaluation
     * storage allocated in the previous tuple cycle.
     */</span>
    <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * get a tuple from the access method.  Loop until we obtain a tuple that
     * passes the qualification.
     */</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span>

        slot <span class="token operator">=</span> <span class="token function">ExecScanFetch</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> accessMtd<span class="token punctuation">,</span> recheckMtd<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * if the slot returned by the accessMtd contains NULL, then it means
         * there is nothing more to scan so we just return an empty slot,
         * being careful to use the projection result slot so it has correct
         * tupleDesc.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>projInfo<span class="token operator">-&gt;</span>pi_state<span class="token punctuation">.</span>resultslot<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">else</span>
                <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/*
         * place the current tuple into the expr context
         */</span>
        econtext<span class="token operator">-&gt;</span>ecxt_scantuple <span class="token operator">=</span> slot<span class="token punctuation">;</span>

        <span class="token comment">/*
         * check that the current tuple satisfies the qual-clause
         *
         * check for non-null qual here to avoid a function call to ExecQual()
         * when the qual is null ... saves only a few cycles, but they add up
         * ...
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>qual <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>qual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * Found a satisfactory scan tuple.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Form a projection tuple, store it in the result tuple slot
                 * and return it.
                 */</span>
                <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>projInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Here, we aren&#39;t projecting, so just return scan tuple.
                 */</span>
                <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span>
            <span class="token function">InstrCountFiltered1</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Tuple fails qual, so free per-tuple memory and try again.
         */</span>
        <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在死循环中，调用 <code>ExecScanFetch()</code> 并传入两个回调函数指针获取元组。在这个函数中折腾了一大堆，在函数返回前调用了 <code>accessMtd</code> 函数指针：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * Run the node-type-specific access method function to get the next tuple
 */</span>
<span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token operator">*</span>accessMtd<span class="token punctuation">)</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ending" tabindex="-1"><a class="header-anchor" href="#ending" aria-hidden="true">#</a> Ending</h2><p>执行结束时，调用 <code>ExecEndNode()</code>。与初始化类似，其中也有一个核心的 <code>switch</code> 函数，根据计划节点的类型，调用相应的 <code>ExecEndXXX()</code>。这里显然将会调用 <code>ExecEndSeqScan()</code>，完成所有的清理工作：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndSeqScan
 *
 *      frees any storage allocated through C routines.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndSeqScan</span><span class="token punctuation">(</span>SeqScanState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    TableScanDesc scanDesc<span class="token punctuation">;</span>

    <span class="token comment">/*
     * get information from node
     */</span>
    scanDesc <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_currentScanDesc<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Free the exprcontext
     */</span>
    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * clean out the tuple table
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span>
        <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * close heap scan
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>scanDesc <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token function">table_endscan</span><span class="token punctuation">(</span>scanDesc<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>顺序扫描已经是最简单的扫描算子了，后续考虑看一下索引扫描算子，看看实现上有什么特别的地方。暂时没有向下研究至存储级别的实现：heap 表似乎定义了自己的 access method，与具体扫描操作的实现解耦。</p>`,35),i=[c];function l(p,o){return s(),a("div",null,i)}const d=n(t,[["render",l],["__file","PostgreSQL Executor Sequential Scan.html.vue"]]);export{d as default};
