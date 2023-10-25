import{_ as a,r as d,o as r,c as l,a as e,b as n,d as s,e as t}from"./app-25fa875f.js";const c={},o=t(`<h1 id="cryptography-gpg" tabindex="-1"><a class="header-anchor" href="#cryptography-gpg" aria-hidden="true">#</a> Cryptography - GPG</h1><p>Created by : Mr Dk.</p><p>2020 / 12 / 09 12:53</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about" aria-hidden="true">#</a> About</h2><p>GNU Privacy Guard (GnuPG / GPG) 是一个密码学的自由软件，用于加解密、数字签名以及密钥管理。</p><h2 id="generate" tabindex="-1"><a class="header-anchor" href="#generate" aria-hidden="true">#</a> Generate</h2><p>需要的信息包括：</p><ul><li>加密算法</li><li>密钥长度</li><li>有效时间</li><li>名字 + 邮箱</li><li>注释</li></ul><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --full-generate-key

gpg: key 762A231FF8172D47 marked as ultimately trusted
gpg: revocation certificate stored as &#39;/home/mrdrivingduck/.gnupg/openpgp-revocs.d/8A41********************************2D47.rev&#39;
public and secret key created and signed.

pub   rsa3072 2020-12-09 [SC] [expires: 2022-12-09]
      8A41********************************2D47
uid                      mrdrivingduck &lt;562655624@q.com&gt;
sub   rsa3072 2020-12-09 [E] [expires: 2022-12-09]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看 GPG key：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --list-keys
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u
gpg: next trustdb check due at 2022-12-09
/home/mrdrivingduck/.gnupg/pubring.kbx
--------------------------------------
pub   rsa3072 2020-12-09 [SC] [expires: 2022-12-09]
      8A41********************************2D47
uid           [ultimate] mrdrivingduck &lt;562655624@q.com&gt;
sub   rsa3072 2020-12-09 [E] [expires: 2022-12-09]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>导出并粘贴到 GitHub 上：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --armor --export 8A41********************************2D47
-----BEGIN PGP PUBLIC KEY BLOCK-----

...
-----END PGP PUBLIC KEY BLOCK-----
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="git-configuration" tabindex="-1"><a class="header-anchor" href="#git-configuration" aria-hidden="true">#</a> Git Configuration</h2><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ git config --global user.signingkey 8*******7
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在 commit 中使用 GPG key 来签名只需要加上 <code>-S</code> 参数：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ git commit
--gpg-sign             -S       -- GPG-sign the commit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>当然也可以直接全局开启 GPG 签名：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ git config --global commit.gpgsign true
false      -- do not always GPG-sign commits (default)
off    no  -- do not always GPG-sign commits
true       -- always GPG-sign commits (current)
yes    on  -- always GPG-sign commits
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="expire" tabindex="-1"><a class="header-anchor" href="#expire" aria-hidden="true">#</a> Expire</h2><blockquote><p>The expiration time of a key may be updated with the command expire from the key edit menu. If no key is selected the expiration time of the primary key is updated. Otherwise the expiration time of the selected subordinate key is updated.</p><p>A key&#39;s expiration time is associated with the key&#39;s self-signature. The expiration time is updated by deleting the old self-signature and adding a new self-signature. Since correspondents will not have deleted the old self-signature, they will see an additional self-signature on the key when they update their copy of your key. The latest self-signature takes precedence, however, so all correspondents will unambiguously know the expiration times of your keys.</p></blockquote><p>密钥延期：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --edit-key 8A41********************************2D47
gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa3072/762A231FF8172D47
     created: 2020-12-09  expires: 2022-12-09  usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa3072/0E60F78C5F8DBFAE
     created: 2020-12-09  expires: 2022-12-09  usage: E
[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>gpg&gt; expire
Changing expiration time for the primary key.
Please specify how long the key should be valid.
         0 = key does not expire
      &lt;n&gt;  = key expires in n days
      &lt;n&gt;w = key expires in n weeks
      &lt;n&gt;m = key expires in n months
      &lt;n&gt;y = key expires in n years
Key is valid for? (0) 5y
Key expires at Mon Dec  8 11:19:19 2025 CST
Is this correct? (y/N) y

sec  rsa3072/762A231FF8172D47
     created: 2020-12-09  expires: 2025-12-08  usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa3072/0E60F78C5F8DBFAE
     created: 2020-12-09  expires: 2022-12-09  usage: E
[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>gpg&gt; key 1

sec  rsa3072/762A231FF8172D47
     created: 2020-12-09  expires: 2025-12-08  usage: SC
     trust: ultimate      validity: ultimate
ssb* rsa3072/0E60F78C5F8DBFAE
     created: 2020-12-09  expires: 2022-12-09  usage: E
[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;

gpg&gt; expire
Changing expiration time for a subkey.
Please specify how long the key should be valid.
         0 = key does not expire
      &lt;n&gt;  = key expires in n days
      &lt;n&gt;w = key expires in n weeks
      &lt;n&gt;m = key expires in n months
      &lt;n&gt;y = key expires in n years
Key is valid for? (0) 5y
Key expires at Mon Dec  8 11:19:37 2025 CST
Is this correct? (y/N) y

sec  rsa3072/762A231FF8172D47
     created: 2020-12-09  expires: 2025-12-08  usage: SC
     trust: ultimate      validity: ultimate
ssb* rsa3072/0E60F78C5F8DBFAE
     created: 2020-12-09  expires: 2025-12-08  usage: E
[ultimate] (1). mrdrivingduck &lt;562655624@q.com&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最终还要保存修改：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>gpg&gt; save
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="remove" tabindex="-1"><a class="header-anchor" href="#remove" aria-hidden="true">#</a> Remove</h2><p>首先删除私钥：(<strong>慎重</strong>)</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --delete-secret-keys 8A41DCE7DCD03B5F7FA850ED762A231FF8172D47
gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


sec  rsa3072/762A231FF8172D47 2020-12-09 mrdrivingduck &lt;562655624@q.com&gt;

Delete this key from the keyring? (y/N) y
This is a secret key! - really delete? (y/N) y
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>删除公钥：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --delete-keys 8A41DCE7DCD03B5F7FA850ED762A231FF8172D47
gpg (GnuPG) 2.2.4; Copyright (C) 2017 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

pub  rsa3072/762A231FF8172D47 2020-12-09 mrdrivingduck &lt;562655624@q.com&gt;

Delete this key from the keyring? (y/N) y
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="transfer" tabindex="-1"><a class="header-anchor" href="#transfer" aria-hidden="true">#</a> Transfer</h2><p>密钥跨系统移动。首先在一台电脑上将密钥导出：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --export-secret-keys YOUR_ID_HERE &gt; private.key
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>将 <code>private.key</code> 拷贝到新系统上后导入：</p><div class="language-console line-numbers-mode" data-ext="console"><pre class="language-console"><code>$ gpg --import private.key
gpg: key ****************: &quot;mrdrivingduck &lt;562655624@qq.com&gt;&quot; 2 new signatures
gpg: key ****************: secret key imported
gpg: Total number processed: 1
gpg:         new signatures: 2
gpg:       secret keys read: 1
gpg:  secret keys unchanged: 1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,41),v={href:"https://makandracards.com/makandra-orga/37763-gpg-extract-private-key-and-import-on-different-machine",target:"_blank",rel:"noopener noreferrer"},u={href:"https://blog.triplez.cn/let-git-commit-brings-with-your-gpg-signature/",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.gnupg.org/gph/en/manual/c235.html#AEN328",target:"_blank",rel:"noopener noreferrer"},g={href:"https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/updating-an-expired-gpg-key",target:"_blank",rel:"noopener noreferrer"},p={href:"https://filipe.kiss.ink/renew-expired-gpg-key/",target:"_blank",rel:"noopener noreferrer"},b=e("hr",null,null,-1);function h(y,k){const i=d("ExternalLinkIcon");return r(),l("div",null,[o,e("p",null,[e("a",v,[n("GPG: Extract private key and import on different machine"),s(i)])]),e("p",null,[e("a",u,[n("TripleZ's Blog - 让 Git Commit 带上你的 GPG 签名"),s(i)])]),e("p",null,[e("a",m,[n("The GNU Privacy Handbook - Chapter 3. Key Management"),s(i)])]),e("p",null,[e("a",g,[n("GitHub Docs - Updating an expired GPG key"),s(i)])]),e("p",null,[e("a",p,[n("How to renew a (soon to be) expired GPG key"),s(i)])]),b])}const f=a(c,[["render",h],["__file","Cryptography GPG.html.vue"]]);export{f as default};
