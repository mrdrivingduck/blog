import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="abstract-class-java-io-reader" tabindex="-1"><a class="header-anchor" href="#abstract-class-java-io-reader" aria-hidden="true">#</a> Abstract Class - java.io.Reader</h1><p>Created by : Mr Dk.</p><p>2020 / 09 / 24 11:43</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>读取字符流的抽象类。子类必须要继承的函数只有 <code>read()</code> 和 <code>close()</code>。其它函数子类可以按需继承，提高性能。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Abstract class for reading character streams.  The only methods that a
 * subclass must implement are read(char[], int, int) and close().  Most
 * subclasses, however, will override some of the methods defined here in order
 * to provide higher efficiency, additional functionality, or both.
 *
 *
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">BufferedReader</span></span>
 * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">LineNumberReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">CharArrayReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">InputStreamReader</span></span>
 * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">FileReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">FilterReader</span></span>
 * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">PushbackReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">PipedReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">StringReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Writer</span></span>
 *
 * <span class="token keyword">@author</span>      Mark Reinhold
 * <span class="token keyword">@since</span>       JDK1.1
 */</span>

<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">Reader</span> <span class="token keyword">implements</span> <span class="token class-name">Readable</span><span class="token punctuation">,</span> <span class="token class-name">Closeable</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> Constructor</h2><p>该类用一个对象来作为同步操作的锁。子类使用这个锁对象来进行同步操作，避免使用 <code>synchronized</code> 修饰的函数。为了效率，一般来说字符流对象最好不要使用自身作为锁对象，从而能够保护自身关键信息。但如果没有指定的锁对象参数，那么只能使用自身作为锁对象。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * The object used to synchronize operations on this stream.  For
 * efficiency, a character-stream object may use an object other than
 * itself to protect critical sections.  A subclass should therefore use
 * the object in this field rather than <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token keyword">this</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span> or a synchronized
 * method.
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Object</span> lock<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Creates a new character-stream reader whose critical sections will
 * synchronize on the reader itself.
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Reader</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates a new character-stream reader whose critical sections will
 * synchronize on the given object.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">lock</span>  The Object to synchronize on.
 */</span>
<span class="token keyword">protected</span> <span class="token class-name">Reader</span><span class="token punctuation">(</span><span class="token class-name">Object</span> lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>lock <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> lock<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="read" tabindex="-1"><a class="header-anchor" href="#read" aria-hidden="true">#</a> Read</h2><p>需要子类 override 的函数如下。将字符读入 <code>cbuf</code> 字符数组的指定位置指定长度。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads characters into a portion of an array.  This method will block
 * until some input is available, an I/O error occurs, or the end of the
 * stream is reached.
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
<span class="token keyword">abstract</span> <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span> off<span class="token punctuation">,</span> <span class="token keyword">int</span> len<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其它 <code>read()</code> 函数是基于上述函数的封装形式。首先计算 <code>CharBuffer</code> 中还有多少余量，然后根据这个余量读取字符。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Attempts to read characters into the specified character buffer.
 * The buffer is used as a repository of characters as-is: the only
 * changes made are the results of a put operation. No flipping or
 * rewinding of the buffer is performed.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">target</span> the buffer to read characters into
 * <span class="token keyword">@return</span> The number of characters added to the buffer, or
 *         -1 if this source of characters is at its end
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IOException</span></span> if an I/O error occurs
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if target is null
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span></span><span class="token class-name">ReadOnlyBufferException</span></span> if target is a read only buffer
 * <span class="token keyword">@since</span> 1.5
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span></span>CharBuffer</span> target<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> len <span class="token operator">=</span> target<span class="token punctuation">.</span><span class="token function">remaining</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">char</span><span class="token punctuation">[</span><span class="token punctuation">]</span> cbuf <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>len<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> n <span class="token operator">=</span> <span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
        target<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> n<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>读取一个单独的字符：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads a single character.  This method will block until a character is
 * available, an I/O error occurs, or the end of the stream is reached.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Subclasses that intend to support efficient single-character input
 * should override this method.
 *
 * <span class="token keyword">@return</span>     The character read, as an integer in the range 0 to 65535
 *             (<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token number">0x00</span><span class="token operator">-</span><span class="token number">0xffff</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span>), or -1 if the end of the stream has
 *             been reached
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">char</span> cb<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">read</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        <span class="token keyword">return</span> cb<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将字符读进一个指定长度的字符数组，从这个数组的开头开始放置，直到这个数组被读满。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads characters into an array.  This method will block until some input
 * is available, an I/O error occurs, or the end of the stream is reached.
 *
 * <span class="token keyword">@param</span>       <span class="token parameter">cbuf</span>  Destination buffer
 *
 * <span class="token keyword">@return</span>      The number of characters read, or -1
 *              if the end of the stream
 *              has been reached
 *
 * <span class="token keyword">@exception</span>   <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> cbuf<span class="token punctuation">.</span>length<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="skip" tabindex="-1"><a class="header-anchor" href="#skip" aria-hidden="true">#</a> Skip</h2><p>跳过一些字节的读取。对象成员中包含一个 <code>skipBuffer</code> 字符数组，用于存放跳过的字符。同时指定这个字符数组的最大长度为 <code>maxSkipBufferSize</code>。<code>skipBuffer</code> 数组只有在用到的时候才会被开辟。并且还会对数组的长度进行判断，保证尽量不浪费空间。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/** Maximum skip-buffer size */</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> maxSkipBufferSize <span class="token operator">=</span> <span class="token number">8192</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/** Skip buffer, null until allocated */</span>
<span class="token keyword">private</span> <span class="token keyword">char</span> skipBuffer<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Skips characters.  This method will block until some characters are
 * available, an I/O error occurs, or the end of the stream is reached.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">n</span>  The number of characters to skip
 *
 * <span class="token keyword">@return</span>    The number of characters actually skipped
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span>  If <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">n</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> is negative.
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">skip</span><span class="token punctuation">(</span><span class="token keyword">long</span> n<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&lt;</span> <span class="token number">0L</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;skip value is negative&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> nn <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>n<span class="token punctuation">,</span> maxSkipBufferSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>skipBuffer <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span>skipBuffer<span class="token punctuation">.</span>length <span class="token operator">&lt;</span> nn<span class="token punctuation">)</span><span class="token punctuation">)</span>
            skipBuffer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>nn<span class="token punctuation">]</span><span class="token punctuation">;</span>
        <span class="token keyword">long</span> r <span class="token operator">=</span> n<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>r <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">int</span> nc <span class="token operator">=</span> <span class="token function">read</span><span class="token punctuation">(</span>skipBuffer<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span><span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> nn<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>nc <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            r <span class="token operator">-=</span> nc<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> n <span class="token operator">-</span> r<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ready" tabindex="-1"><a class="header-anchor" href="#ready" aria-hidden="true">#</a> Ready</h2><p>函数返回 <code>true</code> 代表下一次的 <code>read()</code> 不会阻塞。这个函数应该是为 NIO 服务的。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Tells whether this stream is ready to be read.
 *
 * <span class="token keyword">@return</span> True if the next read() is guaranteed not to block for input,
 * false otherwise.  Note that returning false does not guarantee that the
 * next read will block.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="mark-support" tabindex="-1"><a class="header-anchor" href="#mark-support" aria-hidden="true">#</a> Mark Support</h2><p>与 Stream 类似，通过 <code>mark()</code> 和 <code>reset()</code> 能够使 <code>read()</code> 能够 mark 的位置反复读取。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Tells whether this stream supports the mark() operation. The default
 * implementation always returns false. Subclasses should override this
 * method.
 *
 * <span class="token keyword">@return</span> true if and only if this stream supports the mark operation.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">markSupported</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Marks the present position in the stream.  Subsequent calls to reset()
 * will attempt to reposition the stream to this point.  Not all
 * character-input streams support the mark() operation.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">readAheadLimit</span>  Limit on the number of characters that may be
 *                         read while still preserving the mark.  After
 *                         reading this many characters, attempting to
 *                         reset the stream may fail.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If the stream does not support mark(),
 *                          or if some other I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">mark</span><span class="token punctuation">(</span><span class="token keyword">int</span> readAheadLimit<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IOException</span><span class="token punctuation">(</span><span class="token string">&quot;mark() not supported&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Resets the stream.  If the stream has been marked, then attempt to
 * reposition it at the mark.  If the stream has not been marked, then
 * attempt to reset it in some way appropriate to the particular stream,
 * for example by repositioning it to its starting point.  Not all
 * character-input streams support the reset() operation, and some support
 * reset() without supporting mark().
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If the stream has not been marked,
 *                          or if the mark has been invalidated,
 *                          or if the stream does not support reset(),
 *                          or if some other I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">reset</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IOException</span><span class="token punctuation">(</span><span class="token string">&quot;reset() not supported&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="close" tabindex="-1"><a class="header-anchor" href="#close" aria-hidden="true">#</a> Close</h2><p>需要由子类 override。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Closes the stream and releases any system resources associated with
 * it.  Once the stream has been closed, further read(), ready(),
 * mark(), reset(), or skip() invocations will throw an IOException.
 * Closing a previously closed stream has no effect.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">abstract</span> <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,33),c=[p];function o(i,l){return s(),a("div",null,c)}const d=n(t,[["render",o],["__file","Abstract Class - java.io.Reader.html.vue"]]);export{d as default};
