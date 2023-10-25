import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="class-java-util-concurrent-locks-reentrantreadwritelock" tabindex="-1"><a class="header-anchor" href="#class-java-util-concurrent-locks-reentrantreadwritelock" aria-hidden="true">#</a> Class - java.util.concurrent.locks.ReentrantReadWriteLock</h1><p>Created by : Mr Dk.</p><p>2020 / 01 / 09 22:04</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * An implementation of <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReadWriteLock</span></span><span class="token punctuation">}</span> supporting similar
 * semantics to <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantLock</span></span><span class="token punctuation">}</span>.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class has the following properties:
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Acquisition order<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class does not impose a reader or writer preference
 * ordering for lock access.  However, it does support an optional
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>fairness<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> policy.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dl</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dt</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>i</span><span class="token punctuation">&gt;</span></span>Non-fair mode (default)<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>i</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dd</span><span class="token punctuation">&gt;</span></span>When constructed as non-fair (the default), the order of entry
 * to the read and write lock is unspecified, subject to reentrancy
 * constraints.  A nonfair lock that is continuously contended may
 * indefinitely postpone one or more reader or writer threads, but
 * will normally have higher throughput than a fair lock.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dt</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>i</span><span class="token punctuation">&gt;</span></span>Fair mode<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>i</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dd</span><span class="token punctuation">&gt;</span></span>When constructed as fair, threads contend for entry using an
 * approximately arrival-order policy. When the currently held lock
 * is released, either the longest-waiting single writer thread will
 * be assigned the write lock, or if there is a group of reader threads
 * waiting longer than all waiting writer threads, that group will be
 * assigned the read lock.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>A thread that tries to acquire a fair read lock (non-reentrantly)
 * will block if either the write lock is held, or there is a waiting
 * writer thread. The thread will not acquire the read lock until
 * after the oldest currently waiting writer thread has acquired and
 * released the write lock. Of course, if a waiting writer abandons
 * its wait, leaving one or more reader threads as the longest waiters
 * in the queue with the write lock free, then those readers will be
 * assigned the read lock.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>A thread that tries to acquire a fair write lock (non-reentrantly)
 * will block unless both the read lock and write lock are free (which
 * implies there are no waiting threads).  (Note that the non-blocking
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReadLock</span><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> and <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">WriteLock</span><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> methods
 * do not honor this fair setting and will immediately acquire the lock
 * if it is possible, regardless of waiting threads.)
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dl</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Reentrancy<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This lock allows both readers and writers to reacquire read or
 * write locks in the style of a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantLock</span></span><span class="token punctuation">}</span>. Non-reentrant
 * readers are not allowed until all write locks held by the writing
 * thread have been released.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Additionally, a writer can acquire the read lock, but not
 * vice-versa.  Among other applications, reentrancy can be useful
 * when write locks are held during calls or callbacks to methods that
 * perform reads under read locks.  If a reader tries to acquire the
 * write lock it will never succeed.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Lock downgrading<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Reentrancy also allows downgrading from the write lock to a read lock,
 * by acquiring the write lock, then the read lock and then releasing the
 * write lock. However, upgrading from a read lock to the write lock is
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>not<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span> possible.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Interruption of lock acquisition<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The read lock and write lock both support interruption during lock
 * acquisition.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> support<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The write lock provides a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> implementation that
 * behaves in the same way, with respect to the write lock, as the
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> implementation provided by
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantLock</span><span class="token punctuation">#</span><span class="token field">newCondition</span></span><span class="token punctuation">}</span> does for <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantLock</span></span><span class="token punctuation">}</span>.
 * This <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> can, of course, only be used with the write lock.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The read lock does not support a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> and
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span> throws
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">UnsupportedOperationException</span></span></span><span class="token punctuation">}</span>.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Instrumentation<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class supports methods to determine whether locks
 * are held or contended. These methods are designed for monitoring
 * system state, not for synchronization control.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Serialization of this class behaves in the same way as built-in
 * locks: a deserialized lock is in the unlocked state, regardless of
 * its state when serialized.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Sample usages<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>. Here is a code sketch showing how to perform
 * lock downgrading after updating a cache (exception handling is
 * particularly tricky when handling multiple locks in a non-nested
 * fashion):
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token punctuation">{</span><span class="token annotation punctuation">@code</span></span></span>
 * <span class="token line"><span class="token code language-java"><span class="token keyword">class</span> <span class="token class-name">CachedData</span> <span class="token punctuation">{</span></span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token class-name">Object</span> data<span class="token punctuation">;</span></span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token keyword">volatile</span> <span class="token keyword">boolean</span> cacheValid<span class="token punctuation">;</span></span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token keyword">final</span> <span class="token class-name">ReentrantReadWriteLock</span> rwl <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *
 *   <span class="token line"><span class="token code language-java"><span class="token keyword">void</span> <span class="token function">processCachedData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *     <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>cacheValid<span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *       <span class="token line"><span class="token code language-java"><span class="token comment">// Must release read lock before acquiring write lock</span></span></span>
 *       <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *       <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *       <span class="token line"><span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token comment">// Recheck state because another thread might have</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token comment">// acquired write lock and changed state before we did.</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>cacheValid<span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *           <span class="token line"><span class="token code language-java">data <span class="token operator">=</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span></span></span>
 *           <span class="token line"><span class="token code language-java">cacheValid <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token comment">// Downgrade by acquiring read lock before releasing write lock</span></span></span>
 *         <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *       <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span></span>
 *         <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Unlock write, still hold read</span></span></span>
 *       <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span></span></span>
 *       <span class="token line"><span class="token code language-java"><span class="token function">use</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span></span>
 *       <span class="token line"><span class="token code language-java">rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 * <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span><span class="token punctuation">}</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * ReentrantReadWriteLocks can be used to improve concurrency in some
 * uses of some kinds of Collections. This is typically worthwhile
 * only when the collections are expected to be large, accessed by
 * more reader threads than writer threads, and entail operations with
 * overhead that outweighs synchronization overhead. For example, here
 * is a class using a TreeMap that is expected to be large and
 * concurrently accessed.
 *
 *  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@code</span>
 <span class="token code-section">* <span class="token code language-java"><span class="token keyword">class</span> <span class="token class-name">RWDictionary</span> <span class="token punctuation">{</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Data</span><span class="token punctuation">&gt;</span></span> m <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TreeMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Data</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ReentrantReadWriteLock</span> rwl <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Lock</span> r <span class="token operator">=</span> rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Lock</span> w <span class="token operator">=</span> rwl<span class="token punctuation">.</span><span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token class-name">Data</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">r<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> m<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *     <span class="token code language-java"><span class="token keyword">finally</span> <span class="token punctuation">{</span> r<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token function">allKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">r<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> m<span class="token punctuation">.</span><span class="token function">keySet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *     <span class="token code language-java"><span class="token keyword">finally</span> <span class="token punctuation">{</span> r<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token class-name">Data</span> <span class="token function">put</span><span class="token punctuation">(</span><span class="token class-name">String</span> key<span class="token punctuation">,</span> <span class="token class-name">Data</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">w<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> m<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *     <span class="token code language-java"><span class="token keyword">finally</span> <span class="token punctuation">{</span> w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">w<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token keyword">try</span> <span class="token punctuation">{</span> m<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *     <span class="token code language-java"><span class="token keyword">finally</span> <span class="token punctuation">{</span> w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 * <span class="token code language-java"><span class="token punctuation">}</span></span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">&gt;</span></span>Implementation Notes<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This lock supports a maximum of 65535 recursive write locks
 * and 65535 read locks. Attempts to exceed these limits result in
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Error</span></span><span class="token punctuation">}</span> throws from locking methods.
 *
 * <span class="token keyword">@since</span> 1.5
 * <span class="token keyword">@author</span> Doug Lea
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ReentrantReadWriteLock</span>
        <span class="token keyword">implements</span> <span class="token class-name">ReadWriteLock</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>读写锁的实现类。同时支持 <code>ReentrantLock</code> 的类似功能。在锁的获得顺序上，也有 <strong>公平</strong> 和 <strong>非公平</strong> 两个概念：一个长期被竞争的非公平锁将使读写线程无限延后，但会比公平锁有更好的吞吐率；公平锁保证了竞争锁的先后顺序，当锁被释放后：等待时间最久的写者线程获得锁，或比等待时间最久的写者线程还要久的一组读者线程获得锁。</p><p>当写锁被持有，或有写线程正在等待时，试图获取公平读锁 (不可重入) 的线程将会被阻塞，直到最老的写线程获得并释放锁后才能得到读锁。除非正在等待中的写线程放弃等待。只有当读锁和写锁同时空闲时，一个写者线程才能获得公平写锁 (不可重入)。</p><h2 id="重入性" tabindex="-1"><a class="header-anchor" href="#重入性" aria-hidden="true">#</a> 重入性</h2><p>所有的写锁都释放后，才允许读者使用读锁。</p><h2 id="锁降级" tabindex="-1"><a class="header-anchor" href="#锁降级" aria-hidden="true">#</a> 锁降级</h2><p>允许写锁降级为读锁 - 先获取写锁，再获取读锁，最后释放写锁。但是读锁不可能升级为写锁。这主要是为了保证数据可见性：</p><blockquote><p>如果先释放了写锁，在获取读锁之前，可能已经有另一个线程获取了写锁并修改了数据。</p></blockquote><h2 id="condition-支持" tabindex="-1"><a class="header-anchor" href="#condition-支持" aria-hidden="true">#</a> Condition 支持</h2><p>只针对写锁。</p><h2 id="instrumentation" tabindex="-1"><a class="header-anchor" href="#instrumentation" aria-hidden="true">#</a> Instrumentation</h2><p>本类支持一些判断锁是否正被占有和竞争的函数。用于监控系统状态，而不是同步控制。示例用法:</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">class</span> <span class="token class-name">CachedData</span> <span class="token punctuation">{</span>
    <span class="token class-name">Object</span> data<span class="token punctuation">;</span>
    <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> cacheValid<span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">ReentrantReadWriteLock</span> rwl <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">void</span> <span class="token function">processCachedData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>cacheValid<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// Must release read lock before acquiring write lock</span>
            rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            rwl<span class="token punctuation">.</span><span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
                <span class="token comment">// Recheck state because another thread might have</span>
                <span class="token comment">// acquired write lock and changed state before we did.</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>cacheValid<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    data <span class="token operator">=</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
                    cacheValid <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token comment">// Downgrade by acquiring read lock before releasing write lock</span>
                rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                rwl<span class="token punctuation">.</span><span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Unlock write, still hold read</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token function">use</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
            rwl<span class="token punctuation">.</span><span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本类可被用于提升一些集合的并发性，特别是集合很大，会被更多的读线程访问时。该锁最多支持 65535 次递归占用写锁和 65535 次递归占用读锁，超出这个数目会发生错误。</p><h2 id="fields" tabindex="-1"><a class="header-anchor" href="#fields" aria-hidden="true">#</a> Fields</h2><p>内部维护一个读锁一个写锁，以及一个 AQS 同步器。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">6992448646407690164L</span><span class="token punctuation">;</span>
<span class="token doc-comment comment">/** Inner class providing readlock */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ReentrantReadWriteLock<span class="token punctuation">.</span>ReadLock</span> readerLock<span class="token punctuation">;</span>
<span class="token doc-comment comment">/** Inner class providing writelock */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ReentrantReadWriteLock<span class="token punctuation">.</span>WriteLock</span> writerLock<span class="token punctuation">;</span>
<span class="token doc-comment comment">/** Performs all synchronization mechanics */</span>
<span class="token keyword">final</span> <span class="token class-name">Sync</span> sync<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> Constructor</h2><p>构造函数 (默认将被构造为非公平锁)。根据是否是公平锁，实例化内部的 AQS。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Creates a new <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ReentrantReadWriteLock</span></span></span><span class="token punctuation">}</span> with
 * default (nonfair) ordering properties.
 */</span>
<span class="token keyword">public</span> <span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates a new <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ReentrantReadWriteLock</span></span></span><span class="token punctuation">}</span> with
 * the given fairness policy.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">fair</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if this lock should use a fair ordering policy
 */</span>
<span class="token keyword">public</span> <span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> fair<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    sync <span class="token operator">=</span> fair <span class="token operator">?</span> <span class="token keyword">new</span> <span class="token class-name">FairSync</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">NonfairSync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    readerLock <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ReadLock</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    writerLock <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WriteLock</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="get-lock" tabindex="-1"><a class="header-anchor" href="#get-lock" aria-hidden="true">#</a> Get Lock</h2><p>获取读锁写锁对象：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token class-name">ReentrantReadWriteLock<span class="token punctuation">.</span>WriteLock</span> <span class="token function">writeLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> writerLock<span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token class-name">ReentrantReadWriteLock<span class="token punctuation">.</span>ReadLock</span>  <span class="token function">readLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span> <span class="token keyword">return</span> readerLock<span class="token punctuation">;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="aqs-redefinition" tabindex="-1"><a class="header-anchor" href="#aqs-redefinition" aria-hidden="true">#</a> AQS Redefinition</h2><p>AQS 的抽象类定义:</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Synchronization implementation for ReentrantReadWriteLock.
 * Subclassed into fair and nonfair versions.
 */</span>
<span class="token keyword">abstract</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Sync</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractQueuedSynchronizer</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">6317671515068378041L</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>公平版本和非公平版本的 AQS 共有的函数在该类中实现，也就是说，公平锁与非公平锁使用相同的代码对锁进行释放。区别在于当队列非空时是否插队，因此抽象只针对其中的两个函数：在公平或非公平策略下，读者线程或写者线程是否应该被阻塞。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns true if the current thread, when trying to acquire
 * the read lock, and otherwise eligible to do so, should block
 * because of policy for overtaking other waiting threads.
 */</span>
<span class="token keyword">abstract</span> <span class="token keyword">boolean</span> <span class="token function">readerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Returns true if the current thread, when trying to acquire
 * the write lock, and otherwise eligible to do so, should block
 * because of policy for overtaking other waiting threads.
 */</span>
<span class="token keyword">abstract</span> <span class="token keyword">boolean</span> <span class="token function">writerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这两个函数在之后分别被实现。非公平版本：</p><ul><li>写者肯定可以插队</li><li>读者理论上也可以插队，但是需要避免写者陷入无限的饥饿中</li><li>如果线程临时出现在队列头部 (插队的)，则阻塞</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Nonfair version of Sync
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">NonfairSync</span> <span class="token keyword">extends</span> <span class="token class-name">Sync</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">8159625535654395037L</span><span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">writerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span> <span class="token comment">// writers can always barge</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">readerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* As a heuristic to avoid indefinite writer starvation,
         * block if the thread that momentarily appears to be head
         * of queue, if one exists, is a waiting writer.  This is
         * only a probabilistic effect since a new reader will not
         * block if there is a waiting writer behind other enabled
         * readers that have not yet drained from the queue.
         */</span>
        <span class="token keyword">return</span> <span class="token function">apparentlyFirstQueuedIsExclusive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>公平版本：策略很简单，只要等待队列中还有别的线程，你就给我阻塞然后乖乖排队。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Fair version of Sync
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">FairSync</span> <span class="token keyword">extends</span> <span class="token class-name">Sync</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">2274990926593161451L</span><span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">writerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">hasQueuedPredecessors</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">readerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">hasQueuedPredecessors</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="lock-status-definition" tabindex="-1"><a class="header-anchor" href="#lock-status-definition" aria-hidden="true">#</a> Lock Status Definition</h2><p>锁的状态被分为两个 <code>unsigned short</code> 变量：</p><ul><li>低 16-bit 被用于互斥的写锁重入次数</li><li>高 16-bit 被用于共享的读锁持有次数</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">/*
 * Read vs write count extraction constants and functions.
 * Lock state is logically divided into two unsigned shorts:
 * The lower one representing the exclusive (writer) lock hold count,
 * and the upper the shared (reader) hold count.
 */</span>

<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">SHARED_SHIFT</span>   <span class="token operator">=</span> <span class="token number">16</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">SHARED_UNIT</span>    <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">SHARED_SHIFT</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">MAX_COUNT</span>      <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">SHARED_SHIFT</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">EXCLUSIVE_MASK</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">SHARED_SHIFT</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/** Returns the number of shared holds represented in count  */</span>
<span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">sharedCount</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span>    <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&gt;&gt;&gt;</span> <span class="token constant">SHARED_SHIFT</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token doc-comment comment">/** Returns the number of exclusive holds represented in count  */</span>
<span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&amp;</span> <span class="token constant">EXCLUSIVE_MASK</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>无符号右移 16-bit 后，相当于只保留了高 16-bit，而 <code>EXCLUSIVE_MASK</code> 为 1 左移 16-bit 再减 1，则低 16-bit 全为 1，从而能通过与运算选出低 16-bit。</p><p>锁状态只能保存所有线程加起来重入了多少次锁。如何获取每个线程分别获取了多少次锁呢？只能通过每个线程的 ThreadLocal 记录了。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * A counter for per-thread read hold counts.
 * Maintained as a ThreadLocal; cached in cachedHoldCounter
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">HoldCounter</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> count <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token comment">// Use id, not reference, to avoid garbage retention</span>
    <span class="token keyword">final</span> <span class="token keyword">long</span> tid <span class="token operator">=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * ThreadLocal subclass. Easiest to explicitly define for sake
 * of deserialization mechanics.
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">ThreadLocalHoldCounter</span>
    <span class="token keyword">extends</span> <span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">HoldCounter</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token class-name">HoldCounter</span> <span class="token function">initialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">HoldCounter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * The number of reentrant read locks held by current thread.
 * Initialized only in constructor and readObject.
 * Removed whenever a thread&#39;s read hold count drops to 0.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token class-name">ThreadLocalHoldCounter</span> readHolds<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * The hold count of the last thread to successfully acquire
 * readLock. This saves ThreadLocal lookup in the common case
 * where the next thread to release is the last one to
 * acquire. This is non-volatile since it is just used
 * as a heuristic, and would be great for threads to cache.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Can outlive the Thread for which it is caching the read
 * hold count, but avoids garbage retention by not retaining a
 * reference to the Thread.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Accessed via a benign data race; relies on the memory
 * model&#39;s final field and out-of-thin-air guarantees.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token class-name">HoldCounter</span> cachedHoldCounter<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * firstReader is the first thread to have acquired the read lock.
 * firstReaderHoldCount is firstReader&#39;s hold count.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>More precisely, firstReader is the unique thread that last
 * changed the shared count from 0 to 1, and has not released the
 * read lock since then; null if there is no such thread.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Cannot cause garbage retention unless the thread terminated
 * without relinquishing its read locks, since tryReleaseShared
 * sets it to null.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Accessed via a benign data race; relies on the memory
 * model&#39;s out-of-thin-air guarantees for references.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This allows tracking of read holds for uncontended read
 * locks to be very cheap.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token class-name">Thread</span> firstReader <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token keyword">int</span> firstReaderHoldCount<span class="token punctuation">;</span>

<span class="token class-name">Sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    readHolds <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ThreadLocalHoldCounter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">setState</span><span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// ensures visibility of readHolds</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>没看懂... 😥</p></blockquote><h2 id="release" tabindex="-1"><a class="header-anchor" href="#release" aria-hidden="true">#</a> Release</h2><p>获取互斥写锁：</p><ul><li>当前线程已经获取写锁，那么写锁重入 +1</li><li>没有任何线程获取读写锁，那么占据该锁，并将自身设置为锁持有者</li><li>否则：读锁已被获取 / 非当前线程已获取写锁，线程进入等待</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">tryAcquire</span><span class="token punctuation">(</span><span class="token keyword">int</span> acquires<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*
     * Walkthrough:
     * 1. If read count nonzero or write count nonzero
     *    and owner is a different thread, fail.
     * 2. If count would saturate, fail. (This can only
     *    happen if count is already nonzero.)
     * 3. Otherwise, this thread is eligible for lock if
     *    it is either a reentrant acquire or
     *    queue policy allows it. If so, update state
     *    and set owner.
     */</span>
    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> w <span class="token operator">=</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>c <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// (Note: if c != 0 and w == 0 then shared count != 0)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>w <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">||</span> current <span class="token operator">!=</span> <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>w <span class="token operator">+</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span>acquires<span class="token punctuation">)</span> <span class="token operator">&gt;</span> <span class="token constant">MAX_COUNT</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&quot;Maximum lock count exceeded&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// Reentrant acquire</span>
        <span class="token function">setState</span><span class="token punctuation">(</span>c <span class="token operator">+</span> acquires<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">writerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span>
        <span class="token operator">!</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> c <span class="token operator">+</span> acquires<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>释放互斥写锁：</p><ul><li>计算释放后的锁状态，并更新</li><li>如果释放后锁已空闲，则设置锁持有者为空闲</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">tryRelease</span><span class="token punctuation">(</span><span class="token keyword">int</span> releases<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalMonitorStateException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> nextc <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> releases<span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> free <span class="token operator">=</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span>nextc<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>free<span class="token punctuation">)</span>
        <span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">setState</span><span class="token punctuation">(</span>nextc<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> free<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>获得共享读锁：</p><ol><li>如果写锁正被其它线程占有，则失败 (但如果是当前线程持有写锁，则可以获取读锁，因为单线程边写边读没关系)</li><li>根据公平策略决定是否可以获取读锁，或判断读锁获取次数是否超过限制</li><li>如果获取读锁失败，则进入循环尝试</li></ol><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">tryAcquireShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> unused<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*
     * Walkthrough:
     * 1. If write lock held by another thread, fail.
     * 2. Otherwise, this thread is eligible for
     *    lock wrt state, so ask if it should block
     *    because of queue policy. If not, try
     *    to grant by CASing state and updating count.
     *    Note that step does not check for reentrant
     *    acquires, which is postponed to full version
     *    to avoid having to check hold count in
     *    the more typical non-reentrant case.
     * 3. If step 2 fails either because thread
     *    apparently not eligible or CAS fails or count
     *    saturated, chain to version with full retry loop.
     */</span>
    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span>
        <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> current<span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> r <span class="token operator">=</span> <span class="token function">sharedCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">readerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
        r <span class="token operator">&lt;</span> <span class="token constant">MAX_COUNT</span> <span class="token operator">&amp;&amp;</span>
        <span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> c <span class="token operator">+</span> <span class="token constant">SHARED_UNIT</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            firstReader <span class="token operator">=</span> current<span class="token punctuation">;</span>
            firstReaderHoldCount <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            firstReaderHoldCount<span class="token operator">++</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token class-name">HoldCounter</span> rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> rh<span class="token punctuation">.</span>tid <span class="token operator">!=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span>
                cachedHoldCounter <span class="token operator">=</span> rh <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rh<span class="token punctuation">.</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
                readHolds<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>rh<span class="token punctuation">)</span><span class="token punctuation">;</span>
            rh<span class="token punctuation">.</span>count<span class="token operator">++</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token function">fullTryAcquireShared</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Full version of acquire for reads, that handles CAS misses
 * and reentrant reads not dealt with in tryAcquireShared.
 */</span>
<span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">fullTryAcquireShared</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*
     * This code is in part redundant with that in
     * tryAcquireShared but is simpler overall by not
     * complicating tryAcquireShared with interactions between
     * retries and lazily reading hold counts.
     */</span>
    <span class="token class-name">HoldCounter</span> rh <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> current<span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token comment">// else we hold the exclusive lock; blocking here</span>
            <span class="token comment">// would cause deadlock.</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">readerShouldBlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// Make sure we&#39;re not acquiring read lock reentrantly</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// assert firstReaderHoldCount &gt; 0;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> rh<span class="token punctuation">.</span>tid <span class="token operator">!=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        rh <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token keyword">if</span> <span class="token punctuation">(</span>rh<span class="token punctuation">.</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
                            readHolds<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>rh<span class="token punctuation">.</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
                    <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">sharedCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">MAX_COUNT</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&quot;Maximum lock count exceeded&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> c <span class="token operator">+</span> <span class="token constant">SHARED_UNIT</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">sharedCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                firstReader <span class="token operator">=</span> current<span class="token punctuation">;</span>
                firstReaderHoldCount <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                firstReaderHoldCount<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
                    rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> rh<span class="token punctuation">.</span>tid <span class="token operator">!=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    rh <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rh<span class="token punctuation">.</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
                    readHolds<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>rh<span class="token punctuation">)</span><span class="token punctuation">;</span>
                rh<span class="token punctuation">.</span>count<span class="token operator">++</span><span class="token punctuation">;</span>
                cachedHoldCounter <span class="token operator">=</span> rh<span class="token punctuation">;</span> <span class="token comment">// cache for release</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> <span class="token number">1</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>释放共享读锁：</p><ul><li><em>清理线程的读锁重入计数</em></li><li>在死循环中通过 CAS 操作将读锁的计数 -1</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">tryReleaseShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> unused<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// assert firstReaderHoldCount &gt; 0;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReaderHoldCount <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span>
            firstReader <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token keyword">else</span>
            firstReaderHoldCount<span class="token operator">--</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token class-name">HoldCounter</span> rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> rh<span class="token punctuation">.</span>tid <span class="token operator">!=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span>
            rh <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> count <span class="token operator">=</span> rh<span class="token punctuation">.</span>count<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>count <span class="token operator">&lt;=</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            readHolds<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>count <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span>
                <span class="token keyword">throw</span> <span class="token function">unmatchedUnlockException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token operator">--</span>rh<span class="token punctuation">.</span>count<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> nextc <span class="token operator">=</span> c <span class="token operator">-</span> <span class="token constant">SHARED_UNIT</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> nextc<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token comment">// Releasing the read lock has no effect on readers,</span>
            <span class="token comment">// but it may allow waiting writers to proceed if</span>
            <span class="token comment">// both read and write locks are now free.</span>
            <span class="token keyword">return</span> nextc <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="unfair" tabindex="-1"><a class="header-anchor" href="#unfair" aria-hidden="true">#</a> Unfair</h2><p>以下两个函数用于绕开公平策略，试图通过插队来获得读锁和写锁。若写锁已被占有，或写锁重入次数超过限制，则返回失败；否则就通过一次 CAS 操作尝试获得写锁，如果成功，就设置锁的持有线程。对于读锁，则在一个死循环中不断尝试 CAS 直到成功或失败。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Performs tryLock for write, enabling barging in both modes.
 * This is identical in effect to tryAcquire except for lack
 * of calls to writerShouldBlock.
 */</span>
<span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">tryWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>c <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> w <span class="token operator">=</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>w <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">||</span> current <span class="token operator">!=</span> <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>w <span class="token operator">==</span> <span class="token constant">MAX_COUNT</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&quot;Maximum lock count exceeded&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> c <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Performs tryLock for read, enabling barging in both modes.
 * This is identical in effect to tryAcquireShared except for
 * lack of calls to readerShouldBlock.
 */</span>
<span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">tryReadLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span>
            <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> current<span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> r <span class="token operator">=</span> <span class="token function">sharedCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">==</span> <span class="token constant">MAX_COUNT</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&quot;Maximum lock count exceeded&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> c <span class="token operator">+</span> <span class="token constant">SHARED_UNIT</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                firstReader <span class="token operator">=</span> current<span class="token punctuation">;</span>
                firstReaderHoldCount <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                firstReaderHoldCount<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token class-name">HoldCounter</span> rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> rh<span class="token punctuation">.</span>tid <span class="token operator">!=</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span>
                    cachedHoldCounter <span class="token operator">=</span> rh <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rh<span class="token punctuation">.</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
                    readHolds<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>rh<span class="token punctuation">)</span><span class="token punctuation">;</span>
                rh<span class="token punctuation">.</span>count<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="others" tabindex="-1"><a class="header-anchor" href="#others" aria-hidden="true">#</a> Others</h2><p>以下是查看锁状态的一些函数。主要是查询锁的持有者，读锁和写锁的计数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// While we must in general read state before owner,</span>
    <span class="token comment">// we don&#39;t need to do so to check if current thread is owner</span>
    <span class="token keyword">return</span> <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// Methods relayed to outer class</span>

<span class="token keyword">final</span> <span class="token class-name">ConditionObject</span> <span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">ConditionObject</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token class-name">Thread</span> <span class="token function">getOwner</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// Must read state before owner to ensure memory consistency</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">exclusiveCount</span><span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">?</span>
            <span class="token keyword">null</span> <span class="token operator">:</span>
            <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getReadLockCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">sharedCount</span><span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">isWriteLocked</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getWriteHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token function">exclusiveCount</span><span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getReadHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getReadLockCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>

    <span class="token class-name">Thread</span> current <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>firstReader <span class="token operator">==</span> current<span class="token punctuation">)</span>
        <span class="token keyword">return</span> firstReaderHoldCount<span class="token punctuation">;</span>

    <span class="token class-name">HoldCounter</span> rh <span class="token operator">=</span> cachedHoldCounter<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>rh <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> rh<span class="token punctuation">.</span>tid <span class="token operator">==</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> rh<span class="token punctuation">.</span>count<span class="token punctuation">;</span>

    <span class="token keyword">int</span> count <span class="token operator">=</span> readHolds<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>count<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>count <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> readHolds<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> count<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Reconstitutes the instance from a stream (that is, deserializes it).
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">readObject</span><span class="token punctuation">(</span><span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>ObjectInputStream</span> s<span class="token punctuation">)</span>
    <span class="token keyword">throws</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>IOException</span><span class="token punctuation">,</span> <span class="token class-name">ClassNotFoundException</span> <span class="token punctuation">{</span>
    s<span class="token punctuation">.</span><span class="token function">defaultReadObject</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    readHolds <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ThreadLocalHoldCounter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">setState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// reset to unlocked state</span>
<span class="token punctuation">}</span>

<span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一些和锁的状态有关的函数。比如，锁是否公平，锁的持有者，持有次数，以及 AQS 中队列的 metadata，如队列等待线程数，以及这些相关信息的组合条件。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Instrumentation and status</span>

<span class="token doc-comment comment">/**
 * Returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if this lock has fairness set true.
 *
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if this lock has fairness set true
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">isFair</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync <span class="token keyword">instanceof</span> <span class="token class-name">FairSync</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns the thread that currently owns the write lock, or
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if not owned. When this method is called by a
 * thread that is not the owner, the return value reflects a
 * best-effort approximation of current lock status. For example,
 * the owner may be momentarily <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> even if there are
 * threads trying to acquire the lock but have not yet done so.
 * This method is designed to facilitate construction of
 * subclasses that provide more extensive lock monitoring
 * facilities.
 *
 * <span class="token keyword">@return</span> the owner, or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if not owned
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Thread</span> <span class="token function">getOwner</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getOwner</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries the number of read locks held for this lock. This
 * method is designed for use in monitoring system state, not for
 * synchronization control.
 * <span class="token keyword">@return</span> the number of read locks held
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getReadLockCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getReadLockCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries if the write lock is held by any thread. This method is
 * designed for use in monitoring system state, not for
 * synchronization control.
 *
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if any thread holds the write lock and
 *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isWriteLocked</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isWriteLocked</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries if the write lock is held by the current thread.
 *
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the current thread holds the write lock and
 *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isWriteLockedByCurrentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries the number of reentrant write holds on this lock by the
 * current thread.  A writer thread has a hold on a lock for
 * each lock action that is not matched by an unlock action.
 *
 * <span class="token keyword">@return</span> the number of holds on the write lock by the current thread,
 *         or zero if the write lock is not held by the current thread
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getWriteHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getWriteHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries the number of reentrant read holds on this lock by the
 * current thread.  A reader thread has a hold on a lock for
 * each lock action that is not matched by an unlock action.
 *
 * <span class="token keyword">@return</span> the number of holds on the read lock by the current thread,
 *         or zero if the read lock is not held by the current thread
 * <span class="token keyword">@since</span> 1.6
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getReadHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getReadHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns a collection containing threads that may be waiting to
 * acquire the write lock.  Because the actual set of threads may
 * change dynamically while constructing this result, the returned
 * collection is only a best-effort estimate.  The elements of the
 * returned collection are in no particular order.  This method is
 * designed to facilitate construction of subclasses that provide
 * more extensive lock monitoring facilities.
 *
 * <span class="token keyword">@return</span> the collection of threads
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Collection</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Thread</span><span class="token punctuation">&gt;</span></span> <span class="token function">getQueuedWriterThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getExclusiveQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns a collection containing threads that may be waiting to
 * acquire the read lock.  Because the actual set of threads may
 * change dynamically while constructing this result, the returned
 * collection is only a best-effort estimate.  The elements of the
 * returned collection are in no particular order.  This method is
 * designed to facilitate construction of subclasses that provide
 * more extensive lock monitoring facilities.
 *
 * <span class="token keyword">@return</span> the collection of threads
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Collection</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Thread</span><span class="token punctuation">&gt;</span></span> <span class="token function">getQueuedReaderThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getSharedQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries whether any threads are waiting to acquire the read or
 * write lock. Note that because cancellations may occur at any
 * time, a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> return does not guarantee that any other
 * thread will ever acquire a lock.  This method is designed
 * primarily for use in monitoring of the system state.
 *
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if there may be other threads waiting to
 *         acquire the lock
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">hasQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">hasQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries whether the given thread is waiting to acquire either
 * the read or write lock. Note that because cancellations may
 * occur at any time, a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> return does not guarantee
 * that this thread will ever acquire a lock.  This method is
 * designed primarily for use in monitoring of the system state.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">thread</span> the thread
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the given thread is queued waiting for this lock
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the thread is null
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">hasQueuedThread</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isQueued</span><span class="token punctuation">(</span>thread<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns an estimate of the number of threads waiting to acquire
 * either the read or write lock.  The value is only an estimate
 * because the number of threads may change dynamically while this
 * method traverses internal data structures.  This method is
 * designed for use in monitoring of the system state, not for
 * synchronization control.
 *
 * <span class="token keyword">@return</span> the estimated number of threads waiting for this lock
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getQueueLength</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getQueueLength</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns a collection containing threads that may be waiting to
 * acquire either the read or write lock.  Because the actual set
 * of threads may change dynamically while constructing this
 * result, the returned collection is only a best-effort estimate.
 * The elements of the returned collection are in no particular
 * order.  This method is designed to facilitate construction of
 * subclasses that provide more extensive monitoring facilities.
 *
 * <span class="token keyword">@return</span> the collection of threads
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Collection</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Thread</span><span class="token punctuation">&gt;</span></span> <span class="token function">getQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Queries whether any threads are waiting on the given condition
 * associated with the write lock. Note that because timeouts and
 * interrupts may occur at any time, a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> return does
 * not guarantee that a future <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">signal</span></span><span class="token punctuation">}</span> will awaken any
 * threads.  This method is designed primarily for use in
 * monitoring of the system state.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">condition</span> the condition
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if there are any waiting threads
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span> if this lock is not held
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span> if the given condition is
 *         not associated with this lock
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the condition is null
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">hasWaiters</span><span class="token punctuation">(</span><span class="token class-name">Condition</span> condition<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>condition <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>condition <span class="token keyword">instanceof</span> <span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;not owner&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">hasWaiters</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span>condition<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns an estimate of the number of threads waiting on the
 * given condition associated with the write lock. Note that because
 * timeouts and interrupts may occur at any time, the estimate
 * serves only as an upper bound on the actual number of waiters.
 * This method is designed for use in monitoring of the system
 * state, not for synchronization control.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">condition</span> the condition
 * <span class="token keyword">@return</span> the estimated number of waiting threads
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span> if this lock is not held
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span> if the given condition is
 *         not associated with this lock
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the condition is null
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getWaitQueueLength</span><span class="token punctuation">(</span><span class="token class-name">Condition</span> condition<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>condition <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>condition <span class="token keyword">instanceof</span> <span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;not owner&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getWaitQueueLength</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span>condition<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns a collection containing those threads that may be
 * waiting on the given condition associated with the write lock.
 * Because the actual set of threads may change dynamically while
 * constructing this result, the returned collection is only a
 * best-effort estimate. The elements of the returned collection
 * are in no particular order.  This method is designed to
 * facilitate construction of subclasses that provide more
 * extensive condition monitoring facilities.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">condition</span> the condition
 * <span class="token keyword">@return</span> the collection of threads
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span> if this lock is not held
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span> if the given condition is
 *         not associated with this lock
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the condition is null
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Collection</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Thread</span><span class="token punctuation">&gt;</span></span> <span class="token function">getWaitingThreads</span><span class="token punctuation">(</span><span class="token class-name">Condition</span> condition<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>condition <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>condition <span class="token keyword">instanceof</span> <span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;not owner&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getWaitingThreads</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">AbstractQueuedSynchronizer<span class="token punctuation">.</span>ConditionObject</span><span class="token punctuation">)</span>condition<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>打印锁的状态：</p><ul><li>写锁的重入次数</li><li>读锁的共享次数</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns a string identifying this lock, as well as its lock state.
 * The state, in brackets, includes the String <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token string">&quot;Write locks =&quot;</span></span></span><span class="token punctuation">}</span>
 * followed by the number of reentrantly held write locks, and the
 * String <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token string">&quot;Read locks =&quot;</span></span></span><span class="token punctuation">}</span> followed by the number of held
 * read locks.
 *
 * <span class="token keyword">@return</span> a string identifying this lock, as well as its lock state
 */</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> c <span class="token operator">=</span> sync<span class="token punctuation">.</span><span class="token function">getCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> w <span class="token operator">=</span> <span class="token class-name">Sync</span><span class="token punctuation">.</span><span class="token function">exclusiveCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> r <span class="token operator">=</span> <span class="token class-name">Sync</span><span class="token punctuation">.</span><span class="token function">sharedCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span>
        <span class="token string">&quot;[Write locks = &quot;</span> <span class="token operator">+</span> w <span class="token operator">+</span> <span class="token string">&quot;, Read locks = &quot;</span> <span class="token operator">+</span> r <span class="token operator">+</span> <span class="token string">&quot;]&quot;</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>JVM 的内部方法，用于获取给定线程的线程 id。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the thread id for the given thread.  We must access
 * this directly rather than via method Thread.getId() because
 * getId() is not final, and has been known to be overridden in
 * ways that do not preserve unique mappings.
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token function">getThreadId</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token constant">UNSAFE</span><span class="token punctuation">.</span><span class="token function">getLongVolatile</span><span class="token punctuation">(</span>thread<span class="token punctuation">,</span> <span class="token constant">TID_OFFSET</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// Unsafe mechanics</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name"><span class="token namespace">sun<span class="token punctuation">.</span>misc<span class="token punctuation">.</span></span>Unsafe</span> <span class="token constant">UNSAFE</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> <span class="token constant">TID_OFFSET</span><span class="token punctuation">;</span>
<span class="token keyword">static</span> <span class="token punctuation">{</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token constant">UNSAFE</span> <span class="token operator">=</span> <span class="token class-name"><span class="token namespace">sun<span class="token punctuation">.</span>misc<span class="token punctuation">.</span></span>Unsafe</span><span class="token punctuation">.</span><span class="token function">getUnsafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> tk <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">;</span>
        <span class="token constant">TID_OFFSET</span> <span class="token operator">=</span> <span class="token constant">UNSAFE</span><span class="token punctuation">.</span>objectFieldOffset
            <span class="token punctuation">(</span>tk<span class="token punctuation">.</span><span class="token function">getDeclaredField</span><span class="token punctuation">(</span><span class="token string">&quot;tid&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Exception</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="read-write-lock-implementation" tabindex="-1"><a class="header-anchor" href="#read-write-lock-implementation" aria-hidden="true">#</a> Read / Write Lock Implementation</h2><p>读锁的具体实现。获取和释放读锁时，调用 AQS 的共享锁策略。参数全部为 1 (获取 1 或释放 1)。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * The lock returned by method <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">#</span><span class="token field">readLock</span></span><span class="token punctuation">}</span>.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">ReadLock</span> <span class="token keyword">implements</span> <span class="token class-name">Lock</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">5992448646407690164L</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Sync</span> sync<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Constructor for use by subclasses
     *
     * <span class="token keyword">@param</span> <span class="token parameter">lock</span> the outer lock object
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the lock is null
     */</span>
    <span class="token keyword">protected</span> <span class="token class-name">ReadLock</span><span class="token punctuation">(</span><span class="token class-name">ReentrantReadWriteLock</span> lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync <span class="token operator">=</span> lock<span class="token punctuation">.</span>sync<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the read lock.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the read lock if the write lock is not held by
     * another thread and returns immediately.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is held by another thread then
     * the current thread becomes disabled for thread scheduling
     * purposes and lies dormant until the read lock has been acquired.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">acquireShared</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the read lock unless the current thread is
     * <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the read lock if the write lock is not held
     * by another thread and returns immediately.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is held by another thread then the
     * current thread becomes disabled for thread scheduling
     * purposes and lies dormant until one of two things happens:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The read lock is acquired by the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Some other thread <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupts<span class="token punctuation">}</span>
     * the current thread.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>has its interrupted status set on entry to this method; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span> while
     * acquiring the read lock,
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * then <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span><span class="token punctuation">}</span> is thrown and the current
     * thread&#39;s interrupted status is cleared.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In this implementation, as this method is an explicit
     * interruption point, preference is given to responding to
     * the interrupt over normal or reentrant acquisition of the
     * lock.
     *
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if the current thread is interrupted
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lockInterruptibly</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">acquireSharedInterruptibly</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the read lock only if the write lock is not held by
     * another thread at the time of invocation.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the read lock if the write lock is not held by
     * another thread and returns immediately with the value
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>. Even when this lock has been set to use a
     * fair ordering policy, a call to <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span>
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>will<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> immediately acquire the read lock if it is
     * available, whether or not other threads are currently
     * waiting for the read lock.  This <span class="token entity named-entity" title="&quot;">&amp;quot;</span>barging<span class="token entity named-entity" title="&quot;">&amp;quot;</span> behavior
     * can be useful in certain circumstances, even though it
     * breaks fairness. If you want to honor the fairness setting
     * for this lock, then use <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token keyword">long</span><span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">)</span></span>
     * tryLock(0, TimeUnit.SECONDS) <span class="token punctuation">}</span> which is almost equivalent
     * (it also detects interruption).
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is held by another thread then
     * this method will return immediately with the value
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the read lock was acquired
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryReadLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the read lock if the write lock is not held by
     * another thread within the given waiting time and the
     * current thread has not been <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span>
     * interrupted<span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the read lock if the write lock is not held by
     * another thread and returns immediately with the value
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>. If this lock has been set to use a fair
     * ordering policy then an available lock <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>will not<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> be
     * acquired if any other threads are waiting for the
     * lock. This is in contrast to the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span>
     * method. If you want a timed <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryLock</span></span><span class="token punctuation">}</span> that does
     * permit barging on a fair lock then combine the timed and
     * un-timed forms together:
     *
     *  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@code</span>
     <span class="token code-section">* <span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span>lock<span class="token punctuation">.</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span></span>
     *     <span class="token code language-java">lock<span class="token punctuation">.</span><span class="token function">tryLock</span><span class="token punctuation">(</span>timeout<span class="token punctuation">,</span> unit<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
     *   <span class="token code language-java"><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span></span>
     * <span class="token code language-java"><span class="token punctuation">}</span></span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is held by another thread then the
     * current thread becomes disabled for thread scheduling
     * purposes and lies dormant until one of three things happens:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The read lock is acquired by the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Some other thread <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupts<span class="token punctuation">}</span>
     * the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The specified waiting time elapses.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the read lock is acquired then the value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> is
     * returned.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>has its interrupted status set on entry to this method; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span> while
     * acquiring the read lock,
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span> then <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span><span class="token punctuation">}</span> is thrown and the
     * current thread&#39;s interrupted status is cleared.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the specified waiting time elapses then the value
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> is returned.  If the time is less than or
     * equal to zero, the method will not wait at all.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In this implementation, as this method is an explicit
     * interruption point, preference is given to responding to
     * the interrupt over normal or reentrant acquisition of the
     * lock, and over reporting the elapse of the waiting time.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">timeout</span> the time to wait for the read lock
     * <span class="token keyword">@param</span> <span class="token parameter">unit</span> the time unit of the timeout argument
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the read lock was acquired
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if the current thread is interrupted
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the time unit is null
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token keyword">long</span> timeout<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span>
            <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryAcquireSharedNanos</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> unit<span class="token punctuation">.</span><span class="token function">toNanos</span><span class="token punctuation">(</span>timeout<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Attempts to release this lock.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the number of readers is now zero then the lock
     * is made available for write lock attempts.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">releaseShared</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Throws <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">UnsupportedOperationException</span></span></span><span class="token punctuation">}</span> because
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ReadLocks</span></span></span><span class="token punctuation">}</span> do not support conditions.
     *
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span> always
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">Condition</span> <span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">UnsupportedOperationException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Returns a string identifying this lock, as well as its lock state.
     * The state, in brackets, includes the String <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token string">&quot;Read locks =&quot;</span></span></span><span class="token punctuation">}</span>
     * followed by the number of held read locks.
     *
     * <span class="token keyword">@return</span> a string identifying this lock, as well as its lock state
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> r <span class="token operator">=</span> sync<span class="token punctuation">.</span><span class="token function">getReadLockCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span>
            <span class="token string">&quot;[Read locks = &quot;</span> <span class="token operator">+</span> r <span class="token operator">+</span> <span class="token string">&quot;]&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>写锁的具体实现。获取和释放写锁时，调用 AQS 的互斥锁策略，参数也全部为 1。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * The lock returned by method <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">#</span><span class="token field">writeLock</span></span><span class="token punctuation">}</span>.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">WriteLock</span> <span class="token keyword">implements</span> <span class="token class-name">Lock</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">4992448646407690164L</span><span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Sync</span> sync<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Constructor for use by subclasses
     *
     * <span class="token keyword">@param</span> <span class="token parameter">lock</span> the outer lock object
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the lock is null
     */</span>
    <span class="token keyword">protected</span> <span class="token class-name">WriteLock</span><span class="token punctuation">(</span><span class="token class-name">ReentrantReadWriteLock</span> lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync <span class="token operator">=</span> lock<span class="token punctuation">.</span>sync<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the write lock.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the write lock if neither the read nor write lock
     * are held by another thread
     * and returns immediately, setting the write lock hold count to
     * one.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread already holds the write lock then the
     * hold count is incremented by one and the method returns
     * immediately.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the lock is held by another thread then the current
     * thread becomes disabled for thread scheduling purposes and
     * lies dormant until the write lock has been acquired, at which
     * time the write lock hold count is set to one.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">acquire</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the write lock unless the current thread is
     * <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the write lock if neither the read nor write lock
     * are held by another thread
     * and returns immediately, setting the write lock hold count to
     * one.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread already holds this lock then the
     * hold count is incremented by one and the method returns
     * immediately.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the lock is held by another thread then the current
     * thread becomes disabled for thread scheduling purposes and
     * lies dormant until one of two things happens:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The write lock is acquired by the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Some other thread <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupts<span class="token punctuation">}</span>
     * the current thread.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is acquired by the current thread then the
     * lock hold count is set to one.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>has its interrupted status set on entry to this method;
     * or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span> while
     * acquiring the write lock,
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * then <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span><span class="token punctuation">}</span> is thrown and the current
     * thread&#39;s interrupted status is cleared.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In this implementation, as this method is an explicit
     * interruption point, preference is given to responding to
     * the interrupt over normal or reentrant acquisition of the
     * lock.
     *
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if the current thread is interrupted
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lockInterruptibly</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">acquireInterruptibly</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the write lock only if it is not held by another thread
     * at the time of invocation.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the write lock if neither the read nor write lock
     * are held by another thread
     * and returns immediately with the value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>,
     * setting the write lock hold count to one. Even when this lock has
     * been set to use a fair ordering policy, a call to
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>will<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> immediately acquire the
     * lock if it is available, whether or not other threads are
     * currently waiting for the write lock.  This <span class="token entity named-entity" title="&quot;">&amp;quot;</span>barging<span class="token entity named-entity" title="&quot;">&amp;quot;</span>
     * behavior can be useful in certain circumstances, even
     * though it breaks fairness. If you want to honor the
     * fairness setting for this lock, then use <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token keyword">long</span><span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">)</span></span> tryLock(0, TimeUnit.SECONDS) <span class="token punctuation">}</span>
     * which is almost equivalent (it also detects interruption).
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread already holds this lock then the
     * hold count is incremented by one and the method returns
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the lock is held by another thread then this method
     * will return immediately with the value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the lock was free and was acquired
     * by the current thread, or the write lock was already held
     * by the current thread; and <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryWriteLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Acquires the write lock if it is not held by another thread
     * within the given waiting time and the current thread has
     * not been <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Acquires the write lock if neither the read nor write lock
     * are held by another thread
     * and returns immediately with the value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>,
     * setting the write lock hold count to one. If this lock has been
     * set to use a fair ordering policy then an available lock
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>will not<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> be acquired if any other threads are
     * waiting for the write lock. This is in contrast to the <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token punctuation">#</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> method. If you want a timed <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryLock</span></span><span class="token punctuation">}</span>
     * that does permit barging on a fair lock then combine the
     * timed and un-timed forms together:
     *
     *  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@code</span>
     <span class="token code-section">* <span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span>lock<span class="token punctuation">.</span><span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span></span>
     *     <span class="token code language-java">lock<span class="token punctuation">.</span><span class="token function">tryLock</span><span class="token punctuation">(</span>timeout<span class="token punctuation">,</span> unit<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
     *   <span class="token code language-java"><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span></span>
     * <span class="token code language-java"><span class="token punctuation">}</span></span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread already holds this lock then the
     * hold count is incremented by one and the method returns
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the lock is held by another thread then the current
     * thread becomes disabled for thread scheduling purposes and
     * lies dormant until one of three things happens:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The write lock is acquired by the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Some other thread <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupts<span class="token punctuation">}</span>
     * the current thread; or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The specified waiting time elapses
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the write lock is acquired then the value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> is
     * returned and the write lock hold count is set to one.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread:
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>has its interrupted status set on entry to this method;
     * or
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span> while
     * acquiring the write lock,
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * then <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span><span class="token punctuation">}</span> is thrown and the current
     * thread&#39;s interrupted status is cleared.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the specified waiting time elapses then the value
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> is returned.  If the time is less than or
     * equal to zero, the method will not wait at all.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In this implementation, as this method is an explicit
     * interruption point, preference is given to responding to
     * the interrupt over normal or reentrant acquisition of the
     * lock, and over reporting the elapse of the waiting time.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">timeout</span> the time to wait for the write lock
     * <span class="token keyword">@param</span> <span class="token parameter">unit</span> the time unit of the timeout argument
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the lock was free and was acquired
     * by the current thread, or the write lock was already held by the
     * current thread; and <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> if the waiting time
     * elapsed before the lock could be acquired.
     *
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if the current thread is interrupted
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the time unit is null
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token keyword">long</span> timeout<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span>
            <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryAcquireNanos</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> unit<span class="token punctuation">.</span><span class="token function">toNanos</span><span class="token punctuation">(</span>timeout<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Attempts to release this lock.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>If the current thread is the holder of this lock then
     * the hold count is decremented. If the hold count is now
     * zero then the lock is released.  If the current thread is
     * not the holder of this lock then <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span><span class="token punctuation">}</span> is thrown.
     *
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span> if the current thread does not
     * hold this lock
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        sync<span class="token punctuation">.</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Returns a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> instance for use with this
     * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Lock</span></span><span class="token punctuation">}</span> instance.
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The returned <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> instance supports the same
     * usages as do the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Object</span></span><span class="token punctuation">}</span> monitor methods (<span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">Object</span><span class="token punctuation">#</span><span class="token function">wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span> wait<span class="token punctuation">}</span>, <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Object</span><span class="token punctuation">#</span><span class="token field">notify</span></span> notify<span class="token punctuation">}</span>, and <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">Object</span><span class="token punctuation">#</span><span class="token field">notifyAll</span></span> notifyAll<span class="token punctuation">}</span>) when used with the built-in
     * monitor lock.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>If this write lock is not held when any <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> method is called then an <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span><span class="token punctuation">}</span> is thrown.  (Read locks are
     * held independently of write locks, so are not checked or
     * affected. However it is essentially always an error to
     * invoke a condition waiting method when the current thread
     * has also acquired read locks, since other threads that
     * could unblock it will not be able to acquire the write
     * lock.)
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>When the condition <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Condition</span><span class="token punctuation">#</span><span class="token function">await</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span> waiting<span class="token punctuation">}</span>
     * methods are called the write lock is released and, before
     * they return, the write lock is reacquired and the lock hold
     * count restored to what it was when the method was called.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>If a thread is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">interrupt</span></span> interrupted<span class="token punctuation">}</span> while
     * waiting then the wait will terminate, an <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">InterruptedException</span></span><span class="token punctuation">}</span> will be thrown, and the thread&#39;s
     * interrupted status will be cleared.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> Waiting threads are signalled in FIFO order.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The ordering of lock reacquisition for threads returning
     * from waiting methods is the same as for threads initially
     * acquiring the lock, which is in the default case not specified,
     * but for <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>fair<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> locks favors those threads that have been
     * waiting the longest.
     *
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
     *
     * <span class="token keyword">@return</span> the Condition object
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">Condition</span> <span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Returns a string identifying this lock, as well as its lock
     * state.  The state, in brackets includes either the String
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token string">&quot;Unlocked&quot;</span></span></span><span class="token punctuation">}</span> or the String <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token string">&quot;Locked by&quot;</span></span></span><span class="token punctuation">}</span>
     * followed by the <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token field">getName</span></span> name<span class="token punctuation">}</span> of the owning thread.
     *
     * <span class="token keyword">@return</span> a string identifying this lock, as well as its lock state
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Thread</span> o <span class="token operator">=</span> sync<span class="token punctuation">.</span><span class="token function">getOwner</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>o <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token operator">?</span>
                                    <span class="token string">&quot;[Unlocked]&quot;</span> <span class="token operator">:</span>
                                    <span class="token string">&quot;[Locked by thread &quot;</span> <span class="token operator">+</span> o<span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&quot;]&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Queries if this write lock is held by the current thread.
     * Identical in effect to <span class="token punctuation">{</span><span class="token keyword">@link</span>
     * <span class="token reference"><span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">#</span><span class="token field">isWriteLockedByCurrentThread</span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the current thread holds this lock and
     *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise
     * <span class="token keyword">@since</span> 1.6
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isHeldByCurrentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Queries the number of holds on this write lock by the current
     * thread.  A thread has a hold on a lock for each lock action
     * that is not matched by an unlock action.  Identical in effect
     * to <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReentrantReadWriteLock</span><span class="token punctuation">#</span><span class="token field">getWriteHoldCount</span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> the number of holds on this lock by the current thread,
     *         or zero if this lock is not held by the current thread
     * <span class="token keyword">@since</span> 1.6
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">getWriteHoldCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>有关于 ReentrantReadWriteLock 的特性：锁对象在内部维护一个公平或非公平的 AQS。</p><p>AQS 的原子状态变量被切分成高 16-bit 和低 16-bit，分别表示读锁状态和写锁状态。读锁以共享的策略访问，写锁以互斥的策略访问。获得锁之前，要对原子状态变量中读写锁的状态进行判断：</p><ul><li>写锁状态维护了某个线程持有写锁后，重入该锁的次数</li><li>读锁状态维护了所有线程获取读锁次数的总和</li><li>每个线程获得的读锁次数保存在 <code>ThreadLocal</code> 中，由线程自身维护</li></ul><hr>`,85),o=[p];function c(l,i){return s(),a("div",null,o)}const r=n(t,[["render",c],["__file","Class - java.util.concurrent.locks.ReentrantReadWriteLock.html.vue"]]);export{r as default};
