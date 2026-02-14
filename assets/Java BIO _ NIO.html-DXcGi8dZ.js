import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function c(t,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="java-bio-nio" tabindex="-1"><a class="header-anchor" href="#java-bio-nio"><span>Java - BIO &amp; NIO</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 14 21:42</p><p>Nanjing, Jiangsu, China</p><hr><p>BIO 和 NIO 的概念很早之前就听说过，但没有机会深挖。最近下定决心弄清楚，有机缘巧合买了一节相关的网课听了听，觉得有些收获。把几个常用到的名词和含义搞懂了：</p><ul><li>BIO / NIO / AIO</li><li>SELECT / POLL / EPOLL</li><li>同步 / 异步</li><li>阻塞 / 非阻塞</li></ul><p>本文大致以服务端网络 I/O 操作的发展演进过程为逻辑。</p><hr><h2 id="bio" tabindex="-1"><a class="header-anchor" href="#bio"><span>BIO</span></a></h2><p>BIO 即 blocking I/O，这是操作系统中最简单的 I/O 模型。无论是在网络课还是在操作系统课上，无论是 Java 还是 C/C++，都肯定演示过一个最简单的网络程序 (伪代码)：</p><ul><li>监听一个服务器端口</li><li>在一个死循环中，不断接收客户端连接并处理</li><li>如果不想在处理连接的同时错过新的客户端连接，就把连接的处理交给一个子进程/子线程</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">ServerSocket server = new ServerSocket(8080);</span>
<span class="line">while (true) {</span>
<span class="line">    Socket client = server.accept();</span>
<span class="line"></span>
<span class="line">    new Thread() {</span>
<span class="line">        // client...</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ServerSocket 的实例化过程有三步：</p><ul><li>调用 OS 的 <code>socket()</code> 系统调用，拿到一个文件描述符 fd</li><li>调用 OS 的 <code>bind()</code> 将这个 fd 关联到服务器要监听的端口上</li><li>调用 OS 的 <code>listen()</code> 开始监听 fd (即监听端口)</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       socket - create an endpoint for communication</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;sys/types.h&gt;          /* See NOTES */</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       int socket(int domain, int type, int protocol);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       socket()  creates  an  endpoint  for communication and returns a file descriptor that refers to that endpoint.</span>
<span class="line">       The file descriptor returned by a successful call will be the lowest-numbered file  descriptor  not  currently</span>
<span class="line">       open for the process.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       bind - bind a name to a socket</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;sys/types.h&gt;          /* See NOTES */</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       int bind(int sockfd, const struct sockaddr *addr,</span>
<span class="line">                socklen_t addrlen);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       When  a  socket  is  created  with  socket(2),  it  exists in a name space (address family) but has no address</span>
<span class="line">       assigned to it.  bind() assigns the address specified by addr to the socket referred to by the file descriptor</span>
<span class="line">       sockfd.   addrlen  specifies  the size, in bytes, of the address structure pointed to by addr.  Traditionally,</span>
<span class="line">       this operation is called “assigning a name to a socket”.</span>
<span class="line"></span>
<span class="line">       It is normally necessary to assign a local address using bind() before a SOCK_STREAM socket may  receive  con‐</span>
<span class="line">       nections (see accept(2)).</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       listen - listen for connections on a socket</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;sys/types.h&gt;          /* See NOTES */</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       int listen(int sockfd, int backlog);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       listen() marks the socket referred to by sockfd as a passive socket, that is, as a socket that will be used to</span>
<span class="line">       accept incoming connection requests using accept(2).</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在死循环中，<code>accept()</code> 用于接受客户端连接，将会一直阻塞 (即不再向下执行代码，进程处于休眠)，直到有新的连接到来，进程被 OS 唤醒，代码继续向下执行。该系统调用返回了客户端对应的 socket fd。</p><p>另外，在子线程处理连接的过程中，如果调用了 <code>recv()</code> 读取客户端发来的数据，OS 只有在接收到数据后才会使 <code>recv()</code> 返回。因此，<code>accept()</code> 和 <code>recv()</code> 这两个系统调用都是阻塞的。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       accept, accept4 - accept a connection on a socket</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;sys/types.h&gt;          /* See NOTES */</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);</span>
<span class="line"></span>
<span class="line">       #define _GNU_SOURCE             /* See feature_test_macros(7) */</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       int accept4(int sockfd, struct sockaddr *addr,</span>
<span class="line">                   socklen_t *addrlen, int flags);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       The  accept()  system  call  is  used  with  connection-based  socket types (SOCK_STREAM, SOCK_SEQPACKET).  It</span>
<span class="line">       extracts the first connection request on the queue of pending connections for the  listening  socket,  sockfd,</span>
<span class="line">       creates a new connected socket, and returns a new file descriptor referring to that socket.  The newly created</span>
<span class="line">       socket is not in the listening state.  The original socket sockfd is unaffected by this call.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       recv, recvfrom, recvmsg - receive a message from a socket</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;sys/types.h&gt;</span>
<span class="line">       #include &lt;sys/socket.h&gt;</span>
<span class="line"></span>
<span class="line">       ssize_t recv(int sockfd, void *buf, size_t len, int flags);</span>
<span class="line"></span>
<span class="line">       ssize_t recvfrom(int sockfd, void *buf, size_t len, int flags,</span>
<span class="line">                        struct sockaddr *src_addr, socklen_t *addrlen);</span>
<span class="line"></span>
<span class="line">       ssize_t recvmsg(int sockfd, struct msghdr *msg, int flags);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       The  recv(),  recvfrom(), and recvmsg() calls are used to receive messages from a socket.  They may be used to</span>
<span class="line">       receive data on both connectionless and connection-oriented sockets.  This page first  describes  common  fea‐</span>
<span class="line">       tures of all three system calls, and then describes the differences between the calls.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，BIO 的特性是：<strong>一个线程对应一个连接</strong>，能够解决的问题：</p><ul><li>可以接收大量的连接</li></ul><p>但是弊端在于，OS 中将会同时存在大量的线程：</p><ul><li>线程内存开销较大</li><li>大量的 CPU 资源被浪费在线程上下文切换上</li></ul><p>造成 BIO 特性的根本原因是，<strong>系统调用的阻塞性</strong>。如果系统调用能够支持非阻塞，那么就能够使用新的 I/O 模型。</p><h2 id="nio" tabindex="-1"><a class="header-anchor" href="#nio"><span>NIO</span></a></h2><p>OS 中的 NIO 指的是 non-blocking I/O，而 Java JDK 中的 <code>nio</code> 指的是 new I/O。在 Linux 2.6.27 起对 <code>socket()</code> 系统调用的非阻塞提供了支持：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">Since Linux 2.6.27, the type argument serves a second purpose: in addition to specifying a socket type, it</span>
<span class="line">may include the bitwise OR of any of the following values, to modify the behavior of socket():</span>
<span class="line"></span>
<span class="line">       SOCK_NONBLOCK   Set the O_NONBLOCK file status flag on the new open file  description.   Using  this  flag</span>
<span class="line">                       saves extra calls to fcntl(2) to achieve the same result.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而较新的 Java 版本使用内核提供的非阻塞系统调用实现了 JDK 中的 NIO。可以看一个用 Java NIO API 实现的例子：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token class-name">ServerSocketChannel</span> server <span class="token operator">=</span> <span class="token class-name">ServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">open</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">server<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">InetSocketAddress</span><span class="token punctuation">(</span><span class="token number">9090</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">server<span class="token punctuation">.</span><span class="token function">configureBlocking</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// 所有客户端连接</span></span>
<span class="line"><span class="token class-name">LinkedList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SocketChannel</span><span class="token punctuation">&gt;</span></span> clients <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">SocketChannel</span> client <span class="token operator">=</span> server<span class="token punctuation">.</span><span class="token function">accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>client <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// ..</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span></span>
<span class="line">        client<span class="token punctuation">.</span><span class="token function">configureBlocking</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        clients<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>client<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 维护客户端</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token class-name">ByteBuffer</span> buffer <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">allocateDirect</span><span class="token punctuation">(</span><span class="token number">4096</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">SocketChannel</span> c <span class="token operator">:</span> clients<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span> num <span class="token operator">=</span> c<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>num <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">// ...</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每一轮循环中，<code>accept()</code> 不会阻塞，立刻返回：</p><ul><li>如果有连接，就返回连接</li><li>如果没有连接，就返回 <code>null</code></li></ul><p>另外，在每轮循环中，对于已经建立的每一个连接调用一次 <code>read()</code> 来接收数据，<code>read()</code> 的调用也是非阻塞的，如果有数据，就返回一个大于 0 的字节数。这样一来，<strong>只使用了一个线程</strong>，就实现了 BIO 模型中的功能。在并发量较大时 (C10K)，相比 BIO 有优势。</p><p>它的局限性在于，假设 <code>clients</code> 中维护着大量的客户端连接。在每一轮循环中，都要对整个 <code>clients</code> 链表中的每一个客户端调用一次 <code>read()</code>，但只有极个别的客户端有数据可以被读取。那么相当于绝大部分 <code>read()</code> 的调用是无意义的。这一过程中，由于进行了大量的系统调用，大量的 CPU 时间被浪费在内核态-用户态切换上。</p><p>这个问题的实质是，用户空间程序用一个 for 循环来遍历内核中的数据结构 (fd)，大量系统调用带来了大量堆栈切换的开销。如果用户空间程序可以通过 <strong>一次</strong> 系统调用，一次性把所有要查询的 fd 告诉内核，由内核来进行循环遍历，那么就可以节省堆栈切换的开销。这种通过一次系统调用同时查询多个 fd 的 I/O 状态的方式被称为 <strong>多路复用</strong>。</p><hr><h2 id="select-and-poll" tabindex="-1"><a class="header-anchor" href="#select-and-poll"><span>SELECT and POLL</span></a></h2><p>这两个系统调用是 POSIX 标准中定义的多路复用功能，Linux 很早就实现了它们。用户空间程序告诉内核自己想要查询哪些 fd 的 I/O 已经处于就绪状态，内核代为查询之后，返回给用户空间。</p><p>关于 SELECT 在 Linux 0.12 中的实现可以参考 [这里](../../linux-kernel-comments-notes/Chapter 12 - 文件系统/Chapter 12.19 - select.c 程序.md)。用户空间程序可以以 bitmap 的形式，将想要查询 I/O 状态的 fd 对应的 bit 置为 1。其中的限制在于 bitmap 的长度是确定的，因此查询的 fd 范围受到了限制。而 POLL 的参数是链表，从而突破了这个局限。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       select, pselect, FD_CLR, FD_ISSET, FD_SET, FD_ZERO - synchronous I/O multiplexing</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       /* According to POSIX.1-2001, POSIX.1-2008 */</span>
<span class="line">       #include &lt;sys/select.h&gt;</span>
<span class="line"></span>
<span class="line">       /* According to earlier standards */</span>
<span class="line">       #include &lt;sys/time.h&gt;</span>
<span class="line">       #include &lt;sys/types.h&gt;</span>
<span class="line">       #include &lt;unistd.h&gt;</span>
<span class="line"></span>
<span class="line">       int select(int nfds, fd_set *readfds, fd_set *writefds,</span>
<span class="line">                  fd_set *exceptfds, struct timeval *timeout);</span>
<span class="line"></span>
<span class="line">       void FD_CLR(int fd, fd_set *set);</span>
<span class="line">       int  FD_ISSET(int fd, fd_set *set);</span>
<span class="line">       void FD_SET(int fd, fd_set *set);</span>
<span class="line">       void FD_ZERO(fd_set *set);</span>
<span class="line"></span>
<span class="line">       #include &lt;sys/select.h&gt;</span>
<span class="line"></span>
<span class="line">       int pselect(int nfds, fd_set *readfds, fd_set *writefds,</span>
<span class="line">                   fd_set *exceptfds, const struct timespec *timeout,</span>
<span class="line">                   const sigset_t *sigmask);</span>
<span class="line">   Feature Test Macro Requirements for glibc (see feature_test_macros(7)):</span>
<span class="line"></span>
<span class="line">       pselect(): _POSIX_C_SOURCE &gt;= 200112L</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       select()  and pselect() allow a program to monitor multiple file descriptors, waiting until one or more of</span>
<span class="line">       the file descriptors become &quot;ready&quot; for some class of  I/O  operation  (e.g.,  input  possible).   A  file</span>
<span class="line">       descriptor  is  considered ready if it is possible to perform a corresponding I/O operation (e.g., read(2)</span>
<span class="line">       without blocking, or a sufficiently small write(2)).</span>
<span class="line"></span>
<span class="line">       select() can monitor only file descriptors numbers that are less than FD_SETSIZE; poll(2)  does  not  have</span>
<span class="line">       this limitation.  See BUGS.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">NAME</span>
<span class="line">       poll, ppoll - wait for some event on a file descriptor</span>
<span class="line"></span>
<span class="line">SYNOPSIS</span>
<span class="line">       #include &lt;poll.h&gt;</span>
<span class="line"></span>
<span class="line">       int poll(struct pollfd *fds, nfds_t nfds, int timeout);</span>
<span class="line"></span>
<span class="line">       #define _GNU_SOURCE         /* See feature_test_macros(7) */</span>
<span class="line">       #include &lt;signal.h&gt;</span>
<span class="line">       #include &lt;poll.h&gt;</span>
<span class="line"></span>
<span class="line">       int ppoll(struct pollfd *fds, nfds_t nfds,</span>
<span class="line">               const struct timespec *tmo_p, const sigset_t *sigmask);</span>
<span class="line"></span>
<span class="line">DESCRIPTION</span>
<span class="line">       poll()  performs a similar task to select(2): it waits for one of a set of file descriptors to become ready</span>
<span class="line">       to perform I/O.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这种多路复用显著减少了系统调用的调用次数，但是还存在一个问题：</p><ul><li>每次调用都要传递大量重复的 fd (用户空间向内核空间复制参数是需要开销的)</li><li>内核每次都要遍历内核中所有的 fd 来确定哪些 fd 就绪 (类似轮询，需要通过中断解决)</li></ul><p>如果能够在内核中维护用户空间要查询的所有 fd 的状态，那么就能够消除这种参数复制开销。这就是 EPOLL 多路复用器出现的意义。</p><hr><h2 id="epoll" tabindex="-1"><a class="header-anchor" href="#epoll"><span>EPOLL</span></a></h2><p>EPOLL 如何实现高效查询多个 fd 的状态呢？</p><p>EPOLL 包含三个系统调用：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">int</span> <span class="token function">epoll_create</span><span class="token punctuation">(</span><span class="token keyword">int</span> size<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">epoll_ctl</span><span class="token punctuation">(</span><span class="token keyword">int</span> epfd<span class="token punctuation">,</span> <span class="token keyword">int</span> op<span class="token punctuation">,</span> <span class="token keyword">int</span> fd<span class="token punctuation">,</span> <span class="token keyword">struct</span> <span class="token class-name">epoll_event</span> <span class="token operator">*</span>event<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">epoll_wait</span><span class="token punctuation">(</span><span class="token keyword">int</span> epfd<span class="token punctuation">,</span> <span class="token keyword">struct</span> <span class="token class-name">epoll_event</span> <span class="token operator">*</span>events<span class="token punctuation">,</span></span>
<span class="line">                      <span class="token keyword">int</span> maxevents<span class="token punctuation">,</span> <span class="token keyword">int</span> timeout<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这三个系统调用的使用方式：</p><p>首先使用 <code>epoll_create()</code>，内核会开辟一块内存，然后返回一个代表这个内存区的 epoll fd。这块内存用于保存所有要监视的 fd。</p><p>然后，用户空间通过调用 <code>epoll_ctl()</code>，将 想要监视的 <strong>fd</strong> 以及 <strong>事件</strong> 注册到 epoll fd 对应的内存中。注意，对于某一个被监视的 fd，一般只需要调用一次 <code>epoll_ctl()</code> 即可。<code>epoll_ctl()</code> 支持的注册事件包括：</p><ul><li><code>EPOLL_CTL_ADD</code> - 注册 fd</li><li><code>EPOLL_CTL_MOD</code> - 修改已注册 fd 的事件</li><li><code>EPOLL_CTL_DEL</code> - 解除注册 fd</li></ul><p>支持监视的事件很多，比如：</p><ul><li><code>EPOLLIN</code> - fd 可被调用 <code>read()</code></li><li><code>EPOLLOUT</code> - fd 可被调用 <code>write()</code></li><li>...</li></ul><p>用户空间程序只需要调用 <code>epoll_wait()</code> (并可指定一个超时参数)，内核就会返回目前已经就绪的 fd。</p><p>可以看到，上述步骤解决了 SELECT 与 POLL 中需要反复向内核传递 fd 集合的问题，内核已经在 epoll fd 对应的内存中维护了所有已注册的被监控 fd。另外，EPOLL 中具体做了哪些工作来提高性能呢？</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * This structure is stored inside the &quot;private_data&quot; member of the file</span>
<span class="line"> * structure and represents the main data structure for the eventpoll</span>
<span class="line"> * interface.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">eventpoll</span> <span class="token punctuation">{</span></span>
<span class="line">	<span class="token comment">/* Protect the access to this structure */</span></span>
<span class="line">	<span class="token class-name">spinlock_t</span> lock<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * This mutex is used to ensure that files are not removed</span>
<span class="line">	 * while epoll is using them. This is held during the event</span>
<span class="line">	 * collection loop, the file cleanup path, the epoll file exit</span>
<span class="line">	 * code and the ctl operations.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">mutex</span> mtx<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Wait queue used by sys_epoll_wait() */</span></span>
<span class="line">	<span class="token class-name">wait_queue_head_t</span> wq<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* Wait queue used by file-&gt;poll() */</span></span>
<span class="line">	<span class="token class-name">wait_queue_head_t</span> poll_wait<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* List of ready file descriptors */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">list_head</span> rdllist<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* RB tree root used to store monitored fd structs */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">rb_root_cached</span> rbr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/*</span>
<span class="line">	 * This is a single linked list that chains all the &quot;struct epitem&quot; that</span>
<span class="line">	 * happened while transferring ready events to userspace w/out</span>
<span class="line">	 * holding -&gt;lock.</span>
<span class="line">	 */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">epitem</span> <span class="token operator">*</span>ovflist<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* wakeup_source used when ep_scan_ready_list is running */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">wakeup_source</span> <span class="token operator">*</span>ws<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* The user that created the eventpoll descriptor */</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">user_struct</span> <span class="token operator">*</span>user<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">file</span> <span class="token operator">*</span>file<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">	<span class="token comment">/* used to optimize loop detection check */</span></span>
<span class="line">	<span class="token keyword">int</span> visited<span class="token punctuation">;</span></span>
<span class="line">	<span class="token keyword">struct</span> <span class="token class-name">list_head</span> visited_list_link<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">CONFIG_NET_RX_BUSY_POLL</span></span></span>
<span class="line">	<span class="token comment">/* used to track busy poll napi_id */</span></span>
<span class="line">	<span class="token keyword">unsigned</span> <span class="token keyword">int</span> napi_id<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上是 Linux 4.15 内核中的 epoll 结构体。内核在 <code>struct rb_root_cached rbr</code> 中将所有被监控的 fd 维护成一颗红黑树，对这棵树进行增删改查的时间复杂度为 O(log(n))。另外，<code>struct list_head rdllist</code> 维护了所有已经就绪的被监控 fd。</p><p>当被监控的 fd 加入红黑树时，内核会为中断处理程序注册一个回调函数。当这个 fd 对应的中断到达时，在中断处理程序的回调函数中，将 fd 自身放入就绪链表。当用户空间程序调用 <code>epoll_wait()</code> 时，直接返回这个链表中的数据即可。</p><p>EPOLL 是一个适用于多 CPU core 场景的多路复用器。对于 SELECT 或 POLL 来说，假设一个 CPU 正在运行用户空间的服务器进程，当服务器进程调用 SELECT 或 POLL 时，另一个 CPU 运行内核态代码，而运行服务器进程的 CPU 只能干等，或上下文切换。对于 EPOLL 来说，一个 CPU 可以专门运行服务器进程，一个 CPU 可以专门运行内核中的中断处理代码，两者可以并行。能够并行的根本原因是，内核中维护了 fd 的状态，两个 CPU core 能够共同访问这些状态。</p><p>EPOLL 有两种触发方式：</p><ul><li>Level-triggered (水平触发) (也是 SELECT、POLL 的触发方式)</li><li>Edge-triggered (边沿触发) (也是 <em>信号驱动 I/O</em> 的触发方式)</li></ul><p>顾名思义，水平触发就是，只要 fd 已经就绪，每次调用 <code>epoll_wait()</code> 都能返回该 fd；而边沿触发只会在某个 fd 第一次就绪时通过 <code>epoll_wait()</code> 返回，假设用户代码没有对一个已经就绪的 fd 调用 <code>recv()</code>，那么之后调用 <code>epoll_wait()</code> 时内核将不会返回这个 fd，直到这个 fd 第二次就绪。</p><hr><h2 id="同步-异步" tabindex="-1"><a class="header-anchor" href="#同步-异步"><span>同步 &amp; 异步？</span></a></h2><p>这是一个纠缠了很久的问题，但是随着上述知识点的学习，似乎突然就明朗了。</p><p>可以看到，上述的 BIO 过程，或是 NIO + 多路复用器的过程，程序都需要主动调用 <code>recv()</code> / <code>accept()</code> 等系统调用读取数据或建立连接。即使使用了 <strong>多路复用器</strong>，其系统调用也只不过是向内核 <strong>查询了 I/O 的状态</strong>，对于状态为 ready 的 fd，程序还是需要主动调用 <code>recv()</code> 接收数据。这种 I/O 模型全部被称为 <strong>同步 I/O 模型</strong>。</p><p>而所谓的异步 I/O，是有专门的内核线程负责将 socket 接收到的数据自动拷贝到程序的用户空间缓冲区中，再发送信号通知进程。程序自己不需要主动调用 <code>recv()</code> 从内核拷贝数据了。这种模型被称为 <strong>异步 I/O (AIO) 模型</strong>。</p><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p>腾讯课堂 马士兵教育公开课：BIO NIO Netty</p><p><a href="https://blog.csdn.net/wangfeng2500/article/details/9127421" target="_blank" rel="noopener noreferrer">CSDN - epoll 为什么这么快，epoll 的实现原理</a></p><p><a href="https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/" target="_blank" rel="noopener noreferrer">Julia Evans - Async IO on Linux: select, poll, and epoll</a></p><p>[Mr Dk.&#39;s blog - Linux 0.12 内核完全注释 - select.c 程序](../../linux-kernel-comments-notes/Chapter 12 - 文件系统/Chapter 12.19 - select.c 程序.md)</p>`,77)]))}const d=n(i,[["render",c],["__file","Java BIO _ NIO.html.vue"]]),o=JSON.parse('{"path":"/notes/Java/Java%20BIO%20_%20NIO.html","title":"Java - BIO & NIO","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"BIO","slug":"bio","link":"#bio","children":[]},{"level":2,"title":"NIO","slug":"nio","link":"#nio","children":[]},{"level":2,"title":"SELECT and POLL","slug":"select-and-poll","link":"#select-and-poll","children":[]},{"level":2,"title":"EPOLL","slug":"epoll","link":"#epoll","children":[]},{"level":2,"title":"同步 & 异步？","slug":"同步-异步","link":"#同步-异步","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Java/Java BIO & NIO.md"}');export{d as comp,o as data};
