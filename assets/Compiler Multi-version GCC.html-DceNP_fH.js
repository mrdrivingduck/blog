import{_ as s,c as n,a as i,o as a}from"./app-aVGbliEg.js";const l={};function t(r,e){return a(),n("div",null,e[0]||(e[0]=[i(`<h1 id="compiler-multi-version-gcc" tabindex="-1"><a class="header-anchor" href="#compiler-multi-version-gcc"><span>Compiler - Multi-version GCC</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 05 / 07 22:50</p><p>Nanjing, Jiangsu, China</p><hr><p>在不同版本的 Linux distribution 中，有着不同默认版本的 GCC。比如 Ubuntu 18.04 自带 GCC 7.5.0，Ubuntu 20.04 自带 GCC 9.3.0。但是，有时编译一些以前的代码，会因为高版本编译器的严格要求而无法通过，使得我们不得不同时安装低版本的编译器。</p><p>通过源码编译安装好麻烦。最方便的方法当然是通过 APT 来安装历史版本的 GCC。但是如何管理多个版本的 GCC 是个麻烦事。使用 <code>build-essential</code> 可以进行方便地管理：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 9</span>
<span class="line">$ sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-8 8</span>
<span class="line">$ sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 7</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后通过如下命令可以替换 <code>gcc</code> 默认指向的 GCC 版本：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> update-alternatives <span class="token parameter variable">--config</span> gcc</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div>`,10)]))}const o=s(l,[["render",t],["__file","Compiler Multi-version GCC.html.vue"]]),p=JSON.parse('{"path":"/notes/Compiler/Compiler%20Multi-version%20GCC.html","title":"Compiler - Multi-version GCC","lang":"en-US","frontmatter":{},"headers":[],"git":{},"filePathRelative":"notes/Compiler/Compiler Multi-version GCC.md"}');export{o as comp,p as data};