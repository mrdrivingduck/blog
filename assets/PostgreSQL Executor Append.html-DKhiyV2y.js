import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function t(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-append" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-append"><span>PostgreSQL - Executor: Append</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 04 15:18</p><p>Hangzhou, Zhejiang, China</p><hr><p>Append 节点包含一个需要被迭代处理的 <strong>一个或多个子计划</strong> 的链表。根据注释说明，Append 节点会从链表中的每个子计划里获取元组，直到没有元组可以获得，然后处理下一个子计划。因此，Append 节点可用于处理 <strong>union</strong> 查询，比如继承表的查询：查询父表时，会生成顺带查询所有继承子表的查询计划，那么查询父表和子表的子计划都会被放到 Append 节点的链表中。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* INTERFACE ROUTINES</span>
<span class="line"> *      ExecInitAppend  - initialize the append node</span>
<span class="line"> *      ExecAppend      - retrieve the next tuple from the node</span>
<span class="line"> *      ExecEndAppend   - shut down the append node</span>
<span class="line"> *      ExecReScanAppend - rescan the append node</span>
<span class="line"> *</span>
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
<span class="line"> *</span>
<span class="line"> *      Append nodes are currently used for unions, and to support</span>
<span class="line"> *      inheritance queries, where several relations need to be scanned.</span>
<span class="line"> *      For example, in our standard person/student/employee/student-emp</span>
<span class="line"> *      example, where student and employee inherit from person</span>
<span class="line"> *      and student-emp inherits from student and employee, the</span>
<span class="line"> *      query:</span>
<span class="line"> *</span>
<span class="line"> *              select name from person</span>
<span class="line"> *</span>
<span class="line"> *      generates the plan:</span>
<span class="line"> *</span>
<span class="line"> *                |</span>
<span class="line"> *              Append -------+-------+--------+--------+</span>
<span class="line"> *              /   \\         |       |        |        |</span>
<span class="line"> *            nil   nil      Scan    Scan     Scan     Scan</span>
<span class="line"> *                            |       |        |        |</span>
<span class="line"> *                          person employee student student-emp</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p>根据注释里的信息，Append 节点不需要用到 Plan 结构体内带有的左右孩子节点，而是自行扩展了计划节点定义，为所有的子计划维护一个链表 <code>appendplans</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   Append node -</span>
<span class="line"> *      Generate the concatenation of the results of sub-plans.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Append</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>apprelids<span class="token punctuation">;</span>      <span class="token comment">/* RTIs of appendrel(s) formed by this node */</span></span>
<span class="line">    List       <span class="token operator">*</span>appendplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         nasyncplans<span class="token punctuation">;</span>    <span class="token comment">/* # of asynchronous plans */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * All &#39;appendplans&#39; preceding this index are non-partial plans. All</span>
<span class="line">     * &#39;appendplans&#39; from this index onwards are partial plans.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">int</span>         first_partial_plan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Info for run-time subplan pruning; NULL if we&#39;re not doing that */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">PartitionPruneInfo</span> <span class="token operator">*</span>part_prune_info<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Append<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于 Append 节点对应的 PlanState，其中维护了链表的长度（子计划的个数），以及目前正在执行的子计划的状态信息（哪一个子计划 / 执行是否开始 / 执行是否完成）：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   AppendState information</span>
<span class="line"> *</span>
<span class="line"> *      nplans              how many plans are in the array</span>
<span class="line"> *      whichplan           which synchronous plan is being executed (0 .. n-1)</span>
<span class="line"> *                          or a special negative value. See nodeAppend.c.</span>
<span class="line"> *      prune_state         details required to allow partitions to be</span>
<span class="line"> *                          eliminated from the scan, or NULL if not possible.</span>
<span class="line"> *      valid_subplans      for runtime pruning, valid synchronous appendplans</span>
<span class="line"> *                          indexes to scan.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">AppendState</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">AppendState</span> AppendState<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">ParallelAppendState</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ParallelAppendState</span> ParallelAppendState<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">PartitionPruneState</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">AppendState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    PlanState <span class="token operator">*</span><span class="token operator">*</span>appendplans<span class="token punctuation">;</span>    <span class="token comment">/* array of PlanStates for my inputs */</span></span>
<span class="line">    <span class="token keyword">int</span>         as_nplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         as_whichplan<span class="token punctuation">;</span></span>
<span class="line">    bool        as_begun<span class="token punctuation">;</span>       <span class="token comment">/* false means need to initialize */</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>as_asyncplans<span class="token punctuation">;</span>  <span class="token comment">/* asynchronous plans indexes */</span></span>
<span class="line">    <span class="token keyword">int</span>         as_nasyncplans<span class="token punctuation">;</span> <span class="token comment">/* # of asynchronous plans */</span></span>
<span class="line">    AsyncRequest <span class="token operator">*</span><span class="token operator">*</span>as_asyncrequests<span class="token punctuation">;</span>    <span class="token comment">/* array of AsyncRequests */</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>as_asyncresults<span class="token punctuation">;</span>   <span class="token comment">/* unreturned results of async plans */</span></span>
<span class="line">    <span class="token keyword">int</span>         as_nasyncresults<span class="token punctuation">;</span>   <span class="token comment">/* # of valid entries in as_asyncresults */</span></span>
<span class="line">    bool        as_syncdone<span class="token punctuation">;</span>    <span class="token comment">/* true if all synchronous plans done in</span>
<span class="line">                                 * asynchronous mode, else false */</span></span>
<span class="line">    <span class="token keyword">int</span>         as_nasyncremain<span class="token punctuation">;</span>    <span class="token comment">/* # of remaining asynchronous plans */</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>as_needrequest<span class="token punctuation">;</span> <span class="token comment">/* asynchronous plans needing a new request */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">WaitEventSet</span> <span class="token operator">*</span>as_eventset<span class="token punctuation">;</span>   <span class="token comment">/* WaitEventSet used to configure file</span>
<span class="line">                                         * descriptor wait events */</span></span>
<span class="line">    <span class="token keyword">int</span>         as_first_partial_plan<span class="token punctuation">;</span>  <span class="token comment">/* Index of &#39;appendplans&#39; containing</span>
<span class="line">                                         * the first partial plan */</span></span>
<span class="line">    ParallelAppendState <span class="token operator">*</span>as_pstate<span class="token punctuation">;</span> <span class="token comment">/* parallel coordination info */</span></span>
<span class="line">    Size        pstate_len<span class="token punctuation">;</span>     <span class="token comment">/* size of parallel coordination info */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">PartitionPruneState</span> <span class="token operator">*</span>as_prune_state<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>as_valid_subplans<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>as_valid_asyncplans<span class="token punctuation">;</span>    <span class="token comment">/* valid asynchronous plans indexes */</span></span>
<span class="line">    <span class="token function">bool</span>        <span class="token punctuation">(</span><span class="token operator">*</span>choose_next_subplan<span class="token punctuation">)</span> <span class="token punctuation">(</span>AppendState <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h2><p>该函数在 <code>ExecInitNode()</code> 生命周期中被调用，完成给 Append 节点构造相应 AppendState 节点的工作。该函数内会为一次性为所有子计划分配好 <code>PlanState</code> 结构体的空间，然后为每一个子计划递归调用 <code>ExecInitNode()</code>。</p><blockquote><p>这里与一般节点有区别。其它节点都是对当前节点的左右孩子递归调用 <code>ExecInitNode()</code>；Append 节点没有左右孩子节点，是通过遍历子计划链表，分别调用 <code>ExecInitNode()</code> 来完成初始化的。</p></blockquote><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInitAppend</span>
<span class="line"> *</span>
<span class="line"> *      Begin all of the subscans of the append node.</span>
<span class="line"> *</span>
<span class="line"> *     (This is potentially wasteful, since the entire result of the</span>
<span class="line"> *      append node may not be scanned, but this way all of the</span>
<span class="line"> *      structures get allocated in the executor&#39;s top level memory</span>
<span class="line"> *      block instead of that of the call to ExecAppend.)</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">AppendState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitAppend</span><span class="token punctuation">(</span>Append <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    AppendState <span class="token operator">*</span>appendstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>AppendState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    PlanState <span class="token operator">*</span><span class="token operator">*</span>appendplanstates<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>validsubplans<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset  <span class="token operator">*</span>asyncplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         nplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         nasyncplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         firstvalid<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">,</span></span>
<span class="line">                j<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* check for unsupported flags */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create new AppendState for our append node</span>
<span class="line">     */</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecAppend<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Let choose_next_subplan_* function handle setting the first subplan */</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">=</span> INVALID_SUBPLAN_INDEX<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_begun <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* If run-time partition pruning is enabled, then set that up now */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>part_prune_info <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        PartitionPruneState <span class="token operator">*</span>prunestate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* We may need an expression context to evaluate partition exprs */</span></span>
<span class="line">        <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Create the working data structure for pruning. */</span></span>
<span class="line">        prunestate <span class="token operator">=</span> <span class="token function">ExecCreatePartitionPruneState</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span></span>
<span class="line">                                                   node<span class="token operator">-&gt;</span>part_prune_info<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        appendstate<span class="token operator">-&gt;</span>as_prune_state <span class="token operator">=</span> prunestate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Perform an initial partition prune, if required. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>prunestate<span class="token operator">-&gt;</span>do_initial_prune<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* Determine which subplans survive initial pruning */</span></span>
<span class="line">            validsubplans <span class="token operator">=</span> <span class="token function">ExecFindInitialMatchingSubPlans</span><span class="token punctuation">(</span>prunestate<span class="token punctuation">,</span></span>
<span class="line">                                                            <span class="token function">list_length</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            nplans <span class="token operator">=</span> <span class="token function">bms_num_members</span><span class="token punctuation">(</span>validsubplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* We&#39;ll need to initialize all subplans */</span></span>
<span class="line">            nplans <span class="token operator">=</span> <span class="token function">list_length</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>nplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            validsubplans <span class="token operator">=</span> <span class="token function">bms_add_range</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> nplans <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * When no run-time pruning is required and there&#39;s at least one</span>
<span class="line">         * subplan, we can fill as_valid_subplans immediately, preventing</span>
<span class="line">         * later calls to ExecFindMatchingSubPlans.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>prunestate<span class="token operator">-&gt;</span>do_exec_prune <span class="token operator">&amp;&amp;</span> nplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            appendstate<span class="token operator">-&gt;</span>as_valid_subplans <span class="token operator">=</span> <span class="token function">bms_add_range</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> nplans <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        nplans <span class="token operator">=</span> <span class="token function">list_length</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * When run-time partition pruning is not enabled we can just mark all</span>
<span class="line">         * subplans as valid; they must also all be initialized.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>nplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        appendstate<span class="token operator">-&gt;</span>as_valid_subplans <span class="token operator">=</span> validsubplans <span class="token operator">=</span></span>
<span class="line">            <span class="token function">bms_add_range</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> nplans <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        appendstate<span class="token operator">-&gt;</span>as_prune_state <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize result tuple type and slot.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* node returns slots from each of its subnodes, therefore not fixed */</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsset <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>resultopsfixed <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    appendplanstates <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">palloc</span><span class="token punctuation">(</span>nplans <span class="token operator">*</span></span>
<span class="line">                                             <span class="token keyword">sizeof</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * call ExecInitNode on each of the valid plans to be executed and save</span>
<span class="line">     * the results into the appendplanstates array.</span>
<span class="line">     *</span>
<span class="line">     * While at it, find out the first valid partial plan.</span>
<span class="line">     */</span></span>
<span class="line">    j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    asyncplans <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    nasyncplans <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    firstvalid <span class="token operator">=</span> nplans<span class="token punctuation">;</span></span>
<span class="line">    i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>validsubplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        Plan       <span class="token operator">*</span>initNode <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">list_nth</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Record async subplans.  When executing EvalPlanQual, we treat them</span>
<span class="line">         * as sync ones; don&#39;t do this when initializing an EvalPlanQual plan</span>
<span class="line">         * tree.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>initNode<span class="token operator">-&gt;</span>async_capable <span class="token operator">&amp;&amp;</span> estate<span class="token operator">-&gt;</span>es_epq_active <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            asyncplans <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span>asyncplans<span class="token punctuation">,</span> j<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            nasyncplans<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Record the lowest appendplans index which is a valid partial plan.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>i <span class="token operator">&gt;=</span> node<span class="token operator">-&gt;</span>first_partial_plan <span class="token operator">&amp;&amp;</span> j <span class="token operator">&lt;</span> firstvalid<span class="token punctuation">)</span></span>
<span class="line">            firstvalid <span class="token operator">=</span> j<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        appendplanstates<span class="token punctuation">[</span>j<span class="token operator">++</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span>initNode<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_first_partial_plan <span class="token operator">=</span> firstvalid<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>appendplans <span class="token operator">=</span> appendplanstates<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_nplans <span class="token operator">=</span> nplans<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Initialize async state */</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_asyncplans <span class="token operator">=</span> asyncplans<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_nasyncplans <span class="token operator">=</span> nasyncplans<span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_asyncrequests <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_asyncresults <span class="token operator">=</span> <span class="token punctuation">(</span>TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">palloc0</span><span class="token punctuation">(</span>nasyncplans <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>TupleTableSlot <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_needrequest <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>as_eventset <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>nasyncplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        appendstate<span class="token operator">-&gt;</span>as_asyncrequests <span class="token operator">=</span> <span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">palloc0</span><span class="token punctuation">(</span>nplans <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>AsyncRequest <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token function">bms_next_member</span><span class="token punctuation">(</span>asyncplans<span class="token punctuation">,</span> i<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            AsyncRequest <span class="token operator">*</span>areq<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            areq <span class="token operator">=</span> <span class="token function">palloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span>AsyncRequest<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>requestor <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> appendstate<span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>requestee <span class="token operator">=</span> appendplanstates<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>request_index <span class="token operator">=</span> i<span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>callback_pending <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>request_complete <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">            areq<span class="token operator">-&gt;</span>result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            appendstate<span class="token operator">-&gt;</span>as_asyncrequests<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> areq<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Miscellaneous initialization</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* For parallel query, this will be overridden later. */</span></span>
<span class="line">    appendstate<span class="token operator">-&gt;</span>choose_next_subplan <span class="token operator">=</span> choose_next_subplan_locally<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> appendstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution"><span>Execution</span></a></h2><p>该函数在 <code>ExecProcNode()</code> 生命周期中被调用。如果这个函数被第一次调用，那么首先进行一些初始化工作（比如在 <code>AppendState</code> 中标记开始执行第一个子计划），然后进入一个死循环。在死循环中，定位到当前子计划并递归调用 <code>ExecProcNode()</code> 获取元组并返回；如果返回元组为空，则选择下一个子计划重复上述过程，直到没有更多子计划。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *     ExecAppend</span>
<span class="line"> *</span>
<span class="line"> *      Handles iteration over multiple subplans.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecAppend</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    AppendState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>AppendState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If this is the first call after Init or ReScan, we need to do the</span>
<span class="line">     * initialization work.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_begun<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">==</span> INVALID_SUBPLAN_INDEX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Nothing to do if there are no subplans */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nplans <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* If there are any async subplans, begin executing them. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncplans <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecAppendAsyncBegin</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If no sync subplan has been chosen, we must choose one before</span>
<span class="line">         * proceeding.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span><span class="token function">choose_next_subplan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">||</span></span>
<span class="line">               <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&gt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&lt;</span> node<span class="token operator">-&gt;</span>as_nplans<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* And we&#39;re initialized. */</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>as_begun <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        PlanState  <span class="token operator">*</span>subnode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * try to get a tuple from an async subplan if any</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_syncdone <span class="token operator">||</span> <span class="token operator">!</span><span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecAppendAsyncGetNext</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token operator">&amp;</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>as_syncdone<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">bms_is_empty</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_needrequest<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * figure out which sync subplan we are currently processing</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&gt;=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_whichplan <span class="token operator">&lt;</span> node<span class="token operator">-&gt;</span>as_nplans<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        subnode <span class="token operator">=</span> node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">[</span>node<span class="token operator">-&gt;</span>as_whichplan<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * get a tuple from the subplan</span>
<span class="line">         */</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>subnode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * If the subplan gave us something then return it as-is. We do</span>
<span class="line">             * NOT make use of the result slot that was set up in</span>
<span class="line">             * ExecInitAppend; there&#39;s no need for it.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * wait or poll for async events if any. We do this before checking</span>
<span class="line">         * for the end of iteration, because it might drain the remaining</span>
<span class="line">         * async subplans.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecAppendAsyncEventWait</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* choose new sync subplan; if no sync/async subplans, we&#39;re done */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span><span class="token function">choose_next_subplan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>as_nasyncremain <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up"><span>Clean Up</span></a></h2><p>清理过程相对简单。与初始化过程类似，无视节点的左右孩子，直接对节点的子计划链表进行遍历，依次对每一个子计划递归调用 <code>ExecEndNode()</code> 即可。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecEndAppend</span>
<span class="line"> *</span>
<span class="line"> *      Shuts down the subscans of the append node.</span>
<span class="line"> *</span>
<span class="line"> *      Returns nothing of interest.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndAppend</span><span class="token punctuation">(</span>AppendState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState <span class="token operator">*</span><span class="token operator">*</span>appendplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         nplans<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get information from the node</span>
<span class="line">     */</span></span>
<span class="line">    appendplans <span class="token operator">=</span> node<span class="token operator">-&gt;</span>appendplans<span class="token punctuation">;</span></span>
<span class="line">    nplans <span class="token operator">=</span> node<span class="token operator">-&gt;</span>as_nplans<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * shut down each of the subscans</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nplans<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ExecEndNode</span><span class="token punctuation">(</span>appendplans<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="new-version-kernel" tabindex="-1"><a class="header-anchor" href="#new-version-kernel"><span>New Version Kernel</span></a></h2><p>PostgreSQL 14 内核提供了对 Append 节点异步执行的支持，后续有机会再详细了解。</p>`,24)]))}const o=s(l,[["render",t],["__file","PostgreSQL Executor Append.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Append.html","title":"PostgreSQL - Executor: Append","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":2,"title":"Execution","slug":"execution","link":"#execution","children":[]},{"level":2,"title":"Clean Up","slug":"clean-up","link":"#clean-up","children":[]},{"level":2,"title":"New Version Kernel","slug":"new-version-kernel","link":"#new-version-kernel","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Append.md"}');export{o as comp,u as data};
