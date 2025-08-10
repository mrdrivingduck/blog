import{_ as n,c as a,a as e,o as l}from"./app-7eKjwDat.js";const i="/blog/assets/antlr-gen-kFD5D7XW.png",p="/blog/assets/antlr-test-rule-DpsO8EHy.png",t="/blog/assets/antlr-preview-DT28kA48.png",c={};function o(r,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="antlr-basic" tabindex="-1"><a class="header-anchor" href="#antlr-basic"><span>ANTLR - Basic</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 01 / 14 17:25</p><p>Nanjing, Jiangsu, China</p><hr><p><strong>ANTLR (ANother Tool for Language Recognition)</strong> 是一套计算机语言处理框架，可用于对特定语法的语言进行词法分析、语法分析、语法树构建。最新的 ANTLR v4 规定了一套 <strong>g4</strong> 语法。g4 语法可以针对对象语言进行类似 <em>巴克斯范式 (Backus-Naur From, BNF)</em> 的描述。ANTLR 可以将 g4 语法文件直接转换为词法分析和语法分析的 Java 代码 (或其它实现语言)，这样就可以得到一个 Java 实现的语言识别器，比如：</p><ul><li>SQL 识别器</li><li>JSON 识别器</li></ul><p>除了用于自动生成 Java 代码，ANTLR 还提供一个 <a href="https://github.com/antlr/antlr4" target="_blank" rel="noopener noreferrer">Runtime 工具</a>，用于为自动生成的 Java 代码的执行提供支持。Runtime 需要作为依赖 (如 Maven) 引入。对于流行通用的编程语言、格式，开源社区都已经提供了 <a href="https://github.com/antlr/grammars-v4" target="_blank" rel="noopener noreferrer">现成的 g4 语法文件</a> 🤞</p><p>本文以生成一个 Java 版本的 JSON 解析器作为 🌰。</p><h2 id="example" tabindex="-1"><a class="header-anchor" href="#example"><span>Example</span></a></h2><p>以下是 <em>grammars-v4</em> 中提供的 JSON 语法文件 <code>JSON.g4</code></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">/** Taken from &quot;The Definitive ANTLR 4 Reference&quot; by Terence Parr */</span>
<span class="line"></span>
<span class="line">// Derived from http://json.org</span>
<span class="line">grammar JSON;</span>
<span class="line"></span>
<span class="line">json</span>
<span class="line">   : value</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">obj</span>
<span class="line">   : &#39;{&#39; pair (&#39;,&#39; pair)* &#39;}&#39;</span>
<span class="line">   | &#39;{&#39; &#39;}&#39;</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">pair</span>
<span class="line">   : STRING &#39;:&#39; value</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">array</span>
<span class="line">   : &#39;[&#39; value (&#39;,&#39; value)* &#39;]&#39;</span>
<span class="line">   | &#39;[&#39; &#39;]&#39;</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">value</span>
<span class="line">   : STRING</span>
<span class="line">   | NUMBER</span>
<span class="line">   | obj</span>
<span class="line">   | array</span>
<span class="line">   | &#39;true&#39;</span>
<span class="line">   | &#39;false&#39;</span>
<span class="line">   | &#39;null&#39;</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">STRING</span>
<span class="line">   : &#39;&quot;&#39; (ESC | SAFECODEPOINT)* &#39;&quot;&#39;</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">fragment ESC</span>
<span class="line">   : &#39;\\\\&#39; ([&quot;\\\\/bfnrt] | UNICODE)</span>
<span class="line">   ;</span>
<span class="line">fragment UNICODE</span>
<span class="line">   : &#39;u&#39; HEX HEX HEX HEX</span>
<span class="line">   ;</span>
<span class="line">fragment HEX</span>
<span class="line">   : [0-9a-fA-F]</span>
<span class="line">   ;</span>
<span class="line">fragment SAFECODEPOINT</span>
<span class="line">   : ~ [&quot;\\\\\\u0000-\\u001F]</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">NUMBER</span>
<span class="line">   : &#39;-&#39;? INT (&#39;.&#39; [0-9] +)? EXP?</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">fragment INT</span>
<span class="line">   : &#39;0&#39; | [1-9] [0-9]*</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">// no leading zeros</span>
<span class="line"></span>
<span class="line">fragment EXP</span>
<span class="line">   : [Ee] [+\\-]? INT</span>
<span class="line">   ;</span>
<span class="line"></span>
<span class="line">// \\- since - means &quot;range&quot; inside [...]</span>
<span class="line"></span>
<span class="line">WS</span>
<span class="line">   : [ \\t\\n\\r] + -&gt; skip</span>
<span class="line">   ;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有了这个文件，可以借助 ANTLR 的工具直接生成识别 JSON 的 Java 代码。</p><p>ANTLR 提供命令行版本的工具，但更方便的还是集成在 IDEA 中的插件：</p><img src="`+i+`" alt="antlr-gen" style="zoom:50%;"><p>对语法文件进行 <code>Generate ANTLR Recognizer</code> 后，可以看到自动生成了一些文件。其中核心的文件是：</p><ul><li><code>JSONLexer.java</code>：词法分析代码</li><li><code>JSONParser.java</code>：语法分析代码</li></ul><p>生成的其它的文件接下来再作解释。接下来，在项目中引入 ANTLR Runtime 依赖。由 ANTLR Runtime 支持，这些类就可以被实例化了：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">CharStream</span> input <span class="token operator">=</span> <span class="token class-name">CharStreams</span><span class="token punctuation">.</span><span class="token function">fromString</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">JSONLexer</span> lexer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">JSONLexer</span><span class="token punctuation">(</span>input<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">CommonTokenStream</span> tokens <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">CommonTokenStream</span><span class="token punctuation">(</span>lexer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">JSONParser</span> parser <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">JSONParser</span><span class="token punctuation">(</span>tokens<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行该程序，可以看到指定的输入是否可以被该识别器所接受。</p><p>此外，插件还带有语法树预览的功能，在语法文件的 <em>top-level rule (顶层语法规则)</em> 右击 <code>Test Rule &lt;rule_name&gt;</code>：</p><img src="`+p+'" alt="antlr-test-rule" style="zoom:50%;"><p>从文本框或文件接收测试输入后，就能看到预览的 AST：</p><p><img src="'+t+`" alt="antlr-preview"></p><h2 id="listener-visitor" tabindex="-1"><a class="header-anchor" href="#listener-visitor"><span>Listener &amp;&amp; Visitor</span></a></h2><p>使用 ANTLR 框架的更多需求是，当进入或退出某条语法规则的时候，我们可能想做一些事情，比如在 AST 上做一定的转换。ANTLR 允许我们在语法树上注册回调函数，并提供了两种遍历方式 - listener 和 visitor。</p><h3 id="listener" tabindex="-1"><a class="header-anchor" href="#listener"><span>Listener</span></a></h3><p>使用 ANTLR 的代码生成工具，得到了一个 <code>JSONListener.java</code>。这是一个接口文件，里面定义了 <strong>进入</strong> 和 <strong>退出</strong> 每一条语法规则的函数：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">JSONListener</span> <span class="token keyword">extends</span> <span class="token class-name">ParseTreeListener</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Enter a parse tree produced by <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">json</span></span><span class="token punctuation">}</span>.</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">void</span> <span class="token function">enterJson</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>JsonContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Exit a parse tree produced by <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">json</span></span><span class="token punctuation">}</span>.</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">void</span> <span class="token function">exitJson</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>JsonContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Enter a parse tree produced by the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AnObject</span></span></span><span class="token punctuation">}</span></span>
<span class="line">     * labeled alternative in <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">obj</span></span><span class="token punctuation">}</span>.</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">void</span> <span class="token function">enterAnObject</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>AnObjectContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Exit a parse tree produced by the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AnObject</span></span></span><span class="token punctuation">}</span></span>
<span class="line">     * labeled alternative in <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">obj</span></span><span class="token punctuation">}</span>.</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">void</span> <span class="token function">exitAnObject</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>AnObjectContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实际上内部继承了 ANTLR Runtime 的 <code>ParseTreeListener</code> 类。在大部分情况下，我们只希望指定某几个规则的行为，其它的什么也不做。</p><p>ANTLR 已经自动生成了一个 <code>JSONBaseListener.java</code>，该类实现了上述接口中定义的每一个 <code>enter</code> / <code>exit</code> 函数，但每个函数的实现都是空的。我们只需新建一个继承自 <code>JSONBaseListener</code> 的 Class，并只需要 override 我们想要操作的那几条规则对应的函数即可。</p><ul><li>如果 override <code>enter</code> 函数，则是一种先序遍历的逻辑</li><li>如果 override <code>exit</code> 函数，则是一种后序遍历的逻辑</li></ul><p>遍历的具体过程：</p><ol><li>遍历到一个结点时，自动调用 <code>enter</code> 函数</li><li>自动遍历所有的子结点</li><li>子结点遍历完毕后，自动调用 <code>exit</code> 函数</li></ol><p>在遍历到某一结点时，可以通过参数中的 context 取得结点上的信息。</p><p>遍历的基本代码如下：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token comment">// 用之前实例化的 parser，实例化从顶层规则开始的语法树 (json 是顶层规则)</span></span>
<span class="line"><span class="token class-name">ParseTree</span> tree <span class="token operator">=</span> parser<span class="token punctuation">.</span><span class="token function">json</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">// 实例化一个 listener</span></span>
<span class="line"><span class="token class-name">JSON2XML<span class="token punctuation">.</span>XMLEmitter</span> listener <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">JSON2XML<span class="token punctuation">.</span>XMLEmitter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">// 实例化 walker</span></span>
<span class="line"><span class="token class-name">ParseTreeWalker</span> walker <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ParseTreeWalker</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token comment">// 通过 walker，向语法树上注册 listener 并遍历</span></span>
<span class="line">walker<span class="token punctuation">.</span><span class="token function">walk</span><span class="token punctuation">(</span>listener<span class="token punctuation">,</span> tree<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="visitor" tabindex="-1"><a class="header-anchor" href="#visitor"><span>Visitor</span></a></h3><p>ANTLR 的代码生成工具也自动生成了一个 <code>JSONVisitor.java</code>。这个文件也是一个接口，里面定义了访问到每一条语法规则对应结点的函数：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">JSONVisitor</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">extends</span> <span class="token class-name">ParseTreeVisitor</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span></span>
<span class="line">	<span class="token doc-comment comment">/**</span>
<span class="line">	 * Visit a parse tree produced by <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">json</span></span><span class="token punctuation">}</span>.</span>
<span class="line">	 * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">	 * <span class="token keyword">@return</span> the visitor result</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token class-name">T</span> <span class="token function">visitJson</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>JsonContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">	<span class="token doc-comment comment">/**</span>
<span class="line">	 * Visit a parse tree produced by the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AnObject</span></span></span><span class="token punctuation">}</span></span>
<span class="line">	 * labeled alternative in <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">JSONParser</span><span class="token punctuation">#</span><span class="token field">obj</span></span><span class="token punctuation">}</span>.</span>
<span class="line">	 * <span class="token keyword">@param</span> <span class="token parameter">ctx</span> the parse tree</span>
<span class="line">	 * <span class="token keyword">@return</span> the visitor result</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token class-name">T</span> <span class="token function">visitAnObject</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>AnObjectContext</span> ctx<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>与 listener 的区别在于，<code>visit</code> 函数在访问到某个结点时被触发。如果还想继续访问子结点，需要显式调用 <code>visitChild()</code> 函数。否则，遍历深度就在该结点中止。</p><p>同样，代码生成工具生成了 <code>JSONBaseVisitor.java</code>，该类实现了接口中定义的所有函数，并在每个函数中默认调用了 <code>visitChild()</code> 函数以继续进行遍历：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@inheritDoc</span><span class="token punctuation">}</span></span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>The default implementation returns the result of calling</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token punctuation">#</span><span class="token field">visitChildren</span></span><span class="token punctuation">}</span> on <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">ctx</span></span><span class="token punctuation">}</span>.<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> */</span></span>
<span class="line"><span class="token annotation punctuation">@Override</span> <span class="token keyword">public</span> <span class="token class-name">T</span> <span class="token function">visitJson</span><span class="token punctuation">(</span><span class="token class-name">JSONParser<span class="token punctuation">.</span>JsonContext</span> ctx<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token function">visitChildren</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果需要自定义实现逻辑，只需新建一个继承自 <code>JSONBaseVisitor</code> 的 Class，并 override 对应函数即可：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">JSONBaseVisitor</span> visitor <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">JSONBaseVisitor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">visitor<span class="token punctuation">.</span><span class="token function">visit</span><span class="token punctuation">(</span>tree<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 实例化 visitor，并 visit 语法树</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="label" tabindex="-1"><a class="header-anchor" href="#label"><span>Label</span></a></h3><p>对于某一条语法规则，如果想生成更加细粒度的函数进行分别处理该怎么做？</p><p>比如，对于 JSON 中 value 的取值：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">value</span>
<span class="line">   : STRING</span>
<span class="line">   | NUMBER</span>
<span class="line">   | obj</span>
<span class="line">   | array</span>
<span class="line">   | &#39;true&#39;</span>
<span class="line">   | &#39;false&#39;</span>
<span class="line">   | &#39;null&#39;</span>
<span class="line">   ;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>想对数字 (<code>NUMBER</code>)、布尔值 (<code>true</code> / <code>false</code>)、空值 (<code>null</code>) 作特殊处理，而对其它的不作。按照默认的模式，应当只会生成 <code>enterValue()</code> / <code>exitValue()</code> / <code>visitValue()</code>，无法满足这一需求。那么可以在语法文件中加入 label，细化要产生的函数：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">value</span>
<span class="line">   : STRING  # String</span>
<span class="line">   | NUMBER  # Atom</span>
<span class="line">   | obj     # ObjectValue</span>
<span class="line">   | array   # ArrayValue</span>
<span class="line">   | &#39;true&#39;  # Atom</span>
<span class="line">   | &#39;false&#39; # Atom</span>
<span class="line">   | &#39;null&#39;  # Atom</span>
<span class="line">   ;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意，label 在一条规则中要么全加，要么全不加</p></blockquote><p>然后重新使用 ANTLR 的代码生成工具，可以看到额外产生了四组函数：</p><ul><li><code>enterString()</code> / <code>exitString()</code> / <code>visitString()</code></li><li><code>enterObjectValue()</code> / <code>exitObjectValue()</code> / <code>visitObjectValue()</code></li><li><code>enterArrayValue()</code> / <code>exitArrayValue()</code> / <code>visitArrayValue()</code></li><li><code>enterAtom()</code> / <code>exitAtom()</code> / <code>visitAtom()</code></li></ul><p>这样，就可以按类别分别实现自定义操作了。</p><h2 id="case-insensitive-lexing" tabindex="-1"><a class="header-anchor" href="#case-insensitive-lexing"><span>Case-Insensitive Lexing</span></a></h2><p>对于 SQL 等一些 (关键字以外) 大小写不敏感的语言的处理方式：</p><ul><li><a href="https://github.com/antlr/antlr4/blob/master/doc/case-insensitive-lexing.md#custom-character-streams-approach" target="_blank" rel="noopener noreferrer">Case-Insensitive Lexing</a></li></ul><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>这套工具由旧金山大学的 <a href="https://github.com/parrt" target="_blank" rel="noopener noreferrer">Terence Parr</a> 教授开发。我本人很佩服这套框架的定位：类似于 LLVM 编译器的前后端解耦，ANTLR 实现了语法和应用逻辑的解耦，使我们在大部分应用场景下，不用太关心语法的具体细节，不再需要专门实现语法的解析逻辑，因为 ANTLR 帮我们完成了最复杂的 <strong>语法 → 应用程序</strong> 的自动转换。(实际上也就是词法、语法分析代码的自动生成)</p><p>此外，具体的语法细节由相关方面的专家代为完成，有了这套框架，开发与语言相关的应用将更为容易。</p>`,61)]))}const u=n(c,[["render",o],["__file","ANTLR Basic.html.vue"]]),v=JSON.parse('{"path":"/notes/Compiler/ANTLR%20Basic.html","title":"ANTLR - Basic","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Example","slug":"example","link":"#example","children":[]},{"level":2,"title":"Listener && Visitor","slug":"listener-visitor","link":"#listener-visitor","children":[{"level":3,"title":"Listener","slug":"listener","link":"#listener","children":[]},{"level":3,"title":"Visitor","slug":"visitor","link":"#visitor","children":[]},{"level":3,"title":"Label","slug":"label","link":"#label","children":[]}]},{"level":2,"title":"Case-Insensitive Lexing","slug":"case-insensitive-lexing","link":"#case-insensitive-lexing","children":[]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"notes/Compiler/ANTLR Basic.md"}');export{u as comp,v as data};
