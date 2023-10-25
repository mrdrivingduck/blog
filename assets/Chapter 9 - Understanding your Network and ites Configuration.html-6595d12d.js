import{_ as e,o as n,c as i,e as a}from"./app-25fa875f.js";const s={},d=a(`<h1 id="chapter-9-understanding-your-network-and-its-configuration" tabindex="-1"><a class="header-anchor" href="#chapter-9-understanding-your-network-and-its-configuration" aria-hidden="true">#</a> Chapter 9 - Understanding your Network and its Configuration</h1><p>Created by : Mr Dk.</p><p>2019 / 07 / 07 20:50</p><p>@NUAA, Nanjing, Jiangsu, China</p><hr><p>这章里的大部分知识以前上课都学过了</p><p>记几个常用命令拉倒了 😑</p><hr><h2 id="_9-4-routes-and-the-kernel-routing-table" tabindex="-1"><a class="header-anchor" href="#_9-4-routes-and-the-kernel-routing-table" aria-hidden="true">#</a> 9.4 Routes and the Kernel Routing Table</h2><p>内核通过路由表决定将 packet 路由到何处：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ route -n
内核 IP 路由表
目标            网关            子网掩码        标志  跃点   引用  使用 接口
0.0.0.0         192.168.2.100   0.0.0.0         UG    100    0        0 enp4s0
169.254.0.0     0.0.0.0         255.255.0.0     U     1000   0        0 enp4s0
192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 enp4s0
$ route
内核 IP 路由表
目标            网关            子网掩码        标志  跃点   引用  使用 接口
default         _gateway        0.0.0.0         UG    100    0        0 enp4s0
link-local      0.0.0.0         255.255.0.0     U     1000   0        0 enp4s0
192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 enp4s0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>目标 + 子网掩码两列决定了对应目标网络</li><li>标识位中，<code>U</code> 表示 <em>Up</em>，即有效</li><li>标识位中，<code>G</code> 表示 <em>Gateway</em>，即所有符合该路由记录的 packet 都会被送到网关</li></ul><p>如果同时满足路由表中的多条记录，根据 CIDR，匹配网络前缀相同最长的那一个。</p><h2 id="_9-8-introduction-to-network-interface-configuration" tabindex="-1"><a class="header-anchor" href="#_9-8-introduction-to-network-interface-configuration" aria-hidden="true">#</a> 9.8 Introduction to Network Interface Configuration</h2><h3 id="_9-8-1-manually-adding-and-deleting-routes" tabindex="-1"><a class="header-anchor" href="#_9-8-1-manually-adding-and-deleting-routes" aria-hidden="true">#</a> 9.8.1 Manually Adding and Deleting Routes</h3><p>通过 <code>route</code> 命令能够手动增加或删除路由。</p><h2 id="_9-12-resolving-hostnames" tabindex="-1"><a class="header-anchor" href="#_9-12-resolving-hostnames" aria-hidden="true">#</a> 9.12 Resolving Hostnames</h2><p>DNS 解析过程：</p><ol><li>应用程序调用函数，查找 IP 地址下的域名，函数位于系统的 shared library</li><li>Shared library 中的函数根据 <code>/etc/nsswitch.conf</code> 中的规则决定查找的行为，比如在查找 DNS 之前，检查 <code>/etc/hosts</code> 中的手动覆盖</li><li>当函数决定查找 DNS 时，查找额外的配置文件 <code>/etc/resolv.conf</code>，取得 DNS 域名服务器的 IP 地址</li><li>函数向域名服务器发送 DNS 查找请求</li><li>域名服务器返回对应域名的 IP 地址，函数将 IP 地址返回给应用</li></ol><h2 id="_9-14-the-transport-layer-tcp-udp-and-services" tabindex="-1"><a class="header-anchor" href="#_9-14-the-transport-layer-tcp-udp-and-services" aria-hidden="true">#</a> 9.14 The Transport Layer: TCP, UDP, and Services</h2><h3 id="_9-14-1-tcp-ports-and-connections" tabindex="-1"><a class="header-anchor" href="#_9-14-1-tcp-ports-and-connections" aria-hidden="true">#</a> 9.14.1 TCP Ports and Connections</h3><p>查看本机目前已经建立的连接：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ netstat -nt
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0    192 192.168.2.104:22        192.168.2.102:50660     ESTABLISHED
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>-n</code> 表示取消域名显示</li><li><code>-t</code> 表示只显示 TCP 连接</li></ul><h3 id="_9-14-2-establishing-tcp-connections" tabindex="-1"><a class="header-anchor" href="#_9-14-2-establishing-tcp-connections" aria-hidden="true">#</a> 9.14.2 Establishing TCP Connections</h3><p>为了建立连接，必须有一个进程正在监听某个端口。通常来说，监听的端口都是提供熟知服务的，而发起连接的端口是动态分配的。查看所有正被监听的 TCP 端口：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ netstat -ntl
激活Internet连接 (仅服务器)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
tcp6       0      0 ::1:631                 :::*                    LISTEN
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_9-14-3-port-numbers-and-etc-services" tabindex="-1"><a class="header-anchor" href="#_9-14-3-port-numbers-and-etc-services" aria-hidden="true">#</a> 9.14.3 Port Numbers and /etc/services</h3><p>在 <code>/etc/services</code> 中可以查到熟知端口号和对应的服务：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ cat /etc/services
# Network services, Internet style
#
# Note that it is presently the policy of IANA to assign a single well-known
# port number for both TCP and UDP; hence, officially ports have two entries
# even if the protocol doesn&#39;t support UDP operations.
#
# Updated from http://www.iana.org/assignments/port-numbers and other
# sources like http://www.freebsd.org/cgi/cvsweb.cgi/src/etc/services .
# New ports will be added on request if they have been officially assigned
# by IANA and used in the real-world or are needed by a debian package.
# If you need a huge list of used numbers please install the nmap package.

tcpmux          1/tcp                           # TCP port service multiplexer
echo            7/tcp
echo            7/udp
discard         9/tcp           sink null
discard         9/udp           sink null
systat          11/tcp          users
daytime         13/tcp
daytime         13/udp
netstat         15/tcp
qotd            17/tcp          quote
msp             18/tcp                          # message send protocol
msp             18/udp
chargen         19/tcp          ttytst source
chargen         19/udp          ttytst source
ftp-data        20/tcp
ftp             21/tcp
fsp             21/udp          fspd
ssh             22/tcp                          # SSH Remote Login Protocol
telnet          23/tcp
smtp            25/tcp          mail
time            37/tcp          timserver
time            37/udp          timserver
rlp             39/udp          resource        # resource location
nameserver      42/tcp          name            # IEN 116
whois           43/tcp          nicname
tacacs          49/tcp                          # Login Host Protocol (TACACS)
tacacs          49/udp
re-mail-ck      50/tcp                          # Remote Mail Checking Protocol
re-mail-ck      50/udp
domain          53/tcp                          # Domain Name Server
domain          53/udp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_9-17-configuring-linux-as-a-router" tabindex="-1"><a class="header-anchor" href="#_9-17-configuring-linux-as-a-router" aria-hidden="true">#</a> 9.17 Configuring Linux as a Router</h2><p>Linux 内核默认不会自动将 packet 从一个子网传输到另一个子网，需要手动开启 IP 转发：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo sysctl -w net.ipv4.ip_forward
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="_9-21-firewalls" tabindex="-1"><a class="header-anchor" href="#_9-21-firewalls" aria-hidden="true">#</a> 9.21 Firewalls</h2><p>防火墙上位于路由器上，位于 Internet 和内部网络之间，又是也被称为 IP 过滤器。系统可以在以下情况中过滤 IP：</p><ul><li>收到一个 packet</li><li>发送一个 packet</li><li>转发 packet 到另一个 host 或网关</li></ul><p>防火墙在以上三种情况之前布设了检查点，用于：</p><ul><li>drop</li><li>reject</li><li>accept</li></ul><h3 id="_9-21-1-linux-firewall-basics" tabindex="-1"><a class="header-anchor" href="#_9-21-1-linux-firewall-basics" aria-hidden="true">#</a> 9.21.1 Linux Firewall Basics</h3><p>在 Linux 中，一系列防火墙规则被称为 <em>chain</em>。chain 的集合组成了 <em>table</em>。内核使用特定的 chain 对 packet 进行检查，所有的相关数据结构都由内核维护，整个系统被称为 <em>iptables</em>。</p><p>用户空间命令 <code>iptables</code> 创建或修改规则。可能会有很多个 table，但平常的工作都可以在 filter table 中完成。filter table 中有三个基本的 chain：</p><ul><li>INPUT</li><li>OUTPUT</li><li>FORWARD</li></ul><h3 id="_9-21-2-setting-firewall-rules" tabindex="-1"><a class="header-anchor" href="#_9-21-2-setting-firewall-rules" aria-hidden="true">#</a> 9.21.2 Setting Firewall Rules</h3><p>一大堆有关 <code>iptables</code> 的命令，不想看了，烦 😪</p>`,44),l=[d];function r(t,c){return n(),i("div",null,l)}const u=e(s,[["render",r],["__file","Chapter 9 - Understanding your Network and ites Configuration.html.vue"]]);export{u as default};
