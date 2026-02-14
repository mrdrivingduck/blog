import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function d(p,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="chapter-10-5-rs-io-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-10-5-rs-io-s-程序"><span>Chapter 10.5 - rs_io.s 程序</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 26 19:15</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_10-5-rs-io-s-程序" tabindex="-1"><a class="header-anchor" href="#_10-5-rs-io-s-程序"><span>10.5 rs_io.s 程序</span></a></h2><h3 id="_10-5-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_10-5-1-功能描述"><span>10.5.1 功能描述</span></a></h3><p>实现 RS-232 串行通信的中断处理过程。主要对终端设备的读、写缓冲队列进行操作：</p><ul><li>把从串行线路上收到的字符存入串行终端的读缓冲队列</li><li>或把写缓冲队列中需要发送的字符通过串行线路发送给远端的串行终端设备</li></ul><p>引起串行中断的原因有四种：</p><ol><li>modem 状态发生变化</li><li>线路状态发生变化</li><li>接收到字符</li><li>允许发送保持寄存器已空中断，需要发送字符</li></ol><p>前两种情况，只需要读取对应的状态寄存器，即可使其复位。对于接收到字符的情况，将字符放入读缓冲队列中，并调用行规则函数处理为字符行放入辅助队列中；对于需要发送字符的情况，程序首先从写缓冲队列中取出字符发送，并判断队列是否为空：</p><ul><li>若不为空，则循环发送过程</li><li>若为空，则禁止发送保持寄存器为空产生的中断</li></ul><h3 id="_10-5-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_10-5-2-代码注释"><span>10.5.2 代码注释</span></a></h3><h4 id="几个常量的定义" tabindex="-1"><a class="header-anchor" href="#几个常量的定义"><span>几个常量的定义</span></a></h4><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">size = 1024 # 读写缓冲队列的长度</span>
<span class="line"></span>
<span class="line"># 读写缓冲队列结构体 tty_queue 的偏移量</span>
<span class="line">rs_addr = 0 # 串行端口号字段</span>
<span class="line">head = 4 # 缓冲区头指针字段</span>
<span class="line">tail = 8 # 缓冲区尾指针字段</span>
<span class="line">proc_list = 12 # 等待缓冲队列的进程</span>
<span class="line">buf = 16 # 缓冲区</span>
<span class="line"></span>
<span class="line"># 写缓冲队列满后，内核会把要往队列中写字符的进程置为等待状态</span>
<span class="line"># 当写缓冲队列剩余最多 256 个字符时</span>
<span class="line"># 中断处理程序可以唤醒等待缓冲队列的进程</span>
<span class="line">startup = 256</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="串口中断处理程序" tabindex="-1"><a class="header-anchor" href="#串口中断处理程序"><span>串口中断处理程序</span></a></h4><p>两个串行端口入口点不同，但共用处理逻辑：</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">_rs1_interrupt:</span>
<span class="line">    pushl $_table_list+8 # 串口 1 读写缓冲队列指针地址</span>
<span class="line">    jmp rs_int</span>
<span class="line">.align 2</span>
<span class="line">_rs2_interrupt:</span>
<span class="line">    pushl $_table_list+16 # 串口 2 读写缓冲队列指针地址</span>
<span class="line"></span>
<span class="line">rs_int:</span>
<span class="line">    pushl %edx</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %ebx</span>
<span class="line">    pushl %eax</span>
<span class="line">    push %es</span>
<span class="line">    push %ds</span>
<span class="line">    pushl $0x10 # ds 指向内核数据段</span>
<span class="line">    pop %ds</span>
<span class="line">    pushl $0x10 # es 指向内核数据段</span>
<span class="line">    pop %es</span>
<span class="line">    movl 24(%esp), %edx # 取中断入口压入堆栈的读写缓冲队列结构体的地址</span>
<span class="line">    movl (%edx), %edx # 取 tty_queue 结构体的地址</span>
<span class="line">    movl rs_addr(%edx), %edx # 取串口的端口基地址</span>
<span class="line">    addl $2,%edx # 指向串口的中断标识寄存器</span>
<span class="line">rep_int:</span>
<span class="line">    xorl %eax, %eax</span>
<span class="line">    inb %dx, %al # 取中断标识字节，判断中断来源</span>
<span class="line">    testb $1,%al # 首先判断有无待处理中断</span>
<span class="line">    jne end # 若无待处理中断，则跳转至退出处理处</span>
<span class="line">    cmpb $6,%al # ??</span>
<span class="line">    ja end # ?</span>
<span class="line">    movl 24(%esp), %ecx # 缓冲队列指针地址</span>
<span class="line">    pushl %edx # 临时保存中断标识寄存器端口地址</span>
<span class="line">    subl $2, %edx # edx 中恢复串口基地址值</span>
<span class="line">    call jmp_table(, %eax, 2) # 根据中断来源作相应处理</span>
<span class="line">    popl %edx # 恢复中断标识寄存器端口地址</span>
<span class="line">    jmp rep_int</span>
<span class="line">end:</span>
<span class="line">    movb $0x20, %al # 中断退出，向中断控制器发送结束中断指令 EOI</span>
<span class="line">    outb %al, $0x20</span>
<span class="line">    pop %ds</span>
<span class="line">    pop %es</span>
<span class="line">    popl %eax</span>
<span class="line">    popl %ebx</span>
<span class="line">    popl %ecx</span>
<span class="line">    popl %edx</span>
<span class="line">    addl $4, %esp # 丢弃中断入口入栈的队列指针地址</span>
<span class="line">    iret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="中断类型处理程序表" tabindex="-1"><a class="header-anchor" href="#中断类型处理程序表"><span>中断类型处理程序表</span></a></h4><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">jmp_table:</span>
<span class="line">    .long modem_status, write_char, read_char, line_status</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>对于产生中断的四种类型，作分别的处理</p><h5 id="modem-状态变化中断" tabindex="-1"><a class="header-anchor" href="#modem-状态变化中断"><span>modem 状态变化中断</span></a></h5><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">modem_status:</span>
<span class="line">    addl $6, %edx</span>
<span class="line">    inb %dx, %al # 读 modem 状态寄存器，复位</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="线路状态中断" tabindex="-1"><a class="header-anchor" href="#线路状态中断"><span>线路状态中断</span></a></h5><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">line_status:</span>
<span class="line">    addl $5, %edx</span>
<span class="line">    inb %dx, %al # 读线路状态寄存器，复位</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="读字符中断" tabindex="-1"><a class="header-anchor" href="#读字符中断"><span>读字符中断</span></a></h5><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">read_char:</span>
<span class="line">    inb %dx, %al # 读取接收缓冲寄存器中的字符</span>
<span class="line">    movl %ecx, %edx # 当前串口的缓冲队列指针地址</span>
<span class="line">    subl $_table_list, %edx # 缓冲队列指针表首地址</span>
<span class="line">    shrl $3, %edx # 串口号 1/2</span>
<span class="line">    movl (%ecx), %ecx # read_queue</span>
<span class="line">    movl head(%ecx), %ebx # 取读队列的缓冲区头指针</span>
<span class="line">    movb %al, buf(%ecx, %ebx) # 将字符放在头指针所处位置</span>
<span class="line">    incl %ebx # 头指针前移</span>
<span class="line">    andl $size-1, %ebx # 头指针 % 缓冲区长度</span>
<span class="line">    cmpl tail(%ecx), %ebx # 头指针与尾指针比较</span>
<span class="line">    je 1f # 缓冲区满</span>
<span class="line">    movl %ebx, head(%ecx) # 保存修改过的头指针 (寄存器 → 内存)</span>
<span class="line">1:</span>
<span class="line">    addl $63, %edx # 串口号转换为 tty 号</span>
<span class="line">    pushl %edx # tty 号作为参数入栈</span>
<span class="line">    call _do_tty_interrupt</span>
<span class="line">    addl $4, %esp # 丢弃入栈参数</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="写字符中断" tabindex="-1"><a class="header-anchor" href="#写字符中断"><span>写字符中断</span></a></h5><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">.align 2</span>
<span class="line">write_char:</span>
<span class="line">    movl 4(%ecx), %ecx # write_queue</span>
<span class="line">    movl head(%ecx), %ebx # 写队列头指针</span>
<span class="line">    subl tail(%ecx), %ebx # 头指针 - 尾指针 == 队列中字符数</span>
<span class="line">    andl $size-1, %ebx</span>
<span class="line">    je write_buffer_empty # 写队列为空的处理</span>
<span class="line">    cmpl $startup, %ebx # 队列中的字符超过 256 个</span>
<span class="line">    ja 1f # 不需要处理等待进程，跳转处理尾指针</span>
<span class="line">    movl proc_list(%ecx), %ebx # 正在等待写队列的进程</span>
<span class="line">    testl %ebx, %ebx # 等待队列是否为空</span>
<span class="line">    je 1f # 等待队列为空，跳转处理尾指针</span>
<span class="line">    movl $0, (%ebx) # 唤醒进程</span>
<span class="line">1:</span>
<span class="line">    movl tail(%ecx), %ebx # 尾指针</span>
<span class="line">    movb buf(%ecx, %ebx), %al # 从尾指针处取字符</span>
<span class="line">    outb %al, %dx # 将字符写到发送保持寄存器中</span>
<span class="line">    incl %ebx # 尾指针前移</span>
<span class="line">    andl $size-1, %ebx # 尾指针 % 缓冲区长度</span>
<span class="line">    movl %ebx, tail(%ecx) # 保存已修改过的尾指针</span>
<span class="line">    cmpl head(%ecx), %ebx # 尾指针和头指针比较</span>
<span class="line">    je write_buffer_empty # 相等，队列已空</span>
<span class="line">    ret</span>
<span class="line"></span>
<span class="line">.align 2</span>
<span class="line">write_buffer_empty:</span>
<span class="line">    movl proc_list(%ecx), %ebx # 正在等待写队列的进程</span>
<span class="line">    testl %ebx, %ebx # 队列指针是否为空</span>
<span class="line">    je 1f</span>
<span class="line">    movl $0, (%ebx) # 唤醒进程</span>
<span class="line">1:</span>
<span class="line">    incl %edx # 指向中断允许寄存器</span>
<span class="line">    inb %dx, %al # 读取中断允许寄存器</span>
<span class="line">    jmp 1f # 延时</span>
<span class="line">1:</span>
<span class="line">    jmp 1f # 延时</span>
<span class="line">1:</span>
<span class="line">    andb $0xd, %al # 禁止发送保持寄存器已空中断</span>
<span class="line">    outb %al, %dx # 写入中断允许寄存器</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,30)]))}const r=n(i,[["render",d],["__file","Chapter 10.5 - rs_io.s 程序.html.vue"]]),v=JSON.parse('{"path":"/linux-kernel-comments-notes/Chapter%2010%20-%20%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F/Chapter%2010.5%20-%20rs_io.s%20%E7%A8%8B%E5%BA%8F.html","title":"Chapter 10.5 - rs_io.s 程序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"10.5 rs_io.s 程序","slug":"_10-5-rs-io-s-程序","link":"#_10-5-rs-io-s-程序","children":[{"level":3,"title":"10.5.1 功能描述","slug":"_10-5-1-功能描述","link":"#_10-5-1-功能描述","children":[]},{"level":3,"title":"10.5.2 代码注释","slug":"_10-5-2-代码注释","link":"#_10-5-2-代码注释","children":[]}]}],"git":{},"filePathRelative":"linux-kernel-comments-notes/Chapter 10 - 字符设备驱动程序/Chapter 10.5 - rs_io.s 程序.md"}');export{r as comp,v as data};
