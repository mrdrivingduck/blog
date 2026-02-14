import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const t={};function l(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-executor-group" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-group"><span>PostgreSQL - Executor: Group</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 15 0:37</p><p>Hangzhou, Zhejiang, China</p><hr><p><code>Group</code> 算子用于支持 SQL 中的 <code>GROUP BY</code> 子句。该子句的作用是把 <strong>指定列值相等的所有元组</strong> 合并为一个元组并返回上层。显然，为了每次能够返回一个合并后的元组，列值相等的元组应当排列在一起。所以 <code>Group</code> 节点的子节点应当是根据 <code>GROUP BY</code> 的列排序的。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node"><span>Plan Node</span></a></h2><p><code>Group</code> 的计划节点继承自 <code>Plan</code>，同时扩展了多个字段，主要与分组列有关：指明被用于分组的列数、哪几个列被用于分组，以及被用于比较列值是否相等的运算符：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ---------------</span>
<span class="line"> *   group node -</span>
<span class="line"> *      Used for queries with GROUP BY (but no aggregates) specified.</span>
<span class="line"> *      The input must be presorted according to the grouping columns.</span>
<span class="line"> * ---------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Group</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Plan        plan<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         numCols<span class="token punctuation">;</span>        <span class="token comment">/* number of grouping columns */</span></span>
<span class="line">    AttrNumber <span class="token operator">*</span>grpColIdx<span class="token punctuation">;</span>      <span class="token comment">/* their indexes in the target list */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>grpOperators<span class="token punctuation">;</span>   <span class="token comment">/* equality operators to compare with */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>grpCollations<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Group<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state"><span>Plan State</span></a></h2><p><code>GroupState</code> 继承了 <code>ScanState</code> 结构，从而也就继承了 <code>ScanState</code> 中与被扫描的关系相关的结构。另外扩展了用于计算分组列是否相等的 <code>ExprState *</code> 空间，以及 group scan 是否完成的标志位。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ---------------------</span>
<span class="line"> *  GroupState information</span>
<span class="line"> * ---------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">GroupState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ScanState   ss<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>eqfunction<span class="token punctuation">;</span>     <span class="token comment">/* equality function */</span></span>
<span class="line">    bool        grp_done<span class="token punctuation">;</span>       <span class="token comment">/* indicates completion of Group scan */</span></span>
<span class="line"><span class="token punctuation">}</span> GroupState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用。构造并初始化 <code>GroupState</code> 节点，然后对左孩子递归调用 <code>ExecInitNode()</code>。将分组列和每个列的相等运算符初始化为用于之后比较的 <code>ExprState *</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* -----------------</span>
<span class="line"> * ExecInitGroup</span>
<span class="line"> *</span>
<span class="line"> *  Creates the run-time information for the group node produced by the</span>
<span class="line"> *  planner and initializes its outer subtree</span>
<span class="line"> * -----------------</span>
<span class="line"> */</span></span>
<span class="line">GroupState <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInitGroup</span><span class="token punctuation">(</span>Group <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    GroupState <span class="token operator">*</span>grpstate<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> TupleTableSlotOps <span class="token operator">*</span>tts_ops<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* check for unsupported flags */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_BACKWARD <span class="token operator">|</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create state structure</span>
<span class="line">     */</span></span>
<span class="line">    grpstate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>GroupState<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecGroup<span class="token punctuation">;</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>grp_done <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create expression context</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child nodes</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>grpstate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize scan slot and type.</span>
<span class="line">     */</span></span>
<span class="line">    tts_ops <span class="token operator">=</span> <span class="token function">ExecGetResultSlotOps</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecCreateScanSlotFromOuterPlan</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">,</span> tts_ops<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Initialize result slot, type and projection.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsVirtual<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecAssignProjectionInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * initialize child expressions</span>
<span class="line">     */</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual <span class="token operator">=</span></span>
<span class="line">        <span class="token function">ExecInitQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>plan<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> grpstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Precompute fmgr lookup data for inner loop</span>
<span class="line">     */</span></span>
<span class="line">    grpstate<span class="token operator">-&gt;</span>eqfunction <span class="token operator">=</span></span>
<span class="line">        <span class="token function">execTuplesMatchPrepare</span><span class="token punctuation">(</span><span class="token function">ExecGetResultType</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>grpstate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                               node<span class="token operator">-&gt;</span>numCols<span class="token punctuation">,</span></span>
<span class="line">                               node<span class="token operator">-&gt;</span>grpColIdx<span class="token punctuation">,</span></span>
<span class="line">                               node<span class="token operator">-&gt;</span>grpOperators<span class="token punctuation">,</span></span>
<span class="line">                               node<span class="token operator">-&gt;</span>grpCollations<span class="token punctuation">,</span></span>
<span class="line">                               <span class="token operator">&amp;</span>grpstate<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> grpstate<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution"><span>Execution</span></a></h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。函数内维护一个元组槽，用于存放 <strong>每组</strong> 的第一个元组。一开始元组槽为空，那么对子节点递归调用 <code>ExecProcNode()</code> 获取一个元组，填充到槽中，做完选择和投影之后返回。</p><p>接下来是一个死循环，在死循环中不断对子节点递归调用 <code>ExecProcNode()</code> 获取元组，并使用分组列比较函数来判断是否与元组槽中的元组同属一个组：</p><ul><li>如果孩子节点没有更多元组了，那么将 <code>GroupState</code> 中的 <code>grp_done</code> 设置为 <code>true</code> 后返回空元组 (扫描结束)</li><li>如果相等，由于本组第一个元组已经被返回了，因此忽略本条元组，继续扫描下一个元组</li><li>如果不相等，说明这条元组属于一个新的分组，那么将这条元组拷贝到元组槽中，做完选择和投影之后返回</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> *   ExecGroup -</span>
<span class="line"> *</span>
<span class="line"> *      Return one tuple for each group of matching input tuples.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecGroup</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    GroupState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>GroupState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    ExprContext <span class="token operator">*</span>econtext<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>firsttupleslot<span class="token punctuation">;</span></span>
<span class="line">    TupleTableSlot <span class="token operator">*</span>outerslot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * get state info from node</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>grp_done<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The ScanTupleSlot holds the (copied) first tuple of each group.</span>
<span class="line">     */</span></span>
<span class="line">    firsttupleslot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We need not call ResetExprContext here because ExecQualAndReset() will</span>
<span class="line">     * reset the per-tuple memory context once per input tuple.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If first time through, acquire first input tuple and determine whether</span>
<span class="line">     * to return it or not.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>firsttupleslot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        outerslot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerslot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* empty input, so return nothing */</span></span>
<span class="line">            node<span class="token operator">-&gt;</span>grp_done <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token comment">/* Copy tuple into firsttupleslot */</span></span>
<span class="line">        <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>firsttupleslot<span class="token punctuation">,</span> outerslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Set it up as input for qual test and projection.  The expressions</span>
<span class="line">         * will access the input tuple as varno OUTER.</span>
<span class="line">         */</span></span>
<span class="line">        econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> firsttupleslot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Check the qual (HAVING clause); if the group does not match, ignore</span>
<span class="line">         * it and fall into scan loop.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Form and return a projection tuple using the first input tuple.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            <span class="token function">InstrCountFiltered1</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * This loop iterates once per input tuple group.  At the head of the</span>
<span class="line">     * loop, we have finished processing the first tuple of the group and now</span>
<span class="line">     * need to scan over all the other group members.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Scan over all remaining tuples that belong to this group</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            outerslot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>outerslot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/* no more groups, so we&#39;re done */</span></span>
<span class="line">                node<span class="token operator">-&gt;</span>grp_done <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Compare with first tuple and see if this tuple is of the same</span>
<span class="line">             * group.  If so, ignore it and keep scanning.</span>
<span class="line">             */</span></span>
<span class="line">            econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> firsttupleslot<span class="token punctuation">;</span></span>
<span class="line">            econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> outerslot<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecQualAndReset</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>eqfunction<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We have the first tuple of the next input group.  See if we want to</span>
<span class="line">         * return it.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* Copy tuple, set up as input for qual test and projection */</span></span>
<span class="line">        <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>firsttupleslot<span class="token punctuation">,</span> outerslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> firsttupleslot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Check the qual (HAVING clause); if the group does not match, ignore</span>
<span class="line">         * it and loop back to scan the rest of the group.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ExecQual</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>qual<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Form and return a projection tuple using the first input tuple.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ExecProject</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">.</span>ps_ProjInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            <span class="token function">InstrCountFiltered1</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="end-node" tabindex="-1"><a class="header-anchor" href="#end-node"><span>End Node</span></a></h2><p>在 <code>ExecEndNode()</code> 生命周期中被调用：</p><ol><li>释放判断列值相等的表达式计算空间</li><li>清理放置每组第一个元组的元组槽</li><li>对左孩子节点递归调用 <code>ExecEndNode()</code></li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ------------------------</span>
<span class="line"> *      ExecEndGroup(node)</span>
<span class="line"> *</span>
<span class="line"> * -----------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ExecEndGroup</span><span class="token punctuation">(</span>GroupState <span class="token operator">*</span>node<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* clean up tuple table */</span></span>
<span class="line">    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ss<span class="token punctuation">.</span>ss_ScanTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,24)]))}const o=s(t,[["render",l],["__file","PostgreSQL Executor Group.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Executor%20Group.html","title":"PostgreSQL - Executor: Group","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Plan Node","slug":"plan-node","link":"#plan-node","children":[]},{"level":2,"title":"Plan State","slug":"plan-state","link":"#plan-state","children":[]},{"level":2,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":2,"title":"Execution","slug":"execution","link":"#execution","children":[]},{"level":2,"title":"End Node","slug":"end-node","link":"#end-node","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Executor Group.md"}');export{o as comp,u as data};
