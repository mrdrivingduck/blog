import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="abstract-class-java-util-concurrent-locks-abstractqueuedsynchronizer" tabindex="-1"><a class="header-anchor" href="#abstract-class-java-util-concurrent-locks-abstractqueuedsynchronizer" aria-hidden="true">#</a> Abstract Class - java.util.concurrent.locks.AbstractQueuedSynchronizer</h1><p>Created by : Mr Dk.</p><p>2019 / 12 / 24 17:27</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>本类提供了一套框架，表示一个基于 FIFO 同步队列的抽象接口。基于该接口，子类可以实现阻塞锁、信号量等。在接口内部实现中，锁的状态用一个可被原子操作的 <code>int</code> 表示，继承自该类的子类需要：</p><ul><li>提供函数来修改锁的状态</li><li>定义锁被持有和释放时对应的状态</li></ul><p>除此之外，本类的其它部分用于实现排队和阻塞的机制，不实现具体的同步接口。本类支持两种模式：</p><ul><li>互斥 (exclusive) 模式 - 其它线程的锁获取操作将不会成功</li><li>共享 (shared) 模式 - 多个线程共享获得锁可能会成功</li></ul><p>本类只有在一个地方需要区分这两种情况：在一个线程获得锁后，下一个正在等待的锁是否也可以获得锁。在不同模式下等待的线程共享同一个 FIFO 队列，通常来说，子类实现时只需支持一种模式即可，另一种模式不需实现。</p><p>本类提供了对内部队列进行监控的函数。另外，本类的序列化只保存 <code>int</code> 锁变量的状态。因此，反序列化将得到空的线程队列。使用该类时，子类需要借助以下三个函数查看或修改同步状态 (即修改锁状态)：</p><ul><li><code>getState()</code></li><li><code>setState()</code></li><li><code>compareAndSetState()</code></li></ul><p>这三个函数仅提供了修改锁状态的途径，但由于锁的具体定义不同 (锁状态的不同 bit 代表某种含义)，因此需要子类根据锁的使用方法来实现以下五个函数：</p><ul><li><code>tryAcquire()</code></li><li><code>tryRelease()</code></li><li><code>tryAcquireShared()</code></li><li><code>tryReleaseShared()</code></li><li><code>isHeldExclusively()</code></li></ul><p>这些函数需要被实现为线程安全、简短、非阻塞。另外，从 <code>AbstractOwnableSynchronizer</code> 继承来的信息可以在互斥模式下追踪持有锁的线程。虽然内部实现是队列，但锁的获得不一定遵循 FIFO 的规则。</p><p>互斥访问的核心操作。获得锁：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">tryAcquire</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// enqueue thread if it is not already queued</span>
    <span class="token comment">// possibly block current thread</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>释放锁：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tryRelease</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token comment">// unblock the first queued thread</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，入队操作在 <code>tryAcquire()</code> 之后调用。在这之间，可能会被别的试图获得锁的线程插队，这是由 CPU 的调度决定的，即所谓的不公平锁。在子类实现 <code>tryAcquire()</code> 时，可以在内部调用一定的检查函数，以提供一个 <strong>公平</strong> 的 FIFO 锁获取顺序。默认的不公平获取顺序会有更高的吞吐率，因为刚释放锁的线程非常有可能立刻重新获得锁，不保证严格的入队顺序。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Provides a framework for implementing blocking locks and related
 * synchronizers (semaphores, events, etc) that rely on
 * first-in-first-out (FIFO) wait queues.  This class is designed to
 * be a useful basis for most kinds of synchronizers that rely on a
 * single atomic <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">int</span></span></span><span class="token punctuation">}</span> value to represent state. Subclasses
 * must define the protected methods that change this state, and which
 * define what that state means in terms of this object being acquired
 * or released.  Given these, the other methods in this class carry
 * out all queuing and blocking mechanics. Subclasses can maintain
 * other state fields, but only the atomically updated <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">int</span></span></span><span class="token punctuation">}</span>
 * value manipulated using methods <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">getState</span></span><span class="token punctuation">}</span>, <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token field">setState</span></span><span class="token punctuation">}</span> and <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">compareAndSetState</span></span><span class="token punctuation">}</span> is tracked with respect
 * to synchronization.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Subclasses should be defined as non-public internal helper
 * classes that are used to implement the synchronization properties
 * of their enclosing class.  Class
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbstractQueuedSynchronizer</span></span></span><span class="token punctuation">}</span> does not implement any
 * synchronization interface.  Instead it defines methods such as
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">acquireInterruptibly</span></span><span class="token punctuation">}</span> that can be invoked as
 * appropriate by concrete locks and related synchronizers to
 * implement their public methods.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class supports either or both a default <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>exclusive<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span>
 * mode and a <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>shared<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> mode. When acquired in exclusive mode,
 * attempted acquires by other threads cannot succeed. Shared mode
 * acquires by multiple threads may (but need not) succeed. This class
 * does not <span class="token entity named-entity" title="&quot;">&amp;quot;</span>understand<span class="token entity named-entity" title="&quot;">&amp;quot;</span> these differences except in the
 * mechanical sense that when a shared mode acquire succeeds, the next
 * waiting thread (if one exists) must also determine whether it can
 * acquire as well. Threads waiting in the different modes share the
 * same FIFO queue. Usually, implementation subclasses support only
 * one of these modes, but both can come into play for example in a
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReadWriteLock</span></span><span class="token punctuation">}</span>. Subclasses that support only exclusive or
 * only shared modes need not define the methods supporting the unused mode.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class defines a nested <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ConditionObject</span></span><span class="token punctuation">}</span> class that
 * can be used as a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Condition</span></span><span class="token punctuation">}</span> implementation by subclasses
 * supporting exclusive mode for which method <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token field">isHeldExclusively</span></span><span class="token punctuation">}</span> reports whether synchronization is exclusively
 * held with respect to the current thread, method <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">release</span></span><span class="token punctuation">}</span>
 * invoked with the current <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">getState</span></span><span class="token punctuation">}</span> value fully releases
 * this object, and <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">acquire</span></span><span class="token punctuation">}</span>, given this saved state value,
 * eventually restores this object to its previous acquired state.  No
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbstractQueuedSynchronizer</span></span></span><span class="token punctuation">}</span> method otherwise creates such a
 * condition, so if this constraint cannot be met, do not use it.  The
 * behavior of <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ConditionObject</span></span><span class="token punctuation">}</span> depends of course on the
 * semantics of its synchronizer implementation.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class provides inspection, instrumentation, and monitoring
 * methods for the internal queue, as well as similar methods for
 * condition objects. These can be exported as desired into classes
 * using an <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbstractQueuedSynchronizer</span></span></span><span class="token punctuation">}</span> for their
 * synchronization mechanics.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Serialization of this class stores only the underlying atomic
 * integer maintaining state, so deserialized objects have empty
 * thread queues. Typical subclasses requiring serializability will
 * define a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">readObject</span></span><span class="token punctuation">}</span> method that restores this to a known
 * initial state upon deserialization.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">&gt;</span></span>Usage<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>To use this class as the basis of a synchronizer, redefine the
 * following methods, as applicable, by inspecting and/or modifying
 * the synchronization state using <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">getState</span></span><span class="token punctuation">}</span>, <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token field">setState</span></span><span class="token punctuation">}</span> and/or <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">compareAndSetState</span></span><span class="token punctuation">}</span>:
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquire</span></span><span class="token punctuation">}</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryRelease</span></span><span class="token punctuation">}</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquireShared</span></span><span class="token punctuation">}</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryReleaseShared</span></span><span class="token punctuation">}</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">isHeldExclusively</span></span><span class="token punctuation">}</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
 *
 * Each of these methods by default throws <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span><span class="token punctuation">}</span>.  Implementations of these methods
 * must be internally thread-safe, and should in general be short and
 * not block. Defining these methods is the <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>only<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> supported
 * means of using this class. All other methods are declared
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">final</span></span></span><span class="token punctuation">}</span> because they cannot be independently varied.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>You may also find the inherited methods from <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token class-name">AbstractOwnableSynchronizer</span></span><span class="token punctuation">}</span> useful to keep track of the thread
 * owning an exclusive synchronizer.  You are encouraged to use them
 * -- this enables monitoring and diagnostic tools to assist users in
 * determining which threads hold locks.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Even though this class is based on an internal FIFO queue, it
 * does not automatically enforce FIFO acquisition policies.  The core
 * of exclusive synchronization takes the form:
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span>
 <span class="token code-section">* <span class="token line"><span class="token code language-java"><span class="token class-name">Acquire</span><span class="token operator">:</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">tryAcquire</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *        <span class="token line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java">enqueue thread <span class="token keyword">if</span> it is not already queued</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java"><span class="token punctuation">;</span></span></span>
 *        <span class="token line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java">possibly block current thread</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java"><span class="token punctuation">;</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *
 * <span class="token line"><span class="token code language-java"><span class="token class-name">Release</span><span class="token operator">:</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tryRelease</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span></span></span>
 *        <span class="token line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java">unblock the first queued thread</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span><span class="token code language-java"><span class="token punctuation">;</span></span></span>
 *</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * (Shared mode is similar but may involve cascading signals.)
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>barging<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>Because checks in acquire are invoked before
 * enqueuing, a newly acquiring thread may <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>barge<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> ahead of
 * others that are blocked and queued.  However, you can, if desired,
 * define <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryAcquire</span></span><span class="token punctuation">}</span> and/or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryAcquireShared</span></span><span class="token punctuation">}</span> to
 * disable barging by internally invoking one or more of the inspection
 * methods, thereby providing a <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>fair<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> FIFO acquisition order.
 * In particular, most fair synchronizers can define <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryAcquire</span></span><span class="token punctuation">}</span>
 * to return <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> if <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">hasQueuedPredecessors</span></span><span class="token punctuation">}</span> (a method
 * specifically designed to be used by fair synchronizers) returns
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>.  Other variations are possible.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Throughput and scalability are generally highest for the
 * default barging (also known as <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>greedy<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span>,
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>renouncement<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span>, and <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>convoy-avoidance<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span>) strategy.
 * While this is not guaranteed to be fair or starvation-free, earlier
 * queued threads are allowed to recontend before later queued
 * threads, and each recontention has an unbiased chance to succeed
 * against incoming threads.  Also, while acquires do not
 * <span class="token entity named-entity" title="&quot;">&amp;quot;</span>spin<span class="token entity named-entity" title="&quot;">&amp;quot;</span> in the usual sense, they may perform multiple
 * invocations of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">tryAcquire</span></span><span class="token punctuation">}</span> interspersed with other
 * computations before blocking.  This gives most of the benefits of
 * spins when exclusive synchronization is only briefly held, without
 * most of the liabilities when it isn&#39;t. If so desired, you can
 * augment this by preceding calls to acquire methods with
 * &quot;fast-path&quot; checks, possibly prechecking <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">hasContended</span></span><span class="token punctuation">}</span>
 * and/or <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">hasQueuedThreads</span></span><span class="token punctuation">}</span> to only do so if the synchronizer
 * is likely not to be contended.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This class provides an efficient and scalable basis for
 * synchronization in part by specializing its range of use to
 * synchronizers that can rely on <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">int</span></span></span><span class="token punctuation">}</span> state, acquire, and
 * release parameters, and an internal FIFO wait queue. When this does
 * not suffice, you can build synchronizers from a lower level using
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> java.util.concurrent.atomic atomic<span class="token punctuation">}</span> classes, your own custom
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span><span class="token class-name">Queue</span></span><span class="token punctuation">}</span> classes, and <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">LockSupport</span></span><span class="token punctuation">}</span> blocking
 * support.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h3</span><span class="token punctuation">&gt;</span></span>Usage Examples<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h3</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Here is a non-reentrant mutual exclusion lock class that uses
 * the value zero to represent the unlocked state, and one to
 * represent the locked state. While a non-reentrant lock
 * does not strictly require recording of the current owner
 * thread, this class does so anyway to make usage easier to monitor.
 * It also supports conditions and exposes
 * one of the instrumentation methods:
 *
 *  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@code</span>
 <span class="token code-section">* <span class="token code language-java"><span class="token keyword">class</span> <span class="token class-name">Mutex</span> <span class="token keyword">implements</span> <span class="token class-name">Lock</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span></span>
 *
 *   <span class="token code language-java"><span class="token comment">// Our internal helper class</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Sync</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractQueuedSynchronizer</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java"><span class="token comment">// Reports whether in locked state</span></span>
 *     <span class="token code language-java"><span class="token keyword">protected</span> <span class="token keyword">boolean</span> <span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java"><span class="token keyword">return</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token comment">// Acquires the lock if state is zero</span></span>
 *     <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryAcquire</span><span class="token punctuation">(</span><span class="token keyword">int</span> acquires<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java"><span class="token keyword">assert</span> acquires <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token comment">// Otherwise unused</span></span>
 *       <span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *         <span class="token code language-java"><span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *         <span class="token code language-java"><span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token punctuation">}</span></span>
 *       <span class="token code language-java"><span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token comment">// Releases the lock by setting state to zero</span></span>
 *     <span class="token code language-java"><span class="token keyword">protected</span> <span class="token keyword">boolean</span> <span class="token function">tryRelease</span><span class="token punctuation">(</span><span class="token keyword">int</span> releases<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java"><span class="token keyword">assert</span> releases <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token comment">// Otherwise unused</span></span>
 *       <span class="token code language-java"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalMonitorStateException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token function">setState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token comment">// Provides a Condition</span></span>
 *     <span class="token code language-java"><span class="token class-name">Condition</span> <span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">ConditionObject</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token comment">// Deserializes properly</span></span>
 *     <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">readObject</span><span class="token punctuation">(</span><span class="token class-name">ObjectInputStream</span> s<span class="token punctuation">)</span></span>
 *         <span class="token code language-java"><span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">,</span> <span class="token class-name">ClassNotFoundException</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java">s<span class="token punctuation">.</span><span class="token function">defaultReadObject</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token function">setState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// reset to unlocked state</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *   <span class="token code language-java"><span class="token comment">// The sync object does all the hard work. We just forward to it.</span></span>
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Sync</span> sync <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>                <span class="token punctuation">{</span> sync<span class="token punctuation">.</span><span class="token function">acquire</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>          <span class="token punctuation">{</span> <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryAcquire</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>              <span class="token punctuation">{</span> sync<span class="token punctuation">.</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token class-name">Condition</span> <span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span>   <span class="token punctuation">{</span> <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">newCondition</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isLocked</span><span class="token punctuation">(</span><span class="token punctuation">)</span>         <span class="token punctuation">{</span> <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isHeldExclusively</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">hasQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">hasQueuedThreads</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">lockInterruptibly</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">sync<span class="token punctuation">.</span><span class="token function">acquireInterruptibly</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">tryLock</span><span class="token punctuation">(</span><span class="token keyword">long</span> timeout<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span></span>
 *       <span class="token code language-java"><span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java"><span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">tryAcquireNanos</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> unit<span class="token punctuation">.</span><span class="token function">toNanos</span><span class="token punctuation">(</span>timeout<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 * <span class="token code language-java"><span class="token punctuation">}</span></span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Here is a latch class that is like a
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span>concurrent<span class="token punctuation">.</span></span><span class="token class-name">CountDownLatch</span></span> CountDownLatch<span class="token punctuation">}</span>
 * except that it only requires a single <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">signal</span></span><span class="token punctuation">}</span> to
 * fire. Because a latch is non-exclusive, it uses the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">shared</span></span><span class="token punctuation">}</span>
 * acquire and release methods.
 *
 *  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span><span class="token keyword">@code</span>
 <span class="token code-section">* <span class="token code language-java"><span class="token keyword">class</span> <span class="token class-name">BooleanLatch</span> <span class="token punctuation">{</span></span>
 *
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Sync</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractQueuedSynchronizer</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java"><span class="token keyword">boolean</span> <span class="token function">isSignalled</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token keyword">protected</span> <span class="token keyword">int</span> <span class="token function">tryAcquireShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> ignore<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java"><span class="token keyword">return</span> <span class="token function">isSignalled</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token number">1</span> <span class="token operator">:</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *     <span class="token code language-java"><span class="token keyword">protected</span> <span class="token keyword">boolean</span> <span class="token function">tryReleaseShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> ignore<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
 *       <span class="token code language-java"><span class="token function">setState</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *       <span class="token code language-java"><span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
 *     <span class="token code language-java"><span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 *
 *   <span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Sync</span> sync <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isSignalled</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> sync<span class="token punctuation">.</span><span class="token function">isSignalled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">signal</span><span class="token punctuation">(</span><span class="token punctuation">)</span>         <span class="token punctuation">{</span> sync<span class="token punctuation">.</span><span class="token function">releaseShared</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
 *   <span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">await</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span></span>
 *     <span class="token code language-java">sync<span class="token punctuation">.</span><span class="token function">acquireSharedInterruptibly</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *   <span class="token code language-java"><span class="token punctuation">}</span></span>
 * <span class="token code language-java"><span class="token punctuation">}</span></span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token keyword">@since</span> 1.5
 * <span class="token keyword">@author</span> Doug Lea
 */</span>
<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">AbstractQueuedSynchronizer</span>
    <span class="token keyword">extends</span> <span class="token class-name">AbstractOwnableSynchronizer</span>
    <span class="token keyword">implements</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>
    
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> Constructor</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">7373984972572414691L</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Creates a new <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbstractQueuedSynchronizer</span></span></span><span class="token punctuation">}</span> instance
 * with initial synchronization state of zero.
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">AbstractQueuedSynchronizer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="queue-nodes" tabindex="-1"><a class="header-anchor" href="#queue-nodes" aria-hidden="true">#</a> Queue Nodes</h2><p>内部同步队列中的结点定义，使用了 <strong>CLH 锁队列</strong> 的变种：</p><ul><li>CLH 通常被用于自旋锁</li><li>在这里也被实现为阻塞锁</li></ul><p>内部的 <code>waitStatus</code> 维护了结点的线程等待状态：</p><ul><li><code>CANCELLED</code> - 在同步队列中等待的线程等待超时或被中断，需要取消等待</li><li><code>SIGNAL</code> - 后继结点的线程处于等待，当前结点释放同步状态或被取消后，通知后续结点</li><li><code>CONDTITION</code> - 结点位于 <strong>等待队列</strong> 中，在接受到 <code>signal()</code> 后进入 <strong>同步队列</strong></li><li><code>PROPAGATE</code> - 下一次共享同步装填将被无条件传播</li><li><code>INITIAL</code> - 初始状态</li></ul><p>在 CLH 插入时，用一个原子的界限来表示一个线程是否已入队。<code>prev</code> 指针用于在线程被取消等待时重新链接链表。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Wait queue node class.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The wait queue is a variant of a &quot;CLH&quot; (Craig, Landin, and
 * Hagersten) lock queue. CLH locks are normally used for
 * spinlocks.  We instead use them for blocking synchronizers, but
 * use the same basic tactic of holding some of the control
 * information about a thread in the predecessor of its node.  A
 * &quot;status&quot; field in each node keeps track of whether a thread
 * should block.  A node is signalled when its predecessor
 * releases.  Each node of the queue otherwise serves as a
 * specific-notification-style monitor holding a single waiting
 * thread. The status field does NOT control whether threads are
 * granted locks etc though.  A thread may try to acquire if it is
 * first in the queue. But being first does not guarantee success;
 * it only gives the right to contend.  So the currently released
 * contender thread may need to rewait.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>To enqueue into a CLH lock, you atomically splice it in as new
 * tail. To dequeue, you just set the head field.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span>
 <span class="token code-section">*      <span class="token line"><span class="token code language-java"><span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">+</span>  prev <span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">-</span><span class="token operator">+</span>       <span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">-</span><span class="token operator">+</span></span></span>
 * <span class="token line"><span class="token code language-java">head <span class="token operator">|</span>      <span class="token operator">|</span> <span class="token operator">&lt;</span><span class="token operator">--</span><span class="token operator">--</span> <span class="token operator">|</span>     <span class="token operator">|</span> <span class="token operator">&lt;</span><span class="token operator">--</span><span class="token operator">--</span> <span class="token operator">|</span>     <span class="token operator">|</span>  tail</span></span>
 *      <span class="token line"><span class="token code language-java"><span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">+</span>       <span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">-</span><span class="token operator">+</span>       <span class="token operator">+</span><span class="token operator">--</span><span class="token operator">--</span><span class="token operator">-</span><span class="token operator">+</span></span></span>
 *</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Insertion into a CLH queue requires only a single atomic
 * operation on &quot;tail&quot;, so there is a simple atomic point of
 * demarcation from unqueued to queued. Similarly, dequeuing
 * involves only updating the &quot;head&quot;. However, it takes a bit
 * more work for nodes to determine who their successors are,
 * in part to deal with possible cancellation due to timeouts
 * and interrupts.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The &quot;prev&quot; links (not used in original CLH locks), are mainly
 * needed to handle cancellation. If a node is cancelled, its
 * successor is (normally) relinked to a non-cancelled
 * predecessor. For explanation of similar mechanics in the case
 * of spin locks, see the papers by Scott and Scherer at
 * http://www.cs.rochester.edu/u/scott/synchronization/
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>We also use &quot;next&quot; links to implement blocking mechanics.
 * The thread id for each node is kept in its own node, so a
 * predecessor signals the next node to wake up by traversing
 * next link to determine which thread it is.  Determination of
 * successor must avoid races with newly queued nodes to set
 * the &quot;next&quot; fields of their predecessors.  This is solved
 * when necessary by checking backwards from the atomically
 * updated &quot;tail&quot; when a node&#39;s successor appears to be null.
 * (Or, said differently, the next-links are an optimization
 * so that we don&#39;t usually need a backward scan.)
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Cancellation introduces some conservatism to the basic
 * algorithms.  Since we must poll for cancellation of other
 * nodes, we can miss noticing whether a cancelled node is
 * ahead or behind us. This is dealt with by always unparking
 * successors upon cancellation, allowing them to stabilize on
 * a new predecessor, unless we can identify an uncancelled
 * predecessor who will carry this responsibility.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>CLH queues need a dummy header node to get started. But
 * we don&#39;t create them on construction, because it would be wasted
 * effort if there is never contention. Instead, the node
 * is constructed and head and tail pointers are set upon first
 * contention.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Threads waiting on Conditions use the same nodes, but
 * use an additional link. Conditions only need to link nodes
 * in simple (non-concurrent) linked queues because they are
 * only accessed when exclusively held.  Upon await, a node is
 * inserted into a condition queue.  Upon signal, the node is
 * transferred to the main queue.  A special value of status
 * field is used to mark which queue a node is on.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Thanks go to Dave Dice, Mark Moir, Victor Luchangco, Bill
 * Scherer and Michael Scott, along with members of JSR-166
 * expert group, for helpful ideas, discussions, and critiques
 * on the design of this class.
 */</span>
<span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">Node</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/** Marker to indicate a node is waiting in shared mode */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Node</span> <span class="token constant">SHARED</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/** Marker to indicate a node is waiting in exclusive mode */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Node</span> <span class="token constant">EXCLUSIVE</span> <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/** waitStatus value to indicate thread has cancelled */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">CANCELLED</span> <span class="token operator">=</span>  <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/** waitStatus value to indicate successor&#39;s thread needs unparking */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">SIGNAL</span>    <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/** waitStatus value to indicate thread is waiting on condition */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">CONDITION</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">2</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * waitStatus value to indicate the next acquireShared should
     * unconditionally propagate
     */</span>
    <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">PROPAGATE</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">3</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Status field, taking on only the values:
     *   SIGNAL:     The successor of this node is (or will soon be)
     *               blocked (via park), so the current node must
     *               unpark its successor when it releases or
     *               cancels. To avoid races, acquire methods must
     *               first indicate they need a signal,
     *               then retry the atomic acquire, and then,
     *               on failure, block.
     *   CANCELLED:  This node is cancelled due to timeout or interrupt.
     *               Nodes never leave this state. In particular,
     *               a thread with cancelled node never again blocks.
     *   CONDITION:  This node is currently on a condition queue.
     *               It will not be used as a sync queue node
     *               until transferred, at which time the status
     *               will be set to 0. (Use of this value here has
     *               nothing to do with the other uses of the
     *               field, but simplifies mechanics.)
     *   PROPAGATE:  A releaseShared should be propagated to other
     *               nodes. This is set (for head node only) in
     *               doReleaseShared to ensure propagation
     *               continues, even if other operations have
     *               since intervened.
     *   0:          None of the above
     *
     * The values are arranged numerically to simplify use.
     * Non-negative values mean that a node doesn&#39;t need to
     * signal. So, most code doesn&#39;t need to check for particular
     * values, just for sign.
     *
     * The field is initialized to 0 for normal sync nodes, and
     * CONDITION for condition nodes.  It is modified using CAS
     * (or when possible, unconditional volatile writes).
     */</span>
    <span class="token keyword">volatile</span> <span class="token keyword">int</span> waitStatus<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Link to predecessor node that current node/thread relies on
     * for checking waitStatus. Assigned during enqueuing, and nulled
     * out (for sake of GC) only upon dequeuing.  Also, upon
     * cancellation of a predecessor, we short-circuit while
     * finding a non-cancelled one, which will always exist
     * because the head node is never cancelled: A node becomes
     * head only as a result of successful acquire. A
     * cancelled thread never succeeds in acquiring, and a thread only
     * cancels itself, not any other node.
     */</span>
    <span class="token keyword">volatile</span> <span class="token class-name">Node</span> prev<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Link to the successor node that the current node/thread
     * unparks upon release. Assigned during enqueuing, adjusted
     * when bypassing cancelled predecessors, and nulled out (for
     * sake of GC) when dequeued.  The enq operation does not
     * assign next field of a predecessor until after attachment,
     * so seeing a null next field does not necessarily mean that
     * node is at end of queue. However, if a next field appears
     * to be null, we can scan prev&#39;s from the tail to
     * double-check.  The next field of cancelled nodes is set to
     * point to the node itself instead of null, to make life
     * easier for isOnSyncQueue.
     */</span>
    <span class="token keyword">volatile</span> <span class="token class-name">Node</span> next<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * The thread that enqueued this node.  Initialized on
     * construction and nulled out after use.
     */</span>
    <span class="token keyword">volatile</span> <span class="token class-name">Thread</span> thread<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Link to next node waiting on condition, or the special
     * value SHARED.  Because condition queues are accessed only
     * when holding in exclusive mode, we just need a simple
     * linked queue to hold nodes while they are waiting on
     * conditions. They are then transferred to the queue to
     * re-acquire. And because conditions can only be exclusive,
     * we save a field by using special value to indicate shared
     * mode.
     */</span>
    <span class="token class-name">Node</span> nextWaiter<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Returns true if node is waiting in shared mode.
     */</span>
    <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">isShared</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> nextWaiter <span class="token operator">==</span> <span class="token constant">SHARED</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Returns previous node, or throws NullPointerException if null.
     * Use when predecessor cannot be null.  The null check could
     * be elided, but is present to help the VM.
     *
     * <span class="token keyword">@return</span> the predecessor of this node
     */</span>
    <span class="token keyword">final</span> <span class="token class-name">Node</span> <span class="token function">predecessor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">NullPointerException</span> <span class="token punctuation">{</span>
        <span class="token class-name">Node</span> p <span class="token operator">=</span> prev<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">else</span>
            <span class="token keyword">return</span> p<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>    <span class="token comment">// Used to establish initial head or SHARED marker</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">,</span> <span class="token class-name">Node</span> mode<span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">// Used by addWaiter</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>nextWaiter <span class="token operator">=</span> mode<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>thread <span class="token operator">=</span> thread<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">,</span> <span class="token keyword">int</span> waitStatus<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// Used by Condition</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>waitStatus <span class="token operator">=</span> waitStatus<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>thread <span class="token operator">=</span> thread<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="queue" tabindex="-1"><a class="header-anchor" href="#queue" aria-hidden="true">#</a> Queue</h2><p>维护同步队列的头尾指针，以及同步状态 (锁状态) 变量。当线程获取同步状态失败时，会将当前线程以及等待状态封装在结点中，然后加入队列并阻塞线程。当同步状态释放后，队列中的头结点会被唤醒，使其再次尝试获取同步状态。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Head of the wait queue, lazily initialized.  Except for
 * initialization, it is modified only via method setHead.  Note:
 * If head exists, its waitStatus is guaranteed not to be
 * CANCELLED.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token keyword">volatile</span> <span class="token class-name">Node</span> head<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Tail of the wait queue, lazily initialized.  Modified only via
 * method enq to add new wait node.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token keyword">volatile</span> <span class="token class-name">Node</span> tail<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * The synchronization state.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">int</span> state<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下三个函数可以修改锁状态。当可能有多个线程修改锁状态时，需要使用线程安全的 CAS 函数；如果确定只有一个线程修改锁状态，那么直接使用普通的 <code>get()</code> / <code>set()</code> 即可。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the current value of synchronization state.
 * This operation has memory semantics of a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">volatile</span></span></span><span class="token punctuation">}</span> read.
 * <span class="token keyword">@return</span> current state value
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">getState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> state<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Sets the value of synchronization state.
 * This operation has memory semantics of a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">volatile</span></span></span><span class="token punctuation">}</span> write.
 * <span class="token keyword">@param</span> <span class="token parameter">newState</span> the new state value
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">setState</span><span class="token punctuation">(</span><span class="token keyword">int</span> newState<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    state <span class="token operator">=</span> newState<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Atomically sets synchronization state to the given updated
 * value if the current state value equals the expected value.
 * This operation has memory semantics of a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">volatile</span></span></span><span class="token punctuation">}</span> read
 * and write.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">expect</span> the expected value
 * <span class="token keyword">@param</span> <span class="token parameter">update</span> the new value
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if successful. False return indicates that the actual
 *         value was not equal to the expected value.
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">compareAndSetState</span><span class="token punctuation">(</span><span class="token keyword">int</span> expect<span class="token punctuation">,</span> <span class="token keyword">int</span> update<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// See below for intrinsics setup to support this</span>
    <span class="token keyword">return</span> unsafe<span class="token punctuation">.</span><span class="token function">compareAndSwapInt</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> stateOffset<span class="token punctuation">,</span> expect<span class="token punctuation">,</span> update<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>加入队列的过程需要保证线程安全，因此使用 CAS 的方式设置头尾结点。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Inserts node into queue, initializing if necessary. See picture above.
 * <span class="token keyword">@param</span> <span class="token parameter">node</span> the node to insert
 * <span class="token keyword">@return</span> node&#39;s predecessor
 */</span>
<span class="token keyword">private</span> <span class="token class-name">Node</span> <span class="token function">enq</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">Node</span> node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Node</span> t <span class="token operator">=</span> tail<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>t <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// Must initialize</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetHead</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                tail <span class="token operator">=</span> head<span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            node<span class="token punctuation">.</span>prev <span class="token operator">=</span> t<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetTail</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> node<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                t<span class="token punctuation">.</span>next <span class="token operator">=</span> node<span class="token punctuation">;</span>
                <span class="token keyword">return</span> t<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates and enqueues node for current thread and given mode.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">mode</span> Node.EXCLUSIVE for exclusive, Node.SHARED for shared
 * <span class="token keyword">@return</span> the new node
 */</span>
<span class="token keyword">private</span> <span class="token class-name">Node</span> <span class="token function">addWaiter</span><span class="token punctuation">(</span><span class="token class-name">Node</span> mode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Node</span> node <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Node</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// Try the fast path of enq; backup to full enq on failure</span>
    <span class="token class-name">Node</span> pred <span class="token operator">=</span> tail<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pred <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        node<span class="token punctuation">.</span>prev <span class="token operator">=</span> pred<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndSetTail</span><span class="token punctuation">(</span>pred<span class="token punctuation">,</span> node<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            pred<span class="token punctuation">.</span>next <span class="token operator">=</span> node<span class="token punctuation">;</span>
            <span class="token keyword">return</span> node<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">enq</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> node<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同步队列遵循 FIFO，头结点是 <strong>成功获取同步状态</strong> 的结点，头结点在释放同步状态时，唤醒后继结点。以下函数获取了当前结点的 <code>next</code>，然后调用 <code>LockSupport</code> 的 <code>unpark()</code> 函数唤醒后继结点线程。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Wakes up node&#39;s successor, if one exists.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">node</span> the node
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">unparkSuccessor</span><span class="token punctuation">(</span><span class="token class-name">Node</span> node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*
     * If status is negative (i.e., possibly needing signal) try
     * to clear in anticipation of signalling.  It is OK if this
     * fails or if status is changed by waiting thread.
     */</span>
    <span class="token keyword">int</span> ws <span class="token operator">=</span> node<span class="token punctuation">.</span>waitStatus<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ws <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
        <span class="token function">compareAndSetWaitStatus</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> ws<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Thread to unpark is held in successor, which is normally
     * just the next node.  But if cancelled or apparently null,
     * traverse backwards from tail to find the actual
     * non-cancelled successor.
     */</span>
    <span class="token class-name">Node</span> s <span class="token operator">=</span> node<span class="token punctuation">.</span>next<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">||</span> s<span class="token punctuation">.</span>waitStatus <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        s <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Node</span> t <span class="token operator">=</span> tail<span class="token punctuation">;</span> t <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> t <span class="token operator">!=</span> node<span class="token punctuation">;</span> t <span class="token operator">=</span> t<span class="token punctuation">.</span>prev<span class="token punctuation">)</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>t<span class="token punctuation">.</span>waitStatus <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span>
                s <span class="token operator">=</span> t<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token class-name">LockSupport</span><span class="token punctuation">.</span><span class="token function">unpark</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span>thread<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="exclusive-mode" tabindex="-1"><a class="header-anchor" href="#exclusive-mode" aria-hidden="true">#</a> Exclusive Mode</h2><h3 id="acquire" tabindex="-1"><a class="header-anchor" href="#acquire" aria-hidden="true">#</a> Acquire</h3><p>以下函数首先试图以线程安全的方式尝试获取同步状态，如果获取失败，则构造 <code>EXCLUSIVE</code> 模式的结点并加入同步队列尾部，最终线程以死循环的方式获取同步状态。如果无法获取到，则阻塞结点中的线程。被阻塞线程只能通过以下两种方式唤醒：</p><ul><li>前驱结点出队，唤醒当前结点</li><li>线程被中断</li></ul><p>当线程已经从这个函数中返回时，代表线程已经获取到了同步状态。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Acquires in exclusive mode, ignoring interrupts.  Implemented
 * by invoking at least once <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquire</span></span><span class="token punctuation">}</span>,
 * returning on success.  Otherwise the thread is queued, possibly
 * repeatedly blocking and unblocking, invoking <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquire</span></span><span class="token punctuation">}</span> until success.  This method can be used
 * to implement method <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Lock</span><span class="token punctuation">#</span><span class="token field">lock</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the acquire argument.  This value is conveyed to
 *        <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquire</span></span><span class="token punctuation">}</span> but is otherwise uninterpreted and
 *        can represent anything you like.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">acquire</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">tryAcquire</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
        <span class="token function">acquireQueued</span><span class="token punctuation">(</span><span class="token function">addWaiter</span><span class="token punctuation">(</span><span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">EXCLUSIVE</span><span class="token punctuation">)</span><span class="token punctuation">,</span> arg<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token function">selfInterrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>结点进入同步队列后，就开始自旋，不断尝试获取同步状态。只有前驱结点是头结点时，才能尝试获取同步状态：</p><ol><li>因为头结点线程释放同步状态后才会唤醒后继结点</li><li>维护队列的 FIFO 原则</li></ol><p>如果前驱结点是头结点，并且当前结点成功获取到了同步状态，那么就可以把头结点设为自己，并断开前驱结点的 <code>next</code> 引用。从而使前驱结点出队，当前结点成功获取到同步状态并成为队头。这里操作 <code>head</code> 指针不需要保证线程安全，因为只有当前线程会操作 <code>head</code> 指针。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Acquires in exclusive uninterruptible mode for thread already in
 * queue. Used by condition wait methods as well as acquire.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">node</span> the node
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the acquire argument
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if interrupted while waiting
 */</span>
<span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">acquireQueued</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">Node</span> node<span class="token punctuation">,</span> <span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">boolean</span> failed <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">boolean</span> interrupted <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">final</span> <span class="token class-name">Node</span> p <span class="token operator">=</span> node<span class="token punctuation">.</span><span class="token function">predecessor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> head <span class="token operator">&amp;&amp;</span> <span class="token function">tryAcquire</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">setHead</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
                p<span class="token punctuation">.</span>next <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span> <span class="token comment">// help GC</span>
                failed <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
                <span class="token keyword">return</span> interrupted<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">shouldParkAfterFailedAcquire</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
                <span class="token function">parkAndCheckInterrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                interrupted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>failed<span class="token punctuation">)</span>
            <span class="token function">cancelAcquire</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
  * Sets head of queue to be node, thus dequeuing. Called only by
  * acquire methods.  Also nulls out unused fields for sake of GC
  * and to suppress unnecessary signals and traversals.
  *
  * <span class="token keyword">@param</span> <span class="token parameter">node</span> the node
  */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">setHead</span><span class="token punctuation">(</span><span class="token class-name">Node</span> node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    head <span class="token operator">=</span> node<span class="token punctuation">;</span>
    node<span class="token punctuation">.</span>thread <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    node<span class="token punctuation">.</span>prev <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="release" tabindex="-1"><a class="header-anchor" href="#release" aria-hidden="true">#</a> Release</h3><p>当线程释放同步状态后，会通过 <code>unparkSuccessor()</code> 唤醒后继结点。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Releases in exclusive mode.  Implemented by unblocking one or
 * more threads if <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryRelease</span></span><span class="token punctuation">}</span> returns true.
 * This method can be used to implement method <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Lock</span><span class="token punctuation">#</span><span class="token field">unlock</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the release argument.  This value is conveyed to
 *        <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryRelease</span></span><span class="token punctuation">}</span> but is otherwise uninterpreted and
 *        can represent anything you like.
 * <span class="token keyword">@return</span> the value returned from <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryRelease</span></span><span class="token punctuation">}</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">release</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tryRelease</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Node</span> h <span class="token operator">=</span> head<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>h <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> h<span class="token punctuation">.</span>waitStatus <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span>
            <span class="token function">unparkSuccessor</span><span class="token punctuation">(</span>h<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Attempts to set the state to reflect a release in exclusive
 * mode.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This method is always invoked by the thread performing release.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The default implementation throws
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the release argument. This value is always the one
 *        passed to a release method, or the current state value upon
 *        entry to a condition wait.  The value is otherwise
 *        uninterpreted and can represent anything you like.
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if this object is now in a fully released
 *         state, so that any waiting threads may attempt to acquire;
 *         and <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise.
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalMonitorStateException</span></span> if releasing would place this
 *         synchronizer in an illegal state. This exception must be
 *         thrown in a consistent fashion for synchronization to work
 *         correctly.
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span> if exclusive mode is not supported
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">boolean</span> <span class="token function">tryRelease</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">UnsupportedOperationException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="shared-mode" tabindex="-1"><a class="header-anchor" href="#shared-mode" aria-hidden="true">#</a> Shared Mode</h2><p>共享模式与独占模式的区别是，同一时刻是否能有多个线程同时获取到同步状态。</p><h3 id="acquire-1" tabindex="-1"><a class="header-anchor" href="#acquire-1" aria-hidden="true">#</a> Acquire</h3><p>首先调用用户自行实现的 <code>tryAcquireShared()</code> 函数试图获取同步状态，返回值 <code>≥ 0</code> 意味着成功获取到了同步状态，否则说明获取同步状态失败，进入自旋等待。等待的过程依旧是，当前驱结点是头结点时，试图获取同步状态，如果成功，则从自旋状态下退出。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Acquires in shared mode, ignoring interrupts.  Implemented by
 * first invoking at least once <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquireShared</span></span><span class="token punctuation">}</span>,
 * returning on success.  Otherwise the thread is queued, possibly
 * repeatedly blocking and unblocking, invoking <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquireShared</span></span><span class="token punctuation">}</span> until success.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the acquire argument.  This value is conveyed to
 *        <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryAcquireShared</span></span><span class="token punctuation">}</span> but is otherwise uninterpreted
 *        and can represent anything you like.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">acquireShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tryAcquireShared</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
        <span class="token function">doAcquireShared</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Acquires in shared uninterruptible mode.
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the acquire argument
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">doAcquireShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">final</span> <span class="token class-name">Node</span> node <span class="token operator">=</span> <span class="token function">addWaiter</span><span class="token punctuation">(</span><span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">SHARED</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> failed <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">boolean</span> interrupted <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">final</span> <span class="token class-name">Node</span> p <span class="token operator">=</span> node<span class="token punctuation">.</span><span class="token function">predecessor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> head<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">int</span> r <span class="token operator">=</span> <span class="token function">tryAcquireShared</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token function">setHeadAndPropagate</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> r<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    p<span class="token punctuation">.</span>next <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span> <span class="token comment">// help GC</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>interrupted<span class="token punctuation">)</span>
                        <span class="token function">selfInterrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    failed <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
                    <span class="token keyword">return</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">shouldParkAfterFailedAcquire</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
                <span class="token function">parkAndCheckInterrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                interrupted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>failed<span class="token punctuation">)</span>
            <span class="token function">cancelAcquire</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="release-1" tabindex="-1"><a class="header-anchor" href="#release-1" aria-hidden="true">#</a> Release</h3><p>共享模式的锁释放操作：</p><ul><li>通知后继结点</li><li>保证锁释放的状态要传递下去</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Releases in shared mode.  Implemented by unblocking one or more
 * threads if <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryReleaseShared</span></span><span class="token punctuation">}</span> returns true.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the release argument.  This value is conveyed to
 *        <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryReleaseShared</span></span><span class="token punctuation">}</span> but is otherwise uninterpreted
 *        and can represent anything you like.
 * <span class="token keyword">@return</span> the value returned from <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">tryReleaseShared</span></span><span class="token punctuation">}</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">releaseShared</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">tryReleaseShared</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">doReleaseShared</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Release action for shared mode -- signals successor and ensures
 * propagation. (Note: For exclusive mode, release just amounts
 * to calling unparkSuccessor of head if it needs signal.)
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">doReleaseShared</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">/*
     * Ensure that a release propagates, even if there are other
     * in-progress acquires/releases.  This proceeds in the usual
     * way of trying to unparkSuccessor of head if it needs
     * signal. But if it does not, status is set to PROPAGATE to
     * ensure that upon release, propagation continues.
     * Additionally, we must loop in case a new node is added
     * while we are doing this. Also, unlike other uses of
     * unparkSuccessor, we need to know if CAS to reset status
     * fails, if so rechecking.
     */</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Node</span> h <span class="token operator">=</span> head<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>h <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> h <span class="token operator">!=</span> tail<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">int</span> ws <span class="token operator">=</span> h<span class="token punctuation">.</span>waitStatus<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>ws <span class="token operator">==</span> <span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">SIGNAL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSetWaitStatus</span><span class="token punctuation">(</span>h<span class="token punctuation">,</span> <span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">SIGNAL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token keyword">continue</span><span class="token punctuation">;</span>            <span class="token comment">// loop to recheck cases</span>
                <span class="token function">unparkSuccessor</span><span class="token punctuation">(</span>h<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>ws <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span>
                        <span class="token operator">!</span><span class="token function">compareAndSetWaitStatus</span><span class="token punctuation">(</span>h<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">PROPAGATE</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">continue</span><span class="token punctuation">;</span>                <span class="token comment">// loop on failed CAS</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>h <span class="token operator">==</span> head<span class="token punctuation">)</span>                   <span class="token comment">// loop if head changed</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="exclusive-timeout-mode" tabindex="-1"><a class="header-anchor" href="#exclusive-timeout-mode" aria-hidden="true">#</a> Exclusive Timeout Mode</h2><h3 id="acquire-2" tabindex="-1"><a class="header-anchor" href="#acquire-2" aria-hidden="true">#</a> Acquire</h3><p>如果能在指定时间段内获得同步状态则返回 <code>true</code>，否则返回 <code>false</code>。其本质在于计算剩余需要睡眠的时间间隔 <code>nanosTimeout</code>。每当线程被中断意外唤醒时，都需要重新计算剩余的睡眠间隔：<code>nanosTimeout -= now - lastTime</code>。如果睡眠间隔大于 <code>0</code> 表示还未超时，否则说明已经超时。</p><p>在一个死循环中，每次试图获取同步状态。如果没能获取成功，就统计一下剩余睡眠时间并判断是否超时。当剩余睡眠时间 <code>≤ spinForTImeoutTHreshold</code> (1000ns) 时，线程将不会重新等待，而是直接自旋等待。因为剩下的计时无法做到精确。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Acquires in exclusive timed mode.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">arg</span> the acquire argument
 * <span class="token keyword">@param</span> <span class="token parameter">nanosTimeout</span> max wait time
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if acquired
 */</span>
<span class="token keyword">private</span> <span class="token keyword">boolean</span> <span class="token function">doAcquireNanos</span><span class="token punctuation">(</span><span class="token keyword">int</span> arg<span class="token punctuation">,</span> <span class="token keyword">long</span> nanosTimeout<span class="token punctuation">)</span>
    <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>nanosTimeout <span class="token operator">&lt;=</span> <span class="token number">0L</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token keyword">long</span> deadline <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> nanosTimeout<span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">Node</span> node <span class="token operator">=</span> <span class="token function">addWaiter</span><span class="token punctuation">(</span><span class="token class-name">Node</span><span class="token punctuation">.</span><span class="token constant">EXCLUSIVE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> failed <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">final</span> <span class="token class-name">Node</span> p <span class="token operator">=</span> node<span class="token punctuation">.</span><span class="token function">predecessor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> head <span class="token operator">&amp;&amp;</span> <span class="token function">tryAcquire</span><span class="token punctuation">(</span>arg<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">setHead</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
                p<span class="token punctuation">.</span>next <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span> <span class="token comment">// help GC</span>
                failed <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
                <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            nanosTimeout <span class="token operator">=</span> deadline <span class="token operator">-</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nanosTimeout <span class="token operator">&lt;=</span> <span class="token number">0L</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">shouldParkAfterFailedAcquire</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> node<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
                nanosTimeout <span class="token operator">&gt;</span> spinForTimeoutThreshold<span class="token punctuation">)</span>
                <span class="token class-name">LockSupport</span><span class="token punctuation">.</span><span class="token function">parkNanos</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> nanosTimeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">interrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">InterruptedException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>failed<span class="token punctuation">)</span>
            <span class="token function">cancelAcquire</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>大致看懂了层次，但是对于队列的一些具体操作没看懂，还是直接看具体的锁的实现类吧。</p><p>该类的主要作用在于维护了内部等待队列，实现了所有的队列操作，并暴露 5 个函数需要被子类重写。这 5 个函数定义了修改锁状态的行为：</p><ul><li><code>tryAcquire()</code></li><li><code>tryRelease()</code></li><li><code>tryAcquireShared()</code></li><li><code>tryReleaseShared()</code></li><li><code>isHeldExclusively()</code></li></ul><p>因为对于这个类来说，它只抽象地知道锁是一个 <code>int</code> 类型的原子变量，并不知道其中每一位具体的含义是什么。这是由实现了具体锁的子类定义的。比如，<code>int</code> 中的某一位代表该锁是否被持有...</p><p>在子类实现的函数修改锁状态后，该类中的函数再对内部等待队列进行相应的操作。相当于这个类已经实现了同步队列操作的大致框架，但是有几个核心部分的函数需要由用户来自行实现。用户用不同方式实现后，就能使用各种不同功能的锁。</p><hr>`,78),o=[p];function c(i,l){return s(),a("div",null,o)}const d=n(t,[["render",c],["__file","Abstract Class - java.util.concurrent.locks.AbstractQueuedSynchronizer.html.vue"]]);export{d as default};
