import{_ as n,o as a,c as s,e}from"./app-25fa875f.js";const t={},c=e(`<h1 id="class-java-lang-threadlocal" tabindex="-1"><a class="header-anchor" href="#class-java-lang-threadlocal" aria-hidden="true">#</a> Class - java.lang.ThreadLocal</h1><p>Created by : Mr Dk.</p><p>2020 / 11 / 10 15:15</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>这个类提供了线程局部变量，每个线程能够通过 <code>get()</code> 或 <code>set()</code> 访问其内部独立的变量。因此，这个类可以用于保存私有、静态的与线程相关的状态变量。每个线程持有对变量的隐式引用，在线程结束后，所有引用的线程局部变量将会被主动 GC，除非这些变量还被额外引用。</p><blockquote><p>该类存在的意义。比如线程会从数据库连接池获取连接，并执行事务。对一个线程来说，如果每次取得的数据库连接不是同一个，将无法执行事务。通过 <code>ThreadLocal</code> 对象，线程可以把同一个数据库连接保存到线程局部变量中，这样可以保证每次取得的是同一个数据库连接。</p></blockquote><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * This class provides thread-local variables.  These variables differ from
 * their normal counterparts in that each thread that accesses one (via its
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">get</span></span><span class="token punctuation">}</span> or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">set</span></span><span class="token punctuation">}</span> method) has its own, independently initialized
 * copy of the variable.  <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ThreadLocal</span></span></span><span class="token punctuation">}</span> instances are typically private
 * static fields in classes that wish to associate state with a thread (e.g.,
 * a user ID or Transaction ID).
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>For example, the class below generates unique identifiers local to each
 * thread.
 * A thread&#39;s id is assigned the first time it invokes <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ThreadId</span><span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span>
 * and remains unchanged on subsequent calls.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span>
 <span class="token code-section">* <span class="token line"><span class="token code language-java"><span class="token keyword">import</span> <span class="token import"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span>concurrent<span class="token punctuation">.</span>atomic<span class="token punctuation">.</span></span><span class="token class-name">AtomicInteger</span></span><span class="token punctuation">;</span></span></span>
 *
 * <span class="token line"><span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ThreadId</span> <span class="token punctuation">{</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token comment">// Atomic integer containing the next thread ID to be assigned</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">AtomicInteger</span> nextId <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AtomicInteger</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *
 *     <span class="token line"><span class="token code language-java"><span class="token comment">// Thread local variable containing each thread&#39;s ID</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">ThreadLocal</span></span><span class="token entity named-entity" title="&lt;">&amp;lt;</span><span class="token code language-java"><span class="token class-name">Integer</span></span><span class="token entity named-entity" title="&gt;">&amp;gt;</span><span class="token code language-java"> threadId <span class="token operator">=</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token keyword">new</span> <span class="token class-name">ThreadLocal</span></span><span class="token entity named-entity" title="&lt;">&amp;lt;</span><span class="token code language-java"><span class="token class-name">Integer</span></span><span class="token entity named-entity" title="&gt;">&amp;gt;</span><span class="token code language-java"><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *             <span class="token line"><span class="token entity" title="@">&amp;#64;</span><span class="token code language-java"><span class="token class-name">Override</span> <span class="token keyword">protected</span> <span class="token class-name">Integer</span> <span class="token function">initialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *                 <span class="token line"><span class="token code language-java"><span class="token keyword">return</span> nextId<span class="token punctuation">.</span><span class="token function">getAndIncrement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span><span class="token punctuation">;</span></span></span>
 *
 *     <span class="token line"><span class="token code language-java"><span class="token comment">// Returns the current thread&#39;s unique ID, assigning it if necessary</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span></span>
 *         <span class="token line"><span class="token code language-java"><span class="token keyword">return</span> threadId<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *     <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 * <span class="token line"><span class="token code language-java"><span class="token punctuation">}</span></span></span>
 *</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Each thread holds an implicit reference to its copy of a thread-local
 * variable as long as the thread is alive and the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ThreadLocal</span></span></span><span class="token punctuation">}</span>
 * instance is accessible; after a thread goes away, all of its copies of
 * thread-local instances are subject to garbage collection (unless other
 * references to these copies exist).
 *
 * <span class="token keyword">@author</span>  Josh Bloch and Doug Lea
 * <span class="token keyword">@since</span>   1.2
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="fields" tabindex="-1"><a class="header-anchor" href="#fields" aria-hidden="true">#</a> Fields</h2><p>在每一个线程对象 <code>Thread</code> 中，维护着一个 <code>ThreadLocalMap</code>，即与每个线程关联的线性探测 hash map - 其中，<code>ThreadLocal</code> 对象是这个 hash map 的 key，以 <code>threadLocalHashCode</code> 作为 hash 值。在大部分场合中，由于 <code>ThreadLocal</code> 对象会被连续创建，这个 hash code 用于消除碰撞；但同时在较为少见的场合中也表现良好。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * ThreadLocals rely on per-thread linear-probe hash maps attached
 * to each thread (Thread.threadLocals and
 * inheritableThreadLocals).  The ThreadLocal objects act as keys,
 * searched via threadLocalHashCode.  This is a custom hash code
 * (useful only within ThreadLocalMaps) that eliminates collisions
 * in the common case where consecutively constructed ThreadLocals
 * are used by the same threads, while remaining well-behaved in
 * less common cases.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">int</span> threadLocalHashCode <span class="token operator">=</span> <span class="token function">nextHashCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * The next hash code to be given out. Updated atomically. Starts at
 * zero.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">AtomicInteger</span> nextHashCode <span class="token operator">=</span>
    <span class="token keyword">new</span> <span class="token class-name">AtomicInteger</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * The difference between successively generated hash codes - turns
 * implicit sequential thread-local IDs into near-optimally spread
 * multiplicative hash values for power-of-two-sized tables.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">HASH_INCREMENT</span> <span class="token operator">=</span> <span class="token number">0x61c88647</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Returns the next hash code.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">nextHashCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> nextHashCode<span class="token punctuation">.</span><span class="token function">getAndAdd</span><span class="token punctuation">(</span><span class="token constant">HASH_INCREMENT</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="set" tabindex="-1"><a class="header-anchor" href="#set" aria-hidden="true">#</a> Set</h2><p>将一个特定的值赋值到当前线程的局部变量中。首先取得当前的线程对象，然后取得线程对象中的 <code>ThreadLocalMap</code>。如果不为空，就以当前 <code>ThreadLocal</code> 对象作为 key 设置到 map 中；如果为空，那么就先建立 map 再赋值。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Sets the current thread&#39;s copy of this thread-local variable
 * to the specified value.  Most subclasses will have no need to
 * override this method, relying solely on the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">initialValue</span></span><span class="token punctuation">}</span>
 * method to set the values of thread-locals.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">value</span> the value to be stored in the current thread&#39;s copy of
 *        this thread-local.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">set</span><span class="token punctuation">(</span><span class="token class-name">T</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> t <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ThreadLocalMap</span> map <span class="token operator">=</span> <span class="token function">getMap</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        map<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        <span class="token function">createMap</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过线程对象获得 map 的函数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Get the map associated with a ThreadLocal. Overridden in
 * InheritableThreadLocal.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">t</span> the current thread
 * <span class="token keyword">@return</span> the map
 */</span>
<span class="token class-name">ThreadLocalMap</span> <span class="token function">getMap</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> t<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> t<span class="token punctuation">.</span>threadLocals<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Map 本身是懒创建的，只有第一次调用 <code>set()</code> 时才会创建：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Create the map associated with a ThreadLocal. Overridden in
 * InheritableThreadLocal.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">t</span> the current thread
 * <span class="token keyword">@param</span> <span class="token parameter">firstValue</span> value for the initial entry of the map
 */</span>
<span class="token keyword">void</span> <span class="token function">createMap</span><span class="token punctuation">(</span><span class="token class-name">Thread</span> t<span class="token punctuation">,</span> <span class="token class-name">T</span> firstValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    t<span class="token punctuation">.</span>threadLocals <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ThreadLocalMap</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> firstValue<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="get" tabindex="-1"><a class="header-anchor" href="#get" aria-hidden="true">#</a> Get</h2><p>从当前线程的 <code>ThreadLocalMap</code> 中取得局部变量。通过当前线程的线程对象，取得 <code>ThreadLocalMap</code>。如果 map 不为空，则以当前 <code>ThreadLocal</code> 对象为 key 取出相应的值；如果 map 为空，那么先创建一个 map，然后在 map 中设置默认的初始值 (<code>null</code>)。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the value in the current thread&#39;s copy of this
 * thread-local variable.  If the variable has no value for the
 * current thread, it is first initialized to the value returned
 * by an invocation of the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">initialValue</span></span><span class="token punctuation">}</span> method.
 *
 * <span class="token keyword">@return</span> the current thread&#39;s value of this thread-local
 */</span>
<span class="token keyword">public</span> <span class="token class-name">T</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> t <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ThreadLocalMap</span> map <span class="token operator">=</span> <span class="token function">getMap</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ThreadLocalMap<span class="token punctuation">.</span>Entry</span> e <span class="token operator">=</span> map<span class="token punctuation">.</span><span class="token function">getEntry</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>e <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token annotation punctuation">@SuppressWarnings</span><span class="token punctuation">(</span><span class="token string">&quot;unchecked&quot;</span><span class="token punctuation">)</span>
            <span class="token class-name">T</span> result <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">T</span><span class="token punctuation">)</span>e<span class="token punctuation">.</span>value<span class="token punctuation">;</span>
            <span class="token keyword">return</span> result<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token function">setInitialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Variant of set() to establish initialValue. Used instead
 * of set() in case user has overridden the set() method.
 *
 * <span class="token keyword">@return</span> the initial value
 */</span>
<span class="token keyword">private</span> <span class="token class-name">T</span> <span class="token function">setInitialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">T</span> value <span class="token operator">=</span> <span class="token function">initialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">Thread</span> t <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ThreadLocalMap</span> map <span class="token operator">=</span> <span class="token function">getMap</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        map<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        <span class="token function">createMap</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> value<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the current thread&#39;s &quot;initial value&quot; for this
 * thread-local variable.  This method will be invoked the first
 * time a thread accesses the variable with the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">get</span></span><span class="token punctuation">}</span>
 * method, unless the thread previously invoked the <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">set</span></span><span class="token punctuation">}</span>
 * method, in which case the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">initialValue</span></span><span class="token punctuation">}</span> method will not
 * be invoked for the thread.  Normally, this method is invoked at
 * most once per thread, but it may be invoked again in case of
 * subsequent invocations of <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">remove</span></span><span class="token punctuation">}</span> followed by <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">get</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>This implementation simply returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span>; if the
 * programmer desires thread-local variables to have an initial
 * value other than <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span>, <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">ThreadLocal</span></span></span><span class="token punctuation">}</span> must be
 * subclassed, and this method overridden.  Typically, an
 * anonymous inner class will be used.
 *
 * <span class="token keyword">@return</span> the initial value for this thread-local
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">T</span> <span class="token function">initialValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="remove" tabindex="-1"><a class="header-anchor" href="#remove" aria-hidden="true">#</a> Remove</h2><p>通过当前线程的 <code>Thread</code> 对象取得 <code>ThreadLocalMap</code>，然后以当前 <code>ThreadLocal</code> 对象为 key 移除 map 中的值：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Removes the current thread&#39;s value for this thread-local
 * variable.  If this thread-local variable is subsequently
 * <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">get</span></span> read<span class="token punctuation">}</span> by the current thread, its value will be
 * reinitialized by invoking its <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">initialValue</span></span><span class="token punctuation">}</span> method,
 * unless its value is <span class="token punctuation">{</span><span class="token keyword">@linkplain</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">set</span></span> set<span class="token punctuation">}</span> by the current thread
 * in the interim.  This may result in multiple invocations of the
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">initialValue</span></span><span class="token punctuation">}</span> method in the current thread.
 *
 * <span class="token keyword">@since</span> 1.5
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">ThreadLocalMap</span> m <span class="token operator">=</span> <span class="token function">getMap</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>m <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        m<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="thread-local-map" tabindex="-1"><a class="header-anchor" href="#thread-local-map" aria-hidden="true">#</a> Thread Local Map</h2><p>这个 map 被定义在 <code>ThreadLocal</code> 类内，不会被外部类使用。</p><p>其中有一个显著的特点是：该 map 的 key 是 <strong>弱引用</strong> 类型的。也就是说，当程序中没有其它 <strong>强引用</strong> 指向堆上的 <code>ThreadLocal</code> 对象时，<code>ThreadLocalMap</code> 中的 <code>ThreadLocal</code> 引用将会被 GC。如果这里是强引用，那么 <code>ThreadLocal</code> 对象将会一直随线程存在 (可能存在内存泄漏，假设这是一个长期运行的后台线程)，哪怕程序中已经不存在任何对 <code>ThreadLocal</code> 对象的引用。</p><p>注意，就算 map 内弱引用指向的 <code>ThreadLocal</code> 对象已经被 GC，相应的 value 实际上并没有被 GC (因为 map 还持有对 value 对象的引用)，而此时已经没有引用可以访问到这个 value 了，久而久之，这些无法被引用的 value 会产生内存泄漏。因此，如果 <code>ThreadLocal</code> 对象不用了，需要调用 <code>ThreadLocal</code> 的 <code>remove()</code> 函数将 value 的引用从 map 中移除，这样 value 对应的内存也会被 GC。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * ThreadLocalMap is a customized hash map suitable only for
 * maintaining thread local values. No operations are exported
 * outside of the ThreadLocal class. The class is package private to
 * allow declaration of fields in class Thread.  To help deal with
 * very large and long-lived usages, the hash table entries use
 * WeakReferences for keys. However, since reference queues are not
 * used, stale entries are guaranteed to be removed only when
 * the table starts running out of space.
 */</span>
<span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">ThreadLocalMap</span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * The entries in this hash map extend WeakReference, using
     * its main ref field as the key (which is always a
     * ThreadLocal object).  Note that null keys (i.e. entry.get()
     * == null) mean that the key is no longer referenced, so the
     * entry can be expunged from table.  Such entries are referred to
     * as &quot;stale entries&quot; in the code that follows.
     */</span>
    <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Entry</span> <span class="token keyword">extends</span> <span class="token class-name">WeakReference</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ThreadLocal</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
        <span class="token doc-comment comment">/** The value associated with this ThreadLocal. */</span>
        <span class="token class-name">Object</span> value<span class="token punctuation">;</span>

        <span class="token class-name">Entry</span><span class="token punctuation">(</span><span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> k<span class="token punctuation">,</span> <span class="token class-name">Object</span> v<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">super</span><span class="token punctuation">(</span>k<span class="token punctuation">)</span><span class="token punctuation">;</span>
            value <span class="token operator">=</span> v<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * The initial capacity -- MUST be a power of two.
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">INITIAL_CAPACITY</span> <span class="token operator">=</span> <span class="token number">16</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * The table, resized as necessary.
     * table.length MUST always be a power of two.
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Entry</span><span class="token punctuation">[</span><span class="token punctuation">]</span> table<span class="token punctuation">;</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,35),p=[c];function l(o,i){return a(),s("div",null,p)}const u=n(t,[["render",l],["__file","Class - java.lang.ThreadLocal.html.vue"]]);export{u as default};
