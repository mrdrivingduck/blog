import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},o=e(`<h1 id="postgresql-executor-material" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-material" aria-hidden="true">#</a> PostgreSQL - Executor: Material</h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 11 20:15</p><p>Hangzhou, Zhejiang, China</p><hr><p>该节点被翻译为 <strong>物化</strong> 节点，含义为将子计划中的元组缓存在当前节点中。如果子计划节点需要被反复访问，并且每次返回的元组都相同，那么对子计划返回的元组进行缓存可以提高性能。</p><h2 id="tuple-store" tabindex="-1"><a class="header-anchor" href="#tuple-store" aria-hidden="true">#</a> Tuple Store</h2><p>元组缓存使用 <code>Tuplestorestate</code> 结构，维护了用于缓存的内存空间和临时文件。之后准备专门分析一下和这个结构相关的代码。先明确几个相关 API 的功能：</p><ul><li><code>tuplestore_begin_heap</code> 构造并初始化存储结构</li><li><code>tuplestore_puttupleslot</code> 将元组 append 到 tuple store 的最后</li><li><code>tuplestore_gettupleslot</code> 从 tuple store 中读取元组</li><li><code>tuplestore_end</code> 释放 tuple store</li></ul><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h2><p>物化节点较为简单，直接继承自 <code>Plan</code> 结构：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      materialization node
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Material</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
<span class="token punctuation">}</span> Material<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state" aria-hidden="true">#</a> Plan State</h2><p>物化节点的 state 节点继承自 <code>Scan State</code>：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   MaterialState information
 *
 *      materialize nodes are used to materialize the results
 *      of a subplan into a temporary file.
 *
 *      ss.ss_ScanTupleSlot refers to output of underlying plan.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">MaterialState</span>
<span class="token punctuation">{</span>
    ScanState   ss<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    <span class="token keyword">int</span>         eflags<span class="token punctuation">;</span>         <span class="token comment">/* capability flags to pass to tuplestore */</span>
    bool        eof_underlying<span class="token punctuation">;</span> <span class="token comment">/* reached end of underlying plan? */</span>
    Tuplestorestate <span class="token operator">*</span>tuplestorestate<span class="token punctuation">;</span>
<span class="token punctuation">}</span> MaterialState<span class="token punctuation">;</span>

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中 <code>ScanState</code> 中维护了与扫描相关的信息，而 <code>MaterialState</code> 中额外扩展了用于缓存元组的 <code>Tuplestorestate</code>，以及指示该节点的子计划是否已经扫描完毕的 <code>eof_underlying</code>。</p><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization" aria-hidden="true">#</a> Initialization</h2><p>初始化操作在 <code>ExecInitNode()</code> 生命周期中被调用，主要工作是分配和 <code>Material</code> 节点对应的 <code>MaterialState</code> 节点，还要对子节点递归调用 <code>ExecInitNode()</code>。在这里，首先把 <code>eof_underlying</code> 设置为 <code>false</code>，表示底层子节点还没有扫描完成 (EOF)。</p><p>与其它节点初始化过程不同的是，物化节点不需要初始化选择和投影信息。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitMaterial
 * ----------------------------------------------------------------
 */</span>
MaterialState <span class="token operator">*</span>
<span class="token function">ExecInitMaterial</span><span class="token punctuation">(</span>Material <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    MaterialState <span class="token operator">*</span>matstate<span class="token punctuation">;</span>
    Plan       <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    matstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>MaterialState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecMaterial<span class="token punctuation">;</span>

    <span class="token comment">/*
     * We must have a tuplestore buffering the subplan output to do backward
     * scan or mark/restore.  We also prefer to materialize the subplan output
     * if we might be called on to rewind and replay it many times. However,
     * if none of these cases apply, we can skip storing the data.
     */</span>
    matstate<span class="token operator">-&gt;</span>eflags <span class="token operator">=</span> <span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_REWIND <span class="token operator">|</span>
                                  EXEC_FLAG_BACKWARD <span class="token operator">|</span>
                                  EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Tuplestore&#39;s interpretation of the flag bits is subtly different from
     * the general executor meaning: it doesn&#39;t think BACKWARD necessarily
     * means &quot;backwards all the way to start&quot;.  If told to support BACKWARD we
     * must include REWIND in the tuplestore eflags, else tuplestore_trim
     * might throw away too much.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> EXEC_FLAG_BACKWARD<span class="token punctuation">)</span>
        matstate<span class="token operator">-&gt;</span>eflags <span class="token operator">|=</span> EXEC_FLAG_REWIND<span class="token punctuation">;</span>

    matstate<span class="token operator">-&gt;</span>eof_underlying <span class="token operator">=</span> false<span class="token punctuation">;</span>
    matstate<span class="token operator">-&gt;</span>tuplestorestate <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Miscellaneous initialization
     *
     * Materialization nodes don&#39;t need ExprContexts because they never call
     * ExecQual or ExecProject.
     */</span>

    <span class="token comment">/*
     * initialize child nodes
     *
     * We shield the child node from the need to support REWIND, BACKWARD, or
     * MARK/RESTORE.
     */</span>
    eflags <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token punctuation">(</span>EXEC_FLAG_REWIND <span class="token operator">|</span> EXEC_FLAG_BACKWARD <span class="token operator">|</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">;</span>

    outerPlan <span class="token operator">=</span> <span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>matstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result type and slot. No need to initialize projection info
     * because this node doesn&#39;t do projections.
     *
     * material nodes only return tuples from their materialized relation.
     */</span>
    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsMinimalTuple<span class="token punctuation">)</span><span class="token punctuation">;</span>
    matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize tuple type.
     */</span>
    <span class="token function">ExecCreateScanSlotFromOuterPlan</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>matstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsMinimalTuple<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> matstate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution" aria-hidden="true">#</a> Execution</h2><p>在 <code>ExecProcNode()</code> 生命周期中被执行。只要目前访问的是 tuple store 的尾部，就要递归调用子节点的 <code>ExecProcNode()</code> 获取一个元组缓存到 tuple store 中并返回。Tuple store 本身只有在以下情况中才会被读取：</p><ul><li>反向扫描</li><li>重新扫描</li><li>Mark / restore</li></ul><p>首先，如果是第一次进入物化节点，那么 tuple store 暂时还为空，需要调用 <code>tuplestore_begin_heap()</code> 初始化。接着判断当前是否已经到达 tuple store 的最后 (EOF)：</p><ul><li>如果不是，那么可以直接调用 <code>tuplestore_gettupleslot()</code> 从 tuple store 取得缓存元组</li><li>如果是，那么对子节点调用 <code>ExecProcNode()</code> 获取元组 <ul><li>如果从子节点返回空元组，说明扫描结束，将 <code>eof_underlying</code> 设置为 <code>true</code></li><li>如果从子节点返回元组，则调用 <code>tuplestore_puttupleslot()</code> 将元组放入 tuple store 后返回元组</li></ul></li></ul><blockquote><p>下次可以重点研究一下 tuple store 是怎么放置元组的。</p></blockquote><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecMaterial
 *
 *      As long as we are at the end of the data collected in the tuplestore,
 *      we collect one new row from the subplan on each call, and stash it
 *      aside in the tuplestore before returning it.  The tuplestore is
 *      only read if we are asked to scan backwards, rescan, or mark/restore.
 *
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>         <span class="token comment">/* result tuple from subplan */</span>
<span class="token function">ExecMaterial</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    MaterialState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>MaterialState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span>
    ScanDirection dir<span class="token punctuation">;</span>
    bool        forward<span class="token punctuation">;</span>
    Tuplestorestate <span class="token operator">*</span>tuplestorestate<span class="token punctuation">;</span>
    bool        eof_tuplestore<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span>

    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * get state info from node
     */</span>
    estate <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state<span class="token punctuation">;</span>
    dir <span class="token operator">=</span> estate<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span>
    forward <span class="token operator">=</span> <span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span><span class="token punctuation">;</span>
    tuplestorestate <span class="token operator">=</span> node<span class="token operator">-&gt;</span>tuplestorestate<span class="token punctuation">;</span>

    <span class="token comment">/*
     * If first time through, and we need a tuplestore, initialize it.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>tuplestorestate <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>eflags <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        tuplestorestate <span class="token operator">=</span> <span class="token function">tuplestore_begin_heap</span><span class="token punctuation">(</span>true<span class="token punctuation">,</span> false<span class="token punctuation">,</span> work_mem<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">tuplestore_set_eflags</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">,</span> node<span class="token operator">-&gt;</span>eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>eflags <span class="token operator">&amp;</span> EXEC_FLAG_MARK<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * Allocate a second read pointer to serve as the mark. We know it
             * must have index 1, so needn&#39;t store that.
             */</span>
            <span class="token keyword">int</span>         ptrno PG_USED_FOR_ASSERTS_ONLY<span class="token punctuation">;</span>

            ptrno <span class="token operator">=</span> <span class="token function">tuplestore_alloc_read_pointer</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">,</span>
                                                  node<span class="token operator">-&gt;</span>eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">Assert</span><span class="token punctuation">(</span>ptrno <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        node<span class="token operator">-&gt;</span>tuplestorestate <span class="token operator">=</span> tuplestorestate<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * If we are not at the end of the tuplestore, or are going backwards, try
     * to fetch a tuple from tuplestore.
     */</span>
    eof_tuplestore <span class="token operator">=</span> <span class="token punctuation">(</span>tuplestorestate <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token operator">||</span>
        <span class="token function">tuplestore_ateof</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>forward <span class="token operator">&amp;&amp;</span> eof_tuplestore<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>eof_underlying<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * When reversing direction at tuplestore EOF, the first
             * gettupleslot call will fetch the last-added tuple; but we want
             * to return the one before that, if possible. So do an extra
             * fetch.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">tuplestore_advance</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">,</span> forward<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>    <span class="token comment">/* the tuplestore must be empty */</span>
        <span class="token punctuation">}</span>
        eof_tuplestore <span class="token operator">=</span> false<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * If we can fetch another tuple from the tuplestore, return it.
     */</span>
    slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>eof_tuplestore<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tuplestore_gettupleslot</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">,</span> forward<span class="token punctuation">,</span> false<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>forward<span class="token punctuation">)</span>
            eof_tuplestore <span class="token operator">=</span> true<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * If necessary, try to fetch another row from the subplan.
     *
     * Note: the eof_underlying state variable exists to short-circuit further
     * subplan calls.  It&#39;s not optional, unfortunately, because some plan
     * node types are not robust about being called again when they&#39;ve already
     * returned NULL.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>eof_tuplestore <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>node<span class="token operator">-&gt;</span>eof_underlying<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        PlanState  <span class="token operator">*</span>outerNode<span class="token punctuation">;</span>
        TupleTableSlot <span class="token operator">*</span>outerslot<span class="token punctuation">;</span>

        <span class="token comment">/*
         * We can only get here with forward==true, so no need to worry about
         * which direction the subplan will go.
         */</span>
        outerNode <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
        outerslot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerNode<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerslot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            node<span class="token operator">-&gt;</span>eof_underlying <span class="token operator">=</span> true<span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/*
         * Append a copy of the returned tuple to tuplestore.  NOTE: because
         * the tuplestore is certainly in EOF state, its read position will
         * move forward over the added tuple.  This is what we want.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">)</span>
            <span class="token function">tuplestore_puttupleslot</span><span class="token punctuation">(</span>tuplestorestate<span class="token punctuation">,</span> outerslot<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>slot<span class="token punctuation">,</span> outerslot<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * Nothing left ...
     */</span>
    <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up" aria-hidden="true">#</a> Clean Up</h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用。调用 <code>tuplestore_end()</code> 释放 tuple store，然后对子节点递归调用 <code>ExecEndNode()</code>。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndMaterial
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndMaterial</span><span class="token punctuation">(</span>MaterialState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * clean out the tuple table
     */</span>
    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Release tuplestore resources
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>tuplestorestate <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token function">tuplestore_end</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>tuplestorestate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    node<span class="token operator">-&gt;</span>tuplestorestate <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * shut down the subplan
     */</span>
    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,30),p=[o];function l(i,c){return s(),a("div",null,p)}const r=n(t,[["render",l],["__file","PostgreSQL Executor Material.html.vue"]]);export{r as default};
