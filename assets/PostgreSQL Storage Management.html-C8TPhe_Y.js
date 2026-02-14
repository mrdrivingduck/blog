import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function t(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-storage-management" tabindex="-1"><a class="header-anchor" href="#postgresql-storage-management"><span>PostgreSQL - Storage Management</span></a></h1><p>Created by: Mr Dk.</p><p>2024 / 07 / 26 20:26</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>PostgreSQL 对文件系统上所有表数据文件的操作全部通过存储管理层 (Storage Manager, Smgr) 提供的函数完成。<a href="https://doxygen.postgresql.org/smgr_8c.html" target="_blank" rel="noopener noreferrer">Smgr</a> 函数集在语义上表示对表的逻辑文件进行操作，并提供了一套虚拟存储管理接口，由下层对接的物理存储管理引擎实现这套接口，完成对物理文件的实际操作，比如打开、关闭、读写等。类似于 Linux kernel 中的 VFS 之于各种各样的文件系统。</p><p>20 多年过去了，非易失性存储介质经历了从 HDD 到 SSD 的发展，而 PostgreSQL 中内置的依旧只有 <a href="https://doxygen.postgresql.org/md_8c.html" target="_blank" rel="noopener noreferrer">Magnetic Disk (md)</a> 这一个物理存储管理引擎，如今依旧发光发热。</p><p>本文截止 PostgreSQL 17 正式发布前的代码版本，分析存储管理层各个接口的语义和用途。</p><h2 id="virtual-storage-management-interface" tabindex="-1"><a class="header-anchor" href="#virtual-storage-management-interface"><span>Virtual Storage Management Interface</span></a></h2><p>逻辑存储管理层对接物理存储管理引擎的接口如下：</p><ul><li><code>smgr_init</code>：初始化物理存储管理引擎，包括一些私有状态</li><li><code>smgr_shutdown</code>：关闭物理存储管理引擎</li><li><code>smgr_open</code>：打开表文件</li><li><code>smgr_close</code>：关闭表文件</li><li><code>smgr_create</code>：创建表文件</li><li><code>smgr_exists</code>：判断物理文件是否存在</li><li><code>smgr_unlink</code>：删除物理文件</li><li><code>smgr_extend</code>：扩展物理文件一个页面</li><li><code>smgr_zeroextend</code>：扩展物理文件多个全 0 页面</li><li><code>smgr_prefetch</code>：异步预取某个表的某个页面</li><li><code>smgr_readv</code>：读取表的某个页面</li><li><code>smgr_writev</code>：将表的某个页面写入文件</li><li><code>smgr_writeback</code>：使文件系统将指定范围内的页面 sync 到存储</li><li><code>smgr_nblocks</code>：返回物理文件中的块数量</li><li><code>smgr_truncate</code>：将物理文件截断到指定块数量</li><li><code>smgr_immedsync</code>：立刻将表的所有页面 sync 到存储</li><li><code>smgr_registersync</code>：将表的所有页面标记为需要被 sync 到存储（但不立刻开始）</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * This struct of function pointers defines the API between smgr.c and</span>
<span class="line"> * any individual storage manager module.  Note that smgr subfunctions are</span>
<span class="line"> * generally expected to report problems via elog(ERROR).  An exception is</span>
<span class="line"> * that smgr_unlink should use elog(WARNING), rather than erroring out,</span>
<span class="line"> * because we normally unlink relations during post-commit/abort cleanup,</span>
<span class="line"> * and so it&#39;s too late to raise an error.  Also, various conditions that</span>
<span class="line"> * would normally be errors should be allowed during bootstrap and/or WAL</span>
<span class="line"> * recovery --- see comments in md.c for details.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">f_smgr</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_init<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">/* may be NULL */</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_shutdown<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">/* may be NULL */</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_open<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_close<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_create<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                bool isRedo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">bool</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_exists<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_unlink<span class="token punctuation">)</span> <span class="token punctuation">(</span>RelFileLocatorBackend rlocator<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                bool isRedo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_extend<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                BlockNumber blocknum<span class="token punctuation">,</span> <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>buffer<span class="token punctuation">,</span> bool skipFsync<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_zeroextend<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                    BlockNumber blocknum<span class="token punctuation">,</span> <span class="token keyword">int</span> nblocks<span class="token punctuation">,</span> bool skipFsync<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">bool</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_prefetch<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                  BlockNumber blocknum<span class="token punctuation">,</span> <span class="token keyword">int</span> nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_readv<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                               BlockNumber blocknum<span class="token punctuation">,</span></span>
<span class="line">                               <span class="token keyword">void</span> <span class="token operator">*</span><span class="token operator">*</span>buffers<span class="token punctuation">,</span> BlockNumber nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_writev<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                BlockNumber blocknum<span class="token punctuation">,</span></span>
<span class="line">                                <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span><span class="token operator">*</span>buffers<span class="token punctuation">,</span> BlockNumber nblocks<span class="token punctuation">,</span></span>
<span class="line">                                bool skipFsync<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_writeback<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                   BlockNumber blocknum<span class="token punctuation">,</span> BlockNumber nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">BlockNumber</span> <span class="token punctuation">(</span><span class="token operator">*</span>smgr_nblocks<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_truncate<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span></span>
<span class="line">                                  BlockNumber nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_immedsync<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>smgr_registersync<span class="token punctuation">)</span> <span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> f_smgr<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这套虚拟存储管理接口下，目前 PostgreSQL 内置只有一个物理存储管理引擎独苗——Magnetic Disk：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">const</span> f_smgr smgrsw<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* magnetic disk */</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_init <span class="token operator">=</span> mdinit<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_shutdown <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_open <span class="token operator">=</span> mdopen<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_close <span class="token operator">=</span> mdclose<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_create <span class="token operator">=</span> mdcreate<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_exists <span class="token operator">=</span> mdexists<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_unlink <span class="token operator">=</span> mdunlink<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_extend <span class="token operator">=</span> mdextend<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_zeroextend <span class="token operator">=</span> mdzeroextend<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_prefetch <span class="token operator">=</span> mdprefetch<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_readv <span class="token operator">=</span> mdreadv<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_writev <span class="token operator">=</span> mdwritev<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_writeback <span class="token operator">=</span> mdwriteback<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_nblocks <span class="token operator">=</span> mdnblocks<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_truncate <span class="token operator">=</span> mdtruncate<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_immedsync <span class="token operator">=</span> mdimmedsync<span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">.</span>smgr_registersync <span class="token operator">=</span> mdregistersync<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">const</span> <span class="token keyword">int</span> NSmgr <span class="token operator">=</span> <span class="token function">lengthof</span><span class="token punctuation">(</span>smgrsw<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>正如其名，这个物理存储管理引擎在 20 世纪 90 年代被设计为用于管理磁盘介质的非易失性存储（是真的 <strong>磁</strong> 盘）。与如今人们依旧非正式地用 <em>磁盘</em> 这个词指代已经更新迭代了不知道多少轮的非易失性存储介质一样，Magnetic Disk 引擎也依旧管理着这 20 多年来日新月异的所有存储设备。PostgreSQL 社区近年一直在不断完善和细化 Smgr 层的虚拟存储管理接口和对应的 Magnetic Disk 实现，但短期内确实不像是有第二个物理存储管理引擎要出现的样子。当然目前各类的 PostgreSQL-fork 产品层出不穷，面向特定场景实现一套新的物理存储管理引擎就完全是各个产品的自由了。比如面向全内存、压缩、加密，都可以通过这层接口定制物理存储管理的细节。</p><h2 id="implementation" tabindex="-1"><a class="header-anchor" href="#implementation"><span>Implementation</span></a></h2><p>有了对物理存储管理引擎的调用接口，在逻辑存储管理层还需要做哪些事？需要向更上层的其他数据库子模块提供什么样的接口？这些接口的用户都是哪些子模块？接下来逐个分析下逻辑存储管理层对外暴露的接口。</p><h3 id="smgrinit-smgrshutdown" tabindex="-1"><a class="header-anchor" href="#smgrinit-smgrshutdown"><span>smgrinit / smgrshutdown</span></a></h3><p>存储管理引擎的初始化和关闭接口，直接调用物理存储管理引擎的 <code>smgr_init</code> 和 <code>smgr_shutdown</code>。PostgreSQL 目前是多进程架构的数据库，存储管理的初始化和关闭发生在新进程被 PostMaster 主进程 fork 出来后的进程初始化阶段，是每个进程独立的动作。</p><h3 id="smgropen" tabindex="-1"><a class="header-anchor" href="#smgropen"><span>smgropen</span></a></h3><p>构造/复用一个 <code>SMgrRelationData</code> 存储层对象。这里并不意味着一定要在物理存储管理层打开一次物理文件：由于存储管理的初始化位于每一个进程内，每一个进程在私有内存中都会维护一张键值对为 <code>&lt;RelFileLocatorBackend, SMgrRelationData&gt;</code> 的哈希表，同时对其引用计数。因此进程对同一张表的重复 <code>smgropen</code> 不会重复创建 <code>SMgrRelationData</code> 结构，也不会在物理存储管理层反复打开物理文件。进程通常借助 RelCache 来调用 <code>smgropen</code>，并缓存对存储层对象的引用；当然一些后台进程及 DDL 操作也会绕开 RelCache 直接打开存储层对象。</p><p>根据 <a href="https://www.postgresql.org/message-id/flat/CA%2BhUKGJ8NTvqLHz6dqbQnt2c8XCki4r2QvXjBQcXpVwxTY_pvA%40mail.gmail.com" target="_blank" rel="noopener noreferrer">社区邮件</a> 的讨论，PostgreSQL 17 开始对被 <code>smgropen</code> 后的存储层对象有了明确的 <a href="https://github.com/postgres/postgres/commit/21d9c3ee4ef74e2229341d39811c97f85071c90a" target="_blank" rel="noopener noreferrer">生命周期定义</a>，保证事务结束前存储层对象不会失效。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgropen() -- Return an SMgrRelation object, creating it if need be.</span>
<span class="line"> *</span>
<span class="line"> * In versions of PostgreSQL prior to 17, this function returned an object</span>
<span class="line"> * with no defined lifetime.  Now, however, the object remains valid for the</span>
<span class="line"> * lifetime of the transaction, up to the point where AtEOXact_SMgr() is</span>
<span class="line"> * called, making it much easier for callers to know for how long they can</span>
<span class="line"> * hold on to a pointer to the returned object.  If this function is called</span>
<span class="line"> * outside of a transaction, the object remains valid until smgrdestroy() or</span>
<span class="line"> * smgrdestroyall() is called.  Background processes that use smgr but not</span>
<span class="line"> * transactions typically do this once per checkpoint cycle.</span>
<span class="line"> *</span>
<span class="line"> * This does not attempt to actually open the underlying files.</span>
<span class="line"> */</span></span>
<span class="line">SMgrRelation</span>
<span class="line"><span class="token function">smgropen</span><span class="token punctuation">(</span>RelFileLocator rlocator<span class="token punctuation">,</span> ProcNumber backend<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    RelFileLocatorBackend brlocator<span class="token punctuation">;</span></span>
<span class="line">    SMgrRelation reln<span class="token punctuation">;</span></span>
<span class="line">    bool        found<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">RelFileNumberIsValid</span><span class="token punctuation">(</span>rlocator<span class="token punctuation">.</span>relNumber<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>SMgrRelationHash <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* First time through: initialize the hash table */</span></span>
<span class="line">        HASHCTL     ctl<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        ctl<span class="token punctuation">.</span>keysize <span class="token operator">=</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>RelFileLocatorBackend<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        ctl<span class="token punctuation">.</span>entrysize <span class="token operator">=</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>SMgrRelationData<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        SMgrRelationHash <span class="token operator">=</span> <span class="token function">hash_create</span><span class="token punctuation">(</span><span class="token string">&quot;smgr relation table&quot;</span><span class="token punctuation">,</span> <span class="token number">400</span><span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token operator">&amp;</span>ctl<span class="token punctuation">,</span> HASH_ELEM <span class="token operator">|</span> HASH_BLOBS<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">dlist_init</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>unpinned_relns<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Look up or create an entry */</span></span>
<span class="line">    brlocator<span class="token punctuation">.</span>locator <span class="token operator">=</span> rlocator<span class="token punctuation">;</span></span>
<span class="line">    brlocator<span class="token punctuation">.</span>backend <span class="token operator">=</span> backend<span class="token punctuation">;</span></span>
<span class="line">    reln <span class="token operator">=</span> <span class="token punctuation">(</span>SMgrRelation<span class="token punctuation">)</span> <span class="token function">hash_search</span><span class="token punctuation">(</span>SMgrRelationHash<span class="token punctuation">,</span></span>
<span class="line">                                      <span class="token operator">&amp;</span>brlocator<span class="token punctuation">,</span></span>
<span class="line">                                      HASH_ENTER<span class="token punctuation">,</span> <span class="token operator">&amp;</span>found<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Initialize it if not present before */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>found<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* hash_search already filled in the lookup key */</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_targblock <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span></span>
<span class="line">            reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_which <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>   <span class="token comment">/* we only have md.c at present */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* implementation-specific initialization */</span></span>
<span class="line">        smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_open</span><span class="token punctuation">(</span>reln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* it is not pinned yet */</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>pincount <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">dlist_push_tail</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>unpinned_relns<span class="token punctuation">,</span> <span class="token operator">&amp;</span>reln<span class="token operator">-&gt;</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> reln<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrpin-smgrunpin" tabindex="-1"><a class="header-anchor" href="#smgrpin-smgrunpin"><span>smgrpin / smgrunpin</span></a></h3><p>增加或减少对存储层对象的引用计数。引用计数为 0 的存储层对象将会在事务结束时被销毁。其使用者为 RelCache。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * RelationGetSmgr</span>
<span class="line"> *      Returns smgr file handle for a relation, opening it if needed.</span>
<span class="line"> *</span>
<span class="line"> * Very little code is authorized to touch rel-&gt;rd_smgr directly.  Instead</span>
<span class="line"> * use this function to fetch its value.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> SMgrRelation</span>
<span class="line"><span class="token function">RelationGetSmgr</span><span class="token punctuation">(</span>Relation rel<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">unlikely</span><span class="token punctuation">(</span>rel<span class="token operator">-&gt;</span>rd_smgr <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        rel<span class="token operator">-&gt;</span>rd_smgr <span class="token operator">=</span> <span class="token function">smgropen</span><span class="token punctuation">(</span>rel<span class="token operator">-&gt;</span>rd_locator<span class="token punctuation">,</span> rel<span class="token operator">-&gt;</span>rd_backend<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">smgrpin</span><span class="token punctuation">(</span>rel<span class="token operator">-&gt;</span>rd_smgr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> rel<span class="token operator">-&gt;</span>rd_smgr<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * RelationCloseSmgr</span>
<span class="line"> *      Close the relation at the smgr level, if not already done.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">RelationCloseSmgr</span><span class="token punctuation">(</span>Relation relation<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>relation<span class="token operator">-&gt;</span>rd_smgr <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">smgrunpin</span><span class="token punctuation">(</span>relation<span class="token operator">-&gt;</span>rd_smgr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">smgrclose</span><span class="token punctuation">(</span>relation<span class="token operator">-&gt;</span>rd_smgr<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        relation<span class="token operator">-&gt;</span>rd_smgr <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrclose-smgrrelease-smgrreleaserellocator-smgrreleaseall" tabindex="-1"><a class="header-anchor" href="#smgrclose-smgrrelease-smgrreleaserellocator-smgrreleaseall"><span>smgrclose / smgrrelease / smgrreleaserellocator / smgrreleaseall</span></a></h3><p>通过 <code>smgr_close</code> 关闭（特定/所有）存储层对象所打开的物理文件，但保留存储层对象不被销毁。其使用者为对存储层的操作已经结束或 RelCache 失效时的处理逻辑中。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrclose() -- Close an SMgrRelation object.</span>
<span class="line"> *</span>
<span class="line"> * The SMgrRelation reference should not be used after this call.  However,</span>
<span class="line"> * because we don&#39;t keep track of the references returned by smgropen(), we</span>
<span class="line"> * don&#39;t know if there are other references still pointing to the same object,</span>
<span class="line"> * so we cannot remove the SMgrRelation object yet.  Therefore, this is just a</span>
<span class="line"> * synonym for smgrrelease() at the moment.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrclose</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">smgrrelease</span><span class="token punctuation">(</span>reln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrrelease() -- Release all resources used by this object.</span>
<span class="line"> *</span>
<span class="line"> * The object remains valid.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrrelease</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>ForkNumber forknum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> forknum <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> forknum<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_close</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    reln<span class="token operator">-&gt;</span>smgr_targblock <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrreleaserellocator() -- Release resources for given RelFileLocator, if</span>
<span class="line"> *                            it&#39;s open.</span>
<span class="line"> *</span>
<span class="line"> * This has the same effects as smgrrelease(smgropen(rlocator)), but avoids</span>
<span class="line"> * uselessly creating a hashtable entry only to drop it again when no</span>
<span class="line"> * such entry exists already.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrreleaserellocator</span><span class="token punctuation">(</span>RelFileLocatorBackend rlocator<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    SMgrRelation reln<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Nothing to do if hashtable not set up */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>SMgrRelationHash <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    reln <span class="token operator">=</span> <span class="token punctuation">(</span>SMgrRelation<span class="token punctuation">)</span> <span class="token function">hash_search</span><span class="token punctuation">(</span>SMgrRelationHash<span class="token punctuation">,</span></span>
<span class="line">                                      <span class="token operator">&amp;</span>rlocator<span class="token punctuation">,</span></span>
<span class="line">                                      HASH_FIND<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>reln <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">smgrrelease</span><span class="token punctuation">(</span>reln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrreleaseall() -- Release resources used by all objects.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrreleaseall</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    HASH_SEQ_STATUS status<span class="token punctuation">;</span></span>
<span class="line">    SMgrRelation reln<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Nothing to do if hashtable not set up */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>SMgrRelationHash <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">hash_seq_init</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>status<span class="token punctuation">,</span> SMgrRelationHash<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>reln <span class="token operator">=</span> <span class="token punctuation">(</span>SMgrRelation<span class="token punctuation">)</span> <span class="token function">hash_seq_search</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>status<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">smgrrelease</span><span class="token punctuation">(</span>reln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrdestroyall" tabindex="-1"><a class="header-anchor" href="#smgrdestroyall"><span>smgrdestroyall</span></a></h3><p>对于所有未被 pin 住的存储层对象，不仅关闭其物理文件，还销毁存储层对象本身。其使用者为事务结束时，或做完 CHECKPOINT 后。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrdestroy() -- Delete an SMgrRelation object.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrdestroy</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ForkNumber  forknum<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>reln<span class="token operator">-&gt;</span>pincount <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>forknum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> forknum <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> forknum<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_close</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">dlist_delete</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>reln<span class="token operator">-&gt;</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">hash_search</span><span class="token punctuation">(</span>SMgrRelationHash<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token operator">&amp;</span><span class="token punctuation">(</span>reln<span class="token operator">-&gt;</span>smgr_rlocator<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                    HASH_REMOVE<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;SMgrRelation hashtable corrupted&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrdestroyall() -- Release resources used by all unpinned objects.</span>
<span class="line"> *</span>
<span class="line"> * It must be known that there are no pointers to SMgrRelations, other than</span>
<span class="line"> * those pinned with smgrpin().</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrdestroyall</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    dlist_mutable_iter iter<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Zap all unpinned SMgrRelations.  We rely on smgrdestroy() to remove</span>
<span class="line">     * each one from the list.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">dlist_foreach_modify</span><span class="token punctuation">(</span>iter<span class="token punctuation">,</span> <span class="token operator">&amp;</span>unpinned_relns<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        SMgrRelation rel <span class="token operator">=</span> <span class="token function">dlist_container</span><span class="token punctuation">(</span>SMgrRelationData<span class="token punctuation">,</span> node<span class="token punctuation">,</span></span>
<span class="line">                                           iter<span class="token punctuation">.</span>cur<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">smgrdestroy</span><span class="token punctuation">(</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * AtEOXact_SMgr</span>
<span class="line"> *</span>
<span class="line"> * This routine is called during transaction commit or abort (it doesn&#39;t</span>
<span class="line"> * particularly care which).  All unpinned SMgrRelation objects are destroyed.</span>
<span class="line"> *</span>
<span class="line"> * We do this as a compromise between wanting transient SMgrRelations to</span>
<span class="line"> * live awhile (to amortize the costs of blind writes of multiple blocks)</span>
<span class="line"> * and needing them to not live forever (since we&#39;re probably holding open</span>
<span class="line"> * a kernel file descriptor for the underlying file, and we need to ensure</span>
<span class="line"> * that gets closed reasonably soon if the file gets deleted).</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">AtEOXact_SMgr</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">smgrdestroyall</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrexists-smgrcreate" tabindex="-1"><a class="header-anchor" href="#smgrexists-smgrcreate"><span>smgrexists / smgrcreate</span></a></h3><p>判断对应的物理文件是否存在 / 创建对应的物理文件。通常一起使用。其使用者为创建数据库、创建表、创建索引以及对应的 WAL 日志回放逻辑中。</p><h3 id="smgrimmedsync-smgrdosyncall" tabindex="-1"><a class="header-anchor" href="#smgrimmedsync-smgrdosyncall"><span>smgrimmedsync / smgrdosyncall</span></a></h3><p>使特定表在内存中的 buffer 全部写入文件，然后立刻 sync 到存储上。其使用者为事务结束时或者批量导入结束时。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrimmedsync() -- Force the specified relation to stable storage.</span>
<span class="line"> *</span>
<span class="line"> * Synchronously force all previous writes to the specified relation</span>
<span class="line"> * down to disk.</span>
<span class="line"> *</span>
<span class="line"> * This is useful for building completely new relations (eg, new</span>
<span class="line"> * indexes).  Instead of incrementally WAL-logging the index build</span>
<span class="line"> * steps, we can just write completed index pages to disk with smgrwrite</span>
<span class="line"> * or smgrextend, and then fsync the completed index file before</span>
<span class="line"> * committing the transaction.  (This is sufficient for purposes of</span>
<span class="line"> * crash recovery, since it effectively duplicates forcing a checkpoint</span>
<span class="line"> * for the completed index.  But it is *not* sufficient if one wishes</span>
<span class="line"> * to use the WAL log for PITR or replication purposes: in that case</span>
<span class="line"> * we have to make WAL entries as well.)</span>
<span class="line"> *</span>
<span class="line"> * The preceding writes should specify skipFsync = true to avoid</span>
<span class="line"> * duplicative fsyncs.</span>
<span class="line"> *</span>
<span class="line"> * Note that you need to do FlushRelationBuffers() first if there is</span>
<span class="line"> * any possibility that there are dirty buffers for the relation;</span>
<span class="line"> * otherwise the sync is not very meaningful.</span>
<span class="line"> *</span>
<span class="line"> * Most callers should use the bulk loading facility in bulk_write.c</span>
<span class="line"> * instead of calling this directly.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrimmedsync</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_immedsync</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrdosyncall() -- Immediately sync all forks of all given relations</span>
<span class="line"> *</span>
<span class="line"> * All forks of all given relations are synced out to the store.</span>
<span class="line"> *</span>
<span class="line"> * This is equivalent to FlushRelationBuffers() for each smgr relation,</span>
<span class="line"> * then calling smgrimmedsync() for all forks of each relation, but it&#39;s</span>
<span class="line"> * significantly quicker so should be preferred when possible.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrdosyncall</span><span class="token punctuation">(</span>SMgrRelation <span class="token operator">*</span>rels<span class="token punctuation">,</span> <span class="token keyword">int</span> nrels<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    ForkNumber  forknum<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>nrels <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">FlushRelationsAllBuffers</span><span class="token punctuation">(</span>rels<span class="token punctuation">,</span> nrels<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Sync the physical file(s).</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nrels<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span>         which <span class="token operator">=</span> rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>forknum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> forknum <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> forknum<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>smgrsw<span class="token punctuation">[</span>which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_exists</span><span class="token punctuation">(</span>rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                smgrsw<span class="token punctuation">[</span>which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_immedsync</span><span class="token punctuation">(</span>rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrwriteback" tabindex="-1"><a class="header-anchor" href="#smgrwriteback"><span>smgrwriteback</span></a></h3><p>将某个表的特定数据块 sync 到存储上。其使用者为将 Buffer Cache 中的脏页刷回存储时。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrwriteback() -- Trigger kernel writeback for the supplied range of</span>
<span class="line"> *                     blocks.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrwriteback</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span> BlockNumber blocknum<span class="token punctuation">,</span></span>
<span class="line">              BlockNumber nblocks<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_writeback</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">,</span> blocknum<span class="token punctuation">,</span></span>
<span class="line">                                            nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrregistersync" tabindex="-1"><a class="header-anchor" href="#smgrregistersync"><span>smgrregistersync</span></a></h3><p>将特定表注册到下一次 CHECKPOINT 要 sync 到存储的对象中。其使用者目前为批量导入。</p><h3 id="smgrdounlinkall" tabindex="-1"><a class="header-anchor" href="#smgrdounlinkall"><span>smgrdounlinkall</span></a></h3><p>立刻删除所有给定表对应的所有物理文件。其使用者为事务结束时删除不再需要的表文件</p><p>首先从 Buffer Cache 中清除待删除表对应的 buffer，然后解除对所有待清除表物理文件的引用，同时也同步向其它进程发送消息解除对该存储层对象的引用，最终删除物理文件。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrdounlinkall() -- Immediately unlink all forks of all given relations</span>
<span class="line"> *</span>
<span class="line"> * All forks of all given relations are removed from the store.  This</span>
<span class="line"> * should not be used during transactional operations, since it can&#39;t be</span>
<span class="line"> * undone.</span>
<span class="line"> *</span>
<span class="line"> * If isRedo is true, it is okay for the underlying file(s) to be gone</span>
<span class="line"> * already.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrdounlinkall</span><span class="token punctuation">(</span>SMgrRelation <span class="token operator">*</span>rels<span class="token punctuation">,</span> <span class="token keyword">int</span> nrels<span class="token punctuation">,</span> bool isRedo<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    RelFileLocatorBackend <span class="token operator">*</span>rlocators<span class="token punctuation">;</span></span>
<span class="line">    ForkNumber  forknum<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>nrels <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Get rid of any remaining buffers for the relations.  bufmgr will just</span>
<span class="line">     * drop them without bothering to write the contents.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">DropRelationsAllBuffers</span><span class="token punctuation">(</span>rels<span class="token punctuation">,</span> nrels<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * create an array which contains all relations to be dropped, and close</span>
<span class="line">     * each relation&#39;s forks at the smgr level while at it</span>
<span class="line">     */</span></span>
<span class="line">    rlocators <span class="token operator">=</span> <span class="token function">palloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span>RelFileLocatorBackend<span class="token punctuation">)</span> <span class="token operator">*</span> nrels<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nrels<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        RelFileLocatorBackend rlocator <span class="token operator">=</span> rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>smgr_rlocator<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span>         which <span class="token operator">=</span> rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        rlocators<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> rlocator<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Close the forks at smgr level */</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>forknum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> forknum <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> forknum<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">            smgrsw<span class="token punctuation">[</span>which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_close</span><span class="token punctuation">(</span>rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Send a shared-inval message to force other backends to close any</span>
<span class="line">     * dangling smgr references they may have for these rels.  We should do</span>
<span class="line">     * this before starting the actual unlinking, in case we fail partway</span>
<span class="line">     * through that step.  Note that the sinval messages will eventually come</span>
<span class="line">     * back to this backend, too, and thereby provide a backstop that we</span>
<span class="line">     * closed our own smgr rel.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nrels<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">CacheInvalidateSmgr</span><span class="token punctuation">(</span>rlocators<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Delete the physical file(s).</span>
<span class="line">     *</span>
<span class="line">     * Note: smgr_unlink must treat deletion failure as a WARNING, not an</span>
<span class="line">     * ERROR, because we&#39;ve already decided to commit or abort the current</span>
<span class="line">     * xact.</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nrels<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span>         which <span class="token operator">=</span> rels<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>forknum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> forknum <span class="token operator">&lt;=</span> MAX_FORKNUM<span class="token punctuation">;</span> forknum<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">            smgrsw<span class="token punctuation">[</span>which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_unlink</span><span class="token punctuation">(</span>rlocators<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> forknum<span class="token punctuation">,</span> isRedo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">pfree</span><span class="token punctuation">(</span>rlocators<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrextend-smgrzeroextend" tabindex="-1"><a class="header-anchor" href="#smgrextend-smgrzeroextend"><span>smgrextend / smgrzeroextend</span></a></h3><p>用于将特定表的特定文件扩展到指定长度，语义上认为扩展后的文件在文件结尾之前的内容都是 0。其使用者为批量导入、缓冲区管理层分配新 buffer。</p><p><code>smgrzeroextend</code> 是 PostgreSQL 16 中 <a href="https://github.com/postgres/postgres/commit/4d330a61bb1969df31f2cebfe1ba9d1d004346d8" target="_blank" rel="noopener noreferrer">新引入的接口</a>，相比于 <code>smgrextend</code> 一次只能扩展一个页面，<code>smgrzeroextend</code> 可以一次扩展多个页面。根据 <a href="https://www.postgresql.org/message-id/flat/20221029025420.eplyow6k7tgu6he3%40awork3.anarazel.de" target="_blank" rel="noopener noreferrer">社区邮件</a> 的讨论，<code>smgrzeroextend</code> 使用 <code>posix_fallocate()</code> 扩展页面，不会在 OS page cache 中产生脏页。另外一次扩展多个页面能够降低扩展物理文件时的加锁冲突。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrextend() -- Add a new block to a file.</span>
<span class="line"> *</span>
<span class="line"> * The semantics are nearly the same as smgrwrite(): write at the</span>
<span class="line"> * specified position.  However, this is to be used for the case of</span>
<span class="line"> * extending a relation (i.e., blocknum is at or beyond the current</span>
<span class="line"> * EOF).  Note that we assume writing a block beyond current EOF</span>
<span class="line"> * causes intervening file space to become filled with zeroes.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrextend</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span> BlockNumber blocknum<span class="token punctuation">,</span></span>
<span class="line">           <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>buffer<span class="token punctuation">,</span> bool skipFsync<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_extend</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">,</span> blocknum<span class="token punctuation">,</span></span>
<span class="line">                                         buffer<span class="token punctuation">,</span> skipFsync<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Normally we expect this to increase nblocks by one, but if the cached</span>
<span class="line">     * value isn&#39;t as expected, just invalidate it so the next call asks the</span>
<span class="line">     * kernel.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">==</span> blocknum<span class="token punctuation">)</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> blocknum <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrzeroextend() -- Add new zeroed out blocks to a file.</span>
<span class="line"> *</span>
<span class="line"> * Similar to smgrextend(), except the relation can be extended by</span>
<span class="line"> * multiple blocks at once and the added blocks will be filled with</span>
<span class="line"> * zeroes.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrzeroextend</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">,</span> BlockNumber blocknum<span class="token punctuation">,</span></span>
<span class="line">               <span class="token keyword">int</span> nblocks<span class="token punctuation">,</span> bool skipFsync<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_zeroextend</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">,</span> blocknum<span class="token punctuation">,</span></span>
<span class="line">                                             nblocks<span class="token punctuation">,</span> skipFsync<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Normally we expect this to increase the fork size by nblocks, but if</span>
<span class="line">     * the cached value isn&#39;t as expected, just invalidate it so the next call</span>
<span class="line">     * asks the kernel.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">==</span> blocknum<span class="token punctuation">)</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> blocknum <span class="token operator">+</span> nblocks<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrtruncate" tabindex="-1"><a class="header-anchor" href="#smgrtruncate"><span>smgrtruncate</span></a></h3><p>将指定表的文件截断到指定长度。其使用者为 VACUUM，在做完对表或索引的清理后，截断物理文件尾部的未使用空间。</p><p>首先从 Buffer Cache 中清除待删除的文件块对应的 buffer，同时也同步向其它进程发送消息解除对该存储对象的引用，最终截断物理文件。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrtruncate() -- Truncate the given forks of supplied relation to</span>
<span class="line"> *                   each specified numbers of blocks</span>
<span class="line"> *</span>
<span class="line"> * The truncation is done immediately, so this can&#39;t be rolled back.</span>
<span class="line"> *</span>
<span class="line"> * The caller must hold AccessExclusiveLock on the relation, to ensure that</span>
<span class="line"> * other backends receive the smgr invalidation event that this function sends</span>
<span class="line"> * before they access any forks of the relation again.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">smgrtruncate</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber <span class="token operator">*</span>forknum<span class="token punctuation">,</span> <span class="token keyword">int</span> nforks<span class="token punctuation">,</span> BlockNumber <span class="token operator">*</span>nblocks<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Get rid of any buffers for the about-to-be-deleted blocks. bufmgr will</span>
<span class="line">     * just drop them without bothering to write the contents.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">DropRelationBuffers</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">,</span> nforks<span class="token punctuation">,</span> nblocks<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Send a shared-inval message to force other backends to close any smgr</span>
<span class="line">     * references they may have for this rel.  This is useful because they</span>
<span class="line">     * might have open file pointers to segments that got removed, and/or</span>
<span class="line">     * smgr_targblock variables pointing past the new rel end.  (The inval</span>
<span class="line">     * message will come back to our backend, too, causing a</span>
<span class="line">     * probably-unnecessary local smgr flush.  But we don&#39;t expect that this</span>
<span class="line">     * is a performance-critical path.)  As in the unlink code, we want to be</span>
<span class="line">     * sure the message is sent before we start changing things on-disk.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">CacheInvalidateSmgr</span><span class="token punctuation">(</span>reln<span class="token operator">-&gt;</span>smgr_rlocator<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Do the truncation */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nforks<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Make the cached size is invalid if we encounter an error. */</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_truncate</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> nblocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We might as well update the local smgr_cached_nblocks values. The</span>
<span class="line">         * smgr cache inval message that this function sent will cause other</span>
<span class="line">         * backends to invalidate their copies of smgr_fsm_nblocks and</span>
<span class="line">         * smgr_vm_nblocks, and these ones too at the next command boundary.</span>
<span class="line">         * But these ensure they aren&#39;t outright wrong until then.</span>
<span class="line">         */</span></span>
<span class="line">        reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> nblocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="smgrreadv-smgrwritev" tabindex="-1"><a class="header-anchor" href="#smgrreadv-smgrwritev"><span>smgrreadv / smgrwritev</span></a></h3><p>向量化地读取或写入一定范围的 buffer。其使用者为缓冲区管理模块，更上层使用者为需要一次读取多个 buffer 的场景，比如顺序扫描。</p><h3 id="smgrnblocks-smgrnblocks-cached" tabindex="-1"><a class="header-anchor" href="#smgrnblocks-smgrnblocks-cached"><span>smgrnblocks / smgrnblocks_cached</span></a></h3><p>获取物理文件中的数据块数量，本质上为获取文件长度后除以数据块大小。其使用者为：</p><ul><li>缓冲区管理模块读取数据块时</li><li>物理文件的拷贝/扩展时</li><li>优化器的代价估算时</li></ul><p><code>smgrnblocks</code> 会将结果缓存在进程私有内存中，<code>smgrnblocks_cached</code> 将会直接返回上一次调用 <code>smgrnblocks</code> 的缓存值。根据 <a href="https://www.postgresql.org/message-id/flat/CAEepm%3D3SSw-Ty1DFcK%3D1rU-K6GSzYzfdD4d%2BZwapdN7dTa6%3DnQ%40mail.gmail.com" target="_blank" rel="noopener noreferrer">社区邮件</a> 的讨论，频繁调用 <code>smgrnblocks</code>（本质上是对物理文件的 <code>lseek(SEEK_END)</code>）将会对性能有一定影响，但目前又缺少文件长度发生变化时的同步机制，所以暂时只在 <a href="https://github.com/postgres/postgres/commit/c5315f4f44843c20ada876fdb0d0828795dfbdf5" target="_blank" rel="noopener noreferrer">recovery 阶段使用缓存值</a>，因为此时是单进程执行的。在文件大小发生变化的存储管理层接口中（extend / truncate），也需要同步更新这个缓存值，或直接使这个缓存值失效。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrnblocks() -- Calculate the number of blocks in the</span>
<span class="line"> *                  supplied relation.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber</span>
<span class="line"><span class="token function">smgrnblocks</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    BlockNumber result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Check and return if we get the cached value for the number of blocks. */</span></span>
<span class="line">    result <span class="token operator">=</span> <span class="token function">smgrnblocks_cached</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>result <span class="token operator">!=</span> InvalidBlockNumber<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    result <span class="token operator">=</span> smgrsw<span class="token punctuation">[</span>reln<span class="token operator">-&gt;</span>smgr_which<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">smgr_nblocks</span><span class="token punctuation">(</span>reln<span class="token punctuation">,</span> forknum<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">=</span> result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * smgrnblocks_cached() -- Get the cached number of blocks in the supplied</span>
<span class="line"> *                         relation.</span>
<span class="line"> *</span>
<span class="line"> * Returns an InvalidBlockNumber when not in recovery and when the relation</span>
<span class="line"> * fork size is not cached.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber</span>
<span class="line"><span class="token function">smgrnblocks_cached</span><span class="token punctuation">(</span>SMgrRelation reln<span class="token punctuation">,</span> ForkNumber forknum<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * For now, this function uses cached values only in recovery due to lack</span>
<span class="line">     * of a shared invalidation mechanism for changes in file size.  Code</span>
<span class="line">     * elsewhere reads smgr_cached_nblocks and copes with stale data.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>InRecovery <span class="token operator">&amp;&amp;</span> reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span> <span class="token operator">!=</span> InvalidBlockNumber<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> reln<span class="token operator">-&gt;</span>smgr_cached_nblocks<span class="token punctuation">[</span>forknum<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另一个很有意思的讨论发生在 2011 年，Robert Haas 发起了对获取文件长度使用 <code>lseek</code> 还是 <code>fstat</code> 更快的 <a href="https://www.postgresql.org/message-id/flat/CA%2BTgmoawRfpan35wzvgHkSJ0%2Bi-W%3DVkJpKnRxK2kTDR%2BHsanWA%40mail.gmail.com" target="_blank" rel="noopener noreferrer">讨论</a>。两者都能够达到获取文件长度的目的，但他在测试中发现 <code>lseek</code> 在并发数较高场景下扩展性差于 <code>fstat</code>。同年，Intel 的工程师 Andi Kleen 向 Linux VFS 提交了优化 <code>lseek</code> 加锁模式的 <a href="https://lore.kernel.org/linux-fsdevel/1314046152-2175-3-git-send-email-andi@firstfloor.org/" target="_blank" rel="noopener noreferrer">补丁</a>，对于 <code>SEEK_END</code> 不再需要加锁：</p><blockquote><p>SEEK_END: This behaves like SEEK_SET plus it reads the maximum size too. Reading the maximum size would have the 32bit atomic problem. But luckily we already have a way to read the maximum size without locking (i_size_read), so we can just use that instead.</p><p> </p><p>Without i_mutex there is no synchronization with write() anymore, however since the write() update is atomic on 64bit it just behaves like another racy SEEK_SET. On non atomic 32bit it&#39;s the same as SEEK_SET.</p><p> </p><p>=&gt; Don&#39;t need a lock, but need to use i_size_read()</p></blockquote><p>对照看了下目前最新的 Linux kernel 代码依旧如此，对于 <code>SEEK_END</code> 不再需要对 inode 加锁了。如下代码片段严格遵循 Linux kernel 一个 Tab 等于八个空格的代码风格：</p><div class="language-c" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * ext4_llseek() handles both block-mapped and extent-mapped maxbytes values</span>
<span class="line"> * by calling generic_file_llseek_size() with the appropriate maxbytes</span>
<span class="line"> * value for each.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">loff_t</span> <span class="token function">ext4_llseek</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">file</span> <span class="token operator">*</span>file<span class="token punctuation">,</span> <span class="token class-name">loff_t</span> offset<span class="token punctuation">,</span> <span class="token keyword">int</span> whence<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">struct</span> <span class="token class-name">inode</span> <span class="token operator">*</span>inode <span class="token operator">=</span> file<span class="token operator">-&gt;</span>f_mapping<span class="token operator">-&gt;</span>host<span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">loff_t</span> maxbytes<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span><span class="token function">ext4_test_inode_flag</span><span class="token punctuation">(</span>inode<span class="token punctuation">,</span> EXT4_INODE_EXTENTS<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                maxbytes <span class="token operator">=</span> <span class="token function">EXT4_SB</span><span class="token punctuation">(</span>inode<span class="token operator">-&gt;</span>i_sb<span class="token punctuation">)</span><span class="token operator">-&gt;</span>s_bitmap_maxbytes<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">                maxbytes <span class="token operator">=</span> inode<span class="token operator">-&gt;</span>i_sb<span class="token operator">-&gt;</span>s_maxbytes<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>whence<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token function">generic_file_llseek_size</span><span class="token punctuation">(</span>file<span class="token punctuation">,</span> offset<span class="token punctuation">,</span> whence<span class="token punctuation">,</span></span>
<span class="line">                                                maxbytes<span class="token punctuation">,</span> <span class="token function">i_size_read</span><span class="token punctuation">(</span>inode<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> SEEK_HOLE<span class="token operator">:</span></span>
<span class="line">                <span class="token function">inode_lock_shared</span><span class="token punctuation">(</span>inode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                offset <span class="token operator">=</span> <span class="token function">iomap_seek_hole</span><span class="token punctuation">(</span>inode<span class="token punctuation">,</span> offset<span class="token punctuation">,</span></span>
<span class="line">                                         <span class="token operator">&amp;</span>ext4_iomap_report_ops<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">inode_unlock_shared</span><span class="token punctuation">(</span>inode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> SEEK_DATA<span class="token operator">:</span></span>
<span class="line">                <span class="token function">inode_lock_shared</span><span class="token punctuation">(</span>inode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                offset <span class="token operator">=</span> <span class="token function">iomap_seek_data</span><span class="token punctuation">(</span>inode<span class="token punctuation">,</span> offset<span class="token punctuation">,</span></span>
<span class="line">                                         <span class="token operator">&amp;</span>ext4_iomap_report_ops<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">inode_unlock_shared</span><span class="token punctuation">(</span>inode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>offset <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> offset<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">vfs_setpos</span><span class="token punctuation">(</span>file<span class="token punctuation">,</span> offset<span class="token punctuation">,</span> maxbytes<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/**</span>
<span class="line"> * generic_file_llseek_size - generic llseek implementation for regular files</span>
<span class="line"> * @file:       file structure to seek on</span>
<span class="line"> * @offset:     file offset to seek to</span>
<span class="line"> * @whence:     type of seek</span>
<span class="line"> * @maxsize:    max size of this file in file system</span>
<span class="line"> * @eof:        offset used for SEEK_END position</span>
<span class="line"> *</span>
<span class="line"> * This is a variant of generic_file_llseek that allows passing in a custom</span>
<span class="line"> * maximum file size and a custom EOF position, for e.g. hashed directories</span>
<span class="line"> *</span>
<span class="line"> * Synchronization:</span>
<span class="line"> * SEEK_SET and SEEK_END are unsynchronized (but atomic on 64bit platforms)</span>
<span class="line"> * SEEK_CUR is synchronized against other SEEK_CURs, but not read/writes.</span>
<span class="line"> * read/writes behave like SEEK_SET against seeks.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">loff_t</span></span>
<span class="line"><span class="token function">generic_file_llseek_size</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">file</span> <span class="token operator">*</span>file<span class="token punctuation">,</span> <span class="token class-name">loff_t</span> offset<span class="token punctuation">,</span> <span class="token keyword">int</span> whence<span class="token punctuation">,</span></span>
<span class="line">                <span class="token class-name">loff_t</span> maxsize<span class="token punctuation">,</span> <span class="token class-name">loff_t</span> eof<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>whence<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">case</span> <span class="token constant">SEEK_END</span><span class="token operator">:</span></span>
<span class="line">                offset <span class="token operator">+=</span> eof<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> <span class="token constant">SEEK_CUR</span><span class="token operator">:</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * Here we special-case the lseek(fd, 0, SEEK_CUR)</span>
<span class="line">                 * position-querying operation.  Avoid rewriting the &quot;same&quot;</span>
<span class="line">                 * f_pos value back to the file because a concurrent read(),</span>
<span class="line">                 * write() or lseek() might have altered it</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>offset <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">                        <span class="token keyword">return</span> file<span class="token operator">-&gt;</span>f_pos<span class="token punctuation">;</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * f_lock protects against read/modify/write race with other</span>
<span class="line">                 * SEEK_CURs. Note that parallel writes and reads behave</span>
<span class="line">                 * like SEEK_SET.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token function">spin_lock</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>file<span class="token operator">-&gt;</span>f_lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                offset <span class="token operator">=</span> <span class="token function">vfs_setpos</span><span class="token punctuation">(</span>file<span class="token punctuation">,</span> file<span class="token operator">-&gt;</span>f_pos <span class="token operator">+</span> offset<span class="token punctuation">,</span> maxsize<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">spin_unlock</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>file<span class="token operator">-&gt;</span>f_lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">return</span> offset<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> SEEK_DATA<span class="token operator">:</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * In the generic case the entire file is data, so as long as</span>
<span class="line">                 * offset isn&#39;t at the end of the file then the offset is data.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">long</span> <span class="token keyword">long</span><span class="token punctuation">)</span>offset <span class="token operator">&gt;=</span> eof<span class="token punctuation">)</span></span>
<span class="line">                        <span class="token keyword">return</span> <span class="token operator">-</span>ENXIO<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> SEEK_HOLE<span class="token operator">:</span></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * There is a virtual hole at the end of the file, so as long as</span>
<span class="line">                 * offset isn&#39;t i_size or larger, return i_size.</span>
<span class="line">                 */</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">long</span> <span class="token keyword">long</span><span class="token punctuation">)</span>offset <span class="token operator">&gt;=</span> eof<span class="token punctuation">)</span></span>
<span class="line">                        <span class="token keyword">return</span> <span class="token operator">-</span>ENXIO<span class="token punctuation">;</span></span>
<span class="line">                offset <span class="token operator">=</span> eof<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">vfs_setpos</span><span class="token punctuation">(</span>file<span class="token punctuation">,</span> offset<span class="token punctuation">,</span> maxsize<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token function">EXPORT_SYMBOL</span><span class="token punctuation">(</span>generic_file_llseek_size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div>`,66)]))}const o=s(l,[["render",t],["__file","PostgreSQL Storage Management.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Storage%20Management.html","title":"PostgreSQL - Storage Management","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Virtual Storage Management Interface","slug":"virtual-storage-management-interface","link":"#virtual-storage-management-interface","children":[]},{"level":2,"title":"Implementation","slug":"implementation","link":"#implementation","children":[{"level":3,"title":"smgrinit / smgrshutdown","slug":"smgrinit-smgrshutdown","link":"#smgrinit-smgrshutdown","children":[]},{"level":3,"title":"smgropen","slug":"smgropen","link":"#smgropen","children":[]},{"level":3,"title":"smgrpin / smgrunpin","slug":"smgrpin-smgrunpin","link":"#smgrpin-smgrunpin","children":[]},{"level":3,"title":"smgrclose / smgrrelease / smgrreleaserellocator / smgrreleaseall","slug":"smgrclose-smgrrelease-smgrreleaserellocator-smgrreleaseall","link":"#smgrclose-smgrrelease-smgrreleaserellocator-smgrreleaseall","children":[]},{"level":3,"title":"smgrdestroyall","slug":"smgrdestroyall","link":"#smgrdestroyall","children":[]},{"level":3,"title":"smgrexists / smgrcreate","slug":"smgrexists-smgrcreate","link":"#smgrexists-smgrcreate","children":[]},{"level":3,"title":"smgrimmedsync / smgrdosyncall","slug":"smgrimmedsync-smgrdosyncall","link":"#smgrimmedsync-smgrdosyncall","children":[]},{"level":3,"title":"smgrwriteback","slug":"smgrwriteback","link":"#smgrwriteback","children":[]},{"level":3,"title":"smgrregistersync","slug":"smgrregistersync","link":"#smgrregistersync","children":[]},{"level":3,"title":"smgrdounlinkall","slug":"smgrdounlinkall","link":"#smgrdounlinkall","children":[]},{"level":3,"title":"smgrextend / smgrzeroextend","slug":"smgrextend-smgrzeroextend","link":"#smgrextend-smgrzeroextend","children":[]},{"level":3,"title":"smgrtruncate","slug":"smgrtruncate","link":"#smgrtruncate","children":[]},{"level":3,"title":"smgrreadv / smgrwritev","slug":"smgrreadv-smgrwritev","link":"#smgrreadv-smgrwritev","children":[]},{"level":3,"title":"smgrnblocks / smgrnblocks_cached","slug":"smgrnblocks-smgrnblocks-cached","link":"#smgrnblocks-smgrnblocks-cached","children":[]}]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Storage Management.md"}');export{o as comp,r as data};
