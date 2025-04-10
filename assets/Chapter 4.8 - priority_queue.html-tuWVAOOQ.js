import{_ as s,c as a,a as p,o as t}from"./app-CT9FvwxE.js";const e={};function c(o,n){return t(),a("div",null,n[0]||(n[0]=[p(`<h1 id="chapter-4-8-priority-queue" tabindex="-1"><a class="header-anchor" href="#chapter-4-8-priority-queue"><span>Chapter 4.8 - priority_queue</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 04 / 05 10:38</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_4-8-1-priority-queue-概述" tabindex="-1"><a class="header-anchor" href="#_4-8-1-priority-queue-概述"><span>4.8.1 priority_queue 概述</span></a></h2><p>拥有权重观念的 queue。元素以任意次序被推入队列，以权重的高低顺序被取出。缺省情况下，priority_queue 利用一个 max-heap 实现，以 vector 为底层容器。因此 priority_queue 也是一个 container adapter。</p><h2 id="_4-8-2-priority-queue-完整定义列表" tabindex="-1"><a class="header-anchor" href="#_4-8-2-priority-queue-完整定义列表"><span>4.8.2 priority_queue 完整定义列表</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token keyword">template</span> <span class="token operator">&lt;</span><span class="token keyword">class</span> <span class="token class-name">_Tp</span><span class="token punctuation">,</span></span>
<span class="line">          <span class="token keyword">class</span> <span class="token class-name">_Sequence</span> <span class="token function">__STL_DEPENDENT_DEFAULT_TMPL</span><span class="token punctuation">(</span>vector<span class="token operator">&lt;</span>_Tp<span class="token operator">&gt;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// 底层容器</span></span>
<span class="line">          <span class="token keyword">class</span> <span class="token class-name">_Compare</span>                                             <span class="token comment">// 比较运算算子</span></span>
<span class="line">          <span class="token function">__STL_DEPENDENT_DEFAULT_TMPL</span><span class="token punctuation">(</span>less<span class="token operator">&lt;</span><span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>value_type<span class="token operator">&gt;</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span></span>
<span class="line"><span class="token keyword">class</span> <span class="token class-name">priority_queue</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// requirements:</span></span>
<span class="line"></span>
<span class="line">  <span class="token function">__STL_CLASS_REQUIRES</span><span class="token punctuation">(</span>_Tp<span class="token punctuation">,</span> _Assignable<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__STL_CLASS_REQUIRES</span><span class="token punctuation">(</span>_Sequence<span class="token punctuation">,</span> _Sequence<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__STL_CLASS_REQUIRES</span><span class="token punctuation">(</span>_Sequence<span class="token punctuation">,</span> _RandomAccessContainer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">typedef</span> <span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>value_type _Sequence_value_type<span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__STL_CLASS_REQUIRES_SAME_TYPE</span><span class="token punctuation">(</span>_Tp<span class="token punctuation">,</span> _Sequence_value_type<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token function">__STL_CLASS_BINARY_FUNCTION_CHECK</span><span class="token punctuation">(</span>_Compare<span class="token punctuation">,</span> <span class="token keyword">bool</span><span class="token punctuation">,</span> _Tp<span class="token punctuation">,</span> _Tp<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">public</span><span class="token operator">:</span></span>
<span class="line">  <span class="token keyword">typedef</span> <span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>value_type      value_type<span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">typedef</span> <span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>size_type       size_type<span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">typedef</span>          _Sequence                  container_type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token keyword">typedef</span> <span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>reference       reference<span class="token punctuation">;</span></span>
<span class="line">  <span class="token keyword">typedef</span> <span class="token keyword">typename</span> <span class="token class-name">_Sequence</span><span class="token double-colon punctuation">::</span>const_reference const_reference<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">protected</span><span class="token operator">:</span></span>
<span class="line">  _Sequence c<span class="token punctuation">;</span></span>
<span class="line">  _Compare comp<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">public</span><span class="token operator">:</span></span>
<span class="line">  <span class="token comment">// 构造函数主要对 make_heap() 函数进行了实用</span></span>
<span class="line">  <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token function">c</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">  <span class="token keyword">explicit</span> <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token keyword">const</span> _Compare<span class="token operator">&amp;</span> __x<span class="token punctuation">)</span> <span class="token operator">:</span>  <span class="token function">c</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">comp</span><span class="token punctuation">(</span>__x<span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span></span>
<span class="line">  <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token keyword">const</span> _Compare<span class="token operator">&amp;</span> __x<span class="token punctuation">,</span> <span class="token keyword">const</span> _Sequence<span class="token operator">&amp;</span> __s<span class="token punctuation">)</span></span>
<span class="line">    <span class="token operator">:</span> <span class="token function">c</span><span class="token punctuation">(</span>__s<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">comp</span><span class="token punctuation">(</span>__x<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span> <span class="token function">make_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">      <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token keyword">const</span> value_type<span class="token operator">*</span> __first<span class="token punctuation">,</span> <span class="token keyword">const</span> value_type<span class="token operator">*</span> __last<span class="token punctuation">)</span></span>
<span class="line">    <span class="token operator">:</span> <span class="token function">c</span><span class="token punctuation">(</span>__first<span class="token punctuation">,</span> __last<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token function">make_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token keyword">const</span> value_type<span class="token operator">*</span> __first<span class="token punctuation">,</span> <span class="token keyword">const</span> value_type<span class="token operator">*</span> __last<span class="token punctuation">,</span></span>
<span class="line">                 <span class="token keyword">const</span> _Compare<span class="token operator">&amp;</span> __x<span class="token punctuation">)</span></span>
<span class="line">    <span class="token operator">:</span> <span class="token function">c</span><span class="token punctuation">(</span>__first<span class="token punctuation">,</span> __last<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">comp</span><span class="token punctuation">(</span>__x<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span> <span class="token function">make_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token function">priority_queue</span><span class="token punctuation">(</span><span class="token keyword">const</span> value_type<span class="token operator">*</span> __first<span class="token punctuation">,</span> <span class="token keyword">const</span> value_type<span class="token operator">*</span> __last<span class="token punctuation">,</span></span>
<span class="line">                 <span class="token keyword">const</span> _Compare<span class="token operator">&amp;</span> __x<span class="token punctuation">,</span> <span class="token keyword">const</span> _Sequence<span class="token operator">&amp;</span> __c<span class="token punctuation">)</span></span>
<span class="line">    <span class="token operator">:</span> <span class="token function">c</span><span class="token punctuation">(</span>__c<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">comp</span><span class="token punctuation">(</span>__x<span class="token punctuation">)</span></span>
<span class="line">  <span class="token punctuation">{</span></span>
<span class="line">    c<span class="token punctuation">.</span><span class="token function">insert</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> __first<span class="token punctuation">,</span> __last<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">make_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// 容量操作使用了底层容器的 API</span></span>
<span class="line">  <span class="token keyword">bool</span> <span class="token function">empty</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">const</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> c<span class="token punctuation">.</span><span class="token function">empty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line">  size_type <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">const</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> c<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line">  const_reference <span class="token function">top</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">const</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> c<span class="token punctuation">.</span><span class="token function">front</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">// push 函数应用了 push_heap() 算法</span></span>
<span class="line">  <span class="token keyword">void</span> <span class="token function">push</span><span class="token punctuation">(</span><span class="token keyword">const</span> value_type<span class="token operator">&amp;</span> __x<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    __STL_TRY <span class="token punctuation">{</span></span>
<span class="line">      c<span class="token punctuation">.</span><span class="token function">push_back</span><span class="token punctuation">(</span>__x<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      <span class="token function">push_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">__STL_UNWIND</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line">  <span class="token comment">// pop 函数应用了 pop_heap() 算法</span></span>
<span class="line">  <span class="token keyword">void</span> <span class="token function">pop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    __STL_TRY <span class="token punctuation">{</span></span>
<span class="line">      <span class="token function">pop_heap</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> comp<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">      c<span class="token punctuation">.</span><span class="token function">pop_back</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">__STL_UNWIND</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_4-8-3-priority-queue-没有迭代器" tabindex="-1"><a class="header-anchor" href="#_4-8-3-priority-queue-没有迭代器"><span>4.8.3 priority_queue 没有迭代器</span></a></h2><p>不提供遍历功能，不提供迭代器。</p><h2 id="_4-8-4-priority-queue-测试实例" tabindex="-1"><a class="header-anchor" href="#_4-8-4-priority-queue-测试实例"><span>4.8.4 priority_queue 测试实例</span></a></h2><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">priority_queue<span class="token operator">&lt;</span><span class="token keyword">int</span><span class="token operator">&gt;</span> q1<span class="token punctuation">;</span></span>
<span class="line">priority_queue<span class="token operator">&lt;</span><span class="token keyword">int</span><span class="token punctuation">,</span> deque<span class="token operator">&lt;</span><span class="token keyword">int</span><span class="token operator">&gt;</span><span class="token punctuation">,</span> greater<span class="token operator">&lt;</span><span class="token keyword">int</span><span class="token operator">&gt;&gt;</span> q2<span class="token punctuation">;</span> <span class="token comment">// 底层容器需要支持随机访问迭代器</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div>`,13)]))}const i=s(e,[["render",c],["__file","Chapter 4.8 - priority_queue.html.vue"]]),u=JSON.parse('{"path":"/the-annotated-stl-sources-notes/Chapter%204%20-%20%E5%BA%8F%E5%88%97%E5%BC%8F%E5%AE%B9%E5%99%A8/Chapter%204.8%20-%20priority_queue.html","title":"Chapter 4.8 - priority_queue","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"4.8.1 priority_queue 概述","slug":"_4-8-1-priority-queue-概述","link":"#_4-8-1-priority-queue-概述","children":[]},{"level":2,"title":"4.8.2 priority_queue 完整定义列表","slug":"_4-8-2-priority-queue-完整定义列表","link":"#_4-8-2-priority-queue-完整定义列表","children":[]},{"level":2,"title":"4.8.3 priority_queue 没有迭代器","slug":"_4-8-3-priority-queue-没有迭代器","link":"#_4-8-3-priority-queue-没有迭代器","children":[]},{"level":2,"title":"4.8.4 priority_queue 测试实例","slug":"_4-8-4-priority-queue-测试实例","link":"#_4-8-4-priority-queue-测试实例","children":[]}],"git":{},"filePathRelative":"the-annotated-stl-sources-notes/Chapter 4 - 序列式容器/Chapter 4.8 - priority_queue.md"}');export{i as comp,u as data};
