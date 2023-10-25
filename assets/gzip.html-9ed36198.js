import{_ as o,r as t,o as p,c,a,b as e,d as n,e as r}from"./app-25fa875f.js";const i={},l=a("h1",{id:"gzip",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#gzip","aria-hidden":"true"},"#"),e(" gzip")],-1),d=a("p",null,"Created by : Mr Dk.",-1),u=a("p",null,"2022 / 10 / 26 23:13",-1),g=a("p",null,"Hangzhou, Zhejiang, China",-1),h=a("hr",null,null,-1),k=a("h2",{id:"background",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#background","aria-hidden":"true"},"#"),e(" Background")],-1),m=a("code",null,"gzip",-1),b=a("code",null,".gz",-1),f=a("code",null,"gzip",-1),v={href:"https://en.wikipedia.org/wiki/LZ77_and_LZ78",target:"_blank",rel:"noopener noreferrer"},_=a("code",null,"gzip",-1),z=r(`<p><code>gzip</code> 和 <code>zip</code> 都是非常常用的压缩工具，但 <code>gzip</code> 在压缩大量文件时比 <code>zip</code> 表现更好。<code>gzip</code> 的常用使用场景是将所有的文件归档到一个独立的归档文件中，然后再对这个独立的归档文件进行压缩。相比之下，<code>zip</code> 会将每一个文件单独压缩后，归档到一个压缩包中。这意味着如果想解压缩其中的一个文件，<code>zip</code> 的压缩包只需要局部解压即可，而 <code>gzip</code> 需要完整解压；但 <code>gzip</code> 可以更好地利用多个文件之间的冗余进行压缩，<code>zip</code> 就不行了。所以把尽可能多的文件并在一起输入给 <code>gzip</code> 会有更好的效果。</p><h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">gzip</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">gzip</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
Compress or uncompress FILEs <span class="token punctuation">(</span>by default, compress FILES in-place<span class="token punctuation">)</span>.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.

  -c, <span class="token parameter variable">--stdout</span>      <span class="token function">write</span> on standard output, keep original files unchanged
  -d, <span class="token parameter variable">--decompress</span>  decompress
  -f, <span class="token parameter variable">--force</span>       force overwrite of output <span class="token function">file</span> and compress links
  -h, <span class="token parameter variable">--help</span>        give this <span class="token builtin class-name">help</span>
  -k, <span class="token parameter variable">--keep</span>        keep <span class="token punctuation">(</span>don&#39;t delete<span class="token punctuation">)</span> input files
  -l, <span class="token parameter variable">--list</span>        list compressed <span class="token function">file</span> contents
  -L, <span class="token parameter variable">--license</span>     display software license
  -n, --no-name     <span class="token keyword">do</span> not save or restore the original name and timestamp
  -N, <span class="token parameter variable">--name</span>        save or restore the original name and timestamp
  -q, <span class="token parameter variable">--quiet</span>       suppress all warnings
  -r, <span class="token parameter variable">--recursive</span>   operate recursively on directories
      <span class="token parameter variable">--rsyncable</span>   <span class="token function">make</span> rsync-friendly archive
  -S, <span class="token parameter variable">--suffix</span><span class="token operator">=</span>SUF  use suffix SUF on compressed files
      <span class="token parameter variable">--synchronous</span> synchronous output <span class="token punctuation">(</span>safer <span class="token keyword">if</span> system crashes, but slower<span class="token punctuation">)</span>
  -t, <span class="token parameter variable">--test</span>        <span class="token builtin class-name">test</span> compressed <span class="token function">file</span> integrity
  -v, <span class="token parameter variable">--verbose</span>     verbose mode
  -V, <span class="token parameter variable">--version</span>     display version number
  -1, <span class="token parameter variable">--fast</span>        compress faster
  -9, <span class="token parameter variable">--best</span>        compress better

With no FILE, or when FILE is -, <span class="token builtin class-name">read</span> standard input.

Report bugs to <span class="token operator">&lt;</span>bug-gzip@gnu.org<span class="token operator">&gt;</span>.
</code></pre></div><h2 id="example" tabindex="-1"><a class="header-anchor" href="#example" aria-hidden="true">#</a> Example</h2><p>对一个文件进行压缩，<code>gzip</code> 会给压缩后的文件添加 <code>.gz</code> 后缀后删除原文件。</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code><span class="token function">gzip</span> a.txt
</code></pre></div><p>相反地，使用 <code>-d</code> / <code>--decompress</code> 选项进行解压缩，解压缩后的内容会被输出到不带 <code>.gz</code> 后缀的文件中，原压缩文件被删除：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code><span class="token function">gzip</span> <span class="token parameter variable">-d</span> a.txt.gz
</code></pre></div><p>如果目录中已经存在相应的 <code>.gz</code> 文件，则会出现是否需要覆盖的提示信息；使用 <code>-f</code> / <code>--force</code> 可以强制已有文件：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">gzip</span> a.txt
gzip: a.txt.gz already exists<span class="token punctuation">;</span> <span class="token keyword">do</span> you wish to overwrite <span class="token punctuation">(</span>y or n<span class="token punctuation">)</span>?
$ <span class="token function">gzip</span> <span class="token parameter variable">-f</span> a.txt
</code></pre></div><p>压缩文件的同时，保留压缩前的文件：使用 <code>-k</code> / <code>--keep</code>。</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code><span class="token function">gzip</span> <span class="token parameter variable">-k</span> a.txt
</code></pre></div><p><code>-r</code> / <code>--recursive</code> 选项递归压缩一个目录及其子目录。该目录下的所有文件会被单独压缩：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code><span class="token function">gzip</span> <span class="token parameter variable">-r</span> folder/
</code></pre></div><p>使用 <code>-1</code> / <code>--fast</code> 或 <code>-9</code> / <code>--best</code> 来决定压缩率，根据需求来衡量压缩后文件的大小，和压缩/解压缩所需要的计算量。</p><p>使用 <code>-v</code> / <code>--verbose</code> 来打印压缩或解压缩过程中的详细信息：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">gzip</span> <span class="token parameter variable">-v</span> a.txt
a.txt:  -20.0% -- replaced with a.txt.gz
</code></pre></div><p>使用 <code>-l</code> / <code>--list</code> 查看压缩后文件的信息：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">gzip</span> <span class="token parameter variable">-l</span> a.txt.gz
         compressed        uncompressed  ratio uncompressed_name
                 <span class="token number">36</span>                  <span class="token number">10</span> -20.0% a.txt
</code></pre></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,20),x={href:"https://www.geeksforgeeks.org/gzip-command-linux/",target:"_blank",rel:"noopener noreferrer"},y={href:"https://linux.die.net/man/1/gzip",target:"_blank",rel:"noopener noreferrer"};function w(L,E){const s=t("ExternalLinkIcon");return p(),c("div",null,[l,d,u,g,h,k,a("p",null,[m,e(" 工具用于对文件进行压缩或解压缩。每个独立的文件会被压缩为一个独立的文件，压缩后的文件包含压缩头部和压缩数据，以 "),b,e(" 结尾。"),f,e(" 使用 "),a("a",v,[e("Lempel-Ziv coding (LZ77)"),n(s)]),e(" 无损压缩算法进行压缩。压缩或解压缩后的文件将会保留相同的所有权、访问模式和修改时间。符号链接会被跳过，因为 "),_,e(" 只压缩正经文件。")]),z,a("p",null,[a("a",x,[e("Gzip Command in Linux"),n(s)])]),a("p",null,[a("a",y,[e("gzip(1) - Linux man page"),n(s)])])])}const F=o(i,[["render",w],["__file","gzip.html.vue"]]);export{F as default};
