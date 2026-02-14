import{_ as s,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const p={};function i(t,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-result" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-result"><span>PostgreSQL - Executor: Result</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 04 16:41</p><p>Hangzhou, Zhejiang, China</p><hr><p>Result 节点的作用，概括来说用于承载表达式的执行结果。细分有两种用途：</p><ul><li>承载不需要进行表扫描的 SQL 语句执行结果</li><li>承载常量选择条件的执行结果，用于优化选择条件为常量的查询</li></ul><p>不用进行表扫描的 SQL 语句包括没有 <code>FROM</code> 的 <code>SELECT</code> 语句，或者带有 <code>VALUES</code> 的元组构造语句：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">select</span> <span class="token number">1</span> <span class="token operator">*</span> <span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">insert</span> <span class="token keyword">into</span> emp <span class="token keyword">values</span> <span class="token punctuation">(</span><span class="token string">&#39;mike&#39;</span><span class="token punctuation">,</span> <span class="token number">15000</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>查询条件为常量的查询。此时，表达式的结果只需要被计算一次：如果计算为假，那么相当于直接进行一次过滤，不再需要查询出每个元组之后再和查询条件进行判断了。</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">select</span> <span class="token operator">*</span> <span class="token keyword">from</span> emp <span class="token keyword">where</span> <span class="token number">2</span> <span class="token operator">&gt;</span> <span class="token number">1</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*-------------------------------------------------------------------------</span>
<span class="line"> *</span>
<span class="line"> * nodeResult.c</span>
<span class="line"> *    support for constant nodes needing special code.</span>
<span class="line"> *</span>
<span class="line"> * DESCRIPTION</span>
<span class="line"> *</span>
<span class="line"> *      Result nodes are used in queries where no relations are scanned.</span>
<span class="line"> *      Examples of such queries are:</span>
<span class="line"> *</span>
<span class="line"> *              select 1 * 2</span>
<span class="line"> *</span>
<span class="line"> *              insert into emp values (&#39;mike&#39;, 15000)</span>
<span class="line"> *</span>
<span class="line"> *      (Remember that in an INSERT or UPDATE, we need a plan tree that</span>
<span class="line"> *      generates the new rows.)</span>
<span class="line"> *</span>
<span class="line"> *      Result nodes are also used to optimise queries with constant</span>
<span class="line"> *      qualifications (ie, quals that do not depend on the scanned data),</span>
<span class="line"> *      such as:</span>
<span class="line"> *</span>
<span class="line"> *              select * from emp where 2 &gt; 1</span>
<span class="line"> *</span>
<span class="line"> *      In this case, the plan generated is</span>
<span class="line"> *</span>
<span class="line"> *                      Result  (with 2 &gt; 1 qual)</span>
<span class="line"> *                      /</span>
<span class="line"> *                 SeqScan (emp.*)</span>
<span class="line"> *</span>
<span class="line"> *      At runtime, the Result node evaluates the constant qual once,</span>
<span class="line"> *      which is shown by EXPLAIN as a One-Time Filter.  If it&#39;s</span>
<span class="line"> *      false, we can return an empty result set without running the</span>
<span class="line"> *      controlled plan at all.  If it&#39;s true, we run the controlled</span>
<span class="line"> *      plan normally and pass back the results.</span>
<span class="line"> *</span>
<span class="line"> *</span>
<span class="line"> * Portions Copyright (c) 1996-2021, PostgreSQL Global Development Group</span>
<span class="line"> * Portions Copyright (c) 1994, Regents of the University of California</span>
<span class="line"> *</span>
<span class="line"> * IDENTIFICATION</span>
<span class="line"> *    src/backend/executor/nodeResult.c</span>
<span class="line"> *</span>
<span class="line"> *-------------------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p>Result 的计划节点定义如下。其中，扩展出的 <code>resconstantqual</code> 是只需要被计算一次的常量表达式。因为表达式的结果不被 <em>outer plan</em> (当前节点的左子树) 影响，所以只需要被计算一次即可。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   Result node -</span>
<span class="line"> *      If no outer plan, evaluate a variable-free targetlist.</span>
<span class="line"> *      If outer plan, return tuples from outer plan (after a level of</span>
<span class="line"> *      projection as shown by targetlist).</span>
<span class="line"> *</span>
<span class="line"> * If resconstantqual isn&#39;t NULL, it represents a one-time qualification</span>
<span class="line"> * test (i.e., one that doesn&#39;t depend on any variables from the outer plan,</span>
<span class="line"> * so needs to be evaluated only once).</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Result</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    Node       <span class="token operator">*</span>resconstantqual<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Result<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下相应的 Plan State 结构体定义。其中扩展的字段包括：</p><ul><li><code>resconstantqual</code>：对常量表达式进行计算的 <code>ExprState</code> 结构</li><li><code>rs_checkqual</code>：指示是否需要对常量表达式进行计算</li><li><code>rs_done</code>：指示查询是否完成的标志位</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   ResultState information</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ResultState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>resconstantqual<span class="token punctuation">;</span></span>
<span class="line">    bool        rs_done<span class="token punctuation">;</span>        <span class="token comment">/* are we done? */</span></span>
<span class="line">    bool        rs_checkqual<span class="token punctuation">;</span>   <span class="token comment">/* do we need to check the qual? */</span></span>
<span class="line"><span class="token punctuation">}</span> ResultState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。该函数分配 <code>ResultState</code> 结构体，然后填写结构体字段进行初始化。为左孩子节点递归调用 <code>ExecInitNode()</code> 进行初始化，右孩子节点必须为空 (优化器保证)。最终，还要对节点级别的选择条件调用 <code>ExecInitQual()</code> 分配 <code>ExprState</code> 结构。对于一般的节点来说，只需要为 <code>Plan</code> 结构中的 <code>qual</code> 分配空间就可以了；而对于 Result 节点来说，还需要对 <code>Result</code> 结构扩展的只执行一次的表达式 <code>resconstantqual</code> 分配 <code>ExprState</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInitResult</span>
<span class="line"> *</span>
<span class="line"> *      Creates the run-time state information for the result node</span>
<span class="line"> *      produced by the planner and initializes outer relations</span>
<span class="line"> *      (child nodes).</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">ResultState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitResult</span><span class="token punctuation">(</span>Result <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ResultState <span class="token operator">*</span>resstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* check for unsupported flags */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_MARK <span class="token operator">|</span> EXEC_FLAG_BACKWARD<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">||</span></span>
<span class="line">           <span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create state structure</span>
<span class="line">     */</span></span>
<span class="line">    resstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>ResultState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecResult<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>rs_checkqual <span class="token operator">=</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>resconstantqual <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token operator">?</span> false <span class="token operator">:</span> true<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Miscellaneous initialization</span>
<span class="line">     *</span>
<span class="line">     * create expression context for node</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child nodes</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>resstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * we don&#39;t use inner plan</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">innerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize result slot, type and projection.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecAssignProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child expressions</span>
<span class="line">     */</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span></span>
<span class="line">        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> resstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    resstate<span class="token operator">-&gt;</span>resconstantqual <span class="token operator">=</span></span>
<span class="line">        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span><span class="token punctuation">(</span>List <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>resconstantqual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> resstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> resstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution"><span>Execution</span></a></h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。首先判断一下 <code>rs_checkqual</code> 是否需要对常量表达式进行计算，如果需要，那么调用 <code>ExecQual()</code> 进行计算，然后将标志位 reset (下次就不需要重复计算了)。如果表达式的计算结果为 <code>false</code>，则直接从该节点结束 plan tree 的遍历：因为孩子节点中返回的元组必然不可能通过常量表达式的选择过滤条件，因此将 <code>rs_done</code> 设置为 <code>true</code> 然后返回 <code>NULL</code>。</p><p>如果常量表达式计算为 <code>true</code>，那么对左孩子节点递归调用 <code>ExecProcNode()</code> 获取元组，然后进行投影处理。直到没有元组可以从左孩子节点获取时，将 <code>rs_done</code> 设置为 <code>true</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecResult(node)</span>
<span class="line"> *</span>
<span class="line"> *      returns the tuples from the outer plan which satisfy the</span>
<span class="line"> *      qualification clause.  Since result nodes with right</span>
<span class="line"> *      subtrees are never planned, we ignore the right subtree</span>
<span class="line"> *      entirely (for now).. -cim 10/7/89</span>
<span class="line"> *</span>
<span class="line"> *      The qualification containing only constant clauses are</span>
<span class="line"> *      checked first before any processing is done. It always returns</span>
<span class="line"> *      &#39;nil&#39; if the constant qualification is not satisfied.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecResult</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ResultState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>ResultState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>outerTupleSlot<span class="token punctuation">;</span></span>
<span class="line">    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span></span>
<span class="line">    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * check constant qualifications like (2 &gt; 1), if not already done</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>rs_checkqual<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        bool        qualResult <span class="token operator">=</span> <span class="token function">ExecQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>resconstantqual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        node<span class="token operator">-&gt;</span>rs_checkqual <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>qualResult<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Reset per-tuple memory context to free any expression evaluation</span>
<span class="line">     * storage allocated in the previous tuple cycle.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ResetExprContext</span><span class="token punctuation">(</span>econtext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * if rs_done is true then it means that we were asked to return a</span>
<span class="line">     * constant tuple and we already did the last time ExecResult() was</span>
<span class="line">     * called, OR that we failed the constant qual check. Either way, now we</span>
<span class="line">     * are through.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>rs_done<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>outerPlan <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * retrieve tuples from the outer plan until there are no more.</span>
<span class="line">             */</span></span>
<span class="line">            outerTupleSlot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerTupleSlot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * prepare to compute projection expressions, which will expect to</span>
<span class="line">             * access the input tuples as varno OUTER.</span>
<span class="line">             */</span></span>
<span class="line">            econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> outerTupleSlot<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * if we don&#39;t have an outer plan, then we are just generating the</span>
<span class="line">             * results from a constant target list.  Do it only once.</span>
<span class="line">             */</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>rs_done <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* form the result tuple using ExecProject(), and return it */</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="end" tabindex="-1"><a class="header-anchor" href="#end"><span>End</span></a></h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用，主要工作时清理本级 plan state 中的内存，然后对左孩子节点递归调用 <code>ExecEndNode()</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecEndResult</span>
<span class="line"> *</span>
<span class="line"> *      frees up storage allocated through C routines</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndResult</span><span class="token punctuation">(</span>ResultState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Free the exprcontext</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * clean out the tuple table</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * shut down subplans</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,28)]))}const o=s(p,[["render",i],["__file","PostgreSQL Executor Result.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Result.html","title":"PostgreSQL - Executor: Result","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":2,"title":"Execution","slug":"execution","link":"#execution","children":[]},{"level":2,"title":"End","slug":"end","link":"#end","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Result.md"}');export{o as comp,u as data};
