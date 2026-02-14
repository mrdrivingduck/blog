import{_ as s,c as n,a,o as i}from"./app-BeHGwf2X.js";const l={};function r(t,e){return i(),n("div",null,e[0]||(e[0]=[a(`<h1 id="cryptography-gpg" tabindex="-1"><a class="header-anchor" href="#cryptography-gpg"><span>Cryptography - GPG</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 12 / 09 12:53</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p>GNU Privacy Guard (GnuPG / GPG) 是一个密码学的自由软件，用于加解密、数字签名以及密钥管理。</p><h2 id="generate" tabindex="-1"><a class="header-anchor" href="#generate"><span>Generate</span></a></h2><p>需要的信息包括：</p><ul><li>加密算法</li><li>密钥长度</li><li>有效时间</li><li>名字 + 邮箱</li><li>注释</li></ul><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --full-generate-key</span>
<span class="line"></span>
<span class="line">gpg: key 762A231FF8172D47 marked as ultimately trusted</span>
<span class="line">gpg: revocation certificate stored as &#39;/home/mrdrivingduck/.gnupg/openpgp-revocs.d/8A41********************************2D47.rev&#39;</span>
<span class="line">public and secret key created and signed.</span>
<span class="line"></span>
<span class="line">pub   rsa3072 2020-12-09 [SC] [expires: 2022-12-09]</span>
<span class="line">      8A41********************************2D47</span>
<span class="line">uid                      mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line">sub   rsa3072 2020-12-09 [E] [expires: 2022-12-09]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看 GPG key：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --list-keys</span>
<span class="line">gpg: checking the trustdb</span>
<span class="line">gpg: marginals needed: 3  completes needed: 1  trust model: pgp</span>
<span class="line">gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u</span>
<span class="line">gpg: next trustdb check due at 2022-12-09</span>
<span class="line">/home/mrdrivingduck/.gnupg/pubring.kbx</span>
<span class="line">--------------------------------------</span>
<span class="line">pub   rsa3072 2020-12-09 [SC] [expires: 2022-12-09]</span>
<span class="line">      8A41********************************2D47</span>
<span class="line">uid           [ultimate] mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line">sub   rsa3072 2020-12-09 [E] [expires: 2022-12-09]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>导出并粘贴到 GitHub 上：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --armor --export 8A41********************************2D47</span>
<span class="line">-----BEGIN PGP PUBLIC KEY BLOCK-----</span>
<span class="line"></span>
<span class="line">...</span>
<span class="line">-----END PGP PUBLIC KEY BLOCK-----</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="git-configuration" tabindex="-1"><a class="header-anchor" href="#git-configuration"><span>Git Configuration</span></a></h2><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git config --global user.signingkey 8*******7</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在 commit 中使用 GPG key 来签名只需要加上 <code>-S</code> 参数：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git commit</span>
<span class="line">--gpg-sign             -S       -- GPG-sign the commit</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>当然也可以直接全局开启 GPG 签名：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git config --global commit.gpgsign true</span>
<span class="line">false      -- do not always GPG-sign commits (default)</span>
<span class="line">off    no  -- do not always GPG-sign commits</span>
<span class="line">true       -- always GPG-sign commits (current)</span>
<span class="line">yes    on  -- always GPG-sign commits</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="expire" tabindex="-1"><a class="header-anchor" href="#expire"><span>Expire</span></a></h2><blockquote><p>The expiration time of a key may be updated with the command expire from the key edit menu. If no key is selected the expiration time of the primary key is updated. Otherwise the expiration time of the selected subordinate key is updated.</p><p>A key&#39;s expiration time is associated with the key&#39;s self-signature. The expiration time is updated by deleting the old self-signature and adding a new self-signature. Since correspondents will not have deleted the old self-signature, they will see an additional self-signature on the key when they update their copy of your key. The latest self-signature takes precedence, however, so all correspondents will unambiguously know the expiration times of your keys.</p></blockquote><p>密钥延期：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --edit-key 8A41********************************2D47</span>
<span class="line">gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.</span>
<span class="line">This is free software: you are free to change and redistribute it.</span>
<span class="line">There is NO WARRANTY, to the extent permitted by law.</span>
<span class="line"></span>
<span class="line">Secret key is available.</span>
<span class="line"></span>
<span class="line">sec  rsa3072/762A231FF8172D47</span>
<span class="line">     created: 2020-12-09  expires: 2022-12-09  usage: SC</span>
<span class="line">     trust: ultimate      validity: ultimate</span>
<span class="line">ssb  rsa3072/0E60F78C5F8DBFAE</span>
<span class="line">     created: 2020-12-09  expires: 2022-12-09  usage: E</span>
<span class="line">[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">gpg&gt; expire</span>
<span class="line">Changing expiration time for the primary key.</span>
<span class="line">Please specify how long the key should be valid.</span>
<span class="line">         0 = key does not expire</span>
<span class="line">      &lt;n&gt;  = key expires in n days</span>
<span class="line">      &lt;n&gt;w = key expires in n weeks</span>
<span class="line">      &lt;n&gt;m = key expires in n months</span>
<span class="line">      &lt;n&gt;y = key expires in n years</span>
<span class="line">Key is valid for? (0) 5y</span>
<span class="line">Key expires at Mon Dec  8 11:19:19 2025 CST</span>
<span class="line">Is this correct? (y/N) y</span>
<span class="line"></span>
<span class="line">sec  rsa3072/762A231FF8172D47</span>
<span class="line">     created: 2020-12-09  expires: 2025-12-08  usage: SC</span>
<span class="line">     trust: ultimate      validity: ultimate</span>
<span class="line">ssb  rsa3072/0E60F78C5F8DBFAE</span>
<span class="line">     created: 2020-12-09  expires: 2022-12-09  usage: E</span>
<span class="line">[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">gpg&gt; key 1</span>
<span class="line"></span>
<span class="line">sec  rsa3072/762A231FF8172D47</span>
<span class="line">     created: 2020-12-09  expires: 2025-12-08  usage: SC</span>
<span class="line">     trust: ultimate      validity: ultimate</span>
<span class="line">ssb* rsa3072/0E60F78C5F8DBFAE</span>
<span class="line">     created: 2020-12-09  expires: 2022-12-09  usage: E</span>
<span class="line">[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span>
<span class="line">gpg&gt; expire</span>
<span class="line">Changing expiration time for a subkey.</span>
<span class="line">Please specify how long the key should be valid.</span>
<span class="line">         0 = key does not expire</span>
<span class="line">      &lt;n&gt;  = key expires in n days</span>
<span class="line">      &lt;n&gt;w = key expires in n weeks</span>
<span class="line">      &lt;n&gt;m = key expires in n months</span>
<span class="line">      &lt;n&gt;y = key expires in n years</span>
<span class="line">Key is valid for? (0) 5y</span>
<span class="line">Key expires at Mon Dec  8 11:19:37 2025 CST</span>
<span class="line">Is this correct? (y/N) y</span>
<span class="line"></span>
<span class="line">sec  rsa3072/762A231FF8172D47</span>
<span class="line">     created: 2020-12-09  expires: 2025-12-08  usage: SC</span>
<span class="line">     trust: ultimate      validity: ultimate</span>
<span class="line">ssb* rsa3072/0E60F78C5F8DBFAE</span>
<span class="line">     created: 2020-12-09  expires: 2025-12-08  usage: E</span>
<span class="line">[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最终还要保存修改：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">gpg&gt; save</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="remove" tabindex="-1"><a class="header-anchor" href="#remove"><span>Remove</span></a></h2><p>首先删除私钥：(<strong>慎重</strong>)</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --delete-secret-keys 8A41DCE7DCD03B5F7FA850ED762A231FF8172D47</span>
<span class="line">gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.</span>
<span class="line">This is free software: you are free to change and redistribute it.</span>
<span class="line">There is NO WARRANTY, to the extent permitted by law.</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">sec  rsa3072/762A231FF8172D47 2020-12-09 mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span>
<span class="line">Delete this key from the keyring? (y/N) y</span>
<span class="line">This is a secret key! - really delete? (y/N) y</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>删除公钥：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --delete-keys 8A41DCE7DCD03B5F7FA850ED762A231FF8172D47</span>
<span class="line">gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.</span>
<span class="line">This is free software: you are free to change and redistribute it.</span>
<span class="line">There is NO WARRANTY, to the extent permitted by law.</span>
<span class="line"></span>
<span class="line">pub  rsa3072/762A231FF8172D47 2020-12-09 mrdrivingduck &lt;562655624@q.com&gt;</span>
<span class="line"></span>
<span class="line">Delete this key from the keyring? (y/N) y</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="transfer" tabindex="-1"><a class="header-anchor" href="#transfer"><span>Transfer</span></a></h2><p>密钥跨系统移动。首先在一台电脑上将密钥导出：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --export-secret-keys YOUR_ID_HERE &gt; private.key</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>将 <code>private.key</code> 拷贝到新系统上后导入：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ gpg --import private.key</span>
<span class="line">gpg: key ****************: &quot;mrdrivingduck &lt;562655624@qq.com&gt;&quot; 2 new signatures</span>
<span class="line">gpg: key ****************: secret key imported</span>
<span class="line">gpg: Total number processed: 1</span>
<span class="line">gpg:         new signatures: 2</span>
<span class="line">gpg:       secret keys read: 1</span>
<span class="line">gpg:  secret keys unchanged: 1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://makandracards.com/makandra-orga/37763-gpg-extract-private-key-and-import-on-different-machine" target="_blank" rel="noopener noreferrer">GPG: Extract private key and import on different machine</a></p><p><a href="https://blog.triplez.cn/let-git-commit-brings-with-your-gpg-signature/" target="_blank" rel="noopener noreferrer">TripleZ&#39;s Blog - 让 Git Commit 带上你的 GPG 签名</a></p><p><a href="https://www.gnupg.org/gph/en/manual/c235.html#AEN328" target="_blank" rel="noopener noreferrer">The GNU Privacy Handbook - Chapter 3. Key Management</a></p><p><a href="https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/updating-an-expired-gpg-key" target="_blank" rel="noopener noreferrer">GitHub Docs - Updating an expired GPG key</a></p><p><a href="https://filipe.kiss.ink/renew-expired-gpg-key/" target="_blank" rel="noopener noreferrer">How to renew a (soon to be) expired GPG key</a></p><hr>`,47)]))}const p=s(l,[["render",r],["__file","Cryptography GPG.html.vue"]]),c=JSON.parse('{"path":"/notes/Cryptography/Cryptography%20GPG.html","title":"Cryptography - GPG","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Generate","slug":"generate","link":"#generate","children":[]},{"level":2,"title":"Git Configuration","slug":"git-configuration","link":"#git-configuration","children":[]},{"level":2,"title":"Expire","slug":"expire","link":"#expire","children":[]},{"level":2,"title":"Remove","slug":"remove","link":"#remove","children":[]},{"level":2,"title":"Transfer","slug":"transfer","link":"#transfer","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Cryptography/Cryptography GPG.md"}');export{p as comp,c as data};
