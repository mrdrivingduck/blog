import{_ as e,c as a,a as o,o as c}from"./app-CT9FvwxE.js";const i={};function r(n,t){return c(),a("div",null,t[0]||(t[0]=[o('<h1 id="java-string-split" tabindex="-1"><a class="header-anchor" href="#java-string-split"><span>Java - String Split</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 03 / 26 20:12</p><p>Nanjing, Jiangsu, China</p><hr><p>今天遇上一个坑，花了点时间才解决，特此留念，提醒自己。</p><p>会遇上这个坑的根本原因是，对正常字符串和正则表达式的混用。之前在使用 Java 的 <code>String.split(string regex)</code> 时，参数显然应当是一个正则表达式的字符串。以前遇到的场景大部分是分割空格，或用 <code>/</code> 分割路径，而 <code>xxx.split(&quot; &quot;)</code> 是可行的。</p><p>今天的场景是切割一个 <code>1.src.patch</code> 的文件名。于是第一次写的代码是 <code>String.split(&quot;.&quot;)</code>，然而切分出来的数组长度为 0 而不是 3 😲。后来才想起来 <code>.</code> 是正则中的特殊意义字符，匹配除 <code>\\r</code> 或 <code>\\n</code> 以外的任何字符，所以无法代表 <code>.</code> 本身的含义。代码需要被修正为 <code>String.split(&quot;\\\\.&quot;)</code> 才能得到预期效果。</p><p>再次提醒自己参数名为 <code>regex</code> 的字符串可不能直接写成字符串了！</p><hr>',10)]))}const d=e(i,[["render",r],["__file","Java String Split.html.vue"]]),s=JSON.parse('{"path":"/notes/Java/Java%20String%20Split.html","title":"Java - String Split","lang":"en-US","frontmatter":{},"headers":[],"git":{},"filePathRelative":"notes/Java/Java String Split.md"}');export{d as comp,s as data};
