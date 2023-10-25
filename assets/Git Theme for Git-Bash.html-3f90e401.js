import{_ as o,r,o as i,c as p,a as n,b as s,d as e,e as t}from"./app-25fa875f.js";const l="/blog/assets/git-bash-default-b86239c9.png",c="/blog/assets/git-bash-one-dark-4711a5e3.png",u={},d=n("h1",{id:"git-theme-for-git-bash",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#git-theme-for-git-bash","aria-hidden":"true"},"#"),s(" Git - Theme for Git-Bash")],-1),v=n("p",null,"Created by : Mr Dk.",-1),m=n("p",null,"2019 / 04 / 25 15:16",-1),k=n("p",null,"Nanjing, Jiangsu, China",-1),g=n("hr",null,null,-1),b={href:"https://atom.io/",target:"_blank",rel:"noopener noreferrer"},h=n("em",null,"One Dark",-1),q=n("em",null,"One Dark",-1),y=t(`<p>后来为了消除不同软件间的切换导致视觉上的不适，在使用 Typora 进行 MarkDown 文本编辑时，也使用了官方提供的类似配色主题 - <em>LostKeys Dark</em>。</p><p>然而对于 Git Bash，却一直用着默认的黑色 Terminal 主题。虽然在 Visual Studio Code 中内嵌了以现有配色启动 Git Bash 的功能，但 Git Bash 的主题我还是想调成 <em>One Dark</em> 的配色风格。</p><p>在 Git Bash 的设置中有设置主题的选项，但是没有我想要的 One Dark 主题。所以只能自己设定了。在 <code>C:\\Users\\&lt;UserName&gt;</code> 下能够找到 Git Bash 的配置文件 <code>.minttyrc</code>。</p><h2 id="basic-settings" tabindex="-1"><a class="header-anchor" href="#basic-settings" aria-hidden="true">#</a> Basic Settings</h2><p>设定了字体、字号、窗口大小、窗口透明度等。这些部分其实可以在 Git Bash 的 GUI 设置中完成。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Font=Ubuntu Mono
FontHeight=18
Transparency=low
Columns=100
Rows=30
BoldAsFont=yes
FontSmoothing=full
AllowBlinking=yes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="background-color-style" tabindex="-1"><a class="header-anchor" href="#background-color-style" aria-hidden="true">#</a> Background Color Style</h2>`,7),_=n("em",null,"One Dark Pro",-1),B={href:"https://github.com/Binaryify/OneDark-Pro/blob/master/src/editor.json",target:"_blank",rel:"noopener noreferrer"},f=t(`<div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token string-property property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;One Dark Pro&quot;</span><span class="token punctuation">,</span>
  <span class="token string-property property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;dark&quot;</span><span class="token punctuation">,</span>
  <span class="token string-property property">&quot;colors&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token string-property property">&quot;editor.background&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#282c34&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;editor.foreground&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#abb2bf&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将十六进制字符串分别转化为十进制的 RGB 即可：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>ForegroundColour=200,200,200
BackgroundColour=40,44,52
CursorColour=200,200,200
CursorType=block
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="text-color-style" tabindex="-1"><a class="header-anchor" href="#text-color-style" aria-hidden="true">#</a> Text Color Style</h2><p>应该是覆盖了原有的颜色文字字符串对应的默认颜色</p><ul><li>比如说原来的 <code>green</code> 对应的颜色是 <code>#008000</code></li><li>现在可以通过显式将 <code>green</code> 声明为 <code>#98c379</code>，覆盖原有的原色</li></ul><p>在 <em>One Dark Pro</em> 主题的源代码中找到所有 Terminal 相关的颜色：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token string-property property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;One Dark Pro&quot;</span><span class="token punctuation">,</span>
  <span class="token string-property property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;dark&quot;</span><span class="token punctuation">,</span>
  <span class="token string-property property">&quot;colors&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token string-property property">&quot;terminal.foreground&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#c8c8c8&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBlack&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#2d3139&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBlue&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#61afef&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiGreen&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#98c379&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiYellow&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#e5c07b&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiCyan&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#56b6c2&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiMagenta&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#c678dd&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiRed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#e06c75&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiWhite&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#d7dae0&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightBlack&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#7f848e&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightBlue&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#528bff&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightGreen&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#98c379&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightYellow&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#e5c07b&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightCyan&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#56b6c2&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightMagenta&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#7e0097&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightRed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#f44747&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;terminal.ansiBrightWhite&quot;</span><span class="token operator">:</span> <span class="token string">&quot;#d7dae0&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将十六进制字符串分别转化为十进制的 RGB 即可：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Green=152,195,121
Black=45,49,57
Blue=97,175,239
Yellow=229,192,123
Cyan=86,182,194
Magenta=198,120,221
Red=224,108,117
White=215,218,224
BrightBlack=127,132,142
BrightBlue=82,139,255
BrightGreen=152,195,121
BrightYellow=229,192,123
BrightCyan=86,182,194
BrightMagenta=126,0,151
BrightRed=244,71,71
BrightWhite=215,218,224
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>默认的 Git Bash 主题简直是看着让人窒息：</p><p><img src="`+l+'" alt="git-bash-default"></p><p>使用 <em>One Dark</em> 主题之后：</p><p><img src="'+c+'" alt="git-bash-one-dark"></p><p>妈诶 舒服了好多。</p>',16);function x(G,C){const a=r("ExternalLinkIcon");return i(),p("div",null,[d,v,m,k,g,n("p",null,[s("记得大二第一次使用 "),n("a",b,[s("Atom"),e(a)]),s(" 便爱上了默认自带的 "),h,s(" 配色。后来开始使用 Visual Studio Code 以后，依旧通过插件使用着 "),q,s(" 配色。比较好用的是这款：https://github.com/Binaryify/OneDark-Pro。")]),y,n("p",null,[s("设定了背景色、前景色、Cursor 的颜色和样式。在 "),_,s(" 主题的"),n("a",B,[s("源代码"),e(a)]),s("中分别找到这几个选项的颜色：")]),f])}const O=o(u,[["render",x],["__file","Git Theme for Git-Bash.html.vue"]]);export{O as default};
