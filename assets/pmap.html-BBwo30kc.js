import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const p={};function i(c,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="pmap" tabindex="-1"><a class="header-anchor" href="#pmap"><span>pmap</span></a></h1><p>Created by : Mr Dk.</p><p>2023 / 07 / 03 23:04</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p><code>pmap</code> 用于打印进程的内存映射情况。其数据来源于 <code>/proc/PID/smaps</code>，并被加工为用户友好的阅读形式。</p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ pmap <span class="token parameter variable">--help</span></span>
<span class="line"></span>
<span class="line">Usage:</span>
<span class="line"> pmap <span class="token punctuation">[</span>options<span class="token punctuation">]</span> PID <span class="token punctuation">[</span>PID <span class="token punctuation">..</span>.<span class="token punctuation">]</span></span>
<span class="line"></span>
<span class="line">Options:</span>
<span class="line"> -x, <span class="token parameter variable">--extended</span>              show details</span>
<span class="line"> <span class="token parameter variable">-X</span>                          show even <span class="token function">more</span> details</span>
<span class="line">            WARNING: <span class="token function">format</span> changes according to /proc/PID/smaps</span>
<span class="line"> <span class="token parameter variable">-XX</span>                         show everything the kernel provides</span>
<span class="line"> -c, --read-rc               <span class="token builtin class-name">read</span> the default rc</span>
<span class="line"> -C, --read-rc-from<span class="token operator">=</span><span class="token operator">&lt;</span>file<span class="token operator">&gt;</span>   <span class="token builtin class-name">read</span> the rc from <span class="token function">file</span></span>
<span class="line"> -n, --create-rc             create new default rc</span>
<span class="line"> -N, --create-rc-to<span class="token operator">=</span><span class="token operator">&lt;</span>file<span class="token operator">&gt;</span>   create new rc to <span class="token function">file</span></span>
<span class="line">            NOTE: pid arguments are not allowed with -n, <span class="token parameter variable">-N</span></span>
<span class="line"> -d, <span class="token parameter variable">--device</span>                show the device <span class="token function">format</span></span>
<span class="line"> -q, <span class="token parameter variable">--quiet</span>                 <span class="token keyword">do</span> not display header and footer</span>
<span class="line"> -p, --show-path             show path <span class="token keyword">in</span> the mapping</span>
<span class="line"> -A, <span class="token parameter variable">--range</span><span class="token operator">=</span><span class="token operator">&lt;</span>low<span class="token operator">&gt;</span><span class="token punctuation">[</span>,<span class="token operator">&lt;</span>high<span class="token operator">&gt;</span><span class="token punctuation">]</span>  limit results to the given range</span>
<span class="line"></span>
<span class="line"> -h, <span class="token parameter variable">--help</span>     display this <span class="token builtin class-name">help</span> and <span class="token builtin class-name">exit</span></span>
<span class="line"> -V, <span class="token parameter variable">--version</span>  output version information and <span class="token builtin class-name">exit</span></span>
<span class="line"></span>
<span class="line">For <span class="token function">more</span> details see pmap<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比如观察 <code>zsh</code> 进程的内存映射情况：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ pmap <span class="token number">10</span></span>
<span class="line"><span class="token number">10</span>:   <span class="token parameter variable">-zsh</span></span>
<span class="line">00005575663f0000     92K r---- <span class="token function">zsh</span></span>
<span class="line">0000557566407000    760K r-x-- <span class="token function">zsh</span></span>
<span class="line">00005575664c5000    108K r---- <span class="token function">zsh</span></span>
<span class="line">00005575664e0000      8K r---- <span class="token function">zsh</span></span>
<span class="line">00005575664e2000     24K rw--- <span class="token function">zsh</span></span>
<span class="line">00005575664e8000     80K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00005575669c1000   2780K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a022ee000     12K r---- computil.so</span>
<span class="line">00007f3a022f1000     52K r-x-- computil.so</span>
<span class="line">00007f3a022fe000      8K r---- computil.so</span>
<span class="line">00007f3a02300000      4K r---- computil.so</span>
<span class="line">00007f3a02301000      4K rw--- computil.so</span>
<span class="line">00007f3a02302000   2560K r--s- Unix.zwc</span>
<span class="line">00007f3a0258d000    148K r--s- Zsh.zwc</span>
<span class="line">00007f3a025c9000    100K r--s- Zle.zwc</span>
<span class="line">00007f3a025fc000     12K r---- system.so</span>
<span class="line">00007f3a025ff000      8K r-x-- system.so</span>
<span class="line">00007f3a02601000      4K r---- system.so</span>
<span class="line">00007f3a02602000      4K ----- system.so</span>
<span class="line">00007f3a02603000      4K r---- system.so</span>
<span class="line">00007f3a02604000      4K rw--- system.so</span>
<span class="line">00007f3a0260d000    100K r--s- Misc.zwc</span>
<span class="line">00007f3a02626000    144K r--s- Base.zwc</span>
<span class="line">00007f3a0264a000      4K r---- stat.so</span>
<span class="line">00007f3a0264b000      8K r-x-- stat.so</span>
<span class="line">00007f3a0264d000      4K r---- stat.so</span>
<span class="line">00007f3a0264e000      4K r---- stat.so</span>
<span class="line">00007f3a0264f000      4K rw--- stat.so</span>
<span class="line">00007f3a02651000      4K r---- zleparameter.so</span>
<span class="line">00007f3a02652000      4K r-x-- zleparameter.so</span>
<span class="line">00007f3a02653000      4K r---- zleparameter.so</span>
<span class="line">00007f3a02654000      4K r---- zleparameter.so</span>
<span class="line">00007f3a02655000      4K rw--- zleparameter.so</span>
<span class="line">00007f3a0265a000      4K r---- regex.so</span>
<span class="line">00007f3a0265b000      4K r-x-- regex.so</span>
<span class="line">00007f3a0265c000      4K r---- regex.so</span>
<span class="line">00007f3a0265d000      4K r---- regex.so</span>
<span class="line">00007f3a0265e000      4K rw--- regex.so</span>
<span class="line">00007f3a0265f000      4K r---- langinfo.so</span>
<span class="line">00007f3a02660000      4K r-x-- langinfo.so</span>
<span class="line">00007f3a02661000      4K r---- langinfo.so</span>
<span class="line">00007f3a02662000      4K r---- langinfo.so</span>
<span class="line">00007f3a02663000      4K rw--- langinfo.so</span>
<span class="line">00007f3a02664000     16K r---- complist.so</span>
<span class="line">00007f3a02668000     44K r-x-- complist.so</span>
<span class="line">00007f3a02673000      4K r---- complist.so</span>
<span class="line">00007f3a02674000      4K ----- complist.so</span>
<span class="line">00007f3a02675000      4K r---- complist.so</span>
<span class="line">00007f3a02676000      4K rw--- complist.so</span>
<span class="line">00007f3a02677000      4K r---- datetime.so</span>
<span class="line">00007f3a02678000      4K r-x-- datetime.so</span>
<span class="line">00007f3a02679000      4K r---- datetime.so</span>
<span class="line">00007f3a0267a000      4K r---- datetime.so</span>
<span class="line">00007f3a0267b000      4K rw--- datetime.so</span>
<span class="line">00007f3a0267c000     96K r--s- Completion.zwc</span>
<span class="line">00007f3a02694000     12K r---- parameter.so</span>
<span class="line">00007f3a02697000     24K r-x-- parameter.so</span>
<span class="line">00007f3a0269d000      8K r---- parameter.so</span>
<span class="line">00007f3a0269f000      4K ----- parameter.so</span>
<span class="line">00007f3a026a0000      4K r---- parameter.so</span>
<span class="line">00007f3a026a1000      4K rw--- parameter.so</span>
<span class="line">00007f3a026a2000      8K r---- zutil.so</span>
<span class="line">00007f3a026a4000     20K r-x-- zutil.so</span>
<span class="line">00007f3a026a9000      4K r---- zutil.so</span>
<span class="line">00007f3a026aa000      4K ----- zutil.so</span>
<span class="line">00007f3a026ab000      4K r---- zutil.so</span>
<span class="line">00007f3a026ac000      4K rw--- zutil.so</span>
<span class="line">00007f3a026ad000     32K r---- complete.so</span>
<span class="line">00007f3a026b5000    104K r-x-- complete.so</span>
<span class="line">00007f3a026cf000     12K r---- complete.so</span>
<span class="line">00007f3a026d2000      4K ----- complete.so</span>
<span class="line">00007f3a026d3000      4K r---- complete.so</span>
<span class="line">00007f3a026d4000      4K rw--- complete.so</span>
<span class="line">00007f3a026d5000     88K r---- zle.so</span>
<span class="line">00007f3a026eb000    168K r-x-- zle.so</span>
<span class="line">00007f3a02715000     40K r---- zle.so</span>
<span class="line">00007f3a0271f000      8K r---- zle.so</span>
<span class="line">00007f3a02721000     28K rw--- zle.so</span>
<span class="line">00007f3a02728000      4K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a0272d000      4K r---- terminfo.so</span>
<span class="line">00007f3a0272e000      4K r-x-- terminfo.so</span>
<span class="line">00007f3a0272f000      4K r---- terminfo.so</span>
<span class="line">00007f3a02730000      4K r---- terminfo.so</span>
<span class="line">00007f3a02731000      4K rw--- terminfo.so</span>
<span class="line">00007f3a02736000     16K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a0273a000    348K r---- LC_CTYPE</span>
<span class="line">00007f3a02791000      4K r---- <span class="token environment constant">LC_NUMERIC</span></span>
<span class="line">00007f3a02792000      4K r---- <span class="token environment constant">LC_TIME</span></span>
<span class="line">00007f3a02793000      4K r---- LC_COLLATE</span>
<span class="line">00007f3a02794000      4K r---- <span class="token environment constant">LC_MONETARY</span></span>
<span class="line">00007f3a02795000     28K r--s- gconv-modules.cache</span>
<span class="line">00007f3a0279c000      8K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a0279e000    160K r---- libc.so.6</span>
<span class="line">00007f3a027c6000   1620K r-x-- libc.so.6</span>
<span class="line">00007f3a0295b000    352K r---- libc.so.6</span>
<span class="line">00007f3a029b3000     16K r---- libc.so.6</span>
<span class="line">00007f3a029b7000      8K rw--- libc.so.6</span>
<span class="line">00007f3a029b9000     52K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a029c6000     56K r---- libm.so.6</span>
<span class="line">00007f3a029d4000    496K r-x-- libm.so.6</span>
<span class="line">00007f3a02a50000    364K r---- libm.so.6</span>
<span class="line">00007f3a02aab000      4K r---- libm.so.6</span>
<span class="line">00007f3a02aac000      4K rw--- libm.so.6</span>
<span class="line">00007f3a02aad000     56K r---- libtinfo.so.6.3</span>
<span class="line">00007f3a02abb000     68K r-x-- libtinfo.so.6.3</span>
<span class="line">00007f3a02acc000     56K r---- libtinfo.so.6.3</span>
<span class="line">00007f3a02ada000     16K r---- libtinfo.so.6.3</span>
<span class="line">00007f3a02ade000      4K rw--- libtinfo.so.6.3</span>
<span class="line">00007f3a02adf000     12K r---- libcap.so.2.44</span>
<span class="line">00007f3a02ae2000     16K r-x-- libcap.so.2.44</span>
<span class="line">00007f3a02ae6000      8K r---- libcap.so.2.44</span>
<span class="line">00007f3a02ae8000      4K r---- libcap.so.2.44</span>
<span class="line">00007f3a02ae9000      4K rw--- libcap.so.2.44</span>
<span class="line">00007f3a02aea000      4K r---- SYS_LC_MESSAGES</span>
<span class="line">00007f3a02aeb000      4K r---- <span class="token environment constant">LC_PAPER</span></span>
<span class="line">00007f3a02aec000      4K r---- <span class="token environment constant">LC_NAME</span></span>
<span class="line">00007f3a02aed000      4K r---- <span class="token environment constant">LC_ADDRESS</span></span>
<span class="line">00007f3a02aee000      4K r---- <span class="token environment constant">LC_TELEPHONE</span></span>
<span class="line">00007f3a02aef000      4K r---- <span class="token environment constant">LC_MEASUREMENT</span></span>
<span class="line">00007f3a02af0000      8K rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f3a02af2000      8K r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f3a02af4000    168K r-x-- ld-linux-x86-64.so.2</span>
<span class="line">00007f3a02b1e000     44K r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f3a02b29000      4K r---- <span class="token environment constant">LC_IDENTIFICATION</span></span>
<span class="line">00007f3a02b2a000      8K r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f3a02b2c000      8K rw--- ld-linux-x86-64.so.2</span>
<span class="line">00007ffc8c720000    308K rw---   <span class="token punctuation">[</span> stack <span class="token punctuation">]</span></span>
<span class="line">00007ffc8c7f2000     16K r----   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007ffc8c7f6000      8K r-x--   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line"> total            12308K</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>加上 <code>-x</code> 参数可以显示更详细的信息：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line">$ pmap <span class="token parameter variable">-x</span> <span class="token number">1245</span></span>
<span class="line"><span class="token number">1245</span>:   <span class="token parameter variable">-zsh</span></span>
<span class="line">Address           Kbytes     RSS   Dirty Mode  Mapping</span>
<span class="line">00005649bd87d000      <span class="token number">92</span>      <span class="token number">92</span>       <span class="token number">0</span> r---- <span class="token function">zsh</span></span>
<span class="line">00005649bd894000     <span class="token number">760</span>     <span class="token number">760</span>       <span class="token number">0</span> r-x-- <span class="token function">zsh</span></span>
<span class="line">00005649bd952000     <span class="token number">108</span>      <span class="token number">64</span>       <span class="token number">0</span> r---- <span class="token function">zsh</span></span>
<span class="line">00005649bd96d000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> r---- <span class="token function">zsh</span></span>
<span class="line">00005649bd96f000      <span class="token number">24</span>      <span class="token number">24</span>      <span class="token number">24</span> rw--- <span class="token function">zsh</span></span>
<span class="line">00005649bd975000      <span class="token number">80</span>      <span class="token number">40</span>      <span class="token number">40</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00005649be532000    <span class="token number">2692</span>    <span class="token number">2644</span>    <span class="token number">2644</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d18034000     <span class="token number">100</span>      <span class="token number">96</span>       <span class="token number">0</span> r--s- Zle.zwc</span>
<span class="line">00007f1d18067000      <span class="token number">12</span>      <span class="token number">12</span>       <span class="token number">0</span> r---- system.so</span>
<span class="line">00007f1d1806a000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">0</span> r-x-- system.so</span>
<span class="line">00007f1d1806c000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- system.so</span>
<span class="line">00007f1d1806d000       <span class="token number">4</span>       <span class="token number">0</span>       <span class="token number">0</span> ----- system.so</span>
<span class="line">00007f1d1806e000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- system.so</span>
<span class="line">00007f1d1806f000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- system.so</span>
<span class="line">00007f1d18078000     <span class="token number">100</span>     <span class="token number">100</span>       <span class="token number">0</span> r--s- Misc.zwc</span>
<span class="line">00007f1d18091000     <span class="token number">144</span>      <span class="token number">60</span>       <span class="token number">0</span> r--s- Base.zwc</span>
<span class="line">00007f1d180b5000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- stat.so</span>
<span class="line">00007f1d180b6000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">0</span> r-x-- stat.so</span>
<span class="line">00007f1d180b8000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- stat.so</span>
<span class="line">00007f1d180b9000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- stat.so</span>
<span class="line">00007f1d180ba000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- stat.so</span>
<span class="line">00007f1d180bc000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- zleparameter.so</span>
<span class="line">00007f1d180bd000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x-- zleparameter.so</span>
<span class="line">00007f1d180be000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- zleparameter.so</span>
<span class="line">00007f1d180bf000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- zleparameter.so</span>
<span class="line">00007f1d180c0000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- zleparameter.so</span>
<span class="line">00007f1d180c5000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- regex.so</span>
<span class="line">00007f1d180c6000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x-- regex.so</span>
<span class="line">00007f1d180c7000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- regex.so</span>
<span class="line">00007f1d180c8000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- regex.so</span>
<span class="line">00007f1d180c9000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- regex.so</span>
<span class="line">00007f1d180ca000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- langinfo.so</span>
<span class="line">00007f1d180cb000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x-- langinfo.so</span>
<span class="line">00007f1d180cc000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- langinfo.so</span>
<span class="line">00007f1d180cd000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- langinfo.so</span>
<span class="line">00007f1d180ce000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- langinfo.so</span>
<span class="line">00007f1d180cf000      <span class="token number">16</span>      <span class="token number">16</span>       <span class="token number">0</span> r---- complist.so</span>
<span class="line">00007f1d180d3000      <span class="token number">44</span>      <span class="token number">44</span>       <span class="token number">0</span> r-x-- complist.so</span>
<span class="line">00007f1d180de000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- complist.so</span>
<span class="line">00007f1d180df000       <span class="token number">4</span>       <span class="token number">0</span>       <span class="token number">0</span> ----- complist.so</span>
<span class="line">00007f1d180e0000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- complist.so</span>
<span class="line">00007f1d180e1000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- complist.so</span>
<span class="line">00007f1d180e2000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- datetime.so</span>
<span class="line">00007f1d180e3000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x-- datetime.so</span>
<span class="line">00007f1d180e4000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- datetime.so</span>
<span class="line">00007f1d180e5000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- datetime.so</span>
<span class="line">00007f1d180e6000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- datetime.so</span>
<span class="line">00007f1d180e7000      <span class="token number">96</span>      <span class="token number">60</span>       <span class="token number">0</span> r--s- Completion.zwc</span>
<span class="line">00007f1d180ff000      <span class="token number">12</span>      <span class="token number">12</span>       <span class="token number">0</span> r---- parameter.so</span>
<span class="line">00007f1d18102000      <span class="token number">24</span>      <span class="token number">24</span>       <span class="token number">0</span> r-x-- parameter.so</span>
<span class="line">00007f1d18108000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">0</span> r---- parameter.so</span>
<span class="line">00007f1d1810a000       <span class="token number">4</span>       <span class="token number">0</span>       <span class="token number">0</span> ----- parameter.so</span>
<span class="line">00007f1d1810b000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- parameter.so</span>
<span class="line">00007f1d1810c000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- parameter.so</span>
<span class="line">00007f1d1810d000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">0</span> r---- zutil.so</span>
<span class="line">00007f1d1810f000      <span class="token number">20</span>      <span class="token number">20</span>       <span class="token number">0</span> r-x-- zutil.so</span>
<span class="line">00007f1d18114000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- zutil.so</span>
<span class="line">00007f1d18115000       <span class="token number">4</span>       <span class="token number">0</span>       <span class="token number">0</span> ----- zutil.so</span>
<span class="line">00007f1d18116000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- zutil.so</span>
<span class="line">00007f1d18117000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- zutil.so</span>
<span class="line">00007f1d18118000      <span class="token number">32</span>      <span class="token number">32</span>       <span class="token number">0</span> r---- complete.so</span>
<span class="line">00007f1d18120000     <span class="token number">104</span>     <span class="token number">104</span>       <span class="token number">0</span> r-x-- complete.so</span>
<span class="line">00007f1d1813a000      <span class="token number">12</span>      <span class="token number">12</span>       <span class="token number">0</span> r---- complete.so</span>
<span class="line">00007f1d1813d000       <span class="token number">4</span>       <span class="token number">0</span>       <span class="token number">0</span> ----- complete.so</span>
<span class="line">00007f1d1813e000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- complete.so</span>
<span class="line">00007f1d1813f000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- complete.so</span>
<span class="line">00007f1d18140000      <span class="token number">88</span>      <span class="token number">88</span>       <span class="token number">0</span> r---- zle.so</span>
<span class="line">00007f1d18156000     <span class="token number">168</span>     <span class="token number">168</span>       <span class="token number">0</span> r-x-- zle.so</span>
<span class="line">00007f1d18180000      <span class="token number">40</span>      <span class="token number">40</span>       <span class="token number">0</span> r---- zle.so</span>
<span class="line">00007f1d1818a000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> r---- zle.so</span>
<span class="line">00007f1d1818c000      <span class="token number">28</span>      <span class="token number">28</span>      <span class="token number">28</span> rw--- zle.so</span>
<span class="line">00007f1d18193000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d18198000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- terminfo.so</span>
<span class="line">00007f1d18199000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x-- terminfo.so</span>
<span class="line">00007f1d1819a000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- terminfo.so</span>
<span class="line">00007f1d1819b000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- terminfo.so</span>
<span class="line">00007f1d1819c000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- terminfo.so</span>
<span class="line">00007f1d181a1000      <span class="token number">16</span>      <span class="token number">16</span>      <span class="token number">16</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d181a5000     <span class="token number">348</span>     <span class="token number">128</span>       <span class="token number">0</span> r---- LC_CTYPE</span>
<span class="line">00007f1d181fc000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_NUMERIC</span></span>
<span class="line">00007f1d181fd000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_TIME</span></span>
<span class="line">00007f1d181fe000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- LC_COLLATE</span>
<span class="line">00007f1d181ff000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_MONETARY</span></span>
<span class="line">00007f1d18200000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- SYS_LC_MESSAGES</span>
<span class="line">00007f1d18201000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_PAPER</span></span>
<span class="line">00007f1d18202000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_NAME</span></span>
<span class="line">00007f1d18203000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_ADDRESS</span></span>
<span class="line">00007f1d18204000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_TELEPHONE</span></span>
<span class="line">00007f1d18205000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d18207000     <span class="token number">160</span>     <span class="token number">160</span>       <span class="token number">0</span> r---- libc.so.6</span>
<span class="line">00007f1d1822f000    <span class="token number">1620</span>    <span class="token number">1372</span>       <span class="token number">0</span> r-x-- libc.so.6</span>
<span class="line">00007f1d183c4000     <span class="token number">352</span>     <span class="token number">172</span>       <span class="token number">0</span> r---- libc.so.6</span>
<span class="line">00007f1d1841c000      <span class="token number">16</span>      <span class="token number">16</span>      <span class="token number">16</span> r---- libc.so.6</span>
<span class="line">00007f1d18420000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> rw--- libc.so.6</span>
<span class="line">00007f1d18422000      <span class="token number">52</span>      <span class="token number">24</span>      <span class="token number">24</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d1842f000      <span class="token number">56</span>      <span class="token number">56</span>       <span class="token number">0</span> r---- libm.so.6</span>
<span class="line">00007f1d1843d000     <span class="token number">496</span>     <span class="token number">244</span>       <span class="token number">0</span> r-x-- libm.so.6</span>
<span class="line">00007f1d184b9000     <span class="token number">364</span>       <span class="token number">0</span>       <span class="token number">0</span> r---- libm.so.6</span>
<span class="line">00007f1d18514000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- libm.so.6</span>
<span class="line">00007f1d18515000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- libm.so.6</span>
<span class="line">00007f1d18516000      <span class="token number">56</span>      <span class="token number">56</span>       <span class="token number">0</span> r---- libtinfo.so.6.3</span>
<span class="line">00007f1d18524000      <span class="token number">68</span>      <span class="token number">68</span>       <span class="token number">0</span> r-x-- libtinfo.so.6.3</span>
<span class="line">00007f1d18535000      <span class="token number">56</span>      <span class="token number">52</span>       <span class="token number">0</span> r---- libtinfo.so.6.3</span>
<span class="line">00007f1d18543000      <span class="token number">16</span>      <span class="token number">16</span>      <span class="token number">16</span> r---- libtinfo.so.6.3</span>
<span class="line">00007f1d18547000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- libtinfo.so.6.3</span>
<span class="line">00007f1d18548000      <span class="token number">12</span>      <span class="token number">12</span>       <span class="token number">0</span> r---- libcap.so.2.44</span>
<span class="line">00007f1d1854b000      <span class="token number">16</span>      <span class="token number">16</span>       <span class="token number">0</span> r-x-- libcap.so.2.44</span>
<span class="line">00007f1d1854f000       <span class="token number">8</span>       <span class="token number">0</span>       <span class="token number">0</span> r---- libcap.so.2.44</span>
<span class="line">00007f1d18551000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> r---- libcap.so.2.44</span>
<span class="line">00007f1d18552000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">4</span> rw--- libcap.so.2.44</span>
<span class="line">00007f1d18553000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_MEASUREMENT</span></span>
<span class="line">00007f1d18554000      <span class="token number">28</span>      <span class="token number">28</span>       <span class="token number">0</span> r--s- gconv-modules.cache</span>
<span class="line">00007f1d1855b000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> rw---   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007f1d1855d000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">0</span> r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f1d1855f000     <span class="token number">168</span>     <span class="token number">168</span>       <span class="token number">0</span> r-x-- ld-linux-x86-64.so.2</span>
<span class="line">00007f1d18589000      <span class="token number">44</span>      <span class="token number">40</span>       <span class="token number">0</span> r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f1d18594000       <span class="token number">4</span>       <span class="token number">4</span>       <span class="token number">0</span> r---- <span class="token environment constant">LC_IDENTIFICATION</span></span>
<span class="line">00007f1d18595000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> r---- ld-linux-x86-64.so.2</span>
<span class="line">00007f1d18597000       <span class="token number">8</span>       <span class="token number">8</span>       <span class="token number">8</span> rw--- ld-linux-x86-64.so.2</span>
<span class="line">00007fff651d2000     <span class="token number">272</span>     <span class="token number">272</span>     <span class="token number">272</span> rw---   <span class="token punctuation">[</span> stack <span class="token punctuation">]</span></span>
<span class="line">00007fff6537c000      <span class="token number">16</span>       <span class="token number">0</span>       <span class="token number">0</span> r----   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">00007fff65380000       <span class="token number">8</span>       <span class="token number">4</span>       <span class="token number">0</span> r-x--   <span class="token punctuation">[</span> anon <span class="token punctuation">]</span></span>
<span class="line">---------------- ------- ------- -------</span>
<span class="line">total kB            <span class="token number">9396</span>    <span class="token number">7792</span>    <span class="token number">3248</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看出可执行文件或库占用了多少内存地址空间。另外，该工具也可以用于排查内存泄漏：哪些地址空间的使用是只增不减的。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://linux.die.net/man/1/pmap" target="_blank" rel="noopener noreferrer">pmap(1) - Linux man page</a></p><p><a href="https://www.redhat.com/sysadmin/pmap-command" target="_blank" rel="noopener noreferrer">How to analyze a Linux process&#39; memory map with pmap</a></p>`,17)]))}const o=n(p,[["render",i],["__file","pmap.html.vue"]]),t=JSON.parse('{"path":"/notes/Linux/pmap.html","title":"pmap","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Linux/pmap.md"}');export{o as comp,t as data};
