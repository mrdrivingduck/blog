import{_ as s,c as a,a as e,o as l}from"./app-aVGbliEg.js";const i={};function p(t,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="sort" tabindex="-1"><a class="header-anchor" href="#sort"><span>sort</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 21 23:27</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>sort</code> 用于对文件中的行进行排序。默认的排序方式是按照 ASCII 码大小排序，可以指定选项进行数值排序。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">sort</span> <span class="token parameter variable">--help</span></span>
<span class="line">Usage: <span class="token function">sort</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.</span>
<span class="line">  or:  <span class="token function">sort</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. --files0-from<span class="token operator">=</span>F</span>
<span class="line">Write sorted concatenation of all FILE<span class="token punctuation">(</span>s<span class="token punctuation">)</span> to standard output.</span>
<span class="line"></span>
<span class="line">With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.</span>
<span class="line"></span>
<span class="line">Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.</span>
<span class="line">Ordering options:</span>
<span class="line"></span>
<span class="line">  -b, --ignore-leading-blanks  ignore leading blanks</span>
<span class="line">  -d, --dictionary-order      consider only blanks and alphanumeric characters</span>
<span class="line">  -f, --ignore-case           <span class="token function">fold</span> lower <span class="token keyword">case</span> to upper <span class="token keyword">case</span> characters</span>
<span class="line">  -g, --general-numeric-sort  compare according to general numerical value</span>
<span class="line">  -i, --ignore-nonprinting    consider only printable characters</span>
<span class="line">  -M, --month-sort            compare <span class="token punctuation">(</span>unknown<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token string">&#39;JAN&#39;</span> <span class="token operator">&lt;</span> <span class="token punctuation">..</span>. <span class="token operator">&lt;</span> <span class="token string">&#39;DEC&#39;</span></span>
<span class="line">  -h, --human-numeric-sort    compare human readable numbers <span class="token punctuation">(</span>e.g., 2K 1G<span class="token punctuation">)</span></span>
<span class="line">  -n, --numeric-sort          compare according to string numerical value</span>
<span class="line">  -R, --random-sort           shuffle, but group identical keys.  See shuf<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">      --random-source<span class="token operator">=</span>FILE    get random bytes from FILE</span>
<span class="line">  -r, <span class="token parameter variable">--reverse</span>               reverse the result of comparisons</span>
<span class="line">      <span class="token parameter variable">--sort</span><span class="token operator">=</span>WORD             <span class="token function">sort</span> according to WORD:</span>
<span class="line">                                general-numeric -g, human-numeric -h, month -M,</span>
<span class="line">                                numeric -n, random -R, version <span class="token parameter variable">-V</span></span>
<span class="line">  -V, --version-sort          natural <span class="token function">sort</span> of <span class="token punctuation">(</span>version<span class="token punctuation">)</span> numbers within text</span>
<span class="line"></span>
<span class="line">Other options:</span>
<span class="line"></span>
<span class="line">      --batch-size<span class="token operator">=</span>NMERGE   merge at <span class="token function">most</span> NMERGE inputs at once<span class="token punctuation">;</span></span>
<span class="line">                            <span class="token keyword">for</span> <span class="token function">more</span> use temp files</span>
<span class="line">  -c, --check, <span class="token parameter variable">--check</span><span class="token operator">=</span>diagnose-first  check <span class="token keyword">for</span> sorted input<span class="token punctuation">;</span> <span class="token keyword">do</span> not <span class="token function">sort</span></span>
<span class="line">  -C, <span class="token parameter variable">--check</span><span class="token operator">=</span>quiet, <span class="token parameter variable">--check</span><span class="token operator">=</span>silent  like -c, but <span class="token keyword">do</span> not report first bad line</span>
<span class="line">      --compress-program<span class="token operator">=</span>PROG  compress temporaries with PROG<span class="token punctuation">;</span></span>
<span class="line">                              decompress them with PROG <span class="token parameter variable">-d</span></span>
<span class="line">      <span class="token parameter variable">--debug</span>               annotate the part of the line used to sort,</span>
<span class="line">                              and warn about questionable usage to stderr</span>
<span class="line">      --files0-from<span class="token operator">=</span>F       <span class="token builtin class-name">read</span> input from the files specified by</span>
<span class="line">                            NUL-terminated names <span class="token keyword">in</span> <span class="token function">file</span> F<span class="token punctuation">;</span></span>
<span class="line">                            If F is - <span class="token keyword">then</span> <span class="token builtin class-name">read</span> names from standard input</span>
<span class="line">  -k, <span class="token parameter variable">--key</span><span class="token operator">=</span>KEYDEF          <span class="token function">sort</span> via a key<span class="token punctuation">;</span> KEYDEF gives location and <span class="token builtin class-name">type</span></span>
<span class="line">  -m, <span class="token parameter variable">--merge</span>               merge already sorted files<span class="token punctuation">;</span> <span class="token keyword">do</span> not <span class="token function">sort</span></span>
<span class="line">  -o, <span class="token parameter variable">--output</span><span class="token operator">=</span>FILE         <span class="token function">write</span> result to FILE instead of standard output</span>
<span class="line">  -s, <span class="token parameter variable">--stable</span>              stabilize <span class="token function">sort</span> by disabling last-resort comparison</span>
<span class="line">  -S, --buffer-size<span class="token operator">=</span>SIZE    use SIZE <span class="token keyword">for</span> main memory buffer</span>
<span class="line">  -t, --field-separator<span class="token operator">=</span>SEP  use SEP instead of non-blank to blank transition</span>
<span class="line">  -T, --temporary-directory<span class="token operator">=</span>DIR  use DIR <span class="token keyword">for</span> temporaries, not <span class="token variable">$TMPDIR</span> or /tmp<span class="token punctuation">;</span></span>
<span class="line">                              multiple options specify multiple directories</span>
<span class="line">      <span class="token parameter variable">--parallel</span><span class="token operator">=</span>N          change the number of sorts run concurrently to N</span>
<span class="line">  -u, <span class="token parameter variable">--unique</span>              with -c, check <span class="token keyword">for</span> strict ordering<span class="token punctuation">;</span></span>
<span class="line">                              without -c, output only the first of an equal run</span>
<span class="line">  -z, --zero-terminated     line delimiter is NUL, not newline</span>
<span class="line">      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span></span>
<span class="line">      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span></span>
<span class="line"></span>
<span class="line">KEYDEF is F<span class="token punctuation">[</span>.C<span class="token punctuation">]</span><span class="token punctuation">[</span>OPTS<span class="token punctuation">]</span><span class="token punctuation">[</span>,F<span class="token punctuation">[</span>.C<span class="token punctuation">]</span><span class="token punctuation">[</span>OPTS<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token keyword">for</span> start and stop position, where F is a</span>
<span class="line">field number and C a character position <span class="token keyword">in</span> the field<span class="token punctuation">;</span> both are origin <span class="token number">1</span>, and</span>
<span class="line">the stop position defaults to the line<span class="token string">&#39;s end.  If neither -t nor -b is in</span>
<span class="line">effect, characters in a field are counted from the beginning of the preceding</span>
<span class="line">whitespace.  OPTS is one or more single-letter ordering options [bdfgiMhnRrV],</span>
<span class="line">which override global ordering options for that key.  If no key is given, use</span>
<span class="line">the entire line as the key.  Use --debug to diagnose incorrect key usage.</span>
<span class="line"></span>
<span class="line">SIZE may be followed by the following multiplicative suffixes:</span>
<span class="line">% 1% of memory, b 1, K 1024 (default), and so on for M, G, T, P, E, Z, Y.</span>
<span class="line"></span>
<span class="line">*** WARNING ***</span>
<span class="line">The locale specified by the environment affects sort order.</span>
<span class="line">Set LC_ALL=C to get the traditional sort order that uses</span>
<span class="line">native byte values.</span>
<span class="line"></span>
<span class="line">GNU coreutils online help: &lt;https://www.gnu.org/software/coreutils/&gt;</span>
<span class="line">Full documentation at: &lt;https://www.gnu.org/software/coreutils/sort&gt;</span>
<span class="line">or available locally via: info &#39;</span><span class="token punctuation">(</span>coreutils<span class="token punctuation">)</span> <span class="token function">sort</span> invocation&#39;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用一个测试文件 <code>example.txt</code>：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cat</span> example.txt</span>
<span class="line"><span class="token number">233</span></span>
<span class="line"><span class="token number">543</span></span>
<span class="line"><span class="token number">138</span></span>
<span class="line"><span class="token number">3556</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="降序排序" tabindex="-1"><a class="header-anchor" href="#降序排序"><span>降序排序</span></a></h3><p>使用 <code>-r</code> 选项：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">sort</span> <span class="token parameter variable">-r</span> example.txt</span>
<span class="line"><span class="token number">543</span></span>
<span class="line"><span class="token number">3556</span></span>
<span class="line"><span class="token number">233</span></span>
<span class="line"><span class="token number">138</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按数值排序" tabindex="-1"><a class="header-anchor" href="#按数值排序"><span>按数值排序</span></a></h3><p>使用 <code>-n</code> 选项：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">sort</span> <span class="token parameter variable">-n</span> example.txt</span>
<span class="line"><span class="token number">138</span></span>
<span class="line"><span class="token number">233</span></span>
<span class="line"><span class="token number">543</span></span>
<span class="line"><span class="token number">3556</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按特定列排序" tabindex="-1"><a class="header-anchor" href="#按特定列排序"><span>按特定列排序</span></a></h3><p>使用 <code>-k 2</code> 对第二列进行排序。</p><h3 id="检查是否有序" tabindex="-1"><a class="header-anchor" href="#检查是否有序"><span>检查是否有序</span></a></h3><p>使用 <code>-c</code> 参数：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">sort</span> <span class="token parameter variable">-c</span> example.txt</span>
<span class="line">sort: example.txt:3: disorder: <span class="token number">138</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="去重" tabindex="-1"><a class="header-anchor" href="#去重"><span>去重</span></a></h3><p>使用 <code>-u</code> 参数移除排序后重复的元素。</p><h3 id="归并" tabindex="-1"><a class="header-anchor" href="#归并"><span>归并</span></a></h3><p>使用 <code>-m</code> 参数合并多个已经有序的文件。</p><h3 id="性能" tabindex="-1"><a class="header-anchor" href="#性能"><span>性能</span></a></h3><p>排序时影响性能的两个重大因素：内存大小、并行度。</p><ul><li>使用 <code>-S 10G</code> / <code>-S 50%</code> 可以指定用于排序的内存大小或物理内存百分比</li><li>使用 <code>--parallel=8</code> 可以指定排序并行度</li></ul><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.geeksforgeeks.org/sort-command-linuxunix-examples/" target="_blank" rel="noopener noreferrer">SORT command in Linux/Unix with examples - GeeksforGeeks</a></p><p><a href="https://man7.org/linux/man-pages/man1/sort.1.html" target="_blank" rel="noopener noreferrer">sort(1) — Linux manual page</a></p>`,32)]))}const c=s(i,[["render",p],["__file","sort.html.vue"]]),o=JSON.parse('{"path":"/notes/Linux/sort.html","title":"sort","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[{"level":3,"title":"降序排序","slug":"降序排序","link":"#降序排序","children":[]},{"level":3,"title":"按数值排序","slug":"按数值排序","link":"#按数值排序","children":[]},{"level":3,"title":"按特定列排序","slug":"按特定列排序","link":"#按特定列排序","children":[]},{"level":3,"title":"检查是否有序","slug":"检查是否有序","link":"#检查是否有序","children":[]},{"level":3,"title":"去重","slug":"去重","link":"#去重","children":[]},{"level":3,"title":"归并","slug":"归并","link":"#归并","children":[]},{"level":3,"title":"性能","slug":"性能","link":"#性能","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/sort.md"}');export{c as comp,o as data};