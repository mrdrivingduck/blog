import{_ as s,c as a,a as e,o as t}from"./app-aVGbliEg.js";const p={};function l(i,n){return t(),a("div",null,n[0]||(n[0]=[e(`<h1 id="interface-java-util-iterator" tabindex="-1"><a class="header-anchor" href="#interface-java-util-iterator"><span>Interface - java.util.Iterator</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 05 22:58</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">E</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>集合迭代器的抽象接口。<code>Iterator</code> 和 <code>Enumeration</code> 的区别：迭代器允许调用者在迭代期间删除元素。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * An iterator over a collection.  <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Iterator</span></span></span><span class="token punctuation">}</span> takes the place of</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Enumeration</span></span><span class="token punctuation">}</span> in the Java Collections Framework.  Iterators</span>
<span class="line"> * differ from enumerations in two ways:</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> *      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> Iterators allow the caller to remove elements from the</span>
<span class="line"> *           underlying collection during the iteration with well-defined</span>
<span class="line"> *           semantics.</span>
<span class="line"> *      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> Method names have been improved.</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This interface is a member of the</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>{@docRoot}/../technotes/guides/collections/index.html<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * Java Collections Framework<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">&lt;</span>E<span class="token punctuation">&gt;</span></span> the type of elements returned by this iterator</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@author</span>  Josh Bloch</span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Collection</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">ListIterator</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Iterable</span></span></span>
<span class="line"> * <span class="token keyword">@since</span> 1.2</span>
<span class="line"> */</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="has-next" tabindex="-1"><a class="header-anchor" href="#has-next"><span>Has Next</span></a></h2><p>返回迭代器是否还有更多元素。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the iteration has more elements.</span>
<span class="line"> * (In other words, returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">next</span></span><span class="token punctuation">}</span> would</span>
<span class="line"> * return an element rather than throwing an exception.)</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the iteration has more elements</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="next" tabindex="-1"><a class="header-anchor" href="#next"><span>Next</span></a></h2><p>返回迭代的下一个元素。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Returns the next element in the iteration.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the next element in the iteration</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NoSuchElementException</span></span> if the iteration has no more elements</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">E</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="remove" tabindex="-1"><a class="header-anchor" href="#remove"><span>Remove</span></a></h2><p>删除底层集合中最后一个返回的元素。对于一个元素只能被调用一次，当底层集合被迭代过程中发生了修改，则行为不确定。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Removes from the underlying collection the last element returned</span>
<span class="line"> * by this iterator (optional operation).  This method can be called</span>
<span class="line"> * only once per call to <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">next</span></span><span class="token punctuation">}</span>.  The behavior of an iterator</span>
<span class="line"> * is unspecified if the underlying collection is modified while the</span>
<span class="line"> * iteration is in progress in any way other than by calling this</span>
<span class="line"> * method.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@implSpec</span></span>
<span class="line"> * The default implementation throws an instance of</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span><span class="token punctuation">}</span> and performs no other action.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span> if the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">remove</span></span><span class="token punctuation">}</span></span>
<span class="line"> *         operation is not supported by this iterator</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalStateException</span></span> if the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">next</span></span><span class="token punctuation">}</span> method has not</span>
<span class="line"> *         yet been called, or the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">remove</span></span><span class="token punctuation">}</span> method has already</span>
<span class="line"> *         been called after the last call to the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">next</span></span><span class="token punctuation">}</span></span>
<span class="line"> *         method</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">UnsupportedOperationException</span><span class="token punctuation">(</span><span class="token string">&quot;remove&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="for-each" tabindex="-1"><a class="header-anchor" href="#for-each"><span>For Each</span></a></h2><p>给定一个操作，对每一个元素应用一次操作直到完成，或出现异常。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Performs the given action for each remaining element until all elements</span>
<span class="line"> * have been processed or the action throws an exception.  Actions are</span>
<span class="line"> * performed in the order of iteration, if that order is specified.</span>
<span class="line"> * Exceptions thrown by the action are relayed to the caller.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@implSpec</span></span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The default implementation behaves as if:</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span><span class="token keyword">@code</span></span>
<span class="line"> <span class="token code-section">*     <span class="token code language-java"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span></span>
<span class="line"> *         <span class="token code language-java">action<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
<span class="line"> *</span> <span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">action</span> The action to be performed for each element</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the specified action is null</span>
<span class="line"> * <span class="token keyword">@since</span> 1.8</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">forEachRemaining</span><span class="token punctuation">(</span><span class="token class-name">Consumer</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span> <span class="token keyword">super</span> <span class="token class-name">E</span><span class="token punctuation">&gt;</span></span> action<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">Objects</span><span class="token punctuation">.</span><span class="token function">requireNonNull</span><span class="token punctuation">(</span>action<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        action<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,21)]))}const o=s(p,[["render",l],["__file","Interface - java.util.Iterator.html.vue"]]),r=JSON.parse('{"path":"/jdk-source-code-analysis/java.util/Interface%20-%20java.util.Iterator.html","title":"Interface - java.util.Iterator","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Has Next","slug":"has-next","link":"#has-next","children":[]},{"level":2,"title":"Next","slug":"next","link":"#next","children":[]},{"level":2,"title":"Remove","slug":"remove","link":"#remove","children":[]},{"level":2,"title":"For Each","slug":"for-each","link":"#for-each","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.util/Interface - java.util.Iterator.md"}');export{o as comp,r as data};