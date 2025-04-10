import{_ as a,c as s,a as i,o as r}from"./app-CT9FvwxE.js";const t="/blog/assets/wifiphisher-logo-C-tN9m6m.png",n="/blog/assets/wifiphisher-start-45TisStv.png",l="/blog/assets/wifiphisher-monitor-C80ZVFQv.png",o="/blog/assets/wifiphisher-select-D0d3oD2T.png",p="/blog/assets/wifiphisher-scn-1-sUYW9Jk8.png",c="/blog/assets/wifiphisher-scn-2-Da8IMlnY.png",h="/blog/assets/wifiphisher-firmware-page-DxY3nnZc.png",g="/blog/assets/wifiphisher-firmware-DSNnAgkJ.png",d="/blog/assets/wifiphisher-networkmanager-page-BDFqnRMJ.png",m="/blog/assets/wifiphisher-networkmanager-CxTsZILP.png",u="/blog/assets/wifiphisher-facebook-page-C0n8ja5a.png",w="/blog/assets/wifiphisher-facebook-BchNhgiY.png",k="/blog/assets/wifiphisher-custom-Dg9yeGRa.png",f="/blog/assets/wifiphisher-custom-mrdk-BBF-qWwS.png",b={};function _(v,e){return r(),s("div",null,e[0]||(e[0]=[i('<h1 id="wireless-wifiphisher" tabindex="-1"><a class="header-anchor" href="#wireless-wifiphisher"><span>Wireless - wifiphisher</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 01 / 11 22:52</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p>A <strong>Rogue Access Point</strong> framework. <a href="https://github.com/wifiphisher/wifiphisher" target="_blank" rel="noopener noreferrer">link</a></p><p><img src="'+t+`" alt="logo"></p><p><em>wifiphisher</em> 是一款安全工具，由希腊安全研究员 <em>George Chatzisofroniou</em> 开发。由 Python 编写，可对受害者进行定制的 <strong>钓鱼攻击</strong></p><ul><li><p>与传统的 Wi-Fi 攻击不同，不涉及任何 <strong>handshake</strong> 或 <strong>brute-force</strong></p></li><li><p>利用 <strong>社会工程学（Social Engineering）</strong> 技术，使用一种类似欺骗的方法，使受害者在不知不觉中供出密码</p><blockquote><p>建立理论并通过利用自然的、社会的和制度上的途径来逐步地解决各种复杂的社会问题。</p></blockquote></li></ul><h2 id="requirements" tabindex="-1"><a class="header-anchor" href="#requirements"><span>Requirements</span></a></h2><ul><li>Kali Linux：官方支持发布版，所有新功能都在该平台上测试</li><li>Wireless network adapter：支持 AP &amp; Monitor mode</li><li>Drivers should support <em>netlink</em></li></ul><h2 id="usages" tabindex="-1"><a class="header-anchor" href="#usages"><span>Usages</span></a></h2><h3 id="_1-start-wireless-network-adapter" tabindex="-1"><a class="header-anchor" href="#_1-start-wireless-network-adapter"><span>1. Start wireless network adapter</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ifconfig wlan0 up</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+n+`" alt="start"></p><h3 id="_2-turn-wireless-network-adapter-into-monitor-mode" tabindex="-1"><a class="header-anchor" href="#_2-turn-wireless-network-adapter-into-monitor-mode"><span>2. Turn wireless network adapter into MONITOR mode</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ airmon-ng start wlan0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+l+`" alt="monitor"></p><h3 id="_3-start-wifiphisher-and-select-target" tabindex="-1"><a class="header-anchor" href="#_3-start-wifiphisher-and-select-target"><span>3. Start wifiphisher and select target</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ wifiphisher</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+o+'" alt="select"></p><h3 id="_4-select-attacking-scenarios" tabindex="-1"><a class="header-anchor" href="#_4-select-attacking-scenarios"><span>4. Select attacking scenarios</span></a></h3><ul><li>Firmware Upgrade Page</li><li>Network Manager Connect</li><li>Browser Plugin Update</li><li>OAuth Login Page</li></ul><p><img src="'+p+'" alt="page1"></p><p><img src="'+c+'" alt="page2"></p><h3 id="_5-start-attacking" tabindex="-1"><a class="header-anchor" href="#_5-start-attacking"><span>5. Start attacking!</span></a></h3><ul><li>建立一个 Evil Twin 热点</li><li>建立 WEB 服务，配置 DHCP 服务器</li><li>将所有用户请求 redirect 到高度定制化的 phishing pages</li></ul><h2 id="attacking-scenarios" tabindex="-1"><a class="header-anchor" href="#attacking-scenarios"><span>Attacking scenarios</span></a></h2><h3 id="firmware-upgrade-page" tabindex="-1"><a class="header-anchor" href="#firmware-upgrade-page"><span>Firmware Upgrade Page</span></a></h3><p>伪造一个路由器固件升级界面，诱使连接上伪造 AP 的受害者输入路由器密码</p><p><img src="'+h+'" alt="firmware-page"></p><p><img src="'+g+'" alt="firmware"></p><h3 id="network-manager-connect" tabindex="-1"><a class="header-anchor" href="#network-manager-connect"><span>Network Manager Connect</span></a></h3><p>伪造一个网络连接失败的界面，并弹出一个重新输入网络密码的窗口，诱使受害者输入密码</p><p><img src="'+d+'" alt="networkmanager-page"></p><p><img src="'+m+'" alt="networkmanager"></p><h3 id="browser-plugin-update" tabindex="-1"><a class="header-anchor" href="#browser-plugin-update"><span>Browser Plugin Update</span></a></h3><p>伪造浏览器插件升级，让受害者下载恶意的可执行文件 - 没有尝试。</p><h3 id="oauth-login-page" tabindex="-1"><a class="header-anchor" href="#oauth-login-page"><span>OAuth Login Page</span></a></h3><p>伪造利用社交网络账号登录的免费热点，诱使受害者输入社交网络的账号密码</p><p><img src="'+u+'" alt="facebook-page"></p><p><img src="'+w+'" alt="facebook"></p><h2 id="advanced" tabindex="-1"><a class="header-anchor" href="#advanced"><span>Advanced</span></a></h2><p>可自己定义更多的 phishing scenarios</p><ul><li><em>LinkedIn</em> 登录界面（与 Facebook 大同小异）</li><li><em>Adobe Flash Player</em> 的升级界面，使用户下载恶意的可执行程序</li></ul><p>可以自定义 Evil Twin AP 的 SSID 和 MAC Address</p><ul><li>MAC Address 的定制与网卡有关，有些网卡不支持指定 MAC Address</li><li>在下面的例子中 <ul><li>伪造一个 SSID 为 <code>mrdk</code> 的 AP</li><li>试图指定 MAC 地址但失败了，因此该网卡不能发动 MAC 地址相同的 Evil Twin 攻击</li></ul></li></ul><p><img src="'+k+'" alt="mrdk"></p><p><img src="'+f+'" alt="custom-mrdk"></p>',50)]))}const x=a(b,[["render",_],["__file","Wireless Wifiphisher.html.vue"]]),P=JSON.parse('{"path":"/notes/Wireless/Wireless%20Wifiphisher.html","title":"Wireless - wifiphisher","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Requirements","slug":"requirements","link":"#requirements","children":[]},{"level":2,"title":"Usages","slug":"usages","link":"#usages","children":[{"level":3,"title":"1. Start wireless network adapter","slug":"_1-start-wireless-network-adapter","link":"#_1-start-wireless-network-adapter","children":[]},{"level":3,"title":"2. Turn wireless network adapter into MONITOR mode","slug":"_2-turn-wireless-network-adapter-into-monitor-mode","link":"#_2-turn-wireless-network-adapter-into-monitor-mode","children":[]},{"level":3,"title":"3. Start wifiphisher and select target","slug":"_3-start-wifiphisher-and-select-target","link":"#_3-start-wifiphisher-and-select-target","children":[]},{"level":3,"title":"4. Select attacking scenarios","slug":"_4-select-attacking-scenarios","link":"#_4-select-attacking-scenarios","children":[]},{"level":3,"title":"5. Start attacking!","slug":"_5-start-attacking","link":"#_5-start-attacking","children":[]}]},{"level":2,"title":"Attacking scenarios","slug":"attacking-scenarios","link":"#attacking-scenarios","children":[{"level":3,"title":"Firmware Upgrade Page","slug":"firmware-upgrade-page","link":"#firmware-upgrade-page","children":[]},{"level":3,"title":"Network Manager Connect","slug":"network-manager-connect","link":"#network-manager-connect","children":[]},{"level":3,"title":"Browser Plugin Update","slug":"browser-plugin-update","link":"#browser-plugin-update","children":[]},{"level":3,"title":"OAuth Login Page","slug":"oauth-login-page","link":"#oauth-login-page","children":[]}]},{"level":2,"title":"Advanced","slug":"advanced","link":"#advanced","children":[]}],"git":{},"filePathRelative":"notes/Wireless/Wireless Wifiphisher.md"}');export{x as comp,P as data};
