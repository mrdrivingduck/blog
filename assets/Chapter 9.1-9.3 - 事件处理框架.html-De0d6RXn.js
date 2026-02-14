import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function c(t,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="chapter-9-1-9-3-事件处理框架" tabindex="-1"><a class="header-anchor" href="#chapter-9-1-9-3-事件处理框架"><span>Chapter 9.1-9.3 - 事件处理框架</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 07 / 20 20:19</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_9-1-事件模块的层次定义" tabindex="-1"><a class="header-anchor" href="#_9-1-事件模块的层次定义"><span>9.1 事件模块的层次定义</span></a></h2><p>事件处理框架负责收集、管理、分发事件。事件以网络事件和定时器事件为主，网络事件中以 TCP 网络事件为主。Nginx 为不同的操作系统和不同的操作系统版本提供了多种 <strong>事件驱动机制</strong> (也叫 <strong>I/O 多路复用</strong>)。</p><p>Nginx 定义了核心模块 <code>ngx_events_module</code>，使得能够在启动时解析配置项。其次，Nginx 定义了事件模块 <code>ngx_event_core_module</code>，决定使用哪种事件管理机制。Nginx 目前定义了 9 个运行在不同 OS、不同 OS 版本上的事件驱动模块，在模块初始化过程中，将选取一个作为事件驱动模块。</p><p>正好看一看关于模块层次的抽象。Nginx 首先定义了模块的最抽象接口。这一层模块接口，我觉得可以从三个部分来看：</p><ol><li>模块标识 (编号和名称)，不仅包括模块在所有 Nginx 模块里的编号，还包括模块在某类 Nginx 模块里的编号</li><li>模块类型、参数、上下文</li><li>模块的生命周期函数指针 (<code>init_...</code> / <code>exit_...</code>)</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_module_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            ctx_index<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            index<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">char</span>                 <span class="token operator">*</span>name<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            spare0<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            spare1<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            version<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span>           <span class="token operator">*</span>signature<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">void</span>                 <span class="token operator">*</span>ctx<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_command_t</span>        <span class="token operator">*</span>commands<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>            type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>           <span class="token punctuation">(</span><span class="token operator">*</span>init_master<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_log_t</span> <span class="token operator">*</span>log<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>           <span class="token punctuation">(</span><span class="token operator">*</span>init_module<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>           <span class="token punctuation">(</span><span class="token operator">*</span>init_process<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>           <span class="token punctuation">(</span><span class="token operator">*</span>init_thread<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>                <span class="token punctuation">(</span><span class="token operator">*</span>exit_thread<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>                <span class="token punctuation">(</span><span class="token operator">*</span>exit_process<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">void</span>                <span class="token punctuation">(</span><span class="token operator">*</span>exit_master<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook0<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook1<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook2<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook3<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook4<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook5<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook6<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">uintptr_t</span>             spare_hook7<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，与模块层次相关的 field 有 <code>ctx</code>、<code>commands</code>、<code>type</code>。其中，<code>type</code> 决定了模块的类型，<code>commands</code> 体现了这个模块感兴趣的配置项，而 <code>ctx</code> 决定了这类模块使用的通用接口。比如，对于核心模块来说，通用接口是这样的：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>             name<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>               <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>create_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span>               <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>init_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>conf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token class-name">ngx_core_module_t</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这也体现了核心模块的功能：创建、解析配置项。</p><p>而事件模块的通用接口：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>              <span class="token operator">*</span>name<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">void</span>                 <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>create_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span>                 <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>init_conf<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>conf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_event_actions_t</span>     actions<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token class-name">ngx_event_module_t</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>actions</code> 中定义了事件驱动模块的抽象函数，共有 10 个。也就是说，对于不同的 I/O 多路复用机制，都应当以各自的方式实现这 10 个函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 将感兴趣的事件想 OS 的事件驱动机制中添加或删除</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>add<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> event<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>del<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> event<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 基本与上两个一致</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>enable<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> event<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>disable<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">,</span> <span class="token class-name">ngx_int_t</span> event<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 向事件驱动机制添加或删除连接</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>add_conn<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>del_conn<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_connection_t</span> <span class="token operator">*</span>c<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>notify<span class="token punctuation">)</span><span class="token punctuation">(</span>ngx_event_handler_pt handler<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 处理事件，是处理、分发事件的核心</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>process_events<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">,</span> <span class="token class-name">ngx_msec_t</span> timer<span class="token punctuation">,</span></span>
<span class="line">                                 <span class="token class-name">ngx_uint_t</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 初始化事件驱动模块的函数</span></span>
<span class="line">    <span class="token class-name">ngx_int_t</span>  <span class="token punctuation">(</span><span class="token operator">*</span>init<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">,</span> <span class="token class-name">ngx_msec_t</span> timer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">// 退出事件驱动模块前调用的函数</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token punctuation">(</span><span class="token operator">*</span>done<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token class-name">ngx_cycle_t</span> <span class="token operator">*</span>cycle<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token class-name">ngx_event_actions_t</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_9-2-nginx-事件的定义" tabindex="-1"><a class="header-anchor" href="#_9-2-nginx-事件的定义"><span>9.2 Nginx 事件的定义</span></a></h2><p>在 Nginx 中，每个事件都由 <code>ngx_event_t</code> 结构体来表示，其中绝大部分为标志位：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_event_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">void</span>            <span class="token operator">*</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         write<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         accept<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* used to detect the stale events in kqueue and epoll */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         instance<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * the event was passed or would be passed to a kernel;</span>
<span class="line">     * in aio mode - operation was posted.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         active<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         disabled<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the ready event; in aio mode 0 means that no operation can be posted */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         ready<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         oneshot<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* aio operation is complete */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         complete<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         eof<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         error<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         timedout<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         timer_set<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         delayed<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         deferred_accept<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the pending eof reported by kqueue, epoll or in aio chain operation */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         pending_eof<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         posted<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         closed<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* to test on worker exit */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         channel<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>         resolver<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>         cancelable<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_KQUEUE<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">unsigned</span>         kq_vnode<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the pending errno reported by kqueue */</span></span>
<span class="line">    <span class="token keyword">int</span>              kq_errno<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * kqueue only:</span>
<span class="line">     *   accept:     number of sockets that wait to be accepted</span>
<span class="line">     *   read:       bytes to read when event is ready</span>
<span class="line">     *               or lowat when event is set with NGX_LOWAT_EVENT flag</span>
<span class="line">     *   write:      available space in buffer when event is ready</span>
<span class="line">     *               or lowat when event is set with NGX_LOWAT_EVENT flag</span>
<span class="line">     *</span>
<span class="line">     * iocp: TODO</span>
<span class="line">     *</span>
<span class="line">     * otherwise:</span>
<span class="line">     *   accept:     1 if accept many, 0 otherwise</span>
<span class="line">     *   read:       bytes to read when event is ready, -1 if not known</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">int</span>              available<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ngx_event_handler_pt  handler<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_IOCP<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token class-name">ngx_event_ovlp_t</span> ovlp<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>       index<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_log_t</span>       <span class="token operator">*</span>log<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_rbtree_node_t</span>   timer<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the posted queue */</span></span>
<span class="line">    <span class="token class-name">ngx_queue_t</span>      queue<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token number">0</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* the threads support */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * the event thread context, we store it here</span>
<span class="line">     * if $(CC) does not understand __thread declaration</span>
<span class="line">     * and pthread_getspecific() is too costly</span>
<span class="line">     */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">void</span>            <span class="token operator">*</span>thr_ctx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_EVENT_T_PADDING<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* event should not cross cache line in SMP */</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">uint32_t</span>         padding<span class="token punctuation">[</span>NGX_EVENT_T_PADDING<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>data</code> 指针通常指向 <code>ngx_connection_t</code> 连接对象，表示与这个事件相关的对象。另外，<code>handler</code> 是一个函数指针，指向这个事件发生时的回调函数，由每个事件消费模块实现。即，每个 Nginx 模块只要处理事件就必然要设置 <code>handler</code> 回调。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">void</span> <span class="token punctuation">(</span><span class="token operator">*</span>ngx_event_handler_pt<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token class-name">ngx_event_t</span> <span class="token operator">*</span>ev<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在 Nginx 中，事件不需要创建。Nginx 在启动时已经在 <code>ngx_cycle_t</code> 中分配了所有的读事件和写事件。每一个连接会自动对应一个读事件和一个写事件 (三个数组大小相同，依靠下标直接对应)。因此只需要从 <strong>连接池</strong> 中拿到一个空闲连接，就能够拿到事件。最后将事件添加到 EPOLL 等事件驱动模块中即可。一旦该事件对应的 TCP 连接上出现可读或可写事件，就会回调 <code>handler</code> 指针指向的函数。</p><blockquote><p>将事件添加到事件驱动模块中，或从模块中删除时，一般不建议使用 <code>ngx_event_actions_t</code> 中定义的 <code>add()</code> 或 <code>del()</code>，因为这些函数与具体的事件驱动模块强相关。使用 Nginx 封装的 <code>ngx_handle_read_event()</code> 和 <code>ngx_handle_write_event()</code> 可以屏蔽事件驱动模块之间的差异。</p></blockquote><h2 id="_9-3-nginx-连接的定义" tabindex="-1"><a class="header-anchor" href="#_9-3-nginx-连接的定义"><span>9.3 Nginx 连接的定义</span></a></h2><p>Nginx 中定义 <code>ngx_connection_t</code> 来表示连接。连接默认指的是由客户端发起，由 Nginx 接受的连接 (被动连接)。另外 Nginx 还定义了 <code>ngx_peer_connection_t</code> 表示 Nginx 到上游服务器的连接 (主动连接)。主动连接的结构体时基于被动连接实现的，复用了其中的很多 field。这两种连接都不可以随意创建，必须从连接池中获取。</p><h3 id="_9-3-1-被动连接" tabindex="-1"><a class="header-anchor" href="#_9-3-1-被动连接"><span>9.3.1 被动连接</span></a></h3><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_connection_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 连接未使用时，用于充当连接池中的空闲链表指针；连接使用时，具体含义由模块决定</span></span>
<span class="line">    <span class="token keyword">void</span>               <span class="token operator">*</span>data<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 读写事件</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>        <span class="token operator">*</span>read<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">ngx_event_t</span>        <span class="token operator">*</span>write<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// socket 句柄</span></span>
<span class="line">    <span class="token class-name">ngx_socket_t</span>        fd<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ngx_recv_pt         recv<span class="token punctuation">;</span> <span class="token comment">// 接收网络字符的函数指针</span></span>
<span class="line">    ngx_send_pt         send<span class="token punctuation">;</span> <span class="token comment">// 发送网络字符的函数指针</span></span>
<span class="line">    ngx_recv_chain_pt   recv_chain<span class="token punctuation">;</span></span>
<span class="line">    ngx_send_chain_pt   send_chain<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_listening_t</span>    <span class="token operator">*</span>listening<span class="token punctuation">;</span> <span class="token comment">// 由 listening 监听端口的事件建立</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">off_t</span>               sent<span class="token punctuation">;</span> <span class="token comment">// 该连接上已经发送的字节数</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_log_t</span>          <span class="token operator">*</span>log<span class="token punctuation">;</span> <span class="token comment">// 日志对象</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_pool_t</span>         <span class="token operator">*</span>pool<span class="token punctuation">;</span> <span class="token comment">// 内存池</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">int</span>                 type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr</span>    <span class="token operator">*</span>sockaddr<span class="token punctuation">;</span> <span class="token comment">// 连接客户端的 sockaddr 结构体</span></span>
<span class="line">    <span class="token class-name">socklen_t</span>           socklen<span class="token punctuation">;</span> <span class="token comment">// 结构体长度</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>           addr_text<span class="token punctuation">;</span> <span class="token comment">// 客户端字符串形式的 IP 地址</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_proxy_protocol_t</span>  <span class="token operator">*</span>proxy_protocol<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_SSL <span class="token operator">||</span> NGX_COMPAT<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token class-name">ngx_ssl_connection_t</span>  <span class="token operator">*</span>ssl<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_udp_connection_t</span>  <span class="token operator">*</span>udp<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr</span>    <span class="token operator">*</span>local_sockaddr<span class="token punctuation">;</span> <span class="token comment">// 本机监听端口的 sockaddr 结构体</span></span>
<span class="line">    <span class="token class-name">socklen_t</span>           local_socklen<span class="token punctuation">;</span> <span class="token comment">// 结构体长度</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_buf_t</span>          <span class="token operator">*</span>buffer<span class="token punctuation">;</span> <span class="token comment">// 用于接收、缓存客户端发来的字符流</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 将当前连接添加到 ngx_cycle_t 结构体的可重用连接双向链表中</span></span>
<span class="line">    <span class="token class-name">ngx_queue_t</span>         queue<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接使用次数</span></span>
<span class="line">    <span class="token class-name">ngx_atomic_uint_t</span>   number<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 处理的请求次数</span></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>          requests<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 缓存中的业务类型</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            buffered<span class="token operator">:</span><span class="token number">8</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 记录日志时的级别</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            log_error<span class="token operator">:</span><span class="token number">3</span><span class="token punctuation">;</span>     <span class="token comment">/* ngx_connection_log_error_e */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接超时 / 错误 / 销毁</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            timedout<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            error<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            destroyed<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 连接空闲 / 可重用 / 关闭</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            idle<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            reusable<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            close<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            shared<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>            sendfile<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span> <span class="token comment">// 正在发送文件</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            sndlowat<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span> <span class="token comment">// 分发时间时，发送缓冲区的大小阈值</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            tcp_nodelay<span class="token operator">:</span><span class="token number">2</span><span class="token punctuation">;</span>   <span class="token comment">/* ngx_connection_tcp_nodelay_e */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>            tcp_nopush<span class="token operator">:</span><span class="token number">2</span><span class="token punctuation">;</span>    <span class="token comment">/* ngx_connection_tcp_nopush_e */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">unsigned</span>            need_last_buf<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_HAVE_AIO_SENDFILE <span class="token operator">||</span> NGX_COMPAT<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token keyword">unsigned</span>            busy_count<span class="token operator">:</span><span class="token number">2</span><span class="token punctuation">;</span> <span class="token comment">// 使用异步 I/O</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_THREADS <span class="token operator">||</span> NGX_COMPAT<span class="token punctuation">)</span></span></span></span>
<span class="line">    <span class="token class-name">ngx_thread_task_t</span>  <span class="token operator">*</span>sendfile_task<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_9-3-2-主动连接" tabindex="-1"><a class="header-anchor" href="#_9-3-2-主动连接"><span>9.3.2 主动连接</span></a></h3><p>Nginx 主动向其它服务器发起的连接。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ngx_peer_connection_s</span>  <span class="token class-name">ngx_peer_connection_t</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 从连接池中获取一个新连接</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token class-name">ngx_int_t</span> <span class="token punctuation">(</span><span class="token operator">*</span>ngx_event_get_peer_pt<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token class-name">ngx_peer_connection_t</span> <span class="token operator">*</span>pc<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">// 将使用完毕的连接归还给连接池</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">void</span> <span class="token punctuation">(</span><span class="token operator">*</span>ngx_event_free_peer_pt<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token class-name">ngx_peer_connection_t</span> <span class="token operator">*</span>pc<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>data<span class="token punctuation">,</span> <span class="token class-name">ngx_uint_t</span> state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">ngx_peer_connection_s</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">ngx_connection_t</span>                <span class="token operator">*</span>connection<span class="token punctuation">;</span> <span class="token comment">// 重用其中部分成员</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">sockaddr</span>                 <span class="token operator">*</span>sockaddr<span class="token punctuation">;</span> <span class="token comment">// 远程服务器的 socket 地址</span></span>
<span class="line">    <span class="token class-name">socklen_t</span>                        socklen<span class="token punctuation">;</span> <span class="token comment">// socket 长度</span></span>
<span class="line">    <span class="token class-name">ngx_str_t</span>                       <span class="token operator">*</span>name<span class="token punctuation">;</span> <span class="token comment">// 远端服务器的名称</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_uint_t</span>                       tries<span class="token punctuation">;</span> <span class="token comment">// 连接失败时的最大重复次数</span></span>
<span class="line">    <span class="token class-name">ngx_msec_t</span>                       start_time<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    ngx_event_get_peer_pt            get<span class="token punctuation">;</span> <span class="token comment">// 获取连接的函数</span></span>
<span class="line">    ngx_event_free_peer_pt           free<span class="token punctuation">;</span> <span class="token comment">// 释放连接的函数</span></span>
<span class="line">    ngx_event_notify_peer_pt         notify<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>                            <span class="token operator">*</span>data<span class="token punctuation">;</span> <span class="token comment">// 函数参数</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>NGX_SSL <span class="token operator">||</span> NGX_COMPAT<span class="token punctuation">)</span></span></span></span>
<span class="line">    ngx_event_set_peer_session_pt    set_session<span class="token punctuation">;</span></span>
<span class="line">    ngx_event_save_peer_session_pt   save_session<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_addr_t</span>                      <span class="token operator">*</span>local<span class="token punctuation">;</span> <span class="token comment">// 本机地址信息</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">int</span>                              type<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>                              rcvbuf<span class="token punctuation">;</span> <span class="token comment">// socket 接收缓冲区大小</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ngx_log_t</span>                       <span class="token operator">*</span>log<span class="token punctuation">;</span> <span class="token comment">// 日志对象</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 标志位</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                         cached<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span> <span class="token comment">// 是否缓存</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                         transparent<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                         so_keepalive<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                         down<span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                                     <span class="token comment">/* ngx_connection_log_error_e */</span></span>
<span class="line">    <span class="token keyword">unsigned</span>                         log_error<span class="token operator">:</span><span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">NGX_COMPAT_BEGIN</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span></span>
<span class="line">    NGX_COMPAT_END</span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个结构体在每次使用时被创建，但是其中的 <code>ngx_connection_t</code> 连接还是从连接池中获取。</p><h3 id="_9-3-3-ngx-connection-t-连接池" tabindex="-1"><a class="header-anchor" href="#_9-3-3-ngx-connection-t-连接池"><span>9.3.3 <code>ngx_connection_t</code> 连接池</span></a></h3><p><code>ngx_connection_t</code> 结构体是 Nginx 在启动阶段就预分配好的，在接收客户端连接时，直接从连接池中获取即可。在 <code>ngx_cycle_t</code> 核心结构体中，以下两个成员共同构成连接池：</p><ul><li><code>connections</code> 指向整个连接池数组的头部</li><li><code>free_connections</code> 指向第一个空闲的 <code>ngx_connection_t</code>，这些结构体以 <code>data</code> 指针串联为单链表</li></ul><p>Nginx 认定每个连接至少需要一个读事件和一个写事件，因此有多少个连接就分配多少个读写事件。连接、读事件、写事件是三个大小相同的数组，只需要通过同一个 index 就能拿到三个对应的结构体。</p>`,37)]))}const o=s(l,[["render",c],["__file","Chapter 9.1-9.3 - 事件处理框架.html.vue"]]),d=JSON.parse('{"path":"/understanding-nginx-notes/Part%203%20-%20%E6%B7%B1%E5%85%A5%20Nginx/Chapter%209.1-9.3%20-%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E6%A1%86%E6%9E%B6.html","title":"Chapter 9.1-9.3 - 事件处理框架","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"9.1 事件模块的层次定义","slug":"_9-1-事件模块的层次定义","link":"#_9-1-事件模块的层次定义","children":[]},{"level":2,"title":"9.2 Nginx 事件的定义","slug":"_9-2-nginx-事件的定义","link":"#_9-2-nginx-事件的定义","children":[]},{"level":2,"title":"9.3 Nginx 连接的定义","slug":"_9-3-nginx-连接的定义","link":"#_9-3-nginx-连接的定义","children":[{"level":3,"title":"9.3.1 被动连接","slug":"_9-3-1-被动连接","link":"#_9-3-1-被动连接","children":[]},{"level":3,"title":"9.3.2 主动连接","slug":"_9-3-2-主动连接","link":"#_9-3-2-主动连接","children":[]},{"level":3,"title":"9.3.3 ngx_connection_t 连接池","slug":"_9-3-3-ngx-connection-t-连接池","link":"#_9-3-3-ngx-connection-t-连接池","children":[]}]}],"git":{},"filePathRelative":"understanding-nginx-notes/Part 3 - 深入 Nginx/Chapter 9.1-9.3 - 事件处理框架.md"}');export{o as comp,d as data};
