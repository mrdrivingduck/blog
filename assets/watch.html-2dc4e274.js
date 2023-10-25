import{_ as a,r as t,o as p,c as o,a as s,b as c,d as e,e as u}from"./app-25fa875f.js";const l={},i=u(`<h1 id="watch" tabindex="-1"><a class="header-anchor" href="#watch" aria-hidden="true">#</a> watch</h1><p>Created by : Mr Dk.</p><p>2022 / 10 / 29 11:35</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>watch</code> 命令能够周期性地执行一条命令，并全屏打印执行结果。这非常适合监控。默认周期为两秒。</p><h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax" aria-hidden="true">#</a> Syntax</h2><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">watch</span> <span class="token parameter variable">-h</span>

Usage:
 <span class="token function">watch</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span> <span class="token builtin class-name">command</span>

Options:
  -b, <span class="token parameter variable">--beep</span>             beep <span class="token keyword">if</span> <span class="token builtin class-name">command</span> has a non-zero <span class="token builtin class-name">exit</span>
  -c, <span class="token parameter variable">--color</span>            interpret ANSI color and style sequences
  -d, --differences<span class="token punctuation">[</span><span class="token operator">=</span><span class="token operator">&lt;</span>permanent<span class="token operator">&gt;</span><span class="token punctuation">]</span>
                         highlight changes between updates
  -e, <span class="token parameter variable">--errexit</span>          <span class="token builtin class-name">exit</span> <span class="token keyword">if</span> <span class="token builtin class-name">command</span> has a non-zero <span class="token builtin class-name">exit</span>
  -g, <span class="token parameter variable">--chgexit</span>          <span class="token builtin class-name">exit</span> when output from <span class="token builtin class-name">command</span> changes
  -n, <span class="token parameter variable">--interval</span> <span class="token operator">&lt;</span>secs<span class="token operator">&gt;</span>  seconds to <span class="token function">wait</span> between updates
  -p, <span class="token parameter variable">--precise</span>          attempt run <span class="token builtin class-name">command</span> <span class="token keyword">in</span> precise intervals
  -t, --no-title         turn off header
  -x, <span class="token parameter variable">--exec</span>             pass <span class="token builtin class-name">command</span> to <span class="token builtin class-name">exec</span> instead of <span class="token string">&quot;sh -c&quot;</span>

 -h, <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span>
 -v, <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span>

For <span class="token function">more</span> details see watch<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.
</code></pre></div><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><p>使用 <code>-n</code> 参数可以调整周期运行的时间间隔，<code>-d</code> 参数可以高亮本次运行和上次运行之间的差异。比如监控网络时：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">watch</span> <span class="token parameter variable">-n</span> <span class="token number">1</span> <span class="token parameter variable">-d</span> <span class="token function">netstat</span>

Every <span class="token number">1</span>.0s: <span class="token function">netstat</span>                                                      nat: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:27:31 <span class="token number">2022</span>

Active Internet connections <span class="token punctuation">(</span>w/o servers<span class="token punctuation">)</span>
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:34510               <span class="token number">169.254</span>.0.55:http       ESTABLISHED
tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:56196               <span class="token number">169.254</span>.0.138:8186      ESTABLISHED
tcp        <span class="token number">0</span>      <span class="token number">1</span> nat:53986               <span class="token number">10.148</span>.188.202:http     SYN_SENT
tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:ssh                 <span class="token number">112.10</span>.216.174:38489    ESTABLISHED
tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:39234               <span class="token number">169.254</span>.0.55:5574       ESTABLISHED
Active UNIX domain sockets <span class="token punctuation">(</span>w/o servers<span class="token punctuation">)</span>
Proto RefCnt Flags       Type       State         I-Node   Path
unix  <span class="token number">2</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">120540811</span> /run/user/0/systemd/notify
unix  <span class="token number">3</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">15934</span>    /run/systemd/notify
<span class="token punctuation">..</span>.
</code></pre></div><p>另外，使用 <code>-c</code> 参数可以解释输出中的颜色信息，比如 <code>neofetch</code>：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">watch</span> neofetch

Every <span class="token number">2</span>.0s: neofetch                                              zjt-lenovo: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:24:55 <span class="token number">2022</span>

^<span class="token punctuation">[</span>?25l^<span class="token punctuation">[</span>?7l^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1m            .-/+oossssoo+/-.
        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span>
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssso.
   /sssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhdmmNNmmyNMMMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssss/
  +sssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhm^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myd^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mMMMMMMMNddddy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss+
 /ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMM^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myh^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhyyyyhmNMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss/
.ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMMd^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss.
+ssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhhhyNMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssss+
oss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMNyMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhmmmh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssso
oss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMNyMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssssssssssshmmmh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssso
+ssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhhhyNMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssss+
.ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMMd^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss.
 /ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMM^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myh^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhyyyyhdNMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss/
  +sssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdm^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myd^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mMMMMMMMMddddy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss+
   /sssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhdmNNNNmyNMMMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssss/
    .ossssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssso.
      -+sssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myyy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssss+-
        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span>
            .-/+oossssoo+/-.^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>20A^<span class="token punctuation">[</span>9999999D^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mmrdrivingduck^<span class="token punctuation">[</span>0m@^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mzjt-lenovo^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m------------------------^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mOS^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m Ubuntu <span class="token number">22.04</span>.1 LTS on Windows <span class="token number">10</span> x86_64^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mKernel^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">5.10</span>.16.3-microsoft-standard-WSL2^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mUptime^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">1</span> hour, <span class="token number">5</span> mins^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mPackages^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">780</span> <span class="token punctuation">(</span>dpkg<span class="token punctuation">)</span>^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mShell^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token function">zsh</span> <span class="token number">5.8</span>.1^<span class="token punctuation">[</span>0m
^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mTerminal^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m Windows Terminal^<span class="token punctuation">[</span>0m
</code></pre></div><p>这都什么玩意儿啊？因为没有解析 ANSI 的颜色样式序列。加上 <code>-c</code> 以后：</p><div class="language-bash" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">watch</span> <span class="token parameter variable">-c</span> neofetch

Every <span class="token number">2</span>.0s: neofetch                                              zjt-lenovo: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:25:31 <span class="token number">2022</span>

25l7l            .-/+oossssoo+/-.
        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span>
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssssdMMMNysssso.
   /ssssssssssshdmmNNmmyNMMMMhssssss/
  +ssssssssshmydMMMMMMMNddddyssssssss+
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   /ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span>
            .-/+oossssoo+/-.
mrdrivingduck@zjt-lenovo
------------------------
OS: Ubuntu <span class="token number">22.04</span>.1 LTS on Windows <span class="token number">10</span> x86_64
Kernel: <span class="token number">5.10</span>.16.3-microsoft-standard-WSL2
Uptime: <span class="token number">1</span> hour, <span class="token number">6</span> mins
Packages: <span class="token number">780</span> <span class="token punctuation">(</span>dpkg<span class="token punctuation">)</span>
Shell: <span class="token function">zsh</span> <span class="token number">5.8</span>.1
Terminal: Windows Terminal
</code></pre></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,17),k={href:"https://linux.die.net/man/1/watch",target:"_blank",rel:"noopener noreferrer"};function m(r,h){const n=t("ExternalLinkIcon");return p(),o("div",null,[i,s("ul",null,[s("li",null,[s("a",k,[c("watch(1) - Linux man page"),e(n)])])])])}const M=a(l,[["render",m],["__file","watch.html.vue"]]);export{M as default};
