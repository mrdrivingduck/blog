import{_ as o,r as s,o as r,c as t,a as e,b as n,d as i,w as u,e as a}from"./app-25fa875f.js";const c="/blog/assets/ubuntu-without-nvidia-eacefa1a.png",b="/blog/assets/ubuntu-drivers-devices-0fbd8be1.png",v="/blog/assets/ubuntu-nvidia-cf38fcc2.png",p="/blog/assets/ubuntu-with-nvidia-b943510c.png",m={},g=a(`<h1 id="linux-multi-os" tabindex="-1"><a class="header-anchor" href="#linux-multi-os" aria-hidden="true">#</a> Linux - Multi-OS</h1><p>Created by : Mr Dk.</p><p>2019 / 09 / 15 10:55</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="ubuntu-硬盘分区" tabindex="-1"><a class="header-anchor" href="#ubuntu-硬盘分区" aria-hidden="true">#</a> Ubuntu 硬盘分区</h2><p><code>这台计算机已经安装了多个操作系统。您准备怎么做？</code></p><p>(选择刚才割出的空余的磁盘空间)</p><ul><li>[ ] 安装 Ubuntu，与其他系统共存</li><li>[ ] 清除整个磁盘并安装 Ubuntu</li><li>[x] 其它选项</li></ul><p>这里与传统的 MBR boot 方式不同，不再需要单独分一个 <code>/boot</code>。</p><p>第一个分区，用于安装系统内核。选择空闲空间，点击 <code>+</code></p><ul><li>大小 - 30720MB (30GB)</li><li>新分区的类型 - <code>逻辑分区</code></li><li>新分区的位置 - <code>空间起始位置</code></li><li>用于 - <code>Ext4 日志文件系统</code></li><li>挂载点 - <code>/</code></li></ul><p>第二个分区，用作 swap space。选择空闲空间，点击 <code>+</code></p><ul><li>大小 - 2048MB</li><li>新分区的类型 - <code>逻辑分区</code></li><li>新分区的位置 - <code>空间起始位置</code></li><li>用于 - <code>交换空间</code></li></ul><p>第三个分区，用于用户数据。选择空闲空间，点击 <code>+</code></p><ul><li>大小 - 剩余所有空间</li><li>新分区的类型 - <code>逻辑分区</code></li><li>新分区的位置 - <code>空间起始位置</code></li><li>用于 - <code>Ext4 日志文件系统</code></li><li>挂载点 - <code>/home</code></li></ul><p><code>安装启动引导器的设备 ：</code> - 这是安装系统 boot loader 的位置。找到系统上已经有的 EFI System Partition (ESP) 分区，将 boot loader 安装到这里。在这个分区的 <code>efi</code> 目录下，每一个子目录都是一个系统的 boot loader。</p><h2 id="swap-file" tabindex="-1"><a class="header-anchor" href="#swap-file" aria-hidden="true">#</a> Swap File</h2><p>交换空间 (Swap Space) 是磁盘上用于暂时保存 RAM 中不常用数据的空间。当 RAM 的空间不够使用时，OS 会将 RAM 中的部分数据暂时存放到 swap space 中，进而给活跃的程序腾出内存。Swap space 由内核的内存管理程序使用，以页面为单位进行对换。</p><p>在 Linux 中，可以专门在磁盘上划分出一个 swap 分区，也可以在文件系统中创建一个指定大小的文件 swap file 作为 swap 空间。Swap space 的推荐大小因硬件而异，也因运行软件的需求而异。一般推荐的大小：</p><ul><li>RAM &lt; 2GB - RAM 的两倍大小</li><li>RAM 2-8GB - RAM 相同大小</li><li>RAM 9-64GB - 0.5 倍 RAM 大小</li><li>RAM &gt; 64GB - 按应用程序需求而定</li></ul><p>我的工作机器在安装 Linux 时没有单独划分 swap space，内存只有 8GB。在运行实验程序时，内存几近用完。系统自动为我分配的一个 2GB 的 swap file 似乎也不太够用。于是我决定将 swap file 扩充为 16GB。</p><p>首先，需要停止使用机器上现有的 swap file，即需要把 swap file 中暂存的内存搬回真正的物理 RAM 中去，相当于卸载一个分区：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo swapoff /swapfile
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>此时，我正好开着任务管理器，发现 swap 分区中的数据被一点一点地搬回内存，内存占用率瞬间升高。当任务管理器显示 swap space 已经禁止使用时，swap file 就正式停止工作了。可以使用 <code>rm</code> 命令将其删掉。</p><p>接下来，新建一个 16GB 的 swap file，并设置其权限：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo fallocate -l 16G /swapfile
$ sudo chmod 0600 /swapfile
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来将 swap file 设置为 swap space：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo mkswap /swapfile
Setting up swapspace version 1, size = 16 GiB (17179865088 bytes)
no label, UUID=6c4feed5-2e17-477b-b097-88bc85c6dd2e
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后启用 swap space：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo swapon /swapfile
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>任务管理器中重新显示了 swap space，并已经被扩容为 16GB。这就是挺喜欢 Linux 的地方 - 一切自己动手。 😁</p>`,32),h={href:"https://blog.csdn.net/Seven_tester/article/details/82628866?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.edu_weight&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.edu_weight",target:"_blank",rel:"noopener noreferrer"},f={href:"https://baijiahao.baidu.com/s?id=1600715185132290794&wfr=spider&for=pc",target:"_blank",rel:"noopener noreferrer"},_=a(`<h2 id="grub-default-boot-order" tabindex="-1"><a class="header-anchor" href="#grub-default-boot-order" aria-hidden="true">#</a> GRUB Default Boot Order</h2><p>改一下双系统的默认启动顺序。我的大本本装着 Windows 10 + Ubuntu 18.04 的双系统，每次启动时，如果不人为选择，GRUB 超时后自动启动 Ubuntu。有时候我人不在电脑边，开着 Windows，但它因为 Windows Update 自动重启了，结果给我重启到 Ubuntu 里面去了......</p><p>人在外面的我，想连 Windows 的远程桌面：？？？网断了？？？ 😂 回到实验室发现，哦，电脑已经在 Ubuntu 的登录界面等着了。</p><p>理论上应当想到，要改 GRUB 的配置文件。但是 GRUB 的配置文件是生成的，不建议手动修改：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo vim /boot/grub/grub.cfg
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#
# DO NOT EDIT THIS FILE
#
# It is automatically generated by grub-mkconfig using templates
# from /etc/grub.d and settings from /etc/default/grub
#

### BEGIN /etc/grub.d/00_header ###
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以已经有了提示，需要编辑 <code>/etc/grub.d</code> 和 <code>/etc/default/grub</code></p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ cd /etc/grub.d
$ ls
00_header        10_linux      20_memtest86+  30_uefi-firmware  41_custom
05_debian_theme  20_linux_xen  30_os-prober   40_custom         README
$ vim README
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>
All executable files in this directory are processed in shell expansion order.

  00_*: Reserved for 00_header.
  10_*: Native boot entries.
  20_*: Third party apps (e.g. memtest86+).

The number namespace in-between is configurable by system installer and/or
administrator.  For example, you can add an entry to boot another OS as
01_otheros, 11_otheros, etc, depending on the position you want it to occupy in
the menu; and then adjust the default setting via /etc/default/grub.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，<code>/etc/grub.d</code> 目录下都是些可执行文件，没什么好改的。只需要在 <code>/etc/default/grub</code> 中调整默认启动顺序就好了：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo vim /etc/default/grub
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># If you change this file, run &#39;update-grub&#39; afterwards to update
# /boot/grub/grub.cfg.
# For full documentation of the options in this file, see:
#   info -f grub -n &#39;Simple configuration&#39;

GRUB_DEFAULT=2
GRUB_TIMEOUT_STYLE=hidden
GRUB_TIMEOUT=0
GRUB_DISTRIBUTOR=\`lsb_release -i -s 2&gt; /dev/null || echo Debian\`
GRUB_CMDLINE_LINUX_DEFAULT=&quot;quiet splash&quot;
GRUB_CMDLINE_LINUX=&quot;&quot;

# Uncomment to enable BadRAM filtering, modify to suit your needs
# This works with Linux (no patch required) and with any kernel that obtains
# the memory map information from GRUB (GNU Mach, kernel of FreeBSD ...)
#GRUB_BADRAM=&quot;0x01234567,0xfefefefe,0x89abcdef,0xefefefef&quot;

# Uncomment to disable graphical terminal (grub-pc only)
#GRUB_TERMINAL=console

# The resolution used on graphical terminal
# note that you can use only modes which your graphic card supports via VBE
# you can see them in real GRUB with the command \`vbeinfo&#39;
#GRUB_GFXMODE=640x480

# Uncomment if you don&#39;t want GRUB to pass &quot;root=UUID=xxx&quot; parameter to Linux
#GRUB_DISABLE_LINUX_UUID=true

# Uncomment to disable generation of recovery mode menu entries
#GRUB_DISABLE_RECOVERY=&quot;true&quot;

# Uncomment to get a beep at grub start
#GRUB_INIT_TUNE=&quot;480 440 1&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>GRUB_DEFAULT</code> 原先为 <code>0</code>，对应我的本本上的 Ubuntu。Window Boot Manager (即 Windows) 在 GRUB 列表上为第三个，因此将这个值修改为 <code>2</code>。</p><p>根据该文件中的说明，修改该文件后，需要运行 <code>update-grub</code> 来生成最终的 GRUB 配置文件 <code>/boot/grub/grub.cfg</code>：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo update-grub
Sourcing file \`/etc/default/grub&#39;
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-4.15.0-63-generic
Found initrd image: /boot/initrd.img-4.15.0-63-generic
Found linux image: /boot/vmlinuz-4.15.0-62-generic
Found initrd image: /boot/initrd.img-4.15.0-62-generic
Found linux image: /boot/vmlinuz-4.15.0-60-generic
Found initrd image: /boot/initrd.img-4.15.0-60-generic
Found Windows Boot Manager on /dev/nvme0n1p2@/EFI/Microsoft/Boot/bootmgfw.efi
Adding boot menu entry for EFI firmware configuration
done
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重启之后，在 GRUB 中默认进入 Windows 了诶~ 😁</p><h2 id="fixing" tabindex="-1"><a class="header-anchor" href="#fixing" aria-hidden="true">#</a> Fixing</h2><p>一台电脑上装了三个系统：</p><ul><li>Windows 10</li><li>Ubuntu 18.04</li><li>Deepin</li></ul><p>直接把 deepin 的空间给回收了，但 GRUB 记录没有清理。重新开机以后直接进入了 GRUB 的命令行，无法自动 boot 了。</p><h3 id="进入-windows-10" tabindex="-1"><a class="header-anchor" href="#进入-windows-10" aria-hidden="true">#</a> 进入 Windows 10</h3><p>首先输入 GRUB 命令 <code>ls</code>，列出本机上所有的硬盘及其分区：<code>(hd0,1) (hd0,2) (hd1,1) ...</code>，然后输入 <code>ls (hd0,1)/</code> 即可查看分区中的文件系统目录。通过这种方式，找到 Windows 10 的 boot 分区。</p><p>找到 boot 分区后，使用 <code>set root=(hd0,2)</code> 来设置当前目录，然后在文件目录中寻找 <code>/efi/Microsoft/Boot/bootmgfw.efi</code>。</p><div class="language-grub line-numbers-mode" data-ext="grub"><pre class="language-grub"><code>chainloader /efi/Microsoft/Boot/bootmgfw.efi
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>然后最终输入 <code>boot</code> 命令即可引导启动。</p><p>启动完毕后，试图安装一些基于 Win 的引导修复软件。但是基本上都要收费，而且也没有修复成。所以尝试进入 Ubuntu 系统进行修复。</p><h3 id="进入-ubuntu" tabindex="-1"><a class="header-anchor" href="#进入-ubuntu" aria-hidden="true">#</a> 进入 Ubuntu</h3>`,27),w={href:"https://github.com/yannmrn/boot-repair",target:"_blank",rel:"noopener noreferrer"},x=a(`<div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo add-apt-repository ppa:yannubuntu/boot-repair &amp;&amp; sudo apt update
$ sudo apt install -y boot-repair
$ boot-repair
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1),U={href:"https://blog.csdn.net/gyjun0230/article/details/48790501",target:"_blank",rel:"noopener noreferrer"},B={href:"https://blog.csdn.net/hikkilover/article/details/82290873",target:"_blank",rel:"noopener noreferrer"},R=a('<h2 id="gpu-problem" tabindex="-1"><a class="header-anchor" href="#gpu-problem" aria-hidden="true">#</a> GPU Problem</h2><p>系统安装完毕后重启，结果整个界面卡死，应该是显卡冲突的问题。进入系统后，发现 <em>Ubuntu</em> 使用了集成显卡，没有使用 <em>NVIDIA</em>。</p><p><img src="'+c+`" alt="ubuntu-without-nvidia"></p><p>因此需要安装 <em>NVIDIA</em> 的附加驱动：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ ubuntu-drivers devices
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="`+b+`" alt="ubuntu-drivers-devices"></p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo ubuntu-drivers autoinstall
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>之后重启电脑，查看效果：</p><p><img src="`+v+'" alt="ubuntu-nvidia"></p><p><img src="'+p+'" alt="ubuntu-with-nvidia"></p><h2 id="reference" tabindex="-1"><a class="header-anchor" href="#reference" aria-hidden="true">#</a> Reference</h2>',11),G={href:"http://www.linuxdown.net/install/config/2018/0405/18934.html",target:"_blank",rel:"noopener noreferrer"},M={href:"https://blog.csdn.net/jiandanjinxin/article/details/69969217?utm_source=blogxgwz0",target:"_blank",rel:"noopener noreferrer"};function E(I,L){const d=s("ExternalLinkIcon"),l=s("RouterLink");return r(),t("div",null,[g,e("blockquote",null,[e("p",null,[e("a",h,[n("Linux 增加 swap 分区和删除 swapfile 文件的方法"),i(d)])]),e("p",null,[e("a",f,[n("如何在 Ubuntu 16.04 上增加 Swap 分区"),i(d)])])]),_,e("p",null,[n("使用 U 盘制作一个 Ubuntu 启动盘，然后从 U 盘启动，并进入试用模式。然后下载 "),e("a",w,[n("boot-repair"),i(d)]),n(" 自动修复：")]),x,e("blockquote",null,[e("p",null,[e("a",U,[n("CSDN - 修复 Ubuntu 启动项"),i(d)])]),e("p",null,[e("a",B,[n("CSDN - 【一顿操作】用 Grub2 命令行引导启动 Windows 10"),i(d)])])]),R,e("p",null,[e("a",G,[n("EFI + GPT 模式下 Linux 与 Windows 双系统要诀"),i(d)])]),e("p",null,[e("a",M,[n("Linux 系统中添加硬盘，并挂载到已有的目录"),i(d)])]),e("p",null,[i(l,{to:"/how-linux-works-notes/Chapter%205%20-%20How%20the%20Linux%20Kernel%20Boots.html"},{default:u(()=>[n("How the Linux Kernel Boots")]),_:1})])])}const k=o(m,[["render",E],["__file","Linux Multi-OS.html.vue"]]);export{k as default};
