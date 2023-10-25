import{_ as i,r as l,o as t,c as r,a as n,b as s,d as e,e as p}from"./app-25fa875f.js";const c={},o=p(`<h1 id="grep" tabindex="-1"><a class="header-anchor" href="#grep" aria-hidden="true">#</a> grep</h1><p>Created by : Mr Dk.</p><p>2022 / 11 / 27 14:17</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>grep</code> 用于打印文件中与给定条件匹配的行。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">grep</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. PATTERNS <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
Search <span class="token keyword">for</span> <span class="token for-or-select variable">PATTERNS</span> <span class="token keyword">in</span> each FILE.
Example: <span class="token function">grep</span> <span class="token parameter variable">-i</span> <span class="token string">&#39;hello world&#39;</span> menu.h main.c
PATTERNS can contain multiple patterns separated by newlines.

Pattern selection and interpretation:
  -E, --extended-regexp     PATTERNS are extended regular expressions
  -F, --fixed-strings       PATTERNS are strings
  -G, --basic-regexp        PATTERNS are basic regular expressions
  -P, --perl-regexp         PATTERNS are Perl regular expressions
  -e, <span class="token parameter variable">--regexp</span><span class="token operator">=</span>PATTERNS     use PATTERNS <span class="token keyword">for</span> matching
  -f, <span class="token parameter variable">--file</span><span class="token operator">=</span>FILE           take PATTERNS from FILE
  -i, --ignore-case         ignore <span class="token keyword">case</span> distinctions <span class="token keyword">in</span> patterns and data
      --no-ignore-case      <span class="token keyword">do</span> not ignore <span class="token keyword">case</span> distinctions <span class="token punctuation">(</span>default<span class="token punctuation">)</span>
  -w, --word-regexp         match only whole words
  -x, --line-regexp         match only whole lines
  -z, --null-data           a data line ends <span class="token keyword">in</span> <span class="token number">0</span> byte, not newline

Miscellaneous:
  -s, --no-messages         suppress error messages
  -v, --invert-match        <span class="token keyword">select</span> non-matching lines
  -V, <span class="token parameter variable">--version</span>             display version information and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--help</span>                display this <span class="token builtin class-name">help</span> text and <span class="token builtin class-name">exit</span>

Output control:
  -m, --max-count<span class="token operator">=</span>NUM       stop after NUM selected lines
  -b, --byte-offset         print the byte offset with output lines
  -n, --line-number         print line number with output lines
      --line-buffered       flush output on every line
  -H, --with-filename       print <span class="token function">file</span> name with output lines
  -h, --no-filename         suppress the <span class="token function">file</span> name prefix on output
      <span class="token parameter variable">--label</span><span class="token operator">=</span>LABEL         use LABEL as the standard input <span class="token function">file</span> name prefix
  -o, --only-matching       show only nonempty parts of lines that match
  -q, --quiet, <span class="token parameter variable">--silent</span>     suppress all normal output
      --binary-files<span class="token operator">=</span>TYPE   assume that binary files are TYPE<span class="token punctuation">;</span>
                            TYPE is <span class="token string">&#39;binary&#39;</span>, <span class="token string">&#39;text&#39;</span>, or <span class="token string">&#39;without-match&#39;</span>
  -a, <span class="token parameter variable">--text</span>                equivalent to --binary-files<span class="token operator">=</span>text
  <span class="token parameter variable">-I</span>                        equivalent to --binary-files<span class="token operator">=</span>without-match
  -d, <span class="token parameter variable">--directories</span><span class="token operator">=</span>ACTION  how to handle directories<span class="token punctuation">;</span>
                            ACTION is <span class="token string">&#39;read&#39;</span>, <span class="token string">&#39;recurse&#39;</span>, or <span class="token string">&#39;skip&#39;</span>
  -D, <span class="token parameter variable">--devices</span><span class="token operator">=</span>ACTION      how to handle devices, FIFOs and sockets<span class="token punctuation">;</span>
                            ACTION is <span class="token string">&#39;read&#39;</span> or <span class="token string">&#39;skip&#39;</span>
  -r, <span class="token parameter variable">--recursive</span>           like <span class="token parameter variable">--directories</span><span class="token operator">=</span>recurse
  -R, --dereference-recursive  likewise, but follow all symlinks
      <span class="token parameter variable">--include</span><span class="token operator">=</span>GLOB        search only files that match GLOB <span class="token punctuation">(</span>a <span class="token function">file</span> pattern<span class="token punctuation">)</span>
      <span class="token parameter variable">--exclude</span><span class="token operator">=</span>GLOB        skip files that match GLOB
      --exclude-from<span class="token operator">=</span>FILE   skip files that match any <span class="token function">file</span> pattern from FILE
      --exclude-dir<span class="token operator">=</span>GLOB    skip directories that match GLOB
  -L, --files-without-match  print only names of FILEs with no selected lines
  -l, --files-with-matches  print only names of FILEs with selected lines
  -c, <span class="token parameter variable">--count</span>               print only a count of selected lines per FILE
  -T, --initial-tab         <span class="token function">make</span> tabs line up <span class="token punctuation">(</span>if needed<span class="token punctuation">)</span>
  -Z, <span class="token parameter variable">--null</span>                print <span class="token number">0</span> byte after FILE name

Context control:
  -B, --before-context<span class="token operator">=</span>NUM  print NUM lines of leading context
  -A, --after-context<span class="token operator">=</span>NUM   print NUM lines of trailing context
  -C, <span class="token parameter variable">--context</span><span class="token operator">=</span>NUM         print NUM lines of output context
  <span class="token parameter variable">-NUM</span>                      same as <span class="token parameter variable">--context</span><span class="token operator">=</span>NUM
      --color<span class="token punctuation">[</span><span class="token operator">=</span>WHEN<span class="token punctuation">]</span>,
      --colour<span class="token punctuation">[</span><span class="token operator">=</span>WHEN<span class="token punctuation">]</span>       use markers to highlight the matching strings<span class="token punctuation">;</span>
                            WHEN is <span class="token string">&#39;always&#39;</span>, <span class="token string">&#39;never&#39;</span>, or <span class="token string">&#39;auto&#39;</span>
  -U, <span class="token parameter variable">--binary</span>              <span class="token keyword">do</span> not strip CR characters at EOL <span class="token punctuation">(</span>MSDOS/Windows<span class="token punctuation">)</span>

When FILE is <span class="token string">&#39;-&#39;</span>, <span class="token builtin class-name">read</span> standard input.  With no FILE, <span class="token builtin class-name">read</span> <span class="token string">&#39;.&#39;</span> <span class="token keyword">if</span>
recursive, <span class="token string">&#39;-&#39;</span> otherwise.  With fewer than two FILEs, assume -h.
Exit status is <span class="token number">0</span> <span class="token keyword">if</span> any line <span class="token punctuation">(</span>or <span class="token function">file</span> <span class="token keyword">if</span> -L<span class="token punctuation">)</span> is selected, <span class="token number">1</span> otherwise<span class="token punctuation">;</span>
<span class="token keyword">if</span> any error occurs and <span class="token parameter variable">-q</span> is not given, the <span class="token builtin class-name">exit</span> status is <span class="token number">2</span>.

Report bugs to: bug-grep@gnu.org
GNU <span class="token function">grep</span> home page: <span class="token operator">&lt;</span>http://www.gnu.org/software/grep/<span class="token operator">&gt;</span>
General <span class="token builtin class-name">help</span> using GNU software: <span class="token operator">&lt;</span>https://www.gnu.org/gethelp/<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="example" tabindex="-1"><a class="header-anchor" href="#example" aria-hidden="true">#</a> Example</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="output" tabindex="-1"><a class="header-anchor" href="#output" aria-hidden="true">#</a> Output</h3><p>以下选项影响输出内容。</p><p><code>-v</code> 打印 <strong>不匹配</strong> 的内容。</p><p><code>-c</code> 参数打印匹配的行数，而不是匹配的行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-c</span> bb example.txt
<span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-l</code> / <code>-L</code> 打印匹配或不匹配条件的文件名：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-l</span> bb example.txt
example.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-o</code> 只打印匹配的模式串，而不是一整行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-o</span> bb example.txt
bb
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-n</code> 额外打印匹配上的文件行号：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-n</span> bb example.txt
<span class="token number">1</span>:aaa bb cccc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-A</code> / <code>-B</code> / <code>-C</code> 打印匹配位置的前 / 后 / 前后 N 行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-A1</span> bb example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="matching" tabindex="-1"><a class="header-anchor" href="#matching" aria-hidden="true">#</a> Matching</h3><p><code>-R</code> 参数递归匹配目录下的所有文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-R</span> <span class="token parameter variable">-l</span> bb ./
./.oh-my-zsh/tools/upgrade.sh
./.oh-my-zsh/tools/changelog.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-i</code> 参数在匹配时忽视大小写：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-i</span> BB example.txt
aaa bb cccc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-w</code> / <code>-x</code> 只匹配整个词或整行，而不是匹配子串：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-w</span> b example.txt

$ <span class="token function">grep</span> <span class="token parameter variable">-w</span> bb example.txt
aaa bb cccc

$ <span class="token function">grep</span> <span class="token parameter variable">-x</span> <span class="token string">&#39;bb&#39;</span> example.txt

$ <span class="token function">grep</span> <span class="token parameter variable">-x</span> <span class="token string">&#39;aaa bb cccc&#39;</span> example.txt
aaa bb cccc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>grep</code> 实际上可以使用正则表达式进行匹配：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token string">&#39;^aaa&#39;</span> example.txt
aaa bb cccc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-e</code> 参数指定多个正则表达式：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-e</span> <span class="token string">&#39;^aaa&#39;</span> <span class="token parameter variable">-e</span> <span class="token string">&#39;f$&#39;</span>  example.txt
aaa bb cccc
<span class="token function">dd</span> e fffff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>也可以直接把正则表达式写到一个文件里，然后通过 <code>-f</code> 参数引用：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">grep</span> <span class="token parameter variable">-f</span> pattern.txt  example.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,38),d={href:"https://www.geeksforgeeks.org/grep-command-in-unixlinux/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://man7.org/linux/man-pages/man1/grep.1.html",target:"_blank",rel:"noopener noreferrer"};function v(b,m){const a=l("ExternalLinkIcon");return t(),r("div",null,[o,n("p",null,[n("a",d,[s("grep command in Unix/Linux"),e(a)])]),n("p",null,[n("a",u,[s("grep(1) — Linux manual page"),e(a)])])])}const h=i(c,[["render",v],["__file","grep.html.vue"]]);export{h as default};
