import{_ as s,c as n,a,o as i}from"./app-aVGbliEg.js";const d="/blog/assets/scsi-Biwu2BP6.png",l="/blog/assets/scsi-subsystem-DNJ7Klqp.png",r="/blog/assets/generic-driver-D9d4qebG.png",c={};function o(t,e){return i(),n("div",null,e[0]||(e[0]=[a(`<h1 id="chapter-3-devices" tabindex="-1"><a class="header-anchor" href="#chapter-3-devices"><span>Chapter 3 - Devices</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 06 / 15 10:46</p><p>@Nanjing, Jiangsu, China</p><hr><p>理解当内核发现新设备时，如何与用户空间进行交互。udev 系统使用户空间程序能够自动配置并使用新设备，内核如何通过 udev 向用户进程发消息？</p><h2 id="_3-1-device-files" tabindex="-1"><a class="header-anchor" href="#_3-1-device-files"><span>3.1 Device Files</span></a></h2><p>Unix 系统中将大部分设备的 I/O 接口表示为文件。这些设备文件有时被称为 <em>device nodes</em>。</p><ul><li>用户可以使用普通的文件操作使用设备</li><li>设备也可以被一些操作文件的标准程序使用 (cat 等)</li></ul><p>但并不是所有设备都可以通过标准文件 I/O 来使用。在 Linux 中，设备文件位于 <code>/dev</code> 目录下，运行命令可以查看所有的设备文件：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">[root@izuf6ewwd5zlnpjggtr0b4z ~]# ls -l /dev/</span>
<span class="line">total 0</span>
<span class="line">crw------- 1 root root     10, 235 Jan  5 23:56 autofs</span>
<span class="line">drwxr-xr-x 2 root root          80 Jan  6 07:56 block</span>
<span class="line">crw------- 1 root root     10, 234 Jan  5 23:56 btrfs-control</span>
<span class="line">drwxr-xr-x 3 root root          60 Jan  5 23:56 bus</span>
<span class="line">drwxr-xr-x 2 root root        2620 Jan  5 23:56 char</span>
<span class="line">crw------- 1 root root      5,   1 Jan  5 23:56 console</span>
<span class="line">lrwxrwxrwx 1 root root          11 Jan  6 07:56 core -&gt; /proc/kcore</span>
<span class="line">drwxr-xr-x 3 root root          80 Jan  5 23:56 cpu</span>
<span class="line">crw------- 1 root root     10,  61 Jan  5 23:56 cpu_dma_latency</span>
<span class="line">crw------- 1 root root     10,  62 Jan  5 23:56 crash</span>
<span class="line">drwxr-xr-x 4 root root          80 Jan  6 07:56 disk</span>
<span class="line">drwxr-xr-x 2 root root          80 Jan  6 07:56 dri</span>
<span class="line">crw-rw---- 1 root video    29,   0 Jan  5 23:56 fb0</span>
<span class="line">lrwxrwxrwx 1 root root          13 Jan  6 07:56 fd -&gt; /proc/self/fd</span>
<span class="line">crw-rw-rw- 1 root root      1,   7 Jan  5 23:56 full</span>
<span class="line">crw-rw-rw- 1 root root     10, 229 Jan  5 23:56 fuse</span>
<span class="line">crw------- 1 root root    249,   0 Jan  5 23:56 hidraw0</span>
<span class="line">crw------- 1 root root     10, 228 Jan  5 23:56 hpet</span>
<span class="line">drwxr-xr-x 2 root root           0 Jan  5 23:56 hugepages</span>
<span class="line">crw------- 1 root root     10, 183 Jan  5 23:56 hwrng</span>
<span class="line">lrwxrwxrwx 1 root root          25 Jan  5 23:56 initctl -&gt; /run/systemd/initctl/fifo</span>
<span class="line">drwxr-xr-x 4 root root         280 Jan  5 23:56 input</span>
<span class="line">crw-r--r-- 1 root root      1,  11 Jan  5 23:56 kmsg</span>
<span class="line">srw-rw-rw- 1 root root           0 Jan  6 07:56 log</span>
<span class="line">crw-rw---- 1 root disk     10, 237 Jan  5 23:56 loop-control</span>
<span class="line">drwxr-xr-x 2 root root          60 Jan  5 23:56 mapper</span>
<span class="line">crw------- 1 root root     10, 227 Jan  5 23:56 mcelog</span>
<span class="line">crw-r----- 1 root kmem      1,   1 Jan  5 23:56 mem</span>
<span class="line">drwxrwxrwt 2 root root          40 Jan  5 23:56 mqueue</span>
<span class="line">drwxr-xr-x 2 root root          60 Jan  5 23:56 net</span>
<span class="line">crw------- 1 root root     10,  60 Jan  5 23:56 network_latency</span>
<span class="line">crw------- 1 root root     10,  59 Jan  5 23:56 network_throughput</span>
<span class="line">crw-rw-rw- 1 root root      1,   3 Jan  5 23:56 null</span>
<span class="line">crw------- 1 root root     10, 144 Jan  5 23:56 nvram</span>
<span class="line">crw------- 1 root root      1,  12 Jan  5 23:56 oldmem</span>
<span class="line">crw-r----- 1 root kmem      1,   4 Jan  5 23:56 port</span>
<span class="line">crw------- 1 root root    108,   0 Jan  5 23:56 ppp</span>
<span class="line">crw-rw-rw- 1 root tty       5,   2 Jun 14 13:58 ptmx</span>
<span class="line">drwxr-xr-x 2 root root           0 Jan  5 23:56 pts</span>
<span class="line">crw-rw-rw- 1 root root      1,   8 Jan  5 23:56 random</span>
<span class="line">drwxr-xr-x 2 root root          60 Jan  5 23:56 raw</span>
<span class="line">lrwxrwxrwx 1 root root           4 Jan  5 23:56 rtc -&gt; rtc0</span>
<span class="line">crw------- 1 root root    253,   0 Jan  5 23:56 rtc0</span>
<span class="line">drwxrwxrwt 2 root root          40 Jan  6 07:56 shm</span>
<span class="line">crw------- 1 root root     10, 231 Jan  5 23:56 snapshot</span>
<span class="line">drwxr-xr-x 2 root root          80 Jan  5 23:56 snd</span>
<span class="line">lrwxrwxrwx 1 root root          15 Jan  6 07:56 stderr -&gt; /proc/self/fd/2</span>
<span class="line">lrwxrwxrwx 1 root root          15 Jan  6 07:56 stdin -&gt; /proc/self/fd/0</span>
<span class="line">lrwxrwxrwx 1 root root          15 Jan  6 07:56 stdout -&gt; /proc/self/fd/1</span>
<span class="line">brw-rw---- 1 root disk    253,   0 Jan  5 23:56 vda</span>
<span class="line">brw-rw---- 1 root disk    253,   1 Jan  5 23:57 vda1</span>
<span class="line">drwxr-xr-x 2 root root          60 Jan  5 23:56 vfio</span>
<span class="line">crw------- 1 root root     10,  63 Jan  5 23:56 vga_arbiter</span>
<span class="line">crw------- 1 root root     10, 137 Jan  5 23:56 vhci</span>
<span class="line">crw------- 1 root root     10, 238 Jan  5 23:56 vhost-net</span>
<span class="line">drwxr-xr-x 2 root root          60 Jan  6 07:56 virtio-ports</span>
<span class="line">crw------- 1 root root    248,   1 Jan  5 23:56 vport1p1</span>
<span class="line">crw-rw-rw- 1 root root      1,   5 Jan  5 23:56 zero</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比如：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ echo emm &gt; /dev/null</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>将输出重定向到了一个文件中，而这个文件实际上对应了一个设备。由内核来决定如何处理写入该设备的数据。对于 <code>/dev/null</code> 来说，内核会忽略所有的输入，并将数据丢掉...... 😅</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ls -l</span>
<span class="line">brw-rw---- 1 root disk    253,   0 Jan  5 23:56 vda</span>
<span class="line">crw------- 1 root root     10, 235 Jan  5 23:56 autofs</span>
<span class="line">prw-r--r-- 1 root root           0 Mar  3 19:17 fdata</span>
<span class="line">srw-rw-rw- 1 root root           0 Jan  6 07:56 log</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>File mode 的第一个字符如果是 <code>b</code> / <code>c</code> / <code>p</code> / <code>s</code>，那么该文件对应一个设备：</p><ul><li><code>b</code> - block device</li><li><code>c</code> - character device</li><li><code>p</code> - pipe device</li><li><code>s</code> - socket device</li></ul><h3 id="block-device" tabindex="-1"><a class="header-anchor" href="#block-device"><span>Block Device</span></a></h3><p>程序以固定大小的 chunks 从 block device 中访问数据，比如磁盘设备。由于每个 chunk 大小固定，且易于索引，进程可以在内核的帮助下随机访问 block。</p><h3 id="character-device" tabindex="-1"><a class="header-anchor" href="#character-device"><span>Character Device</span></a></h3><p>这类设备的工作基于 <strong>data streams</strong>，只能对这类设备写入字符或读取字符。这类设备没有大小的概念：</p><ul><li>在进程中进行 read 或 write 的行为时，内核会通过驱动在设备上进行 read 或 write 操作</li><li>在数据被传输到设备或者进程之后，内核 <strong>不会</strong> 备份或重新检验数据流</li></ul><p>比如 <strong>打印机</strong> 属于这类设备。</p><h3 id="pipe-device" tabindex="-1"><a class="header-anchor" href="#pipe-device"><span>Pipe Device</span></a></h3><p>这类设备和 character device 设备类似，但是 I/O stream 的另一端是另一个进程，而不是一个内核驱动。</p><h3 id="socket-device" tabindex="-1"><a class="header-anchor" href="#socket-device"><span>Socket Device</span></a></h3><p>用于进程间通信的特殊用途接口，通常在 <code>/dev</code> 目录之外。此外，前两行中日期之前的两个数字是设备的主要编号和次要编号，帮助内核识别设备。类似的设备通常都有类似的主要编号。<strong>不是所有的设备都有设备文件，因为文件 I/O 接口不适用于所有的场景。</strong></p><h2 id="_3-2-the-sysfs-device-path" tabindex="-1"><a class="header-anchor" href="#_3-2-the-sysfs-device-path"><span>3.2 The sysfs Device Path</span></a></h2><p><code>/dev</code> 目录中只有很少一部分的设备信息。Linux 内核通过 sysfs 接口，通过文件和目录，提供了查看设备真实硬件参数的统一视角。基路径位于 <code>/sys/devices</code>：</p><ul><li><code>/dev</code> 使用户进程能够使用设备</li><li><code>/sys/devices</code> 用于查看信息和管理设备</li><li>其中可能包含很多的符号链接，所以需要用 <code>ls -l</code> 来查看真实 sysfs 路径</li></ul><p>在 <code>/sys/devices</code> 查找 <code>/dev</code> 中的路径可能很难，可以使用 <code>udevadm</code> 命令查找：(比如查找 <code>/dev/sda</code> 在 sysfs 下的路径)。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">udevadm info <span class="token parameter variable">--query</span><span class="token operator">=</span>all <span class="token parameter variable">--name</span><span class="token operator">=</span>/dev/sda</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="_3-3-dd-and-devices" tabindex="-1"><a class="header-anchor" href="#_3-3-dd-and-devices"><span>3.3 dd and Devices</span></a></h2><p><code>dd</code> 程序在 block devices 或 character devices 中非常有用。程序功能：</p><ul><li>从输入流或输入文件中读取</li><li>写入输出文件或输出流</li><li>可能顺带做一些编码转换工作</li></ul><p><code>dd</code> 以固定块大小拷贝数据：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">dd</span> <span class="token assign-left variable">if</span><span class="token operator">=</span>/dev/zero <span class="token assign-left variable">of</span><span class="token operator">=</span>new_file <span class="token assign-left variable">bs</span><span class="token operator">=</span><span class="token number">1024</span> <span class="token assign-left variable">count</span><span class="token operator">=</span><span class="token number">1</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><code>if=file</code> - the input file</li><li><code>of=file</code> - the output file</li><li><code>bs=size</code> - the block size <ul><li><code>ibs=size</code></li><li><code>obs=size</code></li><li>用于输入输出的 block size 不同</li></ul></li><li><code>count=num</code> - the total number of blocks to copy</li><li><code>skip=num</code> - 在输入文件或输入流中跳过前 num 个块，不拷贝到输出中</li></ul><p>参数格式与其它 Unix 命令不同：IBM Job Control Language (JCL) style。</p><h2 id="_3-4-devices-name-summary" tabindex="-1"><a class="header-anchor" href="#_3-4-devices-name-summary"><span>3.4 Devices Name Summary</span></a></h2><h3 id="_3-4-1-hard-disks-dev-sd" tabindex="-1"><a class="header-anchor" href="#_3-4-1-hard-disks-dev-sd"><span>3.4.1 Hard Disks: /dev/sd*</span></a></h3><p>内核为磁盘上的每个分区分别创建设备文件。</p><h3 id="_3-4-2-cd-and-dvd-drivers-dev-sr" tabindex="-1"><a class="header-anchor" href="#_3-4-2-cd-and-dvd-drivers-dev-sr"><span>3.4.2 CD and DVD Drivers: /dev/sr*</span></a></h3><h3 id="_3-4-3-pata-hard-disks-dev-hd" tabindex="-1"><a class="header-anchor" href="#_3-4-3-pata-hard-disks-dev-hd"><span>3.4.3 PATA Hard Disks: /dev/hd*</span></a></h3><h3 id="_3-4-4-terminals-dev-tty-dev-pts-and-dev-tty" tabindex="-1"><a class="header-anchor" href="#_3-4-4-terminals-dev-tty-dev-pts-and-dev-tty"><span>3.4.4 Terminals: /dev/tty*, /dev/pts/*, and /dev/tty</span></a></h3><h3 id="_3-4-5-serial-ports-dev-ttys" tabindex="-1"><a class="header-anchor" href="#_3-4-5-serial-ports-dev-ttys"><span>3.4.5 Serial Ports: /dev/ttyS*</span></a></h3><h3 id="_3-4-6-parallel-ports-dev-lp0-and-dev-lp1" tabindex="-1"><a class="header-anchor" href="#_3-4-6-parallel-ports-dev-lp0-and-dev-lp1"><span>3.4.6 Parallel Ports: /dev/lp0 and /dev/lp1</span></a></h3><h3 id="_3-4-7-audio-devices-dev-snd-dev-dsp-dev-audio-and-more" tabindex="-1"><a class="header-anchor" href="#_3-4-7-audio-devices-dev-snd-dev-dsp-dev-audio-and-more"><span>3.4.7 Audio Devices: /dev/snd/*, /dev/dsp, /dev/audio, and More</span></a></h3><h2 id="_3-5-udev" tabindex="-1"><a class="header-anchor" href="#_3-5-udev"><span>3.5 udev</span></a></h2><p>内核检测到新设备以后，向用户空间进程 udevd 发送通知。udevd 检查新设备的属性，创建设备文件，并进行设备初始化。问题：很多设备在启动过程中就需要被使用，所以 udevd 必须很早启动。为了创建设备文件，udevd 也不应该依赖于任何它应该创建的设备文件；同时，还需要启动迅速，以防止系统不会因为 udevd 的启动而等待。</p><h3 id="_3-5-1-devtmpfs" tabindex="-1"><a class="header-anchor" href="#_3-5-1-devtmpfs"><span>3.5.1 devtmpfs</span></a></h3><p>devtmpfs 文件系统被用于解决 boot 期间设备可用性的问题。内核会创建必需的设备文件，并通知 udevd 一个新设备可用。在接收到信号后，udevd 不创建设备文件，但进行设备初始化和进程通知。此外，还在 <code>/dev</code> 中创建符号链接用于识别设备。</p><h3 id="_3-5-2-udevd-operation-and-configuration" tabindex="-1"><a class="header-anchor" href="#_3-5-2-udevd-operation-and-configuration"><span>3.5.2 udevd Operation and Configuration</span></a></h3><p>udevd 守护进程的操作过程：</p><ol><li>内核通过内部网络链路向 udevd 发送通知事件 - <em>uevent</em></li><li>udevd 读取 uevent 中的所有参数</li><li>udevd 转换规则，并根据规则做一些动作或设置一些参数</li></ol><h3 id="_3-5-3-udevadm" tabindex="-1"><a class="header-anchor" href="#_3-5-3-udevadm"><span>3.5.3 udevadm</span></a></h3><p>udevadm 程序是一个 udevd 管理工具：</p><ul><li>对系统设备进行搜索</li><li>监控内核向 udevd 发送的 uevents</li></ul><h3 id="_3-5-4-monitoring-devices" tabindex="-1"><a class="header-anchor" href="#_3-5-4-monitoring-devices"><span>3.5.4 Monitoring Devices</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">udevadm monitor</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><hr><h2 id="_3-6-in-depth-scsi-and-the-linux-kernel" tabindex="-1"><a class="header-anchor" href="#_3-6-in-depth-scsi-and-the-linux-kernel"><span>3.6 In-Depth SCSI and the Linux Kernel</span></a></h2><p>Small Computer System Interface - SCSI。传统的 SCSI 硬件由一个 host adapter 连接 SCSI 总线上的一串设备构成的，Host Adapter 再连接到电脑。</p><p><img src="`+d+`" alt="scsi"></p><p>Host Adapter 和每个设备都有 SCSI ID。根据 SCSI 版本，决定每个总线上可以有 8 或 16 个 ID。Host Adapter 通过 SCSI 命令与设备通信。电脑不直接操作设备，而是通过 adapter 转接。运行命令：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ lsscsi</span>
<span class="line">[0:0:0:0]  disk    ATA    WDC  WD3200AAJS-2  01.0  /dev/sda</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>编号含义（从左到右）：</p><ul><li>SCSI host adapter number</li><li>SCSI bus number</li><li>Device SCSI ID</li><li>Logical Unit Number</li></ul><p>SCSI 子系统及其三层驱动：</p><p><img src="`+l+'" alt="scsi-subsystem"></p><ul><li>最顶层处理一类设备的操作 <ul><li>比如将内核中的 block device 请求转换为 SCSI 协议中对应的命令，反之亦然</li></ul></li><li>中间层转发上层和下层之间的 SCSI 消息，并追踪系统连接的所有 SCSI 总线和设备</li><li>最下层处理硬件相关的操作 <ul><li>将 SCSI 消息发送到特定的 host adapters 上，反之亦然</li><li>同一类设备的 SCSI message 是统一的，不同的 host adapter 对发送相同的 message 有着不同的步骤</li></ul></li></ul><h3 id="_3-6-1-usb-storage-and-scsi" tabindex="-1"><a class="header-anchor" href="#_3-6-1-usb-storage-and-scsi"><span>3.6.1 USB Storage and SCSI</span></a></h3><h3 id="_3-6-2-scsi-and-ata" tabindex="-1"><a class="header-anchor" href="#_3-6-2-scsi-and-ata"><span>3.6.2 SCSI and ATA</span></a></h3><h3 id="_3-6-3-generic-scsi-devices" tabindex="-1"><a class="header-anchor" href="#_3-6-3-generic-scsi-devices"><span>3.6.3 Generic SCSI Devices</span></a></h3><p>用户空间通过 block device interface 操作 SCSI 子系统，因此不需要知道 SCSI 协议的细节。但用户可以通过 <em>generic devices</em> 绕过 block device interface，直接向设备发送 SCSI 命令。</p><p><img src="'+r+'" alt="generic-driver"></p><hr>',77)]))}const v=s(c,[["render",o],["__file","Chapter 3 - Devices.html.vue"]]),u=JSON.parse('{"path":"/how-linux-works-notes/Chapter%203%20-%20Devices.html","title":"Chapter 3 - Devices","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"3.1 Device Files","slug":"_3-1-device-files","link":"#_3-1-device-files","children":[{"level":3,"title":"Block Device","slug":"block-device","link":"#block-device","children":[]},{"level":3,"title":"Character Device","slug":"character-device","link":"#character-device","children":[]},{"level":3,"title":"Pipe Device","slug":"pipe-device","link":"#pipe-device","children":[]},{"level":3,"title":"Socket Device","slug":"socket-device","link":"#socket-device","children":[]}]},{"level":2,"title":"3.2 The sysfs Device Path","slug":"_3-2-the-sysfs-device-path","link":"#_3-2-the-sysfs-device-path","children":[]},{"level":2,"title":"3.3 dd and Devices","slug":"_3-3-dd-and-devices","link":"#_3-3-dd-and-devices","children":[]},{"level":2,"title":"3.4 Devices Name Summary","slug":"_3-4-devices-name-summary","link":"#_3-4-devices-name-summary","children":[{"level":3,"title":"3.4.1 Hard Disks: /dev/sd*","slug":"_3-4-1-hard-disks-dev-sd","link":"#_3-4-1-hard-disks-dev-sd","children":[]},{"level":3,"title":"3.4.2 CD and DVD Drivers: /dev/sr*","slug":"_3-4-2-cd-and-dvd-drivers-dev-sr","link":"#_3-4-2-cd-and-dvd-drivers-dev-sr","children":[]},{"level":3,"title":"3.4.3 PATA Hard Disks: /dev/hd*","slug":"_3-4-3-pata-hard-disks-dev-hd","link":"#_3-4-3-pata-hard-disks-dev-hd","children":[]},{"level":3,"title":"3.4.4 Terminals: /dev/tty*, /dev/pts/*, and /dev/tty","slug":"_3-4-4-terminals-dev-tty-dev-pts-and-dev-tty","link":"#_3-4-4-terminals-dev-tty-dev-pts-and-dev-tty","children":[]},{"level":3,"title":"3.4.5 Serial Ports: /dev/ttyS*","slug":"_3-4-5-serial-ports-dev-ttys","link":"#_3-4-5-serial-ports-dev-ttys","children":[]},{"level":3,"title":"3.4.6 Parallel Ports: /dev/lp0 and /dev/lp1","slug":"_3-4-6-parallel-ports-dev-lp0-and-dev-lp1","link":"#_3-4-6-parallel-ports-dev-lp0-and-dev-lp1","children":[]},{"level":3,"title":"3.4.7 Audio Devices: /dev/snd/*, /dev/dsp, /dev/audio, and More","slug":"_3-4-7-audio-devices-dev-snd-dev-dsp-dev-audio-and-more","link":"#_3-4-7-audio-devices-dev-snd-dev-dsp-dev-audio-and-more","children":[]}]},{"level":2,"title":"3.5 udev","slug":"_3-5-udev","link":"#_3-5-udev","children":[{"level":3,"title":"3.5.1 devtmpfs","slug":"_3-5-1-devtmpfs","link":"#_3-5-1-devtmpfs","children":[]},{"level":3,"title":"3.5.2 udevd Operation and Configuration","slug":"_3-5-2-udevd-operation-and-configuration","link":"#_3-5-2-udevd-operation-and-configuration","children":[]},{"level":3,"title":"3.5.3 udevadm","slug":"_3-5-3-udevadm","link":"#_3-5-3-udevadm","children":[]},{"level":3,"title":"3.5.4 Monitoring Devices","slug":"_3-5-4-monitoring-devices","link":"#_3-5-4-monitoring-devices","children":[]}]},{"level":2,"title":"3.6 In-Depth SCSI and the Linux Kernel","slug":"_3-6-in-depth-scsi-and-the-linux-kernel","link":"#_3-6-in-depth-scsi-and-the-linux-kernel","children":[{"level":3,"title":"3.6.1 USB Storage and SCSI","slug":"_3-6-1-usb-storage-and-scsi","link":"#_3-6-1-usb-storage-and-scsi","children":[]},{"level":3,"title":"3.6.2 SCSI and ATA","slug":"_3-6-2-scsi-and-ata","link":"#_3-6-2-scsi-and-ata","children":[]},{"level":3,"title":"3.6.3 Generic SCSI Devices","slug":"_3-6-3-generic-scsi-devices","link":"#_3-6-3-generic-scsi-devices","children":[]}]}],"git":{},"filePathRelative":"how-linux-works-notes/Chapter 3 - Devices.md"}');export{v as comp,u as data};