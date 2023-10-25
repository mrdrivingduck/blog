import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="class-java-io-inputstreamreader" tabindex="-1"><a class="header-anchor" href="#class-java-io-inputstreamreader" aria-hidden="true">#</a> Class - java.io.InputStreamReader</h1><p>Created by : Mr Dk.</p><p>2020 / 10 / 02 11:11</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition" aria-hidden="true">#</a> Definition</h2><p>这个类是 <strong>字节流</strong> (byte) 转为 <strong>字符流</strong> (char) 的桥梁。除了要接收一个字节流 (InputStream) 以外，还要接收一个字符编码的参数。然后按照编码指定的方式将字节解析为字符。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * An InputStreamReader is a bridge from byte streams to character streams: It
 * reads bytes and decodes them into characters using a specified <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>charset<span class="token punctuation">.</span></span><span class="token class-name">Charset</span></span> charset<span class="token punctuation">}</span>.  The charset that it uses
 * may be specified by name or may be given explicitly, or the platform&#39;s
 * default charset may be accepted.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Each invocation of one of an InputStreamReader&#39;s read() methods may
 * cause one or more bytes to be read from the underlying byte-input stream.
 * To enable the efficient conversion of bytes to characters, more bytes may
 * be read ahead from the underlying stream than are necessary to satisfy the
 * current read operation.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> For top efficiency, consider wrapping an InputStreamReader within a
 * BufferedReader.  For example:
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>pre</span><span class="token punctuation">&gt;</span></span>
 <span class="token code-section">* <span class="token line"><span class="token code language-java"><span class="token class-name">BufferedReader</span> in</span></span>
 *   <span class="token line"><span class="token code language-java"><span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">BufferedReader</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">System</span><span class="token punctuation">.</span>in<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span></span>
 *</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>pre</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">BufferedReader</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">InputStream</span></span>
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>charset<span class="token punctuation">.</span></span><span class="token class-name">Charset</span></span>
 *
 * <span class="token keyword">@author</span>      Mark Reinhold
 * <span class="token keyword">@since</span>       JDK1.1
 */</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">InputStreamReader</span> <span class="token keyword">extends</span> <span class="token class-name">Reader</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="member-constructor" tabindex="-1"><a class="header-anchor" href="#member-constructor" aria-hidden="true">#</a> Member &amp; Constructor</h2><p>该类每部维护一个字节流的解码器。该类的构造函数被调用时，将字节流与编码集封装为这个对象。如果不支持参数指定的编码集，则抛出异常。支持多种形式的字符编码参数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">StreamDecoder</span> sd<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * Creates an InputStreamReader that uses the default charset.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>   An InputStream
 */</span>
<span class="token keyword">public</span> <span class="token class-name">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        sd <span class="token operator">=</span> <span class="token class-name">StreamDecoder</span><span class="token punctuation">.</span><span class="token function">forInputStreamReader</span><span class="token punctuation">(</span>in<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// ## check lock object</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">UnsupportedEncodingException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// The default encoding should always be available</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates an InputStreamReader that uses the named charset.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>
 *         An InputStream
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">charsetName</span>
 *         The name of a supported
 *         <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>charset<span class="token punctuation">.</span></span><span class="token class-name">Charset</span></span> charset<span class="token punctuation">}</span>
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">UnsupportedEncodingException</span></span>
 *             If the named charset is not supported
 */</span>
<span class="token keyword">public</span> <span class="token class-name">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">,</span> <span class="token class-name">String</span> charsetName<span class="token punctuation">)</span>
    <span class="token keyword">throws</span> <span class="token class-name">UnsupportedEncodingException</span>
<span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>charsetName <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token string">&quot;charsetName&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    sd <span class="token operator">=</span> <span class="token class-name">StreamDecoder</span><span class="token punctuation">.</span><span class="token function">forInputStreamReader</span><span class="token punctuation">(</span>in<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">,</span> charsetName<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates an InputStreamReader that uses the given charset.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>       An InputStream
 * <span class="token keyword">@param</span>  <span class="token parameter">cs</span>       A charset
 *
 * <span class="token keyword">@since</span> 1.4
 * <span class="token keyword">@spec</span> JSR-51
 */</span>
<span class="token keyword">public</span> <span class="token class-name">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">,</span> <span class="token class-name">Charset</span> cs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cs <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token string">&quot;charset&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    sd <span class="token operator">=</span> <span class="token class-name">StreamDecoder</span><span class="token punctuation">.</span><span class="token function">forInputStreamReader</span><span class="token punctuation">(</span>in<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">,</span> cs<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Creates an InputStreamReader that uses the given charset decoder.
 *
 * <span class="token keyword">@param</span>  <span class="token parameter">in</span>       An InputStream
 * <span class="token keyword">@param</span>  <span class="token parameter">dec</span>      A charset decoder
 *
 * <span class="token keyword">@since</span> 1.4
 * <span class="token keyword">@spec</span> JSR-51
 */</span>
<span class="token keyword">public</span> <span class="token class-name">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span> in<span class="token punctuation">,</span> <span class="token class-name">CharsetDecoder</span> dec<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">super</span><span class="token punctuation">(</span>in<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>dec <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token string">&quot;charset decoder&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    sd <span class="token operator">=</span> <span class="token class-name">StreamDecoder</span><span class="token punctuation">.</span><span class="token function">forInputStreamReader</span><span class="token punctuation">(</span>in<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">,</span> dec<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="encoding" tabindex="-1"><a class="header-anchor" href="#encoding" aria-hidden="true">#</a> Encoding</h2><p>取得字符编码名称：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Returns the name of the character encoding being used by this stream.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> If the encoding has an historical name then that name is returned;
 * otherwise the encoding&#39;s canonical name is returned.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> If this instance was created with the <span class="token punctuation">{</span><span class="token keyword">@link</span>
 * <span class="token reference"><span class="token punctuation">#</span><span class="token function">InputStreamReader</span><span class="token punctuation">(</span><span class="token class-name">InputStream</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span> constructor then the returned
 * name, being unique for the encoding, may differ from the name passed to
 * the constructor. This method will return <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token keyword">null</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> if the
 * stream has been closed.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token keyword">@return</span> The historical name of this encoding, or
 *         <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token keyword">null</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> if the stream has been closed
 *
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span>charset<span class="token punctuation">.</span></span><span class="token class-name">Charset</span></span>
 *
 * <span class="token keyword">@revised</span> 1.4
 * <span class="token keyword">@spec</span> JSR-51
 */</span>
<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getEncoding</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sd<span class="token punctuation">.</span><span class="token function">getEncoding</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="read" tabindex="-1"><a class="header-anchor" href="#read" aria-hidden="true">#</a> Read</h2><p>读取字符。可以看到目标的参数已经由 <code>byte[]</code> 变为了 <code>char[]</code>。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reads a single character.
 *
 * <span class="token keyword">@return</span> The character read, or -1 if the end of the stream has been
 *         reached
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sd<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Reads characters into a portion of an array.
 *
 * <span class="token keyword">@param</span>      <span class="token parameter">cbuf</span>     Destination buffer
 * <span class="token keyword">@param</span>      <span class="token parameter">offset</span>   Offset at which to start storing characters
 * <span class="token keyword">@param</span>      <span class="token parameter">length</span>   Maximum number of characters to read
 *
 * <span class="token keyword">@return</span>     The number of characters read, or -1 if the end of the
 *             stream has been reached
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span> offset<span class="token punctuation">,</span> <span class="token keyword">int</span> length<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sd<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> offset<span class="token punctuation">,</span> length<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ready" tabindex="-1"><a class="header-anchor" href="#ready" aria-hidden="true">#</a> Ready</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Tells whether this stream is ready to be read.  An InputStreamReader is
 * ready if its input buffer is not empty, or if bytes are available to be
 * read from the underlying byte stream.
 *
 * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> sd<span class="token punctuation">.</span><span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="close" tabindex="-1"><a class="header-anchor" href="#close" aria-hidden="true">#</a> Close</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    sd<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,22),c=[p];function o(i,l){return s(),a("div",null,c)}const u=n(t,[["render",o],["__file","Class - java.io.InputStreamReader.html.vue"]]);export{u as default};
