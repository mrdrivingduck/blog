import{_ as n,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const i={};function d(p,s){return l(),a("div",null,s[0]||(s[0]=[e(`<h1 id="chapter-10-2-keyboard-s-程序" tabindex="-1"><a class="header-anchor" href="#chapter-10-2-keyboard-s-程序"><span>Chapter 10.2 - keyboard.S 程序</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 08 / 26 11:02</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="_10-2-keyboard-s-程序" tabindex="-1"><a class="header-anchor" href="#_10-2-keyboard-s-程序"><span>10.2 keyboard.S 程序</span></a></h2><h3 id="_10-2-1-功能描述" tabindex="-1"><a class="header-anchor" href="#_10-2-1-功能描述"><span>10.2.1 功能描述</span></a></h3><p>该汇编程序主要包含 <strong>键盘中断处理程序</strong>。该程序首先根据键盘上的 <strong>特殊键</strong> 的状态，设置状态标志变量 mode 的值，根据引起键盘中断的 <strong>按键扫描码</strong>，调用已编成跳转表的扫描码处理子程序。把扫描码对应的字符放入 <strong>读缓冲队列</strong> 中。接下来调用 C 函数 <code>do_tty_interrupt()</code>，在其中调用 <code>copy_to_block()</code> 行规则函数，该函数把读缓冲队列中的字符经过适当处理后，放入 <strong>辅助队列</strong> 中。如果相应终端设置了回显标志，还要把字符放入 <strong>写缓冲队列</strong> 中，并调用 tty 写函数。</p><h3 id="_10-2-2-代码注释" tabindex="-1"><a class="header-anchor" href="#_10-2-2-代码注释"><span>10.2.2 代码注释</span></a></h3><h4 id="一些常量的定义" tabindex="-1"><a class="header-anchor" href="#一些常量的定义"><span>一些常量的定义</span></a></h4><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">size = 1024 # 缓冲队列字节长度</span>
<span class="line"></span>
<span class="line"># tty_queue 结构体中各字段的偏移</span>
<span class="line">head = 4</span>
<span class="line">tail = 8</span>
<span class="line">proc_list = 12</span>
<span class="line">buf = 16</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="标志字节" tabindex="-1"><a class="header-anchor" href="#标志字节"><span>标志字节</span></a></h4><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">mode: .byte 0 # 键盘特殊键的按下状态标志 ctrl/alt/caps/shift</span>
<span class="line">leds: .byte 2 # 键盘指示灯状态标志 num-lock/caps/...</span>
<span class="line">e0: .byte 0 # 扫描前导码标志，扫描码为 0xe0/0xe1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="键盘中断处理程序" tabindex="-1"><a class="header-anchor" href="#键盘中断处理程序"><span>键盘中断处理程序</span></a></h4><p>键盘控制器收到用户的按键操作时，向中断控制器发出键盘中断请求信号 IRQ1。CPU 响应该请求后，进入键盘中断处理程序。该程序从键盘控制器端口 0x60 读入键盘扫描码，并调用对应的扫描码子程序进行处理：</p><ol><li>若当前扫描码为 0xe0 或 0xe1，就立刻对键盘控制器作出应答，并向中断控制器发送 EOI 信号</li><li>否则根据扫描码调用对应的按键处理子程序，把扫描码放入读缓冲队列中</li><li>对键盘控制器作出应答，发送 EOI 信号</li><li>调用 <code>do_tty_interrupt()</code>，将读缓冲队列的字符放到辅助队列中</li></ol><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">_keyboard_interrupt:</span>
<span class="line">    pushl %eax</span>
<span class="line">    pushl %ebx</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %edx</span>
<span class="line">    push %ds</span>
<span class="line">    push %es</span>
<span class="line">    movl $0x10, %eax # 内核数据段</span>
<span class="line">    mov %ax, %ds</span>
<span class="line">    mov %ax, %es</span>
<span class="line">    movl _blankinterval, %eax</span>
<span class="line">    movl %eax, _blankcount # 预置黑屏时间计数值为 blankinterval (滴答数)</span>
<span class="line">    xorl %eax, %eax # %eax is scan code</span>
<span class="line">    inb $0x60, %al # 读取扫描码</span>
<span class="line">    cmpb $0xe0, %al # 扫描码是 0xe0，跳转</span>
<span class="line">    je set_e0</span>
<span class="line">    cmpb $0xe1, %al # 扫描码是 0xe1，跳转</span>
<span class="line">    je set_e1</span>
<span class="line">    call key_table(, %eax, 4) # 按键处理程序 key_table + eax * 4</span>
<span class="line">    movb $0, e0 # 复位 e0 标志</span>
<span class="line"></span>
<span class="line"># 对键盘电路进行复位处理</span>
<span class="line"># 首先禁止键盘，然后立刻重新允许键盘工作</span>
<span class="line">e0_e1:</span>
<span class="line">    inb $0x61, %al # 取 PPI 端口 B 状态，其位 7 用于允许/禁止 (0/1) 键盘</span>
<span class="line">    jmp 1f # 延迟一会</span>
<span class="line">1:</span>
<span class="line">    jmp 1f</span>
<span class="line">1:</span>
<span class="line">    orb $0x80, %al # al位 7 置位 (禁止键盘工作)</span>
<span class="line">    jmp 1f</span>
<span class="line">1:</span>
<span class="line">    jmp 1f</span>
<span class="line">1:</span>
<span class="line">    outb %al, $0x61 # 使 PPI PB7 位置位。</span>
<span class="line">    jmp 1f</span>
<span class="line">1:</span>
<span class="line">    jmp 1f</span>
<span class="line">1:</span>
<span class="line">    andb $0x7F, %al # al 位 7 复位。</span>
<span class="line">    outb %al, $0x61 # 使 PPI PB7 位复位 (允许键盘工作)</span>
<span class="line">    movb $0x20, %al # 向 8259 中断芯片发送 EOI (中断结束) 信号</span>
<span class="line">    outb %al, $0x20</span>
<span class="line">    pushl $0 # 控制台 tty 号 =0 ，作为参数入栈</span>
<span class="line">    call _do_tty_interrupt # 将收到数据转换成规范模式并存放在规范字符缓冲队列中</span>
<span class="line">    addl $4, %esp # 丢弃入栈的参数，弹出保留的寄存器，并中断返回</span>
<span class="line">    pop %es</span>
<span class="line">    pop %ds</span>
<span class="line">    popl %edx</span>
<span class="line">    popl %ecx</span>
<span class="line">    popl %ebx</span>
<span class="line">    popl %eax</span>
<span class="line">    iret</span>
<span class="line">set_e0:</span>
<span class="line">    movb $1, e0 # 收到扫描前导码 0xe0 时，设置 e0 标志的位 0</span>
<span class="line">    jmp e0_e1</span>
<span class="line">set_e1:</span>
<span class="line">    movb $2, e0 # 收到扫描前导码 0xe1 时，设置 e0 标志的位 1</span>
<span class="line">    jmp e0_e1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="将字符加入缓冲队列" tabindex="-1"><a class="header-anchor" href="#将字符加入缓冲队列"><span>将字符加入缓冲队列</span></a></h4><p>操作范围是：<code>%ebx:%eax</code>，最多 8 个字符。顺序：</p><ul><li>%al</li><li>%ah</li><li>%eal</li><li>%eah</li><li>%bl</li><li>%bh</li><li>%ebl</li><li>%ebh</li></ul><p>直至 %eax 为 0。首先从 table_list 中取得控制台的读缓冲队列的地址，将 al 寄存器中的字符复制到头指针处，头指针前移。如果头指针超出缓冲区末端，就回绕到缓冲区开始处；如果缓冲区已满，就将剩余字符抛弃；如果缓冲区未满，则将 ebx 到 eax 联合右移 8B，并重复对 al 的操作过程。</p><p>所有字符处理完后，保存头指针 (寄存器 → 内存)，检查是否有进程等待读队列，如有，则唤醒。</p><div class="language-assembly line-numbers-mode" data-highlighter="prismjs" data-ext="assembly" data-title="assembly"><pre><code><span class="line">put_queue:</span>
<span class="line">    pushl %ecx</span>
<span class="line">    pushl %edx</span>
<span class="line">    movl _table_list, %edx # 取控制台 tty 结构中读缓冲队列指针</span>
<span class="line">    movl head(%edx), %ecx # 取队列头指针至 ecx</span>
<span class="line">1:</span>
<span class="line">    # 这部分用于将字符放入缓冲队列</span>
<span class="line">    # 可以被循环使用</span>
<span class="line">    movb %al, buf(%edx, %ecx) # 将 al 中的字符放入头指针位置处</span>
<span class="line">    incl %ecx # 头指针前移1字节</span>
<span class="line">    andl $size-1, %ecx # 头指针若超出缓冲区末端则绕回开始处。</span>
<span class="line">    cmpl tail(%edx), %ecx # buffer full - discard everything</span>
<span class="line">    je 3f # 队列已满，则后面未放入的字符全抛弃</span>
<span class="line">    shrdl $8, %ebx, %eax # 将 ebx 中 8 个比特右移 8 位到 eax 中，ebx不变</span>
<span class="line">    je 2f # 还有字符吗？若没有则跳转</span>
<span class="line">    shrl $8,%ebx # 将ebx值右移8位，并跳转到标号1继续操作</span>
<span class="line">    jmp 1b</span>
<span class="line">2:</span>
<span class="line">    # 这部分用于操作内存中的 tty_queue 结构体</span>
<span class="line">    # 保存头指针，设置等待进程状态</span>
<span class="line">    # 在字符全部被放入队列后被调用</span>
<span class="line">    movl %ecx, head(%edx) # 若已将所有字符都放入队列，则保存头指针</span>
<span class="line">    movl proc_list(%edx), %ecx # 该队列的等待进程指针</span>
<span class="line">    testl %ecx, %ecx # 检测是否有等待该队列的进程。</span>
<span class="line">    je 3f # 无，则跳转</span>
<span class="line">    movl $0, (%ecx) # 有，则唤醒进程 (置该进程为就绪状态)</span>
<span class="line">3:</span>
<span class="line">    # 这部分用于结束操作</span>
<span class="line">    # 或在操作过程中，队列已满后被调用</span>
<span class="line">    popl %edx</span>
<span class="line">    popl %ecx</span>
<span class="line">    ret</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="各按键或送键的处理子程序" tabindex="-1"><a class="header-anchor" href="#各按键或送键的处理子程序"><span>各按键或送键的处理子程序</span></a></h4><p>最终将各子程序的指针放置到 <code>key_table</code> 中，供上述程序调用。</p>`,25)]))}const r=n(i,[["render",d],["__file","Chapter 10.2 - keyboard.S 程序.html.vue"]]),v=JSON.parse('{"path":"/linux-kernel-comments-notes/Chapter%2010%20-%20%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F/Chapter%2010.2%20-%20keyboard.S%20%E7%A8%8B%E5%BA%8F.html","title":"Chapter 10.2 - keyboard.S 程序","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"10.2 keyboard.S 程序","slug":"_10-2-keyboard-s-程序","link":"#_10-2-keyboard-s-程序","children":[{"level":3,"title":"10.2.1 功能描述","slug":"_10-2-1-功能描述","link":"#_10-2-1-功能描述","children":[]},{"level":3,"title":"10.2.2 代码注释","slug":"_10-2-2-代码注释","link":"#_10-2-2-代码注释","children":[]}]}],"git":{},"filePathRelative":"linux-kernel-comments-notes/Chapter 10 - 字符设备驱动程序/Chapter 10.2 - keyboard.S 程序.md"}');export{r as comp,v as data};
