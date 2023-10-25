import{_ as t,r as p,o,c,a as s,b as n,d as l,e as a}from"./app-25fa875f.js";const i={},u=a(`<h1 id="class-java-io-bufferedreader" tabindex="-1"><a class="header-anchor" href="#class-java-io-bufferedreader" aria-hidden="true">#</a> Class - java.io.BufferedReader</h1><p>Created by : Mr Dk.</p><p>2020 / 10 / 11 15:41</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>与 <code>java.io.BufferedInputStream</code> 功能类似，将输入来源中的数据存放在一个 buffer 中。当 buffer 中的数据被读完时，再从输入来源中继续读取。区别在于 buffer 的数据类型不同，一个是 <code>byte[]</code>，一个是 <code>char[]</code>。这个类的用于主要在于提升性能，推荐作为一些慢速 Reader 的外层封装，比如可以封装在 FileReader 外面：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">BufferedReader</span> in <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">BufferedReader</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">FileReader</span><span class="token punctuation">(</span><span class="token string">&quot;foo.in&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这样，调用 <code>read()</code> 时，BufferedReader 会一次读取大量数据到 buffer 中，性能上会比 FileReader 每次读取一小部分要更好 (多次 I/O)。Buffer 的大小用户可以自行设置。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads text from a character-input stream, buffering characters so as to
 * provide for the efficient reading of characters, arrays, and lines.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> The buffer size may be specified, or the default size may be used.  The
 * default is large enough for most purposes.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> In general, each read request made of a Reader causes a corresponding
 * read request to be made of the underlying character or byte stream.  It is
 * therefore advisable to wrap a BufferedReader around any Reader whose read()
 * operations may be costly, such as FileReaders and InputStreamReaders.  For
 * example,
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span>
 <span class="token code-section">* <span class="token line"><span class="token code language-java"><span class="token class-name">BufferedReader</span> in</span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">BufferedReader</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">FileReader</span><span class="token punctuation">(</span><span class="token string">&quot;foo.in&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * will buffer the input from the specified file.  Without buffering, each
 * invocation of read() or readLine() could cause bytes to be read from the
 * file, converted into characters, and then returned, which can be very
 * inefficient.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Programs that use DataInputStreams for textual input can be localized by
 * replacing each DataInputStream with an appropriate BufferedReader.
 *
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">FileReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">InputStreamReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>file<span class="token punctuation">.</span></span><span class="token class-name">Files</span><span class="token punctuation">#</span><span class="token field">newBufferedReader</span></span>
 *
 * <span class="token keyword">@author</span>      Mark Reinhold
 * <span class="token keyword">@since</span>       JDK1.1
 */</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BufferedReader</span> <span class="token keyword">extends</span> <span class="token class-name">Reader</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，与上述特性相关的内部成员变量：</p><ul><li><code>in</code> 负责维护输入来源 (底层是 InputStream)</li><li><code>cb</code> 数组就是 buffer</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token class-name">Reader</span> in<span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">char</span> cb<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>以下成员变量用于处理不同操作系统平台对于换行符处理的差异：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/** If the next character is a line feed, skip it */</span>
<span class="token keyword">private</span> <span class="token keyword">boolean</span> skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> Constructor</h2><p>构造函数的目的显而易见：</p><ul><li>将输入来源维护在对象内</li><li>初始化 buffer 数组至指定长度 (如果用户未指定，则使用默认长度 8192)</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> defaultCharBufferSize <span class="token operator">=</span> <span class="token number">8192</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Creates a buffering character-input stream that uses an input buffer of
 * the specified size.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>   A Reader
 * <span class="token keyword">@param</span>  <span class="token parameter">sz</span>   Input-buffer size
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span>  If <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">sz <span class="token operator">&lt;=</span> <span class="token number">0</span></span></span><span class="token punctuation">}</span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">BufferedReader</span><span class="token punctuation">(</span><span class="token class-name">Reader</span> in<span class="token punctuation">,</span> <span class="token keyword">int</span> sz<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>sz <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;Buffer size &lt;= 0&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>in <span class="token operator">=</span> in<span class="token punctuation">;</span>
    cb <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>sz<span class="token punctuation">]</span><span class="token punctuation">;</span>
    nextChar <span class="token operator">=</span> nChars <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates a buffering character-input stream that uses a default-sized
 * input buffer.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>   A Reader
 */</span>
<span class="token keyword">public</span> <span class="token class-name">BufferedReader</span><span class="token punctuation">(</span><span class="token class-name">Reader</span> in<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">(</span>in<span class="token punctuation">,</span> defaultCharBufferSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="fill" tabindex="-1"><a class="header-anchor" href="#fill" aria-hidden="true">#</a> Fill</h2><p>这个函数用于填充 buffer，当 buffer 中的字符已经不够读取时被调用。填充 buffer 的方法显而易见：从输入来源中调用 <code>read()</code> 即可。当然，需要根据当前对象是否启用了 mark 功能，以及 buffer 中的剩余空间，来决定从输入来源中读取的字节数。</p><p>其中，<code>dst</code> 变量指示了从输入流中读取字符后，存放到 buffer 中的位置；<code>nextChar</code> 指示下一个从当前 Reader 中被读取出的字符，<code>nChars</code> 指代 buffer 中最后一个有效字节的位置。如果当前 Reader 没有启用 mark，那么 buffer 中原有的内容已经全部被读取完毕，新读入的字符可以直接从 buffer 的头部开始存放，因此 <code>dst</code> 是 <code>0</code>。否则，至少需要保留从 <code>markedChar</code> 开始的字符。</p><p>如果说需要保留的字符已经超出了 <code>readAheadLimit</code>，那么 mark 就相当于作废了，也就是说 buffer 已经无法做到在保留原有 mark 字符的同时读取新的字符。如果没有超出 <code>readAheadLimit</code>，那么再判断这个值有没有超出 buffer 的长度：</p><ul><li>如果没有超出，那么将 mark 位置开始的所有字符搬运到 buffer 开头，相当于丢弃 mark 位置之前的所有字符</li><li>如果超出，那么重新分配 buffer 数组，使其长度符合 <code>readAheadLimit</code>，然后再将 mark 位置开始的所有字符搬运到 buffer 开头</li></ul><p>把原有的字符搬到 buffer 开头后，之后空出的位置就可以用于存放调用 <code>read()</code> 从输入流中获得的字符。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">INVALIDATED</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">2</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">UNMARKED</span> <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">int</span> markedChar <span class="token operator">=</span> <span class="token constant">UNMARKED</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">int</span> readAheadLimit <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> <span class="token comment">/* Valid only when markedChar &gt; 0 */</span>

<span class="token doc-comment comment">/**
 * Fills the input buffer, taking the mark into account if it is valid.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> dst<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>markedChar <span class="token operator">&lt;=</span> <span class="token constant">UNMARKED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* No mark */</span>
        dst <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">/* Marked */</span>
        <span class="token keyword">int</span> delta <span class="token operator">=</span> nextChar <span class="token operator">-</span> markedChar<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>delta <span class="token operator">&gt;=</span> readAheadLimit<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">/* Gone past read-ahead limit: Invalidate mark */</span>
            markedChar <span class="token operator">=</span> <span class="token constant">INVALIDATED</span><span class="token punctuation">;</span>
            readAheadLimit <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            dst <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>readAheadLimit <span class="token operator">&lt;=</span> cb<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">/* Shuffle in the current buffer */</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">arraycopy</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> markedChar<span class="token punctuation">,</span> cb<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> delta<span class="token punctuation">)</span><span class="token punctuation">;</span>
                markedChar <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
                dst <span class="token operator">=</span> delta<span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">/* Reallocate buffer to accommodate read-ahead limit */</span>
                <span class="token keyword">char</span> ncb<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>readAheadLimit<span class="token punctuation">]</span><span class="token punctuation">;</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">arraycopy</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> markedChar<span class="token punctuation">,</span> ncb<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> delta<span class="token punctuation">)</span><span class="token punctuation">;</span>
                cb <span class="token operator">=</span> ncb<span class="token punctuation">;</span>
                markedChar <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
                dst <span class="token operator">=</span> delta<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            nextChar <span class="token operator">=</span> nChars <span class="token operator">=</span> delta<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">int</span> n<span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        n <span class="token operator">=</span> in<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> dst<span class="token punctuation">,</span> cb<span class="token punctuation">.</span>length <span class="token operator">-</span> dst<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        nChars <span class="token operator">=</span> dst <span class="token operator">+</span> n<span class="token punctuation">;</span>
        nextChar <span class="token operator">=</span> dst<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="read" tabindex="-1"><a class="header-anchor" href="#read" aria-hidden="true">#</a> Read</h2><p>以下函数从当前 Reader 中读取一个字符。在确保输入流不为空的前提下，返回 buffer 中的下一个字符。如果下一个字符已经超出了 buffer 的维护范围，那么调用一次 <code>fill()</code> 填充 buffer：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads a single character.
 *
 * <span class="token keyword">@return</span> The character read, as an integer in the range
 *         0 to 65535 (<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token number">0x00</span><span class="token operator">-</span><span class="token number">0xffff</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span>), or -1 if the
 *         end of the stream has been reached
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span>
                    <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>skipLF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>cb<span class="token punctuation">[</span>nextChar<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
                    <span class="token keyword">continue</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">return</span> cb<span class="token punctuation">[</span>nextChar<span class="token operator">++</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下函数读取一段字符到指定数组内，是内部函数。如果读取的长度超出了 buffer 的长度且没有 mark/reset，那么直接调用底层 Reader 的 <code>read()</code>。如果剩余要读的字符不够了，则调用一次 <code>fill()</code> 填充 buffer。然后将 buffer 中的指定个数字符复制到目标数组中，并返回实际复制的字符数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads characters into a portion of an array, reading from the underlying
 * stream if necessary.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">int</span> <span class="token function">read1</span><span class="token punctuation">(</span><span class="token keyword">char</span><span class="token punctuation">[</span><span class="token punctuation">]</span> cbuf<span class="token punctuation">,</span> <span class="token keyword">int</span> off<span class="token punctuation">,</span> <span class="token keyword">int</span> len<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* If the requested length is at least as large as the buffer, and
            if there is no mark/reset activity, and if line feeds are not
            being skipped, do not bother to copy the characters into the
            local buffer.  In this way buffered streams will cascade
            harmlessly. */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>len <span class="token operator">&gt;=</span> cb<span class="token punctuation">.</span>length <span class="token operator">&amp;&amp;</span> markedChar <span class="token operator">&lt;=</span> <span class="token constant">UNMARKED</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>skipLF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> in<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> off<span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>skipLF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>cb<span class="token punctuation">[</span>nextChar<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span>
                <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">int</span> n <span class="token operator">=</span> <span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>len<span class="token punctuation">,</span> nChars <span class="token operator">-</span> nextChar<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">arraycopy</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> nextChar<span class="token punctuation">,</span> cbuf<span class="token punctuation">,</span> off<span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span>
    nextChar <span class="token operator">+=</span> n<span class="token punctuation">;</span>
    <span class="token keyword">return</span> n<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下函数是暴露给用户的外部函数，基本功能与上述内部函数一致，但是加入了同步操作，在保证输入流开启的前提下，循环调用上述内部函数，尽可能读取到用户指定的字符长度并返回用户。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads characters into a portion of an array.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> This method implements the general contract of the corresponding
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Reader</span><span class="token punctuation">#</span><span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span><span class="token punctuation">,</span> <span class="token keyword">int</span><span class="token punctuation">)</span></span> read<span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method of the
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Reader</span></span><span class="token punctuation">}</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> class.  As an additional convenience, it
 * attempts to read as many characters as possible by repeatedly invoking
 * the <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">read</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method of the underlying stream.  This iterated
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">read</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> continues until one of the following conditions becomes
 * true: <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
 *
 *   <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> The specified number of characters have been read,
 *
 *   <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> The <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">read</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method of the underlying stream returns
 *   <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token operator">-</span><span class="token number">1</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>, indicating end-of-file, or
 *
 *   <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span> The <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">ready</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method of the underlying stream
 *   returns <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token boolean">false</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>, indicating that further input requests
 *   would block.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span> If the first <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">read</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> on the underlying stream returns
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token operator">-</span><span class="token number">1</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> to indicate end-of-file then this method returns
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token operator">-</span><span class="token number">1</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>.  Otherwise this method returns the number of characters
 * actually read.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Subclasses of this class are encouraged, but not required, to
 * attempt to read as many characters as possible in the same fashion.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Ordinarily this method takes characters from this stream&#39;s character
 * buffer, filling it from the underlying stream as necessary.  If,
 * however, the buffer is empty, the mark is not valid, and the requested
 * length is at least as large as the buffer, then this method will read
 * characters directly from the underlying stream into the given array.
 * Thus redundant <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">BufferedReader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>s will not copy data
 * unnecessarily.
 *
 * <span class="token keyword">@param</span>      <span class="token parameter">cbuf</span>  Destination buffer
 * <span class="token keyword">@param</span>      <span class="token parameter">off</span>   Offset at which to start storing characters
 * <span class="token keyword">@param</span>      <span class="token parameter">len</span>   Maximum number of characters to read
 *
 * <span class="token keyword">@return</span>     The number of characters read, or -1 if the end of the
 *             stream has been reached
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span> off<span class="token punctuation">,</span> <span class="token keyword">int</span> len<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>off <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span>off <span class="token operator">&gt;</span> cbuf<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span>len <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">||</span>
            <span class="token punctuation">(</span><span class="token punctuation">(</span>off <span class="token operator">+</span> len<span class="token punctuation">)</span> <span class="token operator">&gt;</span> cbuf<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>off <span class="token operator">+</span> len<span class="token punctuation">)</span> <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IndexOutOfBoundsException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>len <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">int</span> n <span class="token operator">=</span> <span class="token function">read1</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> off<span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">return</span> n<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>n <span class="token operator">&lt;</span> len<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> in<span class="token punctuation">.</span><span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">int</span> n1 <span class="token operator">=</span> <span class="token function">read1</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> off <span class="token operator">+</span> n<span class="token punctuation">,</span> len <span class="token operator">-</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">break</span><span class="token punctuation">;</span>
            n <span class="token operator">+=</span> n1<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> n<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,33),r=s("code",null,"\\n",-1),d=s("code",null,"\\r",-1),k=s("code",null,"^M",-1),v=s("code",null,"\\r\\n",-1),m={href:"https://www.cnblogs.com/xiaotiannet/p/3510586.html",target:"_blank",rel:"noopener noreferrer"},b=s("code",null,"boolean",-1),f=a(`<p>内部实现会建立一个默认的 StringBuffer，默认一行的长度为 <code>defaultExpectedLineLength</code> (80)，然后在一个循环中不断读取字符，并 append 到 StringBuffer 后，直到识别出换行符为止。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> defaultExpectedLineLength <span class="token operator">=</span> <span class="token number">80</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Reads a line of text.  A line is considered to be terminated by any one
 * of a line feed (&#39;\\n&#39;), a carriage return (&#39;\\r&#39;), or a carriage return
 * followed immediately by a linefeed.
 *
 * <span class="token keyword">@param</span>      <span class="token parameter">ignoreLF</span>  If true, the next &#39;\\n&#39; will be skipped
 *
 * <span class="token keyword">@return</span>     A String containing the contents of the line, not including
 *             any line-termination characters, or null if the end of the
 *             stream has been reached
 *
 * <span class="token keyword">@see</span>        <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span><span class="token class-name">LineNumberReader</span><span class="token punctuation">#</span><span class="token function">readLine</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token class-name">String</span> <span class="token function">readLine</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> ignoreLF<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token class-name">StringBuffer</span> s <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> startChar<span class="token punctuation">;</span>

    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">boolean</span> omitLF <span class="token operator">=</span> ignoreLF <span class="token operator">||</span> skipLF<span class="token punctuation">;</span>

    bufferLoop<span class="token operator">:</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span>
                <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* EOF */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> s<span class="token punctuation">.</span><span class="token function">length</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
                    <span class="token keyword">return</span> s<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">else</span>
                    <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">boolean</span> eol <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
            <span class="token keyword">char</span> c <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            <span class="token keyword">int</span> i<span class="token punctuation">;</span>

            <span class="token comment">/* Skip a leftover &#39;\\n&#39;, if necessary */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>omitLF <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>cb<span class="token punctuation">[</span>nextChar<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
            skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
            omitLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

        charLoop<span class="token operator">:</span>
            <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> nextChar<span class="token punctuation">;</span> i <span class="token operator">&lt;</span> nChars<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                c <span class="token operator">=</span> cb<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>c <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span>c <span class="token operator">==</span> <span class="token char">&#39;\\r&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    eol <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span> charLoop<span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>

            startChar <span class="token operator">=</span> nextChar<span class="token punctuation">;</span>
            nextChar <span class="token operator">=</span> i<span class="token punctuation">;</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span>eol<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">String</span> str<span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    str <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">String</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> startChar<span class="token punctuation">,</span> i <span class="token operator">-</span> startChar<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                    s<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> startChar<span class="token punctuation">,</span> i <span class="token operator">-</span> startChar<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    str <span class="token operator">=</span> s<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>c <span class="token operator">==</span> <span class="token char">&#39;\\r&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    skipLF <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">return</span> str<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
                s <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">StringBuffer</span><span class="token punctuation">(</span>defaultExpectedLineLength<span class="token punctuation">)</span><span class="token punctuation">;</span>
            s<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> startChar<span class="token punctuation">,</span> i <span class="token operator">-</span> startChar<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Reads a line of text.  A line is considered to be terminated by any one
 * of a line feed (&#39;\\n&#39;), a carriage return (&#39;\\r&#39;), or a carriage return
 * followed immediately by a linefeed.
 *
 * <span class="token keyword">@return</span>     A String containing the contents of the line, not including
 *             any line-termination characters, or null if the end of the
 *             stream has been reached
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 *
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>file<span class="token punctuation">.</span></span><span class="token class-name">Files</span><span class="token punctuation">#</span><span class="token field">readAllLines</span></span>
 */</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">readLine</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">readLine</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下函数返回一个可以被迭代器遍历的流，其中的内容就是每一行字符串：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Stream</span></span></span><span class="token punctuation">}</span>, the elements of which are lines read from
 * this <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">BufferedReader</span></span></span><span class="token punctuation">}</span>.  The <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Stream</span></span><span class="token punctuation">}</span> is lazily populated,
 * i.e., read only occurs during the
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>../util/stream/package-summary.html#StreamOps<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>terminal
 * stream operation<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> The reader must not be operated on during the execution of the
 * terminal stream operation. Otherwise, the result of the terminal stream
 * operation is undefined.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> After execution of the terminal stream operation there are no
 * guarantees that the reader will be at a specific position from which to
 * read the next character or line.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> If an <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">IOException</span></span><span class="token punctuation">}</span> is thrown when accessing the underlying
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">BufferedReader</span></span></span><span class="token punctuation">}</span>, it is wrapped in an <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token class-name">UncheckedIOException</span></span><span class="token punctuation">}</span> which will be thrown from the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Stream</span></span></span><span class="token punctuation">}</span>
 * method that caused the read to take place. This method will return a
 * Stream if invoked on a BufferedReader that is closed. Any operation on
 * that stream that requires reading from the BufferedReader after it is
 * closed, will cause an UncheckedIOException to be thrown.
 *
 * <span class="token keyword">@return</span> a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">Stream</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span></span></span><span class="token punctuation">}</span> providing the lines of text
 *         described by this <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">BufferedReader</span></span></span><span class="token punctuation">}</span>
 *
 * <span class="token keyword">@since</span> 1.8
 */</span>
<span class="token keyword">public</span> <span class="token class-name">Stream</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">lines</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> iter <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Iterator</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">String</span> nextLine <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextLine <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    nextLine <span class="token operator">=</span> <span class="token function">readLine</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">return</span> <span class="token punctuation">(</span>nextLine <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">UncheckedIOException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextLine <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">||</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">String</span> line <span class="token operator">=</span> nextLine<span class="token punctuation">;</span>
                nextLine <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
                <span class="token keyword">return</span> line<span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NoSuchElementException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token class-name">StreamSupport</span><span class="token punctuation">.</span><span class="token function">stream</span><span class="token punctuation">(</span><span class="token class-name">Spliterators</span><span class="token punctuation">.</span><span class="token function">spliteratorUnknownSize</span><span class="token punctuation">(</span>
            iter<span class="token punctuation">,</span> <span class="token class-name">Spliterator</span><span class="token punctuation">.</span><span class="token constant">ORDERED</span> <span class="token operator">|</span> <span class="token class-name">Spliterator</span><span class="token punctuation">.</span><span class="token constant">NONNULL</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="skip" tabindex="-1"><a class="header-anchor" href="#skip" aria-hidden="true">#</a> Skip</h2><p>跳过一些字节。当 buffer 中的有效字节用尽时，调用一次 <code>fill()</code>。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Skips characters.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">n</span>  The number of characters to skip
 *
 * <span class="token keyword">@return</span>    The number of characters actually skipped
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span>  If <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">n</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> is negative.
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">skip</span><span class="token punctuation">(</span><span class="token keyword">long</span> n<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&lt;</span> <span class="token number">0L</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;skip value is negative&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">long</span> r <span class="token operator">=</span> n<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>r <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span>
                <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars<span class="token punctuation">)</span> <span class="token comment">/* EOF */</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>skipLF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>cb<span class="token punctuation">[</span>nextChar<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">long</span> d <span class="token operator">=</span> nChars <span class="token operator">-</span> nextChar<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">&lt;=</span> d<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                nextChar <span class="token operator">+=</span> r<span class="token punctuation">;</span>
                r <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span> <span class="token punctuation">{</span>
                r <span class="token operator">-=</span> d<span class="token punctuation">;</span>
                nextChar <span class="token operator">=</span> nChars<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> n <span class="token operator">-</span> r<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ready" tabindex="-1"><a class="header-anchor" href="#ready" aria-hidden="true">#</a> Ready</h2><p>当 buffer 中还可以有字符被读取或底层的输入流准备就绪 (调用 <code>read()</code> 不会阻塞) 时，当前函数返回 <code>true</code>，表示当前 Reader 准备就绪。默认 LF 会被跳过，不会被当作新一行的字符，保证只有当下一行字符准备就绪时，当前函数才返回 <code>true</code>。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Tells whether this stream is ready to be read.  A buffered character
 * stream is ready if the buffer is not empty, or if the underlying
 * character stream is ready.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * If newline needs to be skipped and the next char to be read
         * is a newline character, then just skip it right away.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>skipLF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">/* Note that in.ready() will return true if and only if the next
             * read on the stream will not block.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&gt;=</span> nChars <span class="token operator">&amp;&amp;</span> in<span class="token punctuation">.</span><span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">fill</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&lt;</span> nChars<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>cb<span class="token punctuation">[</span>nextChar<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span>
                    nextChar<span class="token operator">++</span><span class="token punctuation">;</span>
                skipLF <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>nextChar <span class="token operator">&lt;</span> nChars<span class="token punctuation">)</span> <span class="token operator">||</span> in<span class="token punctuation">.</span><span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="mark-reset" tabindex="-1"><a class="header-anchor" href="#mark-reset" aria-hidden="true">#</a> Mark / Reset</h2><p>这个类支持 mark / reset 操作。在调用 <code>mark()</code> 时，需要指定 <code>readAheadLimit</code>。当 mark 的位置距离当前 read 的位置超过这个阈值时，reset 将无法回到 mark 所在位置而失败 (IOException)。如果这个值设置为超过 buffer 长度时，buffer 将会被扩展到不小于这个长度。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Tells whether this stream supports the mark() operation, which it does.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">markSupported</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Marks the present position in the stream.  Subsequent calls to reset()
 * will attempt to reposition the stream to this point.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">readAheadLimit</span>   Limit on the number of characters that may be
 *                         read while still preserving the mark. An attempt
 *                         to reset the stream after reading characters
 *                         up to this limit or beyond may fail.
 *                         A limit value larger than the size of the input
 *                         buffer will cause a new buffer to be allocated
 *                         whose size is no smaller than limit.
 *                         Therefore large values should be used with care.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span>  If <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">readAheadLimit <span class="token operator">&lt;</span> <span class="token number">0</span></span></span><span class="token punctuation">}</span>
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">mark</span><span class="token punctuation">(</span><span class="token keyword">int</span> readAheadLimit<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>readAheadLimit <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;Read-ahead limit &lt; 0&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>readAheadLimit <span class="token operator">=</span> readAheadLimit<span class="token punctuation">;</span>
        markedChar <span class="token operator">=</span> nextChar<span class="token punctuation">;</span>
        markedSkipLF <span class="token operator">=</span> skipLF<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Resets the stream to the most recent mark.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If the stream has never been marked,
 *                          or if the mark has been invalidated
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">reset</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">ensureOpen</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>markedChar <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IOException</span><span class="token punctuation">(</span><span class="token punctuation">(</span>markedChar <span class="token operator">==</span> <span class="token constant">INVALIDATED</span><span class="token punctuation">)</span>
                                    <span class="token operator">?</span> <span class="token string">&quot;Mark invalid&quot;</span>
                                    <span class="token operator">:</span> <span class="token string">&quot;Stream not marked&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        nextChar <span class="token operator">=</span> markedChar<span class="token punctuation">;</span>
        skipLF <span class="token operator">=</span> markedSkipLF<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="close" tabindex="-1"><a class="header-anchor" href="#close" aria-hidden="true">#</a> Close</h2><p>关闭底层的 Reader：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>in <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span><span class="token punctuation">;</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            in<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
            in <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
            cb <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,17);function h(g,y){const e=p("ExternalLinkIcon");return o(),c("div",null,[u,s("p",null,[n("以下函数返回一行字符串。该函数将 "),r,n(" (Line Feed, LF) (Unix)、"),d,n(" (Carriage Return, CR, 显示为 "),k,n(") (OSX)、"),v,n(" (CRLF) (Windows) 中的任意一个视为行分隔符。"),s("a",m,[n("区别"),l(e)]),n("。函数参数中的 "),b,n(" 变量决定了在返回的字符串中是否忽略最后的换行符，默认保留换行符。")]),f])}const x=t(i,[["render",h],["__file","Class - java.io.BufferedReader.html.vue"]]);export{x as default};
