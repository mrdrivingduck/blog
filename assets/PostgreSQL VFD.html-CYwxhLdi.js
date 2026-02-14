import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function t(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-vfd" tabindex="-1"><a class="header-anchor" href="#postgresql-vfd"><span>PostgreSQL - VFD</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 08 / 08 0:27</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>PostgreSQL 后端进程经常需要打开大量的文件，包括表文件、索引文件、临时文件（用于排序或构造 hash 表）等。由于操作系统允许一个进程能够打开的文件数量是有上限的，为了防止后端进程打开文件时因超出 OS 的限制而失败，PostgreSQL 提供了 <strong>虚拟文件描述符 (VFD)</strong> 机制。VFD 抽象层能够对使用 VFD API 的代码屏蔽对 OS 文件描述符的管理细节，使更高层的代码能够打开比 OS 限制的数量更多的文件。</p><p>本文对 PostgreSQL 内核代码的分析截止主干开发分支 <code>master</code> 上的如下版本号：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit afe58c8b746cac1e2c3e9f0fc96a0f69a46c84d3</span>
<span class="line">Author: Alvaro Herrera &lt;alvherre@alvh.no-ip.org&gt;</span>
<span class="line">Date:   Sun Aug 7 10:19:40 2022 +0200</span>
<span class="line"></span>
<span class="line">    Remove unportable use of timezone in recent test</span>
<span class="line"></span>
<span class="line">    Per buildfarm member snapper</span>
<span class="line"></span>
<span class="line">    Discussion: https://postgr.es/m/129951.1659812518@sss.pgh.pa.us</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="design" tabindex="-1"><a class="header-anchor" href="#design"><span>Design</span></a></h2><p>VFD 机制最核心的设计，就是使用一个 LRU (Least-Recently-Used) 缓存池来管理当前进程所有的 <strong>操作系统文件描述符</strong>，同时对更上层的代码暴露出 <strong>虚拟文件描述符 (Virtual File Descriptor)</strong> 供使用。理想情况下，除了 VFD 的内部实现，其它部分内核代码不应该直接调用 C 库函数去操作文件。当 PostgreSQL 后端进程需要打开一个文件，且此时进程已经打开的文件数量将要超过 OS 允许的最大数量时，VFD 从其管理的 OS 文件描述符中选出最近最久未被使用的文件描述符并关闭它，此时打开这个文件就不会被 OS 拒绝。这个过程对使用 VFD API 的更高层代码来说是无感知的，仿佛可以不受数量限制地打开文件一样。</p><h2 id="virtual-file-descriptor" tabindex="-1"><a class="header-anchor" href="#virtual-file-descriptor"><span>Virtual File Descriptor</span></a></h2><p>PostgreSQL 中，所有的 VFD 在物理上被组织成一个数组。<code>VfdCache</code> 是指向这个数组起始位置的指针，<code>SizeVfdCache</code> 保存这个数组的长度。这个数组的长度会随着对 VFD 需求量的增加而动态扩容。</p><p><code>nfile</code> 变量记录了 VFD 数组中到底管理了多少个操作系统的文件描述符，这样 VFD 机制才能在打开的文件数量即将超出 OS 限制时，关闭最近最久未被使用的文件描述符。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Virtual File Descriptor array pointer and size.  This grows as</span>
<span class="line"> * needed.  &#39;File&#39; values are indexes into this array.</span>
<span class="line"> * Note that VfdCache[0] is not a usable VFD, just a list header.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> Vfd <span class="token operator">*</span>VfdCache<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">static</span> Size SizeVfdCache <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Number of file descriptors known to be in use by VFD entries.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">int</span>  nfile <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>虚拟文件描述符的结构定义如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">vfd</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         fd<span class="token punctuation">;</span>             <span class="token comment">/* current FD, or VFD_CLOSED if none */</span></span>
<span class="line">    <span class="token keyword">unsigned</span> <span class="token keyword">short</span> fdstate<span class="token punctuation">;</span>     <span class="token comment">/* bitflags for VFD&#39;s state */</span></span>
<span class="line">    ResourceOwner resowner<span class="token punctuation">;</span>     <span class="token comment">/* owner, for automatic cleanup */</span></span>
<span class="line">    File        nextFree<span class="token punctuation">;</span>       <span class="token comment">/* link to next free VFD, if in freelist */</span></span>
<span class="line">    File        lruMoreRecently<span class="token punctuation">;</span>    <span class="token comment">/* doubly linked recency-of-use list */</span></span>
<span class="line">    File        lruLessRecently<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">off_t</span>       fileSize<span class="token punctuation">;</span>       <span class="token comment">/* current size of file (0 if not temporary) */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>fileName<span class="token punctuation">;</span>       <span class="token comment">/* name of file, or NULL for unused VFD */</span></span>
<span class="line">    <span class="token comment">/* NB: fileName is malloc&#39;d, and must be free&#39;d when closing the VFD */</span></span>
<span class="line">    <span class="token keyword">int</span>         fileFlags<span class="token punctuation">;</span>      <span class="token comment">/* open(2) flags for (re)opening the file */</span></span>
<span class="line">    <span class="token class-name">mode_t</span>      fileMode<span class="token punctuation">;</span>       <span class="token comment">/* mode to pass to open(2) */</span></span>
<span class="line"><span class="token punctuation">}</span> Vfd<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中包括了 VFD 的状态信息：</p><ul><li><code>fd</code> 用于保存真正的 OS 文件描述符，如果未使用，那么将会被设置为 <code>VFD_CLOSED</code></li><li><code>fdstate</code> 保存了 VFD 的状态标志位</li><li><code>resowner</code> 表示这个 VFD 的持有者，方便后续的自动清理</li></ul><p>此外，还包括 VFD 数组的管理信息。整个 VFD 数组被组织为两部分：LRU 池和空闲 VFD 列表。</p><p>LRU 池在逻辑上是一个双向链表，管理了所有正在持有 OS 文件描述符的 VFD。当一个 VFD 被使用后，它就会从 LRU 链表中移动到队头；此时 LRU 双向链表的尾部就是最近最久未被使用过的那个 VFD。</p><p>空闲 VFD 列表在逻辑上是一个单向链表。所有未被使用的 VFD 都会被串联在这个单链表中。被使用完毕释放的 VFD 也会被串回这个链表中。</p><p>上述两个部分虽然在逻辑上是双向或单向链表，但在形态上还是存放在 VFD 数组中，通过保存以下三个数组下标来代替链表本应该拥有的指针：</p><ul><li><code>nextFree</code> 是下一个空闲 VFD 在数组中的下标，用于串联空闲 VFD 列表</li><li><code>lruMoreRecently</code> 是后一个被使用过的 VFD 在数组中的下标</li><li><code>lruLessRecently</code> 是前一个被使用过的 VFD 在数组中的下标</li></ul><p>后两者相当于双向链表中的 <code>prev</code> 和 <code>next</code> 指针，用于串联 LRU 池。VFD 数组中的第一个元素 <code>VfdCache[0]</code> 永远不使用，该元素中的空间将会被分别作为两个链表的头指针。</p><p>最后剩下的几个信息，是真正向操作系统打开文件时传入的参数：</p><ul><li><code>fileSize</code> 表示文件大小</li><li><code>fileName</code> 表示文件名</li><li><code>fileFlags</code> 表示打开文件时的标志位</li><li><code>fileMode</code> 表示打开文件时的模式（权限）</li></ul><h2 id="低层函数" tabindex="-1"><a class="header-anchor" href="#低层函数"><span>低层函数</span></a></h2><h3 id="lruinsert-insert" tabindex="-1"><a class="header-anchor" href="#lruinsert-insert"><span>LruInsert / Insert</span></a></h3><p><code>LruInsert()</code> 函数会向 OS 申请真正打开 VFD 所对应的 OS 文件描述符，然后把这个 VFD 添加到 LRU 池的队头。LRU 池中的 VFD 是真正持有 OS 文件描述符的 VFD。把 VFD 移动到 LRU 池的队头是通过 <code>Insert()</code> 函数实现的，它会修改 VFD 的 LRU 双向链表指针。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">Insert</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>file <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;Insert %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">_dump_lru</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>lruMoreRecently <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>lruLessRecently <span class="token operator">=</span> VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lruLessRecently<span class="token punctuation">;</span></span>
<span class="line">    VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lruLessRecently <span class="token operator">=</span> file<span class="token punctuation">;</span></span>
<span class="line">    VfdCache<span class="token punctuation">[</span>vfdP<span class="token operator">-&gt;</span>lruLessRecently<span class="token punctuation">]</span><span class="token punctuation">.</span>lruMoreRecently <span class="token operator">=</span> file<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">_dump_lru</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* returns 0 on success, -1 on re-open failure (with errno set) */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">int</span></span>
<span class="line"><span class="token function">LruInsert</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>file <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;LruInsert %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">FileIsNotOpen</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Close excess kernel FDs. */</span></span>
<span class="line">        <span class="token function">ReleaseLruFiles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * The open could still fail for lack of file descriptors, eg due to</span>
<span class="line">         * overall system file table being full.  So, be prepared to release</span>
<span class="line">         * another FD if necessary...</span>
<span class="line">         */</span></span>
<span class="line">        vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">=</span> <span class="token function">BasicOpenFilePerm</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileFlags<span class="token punctuation">,</span></span>
<span class="line">                                     vfdP<span class="token operator">-&gt;</span>fileMode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;re-open failed: %m&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token operator">++</span>nfile<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * put it at the head of the Lru ring</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Insert</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="lrudelete-delete" tabindex="-1"><a class="header-anchor" href="#lrudelete-delete"><span>LruDelete / Delete</span></a></h3><p><code>LruDelete()</code> 函数会真正释放 VFD 所持有的 OS 文件描述符，然后将 VFD 从 LRU 池中移除，因为这个 VFD 已经不再持有 OS 文件描述符了。移除动作是由 <code>Delete()</code> 函数实现的，它负责修改 VFD 的 LRU 指针，重新串联这个 VFD 之前和之后的 VFD。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">Delete</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>file <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;Delete %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">_dump_lru</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    VfdCache<span class="token punctuation">[</span>vfdP<span class="token operator">-&gt;</span>lruLessRecently<span class="token punctuation">]</span><span class="token punctuation">.</span>lruMoreRecently <span class="token operator">=</span> vfdP<span class="token operator">-&gt;</span>lruMoreRecently<span class="token punctuation">;</span></span>
<span class="line">    VfdCache<span class="token punctuation">[</span>vfdP<span class="token operator">-&gt;</span>lruMoreRecently<span class="token punctuation">]</span><span class="token punctuation">.</span>lruLessRecently <span class="token operator">=</span> vfdP<span class="token operator">-&gt;</span>lruLessRecently<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">_dump_lru</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">LruDelete</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>file <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;LruDelete %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Close the file.  We aren&#39;t expecting this to fail; if it does, better</span>
<span class="line">     * to leak the FD than to mess up our internal state.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">close</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fd<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">&amp;</span> FD_TEMP_FILE_LIMIT <span class="token operator">?</span> LOG <span class="token operator">:</span> <span class="token function">data_sync_elevel</span><span class="token punctuation">(</span>LOG<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">             <span class="token string">&quot;could not close file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">=</span> VFD_CLOSED<span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">--</span>nfile<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* delete the vfd record from the LRU ring */</span></span>
<span class="line">    <span class="token function">Delete</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="releaselrufile-releaselrufiles" tabindex="-1"><a class="header-anchor" href="#releaselrufile-releaselrufiles"><span>ReleaseLruFile / ReleaseLruFiles</span></a></h3><p>这两个函数负责不断关闭 LRU 池中最近最久未被使用的 VFD 所持有的 OS 文件描述符，直到将 LRU 池中的 VFD 数量控制到 OS 允许的安全范围以下。具体的实现方式就是调用上面的 <code>LruDelete()</code> 来关闭 OS 文件描述符并从 LRU 池中移除。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Release one kernel FD by closing the least-recently-used VFD.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">ReleaseLruFile</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;ReleaseLruFile. Opened %d&quot;</span><span class="token punctuation">,</span> nfile<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>nfile <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * There are opened files and so there should be at least one used vfd</span>
<span class="line">         * in the ring.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lruMoreRecently <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">LruDelete</span><span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lruMoreRecently<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> true<span class="token punctuation">;</span>            <span class="token comment">/* freed a file */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> false<span class="token punctuation">;</span>               <span class="token comment">/* no files available to free */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Release kernel FDs as needed to get under the max_safe_fds limit.</span>
<span class="line"> * After calling this, it&#39;s OK to try to open another file.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ReleaseLruFiles</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>nfile <span class="token operator">+</span> numAllocatedDescs <span class="token operator">+</span> numExternalFDs <span class="token operator">&gt;=</span> max_safe_fds<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ReleaseLruFile</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="allocatevfd-freevfd" tabindex="-1"><a class="header-anchor" href="#allocatevfd-freevfd"><span>AllocateVfd / FreeVfd</span></a></h3><p>这两个函数负责在 VFD 数组中占用一个空闲的 VFD（但并不打开底层的 OS 文件），以及归还 VFD。</p><p>在分配 VFD 时，如果 VFD 数组的空闲链表已经为空，那么就需要使用 <code>realloc()</code> 重新分配一个更大的 VFD 数组（通常是原 VFD 数组长度的两倍），并把新分配数组的后一半 VFD 初始化到空闲链表中以备未来使用。然后从空闲链表中摘下一个 VFD 并返回其下标。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> File</span>
<span class="line"><span class="token function">AllocateVfd</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Index       i<span class="token punctuation">;</span></span>
<span class="line">    File        file<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;AllocateVfd. Size %zu&quot;</span><span class="token punctuation">,</span> SizeVfdCache<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>SizeVfdCache <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>   <span class="token comment">/* InitFileAccess not called? */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * The free list is empty so it is time to increase the size of the</span>
<span class="line">         * array.  We choose to double it each time this happens. However,</span>
<span class="line">         * there&#39;s not much point in starting *real* small.</span>
<span class="line">         */</span></span>
<span class="line">        Size        newCacheSize <span class="token operator">=</span> SizeVfdCache <span class="token operator">*</span> <span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line">        Vfd        <span class="token operator">*</span>newVfdCache<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>newCacheSize <span class="token operator">&lt;</span> <span class="token number">32</span><span class="token punctuation">)</span></span>
<span class="line">            newCacheSize <span class="token operator">=</span> <span class="token number">32</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Be careful not to clobber VfdCache ptr if realloc fails.</span>
<span class="line">         */</span></span>
<span class="line">        newVfdCache <span class="token operator">=</span> <span class="token punctuation">(</span>Vfd <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">realloc</span><span class="token punctuation">(</span>VfdCache<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>Vfd<span class="token punctuation">)</span> <span class="token operator">*</span> newCacheSize<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>newVfdCache <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_OUT_OF_MEMORY<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;out of memory&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        VfdCache <span class="token operator">=</span> newVfdCache<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Initialize the new entries and link them into the free list.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> SizeVfdCache<span class="token punctuation">;</span> i <span class="token operator">&lt;</span> newCacheSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">MemSet</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span><span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>Vfd<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            VfdCache<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">=</span> i <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            VfdCache<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>fd <span class="token operator">=</span> VFD_CLOSED<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        VfdCache<span class="token punctuation">[</span>newCacheSize <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">=</span> SizeVfdCache<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Record the new size</span>
<span class="line">         */</span></span>
<span class="line">        SizeVfdCache <span class="token operator">=</span> newCacheSize<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    file <span class="token operator">=</span> VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">=</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> file<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>归还 VFD 的过程很直接：将 VFD 恢复为初始状态，然后将其重新放回空闲链表中。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">FreeVfd</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;FreeVfd: %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileName <span class="token operator">?</span> vfdP<span class="token operator">-&gt;</span>fileName <span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">free</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        vfdP<span class="token operator">-&gt;</span>fileName <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">=</span> <span class="token number">0x0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>nextFree <span class="token operator">=</span> VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree<span class="token punctuation">;</span></span>
<span class="line">    VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>nextFree <span class="token operator">=</span> file<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="basicopenfile-open-系统调用的替代者" tabindex="-1"><a class="header-anchor" href="#basicopenfile-open-系统调用的替代者"><span>BasicOpenFile：Open 系统调用的替代者</span></a></h3><p>这个函数封装了传统的 <code>open()</code> 系统调用。理论上，PostgreSQL 内核的其它部分不应再直接使用 <code>open()</code> 系统调用。这个函数将会返回一个裸的 OS 文件描述符，而不是 VFD——所以调用这个函数的代码需要保证这个文件描述符不会被泄露。</p><p>该函数内部真正调用了 <code>open()</code> 来获取一个 OS 文件描述符。如果失败，那么将会试图从 LRU 池中删除一个已有的文件描述符，然后再度重试，直到成功为止。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Open a file with BasicOpenFilePerm() and pass default file mode for the</span>
<span class="line"> * fileMode parameter.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">int</span></span>
<span class="line"><span class="token function">BasicOpenFile</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>fileName<span class="token punctuation">,</span> <span class="token keyword">int</span> fileFlags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">BasicOpenFilePerm</span><span class="token punctuation">(</span>fileName<span class="token punctuation">,</span> fileFlags<span class="token punctuation">,</span> pg_file_create_mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * BasicOpenFilePerm --- same as open(2) except can free other FDs if needed</span>
<span class="line"> *</span>
<span class="line"> * This is exported for use by places that really want a plain kernel FD,</span>
<span class="line"> * but need to be proof against running out of FDs.  Once an FD has been</span>
<span class="line"> * successfully returned, it is the caller&#39;s responsibility to ensure that</span>
<span class="line"> * it will not be leaked on ereport()!  Most users should *not* call this</span>
<span class="line"> * routine directly, but instead use the VFD abstraction level, which</span>
<span class="line"> * provides protection against descriptor leaks as well as management of</span>
<span class="line"> * files that need to be open for more than a short period of time.</span>
<span class="line"> *</span>
<span class="line"> * Ideally this should be the *only* direct call of open() in the backend.</span>
<span class="line"> * In practice, the postmaster calls open() directly, and there are some</span>
<span class="line"> * direct open() calls done early in backend startup.  Those are OK since</span>
<span class="line"> * this module wouldn&#39;t have any open files to close at that point anyway.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">int</span></span>
<span class="line"><span class="token function">BasicOpenFilePerm</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>fileName<span class="token punctuation">,</span> <span class="token keyword">int</span> fileFlags<span class="token punctuation">,</span> <span class="token class-name">mode_t</span> fileMode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         fd<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">tryAgain<span class="token operator">:</span></span>
<span class="line">    fd <span class="token operator">=</span> <span class="token function">open</span><span class="token punctuation">(</span>fileName<span class="token punctuation">,</span> fileFlags<span class="token punctuation">,</span> fileMode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fd <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> fd<span class="token punctuation">;</span>              <span class="token comment">/* success! */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>errno <span class="token operator">==</span> EMFILE <span class="token operator">||</span> errno <span class="token operator">==</span> ENFILE<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span>         save_errno <span class="token operator">=</span> errno<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_RESOURCES<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;out of file descriptors: %m; release and retry&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        errno <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ReleaseLruFile</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">goto</span> tryAgain<span class="token punctuation">;</span></span>
<span class="line">        errno <span class="token operator">=</span> save_errno<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>                  <span class="token comment">/* failure */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="fileaccess-访问文件" tabindex="-1"><a class="header-anchor" href="#fileaccess-访问文件"><span>FileAccess：访问文件</span></a></h3><p>每个高层文件访问接口都会调用 <code>FileAccess()</code>。调用这个函数意味着 VFD 持有的 OS 文件描述符将要被使用。那么：</p><ol><li>如果这个文件在 OS 层面还没有被打开，那么调用 <code>LruInsert()</code> 打开文件并将 VFD 插入 LRU 池</li><li>如果这个文件已被打开，那么先将 VFD 从 LRU 池中移除，然后将 VFD 插入到 LRU 池的队头，表示这个 VFD 最近刚刚被访问</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* returns 0 on success, -1 on re-open failure (with errno set) */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">int</span></span>
<span class="line"><span class="token function">FileAccess</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         returnValue<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;FileAccess %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Is the file open?  If not, open it and put it at the head of the LRU</span>
<span class="line">     * ring (possibly closing the least recently used file to get an FD).</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">FileIsNotOpen</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        returnValue <span class="token operator">=</span> <span class="token function">LruInsert</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>returnValue <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> returnValue<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>VfdCache<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>lruLessRecently <span class="token operator">!=</span> file<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We now know that the file is open and that it is not the last one</span>
<span class="line">         * accessed, so we need to move it to the head of the Lru ring.</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">Delete</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">Insert</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="高层文件操作接口" tabindex="-1"><a class="header-anchor" href="#高层文件操作接口"><span>高层文件操作接口</span></a></h2><h3 id="打开文件" tabindex="-1"><a class="header-anchor" href="#打开文件"><span>打开文件</span></a></h3><p><code>PathNameOpenFilePerm()</code> 将会根据参数打开文件，并返回一个 VFD。经历了以下步骤：</p><ol><li>调用 <code>AllocateVfd()</code> 从 VFD 数组中拿到一个空闲 VFD 并初始化</li><li>调用 <code>ReleaseLruFiles()</code> 把 LRU 池中的 VFD 减少到操作系统允许的水平</li><li>调用 <code>BasicOpenFilePerm()</code> 打开一个 OS 文件描述符，并关联到新分配的 VFD 上</li><li>调用 <code>Insert()</code> 把新分配的 VFD 添加到 LRU 池中</li><li>返回新分配的 VFD</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Open a file with PathNameOpenFilePerm() and pass default file mode for the</span>
<span class="line"> * fileMode parameter.</span>
<span class="line"> */</span></span>
<span class="line">File</span>
<span class="line"><span class="token function">PathNameOpenFile</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>fileName<span class="token punctuation">,</span> <span class="token keyword">int</span> fileFlags<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">PathNameOpenFilePerm</span><span class="token punctuation">(</span>fileName<span class="token punctuation">,</span> fileFlags<span class="token punctuation">,</span> pg_file_create_mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * open a file in an arbitrary directory</span>
<span class="line"> *</span>
<span class="line"> * NB: if the passed pathname is relative (which it usually is),</span>
<span class="line"> * it will be interpreted relative to the process&#39; working directory</span>
<span class="line"> * (which should always be $PGDATA when this code is running).</span>
<span class="line"> */</span></span>
<span class="line">File</span>
<span class="line"><span class="token function">PathNameOpenFilePerm</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>fileName<span class="token punctuation">,</span> <span class="token keyword">int</span> fileFlags<span class="token punctuation">,</span> <span class="token class-name">mode_t</span> fileMode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>fnamecopy<span class="token punctuation">;</span></span>
<span class="line">    File        file<span class="token punctuation">;</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;PathNameOpenFilePerm: %s %x %o&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               fileName<span class="token punctuation">,</span> fileFlags<span class="token punctuation">,</span> fileMode<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We need a malloc&#39;d copy of the file name; fail cleanly if no room.</span>
<span class="line">     */</span></span>
<span class="line">    fnamecopy <span class="token operator">=</span> <span class="token function">strdup</span><span class="token punctuation">(</span>fileName<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fnamecopy <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_OUT_OF_MEMORY<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;out of memory&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    file <span class="token operator">=</span> <span class="token function">AllocateVfd</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Close excess kernel FDs. */</span></span>
<span class="line">    <span class="token function">ReleaseLruFiles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">=</span> <span class="token function">BasicOpenFilePerm</span><span class="token punctuation">(</span>fileName<span class="token punctuation">,</span> fileFlags<span class="token punctuation">,</span> fileMode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span>         save_errno <span class="token operator">=</span> errno<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">FreeVfd</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">free</span><span class="token punctuation">(</span>fnamecopy<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        errno <span class="token operator">=</span> save_errno<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token operator">++</span>nfile<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;PathNameOpenFile: success %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               vfdP<span class="token operator">-&gt;</span>fd<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fileName <span class="token operator">=</span> fnamecopy<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* Saved flags are adjusted to be OK for re-opening file */</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fileFlags <span class="token operator">=</span> fileFlags <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token punctuation">(</span>O_CREAT <span class="token operator">|</span> O_TRUNC <span class="token operator">|</span> O_EXCL<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fileMode <span class="token operator">=</span> fileMode<span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fileSize <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">=</span> <span class="token number">0x0</span><span class="token punctuation">;</span></span>
<span class="line">    vfdP<span class="token operator">-&gt;</span>resowner <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Insert</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> file<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="关闭文件" tabindex="-1"><a class="header-anchor" href="#关闭文件"><span>关闭文件</span></a></h3><p><code>FileClose()</code> 将会关闭一个 VFD 所对应的一切：</p><ol><li>如果 VFD 对应的 OS 文件描述符已被打开，那么调用 <code>close()</code> 关掉它，然后调用 <code>Delete()</code> 从 LRU 池里移除这个 VFD</li><li>如果 VFD 对应的文件被设置了 <strong>关闭时删除</strong> 的标志（临时文件），那么调用 <code>unlink()</code> 删掉它！</li><li>调用 <code>FreeVfd()</code> 清空这个 VFD 并重新归还到 VFD 数组的空闲链表中</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * close a file when done with it</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">FileClose</span><span class="token punctuation">(</span>File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">FileIsValid</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;FileClose: %d (%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">FileIsNotOpen</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* close the file */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">close</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fd<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * We may need to panic on failure to close non-temporary files;</span>
<span class="line">             * see LruDelete.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">elog</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">&amp;</span> FD_TEMP_FILE_LIMIT <span class="token operator">?</span> LOG <span class="token operator">:</span> <span class="token function">data_sync_elevel</span><span class="token punctuation">(</span>LOG<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token string">&quot;could not close file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token operator">--</span>nfile<span class="token punctuation">;</span></span>
<span class="line">        vfdP<span class="token operator">-&gt;</span>fd <span class="token operator">=</span> VFD_CLOSED<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* remove the file from the lru ring */</span></span>
<span class="line">        <span class="token function">Delete</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">&amp;</span> FD_TEMP_FILE_LIMIT<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Subtract its size from current usage (do first in case of error) */</span></span>
<span class="line">        temporary_files_size <span class="token operator">-=</span> vfdP<span class="token operator">-&gt;</span>fileSize<span class="token punctuation">;</span></span>
<span class="line">        vfdP<span class="token operator">-&gt;</span>fileSize <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Delete the file if it was temporary, and make a log entry if wanted</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">&amp;</span> FD_DELETE_AT_CLOSE<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">struct</span> <span class="token class-name">stat</span> filestats<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span>         stat_errno<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If we get an error, as could happen within the ereport/elog calls,</span>
<span class="line">         * we&#39;ll come right back here during transaction abort.  Reset the</span>
<span class="line">         * flag to ensure that we can&#39;t get into an infinite loop.  This code</span>
<span class="line">         * is arranged to ensure that the worst-case consequence is failing to</span>
<span class="line">         * emit log message(s), not failing to attempt the unlink.</span>
<span class="line">         */</span></span>
<span class="line">        vfdP<span class="token operator">-&gt;</span>fdstate <span class="token operator">&amp;=</span> <span class="token operator">~</span>FD_DELETE_AT_CLOSE<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* first try the stat() */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">stat</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">,</span> <span class="token operator">&amp;</span>filestats<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            stat_errno <span class="token operator">=</span> errno<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            stat_errno <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* in any case do the unlink */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">unlink</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode_for_file_access</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;could not delete file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* and last report the stat results */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>stat_errno <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ReportTemporaryFileUsage</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">,</span> filestats<span class="token punctuation">.</span>st_size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            errno <span class="token operator">=</span> stat_errno<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode_for_file_access</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;could not stat file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span> vfdP<span class="token operator">-&gt;</span>fileName<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Unregister it from the resource owner */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>resowner<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ResourceOwnerForgetFile</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>resowner<span class="token punctuation">,</span> file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Return the Vfd slot to the free list</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">FreeVfd</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="其它文件操作" tabindex="-1"><a class="header-anchor" href="#其它文件操作"><span>其它文件操作</span></a></h3><p>除去文件的打开与关闭以外，其它文件操作需要基于 <strong>文件已被打开</strong> 的假设进行。这些文件操作都被 PostgreSQL 内核做了一层封装。在进行真正的文件操作之前，需要先使用打开文件后持有的 VFD 调用一次 <code>FileAccess()</code> 函数。这个函数能够保证：</p><ol><li>VFD 内部持有的 OS 文件描述符已经打开（如果没打开，那就立刻打开，或许会导致其它 OS 文件描述符被关闭）</li><li>VFD 在 LRU 池中的位置移动到队头，因为这个 VFD 对应的 OS 文件描述符最近被使用了</li></ol><p>以文件库函数 <code>read()</code> 的包装 <code>FileRead()</code> 为例：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">int</span></span>
<span class="line"><span class="token function">FileRead</span><span class="token punctuation">(</span>File file<span class="token punctuation">,</span> <span class="token keyword">char</span> <span class="token operator">*</span>buffer<span class="token punctuation">,</span> <span class="token keyword">int</span> amount<span class="token punctuation">,</span> <span class="token class-name">off_t</span> offset<span class="token punctuation">,</span></span>
<span class="line">         uint32 wait_event_info<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         returnCode<span class="token punctuation">;</span></span>
<span class="line">    Vfd        <span class="token operator">*</span>vfdP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">FileIsValid</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">DO_DB</span><span class="token punctuation">(</span><span class="token function">elog</span><span class="token punctuation">(</span>LOG<span class="token punctuation">,</span> <span class="token string">&quot;FileRead: %d (%s) &quot;</span> INT64_FORMAT <span class="token string">&quot; %d %p&quot;</span><span class="token punctuation">,</span></span>
<span class="line">               file<span class="token punctuation">,</span> VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">.</span>fileName<span class="token punctuation">,</span></span>
<span class="line">               <span class="token punctuation">(</span>int64<span class="token punctuation">)</span> offset<span class="token punctuation">,</span></span>
<span class="line">               amount<span class="token punctuation">,</span> buffer<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    returnCode <span class="token operator">=</span> <span class="token function">FileAccess</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>returnCode <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> returnCode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    vfdP <span class="token operator">=</span> <span class="token operator">&amp;</span>VfdCache<span class="token punctuation">[</span>file<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">retry<span class="token operator">:</span></span>
<span class="line">    <span class="token function">pgstat_report_wait_start</span><span class="token punctuation">(</span>wait_event_info<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    returnCode <span class="token operator">=</span> <span class="token function">pread</span><span class="token punctuation">(</span>vfdP<span class="token operator">-&gt;</span>fd<span class="token punctuation">,</span> buffer<span class="token punctuation">,</span> amount<span class="token punctuation">,</span> offset<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">pgstat_report_wait_end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>returnCode <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* OK to retry if interrupted */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>errno <span class="token operator">==</span> EINTR<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">goto</span> retry<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> returnCode<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>PostgreSQL 内核中的 VFD 机制用于防止 PostgreSQL 后端进程受 OS 对进程打开文件数量的限制。VFD 内部维护了一个 LRU 池来管理所有被打开的 OS 文件描述符。使用 VFD 的高层接口来操作文件，就可以享受到 VFD 为我们屏蔽掉的文件描述符管理所带来的的便利。</p><p>VFD 的实现思想与操作系统的进程调度有些类似。OS 上的进程有成百上千个，而 CPU 只有一个（或几个）。从使用者的角度看，这些进程似乎都在同时执行，只有 OS 知道每一个时刻只有一个进程在一个 CPU 核心上运行；在 PostgreSQL 中，类似地，从 VFD 使用者的角度看，似乎能够同时持有远超操作系统数量限制的文件描述符，但只有 VFD 知道，每一个时刻打开的 OS 文件描述符数量必定小于操作系统对进程打开文件数量的限制。</p><p>一招瞒天过海。</p>`,69)]))}const o=s(l,[["render",t],["__file","PostgreSQL VFD.html.vue"]]),u=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20VFD.html","title":"PostgreSQL - VFD","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Design","slug":"design","link":"#design","children":[]},{"level":2,"title":"Virtual File Descriptor","slug":"virtual-file-descriptor","link":"#virtual-file-descriptor","children":[]},{"level":2,"title":"低层函数","slug":"低层函数","link":"#低层函数","children":[{"level":3,"title":"LruInsert / Insert","slug":"lruinsert-insert","link":"#lruinsert-insert","children":[]},{"level":3,"title":"LruDelete / Delete","slug":"lrudelete-delete","link":"#lrudelete-delete","children":[]},{"level":3,"title":"ReleaseLruFile / ReleaseLruFiles","slug":"releaselrufile-releaselrufiles","link":"#releaselrufile-releaselrufiles","children":[]},{"level":3,"title":"AllocateVfd / FreeVfd","slug":"allocatevfd-freevfd","link":"#allocatevfd-freevfd","children":[]},{"level":3,"title":"BasicOpenFile：Open 系统调用的替代者","slug":"basicopenfile-open-系统调用的替代者","link":"#basicopenfile-open-系统调用的替代者","children":[]},{"level":3,"title":"FileAccess：访问文件","slug":"fileaccess-访问文件","link":"#fileaccess-访问文件","children":[]}]},{"level":2,"title":"高层文件操作接口","slug":"高层文件操作接口","link":"#高层文件操作接口","children":[{"level":3,"title":"打开文件","slug":"打开文件","link":"#打开文件","children":[]},{"level":3,"title":"关闭文件","slug":"关闭文件","link":"#关闭文件","children":[]},{"level":3,"title":"其它文件操作","slug":"其它文件操作","link":"#其它文件操作","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL VFD.md"}');export{o as comp,u as data};
