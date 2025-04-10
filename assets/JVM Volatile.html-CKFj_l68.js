import{_ as s,c as a,a as e,o as l}from"./app-CT9FvwxE.js";const p="/blog/assets/java-read-final-BAr3alCk.png",t={};function i(c,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="jvm-volatile" tabindex="-1"><a class="header-anchor" href="#jvm-volatile"><span>JVM - Volatile</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 05 / 15 11:56</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="volatile-的基本功能" tabindex="-1"><a class="header-anchor" href="#volatile-的基本功能"><span>Volatile 的基本功能</span></a></h2><ul><li>线程可见性</li><li>禁止指令重排序</li></ul><h3 id="线程可见性" tabindex="-1"><a class="header-anchor" href="#线程可见性"><span>线程可见性</span></a></h3><p>Java 的内存模型 (JMM) 规定，堆内存有主内存与线程私有内存之分。线程 A 在访问内存时，从主内存中将值拷贝到线程私有内存中，并访问线程私有内存中的值。如果中途有另一个线程 B 修改了主内存中的值，线程 A 依旧访问线程私有内存，而不是主内存中的新值。私有内存只是 JMM 中的一个抽象概念，并不真实存在，可能涵盖缓存、写缓冲、寄存器等硬件。</p><p><code>volatile</code> 修饰主内存中的值，保持该值的线程可见性。该关键字使得线程每次访问该值时，都需要将值从主内存中读到私有内存才能访问；当线程修改该值后，也立刻将其刷新到主内存中。由缓存一致性协议保证。</p><h3 id="禁止指令重排序" tabindex="-1"><a class="header-anchor" href="#禁止指令重排序"><span>禁止指令重排序</span></a></h3><p>为什么会有指令重排序？当 CPU 在进行一些相对较慢的操作 (访问内存) 时，在等待内存响应的过程中，可以先执行之后的一些无关指令 (没有数据依赖)，从而提升效率。如果在某些场合下没有禁止指令重排序，可能会带来问题。JVM 规范中，有八种需要禁止指令重排序的场景 (happens-before)，除这八个场景外，指令可以重排序以优化性能：</p><ul><li>Load-Load 重排序</li><li>Load-Store 重排序</li><li>Store-Store 重排序</li><li>Store-Load 重排序</li></ul><p>不同 CPU 对于重排序的支持不同，不过常用的 CPU 基本上都支持 Store-Load 重排序 (指令先写后读 → 内存先读后写)，不允许数据依赖重排序。</p><blockquote><p>现代 CPU 普遍使用 <strong>写缓冲区</strong> 临时保存向内存写入的数据：</p><ul><li>避免 CPU 停顿等待向内存写入数据</li><li>合并写缓冲区对同一内存地址的多次写，减少对内存总线的占用</li></ul><p>但是每个 CPU 核心的写缓冲区只对自身可见，其它核心不可见。因此执行写指令 + 读指令体现为写入写缓冲区 + 从内存中读取 + 写缓冲区写回内存，因此表现为先读后写，即重排序。</p></blockquote><p>为了保证内存的线程可见性，Java 编译器会在生成指令序列的适当位置插入 <strong>内存屏障指令</strong> 以禁止特定类型的指令重排序。JMM 规定的内存屏障包含四类：</p><table><thead><tr><th>Memory Barrier</th><th>Description</th></tr></thead><tbody><tr><td>Load-Load Barrier</td><td>确保屏障前 load 指令的装载先于屏障后 load 指令的装载</td></tr><tr><td>Store-Store Barrier</td><td>确保屏障前 store 指令刷新到主内存后，屏障后的 store 指令才刷新到主内存</td></tr><tr><td>Load-Store Barrier</td><td>确保屏障前 load 指令先装载，然后屏障后的 store 指令才刷新到主内存</td></tr><tr><td>Store-Load Barrier</td><td>确保屏障前的 store 先刷新到主内存，然后屏障后的 load 指令才装载数据</td></tr></tbody></table><p>其中，Store-Load 屏障同时具备其它三个屏障的效果，同时有着最昂贵的开销。现在的多核 CPU 基本都支持这个屏障。</p><blockquote><p>CPU 中的写缓冲区我觉得可以类比为磁盘与内存之间的缓冲区问题，简而言之就是读比写快很多。所以 MySQL 中会有 insert buffer 用于合并对于同一个磁盘页的多次写操作，从而减少 I/O 次数 - 就是因为将脏页写回内存的速度远远慢于从内存读取数据的速度。</p></blockquote><h3 id="指令重排序引发的问题" tabindex="-1"><a class="header-anchor" href="#指令重排序引发的问题"><span>指令重排序引发的问题</span></a></h3><p>一个对象的创建过程 (字节码)：</p><ul><li><code>new</code> (分配对象占用的内存) (<strong>成员变量被赋值为默认值</strong>)</li><li><code>dup</code></li><li><code>invokespecial &lt;T.&lt;init&gt;&gt;</code> (调用对象构造函数) (<strong>成员变量被赋值为指定值</strong>)</li><li><code>astore_1</code> (将对象的引用与对象的内存建立关系 (<code>Object o != null</code>))</li><li><code>return</code></li></ul><p>单例模式的分类：</p><ul><li><p>饿汉式单例模式：(不管实例会不会被使用都会被实例化)</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Single</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Single</span> <span class="token constant">INSTANCE</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">private</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * ......</span>
<span class="line">     */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>懒汉式单例模式：(实例不被使用就不会被实例化)</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Single</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">private</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token constant">INSTANCE</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ul><p>对于懒汉式的单例模式，在多线程场景下，如何保证创建的对象唯一？或许可以给 <code>getInstance()</code> 加 <code>synchronized</code> 关键字，但是锁的粒度太粗 (万一该函数中除了实例化对象以外，还有一些不需要同步的业务逻辑呢？)。改进：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">synchronized</span> <span class="token punctuation">(</span><span class="token class-name">Single</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token constant">INSTANCE</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但是这种情况还是会有问题。当线程 A 通过了 <code>INSTANCE == null</code> 的条件后，线程 B 也通过了该条件并成功获得锁创建了对象，并释放了锁；此时线程 A 又会获得锁并创建一个新的实例。</p><p>显然，在进入临界区以后，需要再次判断实例是否为空，如果还是为空，再进行实例化。因此最终的改进版又被称为 Double Check Lock (DCL)：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">synchronized</span> <span class="token punctuation">(</span><span class="token class-name">Single</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token constant">INSTANCE</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，外面的 <code>INSTANCE == null</code> 可以防止在每次调用 <code>getInstance()</code> 时都进入 <code>synchronized</code> 块进行同步，损失性能 (试想如果没有外面这个 <code>if</code> 的情况)；内部的 <code>INSTANCE == null</code> 用于保证只实例化一个对象。那么，<code>INSTANCE</code> 是否需要加 <code>volatile</code> 呢？如果要，为什么呢？</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Single</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">volatile</span> <span class="token class-name">Single</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span> <span class="token comment">// ?</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">private</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">Single</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span><span class="token class-name">Single</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">INSTANCE</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token constant">INSTANCE</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Single</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token constant">INSTANCE</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时，只关注对象创建过程中的三条字节码：</p><ol><li><code>new</code></li><li><code>invokespecial &lt;T.&lt;init&gt;&gt;</code></li><li><code>astore_1</code></li></ol><p>假设发生了如下形式的重排序：</p><ol><li><code>new</code></li><li><code>astore_1</code></li><li><code>invokespecial &lt;T.&lt;init&gt;&gt;</code></li></ol><p>当进行对象实例化的线程 A 执行完 2 时，另一个线程 B 在判断 <code>INSTANCE == null</code> 时会发现此时 <code>INSTANCE</code> 不为空了，那么线程 B 就认为对象已经实例化完毕，可以直接使用了。而实际上此时对象的构造函数还没有被调用，对象中的成员变量全部都是默认值 <code>0</code>，如果直接使用这个半初始化的对象会有问题。因此，<code>INSTANCE</code> 对象需要修饰为 <code>volatile</code>，禁止对这段内存的访问进行指令重排序，从而保证实例被初始化完成后才能被使用。</p><h2 id="volatile-的底层实现" tabindex="-1"><a class="header-anchor" href="#volatile-的底层实现"><span>Volatile 的底层实现</span></a></h2><p>Volatile 底层通过 <strong>内存屏障 (Memory Barrier)</strong> 来实现，其内存语义为：</p><ul><li>写 volatile 变量时，JMM 将线程私有内存中的共享变量刷新到主内存</li><li>读 volatile 变量时，JMM 将私有内存中的变量置为无效，重新从主内存中读取共享变量</li></ul><p>对于 volatile 写操作来说，需要保证的是：</p><ol><li>在 volatile 写操作之前，其它写操作已经完成 (不允许其它写操作重排序到 volatile 写之后)</li><li>在 volatile 写操作完成之后，之后的读写操作才可以继续进行 (不允许其它读写操作重排序到 volatile 写之前)</li></ol><p>由此可以推导出 volatile 写的内存屏障实现方式：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Store-Store barrier --&gt; volatile write --&gt; Store-Load barrier</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>对于 volatile 读操作来说，需要保证的是：</p><ol><li>在 volatile 读操作之前，其它写操作已经对所有 CPU 可见</li><li>在 volatile 读操作之后，其它读写操作才可以继续进行</li></ol><p>理论上，第一点需要一个 Store-Load 屏障，第二点需要 Load-Load 屏障 + Load-Store 屏障。但是之前的 volatile 写操作的后面已经加上了 Store-Load 屏障，所以第一点实际上就不需要额外的屏障指令了。</p><blockquote><p>Store-Load 屏障其实既可以加在 volatile 写操作的后面，也可以加在 volatile 读操作的前面。但是，大部分 <code>volatile</code> 的使用场景是一个线程写，多个线程读，所以把屏障加在写操作后面能够带来可观的效率提升。JMM 的实现遵循的原则：尽可能保守，以确保正确；在正确的前提下追求效率。</p></blockquote><p>由此推导出 volatile 读的内存屏障实现方式：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">[Store-Load barrier] (optional) --&gt; volatile read --&gt; (Load-Store + Load-Load) barrier</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>之后，对于不同的 CPU 提供的不同松紧度的内存模型，内存屏障指令的插入还可以根据具体的 CPU 而继续优化。比如，x86 CPU 只会做 <strong>写 - 读重排序</strong>，那么只需要在 volatile 写操作之后加上 Store-Load 屏障即可。因此，x86 架构下 volatile 写的开销会比 volatile 读的开销大很多。</p><p>HotSpot JVM 使用 <code>lock addl</code> 指令实现了所有功能。因为这条指令的行为能够实现上述的屏障功能。当然，也可以通过其它指令来实现屏障。</p><h2 id="final-的内存语义" tabindex="-1"><a class="header-anchor" href="#final-的内存语义"><span>Final 的内存语义</span></a></h2><p>理论上与本文无关，但是既然提到了内存屏障，就顺便记录一下。</p><p>写 <code>final</code> 域的重排序规则要求 JMM 禁止把 <code>final</code> 域的写操作重排序到构造函数之外。在构造函数 <code>return</code> 之前，需要插入一个 Store-Store 屏障，保证对象引用被任意线程可见 (对象引用被赋值给变量) 之前，对象的 <code>final</code> 域已经被正确初始化 (但普通变量不一定)。时序图如图所示，当一个并发的读操作进行时，会读取到正确的 <code>final</code> 值和错误的普通值 (因此需要类似 DCL 之类的反复 check)：</p><img src="`+p+`" alt="java-read-final" style="zoom:50%;"><p>读 <code>final</code> 域的重排序规则要求禁止重排序 <strong>初次读对象引用</strong> 和 <strong>初次读对象的 <code>final</code> 域</strong> 两个步骤，也就是需要保证在读一个对象的 <code>final</code> 域之前，一定会先读包含这个域的对象引用。因此在读 <code>final</code> 之前需要插入一个 Load-Load 屏障。实际上，由于这两个操作有依赖关系，大部分 CPU 都不会重排序这两个操作。</p><h2 id="缓存一致性协议" tabindex="-1"><a class="header-anchor" href="#缓存一致性协议"><span>缓存一致性协议</span></a></h2><p>当一个共享变量被并发操作时，肯定存在于多个 CPU 核心的 cache 中。如何保证它们的一致性？在 Java 中，被 <code>volatile</code> 变量修饰的共享变量进行写操作时会多出汇编代码，完成如下功能：</p><ol><li>修改 cache line 中的数据后，将数据写回内存</li><li>写回内存的操作使得其它核心的 cache line 中该内存地址的数据 <strong>无效</strong></li></ol><p>从实现上来说，维护共享变量的一致性可以有两种方式：</p><ul><li>锁总线 - 某个核心独占共享内存，其它核心的操作将被阻塞 - 开销较大，其它核心的无关操作也会被阻塞</li><li>锁缓存 - 锁定共享内存对应的缓存，强令这块缓存写回内存，同时其它缓存副本无效</li></ul><p>锁缓存是由 <strong>缓存一致性协议</strong> 保证的。每个 CPU 核心通过嗅探总线上传播的数据，检查自己 cache 中的数据是否过期。这样，多个 CPU 核心不会同时修改由两个以上 CPU 缓存的内存数据。Intel 系列处理器使用 <em>MESI</em> 缓存一致性协议：</p><ul><li>Modified</li><li>Exclusive</li><li>Shared</li><li>Invalid</li></ul><p>处理器使用总线嗅探技术保证核心内部缓存、系统内存、其它核心缓存保持一致。</p><h2 id="cache-line" tabindex="-1"><a class="header-anchor" href="#cache-line"><span>Cache Line</span></a></h2><p>根据程序和数据的 <strong>局部性原理</strong>，CPU 一次性将一块数据读入 cache，这种块单位被称为 cache line，大小为 64B (工业实践经验)。一般来说一级缓存和二级缓存由每个 CPU 核心独占，三级缓存由多个 CPU 核心共享。</p><h3 id="消除伪共享" tabindex="-1"><a class="header-anchor" href="#消除伪共享"><span>消除伪共享</span></a></h3><p>两个线程在访问同一 cache line 中的非共享数据时，会导致彼此的 cache line 不停地失效，因此两个线程需要不断从内存中重新拷贝新的 cache line，影响了性能。如果强行使两个线程要访问的数据位于不同的 cache line 中，就能避免这种情况了。比如，对于一个 RingBuffer，假设 head 与 tail 位于同一个缓存行中，生产者线程在 tail 产生资源，消费者线程在 head 消费资源，两个线程就会频繁使得对方的 cache line 失效。</p><p>有一种很牛啤的代码写法：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">protected</span> <span class="token keyword">long</span> p1<span class="token punctuation">,</span> p2<span class="token punctuation">,</span> p3<span class="token punctuation">,</span> p4<span class="token punctuation">,</span> p5<span class="token punctuation">,</span> p7<span class="token punctuation">,</span> p7<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">long</span> xxx<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token keyword">long</span> p9<span class="token punctuation">,</span> p10<span class="token punctuation">,</span> p11<span class="token punctuation">,</span> p12<span class="token punctuation">,</span> p13<span class="token punctuation">,</span> p14<span class="token punctuation">,</span> p15<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就使得中间的数据在任何情况下都不会与其它的数据共存于同一个缓存行中，从而消除了伪共享。在 JDK 1.8 中，用 <code>@sun.misc.Contended</code> 注解修饰一个类时，会使这个类的成员变量位于不同的 cache line，从而省略了上述的写法。</p><blockquote><p>使用上述注解需要打开 JVM 的 <code>-XX:-RestrictContended</code> 选项。</p></blockquote><p>这种写法有两个前提：</p><ol><li>缓存行大小为 64B</li><li>共享变量不会被频繁写 - 因为只有写操作才会锁缓存</li></ol><hr>`,75)]))}const d=s(t,[["render",i],["__file","JVM Volatile.html.vue"]]),r=JSON.parse('{"path":"/notes/Java/JVM%20Volatile.html","title":"JVM - Volatile","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Volatile 的基本功能","slug":"volatile-的基本功能","link":"#volatile-的基本功能","children":[{"level":3,"title":"线程可见性","slug":"线程可见性","link":"#线程可见性","children":[]},{"level":3,"title":"禁止指令重排序","slug":"禁止指令重排序","link":"#禁止指令重排序","children":[]},{"level":3,"title":"指令重排序引发的问题","slug":"指令重排序引发的问题","link":"#指令重排序引发的问题","children":[]}]},{"level":2,"title":"Volatile 的底层实现","slug":"volatile-的底层实现","link":"#volatile-的底层实现","children":[]},{"level":2,"title":"Final 的内存语义","slug":"final-的内存语义","link":"#final-的内存语义","children":[]},{"level":2,"title":"缓存一致性协议","slug":"缓存一致性协议","link":"#缓存一致性协议","children":[]},{"level":2,"title":"Cache Line","slug":"cache-line","link":"#cache-line","children":[{"level":3,"title":"消除伪共享","slug":"消除伪共享","link":"#消除伪共享","children":[]}]}],"git":{},"filePathRelative":"notes/Java/JVM Volatile.md"}');export{d as comp,r as data};
