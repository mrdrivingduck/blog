import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},i=e(`<h1 id="postgresql-executor-result" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-result" aria-hidden="true">#</a> PostgreSQL - Executor: Result</h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 04 16:41</p><p>Hangzhou, Zhejiang, China</p><hr><p>Result 节点的作用，概括来说用于承载表达式的执行结果。细分有两种用途：</p><ul><li>承载不需要进行表扫描的 SQL 语句执行结果</li><li>承载常量选择条件的执行结果，用于优化选择条件为常量的查询</li></ul><p>不用进行表扫描的 SQL 语句包括没有 <code>FROM</code> 的 <code>SELECT</code> 语句，或者带有 <code>VALUES</code> 的元组构造语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">select</span> <span class="token number">1</span> <span class="token operator">*</span> <span class="token number">2</span><span class="token punctuation">;</span>
<span class="token keyword">insert</span> <span class="token keyword">into</span> emp <span class="token keyword">values</span> <span class="token punctuation">(</span><span class="token string">&#39;mike&#39;</span><span class="token punctuation">,</span> <span class="token number">15000</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>查询条件为常量的查询。此时，表达式的结果只需要被计算一次：如果计算为假，那么相当于直接进行一次过滤，不再需要查询出每个元组之后再和查询条件进行判断了。</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">select</span> <span class="token operator">*</span> <span class="token keyword">from</span> emp <span class="token keyword">where</span> <span class="token number">2</span> <span class="token operator">&gt;</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*-------------------------------------------------------------------------
 *
 * nodeResult.c
 *    support for constant nodes needing special code.
 *
 * DESCRIPTION
 *
 *      Result nodes are used in queries where no relations are scanned.
 *      Examples of such queries are:
 *
 *              select 1 * 2
 *
 *              insert into emp values (&#39;mike&#39;, 15000)
 *
 *      (Remember that in an INSERT or UPDATE, we need a plan tree that
 *      generates the new rows.)
 *
 *      Result nodes are also used to optimise queries with constant
 *      qualifications (ie, quals that do not depend on the scanned data),
 *      such as:
 *
 *              select * from emp where 2 &gt; 1
 *
 *      In this case, the plan generated is
 *
 *                      Result  (with 2 &gt; 1 qual)
 *                      /
 *                 SeqScan (emp.*)
 *
 *      At runtime, the Result node evaluates the constant qual once,
 *      which is shown by EXPLAIN as a One-Time Filter.  If it&#39;s
 *      false, we can return an empty result set without running the
 *      controlled plan at all.  If it&#39;s true, we run the controlled
 *      plan normally and pass back the results.
 *
 *
 * Portions Copyright (c) 1996-2021, PostgreSQL Global Development Group
 * Portions Copyright (c) 1994, Regents of the University of California
 *
 * IDENTIFICATION
 *    src/backend/executor/nodeResult.c
 *
 *-------------------------------------------------------------------------
 */</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h2><p>Result 的计划节点定义如下。其中，扩展出的 <code>resconstantqual</code> 是只需要被计算一次的常量表达式。因为表达式的结果不被 <em>outer plan</em> (当前节点的左子树) 影响，所以只需要被计算一次即可。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   Result node -
 *      If no outer plan, evaluate a variable-free targetlist.
 *      If outer plan, return tuples from outer plan (after a level of
 *      projection as shown by targetlist).
 *
 * If resconstantqual isn&#39;t NULL, it represents a one-time qualification
 * test (i.e., one that doesn&#39;t depend on any variables from the outer plan,
 * so needs to be evaluated only once).
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Result</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
    Node       <span class="token operator">*</span>resconstantqual<span class="token punctuation">;</span>
<span class="token punctuation">}</span> Result<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下相应的 Plan State 结构体定义。其中扩展的字段包括：</p><ul><li><code>resconstantqual</code>：对常量表达式进行计算的 <code>ExprState</code> 结构</li><li><code>rs_checkqual</code>：指示是否需要对常量表达式进行计算</li><li><code>rs_done</code>：指示查询是否完成的标志位</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   ResultState information
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ResultState</span>
<span class="token punctuation">{</span>
    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    ExprState  <span class="token operator">*</span>resconstantqual<span class="token punctuation">;</span>
    bool        rs_done<span class="token punctuation">;</span>        <span class="token comment">/* are we done? */</span>
    bool        rs_checkqual<span class="token punctuation">;</span>   <span class="token comment">/* do we need to check the qual? */</span>
<span class="token punctuation">}</span> ResultState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization" aria-hidden="true">#</a> Initialization</h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。该函数分配 <code>ResultState</code> 结构体，然后填写结构体字段进行初始化。为左孩子节点递归调用 <code>ExecInitNode()</code> 进行初始化，右孩子节点必须为空 (优化器保证)。最终，还要对节点级别的选择条件调用 <code>ExecInitQual()</code> 分配 <code>ExprState</code> 结构。对于一般的节点来说，只需要为 <code>Plan</code> 结构中的 <code>qual</code> 分配空间就可以了；而对于 Result 节点来说，还需要对 <code>Result</code> 结构扩展的只执行一次的表达式 <code>resconstantqual</code> 分配 <code>ExprState</code>。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitResult
 *
 *      Creates the run-time state information for the result node
 *      produced by the planner and initializes outer relations
 *      (child nodes).
 * ----------------------------------------------------------------
 */</span>
ResultState <span class="token operator">*</span>
<span class="token function">ExecInitResult</span><span class="token punctuation">(</span>Result <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    ResultState <span class="token operator">*</span>resstate<span class="token punctuation">;</span>

    <span class="token comment">/* check for unsupported flags */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_MARK <span class="token operator">|</span> EXEC_FLAG_BACKWARD<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">||</span>
           <span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    resstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>ResultState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecResult<span class="token punctuation">;</span>

    resstate<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> false<span class="token punctuation">;</span>
    resstate<span class="token operator">-&gt;</span>rs_checkqual <span class="token operator">=</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>resconstantqual <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token operator">?</span> false <span class="token operator">:</span> true<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Miscellaneous initialization
     *
     * create expression context for node
     */</span>
    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child nodes
     */</span>
    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>resstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * we don&#39;t use inner plan
     */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">innerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result slot, type and projection.
     */</span>
    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">ExecAssignProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * initialize child expressions
     */</span>
    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span>
        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> resstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    resstate<span class="token operator">-&gt;</span>resconstantqual <span class="token operator">=</span>
        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span><span class="token punctuation">(</span>List <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>resconstantqual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> resstate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> resstate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution" aria-hidden="true">#</a> Execution</h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。首先判断一下 <code>rs_checkqual</code> 是否需要对常量表达式进行计算，如果需要，那么调用 <code>ExecQual()</code> 进行计算，然后将标志位 reset (下次就不需要重复计算了)。如果表达式的计算结果为 <code>false</code>，则直接从该节点结束 plan tree 的遍历：因为孩子节点中返回的元组必然不可能通过常量表达式的选择过滤条件，因此将 <code>rs_done</code> 设置为 <code>true</code> 然后返回 <code>NULL</code>。</p><p>如果常量表达式计算为 <code>true</code>，那么对左孩子节点递归调用 <code>ExecProcNode()</code> 获取元组，然后进行投影处理。直到没有元组可以从左孩子节点获取时，将 <code>rs_done</code> 设置为 <code>true</code>。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecResult(node)
 *
 *      returns the tuples from the outer plan which satisfy the
 *      qualification clause.  Since result nodes with right
 *      subtrees are never planned, we ignore the right subtree
 *      entirely (for now).. -cim 10/7/89
 *
 *      The qualification containing only constant clauses are
 *      checked first before any processing is done. It always returns
 *      &#39;nil&#39; if the constant qualification is not satisfied.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>
<span class="token function">ExecResult</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    ResultState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>ResultState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>outerTupleSlot<span class="token punctuation">;</span>
    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>
    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span>

    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span>

    <span class="token comment">/*
     * check constant qualifications like (2 &gt; 1), if not already done
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>rs_checkqual<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        bool        qualResult <span class="token operator">=</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>resconstantqual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>

        node<span class="token operator">-&gt;</span>rs_checkqual <span class="token operator">=</span> false<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>qualResult<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            node<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> true<span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * Reset per-tuple memory context to free any expression evaluation
     * storage allocated in the previous tuple cycle.
     */</span>
    <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * if rs_done is true then it means that we were asked to return a
     * constant tuple and we already did the last time ExecResult() was
     * called, OR that we failed the constant qual check. Either way, now we
     * are through.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>rs_done<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>outerPlan <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * retrieve tuples from the outer plan until there are no more.
             */</span>
            outerTupleSlot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerTupleSlot<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * prepare to compute projection expressions, which will expect to
             * access the input tuples as varno OUTER.
             */</span>
            econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> outerTupleSlot<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * if we don&#39;t have an outer plan, then we are just generating the
             * results from a constant target list.  Do it only once.
             */</span>
            node<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> true<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/* form the result tuple using ExecProject(), and return it */</span>
        <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="end" tabindex="-1"><a class="header-anchor" href="#end" aria-hidden="true">#</a> End</h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用，主要工作时清理本级 plan state 中的内存，然后对左孩子节点递归调用 <code>ExecEndNode()</code>：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndResult
 *
 *      frees up storage allocated through C routines
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndResult</span><span class="token punctuation">(</span>ResultState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Free the exprcontext
     */</span>
    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * clean out the tuple table
     */</span>
    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * shut down subplans
     */</span>
    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,28),l=[i];function o(c,p){return s(),a("div",null,l)}const d=n(t,[["render",o],["__file","PostgreSQL Executor Result.html.vue"]]);export{d as default};
