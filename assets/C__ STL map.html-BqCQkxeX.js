import{_ as s,c as a,a as e,o as p}from"./app-aVGbliEg.js";const t={};function l(c,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="c-stl-map" tabindex="-1"><a class="header-anchor" href="#c-stl-map"><span>C++ STL map</span></a></h1><p>Created by : Mr Dk.</p><p>2018 / 03 / 27 09:41</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token keyword">template</span> <span class="token operator">&lt;</span> <span class="token keyword">class</span> <span class="token class-name">Key</span><span class="token punctuation">,</span></span>
<span class="line">           <span class="token keyword">class</span> <span class="token class-name">T</span><span class="token punctuation">,</span></span>
<span class="line">           <span class="token keyword">class</span> <span class="token class-name">Compare</span> <span class="token operator">=</span> less<span class="token operator">&lt;</span>Key<span class="token operator">&gt;</span><span class="token punctuation">,</span></span>
<span class="line">           <span class="token keyword">class</span> <span class="token class-name">Alloc</span> <span class="token operator">=</span> allocator<span class="token operator">&lt;</span>pair<span class="token operator">&lt;</span><span class="token keyword">const</span> Key<span class="token punctuation">,</span>T<span class="token operator">&gt;</span> <span class="token operator">&gt;</span></span>
<span class="line">           <span class="token operator">&gt;</span> <span class="token keyword">class</span> <span class="token class-name">map</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Map 提供 key-value 的映射，底层实现是红黑树 (Red-Black Tree)，是一种非严格意义上的 <em>AVL</em> 树，自带排序的功能。Key 必须能够被比较，所有元素根据 key 的大小排序 - 若 key 为自定义对象，必须 overload <code>&lt;</code> 运算符。Map 中不会出现重复的 key，若 key 已存在，则插入失败。</p><p>根据 key 可以快速查找节点及其 value，查找的时间复杂度基本为 log(n)：</p><ul><li>快速插入 key-value pair</li><li>快速删除 key-value pair</li><li>快速根据 key 修改对应的 value</li><li>插入、删除结点对其它结点没有影响</li></ul><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;map&gt;</span></span></span>
<span class="line"><span class="token keyword">using</span> <span class="token keyword">namespace</span> std<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// using std::map;</span></span>
<span class="line"><span class="token comment">// using std::pair;</span></span>
<span class="line"><span class="token comment">// using std::make_pair;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor"><span>Constructor</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">map<span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span> map<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="attribute" tabindex="-1"><a class="header-anchor" href="#attribute"><span>Attribute</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token keyword">int</span> size <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 返回 map 中的元素个数</span></span>
<span class="line"><span class="token keyword">bool</span> empty <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">empty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 返回 map 是否为空</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="iterator" tabindex="-1"><a class="header-anchor" href="#iterator"><span>Iterator</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">map<span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span><span class="token double-colon punctuation">::</span>iterator iter<span class="token punctuation">;</span> 正向迭代器</span>
<span class="line">iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 指向第一个元素的迭代器</span></span>
<span class="line">iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 指向最后一个元素的下一个位置的迭代器</span></span>
<span class="line"></span>
<span class="line">map<span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span><span class="token double-colon punctuation">::</span>reverse_iterator r_iter<span class="token punctuation">;</span> <span class="token comment">// 反向迭代器</span></span>
<span class="line">r_iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">rbegin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 指向最后一个元素的迭代器</span></span>
<span class="line">r_iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">rend</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 指向第一个元素前一个位置的迭代器</span></span>
<span class="line"></span>
<span class="line">key_Type key <span class="token operator">=</span> iter<span class="token operator">-&gt;</span>first<span class="token punctuation">;</span> <span class="token comment">// 取得 key 值</span></span>
<span class="line">value_Type value <span class="token operator">=</span> iter<span class="token operator">-&gt;</span>second<span class="token punctuation">;</span> <span class="token comment">// 取得 value 值</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 遍历</span></span>
<span class="line"><span class="token keyword">for</span> <span class="token punctuation">(</span>iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> iter <span class="token operator">!=</span> map<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> iter<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    cout <span class="token operator">&lt;&lt;</span> iter<span class="token operator">-&gt;</span>first <span class="token operator">&lt;&lt;</span> <span class="token string">&quot; &quot;</span><span class="token punctuation">;</span></span>
<span class="line">    cout <span class="token operator">&lt;&lt;</span> iter<span class="token operator">-&gt;</span>second <span class="token operator">&lt;&lt;</span> endl<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="search" tabindex="-1"><a class="header-anchor" href="#search"><span>Search</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">iter <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 若没有找到 key ，则返回指向超尾元素的迭代器</span></span>
<span class="line"><span class="token comment">// 若找到 key ，则返回指向该 node 的迭代器</span></span>
<span class="line"><span class="token comment">// 时间复杂度基本为 Log(map.size())</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>iter <span class="token operator">==</span> map<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Not Found</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Found</span></span>
<span class="line">    cout <span class="token operator">&lt;&lt;</span> iter<span class="token operator">-&gt;</span>first <span class="token operator">&lt;&lt;</span> <span class="token string">&quot; &quot;</span><span class="token punctuation">;</span></span>
<span class="line">    cout <span class="token operator">&lt;&lt;</span> iter<span class="token operator">-&gt;</span>second <span class="token operator">&lt;&lt;</span> endl<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="insert" tabindex="-1"><a class="header-anchor" href="#insert"><span>Insert</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token comment">// 若 key 已存在，则插入失败，新值不会覆盖旧值</span></span>
<span class="line">map<span class="token punctuation">.</span><span class="token function">insert</span><span class="token punctuation">(</span><span class="token generic-function"><span class="token function">pair</span><span class="token generic class-name"><span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span></span></span> <span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 若想要查看插入是否成功</span></span>
<span class="line"><span class="token comment">// 可采用如下插入方式</span></span>
<span class="line">pair<span class="token operator">&lt;</span>map<span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span><span class="token double-colon punctuation">::</span>iterator<span class="token punctuation">,</span> <span class="token keyword">bool</span><span class="token operator">&gt;</span> inserted</span>
<span class="line">	<span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">insert</span><span class="token punctuation">(</span><span class="token generic-function"><span class="token function">pair</span><span class="token generic class-name"><span class="token operator">&lt;</span>key_Type<span class="token punctuation">,</span> value_Type<span class="token operator">&gt;</span></span></span> <span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>inserted<span class="token punctuation">.</span>second <span class="token operator">==</span> <span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Insert success</span></span>
<span class="line">    <span class="token comment">// TO DO ...</span></span>
<span class="line"><span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Insert unsuccess</span></span>
<span class="line">    <span class="token comment">// TO DO ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="deletion" tabindex="-1"><a class="header-anchor" href="#deletion"><span>Deletion</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">map<span class="token punctuation">.</span><span class="token function">erase</span><span class="token punctuation">(</span>iter<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 删除迭代器指向的 node</span></span>
<span class="line">map<span class="token punctuation">.</span><span class="token function">erase</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 删除指定的 key 值所对应的 node</span></span>
<span class="line">map<span class="token punctuation">.</span><span class="token function">erase</span><span class="token punctuation">(</span>iter1<span class="token punctuation">,</span> iter2<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 删除一个范围内的 node</span></span>
<span class="line">map<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 删除所有元素</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="object-as-key" tabindex="-1"><a class="header-anchor" href="#object-as-key"><span>Object as Key</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token comment">// 由于 map 本身是有序的，因此需要 key 的类型是可比较的。</span></span>
<span class="line"><span class="token comment">// 当使用自定义的 class 作为 key 时，需要 overload &lt; 运算符</span></span>
<span class="line"><span class="token comment">// 在 overload 的写法上需要注意，千万不能漏掉 {} 之前的 const</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">class</span> <span class="token class-name">Class</span> <span class="token punctuation">{</span></span>
<span class="line"><span class="token keyword">public</span><span class="token operator">:</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line">    <span class="token comment">// Constructor</span></span>
<span class="line">    <span class="token comment">// Copy_Constructor (VERY IMPORTANT!!!)</span></span>
<span class="line">    <span class="token keyword">bool</span> <span class="token keyword">operator</span> <span class="token operator">&lt;</span> <span class="token punctuation">(</span><span class="token keyword">const</span> Class <span class="token operator">&amp;</span>c<span class="token punctuation">)</span> <span class="token keyword">const</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// TO DO ...</span></span>
<span class="line">        <span class="token comment">// return true | return false;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>可以通过 map 方便地关联两个或多个属性。</p>`,28)]))}const i=s(t,[["render",l],["__file","C__ STL map.html.vue"]]),r=JSON.parse('{"path":"/notes/C__/C__%20STL%20map.html","title":"C++ STL map","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Constructor","slug":"constructor","link":"#constructor","children":[]},{"level":2,"title":"Attribute","slug":"attribute","link":"#attribute","children":[]},{"level":2,"title":"Iterator","slug":"iterator","link":"#iterator","children":[]},{"level":2,"title":"Search","slug":"search","link":"#search","children":[]},{"level":2,"title":"Insert","slug":"insert","link":"#insert","children":[]},{"level":2,"title":"Deletion","slug":"deletion","link":"#deletion","children":[]},{"level":2,"title":"Object as Key","slug":"object-as-key","link":"#object-as-key","children":[]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"notes/C++/C++ STL map.md"}');export{i as comp,r as data};