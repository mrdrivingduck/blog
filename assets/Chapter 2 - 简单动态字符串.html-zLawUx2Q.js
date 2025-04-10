import{_ as n,c as a,a as s,o as i}from"./app-CT9FvwxE.js";const t={};function l(r,e){return i(),a("div",null,e[0]||(e[0]=[s(`<h1 id="chapter-2-简单动态字符串" tabindex="-1"><a class="header-anchor" href="#chapter-2-简单动态字符串"><span>Chapter 2 - 简单动态字符串</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 01 14:12</p><p>Nanjing, Jiangsu, China</p><hr><p>Redis 中自行构建了一种字符串表示，称为 <strong>简单动态字符串 (Simple Dynamic String, SDS)</strong>，而普通的 C 字符串只会被用于一些字面常量。</p><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><p>SDS 的定义如下。对于这种设计，与传统的 C 字符串相比，有什么优势？</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">sdshdr</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span> len<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> free<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span> buf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>len</code> 记录了字符串目前的长度 (不包括 <code>\\0</code>)</li><li><code>free</code> 记录了缓冲区中剩余空闲空间的长度</li><li><code>buf</code> 指向缓冲区首地址</li></ul><h2 id="string-length" tabindex="-1"><a class="header-anchor" href="#string-length"><span>String Length</span></a></h2><p>在普通的 C 字符串中，并不维护字符串的长度。如果要获得一个字符串的长度，<code>strlen()</code> 需要对整个字符串进行遍历，时间复杂度为 O(N)。Redis 的 SDS 中直接维护了字符串的长度，时间复杂度减小到 O(1) - 对于一个特别长的字符串反复执行 <code>STRLEN</code> 也不会对性能有影响。</p><h2 id="memory-security" tabindex="-1"><a class="header-anchor" href="#memory-security"><span>Memory Security</span></a></h2><p>C 字符串不记录自身长度带来的一个问题是容易造成缓冲区溢出。比如在进行 <code>strcat(dest, src)</code> 时，如果 <code>dest</code> 的缓冲区长度不够，将会覆盖 <code>dest</code> 缓冲区之后的内存内容。由于 SDS 记录了字符串长度，在字符串发生修改前，会对缓冲区长度进行检查。如果缓冲区长度不够，SDS 的空间将先被扩展，再进行后续操作。</p><h2 id="memory-allocation" tabindex="-1"><a class="header-anchor" href="#memory-allocation"><span>Memory Allocation</span></a></h2><p>扩展 SDS 的内存空间涉及到内存的重新分配。频繁的重分配肯定是相当耗时的。SDS 中实现了两种优化机制。</p><h3 id="空间预分配" tabindex="-1"><a class="header-anchor" href="#空间预分配"><span>空间预分配</span></a></h3><p>由于 SDS 中可以记录缓冲区中的空闲空间。为了减少内存重分配的次数，很容易想到的策略就是一次分配较多的空间，记录在 <code>free</code> 中，后续就不需要重复分配了。这种策略带来的问题就是会有一些空间被浪费。Redis 的实现在其中做了折衷：</p><ul><li>对 SDS 修改后，SDS 的长度 &lt; 1MB，那么修改后 <code>len</code> 属性与 <code>free</code> 属性相同 (相当于空间扩展到实际内容的两倍长度)</li><li>对 SDS 修改后，SDS 长度 &gt;= 1MB，那么修改后将保证 <code>free</code> 为 1MB (分配 1MB 的额外空间)</li></ul><p>通过这种空间预分配技术，可以在一定程度上减少内存重新分配的次数。</p><h3 id="惰性内存释放" tabindex="-1"><a class="header-anchor" href="#惰性内存释放"><span>惰性内存释放</span></a></h3><p>当 SDS 字符串缩短后，并不立刻回收内存，而是用 <code>free</code> 将空出的空间记录下来，以便下次使用。当然，也有对应的 API 可以真正释放这些未使用空间。</p><h2 id="binary-safety" tabindex="-1"><a class="header-anchor" href="#binary-safety"><span>Binary Safety</span></a></h2><p>SDS 从一定意义上来说已经不是字符串了，而是 <strong>字节数组</strong>。SDS API 会以二进制方式 (而不是字符串方式) 来处理缓冲区中的数据。比如，如果数据的中间有一个 <code>\\0</code>，那么普通的 C 字符串 API 将会将字符串的一部分作为结果返回，从而带来错误。SDS API 不会出现这种问题。</p><p>同时，由于 SDS 中的 <code>buf</code> 也遵循 C 字符串的 <code>\\0</code> 结尾惯例，因此也兼容部分 C 字符串函数。</p>`,25)]))}const o=n(t,[["render",l],["__file","Chapter 2 - 简单动态字符串.html.vue"]]),d=JSON.parse('{"path":"/redis-implementation-notes/Part%201%20-%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E5%AF%B9%E8%B1%A1/Chapter%202%20-%20%E7%AE%80%E5%8D%95%E5%8A%A8%E6%80%81%E5%AD%97%E7%AC%A6%E4%B8%B2.html","title":"Chapter 2 - 简单动态字符串","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"String Length","slug":"string-length","link":"#string-length","children":[]},{"level":2,"title":"Memory Security","slug":"memory-security","link":"#memory-security","children":[]},{"level":2,"title":"Memory Allocation","slug":"memory-allocation","link":"#memory-allocation","children":[{"level":3,"title":"空间预分配","slug":"空间预分配","link":"#空间预分配","children":[]},{"level":3,"title":"惰性内存释放","slug":"惰性内存释放","link":"#惰性内存释放","children":[]}]},{"level":2,"title":"Binary Safety","slug":"binary-safety","link":"#binary-safety","children":[]}],"git":{},"filePathRelative":"redis-implementation-notes/Part 1 - 数据结构与对象/Chapter 2 - 简单动态字符串.md"}');export{o as comp,d as data};
