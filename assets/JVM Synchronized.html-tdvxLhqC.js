import{_ as a,c as e,a as s,o as l}from"./app-aVGbliEg.js";const c={};function o(i,n){return l(),e("div",null,n[0]||(n[0]=[s(`<h1 id="jvm-synchronized" tabindex="-1"><a class="header-anchor" href="#jvm-synchronized"><span>JVM - Synchronized</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 05 / 14 14:25</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="重量级-轻量级" tabindex="-1"><a class="header-anchor" href="#重量级-轻量级"><span>重量级 / 轻量级</span></a></h2><p>在最初版本的 JVM 中，<code>synchronized</code> 关键字都是由 <strong>重量级锁</strong> 实现的。何为重量级锁？重量级锁是 OS 提供的锁服务，即 JVM (用户进程) 通过 <strong>系统调用</strong> 向 OS 内核申请锁资源。CPU 需要经过内核态与用户态的转换，所以开销较大。</p><p>而轻量级锁，在用户空间通过 <em>CAS (Compare and Swap)</em> 实现，避免了 OS 的状态切换。</p><h2 id="cas" tabindex="-1"><a class="header-anchor" href="#cas"><span>CAS</span></a></h2><p>CAS 的核心思想：</p><ul><li>一个线程将值 A 从内存读入 CPU 进行计算得到新值 B</li><li>在将新值 B 写回内存前，判断内存中的值是否依然是 A</li><li>如果内存中依然是 A，说明这一过程没有被别的线程干扰，将 B 写回内存</li><li>如果内存中的值不是 A，说明中途已有别的线程干扰，CAS 重新将内存中的值读入，重试上述步骤</li><li>如果 CAS 不成功，死循环重试，直至成功为止</li></ul><p>其中，最关键的是 <strong>判断内存的值是否依然是 A，并将 B 写回内存</strong> 这一过程。这一过程包含两步，为了确保正确，这一过程不能被打断，需要是一个原子操作。在 <code>java.util.concurrent.atomic</code> 包下，有很多 <code>Atomic</code> 开头的类，就是通过 CAS 实现的。通过分析代码看看这一过程如何做到不被打断。</p><p>以 <code>AtomicInteger</code> 为例。对于一个普通的 <code>int</code>，如果多个线程在对其进行 <code>++</code> 操作，如果不加 <code>synchronized</code> 进行同步，肯定会导致数据不一致的问题。而当多个线程同时调用 <code>AtomicInteger</code> 的 <code>incrementAndGet()</code> 函数 (也是 <code>++</code> 操作) 时，不用 <code>synchronized</code> 同步也能得到正确的结果。这个函数的实现：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Atomically increments by one the current value.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the updated value</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token function">incrementAndGet</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> unsafe<span class="token punctuation">.</span><span class="token function">getAndAddInt</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> valueOffset<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再往下层的 <code>unsafe</code> 类的代码已经看不到了，大致是一个死循环：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">do</span> <span class="token punctuation">{</span></span>
<span class="line">    v <span class="token operator">=</span> <span class="token function">getIntValue</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">while</span><span class="token punctuation">(</span><span class="token function">compareAndSwapInt</span><span class="token punctuation">(</span>v<span class="token punctuation">,</span> v <span class="token operator">+</span> n<span class="token punctuation">,</span> <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而再到 JVM 的 C++ 代码中去看 <code>compareAndSwapInt</code> 的具体实现，在 x86 平台下，使用了一条指令来实现上述的两步操作，从而实现了原子性：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">lock cmpxchg</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>其中，<code>cmpxchg</code> 指令实现了 CAS。而 <code>lock</code> 用于多核 CPU 的场景中，为了防止另一个 CPU core 干扰 CAS 的结果，需要用 <code>lock</code> 指令 (锁总线，不允许其它 CPU 访问总线) 来保证 CAS 的原子性。有硬件级别的高效实现 (锁定一个北桥信号)。</p><blockquote><p>称呼问题。CAS 操作被称为 <em>轻量级锁</em>、<em>自旋锁</em>、<em>无锁</em>......</p></blockquote><p>CAS 存在以下的问题：</p><h3 id="aba-问题" tabindex="-1"><a class="header-anchor" href="#aba-问题"><span>ABA 问题</span></a></h3><p>当线程将 A 从内存中读走并进行计算时，另一个线程将内存中的 A 值修改为 B，又另一个线程将内存中的 B 修改为 A。当原线程试图写回内存时，发现内存里的值依旧是 A，从而判断出中间没有线程干扰，将新值写回内存。而实际上中途内存的值已经被修改过了。这就是 ABA 问题。如果业务逻辑不允许这种情况发生，那么如何解决这个问题呢？</p><p><code>AtomicStampedReference</code> 等类提供了解决方法。这个类为一个对象维护了一个 <code>int</code> 类型的版本号，可以原子地更新。在 CAS 的过程中，不仅比较值，还要比较版本号。如果值相同而版本号不相同，那么说明出现过 ABA 现象，CAS 也会失败。另外，用 <code>boolean</code> 类型的标志位也可以解决类似的问题。</p><h3 id="自旋开销问题" tabindex="-1"><a class="header-anchor" href="#自旋开销问题"><span>自旋开销问题</span></a></h3><p>CAS 的本质是自旋等待，自旋等待的心理预期是乐观的，在竞争不太严重的情况下，CAS 总能快速成功。然而，在竞争严重的情况下，CAS 的自旋会浪费大量的 CPU 时间。</p><h3 id="单变量原子性问题" tabindex="-1"><a class="header-anchor" href="#单变量原子性问题"><span>单变量原子性问题</span></a></h3><p>CAS 只能保证一个共享变量的原子性。如果一个操作需要对多个共享变量进行修改，并保持原子性，CAS 就无法保证了。解决方案是将多个共享变量放进一个对象中进行 CAS。</p><h2 id="java-object-layout-jol" tabindex="-1"><a class="header-anchor" href="#java-object-layout-jol"><span>Java Object Layout (JOL)</span></a></h2><p>一个 Java 对象的 (堆) 内存布局：</p><ul><li>Mark Word <ul><li>记录锁信息</li><li>记录 GC 信息</li><li>记录 identity hash code</li></ul></li><li>Class pointer (指向 <code>xxx.class</code>)</li><li>Instance data (类成员变量)</li><li>Padding (使对象内存空间对齐 8 Bytes)</li></ul><p>其中，前两个部分共同构成 Object header (对象头)。当这个对象被 <code>synchronized</code> 关键字锁定后，mark word 的值会发生变化。这就是加锁的底层实现。</p><p>Java 中的每一个对象都可以作为锁。表现为：</p><ul><li>对于 <code>synchronized</code> 修饰的成员函数，锁是当前实例对象</li><li>对于静态的 <code>synchronized</code> 函数，锁是类的 Class 对象 (相当于 <code>synchronized(xxx.class) {}</code>)</li><li>对于 <code>synchronized</code> 的函数块，锁是括号内配置的对象</li></ul><h2 id="锁升级" tabindex="-1"><a class="header-anchor" href="#锁升级"><span>锁升级</span></a></h2><p>Mark word (8B, 64-bit) 中记录了锁升级信息。锁有下面的几种状态：</p><ul><li>无锁态 - 最低两位锁标志位为 <code>01</code>，第三位偏向锁位为 <code>0</code></li><li>偏向锁 - 最低两位锁标志位为 <code>01</code>，第三位偏向锁位为 <code>1</code></li><li>轻量级锁 - 最低两位锁标志位为 <code>00</code></li><li>重量级锁 - 最低两位锁标志位为 <code>10</code></li><li>GC 标记信息 (对象正被 GC) - 最低两位锁标志位为 <code>11</code></li></ul><p>当一个对象被 <code>new</code> 创建时，如果偏向锁未启用，则成为普通对象 (无锁态)；如果偏向锁已启用，则直接成为匿名偏向 (偏向锁) 状态。并在之后按其被并发访问的行为，逐步进行锁升级。</p><blockquote><p>偏向锁的启用会有一个时延 (默认 4 s)。上述内容只讲了偏向锁的由来，而当开发者确定其代码在运行时有不止一个线程在运行，那么就没有必要升级偏向锁，而是可以直接升级到自旋锁。</p><p>为什么要有这样的时延？因为 JVM 启动的初始 (4s) 时间内，会有大量的对象创建，竞争堆内存的相同位置。所以在这段时间内，干脆不启用偏向锁，使无锁态的对象直接升级为自旋锁。</p></blockquote><h3 id="偏向锁" tabindex="-1"><a class="header-anchor" href="#偏向锁"><span>偏向锁</span></a></h3><p>为什么要有偏向锁？从统计数据来看，多数 <code>synchronized</code> 修饰的函数在真正运行时，只会被一个线程占有。如果每次持有锁的过程中都要进行竞争机制 (进入内核)，会做很多无用功。在 <strong>第一个</strong> 线程试图获得锁时，直接将线程指针记录在锁信息中，就能持有该锁了，不需要进行锁竞争。线程指针被记录在 mark word 中的过程是由 CAS 操作实现的。</p><p>实际上它不是一把锁 (不需要锁竞争)，只是标注一下这个对象被哪个线程占用。当超过两个线程开始竞争这个偏向锁时，锁就会发生升级。优先升级到轻量级锁。</p><h3 id="轻量级锁" tabindex="-1"><a class="header-anchor" href="#轻量级锁"><span>轻量级锁</span></a></h3><p>也叫自旋锁 / 无锁 (无重量级锁 😂)。这个锁由 CAS 实现。等待锁的线程不停进行自旋 CAS，谁能成功 CAS，谁就获得了锁。每个线程会在栈中生成 Lock Record，并不断尝试将 LR 放入锁对象的 mark word 中。谁能成功放进去，谁就能持有这个锁。当锁被重入时，线程会在栈帧上生成多个 LR。</p><p>在竞争越发激烈的情况下，轻量级锁的效率会大大下降：</p><ul><li>锁被一个线程长时间持有</li><li>大量线程在因为等待锁而自旋 - 消耗大量 CPU 资源</li></ul><p>因此轻量级锁适用于执行操作时间短、并发线程少的场景。否则，当满足 <strong>竞争加剧</strong> 的规则时，轻量级锁将会升级为重量级锁 (before JDK 1.6)：</p><ul><li>自旋次数超过 10 次</li><li>等待线程超过 CPU 核心数的 1/2</li></ul><p>JDK 1.6 中引入了 <em>自适应自旋 (Adapative Self Spinning)</em>，由 JVM 根据之前的统计信息自行控制锁升级的规则和条件，不再需要手动调优。</p><h3 id="重量级锁" tabindex="-1"><a class="header-anchor" href="#重量级锁"><span>重量级锁</span></a></h3><p>重量级锁需要经过 OS 分配锁资源。OS 会为锁维护一个线程等待队列，在等待队列中的线程会睡眠等待，不再消耗 CPU 资源进行自旋。等到锁可用时，线程才被唤醒。</p><p>偏向锁也是可以直接升级为重量级锁的 (比如显式调用 <code>wait()</code>)。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><ol><li><code>synchronized</code> 关键字不能被继承，子类覆盖父类的同名函数时，默认不同步，需要显式声明</li><li>定义 <code>Interface</code> 时不能使用 <code>synchronized</code></li><li>构造函数中不能使用 <code>synchronized</code> 关键字，但可以用代码块级别的 <code>synchronized</code></li></ol><hr>`,55)]))}const p=a(c,[["render",o],["__file","JVM Synchronized.html.vue"]]),d=JSON.parse('{"path":"/notes/Java/JVM%20Synchronized.html","title":"JVM - Synchronized","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"重量级 / 轻量级","slug":"重量级-轻量级","link":"#重量级-轻量级","children":[]},{"level":2,"title":"CAS","slug":"cas","link":"#cas","children":[{"level":3,"title":"ABA 问题","slug":"aba-问题","link":"#aba-问题","children":[]},{"level":3,"title":"自旋开销问题","slug":"自旋开销问题","link":"#自旋开销问题","children":[]},{"level":3,"title":"单变量原子性问题","slug":"单变量原子性问题","link":"#单变量原子性问题","children":[]}]},{"level":2,"title":"Java Object Layout (JOL)","slug":"java-object-layout-jol","link":"#java-object-layout-jol","children":[]},{"level":2,"title":"锁升级","slug":"锁升级","link":"#锁升级","children":[{"level":3,"title":"偏向锁","slug":"偏向锁","link":"#偏向锁","children":[]},{"level":3,"title":"轻量级锁","slug":"轻量级锁","link":"#轻量级锁","children":[]},{"level":3,"title":"重量级锁","slug":"重量级锁","link":"#重量级锁","children":[]}]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]}],"git":{},"filePathRelative":"notes/Java/JVM Synchronized.md"}');export{p as comp,d as data};