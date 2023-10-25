import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="tomcat-class-loader" tabindex="-1"><a class="header-anchor" href="#tomcat-class-loader" aria-hidden="true">#</a> Tomcat - Class Loader</h1><p>Created by : Mr Dk.</p><p>2020 / 11 / 30 22:10</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="servlet-加载器" tabindex="-1"><a class="header-anchor" href="#servlet-加载器" aria-hidden="true">#</a> Servlet 加载器</h2><p>Tomcat 中的 <em>标准网络应用加载器 (Standard Web Application Loader)</em> 用于加载 Servlet 类。Tomcat 需要实现自己的类加载器的原因在于，Servlet 只被允许访问：</p><ul><li><code>WEB-INF/</code> 目录及其子目录下的类</li><li><code>WEB-INF/lib</code> 目录下的类库</li></ul><p>从而使得 Tomcat 的类加载器能够 <strong>遵守特定的规则</strong> 来加载类。而使用系统加载器，Servlet 就可以访问 JVM <code>CLASSPATH</code> 环境下的任何类和类库，从而带来安全隐患。</p><p>另外，Tomcat 的类加载器还需要支持在 <code>WEB-INF/classes</code> 或 <code>WEB-INF/lib</code> 目录下的文件被修改的时候，自动重新加载类，而不需要重启 Tomcat。在具体实现上，Tomcat 使用一个单独的线程检查类文件的时间戳。总结来说，Tomcat 需要扩展 Java 的类加载器来实现自己的类加载器，原因在于：</p><ol><li>需要定义特定的类加载规则</li><li>缓存已经加载的类</li><li>实现加载类以预备使用</li></ol><h2 id="java-类加载器" tabindex="-1"><a class="header-anchor" href="#java-类加载器" aria-hidden="true">#</a> Java 类加载器</h2><p>在创建 Java 类实例时，JVM 将会使用类加载器到 Java 核心类库和 <code>CLASSPATH</code> 环境变量中查找类；如果需要的类没有找到，那么则会抛出 <code>java.lang.ClassNotFoundException</code>。JVM 使用的类加载器包含：</p><ul><li>Bootstrap 类加载器 - 引导 JVM，由 native code 实现，负责加载所有 Java 核心类</li><li>Extension 类加载器 - 负责加载标准扩展目录下的类</li><li>System 类加载器 - 默认加载器，在 <code>CLASSPATH</code> 环境变量下查找类</li></ul><p>JVM 出于安全原因使用 <strong>委派模型</strong> 来选择加载器。首先 system 类加载器被调用，它会首先向父加载器 extension 委派加载任务，当父加载器无法加载时，再自行尝试加载；extension 类加载器首先也会将加载任务委派给 bootstrap 加载器。因此，bootstrap 总是最先加载类，从而防止 Java 核心类被其它的同名类恶意覆盖。</p><h2 id="loader-接口" tabindex="-1"><a class="header-anchor" href="#loader-接口" aria-hidden="true">#</a> Loader 接口</h2><p>Tomcat 网络应用加载器必须实现的接口。通常一个这样的加载器都是和一个上下文 (容器) 相关联。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * A <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>Loader<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span> represents a Java ClassLoader implementation that can
 * be used by a Container to load class files (within a repository associated
 * with the Loader) that are designed to be reloaded upon request, as well as
 * a mechanism to detect whether changes have occurred in the underlying
 * repository.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * In order for a <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Loader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> implementation to successfully operate
 * with a <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Context</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> implementation that implements reloading, it
 * must obey the following constraints:
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>ul</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Must implement <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Lifecycle</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> so that the Context can indicate
 *     that a new class loader is required.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method must unconditionally create a new
 *     <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">ClassLoader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> implementation.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>The <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">stop</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method must throw away its reference to the
 *     <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">ClassLoader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> previously utilized, so that the class loader,
 *     all classes loaded by it, and all objects of those classes, can be
 *     garbage collected.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Must allow a call to <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">stop</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> to be followed by a call to
 *     <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> on the same <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Loader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> instance.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>li</span><span class="token punctuation">&gt;</span></span>Based on a policy chosen by the implementation, must call the
 *     <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Context</span><span class="token punctuation">.</span><span class="token function">reload</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method on the owning <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">Context</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>
 *     when a change to one or more of the class files loaded by this class
 *     loader is detected.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>ul</span><span class="token punctuation">&gt;</span></span>
 *
 * <span class="token keyword">@author</span> Craig R. McClanahan
 * <span class="token keyword">@version</span> $Id: Loader.java 939531 2010-04-30 00:54:41Z kkolinko $
 */</span>

<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Loader</span> <span class="token punctuation">{</span>


    <span class="token comment">// ------------------------------------------------------------- Properties</span>


    <span class="token doc-comment comment">/**
     * Execute a periodic task, such as reloading, etc. This method will be
     * invoked inside the classloading context of this container. Unexpected
     * throwables will be caught and logged.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">backgroundProcess</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return the Java class loader to be used by this Container.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">ClassLoader</span> <span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return the Container with which this Loader has been associated.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">Container</span> <span class="token function">getContainer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Set the Container with which this Loader has been associated.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">container</span> The associated Container
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setContainer</span><span class="token punctuation">(</span><span class="token class-name">Container</span> container<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return the &quot;follow standard delegation model&quot; flag used to configure
     * our ClassLoader.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">getDelegate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Set the &quot;follow standard delegation model&quot; flag used to configure
     * our ClassLoader.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">delegate</span> The new flag
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setDelegate</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> delegate<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return descriptive information about this Loader implementation and
     * the corresponding version number, in the format
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token entity named-entity" title="&lt;">&amp;lt;</span><span class="token code language-java">description</span><span class="token entity named-entity" title="&gt;">&amp;gt;</span><span class="token code language-java"><span class="token operator">/</span></span><span class="token entity named-entity" title="&lt;">&amp;lt;</span><span class="token code language-java">version</span><span class="token entity named-entity" title="&gt;">&amp;gt;</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getInfo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return the reloadable flag for this Loader.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">getReloadable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Set the reloadable flag for this Loader.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">reloadable</span> The new reloadable flag
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setReloadable</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> reloadable<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token comment">// --------------------------------------------------------- Public Methods</span>


    <span class="token doc-comment comment">/**
     * Add a property change listener to this component.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">listener</span> The listener to add
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">addPropertyChangeListener</span><span class="token punctuation">(</span><span class="token class-name">PropertyChangeListener</span> listener<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Add a new repository to the set of repositories for this class loader.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">repository</span> Repository to be added
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">addRepository</span><span class="token punctuation">(</span><span class="token class-name">String</span> repository<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return the set of repositories defined for this class loader.
     * If none are defined, a zero-length array is returned.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token function">findRepositories</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Has the internal repository associated with this Loader been modified,
     * such that the loaded classes should be reloaded?
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">modified</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Remove a property change listener from this component.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">listener</span> The listener to remove
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">removePropertyChangeListener</span><span class="token punctuation">(</span><span class="token class-name">PropertyChangeListener</span> listener<span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Tomcat 提供了 <code>WebappLoader</code> 作为 Loader 接口的实现。该类实现了 <code>Lifecycle</code> 接口，所以可以由相关联的容器来进行启动或停止。在启动时，它需要完成如下工作：</p><ol><li>创建对象内部维护的真正的类加载器 <code>WebappClassLoader</code> (如果想要创建自己的，那么也要继承 <code>WebappClassLoader</code>)</li><li>设置类加载器的类库 (<code>WEB-INF/classes</code> 目录会被传递给 <code>addRepository()</code>)</li><li>设置类路径</li><li>设置访问权限 (如果启动安全管理器，就给必要的目录增加访问权限)</li><li>开启自动重加载线程，并定时调用内部维护的类加载器的 <code>modified()</code> 函数以判断是否需要重加载</li></ol><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Classloader implementation which is specialized for handling web
 * applications in the most efficient way, while being Catalina aware (all
 * accesses to resources are made through the DirContext interface).
 * This class loader supports detection of modified
 * Java classes, which can be used to implement auto-reload support.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * This class loader is configured by adding the pathnames of directories,
 * JAR files, and ZIP files with the <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">addRepository</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> method,
 * prior to calling <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>.  When a new class is required,
 * these repositories will be consulted first to locate the class.  If it
 * is not present, the system class loader will be used instead.
 *
 * <span class="token keyword">@author</span> Craig R. McClanahan
 * <span class="token keyword">@author</span> Remy Maucherat
 * <span class="token keyword">@version</span> $Id: WebappLoader.java 939527 2010-04-30 00:43:48Z kkolinko $
 */</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WebappLoader</span>
    <span class="token keyword">implements</span> <span class="token class-name">Lifecycle</span><span class="token punctuation">,</span> <span class="token class-name">Loader</span><span class="token punctuation">,</span> <span class="token class-name">PropertyChangeListener</span><span class="token punctuation">,</span> <span class="token class-name">MBeanRegistration</span>  <span class="token punctuation">{</span>

    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * The class loader being managed by this Loader component.
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">WebappClassLoader</span> classLoader <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>类内维护了一个 <code>WebappClassLoader</code> 对象，该类继承自 Java 的 <code>URLClassLoader</code>，并扩展了一些功能，比如缓存了以前加载的类以改进性能。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Specialized web application class loader.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * This class loader is a full reimplementation of the
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">URLClassLoader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> from the JDK. It is designed to be fully
 * compatible with a normal <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token class-name">URLClassLoader</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>, although its internal
 * behavior may be completely different.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">&gt;</span></span> - This class loader faithfully follows
 * the delegation model recommended in the specification. The system class
 * loader will be queried first, then the local repositories, and only then
 * delegation to the parent class loader will occur. This allows the web
 * application to override any shared class except the classes from J2SE.
 * Special handling is provided from the JAXP XML parser interfaces, the JNDI
 * interfaces, and the classes from the servlet API, which are never loaded
 * from the webapp repository.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">&gt;</span></span> - Due to limitations in Jasper
 * compilation technology, any repository which contains classes from
 * the servlet API will be ignored by the class loader.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">&gt;</span></span> - The class loader generates source
 * URLs which include the full JAR URL when a class is loaded from a JAR file,
 * which allows setting security permission at the class level, even when a
 * class is contained inside a JAR.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">&gt;</span></span> - Local repositories are searched in
 * the order they are added via the initial constructor and/or any subsequent
 * calls to <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">addRepository</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span> or <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token function">addJar</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>strong</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>strong</span><span class="token punctuation">&gt;</span></span> - No check for sealing violations or
 * security is made unless a security manager is present.
 *
 * <span class="token keyword">@author</span> Remy Maucherat
 * <span class="token keyword">@author</span> Craig R. McClanahan
 * <span class="token keyword">@version</span> $Id: WebappClassLoader.java 992240 2010-09-03 09:00:10Z rjung $
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WebappClassLoader</span>
    <span class="token keyword">extends</span> <span class="token class-name">URLClassLoader</span>
    <span class="token keyword">implements</span> <span class="token class-name">Reloader</span><span class="token punctuation">,</span> <span class="token class-name">Lifecycle</span>
 <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>

    <span class="token doc-comment comment">/**
     * The cache of ResourceEntry for classes and resources we have loaded,
     * keyed by resource name.
     */</span>
    <span class="token keyword">protected</span> <span class="token class-name">HashMap</span> resourceEntries <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * The list of not found resources.
     */</span>
    <span class="token keyword">protected</span> <span class="token class-name">HashMap</span> notFoundResources <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedHashMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">1L</span><span class="token punctuation">;</span>
        <span class="token keyword">protected</span> <span class="token keyword">boolean</span> <span class="token function">removeEldestEntry</span><span class="token punctuation">(</span>
                <span class="token class-name">Map<span class="token punctuation">.</span>Entry</span> eldest<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span> <span class="token number">1000</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每个被加载过的类会被缓存在类加载器的 <code>resourceEntries</code> 中，没有被找到的类全部会被存放在 <code>notFoundResources</code> 中。类加载器首先在缓存中寻找类；如果找不到，再使用系统的类加载器来加载类；如果还找不到，则从当前的源中加载类；如果还没有，则抛出 <code>ClassNotFoundException</code> 异常。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Resource entry.
 *
 * <span class="token keyword">@author</span> Remy Maucherat
 * <span class="token keyword">@version</span> $Id: ResourceEntry.java 939527 2010-04-30 00:43:48Z kkolinko $
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ResourceEntry</span> <span class="token punctuation">{</span>


    <span class="token doc-comment comment">/**
     * The &quot;last modified&quot; time of the origin file at the time this class
     * was loaded, in milliseconds since the epoch.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">long</span> lastModified <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Binary content of the resource.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> binaryContent <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Loaded class.
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">volatile</span> <span class="token class-name">Class</span> loadedClass <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * URL source from where the object was loaded.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">URL</span> source <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * URL of the codebase from where the object was loaded.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">URL</span> codeBase <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Manifest (if the resource was loaded from a JAR).
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">Manifest</span> manifest <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Certificates (if the resource was loaded from a JAR).
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">Certificate</span><span class="token punctuation">[</span><span class="token punctuation">]</span> certificates <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>


<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="reloader-接口" tabindex="-1"><a class="header-anchor" href="#reloader-接口" aria-hidden="true">#</a> Reloader 接口</h2><p>如果加载器想要支持自动重新加载，就需要实现 <code>Reloader</code> 接口。其中，当 Servlet 的任何支持类被修改的时候，<code>modified()</code> 函数需要返回 <code>true</code>。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Reloader</span> <span class="token punctuation">{</span>


    <span class="token doc-comment comment">/**
     * Add a new repository to the set of places this ClassLoader can look for
     * classes to be loaded.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">repository</span> Name of a source of classes to be loaded, such as a
     *  directory pathname, a JAR file pathname, or a ZIP file pathname
     *
     * <span class="token keyword">@exception</span> <span class="token reference"><span class="token class-name">IllegalArgumentException</span></span> if the specified repository is
     *  invalid or does not exist
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">addRepository</span><span class="token punctuation">(</span><span class="token class-name">String</span> repository<span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Return a String array of the current repositories for this class
     * loader.  If there are no repositories, a zero-length array is
     * returned.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token function">findRepositories</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * Have one or more classes or resources been modified so that a reload
     * is appropriate?
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">modified</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>WebappLoader</code> 中会启用一个后台线程来判断与它通过 <code>setContainer()</code> 相关联的上下文容器是否需要重新加载：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Has the internal repository associated with this Loader been modified,
 * such that the loaded classes should be reloaded?
 */</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">modified</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>classLoader<span class="token punctuation">.</span><span class="token function">modified</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// WebappClassLoader::modified</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Execute a periodic task, such as reloading, etc. This method will be
 * invoked inside the classloading context of this container. Unexpected
 * throwables will be caught and logged.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">backgroundProcess</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>reloadable <span class="token operator">&amp;&amp;</span> <span class="token function">modified</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// modified !!!</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>setContextClassLoader
                <span class="token punctuation">(</span><span class="token class-name">WebappLoader</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">.</span><span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>container <span class="token keyword">instanceof</span> <span class="token class-name">StandardContext</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">StandardContext</span><span class="token punctuation">)</span> container<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">reload</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// reload</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span><span class="token function">getLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>setContextClassLoader
                    <span class="token punctuation">(</span>container<span class="token punctuation">.</span><span class="token function">getLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function">closeJARs</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在与 Tomcat 加载器关联的标准上下文容器中，实现了具体的 <code>reload()</code> 函数：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Reload this web application, if reloading is supported.
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>b</span><span class="token punctuation">&gt;</span></span>IMPLEMENTATION NOTE<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>b</span><span class="token punctuation">&gt;</span></span>:  This method is designed to deal with
 * reloads required by changes to classes in the underlying repositories
 * of our class loader.  It does not handle changes to the web application
 * deployment descriptor.  If that has occurred, you should stop this
 * Context and create (and start) a new Context instance instead.
 *
 * <span class="token keyword">@exception</span> <span class="token reference"><span class="token class-name">IllegalStateException</span></span> if the <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java">reloadable</span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>
 *  property is set to <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>code</span><span class="token punctuation">&gt;</span></span><span class="token code-section"><span class="token line"><span class="token code language-java"><span class="token boolean">false</span></span></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>code</span><span class="token punctuation">&gt;</span></span>.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">reload</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token comment">// Validate our current component state</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>started<span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span>
        <span class="token punctuation">(</span>sm<span class="token punctuation">.</span><span class="token function">getString</span><span class="token punctuation">(</span><span class="token string">&quot;containerBase.notStarted&quot;</span><span class="token punctuation">,</span> <span class="token function">logName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Make sure reloading is enabled</span>
    <span class="token comment">//      if (!reloadable)</span>
    <span class="token comment">//          throw new IllegalStateException</span>
    <span class="token comment">//              (sm.getString(&quot;standardContext.notReloadable&quot;));</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>log<span class="token punctuation">.</span><span class="token function">isInfoEnabled</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span>sm<span class="token punctuation">.</span><span class="token function">getString</span><span class="token punctuation">(</span><span class="token string">&quot;standardContext.reloadingStarted&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Stop accepting requests temporarily</span>
    <span class="token function">setPaused</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token function">stop</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">LifecycleException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>sm<span class="token punctuation">.</span><span class="token function">getString</span><span class="token punctuation">(</span><span class="token string">&quot;standardContext.stoppingContext&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> e<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">LifecycleException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>sm<span class="token punctuation">.</span><span class="token function">getString</span><span class="token punctuation">(</span><span class="token string">&quot;standardContext.startingContext&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> e<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token function">setPaused</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中的 <code>stop()</code> 会将容器原先关联的加载器对象解除关联，<code>start()</code> 函数会给容器重新实例化一个加载器，从而抛弃了原加载器 (及其缓存的 Servlet Class 对象？)</p><blockquote><p>感觉有些粗暴，不知道是不是我理解有偏差...</p></blockquote><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Stop this Context component.
 *
 * <span class="token keyword">@exception</span> <span class="token reference"><span class="token class-name">LifecycleException</span></span> if a shutdown error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">stop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">LifecycleException</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>

    <span class="token comment">// Binding thread</span>
    <span class="token class-name">ClassLoader</span> oldCCL <span class="token operator">=</span> <span class="token function">bindThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token comment">// Stop our child containers, if any</span>

    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>

        <span class="token comment">// Unbinding thread</span>
        <span class="token function">unbindThread</span><span class="token punctuation">(</span>oldCCL<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Bind current thread, both for CL purposes and for JNDI ENC support
 * during : startup, shutdown and realoading of the context.
 *
 * <span class="token keyword">@return</span> the previous context class loader
 */</span>
<span class="token keyword">private</span> <span class="token class-name">ClassLoader</span> <span class="token function">bindThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token class-name">ClassLoader</span> oldContextClassLoader <span class="token operator">=</span>
        <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getContextClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getResources</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> oldContextClassLoader<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>setContextClassLoader
            <span class="token punctuation">(</span><span class="token function">getLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">DirContextURLStreamHandler</span><span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token function">getResources</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">isUseNaming</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token class-name">ContextBindings</span><span class="token punctuation">.</span><span class="token function">bindThread</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">NamingException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// Silent catch, as this is a normal case during the early</span>
            <span class="token comment">// startup stages</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> oldContextClassLoader<span class="token punctuation">;</span>

<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * Unbind thread.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">unbindThread</span><span class="token punctuation">(</span><span class="token class-name">ClassLoader</span> oldContextClassLoader<span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">setContextClassLoader</span><span class="token punctuation">(</span>oldContextClassLoader<span class="token punctuation">)</span><span class="token punctuation">;</span>

    oldContextClassLoader <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">isUseNaming</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ContextBindings</span><span class="token punctuation">.</span><span class="token function">unbindThread</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">DirContextURLStreamHandler</span><span class="token punctuation">.</span><span class="token function">unbind</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Start this Context component.
 *
 * <span class="token keyword">@exception</span> <span class="token reference"><span class="token class-name">LifecycleException</span></span> if a startup error occurs
 */</span>
<span class="token keyword">public</span> <span class="token keyword">synchronized</span> <span class="token keyword">void</span> <span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">LifecycleException</span> <span class="token punctuation">{</span>
    <span class="token comment">// ...</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">WebappLoader</span> webappLoader <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WebappLoader</span><span class="token punctuation">(</span><span class="token function">getParentClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        webappLoader<span class="token punctuation">.</span><span class="token function">setDelegate</span><span class="token punctuation">(</span><span class="token function">getDelegate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">setLoader</span><span class="token punctuation">(</span>webappLoader<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,37),o=[p];function c(l,i){return s(),a("div",null,o)}const d=n(t,[["render",c],["__file","Tomcat Class Loader.html.vue"]]);export{d as default};
