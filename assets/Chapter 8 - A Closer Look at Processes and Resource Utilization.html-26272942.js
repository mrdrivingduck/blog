import{_ as e,o as i,c as s,e as a}from"./app-25fa875f.js";const n={},d=a(`<h1 id="chapter-8-a-closer-look-at-processes-and-resource-utilization" tabindex="-1"><a class="header-anchor" href="#chapter-8-a-closer-look-at-processes-and-resource-utilization" aria-hidden="true">#</a> Chapter 8 - A Closer Look at Processes and Resource Utilization</h1><p>Created by : Mr Dk.</p><p>2019 / 07 / 06 18:02</p><p>@NUAA, Nanjing, Jiangsu, China</p><hr><p>本章介绍进程、内核、系统资源之间的联系。三种基本的硬件资源：</p><ul><li>CPU</li><li>主存</li><li>I/O</li></ul><p>进程需要这些资源，而内核的工作是公平地分配这些资源。内核本身也是一种软件资源：创建新进程，与其它进程进行通信。本章将会介绍很多性能监测工具。但不要试图优化一个正确运行的系统：通常是浪费时间。关注这些工具实际上在测量什么才是有意义的。</p><h2 id="_8-1-tracking-processes" tabindex="-1"><a class="header-anchor" href="#_8-1-tracking-processes" aria-hidden="true">#</a> 8.1 Tracking Processes</h2><p>在之前已经讲过，用 <code>ps</code> 来观测所有正在运行的进程。但 <code>ps</code> 无法告诉用户进程随时间的变化状态。<code>top</code> 程序比 <code>ps</code> 更好用：</p><ul><li>每秒都会更新显示</li><li>将最活跃（使用 CPU 时间较长）的进程排在顶上</li></ul><p>在 <code>top</code> 运行中，按下按键能够发送命令，修改 <code>top</code> 排序的方式：</p><table><thead><tr><th>Keystroke</th><th>Updates the display immediately</th></tr></thead><tbody><tr><td>m</td><td>Memory information</td></tr><tr><td>t</td><td>Tasks / CPU status</td></tr><tr><td>u</td><td>Filter by user</td></tr><tr><td>f</td><td>Add/Remove/Order sort</td></tr><tr><td>h</td><td>Helps</td></tr></tbody></table><h2 id="_8-2-finding-open-files-with-lsof" tabindex="-1"><a class="header-anchor" href="#_8-2-finding-open-files-with-lsof" aria-hidden="true">#</a> 8.2 Finding Open Files with lsof</h2><p><code>lsof</code> 命令列出了所有打开的文件，以及正在使用它们的进程。由于 Unix 的文件设计哲学，<code>lsof</code> 在寻找错误的过程中十分有效。<code>lsof</code> 不仅能查看文件，还可以查看网络资源、动态库、管道等等。</p><h3 id="_8-2-1-reading-the-lsof-output" tabindex="-1"><a class="header-anchor" href="#_8-2-1-reading-the-lsof-output" aria-hidden="true">#</a> 8.2.1 Reading the lsof Output</h3><p>运行 <code>lsof</code> 会产生大量输出，输出的每一行的含义如下：</p><ul><li>COMMAND - 持有文件描述符的进程的命令名称</li><li>PID - 进程 ID</li><li>USER - 运行进程的用户</li><li>FD - 可以显示文件的用途，也可以显示 <em>file descriptor</em></li><li>TYPE - 文件类型 (regular file, directory, socket, ...)</li><li>DEVICE - The major and minor number of the device that holds a file</li><li>SIZE - 文件大小</li><li>NODE - 文件的 inode 编号</li><li>NAME - 文件名</li></ul><h3 id="_8-2-2-using-lsof" tabindex="-1"><a class="header-anchor" href="#_8-2-2-using-lsof" aria-hidden="true">#</a> 8.2.2 Using lsof</h3><ul><li><p>将所有的输出 pipe 到 <code>less</code> 中并寻找想要的结果</p></li><li><p>使用命令行选项，只过滤匹配的结果</p><ul><li><p>只显示在 <code>/usr</code> 目录下打开的文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">lsof</span> /usr
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>只显示特定进程打开的文件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">lsof</span> <span class="token parameter variable">-p</span> <span class="token operator">&lt;</span>pid<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ul></li></ul><blockquote><p><code>lsof</code> 高度依赖内核信息，因此如果启动不同的内核，可能需要对 <code>lsof</code> 的版本进行调整。</p></blockquote><h2 id="_8-3-tracing-program-execution-and-system-calls" tabindex="-1"><a class="header-anchor" href="#_8-3-tracing-program-execution-and-system-calls" aria-hidden="true">#</a> 8.3 Tracing Program Execution and System Calls</h2><p>如果一个命令发生了错误，<code>lsof</code> 很难告诉你原因。<code>strace</code> (system call trace) 和 <code>ltrace</code> (library trace) 可以帮助用户得知程序试图做什么。</p><h3 id="_8-3-1-strace" tabindex="-1"><a class="header-anchor" href="#_8-3-1-strace" aria-hidden="true">#</a> 8.3.1 strace</h3><p><code>strace</code> 工具将会打印进程所有的系统调用请求。比如，查看一下 <code>cat</code> 程序中使用的系统调用：</p><ul><li><code>strace</code> 在调用 <code>fork()</code> 产生子进程后开始生效</li><li>因此第一个系统调用肯定是 <code>exec()</code> 家族，用于执行对应的程序</li><li>接下来是载入一些 shared libraries</li><li>直到 <code>openat()</code> 打开了 <code>/dev/null</code>，并返回 <code>3</code><ul><li><code>3</code> 是对应的文件描述符</li><li><code>read(3, ...)</code></li></ul></li></ul><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ strace cat /dev/null
execve(&quot;/bin/cat&quot;, [&quot;cat&quot;, &quot;/dev/null&quot;], 0x7ffcfb6e2ae8 /* 33 vars */) = 0
brk(NULL)                               = 0x55c719307000
access(&quot;/etc/ld.so.nohwcap&quot;, F_OK)      = -1 ENOENT (No such file or directory)
access(&quot;/etc/ld.so.preload&quot;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/etc/ld.so.cache&quot;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=96845, ...}) = 0
mmap(NULL, 96845, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f937d005000
close(3)                                = 0
access(&quot;/etc/ld.so.nohwcap&quot;, F_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/lib/x86_64-linux-gnu/libc.so.6&quot;, O_RDONLY|O_CLOEXEC) = 3
read(3, &quot;\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0&gt;\\0\\1\\0\\0\\0\\260\\34\\2\\0\\0\\0\\0\\0&quot;..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2030544, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f937d003000
mmap(NULL, 4131552, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f937ca05000
mprotect(0x7f937cbec000, 2097152, PROT_NONE) = 0
mmap(0x7f937cdec000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7f937cdec000
mmap(0x7f937cdf2000, 15072, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f937cdf2000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f937d004540) = 0
mprotect(0x7f937cdec000, 16384, PROT_READ) = 0
mprotect(0x55c718d5e000, 4096, PROT_READ) = 0
mprotect(0x7f937d01d000, 4096, PROT_READ) = 0
munmap(0x7f937d005000, 96845)           = 0
brk(NULL)                               = 0x55c719307000
brk(0x55c719328000)                     = 0x55c719328000
openat(AT_FDCWD, &quot;/usr/lib/locale/locale-archive&quot;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=10281936, ...}) = 0
mmap(NULL, 10281936, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f937c036000
close(3)                                = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 4), ...}) = 0
openat(AT_FDCWD, &quot;/dev/null&quot;, O_RDONLY) = 3
fstat(3, {st_mode=S_IFCHR|0666, st_rdev=makedev(1, 3), ...}) = 0
fadvise64(3, 0, 0, POSIX_FADV_SEQUENTIAL) = 0
mmap(NULL, 139264, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f937cfe1000
read(3, &quot;&quot;, 131072)                     = 0
munmap(0x7f937cfe1000, 139264)          = 0
close(3)                                = 0
close(1)                                = 0
close(2)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果发生问题了呢？</p><ul><li>会发现 <code>openat()</code> 返回了 <code>-1</code></li><li><code>openat(AT_FDCWD, &quot;not_a_file&quot;, O_RDONLY) = -1 ENOENT (No such file or directory)</code></li></ul><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ strace cat not_a_file
execve(&quot;/bin/cat&quot;, [&quot;cat&quot;, &quot;not_a_file&quot;], 0x7ffd642cd228 /* 33 vars */) = 0
brk(NULL)                               = 0x558abc359000
access(&quot;/etc/ld.so.nohwcap&quot;, F_OK)      = -1 ENOENT (No such file or directory)
access(&quot;/etc/ld.so.preload&quot;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/etc/ld.so.cache&quot;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=96845, ...}) = 0
mmap(NULL, 96845, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f75106c0000
close(3)                                = 0
access(&quot;/etc/ld.so.nohwcap&quot;, F_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/lib/x86_64-linux-gnu/libc.so.6&quot;, O_RDONLY|O_CLOEXEC) = 3
read(3, &quot;\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0&gt;\\0\\1\\0\\0\\0\\260\\34\\2\\0\\0\\0\\0\\0&quot;..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2030544, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f75106be000
mmap(NULL, 4131552, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f75100c0000
mprotect(0x7f75102a7000, 2097152, PROT_NONE) = 0
mmap(0x7f75104a7000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7f75104a7000
mmap(0x7f75104ad000, 15072, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f75104ad000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f75106bf540) = 0
mprotect(0x7f75104a7000, 16384, PROT_READ) = 0
mprotect(0x558aba95a000, 4096, PROT_READ) = 0
mprotect(0x7f75106d8000, 4096, PROT_READ) = 0
munmap(0x7f75106c0000, 96845)           = 0
brk(NULL)                               = 0x558abc359000
brk(0x558abc37a000)                     = 0x558abc37a000
openat(AT_FDCWD, &quot;/usr/lib/locale/locale-archive&quot;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=10281936, ...}) = 0
mmap(NULL, 10281936, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f750f6f1000
close(3)                                = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 4), ...}) = 0
openat(AT_FDCWD, &quot;not_a_file&quot;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &quot;cat: &quot;, 5cat: )                    = 5
write(2, &quot;not_a_file&quot;, 10not_a_file)              = 10
openat(AT_FDCWD, &quot;/usr/share/locale/locale.alias&quot;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2995, ...}) = 0
read(3, &quot;# Locale name alias data base.\\n#&quot;..., 4096) = 2995
read(3, &quot;&quot;, 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, &quot;/usr/share/locale/zh_CN/LC_MESSAGES/libc.mo&quot;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/usr/share/locale/zh/LC_MESSAGES/libc.mo&quot;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &quot;/usr/share/locale-langpack/zh_CN/LC_MESSAGES/libc.mo&quot;, O_RDONLY) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=132553, ...}) = 0
mmap(NULL, 132553, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f751069d000
close(3)                                = 0
openat(AT_FDCWD, &quot;/usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache&quot;, O_RDONLY) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=26376, ...}) = 0
mmap(NULL, 26376, PROT_READ, MAP_SHARED, 3, 0) = 0x7f75106d1000
close(3)                                = 0
write(2, &quot;: \\346\\262\\241\\346\\234\\211\\351\\202\\243\\344\\270\\252\\346\\226\\207\\344\\273\\266\\346\\210\\226\\347\\233\\256\\345\\275\\225&quot;, 29: 没有那个文件或目录) = 29
write(2, &quot;\\n&quot;, 1
)                       = 1
close(1)                                = 0
close(2)                                = 0
exit_group(1)                           = ?
+++ exited with 1 +++
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从而可以轻松找到程序中的问题。</p><h3 id="_8-3-2-ltrace" tabindex="-1"><a class="header-anchor" href="#_8-3-2-ltrace" aria-hidden="true">#</a> 8.3.2 ltrace</h3><p>追踪 shared library calls。</p><h2 id="_8-4-threads" tabindex="-1"><a class="header-anchor" href="#_8-4-threads" aria-hidden="true">#</a> 8.4 Threads</h2><p>在 Linux 中，很多进程被进一步划分为线程 (threads)。线程与进程很类似：</p><ul><li>包含一个 TID (thread ID)</li><li>内核与调度进程一样调度线程</li><li>进程之前不共享系统资源 (内存、I/O)</li><li>同一个进程内的所有线程共享进程的系统资源</li></ul><h3 id="_8-4-1-single-threaded-and-multi-threaded-processes" tabindex="-1"><a class="header-anchor" href="#_8-4-1-single-threaded-and-multi-threaded-processes" aria-hidden="true">#</a> 8.4.1 Single-Threaded and Multi-threaded Processes</h3><p>很多进程只有一个线程。只有一个线程的进程称为 single-threaded process，由多个线程的进程称为 multi-threaded process。所有的进程一开始都只有一个线程，该线程被称为主线程，从主线程中可以开启很多个新线程。</p><p>线程能够同时运行在多个处理器上，且创建开销比进程更小。线程之间的通信可以通过共享内存实现，性能较高。而进程之间的通信则需要通过网络连接或管道 (经过内核)，一些程序使用线程来解决管理多个 I/O 资源的功能。</p><h3 id="_8-4-2-viewing-threads" tabindex="-1"><a class="header-anchor" href="#_8-4-2-viewing-threads" aria-hidden="true">#</a> 8.4.2 Viewing Threads</h3><p>默认情况下，<code>ps</code> 和 <code>top</code> 命令只显示进程的信息。若想查看线程：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ ps m
  PID TTY      STAT   TIME COMMAND
 4504 tty2     -      0:00 /usr/lib/ibus/ibus-engine-simple
    - -        Sl     0:00 -
    - -        Sl     0:00 -
    - -        Sl     0:00 -
14847 pts/2    -      0:00 scp hostwind:~/gcc-6_5_0-release.tar.gz ./
    - -        S+     0:00 -
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>14847</code> 进程只有一个线程</li><li><code>4504</code> 进程存在三个线程</li></ul><p>查看线程号：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ ps m -o &lt;pid&gt;,&lt;tid&gt;,&lt;command&gt;
  PID   TID COMMAND
 4504     - /usr/lib/ibus/ibus-engine-simple
    -  4504 -
    -  4505 -
    -  4506 -
14847     - scp hostwind:~/gcc-6_5_0-release.tar.gz ./
    - 14847 -
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与进程号相同的线程号对应的线程是主线程。</p><p>由于线程可能同时消费资源，对于资源监控来说可能会导致一些误解，所以大部分资源监控程序默认看不到线程信息。如果想要查看线程，需要一些 extra work。</p><h2 id="_8-6-measuring-cpu-time" tabindex="-1"><a class="header-anchor" href="#_8-6-measuring-cpu-time" aria-hidden="true">#</a> 8.6 Measuring CPU Time</h2><p>监测一个或多个进程：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">top</span> <span class="token parameter variable">-p</span> <span class="token operator">&lt;</span>pid<span class="token operator"><span class="token file-descriptor important">1</span>&gt;</span> <span class="token punctuation">[</span>-p <span class="token operator">&lt;</span>pid<span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span> <span class="token punctuation">..</span>.<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>查看一个进程花了多少 CPU 时间，使用 <code>time</code>：</p><ul><li>注意，大部分 shell 内置了 <code>time</code>，不会提供很多数据</li><li>需要使用 <code>/usr/bin/time</code></li></ul><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ /usr/bin/time ls
0.00user 0.00system 0:00.00elapsed 100%CPU (0avgtext+0avgdata 2748maxresident)k
0inputs+0outputs (0major+113minor)pagefaults 0swaps
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到其中有三种时间：</p><ul><li>User time：CPU 执行该程序自身代码的秒数</li><li>System time：内核处理时间</li><li>Elapsed time：从进程开始到结束的总时间，包含中途 CPU 处理其它任务的时间</li></ul><h2 id="_8-7-adjusting-process-priorities" tabindex="-1"><a class="header-anchor" href="#_8-7-adjusting-process-priorities" aria-hidden="true">#</a> 8.7 Adjusting Process Priorities</h2><p>为了给某一个进程更多或更少的 CPU 时间，我们可以改变内核调度进程的行为。内核根据每个进程的 <em>scheduling priority</em> 来调度进程。这个优先级是一个 <code>-20</code> 到 <code>20</code> 之间的数，<code>-20</code> 为最高优先级。</p><p>通过 <code>ps -l</code> 或者 <code>top</code> 命令中的 <code>PR</code>，可以查看这个优先级。优先级的数值越高，内核越不会调度该进程。但是仅仅调度优先级本身并不决定内核是否分配时间片给该进程。随着程序执行，和 CPU 的使用时间，该优先级会不断变化。</p><p>在 <code>top</code> 命令的 <code>PR</code> 列旁边是 nice value：<code>NI</code> 列。当试图干涉内核的进程调度时，可以通过修改这个值实现。内核会将这个值与优先级相加，来决定下一个时间片的分配权，默认 NI 为 0。</p><p>如果想要运行一个高运算量的程序，又不想它使用太多 CPU 从而干扰正常进程，可以提高其优先级的数值：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">renice</span> <span class="token number">20</span> <span class="token operator">&lt;</span>pid<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>超级用户可以将 NI 的值设为负数，从而提升程序被调度的可能性。但是这是个坏主意。。。因为可能会让正常的系统进程没有足够的 CPU 时间。</p><h2 id="_8-8-load-averages" tabindex="-1"><a class="header-anchor" href="#_8-8-load-averages" aria-hidden="true">#</a> 8.8 Load Averages</h2><p>Load average 是目前已经准备好运行的进程的数量，即能够在任何时间开始使用 CPU 的进程数量。大部分进程应当都是在等待输入，因此它们不属于就绪进程，不包含在 load average 中。</p><h3 id="_8-8-1-using-uptime" tabindex="-1"><a class="header-anchor" href="#_8-8-1-using-uptime" aria-hidden="true">#</a> 8.8.1 Using uptime</h3><p><code>uptime</code> 命令能够告诉你内核运行的时间，以及三个 load averages 的数值：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ uptime
 16:38:52 up 31 min,  3 users,  load average: 7.96, 6.25, 3.44
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>分别代表过去 1 min、5 min、15 min 的 load average。大部分时间应当都是 <code>0.x</code>，除非编译程序或者打游戏。</p><blockquote><p>好叭。在运行这个命令时，我正好在编译 gcc-6.5.0 😏~</p></blockquote><h3 id="_8-8-2-high-loads" tabindex="-1"><a class="header-anchor" href="#_8-8-2-high-loads" aria-hidden="true">#</a> 8.8.2 High Loads</h3><p>如果说 load average 较高，说明多个进程正在等待被调度，需要的时间会比它们依次完全执行的时间更多一些 (切换的代价)。</p><p>还有一种可能 - Web server：进程被频繁创建和销毁，load average 的衡量机制可能不太准确。</p><p>或者 - 可能存在内存性能问题：当系统内存较低时，内核开始 <em>thrash</em>，或从磁盘上快速交换内存：</p><ul><li>很多进程可能已经就绪，但内存暂时不可用</li><li>从而导致它们停留在 ready-to-run 状态，并被 load average 计算在其中</li></ul><h2 id="_8-9-memory" tabindex="-1"><a class="header-anchor" href="#_8-9-memory" aria-hidden="true">#</a> 8.9 Memory</h2><p>可以通过 <code>free</code> 命令或查看 <code>/proc/meminfo</code> 来得知内存使用状况。</p><h3 id="_8-9-1-how-memory-works" tabindex="-1"><a class="header-anchor" href="#_8-9-1-how-memory-works" aria-hidden="true">#</a> 8.9.1 How Memory Works</h3><p>CPU 中有一个 memory management unit (MMU) 将虚拟地址翻译为物理地址。内核通过将内存切分为 <strong>pages</strong> 来协助 MMU。内核维护一个数据结构：page table，包含了一个进程的虚拟地址到物理地址的映射。</p><p>用户进程实际上不需要它的所有 page 都位于内存中。内核只会在进程需要某一页时装载或分配 - 即所谓 <em>on-demand paging</em>。试考虑一个程序开始运行 - 新的进程：</p><ol><li>内核将程序开头的指令装进内存页中</li><li>内核为新的进程分配一些 working-memory 页</li><li>进程执行，当遇到下一条指令不在内核已装载的任何页中时，内核介入，将页载入内存，并让进程继续执行</li><li>类似地，如果一个进程需要更多的 working-memory 页，内核会寻找一些空闲页，或腾出一些，并分配给该进程</li></ol><h3 id="_8-9-2-page-faults" tabindex="-1"><a class="header-anchor" href="#_8-9-2-page-faults" aria-hidden="true">#</a> 8.9.2 Page Faults</h3><p>如果进程想要使用的 page 不在内存中时，进程会触发一次 <em>page fault</em>。内核介入，将需要的 page 准备好。存在两种类型的 page fault：</p><h4 id="minor-page-faults" tabindex="-1"><a class="header-anchor" href="#minor-page-faults" aria-hidden="true">#</a> Minor Page Faults</h4><p>这种缺页发生于：</p><ul><li>需要的 page 已经在主存中，但 MMU 不知道它在哪里</li><li>比如一个进程需要更多的内存，而 MMU 没有多余的空间储存所有页的信息</li><li>内核会告诉 MMU 页的位置，并让进程继续执行</li></ul><blockquote><p>是不是 TLB 缺失的意思？这种缺页实际上不需要访问磁盘。</p></blockquote><h4 id="major-page-faults" tabindex="-1"><a class="header-anchor" href="#major-page-faults" aria-hidden="true">#</a> Major Page Faults</h4><ul><li>需要的 page 不在主存中</li><li>内核必须将其从磁盘或其它低速存储介质中装入内存</li><li>大量的 major page faults 会导致系统性能下降</li></ul><p>Major page faults 不可避免，尤其是第一次载入程序，或系统用尽内存需要频繁 swap 的时候。</p><h4 id="watching-page-faults" tabindex="-1"><a class="header-anchor" href="#watching-page-faults" aria-hidden="true">#</a> Watching Page Faults</h4><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ /usr/bin/time cal &gt; /dev/null
0.00user 0.00system 0:00.00elapsed 0%CPU (0avgtext+0avgdata 2384maxresident)k
64inputs+0outputs (1major+93minor)pagefaults 0swaps
$ /usr/bin/time cal &gt; /dev/null
0.00user 0.00system 0:00.00elapsed ?%CPU (0avgtext+0avgdata 2552maxresident)k
0inputs+0outputs (0major+96minor)pagefaults 0swaps
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再运行一次会发现 major page fault 没了，因此内核已经在内存中缓存了该页</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ ps -o pid,min_flt,maj_flt 1545
  PID  MINFL  MAJFL
 1545  11714     40
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-10-monitoring-cpu-and-memory-performance-with-vmstat" tabindex="-1"><a class="header-anchor" href="#_8-10-monitoring-cpu-and-memory-performance-with-vmstat" aria-hidden="true">#</a> 8.10 Monitoring CPU and Memory Performance with vmstat</h2><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ vmstat 2
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b 交换 空闲 缓冲 缓存   si   so    bi    bo   in   cs us sy id wa st
 0  0      0 8140796 145560 6732012    0    0    55   612  120  227 22  2 75  1  0
 0  0      0 8140540 145560 6732012    0    0     0     0   30   45  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   46   65  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   22   35  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   30   51  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   23   32  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   31   51  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   19   21  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   50   77  0  0 100  0  0
 0  0      0 8140540 145560 6732012    0    0     0     0   30   45  0  0 100  0  0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>2</code> 表示两秒钟打印一次</p><ul><li><code>procs</code> 表示 processes</li><li><code>memory</code> 表示内存使用</li><li><code>swap</code> 表示从交换分区上进入或出去的页数</li><li><code>io</code> 表示磁盘占用</li><li><code>system</code> 表示内核切进内核代码的次数</li><li><code>cpu</code> 表示系统各部分使用 CPU 的时间</li></ul><h3 id="swap" tabindex="-1"><a class="header-anchor" href="#swap" aria-hidden="true">#</a> swap</h3><ul><li><code>si</code> - swap in</li><li><code>so</code> - swap out</li></ul><h3 id="cpu" tabindex="-1"><a class="header-anchor" href="#cpu" aria-hidden="true">#</a> cpu</h3><ul><li><code>us</code> - CPU 花在用户任务上的时间</li><li><code>sy</code> - CPU 花在内核上的时间</li><li><code>id</code> - 空闲时间</li><li><code>wa</code> - 等待 I/O 的时间</li></ul><h3 id="io" tabindex="-1"><a class="header-anchor" href="#io" aria-hidden="true">#</a> io</h3><ul><li><code>bi</code> - block in</li><li><code>bo</code> - block out</li></ul><h2 id="_8-11-monitoring" tabindex="-1"><a class="header-anchor" href="#_8-11-monitoring" aria-hidden="true">#</a> 8.11 Monitoring</h2><h3 id="_8-11-1-using-iostat" tabindex="-1"><a class="header-anchor" href="#_8-11-1-using-iostat" aria-hidden="true">#</a> 8.11.1 Using iostat</h3><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ iostat
Linux 4.15.0-55-generic (zjt-ubuntu)    2019年07月06日  _x86_64_        (8 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          17.75    0.01    1.93    0.66    0.00   79.65

Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
loop0             0.01         0.09         0.00        330          0
loop1             0.01         0.09         0.00        334          0
loop2             0.01         0.03         0.00        109          0
loop3             0.01         0.09         0.00        333          0
loop4             0.01         0.28         0.00       1061          0
loop5             2.17         2.44         0.00       9174          0
loop6             0.01         0.03         0.00        120          0
loop7             0.01         0.09         0.00        334          0
nvme0n1          20.83       242.04       925.31     908732    3473993
sda              14.58       125.88      3022.44     472620   11347524
loop8             0.01         0.28         0.00       1068          0
loop9             0.01         0.09         0.00        342          0
loop10            0.01         0.09         0.00        328          0
loop11            0.01         0.09         0.00        336          0
loop12            0.01         0.28         0.00       1068          0
loop13            0.01         0.03         0.00        113          0
loop14            0.01         0.03         0.00        110          0
loop15            0.01         0.09         0.00        336          0
loop16            0.01         0.09         0.00        328          0
loop17            0.01         0.01         0.00         46          0
loop18            0.01         0.03         0.00        106          0
loop19            0.00         0.00         0.00          8          0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_8-11-2-per-process-i-o-utilization-and-monitoring-iotop" tabindex="-1"><a class="header-anchor" href="#_8-11-2-per-process-i-o-utilization-and-monitoring-iotop" aria-hidden="true">#</a> 8.11.2 Per-process I/O Utilization and Monitoring: iotop</h3><p>是少有的几个可以看到 <code>TID</code> 的命令：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ sudo iotop
Total DISK READ :       0.00 B/s | Total DISK WRITE :      11.72 K/s
Actual DISK READ:       0.00 B/s | Actual DISK WRITE:     171.88 K/s
  TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN     IO&gt;    COMMAND
  248 be/3 root        0.00 B/s   11.72 K/s  0.00 %  0.25 % [jbd2/nvme0n1p5-]
24133 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.25 % [kworker/u16:2]
    1 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % init splash
    2 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [kthreadd]
    4 be/0 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [kworker/0:0H]
    6 be/0 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [mm_percpu_wq]
    7 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [ksoftirqd/0]
    8 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [rcu_sched]
    9 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [rcu_bh]
   10 rt/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [migration/0]
   11 rt/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [watchdog/0]
   12 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [cpuhp/0]
   13 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.00 % [cpuhp/1]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>PRIO</code> 这一列代表了 I/O 优先级</p><ul><li>即内核调度 I/O 的速度</li><li>比如 <code>be/4</code>，<code>be</code> 代表 <em>scheduling class</em>，数值代表 <em>priority level</em></li><li>和 CPU 相同，数值越小，优先级越高</li></ul><h4 id="scheduling-class" tabindex="-1"><a class="header-anchor" href="#scheduling-class" aria-hidden="true">#</a> Scheduling Class</h4><ul><li><code>be</code> - Best-effort - 内核尽可能公平地调度 I/O</li><li><code>rt</code> - Real-time - 内核优先调度任何实时 I/O</li><li><code>idle</code> - 在没有其它 I/O 可以调度时才会被调度</li></ul><h2 id="_8-12-per-process-monitoring-with-pidstat" tabindex="-1"><a class="header-anchor" href="#_8-12-per-process-monitoring-with-pidstat" aria-hidden="true">#</a> 8.12 Per-Process Monitoring with pidstat</h2><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ pidstat -p 1937
Linux 4.15.0-55-generic (zjt-ubuntu)    2019年07月06日  _x86_64_        (8 CPU)

17时59分21秒   UID       PID    %usr %system  %guest   %wait    %CPU   CPU  Command
17时59分21秒  1000      1937    0.01    0.00    0.00    0.00    0.01     1  evolution-calen
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-13-further-topics" tabindex="-1"><a class="header-anchor" href="#_8-13-further-topics" aria-hidden="true">#</a> 8.13 Further Topics</h2>`,116),l=[d];function o(r,c){return i(),s("div",null,l)}const u=e(n,[["render",o],["__file","Chapter 8 - A Closer Look at Processes and Resource Utilization.html.vue"]]);export{u as default};
