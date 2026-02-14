import{_ as a,c as s,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function p(c,n){return l(),s("div",null,n[0]||(n[0]=[e(`<h1 id="head-tail" tabindex="-1"><a class="header-anchor" href="#head-tail"><span>head / tail</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 02 23:28</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>head</code> 和 <code>tail</code> 被用于打印文件的开头部分和结尾部分至标准输出流。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><p>默认打印 10 行：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">head</span> a.txt</span>
<span class="line">a</span>
<span class="line">b</span>
<span class="line">c</span>
<span class="line">d</span>
<span class="line">e</span>
<span class="line">f</span>
<span class="line">g</span>
<span class="line">h</span>
<span class="line">i</span>
<span class="line">j</span>
<span class="line"></span>
<span class="line">$ <span class="token function">tail</span> a.txt</span>
<span class="line">k</span>
<span class="line">l</span>
<span class="line">m</span>
<span class="line">n</span>
<span class="line">o</span>
<span class="line">p</span>
<span class="line">q</span>
<span class="line">r</span>
<span class="line">s</span>
<span class="line">t</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-n</code> 参数可以指定行数，<code>-c</code> 参数可以指定字节数：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">head</span> <span class="token parameter variable">-n</span> <span class="token number">3</span> a.txt</span>
<span class="line">a</span>
<span class="line">b</span>
<span class="line">c</span>
<span class="line"></span>
<span class="line">$ <span class="token function">tail</span> <span class="token parameter variable">-n</span> <span class="token number">3</span> a.txt</span>
<span class="line">r</span>
<span class="line">s</span>
<span class="line">t</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">head</span> <span class="token parameter variable">-c</span> <span class="token number">2</span> a.txt</span>
<span class="line">a</span>
<span class="line"></span>
<span class="line">$ <span class="token function">tail</span> <span class="token parameter variable">-c</span> <span class="token number">2</span> a.txt</span>
<span class="line">t</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="following" tabindex="-1"><a class="header-anchor" href="#following"><span>Following</span></a></h2><p><code>tail</code> 命令有着独特的追踪选项 <code>-f</code>，因为有时需要监控一个文件尾部的变化。</p><p><code>--retry</code> 会尝试打开一个无法被访问的文件，直到打开为止。只对初次打开文件有效：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">tail</span> <span class="token parameter variable">-f</span> <span class="token parameter variable">--retry</span> a.txt</span>
<span class="line">tail: warning: <span class="token parameter variable">--retry</span> only effective <span class="token keyword">for</span> the initial <span class="token function">open</span></span>
<span class="line">tail: cannot <span class="token function">open</span> <span class="token string">&#39;a.txt&#39;</span> <span class="token keyword">for</span> reading: No such <span class="token function">file</span> or directory</span>
<span class="line">tail: <span class="token string">&#39;a.txt&#39;</span> has appeared<span class="token punctuation">;</span>  following new <span class="token function">file</span></span>
<span class="line">aaa</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>--pid=PID</code> 在指定进程退出后结束追踪模式。</p><p><code>-s</code> 指定追踪文件过程中的睡眠时间。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://man7.org/linux/man-pages/man1/head.1.html" target="_blank" rel="noopener noreferrer">head(1) — Linux manual page</a></p><p><a href="https://man7.org/linux/man-pages/man1/tail.1.html" target="_blank" rel="noopener noreferrer">tail(1) — Linux manual page</a></p>`,22)]))}const r=a(i,[["render",p],["__file","head-tail.html.vue"]]),t=JSON.parse('{"path":"/notes/Linux/head-tail.html","title":"head / tail","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"Following","slug":"following","link":"#following","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/head-tail.md"}');export{r as comp,t as data};
