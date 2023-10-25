import{_ as i,r as l,o as t,c,a as n,b as e,d as s,e as r}from"./app-25fa875f.js";const o={},p=r(`<h1 id="wc" tabindex="-1"><a class="header-anchor" href="#wc" aria-hidden="true">#</a> wc</h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 25 0:19</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>wc</code> 用于打印每个文件的行数、单词数和字节数。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">wc</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">wc</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
  or:  <span class="token function">wc</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. --files0-from<span class="token operator">=</span>F
Print newline, word, and byte counts <span class="token keyword">for</span> each FILE, and a total line <span class="token keyword">if</span>
<span class="token function">more</span> than one FILE is specified.  A word is a non-zero-length sequence of
characters delimited by white space.

With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.

The options below may be used to <span class="token keyword">select</span> <span class="token function">which</span> counts are printed, always <span class="token keyword">in</span>
the following order: newline, word, character, byte, maximum line length.
  -c, <span class="token parameter variable">--bytes</span>            print the byte counts
  -m, <span class="token parameter variable">--chars</span>            print the character counts
  -l, <span class="token parameter variable">--lines</span>            print the newline counts
      --files0-from<span class="token operator">=</span>F    <span class="token builtin class-name">read</span> input from the files specified by
                           NUL-terminated names <span class="token keyword">in</span> <span class="token function">file</span> F<span class="token punctuation">;</span>
                           If F is - <span class="token keyword">then</span> <span class="token builtin class-name">read</span> names from standard input
  -L, --max-line-length  print the maximum display width
  -w, <span class="token parameter variable">--words</span>            print the word counts
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

GNU coreutils online help: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span>
Full documentation at: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/wc<span class="token operator">&gt;</span>
or available locally via: info <span class="token string">&#39;(coreutils) wc invocation&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如示例所示，文件中有两行、6 个单词、23 个字节：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff

$ <span class="token function">wc</span> example.txt
 <span class="token number">2</span>  <span class="token number">6</span> <span class="token number">23</span> example.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过 <code>-l</code> / <code>-w</code> / <code>-c</code> 参数可以分别打印上述的行数、单词数、字节数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">wc</span> <span class="token parameter variable">-l</span> example.txt
<span class="token number">2</span> example.txt

$ <span class="token function">wc</span> <span class="token parameter variable">-w</span> example.txt
<span class="token number">6</span> example.txt

$ <span class="token function">wc</span> <span class="token parameter variable">-c</span> example.txt
<span class="token number">23</span> example.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-m</code> 选项用于打印 <strong>字符数</strong>。</p><p><code>-l</code> 选项可以打印长度最长的行的长度：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">wc</span> <span class="token parameter variable">-L</span> example.txt
<span class="token number">11</span> example.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,17),d={href:"https://linux.die.net/man/1/wc",target:"_blank",rel:"noopener noreferrer"},u={href:"https://www.geeksforgeeks.org/wc-command-linux-examples/",target:"_blank",rel:"noopener noreferrer"};function m(v,b){const a=l("ExternalLinkIcon");return t(),c("div",null,[p,n("p",null,[n("a",d,[e("wc(1) - Linux man page"),s(a)])]),n("p",null,[n("a",u,[e("wc command in Linux with examples"),s(a)])])])}const k=i(o,[["render",m],["__file","wc.html.vue"]]);export{k as default};
