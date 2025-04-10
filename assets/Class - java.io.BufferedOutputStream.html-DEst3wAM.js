import{_ as n,c as a,a as e,o as t}from"./app-CT9FvwxE.js";const p={};function l(c,s){return t(),a("div",null,s[0]||(s[0]=[e(`<h1 id="class-java-io-bufferedoutputstream" tabindex="-1"><a class="header-anchor" href="#class-java-io-bufferedoutputstream"><span>Class - java.io.BufferedOutputStream</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 12 / 05 10:21</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><p>该类对用户的写操作进行了缓存，因此用户的每一次写操作 <strong>不再必须</strong> 引发对底层系统的写调用。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The class implements a buffered output stream. By setting up such</span>
<span class="line"> * an output stream, an application can write bytes to the underlying</span>
<span class="line"> * output stream without necessarily causing a call to the underlying</span>
<span class="line"> * system for each byte written.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@author</span>  Arthur van Hoff</span>
<span class="line"> * <span class="token keyword">@since</span>   JDK1.0</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span></span>
<span class="line"><span class="token keyword">class</span> <span class="token class-name">BufferedOutputStream</span> <span class="token keyword">extends</span> <span class="token class-name">FilterOutputStream</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="fields" tabindex="-1"><a class="header-anchor" href="#fields"><span>Fields</span></a></h2><p>类内用一个字节数组 <code>buf</code> 作为缓存，从数组的 <code>0</code> 位置开始是有效的，<code>count</code> 记录了数组中的有效字节长度。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The internal buffer where data is stored.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token keyword">byte</span> buf<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The number of valid bytes in the buffer. This value is always</span>
<span class="line"> * in the range <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token number">0</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span> through <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">buf<span class="token punctuation">.</span>length</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span>; elements</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">buf<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span> through <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>tt</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">buf<span class="token punctuation">[</span>count<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>tt</span><span class="token punctuation">&gt;</span></span> contain valid</span>
<span class="line"> * byte data.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">protected</span> <span class="token keyword">int</span> count<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor"><span>Constructor</span></a></h2><p>构造函数，支持默认的 buffer 大小，也支持自定义的。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Creates a new buffered output stream to write data to the</span>
<span class="line"> * specified underlying output stream.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>   <span class="token parameter">out</span>   the underlying output stream.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token class-name">BufferedOutputStream</span><span class="token punctuation">(</span><span class="token class-name">OutputStream</span> out<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">this</span><span class="token punctuation">(</span>out<span class="token punctuation">,</span> <span class="token number">8192</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Creates a new buffered output stream to write data to the</span>
<span class="line"> * specified underlying output stream with the specified buffer</span>
<span class="line"> * size.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>   <span class="token parameter">out</span>    the underlying output stream.</span>
<span class="line"> * <span class="token keyword">@param</span>   <span class="token parameter">size</span>   the buffer size.</span>
<span class="line"> * <span class="token keyword">@exception</span> <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span> if size <span class="token entity named-entity" title="&lt;">&amp;lt;</span>= 0.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token class-name">BufferedOutputStream</span><span class="token punctuation">(</span><span class="token class-name">OutputStream</span> out<span class="token punctuation">,</span> <span class="token keyword">int</span> size<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">super</span><span class="token punctuation">(</span>out<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>size <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;Buffer size &lt;= 0&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    buf <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">byte</span><span class="token punctuation">[</span>size<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="flush" tabindex="-1"><a class="header-anchor" href="#flush"><span>Flush</span></a></h2><p>这里的 flush 包含两层含义：</p><ol><li>将类内 buffer 中缓存的数据 <code>write</code> 到底层输出流中，这种 flush 是自动触发的</li><li>将类内 buffer 中缓存的数据 <code>write</code> 到底层输出流，并调用底层输出流的 <code>flush</code> 写入底层系统，由 <code>flush()</code> 函数手动触发</li></ol><p>自动触发的 flush 一般由类的 <code>write()</code> 函数触发，因为缓存的 buffer 装不下了，所以需要向底层输出流 <code>write()</code> 一次：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/** Flush the internal buffer */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">flushBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>count <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        out<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span>buf<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> count<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        count <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Flushes this buffered output stream. This forces any buffered</span>
<span class="line"> * output bytes to be written out to the underlying output stream.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  if an I/O error occurs.</span>
<span class="line"> * <span class="token keyword">@see</span>        <span class="token reference"><span class="token namespace">java<span class="token punctuation">.</span>io<span class="token punctuation">.</span></span><span class="token class-name">FilterOutputStream</span><span class="token punctuation">#</span><span class="token field">out</span></span></span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">flush</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">flushBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    out<span class="token punctuation">.</span><span class="token function">flush</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="write" tabindex="-1"><a class="header-anchor" href="#write"><span>Write</span></a></h2><p>该类重写了父类的写操作，调用该类的 <code>write()</code> 后，通过参数传入的数据会被缓存到 <code>buf</code> 中。只有当 <code>buf</code> 装不下的时候，才会触发调用底层输出流的 <code>write()</code>，清空 <code>buf</code>。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Writes the specified byte to this buffered output stream.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">b</span>   the byte to be written.</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  if an I/O error occurs.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token keyword">int</span> b<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>count <span class="token operator">&gt;=</span> buf<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">flushBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    buf<span class="token punctuation">[</span>count<span class="token operator">++</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">byte</span><span class="token punctuation">)</span>b<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Writes <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">len</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> bytes from the specified byte array</span>
<span class="line"> * starting at offset <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">off</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> to this buffered output stream.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span> Ordinarily this method stores bytes from the given array into this</span>
<span class="line"> * stream&#39;s buffer, flushing the buffer to the underlying output stream as</span>
<span class="line"> * needed.  If the requested length is at least as large as this stream&#39;s</span>
<span class="line"> * buffer, however, then this method will flush the buffer and write the</span>
<span class="line"> * bytes directly to the underlying output stream.  Thus redundant</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">BufferedOutputStream</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>s will not copy data unnecessarily.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">b</span>     the data.</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">off</span>   the start offset in the data.</span>
<span class="line"> * <span class="token keyword">@param</span>      <span class="token parameter">len</span>   the number of bytes to write.</span>
<span class="line"> * <span class="token keyword">@exception</span>  <span class="token reference"><span class="token class-name">IOException</span></span>  if an I/O error occurs.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token keyword">byte</span> b<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">int</span> off<span class="token punctuation">,</span> <span class="token keyword">int</span> len<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>len <span class="token operator">&gt;=</span> buf<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* If the request length exceeds the size of the output buffer,</span>
<span class="line">           flush the output buffer and then write the data directly.</span>
<span class="line">           In this way buffered streams will cascade harmlessly. */</span></span>
<span class="line">        <span class="token function">flushBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        out<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span>b<span class="token punctuation">,</span> off<span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>len <span class="token operator">&gt;</span> buf<span class="token punctuation">.</span>length <span class="token operator">-</span> count<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">flushBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">arraycopy</span><span class="token punctuation">(</span>b<span class="token punctuation">,</span> off<span class="token punctuation">,</span> buf<span class="token punctuation">,</span> count<span class="token punctuation">,</span> len<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    count <span class="token operator">+=</span> len<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,24)]))}const o=n(p,[["render",l],["__file","Class - java.io.BufferedOutputStream.html.vue"]]),u=JSON.parse('{"path":"/jdk-source-code-analysis/java.io/Class%20-%20java.io.BufferedOutputStream.html","title":"Class - java.io.BufferedOutputStream","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Fields","slug":"fields","link":"#fields","children":[]},{"level":2,"title":"Constructor","slug":"constructor","link":"#constructor","children":[]},{"level":2,"title":"Flush","slug":"flush","link":"#flush","children":[]},{"level":2,"title":"Write","slug":"write","link":"#write","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.io/Class - java.io.BufferedOutputStream.md"}');export{o as comp,u as data};
