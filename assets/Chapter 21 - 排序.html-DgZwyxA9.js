import{_ as n,c as a,a as o,o as s}from"./app-CT9FvwxE.js";const t={};function i(l,e){return s(),a("div",null,e[0]||(e[0]=[o(`<h1 id="chapter-21-排序" tabindex="-1"><a class="header-anchor" href="#chapter-21-排序"><span>Chapter 21 - 排序</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 11 19:48</p><p>Nanjing, Jiangsu, China</p><hr><p>Redis 的 <code>SORT</code> 命令可以对列表的 key、集合的 key 或有序集合的 key 进行排序。</p><h2 id="implementation-of-sort-key" tabindex="-1"><a class="header-anchor" href="#implementation-of-sort-key"><span>Implementation of SORT Key</span></a></h2><p>这是 <code>SORT</code> 命令最简单的使用方式，用于对某个数字值的 key 进行排序。比如，对一个包含大量数字的列表进行排序。</p><p>服务器首先创建一个与被排序的列表长度相同的数组，数组的类型为 <code>redisSortObject</code> 结构：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">_redisSortObject</span> <span class="token punctuation">{</span></span>
<span class="line">    robj <span class="token operator">*</span>obj<span class="token punctuation">;</span> <span class="token comment">// 被排序的对象</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">union</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">double</span> score<span class="token punctuation">;</span> <span class="token comment">// 数值排序权重</span></span>
<span class="line">        robj <span class="token operator">*</span>cmpobj<span class="token punctuation">;</span> <span class="token comment">// 字符串排序指针</span></span>
<span class="line">    <span class="token punctuation">}</span> u<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span> redisSortObject<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，<code>obj</code> 指针分别指向被排序列表的每一项，使 <code>obj</code> 指针与被排序的列表元素构成一一对应的关系。将每个 <code>obj</code> 指向的列表项转换为一个 <code>double</code> 类型的浮点数保存在 <code>u.score</code> 中。</p><p>根据 <code>u.score</code> 对 <code>redisSortObject</code> 数组进行快速排序，然后依次遍历数组的每一项，将每一项 <code>obj</code> 对应的列表项返回给客户端。</p><h2 id="implementation-of-alpha" tabindex="-1"><a class="header-anchor" href="#implementation-of-alpha"><span>Implementation of ALPHA</span></a></h2><p>通过 <code>ALPHA</code> 选项，<code>SORT</code> 命令可以对包含字符串的 key 进行排序。具体实现与上述类似：</p><ul><li>创建一个与排序对象长度相同的 <code>redisSortObject</code> 数组</li><li>遍历数组，使数组每一项的 <code>obj</code> 指针分别指向待排序对象，<code>cmpobj</code> 指向被比较的字符串对象</li><li>根据 <code>cmpobj</code> 对数组进行快速排序</li><li>遍历数组，依次将数组每一项 <code>obj</code> 指针指向的对象返回给客户端</li></ul><h2 id="implementation-of-asc-and-desc" tabindex="-1"><a class="header-anchor" href="#implementation-of-asc-and-desc"><span>Implementation of ASC and DESC</span></a></h2><p>默认情况下，<code>SORT</code> 服从升序排序，排序后的结果从小到大排列 (<code>ASC</code>)。如果需要降序结果，那么就要显式指定 <code>DESC</code>。排序的总体流程与上述相同，唯一的区别是，在进行快速排序时，比较函数产生 <strong>升序对比结果</strong> 和 <strong>降序对比结果</strong>。</p><h2 id="implementation-of-by" tabindex="-1"><a class="header-anchor" href="#implementation-of-by"><span>Implementation of BY</span></a></h2><p>默认情况下，<code>SORT</code> 使用被排序 key 包含的元素作为排序权重。比如，对集合来说，集合中的每个元素就被作为排序权重。另外，可以通过 <code>BY</code> 选项让 <code>SORT</code> 对某个特定的 field 进行排序，比如：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">&gt; SADD fruits &quot;apple&quot; &quot;banana&quot; &quot;cherry&quot;</span>
<span class="line">&gt; MSET apple-price 8 banana-price 5.5 cherry-price 7</span>
<span class="line">&gt; SORT fruits BY *-price</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先 Redis 会创建一个与 <code>fruit</code> 长度相同的排序数组，其中的 <code>obj</code> 指针依次指向待排序数据。然后遍历数组，根据 <code>BY</code> 给定的 pattern，查找相应的权重 (比如对于 <code>apple</code>，返回 <code>apple-price</code> 对应的 <code>8</code>) 并转换为 <code>double</code>。最终执行排序。</p><h2 id="implementation-of-alpha-by" tabindex="-1"><a class="header-anchor" href="#implementation-of-alpha-by"><span>Implementation of ALPHA BY</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">SORT fruits BY *-id ALPHA</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>与上一节的唯一区别是，被排序的权重值是字符串。因此，将查找到的权重值作为字符串进行排序。</p><h2 id="limit" tabindex="-1"><a class="header-anchor" href="#limit"><span>LIMIT</span></a></h2><p><code>LIMIT</code> 选项可以让 <code>SORT</code> 命令只返回一部分已排序的元素。具体的做法是，在完成上述的排序数组创建、关联、排序后，只将排序数组指定位置开始的元素返回给客户端。</p><h2 id="get" tabindex="-1"><a class="header-anchor" href="#get"><span>GET</span></a></h2><p>通过使用 <code>GET</code> 选项，可以让 <code>SORT</code> 命令在排序后，只返回 <code>GET</code> 指定模式的元素。其中，也需要先完成上述的建立排序数组、关联、排序。最终，遍历排序数组，根据 <code>obj</code> 指向的元素和 <code>GET</code> 指定的 pattern，过滤出符合条件的 key；然后取得 key 对应的值并返回。</p><p>一个 <code>SORT</code> 命令可以带有多个 <code>GET</code> 选项。</p><h2 id="implementation-of-store" tabindex="-1"><a class="header-anchor" href="#implementation-of-store"><span>Implementation of STORE</span></a></h2><p>默认情况下，<code>SORT</code> 只向客户端返回结果，但不保存排序结果。通过 <code>STORE</code> 选项可以把 <code>SORT</code> 的排序结果保存到一个指定的 key 中。</p><p>排序的部分还是一致：建立排序数组、关联、排序。然后，Redis 首先判断指定保存的 key 是否存在，如果存在，先删除它；然后遍历排序数组，依次将排序后的元素加入到指定 key 对应的数据结构中 (比如列表)。最终向客户端返回排序后的结果。</p><hr><h2 id="order-of-options" tabindex="-1"><a class="header-anchor" href="#order-of-options"><span>Order of Options</span></a></h2><p>上述选项的执行顺序如何？典型的 <code>SORT</code> 执行顺序：</p><ol><li>排序 (<code>ALPHA</code> <code>ASC</code>/<code>DESC</code> <code>BY</code>)</li><li>限制排序结果的长度 (<code>LIMIT</code>)</li><li>获取外部 key (<code>GET</code>)</li><li>保存排序结果 (<code>STORE</code>)</li><li>向客户端返回排序结果</li></ol><p>其中，除了 <code>GET</code> 以外，其它选项在命令中的位置不会影响最终结果；而只有保证 <code>GET</code> 选项的顺序不变才能保证最终的排序结果不变。</p>`,37)]))}const d=n(t,[["render",i],["__file","Chapter 21 - 排序.html.vue"]]),p=JSON.parse('{"path":"/redis-implementation-notes/Part%204%20-%20%E7%8B%AC%E7%AB%8B%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0/Chapter%2021%20-%20%E6%8E%92%E5%BA%8F.html","title":"Chapter 21 - 排序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Implementation of SORT Key","slug":"implementation-of-sort-key","link":"#implementation-of-sort-key","children":[]},{"level":2,"title":"Implementation of ALPHA","slug":"implementation-of-alpha","link":"#implementation-of-alpha","children":[]},{"level":2,"title":"Implementation of ASC and DESC","slug":"implementation-of-asc-and-desc","link":"#implementation-of-asc-and-desc","children":[]},{"level":2,"title":"Implementation of BY","slug":"implementation-of-by","link":"#implementation-of-by","children":[]},{"level":2,"title":"Implementation of ALPHA BY","slug":"implementation-of-alpha-by","link":"#implementation-of-alpha-by","children":[]},{"level":2,"title":"LIMIT","slug":"limit","link":"#limit","children":[]},{"level":2,"title":"GET","slug":"get","link":"#get","children":[]},{"level":2,"title":"Implementation of STORE","slug":"implementation-of-store","link":"#implementation-of-store","children":[]},{"level":2,"title":"Order of Options","slug":"order-of-options","link":"#order-of-options","children":[]}],"git":{},"filePathRelative":"redis-implementation-notes/Part 4 - 独立功能的实现/Chapter 21 - 排序.md"}');export{d as comp,p as data};
