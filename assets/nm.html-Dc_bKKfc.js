import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function p(c,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="nm" tabindex="-1"><a class="header-anchor" href="#nm"><span>nm</span></a></h1><p>Created by : Mr Dk.</p><p>2023 / 03 / 21 16:11</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>nm</code> 用于列出目标文件中的符号以及这些符号的性质。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ nm <span class="token parameter variable">--help</span></span>
<span class="line">Usage: nm <span class="token punctuation">[</span>option<span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">]</span> <span class="token punctuation">[</span>file<span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">]</span></span>
<span class="line"> List symbols <span class="token keyword">in</span> <span class="token punctuation">[</span>file<span class="token punctuation">(</span>s<span class="token punctuation">)</span><span class="token punctuation">]</span> <span class="token punctuation">(</span>a.out by default<span class="token punctuation">)</span>.</span>
<span class="line"> The options are:</span>
<span class="line">  -a, --debug-syms       Display debugger-only symbols</span>
<span class="line">  -A, --print-file-name  Print name of the input <span class="token function">file</span> before every symbol</span>
<span class="line">  <span class="token parameter variable">-B</span>                     Same as <span class="token parameter variable">--format</span><span class="token operator">=</span>bsd</span>
<span class="line">  -C, --demangle<span class="token punctuation">[</span><span class="token operator">=</span>STYLE<span class="token punctuation">]</span> Decode low-level symbol names into user-level names</span>
<span class="line">                          The STYLE, <span class="token keyword">if</span> specified, can be <span class="token variable"><span class="token variable">\`</span>auto&#39; <span class="token punctuation">(</span>the default<span class="token punctuation">)</span>,</span>
<span class="line">                          <span class="token variable">\`</span></span>gnu<span class="token string">&#39;, \`lucid&#39;</span>, <span class="token variable"><span class="token variable">\`</span>arm&#39;, <span class="token variable">\`</span></span>hp<span class="token string">&#39;, \`edg&#39;</span>, <span class="token variable"><span class="token variable">\`</span>gnu-v3&#39;, <span class="token variable">\`</span></span><span class="token function">java</span><span class="token string">&#39;</span>
<span class="line">                          or \`gnat&#39;</span></span>
<span class="line">      --no-demangle      Do not demangle low-level symbol names</span>
<span class="line">      --recurse-limit    Enable a demangling recursion limit.  This is the default.</span>
<span class="line">      --no-recurse-limit Disable a demangling recursion limit.</span>
<span class="line">  -D, <span class="token parameter variable">--dynamic</span>          Display dynamic symbols instead of normal symbols</span>
<span class="line">      --defined-only     Display only defined symbols</span>
<span class="line">  <span class="token parameter variable">-e</span>                     <span class="token punctuation">(</span>ignored<span class="token punctuation">)</span></span>
<span class="line">  -f, <span class="token parameter variable">--format</span><span class="token operator">=</span>FORMAT    Use the output <span class="token function">format</span> FORMAT.  FORMAT can be <span class="token variable"><span class="token variable">\`</span>bsd&#39;,</span>
<span class="line">                           <span class="token variable">\`</span></span>sysv<span class="token string">&#39; or \`posix&#39;</span><span class="token builtin class-name">.</span>  The default is \`bsd<span class="token string">&#39;</span>
<span class="line">  -g, --extern-only      Display only external symbols</span>
<span class="line">  -l, --line-numbers     Use debugging information to find a filename and</span>
<span class="line">                           line number for each symbol</span>
<span class="line">  -n, --numeric-sort     Sort symbols numerically by address</span>
<span class="line">  -o                     Same as -A</span>
<span class="line">  -p, --no-sort          Do not sort the symbols</span>
<span class="line">  -P, --portability      Same as --format=posix</span>
<span class="line">  -r, --reverse-sort     Reverse the sense of the sort</span>
<span class="line">      --plugin NAME      Load the specified plugin</span>
<span class="line">  -S, --print-size       Print size of defined symbols</span>
<span class="line">  -s, --print-armap      Include index for symbols from archive members</span>
<span class="line">      --size-sort        Sort symbols by size</span>
<span class="line">      --special-syms     Include special symbols in the output</span>
<span class="line">      --synthetic        Display synthetic symbols as well</span>
<span class="line">  -t, --radix=RADIX      Use RADIX for printing symbol values</span>
<span class="line">      --target=BFDNAME   Specify the target object format as BFDNAME</span>
<span class="line">  -u, --undefined-only   Display only undefined symbols</span>
<span class="line">      --with-symbol-versions  Display version strings after symbol names</span>
<span class="line">  -X 32_64               (ignored)</span>
<span class="line">  @FILE                  Read options from FILE</span>
<span class="line">  -h, --help             Display this information</span>
<span class="line">  -V, --version          Display this program&#39;</span>s version number</span>
<span class="line"></span>
<span class="line">nm: supported targets: elf64-x86-64 elf32-i386 elf32-iamcu elf32-x86-64 pei-i386 pei-x86-64 elf64-l1om elf64-k1om elf64-little elf64-big elf32-little elf32-big pe-x86-64 pe-bigobj-x86-64 pe-i386 elf64-bpfle elf64-bpfbe srec symbolsrec verilog tekhex binary ihex plugin</span>
<span class="line">Report bugs to <span class="token operator">&lt;</span>http://bugzilla.redhat.com/bugzilla/<span class="token operator">&gt;</span>.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ChatGPT 给出的资料：</p><blockquote><p>nm is a command-line utility in Linux used for examining binary files, such as executable files, object files, and shared libraries. It is used to display information about the symbols in the binary files, including their names, types, and addresses.</p><p>Some of the common options used with the nm command are:</p><ul><li>-a: shows all symbols, including local symbols</li><li>-g: shows only global symbols</li><li>-u: shows only undefined symbols</li><li>-D: shows dynamic symbols</li><li>-C: shows C++ symbols in a demangled format</li><li>-f: shows the file name where each symbol is defined</li><li>-p: shows the symbol&#39;s value in hexadecimal format</li></ul><p>The nm command is useful for debugging and analyzing binary files, as it can help identify missing or wrong symbols, as well as provide information about the functions and variables used in the code.</p></blockquote><h2 id="demo" tabindex="-1"><a class="header-anchor" href="#demo"><span>Demo</span></a></h2><p>以 OpenSSL 的 shared object 为例，查看其中的部分符号。其中：</p><ul><li><code>-g</code> 参数表示只查看全局符号</li><li><code>-D</code> 参数表示只查看动态符号</li><li><code>-A</code> 参数表示打印每个符号所属的文件名</li></ul><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ nm <span class="token parameter variable">-g</span> <span class="token parameter variable">-D</span> <span class="token parameter variable">-A</span> libssl.so</span>
<span class="line">libssl.so:                 U ASN1_item_d2i@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASN1_item_free@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASN1_item_i2d@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASN1_OCTET_STRING_it@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_get_current_job@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_start_job@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_WAIT_CTX_free@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_WAIT_CTX_get_all_fds@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_WAIT_CTX_get_changed_fds@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U ASYNC_WAIT_CTX_new@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_ADDR_clear@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_ADDR_free@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_ADDR_new@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_callback_ctrl@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_clear_flags@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_copy_next_retry@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_ctrl@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_dump_indent@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_f_buffer@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_find_type@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_free@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_free_all@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:000000000001e720 T BIO_f_ssl@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_get_data@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_get_init@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_get_retry_reason@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_get_shutdown@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_int_ctrl@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_method_type@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_new@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:000000000001e830 T BIO_new_buffer_ssl_connect@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:000000000001e730 T BIO_new_ssl@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:000000000001e7b0 T BIO_new_ssl_connect@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_next@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_pop@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_printf@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_push@@OPENSSL_1_1_0</span>
<span class="line">libssl.so:                 U BIO_puts@@OPENSSL_1_1_0</span>
<span class="line"><span class="token punctuation">..</span>.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>B</code> 表示当前符号位于 BSS 数据段，通常包含被 0 初始化或未被初始化过的数据（因平台而异）</li><li><code>D</code> 表示当前符号位于被初始化过的数据段</li><li><code>T</code> 表示当前符号位于代码段</li><li><code>U</code> 代表当前对象内使用过但未定义的符号，通常这个符号位于需要被链接的另一个对象中</li><li><a href="https://man7.org/linux/man-pages/man1/nm.1.html" target="_blank" rel="noopener noreferrer">...</a></li></ul><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://man7.org/linux/man-pages/man1/nm.1.html" target="_blank" rel="noopener noreferrer">nm(1) — Linux manual page</a></p>`,18)]))}const r=n(i,[["render",p],["__file","nm.html.vue"]]),t=JSON.parse('{"path":"/notes/Linux/nm.html","title":"nm","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"Demo","slug":"demo","link":"#demo","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/nm.md"}');export{r as comp,t as data};
