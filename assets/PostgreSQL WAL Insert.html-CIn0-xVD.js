import{_ as s,c as a,a as e,o as i}from"./app-BeHGwf2X.js";const l={};function p(t,n){return i(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-wal-insert" tabindex="-1"><a class="header-anchor" href="#postgresql-wal-insert"><span>PostgreSQL - WAL Insert</span></a></h1><p>Created by: Mr Dk.</p><p>2024 / 10 / 02 01:04</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景"><span>背景</span></a></h2><p>为什么需要 WAL 日志？</p><p>从根本上来说，当数据库的所有数据都在非易失性存储上时，才可以被认为是可靠的。当需要修改数据时，数据将会被装载到内存中并被处理。处理完毕后，理论上应该立刻被写回存储上，这样才可以保证对数据的修改被永久保留下来。但是由于存储的读写速度相对于内存来说慢了多个数量级，因此我们肯定不希望每对数据做了一点修改就立刻同步回存储，这样会很慢，数据修改的吞吐率将会很低。为了解决这个问题，常见的做法是把内存中被修改过的数据页标记为 dirty，让脏页保留在内存中，然后定期把脏页同步回存储。这样，绝大部分对数据的修改实际上都是纯内存操作了。</p><p>然而，内存是易失性存储，机器一掉电或崩溃，内存里的数据会立即丢失，所以数据在内存中是不可靠的。这种情况随时可能发生，比如机房进水 (敲木头呸呸呸)。。。OS Panic 等。此时，从上一次同步回存储，到故障发生时，对内存页面的所有修改都会丢失。存储上的数据可能也会是一个不一致的页面：比如 <a href="https://ext4.wiki.kernel.org/index.php/Ext4_Disk_Layout" target="_blank" rel="noopener noreferrer">ext4 文件系统</a> 的默认块大小是 4kB，<a href="https://www.postgresql.org/docs/current/storage-page-layout.html" target="_blank" rel="noopener noreferrer">PostgreSQL</a> 的默认页大小是 8kB，断电发生时，可能文件系统只来得及向存储写完第一个 4kB。此时，这个 8kB 的 PostgreSQL 页在存储上是个半旧半新的损坏页面，既无法回退到全旧版本，也无法前进到全新版本。</p><p>上述问题都可以被 WAL 日志解决。WAL 日志全称 Write-Ahead Log，即 <strong>预写日志</strong>。在对数据做修改之前，必须先把本次要对数据做的修改记录到 WAL 日志中，然后再去修改内存中的数据。在事务提交时，数据可以不立即同步回存储，但是 WAL 日志必须已经同步到存储。这样即使数据库因为上述各种原因发生非预期内的关闭，内存中未被同步回存储的数据全部丢失，数据库在重新启动以后依旧可以通过 WAL 日志从合适的位置开始进行崩溃恢复 (crash recovery)，根据日志中记录的内容 REDO，把存储上的数据恢复到正确、一致的状态。</p><p>此外，由于 WAL 日志中记录了对物理文件的所有修改，所以天然就可以被用于做数据库之间的复制 (replication)，保持两份数据之间的同步。直接使用 WAL 日志进行的复制被称为物理复制，前提是复制两端需要对 WAL 日志格式有完全相同的理解；将 WAL 日志中的内容做进一步的解码和格式转换以后，可以得到任意格式（SQL、JSON、ProtoBuf、...）的逻辑数据变更，这种复制被称为逻辑复制。</p><p>由此可见，WAL 日志对数据库发生极端灾难时的可靠性、数据的正确性和一致性、数据库的主备复制，都有着重要的作用。带来的代价是，在数据库的日常运行中，每当需要对数据做修改时，都引入了额外的日志写入工作。这个开销极大决定了数据库的写入吞吐率。</p><p>本文基于 PostgreSQL 17 稳定版本分析 WAL 日志从产生到写入、落盘等一系列过程，以及 PostgreSQL 17 这些过程所做的一些优化。</p><h2 id="总览" tabindex="-1"><a class="header-anchor" href="#总览"><span>总览</span></a></h2><p>多个进程会同时产生 WAL 日志，它们产生的每一条日志记录在日志文件中都需要是原子的、连续的，不能和其它记录相互穿插。另外，每个事务内并不需要每产生一条 WAL 日志就立刻向存储同步一次，只需要等到事务提交时一起 flush 就好了。因此，PostgreSQL 维护了一段称为 WAL Buffer 的共享内存，并设计了一系列元信息，控制这段内存的空间使用和向存储 flush 的进度，通过几种不同的锁保护 WAL buffer 的元信息。每个进程将会做如下三件事：</p><ol><li>在 WAL buffer 中分配一段共享内存空间用于写入日志</li><li>将产生的日志内容拷贝到在 WAL buffer 中分配好的空间里</li><li>自行/等待后台进程将 WAL buffer 中的内容刷盘</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Insert an XLOG record represented by an already-constructed chain of data</span>
<span class="line"> * chunks.  This is a low-level routine; to construct the WAL record header</span>
<span class="line"> * and data, use the higher-level routines in xloginsert.c.</span>
<span class="line"> *</span>
<span class="line"> * If &#39;fpw_lsn&#39; is valid, it is the oldest LSN among the pages that this</span>
<span class="line"> * WAL record applies to, that were not included in the record as full page</span>
<span class="line"> * images.  If fpw_lsn &lt;= RedoRecPtr, the function does not perform the</span>
<span class="line"> * insertion and returns InvalidXLogRecPtr.  The caller can then recalculate</span>
<span class="line"> * which pages need a full-page image, and retry.  If fpw_lsn is invalid, the</span>
<span class="line"> * record is always inserted.</span>
<span class="line"> *</span>
<span class="line"> * &#39;flags&#39; gives more in-depth control on the record being inserted. See</span>
<span class="line"> * XLogSetRecordFlags() for details.</span>
<span class="line"> *</span>
<span class="line"> * &#39;topxid_included&#39; tells whether the top-transaction id is logged along with</span>
<span class="line"> * current subtransaction. See XLogRecordAssemble().</span>
<span class="line"> *</span>
<span class="line"> * The first XLogRecData in the chain must be for the record header, and its</span>
<span class="line"> * data must be MAXALIGNed.  XLogInsertRecord fills in the xl_prev and</span>
<span class="line"> * xl_crc fields in the header, the rest of the header must already be filled</span>
<span class="line"> * by the caller.</span>
<span class="line"> *</span>
<span class="line"> * Returns XLOG pointer to end of record (beginning of next record).</span>
<span class="line"> * This can be used as LSN for data pages affected by the logged action.</span>
<span class="line"> * (LSN is the XLOG point up to which the XLOG must be flushed to disk</span>
<span class="line"> * before the data page can be written out.  This implements the basic</span>
<span class="line"> * WAL rule &quot;write the log before the data&quot;.)</span>
<span class="line"> */</span></span>
<span class="line">XLogRecPtr</span>
<span class="line"><span class="token function">XLogInsertRecord</span><span class="token punctuation">(</span>XLogRecData <span class="token operator">*</span>rdata<span class="token punctuation">,</span></span>
<span class="line">                 XLogRecPtr fpw_lsn<span class="token punctuation">,</span></span>
<span class="line">                 uint8 flags<span class="token punctuation">,</span></span>
<span class="line">                 <span class="token keyword">int</span> num_fpi<span class="token punctuation">,</span></span>
<span class="line">                 bool topxid_included<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*----------</span>
<span class="line">     *</span>
<span class="line">     * We have now done all the preparatory work we can without holding a</span>
<span class="line">     * lock or modifying shared state. From here on, inserting the new WAL</span>
<span class="line">     * record to the shared WAL buffer cache is a two-step process:</span>
<span class="line">     *</span>
<span class="line">     * 1. Reserve the right amount of space from the WAL. The current head of</span>
<span class="line">     *    reserved space is kept in Insert-&gt;CurrBytePos, and is protected by</span>
<span class="line">     *    insertpos_lck.</span>
<span class="line">     *</span>
<span class="line">     * 2. Copy the record to the reserved WAL space. This involves finding the</span>
<span class="line">     *    correct WAL buffer containing the reserved space, and copying the</span>
<span class="line">     *    record in place. This can be done concurrently in multiple processes.</span>
<span class="line">     *</span>
<span class="line">     * To keep track of which insertions are still in-progress, each concurrent</span>
<span class="line">     * inserter acquires an insertion lock. In addition to just indicating that</span>
<span class="line">     * an insertion is in progress, the lock tells others how far the inserter</span>
<span class="line">     * has progressed. There is a small fixed number of insertion locks,</span>
<span class="line">     * determined by NUM_XLOGINSERT_LOCKS. When an inserter crosses a page</span>
<span class="line">     * boundary, it updates the value stored in the lock to the how far it has</span>
<span class="line">     * inserted, to allow the previous buffer to be flushed.</span>
<span class="line">     *</span>
<span class="line">     * Holding onto an insertion lock also protects RedoRecPtr and</span>
<span class="line">     * fullPageWrites from changing until the insertion is finished.</span>
<span class="line">     *</span>
<span class="line">     * Step 2 can usually be done completely in parallel. If the required WAL</span>
<span class="line">     * page is not initialized yet, you have to grab WALBufMappingLock to</span>
<span class="line">     * initialize it, but the WAL writer tries to do that ahead of insertions</span>
<span class="line">     * to avoid that from happening in the critical path.</span>
<span class="line">     *</span>
<span class="line">     *----------</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">START_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">likely</span><span class="token punctuation">(</span>class <span class="token operator">==</span> WALINSERT_NORMAL<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">WALInsertLockAcquire</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Reserve space for the record in the WAL. This also sets the xl_prev</span>
<span class="line">         * pointer.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">ReserveXLogInsertLocation</span><span class="token punctuation">(</span>rechdr<span class="token operator">-&gt;</span>xl_tot_len<span class="token punctuation">,</span> <span class="token operator">&amp;</span>StartPos<span class="token punctuation">,</span> <span class="token operator">&amp;</span>EndPos<span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token operator">&amp;</span>rechdr<span class="token operator">-&gt;</span>xl_prev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Normal records are always inserted. */</span></span>
<span class="line">        inserted <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>class <span class="token operator">==</span> WALINSERT_SPECIAL_SWITCH<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * In order to insert an XLOG_SWITCH record, we need to hold all of</span>
<span class="line">         * the WAL insertion locks, not just one, so that no one else can</span>
<span class="line">         * begin inserting a record until we&#39;ve figured out how much space</span>
<span class="line">         * remains in the current WAL segment and claimed all of it.</span>
<span class="line">         *</span>
<span class="line">         * Nonetheless, this case is simpler than the normal cases handled</span>
<span class="line">         * below, which must check for changes in doPageWrites and RedoRecPtr.</span>
<span class="line">         * Those checks are only needed for records that can contain buffer</span>
<span class="line">         * references, and an XLOG_SWITCH record never does.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>fpw_lsn <span class="token operator">==</span> InvalidXLogRecPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">WALInsertLockAcquireExclusive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        inserted <span class="token operator">=</span> <span class="token function">ReserveXLogSwitch</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>StartPos<span class="token punctuation">,</span> <span class="token operator">&amp;</span>EndPos<span class="token punctuation">,</span> <span class="token operator">&amp;</span>rechdr<span class="token operator">-&gt;</span>xl_prev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>class <span class="token operator">==</span> WALINSERT_SPECIAL_CHECKPOINT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We need to update both the local and shared copies of RedoRecPtr,</span>
<span class="line">         * which means that we need to hold all the WAL insertion locks.</span>
<span class="line">         * However, there can&#39;t be any buffer references, so as above, we need</span>
<span class="line">         * not check RedoRecPtr before inserting the record; we just need to</span>
<span class="line">         * update it afterwards.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>fpw_lsn <span class="token operator">==</span> InvalidXLogRecPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">WALInsertLockAcquireExclusive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ReserveXLogInsertLocation</span><span class="token punctuation">(</span>rechdr<span class="token operator">-&gt;</span>xl_tot_len<span class="token punctuation">,</span> <span class="token operator">&amp;</span>StartPos<span class="token punctuation">,</span> <span class="token operator">&amp;</span>EndPos<span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token operator">&amp;</span>rechdr<span class="token operator">-&gt;</span>xl_prev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        RedoRecPtr <span class="token operator">=</span> Insert<span class="token operator">-&gt;</span>RedoRecPtr <span class="token operator">=</span> StartPos<span class="token punctuation">;</span></span>
<span class="line">        inserted <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>inserted<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Now that xl_prev has been filled in, calculate CRC of the record</span>
<span class="line">         * header.</span>
<span class="line">         */</span></span>
<span class="line">        rdata_crc <span class="token operator">=</span> rechdr<span class="token operator">-&gt;</span>xl_crc<span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">COMP_CRC32C</span><span class="token punctuation">(</span>rdata_crc<span class="token punctuation">,</span> rechdr<span class="token punctuation">,</span> <span class="token function">offsetof</span><span class="token punctuation">(</span>XLogRecord<span class="token punctuation">,</span> xl_crc<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">FIN_CRC32C</span><span class="token punctuation">(</span>rdata_crc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        rechdr<span class="token operator">-&gt;</span>xl_crc <span class="token operator">=</span> rdata_crc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * All the record data, including the header, is now ready to be</span>
<span class="line">         * inserted. Copy the record in the space reserved.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">CopyXLogRecordToWAL</span><span class="token punctuation">(</span>rechdr<span class="token operator">-&gt;</span>xl_tot_len<span class="token punctuation">,</span></span>
<span class="line">                            class <span class="token operator">==</span> WALINSERT_SPECIAL_SWITCH<span class="token punctuation">,</span> rdata<span class="token punctuation">,</span></span>
<span class="line">                            StartPos<span class="token punctuation">,</span> EndPos<span class="token punctuation">,</span> insertTLI<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Done! Let others know that we&#39;re finished.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">WALInsertLockRelease</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">END_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="wal-日志空间分配" tabindex="-1"><a class="header-anchor" href="#wal-日志空间分配"><span>WAL 日志空间分配</span></a></h2><p>当进程需要写入一条 WAL 日志记录时，首先需要在 WAL 日志文件中分配预留空间，也即对应了在共享内存 WAL buffer 中预留空间。为了保证每条日志记录的原子性，分配预留空间的操作是必须是串行的，每次只能有一个进程操作当前已被分配的 WAL 日志位置指针。核心数据结构为 <code>XLogCtlInsert</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Shared state data for WAL insertion.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">XLogCtlInsert</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">slock_t</span>     insertpos_lck<span class="token punctuation">;</span>  <span class="token comment">/* protects CurrBytePos and PrevBytePos */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * CurrBytePos is the end of reserved WAL. The next record will be</span>
<span class="line">     * inserted at that position. PrevBytePos is the start position of the</span>
<span class="line">     * previously inserted (or rather, reserved) record - it is copied to the</span>
<span class="line">     * prev-link of the next record. These are stored as &quot;usable byte</span>
<span class="line">     * positions&quot; rather than XLogRecPtrs (see XLogBytePosToRecPtr()).</span>
<span class="line">     */</span></span>
<span class="line">    uint64      CurrBytePos<span class="token punctuation">;</span></span>
<span class="line">    uint64      PrevBytePos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span> XLogCtlInsert<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>CurrBytePos</code> 和 <code>PrevBytePos</code> 共同表示当前已经分配完空间的最后一条 WAL 日志记录的区间，下一条 WAL 日志的分配应该从 <code>CurrBytePos</code> 开始。为确保空间分配的原子性，这两个字段由自旋锁 <code>insertpos_lck</code> 保护。持有这把锁时，临界区需要尽可能小：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Reserves the right amount of space for a record of given size from the WAL.</span>
<span class="line"> * *StartPos is set to the beginning of the reserved section, *EndPos to</span>
<span class="line"> * its end+1. *PrevPtr is set to the beginning of the previous record; it is</span>
<span class="line"> * used to set the xl_prev of this record.</span>
<span class="line"> *</span>
<span class="line"> * This is the performance critical part of XLogInsert that must be serialized</span>
<span class="line"> * across backends. The rest can happen mostly in parallel. Try to keep this</span>
<span class="line"> * section as short as possible, insertpos_lck can be heavily contended on a</span>
<span class="line"> * busy system.</span>
<span class="line"> *</span>
<span class="line"> * NB: The space calculation here must match the code in CopyXLogRecordToWAL,</span>
<span class="line"> * where we actually copy the record to the reserved space.</span>
<span class="line"> *</span>
<span class="line"> * NB: Testing shows that XLogInsertRecord runs faster if this code is inlined;</span>
<span class="line"> * however, because there are two call sites, the compiler is reluctant to</span>
<span class="line"> * inline. We use pg_attribute_always_inline here to try to convince it.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> pg_attribute_always_inline <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ReserveXLogInsertLocation</span><span class="token punctuation">(</span><span class="token keyword">int</span> size<span class="token punctuation">,</span> XLogRecPtr <span class="token operator">*</span>StartPos<span class="token punctuation">,</span> XLogRecPtr <span class="token operator">*</span>EndPos<span class="token punctuation">,</span></span>
<span class="line">                          XLogRecPtr <span class="token operator">*</span>PrevPtr<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    XLogCtlInsert <span class="token operator">*</span>Insert <span class="token operator">=</span> <span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>Insert<span class="token punctuation">;</span></span>
<span class="line">    uint64      startbytepos<span class="token punctuation">;</span></span>
<span class="line">    uint64      endbytepos<span class="token punctuation">;</span></span>
<span class="line">    uint64      prevbytepos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    size <span class="token operator">=</span> <span class="token function">MAXALIGN</span><span class="token punctuation">(</span>size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* All (non xlog-switch) records should contain data. */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>size <span class="token operator">&gt;</span> SizeOfXLogRecord<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The duration the spinlock needs to be held is minimized by minimizing</span>
<span class="line">     * the calculations that have to be done while holding the lock. The</span>
<span class="line">     * current tip of reserved WAL is kept in CurrBytePos, as a byte position</span>
<span class="line">     * that only counts &quot;usable&quot; bytes in WAL, that is, it excludes all WAL</span>
<span class="line">     * page headers. The mapping between &quot;usable&quot; byte positions and physical</span>
<span class="line">     * positions (XLogRecPtrs) can be done outside the locked region, and</span>
<span class="line">     * because the usable byte position doesn&#39;t include any headers, reserving</span>
<span class="line">     * X bytes from WAL is almost as simple as &quot;CurrBytePos += X&quot;.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">SpinLockAcquire</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Insert<span class="token operator">-&gt;</span>insertpos_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    startbytepos <span class="token operator">=</span> Insert<span class="token operator">-&gt;</span>CurrBytePos<span class="token punctuation">;</span></span>
<span class="line">    endbytepos <span class="token operator">=</span> startbytepos <span class="token operator">+</span> size<span class="token punctuation">;</span></span>
<span class="line">    prevbytepos <span class="token operator">=</span> Insert<span class="token operator">-&gt;</span>PrevBytePos<span class="token punctuation">;</span></span>
<span class="line">    Insert<span class="token operator">-&gt;</span>CurrBytePos <span class="token operator">=</span> endbytepos<span class="token punctuation">;</span></span>
<span class="line">    Insert<span class="token operator">-&gt;</span>PrevBytePos <span class="token operator">=</span> startbytepos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SpinLockRelease</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Insert<span class="token operator">-&gt;</span>insertpos_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token operator">*</span>StartPos <span class="token operator">=</span> <span class="token function">XLogBytePosToRecPtr</span><span class="token punctuation">(</span>startbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">*</span>EndPos <span class="token operator">=</span> <span class="token function">XLogBytePosToEndRecPtr</span><span class="token punctuation">(</span>endbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">*</span>PrevPtr <span class="token operator">=</span> <span class="token function">XLogBytePosToRecPtr</span><span class="token punctuation">(</span>prevbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Check that the conversions between &quot;usable byte positions&quot; and</span>
<span class="line">     * XLogRecPtrs work consistently in both directions.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">XLogRecPtrToBytePos</span><span class="token punctuation">(</span><span class="token operator">*</span>StartPos<span class="token punctuation">)</span> <span class="token operator">==</span> startbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">XLogRecPtrToBytePos</span><span class="token punctuation">(</span><span class="token operator">*</span>EndPos<span class="token punctuation">)</span> <span class="token operator">==</span> endbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">XLogRecPtrToBytePos</span><span class="token punctuation">(</span><span class="token operator">*</span>PrevPtr<span class="token punctuation">)</span> <span class="token operator">==</span> prevbytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>熟知的 <code>pg_current_wal_insert_lsn()</code> 也是通过上自旋锁以后获取到 <code>CurrBytePos</code> 的值：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Get latest WAL insert pointer</span>
<span class="line"> */</span></span>
<span class="line">XLogRecPtr</span>
<span class="line"><span class="token function">GetXLogInsertRecPtr</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    XLogCtlInsert <span class="token operator">*</span>Insert <span class="token operator">=</span> <span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>Insert<span class="token punctuation">;</span></span>
<span class="line">    uint64      current_bytepos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">SpinLockAcquire</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Insert<span class="token operator">-&gt;</span>insertpos_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    current_bytepos <span class="token operator">=</span> Insert<span class="token operator">-&gt;</span>CurrBytePos<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">SpinLockRelease</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Insert<span class="token operator">-&gt;</span>insertpos_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">XLogBytePosToRecPtr</span><span class="token punctuation">(</span>current_bytepos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="拷贝日志到-wal-buffer" tabindex="-1"><a class="header-anchor" href="#拷贝日志到-wal-buffer"><span>拷贝日志到 WAL Buffer</span></a></h2><p>在每个进程都通过前一步分配好自己独占的 WAL 日志空间后，就可以将自己要产生的 WAL 日志拷贝到与空间相对应的 WAL buffer 中。由于空间分配是串行的，各进程要拷贝的目标地址互不重合，因此可以并发。但是多进程在并行工作的时候依旧需要加不同的锁来保证正确性。</p><h3 id="walinsertlock" tabindex="-1"><a class="header-anchor" href="#walinsertlock"><span>WALInsertLock</span></a></h3><p>当进程要向 WAL buffer 中拷贝内容时，需要先加 WALInsertLock。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Inserting to WAL is protected by a small fixed number of WAL insertion</span>
<span class="line"> * locks. To insert to the WAL, you must hold one of the locks - it doesn&#39;t</span>
<span class="line"> * matter which one. To lock out other concurrent insertions, you must hold</span>
<span class="line"> * of them. Each WAL insertion lock consists of a lightweight lock, plus an</span>
<span class="line"> * indicator of how far the insertion has progressed (insertingAt).</span>
<span class="line"> *</span>
<span class="line"> * The insertingAt values are read when a process wants to flush WAL from</span>
<span class="line"> * the in-memory buffers to disk, to check that all the insertions to the</span>
<span class="line"> * region the process is about to write out have finished. You could simply</span>
<span class="line"> * wait for all currently in-progress insertions to finish, but the</span>
<span class="line"> * insertingAt indicator allows you to ignore insertions to later in the WAL,</span>
<span class="line"> * so that you only wait for the insertions that are modifying the buffers</span>
<span class="line"> * you&#39;re about to write out.</span>
<span class="line"> *</span>
<span class="line"> * This isn&#39;t just an optimization. If all the WAL buffers are dirty, an</span>
<span class="line"> * inserter that&#39;s holding a WAL insert lock might need to evict an old WAL</span>
<span class="line"> * buffer, which requires flushing the WAL. If it&#39;s possible for an inserter</span>
<span class="line"> * to block on another inserter unnecessarily, deadlock can arise when two</span>
<span class="line"> * inserters holding a WAL insert lock wait for each other to finish their</span>
<span class="line"> * insertion.</span>
<span class="line"> *</span>
<span class="line"> * Small WAL records that don&#39;t cross a page boundary never update the value,</span>
<span class="line"> * the WAL record is just copied to the page and the lock is released. But</span>
<span class="line"> * to avoid the deadlock-scenario explained above, the indicator is always</span>
<span class="line"> * updated before sleeping while holding an insertion lock.</span>
<span class="line"> *</span>
<span class="line"> * lastImportantAt contains the LSN of the last important WAL record inserted</span>
<span class="line"> * using a given lock. This value is used to detect if there has been</span>
<span class="line"> * important WAL activity since the last time some action, like a checkpoint,</span>
<span class="line"> * was performed - allowing to not repeat the action if not. The LSN is</span>
<span class="line"> * updated for all insertions, unless the XLOG_MARK_UNIMPORTANT flag was</span>
<span class="line"> * set. lastImportantAt is never cleared, only overwritten by the LSN of newer</span>
<span class="line"> * records.  Tracking the WAL activity directly in WALInsertLock has the</span>
<span class="line"> * advantage of not needing any additional locks to update the value.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LWLock      lock<span class="token punctuation">;</span></span>
<span class="line">    pg_atomic_uint64 insertingAt<span class="token punctuation">;</span></span>
<span class="line">    XLogRecPtr  lastImportantAt<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> WALInsertLock<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * All the WAL insertion locks are allocated as an array in shared memory. We</span>
<span class="line"> * force the array stride to be a power of 2, which saves a few cycles in</span>
<span class="line"> * indexing, but more importantly also ensures that individual slots don&#39;t</span>
<span class="line"> * cross cache line boundaries. (Of course, we have to also ensure that the</span>
<span class="line"> * array start address is suitably aligned.)</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">union</span> WALInsertLockPadded</span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    WALInsertLock l<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span>        pad<span class="token punctuation">[</span>PG_CACHE_LINE_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> WALInsertLockPadded<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Shared state data for WAL insertion.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">XLogCtlInsert</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * WAL insertion locks.</span>
<span class="line">     */</span></span>
<span class="line">    WALInsertLockPadded <span class="token operator">*</span>WALInsertLocks<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> XLogCtlInsert<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Number of WAL insertion locks to use. A higher value allows more insertions</span>
<span class="line"> * to happen concurrently, but adds some CPU overhead to flushing the WAL,</span>
<span class="line"> * which needs to iterate all the locks.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">NUM_XLOGINSERT_LOCKS</span>  <span class="token expression"><span class="token number">8</span></span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这是一个固定数量的轻量级锁，锁内附带了一个 <code>insertingAt</code> 字段，表示当前持有锁的进程已经完成插入的位置。该字段表示，对当前进程来说，该位置之前的 WAL 日志已经可以被 flush 到存储上了。每个进程具体要使用哪一把 WALInsertLock 并不重要，这里是想通过锁的数量来控制并发插入 WAL 日志的进程数。</p><h3 id="walbufmappinglock" tabindex="-1"><a class="header-anchor" href="#walbufmappinglock"><span>WALBufMappingLock</span></a></h3><p>WALBufMappingLock 是一个单独的轻量级锁，当进程需要修改一块 WAL buffer 与一个 WAL 日志文件页面的映射关系时，需要独占持有该锁，防止并发进程重复初始化页面和修改映射。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*----------</span>
<span class="line"> *</span>
<span class="line"> * WALBufMappingLock: must be held to replace a page in the WAL buffer cache.</span>
<span class="line"> * It is only held while initializing and changing the mapping.  If the</span>
<span class="line"> * contents of the buffer being replaced haven&#39;t been written yet, the mapping</span>
<span class="line"> * lock is released while the write is done, and reacquired afterwards.</span>
<span class="line"> *</span>
<span class="line"> *----------</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="walwritelock" tabindex="-1"><a class="header-anchor" href="#walwritelock"><span>WALWriteLock</span></a></h3><p>单独的轻量级锁，在进程将 WAL buffer 中的内容同步到存储时独占使用。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*----------</span>
<span class="line"> *</span>
<span class="line"> * WALWriteLock: must be held to write WAL buffers to disk (XLogWrite or</span>
<span class="line"> * XLogFlush).</span>
<span class="line"> *</span>
<span class="line"> *----------</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="wal-buffer" tabindex="-1"><a class="header-anchor" href="#wal-buffer"><span>WAL Buffer</span></a></h3><p>WAL buffer 由 <code>XLogCtlData</code> 结构中的三个字段维护，其大小受 <code>wal_buffers</code> 参数控制：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Total shared-memory state for XLOG.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">XLogCtlData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * These values do not change after startup, although the pointed-to pages</span>
<span class="line">     * and xlblocks values certainly do.  xlblocks values are protected by</span>
<span class="line">     * WALBufMappingLock.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>pages<span class="token punctuation">;</span>          <span class="token comment">/* buffers for unwritten XLOG pages */</span></span>
<span class="line">    pg_atomic_uint64 <span class="token operator">*</span>xlblocks<span class="token punctuation">;</span> <span class="token comment">/* 1st byte ptr-s + XLOG_BLCKSZ */</span></span>
<span class="line">    <span class="token keyword">int</span>         XLogCacheBlck<span class="token punctuation">;</span>  <span class="token comment">/* highest allocated xlog buffer index */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span> XLogCtlData<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中 <code>XLogCacheBlck</code> 用于标识 WAL buffer 的长度，<code>pages</code> 指向实际的 buffer 页面。原子变量 <code>xlblocks</code> 与每一块 WAL buffer 一一对应，表示与当前 WAL buffer 对应的 WAL 日志位置。</p><p>给定一个要插入的 WAL 日志位置，可以通过以下函数定位到对应的 WAL buffer 页面：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Get a pointer to the right location in the WAL buffer containing the</span>
<span class="line"> * given XLogRecPtr.</span>
<span class="line"> *</span>
<span class="line"> * If the page is not initialized yet, it is initialized. That might require</span>
<span class="line"> * evicting an old dirty buffer from the buffer cache, which means I/O.</span>
<span class="line"> *</span>
<span class="line"> * The caller must ensure that the page containing the requested location</span>
<span class="line"> * isn&#39;t evicted yet, and won&#39;t be evicted. The way to ensure that is to</span>
<span class="line"> * hold onto a WAL insertion lock with the insertingAt position set to</span>
<span class="line"> * something &lt;= ptr. GetXLogBuffer() will update insertingAt if it needs</span>
<span class="line"> * to evict an old page from the buffer. (This means that once you call</span>
<span class="line"> * GetXLogBuffer() with a given &#39;ptr&#39;, you must not access anything before</span>
<span class="line"> * that point anymore, and must not call GetXLogBuffer() with an older &#39;ptr&#39;</span>
<span class="line"> * later, because older buffers might be recycled already)</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">char</span> <span class="token operator">*</span></span>
<span class="line"><span class="token function">GetXLogBuffer</span><span class="token punctuation">(</span>XLogRecPtr ptr<span class="token punctuation">,</span> TimeLineID tli<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Fast path for the common case that we need to access again the same</span>
<span class="line">     * page as last time.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptr <span class="token operator">/</span> XLOG_BLCKSZ <span class="token operator">==</span> cachedPage<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">(</span>XLogPageHeader<span class="token punctuation">)</span> cachedPos<span class="token punctuation">)</span><span class="token operator">-&gt;</span>xlp_magic <span class="token operator">==</span> XLOG_PAGE_MAGIC<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">(</span>XLogPageHeader<span class="token punctuation">)</span> cachedPos<span class="token punctuation">)</span><span class="token operator">-&gt;</span>xlp_pageaddr <span class="token operator">==</span> ptr <span class="token operator">-</span> <span class="token punctuation">(</span>ptr <span class="token operator">%</span> XLOG_BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> cachedPos <span class="token operator">+</span> ptr <span class="token operator">%</span> XLOG_BLCKSZ<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The XLog buffer cache is organized so that a page is always loaded to a</span>
<span class="line">     * particular buffer.  That way we can easily calculate the buffer a given</span>
<span class="line">     * page must be loaded into, from the XLogRecPtr alone.</span>
<span class="line">     */</span></span>
<span class="line">    idx <span class="token operator">=</span> <span class="token function">XLogRecPtrToBufIdx</span><span class="token punctuation">(</span>ptr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * See what page is loaded in the buffer at the moment. It could be the</span>
<span class="line">     * page we&#39;re looking for, or something older. It can&#39;t be anything newer</span>
<span class="line">     * - that would imply the page we&#39;re looking for has already been written</span>
<span class="line">     * out to disk and evicted, and the caller is responsible for making sure</span>
<span class="line">     * that doesn&#39;t happen.</span>
<span class="line">     *</span>
<span class="line">     * We don&#39;t hold a lock while we read the value. If someone is just about</span>
<span class="line">     * to initialize or has just initialized the page, it&#39;s possible that we</span>
<span class="line">     * get InvalidXLogRecPtr. That&#39;s ok, we&#39;ll grab the mapping lock (in</span>
<span class="line">     * AdvanceXLInsertBuffer) and retry if we see anything other than the page</span>
<span class="line">     * we&#39;re looking for.</span>
<span class="line">     */</span></span>
<span class="line">    expectedEndPtr <span class="token operator">=</span> ptr<span class="token punctuation">;</span></span>
<span class="line">    expectedEndPtr <span class="token operator">+=</span> XLOG_BLCKSZ <span class="token operator">-</span> ptr <span class="token operator">%</span> XLOG_BLCKSZ<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    endptr <span class="token operator">=</span> <span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>idx<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>expectedEndPtr <span class="token operator">!=</span> endptr<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        XLogRecPtr  initializedUpto<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Before calling AdvanceXLInsertBuffer(), which can block, let others</span>
<span class="line">         * know how far we&#39;re finished with inserting the record.</span>
<span class="line">         *</span>
<span class="line">         * NB: If &#39;ptr&#39; points to just after the page header, advertise a</span>
<span class="line">         * position at the beginning of the page rather than &#39;ptr&#39; itself. If</span>
<span class="line">         * there are no other insertions running, someone might try to flush</span>
<span class="line">         * up to our advertised location. If we advertised a position after</span>
<span class="line">         * the page header, someone might try to flush the page header, even</span>
<span class="line">         * though page might actually not be initialized yet. As the first</span>
<span class="line">         * inserter on the page, we are effectively responsible for making</span>
<span class="line">         * sure that it&#39;s initialized, before we let insertingAt to move past</span>
<span class="line">         * the page header.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">WALInsertLockUpdateInsertingAt</span><span class="token punctuation">(</span>initializedUpto<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">AdvanceXLInsertBuffer</span><span class="token punctuation">(</span>ptr<span class="token punctuation">,</span> tli<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        endptr <span class="token operator">=</span> <span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>idx<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Make sure the initialization of the page is visible to us, and</span>
<span class="line">         * won&#39;t arrive later to overwrite the WAL data we write on the page.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">pg_memory_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于要插入的 WAL 日志位置，根据 WAL 日志页面大小和 WAL buffer 的大小进行取模运算后，可以定位到对应的 WAL buffer 地址。然后再通过比较这块 buffer 的 <code>xlblocks</code> 确认当前 buffer 里的内容是不是属于当前 WAL 日志页面的。如果是，就可以直接使用；如果不是，则需要更新一下当前 WALInsertLock 上的 <code>insertingAt</code>，表示在此之前的 WAL 日志已经可以被 flush 到存储了，然后再通过 <code>AdvanceXLInsertBuffer</code> 把当前的 buffer 给腾出来。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Initialize XLOG buffers, writing out old buffers if they still contain</span>
<span class="line"> * unwritten data, upto the page containing &#39;upto&#39;. Or if &#39;opportunistic&#39; is</span>
<span class="line"> * true, initialize as many pages as we can without having to write out</span>
<span class="line"> * unwritten data. Any new pages are initialized to zeros, with pages headers</span>
<span class="line"> * initialized properly.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">AdvanceXLInsertBuffer</span><span class="token punctuation">(</span>XLogRecPtr upto<span class="token punctuation">,</span> TimeLineID tli<span class="token punctuation">,</span> bool opportunistic<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    XLogCtlInsert <span class="token operator">*</span>Insert <span class="token operator">=</span> <span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>Insert<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         nextidx<span class="token punctuation">;</span></span>
<span class="line">    XLogRecPtr  OldPageRqstPtr<span class="token punctuation">;</span></span>
<span class="line">    XLogwrtRqst WriteRqst<span class="token punctuation">;</span></span>
<span class="line">    XLogRecPtr  NewPageEndPtr <span class="token operator">=</span> InvalidXLogRecPtr<span class="token punctuation">;</span></span>
<span class="line">    XLogRecPtr  NewPageBeginPtr<span class="token punctuation">;</span></span>
<span class="line">    XLogPageHeader NewPage<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         npages <span class="token function">pg_attribute_unused</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>WALBufMappingLock<span class="token punctuation">,</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Now that we have the lock, check if someone initialized the page</span>
<span class="line">     * already.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>upto <span class="token operator">&gt;=</span> XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo <span class="token operator">||</span> opportunistic<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        nextidx <span class="token operator">=</span> <span class="token function">XLogRecPtrToBufIdx</span><span class="token punctuation">(</span>XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Get ending-offset of the buffer page we need to replace (this may</span>
<span class="line">         * be zero if the buffer hasn&#39;t been used yet).  Fall through if it&#39;s</span>
<span class="line">         * already written out.</span>
<span class="line">         */</span></span>
<span class="line">        OldPageRqstPtr <span class="token operator">=</span> <span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">.</span>Write <span class="token operator">&lt;</span> OldPageRqstPtr<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Nope, got work to do. If we just want to pre-initialize as much</span>
<span class="line">             * as we can without flushing, give up now.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>opportunistic<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* Advance shared memory write request position */</span></span>
<span class="line">            <span class="token function">SpinLockAcquire</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>info_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>XLogCtl<span class="token operator">-&gt;</span>LogwrtRqst<span class="token punctuation">.</span>Write <span class="token operator">&lt;</span> OldPageRqstPtr<span class="token punctuation">)</span></span>
<span class="line">                XLogCtl<span class="token operator">-&gt;</span>LogwrtRqst<span class="token punctuation">.</span>Write <span class="token operator">=</span> OldPageRqstPtr<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">SpinLockRelease</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>info_lck<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Acquire an up-to-date LogwrtResult value and see if we still</span>
<span class="line">             * need to write it or if someone else already did.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">RefreshXLogWriteResult</span><span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">.</span>Write <span class="token operator">&lt;</span> OldPageRqstPtr<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Must acquire write lock. Release WALBufMappingLock first,</span>
<span class="line">                 * to make sure that all insertions that we need to wait for</span>
<span class="line">                 * can finish (up to this same position). Otherwise we risk</span>
<span class="line">                 * deadlock.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>WALBufMappingLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">WaitXLogInsertionsToFinish</span><span class="token punctuation">(</span>OldPageRqstPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>WALWriteLock<span class="token punctuation">,</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">RefreshXLogWriteResult</span><span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">.</span>Write <span class="token operator">&gt;=</span> OldPageRqstPtr<span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/* OK, someone wrote it already */</span></span>
<span class="line">                    <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>WALWriteLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token keyword">else</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">/* Have to write it ourselves */</span></span>
<span class="line">                    <span class="token function">TRACE_POSTGRESQL_WAL_BUFFER_WRITE_DIRTY_START</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    WriteRqst<span class="token punctuation">.</span>Write <span class="token operator">=</span> OldPageRqstPtr<span class="token punctuation">;</span></span>
<span class="line">                    WriteRqst<span class="token punctuation">.</span>Flush <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token function">XLogWrite</span><span class="token punctuation">(</span>WriteRqst<span class="token punctuation">,</span> tli<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>WALWriteLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    PendingWalStats<span class="token punctuation">.</span>wal_buffers_full<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token function">TRACE_POSTGRESQL_WAL_BUFFER_WRITE_DIRTY_DONE</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                <span class="token comment">/* Re-acquire WALBufMappingLock and retry */</span></span>
<span class="line">                <span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>WALBufMappingLock<span class="token punctuation">,</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Now the next buffer slot is free and we can set it up to be the</span>
<span class="line">         * next output page.</span>
<span class="line">         */</span></span>
<span class="line">        NewPageBeginPtr <span class="token operator">=</span> XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo<span class="token punctuation">;</span></span>
<span class="line">        NewPageEndPtr <span class="token operator">=</span> NewPageBeginPtr <span class="token operator">+</span> XLOG_BLCKSZ<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">XLogRecPtrToBufIdx</span><span class="token punctuation">(</span>NewPageBeginPtr<span class="token punctuation">)</span> <span class="token operator">==</span> nextidx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        NewPage <span class="token operator">=</span> <span class="token punctuation">(</span>XLogPageHeader<span class="token punctuation">)</span> <span class="token punctuation">(</span>XLogCtl<span class="token operator">-&gt;</span>pages <span class="token operator">+</span> nextidx <span class="token operator">*</span> <span class="token punctuation">(</span>Size<span class="token punctuation">)</span> XLOG_BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Mark the xlblock with InvalidXLogRecPtr and issue a write barrier</span>
<span class="line">         * before initializing. Otherwise, the old page may be partially</span>
<span class="line">         * zeroed but look valid.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">pg_atomic_write_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">,</span> InvalidXLogRecPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">pg_write_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* init WAL ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Make sure the initialization of the page becomes visible to others</span>
<span class="line">         * before the xlblocks update. GetXLogBuffer() reads xlblocks without</span>
<span class="line">         * holding a lock.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">pg_write_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">pg_atomic_write_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">,</span> NewPageEndPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo <span class="token operator">=</span> NewPageEndPtr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        npages<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>WALBufMappingLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该函数从 WAL buffer 中最老的页面开始检查，如果 WAL 日志的刷盘进度已经落后于当前 WAL buffer，则需要将当前的 WAL buffer 内容刷盘。如果 WAL buffer 页面还有正在进行中的拷入，则等待拷入完成。完成后，释放 WALBufMappingLock，然后独占 WALWriteLock 将日志写入到存储，然后再次获取 WALBufMappingLock 重试。直到当前要插入的 WAL buffer 页面可以被腾出来使用。页面腾空后，做必要的初始化然后返回。</p><h3 id="日志拷入" tabindex="-1"><a class="header-anchor" href="#日志拷入"><span>日志拷入</span></a></h3><p>借助上述函数和锁的支持，多个进程可以并发向 WAL buffer 中预留好的空间拷贝日志，完成写入。该函数主要借助上面的 <code>GetXLogBuffer</code> 完成：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Subroutine of XLogInsertRecord.  Copies a WAL record to an already-reserved</span>
<span class="line"> * area in the WAL.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">CopyXLogRecordToWAL</span><span class="token punctuation">(</span><span class="token keyword">int</span> write_len<span class="token punctuation">,</span> bool isLogSwitch<span class="token punctuation">,</span> XLogRecData <span class="token operator">*</span>rdata<span class="token punctuation">,</span></span>
<span class="line">                    XLogRecPtr StartPos<span class="token punctuation">,</span> XLogRecPtr EndPos<span class="token punctuation">,</span> TimeLineID tli<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="后台日志刷盘" tabindex="-1"><a class="header-anchor" href="#后台日志刷盘"><span>后台日志刷盘</span></a></h2><p>此外，后台的 WAL Writer 进程也会周期性地调用 <code>XLogBackgroundFlush</code> 将 WAL buffer 中未被写入存储的页面刷到磁盘。刷盘完毕后，已被下刷完毕的 WAL buffer 页面可以被复用。这些 WAL buffer 将会被提前清零，预分配给后续的 WAL 日志写入使用。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Write &amp; flush xlog, but without specifying exactly where to.</span>
<span class="line"> *</span>
<span class="line"> * We normally write only completed blocks; but if there is nothing to do on</span>
<span class="line"> * that basis, we check for unwritten async commits in the current incomplete</span>
<span class="line"> * block, and write through the latest one of those.  Thus, if async commits</span>
<span class="line"> * are not being used, we will write complete blocks only.</span>
<span class="line"> *</span>
<span class="line"> * If, based on the above, there&#39;s anything to write we do so immediately. But</span>
<span class="line"> * to avoid calling fsync, fdatasync et. al. at a rate that&#39;d impact</span>
<span class="line"> * concurrent IO, we only flush WAL every wal_writer_delay ms, or if there&#39;s</span>
<span class="line"> * more than wal_writer_flush_after unflushed blocks.</span>
<span class="line"> *</span>
<span class="line"> * We can guarantee that async commits reach disk after at most three</span>
<span class="line"> * wal_writer_delay cycles. (When flushing complete blocks, we allow XLogWrite</span>
<span class="line"> * to write &quot;flexibly&quot;, meaning it can stop at the end of the buffer ring;</span>
<span class="line"> * this makes a difference only with very high load or long wal_writer_delay,</span>
<span class="line"> * but imposes one extra cycle for the worst case for async commits.)</span>
<span class="line"> *</span>
<span class="line"> * This routine is invoked periodically by the background walwriter process.</span>
<span class="line"> *</span>
<span class="line"> * Returns true if there was any work to do, even if we skipped flushing due</span>
<span class="line"> * to wal_writer_delay/wal_writer_flush_after.</span>
<span class="line"> */</span></span>
<span class="line">bool</span>
<span class="line"><span class="token function">XLogBackgroundFlush</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">START_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* now wait for any in-progress insertions to finish and get write lock */</span></span>
<span class="line">    <span class="token function">WaitXLogInsertionsToFinish</span><span class="token punctuation">(</span>WriteRqst<span class="token punctuation">.</span>Write<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>WALWriteLock<span class="token punctuation">,</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">RefreshXLogWriteResult</span><span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>WriteRqst<span class="token punctuation">.</span>Write <span class="token operator">&gt;</span> LogwrtResult<span class="token punctuation">.</span>Write <span class="token operator">||</span></span>
<span class="line">        WriteRqst<span class="token punctuation">.</span>Flush <span class="token operator">&gt;</span> LogwrtResult<span class="token punctuation">.</span>Flush<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">XLogWrite</span><span class="token punctuation">(</span>WriteRqst<span class="token punctuation">,</span> insertTLI<span class="token punctuation">,</span> flexible<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>WALWriteLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">END_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* wake up walsenders now that we&#39;ve released heavily contended locks */</span></span>
<span class="line">    <span class="token function">WalSndWakeupProcessRequests</span><span class="token punctuation">(</span>true<span class="token punctuation">,</span> <span class="token operator">!</span><span class="token function">RecoveryInProgress</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Great, done. To take some work off the critical path, try to initialize</span>
<span class="line">     * as many of the no-longer-needed WAL buffers for future use as we can.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">AdvanceXLInsertBuffer</span><span class="token punctuation">(</span>InvalidXLogRecPtr<span class="token punctuation">,</span> insertTLI<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If we determined that we need to write data, but somebody else</span>
<span class="line">     * wrote/flushed already, it should be considered as being active, to</span>
<span class="line">     * avoid hibernating too early.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">return</span> true<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="更多" tabindex="-1"><a class="header-anchor" href="#更多"><span>更多</span></a></h2><p>在上面的流程中，可以看到对各级锁的获取与释放、对共享内存中 WAL buffer 的分配和使用、对日志空间分配/拷入/刷盘的共享状态的读取或更新，都是非常频繁的。为确保正确性需要频繁加锁。PostgreSQL 17 中优化了不少与 WAL 日志写入相关的共享状态信息。原先，不少状态变量需要被自旋锁保护，在 PostgreSQL 17 中被修改为使用原子变量。此后这些状态字段可以被多进程无锁地读写，相关代码被移出了由自旋锁保护的临界区。</p><p>这也为后续的其它优化提供了可能。比如 PostgreSQL 17 起物理复制的 WAL sender 进程支持直接从 WAL buffer 中消费 WAL 日志，以节省从磁盘读取日志的开销。在确认 WAL buffer 中的内容是否可用时，WAL sender 进程不需要加任何的锁，只需要在做内存拷贝的前后对 WAL buffer 的 <code>xlblocks</code> 进行两次原子读取，如果两次的结果相同，则说明本次内存拷贝的结果有效。这个过程对 WAL 日志的写入不会产生任何影响。但是如果像之前一样需要使用自旋锁来保证读写正确，则会对 WAL 日志的写入带来更多的锁冲突。</p><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><p><a href="https://github.com/postgres/postgres/blob/REL_17_STABLE/src/backend/access/transam/xlog.c" target="_blank" rel="noopener noreferrer">PostgreSQL Source Code - xlog.c</a></p><p><a href="https://www.postgresql.org/docs/current/wal-intro.html" target="_blank" rel="noopener noreferrer">PostgreSQL: Documentation 17: 28.3. Write-Ahead Logging (WAL)</a></p><p><a href="https://github.com/postgres/postgres/commit/c3a8e2a7cb16d55e3b757934b538cb8b8a0eab02" target="_blank" rel="noopener noreferrer">Use 64-bit atomics for xlblocks array elements</a></p><p><a href="https://www.postgresql.org/message-id/flat/CALj2ACXKKK%3DwbiG5_t6dGao5GoecMwRkhr7GjVBM_jg54%2BNa%3DQ%40mail.gmail.com" target="_blank" rel="noopener noreferrer">Read WAL directly from WAL buffers</a></p>`,59)]))}const o=s(l,[["render",p],["__file","PostgreSQL WAL Insert.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20WAL%20Insert.html","title":"PostgreSQL - WAL Insert","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"总览","slug":"总览","link":"#总览","children":[]},{"level":2,"title":"WAL 日志空间分配","slug":"wal-日志空间分配","link":"#wal-日志空间分配","children":[]},{"level":2,"title":"拷贝日志到 WAL Buffer","slug":"拷贝日志到-wal-buffer","link":"#拷贝日志到-wal-buffer","children":[{"level":3,"title":"WALInsertLock","slug":"walinsertlock","link":"#walinsertlock","children":[]},{"level":3,"title":"WALBufMappingLock","slug":"walbufmappinglock","link":"#walbufmappinglock","children":[]},{"level":3,"title":"WALWriteLock","slug":"walwritelock","link":"#walwritelock","children":[]},{"level":3,"title":"WAL Buffer","slug":"wal-buffer","link":"#wal-buffer","children":[]},{"level":3,"title":"日志拷入","slug":"日志拷入","link":"#日志拷入","children":[]}]},{"level":2,"title":"后台日志刷盘","slug":"后台日志刷盘","link":"#后台日志刷盘","children":[]},{"level":2,"title":"更多","slug":"更多","link":"#更多","children":[]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL WAL Insert.md"}');export{o as comp,r as data};
