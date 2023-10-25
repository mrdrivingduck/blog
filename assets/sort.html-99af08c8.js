import{_ as i,r as t,o as r,c as o,a as n,b as a,d as e,e as l}from"./app-25fa875f.js";const c={},p=l(`<h1 id="sort" tabindex="-1"><a class="header-anchor" href="#sort" aria-hidden="true">#</a> sort</h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 21 23:27</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>sort</code> 用于对文件中的行进行排序。默认的排序方式是按照 ASCII 码大小排序，可以指定选项进行数值排序。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sort</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">sort</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
  or:  <span class="token function">sort</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. --files0-from<span class="token operator">=</span>F
Write sorted concatenation of all FILE<span class="token punctuation">(</span>s<span class="token punctuation">)</span> to standard output.

With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.
Ordering options:

  -b, --ignore-leading-blanks  ignore leading blanks
  -d, --dictionary-order      consider only blanks and alphanumeric characters
  -f, --ignore-case           <span class="token function">fold</span> lower <span class="token keyword">case</span> to upper <span class="token keyword">case</span> characters
  -g, --general-numeric-sort  compare according to general numerical value
  -i, --ignore-nonprinting    consider only printable characters
  -M, --month-sort            compare <span class="token punctuation">(</span>unknown<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token string">&#39;JAN&#39;</span> <span class="token operator">&lt;</span> <span class="token punctuation">..</span>. <span class="token operator">&lt;</span> <span class="token string">&#39;DEC&#39;</span>
  -h, --human-numeric-sort    compare human readable numbers <span class="token punctuation">(</span>e.g., 2K 1G<span class="token punctuation">)</span>
  -n, --numeric-sort          compare according to string numerical value
  -R, --random-sort           shuffle, but group identical keys.  See shuf<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
      --random-source<span class="token operator">=</span>FILE    get random bytes from FILE
  -r, <span class="token parameter variable">--reverse</span>               reverse the result of comparisons
      <span class="token parameter variable">--sort</span><span class="token operator">=</span>WORD             <span class="token function">sort</span> according to WORD:
                                general-numeric -g, human-numeric -h, month -M,
                                numeric -n, random -R, version <span class="token parameter variable">-V</span>
  -V, --version-sort          natural <span class="token function">sort</span> of <span class="token punctuation">(</span>version<span class="token punctuation">)</span> numbers within text

Other options:

      --batch-size<span class="token operator">=</span>NMERGE   merge at <span class="token function">most</span> NMERGE inputs at once<span class="token punctuation">;</span>
                            <span class="token keyword">for</span> <span class="token function">more</span> use temp files
  -c, --check, <span class="token parameter variable">--check</span><span class="token operator">=</span>diagnose-first  check <span class="token keyword">for</span> sorted input<span class="token punctuation">;</span> <span class="token keyword">do</span> not <span class="token function">sort</span>
  -C, <span class="token parameter variable">--check</span><span class="token operator">=</span>quiet, <span class="token parameter variable">--check</span><span class="token operator">=</span>silent  like -c, but <span class="token keyword">do</span> not report first bad line
      --compress-program<span class="token operator">=</span>PROG  compress temporaries with PROG<span class="token punctuation">;</span>
                              decompress them with PROG <span class="token parameter variable">-d</span>
      <span class="token parameter variable">--debug</span>               annotate the part of the line used to sort,
                              and warn about questionable usage to stderr
      --files0-from<span class="token operator">=</span>F       <span class="token builtin class-name">read</span> input from the files specified by
                            NUL-terminated names <span class="token keyword">in</span> <span class="token function">file</span> F<span class="token punctuation">;</span>
                            If F is - <span class="token keyword">then</span> <span class="token builtin class-name">read</span> names from standard input
  -k, <span class="token parameter variable">--key</span><span class="token operator">=</span>KEYDEF          <span class="token function">sort</span> via a key<span class="token punctuation">;</span> KEYDEF gives location and <span class="token builtin class-name">type</span>
  -m, <span class="token parameter variable">--merge</span>               merge already sorted files<span class="token punctuation">;</span> <span class="token keyword">do</span> not <span class="token function">sort</span>
  -o, <span class="token parameter variable">--output</span><span class="token operator">=</span>FILE         <span class="token function">write</span> result to FILE instead of standard output
  -s, <span class="token parameter variable">--stable</span>              stabilize <span class="token function">sort</span> by disabling last-resort comparison
  -S, --buffer-size<span class="token operator">=</span>SIZE    use SIZE <span class="token keyword">for</span> main memory buffer
  -t, --field-separator<span class="token operator">=</span>SEP  use SEP instead of non-blank to blank transition
  -T, --temporary-directory<span class="token operator">=</span>DIR  use DIR <span class="token keyword">for</span> temporaries, not <span class="token variable">$TMPDIR</span> or /tmp<span class="token punctuation">;</span>
                              multiple options specify multiple directories
      <span class="token parameter variable">--parallel</span><span class="token operator">=</span>N          change the number of sorts run concurrently to N
  -u, <span class="token parameter variable">--unique</span>              with -c, check <span class="token keyword">for</span> strict ordering<span class="token punctuation">;</span>
                              without -c, output only the first of an equal run
  -z, --zero-terminated     line delimiter is NUL, not newline
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

KEYDEF is F<span class="token punctuation">[</span>.C<span class="token punctuation">]</span><span class="token punctuation">[</span>OPTS<span class="token punctuation">]</span><span class="token punctuation">[</span>,F<span class="token punctuation">[</span>.C<span class="token punctuation">]</span><span class="token punctuation">[</span>OPTS<span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token keyword">for</span> start and stop position, where F is a
field number and C a character position <span class="token keyword">in</span> the field<span class="token punctuation">;</span> both are origin <span class="token number">1</span>, and
the stop position defaults to the line<span class="token string">&#39;s end.  If neither -t nor -b is in
effect, characters in a field are counted from the beginning of the preceding
whitespace.  OPTS is one or more single-letter ordering options [bdfgiMhnRrV],
which override global ordering options for that key.  If no key is given, use
the entire line as the key.  Use --debug to diagnose incorrect key usage.

SIZE may be followed by the following multiplicative suffixes:
% 1% of memory, b 1, K 1024 (default), and so on for M, G, T, P, E, Z, Y.

*** WARNING ***
The locale specified by the environment affects sort order.
Set LC_ALL=C to get the traditional sort order that uses
native byte values.

GNU coreutils online help: &lt;https://www.gnu.org/software/coreutils/&gt;
Full documentation at: &lt;https://www.gnu.org/software/coreutils/sort&gt;
or available locally via: info &#39;</span><span class="token punctuation">(</span>coreutils<span class="token punctuation">)</span> <span class="token function">sort</span> invocation&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用一个测试文件 <code>example.txt</code>：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> example.txt
<span class="token number">233</span>
<span class="token number">543</span>
<span class="token number">138</span>
<span class="token number">3556</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="降序排序" tabindex="-1"><a class="header-anchor" href="#降序排序" aria-hidden="true">#</a> 降序排序</h3><p>使用 <code>-r</code> 选项：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sort</span> <span class="token parameter variable">-r</span> example.txt
<span class="token number">543</span>
<span class="token number">3556</span>
<span class="token number">233</span>
<span class="token number">138</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按数值排序" tabindex="-1"><a class="header-anchor" href="#按数值排序" aria-hidden="true">#</a> 按数值排序</h3><p>使用 <code>-n</code> 选项：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sort</span> <span class="token parameter variable">-n</span> example.txt
<span class="token number">138</span>
<span class="token number">233</span>
<span class="token number">543</span>
<span class="token number">3556</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="按特定列排序" tabindex="-1"><a class="header-anchor" href="#按特定列排序" aria-hidden="true">#</a> 按特定列排序</h3><p>使用 <code>-k 2</code> 对第二列进行排序。</p><h3 id="检查是否有序" tabindex="-1"><a class="header-anchor" href="#检查是否有序" aria-hidden="true">#</a> 检查是否有序</h3><p>使用 <code>-c</code> 参数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sort</span> <span class="token parameter variable">-c</span> example.txt
sort: example.txt:3: disorder: <span class="token number">138</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="去重" tabindex="-1"><a class="header-anchor" href="#去重" aria-hidden="true">#</a> 去重</h3><p>使用 <code>-u</code> 参数移除排序后重复的元素。</p><h3 id="归并" tabindex="-1"><a class="header-anchor" href="#归并" aria-hidden="true">#</a> 归并</h3><p>使用 <code>-m</code> 参数合并多个已经有序的文件。</p><h3 id="性能" tabindex="-1"><a class="header-anchor" href="#性能" aria-hidden="true">#</a> 性能</h3><p>排序时影响性能的两个重大因素：内存大小、并行度。</p><ul><li>使用 <code>-S 10G</code> / <code>-S 50%</code> 可以指定用于排序的内存大小或物理内存百分比</li><li>使用 <code>--parallel=8</code> 可以指定排序并行度</li></ul><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,30),d={href:"https://www.geeksforgeeks.org/sort-command-linuxunix-examples/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://man7.org/linux/man-pages/man1/sort.1.html",target:"_blank",rel:"noopener noreferrer"};function v(m,b){const s=t("ExternalLinkIcon");return r(),o("div",null,[p,n("p",null,[n("a",d,[a("SORT command in Linux/Unix with examples - GeeksforGeeks"),e(s)])]),n("p",null,[n("a",u,[a("sort(1) — Linux manual page"),e(s)])])])}const h=i(c,[["render",v],["__file","sort.html.vue"]]);export{h as default};
