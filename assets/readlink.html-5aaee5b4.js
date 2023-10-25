import{_ as a,r as s,o as i,c as l,a as e,b as r,d,e as t}from"./app-25fa875f.js";const c={},o=t(`<h1 id="readlink" tabindex="-1"><a class="header-anchor" href="#readlink" aria-hidden="true">#</a> readlink</h1><p>Created by : Mr Dk.</p><p>2023 / 04 / 12 19:55</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>readlink</code> 用于打印符号链接的内容。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink <span class="token parameter variable">--help</span>
Usage: readlink <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. FILE<span class="token punctuation">..</span>.
Print value of a symbolic <span class="token function">link</span> or canonical <span class="token function">file</span> name

  -f, <span class="token parameter variable">--canonicalize</span>            canonicalize by following every symlink <span class="token keyword">in</span>
                                every component of the given name recursively<span class="token punctuation">;</span>
                                all but the last component must exist
  -e, --canonicalize-existing   canonicalize by following every symlink <span class="token keyword">in</span>
                                every component of the given name recursively,
                                all components must exist
  -m, --canonicalize-missing    canonicalize by following every symlink <span class="token keyword">in</span>
                                every component of the given name recursively,
                                without requirements on components existence
  -n, --no-newline              <span class="token keyword">do</span> not output the trailing delimiter
  -q, --quiet,
  -s, <span class="token parameter variable">--silent</span>                  suppress <span class="token function">most</span> error messages
  -v, <span class="token parameter variable">--verbose</span>                 report error messages
  -z, <span class="token parameter variable">--zero</span>                    separate output with NUL rather than newline
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

GNU coreutils online help: <span class="token operator">&lt;</span>http://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span>
For complete documentation, run: info coreutils <span class="token string">&#39;readlink invocation&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ChatGPT 给出的资料：</p><blockquote><p>The readlink command in Linux is used to print the symbolic link value of a given file or directory. It can also be used to resolve multiple levels of symbolic links, showing the final destination of a chain of symbolic links.</p></blockquote><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><h3 id="an-existing-target" tabindex="-1"><a class="header-anchor" href="#an-existing-target" aria-hidden="true">#</a> An Existing Target</h3><p>创建一个指向实际存在文件的符号链接。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">touch</span> target.txt
$ <span class="token function">ln</span> <span class="token parameter variable">-s</span> target.txt l1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>直接使用 <code>readlink</code>，将会打印符号链接中保存的实际值：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink l1
target.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加入 <code>-f</code> 参数可以打印全路径，前提是 <strong>最后一级之前</strong> 的所有路径都存在：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink <span class="token parameter variable">-f</span> l1
/home/mrdrivingduck/target.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="non-existing-target" tabindex="-1"><a class="header-anchor" href="#non-existing-target" aria-hidden="true">#</a> Non-existing Target</h3><p>创建一个指向实际不存在文件的符号链接。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ln</span> <span class="token parameter variable">-s</span> bbb l2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>此时，使用 <code>-f</code> 参数依旧可以打印结果，因为最后一级之前的所有路径已存在，最后一级的文件不存在。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink <span class="token parameter variable">-f</span> l2
/home/mrdrivingduck/bbb
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-m</code> 参数也可以打印结果，因为它会忽略缺失文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink <span class="token parameter variable">-m</span> l2
/home/mrdrivingduck/bbb
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-e</code> 参数将无法打印结果，因为它要求目标必须存在。加上 <code>-v</code> 参数可以显示错误信息：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ readlink <span class="token parameter variable">-e</span> l2
$ readlink <span class="token parameter variable">-e</span> <span class="token parameter variable">-v</span> l2
readlink: l2: No such <span class="token function">file</span> or directory
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,29),p={href:"https://linux.die.net/man/1/readlink",target:"_blank",rel:"noopener noreferrer"};function u(v,m){const n=s("ExternalLinkIcon");return i(),l("div",null,[o,e("p",null,[e("a",p,[r("readlink(1) - Linux man page"),d(n)])])])}const h=a(c,[["render",u],["__file","readlink.html.vue"]]);export{h as default};
