import{_ as i,r as d,o as l,c as r,a as e,b as s,d as a,e as c}from"./app-25fa875f.js";const o={},u=c(`<h1 id="groupadd" tabindex="-1"><a class="header-anchor" href="#groupadd" aria-hidden="true">#</a> groupadd</h1><p>Created by : Mr Dk.</p><p>2023 / 02 / 06 22:55</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>groupadd</code> 用于创建一个用户组。在 Linux 中，从用户级别来维护各个用户的权限比较麻烦，所以引入了 <strong>用户组</strong> 的概念，可以通过为用户组赋权从而给组内所有的用户赋权。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">groupadd</span> <span class="token parameter variable">-h</span>
Usage: <span class="token function">groupadd</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span> GROUP

Options:
  -f, <span class="token parameter variable">--force</span>                   <span class="token builtin class-name">exit</span> successfully <span class="token keyword">if</span> the group already exists,
                                and cancel <span class="token parameter variable">-g</span> <span class="token keyword">if</span> the GID is already used
  -g, <span class="token parameter variable">--gid</span> GID                 use GID <span class="token keyword">for</span> the new group
  -h, <span class="token parameter variable">--help</span>                    display this <span class="token builtin class-name">help</span> message and <span class="token builtin class-name">exit</span>
  -K, <span class="token parameter variable">--key</span> <span class="token assign-left variable">KEY</span><span class="token operator">=</span>VALUE           override /etc/login.defs defaults
  -o, --non-unique              allow to create <span class="token function">groups</span> with duplicate
                                <span class="token punctuation">(</span>non-unique<span class="token punctuation">)</span> GID
  -p, <span class="token parameter variable">--password</span> PASSWORD       use this encrypted password <span class="token keyword">for</span> the new group
  -r, <span class="token parameter variable">--system</span>                  create a system account
  -R, <span class="token parameter variable">--root</span> CHROOT_DIR         directory to <span class="token function">chroot</span> into
  -P, <span class="token parameter variable">--prefix</span> PREFIX_DIR       directory prefix
      <span class="token parameter variable">--extrausers</span>              Use the extra <span class="token function">users</span> database
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="files" tabindex="-1"><a class="header-anchor" href="#files" aria-hidden="true">#</a> Files</h2><p>所有已被创建的用户组保存在 <code>/etc/group</code> 文件中：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> /etc/group
root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:syslog,ubuntu
tty:x:5:syslog
disk:x:6:
lp:x:7:
mail:x:8:
news:x:9:
uucp:x:10:
man:x:12:
proxy:x:13:
kmem:x:15:
dialout:x:20:
fax:x:21:
voice:x:22:
cdrom:x:24:ubuntu
floppy:x:25:
tape:x:26:
sudo:x:27:ubuntu
audio:x:29:
dip:x:30:ubuntu
www-data:x:33:
backup:x:34:
operator:x:37:
list:x:38:
irc:x:39:
src:x:40:
gnats:x:41:
shadow:x:42:
utmp:x:43:
video:x:44:
sasl:x:45:
plugdev:x:46:ubuntu
staff:x:50:
games:x:60:
users:x:100:
nogroup:x:65534:
systemd-journal:x:101:
systemd-network:x:102:
systemd-resolve:x:103:
systemd-timesync:x:104:
crontab:x:105:
messagebus:x:106:
input:x:107:
kvm:x:108:
render:x:109:
syslog:x:110:
tss:x:111:
uuidd:x:112:
tcpdump:x:113:
ssh:x:114:
landscape:x:115:
lxd:x:116:ubuntu
systemd-coredump:x:999:
ubuntu:x:1000:
ntp:x:117:
bind:x:118:
netdev:x:119:
lighthouse:x:1001:lighthouse
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其格式为：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>group_name:password:group_id:list-of-members
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="gid" tabindex="-1"><a class="header-anchor" href="#gid" aria-hidden="true">#</a> GID</h2><p>创建用户组时，需要使用一个编号作为用户组的 ID。默认情况下，这个数值为唯一且非负数，除非使用 <code>-o</code> 参数指定允许非唯一 GID。</p><p><code>-g</code> / <code>--gid</code> 可以显式指定想要使用的 GID，否则就将从指定范围内选择一个。选择的范围被定义在 <code>/etc/login.defs</code> 中：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> /etc/login.defs <span class="token operator">|</span> <span class="token function">grep</span> GID
GID_MIN                  <span class="token number">1000</span>
GID_MAX                 <span class="token number">60000</span>
<span class="token comment">#SYS_GID_MIN              100</span>
<span class="token comment">#SYS_GID_MAX              999</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述值可以通过 <code>-K GID_MIN=500 -K GID_MAX=700</code> 改写。</p><h2 id="system-user-group" tabindex="-1"><a class="header-anchor" href="#system-user-group" aria-hidden="true">#</a> System User Group</h2><p>如果想创建一个系统用户组，需要使用 <code>-r</code> / <code>--system</code>，这样会从 <code>SYS_GID_MIN</code> / <code>SYS_GID_MAX</code> 的范围中分配 GID。系统用户组与普通用户组并无权限上的区别，只是分配 GID 的范围不一样，用于人为区分。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,22),t={href:"https://www.geeksforgeeks.org/groupadd-command-in-linux-with-examples/",target:"_blank",rel:"noopener noreferrer"},v={href:"https://askubuntu.com/questions/523949/what-is-a-system-group-as-opposed-to-a-normal-group",target:"_blank",rel:"noopener noreferrer"};function p(m,b){const n=d("ExternalLinkIcon");return l(),r("div",null,[u,e("p",null,[e("a",t,[s("groupadd command in Linux with examples"),a(n)])]),e("p",null,[e("a",v,[s('ask Ubuntu - What is a "system" group, as opposed to a normal group?'),a(n)])])])}const h=i(o,[["render",p],["__file","groupadd.html.vue"]]);export{h as default};
