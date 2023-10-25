import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const i={},t=e(`<h1 id="algorithm-sliding-window" tabindex="-1"><a class="header-anchor" href="#algorithm-sliding-window" aria-hidden="true">#</a> Algorithm - Sliding Window</h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 21 11:41</p><p>Ningbo, Zhejiang, China</p><hr><p>2021 年 2 月的 <em>LeetCode</em> 题目全都是 <strong>滑动窗口</strong> 相关。记录一下该类型题目的编程范式。以 C++ 为例：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token comment">// vector&lt;int&gt; nums;</span>

<span class="token keyword">int</span> left <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token keyword">int</span> right <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token keyword">int</span> window_len <span class="token operator">=</span> <span class="token number">0</span>

<span class="token keyword">while</span> <span class="token punctuation">(</span>right <span class="token operator">&lt;</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> nums<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 将滑动窗口右端点纳入窗口统计值</span>
    <span class="token comment">// nums[right]...</span>

    <span class="token comment">// 根据题目限制，从窗口左端点开始缩短窗口</span>
    <span class="token comment">// nums[left]...</span>
    <span class="token comment">// while (condition) { left++; }</span>

    <span class="token comment">// 统计窗口长度</span>
    <span class="token comment">// window_len = min / max (window_len, right - left + 1);</span>

    right<span class="token operator">++</span><span class="token punctuation">;</span> <span class="token comment">// 滑动窗口向右扩展</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7),o=[t];function l(p,c){return s(),a("div",null,o)}const r=n(i,[["render",l],["__file","Algorithm Sliding Window.html.vue"]]);export{r as default};
