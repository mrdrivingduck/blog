import{_ as r,c as t,a as s,o as i}from"./app-aVGbliEg.js";const a="/blog/assets/reaver-init-B89ASLb_.png",n="/blog/assets/reaver-mon-CUOwrMg9.png",o="/blog/assets/reaver-ifconfig-DM8SSte4.png",l="/blog/assets/reaver-wash-BaFUA7-q.png",c="/blog/assets/reaver-result-Dfp0pYyi.png",h={};function d(p,e){return i(),t("div",null,e[0]||(e[0]=[s(`<h1 id="wireless-wps-cracking-by-reaver" tabindex="-1"><a class="header-anchor" href="#wireless-wps-cracking-by-reaver"><span>Wireless - WPS Cracking by Reaver</span></a></h1><p>Created by : Mr Dk.</p><p>2018 / 12 / 07 10:19</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="concept" tabindex="-1"><a class="header-anchor" href="#concept"><span>Concept</span></a></h2><p><em>WPS</em> stands for <em>Wi-Fi Protected Setup</em>. It is a wireless network security standard, created by Wi-Fi Alliance and introduced in 2006.</p><h2 id="goal" tabindex="-1"><a class="header-anchor" href="#goal"><span>Goal</span></a></h2><p>WPS tries to make connections between a router and wireless devices faster and easier</p><ul><li>WPS works only for wireless networks that use a password encrypted with <strong>WPA / WPA2 personal</strong></li><li>WEP is not supported</li></ul><h2 id="mode" tabindex="-1"><a class="header-anchor" href="#mode"><span>Mode</span></a></h2><p>If you want to connect a wireless device to a wireless network, you need to know:</p><ul><li>SSID (network name)</li><li>PSK (password of network)</li></ul><p>Without these two elements, you can&#39;t connect to a Wi-Fi network.</p><p>What can WPS do?</p><ol><li>Press the WPS on router to turn on discovery of new devices. Then, go to your device and select the network you want to connect to. The device is automatically connected to the wireless network <strong>without entering the network password</strong>.</li><li>For devices with WPS buttons. Pressing the WPS button on the router and then on those devices. You don&#39;t have to input any data during this process. WPS automatically sends the network password, and devices remember it for future use.</li><li>All routers with WPS enabled have a <strong>PIN</strong> code that is automatically generated, and it cannot be changed by users. Some devices without a WPS button but with WPS support will ask for that PIN. If you enter it, they authenticate themselves and connect to the wireless network.</li><li>Some devices without a WPS button but with WPS support will generate a client PIN. You can enter this PIN in router&#39;s wireless configuration panels, and the router will use it to add that device to the network.</li></ol><p>First two ways are rapid, the last two ways do not provide any benefits regarding the time it takes to connect devices to your wireless network.</p><h2 id="problem" tabindex="-1"><a class="header-anchor" href="#problem"><span>Problem</span></a></h2><p>The PIN is <strong>insecure</strong> and <strong>easy to hack</strong>:</p><ul><li>Eight-digit PIN is stored by routers in <strong>two blocks of four digits</strong> each</li><li>The router checks the first four digits <strong>separately</strong> from the last four digits</li><li>A hacker can brute-force the PIN in as little as 4 to 10 hours</li><li>Once the PIN is brute forced, PSK is found</li></ul><h2 id="cracking-tools" tabindex="-1"><a class="header-anchor" href="#cracking-tools"><span>Cracking Tools</span></a></h2><ul><li>Kali Linux 中的 <em>reaver</em><ul><li>Reaver v1.6.5 WiFi Protected Setup Attack Tool; Copyright (c) 2011, Tactical Network Solutions, Craig Heffner</li><li>用于攻击支持 WPS 的设备</li></ul></li><li>Kali Linux 中的 <em>wash</em><ul><li>Wash v1.6.5 WiFi Protected Setup Scan Tool; Copyright (c) 2011, Tactical Network Solutions, Craig Heffner</li><li>用于扫描周围支持 WPS 的设备</li></ul></li><li>Kali Linux 中的 <em>aircrack-ng</em>：用于将网卡设定为监控模式</li></ul><h2 id="theory" tabindex="-1"><a class="header-anchor" href="#theory"><span>Theory</span></a></h2><p>支持 WPS 功能的无线路由器，只要获得它的 PIN，就可以获得它的 PSK，从而自动连入网络，简化路由器的连接配置过程。<em>Reaver</em> 通过穷举的方式暴力破解这个 PIN，从而获得无线网络的密码。</p><h2 id="procedure" tabindex="-1"><a class="header-anchor" href="#procedure"><span>Procedure</span></a></h2><h3 id="insert-a-usb-wireless-interface" tabindex="-1"><a class="header-anchor" href="#insert-a-usb-wireless-interface"><span>Insert a USB-wireless-interface</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ifconfig</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+a+`" alt="reaver-init"></p><p><em>wlan0</em> is the wireless interface I have just inserted.</p><h3 id="turn-the-wireless-interface-into-monitor-mode" tabindex="-1"><a class="header-anchor" href="#turn-the-wireless-interface-into-monitor-mode"><span>Turn the wireless-interface into monitor mode</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ airmon-ng start wlan0</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+n+`" alt="reaver-mon"></p><h3 id="check-whether-the-monitor-mode-is-on" tabindex="-1"><a class="header-anchor" href="#check-whether-the-monitor-mode-is-on"><span>Check whether the monitor mode is on</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ifconfig</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+o+`" alt="reaver-ifconfig"></p><p><em>wlan0mon</em> is the wireless-interface which has been turned into monitor mode.</p><h3 id="search-for-the-routers-which-support-wps" tabindex="-1"><a class="header-anchor" href="#search-for-the-routers-which-support-wps"><span>Search for the Routers which support WPS</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ wash -i wlan0mon</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+l+`" alt="reaver-wash"></p><p>实测很多路由器已经有了保护措施：</p><ul><li>不回应破解</li><li>穷举到一定次数后开启保护</li></ul><p>另外和网卡放置的角度也有关系：</p><ul><li>使用放在我右手边的网卡破解一直失败</li><li>使用放在我右手边靠窗的网卡就能破解成功</li></ul><p>经过尝试和选择，身边唯一能被破解的网络 - <code>TP-LINK_qwer</code>。</p><h3 id="start-cracking-by-reaver" tabindex="-1"><a class="header-anchor" href="#start-cracking-by-reaver"><span>Start cracking by reaver</span></a></h3><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ reaver -i wlan0mon -b EC:88:8F:51:DD:A2 -vv</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>由于 8 位的 PIN 是分为两个 4 位分开存放的，<em>reaver</em> 会先穷举前四位 PIN。在我的破解过程中，在进度大约到 15% 时，突然跳到了 90%。说明前四位已被破解，直接进入了后四位的破解，因此进度大大增加。</p><p><img src="`+c+'" alt="reaver-result"></p><p>后四位 PIN 也破解完毕。由此 8 位 PIN 已被全部破解出来，PSK 也被获得：</p><ul><li>AP SSID：<code>TP-LINK_qwer</code></li><li>PIN：<code>18914863</code></li><li>PSK：<code>nuaa@413</code></li></ul><p>如果已知路由器的 PIN，就可以直接使用 <code>-p PIN</code> 参数直接获得 PSK。</p><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>这个破解太受条件限制了，在宿舍和实验室里找了好久，才找到这么一个唯一可以被破解的无线路由器。说明现在的路由器厂商已经非常注意防御此类破解了。令我比较郁闷的是，<em>kismet</em> 号称可以在检测到暴力破解 WPS 时发出警告，然而并没有警告啊。。。。。。</p>',53)]))}const m=r(h,[["render",d],["__file","Wireless WPS Cracking by Reaver.html.vue"]]),g=JSON.parse('{"path":"/notes/Wireless/Wireless%20WPS%20Cracking%20by%20Reaver.html","title":"Wireless - WPS Cracking by Reaver","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Concept","slug":"concept","link":"#concept","children":[]},{"level":2,"title":"Goal","slug":"goal","link":"#goal","children":[]},{"level":2,"title":"Mode","slug":"mode","link":"#mode","children":[]},{"level":2,"title":"Problem","slug":"problem","link":"#problem","children":[]},{"level":2,"title":"Cracking Tools","slug":"cracking-tools","link":"#cracking-tools","children":[]},{"level":2,"title":"Theory","slug":"theory","link":"#theory","children":[]},{"level":2,"title":"Procedure","slug":"procedure","link":"#procedure","children":[{"level":3,"title":"Insert a USB-wireless-interface","slug":"insert-a-usb-wireless-interface","link":"#insert-a-usb-wireless-interface","children":[]},{"level":3,"title":"Turn the wireless-interface into monitor mode","slug":"turn-the-wireless-interface-into-monitor-mode","link":"#turn-the-wireless-interface-into-monitor-mode","children":[]},{"level":3,"title":"Check whether the monitor mode is on","slug":"check-whether-the-monitor-mode-is-on","link":"#check-whether-the-monitor-mode-is-on","children":[]},{"level":3,"title":"Search for the Routers which support WPS","slug":"search-for-the-routers-which-support-wps","link":"#search-for-the-routers-which-support-wps","children":[]},{"level":3,"title":"Start cracking by reaver","slug":"start-cracking-by-reaver","link":"#start-cracking-by-reaver","children":[]}]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"notes/Wireless/Wireless WPS Cracking by Reaver.md"}');export{m as comp,g as data};