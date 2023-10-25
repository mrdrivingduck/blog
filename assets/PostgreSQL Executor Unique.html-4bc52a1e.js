import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="postgresql-executor-unique" tabindex="-1"><a class="header-anchor" href="#postgresql-executor-unique" aria-hidden="true">#</a> PostgreSQL - Executor: Unique</h1><p>Created by : Mr Dk.</p><p>2021 / 07 / 11 21:44</p><p>Hangzhou, Zhejiang, China</p><hr><p><code>Unique</code> 计划节点用于元组的去重。众所周知，去重操作基于一个很重要的前提：<strong>输入数据有序</strong>。如果已知输入数据有序，那么去重的实现方式将非常直截了当：缓存前一个元组，如果当前元组与前一个元组相同，就丢弃这个重复元组。可以得知，<code>Unique</code> 节点会被放在一个 <code>Sort</code> 节点的上层。</p><p>这也是一个很简单的节点，不对元组做选择和投影操作。</p><h2 id="plan-node" tabindex="-1"><a class="header-anchor" href="#plan-node" aria-hidden="true">#</a> Plan Node</h2><p><code>Unique</code> 节点继承自 <code>Plan</code> 结构体，同时扩展了去重相关的信息。由于判断去重实际上是判断是否相等，因此去重信息主要包含用于比较的列信息，以及比较操作的信息：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      unique node
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Unique</span>
<span class="token punctuation">{</span>
    Plan        plan<span class="token punctuation">;</span>
    <span class="token keyword">int</span>         numCols<span class="token punctuation">;</span>        <span class="token comment">/* number of columns to check for uniqueness */</span>
    AttrNumber <span class="token operator">*</span>uniqColIdx<span class="token punctuation">;</span>     <span class="token comment">/* their indexes in the target list */</span>
    Oid        <span class="token operator">*</span>uniqOperators<span class="token punctuation">;</span>  <span class="token comment">/* equality operators to compare with */</span>
    Oid        <span class="token operator">*</span>uniqCollations<span class="token punctuation">;</span> <span class="token comment">/* collations for equality comparisons */</span>
<span class="token punctuation">}</span> Unique<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state" aria-hidden="true">#</a> Plan State</h2><p><code>UniqueState</code> 继承自 <code>PlanState</code> 结构，同时扩展了用于判断是否相等的 <code>ExprState *</code>：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *   UniqueState information
 *
 *      Unique nodes are used &quot;on top of&quot; sort nodes to discard
 *      duplicate tuples returned from the sort phase.  Basically
 *      all it does is compare the current tuple from the subplan
 *      with the previously fetched tuple (stored in its result slot).
 *      If the two are identical in all interesting fields, then
 *      we just fetch another tuple from the sort and try again.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">UniqueState</span>
<span class="token punctuation">{</span>
    PlanState   ps<span class="token punctuation">;</span>             <span class="token comment">/* its first field is NodeTag */</span>
    ExprState  <span class="token operator">*</span>eqfunction<span class="token punctuation">;</span>     <span class="token comment">/* tuple equality qual */</span>
<span class="token punctuation">}</span> UniqueState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization" aria-hidden="true">#</a> Initialization</h2><p>在 <code>ExecInitNode()</code> 生命周期中被调用，主要工作包括分配 <code>UniqueState</code> 节点并初始化，然后递归调用 <code>ExecInitNode()</code>。将 <code>Unique</code> 节点中与比较相关的信息传递给 <code>execTuplesMatchPrepare()</code> 函数，返回 <code>ExprState</code> 结构并将指针设置到 <code>UniqueState</code> 中。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecInitUnique
 *
 *      This initializes the unique node state structures and
 *      the node&#39;s subplan.
 * ----------------------------------------------------------------
 */</span>
UniqueState <span class="token operator">*</span>
<span class="token function">ExecInitUnique</span><span class="token punctuation">(</span>Unique <span class="token operator">*</span>node<span class="token punctuation">,</span> EState <span class="token operator">*</span>estate<span class="token punctuation">,</span> <span class="token keyword">int</span> eflags<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    UniqueState <span class="token operator">*</span>uniquestate<span class="token punctuation">;</span>

    <span class="token comment">/* check for unsupported flags */</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>eflags <span class="token operator">&amp;</span> <span class="token punctuation">(</span>EXEC_FLAG_BACKWARD <span class="token operator">|</span> EXEC_FLAG_MARK<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * create state structure
     */</span>
    uniquestate <span class="token operator">=</span> <span class="token function">makeNode</span><span class="token punctuation">(</span>UniqueState<span class="token punctuation">)</span><span class="token punctuation">;</span>
    uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>plan <span class="token operator">=</span> <span class="token punctuation">(</span>Plan <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">;</span>
    uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>state <span class="token operator">=</span> estate<span class="token punctuation">;</span>
    uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ExecProcNode <span class="token operator">=</span> ExecUnique<span class="token punctuation">;</span>

    <span class="token comment">/*
     * create expression context
     */</span>
    <span class="token function">ExecAssignExprContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> <span class="token operator">&amp;</span>uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * then initialize outer plan
     */</span>
    <span class="token function">outerPlanState</span><span class="token punctuation">(</span>uniquestate<span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token function">ExecInitNode</span><span class="token punctuation">(</span><span class="token function">outerPlan</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">,</span> estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Initialize result slot and type. Unique nodes do no projections, so
     * initialize projection info for this node appropriately.
     */</span>
    <span class="token function">ExecInitResultTupleSlotTL</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">,</span> <span class="token operator">&amp;</span>TTSOpsMinimalTuple<span class="token punctuation">)</span><span class="token punctuation">;</span>
    uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ProjInfo <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Precompute fmgr lookup data for inner loop
     */</span>
    uniquestate<span class="token operator">-&gt;</span>eqfunction <span class="token operator">=</span>
        <span class="token function">execTuplesMatchPrepare</span><span class="token punctuation">(</span><span class="token function">ExecGetResultType</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>uniquestate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                               node<span class="token operator">-&gt;</span>numCols<span class="token punctuation">,</span>
                               node<span class="token operator">-&gt;</span>uniqColIdx<span class="token punctuation">,</span>
                               node<span class="token operator">-&gt;</span>uniqOperators<span class="token punctuation">,</span>
                               node<span class="token operator">-&gt;</span>uniqCollations<span class="token punctuation">,</span>
                               <span class="token operator">&amp;</span>uniquestate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> uniquestate<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution" tabindex="-1"><a class="header-anchor" href="#execution" aria-hidden="true">#</a> Execution</h2><p>在 <code>ExecProcNode()</code> 生命周期中被调用。<code>UniqueState</code> 节点的 <code>ps_ResultTupleSlot</code> 保存了上一个返回给上层节点的元组。在死循环中不断对子节点递归调用 <code>ExecProcNode()</code> 获取一个元组，然后利用之前初始化好的比较函数将当前元组与 <code>ps_ResultTupleSlot</code> 元组进行比较。</p><ul><li>如果相同，那么说明元组重复，直接忽略当前元组并扫描下一个</li><li>如果不同，那么说明元组从未出现过，那么将当前元组拷贝到 <code>ps_ResultTupleSlot</code> 中 (并返回给上层节点)</li></ul><p>直到子节点返回空元组。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecUnique
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span>         <span class="token comment">/* return: a tuple or NULL */</span>
<span class="token function">ExecUnique</span><span class="token punctuation">(</span>PlanState <span class="token operator">*</span>pstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    UniqueState <span class="token operator">*</span>node <span class="token operator">=</span> <span class="token function">castNode</span><span class="token punctuation">(</span>UniqueState<span class="token punctuation">,</span> pstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    ExprContext <span class="token operator">*</span>econtext <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ExprContext<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>resultTupleSlot<span class="token punctuation">;</span>
    TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">;</span>
    PlanState  <span class="token operator">*</span>outerPlan<span class="token punctuation">;</span>

    <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * get information from the node
     */</span>
    outerPlan <span class="token operator">=</span> <span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    resultTupleSlot <span class="token operator">=</span> node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">;</span>

    <span class="token comment">/*
     * now loop, returning only non-duplicate tuples. We assume that the
     * tuples arrive in sorted order so we can detect duplicates easily. The
     * first tuple of each group is returned.
     */</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * fetch a tuple from the outer subplan
         */</span>
        slot <span class="token operator">=</span> <span class="token function">ExecProcNode</span><span class="token punctuation">(</span>outerPlan<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>slot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* end of subplan, so we&#39;re done */</span>
            <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>resultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">/*
         * Always return the first tuple from the subplan.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TupIsNull</span><span class="token punctuation">(</span>resultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Else test if the new tuple and the previously returned tuple match.
         * If so then we loop back and fetch another new tuple from the
         * subplan.
         */</span>
        econtext<span class="token operator">-&gt;</span>ecxt_innertuple <span class="token operator">=</span> slot<span class="token punctuation">;</span>
        econtext<span class="token operator">-&gt;</span>ecxt_outertuple <span class="token operator">=</span> resultTupleSlot<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecQualAndReset</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>eqfunction<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * We have a new tuple different from the previous saved tuple (if any).
     * Save it and return it.  We must copy it because the source subplan
     * won&#39;t guarantee that this source tuple is still accessible after
     * fetching the next source tuple.
     */</span>
    <span class="token keyword">return</span> <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>resultTupleSlot<span class="token punctuation">,</span> slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up" aria-hidden="true">#</a> Clean Up</h2><p>在 <code>ExecEndNode()</code> 生命周期函数中被调用。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------------------------------------------------
 *      ExecEndUnique
 *
 *      This shuts down the subplan and frees resources allocated
 *      to this node.
 * ----------------------------------------------------------------
 */</span>
<span class="token keyword">void</span>
<span class="token function">ExecEndUnique</span><span class="token punctuation">(</span>UniqueState <span class="token operator">*</span>node<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* clean up tuple table */</span>
    <span class="token function">ExecClearTuple</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">.</span>ps_ResultTupleSlot<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token function">ExecFreeExprContext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token function">ExecEndNode</span><span class="token punctuation">(</span><span class="token function">outerPlanState</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,24),i=[p];function o(c,l){return s(),a("div",null,i)}const d=n(t,[["render",o],["__file","PostgreSQL Executor Unique.html.vue"]]);export{d as default};
