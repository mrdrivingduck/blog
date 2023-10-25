import{_ as i,r as t,o as l,c as r,a,b as e,d as s,e as c}from"./app-25fa875f.js";const d={},o=c(`<h1 id="cut" tabindex="-1"><a class="header-anchor" href="#cut" aria-hidden="true">#</a> cut</h1><p>Created by : Mr Dk.</p><p>2022 / 12 / 01 23:56</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>cut</code> 用于从每行文本中挑选出想要的内容。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cut</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">cut</span> OPTION<span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
Print selected parts of lines from each FILE to standard output.

With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.
  -b, <span class="token parameter variable">--bytes</span><span class="token operator">=</span>LIST        <span class="token keyword">select</span> only these bytes
  -c, <span class="token parameter variable">--characters</span><span class="token operator">=</span>LIST   <span class="token keyword">select</span> only these characters
  -d, <span class="token parameter variable">--delimiter</span><span class="token operator">=</span>DELIM   use DELIM instead of TAB <span class="token keyword">for</span> field delimiter
  -f, <span class="token parameter variable">--fields</span><span class="token operator">=</span>LIST       <span class="token keyword">select</span> only these fields<span class="token punctuation">;</span>  also print any line
                            that contains no delimiter character, unless
                            the <span class="token parameter variable">-s</span> option is specified
  <span class="token parameter variable">-n</span>                      <span class="token punctuation">(</span>ignored<span class="token punctuation">)</span>
      <span class="token parameter variable">--complement</span>        complement the <span class="token builtin class-name">set</span> of selected bytes, characters
                            or fields
  -s, --only-delimited    <span class="token keyword">do</span> not print lines not containing delimiters
      --output-delimiter<span class="token operator">=</span>STRING  use STRING as the output delimiter
                            the default is to use the input delimiter
  -z, --zero-terminated    line delimiter is NUL, not newline
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

Use one, and only one of -b, <span class="token parameter variable">-c</span> or -f.  Each LIST is made up of one
range, or many ranges separated by commas.  Selected input is written
<span class="token keyword">in</span> the same order that it is read, and is written exactly once.
Each range is one of:

  N     N<span class="token string">&#39;th byte, character or field, counted from 1
  N-    from N&#39;</span>th byte, character or field, to end of line
  N-M   from N<span class="token string">&#39;th to M&#39;</span>th <span class="token punctuation">(</span>included<span class="token punctuation">)</span> byte, character or field
  <span class="token parameter variable">-M</span>    from first to M<span class="token string">&#39;th (included) byte, character or field

GNU coreutils online help: &lt;https://www.gnu.org/software/coreutils/&gt;
Full documentation at: &lt;https://www.gnu.org/software/coreutils/cut&gt;
or available locally via: info &#39;</span><span class="token punctuation">(</span>coreutils<span class="token punctuation">)</span> <span class="token function">cut</span> invocation&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>测试文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按字节定位" tabindex="-1"><a class="header-anchor" href="#按字节定位" aria-hidden="true">#</a> 按字节定位</h3><p><code>-b</code> 参数指示在每行中取出想要的字节（1 表示第一个字节）。其参数可以有如下形式：</p><ul><li>逗号分隔的枚举值</li><li>具有左右边界的范围</li><li>没有左边界的范围（从第一个字节到右边界）</li><li>没有右边界的范围（从左边界到最后一个字节）</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1,3</span>,5 example.txt
aab
d

$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1</span>-3 example.txt
aaa
<span class="token function">dd</span>

$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1</span>- example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff

$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token parameter variable">-3</span> example.txt
aaa
<span class="token function">dd</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按字符定位" tabindex="-1"><a class="header-anchor" href="#按字符定位" aria-hidden="true">#</a> 按字符定位</h3><p><code>-c</code> 参数指示在每行中取出想要的字符，使用方式与 <code>-b</code> 类似。</p><h3 id="按-field-定位" tabindex="-1"><a class="header-anchor" href="#按-field-定位" aria-hidden="true">#</a> 按 field 定位</h3><p><code>-f</code> 参数按特定分隔符来选择每一行中的 field。分隔符默认为 TAB，但可以使用 <code>-d</code> 参数指定：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cut</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt
bb
e
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果分隔符不存在，那么这一行也会被打印出来，除非使用 <code>-s</code> 参数。</p><h3 id="取反" tabindex="-1"><a class="header-anchor" href="#取反" aria-hidden="true">#</a> 取反</h3><p>使用 <code>--complement</code> 用于选择出不在范围以内的所有信息：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cut</span> <span class="token parameter variable">--complement</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt
aaa cccc
<span class="token function">dd</span> fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="输出分隔符" tabindex="-1"><a class="header-anchor" href="#输出分隔符" aria-hidden="true">#</a> 输出分隔符</h3><p>使用 <code>--output-delimiter</code> 指定输出的分隔符：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cut</span> <span class="token parameter variable">--complement</span> --output-delimiter <span class="token string">&#39;:&#39;</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt
aaa:cccc
dd:fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,28),p={href:"https://www.geeksforgeeks.org/cut-command-linux-examples/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://man7.org/linux/man-pages/man1/cut.1.html",target:"_blank",rel:"noopener noreferrer"};function v(m,b){const n=t("ExternalLinkIcon");return l(),r("div",null,[o,a("p",null,[a("a",p,[e("cut command in Linux with examples"),s(n)])]),a("p",null,[a("a",u,[e("cut(1) — Linux manual page"),s(n)])])])}const k=i(d,[["render",v],["__file","cut.html.vue"]]);export{k as default};
