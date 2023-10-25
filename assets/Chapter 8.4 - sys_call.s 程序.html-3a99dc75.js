import{_ as e,o as s,c as i,e as l}from"./app-25fa875f.js";const n={},d=l(`<h1 id="chapter-8-4-sys-call-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-8-4-sys-call-s-程序" aria-hidden="true">#</a> Chapter 8.4 - sys_call.s 程序</h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 16 16:18</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_8-4-sys-call-s-程序" tabindex="-1"><a class="header-anchor" href="#_8-4-sys-call-s-程序" aria-hidden="true">#</a> 8.4 sys_call.s 程序</h2><p>实现了 <strong>系统调用中断 INT 0x80</strong> 的入口处理过程以及 <strong>信号检测处理</strong>。</p><p>此外还给出了两个系统功能的底层接口：</p><ul><li>sys_execve</li><li>sys_fork</li></ul><p>还有处理过程类似的中断处理程序：</p><ul><li>INT 16：协处理器出错</li><li>INT 7：设备不存在</li><li>INT 32：时钟中断</li><li>INT 46：硬盘中断</li><li>INT 38：软盘中断</li></ul><h3 id="_8-4-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_8-4-1-功能描述" aria-hidden="true">#</a> 8.4.1 功能描述</h3><p>在 Linux 中，用户使用系统调用中断 INT 0x80 和寄存器 eax 中的功能号，来使用内核提供的各种功能服务。所有的系统调用服务的 C 函数实现分布在整个内核代码中，内核把它们按照功能号顺序排成一张 <strong>函数指针表</strong>，在 INT 0x80 的处理过程中，根据 eax 中的功能号，调用指针表中对应的服务代码。</p><p>另外，该程序中还包含对其它几个中断的入口处理代码：</p><ul><li>软中断 (system_call, coprocessor_error, device_not_available) 将一些参数压入堆栈，为调用的 C 函数处理程序做准备 (作为参数) <ul><li>系统调用参数 - EBX、ECX、EDX</li><li>调用 C 函数作相应处理</li><li>处理返回后检测当前任务的信号位图，对优先级最高的信号进行处理并复位</li></ul></li><li>硬件中断 <ul><li>向 8259A 发送 <strong>结束硬件中断控制字 EOI</strong></li><li>调用相应的 C 函数处理程序</li><li>对于 <strong>时钟中断</strong>，也需要对当前任务的信号位图进行检测处理</li></ul></li></ul><h4 id="_8-4-1-1-中断调用入口处理过程" tabindex="-1"><a class="header-anchor" href="#_8-4-1-1-中断调用入口处理过程" aria-hidden="true">#</a> 8.4.1.1 中断调用入口处理过程</h4><p>一个接口程序，每个调用的实际功能通过调用相应的 C 函数完成。首先，检查 eax 中的功能号是否在有效范围内，然后将一些用到的寄存器保存到堆栈上 - Linux 内核将 DS、ES 用于内核数据段，将 FS 用于用户程序数据段。通过 sys_call_table 调用相应系统调用的 C 函数进行进程处理，C 函数返回后，将返回值压入堆栈保存起来。</p><p>查看当前进程的状态。如果由于调用过程使进程从就绪态变为其它状态，或进程时间片已经用完，则调用调度函数 <code>schedule()</code> 调度进程。执行调度函数之前已经把 <code>ret_from_sys_call</code> 入栈；调度执行后，最终会回到 <code>ret_from_sys_call</code> 处继续执行。</p><blockquote><p>我的理解：此时，当前进程的系统调用已经做完或正在等待被处理或时间片用完，因此进程不能马上被执行，需要调度别的进程执行；而最终，CPU 的使用权总会回到当前进程 (比如等待的事件已经完成)。应当从系统调用返回 (即 <code>ret_from_sys_call</code>) 处开始继续执行。</p></blockquote><p><code>ret_from_sys_call</code> 主要做系统调用的后处理工作：</p><ul><li>判断当前进程是否为 0，若是，则直接退出此次系统调用</li><li>根据代码段描述符和使用的堆栈判断该进程是否为用户进程；若是内核进程，则立刻退出系统调用</li><li>处理调用系统调用的进程的信号；若信号位图表明该进程接收到信号，则调用信号处理函数 <code>do_signal()</code></li></ul><p>最终，恢复保存的寄存器内容，退出中断处理过程，返回调用程序。若有信号，则首先返回到相应的信号处理函数中，再返回调用系统调用的进程。</p><h4 id="_8-4-1-2-系统调用参数传递方法" tabindex="-1"><a class="header-anchor" href="#_8-4-1-2-系统调用参数传递方法" aria-hidden="true">#</a> 8.4.1.2 系统调用参数传递方法</h4><p>Linux 0.12 系统中，使用寄存器 EBX、ECX、EDX 传递参数，可以传递 <strong>指针</strong>。在系统调用运行过程中，段寄存器 DS、ES 指向内核数据空间，FS 指向用户数据空间。Linux 内核可以通过 FS 寄存器执行内核数据空间和用户数据空间的数据复制工作</p><ul><li><code>get_fs_byte()</code></li><li><code>put_fs_byte()</code></li></ul><p>优势：进入中断处理程序，进行堆栈切换时，这些传递参数的寄存器也被自动放在了内核态堆栈上。因此内核不用进行特殊处理。</p><h3 id="_8-4-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_8-4-2-代码注释" aria-hidden="true">#</a> 8.4.2 代码注释</h3><p>系统调用号不在合法范围的处理方式：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>ENOSYS = 38 # 系统调用号出错码

.align 2
bad_sys_call:
    pushl $-ENOSYS # 相当于在 eax 中放置出错码
    jmp ret_from_sys_call
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>系统调用中断处理过程：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 0x80 - 系统调用入口点
.align 2
_system_call:
    push %ds # 保存原寄存器值
    push %es
    push %fs
    pushl %eax # 保存功能号
    
    push %edx # 系统调用参数
    push %ecx
    push %ebx
    
    movl $0x10, %edx # 内核数据空间
    mov %dx, %ds
    mov %dx, %es
    movl $0x17, %edx # 用户数据空间
    mov %dx, %fs
    
    cmpl _NR_syscalls, %eax
    jae bad_sys_call # 调用号超出范围
    
    # 调用地址为 [_sys_call_table + %eax * 4]
    call _sys_call_table(, %eax, 4) # 调用对应功能的 C 函数
    pushl %eax # 系统调用返回值入栈
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来查看当前程序的运行状态：</p><ul><li>不在就绪状态 → 执行调度程序</li><li>处在就绪状态，但时间片已用完 → 执行调度程序</li></ul><p>重新执行调度程序的入口：</p><ul><li>调度程序返回时从 <code>ret_from_sys_call</code> 处继续执行。</li></ul><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
reschedule:
    pushl $ret_from_sys_call # 返回地址入栈
    jmp _schedule
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里显然需要访问任务的 task_struct 结构体。为了方便访问结构体中的各个字段，程序中预先定义了各字段在结构体中的偏移：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>state = 0
counter = 4
priority = 8
signal = 12
sigaction = 16
blocked = (33*16)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来是中断处理过程中的代码：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>2:
    movl _current, %eax # current 指针，指向当前任务
    cmpl $0, state(%eax) # 进程状态
    jne reschedule
    cmpl $0, counter(%eax) # 进程时间片
    jne reschedule
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，可能会调度到其它进程运行。当系统调用的 C 函数返回，并重新获得 CPU 使用权时，或本程序中的其它中断服务程序退出时，都会执行接下来的代码，对信号进行识别处理。此时，堆栈的布局是这样的：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    30(%esp) - %oldss
    2C(%esp) - %oldesp
    28(%esp) - %eflags
    24(%esp) - %cs
    20(%esp) - %eip
    1C(%esp) - %ds
    18(%esp) - %es
    14(%esp) - %fs
    10(%esp) - original %eax
     C(%esp) - %edx
     8(%esp) - %ecx
     4(%esp) - %ebx
     0(%esp) - %eax
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，为了便于通过 esp 指针访问堆栈中的数据，代码中定义了堆栈中各字段的偏移量：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>EAX = 0x00
EBX = 0x04
ECX = 0x08
EDX = 0x0C
ORIG_EAX = 0x10
FS = 0x14
ES = 0x18
DS = 0x1C
EIP = 0x20
CS = 0x24
EFLAGS = 0x28
OLDESP = 0x2C
OLDSS = 0x30
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面的代码中：</p><ul><li>标号 <code>ret_from_sys_call</code> 进行信号处理</li><li>标号 <code>3</code> 用于退出中断</li></ul><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>ret_from_sys_call:
    movl _current, %eax
    cmpl _task, %eax # task[0] 不处理信号
    je 3f # 直接退出中断
    
    cmpw $0x0f, CS(%esp) # 调用系统调用程序的代码段 RPL 是否为 3
    jne 3f # 不是用户代码，直接退出中断
    cmpw $0x17, OLDSS(%esp) # 调用系统调用程序的堆栈段是否是位于用户堆栈
    jne 3f # 不在用户堆栈，直接退出中断
    # 任务在内核态执行时不可抢占
    # 因此不对任务进行信号处理，直接退出中断
    
    # 处理信号
    movl signal(%eax), %ebx # ebx 中放置当前任务的信号 bitmap
    movl blocked(%eax), %ecx # ecx 中放置阻塞信号 bitmap
    notl %ecx
    andl %ebx, %ecx
    bsfl %ecx, %ecx # 从低位开始扫描信号 bitmap 是否有 1
    je 3f # 没有信号，则直接退出中断
    btrl %ecx, %ebx # 复位信号
    movl %ebx, signal(%eax) # 重新保存信号 bitmap
    
    incl %ecx # 将信号调整为 1 开始的数 (1-32)
    pushl %ecx # 信号值入栈，作为 do_signal 的参数
    call _do_signal # 调用信号处理的 C 函数
    popl %ecx # 弹出入栈的信号值
    test %eax, %eax # 返回值不为 0
    jne 2b # 切换进程 / 处理更多信号
    
3:
    popl %eax # 含有之前入栈的系统调用返回值
    popl %ebx
    popl %ecx
    popl %edx
    addl $4, %esp
    pop %fs
    pop %es
    pop %ds
    iret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来是一些软硬件中断的处理过程：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 16 - 处理器错误中断
# 协处理器检测到自己发生错误，通过 ERROR 引脚通知 CPU
# CPU 跳转执行 C 函数 math_error()
# 返回后跳转到标号 ret_from_sys_call 继续执行
.align 2
_coprocessor_error:
    push %ds
    push %es
    push %fs
    pushl $-1 # 不是系统调用，否则应保存功能号
    pushl %edx
    pushl %ecx
    pushl %ebx
    pushl %eax
    movl $0x10, %eax # 内核数据段
    mov %ax, %ds
    mov %ax, %es
    movl $0x17, %eax # 局部数据段
    mov %ax, %fs
    pushl $ret_from_sys_call # 调用返回地址入栈
    jmp _math_error # 执行 math_error()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 7 - 设备或协处理器不存在
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 32 - INT 0x20 - 时钟中断处理程序
.align 2
_timer_interrupt:
    push %ds
    push %es
    push %fs
    pushl $-1
    pushl %edx
    pushl %ecx
    pushl %ebx
    pushl %eax
    movl $0x10, %eax
    mov %ax, %ds
    mov %ax, %es
    movl $0x17, %eax
    mov %ax, %fs
    incl _jiffies # 增加一次系统滴答
    
    # 8259A 没有采用自动结束中断，所以需要发送指令结束中断
    movb $0x20, %al
    outb %al, $0x20
    
    # 从堆栈中取出执行系统调用代码的 CS 寄存器
    # 取其中的 CPL 特权级，并压入堆栈，作为 do_timer 的参数
    # do_timer() 执行任务切换、即使
    movl CS(%esp), %eax
    andl $3, %eax
    pushl %eax
    call _do_timer
    addl $4, %esp # 将压入堆栈的参数忽略
    jmp ret_from_sys_call
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 46 - INT 0x2E
# 硬盘中断处理程序
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 38 - INT 0x26
# 软盘中断处理程序
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># INT 39 - INT 0x27
# 并行接口中断处理程序
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>两个系统调用：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># sys_execve() 系统调用
.align 2
_sys_execve:
    lea EIP(%esp), %eax # eax 指向保存用户程序 EIP 处
    pushl %eax
    call _do_execve
    addl $4, %esp # 丢弃栈中参数
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code># sys_fork() 系统调用
.align 2
_sys_fork:
    call _find_empty_process # 为新进程取得进程号
    testl %eax, %eax
    js 1f # 进程号为负数，退出
    push %gs
    pushl %esi
    pushl %edi
    pushl %ebp
    pushl %eax
    call _copy_process
    addl $20, %esp # 丢弃所有栈中参数
1:
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,57),a=[d];function v(r,c){return s(),i("div",null,a)}const m=e(n,[["render",v],["__file","Chapter 8.4 - sys_call.s 程序.html.vue"]]);export{m as default};
