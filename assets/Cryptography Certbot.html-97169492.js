import{_ as i,r as t,o as c,c as l,a as n,b as e,d as a,e as d}from"./app-25fa875f.js";const o="/blog/assets/certbot-requirement-c9ca71a1.png",r="/blog/assets/certbot-environment-ae74671d.png",p={},u=n("h1",{id:"cryptography-certbot",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#cryptography-certbot","aria-hidden":"true"},"#"),e(" Cryptography - Certbot")],-1),v=n("p",null,"Created by : Mr Dk.",-1),b=n("p",null,"2020 / 04 / 04 0:43",-1),m=n("p",null,"Ningbo, Zhejiang, China",-1),k=n("hr",null,null,-1),f={href:"https://letsencrypt.org/",target:"_blank",rel:"noopener noreferrer"},h=n("h2",{id:"certbot",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#certbot","aria-hidden":"true"},"#"),e(),n("em",null,"Certbot")],-1),g={href:"https://certbot.eff.org/",target:"_blank",rel:"noopener noreferrer"},y={href:"https://github.com/certbot/certbot",target:"_blank",rel:"noopener noreferrer"},_=d('<p>想要运行 certbot，要满足几个条件：</p><ul><li>一台服务器，并能够 SSH 连接到它上面进行操作</li><li>一个已经在开放的 <strong>80</strong> 端口上运行的 HTTP 网站</li></ul><p><img src="'+o+'" alt="certbot-requirement"></p><p>然后，根据你使用的 <strong>OS</strong> 和 <strong>Web Server</strong> ，<em>certbot</em> 分别提供了相应的步骤和自动化工具。根据步骤，可以一步一步地产生证书，并自动将证书添加到 Web server 的配置文件中。比如想为一台 <em>Ubuntu 16.04</em> 服务器签发证书，这个证书由 <em>nginx</em> 使用，就按如下方式选择：</p><p><img src="'+r+`" alt="certbot-environment"></p><p>然后该网站会告诉你接下来的步骤：</p><ol><li>将 <em>certbot</em> 加入到 PPA 中</li><li>用 <code>apt</code> 从 PPA 中安装 <em>certbot</em></li><li>以 <code>--nginx</code> 选项运行 <em>certbot</em>，签发证书并自动配置到 <em>nginx</em> 上</li><li>证书有效期为 90 天，<em>certbot</em> 会产生一个 <em>cron</em> 任务 (定时任务) 自动刷新证书</li></ol><h2 id="nginx-configuration" tabindex="-1"><a class="header-anchor" href="#nginx-configuration" aria-hidden="true">#</a> <em>Nginx</em> Configuration</h2><p>证书生成完毕后，<em>cerbot</em> 自动修改了我的 nginx 配置文件 (作为前提条件的 HTTP 网站已经运行在 nginx 上)。其中 <code>&lt;hostname&gt;</code> 为自己申请的域名，并需要将该域名通过 DNS 解析到这台服务器上。</p><div class="language-nginx line-numbers-mode" data-ext="nginx"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
    <span class="token directive"><span class="token keyword">server_name</span> www.&lt;hostname&gt;.cn &lt;hostname&gt;.cn</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">listen</span> <span class="token number">80</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">rewrite</span> ^(.*)$ https://$</span><span class="token punctuation">{</span>server_name<span class="token punctuation">}</span>$1 <span class="token directive"><span class="token keyword">permanent</span></span><span class="token punctuation">;</span> <span class="token comment"># 将 80 端口的访问转移到 443</span>
<span class="token punctuation">}</span>

<span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
    <span class="token directive"><span class="token keyword">server_name</span> www.&lt;hostname&gt;.cn &lt;hostname&gt;.cn</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">location</span> /</span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">root</span> /root/homepage</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">index</span> index.html</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token directive"><span class="token keyword">listen</span> <span class="token number">443</span> ssl</span><span class="token punctuation">;</span> <span class="token comment"># managed by Certbot</span>
    <span class="token directive"><span class="token keyword">ssl_certificate</span> /etc/letsencrypt/live/&lt;hostname&gt;.cn/fullchain.pem</span><span class="token punctuation">;</span> <span class="token comment"># managed by Certbot</span>
    <span class="token directive"><span class="token keyword">ssl_certificate_key</span> /etc/letsencrypt/live/&lt;hostname&gt;.cn/privkey.pem</span><span class="token punctuation">;</span> <span class="token comment"># managed by Certbot</span>
    <span class="token directive"><span class="token keyword">include</span> /etc/letsencrypt/options-ssl-nginx.conf</span><span class="token punctuation">;</span> <span class="token comment"># managed by Certbot</span>
    <span class="token directive"><span class="token keyword">ssl_dhparam</span> /etc/letsencrypt/ssl-dhparams.pem</span><span class="token punctuation">;</span> <span class="token comment"># managed by Certbot</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="certificates" tabindex="-1"><a class="header-anchor" href="#certificates" aria-hidden="true">#</a> Certificates</h2><p>证书被生成在一个特定位置 (<code>/etc/letsencrypt/live/&lt;hostname&gt;/</code>)，包含以下四个文件：</p><ul><li><code>cert.pem</code></li><li><code>chain.pem</code></li><li><code>fullchain.pem</code></li><li><code>privkey.pem</code></li></ul><p>其中，<code>privkey.pem</code> 保存了私钥；<code>cert.pem</code> 是签发的最终证书，保存了公钥。可以使用 <code>openssl</code> 查看证书：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ openssl x509 -in cert.pem -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            03:2d:cc:e8:26:d7:27:1e:cf:e2:d5:f6:a4:4a:92:76:be:1d
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = US, O = Let&#39;s Encrypt, CN = Let&#39;s Encrypt Authority X3
        Validity
            Not Before: May 23 09:03:07 2020 GMT
            Not After : Aug 21 09:03:07 2020 GMT
        Subject: CN = mrdrivingduck.cn
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:b3:4f:39:51:cf:55:7e:b9:de:9c:b9:ad:20:87:
                    4b:69:8c:b8:74:d3:c9:16:4a:63:6e:62:f8:7d:24:
                    5c:b8:ea:cd:44:a8:a4:32:2f:e5:84:25:b8:9d:f6:
                    78:3c:72:69:e1:8e:d2:ad:02:d9:c8:28:24:0e:67:
                    5b:20:4f:4f:b6:9c:ca:b1:c0:90:b3:28:1a:69:a7:
                    a6:9a:a5:c0:ab:4f:a4:c0:6b:f3:d5:50:93:02:75:
                    74:ed:ba:1e:f1:05:3a:4c:53:2c:88:d2:01:c4:12:
                    eb:b6:ce:e2:6f:21:de:2b:e8:04:d9:17:45:09:1b:
                    b8:0e:ac:43:b2:55:af:8e:32:3f:ca:bb:15:54:c2:
                    71:49:44:6e:5c:75:d9:65:e1:ad:e4:1c:44:df:53:
                    a4:e5:77:af:ba:e1:5b:5f:e1:29:df:96:d0:8e:b0:
                    6f:06:48:b9:e1:16:47:e8:d6:6b:4e:aa:5a:9f:75:
                    26:df:d9:1f:b5:fe:74:29:9d:17:b7:9b:99:43:5a:
                    29:b7:1d:5a:0a:3e:c9:9f:76:c5:b6:78:9b:55:d8:
                    87:07:47:b7:54:59:db:d6:b7:45:3f:0e:4e:c0:8f:
                    ae:c0:93:68:8d:2a:5e:86:d1:04:a9:30:5c:2a:38:
                    9e:34:30:d8:e4:2a:98:3c:82:b6:1a:91:db:23:72:
                    ef:17
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Key Identifier:
                E4:0E:96:45:DA:A7:B7:C3:05:4A:5C:85:83:73:43:C7:4A:22:93:89
            X509v3 Authority Key Identifier:
                keyid:A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1

            Authority Information Access:
                OCSP - URI:http://ocsp.int-x3.letsencrypt.org
                CA Issuers - URI:http://cert.int-x3.letsencrypt.org/

            X509v3 Subject Alternative Name:
                DNS:mrdrivingduck.cn, DNS:www.mrdrivingduck.cn
            X509v3 Certificate Policies:
                Policy: 2.23.140.1.2.1
                Policy: 1.3.6.1.4.1.44947.1.1.1
                  CPS: http://cps.letsencrypt.org

            CT Precertificate SCTs:
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : 5E:A7:73:F9:DF:56:C0:E7:B5:36:48:7D:D0:49:E0:32:
                                7A:91:9A:0C:84:A1:12:12:84:18:75:96:81:71:45:58
                    Timestamp : May 23 10:03:07.985 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:46:02:21:00:DE:1F:30:39:B6:43:FA:2D:C7:12:C3:
                                94:DE:12:90:FC:6C:B3:46:01:4C:B7:3E:5F:11:B1:4C:
                                90:07:1D:60:33:02:21:00:C6:12:AF:BE:14:81:25:D6:
                                39:C1:58:E4:0C:5F:4C:9C:43:F5:4E:CC:18:F5:ED:54:
                                3A:79:AF:17:61:E4:E1:D5
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : 07:B7:5C:1B:E5:7D:68:FF:F1:B0:C6:1D:23:15:C7:BA:
                                E6:57:7C:57:94:B7:6A:EE:BC:61:3A:1A:69:D3:A2:1C
                    Timestamp : May 23 10:03:08.020 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:45:02:21:00:84:D1:B1:25:E8:B0:D7:5D:FE:F0:34:
                                B7:DB:32:A4:4E:0D:84:DD:55:C1:60:24:3F:BA:6D:63:
                                EE:E6:1B:44:46:02:20:2D:D8:DF:90:FE:AE:A4:6F:AC:
                                2F:50:28:03:4D:FD:4A:36:FE:7E:4A:72:A0:6C:3B:A6:
                                33:31:91:0E:81:E4:C9
    Signature Algorithm: sha256WithRSAEncryption
         07:0c:63:d0:8a:b7:f5:35:f8:65:00:20:f2:c4:ca:27:52:72:
         55:92:9a:ee:5e:da:1c:1b:b5:f1:fc:8d:db:61:02:7c:46:58:
         0e:21:67:44:91:08:fe:2b:f6:27:72:24:8b:1d:80:5a:f8:d7:
         aa:2f:25:82:9b:ee:9f:59:5a:32:e3:a2:6e:8e:03:7e:0c:6b:
         e9:af:90:77:93:e8:00:56:74:f5:a1:1b:74:dd:3f:ce:34:b2:
         b4:f2:fc:9b:1b:1c:5f:21:d9:7f:1b:85:67:09:26:ee:1d:e1:
         ae:3c:5c:50:a5:ee:61:d7:8e:30:a7:49:0c:e4:7a:4c:00:60:
         2f:dd:30:d9:9c:b8:79:fb:23:b2:22:a3:f2:e9:11:65:2e:c9:
         fe:ad:22:d3:b9:73:81:4c:98:cc:5c:fb:41:51:13:3d:79:36:
         b4:8c:7e:e5:24:60:0f:4e:a1:fa:9a:8d:19:e4:c0:94:08:ea:
         46:b8:fa:ce:dd:e9:db:72:83:4c:61:e1:0d:ac:52:0c:e5:33:
         7a:ce:5b:dc:42:90:93:3e:f7:49:98:1d:ce:3b:e3:1e:e2:ab:
         e5:f7:1e:d2:a2:00:97:06:b7:75:ac:db:45:44:58:00:12:4c:
         e8:28:61:7a:60:82:c2:49:0b:bf:fd:61:8f:b5:8e:3b:3f:d1:
         22:ff:60:63
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>chain.pem</code> 应当是签发证书 <code>cert.pem</code> 到 CA 根证书中间的证书链条；<code>fullchain.pem</code> 是包含了 <strong>最终签发证书</strong> 和 <strong>中间证书链</strong> 在内的 <strong>完整证书链条</strong>。</p><h2 id="记坑" tabindex="-1"><a class="header-anchor" href="#记坑" aria-hidden="true">#</a> <strong>记坑</strong></h2><p>这次使用 Vert.x HTTPS Server 作为后端。Server 初始化代码是这样写的：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">Vertx</span> vertx<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    server <span class="token operator">=</span> vertx<span class="token punctuation">.</span><span class="token function">createHttpServer</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">HttpServerOptions</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">setSsl</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">setPemKeyCertOptions</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">PemKeyCertOptions</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">setKeyPath</span><span class="token punctuation">(</span><span class="token class-name">Config</span><span class="token punctuation">.</span><span class="token function">getConfig</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&quot;tls&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;keyPath&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">setCertPath</span><span class="token punctuation">(</span><span class="token class-name">Config</span><span class="token punctuation">.</span><span class="token function">getConfig</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&quot;tls&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;certPath&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">)</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>关于 <code>keyPath</code>，很显然是使用私钥 <code>privkey.pem</code>；而证书路径，我一开始使用的是 <code>cert.pem</code>，即只有签发证书不包含证书链的那个 keystore。</p><p>然后微信小程序前端就出了问题：测试时都是 OK 的，真机调试时，iOS OK，Android 的请求无法发出去。虽然用了一些在线测试网站都正常，但还是没解决问题。Baidu 上搜索没有一个有效答案 (顺便真心吐槽一下国内的技术氛围)，反正大致意思都是说证书有问题。</p>`,21),C=n("em",null,"nginx",-1),A=n("em",null,"nginx",-1),x=n("code",null,"privkey.pem",-1),E=n("code",null,"fullchain.pem",-1),S={href:"https://stackoverflow.com/questions/54305577/lets-encrypt-with-vert-x",target:"_blank",rel:"noopener noreferrer"},w=n("code",null,"cert.pem",-1),D=n("code",null,"fullchain.pem",-1),B=n("em",null,"MI 6",-1),F=n("h2",{id:"references",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#references","aria-hidden":"true"},"#"),e(" References")],-1),P={href:"https://www.jianshu.com/p/1a792f87b6fe",target:"_blank",rel:"noopener noreferrer"},T={href:"https://certbot.eff.org/",target:"_blank",rel:"noopener noreferrer"};function N(I,K){const s=t("ExternalLinkIcon");return c(),l("div",null,[u,v,b,m,k,n("p",null,[e("最近在开发一个微信小程序的后端，服务器需要支持 HTTPS 并备案。既要支持 HTTPS，那么就一定要有一个被签发的证书。找正规的 CA 机构签发证书是要时间要钱的。而 "),n("a",f,[e("Let's Encrypt"),a(s)]),e(" 是一个非盈利性组织提供的免费、开放的证书颁发机构 (CA)，可以用它来免费签发证书。")]),h,n("p",null,[e("目前，官方推荐的签发工具是 "),n("a",g,[e("certbot"),a(s)]),e("，在其 "),n("a",y,[e("GitHub"),a(s)]),e(" 仓库上也有代码。关于这个工具的原理我没有研究，只能根据运行过程大致猜测。")]),_,n("p",null,[e("后来从上面的 "),C,e(" 配置文件中受到启发。在 "),A,e(" 的配置中，私钥用的是 "),x,e("，证书用的是 "),E,e("。看来，如果缺少了中间的证书链，HTTPS 的认证不能成功。另外还在 "),n("a",S,[e("StackOverflow"),a(s)]),e(" 上找到了一个相关的具体问题。于是按照答案，将证书的路径由 "),w,e(" 换为 "),D,e("。一开始 Android 前端好像说还是不行，我还正郁闷着呢 😓，突然就看到屏幕上打出来日志，访问来源是 "),B,e("，成功啦！😆")]),F,n("p",null,[n("a",P,[e("简书 - Let's Encrypt 证书申请及配置"),a(s)])]),n("p",null,[n("a",T,[e("Certbot"),a(s)])])])}const q=i(p,[["render",N],["__file","Cryptography Certbot.html.vue"]]);export{q as default};
