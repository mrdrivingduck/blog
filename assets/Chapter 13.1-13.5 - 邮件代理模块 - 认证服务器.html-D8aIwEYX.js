import{_ as s,c as a,a as p,o as e}from"./app-BeHGwf2X.js";const t={};function l(c,n){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="chapter-13-1-13-5-邮件代理模块-认证服务器" tabindex="-1"><a class="header-anchor" href="#chapter-13-1-13-5-邮件代理模块-认证服务器"><span>Chapter 13.1-13.5 - 邮件代理模块 - 认证服务器</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 08 / 04 10:22</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_13-1-邮件代理服务器的功能" tabindex="-1"><a class="header-anchor" href="#_13-1-邮件代理服务器的功能"><span>13.1 邮件代理服务器的功能</span></a></h2><p>邮件代理服务器 <strong>不提供实际的邮件服务器功能</strong>，只负责把客户端的请求代理到上游的邮件服务器中。</p><ul><li>认证 - 只有经过认证服务器的认证后，Nginx 才会向上游邮件服务器发起通信请求</li><li>透传</li></ul><p>Nginx 与下游客户端、上游邮件服务器之间都是使用邮件协议，而与认证服务器之间使用的是类 HTTP 协议。Nginx 邮件模块的目的是与上游邮件服务器之间透传 TCP 流。在邮件模块的配置中，直属于 <code>mail{}</code> 块的配置称为 main 级别配置，直属于 <code>server{}</code> 块下的配置则被称为 srv 配置。</p><h2 id="_13-2-邮件模块的处理框架" tabindex="-1"><a class="header-anchor" href="#_13-2-邮件模块的处理框架"><span>13.2 邮件模块的处理框架</span></a></h2><p>与 HTTP 处理类似，Nginx 把邮件请求的处理过程分为八个阶段 (把相同代码可能会被多次调用的过程划分为一个阶段)：</p><ol><li>Nginx 与客户端建立 TCP 连接，回调 <code>ngx_mail_init_connection()</code> 初始化将要用到的数据结构</li><li>Nginx 接收、解析客户端请求</li><li>Nginx 与认证服务器建立 TCP 连接</li><li>Nginx 向认证服务器发起类 HTTP 请求</li><li>Nginx 接收认证服务器的响应并判断是否合法，并获得上游邮件服务器的地址</li><li>Nginx 向上游邮件服务器发起 TCP 连接</li><li>Nginx 与邮件服务器使用 POP3 / SMTP / IMAP 协议交互认证</li><li>Nginx 在客户端与邮件服务器之间透传协议</li></ol><p>邮件模块的定义与 HTTP 模块类似。首先，有一个 <code>ngx_mail_module</code> 的核心模块，在其中定义了新的模块类型 <code>NGX_MAIL_MODULE</code>。这类模块的 <code>ctx</code> 成员指向的通用抽象接口为 <code>ngx_mail_module_t</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// POP3 / SMTP / IMAP 邮件模块提取出的通用接口</span></span>
<span class="line">    <span class="token class-name">ngx_mail_protocol_t</span>        <span class="token operator">*</span>protocol<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 建立存储 main 级别配置项的结构体</span></span>
<span class="line">    <span class="token keyword">void</span>                       <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>create_main_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_conf_t</span> <span class="token operator">*</span>cf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 解析完 main 级别配置项后回调</span></span>
<span class="line">    <span class="token keyword">char</span>                       <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>init_main_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_conf_t</span> <span class="token operator">*</span>cf<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>conf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 建立存储 srv 级别配置项的结构体</span></span>
<span class="line">    <span class="token keyword">void</span>                       <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>create_srv_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_conf_t</span> <span class="token operator">*</span>cf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 合并 main 级别与 srv 级别的配置项</span></span>
<span class="line">    <span class="token keyword">char</span>                       <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>merge_srv_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_conf_t</span> <span class="token operator">*</span>cf<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>prev<span class="token punctuation">,</span></span>
<span class="line">                                                  <span class="token keyword">void</span> <span class="token operator">*</span>conf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token class-name">ngx_mail_module_t</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每一个邮件模块都会实现上述接口。而 <code>ngx_mail_protocol_t</code> 结构体的定义如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ngx_mail_protocol_s</span>  <span class="token class-name">ngx_mail_protocol_t</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_mail_protocol_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                   name<span class="token punctuation">;</span> <span class="token comment">// 邮件模块名称</span></span>
<span class="line">    <span class="token class-name">in_port_t</span>                   port<span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token comment">// 邮件模块最常监听的四个端口</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>                  type<span class="token punctuation">;</span> <span class="token comment">// 邮件模块类型 (POP3 / SMTP / IMAP)</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 与客户端建立连接后的初始化函数</span></span>
<span class="line">    ngx_mail_init_session_pt    init_session<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 接收、解析客户端请求的函数</span></span>
<span class="line">    ngx_mail_init_protocol_pt   init_protocol<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 解析客户端邮件协议接口的函数 (由各邮件模块实现)</span></span>
<span class="line">    ngx_mail_parse_command_pt   parse_command<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 认证客户端请求的函数</span></span>
<span class="line">    ngx_mail_auth_state_pt      auth_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 发生一些错误时返回客户端的字符串</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                   internal_server_error<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                   cert_error<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                   no_cert<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-3-初始化请求" tabindex="-1"><a class="header-anchor" href="#_13-3-初始化请求"><span>13.3 初始化请求</span></a></h2><p>Nginx 与客户端建立 TCP 连接后，回调 <code>ngx_mail_init_connection()</code> 函数，初始化邮件协议 - 这时会建立一个会话结构体 <code>ngx_mail_session_t</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">uint32_t</span>                signature<span class="token punctuation">;</span>         <span class="token comment">/* &quot;MAIL&quot; */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 下游客户端与 Nginx 之间的连接</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>       <span class="token operator">*</span>connection<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 存放需要向下游客户端发送的内容</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               out<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 接收客户端请求的缓冲区</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>              <span class="token operator">*</span>buffer<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 各个邮件模块的上下文指针</span></span>
<span class="line">    <span class="token keyword">void</span>                  <span class="token operator">*</span><span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// main 级别配置项</span></span>
<span class="line">    <span class="token keyword">void</span>                  <span class="token operator">*</span><span class="token operator">*</span>main_conf<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// srv 级别配置项</span></span>
<span class="line">    <span class="token keyword">void</span>                  <span class="token operator">*</span><span class="token operator">*</span>srv_conf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 解析主机域名</span></span>
<span class="line">    <span class="token class-name">ngx_resolver_ctx_t</span>     <span class="token operator">*</span>resolver_ctx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 经过认证后，proxy 用于代理客户端与邮件服务器之间的通信</span></span>
<span class="line">    <span class="token class-name">ngx_mail_proxy_ctx_t</span>   <span class="token operator">*</span>proxy<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 与邮件服务器交互时的处理状态</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              mail_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 标志位</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                protocol<span class="token operator">:</span><span class="token number">3</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                blocked<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                quit<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                quoted<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                backslash<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                no_sync_literal<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                starttls<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                esmtp<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                auth_method<span class="token operator">:</span><span class="token number">3</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                auth_wait<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 用于与认证服务器认证的用户名和密码</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               login<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               passwd<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               salt<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               tag<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               tagged_line<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               text<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 当前连接上对应的 Nginx 服务器地址</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>              <span class="token operator">*</span>addr_text<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 主机地址</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               host<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               smtp_helo<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               smtp_from<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               smtp_to<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>               cmd<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              command<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 存放来自下游客户端邮件协议的参数</span></span>
<span class="line">    <span class="token class-name">ngx_array_t</span>             args<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 当前请求尝试访问认证服务器的次数</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              login_attempt<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* used to parse POP3/IMAP/SMTP command */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 解析邮件协议的命令行</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              state<span class="token punctuation">;</span></span>
<span class="line">    u_char                 <span class="token operator">*</span>cmd_start<span class="token punctuation">;</span></span>
<span class="line">    u_char                 <span class="token operator">*</span>arg_start<span class="token punctuation">;</span></span>
<span class="line">    u_char                 <span class="token operator">*</span>arg_end<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>              literal_len<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token class-name">ngx_mail_session_t</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_init_connection</span><span class="token punctuation">(</span><span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">size_t</span>                     len<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>                 i<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_port_t</span>           <span class="token operator">*</span>port<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr</span>           <span class="token operator">*</span>sa<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr_in</span>        <span class="token operator">*</span>sin<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_log_ctx_t</span>        <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_in_addr_t</span>        <span class="token operator">*</span>addr<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_session_t</span>        <span class="token operator">*</span>s<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_addr_conf_t</span>      <span class="token operator">*</span>addr_conf<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_core_srv_conf_t</span>  <span class="token operator">*</span>cscf<span class="token punctuation">;</span></span>
<span class="line">    u_char                     text<span class="token punctuation">[</span>NGX_SOCKADDR_STRLEN<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_INET6<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr_in6</span>       <span class="token operator">*</span>sin6<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_in6_addr_t</span>       <span class="token operator">*</span>addr6<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* find the server configuration for the address:port */</span></span>
<span class="line"></span>
<span class="line">    port <span class="token operator">=</span> c<span class="token operator">-&gt;</span>listening<span class="token operator">-&gt;</span>servers<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>port<span class="token operator">-&gt;</span>naddrs <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * There are several addresses on this port and one of them</span>
<span class="line">         * is the &quot;*:port&quot; wildcard so getsockname() is needed to determine</span>
<span class="line">         * the server address.</span>
<span class="line">         *</span>
<span class="line">         * AcceptEx() already gave this address.</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_connection_local_sockaddr</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_mail_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        sa <span class="token operator">=</span> c<span class="token operator">-&gt;</span>local_sockaddr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>sa<span class="token operator">-&gt;</span>sa_family<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span> <span class="token comment">/* AF_INET */</span></span>
<span class="line">            sin <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">sockaddr_in</span> <span class="token operator">*</span><span class="token punctuation">)</span> sa<span class="token punctuation">;</span></span>
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
<span class="line">            addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">switch</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>local_sockaddr<span class="token operator">-&gt;</span>sa_family<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span> <span class="token comment">/* AF_INET */</span></span>
<span class="line">            addr <span class="token operator">=</span> port<span class="token operator">-&gt;</span>addrs<span class="token punctuation">;</span></span>
<span class="line">            addr_conf <span class="token operator">=</span> <span class="token operator">&amp;</span>addr<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span>conf<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 分配 ngx_mail_session_t 结构体</span></span>
<span class="line">    s <span class="token operator">=</span> <span class="token function">ngx_pcalloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_mail_session_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_mail_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 初始化</span></span>
<span class="line">    s<span class="token operator">-&gt;</span>signature <span class="token operator">=</span> NGX_MAIL_MODULE<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>main_conf <span class="token operator">=</span> addr_conf<span class="token operator">-&gt;</span>ctx<span class="token operator">-&gt;</span>main_conf<span class="token punctuation">;</span></span>
<span class="line">    s<span class="token operator">-&gt;</span>srv_conf <span class="token operator">=</span> addr_conf<span class="token operator">-&gt;</span>ctx<span class="token operator">-&gt;</span>srv_conf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>addr_text <span class="token operator">=</span> <span class="token operator">&amp;</span>addr_conf<span class="token operator">-&gt;</span>addr_text<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>data <span class="token operator">=</span> s<span class="token punctuation">;</span></span>
<span class="line">    s<span class="token operator">-&gt;</span>connection <span class="token operator">=</span> c<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    cscf <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_srv_conf</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_set_connection_log</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> cscf<span class="token operator">-&gt;</span>error_log<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    len <span class="token operator">=</span> <span class="token function">ngx_sock_ntop</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>sockaddr<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>socklen<span class="token punctuation">,</span> text<span class="token punctuation">,</span> NGX_SOCKADDR_STRLEN<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_INFO<span class="token punctuation">,</span> c<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token string">&quot;*%uA client %*s connected to %V&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                  c<span class="token operator">-&gt;</span>number<span class="token punctuation">,</span> len<span class="token punctuation">,</span> text<span class="token punctuation">,</span> s<span class="token operator">-&gt;</span>addr_text<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ctx <span class="token operator">=</span> <span class="token function">ngx_palloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_mail_log_ctx_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_mail_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>client <span class="token operator">=</span> <span class="token operator">&amp;</span>c<span class="token operator">-&gt;</span>addr_text<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>session <span class="token operator">=</span> s<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>connection <span class="token operator">=</span> c<span class="token operator">-&gt;</span>number<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_log_error<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>data <span class="token operator">=</span> ctx<span class="token punctuation">;</span></span>
<span class="line">    c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;sending client greeting line&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>log_error <span class="token operator">=</span> NGX_ERROR_INFO<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_MAIL_SSL<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_mail_ssl_conf_t</span>  <span class="token operator">*</span>sslcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    sslcf <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_srv_conf</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_ssl_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>sslcf<span class="token operator">-&gt;</span>enable <span class="token operator">||</span> addr_conf<span class="token operator">-&gt;</span>ssl<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        c<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;SSL handshaking&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_mail_ssl_init_connection</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>sslcf<span class="token operator">-&gt;</span>ssl<span class="token punctuation">,</span> c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 开始调用各个协议模块实现的解析请求函数</span></span>
<span class="line">    <span class="token function">ngx_mail_init_session</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-4-接收并解析客户端请求" tabindex="-1"><a class="header-anchor" href="#_13-4-接收并解析客户端请求"><span>13.4 接收并解析客户端请求</span></a></h2><p>POP3、SMTP 和 IMAP 模块实现的 <code>init_session()</code> 中都会调用各自的 <code>init_protocol()</code> 函数，接收、解析客户端请求。流程是相似的：</p><ul><li>反复接收客户端请求，使用状态机解析是否收到了足够的信息</li><li>接收到完整的信息后，进入邮件认证阶段</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_init_session</span><span class="token punctuation">(</span><span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_mail_session_t</span>        <span class="token operator">*</span>s<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_core_srv_conf_t</span>  <span class="token operator">*</span>cscf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    cscf <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_srv_conf</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_core_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>protocol <span class="token operator">=</span> cscf<span class="token operator">-&gt;</span>protocol<span class="token operator">-&gt;</span>type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>ctx <span class="token operator">=</span> <span class="token function">ngx_pcalloc</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">*</span> ngx_mail_max_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>s<span class="token operator">-&gt;</span>ctx <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    c<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_send<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 调用模块的 init_session() 函数</span></span>
<span class="line">    cscf<span class="token operator">-&gt;</span>protocol<span class="token operator">-&gt;</span><span class="token function">init_session</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-5-邮件认证" tabindex="-1"><a class="header-anchor" href="#_13-5-邮件认证"><span>13.5 邮件认证</span></a></h2><h3 id="_13-5-1-ngx-mail-auth-http-ctx-t-结构体" tabindex="-1"><a class="header-anchor" href="#_13-5-1-ngx-mail-auth-http-ctx-t-结构体"><span>13.5.1 <code>ngx_mail_auth_http_ctx_t</code> 结构体</span></a></h3><p>邮件认证服务器的地址在配置文件的 <code>auth_http</code> 中进行配置，由 <code>ngx_mail_auth_http_module</code> 模块完成这个功能。该模块会在 <code>ngx_mail_session_t</code> 结构体的 <code>ctx</code> 中拥有一个上下文结构体：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ngx_mail_auth_http_ctx_s</span>  <span class="token class-name">ngx_mail_auth_http_ctx_t</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_mail_auth_http_ctx_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 缓冲区保存发往认证服务器的请求</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>                      <span class="token operator">*</span>request<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 缓冲区保存认证服务器的响应</span></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>                      <span class="token operator">*</span>response<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// Nginx 与认证服务器之间的连接</span></span>
<span class="line">    <span class="token class-name">ngx_peer_connection_t</span>           peer<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 解析来自认证服务器响应的回调函数</span></span>
<span class="line">    ngx_mail_auth_http_handler_pt   handler<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 解析认证服务器响应时，state 表示解析状态</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>                      state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 用于解析响应 header</span></span>
<span class="line">    u_char                         <span class="token operator">*</span>header_name_start<span class="token punctuation">;</span></span>
<span class="line">    u_char                         <span class="token operator">*</span>header_name_end<span class="token punctuation">;</span></span>
<span class="line">    u_char                         <span class="token operator">*</span>header_start<span class="token punctuation">;</span></span>
<span class="line">    u_char                         <span class="token operator">*</span>header_end<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       addr<span class="token punctuation">;</span> <span class="token comment">// Auth-Server header</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       port<span class="token punctuation">;</span> <span class="token comment">// Auth-Port header</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       err<span class="token punctuation">;</span> <span class="token comment">// 错误信息</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       errmsg<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       errcode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// Auth-Wait header 所带的时间戳，是 Nginx 的等待时间</span></span>
<span class="line">    <span class="token class-name">time_t</span>                          sleep<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 用于邮件认证的独立内存池</span></span>
<span class="line">    <span class="token class-name">ngx_pool_t</span>                     <span class="token operator">*</span>pool<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_13-5-2-与认证服务器建立连接" tabindex="-1"><a class="header-anchor" href="#_13-5-2-与认证服务器建立连接"><span>13.5.2 与认证服务器建立连接</span></a></h3><p>首先，Nginx 与认证服务器建立 TCP 连接：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_auth</span><span class="token punctuation">(</span><span class="token class-name">ngx_mail_session_t</span> <span class="token operator">*</span>s<span class="token punctuation">,</span> <span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    s<span class="token operator">-&gt;</span>args<span class="token punctuation">.</span>nelts <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>pos <span class="token operator">==</span> s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>last<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>pos <span class="token operator">=</span> s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">        s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>last <span class="token operator">=</span> s<span class="token operator">-&gt;</span>buffer<span class="token operator">-&gt;</span>start<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>state <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将下游连接读事件从定时器中取出 (因为不再需要与下游客户端交互了)</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>read<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>login_attempt<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_mail_auth_http_init</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_auth_http_init</span><span class="token punctuation">(</span><span class="token class-name">ngx_mail_session_t</span> <span class="token operator">*</span>s<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>                   rc<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_pool_t</span>                 <span class="token operator">*</span>pool<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_auth_http_ctx_t</span>   <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_auth_http_conf_t</span>  <span class="token operator">*</span>ahcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    s<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token operator">-&gt;</span>action <span class="token operator">=</span> <span class="token string">&quot;in http auth state&quot;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 分配内存池</span></span>
<span class="line">    pool <span class="token operator">=</span> <span class="token function">ngx_create_pool</span><span class="token punctuation">(</span><span class="token number">2048</span><span class="token punctuation">,</span> s<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>pool <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 分配上下文结构体</span></span>
<span class="line">    ctx <span class="token operator">=</span> <span class="token function">ngx_pcalloc</span><span class="token punctuation">(</span>pool<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token class-name">ngx_mail_auth_http_ctx_t</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>pool <span class="token operator">=</span> pool<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ahcf <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_srv_conf</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_auth_http_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 发起连接</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>request <span class="token operator">=</span> <span class="token function">ngx_mail_auth_http_create_request</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> pool<span class="token punctuation">,</span> ahcf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>request <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 设置上下文</span></span>
<span class="line">    <span class="token function">ngx_mail_set_ctx</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ctx<span class="token punctuation">,</span> ngx_mail_auth_http_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>sockaddr <span class="token operator">=</span> ahcf<span class="token operator">-&gt;</span>peer<span class="token operator">-&gt;</span>sockaddr<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>socklen <span class="token operator">=</span> ahcf<span class="token operator">-&gt;</span>peer<span class="token operator">-&gt;</span>socklen<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>name <span class="token operator">=</span> <span class="token operator">&amp;</span>ahcf<span class="token operator">-&gt;</span>peer<span class="token operator">-&gt;</span>name<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>get <span class="token operator">=</span> ngx_event_get_peer<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>log <span class="token operator">=</span> s<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>log<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>log_error <span class="token operator">=</span> NGX_ERROR_ERR<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接加入事件驱动模块</span></span>
<span class="line">    rc <span class="token operator">=</span> <span class="token function">ngx_event_connect_peer</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接失败</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_ERROR <span class="token operator">||</span> rc <span class="token operator">==</span> NGX_BUSY <span class="token operator">||</span> rc <span class="token operator">==</span> NGX_DECLINED<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>data <span class="token operator">=</span> s<span class="token punctuation">;</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>pool <span class="token operator">=</span> s<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>pool<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 与下游客户端连接的读事件回调函数设置为 ngx_mail_auth_http_block_read</span></span>
<span class="line">    <span class="token comment">// 此函数的唯一工作是将下游连接读事件再次加入事件驱动模块</span></span>
<span class="line">    <span class="token comment">// 不读取任何客户端请求，只保持读事件被监控</span></span>
<span class="line">    s<span class="token operator">-&gt;</span>connection<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_auth_http_block_read<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 设置上游连接的读写事件回调函数</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>read<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_auth_http_read_handler<span class="token punctuation">;</span> <span class="token comment">// 解析认证服务器响应</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>write<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_auth_http_write_handler<span class="token punctuation">;</span> <span class="token comment">// 向认证服务器发送请求</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 尝试解析认证服务器响应发来的响应行</span></span>
<span class="line">    ctx<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_auth_http_ignore_status_line<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将上游连接的读写事件加入定时器</span></span>
<span class="line">    <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>read<span class="token punctuation">,</span> ahcf<span class="token operator">-&gt;</span>timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>write<span class="token punctuation">,</span> ahcf<span class="token operator">-&gt;</span>timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 如果连接已经建立成功，那么开始向认证服务器发送请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rc <span class="token operator">==</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_mail_auth_http_write_handler</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>connection<span class="token operator">-&gt;</span>write<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_13-5-3-发送请求到认证服务器" tabindex="-1"><a class="header-anchor" href="#_13-5-3-发送请求到认证服务器"><span>13.5.3 发送请求到认证服务器</span></a></h3><p>上个函数最后调用的 <code>ngx_mail_auth_http_write_handler()</code>，同时也是上游连接可写事件的回调函数，负责向认证服务器发送请求：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_auth_http_write_handler</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>wev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                     n<span class="token punctuation">,</span> size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>           <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_session_t</span>         <span class="token operator">*</span>s<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_auth_http_ctx_t</span>   <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_auth_http_conf_t</span>  <span class="token operator">*</span>ahcf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> wev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    s <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ctx <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_ctx</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_auth_http_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_MAIL<span class="token punctuation">,</span> wev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;mail auth http write handler&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 发送请求超时</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_ERR<span class="token punctuation">,</span> wev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;auth http server %V timed out&quot;</span><span class="token punctuation">,</span> ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 关闭连接、销毁内存池</span></span>
<span class="line">        <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 计算剩余要发送的请求的长度</span></span>
<span class="line">    size <span class="token operator">=</span> ctx<span class="token operator">-&gt;</span>request<span class="token operator">-&gt;</span>last <span class="token operator">-</span> ctx<span class="token operator">-&gt;</span>request<span class="token operator">-&gt;</span>pos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 发送请求</span></span>
<span class="line">    n <span class="token operator">=</span> <span class="token function">ngx_send</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> ctx<span class="token operator">-&gt;</span>request<span class="token operator">-&gt;</span>pos<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 发送失败</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_ERROR<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 关闭连接、销毁内存池</span></span>
<span class="line">        <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 成功发送了一部分请求</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 缓冲区头部指针后移</span></span>
<span class="line">        ctx<span class="token operator">-&gt;</span>request<span class="token operator">-&gt;</span>pos <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 所有请求发送完毕</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> size<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// 将写事件设置为什么都不做</span></span>
<span class="line">            wev<span class="token operator">-&gt;</span>handler <span class="token operator">=</span> ngx_mail_auth_http_dummy_handler<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 不再需要发送请求，因此不再需要监控写事件是否超时</span></span>
<span class="line">            <span class="token comment">// 从定时器中移除写事件</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>wev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_del_timer</span><span class="token punctuation">(</span>wev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">// 为什么写事件还要添加到事件驱动模块中呢？</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">ngx_handle_write_event</span><span class="token punctuation">(</span>wev<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">!=</span> NGX_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 请求还没有发送完</span></span>
<span class="line">    <span class="token comment">// 如果定时器中没有写事件，那么添加到定时器中</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>wev<span class="token operator">-&gt;</span>timer_set<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        ahcf <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_srv_conf</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_auth_http_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_add_timer</span><span class="token punctuation">(</span>wev<span class="token punctuation">,</span> ahcf<span class="token operator">-&gt;</span>timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_13-5-4-接收并解析响应" tabindex="-1"><a class="header-anchor" href="#_13-5-4-接收并解析响应"><span>13.5.4 接收并解析响应</span></a></h3><p>也就是使用 <code>ngx_mail_auth_http_read_handler()</code> 同时负责解析响应行和头部。这两个部分都不是一次就能接收完毕的，当没有收到足够的字节时，都会希望事件驱动模块能够再次调用该函数。在响应被完全解析后，可以得知认证是否通过 - 如果请求合法，那么可以从响应中得到上游邮件服务器的地址，然后调用 <code>ngx_mail_proxy_init()</code> 函数进入与邮件服务器的交互阶段。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ngx_mail_auth_http_read_handler</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>rev<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ssize_t</span>                     n<span class="token punctuation">,</span> size<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>          <span class="token operator">*</span>c<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_session_t</span>        <span class="token operator">*</span>s<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_mail_auth_http_ctx_t</span>  <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    c <span class="token operator">=</span> rev<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line">    s <span class="token operator">=</span> c<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_log_debug0</span><span class="token punctuation">(</span>NGX_LOG_DEBUG_MAIL<span class="token punctuation">,</span> rev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                   <span class="token string">&quot;mail auth http read handler&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ctx <span class="token operator">=</span> <span class="token function">ngx_mail_get_module_ctx</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ngx_mail_auth_http_module<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 读事件已经超时</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>rev<span class="token operator">-&gt;</span>timedout<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ngx_log_error</span><span class="token punctuation">(</span>NGX_LOG_ERR<span class="token punctuation">,</span> rev<span class="token operator">-&gt;</span>log<span class="token punctuation">,</span> NGX_ETIMEDOUT<span class="token punctuation">,</span></span>
<span class="line">                      <span class="token string">&quot;auth http server %V timed out&quot;</span><span class="token punctuation">,</span> ctx<span class="token operator">-&gt;</span>peer<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">// 关闭连接，销毁内存池</span></span>
<span class="line">        <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 分配接收响应的缓冲区</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>response <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        ctx<span class="token operator">-&gt;</span>response <span class="token operator">=</span> <span class="token function">ngx_create_temp_buf</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">,</span> <span class="token number">1024</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>response <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 缓冲区剩余长度</span></span>
<span class="line">    size <span class="token operator">=</span> ctx<span class="token operator">-&gt;</span>response<span class="token operator">-&gt;</span>end <span class="token operator">-</span> ctx<span class="token operator">-&gt;</span>response<span class="token operator">-&gt;</span>last<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 接收响应</span></span>
<span class="line">    n <span class="token operator">=</span> <span class="token function">ngx_recv</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> ctx<span class="token operator">-&gt;</span>response<span class="token operator">-&gt;</span>pos<span class="token punctuation">,</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 接收到了部分响应</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 更新缓冲区中的可用范围</span></span>
<span class="line">        ctx<span class="token operator">-&gt;</span>response<span class="token operator">-&gt;</span>last <span class="token operator">+=</span> n<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 处理响应</span></span>
<span class="line">        ctx<span class="token operator">-&gt;</span><span class="token function">handler</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 等待再次被调度</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> NGX_AGAIN<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ngx_close_connection</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_destroy_pool</span><span class="token punctuation">(</span>ctx<span class="token operator">-&gt;</span>pool<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ngx_mail_session_internal_server_error</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,37)]))}const i=s(t,[["render",l],["__file","Chapter 13.1-13.5 - 邮件代理模块 - 认证服务器.html.vue"]]),u=JSON.parse('{"path":"/understanding-nginx-notes/Part%203%20-%20%E6%B7%B1%E5%85%A5%20Nginx/Chapter%2013.1-13.5%20-%20%E9%82%AE%E4%BB%B6%E4%BB%A3%E7%90%86%E6%A8%A1%E5%9D%97%20-%20%E8%AE%A4%E8%AF%81%E6%9C%8D%E5%8A%A1%E5%99%A8.html","title":"Chapter 13.1-13.5 - 邮件代理模块 - 认证服务器","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"13.1 邮件代理服务器的功能","slug":"_13-1-邮件代理服务器的功能","link":"#_13-1-邮件代理服务器的功能","children":[]},{"level":2,"title":"13.2 邮件模块的处理框架","slug":"_13-2-邮件模块的处理框架","link":"#_13-2-邮件模块的处理框架","children":[]},{"level":2,"title":"13.3 初始化请求","slug":"_13-3-初始化请求","link":"#_13-3-初始化请求","children":[]},{"level":2,"title":"13.4 接收并解析客户端请求","slug":"_13-4-接收并解析客户端请求","link":"#_13-4-接收并解析客户端请求","children":[]},{"level":2,"title":"13.5 邮件认证","slug":"_13-5-邮件认证","link":"#_13-5-邮件认证","children":[{"level":3,"title":"13.5.1 ngx_mail_auth_http_ctx_t 结构体","slug":"_13-5-1-ngx-mail-auth-http-ctx-t-结构体","link":"#_13-5-1-ngx-mail-auth-http-ctx-t-结构体","children":[]},{"level":3,"title":"13.5.2 与认证服务器建立连接","slug":"_13-5-2-与认证服务器建立连接","link":"#_13-5-2-与认证服务器建立连接","children":[]},{"level":3,"title":"13.5.3 发送请求到认证服务器","slug":"_13-5-3-发送请求到认证服务器","link":"#_13-5-3-发送请求到认证服务器","children":[]},{"level":3,"title":"13.5.4 接收并解析响应","slug":"_13-5-4-接收并解析响应","link":"#_13-5-4-接收并解析响应","children":[]}]}],"git":{},"filePathRelative":"understanding-nginx-notes/Part 3 - 深入 Nginx/Chapter 13.1-13.5 - 邮件代理模块 - 认证服务器.md"}');export{i as comp,u as data};
