import{_ as l,c as t,a as i,b as s,f as n,d as r,e as o,r as d,o as p}from"./app-aVGbliEg.js";const c={};function u(b,e){const a=d("RouteLink");return p(),t("div",null,[e[7]||(e[7]=i(`<h1 id="network-github-accelerating" tabindex="-1"><a class="header-anchor" href="#network-github-accelerating"><span>Network - GitHub Accelerating</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 05 / 29 10:07</p><p>Nanjing, Jiangsu, China</p><hr><p>记录加速 GitHub 访问的几种方式。</p><p>GitHub 真的是让人又爱又恨。爱它在于它真的是一个宝藏网站，也是 IT 人士的身份名片；恨它在于受限于网络环境，和它打交道真是太痛苦了。我们总在不停探索与 GFW 和国内 ISP 斗智斗勇的方法。</p><h2 id="web-page" tabindex="-1"><a class="header-anchor" href="#web-page"><span>Web Page</span></a></h2><p>GitHub 不在 PAC 列表中。如果代理速度够快的话，可以手动将 GitHub 添加到 PAC 列表中。</p><h2 id="dns-configuration" tabindex="-1"><a class="header-anchor" href="#dns-configuration"><span>DNS Configuration</span></a></h2><p>GitHub 速度慢的另一个原因是受到了国内 DNS 污染。可以到专门的域名解析网站，解析以下三个域名，并将这三个域名的 IP 地址配置到操作系统的 DNS 表中。这样就可以绕过 DNS 服务器，通过本地的 DNS 解析直接访问相应的 IP 地址。</p><blockquote><p>目前来看用处不大了。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">github.com</span>
<span class="line">github.global.ssl.fastly.net</span>
<span class="line">assets-cdn.github.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 <a href="https://www.ipaddress.com/" target="_blank" rel="noopener noreferrer">域名解析网站</a> 中，分别查询这三个域名的 IP 地址：</p><ul><li>github.com</li><li>github.global.ssl.fastly.net</li><li>assets-cdn.github.com</li></ul><h3 id="windows" tabindex="-1"><a class="header-anchor" href="#windows"><span>Windows</span></a></h3><p>打开 <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code> （管理员权限）</p><p>在最后加上刚才查询到的 IP 地址</p><p>注意事项：</p><ol><li><code>#</code> 用于注释</li><li>每条记录单独一行</li><li>IP 地址在第一列，域名在第二列</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line"># Copyright (c) 1993-2009 Microsoft Corp.</span>
<span class="line">#</span>
<span class="line"># This is a sample HOSTS file used by Microsoft TCP/IP for Windows.</span>
<span class="line">#</span>
<span class="line"># This file contains the mappings of IP addresses to host names. Each</span>
<span class="line"># entry should be kept on an individual line. The IP address should</span>
<span class="line"># be placed in the first column followed by the corresponding host name.</span>
<span class="line"># The IP address and the host name should be separated by at least one</span>
<span class="line"># space.</span>
<span class="line">#</span>
<span class="line"># Additionally, comments (such as these) may be inserted on individual</span>
<span class="line"># lines or following the machine name denoted by a &#39;#&#39; symbol.</span>
<span class="line">#</span>
<span class="line"># For example:</span>
<span class="line">#</span>
<span class="line">#      102.54.94.97     rhino.acme.com          # source server</span>
<span class="line">#       38.25.63.10     x.acme.com              # x client host</span>
<span class="line"></span>
<span class="line"># localhost name resolution is handled within DNS itself.</span>
<span class="line">#	127.0.0.1       localhost</span>
<span class="line">#	::1             localhost</span>
<span class="line"></span>
<span class="line"># Github</span>
<span class="line">151.101.185.194 github.global.ssl.fastly.net</span>
<span class="line">192.30.253.112 github.com</span>
<span class="line">192.30.253.113 github.com</span>
<span class="line">185.199.108.153 assets-cdn.github.com</span>
<span class="line">185.199.109.153 assets-cdn.github.com</span>
<span class="line">185.199.110.153 assets-cdn.github.com</span>
<span class="line">185.199.111.153 assets-cdn.github.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>添加完成后，保存文件，刷新 DNS 缓存使之生效：</p><div class="language-powershell line-numbers-mode" data-highlighter="prismjs" data-ext="powershell" data-title="powershell"><pre><code><span class="line">ipconfig <span class="token operator">/</span>flushdns</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="git-configuration" tabindex="-1"><a class="header-anchor" href="#git-configuration"><span>Git Configuration</span></a></h2>`,24)),s("p",null,[e[1]||(e[1]=n("Git 也支持代理，不管是 ")),e[2]||(e[2]=s("em",null,"SSH",-1)),e[3]||(e[3]=n(" 方式还是 ")),e[4]||(e[4]=s("em",null,"HTTPS",-1)),e[5]||(e[5]=n(" 方式。具体方式参考 ")),r(a,{to:"/notes/Git/Git%20Proxy.html"},{default:o(()=>e[0]||(e[0]=[n("另一篇文章")])),_:1}),e[6]||(e[6]=n("。"))]),e[8]||(e[8]=i('<h2 id="repository" tabindex="-1"><a class="header-anchor" href="#repository"><span>Repository</span></a></h2><p>想要把整个仓库 clone 下来，却发现速度太慢。国内的 <a href="https://gitee.com/" target="_blank" rel="noopener noreferrer">Gitee</a> 网站提供了一个很好的功能：<strong>仓库导入</strong>。在 Gitee 中新建一个仓库，并给出 GitHub 对应仓库的链接，点击创建。大约需要几分钟时间，Gitee 就会把 GitHub 上的仓库原封不动地导入到 Gitee 上，成为一个类似镜像的 Gitee 仓库。然后从 Gitee 上 <code>git clone</code>，就是国内的网速了。</p><p>另外，Gitee 的页面上有个刷新键，可以随时从 GitHub 的仓库同步。</p><h2 id="file-downloading" tabindex="-1"><a class="header-anchor" href="#file-downloading"><span>File Downloading</span></a></h2><p>在 GitHub 上，某些项目的 release 中会带有一些已经编译好的可执行文件。如果想下载这些文件，GitHub 会重定向到 AWS 上进行下载，速度极慢。</p><p><a href="https://ghproxy.com/" target="_blank" rel="noopener noreferrer">GitHub Proxy</a> 提供 release、archive 等文件下载的加速服务。🤞</p>',6))])}const m=l(c,[["render",u],["__file","Network GitHub Accelerating.html.vue"]]),v=JSON.parse('{"path":"/notes/Network/Network%20GitHub%20Accelerating.html","title":"Network - GitHub Accelerating","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Web Page","slug":"web-page","link":"#web-page","children":[]},{"level":2,"title":"DNS Configuration","slug":"dns-configuration","link":"#dns-configuration","children":[{"level":3,"title":"Windows","slug":"windows","link":"#windows","children":[]}]},{"level":2,"title":"Git Configuration","slug":"git-configuration","link":"#git-configuration","children":[]},{"level":2,"title":"Repository","slug":"repository","link":"#repository","children":[]},{"level":2,"title":"File Downloading","slug":"file-downloading","link":"#file-downloading","children":[]}],"git":{},"filePathRelative":"notes/Network/Network GitHub Accelerating.md"}');export{m as comp,v as data};