import{_ as a,c as s,a as e,o as l}from"./app-CT9FvwxE.js";const i={};function p(t,n){return l(),s("div",null,n[0]||(n[0]=[e(`<h1 id="chapter-2-从内核出发" tabindex="-1"><a class="header-anchor" href="#chapter-2-从内核出发"><span>Chapter 2 - 从内核出发</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 10 / 07 22:55</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_2-1-获取内核源码" tabindex="-1"><a class="header-anchor" href="#_2-1-获取内核源码"><span>2.1 获取内核源码</span></a></h2><blockquote><p>略过...</p></blockquote><h2 id="_2-2-内核代码树" tabindex="-1"><a class="header-anchor" href="#_2-2-内核代码树"><span>2.2 内核代码树</span></a></h2><h2 id="_2-3-编译内核" tabindex="-1"><a class="header-anchor" href="#_2-3-编译内核"><span>2.3 编译内核</span></a></h2><h3 id="_2-3-1-配置内核" tabindex="-1"><a class="header-anchor" href="#_2-3-1-配置内核"><span>2.3.1 配置内核</span></a></h3><p>由于内核提供了数不胜数的功能，支持了难以计数的硬件，所以需要配置很多东西。所有可配置的选项都以 <code>CONFIG</code> 开头，要么是二选一，要么是三选一。</p><ul><li>yes - 编译进主内核映像中</li><li>no</li><li>module - 编译时以模块的形式生成 (可以动态安装的独立代码段)</li></ul><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">make</span> config</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>这个工具会逐一遍历所有配置项，要求用于二选一或三选一。这样很麻烦，所以可以这样：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">make</span> defconfig</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>基于默认的配置，为你的体系结构创建一个配置。所有的配置项都被存放在内核代码 root 目录下的 <code>.config</code> 中，该文件可以被直接修改。修改配置文件之后，应当验证和更新配置：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">make</span> oldconfig</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>之后就 <code>make</code> 编译吧。</p><h3 id="_2-3-2-减少编译的垃圾信息" tabindex="-1"><a class="header-anchor" href="#_2-3-2-减少编译的垃圾信息"><span>2.3.2 减少编译的垃圾信息</span></a></h3><p>将 <code>make</code> 重定向到某个文件或 <code>/dev/null</code> 中。</p><h3 id="_2-3-3-衍生多个编译作业" tabindex="-1"><a class="header-anchor" href="#_2-3-3-衍生多个编译作业"><span>2.3.3 衍生多个编译作业</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">make</span> <span class="token parameter variable">-jn</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="_2-3-4-安装新内核" tabindex="-1"><a class="header-anchor" href="#_2-3-4-安装新内核"><span>2.3.4 安装新内核</span></a></h3><p>内核编译好后，需要将内核映像拷贝到合适的位置并安装。因体系结构和启动引导工具而异。</p><h2 id="_2-4-内核开发的特点" tabindex="-1"><a class="header-anchor" href="#_2-4-内核开发的特点"><span>2.4 内核开发的特点</span></a></h2><p>内核开发与用户空间内的应用程序开发的差异：</p><ul><li>不能访问 C 库，也不能访问标准的 C 头文件</li><li>必须使用 GNU C</li><li>缺乏像用户空间那样的内存保护机制</li><li>难以执行浮点运算</li><li>内核给每个进程一个很小的定长堆栈</li><li>需要时刻注意同步和并发</li><li>要考虑可移植性</li></ul><h3 id="_2-4-1-无-libc-库异或无标准头文件" tabindex="-1"><a class="header-anchor" href="#_2-4-1-无-libc-库异或无标准头文件"><span>2.4.1 无 libc 库异或无标准头文件</span></a></h3><p>因为 C 库中的函数对于内核来说太庞大，性能低下，大部分常用的 C 库函数在内核中都已经得到了实现，比如 <code>string.h</code> 等。最著名的 <code>printf()</code> 也由 <code>printk()</code> 实现。</p><h3 id="_2-4-2-gnu-c" tabindex="-1"><a class="header-anchor" href="#_2-4-2-gnu-c"><span>2.4.2 GNU C</span></a></h3><p>内核并不完全符合 ANSI C 标准，而是使用了 ISO C99 标准和 GNU C 的扩展特性。</p><h4 id="内联函数-inline" tabindex="-1"><a class="header-anchor" href="#内联函数-inline"><span>内联函数 (inline)</span></a></h4><p>函数在被调用的位置展开：</p><ul><li>消除函数调用和返回的开销 (寄存器存储和恢复)</li><li>编译器可以把调用函数的代码和函数本身一起进行优化</li><li>代码变长，占用更多的内存和指令缓存</li></ul><p>通常会把对时间要求高，而自身长度较短的函数定义为内联函数。需要使用 <code>static</code> 关键字来声明。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span> <span class="token function">wolf</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">long</span> tail_size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在内核中，为了 <strong>类型安全</strong> 和 <strong>易读性</strong>，优先使用内联函数，而不是 <strong>宏</strong>。</p><h4 id="内联汇编" tabindex="-1"><a class="header-anchor" href="#内联汇编"><span>内联汇编</span></a></h4><p>gcc 编译器支持在 C 函数中嵌入汇编指令。只有知道对应的体系结构，才能使用这个功能。在偏近体系结构底层，或对时间要求严格的地方，使用汇编。</p><h4 id="分支声明" tabindex="-1"><a class="header-anchor" href="#分支声明"><span>分支声明</span></a></h4><p>对于条件选择语句，gcc 内建了指令用于优化：</p><ul><li>一个条件经常出现</li><li>一个条件很少出现</li></ul><p>编译器根据这个指令对条件分支选择进行优化，内核把这条指令封装为宏。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">//</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">unlikely</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token comment">//</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">likely</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>需要判断是否存在条件，使得大多数情况下都会成立：</p><ul><li>如果判断正确，那么这样能提高性能</li><li>否则性能反而会下降</li></ul><h3 id="_2-4-3-没有内存保护机制" tabindex="-1"><a class="header-anchor" href="#_2-4-3-没有内存保护机制"><span>2.4.3 没有内存保护机制</span></a></h3><p>内核访问了非法内存，后果难以控制。内核中的内存都不分页，用掉一个字节，物理内存就少一个字节。</p><h3 id="_2-4-4-不要轻易在内核中使用浮点数" tabindex="-1"><a class="header-anchor" href="#_2-4-4-不要轻易在内核中使用浮点数"><span>2.4.4 不要轻易在内核中使用浮点数</span></a></h3><p>用户空间中的浮点数操作，内核会在其中完成从整数操作到浮点数操作的模式转换。在内核中使用浮点数，需要人工保存和恢复浮点寄存器，还要做一些琐碎的事——尽量 <strong>别这么做</strong> ！除了极少数情况，不要在内核中使用浮点操作。</p><h3 id="_2-4-5-容积小而固定的栈" tabindex="-1"><a class="header-anchor" href="#_2-4-5-容积小而固定的栈"><span>2.4.5 容积小而固定的栈</span></a></h3><p>用户空间的栈比较大，并且可以动态增长。内核栈的大小随体系结构而变，而且 <strong>大小固定</strong>。</p><h3 id="_2-4-6-同步和并发" tabindex="-1"><a class="header-anchor" href="#_2-4-6-同步和并发"><span>2.4.6 同步和并发</span></a></h3><p>内核很容易产生竞争条件：</p><ul><li>Linux 是抢占多任务 OS - 内核必须和其调度的任务同步</li><li>Linux 内核支持对称多处理器系统 (SMP) - 同时在两个以上的 CPU 上执行的内核代码很可能会同时访问共享资源</li><li>中断是异步到来的 - 中断完全可以在代码访问资源时到来，这样中断处理程序也能访问同一资源</li><li>Linux 内核可以抢占 - 内核中一段正在执行的代码可能会被另一段代码抢占，导致几段代码同时访问相同的资源</li></ul><p>需要用机制解决竞争。</p><h3 id="_2-4-7-可移植性的重要性" tabindex="-1"><a class="header-anchor" href="#_2-4-7-可移植性的重要性"><span>2.4.7 可移植性的重要性</span></a></h3><p>大部分 C 代码应该与体系结构无关，必须把与体系结构相关的代码从内核代码树的特定目录中分离。</p><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>OS 内核之所以难、复杂，就是因为这些吧 🥱</p>`,60)]))}const r=a(i,[["render",p],["__file","Chapter 2 - 从内核出发.html.vue"]]),d=JSON.parse('{"path":"/linux-kernel-development-notes/Chapter%202%20-%20%E4%BB%8E%E5%86%85%E6%A0%B8%E5%87%BA%E5%8F%91.html","title":"Chapter 2 - 从内核出发","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"2.1 获取内核源码","slug":"_2-1-获取内核源码","link":"#_2-1-获取内核源码","children":[]},{"level":2,"title":"2.2 内核代码树","slug":"_2-2-内核代码树","link":"#_2-2-内核代码树","children":[]},{"level":2,"title":"2.3 编译内核","slug":"_2-3-编译内核","link":"#_2-3-编译内核","children":[{"level":3,"title":"2.3.1 配置内核","slug":"_2-3-1-配置内核","link":"#_2-3-1-配置内核","children":[]},{"level":3,"title":"2.3.2 减少编译的垃圾信息","slug":"_2-3-2-减少编译的垃圾信息","link":"#_2-3-2-减少编译的垃圾信息","children":[]},{"level":3,"title":"2.3.3 衍生多个编译作业","slug":"_2-3-3-衍生多个编译作业","link":"#_2-3-3-衍生多个编译作业","children":[]},{"level":3,"title":"2.3.4 安装新内核","slug":"_2-3-4-安装新内核","link":"#_2-3-4-安装新内核","children":[]}]},{"level":2,"title":"2.4 内核开发的特点","slug":"_2-4-内核开发的特点","link":"#_2-4-内核开发的特点","children":[{"level":3,"title":"2.4.1 无 libc 库异或无标准头文件","slug":"_2-4-1-无-libc-库异或无标准头文件","link":"#_2-4-1-无-libc-库异或无标准头文件","children":[]},{"level":3,"title":"2.4.2 GNU C","slug":"_2-4-2-gnu-c","link":"#_2-4-2-gnu-c","children":[]},{"level":3,"title":"2.4.3 没有内存保护机制","slug":"_2-4-3-没有内存保护机制","link":"#_2-4-3-没有内存保护机制","children":[]},{"level":3,"title":"2.4.4 不要轻易在内核中使用浮点数","slug":"_2-4-4-不要轻易在内核中使用浮点数","link":"#_2-4-4-不要轻易在内核中使用浮点数","children":[]},{"level":3,"title":"2.4.5 容积小而固定的栈","slug":"_2-4-5-容积小而固定的栈","link":"#_2-4-5-容积小而固定的栈","children":[]},{"level":3,"title":"2.4.6 同步和并发","slug":"_2-4-6-同步和并发","link":"#_2-4-6-同步和并发","children":[]},{"level":3,"title":"2.4.7 可移植性的重要性","slug":"_2-4-7-可移植性的重要性","link":"#_2-4-7-可移植性的重要性","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"linux-kernel-development-notes/Chapter 2 - 从内核出发.md"}');export{r as comp,d as data};
