import{_ as i,r as l,o as d,c as r,a as n,b as a,d as s,e as c}from"./app-25fa875f.js";const t={},o=c(`<h1 id="head-tail" tabindex="-1"><a class="header-anchor" href="#head-tail" aria-hidden="true">#</a> head / tail</h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 02 23:28</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>head</code> 和 <code>tail</code> 被用于打印文件的开头部分和结尾部分至标准输出流。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><p>默认打印 10 行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">head</span> a.txt
a
b
c
d
e
f
g
h
i
j

$ <span class="token function">tail</span> a.txt
k
l
m
n
o
p
q
r
s
t
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-n</code> 参数可以指定行数，<code>-c</code> 参数可以指定字节数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">head</span> <span class="token parameter variable">-n</span> <span class="token number">3</span> a.txt
a
b
c

$ <span class="token function">tail</span> <span class="token parameter variable">-n</span> <span class="token number">3</span> a.txt
r
s
t
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">head</span> <span class="token parameter variable">-c</span> <span class="token number">2</span> a.txt
a

$ <span class="token function">tail</span> <span class="token parameter variable">-c</span> <span class="token number">2</span> a.txt
t
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="following" tabindex="-1"><a class="header-anchor" href="#following" aria-hidden="true">#</a> Following</h2><p><code>tail</code> 命令有着独特的追踪选项 <code>-f</code>，因为有时需要监控一个文件尾部的变化。</p><p><code>--retry</code> 会尝试打开一个无法被访问的文件，直到打开为止。只对初次打开文件有效：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">tail</span> <span class="token parameter variable">-f</span> <span class="token parameter variable">--retry</span> a.txt
tail: warning: <span class="token parameter variable">--retry</span> only effective <span class="token keyword">for</span> the initial <span class="token function">open</span>
tail: cannot <span class="token function">open</span> <span class="token string">&#39;a.txt&#39;</span> <span class="token keyword">for</span> reading: No such <span class="token function">file</span> or directory
tail: <span class="token string">&#39;a.txt&#39;</span> has appeared<span class="token punctuation">;</span>  following new <span class="token function">file</span>
aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>--pid=PID</code> 在指定进程退出后结束追踪模式。</p><p><code>-s</code> 指定追踪文件过程中的睡眠时间。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,20),p={href:"https://man7.org/linux/man-pages/man1/head.1.html",target:"_blank",rel:"noopener noreferrer"},v={href:"https://man7.org/linux/man-pages/man1/tail.1.html",target:"_blank",rel:"noopener noreferrer"};function u(m,b){const e=l("ExternalLinkIcon");return d(),r("div",null,[o,n("p",null,[n("a",p,[a("head(1) — Linux manual page"),s(e)])]),n("p",null,[n("a",v,[a("tail(1) — Linux manual page"),s(e)])])])}const f=i(t,[["render",u],["__file","head-tail.html.vue"]]);export{f as default};
