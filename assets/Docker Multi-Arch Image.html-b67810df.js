import{_ as l,r,o as t,c as o,a as n,b as e,d as a,e as i}from"./app-25fa875f.js";const d="/blog/assets/docker-image-multi-arch-1b26efb9.png",c={},u=i(`<h1 id="docker-multi-arch-image" tabindex="-1"><a class="header-anchor" href="#docker-multi-arch-image" aria-hidden="true">#</a> Docker Multi-Arch Image</h1><p>Created by : Mr Dk.</p><p>2022 / 05 / 15 16:15</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p>近日，由于工作上的需要，要把软件打包构建到 Docker 镜像中，并且该 Docker 镜像还要支持 <strong>多种 CPU 架构</strong>。其实之前已经或多或少使用过多架构的镜像了。记得有一次在一台 x86 CPU 的机器上构建了一个镜像并 push 到 DockerHub 上以后，在 Apple M1 的 MacBook 上 <code>docker pull</code> 时看到了警告：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>The requested image&#39;s platform (linux/amd64) does not match the detected host platform (linux/arm64) and nospecific platform was requested.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>所以，一个镜像如果想在特定 CPU 架构上运行，就要为这个 CPU 架构打一个独立的镜像。为每个 CPU 架构上的镜像打一个 tag 可以解决问题，但是不够优雅。因为 tag 一般来说用来区分镜像内软件的版本，而不是用来区分镜像的运行平台。Docker 已经将镜像的运行平台维护在 manifest 中。以 DockerHub 上的 Ubuntu 官方镜像为例：</p><p><img src="`+d+'" alt="multi-arch-image"></p><p>Tag 的作用是标识镜像 Ubuntu 的 22.04 / 20.04 / 18.04 ... 等版本，但每个 tag 上有多个 OS/ARCH。可以看到，Ubuntu 支持在 amd64、armv7、arm64(v8)、ppc64le、riscv64、s390x 架构的 Linux 上运行。</p><p><img src="https://miro.medium.com/max/1400/1*Iu-K4kpFkTOqC4qMy9pFXg.png" alt="docker-buildx"></p><p>那么，如果我也想打一个 multi-arch 的镜像怎么办呢？只能在相应 CPU 架构的机器上才可以构建镜像吗？</p><h2 id="buildx" tabindex="-1"><a class="header-anchor" href="#buildx" aria-hidden="true">#</a> Buildx</h2>',14),p={href:"https://docs.docker.com/buildx/working-with-buildx/",target:"_blank",rel:"noopener noreferrer"},m=n("code",null,"docker build",-1),v=i(`<p>所以第一步肯定是安装 Docker BuildX。搞定之后，看看目前支持的 CPU 架构有哪些：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">docker</span> buildx inspect <span class="token parameter variable">--bootstrap</span>
Name:   default
Driver: <span class="token function">docker</span>

Nodes:
Name:      default
Endpoint:  default
Status:    running
Platforms: linux/amd64, linux/386
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),b={href:"https://docs.docker.com/buildx/working-with-buildx/#build-multi-platform-images",target:"_blank",rel:"noopener noreferrer"},k=n("code",null,"binfmt_misc",-1),h=i(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">docker</span> run <span class="token parameter variable">--privileged</span> <span class="token parameter variable">--rm</span> tonistiigi/binfmt <span class="token parameter variable">--install</span> all
Unable to <span class="token function">find</span> image <span class="token string">&#39;tonistiigi/binfmt:latest&#39;</span> locally
latest: Pulling from tonistiigi/binfmt
2b4d0e08bd75: Pull complete
c331be51c382: Pull complete
Digest: sha256:5bf63a53ad6222538112b5ced0f1afb8509132773ea6dd3991a197464962854e
Status: Downloaded newer image <span class="token keyword">for</span> tonistiigi/binfmt:latest
installing: ppc64le OK
installing: riscv64 OK
installing: mips64le OK
installing: arm64 OK
installing: arm OK
installing: s390x OK
installing: mips64 OK
<span class="token punctuation">{</span>
  <span class="token string">&quot;supported&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token string">&quot;linux/amd64&quot;</span>,
    <span class="token string">&quot;linux/arm64&quot;</span>,
    <span class="token string">&quot;linux/riscv64&quot;</span>,
    <span class="token string">&quot;linux/ppc64le&quot;</span>,
    <span class="token string">&quot;linux/s390x&quot;</span>,
    <span class="token string">&quot;linux/386&quot;</span>,
    <span class="token string">&quot;linux/mips64le&quot;</span>,
    <span class="token string">&quot;linux/mips64&quot;</span>,
    <span class="token string">&quot;linux/arm/v7&quot;</span>,
    <span class="token string">&quot;linux/arm/v6&quot;</span>
  <span class="token punctuation">]</span>,
  <span class="token string">&quot;emulators&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token string">&quot;qemu-aarch64&quot;</span>,
    <span class="token string">&quot;qemu-arm&quot;</span>,
    <span class="token string">&quot;qemu-mips64&quot;</span>,
    <span class="token string">&quot;qemu-mips64el&quot;</span>,
    <span class="token string">&quot;qemu-ppc64le&quot;</span>,
    <span class="token string">&quot;qemu-riscv64&quot;</span>,
    <span class="token string">&quot;qemu-s390x&quot;</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再次查看 BuildX，可以看到 <code>Platforms</code> 中多出了很多 CPU 架构：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">docker</span> buildx inspect <span class="token parameter variable">--bootstrap</span>
Name:   default
Driver: <span class="token function">docker</span>

Nodes:
Name:      default
Endpoint:  default
Status:    running
Platforms: linux/amd64, linux/386, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/arm/v7, linux/arm/v6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>准备完毕，接下来就可以开始构建了。<code>docker buildx build</code> 命令与 <code>docker build</code> 有一些细微的差别。首先需要创建一个 builder：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">docker</span> buildx create <span class="token parameter variable">--name</span> multibuilder
$ <span class="token function">docker</span> buildx use multibuilder
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>然后使用这个 builder 进行构建：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">docker</span> buildx build <span class="token punctuation">\\</span>
    <span class="token parameter variable">--push</span> <span class="token punctuation">\\</span>
    <span class="token parameter variable">--platform</span> linux/amd64,linux/arm64 <span class="token punctuation">\\</span>
    <span class="token parameter variable">--tag</span> xxx/xxx:latest <span class="token punctuation">\\</span>
    <span class="token parameter variable">--file</span> Dockerfile <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>经过体验，native 指令集（对我的机器而言是 amd64）的镜像构建速度最快，远快于 QEMU 对其它指令集的模拟。但是这种方法只需要一台机器就可以构建能够运行于所有 CPU 平台上的镜像了。</p><h2 id="如何使-dockerfile-与-arch-无关" tabindex="-1"><a class="header-anchor" href="#如何使-dockerfile-与-arch-无关" aria-hidden="true">#</a> 如何使 Dockerfile 与 ARCH 无关</h2><p>对于不同 arch 上的镜像构建，我们通常会使用 multi-arch 的基础镜像，这没什么问题。这样使用同一份 Dockerfile 就可以构建我们自己的 multi-arch 镜像。但有时，同一个软件包在不同 arch 上的版本不同，使不得不在 Dockerfile 的层面上去加以区别。如何避免为不同的 arch 写两份 Dockerfile 呢？</p><p>使用镜像构建时自动传入的预定义 <code>ARG</code> 来判断构建的目标平台，然后使用 shell 的语法来对不同的平台执行不同的 <code>RUN</code> 指令。</p><p>镜像构建时将会预定义如下的 <code>ARG</code>：</p><ul><li><code>TARGETPLATFORM</code>：<code>linux/amd64</code> / <code>linux/arm/v7</code> 等</li><li><code>TARGETOS</code>：<code>linux</code> / <code>windows</code> 等</li><li><code>TARGETARCH</code>：<code>amd64</code> / <code>arm64</code> 等</li></ul><p>在 Dockerfile 中使用 shell 语法判断这些 <code>ARG</code>：</p><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">RUN</span> if [ <span class="token string">&quot;$TARGETARCH&quot;</span> = <span class="token string">&quot;amd64&quot;</span> ]; then <span class="token operator">\\</span>
        OCI_ARCH=x86_64; <span class="token operator">\\</span>
        OCI_VERSION=19.14; <span class="token operator">\\</span>
    elif [ <span class="token string">&quot;$TARGETARCH&quot;</span> = <span class="token string">&quot;arm64&quot;</span> ]; then <span class="token operator">\\</span>
        OCI_ARCH=aarch64; <span class="token operator">\\</span>
        OCI_VERSION=19.10; <span class="token operator">\\</span>
    else <span class="token operator">\\</span>
        OCI_ARCH=x86_64; <span class="token operator">\\</span>
        OCI_VERSION=19.14; <span class="token operator">\\</span>
    fi &amp;&amp; <span class="token operator">\\</span>
    wget --no-verbose <span class="token operator">\\</span>
        https://xxx/<span class="token variable">\${OCI_ARCH}</span>/<span class="token variable">\${OCI_VERSION}</span>-basic-<span class="token variable">\${OCI_VERSION}</span>.<span class="token variable">\${OCI_ARCH}</span>.rpm</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,17),g={href:"https://medium.com/nttlabs/buildx-multiarch-2c6c2df00ca2",target:"_blank",rel:"noopener noreferrer"},f={href:"https://www.docker.com/blog/getting-started-with-docker-for-arm-on-linux/",target:"_blank",rel:"noopener noreferrer"},x={href:"https://docs.docker.com/buildx/working-with-buildx/",target:"_blank",rel:"noopener noreferrer"},_={href:"https://docs.docker.com/engine/reference/commandline/buildx_build/",target:"_blank",rel:"noopener noreferrer"},q={href:"https://docs.docker.com/engine/reference/builder/#automatic-platform-args-in-the-global-scope",target:"_blank",rel:"noopener noreferrer"},C={href:"https://www.docker.com/blog/faster-multi-platform-builds-dockerfile-cross-compilation-guide/",target:"_blank",rel:"noopener noreferrer"},D={href:"https://nielscautaerts.xyz/making-dockerfiles-architecture-independent.html",target:"_blank",rel:"noopener noreferrer"};function R(A,O){const s=r("ExternalLinkIcon");return t(),o("div",null,[u,n("p",null,[e("并不是。在一台机器上，使用 "),n("a",p,[e("Docker BuildX"),a(s)]),e(" 插件，以与 "),m,e(" 类似的方式，就可以构建出多架构镜像。Docker BuildX 使用 QEMU 在一台机器上模拟运行另一个 CPU 架构的指令，从而实现在一台机器上构建多个 CPU 架构的镜像。")]),v,n("p",null,[e("可以看到，目前支持的只有 32/64 位的 x86 CPU。很正常，因为这台机器目前就安装着 Intel 的芯片。那么如何做到使用 QEMU 模拟其它 CPU 架构的指令呢？根据 "),n("a",b,[e("Docker BuildX 的文档"),a(s)]),e("，看起来需要向当前机器的 "),k,e("（此处有点眼熟 🤭 爷青回）接口挂载其它 CPU 架构的二进制文件处理函数。处理函数内估计封装了 emulate 其它 CPU 指令的逻辑。使用文档内提供的一行命令，安装所有可以支持的 binfmt：")]),h,n("p",null,[n("a",g,[e("Preparation toward running Docker on ARM Mac: Building multi-arch images with Docker BuildX"),a(s)])]),n("p",null,[n("a",f,[e("Getting started with Docker for Arm on Linux"),a(s)])]),n("p",null,[n("a",x,[e("Docker Buildx"),a(s)])]),n("p",null,[n("a",_,[e("docker buildx build"),a(s)])]),n("p",null,[n("a",q,[e("Automatic platform ARGs in the global scope"),a(s)])]),n("p",null,[n("a",C,[e("Faster Multi-Platform Builds: Dockerfile Cross-Compilation Guide"),a(s)])]),n("p",null,[n("a",D,[e("Making Dockerfiles architecture independent"),a(s)])])])}const P=l(c,[["render",R],["__file","Docker Multi-Arch Image.html.vue"]]);export{P as default};
