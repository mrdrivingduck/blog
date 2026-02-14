import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function t(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-limit" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-limit"><span>PostgreSQL - Executor: Limit</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 14 01:02</p><p>Hangzhou, Zhejiang, China</p><hr><p><code>Limit</code> 节点用于限制返回的元组行数。当 <code>Limit</code> 节点从孩子节点获取指定数量的元组后，就结束查询，不再递归调用 <code>ExecProcNode()</code> 获取元组了。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p><code>Limit</code> 节点还真没有看起来这么简单：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * LimitOption -</span>
<span class="line"> *  LIMIT option of query</span>
<span class="line"> *</span>
<span class="line"> * This is needed in both parsenodes.h and plannodes.h, so put it here...</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">LimitOption</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LIMIT_OPTION_COUNT<span class="token punctuation">,</span>         <span class="token comment">/* FETCH FIRST... ONLY */</span></span>
<span class="line">    LIMIT_OPTION_WITH_TIES<span class="token punctuation">,</span>     <span class="token comment">/* FETCH FIRST... WITH TIES */</span></span>
<span class="line">    LIMIT_OPTION_DEFAULT<span class="token punctuation">,</span>       <span class="token comment">/* No limit present */</span></span>
<span class="line"><span class="token punctuation">}</span> LimitOption<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      limit node</span>
<span class="line"> *</span>
<span class="line"> * Note: as of Postgres 8.2, the offset and count expressions are expected</span>
<span class="line"> * to yield int8, rather than int4 as before.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Limit</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    Node       <span class="token operator">*</span>limitOffset<span class="token punctuation">;</span>    <span class="token comment">/* OFFSET parameter, or NULL if none */</span></span>
<span class="line">    Node       <span class="token operator">*</span>limitCount<span class="token punctuation">;</span>     <span class="token comment">/* COUNT parameter, or NULL if none */</span></span>
<span class="line">    LimitOption limitOption<span class="token punctuation">;</span>    <span class="token comment">/* limit type */</span></span>
<span class="line">    <span class="token keyword">int</span>         uniqNumCols<span class="token punctuation">;</span>    <span class="token comment">/* number of columns to check for similarity  */</span></span>
<span class="line">    AttrNumber <span class="token operator">*</span>uniqColIdx<span class="token punctuation">;</span>     <span class="token comment">/* their indexes in the target list */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>uniqOperators<span class="token punctuation">;</span>  <span class="token comment">/* equality operators to compare with */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>uniqCollations<span class="token punctuation">;</span> <span class="token comment">/* collations for equality comparisons */</span></span>
<span class="line"><span class="token punctuation">}</span> Limit<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>limitOffset</code> 和 <code>limitCount</code> 分别表示从第几个元组开始返回，以及返回多少个元组。该值将在运行时才能确定。</p><p>几个 <code>unique</code> 相关的变量用于支持 <code>WITH TIES</code> (并列) 类型的 <code>Limit</code>。既然要知道两行是否并列，那么肯定要基于某几列的值做一个计算，并用一个函数来判断它们是否相等。如果相等，才是并列的。</p><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state"><span>Plan State</span></a></h2><p><code>LimitState</code> 定义了状态机，执行器根据节点的状态执行相应的代码：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   LimitState information</span>
<span class="line"> *</span>
<span class="line"> *      Limit nodes are used to enforce LIMIT/OFFSET clauses.</span>
<span class="line"> *      They just select the desired subrange of their subplan&#39;s output.</span>
<span class="line"> *</span>
<span class="line"> * offset is the number of initial tuples to skip (0 does nothing).</span>
<span class="line"> * count is the number of tuples to return after skipping the offset tuples.</span>
<span class="line"> * If no limit count was specified, count is undefined and noCount is true.</span>
<span class="line"> * When lstate == LIMIT_INITIAL, offset/count/noCount haven&#39;t been set yet.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LIMIT_INITIAL<span class="token punctuation">,</span>              <span class="token comment">/* initial state for LIMIT node */</span></span>
<span class="line">    LIMIT_RESCAN<span class="token punctuation">,</span>               <span class="token comment">/* rescan after recomputing parameters */</span></span>
<span class="line">    LIMIT_EMPTY<span class="token punctuation">,</span>                <span class="token comment">/* there are no returnable rows */</span></span>
<span class="line">    LIMIT_INWINDOW<span class="token punctuation">,</span>             <span class="token comment">/* have returned a row in the window */</span></span>
<span class="line">    LIMIT_WINDOWEND_TIES<span class="token punctuation">,</span>       <span class="token comment">/* have returned a tied row */</span></span>
<span class="line">    LIMIT_SUBPLANEOF<span class="token punctuation">,</span>           <span class="token comment">/* at EOF of subplan (within window) */</span></span>
<span class="line">    LIMIT_WINDOWEND<span class="token punctuation">,</span>            <span class="token comment">/* stepped off end of window */</span></span>
<span class="line">    LIMIT_WINDOWSTART           <span class="token comment">/* stepped off beginning of window */</span></span>
<span class="line"><span class="token punctuation">}</span> LimitStateCond<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">LimitState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>limitOffset<span class="token punctuation">;</span>    <span class="token comment">/* OFFSET parameter, or NULL if none */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>limitCount<span class="token punctuation">;</span>     <span class="token comment">/* COUNT parameter, or NULL if none */</span></span>
<span class="line">    LimitOption limitOption<span class="token punctuation">;</span>    <span class="token comment">/* limit specification type */</span></span>
<span class="line">    int64       offset<span class="token punctuation">;</span>         <span class="token comment">/* current OFFSET value */</span></span>
<span class="line">    int64       count<span class="token punctuation">;</span>          <span class="token comment">/* current COUNT, if any */</span></span>
<span class="line">    bool        noCount<span class="token punctuation">;</span>        <span class="token comment">/* if true, ignore count */</span></span>
<span class="line">    LimitStateCond lstate<span class="token punctuation">;</span>      <span class="token comment">/* state machine status, as above */</span></span>
<span class="line">    int64       position<span class="token punctuation">;</span>       <span class="token comment">/* 1-based index of last tuple returned */</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>subSlot<span class="token punctuation">;</span>    <span class="token comment">/* tuple last obtained from subplan */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>eqfunction<span class="token punctuation">;</span>     <span class="token comment">/* tuple equality qual in case of WITH TIES</span>
<span class="line">                                 * option */</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>last_slot<span class="token punctuation">;</span>  <span class="token comment">/* slot for evaluation of ties */</span></span>
<span class="line"><span class="token punctuation">}</span> LimitState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中维护了当前的 offset 和 count，以及用于计算两行是否相等 (with ties) 的表达式结构。</p><h2 id="init-node" tabindex="-1"><a class="header-anchor" href="#init-node"><span>Init Node</span></a></h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。其主要工作包含：</p><ol><li>构造 <code>LimitState</code> 节点</li><li>递归调用 <code>ExecInitNode()</code></li><li>初始化 offset 和 count 的表达式计算环境</li><li>如果 <code>Limit</code> 节点需要支持 with ties，那么还要初始化一个存放元组的空间，以及等值计算的函数，以便作比较</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInitLimit</span>
<span class="line"> *</span>
<span class="line"> *      This initializes the limit node state structures and</span>
<span class="line"> *      the node&#39;s subplan.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">LimitState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitLimit</span><span class="token punctuation">(</span>Limit <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LimitState <span class="token operator">*</span>limitstate<span class="token punctuation">;</span></span>
<span class="line">    Plan       <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* check for unsupported flags */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create state structure</span>
<span class="line">     */</span></span>
<span class="line">    limitstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>LimitState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecLimit<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INITIAL<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Miscellaneous initialization</span>
<span class="line">     *</span>
<span class="line">     * Limit nodes never call ExecQual or ExecProject, but they need an</span>
<span class="line">     * exprcontext anyway to evaluate the limit/offset parameters in.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize outer plan</span>
<span class="line">     */</span></span>
<span class="line">    outerPlan <span class="token operator">=</span> <span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child expressions</span>
<span class="line">     */</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>limitOffset <span class="token operator">=</span> <span class="token function">ExecInitExpr</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>limitOffset<span class="token punctuation">,</span></span>
<span class="line">                                           <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> limitstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>limitCount <span class="token operator">=</span> <span class="token function">ExecInitExpr</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>limitCount<span class="token punctuation">,</span></span>
<span class="line">                                          <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> limitstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>limitOption <span class="token operator">=</span> node<span class="token operator">-&gt;</span>limitOption<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize result type.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTypeTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsset <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultops <span class="token operator">=</span> <span class="token function">ExecGetResultSlotOps</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                                                    <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsfixed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * limit nodes do no projections, so initialize projection info for this</span>
<span class="line">     * node appropriately</span>
<span class="line">     */</span></span>
<span class="line">    limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize the equality evaluation, to detect ties.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        TupleDesc   desc<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">const</span> TupleTableSlotOps <span class="token operator">*</span>ops<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        desc <span class="token operator">=</span> <span class="token function">ExecGetResultType</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        ops <span class="token operator">=</span> <span class="token function">ExecGetResultSlotOps</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>limitstate<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        limitstate<span class="token operator">-&gt;</span>last_slot <span class="token operator">=</span> <span class="token function">ExecInitExtraTupleSlot</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> desc<span class="token punctuation">,</span> ops<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        limitstate<span class="token operator">-&gt;</span>eqfunction <span class="token operator">=</span> <span class="token function">execTuplesMatchPrepare</span><span class="token punctuation">(</span>desc<span class="token punctuation">,</span></span>
<span class="line">                                                        node<span class="token operator">-&gt;</span>uniqNumCols<span class="token punctuation">,</span></span>
<span class="line">                                                        node<span class="token operator">-&gt;</span>uniqColIdx<span class="token punctuation">,</span></span>
<span class="line">                                                        node<span class="token operator">-&gt;</span>uniqOperators<span class="token punctuation">,</span></span>
<span class="line">                                                        node<span class="token operator">-&gt;</span>uniqCollations<span class="token punctuation">,</span></span>
<span class="line">                                                        <span class="token operator">&amp;</span>limitstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> limitstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="node-execution" tabindex="-1"><a class="header-anchor" href="#node-execution"><span>Node Execution</span></a></h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。其主体是一个 <code>switch</code> 语句，根据节点当前的状态，执行对应的代码。</p><ul><li><code>LIMIT_INITIAL</code>：节点第一个被执行，那么首先使用表达式计算 offset 和 count</li><li><code>LIMIT_RESCAN</code>：判断扫描方向 (正向 / 反向)，然后不断递归调用 <code>ExecProcNode()</code> 从子节点获取元组，直到 <code>LimitState</code> 中的 <code>position</code> 超过 <code>offset</code>；如果支持 <code>with ties</code>，那么还需要拷贝暂存读取到的元组用于之后的等值比较</li><li><code>LIMIT_EMPTY</code>：子结点不返回元组了，因此向上层返回空元组</li><li><code>LIMIT_INWINDOW</code>：节点已经处于 <code>[offset, offset + count)</code> 的窗口中，判断扫描方向，并递归调用 <code>ExecProcNode()</code> 从子节点获取一个元组 (还需要将元组暂存)</li><li><code>LIMIT_WINDOWEND_TIES</code>：判断扫描方向，递归调用 <code>ExecProcNode()</code> 从子节点获取元组，然后调用 <code>eqfunction</code> 判断是否与暂存元组相等 (并列)；如果并列，则返回元组；否则返回空元组</li><li>...</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecLimit</span>
<span class="line"> *</span>
<span class="line"> *      This is a very simple node which just performs LIMIT/OFFSET</span>
<span class="line"> *      filtering on the stream of tuples returned by a subplan.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>         <span class="token comment">/* return: a tuple or NULL */</span></span>
<span class="line"><span class="token function">ExecLimit</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LimitState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>LimitState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    ExprContext <span class="token operator">*</span>econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span></span>
<span class="line">    ScanDirection direction<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span></span>
<span class="line">    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get information from the node</span>
<span class="line">     */</span></span>
<span class="line">    direction <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span></span>
<span class="line">    outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The main logic is a simple state machine.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>lstate<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_INITIAL<span class="token operator">:</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * First call for this node, so compute limit/offset. (We can&#39;t do</span>
<span class="line">             * this any earlier, because parameters from upper nodes will not</span>
<span class="line">             * be set during ExecInitLimit.)  This also sets position = 0 and</span>
<span class="line">             * changes the state to LIMIT_RESCAN.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">recompute_limits</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* FALL THRU */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_RESCAN<span class="token operator">:</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * If backwards scan, just return NULL without changing state.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Check for empty window; if so, treat like empty subplan.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>count <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>node<span class="token operator">-&gt;</span>noCount<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_EMPTY<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Fetch rows from subplan until we reach position &gt; offset.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * The subplan returns too few tuples for us to produce</span>
<span class="line">                     * any output at all.</span>
<span class="line">                     */</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_EMPTY<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Tuple at limit is needed for comparison in subsequent</span>
<span class="line">                 * execution to detect ties.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES <span class="token operator">&amp;&amp;</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">==</span> node<span class="token operator">-&gt;</span>count <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">++</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&gt;</span> node<span class="token operator">-&gt;</span>offset<span class="token punctuation">)</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Okay, we have the first tuple of the window.</span>
<span class="line">             */</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_EMPTY<span class="token operator">:</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * The subplan is known to return no tuples (or not more than</span>
<span class="line">             * OFFSET tuples, in general).  So we return no tuples.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_INWINDOW<span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Forwards scan, so check for stepping off end of window.  At</span>
<span class="line">                 * the end of the window, the behavior depends on whether WITH</span>
<span class="line">                 * TIES was specified: if so, we need to change the state</span>
<span class="line">                 * machine to WINDOWEND_TIES, and fall through to the code for</span>
<span class="line">                 * that case.  If not (nothing was specified, or ONLY was)</span>
<span class="line">                 * return NULL without advancing the subplan or the position</span>
<span class="line">                 * variable, but change the state machine to record having</span>
<span class="line">                 * done so.</span>
<span class="line">                 *</span>
<span class="line">                 * Once at the end, ideally, we would shut down parallel</span>
<span class="line">                 * resources; but that would destroy the parallel context</span>
<span class="line">                 * which might be required for rescans.  To do that, we&#39;ll</span>
<span class="line">                 * need to find a way to pass down more information about</span>
<span class="line">                 * whether rescans are possible.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>noCount <span class="token operator">&amp;&amp;</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">&gt;=</span> node<span class="token operator">-&gt;</span>count<span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_COUNT<span class="token punctuation">)</span></span>
<span class="line">                    <span class="token punctuation">{</span></span>
<span class="line">                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND<span class="token punctuation">;</span></span>
<span class="line">                        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                    <span class="token keyword">else</span></span>
<span class="line">                    <span class="token punctuation">{</span></span>
<span class="line">                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND_TIES<span class="token punctuation">;</span></span>
<span class="line">                        <span class="token comment">/* we&#39;ll fall through to the next case */</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token keyword">else</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * Get next tuple from subplan, if any.</span>
<span class="line">                     */</span></span>
<span class="line">                    slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                    <span class="token punctuation">{</span></span>
<span class="line">                        node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_SUBPLANEOF<span class="token punctuation">;</span></span>
<span class="line">                        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * If WITH TIES is active, and this is the last in-window</span>
<span class="line">                     * tuple, save it to be used in subsequent WINDOWEND_TIES</span>
<span class="line">                     * processing.</span>
<span class="line">                     */</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES <span class="token operator">&amp;&amp;</span></span>
<span class="line">                        node<span class="token operator">-&gt;</span>position <span class="token operator">-</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">==</span> node<span class="token operator">-&gt;</span>count <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                    <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>position<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Backwards scan, so check for stepping off start of window.</span>
<span class="line">                 * As above, only change state-machine status if so.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&lt;=</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWSTART<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Get previous tuple from subplan; there should be one!</span>
<span class="line">                 */</span></span>
<span class="line">                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>position<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>lstate <span class="token operator">==</span> LIMIT_WINDOWEND_TIES<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* FALL THRU */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_WINDOWEND_TIES<span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Advance the subplan until we find the first row with</span>
<span class="line">                 * different ORDER BY pathkeys.</span>
<span class="line">                 */</span></span>
<span class="line">                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_SUBPLANEOF<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Test if the new tuple and the last tuple match. If so we</span>
<span class="line">                 * return the tuple.</span>
<span class="line">                 */</span></span>
<span class="line">                econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> node<span class="token operator">-&gt;</span>last_slot<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecQualAndReset</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>eqfunction<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>position<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token keyword">else</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWEND<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Backwards scan, so check for stepping off start of window.</span>
<span class="line">                 * Change only state-machine status if so.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>position <span class="token operator">&lt;=</span> node<span class="token operator">-&gt;</span>offset <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_WINDOWSTART<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Get previous tuple from subplan; there should be one! And</span>
<span class="line">                 * change state-machine status.</span>
<span class="line">                 */</span></span>
<span class="line">                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>position<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_SUBPLANEOF<span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Backing up from subplan EOF, so re-fetch previous tuple; there</span>
<span class="line">             * should be one!  Note previous tuple must be in window.</span>
<span class="line">             */</span></span>
<span class="line">            slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* position does not change &#39;cause we didn&#39;t advance it before */</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_WINDOWEND<span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * We already past one position to detect ties so re-fetch</span>
<span class="line">             * previous tuple; there should be one!  Note previous tuple must</span>
<span class="line">             * be in window.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>limitOption <span class="token operator">==</span> LIMIT_OPTION_WITH_TIES<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                    <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;LIMIT subplan failed to run backwards&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>subSlot <span class="token operator">=</span> slot<span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Backing up from window end: simply re-return the last tuple</span>
<span class="line">                 * fetched from the subplan.</span>
<span class="line">                 */</span></span>
<span class="line">                slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>subSlot<span class="token punctuation">;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">                <span class="token comment">/* position does not change &#39;cause we didn&#39;t advance it before */</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> LIMIT_WINDOWSTART<span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>direction<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Advancing after having backed off window start: simply</span>
<span class="line">             * re-return the last tuple fetched from the subplan.</span>
<span class="line">             */</span></span>
<span class="line">            slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>subSlot<span class="token punctuation">;</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>lstate <span class="token operator">=</span> LIMIT_INWINDOW<span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* position does not change &#39;cause we didn&#39;t change it before */</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;impossible LIMIT state: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>lstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            slot <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>        <span class="token comment">/* keep compiler quiet */</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Return the current tuple */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> slot<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution-end" tabindex="-1"><a class="header-anchor" href="#execution-end"><span>Execution End</span></a></h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用，主要是递归调用 <code>ExecEndNode()</code>，以及清理本节点中分配的表达式计算环境。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecEndLimit</span>
<span class="line"> *</span>
<span class="line"> *      This shuts down the subplan and frees resources allocated</span>
<span class="line"> *      to this node.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndLimit</span><span class="token punctuation">(</span>LimitState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,26)]))}const o=s(l,[["render",t],["__file","PostgreSQL Executor Limit.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Limit.html","title":"PostgreSQL - Executor: Limit","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Plan State","slug":"plan-state","link":"#plan-state","children":[]},{"level":2,"title":"Init Node","slug":"init-node","link":"#init-node","children":[]},{"level":2,"title":"Node Execution","slug":"node-execution","link":"#node-execution","children":[]},{"level":2,"title":"Execution End","slug":"execution-end","link":"#execution-end","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Limit.md"}');export{o as comp,u as data};
