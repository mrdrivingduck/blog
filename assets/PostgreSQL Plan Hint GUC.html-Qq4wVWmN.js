import{_ as s,c as a,a as e,o as p}from"./app-CT9FvwxE.js";const l={};function i(t,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-plan-hint-guc" tabindex="-1"><a class="header-anchor" href="#postgresql-plan-hint-guc"><span>PostgreSQL - Plan Hint GUC</span></a></h1><p>Created by : Mr Dk.</p><p>2023 / 05 / 22 0:29</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>GUC (Grand Unified Configuration) 是 PostgreSQL 的一个 <a href="https://www.postgresql.org/docs/devel/acronyms.html" target="_blank" rel="noopener noreferrer">专有名词</a>。之所以这么说，是因为 Google 搜索这个词汇的结果全都和 PostgreSQL 有关。当然，或许它也被用在了其它 IT 系统中吧。</p><p>GUC 是 PostgreSQL 的 <strong>统一配置选项管理系统</strong>。DBMS 是非常复杂的基础软件，其复杂性不仅在于它所肩负妥善管理数据的使命，还在于其需要灵活面对各种各样的业务场景和使用诉求。在 PostgreSQL 的内核代码中，有着大量的全局变量，控制着 PostgreSQL 的各种行为（即所谓的 「开关」），使其各项功能都能够根据用户需求而可配置，从而极大提升使用灵活性。然而，使用者直接访问或修改 PostgreSQL 进程中的全局变量是不现实的，这也是 GUC 存在的意义：将代码中的全局变量与命名配置项建立映射关系，并向使用者提供统一的接口访问或修改配置项，改变数据库的运行时行为。</p><p>此外，GUC 系统对配置项的可修改时机、作用域生效粒度也做了非常精细的控制，在最大化保证灵活性的前提下，同时也能够保证系统运行的稳定性和安全性。配置项的作用域粒度，从大到小依次包含：</p><ol><li>在整个数据库集群生效（通过配置文件，或 <code>ALTER SYSTEM SET</code>）</li><li>在某个特定的数据库中生效（通过 <code>ALTER DATABASE SET</code>）</li><li>对某个特定的用户生效（通过 <code>ALTER ROLE SET</code>）</li><li>对某个会话生效（通过 <code>SET</code>）</li><li>对某个函数生效（通过 <code>CREATE FUNCTION ... SET</code>）生效</li><li>对某个子事务生效（通过 <code>SET LOCAL</code>）生效</li></ol><p>此时，如果还想进一步缩小粒度至某条 SQL 语句的级别，只对某条要执行的 SQL 语句设置配置项，PostgreSQL 暂未提供任何形式的支持。一个名为 <a href="https://github.com/ossc-db/pg_hint_plan" target="_blank" rel="noopener noreferrer"><code>pg_hint_plan</code></a> 的插件支持了这个功能。该插件的开发者来自某个小日子过得不错的国度，commit message 里有一堆日文...</p><h2 id="pg-hint-plan" tabindex="-1"><a class="header-anchor" href="#pg-hint-plan"><span>pg_hint_plan</span></a></h2><h3 id="introduction" tabindex="-1"><a class="header-anchor" href="#introduction"><span>Introduction</span></a></h3><p>如其命名，<code>pg_hint_plan</code> 插件在 SQL 语句中定义了 <strong>提示</strong> 语法，使其能够影响这条 SQL 进入 PostgreSQL 优化器之后的行为。插件启用后，在输入 SQL 中的第一个被 <code>/*+</code> 和 <code>*/</code> 包裹的部分将会被视为提示。<code>pg_hint_plan</code> 定义了很多种提示语法，包括对各种扫描、连接的提示。此外，还支持在输入 SQL 进入优化器阶段时，临时修改 GUC 配置项，在退出优化器阶段后复原：</p><div class="language-sql" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token comment">/*+</span>
<span class="line">    Set(random_page_cost 2.0)</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> table1 t1 <span class="token keyword">WHERE</span> <span class="token keyword">key</span> <span class="token operator">=</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre></div><h3 id="kernel-hook" tabindex="-1"><a class="header-anchor" href="#kernel-hook"><span>Kernel Hook</span></a></h3><p><code>pg_hint_plan</code> 临时设置 GUC 的功能主要是借助 PostgreSQL 的内核 Hook 机制实现的。PostgreSQL 内核代码中定义了很多 Hook 函数，使得 PostgreSQL 的扩展插件在内核代码的特定位置上有机会回调插件中编写的自定义代码。常见的内核 Hook 有：</p><ul><li>共享内存分配 Hook</li><li>优化器 Hook</li><li>执行器初始化/运行/完成/结束阶段 Hook</li><li>...</li></ul><p>以优化器的 Hook 为例：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*****************************************************************************</span>
<span class="line"> *</span>
<span class="line"> *     Query optimizer entry point</span>
<span class="line"> *</span>
<span class="line"> * To support loadable plugins that monitor or modify planner behavior,</span>
<span class="line"> * we provide a hook variable that lets a plugin get control before and</span>
<span class="line"> * after the standard planning process.  The plugin would normally call</span>
<span class="line"> * standard_planner().</span>
<span class="line"> *</span>
<span class="line"> * Note to plugin authors: standard_planner() scribbles on its Query input,</span>
<span class="line"> * so you&#39;d better copy that data structure if you want to plan more than once.</span>
<span class="line"> *</span>
<span class="line"> *****************************************************************************/</span></span>
<span class="line">PlannedStmt <span class="token operator">*</span></span>
<span class="line"><span class="token function">planner</span><span class="token punctuation">(</span>Query <span class="token operator">*</span>parse<span class="token punctuation">,</span> <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>query_string<span class="token punctuation">,</span> <span class="token keyword">int</span> cursorOptions<span class="token punctuation">,</span></span>
<span class="line">        ParamListInfo boundParams<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PlannedStmt <span class="token operator">*</span>result<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>planner_hook<span class="token punctuation">)</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token operator">*</span>planner_hook<span class="token punctuation">)</span> <span class="token punctuation">(</span>parse<span class="token punctuation">,</span> query_string<span class="token punctuation">,</span> cursorOptions<span class="token punctuation">,</span> boundParams<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token function">standard_planner</span><span class="token punctuation">(</span>parse<span class="token punctuation">,</span> query_string<span class="token punctuation">,</span> cursorOptions<span class="token punctuation">,</span> boundParams<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在正确的 <code>planner_hook</code> 实现中，除了实现自定义的功能，还需要显式调用内核的 <code>standard_planner</code> 函数，走回真正的优化器代码中。</p><p>如果扩展插件想要在内核代码中执行一些自定义代码，以完成当前插件的功能，就需要实现相应的 Hook 函数，并把这个 Hook 函数在插件模块的装载回调函数 <code>_PG_init</code> 中安装到内核 Hook 上。这样，当一个 PostgreSQL 进程把插件模块装载到地址空间中时，插件中定义的 Hook 函数指针就被赋值到了内核 Hook 上而生效了。典型的插件装载回调函数如下所示：</p><ol><li>定义扩展插件中自带的 GUC 配置项</li><li>安装内核 Hook</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Module Load Callback</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">_PG_init</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Define custom GUC variables */</span></span>
<span class="line">    <span class="token function">DefineCustomIntVariable</span><span class="token punctuation">(</span><span class="token string">&quot;auth_delay.milliseconds&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token string">&quot;Milliseconds to delay before reporting authentication failure&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token operator">&amp;</span>auth_delay_milliseconds<span class="token punctuation">,</span></span>
<span class="line">                            <span class="token number">0</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token number">0</span><span class="token punctuation">,</span> INT_MAX <span class="token operator">/</span> <span class="token number">1000</span><span class="token punctuation">,</span></span>
<span class="line">                            PGC_SIGHUP<span class="token punctuation">,</span></span>
<span class="line">                            GUC_UNIT_MS <span class="token operator">|</span> POLAR_GUC_IS_UNCHANGABLE<span class="token punctuation">,</span></span>
<span class="line">                            <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                            <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* Install Hooks */</span></span>
<span class="line">    original_client_auth_hook <span class="token operator">=</span> ClientAuthentication_hook<span class="token punctuation">;</span></span>
<span class="line">    ClientAuthentication_hook <span class="token operator">=</span> auth_delay_checks<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使扩展插件被 PostgreSQL 进程加载有两种方式：</p><ol><li>通过 <code>LOAD</code> 命令手动使当前进程加载指定的模块</li><li>将插件名称设置到 <code>shared_preload_libraries</code> 配置项中，使 PostgreSQL 进程启动时自动加载这些模块</li></ol><h3 id="set-guc-implementation" tabindex="-1"><a class="header-anchor" href="#set-guc-implementation"><span>Set GUC Implementation</span></a></h3><p>有了上述背景，<code>pg_plan_hint</code> 实现 GUC 临时设置功能的办法就显而易见了。首先，<code>pg_hint_plan</code> 需要实现一个能被内核优化器回调的 Hook 函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> planner_hook_type prev_planner <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Module load callbacks</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">_PG_init</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Define custom GUC variables. */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Install hooks. */</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line">    prev_planner <span class="token operator">=</span> planner_hook<span class="token punctuation">;</span></span>
<span class="line">    planner_hook <span class="token operator">=</span> pg_hint_plan_planner<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个 Hook 函数中，<code>pg_hint_plan</code> 需要在真正调用内核优化器函数 <code>standard_planner</code> 的前后，分别设置和复原 Hint 中指定的 GUC：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Read and set up hint information</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> PlannedStmt <span class="token operator">*</span></span>
<span class="line"><span class="token function">pg_hint_plan_planner</span><span class="token punctuation">(</span>Query <span class="token operator">*</span>parse<span class="token punctuation">,</span> <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>query_string<span class="token punctuation">,</span> <span class="token keyword">int</span> cursorOptions<span class="token punctuation">,</span> ParamListInfo boundParams<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Parse from hint and set GUCs...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Use PG_TRY mechanism to recover GUC parameters and current_hint_state to</span>
<span class="line">     * the state when this planner started when error occurred in planner.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">PG_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>prev_planner<span class="token punctuation">)</span></span>
<span class="line">            result <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token operator">*</span>prev_planner<span class="token punctuation">)</span> <span class="token punctuation">(</span>parse<span class="token punctuation">,</span> query_string<span class="token punctuation">,</span></span>
<span class="line">                                      cursorOptions<span class="token punctuation">,</span> boundParams<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            result <span class="token operator">=</span> <span class="token function">standard_planner</span><span class="token punctuation">(</span>parse<span class="token punctuation">,</span> query_string<span class="token punctuation">,</span></span>
<span class="line">                                      cursorOptions<span class="token punctuation">,</span> boundParams<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_CATCH</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// Recover the GUCs ...</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token function">PG_RE_THROW</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">PG_END_TRY</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// Recover the GUCs ...</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样，GUC 配置项就能够在内核优化器中被临时设置为 Hint 中所指定的值了。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.enterprisedb.com/blog/what-guc-variable" target="_blank" rel="noopener noreferrer">EDB Blog - What Is a GUC Variable?</a></p><p><a href="https://pghintplan.osdn.jp/pg_hint_plan.html" target="_blank" rel="noopener noreferrer">pg_hint_plan 1.1</a></p><p><a href="https://www.postgresql.org/docs/current/config-setting.html" target="_blank" rel="noopener noreferrer">PostgreSQL Documentations: 20.1. Setting Parameters</a></p>`,36)]))}const c=s(l,[["render",i],["__file","PostgreSQL Plan Hint GUC.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Plan%20Hint%20GUC.html","title":"PostgreSQL - Plan Hint GUC","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"pg_hint_plan","slug":"pg-hint-plan","link":"#pg-hint-plan","children":[{"level":3,"title":"Introduction","slug":"introduction","link":"#introduction","children":[]},{"level":3,"title":"Kernel Hook","slug":"kernel-hook","link":"#kernel-hook","children":[]},{"level":3,"title":"Set GUC Implementation","slug":"set-guc-implementation","link":"#set-guc-implementation","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Plan Hint GUC.md"}');export{c as comp,r as data};
