import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},o=e(`<h1 id="postgresql-executor-limit" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-limit" aria-hidden="true">#</a> PostgreSQL - Executor: Limit</h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 14 01:02</p><p>Hangzhou, Zhejiang, China</p><hr><p><code>Limit</code> 节点用于限制返回的元组行数。当 <code>Limit</code> 节点从孩子节点获取指定数量的元组后，就结束查询，不再递归调用 <code>ExecProcNode()</code> 获取元组了。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h2><p><code>Limit</code> 节点还真没有看起来这么简单：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * LimitOption -
 *  LIMIT option of query
 *
 * This is needed in both parsenodes.h and plannodes.h, so put it here...
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">LimitOption</span>
<span class="token punctuation">{</span>
    LIMIT_OPTION_COUNT<span class="token punctuation">,</span>         <span class="token comment">/* FETCH FIRST... ONLY */</span>
    LIMIT_OPTION_WITH_TIES<span class="token punctuation">,</span>     <span class="token comment">/* FETCH FIRST... WITH TIES */</span>
    LIMIT_OPTION_DEFAULT<span class="token punctuation">,</span>       <span class="token comment">/* No limit present */</span>
<span class="token punctuation">}</span> LimitOption<span class="token punctuation">;</span>

<span class="token comment">/* ----------------
 *      limit node
 *
 * Note: as of Postgres 8.2, the offset and count expressions are expected
 * to yield int8, rather than int4 as before.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Limit</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
    Node       <span class="token operator">*</span>limitOffset<span class="token punctuation">;</span>    <span class="token comment">/* OFFSET parameter, or NULL if none */</span>
    Node       <span class="token operator">*</span>limitCount<span class="token punctuation">;</span>     <span class="token comment">/* COUNT parameter, or NULL if none */</span>
    LimitOption limitOption<span class="token punctuation">;</span>    <span class="token comment">/* limit type */</span>
    <span class="token keyword">int</span>         uniqNumCols<span class="token punctuation">;</span>    <span class="token comment">/* number of columns to check for similarity  */</span>
    AttrNumber <span class="token operator">*</span>uniqColIdx<span class="token punctuation">;</span>     <span class="token comment">/* their indexes in the target list */</span>
    Oid        <span class="token operator">*</span>uniqOperators<span class="token punctuation">;</span>  <span class="token comment">/* equality operators to compare with */</span>
    Oid        <span class="token operator">*</span>uniqCollations<span class="token punctuation">;</span> <span class="token comment">/* collations for equality comparisons */</span>
<span class="token punctuation">}</span> Limit<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>limitOffset</code> 和 <code>limitCount</code> 分别表示从第几个元组开始返回，以及返回多少个元组。该值将在运行时才能确定。</p><p>几个 <code>unique</code> 相关的变量用于支持 <code>WITH TIES</code> (并列) 类型的 <code>Limit</code>。既然要知道两行是否并列，那么肯定要基于某几列的值做一个计算，并用一个函数来判断它们是否相等。如果相等，才是并列的。</p><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state" aria-hidden="true">#</a> Plan State</h2><p><code>LimitState</code> 定义了状态机，执行器根据节点的状态执行相应的代码：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   LimitState information
 *
 *      Limit nodes are used to enforce LIMIT/OFFSET clauses.
 *      They just select the desired subrange of their subplan&#39;s output.
 *
 * offset is the number of initial tuples to skip (0 does nothing).
 * count is the number of tuples to return after skipping the offset tuples.
 * If no limit count was specified, count is undefined and noCount is true.
 * When lstate == LIMIT_INITIAL, offset/count/noCount haven&#39;t been set yet.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span>
<span class="token punctuation">{</span>
    LIMIT_INITIAL<span class="token punctuation">,</span>              <span class="token comment">/* initial state for LIMIT node */</span>
    LIMIT_RESCAN<span class="token punctuation">,</span>               <span class="token comment">/* rescan after recomputing parameters */</span>
    LIMIT_EMPTY<span class="token punctuation">,</span>                <span class="token comment">/* there are no returnable rows */</span>
    LIMIT_INWINDOW<span class="token punctuation">,</span>             <span class="token comment">/* have returned a row in the window */</span>
    LIMIT_WINDOWEND_TIES<span class="token punctuation">,</span>       <span class="token comment">/* have returned a tied row */</span>
    LIMIT_SUBPLANEOF<span class="token punctuation">,</span>           <span class="token comment">/* at EOF of subplan (within window) */</span>
    LIMIT_WINDOWEND<span class="token punctuation">,</span>            <span class="token comment">/* stepped off end of window */</span>
    LIMIT_WINDOWSTART           <span class="token comment">/* stepped off beginning of window */</span>
<span class="token punctuation">}</span> LimitStateCond<span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">LimitState</span>
<span class="token punctuation">{</span>
    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    ExprState  <span class="token operator">*</span>limitOffset<span class="token punctuation">;</span>    <span class="token comment">/* OFFSET parameter, or NULL if none */</span>
    ExprState  <span class="token operator">*</span>limitCount<span class="token punctuation">;</span>     <span class="token comment">/* COUNT parameter, or NULL if none */</span>
    LimitOption limitOption<span class="token punctuation">;</span>    <span class="token comment">/* limit specification type */</span>
    int64       offset<span class="token punctuation">;</span>         <span class="token comment">/* current OFFSET value */</span>
    int64       count<span class="token punctuation">;</span>          <span class="token comment">/* current COUNT, if any */</span>
    bool        noCount<span class="token punctuation">;</span>        <span class="token comment">/* if true, ignore count */</span>
    LimitStateCond lstate<span class="token punctuation">;</span>      <span class="token comment">/* state machine status, as above */</span>
    int64       position<span class="token punctuation">;</span>       <span class="token comment">/* 1-based index of last tuple returned */</span>
    TupleTableSlot <span class="token operator">*</span>subSlot<span class="token punctuation">;</span>    <span class="token comment">/* tuple last obtained from subplan */</span>
    ExprState  <span class="token operator">*</span>eqfunction<span class="token punctuation">;</span>     <span class="token comment">/* tuple equality qual in case of WITH TIES
                                 * option */</span>
    TupleTableSlot <span class="token operator">*</span>last_slot<span class="token punctuation">;</span>  <span class="token comment">/* slot for evaluation of ties */</span>
<span class="token punctuation">}</span> LimitState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中维护了当前的 offset 和 count，以及用于计算两行是否相等 (with ties) 的表达式结构。</p><h2 id="init-node" tabindex="-1"><a class="header-anchor" href="#init-node" aria-hidden="true">#</a> Init Node</h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。其主要工作包含：</p><ol><li>构造 <code>LimitState</code> 节点</li><li>递归调用 <code>ExecInitNode()</code></li><li>初始化 offset 和 count 的表达式计算环境</li><li>如果 <code>Limit</code> 节点需要支持 with ties，那么还要初始化一个存放元组的空间，以及等值计算的函数，以便作比较</li></ol><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitLimit
 *
 *      This initializes the limit node state structures and
 *      the node&#39;s subplan.
 * ----------------------------------------------------------------
 */</span>
LimitState <span class="token operator">*</span>
<span class="token function">ExecInitLimit</span><span class="token punctuation">(</span>Limit <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    LimitState <span class="token operator">*</span>limitstate<span class="token punctuation">;</span>
    Plan       <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>

    <span class="token comment">/* check for unsupported flags */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    limitstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>LimitState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecLimit<span class="token punctuation">;</span>

    limitstate<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INITIAL<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Miscellaneous initialization
     *
     * Limit nodes never call ExecQual or ExecProject, but they need an
     * exprcontext anyway to evaluate the limit/offset parameters in.
     */</span>
    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize outer plan
     */</span>
    outerPlan <span class="token operator">=</span> <span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child expressions
     */</span>
    limitstate<span class="token operator">-&gt;</span>limitOffset <span class="token operator">=</span> <span class="token function">ExecInitExpr</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>limitOffset<span class="token punctuation">,</span>
                                           <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> limitstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>limitCount <span class="token operator">=</span> <span class="token function">ExecInitExpr</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>limitCount<span class="token punctuation">,</span>
                                          <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> limitstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>limitOption <span class="token operator">=</span> node<span class="token operator">-&gt;</span>limitOption<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result type.
     */</span>
    <span class="token function">ExecInitResultTypeTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsset <span class="token operator">=</span> true<span class="token punctuation">;</span>
    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultops <span class="token operator">=</span> <span class="token function">ExecGetResultSlotOps</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">,</span>
                                                    <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsfixed<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * limit nodes do no projections, so initialize projection info for this
     * node appropriately
     */</span>
    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize the equality evaluation, to detect ties.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        TupleDesc   desc<span class="token punctuation">;</span>
        <span class="token keyword">const</span> TupleTableSlotOps <span class="token operator">*</span>ops<span class="token punctuation">;</span>

        desc <span class="token operator">=</span> <span class="token function">ExecGetResultType</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        ops <span class="token operator">=</span> <span class="token function">ExecGetResultSlotOps</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        limitstate<span class="token operator">-&gt;</span>last_slot <span class="token operator">=</span> <span class="token function">ExecInitExtraTupleSlot</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> desc<span class="token punctuation">,</span> ops<span class="token punctuation">)</span><span class="token punctuation">;</span>
        limitstate<span class="token operator">-&gt;</span>eqfunction <span class="token operator">=</span> <span class="token function">execTuplesMatchPrepare</span><span class="token punctuation">(</span>desc<span class="token punctuation">,</span>
                                                        node<span class="token operator">-&gt;</span>uniqNumCols<span class="token punctuation">,</span>
                                                        node<span class="token operator">-&gt;</span>uniqColIdx<span class="token punctuation">,</span>
                                                        node<span class="token operator">-&gt;</span>uniqOperators<span class="token punctuation">,</span>
                                                        node<span class="token operator">-&gt;</span>uniqCollations<span class="token punctuation">,</span>
                                                        <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> limitstate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="node-execution" tabindex="-1"><a class="header-anchor" href="#node-execution" aria-hidden="true">#</a> Node Execution</h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。其主体是一个 <code>switch</code> 语句，根据节点当前的状态，执行对应的代码。</p><ul><li><code>LIMIT_INITIAL</code>：节点第一个被执行，那么首先使用表达式计算 offset 和 count</li><li><code>LIMIT_RESCAN</code>：判断扫描方向 (正向 / 反向)，然后不断递归调用 <code>ExecProcNode()</code> 从子节点获取元组，直到 <code>LimitState</code> 中的 <code>position</code> 超过 <code>offset</code>；如果支持 <code>with ties</code>，那么还需要拷贝暂存读取到的元组用于之后的等值比较</li><li><code>LIMIT_EMPTY</code>：子结点不返回元组了，因此向上层返回空元组</li><li><code>LIMIT_INWINDOW</code>：节点已经处于 <code>[offset, offset + count)</code> 的窗口中，判断扫描方向，并递归调用 <code>ExecProcNode()</code> 从子节点获取一个元组 (还需要将元组暂存)</li><li><code>LIMIT_WINDOWEND_TIES</code>：判断扫描方向，递归调用 <code>ExecProcNode()</code> 从子节点获取元组，然后调用 <code>eqfunction</code> 判断是否与暂存元组相等 (并列)；如果并列，则返回元组；否则返回空元组</li><li>...</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecLimit
 *
 *      This is a very simple node which just performs LIMIT/OFFSET
 *      filtering on the stream of tuples returned by a subplan.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>         <span class="token comment">/* return: a tuple or NULL */</span>
<span class="token function">ExecLimit</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    LimitState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>LimitState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    ExprContext <span class="token operator">*</span>econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span>
    ScanDirection direction<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span>
    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>

    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * get information from the node
     */</span>
    direction <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span>
    outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * The main logic is a simple state machine.
     */</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>lstate<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">case</span> LIMIT_INITIAL<span class="token operator">:</span>

            <span class="token comment">/*
             * First call for this node, so compute limit/offset. (We can&#39;t do
             * this any earlier, because parameters from upper nodes will not
             * be set during ExecInitLimit.)  This also sets position = 0 and
             * changes the state to LIMIT_RESCAN.
             */</span>
            <span class="token function">recompute_limits</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">/* FALL THRU */</span>

        <span class="token keyword">case</span> LIMIT_RESCAN<span class="token operator">:</span>

            <span class="token comment">/*
             * If backwards scan, just return NULL without changing state.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * Check for empty window; if so, treat like empty subplan.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>count <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>node<span class="token operator">-&gt;</span>noCount<span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_EMPTY<span class="token punctuation">;</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/*
             * Fetch rows from subplan until we reach position &gt; offset.
             */</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    <span class="token comment">/*
                     * The subplan returns too few tuples for us to produce
                     * any output at all.
                     */</span>
                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_EMPTY<span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>

                <span class="token comment">/*
                 * Tuple at limit is needed for comparison in subsequent
                 * execution to detect ties.
                 */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES <span class="token operator">&amp;&amp;</span>
                    node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">==</span> node<span class="token operator">-&gt;</span>count <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">++</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&gt;</span> node<span class="token operator">-&gt;</span>offset<span class="token punctuation">)</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/*
             * Okay, we have the first tuple of the window.
             */</span>
            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> LIMIT_EMPTY<span class="token operator">:</span>

            <span class="token comment">/*
             * The subplan is known to return no tuples (or not more than
             * OFFSET tuples, in general).  So we return no tuples.
             */</span>
            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> LIMIT_INWINDOW<span class="token operator">:</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Forwards scan, so check for stepping off end of window.  At
                 * the end of the window, the behavior depends on whether WITH
                 * TIES was specified: if so, we need to change the state
                 * machine to WINDOWEND_TIES, and fall through to the code for
                 * that case.  If not (nothing was specified, or ONLY was)
                 * return NULL without advancing the subplan or the position
                 * variable, but change the state machine to record having
                 * done so.
                 *
                 * Once at the end, ideally, we would shut down parallel
                 * resources; but that would destroy the parallel context
                 * which might be required for rescans.  To do that, we&#39;ll
                 * need to find a way to pass down more information about
                 * whether rescans are possible.
                 */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>noCount <span class="token operator">&amp;&amp;</span>
                    node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">&gt;=</span> node<span class="token operator">-&gt;</span>count<span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_COUNT<span class="token punctuation">)</span>
                    <span class="token punctuation">{</span>
                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND<span class="token punctuation">;</span>
                        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                    <span class="token keyword">else</span>
                    <span class="token punctuation">{</span>
                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND_TIES<span class="token punctuation">;</span>
                        <span class="token comment">/* we&#39;ll fall through to the next case */</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">else</span>
                <span class="token punctuation">{</span>
                    <span class="token comment">/*
                     * Get next tuple from subplan, if any.
                     */</span>
                    slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token punctuation">{</span>
                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_SUBPLANEOF<span class="token punctuation">;</span>
                        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>

                    <span class="token comment">/*
                     * If WITH TIES is active, and this is the last in-window
                     * tuple, save it to be used in subsequent WINDOWEND_TIES
                     * processing.
                     */</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES <span class="token operator">&amp;&amp;</span>
                        node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">==</span> node<span class="token operator">-&gt;</span>count <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span>
                    <span class="token punctuation">{</span>
                        <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                    node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                    node<span class="token operator">-&gt;</span>position<span class="token operator">++</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Backwards scan, so check for stepping off start of window.
                 * As above, only change state-machine status if so.
                 */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&lt;=</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWSTART<span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>

                <span class="token comment">/*
                 * Get previous tuple from subplan; there should be one!
                 */</span>
                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>position<span class="token operator">--</span><span class="token punctuation">;</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>lstate <span class="token operator">==</span> LIMIT_WINDOWEND_TIES<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">/* FALL THRU */</span>

        <span class="token keyword">case</span> LIMIT_WINDOWEND_TIES<span class="token operator">:</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Advance the subplan until we find the first row with
                 * different ORDER BY pathkeys.
                 */</span>
                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_SUBPLANEOF<span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>

                <span class="token comment">/*
                 * Test if the new tuple and the last tuple match. If so we
                 * return the tuple.
                 */</span>
                econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecQualAndReset</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>eqfunction<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                    node<span class="token operator">-&gt;</span>position<span class="token operator">++</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">else</span>
                <span class="token punctuation">{</span>
                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND<span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Backwards scan, so check for stepping off start of window.
                 * Change only state-machine status if so.
                 */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&lt;=</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWSTART<span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>

                <span class="token comment">/*
                 * Get previous tuple from subplan; there should be one! And
                 * change state-machine status.
                 */</span>
                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>position<span class="token operator">--</span><span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> LIMIT_SUBPLANEOF<span class="token operator">:</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * Backing up from subplan EOF, so re-fetch previous tuple; there
             * should be one!  Note previous tuple must be in window.
             */</span>
            slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
            <span class="token comment">/* position does not change &#39;cause we didn&#39;t advance it before */</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> LIMIT_WINDOWEND<span class="token operator">:</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * We already past one position to detect ties so re-fetch
             * previous tuple; there should be one!  Note previous tuple must
             * be in window.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES<span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * Backing up from window end: simply re-return the last tuple
                 * fetched from the subplan.
                 */</span>
                slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>subSlot<span class="token punctuation">;</span>
                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
                <span class="token comment">/* position does not change &#39;cause we didn&#39;t advance it before */</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> LIMIT_WINDOWSTART<span class="token operator">:</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * Advancing after having backed off window start: simply
             * re-return the last tuple fetched from the subplan.
             */</span>
            slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>subSlot<span class="token punctuation">;</span>
            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span>
            <span class="token comment">/* position does not change &#39;cause we didn&#39;t change it before */</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">default</span><span class="token operator">:</span>
            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;impossible LIMIT state: %d&quot;</span><span class="token punctuation">,</span>
                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>lstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
            slot <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>        <span class="token comment">/* keep compiler quiet */</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Return the current tuple */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> slot<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution-end" tabindex="-1"><a class="header-anchor" href="#execution-end" aria-hidden="true">#</a> Execution End</h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用，主要是递归调用 <code>ExecEndNode()</code>，以及清理本节点中分配的表达式计算环境。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndLimit
 *
 *      This shuts down the subplan and frees resources allocated
 *      to this node.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndLimit</span><span class="token punctuation">(</span>LimitState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,26),p=[o];function i(c,l){return s(),a("div",null,p)}const d=n(t,[["render",i],["__file","PostgreSQL Executor Limit.html.vue"]]);export{d as default};
