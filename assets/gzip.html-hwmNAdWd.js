import{_ as s,c as n,a as e,o as p}from"./app-CT9FvwxE.js";const t={};function l(c,a){return p(),n("div",null,a[0]||(a[0]=[e(`<h1 id="gzip" tabindex="-1"><a class="header-anchor" href="#gzip"><span>gzip</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 10 / 26 23:13</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>gzip</code> 工具用于对文件进行压缩或解压缩。每个独立的文件会被压缩为一个独立的文件，压缩后的文件包含压缩头部和压缩数据，以 <code>.gz</code> 结尾。<code>gzip</code> 使用 <a href="https://en.wikipedia.org/wiki/LZ77_and_LZ78" target="_blank" rel="noopener noreferrer">Lempel-Ziv coding (LZ77)</a> 无损压缩算法进行压缩。压缩或解压缩后的文件将会保留相同的所有权、访问模式和修改时间。符号链接会被跳过，因为 <code>gzip</code> 只压缩正经文件。</p><p><code>gzip</code> 和 <code>zip</code> 都是非常常用的压缩工具，但 <code>gzip</code> 在压缩大量文件时比 <code>zip</code> 表现更好。<code>gzip</code> 的常用使用场景是将所有的文件归档到一个独立的归档文件中，然后再对这个独立的归档文件进行压缩。相比之下，<code>zip</code> 会将每一个文件单独压缩后，归档到一个压缩包中。这意味着如果想解压缩其中的一个文件，<code>zip</code> 的压缩包只需要局部解压即可，而 <code>gzip</code> 需要完整解压；但 <code>gzip</code> 可以更好地利用多个文件之间的冗余进行压缩，<code>zip</code> 就不行了。所以把尽可能多的文件并在一起输入给 <code>gzip</code> 会有更好的效果。</p><h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax"><span>Syntax</span></a></h2><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">gzip</span> <span class="token parameter variable">--help</span></span>
<span class="line">Usage: <span class="token function">gzip</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.</span>
<span class="line">Compress or uncompress FILEs <span class="token punctuation">(</span>by default, compress FILES in-place<span class="token punctuation">)</span>.</span>
<span class="line"></span>
<span class="line">Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.</span>
<span class="line"></span>
<span class="line">  -c, <span class="token parameter variable">--stdout</span>      <span class="token function">write</span> on standard output, keep original files unchanged</span>
<span class="line">  -d, <span class="token parameter variable">--decompress</span>  decompress</span>
<span class="line">  -f, <span class="token parameter variable">--force</span>       force overwrite of output <span class="token function">file</span> and compress links</span>
<span class="line">  -h, <span class="token parameter variable">--help</span>        give this <span class="token builtin class-name">help</span></span>
<span class="line">  -k, <span class="token parameter variable">--keep</span>        keep <span class="token punctuation">(</span>don&#39;t delete<span class="token punctuation">)</span> input files</span>
<span class="line">  -l, <span class="token parameter variable">--list</span>        list compressed <span class="token function">file</span> contents</span>
<span class="line">  -L, <span class="token parameter variable">--license</span>     display software license</span>
<span class="line">  -n, --no-name     <span class="token keyword">do</span> not save or restore the original name and timestamp</span>
<span class="line">  -N, <span class="token parameter variable">--name</span>        save or restore the original name and timestamp</span>
<span class="line">  -q, <span class="token parameter variable">--quiet</span>       suppress all warnings</span>
<span class="line">  -r, <span class="token parameter variable">--recursive</span>   operate recursively on directories</span>
<span class="line">      <span class="token parameter variable">--rsyncable</span>   <span class="token function">make</span> rsync-friendly archive</span>
<span class="line">  -S, <span class="token parameter variable">--suffix</span><span class="token operator">=</span>SUF  use suffix SUF on compressed files</span>
<span class="line">      <span class="token parameter variable">--synchronous</span> synchronous output <span class="token punctuation">(</span>safer <span class="token keyword">if</span> system crashes, but slower<span class="token punctuation">)</span></span>
<span class="line">  -t, <span class="token parameter variable">--test</span>        <span class="token builtin class-name">test</span> compressed <span class="token function">file</span> integrity</span>
<span class="line">  -v, <span class="token parameter variable">--verbose</span>     verbose mode</span>
<span class="line">  -V, <span class="token parameter variable">--version</span>     display version number</span>
<span class="line">  -1, <span class="token parameter variable">--fast</span>        compress faster</span>
<span class="line">  -9, <span class="token parameter variable">--best</span>        compress better</span>
<span class="line"></span>
<span class="line">With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.</span>
<span class="line"></span>
<span class="line">Report bugs to <span class="token operator">&lt;</span>bug-gzip@gnu.org<span class="token operator">&gt;</span>.</span>
<span class="line"></span></code></pre></div><h2 id="example" tabindex="-1"><a class="header-anchor" href="#example"><span>Example</span></a></h2><p>对一个文件进行压缩，<code>gzip</code> 会给压缩后的文件添加 <code>.gz</code> 后缀后删除原文件。</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">gzip</span> a.txt</span>
<span class="line"></span></code></pre></div><p>相反地，使用 <code>-d</code> / <code>--decompress</code> 选项进行解压缩，解压缩后的内容会被输出到不带 <code>.gz</code> 后缀的文件中，原压缩文件被删除：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">gzip</span> <span class="token parameter variable">-d</span> a.txt.gz</span>
<span class="line"></span></code></pre></div><p>如果目录中已经存在相应的 <code>.gz</code> 文件，则会出现是否需要覆盖的提示信息；使用 <code>-f</code> / <code>--force</code> 可以强制已有文件：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">gzip</span> a.txt</span>
<span class="line">gzip: a.txt.gz already exists<span class="token punctuation">;</span> <span class="token keyword">do</span> you wish to overwrite <span class="token punctuation">(</span>y or n<span class="token punctuation">)</span>?</span>
<span class="line">$ <span class="token function">gzip</span> <span class="token parameter variable">-f</span> a.txt</span>
<span class="line"></span></code></pre></div><p>压缩文件的同时，保留压缩前的文件：使用 <code>-k</code> / <code>--keep</code>。</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">gzip</span> <span class="token parameter variable">-k</span> a.txt</span>
<span class="line"></span></code></pre></div><p><code>-r</code> / <code>--recursive</code> 选项递归压缩一个目录及其子目录。该目录下的所有文件会被单独压缩：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">gzip</span> <span class="token parameter variable">-r</span> folder/</span>
<span class="line"></span></code></pre></div><p>使用 <code>-1</code> / <code>--fast</code> 或 <code>-9</code> / <code>--best</code> 来决定压缩率，根据需求来衡量压缩后文件的大小，和压缩/解压缩所需要的计算量。</p><p>使用 <code>-v</code> / <code>--verbose</code> 来打印压缩或解压缩过程中的详细信息：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">gzip</span> <span class="token parameter variable">-v</span> a.txt</span>
<span class="line">a.txt:  -20.0% -- replaced with a.txt.gz</span>
<span class="line"></span></code></pre></div><p>使用 <code>-l</code> / <code>--list</code> 查看压缩后文件的信息：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">gzip</span> <span class="token parameter variable">-l</span> a.txt.gz</span>
<span class="line">         compressed        uncompressed  ratio uncompressed_name</span>
<span class="line">                 <span class="token number">36</span>                  <span class="token number">10</span> -20.0% a.txt</span>
<span class="line"></span></code></pre></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.geeksforgeeks.org/gzip-command-linux/" target="_blank" rel="noopener noreferrer">Gzip Command in Linux</a></p><p><a href="https://linux.die.net/man/1/gzip" target="_blank" rel="noopener noreferrer">gzip(1) - Linux man page</a></p>`,29)]))}const i=s(t,[["render",l],["__file","gzip.html.vue"]]),r=JSON.parse('{"path":"/notes/Linux/gzip.html","title":"gzip","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Syntax","slug":"syntax","link":"#syntax","children":[]},{"level":2,"title":"Example","slug":"example","link":"#example","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/gzip.md"}');export{i as comp,r as data};
