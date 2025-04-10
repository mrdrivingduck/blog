import{_ as s,c as a,a as p,o as e}from"./app-CT9FvwxE.js";const t="/blog/assets/12-35-DWfLij_Z.png",l={};function c(o,n){return e(),a("div",null,n[0]||(n[0]=[p('<h1 id="chapter-12-17-fcntl-c-程序" tabindex="-1"><a class="header-anchor" href="#chapter-12-17-fcntl-c-程序"><span>Chapter 12.17 - fcntl.c 程序</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 09 / 21 22:42</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_12-17-fcntl-c-程序" tabindex="-1"><a class="header-anchor" href="#_12-17-fcntl-c-程序"><span>12.17 fcntl.c 程序</span></a></h2><h3 id="_12-17-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_12-17-1-功能描述"><span>12.17.1 功能描述</span></a></h3><p>实现了文件控制系统调用 <code>fcntl()</code> 和两个文件句柄 (描述符) 复制系统调用 <code>dup()</code> 和 <code>dup2()</code>。</p><ul><li><code>dup2()</code> 指定了新句柄的最小数值</li><li><code>dup()</code> 指定了当前值最小的未用句柄</li><li><code>fcntl()</code> 用于修改已打开的文件的状态或复制句柄</li></ul><p><code>dup()</code> 和 <code>dup2()</code> 返回的文件句柄与被复制句柄将 <strong>共用同一个文件表项</strong>。</p><p><img src="'+t+`" alt="12-35"></p><p>对于使用 <code>dup()</code> 和 <code>dup2()</code> 函数新建的句柄，<code>close_on_exec</code> 标志会被清除。运行 <code>exec()</code> 类系统调用不会关闭 <code>dup()</code> 建立的文件句柄。</p><p>关于文件控制，有如下命令：</p><ul><li>F_DUPFD - 复制文件句柄，等效于 <code>dup()</code></li><li>F_GETFD / F_SETFD - 读取或设置文件句柄的 close_on_exec 标志</li><li>F_GETFL / F_SETFL - 读取或设置文件操作和访问标志 <ul><li>RDONLY</li><li>O_WRONLY</li><li>O_RDWR</li><li>O_APPEND</li><li>O_NONBLOCK</li></ul></li><li>F_GETLK / F_SETLK / F_SETLKW - 读取或设置文件上锁标志 (Linux 0.12 暂未实现)</li></ul><h3 id="_12-17-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_12-17-2-代码注释"><span>12.17.2 代码注释</span></a></h3><h4 id="dupfd-复制文件句柄-描述符" tabindex="-1"><a class="header-anchor" href="#dupfd-复制文件句柄-描述符"><span>dupfd() - 复制文件句柄 (描述符)</span></a></h4><p>arg 指定了新文件句柄的最小值。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">dupfd</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> fd<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">int</span> arg<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fd <span class="token operator">&gt;=</span> NR_OPEN <span class="token operator">||</span> <span class="token operator">!</span>current<span class="token operator">-&gt;</span>filp<span class="token punctuation">[</span>fd<span class="token punctuation">]</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span>EBADF<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>arg <span class="token operator">&gt;=</span> NR_OPEN<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span>EINVAL<span class="token punctuation">;</span></span>
<span class="line">    </span>
<span class="line">    <span class="token comment">// 寻找 ≥ arg 的空闲文件描述符</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>arg <span class="token operator">&lt;</span> NR_OPEN<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>current<span class="token operator">-&gt;</span>filp<span class="token punctuation">[</span>arg<span class="token punctuation">]</span><span class="token punctuation">)</span></span>
<span class="line">            arg<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    </span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>arg <span class="token operator">&gt;=</span> NR_OPEN<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span>EMFILE<span class="token punctuation">;</span></span>
<span class="line">    </span>
<span class="line">    current<span class="token operator">-&gt;</span>close_on_exec <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> arg<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 复位 close_on_exec 标志</span></span>
<span class="line">    <span class="token comment">// 复制文件描述符 (文件描述符指向同一个文件表项)</span></span>
<span class="line">    <span class="token comment">// 文件项引用次数加 1</span></span>
<span class="line">    <span class="token punctuation">(</span>current<span class="token operator">-&gt;</span>filp<span class="token punctuation">[</span>arg<span class="token punctuation">]</span> <span class="token operator">=</span> current<span class="token operator">-&gt;</span>filp<span class="token punctuation">[</span>fd<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token operator">-&gt;</span>f_count<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> arg<span class="token punctuation">;</span> <span class="token comment">// 返回新的文件描述符</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="sys-dup2-复制文件句柄系统调用" tabindex="-1"><a class="header-anchor" href="#sys-dup2-复制文件句柄系统调用"><span>sys_dup2() - 复制文件句柄系统调用</span></a></h4><p>复制指定的 oldfd，新文件句柄的值为 newfd。如果 newfd 已打开，则先关闭。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">int</span> <span class="token function">sys_dup2</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> oldfd<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">int</span> newfd<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">sys_close</span><span class="token punctuation">(</span>newfd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">dupfd</span><span class="token punctuation">(</span>oldfd<span class="token punctuation">,</span> newfd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="sys-dup-复制文件句柄系统调用" tabindex="-1"><a class="header-anchor" href="#sys-dup-复制文件句柄系统调用"><span>sys_dup() - 复制文件句柄系统调用</span></a></h4><p>返回的新句柄是当前最小的未用句柄。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">int</span> <span class="token function">sys_dup</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> fildes<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">dupfd</span><span class="token punctuation">(</span>fildes<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="sys-fcntl-文件控制系统调用" tabindex="-1"><a class="header-anchor" href="#sys-fcntl-文件控制系统调用"><span>sys_fcntl() - 文件控制系统调用</span></a></h4><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">int</span> <span class="token function">sys_fcntl</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> fd<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">int</span> cmd<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">long</span> arg<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">file</span> <span class="token operator">*</span> filp<span class="token punctuation">;</span></span>
<span class="line">    </span>
<span class="line">    <span class="token comment">// filp 指向文件描述符对应的文件表项</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>fd <span class="token operator">&gt;=</span> NR_OPEN <span class="token operator">||</span> <span class="token operator">!</span><span class="token punctuation">(</span>filp <span class="token operator">=</span> current<span class="token operator">-&gt;</span>filp<span class="token punctuation">[</span>fd<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token comment">// 文件句柄无效</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span>EBADF<span class="token punctuation">;</span></span>
<span class="line">    </span>
<span class="line">    <span class="token keyword">switch</span><span class="token punctuation">(</span>cmd<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">case</span> F_DUPFD<span class="token operator">:</span> <span class="token comment">// 复制文件句柄</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token function">dupfd</span><span class="token punctuation">(</span>fd<span class="token punctuation">,</span> arg<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> F_GETFD<span class="token operator">:</span> <span class="token comment">// 取文件的 close_on_exec 标志</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token punctuation">(</span>current<span class="token operator">-&gt;</span>close_on_exec <span class="token operator">&gt;&gt;</span> fd<span class="token punctuation">)</span> <span class="token operator">&amp;</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> F_SETFD<span class="token operator">:</span> <span class="token comment">// 设置文件的 close_on_exec 标志</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>arg <span class="token operator">&amp;</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token comment">// 置位</span></span>
<span class="line">                current<span class="token operator">-&gt;</span>close_on_exec <span class="token operator">|=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> fd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                <span class="token comment">// 复位</span></span>
<span class="line">                current<span class="token operator">-&gt;</span>close_on_exec <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> fd<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> F_GETFL<span class="token operator">:</span> <span class="token comment">// 取文件状态标志和访问模式</span></span>
<span class="line">            <span class="token keyword">return</span> filp<span class="token operator">-&gt;</span>f_flags<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> F_SETFL<span class="token operator">:</span> <span class="token comment">// 设置文件状态和访问模式</span></span>
<span class="line">            filp<span class="token operator">-&gt;</span>f_flags <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token punctuation">(</span>O_APPEND <span class="token operator">|</span> O_NONBLOCK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            filp<span class="token operator">-&gt;</span>f_flags <span class="token operator">|=</span> arg <span class="token operator">&amp;</span> <span class="token punctuation">(</span>O_APPEND <span class="token operator">|</span> O_NONBLOCK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">case</span> F_GETLK<span class="token operator">:</span></span>
<span class="line">        <span class="token keyword">case</span> F_SETLK<span class="token operator">:</span></span>
<span class="line">        <span class="token keyword">case</span> F_SETLKW<span class="token operator">:</span></span>
<span class="line">            <span class="token comment">// 未实现</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,26)]))}const r=s(l,[["render",c],["__file","Chapter 12.17 - fcntl.c 程序.html.vue"]]),u=JSON.parse('{"path":"/linux-kernel-comments-notes/Chapter%2012%20-%20%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F/Chapter%2012.17%20-%20fcntl.c%20%E7%A8%8B%E5%BA%8F.html","title":"Chapter 12.17 - fcntl.c 程序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"12.17 fcntl.c 程序","slug":"_12-17-fcntl-c-程序","link":"#_12-17-fcntl-c-程序","children":[{"level":3,"title":"12.17.1 功能描述","slug":"_12-17-1-功能描述","link":"#_12-17-1-功能描述","children":[]},{"level":3,"title":"12.17.2 代码注释","slug":"_12-17-2-代码注释","link":"#_12-17-2-代码注释","children":[]}]}],"git":{},"filePathRelative":"linux-kernel-comments-notes/Chapter 12 - 文件系统/Chapter 12.17 - fcntl.c 程序.md"}');export{r as comp,u as data};
