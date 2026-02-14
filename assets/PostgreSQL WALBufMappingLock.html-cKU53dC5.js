import{_ as i,c as l,b as s,f as a,d as p,e as t,a as c,r as o,o as d}from"./app-BeHGwf2X.js";const r={};function u(v,n){const e=o("RouteLink");return d(),l("div",null,[n[3]||(n[3]=s("h1",{id:"postgresql-walbufmappinglock",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#postgresql-walbufmappinglock"},[s("span",null,"PostgreSQL - WALBufMappingLock")])],-1)),n[4]||(n[4]=s("p",null,"Created by: Mr Dk.",-1)),n[5]||(n[5]=s("p",null,"2025 / 08 / 09 20:19",-1)),n[6]||(n[6]=s("p",null,"Hangzhou, Zhejiang, China",-1)),n[7]||(n[7]=s("hr",null,null,-1)),n[8]||(n[8]=s("h2",{id:"背景",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#背景"},[s("span",null,"背景")])],-1)),s("p",null,[n[1]||(n[1]=a("在 ")),p(e,{to:"/notes/PostgreSQL/PostgreSQL%20WAL%20Insert.html"},{default:t(()=>n[0]||(n[0]=[a("PostgreSQL - WAL Insert")])),_:1}),n[2]||(n[2]=a(" 中已经分析过，当多个进程想要并发记录 WAL 日志时，需要先串行地在 WAL 日志中分配预留空间，然后再各自获取 WALInsertLock 并发地将 WAL 日志拷贝到预留空间所对应的 WAL Buffer 中。在进行拷贝之前，如果 WAL Buffer 对应空间中的被替换页面还没来得及写入存储，则需要获取 WALWriteLock 将日志写到存储，然后获取 WALBufMappingLock 将这个页面重新初始化，才能开始使用。"))]),n[9]||(n[9]=c(`<p>在写入较重的场景中，特别是数据导入场景，一条内容密集的 WAL 日志可能会横跨多个 WAL 日志页面。以索引创建为例，一条未被压缩的 XLOG FPI 日志达到了 229 kB；即使设置 <code>wal_compression</code> 使用 ZSTD 压缩算法，也能够达到 61 kB：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">=&gt; SELECT * FROM pg_get_wal_record_info(&#39;1/0C15A768&#39;);</span>
<span class="line">start_lsn        | 1/C15A768</span>
<span class="line">end_lsn          | 1/C193FE0</span>
<span class="line">prev_lsn         | 1/C120868</span>
<span class="line">xid              | 762</span>
<span class="line">resource_manager | XLOG</span>
<span class="line">record_type      | FPI</span>
<span class="line">record_length    | 234964</span>
<span class="line">main_data_length | 0</span>
<span class="line">fpi_length       | 234512</span>
<span class="line">description      |</span>
<span class="line">block_ref        | blkref #0: rel 1663/5/16400 fork main blk 27080 (FPW); hole: offset: 1164, length: 2460 blkref #1: ...</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>显然，这样的日志将会占据多个 WAL Buffer 页面。WALBufMappingLock 是一个全局互斥锁，同一时间只有一个进程可以持有该锁，修改 WAL Buffer 页面所映射到的 WAL 日志物理页面。当多个进程需要同时初始化相互独立的 WAL Buffer 页面时，将因为这个互斥锁的存在而互相等待。这实际上并没有必要，多个进程可以并发初始化不同的 WAL Buffer 页面。虽然 WAL Writer 进程会在后台异步地提前初始化页面，尽量避免 Backend 进程在 critical path 上进行初始化。但在重度写入场景中，WAL Writer 也只能尽力而为，Backend 进程将会不可避免地加入竞争。</p><p>即将发布的 PostgreSQL 18 对 WAL Buffer 的页面初始化进行了无锁化改造，通过原子变量和条件变量在 WAL Buffer 中限制出了一段可以被多个进程并发初始化的区域，从而彻底移除了 WALBufMappingLock。相关提交为：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit bc22dc0e0ddc2dcb6043a732415019cc6b6bf683</span>
<span class="line">Author: Alexander Korotkov &lt;akorotkov@postgresql.org&gt;</span>
<span class="line">Date:   Wed Apr 2 12:44:24 2025 +0300</span>
<span class="line"></span>
<span class="line">    Get rid of WALBufMappingLock</span>
<span class="line"></span>
<span class="line">    Allow multiple backends to initialize WAL buffers concurrently.  This way</span>
<span class="line">    \`MemSet((char *) NewPage, 0, XLOG_BLCKSZ);\` can run in parallel without</span>
<span class="line">    taking a single LWLock in exclusive mode.</span>
<span class="line"></span>
<span class="line">    The new algorithm works as follows:</span>
<span class="line">     * reserve a page for initialization using XLogCtl-&gt;InitializeReserved,</span>
<span class="line">     * ensure the page is written out,</span>
<span class="line">     * once the page is initialized, try to advance XLogCtl-&gt;InitializedUpTo and</span>
<span class="line">       signal to waiters using XLogCtl-&gt;InitializedUpToCondVar condition</span>
<span class="line">       variable,</span>
<span class="line">     * repeat previous steps until we reserve initialization up to the target</span>
<span class="line">       WAL position,</span>
<span class="line">     * wait until concurrent initialization finishes using a</span>
<span class="line">       XLogCtl-&gt;InitializedUpToCondVar.</span>
<span class="line"></span>
<span class="line">    Now, multiple backends can, in parallel, concurrently reserve pages,</span>
<span class="line">    initialize them, and advance XLogCtl-&gt;InitializedUpTo to point to the latest</span>
<span class="line">    initialized page.</span>
<span class="line"></span>
<span class="line">    Author: Yura Sokolov &lt;y.sokolov@postgrespro.ru&gt;</span>
<span class="line">    Co-authored-by: Alexander Korotkov &lt;aekorotkov@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Pavel Borisov &lt;pashkin.elfe@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Tomas Vondra &lt;tomas@vondra.me&gt;</span>
<span class="line">    Tested-by: Michael Paquier &lt;michael@paquier.xyz&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本文基于这次 commit 分析如何实现 WAL Buffer 的并发初始化。</p><h2 id="wal-buffer-控制结构修改" tabindex="-1"><a class="header-anchor" href="#wal-buffer-控制结构修改"><span>WAL Buffer 控制结构修改</span></a></h2><p>在 PostgreSQL 17 及之前的版本中，WAL Buffer 共享内存控制结构中的 <code>InitializedUpTo</code> 保存了已经初始化完毕的最后一个 WAL 日志页面的结尾 LSN + 1，实际上也就是下一个将要被初始化的 WAL 日志页面的起始 LSN。后续成功竞争到 WALBufMappingLock 的进程将在这把锁的保护下重新初始化页面内容，并修改页面对应的 <code>xlblocks</code> 改变页面与物理空间的映射关系，然后向前推进 <code>InitializedUpTo</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Total shared-memory state for XLOG.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">XLogCtlData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Latest initialized page in the cache (last byte position + 1).</span>
<span class="line">     *</span>
<span class="line">     * To change the identity of a buffer (and InitializedUpTo), you need to</span>
<span class="line">     * hold WALBufMappingLock.  To change the identity of a buffer that&#39;s</span>
<span class="line">     * still dirty, the old page needs to be written out first, and for that</span>
<span class="line">     * you need WALWriteLock, and you need to ensure that there are no</span>
<span class="line">     * in-progress insertions to the page by calling</span>
<span class="line">     * WaitXLogInsertionsToFinish().</span>
<span class="line">     */</span></span>
<span class="line">    XLogRecPtr  InitializedUpTo<span class="token punctuation">;</span></span>
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
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如图所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">     initializing</span>
<span class="line">        |&lt;-&gt;|</span>
<span class="line">+---+---+---+---+---+---+---+------+</span>
<span class="line">| 0 | 0 |///| x | x | x |   |      |</span>
<span class="line">+---+---+---+---+---+---+---+------+</span>
<span class="line">        ^</span>
<span class="line">        |</span>
<span class="line">        InitializedUpTo</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>自 PostgreSQL 18 起，引入另一个 <code>InitializeReserved</code> 变量并将这两个变量同时修改为原子变量，以便多进程能够无锁修改。此外，通过条件变量 <code>InitializedUpToCondVar</code> 约束正在进行初始化的页面区间：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Total shared-memory state for XLOG.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">XLogCtlData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Latest reserved for inititalization page in the cache (last byte</span>
<span class="line">     * position + 1).</span>
<span class="line">     *</span>
<span class="line">     * To change the identity of a buffer, you need to advance</span>
<span class="line">     * InitializeReserved first.  To change the identity of a buffer that&#39;s</span>
<span class="line">     * still dirty, the old page needs to be written out first, and for that</span>
<span class="line">     * you need WALWriteLock, and you need to ensure that there are no</span>
<span class="line">     * in-progress insertions to the page by calling</span>
<span class="line">     * WaitXLogInsertionsToFinish().</span>
<span class="line">     */</span></span>
<span class="line">    pg_atomic_uint64 InitializeReserved<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Latest initialized page in the cache (last byte position + 1).</span>
<span class="line">     *</span>
<span class="line">     * InitializedUpTo is updated after the buffer initialization.  After</span>
<span class="line">     * update, waiters got notification using InitializedUpToCondVar.</span>
<span class="line">     */</span></span>
<span class="line">    pg_atomic_uint64 InitializedUpTo<span class="token punctuation">;</span></span>
<span class="line">    ConditionVariable InitializedUpToCondVar<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span> XLogCtlData<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>InitializeReserved</code> 指向已经开始初始化的最新页面的结束地址，与 <code>InitializedUpTo</code> 形成了一段 <em>正在初始化</em> 的 WAL Buffer 页面区间，多个进程可以在这个区间中对页面进行并发 <code>memset</code> 清零以及页面映射关系修改。如图所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">              initializing</span>
<span class="line">        |&lt;---------------------&gt;|</span>
<span class="line">+---+---+---+---+---+---+---+---+---+------+</span>
<span class="line">| 0 | 0 |///|\\\\\\|\\\\\\|///|\\\\\\|///|   |      |</span>
<span class="line">+---+---+---+---+---+---+---+---+---+------+</span>
<span class="line">        ^                       ^</span>
<span class="line">        |                       |</span>
<span class="line">        InitializedUpTo         InitializeReserved</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="无锁算法" tabindex="-1"><a class="header-anchor" href="#无锁算法"><span>无锁算法</span></a></h2><p>对 WAL Buffer 页面进行初始化的流程依旧由 <code>AdvanceXLInsertBuffer</code> 函数实现，功能是将 WAL Buffer 初始化到参数传入的 <code>upto</code> 位置为止：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Initialize XLOG buffers, writing out old buffers if they still contain</span>
<span class="line"> * unwritten data, upto the page containing &#39;upto&#39;. Or if &#39;opportunistic&#39; is</span>
<span class="line"> * true, initialize as many pages as we can without having to write out</span>
<span class="line"> * unwritten data. Any new pages are initialized to zeros, with pages headers</span>
<span class="line"> * initialized properly.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">AdvanceXLInsertBuffer</span><span class="token punctuation">(</span>XLogRecPtr upto<span class="token punctuation">,</span> TimeLineID tli<span class="token punctuation">,</span> bool opportunistic<span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="整体目标" tabindex="-1"><a class="header-anchor" href="#整体目标"><span>整体目标</span></a></h3><p>该函数的整体目标是，先将共享内存中的 <code>InitializeReserved</code> 推进到大于当前进程希望初始化到的 <code>upto</code> 位置，然后等待 <code>InitializedUpTo</code> 推进到 <code>upto</code> 位置才返回：</p><ul><li>如果当前页面正被其它进程初始化中，则继续初始化后续页面</li><li>如果没有进程正在参与当前页面的初始化，则由当前进程来进行</li><li>如果所有页面都正被其它进程初始化中，那么通过条件变量 <code>InitializedUpToCondVar</code> 等待其它进程初始化结束</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token function">START_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*--</span>
<span class="line"> * Loop till we get all the pages in WAL buffer before &#39;upto&#39; reserved for</span>
<span class="line"> * initialization.  Multiple process can initialize different buffers with</span>
<span class="line"> * this loop in parallel as following.</span>
<span class="line"> *</span>
<span class="line"> * 1. Reserve page for initialization using XLogCtl-&gt;InitializeReserved.</span>
<span class="line"> * 2. Initialize the reserved page.</span>
<span class="line"> * 3. Attempt to advance XLogCtl-&gt;InitializedUpTo,</span>
<span class="line"> */</span></span>
<span class="line">ReservedPtr <span class="token operator">=</span> <span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializeReserved<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span>upto <span class="token operator">&gt;=</span> ReservedPtr <span class="token operator">||</span> opportunistic<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token function">END_CRIT_SECTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * All the pages in WAL buffer before &#39;upto&#39; were reserved for</span>
<span class="line"> * initialization.  However, some pages might be reserved by concurrent</span>
<span class="line"> * processes.  Wait till they finish initialization.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span>upto <span class="token operator">&gt;=</span> <span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token function">ConditionVariableSleep</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializedUpToCondVar<span class="token punctuation">,</span> WAIT_EVENT_WAL_BUFFER_INIT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token function">ConditionVariableCancelSleep</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么每个进程如何确定自己是否要做初始化还是等待其它进程初始化呢？</p><h3 id="计算被替换页面的地址" tabindex="-1"><a class="header-anchor" href="#计算被替换页面的地址"><span>计算被替换页面的地址</span></a></h3><p>由于 WAL Buffer 是个环形缓冲区，每个进程首先需要从共享内存中获取下一个未被初始化的页面位置，并计算出这个位置对应的被替换页面地址：通常是减去整个环形缓冲区的大小。只有被替换页面已被写入存储了，当前页面才能被重新初始化：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Get ending-offset of the buffer page we need to replace.</span>
<span class="line"> *</span>
<span class="line"> * We don&#39;t lookup into xlblocks, but rather calculate position we</span>
<span class="line"> * must wait to be written. If it was written, xlblocks will have this</span>
<span class="line"> * position (or uninitialized)</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>ReservedPtr <span class="token operator">+</span> XLOG_BLCKSZ <span class="token operator">&gt;</span> XLOG_BLCKSZ <span class="token operator">*</span> XLOGbuffers<span class="token punctuation">)</span></span>
<span class="line">    OldPageRqstPtr <span class="token operator">=</span> ReservedPtr <span class="token operator">+</span> XLOG_BLCKSZ <span class="token operator">-</span> XLOG_BLCKSZ <span class="token operator">*</span> XLOGbuffers<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">else</span></span>
<span class="line">    OldPageRqstPtr <span class="token operator">=</span> InvalidXLogRecPtr<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如图所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">   To Be Replaced         To Be Initialized</span>
<span class="line">        |&lt;-&gt;|                   |&lt;-&gt;|</span>
<span class="line">        |&lt;-- WAL Buffer Size --&gt;|</span>
<span class="line">+---+---+---+---+---+---+---+---+---+------+</span>
<span class="line">|...|...|///|\\\\\\|\\\\\\|///|\\\\\\|///|...|      |</span>
<span class="line">+---+---+---+---+---+---+---+---+---+------+</span>
<span class="line">                                ^</span>
<span class="line">                                |</span>
<span class="line">                                InitializeReserved</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="推进-initializereserved" tabindex="-1"><a class="header-anchor" href="#推进-initializereserved"><span>推进 InitializeReserved</span></a></h3><p>计算出被替换页面的地址后，首先通过 CAS 操作来推进共享内存中的 <code>InitializeReserved</code>，如果 CAS 成功，则当前进程成功得到了对这个页面进行初始化的工作；如果 CAS 失败，则说明其它进程已经得到了这个工作，当前进程可以继续尝试初始化后续的页面：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Attempt to reserve the page for initialization.  Failure means that</span>
<span class="line"> * this page got reserved by another process.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">pg_atomic_compare_exchange_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializeReserved<span class="token punctuation">,</span></span>
<span class="line">                                    <span class="token operator">&amp;</span>ReservedPtr<span class="token punctuation">,</span></span>
<span class="line">                                    ReservedPtr <span class="token operator">+</span> XLOG_BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="等待被替换页面写入完成" tabindex="-1"><a class="header-anchor" href="#等待被替换页面写入完成"><span>等待被替换页面写入完成</span></a></h3><p>在开始初始化之前，需要检查当前页面位置的被替换页面是否已被写入，如果没有，则由当前进程尝试完成写入。这里需要竞争 WALWriteLock 锁，由上锁成功的进程真正完成写入。</p><p>在 PostgreSQL 18 之前，需要先释放 WALBufMappingLock 再尝试获取 WALWriteLock，将 WAL 日志页面写入存储后释放 WALWriteLock 然后重新获取 WALBufMappingLock。PostgreSQL 18 起 WALBufMappingLock 已被移除，不再有相关的上锁动作：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Fall through if it&#39;s already written out. */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>LogwrtResult<span class="token punctuation">.</span>Write <span class="token operator">&lt;</span> OldPageRqstPtr<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Nope, got work to do. */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="页面初始化" tabindex="-1"><a class="header-anchor" href="#页面初始化"><span>页面初始化</span></a></h3><p>被替换页面已经被写入存储后，可以开始对当前页面进行重新初始化了。更新这个页面的 <code>xlblocks</code> 映射关系并将页面内容抹为全零：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Now the next buffer slot is free and we can set it up to be the</span>
<span class="line"> * next output page.</span>
<span class="line"> */</span></span>
<span class="line">NewPageBeginPtr <span class="token operator">=</span> ReservedPtr<span class="token punctuation">;</span></span>
<span class="line">NewPageEndPtr <span class="token operator">=</span> NewPageBeginPtr <span class="token operator">+</span> XLOG_BLCKSZ<span class="token punctuation">;</span></span>
<span class="line">nextidx <span class="token operator">=</span> <span class="token function">XLogRecPtrToBufIdx</span><span class="token punctuation">(</span>ReservedPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">NewPage <span class="token operator">=</span> <span class="token punctuation">(</span>XLogPageHeader<span class="token punctuation">)</span> <span class="token punctuation">(</span>XLogCtl<span class="token operator">-&gt;</span>pages <span class="token operator">+</span> nextidx <span class="token operator">*</span> <span class="token punctuation">(</span>Size<span class="token punctuation">)</span> XLOG_BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* initialize NewPage ... */</span></span>
<span class="line"><span class="token comment">/* ... */</span></span>
<span class="line"><span class="token function">pg_atomic_write_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">,</span> InvalidXLogRecPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token function">pg_write_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">/* ... */</span></span>
<span class="line"><span class="token function">MemSet</span><span class="token punctuation">(</span>NewPage<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> XLOG_BLCKSZ<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">/* ... */</span></span>
<span class="line"><span class="token function">pg_write_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token function">pg_atomic_write_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">,</span> NewPageEndPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">/* ... */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="推进-initializedupto" tabindex="-1"><a class="header-anchor" href="#推进-initializedupto"><span>推进 InitializedUpTo</span></a></h3><p>页面初始化完毕后，当前进程将会通过 CAS 操作尝试推进共享内存中的 <code>InitializedUpTo</code>。如果 CAS 失败，说明还有更早的页面仍在被其它进程初始化中，此时当前进程不可以推进进度，否则就表示更早之前的页面已经全部初始化完毕了。因此，当前进程将会直接放弃推进 <code>InitializedUpTo</code>，而是由初始化完最早页面的进程来推进 <code>InitializedUpTo</code>，并在推进到最后一个已经初始化完毕的页面后，通过条件变量唤醒所有等待进程：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Try to advance XLogCtl-&gt;InitializedUpTo.</span>
<span class="line"> *</span>
<span class="line"> * If the CAS operation failed, then some of previous pages are not</span>
<span class="line"> * initialized yet, and this backend gives up.</span>
<span class="line"> *</span>
<span class="line"> * Since initializer of next page might give up on advancing of</span>
<span class="line"> * InitializedUpTo, this backend have to attempt advancing until it</span>
<span class="line"> * find page &quot;in the past&quot; or concurrent backend succeeded at</span>
<span class="line"> * advancing.  When we finish advancing XLogCtl-&gt;InitializedUpTo, we</span>
<span class="line"> * notify all the waiters with XLogCtl-&gt;InitializedUpToCondVar.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">pg_atomic_compare_exchange_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializedUpTo<span class="token punctuation">,</span> <span class="token operator">&amp;</span>NewPageBeginPtr<span class="token punctuation">,</span> NewPageEndPtr<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    NewPageBeginPtr <span class="token operator">=</span> NewPageEndPtr<span class="token punctuation">;</span></span>
<span class="line">    NewPageEndPtr <span class="token operator">=</span> NewPageBeginPtr <span class="token operator">+</span> XLOG_BLCKSZ<span class="token punctuation">;</span></span>
<span class="line">    nextidx <span class="token operator">=</span> <span class="token function">XLogRecPtrToBufIdx</span><span class="token punctuation">(</span>NewPageBeginPtr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">pg_atomic_read_u64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>xlblocks<span class="token punctuation">[</span>nextidx<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NewPageEndPtr<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Page at nextidx wasn&#39;t initialized yet, so we cann&#39;t move</span>
<span class="line">         * InitializedUpto further. It will be moved by backend which</span>
<span class="line">         * will initialize nextidx.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">ConditionVariableBroadcast</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>XLogCtl<span class="token operator">-&gt;</span>InitializedUpToCondVar<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="相关信息" tabindex="-1"><a class="header-anchor" href="#相关信息"><span>相关信息</span></a></h2><p><a href="https://www.postgresql.org/message-id/flat/39b39e7a-41b4-4f34-b3f5-db735e74a723%40postgrespro.ru" target="_blank" rel="noopener noreferrer">PostgreSQL Mailing List: Get rid of WALBufMappingLock</a></p>`,43))])}const b=i(r,[["render",u],["__file","PostgreSQL WALBufMappingLock.html.vue"]]),k=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20WALBufMappingLock.html","title":"PostgreSQL - WALBufMappingLock","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"WAL Buffer 控制结构修改","slug":"wal-buffer-控制结构修改","link":"#wal-buffer-控制结构修改","children":[]},{"level":2,"title":"无锁算法","slug":"无锁算法","link":"#无锁算法","children":[{"level":3,"title":"整体目标","slug":"整体目标","link":"#整体目标","children":[]},{"level":3,"title":"计算被替换页面的地址","slug":"计算被替换页面的地址","link":"#计算被替换页面的地址","children":[]},{"level":3,"title":"推进 InitializeReserved","slug":"推进-initializereserved","link":"#推进-initializereserved","children":[]},{"level":3,"title":"等待被替换页面写入完成","slug":"等待被替换页面写入完成","link":"#等待被替换页面写入完成","children":[]},{"level":3,"title":"页面初始化","slug":"页面初始化","link":"#页面初始化","children":[]},{"level":3,"title":"推进 InitializedUpTo","slug":"推进-initializedupto","link":"#推进-initializedupto","children":[]}]},{"level":2,"title":"相关信息","slug":"相关信息","link":"#相关信息","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL WALBufMappingLock.md"}');export{b as comp,k as data};
