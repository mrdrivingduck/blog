import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function p(c,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="postgresql-guc" tabindex="-1"><a class="header-anchor" href="#postgresql-guc"><span>PostgreSQL - GUC</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 05 / 30 21:45</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p><em>GUC (Grand Unified Configuration)</em> 是 <em>PostgreSQL</em> 的配置系统。负责在不同时机从多个来源、以多种方式控制数据库的所有配置项。</p><h2 id="time" tabindex="-1"><a class="header-anchor" href="#time"><span>Time</span></a></h2><p>特定的配置项只能在特定的时间被设置，分类如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PGC_INTERNAL<span class="token punctuation">,</span></span>
<span class="line">    PGC_POSTMASTER<span class="token punctuation">,</span></span>
<span class="line">    PGC_SIGHUP<span class="token punctuation">,</span></span>
<span class="line">    PGC_SU_BACKEND<span class="token punctuation">,</span></span>
<span class="line">    PGC_BACKEND<span class="token punctuation">,</span></span>
<span class="line">    PGC_SUSET<span class="token punctuation">,</span></span>
<span class="line">    PGC_USERSET</span>
<span class="line"><span class="token punctuation">}</span> GucContext<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>INTERNAL</code> 参数：不可被用户更改，在编译或数据库初始化时已经被固定</li><li><code>POSTMASTER</code> 参数：<code>postmaster</code> 是 PostgreSQL 的服务主进程，这类参数只有在主进程启动时才能被设置 (通过配置文件 / 命令行)</li><li><code>SIGHUP</code> 参数：主进程启动时，或向后台进程发送 <code>SIGHUP</code> 信号后参数生效；后台进程会在主循环的特定位置处理这个信号，重新读取配置文件；为了安全，可能需要等待一段时间以确保配置被重新读取</li><li><code>BACKEND</code> / <code>SU_BACKEND</code> 参数：主进程启动时，或在客户端的请求包被收到 (连接建立) 时，参数生效；<code>SU_BACKEND</code> 当且仅当发起请求的用户是 super user；这类参数在一个后端启动后将会固定</li><li><code>SUSET</code> 参数：super user 设置，立刻生效</li><li><code>USERSET</code> 参数：所有用户都可设置，立刻生效</li></ul><h2 id="source" tabindex="-1"><a class="header-anchor" href="#source"><span>Source</span></a></h2><p>参数的来源优先级。一个参数会生效，当前仅当该参数之前的来源优先级低于或相等于本次参数设置的来源优先级。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PGC_S_DEFAULT<span class="token punctuation">,</span>              <span class="token comment">/* hard-wired default (&quot;boot_val&quot;) */</span></span>
<span class="line">    PGC_S_DYNAMIC_DEFAULT<span class="token punctuation">,</span>      <span class="token comment">/* default computed during initialization */</span></span>
<span class="line">    PGC_S_ENV_VAR<span class="token punctuation">,</span>              <span class="token comment">/* postmaster environment variable */</span></span>
<span class="line">    PGC_S_FILE<span class="token punctuation">,</span>                 <span class="token comment">/* postgresql.conf */</span></span>
<span class="line">    PGC_S_ARGV<span class="token punctuation">,</span>                 <span class="token comment">/* postmaster command line */</span></span>
<span class="line">    PGC_S_GLOBAL<span class="token punctuation">,</span>               <span class="token comment">/* global in-database setting */</span></span>
<span class="line">    PGC_S_DATABASE<span class="token punctuation">,</span>             <span class="token comment">/* per-database setting */</span></span>
<span class="line">    PGC_S_USER<span class="token punctuation">,</span>                 <span class="token comment">/* per-user setting */</span></span>
<span class="line">    PGC_S_DATABASE_USER<span class="token punctuation">,</span>        <span class="token comment">/* per-user-and-database setting */</span></span>
<span class="line">    PGC_S_CLIENT<span class="token punctuation">,</span>               <span class="token comment">/* from client connection request */</span></span>
<span class="line">    PGC_S_OVERRIDE<span class="token punctuation">,</span>             <span class="token comment">/* special case to forcibly set default */</span></span>
<span class="line">    PGC_S_INTERACTIVE<span class="token punctuation">,</span>          <span class="token comment">/* dividing line for error reporting */</span></span>
<span class="line">    PGC_S_TEST<span class="token punctuation">,</span>                 <span class="token comment">/* test per-database or per-user setting */</span></span>
<span class="line">    PGC_S_SESSION               <span class="token comment">/* SET command */</span></span>
<span class="line"><span class="token punctuation">}</span> GucSource<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>优先级最低的应该是参数的默认来源 <code>PGC_S_DEFAULT</code>。比如，如果用户已经在会话等级 <code>PGC_S_SESSION</code> 设置了一个参数，那么再到文件等级 <code>PGC_S_FILE</code> 设置参数将不会覆盖会话等级的设置。</p><h2 id="type" tabindex="-1"><a class="header-anchor" href="#type"><span>Type</span></a></h2><p>PostgreSQL 中规定了几种 GUC 参数的类型：</p><ul><li>布尔值</li><li>整数值</li><li>实数值</li><li>字符串</li><li>枚举</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_bool</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">config_generic</span> gen<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    bool       <span class="token operator">*</span>variable<span class="token punctuation">;</span></span>
<span class="line">    bool        boot_val<span class="token punctuation">;</span></span>
<span class="line">    GucBoolCheckHook check_hook<span class="token punctuation">;</span></span>
<span class="line">    GucBoolAssignHook assign_hook<span class="token punctuation">;</span></span>
<span class="line">    GucShowHook show_hook<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    bool        reset_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>reset_extra<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_int</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">config_generic</span> gen<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    <span class="token keyword">int</span>        <span class="token operator">*</span>variable<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         boot_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         min<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         max<span class="token punctuation">;</span></span>
<span class="line">    GucIntCheckHook check_hook<span class="token punctuation">;</span></span>
<span class="line">    GucIntAssignHook assign_hook<span class="token punctuation">;</span></span>
<span class="line">    GucShowHook show_hook<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    <span class="token keyword">int</span>         reset_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>reset_extra<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_real</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">config_generic</span> gen<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    <span class="token keyword">double</span>     <span class="token operator">*</span>variable<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">double</span>      boot_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">double</span>      min<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">double</span>      max<span class="token punctuation">;</span></span>
<span class="line">    GucRealCheckHook check_hook<span class="token punctuation">;</span></span>
<span class="line">    GucRealAssignHook assign_hook<span class="token punctuation">;</span></span>
<span class="line">    GucShowHook show_hook<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    <span class="token keyword">double</span>      reset_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>reset_extra<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_string</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">config_generic</span> gen<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    <span class="token keyword">char</span>      <span class="token operator">*</span><span class="token operator">*</span>variable<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>boot_val<span class="token punctuation">;</span></span>
<span class="line">    GucStringCheckHook check_hook<span class="token punctuation">;</span></span>
<span class="line">    GucStringAssignHook assign_hook<span class="token punctuation">;</span></span>
<span class="line">    GucShowHook show_hook<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>reset_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>reset_extra<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_enum</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">config_generic</span> gen<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    <span class="token keyword">int</span>        <span class="token operator">*</span>variable<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         boot_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">struct</span> <span class="token class-name">config_enum_entry</span> <span class="token operator">*</span>options<span class="token punctuation">;</span></span>
<span class="line">    GucEnumCheckHook check_hook<span class="token punctuation">;</span></span>
<span class="line">    GucEnumAssignHook assign_hook<span class="token punctuation">;</span></span>
<span class="line">    GucShowHook show_hook<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    <span class="token keyword">int</span>         reset_val<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>reset_extra<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，每种类型的参数都有公共的信息 <code>config_generic</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Generic fields applicable to all types of variables</span>
<span class="line"> *</span>
<span class="line"> * The short description should be less than 80 chars in length. Some</span>
<span class="line"> * applications may use the long description as well, and will append</span>
<span class="line"> * it to the short description. (separated by a newline or &#39;. &#39;)</span>
<span class="line"> *</span>
<span class="line"> * Note that sourcefile/sourceline are kept here, and not pushed into stacked</span>
<span class="line"> * values, although in principle they belong with some stacked value if the</span>
<span class="line"> * active value is session- or transaction-local.  This is to avoid bloating</span>
<span class="line"> * stack entries.  We know they are only relevant when source == PGC_S_FILE.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">config_generic</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* constant fields, must be set correctly in initial value: */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">;</span>           <span class="token comment">/* name of variable - MUST BE FIRST */</span></span>
<span class="line">    GucContext  context<span class="token punctuation">;</span>        <span class="token comment">/* context required to set the variable */</span></span>
<span class="line">    <span class="token keyword">enum</span> <span class="token class-name">config_group</span> group<span class="token punctuation">;</span>    <span class="token comment">/* to help organize variables by function */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>short_desc<span class="token punctuation">;</span>     <span class="token comment">/* short desc. of this variable&#39;s purpose */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>long_desc<span class="token punctuation">;</span>      <span class="token comment">/* long desc. of this variable&#39;s purpose */</span></span>
<span class="line">    <span class="token keyword">int</span>         flags<span class="token punctuation">;</span>          <span class="token comment">/* flag bits, see guc.h */</span></span>
<span class="line">    <span class="token comment">/* variable fields, initialized at runtime: */</span></span>
<span class="line">    <span class="token keyword">enum</span> <span class="token class-name">config_type</span> vartype<span class="token punctuation">;</span>   <span class="token comment">/* type of variable (set only at startup) */</span></span>
<span class="line">    <span class="token keyword">int</span>         status<span class="token punctuation">;</span>         <span class="token comment">/* status bits, see below */</span></span>
<span class="line">    GucSource   source<span class="token punctuation">;</span>         <span class="token comment">/* source of the current actual value */</span></span>
<span class="line">    GucSource   reset_source<span class="token punctuation">;</span>   <span class="token comment">/* source of the reset_value */</span></span>
<span class="line">    GucContext  scontext<span class="token punctuation">;</span>       <span class="token comment">/* context that set the current value */</span></span>
<span class="line">    GucContext  reset_scontext<span class="token punctuation">;</span> <span class="token comment">/* context that set the reset value */</span></span>
<span class="line">    GucStack   <span class="token operator">*</span>stack<span class="token punctuation">;</span>          <span class="token comment">/* stacked prior values */</span></span>
<span class="line">    <span class="token keyword">void</span>       <span class="token operator">*</span>extra<span class="token punctuation">;</span>          <span class="token comment">/* &quot;extra&quot; pointer for current actual value */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>last_reported<span class="token punctuation">;</span>  <span class="token comment">/* if variable is GUC_REPORT, value last sent</span>
<span class="line">                                 * to client (NULL if not yet sent) */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>sourcefile<span class="token punctuation">;</span>     <span class="token comment">/* file current setting is from (NULL if not</span>
<span class="line">                                 * set in config file) */</span></span>
<span class="line">    <span class="token keyword">int</span>         sourceline<span class="token punctuation">;</span>     <span class="token comment">/* line in source file */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除去在运行时被初始化的部分，其余部分全部硬编码在 GUC 代码中。比如：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">struct</span> <span class="token class-name">config_bool</span> ConfigureNamesBool<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token punctuation">{</span><span class="token string">&quot;enable_seqscan&quot;</span><span class="token punctuation">,</span> PGC_USERSET<span class="token punctuation">,</span> QUERY_TUNING_METHOD<span class="token punctuation">,</span></span>
<span class="line">            <span class="token function">gettext_noop</span><span class="token punctuation">(</span><span class="token string">&quot;Enables the planner&#39;s use of sequential-scan plans.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">            GUC_EXPLAIN</span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token operator">&amp;</span>enable_seqscan<span class="token punctuation">,</span></span>
<span class="line">        true<span class="token punctuation">,</span></span>
<span class="line">        <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token constant">NULL</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="configuration-file" tabindex="-1"><a class="header-anchor" href="#configuration-file"><span>Configuration File</span></a></h2><p>最基本的设置参数方法是编辑数据库集群目录下的默认副本 <code>postgresql.conf</code>。该文件提供了所有参数的默认值，除非在运行时被更高优先级的参数来源覆盖。这份配置文件会在主服务器进程接收到 <code>SIGHUP</code> 信号时被重新读取。有两种方式可以向后台进程发送 <code>SIGHUP</code> 信号：</p><p>在命令行运行：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">pg_ctl reload</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在 psql 中调用 SQL 函数：</p><div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">select</span> pg_reload_conf<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>主服务器进程还会将信号传播给所有正在运行的服务器进程，因此所有的会话都将应用新的参数值。对于只能重启后生效的参数，<code>SIGHUP</code> 的信号处理函数将忽视配置文件中的参数变化。</p><p>另外，通过 <code>ALTER SYSTEM</code> 命令，一些参数将会被记录到 <code>postgresql.auto.conf</code> 中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Automatic configuration file name for ALTER SYSTEM.</span>
<span class="line"> * This file will be used to store values of configuration parameters</span>
<span class="line"> * set by ALTER SYSTEM command.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">PG_AUTOCONF_FILENAME</span>        <span class="token string">&quot;postgresql.auto.conf&quot;</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>postgresql.auto.conf</code> 文件中的参数项将会在后端进程读取 <code>postgresql.conf</code> 文件时被同时读取，同时覆盖 <code>postgresql.conf</code> 文件中的配置项。不推荐在后端进程运行时手动修改该文件，而是通过 <code>ALTER SYSTEM</code> 命令来设置参数。</p><p>系统视图 <code>pg_file_settings</code> 用于预先测试配置项状态。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.postgresql.org/docs/11/config-setting.html" target="_blank" rel="noopener noreferrer">PostgreSQL Documentations - 19.1. Setting Parameters</a></p><p><a href="https://developer.aliyun.com/article/215287" target="_blank" rel="noopener noreferrer">阿里云开发者社区 - PostgreSQL GUC 参数级别介绍</a></p><p><a href="http://www.postgres.cn/news/viewone/1/262" target="_blank" rel="noopener noreferrer">PostgreSQL 中文社区 - PostgreSQL 数据库参数生效规则</a></p>`,38)]))}const o=n(i,[["render",p],["__file","PostgreSQL GUC.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20GUC.html","title":"PostgreSQL - GUC","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Time","slug":"time","link":"#time","children":[]},{"level":2,"title":"Source","slug":"source","link":"#source","children":[]},{"level":2,"title":"Type","slug":"type","link":"#type","children":[]},{"level":2,"title":"Configuration File","slug":"configuration-file","link":"#configuration-file","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL GUC.md"}');export{o as comp,r as data};
