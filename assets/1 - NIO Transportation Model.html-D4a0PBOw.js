import{_ as s,c as a,a as p,o as t}from"./app-CT9FvwxE.js";const e={};function c(o,n){return t(),a("div",null,n[0]||(n[0]=[p(`<h1 id="_1-nio-transportation-model" tabindex="-1"><a class="header-anchor" href="#_1-nio-transportation-model"><span>1 - NIO Transportation Model</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 13 0:54</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="阻塞-i-o-bio-oio" tabindex="-1"><a class="header-anchor" href="#阻塞-i-o-bio-oio"><span>阻塞 I/O (BIO / OIO)</span></a></h2><p>早期的 Java API (<code>java.net</code>) 只支持本地 OS 的 socket 库提供的阻塞函数。由于函数的阻塞，如果想要同时管理多个并发连接的客户端，需要为每个客户端建立一个线程来服务。常见的编程范式：</p><ol><li>实例化一个 <code>ServerSocket</code> 并绑定端口</li><li>在死循环中调用 <code>accept()</code> 阻塞</li><li>为新连接的 <code>Socket</code> 对象创建线程服务</li></ol><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">ServerSocket</span> serverSocket <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ServerSocket</span><span class="token punctuation">(</span><span class="token number">8080</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">Socket</span> clientSocket <span class="token operator">=</span> serverSocket<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">new</span> <span class="token class-name">Thread</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token class-name">OutputStream</span> out <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                out <span class="token operator">=</span> clientSocket<span class="token punctuation">.</span><span class="token function">getOutputStream</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                out<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span><span class="token string">&quot;hello&quot;</span><span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                out<span class="token punctuation">.</span><span class="token function">flush</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                e<span class="token punctuation">.</span><span class="token function">printStackTrace</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>out <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        out<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>clientSocket <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        clientSocket<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    e<span class="token punctuation">.</span><span class="token function">printStackTrace</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>serverSocket <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">            serverSocket<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            e<span class="token punctuation">.</span><span class="token function">printStackTrace</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>传统阻塞 I/O 无法支撑大量的并发连接，原因如下：</p><ul><li>在任何时候都会有大量线程处于休眠状态</li><li>每个线程的调用栈都被分配了内存</li><li>上下文切换的开销很大</li></ul><h2 id="非阻塞-i-o-nio" tabindex="-1"><a class="header-anchor" href="#非阻塞-i-o-nio"><span>非阻塞 I/O (NIO)</span></a></h2><p>如今的 OS 本地 socket 库提供了非阻塞的调用：</p><ul><li>可以对 socket 进行配置，使读写调用在没有数据时 <strong>立刻返回</strong></li><li>OS 提供事件通知 API (<strong>I/O 多路复用</strong>) 注册一组非阻塞的 socket，确定它们中是否包含任何已有数据可供读写的 socket</li></ul><p>Java 在 2002 年的 JDK 1.4 中引入了 <code>java.nio</code>，提供了对非阻塞 I/O 的支持。其中，<code>java.nio.channels.Selector</code> 是非阻塞 I/O 的关键。它使用了 I/O 多路复用 API 向 OS 随时查询多个读写操作的完成状态。因此，单一的线程就可以处理多个并发的连接。多路复用器背后充当的功能是一个 <strong>注册表</strong>：对注册表的一次请求，能够获知已注册的所有 channel <strong>是否发生了状态变化</strong>。可能的状态有：</p><ul><li><code>OP_ACCEPT</code> - 新的 channel 已被接受并就绪</li><li><code>OP_CONNECT</code> - Channel 连接已被建立</li><li><code>OP_READ</code> - Channel 中已有就绪可被读取的数据</li><li><code>OP_WRITE</code> - Channel 已就绪被用于写数据</li></ul><p>与阻塞 I/O 相比，非阻塞 I/O 模型提供了更好的资源管理：</p><ul><li>使用较少的线程就可以处理许多连接，减少了内存和上下文切换的开销</li><li>没有 I/O 操作需要处理时，线程也可被用于其它任务</li></ul><p>编程范式主要包含几个部分：</p><ol><li>绑定 <code>ServerSocket</code> 到端口，并设置为非阻塞模式，注册 <code>ACCEPT</code> 事件</li><li>在死循环中调用 <code>select()</code> 轮询注册后的所有事件</li><li>如果出现 <code>ACCEPT</code> 事件，那么立刻调用 <code>accept()</code>，并将获取到的 socket 也设置为非阻塞，并注册该 socket 的 <code>READ</code> 和 <code>WRITE</code> 事件到 selector 上</li><li>如果出现 <code>READ</code> 或 <code>WRITE</code> 事件，那么获取到相应的 buffer 并读取或写入</li></ol><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">ServerSocketChannel</span> serverChannel <span class="token operator">=</span> <span class="token class-name">ServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">open</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">serverChannel<span class="token punctuation">.</span><span class="token function">configureBlocking</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token class-name">ServerSocket</span> serverSocket <span class="token operator">=</span> serverChannel<span class="token punctuation">.</span><span class="token function">socket</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">serverSocket<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">InetSocketAddress</span><span class="token punctuation">(</span><span class="token number">8080</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token class-name">Selector</span> selector <span class="token operator">=</span> <span class="token class-name">Selector</span><span class="token punctuation">.</span><span class="token keyword">open</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">serverChannel<span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>selector<span class="token punctuation">,</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_ACCEPT</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">ByteBuffer</span> msg <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">wrap</span><span class="token punctuation">(</span><span class="token string">&quot;Hello&quot;</span><span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">        selector<span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// blocked</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        e<span class="token punctuation">.</span><span class="token function">printStackTrace</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SelectionKey</span><span class="token punctuation">&gt;</span></span> readyKeys <span class="token operator">=</span> selector<span class="token punctuation">.</span><span class="token function">selectedKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SelectionKey</span><span class="token punctuation">&gt;</span></span> iter <span class="token operator">=</span> readyKeys<span class="token punctuation">.</span><span class="token function">iterator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>iter<span class="token punctuation">.</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">SelectionKey</span> key <span class="token operator">=</span> iter<span class="token punctuation">.</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        iter<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>key<span class="token punctuation">.</span><span class="token function">isAcceptable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token class-name">ServerSocketChannel</span> server <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">ServerSocketChannel</span><span class="token punctuation">)</span> key<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token class-name">SocketChannel</span> client <span class="token operator">=</span> server<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                client<span class="token punctuation">.</span><span class="token function">configureBlocking</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                client<span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>selector<span class="token punctuation">,</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_WRITE</span> <span class="token operator">|</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_READ</span><span class="token punctuation">,</span> msg<span class="token punctuation">.</span><span class="token function">duplicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>key<span class="token punctuation">.</span><span class="token function">isWritable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token class-name">SocketChannel</span> client <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">SocketChannel</span><span class="token punctuation">)</span> key<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token class-name">ByteBuffer</span> buffer <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">ByteBuffer</span><span class="token punctuation">)</span> key<span class="token punctuation">.</span><span class="token function">attachment</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">while</span> <span class="token punctuation">(</span>buffer<span class="token punctuation">.</span><span class="token function">hasRemaining</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>client<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">                client<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            key<span class="token punctuation">.</span><span class="token function">cancel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                key<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> ee<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                ee<span class="token punctuation">.</span><span class="token function">printStackTrace</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="netty-编程模型" tabindex="-1"><a class="header-anchor" href="#netty-编程模型"><span>Netty 编程模型</span></a></h2><ol><li>初始化一个 <code>EventLoopGroup</code></li><li>将服务器引导到 <code>EventLoopGroup</code> 上，绑定本地地址，绑定处理函数</li></ol><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">ByteBuf</span> buf <span class="token operator">=</span> <span class="token class-name">Unpooled</span><span class="token punctuation">.</span><span class="token function">copiedBuffer</span><span class="token punctuation">(</span><span class="token string">&quot;Hello&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Charset</span><span class="token punctuation">.</span><span class="token function">forName</span><span class="token punctuation">(</span><span class="token string">&quot;utf-8&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token class-name">EventLoopGroup</span> group <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NioEventLoopGroup</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// --&gt; OioEventLoopGroup</span></span>
<span class="line"><span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ServerBootstrap</span> b <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ServerBootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    b</span>
<span class="line">        <span class="token punctuation">.</span><span class="token function">group</span><span class="token punctuation">(</span>group<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token class-name">NioServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span> <span class="token comment">// --&gt; OioServerSocketChannel.class</span></span>
<span class="line">        <span class="token punctuation">.</span><span class="token function">localAddress</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">InetSocketAddress</span><span class="token punctuation">(</span><span class="token number">8080</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">.</span><span class="token function">childHandler</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ChannelInitializer</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SocketChannel</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token annotation punctuation">@Override</span></span>
<span class="line">            <span class="token keyword">protected</span> <span class="token keyword">void</span> <span class="token function">initChannel</span><span class="token punctuation">(</span><span class="token class-name">SocketChannel</span> ch<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span></span>
<span class="line">                ch<span class="token punctuation">.</span><span class="token function">pipeline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ChannelInboundHandlerAdapter</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token annotation punctuation">@Override</span></span>
<span class="line">                    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelActive</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span></span>
<span class="line">                        ctx</span>
<span class="line">                            <span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>buf<span class="token punctuation">.</span><span class="token function">duplicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                            <span class="token punctuation">.</span><span class="token function">addListener</span><span class="token punctuation">(</span><span class="token class-name">ChannelFutureListener</span><span class="token punctuation">.</span><span class="token constant">CLOSE</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line">                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ChannelFuture</span> future <span class="token operator">=</span> b<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    future<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">closeFuture</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">    group<span class="token punctuation">.</span><span class="token function">shutdownGracefully</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">sync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Netty 同时支持阻塞版本与非阻塞版本的函数，并且两种版本的代码几乎完全相同，因为 Netty 为每种传输实现都暴露了相同的 API，业务代码几乎不受影响，在上面代码的注释位置稍作修改即可。Netty 内置的开箱即用传输包含：</p><table><thead><tr><th>名称</th><th>包</th><th>描述</th></tr></thead><tbody><tr><td>NIO</td><td><code>io.netty.channel.socket.nio</code></td><td>由 JDK 中的 NIO API 实现，保证了平台通用性</td></tr><tr><td>OIO</td><td><code>io.netty.channel.socket.oio</code></td><td>由 JDK 中的 <code>java.net</code> 阻塞 API 实现</td></tr><tr><td>EPOLL</td><td><code>io.netty.channel.epoll</code></td><td>由 Linux JDK NIO API 实现，只能在 Linux 上使用</td></tr><tr><td>Local</td><td><code>io.netty.channel.local</code></td><td>同一个 JVM 内部运行的客户端与服务器之间的异步通信</td></tr><tr><td>Embedded</td><td><code>io.netty.channel.embedded</code></td><td>不基于真正网络的传输，用于 handler 的单元测试</td></tr></tbody></table>`,26)]))}const i=s(e,[["render",c],["__file","1 - NIO Transportation Model.html.vue"]]),u=JSON.parse('{"path":"/netty-in-action-notes/1%20-%20NIO%20Transportation%20Model.html","title":"1 - NIO Transportation Model","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"阻塞 I/O (BIO / OIO)","slug":"阻塞-i-o-bio-oio","link":"#阻塞-i-o-bio-oio","children":[]},{"level":2,"title":"非阻塞 I/O (NIO)","slug":"非阻塞-i-o-nio","link":"#非阻塞-i-o-nio","children":[]},{"level":2,"title":"Netty 编程模型","slug":"netty-编程模型","link":"#netty-编程模型","children":[]}],"git":{},"filePathRelative":"netty-in-action-notes/1 - NIO Transportation Model.md"}');export{i as comp,u as data};
