import{_ as s,c as n,a as i,o as a}from"./app-CT9FvwxE.js";const l="/blog/assets/openssh-start-adBjGm1m.png",t="/blog/assets/openssh-service-BGYQy9tc.png",r={};function d(o,e){return a(),n("div",null,e[0]||(e[0]=[i(`<h1 id="network-scp" tabindex="-1"><a class="header-anchor" href="#network-scp"><span>Network - SCP</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 06 / 14 13:42</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p><strong>Secure Copy Protocol (SCP)</strong> 是一款用于在本地与远程主机之间安全传输文件的协议，基于 Secure Shell (SSH) 协议。其本身既代表一个协议，又代表实现该协议的程序。OpenSSH 中包含了 SCP 的实现</p><blockquote><p>According to OpenSSH developers in April 2019 the scp protocol is outdated, inflexible and not readily fixed.</p></blockquote><hr><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">scp [-346BCpqrv] [-c cipher] [-F ssh_config] [-i identity_file]</span>
<span class="line">    [-l limit] [-o ssh_option] [-P port] [-S program] source ... target</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>简易写法：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">scp [options] file_source file_target</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>其中 <code>source</code> 和 <code>target</code> 的格式：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">[user@]host:file1 file2 ...</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>如果在 SSH 的 <code>config</code> 中配置了远程用户：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Host hostwind</span>
<span class="line">    HostName 23.254.225.164</span>
<span class="line">    User root</span>
<span class="line">    IdentityFile ~/.ssh/id_rsa</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么可以直接使用 Host 作为 source 或者 target：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">scp [] host1:... host2:...</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>若拷贝目录，则加入 <code>-r</code>。</p><hr><h2 id="theory" tabindex="-1"><a class="header-anchor" href="#theory"><span>Theory</span></a></h2><p>想要使用 SCP，需要：</p><ul><li>远程服务器上运行 SSH 服务器</li><li>本地机器上运行 SSH 客户端</li></ul><p>换句话说，由于 SCP 基于 SSH。只有本地机器能够通过 SSH 连接到远程机器，才能使用 SCP</p><h3 id="linux-configuration" tabindex="-1"><a class="header-anchor" href="#linux-configuration"><span>Linux Configuration</span></a></h3><p>一般来说，Linux 上已经自带了 SSH 客户端，可通过如下命令测试：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh</span>
<span class="line">usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-b bind_address] [-c cipher_spec]</span>
<span class="line">           [-D [bind_address:]port] [-E log_file] [-e escape_char]</span>
<span class="line">           [-F configfile] [-I pkcs11] [-i identity_file]</span>
<span class="line">           [-J [user@]host[:port]] [-L address] [-l login_name] [-m mac_spec]</span>
<span class="line">           [-O ctl_cmd] [-o option] [-p port] [-Q query_option] [-R address]</span>
<span class="line">           [-S ctl_path] [-W host:port] [-w local_tun[:remote_tun]]</span>
<span class="line">           [user@]hostname [command]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果没有安装 SSH 服务器的话：</p><ul><li>安装 <code>openssh-server</code></li><li>启动 sshd 服务</li></ul><h3 id="windows-configuration" tabindex="-1"><a class="header-anchor" href="#windows-configuration"><span>Windows Configuration</span></a></h3><p>Windows 10 的较新版本已经内置了 OpenSSH，但是默认只安装 OpenSSH Client。在 Win 10 - <code>设置 - 应用 - 管理可选功能 - 添加功能</code> 中，找到 OpenSSH 服务器并安装：</p><p><img src="`+l+'" alt="openssh-start"></p><p>在系统 <code>服务</code> 中，找到 <code>OpenSSH SSH Server</code>，并启动该服务：</p><p><img src="'+t+'" alt="openssh-service"></p><hr><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>以上配置完成后：</p><ul><li>Linux ⇔ Linux</li><li>Windows ⇔ Windows</li><li>Windows ⇔ Linux</li></ul><p>应当是全部可以实现互相 SSH 以及 SCP 了。</p><p>接下来就是一些小问题，比如不同 OS 上路径表示方式的差异。Linux 上可以用 <code>~/dir/...</code> 来表示当前用户主目录；而在 Windows 上不识别 <code>~</code>，所以使用 <code>./dir/...</code> 就可以了。</p><p>SCP 可以轻松实现能够互相通过 SSH 连接的设备之间的文件传输。所以，可以借助远程服务器下载外网资源，再通过 SCP 传回本地；或者借助高速的局域网连接，实现同一局域网内设备之间的文件传递。比 U 盘来的高效多了...... 🤗</p><hr>',43)]))}const p=s(r,[["render",d],["__file","Network SCP.html.vue"]]),u=JSON.parse('{"path":"/notes/Network/Network%20SCP.html","title":"Network - SCP","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"Theory","slug":"theory","link":"#theory","children":[{"level":3,"title":"Linux Configuration","slug":"linux-configuration","link":"#linux-configuration","children":[]},{"level":3,"title":"Windows Configuration","slug":"windows-configuration","link":"#windows-configuration","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"notes/Network/Network SCP.md"}');export{p as comp,u as data};
