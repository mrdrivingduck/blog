import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},c=e(`<h1 id="interface-java-io-closeable" tabindex="-1"><a class="header-anchor" href="#interface-java-io-closeable" aria-hidden="true">#</a> Interface - java.io.Closeable</h1><p>Created by : Mr Dk.</p><p>2020 / 07 / 06 20:29</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>这个接口只定义了一个函数，用于释放对象持有的资源，比如打开的文件。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * A <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Closeable</span></span></span><span class="token punctuation">}</span> is a source or destination of data that can be closed.
 * The close method is invoked to release resources that the object is
 * holding (such as open files).
 *
 * <span class="token keyword">@since</span> 1.5
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Closeable</span> <span class="token keyword">extends</span> <span class="token class-name">AutoCloseable</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>以下函数用于所有相关的系统资源。如果一个流已经被关闭，那么重复调用这个函数没有作用。</p><p>对于可能在关闭过程中会出错的场合，需要格外注意。在抛出 <code>IOException</code> 之前，强烈推荐回收底层资源，并在内部标记该对象为已关闭。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Closes this stream and releases any system resources associated
 * with it. If the stream is already closed then invoking this
 * method has no effect.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> As noted in <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">AutoCloseable</span><span class="token punctuation">#</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span>, cases where the
 * close may fail require careful attention. It is strongly advised
 * to relinquish the underlying resources and to internally
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>em</span><span class="token punctuation">&gt;</span></span>mark<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>em</span><span class="token punctuation">&gt;</span></span> the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Closeable</span></span></span><span class="token punctuation">}</span> as closed, prior to throwing
 * the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">IOException</span></span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IOException</span></span> if an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,13),o=[c];function l(i,p){return s(),a("div",null,o)}const r=n(t,[["render",l],["__file","Interface - java.io.Closeable.html.vue"]]);export{r as default};
