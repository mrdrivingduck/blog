import{_ as i,r as l,o as t,c as r,a as n,b as e,d as a,e as o}from"./app-25fa875f.js";const c={},d=o(`<h1 id="du" tabindex="-1"><a class="header-anchor" href="#du" aria-hidden="true">#</a> du</h1><p>Created by : Mr Dk.</p><p>2023 / 01 / 01 23:11</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>du</code> 用于查看文件的空间使用量。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">du</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
  or:  <span class="token function">du</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. --files0-from<span class="token operator">=</span>F
Summarize disk usage of the <span class="token builtin class-name">set</span> of FILEs, recursively <span class="token keyword">for</span> directories.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.
  -0, <span class="token parameter variable">--null</span>            end each output line with NUL, not newline
  -a, <span class="token parameter variable">--all</span>             <span class="token function">write</span> counts <span class="token keyword">for</span> all files, not just directories
      --apparent-size   print apparent sizes, rather than disk usage<span class="token punctuation">;</span> although
                          the apparent size is usually smaller, it may be
                          larger due to holes <span class="token keyword">in</span> <span class="token punctuation">(</span><span class="token string">&#39;sparse&#39;</span><span class="token punctuation">)</span> files, internal
                          fragmentation, indirect blocks, and the like
  -B, --block-size<span class="token operator">=</span>SIZE  scale sizes by SIZE before printing them<span class="token punctuation">;</span> e.g.,
                           <span class="token string">&#39;-BM&#39;</span> prints sizes <span class="token keyword">in</span> <span class="token function">units</span> of <span class="token number">1,048</span>,576 bytes<span class="token punctuation">;</span>
                           see SIZE <span class="token function">format</span> below
  -b, <span class="token parameter variable">--bytes</span>           equivalent to <span class="token string">&#39;--apparent-size --block-size=1&#39;</span>
  -c, <span class="token parameter variable">--total</span>           produce a grand total
  -D, --dereference-args  dereference only symlinks that are listed on the
                          <span class="token builtin class-name">command</span> line
  -d, --max-depth<span class="token operator">=</span>N     print the total <span class="token keyword">for</span> a directory <span class="token punctuation">(</span>or file, with --all<span class="token punctuation">)</span>
                          only <span class="token keyword">if</span> it is N or fewer levels below the <span class="token builtin class-name">command</span>
                          line argument<span class="token punctuation">;</span>  --max-depth<span class="token operator">=</span><span class="token number">0</span> is the same as
                          <span class="token parameter variable">--summarize</span>
      --files0-from<span class="token operator">=</span>F   summarize disk usage of the
                          NUL-terminated <span class="token function">file</span> names specified <span class="token keyword">in</span> <span class="token function">file</span> F<span class="token punctuation">;</span>
                          <span class="token keyword">if</span> F is -, <span class="token keyword">then</span> <span class="token builtin class-name">read</span> names from standard input
  <span class="token parameter variable">-H</span>                    equivalent to --dereference-args <span class="token punctuation">(</span>-D<span class="token punctuation">)</span>
  -h, --human-readable  print sizes <span class="token keyword">in</span> human readable <span class="token function">format</span> <span class="token punctuation">(</span>e.g., 1K 234M 2G<span class="token punctuation">)</span>
      <span class="token parameter variable">--inodes</span>          list inode usage information instead of block usage
  <span class="token parameter variable">-k</span>                    like --block-size<span class="token operator">=</span>1K
  -L, <span class="token parameter variable">--dereference</span>     dereference all symbolic links
  -l, --count-links     count sizes many <span class="token builtin class-name">times</span> <span class="token keyword">if</span> hard linked
  <span class="token parameter variable">-m</span>                    like --block-size<span class="token operator">=</span>1M
  -P, --no-dereference  don<span class="token string">&#39;t follow any symbolic links (this is the default)
  -S, --separate-dirs   for directories do not include size of subdirectories
      --si              like -h, but use powers of 1000 not 1024
  -s, --summarize       display only a total for each argument
  -t, --threshold=SIZE  exclude entries smaller than SIZE if positive,
                          or entries greater than SIZE if negative
      --time            show time of the last modification of any file in the
                          directory, or any of its subdirectories
      --time=WORD       show time as WORD instead of modification time:
                          atime, access, use, ctime or status
      --time-style=STYLE  show times using STYLE, which can be:
                            full-iso, long-iso, iso, or +FORMAT;
                            FORMAT is interpreted like in &#39;</span><span class="token function">date</span><span class="token string">&#39;
  -X, --exclude-from=FILE  exclude files that match any pattern in FILE
      --exclude=PATTERN    exclude files that match PATTERN
  -x, --one-file-system    skip directories on different file systems
      --help     display this help and exit
      --version  output version information and exit

Display values are in units of the first available SIZE from --block-size,
and the DU_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE environment variables.
Otherwise, units default to 1024 bytes (or 512 if POSIXLY_CORRECT is set).

The SIZE argument is an integer and optional unit (example: 10K is 10*1024).
Units are K,M,G,T,P,E,Z,Y (powers of 1024) or KB,MB,... (powers of 1000).

GNU coreutils online help: &lt;https://www.gnu.org/software/coreutils/&gt;
Full documentation at: &lt;https://www.gnu.org/software/coreutils/du&gt;
or available locally via: info &#39;</span><span class="token punctuation">(</span>coreutils<span class="token punctuation">)</span> <span class="token function">du</span> invocation&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="打印当前目录下所有子目录的空间占用" tabindex="-1"><a class="header-anchor" href="#打印当前目录下所有子目录的空间占用" aria-hidden="true">#</a> 打印当前目录下所有子目录的空间占用</h3><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span>
<span class="token number">4</span>       ./certbot/2582
<span class="token number">4</span>       ./certbot/2618
<span class="token number">4</span>       ./certbot/common
<span class="token number">16</span>      ./certbot
<span class="token number">20</span>      <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果也需要打印文件的大小占用，则使用 <code>-a</code> 参数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">-a</span>
<span class="token number">4</span>       ./certbot/2582
<span class="token number">4</span>       ./certbot/2618
<span class="token number">4</span>       ./certbot/common
<span class="token number">0</span>       ./certbot/current
<span class="token number">16</span>      ./certbot
<span class="token number">20</span>      <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="以人类可读的格式打印" tabindex="-1"><a class="header-anchor" href="#以人类可读的格式打印" aria-hidden="true">#</a> 以人类可读的格式打印</h3><p>使用 <code>-h</code> 参数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">-h</span>
<span class="token number">4</span>.0K    ./certbot/2582
<span class="token number">4</span>.0K    ./certbot/2618
<span class="token number">4</span>.0K    ./certbot/common
16K     ./certbot
20K     <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="打印文件的最后修改时间" tabindex="-1"><a class="header-anchor" href="#打印文件的最后修改时间" aria-hidden="true">#</a> 打印文件的最后修改时间</h3><p>使用 <code>--time</code> 参数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">-h</span> <span class="token parameter variable">--time</span>
<span class="token number">4</span>.0K    <span class="token number">2022</span>-03-03 <span class="token number">10</span>:15        ./certbot/2582
<span class="token number">4</span>.0K    <span class="token number">2022</span>-03-03 <span class="token number">10</span>:15        ./certbot/2618
<span class="token number">4</span>.0K    <span class="token number">2022</span>-03-03 <span class="token number">10</span>:15        ./certbot/common
16K     <span class="token number">2022</span>-12-17 08:07        ./certbot
20K     <span class="token number">2022</span>-12-17 08:07        <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="递归深度控制" tabindex="-1"><a class="header-anchor" href="#递归深度控制" aria-hidden="true">#</a> 递归深度控制</h3><p>当什么参数都不加时，默认递归到最深层。</p><p>使用 <code>-d</code> 参数可以指定递归的最深层层数：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">-h</span> <span class="token parameter variable">-d</span> <span class="token number">1</span>
16K     ./certbot
20K     <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>-s</code> 参数可以只递归到当前层，等价于 <code>-d 0</code>：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">du</span> <span class="token parameter variable">-h</span> <span class="token parameter variable">-s</span>
20K     <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,26),p={href:"https://www.redhat.com/sysadmin/du-command-options",target:"_blank",rel:"noopener noreferrer"},u={href:"https://man7.org/linux/man-pages/man1/du.1.html",target:"_blank",rel:"noopener noreferrer"};function m(v,b){const s=l("ExternalLinkIcon");return t(),r("div",null,[d,n("p",null,[n("a",p,[e("Linux commands: du and the options you should be using"),a(s)])]),n("p",null,[n("a",u,[e("du(1) — Linux manual page"),a(s)])])])}const h=i(c,[["render",m],["__file","du.html.vue"]]);export{h as default};
