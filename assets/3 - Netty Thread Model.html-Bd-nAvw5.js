import{_ as s,c as a,a as e,o as t}from"./app-aVGbliEg.js";const p="/blog/assets/7-2-Dey6-Smc.png",o={};function c(l,n){return t(),a("div",null,n[0]||(n[0]=[e('<h1 id="_3-netty-thread-model" tabindex="-1"><a class="header-anchor" href="#_3-netty-thread-model"><span>3 - Netty Thread Model</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 13 20:31</p><p>Longyou, Zhejiang, China</p><hr><p><strong>线程模型</strong> 指定了操作系统、编程语言、框架或者应用程序中的上下文管理的关键方面。如何及合适创建线程、调度线程将会对代码的执行产生显著的影响。由于具有多个 CPU 核心的计算机已经司空见惯，大多数现代应用程序都使用了复杂的多线程处理技术来有效利用系统资源。</p><p>在早期的 Java 中，多线程处理的具体方式是 <strong>按需创建和启动新的 Thread</strong> 来执行并发的任务单元，这种方式在高负载下工作得很差。Java 5 后引入了 <code>Executor</code> API，其中的线程池通过 <strong>缓存和重用 <code>Thread</code></strong> 极大地提高了性能：</p><ul><li>从线程池的空闲线程链表中选择一个 <code>Thread</code>，并指派其运行一个 <code>Runnable</code> 的任务</li><li>任务完成后，将 <code>Thread</code> 返回给列表</li></ul><p>线程的池化相比于简单地创建和销毁线程来说是一种进步，但并不能消除上下文切换所带来的开销。上下文切换的开销随着线程数量的增加而加速增大。</p><h2 id="interface-definition" tabindex="-1"><a class="header-anchor" href="#interface-definition"><span>Interface Definition</span></a></h2><p>事件循环是 Netty 的核心设计。从类结构上来说，<code>io.netty.channel.EventLoop</code> 派生自 <code>io.netty.concurrent</code> 包中的 <code>EventExecutor</code>，而 <code>EventExecutor</code> 又派生自 <code>java.util.concurrent</code> 中的 <code>ExecutorService</code>。也就是说，EventLoop 是基于 JUC 中的执行器框架扩展定义的。接口和类的继承关系图如下所示：</p><img src="'+p+`" alt="7-2" style="zoom:33%;"><p>在该模型下，一个 EventLoop 将由一个永远都不会改变的 <code>Thread</code> 驱动。任务 (<code>Runnable</code> 或 <code>Callable</code>) 可以直接提交给 EventLoop 以立即执行或调度执行。根据机器配置的不同，可以创建多个 EventLoop 实例以充分利用资源。所有的 I/O 操作都由已经分配给 EventLoop 的那个 <code>Thread</code> 处理 - 通过在同一个线程中处理某个 EventLoop 的所有事件，可以避免一些本可能需要的同步操作。</p><h3 id="eventexecutorgroup" tabindex="-1"><a class="header-anchor" href="#eventexecutorgroup"><span>EventExecutorGroup</span></a></h3><p>该接口的继承关系如下，负责维护多个 <code>EventExecutor</code> 的生命周期与它们的关闭。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> is responsible for providing the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span>&#39;s to use</span>
<span class="line"> * via its <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> method. Besides this, it is also responsible for handling their</span>
<span class="line"> * life-cycle and allows shutting them down in a global fashion.</span>
<span class="line"> *</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">EventExecutorGroup</span> <span class="token keyword">extends</span> <span class="token class-name">ScheduledExecutorService</span><span class="token punctuation">,</span> <span class="token class-name">Iterable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">EventExecutor</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口内新定义的函数主要包含 <strong>优雅地</strong> 关闭执行器。当 <code>shutdownGracefully()</code> 被调用后，<code>isShuttingDown()</code> 将开始返回 <code>true</code>，表示执行器准备开始关闭自己。与 <code>ExecutorService</code> 提供地 <code>shutdown()</code> 不同，<code>shutdownGracefully()</code> 指定了一段 <code>quietPeriod</code> 时间：只有在这段时间以内没有任何任务被提交，执行器才开始关闭自己；如果这段时间内有新任务被提交，那么 <code>quietPeriod</code> 又将重新开始计算。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if and only if all <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span>s managed by this <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span></span>
<span class="line"> * are being <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">shutdownGracefully</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span> shut down gracefully<span class="token punctuation">}</span> or was <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">isShutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span> shut down<span class="token punctuation">}</span>.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">boolean</span> <span class="token function">isShuttingDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Shortcut method for <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">shutdownGracefully</span><span class="token punctuation">(</span><span class="token keyword">long</span><span class="token punctuation">,</span> <span class="token keyword">long</span><span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> with sensible default values.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">terminationFuture</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span></span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> <span class="token function">shutdownGracefully</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Signals this executor that the caller wants the executor to be shut down.  Once this method is called,</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">isShuttingDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> starts to return <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span>, and the executor prepares to shut itself down.</span>
<span class="line"> * Unlike <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span>, graceful shutdown ensures that no tasks are submitted for <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>i</span><span class="token punctuation">&gt;</span></span>&#39;the quiet period&#39;<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>i</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * (usually a couple seconds) before it shuts itself down.  If a task is submitted during the quiet period,</span>
<span class="line"> * it is guaranteed to be accepted and the quiet period will start over.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">quietPeriod</span> the quiet period as described in the documentation</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">timeout</span>     the maximum amount of time to wait until the executor is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span></span>
<span class="line"> *                    regardless if a task was submitted during the quiet period</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">unit</span>        the unit of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">quietPeriod</span></span><span class="token punctuation">}</span> and <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">timeout</span></span><span class="token punctuation">}</span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">terminationFuture</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span></span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> <span class="token function">shutdownGracefully</span><span class="token punctuation">(</span><span class="token keyword">long</span> quietPeriod<span class="token punctuation">,</span> <span class="token keyword">long</span> timeout<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口还额外提供了在所有的 <code>EventExecutor</code> 都终结后的回调。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Future</span></span><span class="token punctuation">}</span> which is notified when all <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span>s managed by this</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> have been terminated.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> <span class="token function">terminationFuture</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口定义了函数，返回 <code>EventExecutorGroup</code> 内管理的 <code>EventExecutor</code> 中的一个。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns one of the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span>s managed by this <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span>.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">EventExecutor</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="eventloopgroup" tabindex="-1"><a class="header-anchor" href="#eventloopgroup"><span>EventLoopGroup</span></a></h3><p>该类继承自 <code>EventExecutorGroup</code> 接口：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Special <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> which allows registering <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Channel</span></span><span class="token punctuation">}</span>s that get</span>
<span class="line"> * processed for later selection during the event loop.</span>
<span class="line"> *</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">EventLoopGroup</span> <span class="token keyword">extends</span> <span class="token class-name">EventExecutorGroup</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该接口内额外定义了注册 <code>Channel</code> 的功能。多个 <code>Channel</code> 可以注册到 <code>EventLoopGroup</code> 上，并被其中的一个 <code>EventLoop</code> 选择：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Register a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Channel</span></span><span class="token punctuation">}</span> with this <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventLoop</span></span><span class="token punctuation">}</span>. The returned <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ChannelFuture</span></span><span class="token punctuation">}</span></span>
<span class="line"> * will get notified once the registration was complete.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">ChannelFuture</span> <span class="token function">register</span><span class="token punctuation">(</span><span class="token class-name">Channel</span> channel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Register a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Channel</span></span><span class="token punctuation">}</span> with this <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventLoop</span></span><span class="token punctuation">}</span> using a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ChannelFuture</span></span><span class="token punctuation">}</span>. The passed</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ChannelFuture</span></span><span class="token punctuation">}</span> will get notified once the registration was complete and also will get returned.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">ChannelFuture</span> <span class="token function">register</span><span class="token punctuation">(</span><span class="token class-name">ChannelPromise</span> promise<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="eventexecutor-eventloop" tabindex="-1"><a class="header-anchor" href="#eventexecutor-eventloop"><span>EventExecutor (EventLoop)</span></a></h3><p>该接口是特殊的 <code>EventExecutorGroup</code> 实现，也是 <code>EventLoop</code> 的父接口。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span> is a special <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> which comes</span>
<span class="line"> * with some handy methods to see if a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Thread</span></span><span class="token punctuation">}</span> is executed in a event loop.</span>
<span class="line"> * Besides this, it also extends the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> to allow for a generic</span>
<span class="line"> * way to access methods.</span>
<span class="line"> *</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">EventExecutor</span> <span class="token keyword">extends</span> <span class="token class-name">EventExecutorGroup</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口定义了确定一个线程是否是 EventLoop 线程的函数。Netty 线程模型的卓越性能取决于对于当前正在执行的 <code>Thread</code> <strong>身份</strong> 的确定：</p><ul><li>如果当前线程正是 EventLoop 线程，那么任务将被立刻执行</li><li>否则 EventLoop 将调度该任务稍后执行，保存在内部队列中</li></ul><p>每个 EventLoop 都有自己的任务队列，独立于任何其它 EventLoop。因此，同一个 EventLoop 内部无需额外同步。另外，不能将一个执行时间较长的任务放入执行队列，否则将会阻塞同一个 EventLoop 线程将要执行的其它任务。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Calls <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">inEventLoop</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> with <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Thread</span><span class="token punctuation">#</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> as argument</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">boolean</span> <span class="token function">inEventLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Return <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the given <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Thread</span></span><span class="token punctuation">}</span> is executed in the event loop,</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">false</span></span></span><span class="token punctuation">}</span> otherwise.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">boolean</span> <span class="token function">inEventLoop</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>EventExecutor</code> 能够通过 <code>parent()</code> 获得 <code>EventExecutorGroup</code> 的引用：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Return the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutorGroup</span></span><span class="token punctuation">}</span> which is the parent of this <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">EventExecutor</span></span><span class="token punctuation">}</span>,</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">EventExecutorGroup</span> <span class="token function">parent</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="eventloop-thread-allocation" tabindex="-1"><a class="header-anchor" href="#eventloop-thread-allocation"><span>EventLoop Thread Allocation</span></a></h2><h3 id="asynchronous-transportation" tabindex="-1"><a class="header-anchor" href="#asynchronous-transportation"><span>Asynchronous Transportation</span></a></h3><p>异步传输的实现只用了少量的 EventLoop 线程，每个 EventLoop 被多个 Channel 共享。通过尽可能少的 EventLoop 线程支撑大量的 Channel 能够减少内存开销与上下文切换开销。所有的 EventLoop 都由 EventLoopGroup 分配，每个 EventLoop 与一个 <code>Thread</code> 相关联。EventLoopGroup 会为每一个新创建的 Channel 分配一个 EventLoop 来处理，当前的默认实现是 <em>round-robin</em>。对于一个 Channel 来说，整个生命周期内的所有操作都由一个 EventLoop Thread 执行。</p><h3 id="blocking-transportation" tabindex="-1"><a class="header-anchor" href="#blocking-transportation"><span>Blocking Transportation</span></a></h3><p>由于阻塞传输的特性，每个 Channel 都将被分配给一个 EventLoop (即一个 <code>Thread</code>)，得到的保证是每个 Channel 的 I/O 事件只会被一个 <code>Thread</code> 处理，这个 <code>Thread</code> 也将只处理这一个 Channel 的事件。这种设计在满足阻塞场景的同时，也保证了 Netty 编程模式的一致性。</p>`,41)]))}const u=s(o,[["render",c],["__file","3 - Netty Thread Model.html.vue"]]),r=JSON.parse('{"path":"/netty-in-action-notes/3%20-%20Netty%20Thread%20Model.html","title":"3 - Netty Thread Model","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Interface Definition","slug":"interface-definition","link":"#interface-definition","children":[{"level":3,"title":"EventExecutorGroup","slug":"eventexecutorgroup","link":"#eventexecutorgroup","children":[]},{"level":3,"title":"EventLoopGroup","slug":"eventloopgroup","link":"#eventloopgroup","children":[]},{"level":3,"title":"EventExecutor (EventLoop)","slug":"eventexecutor-eventloop","link":"#eventexecutor-eventloop","children":[]}]},{"level":2,"title":"EventLoop Thread Allocation","slug":"eventloop-thread-allocation","link":"#eventloop-thread-allocation","children":[{"level":3,"title":"Asynchronous Transportation","slug":"asynchronous-transportation","link":"#asynchronous-transportation","children":[]},{"level":3,"title":"Blocking Transportation","slug":"blocking-transportation","link":"#blocking-transportation","children":[]}]}],"git":{},"filePathRelative":"netty-in-action-notes/3 - Netty Thread Model.md"}');export{u as comp,r as data};