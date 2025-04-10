import{_ as s,c as a,a as p,o as t}from"./app-CT9FvwxE.js";const e={};function c(o,n){return t(),a("div",null,n[0]||(n[0]=[p(`<h1 id="chapter-6-7-12-nth-element" tabindex="-1"><a class="header-anchor" href="#chapter-6-7-12-nth-element"><span>Chapter 6.7.12 - nth_element</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 04 / 15 22:54</p><p>Nanjing, Jiangsu, China</p><hr><p>对区间进行重新排列，并保证以指定位置的元素为枢轴，该位置之前的元素都不大于该元素，该位置之后的元素都不小于该元素，而前后两个区间内的元素次序则不做保证。默认以 <code>operator&lt;</code> 进行比较，也可以接收用户提供的二元仿函数。</p><p>算法不断以 median-of-3 partitioning 分割法进行切分，并判断分割完毕的枢轴位置与指定的枢轴位置的相对差。如果指定枢轴位于分割完毕的枢轴左边，那么对左区间进行进一步分割；否则对右区间进行进一步分割。当分割元素过少时 (小于等于 3)，那么分割操作实际上等效于三个元素的排序 (小于枢轴 / 枢轴 / 大于枢轴)，所以可以直接用插入排序实现。</p><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token keyword">template</span> <span class="token operator">&lt;</span><span class="token keyword">class</span> <span class="token class-name">_RandomAccessIter</span><span class="token operator">&gt;</span></span>
<span class="line"><span class="token keyword">inline</span> <span class="token keyword">void</span> <span class="token function">nth_element</span><span class="token punctuation">(</span>_RandomAccessIter __first<span class="token punctuation">,</span> _RandomAccessIter __nth<span class="token punctuation">,</span></span>
<span class="line">                        _RandomAccessIter __last<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token function">__STL_REQUIRES</span><span class="token punctuation">(</span>_RandomAccessIter<span class="token punctuation">,</span> _Mutable_RandomAccessIterator<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__STL_REQUIRES</span><span class="token punctuation">(</span><span class="token keyword">typename</span> <span class="token class-name">iterator_traits</span><span class="token operator">&lt;</span>_RandomAccessIter<span class="token operator">&gt;</span><span class="token double-colon punctuation">::</span>value_type<span class="token punctuation">,</span></span>
<span class="line">                 _LessThanComparable<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__nth_element</span><span class="token punctuation">(</span>__first<span class="token punctuation">,</span> __nth<span class="token punctuation">,</span> __last<span class="token punctuation">,</span> <span class="token function">__VALUE_TYPE</span><span class="token punctuation">(</span>__first<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">template</span> <span class="token operator">&lt;</span><span class="token keyword">class</span> <span class="token class-name">_RandomAccessIter</span><span class="token punctuation">,</span> <span class="token keyword">class</span> <span class="token class-name">_Tp</span><span class="token punctuation">,</span> <span class="token keyword">class</span> <span class="token class-name">_Compare</span><span class="token operator">&gt;</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">__nth_element</span><span class="token punctuation">(</span>_RandomAccessIter __first<span class="token punctuation">,</span> _RandomAccessIter __nth<span class="token punctuation">,</span></span>
<span class="line">                   _RandomAccessIter __last<span class="token punctuation">,</span> _Tp<span class="token operator">*</span><span class="token punctuation">,</span> _Compare __comp<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token keyword">template</span> <span class="token operator">&lt;</span><span class="token keyword">class</span> <span class="token class-name">_RandomAccessIter</span><span class="token punctuation">,</span> <span class="token keyword">class</span> <span class="token class-name">_Tp</span><span class="token operator">&gt;</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">__nth_element</span><span class="token punctuation">(</span>_RandomAccessIter __first<span class="token punctuation">,</span> _RandomAccessIter __nth<span class="token punctuation">,</span></span>
<span class="line">                   _RandomAccessIter __last<span class="token punctuation">,</span> _Tp<span class="token operator">*</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token keyword">while</span> <span class="token punctuation">(</span>__last <span class="token operator">-</span> __first <span class="token operator">&gt;</span> <span class="token number">3</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">// 区间内元素超过 3 个</span></span>
<span class="line">    _RandomAccessIter __cut <span class="token operator">=</span></span>
<span class="line">      <span class="token function">__unguarded_partition</span><span class="token punctuation">(</span>__first<span class="token punctuation">,</span> __last<span class="token punctuation">,</span></span>
<span class="line">                            <span class="token function">_Tp</span><span class="token punctuation">(</span><span class="token function">__median</span><span class="token punctuation">(</span><span class="token operator">*</span>__first<span class="token punctuation">,</span>  <span class="token comment">// 选择合适的枢轴，分割</span></span>
<span class="line">                                         <span class="token operator">*</span><span class="token punctuation">(</span>__first <span class="token operator">+</span> <span class="token punctuation">(</span>__last <span class="token operator">-</span> __first<span class="token punctuation">)</span><span class="token operator">/</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                                         <span class="token operator">*</span><span class="token punctuation">(</span>__last <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>__cut <span class="token operator">&lt;=</span> __nth<span class="token punctuation">)</span>  <span class="token comment">// 目标位置位于本轮分割后的右区间中</span></span>
<span class="line">      __first <span class="token operator">=</span> __cut<span class="token punctuation">;</span>   <span class="token comment">// 进一步分割右区间</span></span>
<span class="line">    <span class="token keyword">else</span>                 <span class="token comment">// 目标位置位于本轮分割后的左区间中</span></span>
<span class="line">      __last <span class="token operator">=</span> __cut<span class="token punctuation">;</span>    <span class="token comment">// 进一步分割左区间</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">  <span class="token function">__insertion_sort</span><span class="token punctuation">(</span>__first<span class="token punctuation">,</span> __last<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// 区间内元素不超过 3 个，则直接使用快速排序</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,9)]))}const i=s(e,[["render",c],["__file","Chapter 6.7.12 - nth_element.html.vue"]]),u=JSON.parse('{"path":"/the-annotated-stl-sources-notes/Chapter%206%20-%20%E7%AE%97%E6%B3%95/Chapter%206.7.12%20-%20nth_element.html","title":"Chapter 6.7.12 - nth_element","lang":"en-US","frontmatter":{},"headers":[],"git":{},"filePathRelative":"the-annotated-stl-sources-notes/Chapter 6 - 算法/Chapter 6.7.12 - nth_element.md"}');export{i as comp,u as data};
