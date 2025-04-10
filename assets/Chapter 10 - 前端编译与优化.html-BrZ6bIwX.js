import{_ as n,c as s,a as e,o as t}from"./app-CT9FvwxE.js";const p={};function l(i,a){return t(),s("div",null,a[0]||(a[0]=[e(`<h1 id="chapter-10-前端编译与优化" tabindex="-1"><a class="header-anchor" href="#chapter-10-前端编译与优化"><span>Chapter 10 - 前端编译与优化</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 02 / 01 17:20 🧨🧧</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_10-1-概述" tabindex="-1"><a class="header-anchor" href="#_10-1-概述"><span>10.1 概述</span></a></h2><ul><li>前端编译器：把 <code>*.java</code> 文件转换为 <code>*.class</code> 文件的过程</li><li>JVM 即时编译器 (Just In Time Compiler)：运行期把字节码转换为本地机器码的过程</li><li>AOT 编译器 (Ahead Of Time Compiler)：直接把程序编译成目标机器指令集相关的二进制代码</li></ul><p>前端编译器对代码的运行效率几乎没有任何优化措施。JVM 设计团队选择把对性能的优化全部集中到 JIT 编译器中，这样可以让非 Javac 产生的 Class 文件也可以被优化。JIT 编译器在运行时优化过程，使程序执行效率不断提高；前端编译器在编译期优化过程，使程序员的编码效率和语言使用者的幸福感提高。</p><h2 id="_10-2-javac-编译器" tabindex="-1"><a class="header-anchor" href="#_10-2-javac-编译器"><span>10.2 Javac 编译器</span></a></h2><p>是一个由 Java 语言编写的程序，在 JDK 6 发布时称为标准 Java 类库。JVM 规范对如何把 Java 源码翻译为 Class 文件描述得很宽松，从而给 Java 前端编译器较大的实现灵活性。</p><h3 id="_10-2-2-解析与填充符号表" tabindex="-1"><a class="header-anchor" href="#_10-2-2-解析与填充符号表"><span>10.2.2 解析与填充符号表</span></a></h3><h4 id="_10-2-2-1-词法、语法分析" tabindex="-1"><a class="header-anchor" href="#_10-2-2-1-词法、语法分析"><span>10.2.2.1 词法、语法分析</span></a></h4><p>词法分析将源代码的字符流转换为 token。Token 是编译时的最小元素。语法分析是根据 token 序列构造抽象语法树的过程，抽象语法树 (Abstract Syntax Tree) 的每一个结点代表着程序代码中的一个语法结构。后续操作全部都建立在抽象语法树上。</p><h4 id="_10-2-2-2-填充符号表" tabindex="-1"><a class="header-anchor" href="#_10-2-2-2-填充符号表"><span>10.2.2.2 填充符号表</span></a></h4><p>是一组符号地址和符号信息构成的数据结构，符号表中登记的信息在编译的不同阶段都要被用到。</p><h3 id="_10-2-3-注解处理器" tabindex="-1"><a class="header-anchor" href="#_10-2-3-注解处理器"><span>10.2.3 注解处理器</span></a></h3><p>在编译期对代码中的特定注解进行处理，允许读取、修改、添加 AST 中的任意元素。如果在处理注解期间对 AST 进行过修改，则需要回到上一步骤重新处理，直到所有插入式注解处理器都不再对语法树进行修改为止。</p><h3 id="_10-2-4-语义分析与字节码生成" tabindex="-1"><a class="header-anchor" href="#_10-2-4-语义分析与字节码生成"><span>10.2.4 语义分析与字节码生成</span></a></h3><p>AST 能够表示一个结构正确的源程序，但无法保证源程序的语义是符合逻辑的。语义分析的主要任务是对结构上正确的源程序进行上下文相关性质的检查，在 IDE 中编码时看到的红线错误提示，绝大部分来源于语义分析阶段的检查结果。</p><h4 id="_10-2-4-1-标注检查" tabindex="-1"><a class="header-anchor" href="#_10-2-4-1-标注检查"><span>10.2.4.1 标注检查</span></a></h4><p>检查变量使用前是否已被声明，变量与赋值之间的数据类型是否能够匹配，进行 <strong>常量折叠</strong> (Constant Folding) 的代码优化。</p><h4 id="_10-2-4-2-数据及控制流分析" tabindex="-1"><a class="header-anchor" href="#_10-2-4-2-数据及控制流分析"><span>10.2.4.2 数据及控制流分析</span></a></h4><h4 id="_10-2-4-3-解语法糖" tabindex="-1"><a class="header-anchor" href="#_10-2-4-3-解语法糖"><span>10.2.4.3 解语法糖</span></a></h4><p><strong>语法糖</strong> (Syntactic Sugar) 指在计算机语言中添加某种语法，对语言编译结果和功能没有实际影响，但能够方便程序员使用该语言。</p><h4 id="_10-2-4-4-字节码生成" tabindex="-1"><a class="header-anchor" href="#_10-2-4-4-字节码生成"><span>10.2.4.4 字节码生成</span></a></h4><p>将实例构造器 <code>&lt;init&gt;()</code> 函数和类构造器 <code>&lt;clinit&gt;()</code> 函数加入语法树，保证无论源码中出现的顺序如何，一定先执行父类的实例构造器，再初始化变量，最终执行语句块。</p><h2 id="_10-3-java-语法糖的味道" tabindex="-1"><a class="header-anchor" href="#_10-3-java-语法糖的味道"><span>10.3 Java 语法糖的味道</span></a></h2><h3 id="_10-3-1-泛型" tabindex="-1"><a class="header-anchor" href="#_10-3-1-泛型"><span>10.3.1 泛型</span></a></h3><p>泛型的本质是将操作的数据类型指定为方法签名中的一种特殊参数。</p><h4 id="_10-3-1-1-java-与-c-的泛型" tabindex="-1"><a class="header-anchor" href="#_10-3-1-1-java-与-c-的泛型"><span>10.3.1.1 Java 与 C# 的泛型</span></a></h4><ul><li>Java 实现的泛型 - 类型擦除式泛型 (Type Erasure Generics)</li><li>C# 实现的泛型 - 具现化式泛型 (Reified Generics)</li></ul><p>C# 的泛型无论在程序源码中、编译后的中间表示中、运行期中都是切实存在的，因此 <code>List&lt;int&gt;</code> 和 <code>List&lt;string&gt;</code> 是两个不同的类型。而 Java 的泛型只在程序源码中，在编译后的字节码中全部被替换为 <strong>裸类型</strong> (Raw Type)，并在相应地方插入了强制转型代码。因此 <code>ArrayList&lt;Integer&gt;</code> 和 <code>ArrayList&lt;String&gt;</code> 是同一个类型。</p><p>Java 的擦除式泛型无论在使用效果上还是运行效率上都全面落后于 C# 的具现化式泛型，唯一优势是，实现泛型只需要在 Javac 编译器上做出改进，不需要改动字节码和 JVM。</p><h4 id="_10-3-1-2-泛型的历史背景" tabindex="-1"><a class="header-anchor" href="#_10-3-1-2-泛型的历史背景"><span>10.3.1.2 泛型的历史背景</span></a></h4><p>泛型的设计路线：</p><ul><li>C# - 需要泛型化的类型 (主要是容器)，以前有的就保持不变，然后平行增加一套泛型化版本的新类型</li><li>Java - 直接把已有的类泛型化，不添加任何平行于已有类型的泛型版</li></ul><p>历史原因，Java 当时已经有快十年的历史了，流行程度也比 C# 高很多，两者的遗留代码规模不在一个数量级。</p><h4 id="_10-3-1-3-类型擦除" tabindex="-1"><a class="header-anchor" href="#_10-3-1-3-类型擦除"><span>10.3.1.3 类型擦除</span></a></h4><p>即使 <code>ArrayList</code> 泛型化为 <code>ArrayList&lt;T&gt;</code>，并保证直接使用 <code>ArrayList</code> 的代码在新版本 JVM 中也可以继续使用。裸类型 (Raw Type) 被视为所有该泛型化实例的共同父类。实现方式：</p><ul><li>直接在编译时把 <code>ArrayList&lt;Integer&gt;</code> 还原为 <code>ArrayList</code></li><li>在元素访问、元素修改处自动插入强制类型转换和检查指令</li></ul><p>使用擦除法直接导致了对 <strong>原始类型</strong> (Primitive Types) 数据的支持成为了麻烦，因为需要插入强制类型转换的代码，而 <code>int</code> <code>long</code> 与 <code>Object</code> 之间不支持强制类型转换。因此 Java 的解决方案是不支持原生类型的泛型，对原生类型使用包装类进行装箱、拆箱。这导致了 Java 泛型慢的重要原因：无数构造包装类和装箱、拆箱的开销。</p><p>另外，Java 在运行时无法取得泛型的类型信息，不得不通过额外的函数参数传入数组的泛型类型；另外，当 <code>List&lt;String&gt;</code> 和 <code>List&lt;Integer&gt;</code> 作为重载函数参数时，无法被重载：因为类型擦除导致这两个函数的特征签名一模一样；然而，如果这两个函数返回值不同，是可以重载的：因为 Class 文件规定，两个函数有相同的特征签名，但返回值不同，可以合法共存于一个 Class 文件中。因此如下的重载是允许的：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">String</span> <span class="token function">method</span><span class="token punctuation">(</span><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> list<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;invoke method(List&lt;String&gt; list)&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">method</span><span class="token punctuation">(</span><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Integer</span><span class="token punctuation">&gt;</span></span> list<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;invoke method (List&lt;Integer&gt; list)&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但是这样的重载毫无优雅和美感，存在一定语义上的混乱。</p><p>另外，擦除法仅仅是对函数的 Code 属性中的字节码进行擦除，实际上元数据中还是保留了泛型信息。因此编码时可以通过反射手段取得参数化类型。</p><h4 id="_10-3-1-4-值类型与未来的泛型" tabindex="-1"><a class="header-anchor" href="#_10-3-1-4-值类型与未来的泛型"><span>10.3.1.4 值类型与未来的泛型</span></a></h4><p>未来的 Java 可能会提供 <strong>值类型</strong> (Value Type) 的语言层面支持。值类型与引用类型一样，具有构造函数、函数、属性字段。与引用类型不同，赋值时通常是整体复制，而不是传递引用，且值类型很容易实现分配在函数的调用栈上，会随着当前函数退出而被释放，不会给 GC 带来压力。</p><h3 id="_10-3-2-自动装箱、拆箱与遍历循环" tabindex="-1"><a class="header-anchor" href="#_10-3-2-自动装箱、拆箱与遍历循环"><span>10.3.2 自动装箱、拆箱与遍历循环</span></a></h3><p>自动装箱、拆箱在编译后被转化为了对应的包装和还原函数，比如：</p><ul><li><code>Integer.valueOf()</code></li><li><code>Integer.intValue()</code></li></ul><p>遍历循环则是把代码还原成了迭代器的实现，因此需要被遍历的类实现 <code>Iterable</code> 接口。</p><p>变长参数在调用时变成了一个数组类型的参数。</p><h3 id="_10-3-3-条件编译" tabindex="-1"><a class="header-anchor" href="#_10-3-3-条件编译"><span>10.3.3 条件编译</span></a></h3><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在编译阶段就会被运行，编译器将分支中不成立的代码块消除掉。由于该语法写在函数体内部，因此只能实现语句基本块 (block) 级别的条件编译，无法条件编译整个 Java 类结构。</p>`,55)]))}const o=n(p,[["render",l],["__file","Chapter 10 - 前端编译与优化.html.vue"]]),r=JSON.parse('{"path":"/understanding-the-jvm-notes/Part%204%20-%20%E7%A8%8B%E5%BA%8F%E7%BC%96%E8%AF%91%E4%B8%8E%E4%BB%A3%E7%A0%81%E4%BC%98%E5%8C%96/Chapter%2010%20-%20%E5%89%8D%E7%AB%AF%E7%BC%96%E8%AF%91%E4%B8%8E%E4%BC%98%E5%8C%96.html","title":"Chapter 10 - 前端编译与优化","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"10.1 概述","slug":"_10-1-概述","link":"#_10-1-概述","children":[]},{"level":2,"title":"10.2 Javac 编译器","slug":"_10-2-javac-编译器","link":"#_10-2-javac-编译器","children":[{"level":3,"title":"10.2.2 解析与填充符号表","slug":"_10-2-2-解析与填充符号表","link":"#_10-2-2-解析与填充符号表","children":[]},{"level":3,"title":"10.2.3 注解处理器","slug":"_10-2-3-注解处理器","link":"#_10-2-3-注解处理器","children":[]},{"level":3,"title":"10.2.4 语义分析与字节码生成","slug":"_10-2-4-语义分析与字节码生成","link":"#_10-2-4-语义分析与字节码生成","children":[]}]},{"level":2,"title":"10.3 Java 语法糖的味道","slug":"_10-3-java-语法糖的味道","link":"#_10-3-java-语法糖的味道","children":[{"level":3,"title":"10.3.1 泛型","slug":"_10-3-1-泛型","link":"#_10-3-1-泛型","children":[]},{"level":3,"title":"10.3.2 自动装箱、拆箱与遍历循环","slug":"_10-3-2-自动装箱、拆箱与遍历循环","link":"#_10-3-2-自动装箱、拆箱与遍历循环","children":[]},{"level":3,"title":"10.3.3 条件编译","slug":"_10-3-3-条件编译","link":"#_10-3-3-条件编译","children":[]}]}],"git":{},"filePathRelative":"understanding-the-jvm-notes/Part 4 - 程序编译与代码优化/Chapter 10 - 前端编译与优化.md"}');export{o as comp,r as data};
