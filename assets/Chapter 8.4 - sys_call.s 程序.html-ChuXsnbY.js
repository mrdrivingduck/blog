import{_ as n,c as e,a as l,o as a}from"./app-BeHGwf2X.js";const i={};function d(p,s){return a(),e("div",null,s[0]||(s[0]=[l(`<h1 id="chapter-8-4-sys-call-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-8-4-sys-call-s-程序"><span>Chapter 8.4 - sys_call.s 程序</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 16 16:18</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_8-4-sys-call-s-程序" tabindex="-1"><a class="header-anchor" href="#_8-4-sys-call-s-程序"><span>8.4 sys_call.s 程序</span></a></h2><p>实现了 <strong>系统调用中断 INT 0x80</strong> 的入口处理过程以及 <strong>信号检测处理</strong>。</p><p>此外还给出了两个系统功能的底层接口：</p><ul><li>sys_execve</li><li>sys_fork</li></ul><p>还有处理过程类似的中断处理程序：</p><ul><li>INT 16：协处理器出错</li><li>INT 7：设备不存在</li><li>INT 32：时钟中断</li><li>INT 46：硬盘中断</li><li>INT 38：软盘中断</li></ul><h3 id="_8-4-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_8-4-1-功能描述"><span>8.4.1 功能描述</span></a></h3><p>在 Linux 中，用户使用系统调用中断 INT 0x80 和寄存器 eax 中的功能号，来使用内核提供的各种功能服务。所有的系统调用服务的 C 函数实现分布在整个内核代码中，内核把它们按照功能号顺序排成一张 <strong>函数指针表</strong>，在 INT 0x80 的处理过程中，根据 eax 中的功能号，调用指针表中对应的服务代码。</p><p>另外，该程序中还包含对其它几个中断的入口处理代码：</p><ul><li>软中断 (system_call, coprocessor_error, device_not_available) 将一些参数压入堆栈，为调用的 C 函数处理程序做准备 (作为参数) <ul><li>系统调用参数 - EBX、ECX、EDX</li><li>调用 C 函数作相应处理</li><li>处理返回后检测当前任务的信号位图，对优先级最高的信号进行处理并复位</li></ul></li><li>硬件中断 <ul><li>向 8259A 发送 <strong>结束硬件中断控制字 EOI</strong></li><li>调用相应的 C 函数处理程序</li><li>对于 <strong>时钟中断</strong>，也需要对当前任务的信号位图进行检测处理</li></ul></li></ul><h4 id="_8-4-1-1-中断调用入口处理过程" tabindex="-1"><a class="header-anchor" href="#_8-4-1-1-中断调用入口处理过程"><span>8.4.1.1 中断调用入口处理过程</span></a></h4><p>一个接口程序，每个调用的实际功能通过调用相应的 C 函数完成。首先，检查 eax 中的功能号是否在有效范围内，然后将一些用到的寄存器保存到堆栈上 - Linux 内核将 DS、ES 用于内核数据段，将 FS 用于用户程序数据段。通过 sys_call_table 调用相应系统调用的 C 函数进行进程处理，C 函数返回后，将返回值压入堆栈保存起来。</p><p>查看当前进程的状态。如果由于调用过程使进程从就绪态变为其它状态，或进程时间片已经用完，则调用调度函数 <code>schedule()</code> 调度进程。执行调度函数之前已经把 <code>ret_from_sys_call</code> 入栈；调度执行后，最终会回到 <code>ret_from_sys_call</code> 处继续执行。</p><blockquote><p>我的理解：此时，当前进程的系统调用已经做完或正在等待被处理或时间片用完，因此进程不能马上被执行，需要调度别的进程执行；而最终，CPU 的使用权总会回到当前进程 (比如等待的事件已经完成)。应当从系统调用返回 (即 <code>ret_from_sys_call</code>) 处开始继续执行。</p></blockquote><p><code>ret_from_sys_call</code> 主要做系统调用的后处理工作：</p><ul><li>判断当前进程是否为 0，若是，则直接退出此次系统调用</li><li>根据代码段描述符和使用的堆栈判断该进程是否为用户进程；若是内核进程，则立刻退出系统调用</li><li>处理调用系统调用的进程的信号；若信号位图表明该进程接收到信号，则调用信号处理函数 <code>do_signal()</code></li></ul><p>最终，恢复保存的寄存器内容，退出中断处理过程，返回调用程序。若有信号，则首先返回到相应的信号处理函数中，再返回调用系统调用的进程。</p><h4 id="_8-4-1-2-系统调用参数传递方法" tabindex="-1"><a class="header-anchor" href="#_8-4-1-2-系统调用参数传递方法"><span>8.4.1.2 系统调用参数传递方法</span></a></h4><p>Linux 0.12 系统中，使用寄存器 EBX、ECX、EDX 传递参数，可以传递 <strong>指针</strong>。在系统调用运行过程中，段寄存器 DS、ES 指向内核数据空间，FS 指向用户数据空间。Linux 内核可以通过 FS 寄存器执行内核数据空间和用户数据空间的数据复制工作</p><ul><li><code>get_fs_byte()</code></li><li><code>put_fs_byte()</code></li></ul><p>优势：进入中断处理程序，进行堆栈切换时，这些传递参数的寄存器也被自动放在了内核态堆栈上。因此内核不用进行特殊处理。</p><h3 id="_8-4-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_8-4-2-代码注释"><span>8.4.2 代码注释</span></a></h3><p>系统调用号不在合法范围的处理方式：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">ENOSYS = 38 # 系统调用号出错码</span>
<span class="line"></span>
<span class="line">.align 2</span>
<span class="line">bad_sys_call:</span>
<span class="line">    pushl $-ENOSYS # 相当于在 eax 中放置出错码</span>
<span class="line">    jmp ret_from_sys_call</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>系统调用中断处理过程：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 0x80 - 系统调用入口点</span>
<span class="line">.align 2</span>
<span class="line">_system_call:</span>
<span class="line">    push %ds # 保存原寄存器值</span>
<span class="line">    push %es</span>
<span class="line">    push %fs</span>
<span class="line">    pushl %eax # 保存功能号</span>
<span class="line">    </span>
<span class="line">    push %edx # 系统调用参数</span>
<span class="line">    push %ecx</span>
<span class="line">    push %ebx</span>
<span class="line">    </span>
<span class="line">    movl $0x10, %edx # 内核数据空间</span>
<span class="line">    mov %dx, %ds</span>
<span class="line">    mov %dx, %es</span>
<span class="line">    movl $0x17, %edx # 用户数据空间</span>
<span class="line">    mov %dx, %fs</span>
<span class="line">    </span>
<span class="line">    cmpl _NR_syscalls, %eax</span>
<span class="line">    jae bad_sys_call # 调用号超出范围</span>
<span class="line">    </span>
<span class="line">    # 调用地址为 [_sys_call_table + %eax * 4]</span>
<span class="line">    call _sys_call_table(, %eax, 4) # 调用对应功能的 C 函数</span>
<span class="line">    pushl %eax # 系统调用返回值入栈</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来查看当前程序的运行状态：</p><ul><li>不在就绪状态 → 执行调度程序</li><li>处在就绪状态，但时间片已用完 → 执行调度程序</li></ul><p>重新执行调度程序的入口：</p><ul><li>调度程序返回时从 <code>ret_from_sys_call</code> 处继续执行。</li></ul><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">reschedule:</span>
<span class="line">    pushl $ret_from_sys_call # 返回地址入栈</span>
<span class="line">    jmp _schedule</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里显然需要访问任务的 task_struct 结构体。为了方便访问结构体中的各个字段，程序中预先定义了各字段在结构体中的偏移：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">state = 0</span>
<span class="line">counter = 4</span>
<span class="line">priority = 8</span>
<span class="line">signal = 12</span>
<span class="line">sigaction = 16</span>
<span class="line">blocked = (33*16)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来是中断处理过程中的代码：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">2:</span>
<span class="line">    movl _current, %eax # current 指针，指向当前任务</span>
<span class="line">    cmpl $0, state(%eax) # 进程状态</span>
<span class="line">    jne reschedule</span>
<span class="line">    cmpl $0, counter(%eax) # 进程时间片</span>
<span class="line">    jne reschedule</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，可能会调度到其它进程运行。当系统调用的 C 函数返回，并重新获得 CPU 使用权时，或本程序中的其它中断服务程序退出时，都会执行接下来的代码，对信号进行识别处理。此时，堆栈的布局是这样的：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">    30(%esp) - %oldss</span>
<span class="line">    2C(%esp) - %oldesp</span>
<span class="line">    28(%esp) - %eflags</span>
<span class="line">    24(%esp) - %cs</span>
<span class="line">    20(%esp) - %eip</span>
<span class="line">    1C(%esp) - %ds</span>
<span class="line">    18(%esp) - %es</span>
<span class="line">    14(%esp) - %fs</span>
<span class="line">    10(%esp) - original %eax</span>
<span class="line">     C(%esp) - %edx</span>
<span class="line">     8(%esp) - %ecx</span>
<span class="line">     4(%esp) - %ebx</span>
<span class="line">     0(%esp) - %eax</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，为了便于通过 esp 指针访问堆栈中的数据，代码中定义了堆栈中各字段的偏移量：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">EAX = 0x00</span>
<span class="line">EBX = 0x04</span>
<span class="line">ECX = 0x08</span>
<span class="line">EDX = 0x0C</span>
<span class="line">ORIG_EAX = 0x10</span>
<span class="line">FS = 0x14</span>
<span class="line">ES = 0x18</span>
<span class="line">DS = 0x1C</span>
<span class="line">EIP = 0x20</span>
<span class="line">CS = 0x24</span>
<span class="line">EFLAGS = 0x28</span>
<span class="line">OLDESP = 0x2C</span>
<span class="line">OLDSS = 0x30</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面的代码中：</p><ul><li>标号 <code>ret_from_sys_call</code> 进行信号处理</li><li>标号 <code>3</code> 用于退出中断</li></ul><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">ret_from_sys_call:</span>
<span class="line">    movl _current, %eax</span>
<span class="line">    cmpl _task, %eax # task[0] 不处理信号</span>
<span class="line">    je 3f # 直接退出中断</span>
<span class="line">    </span>
<span class="line">    cmpw $0x0f, CS(%esp) # 调用系统调用程序的代码段 RPL 是否为 3</span>
<span class="line">    jne 3f # 不是用户代码，直接退出中断</span>
<span class="line">    cmpw $0x17, OLDSS(%esp) # 调用系统调用程序的堆栈段是否是位于用户堆栈</span>
<span class="line">    jne 3f # 不在用户堆栈，直接退出中断</span>
<span class="line">    # 任务在内核态执行时不可抢占</span>
<span class="line">    # 因此不对任务进行信号处理，直接退出中断</span>
<span class="line">    </span>
<span class="line">    # 处理信号</span>
<span class="line">    movl signal(%eax), %ebx # ebx 中放置当前任务的信号 bitmap</span>
<span class="line">    movl blocked(%eax), %ecx # ecx 中放置阻塞信号 bitmap</span>
<span class="line">    notl %ecx</span>
<span class="line">    andl %ebx, %ecx</span>
<span class="line">    bsfl %ecx, %ecx # 从低位开始扫描信号 bitmap 是否有 1</span>
<span class="line">    je 3f # 没有信号，则直接退出中断</span>
<span class="line">    btrl %ecx, %ebx # 复位信号</span>
<span class="line">    movl %ebx, signal(%eax) # 重新保存信号 bitmap</span>
<span class="line">    </span>
<span class="line">    incl %ecx # 将信号调整为 1 开始的数 (1-32)</span>
<span class="line">    pushl %ecx # 信号值入栈，作为 do_signal 的参数</span>
<span class="line">    call _do_signal # 调用信号处理的 C 函数</span>
<span class="line">    popl %ecx # 弹出入栈的信号值</span>
<span class="line">    test %eax, %eax # 返回值不为 0</span>
<span class="line">    jne 2b # 切换进程 / 处理更多信号</span>
<span class="line">    </span>
<span class="line">3:</span>
<span class="line">    popl %eax # 含有之前入栈的系统调用返回值</span>
<span class="line">    popl %ebx</span>
<span class="line">    popl %ecx</span>
<span class="line">    popl %edx</span>
<span class="line">    addl $4, %esp</span>
<span class="line">    pop %fs</span>
<span class="line">    pop %es</span>
<span class="line">    pop %ds</span>
<span class="line">    iret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来是一些软硬件中断的处理过程：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 16 - 处理器错误中断</span>
<span class="line"># 协处理器检测到自己发生错误，通过 ERROR 引脚通知 CPU</span>
<span class="line"># CPU 跳转执行 C 函数 math_error()</span>
<span class="line"># 返回后跳转到标号 ret_from_sys_call 继续执行</span>
<span class="line">.align 2</span>
<span class="line">_coprocessor_error:</span>
<span class="line">    push %ds</span>
<span class="line">    push %es</span>
<span class="line">    push %fs</span>
<span class="line">    pushl $-1 # 不是系统调用，否则应保存功能号</span>
<span class="line">    pushl %edx</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %ebx</span>
<span class="line">    pushl %eax</span>
<span class="line">    movl $0x10, %eax # 内核数据段</span>
<span class="line">    mov %ax, %ds</span>
<span class="line">    mov %ax, %es</span>
<span class="line">    movl $0x17, %eax # 局部数据段</span>
<span class="line">    mov %ax, %fs</span>
<span class="line">    pushl $ret_from_sys_call # 调用返回地址入栈</span>
<span class="line">    jmp _math_error # 执行 math_error()</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 7 - 设备或协处理器不存在</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 32 - INT 0x20 - 时钟中断处理程序</span>
<span class="line">.align 2</span>
<span class="line">_timer_interrupt:</span>
<span class="line">    push %ds</span>
<span class="line">    push %es</span>
<span class="line">    push %fs</span>
<span class="line">    pushl $-1</span>
<span class="line">    pushl %edx</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %ebx</span>
<span class="line">    pushl %eax</span>
<span class="line">    movl $0x10, %eax</span>
<span class="line">    mov %ax, %ds</span>
<span class="line">    mov %ax, %es</span>
<span class="line">    movl $0x17, %eax</span>
<span class="line">    mov %ax, %fs</span>
<span class="line">    incl _jiffies # 增加一次系统滴答</span>
<span class="line">    </span>
<span class="line">    # 8259A 没有采用自动结束中断，所以需要发送指令结束中断</span>
<span class="line">    movb $0x20, %al</span>
<span class="line">    outb %al, $0x20</span>
<span class="line">    </span>
<span class="line">    # 从堆栈中取出执行系统调用代码的 CS 寄存器</span>
<span class="line">    # 取其中的 CPL 特权级，并压入堆栈，作为 do_timer 的参数</span>
<span class="line">    # do_timer() 执行任务切换、即使</span>
<span class="line">    movl CS(%esp), %eax</span>
<span class="line">    andl $3, %eax</span>
<span class="line">    pushl %eax</span>
<span class="line">    call _do_timer</span>
<span class="line">    addl $4, %esp # 将压入堆栈的参数忽略</span>
<span class="line">    jmp ret_from_sys_call</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 46 - INT 0x2E</span>
<span class="line"># 硬盘中断处理程序</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 38 - INT 0x26</span>
<span class="line"># 软盘中断处理程序</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 39 - INT 0x27</span>
<span class="line"># 并行接口中断处理程序</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>两个系统调用：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># sys_execve() 系统调用</span>
<span class="line">.align 2</span>
<span class="line">_sys_execve:</span>
<span class="line">    lea EIP(%esp), %eax # eax 指向保存用户程序 EIP 处</span>
<span class="line">    pushl %eax</span>
<span class="line">    call _do_execve</span>
<span class="line">    addl $4, %esp # 丢弃栈中参数</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># sys_fork() 系统调用</span>
<span class="line">.align 2</span>
<span class="line">_sys_fork:</span>
<span class="line">    call _find_empty_process # 为新进程取得进程号</span>
<span class="line">    testl %eax, %eax</span>
<span class="line">    js 1f # 进程号为负数，退出</span>
<span class="line">    push %gs</span>
<span class="line">    pushl %esi</span>
<span class="line">    pushl %edi</span>
<span class="line">    pushl %ebp</span>
<span class="line">    pushl %eax</span>
<span class="line">    call _copy_process</span>
<span class="line">    addl $20, %esp # 丢弃所有栈中参数</span>
<span class="line">1:</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,57)]))}const r=n(i,[["render",d],["__file","Chapter 8.4 - sys_call.s 程序.html.vue"]]),v=JSON.parse('{"path":"/linux-kernel-comments-notes/Chapter%208%20-%20%E5%86%85%E6%A0%B8%E4%BB%A3%E7%A0%81/Chapter%208.4%20-%20sys_call.s%20%E7%A8%8B%E5%BA%8F.html","title":"Chapter 8.4 - sys_call.s 程序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"8.4 sys_call.s 程序","slug":"_8-4-sys-call-s-程序","link":"#_8-4-sys-call-s-程序","children":[{"level":3,"title":"8.4.1 功能描述","slug":"_8-4-1-功能描述","link":"#_8-4-1-功能描述","children":[]},{"level":3,"title":"8.4.2 代码注释","slug":"_8-4-2-代码注释","link":"#_8-4-2-代码注释","children":[]}]}],"git":{},"filePathRelative":"linux-kernel-comments-notes/Chapter 8 - 内核代码/Chapter 8.4 - sys_call.s 程序.md"}');export{r as comp,v as data};
