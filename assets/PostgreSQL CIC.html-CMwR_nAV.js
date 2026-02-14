import{_ as s,c as a,a as e,o as i}from"./app-BeHGwf2X.js";const t={};function l(p,n){return i(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-create-index-concurrently" tabindex="-1"><a class="header-anchor" href="#postgresql-create-index-concurrently"><span>PostgreSQL - CREATE INDEX CONCURRENTLY</span></a></h1><p>Created by: Mr Dk.</p><p>2025 / 04 / 05 14:50</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>索引通常被用于加速数据库的查询性能。理论上，在一张表上构建索引需要至少把表的全量数据扫描一遍，对于比较大的表来说，可能需要持续较长的时间；在此期间，表的内容不能被修改，否则构建出的索引与表的内容将会不一致。</p><p>对于在线系统来说，长时间锁住一张表无法修改是不可接受的。PostgreSQL 支持 <a href="https://www.postgresql.org/docs/17/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY" target="_blank" rel="noopener noreferrer">并发创建索引</a> (CREATE INDEX CONCURRENTLY, CIC)。并发创建索引将会以较低的锁等级对表上锁，不阻塞 DML 操作的进行。并发索引构建会持续多个阶段完成，其消耗的整体资源和时间远大于非并发的索引创建。本文基于 PostgreSQL 17 源代码简析这个过程。</p><h2 id="related-heap-only-tuples" tabindex="-1"><a class="header-anchor" href="#related-heap-only-tuples"><span>Related: Heap Only Tuples</span></a></h2><p>由于 CIC 与 PostgreSQL 的 <a href="https://github.com/postgres/postgres/blob/REL_17_STABLE/src/backend/access/heap/README.HOT" target="_blank" rel="noopener noreferrer">HOT (Heap-Only Tuples)</a> 有一定关联，所以需要先简析一下 HOT 的原理。PostgreSQL 使用 <a href="https://www.postgresql.org/docs/17/mvcc-intro.html" target="_blank" rel="noopener noreferrer">MVCC</a> 来存储表中的数据。对于每行数据，物理文件中可能会同时保存多个版本，每个事务根据其获取的快照来决定可见的版本是哪一个。当一行数据发生更新时，被更新的旧数据保持不变，表中将会插入一行新版本的数据。如果表上有索引，那么这行数据也需要被加入到索引中；如果表上有多个索引，那么每个索引都需要被更新，一次更新操作代价将会很大。</p><p>索引元组中保存的内容为：</p><ul><li>ScanKey：被索引列的值</li><li>CTID：被索引行的位置（块号 + 块内偏移量）</li></ul><p>当非索引列值被更新，并且当前页面中可以同时存放新旧两个版本的元组时，新元组会被直接插入到同一个页面中，并在旧元组的 header 中保存新元组的位置，形成 HOT 链。这样索引就不再需要被更新了，CTID 依旧指向旧版本元组。旧版本元组被标记为 <code>HEAP_HOT_UPDATED</code>，新版本元组被标记为 <code>HEAP_ONLY_TUPLE</code>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    Index points to 1</span>
<span class="line">    lp [1]  [2]</span>
<span class="line"></span>
<span class="line">    [111111111]-&gt;[2222222222]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在后续查询时，虽然新版本的元组没有被索引直接引用到，但依旧可以通过旧元组 + HOT 链被查找到。索引扫描回表时，只要发现元组被标记为 <code>HEAP_HOT_UPDATED</code>，就需要沿着 HOT 链继续搜索。HOT 仅可能发生在一个页面内，所以沿着 HOT 链的搜索不会有额外的 I/O 开销。</p><p>后续当旧版本的元组不再可见而被删除时，其页内空间将会被回收，但行指针空间依旧被保留，保证 HOT 链不断裂：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    Index points to 1</span>
<span class="line">    lp [1]-&gt;[2]</span>
<span class="line"></span>
<span class="line">    [2222222222]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>HOT 链并不会无限延长下去。当这一行被再次更新时，原先的新版本元组也会被标记为 <code>HEAP_HOT_UPDATED</code>，形成：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    Index points to 1</span>
<span class="line">    lp [1]-&gt;[2]  [3]</span>
<span class="line"></span>
<span class="line">    [2222222222]-&gt;[3333333333]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当所有能够看到 <code>[2]</code> 版本的事务结束后，由于任何索引都没有直接引用这个版本，所以这个版本的数据和行指针都可以被安全回收；索引元组依旧不用更新。HOT 链变为：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    Index points to 1</span>
<span class="line">    lp [1]------&gt;[3]</span>
<span class="line"></span>
<span class="line">    [3333333333]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为什么 HOT 和创建索引有关呢？正是因为是否能够 HOT 的决策条件中包含了当前更新列上是否有索引。存在一个索引之前，某行数据更新是可以 HOT 的；但有了索引之后可能就不行了。所以在并发创建索引时，需要控制好新建索引的过程中依旧能够维持 HOT 的定义。</p><h2 id="cic" tabindex="-1"><a class="header-anchor" href="#cic"><span>CIC</span></a></h2><p>创建索引属于 DDL，从下面的执行器的入口函数开始：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * The &quot;Slow&quot; variant of ProcessUtility should only receive statements</span>
<span class="line"> * supported by the event triggers facility.  Therefore, we always</span>
<span class="line"> * perform the trigger support calls if the context allows it.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ProcessUtilitySlow</span><span class="token punctuation">(</span>ParseState <span class="token operator">*</span>pstate<span class="token punctuation">,</span></span>
<span class="line">                   PlannedStmt <span class="token operator">*</span>pstmt<span class="token punctuation">,</span></span>
<span class="line">                   <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>queryString<span class="token punctuation">,</span></span>
<span class="line">                   ProcessUtilityContext context<span class="token punctuation">,</span></span>
<span class="line">                   ParamListInfo params<span class="token punctuation">,</span></span>
<span class="line">                   QueryEnvironment <span class="token operator">*</span>queryEnv<span class="token punctuation">,</span></span>
<span class="line">                   DestReceiver <span class="token operator">*</span>dest<span class="token punctuation">,</span></span>
<span class="line">                   QueryCompletion <span class="token operator">*</span>qc<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* PG_TRY block is to ensure we call EventTriggerEndCompleteQuery */</span></span>
<span class="line">    <span class="token function">PG_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>parsetree<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">case</span> T_IndexStmt<span class="token operator">:</span>   <span class="token comment">/* CREATE INDEX */</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    IndexStmt  <span class="token operator">*</span>stmt <span class="token operator">=</span> <span class="token punctuation">(</span>IndexStmt <span class="token operator">*</span><span class="token punctuation">)</span> parsetree<span class="token punctuation">;</span></span>
<span class="line">                    Oid         relid<span class="token punctuation">;</span></span>
<span class="line">                    LOCKMODE    lockmode<span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">int</span>         nparts <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                    bool        is_alter_table<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>concurrent<span class="token punctuation">)</span></span>
<span class="line">                        <span class="token function">PreventInTransactionBlock</span><span class="token punctuation">(</span>isTopLevel<span class="token punctuation">,</span></span>
<span class="line">                                                  <span class="token string">&quot;CREATE INDEX CONCURRENTLY&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/*</span>
<span class="line">                     * Look up the relation OID just once, right here at the</span>
<span class="line">                     * beginning, so that we don&#39;t end up repeating the name</span>
<span class="line">                     * lookup later and latching onto a different relation</span>
<span class="line">                     * partway through.  To avoid lock upgrade hazards, it&#39;s</span>
<span class="line">                     * important that we take the strongest lock that will</span>
<span class="line">                     * eventually be needed here, so the lockmode calculation</span>
<span class="line">                     * needs to match what DefineIndex() does.</span>
<span class="line">                     */</span></span>
<span class="line">                    lockmode <span class="token operator">=</span> stmt<span class="token operator">-&gt;</span>concurrent <span class="token operator">?</span> ShareUpdateExclusiveLock</span>
<span class="line">                        <span class="token operator">:</span> ShareLock<span class="token punctuation">;</span></span>
<span class="line">                    relid <span class="token operator">=</span></span>
<span class="line">                        <span class="token function">RangeVarGetRelidExtended</span><span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>relation<span class="token punctuation">,</span> lockmode<span class="token punctuation">,</span></span>
<span class="line">                                                 <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                                 RangeVarCallbackOwnsRelation<span class="token punctuation">,</span></span>
<span class="line">                                                 <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/* Run parse analysis ... */</span></span>
<span class="line">                    stmt <span class="token operator">=</span> <span class="token function">transformIndexStmt</span><span class="token punctuation">(</span>relid<span class="token punctuation">,</span> stmt<span class="token punctuation">,</span> queryString<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/* ... and do it */</span></span>
<span class="line">                    <span class="token function">EventTriggerAlterTableStart</span><span class="token punctuation">(</span>parsetree<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    address <span class="token operator">=</span></span>
<span class="line">                        <span class="token function">DefineIndex</span><span class="token punctuation">(</span>relid<span class="token punctuation">,</span>  <span class="token comment">/* OID of heap relation */</span></span>
<span class="line">                                    stmt<span class="token punctuation">,</span></span>
<span class="line">                                    InvalidOid<span class="token punctuation">,</span> <span class="token comment">/* no predefined OID */</span></span>
<span class="line">                                    InvalidOid<span class="token punctuation">,</span> <span class="token comment">/* no parent index */</span></span>
<span class="line">                                    InvalidOid<span class="token punctuation">,</span> <span class="token comment">/* no parent constraint */</span></span>
<span class="line">                                    nparts<span class="token punctuation">,</span> <span class="token comment">/* # of partitions, or -1 */</span></span>
<span class="line">                                    is_alter_table<span class="token punctuation">,</span></span>
<span class="line">                                    true<span class="token punctuation">,</span>   <span class="token comment">/* check_rights */</span></span>
<span class="line">                                    true<span class="token punctuation">,</span>   <span class="token comment">/* check_not_in_use */</span></span>
<span class="line">                                    false<span class="token punctuation">,</span>  <span class="token comment">/* skip_build */</span></span>
<span class="line">                                    false<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* quiet */</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">/* ... */</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">                <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>parsetree<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_FINALLY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_END_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的代码片段可以看出，由于并发索引创建是通过多个事务完成的，所以无法在事务块内执行。另外，传统索引创建与并发索引创建对表的上锁等级不同。根据 PostgreSQL 的 <a href="https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-TABLES" target="_blank" rel="noopener noreferrer">表锁兼容矩阵</a>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">AccessShareLock</span>         <span class="token expression"><span class="token number">1</span>   </span><span class="token comment">/* SELECT */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RowShareLock</span>            <span class="token expression"><span class="token number">2</span>   </span><span class="token comment">/* SELECT FOR UPDATE/FOR SHARE */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RowExclusiveLock</span>        <span class="token expression"><span class="token number">3</span>   </span><span class="token comment">/* INSERT, UPDATE, DELETE */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ShareUpdateExclusiveLock</span> <span class="token expression"><span class="token number">4</span>  </span><span class="token comment">/* VACUUM (non-FULL), ANALYZE, CREATE</span>
<span class="line">                                     * INDEX CONCURRENTLY */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ShareLock</span>               <span class="token expression"><span class="token number">5</span>   </span><span class="token comment">/* CREATE INDEX (WITHOUT CONCURRENTLY) */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ShareRowExclusiveLock</span>   <span class="token expression"><span class="token number">6</span>   </span><span class="token comment">/* like EXCLUSIVE MODE, but allows ROW</span>
<span class="line">                                     * SHARE */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ExclusiveLock</span>           <span class="token expression"><span class="token number">7</span>   </span><span class="token comment">/* blocks ROW SHARE/SELECT...FOR UPDATE */</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">AccessExclusiveLock</span>     <span class="token expression"><span class="token number">8</span>   </span><span class="token comment">/* ALTER TABLE, DROP TABLE, VACUUM FULL,</span>
<span class="line">                                     * and unqualified LOCK TABLE */</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>传统索引创建的 <code>ShareLock</code> 锁阻塞了一切写操作；而 CIC 的 <code>ShareUpdateExclusiveLock</code> 与 DML 操作所需要的 <code>RowExclusiveLock</code> 不冲突，所以不阻塞 DML。</p><p>后续的索引创建逻辑全部在 <code>DefineIndex</code> 函数中完成。</p><h3 id="phase-1-创建空的无效索引-避免不一致的-hot-更新" tabindex="-1"><a class="header-anchor" href="#phase-1-创建空的无效索引-避免不一致的-hot-更新"><span>Phase 1：创建空的无效索引，避免不一致的 HOT 更新</span></a></h3><p>CIC 需要首先创建一个空的无效索引并将事务提交，使其能够被其它事务感知到。可见这个新索引的事务并不需要维护这个索引，也不能使用这个索引。创建这个空索引的作用是影响其它事务对 HOT 更新的决策：由于此时新索引已经存在，因此后续的更新操作如果修改了这个索引包含的列值，则不能再使用 HOT 更新了。这样可以避免后续索引创建完毕后，存在不符合定义的 HOT 链。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">ObjectAddress</span>
<span class="line"><span class="token function">DefineIndex</span><span class="token punctuation">(</span>Oid tableId<span class="token punctuation">,</span></span>
<span class="line">            IndexStmt <span class="token operator">*</span>stmt<span class="token punctuation">,</span></span>
<span class="line">            Oid indexRelationId<span class="token punctuation">,</span></span>
<span class="line">            Oid parentIndexId<span class="token punctuation">,</span></span>
<span class="line">            Oid parentConstraintId<span class="token punctuation">,</span></span>
<span class="line">            <span class="token keyword">int</span> total_parts<span class="token punctuation">,</span></span>
<span class="line">            bool is_alter_table<span class="token punctuation">,</span></span>
<span class="line">            bool check_rights<span class="token punctuation">,</span></span>
<span class="line">            bool check_not_in_use<span class="token punctuation">,</span></span>
<span class="line">            bool skip_build<span class="token punctuation">,</span></span>
<span class="line">            bool quiet<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Force non-concurrent build on temporary relations, even if CONCURRENTLY</span>
<span class="line">     * was requested.  Other backends can&#39;t access a temporary relation, so</span>
<span class="line">     * there&#39;s no harm in grabbing a stronger lock, and a non-concurrent DROP</span>
<span class="line">     * is more efficient.  Do this before any use of the concurrent option is</span>
<span class="line">     * done.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>concurrent <span class="token operator">&amp;&amp;</span> <span class="token function">get_rel_persistence</span><span class="token punctuation">(</span>tableId<span class="token punctuation">)</span> <span class="token operator">!=</span> RELPERSISTENCE_TEMP<span class="token punctuation">)</span></span>
<span class="line">        concurrent <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        concurrent <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Make the catalog entries for the index, including constraints. This</span>
<span class="line">     * step also actually builds the index, except if caller requested not to</span>
<span class="line">     * or in concurrent mode, in which case it&#39;ll be done later, or doing a</span>
<span class="line">     * partitioned index (because those don&#39;t have storage).</span>
<span class="line">     */</span></span>
<span class="line">    flags <span class="token operator">=</span> constr_flags <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>isconstraint<span class="token punctuation">)</span></span>
<span class="line">        flags <span class="token operator">|=</span> INDEX_CREATE_ADD_CONSTRAINT<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>skip_build <span class="token operator">||</span> concurrent <span class="token operator">||</span> partitioned<span class="token punctuation">)</span></span>
<span class="line">        flags <span class="token operator">|=</span> INDEX_CREATE_SKIP_BUILD<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>if_not_exists<span class="token punctuation">)</span></span>
<span class="line">        flags <span class="token operator">|=</span> INDEX_CREATE_IF_NOT_EXISTS<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>concurrent<span class="token punctuation">)</span></span>
<span class="line">        flags <span class="token operator">|=</span> INDEX_CREATE_CONCURRENT<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    indexRelationId <span class="token operator">=</span></span>
<span class="line">        <span class="token function">index_create</span><span class="token punctuation">(</span>rel<span class="token punctuation">,</span> indexRelationName<span class="token punctuation">,</span> indexRelationId<span class="token punctuation">,</span> parentIndexId<span class="token punctuation">,</span></span>
<span class="line">                     parentConstraintId<span class="token punctuation">,</span></span>
<span class="line">                     stmt<span class="token operator">-&gt;</span>oldNumber<span class="token punctuation">,</span> indexInfo<span class="token punctuation">,</span> indexColNames<span class="token punctuation">,</span></span>
<span class="line">                     accessMethodId<span class="token punctuation">,</span> tablespaceId<span class="token punctuation">,</span></span>
<span class="line">                     collationIds<span class="token punctuation">,</span> opclassIds<span class="token punctuation">,</span> opclassOptions<span class="token punctuation">,</span></span>
<span class="line">                     coloptions<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> reloptions<span class="token punctuation">,</span></span>
<span class="line">                     flags<span class="token punctuation">,</span> constr_flags<span class="token punctuation">,</span></span>
<span class="line">                     allowSystemTableMods<span class="token punctuation">,</span> <span class="token operator">!</span>check_rights<span class="token punctuation">,</span></span>
<span class="line">                     <span class="token operator">&amp;</span>createdConstraintId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码首先完成索引创建前的各项准备，包含索引列确认、权限检查、索引名称确定、索引表达式编译等。然后根据索引创建的类型确认标志位。对于 CIC 来说，需要设置的标志位有 <code>INDEX_CREATE_SKIP_BUILD</code> 和 <code>INDEX_CREATE_CONCURRENT</code>。前者表示先不创建索引本身，仅更新系统表，使其它事务能够可见这个索引；后者表示当前要进行的是并发索引创建。将这个标志位传入 <code>index_create</code> 函数中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">Oid</span>
<span class="line"><span class="token function">index_create</span><span class="token punctuation">(</span>Relation heapRelation<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>indexRelationName<span class="token punctuation">,</span></span>
<span class="line">			 Oid indexRelationId<span class="token punctuation">,</span></span>
<span class="line">			 Oid parentIndexRelid<span class="token punctuation">,</span></span>
<span class="line">			 Oid parentConstraintId<span class="token punctuation">,</span></span>
<span class="line">			 RelFileNumber relFileNumber<span class="token punctuation">,</span></span>
<span class="line">			 IndexInfo <span class="token operator">*</span>indexInfo<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> List <span class="token operator">*</span>indexColNames<span class="token punctuation">,</span></span>
<span class="line">			 Oid accessMethodId<span class="token punctuation">,</span></span>
<span class="line">			 Oid tableSpaceId<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> Oid <span class="token operator">*</span>collationIds<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> Oid <span class="token operator">*</span>opclassIds<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> Datum <span class="token operator">*</span>opclassOptions<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> int16 <span class="token operator">*</span>coloptions<span class="token punctuation">,</span></span>
<span class="line">			 <span class="token keyword">const</span> NullableDatum <span class="token operator">*</span>stattargets<span class="token punctuation">,</span></span>
<span class="line">			 Datum reloptions<span class="token punctuation">,</span></span>
<span class="line">			 bits16 flags<span class="token punctuation">,</span></span>
<span class="line">			 bits16 constr_flags<span class="token punctuation">,</span></span>
<span class="line">			 bool allow_system_table_mods<span class="token punctuation">,</span></span>
<span class="line">			 bool is_internal<span class="token punctuation">,</span></span>
<span class="line">			 Oid <span class="token operator">*</span>constraintId<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	bool		concurrent <span class="token operator">=</span> <span class="token punctuation">(</span>flags <span class="token operator">&amp;</span> INDEX_CREATE_CONCURRENT<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * create the index relation&#39;s relcache entry and, if necessary, the</span>
<span class="line">	 * physical disk file. (If we fail further down, it&#39;s the smgr&#39;s</span>
<span class="line">	 * responsibility to remove the disk file again, if any.)</span>
<span class="line">	 */</span></span>
<span class="line">	indexRelation <span class="token operator">=</span> <span class="token function">heap_create</span><span class="token punctuation">(</span>indexRelationName<span class="token punctuation">,</span></span>
<span class="line">								namespaceId<span class="token punctuation">,</span></span>
<span class="line">								tableSpaceId<span class="token punctuation">,</span></span>
<span class="line">								indexRelationId<span class="token punctuation">,</span></span>
<span class="line">								relFileNumber<span class="token punctuation">,</span></span>
<span class="line">								accessMethodId<span class="token punctuation">,</span></span>
<span class="line">								indexTupDesc<span class="token punctuation">,</span></span>
<span class="line">								relkind<span class="token punctuation">,</span></span>
<span class="line">								relpersistence<span class="token punctuation">,</span></span>
<span class="line">								shared_relation<span class="token punctuation">,</span></span>
<span class="line">								mapped_relation<span class="token punctuation">,</span></span>
<span class="line">								allow_system_table_mods<span class="token punctuation">,</span></span>
<span class="line">								<span class="token operator">&amp;</span>relfrozenxid<span class="token punctuation">,</span></span>
<span class="line">								<span class="token operator">&amp;</span>relminmxid<span class="token punctuation">,</span></span>
<span class="line">								create_storage<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token function">Assert</span><span class="token punctuation">(</span>relfrozenxid <span class="token operator">==</span> InvalidTransactionId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">Assert</span><span class="token punctuation">(</span>relminmxid <span class="token operator">==</span> InvalidMultiXactId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">Assert</span><span class="token punctuation">(</span>indexRelationId <span class="token operator">==</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Obtain exclusive lock on it.  Although no other transactions can see it</span>
<span class="line">	 * until we commit, this prevents deadlock-risk complaints from lock</span>
<span class="line">	 * manager in cases such as CLUSTER.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">LockRelation</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">,</span> AccessExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Fill in fields of the index&#39;s pg_class entry that are not set correctly</span>
<span class="line">	 * by heap_create.</span>
<span class="line">	 *</span>
<span class="line">	 * XXX should have a cleaner way to create cataloged indexes</span>
<span class="line">	 */</span></span>
<span class="line">	indexRelation<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relowner <span class="token operator">=</span> heapRelation<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relowner<span class="token punctuation">;</span></span>
<span class="line">	indexRelation<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relam <span class="token operator">=</span> accessMethodId<span class="token punctuation">;</span></span>
<span class="line">	indexRelation<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relispartition <span class="token operator">=</span> <span class="token function">OidIsValid</span><span class="token punctuation">(</span>parentIndexRelid<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * store index&#39;s pg_class entry</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">InsertPgClassTuple</span><span class="token punctuation">(</span>pg_class<span class="token punctuation">,</span> indexRelation<span class="token punctuation">,</span></span>
<span class="line">					   <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">					   <span class="token punctuation">(</span>Datum<span class="token punctuation">)</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">					   reloptions<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* done with pg_class */</span></span>
<span class="line">	<span class="token function">table_close</span><span class="token punctuation">(</span>pg_class<span class="token punctuation">,</span> RowExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * now update the object id&#39;s of all the attribute tuple forms in the</span>
<span class="line">	 * index relation&#39;s tuple descriptor</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">InitializeAttributeOids</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">,</span></span>
<span class="line">							indexInfo<span class="token operator">-&gt;</span>ii_NumIndexAttrs<span class="token punctuation">,</span></span>
<span class="line">							indexRelationId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * append ATTRIBUTE tuples for the index</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">AppendAttributeTuples</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">,</span> opclassOptions<span class="token punctuation">,</span> stattargets<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* ----------------</span>
<span class="line">	 *	  update pg_index</span>
<span class="line">	 *	  (append INDEX tuple)</span>
<span class="line">	 *</span>
<span class="line">	 *	  Note that this stows away a representation of &quot;predicate&quot;.</span>
<span class="line">	 *	  (Or, could define a rule to maintain the predicate) --Nels, Feb &#39;92</span>
<span class="line">	 * ----------------</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">UpdateIndexRelation</span><span class="token punctuation">(</span>indexRelationId<span class="token punctuation">,</span> heapRelationId<span class="token punctuation">,</span> parentIndexRelid<span class="token punctuation">,</span></span>
<span class="line">						indexInfo<span class="token punctuation">,</span></span>
<span class="line">						collationIds<span class="token punctuation">,</span> opclassIds<span class="token punctuation">,</span> coloptions<span class="token punctuation">,</span></span>
<span class="line">						isprimary<span class="token punctuation">,</span> is_exclusion<span class="token punctuation">,</span></span>
<span class="line">						<span class="token punctuation">(</span>constr_flags <span class="token operator">&amp;</span> INDEX_CONSTR_CREATE_DEFERRABLE<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">						<span class="token operator">!</span>concurrent <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>invalid<span class="token punctuation">,</span></span>
<span class="line">						<span class="token operator">!</span>concurrent<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Register relcache invalidation on the indexes&#39; heap relation, to</span>
<span class="line">	 * maintain consistency of its index list</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">CacheInvalidateRelcache</span><span class="token punctuation">(</span>heapRelation<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Advance the command counter so that we can see the newly-entered</span>
<span class="line">	 * catalog tuples for the index.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">CommandCounterIncrement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * If this is bootstrap (initdb) time, then we don&#39;t actually fill in the</span>
<span class="line">	 * index yet.  We&#39;ll be creating more indexes and classes later, so we</span>
<span class="line">	 * delay filling them in until just before we&#39;re done with bootstrapping.</span>
<span class="line">	 * Similarly, if the caller specified to skip the build then filling the</span>
<span class="line">	 * index is delayed till later (ALTER TABLE can save work in some cases</span>
<span class="line">	 * with this).  Otherwise, we call the AM routine that constructs the</span>
<span class="line">	 * index.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">IsBootstrapProcessingMode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">	<span class="token punctuation">{</span></span>
<span class="line">		<span class="token function">index_register</span><span class="token punctuation">(</span>heapRelationId<span class="token punctuation">,</span> indexRelationId<span class="token punctuation">,</span> indexInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token punctuation">}</span></span>
<span class="line">	<span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>flags <span class="token operator">&amp;</span> INDEX_CREATE_SKIP_BUILD<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">	<span class="token punctuation">{</span></span>
<span class="line">		<span class="token comment">/*</span>
<span class="line">		 * Caller is responsible for filling the index later on.  However,</span>
<span class="line">		 * we&#39;d better make sure that the heap relation is correctly marked as</span>
<span class="line">		 * having an index.</span>
<span class="line">		 */</span></span>
<span class="line">		<span class="token function">index_update_stats</span><span class="token punctuation">(</span>heapRelation<span class="token punctuation">,</span></span>
<span class="line">						   true<span class="token punctuation">,</span></span>
<span class="line">						   <span class="token operator">-</span><span class="token number">1.0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">		<span class="token comment">/* Make the above update visible */</span></span>
<span class="line">		<span class="token function">CommandCounterIncrement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token punctuation">}</span></span>
<span class="line">	<span class="token keyword">else</span></span>
<span class="line">	<span class="token punctuation">{</span></span>
<span class="line">		<span class="token function">index_build</span><span class="token punctuation">(</span>heapRelation<span class="token punctuation">,</span> indexRelation<span class="token punctuation">,</span> indexInfo<span class="token punctuation">,</span> false<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Close the index; but we keep the lock that we acquired above until end</span>
<span class="line">	 * of transaction.  Closing the heap is caller&#39;s responsibility.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">index_close</span><span class="token punctuation">(</span>indexRelation<span class="token punctuation">,</span> NoLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token keyword">return</span> indexRelationId<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此处向 <a href="https://www.postgresql.org/docs/17/catalog-pg-class.html" target="_blank" rel="noopener noreferrer"><code>pg_class</code></a> 和 <a href="https://www.postgresql.org/docs/17/catalog-pg-index.html" target="_blank" rel="noopener noreferrer"><code>pg_index</code></a> 系统表中插入了新索引的元数据，根据标志位 <code>INDEX_CREATE_SKIP_BUILD</code> 跳过了填充索引内容的 <code>index_build</code> 并直接返回。在函数 <code>UpdateIndexRelation</code> 更新 <code>pg_index</code> 系统表时，CIC 将索引的 <code>indisvalid</code> 和 <code>indisready</code> 全部设置为 <code>false</code>，表示这个索引既不需要被 DML 维护，也不能被用于查询。</p><p>系统表更新完毕后将事务提交，并打开一个新事务进入下一阶段：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">ObjectAddress</span>
<span class="line"><span class="token function">DefineIndex</span><span class="token punctuation">(</span>Oid tableId<span class="token punctuation">,</span></span>
<span class="line">			IndexStmt <span class="token operator">*</span>stmt<span class="token punctuation">,</span></span>
<span class="line">			Oid indexRelationId<span class="token punctuation">,</span></span>
<span class="line">			Oid parentIndexId<span class="token punctuation">,</span></span>
<span class="line">			Oid parentConstraintId<span class="token punctuation">,</span></span>
<span class="line">			<span class="token keyword">int</span> total_parts<span class="token punctuation">,</span></span>
<span class="line">			bool is_alter_table<span class="token punctuation">,</span></span>
<span class="line">			bool check_rights<span class="token punctuation">,</span></span>
<span class="line">			bool check_not_in_use<span class="token punctuation">,</span></span>
<span class="line">			bool skip_build<span class="token punctuation">,</span></span>
<span class="line">			bool quiet<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* save lockrelid and locktag for below, then close rel */</span></span>
<span class="line">	heaprelid <span class="token operator">=</span> rel<span class="token operator">-&gt;</span>rd_lockInfo<span class="token punctuation">.</span>lockRelId<span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">SET_LOCKTAG_RELATION</span><span class="token punctuation">(</span>heaplocktag<span class="token punctuation">,</span> heaprelid<span class="token punctuation">.</span>dbId<span class="token punctuation">,</span> heaprelid<span class="token punctuation">.</span>relId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">table_close</span><span class="token punctuation">(</span>rel<span class="token punctuation">,</span> NoLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * For a concurrent build, it&#39;s important to make the catalog entries</span>
<span class="line">	 * visible to other transactions before we start to build the index. That</span>
<span class="line">	 * will prevent them from making incompatible HOT updates.  The new index</span>
<span class="line">	 * will be marked not indisready and not indisvalid, so that no one else</span>
<span class="line">	 * tries to either insert into it or use it for queries.</span>
<span class="line">	 *</span>
<span class="line">	 * We must commit our current transaction so that the index becomes</span>
<span class="line">	 * visible; then start another.  Note that all the data structures we just</span>
<span class="line">	 * built are lost in the commit.  The only data we keep past here are the</span>
<span class="line">	 * relation IDs.</span>
<span class="line">	 *</span>
<span class="line">	 * Before committing, get a session-level lock on the table, to ensure</span>
<span class="line">	 * that neither it nor the index can be dropped before we finish. This</span>
<span class="line">	 * cannot block, even if someone else is waiting for access, because we</span>
<span class="line">	 * already have the same lock within our transaction.</span>
<span class="line">	 *</span>
<span class="line">	 * Note: we don&#39;t currently bother with a session lock on the index,</span>
<span class="line">	 * because there are no operations that could change its state while we</span>
<span class="line">	 * hold lock on the parent table.  This might need to change later.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">LockRelationIdForSession</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>heaprelid<span class="token punctuation">,</span> ShareUpdateExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token function">PopActiveSnapshot</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">CommitTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">StartTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Tell concurrent index builds to ignore us, if index qualifies */</span></span>
<span class="line">	<span class="token keyword">if</span> <span class="token punctuation">(</span>safe_index<span class="token punctuation">)</span></span>
<span class="line">		<span class="token function">set_indexsafe_procflags</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="phase-2-填充索引主体数据" tabindex="-1"><a class="header-anchor" href="#phase-2-填充索引主体数据"><span>Phase 2：填充索引主体数据</span></a></h3><p>在上一步的事务提交后，可见索引的事务不再会产生非预期的 HOT 更新。但目前已在进行中的事务已经产生了非预期的 HOT。所以，需要首先等待这些事务全都结束，所有事务才都不再会产生非预期的 HOT。此时才可以开始填充新索引的数据。</p><p>在具体实现上，等待对该表持有 <code>ShareLock</code> 的旧事务结束：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * The index is now visible, so we can report the OID.  While on it,</span>
<span class="line">	 * include the report for the beginning of phase 2.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token punctuation">{</span></span>
<span class="line">		<span class="token keyword">const</span> <span class="token keyword">int</span>	progress_cols<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">			PROGRESS_CREATEIDX_INDEX_OID<span class="token punctuation">,</span></span>
<span class="line">			PROGRESS_CREATEIDX_PHASE</span>
<span class="line">		<span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">		<span class="token keyword">const</span> int64 progress_vals<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">			indexRelationId<span class="token punctuation">,</span></span>
<span class="line">			PROGRESS_CREATEIDX_PHASE_WAIT_1</span>
<span class="line">		<span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">		<span class="token function">pgstat_progress_update_multi_param</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">,</span> progress_cols<span class="token punctuation">,</span> progress_vals<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Phase 2 of concurrent index build (see comments for validate_index()</span>
<span class="line">	 * for an overview of how this works)</span>
<span class="line">	 *</span>
<span class="line">	 * Now we must wait until no running transaction could have the table open</span>
<span class="line">	 * with the old list of indexes.  Use ShareLock to consider running</span>
<span class="line">	 * transactions that hold locks that permit writing to the table.  Note we</span>
<span class="line">	 * do not need to worry about xacts that open the table for writing after</span>
<span class="line">	 * this point; they will see the new index when they open it.</span>
<span class="line">	 *</span>
<span class="line">	 * Note: the reason we use actual lock acquisition here, rather than just</span>
<span class="line">	 * checking the ProcArray and sleeping, is that deadlock is possible if</span>
<span class="line">	 * one of the transactions in question is blocked trying to acquire an</span>
<span class="line">	 * exclusive lock on our table.  The lock code will detect deadlock and</span>
<span class="line">	 * error out properly.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">WaitForLockers</span><span class="token punctuation">(</span>heaplocktag<span class="token punctuation">,</span> ShareLock<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，获取新快照，并通过 <code>index_concurrently_build</code> 函数填充索引内容，然后提交事务：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * At this moment we are sure that there are no transactions with the</span>
<span class="line">	 * table open for write that don&#39;t have this new index in their list of</span>
<span class="line">	 * indexes.  We have waited out all the existing transactions and any new</span>
<span class="line">	 * transaction will have the new index in its list, but the index is still</span>
<span class="line">	 * marked as &quot;not-ready-for-inserts&quot;.  The index is consulted while</span>
<span class="line">	 * deciding HOT-safety though.  This arrangement ensures that no new HOT</span>
<span class="line">	 * chains can be created where the new tuple and the old tuple in the</span>
<span class="line">	 * chain have different index keys.</span>
<span class="line">	 *</span>
<span class="line">	 * We now take a new snapshot, and build the index using all tuples that</span>
<span class="line">	 * are visible in this snapshot.  We can be sure that any HOT updates to</span>
<span class="line">	 * these tuples will be compatible with the index, since any updates made</span>
<span class="line">	 * by transactions that didn&#39;t know about the index are now committed or</span>
<span class="line">	 * rolled back.  Thus, each visible tuple is either the end of its</span>
<span class="line">	 * HOT-chain or the extension of the chain is HOT-safe for this index.</span>
<span class="line">	 */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Set ActiveSnapshot since functions in the indexes may need it */</span></span>
<span class="line">	<span class="token function">PushActiveSnapshot</span><span class="token punctuation">(</span><span class="token function">GetTransactionSnapshot</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Perform concurrent build of index */</span></span>
<span class="line">	<span class="token function">index_concurrently_build</span><span class="token punctuation">(</span>tableId<span class="token punctuation">,</span> indexRelationId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* we can do away with our snapshot */</span></span>
<span class="line">	<span class="token function">PopActiveSnapshot</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Commit this transaction to make the indisready update visible.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">CommitTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">StartTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Tell concurrent index builds to ignore us, if index qualifies */</span></span>
<span class="line">	<span class="token keyword">if</span> <span class="token punctuation">(</span>safe_index<span class="token punctuation">)</span></span>
<span class="line">		<span class="token function">set_indexsafe_procflags</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里构建索引元组时，ScanKey 使用的是当前事务快照内可见元组的列值，但 CTID 使用的是可见元组在 HOT 链中的 root CTID。这样可以保证所有索引中引用同一个元组的 CTID 都是相同的。可见元组在 HOT 链中的前序元组在当前事务中是不可见的，所以使用该索引进行回表时，前序元组也必然不可见。</p><p>在索引填充完毕，提交事务之前，<code>index_concurrently_build</code> 将索引的 <code>indisready</code> 设置为 <code>true</code>，表示自此所有事务都需要开始维护这个索引：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * index_concurrently_build</span>
<span class="line"> *</span>
<span class="line"> * Build index for a concurrent operation.  Low-level locks are taken when</span>
<span class="line"> * this operation is performed to prevent only schema changes, but they need</span>
<span class="line"> * to be kept until the end of the transaction performing this operation.</span>
<span class="line"> * &#39;indexOid&#39; refers to an index relation OID already created as part of</span>
<span class="line"> * previous processing, and &#39;heapOid&#39; refers to its parent heap relation.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">index_concurrently_build</span><span class="token punctuation">(</span>Oid heapRelationId<span class="token punctuation">,</span></span>
<span class="line">						 Oid indexRelationId<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">	<span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Now build the index */</span></span>
<span class="line">	<span class="token function">index_build</span><span class="token punctuation">(</span>heapRel<span class="token punctuation">,</span> indexRelation<span class="token punctuation">,</span> indexInfo<span class="token punctuation">,</span> false<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Update the pg_index row to mark the index as ready for inserts. Once we</span>
<span class="line">	 * commit this transaction, any new transactions that open the table must</span>
<span class="line">	 * insert new entries into the index for insertions and non-HOT updates.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">index_set_state_flags</span><span class="token punctuation">(</span>indexRelationId<span class="token punctuation">,</span> INDEX_CREATE_SET_READY<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="phase-3-补全填充索引期间缺失的数据" tabindex="-1"><a class="header-anchor" href="#phase-3-补全填充索引期间缺失的数据"><span>Phase 3：补全填充索引期间缺失的数据</span></a></h3><p>截止目前，phase 2 开始之前提交的所有数据都已经在索引中了，phase 2 提交之后所有事务中的 DML 也会开始维护这个索引了。所以现在还缺两部分数据：</p><ol><li>在 phase 2 事务开始之后才提交的事务，因这些元组在 phase 2 的快照中不可见，而缺失对应的索引元组</li><li>在 phase 2 事务期间开始的事务，因 phase 2 期间索引属性 <code>indisready</code> 依旧为 <code>false</code>，因此没有维护索引，缺失索引元组</li></ol><p>Phase 3 开始补全这两部分缺失的数据。理论上现在立刻新开始一个事务，就可以可见并补全第一部分缺失数据。但第二部分缺失的数据因事务未提交暂不可见，所以依旧无法补全。所以这里需要等待在 phase 2 事务期间开始的，对表有过修改的事务结束，然后再获取快照扫描一次全表。此时两部分缺失数据都已经对当前快照可见，因此能够补回数据。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Phase 3 of concurrent index build</span>
<span class="line">	 *</span>
<span class="line">	 * We once again wait until no transaction can have the table open with</span>
<span class="line">	 * the index marked as read-only for updates.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_CREATEIDX_PHASE<span class="token punctuation">,</span></span>
<span class="line">								 PROGRESS_CREATEIDX_PHASE_WAIT_2<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">WaitForLockers</span><span class="token punctuation">(</span>heaplocktag<span class="token punctuation">,</span> ShareLock<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Now take the &quot;reference snapshot&quot; that will be used by validate_index()</span>
<span class="line">	 * to filter candidate tuples.  Beware!  There might still be snapshots in</span>
<span class="line">	 * use that treat some transaction as in-progress that our reference</span>
<span class="line">	 * snapshot treats as committed.  If such a recently-committed transaction</span>
<span class="line">	 * deleted tuples in the table, we will not include them in the index; yet</span>
<span class="line">	 * those transactions which see the deleting one as still-in-progress will</span>
<span class="line">	 * expect such tuples to be there once we mark the index as valid.</span>
<span class="line">	 *</span>
<span class="line">	 * We solve this by waiting for all endangered transactions to exit before</span>
<span class="line">	 * we mark the index as valid.</span>
<span class="line">	 *</span>
<span class="line">	 * We also set ActiveSnapshot to this snap, since functions in indexes may</span>
<span class="line">	 * need a snapshot.</span>
<span class="line">	 */</span></span>
<span class="line">	snapshot <span class="token operator">=</span> <span class="token function">RegisterSnapshot</span><span class="token punctuation">(</span><span class="token function">GetTransactionSnapshot</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">PushActiveSnapshot</span><span class="token punctuation">(</span>snapshot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Scan the index and the heap, insert any missing index entries.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">validate_index</span><span class="token punctuation">(</span>tableId<span class="token punctuation">,</span> indexRelationId<span class="token punctuation">,</span> snapshot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Drop the reference snapshot.  We must do this before waiting out other</span>
<span class="line">	 * snapshot holders, else we will deadlock against other processes also</span>
<span class="line">	 * doing CREATE INDEX CONCURRENTLY, which would see our snapshot as one</span>
<span class="line">	 * they must wait for.  But first, save the snapshot&#39;s xmin to use as</span>
<span class="line">	 * limitXmin for GetCurrentVirtualXIDs().</span>
<span class="line">	 */</span></span>
<span class="line">	limitXmin <span class="token operator">=</span> snapshot<span class="token operator">-&gt;</span>xmin<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token function">PopActiveSnapshot</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">UnregisterSnapshot</span><span class="token punctuation">(</span>snapshot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * The snapshot subsystem could still contain registered snapshots that</span>
<span class="line">	 * are holding back our process&#39;s advertised xmin; in particular, if</span>
<span class="line">	 * default_transaction_isolation = serializable, there is a transaction</span>
<span class="line">	 * snapshot that is still active.  The CatalogSnapshot is likewise a</span>
<span class="line">	 * hazard.  To ensure no deadlocks, we must commit and start yet another</span>
<span class="line">	 * transaction, and do our wait before any snapshot has been taken in it.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">CommitTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">StartTransactionCommand</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Tell concurrent index builds to ignore us, if index qualifies */</span></span>
<span class="line">	<span class="token keyword">if</span> <span class="token punctuation">(</span>safe_index<span class="token punctuation">)</span></span>
<span class="line">		<span class="token function">set_indexsafe_procflags</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在通过 <code>validate_index</code> 函数补全索引内的缺失数据以后，再次提交当前事务。此后，其它事务理论上就可以看见数据完整的索引了，但此时索引暂时还不能被标记为可使用。因为索引中只包含 phase 2 获取的快照及之后的快照可见的数据，不包含更旧事务所使用的旧快照可见的数据。如果此时立刻标记索引可用，那么这些旧事务在使用这个索引时将会查不到预期可见的数据。所以必须等待这些旧事务全部结束，才可以标记索引的 <code>indisvalid</code> 为 <code>true</code>，开放使用：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* We should now definitely not be advertising any xmin. */</span></span>
<span class="line">	<span class="token function">Assert</span><span class="token punctuation">(</span>MyProc<span class="token operator">-&gt;</span>xmin <span class="token operator">==</span> InvalidTransactionId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * The index is now valid in the sense that it contains all currently</span>
<span class="line">	 * interesting tuples.  But since it might not contain tuples deleted just</span>
<span class="line">	 * before the reference snap was taken, we have to wait out any</span>
<span class="line">	 * transactions that might have older snapshots.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_CREATEIDX_PHASE<span class="token punctuation">,</span></span>
<span class="line">								 PROGRESS_CREATEIDX_PHASE_WAIT_3<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token function">WaitForOlderSnapshots</span><span class="token punctuation">(</span>limitXmin<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Index can now be marked valid -- update its pg_index entry</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">index_set_state_flags</span><span class="token punctuation">(</span>indexRelationId<span class="token punctuation">,</span> INDEX_CREATE_SET_VALID<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * The pg_index update will cause backends (including this one) to update</span>
<span class="line">	 * relcache entries for the index itself, but we should also send a</span>
<span class="line">	 * relcache inval on the parent table to force replanning of cached plans.</span>
<span class="line">	 * Otherwise existing sessions might fail to use the new index where it</span>
<span class="line">	 * would be useful.  (Note that our earlier commits did not create reasons</span>
<span class="line">	 * to replan; so relcache flush on the index itself was sufficient.)</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">CacheInvalidateRelcacheByRelid</span><span class="token punctuation">(</span>heaprelid<span class="token punctuation">.</span>relId<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * Last thing to do is release the session-level lock on the parent table.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token function">UnlockRelationIdForSession</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>heaprelid<span class="token punctuation">,</span> ShareUpdateExclusiveLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token function">pgstat_progress_end_command</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token keyword">return</span> address<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此后，新索引开始在所有事务中可用。</p><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>综上，CIC 全程没有阻塞任何 DML，而是通过多个阶段，使新索引逐渐从中间状态过渡到可用状态。其间通过获取两次事务快照，辅以必要的等待，逐步补全索引数据，保证索引的完整性和一致性。CIC 全程对全表数据扫描了两次，相比于非并发索引创建，有更大的资源开销。此外，新索引何时开始可用，也取决于系统中 CIC 开始前的长事务何时结束：如果这些事务一直不结束，即使新索引的数据已经就绪，也将会一直不可用。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.postgresql.org/docs/17/storage-hot.html" target="_blank" rel="noopener noreferrer">PostgreSQL: Documentation: 17: 65.7. Heap-Only Tuples (HOT)</a></p><p><a href="https://www.postgresql.org/docs/17/sql-createindex.html" target="_blank" rel="noopener noreferrer">PostgreSQL: Documentation: 17: CREATE INDEX</a></p><p><a href="https://www.enterprisedb.com/blog/explaining-create-index-concurrently" target="_blank" rel="noopener noreferrer">Explaining CREATE INDEX CONCURRENTLY</a></p><p><a href="https://github.com/postgres/postgres/blob/REL_17_STABLE/src/backend/access/heap/README.HOT" target="_blank" rel="noopener noreferrer">README.HOT</a></p>`,61)]))}const o=s(t,[["render",l],["__file","PostgreSQL CIC.html.vue"]]),d=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20CIC.html","title":"PostgreSQL - CREATE INDEX CONCURRENTLY","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Related: Heap Only Tuples","slug":"related-heap-only-tuples","link":"#related-heap-only-tuples","children":[]},{"level":2,"title":"CIC","slug":"cic","link":"#cic","children":[{"level":3,"title":"Phase 1：创建空的无效索引，避免不一致的 HOT 更新","slug":"phase-1-创建空的无效索引-避免不一致的-hot-更新","link":"#phase-1-创建空的无效索引-避免不一致的-hot-更新","children":[]},{"level":3,"title":"Phase 2：填充索引主体数据","slug":"phase-2-填充索引主体数据","link":"#phase-2-填充索引主体数据","children":[]},{"level":3,"title":"Phase 3：补全填充索引期间缺失的数据","slug":"phase-3-补全填充索引期间缺失的数据","link":"#phase-3-补全填充索引期间缺失的数据","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL CIC.md"}');export{o as comp,d as data};
