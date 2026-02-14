import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function t(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-multi-insert" tabindex="-1"><a class="header-anchor" href="#postgresql-multi-insert"><span>PostgreSQL - Multi Insert</span></a></h1><p>Created by: Mr Dk.</p><p>2024 / 10 / 27 14:11</p><p>Hangzhou, Zhejiang, China, @Alibaba Xixi Campus (Park C)</p><hr><h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景"><span>背景</span></a></h2><p>PostgreSQL 目前提供了两种将数据插入数据库的方法，一种是通过 <a href="https://www.postgresql.org/docs/current/sql-insert.html" target="_blank" rel="noopener noreferrer"><code>INSERT</code></a> 语法，一种是通过 <a href="https://www.postgresql.org/docs/current/sql-copy.html" target="_blank" rel="noopener noreferrer"><code>COPY</code></a> 语法。从 SQL 语法的层面可以看出两者有一定的差异，但功能上的重合点是非常多的，因为本质上都是把新的数据行加入到表中。</p><p>本文基于 PostgreSQL 17 浅析这两种数据插入方法的内部实现。除语法层面的差异外，两者在 Table Access Method、Buffer 层算法、WAL 日志记录等方面的设计也是完全不同的。其中最核心的区别可被归纳为：<strong>攒批</strong>。这也为 PostgreSQL 的后续性能优化提供了一些思路。</p><h2 id="执行器算法" tabindex="-1"><a class="header-anchor" href="#执行器算法"><span>执行器算法</span></a></h2><p><code>INSERT</code> 和 <code>COPY</code> 核心执行函数的输入都是一行待插入的数据，在执行器内被表示为一个存放在 <code>TupleTableSlot</code> 中的元组。</p><p><code>INSERT</code> 的核心执行逻辑位于 <code>ExecInsert</code> 函数中。对于一行待插入数据，需要处理 <code>ROW INSERT</code> 相关的触发器、生成列计算、行级别安全规则检查、表级约束条件检查、<code>ON CONFLICT</code> 等复杂语法处理、索引更新等逻辑，最终调用 Table Access Method 层的 <code>table_tuple_insert</code> 函数将元组传入 AM 层：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------------------------------------------------</span>
<span class="line"> *      ExecInsert</span>
<span class="line"> *</span>
<span class="line"> *      For INSERT, we have to insert the tuple into the target relation</span>
<span class="line"> *      (or partition thereof) and insert appropriate tuples into the index</span>
<span class="line"> *      relations.</span>
<span class="line"> *</span>
<span class="line"> *      slot contains the new tuple value to be stored.</span>
<span class="line"> *</span>
<span class="line"> *      Returns RETURNING result if any, otherwise NULL.</span>
<span class="line"> *      *inserted_tuple is the tuple that&#39;s effectively inserted;</span>
<span class="line"> *      *insert_destrel is the relation where it was inserted.</span>
<span class="line"> *      These are only set on success.</span>
<span class="line"> *</span>
<span class="line"> *      This may change the currently active tuple conversion map in</span>
<span class="line"> *      mtstate-&gt;mt_transition_capture, so the callers must take care to</span>
<span class="line"> *      save the previous value to avoid losing track of it.</span>
<span class="line"> * ----------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> TupleTableSlot <span class="token operator">*</span></span>
<span class="line"><span class="token function">ExecInsert</span><span class="token punctuation">(</span>ModifyTableContext <span class="token operator">*</span>context<span class="token punctuation">,</span></span>
<span class="line">           ResultRelInfo <span class="token operator">*</span>resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">           TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">,</span></span>
<span class="line">           bool canSetTag<span class="token punctuation">,</span></span>
<span class="line">           TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>inserted_tuple<span class="token punctuation">,</span></span>
<span class="line">           ResultRelInfo <span class="token operator">*</span><span class="token operator">*</span>insert_destrel<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * BEFORE ROW INSERT Triggers.</span>
<span class="line">     *</span>
<span class="line">     * Note: We fire BEFORE ROW TRIGGERS for every attempted insertion in an</span>
<span class="line">     * INSERT ... ON CONFLICT statement.  We cannot check for constraint</span>
<span class="line">     * violations before firing these triggers, because they can change the</span>
<span class="line">     * values to insert.  Also, they can run arbitrary user-defined code with</span>
<span class="line">     * side-effects that we can&#39;t cancel by just not inserting the tuple.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* INSTEAD OF ROW INSERT Triggers */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">&amp;&amp;</span></span>
<span class="line">        resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Compute stored generated columns</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Check any RLS WITH CHECK policies.</span>
<span class="line">         *</span>
<span class="line">         * Normally we should check INSERT policies. But if the insert is the</span>
<span class="line">         * result of a partition key update that moved the tuple to a new</span>
<span class="line">         * partition, we should instead check UPDATE policies, because we are</span>
<span class="line">         * executing policies defined on the target table, and not those</span>
<span class="line">         * defined on the child partitions.</span>
<span class="line">         *</span>
<span class="line">         * If we&#39;re running MERGE, we refer to the action that we&#39;re executing</span>
<span class="line">         * to know if we&#39;re doing an INSERT or UPDATE to a partition table.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * ExecWithCheckOptions() will skip any WCOs which are not of the kind</span>
<span class="line">         * we are looking for at this point.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Check the constraints of the tuple.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Also check the tuple against the partition constraint, if there is</span>
<span class="line">         * one; except that if we got here via tuple-routing, we don&#39;t need to</span>
<span class="line">         * if there&#39;s no BR trigger defined on the partition.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>onconflict <span class="token operator">!=</span> ONCONFLICT_NONE <span class="token operator">&amp;&amp;</span> resultRelInfo<span class="token operator">-&gt;</span>ri_NumIndices <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* insert the tuple normally */</span></span>
<span class="line">            <span class="token function">table_tuple_insert</span><span class="token punctuation">(</span>resultRelationDesc<span class="token punctuation">,</span> slot<span class="token punctuation">,</span></span>
<span class="line">                               estate<span class="token operator">-&gt;</span>es_output_cid<span class="token punctuation">,</span></span>
<span class="line">                               <span class="token number">0</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* insert index entries for tuple */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_NumIndices <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">                recheckIndexes <span class="token operator">=</span> <span class="token function">ExecInsertIndexTuples</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                                       slot<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> false<span class="token punctuation">,</span></span>
<span class="line">                                                       false<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> NIL<span class="token punctuation">,</span></span>
<span class="line">                                                       false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>canSetTag<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">(</span>estate<span class="token operator">-&gt;</span>es_processed<span class="token punctuation">)</span><span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* AFTER ROW INSERT Triggers */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Check any WITH CHECK OPTION constraints from parent views.  We are</span>
<span class="line">     * required to do this after testing all constraints and uniqueness</span>
<span class="line">     * violations per the SQL spec, so we do it after actually inserting the</span>
<span class="line">     * record into the heap and all indexes.</span>
<span class="line">     *</span>
<span class="line">     * ExecWithCheckOptions will elog(ERROR) if a violation is found, so the</span>
<span class="line">     * tuple will never be seen, if it violates the WITH CHECK OPTION.</span>
<span class="line">     *</span>
<span class="line">     * ExecWithCheckOptions() will skip any WCOs which are not of the kind we</span>
<span class="line">     * are looking for at this point.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Process RETURNING if present */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>COPY</code> 的核心执行逻辑位于 <code>CopyFrom</code> 函数中，与 <code>ExecInsert</code> 函数较大的区别是其会在内存中维护一段 <code>TupleTableSlot</code> 数组，对于输入的数据行会先通过 <code>CopyMultiInsertInfoStore</code> 在内存中缓存：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Copy FROM file to relation.</span>
<span class="line"> */</span></span>
<span class="line">uint64</span>
<span class="line"><span class="token function">CopyFrom</span><span class="token punctuation">(</span>CopyFromState cstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* select slot to (initially) load row into */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> proute<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            myslot <span class="token operator">=</span> singleslot<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>myslot <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>resultRelInfo <span class="token operator">==</span> target_resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            myslot <span class="token operator">=</span> <span class="token function">CopyMultiInsertInfoNextFreeSlot</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                                     resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Directly store the values/nulls array in the slot */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">NextCopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">,</span> econtext<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_values<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_isnull<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ExecStoreVirtualTuple</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Constraints and where clause might reference the tableoid column,</span>
<span class="line">         * so (re-)initialize tts_tableOid before evaluating them.</span>
<span class="line">         */</span></span>
<span class="line">        myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>target_resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>skip_tuple<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * If there is an INSTEAD OF INSERT ROW trigger, let it handle the</span>
<span class="line">             * tuple.  Otherwise, proceed with inserting the tuple into the</span>
<span class="line">             * table or foreign table.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>has_instead_insert_row_trig<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/* ... */</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/* Compute stored generated columns */</span></span>
<span class="line">                <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * If the target is a plain table, check the constraints of</span>
<span class="line">                 * the tuple.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Also check the tuple against the partition constraint, if</span>
<span class="line">                 * there is one; except that if we got here via tuple-routing,</span>
<span class="line">                 * we don&#39;t need to if there&#39;s no BR trigger defined on the</span>
<span class="line">                 * partition.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* Store the slot in the multi-insert buffer, when enabled. */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI <span class="token operator">||</span> leafpart_use_multi_insert<span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * The slot previously might point into the per-tuple</span>
<span class="line">                     * context. For batching it needs to be longer lived.</span>
<span class="line">                     */</span></span>
<span class="line">                    <span class="token function">ExecMaterializeSlot</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/* Add this tuple to the tuple buffer */</span></span>
<span class="line">                    <span class="token function">CopyMultiInsertInfoStore</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                             resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span></span>
<span class="line">                                             cstate<span class="token operator">-&gt;</span>line_buf<span class="token punctuation">.</span>len<span class="token punctuation">,</span></span>
<span class="line">                                             cstate<span class="token operator">-&gt;</span>cur_lineno<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * If enough inserts have queued up, then flush all</span>
<span class="line">                     * buffers out to their tables.</span>
<span class="line">                     */</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">CopyMultiInsertInfoIsFull</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                        <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                                 resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                                 <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * We delay updating the row counter and progress of the</span>
<span class="line">                     * COPY command until after writing the tuples stored in</span>
<span class="line">                     * the buffer out to the table, as in single insert mode.</span>
<span class="line">                     * See CopyMultiInsertBufferFlush().</span>
<span class="line">                     */</span></span>
<span class="line">                    <span class="token keyword">continue</span><span class="token punctuation">;</span>   <span class="token comment">/* next tuple please */</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token keyword">else</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/* ... */</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Flush any remaining buffered tuples */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">!=</span> CIM_SINGLE<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">CopyMultiInsertInfoIsEmpty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> processed<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>达到 <code>CopyMultiInsertInfoIsFull</code> 的条件后，会触发调用 <code>CopyMultiInsertInfoFlush</code>，将所有缓存的元组一次性传入 Table AM 接口 <code>table_multi_insert</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Returns true if the buffers are full</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> bool</span>
<span class="line"><span class="token function">CopyMultiInsertInfoIsFull</span><span class="token punctuation">(</span>CopyMultiInsertInfo <span class="token operator">*</span>miinfo<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>miinfo<span class="token operator">-&gt;</span>bufferedTuples <span class="token operator">&gt;=</span> MAX_BUFFERED_TUPLES <span class="token operator">||</span></span>
<span class="line">        miinfo<span class="token operator">-&gt;</span>bufferedBytes <span class="token operator">&gt;=</span> MAX_BUFFERED_BYTES<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> false<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Write out all stored tuples in all buffers out to the tables.</span>
<span class="line"> *</span>
<span class="line"> * Once flushed we also trim the tracked buffers list down to size by removing</span>
<span class="line"> * the buffers created earliest first.</span>
<span class="line"> *</span>
<span class="line"> * Callers should pass &#39;curr_rri&#39; as the ResultRelInfo that&#39;s currently being</span>
<span class="line"> * used.  When cleaning up old buffers we&#39;ll never remove the one for</span>
<span class="line"> * &#39;curr_rri&#39;.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span>CopyMultiInsertInfo <span class="token operator">*</span>miinfo<span class="token punctuation">,</span> ResultRelInfo <span class="token operator">*</span>curr_rri<span class="token punctuation">,</span></span>
<span class="line">                         int64 <span class="token operator">*</span>processed<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ListCell   <span class="token operator">*</span>lc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">foreach</span><span class="token punctuation">(</span>lc<span class="token punctuation">,</span> miinfo<span class="token operator">-&gt;</span>multiInsertBuffers<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        CopyMultiInsertBuffer <span class="token operator">*</span>buffer <span class="token operator">=</span> <span class="token punctuation">(</span>CopyMultiInsertBuffer <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">lfirst</span><span class="token punctuation">(</span>lc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">CopyMultiInsertBufferFlush</span><span class="token punctuation">(</span>miinfo<span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    miinfo<span class="token operator">-&gt;</span>bufferedTuples <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    miinfo<span class="token operator">-&gt;</span>bufferedBytes <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Write the tuples stored in &#39;buffer&#39; out to the table.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">CopyMultiInsertBufferFlush</span><span class="token punctuation">(</span>CopyMultiInsertInfo <span class="token operator">*</span>miinfo<span class="token punctuation">,</span></span>
<span class="line">                           CopyMultiInsertBuffer <span class="token operator">*</span>buffer<span class="token punctuation">,</span></span>
<span class="line">                           int64 <span class="token operator">*</span>processed<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * table_multi_insert may leak memory, so switch to short-lived memory</span>
<span class="line">         * context before calling it.</span>
<span class="line">         */</span></span>
<span class="line">        oldcontext <span class="token operator">=</span> <span class="token function">MemoryContextSwitchTo</span><span class="token punctuation">(</span><span class="token function">GetPerTupleMemoryContext</span><span class="token punctuation">(</span>estate<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">table_multi_insert</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">,</span></span>
<span class="line">                           slots<span class="token punctuation">,</span></span>
<span class="line">                           nused<span class="token punctuation">,</span></span>
<span class="line">                           mycid<span class="token punctuation">,</span></span>
<span class="line">                           ti_options<span class="token punctuation">,</span></span>
<span class="line">                           buffer<span class="token operator">-&gt;</span>bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">MemoryContextSwitchTo</span><span class="token punctuation">(</span>oldcontext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Mark that all slots are free */</span></span>
<span class="line">    buffer<span class="token operator">-&gt;</span>nused <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="table-access-method" tabindex="-1"><a class="header-anchor" href="#table-access-method"><span>Table Access Method</span></a></h2><p>此时两种 SQL 语法的执行都已进入 Table AM 层。可以看到两者在执行层算法存在区别的原因是最终使用的 Table AM 接口不同。所以接下来对比下 Heap AM 如何实现这两个 Table AM 接口：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Insert a tuple from a slot into table AM routine.</span>
<span class="line"> *</span>
<span class="line"> * ...</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">table_tuple_insert</span><span class="token punctuation">(</span>Relation rel<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span>slot<span class="token punctuation">,</span> CommandId cid<span class="token punctuation">,</span></span>
<span class="line">                   <span class="token keyword">int</span> options<span class="token punctuation">,</span> <span class="token keyword">struct</span> <span class="token class-name">BulkInsertStateData</span> <span class="token operator">*</span>bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    rel<span class="token operator">-&gt;</span>rd_tableam<span class="token operator">-&gt;</span><span class="token function">tuple_insert</span><span class="token punctuation">(</span>rel<span class="token punctuation">,</span> slot<span class="token punctuation">,</span> cid<span class="token punctuation">,</span> options<span class="token punctuation">,</span></span>
<span class="line">                                  bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Insert multiple tuples into a table.</span>
<span class="line"> *</span>
<span class="line"> * ...</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">table_multi_insert</span><span class="token punctuation">(</span>Relation rel<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>slots<span class="token punctuation">,</span> <span class="token keyword">int</span> nslots<span class="token punctuation">,</span></span>
<span class="line">                   CommandId cid<span class="token punctuation">,</span> <span class="token keyword">int</span> options<span class="token punctuation">,</span> <span class="token keyword">struct</span> <span class="token class-name">BulkInsertStateData</span> <span class="token operator">*</span>bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    rel<span class="token operator">-&gt;</span>rd_tableam<span class="token operator">-&gt;</span><span class="token function">multi_insert</span><span class="token punctuation">(</span>rel<span class="token punctuation">,</span> slots<span class="token punctuation">,</span> nslots<span class="token punctuation">,</span></span>
<span class="line">                                  cid<span class="token punctuation">,</span> options<span class="token punctuation">,</span> bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* ------------------------------------------------------------------------</span>
<span class="line"> * Definition of the heap table access method.</span>
<span class="line"> * ------------------------------------------------------------------------</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">const</span> TableAmRoutine heapam_methods <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">.</span>type <span class="token operator">=</span> T_TableAmRoutine<span class="token punctuation">,</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">.</span>tuple_insert <span class="token operator">=</span> heapam_tuple_insert<span class="token punctuation">,</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">.</span>multi_insert <span class="token operator">=</span> heap_multi_insert<span class="token punctuation">,</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Heap AM 通过 <code>heapam_tuple_insert</code> 函数实现了 <code>tuple_insert</code> 接口，主要逻辑位于 <code>heap_insert</code> 函数中。输入的 <code>TupleTableSlot</code> 此时还是一个纯内存状态的元组，在它能够被真正插入表之前，还需要做几件事：</p><ol><li><code>heap_prepare_insert</code>：填充元组头部的标志位、事务 ID 等用于 MVCC 可见性判断的信息</li><li><code>RelationGetBufferForTuple</code>：找一个能够放得下这个元组的数据页，并锁定；如果找不到任何空闲页面，则将物理文件扩展一个新页面</li><li><code>RelationPutHeapTuple</code>：将元组放入数据页对应的 buffer 中，并把这个 buffer 标记为脏页</li><li>将这一行元组的修改记录到 WAL 日志中</li><li>释放锁</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> *  heap_insert     - insert tuple into a heap</span>
<span class="line"> *</span>
<span class="line"> * The new tuple is stamped with current transaction ID and the specified</span>
<span class="line"> * command ID.</span>
<span class="line"> *</span>
<span class="line"> * See table_tuple_insert for comments about most of the input flags, except</span>
<span class="line"> * that this routine directly takes a tuple rather than a slot.</span>
<span class="line"> *</span>
<span class="line"> * There&#39;s corresponding HEAP_INSERT_ options to all the TABLE_INSERT_</span>
<span class="line"> * options, and there additionally is HEAP_INSERT_SPECULATIVE which is used to</span>
<span class="line"> * implement table_tuple_insert_speculative().</span>
<span class="line"> *</span>
<span class="line"> * On return the header fields of *tup are updated to match the stored tuple;</span>
<span class="line"> * in particular tup-&gt;t_self receives the actual TID where the tuple was</span>
<span class="line"> * stored.  But note that any toasting of fields within the tuple data is NOT</span>
<span class="line"> * reflected into *tup.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">heap_insert</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> HeapTuple tup<span class="token punctuation">,</span> CommandId cid<span class="token punctuation">,</span></span>
<span class="line">            <span class="token keyword">int</span> options<span class="token punctuation">,</span> BulkInsertState bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Fill in tuple header fields and toast the tuple if necessary.</span>
<span class="line">     *</span>
<span class="line">     * Note: below this point, heaptup is the data we actually intend to store</span>
<span class="line">     * into the relation; tup is the caller&#39;s original untoasted data.</span>
<span class="line">     */</span></span>
<span class="line">    heaptup <span class="token operator">=</span> <span class="token function">heap_prepare_insert</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> tup<span class="token punctuation">,</span> xid<span class="token punctuation">,</span> cid<span class="token punctuation">,</span> options<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Find buffer to insert this tuple into.  If the page is all visible,</span>
<span class="line">     * this will also pin the requisite visibility map page.</span>
<span class="line">     */</span></span>
<span class="line">    buffer <span class="token operator">=</span> <span class="token function">RelationGetBufferForTuple</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> heaptup<span class="token operator">-&gt;</span>t_len<span class="token punctuation">,</span></span>
<span class="line">                                       InvalidBuffer<span class="token punctuation">,</span> options<span class="token punctuation">,</span> bistate<span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token operator">&amp;</span>vmbuffer<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* NO EREPORT(ERROR) from here till changes are logged */</span></span>
<span class="line">    <span class="token function">START_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">RelationPutHeapTuple</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> heaptup<span class="token punctuation">,</span></span>
<span class="line">                         <span class="token punctuation">(</span>options <span class="token operator">&amp;</span> HEAP_INSERT_SPECULATIVE<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * XXX Should we set PageSetPrunable on this page ?</span>
<span class="line">     *</span>
<span class="line">     * The inserting transaction may eventually abort thus making this tuple</span>
<span class="line">     * DEAD and hence available for pruning. Though we don&#39;t want to optimize</span>
<span class="line">     * for aborts, if no other tuple in this page is UPDATEd/DELETEd, the</span>
<span class="line">     * aborted tuple will never be pruned until next vacuum is triggered.</span>
<span class="line">     *</span>
<span class="line">     * If you do add PageSetPrunable here, add it in heap_xlog_insert too.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">MarkBufferDirty</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* XLOG stuff */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">RelationNeedsWAL</span><span class="token punctuation">(</span>relation<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">END_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">UnlockReleaseBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vmbuffer <span class="token operator">!=</span> InvalidBuffer<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ReleaseBuffer</span><span class="token punctuation">(</span>vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另一边，<code>heap_multi_insert</code> 函数用于实现 <code>multi_insert</code> 这个 Table AM 接口。与前一个 Table AM 接口 <code>tuple_insert</code> 的区别是传入了一个 <code>TupleTableSlot</code> 数组。要将这些元组插入表中要做的事情也是类似的，但有一些区别：</p><ol><li>依旧需要通过 <code>heap_prepare_insert</code> 填充每一个待插入元组的头部</li><li><code>heap_multi_insert_pages</code>：根据待插入的元组所需要的总空间和预期在每个数据页中保留的空闲空间，计算出插入这一批元组需要多少个页面的空间</li><li>同样通过 <code>RelationGetBufferForTuple</code> 找到一个能够放下当前正在插入的元组的数据页，并锁定；如果已没有空闲页面了，则根据上一步计算出的空闲页面需求，一次性扩展物理文件到满足需求的长度</li><li>依旧通过 <code>RelationPutHeapTuple</code> 将当前元组放入数据页对应的 buffer 中</li><li>如果当前锁住的数据页还有空闲空间，则继续放入下一个待插入元组，直到元组全部已经插入完毕，或数据页中已经没有空闲空间为止</li><li>将当前 buffer 标记为脏页</li><li>将插入到这一个 buffer 内的所有元组记录到 WAL 日志中</li><li>释放锁</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> *  heap_multi_insert   - insert multiple tuples into a heap</span>
<span class="line"> *</span>
<span class="line"> * This is like heap_insert(), but inserts multiple tuples in one operation.</span>
<span class="line"> * That&#39;s faster than calling heap_insert() in a loop, because when multiple</span>
<span class="line"> * tuples can be inserted on a single page, we can write just a single WAL</span>
<span class="line"> * record covering all of them, and only need to lock/unlock the page once.</span>
<span class="line"> *</span>
<span class="line"> * Note: this leaks memory into the current memory context. You can create a</span>
<span class="line"> * temporary context before calling this, if that&#39;s a problem.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">heap_multi_insert</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>slots<span class="token punctuation">,</span> <span class="token keyword">int</span> ntuples<span class="token punctuation">,</span></span>
<span class="line">                  CommandId cid<span class="token punctuation">,</span> <span class="token keyword">int</span> options<span class="token punctuation">,</span> BulkInsertState bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    saveFreeSpace <span class="token operator">=</span> <span class="token function">RelationGetTargetPageFreeSpace</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span></span>
<span class="line">                                                   HEAP_DEFAULT_FILLFACTOR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Toast and set header data in all the slots */</span></span>
<span class="line">    heaptuples <span class="token operator">=</span> <span class="token function">palloc</span><span class="token punctuation">(</span>ntuples <span class="token operator">*</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>HeapTuple<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> ntuples<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        HeapTuple   tuple<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        tuple <span class="token operator">=</span> <span class="token function">ExecFetchSlotHeapTuple</span><span class="token punctuation">(</span>slots<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> true<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        slots<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>relation<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        tuple<span class="token operator">-&gt;</span>t_tableOid <span class="token operator">=</span> slots<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>tts_tableOid<span class="token punctuation">;</span></span>
<span class="line">        heaptuples<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">heap_prepare_insert</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> tuple<span class="token punctuation">,</span> xid<span class="token punctuation">,</span> cid<span class="token punctuation">,</span></span>
<span class="line">                                            options<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    ndone <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>ndone <span class="token operator">&lt;</span> ntuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        Buffer      buffer<span class="token punctuation">;</span></span>
<span class="line">        bool        all_visible_cleared <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        bool        all_frozen_set <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span>         nthispage<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">CHECK_FOR_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Compute number of pages needed to fit the to-be-inserted tuples in</span>
<span class="line">         * the worst case.  This will be used to determine how much to extend</span>
<span class="line">         * the relation by in RelationGetBufferForTuple(), if needed.  If we</span>
<span class="line">         * filled a prior page from scratch, we can just update our last</span>
<span class="line">         * computation, but if we started with a partially filled page,</span>
<span class="line">         * recompute from scratch, the number of potentially required pages</span>
<span class="line">         * can vary due to tuples needing to fit onto the page, page headers</span>
<span class="line">         * etc.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ndone <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">||</span> <span class="token operator">!</span>starting_with_empty_page<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            npages <span class="token operator">=</span> <span class="token function">heap_multi_insert_pages</span><span class="token punctuation">(</span>heaptuples<span class="token punctuation">,</span> ndone<span class="token punctuation">,</span> ntuples<span class="token punctuation">,</span></span>
<span class="line">                                             saveFreeSpace<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            npages_used <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            npages_used<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Find buffer where at least the next tuple will fit.  If the page is</span>
<span class="line">         * all-visible, this will also pin the requisite visibility map page.</span>
<span class="line">         *</span>
<span class="line">         * Also pin visibility map page if COPY FREEZE inserts tuples into an</span>
<span class="line">         * empty page. See all_frozen_set below.</span>
<span class="line">         */</span></span>
<span class="line">        buffer <span class="token operator">=</span> <span class="token function">RelationGetBufferForTuple</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> heaptuples<span class="token punctuation">[</span>ndone<span class="token punctuation">]</span><span class="token operator">-&gt;</span>t_len<span class="token punctuation">,</span></span>
<span class="line">                                           InvalidBuffer<span class="token punctuation">,</span> options<span class="token punctuation">,</span> bistate<span class="token punctuation">,</span></span>
<span class="line">                                           <span class="token operator">&amp;</span>vmbuffer<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                                           npages <span class="token operator">-</span> npages_used<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        page <span class="token operator">=</span> <span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        starting_with_empty_page <span class="token operator">=</span> <span class="token function">PageGetMaxOffsetNumber</span><span class="token punctuation">(</span>page<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>starting_with_empty_page <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>options <span class="token operator">&amp;</span> HEAP_INSERT_FROZEN<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            all_frozen_set <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* NO EREPORT(ERROR) from here till changes are logged */</span></span>
<span class="line">        <span class="token function">START_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * RelationGetBufferForTuple has ensured that the first tuple fits.</span>
<span class="line">         * Put that on the page, and then as many other tuples as fit.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">RelationPutHeapTuple</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> heaptuples<span class="token punctuation">[</span>ndone<span class="token punctuation">]</span><span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>nthispage <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> ndone <span class="token operator">+</span> nthispage <span class="token operator">&lt;</span> ntuples<span class="token punctuation">;</span> nthispage<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            HeapTuple   heaptup <span class="token operator">=</span> heaptuples<span class="token punctuation">[</span>ndone <span class="token operator">+</span> nthispage<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PageGetHeapFreeSpace</span><span class="token punctuation">(</span>page<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token function">MAXALIGN</span><span class="token punctuation">(</span>heaptup<span class="token operator">-&gt;</span>t_len<span class="token punctuation">)</span> <span class="token operator">+</span> saveFreeSpace<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">RelationPutHeapTuple</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> heaptup<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * XXX Should we set PageSetPrunable on this page ? See heap_insert()</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">MarkBufferDirty</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* XLOG stuff */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>needwal<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">END_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">UnlockReleaseBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        ndone <span class="token operator">+=</span> nthispage<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * NB: Only release vmbuffer after inserting all tuples - it&#39;s fairly</span>
<span class="line">         * likely that we&#39;ll insert into subsequent heap pages that are likely</span>
<span class="line">         * to use the same vm page.</span>
<span class="line">         */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* We&#39;re done with inserting all tuples, so release the last vmbuffer. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vmbuffer <span class="token operator">!=</span> InvalidBuffer<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ReleaseBuffer</span><span class="token punctuation">(</span>vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对比上述两种实现，当批量插入多行数据时，<code>heap_multi_insert</code> 比 <code>heap_insert</code> 更具优势。</p><p>首先是物理文件的扩展频率变低了。在调用 <code>RelationGetBufferForTuple</code> 函数之前，<code>heap_multi_insert</code> 中已经预计算了这一批元组所需要的整体空闲空间。当表中找不到任何有空闲空间的数据页而必须扩展文件长度时，<code>heap_multi_insert</code> 可以一次性扩展多个页面。扩展页面是一个同步路径上的 I/O 操作，受到 I/O 时延的影响；并且在做页面扩展时是需要互斥加锁的。所以页面扩展的频率越低，浪费在 I/O 等待上的时间就越少，多进程扩展页面时的加锁冲突也越少。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">Buffer</span>
<span class="line"><span class="token function">RelationGetBufferForTuple</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> Size len<span class="token punctuation">,</span></span>
<span class="line">                          Buffer otherBuffer<span class="token punctuation">,</span> <span class="token keyword">int</span> options<span class="token punctuation">,</span></span>
<span class="line">                          BulkInsertState bistate<span class="token punctuation">,</span></span>
<span class="line">                          Buffer <span class="token operator">*</span>vmbuffer<span class="token punctuation">,</span> Buffer <span class="token operator">*</span>vmbuffer_other<span class="token punctuation">,</span></span>
<span class="line">                          <span class="token keyword">int</span> num_pages<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Have to extend the relation */</span></span>
<span class="line">    buffer <span class="token operator">=</span> <span class="token function">RelationAddBlocks</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> bistate<span class="token punctuation">,</span> num_pages<span class="token punctuation">,</span> use_fsm<span class="token punctuation">,</span></span>
<span class="line">                               <span class="token operator">&amp;</span>unlockedTargetBuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Implementation of ExtendBufferedRelBy() and ExtendBufferedRelTo() for</span>
<span class="line"> * shared buffers.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> BlockNumber</span>
<span class="line"><span class="token function">ExtendBufferedRelShared</span><span class="token punctuation">(</span>BufferManagerRelation bmr<span class="token punctuation">,</span></span>
<span class="line">                        ForkNumber fork<span class="token punctuation">,</span></span>
<span class="line">                        BufferAccessStrategy strategy<span class="token punctuation">,</span></span>
<span class="line">                        uint32 flags<span class="token punctuation">,</span></span>
<span class="line">                        uint32 extend_by<span class="token punctuation">,</span></span>
<span class="line">                        BlockNumber extend_upto<span class="token punctuation">,</span></span>
<span class="line">                        Buffer <span class="token operator">*</span>buffers<span class="token punctuation">,</span></span>
<span class="line">                        uint32 <span class="token operator">*</span>extended_by<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Lock relation against concurrent extensions, unless requested not to.</span>
<span class="line">     *</span>
<span class="line">     * We use the same extension lock for all forks. That&#39;s unnecessarily</span>
<span class="line">     * restrictive, but currently extensions for forks don&#39;t happen often</span>
<span class="line">     * enough to make it worth locking more granularly.</span>
<span class="line">     *</span>
<span class="line">     * Note that another backend might have extended the relation by the time</span>
<span class="line">     * we get the lock.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>flags <span class="token operator">&amp;</span> EB_SKIP_EXTENSION_LOCK<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">LockRelationForExtension</span><span class="token punctuation">(</span>bmr<span class="token punctuation">.</span>rel<span class="token punctuation">,</span> ExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If requested, invalidate size cache, so that smgrnblocks asks the</span>
<span class="line">     * kernel.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>flags <span class="token operator">&amp;</span> EB_CLEAR_SIZE_CACHE<span class="token punctuation">)</span></span>
<span class="line">        bmr<span class="token punctuation">.</span>smgr<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>fork<span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    first_block <span class="token operator">=</span> <span class="token function">smgrnblocks</span><span class="token punctuation">(</span>bmr<span class="token punctuation">.</span>smgr<span class="token punctuation">,</span> fork<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Note: if smgrzeroextend fails, we will end up with buffers that are</span>
<span class="line">     * allocated but not marked BM_VALID.  The next relation extension will</span>
<span class="line">     * still select the same block number (because the relation didn&#39;t get any</span>
<span class="line">     * longer on disk) and so future attempts to extend the relation will find</span>
<span class="line">     * the same buffers (if they have not been recycled) but come right back</span>
<span class="line">     * here to try smgrzeroextend again.</span>
<span class="line">     *</span>
<span class="line">     * We don&#39;t need to set checksum for all-zero pages.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">smgrzeroextend</span><span class="token punctuation">(</span>bmr<span class="token punctuation">.</span>smgr<span class="token punctuation">,</span> fork<span class="token punctuation">,</span> first_block<span class="token punctuation">,</span> extend_by<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Release the file-extension lock; it&#39;s now OK for someone else to extend</span>
<span class="line">     * the relation some more.</span>
<span class="line">     *</span>
<span class="line">     * We remove IO_IN_PROGRESS after this, as waking up waiting backends can</span>
<span class="line">     * take noticeable time.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>flags <span class="token operator">&amp;</span> EB_SKIP_EXTENSION_LOCK<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">UnlockRelationForExtension</span><span class="token punctuation">(</span>bmr<span class="token punctuation">.</span>rel<span class="token punctuation">,</span> ExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其次是页面空闲空间的搜索代价和数据页的锁定频率也变低了。为了找到一个具有足够空间放入当前元组的数据页，需要使用 <a href="https://www.postgresql.org/docs/current/storage-fsm.html" target="_blank" rel="noopener noreferrer">Free Space Map (FSM)</a>，但 FSM 中的信息不一定是准确的。在找到一个目标数据页以后，必须对这个页面加锁，然后查看这个页面的空闲空间是否真的足够。如果不够，还需要把锁释放掉并更新 FSM，然后重新搜索。这个过程中数据页面和 FSM 页面都会有较多的锁竞争。而 <code>heap_multi_insert</code> 中，在锁住一个确认能够放得下当前元组的数据页后，还会将后续的元组也一次性插入到这个页面上，直到这个页面放不下。对于插入到这个页面内的后续元组来说，空闲空间搜索和页面锁定的开销就被省掉了。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">Buffer</span>
<span class="line"><span class="token function">RelationGetBufferForTuple</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> Size len<span class="token punctuation">,</span></span>
<span class="line">                          Buffer otherBuffer<span class="token punctuation">,</span> <span class="token keyword">int</span> options<span class="token punctuation">,</span></span>
<span class="line">                          BulkInsertState bistate<span class="token punctuation">,</span></span>
<span class="line">                          Buffer <span class="token operator">*</span>vmbuffer<span class="token punctuation">,</span> Buffer <span class="token operator">*</span>vmbuffer_other<span class="token punctuation">,</span></span>
<span class="line">                          <span class="token keyword">int</span> num_pages<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    bool        use_fsm <span class="token operator">=</span> <span class="token operator">!</span><span class="token punctuation">(</span>options <span class="token operator">&amp;</span> HEAP_INSERT_SKIP_FSM<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Compute desired extra freespace due to fillfactor option */</span></span>
<span class="line">    saveFreeSpace <span class="token operator">=</span> <span class="token function">RelationGetTargetPageFreeSpace</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span></span>
<span class="line">                                                   HEAP_DEFAULT_FILLFACTOR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We first try to put the tuple on the same page we last inserted a tuple</span>
<span class="line">     * on, as cached in the BulkInsertState or relcache entry.  If that</span>
<span class="line">     * doesn&#39;t work, we ask the Free Space Map to locate a suitable page.</span>
<span class="line">     * Since the FSM&#39;s info might be out of date, we have to be prepared to</span>
<span class="line">     * loop around and retry multiple times. (To ensure this isn&#39;t an infinite</span>
<span class="line">     * loop, we must update the FSM with the correct amount of free space on</span>
<span class="line">     * each page that proves not to be suitable.)  If the FSM has no record of</span>
<span class="line">     * a page with enough free space, we give up and extend the relation.</span>
<span class="line">     *</span>
<span class="line">     * When use_fsm is false, we either put the tuple onto the existing target</span>
<span class="line">     * page or extend the relation.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>bistate <span class="token operator">&amp;&amp;</span> bistate<span class="token operator">-&gt;</span>current_buf <span class="token operator">!=</span> InvalidBuffer<span class="token punctuation">)</span></span>
<span class="line">        targetBlock <span class="token operator">=</span> <span class="token function">BufferGetBlockNumber</span><span class="token punctuation">(</span>bistate<span class="token operator">-&gt;</span>current_buf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        targetBlock <span class="token operator">=</span> <span class="token function">RelationGetTargetBlock</span><span class="token punctuation">(</span>relation<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>targetBlock <span class="token operator">==</span> InvalidBlockNumber <span class="token operator">&amp;&amp;</span> use_fsm<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We have no cached target page, so ask the FSM for an initial</span>
<span class="line">         * target.</span>
<span class="line">         */</span></span>
<span class="line">        targetBlock <span class="token operator">=</span> <span class="token function">GetPageWithFreeSpace</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetFreeSpace<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If the FSM knows nothing of the rel, try the last page before we give</span>
<span class="line">     * up and extend.  This avoids one-tuple-per-page syndrome during</span>
<span class="line">     * bootstrapping or in a recently-started system.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>targetBlock <span class="token operator">==</span> InvalidBlockNumber<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        BlockNumber nblocks <span class="token operator">=</span> <span class="token function">RelationGetNumberOfBlocks</span><span class="token punctuation">(</span>relation<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>nblocks <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            targetBlock <span class="token operator">=</span> nblocks <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">loop<span class="token operator">:</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>targetBlock <span class="token operator">!=</span> InvalidBlockNumber<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Read and exclusive-lock the target block, as well as the other</span>
<span class="line">         * block if one was given, taking suitable care with lock ordering and</span>
<span class="line">         * the possibility they are the same block.</span>
<span class="line">         *</span>
<span class="line">         * If the page-level all-visible flag is set, caller will need to</span>
<span class="line">         * clear both that and the corresponding visibility map bit.  However,</span>
<span class="line">         * by the time we return, we&#39;ll have x-locked the buffer, and we don&#39;t</span>
<span class="line">         * want to do any I/O while in that state.  So we check the bit here</span>
<span class="line">         * before taking the lock, and pin the page if it appears necessary.</span>
<span class="line">         * Checking without the lock creates a risk of getting the wrong</span>
<span class="line">         * answer, so we&#39;ll have to recheck after acquiring the lock.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>otherBuffer <span class="token operator">==</span> InvalidBuffer<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* easy case */</span></span>
<span class="line">            buffer <span class="token operator">=</span> <span class="token function">ReadBufferBI</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> RBM_NORMAL<span class="token punctuation">,</span> bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PageIsAllVisible</span><span class="token punctuation">(</span><span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">visibilitymap_pin</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * If the page is empty, pin vmbuffer to set all_frozen bit later.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>options <span class="token operator">&amp;</span> HEAP_INSERT_FROZEN<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">PageGetMaxOffsetNumber</span><span class="token punctuation">(</span><span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">visibilitymap_pin</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>otherBlock <span class="token operator">==</span> targetBlock<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* also easy case */</span></span>
<span class="line">            buffer <span class="token operator">=</span> otherBuffer<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PageIsAllVisible</span><span class="token punctuation">(</span><span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">visibilitymap_pin</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>otherBlock <span class="token operator">&lt;</span> targetBlock<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* lock other buffer first */</span></span>
<span class="line">            buffer <span class="token operator">=</span> <span class="token function">ReadBuffer</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PageIsAllVisible</span><span class="token punctuation">(</span><span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">visibilitymap_pin</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>otherBuffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* lock target buffer first */</span></span>
<span class="line">            buffer <span class="token operator">=</span> <span class="token function">ReadBuffer</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">PageIsAllVisible</span><span class="token punctuation">(</span><span class="token function">BufferGetPage</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">visibilitymap_pin</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>otherBuffer<span class="token punctuation">,</span> BUFFER_LOCK_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        pageFreeSpace <span class="token operator">=</span> <span class="token function">PageGetHeapFreeSpace</span><span class="token punctuation">(</span>page<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>targetFreeSpace <span class="token operator">&lt;=</span> pageFreeSpace<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* use this page as future insert target, too */</span></span>
<span class="line">            <span class="token function">RelationSetTargetBlock</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> buffer<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Not enough space, so we must give up our page locks and pin (if</span>
<span class="line">         * any) and prepare to look elsewhere.  We don&#39;t care which order we</span>
<span class="line">         * unlock the two buffers in, so this can be slightly simpler than the</span>
<span class="line">         * code above.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">LockBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">,</span> BUFFER_LOCK_UNLOCK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>otherBuffer <span class="token operator">==</span> InvalidBuffer<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ReleaseBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>otherBlock <span class="token operator">!=</span> targetBlock<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">LockBuffer</span><span class="token punctuation">(</span>otherBuffer<span class="token punctuation">,</span> BUFFER_LOCK_UNLOCK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ReleaseBuffer</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Is there an ongoing bulk extension? */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>bistate <span class="token operator">&amp;&amp;</span> bistate<span class="token operator">-&gt;</span>next_free <span class="token operator">!=</span> InvalidBlockNumber<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>bistate<span class="token operator">-&gt;</span>next_free <span class="token operator">&lt;=</span> bistate<span class="token operator">-&gt;</span>last_free<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * We bulk extended the relation before, and there are still some</span>
<span class="line">             * unused pages from that extension, so we don&#39;t need to look in</span>
<span class="line">             * the FSM for a new page. But do record the free space from the</span>
<span class="line">             * last page, somebody might insert narrower tuples later.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>use_fsm<span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">RecordPageWithFreeSpace</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span> targetBlock<span class="token punctuation">,</span> pageFreeSpace<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            targetBlock <span class="token operator">=</span> bistate<span class="token operator">-&gt;</span>next_free<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>bistate<span class="token operator">-&gt;</span>next_free <span class="token operator">&gt;=</span> bistate<span class="token operator">-&gt;</span>last_free<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                bistate<span class="token operator">-&gt;</span>next_free <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">                bistate<span class="token operator">-&gt;</span>last_free <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                bistate<span class="token operator">-&gt;</span>next_free<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>use_fsm<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* Without FSM, always fall out of the loop and extend */</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Update FSM as to condition of this page, and ask for another</span>
<span class="line">             * page to try.</span>
<span class="line">             */</span></span>
<span class="line">            targetBlock <span class="token operator">=</span> <span class="token function">RecordAndGetPageWithFreeSpace</span><span class="token punctuation">(</span>relation<span class="token punctuation">,</span></span>
<span class="line">                                                        targetBlock<span class="token punctuation">,</span></span>
<span class="line">                                                        pageFreeSpace<span class="token punctuation">,</span></span>
<span class="line">                                                        targetFreeSpace<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="wal-日志" tabindex="-1"><a class="header-anchor" href="#wal-日志"><span>WAL 日志</span></a></h2><p>在上面两个 Heap AM 函数的分析中，记录 WAL 日志的部分被我暂时隐去了。在 WAL 日志层面，两者最显著的区别是，<code>heap_multi_insert</code> 需要记录一个页面上插入的多个元组，而 <code>heap_insert</code> 只需要记录一个页面上插入的一个元组。</p><p><code>heap_insert</code> 通过插入一条 <code>XLOG_HEAP_INSERT</code> 类型的 Heap 日志记录对页面的修改：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">heap_insert</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> HeapTuple tup<span class="token punctuation">,</span> CommandId cid<span class="token punctuation">,</span></span>
<span class="line">            <span class="token keyword">int</span> options<span class="token punctuation">,</span> BulkInsertState bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* XLOG stuff */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">RelationNeedsWAL</span><span class="token punctuation">(</span>relation<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">        uint8       info <span class="token operator">=</span> XLOG_HEAP_INSERT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">XLogBeginInsert</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">XLogRegisterData</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span>xlrec<span class="token punctuation">,</span> SizeOfHeapInsert<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        xlhdr<span class="token punctuation">.</span>t_infomask2 <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_infomask2<span class="token punctuation">;</span></span>
<span class="line">        xlhdr<span class="token punctuation">.</span>t_infomask <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_infomask<span class="token punctuation">;</span></span>
<span class="line">        xlhdr<span class="token punctuation">.</span>t_hoff <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_hoff<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * note we mark xlhdr as belonging to buffer; if XLogInsert decides to</span>
<span class="line">         * write the whole page to the xlog, we don&#39;t need to store</span>
<span class="line">         * xl_heap_header in the xlog.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">XLogRegisterBuffer</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> REGBUF_STANDARD <span class="token operator">|</span> bufflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">XLogRegisterBufData</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span>xlhdr<span class="token punctuation">,</span> SizeOfHeapHeader<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* PG73FORMAT: write bitmap [+ padding] [+ oid] + data */</span></span>
<span class="line">        <span class="token function">XLogRegisterBufData</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> heaptup<span class="token operator">-&gt;</span>t_data <span class="token operator">+</span> SizeofHeapTupleHeader<span class="token punctuation">,</span></span>
<span class="line">                            heaptup<span class="token operator">-&gt;</span>t_len <span class="token operator">-</span> SizeofHeapTupleHeader<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* filtering by origin on a row level is much more efficient */</span></span>
<span class="line">        <span class="token function">XLogSetRecordFlags</span><span class="token punctuation">(</span>XLOG_INCLUDE_ORIGIN<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        recptr <span class="token operator">=</span> <span class="token function">XLogInsert</span><span class="token punctuation">(</span>RM_HEAP_ID<span class="token punctuation">,</span> info<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">PageSetLSN</span><span class="token punctuation">(</span>page<span class="token punctuation">,</span> recptr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而 <code>heap_multi_insert</code> 并不是通过多条 Heap 日志来记录在页面中插入的多行数据，而是通过记录一条 <code>XLOG_HEAP2_MULTI_INSERT</code> 类型的 Heap2 日志，一次搞定。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">heap_multi_insert</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">,</span> TupleTableSlot <span class="token operator">*</span><span class="token operator">*</span>slots<span class="token punctuation">,</span> <span class="token keyword">int</span> ntuples<span class="token punctuation">,</span></span>
<span class="line">                  CommandId cid<span class="token punctuation">,</span> <span class="token keyword">int</span> options<span class="token punctuation">,</span> BulkInsertState bistate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    ndone <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>ndone <span class="token operator">&lt;</span> ntuples<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* XLOG stuff */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>needwal<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line">            uint8       info <span class="token operator">=</span> XLOG_HEAP2_MULTI_INSERT<span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Write out an xl_multi_insert_tuple and the tuple data itself</span>
<span class="line">             * for each tuple.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nthispage<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                HeapTuple   heaptup <span class="token operator">=</span> heaptuples<span class="token punctuation">[</span>ndone <span class="token operator">+</span> i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">                xl_multi_insert_tuple <span class="token operator">*</span>tuphdr<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">int</span>         datalen<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>init<span class="token punctuation">)</span></span>
<span class="line">                    xlrec<span class="token operator">-&gt;</span>offsets<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">ItemPointerGetOffsetNumber</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>heaptup<span class="token operator">-&gt;</span>t_self<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token comment">/* xl_multi_insert_tuple needs two-byte alignment. */</span></span>
<span class="line">                tuphdr <span class="token operator">=</span> <span class="token punctuation">(</span>xl_multi_insert_tuple <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">SHORTALIGN</span><span class="token punctuation">(</span>scratchptr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                scratchptr <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> tuphdr<span class="token punctuation">)</span> <span class="token operator">+</span> SizeOfMultiInsertTuple<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                tuphdr<span class="token operator">-&gt;</span>t_infomask2 <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_infomask2<span class="token punctuation">;</span></span>
<span class="line">                tuphdr<span class="token operator">-&gt;</span>t_infomask <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_infomask<span class="token punctuation">;</span></span>
<span class="line">                tuphdr<span class="token operator">-&gt;</span>t_hoff <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_data<span class="token operator">-&gt;</span>t_hoff<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* write bitmap [+ padding] [+ oid] + data */</span></span>
<span class="line">                datalen <span class="token operator">=</span> heaptup<span class="token operator">-&gt;</span>t_len <span class="token operator">-</span> SizeofHeapTupleHeader<span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">memcpy</span><span class="token punctuation">(</span>scratchptr<span class="token punctuation">,</span></span>
<span class="line">                       <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> heaptup<span class="token operator">-&gt;</span>t_data <span class="token operator">+</span> SizeofHeapTupleHeader<span class="token punctuation">,</span></span>
<span class="line">                       datalen<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                tuphdr<span class="token operator">-&gt;</span>datalen <span class="token operator">=</span> datalen<span class="token punctuation">;</span></span>
<span class="line">                scratchptr <span class="token operator">+=</span> datalen<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            totaldatalen <span class="token operator">=</span> scratchptr <span class="token operator">-</span> tupledata<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token punctuation">(</span>scratchptr <span class="token operator">-</span> scratch<span class="token punctuation">.</span>data<span class="token punctuation">)</span> <span class="token operator">&lt;</span> BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">XLogBeginInsert</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">XLogRegisterData</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> xlrec<span class="token punctuation">,</span> tupledata <span class="token operator">-</span> scratch<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">XLogRegisterBuffer</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> REGBUF_STANDARD <span class="token operator">|</span> bufflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">XLogRegisterBufData</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> tupledata<span class="token punctuation">,</span> totaldatalen<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* filtering by origin on a row level is much more efficient */</span></span>
<span class="line">            <span class="token function">XLogSetRecordFlags</span><span class="token punctuation">(</span>XLOG_INCLUDE_ORIGIN<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            recptr <span class="token operator">=</span> <span class="token function">XLogInsert</span><span class="token punctuation">(</span>RM_HEAP2_ID<span class="token punctuation">,</span> info<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">PageSetLSN</span><span class="token punctuation">(</span>page<span class="token punctuation">,</span> recptr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过一些简单的 SQL，可以直观看到上述两种 WAL 日志记录方式的差异：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> test <span class="token punctuation">(</span>id <span class="token keyword">int</span><span class="token punctuation">,</span> txt <span class="token keyword">text</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> test <span class="token keyword">VALUES</span></span>
<span class="line">    <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token string">&#39;1&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">,</span> <span class="token string">&#39;2&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token string">&#39;3&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">,</span> <span class="token string">&#39;4&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">,</span> <span class="token string">&#39;5&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">6</span><span class="token punctuation">,</span> <span class="token string">&#39;6&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">7</span><span class="token punctuation">,</span> <span class="token string">&#39;7&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token number">8</span><span class="token punctuation">,</span> <span class="token string">&#39;8&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">COPY test <span class="token keyword">FROM</span> stdin<span class="token punctuation">;</span></span>
<span class="line"><span class="token number">1</span>	<span class="token string">&#39;1&#39;</span></span>
<span class="line"><span class="token number">2</span>	<span class="token string">&#39;2&#39;</span></span>
<span class="line"><span class="token number">3</span>	<span class="token string">&#39;3&#39;</span></span>
<span class="line"><span class="token number">4</span>	<span class="token string">&#39;4&#39;</span></span>
<span class="line"><span class="token number">5</span>	<span class="token string">&#39;5&#39;</span></span>
<span class="line"><span class="token number">6</span>	<span class="token string">&#39;6&#39;</span></span>
<span class="line"><span class="token number">7</span>	<span class="token string">&#39;7&#39;</span></span>
<span class="line"><span class="token number">8</span>	<span class="token string">&#39;8&#39;</span></span>
<span class="line">\\<span class="token punctuation">.</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过 PostgreSQL 的 <a href="https://www.postgresql.org/docs/current/pgwaldump.html" target="_blank" rel="noopener noreferrer"><code>pg_waldump</code></a> 工具查看 WAL 日志记录，可以发现 <code>INSERT</code> 语句插入的每一行数据都被记录了一条 Heap 日志，而 <code>COPY</code> 用一条 Heap2 日志记录了这个页面上的所有插入行。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        785, lsn: 0/40BE21D0, prev 0/40BE20C0, desc: INSERT+INIT off: 1, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        786, lsn: 0/40BE2270, prev 0/40BE2238, desc: INSERT off: 2, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        787, lsn: 0/40BE22D8, prev 0/40BE22B0, desc: INSERT off: 3, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        788, lsn: 0/40BE2340, prev 0/40BE2318, desc: INSERT off: 4, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        789, lsn: 0/40BE23A8, prev 0/40BE2380, desc: INSERT off: 5, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        790, lsn: 0/40BE2410, prev 0/40BE23E8, desc: INSERT off: 6, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        791, lsn: 0/40BE2478, prev 0/40BE2450, desc: INSERT off: 7, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line">rmgr: Heap        len (rec/tot):     61/    61, tx:        792, lsn: 0/40BE24E0, prev 0/40BE24B8, desc: INSERT off: 8, flags: 0x00, blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">rmgr: Heap2       len (rec/tot):    194/   194, tx:        793, lsn: 0/40BE2548, prev 0/40BE2520, desc: MULTI_INSERT ntuples: 8, flags: 0x02, offsets: [9, 10, 11, 12, 13, 14, 15, 16], blkref #0: rel 1663/5/16412 blk 0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>使用 PostgreSQL 的 <a href="https://www.postgresql.org/docs/current/pgwalinspect.html" target="_blank" rel="noopener noreferrer"><code>pg_walinspect</code></a> 插件可以查看每条 WAL 日志的详细信息：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token keyword">CREATE</span> EXTENSION <span class="token keyword">IF</span> <span class="token operator">NOT</span> <span class="token keyword">EXISTS</span> pg_walinspect<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">CREATE</span> EXTENSION</span>
<span class="line"></span>
<span class="line"><span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> pg_get_wal_record_info<span class="token punctuation">(</span><span class="token string">&#39;0/40BE24E0&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token operator">-</span><span class="token punctuation">[</span> RECORD <span class="token number">1</span> <span class="token punctuation">]</span><span class="token comment">----+--------------------------------------------</span></span>
<span class="line">start_lsn        <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE24E0</span>
<span class="line">end_lsn          <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE2520</span>
<span class="line">prev_lsn         <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE24B8</span>
<span class="line">xid              <span class="token operator">|</span> <span class="token number">792</span></span>
<span class="line">resource_manager <span class="token operator">|</span> Heap</span>
<span class="line">record_type      <span class="token operator">|</span> <span class="token keyword">INSERT</span></span>
<span class="line">record_length    <span class="token operator">|</span> <span class="token number">61</span></span>
<span class="line">main_data_length <span class="token operator">|</span> <span class="token number">3</span></span>
<span class="line">fpi_length       <span class="token operator">|</span> <span class="token number">0</span></span>
<span class="line">description      <span class="token operator">|</span> <span class="token keyword">off</span>: <span class="token number">8</span><span class="token punctuation">,</span> flags: <span class="token number">0x00</span></span>
<span class="line">block_ref        <span class="token operator">|</span> blkref <span class="token comment">#0: rel 1663/5/16412 fork main blk 0</span></span>
<span class="line"></span>
<span class="line"><span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> pg_get_wal_record_info<span class="token punctuation">(</span><span class="token string">&#39;0/40BE2548&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token operator">-</span><span class="token punctuation">[</span> RECORD <span class="token number">1</span> <span class="token punctuation">]</span><span class="token comment">----+------------------------------------------------------------------</span></span>
<span class="line">start_lsn        <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE2548</span>
<span class="line">end_lsn          <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE2610</span>
<span class="line">prev_lsn         <span class="token operator">|</span> <span class="token number">0</span><span class="token operator">/</span><span class="token number">40</span>BE2520</span>
<span class="line">xid              <span class="token operator">|</span> <span class="token number">793</span></span>
<span class="line">resource_manager <span class="token operator">|</span> Heap2</span>
<span class="line">record_type      <span class="token operator">|</span> MULTI_INSERT</span>
<span class="line">record_length    <span class="token operator">|</span> <span class="token number">194</span></span>
<span class="line">main_data_length <span class="token operator">|</span> <span class="token number">20</span></span>
<span class="line">fpi_length       <span class="token operator">|</span> <span class="token number">0</span></span>
<span class="line">description      <span class="token operator">|</span> ntuples: <span class="token number">8</span><span class="token punctuation">,</span> flags: <span class="token number">0x02</span><span class="token punctuation">,</span> <span class="token keyword">offsets</span>: <span class="token punctuation">[</span><span class="token number">9</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">11</span><span class="token punctuation">,</span> <span class="token number">12</span><span class="token punctuation">,</span> <span class="token number">13</span><span class="token punctuation">,</span> <span class="token number">14</span><span class="token punctuation">,</span> <span class="token number">15</span><span class="token punctuation">,</span> <span class="token number">16</span><span class="token punctuation">]</span></span>
<span class="line">block_ref        <span class="token operator">|</span> blkref <span class="token comment">#0: rel 1663/5/16412 fork main blk 0</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的结果可以看出，通过 <code>INSERT</code> 插入八行数据，需要占用 61 * 8 = 488 字节；而通过 <code>COPY</code> 插入八行数据，只需要 194 字节。由此可见 Heap2 日志比 Heap 日志紧凑得多：特别是对于列比较窄的表来说，WAL 日志元信息所占的开销可能比实际数据还要多。使用 Heap2 日志能够有效减少冗余信息。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p><code>INSERT</code> 和 <code>COPY</code> 这两种数据插入方式，在执行器的算法、Table AM 的实现、WAL 日志的类型上都有明显的不同。在待插入行数较多时，后者有明显的优势。其实 PostgreSQL 内部还有很多隐式的数据导入，比如物化视图的创建和刷新，<code>CREATE TABLE AS</code> 等语法。这些地方目前依旧是使用与 <code>INSERT</code> 相同的算法实现的。</p><p>PostgreSQL 社区邮件列表从 2020 年就开始讨论将若干处代码路径改为使用内存元组攒批 + <code>heap_multi_insert</code> + Heap2 日志来实现。为了减少代码冗余，目前正在讨论的方案是将内存元组攒批下沉到 Table AM 层，对上层代码暴露几个新的 Table AM 接口。接入这条路径的代码只需要使用新的 Table AM 接口即可。目前看这套新的 Table AM 接口有希望合入 PostgreSQL 18/19。</p><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><p><a href="https://www.pgcon.org/2012/schedule/attachments/258_212_Internals%20Of%20PostgreSQL%20Wal.pdf" target="_blank" rel="noopener noreferrer">WAL Internals of PostgreSQL</a></p><p><a href="https://www.postgresql.org/message-id/flat/20221029025420.eplyow6k7tgu6he3%40awork3.anarazel.de" target="_blank" rel="noopener noreferrer">PostgreSQL: refactoring relation extension and BufferAlloc(), faster COPY</a></p><p><a href="https://www.postgresql.org/message-id/flat/CALj2ACUr8Vnu3dMkiU47v-dh55tnY2Lr8m2xoSaRZeiCaNeVqQ%40mail.gmail.com" target="_blank" rel="noopener noreferrer">PostgreSQL: Multi Inserts in CREATE TABLE AS - revived patch</a></p><p><a href="https://www.postgresql.org/message-id/flat/CALj2ACVi9eTRYR%3Dgdca5wxtj3Kk_9q9qVccxsS1hngTGOCjPwQ%40mail.gmail.com" target="_blank" rel="noopener noreferrer">PostgreSQL: New Table Access Methods for Multi and Single Inserts</a></p>`,52)]))}const o=s(l,[["render",t],["__file","PostgreSQL Multi-Insert.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Multi-Insert.html","title":"PostgreSQL - Multi Insert","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"执行器算法","slug":"执行器算法","link":"#执行器算法","children":[]},{"level":2,"title":"Table Access Method","slug":"table-access-method","link":"#table-access-method","children":[]},{"level":2,"title":"WAL 日志","slug":"wal-日志","link":"#wal-日志","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Multi-Insert.md"}');export{o as comp,u as data};
