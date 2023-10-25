import{_ as t,r as i,o,c as l,a as e,b as a,d as s,e as r}from"./app-25fa875f.js";const d={},c=r(`<h1 id="tee" tabindex="-1"><a class="header-anchor" href="#tee" aria-hidden="true">#</a> tee</h1><p>Created by : Mr Dk.</p><p>2023 / 04 / 11 11:19</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>tee</code> 能够从标准输入中读取数据，然后写出到标准输出以及一个或多个文件中。相当于一个一对多的 adapter。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">tee</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">tee</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
Copy standard input to each FILE, and also to standard output.

  -a, <span class="token parameter variable">--append</span>              append to the given FILEs, <span class="token keyword">do</span> not overwrite
  -i, --ignore-interrupts   ignore interrupt signals
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

If a FILE is -, copy again to standard output.

GNU coreutils online help: <span class="token operator">&lt;</span>http://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span>
For complete documentation, run: info coreutils <span class="token string">&#39;tee invocation&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ChatGPT 给出的资料：</p><blockquote><p>In Linux, the &quot;tee&quot; command is used to read from standard input and write to both standard output and one or more files. It allows the user to redirect the output of a command to both the screen and a file simultaneously. The syntax for using tee is as follows:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">command</span> <span class="token operator">|</span> <span class="token function">tee</span> filename
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>This will run the &quot;command&quot; and print its output to the screen, while also writing it to the file specified by &quot;filename&quot;.</p></blockquote><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo" aria-hidden="true">#</a> Demo</h2><p><code>-a</code> 参数用于追加写入文件，而不是从头开始写入文件。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token builtin class-name">echo</span> <span class="token string">&quot;Hello&quot;</span> <span class="token operator">|</span> <span class="token function">tee</span> test.txt
Hello

$ <span class="token function">cat</span> test.txt
Hello

$ <span class="token builtin class-name">echo</span> <span class="token string">&quot;Hello&quot;</span> <span class="token operator">|</span> <span class="token function">tee</span> <span class="token parameter variable">-a</span> test.txt
Hello

$ <span class="token function">cat</span> test.txt
Hello
Hello

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,15),p={href:"https://man7.org/linux/man-pages/man1/tee.1.html",target:"_blank",rel:"noopener noreferrer"},u={href:"https://www.geeksforgeeks.org/tee-command-linux-example/",target:"_blank",rel:"noopener noreferrer"};function m(h,v){const n=i("ExternalLinkIcon");return o(),l("div",null,[c,e("p",null,[e("a",p,[a("tee(1) — Linux manual page"),s(n)])]),e("p",null,[e("a",u,[a("tee command in Linux with examples - GeeksforGeeks"),s(n)])])])}const k=t(d,[["render",m],["__file","tee.html.vue"]]);export{k as default};
