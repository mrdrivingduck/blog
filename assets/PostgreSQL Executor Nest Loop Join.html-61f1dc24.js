import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},i=e(`<h1 id="postgresql-executor-nest-loop-join" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-nest-loop-join" aria-hidden="true">#</a> PostgreSQL - Executor: Nest Loop Join</h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 09 22:25</p><p>Hangzhou, Zhejiang, China</p><hr><p>实现关系代数中的连接操作。连接分为逻辑上的和物理上的，逻辑上的连接可以由物理上的连接来实现，每种物理连接都有其可以实现的逻辑连接类型。</p><h2 id="逻辑连接" tabindex="-1"><a class="header-anchor" href="#逻辑连接" aria-hidden="true">#</a> 逻辑连接</h2><p>PostgreSQL 中已经定义了如下几种逻辑 join 类型：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * JoinType -
 *    enums for types of relation joins
 *
 * JoinType determines the exact semantics of joining two relations using
 * a matching qualification.  For example, it tells what to do with a tuple
 * that has no match in the other relation.
 *
 * This is needed in both parsenodes.h and plannodes.h, so put it here...
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">JoinType</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * The canonical kinds of joins according to the SQL JOIN syntax. Only
     * these codes can appear in parser output (e.g., JoinExpr nodes).
     */</span>
    JOIN_INNER<span class="token punctuation">,</span>                 <span class="token comment">/* matching tuple pairs only */</span>
    JOIN_LEFT<span class="token punctuation">,</span>                  <span class="token comment">/* pairs + unmatched LHS tuples */</span>
    JOIN_FULL<span class="token punctuation">,</span>                  <span class="token comment">/* pairs + unmatched LHS + unmatched RHS */</span>
    JOIN_RIGHT<span class="token punctuation">,</span>                 <span class="token comment">/* pairs + unmatched RHS tuples */</span>

    <span class="token comment">/*
     * Semijoins and anti-semijoins (as defined in relational theory) do not
     * appear in the SQL JOIN syntax, but there are standard idioms for
     * representing them (e.g., using EXISTS).  The planner recognizes these
     * cases and converts them to joins.  So the planner and executor must
     * support these codes.  NOTE: in JOIN_SEMI output, it is unspecified
     * which matching RHS row is joined to.  In JOIN_ANTI output, the row is
     * guaranteed to be null-extended.
     */</span>
    JOIN_SEMI<span class="token punctuation">,</span>                  <span class="token comment">/* 1 copy of each LHS row that has match(es) */</span>
    JOIN_ANTI<span class="token punctuation">,</span>                  <span class="token comment">/* 1 copy of each LHS row that has no match */</span>

    <span class="token comment">/*
     * These codes are used internally in the planner, but are not supported
     * by the executor (nor, indeed, by most of the planner).
     */</span>
    JOIN_UNIQUE_OUTER<span class="token punctuation">,</span>          <span class="token comment">/* LHS path must be made unique */</span>
    JOIN_UNIQUE_INNER           <span class="token comment">/* RHS path must be made unique */</span>

    <span class="token comment">/*
     * We might need additional join types someday.
     */</span>
<span class="token punctuation">}</span> JoinType<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以 T1 JOIN T2 为例 (T1 为左，T2 为右)：</p><ul><li>Inner join：内连接，T1 中所有元组与 T2 中 <strong>满足条件的元组</strong> 连接</li><li>Left (outer) join：在内连接基础上，为找不到可连接 T2 元组的 T1 元组，用一个空元组连接</li><li>Right (outer) join：在内连接基础上，为找不到可连接 T1 元组的 T2 元组，用一个空元组连接</li><li>Full (outer) join：在内连接基础上，为找不到可连接的 T1/T2 元组，用一个空元组连接</li><li>Semi join：当 T1 元组能够在 T2 中找到一个满足连接条件的元组时，返回 T1 元组，不连接，用于实现 <code>EXISTS</code></li><li>Anti join：当 T1 元组不能在 T2 中找到一个满足连接条件的元组时，返回 T1 元组与空元组的连接，用于实现 <code>NOT EXISTS</code></li></ul><h2 id="物理连接" tabindex="-1"><a class="header-anchor" href="#物理连接" aria-hidden="true">#</a> 物理连接</h2><p>在 PostgreSQL 中，实现了以下三种物理 join 操作：</p><ul><li>Nest loop join：嵌套循环连接</li><li>Merge join：归并连接，能够实现上述所有逻辑连接</li><li>Hash join：哈希连接</li></ul><p>除了归并连接，其它连接只能实现内连接、左外连接、半连接和反连接。</p><h2 id="super-plan-node" tabindex="-1"><a class="header-anchor" href="#super-plan-node" aria-hidden="true">#</a> Super Plan Node</h2><p>Join 也对应一个计划节点，继承自 <code>Plan</code> 结构体。由于 join 操作涉及两个关系，显然节点的左右孩子都会被使用到。<code>Join</code> 节点的结构体定义如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      Join node
 *
 * jointype:    rule for joining tuples from left and right subtrees
 * inner_unique each outer tuple can match to no more than one inner tuple
 * joinqual:    qual conditions that came from JOIN/ON or JOIN/USING
 *              (plan.qual contains conditions that came from WHERE)
 *
 * When jointype is INNER, joinqual and plan.qual are semantically
 * interchangeable.  For OUTER jointypes, the two are *not* interchangeable;
 * only joinqual is used to determine whether a match has been found for
 * the purpose of deciding whether to generate null-extended tuples.
 * (But plan.qual is still applied before actually returning a tuple.)
 * For an outer join, only joinquals are allowed to be used as the merge
 * or hash condition of a merge or hash join.
 *
 * inner_unique is set if the joinquals are such that no more than one inner
 * tuple could match any given outer tuple.  This allows the executor to
 * skip searching for additional matches.  (This must be provable from just
 * the joinquals, ignoring plan.qual, due to where the executor tests it.)
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Join</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
    JoinType    jointype<span class="token punctuation">;</span>
    bool        inner_unique<span class="token punctuation">;</span>
    List       <span class="token operator">*</span>joinqual<span class="token punctuation">;</span>       <span class="token comment">/* JOIN quals (in addition to plan.qual) */</span>
<span class="token punctuation">}</span> Join<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中：</p><ul><li><code>jointype</code> 指示连接类型</li><li><code>inner_unique</code> 指示只有一个内元组会和外元组匹配 (执行器可以根据这个标志快速结束一轮内循环)</li><li><code>joinqual</code> 是除了计划节点的选择条件以外的选择条件，主要在外连接中被用到</li></ul><h2 id="super-plan-state" tabindex="-1"><a class="header-anchor" href="#super-plan-state" aria-hidden="true">#</a> Super Plan State</h2><p>Join 节点的 plan state 也继承自 <code>PlanState</code> 结构，里面的内容基本上是 <code>Join</code> 结构体的复制：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   JoinState information
 *
 *      Superclass for state nodes of join plans.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">JoinState</span>
<span class="token punctuation">{</span>
    PlanState   ps<span class="token punctuation">;</span>
    JoinType    jointype<span class="token punctuation">;</span>
    bool        single_match<span class="token punctuation">;</span>   <span class="token comment">/* True if we should skip to next outer tuple
                                 * after finding one inner match */</span>
    ExprState  <span class="token operator">*</span>joinqual<span class="token punctuation">;</span>       <span class="token comment">/* JOIN quals (in addition to ps.qual) */</span>
<span class="token punctuation">}</span> JoinState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="nest-loop-join" tabindex="-1"><a class="header-anchor" href="#nest-loop-join" aria-hidden="true">#</a> Nest Loop Join</h2><p>看看最经典的嵌套循环连接是怎么实现的。抽象来说，嵌套循环连接类似一个双层循环，左关系为外层循环条件，右关系为内层循环条件。具体如何实现内连接/左外连接等，需要看代码。</p><h3 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h3><p>首先观察嵌套循环连接的计划节点结构。除了扩展了一个参数以外，完全继承自 <code>Join</code> 结构：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      nest loop join node
 *
 * The nestParams list identifies any executor Params that must be passed
 * into execution of the inner subplan carrying values from the current row
 * of the outer subplan.  Currently we restrict these values to be simple
 * Vars, but perhaps someday that&#39;d be worth relaxing.  (Note: during plan
 * creation, the paramval can actually be a PlaceHolderVar expression; but it
 * must be a Var with varno OUTER_VAR by the time it gets to the executor.)
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">NestLoop</span>
<span class="token punctuation">{</span>
    Join        join<span class="token punctuation">;</span>
    List       <span class="token operator">*</span>nestParams<span class="token punctuation">;</span>     <span class="token comment">/* list of NestLoopParam nodes */</span>
<span class="token punctuation">}</span> NestLoop<span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">NestLoopParam</span>
<span class="token punctuation">{</span>
    NodeTag     type<span class="token punctuation">;</span>
    <span class="token keyword">int</span>         paramno<span class="token punctuation">;</span>        <span class="token comment">/* number of the PARAM_EXEC Param to set */</span>
    Var        <span class="token operator">*</span>paramval<span class="token punctuation">;</span>       <span class="token comment">/* outer-relation Var to assign to Param */</span>
<span class="token punctuation">}</span> NestLoopParam<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中扩展的 <code>nestParams</code> 链表是目前外层循环的元组传递给内层循环的执行器参数。</p><h3 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state" aria-hidden="true">#</a> Plan State</h3><p>嵌套循环连接的 plan state 定义如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   NestLoopState information
 *
 *      NeedNewOuter       true if need new outer tuple on next call
 *      MatchedOuter       true if found a join match for current outer tuple
 *      NullInnerTupleSlot prepared null tuple for left outer joins
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">NestLoopState</span>
<span class="token punctuation">{</span>
    JoinState   js<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    bool        nl_NeedNewOuter<span class="token punctuation">;</span>
    bool        nl_MatchedOuter<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>nl_NullInnerTupleSlot<span class="token punctuation">;</span>
<span class="token punctuation">}</span> NestLoopState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>扩展的字段含义如下：</p><ul><li><code>nl_NeedNewOuter</code> 指示是否需要下一个外层循环元组 (即内层循环是否结束)</li><li><code>nl_MatchedOuter</code> 指示是否找到了一个与当前外层循环元组匹配的内层循环元组</li><li><code>nl_NullInnerTupleSlot</code> 是为左外连接准备的空元组</li></ul><h3 id="executor-initialization" tabindex="-1"><a class="header-anchor" href="#executor-initialization" aria-hidden="true">#</a> Executor Initialization</h3><p>在 <code>ExecInitNode()</code> 生命周期中调用 <code>ExecInitNestLoop</code>。与大部分计划节点初始化的套路一致：</p><ol><li>首先构造一个 <code>NestLoopState</code> 节点，为 plan state 节点设置好执行回调函数</li><li>为节点创建表达式上下文</li><li>分别为左右孩子节点 (join 两侧的 relation) 递归调用 <code>ExecInitNode()</code></li><li>初始化返回元组槽，初始化投影信息</li><li>初始化选择条件 (包括节点自己的和 join 中扩展的)</li><li>在 plan state 中设置 join 类型</li><li>根据 join 类型，设置 plan state 中的 <code>single_match</code></li><li>根据 join 类型，对左外连接和反连接，初始化用于 join 的空元组</li><li>初始化 <code>nl_NeedNewOuter</code> 和 <code>nl_MatchedOuter</code> 为连接开始前的初始状态 (需要获取第一个外层元组，外层元组还未找到一个匹配的内层元组)</li></ol><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitNestLoop
 * ----------------------------------------------------------------
 */</span>
NestLoopState <span class="token operator">*</span>
<span class="token function">ExecInitNestLoop</span><span class="token punctuation">(</span>NestLoop <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    NestLoopState <span class="token operator">*</span>nlstate<span class="token punctuation">;</span>

    <span class="token comment">/* check for unsupported flags */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_BACKWARD <span class="token operator">|</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token function">NL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecInitNestLoop: %s\\n&quot;</span><span class="token punctuation">,</span>
               <span class="token string">&quot;initializing node&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    nlstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>NestLoopState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecNestLoop<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Miscellaneous initialization
     *
     * create expression context for node
     */</span>
    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child nodes
     *
     * If we have no parameters to pass into the inner rel from the outer,
     * tell the inner child that cheap rescans would be good.  If we do have
     * such parameters, then there is no point in REWIND support at all in the
     * inner child, because it will always be rescanned with fresh parameter
     * values.
     */</span>
    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>nlstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>nestParams <span class="token operator">==</span> NIL<span class="token punctuation">)</span>
        eflags <span class="token operator">|=</span> EXEC_FLAG_REWIND<span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        eflags <span class="token operator">&amp;=</span> <span class="token operator">~</span>EXEC_FLAG_REWIND<span class="token punctuation">;</span>
    <span class="token function">innerPlanState</span><span class="token punctuation">(</span>nlstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">innerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result slot, type and projection.
     */</span>
    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecAssignProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child expressions
     */</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span>
        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> nlstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>jointype <span class="token operator">=</span> node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>jointype<span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>joinqual <span class="token operator">=</span>
        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>joinqual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> nlstate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * detect whether we need only consider the first matching inner tuple
     */</span>
    nlstate<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>single_match <span class="token operator">=</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>inner_unique <span class="token operator">||</span>
                                node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>jointype <span class="token operator">==</span> JOIN_SEMI<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* set up null tuples for outer joins, if needed */</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>jointype<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">case</span> JOIN_INNER<span class="token operator">:</span>
        <span class="token keyword">case</span> JOIN_SEMI<span class="token operator">:</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token keyword">case</span> JOIN_LEFT<span class="token operator">:</span>
        <span class="token keyword">case</span> JOIN_ANTI<span class="token operator">:</span>
            nlstate<span class="token operator">-&gt;</span>nl_NullInnerTupleSlot <span class="token operator">=</span>
                <span class="token function">ExecInitNullTupleSlot</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span>
                                      <span class="token function">ExecGetResultType</span><span class="token punctuation">(</span><span class="token function">innerPlanState</span><span class="token punctuation">(</span>nlstate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                                      <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token keyword">default</span><span class="token operator">:</span>
            <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized join type: %d&quot;</span><span class="token punctuation">,</span>
                 <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>join<span class="token punctuation">.</span>jointype<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * finally, wipe the current outer tuple clean.
     */</span>
    nlstate<span class="token operator">-&gt;</span>nl_NeedNewOuter <span class="token operator">=</span> true<span class="token punctuation">;</span>
    nlstate<span class="token operator">-&gt;</span>nl_MatchedOuter <span class="token operator">=</span> false<span class="token punctuation">;</span>

    <span class="token function">NL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecInitNestLoop: %s\\n&quot;</span><span class="token punctuation">,</span>
               <span class="token string">&quot;node initialized&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> nlstate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="execution" tabindex="-1"><a class="header-anchor" href="#execution" aria-hidden="true">#</a> Execution</h3><p>在 <code>ExecProcNode()</code> 生命周期中调用 <code>ExecNestLoop()</code>。其核心是一个死循环，在循环内：</p><ol><li>如果需要，首先对左孩子递归调用 <code>ExecProcNode()</code> 获取一个外层循环元组</li><li>设置好暂不需要外层元组的标志，将外层循环的参数传入内层元组</li><li>开始对右孩子递归调用 <code>ExecProcNode()</code> 获取一个内层循环元组 <ol><li>如果内层循环元组为空，那么说明内层循环结束，需要外层循环的前进到下一个元组了；但需要查看一下外层循环元组是否匹配过内层循环元组，如果没有，且连接类型为左外连接或反连接，那么就将空元组作为内层循环元组与外层循环元组做一次 join，如果能够通过 plan node 的选择条件，就投影并返回</li><li>如果内层循环元组不为空，那么判断是否通过 <code>Join</code> 结构中定义的选择条件，如果通过则找到了一对可以 join 的内外层元组 <ol><li>设置外层循环元组的 <code>nl_MatchedOuter</code> 为 <code>true</code> (已被内层循环元组匹配过)</li><li>如果是 anti join，由于外层循环元组已经被成功匹配，因此外层循环可以推进到下一个元组了 <blockquote><p>它很怨妇，希望外层循环最好永远别被匹配，既然匹配上了那就还是向前看吧</p></blockquote></li><li>如果 join 被设置为 <code>single_match</code>，那么剩余内层循环元组也不需要被扫描了，直接快进到下一个外层循环元组 <blockquote><p>相亲，一人只能找一个老婆，这位男士和女嘉宾牵手成功，那么剩下的女嘉宾也不必考虑了</p></blockquote></li><li>如果能够通过 plan node 中的选择条件，则投影并返回</li></ol></li></ol></li></ol><p>循环结束，两个关系中的所有元组都被 join 完毕。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecNestLoop(node)
 *
 * old comments
 *      Returns the tuple joined from inner and outer tuples which
 *      satisfies the qualification clause.
 *
 *      It scans the inner relation to join with current outer tuple.
 *
 *      If none is found, next tuple from the outer relation is retrieved
 *      and the inner relation is scanned from the beginning again to join
 *      with the outer tuple.
 *
 *      NULL is returned if all the remaining outer tuples are tried and
 *      all fail to join with the inner tuples.
 *
 *      NULL is also returned if there is no tuple from inner relation.
 *
 *      Conditions:
 *        -- outerTuple contains current tuple from outer relation and
 *           the right son(inner relation) maintains &quot;cursor&quot; at the tuple
 *           returned previously.
 *              This is achieved by maintaining a scan position on the outer
 *              relation.
 *
 *      Initial States:
 *        -- the outer child and the inner child
 *             are prepared to return the first tuple.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>
<span class="token function">ExecNestLoop</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    NestLoopState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>NestLoopState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    NestLoop   <span class="token operator">*</span>nl<span class="token punctuation">;</span>
    PlanState  <span class="token operator">*</span>innerPlan<span class="token punctuation">;</span>
    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>outerTupleSlot<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>innerTupleSlot<span class="token punctuation">;</span>
    ExprState  <span class="token operator">*</span>joinqual<span class="token punctuation">;</span>
    ExprState  <span class="token operator">*</span>otherqual<span class="token punctuation">;</span>
    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span>
    ListCell   <span class="token operator">*</span>lc<span class="token punctuation">;</span>

    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * get information from the node
     */</span>
    <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;getting info from node&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    nl <span class="token operator">=</span> <span class="token punctuation">(</span>NestLoop <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan<span class="token punctuation">;</span>
    joinqual <span class="token operator">=</span> node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>joinqual<span class="token punctuation">;</span>
    otherqual <span class="token operator">=</span> node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual<span class="token punctuation">;</span>
    outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    innerPlan <span class="token operator">=</span> <span class="token function">innerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Reset per-tuple memory context to free any expression evaluation
     * storage allocated in the previous tuple cycle.
     */</span>
    <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Ok, everything is setup for the join so now loop until we return a
     * qualifying join tuple.
     */</span>
    <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;entering main loop&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * If we don&#39;t have an outer tuple, get the next one and reset the
         * inner scan.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>nl_NeedNewOuter<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;getting new outer tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            outerTupleSlot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * if there are no more outer tuples, then the join is complete..
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerTupleSlot<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;no outer tuple, ending join&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;saving new outer tuple information&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> outerTupleSlot<span class="token punctuation">;</span>
            node<span class="token operator">-&gt;</span>nl_NeedNewOuter <span class="token operator">=</span> false<span class="token punctuation">;</span>
            node<span class="token operator">-&gt;</span>nl_MatchedOuter <span class="token operator">=</span> false<span class="token punctuation">;</span>

            <span class="token comment">/*
             * fetch the values of any outer Vars that must be passed to the
             * inner scan, and store them in the appropriate PARAM_EXEC slots.
             */</span>
            <span class="token function">foreach</span><span class="token punctuation">(</span>lc<span class="token punctuation">,</span> nl<span class="token operator">-&gt;</span>nestParams<span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                NestLoopParam <span class="token operator">*</span>nlp <span class="token operator">=</span> <span class="token punctuation">(</span>NestLoopParam <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">lfirst</span><span class="token punctuation">(</span>lc<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">int</span>         paramno <span class="token operator">=</span> nlp<span class="token operator">-&gt;</span>paramno<span class="token punctuation">;</span>
                ParamExecData <span class="token operator">*</span>prm<span class="token punctuation">;</span>

                prm <span class="token operator">=</span> <span class="token operator">&amp;</span><span class="token punctuation">(</span>econtext<span class="token operator">-&gt;</span>ecxt_param_exec_vals<span class="token punctuation">[</span>paramno<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token comment">/* Param value should be an OUTER_VAR var */</span>
                <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">IsA</span><span class="token punctuation">(</span>nlp<span class="token operator">-&gt;</span>paramval<span class="token punctuation">,</span> Var<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token function">Assert</span><span class="token punctuation">(</span>nlp<span class="token operator">-&gt;</span>paramval<span class="token operator">-&gt;</span>varno <span class="token operator">==</span> OUTER_VAR<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token function">Assert</span><span class="token punctuation">(</span>nlp<span class="token operator">-&gt;</span>paramval<span class="token operator">-&gt;</span>varattno <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                prm<span class="token operator">-&gt;</span>value <span class="token operator">=</span> <span class="token function">slot_getattr</span><span class="token punctuation">(</span>outerTupleSlot<span class="token punctuation">,</span>
                                          nlp<span class="token operator">-&gt;</span>paramval<span class="token operator">-&gt;</span>varattno<span class="token punctuation">,</span>
                                          <span class="token operator">&amp;</span><span class="token punctuation">(</span>prm<span class="token operator">-&gt;</span>isnull<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token comment">/* Flag parameter value as changed */</span>
                innerPlan<span class="token operator">-&gt;</span>chgParam <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span>innerPlan<span class="token operator">-&gt;</span>chgParam<span class="token punctuation">,</span>
                                                     paramno<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/*
             * now rescan the inner plan
             */</span>
            <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;rescanning inner plan&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">ExecReScan</span><span class="token punctuation">(</span>innerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/*
         * we have an outerTuple, try to get the next inner tuple.
         */</span>
        <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;getting new inner tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        innerTupleSlot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>innerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
        econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> innerTupleSlot<span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>innerTupleSlot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;no inner tuple, need new outer tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            node<span class="token operator">-&gt;</span>nl_NeedNewOuter <span class="token operator">=</span> true<span class="token punctuation">;</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>nl_MatchedOuter <span class="token operator">&amp;&amp;</span>
                <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>jointype <span class="token operator">==</span> JOIN_LEFT <span class="token operator">||</span>
                 node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>jointype <span class="token operator">==</span> JOIN_ANTI<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * We are doing an outer join and there were no join matches
                 * for this outer tuple.  Generate a fake join tuple with
                 * nulls for the inner tuple, and return it if it passes the
                 * non-join quals.
                 */</span>
                econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> node<span class="token operator">-&gt;</span>nl_NullInnerTupleSlot<span class="token punctuation">;</span>

                <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;testing qualification for outer-join tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                <span class="token keyword">if</span> <span class="token punctuation">(</span>otherqual <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>otherqual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">{</span>
                    <span class="token comment">/*
                     * qualification was satisfied so we project and return
                     * the slot containing the result tuple using
                     * ExecProject().
                     */</span>
                    <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;qualification succeeded, projecting tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                    <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">else</span>
                    <span class="token function">InstrCountFiltered2</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/*
             * Otherwise just return to top of loop for a new outer tuple.
             */</span>
            <span class="token keyword">continue</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/*
         * at this point we have a new pair of inner and outer tuples so we
         * test the inner and outer tuples to see if they satisfy the node&#39;s
         * qualification.
         *
         * Only the joinquals determine MatchedOuter status, but all quals
         * must pass to actually return the tuple.
         */</span>
        <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;testing qualification&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecQual</span><span class="token punctuation">(</span>joinqual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            node<span class="token operator">-&gt;</span>nl_MatchedOuter <span class="token operator">=</span> true<span class="token punctuation">;</span>

            <span class="token comment">/* In an antijoin, we never return a matched tuple */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>jointype <span class="token operator">==</span> JOIN_ANTI<span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                node<span class="token operator">-&gt;</span>nl_NeedNewOuter <span class="token operator">=</span> true<span class="token punctuation">;</span>
                <span class="token keyword">continue</span><span class="token punctuation">;</span>       <span class="token comment">/* return to top of loop */</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/*
             * If we only need to join to the first matching inner tuple, then
             * consider returning this one, but after that continue with next
             * outer tuple.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>single_match<span class="token punctuation">)</span>
                node<span class="token operator">-&gt;</span>nl_NeedNewOuter <span class="token operator">=</span> true<span class="token punctuation">;</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span>otherqual <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>otherqual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/*
                 * qualification was satisfied so we project and return the
                 * slot containing the result tuple using ExecProject().
                 */</span>
                <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;qualification succeeded, projecting tuple&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
                <span class="token function">InstrCountFiltered2</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span>
            <span class="token function">InstrCountFiltered1</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Tuple fails qual, so free per-tuple memory and try again.
         */</span>
        <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token function">ENL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;qualification failed, looping&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="executor-end" tabindex="-1"><a class="header-anchor" href="#executor-end" aria-hidden="true">#</a> Executor End</h3><p>在 <code>ExecEndNode()</code> 生命周期中被调用，主要做一些清理工作。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndNestLoop
 *
 *      closes down scans and frees allocated storage
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndNestLoop</span><span class="token punctuation">(</span>NestLoopState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token function">NL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecEndNestLoop: %s\\n&quot;</span><span class="token punctuation">,</span>
               <span class="token string">&quot;ending node processing&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Free the exprcontext
     */</span>
    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * clean out the tuple table
     */</span>
    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>js<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * close down subplans
     */</span>
    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">innerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token function">NL1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecEndNestLoop: %s\\n&quot;</span><span class="token punctuation">,</span>
               <span class="token string">&quot;node processing ended&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="思考" tabindex="-1"><a class="header-anchor" href="#思考" aria-hidden="true">#</a> 思考</h2><p>为什么嵌套循环连接不能实现 right outer join 和 full outer join 呢？这是它固有的实现决定的。由于左关系在外层循环，右关系在内层循环，左关系重复扫描右关系，因此左连接元组的所有扫描是连续的、stateful 的，可以获知左连接元组是否在右关系中找到了匹配元组；而右连接元组的所有扫描是离散的、stateless 的，不可获知右连接元组是否与左关系存在匹配 (除非用额外的空间记录？)。</p>`,49),o=[i];function p(l,c){return s(),a("div",null,o)}const r=n(t,[["render",p],["__file","PostgreSQL Executor Nest Loop Join.html.vue"]]);export{r as default};
