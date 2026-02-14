import{_ as n,c as e,a,o as i}from"./app-BeHGwf2X.js";const l={};function c(d,s){return i(),e("div",null,s[0]||(s[0]=[a(`<h1 id="docker-overview" tabindex="-1"><a class="header-anchor" href="#docker-overview"><span>Docker - Overview</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 09 / 06 23:11</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_1-简介" tabindex="-1"><a class="header-anchor" href="#_1-简介"><span>1. 简介</span></a></h2><p>Hypervisor 虚拟化通过一个中间层，将一台或多台独立的机器虚拟运行于物理硬件之上，而容器则直接运行于 OS 内核之上的用户空间中。容器技术可以让多个 <strong>独立的用户空间</strong> 运行在同一台宿主机上。在超大规模多租户服务部署、轻量级沙盒或对安全性要求不太高的隔离环境中，容器技术非常流行。</p><p>得益于现代 Linux 内核的特性，容器和宿主机之间的隔离更加彻底。容器有独立的网络、存储栈，还有资源管理能力。容器运行 <strong>不需要虚拟层和管理层</strong>，而是使用 OS 的系统调用接口，从而降低了运行单个容器的开销，使得宿主机中可以运行更多的容器。</p><p>Docker 则是一个能够把开发的应用程序自动部署到容器中的开源引擎。</p><p>Docker 是一个 C/S 架构的程序。Docker 客户端向 Docker 服务器或守护进程 (Docker 引擎) 发出请求，服务器或守护进程完成工作并返回结果。Docker 提供了 CLI 以及一套 RESTful API 与守护进程进行交互。</p><p>Docker 镜像是基于 <strong>联合文件系统</strong> 的一种层次结构，由一系列指令逐步构建出来。我个人的理解是，镜像相当于一个保存在文件系统中的进程实时运行状态。当镜像被放入容器中运行后，就成为了一个或多个进程。</p><p>Docker Registry 是用来保存用户构建的镜像的地方，可以与 Git 仓库类比。</p><p>容器是基于镜像启动起来的，容器中可以运行一个或多个进程。镜像是 Docker 生命周期中的构建或打包阶段，而容器则是启动或执行阶段。</p><p>Docker 的技术组件如下：</p><ul><li>原生的 Linux 容器格式 (<code>libcontainer</code>)</li><li>Linux 内核的 namespace，用于隔离文件系统、进程、网络 <ul><li>文件系统隔离 (每个容器都有自己的 <code>root</code> 文件系统)</li><li>进程隔离 (每个容器都运行在自己的进程环境中)</li><li>网络隔离 (容器间的虚拟网络接口和 IP 地址都是分开的)</li></ul></li><li>资源隔离和分组 (cgroups) - 分配硬件资源到每个 Docker 容器</li><li>写时复制 (文件系统是分层的、快速的)</li><li>容器产生的 <code>STDIN</code>、<code>STDOUT</code>、<code>STDERR</code> 这些 I/O 流都会被记入日志</li><li>交互式 shell - 创建一个伪 tty 终端，并连接到 <code>STDIN</code></li></ul><h2 id="_2-docker-守护进程" tabindex="-1"><a class="header-anchor" href="#_2-docker-守护进程"><span>2. Docker 守护进程</span></a></h2><p>在 Docker 安装完毕后，需要确认 Docker 守护进程是否开始运行。并可以通过命令改变守护进程的监听端口号、绑定的 socket 等。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ service docker status</span>
<span class="line">● docker.service - Docker Application Container Engine</span>
<span class="line">     Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)</span>
<span class="line">     Active: active (running) since Tue 2020-09-08 20:19:52 CST; 1min 20s ago</span>
<span class="line">TriggeredBy: ● docker.socket</span>
<span class="line">       Docs: https://docs.docker.com</span>
<span class="line">   Main PID: 24918 (dockerd)</span>
<span class="line">      Tasks: 17</span>
<span class="line">     Memory: 41.4M</span>
<span class="line">     CGroup: /system.slice/docker.service</span>
<span class="line">             └─24918 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock</span>
<span class="line"></span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.154154178+08:00&quot; level=warning msg=&quot;Your ke&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.154172375+08:00&quot; level=warning msg=&quot;Your ke&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.154190112+08:00&quot; level=warning msg=&quot;Your ke&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.154639178+08:00&quot; level=info msg=&quot;Loading co&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.428462501+08:00&quot; level=info msg=&quot;Default br&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.557265005+08:00&quot; level=info msg=&quot;Loading co&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.640068507+08:00&quot; level=info msg=&quot;Docker dae&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.640445267+08:00&quot; level=info msg=&quot;Daemon has&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 dockerd[24918]: time=&quot;2020-09-08T20:19:52.707702471+08:00&quot; level=info msg=&quot;API listen&gt;</span>
<span class="line">9月 08 20:19:52 zjt-lap-ubuntu-20 systemd[1]: Started Docker Application Container Engine.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-docker-的简易使用" tabindex="-1"><a class="header-anchor" href="#_3-docker-的简易使用"><span>3. Docker 的简易使用</span></a></h2><p>查看 docker 程序是否存在，功能是否正常：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ sudo docker info</span>
<span class="line">Client:</span>
<span class="line"> Debug Mode: false</span>
<span class="line"></span>
<span class="line">Server:</span>
<span class="line"> Containers: 0</span>
<span class="line">  Running: 0</span>
<span class="line">  Paused: 0</span>
<span class="line">  Stopped: 0</span>
<span class="line"> Images: 0</span>
<span class="line"> Server Version: 19.03.12</span>
<span class="line"> Storage Driver: overlay2</span>
<span class="line">  Backing Filesystem: extfs</span>
<span class="line">  Supports d_type: true</span>
<span class="line">  Native Overlay Diff: true</span>
<span class="line"> Logging Driver: json-file</span>
<span class="line"> Cgroup Driver: cgroupfs</span>
<span class="line"> Plugins:</span>
<span class="line">  Volume: local</span>
<span class="line">  Network: bridge host ipvlan macvlan null overlay</span>
<span class="line">  Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog</span>
<span class="line"> Swarm: inactive</span>
<span class="line"> Runtimes: runc</span>
<span class="line"> Default Runtime: runc</span>
<span class="line"> Init Binary: docker-init</span>
<span class="line"> containerd version: 7ad184331fa3e55e52b890ea95e65ba581ae3429</span>
<span class="line"> runc version: dc9208a3303feef5b3839f4323d9beb36df0a9dd</span>
<span class="line"> init version: fec3683</span>
<span class="line"> Security Options:</span>
<span class="line">  apparmor</span>
<span class="line">  seccomp</span>
<span class="line">   Profile: default</span>
<span class="line"> Kernel Version: 5.4.0-45-generic</span>
<span class="line"> Operating System: Ubuntu 20.04.1 LTS</span>
<span class="line"> OSType: linux</span>
<span class="line"> Architecture: x86_64</span>
<span class="line"> CPUs: 8</span>
<span class="line"> Total Memory: 15.51GiB</span>
<span class="line"> Name: zjt-lap-ubuntu-20</span>
<span class="line"> ID: TYBM:QZMD:FTXJ:L7E7:MNWE:QRQ2:R5TD:2OV2:P7TU:BDTG:7OVO:6DIT</span>
<span class="line"> Docker Root Dir: /var/lib/docker</span>
<span class="line"> Debug Mode: false</span>
<span class="line"> Registry: https://index.docker.io/v1/</span>
<span class="line"> Labels:</span>
<span class="line"> Experimental: false</span>
<span class="line"> Insecure Registries:</span>
<span class="line">  127.0.0.0/8</span>
<span class="line"> Live Restore Enabled: false</span>
<span class="line"></span>
<span class="line">WARNING: No swap limit support</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>docker run</code> 来启动第一个 Docker 容器。首次启动时，Docker 会在本地检查是否存在镜像，如果没有，则会到 Registry 上拉取镜像。</p><ul><li><code>-i</code> 表示容器的 <code>STDIN</code> 开启</li><li><code>-t</code> 表示 Docker 要为容器分配一个伪 tty 终端</li></ul><p>上述两个选项用于启动一个交互式的容器。<code>ubuntu</code> 是要启动的镜像，<code>/bin/bash</code> 是镜像启动后执行的命令。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> run <span class="token parameter variable">-i</span> <span class="token parameter variable">-t</span> ubuntu /bin/bash</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在交互式容器中查看 <code>/etc/hosts</code> 文件，可以看到容器有了自己的网卡和 IP 地址。在退出交互式容器的 bash 后，容器停止运行，但镜像依旧存在。通过以下命令可以查看所有的容器 (已停止的和正在运行的)：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ sudo docker ps -a</span>
<span class="line">CONTAINER ID        IMAGE               COMMAND             CREATED              STATUS                          PORTS               NAMES</span>
<span class="line">df7c6d1e9349        hello-world         &quot;/hello&quot;            About a minute ago   Exited (0) About a minute ago                       laughing_fermat</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Docker 会为每一个容器自动生成一个随机的名称。如果想要自行指定容器名称，可以在 <code>docker run</code> 命令中显式指定。容器的命名有助于分辨容器。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> run <span class="token parameter variable">--name</span> mycontainer <span class="token parameter variable">-i</span> <span class="token parameter variable">-t</span> ubuntu /bin/bash</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>通过以下命令重新启动一个容器：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> start mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>附着到一个正在运行的容器上：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> attach mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>创建一个后台运行的守护式容器：在 <code>docker run</code> 命令上加上 <code>-d</code> 参数。通过以下命令可以查看容器的日志。与 <code>tail</code> 命令十分类似。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> logs mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>查看容器内部的进程：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> <span class="token function">top</span> mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>显示一个或多个容器的统计信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> stats mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在容器内部启动新进程：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-d</span> mycontainer <span class="token function">touch</span> /etc/new_config_file <span class="token comment"># 后台进程</span></span>
<span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-t</span> <span class="token parameter variable">-i</span> mycontainer /bin/bash <span class="token comment"># 交互式进程</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>停止守护式容器：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> stop mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在 <code>docker run</code> 命令中加入 <code>--restart</code> 选项，可以使 Docker 检查容器的退出代码后，决定是否要重启容器。查看更多的容器信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> inspect mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>如果容器不再被使用，则可以删除：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">sudo</span> <span class="token function">docker</span> <span class="token function">rm</span> mycontainer</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><hr>`,48)]))}const t=n(l,[["render",c],["__file","Docker Overview.html.vue"]]),p=JSON.parse('{"path":"/notes/Docker/Docker%20Overview.html","title":"Docker - Overview","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"1. 简介","slug":"_1-简介","link":"#_1-简介","children":[]},{"level":2,"title":"2. Docker 守护进程","slug":"_2-docker-守护进程","link":"#_2-docker-守护进程","children":[]},{"level":2,"title":"3. Docker 的简易使用","slug":"_3-docker-的简易使用","link":"#_3-docker-的简易使用","children":[]}],"git":{},"filePathRelative":"notes/Docker/Docker Overview.md"}');export{t as comp,p as data};
