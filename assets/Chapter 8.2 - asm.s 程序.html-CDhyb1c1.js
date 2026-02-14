import{_ as n,c as e,a,o as l}from"./app-BeHGwf2X.js";const i="/blog/assets/8-4-D1wL-64U.png",d={};function p(r,s){return l(),e("div",null,s[0]||(s[0]=[a('<h1 id="chapter-8-2-asm-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-8-2-asm-s-程序"><span>Chapter 8.2 - asm.s 程序</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 14 21:11</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_8-2-asm-s-程序" tabindex="-1"><a class="header-anchor" href="#_8-2-asm-s-程序"><span>8.2 asm.s 程序</span></a></h2><h3 id="_8-2-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_8-2-1-功能描述"><span>8.2.1 功能描述</span></a></h3><p>包含 CPU 探测到的大部分异常的故障处理底层代码，与 <code>kernel/traps.c</code> 程序有着密切的联系。主要处理方式：</p><ul><li>在中断处理程序中调用 traps.c 中的 C 函数程序</li><li>显示出错位置和出错号</li><li>退出中断</li></ul><p>首先，从用户态堆栈切换到内核态堆栈：</p><ul><li>SS、ESP 入内核栈</li><li>EFLAGS 入内核栈</li><li>用户程序返回地址 CS、EIP 入内核栈</li></ul><p>之后，将错误码 (如果有) 和对应的处理 C 函数入栈，并用 <code>XCHG</code> 指令将错误码和 C 函数指针换出至寄存器中。将所有通用寄存器入栈、将错误码入栈，最后将中断返回地址 EIP 入栈。最后两步中，错误码和中断返回地址作为对应 C 函数的参数入栈，以便 C 函数打印出错位置和错误码。整体过程如图所示：</p><p><img src="'+i+`" alt="8-4"></p><h3 id="_8-2-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_8-2-2-代码注释"><span>8.2.2 代码注释</span></a></h3><p>主要涉及对 Intel 保留中断 INT 0 - INT 16 的处理。</p><p>全局函数名的声明，其实现位于 traps.c 中。</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.globl _divide_error, _debug, _nmi, _int3, _overflow, _bounds, _invalid_op</span>
<span class="line">.globl _double_fault, _coprocessor_segment_overrun</span>
<span class="line">.globl _invalid_TSS, _segment_not_present, _stack_segment</span>
<span class="line">.globl _general_protection, _coprocessor_error, _irq13, _reserved</span>
<span class="line">.globl _alignment_check</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下汇编是 <strong>没有错误码</strong> 的异常处理过程 - eax 寄存器放置了对应 C 函数的地址：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 0 - 除法出错</span>
<span class="line"># 除数为 0，或 EAX 中容纳不了一个合法除操作的结果</span>
<span class="line"># 下面的 _do_divide_error 是 C 函数 do_divide_error() 编译后生成模块中对应的名称</span>
<span class="line">_divide_error:</span>
<span class="line">    pushl $_do_divide_error # 调用的 C 函数地址入栈</span>
<span class="line">no_error_code:</span>
<span class="line">    xchgl %eax, (%esp) # 将 C 函数交换到 eax 寄存器中</span>
<span class="line">    pushl %ebx # 保存通用寄存器</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %edx</span>
<span class="line">    pushl %edi</span>
<span class="line">    pushl %esi</span>
<span class="line">    pushl %ebp</span>
<span class="line">    push %ds</span>
<span class="line">    push %es</span>
<span class="line">    push %fs</span>
<span class="line">    pushl $0 # 错误码为 0 (即无错误码) 入栈</span>
<span class="line">    lea 44(%esp), %edx # 取调用原返回地址的栈指针位置</span>
<span class="line">    pushl %edx # 调用返回地址栈指针入栈</span>
<span class="line">    movl $0x10, %edx # 段寄存器加载内核段选择符</span>
<span class="line">    mov %dx, %ds</span>
<span class="line">    mov %dx, %es</span>
<span class="line">    mov %dx, %fs</span>
<span class="line">    call *%eax # 调用 C 函数，相当于 do_divide_error(long esp, long error_code)</span>
<span class="line">    addl $8, %esp # 相当于将两个函数参数 pop</span>
<span class="line">    pop %fs # 恢复通用寄存器</span>
<span class="line">    pop %es</span>
<span class="line">    pop %ds</span>
<span class="line">    popl %ebp</span>
<span class="line">    popl %esi</span>
<span class="line">    popl %edi</span>
<span class="line">    popl %edx</span>
<span class="line">    popl %ecx</span>
<span class="line">    popl %ebx</span>
<span class="line">    popl %eax</span>
<span class="line">    iret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其余无错误码的异常，复用了标号为 <code>no_error_code</code> 的汇编代码：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 1 - debug 调试中断入口点</span>
<span class="line"># EFLAGS 中 TF 标志置位引发的异常中断</span>
<span class="line">_debug:</span>
<span class="line">    pushl $_do_int3</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 2 - 非屏蔽中断调用入口</span>
<span class="line"># 接受到 NMI 信号时，CPU 内部产生中断向量 2</span>
<span class="line"># CPU 收到 NMI 信号并开始执行时，随后所有的硬件中断都将被忽略</span>
<span class="line">_nmi:</span>
<span class="line">    pushl $_do_nmi</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 3 - 断点指令引起的中断入口点</span>
<span class="line"># 由 INT 3 指令触发，通常由调试器插入被调试的代码中</span>
<span class="line">_int3:</span>
<span class="line">    pushl $_do_int3</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 4 - 溢出出错处理中断入口点</span>
<span class="line"># EFLAGS 中的 OF 标志置位时 CPU 执行 INTO 指令引发中断</span>
<span class="line">_overflow:</span>
<span class="line">    pushl $_do_overflow</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 5 - 边界检查出错中断入口点</span>
<span class="line"># 操作数在有效范围以外时触发 - BOUND 指令</span>
<span class="line">_bounds:</span>
<span class="line">    pushl $_do_bounds</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 6 - 无效操作指令出错中断入口点</span>
<span class="line"># CPU 执行机构检测到一个无效的操作码</span>
<span class="line">_invalid_op:</span>
<span class="line">    pushl $_do_invalid_op</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 9 - 协处理器段超出中断入口点</span>
<span class="line"># 协处理器出错保护 - 浮点指令操作数太大</span>
<span class="line">_coprocessor_segment_overrun:</span>
<span class="line">    pushl $_do_coprocessor_segment_overrun</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 15 - 其它 Intel 保留中断的入口点</span>
<span class="line">_reserved:</span>
<span class="line">    pushl $_do_reserved</span>
<span class="line">    jmp no_error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面是一个特殊的设置 - Linux 设置的数学协处理器硬件中断 INT 45：当协处理器执行完一个操作就会发出 IRQ 13 中断信号。80837 在执行计算时，CPU 会等待其操作完成，0xF0 是协处理器端口，用于清除忙锁存器，清除 CPU 的 BUSY 信号，重新激活 PEREQ。</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">_irq13:</span>
<span class="line">    pushl %eax</span>
<span class="line">    xorb %al, %al</span>
<span class="line">    outb %al, $0xF0</span>
<span class="line">    movb $0x20, %al</span>
<span class="line">    outb %al, $0x20</span>
<span class="line">    jmp 1f</span>
<span class="line">    jmp 1f</span>
<span class="line">    outb %al, $0xA0</span>
<span class="line">    popl %eax</span>
<span class="line">    jmp _coprocessor_error</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下汇编是 <strong>有错误码</strong> 的异常处理过程：</p><ul><li>eax 中放置了错误码</li><li>ebx 中放置了对应 C 函数的地址</li></ul><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 8 - 双出错故障</span>
<span class="line"># 当 CPU 调用前一个异常处理程序时又检测到了新的异常，两个异常会被串行处理</span>
<span class="line"># 少数情况下，CPU 不能进行这样的串行处理，因而引发该中断</span>
<span class="line">_double_fault:</span>
<span class="line">    pushl $_do_double_fault</span>
<span class="line">error_code:</span>
<span class="line">    xchgl %eax, 4(%esp)</span>
<span class="line">    xchgl %ebx, (%esp)</span>
<span class="line">    pushl %ecx # 保存通用寄存器</span>
<span class="line">    pushl %edx</span>
<span class="line">    pushl %edi</span>
<span class="line">    pushl %esi</span>
<span class="line">    pushl %ebp</span>
<span class="line">    push %ds</span>
<span class="line">    push %es</span>
<span class="line">    push %fs</span>
<span class="line">    pushl %eax # 错误码入栈</span>
<span class="line">    lea 44(%esp), %eax # 返回地址位移</span>
<span class="line">    pushl %eax # 返回地址指针入栈</span>
<span class="line">    movl $0x10, %eax # 段寄存器加载内核段选择符</span>
<span class="line">    mov %ax, %ds</span>
<span class="line">    mov %ax, %es</span>
<span class="line">    mov %ax, %fs</span>
<span class="line">    call *%ebx # 间接调用 C 函数 (参数已入栈)</span>
<span class="line">    addl $8, %esp # 丢弃入栈的 2 个 C 函数的参数</span>
<span class="line">    pop %fs # 恢复通用寄存器</span>
<span class="line">    pop %es</span>
<span class="line">    pop %ds</span>
<span class="line">    popl %ebp</span>
<span class="line">    popl %esi</span>
<span class="line">    popl %edi</span>
<span class="line">    popl %edx</span>
<span class="line">    popl %ecx</span>
<span class="line">    popl %ebx</span>
<span class="line">    popl %eax</span>
<span class="line">    iret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其余产生错误码的异常，复用了标号为 <code>error_code</code> 的汇编代码：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 10 - 无效的任务状态段 TSS</span>
<span class="line">_invalid_TSS:</span>
<span class="line">    pushl $_do_invalid_TSS</span>
<span class="line">    jmp error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 11 - 段不存在</span>
<span class="line"># 被引用的段不在内存中</span>
<span class="line">_segment_not_present:</span>
<span class="line">    pushl $_do_segment_not_present</span>
<span class="line">    jmp error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 12 - 堆栈段错误</span>
<span class="line"># 指令操作试图超出堆栈段范围，或者堆栈段不在内存中</span>
<span class="line"># INT 11 和 INT 13 的特例</span>
<span class="line">_stack_segment:</span>
<span class="line">    pushl $_do_stack_segment</span>
<span class="line">    jmp error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 13 - 一般保护性出错</span>
<span class="line"># 不属于其它任何类的错误</span>
<span class="line">_general_protection:</span>
<span class="line">    pushl $_do_general_protection</span>
<span class="line">    jmp error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 17 - 边界对齐检查出错</span>
<span class="line"># 启用内存边界检查时，特权级 3 数据非边界对齐时会产生该异常</span>
<span class="line">_alignment_check:</span>
<span class="line">    pushl $_do_alignment_check</span>
<span class="line">    jmp error_code</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其余中断在别处被设置：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line"># INT 7 - 设备不存在 _device_not_available - kernel/sys_call.s</span>
<span class="line"># INT 14 - 页错误 _page_fault - mm/page.s</span>
<span class="line"># INT 16 - 协处理器错误 _coprocessor_error - kernel/sys_call.s</span>
<span class="line"># INT 0x20 - 时钟中断 _timer_interrupt - kernel/sys_call.s</span>
<span class="line"># INT 0x80 - 系统调用 _system_call - kernel/sys_call.s</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,41)]))}const v=n(d,[["render",p],["__file","Chapter 8.2 - asm.s 程序.html.vue"]]),m=JSON.parse('{"path":"/linux-kernel-comments-notes/Chapter%208%20-%20%E5%86%85%E6%A0%B8%E4%BB%A3%E7%A0%81/Chapter%208.2%20-%20asm.s%20%E7%A8%8B%E5%BA%8F.html","title":"Chapter 8.2 - asm.s 程序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"8.2 asm.s 程序","slug":"_8-2-asm-s-程序","link":"#_8-2-asm-s-程序","children":[{"level":3,"title":"8.2.1 功能描述","slug":"_8-2-1-功能描述","link":"#_8-2-1-功能描述","children":[]},{"level":3,"title":"8.2.2 代码注释","slug":"_8-2-2-代码注释","link":"#_8-2-2-代码注释","children":[]}]}],"git":{},"filePathRelative":"linux-kernel-comments-notes/Chapter 8 - 内核代码/Chapter 8.2 - asm.s 程序.md"}');export{v as comp,m as data};
