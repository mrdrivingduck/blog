import{_ as n,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const l={};function c(t,s){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="abstract-class-java-io-reader" tabindex="-1"><a class="header-anchor" href="#abstract-class-java-io-reader"><span>Abstract Class - java.io.Reader</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 09 / 24 11:43</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><p>读取字符流的抽象类。子类必须要继承的函数只有 <code>read()</code> 和 <code>close()</code>。其它函数子类可以按需继承，提高性能。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Abstract class for reading character streams.  The only methods that a</span>
<span class="line"> * subclass must implement are read(char[], int, int) and close().  Most</span>
<span class="line"> * subclasses, however, will override some of the methods defined here in order</span>
<span class="line"> * to provide higher efficiency, additional functionality, or both.</span>
<span class="line"> *</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">BufferedReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">LineNumberReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">CharArrayReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">InputStreamReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">FileReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">FilterReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span>   <span class="token reference"><span class="token class-name">PushbackReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">PipedReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">StringReader</span></span></span>
<span class="line"> * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">Writer</span></span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@author</span>      Mark Reinhold</span>
<span class="line"> * <span class="token keyword">@since</span>       JDK1.1</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">Reader</span> <span class="token keyword">implements</span> <span class="token class-name">Readable</span><span class="token punctuation">,</span> <span class="token class-name">Closeable</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor"><span>Constructor</span></a></h2><p>该类用一个对象来作为同步操作的锁。子类使用这个锁对象来进行同步操作，避免使用 <code>synchronized</code> 修饰的函数。为了效率，一般来说字符流对象最好不要使用自身作为锁对象，从而能够保护自身关键信息。但如果没有指定的锁对象参数，那么只能使用自身作为锁对象。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The object used to synchronize operations on this stream.  For</span>
<span class="line"> * efficiency, a character-stream object may use an object other than</span>
<span class="line"> * itself to protect critical sections.  A subclass should therefore use</span>
<span class="line"> * the object in this field rather than <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token keyword">this</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span> or a synchronized</span>
<span class="line"> * method.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token class-name">Object</span> lock<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Creates a new character-stream reader whose critical sections will</span>
<span class="line"> * synchronize on the reader itself.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token class-name">Reader</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Creates a new character-stream reader whose critical sections will</span>
<span class="line"> * synchronize on the given object.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">lock</span>  The Object to synchronize on.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token class-name">Reader</span><span class="token punctuation">(</span><span class="token class-name">Object</span> lock<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>lock <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> lock<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="read" tabindex="-1"><a class="header-anchor" href="#read"><span>Read</span></a></h2><p>需要子类 override 的函数如下。将字符读入 <code>cbuf</code> 字符数组的指定位置指定长度。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Reads characters into a portion of an array.  This method will block</span>
<span class="line"> * until some input is available, an I/O error occurs, or the end of the</span>
<span class="line"> * stream is reached.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">cbuf</span>  Destination buffer</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">off</span>   Offset at which to start storing characters</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">len</span>   Maximum number of characters to read</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span>     The number of characters read, or -1 if the end of the</span>
<span class="line"> *             stream has been reached</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">abstract</span> <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span> off<span class="token punctuation">,</span> <span class="token keyword">int</span> len<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其它 <code>read()</code> 函数是基于上述函数的封装形式。首先计算 <code>CharBuffer</code> 中还有多少余量，然后根据这个余量读取字符。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Attempts to read characters into the specified character buffer.</span>
<span class="line"> * The buffer is used as a repository of characters as-is: the only</span>
<span class="line"> * changes made are the results of a put operation. No flipping or</span>
<span class="line"> * rewinding of the buffer is performed.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">target</span> the buffer to read characters into</span>
<span class="line"> * <span class="token keyword">@return</span> The number of characters added to the buffer, or</span>
<span class="line"> *         -1 if this source of characters is at its end</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">IOException</span></span> if an I/O error occurs</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if target is null</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span></span><span class="token class-name">ReadOnlyBufferException</span></span> if target is a read only buffer</span>
<span class="line"> * <span class="token keyword">@since</span> 1.5</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token class-name"><span class="token namespace">java<span class="token punctuation">.</span>nio<span class="token punctuation">.</span></span>CharBuffer</span> target<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span> len <span class="token operator">=</span> target<span class="token punctuation">.</span><span class="token function">remaining</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span><span class="token punctuation">[</span><span class="token punctuation">]</span> cbuf <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>len<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> n <span class="token operator">=</span> <span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        target<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> n<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>读取一个单独的字符：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Reads a single character.  This method will block until a character is</span>
<span class="line"> * available, an I/O error occurs, or the end of the stream is reached.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Subclasses that intend to support efficient single-character input</span>
<span class="line"> * should override this method.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span>     The character read, as an integer in the range 0 to 65535</span>
<span class="line"> *             (<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token number">0x00</span><span class="token operator">-</span><span class="token number">0xffff</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span>), or -1 if the end of the stream has</span>
<span class="line"> *             been reached</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">char</span> cb<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">read</span><span class="token punctuation">(</span>cb<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        <span class="token keyword">return</span> cb<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将字符读进一个指定长度的字符数组，从这个数组的开头开始放置，直到这个数组被读满。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Reads characters into an array.  This method will block until some input</span>
<span class="line"> * is available, an I/O error occurs, or the end of the stream is reached.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>       <span class="token parameter">cbuf</span>  Destination buffer</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span>      The number of characters read, or -1</span>
<span class="line"> *              if the end of the stream</span>
<span class="line"> *              has been reached</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>   <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token keyword">char</span> cbuf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token function">read</span><span class="token punctuation">(</span>cbuf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> cbuf<span class="token punctuation">.</span>length<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="skip" tabindex="-1"><a class="header-anchor" href="#skip"><span>Skip</span></a></h2><p>跳过一些字节的读取。对象成员中包含一个 <code>skipBuffer</code> 字符数组，用于存放跳过的字符。同时指定这个字符数组的最大长度为 <code>maxSkipBufferSize</code>。<code>skipBuffer</code> 数组只有在用到的时候才会被开辟。并且还会对数组的长度进行判断，保证尽量不浪费空间。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/** Maximum skip-buffer size */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> maxSkipBufferSize <span class="token operator">=</span> <span class="token number">8192</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/** Skip buffer, null until allocated */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">char</span> skipBuffer<span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Skips characters.  This method will block until some characters are</span>
<span class="line"> * available, an I/O error occurs, or the end of the stream is reached.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>  <span class="token parameter">n</span>  The number of characters to skip</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span>    The number of characters actually skipped</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span>  If <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">n</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> is negative.</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">skip</span><span class="token punctuation">(</span><span class="token keyword">long</span> n<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">&lt;</span> <span class="token number">0L</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;skip value is negative&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> nn <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>n<span class="token punctuation">,</span> maxSkipBufferSize<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>lock<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>skipBuffer <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token punctuation">(</span>skipBuffer<span class="token punctuation">.</span>length <span class="token operator">&lt;</span> nn<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            skipBuffer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">char</span><span class="token punctuation">[</span>nn<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">long</span> r <span class="token operator">=</span> n<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">while</span> <span class="token punctuation">(</span>r <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">int</span> nc <span class="token operator">=</span> <span class="token function">read</span><span class="token punctuation">(</span>skipBuffer<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span><span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>r<span class="token punctuation">,</span> nn<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>nc <span class="token operator">==</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            r <span class="token operator">-=</span> nc<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">return</span> n <span class="token operator">-</span> r<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ready" tabindex="-1"><a class="header-anchor" href="#ready"><span>Ready</span></a></h2><p>函数返回 <code>true</code> 代表下一次的 <code>read()</code> 不会阻塞。这个函数应该是为 NIO 服务的。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Tells whether this stream is ready to be read.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> True if the next read() is guaranteed not to block for input,</span>
<span class="line"> * false otherwise.  Note that returning false does not guarantee that the</span>
<span class="line"> * next read will block.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">ready</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="mark-support" tabindex="-1"><a class="header-anchor" href="#mark-support"><span>Mark Support</span></a></h2><p>与 Stream 类似，通过 <code>mark()</code> 和 <code>reset()</code> 能够使 <code>read()</code> 能够 mark 的位置反复读取。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Tells whether this stream supports the mark() operation. The default</span>
<span class="line"> * implementation always returns false. Subclasses should override this</span>
<span class="line"> * method.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> true if and only if this stream supports the mark operation.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">markSupported</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Marks the present position in the stream.  Subsequent calls to reset()</span>
<span class="line"> * will attempt to reposition the stream to this point.  Not all</span>
<span class="line"> * character-input streams support the mark() operation.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>  <span class="token parameter">readAheadLimit</span>  Limit on the number of characters that may be</span>
<span class="line"> *                         read while still preserving the mark.  After</span>
<span class="line"> *                         reading this many characters, attempting to</span>
<span class="line"> *                         reset the stream may fail.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If the stream does not support mark(),</span>
<span class="line"> *                          or if some other I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">mark</span><span class="token punctuation">(</span><span class="token keyword">int</span> readAheadLimit<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IOException</span><span class="token punctuation">(</span><span class="token string">&quot;mark() not supported&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Resets the stream.  If the stream has been marked, then attempt to</span>
<span class="line"> * reposition it at the mark.  If the stream has not been marked, then</span>
<span class="line"> * attempt to reset it in some way appropriate to the particular stream,</span>
<span class="line"> * for example by repositioning it to its starting point.  Not all</span>
<span class="line"> * character-input streams support the reset() operation, and some support</span>
<span class="line"> * reset() without supporting mark().</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If the stream has not been marked,</span>
<span class="line"> *                          or if the mark has been invalidated,</span>
<span class="line"> *                          or if the stream does not support reset(),</span>
<span class="line"> *                          or if some other I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">reset</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IOException</span><span class="token punctuation">(</span><span class="token string">&quot;reset() not supported&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="close" tabindex="-1"><a class="header-anchor" href="#close"><span>Close</span></a></h2><p>需要由子类 override。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Closes the stream and releases any system resources associated with</span>
<span class="line"> * it.  Once the stream has been closed, further read(), ready(),</span>
<span class="line"> * mark(), reset(), or skip() invocations will throw an IOException.</span>
<span class="line"> * Closing a previously closed stream has no effect.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  If an I/O error occurs</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">abstract</span> <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,33)]))}const o=n(l,[["render",c],["__file","Abstract Class - java.io.Reader.html.vue"]]),r=JSON.parse('{"path":"/jdk-source-code-analysis/java.io/Abstract%20Class%20-%20java.io.Reader.html","title":"Abstract Class - java.io.Reader","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Constructor","slug":"constructor","link":"#constructor","children":[]},{"level":2,"title":"Read","slug":"read","link":"#read","children":[]},{"level":2,"title":"Skip","slug":"skip","link":"#skip","children":[]},{"level":2,"title":"Ready","slug":"ready","link":"#ready","children":[]},{"level":2,"title":"Mark Support","slug":"mark-support","link":"#mark-support","children":[]},{"level":2,"title":"Close","slug":"close","link":"#close","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.io/Abstract Class - java.io.Reader.md"}');export{o as comp,r as data};
