import{_ as n,c as a,a as e,o as l}from"./app-CT9FvwxE.js";const i={};function p(t,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="chapter-13-虚拟文件系统" tabindex="-1"><a class="header-anchor" href="#chapter-13-虚拟文件系统"><span>Chapter 13 - 虚拟文件系统</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 10 / 26 21:23</p><p>Nanjing, Jiangsu, China</p><hr><p>虚拟文件系统 VFS 是内核子系统为用户空间程序提供了文件和文件系统相关的接口。通过 VFS，程序可以利用标准的 Unix 系统调用对不同的文件系统，甚至不同介质上的文件系统进行读写操作。</p><h2 id="_13-1-通用文件系统接口" tabindex="-1"><a class="header-anchor" href="#_13-1-通用文件系统接口"><span>13.1 通用文件系统接口</span></a></h2><p>VFS 使用户可以直接使用系统调用，而无需考虑 <strong>具体文件系统</strong> 和 <strong>实际物理介质</strong>。即这些通用系统调用可以跨文件系统、跨介质执行。老式的操作系统 (比如 DOS) 无力完成上述工作。通过虚拟接口访问文件系统，才使得这种协作性和泛型存取称为可能。VFS 将各种不同的文件系统抽象后，采用统一的方式进行操作。</p><h2 id="_13-2-文件系统抽象层" tabindex="-1"><a class="header-anchor" href="#_13-2-文件系统抽象层"><span>13.2 文件系统抽象层</span></a></h2><p>之所以可以用通用接口对各种类型的文件系统进行操作，是因为内核在它的底层文件系统接口上建立了一个 <strong>抽象层</strong>，该抽象层使 Linux 能够支持各种文件系统。VFS 提供了一个 <strong>通用文件系统模型</strong>，囊括了任何文件系统常用的功能集和行为，虽偏重于 Unix 风格的文件系统，但依然可以支持很多种差异很大的文件系统。抽象层之所以能够衔接各种各样的文件系统，是因为定义了所有文件系统都支持的、基本的、概念上的接口和数据结构。实际文件系统的代码在统一的接口和数据结构下隐藏了具体实现细节，在 VFS 层面上，所有文件系统都是相同的。实际文件系统需要通过编程提供 VFS 所期望的抽象接口和数据结构。</p><h2 id="_13-3-unix-文件系统" tabindex="-1"><a class="header-anchor" href="#_13-3-unix-文件系统"><span>13.3 Unix 文件系统</span></a></h2><p>Unix 使用了四种和文件系统相关的抽象概念：</p><ul><li>文件</li><li>目录项</li><li>索引结点 (inode)</li><li>安装点 (mount point)</li></ul><p>在 Unix 中，文件系统被安装在一个特定的安装点上。所有已安装文件系统都作为根文件系统树的枝叶出现在系统中。相比之下，Windows 将命名空间分类为驱动器字母，将硬件细节泄露给文件系统的抽象层。</p><p>文件通过目录组织起来，目录条目被称为目录项，VFS 把目录当成普通文件对待。Unix 将文件的 <strong>相关信息</strong> 和 <strong>文件本身</strong> 加以区分：文件的相关信息被称为 <strong>元数据</strong> ，被存储在专门的数据结构 inode 中。文件系统的控制信息存储在 <strong>超级块</strong> 中，包含文件系统信息的数据结构。一直以来，Unix 文件系统在磁盘上的布局也是按照上述概念实现的。</p><p>FAT、NTFS 等非 Unix 风格的文件系统，虽然也可以在 Linux 上工作，但必须经过封装，提供一个符合 VFS 通用模型的界面，使得非 Unix 的文件系统能够兼容 Unix 文件系统的使用规则。这种文件系统可以工作，但是带来的开销不可思议 😌</p><h2 id="_13-4-vfs-对象及其数据结构" tabindex="-1"><a class="header-anchor" href="#_13-4-vfs-对象及其数据结构"><span>13.4 VFS 对象及其数据结构</span></a></h2><p>VFS 采用了面向对象的设计思路。内核中的所有数据结构都使用 C 语言的结构体实现，这些结构体包含数据的同时，也包含操作这些数据的函数指针。其中的操作函数 <strong>由具体文件系统实现</strong>。VFS 中有四个主要对象类型：</p><ul><li>超级块对象：代表一个 <strong>已安装</strong> 的文件系统</li><li>inode 对象：代表一个具体文件</li><li>目录项对象：代表一个目录项，是路径的组成部分</li><li>文件对象：代表由进程打开的文件</li></ul><p>每个对象中包含一个 <strong>操作对象</strong>，包含了内核对这些主要对象可以使用的函数：</p><ul><li><code>super_operations</code>：针对文件系统所能调用的函数</li><li><code>inode_operations</code>：内核针对特定文件所能调用的函数</li><li><code>dentry_operations</code>：内核针对特定目录所能调用的函数</li><li><code>file_operations</code>：进程针对已打开文件所能调用的函数</li></ul><p>对于许多函数，可以继承 VFS 提供的通用函数。如果通用功能无法满足，则使用具体文件系统的独有函数填充这些指针。</p><h2 id="_13-5-超级块对象" tabindex="-1"><a class="header-anchor" href="#_13-5-超级块对象"><span>13.5 超级块对象</span></a></h2><p>各种文件系统都必须实现超级块对象，用于存储特定文件系统的信息。通常对应于存放在磁盘扇区中的文件系统超级块。对于并非基于磁盘的文件系统，现场创建超级块，并保存在内存中。文件系统安装时，会从磁盘上读取文件系统超级块，并将信息填充到内存中的超级块对象中。</p><h2 id="_13-6-超级块操作" tabindex="-1"><a class="header-anchor" href="#_13-6-超级块操作"><span>13.6 超级块操作</span></a></h2><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">super_operations</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该结构体中的每一项都是一个指向 <strong>超级块操作函数</strong> 的指针，执行文件系统和索引结点的低层操作。在超级块对象调用函数时，可能还需要将超级块自身作为函数参数传递，因为 C 不支持面向对象：</p><div class="language-cpp line-numbers-mode" data-highlighter="prismjs" data-ext="cpp" data-title="cpp"><pre><code><span class="line">sb<span class="token punctuation">.</span><span class="token function">write_super</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// C++ style</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">sb<span class="token operator">-&gt;</span>s_op<span class="token operator">-&gt;</span><span class="token function">write_super</span><span class="token punctuation">(</span>sb<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// C style</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="_13-7-索引结点对象" tabindex="-1"><a class="header-anchor" href="#_13-7-索引结点对象"><span>13.7 索引结点对象</span></a></h2><p>inode 对象包含了内核在操作文件或目录时需要的全部信息。对于 Unix 风格的文件系统，这些信息可以直接从磁盘读入；对于没有 inode 的文件系统，必须想办法提取这些信息，不管哪种情况、何种方式，inode 对象必须在内存中创建。一个 inode 代表文件系统中的一个文件，也可以是设备或管道这样的特殊文件。由于 inode 只能是这些文件中的一类，因此指针存放在 union 中。</p><blockquote><p>终于有点明白所谓的 union 是干啥用的了 😥</p></blockquote><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">inode</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line">    <span class="token keyword">union</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">struct</span> <span class="token class-name">pipe_inode_info</span> <span class="token operator">*</span>i_pipe<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">struct</span> <span class="token class-name">block_device</span> <span class="token operator">*</span>i_bdev<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">struct</span> <span class="token class-name">cdev</span> <span class="token operator">*</span>i_cdev<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>某些文件系统并不能完整地包含 inode 结构体中的所有信息，文件系统就需要在对应的实现中解决这些问题。这是由具体的实现者决定的。</p><h2 id="_13-8-索引结点操作" tabindex="-1"><a class="header-anchor" href="#_13-8-索引结点操作"><span>13.8 索引结点操作</span></a></h2><h2 id="_13-9-目录项对象" tabindex="-1"><a class="header-anchor" href="#_13-9-目录项对象"><span>13.9 目录项对象</span></a></h2><p>VFS 把目录当作文件对待。目录路径中的每个组成部分都由一个 inode 对象表示。解析一个路径并遍历是十分耗时的字符串比较过程，执行耗时、代码繁琐。目录项 <strong>没有对应的磁盘数据结构</strong>，VFS 根据字符串形式的路径名现场创建。</p><h3 id="_13-9-1-目录项状态" tabindex="-1"><a class="header-anchor" href="#_13-9-1-目录项状态"><span>13.9.1 目录项状态</span></a></h3><p>目录项对象有三种状态：</p><ul><li>被使用 <ul><li>对应一个有效的 inode</li><li>并指明该对象有多少个使用者 (&gt; 0)</li></ul></li><li>未被使用 <ul><li>对应一个有效的 inode</li><li>VFS 当前未使用它 (使用者数为 0)</li><li>不会被过早撤销，如果以后需要使用，避免重新创建</li><li>如果需要回收内存，则可以被撤销</li></ul></li><li>负状态 <ul><li>不对应有效的 inode (inode 已被删除，或路径不再正确)</li><li>保留，便于快速解析一些失败的路径查询</li><li>如果有必要，也可以撤销</li></ul></li></ul><h3 id="_13-9-2-目录项缓存" tabindex="-1"><a class="header-anchor" href="#_13-9-2-目录项缓存"><span>13.9.2 目录项缓存</span></a></h3><p>VFS 遍历路径名中的所有元素，逐个解析为目录项对象。这是很费力的工作，会浪费大量时间。内核会将目录项缓存，目录项缓存包含：</p><ul><li>正被使用的目录项链表</li><li>最近被使用的双向链表：未被使用的和负状态的目录项对象</li><li>hash 表，用于快速将给定的路径解析为相关目录项对象</li></ul><p>目录项对象对应的 inode 也会被缓存，只要目录项被缓存了，对应的 inode 一定被缓存。VFS 现在目录项缓存中搜索路径名，如果找到了，就不用费那么大的力气了。由于文件访问呈现 <strong>时间</strong> 和 <strong>空间</strong> 的局部性，对目录项和 inode 进行缓存非常有益。</p><h2 id="_13-10-目录项操作" tabindex="-1"><a class="header-anchor" href="#_13-10-目录项操作"><span>13.10 目录项操作</span></a></h2><h2 id="_13-11-文件对象" tabindex="-1"><a class="header-anchor" href="#_13-11-文件对象"><span>13.11 文件对象</span></a></h2><p>文件对象是已打开的文件在内存中的表示，由 <code>open()</code> 创建，由 <code>close()</code> 撤销。文件对象仅仅在进程观点上代表已打开文件，一个文件对应的文件对象不是唯一的。但对应的索引结点和目录项对象是唯一的，文件对象实际上也没有对应的磁盘数据。</p><h2 id="_13-12-文件操作" tabindex="-1"><a class="header-anchor" href="#_13-12-文件操作"><span>13.12 文件操作</span></a></h2><p>具体的文件系统可以为每一种操作做专门的实现。如果存在通用操作，也可以使用通用的操作。</p><h2 id="_13-13-和文件系统相关的数据结构" tabindex="-1"><a class="header-anchor" href="#_13-13-和文件系统相关的数据结构"><span>13.13 和文件系统相关的数据结构</span></a></h2><p>内核还使用了另外一些标准数据结构来管理文件系统的其它相关数据，用于描述各种特定文件系统类型。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">file_system_type</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// ...</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使内核能够支持众多不同的文件系统。对于每个文件系统来说，不管有没有被安装到系统上，都只有这样的一个 <code>file_system_type</code> 结构。当文件系统被实际安装时，在安装点会创建一个 <code>vfsmount</code> 结构体，该结构体代表了文件系统的实例。</p><h2 id="_13-14-和进程相关的数据结构" tabindex="-1"><a class="header-anchor" href="#_13-14-和进程相关的数据结构"><span>13.14 和进程相关的数据结构</span></a></h2><p><code>file_struct</code> 结构体由 PCB 中的 files 目录项指向，所有与 <strong>单个进程</strong> 相关的信息都包含在其中。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">files_struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">atomic_t</span> count<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">fdtable</span> <span class="token operator">*</span>fdt<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">fdtable</span> fdtab<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">spinlock_t</span> file_lock<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> next_fd<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">embedded_fd_set</span> close_on_exec_init<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">embedded_fd_set</span> open_fds_init<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">file</span> <span class="token operator">*</span>fd_array<span class="token punctuation">[</span>NR_OPEN_DEFAULT<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>fd_array</code> 数组指针指向已经打开的文件对象。如果进程打开的文件对象超过 <code>NR_OPEN_DEFAULT</code>，内核将分配新数组，并使 <code>fdt</code> 指针指向它。因此进程对适当数量的文件对象的访问会执行得很快。其次是 <code>fs_struct</code> 结构体，由 PCB 中的 <code>fs</code> 域所指向，包含文件系统和进程相关的信息。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">fs_struct</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span> users<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">rwlock_t</span> lock<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> umask<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> in_exec<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">path</span> root<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">path</span> pwd<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>包含了当前进程的当前工作目录 (pwd) 和根目录。</p><p>第三个结构体是 <code>namespace</code> 结构体，由 PCB 中的 <code>mmt_namespace</code> 指向。使每个进程在系统中都看到唯一的安装文件系统</p><ul><li>唯一的根目录</li><li>唯一的文件系统层次结构</li></ul><blockquote><p>什么玩意儿？？？</p></blockquote><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">mmt_namespace</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">atomic_t</span> count<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">vfsmount</span> <span class="token operator">*</span>root<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">list_head</span> list<span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">wait_queue_head_t</span> poll<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span> event<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于多数进程来说，PCB 都指向唯一的 <code>file_struct</code> 和 <code>fs_struct</code>。如果设置了克隆标志而被创建出来的进程，每个结构体中都会维护引用计数，防止被撤销。</p>`,64)]))}const o=n(i,[["render",p],["__file","Chapter 13 - 虚拟文件系统.html.vue"]]),d=JSON.parse('{"path":"/linux-kernel-development-notes/Chapter%2013%20-%20%E8%99%9A%E6%8B%9F%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F.html","title":"Chapter 13 - 虚拟文件系统","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"13.1 通用文件系统接口","slug":"_13-1-通用文件系统接口","link":"#_13-1-通用文件系统接口","children":[]},{"level":2,"title":"13.2 文件系统抽象层","slug":"_13-2-文件系统抽象层","link":"#_13-2-文件系统抽象层","children":[]},{"level":2,"title":"13.3 Unix 文件系统","slug":"_13-3-unix-文件系统","link":"#_13-3-unix-文件系统","children":[]},{"level":2,"title":"13.4 VFS 对象及其数据结构","slug":"_13-4-vfs-对象及其数据结构","link":"#_13-4-vfs-对象及其数据结构","children":[]},{"level":2,"title":"13.5 超级块对象","slug":"_13-5-超级块对象","link":"#_13-5-超级块对象","children":[]},{"level":2,"title":"13.6 超级块操作","slug":"_13-6-超级块操作","link":"#_13-6-超级块操作","children":[]},{"level":2,"title":"13.7 索引结点对象","slug":"_13-7-索引结点对象","link":"#_13-7-索引结点对象","children":[]},{"level":2,"title":"13.8 索引结点操作","slug":"_13-8-索引结点操作","link":"#_13-8-索引结点操作","children":[]},{"level":2,"title":"13.9 目录项对象","slug":"_13-9-目录项对象","link":"#_13-9-目录项对象","children":[{"level":3,"title":"13.9.1 目录项状态","slug":"_13-9-1-目录项状态","link":"#_13-9-1-目录项状态","children":[]},{"level":3,"title":"13.9.2 目录项缓存","slug":"_13-9-2-目录项缓存","link":"#_13-9-2-目录项缓存","children":[]}]},{"level":2,"title":"13.10 目录项操作","slug":"_13-10-目录项操作","link":"#_13-10-目录项操作","children":[]},{"level":2,"title":"13.11 文件对象","slug":"_13-11-文件对象","link":"#_13-11-文件对象","children":[]},{"level":2,"title":"13.12 文件操作","slug":"_13-12-文件操作","link":"#_13-12-文件操作","children":[]},{"level":2,"title":"13.13 和文件系统相关的数据结构","slug":"_13-13-和文件系统相关的数据结构","link":"#_13-13-和文件系统相关的数据结构","children":[]},{"level":2,"title":"13.14 和进程相关的数据结构","slug":"_13-14-和进程相关的数据结构","link":"#_13-14-和进程相关的数据结构","children":[]}],"git":{},"filePathRelative":"linux-kernel-development-notes/Chapter 13 - 虚拟文件系统.md"}');export{o as comp,d as data};
