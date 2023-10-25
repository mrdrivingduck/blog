import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},c=e(`<h1 id="_2-bytebuf" tabindex="-1"><a class="header-anchor" href="#_2-bytebuf" aria-hidden="true">#</a> 2 - ByteBuf</h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 13 20:31</p><p>Ningbo, Zhejiang, China</p><hr><p>网络数据的基本单位是字节。Java NIO 提供了 <code>ByteBuffer</code> 作为字节容器，但是使用起来较为繁琐。Netty 实现了 <code>ByteBuf</code>，为开发者提供了更好的 API。</p><h2 id="access" tabindex="-1"><a class="header-anchor" href="#access" aria-hidden="true">#</a> Access</h2><p>根据 <code>ByteBuf</code> 源代码中的注释，可以获知其工作原理。<code>ByteBuf</code> 是随机顺序访问的字节序列。</p><p><code>ByteBuf</code> 在底层支持顺序 / 随机访问。对于顺序访问，其内部维护的索引如注释中所示：</p><ul><li>读索引之前的字节是被使用丢弃后的字节</li><li>读索引与写索引之间是已被写入可以被读取的字节，在调用 <code>read</code> / <code>skip</code> 操作后读索引向前推进</li><li>写索引与容量之间是可以被写入的字节空间，在调用 <code>write</code> 操作后写索引向前推进</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code> +-------------------+------------------+------------------+
 | discardable bytes |  readable bytes  |  writable bytes  |
 |                   |     (CONTENT)    |                  |
 +-------------------+------------------+------------------+
 |                   |                  |                  |
 0      &lt;=      readerIndex   &lt;=   writerIndex    &lt;=    capacity
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于随机访问 (<code>get</code> / <code>set</code> 操作)，API 可以操作 buffer 中 <code>[0, capacity)</code> 范围内的任意字节，并且 <strong>不会对读写索引产生影响</strong>。</p><p>对于 buffer 最前面的可丢弃字节，可以进行重新回收利用，以最大化可写字节数。但是这个操作将会导致内存复制：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>BEFORE discardReadBytes()

    +-------------------+------------------+------------------+
    | discardable bytes |  readable bytes  |  writable bytes  |
    +-------------------+------------------+------------------+
    |                   |                  |                  |
    0      &lt;=      readerIndex   &lt;=   writerIndex    &lt;=    capacity

AFTER discardReadBytes()

    +------------------+--------------------------------------+
    |  readable bytes  |    writable bytes (got more space)   |
    +------------------+--------------------------------------+
    |                  |                                      |
readerIndex (0) &lt;= writerIndex (decreased)        &lt;=        capacity
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过将读写索引清零，可以清空 buffer：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>BEFORE clear()

    +-------------------+------------------+------------------+
    | discardable bytes |  readable bytes  |  writable bytes  |
    +-------------------+------------------+------------------+
    |                   |                  |                  |
    0      &lt;=      readerIndex   &lt;=   writerIndex    &lt;=    capacity

AFTER clear()

    +---------------------------------------------------------+
    |             writable bytes (got more space)             |
    +---------------------------------------------------------+
    |                                                         |
    0 = readerIndex = writerIndex            &lt;=            capacity
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过一个已有的 buffer 获取视图的方式包含两种：</p><ul><li>派生缓冲区 - 返回新的 <code>ByteBuf</code> 实例，里面有独立的读写索引，但是底层数组与原对象共享</li><li>复制缓冲区 - 返回现有 buffer 的真实副本 (通过 <code>copy()</code>)</li></ul><h2 id="references-count" tabindex="-1"><a class="header-anchor" href="#references-count" aria-hidden="true">#</a> References Count</h2><p>Netty 提供了显式提升或降低一个对象的被引用计数的能力。<code>io.netty.util.ReferenceCounted</code> 接口内维护了一个对象的引用计数，通常从 <code>1</code> 开始。当调用 <code>retain()</code> 函数时，对象的引用计数增加；当调用 <code>release()</code> 时，对象的引用计数减少。当对象的引用计数为 <code>0</code> 时，对象将被显式释放，不可再被访问。</p><p><code>ByteBuf</code> 也实现了 <code>ReferenceCounted</code> 接口。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * A reference-counted object that requires explicit deallocation.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * When a new <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReferenceCounted</span></span><span class="token punctuation">}</span> is instantiated, it starts with the reference count of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">1</span></span></span><span class="token punctuation">}</span>.
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">retain</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> increases the reference count, and <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> decreases the reference count.
 * If the reference count is decreased to <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span>, the object will be deallocated explicitly, and accessing
 * the deallocated object will usually result in an access violation.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * If an object that implements <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReferenceCounted</span></span><span class="token punctuation">}</span> is a container of other objects that implement
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ReferenceCounted</span></span><span class="token punctuation">}</span>, the contained objects will also be released via <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> when the container&#39;s
 * reference count becomes 0.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ReferenceCounted</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * Returns the reference count of this object.  If <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span>, it means this object has been deallocated.
     */</span>
    <span class="token keyword">int</span> <span class="token function">refCnt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Increases the reference count by <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">1</span></span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ReferenceCounted</span> <span class="token function">retain</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Increases the reference count by the specified <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">increment</span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ReferenceCounted</span> <span class="token function">retain</span><span class="token punctuation">(</span><span class="token keyword">int</span> increment<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Records the current access location of this object for debugging purposes.
     * If this object is determined to be leaked, the information recorded by this operation will be provided to you
     * via <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ResourceLeakDetector</span></span><span class="token punctuation">}</span>.  This method is a shortcut to <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token function">touch</span><span class="token punctuation">(</span><span class="token class-name">Object</span><span class="token punctuation">)</span></span> touch(null)<span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ReferenceCounted</span> <span class="token function">touch</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Records the current access location of this object with an additional arbitrary information for debugging
     * purposes.  If this object is determined to be leaked, the information recorded by this operation will be
     * provided to you via <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ResourceLeakDetector</span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ReferenceCounted</span> <span class="token function">touch</span><span class="token punctuation">(</span><span class="token class-name">Object</span> hint<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Decreases the reference count by <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">1</span></span></span><span class="token punctuation">}</span> and deallocates this object if the reference count reaches at
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if and only if the reference count became <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span> and this object has been deallocated
     */</span>
    <span class="token keyword">boolean</span> <span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Decreases the reference count by the specified <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">decrement</span></span><span class="token punctuation">}</span> and deallocates this object if the reference
     * count reaches at <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span>.
     *
     * <span class="token keyword">@return</span> <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if and only if the reference count became <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span> and this object has been deallocated
     */</span>
    <span class="token keyword">boolean</span> <span class="token function">release</span><span class="token punctuation">(</span><span class="token keyword">int</span> decrement<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="pooling" tabindex="-1"><a class="header-anchor" href="#pooling" aria-hidden="true">#</a> Pooling</h2><p><code>ByteBuf</code> 的创建支持 <strong>池化</strong> / <strong>非池化</strong>。Netty 通过 <code>io.netty.buffer.ByteBufAllocator</code> 接口实现 <code>ByteBuf</code> 的池化。<code>ByteBuf</code> 的类型包含以下几种：</p><ul><li>堆上 buffer - 底层将数据维护在 JVM 堆空间中的一个字节数组里</li><li>直接缓冲区 - 驻留在会被 GC 的常规堆内存外，分配和释放代价昂贵</li><li>组合缓冲区 - 为多个 <code>ByteBuf</code> 提供一个聚合视图，是将多个缓冲区表示为单个合并缓冲区的虚拟表示，消除了没必要的复制</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Implementations are responsible to allocate buffers. Implementations of this interface are expected to be
 * thread-safe.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ByteBufAllocator</span> <span class="token punctuation">{</span>

    <span class="token class-name">ByteBufAllocator</span> <span class="token constant">DEFAULT</span> <span class="token operator">=</span> <span class="token class-name">ByteBufUtil</span><span class="token punctuation">.</span><span class="token constant">DEFAULT_ALLOCATOR</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Allocate a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span>. If it is a direct or heap buffer
     * depends on the actual implementation.
     */</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Allocate a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span>, preferably a direct buffer which is suitable for I/O.
     */</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">ioBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">ioBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">ioBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Allocate a heap <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">heapBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">heapBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">heapBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Allocate a direct <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Allocate a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">CompositeByteBuf</span></span><span class="token punctuation">}</span>.
     * If it is a direct or heap buffer depends on the actual implementation.
     */</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> maxNumComponents<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeHeapBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeHeapBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> maxNumComponents<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeDirectBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">CompositeByteBuf</span> <span class="token function">compositeDirectBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> maxNumComponents<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Returns <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token boolean">true</span></span></span><span class="token punctuation">}</span> if direct <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span>&#39;s are pooled
     */</span>
    <span class="token keyword">boolean</span> <span class="token function">isDirectBufferPooled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * Calculate the new capacity of a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span> that is used when a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ByteBuf</span></span><span class="token punctuation">}</span> needs to expand by the
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">minNewCapacity</span></span><span class="token punctuation">}</span> with <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">maxCapacity</span></span><span class="token punctuation">}</span> as upper-bound.
     */</span>
    <span class="token keyword">int</span> <span class="token function">calculateNewCapacity</span><span class="token punctuation">(</span><span class="token keyword">int</span> minNewCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在具体的实现上，<code>ByteBufAllocator</code> 包含：</p><ul><li><code>PooledByteBufAllocator</code> 使用 <em>jemalloc</em> 的方法来高效地分配内存，最大程度地减少内存碎片</li><li><code>UnpooledByteBufAllocator</code> 的实现不池化 <code>ByteBuf</code> 实例，每次调用都返回一个新的 <code>ByteBuf</code> 实例</li></ul><p>在无法获得到一个 <code>ByteBufAllocator</code> 的引用时，通过 <code>io.netty.buffer.Unpooled</code> 工具类，内部使用一个 <code>UnpooledByteBufAllocator</code> 的实例，可以轻松分配非池化的不同类型的 <code>ByteBuf</code>：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">Unpooled</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">ByteBufAllocator</span> <span class="token constant">ALLOC</span> <span class="token operator">=</span> <span class="token class-name">UnpooledByteBufAllocator</span><span class="token punctuation">.</span><span class="token constant">DEFAULT</span><span class="token punctuation">;</span>

    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * Creates a new big-endian Java heap buffer with reasonably small initial capacity, which
     * expands its capacity boundlessly on demand.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token constant">ALLOC</span><span class="token punctuation">.</span><span class="token function">heapBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * Creates a new big-endian direct buffer with reasonably small initial capacity, which
     * expands its capacity boundlessly on demand.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token constant">ALLOC</span><span class="token punctuation">.</span><span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * Creates a new big-endian buffer which wraps the specified <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">array</span></span><span class="token punctuation">}</span>.
     * A modification on the specified array&#39;s content will be visible to the
     * returned buffer.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">ByteBuf</span> <span class="token function">wrappedBuffer</span><span class="token punctuation">(</span><span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> array<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>array<span class="token punctuation">.</span>length <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token constant">EMPTY_BUFFER</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">UnpooledHeapByteBuf</span><span class="token punctuation">(</span><span class="token constant">ALLOC</span><span class="token punctuation">,</span> array<span class="token punctuation">,</span> array<span class="token punctuation">.</span>length<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * Creates a new big-endian buffer whose content is a copy of the
     * specified <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">array</span></span><span class="token punctuation">}</span>.  The new buffer&#39;s <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">readerIndex</span></span><span class="token punctuation">}</span> and
     * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">writerIndex</span></span><span class="token punctuation">}</span> are <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token number">0</span></span></span><span class="token punctuation">}</span> and <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">array<span class="token punctuation">.</span>length</span></span><span class="token punctuation">}</span> respectively.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">ByteBuf</span> <span class="token function">copiedBuffer</span><span class="token punctuation">(</span><span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> array<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>array<span class="token punctuation">.</span>length <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token constant">EMPTY_BUFFER</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token function">wrappedBuffer</span><span class="token punctuation">(</span>array<span class="token punctuation">.</span><span class="token function">clone</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,30),p=[c];function o(i,l){return s(),a("div",null,p)}const d=n(t,[["render",o],["__file","2 - ByteBuf.html.vue"]]);export{d as default};
