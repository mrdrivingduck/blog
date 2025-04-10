import{_ as e,c as s,a,o as i}from"./app-CT9FvwxE.js";const l={};function t(r,n){return i(),s("div",null,n[0]||(n[0]=[a(`<h1 id="chapter-9-understanding-your-network-and-its-configuration" tabindex="-1"><a class="header-anchor" href="#chapter-9-understanding-your-network-and-its-configuration"><span>Chapter 9 - Understanding your Network and its Configuration</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 07 / 07 20:50</p><p>@NUAA, Nanjing, Jiangsu, China</p><hr><p>这章里的大部分知识以前上课都学过了</p><p>记几个常用命令拉倒了 😑</p><hr><h2 id="_9-4-routes-and-the-kernel-routing-table" tabindex="-1"><a class="header-anchor" href="#_9-4-routes-and-the-kernel-routing-table"><span>9.4 Routes and the Kernel Routing Table</span></a></h2><p>内核通过路由表决定将 packet 路由到何处：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ route -n</span>
<span class="line">内核 IP 路由表</span>
<span class="line">目标            网关            子网掩码        标志  跃点   引用  使用 接口</span>
<span class="line">0.0.0.0         192.168.2.100   0.0.0.0         UG    100    0        0 enp4s0</span>
<span class="line">169.254.0.0     0.0.0.0         255.255.0.0     U     1000   0        0 enp4s0</span>
<span class="line">192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 enp4s0</span>
<span class="line">$ route</span>
<span class="line">内核 IP 路由表</span>
<span class="line">目标            网关            子网掩码        标志  跃点   引用  使用 接口</span>
<span class="line">default         _gateway        0.0.0.0         UG    100    0        0 enp4s0</span>
<span class="line">link-local      0.0.0.0         255.255.0.0     U     1000   0        0 enp4s0</span>
<span class="line">192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 enp4s0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>目标 + 子网掩码两列决定了对应目标网络</li><li>标识位中，<code>U</code> 表示 <em>Up</em>，即有效</li><li>标识位中，<code>G</code> 表示 <em>Gateway</em>，即所有符合该路由记录的 packet 都会被送到网关</li></ul><p>如果同时满足路由表中的多条记录，根据 CIDR，匹配网络前缀相同最长的那一个。</p><h2 id="_9-8-introduction-to-network-interface-configuration" tabindex="-1"><a class="header-anchor" href="#_9-8-introduction-to-network-interface-configuration"><span>9.8 Introduction to Network Interface Configuration</span></a></h2><h3 id="_9-8-1-manually-adding-and-deleting-routes" tabindex="-1"><a class="header-anchor" href="#_9-8-1-manually-adding-and-deleting-routes"><span>9.8.1 Manually Adding and Deleting Routes</span></a></h3><p>通过 <code>route</code> 命令能够手动增加或删除路由。</p><h2 id="_9-12-resolving-hostnames" tabindex="-1"><a class="header-anchor" href="#_9-12-resolving-hostnames"><span>9.12 Resolving Hostnames</span></a></h2><p>DNS 解析过程：</p><ol><li>应用程序调用函数，查找 IP 地址下的域名，函数位于系统的 shared library</li><li>Shared library 中的函数根据 <code>/etc/nsswitch.conf</code> 中的规则决定查找的行为，比如在查找 DNS 之前，检查 <code>/etc/hosts</code> 中的手动覆盖</li><li>当函数决定查找 DNS 时，查找额外的配置文件 <code>/etc/resolv.conf</code>，取得 DNS 域名服务器的 IP 地址</li><li>函数向域名服务器发送 DNS 查找请求</li><li>域名服务器返回对应域名的 IP 地址，函数将 IP 地址返回给应用</li></ol><h2 id="_9-14-the-transport-layer-tcp-udp-and-services" tabindex="-1"><a class="header-anchor" href="#_9-14-the-transport-layer-tcp-udp-and-services"><span>9.14 The Transport Layer: TCP, UDP, and Services</span></a></h2><h3 id="_9-14-1-tcp-ports-and-connections" tabindex="-1"><a class="header-anchor" href="#_9-14-1-tcp-ports-and-connections"><span>9.14.1 TCP Ports and Connections</span></a></h3><p>查看本机目前已经建立的连接：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ netstat -nt</span>
<span class="line">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>
<span class="line">tcp        0    192 192.168.2.104:22        192.168.2.102:50660     ESTABLISHED</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>-n</code> 表示取消域名显示</li><li><code>-t</code> 表示只显示 TCP 连接</li></ul><h3 id="_9-14-2-establishing-tcp-connections" tabindex="-1"><a class="header-anchor" href="#_9-14-2-establishing-tcp-connections"><span>9.14.2 Establishing TCP Connections</span></a></h3><p>为了建立连接，必须有一个进程正在监听某个端口。通常来说，监听的端口都是提供熟知服务的，而发起连接的端口是动态分配的。查看所有正被监听的 TCP 端口：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ netstat -ntl</span>
<span class="line">激活Internet连接 (仅服务器)</span>
<span class="line">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>
<span class="line">tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN</span>
<span class="line">tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN</span>
<span class="line">tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN</span>
<span class="line">tcp6       0      0 :::22                   :::*                    LISTEN</span>
<span class="line">tcp6       0      0 ::1:631                 :::*                    LISTEN</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_9-14-3-port-numbers-and-etc-services" tabindex="-1"><a class="header-anchor" href="#_9-14-3-port-numbers-and-etc-services"><span>9.14.3 Port Numbers and /etc/services</span></a></h3><p>在 <code>/etc/services</code> 中可以查到熟知端口号和对应的服务：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ cat /etc/services</span>
<span class="line"># Network services, Internet style</span>
<span class="line">#</span>
<span class="line"># Note that it is presently the policy of IANA to assign a single well-known</span>
<span class="line"># port number for both TCP and UDP; hence, officially ports have two entries</span>
<span class="line"># even if the protocol doesn&#39;t support UDP operations.</span>
<span class="line">#</span>
<span class="line"># Updated from http://www.iana.org/assignments/port-numbers and other</span>
<span class="line"># sources like http://www.freebsd.org/cgi/cvsweb.cgi/src/etc/services .</span>
<span class="line"># New ports will be added on request if they have been officially assigned</span>
<span class="line"># by IANA and used in the real-world or are needed by a debian package.</span>
<span class="line"># If you need a huge list of used numbers please install the nmap package.</span>
<span class="line"></span>
<span class="line">tcpmux          1/tcp                           # TCP port service multiplexer</span>
<span class="line">echo            7/tcp</span>
<span class="line">echo            7/udp</span>
<span class="line">discard         9/tcp           sink null</span>
<span class="line">discard         9/udp           sink null</span>
<span class="line">systat          11/tcp          users</span>
<span class="line">daytime         13/tcp</span>
<span class="line">daytime         13/udp</span>
<span class="line">netstat         15/tcp</span>
<span class="line">qotd            17/tcp          quote</span>
<span class="line">msp             18/tcp                          # message send protocol</span>
<span class="line">msp             18/udp</span>
<span class="line">chargen         19/tcp          ttytst source</span>
<span class="line">chargen         19/udp          ttytst source</span>
<span class="line">ftp-data        20/tcp</span>
<span class="line">ftp             21/tcp</span>
<span class="line">fsp             21/udp          fspd</span>
<span class="line">ssh             22/tcp                          # SSH Remote Login Protocol</span>
<span class="line">telnet          23/tcp</span>
<span class="line">smtp            25/tcp          mail</span>
<span class="line">time            37/tcp          timserver</span>
<span class="line">time            37/udp          timserver</span>
<span class="line">rlp             39/udp          resource        # resource location</span>
<span class="line">nameserver      42/tcp          name            # IEN 116</span>
<span class="line">whois           43/tcp          nicname</span>
<span class="line">tacacs          49/tcp                          # Login Host Protocol (TACACS)</span>
<span class="line">tacacs          49/udp</span>
<span class="line">re-mail-ck      50/tcp                          # Remote Mail Checking Protocol</span>
<span class="line">re-mail-ck      50/udp</span>
<span class="line">domain          53/tcp                          # Domain Name Server</span>
<span class="line">domain          53/udp</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_9-17-configuring-linux-as-a-router" tabindex="-1"><a class="header-anchor" href="#_9-17-configuring-linux-as-a-router"><span>9.17 Configuring Linux as a Router</span></a></h2><p>Linux 内核默认不会自动将 packet 从一个子网传输到另一个子网，需要手动开启 IP 转发：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ sudo sysctl -w net.ipv4.ip_forward</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="_9-21-firewalls" tabindex="-1"><a class="header-anchor" href="#_9-21-firewalls"><span>9.21 Firewalls</span></a></h2><p>防火墙上位于路由器上，位于 Internet 和内部网络之间，又是也被称为 IP 过滤器。系统可以在以下情况中过滤 IP：</p><ul><li>收到一个 packet</li><li>发送一个 packet</li><li>转发 packet 到另一个 host 或网关</li></ul><p>防火墙在以上三种情况之前布设了检查点，用于：</p><ul><li>drop</li><li>reject</li><li>accept</li></ul><h3 id="_9-21-1-linux-firewall-basics" tabindex="-1"><a class="header-anchor" href="#_9-21-1-linux-firewall-basics"><span>9.21.1 Linux Firewall Basics</span></a></h3><p>在 Linux 中，一系列防火墙规则被称为 <em>chain</em>。chain 的集合组成了 <em>table</em>。内核使用特定的 chain 对 packet 进行检查，所有的相关数据结构都由内核维护，整个系统被称为 <em>iptables</em>。</p><p>用户空间命令 <code>iptables</code> 创建或修改规则。可能会有很多个 table，但平常的工作都可以在 filter table 中完成。filter table 中有三个基本的 chain：</p><ul><li>INPUT</li><li>OUTPUT</li><li>FORWARD</li></ul><h3 id="_9-21-2-setting-firewall-rules" tabindex="-1"><a class="header-anchor" href="#_9-21-2-setting-firewall-rules"><span>9.21.2 Setting Firewall Rules</span></a></h3><p>一大堆有关 <code>iptables</code> 的命令，不想看了，烦 😪</p>`,44)]))}const d=e(l,[["render",t],["__file","Chapter 9 - Understanding your Network and ites Configuration.html.vue"]]),p=JSON.parse('{"path":"/how-linux-works-notes/Chapter%209%20-%20Understanding%20your%20Network%20and%20ites%20Configuration.html","title":"Chapter 9 - Understanding your Network and its Configuration","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"9.4 Routes and the Kernel Routing Table","slug":"_9-4-routes-and-the-kernel-routing-table","link":"#_9-4-routes-and-the-kernel-routing-table","children":[]},{"level":2,"title":"9.8 Introduction to Network Interface Configuration","slug":"_9-8-introduction-to-network-interface-configuration","link":"#_9-8-introduction-to-network-interface-configuration","children":[{"level":3,"title":"9.8.1 Manually Adding and Deleting Routes","slug":"_9-8-1-manually-adding-and-deleting-routes","link":"#_9-8-1-manually-adding-and-deleting-routes","children":[]}]},{"level":2,"title":"9.12 Resolving Hostnames","slug":"_9-12-resolving-hostnames","link":"#_9-12-resolving-hostnames","children":[]},{"level":2,"title":"9.14 The Transport Layer: TCP, UDP, and Services","slug":"_9-14-the-transport-layer-tcp-udp-and-services","link":"#_9-14-the-transport-layer-tcp-udp-and-services","children":[{"level":3,"title":"9.14.1 TCP Ports and Connections","slug":"_9-14-1-tcp-ports-and-connections","link":"#_9-14-1-tcp-ports-and-connections","children":[]},{"level":3,"title":"9.14.2 Establishing TCP Connections","slug":"_9-14-2-establishing-tcp-connections","link":"#_9-14-2-establishing-tcp-connections","children":[]},{"level":3,"title":"9.14.3 Port Numbers and /etc/services","slug":"_9-14-3-port-numbers-and-etc-services","link":"#_9-14-3-port-numbers-and-etc-services","children":[]}]},{"level":2,"title":"9.17 Configuring Linux as a Router","slug":"_9-17-configuring-linux-as-a-router","link":"#_9-17-configuring-linux-as-a-router","children":[]},{"level":2,"title":"9.21 Firewalls","slug":"_9-21-firewalls","link":"#_9-21-firewalls","children":[{"level":3,"title":"9.21.1 Linux Firewall Basics","slug":"_9-21-1-linux-firewall-basics","link":"#_9-21-1-linux-firewall-basics","children":[]},{"level":3,"title":"9.21.2 Setting Firewall Rules","slug":"_9-21-2-setting-firewall-rules","link":"#_9-21-2-setting-firewall-rules","children":[]}]}],"git":{},"filePathRelative":"how-linux-works-notes/Chapter 9 - Understanding your Network and ites Configuration.md"}');export{d as comp,p as data};
