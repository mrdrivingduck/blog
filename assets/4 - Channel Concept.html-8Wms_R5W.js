import{_ as n,c as l,a as d,o as a}from"./app-aVGbliEg.js";const o="/blog/assets/6-3-D-pd7Ski.png",c="/blog/assets/6-5-DlYPVp7w.png",h={};function t(r,e){return a(),l("div",null,e[0]||(e[0]=[d('<h1 id="_4-channel-concept" tabindex="-1"><a class="header-anchor" href="#_4-channel-concept"><span>4 - Channel Concept</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 19 13:10</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="channel" tabindex="-1"><a class="header-anchor" href="#channel"><span>Channel</span></a></h2><p><code>Channel</code> 表示可被 I/O 操作的组件的抽象表示，可以被读取 / 写入 / 连接 / 绑定。典型的例子：socket。Channel 可以向用户提供如下信息：</p><ul><li>当前 <code>Channel</code> 的状态 (已打开 / 已连接？)</li><li><code>Channel</code> 的配置参数 (接收缓冲区大小)</li><li><code>Channel</code> 支持的 I/O 操作</li><li>处理 <code>Channel</code> 的 I/O 事件及请求的 <code>ChannelPipeline</code></li></ul><p>在 <em>Netty</em> 中，所有的 I/O 操作都是异步的，返回值不保证 I/O 操作是否成功。返回的 <code>ChannelFuture</code> 实例能够在 I/O 操作成功 / 失败 / 取消时通知用户。</p><p><code>Channel</code> 可以是层次化的，由具体的传输实现决定。一个 channel 可以有一个 <code>parent()</code>，比如，一个由 <code>ServerSocketChannel</code> 接受的 <code>SocketChannel</code> 将会在调用 <code>parent()</code> 时返回 <code>ServerSocketChannel</code>。</p><p><code>Channel</code> 应在使用完毕后被关闭，以释放资源。</p><h2 id="channelhandler" tabindex="-1"><a class="header-anchor" href="#channelhandler"><span>ChannelHandler</span></a></h2><p>用于 <strong>截获</strong> 并 <strong>处理</strong> I/O 事件，并向 <code>ChannelPipeline</code> 中的下一个 <code>ChannelHandler</code> 转发事件。每个 <code>ChannelHandler</code> 都由一个 <code>ChannelHandlerContext</code> 提供，通过该对象，<code>ChannelHandler</code> 可以与 <code>ChannelPipeline</code> 进行交互，以便传递事件，或动态修改流水线 (编排 <code>ChannelHandler</code>)。</p><p>如果 <code>ChannelHandler</code> 类内维护了状态变量，为了避免竞争条件，用户需要为每一个 <code>Channel</code> 对应的 <code>ChannelPipeline</code> 分配独立的 <code>ChannelHandler</code> 实例。理论上，相同的 <code>ChannelHandler</code> 实例可以被共享，添加到不同的 <code>ChannelHandler</code> 上。</p><p>根据 <code>ChannelHandler</code> 的功能不同，该接口派生出了如下子接口：</p><ul><li><code>ChannelInboundHandler</code> - 处理入站 I/O 事件</li><li><code>ChannelOutboundHandler</code> - 处理出站 I/O 事件</li><li><code>ChannelDuplexHandler</code> - 同时处理双向 I/O 事件</li></ul><p>对于前两种接口，<em>Netty</em> 已经提供了默认实现类，用户只需要继承默认实现类并重写自己想要定制的函数即可：</p><ul><li><code>ChannelInboundHandlerAdapter</code></li><li><code>ChannelOutboundHandlerAdapter</code></li></ul><h2 id="channelpipeline" tabindex="-1"><a class="header-anchor" href="#channelpipeline"><span>ChannelPipeline</span></a></h2><p><code>ChannelPipeline</code> 由拦截流经 <code>Channel</code> 的出入站事件的 <code>ChannelHandler</code> 实例链组成。每个新创建的 <code>Channel</code> 都会被分配一个新的 <code>ChannelPipeline</code>，这个关联是永久性的，它们之间的绑定不会分离。<code>ChannelPipeline</code> 提供 API 能够实时修改内部 <code>ChannelHandler</code> 的布局 (添加 / 删除 / 替换)，从而实现动态协议切换。</p><img src="'+o+'" alt="6-3" style="zoom:50%;"><p>通常 <code>ChannelHandler</code> 的代码都是由 <code>EventLoop</code> 线程来执行的，因此至关重要的一点是不要在 <code>ChannelHandler</code> 中阻塞当前线程。如果不得不调用阻塞 API，<code>ChannelPipeline</code> 提供了接受 <code>EventExecutorGroup</code> 的 <code>add()</code> API，使得该 <code>ChannelHandler</code> 会在提供的 <code>EventExecutorGroup</code> 中被处理，而不是使用当前的 <code>EventLoop</code> 线程执行。</p><h2 id="channelhandlercontext" tabindex="-1"><a class="header-anchor" href="#channelhandlercontext"><span>ChannelHandlerContext</span></a></h2><p><code>ChannelHandlerContext</code> 代表了 <code>ChannelHandler</code> 和 <code>ChannelHandlerPipeline</code> 之间的关联。当 <code>ChannelHandler</code> 被添加到流水线上时，就会创建一个 <code>ChannelHandlerContext</code> 实例。其主要功能是管理其连接的 <code>ChannelHandler</code> 与流水线上其它 <code>ChannelHandler</code> 之间的交互。</p><p>由于一个 <code>ChannelHandler</code> 实例可以从属于多个 <code>ChannelPipeline</code>，因此可以同时绑定到多个 <code>ChannelHandlerContext</code> 中。此时，<code>ChannelHandler</code> 必须使用 <code>@Sharable</code> 注解标注，否则将触发异常。被共享的 <code>ChannelHandler</code> 必须是线程安全的。</p><img src="'+c+'" alt="6-5" style="zoom:50%;"><p>该接口上定义的函数很多也存在与 <code>Channel</code> 与 <code>ChannelPipeline</code> 中，但不同的是，调用 <code>ChannelHandlerContext</code> 上的函数将使操作从当前的 <code>ChannelHandler</code> 开始向后传播给能够处理该事件的 <code>ChannelHandler</code>；而 <code>Channel</code> 或 <code>ChannelPipeline</code> 上的操作将沿整个 <code>ChannelPipeline</code> 传播。从而减少事件流经对它不感兴趣的 <code>ChannelHandler</code> 带来的开销。</p>',27)]))}const p=n(h,[["render",t],["__file","4 - Channel Concept.html.vue"]]),C=JSON.parse('{"path":"/netty-in-action-notes/4%20-%20Channel%20Concept.html","title":"4 - Channel Concept","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Channel","slug":"channel","link":"#channel","children":[]},{"level":2,"title":"ChannelHandler","slug":"channelhandler","link":"#channelhandler","children":[]},{"level":2,"title":"ChannelPipeline","slug":"channelpipeline","link":"#channelpipeline","children":[]},{"level":2,"title":"ChannelHandlerContext","slug":"channelhandlercontext","link":"#channelhandlercontext","children":[]}],"git":{},"filePathRelative":"netty-in-action-notes/4 - Channel Concept.md"}');export{p as comp,C as data};