import{_ as n,c as a,a as s,o as i}from"./app-CT9FvwxE.js";const l={};function r(t,e){return i(),a("div",null,e[0]||(e[0]=[s(`<h1 id="readlink" tabindex="-1"><a class="header-anchor" href="#readlink"><span>readlink</span></a></h1><p>Created by : Mr Dk.</p><p>2023 / 04 / 12 19:55</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>readlink</code> 用于打印符号链接的内容。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink <span class="token parameter variable">--help</span></span>
<span class="line">Usage: readlink <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. FILE<span class="token punctuation">..</span>.</span>
<span class="line">Print value of a symbolic <span class="token function">link</span> or canonical <span class="token function">file</span> name</span>
<span class="line"></span>
<span class="line">  -f, <span class="token parameter variable">--canonicalize</span>            canonicalize by following every symlink <span class="token keyword">in</span></span>
<span class="line">                                every component of the given name recursively<span class="token punctuation">;</span></span>
<span class="line">                                all but the last component must exist</span>
<span class="line">  -e, --canonicalize-existing   canonicalize by following every symlink <span class="token keyword">in</span></span>
<span class="line">                                every component of the given name recursively,</span>
<span class="line">                                all components must exist</span>
<span class="line">  -m, --canonicalize-missing    canonicalize by following every symlink <span class="token keyword">in</span></span>
<span class="line">                                every component of the given name recursively,</span>
<span class="line">                                without requirements on components existence</span>
<span class="line">  -n, --no-newline              <span class="token keyword">do</span> not output the trailing delimiter</span>
<span class="line">  -q, --quiet,</span>
<span class="line">  -s, <span class="token parameter variable">--silent</span>                  suppress <span class="token function">most</span> error messages</span>
<span class="line">  -v, <span class="token parameter variable">--verbose</span>                 report error messages</span>
<span class="line">  -z, <span class="token parameter variable">--zero</span>                    separate output with NUL rather than newline</span>
<span class="line">      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span></span>
<span class="line">      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span></span>
<span class="line"></span>
<span class="line">GNU coreutils online help: <span class="token operator">&lt;</span>http://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span></span>
<span class="line">For complete documentation, run: info coreutils <span class="token string">&#39;readlink invocation&#39;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ChatGPT 给出的资料：</p><blockquote><p>The readlink command in Linux is used to print the symbolic link value of a given file or directory. It can also be used to resolve multiple levels of symbolic links, showing the final destination of a chain of symbolic links.</p></blockquote><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo"><span>Demo</span></a></h2><h3 id="an-existing-target" tabindex="-1"><a class="header-anchor" href="#an-existing-target"><span>An Existing Target</span></a></h3><p>创建一个指向实际存在文件的符号链接。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">touch</span> target.txt</span>
<span class="line">$ <span class="token function">ln</span> <span class="token parameter variable">-s</span> target.txt l1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>直接使用 <code>readlink</code>，将会打印符号链接中保存的实际值：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink l1</span>
<span class="line">target.txt</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>加入 <code>-f</code> 参数可以打印全路径，前提是 <strong>最后一级之前</strong> 的所有路径都存在：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink <span class="token parameter variable">-f</span> l1</span>
<span class="line">/home/mrdrivingduck/target.txt</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="non-existing-target" tabindex="-1"><a class="header-anchor" href="#non-existing-target"><span>Non-existing Target</span></a></h3><p>创建一个指向实际不存在文件的符号链接。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">ln</span> <span class="token parameter variable">-s</span> bbb l2</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>此时，使用 <code>-f</code> 参数依旧可以打印结果，因为最后一级之前的所有路径已存在，最后一级的文件不存在。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink <span class="token parameter variable">-f</span> l2</span>
<span class="line">/home/mrdrivingduck/bbb</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-m</code> 参数也可以打印结果，因为它会忽略缺失文件：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink <span class="token parameter variable">-m</span> l2</span>
<span class="line">/home/mrdrivingduck/bbb</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-e</code> 参数将无法打印结果，因为它要求目标必须存在。加上 <code>-v</code> 参数可以显示错误信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ readlink <span class="token parameter variable">-e</span> l2</span>
<span class="line">$ readlink <span class="token parameter variable">-e</span> <span class="token parameter variable">-v</span> l2</span>
<span class="line">readlink: l2: No such <span class="token function">file</span> or directory</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://linux.die.net/man/1/readlink" target="_blank" rel="noopener noreferrer">readlink(1) - Linux man page</a></p>`,30)]))}const c=n(l,[["render",r],["__file","readlink.html.vue"]]),d=JSON.parse('{"path":"/notes/Linux/readlink.html","title":"readlink","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"Demo","slug":"demo","link":"#demo","children":[{"level":3,"title":"An Existing Target","slug":"an-existing-target","link":"#an-existing-target","children":[]},{"level":3,"title":"Non-existing Target","slug":"non-existing-target","link":"#non-existing-target","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/readlink.md"}');export{c as comp,d as data};
