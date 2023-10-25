import{_ as t,r as c,o as l,c as p,a as n,b as s,d as e,e as i}from"./app-25fa875f.js";const o={},d=i('<h1 id="c-object-layout" tabindex="-1"><a class="header-anchor" href="#c-object-layout" aria-hidden="true">#</a> C++ - Object Layout</h1><p>Created by : Mr Dk.</p><p>2021 / 03 / 06 16:17</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about" aria-hidden="true">#</a> About</h2><p>一个 C++ 对象的内存布局是什么样的？</p><p>程序在运行时会有几个内存区：</p><ul><li>数据段</li><li>BSS 段</li><li>代码段</li><li>栈</li><li>堆</li></ul><p>一个 C++ 对象的各部分分别在哪个位置上呢？</p><h2 id="original" tabindex="-1"><a class="header-anchor" href="#original" aria-hidden="true">#</a> Original</h2><p>首先明确一点，在 C 语言中：</p><ul><li>全局变量和静态变量存储在数据段 (已被初始化) 和 BSS 段 (未被初始化) 中</li><li>代码 (函数) 全部保存在代码段中</li><li>函数内的局部变量位于栈上 (在编译时已经可以确定空间大小)</li><li>在代码中动态分配的内存位于堆上 (不确定空间大小，动态分配)</li></ul><h2 id="c-object" tabindex="-1"><a class="header-anchor" href="#c-object" aria-hidden="true">#</a> C++ Object</h2><p>根据上述思路，以一个位于函数内的局部变量对象为例。在对象被声明后，肯定会在栈内占用内存空间。栈内占用内存的大小在编译时已经可以确定，包含：</p><ul><li>非静态成员变量</li><li>(如果有虚函数) 虚函数表指针</li></ul><p>其它部分去哪了呢？以下内容参考自 <em>Vishal Chovatiya</em> 的博客：</p>',17),u={href:"http://www.vishalchovatiya.com/memory-layout-of-cpp-object/",target:"_blank",rel:"noopener noreferrer"},r={href:"http://www.vishalchovatiya.com/inside-the-cpp-object-model/",target:"_blank",rel:"noopener noreferrer"},v=i(`<div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">X</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span>         x<span class="token punctuation">;</span>
    <span class="token keyword">float</span>       xx<span class="token punctuation">;</span>
    <span class="token keyword">static</span> <span class="token keyword">int</span>  count<span class="token punctuation">;</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token function">X</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">virtual</span> <span class="token operator">~</span><span class="token function">X</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">virtual</span> <span class="token keyword">void</span> <span class="token function">printAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">void</span> <span class="token function">printInt</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">void</span> <span class="token function">printFloat</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">printCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对象布局：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      |                        |
      |------------------------| &lt;------ X class object memory layout
      |        int X::x        |
stack |------------------------|
  |   |       float X::xx      |
  |   |------------------------|      |-------|--------------------------|
  |   |         X::_vptr       |------|       |       type_info X        |
 \\|/  |------------------------|              |--------------------------|
      |           o            |              |    address of X::~X()    |
      |           o            |              |--------------------------|
      |           o            |              | address of X::printAll() |
      |                        |              |--------------------------|
      |                        |
------|------------------------|------------
      |  static int X::count   |      /|\\
      |------------------------|       |
      |           o            |  data segment
      |           o            |       |
      |                        |      \\|/
------|------------------------|------------
      |        X::X()          |
      |------------------------|       |
      |        X::~X()         |       |
      |------------------------|       |
      |      X::printAll()     |      \\|/
      |------------------------|  text segment
      |      X::printInt()     |
      |------------------------|
      |     X::printFloat()    |
      |------------------------|
      | static X::printCount() |
      |------------------------|
      |                        |
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="member-function" tabindex="-1"><a class="header-anchor" href="#member-function" aria-hidden="true">#</a> Member Function</h3><p>成员函数去哪了？C++ 把所有的成员函数转换成了普通函数。编译器为函数加上类名作用域解析，以表示该函数属于哪个类；并为每个类成员函数 <strong>隐式传入一个参数</strong>：<code>this</code> 指针，指向调用成员函数的对象地址，这样成员函数内就可以访问成员变量了。以下面的类为例：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">foo</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> m_var<span class="token punctuation">;</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token keyword">void</span> <span class="token function">print</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        cout <span class="token operator">&lt;&lt;</span> m_var <span class="token operator">&lt;&lt;</span> endl<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译器将会对成员变量和成员函数分别对待。把成员变量留在类内，占用对象内存；把成员函数加上作用域解析，隐式传入 <code>this</code> 指针后，放进代码段中：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">foo</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> m_var<span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">void</span> foo<span class="token double-colon punctuation">::</span><span class="token function">print</span><span class="token punctuation">(</span>foo <span class="token operator">*</span><span class="token keyword">this</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    std<span class="token double-colon punctuation">::</span>cout<span class="token punctuation">.</span><span class="token keyword">operator</span><span class="token operator">&lt;&lt;</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token operator">-&gt;</span>m_var<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">operator</span><span class="token operator">&lt;&lt;</span><span class="token punctuation">(</span>std<span class="token double-colon punctuation">::</span>endl<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="static-member-function" tabindex="-1"><a class="header-anchor" href="#static-member-function" aria-hidden="true">#</a> Static Member Function</h3><p>对于类内的静态成员函数，编译器同样对其加上作用域解析后，放进了代码段中。区别在于 <strong>不会将 <code>this</code> 指针作为隐式参数</strong>，因为这个函数不会被某个对象调用。</p><h3 id="static-member-variable" tabindex="-1"><a class="header-anchor" href="#static-member-variable" aria-hidden="true">#</a> Static Member Variable</h3><p>由于静态成员变量也不可能在每个对象实例中都有一个副本，因此不会与非静态成员变量一样放在栈上。被加上作用域解析后，被放进了数据段中。</p><h3 id="virtual-function" tabindex="-1"><a class="header-anchor" href="#virtual-function" aria-hidden="true">#</a> Virtual Function</h3><p>编译器自动为每个类内的所有虚函数生成一个 <strong>虚函数表</strong>，通常会放置在数据段中 (但具体取决于编译器的具体实现)。虚函数表中放置了指向代码段中相应函数入口的指针。表内的第一个条目是一个指向 <code>type_info</code> 对象的指针，该对象内包含了与当前类相关的继承信息。</p><p>编译器自动为每个带有虚函数的对象添加了一个成员变量 <code>_vptr</code>，该指针指向类的虚函数表。</p><h2 id="object-layout-with-inheritance" tabindex="-1"><a class="header-anchor" href="#object-layout-with-inheritance" aria-hidden="true">#</a> Object Layout with Inheritance</h2><p>在发生继承后，派生类对象中将会包含一个基类对象。因此，派生类对象中的内存中也会包含基类对象的所有非静态成员变量。</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">X</span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> x<span class="token punctuation">;</span>
    string str<span class="token punctuation">;</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token function">X</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">virtual</span> <span class="token operator">~</span><span class="token function">X</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">virtual</span> <span class="token keyword">void</span> <span class="token function">printAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token keyword">class</span> <span class="token class-name">Y</span> <span class="token operator">:</span> <span class="token base-clause"><span class="token keyword">public</span> <span class="token class-name">X</span></span> <span class="token punctuation">{</span>
    <span class="token keyword">int</span> y<span class="token punctuation">;</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token function">Y</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token operator">~</span><span class="token function">Y</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">void</span> <span class="token function">printAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如上述代码所示，基类对象中包含一个整形变量 <code>x</code> 和字符串对象 <code>str</code>；在派生类对象中，还另外附带了一个整型变量 <code>y</code>。内存布局如下图所示：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      |                              |
      |------------------------------| &lt;------ Y class object memory layout
      |          int X::x            |
stack |------------------------------|
  |   |              int string::len |
  |   |string X::str ----------------|
  |   |            char* string::str |
 \\|/  |------------------------------|      |-------|--------------------------|
      |           X::_vptr           |------|       |       type_info Y        |
      |------------------------------|              |--------------------------|
      |          int Y::y            |              |    address of Y::~Y()    |
      |------------------------------|              |--------------------------|
      |               o              |              | address of Y::printAll() |
      |               o              |              |--------------------------|
      |               o              |
------|------------------------------|--------
      |           X::X()             |
      |------------------------------|       |
      |           X::~X()            |       |
      |------------------------------|       |
      |         X::printAll()        |      \\|/
      |------------------------------|  text segment
      |           Y::Y()             |
      |------------------------------|
      |           Y::~Y()            |
      |------------------------------|
      |         Y::printAll()        |
      |------------------------------|
      |      string::string()        |
      |------------------------------|
      |      string::~string()       |
      |------------------------------|
      |      string::length()        |
      |------------------------------|
      |               o              |
      |               o              |
      |               o              |
      |                              |
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>派生类复制了一份基类的虚函数表。如果派生类中重写了虚函数，那么就将虚函数表中的相应条目替换为派生类中相应函数的地址。</p><h2 id="differences-between-structure-and-class" tabindex="-1"><a class="header-anchor" href="#differences-between-structure-and-class" aria-hidden="true">#</a> Differences between Structure and Class</h2><p>在 C++ 中对 <code>struct</code> 进行了扩展，<code>struct</code> 与 <code>class</code> 的使用无异，除了一点：</p><ul><li><code>struct</code> 默认所有成员为 <code>public</code>；同样，在继承方式上，默认为公有继承</li><li><code>class</code> 默认所有成员为 <code>private</code>；同样，在继承方式上，默认为私有继承</li></ul><p>但是具体使用 <code>struct</code> 和 <code>class</code> 一般遵循约定：</p><ul><li>如果只是为了将一些元素捆为一个整体，那么可以使用 <code>struct</code></li><li>如果是为了高层次的建模、抽象，或者提供一种接口，那么就使用 <code>class</code></li></ul>`,26),k={href:"https://www.fluentcpp.com/2017/06/13/the-real-difference-between-struct-class/",target:"_blank",rel:"noopener noreferrer"};function b(m,h){const a=c("ExternalLinkIcon");return l(),p("div",null,[d,n("ul",null,[n("li",null,[n("a",u,[s("Memory Layout of C++ Object in Different Scenarios"),e(a)])]),n("li",null,[n("a",r,[s("Inside the C++ Object Model"),e(a)])])]),v,n("p",null,[s("参考："),n("a",k,[s("Fluent C++ - The real difference between struct and class"),e(a)])])])}const y=t(o,[["render",b],["__file","C__ Object Layout.html.vue"]]);export{y as default};
