import{_ as e,o as i,c as n,e as l}from"./app-25fa875f.js";const d={},s=l(`<h1 id="chapter-10-5-rs-io-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-10-5-rs-io-s-程序" aria-hidden="true">#</a> Chapter 10.5 - rs_io.s 程序</h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 26 19:15</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_10-5-rs-io-s-程序" tabindex="-1"><a class="header-anchor" href="#_10-5-rs-io-s-程序" aria-hidden="true">#</a> 10.5 rs_io.s 程序</h2><h3 id="_10-5-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_10-5-1-功能描述" aria-hidden="true">#</a> 10.5.1 功能描述</h3><p>实现 RS-232 串行通信的中断处理过程。主要对终端设备的读、写缓冲队列进行操作：</p><ul><li>把从串行线路上收到的字符存入串行终端的读缓冲队列</li><li>或把写缓冲队列中需要发送的字符通过串行线路发送给远端的串行终端设备</li></ul><p>引起串行中断的原因有四种：</p><ol><li>modem 状态发生变化</li><li>线路状态发生变化</li><li>接收到字符</li><li>允许发送保持寄存器已空中断，需要发送字符</li></ol><p>前两种情况，只需要读取对应的状态寄存器，即可使其复位。对于接收到字符的情况，将字符放入读缓冲队列中，并调用行规则函数处理为字符行放入辅助队列中；对于需要发送字符的情况，程序首先从写缓冲队列中取出字符发送，并判断队列是否为空：</p><ul><li>若不为空，则循环发送过程</li><li>若为空，则禁止发送保持寄存器为空产生的中断</li></ul><h3 id="_10-5-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_10-5-2-代码注释" aria-hidden="true">#</a> 10.5.2 代码注释</h3><h4 id="几个常量的定义" tabindex="-1"><a class="header-anchor" href="#几个常量的定义" aria-hidden="true">#</a> 几个常量的定义</h4><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>size = 1024 # 读写缓冲队列的长度

# 读写缓冲队列结构体 tty_queue 的偏移量
rs_addr = 0 # 串行端口号字段
head = 4 # 缓冲区头指针字段
tail = 8 # 缓冲区尾指针字段
proc_list = 12 # 等待缓冲队列的进程
buf = 16 # 缓冲区

# 写缓冲队列满后，内核会把要往队列中写字符的进程置为等待状态
# 当写缓冲队列剩余最多 256 个字符时
# 中断处理程序可以唤醒等待缓冲队列的进程
startup = 256
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="串口中断处理程序" tabindex="-1"><a class="header-anchor" href="#串口中断处理程序" aria-hidden="true">#</a> 串口中断处理程序</h4><p>两个串行端口入口点不同，但共用处理逻辑：</p><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
_rs1_interrupt:
    pushl $_table_list+8 # 串口 1 读写缓冲队列指针地址
    jmp rs_int
.align 2
_rs2_interrupt:
    pushl $_table_list+16 # 串口 2 读写缓冲队列指针地址

rs_int:
    pushl %edx
    pushl %ecx
    pushl %ebx
    pushl %eax
    push %es
    push %ds
    pushl $0x10 # ds 指向内核数据段
    pop %ds
    pushl $0x10 # es 指向内核数据段
    pop %es
    movl 24(%esp), %edx # 取中断入口压入堆栈的读写缓冲队列结构体的地址
    movl (%edx), %edx # 取 tty_queue 结构体的地址
    movl rs_addr(%edx), %edx # 取串口的端口基地址
    addl $2,%edx # 指向串口的中断标识寄存器
rep_int:
    xorl %eax, %eax
    inb %dx, %al # 取中断标识字节，判断中断来源
    testb $1,%al # 首先判断有无待处理中断
    jne end # 若无待处理中断，则跳转至退出处理处
    cmpb $6,%al # ??
    ja end # ?
    movl 24(%esp), %ecx # 缓冲队列指针地址
    pushl %edx # 临时保存中断标识寄存器端口地址
    subl $2, %edx # edx 中恢复串口基地址值
    call jmp_table(, %eax, 2) # 根据中断来源作相应处理
    popl %edx # 恢复中断标识寄存器端口地址
    jmp rep_int
end:
    movb $0x20, %al # 中断退出，向中断控制器发送结束中断指令 EOI
    outb %al, $0x20
    pop %ds
    pop %es
    popl %eax
    popl %ebx
    popl %ecx
    popl %edx
    addl $4, %esp # 丢弃中断入口入栈的队列指针地址
    iret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="中断类型处理程序表" tabindex="-1"><a class="header-anchor" href="#中断类型处理程序表" aria-hidden="true">#</a> 中断类型处理程序表</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>jmp_table:
    .long modem_status, write_char, read_char, line_status
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>对于产生中断的四种类型，作分别的处理</p><h5 id="modem-状态变化中断" tabindex="-1"><a class="header-anchor" href="#modem-状态变化中断" aria-hidden="true">#</a> modem 状态变化中断</h5><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
modem_status:
    addl $6, %edx
    inb %dx, %al # 读 modem 状态寄存器，复位
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="线路状态中断" tabindex="-1"><a class="header-anchor" href="#线路状态中断" aria-hidden="true">#</a> 线路状态中断</h5><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
line_status:
    addl $5, %edx
    inb %dx, %al # 读线路状态寄存器，复位
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="读字符中断" tabindex="-1"><a class="header-anchor" href="#读字符中断" aria-hidden="true">#</a> 读字符中断</h5><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
read_char:
    inb %dx, %al # 读取接收缓冲寄存器中的字符
    movl %ecx, %edx # 当前串口的缓冲队列指针地址
    subl $_table_list, %edx # 缓冲队列指针表首地址
    shrl $3, %edx # 串口号 1/2
    movl (%ecx), %ecx # read_queue
    movl head(%ecx), %ebx # 取读队列的缓冲区头指针
    movb %al, buf(%ecx, %ebx) # 将字符放在头指针所处位置
    incl %ebx # 头指针前移
    andl $size-1, %ebx # 头指针 % 缓冲区长度
    cmpl tail(%ecx), %ebx # 头指针与尾指针比较
    je 1f # 缓冲区满
    movl %ebx, head(%ecx) # 保存修改过的头指针 (寄存器 → 内存)
1:
    addl $63, %edx # 串口号转换为 tty 号
    pushl %edx # tty 号作为参数入栈
    call _do_tty_interrupt
    addl $4, %esp # 丢弃入栈参数
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="写字符中断" tabindex="-1"><a class="header-anchor" href="#写字符中断" aria-hidden="true">#</a> 写字符中断</h5><div class="language-assembly line-numbers-mode" data-ext="assembly"><pre class="language-assembly"><code>.align 2
write_char:
    movl 4(%ecx), %ecx # write_queue
    movl head(%ecx), %ebx # 写队列头指针
    subl tail(%ecx), %ebx # 头指针 - 尾指针 == 队列中字符数
    andl $size-1, %ebx
    je write_buffer_empty # 写队列为空的处理
    cmpl $startup, %ebx # 队列中的字符超过 256 个
    ja 1f # 不需要处理等待进程，跳转处理尾指针
    movl proc_list(%ecx), %ebx # 正在等待写队列的进程
    testl %ebx, %ebx # 等待队列是否为空
    je 1f # 等待队列为空，跳转处理尾指针
    movl $0, (%ebx) # 唤醒进程
1:
    movl tail(%ecx), %ebx # 尾指针
    movb buf(%ecx, %ebx), %al # 从尾指针处取字符
    outb %al, %dx # 将字符写到发送保持寄存器中
    incl %ebx # 尾指针前移
    andl $size-1, %ebx # 尾指针 % 缓冲区长度
    movl %ebx, tail(%ecx) # 保存已修改过的尾指针
    cmpl head(%ecx), %ebx # 尾指针和头指针比较
    je write_buffer_empty # 相等，队列已空
    ret

.align 2
write_buffer_empty:
    movl proc_list(%ecx), %ebx # 正在等待写队列的进程
    testl %ebx, %ebx # 队列指针是否为空
    je 1f
    movl $0, (%ebx) # 唤醒进程
1:
    incl %edx # 指向中断允许寄存器
    inb %dx, %al # 读取中断允许寄存器
    jmp 1f # 延时
1:
    jmp 1f # 延时
1:
    andb $0xd, %al # 禁止发送保持寄存器已空中断
    outb %al, %dx # 写入中断允许寄存器
    ret
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,30),a=[s];function v(r,c){return i(),n("div",null,a)}const u=e(d,[["render",v],["__file","Chapter 10.5 - rs_io.s 程序.html.vue"]]);export{u as default};
