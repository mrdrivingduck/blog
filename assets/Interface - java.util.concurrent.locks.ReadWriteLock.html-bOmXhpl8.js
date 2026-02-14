import{_ as s,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function t(c,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="interface-java-util-concurrent-locks-readwritelock" tabindex="-1"><a class="header-anchor" href="#interface-java-util-concurrent-locks-readwritelock"><span>Interface - java.util.concurrent.locks.ReadWriteLock</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 01 / 03 21:55</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ReadWriteLock</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>维护一对互相关联的锁</p><p>一个用于只读操作，一个用于只写操作</p><p>读锁可以被同时被多个读线程持有，只要没有写者</p><p>而写锁是互斥的</p><p>读写锁需要保证内存同步</p><ul><li>即，一个成功获取读锁的线程将可以看到写锁释放之后的所有更新</li></ul><p>读写锁对于共享数据比互斥锁允许更大程度的并发</p><ul><li>同时只能有一个线程修改共享数据</li><li>而任意数量的线程可以同时读数据</li></ul><p>读写锁能否在性能上超过互斥锁取决于:</p><ul><li>数据被读或写的频率</li><li>对数据的碰撞</li></ul><p>一些实现上需要注意的点</p><ul><li>当读写线程都在等待时，分发读锁还是写锁 <ul><li>一般来说分配写锁，因为写操作不频繁，读操作将会导致写操作的饥饿</li></ul></li><li>当存在一个活跃的读者和一个等待的写者时，分配读锁还是写锁 <ul><li>分配读锁会无限延迟写锁</li><li>分配写锁会降低并发性</li></ul></li><li>锁是否可重入</li><li>锁的升级与降级</li></ul><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ReadWriteLock</span></span></span><span class="token punctuation">}</span> maintains a pair of associated <span class="token punctuation">{</span><span class="token keyword">@link</span></span>
<span class="line"> * <span class="token reference"><span class="token class-name">Lock</span></span> locks<span class="token punctuation">}</span>, one for read-only operations and one for writing.</span>
<span class="line"> * The <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">readLock</span></span> read lock<span class="token punctuation">}</span> may be held simultaneously by</span>
<span class="line"> * multiple reader threads, so long as there are no writers.  The</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">writeLock</span></span> write lock<span class="token punctuation">}</span> is exclusive.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>All <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ReadWriteLock</span></span></span><span class="token punctuation">}</span> implementations must guarantee that</span>
<span class="line"> * the memory synchronization effects of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">writeLock</span></span><span class="token punctuation">}</span> operations</span>
<span class="line"> * (as specified in the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Lock</span></span><span class="token punctuation">}</span> interface) also hold with respect</span>
<span class="line"> * to the associated <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">readLock</span></span><span class="token punctuation">}</span>. That is, a thread successfully</span>
<span class="line"> * acquiring the read lock will see all updates made upon previous</span>
<span class="line"> * release of the write lock.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>A read-write lock allows for a greater level of concurrency in</span>
<span class="line"> * accessing shared data than that permitted by a mutual exclusion lock.</span>
<span class="line"> * It exploits the fact that while only a single thread at a time (a</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>writer<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> thread) can modify the shared data, in many cases any</span>
<span class="line"> * number of threads can concurrently read the data (hence <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>reader<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * threads).</span>
<span class="line"> * In theory, the increase in concurrency permitted by the use of a read-write</span>
<span class="line"> * lock will lead to performance improvements over the use of a mutual</span>
<span class="line"> * exclusion lock. In practice this increase in concurrency will only be fully</span>
<span class="line"> * realized on a multi-processor, and then only if the access patterns for</span>
<span class="line"> * the shared data are suitable.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Whether or not a read-write lock will improve performance over the use</span>
<span class="line"> * of a mutual exclusion lock depends on the frequency that the data is</span>
<span class="line"> * read compared to being modified, the duration of the read and write</span>
<span class="line"> * operations, and the contention for the data - that is, the number of</span>
<span class="line"> * threads that will try to read or write the data at the same time.</span>
<span class="line"> * For example, a collection that is initially populated with data and</span>
<span class="line"> * thereafter infrequently modified, while being frequently searched</span>
<span class="line"> * (such as a directory of some kind) is an ideal candidate for the use of</span>
<span class="line"> * a read-write lock. However, if updates become frequent then the data</span>
<span class="line"> * spends most of its time being exclusively locked and there is little, if any</span>
<span class="line"> * increase in concurrency. Further, if the read operations are too short</span>
<span class="line"> * the overhead of the read-write lock implementation (which is inherently</span>
<span class="line"> * more complex than a mutual exclusion lock) can dominate the execution</span>
<span class="line"> * cost, particularly as many read-write lock implementations still serialize</span>
<span class="line"> * all threads through a small section of code. Ultimately, only profiling</span>
<span class="line"> * and measurement will establish whether the use of a read-write lock is</span>
<span class="line"> * suitable for your application.</span>
<span class="line"> *</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Although the basic operation of a read-write lock is straight-forward,</span>
<span class="line"> * there are many policy decisions that an implementation must make, which</span>
<span class="line"> * may affect the effectiveness of the read-write lock in a given application.</span>
<span class="line"> * Examples of these policies include:</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Determining whether to grant the read lock or the write lock, when</span>
<span class="line"> * both readers and writers are waiting, at the time that a writer releases</span>
<span class="line"> * the write lock. Writer preference is common, as writes are expected to be</span>
<span class="line"> * short and infrequent. Reader preference is less common as it can lead to</span>
<span class="line"> * lengthy delays for a write if the readers are frequent and long-lived as</span>
<span class="line"> * expected. Fair, or <span class="token entity named-entity" title="&quot;">&amp;quot;</span>in-order<span class="token entity named-entity" title="&quot;">&amp;quot;</span> implementations are also possible.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Determining whether readers that request the read lock while a</span>
<span class="line"> * reader is active and a writer is waiting, are granted the read lock.</span>
<span class="line"> * Preference to the reader can delay the writer indefinitely, while</span>
<span class="line"> * preference to the writer can reduce the potential for concurrency.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Determining whether the locks are reentrant: can a thread with the</span>
<span class="line"> * write lock reacquire it? Can it acquire a read lock while holding the</span>
<span class="line"> * write lock? Is the read lock itself reentrant?</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Can the write lock be downgraded to a read lock without allowing</span>
<span class="line"> * an intervening writer? Can a read lock be upgraded to a write lock,</span>
<span class="line"> * in preference to other waiting readers or writers?</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * You should consider all of these things when evaluating the suitability</span>
<span class="line"> * of a given implementation for your application.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">ReentrantReadWriteLock</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Lock</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">ReentrantLock</span></span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@since</span> 1.5</span>
<span class="line"> * <span class="token keyword">@author</span> Doug Lea</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>该接口只定义了两个函数</p><p>分别返回读锁和写锁</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns the lock used for reading.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the lock used for reading</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Lock</span> <span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns the lock used for writing.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the lock used for writing</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Lock</span> <span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,25)]))}const o=s(i,[["render",t],["__file","Interface - java.util.concurrent.locks.ReadWriteLock.html.vue"]]),r=JSON.parse('{"path":"/jdk-source-code-analysis/java.util.concurrent/Interface%20-%20java.util.concurrent.locks.ReadWriteLock.html","title":"Interface - java.util.concurrent.locks.ReadWriteLock","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.util.concurrent/Interface - java.util.concurrent.locks.ReadWriteLock.md"}');export{o as comp,r as data};
