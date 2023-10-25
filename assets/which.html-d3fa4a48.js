import{_ as s,r as e,o as i,c as r,a as n,b as c,d as o,e as t}from"./app-25fa875f.js";const l={},d=t(`<h1 id="which" tabindex="-1"><a class="header-anchor" href="#which" aria-hidden="true">#</a> which</h1><p>Created by : Mr Dk.</p><p>2022 / 10 / 29 11:35</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>which</code> 命令用于在环境变量 <code>PATH</code> 中寻找某个可执行文件的绝对路径。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><p><code>which</code> 默认返回可执行文件在 <code>PATH</code> 中找到的第一个绝对路径。如果想要输出所有的匹配，需要添加选项 <code>-a</code>：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">which</span> <span class="token function">touch</span>
/usr/bin/touch

$ <span class="token function">which</span> <span class="token parameter variable">-a</span> <span class="token function">touch</span>
/usr/bin/touch
/bin/touch
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有时出现两个匹配可能是因为存在符号链接，但也有可能是有两个同名的可执行文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">which</span> <span class="token parameter variable">-a</span> <span class="token function">touch</span>
/usr/bin/touch
/bin/touch

$ <span class="token function">ls</span> <span class="token parameter variable">-alt</span> /usr/bin/touch
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">100728</span> Sep  <span class="token number">5</span>  <span class="token number">2019</span> /usr/bin/touch

$ <span class="token function">ls</span> <span class="token parameter variable">-alt</span> /bin/touch
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">100728</span> Sep  <span class="token number">5</span>  <span class="token number">2019</span> /bin/touch
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">which</span> <span class="token parameter variable">-a</span> atq
/usr/bin/atq
/bin/atq

$ <span class="token function">ls</span> <span class="token parameter variable">-alt</span> /usr/bin/atq
lrwxrwxrwx <span class="token number">1</span> root root <span class="token number">2</span> Nov <span class="token number">13</span>  <span class="token number">2018</span> /usr/bin/atq -<span class="token operator">&gt;</span> at

$ <span class="token function">ls</span> <span class="token parameter variable">-alt</span> /bin/atq
lrwxrwxrwx <span class="token number">1</span> root root <span class="token number">2</span> Nov <span class="token number">13</span>  <span class="token number">2018</span> /bin/atq -<span class="token operator">&gt;</span> at
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,14),p={href:"https://phoenixnap.com/kb/which-command-linux",target:"_blank",rel:"noopener noreferrer"};function u(h,b){const a=e("ExternalLinkIcon");return i(),r("div",null,[d,n("p",null,[n("a",p,[c("How to Use the which Command in Linux"),o(a)])])])}const m=s(l,[["render",u],["__file","which.html.vue"]]);export{m as default};
