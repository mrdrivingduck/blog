import{_ as n,o as e,c as s,e as i}from"./app-25fa875f.js";const d={},a=i(`<h1 id="docker-volume-network-usage" tabindex="-1"><a class="header-anchor" href="#docker-volume-network-usage" aria-hidden="true">#</a> Docker - Volume &amp; Network Usage</h1><p>Created by : Mr Dk.</p><p>2020 / 09 / 08 23:04</p><p>Nanjing, Jiangsu, China</p><hr><p>通过一个最简单的例子来了解 Docker 中的 <strong>卷 (volume)</strong> 和网络。例子很简单：在 Docker 中运行一个 Nginx，Nginx 的静态资源目录 (比如网页代码) 位于宿主机上，并以卷的形式挂在到容器中。然后在宿主机上访问容器中的 Nginx 监听的端口。</p><h2 id="准备工作" tabindex="-1"><a class="header-anchor" href="#准备工作" aria-hidden="true">#</a> 准备工作</h2><p>首先准备一个能够在容器中启动 Nginx 的镜像：</p><ol><li>准备好操作系统 (基础镜像)，并安装 Nginx</li><li>将 Nginx 的配置文件在宿主机上提前准备好，使用 <code>ADD</code> 指令复制到镜像中</li><li>指明从镜像启动的容器暴露自己的 <code>80</code> 端口</li></ol><p>其余上述思想，实现了一个 Dockerfile。Dockerfile 所在目录的组织方式如下：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ tree -a
.
├── Dockerfile
├── nginx
│   ├── global.conf
│   └── nginx.conf
└── src
    └── index.html

2 directories, 4 files
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Dockerfile 具体指令如下：</p><div class="language-docker line-numbers-mode" data-ext="docker"><pre class="language-docker"><code><span class="token instruction"><span class="token keyword">FROM</span> ubuntu:20.04</span>
<span class="token instruction"><span class="token keyword">MAINTAINER</span> mrdrivingduck <span class="token string">&quot;mrdrivingduck@gmail.com&quot;</span></span>
<span class="token instruction"><span class="token keyword">RUN</span> sed -i <span class="token string">&#39;s/archive.ubuntu.com/mirrors.ustc.edu.cn/g&#39;</span> /etc/apt/sources.list</span>
<span class="token instruction"><span class="token keyword">RUN</span> apt-get -yqq update &amp;&amp; apt-get -yqq install nginx</span>
<span class="token instruction"><span class="token keyword">RUN</span> mkdir -p /var/www/html/website</span>
<span class="token instruction"><span class="token keyword">ADD</span> nginx/global.conf /etc/nginx/conf.d/</span>
<span class="token instruction"><span class="token keyword">ADD</span> nginx/nginx.conf /etc/nginx/nginx.conf</span>
<span class="token instruction"><span class="token keyword">EXPOSE</span> 80</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先来看看 Nginx 的两个配置文件吧。首先是 <code>nginx/global.conf</code>，会被复制到容器中的 <code>/etc/nginx/conf.d/</code> 下。其中指定了：</p><ol><li>监听本机 (容器) 的 <code>80</code> 端口</li><li>静态资源目录位于 <code>/var/www/html/website/</code></li><li>日志路径</li></ol><div class="language-nginx line-numbers-mode" data-ext="nginx"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">listen</span> 0.0.0.0:80</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">server_name</span> _</span><span class="token punctuation">;</span>

        <span class="token directive"><span class="token keyword">root</span> /var/www/html/website</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">index</span> index.html</span><span class="token punctuation">;</span>

        <span class="token directive"><span class="token keyword">access_log</span> /var/log/nginx/default_access.log</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">error_log</span> /var/log/nginx/default_error.log</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其次是 <code>nginx/nginx.conf</code>，将会被复制到 <code>/etc/nginx/</code> 下。可以看到 Nginx 被配置成了一个基本的 HTTP 服务器。注意，配置中的 <code>daemon off</code> 使得 Nginx 在容器中以交互模式运行。</p><div class="language-nginx line-numbers-mode" data-ext="nginx"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">user</span> www-data</span><span class="token punctuation">;</span>
<span class="token directive"><span class="token keyword">worker_processes</span> <span class="token number">4</span></span><span class="token punctuation">;</span>
<span class="token directive"><span class="token keyword">pid</span> /run/nginx.pid</span><span class="token punctuation">;</span>
<span class="token directive"><span class="token keyword">daemon</span> <span class="token boolean">off</span></span><span class="token punctuation">;</span>

<span class="token directive"><span class="token keyword">events</span></span> <span class="token punctuation">{</span>  <span class="token punctuation">}</span>

<span class="token directive"><span class="token keyword">http</span></span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">sendfile</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">tcp_nopush</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">tcp_nodelay</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">keepalive_timeout</span> <span class="token number">65</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">types_hash_max_size</span> <span class="token number">2048</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">include</span> /etc/nginx/mime.types</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">default_type</span> application/octet-stream</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">access_log</span> /var/log/nginx/access.log</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">error_log</span> /var/log/nginx/error.log</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">gzip</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">gzip_disable</span> <span class="token string">&quot;msie6&quot;</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">include</span> /etc/nginx/conf.d/*.conf</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="构建镜像" tabindex="-1"><a class="header-anchor" href="#构建镜像" aria-hidden="true">#</a> 构建镜像</h2><p>接下来，使用 Dockerfile 构建镜像。</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker build -t mrdrivingduck/website .
Sending build context to Docker daemon  6.144kB
Step 1/8 : FROM ubuntu:20.04
 ---&gt; 4e2eef94cd6b
Step 2/8 : MAINTAINER mrdrivingduck &quot;mrdrivingduck@gmail.com&quot;
 ---&gt; Running in 88369a6f9503
Removing intermediate container 88369a6f9503
 ---&gt; 2e6504b82ad7
Step 3/8 : RUN sed -i &#39;s/archive.ubuntu.com/mirrors.ustc.edu.cn/g&#39; /etc/apt/sources.list
 ---&gt; Running in 66de419b4a0b
Removing intermediate container 66de419b4a0b
 ---&gt; 8705db5025d4
Step 4/8 : RUN apt-get -yqq update &amp;&amp; apt-get -yqq install nginx
 ---&gt; Running in 5397334a1984
Removing intermediate container 5397334a1984
 ---&gt; bc3ec63ef95e
Step 5/8 : RUN mkdir -p /var/www/html/website
 ---&gt; Running in be3b9e8b57af
Removing intermediate container be3b9e8b57af
 ---&gt; 1d854b54248b
Step 6/8 : ADD nginx/global.conf /etc/nginx/conf.d/
 ---&gt; 108f1e4a78cb
Step 7/8 : ADD nginx/nginx.conf /etc/nginx/nginx.conf
 ---&gt; 4b1099f18e8d
Step 8/8 : EXPOSE 80
 ---&gt; Running in 188934c22f2d
Removing intermediate container 188934c22f2d
 ---&gt; ea637a98908b
Successfully built ea637a98908b
Successfully tagged mrdrivingduck/website:latest
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>镜像构建完毕后，查看：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker image list
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
mrdrivingduck/website   latest              ea637a98908b        22 minutes ago      156MB
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="启动容器-卷" tabindex="-1"><a class="header-anchor" href="#启动容器-卷" aria-hidden="true">#</a> 启动容器 &amp; 卷</h2><p>接下来启动容器：</p><ol><li>容器以后台模式而非交互模型运行，所以使用 <code>-d</code> 选项</li><li>Dockerfile 的 <code>EXPOSE</code> 指令指定容器将暴露 <code>80</code> 端口，因此这里使用 <code>-p 80</code> 选项打开 <code>80</code> 端口</li><li>这个容器被我自行命名 <code>--name website</code></li><li>通过 <code>-v</code> 属性将宿主机下的 <code>$PWD/src</code> 目录作为卷挂载到容器中的 <code>/var/www/html/website</code> 目录</li><li>容器的启动命令为 <code>nginx</code></li></ol><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker run -d -p 80 --name website -v $PWD/src:/var/www/html/website mrdrivingduck/website nginx
7302af622f9810b14b2107111346bb56ea95f14d5ba8b7d4a00e0f96dbd1c816
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>容器以后台模式运行，因此命令返回一个容器 ID 后就结束了。可以看到容器正在运行：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker ps -a
CONTAINER ID        IMAGE                   COMMAND             CREATED             STATUS                      PORTS                   NAMES
7302af622f98        mrdrivingduck/website   &quot;nginx&quot;             7 seconds ago       Up 6 seconds                0.0.0.0:32770-&gt;80/tcp   website
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上面的信息中可以看到，容器的 <code>80</code> 端口被映射到了宿主机的 <code>32770</code> 端口上。因此，通过 <code>宿主机 IP:32770</code> 或 <code>容器 IP:80</code> 都可以访问容器中的 Nginx。这里我们用宿主机 IP 进行尝试。命令得到的 HTML 就是宿主机目录 <code>src/index.html</code> 中的内容。</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ curl localhost:32770
&lt;h1&gt;Hello Docker!&lt;/h1&gt;
$ curl localhost:32770
&lt;h1&gt;Hello Docker!&lt;/h1&gt;
&lt;p&gt;Edited On Host!&lt;/p&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为什么两次命令的结果不一样呢？因为在两条命令中间，我直接对宿主机上的 <code>src/index.html</code> 进行了编辑。这里就体现了 <strong>卷</strong> 的特性。卷是一个宿主机目录，它可以被一个或多个容器选定，绕过 Docker 的联合文件系统，直接 mount 到容器内的某个目录上。卷用于为 Docker 提供 <strong>持久数据</strong> 或 <strong>共享数据</strong>，对卷的修改会立刻生效。当提交或创建镜像时，卷不包含在其中。在我的理解中，卷有点像一个能同时插在多台电脑上的移动硬盘。</p><p>如果不想把应用或者代码构建到镜像中时 (比如只想在镜像中营造一个生产环境，但是开发中的代码位于宿主机上)，就体现出了卷的价值：</p><ul><li>同时对代码开发和测试</li><li>代码改动频繁，不想在开发过程中反复构建镜像</li><li>在多个容器之间共享代码</li></ul><p>在 <code>docker run</code> 命令中，通过 <code>-v source:target:ro</code> 指定卷的映射。如果容器内目录 <code>target</code> 不存在，Docker 会自动创建一个。在最后加上 <code>rw</code> 或 <code>ro</code> 来指定 <strong>容器内目录</strong> (<code>target</code>) 的读写权限。</p><h2 id="docker-的网络连接" tabindex="-1"><a class="header-anchor" href="#docker-的网络连接" aria-hidden="true">#</a> Docker 的网络连接</h2><p>上述的例子中，通过搭建了一个生产环境容器，成功地在开发的同时测试了代码在生产环境中的使用情况。而其中包含了一个细节：我们有多少种访问容器内 Nginx <code>80</code> 端口的方式？</p><ol><li>宿主机上的进程作为客户端访问</li><li>在容器内的其它进程作为客户端访问</li><li><strong>其它容器内的进程作为客户端访问</strong></li></ol><p>这里就涉及到了 Docker 的网络连接是如何实现的。Docker 中有三种网络连接方式：</p><ol><li>Docker 内部网络 (不太灵活)</li><li>Docker Networking (After Docker 1.9，推荐)</li><li>Docker 链接</li></ol><h3 id="docker-内部网络" tabindex="-1"><a class="header-anchor" href="#docker-内部网络" aria-hidden="true">#</a> Docker 内部网络</h3><p>在默认情况下，Docker 容器都是公开端口并绑定到宿主机的网络接口上，这样可以把 Docker 内提供的服务放到宿主机所在的外部网络上公开。在安装 Docker 时，会创建一个新的网络接口 <code>docker0</code>。每个 Docker 容器都会在这个接口上被分配 IP 地址：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ ifconfig
docker0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        inet6 fe80::42:6ff:feae:e946  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether 02:42:06:ae:e9:46  txqueuelen 0  (Ethernet)
        RX packets 21599  bytes 1191336 (1.1 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 42554  bytes 63422188 (63.4 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

veth0f97e6d: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet6 fe80::6ca3:8bff:fe50:3210  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether 6e:a3:8b:50:32:10  txqueuelen 0  (Ethernet)
        RX packets 28  bytes 2858 (2.8 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 70  bytes 7060 (7.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Docker 会使用一个 <code>172.17.x.x</code> 的子网作为 Docker 内部网络，<code>docker0</code> 对应的 IP 地址也就是这个网络的网关。<code>docker0</code> 是一个虚拟的以太网桥。Docker 每创建一个容器，就会创建一组互相连接的网络接口，与 <strong>管道</strong> 类似。管道的一端连接容器内的虚拟网卡 (如 <code>eth0</code>，IP 地址也在子网中)，管道的另一端以 <code>veth*</code> 的名称连接到宿主机的 <code>docker0</code> 上。由此，Docker 将维护一个虚拟子网，由宿主机和所有 Docker 容器共享。</p><p>Docker 内部网络的互连还受宿主机的 <strong>防火墙规则</strong> 与 <strong>NAT 配置</strong> 的影响。在默认情况下，宿主机无法访问容器；只有明确指定了打开的端口，宿主机与容器才能够通信。以上面的应用场景为例，可以在路由表中看到容器的 <code>80</code> 端口与宿主机 <code>32770</code> 端口的通信规则：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo iptables -t nat -L -n
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination
DOCKER     all  --  0.0.0.0/0            0.0.0.0/0            ADDRTYPE match dst-type LOCAL

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
DOCKER     all  --  0.0.0.0/0           !127.0.0.0/8          ADDRTYPE match dst-type LOCAL

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  all  --  172.17.0.0/16        0.0.0.0/0
MASQUERADE  tcp  --  172.17.0.2           172.17.0.2           tcp dpt:80

Chain DOCKER (2 references)
target     prot opt source               destination
RETURN     all  --  0.0.0.0/0            0.0.0.0/0
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:32770 to:172.17.0.2:80
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过以下命令，可以查看容器的网络详情：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker inspect website
[
    {
        &quot;Id&quot;: &quot;7302af622f9810b14b2107111346bb56ea95f14d5ba8b7d4a00e0f96dbd1c816&quot;,
        ...
        &quot;NetworkSettings&quot;: {
            &quot;Bridge&quot;: &quot;&quot;,
            &quot;SandboxID&quot;: &quot;bb4af0908c0eb3663ab86175bbc4cab01d11e5547390348b9d963fa5e951ba22&quot;,
            &quot;HairpinMode&quot;: false,
            &quot;LinkLocalIPv6Address&quot;: &quot;&quot;,
            &quot;LinkLocalIPv6PrefixLen&quot;: 0,
            &quot;Ports&quot;: {
                &quot;80/tcp&quot;: [
                    {
                        &quot;HostIp&quot;: &quot;0.0.0.0&quot;,
                        &quot;HostPort&quot;: &quot;32770&quot;
                    }
                ]
            },
            &quot;SandboxKey&quot;: &quot;/var/run/docker/netns/bb4af0908c0e&quot;,
            &quot;SecondaryIPAddresses&quot;: null,
            &quot;SecondaryIPv6Addresses&quot;: null,
            &quot;EndpointID&quot;: &quot;9bd094ac1d2e4bc247fa843a5db32e921d995d357a4c57be8035db9e7eef960d&quot;,
            &quot;Gateway&quot;: &quot;172.17.0.1&quot;,
            &quot;GlobalIPv6Address&quot;: &quot;&quot;,
            &quot;GlobalIPv6PrefixLen&quot;: 0,
            &quot;IPAddress&quot;: &quot;172.17.0.2&quot;,
            &quot;IPPrefixLen&quot;: 16,
            &quot;IPv6Gateway&quot;: &quot;&quot;,
            &quot;MacAddress&quot;: &quot;02:42:ac:11:00:02&quot;,
            &quot;Networks&quot;: {
                &quot;bridge&quot;: {
                    &quot;IPAMConfig&quot;: null,
                    &quot;Links&quot;: null,
                    &quot;Aliases&quot;: null,
                    &quot;NetworkID&quot;: &quot;062db7d45781261af12df968dc9c139df61ba129ed8f5b356c5f90851e0ae361&quot;,
                    &quot;EndpointID&quot;: &quot;9bd094ac1d2e4bc247fa843a5db32e921d995d357a4c57be8035db9e7eef960d&quot;,
                    &quot;Gateway&quot;: &quot;172.17.0.1&quot;,
                    &quot;IPAddress&quot;: &quot;172.17.0.2&quot;,
                    &quot;IPPrefixLen&quot;: 16,
                    &quot;IPv6Gateway&quot;: &quot;&quot;,
                    &quot;GlobalIPv6Address&quot;: &quot;&quot;,
                    &quot;GlobalIPv6PrefixLen&quot;: 0,
                    &quot;MacAddress&quot;: &quot;02:42:ac:11:00:02&quot;,
                    &quot;DriverOpts&quot;: null
                }
            }
        }
    }
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从上面的信息中可以看到，容器的 IP 地址为 <code>172.17.0.2</code>，与宿主机网关 <code>172.17.0.1</code> 在同一个子网中。因此，不仅通过宿主机 IP 地址可以访问到容器的的 Nginx (<code>172.17.0.1:32770</code>)，还可以通过容器 IP 地址访问 Nginx (<code>172.17.0.2:80</code>)。</p><p>这种容器局域网网络看似简单，但很不灵活：</p><ol><li>需要根据容器的 IP 地址进行硬编码</li><li>重启容器后，Docker 会给容器分配新的 IP 地址</li></ol><h3 id="docker-networking" tabindex="-1"><a class="header-anchor" href="#docker-networking" aria-hidden="true">#</a> Docker Networking</h3><p>Docker Networking 允许用户自行创建网络，甚至支持跨不同宿主机的容器间通信，网络配置也可以更加灵活地定制。想要使用这一套机制，首先需要 <strong>创建一个网络</strong>，然后在这个网络下启动容器。首先建立一个名为 <code>mynet</code> 的网络：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker network create mynet
08e97c3f58b9b128c5958b36e96c769b3c242ea55ab21af175b12cb40ffcadf7

$ sudo docker network inspect mynet
[
    {
        &quot;Name&quot;: &quot;mynet&quot;,
        &quot;Id&quot;: &quot;08e97c3f58b9b128c5958b36e96c769b3c242ea55ab21af175b12cb40ffcadf7&quot;,
        &quot;Created&quot;: &quot;2020-09-08T22:27:32.178555856+08:00&quot;,
        &quot;Scope&quot;: &quot;local&quot;,
        &quot;Driver&quot;: &quot;bridge&quot;,
        &quot;EnableIPv6&quot;: false,
        &quot;IPAM&quot;: {
            &quot;Driver&quot;: &quot;default&quot;,
            &quot;Options&quot;: {},
            &quot;Config&quot;: [
                {
                    &quot;Subnet&quot;: &quot;172.18.0.0/16&quot;,
                    &quot;Gateway&quot;: &quot;172.18.0.1&quot;
                }
            ]
        },
        &quot;Internal&quot;: false,
        &quot;Attachable&quot;: false,
        &quot;Ingress&quot;: false,
        &quot;ConfigFrom&quot;: {
            &quot;Network&quot;: &quot;&quot;
        },
        &quot;ConfigOnly&quot;: false,
        &quot;Containers&quot;: {},
        &quot;Options&quot;: {},
        &quot;Labels&quot;: {}
    }
]

$ sudo docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
062db7d45781        bridge              bridge              local
f88e74985810        host                host                local
08e97c3f58b9        mynet               bridge              local
abdf15c3754d        none                null                local
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到这个网络的网关为 <code>172.18.0.1</code>，这是一个新的子网，且暂时没有任何容器在其中。再重新启动容器时，需要在 <code>docker run</code> 命令中启用 <code>--net=mynet</code> 显式将容器启动在新的网络中。然后再重新查看以下网络：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo docker rm website
website

$ sudo docker run -d -p 80 --name website --net=mynet -v $PWD/src:/var/www/html/website mrdrivingduck/website nginx
f550227293ff831255b76972011ee88120a7d44fadf29e2cd92161e9d5704d7b

$ sudo docker network inspect mynet
[
    {
        &quot;Name&quot;: &quot;mynet&quot;,
        ...
        &quot;Containers&quot;: {
            &quot;f550227293ff831255b76972011ee88120a7d44fadf29e2cd92161e9d5704d7b&quot;: {
                &quot;Name&quot;: &quot;website&quot;,
                &quot;EndpointID&quot;: &quot;61a412d1bc738020e606800e74fac45ff9dc85a45d2463b9cac0866b3691d377&quot;,
                &quot;MacAddress&quot;: &quot;02:42:ac:12:00:02&quot;,
                &quot;IPv4Address&quot;: &quot;172.18.0.2/16&quot;,
                &quot;IPv6Address&quot;: &quot;&quot;
            }
        },
        &quot;Options&quot;: {},
        &quot;Labels&quot;: {}
    }
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到运行 Nginx 的容器已经被加入到网络中。这与之前的内部网络相比，到底灵活在哪呢？Docker 将会自动感知所有在这个网络下运行的容器，并将容器的网络信息保存到 <code>/etc/hosts</code> 中。在该文件中，除了该容器本身的 IP 地址，还会保存网络内其它容器的 IP 地址，并映射到 <code>&lt;container_name&gt;.&lt;network_name&gt;</code> 形式的域名上。重要的是，当任意一个容器重启时，其 IP 地址信息会自动在网络内所有容器的 <code>/etc/hosts</code> 中更新。如果容器内的上层应用全部使用 <strong>域名</strong> 而不是 IP 地址，那么容器的重启不会对应用程序产生影响。</p><p>通过 <code>docker network connect &lt;network_name&gt; &lt;container_name&gt;</code> 命令，可以将一个正在运行的容器添加到特定网络中。同理，<code>docker network disconnect</code> 就不多说。另外，一个容器还可以 <strong>同时隶属多个网络</strong>，从而构建复杂的网络模型。</p><h3 id="docker-链接" tabindex="-1"><a class="header-anchor" href="#docker-链接" aria-hidden="true">#</a> Docker 链接</h3><p>在 Docker 1.9 之前推荐这种方式。让一个容器链接到另一个容器是个简单的过程，只需要引用两个容器的名字就好了。先启动第一个容器，然后启动第二个容器时，在 <code>docker run</code> 命令中附加 <code>--link &lt;target_container&gt;:&lt;link_alias&gt;</code>。其中，第二个容器是 <strong>客户容器</strong>，要链接到的目标容器是 <strong>服务容器</strong>。容器启动后，会将 <code>--link</code> 中的参数添加到 <code>/etc/hosts</code> 中。在这样的链接后，只有客户容器可以直接访问服务容器的公开端口，而其它容器不行；服务容器的端口也不需要对宿主机公开。由此，这个模型非常安全，可以限制容器化应用程序的被攻击面，减少容器暴露的端口。</p><p>可以将多个客户容器链接到一个服务容器上。容器链接目前只能工作于同一台 Docker 宿主机中。</p><p>Docker 在建立容器间的链接时，会在自动创建一些以 <strong>链接别名</strong> 命名的环境变量，包含了丰富的链接信息。</p><h3 id="灵活性" tabindex="-1"><a class="header-anchor" href="#灵活性" aria-hidden="true">#</a> 灵活性</h3><p>所谓的灵活性，就是避免在应用程序进行容器间通信时使用硬编码的 IP 地址。根据上述三种网络连接方式，灵活性通过以下两种方法保证：</p><ol><li>利用环境变量中的连接信息</li><li>利用 <code>/etc/hosts</code> 中的 DNS 映射信息</li></ol><hr>`,66),o=[a];function l(c,t){return e(),s("div",null,o)}const u=n(d,[["render",l],["__file","Docker Volume _ Network Usage.html.vue"]]);export{u as default};
