import{_ as n,c as t,a as l,o as s}from"./app-CT9FvwxE.js";const a={};function i(r,e){return s(),t("div",null,e[0]||(e[0]=[l(`<h1 id="network-tcp-flow-control" tabindex="-1"><a class="header-anchor" href="#network-tcp-flow-control"><span>Network - TCP Flow Control</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 03 / 09 14:27</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="延时确认" tabindex="-1"><a class="header-anchor" href="#延时确认"><span>延时确认</span></a></h2><p>TCP 并不对每个接收到的报文都返回 ACK。利用 TCP 的累积 ACK，就可以实现确认。累积确认允许 TCP 延迟一段时间发送 ACK，以便将几个相同方向上的确认信息结合发送，批量传输。比如，需要确认 111、112、113 三个报文，本需要三个 ACK；当 TCP 累积到收到 113 后，只发送一条 113 的 ACK，就可以顺带确认前两个报文。</p><p>延时 ACK 可以减少 ACK 的传输数目，一定程度上可以减轻网络负载。当然，TCP 也不能任意延长 ACK，否则对方会无任务数据丢失，从而引发不必要的重传。</p><h2 id="窗口管理" tabindex="-1"><a class="header-anchor" href="#窗口管理"><span>窗口管理</span></a></h2><p>TCP 采用可变滑动窗口实现流量控制。每个 TCP 报文 (除了连接建立之初的 <code>SYN</code>) 都包含以下信息：</p><ul><li>有效序列号 (Seq)</li><li>确认号 (ACK)</li><li>窗口大小 (窗口通告信息)</li></ul><p>数据接收方会为即将到来的新数据预留存储空间，随着空间中的数据不断被应用程序读取，有不断被发送方填满，窗口大小保持不变；当应用程序忙于其它事情而来不及读取存储空间中的数据时，留给发送方的存储空间将越来越小，直至为 0，TCP 需要采取策略完全停止新数据的发送。</p><p>TCP 连接收发数据量由一组窗口来维护。每个 TCP 活动连接的两侧都维护者发送窗口和接收窗口。</p><p>发送窗口如下所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">                      Left                                            Right</span>
<span class="line">                        | &lt;---------      Offered Window     ---------&gt; |</span>
<span class="line"> ... 2 3 4 5 6 7 8 9 10 | 11 12 13 14 15 16 17 18 | 19 20 21 22 23 ...  | ...</span>
<span class="line">| &lt;- Sent, Confirmed -&gt; | &lt;- Sent, Unconfirmed -&gt; | &lt;- Ready to Send -&gt; | &lt;- Unable to Send -&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>TCP 以字节为单位维护窗口结构。由接收方提供的窗口被称为 <strong>提供窗口 (Offered Window)</strong>，表示接送方的接收能力有多少。发送方计算除了已经发送出去但没有收到确认的信息的字节以外，还可以发送多少字节，也就是上图中 <em>Ready to Send</em> 的部分。</p><p>当发送方接收到接收方的 ACK 确认时，将会使窗口左边界右移。保证窗口左边界之前的字节全部都已经被接收方确认。当接收方接收到的数据被应用程序处理以后，接收方的可以缓存变大，那么将会通告发送方，使其窗口的右边界右移，窗口也随之变大。当左右边界同时右移而窗口大小不变时，就好像窗口在滑动一样。</p><p>当接收方来不处理数据时，发送方的可用窗口将越来越小，直到窗口左右边界相等。此时发送方不能发送任何新数据，发送方将开始 <strong>探测</strong> 对方的窗口，伺机重新增大窗口。发送端采用一个 <em>持续计时器</em>，在超时时发送探测报文查询接收端，并强制要求接收端返回 ACK (其中包含窗口大小)。当接收端重新获得可用空间时，将会给发送端传输 <strong>窗口更新</strong> 的报文。TCP 会对这个报文的丢包进行处理，防止双方的无限等待。</p><p>接收窗口的结构更为简单：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">                           Left                         Right</span>
<span class="line">                            | &lt;--  Receiving Window  --&gt;  |</span>
<span class="line"> ... 2 3 4 5 6 7 8 9 10 11  | 12 13 14 15 16 17 18 19 20  | 21 22 ...</span>
<span class="line">| &lt;- Received, Confirmed -&gt; | &lt;-----   UnReceived  -----&gt; | &lt;- Unable to Receive -&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，接收窗口表示当前可以被用于接收的空间。一旦接收到序列号等于窗口左边界的数据后，窗口的左边界将会右移。如果接收到序列号低于窗口左边界的数据，则被认为是重复的数据而被丢弃；接收到序列号大于窗口有边界的数据则被认为暂时超出了接收能力，也会被丢弃。</p><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p>TCP/IP 详解 - 卷 1：协议</p><hr>`,25)]))}const d=n(a,[["render",i],["__file","Network TCP Flow Control.html.vue"]]),p=JSON.parse('{"path":"/notes/Network/Network%20TCP%20Flow%20Control.html","title":"Network - TCP Flow Control","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"延时确认","slug":"延时确认","link":"#延时确认","children":[]},{"level":2,"title":"窗口管理","slug":"窗口管理","link":"#窗口管理","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Network/Network TCP Flow Control.md"}');export{d as comp,p as data};
