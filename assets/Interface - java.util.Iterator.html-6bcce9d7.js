import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},o=e(`<h1 id="interface-java-util-iterator" tabindex="-1"><a class="header-anchor" href="#interface-java-util-iterator" aria-hidden="true">#</a> Interface - java.util.Iterator</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 05 22:58</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">E</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>集合迭代器的抽象接口。<code>Iterator</code> 和 <code>Enumeration</code> 的区别：迭代器允许调用者在迭代期间删除元素。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * An iterator over a collection.  <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Iterator</span></span></span><span class="token punctuation">}</span> takes the place of
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Enumeration</span></span><span class="token punctuation">}</span> in the Java Collections Framework.  Iterators
 * differ from enumerations in two ways:
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
 *      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> Iterators allow the caller to remove elements from the
 *           underlying collection during the iteration with well-defined
 *           semantics.
 *      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> Method names have been improved.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This interface is a member of the
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>{@docRoot}/../technotes/guides/collections/index.html<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
 * Java Collections Framework<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>.
 *
 * <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">&lt;</span>E<span class="token punctuation">&gt;</span></span> the type of elements returned by this iterator
 *
 * <span class="token keyword">@author</span>  Josh Bloch
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Collection</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">ListIterator</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Iterable</span></span>
 * <span class="token keyword">@since</span> 1.2
 */</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="has-next" tabindex="-1"><a class="header-anchor" href="#has-next" aria-hidden="true">#</a> Has Next</h2><p>返回迭代器是否还有更多元素。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the iteration has more elements.
 * (In other words, returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">next</span></span><span class="token punctuation">}</span> would
 * return an element rather than throwing an exception.)
 *
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if the iteration has more elements
 */</span>
<span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="next" tabindex="-1"><a class="header-anchor" href="#next" aria-hidden="true">#</a> Next</h2><p>返回迭代的下一个元素。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the next element in the iteration.
 *
 * <span class="token keyword">@return</span> the next element in the iteration
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NoSuchElementException</span></span> if the iteration has no more elements
 */</span>
<span class="token class-name">E</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="remove" tabindex="-1"><a class="header-anchor" href="#remove" aria-hidden="true">#</a> Remove</h2><p>删除底层集合中最后一个返回的元素。对于一个元素只能被调用一次，当底层集合被迭代过程中发生了修改，则行为不确定。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Removes from the underlying collection the last element returned
 * by this iterator (optional operation).  This method can be called
 * only once per call to <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">next</span></span><span class="token punctuation">}</span>.  The behavior of an iterator
 * is unspecified if the underlying collection is modified while the
 * iteration is in progress in any way other than by calling this
 * method.
 *
 * <span class="token keyword">@implSpec</span>
 * The default implementation throws an instance of
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span><span class="token punctuation">}</span> and performs no other action.
 *
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">UnsupportedOperationException</span></span> if the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">remove</span></span><span class="token punctuation">}</span>
 *         operation is not supported by this iterator
 *
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IllegalStateException</span></span> if the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">next</span></span><span class="token punctuation">}</span> method has not
 *         yet been called, or the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">remove</span></span><span class="token punctuation">}</span> method has already
 *         been called after the last call to the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">next</span></span><span class="token punctuation">}</span>
 *         method
 */</span>
<span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">UnsupportedOperationException</span><span class="token punctuation">(</span><span class="token string">&quot;remove&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="for-each" tabindex="-1"><a class="header-anchor" href="#for-each" aria-hidden="true">#</a> For Each</h2><p>给定一个操作，对每一个元素应用一次操作直到完成，或出现异常。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Performs the given action for each remaining element until all elements
 * have been processed or the action throws an exception.  Actions are
 * performed in the order of iteration, if that order is specified.
 * Exceptions thrown by the action are relayed to the caller.
 *
 * <span class="token keyword">@implSpec</span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The default implementation behaves as if:
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span><span class="token keyword">@code</span>
 <span class="token code-section">*     <span class="token code language-java"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
 *         <span class="token code language-java">action<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
 *</span> <span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token keyword">@param</span> <span class="token parameter">action</span> The action to be performed for each element
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the specified action is null
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">forEachRemaining</span><span class="token punctuation">(</span><span class="token class-name">Consumer</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span> <span class="token keyword">super</span> <span class="token class-name">E</span><span class="token punctuation">&gt;</span></span> action<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Objects</span><span class="token punctuation">.</span><span class="token function">requireNonNull</span><span class="token punctuation">(</span>action<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        action<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,21),c=[o];function p(i,l){return s(),a("div",null,c)}const u=n(t,[["render",p],["__file","Interface - java.util.Iterator.html.vue"]]);export{u as default};
