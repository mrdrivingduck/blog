import{_ as e,c as s,a,o as l}from"./app-CT9FvwxE.js";const i={};function d(c,n){return l(),s("div",null,n[0]||(n[0]=[a(`<h1 id="os-dynamic-linking" tabindex="-1"><a class="header-anchor" href="#os-dynamic-linking"><span>OS - Dynamic Linking</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 29 20:08</p><p>Nanjing, Jiangsu, China</p><hr><blockquote><p>本文内容来自于 <em>程序员的自我修养 - 链接、装载与库，俞甲子 石凡 潘爱民著</em>。</p></blockquote><hr><h2 id="为什么要动态链接" tabindex="-1"><a class="header-anchor" href="#为什么要动态链接"><span>为什么要动态链接</span></a></h2><p>如果只使用静态链接，那么每一个可执行文件中都包含一些公共库函数的副本，极大地浪费了内存和磁盘空间：</p><ul><li>磁盘：库函数被链接在每一个可执行文件中</li><li>内存：每个进程空间中都装载了相同的库函数代码</li></ul><p>另外，对于程序的开发的发布，如果使用静态链接，一旦程序中用到的库有更新，那么整个函数就需要重新被链接，然后再发布。</p><p>动态链接的基本思想是，把程序中用到的各个模块尽可能分开，不再将它们静态地链接在一起，等到程序要运行时才进行链接。这种方法解决了共享目标文件的多副本问题。另外，动态链接也使程序的升级变得容易，理论上只需要将旧的目标文件覆盖掉即可 (当然新模块与旧模块的接口要兼容)。使得各个模块的开发更加独立，耦合度更小。</p><p>在 Linux 中，ELF 动态链接文件被称为 <strong>共享对象 (Shared Objects)</strong>，以 <code>.so</code> 结尾；在 Windows 中被称为 <strong>动态链接库 (Dynamical Linking Library)</strong>，以 <code>.dll</code> 结尾。当程序被装载时，系统的 <strong>动态链接器</strong> 将程序所需要用到的动态链接库装载到进程的地址空间，并将程序中的所有未决议符号绑定到相应的动态链接库中，进行重定位。动态链接把链接过程从程序装载前推迟到了装载时。</p><h2 id="动态链接例子" tabindex="-1"><a class="header-anchor" href="#动态链接例子"><span>动态链接例子</span></a></h2><p>在编译期间，如果程序用到了动态链接库的函数，那么输入参数也必须指定相应的 <strong>共享对象</strong>。但是这一过程并没有进行链接，只是为了确认程序中使用符号的性质。如果程序中使用的符号是一个定义在其它目标文件中的符号，那么按照静态链接的规则链接、重定位；如果符号定义在共享对象中，那么链接器将这个符号标记为动态链接符号，不对它进行重定位。这一过程中，只使用了共享对象中保存的 <strong>符号信息</strong>。</p><p>共享对象的最终装载地址在编译时是不确定的，由装载器根据地址空间的空闲状况，动态分配一块足够的地址空间给共享对象。</p><p>Linux 中的动态链接器位于 <code>/lib/x86_64-linux-gnu/ld-2.27.so</code>：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ ls -alt ld*</span>
<span class="line">-rwxr-xr-x 1 root root 170960 Apr 17  2018 ld-2.27.so</span>
<span class="line">lrwxrwxrwx 1 root root     10 Apr 17  2018 ld-linux-x86-64.so.2 -&gt; ld-2.27.so</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="地址无关代码" tabindex="-1"><a class="header-anchor" href="#地址无关代码"><span>地址无关代码</span></a></h2><p>程序模块和数据中会包含一些对绝对地址的引用，在链接产生输出文件的时候，这些地址需要被确定。而在动态链接的情况下，不同模块的目标装载地址都一样是不可行的。<em>静态共享库 (Static Shared Library)</em> 将程序的各种模块统一交给 OS 来管理，OS 会在特定地址划分出一些地址块，为已知模块预留足够的空间。但是在实用中还是会有很多问题。能否让共享对象在任意地址加载 - 即，共享对象在编译时不能假设自己在进程虚拟地址空间中的位置。</p><h3 id="装载时重定位" tabindex="-1"><a class="header-anchor" href="#装载时重定位"><span>装载时重定位</span></a></h3><p>在链接时，对所有绝对地址的引用不作重定位，将这一步推迟到装载时再完成。等到模块的装载地址确定，再将程序中所有的绝对地址引用进行重定位。OS 根据当时内存空闲情况，动态分配一块大小合适的物理内存给程序。在 Windows 中，<em>装载时重定位 (Load Time Relocation)</em> 也被称为 <em>基址重置 (Rebasing)</em>。</p><p>动态链接模块被装载后，其只读的 <strong>指令部分</strong> 应当由多个进程共享。由于装载时重定位已经对指令进行了重定位，这些修改后的指令已经无法在多个进程之间共享。然而，动态链接库中可读写的 <strong>数据部分</strong> 对不同的进程来说应有多个副本，所以可以通过装载时重定位的方法来解决。</p><p>在 GCC 命令中，如果只使用 <code>-shared</code> 选项，那么就会编译出使用装载时重定位的共享对象。</p><h3 id="地址无关代码-1" tabindex="-1"><a class="header-anchor" href="#地址无关代码-1"><span>地址无关代码</span></a></h3><p>根据上述问题，我们希望共享对象中的指令部分在装载时不需要因为装载地址的改变而改变 (重定位)，这样多个进程可以共享一份指令副本。解决方法是，将指令中 <strong>需要被修改的部分</strong> 分离出来，和数据放在一起。这样指令部分可以保持不变，而数据部分在每个进程中都有一个副本。这就是 <em>地址无关代码 (Position Independent Code, PIC)</em> 技术。</p><p>对于一个模块来说，根据引用指令和引用数据，模块内引用和模块外引用，可以分为四种情况：</p><ul><li>模块内函数调用 (指令)</li><li>模块内数据访问 (全局变量、静态变量)</li><li>模块外函数调用</li><li>模块外数据访问</li></ul><h4 id="模块内部函数调用" tabindex="-1"><a class="header-anchor" href="#模块内部函数调用"><span>模块内部函数调用</span></a></h4><p>被调用函数与函数调用者处于同一模块，它们之间的位置是相对固定的。所以可以使用相对寻址 (相对于当前指令地址 PC) 的方式直接调用，不需要重定位。比如，对于 <code>CALL</code> 指令，其参数是目的地址对于下一条指令的偏移。</p><h4 id="模块内部数据访问" tabindex="-1"><a class="header-anchor" href="#模块内部数据访问"><span>模块内部数据访问</span></a></h4><p>与指令类似，任意一条指令与模块内部数据之间的相对位置都是固定的。但是目前 CPU 体系结构中基本不支持数据相对于 PC 的寻址方式。ELF 使用一个巧妙的方法得到当前的 PC 值，然后再加上一个偏移量，就可以达到访问变量的目的了。有一些特殊的函数可以将 PC 值放到寄存器中。</p><h4 id="模块外的访问" tabindex="-1"><a class="header-anchor" href="#模块外的访问"><span>模块外的访问</span></a></h4><p>ELF 在 <strong>数据段</strong> 中建立一个指向模块外变量地址或函数地址的指针数组，称为 <em>全局偏移表 (Global Offset Table, GOT)</em>。当代码需要引用模块外的变量或函数时，通过 GOT 中相对应的项来间接引用。链接器在装载模块时，会查找每个变量或函数所在的地址，然后填充到 GOT 的表项中。GOT 被放在数据段，因此可以在模块装载时被修改，每个进程也都有独立的副本。</p><p>在编译时，GOT 本身相对于当前指令 PC 的偏移量也可以被确定。因此，根据当前 PC 加上偏移量进行间接寻址，就能够找到 GOT 表，从而找到外部变量或函数的地址。共享对象内所有对于模块外变量或函数的引用，都通过对 GOT 表项的引用来完成。这样，指令本身就与装载地址无关了，只需要修改 GOT 中的指针，使其能正确指向对应的变量和函数即可。</p><p>在 GCC 命令中，使用 <code>-fPIC</code> 或 <code>-fpic</code> (产生的代码小而快，但有些平台上不支持) 能够产生地址无关代码。另外，对于一个可执行文件，可以使用 <code>-fPIE</code> 或 <code>-fpie</code> 方式直接编译出 <em>地址无关的可执行文件 (Position Indepent Executable, PIE)</em>。如果不使用 <code>-fPIC</code>，那么代码段也会被编译为装载时重定位的形式。由于无法满足地址无关性，代码段将无法被进程共享，失去了节省内存的优点；但代码运行速度得到了提高，因为在每次访问全局数据和函数时对 GOT 表的间接访问。地址无关的 ELF 文件中包含 <code>.got</code> 段。</p><h3 id="数据段的地址无关性" tabindex="-1"><a class="header-anchor" href="#数据段的地址无关性"><span>数据段的地址无关性</span></a></h3><p>由于每个进程都有数据段的一份独立副本，因此可以使用 <strong>装载时重定位</strong> 的方法来解决数据段中的绝对地址引用问题。如果数据段中有绝对地址引用，那么编译器和链接器就会为生成一个 <strong>重定位表</strong>，并表示重定位入口为特定类型。当动态链接器识别到这个重定位入口时，就会对共享对象进行重定位。</p><hr><h2 id="延迟绑定-plt" tabindex="-1"><a class="header-anchor" href="#延迟绑定-plt"><span>延迟绑定 (PLT)</span></a></h2><p>动态链接相比于静态链接而言，性能会有 1%-5% 的损失。性能损失来源于：</p><ol><li>对模块外变量和函数的访问需要经过 GOT 表间接寻址</li><li>动态链接在程序运行时完成，需要寻找、装载共享对象，然后查找符号、重定位</li></ol><p>在动态链接下，程序模块之间包含大量的函数调用。在动态链接时，如果直接把一个模块中所有的函数都链接完毕，其实是一种浪费。因为很多函数在程序执行完成前根本不会被用到，比如错误处理函数或用户较少使用的模块等。ELF 采用 <em>延迟绑定 (Lazy Binding)</em> 的方法，当函数第一次被使用到时，才进行符号查找、重定位；如果没有用到，则不绑定。这样能够大大加快程序的启动速度。</p><p>ELF 中使用 <em>PLT (Procedure Linkage Table)</em> 来实现延迟绑定。当调用某个模块外部的函数时，并不直接通过 GOT 表来进行跳转，而是通过 PLT 表再加入一个间接层。每个外部函数在 PLT 表中都有一个相应的项。比如某个外部函数 <code>bar()</code> 的 PLT 项：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">bar@plt:</span>
<span class="line">jmp *(bar@GOT)</span>
<span class="line">push n</span>
<span class="line">push moduleID</span>
<span class="line">jump _dl_runtime_resolve</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于第一条 <code>jmp</code> 指令，如果链接器已经初始化该项，那么就相当于直接通过 GOT 表中的地址跳转到 <code>bar()</code>。然而，当第一次使用该函数时，链接器还没有初始化 PLT 表中的这一项，那么这条指令的效果是跳转到下一条指令，相当于啥也不干。<code>push</code> 将 <code>bar()</code> 的符号引用在重定位表 <code>.rel.plt</code> 中的下标与模块 ID 压入堆栈 (作为接下来要调用的函数的参数)，然后调用动态链接器的 <code>_dl_runtime_resolve()</code> 函数完成符号解析、重定位，并将 <code>bar()</code> 的真正地址直接填入到 <code>bar@GOT</code> 中。再次调用 <code>bar@plt</code> 时，通过第一条 <code>jmp</code> 指令就能直接跳转到 <code>bar()</code> 中。</p><p>在 ELF 中，GOT 表被拆分为 <code>.got</code> 和 <code>.got.plt</code>，所有对外部函数的引用都被分离到了 <code>.got.plt</code> 中。另外，<code>.got.plt</code> 中的前三项有特殊含义：</p><ul><li><code>.dynamic</code> 段的地址</li><li>本模块 ID</li><li><code>_dl_runtime_resolve()</code> 的地址</li></ul><p>由动态链接器在装载时将它们初始化。</p><p>PLT 在 ELF 中以单独的段存放，而且是地址无关的代码，因此可以与代码段合并为可读可执行的 segment。</p><hr><h2 id="动态链接相关结构" tabindex="-1"><a class="header-anchor" href="#动态链接相关结构"><span>动态链接相关结构</span></a></h2><p>OS 首先读取可执行文件的头部，检查文件的合法性，然后从 program header 中读取每个 segment 的信息，并将其映射到进程虚拟地址空间中。如果是静态链接，那么 OS 就会将控制权转移可执行文件的入口地址，然后程序开始执行；而如果是动态链接，OS 不能立刻将控制权交给可执行文件，因为可执行文件中对外部符号的引用还没有与共享对象链接。因此，OS 会首先启动动态链接器。动态链接器 <code>ld.so</code> 是一个共享对象，OS 将其加载到进程的地址空间中，将控制权交给动态链接器的入口地址。动态链接器开始工作，当所有动态链接工作完成后，动态链接器将控制权转交到可执行文件的入口地址。此时，程序才开始执行。</p><h3 id="interp" tabindex="-1"><a class="header-anchor" href="#interp"><span><code>.interp</code></span></a></h3><p>动态链接器的位置与系统无关，而是由 ELF 文件本身决定。在 <code>.interp</code> section 中，保存了一个字符串，就是可执行文件需要的动态链接器的路径。在 Linux 下，一般都是 <code>/lib/ld-linux.so.2</code> - 一般来说这是一个软链接，指向相应版本的 <code>ld.so</code>。即，<code>.interp</code> 指定了动态链接器的路径。</p><h3 id="dynamic" tabindex="-1"><a class="header-anchor" href="#dynamic"><span><code>.dynamic</code></span></a></h3><p><code>.dynamic</code> 中保存了动态链接器需要用到的基本信息：</p><ul><li>依赖哪些共享对象</li><li>动态链接符号表的位置</li><li>动态链接重定位表的位置</li><li>共享变量初始化代码地址 ...</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  Elf64_Sxword	d_tag<span class="token punctuation">;</span>			<span class="token comment">/* Dynamic entry type */</span></span>
<span class="line">  <span class="token keyword">union</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">      Elf64_Xword d_val<span class="token punctuation">;</span>		<span class="token comment">/* Integer value */</span></span>
<span class="line">      Elf64_Addr d_ptr<span class="token punctuation">;</span>			<span class="token comment">/* Address value */</span></span>
<span class="line">    <span class="token punctuation">}</span> d_un<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Elf64_Dyn<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>d_tag</code> 表示类型，剩余部分表示数值或指针。类型包含很多，大致内容与 ELF header 类似。可以认为，<code>.dynamic</code> 就是动态链接下 ELF 文件的 ELF header。</p><h3 id="动态符号表-dynsym" tabindex="-1"><a class="header-anchor" href="#动态符号表-dynsym"><span>动态符号表 <code>.dynsym</code></span></a></h3><p>与静态链接中的符号表 <code>.symtab</code> 类似，保存动态链接下模块符号的导入导出信息。其中，只保存与动态链接相关的符号。另外，静态链接时的 <code>.strtab</code> 表也有对应的动态符号字符串表 <code>.dynstr</code>。</p><h3 id="动态链接重定位表" tabindex="-1"><a class="header-anchor" href="#动态链接重定位表"><span>动态链接重定位表</span></a></h3><p>在动态链接下，一旦程序依赖于其它共享对象，那么代码或数据中就会用对于导入符号的引用。导入符号的地址只有在运行时才确定，因此需要重定位。与静态链接中，代码段、数据段分别带有重定位表类似，动态链接中：</p><ul><li><code>.rel.plt</code> - 对函数引用的重定位，修正位置位于 <code>.got.plt</code></li><li><code>.rel.dyn</code> - 对数据引用的重定位，修正位置位于 <code>.got</code> 与数据段</li></ul><h3 id="进程堆栈初始化信息" tabindex="-1"><a class="header-anchor" href="#进程堆栈初始化信息"><span>进程堆栈初始化信息</span></a></h3><p>当 OS 把控制权交给动态链接器的时候，动态链接器需要知道一些与可执行文件以及本进程相关的信息。这些信息由 OS 传递给动态链接器，保存在进程的堆栈中。这些辅助信息由一个结构体数组组成，结构体定义如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token class-name">uint64_t</span> a_type<span class="token punctuation">;</span>		<span class="token comment">/* Entry type */</span></span>
<span class="line">  <span class="token keyword">union</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">      <span class="token class-name">uint64_t</span> a_val<span class="token punctuation">;</span>		<span class="token comment">/* Integer value */</span></span>
<span class="line">      <span class="token comment">/* We use to have pointer elements added here.  We cannot do that,</span>
<span class="line">	 though, since it does not work when using 32-bit definitions</span>
<span class="line">	 on 64-bit platforms and vice versa.  */</span></span>
<span class="line">    <span class="token punctuation">}</span> a_un<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span> Elf64_auxv_t<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些辅助信息位于环境变量指针之后。</p><hr><h2 id="动态链接的步骤和实现" tabindex="-1"><a class="header-anchor" href="#动态链接的步骤和实现"><span>动态链接的步骤和实现</span></a></h2><p>动态链接简单讲分为三步：</p><ol><li>OS 启动动态链接器</li><li>动态链接器装载所有需要的共享对象</li><li>重定位、初始化</li></ol><p>动态链接器本身也是一个共享对象。谁来加载它并重定位呢？</p><p>动态链接器本身不依赖于任何共享对象。其本身所需要的全局变量和静态变量的重定位由它自己完成。动态链接器必须能够在不使用全局变量和静态变量和条件下完成启动。这一启动过程被称为 <strong>自举 (Bootstrap)</strong>。动态链接器的入口地址就是自举代码的地址。自举代码需要找到自己的 GOT 表，通过 GOT 表的第一个入口，得到 <code>.dynamic</code> 的偏移地址。在 <code>.dynamic</code> 中，自举代码获得动态链接器本身的重定位表和符号表，然后将它们全部重定位。之后，动态链接器代码才可以使用自己的全局变量和静态变量。在自举代码中，动态链接器甚至不能调用函数 - 因为如果使用 PIC 模式编译的共享对象，对于模块内的函数调用也是采用 GOT/PLT 的方式。在重定位之前，自举代码无法使用全局变量，也无法调用函数。</p><p>完成自举后，动态链接器将可执行文件与动态链接器本身的符号表合并为全局符号表，然后开始寻找可执行文件依赖的共享对象。在 <code>.dynamic</code> 中，可以指明可执行文件 (或共享对象) 依赖的共享对象。动态链接器依次将这些共享对象的文件打开，将代码段和数据段映射到进程地址空间。当一个新的共享对象被装载到内存时，其符号表会被合并到全局符号表中。</p><p>共享对象中的全局符号与另一个共享对象的同名符号发生冲突的现象被称为共享对象的 <strong>全局符号介入 (Global Symbol Interpose)</strong>。当一个符号要被加入全局符号表时，如果相同的符号名已经存在，则后加入的符号被忽略。</p><p>上面的步骤完成后，链接器开始重新遍历可执行文件和每个共享对象的重定位表，将其中的 GOT/PLT 中每个需要被重定位的位置进行修正。由于此时已经有了全局符号表，因此修正过程较为简单。如果共享对象有 <code>.init</code> 段，动态链接器就会执行 <code>.init</code> 段中的代码；如果可执行文件也有 <code>.init</code>，动态链接器不会执行，由程序初始化代码负责执行。</p><p>以上，所有准备工作完成，动态链接器将控制权转交给可执行文件入口地址。</p><hr>`,80)]))}const t=e(i,[["render",d],["__file","OS Dynamic Linking.html.vue"]]),o=JSON.parse('{"path":"/notes/Operating%20System/OS%20Dynamic%20Linking.html","title":"OS - Dynamic Linking","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"为什么要动态链接","slug":"为什么要动态链接","link":"#为什么要动态链接","children":[]},{"level":2,"title":"动态链接例子","slug":"动态链接例子","link":"#动态链接例子","children":[]},{"level":2,"title":"地址无关代码","slug":"地址无关代码","link":"#地址无关代码","children":[{"level":3,"title":"装载时重定位","slug":"装载时重定位","link":"#装载时重定位","children":[]},{"level":3,"title":"地址无关代码","slug":"地址无关代码-1","link":"#地址无关代码-1","children":[]},{"level":3,"title":"数据段的地址无关性","slug":"数据段的地址无关性","link":"#数据段的地址无关性","children":[]}]},{"level":2,"title":"延迟绑定 (PLT)","slug":"延迟绑定-plt","link":"#延迟绑定-plt","children":[]},{"level":2,"title":"动态链接相关结构","slug":"动态链接相关结构","link":"#动态链接相关结构","children":[{"level":3,"title":".interp","slug":"interp","link":"#interp","children":[]},{"level":3,"title":".dynamic","slug":"dynamic","link":"#dynamic","children":[]},{"level":3,"title":"动态符号表 .dynsym","slug":"动态符号表-dynsym","link":"#动态符号表-dynsym","children":[]},{"level":3,"title":"动态链接重定位表","slug":"动态链接重定位表","link":"#动态链接重定位表","children":[]},{"level":3,"title":"进程堆栈初始化信息","slug":"进程堆栈初始化信息","link":"#进程堆栈初始化信息","children":[]}]},{"level":2,"title":"动态链接的步骤和实现","slug":"动态链接的步骤和实现","link":"#动态链接的步骤和实现","children":[]}],"git":{},"filePathRelative":"notes/Operating System/OS Dynamic Linking.md"}');export{t as comp,o as data};
