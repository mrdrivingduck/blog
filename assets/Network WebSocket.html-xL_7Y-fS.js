import{_ as n,c as a,a as s,o as l}from"./app-aVGbliEg.js";const i={};function t(c,e){return l(),a("div",null,e[0]||(e[0]=[s(`<h1 id="network-websocket" tabindex="-1"><a class="header-anchor" href="#network-websocket"><span>Network - WebSocket</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 04 / 29 0:05</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="what" tabindex="-1"><a class="header-anchor" href="#what"><span>What</span></a></h2><p><em>WebSocket</em> 是一种在单个 TCP 连接上进行的 <strong>全双工</strong> 通信协议，于 2011 年被 IETF (Internet Engineering Task Force) 制定为 RFC 6455 标准，并由 RFC 7936 补充。<em>WebSocket</em> 中，浏览器和服务器只需要完成一次握手，两者之间就可以创建持久性的连接，并进行双向数据传输。最重要的是，允许服务端向客户端推送数据。</p><hr><h2 id="why" tabindex="-1"><a class="header-anchor" href="#why"><span>Why</span></a></h2><p>WebSocket 需要客户端和服务端同时支持。WebSocket 是 HTML5 中的协议，但和 HTML 本身没有关系，就好比可以用 HTTP 传输非 HTML 格式的数据。WebSocket 是一个新的应用层协议，与 HTTP 有一点交集，但：</p><ul><li>HTTP 是非持久协议</li><li>WebSocket 是持久协议</li></ul><p>HTTP 的生命周期由 HTTP Request 界定，一个 Request 对应一个 Response，且 Response 是被动的，不能主动发起；WebSocket 借用 HTTP 协议来完成初始的握手：客户端和服务端握手完成，并都开始使用 WebSocket 模式。双方可以开始进行全双工通信，服务端可以主动发起与客户端的通信。</p><hr><h2 id="how" tabindex="-1"><a class="header-anchor" href="#how"><span>How</span></a></h2><p>WebSocket 首先会借用 HTTP 完成初始握手。客户端发送：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">GET /chat HTTP/1.1</span>
<span class="line">Host: server.example.com</span>
<span class="line">Upgrade: websocket</span>
<span class="line">Connection: Upgrade</span>
<span class="line">Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==</span>
<span class="line">Sec-WebSocket-Protocol: chat, superchat</span>
<span class="line">Sec-WebSocket-Version: 13</span>
<span class="line">Origin: http://example.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对比传统的 HTTP 协议，多出了一些信息：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Upgrade: websocket</span>
<span class="line">Connection: Upgrade</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>作用是告诉服务器，通信协议升级为 WebSocket。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==</span>
<span class="line">Sec-WebSocket-Protocol: chat, superchat</span>
<span class="line">Sec-WebSocket-Version: 13</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>Sec-WebSocket-Key</code> 由浏览器随机生成，用于验证身份</li><li><code>Sec-WebSocket-Protocol</code> 是用户定义的字符串，区分不同服务所需要的协议</li><li><code>Sec-WebSocket-Version</code> 在 WebSocket 标准化之前不统一，标准化后，统一使用 <code>13</code></li></ul><p>服务端返回：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">HTTP/1.1 101 Switching Protocols</span>
<span class="line">Upgrade: websocket</span>
<span class="line">Connection: Upgrade</span>
<span class="line">Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=</span>
<span class="line">Sec-WebSocket-Protocol: chat</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同样，服务端返回同意升级协议：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Upgrade: websocket</span>
<span class="line">Connection: Upgrade</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=</span>
<span class="line">Sec-WebSocket-Protocol: chat</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>Sec-WebSocket-Accept</code> 是经过服务器确认，并经过加密后的 <code>Sec-WebSocket-Key</code></li><li><code>Sec-WebSocket-Protocol</code> 是服务器最终使用的协议</li></ul><hr><h2 id="compare" tabindex="-1"><a class="header-anchor" href="#compare"><span>Compare</span></a></h2><p>与目前已有的一些信息传递机制的比较：</p><h3 id="ajax-轮询" tabindex="-1"><a class="header-anchor" href="#ajax-轮询"><span>AJAX 轮询</span></a></h3><p>客户端每隔几秒发送一次请求，询问服务器是否有新信息。存在问题：</p><ul><li>客户端需要不断向服务端发送请求</li><li>HTTP 请求中包含较长的头部，真正有效的部分很少</li><li>浪费带宽，信息交换效率低下</li><li>需要服务端有较高的处理效率，较多的资源</li></ul><h3 id="long-poll" tabindex="-1"><a class="header-anchor" href="#long-poll"><span>Long Poll</span></a></h3><p>也是轮询的方式，但是采取 <strong>阻塞</strong> 策略。客户端发起连接后，如果没有消息，服务端就一直不发送 Response，直到有消息。</p><p>存在问题：</p><ul><li>服务端需要同时维护很多个阻塞的长连接</li><li>需要服务端有较高的并发能力 (同时接待客户)</li></ul><p>且存在共同的问题：</p><ul><li>客户端不断建立 HTTP 连接，被动等待服务端处理</li></ul><h3 id="websocket" tabindex="-1"><a class="header-anchor" href="#websocket"><span>WebSocket</span></a></h3><p>整个连接只需要一次 HTTP 握手，通讯过程中不需要重复传输身份鉴别信息。服务端一直保持连接状态信息，直到连接被释放。由 <code>ping/pong</code> 帧维持连接状态。</p><hr>`,42)]))}const o=n(i,[["render",t],["__file","Network WebSocket.html.vue"]]),d=JSON.parse('{"path":"/notes/Network/Network%20WebSocket.html","title":"Network - WebSocket","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"What","slug":"what","link":"#what","children":[]},{"level":2,"title":"Why","slug":"why","link":"#why","children":[]},{"level":2,"title":"How","slug":"how","link":"#how","children":[]},{"level":2,"title":"Compare","slug":"compare","link":"#compare","children":[{"level":3,"title":"AJAX 轮询","slug":"ajax-轮询","link":"#ajax-轮询","children":[]},{"level":3,"title":"Long Poll","slug":"long-poll","link":"#long-poll","children":[]},{"level":3,"title":"WebSocket","slug":"websocket","link":"#websocket","children":[]}]}],"git":{},"filePathRelative":"notes/Network/Network WebSocket.md"}');export{o as comp,d as data};