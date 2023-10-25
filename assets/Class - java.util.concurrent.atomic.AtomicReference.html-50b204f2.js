import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="class-java-util-concurrent-atomic-atomicreference" tabindex="-1"><a class="header-anchor" href="#class-java-util-concurrent-atomic-atomicreference" aria-hidden="true">#</a> Class - java.util.concurrent.atomic.AtomicReference</h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 24 22:50</p><p>Nanjing, Jiangsu, China</p><hr><p>通过 CAS 操作维护一个引用。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * An object reference that may be updated atomically. See the <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * java.util.concurrent.atomic<span class="token punctuation">}</span> package specification for description
 * of the properties of atomic variables.
 * <span class="token keyword">@since</span> 1.5
 * <span class="token keyword">@author</span> Doug Lea
 * <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">&lt;</span>V<span class="token punctuation">&gt;</span></span> The type of object referred to by this reference
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AtomicReference</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">implements</span> <span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span>Serializable</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="internal" tabindex="-1"><a class="header-anchor" href="#internal" aria-hidden="true">#</a> Internal</h2><p>内部维护了用于调用 CAS 操作的 <code>Unsafe</code> 类，和对象引用的具体信息在对象内存中的偏移。这个偏移会在类加载时被计算出来并保存。另外类中维护了一个 <code>volatile</code> 修饰的对象引用，引用类型为泛型。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1848883965231344442L</span><span class="token punctuation">;</span>

<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Unsafe</span> unsafe <span class="token operator">=</span> <span class="token class-name">Unsafe</span><span class="token punctuation">.</span><span class="token function">getUnsafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> valueOffset<span class="token punctuation">;</span>

<span class="token keyword">static</span> <span class="token punctuation">{</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        valueOffset <span class="token operator">=</span> unsafe<span class="token punctuation">.</span>objectFieldOffset
            <span class="token punctuation">(</span><span class="token class-name">AtomicReference</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">.</span><span class="token function">getDeclaredField</span><span class="token punctuation">(</span><span class="token string">&quot;value&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Exception</span> ex<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>ex<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token class-name">V</span> value<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> Constructor</h2><p>构造函数很直接，传入一个 <code>V</code> 对象的引用并赋值到 <code>value</code>；或直接建立一个空的对象引用 (<code>null</code>)：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Creates a new AtomicReference with the given initial value.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">initialValue</span> the initial value
 */</span>
<span class="token keyword">public</span> <span class="token class-name">AtomicReference</span><span class="token punctuation">(</span><span class="token class-name">V</span> initialValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    value <span class="token operator">=</span> initialValue<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates a new AtomicReference with null initial value.
 */</span>
<span class="token keyword">public</span> <span class="token class-name">AtomicReference</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="getter-and-setter" tabindex="-1"><a class="header-anchor" href="#getter-and-setter" aria-hidden="true">#</a> Getter and Setter</h2><p>由于 <code>value</code> 由 <code>volatile</code> 关键字修饰，因此以下操作会保证线程可见性：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Gets the current value.
 *
 * <span class="token keyword">@return</span> the current value
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> value<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Sets to the given value.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">newValue</span> the new value
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">set</span><span class="token punctuation">(</span><span class="token class-name">V</span> newValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    value <span class="token operator">=</span> newValue<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>保证线程可见性需要插入内存屏障指令，损失了一定性能。如果不需要保证线程可见性，那么就可以调用以下函数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Eventually sets to the given value.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">newValue</span> the new value
 * <span class="token keyword">@since</span> 1.6
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">lazySet</span><span class="token punctuation">(</span><span class="token class-name">V</span> newValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    unsafe<span class="token punctuation">.</span><span class="token function">putOrderedObject</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> valueOffset<span class="token punctuation">,</span> newValue<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="cas" tabindex="-1"><a class="header-anchor" href="#cas" aria-hidden="true">#</a> CAS</h2><p>通过 CAS 操作试图将一个更新后的对象引用更新到 <code>value</code> 中。只有保证 <code>value</code> 原有的对象引用与期望中的对象引用相等，CAS 操作才能成功。成功与否通过返回值体现。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Atomically sets the value to the given updated value
 * if the current value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token operator">==</span></span></span><span class="token punctuation">}</span> the expected value.
 * <span class="token keyword">@param</span> <span class="token parameter">expect</span> the expected value
 * <span class="token keyword">@param</span> <span class="token parameter">update</span> the new value
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if successful. False return indicates that
 * the actual value was not equal to the expected value.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">compareAndSet</span><span class="token punctuation">(</span><span class="token class-name">V</span> expect<span class="token punctuation">,</span> <span class="token class-name">V</span> update<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> unsafe<span class="token punctuation">.</span><span class="token function">compareAndSwapObject</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> valueOffset<span class="token punctuation">,</span> expect<span class="token punctuation">,</span> update<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Atomically sets the value to the given updated value
 * if the current value <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token operator">==</span></span></span><span class="token punctuation">}</span> the expected value.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>package-summary.html#weakCompareAndSet<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>May fail
 * spuriously and does not provide ordering guarantees<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>, so is
 * only rarely an appropriate alternative to <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">compareAndSet</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">expect</span> the expected value
 * <span class="token keyword">@param</span> <span class="token parameter">update</span> the new value
 * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if successful
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">boolean</span> <span class="token function">weakCompareAndSet</span><span class="token punctuation">(</span><span class="token class-name">V</span> expect<span class="token punctuation">,</span> <span class="token class-name">V</span> update<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> unsafe<span class="token punctuation">.</span><span class="token function">compareAndSwapObject</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> valueOffset<span class="token punctuation">,</span> expect<span class="token punctuation">,</span> update<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="operation" tabindex="-1"><a class="header-anchor" href="#operation" aria-hidden="true">#</a> Operation</h2><p>以下操作原子地把旧值取出来，把新值放进去。与上面 CAS 的区别在于，这个操作肯定会成功，且返回值就是对象引用：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Atomically sets to the given value and returns the old value.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">newValue</span> the new value
 * <span class="token keyword">@return</span> the previous value
 */</span>
<span class="token annotation punctuation">@SuppressWarnings</span><span class="token punctuation">(</span><span class="token string">&quot;unchecked&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">getAndSet</span><span class="token punctuation">(</span><span class="token class-name">V</span> newValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token class-name">V</span><span class="token punctuation">)</span>unsafe<span class="token punctuation">.</span><span class="token function">getAndSetObject</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> valueOffset<span class="token punctuation">,</span> newValue<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面就是类似 <code>i++</code> 和 <code>++i</code> 的抽象版本了。支持一个一元运算符，对 <code>value</code> 进行原子地更新：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Atomically updates the current value with the results of
 * applying the given function, returning the previous value. The
 * function should be side-effect-free, since it may be re-applied
 * when attempted updates fail due to contention among threads.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">updateFunction</span> a side-effect-free function
 * <span class="token keyword">@return</span> the previous value
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">getAndUpdate</span><span class="token punctuation">(</span><span class="token class-name">UnaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> updateFunction<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">V</span> prev<span class="token punctuation">,</span> next<span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        prev <span class="token operator">=</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        next <span class="token operator">=</span> updateFunction<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>prev<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSet</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> next<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> prev<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Atomically updates the current value with the results of
 * applying the given function, returning the updated value. The
 * function should be side-effect-free, since it may be re-applied
 * when attempted updates fail due to contention among threads.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">updateFunction</span> a side-effect-free function
 * <span class="token keyword">@return</span> the updated value
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">updateAndGet</span><span class="token punctuation">(</span><span class="token class-name">UnaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> updateFunction<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">V</span> prev<span class="token punctuation">,</span> next<span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        prev <span class="token operator">=</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        next <span class="token operator">=</span> updateFunction<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>prev<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSet</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> next<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> next<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对二元运算符的支持：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Atomically updates the current value with the results of
 * applying the given function to the current and given values,
 * returning the previous value. The function should be
 * side-effect-free, since it may be re-applied when attempted
 * updates fail due to contention among threads.  The function
 * is applied with the current value as its first argument,
 * and the given update as the second argument.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">x</span> the update value
 * <span class="token keyword">@param</span> <span class="token parameter">accumulatorFunction</span> a side-effect-free function of two arguments
 * <span class="token keyword">@return</span> the previous value
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">getAndAccumulate</span><span class="token punctuation">(</span><span class="token class-name">V</span> x<span class="token punctuation">,</span>
                                <span class="token class-name">BinaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> accumulatorFunction<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">V</span> prev<span class="token punctuation">,</span> next<span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        prev <span class="token operator">=</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        next <span class="token operator">=</span> accumulatorFunction<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> x<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSet</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> next<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> prev<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Atomically updates the current value with the results of
 * applying the given function to the current and given values,
 * returning the updated value. The function should be
 * side-effect-free, since it may be re-applied when attempted
 * updates fail due to contention among threads.  The function
 * is applied with the current value as its first argument,
 * and the given update as the second argument.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">x</span> the update value
 * <span class="token keyword">@param</span> <span class="token parameter">accumulatorFunction</span> a side-effect-free function of two arguments
 * <span class="token keyword">@return</span> the updated value
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">V</span> <span class="token function">accumulateAndGet</span><span class="token punctuation">(</span><span class="token class-name">V</span> x<span class="token punctuation">,</span>
                                <span class="token class-name">BinaryOperator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> accumulatorFunction<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">V</span> prev<span class="token punctuation">,</span> next<span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        prev <span class="token operator">=</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        next <span class="token operator">=</span> accumulatorFunction<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> x<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">compareAndSet</span><span class="token punctuation">(</span>prev<span class="token punctuation">,</span> next<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> next<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="serialization" tabindex="-1"><a class="header-anchor" href="#serialization" aria-hidden="true">#</a> Serialization</h2><p>将内部维护的 <code>V</code> 对象序列化为字符串：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the String representation of the current value.
 * <span class="token keyword">@return</span> the String representation of the current value
 */</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,38),c=[p];function l(o,i){return s(),a("div",null,c)}const d=n(t,[["render",l],["__file","Class - java.util.concurrent.atomic.AtomicReference.html.vue"]]);export{d as default};
