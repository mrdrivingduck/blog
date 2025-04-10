import{_ as s,c as a,a as e,o as p}from"./app-CT9FvwxE.js";const t={};function l(o,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="chapter-8-3-函数调用" tabindex="-1"><a class="header-anchor" href="#chapter-8-3-函数调用"><span>Chapter 8.3 - 函数调用</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 01 / 30 22:58 🧨🧧</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_8-3-函数调用" tabindex="-1"><a class="header-anchor" href="#_8-3-函数调用"><span>8.3 函数调用</span></a></h2><p>在执行函数中的具体代码之前，需要确定被调用的函数的版本 (哪一个函数被调用)。一切函数的调用在 Class 文件中都只是符号引用，而不是函数在实际运行时内存布局中的入口地址 (直接引用)。</p><h3 id="_8-3-1-解析-resolution" tabindex="-1"><a class="header-anchor" href="#_8-3-1-解析-resolution"><span>8.3.1 解析 (Resolution)</span></a></h3><p>在类加载阶段，有一部分符号引用会被直接转化为直接引用。前提：</p><ul><li>函数在程序运行前就有一个 <strong>可确定的</strong> 调用版本</li><li>该函数的调用版本在运行期间不可改变</li></ul><p>满足 <strong>编译期可知，运行期不可变</strong> 要求的主要有：</p><ul><li>静态函数 - 与类型直接关联</li><li>私有函数 - 在外部不可被访问</li></ul><p>这两类函数的特性决定了它们不可能通过继承重写出其它版本，因此它们都在类加载阶段进行解析。<strong>非虚函数</strong> (Non-Virtual Method)：在类加载的时候可以把符号引用解析为直接引用：</p><ul><li>静态函数</li><li>私有函数</li><li>实例构造器 <code>&lt;init&gt;()</code></li><li>父类函数</li><li>被 <code>final</code> 修饰的函数</li></ul><p>解析调用是一个静态的过程，在编译期间就可以确定。在类加载的解析阶段就会把符号引用转换为直接引用，不必延迟到运行期再去完成。</p><h3 id="_8-3-2-分派-dispatch" tabindex="-1"><a class="header-anchor" href="#_8-3-2-分派-dispatch"><span>8.3.2 分派 (Dispatch)</span></a></h3><h4 id="_8-3-2-1-静态分派" tabindex="-1"><a class="header-anchor" href="#_8-3-2-1-静态分派"><span>8.3.2.1 静态分派</span></a></h4><p>例子：</p><ul><li><code>class Human</code></li><li><code>class Man extends Human</code></li><li><code>class Woman extends Human</code></li></ul><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">Human</span> man <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Man</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>将前面的 <code>Human</code> 称为静态类型，后面的 <code>Man</code> 实际类型或运行时类型。变量 <code>man</code> 本身的静态类型不会改变，是编译期可知的，但变量 <code>man</code> 的运行时类型在运行期才可确定。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token comment">// 运行时类型无法确定</span></span>
<span class="line"><span class="token class-name">Human</span> human <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Random</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextBoolean</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token keyword">new</span> <span class="token class-name">Man</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Woman</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 静态类型就算变化在编译期也可以确定</span></span>
<span class="line">sr<span class="token punctuation">.</span><span class="token function">sayHello</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">Man</span><span class="token punctuation">)</span> human<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">sr<span class="token punctuation">.</span><span class="token function">sayHello</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">Woman</span><span class="token punctuation">)</span> human<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>变量的实际类型必须能到程序运行时才能确定。JVM 在进行 <strong>函数重载</strong> 时通过参数的静态类型决定调用哪个重载版本，所有依赖静态类型来决定函数执行版本的分派动作，都称为静态分派。最典型的应用表现就是 <strong>函数重载</strong>。静态分派发生在编译阶段，因此分派不是由 JVM 来执行的。当函数没有合适的重载版本时，会发生安全的类型转换从而适配合适的重载版本。</p><h4 id="_8-3-2-2-动态分派" tabindex="-1"><a class="header-anchor" href="#_8-3-2-2-动态分派"><span>8.3.2.2 动态分派</span></a></h4><p>动态分派与 <strong>重写</strong> (Override) 有密切关联。在选择函数的执行版本时，不再根据静态类型来选择，而是根据运行时类型。在字节码的角度看，调用了 <code>invokevirtual</code> 指令。该指令的运行时解析过程分为以下几步：</p><ol><li>找到操作数栈顶元素指向对象的 <strong>运行时类型</strong></li><li>如果找到该类型中与常量描述符和简单名称都相符的函数，则进行访问权校验，如果通过则返回这个函数的直接引用；否则返回异常</li><li>否则，按照继承关系依次对各个父类重复上一步的搜索和验证过程</li><li>若始终没有找到合适的函数，则异常</li></ol><p>由于第一步就要确定元素的运行时类型，因此需要根据函数调用者的运行时类型来选择函数版本。在运行期根据实际类型确定函数执行版本的分派称为 <strong>动态分派</strong>。字段不使用 <code>invokevirtual</code> 指令，所以字段永远不参与多态：</p><ul><li>子类声明与父类同名的字段时，子类内存中两个字段都会存在</li><li>子类字段会遮蔽父类同名的字段</li></ul><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Father</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">int</span> money <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">Father</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        money <span class="token operator">=</span> <span class="token number">2</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">showMeTheMoney</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">showMeTheMoney</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;I am Father, I have $&quot;</span> <span class="token operator">+</span> money<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Son</span> <span class="token keyword">extends</span> <span class="token class-name">Father</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">int</span> money <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">Son</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        money <span class="token operator">=</span> <span class="token number">4</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">showMeTheMoney</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">showMeTheMoney</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;I am Son, I have $&quot;</span> <span class="token operator">+</span> money<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">Father</span> gay <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Son</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;This gay has $&quot;</span> <span class="token operator">+</span> gay<span class="token punctuation">.</span>money<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行结果：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">I am Son, I have $0</span>
<span class="line">I am Son, I have $4</span>
<span class="line">This gay has $2</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>为什么是 gay......</p></blockquote><p><code>Son</code> 创建时，隐式调用了 <code>Father</code> 类的构造函数。<code>Father</code> 类中调用的 <code>showMeTheMoney()</code> 是一个虚方法调用。</p><ul><li>因为对象的运行时类型是 <code>Son</code> 类</li><li>所以调用的是 <code>Son</code> 的 <code>showMeTheMoney()</code></li></ul><p>此时 <code>Son</code> 中的 <code>money</code> 经过了类初始化，但还没有调用构造函数，所以是 <code>0</code>。下面调用 <code>Son</code> 的构造函数，<code>money</code> 被赋值为 <code>4</code>，因此输出中是 <code>4</code>。最后显式输出 <code>Father</code> 的 <code>money</code>，经过赋值，<code>Father</code> 的 <code>money</code> 的值为 <code>2</code>。<code>Father</code> 和 <code>Son</code> 的 <code>money</code> 是两个独立的变量。</p><h4 id="_8-3-2-3-单分派与多分派" tabindex="-1"><a class="header-anchor" href="#_8-3-2-3-单分派与多分派"><span>8.3.2.3 单分派与多分派</span></a></h4><p>Java 的静态分派属于多分派：符号引用转换为直接引用时，有多个分派目标可供选择；Java 的动态分派属于单分派：符号引用转换为直接引用时，只有一个实际类型作为选择依据。Java 是一门静态多分派、动态单分派的语言。</p><h4 id="_8-3-2-4-虚拟机动态分派的实现" tabindex="-1"><a class="header-anchor" href="#_8-3-2-4-虚拟机动态分派的实现"><span>8.3.2.4 虚拟机动态分派的实现</span></a></h4><p>每次运行时进行符号引用到直接引用的转换。JVM 真正运行时不会如此频繁地访问类的 metadata，常见的优化手段是在方法区建立 <strong>虚方法表</strong>，代替元数据查找以提高性能：</p><ul><li>虚方法表存放各个方法入口的实际地址</li><li>若子类没有重写父类方法，则入口指向父类相同方法的入口</li><li>若子类重写了方法，子类虚方法表的入口被替换为子类实现版本的入口地址</li></ul><p>虚方法表在类加载的链接阶段进行初始化，准备了类变量的初始值后，虚方法表也会被初始化完毕。</p><hr><h2 id="_8-4-动态类型语言支持" tabindex="-1"><a class="header-anchor" href="#_8-4-动态类型语言支持"><span>8.4 动态类型语言支持</span></a></h2><p><code>var</code> 是在编译时根据赋值符号右边的表达式静态推断数据类型，本质上是一种语法糖，不是动态类型。<code>dynamic</code> 在编译时不关心类型，等到运行时再进行类型判断。JVM 诞生之后，只增加过一条字节码指令 - <code>invokedynamic</code>。</p>`,44)]))}const i=s(t,[["render",l],["__file","Chapter 8.3 函数调用.html.vue"]]),u=JSON.parse('{"path":"/understanding-the-jvm-notes/Part%203%20-%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%89%A7%E8%A1%8C%E5%AD%90%E7%B3%BB%E7%BB%9F/Chapter%208.3%20%E5%87%BD%E6%95%B0%E8%B0%83%E7%94%A8.html","title":"Chapter 8.3 - 函数调用","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"8.3 函数调用","slug":"_8-3-函数调用","link":"#_8-3-函数调用","children":[{"level":3,"title":"8.3.1 解析 (Resolution)","slug":"_8-3-1-解析-resolution","link":"#_8-3-1-解析-resolution","children":[]},{"level":3,"title":"8.3.2 分派 (Dispatch)","slug":"_8-3-2-分派-dispatch","link":"#_8-3-2-分派-dispatch","children":[]}]},{"level":2,"title":"8.4 动态类型语言支持","slug":"_8-4-动态类型语言支持","link":"#_8-4-动态类型语言支持","children":[]}],"git":{},"filePathRelative":"understanding-the-jvm-notes/Part 3 - 虚拟机执行子系统/Chapter 8.3 函数调用.md"}');export{i as comp,u as data};
