import{_ as n,c as a,a as p,o as t}from"./app-aVGbliEg.js";const e={};function c(o,s){return t(),a("div",null,s[0]||(s[0]=[p(`<h1 id="watch" tabindex="-1"><a class="header-anchor" href="#watch"><span>watch</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 10 / 29 11:35</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>watch</code> 命令能够周期性地执行一条命令，并全屏打印执行结果。这非常适合监控。默认周期为两秒。</p><h2 id="syntax" tabindex="-1"><a class="header-anchor" href="#syntax"><span>Syntax</span></a></h2><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">watch</span> <span class="token parameter variable">-h</span></span>
<span class="line"></span>
<span class="line">Usage:</span>
<span class="line"> <span class="token function">watch</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span> <span class="token builtin class-name">command</span></span>
<span class="line"></span>
<span class="line">Options:</span>
<span class="line">  -b, <span class="token parameter variable">--beep</span>             beep <span class="token keyword">if</span> <span class="token builtin class-name">command</span> has a non-zero <span class="token builtin class-name">exit</span></span>
<span class="line">  -c, <span class="token parameter variable">--color</span>            interpret ANSI color and style sequences</span>
<span class="line">  -d, --differences<span class="token punctuation">[</span><span class="token operator">=</span><span class="token operator">&lt;</span>permanent<span class="token operator">&gt;</span><span class="token punctuation">]</span></span>
<span class="line">                         highlight changes between updates</span>
<span class="line">  -e, <span class="token parameter variable">--errexit</span>          <span class="token builtin class-name">exit</span> <span class="token keyword">if</span> <span class="token builtin class-name">command</span> has a non-zero <span class="token builtin class-name">exit</span></span>
<span class="line">  -g, <span class="token parameter variable">--chgexit</span>          <span class="token builtin class-name">exit</span> when output from <span class="token builtin class-name">command</span> changes</span>
<span class="line">  -n, <span class="token parameter variable">--interval</span> <span class="token operator">&lt;</span>secs<span class="token operator">&gt;</span>  seconds to <span class="token function">wait</span> between updates</span>
<span class="line">  -p, <span class="token parameter variable">--precise</span>          attempt run <span class="token builtin class-name">command</span> <span class="token keyword">in</span> precise intervals</span>
<span class="line">  -t, --no-title         turn off header</span>
<span class="line">  -x, <span class="token parameter variable">--exec</span>             pass <span class="token builtin class-name">command</span> to <span class="token builtin class-name">exec</span> instead of <span class="token string">&quot;sh -c&quot;</span></span>
<span class="line"></span>
<span class="line"> -h, <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span></span>
<span class="line"> -v, <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span></span>
<span class="line"></span>
<span class="line">For <span class="token function">more</span> details see watch<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.</span>
<span class="line"></span></code></pre></div><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><p>使用 <code>-n</code> 参数可以调整周期运行的时间间隔，<code>-d</code> 参数可以高亮本次运行和上次运行之间的差异。比如监控网络时：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">watch</span> <span class="token parameter variable">-n</span> <span class="token number">1</span> <span class="token parameter variable">-d</span> <span class="token function">netstat</span></span>
<span class="line"></span>
<span class="line">Every <span class="token number">1</span>.0s: <span class="token function">netstat</span>                                                      nat: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:27:31 <span class="token number">2022</span></span>
<span class="line"></span>
<span class="line">Active Internet connections <span class="token punctuation">(</span>w/o servers<span class="token punctuation">)</span></span>
<span class="line">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:34510               <span class="token number">169.254</span>.0.55:http       ESTABLISHED</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:56196               <span class="token number">169.254</span>.0.138:8186      ESTABLISHED</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">1</span> nat:53986               <span class="token number">10.148</span>.188.202:http     SYN_SENT</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:ssh                 <span class="token number">112.10</span>.216.174:38489    ESTABLISHED</span>
<span class="line">tcp        <span class="token number">0</span>      <span class="token number">0</span> nat:39234               <span class="token number">169.254</span>.0.55:5574       ESTABLISHED</span>
<span class="line">Active UNIX domain sockets <span class="token punctuation">(</span>w/o servers<span class="token punctuation">)</span></span>
<span class="line">Proto RefCnt Flags       Type       State         I-Node   Path</span>
<span class="line">unix  <span class="token number">2</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">120540811</span> /run/user/0/systemd/notify</span>
<span class="line">unix  <span class="token number">3</span>      <span class="token punctuation">[</span> <span class="token punctuation">]</span>         DGRAM                    <span class="token number">15934</span>    /run/systemd/notify</span>
<span class="line"><span class="token punctuation">..</span>.</span>
<span class="line"></span></code></pre></div><p>另外，使用 <code>-c</code> 参数可以解释输出中的颜色信息，比如 <code>neofetch</code>：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">watch</span> neofetch</span>
<span class="line"></span>
<span class="line">Every <span class="token number">2</span>.0s: neofetch                                              zjt-lenovo: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:24:55 <span class="token number">2022</span></span>
<span class="line"></span>
<span class="line">^<span class="token punctuation">[</span>?25l^<span class="token punctuation">[</span>?7l^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1m            .-/+oossssoo+/-.</span>
<span class="line">        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span></span>
<span class="line">      -+ssssssssssssssssssyyssss+-</span>
<span class="line">    .ossssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssso.</span>
<span class="line">   /sssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhdmmNNmmyNMMMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssss/</span>
<span class="line">  +sssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhm^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myd^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mMMMMMMMNddddy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss+</span>
<span class="line"> /ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMM^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myh^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhyyyyhmNMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss/</span>
<span class="line">.ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMMd^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss.</span>
<span class="line">+ssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhhhyNMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssss+</span>
<span class="line">oss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMNyMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhmmmh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssso</span>
<span class="line">oss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMNyMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssssssssssshmmmh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssso</span>
<span class="line">+ssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhhhyNMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myNMMMy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssssss+</span>
<span class="line">.ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMMd^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss.</span>
<span class="line"> /ssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhNMMM^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myh^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhyyyyhdNMMMNh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss/</span>
<span class="line">  +sssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdm^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1myd^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mMMMMMMMMddddy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssssss+</span>
<span class="line">   /sssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mhdmNNNNmyNMMMMh^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssssss/</span>
<span class="line">    .ossssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1mdMMMNy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1msssso.</span>
<span class="line">      -+sssssssssssssssss^<span class="token punctuation">[</span>37m^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1myyy^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mssss+-</span>
<span class="line">        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span></span>
<span class="line">            .-/+oossssoo+/-.^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>20A^<span class="token punctuation">[</span>9999999D^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>1m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mmrdrivingduck^<span class="token punctuation">[</span>0m@^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mzjt-lenovo^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m------------------------^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mOS^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m Ubuntu <span class="token number">22.04</span>.1 LTS on Windows <span class="token number">10</span> x86_64^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mKernel^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">5.10</span>.16.3-microsoft-standard-WSL2^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mUptime^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">1</span> hour, <span class="token number">5</span> mins^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mPackages^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token number">780</span> <span class="token punctuation">(</span>dpkg<span class="token punctuation">)</span>^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mShell^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m <span class="token function">zsh</span> <span class="token number">5.8</span>.1^<span class="token punctuation">[</span>0m</span>
<span class="line">^<span class="token punctuation">[</span>43C^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>31m^<span class="token punctuation">[</span>1mTerminal^<span class="token punctuation">[</span>0m^<span class="token punctuation">[</span>0m:^<span class="token punctuation">[</span>0m Windows Terminal^<span class="token punctuation">[</span>0m</span>
<span class="line"></span></code></pre></div><p>这都什么玩意儿啊？因为没有解析 ANSI 的颜色样式序列。加上 <code>-c</code> 以后：</p><div class="language-bash" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">watch</span> <span class="token parameter variable">-c</span> neofetch</span>
<span class="line"></span>
<span class="line">Every <span class="token number">2</span>.0s: neofetch                                              zjt-lenovo: Sat Oct <span class="token number">29</span> <span class="token number">11</span>:25:31 <span class="token number">2022</span></span>
<span class="line"></span>
<span class="line">25l7l            .-/+oossssoo+/-.</span>
<span class="line">        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span></span>
<span class="line">      -+ssssssssssssssssssyyssss+-</span>
<span class="line">    .ossssssssssssssssssdMMMNysssso.</span>
<span class="line">   /ssssssssssshdmmNNmmyNMMMMhssssss/</span>
<span class="line">  +ssssssssshmydMMMMMMMNddddyssssssss+</span>
<span class="line"> /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/</span>
<span class="line">.ssssssssdMMMNhsssssssssshNMMMdssssssss.</span>
<span class="line">+sssshhhyNMMNyssssssssssssyNMMMysssssss+</span>
<span class="line">ossyNMMMNyMMhsssssssssssssshmmmhssssssso</span>
<span class="line">ossyNMMMNyMMhsssssssssssssshmmmhssssssso</span>
<span class="line">+sssshhhyNMMNyssssssssssssyNMMMysssssss+</span>
<span class="line">.ssssssssdMMMNhsssssssssshNMMMdssssssss.</span>
<span class="line"> /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/</span>
<span class="line">  +sssssssssdmydMMMMMMMMddddyssssssss+</span>
<span class="line">   /ssssssssssshdmNNNNmyNMMMMhssssss/</span>
<span class="line">    .ossssssssssssssssssdMMMNysssso.</span>
<span class="line">      -+sssssssssssssssssyyyssss+-</span>
<span class="line">        <span class="token variable"><span class="token variable">\`</span>:+ssssssssssssssssss+:<span class="token variable">\`</span></span></span>
<span class="line">            .-/+oossssoo+/-.</span>
<span class="line">mrdrivingduck@zjt-lenovo</span>
<span class="line">------------------------</span>
<span class="line">OS: Ubuntu <span class="token number">22.04</span>.1 LTS on Windows <span class="token number">10</span> x86_64</span>
<span class="line">Kernel: <span class="token number">5.10</span>.16.3-microsoft-standard-WSL2</span>
<span class="line">Uptime: <span class="token number">1</span> hour, <span class="token number">6</span> mins</span>
<span class="line">Packages: <span class="token number">780</span> <span class="token punctuation">(</span>dpkg<span class="token punctuation">)</span></span>
<span class="line">Shell: <span class="token function">zsh</span> <span class="token number">5.8</span>.1</span>
<span class="line">Terminal: Windows Terminal</span>
<span class="line"></span></code></pre></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><ul><li><a href="https://linux.die.net/man/1/watch" target="_blank" rel="noopener noreferrer">watch(1) - Linux man page</a></li></ul>`,18)]))}const u=n(e,[["render",c],["__file","watch.html.vue"]]),i=JSON.parse('{"path":"/notes/Linux/watch.html","title":"watch","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Syntax","slug":"syntax","link":"#syntax","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/watch.md"}');export{u as comp,i as data};