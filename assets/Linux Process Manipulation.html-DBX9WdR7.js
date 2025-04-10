import{_ as n,c as i,a as l,o as s}from"./app-CT9FvwxE.js";const a={};function o(c,e){return s(),i("div",null,e[0]||(e[0]=[l(`<h1 id="linux-process-manipulation" tabindex="-1"><a class="header-anchor" href="#linux-process-manipulation"><span>Linux - Process Manipulation</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 05 / 29 10:19</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="ps-aux" tabindex="-1"><a class="header-anchor" href="#ps-aux"><span>ps aux</span></a></h2><p>使用 <code>ps aux</code> 命令可以查看进程的相关信息：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ps aux</span>
<span class="line">USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND</span>
<span class="line">root           1  0.0  0.5 168344 11548 ?        Ss   Mar06   1:02 /lib/systemd/systemd --system --deserialize</span>
<span class="line">root           2  0.0  0.0      0     0 ?        S    Mar06   0:00 [kthreadd]</span>
<span class="line">root           3  0.0  0.0      0     0 ?        I&lt;   Mar06   0:00 [rcu_gp]</span>
<span class="line">root           4  0.0  0.0      0     0 ?        I&lt;   Mar06   0:00 [rcu_par_gp]</span>
<span class="line">root           6  0.0  0.0      0     0 ?        I&lt;   Mar06   0:00 [kworker/0:0H-kblockd]</span>
<span class="line">root           9  0.0  0.0      0     0 ?        I&lt;   Mar06   0:00 [mm_percpu_wq]</span>
<span class="line">root          10  0.0  0.0      0     0 ?        S    Mar06   0:35 [ksoftirqd/0]</span>
<span class="line">root          11  0.0  0.0      0     0 ?        I    Mar06  12:36 [rcu_sched]</span>
<span class="line">root          12  0.0  0.0      0     0 ?        S    Mar06   0:25 [migration/0]</span>
<span class="line">root          13  0.0  0.0      0     0 ?        S    Mar06   0:00 [idle_inject/0]</span>
<span class="line">root          14  0.0  0.0      0     0 ?        S    Mar06   0:00 [cpuhp/0]</span>
<span class="line">root          15  0.0  0.0      0     0 ?        S    Mar06   0:00 [kdevtmpfs]</span>
<span class="line">root          16  0.0  0.0      0     0 ?        I&lt;   Mar06   0:00 [netns]</span>
<span class="line">root      232461  0.0  0.2 169736  4332 ?        S    23:25   0:00 (sd-pam)</span>
<span class="line">root      232481  2.3  0.2  12992  6092 pts/0    Ss   23:25   0:00 -zsh</span>
<span class="line">root      232502  0.0  0.1  11492  3228 pts/0    R+   23:25   0:00 ps aux</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中：</p><ul><li><code>USER</code> 表示用户名</li><li><code>PID</code> 表示当前进程号</li><li><code>%CPU</code> 表示进程使用的 CPU 百分比</li><li><code>%MEM</code> 表示进程使用的内存百分比</li><li><code>VSZ</code> 表示内存使用的虚拟内存 (Kb)</li><li><code>RSS</code> 表示进程占用的固定内存量 (Kb)</li><li><code>TTY</code> 表示进程绑定的终端</li><li><code>STAT</code> 表示进程的状态 <ul><li><code>R</code> (Running) - 正在运行或处于就绪队列中</li><li><code>S</code> (Sleeping) - 睡眠中，正等待信号</li><li><code>I</code> (Idle) - 空闲</li><li><code>Z</code> (Zombie) - 进程已僵死，终止但 pid 依旧存在</li><li><code>D</code> (Uninterruptible Sleeping) - 不可中断睡眠 (一般正在 I/O)</li><li><code>T</code> (Terminated) - 收到终止信号后终止运行的进程</li><li><code>P</code> - 等待 swap</li><li>...</li></ul></li><li><code>START</code> 表示进程启动的时间和日期</li><li><code>TIME</code> 进程使用的总 CPU 时间</li><li><code>COMMAND</code> 执行的命令</li></ul><h2 id="骚操作" tabindex="-1"><a class="header-anchor" href="#骚操作"><span>骚操作</span></a></h2><p>今天需要 SSH 连接到开发机上完成一个很耗时的工作：用 <code>pgbench</code> 向 PostgreSQL 导入数据 (3h 左右)。但是 SSH 连接一旦断开，导入数据就会失败。想到的方法是直接在开发机上 <code>nohup</code>，并以后台模式 (<code>%</code>) 运行。但是有一个问题：<code>pgbench</code> 命令启动后，需要人为输入一个密码 (连接到数据库) 才能继续进行。如果后台运行 <code>pgbench</code>，那么进程将一直挂起等待密码输入。这可咋整？</p><p>骚操作：</p><ol><li>前台执行 <code>pgbench</code>，并手动输入密码</li><li>按下 Ctrl + Z，这会使一个正在交互执行 (前台) 命令被换到后台，并处于暂停状态 (上述 <code>S</code> 状态)</li><li>使用 <code>bg</code> 命令使后台暂停的进程继续执行</li></ol><p>在第一步前台执行命令时，可以将命令的 stdout 和 stderr 重定向到一个日志文件中。在该进程在后台继续执行后，通过观察日志文件，可以看到进程的实时输出。</p><h2 id="signals" tabindex="-1"><a class="header-anchor" href="#signals"><span>Signals</span></a></h2><p>Linux 的进程之间可以互相发送信号。进程接收到信号后，会根据策略选择：</p><ul><li>忽略信号 (<code>SIGKILL</code> 和 <code>SIGSTOP</code>) 不能被忽略</li><li>捕捉信号 <ul><li>执行缺省的信号处理函数</li><li>自行注册信号处理函数</li></ul></li></ul><p>Linux 支持的信号类型：</p><ul><li>编号 1-31：非可靠信号，多次发送相同的信号，进程可能只会收到 1 次</li><li>编号 32-64：可靠信号，通过队列保证信号不丢失</li></ul><blockquote><p>对于非可靠信号，Linux kernel 中的实现好像是一个 bitmap。对一个进程发送一次信号意味着 set bitmap 中的对应位。进程处理完信号后，会将对应的位 reset。如果进程还没能来得及处理信号，发送信号的进程多次对 bitmap 的位进行 set，其结果还是和只发送一次信号一致。所以信号会丢失。</p></blockquote><p>对于正在进行交互的进程 (前台进程)，可以通过键盘直接发送控制字符：</p><ul><li><code>Ctrl + C</code>：发送 <code>SIGINT</code>，默认情况会导致进程退出，但进程自己决定如何响应</li><li><code>Ctrl + Z</code>：发送 <code>SIGTSTP</code>，使进程切换到后台，并暂停进程</li></ul><p>通过 <code>fg</code> 命令可以使后台进程返回到前台并继续运行；也可以通过 <code>bg</code> 命令使后台进程在后台继续运行。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.jianshu.com/p/e1abfb1d9e8d" target="_blank" rel="noopener noreferrer">简书 - 常用 Linux 中 ps 命令学习及 ps aux 与 ps -ef 的区别</a></p><p><a href="https://serverfault.com/questions/72417/using-nohup-when-initial-input-is-required" target="_blank" rel="noopener noreferrer">Server Fault - Using nohup when initial input is required</a></p><p><a href="https://askubuntu.com/questions/510811/what-is-the-difference-between-ctrl-z-and-ctrl-c-in-the-terminal" target="_blank" rel="noopener noreferrer">Ask Ubuntu - What is the difference between Ctrl-z and Ctrl-c in the terminal?</a></p><hr>`,29)]))}const d=n(a,[["render",o],["__file","Linux Process Manipulation.html.vue"]]),t=JSON.parse('{"path":"/notes/Operating%20System/Linux%20Process%20Manipulation.html","title":"Linux - Process Manipulation","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"ps aux","slug":"ps-aux","link":"#ps-aux","children":[]},{"level":2,"title":"骚操作","slug":"骚操作","link":"#骚操作","children":[]},{"level":2,"title":"Signals","slug":"signals","link":"#signals","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Operating System/Linux Process Manipulation.md"}');export{d as comp,t as data};
