import{_ as n,c as s,a,o as i}from"./app-aVGbliEg.js";const t={};function l(o,e){return i(),s("div",null,e[0]||(e[0]=[a(`<h1 id="network-ssh" tabindex="-1"><a class="header-anchor" href="#network-ssh"><span>Network - SSH</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 05 / 31 10:09</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p><a href="https://en.wikipedia.org/wiki/Secure_Shell" target="_blank" rel="noopener noreferrer">Wikipedia</a>:</p><blockquote><p><strong>Secure Shell (SSH)</strong> is a cryptographic network protocol for operating network services securely over an unsecured network. Typical applications include <strong>remote command-line login</strong> and <strong>remote command execution</strong>, but any network service can be secured with SSH.</p><p>SSH provides a secure channel over an unsecured network in a <strong>client–server</strong> architecture, connecting an <strong>SSH client</strong> application with an <strong>SSH server</strong>. The protocol specification distinguishes between two major versions, referred to as <strong>SSH-1</strong> and <strong>SSH-2</strong>. The standard TCP port for SSH is <strong>22</strong>. SSH is generally used to access <strong>Unix-like</strong> operating systems, but it can also be used on <strong>Microsoft Windows</strong>. Windows 10 uses <strong>OpenSSH</strong> as its default SSH client.</p><p>SSH was designed as a replacement for Telnet and for unsecured remote shell protocols such as the Berkeley rlogin, rsh, and rexec protocols. Those protocols send information, notably passwords, in plaintext, rendering them susceptible to interception and disclosure using packet analysis. The encryption used by SSH is intended to provide <strong>confidentiality</strong> and <strong>integrity</strong> of data over an unsecured network, such as the Internet, although files leaked by <em>Edward Snowden</em> indicate that the <em>National Security Agency</em> can sometimes decrypt SSH, allowing them to read the contents of SSH sessions.</p></blockquote><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><p>SSH 利用公钥密码学认证远程计算机。认证基于私钥，密钥本身不会通过网络传播。SSH 只认证 <strong>提供公钥的一方是否也拥有对应的私钥</strong>：因此 <strong>认证未知公钥</strong> 相当重要。如果接受了攻击者的公钥，将导致未授权的攻击者成为合法用户。</p><p>SSH 通常用于登录远程机器并执行命令，也支持 <strong>SSH File Transfer Protocol (SFTP)</strong> 和 <strong>Secure Copy Protocol (SCP)</strong>。SSH 使用服务器-客户端模型。SSH 服务的熟知 TCP 端口是 <code>22</code>。</p><h2 id="theory" tabindex="-1"><a class="header-anchor" href="#theory"><span>Theory</span></a></h2><p>在第一次客户端连接到远程服务器时：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh user@host</span>
<span class="line">The authenticity of host &#39;104.168.166.54 (104.168.166.54)&#39; can&#39;t be established.</span>
<span class="line">ECDSA key fingerprint is SHA256:skmJDYbFdTFiftzRApMGQpRZHiuc8w36R3MkvKninQo.</span>
<span class="line">Are you sure you want to continue connecting (yes/no)? yes</span>
<span class="line">Warning: Permanently added &#39;104.168.166.54&#39; (ECDSA) to the list of known hosts.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上信息表示无法验证远程服务器的身份，只知道其公钥指纹。用户需要自行比对公钥指纹，和远程服务器公开的公钥指纹，对远程服务器的身份认证。否则，攻击者可能截获到客户端的登录请求后，向客户端发放伪造的公钥，从而成为中间人 (Man-In-The-Middle)，通过伪造公钥获取用户登录到远程服务器的账号、密码。再使用用户的账号、密码 SSH 连接到远程服务器上，从而导致 SSH 的安全机制完全失效。</p><p>假设用户接受该公钥，则公钥会被保存在客户端的 <code>~/.ssh/known_hosts</code> 中，下次再连接该远程服务器时，会直接使用该公钥。每个 SSH 用户都有自己的 <code>known_hosts</code>，同时系统也有一个 <code>/etc/ssh/ssh_known_hosts</code>，保存一些对所有用户都可信赖的远程服务器公钥。</p><h2 id="log-in-by-password" tabindex="-1"><a class="header-anchor" href="#log-in-by-password"><span>Log In by Password</span></a></h2><p>通过用户名 + 密码来登录远程服务器。</p><ol><li>SSH 服务器受到客户端的登录请求，将公钥发送给客户端</li><li>客户端接收并信任该公钥，将登录用户名、密码通过公钥加密后发送</li><li>服务器通过私钥解密，并判断用户名、密码是否合法</li></ol><h2 id="log-in-by-public-key" tabindex="-1"><a class="header-anchor" href="#log-in-by-public-key"><span>Log In by Public Key</span></a></h2><p>使用口令登录时，每次都需要输入密码，比较麻烦。如果说，客户端能够将自己的公钥存放在远程服务器上，那么就可以通过公钥直接进行登录。</p><ul><li>远程服务器向客户端发送随机字符串</li><li>客户端用自己的私钥加密后，发送给远程服务器</li><li>服务器用存储的客户端公钥解密</li><li>如果解密后与原字符串相同，则认证成功，允许登录</li></ul><h3 id="key-generation" tabindex="-1"><a class="header-anchor" href="#key-generation"><span>Key Generation</span></a></h3><p>这种方法必须要求客户端有自己的公私钥对，如果没有则需要生成：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh-keygen -t rsa -C &quot;...&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>会问一大堆问题，比如是否想密钥保存在 <code>~/.ssh/id_rsa</code> 等。如果觉得密钥不安全，还可以对密钥设口令，每次使用时需要认证口令。生成完成后，密钥默认生成在：</p><ul><li>私钥位于 <code>~/.ssh/id_rsa</code></li><li>公钥位于 <code>~/.ssh/id_rsa.pub</code></li></ul><h3 id="key-management" tabindex="-1"><a class="header-anchor" href="#key-management"><span>Key Management</span></a></h3><p>下一步，将客户端公钥放到服务器上即可。服务器将可登录的客户端公钥存放在 <code>~/.ssh/authorized_keys</code> 中，将公钥直接追加在该文件末尾即可。也可以在客户端直接通过命令将公钥拷贝：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh-copy-id user@host</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>当然，拷贝这一步暂时还是需要像口令登录一样输入密码的，不然任何人都可以把自己的公钥放到服务器上去了。从此以后，再次登录就不需要密码了：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh user@host</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="host-configuration" tabindex="-1"><a class="header-anchor" href="#host-configuration"><span>Host Configuration</span></a></h2><p>以上步骤完成后，每次 SSH 到远程服务器还是很麻烦，主要是 IP 地址太难记了。SSH 提供了一个配置文件，可以将 <code>user</code>、<code>host</code> 和私钥保存在配置文件中，并取一个别名。配置文件的格式如下：</p><p>编辑 <code>~/.ssh/config</code> (如果没有就新建一个)</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Host MyServerName</span>
<span class="line">    HostName 104.168.166.54</span>
<span class="line">    User root</span>
<span class="line">    IdentityFile ~/.ssh/id_rsa</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>保存配置后，以后可以直接通过别名进行登录：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh MyServerName</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="issue" tabindex="-1"><a class="header-anchor" href="#issue"><span>Issue</span></a></h2><h3 id="disconnect" tabindex="-1"><a class="header-anchor" href="#disconnect"><span>Disconnect</span></a></h3><p>SSH 连接后，如果窗口在一段时间内不去管它，服务器就会自动断开连接，导致已有的一些交互性工作丢失。在 SSH 的客户端和服务端都可以配置心跳，使连接能继续保持下去。</p><p>服务端配置 - 编辑 <code>/etc/ssh/sshd_config</code>：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">ClientAliveInterval 10</span>
<span class="line">ClientAliveCountMax 3</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>然后重启 sshd 服务。配置的含义是每 10s 向客户端发送一个心跳包。如果连续三个心跳包都没有得到客户端的回应，就与客户端断开连接。另外，<code>TCPKeeyAlive</code> 被配置为 <code>yes</code> 也有类似效果。开启这个选项会使用 TCP keep alive 来保持连接。与上一个选项的区别在于，SSH 自身的 keep alive 信号是应用层信息，是经过加密的；而 TCP 层的 keep alive 是可以被欺骗的。</p><p>对于 SSH 客户端，也可以配置主动发送心跳包的时间。一些常用的 SSH 客户端 <em>XShell</em>、<em>Terminus</em> 也有类似的功能。对于 Terminal 用户，配置过程与服务端类似 - 编辑 <code>/etc/ssh/ssh_config</code>：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">ServerAliveInterval 10</span>
<span class="line">ServerAliveCountMax 3</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="on-macos" tabindex="-1"><a class="header-anchor" href="#on-macos"><span>On MacOS</span></a></h3><p>在 macOS 14 Mojave 的 Terminal 上使用 SSH 时，出现问题：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ssh root@user</span>
<span class="line">packet_write_wait: Connection to 104.168.166.54 port 22: Broken pipe</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>解决的方法是，在配置文件中为所有的用户添加一条属性：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Host *</span>
<span class="line">    IPQoS=throughput</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>然后就可以成功 SSH 到远程服务器了。</p><hr>`,53)]))}const d=n(t,[["render",l],["__file","Network SSH.html.vue"]]),c=JSON.parse('{"path":"/notes/Network/Network%20SSH.html","title":"Network - SSH","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Theory","slug":"theory","link":"#theory","children":[]},{"level":2,"title":"Log In by Password","slug":"log-in-by-password","link":"#log-in-by-password","children":[]},{"level":2,"title":"Log In by Public Key","slug":"log-in-by-public-key","link":"#log-in-by-public-key","children":[{"level":3,"title":"Key Generation","slug":"key-generation","link":"#key-generation","children":[]},{"level":3,"title":"Key Management","slug":"key-management","link":"#key-management","children":[]}]},{"level":2,"title":"Host Configuration","slug":"host-configuration","link":"#host-configuration","children":[]},{"level":2,"title":"Issue","slug":"issue","link":"#issue","children":[{"level":3,"title":"Disconnect","slug":"disconnect","link":"#disconnect","children":[]},{"level":3,"title":"On MacOS","slug":"on-macos","link":"#on-macos","children":[]}]}],"git":{},"filePathRelative":"notes/Network/Network SSH.md"}');export{d as comp,c as data};