import{_ as n,c as a,a as s,o as t}from"./app-aVGbliEg.js";const l={};function o(i,e){return t(),a("div",null,e[0]||(e[0]=[s(`<h1 id="cryptography-jwt" tabindex="-1"><a class="header-anchor" href="#cryptography-jwt"><span>Cryptography - JWT</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 03 / 09 22:18</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="introduction" tabindex="-1"><a class="header-anchor" href="#introduction"><span>Introduction</span></a></h2><p>JWT 全名 <em>JSON Web Token</em>，是一个开放标准 (RFC 7519)。其定义了一种 <strong>紧凑</strong> 且 <strong>自包含</strong> 的模式，通过 JSON 对象，保证双方通信的安全。</p><p>主要应用场景在于签发 token。本来，服务器需要通过会话 id 来区分用户；而使用 token 后，服务器将不再需要维护会话状态，而是根据 token 中的用户信息对用户进行区分。同时，在有效期内，token 是用户访问的凭据 - 用于替代账号密码，减少数据库的访问次数。</p><p>Token 分为两类：</p><ul><li>签名 token：用于验证其中自包含信息的 <strong>完整性</strong> (即未经篡改)</li><li>加密 token：用于对其它实体隐藏其中的信息</li></ul><p>使用场景：</p><ul><li>授权 <ul><li>用户登录成功后，发放 token</li><li>之后用户访问所有的受限资源都需要携带这个 token，无需再进行认证</li><li>开销小，可以在跨域场景中方便使用</li></ul></li><li>信息交换 <ul><li>用于使用了公私钥签名，验证信息是否遭到篡改</li></ul></li></ul><p>JWT 支持用一个密钥 + <em>HMAC</em> 算法的签名方式，也支持 <em>RSA</em> 或 <em>ECDSA</em> 的公私钥签名方式。</p><h2 id="token-structure" tabindex="-1"><a class="header-anchor" href="#token-structure"><span>Token Structure</span></a></h2><p>Token 由三部分构成，这三部分用 <code>.</code> 分隔：</p><ul><li>Header</li><li>Payload</li><li>Signature</li></ul><p>即 <code>&lt;header&gt;.&lt;payload&gt;.&lt;signature&gt;</code>。</p><h3 id="header" tabindex="-1"><a class="header-anchor" href="#header"><span>Header</span></a></h3><p>头部包含两部分：</p><ul><li>Token 的类型 - <code>JWT</code></li><li>签名算法 - <code>HMAC SHA 256</code> / <code>RSA</code></li></ul><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;alg&quot;</span><span class="token operator">:</span> <span class="token string">&quot;HS256&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;typ&quot;</span><span class="token operator">:</span> <span class="token string">&quot;JWT&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后，这个 JSON 对象被 Base64Url 编码后，成为 token 的第一部分。</p><blockquote><p>Base64Url 与 Base64 有细微差别 - 个别字符的编码不一样。</p><p>主要是为了保证产生的 token 能够在 URL 中传输。</p></blockquote><h3 id="payload" tabindex="-1"><a class="header-anchor" href="#payload"><span>Payload</span></a></h3><p>负载中包含了用户信息以及其它数据的声明，通常包含三种类型：</p><ul><li>注册声明：不强制但推荐使用，是一些预定义的字段 <ul><li><code>iss</code> (issuer) 发行者</li><li><code>exp</code> (expiration time) 过期时间</li><li><code>sub</code> (subject) 主题</li><li><code>aud</code> (audience) 观众</li></ul></li><li>公共声明：可以随意定义，但要避免冲突</li><li>私人声明：在双方都同意使用的基础上进行使用</li></ul><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;sub&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1234567890&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;John Doe&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;admin&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个 JSON 也会被 Base64Url 编码，然后成为 token 的第二部分。</p><h3 id="signature" tabindex="-1"><a class="header-anchor" href="#signature"><span>Signature</span></a></h3><p>编码后的 header + <code>.</code> + 编码后的 payload 作为签名对象，使用 header 中指定的算法，和一个密钥，对签名对象进行签名。这个签名用于认证 token 的不可篡改性。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">HMACSHA256(</span>
<span class="line">  base64UrlEncode(header) + &quot;.&quot; +</span>
<span class="line">  base64UrlEncode(payload),</span>
<span class="line">  secret)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>签名结果被 Base64Url 编码后，成为 token 的第三部分。</p><p>当使用 <em>HMAC</em> 的加密方式时，用于生成 token 和验证 token 的密钥是同一个。因此，token 产生过程和验证过程无法分开。如果分开，那就意味着相同的密钥分布了很多份，一旦泄露，就有灾难性的后果。这与对称加密的性质类似。</p><p>而当使用 <em>RSA</em> 或 <em>ECDSA</em> 的加密方式时，生成 token 和验证 token 的过程就可以解耦了。生成 token 的过程可以由一个专门的认证服务器负责。认证服务器持有私钥，负责对 token 的前两部分进行签名；而普通的应用服务器只负责认证，任意多的应用服务器全部持有公钥也不会有什么问题 - 用公钥解密签名后，如果内容未经篡改，就说明一定是认证服务器签发的未经篡改的 token。</p><p>这样一来，只有两种可能才会遭受攻击：</p><ol><li>账号密码泄露 - 通过账号密码可以直接获取合法 token</li><li>私钥泄露 - 这样攻击者可以任意伪造 token</li></ol><h2 id="how-do-jwt-work" tabindex="-1"><a class="header-anchor" href="#how-do-jwt-work"><span>How do JWT work?</span></a></h2><p>当用户使用账号密码成功登录后，产生一个 JWT 并返回。之后用户如果想要访问受保护的路由或资源，就需要在请求中加入 JWT。通常来说，token 以 <code>Bearer</code> 模式被放置在 <code>Authorization</code> 头部：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Authorization: Bearer &lt;token&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>成为一种无状态的认证机制。如果 token 中已经包含了必要的认证信息，那么查询数据库的操作就可以被省略了。</p><h2 id="compare" tabindex="-1"><a class="header-anchor" href="#compare"><span>Compare</span></a></h2><p>类似的东西还有 <em>Simple Web Tokens (SWT)</em> 和 <em>Security Assertion Martup Language Tokens (SAML)</em>。</p><p>由于 JSON 比 XML 的冗余性小，因此 JWT 比 SAML 编码后更小，更适合 HTTP 环境下的传输。而 SWT 只能使用对称加密进行签名。</p><hr>`,44)]))}const p=n(l,[["render",o],["__file","Cryptography JWT.html.vue"]]),d=JSON.parse('{"path":"/notes/Cryptography/Cryptography%20JWT.html","title":"Cryptography - JWT","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Introduction","slug":"introduction","link":"#introduction","children":[]},{"level":2,"title":"Token Structure","slug":"token-structure","link":"#token-structure","children":[{"level":3,"title":"Header","slug":"header","link":"#header","children":[]},{"level":3,"title":"Payload","slug":"payload","link":"#payload","children":[]},{"level":3,"title":"Signature","slug":"signature","link":"#signature","children":[]}]},{"level":2,"title":"How do JWT work?","slug":"how-do-jwt-work","link":"#how-do-jwt-work","children":[]},{"level":2,"title":"Compare","slug":"compare","link":"#compare","children":[]}],"git":{},"filePathRelative":"notes/Cryptography/Cryptography JWT.md"}');export{p as comp,d as data};