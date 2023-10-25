import{_ as i,r as l,o as t,c,a,b as s,d as e,e as r}from"./app-25fa875f.js";const o={},d=r(`<h1 id="uniq" tabindex="-1"><a class="header-anchor" href="#uniq" aria-hidden="true">#</a> uniq</h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 14 0:18</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>uniq</code> 用来对输入做按行为单位的去重。实现过去重算法的人都清楚，想要真正实现去重，输入必须是排过序的，这样重复元素一定会在相邻的位置排列，从而被方便地移除。<code>uniq</code> 只实现去重，并不管排序。在绝大部分情况下，<code>uniq</code> 可能需要与 <code>sort</code> 搭配使用，才能起到预期的效果。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">uniq</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>INPUT <span class="token punctuation">[</span>OUTPUT<span class="token punctuation">]</span><span class="token punctuation">]</span>
Filter adjacent matching lines from INPUT <span class="token punctuation">(</span>or standard input<span class="token punctuation">)</span>,
writing to OUTPUT <span class="token punctuation">(</span>or standard output<span class="token punctuation">)</span>.

With no options, matching lines are merged to the first occurrence.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.
  -c, <span class="token parameter variable">--count</span>           prefix lines by the number of occurrences
  -d, <span class="token parameter variable">--repeated</span>        only print duplicate lines, one <span class="token keyword">for</span> each group
  <span class="token parameter variable">-D</span>                    print all duplicate lines
      --all-repeated<span class="token punctuation">[</span><span class="token operator">=</span>METHOD<span class="token punctuation">]</span>  like -D, but allow separating <span class="token function">groups</span>
                                 with an empty line<span class="token punctuation">;</span>
                                 <span class="token assign-left variable">METHOD</span><span class="token operator">=</span><span class="token punctuation">{</span>none<span class="token punctuation">(</span>default<span class="token punctuation">)</span>,prepend,separate<span class="token punctuation">}</span>
  -f, --skip-fields<span class="token operator">=</span>N   avoid comparing the first N fields
      --group<span class="token punctuation">[</span><span class="token operator">=</span>METHOD<span class="token punctuation">]</span>  show all items, separating <span class="token function">groups</span> with an empty line<span class="token punctuation">;</span>
                          <span class="token assign-left variable">METHOD</span><span class="token operator">=</span><span class="token punctuation">{</span>separate<span class="token punctuation">(</span>default<span class="token punctuation">)</span>,prepend,append,both<span class="token punctuation">}</span>
  -i, --ignore-case     ignore differences <span class="token keyword">in</span> <span class="token keyword">case</span> when comparing
  -s, --skip-chars<span class="token operator">=</span>N    avoid comparing the first N characters
  -u, <span class="token parameter variable">--unique</span>          only print unique lines
  -z, --zero-terminated     line delimiter is NUL, not newline
  -w, --check-chars<span class="token operator">=</span>N   compare no <span class="token function">more</span> than N characters <span class="token keyword">in</span> lines
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

A field is a run of blanks <span class="token punctuation">(</span>usually spaces and/or TABs<span class="token punctuation">)</span>, <span class="token keyword">then</span> non-blank
characters.  Fields are skipped before chars.

Note: <span class="token string">&#39;uniq&#39;</span> does not detect repeated lines unless they are adjacent.
You may want to <span class="token function">sort</span> the input first, or use <span class="token string">&#39;sort -u&#39;</span> without <span class="token string">&#39;uniq&#39;</span><span class="token builtin class-name">.</span>
Also, comparisons honor the rules specified by <span class="token string">&#39;LC_COLLATE&#39;</span><span class="token builtin class-name">.</span>

GNU coreutils online help: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span>
Full documentation at: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/uniq<span class="token operator">&gt;</span>
or available locally via: info <span class="token string">&#39;(coreutils) uniq invocation&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用一个测试文件 <code>example.txt</code>：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>aaa aaa aaa
aaa aaa aaa
bbb aaa aaa
bbb aaa aaa
ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="输出重复次数" tabindex="-1"><a class="header-anchor" href="#输出重复次数" aria-hidden="true">#</a> 输出重复次数</h3><p>使用 <code>-c</code> 参数可以输出每个唯一行的重复次数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-c</span> example.txt
      <span class="token number">2</span> aaa aaa aaa
      <span class="token number">2</span> bbb aaa aaa
      <span class="token number">1</span> ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="输出行" tabindex="-1"><a class="header-anchor" href="#输出行" aria-hidden="true">#</a> 输出行</h3><p><code>-D</code> 参数可以输出所有 <strong>重复</strong> 的行，但不做去重：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-D</span> example.txt
aaa aaa aaa
aaa aaa aaa
bbb aaa aaa
bbb aaa aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-d</code> 参数可以输出所有 <strong>重复</strong> 的行，并做去重：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-d</span> example.txt
aaa aaa aaa
bbb aaa aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-u</code> 参数可以输出所有的 <strong>唯一</strong> 行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-u</span> example.txt
ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="非完整行去重" tabindex="-1"><a class="header-anchor" href="#非完整行去重" aria-hidden="true">#</a> 非完整行去重</h3><p>使用 <code>-f N</code> 参数可以在开始比较行的唯一性之前跳过 <code>N</code> 个域（空格分隔开的字符组为一个域）。在上述示例中，每行忽略第一个字符组并去重后，应当只会有两个唯一的字符组。以下输出就是两个字符组的 leader：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-f</span> <span class="token number">1</span> example.txt
aaa aaa aaa
ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>-s N</code> 参数可以在开始比较行的唯一性之前跳过 <code>N</code> 个字符。与 <code>-f</code> 选项类似：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-s</span> <span class="token number">4</span> example.txt
aaa aaa aaa
ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>-w N</code> 参数可以只使用前 <code>N</code> 个字符来比较行的唯一性：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">uniq</span> <span class="token parameter variable">-w</span> <span class="token number">3</span> example.txt
aaa aaa aaa
bbb aaa aaa
ccc aaa
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>-i</code> 参数可以在进行行比较时忽略大小写。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,30),p={href:"https://www.geeksforgeeks.org/uniq-command-in-linux-with-examples/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://man7.org/linux/man-pages/man1/uniq.1.html",target:"_blank",rel:"noopener noreferrer"};function v(b,m){const n=l("ExternalLinkIcon");return t(),c("div",null,[d,a("p",null,[a("a",p,[s("uniq Command in LINUX with examples - GeeksforGeeks"),e(n)])]),a("p",null,[a("a",u,[s("uniq(1) — Linux manual page"),e(n)])])])}const k=i(o,[["render",v],["__file","uniq.html.vue"]]);export{k as default};
