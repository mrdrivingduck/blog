import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const c={},t=e(`<h1 id="abstract-class-java-util-concurrent-locks-abstractownablesynchronizer" tabindex="-1"><a class="header-anchor" href="#abstract-class-java-util-concurrent-locks-abstractownablesynchronizer" aria-hidden="true">#</a> Abstract Class - java.util.concurrent.locks.AbstractOwnableSynchronizer</h1><p>Created by : Mr Dk.</p><p>2019 / 12 / 24 15:49</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>被线程互斥持有的 <strong>同步器</strong>。这个类中提供了创建锁以及锁持有者的信息的基类，由其子类维护这些信息，用于控制并监视锁的使用。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * A synchronizer that may be exclusively owned by a thread.  This
 * class provides a basis for creating locks and related synchronizers
 * that may entail a notion of ownership.  The
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbstractOwnableSynchronizer</span></span></span><span class="token punctuation">}</span> class itself does not manage or
 * use this information. However, subclasses and tools may use
 * appropriately maintained values to help control and monitor access
 * and provide diagnostics.
 *
 * <span class="token keyword">@since</span> 1.6
 * <span class="token keyword">@author</span> Doug Lea
 */</span>
<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">AbstractOwnableSynchronizer</span>
    <span class="token keyword">implements</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>
    
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/** Use serial ID even though all fields transient. */</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">3737899427754241961L</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Empty constructor for use by subclasses.
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">AbstractOwnableSynchronizer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>维护当前具有互斥访问资格的线程，并由以下两个函数修改该变量。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * The current owner of exclusive mode synchronization.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">transient</span> <span class="token class-name">Thread</span> exclusiveOwnerThread<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Sets the thread that currently owns exclusive access.
 * A <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> argument indicates that no thread owns access.
 * This method does not otherwise impose any synchronization or
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">volatile</span></span></span><span class="token punctuation">}</span> field accesses.
 * <span class="token keyword">@param</span> <span class="token parameter">thread</span> the owner thread
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">setExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> thread<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    exclusiveOwnerThread <span class="token operator">=</span> thread<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Returns the thread last set by <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">setExclusiveOwnerThread</span></span><span class="token punctuation">}</span>,
 * or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if never set.  This method does not otherwise
 * impose any synchronization or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">volatile</span></span></span><span class="token punctuation">}</span> field accesses.
 * <span class="token keyword">@return</span> the owner thread
 */</span>
<span class="token keyword">protected</span> <span class="token keyword">final</span> <span class="token class-name">Thread</span> <span class="token function">getExclusiveOwnerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> exclusiveOwnerThread<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,12),o=[t];function i(l,p){return s(),a("div",null,o)}const d=n(c,[["render",i],["__file","Abstract Class - java.util.concurrent.locks.AbstractOwnableSynchronizer.html.vue"]]);export{d as default};
