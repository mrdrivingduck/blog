import{_ as n,c as a,a as e,o as l}from"./app-aVGbliEg.js";const i={};function t(p,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="cut" tabindex="-1"><a class="header-anchor" href="#cut"><span>cut</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 12 / 01 23:56</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>cut</code> 用于从每行文本中挑选出想要的内容。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">--help</span></span>
<span class="line">Usage: <span class="token function">cut</span> OPTION<span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.</span>
<span class="line">Print selected parts of lines from each FILE to standard output.</span>
<span class="line"></span>
<span class="line">With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.</span>
<span class="line"></span>
<span class="line">Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.</span>
<span class="line">  -b, <span class="token parameter variable">--bytes</span><span class="token operator">=</span>LIST        <span class="token keyword">select</span> only these bytes</span>
<span class="line">  -c, <span class="token parameter variable">--characters</span><span class="token operator">=</span>LIST   <span class="token keyword">select</span> only these characters</span>
<span class="line">  -d, <span class="token parameter variable">--delimiter</span><span class="token operator">=</span>DELIM   use DELIM instead of TAB <span class="token keyword">for</span> field delimiter</span>
<span class="line">  -f, <span class="token parameter variable">--fields</span><span class="token operator">=</span>LIST       <span class="token keyword">select</span> only these fields<span class="token punctuation">;</span>  also print any line</span>
<span class="line">                            that contains no delimiter character, unless</span>
<span class="line">                            the <span class="token parameter variable">-s</span> option is specified</span>
<span class="line">  <span class="token parameter variable">-n</span>                      <span class="token punctuation">(</span>ignored<span class="token punctuation">)</span></span>
<span class="line">      <span class="token parameter variable">--complement</span>        complement the <span class="token builtin class-name">set</span> of selected bytes, characters</span>
<span class="line">                            or fields</span>
<span class="line">  -s, --only-delimited    <span class="token keyword">do</span> not print lines not containing delimiters</span>
<span class="line">      --output-delimiter<span class="token operator">=</span>STRING  use STRING as the output delimiter</span>
<span class="line">                            the default is to use the input delimiter</span>
<span class="line">  -z, --zero-terminated    line delimiter is NUL, not newline</span>
<span class="line">      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span></span>
<span class="line">      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span></span>
<span class="line"></span>
<span class="line">Use one, and only one of -b, <span class="token parameter variable">-c</span> or -f.  Each LIST is made up of one</span>
<span class="line">range, or many ranges separated by commas.  Selected input is written</span>
<span class="line"><span class="token keyword">in</span> the same order that it is read, and is written exactly once.</span>
<span class="line">Each range is one of:</span>
<span class="line"></span>
<span class="line">  N     N<span class="token string">&#39;th byte, character or field, counted from 1</span>
<span class="line">  N-    from N&#39;</span>th byte, character or field, to end of line</span>
<span class="line">  N-M   from N<span class="token string">&#39;th to M&#39;</span>th <span class="token punctuation">(</span>included<span class="token punctuation">)</span> byte, character or field</span>
<span class="line">  <span class="token parameter variable">-M</span>    from first to M<span class="token string">&#39;th (included) byte, character or field</span>
<span class="line"></span>
<span class="line">GNU coreutils online help: &lt;https://www.gnu.org/software/coreutils/&gt;</span>
<span class="line">Full documentation at: &lt;https://www.gnu.org/software/coreutils/cut&gt;</span>
<span class="line">or available locally via: info &#39;</span><span class="token punctuation">(</span>coreutils<span class="token punctuation">)</span> <span class="token function">cut</span> invocation&#39;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>测试文件：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cat</span> example.txt</span>
<span class="line">aaa bb cccc</span>
<span class="line"><span class="token function">dd</span> e fffff</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按字节定位" tabindex="-1"><a class="header-anchor" href="#按字节定位"><span>按字节定位</span></a></h3><p><code>-b</code> 参数指示在每行中取出想要的字节（1 表示第一个字节）。其参数可以有如下形式：</p><ul><li>逗号分隔的枚举值</li><li>具有左右边界的范围</li><li>没有左边界的范围（从第一个字节到右边界）</li><li>没有右边界的范围（从左边界到最后一个字节）</li></ul><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1,3</span>,5 example.txt</span>
<span class="line">aab</span>
<span class="line">d</span>
<span class="line"></span>
<span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1</span>-3 example.txt</span>
<span class="line">aaa</span>
<span class="line"><span class="token function">dd</span></span>
<span class="line"></span>
<span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token number">1</span>- example.txt</span>
<span class="line">aaa bb cccc</span>
<span class="line"><span class="token function">dd</span> e fffff</span>
<span class="line"></span>
<span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">-b</span> <span class="token parameter variable">-3</span> example.txt</span>
<span class="line">aaa</span>
<span class="line"><span class="token function">dd</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按字符定位" tabindex="-1"><a class="header-anchor" href="#按字符定位"><span>按字符定位</span></a></h3><p><code>-c</code> 参数指示在每行中取出想要的字符，使用方式与 <code>-b</code> 类似。</p><h3 id="按-field-定位" tabindex="-1"><a class="header-anchor" href="#按-field-定位"><span>按 field 定位</span></a></h3><p><code>-f</code> 参数按特定分隔符来选择每一行中的 field。分隔符默认为 TAB，但可以使用 <code>-d</code> 参数指定：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt</span>
<span class="line">bb</span>
<span class="line">e</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果分隔符不存在，那么这一行也会被打印出来，除非使用 <code>-s</code> 参数。</p><h3 id="取反" tabindex="-1"><a class="header-anchor" href="#取反"><span>取反</span></a></h3><p>使用 <code>--complement</code> 用于选择出不在范围以内的所有信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">--complement</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt</span>
<span class="line">aaa cccc</span>
<span class="line"><span class="token function">dd</span> fffff</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="输出分隔符" tabindex="-1"><a class="header-anchor" href="#输出分隔符"><span>输出分隔符</span></a></h3><p>使用 <code>--output-delimiter</code> 指定输出的分隔符：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cut</span> <span class="token parameter variable">--complement</span> --output-delimiter <span class="token string">&#39;:&#39;</span> <span class="token parameter variable">-f</span> <span class="token number">2</span> <span class="token parameter variable">-d</span> <span class="token string">&#39; &#39;</span> example.txt</span>
<span class="line">aaa:cccc</span>
<span class="line">dd:fffff</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.geeksforgeeks.org/cut-command-linux-examples/" target="_blank" rel="noopener noreferrer">cut command in Linux with examples</a></p><p><a href="https://man7.org/linux/man-pages/man1/cut.1.html" target="_blank" rel="noopener noreferrer">cut(1) — Linux manual page</a></p>`,30)]))}const r=n(i,[["render",t],["__file","cut.html.vue"]]),d=JSON.parse('{"path":"/notes/Linux/cut.html","title":"cut","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[{"level":3,"title":"按字节定位","slug":"按字节定位","link":"#按字节定位","children":[]},{"level":3,"title":"按字符定位","slug":"按字符定位","link":"#按字符定位","children":[]},{"level":3,"title":"按 field 定位","slug":"按-field-定位","link":"#按-field-定位","children":[]},{"level":3,"title":"取反","slug":"取反","link":"#取反","children":[]},{"level":3,"title":"输出分隔符","slug":"输出分隔符","link":"#输出分隔符","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/cut.md"}');export{r as comp,d as data};