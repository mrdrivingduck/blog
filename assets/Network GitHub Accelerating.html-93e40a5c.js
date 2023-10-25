import{_ as d,r as a,o,c as r,a as i,b as e,d as n,w as c,e as t}from"./app-25fa875f.js";const u={},h=t(`<h1 id="network-github-accelerating" tabindex="-1"><a class="header-anchor" href="#network-github-accelerating" aria-hidden="true">#</a> Network - GitHub Accelerating</h1><p>Created by : Mr Dk.</p><p>2019 / 05 / 29 10:07</p><p>Nanjing, Jiangsu, China</p><hr><p>记录加速 GitHub 访问的几种方式。</p><p>GitHub 真的是让人又爱又恨。爱它在于它真的是一个宝藏网站，也是 IT 人士的身份名片；恨它在于受限于网络环境，和它打交道真是太痛苦了。我们总在不停探索与 GFW 和国内 ISP 斗智斗勇的方法。</p><h2 id="web-page" tabindex="-1"><a class="header-anchor" href="#web-page" aria-hidden="true">#</a> Web Page</h2><p>GitHub 不在 PAC 列表中。如果代理速度够快的话，可以手动将 GitHub 添加到 PAC 列表中。</p><h2 id="dns-configuration" tabindex="-1"><a class="header-anchor" href="#dns-configuration" aria-hidden="true">#</a> DNS Configuration</h2><p>GitHub 速度慢的另一个原因是受到了国内 DNS 污染。可以到专门的域名解析网站，解析以下三个域名，并将这三个域名的 IP 地址配置到操作系统的 DNS 表中。这样就可以绕过 DNS 服务器，通过本地的 DNS 解析直接访问相应的 IP 地址。</p><blockquote><p>目前来看用处不大了。</p></blockquote><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>github.com
github.global.ssl.fastly.net
assets-cdn.github.com
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,13),b={href:"https://www.ipaddress.com/",target:"_blank",rel:"noopener noreferrer"},v=t(`<ul><li>github.com</li><li>github.global.ssl.fastly.net</li><li>assets-cdn.github.com</li></ul><h3 id="windows" tabindex="-1"><a class="header-anchor" href="#windows" aria-hidden="true">#</a> Windows</h3><p>打开 <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code> （管理员权限）</p><p>在最后加上刚才查询到的 IP 地址</p><p>注意事项：</p><ol><li><code>#</code> 用于注释</li><li>每条记录单独一行</li><li>IP 地址在第一列，域名在第二列</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a &#39;#&#39; symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost

# Github
151.101.185.194 github.global.ssl.fastly.net
192.30.253.112 github.com
192.30.253.113 github.com
185.199.108.153 assets-cdn.github.com
185.199.109.153 assets-cdn.github.com
185.199.110.153 assets-cdn.github.com
185.199.111.153 assets-cdn.github.com
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加完成后，保存文件，刷新 DNS 缓存使之生效：</p><div class="language-powershell line-numbers-mode" data-ext="powershell"><pre class="language-powershell"><code>ipconfig <span class="token operator">/</span>flushdns
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="git-configuration" tabindex="-1"><a class="header-anchor" href="#git-configuration" aria-hidden="true">#</a> Git Configuration</h2>`,10),m=i("em",null,"SSH",-1),p=i("em",null,"HTTPS",-1),g=i("h2",{id:"repository",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#repository","aria-hidden":"true"},"#"),e(" Repository")],-1),_={href:"https://gitee.com/",target:"_blank",rel:"noopener noreferrer"},f=i("strong",null,"仓库导入",-1),x=i("code",null,"git clone",-1),w=i("p",null,"另外，Gitee 的页面上有个刷新键，可以随时从 GitHub 的仓库同步。",-1),G=i("h2",{id:"file-downloading",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#file-downloading","aria-hidden":"true"},"#"),e(" File Downloading")],-1),y=i("p",null,"在 GitHub 上，某些项目的 release 中会带有一些已经编译好的可执行文件。如果想下载这些文件，GitHub 会重定向到 AWS 上进行下载，速度极慢。",-1),k={href:"https://ghproxy.com/",target:"_blank",rel:"noopener noreferrer"};function H(P,S){const s=a("ExternalLinkIcon"),l=a("RouterLink");return o(),r("div",null,[h,i("p",null,[e("在 "),i("a",b,[e("域名解析网站"),n(s)]),e(" 中，分别查询这三个域名的 IP 地址：")]),v,i("p",null,[e("Git 也支持代理，不管是 "),m,e(" 方式还是 "),p,e(" 方式。具体方式参考 "),n(l,{to:"/notes/Git/Git%20Proxy.html"},{default:c(()=>[e("另一篇文章")]),_:1}),e("。")]),g,i("p",null,[e("想要把整个仓库 clone 下来，却发现速度太慢。国内的 "),i("a",_,[e("Gitee"),n(s)]),e(" 网站提供了一个很好的功能："),f,e("。在 Gitee 中新建一个仓库，并给出 GitHub 对应仓库的链接，点击创建。大约需要几分钟时间，Gitee 就会把 GitHub 上的仓库原封不动地导入到 Gitee 上，成为一个类似镜像的 Gitee 仓库。然后从 Gitee 上 "),x,e("，就是国内的网速了。")]),w,G,y,i("p",null,[i("a",k,[e("GitHub Proxy"),n(s)]),e(" 提供 release、archive 等文件下载的加速服务。🤞")])])}const I=d(u,[["render",H],["__file","Network GitHub Accelerating.html.vue"]]);export{I as default};
