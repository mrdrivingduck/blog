import{_ as e,c as n,a as s,o as l}from"./app-aVGbliEg.js";const i={};function c(t,a){return l(),n("div",null,a[0]||(a[0]=[s(`<h1 id="java-lock" tabindex="-1"><a class="header-anchor" href="#java-lock"><span>Java - Lock</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 12 / 26 14:20</p><p>Nanjing, Jiangsu, China</p><hr><p>结合最近阅读 JDK 源码 Lock 部分的一些体会，总结一下 Java 中几种不同概念的锁的区别 (反正以后面试也会问到)。</p><hr><h2 id="exclusive-lock-shared-lock" tabindex="-1"><a class="header-anchor" href="#exclusive-lock-shared-lock"><span>Exclusive Lock &amp;&amp; Shared Lock</span></a></h2><p>这两个概念已经在 JDK 的锁实现中得到了体现。在 Java 中除了使用 <code>synchronized</code> 关键字进行线程同步外，另外实现了两个锁对象：</p><ul><li>ReentrantLock - 可重入锁</li><li>ReadWriteLock - 读写锁</li></ul><p>这两个锁对象的具体功能，在读到它们的源代码时再具体分析。但从区别上讲，ReentrantLock 只能被一个线程持有，互斥访问，而 ReadWriteLock 中读锁是共享锁 (多个线程可以同时读取)。</p><hr><h2 id="公平-非公平" tabindex="-1"><a class="header-anchor" href="#公平-非公平"><span>公平 &amp;&amp; 非公平</span></a></h2><p>锁的底层包含一个带有内部 FIFO 队列的 <strong>AQS (AbstractQueuedSynchronizer)</strong>，通过对内部 <code>volatile</code> 状态变量的原子性读写来维护同步状态和等待线程。如果线程严格按照队列中的 FIFO 顺序依次获得锁，那么就很公平：</p><ul><li>由于严格按照排队顺序，线程不会产生饥饿，因为迟早会轮到它的</li><li>吞吐率较低，因为严格维护队列，那么入队出队时就会发生线程的休眠和唤醒</li></ul><p>非公平锁的含义就是，上来就直接试图占有锁，如果没有成功，再进入队列等待</p><ul><li>由于线程有概率不休眠而直接获得锁，吞吐率比公平锁高</li><li>已经处在等待队列上的线程可能因为一直被插队而产生饥饿</li></ul><p>在实例化一个锁时，可以带一个参数决定是否实例化为公平锁。AQS 提供了管理一个原子的状态信息及其等待队列的框架，而这个状态信息具体被如何使用，是继承该框架并实现具体功能的锁决定的：</p><ul><li>Semaphore 用这个状态变量来表示剩余数量</li><li>ReentrantLock 用这个状态变量表示拥有它的线程请求了多少次锁</li><li>......</li></ul><hr><h2 id="乐观-悲观" tabindex="-1"><a class="header-anchor" href="#乐观-悲观"><span>乐观 &amp;&amp; 悲观</span></a></h2><blockquote><p>首先回顾之前看 Linux 内核同步时，<strong>自旋锁</strong> 和 <strong>信号量</strong> 的区别：在遇上临界区竞争时，首先想到的应该是使线程休眠并等待。但是线程的休眠和唤醒是有时间代价的，如果等待的时间比这个时间代价短，那还不如直接干等着呢。这就是 Spin Lock (自旋锁)，说白了就是浪费一点点的 CPU 时间。</p></blockquote><p>这里悲观和乐观的概念，针对的实体就是锁的争用。所谓悲观，就是指 <strong>对锁的竞争成功持悲观态度</strong> - 当锁的争用较为严重时，竞争成功的概率就相对较低。因此，悲观锁在实现上一旦发现竞争失败，就使线程进入阻塞等待状态。乐观，即 <strong>对锁的竞争成功持乐观态度</strong>，当锁的争用不怎么严重时，竞争成功的概率较高。乐观锁一旦竞争失败，会很乐观地相信再过会儿就能获得锁，因此会进行自旋等待 (不睡眠)。独占锁是一种悲观锁的设计策略，而共享锁则一种乐观锁的设计策略。</p><h3 id="cas-mechanism" tabindex="-1"><a class="header-anchor" href="#cas-mechanism"><span>CAS Mechanism</span></a></h3><p>乐观锁在实现上使用了 <strong>CAS (Compare And Swap)</strong> 机制</p><p>CAS 的三个基本参数:</p><ul><li>内存地址 V</li><li>旧的预期值 A</li><li>新的预期值 B</li></ul><p>算法机制为: <strong>当内存地址 V 中的变量的值为 A 时，将其更新为 B (成功)；否则不更新 (失败)</strong>。当一个线程发现 V 中的变量不为 A，说明有其它的线程也在修改 A，本次 CAS 操作失败，线程进入自旋重试 CAS 操作:</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">compareAndSwap</span><span class="token punctuation">(</span><span class="token class-name">V</span><span class="token punctuation">,</span> <span class="token class-name">A</span><span class="token punctuation">,</span> <span class="token class-name">B</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>直到若干次 CAS 操作后，CAS 操作成功。CAS 的原子性由 CPU 的指令保证：</p><ul><li>CPU 提供的测试、交换指令保证了原子性 - 比如 x86 的 <code>XCHG</code></li><li>CAS 具体实现于 <code>sun.misc.Unsafe.compareAndSwapInt()</code> 中</li></ul><p>CAS 机制的特点:</p><ol><li>线程不睡眠</li><li>自旋具有一定的 CPU 开销</li><li>只能保证一个变量的原子性操作</li></ol><p>Java 中原子变量就是通过 CAS 机制实现的:</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ls java/util/concurrent/atomic</span>
<span class="line">AtomicBoolean.java              AtomicLongArray.java          AtomicReferenceFieldUpdater.java  LongAdder.java</span>
<span class="line">AtomicInteger.java              AtomicLongFieldUpdater.java   AtomicStampedReference.java       Striped64.java</span>
<span class="line">AtomicIntegerArray.java         AtomicMarkableReference.java  DoubleAccumulator.java            package-info.java       AtomicIntegerFieldUpdater.java  AtomicReference.java          DoubleAdder.java</span>
<span class="line">AtomicLong.java                 AtomicReferenceArray.java     LongAccumulator.java</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="aba-问题" tabindex="-1"><a class="header-anchor" href="#aba-问题"><span>ABA 问题</span></a></h3><p>CAS 机制下，如果一个值从 A 变为 B，又从 B 变为 A，那么 CAS 会认为值没有发生变化。具体可以看一看 <code>java/util/concurrent/atomic/AtomicStampedReference</code> 是怎么解决这个问题的。</p><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p>https://www.jianshu.com/p/ae25eb3cfb5d</p><p>https://www.cnblogs.com/fengzheng/p/9018152.html</p><p>https://blog.csdn.net/weixin_38035852/article/details/82081674</p><p>https://www.cnblogs.com/wuzhenzhao/p/10256225.html</p><hr>`,44)]))}const p=e(i,[["render",c],["__file","Java Lock.html.vue"]]),r=JSON.parse('{"path":"/notes/Java/Java%20Lock.html","title":"Java - Lock","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Exclusive Lock && Shared Lock","slug":"exclusive-lock-shared-lock","link":"#exclusive-lock-shared-lock","children":[]},{"level":2,"title":"公平 && 非公平","slug":"公平-非公平","link":"#公平-非公平","children":[]},{"level":2,"title":"乐观 && 悲观","slug":"乐观-悲观","link":"#乐观-悲观","children":[{"level":3,"title":"CAS Mechanism","slug":"cas-mechanism","link":"#cas-mechanism","children":[]},{"level":3,"title":"ABA 问题","slug":"aba-问题","link":"#aba-问题","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Java/Java Lock.md"}');export{p as comp,r as data};