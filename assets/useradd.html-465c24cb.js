import{_ as n,r as s,o as r,c as o,a as e,b as i,d,e as c}from"./app-25fa875f.js";const t={},l=c(`<h1 id="useradd" tabindex="-1"><a class="header-anchor" href="#useradd" aria-hidden="true">#</a> useradd</h1><p>Created by : Mr Dk.</p><p>2023 / 02 / 12 23:53</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p><code>useradd</code> 用于创建一个新用户。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">useradd</span> <span class="token parameter variable">-h</span>
Usage: <span class="token function">useradd</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span> LOGIN
       <span class="token function">useradd</span> <span class="token parameter variable">-D</span>
       <span class="token function">useradd</span> <span class="token parameter variable">-D</span> <span class="token punctuation">[</span>options<span class="token punctuation">]</span>

Options:
      <span class="token parameter variable">--badnames</span>                <span class="token keyword">do</span> not check <span class="token keyword">for</span> bad names
  -b, --base-dir BASE_DIR       base directory <span class="token keyword">for</span> the home directory of the
                                new account
      --btrfs-subvolume-home    use BTRFS subvolume <span class="token keyword">for</span> home directory
  -c, <span class="token parameter variable">--comment</span> COMMENT         GECOS field of the new account
  -d, --home-dir HOME_DIR       home directory of the new account
  -D, <span class="token parameter variable">--defaults</span>                print or change default <span class="token function">useradd</span> configuration
  -e, <span class="token parameter variable">--expiredate</span> EXPIRE_DATE  expiration <span class="token function">date</span> of the new account
  -f, <span class="token parameter variable">--inactive</span> INACTIVE       password inactivity period of the new account
  -g, <span class="token parameter variable">--gid</span> GROUP               name or ID of the primary group of the new
                                account
  -G, <span class="token parameter variable">--groups</span> <span class="token environment constant">GROUPS</span>           list of supplementary <span class="token function">groups</span> of the new
                                account
  -h, <span class="token parameter variable">--help</span>                    display this <span class="token builtin class-name">help</span> message and <span class="token builtin class-name">exit</span>
  -k, <span class="token parameter variable">--skel</span> SKEL_DIR           use this alternative skeleton directory
  -K, <span class="token parameter variable">--key</span> <span class="token assign-left variable">KEY</span><span class="token operator">=</span>VALUE           override /etc/login.defs defaults
  -l, --no-log-init             <span class="token keyword">do</span> not <span class="token function">add</span> the user to the lastlog and
                                faillog databases
  -m, --create-home             create the user<span class="token string">&#39;s home directory
  -M, --no-create-home          do not create the user&#39;</span>s home directory
  -N, --no-user-group           <span class="token keyword">do</span> not create a group with the same name as
                                the user
  -o, --non-unique              allow to create <span class="token function">users</span> with duplicate
                                <span class="token punctuation">(</span>non-unique<span class="token punctuation">)</span> <span class="token environment constant">UID</span>
  -p, <span class="token parameter variable">--password</span> PASSWORD       encrypted password of the new account
  -r, <span class="token parameter variable">--system</span>                  create a system account
  -R, <span class="token parameter variable">--root</span> CHROOT_DIR         directory to <span class="token function">chroot</span> into
  -P, <span class="token parameter variable">--prefix</span> PREFIX_DIR       prefix directory where are located the /etc/* files
  -s, <span class="token parameter variable">--shell</span> <span class="token environment constant">SHELL</span>             login shell of the new account
  -u, <span class="token parameter variable">--uid</span> <span class="token environment constant">UID</span>                 user ID of the new account
  -U, --user-group              create a group with the same name as the user
  -Z, --selinux-user SEUSER     use a specific SEUSER <span class="token keyword">for</span> the SELinux user mapping
      <span class="token parameter variable">--extrausers</span>              Use the extra <span class="token function">users</span> database
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="uid" tabindex="-1"><a class="header-anchor" href="#uid" aria-hidden="true">#</a> UID</h2><p>创建用户时，需要使用一个编号作为用户组的 ID。默认情况下，这个数值为唯一且非负数，除非使用 <code>-o</code> 参数指定允许非唯一 UID。</p><p><code>-u</code> / <code>--uid</code> 可以显式指定想要使用的 UID，否则就将从指定范围内选择一个。选择的范围被定义在 <code>/etc/login.defs</code> 中：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">cat</span> /etc/login.defs <span class="token operator">|</span> <span class="token function">grep</span> <span class="token environment constant">UID</span>
UID_MIN                  <span class="token number">1000</span>
UID_MAX                 <span class="token number">60000</span>
<span class="token comment">#SYS_UID_MIN              100</span>
<span class="token comment">#SYS_UID_MAX              999</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>-r</code> / <code>--system</code> 用于创建一个系统用户，使用 <code>SYS_UID_MIN</code> 到 <code>SYS_UID_MAX</code> 中间的 UID。</p><p>上述配置文件中的值可以通过 <code>-K UID_MIN=500 -K UID_MAX=700</code> 改写。</p><h2 id="home-directory" tabindex="-1"><a class="header-anchor" href="#home-directory" aria-hidden="true">#</a> Home Directory</h2><p>通过 <code>-d</code> / <code>--home-dir</code> 选项指定新用户的 HOME 目录。<code>-m</code>/ <code>--create-home</code> 用于在相应目录不存在的时候创建。</p><h2 id="password" tabindex="-1"><a class="header-anchor" href="#password" aria-hidden="true">#</a> Password</h2><p><code>-p</code> / <code>--password</code> 用于指定用户的密码。密码以密文形式保存在 <code>/etc/shadow</code> 中。</p><h2 id="user-group" tabindex="-1"><a class="header-anchor" href="#user-group" aria-hidden="true">#</a> User Group</h2><p>使用 <code>-g</code> / <code>--gid</code> 指定新用户需要加入的用户组，这个用户组必须已经存在。</p><p>使用 <code>-G</code> / <code>--groups</code> 指定新用户要加入的一系列用户组，以逗号分隔。</p><h2 id="shell" tabindex="-1"><a class="header-anchor" href="#shell" aria-hidden="true">#</a> Shell</h2><p>使用 <code>-s</code> / <code>--shell</code> 指定新用户使用的 shell。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,25),p={href:"https://man7.org/linux/man-pages/man8/useradd.8.html",target:"_blank",rel:"noopener noreferrer"};function u(h,v){const a=s("ExternalLinkIcon");return r(),o("div",null,[l,e("p",null,[e("a",p,[i("useradd(8) — Linux manual page"),d(a)])])])}const b=n(t,[["render",u],["__file","useradd.html.vue"]]);export{b as default};
