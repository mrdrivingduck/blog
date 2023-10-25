import{_ as p,r as l,o as c,c as r,a as s,b as a,d as e,e as i}from"./app-25fa875f.js";const o={},t=i(`<h1 id="df" tabindex="-1"><a class="header-anchor" href="#df" aria-hidden="true">#</a> df</h1><p>Created by : Mr Dk.</p><p>2022 / 12 / 26 0:20</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>df</code> 用于查看文件系统使用量信息。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">--help</span>
Usage: <span class="token function">df</span> <span class="token punctuation">[</span>OPTION<span class="token punctuation">]</span><span class="token punctuation">..</span>. <span class="token punctuation">[</span>FILE<span class="token punctuation">]</span><span class="token punctuation">..</span>.
Show information about the <span class="token function">file</span> system on <span class="token function">which</span> each FILE resides,
or all <span class="token function">file</span> systems by default.

Mandatory arguments to long options are mandatory <span class="token keyword">for</span> short options too.
  -a, <span class="token parameter variable">--all</span>             include pseudo, duplicate, inaccessible <span class="token function">file</span> systems
  -B, --block-size<span class="token operator">=</span>SIZE  scale sizes by SIZE before printing them<span class="token punctuation">;</span> e.g.,
                           <span class="token string">&#39;-BM&#39;</span> prints sizes <span class="token keyword">in</span> <span class="token function">units</span> of <span class="token number">1,048</span>,576 bytes<span class="token punctuation">;</span>
                           see SIZE <span class="token function">format</span> below
  -h, --human-readable  print sizes <span class="token keyword">in</span> powers of <span class="token number">1024</span> <span class="token punctuation">(</span>e.g., 1023M<span class="token punctuation">)</span>
  -H, <span class="token parameter variable">--si</span>              print sizes <span class="token keyword">in</span> powers of <span class="token number">1000</span> <span class="token punctuation">(</span>e.g., <span class="token number">1</span>.1G<span class="token punctuation">)</span>
  -i, <span class="token parameter variable">--inodes</span>          list inode information instead of block usage
  <span class="token parameter variable">-k</span>                    like --block-size<span class="token operator">=</span>1K
  -l, <span class="token parameter variable">--local</span>           limit listing to <span class="token builtin class-name">local</span> <span class="token function">file</span> systems
      --no-sync         <span class="token keyword">do</span> not invoke <span class="token function">sync</span> before getting usage info <span class="token punctuation">(</span>default<span class="token punctuation">)</span>
      --output<span class="token punctuation">[</span><span class="token operator">=</span>FIELD_LIST<span class="token punctuation">]</span>  use the output <span class="token function">format</span> defined by FIELD_LIST,
                               or print all fields <span class="token keyword">if</span> FIELD_LIST is omitted.
  -P, <span class="token parameter variable">--portability</span>     use the POSIX output <span class="token function">format</span>
      <span class="token parameter variable">--sync</span>            invoke <span class="token function">sync</span> before getting usage info
      <span class="token parameter variable">--total</span>           elide all entries insignificant to available space,
                          and produce a grand total
  -t, <span class="token parameter variable">--type</span><span class="token operator">=</span>TYPE       limit listing to <span class="token function">file</span> systems of <span class="token builtin class-name">type</span> TYPE
  -T, --print-type      print <span class="token function">file</span> system <span class="token builtin class-name">type</span>
  -x, --exclude-type<span class="token operator">=</span>TYPE   limit listing to <span class="token function">file</span> systems not of <span class="token builtin class-name">type</span> TYPE
  <span class="token parameter variable">-v</span>                    <span class="token punctuation">(</span>ignored<span class="token punctuation">)</span>
      <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
      <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

Display values are <span class="token keyword">in</span> <span class="token function">units</span> of the first available SIZE from --block-size,
and the DF_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE environment variables.
Otherwise, <span class="token function">units</span> default to <span class="token number">1024</span> bytes <span class="token punctuation">(</span>or <span class="token number">512</span> <span class="token keyword">if</span> POSIXLY_CORRECT is <span class="token builtin class-name">set</span><span class="token punctuation">)</span>.

The SIZE argument is an integer and optional unit <span class="token punctuation">(</span>example: 10K is <span class="token number">10</span>*1024<span class="token punctuation">)</span>.
Units are K,M,G,T,P,E,Z,Y <span class="token punctuation">(</span>powers of <span class="token number">1024</span><span class="token punctuation">)</span> or KB,MB,<span class="token punctuation">..</span>. <span class="token punctuation">(</span>powers of <span class="token number">1000</span><span class="token punctuation">)</span>.

FIELD_LIST is a comma-separated list of columns to be included.  Valid
field names are: <span class="token string">&#39;source&#39;</span>, <span class="token string">&#39;fstype&#39;</span>, <span class="token string">&#39;itotal&#39;</span>, <span class="token string">&#39;iused&#39;</span>, <span class="token string">&#39;iavail&#39;</span>, <span class="token string">&#39;ipcent&#39;</span>,
<span class="token string">&#39;size&#39;</span>, <span class="token string">&#39;used&#39;</span>, <span class="token string">&#39;avail&#39;</span>, <span class="token string">&#39;pcent&#39;</span>, <span class="token string">&#39;file&#39;</span> and <span class="token string">&#39;target&#39;</span> <span class="token punctuation">(</span>see info page<span class="token punctuation">)</span>.

GNU coreutils online help: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/<span class="token operator">&gt;</span>
Full documentation at: <span class="token operator">&lt;</span>https://www.gnu.org/software/coreutils/df<span class="token operator">&gt;</span>
or available locally via: info <span class="token string">&#39;(coreutils) df invocation&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="文件系统类型" tabindex="-1"><a class="header-anchor" href="#文件系统类型" aria-hidden="true">#</a> 文件系统类型</h3><p>使用 <code>-T</code> 参数打印文件系统的类型：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">-T</span>
Filesystem     Type     1K-blocks    Used Available Use% Mounted on
udev           devtmpfs    <span class="token number">966120</span>       <span class="token number">0</span>    <span class="token number">966120</span>   <span class="token number">0</span>% /dev
tmpfs          tmpfs       <span class="token number">203016</span>    <span class="token number">1016</span>    <span class="token number">202000</span>   <span class="token number">1</span>% /run
/dev/vda2      ext4      <span class="token number">41222348</span> <span class="token number">9665792</span>  <span class="token number">29783868</span>  <span class="token number">25</span>% /
tmpfs          tmpfs      <span class="token number">1015068</span>      <span class="token number">24</span>   <span class="token number">1015044</span>   <span class="token number">1</span>% /dev/shm
tmpfs          tmpfs         <span class="token number">5120</span>       <span class="token number">0</span>      <span class="token number">5120</span>   <span class="token number">0</span>% /run/lock
tmpfs          tmpfs      <span class="token number">1015068</span>       <span class="token number">0</span>   <span class="token number">1015068</span>   <span class="token number">0</span>% /sys/fs/cgroup
/dev/loop3     squashfs     <span class="token number">64768</span>   <span class="token number">64768</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1695
/dev/loop4     squashfs    <span class="token number">119552</span>  <span class="token number">119552</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core/14399
/dev/loop0     squashfs     <span class="token number">45696</span>   <span class="token number">45696</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1     squashfs     <span class="token number">64768</span>   <span class="token number">64768</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1738
/dev/loop2     squashfs     <span class="token number">45824</span>   <span class="token number">45824</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2618
tmpfs          tmpfs       <span class="token number">203012</span>       <span class="token number">0</span>    <span class="token number">203012</span>   <span class="token number">0</span>% /run/user/0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="打印所有文件系统" tabindex="-1"><a class="header-anchor" href="#打印所有文件系统" aria-hidden="true">#</a> 打印所有文件系统</h3><p>使用 <code>-a</code> 参数打印所有的文件系统，包括伪文件系统、不可访问的文件系统：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">-a</span> <span class="token parameter variable">-T</span>
Filesystem     Type        1K-blocks    Used Available Use% Mounted on
sysfs          sysfs               <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys
proc           proc                <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /proc
udev           devtmpfs       <span class="token number">966120</span>       <span class="token number">0</span>    <span class="token number">966120</span>   <span class="token number">0</span>% /dev
devpts         devpts              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /dev/pts
tmpfs          tmpfs          <span class="token number">203016</span>    <span class="token number">1016</span>    <span class="token number">202000</span>   <span class="token number">1</span>% /run
/dev/vda2      ext4         <span class="token number">41222348</span> <span class="token number">9665864</span>  <span class="token number">29783796</span>  <span class="token number">25</span>% /
securityfs     securityfs          <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/kernel/security
tmpfs          tmpfs         <span class="token number">1015068</span>      <span class="token number">24</span>   <span class="token number">1015044</span>   <span class="token number">1</span>% /dev/shm
tmpfs          tmpfs            <span class="token number">5120</span>       <span class="token number">0</span>      <span class="token number">5120</span>   <span class="token number">0</span>% /run/lock
tmpfs          tmpfs         <span class="token number">1015068</span>       <span class="token number">0</span>   <span class="token number">1015068</span>   <span class="token number">0</span>% /sys/fs/cgroup
cgroup2        cgroup2             <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/unified
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/systemd
pstore         pstore              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/pstore
none           bpf                 <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/bpf
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/net_cls,net_prio
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/pids
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/perf_event
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/cpu,cpuacct
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/blkio
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/freezer
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/rdma
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/cpuset
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/hugetlb
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/memory
cgroup         cgroup              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/cgroup/devices
systemd-1      -                   -       -         -    - /proc/sys/fs/binfmt_misc
hugetlbfs      hugetlbfs           <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /dev/hugepages
mqueue         mqueue              <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /dev/mqueue
debugfs        debugfs             <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/kernel/debug
tracefs        tracefs             <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/kernel/tracing
sunrpc         rpc_pipefs          <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /run/rpc_pipefs
configfs       configfs            <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/kernel/config
fusectl        fusectl             <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/fs/fuse/connections
tracefs        tracefs             <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /sys/kernel/debug/tracing
binfmt_misc    binfmt_misc         <span class="token number">0</span>       <span class="token number">0</span>         <span class="token number">0</span>    - /proc/sys/fs/binfmt_misc
/dev/loop3     squashfs        <span class="token number">64768</span>   <span class="token number">64768</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1695
/dev/loop4     squashfs       <span class="token number">119552</span>  <span class="token number">119552</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core/14399
/dev/loop0     squashfs        <span class="token number">45696</span>   <span class="token number">45696</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1     squashfs        <span class="token number">64768</span>   <span class="token number">64768</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1738
/dev/loop2     squashfs        <span class="token number">45824</span>   <span class="token number">45824</span>         <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2618
tmpfs          tmpfs          <span class="token number">203012</span>       <span class="token number">0</span>    <span class="token number">203012</span>   <span class="token number">0</span>% /run/user/0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="打印使用量" tabindex="-1"><a class="header-anchor" href="#打印使用量" aria-hidden="true">#</a> 打印使用量</h3><p>以人类可读的格式打印：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">-h</span>
Filesystem      Size  Used Avail Use% Mounted on
udev            944M     <span class="token number">0</span>  944M   <span class="token number">0</span>% /dev
tmpfs           199M 1016K  198M   <span class="token number">1</span>% /run
/dev/vda2        40G  <span class="token number">9</span>.3G   29G  <span class="token number">25</span>% /
tmpfs           992M   24K  992M   <span class="token number">1</span>% /dev/shm
tmpfs           <span class="token number">5</span>.0M     <span class="token number">0</span>  <span class="token number">5</span>.0M   <span class="token number">0</span>% /run/lock
tmpfs           992M     <span class="token number">0</span>  992M   <span class="token number">0</span>% /sys/fs/cgroup
/dev/loop3       64M   64M     <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1695
/dev/loop4      117M  117M     <span class="token number">0</span> <span class="token number">100</span>% /snap/core/14399
/dev/loop0       45M   45M     <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1       64M   64M     <span class="token number">0</span> <span class="token number">100</span>% /snap/core20/1738
/dev/loop2       45M   45M     <span class="token number">0</span> <span class="token number">100</span>% /snap/certbot/2618
tmpfs           199M     <span class="token number">0</span>  199M   <span class="token number">0</span>% /run/user/0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以指定单位打印使用量：<code>-B</code> + 单位：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">-Bk</span>
Filesystem     1K-blocks     Used Available Use% Mounted on
udev             966120K       0K   966120K   <span class="token number">0</span>% /dev
tmpfs            203016K    1016K   202000K   <span class="token number">1</span>% /run
/dev/vda2      41222348K 9665988K 29783672K  <span class="token number">25</span>% /
tmpfs           1015068K      24K  1015044K   <span class="token number">1</span>% /dev/shm
tmpfs              5120K       0K     5120K   <span class="token number">0</span>% /run/lock
tmpfs           1015068K       0K  1015068K   <span class="token number">0</span>% /sys/fs/cgroup
/dev/loop3        64768K   64768K        0K <span class="token number">100</span>% /snap/core20/1695
/dev/loop4       119552K  119552K        0K <span class="token number">100</span>% /snap/core/14399
/dev/loop0        45696K   45696K        0K <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1        64768K   64768K        0K <span class="token number">100</span>% /snap/core20/1738
/dev/loop2        45824K   45824K        0K <span class="token number">100</span>% /snap/certbot/2618
tmpfs            203012K       0K   203012K   <span class="token number">0</span>% /run/user/0

$ <span class="token function">df</span> <span class="token parameter variable">-Bm</span>
Filesystem     1M-blocks  Used Available Use% Mounted on
udev                944M    0M      944M   <span class="token number">0</span>% /dev
tmpfs               199M    1M      198M   <span class="token number">1</span>% /run
/dev/vda2         40257M 9440M    29086M  <span class="token number">25</span>% /
tmpfs               992M    1M      992M   <span class="token number">1</span>% /dev/shm
tmpfs                 5M    0M        5M   <span class="token number">0</span>% /run/lock
tmpfs               992M    0M      992M   <span class="token number">0</span>% /sys/fs/cgroup
/dev/loop3           64M   64M        0M <span class="token number">100</span>% /snap/core20/1695
/dev/loop4          117M  117M        0M <span class="token number">100</span>% /snap/core/14399
/dev/loop0           45M   45M        0M <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1           64M   64M        0M <span class="token number">100</span>% /snap/core20/1738
/dev/loop2           45M   45M        0M <span class="token number">100</span>% /snap/certbot/2618
tmpfs               199M    0M      199M   <span class="token number">0</span>% /run/user/0

$ <span class="token function">df</span> <span class="token parameter variable">-Bg</span>
Filesystem     1G-blocks  Used Available Use% Mounted on
udev                  1G    0G        1G   <span class="token number">0</span>% /dev
tmpfs                 1G    1G        1G   <span class="token number">1</span>% /run
/dev/vda2            40G   10G       29G  <span class="token number">25</span>% /
tmpfs                 1G    1G        1G   <span class="token number">1</span>% /dev/shm
tmpfs                 1G    0G        1G   <span class="token number">0</span>% /run/lock
tmpfs                 1G    0G        1G   <span class="token number">0</span>% /sys/fs/cgroup
/dev/loop3            1G    1G        0G <span class="token number">100</span>% /snap/core20/1695
/dev/loop4            1G    1G        0G <span class="token number">100</span>% /snap/core/14399
/dev/loop0            1G    1G        0G <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1            1G    1G        0G <span class="token number">100</span>% /snap/core20/1738
/dev/loop2            1G    1G        0G <span class="token number">100</span>% /snap/certbot/2618
tmpfs                 1G    0G        1G   <span class="token number">0</span>% /run/user/0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="查看-inode" tabindex="-1"><a class="header-anchor" href="#查看-inode" aria-hidden="true">#</a> 查看 inode</h3><p>使用 <code>-i</code> 参数查看 inode 使用量：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">df</span> <span class="token parameter variable">-i</span>
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
udev            <span class="token number">241530</span>    <span class="token number">420</span>  <span class="token number">241110</span>    <span class="token number">1</span>% /dev
tmpfs           <span class="token number">253767</span>    <span class="token number">657</span>  <span class="token number">253110</span>    <span class="token number">1</span>% /run
/dev/vda2      <span class="token number">2600960</span> <span class="token number">113254</span> <span class="token number">2487706</span>    <span class="token number">5</span>% /
tmpfs           <span class="token number">253767</span>      <span class="token number">7</span>  <span class="token number">253760</span>    <span class="token number">1</span>% /dev/shm
tmpfs           <span class="token number">253767</span>      <span class="token number">4</span>  <span class="token number">253763</span>    <span class="token number">1</span>% /run/lock
tmpfs           <span class="token number">253767</span>     <span class="token number">18</span>  <span class="token number">253749</span>    <span class="token number">1</span>% /sys/fs/cgroup
/dev/loop3       <span class="token number">11897</span>  <span class="token number">11897</span>       <span class="token number">0</span>  <span class="token number">100</span>% /snap/core20/1695
/dev/loop4       <span class="token number">12857</span>  <span class="token number">12857</span>       <span class="token number">0</span>  <span class="token number">100</span>% /snap/core/14399
/dev/loop0        <span class="token number">7452</span>   <span class="token number">7452</span>       <span class="token number">0</span>  <span class="token number">100</span>% /snap/certbot/2582
/dev/loop1       <span class="token number">11897</span>  <span class="token number">11897</span>       <span class="token number">0</span>  <span class="token number">100</span>% /snap/core20/1738
/dev/loop2        <span class="token number">7457</span>   <span class="token number">7457</span>       <span class="token number">0</span>  <span class="token number">100</span>% /snap/certbot/2618
tmpfs           <span class="token number">253767</span>     <span class="token number">22</span>  <span class="token number">253745</span>    <span class="token number">1</span>% /run/user/0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,24),u={href:"https://www.tecmint.com/how-to-check-disk-space-in-linux/",target:"_blank",rel:"noopener noreferrer"},d={href:"https://www.redhat.com/sysadmin/Linux-df-command",target:"_blank",rel:"noopener noreferrer"},m={href:"http://ibg.colorado.edu/~lessem/psyc5112/usail/man/linux/df.1.html",target:"_blank",rel:"noopener noreferrer"};function b(v,k){const n=l("ExternalLinkIcon");return c(),r("div",null,[t,s("p",null,[s("a",u,[a("12 Useful “df” Commands to Check Disk Space in Linux"),e(n)])]),s("p",null,[s("a",d,[a("Check your disk space use with the Linux df command"),e(n)])]),s("p",null,[s("a",m,[a("linux - df (1)"),e(n)])])])}const g=p(o,[["render",b],["__file","df.html.vue"]]);export{g as default};
