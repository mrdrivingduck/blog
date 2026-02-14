import{_ as s,c as a,a as p,o as e}from"./app-BeHGwf2X.js";const t={};function l(c,n){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="chapter-11-http-框架的执行流程" tabindex="-1"><a class="header-anchor" href="#chapter-11-http-框架的执行流程"><span>Chapter 11 - HTTP 框架的执行流程</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 07 / 31 14:04</p><p>Nanjing, Jiangsu, China</p><hr><p>HTTP 框架如何集成各个 HTTP 模块来共同处理 HTTP 请求？</p><ol><li>HTTP 框架需要基于 TCP 事件框架解决 HTTP 传输、解析、组装的问题</li><li>HTTP 框架需要为 HTTP 模块屏蔽事件驱动架构，使其不需关心网络事件处理，又能灵活介入各阶段</li></ol><p>HTTP 框架负责与客户端建立 TCP 连接，接收 HTTP request line、HTTP header 并解析，根据配置文件中找到的 HTTP 模块依次合作处理请求。另外，还提供了接收 HTTP body、发送 HTTP response 和派生子请求的工具函数。</p><h2 id="_11-2-新连接建立时的行为" tabindex="-1"><a class="header-anchor" href="#_11-2-新连接建立时的行为"><span>11.2 新连接建立时的行为</span></a></h2><p>当 Nginx 中的 TCP 连接成功建立后，HTTP 框架就会介入请求处理。在负责 TCP 连接建立的 <code>ngx_event_accept()</code> 函数的最后，会调用 <code>ngx_listening_t</code> 监听结构体的 <code>handler</code> 函数。这个函数在 HTTP 框架初始化时就会被设置为 <code>ngx_http_init_connection()</code> 函数，传入的参数为新建立的 <code>ngx_connection_t</code> 连接结构体：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_init_connection</span><span class="token punctuation">(</span><span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              i<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>            <span class="token operator">*</span>rev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr_in</span>     <span class="token operator">*</span>sin<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_port_t</span>        <span class="token operator">*</span>port<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_in_addr_t</span>     <span class="token operator">*</span>addr<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_log_ctx_t</span>     <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_connection_t</span>  <span class="token operator">*</span>hc<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_INET6<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr_in6</span>    <span class="token operator">*</span>sin6<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_in6_addr_t</span>    <span class="token operator">*</span>addr6<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    hc <span class="token operator">=</span> <span class="token function">ngx_pcalloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_connection_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>hc <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>data <span class="token operator">=</span> hc<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* find the server configuration for the address:port */</span></span>
<span class="line"></span>
<span class="line">    port <span class="token operator">=</span> c<span class="token operator">-&gt;</span>listening<span class="token operator">-&gt;</span>servers<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>port<span class="token operator">-&gt;</span>naddrs <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * there are several addresses on this port and one of them</span>
<span class="line">         * is an &quot;*:port&quot; wildcard so getsockname() in ngx_http_server_addr()</span>
<span class="line">         * is required to determine a server address</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_connection_local_sockaddr</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>local_sockaddr<span class="token operator">-&gt;</span>sa_family<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_INET6<span class="token punctuation">)</span></span></span></span>
<span class="line">        <span class="token keyword">case</span> AF_INET6<span class="token operator">:</span></span>
<span class="line">            sin6 <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">sockaddr_in6</span> <span class="token operator">*</span><span class="token punctuation">)</span> c<span class="token operator">-&gt;</span>local_sockaddr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            addr6 <span class="token operator">=</span> port<span class="token operator">-&gt;</span>addrs<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* the last address is &quot;*&quot; */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> port<span class="token operator">-&gt;</span>naddrs <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_memcmp</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>addr6<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>addr6<span class="token punctuation">,</span> <span class="token operator">&amp;</span>sin6<span class="token operator">-&gt;</span>sin6_addr<span class="token punctuation">,</span> <span class="token number">16</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            hc<span class="token operator">-&gt;</span>addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr6<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span> <span class="token comment">/* AF_INET */</span></span>
<span class="line">            sin <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">sockaddr_in</span> <span class="token operator">*</span><span class="token punctuation">)</span> c<span class="token operator">-&gt;</span>local_sockaddr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            addr <span class="token operator">=</span> port<span class="token operator">-&gt;</span>addrs<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* the last address is &quot;*&quot; */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> port<span class="token operator">-&gt;</span>naddrs <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>addr<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>addr <span class="token operator">==</span> sin<span class="token operator">-&gt;</span>sin_addr<span class="token punctuation">.</span>s_addr<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            hc<span class="token operator">-&gt;</span>addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>local_sockaddr<span class="token operator">-&gt;</span>sa_family<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_INET6<span class="token punctuation">)</span></span></span></span>
<span class="line">        <span class="token keyword">case</span> AF_INET6<span class="token operator">:</span></span>
<span class="line">            addr6 <span class="token operator">=</span> port<span class="token operator">-&gt;</span>addrs<span class="token punctuation">;</span></span>
<span class="line">            hc<span class="token operator">-&gt;</span>addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr6<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span> <span class="token comment">/* AF_INET */</span></span>
<span class="line">            addr <span class="token operator">=</span> port<span class="token operator">-&gt;</span>addrs<span class="token punctuation">;</span></span>
<span class="line">            hc<span class="token operator">-&gt;</span>addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the default server configuration for the address:port */</span></span>
<span class="line">    hc<span class="token operator">-&gt;</span>conf_ctx <span class="token operator">=</span> hc<span class="token operator">-&gt;</span>addr_conf<span class="token operator">-&gt;</span>default_server<span class="token operator">-&gt;</span>ctx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ctx <span class="token operator">=</span> <span class="token function">ngx_palloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_log_ctx_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>connection <span class="token operator">=</span> c<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>request <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>current_request <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>connection <span class="token operator">=</span> c<span class="token operator">-&gt;</span>number<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_log_error<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>data <span class="token operator">=</span> ctx<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;waiting for request&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log_error <span class="token operator">=</span> NGX_ERROR_INFO<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    rev <span class="token operator">=</span> c<span class="token operator">-&gt;</span>read<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 设置新连接的可读事件处理函数为 ngx_http_wait_request_handler</span></span>
<span class="line">    <span class="token comment">// TCP 连接上有数据到达后，将调用这个函数初始化 HTTP request</span></span>
<span class="line">    rev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_wait_request_handler<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 设置新连接的可写事件处理函数为 ngx_http_empty_handler (不做任何工作)</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_empty_handler<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HTTP_V2<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>hc<span class="token operator">-&gt;</span>addr_conf<span class="token operator">-&gt;</span>http2<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        rev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_v2_init<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HTTP_SSL<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_http_ssl_srv_conf_t</span>  <span class="token operator">*</span>sscf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    sscf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_srv_conf</span><span class="token punctuation">(</span>hc<span class="token operator">-&gt;</span>conf_ctx<span class="token punctuation">,</span> ngx_http_ssl_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>sscf<span class="token operator">-&gt;</span>enable <span class="token operator">||</span> hc<span class="token operator">-&gt;</span>addr_conf<span class="token operator">-&gt;</span>ssl<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        hc<span class="token operator">-&gt;</span>ssl <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;SSL handshaking&quot;</span><span class="token punctuation">;</span></span>
<span class="line">        rev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_ssl_handshake<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>hc<span class="token operator">-&gt;</span>addr_conf<span class="token operator">-&gt;</span>proxy_protocol<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        hc<span class="token operator">-&gt;</span>proxy_protocol <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading PROXY protocol&quot;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果新连接上已经有用户数据到达了</span></span>
<span class="line">    <span class="token comment">// 那么直接调用刚才设置的 ngx_http_init_request()</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* the deferred accept(), iocp */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ngx_use_accept_mutex<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_post_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token operator">&amp;</span>ngx_posted_events<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        rev<span class="token operator">-&gt;</span><span class="token function">handler</span><span class="token punctuation">(</span>rev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将读事件添加到定时器中</span></span>
<span class="line">    <span class="token comment">// 如果超时后还没有用户事件发来，那么由定时器来触发调用 ngx_http_init_request()，可能会关闭连接</span></span>
<span class="line">    <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>listening<span class="token operator">-&gt;</span>post_accept_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_reusable_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将连接的可读事件添加到 EPOLL 事件驱动模块中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_11-3-第一次可读事件的处理" tabindex="-1"><a class="header-anchor" href="#_11-3-第一次可读事件的处理"><span>11.3 第一次可读事件的处理</span></a></h2><p>HTTP 框架不会在 TCP 连接建立成功后就立刻初始化 HTTP 请求，而是在 TCP 读缓冲区中第一次接收到用户数据时才进行。这个设计体现了 Nginx 追求高性能的考虑，降低了一个请求占用内存资源的时间。所以 Nginx 将新连接的可读事件回调函数设置为 <code>ngx_http_init_request()</code>，并添加到了定时器和事件驱动模块中；另外，可能在新连接建立的同时，用户的数据也已经发到 TCP 缓冲区中了。综上，有三种情况会触发 <code>ngx_http_init_request()</code>：</p><ol><li>新连接建立后，用户数据已经发送到了 TCP 缓冲区中，那么 HTTP 框架会直接调用回调函数</li><li>一段时间后，用户数据发送到了 TCP 缓冲区中，由 EPOLL 等事件驱动模块通知 HTTP 框架调用回调函数</li><li>超时时间后，由定时器触发这个回调函数</li></ol><p>在这个回调函数中，主要完成三个工作：</p><ol><li>构造代表 HTTP 请求的 <code>ngx_http_request_t</code> 结构体并初始化部分参数</li><li>由于 HTTP 请求已经开始处理流程，需要修改读事件回调函数为 <code>ngx_http_process_request_line</code></li><li>调用回调函数，准备开始处理 HTTP request line</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_wait_request_handler</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>rev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    u_char                    <span class="token operator">*</span>p<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">size_t</span>                     size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                    n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>                 <span class="token operator">*</span>b<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>          <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_connection_t</span>     <span class="token operator">*</span>hc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_srv_conf_t</span>  <span class="token operator">*</span>cscf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> rev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token string">&quot;http wait request handler&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 首先检查这个函数的调用是否是因为超时，即超时时间内都没有收到用户数据</span></span>
<span class="line">    <span class="token comment">// 如果超时，那么不再处理这个请求，关闭请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;client timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>close<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 获取连接，及其对应的 server{} 块配置项</span></span>
<span class="line">    hc <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    cscf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_srv_conf</span><span class="token punctuation">(</span>hc<span class="token operator">-&gt;</span>conf_ctx<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 下面准备在 TCP 连接的内存池中分配一块 buffer，作为接收数据的用户态缓冲区</span></span>
<span class="line">    <span class="token comment">// 缓冲区大小由配置文件指定</span></span>
<span class="line">    <span class="token comment">// 在 TCP 连接的内存池中分配，便于之后复用</span></span>
<span class="line">    size <span class="token operator">=</span> cscf<span class="token operator">-&gt;</span>client_header_buffer_size<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    b <span class="token operator">=</span> c<span class="token operator">-&gt;</span>buffer<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>b <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 为 TCP 连接分配内存池</span></span>
<span class="line">        b <span class="token operator">=</span> <span class="token function">ngx_create_temp_buf</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>b <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        c<span class="token operator">-&gt;</span>buffer <span class="token operator">=</span> b<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>b<span class="token operator">-&gt;</span>start <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 为 HTTP 分配的内存池</span></span>
<span class="line">        b<span class="token operator">-&gt;</span>start <span class="token operator">=</span> <span class="token function">ngx_palloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>b<span class="token operator">-&gt;</span>start <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        b<span class="token operator">-&gt;</span>pos <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">        b<span class="token operator">-&gt;</span>last <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">        b<span class="token operator">-&gt;</span>end <span class="token operator">=</span> b<span class="token operator">-&gt;</span>last <span class="token operator">+</span> size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 这里干啥了？</span></span>
<span class="line">    n <span class="token operator">=</span> c<span class="token operator">-&gt;</span><span class="token function">recv</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> b<span class="token operator">-&gt;</span>last<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>rev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>listening<span class="token operator">-&gt;</span>post_accept_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_reusable_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * We are trying to not hold c-&gt;buffer&#39;s memory for an idle connection.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token comment">// 只回收 HTTP 连接的内存池</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_pfree</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            b<span class="token operator">-&gt;</span>start <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;client closed connection&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    b<span class="token operator">-&gt;</span>last <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>hc<span class="token operator">-&gt;</span>proxy_protocol<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        hc<span class="token operator">-&gt;</span>proxy_protocol <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        p <span class="token operator">=</span> <span class="token function">ngx_proxy_protocol_read</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> b<span class="token operator">-&gt;</span>pos<span class="token punctuation">,</span> b<span class="token operator">-&gt;</span>last<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        b<span class="token operator">-&gt;</span>pos <span class="token operator">=</span> p<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>b<span class="token operator">-&gt;</span>pos <span class="token operator">==</span> b<span class="token operator">-&gt;</span>last<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;waiting for request&quot;</span><span class="token punctuation">;</span></span>
<span class="line">            b<span class="token operator">-&gt;</span>pos <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">            b<span class="token operator">-&gt;</span>last <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_post_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token operator">&amp;</span>ngx_posted_events<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading client request line&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_reusable_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 初始化一个 HTTP request 结构体，并设置到连接结构体中</span></span>
<span class="line">    <span class="token comment">// 在细节上，这里面做了很多工作</span></span>
<span class="line">    <span class="token comment">// 接下来，随着 HTTP 解析工作的进行，将不断填充这个结构体中的 field</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>data <span class="token operator">=</span> <span class="token function">ngx_http_create_request</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>data <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 接下来，将要开始处理 HTTP request line，因此重设回调函数并调用</span></span>
<span class="line">    rev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_process_request_line<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_http_process_request_line</span><span class="token punctuation">(</span>rev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_11-4-接收-http-请求行" tabindex="-1"><a class="header-anchor" href="#_11-4-接收-http-请求行"><span>11.4 接收 HTTP 请求行</span></a></h2><p>HTTP request line 的格式如下：</p><div class="language-http line-numbers-mode" data-highlighter="prismjs" data-ext="http" data-title="http"><pre><code><span class="line"><span class="token request-line"><span class="token method property">GET</span> <span class="token request-target url">/uri</span> <span class="token http-version property">HTTP/1.1</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>因此，请求行的长度是不定的，与 URI 的长度相关。这意味着内核中 TCP 读缓冲区的大小不一定能够一次接收到完整的 HTTP request line，由此，调用一次 <code>ngx_http_process_request_line()</code> 也不一定能做完解析 HTTP request line 的工作。在上一步中，这个函数被设置为读事件回调函数，可能会被事件驱动模块多次触发，反复接收 TCP 流，并用状态机来解析。直到确认接收了完整的 HTTP request line，这个阶段才算完成。所以这个函数是 <strong>可重入</strong> 的。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_process_request_line</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>rev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>              n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>            rc<span class="token punctuation">,</span> rv<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>            host<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>    <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_request_t</span>  <span class="token operator">*</span>r<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> rev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    r <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> rev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http process request line&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 判断读事件是否超时</span></span>
<span class="line">    <span class="token comment">// 如果超时，则关闭请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;client timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>timedout <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_REQUEST_TIME_OUT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    rc <span class="token operator">=</span> NGX_AGAIN<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 从 Linux 内核的 socket 缓冲区中复制到 header_in 缓冲区中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            n <span class="token operator">=</span> <span class="token function">ngx_http_read_request_header</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 如果本次没有新数据，则结束函数，等待下次再次被触发</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN <span class="token operator">||</span> n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 用状态机解析已经接收到的 TCP 字符流</span></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_http_parse_request_line</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>header_in<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 成功解析 request line</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* the request line has been parsed successfully */</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 设置请求结构体中的相关信息</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>request_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>request_start<span class="token punctuation">;</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>request_start<span class="token punctuation">;</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>request_length <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos <span class="token operator">-</span> r<span class="token operator">-&gt;</span>request_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;http request line: \\&quot;%V\\&quot;&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            r<span class="token operator">-&gt;</span>method_name<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>method_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>request_start <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>method_name<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">.</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>http_protocol<span class="token punctuation">.</span>data<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                r<span class="token operator">-&gt;</span>http_protocol<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>request_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>http_protocol<span class="token punctuation">.</span>data<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_http_process_request_uri</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>schema_end<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                r<span class="token operator">-&gt;</span>schema<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>schema_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>schema_start<span class="token punctuation">;</span></span>
<span class="line">                r<span class="token operator">-&gt;</span>schema<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>schema_start<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>host_end<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                host<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>host_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>host_start<span class="token punctuation">;</span></span>
<span class="line">                host<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>host_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                rc <span class="token operator">=</span> <span class="token function">ngx_http_validate_host</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>host<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_DECLINED<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token string">&quot;client sent invalid host in request line&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_BAD_REQUEST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_http_set_virtual_server</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token operator">&amp;</span>host<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>server <span class="token operator">=</span> host<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// HTTP 版本小于 1.0，那么不接收请求头，直接开始处理请求</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>http_version <span class="token operator">&lt;</span> NGX_HTTP_VERSION_10<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>server<span class="token punctuation">.</span>len <span class="token operator">==</span> <span class="token number">0</span></span>
<span class="line">                    <span class="token operator">&amp;&amp;</span> <span class="token function">ngx_http_set_virtual_server</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>server<span class="token punctuation">)</span></span>
<span class="line">                       <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_http_process_request</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 初始化用于存放 HTTP headers 的链表，为下一步接收 HTTP headers 做准备</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_list_init</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>headers<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">,</span></span>
<span class="line">                              <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_table_elt_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading client request headers&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 将读事件回调函数设置为处理 HTTP header，然后调用这个函数</span></span>
<span class="line">            rev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_process_request_headers<span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_http_process_request_headers</span><span class="token punctuation">(</span>rev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 非法 request line</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* there was error while a request line parsing */</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                          ngx_http_client_errors<span class="token punctuation">[</span>rc <span class="token operator">-</span> NGX_HTTP_CLIENT_ERROR<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_HTTP_PARSE_INVALID_VERSION<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_VERSION_NOT_SUPPORTED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_BAD_REQUEST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* NGX_AGAIN: a request line parsing is still incomplete */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 还需要更多的字符才能进行解析</span></span>
<span class="line">        <span class="token comment">// 这里需要判断用户态缓冲区是否还有足够内存</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos <span class="token operator">==</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>end<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 内存不够，分配更大的缓冲区</span></span>
<span class="line">            <span class="token comment">// 分配大小由配置决定</span></span>
<span class="line">            rv <span class="token operator">=</span> <span class="token function">ngx_http_alloc_large_header_buffer</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 分配失败就结束请求</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rv <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rv <span class="token operator">==</span> NGX_DECLINED<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>request_start<span class="token punctuation">;</span></span>
<span class="line">                r<span class="token operator">-&gt;</span>request_line<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>request_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                              <span class="token string">&quot;client sent too long URI&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_REQUEST_URI_TOO_LARGE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_run_posted_requests</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，从内核中读取字符流的逻辑实现在 <code>ngx_http_read_reqeust_header()</code> 中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token class-name">ssize_t</span></span>
<span class="line"><span class="token function">ngx_http_read_request_header</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                    n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>               <span class="token operator">*</span>rev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>          <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_srv_conf_t</span>  <span class="token operator">*</span>cscf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> r<span class="token operator">-&gt;</span>connection<span class="token punctuation">;</span></span>
<span class="line">    rev <span class="token operator">=</span> c<span class="token operator">-&gt;</span>read<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    n <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>last <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 缓冲区中还有未解析的字符，直接返回</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 从内核的 TCP 读缓冲区中复制新数据</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        n <span class="token operator">=</span> c<span class="token operator">-&gt;</span><span class="token function">recv</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>last<span class="token punctuation">,</span></span>
<span class="line">                    r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>last<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        n <span class="token operator">=</span> NGX_AGAIN<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 本次没有新数据</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 如果当前事件不在定时器中，则加入定时器</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>rev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            cscf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_srv_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> cscf<span class="token operator">-&gt;</span>client_header_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将当前事件加入事件驱动处理模块</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ERROR<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">return</span> NGX_AGAIN<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;client prematurely closed connection&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果发生错误，就结束请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">||</span> n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading client request headers&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_BAD_REQUEST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> NGX_ERROR<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>last <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> n<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_11-5-接收-http-头部" tabindex="-1"><a class="header-anchor" href="#_11-5-接收-http-头部"><span>11.5 接收 HTTP 头部</span></a></h2><p>HTTP request 的格式：</p><ul><li>Request line</li><li>Request header</li><li>空行</li><li>Request body</li></ul><div class="language-http line-numbers-mode" data-highlighter="prismjs" data-ext="http" data-title="http"><pre><code><span class="line"><span class="token request-line"><span class="token method property">GET</span> <span class="token request-target url">/uri</span> <span class="token http-version property">HTTP/1.1</span></span></span>
<span class="line"><span class="token header"><span class="token header-name keyword">cred</span><span class="token punctuation">:</span> <span class="token header-value">xxx</span></span></span>
<span class="line"><span class="token header"><span class="token header-name keyword">username</span><span class="token punctuation">:</span> <span class="token header-value">ttt</span></span></span>
<span class="line"><span class="token header"><span class="token header-name keyword">content-length</span><span class="token punctuation">:</span> <span class="token header-value">4</span></span></span>
<span class="line"></span>
<span class="line">test</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这一步的目的是为了完整接收 HTTP headers，由 <code>ngx_http_process_request_headers()</code> 实现。在接收较大头部时，可能会被多次调用。因此，这个函数也是可重入的。</p><p>HTTP headers 也是可变长的字符串，需要用状态机来解析数据。当然，对于其总长度是有限制的。当最初分配的 <code>client_header_buffer_size</code> 内存大小不够用时，Nginx 会再次分配大小为 <code>large_client_header_buffers</code> 的缓冲区 (这两个值都在配置中指定)。也就是说，request line 与 request header 的长度总和不能超过 <code>large_client_header_buffers</code>，否则 Nginx 会报错。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_process_request_headers</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>rev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    u_char                     <span class="token operator">*</span>p<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">size_t</span>                      len<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                     n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>                   rc<span class="token punctuation">,</span> rv<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_table_elt_t</span>            <span class="token operator">*</span>h<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>           <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_header_t</span>          <span class="token operator">*</span>hh<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_request_t</span>         <span class="token operator">*</span>r<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_srv_conf_t</span>   <span class="token operator">*</span>cscf<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_main_conf_t</span>  <span class="token operator">*</span>cmcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> rev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    r <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> rev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http process request header line&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 检查读事件是否超时，如果超时则关闭连接</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;client timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>timedout <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_REQUEST_TIME_OUT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 获取核心配置项</span></span>
<span class="line">    cmcf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_main_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    rc <span class="token operator">=</span> NGX_AGAIN<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 检查 header_in 缓冲区是否耗尽</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos <span class="token operator">==</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>end<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 重新分配更大的缓冲区</span></span>
<span class="line">                rv <span class="token operator">=</span> <span class="token function">ngx_http_alloc_large_header_buffer</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rv <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 已达到缓冲区上限，无法分配更大的缓冲区</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rv <span class="token operator">==</span> NGX_DECLINED<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    r<span class="token operator">-&gt;</span>lingering_close <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token comment">// HTTP 494</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>p <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                      <span class="token string">&quot;client sent too large request&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span></span>
<span class="line">                                            NGX_HTTP_REQUEST_HEADER_TOO_LARGE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                    len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>end <span class="token operator">-</span> p<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>len <span class="token operator">&gt;</span> NGX_MAX_ERROR_STR <span class="token operator">-</span> <span class="token number">300</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        len <span class="token operator">=</span> NGX_MAX_ERROR_STR <span class="token operator">-</span> <span class="token number">300</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                <span class="token string">&quot;client sent too long header line: \\&quot;%*s...\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                                len<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span></span>
<span class="line">                                            NGX_HTTP_REQUEST_HEADER_TOO_LARGE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 从内核 TCP 读缓冲区中复制数据</span></span>
<span class="line">            n <span class="token operator">=</span> <span class="token function">ngx_http_read_request_header</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN <span class="token operator">||</span> n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* the host header could change the server configuration context */</span></span>
<span class="line">        cscf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_srv_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 解析 TCP 字符流</span></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_http_parse_header_line</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>header_in<span class="token punctuation">,</span></span>
<span class="line">                                        cscf<span class="token operator">-&gt;</span>underscores_in_headers<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 成功解析 HTTP headers</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            r<span class="token operator">-&gt;</span>request_length <span class="token operator">+=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>invalid_header <span class="token operator">&amp;&amp;</span> cscf<span class="token operator">-&gt;</span>ignore_invalid_headers<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* there was error while a header line parsing */</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                              <span class="token string">&quot;client sent invalid header line: \\&quot;%*s\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                              r<span class="token operator">-&gt;</span>header_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">,</span></span>
<span class="line">                              r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* a header line has been parsed successfully */</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 成功解析了一个 HTTP header</span></span>
<span class="line">            h <span class="token operator">=</span> <span class="token function">ngx_list_push</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>headers<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>h <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            h<span class="token operator">-&gt;</span>hash <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_hash<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_name_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line">            h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line">            h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>data<span class="token punctuation">[</span>h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token char">&#39;\\0&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            h<span class="token operator">-&gt;</span>value<span class="token punctuation">.</span>len <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_end <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_start<span class="token punctuation">;</span></span>
<span class="line">            h<span class="token operator">-&gt;</span>value<span class="token punctuation">.</span>data <span class="token operator">=</span> r<span class="token operator">-&gt;</span>header_start<span class="token punctuation">;</span></span>
<span class="line">            h<span class="token operator">-&gt;</span>value<span class="token punctuation">.</span>data<span class="token punctuation">[</span>h<span class="token operator">-&gt;</span>value<span class="token punctuation">.</span>len<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token char">&#39;\\0&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            h<span class="token operator">-&gt;</span>lowcase_key <span class="token operator">=</span> <span class="token function">ngx_pnalloc</span><span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>h<span class="token operator">-&gt;</span>lowcase_key <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_close_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len <span class="token operator">==</span> r<span class="token operator">-&gt;</span>lowcase_index<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_memcpy</span><span class="token punctuation">(</span>h<span class="token operator">-&gt;</span>lowcase_key<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>lowcase_header<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_strlow</span><span class="token punctuation">(</span>h<span class="token operator">-&gt;</span>lowcase_key<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>data<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            hh <span class="token operator">=</span> <span class="token function">ngx_hash_find</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>cmcf<span class="token operator">-&gt;</span>headers_in_hash<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>hash<span class="token punctuation">,</span></span>
<span class="line">                               h<span class="token operator">-&gt;</span>lowcase_key<span class="token punctuation">,</span> h<span class="token operator">-&gt;</span>key<span class="token punctuation">.</span>len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>hh <span class="token operator">&amp;&amp;</span> hh<span class="token operator">-&gt;</span><span class="token function">handler</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> h<span class="token punctuation">,</span> hh<span class="token operator">-&gt;</span>offset<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug2</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;http header: \\&quot;%V: %V\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token operator">&amp;</span>h<span class="token operator">-&gt;</span>key<span class="token punctuation">,</span> <span class="token operator">&amp;</span>h<span class="token operator">-&gt;</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 完整的 header 解析完毕</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_HTTP_PARSE_HEADER_DONE<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* a whole header has been parsed successfully */</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;http header done&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            r<span class="token operator">-&gt;</span>request_length <span class="token operator">+=</span> r<span class="token operator">-&gt;</span>header_in<span class="token operator">-&gt;</span>pos <span class="token operator">-</span> r<span class="token operator">-&gt;</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            r<span class="token operator">-&gt;</span>http_state <span class="token operator">=</span> NGX_HTTP_PROCESS_REQUEST_STATE<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            rc <span class="token operator">=</span> <span class="token function">ngx_http_process_request_header</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 开始处理 HTTP 请求</span></span>
<span class="line">            <span class="token function">ngx_http_process_request</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* a header line parsing is still not complete */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* rc == NGX_HTTP_PARSE_INVALID_HEADER */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;client sent invalid header line&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_BAD_REQUEST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 最终执行 POST 请求</span></span>
<span class="line">    <span class="token function">ngx_http_run_posted_requests</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_11-6-处理-http-请求" tabindex="-1"><a class="header-anchor" href="#_11-6-处理-http-请求"><span>11.6 处理 HTTP 请求</span></a></h2><p>接收到完整的 HTTP headers 之后，已经有足够多必要的信息开始在业务上处理 HTTP 请求了。从上面的代码可以看到，最终都是通过调用 <code>ngx_http_process_request()</code> 处理请求。</p><blockquote><p>只有 HTTP 请求被第一次处理时，调用的是 <code>ngx_http_process_request()</code>。如果一次没有处理完毕，当 HTTP 框架再次处理同一个请求时，将会调用 <code>ngx_http_request_handler()</code>。</p></blockquote><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_process_request</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>  <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> r<span class="token operator">-&gt;</span>connection<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HTTP_SSL<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>http_connection<span class="token operator">-&gt;</span>ssl<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">long</span>                      rc<span class="token punctuation">;</span></span>
<span class="line">        X509                     <span class="token operator">*</span>cert<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">const</span> <span class="token keyword">char</span>               <span class="token operator">*</span>s<span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">ngx_http_ssl_srv_conf_t</span>  <span class="token operator">*</span>sscf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                          <span class="token string">&quot;client sent plain HTTP request to HTTPS port&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_TO_HTTPS<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        sscf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_srv_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_ssl_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>sscf<span class="token operator">-&gt;</span>verify<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            rc <span class="token operator">=</span> <span class="token function">SSL_get_verify_result</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>connection<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> X509_V_OK</span>
<span class="line">                <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>sscf<span class="token operator">-&gt;</span>verify <span class="token operator">!=</span> <span class="token number">3</span> <span class="token operator">||</span> <span class="token operator">!</span><span class="token function">ngx_ssl_verify_error_optional</span><span class="token punctuation">(</span>rc<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                              <span class="token string">&quot;client SSL certificate verify error: (%l:%s)&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                              rc<span class="token punctuation">,</span> <span class="token function">X509_verify_cert_error_string</span><span class="token punctuation">(</span>rc<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_ssl_remove_cached_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>session_ctx<span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token punctuation">(</span><span class="token function">SSL_get0_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>connection<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTPS_CERT_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>sscf<span class="token operator">-&gt;</span>verify <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                cert <span class="token operator">=</span> <span class="token function">SSL_get_peer_certificate</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>connection<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>cert <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token string">&quot;client sent no required SSL certificate&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token function">ngx_ssl_remove_cached_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>session_ctx<span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token punctuation">(</span><span class="token function">SSL_get0_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>connection<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTPS_NO_CERT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">X509_free</span><span class="token punctuation">(</span>cert<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_ssl_ocsp_get_status</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token operator">&amp;</span>s<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                              <span class="token string">&quot;client SSL certificate verify error: %s&quot;</span><span class="token punctuation">,</span> s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_ssl_remove_cached_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>session_ctx<span class="token punctuation">,</span></span>
<span class="line">                                       <span class="token punctuation">(</span><span class="token function">SSL_get0_session</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>ssl<span class="token operator">-&gt;</span>connection<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTPS_CERT_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将当前连接的读事件从定时器中移除</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>read<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_STAT_STUB<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token function">ngx_atomic_fetch_add</span><span class="token punctuation">(</span>ngx_stat_reading<span class="token punctuation">,</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>stat_reading <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token function">ngx_atomic_fetch_add</span><span class="token punctuation">(</span>ngx_stat_writing<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>stat_writing <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 现在开始不再需要接收 HTTP request line 或 HTTP header</span></span>
<span class="line">    <span class="token comment">// 因此重新设置读写事件的回调函数</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_request_handler<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_http_request_handler<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 为请求的读事件设置一个不处理任何事的回调函数</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>read_event_handler <span class="token operator">=</span> ngx_http_block_reading<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_handler</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>准备工作结束后，接下来开始处理 HTTP 请求：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_handler</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_main_conf_t</span>  <span class="token operator">*</span>cmcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 判断请求是否要做内部跳转</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>r<span class="token operator">-&gt;</span>internal<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>connection_type<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">case</span> <span class="token number">0</span><span class="token operator">:</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>keepalive <span class="token operator">=</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>http_version <span class="token operator">&gt;</span> NGX_HTTP_VERSION_10<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> NGX_HTTP_CONNECTION_CLOSE<span class="token operator">:</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>keepalive <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">case</span> NGX_HTTP_CONNECTION_KEEP_ALIVE<span class="token operator">:</span></span>
<span class="line">            r<span class="token operator">-&gt;</span>keepalive <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        r<span class="token operator">-&gt;</span>lingering_close <span class="token operator">=</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>content_length_n <span class="token operator">&gt;</span> <span class="token number">0</span></span>
<span class="line">                              <span class="token operator">||</span> r<span class="token operator">-&gt;</span>headers_in<span class="token punctuation">.</span>chunked<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 不做内部跳转，则从第一个回调函数开始</span></span>
<span class="line">        r<span class="token operator">-&gt;</span>phase_handler <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 否则，跳转到 NGX_HTTP_SERVER_REWRITE_PHASE 阶段处理</span></span>
<span class="line">        cmcf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_main_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        r<span class="token operator">-&gt;</span>phase_handler <span class="token operator">=</span> cmcf<span class="token operator">-&gt;</span>phase_engine<span class="token punctuation">.</span>server_rewrite_index<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    r<span class="token operator">-&gt;</span>valid_location <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HTTP_GZIP<span class="token punctuation">)</span></span></span></span>
<span class="line">    r<span class="token operator">-&gt;</span>gzip_tested <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>gzip_ok <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>gzip_vary <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 为请求的写事件设置回调，并直接开始执行</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>write_event_handler <span class="token operator">=</span> ngx_http_core_run_phases<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_http_core_run_phases</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 <code>ngx_http_core_run_phases()</code> 中，开始调用各 HTTP 模块共同处理请求：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_core_run_phases</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>                   rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_phase_handler_t</span>   <span class="token operator">*</span>ph<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_main_conf_t</span>  <span class="token operator">*</span>cmcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 全局核心配置项</span></span>
<span class="line">    cmcf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_main_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 核心配置中的阶段处理引擎</span></span>
<span class="line">    ph <span class="token operator">=</span> cmcf<span class="token operator">-&gt;</span>phase_engine<span class="token punctuation">.</span>handlers<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 依次执行每一个阶段的 checker()</span></span>
<span class="line">    <span class="token comment">// 在 checker() 中，各个 handler() 会被调用</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>ph<span class="token punctuation">[</span>r<span class="token operator">-&gt;</span>phase_handler<span class="token punctuation">]</span><span class="token punctuation">.</span>checker<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        rc <span class="token operator">=</span> ph<span class="token punctuation">[</span>r<span class="token operator">-&gt;</span>phase_handler<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">checker</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token operator">&amp;</span>ph<span class="token punctuation">[</span>r<span class="token operator">-&gt;</span>phase_handler<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>phase_handler</code> 决定了当前执行到哪一个阶段。这个值可以被 HTTP 框架重置，以实现阶段之间的跳转。很可能一次无法处理完所有的 HTTP 请求，那么控制权会交还为 HTTP 框架。再下一次触发时，将会由 <code>ngx_http_request_handler()</code> 来处理 (注意这里换了回调函数)。这个函数已经在之前在 <code>ngx_http_process_request()</code> 中 被设置为 TCP 连接读写事件的回调函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_request_handler</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>    <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_request_t</span>  <span class="token operator">*</span>r<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> ev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    r <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_set_log_request</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug2</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http run request: \\&quot;%V?%V\\&quot;&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>uri<span class="token punctuation">,</span> <span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>args<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>close<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        r<span class="token operator">-&gt;</span>main<span class="token operator">-&gt;</span>count<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_terminate_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_run_posted_requests</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ev<span class="token operator">-&gt;</span>delayed <span class="token operator">&amp;&amp;</span> ev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        ev<span class="token operator">-&gt;</span>delayed <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        ev<span class="token operator">-&gt;</span>timedout <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// HTTP 请求可写，则调用写事件回调 ngx_http_core_run_phases()</span></span>
<span class="line">    <span class="token comment">// 继续按阶段调用各 HTTP 模块的处理函数</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ev<span class="token operator">-&gt;</span>write<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        r<span class="token operator">-&gt;</span><span class="token function">write_event_handler</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 读事件回调不做任何事</span></span>
<span class="line">        r<span class="token operator">-&gt;</span><span class="token function">read_event_handler</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 执行 POST 请求</span></span>
<span class="line">    <span class="token function">ngx_http_run_posted_requests</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>综上，HTTP 请求被处理的方式是共同的：</p><ol><li>先按阶段调用各个 HTTP 模块处理请求</li><li>再处理 POST 请求</li></ol><p>而按阶段处理请求的具体方式是依次调用每一个阶段的 <code>checker()</code>。<code>checker()</code> 函数的主要任务是执行该阶段每个 HTTP 模块实现的回调函数，并根据返回值决定：</p><ol><li>当前阶段是否结束 (之后的回调还需要被执行吗)</li><li>下次要执行的回调是哪一个 (下一个，还是下阶段第一个)</li><li>立刻执行下一个回调函数，还是先将控制权交还给事件驱动模块</li></ol><p>对于 11 个阶段，实现了不同的 <code>checker()</code> 函数。这些函数的具体代码已经在上一节中分析过。</p>`,46)]))}const i=s(t,[["render",l],["__file","Chapter 11 - HTTP 框架的执行流程.html.vue"]]),u=JSON.parse('{"path":"/understanding-nginx-notes/Part%203%20-%20%E6%B7%B1%E5%85%A5%20Nginx/Chapter%2011%20-%20HTTP%20%E6%A1%86%E6%9E%B6%E7%9A%84%E6%89%A7%E8%A1%8C%E6%B5%81%E7%A8%8B.html","title":"Chapter 11 - HTTP 框架的执行流程","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"11.2 新连接建立时的行为","slug":"_11-2-新连接建立时的行为","link":"#_11-2-新连接建立时的行为","children":[]},{"level":2,"title":"11.3 第一次可读事件的处理","slug":"_11-3-第一次可读事件的处理","link":"#_11-3-第一次可读事件的处理","children":[]},{"level":2,"title":"11.4 接收 HTTP 请求行","slug":"_11-4-接收-http-请求行","link":"#_11-4-接收-http-请求行","children":[]},{"level":2,"title":"11.5 接收 HTTP 头部","slug":"_11-5-接收-http-头部","link":"#_11-5-接收-http-头部","children":[]},{"level":2,"title":"11.6 处理 HTTP 请求","slug":"_11-6-处理-http-请求","link":"#_11-6-处理-http-请求","children":[]}],"git":{},"filePathRelative":"understanding-nginx-notes/Part 3 - 深入 Nginx/Chapter 11 - HTTP 框架的执行流程.md"}');export{i as comp,u as data};
