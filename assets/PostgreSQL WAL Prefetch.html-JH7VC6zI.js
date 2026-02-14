import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function i(t,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-wal-prefetch" tabindex="-1"><a class="header-anchor" href="#postgresql-wal-prefetch"><span>PostgreSQL - WAL Prefetch</span></a></h1><p>Created by: Mr Dk.</p><p>2025 / 01 / 31 13:57</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景"><span>背景</span></a></h2><p>PostgreSQL 通过 redo WAL 日志，可以将不一致的持久化状态（crash / 基础备份）逐步恢复到一致的状态（最后一条 / 某一条 WAL 日志），从而使数据库可以重新对外提供服务。在此期间，数据库无法接受外部连接，startup 进程独自完成所有的恢复工作。因此，startup 进程的工作效率直接决定了 recovery 所需要的时间，也进而决定了业务与数据库断连的时间。</p><p>在 startup 进程的主循环中，recovery 需要完成的工作包含：</p><ol><li>将 WAL 日志读入内存</li><li>解码每一条 WAL 日志记录</li><li>根据 WAL 日志记录，将引用的数据页面读入 buffer pool</li><li>根据 WAL 日志的操作类型，对 buffer pool 中的数据页面进行更改</li><li>必要时，将更改后的状态同步回存储，并更新 recovery 进度</li><li>...</li></ol><p>上述过程中，对数据页面的修改是基于 buffer pool 中的页面完成的，可以认为是非常迅速的 on CPU 工作。只有文件 I/O 才会使 startup 进程暂停 recovery，离开 CPU 等待 I/O 完成。其中，对 WAL 日志的读取是顺序的，这个 I/O pattern 能够很容易地被 OS 推断出来从而进行 read-ahead，因此 WAL 日志的读取理应基本能够命中 OS page cache，不太会成为 I/O 瓶颈。然而，当 startup 进程根据每一条 WAL 日志记录将对应的数据页面读入 buffer pool 时，I/O pattern 是随机的，被读取的页面没有任何的局部性特征，OS 无法预读相应的页面。这会导致 startup 进程频繁因等待 I/O 而暂停。</p><p>OS 并不知道在 recovery 的过程中需要用到哪些页面，而数据库是可以知道的，所以这些页面可以被预读，在真正使用到这些页面时不必再等待 I/O。预读工作可以由数据库指引 OS 完成，甚至由数据库自己完成。在目前阶段，PostgreSQL 依旧还在使用 buffered I/O，依赖 OS 的 page cache 来管理 I/O，所以暂时只能通过 <a href="https://man7.org/linux/man-pages/man2/posix_fadvise.2.html" target="_blank" rel="noopener noreferrer"><code>posix_fadvise</code></a> 接口提示 OS 将特定页面提前装入 page cache，使后续对该页面的读取可以被优化为内存拷贝。等后续 PostgreSQL 逐渐发展为通过 direct I/O 自行管理 I/O 后，必然会通过 I/O worker 进程异步地将对应页面预读到 buffer pool 中，以减少 startup 进程的暂停。毕竟 <code>posix_fadvise</code> 只是对 OS 的提示和建议，而不是强制，OS 并不一定保证会预读页面。</p><p>PostgreSQL 15 起开始支持 <a href="https://www.postgresql.org/message-id/flat/CA%2BhUKGJ4VJN8ttxScUFM8dOKX0BrBiboo5uz1cq%3DAovOddfHpA%40mail.gmail.com" target="_blank" rel="noopener noreferrer">XLog Prefetcher</a>，在支持 <code>posix_fadvise</code> 的 OS 上将会尝试提前通知 OS 预读相应页面，同时相关接口也为目前正在进行中的异步 I/O 管理模块进行了预留，以方便后续通过 I/O worker 进程来实现预读。本文基于 PostgreSQL 17 稳定版分析相关模块的实现。</p><h2 id="实现思路" tabindex="-1"><a class="header-anchor" href="#实现思路"><span>实现思路</span></a></h2><h3 id="decode-和-redo-解耦" tabindex="-1"><a class="header-anchor" href="#decode-和-redo-解耦"><span>Decode 和 Redo 解耦</span></a></h3><p>在 PostgreSQL 14 及以前版本的 recovery 处理逻辑中，在一个大循环内，依次进行如下工作：</p><ol><li>Decode 一条 WAL 日志记录：由于每条 WAL 日志记录都是变长的，因此在解码过程中需要逐步调用 <code>WALRead</code> 函数将这条记录的完整内容从存储读入到内存</li><li>Redo 一条 WAL 日志记录：每种类型的 WAL 日志都实现了对应的 redo callback，其中会将这条日志引用的数据页面读入 buffer pool，然后再根据日志的类型对页面做相应的修改</li></ol><p>以 Heap 类型的 WAL 日志为例。解码完毕后，startup 进程将会调用 <code>heap_redo</code> 函数，再根据日志记录的子类型进入对应的 redo 逻辑，比如 <code>heap_xlog_insert</code>。其中会将这条记录修改的页面读入 buffer pool，然后根据日志中记录的数据 redo 这个 INSERT 操作：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">heap_redo</span><span class="token punctuation">(</span>XLogReaderState <span class="token operator">*</span>record<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint8       info <span class="token operator">=</span> <span class="token function">XLogRecGetInfo</span><span class="token punctuation">(</span>record<span class="token punctuation">)</span> <span class="token operator">&amp;</span> <span class="token operator">~</span>XLR_INFO_MASK<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span>info <span class="token operator">&amp;</span> XLOG_HEAP_OPMASK<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">case</span> XLOG_HEAP_INSERT<span class="token operator">:</span></span>
<span class="line">            <span class="token function">heap_xlog_insert</span><span class="token punctuation">(</span>record<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> XLOG_HEAP_DELETE<span class="token operator">:</span></span>
<span class="line">            <span class="token function">heap_xlog_delete</span><span class="token punctuation">(</span>record<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> XLOG_HEAP_UPDATE<span class="token operator">:</span></span>
<span class="line">            <span class="token function">heap_xlog_update</span><span class="token punctuation">(</span>record<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> XLOG_HEAP_TRUNCATE<span class="token operator">:</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>按照这个逻辑，decode 一条记录就立刻 redo 一条记录，那么完全没有时机去完成页面的预读。因此，decode 和 redo 这两个动作需要解耦：由于 WAL 日志一旦写入就不会被修改了，因此在 decode 一条记录时，可以提前 decode 若干条后续的记录。而每解码完一条记录以后，就可以立刻获知这条记录将会引用到的数据页面，从而使 startup 进程可以立刻发起对这些页面的预读请求，然后回过头来开始 redo 最早解码完毕的记录。在 redo 向后推进的过程中，被发起预读请求的页面会被 OS 异步地读入 page cache 中，从而在真正对这些页面调用 <code>pread</code> 时能够以极低的时延返回。</p><p>Decode 和 redo 的解耦实现在提交 <a href="https://github.com/postgres/postgres/commit/3f1ce973467a0d285961bf2f99b11d06e264e2c1" target="_blank" rel="noopener noreferrer"><code>3f1ce973</code></a> 中：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit 3f1ce973467a0d285961bf2f99b11d06e264e2c1</span>
<span class="line">Author: Thomas Munro &lt;tmunro@postgresql.org&gt;</span>
<span class="line">Date:   Fri Mar 18 17:45:04 2022 +1300</span>
<span class="line"></span>
<span class="line">    Add circular WAL decoding buffer, take II.</span>
<span class="line"></span>
<span class="line">    Teach xlogreader.c to decode the WAL into a circular buffer.  This will</span>
<span class="line">    support optimizations based on looking ahead, to follow in a later</span>
<span class="line">    commit.</span>
<span class="line"></span>
<span class="line">     * XLogReadRecord() works as before, decoding records one by one, and</span>
<span class="line">       allowing them to be examined via the traditional XLogRecGetXXX()</span>
<span class="line">       macros and certain traditional members like xlogreader-&gt;ReadRecPtr.</span>
<span class="line"></span>
<span class="line">     * An alternative new interface XLogReadAhead()/XLogNextRecord() is</span>
<span class="line">       added that returns pointers to DecodedXLogRecord objects so that it&#39;s</span>
<span class="line">       now possible to look ahead in the WAL stream while replaying.</span>
<span class="line"></span>
<span class="line">     * In order to be able to use the new interface effectively while</span>
<span class="line">       streaming data, support is added for the page_read() callback to</span>
<span class="line">       respond to a new nonblocking mode with XLREAD_WOULDBLOCK instead of</span>
<span class="line">       waiting for more data to arrive.</span>
<span class="line"></span>
<span class="line">    No direct user of the new interface is included in this commit, though</span>
<span class="line">    XLogReadRecord() uses it internally.  Existing code doesn&#39;t need to</span>
<span class="line">    change, except in a few places where it was accessing reader internals</span>
<span class="line">    directly and now needs to go through accessor macros.</span>
<span class="line"></span>
<span class="line">    Reviewed-by: Julien Rouhaud &lt;rjuju123@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Tomas Vondra &lt;tomas.vondra@enterprisedb.com&gt;</span>
<span class="line">    Reviewed-by: Andres Freund &lt;andres@anarazel.de&gt; (earlier versions)</span>
<span class="line">    Discussion: https://postgr.es/m/CA+hUKGJ4VJN8ttxScUFM8dOKX0BrBiboo5uz1cq=AovOddfHpA@mail.gmail.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这次提交对用于维护 WAL 日志读取状态的 <code>XLogReaderState</code> 结构体增加了两组控制变量，分别用于维护两个数据结构：</p><ul><li>一段被称为 decode buffer 的连续内存，配合头尾指针作为环形缓冲区使用，用于存放已经被解码后的 WAL 日志记录</li><li>解码后的日志按顺序串连为队列 decode queue，队头是最早解码完毕的日志记录，后续的记录被解码后不断加入队尾</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">XLogReaderState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Buffer for decoded records.  This is a circular buffer, though</span>
<span class="line">     * individual records can&#39;t be split in the middle, so some space is often</span>
<span class="line">     * wasted at the end.  Oversized records that don&#39;t fit in this space are</span>
<span class="line">     * allocated separately.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>decode_buffer<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">size_t</span>      decode_buffer_size<span class="token punctuation">;</span></span>
<span class="line">    bool        free_decode_buffer<span class="token punctuation">;</span> <span class="token comment">/* need to free? */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>decode_buffer_head<span class="token punctuation">;</span> <span class="token comment">/* data is read from the head */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>decode_buffer_tail<span class="token punctuation">;</span> <span class="token comment">/* new data is written at the tail */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Queue of records that have been decoded.  This is a linked list that</span>
<span class="line">     * usually consists of consecutive records in decode_buffer, but may also</span>
<span class="line">     * contain oversized records allocated with palloc().</span>
<span class="line">     */</span></span>
<span class="line">    DecodedXLogRecord <span class="token operator">*</span>decode_queue_head<span class="token punctuation">;</span>   <span class="token comment">/* oldest decoded record */</span></span>
<span class="line">    DecodedXLogRecord <span class="token operator">*</span>decode_queue_tail<span class="token punctuation">;</span>   <span class="token comment">/* newest decoded record */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过函数 <code>XLogReadRecordAlloc</code> 在 decode buffer 中为一条记录分配空间：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Allocate space for a decoded record.  The only member of the returned</span>
<span class="line"> * object that is initialized is the &#39;oversized&#39; flag, indicating that the</span>
<span class="line"> * decoded record wouldn&#39;t fit in the decode buffer and must eventually be</span>
<span class="line"> * freed explicitly.</span>
<span class="line"> *</span>
<span class="line"> * The caller is responsible for adjusting decode_buffer_tail with the real</span>
<span class="line"> * size after successfully decoding a record into this space.  This way, if</span>
<span class="line"> * decoding fails, then there is nothing to undo unless the &#39;oversized&#39; flag</span>
<span class="line"> * was set and pfree() must be called.</span>
<span class="line"> *</span>
<span class="line"> * Return NULL if there is no space in the decode buffer and allow_oversized</span>
<span class="line"> * is false, or if memory allocation fails for an oversized buffer.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> DecodedXLogRecord <span class="token operator">*</span></span>
<span class="line"><span class="token function">XLogReadRecordAlloc</span><span class="token punctuation">(</span>XLogReaderState <span class="token operator">*</span>state<span class="token punctuation">,</span> <span class="token class-name">size_t</span> xl_tot_len<span class="token punctuation">,</span> bool allow_oversized<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">size_t</span>      required_space <span class="token operator">=</span> <span class="token function">DecodeXLogRecordRequiredSpace</span><span class="token punctuation">(</span>xl_tot_len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在函数 <code>XLogDecodeNextRecord</code> 中将记录解码并放入 decode queue 队尾：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> XLogPageReadResult</span>
<span class="line"><span class="token function">XLogDecodeNextRecord</span><span class="token punctuation">(</span>XLogReaderState <span class="token operator">*</span>state<span class="token punctuation">,</span> bool nonblocking<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">DecodeXLogRecord</span><span class="token punctuation">(</span>state<span class="token punctuation">,</span> decoded<span class="token punctuation">,</span> record<span class="token punctuation">,</span> RecPtr<span class="token punctuation">,</span> <span class="token operator">&amp;</span>errormsg<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Record the location of the next record. */</span></span>
<span class="line">        decoded<span class="token operator">-&gt;</span>next_lsn <span class="token operator">=</span> state<span class="token operator">-&gt;</span>NextRecPtr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If it&#39;s in the decode buffer, mark the decode buffer space as</span>
<span class="line">         * occupied.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>decoded<span class="token operator">-&gt;</span>oversized<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* The new decode buffer head must be MAXALIGNed. */</span></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>decoded<span class="token operator">-&gt;</span>size <span class="token operator">==</span> <span class="token function">MAXALIGN</span><span class="token punctuation">(</span>decoded<span class="token operator">-&gt;</span>size<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> decoded <span class="token operator">==</span> state<span class="token operator">-&gt;</span>decode_buffer<span class="token punctuation">)</span></span>
<span class="line">                state<span class="token operator">-&gt;</span>decode_buffer_tail <span class="token operator">=</span> state<span class="token operator">-&gt;</span>decode_buffer <span class="token operator">+</span> decoded<span class="token operator">-&gt;</span>size<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                state<span class="token operator">-&gt;</span>decode_buffer_tail <span class="token operator">+=</span> decoded<span class="token operator">-&gt;</span>size<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Insert it into the queue of decoded records. */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>state<span class="token operator">-&gt;</span>decode_queue_tail <span class="token operator">!=</span> decoded<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>state<span class="token operator">-&gt;</span>decode_queue_tail<span class="token punctuation">)</span></span>
<span class="line">            state<span class="token operator">-&gt;</span>decode_queue_tail<span class="token operator">-&gt;</span>next <span class="token operator">=</span> decoded<span class="token punctuation">;</span></span>
<span class="line">        state<span class="token operator">-&gt;</span>decode_queue_tail <span class="token operator">=</span> decoded<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>state<span class="token operator">-&gt;</span>decode_queue_head<span class="token punctuation">)</span></span>
<span class="line">            state<span class="token operator">-&gt;</span>decode_queue_head <span class="token operator">=</span> decoded<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> XLREAD_SUCCESS<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有了这两组数据结构，decode 和 redo 就可以解耦了：decode queue 中存放着已经被解码完的多条记录，只要 decode buffer 够大，向后多解码一些 WAL 日志记录也不是问题；startup 进程进行 redo 时，只需要从队头不断消费解码完的记录就可以了。</p><p>函数 <code>XLogNextRecord</code> 用于从 decode queue 的队头消费已经解码完的记录：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Attempt to read an XLOG record.</span>
<span class="line"> *</span>
<span class="line"> * XLogBeginRead() or XLogFindNextRecord() and then XLogReadAhead() must be</span>
<span class="line"> * called before the first call to XLogNextRecord().  This functions returns</span>
<span class="line"> * records and errors that were put into an internal queue by XLogReadAhead().</span>
<span class="line"> *</span>
<span class="line"> * On success, a record is returned.</span>
<span class="line"> *</span>
<span class="line"> * The returned record (or *errormsg) points to an internal buffer that&#39;s</span>
<span class="line"> * valid until the next call to XLogNextRecord.</span>
<span class="line"> */</span></span>
<span class="line">DecodedXLogRecord <span class="token operator">*</span></span>
<span class="line"><span class="token function">XLogNextRecord</span><span class="token punctuation">(</span>XLogReaderState <span class="token operator">*</span>state<span class="token punctuation">,</span> <span class="token keyword">char</span> <span class="token operator">*</span><span class="token operator">*</span>errormsg<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Record this as the most recent record returned, so that we&#39;ll release</span>
<span class="line">     * it next time.  This also exposes it to the traditional</span>
<span class="line">     * XLogRecXXX(xlogreader) macros, which work with the decoder rather than</span>
<span class="line">     * the record for historical reasons.</span>
<span class="line">     */</span></span>
<span class="line">    state<span class="token operator">-&gt;</span>record <span class="token operator">=</span> state<span class="token operator">-&gt;</span>decode_queue_head<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Update the pointers to the beginning and one-past-the-end of this</span>
<span class="line">     * record, again for the benefit of historical code that expected the</span>
<span class="line">     * decoder to track this rather than accessing these fields of the record</span>
<span class="line">     * itself.</span>
<span class="line">     */</span></span>
<span class="line">    state<span class="token operator">-&gt;</span>ReadRecPtr <span class="token operator">=</span> state<span class="token operator">-&gt;</span>record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">;</span></span>
<span class="line">    state<span class="token operator">-&gt;</span>EndRecPtr <span class="token operator">=</span> state<span class="token operator">-&gt;</span>record<span class="token operator">-&gt;</span>next_lsn<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token operator">*</span>errormsg <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> state<span class="token operator">-&gt;</span>record<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="预读状态管理" tabindex="-1"><a class="header-anchor" href="#预读状态管理"><span>预读状态管理</span></a></h3><p>有了上述基础设施的支持，接下来可以重点关注如何实现预读了：</p><ol><li>如何维护和管理所有预读请求的状态？</li><li>如何避免侵入原有逻辑太多？</li></ol><p>这些需要解决的问题在提交 <a href="https://github.com/postgres/postgres/commit/5dc0418fab281d017a61a5756240467af982bdfd" target="_blank" rel="noopener noreferrer"><code>5dc0418f</code></a> 中完成了实现：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit 5dc0418fab281d017a61a5756240467af982bdfd</span>
<span class="line">Author: Thomas Munro &lt;tmunro@postgresql.org&gt;</span>
<span class="line">Date:   Thu Apr 7 19:28:40 2022 +1200</span>
<span class="line"></span>
<span class="line">    Prefetch data referenced by the WAL, take II.</span>
<span class="line"></span>
<span class="line">    Introduce a new GUC recovery_prefetch.  When enabled, look ahead in the</span>
<span class="line">    WAL and try to initiate asynchronous reading of referenced data blocks</span>
<span class="line">    that are not yet cached in our buffer pool.  For now, this is done with</span>
<span class="line">    posix_fadvise(), which has several caveats.  Since not all OSes have</span>
<span class="line">    that system call, &quot;try&quot; is provided so that it can be enabled where</span>
<span class="line">    available.  Better mechanisms for asynchronous I/O are possible in later</span>
<span class="line">    work.</span>
<span class="line"></span>
<span class="line">    Set to &quot;try&quot; for now for test coverage.  Default setting to be finalized</span>
<span class="line">    before release.</span>
<span class="line"></span>
<span class="line">    The GUC wal_decode_buffer_size limits the distance we can look ahead in</span>
<span class="line">    bytes of decoded data.</span>
<span class="line"></span>
<span class="line">    The existing GUC maintenance_io_concurrency is used to limit the number</span>
<span class="line">    of concurrent I/Os allowed, based on pessimistic heuristics used to</span>
<span class="line">    infer that I/Os have begun and completed.  We&#39;ll also not look more than</span>
<span class="line">    maintenance_io_concurrency * 4 block references ahead.</span>
<span class="line"></span>
<span class="line">    Reviewed-by: Julien Rouhaud &lt;rjuju123@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Tomas Vondra &lt;tomas.vondra@2ndquadrant.com&gt;</span>
<span class="line">    Reviewed-by: Alvaro Herrera &lt;alvherre@2ndquadrant.com&gt; (earlier version)</span>
<span class="line">    Reviewed-by: Andres Freund &lt;andres@anarazel.de&gt; (earlier version)</span>
<span class="line">    Reviewed-by: Justin Pryzby &lt;pryzby@telsasoft.com&gt; (earlier version)</span>
<span class="line">    Tested-by: Tomas Vondra &lt;tomas.vondra@2ndquadrant.com&gt; (earlier version)</span>
<span class="line">    Tested-by: Jakub Wartak &lt;Jakub.Wartak@tomtom.com&gt; (earlier version)</span>
<span class="line">    Tested-by: Dmitry Dolgov &lt;9erthalion6@gmail.com&gt; (earlier version)</span>
<span class="line">    Tested-by: Sait Talha Nisanci &lt;Sait.Nisanci@microsoft.com&gt; (earlier version)</span>
<span class="line">    Discussion: https://postgr.es/m/CA%2BhUKGJ4VJN8ttxScUFM8dOKX0BrBiboo5uz1cq%3DAovOddfHpA%40mail.gmail.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先，由于所有与 decode 和 redo 相关的状态信息已经记录在结构体 <code>XLogReaderState</code> 中，原有代码也基本需要持有这个状态结构来完成所有动作。因此，PostgreSQL 使用了一个包含 <code>XLogReaderState</code> 结构体的 <code>XLogPrefetcher</code> 结构体来额外记录与预读相关的所有信息。</p><p>为了封装预读的逻辑，原先所有的 <code>XLogReader*</code> 函数接口被全部包装为 <code>XLogPrefetcher*</code>，入参由 <code>XLogReaderState</code> 结构体变为 <code>XLogPrefetcher</code> 结构体。这样设计带来的好处是可以最大程度复用已有的代码：包装后新接口内部的原有代码需要使用 <code>XLogReaderState</code> 的地方，只需要改为使用 <code>XLogPrefetcher</code> 的 <code>-&gt;reader</code> 即可。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * A prefetcher.  This is a mechanism that wraps an XLogReader, prefetching</span>
<span class="line"> * blocks that will be soon be referenced, to try to avoid IO stalls.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">XLogPrefetcher</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* WAL reader and current reading state. */</span></span>
<span class="line">    XLogReaderState <span class="token operator">*</span>reader<span class="token punctuation">;</span></span>
<span class="line">    DecodedXLogRecord <span class="token operator">*</span>record<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         next_block_id<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* IO depth manager. */</span></span>
<span class="line">    LsnReadQueue <span class="token operator">*</span>streaming_read<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预读的状态由 <code>LsnReadQueue</code> 这个核心数据结构管理：</p><ul><li><code>next</code>：发起下一次预读请求的回调函数</li><li><code>lrq_private</code>：持有对预读状态结构 <code>XLogPrefetcher</code> 的指针引用</li><li><code>max_inflight</code>：控制未完成 I/O 的最大数量</li><li><code>inflight</code> / <code>completed</code>：统计进行中或已完成的 I/O 数量</li><li>长度为 <code>size</code> 的定长队列 <code>queue</code>，配合头尾指针 <code>head</code> / <code>tail</code> 实现循环使用；队列中记录每次预读请求对应的 WAL 日志记录序列号 <code>lsn</code> 和是否发出 I/O 请求的标识 <code>io</code>；队尾是最旧的预读请求</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * A simple circular queue of LSNs, using to control the number of</span>
<span class="line"> * (potentially) inflight IOs.  This stands in for a later more general IO</span>
<span class="line"> * control mechanism, which is why it has the apparently unnecessary</span>
<span class="line"> * indirection through a function pointer.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">LsnReadQueue</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LsnReadQueueNextFun next<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>   lrq_private<span class="token punctuation">;</span></span>
<span class="line">    uint32      max_inflight<span class="token punctuation">;</span></span>
<span class="line">    uint32      inflight<span class="token punctuation">;</span></span>
<span class="line">    uint32      completed<span class="token punctuation">;</span></span>
<span class="line">    uint32      head<span class="token punctuation">;</span></span>
<span class="line">    uint32      tail<span class="token punctuation">;</span></span>
<span class="line">    uint32      size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        bool        io<span class="token punctuation">;</span></span>
<span class="line">        XLogRecPtr  lsn<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span>           queue<span class="token punctuation">[</span>FLEXIBLE_ARRAY_MEMBER<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> LsnReadQueue<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="预读触发时机" tabindex="-1"><a class="header-anchor" href="#预读触发时机"><span>预读触发时机</span></a></h3><p>当 startup 进程 redo 完一条 WAL 记录后，与这条记录相关的 I/O 可以被认为已经完成了。此时，从 decode queue 的队头取出下一条解码完的记录进行 redo 之前，就是触发预读的时机。</p><p>首先，获取到当前将要 redo 的记录，把这条记录之前的所有预读请求从预读队列中清除：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * A wrapper for XLogReadRecord() that provides the same interface, but also</span>
<span class="line"> * tries to initiate I/O for blocks referenced in future WAL records.</span>
<span class="line"> */</span></span>
<span class="line">XLogRecord <span class="token operator">*</span></span>
<span class="line"><span class="token function">XLogPrefetcherReadRecord</span><span class="token punctuation">(</span>XLogPrefetcher <span class="token operator">*</span>prefetcher<span class="token punctuation">,</span> <span class="token keyword">char</span> <span class="token operator">*</span><span class="token operator">*</span>errmsg<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Release last returned record, if there is one, as it&#39;s now been</span>
<span class="line">     * replayed.</span>
<span class="line">     */</span></span>
<span class="line">    replayed_up_to <span class="token operator">=</span> <span class="token function">XLogReleasePreviousRecord</span><span class="token punctuation">(</span>prefetcher<span class="token operator">-&gt;</span>reader<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * All IO initiated by earlier WAL is now completed.  This might trigger</span>
<span class="line">     * further prefetching.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">lrq_complete_lsn</span><span class="token punctuation">(</span>prefetcher<span class="token operator">-&gt;</span>streaming_read<span class="token punctuation">,</span> replayed_up_to<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Read the next record. */</span></span>
<span class="line">    record <span class="token operator">=</span> <span class="token function">XLogNextRecord</span><span class="token punctuation">(</span>prefetcher<span class="token operator">-&gt;</span>reader<span class="token punctuation">,</span> errmsg<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>清除的具体方法是从预读队列的队尾开始，删除对应 WAL 日志记录的 LSN 小于当前 redo LSN 的所有请求。然后从上次发起预读请求的位置开始，发起更多预读请求，尽量填满预读队列：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">lrq_complete_lsn</span><span class="token punctuation">(</span>LsnReadQueue <span class="token operator">*</span>lrq<span class="token punctuation">,</span> XLogRecPtr lsn<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We know that LSNs before &#39;lsn&#39; have been replayed, so we can now assume</span>
<span class="line">     * that any IOs that were started before then have finished.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>tail <span class="token operator">!=</span> lrq<span class="token operator">-&gt;</span>head <span class="token operator">&amp;&amp;</span></span>
<span class="line">           lrq<span class="token operator">-&gt;</span>queue<span class="token punctuation">[</span>lrq<span class="token operator">-&gt;</span>tail<span class="token punctuation">]</span><span class="token punctuation">.</span>lsn <span class="token operator">&lt;</span> lsn<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>queue<span class="token punctuation">[</span>lrq<span class="token operator">-&gt;</span>tail<span class="token punctuation">]</span><span class="token punctuation">.</span>io<span class="token punctuation">)</span></span>
<span class="line">            lrq<span class="token operator">-&gt;</span>inflight<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            lrq<span class="token operator">-&gt;</span>completed<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line">        lrq<span class="token operator">-&gt;</span>tail<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>tail <span class="token operator">==</span> lrq<span class="token operator">-&gt;</span>size<span class="token punctuation">)</span></span>
<span class="line">            lrq<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">RecoveryPrefetchEnabled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">lrq_prefetch</span><span class="token punctuation">(</span>lrq<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发起更多预读请求的方式是回调 <code>LsnReadQueue</code> 的 <code>next</code> 函数。该函数可能返回三种结果，需要根据返回值记录每一个请求的不同状态：</p><ul><li><code>LRQ_NEXT_AGAIN</code>：暂无更多 WAL 日志可以解析，因此对队列无操作，直接返回</li><li><code>LRQ_NEXT_IO</code>：已经发起 I/O 请求，将该请求标识为 <code>inflight</code> 并放入队列头部</li><li><code>LRQ_NEXT_NO_IO</code>：对应页面无需预读，将该请求标识为 <code>completed</code> 并放入队列头部</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">lrq_prefetch</span><span class="token punctuation">(</span>LsnReadQueue <span class="token operator">*</span>lrq<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Try to start as many IOs as we can within our limits. */</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>inflight <span class="token operator">&lt;</span> lrq<span class="token operator">-&gt;</span>max_inflight <span class="token operator">&amp;&amp;</span></span>
<span class="line">           lrq<span class="token operator">-&gt;</span>inflight <span class="token operator">+</span> lrq<span class="token operator">-&gt;</span>completed <span class="token operator">&lt;</span> lrq<span class="token operator">-&gt;</span>size <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>head <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">%</span> lrq<span class="token operator">-&gt;</span>size<span class="token punctuation">)</span> <span class="token operator">!=</span> lrq<span class="token operator">-&gt;</span>tail<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span><span class="token function">next</span><span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>lrq_private<span class="token punctuation">,</span> <span class="token operator">&amp;</span>lrq<span class="token operator">-&gt;</span>queue<span class="token punctuation">[</span>lrq<span class="token operator">-&gt;</span>head<span class="token punctuation">]</span><span class="token punctuation">.</span>lsn<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">case</span> LRQ_NEXT_AGAIN<span class="token operator">:</span></span>
<span class="line">                <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">case</span> LRQ_NEXT_IO<span class="token operator">:</span></span>
<span class="line">                lrq<span class="token operator">-&gt;</span>queue<span class="token punctuation">[</span>lrq<span class="token operator">-&gt;</span>head<span class="token punctuation">]</span><span class="token punctuation">.</span>io <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">                lrq<span class="token operator">-&gt;</span>inflight<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">case</span> LRQ_NEXT_NO_IO<span class="token operator">:</span></span>
<span class="line">                lrq<span class="token operator">-&gt;</span>queue<span class="token punctuation">[</span>lrq<span class="token operator">-&gt;</span>head<span class="token punctuation">]</span><span class="token punctuation">.</span>io <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">                lrq<span class="token operator">-&gt;</span>completed<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        lrq<span class="token operator">-&gt;</span>head<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>lrq<span class="token operator">-&gt;</span>head <span class="token operator">==</span> lrq<span class="token operator">-&gt;</span>size<span class="token punctuation">)</span></span>
<span class="line">            lrq<span class="token operator">-&gt;</span>head <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * A callback that examines the next block reference in the WAL, and possibly</span>
<span class="line"> * starts an IO so that a later read will be fast.</span>
<span class="line"> *</span>
<span class="line"> * Returns LRQ_NEXT_AGAIN if no more WAL data is available yet.</span>
<span class="line"> *</span>
<span class="line"> * Returns LRQ_NEXT_IO if the next block reference is for a main fork block</span>
<span class="line"> * that isn&#39;t in the buffer pool, and the kernel has been asked to start</span>
<span class="line"> * reading it to make a future read system call faster. An LSN is written to</span>
<span class="line"> * *lsn, and the I/O will be considered to have completed once that LSN is</span>
<span class="line"> * replayed.</span>
<span class="line"> *</span>
<span class="line"> * Returns LRQ_NEXT_NO_IO if we examined the next block reference and found</span>
<span class="line"> * that it was already in the buffer pool, or we decided for various reasons</span>
<span class="line"> * not to prefetch.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> LsnReadQueueNextStatus</span>
<span class="line"><span class="token function">XLogPrefetcherNextBlock</span><span class="token punctuation">(</span><span class="token class-name">uintptr_t</span> pgsr_private<span class="token punctuation">,</span> XLogRecPtr <span class="token operator">*</span>lsn<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="预读条件" tabindex="-1"><a class="header-anchor" href="#预读条件"><span>预读条件</span></a></h3><p>上述函数控制了何时触发预读。而对于某一个页面是否需要被预读的决策，实现在函数 <code>XLogPrefetcherNextBlock</code> 中。并不是所有的页面都可以或需要被预读，在 <code>XLogPrefetcher</code> 结构中维护了以下几个结构来对预读请求进行过滤：</p><ul><li><code>filter_table</code> / <code>filter_queue</code>：动态过滤条件，记录了 redo 到某个 LSN 之前，不要预读某个物理文件中大于一定长度的所有页面；因为在 redo 到某条记录之前，对应的页面在存储上可能暂时还不存在，因而无法预读</li><li><code>recent_rlocator</code> / <code>recent_block</code> / <code>recent_idx</code>：记录了最近已经发起的预读请求，被维护为环形缓冲区，可以避免对同一个页面重复发起预读请求</li><li><code>no_readahead_until</code>：对某些类型的日志，在这条记录之前都不再需要预读了</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">XLogPrefetcher</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Book-keeping to avoid accessing blocks that don&#39;t exist yet. */</span></span>
<span class="line">    HTAB       <span class="token operator">*</span>filter_table<span class="token punctuation">;</span></span>
<span class="line">    dlist_head  filter_queue<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Book-keeping to avoid repeat prefetches. */</span></span>
<span class="line">    RelFileLocator recent_rlocator<span class="token punctuation">[</span>XLOGPREFETCHER_SEQ_WINDOW_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    BlockNumber recent_block<span class="token punctuation">[</span>XLOGPREFETCHER_SEQ_WINDOW_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         recent_idx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Book-keeping to disable prefetching temporarily. */</span></span>
<span class="line">    XLogRecPtr  no_readahead_until<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先，对部分 WAL 日志类型构造一些动态过滤条件。比如，对于创建数据库、创建表的日志记录，在这些记录被 redo 之前，相应的文件都不存在，因此无法预读。所以在 redo 到这条记录的 LSN 之前，直接跳过对相关物理文件的预读：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Check for operations that require us to filter out block ranges, or</span>
<span class="line"> * pause readahead completely.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>replaying_lsn <span class="token operator">&lt;</span> record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint8       rmid <span class="token operator">=</span> record<span class="token operator">-&gt;</span>header<span class="token punctuation">.</span>xl_rmid<span class="token punctuation">;</span></span>
<span class="line">    uint8       record_type <span class="token operator">=</span> record<span class="token operator">-&gt;</span>header<span class="token punctuation">.</span>xl_info <span class="token operator">&amp;</span> <span class="token operator">~</span>XLR_INFO_MASK<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rmid <span class="token operator">==</span> RM_XLOG_ID<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>record_type <span class="token operator">==</span> XLOG_CHECKPOINT_SHUTDOWN <span class="token operator">||</span></span>
<span class="line">            record_type <span class="token operator">==</span> XLOG_END_OF_RECOVERY<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * These records might change the TLI.  Avoid potential</span>
<span class="line">             * bugs if we were to allow &quot;read TLI&quot; and &quot;replay TLI&quot; to</span>
<span class="line">             * differ without more analysis.</span>
<span class="line">             */</span></span>
<span class="line">            prefetcher<span class="token operator">-&gt;</span>no_readahead_until <span class="token operator">=</span> record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* Fall through so we move past this record. */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rmid <span class="token operator">==</span> RM_DBASE_ID<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * When databases are created with the file-copy strategy,</span>
<span class="line">         * there are no WAL records to tell us about the creation of</span>
<span class="line">         * individual relations.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>record_type <span class="token operator">==</span> XLOG_DBASE_CREATE_FILE_COPY<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            xl_dbase_create_file_copy_rec <span class="token operator">*</span>xlrec <span class="token operator">=</span></span>
<span class="line">                <span class="token punctuation">(</span>xl_dbase_create_file_copy_rec <span class="token operator">*</span><span class="token punctuation">)</span> record<span class="token operator">-&gt;</span>main_data<span class="token punctuation">;</span></span>
<span class="line">            RelFileLocator rlocator <span class="token operator">=</span></span>
<span class="line">            <span class="token punctuation">{</span>InvalidOid<span class="token punctuation">,</span> xlrec<span class="token operator">-&gt;</span>db_id<span class="token punctuation">,</span> InvalidRelFileNumber<span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Don&#39;t try to prefetch anything in this database until</span>
<span class="line">             * it has been created, or we might confuse the blocks of</span>
<span class="line">             * different generations, if a database OID or</span>
<span class="line">             * relfilenumber is reused.  It&#39;s also more efficient than</span>
<span class="line">             * discovering that relations don&#39;t exist on disk yet with</span>
<span class="line">             * ENOENT errors.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">XLogPrefetcherAddFilter</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> rlocator<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rmid <span class="token operator">==</span> RM_SMGR_ID<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>record_type <span class="token operator">==</span> XLOG_SMGR_CREATE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            xl_smgr_create <span class="token operator">*</span>xlrec <span class="token operator">=</span> <span class="token punctuation">(</span>xl_smgr_create <span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">                record<span class="token operator">-&gt;</span>main_data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>xlrec<span class="token operator">-&gt;</span>forkNum <span class="token operator">==</span> MAIN_FORKNUM<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Don&#39;t prefetch anything for this whole relation</span>
<span class="line">                 * until it has been created.  Otherwise we might</span>
<span class="line">                 * confuse the blocks of different generations, if a</span>
<span class="line">                 * relfilenumber is reused.  This also avoids the need</span>
<span class="line">                 * to discover the problem via extra syscalls that</span>
<span class="line">                 * report ENOENT.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token function">XLogPrefetcherAddFilter</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> xlrec<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                        record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>record_type <span class="token operator">==</span> XLOG_SMGR_TRUNCATE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            xl_smgr_truncate <span class="token operator">*</span>xlrec <span class="token operator">=</span> <span class="token punctuation">(</span>xl_smgr_truncate <span class="token operator">*</span><span class="token punctuation">)</span></span>
<span class="line">                record<span class="token operator">-&gt;</span>main_data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Don&#39;t consider prefetching anything in the truncated</span>
<span class="line">             * range until the truncation has been performed.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">XLogPrefetcherAddFilter</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> xlrec<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span></span>
<span class="line">                                    xlrec<span class="token operator">-&gt;</span>blkno<span class="token punctuation">,</span></span>
<span class="line">                                    record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后从还未进行预读的下一个页面开始继续处理。</p><p>跳过预读非 <a href="https://www.postgresql.org/docs/current/storage.html" target="_blank" rel="noopener noreferrer">main fork</a> 的页面，因为 WAL 日志中绝大部分修改都是基于 main fork 的，其余部分 fork 甚至不记录 WAL 日志：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* We don&#39;t try to prefetch anything but the main fork for now. */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>forknum <span class="token operator">!=</span> MAIN_FORKNUM<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>跳过预读 FPI (full page image) 类型的日志对应的页面，因为日志中已经有完整的页面内容了，无需再读数据页面：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * If there is a full page image attached, we won&#39;t be reading the</span>
<span class="line"> * page, so don&#39;t bother trying to prefetch.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>has_image<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_fpw<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>跳过预读将会被抹零的页面：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* There is no point in reading a page that will be zeroed. */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>flags <span class="token operator">&amp;</span> BKPBLOCK_WILL_INIT<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_init<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>跳过预读符合上述动态过滤条件的页面：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Should we skip prefetching this block due to a filter? */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">XLogPrefetcherIsFiltered</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>blkno<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_new<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>跳过最近已经发起预读的页面，避免重复预读；并将当前页面记录为最近已预读：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* There is no point in repeatedly prefetching the same block. */</span></span>
<span class="line"><span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> XLOGPREFETCHER_SEQ_WINDOW_SIZE<span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>blkno <span class="token operator">==</span> prefetcher<span class="token operator">-&gt;</span>recent_block<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">        <span class="token function">RelFileLocatorEquals</span><span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> prefetcher<span class="token operator">-&gt;</span>recent_rlocator<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * XXX If we also remembered where it was, we could set</span>
<span class="line">         * recent_buffer so that recovery could skip smgropen()</span>
<span class="line">         * and a buffer table lookup.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_rep<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line">prefetcher<span class="token operator">-&gt;</span>recent_rlocator<span class="token punctuation">[</span>prefetcher<span class="token operator">-&gt;</span>recent_idx<span class="token punctuation">]</span> <span class="token operator">=</span> block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">;</span></span>
<span class="line">prefetcher<span class="token operator">-&gt;</span>recent_block<span class="token punctuation">[</span>prefetcher<span class="token operator">-&gt;</span>recent_idx<span class="token punctuation">]</span> <span class="token operator">=</span> block<span class="token operator">-&gt;</span>blkno<span class="token punctuation">;</span></span>
<span class="line">prefetcher<span class="token operator">-&gt;</span>recent_idx <span class="token operator">=</span></span>
<span class="line">    <span class="token punctuation">(</span>prefetcher<span class="token operator">-&gt;</span>recent_idx <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">%</span> XLOGPREFETCHER_SEQ_WINDOW_SIZE<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时，开始通过存储管理层接口试图打开物理文件。如果物理文件不存在，也直接跳过预读，然后把这个物理文件加入到动态过滤条件中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * We could try to have a fast path for repeated references to the</span>
<span class="line"> * same relation (with some scheme to handle invalidations</span>
<span class="line"> * safely), but for now we&#39;ll call smgropen() every time.</span>
<span class="line"> */</span></span>
<span class="line">reln <span class="token operator">=</span> <span class="token function">smgropen</span><span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> INVALID_PROC_NUMBER<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * If the relation file doesn&#39;t exist on disk, for example because</span>
<span class="line"> * we&#39;re replaying after a crash and the file will be created and</span>
<span class="line"> * then unlinked by WAL that hasn&#39;t been replayed yet, suppress</span>
<span class="line"> * further prefetching in the relation until this record is</span>
<span class="line"> * replayed.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">smgrexists</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> MAIN_FORKNUM<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">XLogPrefetcherAddFilter</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                            record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_new<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果要预读的页面超过了当前文件的最大长度，也跳过预读：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * If the relation isn&#39;t big enough to contain the referenced</span>
<span class="line"> * block yet, suppress prefetching of this block and higher until</span>
<span class="line"> * this record is replayed.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>block<span class="token operator">-&gt;</span>blkno <span class="token operator">&gt;=</span> <span class="token function">smgrnblocks</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>forknum<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">XLogPrefetcherAddFilter</span><span class="token punctuation">(</span>prefetcher<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>rlocator<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>blkno<span class="token punctuation">,</span></span>
<span class="line">                            record<span class="token operator">-&gt;</span>lsn<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>skip_new<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最终，如果上述条件全都满足，则调用 <code>PrefetchSharedBuffer</code> 预读：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Try to initiate prefetching. */</span></span>
<span class="line">result <span class="token operator">=</span> <span class="token function">PrefetchSharedBuffer</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>forknum<span class="token punctuation">,</span> block<span class="token operator">-&gt;</span>blkno<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">BufferIsValid</span><span class="token punctuation">(</span>result<span class="token punctuation">.</span>recent_buffer<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Cache hit, nothing to do. */</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>hit<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    block<span class="token operator">-&gt;</span>prefetch_buffer <span class="token operator">=</span> result<span class="token punctuation">.</span>recent_buffer<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_NO_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>result<span class="token punctuation">.</span>initiated_io<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Cache miss, I/O (presumably) started. */</span></span>
<span class="line">    <span class="token function">XLogPrefetchIncrement</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>SharedStats<span class="token operator">-&gt;</span>prefetch<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    block<span class="token operator">-&gt;</span>prefetch_buffer <span class="token operator">=</span> InvalidBuffer<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> LRQ_NEXT_IO<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中会根据 WAL 日志记录引用的物理文件编号和页面号构造 buffer tag，然后通过 buffer mapping 查询页面是否已经在 buffer pool 中。如果不存在，则调用存储管理层接口 <code>smgrprefetch</code> 发起预读：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Implementation of PrefetchBuffer() for shared buffers.</span>
<span class="line"> */</span></span>
<span class="line">PrefetchBufferResult</span>
<span class="line"><span class="token function">PrefetchSharedBuffer</span><span class="token punctuation">(</span>SMgrRelation smgr_reln<span class="token punctuation">,</span></span>
<span class="line">                     ForkNumber forkNum<span class="token punctuation">,</span></span>
<span class="line">                     BlockNumber blockNum<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PrefetchBufferResult result <span class="token operator">=</span> <span class="token punctuation">{</span>InvalidBuffer<span class="token punctuation">,</span> false<span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line">    BufferTag   newTag<span class="token punctuation">;</span>         <span class="token comment">/* identity of requested block */</span></span>
<span class="line">    uint32      newHash<span class="token punctuation">;</span>        <span class="token comment">/* hash value for newTag */</span></span>
<span class="line">    LWLock     <span class="token operator">*</span>newPartitionLock<span class="token punctuation">;</span>   <span class="token comment">/* buffer partition lock for it */</span></span>
<span class="line">    <span class="token keyword">int</span>         buf_id<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">BlockNumberIsValid</span><span class="token punctuation">(</span>blockNum<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* create a tag so we can lookup the buffer */</span></span>
<span class="line">    <span class="token function">InitBufferTag</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>newTag<span class="token punctuation">,</span> <span class="token operator">&amp;</span>smgr_reln<span class="token operator">-&gt;</span>smgr_rlocator<span class="token punctuation">.</span>locator<span class="token punctuation">,</span></span>
<span class="line">                  forkNum<span class="token punctuation">,</span> blockNum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* determine its hash code and partition lock ID */</span></span>
<span class="line">    newHash <span class="token operator">=</span> <span class="token function">BufTableHashCode</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>newTag<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    newPartitionLock <span class="token operator">=</span> <span class="token function">BufMappingPartitionLock</span><span class="token punctuation">(</span>newHash<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* see if the block is in the buffer pool already */</span></span>
<span class="line">    <span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>newPartitionLock<span class="token punctuation">,</span> LW_SHARED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    buf_id <span class="token operator">=</span> <span class="token function">BufTableLookup</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>newTag<span class="token punctuation">,</span> newHash<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">LWLockRelease</span><span class="token punctuation">(</span>newPartitionLock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* If not in buffers, initiate prefetch */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>buf_id <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">USE_PREFETCH</span></span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Try to initiate an asynchronous read.  This returns false in</span>
<span class="line">         * recovery if the relation file doesn&#39;t exist.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>io_direct_flags <span class="token operator">&amp;</span> IO_DIRECT_DATA<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token function">smgrprefetch</span><span class="token punctuation">(</span>smgr_reln<span class="token punctuation">,</span> forkNum<span class="token punctuation">,</span> blockNum<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            result<span class="token punctuation">.</span>initiated_io <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span>                          <span class="token comment">/* USE_PREFETCH */</span></span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Report the buffer it was in at that time.  The caller may be able</span>
<span class="line">         * to avoid a buffer table lookup, but it&#39;s not pinned and it must be</span>
<span class="line">         * rechecked!</span>
<span class="line">         */</span></span>
<span class="line">        result<span class="token punctuation">.</span>recent_buffer <span class="token operator">=</span> buf_id <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If the block *is* in buffers, we do nothing.  This is not really ideal:</span>
<span class="line">     * the block might be just about to be evicted, which would be stupid</span>
<span class="line">     * since we know we are going to need it soon.  But the only easy answer</span>
<span class="line">     * is to bump the usage_count, which does not seem like a great solution:</span>
<span class="line">     * when the caller does ultimately touch the block, usage_count would get</span>
<span class="line">     * bumped again, resulting in too much favoritism for blocks that are</span>
<span class="line">     * involved in a prefetch sequence. A real fix would involve some</span>
<span class="line">     * additional per-buffer state, and it&#39;s not clear that there&#39;s enough of</span>
<span class="line">     * a problem to justify that.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>存储管理层接口最终将预读请求封装为 <code>posix_fadvise</code> 调用并发送出去。向 OS 提供的建议是 <code>POSIX_FADV_WILLNEED</code>，表示这个页面在不久的将来即将被使用。在 startup 进程 redo 早些时候的 WAL 日志记录时，OS 可以在后台提前将这些页面装入 page cache 中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * FilePrefetch - initiate asynchronous read of a given range of the file.</span>
<span class="line"> *</span>
<span class="line"> * Currently the only implementation of this function is using posix_fadvise</span>
<span class="line"> * which is the simplest standardized interface that accomplishes this.</span>
<span class="line"> * We could add an implementation using libaio in the future; but note that</span>
<span class="line"> * this API is inappropriate for libaio, which wants to have a buffer provided</span>
<span class="line"> * to read into.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">int</span></span>
<span class="line"><span class="token function">FilePrefetch</span><span class="token punctuation">(</span>File file<span class="token punctuation">,</span> <span class="token class-name">off_t</span> offset<span class="token punctuation">,</span> <span class="token class-name">off_t</span> amount<span class="token punctuation">,</span> uint32 wait_event_info<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token function">defined</span><span class="token punctuation">(</span>USE_POSIX_FADVISE<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token function">defined</span><span class="token punctuation">(</span>POSIX_FADV_WILLNEED<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">int</span>         returnCode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">FileIsValid</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;FilePrefetch: %d (%s) &quot;</span> INT64_FORMAT <span class="token string">&quot; &quot;</span> INT64_FORMAT<span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">,</span></span>
<span class="line">               <span class="token punctuation">(</span>int64<span class="token punctuation">)</span> offset<span class="token punctuation">,</span> <span class="token punctuation">(</span>int64<span class="token punctuation">)</span> amount<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    returnCode <span class="token operator">=</span> <span class="token function">FileAccess</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>returnCode <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> returnCode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">retry<span class="token operator">:</span></span>
<span class="line">    <span class="token function">pgstat_report_wait_start</span><span class="token punctuation">(</span>wait_event_info<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    returnCode <span class="token operator">=</span> <span class="token function">posix_fadvise</span><span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fd<span class="token punctuation">,</span> offset<span class="token punctuation">,</span> amount<span class="token punctuation">,</span></span>
<span class="line">                               POSIX_FADV_WILLNEED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">pgstat_report_wait_end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>returnCode <span class="token operator">==</span> EINTR<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">goto</span> retry<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> returnCode<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">else</span></span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">FileIsValid</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><p><a href="https://www.postgresql.org/docs/current/wal.html" target="_blank" rel="noopener noreferrer">PostgreSQL Documentation: Chapter 28. Reliability and the Write-Ahead Log</a></p><p><a href="https://www.postgresql.org/message-id/flat/CA%2BhUKGJ4VJN8ttxScUFM8dOKX0BrBiboo5uz1cq%3DAovOddfHpA%40mail.gmail.com" target="_blank" rel="noopener noreferrer">WIP: WAL prefetch (another approach)</a></p>`,81)]))}const o=s(l,[["render",i],["__file","PostgreSQL WAL Prefetch.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20WAL%20Prefetch.html","title":"PostgreSQL - WAL Prefetch","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"实现思路","slug":"实现思路","link":"#实现思路","children":[{"level":3,"title":"Decode 和 Redo 解耦","slug":"decode-和-redo-解耦","link":"#decode-和-redo-解耦","children":[]},{"level":3,"title":"预读状态管理","slug":"预读状态管理","link":"#预读状态管理","children":[]},{"level":3,"title":"预读触发时机","slug":"预读触发时机","link":"#预读触发时机","children":[]},{"level":3,"title":"预读条件","slug":"预读条件","link":"#预读条件","children":[]}]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL WAL Prefetch.md"}');export{o as comp,r as data};
