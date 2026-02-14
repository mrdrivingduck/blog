import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const t={};function l(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-sort" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-sort"><span>PostgreSQL - Executor: Sort</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 11 21:07</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="tuple-sort" tabindex="-1"><a class="header-anchor" href="#tuple-sort"><span>Tuple Sort</span></a></h2><p>排序节点也是一种物化节点，因为需要把下层节点所有的元组读取出来以后再进行排序。对于元组的保存，使用了 <code>Tuplesortstate</code> 结构。该结构在 <code>Tuplestorestate</code> 结构的基础上增加了排序的功能：</p><ul><li>如果内存中放得下，那么直接进行 <strong>快速排序</strong></li><li>如果内存中放不下，那么使用临时文件 + 外部 <strong>归并排序</strong></li></ul><p><code>Tuplesortstate</code> 在 B-Tree 索引构建的代码中也有出现过，眼熟。之后单独分析它的功能，目前仅明确其用途：</p><ul><li><code>tuplesort_begin_heap()</code> 初始化元组缓存结构</li><li><code>tuplesort_puttupleslot()</code> 将元组放入缓存结构</li><li><code>tuplesort_performsort()</code> 对缓存结构中的元组进行排序</li><li><code>tuplesort_gettupleslot()</code> 从缓存结构中获取元组</li><li><code>tuplesort_end()</code> 释放缓存结构</li></ul><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p>排序节点继承自 <code>Plan</code> 结构体，并扩展了与排序相关的字段。主要包含进行排序的列数、进行排序的列索引、排序运算符及 NULL 值处理方式：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      sort node</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Sort</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         numCols<span class="token punctuation">;</span>        <span class="token comment">/* number of sort-key columns */</span></span>
<span class="line">    AttrNumber <span class="token operator">*</span>sortColIdx<span class="token punctuation">;</span>     <span class="token comment">/* their indexes in the target list */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>sortOperators<span class="token punctuation">;</span>  <span class="token comment">/* OIDs of operators to sort them by */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>collations<span class="token punctuation">;</span>     <span class="token comment">/* OIDs of collations */</span></span>
<span class="line">    bool       <span class="token operator">*</span>nullsFirst<span class="token punctuation">;</span>     <span class="token comment">/* NULLS FIRST/LAST directions */</span></span>
<span class="line"><span class="token punctuation">}</span> Sort<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state"><span>Plan State</span></a></h2><p>节点 state 继承自 <code>ScanState</code>。其中 <code>ScanState</code> 继承自 <code>PlanState</code>，扩展了与扫描相关的信息；另外 <code>SortState</code> 扩展了与 (并行) 排序相关的状态信息：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *   SortState information</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">SortState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ScanState   ss<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    bool        randomAccess<span class="token punctuation">;</span>   <span class="token comment">/* need random access to sort output? */</span></span>
<span class="line">    bool        bounded<span class="token punctuation">;</span>        <span class="token comment">/* is the result set bounded? */</span></span>
<span class="line">    int64       bound<span class="token punctuation">;</span>          <span class="token comment">/* if bounded, how many tuples are needed */</span></span>
<span class="line">    bool        sort_Done<span class="token punctuation">;</span>      <span class="token comment">/* sort completed yet? */</span></span>
<span class="line">    bool        bounded_Done<span class="token punctuation">;</span>   <span class="token comment">/* value of bounded we did the sort with */</span></span>
<span class="line">    int64       bound_Done<span class="token punctuation">;</span>     <span class="token comment">/* value of bound we did the sort with */</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>tuplesortstate<span class="token punctuation">;</span> <span class="token comment">/* private state of tuplesort.c */</span></span>
<span class="line">    bool        am_worker<span class="token punctuation">;</span>      <span class="token comment">/* are we a worker? */</span></span>
<span class="line">    SharedSortInfo <span class="token operator">*</span>shared_info<span class="token punctuation">;</span>    <span class="token comment">/* one entry per worker */</span></span>
<span class="line"><span class="token punctuation">}</span> SortState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。构造 <code>SortState</code> 节点并初始化，然后递归调用 <code>ExecInitNode()</code>。排序状态 <code>sort_Done</code> 被初始化为 <code>false</code>。</p><p>同样，排序节点不需要初始化投影信息。返回的元组不做投影操作，直接返回。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInitSort</span>
<span class="line"> *</span>
<span class="line"> *      Creates the run-time state information for the sort node</span>
<span class="line"> *      produced by the planner and initializes its outer subtree.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line">SortState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitSort</span><span class="token punctuation">(</span>Sort <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    SortState  <span class="token operator">*</span>sortstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecInitSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;initializing sort node&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create state structure</span>
<span class="line">     */</span></span>
<span class="line">    sortstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>SortState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecSort<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We must have random access to the sort output to do backward scan or</span>
<span class="line">     * mark/restore.  We also prefer to materialize the sort output if we</span>
<span class="line">     * might be called on to rewind and replay it many times.</span>
<span class="line">     */</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>randomAccess <span class="token operator">=</span> <span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_REWIND <span class="token operator">|</span></span>
<span class="line">                                         EXEC_FLAG_BACKWARD <span class="token operator">|</span></span>
<span class="line">                                         EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>bounded <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>sort_Done <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>tuplesortstate <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Miscellaneous initialization</span>
<span class="line">     *</span>
<span class="line">     * Sort nodes don&#39;t initialize their ExprContexts because they never call</span>
<span class="line">     * ExecQual or ExecProject.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child nodes</span>
<span class="line">     *</span>
<span class="line">     * We shield the child node from the need to support REWIND, BACKWARD, or</span>
<span class="line">     * MARK/RESTORE.</span>
<span class="line">     */</span></span>
<span class="line">    eflags <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token punctuation">(</span>EXEC_FLAG_REWIND <span class="token operator">|</span> EXEC_FLAG_BACKWARD <span class="token operator">|</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>sortstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize scan slot and type.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecCreateScanSlotFromOuterPlan</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize return slot and type. No need to initialize projection info</span>
<span class="line">     * because this node doesn&#39;t do projections.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsMinimalTuple<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    sortstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecInitSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;sort node initialized&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> sortstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution"><span>Execution</span></a></h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。当节点第一次被执行时：</p><ul><li>调用 <code>tuplesort_begin_heap()</code> 初始化缓存排序结构</li><li>在一个死循环中不断对子节点调用 <code>ExecProcNode()</code> 获取元组，调用 <code>tuplesort_puttupleslot()</code> 将元组放入缓存排序结构中，直到子节点返回空元组</li><li>调用 <code>tuplesort_performsort()</code> 完成排序</li><li>将节点的 <code>sort_Done</code> 设置为 <code>true</code></li></ul><p>之后再进入节点时，只需要调用 <code>tuplesort_gettupleslot()</code> 从缓存排序结构中依次获取排序后的元组即可：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecSort</span>
<span class="line"> *</span>
<span class="line"> *      Sorts tuples from the outer subtree of the node using tuplesort,</span>
<span class="line"> *      which saves the results in a temporary file or memory. After the</span>
<span class="line"> *      initial call, returns a tuple from the file with each call.</span>
<span class="line"> *</span>
<span class="line"> *      Conditions:</span>
<span class="line"> *        -- none.</span>
<span class="line"> *</span>
<span class="line"> *      Initial States:</span>
<span class="line"> *        -- the outer child is prepared to return the first tuple.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecSort</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    SortState  <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>SortState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span></span>
<span class="line">    ScanDirection dir<span class="token punctuation">;</span></span>
<span class="line">    Tuplesortstate <span class="token operator">*</span>tuplesortstate<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get state info from node</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;entering routine&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    estate <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state<span class="token punctuation">;</span></span>
<span class="line">    dir <span class="token operator">=</span> estate<span class="token operator">-&gt;</span>es_direction<span class="token punctuation">;</span></span>
<span class="line">    tuplesortstate <span class="token operator">=</span> <span class="token punctuation">(</span>Tuplesortstate <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>tuplesortstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If first time through, read all tuples from outer plan and pass them to</span>
<span class="line">     * tuplesort.c. Subsequent calls just fetch tuples from tuplesort.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>node<span class="token operator">-&gt;</span>sort_Done<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        Sort       <span class="token operator">*</span>plannode <span class="token operator">=</span> <span class="token punctuation">(</span>Sort <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan<span class="token punctuation">;</span></span>
<span class="line">        PlanState  <span class="token operator">*</span>outerNode<span class="token punctuation">;</span></span>
<span class="line">        TupleDesc   tupDesc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;sorting subplan&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Want to scan subplan in the forward direction while creating the</span>
<span class="line">         * sorted data.</span>
<span class="line">         */</span></span>
<span class="line">        estate<span class="token operator">-&gt;</span>es_direction <span class="token operator">=</span> ForwardScanDirection<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Initialize tuplesort module.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;calling tuplesort_begin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        outerNode <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        tupDesc <span class="token operator">=</span> <span class="token function">ExecGetResultType</span><span class="token punctuation">(</span>outerNode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        tuplesortstate <span class="token operator">=</span> <span class="token function">tuplesort_begin_heap</span><span class="token punctuation">(</span>tupDesc<span class="token punctuation">,</span></span>
<span class="line">                                              plannode<span class="token operator">-&gt;</span>numCols<span class="token punctuation">,</span></span>
<span class="line">                                              plannode<span class="token operator">-&gt;</span>sortColIdx<span class="token punctuation">,</span></span>
<span class="line">                                              plannode<span class="token operator">-&gt;</span>sortOperators<span class="token punctuation">,</span></span>
<span class="line">                                              plannode<span class="token operator">-&gt;</span>collations<span class="token punctuation">,</span></span>
<span class="line">                                              plannode<span class="token operator">-&gt;</span>nullsFirst<span class="token punctuation">,</span></span>
<span class="line">                                              work_mem<span class="token punctuation">,</span></span>
<span class="line">                                              <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                                              node<span class="token operator">-&gt;</span>randomAccess<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>bounded<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">tuplesort_set_bound</span><span class="token punctuation">(</span>tuplesortstate<span class="token punctuation">,</span> node<span class="token operator">-&gt;</span>bound<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>tuplesortstate <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span> tuplesortstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Scan the subplan and feed all the tuples to tuplesort.</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerNode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">tuplesort_puttupleslot</span><span class="token punctuation">(</span>tuplesortstate<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Complete the sort.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">tuplesort_performsort</span><span class="token punctuation">(</span>tuplesortstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * restore to user specified direction</span>
<span class="line">         */</span></span>
<span class="line">        estate<span class="token operator">-&gt;</span>es_direction <span class="token operator">=</span> dir<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * finally set the sorted flag to true</span>
<span class="line">         */</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>sort_Done <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>bounded_Done <span class="token operator">=</span> node<span class="token operator">-&gt;</span>bounded<span class="token punctuation">;</span></span>
<span class="line">        node<span class="token operator">-&gt;</span>bound_Done <span class="token operator">=</span> node<span class="token operator">-&gt;</span>bound<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>shared_info <span class="token operator">&amp;&amp;</span> node<span class="token operator">-&gt;</span>am_worker<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            TuplesortInstrumentation <span class="token operator">*</span>si<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">IsParallelWorker</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>ParallelWorkerNumber <span class="token operator">&lt;=</span> node<span class="token operator">-&gt;</span>shared_info<span class="token operator">-&gt;</span>num_workers<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            si <span class="token operator">=</span> <span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>shared_info<span class="token operator">-&gt;</span>sinstrument<span class="token punctuation">[</span>ParallelWorkerNumber<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">tuplesort_get_stats</span><span class="token punctuation">(</span>tuplesortstate<span class="token punctuation">,</span> si<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecSort: %s\\n&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;sorting done&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;retrieving tuple from tuplesort&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Get the first or next tuple from tuplesort. Returns NULL if no more</span>
<span class="line">     * tuples.  Note that we only rely on slot tuple remaining valid until the</span>
<span class="line">     * next fetch from the tuplesort.</span>
<span class="line">     */</span></span>
<span class="line">    slot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token function">tuplesort_gettupleslot</span><span class="token punctuation">(</span>tuplesortstate<span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token function">ScanDirectionIsForward</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                                  false<span class="token punctuation">,</span> slot<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> slot<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up"><span>Clean Up</span></a></h2><p>在 <code>ExecEndNode()</code> 结构中被调用。其中调用 <code>tuplesort_end()</code> 释放缓存排序结构，并递归调用 <code>ExecEndNode()</code> 完成清理。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecEndSort(node)</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndSort</span><span class="token punctuation">(</span>SortState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecEndSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;shutting down sort node&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * clean out the tuple table</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* must drop pointer to sort result tuple */</span></span>
<span class="line">    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Release tuplesort resources</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>tuplesortstate <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">tuplesort_end</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Tuplesortstate <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token operator">-&gt;</span>tuplesortstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    node<span class="token operator">-&gt;</span>tuplesortstate <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * shut down the subplan</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SO1_printf</span><span class="token punctuation">(</span><span class="token string">&quot;ExecEndSort: %s\\n&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               <span class="token string">&quot;sort node shutdown&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,28)]))}const c=s(t,[["render",l],["__file","PostgreSQL Executor Sort.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Sort.html","title":"PostgreSQL - Executor: Sort","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Tuple Sort","slug":"tuple-sort","link":"#tuple-sort","children":[]},{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Plan State","slug":"plan-state","link":"#plan-state","children":[]},{"level":2,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":2,"title":"Execution","slug":"execution","link":"#execution","children":[]},{"level":2,"title":"Clean Up","slug":"clean-up","link":"#clean-up","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Sort.md"}');export{c as comp,u as data};
