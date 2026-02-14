import{_ as s,c as a,a as p,o as e}from"./app-BeHGwf2X.js";const t={};function l(c,n){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="chapter-12-6-12-9-转发响应并结束请求" tabindex="-1"><a class="header-anchor" href="#chapter-12-6-12-9-转发响应并结束请求"><span>Chapter 12.6 - 12.9 - 转发响应并结束请求</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 08 / 02 15:34</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_12-6-不转发响应时的处理流程" tabindex="-1"><a class="header-anchor" href="#_12-6-不转发响应时的处理流程"><span>12.6 不转发响应时的处理流程</span></a></h2><blockquote><p>没找到代码...</p></blockquote><h2 id="_12-7-以下游网速优先来转发响应" tabindex="-1"><a class="header-anchor" href="#_12-7-以下游网速优先来转发响应"><span>12.7 以下游网速优先来转发响应</span></a></h2><p>如果下游网速优先，意味着上游服务器的响应数据能够很快被下游客户端取走。因此 Nginx 只需要开一个固定大小的内存缓冲区，存放上游服务器的响应数据。如果缓冲区满，那么暂停接收上游服务器的响应，等到缓冲区中的响应发送给下游客户端后，缓冲区自然会清空。</p><p>这种设计的优势在于，不会使用大量内存，也不会使用到磁盘文件。能够提高并发量，降低服务器负载。</p><h3 id="_12-7-1-转发响应-header" tabindex="-1"><a class="header-anchor" href="#_12-7-1-转发响应-header"><span>12.7.1 转发响应 header</span></a></h3><p>HTTP 模块解析 header 后，将解析出的值设置到 <code>ngx_http_upstream_t</code> 的 <code>header_in</code> 成员中，之后会将 <code>header_in</code> 中的 header 设置到 <code>header_out</code> 中。这些 header 最终会被发送给客户端。</p><h3 id="_12-7-2-转发响应-body" tabindex="-1"><a class="header-anchor" href="#_12-7-2-转发响应-body"><span>12.7.2 转发响应 body</span></a></h3><p>在上一节已经总结，对于下游网速优先，将不使用磁盘文件缓存响应。上游服务器的读事件回调函数与下游客户端的写事件回调函数分别为 <code>ngx_http_upstream_process_non_buffered_upstream()</code> 和 <code>ngx_http_upstream_process_non_buffered_downstream()</code>。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_process_non_buffered_upstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">,</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span> <span class="token operator">*</span>u<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>  <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 获取 Nginx 与上游服务器的连接</span></span>
<span class="line">    c <span class="token operator">=</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http upstream process non buffered upstream&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading upstream&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果读事件已经超时，则结束请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_connection_error</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;upstream timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_HTTP_GATEWAY_TIME_OUT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_upstream_process_non_buffered_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_process_non_buffered_downstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>          <span class="token operator">*</span>wev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>     <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span>  <span class="token operator">*</span>u<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// Nginx 与下游客户端的连接</span></span>
<span class="line">    c <span class="token operator">=</span> r<span class="token operator">-&gt;</span>connection<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// Nginx 与上游服务器的连接</span></span>
<span class="line">    u <span class="token operator">=</span> r<span class="token operator">-&gt;</span>upstream<span class="token punctuation">;</span></span>
<span class="line">    wev <span class="token operator">=</span> c<span class="token operator">-&gt;</span>write<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http upstream process non buffered downstream&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;sending to client&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// Nginx 与下游客户端的写事件已超时</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>timedout <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_connection_error</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;client timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_HTTP_REQUEST_TIME_OUT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_upstream_process_non_buffered_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到读写回调函数最终都调用了 <code>ngx_http_upstream_process_non_buffered_request()</code>，只是第二个参数不同：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_process_non_buffered_request</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">,</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span> do_write<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">size_t</span>                     size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                    n<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>                 <span class="token operator">*</span>b<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>                  rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>                 flags<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>          <span class="token operator">*</span>downstream<span class="token punctuation">,</span> <span class="token operator">*</span>upstream<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span>       <span class="token operator">*</span>u<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_core_loc_conf_t</span>  <span class="token operator">*</span>clcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    u <span class="token operator">=</span> r<span class="token operator">-&gt;</span>upstream<span class="token punctuation">;</span></span>
<span class="line">    downstream <span class="token operator">=</span> r<span class="token operator">-&gt;</span>connection<span class="token punctuation">;</span></span>
<span class="line">    upstream <span class="token operator">=</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    b <span class="token operator">=</span> <span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>buffer<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// do_write 表示本次是否向下游发送响应</span></span>
<span class="line">    do_write <span class="token operator">=</span> do_write <span class="token operator">||</span> u<span class="token operator">-&gt;</span>length <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// Nginx 与上下游的通信会在这个循环中反复穿插进行</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 向下游发送响应</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>do_write<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 是否还有未转发给下游的响应数据</span></span>
<span class="line">            <span class="token comment">// 直接发送 out_bufs 缓冲区中的内容即可</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>out_bufs <span class="token operator">||</span> u<span class="token operator">-&gt;</span>busy_bufs <span class="token operator">||</span> downstream<span class="token operator">-&gt;</span>buffered<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 发送数据</span></span>
<span class="line">                rc <span class="token operator">=</span> <span class="token function">ngx_http_output_filter</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token operator">-&gt;</span>out_bufs<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 更新缓冲区链表</span></span>
<span class="line">                <span class="token function">ngx_chain_update_chains</span><span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>free_bufs<span class="token punctuation">,</span> <span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>busy_bufs<span class="token punctuation">,</span></span>
<span class="line">                                        <span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>out_bufs<span class="token punctuation">,</span> u<span class="token operator">-&gt;</span>output<span class="token punctuation">.</span>tag<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>busy_bufs <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>length <span class="token operator">==</span> <span class="token number">0</span></span>
<span class="line">                    <span class="token operator">||</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>eof <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>length <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>eof<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_ERR<span class="token punctuation">,</span> upstream<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token string">&quot;upstream prematurely closed connection&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span></span>
<span class="line">                                                       NGX_HTTP_BAD_GATEWAY<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>error <span class="token operator">||</span> u<span class="token operator">-&gt;</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span></span>
<span class="line">                                                       NGX_HTTP_BAD_GATEWAY<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                b<span class="token operator">-&gt;</span>pos <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">                b<span class="token operator">-&gt;</span>last <span class="token operator">=</span> b<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 计算缓冲区中的剩余空间</span></span>
<span class="line">        size <span class="token operator">=</span> b<span class="token operator">-&gt;</span>end <span class="token operator">-</span> b<span class="token operator">-&gt;</span>last<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>size <span class="token operator">&amp;&amp;</span> upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 将上游响应读取到缓冲区中</span></span>
<span class="line">            n <span class="token operator">=</span> upstream<span class="token operator">-&gt;</span><span class="token function">recv</span><span class="token punctuation">(</span>upstream<span class="token punctuation">,</span> b<span class="token operator">-&gt;</span>last<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">// 没读取完，下次继续</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>bytes_received <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line">                u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>response_length <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 调用 input_filter() 处理 body</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span><span class="token function">input_filter</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>input_filter_ctx<span class="token punctuation">,</span> n<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 设置可转发的标志位</span></span>
<span class="line">            do_write <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    clcf <span class="token operator">=</span> <span class="token function">ngx_http_get_module_loc_conf</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> ngx_http_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将写事件添加到事件驱动模块中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>data <span class="token operator">==</span> r<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_write_event</span><span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>write<span class="token punctuation">,</span> clcf<span class="token operator">-&gt;</span>send_lowat<span class="token punctuation">)</span></span>
<span class="line">            <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将写事件添加到定时器中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>active <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>write<span class="token punctuation">,</span> clcf<span class="token operator">-&gt;</span>send_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>write<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>eof <span class="token operator">||</span> upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        flags <span class="token operator">=</span> NGX_CLOSE_EVENT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        flags <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将读事件添加到事件驱动模块中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">,</span> flags<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将读事件添加到定时器中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>active <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">,</span> u<span class="token operator">-&gt;</span>conf<span class="token operator">-&gt;</span>read_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_12-8-以上游网速优先来转发响应" tabindex="-1"><a class="header-anchor" href="#_12-8-以上游网速优先来转发响应"><span>12.8 以上游网速优先来转发响应</span></a></h2><p>如果要保证上游网速优先，那么 Nginx 所在机器必然会缓存大量的上游服务器响应，因为下游客户端来不及取走。当配置中的 <code>buffering</code> 为 <code>1</code> 时，先会使用 <code>bufs.num * bufs.size</code> 的内存缓冲区，如果不够用时，还会再使用最大不超过 <code>max_temp_file_size</code> 字节的临时文件缓存响应。</p><p><code>ngx_event_pipe_t</code> 是这种缓存转发方式的核心结构体，这个结构也需要由 HTTP 模块提前创建，维护着上下游之间转发的响应 body。其中的缓冲区管理非常复杂 - 因为 Nginx 追求高效率，因此 <strong>绝不对把相同的内容复制到两块内存中</strong>。同一块内存可能同时用于接收上游响应、向下游转发响应、写入临时文件。说白了，就是一大堆复杂的指针操作，在不多分配内存的条件下，尽最大可能复用一块已有的内存。</p><p>比如，在转发 header 时，会初始化 <code>preread_bufs</code> 预读缓冲区链表。所谓预读，就是在读取 header 时也顺便读取到了一部分的 body。这个链表的缓冲区并不分配内存，而是直接使用其中的 <code>ngx_buf_t</code> 结构体指向已经接收到的响应 body 对应的内存。这就是不重复使用内存的原则。</p><p>与下游网速优先的响应转发处理类似，为上游服务器的读事件与下游客户端的写事件分别设置了回调函数 <code>ngx_http_upstream_process_upstream()</code> 和 <code>ngx_http_upstream_process_downstream()</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_process_upstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">,</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span> <span class="token operator">*</span>u<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>       <span class="token operator">*</span>rev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_pipe_t</span>  <span class="token operator">*</span>p<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>  <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 获得 Nginx 与上游服务器的连接</span></span>
<span class="line">    c <span class="token operator">=</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">;</span></span>
<span class="line">    p <span class="token operator">=</span> u<span class="token operator">-&gt;</span>pipe<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 获得读事件</span></span>
<span class="line">    rev <span class="token operator">=</span> c<span class="token operator">-&gt;</span>read<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http upstream process upstream&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading upstream&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 读事件已超时</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        p<span class="token operator">-&gt;</span>upstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_connection_error</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;upstream timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;http upstream delayed&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// ...</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_event_pipe</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ABORT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_upstream_process_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_process_downstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>          <span class="token operator">*</span>wev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>     <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_pipe_t</span>     <span class="token operator">*</span>p<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span>  <span class="token operator">*</span>u<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> r<span class="token operator">-&gt;</span>connection<span class="token punctuation">;</span></span>
<span class="line">    u <span class="token operator">=</span> r<span class="token operator">-&gt;</span>upstream<span class="token punctuation">;</span></span>
<span class="line">    p <span class="token operator">=</span> u<span class="token operator">-&gt;</span>pipe<span class="token punctuation">;</span></span>
<span class="line">    wev <span class="token operator">=</span> c<span class="token operator">-&gt;</span>write<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http upstream process downstream&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;sending to client&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_THREADS<span class="token punctuation">)</span></span></span></span>
<span class="line">    p<span class="token operator">-&gt;</span>aio <span class="token operator">=</span> r<span class="token operator">-&gt;</span>aio<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 写事件已超时</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        p<span class="token operator">-&gt;</span>downstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>timedout <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_connection_error</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span> <span class="token string">&quot;client timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;http downstream delayed&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_write_event</span><span class="token punctuation">(</span>wev<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>send_lowat<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// ...</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_event_pipe</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ABORT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_upstream_process_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中用到了两个公共的函数。<code>ngx_event_pipe()</code> 实现了缓存响应的功能，可以看到第二个参数体现了读写的区别：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token class-name">ngx_int_t</span></span>
<span class="line"><span class="token function">ngx_event_pipe</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_pipe_t</span> <span class="token operator">*</span>p<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> do_write<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>     rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>    flags<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>  <span class="token operator">*</span>rev<span class="token punctuation">,</span> <span class="token operator">*</span>wev<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 检测 do_write 标志位，决定了是接收上游响应，还是向下游转发</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>do_write<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;sending to client&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 向下游发送响应</span></span>
<span class="line">            rc <span class="token operator">=</span> <span class="token function">ngx_event_pipe_write_to_downstream</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ABORT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_BUSY<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">return</span> NGX_OK<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 以上两个返回值，不会再向下执行</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        p<span class="token operator">-&gt;</span>read <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        p<span class="token operator">-&gt;</span>upstream_blocked <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        p<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;reading upstream&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 读取上游服务器响应</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_event_pipe_read_upstream</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ABORT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 如果这两个标志位有一个为 1，那么就将 do_write 置为 1，继续向下游发送响应</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>p<span class="token operator">-&gt;</span>read <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>p<span class="token operator">-&gt;</span>upstream_blocked<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        do_write <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>fd <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token class-name">ngx_socket_t</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        rev <span class="token operator">=</span> p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        flags <span class="token operator">=</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>eof <span class="token operator">||</span> rev<span class="token operator">-&gt;</span>error<span class="token punctuation">)</span> <span class="token operator">?</span> NGX_CLOSE_EVENT <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将上游读事件添加到事件驱动模块中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_read_event</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> flags<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将上游读事件添加到定时器中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>rev<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>active <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>rev<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>rev<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>read_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>rev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>fd <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token class-name">ngx_socket_t</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token number">1</span></span>
<span class="line">        <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>data <span class="token operator">==</span> p<span class="token operator">-&gt;</span>output_ctx<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        wev <span class="token operator">=</span> p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>write<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将下游写事件添加到事件驱动模块中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_write_event</span><span class="token punctuation">(</span>wev<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>send_lowat<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将下游写事件添加到定时器中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>wev<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>active <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>wev<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>wev<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>send_timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>wev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> NGX_OK<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上函数，通过调用 <code>ngx_event_pipe_write_to_downstream()</code> 和 <code>ngx_event_pipe_read_upstream()</code>，屏蔽了缓存细节。</p><h3 id="_12-8-1-ngx-event-pipe-read-upstream-函数" tabindex="-1"><a class="header-anchor" href="#_12-8-1-ngx-event-pipe-read-upstream-函数"><span>12.8.1 <code>ngx_event_pipe_read_upstream()</code> 函数</span></a></h3><p>该函数的主要任务是，把接收到的上游响应存放到内存或者磁盘文件中，然后用 <code>ngx_buf_t</code> 缓冲区指向这些响应，最终用 <code>in</code> 和 <code>out</code> 缓冲区链表把这些缓冲区管理起来。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token class-name">ngx_int_t</span></span>
<span class="line"><span class="token function">ngx_event_pipe_read_upstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_pipe_t</span> <span class="token operator">*</span>p<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">off_t</span>         limit<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>       n<span class="token punctuation">,</span> size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>     rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>    <span class="token operator">*</span>b<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_msec_t</span>    delay<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_chain_t</span>  <span class="token operator">*</span>chain<span class="token punctuation">,</span> <span class="token operator">*</span>cl<span class="token punctuation">,</span> <span class="token operator">*</span>ln<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 检查上游连接是否结束</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream_eof <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_error <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_done<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span> NGX_OK<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_THREADS<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>aio<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;pipe read upstream: aio&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span> NGX_AGAIN<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>writing<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;pipe read upstream: writing&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_event_pipe_write_chain_to_temp_file</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> rc<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;pipe read upstream: %d&quot;</span><span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 开始接收上游响应</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 检查上游连接是否结束</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream_eof <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_error <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_done<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 预读缓冲区为空，或上游没有响应可以接收</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>preread_bufs <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 检查预读缓冲区，优先处理这里面的 body</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>preread_bufs<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* use the pre-read bufs if they exist */</span></span>
<span class="line"></span>
<span class="line">            chain <span class="token operator">=</span> p<span class="token operator">-&gt;</span>preread_bufs<span class="token punctuation">;</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>preread_bufs <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            n <span class="token operator">=</span> p<span class="token operator">-&gt;</span>preread_size<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;pipe preread: %z&quot;</span><span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                p<span class="token operator">-&gt;</span>read <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>limit_rate<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                limit <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">off_t</span><span class="token punctuation">)</span> p<span class="token operator">-&gt;</span>limit_rate <span class="token operator">*</span> <span class="token punctuation">(</span><span class="token function">ngx_time</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> p<span class="token operator">-&gt;</span>start_sec <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                        <span class="token operator">-</span> p<span class="token operator">-&gt;</span>read_length<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>limit <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>delayed <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                    delay <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">ngx_msec_t</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">-</span> limit <span class="token operator">*</span> <span class="token number">1000</span> <span class="token operator">/</span> p<span class="token operator">-&gt;</span>limit_rate <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">,</span> delay<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                limit <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 如果预读缓冲区为空，则检查 free_raw_bufs 缓冲区链表</span></span>
<span class="line">            <span class="token comment">// 如果不为空，那么直接使用</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* use the free bufs if they exist */</span></span>
<span class="line"></span>
<span class="line">                chain <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>single_buf<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line">                    chain<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>allocated <span class="token operator">&lt;</span> p<span class="token operator">-&gt;</span>bufs<span class="token punctuation">.</span>num<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 还能够从内存池中分配到一块新的缓冲区，那么分配一块新缓冲区</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* allocate a new buf if it&#39;s still allowed */</span></span>
<span class="line"></span>
<span class="line">                b <span class="token operator">=</span> <span class="token function">ngx_create_temp_buf</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>bufs<span class="token punctuation">.</span>size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>b <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>allocated<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                chain <span class="token operator">=</span> <span class="token function">ngx_alloc_chain_link</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>chain <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                chain<span class="token operator">-&gt;</span>buf <span class="token operator">=</span> b<span class="token punctuation">;</span></span>
<span class="line">                chain<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>p<span class="token operator">-&gt;</span>cacheable</span>
<span class="line">                       <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>data <span class="token operator">==</span> p<span class="token operator">-&gt;</span>output_ctx</span>
<span class="line">                       <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>ready</span>
<span class="line">                       <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>p<span class="token operator">-&gt;</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 下游连接已经就绪，那么向下游发送响应，释放出一些缓冲区</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * if the bufs are not needed to be saved in a cache and</span>
<span class="line">                 * a downstream is ready then write the bufs to a downstream</span>
<span class="line">                 */</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>upstream_blocked <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pipe downstream ready&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>cacheable</span>
<span class="line">                       <span class="token operator">||</span> p<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>offset <span class="token operator">&lt;</span> p<span class="token operator">-&gt;</span>max_temp_file_size<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 检查临时文件中已写入的响应内容长度</span></span>
<span class="line">                <span class="token comment">// 将 in 缓冲区中的内容写入临时文件，再将 ngx_buf_t 缓冲区从 in 中移入 out 中</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * if it is allowed, then save some bufs from p-&gt;in</span>
<span class="line">                 * to a temporary file, and add them to a p-&gt;out chain</span>
<span class="line">                 */</span></span>
<span class="line"></span>
<span class="line">                rc <span class="token operator">=</span> <span class="token function">ngx_event_pipe_write_chain_to_temp_file</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pipe temp offset: %O&quot;</span><span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>offset<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_BUSY<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">return</span> rc<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                chain <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>single_buf<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line">                    chain<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 没有空间用于缓存上游数据了，暂时不再接收上游响应</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* there are no bufs to read in */</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;no pipe bufs to read in&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 接收上游响应</span></span>
<span class="line">            n <span class="token operator">=</span> p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span><span class="token function">recv_chain</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream<span class="token punctuation">,</span> chain<span class="token punctuation">,</span> limit<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;pipe recv chain: %z&quot;</span><span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 将带有新数据的缓冲区放置到 free_raw_bufs 链表的头部</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                chain<span class="token operator">-&gt;</span>next <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> chain<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 接收上游数据失败</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                p<span class="token operator">-&gt;</span>upstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>single_buf<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_event_pipe_remove_shadow_links</span><span class="token punctuation">(</span>chain<span class="token operator">-&gt;</span>buf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 置待处理标志位</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>read <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                p<span class="token operator">-&gt;</span>upstream_eof <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        delay <span class="token operator">=</span> p<span class="token operator">-&gt;</span>limit_rate <span class="token operator">?</span> <span class="token punctuation">(</span><span class="token class-name">ngx_msec_t</span><span class="token punctuation">)</span> n <span class="token operator">*</span> <span class="token number">1000</span> <span class="token operator">/</span> p<span class="token operator">-&gt;</span>limit_rate <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 开始依次处理 free_raw_bufs 中的每一个缓冲块</span></span>
<span class="line">        <span class="token comment">// free_raw_bufs 被清空</span></span>
<span class="line">        p<span class="token operator">-&gt;</span>read_length <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line">        cl <span class="token operator">=</span> chain<span class="token punctuation">;</span></span>
<span class="line">        p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 处理每一个缓冲块</span></span>
<span class="line">        <span class="token keyword">while</span> <span class="token punctuation">(</span>cl <span class="token operator">&amp;&amp;</span> n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 将缓冲块的 shadows 释放，因为必然不存在多次引用的情况</span></span>
<span class="line">            <span class="token function">ngx_event_pipe_remove_shadow_links</span><span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 缓冲块中的剩余长度</span></span>
<span class="line">            size <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>end <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 本次 body 的长度多于缓冲区剩余空间</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;=</span> size<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 缓冲区满了</span></span>
<span class="line">                cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>end<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* STUB */</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>num <span class="token operator">=</span> p<span class="token operator">-&gt;</span>num<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 调用 input_filter() 函数处理 body</span></span>
<span class="line">                <span class="token comment">// 默认的行为是，将这个缓冲区加入到 in 链表中</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span><span class="token function">input_filter</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> cl<span class="token operator">-&gt;</span>buf<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 当前缓冲块可以被销毁</span></span>
<span class="line">                <span class="token comment">// 接着处理下一个缓冲块</span></span>
<span class="line">                n <span class="token operator">-=</span> size<span class="token punctuation">;</span></span>
<span class="line">                ln <span class="token operator">=</span> cl<span class="token punctuation">;</span></span>
<span class="line">                cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">ngx_free_chain</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> ln<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// 这个缓冲区未满，还可以再次接收响应</span></span>
<span class="line">                cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line">                n <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 将本次未满的缓冲区放回 free_raw_bufs 中</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>ln <span class="token operator">=</span> cl<span class="token punctuation">;</span> ln<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span> ln <span class="token operator">=</span> ln<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* void */</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            ln<span class="token operator">-&gt;</span>next <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> cl<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>delay <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>delayed <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream<span class="token operator">-&gt;</span>read<span class="token punctuation">,</span> delay<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>length <span class="token operator">!=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>pos <span class="token operator">&gt;=</span> p<span class="token operator">-&gt;</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* STUB */</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>num <span class="token operator">=</span> p<span class="token operator">-&gt;</span>num<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span><span class="token function">input_filter</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> cl<span class="token operator">-&gt;</span>buf<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_free_chain</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> cl<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>length <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        p<span class="token operator">-&gt;</span>upstream_done <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        p<span class="token operator">-&gt;</span>read <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 上游连接已结束</span></span>
<span class="line">    <span class="token comment">// 如果 free_raw_bufs 缓冲区链表不为空，则处理其中的数据</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream_eof <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_error<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* STUB */</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>num <span class="token operator">=</span> p<span class="token operator">-&gt;</span>num<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 再次调用 input_filter() 处理最后一个剩余的缓冲区</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span><span class="token function">input_filter</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token operator">-&gt;</span>buf<span class="token punctuation">)</span> <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        p<span class="token operator">-&gt;</span>free_raw_bufs <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 需要尽快释放缓冲区中用到的内存</span></span>
<span class="line">        <span class="token comment">// 释放 shadow 为空的缓冲区</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>free_bufs <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>buf_to_file <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free_raw_bufs<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>shadow <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_pfree</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>cacheable <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>in <span class="token operator">||</span> p<span class="token operator">-&gt;</span>buf_to_file<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;pipe write chain&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_event_pipe_write_chain_to_temp_file</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> rc<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> NGX_OK<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_12-8-2-ngx-event-pipe-write-to-downstream-函数" tabindex="-1"><a class="header-anchor" href="#_12-8-2-ngx-event-pipe-write-to-downstream-函数"><span>12.8.2 <code>ngx_event_pipe_write_to_downstream()</code> 函数</span></a></h3><p>该函数主要负责把 <code>in</code> 和 <code>out</code> 两个缓冲区链表中的数据发送给下游客户端。由于 <code>out</code> 链表中的缓冲区数据在响应中的位置比 <code>in</code> 链表更靠前，所以要被优先发送给下游。当下游的连接处于可写状态时，会尽可能地循环发送 <code>out</code> 和 <code>in</code> 中的缓冲区。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token class-name">ngx_int_t</span></span>
<span class="line"><span class="token function">ngx_event_pipe_write_to_downstream</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_pipe_t</span> <span class="token operator">*</span>p<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    u_char            <span class="token operator">*</span>prev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">size_t</span>             bsize<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>          rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>         flush<span class="token punctuation">,</span> flushed<span class="token punctuation">,</span> prev_last_shadow<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_chain_t</span>       <span class="token operator">*</span>out<span class="token punctuation">,</span> <span class="token operator">*</span><span class="token operator">*</span>ll<span class="token punctuation">,</span> <span class="token operator">*</span>cl<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>  <span class="token operator">*</span>downstream<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    downstream <span class="token operator">=</span> p<span class="token operator">-&gt;</span>downstream<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;pipe write downstream: %d&quot;</span><span class="token punctuation">,</span> downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>ready<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_THREADS<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>writing<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_event_pipe_write_chain_to_temp_file</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ABORT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    flushed <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>downstream_error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ngx_event_pipe_drain_chains</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 检查上游连接是否结束</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>upstream_eof <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_error <span class="token operator">||</span> p<span class="token operator">-&gt;</span>upstream_done<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* pass the p-&gt;out and p-&gt;in chains to the output filter */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>busy<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 把 out 链表中的缓冲区发送给下游</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>out<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pipe write downstream flush out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>out<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                rc <span class="token operator">=</span> p<span class="token operator">-&gt;</span><span class="token function">output_filter</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>output_ctx<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>out<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>downstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token function">ngx_event_pipe_drain_chains</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>out <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>writing<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 把 in 链表中的缓冲区发送给下游</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>in<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pipe write downstream flush in&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>in<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                rc <span class="token operator">=</span> p<span class="token operator">-&gt;</span><span class="token function">output_filter</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>output_ctx<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>downstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">return</span> <span class="token function">ngx_event_pipe_drain_chains</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>in <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                           <span class="token string">&quot;pipe write downstream done&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* TODO: free unused bufs */</span></span>
<span class="line"></span>
<span class="line">            p<span class="token operator">-&gt;</span>downstream_done <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>downstream<span class="token operator">-&gt;</span>data <span class="token operator">!=</span> p<span class="token operator">-&gt;</span>output_ctx</span>
<span class="line">            <span class="token operator">||</span> <span class="token operator">!</span>downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>ready</span>
<span class="line">            <span class="token operator">||</span> downstream<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>delayed<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* bsize is the size of the busy recycled bufs */</span></span>
<span class="line"></span>
<span class="line">        prev <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        bsize <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 统计 busy 缓冲区中待发送的响应长度，检查是否超过 busy_size 配置</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>busy<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>prev <span class="token operator">==</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                bsize <span class="token operator">+=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>end <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">                prev <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;pipe write busy: %uz&quot;</span><span class="token punctuation">,</span> bsize<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        out <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 如果 ngx_http_request_t 中 out 缓冲区的长度已经超过了 busy_size</span></span>
<span class="line">        <span class="token comment">// 那么不再发送 out 和 in 链表中的内容</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>bsize <span class="token operator">&gt;=</span> <span class="token punctuation">(</span><span class="token class-name">size_t</span><span class="token punctuation">)</span> p<span class="token operator">-&gt;</span>busy_size<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            flush <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">goto</span> flush<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        flush <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        ll <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        prev_last_shadow <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// out 链表中有内容</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>out<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>out<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_ALERT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                                  <span class="token string">&quot;recycled buffer in pipe out chain&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>out <span class="token operator">=</span> p<span class="token operator">-&gt;</span>out<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>p<span class="token operator">-&gt;</span>cacheable <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>p<span class="token operator">-&gt;</span>writing <span class="token operator">&amp;&amp;</span> p<span class="token operator">-&gt;</span>in<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// in 链表中有内容</span></span>
<span class="line">                cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>in<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token function">ngx_log_debug3</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pipe write buf ls:%d %p %z&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                               cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last_shadow<span class="token punctuation">,</span></span>
<span class="line">                               cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>pos<span class="token punctuation">,</span></span>
<span class="line">                               cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>pos<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>recycled <span class="token operator">&amp;&amp;</span> prev_last_shadow<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token comment">// 检查待发送的长度加上当前缓冲块是否超过 busy_size</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>bsize <span class="token operator">+</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>end <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start <span class="token operator">&gt;</span> p<span class="token operator">-&gt;</span>busy_size<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                        flush <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">                        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                    bsize <span class="token operator">+=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>end <span class="token operator">-</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                prev_last_shadow <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last_shadow<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                p<span class="token operator">-&gt;</span>in <span class="token operator">=</span> p<span class="token operator">-&gt;</span>in<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            cl<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>out<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token operator">*</span>ll <span class="token operator">=</span> cl<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">                out <span class="token operator">=</span> cl<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            ll <span class="token operator">=</span> <span class="token operator">&amp;</span>cl<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    flush<span class="token operator">:</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_log_debug2</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_EVENT<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;pipe write: out:%p, f:%ui&quot;</span><span class="token punctuation">,</span> out<span class="token punctuation">,</span> flush<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>out <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>flush<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* a workaround for AIO */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>flushed<span class="token operator">++</span> <span class="token operator">&gt;</span> <span class="token number">10</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">return</span> NGX_BUSY<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 向下游发送缓冲区</span></span>
<span class="line">        rc <span class="token operator">=</span> p<span class="token operator">-&gt;</span><span class="token function">output_filter</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>output_ctx<span class="token punctuation">,</span> out<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 更新 free、busy、out 缓冲区</span></span>
<span class="line">        <span class="token function">ngx_chain_update_chains</span><span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token operator">&amp;</span>p<span class="token operator">-&gt;</span>free<span class="token punctuation">,</span> <span class="token operator">&amp;</span>p<span class="token operator">-&gt;</span>busy<span class="token punctuation">,</span> <span class="token operator">&amp;</span>out<span class="token punctuation">,</span> p<span class="token operator">-&gt;</span>tag<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            p<span class="token operator">-&gt;</span>downstream_error <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">ngx_event_pipe_drain_chains</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 遍历 free 链表，释放其中的 shadow，可以用于接收新的响应</span></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span>cl <span class="token operator">=</span> p<span class="token operator">-&gt;</span>free<span class="token punctuation">;</span> cl<span class="token punctuation">;</span> cl <span class="token operator">=</span> cl<span class="token operator">-&gt;</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>temp_file<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>p<span class="token operator">-&gt;</span>cacheable <span class="token operator">||</span> <span class="token operator">!</span>p<span class="token operator">-&gt;</span>cyclic_temp_file<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/* reset p-&gt;temp_offset if all bufs had been sent */</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>file_last <span class="token operator">==</span> p<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>offset<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    p<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>offset <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* TODO: free buf if p-&gt;free_bufs &amp;&amp; upstream done */</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* add the free shadow raw buf to p-&gt;free_raw_bufs */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last_shadow<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_event_pipe_add_free_buf</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>shadow<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">return</span> NGX_ABORT<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>last_shadow <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            cl<span class="token operator">-&gt;</span>buf<span class="token operator">-&gt;</span>shadow <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> NGX_OK<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="_12-9-结束-upstream-请求" tabindex="-1"><a class="header-anchor" href="#_12-9-结束-upstream-请求"><span>12.9 结束 upstream 请求</span></a></h2><p>当 Nginx 与 <strong>上游服务器</strong> 交互出错，或正常处理完毕时，需要结束请求。不能直接使用 <code>ngx_http_finalize_request()</code> 来结束请求，因为这个函数用于结束 Nginx 与下游客户端的连接，而 Nginx 与上游服务器的连接将会无法释放。Upstream 机制提供了三种可以结束请求的方式：</p><ul><li>直接调用 <code>ngx_http_upstream_finalize_request()</code> 函数</li><li>调用 <code>ngx_http_upstream_cleanup()</code></li><li>调用 <code>ngx_http_upstream_next()</code></li></ul><p>在启动 upstream 机制时，<code>ngx_http_upstream_cleanup()</code> 函数会注册到请求的 <code>cleanup</code> 链表中。这样，HTTP 请求在结束时就会调用 <code>ngx_http_upstream_cleanup()</code>。该函数中，实际上还是通过调用 <code>ngx_http_upstream_finalize_request()</code> 来结束请求。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_cleanup</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>data<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r <span class="token operator">=</span> data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;cleanup http upstream request: \\&quot;%V\\&quot;&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>r<span class="token operator">-&gt;</span>uri<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>upstream<span class="token punctuation">,</span> NGX_DONE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当处理请求出现错误时，则一般调用 <code>ngx_http_upstream_next()</code> 函数。Upstream 机制在这个函数中提供了一个较为灵活的功能：与上游服务器交互发生错误时，Nginx 可以多给上游服务器一些机会，重新向这台或另一台上游服务器发起连接。在该函数中，结束请求前，会检查 <code>ngx_peer_connection_t</code> 结构体中的 <code>tries</code> 成员 (每个连接的最大重试次数) - 每次出错就减 1，当 <code>tries</code> 减到 0 时，才真正调用 <code>ngx_http_upstream_finalize_request()</code> 函数结束请求；否则就调用 <code>ngx_http_upstream_connect()</code> 函数重新向上游服务器发起请求：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_next</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">,</span> <span class="token class-name">ngx_http_upstream_t</span> <span class="token operator">*</span>u<span class="token punctuation">,</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span> ft_type<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_msec_t</span>  timeout<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>  status<span class="token punctuation">,</span> state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;http next upstream, %xi&quot;</span><span class="token punctuation">,</span> ft_type<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>sockaddr<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>bytes_sent <span class="token operator">=</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>sent<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ft_type <span class="token operator">==</span> NGX_HTTP_UPSTREAM_FT_HTTP_403</span>
<span class="line">            <span class="token operator">||</span> ft_type <span class="token operator">==</span> NGX_HTTP_UPSTREAM_FT_HTTP_404<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            state <span class="token operator">=</span> NGX_PEER_NEXT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">            state <span class="token operator">=</span> NGX_PEER_FAILED<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span><span class="token function">free</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">,</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>data<span class="token punctuation">,</span> state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>sockaddr <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ft_type <span class="token operator">==</span> NGX_HTTP_UPSTREAM_FT_TIMEOUT<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_ERR<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;upstream timed out&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ？</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>cached <span class="token operator">&amp;&amp;</span> ft_type <span class="token operator">==</span> NGX_HTTP_UPSTREAM_FT_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* TODO: inform balancer instead */</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>tries<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">switch</span> <span class="token punctuation">(</span>ft_type<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_TIMEOUT<span class="token operator">:</span></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_504<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_GATEWAY_TIME_OUT<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_500<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_INTERNAL_SERVER_ERROR<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_503<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_SERVICE_UNAVAILABLE<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_403<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_FORBIDDEN<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_404<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_NOT_FOUND<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> NGX_HTTP_UPSTREAM_FT_HTTP_429<span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_TOO_MANY_REQUESTS<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * NGX_HTTP_UPSTREAM_FT_BUSY_LOCK and NGX_HTTP_UPSTREAM_FT_MAX_WAITING</span>
<span class="line">     * never reach here</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">        status <span class="token operator">=</span> NGX_HTTP_BAD_GATEWAY<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span></span>
<span class="line">                                           NGX_HTTP_CLIENT_CLOSED_REQUEST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>status <span class="token operator">=</span> status<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    timeout <span class="token operator">=</span> u<span class="token operator">-&gt;</span>conf<span class="token operator">-&gt;</span>next_upstream_timeout<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>request_sent</span>
<span class="line">        <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>method <span class="token operator">&amp;</span> <span class="token punctuation">(</span>NGX_HTTP_POST<span class="token operator">|</span>NGX_HTTP_LOCK<span class="token operator">|</span>NGX_HTTP_PATCH<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        ft_type <span class="token operator">|=</span> NGX_HTTP_UPSTREAM_FT_NON_IDEMPOTENT<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果重试次数已经减至 0</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>tries <span class="token operator">==</span> <span class="token number">0</span></span>
<span class="line">        <span class="token operator">||</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>conf<span class="token operator">-&gt;</span>next_upstream <span class="token operator">&amp;</span> ft_type<span class="token punctuation">)</span> <span class="token operator">!=</span> ft_type<span class="token punctuation">)</span></span>
<span class="line">        <span class="token operator">||</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>request_sent <span class="token operator">&amp;&amp;</span> r<span class="token operator">-&gt;</span>request_body_no_buffering<span class="token punctuation">)</span></span>
<span class="line">        <span class="token operator">||</span> <span class="token punctuation">(</span>timeout <span class="token operator">&amp;&amp;</span> ngx_current_msec <span class="token operator">-</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>start_time <span class="token operator">&gt;=</span> timeout<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 结束请求</span></span>
<span class="line">        <span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">,</span> status<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;close http upstream connection: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                       u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>fd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果还能允许重试，那么重新发起连接</span></span>
<span class="line">    <span class="token function">ngx_http_upstream_connect</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>前两个函数到最终都还是调用 <code>ngx_http_upstream_finalize_request()</code> 来结束请求。这个函数到最终会调用 HTTP 框架提供的 <code>ngx_http_finalize_request()</code> 结束请求，但在这之前需要释放与上游服务器交互时分配的资源。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_http_upstream_finalize_request</span><span class="token punctuation">(</span><span class="token class-name">ngx_http_request_t</span> <span class="token operator">*</span>r<span class="token punctuation">,</span></span>
<span class="line">    <span class="token class-name">ngx_http_upstream_t</span> <span class="token operator">*</span>u<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> rc<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>  flush<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;finalize http upstream request: %i&quot;</span><span class="token punctuation">,</span> rc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 请求已经被关闭</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>cleanup <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* the request was already finalized */</span></span>
<span class="line">        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_DONE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 资源清理回调函数置为 NULL</span></span>
<span class="line">    <span class="token operator">*</span>u<span class="token operator">-&gt;</span>cleanup <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    u<span class="token operator">-&gt;</span>cleanup <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 释放解析主机域名时分配的资源</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>resolved <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>resolved<span class="token operator">-&gt;</span>ctx<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_resolve_name_done</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>resolved<span class="token operator">-&gt;</span>ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>resolved<span class="token operator">-&gt;</span>ctx <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 设置响应结束时间为当前时间</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>state <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>response_time <span class="token operator">==</span> <span class="token punctuation">(</span><span class="token class-name">ngx_msec_t</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>response_time <span class="token operator">=</span> ngx_current_msec <span class="token operator">-</span> u<span class="token operator">-&gt;</span>start_time<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>pipe <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>read_length<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>bytes_received <span class="token operator">+=</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>read_length</span>
<span class="line">                                        <span class="token operator">-</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>preread_size<span class="token punctuation">;</span></span>
<span class="line">            u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>response_length <span class="token operator">=</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>read_length<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            u<span class="token operator">-&gt;</span>state<span class="token operator">-&gt;</span>bytes_sent <span class="token operator">=</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>sent<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 调用 HTTP 模块实现的 upstream 结束时的回调函数</span></span>
<span class="line">    u<span class="token operator">-&gt;</span><span class="token function">finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> rc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// TCP 连接池？？</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>free <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>sockaddr<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span><span class="token function">free</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">,</span> u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>data<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>sockaddr <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果与上游的 TCP 连接还存在，则关闭这个连接</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;close http upstream connection: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                       u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>fd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    u<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>pipe <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_debug1</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_HTTP<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                       <span class="token string">&quot;http upstream temp fd: %d&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                       u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>file<span class="token punctuation">.</span>fd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果使用了磁盘文件作为缓存向下游转发文件，那么删除这个临时文件</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>store <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file</span>
<span class="line">        <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>file<span class="token punctuation">.</span>fd <span class="token operator">!=</span> NGX_INVALID_FILE<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_delete_file</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>file<span class="token punctuation">.</span>name<span class="token punctuation">.</span>data<span class="token punctuation">)</span></span>
<span class="line">            <span class="token operator">==</span> NGX_FILE_ERROR<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_CRIT<span class="token punctuation">,</span> r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> ngx_errno<span class="token punctuation">,</span></span>
<span class="line">                          ngx_delete_file_n <span class="token string">&quot; \\&quot;%s\\&quot; failed&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                          u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>temp_file<span class="token operator">-&gt;</span>file<span class="token punctuation">.</span>name<span class="token punctuation">.</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 不再响应客户端请求</span></span>
<span class="line">    r<span class="token operator">-&gt;</span>read_event_handler <span class="token operator">=</span> ngx_http_block_reading<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_DECLINED<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    r<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;sending to client&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>u<span class="token operator">-&gt;</span>header_sent</span>
<span class="line">        <span class="token operator">||</span> rc <span class="token operator">==</span> NGX_HTTP_REQUEST_TIME_OUT</span>
<span class="line">        <span class="token operator">||</span> rc <span class="token operator">==</span> NGX_HTTP_CLIENT_CLOSED_REQUEST<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> rc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    flush <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">&gt;=</span> NGX_HTTP_SPECIAL_RESPONSE<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        rc <span class="token operator">=</span> NGX_ERROR<span class="token punctuation">;</span></span>
<span class="line">        flush <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>r<span class="token operator">-&gt;</span>header_only</span>
<span class="line">        <span class="token operator">||</span> <span class="token punctuation">(</span>u<span class="token operator">-&gt;</span>pipe <span class="token operator">&amp;&amp;</span> u<span class="token operator">-&gt;</span>pipe<span class="token operator">-&gt;</span>downstream_error<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> rc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_http_upstream_process_trailers</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> u<span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_ERROR<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_http_send_special</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_LAST<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>flush<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        r<span class="token operator">-&gt;</span>keepalive <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        rc <span class="token operator">=</span> <span class="token function">ngx_http_send_special</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> NGX_HTTP_FLUSH<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 最终调用 HTTP 框架提供的函数结束请求</span></span>
<span class="line">    <span class="token function">ngx_http_finalize_request</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> rc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与缓冲区相关的部分并没有看懂 😭</p>`,45)]))}const i=s(t,[["render",l],["__file","Chapter 12.6 - 12.9 - 转发响应并结束请求.html.vue"]]),u=JSON.parse('{"path":"/understanding-nginx-notes/Part%203%20-%20%E6%B7%B1%E5%85%A5%20Nginx/Chapter%2012.6%20-%2012.9%20-%20%E8%BD%AC%E5%8F%91%E5%93%8D%E5%BA%94%E5%B9%B6%E7%BB%93%E6%9D%9F%E8%AF%B7%E6%B1%82.html","title":"Chapter 12.6 - 12.9 - 转发响应并结束请求","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"12.6 不转发响应时的处理流程","slug":"_12-6-不转发响应时的处理流程","link":"#_12-6-不转发响应时的处理流程","children":[]},{"level":2,"title":"12.7 以下游网速优先来转发响应","slug":"_12-7-以下游网速优先来转发响应","link":"#_12-7-以下游网速优先来转发响应","children":[{"level":3,"title":"12.7.1 转发响应 header","slug":"_12-7-1-转发响应-header","link":"#_12-7-1-转发响应-header","children":[]},{"level":3,"title":"12.7.2 转发响应 body","slug":"_12-7-2-转发响应-body","link":"#_12-7-2-转发响应-body","children":[]}]},{"level":2,"title":"12.8 以上游网速优先来转发响应","slug":"_12-8-以上游网速优先来转发响应","link":"#_12-8-以上游网速优先来转发响应","children":[{"level":3,"title":"12.8.1 ngx_event_pipe_read_upstream() 函数","slug":"_12-8-1-ngx-event-pipe-read-upstream-函数","link":"#_12-8-1-ngx-event-pipe-read-upstream-函数","children":[]},{"level":3,"title":"12.8.2 ngx_event_pipe_write_to_downstream() 函数","slug":"_12-8-2-ngx-event-pipe-write-to-downstream-函数","link":"#_12-8-2-ngx-event-pipe-write-to-downstream-函数","children":[]}]},{"level":2,"title":"12.9 结束 upstream 请求","slug":"_12-9-结束-upstream-请求","link":"#_12-9-结束-upstream-请求","children":[]}],"git":{},"filePathRelative":"understanding-nginx-notes/Part 3 - 深入 Nginx/Chapter 12.6 - 12.9 - 转发响应并结束请求.md"}');export{i as comp,u as data};
