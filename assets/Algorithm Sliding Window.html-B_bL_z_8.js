import{_ as s,c as a,a as e,o as i}from"./app-BeHGwf2X.js";const l={};function p(t,n){return i(),a("div",null,n[0]||(n[0]=[e(`<h1 id="algorithm-sliding-window" tabindex="-1"><a class="header-anchor" href="#algorithm-sliding-window"><span>Algorithm - Sliding Window</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 21 11:41</p><p>Ningbo, Zhejiang, China</p><hr><p>2021 年 2 月的 <em>LeetCode</em> 题目全都是 <strong>滑动窗口</strong> 相关。记录一下该类型题目的编程范式。以 C++ 为例：</p><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line"><span class="token comment">// vector&lt;int&gt; nums;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">int</span> left <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">int</span> right <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">int</span> window_len <span class="token operator">=</span> <span class="token number">0</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span>right <span class="token operator">&lt;</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> nums<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// 将滑动窗口右端点纳入窗口统计值</span></span>
<span class="line">    <span class="token comment">// nums[right]...</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 根据题目限制，从窗口左端点开始缩短窗口</span></span>
<span class="line">    <span class="token comment">// nums[left]...</span></span>
<span class="line">    <span class="token comment">// while (condition) { left++; }</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// 统计窗口长度</span></span>
<span class="line">    <span class="token comment">// window_len = min / max (window_len, right - left + 1);</span></span>
<span class="line"></span>
<span class="line">    right<span class="token operator">++</span><span class="token punctuation">;</span> <span class="token comment">// 滑动窗口向右扩展</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7)]))}const c=s(l,[["render",p],["__file","Algorithm Sliding Window.html.vue"]]),r=JSON.parse('{"path":"/notes/Algorithm/Algorithm%20Sliding%20Window.html","title":"Algorithm - Sliding Window","lang":"en-US","frontmatter":{},"headers":[],"git":{},"filePathRelative":"notes/Algorithm/Algorithm Sliding Window.md"}');export{c as comp,r as data};
