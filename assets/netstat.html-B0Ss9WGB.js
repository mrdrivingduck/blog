import{_ as s,c as a,a as e,o as p}from"./app-CT9FvwxE.js";const t={};function l(c,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="netstat" tabindex="-1"><a class="header-anchor" href="#netstat"><span>netstat</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 12 / 17 16:49</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>netstat</code> 用于显示网络连接信息。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><p>其参数选项主要用于决定在输出中是否展示某些信息。所以输出信息的解读就比较重要。</p><p>输出分为两部分：</p><ul><li>Active Internet connections</li><li>Active UNIX domain Sockets</li></ul><h3 id="internet-connections" tabindex="-1"><a class="header-anchor" href="#internet-connections"><span>Internet Connections</span></a></h3><p>其中，对于活跃的互联网连接，输出的信息包含：</p><ul><li>Socket 协议：TCP / UDP / ...</li><li>接收队列：已经接收但未被拷贝到用户程序的字节数</li><li>发送队列：远程未确认的字节数</li><li>本地地址：本地 IP 和端口号（如果不加 <code>-n</code>，那么会被翻译为常见域名和应用程序名，比如 <code>localhost:mysql</code>）</li><li>远程地址</li><li>状态：主要是给 TCP Socket 使用</li><li>用户：Socket 所属的用户名或用户 ID</li><li>程序：使用 <code>--program</code> 引入这一列，显示这个 Socket 的进程名或进程号</li><li>定时器：与这个 Socket 相关的 TCP 定时器，需要使用 <code>--timers</code> 引入</li></ul><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">netstat</span> <span class="token parameter variable">-a</span> <span class="token parameter variable">--program</span> <span class="token parameter variable">--timers</span></span>
<span class="line"><span class="token punctuation">(</span>Not all processes could be identified, non-owned process info</span>
<span class="line"> will not be shown, you would have to be root to see it all.<span class="token punctuation">)</span></span>
<span class="line">Active Internet connections <span class="token punctuation">(</span>servers and established<span class="token punctuation">)</span></span>
<span class="line">Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name     Timer</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:8005          <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:8002          <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:8000          <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0.0</span>.0.0:ssh             <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:domain        <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:36147         <span class="token number">0.0</span>.0.0:*               LISTEN      <span class="token number">2853</span>/node            off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:mysql         <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:11211         <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:33060         <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:ipp           <span class="token number">0.0</span>.0.0:*               LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:36147         localhost:53890         ESTABLISHED <span class="token number">2853</span>/node            off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:ssh       <span class="token number">192.168</span>.0.103:61072     ESTABLISHED -                    keepalive <span class="token punctuation">(</span><span class="token number">5804.14</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:59186     <span class="token number">143.244</span>.210.202:https   TIME_WAIT   -                    timewait <span class="token punctuation">(</span><span class="token number">47.68</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:53890         localhost:36147         ESTABLISHED -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:50736     <span class="token number">124.221</span>.154.83:12700    ESTABLISHED -                    keepalive <span class="token punctuation">(</span><span class="token number">2.24</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>    <span class="token number">324</span> <span class="token number">192.168</span>.0.105:ssh       <span class="token number">192.168</span>.0.103:57526     ESTABLISHED -                    on <span class="token punctuation">(</span><span class="token number">0.20</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:53892         localhost:36147         ESTABLISHED -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:ssh       <span class="token number">192.168</span>.0.103:62188     ESTABLISHED -                    keepalive <span class="token punctuation">(</span><span class="token number">6399.66</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> localhost:36147         localhost:53892         ESTABLISHED <span class="token number">4285</span>/node            off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:ms-wbt-server      <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp6       <span class="token number">0</span>      <span class="token number">0</span> ip6-localhost:3350      <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:http               <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:ssh                <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">tcp6       <span class="token number">0</span>      <span class="token number">0</span> ip6-localhost:ipp       <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  LISTEN      -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0.0</span>.0.0:mdns            <span class="token number">0.0</span>.0.0:*                           -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0.0</span>.0.0:47784           <span class="token number">0.0</span>.0.0:*                           -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> localhost:domain        <span class="token number">0.0</span>.0.0:*                           -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:bootpc    <span class="token number">192.168</span>.0.1:bootps      ESTABLISHED -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0.0</span>.0.0:631             <span class="token number">0.0</span>.0.0:*                           -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp        <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">192.168</span>.0.105:43301     <span class="token number">192.168</span>.0.1:domain      ESTABLISHED -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:36812              <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                              -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">udp6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:mdns               <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                              -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line">raw6       <span class="token number">0</span>      <span class="token number">0</span> <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:ipv6-icmp          <span class="token punctuation">[</span>::<span class="token punctuation">]</span>:*                  <span class="token number">7</span>           -                    off <span class="token punctuation">(</span><span class="token number">0.00</span>/0/0<span class="token punctuation">)</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="unix-domain-sockets" tabindex="-1"><a class="header-anchor" href="#unix-domain-sockets"><span>UNIX Domain Sockets</span></a></h3><p>对于活跃的 UNIX Domain Sockets，打印的信息包含：</p><ul><li>协议</li><li>附着到这个 Socket 上的进程数（引用计数）</li><li>标志位</li><li>Socket 类型</li><li>状态</li><li>进程名 / 进程编号</li><li>路径</li></ul><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">netstat</span> <span class="token parameter variable">-a</span> <span class="token parameter variable">--program</span></span>
<span class="line"></span>
<span class="line">Active UNIX domain sockets <span class="token punctuation">(</span>servers and established<span class="token punctuation">)</span></span>
<span class="line">Proto RefCnt Flags       Type       State         I-Node   PID/Program name     Path</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">30243</span>    -                    /var/run/docker/libnetwork/c3ceef6d7bab.sock</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">27523</span>    -                    @/tmp/.ICE-unix/1617</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">35116</span>    -                    @/tmp/.X11-unix/X0</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">32384</span>    -                    @/var/lib/gdm3/.cache/ibus/dbus-LepPuSBi</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">35506</span>    <span class="token number">2135</span>/systemd         /run/user/1000/systemd/notify</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">30078</span>    -                    /run/user/125/systemd/notify</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">35509</span>    <span class="token number">2135</span>/systemd         /run/user/1000/systemd/private</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">30081</span>    -                    /run/user/125/systemd/private</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">35515</span>    <span class="token number">2135</span>/systemd         /run/user/1000/bus</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">32059</span>    -                    /run/user/125/bus</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">35517</span>    <span class="token number">2135</span>/systemd         /run/user/1000/gnupg/S.dirmngr</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">32061</span>    -                    /run/user/125/gnupg/S.dirmngr</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> ACC <span class="token punctuation">]</span>     STREAM     LISTENING     <span class="token number">35519</span>    <span class="token number">2135</span>/systemd         /run/user/1000/gnupg/S.gpg-agent.browser</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="网卡列表" tabindex="-1"><a class="header-anchor" href="#网卡列表"><span>网卡列表</span></a></h3><p>使用 <code>-i</code> 及 <code>-ie</code>（基本等价于 <code>ifconfig</code>）选项，可以看到所有网卡信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">netstat</span> <span class="token parameter variable">-i</span></span>
<span class="line">Kernel Interface table</span>
<span class="line">Iface      MTU    RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg</span>
<span class="line">docker0   <span class="token number">1500</span>        <span class="token number">0</span>      <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0</span>             <span class="token number">0</span>      <span class="token number">0</span>      <span class="token number">0</span>      <span class="token number">0</span> BMU</span>
<span class="line">enp4s0    <span class="token number">1500</span>   <span class="token number">340806</span>      <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0</span>        <span class="token number">134521</span>      <span class="token number">0</span>      <span class="token number">0</span>      <span class="token number">0</span> BMRU</span>
<span class="line">lo       <span class="token number">65536</span>    <span class="token number">41882</span>      <span class="token number">0</span>      <span class="token number">0</span> <span class="token number">0</span>         <span class="token number">41882</span>      <span class="token number">0</span>      <span class="token number">0</span>      <span class="token number">0</span> LRU</span>
<span class="line"></span>
<span class="line">$ <span class="token function">netstat</span> <span class="token parameter variable">-ie</span></span>
<span class="line">Kernel Interface table</span>
<span class="line">docker0: <span class="token assign-left variable">flags</span><span class="token operator">=</span><span class="token number">409</span><span class="token operator"><span class="token file-descriptor important">9</span>&lt;</span>UP,BROADCAST,MULTICAST<span class="token operator">&gt;</span>  mtu <span class="token number">1500</span></span>
<span class="line">        inet <span class="token number">172.17</span>.0.1  netmask <span class="token number">255.255</span>.0.0  broadcast <span class="token number">172.17</span>.255.255</span>
<span class="line">        ether 02:42:06:aa:44:da  txqueuelen <span class="token number">0</span>  <span class="token punctuation">(</span>Ethernet<span class="token punctuation">)</span></span>
<span class="line">        RX packets <span class="token number">0</span>  bytes <span class="token number">0</span> <span class="token punctuation">(</span><span class="token number">0.0</span> B<span class="token punctuation">)</span></span>
<span class="line">        RX errors <span class="token number">0</span>  dropped <span class="token number">0</span>  overruns <span class="token number">0</span>  frame <span class="token number">0</span></span>
<span class="line">        TX packets <span class="token number">0</span>  bytes <span class="token number">0</span> <span class="token punctuation">(</span><span class="token number">0.0</span> B<span class="token punctuation">)</span></span>
<span class="line">        TX errors <span class="token number">0</span>  dropped <span class="token number">0</span> overruns <span class="token number">0</span>  carrier <span class="token number">0</span>  collisions <span class="token number">0</span></span>
<span class="line"></span>
<span class="line">enp4s0: <span class="token assign-left variable">flags</span><span class="token operator">=</span><span class="token number">416</span><span class="token operator"><span class="token file-descriptor important">3</span>&lt;</span>UP,BROADCAST,RUNNING,MULTICAST<span class="token operator">&gt;</span>  mtu <span class="token number">1500</span></span>
<span class="line">        inet <span class="token number">192.168</span>.0.105  netmask <span class="token number">255.255</span>.255.0  broadcast <span class="token number">192.168</span>.0.255</span>
<span class="line">        inet6 fe80::fdb5:c5e3:982b:21d1  prefixlen <span class="token number">64</span>  scopeid 0x2<span class="token operator"><span class="token file-descriptor important">0</span>&lt;</span>link<span class="token operator">&gt;</span></span>
<span class="line">        ether c8:5b:76:e4:d6:cf  txqueuelen <span class="token number">1000</span>  <span class="token punctuation">(</span>Ethernet<span class="token punctuation">)</span></span>
<span class="line">        RX packets <span class="token number">341106</span>  bytes <span class="token number">461278024</span> <span class="token punctuation">(</span><span class="token number">461.2</span> MB<span class="token punctuation">)</span></span>
<span class="line">        RX errors <span class="token number">0</span>  dropped <span class="token number">0</span>  overruns <span class="token number">0</span>  frame <span class="token number">0</span></span>
<span class="line">        TX packets <span class="token number">134869</span>  bytes <span class="token number">17595636</span> <span class="token punctuation">(</span><span class="token number">17.5</span> MB<span class="token punctuation">)</span></span>
<span class="line">        TX errors <span class="token number">0</span>  dropped <span class="token number">0</span> overruns <span class="token number">0</span>  carrier <span class="token number">0</span>  collisions <span class="token number">0</span></span>
<span class="line"></span>
<span class="line">lo: <span class="token assign-left variable">flags</span><span class="token operator">=</span><span class="token number">7</span><span class="token operator"><span class="token file-descriptor important">3</span>&lt;</span>UP,LOOPBACK,RUNNING<span class="token operator">&gt;</span>  mtu <span class="token number">65536</span></span>
<span class="line">        inet <span class="token number">127.0</span>.0.1  netmask <span class="token number">255.0</span>.0.0</span>
<span class="line">        inet6 ::1  prefixlen <span class="token number">128</span>  scopeid 0x1<span class="token operator"><span class="token file-descriptor important">0</span>&lt;</span>host<span class="token operator">&gt;</span></span>
<span class="line">        loop  txqueuelen <span class="token number">1000</span>  <span class="token punctuation">(</span>Local Loopback<span class="token punctuation">)</span></span>
<span class="line">        RX packets <span class="token number">42420</span>  bytes <span class="token number">9788790</span> <span class="token punctuation">(</span><span class="token number">9.7</span> MB<span class="token punctuation">)</span></span>
<span class="line">        RX errors <span class="token number">0</span>  dropped <span class="token number">0</span>  overruns <span class="token number">0</span>  frame <span class="token number">0</span></span>
<span class="line">        TX packets <span class="token number">42420</span>  bytes <span class="token number">9788790</span> <span class="token punctuation">(</span><span class="token number">9.7</span> MB<span class="token punctuation">)</span></span>
<span class="line">        TX errors <span class="token number">0</span>  dropped <span class="token number">0</span> overruns <span class="token number">0</span>  carrier <span class="token number">0</span>  collisions <span class="token number">0</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="路由信息" tabindex="-1"><a class="header-anchor" href="#路由信息"><span>路由信息</span></a></h3><p>使用 <code>-r</code> 选项可以看到内核路由表：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">netstat</span> <span class="token parameter variable">-r</span></span>
<span class="line">Kernel IP routing table</span>
<span class="line">Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface</span>
<span class="line">default         <span class="token number">192.168</span>.0.1     <span class="token number">0.0</span>.0.0         UG        <span class="token number">0</span> <span class="token number">0</span>          <span class="token number">0</span> enp4s0</span>
<span class="line">link-local      <span class="token number">0.0</span>.0.0         <span class="token number">255.255</span>.0.0     U         <span class="token number">0</span> <span class="token number">0</span>          <span class="token number">0</span> enp4s0</span>
<span class="line"><span class="token number">172.17</span>.0.0      <span class="token number">0.0</span>.0.0         <span class="token number">255.255</span>.0.0     U         <span class="token number">0</span> <span class="token number">0</span>          <span class="token number">0</span> docker0</span>
<span class="line"><span class="token number">192.168</span>.0.0     <span class="token number">0.0</span>.0.0         <span class="token number">255.255</span>.255.0   U         <span class="token number">0</span> <span class="token number">0</span>          <span class="token number">0</span> enp4s0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="监控" tabindex="-1"><a class="header-anchor" href="#监控"><span>监控</span></a></h3><p><code>-c</code> 参数等价于使用 <code>watch</code> 命令持续刷新输出。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.tecmint.com/20-netstat-commands-for-linux-network-management/" target="_blank" rel="noopener noreferrer">20 Netstat Commands for Linux Network Management</a></p><p><a href="https://man7.org/linux/man-pages/man8/netstat.8.html" target="_blank" rel="noopener noreferrer">netstat(8) — Linux manual page</a></p>`,30)]))}const i=s(t,[["render",l],["__file","netstat.html.vue"]]),u=JSON.parse('{"path":"/notes/Linux/netstat.html","title":"netstat","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[{"level":3,"title":"Internet Connections","slug":"internet-connections","link":"#internet-connections","children":[]},{"level":3,"title":"UNIX Domain Sockets","slug":"unix-domain-sockets","link":"#unix-domain-sockets","children":[]},{"level":3,"title":"网卡列表","slug":"网卡列表","link":"#网卡列表","children":[]},{"level":3,"title":"路由信息","slug":"路由信息","link":"#路由信息","children":[]},{"level":3,"title":"监控","slug":"监控","link":"#监控","children":[]}]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/netstat.md"}');export{i as comp,u as data};
