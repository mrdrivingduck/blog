import{_ as i,c as t,a as r,o as a}from"./app-aVGbliEg.js";const l="/blog/assets/certificate-signature-BA7pZMPz.png",s="/blog/assets/certificate-chain-Cwitm947.png",c={};function o(n,e){return a(),t("div",null,e[0]||(e[0]=[r(`<h1 id="cryptography-keystore-certificates" tabindex="-1"><a class="header-anchor" href="#cryptography-keystore-certificates"><span>Cryptography - Keystore &amp; Certificates</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 07 16:52</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="keystore" tabindex="-1"><a class="header-anchor" href="#keystore"><span>Keystore</span></a></h2><p>突然想研究研究 HTTPS 的实际使用，所以看了一下数字证书的相关知识。最终问题转化为使用 JDK 自带的 <code>keytool</code> 工具管理密钥。</p><p><strong>Keystore</strong> 是一个用于存放公钥和证书的存储设施，里面能够存放不同类型的条目。应用最多的两类条目：</p><ul><li>Key entries - 以被保护的格式存放，可以包含： <ul><li>密钥</li><li>私钥及对应的公钥证书链</li></ul></li><li>Trusted certificate entries <ul><li>包含另一方的公钥证书 public key certificate (PKC)</li><li>Keystore 的拥有者相信这些证书的公钥确实来自证书所有者</li></ul></li></ul><p>Keystore 中的所有条目都需要被一个唯一的 aliase 来进行访问。</p><ul><li>生成密钥或公私钥对并加入 keystore</li><li>向信任的证书列表中加入证书和证书链</li><li>随后的操作必须使用相同的 aliase 进行操作</li></ul><p>对于一个 aliase，需要制定一个密码用于所有的操作。<code>java.security</code> 包中提供了 <code>KeyStore</code> 类的实现，用于操作 keystore。Oracle 在 JDK 中内置了一种默认实现：</p><ul><li>将 keystore 实现为一个文件，格式为 <code>JKS</code></li><li>用独立的密码分别保护每个私钥</li><li>使用一个密码保护整个 keystore 的完整性</li></ul><p><code>keytool</code> 工具将 keystore 的路径在命令行中以文件名的形式传入，并转换为 <code>FileInputStream</code>，载入 keystore 信息。</p><hr><h2 id="public-key-certificate" tabindex="-1"><a class="header-anchor" href="#public-key-certificate"><span>Public-Key Certificate</span></a></h2><p>其中指定了 subject 的公钥以及其它信息，并由 issuer 进行数字签名。</p><h3 id="public-keys" tabindex="-1"><a class="header-anchor" href="#public-keys"><span>Public Keys</span></a></h3><p>公钥被用于认证签名。</p><h3 id="signature" tabindex="-1"><a class="header-anchor" href="#signature"><span>Signature</span></a></h3><p>由实体的私钥加密，从而使签名不可伪造。</p><h3 id="entity" tabindex="-1"><a class="header-anchor" href="#entity"><span>Entity</span></a></h3><p>证书被用于解决公钥发放的问题。Certification Authority (CA) 扮演一个被通信双方都信任的第三方角色，可以为其它 entity 的证书进行签名。由于 CA 签订了法律条约，因此只产生合法的、可信赖的证书。</p><hr><h2 id="x-509-certificates" tabindex="-1"><a class="header-anchor" href="#x-509-certificates"><span>X.509 Certificates</span></a></h2><p>X.509 标准定义了证书中需要包含哪些信息，以及其中的数据格式。证书中的所有数据被编码为两种相关的标准 - ASN.1/DER:</p><ul><li>Abstract Syntax Notation 1 - 描述数据</li><li>Definite Encoding Rules - 形容数据存储和传输的方式</li></ul><p>X.509 证书除去签名以外，包含下列数据：</p><ul><li><p>Version - v1, v2, v3</p></li><li><p>Serial number - 用于与其它证书进行区分</p></li><li><p>Signature algorithm identifier - CA 对证书签名所用的算法</p></li><li><p>Issuer name - 对证书进行签名的 entity 的 X.500 Distinguished Name</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">CN=Java Duke, OU=Java Software Division, O=Oracle Corporation, C=US</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div></li><li><p>Validity period - 公开有效的时间</p><ul><li>有效期长度由私钥的强度、证书的价格等确定</li></ul></li><li><p>Subject name - 证书公钥所有者的 X.500 Distinguished Names</p></li><li><p>Subject public key information - 密钥、密钥算法、密钥参数</p></li></ul><p><img src="`+l+'" alt="certificate-signature"></p><hr><h2 id="certificate-chains" tabindex="-1"><a class="header-anchor" href="#certificate-chains"><span>Certificate Chains</span></a></h2><p>当新的密钥对刚被生成时，证书链一开始只有一个 <strong>自签名证书</strong>：</p><ul><li>即 subject == issuer，证书中的签名是由生成密钥中的私钥加密的</li><li>证书的签名可以由证书中的公钥认证</li></ul><p>接下来，产生一个 Certificate Signing Request (CSR) 并发送给 CA。在 CA 回应并导入后，自签名证书被替代为证书链：</p><ul><li>证书链的最顶端是 CA 签名认证 (CA 私钥加密) 后的证书，包含了 subject 的公钥</li><li>下一个证书用于认证 CA 的公钥 (用于解开前一个证书的 CA 签名)</li><li>直到证书链的最后，是一个 CA 的自签名证书，认证了自身的公钥</li></ul><p>或者是另一种情况：CA 之间的交叉认证。总之，到最后总是会到达一个自签名的 root certificate。证书链中的每个证书都用于认证链中前一个证书的公钥。</p><p><img src="'+s+'" alt="certificate-chain"></p><p>最底层的根 CA 证书是自签名的。根 CA 的公钥是公开的，可以从可信的介质中获得。一些软件中已经包含了默认信任的 CA 列表，这些软件称为 root program - 比如：</p><ul><li>Microsoft Root Program</li><li>Apple Root Program</li><li>Mozilla Root Program</li><li>Oracle Java Root Program</li><li>...</li></ul><p>比如，浏览器使用操作系统对应的 root program 来使用证书：</p><ul><li>Windows 上的 Chrome 信任 Microsoft Root Program 提供的证书</li><li>macOS 上的 Chrome 信任 Apple Root Program 提供的证书</li><li>Firefox 在所有平台上都使用 Mozilla Root Program 提供的证书</li><li>...</li></ul><p>Root program 通常用它们包含的证书，提供一系列合法的功能。</p><hr><h2 id="reference" tabindex="-1"><a class="header-anchor" href="#reference"><span>Reference</span></a></h2><p><a href="https://docs.oracle.com/javase/8/docs/technotes/tools/windows/keytool.html" target="_blank" rel="noopener noreferrer">Oracle - keytool</a></p><p><a href="https://en.wikipedia.org/wiki/Public_key_infrastructure" target="_blank" rel="noopener noreferrer">Wikipedia - PKI</a></p><p><a href="https://en.wikipedia.org/wiki/Public_key_certificate" target="_blank" rel="noopener noreferrer">Wikipedia - Public key certificate</a></p><p><a href="https://en.wikipedia.org/wiki/Authorization_certificate" target="_blank" rel="noopener noreferrer">Wikipedia - Authroization certificate</a></p><hr>',50)]))}const h=i(c,[["render",o],["__file","Cryptography Keystore _ Certificates.html.vue"]]),u=JSON.parse('{"path":"/notes/Cryptography/Cryptography%20Keystore%20_%20Certificates.html","title":"Cryptography - Keystore & Certificates","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Keystore","slug":"keystore","link":"#keystore","children":[]},{"level":2,"title":"Public-Key Certificate","slug":"public-key-certificate","link":"#public-key-certificate","children":[{"level":3,"title":"Public Keys","slug":"public-keys","link":"#public-keys","children":[]},{"level":3,"title":"Signature","slug":"signature","link":"#signature","children":[]},{"level":3,"title":"Entity","slug":"entity","link":"#entity","children":[]}]},{"level":2,"title":"X.509 Certificates","slug":"x-509-certificates","link":"#x-509-certificates","children":[]},{"level":2,"title":"Certificate Chains","slug":"certificate-chains","link":"#certificate-chains","children":[]},{"level":2,"title":"Reference","slug":"reference","link":"#reference","children":[]}],"git":{},"filePathRelative":"notes/Cryptography/Cryptography Keystore & Certificates.md"}');export{h as comp,u as data};