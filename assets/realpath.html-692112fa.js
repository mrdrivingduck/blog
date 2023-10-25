import{_ as n,r as s,o as i,c as r,a as e,b as l,d as t,e as d}from"./app-25fa875f.js";const o={},c=d(`<h1 id="readlink" tabindex="-1"><a class="header-anchor" href="#readlink" aria-hidden="true">#</a> readlink</h1><p>Created by : Mr Dk.</p><p>2023 / 04 / 14 19:55</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>realpath</code> 能够返回任意路径的绝对路径。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ realpath <span class="token parameter variable">--help</span>
Usage: realpath <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. FILE<span class="token punctuation">..</span>.
Print the resolved absolute <span class="token function">file</span> name<span class="token punctuation">;</span>
all but the last component must exist

  -e, --canonicalize-existing  all components of the path must exist
  -m, --canonicalize-missing   no components of the path need exist
  -L, <span class="token parameter variable">--logical</span>                resolve <span class="token string">&#39;..&#39;</span> components before symlinks
  -P, <span class="token parameter variable">--physical</span>               resolve symlinks as encountered <span class="token punctuation">(</span>default<span class="token punctuation">)</span>
  -q, <span class="token parameter variable">--quiet</span>                  suppress <span class="token function">most</span> error messages
      --relative-to<span class="token operator">=</span>FILE       print the resolved path relative to FILE
      --relative-base<span class="token operator">=</span>FILE     print absolute paths unless paths below FILE
  -s, --strip, --no-symlinks   don<span class="token string">&#39;t expand symlinks
  -z, --zero                   separate output with NUL rather than newline

      --help     display this help and exit
      --version  output version information and exit

GNU coreutils online help: &lt;http://www.gnu.org/software/coreutils/&gt;
For complete documentation, run: info coreutils &#39;</span>realpath invocation&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ChatGPT 给出的资料：</p><blockquote><p>The realpath command in Linux is used to resolve the absolute path of a given file or directory, taking into account any symbolic links or relative paths that may be involved. It returns the canonical, or standardized, path for the specified file or directory.</p></blockquote><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><p>得到一个已有文件的绝对路径：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">touch</span> README.md
$ realpath ./README.md
/home/mrdrivingduck/test/README.md
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-e</code> / <code>-m</code> 选项可以被用于控制是否允许目标文件不存在：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ realpath <span class="token parameter variable">-e</span> ./README.m
realpath: ‘./README.m’: No such <span class="token function">file</span> or directory

$ realpath <span class="token parameter variable">-m</span> ./README.m
/home/mrdrivingduck/test/README.m
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于符号链接来说，<code>-s</code> 选项可以选择不展开符号链接：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ln</span> <span class="token parameter variable">-s</span> polar-doc/docs/README.md README

$ realpath README
/home/mrdrivingduck/test/polar-doc/docs/README.md

$ realpath <span class="token parameter variable">-s</span> README
/home/mrdrivingduck/test/README
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,19),p={href:"https://linux.die.net/man/1/realpath",target:"_blank",rel:"noopener noreferrer"};function u(v,m){const a=s("ExternalLinkIcon");return i(),r("div",null,[c,e("p",null,[e("a",p,[l("realpath(1) - Linux man page"),t(a)])])])}const b=n(o,[["render",u],["__file","realpath.html.vue"]]);export{b as default};
