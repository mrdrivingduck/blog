import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function p(d,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="groupadd" tabindex="-1"><a class="header-anchor" href="#groupadd"><span>groupadd</span></a></h1><p>Created by : Mr Dk.</p><p>2023 / 02 / 06 22:55</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>groupadd</code> 用于创建一个用户组。在 Linux 中，从用户级别来维护各个用户的权限比较麻烦，所以引入了 <strong>用户组</strong> 的概念，可以通过为用户组赋权从而给组内所有的用户赋权。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">groupadd</span> <span class="token parameter variable">-h</span></span>
<span class="line">Usage: <span class="token function">groupadd</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span> GROUP</span>
<span class="line"></span>
<span class="line">Options:</span>
<span class="line">  -f, <span class="token parameter variable">--force</span>                   <span class="token builtin class-name">exit</span> successfully <span class="token keyword">if</span> the group already exists,</span>
<span class="line">                                and cancel <span class="token parameter variable">-g</span> <span class="token keyword">if</span> the GID is already used</span>
<span class="line">  -g, <span class="token parameter variable">--gid</span> GID                 use GID <span class="token keyword">for</span> the new group</span>
<span class="line">  -h, <span class="token parameter variable">--help</span>                    display this <span class="token builtin class-name">help</span> message and <span class="token builtin class-name">exit</span></span>
<span class="line">  -K, <span class="token parameter variable">--key</span> <span class="token assign-left variable">KEY</span><span class="token operator">=</span>VALUE           override /etc/login.defs defaults</span>
<span class="line">  -o, --non-unique              allow to create <span class="token function">groups</span> with duplicate</span>
<span class="line">                                <span class="token punctuation">(</span>non-unique<span class="token punctuation">)</span> GID</span>
<span class="line">  -p, <span class="token parameter variable">--password</span> PASSWORD       use this encrypted password <span class="token keyword">for</span> the new group</span>
<span class="line">  -r, <span class="token parameter variable">--system</span>                  create a system account</span>
<span class="line">  -R, <span class="token parameter variable">--root</span> CHROOT_DIR         directory to <span class="token function">chroot</span> into</span>
<span class="line">  -P, <span class="token parameter variable">--prefix</span> PREFIX_DIR       directory prefix</span>
<span class="line">      <span class="token parameter variable">--extrausers</span>              Use the extra <span class="token function">users</span> database</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="files" tabindex="-1"><a class="header-anchor" href="#files"><span>Files</span></a></h2><p>所有已被创建的用户组保存在 <code>/etc/group</code> 文件中：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cat</span> /etc/group</span>
<span class="line">root:x:0:</span>
<span class="line">daemon:x:1:</span>
<span class="line">bin:x:2:</span>
<span class="line">sys:x:3:</span>
<span class="line">adm:x:4:syslog,ubuntu</span>
<span class="line">tty:x:5:syslog</span>
<span class="line">disk:x:6:</span>
<span class="line">lp:x:7:</span>
<span class="line">mail:x:8:</span>
<span class="line">news:x:9:</span>
<span class="line">uucp:x:10:</span>
<span class="line">man:x:12:</span>
<span class="line">proxy:x:13:</span>
<span class="line">kmem:x:15:</span>
<span class="line">dialout:x:20:</span>
<span class="line">fax:x:21:</span>
<span class="line">voice:x:22:</span>
<span class="line">cdrom:x:24:ubuntu</span>
<span class="line">floppy:x:25:</span>
<span class="line">tape:x:26:</span>
<span class="line">sudo:x:27:ubuntu</span>
<span class="line">audio:x:29:</span>
<span class="line">dip:x:30:ubuntu</span>
<span class="line">www-data:x:33:</span>
<span class="line">backup:x:34:</span>
<span class="line">operator:x:37:</span>
<span class="line">list:x:38:</span>
<span class="line">irc:x:39:</span>
<span class="line">src:x:40:</span>
<span class="line">gnats:x:41:</span>
<span class="line">shadow:x:42:</span>
<span class="line">utmp:x:43:</span>
<span class="line">video:x:44:</span>
<span class="line">sasl:x:45:</span>
<span class="line">plugdev:x:46:ubuntu</span>
<span class="line">staff:x:50:</span>
<span class="line">games:x:60:</span>
<span class="line">users:x:100:</span>
<span class="line">nogroup:x:65534:</span>
<span class="line">systemd-journal:x:101:</span>
<span class="line">systemd-network:x:102:</span>
<span class="line">systemd-resolve:x:103:</span>
<span class="line">systemd-timesync:x:104:</span>
<span class="line">crontab:x:105:</span>
<span class="line">messagebus:x:106:</span>
<span class="line">input:x:107:</span>
<span class="line">kvm:x:108:</span>
<span class="line">render:x:109:</span>
<span class="line">syslog:x:110:</span>
<span class="line">tss:x:111:</span>
<span class="line">uuidd:x:112:</span>
<span class="line">tcpdump:x:113:</span>
<span class="line">ssh:x:114:</span>
<span class="line">landscape:x:115:</span>
<span class="line">lxd:x:116:ubuntu</span>
<span class="line">systemd-coredump:x:999:</span>
<span class="line">ubuntu:x:1000:</span>
<span class="line">ntp:x:117:</span>
<span class="line">bind:x:118:</span>
<span class="line">netdev:x:119:</span>
<span class="line">lighthouse:x:1001:lighthouse</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其格式为：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">group_name:password:group_id:list-of-members</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="gid" tabindex="-1"><a class="header-anchor" href="#gid"><span>GID</span></a></h2><p>创建用户组时，需要使用一个编号作为用户组的 ID。默认情况下，这个数值为唯一且非负数，除非使用 <code>-o</code> 参数指定允许非唯一 GID。</p><p><code>-g</code> / <code>--gid</code> 可以显式指定想要使用的 GID，否则就将从指定范围内选择一个。选择的范围被定义在 <code>/etc/login.defs</code> 中：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ <span class="token function">cat</span> /etc/login.defs <span class="token operator">|</span> <span class="token function">grep</span> GID</span>
<span class="line">GID_MIN                  <span class="token number">1000</span></span>
<span class="line">GID_MAX                 <span class="token number">60000</span></span>
<span class="line"><span class="token comment">#SYS_GID_MIN              100</span></span>
<span class="line"><span class="token comment">#SYS_GID_MAX              999</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述值可以通过 <code>-K GID_MIN=500 -K GID_MAX=700</code> 改写。</p><h2 id="system-user-group" tabindex="-1"><a class="header-anchor" href="#system-user-group"><span>System User Group</span></a></h2><p>如果想创建一个系统用户组，需要使用 <code>-r</code> / <code>--system</code>，这样会从 <code>SYS_GID_MIN</code> / <code>SYS_GID_MAX</code> 的范围中分配 GID。系统用户组与普通用户组并无权限上的区别，只是分配 GID 的范围不一样，用于人为区分。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.geeksforgeeks.org/groupadd-command-in-linux-with-examples/" target="_blank" rel="noopener noreferrer">groupadd command in Linux with examples</a></p><p><a href="https://askubuntu.com/questions/523949/what-is-a-system-group-as-opposed-to-a-normal-group" target="_blank" rel="noopener noreferrer">ask Ubuntu - What is a &quot;system&quot; group, as opposed to a normal group?</a></p>`,24)]))}const r=n(i,[["render",p],["__file","groupadd.html.vue"]]),t=JSON.parse('{"path":"/notes/Linux/groupadd.html","title":"groupadd","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"Files","slug":"files","link":"#files","children":[]},{"level":2,"title":"GID","slug":"gid","link":"#gid","children":[]},{"level":2,"title":"System User Group","slug":"system-user-group","link":"#system-user-group","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/groupadd.md"}');export{r as comp,t as data};
