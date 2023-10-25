import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="chapter-4-中断与时间管理" tabindex="-1"><a class="header-anchor" href="#chapter-4-中断与时间管理" aria-hidden="true">#</a> Chapter 4 - 中断与时间管理</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 19 21:59</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_4-1-中断相关概念" tabindex="-1"><a class="header-anchor" href="#_4-1-中断相关概念" aria-hidden="true">#</a> 4.1 中断相关概念</h2><h3 id="_4-1-1-中断" tabindex="-1"><a class="header-anchor" href="#_4-1-1-中断" aria-hidden="true">#</a> 4.1.1 中断</h3><p>中断定义为 CPU 对系统内外发生的异步时间的响应。异步事件：没有时序关系，随机发生的事件。CPU 接到请求后，中止当前工作，保存当前运行环境，转去处理响应的异步事件任务。在中断服务期间，CPU 允许中断嵌套。</p><h3 id="_4-1-2-中断延迟时间" tabindex="-1"><a class="header-anchor" href="#_4-1-2-中断延迟时间" aria-hidden="true">#</a> 4.1.2 中断延迟时间</h3><p>硬件中断发生，到 CPU 开始处理中断（保存 CPU 现场）的时间，是实时内核最重要的指标，通常由关中断的时间决定——关中断的时间越长，中断延迟就越长。</p><h3 id="_4-1-3-中断响应时间" tabindex="-1"><a class="header-anchor" href="#_4-1-3-中断响应时间" aria-hidden="true">#</a> 4.1.3 中断响应时间</h3><p>中断响应时间 = 中断延迟 + 保存 CPU 内部寄存器的时间 + 内核进入中断服务函数的时间</p><h3 id="_4-1-4-中断恢复时间" tabindex="-1"><a class="header-anchor" href="#_4-1-4-中断恢复时间" aria-hidden="true">#</a> 4.1.4 中断恢复时间</h3><p>恢复 CPU 内部寄存器 + 执行中断返回指令的时间</p><h3 id="_4-1-6-非屏蔽中断" tabindex="-1"><a class="header-anchor" href="#_4-1-6-非屏蔽中断" aria-hidden="true">#</a> 4.1.6 非屏蔽中断</h3><p>不能用系统指令关闭的中断</p><ul><li>优先级高</li><li>延迟时间短</li><li>响应快</li><li>不能被嵌套</li><li>不能忍受内核的延迟</li></ul><p>用于紧急事件处理。</p><h2 id="_4-2-μc-os-ii-的中断处理" tabindex="-1"><a class="header-anchor" href="#_4-2-μc-os-ii-的中断处理" aria-hidden="true">#</a> 4.2 μC/OS-II 的中断处理</h2><h3 id="_4-2-1-中断处理程序" tabindex="-1"><a class="header-anchor" href="#_4-2-1-中断处理程序" aria-hidden="true">#</a> 4.2.1 中断处理程序</h3><p>μC/OS-II 需要知道当前内核是否正在处理中断，所以在中断服务子程序中，要调用两个函数，通知内核进入或退出中断。这两个函数对 <strong>中断嵌套层数计数器</strong> <code>OSIntNesting</code> 进行维护。而 OS 也是通过这个计数器来判断当前内核是否处在中断或嵌套中断中。这个计数器是一个 <strong>单字节</strong> 的整型全局变量，因此嵌套层数最多为 <code>255</code></p><p>下面是 <code>OSIntEnter()</code> 函数：</p><ul><li>进入中断处理程序时被调用</li><li>对计数器 +1</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                              ENTER ISR
*
* Description: This function is used to notify uC/OS-II that you are about to service an interrupt
*              service routine (ISR).  This allows uC/OS-II to keep track of interrupt nesting and thus
*              only perform rescheduling at the last nested ISR.
*
* Arguments  : none
*
* Returns    : none
*
* Notes      : 1) This function should be called ith interrupts already disabled
*              2) Your ISR can directly increment OSIntNesting without calling this function because
*                 OSIntNesting has been declared &#39;global&#39;.
*              3) You MUST still call OSIntExit() even though you increment OSIntNesting directly.
*              4) You MUST invoke OSIntEnter() and OSIntExit() in pair.  In other words, for every call
*                 to OSIntEnter() at the beginning of the ISR you MUST have a call to OSIntExit() at the
*                 end of the ISR.
*              5) You are allowed to nest interrupts up to 255 levels deep.
*              6) I removed the OS_ENTER_CRITICAL() and OS_EXIT_CRITICAL() around the increment because
*                 OSIntEnter() is always called with interrupts disabled.
*********************************************************************************************************
*/</span>

<span class="token keyword">void</span>  <span class="token function">OSIntEnter</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&lt;</span> <span class="token number">255u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            OSIntNesting<span class="token operator">++</span><span class="token punctuation">;</span>                      <span class="token comment">/* Increment ISR nesting level                        */</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面是 <code>OSIntExit()</code> 函数：</p><ul><li>退出中断处理程序时被调用</li><li>计数器 -1</li><li>找出就绪的最高优先级任务</li><li>判断最高优先级任务是否是被中断打断的任务，如果不是，则切换 TCB 指针</li><li>调用 <strong>中断级任务切换函数</strong> <code>OSIntCtxSw()</code> 进行任务切换</li></ul><p>注意，任务切换的条件是：中断嵌套计数器和调度锁定嵌套计数器同时为 0。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                               EXIT ISR
*
* Description: This function is used to notify uC/OS-II that you have completed serviving an ISR.  When
*              the last nested ISR has completed, uC/OS-II will call the scheduler to determine whether
*              a new, high-priority task, is ready to run.
*
* Arguments  : none
*
* Returns    : none
*
* Notes      : 1) You MUST invoke OSIntEnter() and OSIntExit() in pair.  In other words, for every call
*                 to OSIntEnter() at the beginning of the ISR you MUST have a call to OSIntExit() at the
*                 end of the ISR.
*              2) Rescheduling is prevented when the scheduler is locked (see OS_SchedLock())
*********************************************************************************************************
*/</span>

<span class="token keyword">void</span>  <span class="token function">OSIntExit</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                           <span class="token comment">/* Prevent OSIntNesting from wrapping       */</span>
            OSIntNesting<span class="token operator">--</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* Reschedule only if all ISRs complete ... */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* ... and not locked.                      */</span>
                <span class="token function">OS_SchedNew</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                OSTCBHighRdy <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>OSPrioHighRdy<span class="token punctuation">]</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>OSPrioHighRdy <span class="token operator">!=</span> OSPrioCur<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* No Ctx Sw if current task is highest rdy */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_PROFILE_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
                    OSTCBHighRdy<span class="token operator">-&gt;</span>OSTCBCtxSwCtr<span class="token operator">++</span><span class="token punctuation">;</span>         <span class="token comment">/* Inc. # of context switches to this task  */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
                    OSCtxSwCtr<span class="token operator">++</span><span class="token punctuation">;</span>                          <span class="token comment">/* Keep track of the number of ctx switches */</span>
                    <span class="token function">OSIntCtxSw</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                          <span class="token comment">/* Perform interrupt level ctx switch       */</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_4-3-μc-os-ii-的时钟节拍" tabindex="-1"><a class="header-anchor" href="#_4-3-μc-os-ii-的时钟节拍" aria-hidden="true">#</a> 4.3 μC/OS-II 的时钟节拍</h2><h3 id="_4-3-1-时钟节拍" tabindex="-1"><a class="header-anchor" href="#_4-3-1-时钟节拍" aria-hidden="true">#</a> 4.3.1 时钟节拍</h3><p>时钟节拍是特定的周期性中断（时钟中断），是系统心脏的脉动。</p><h3 id="_4-3-2-时钟节拍程序" tabindex="-1"><a class="header-anchor" href="#_4-3-2-时钟节拍程序" aria-hidden="true">#</a> 4.3.2 时钟节拍程序</h3><p>时钟节拍中断服务子程序 <code>OSTickISR()</code>：每个时钟周期执行一次，必须用汇编实现。</p><p>节拍服务子函数 <code>OSTImeTick()</code> - 由上一个函数调用：</p><ul><li>给每个 TCB 的延迟项 <code>OSTCBDly</code> 减 1 直至为 0</li><li>执行时间与任务个数成正比</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                         PROCESS SYSTEM TICK
*
* Description: This function is used to signal to uC/OS-II the occurrence of a &#39;system tick&#39; (also known
*              as a &#39;clock tick&#39;).  This function should be called by the ticker ISR but, can also be
*              called by a high priority task.
*
* Arguments  : none
*
* Returns    : none
*********************************************************************************************************
*/</span>

<span class="token keyword">void</span>  <span class="token function">OSTimeTick</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TICK_STEP_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    BOOLEAN    step<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register     */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_TICK_HOOK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token function">OSTimeTickHook</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                      <span class="token comment">/* Call user definable hook                     */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_GET_SET_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                   <span class="token comment">/* Update the 32-bit tick counter               */</span>
    OSTime<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TICK_STEP_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
        <span class="token keyword">switch</span> <span class="token punctuation">(</span>OSTickStepState<span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* Determine whether we need to process a tick  */</span>
            <span class="token keyword">case</span> OS_TICK_STEP_DIS<span class="token operator">:</span>                         <span class="token comment">/* Yes, stepping is disabled                    */</span>
                 step <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">case</span> OS_TICK_STEP_WAIT<span class="token operator">:</span>                        <span class="token comment">/* No,  waiting for uC/OS-View to set ...       */</span>
                 step <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                          <span class="token comment">/*      .. OSTickStepState to OS_TICK_STEP_ONCE */</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">case</span> OS_TICK_STEP_ONCE<span class="token operator">:</span>                        <span class="token comment">/* Yes, process tick once and wait for next ... */</span>
                 step            <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                <span class="token comment">/*      ... step command from uC/OS-View        */</span>
                 OSTickStepState <span class="token operator">=</span> OS_TICK_STEP_WAIT<span class="token punctuation">;</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">default</span><span class="token operator">:</span>                                       <span class="token comment">/* Invalid case, correct situation              */</span>
                 step            <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
                 OSTickStepState <span class="token operator">=</span> OS_TICK_STEP_DIS<span class="token punctuation">;</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>step <span class="token operator">==</span> OS_FALSE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* Return if waiting for step command           */</span>
            <span class="token keyword">return</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
        ptcb <span class="token operator">=</span> OSTCBList<span class="token punctuation">;</span>                                  <span class="token comment">/* Point at first TCB in TCB list               */</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBPrio <span class="token operator">!=</span> OS_TASK_IDLE_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">/* Go through all TCBs in TCB list              */</span>
            <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* No, Delayed or waiting for event with TO     */</span>
                ptcb<span class="token operator">-&gt;</span>OSTCBDly<span class="token operator">--</span><span class="token punctuation">;</span>                          <span class="token comment">/* Decrement nbr of ticks to end of delay       */</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/* Check for timeout                            */</span>

                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;</span> OS_STAT_PEND_ANY<span class="token punctuation">)</span> <span class="token operator">!=</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        ptcb<span class="token operator">-&gt;</span>OSTCBStat  <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token operator">~</span><span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span>OS_STAT_PEND_ANY<span class="token punctuation">;</span>          <span class="token comment">/* Yes, Clear status flag   */</span>
                        ptcb<span class="token operator">-&gt;</span>OSTCBStatPend <span class="token operator">=</span> OS_STAT_PEND_TO<span class="token punctuation">;</span>                 <span class="token comment">/* Indicate PEND timeout    */</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                        ptcb<span class="token operator">-&gt;</span>OSTCBStatPend <span class="token operator">=</span> OS_STAT_PEND_OK<span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>

                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;</span> OS_STAT_SUSPEND<span class="token punctuation">)</span> <span class="token operator">==</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">/* Is task suspended?       */</span>
                        OSRdyGrp               <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>             <span class="token comment">/* No,  Make ready          */</span>
                        OSRdyTbl<span class="token punctuation">[</span>ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">]</span> <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
            ptcb <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBNext<span class="token punctuation">;</span>                        <span class="token comment">/* Point at next TCB in TCB list                */</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-3-时钟节拍器的正确用法" tabindex="-1"><a class="header-anchor" href="#_4-3-3-时钟节拍器的正确用法" aria-hidden="true">#</a> 4.3.3 时钟节拍器的正确用法</h3><p>多任务启动后再开放时钟中断，防止时钟中断在 OS 启动第一个任务前发生。</p><h2 id="_4-4-μc-os-ii-的时间管理" tabindex="-1"><a class="header-anchor" href="#_4-4-μc-os-ii-的时间管理" aria-hidden="true">#</a> 4.4 μC/OS-II 的时间管理</h2><h3 id="_4-4-1-任务延时函数-ostimedly-函数" tabindex="-1"><a class="header-anchor" href="#_4-4-1-任务延时函数-ostimedly-函数" aria-hidden="true">#</a> 4.4.1 任务延时函数 - OSTimeDly() 函数</h3><p>除了永不挂起的空闲任务外，其它任务总该在合适的时候调用系统服务函数，自我挂起。暂时放弃 CPU 使用权，使得低优先级的任务得以运行。该函数向 OS 申请延时，申请以时钟节拍为单位。当：</p><ul><li>延时时间到</li><li>其它任务调用 <code>OSTimeDlyResume()</code> 取消了延时</li></ul><p>任务才会重新进入就绪状态。当然，被不被调度取决于任务的优先级。</p><p>原理：</p><ul><li>将任务从就绪表中移出</li><li>在 TCB 中记录延时时间，由时钟中断递减该时间</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                       DELAY TASK &#39;n&#39; TICKS
*
* Description: This function is called to delay execution of the currently running task until the
*              specified number of system ticks expires.  This, of course, directly equates to delaying
*              the current task for some time to expire.  No delay will result If the specified delay is
*              0.  If the specified delay is greater than 0 then, a context switch will result.
*
* Arguments  : ticks     is the time delay that the task will be suspended in number of clock &#39;ticks&#39;.
*                        Note that by specifying 0, the task will not be delayed.
*
* Returns    : none
*********************************************************************************************************
*/</span>

<span class="token keyword">void</span>  <span class="token function">OSTimeDly</span> <span class="token punctuation">(</span>INT32U ticks<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    INT8U      y<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* See if trying to call from an ISR                  */</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* See if called with scheduler locked                */</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ticks <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* 0 means no delay!                                  */</span>
        <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        y            <span class="token operator">=</span>  OSTCBCur<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">;</span>        <span class="token comment">/* Delay current task                                 */</span>
        OSRdyTbl<span class="token punctuation">[</span>y<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>OSTCBCur<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRdyTbl<span class="token punctuation">[</span>y<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            OSRdyGrp <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>OSTCBCur<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        OSTCBCur<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">=</span> ticks<span class="token punctuation">;</span>              <span class="token comment">/* Load ticks in TCB                                  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                              <span class="token comment">/* Find next task to run!                             */</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-4-2-按时分秒毫秒延时函数-ostimedlyhmsm-函数" tabindex="-1"><a class="header-anchor" href="#_4-4-2-按时分秒毫秒延时函数-ostimedlyhmsm-函数" aria-hidden="true">#</a> 4.4.2 按时分秒毫秒延时函数 - OSTimeDlyHMSM() 函数</h3><p>按时间单位为单位进行延时，显然需要将延时参数换算成时钟节拍数量，记录在 TCB 中。所以需要利用全局常量 <code>OS_TICKS_PER_SEC</code> 将时间转换为节拍数。这个常量的含义：每秒产生多少个节拍。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                     DELAY TASK FOR SPECIFIED TIME
*
* Description: This function is called to delay execution of the currently running task until some time
*              expires.  This call allows you to specify the delay time in HOURS, MINUTES, SECONDS and
*              MILLISECONDS instead of ticks.
*
* Arguments  : hours     specifies the number of hours that the task will be delayed (max. is 255)
*              minutes   specifies the number of minutes (max. 59)
*              seconds   specifies the number of seconds (max. 59)
*              ms        specifies the number of milliseconds (max. 999)
*
* Returns    : OS_ERR_NONE
*              OS_ERR_TIME_INVALID_MINUTES
*              OS_ERR_TIME_INVALID_SECONDS
*              OS_ERR_TIME_INVALID_MS
*              OS_ERR_TIME_ZERO_DLY
*              OS_ERR_TIME_DLY_ISR
*
* Note(s)    : The resolution on the milliseconds depends on the tick rate.  For example, you can&#39;t do
*              a 10 mS delay if the ticker interrupts every 100 mS.  In this case, the delay would be
*              set to 0.  The actual delay is rounded to the nearest tick.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_DLY_HMSM_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTimeDlyHMSM</span> <span class="token punctuation">(</span>INT8U   hours<span class="token punctuation">,</span>
                      INT8U   minutes<span class="token punctuation">,</span>
                      INT8U   seconds<span class="token punctuation">,</span>
                      INT16U  ms<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    INT32U ticks<span class="token punctuation">;</span>


    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* See if trying to call from an ISR                  */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_DLY_ISR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* See if called with scheduler locked                */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_SCHED_LOCKED<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>hours <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>minutes <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>seconds <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>ms <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_ZERO_DLY<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>minutes <span class="token operator">&gt;</span> <span class="token number">59u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_INVALID_MINUTES<span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">/* Validate arguments to be within range              */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>seconds <span class="token operator">&gt;</span> <span class="token number">59u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_INVALID_SECONDS<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ms <span class="token operator">&gt;</span> <span class="token number">999u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_INVALID_MS<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
                                                 <span class="token comment">/* Compute the total number of clock ticks required.. */</span>
                                                 <span class="token comment">/* .. (rounded to the nearest tick)                   */</span>
    ticks <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>INT32U<span class="token punctuation">)</span>hours <span class="token operator">*</span> <span class="token number">3600uL</span> <span class="token operator">+</span> <span class="token punctuation">(</span>INT32U<span class="token punctuation">)</span>minutes <span class="token operator">*</span> <span class="token number">60uL</span> <span class="token operator">+</span> <span class="token punctuation">(</span>INT32U<span class="token punctuation">)</span>seconds<span class="token punctuation">)</span> <span class="token operator">*</span> OS_TICKS_PER_SEC
          <span class="token operator">+</span> OS_TICKS_PER_SEC <span class="token operator">*</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>INT32U<span class="token punctuation">)</span>ms <span class="token operator">+</span> <span class="token number">500uL</span> <span class="token operator">/</span> OS_TICKS_PER_SEC<span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token number">1000uL</span><span class="token punctuation">;</span>
    <span class="token function">OSTimeDly</span><span class="token punctuation">(</span>ticks<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-4-3-结束任务延时-ostimedlyresume-函数" tabindex="-1"><a class="header-anchor" href="#_4-4-3-结束任务延时-ostimedlyresume-函数" aria-hidden="true">#</a> 4.4.3 结束任务延时 - OSTimeDlyResume() 函数</h3><p>唤醒一个用上面两个延时函数挂起的任务，取消延时，使其进入就绪状态</p><p>原理：</p><ul><li>将 TCB 中的 <code>OSTCBDly</code> 直接清 0</li><li>将任务插入到就绪表中，如果有需要的话，需要重新调度</li><li>不使用延时挂起函数挂起的任务不能用这个函数唤醒</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                         RESUME A DELAYED TASK
*
* Description: This function is used resume a task that has been delayed through a call to either
*              OSTimeDly() or OSTimeDlyHMSM().  Note that you can call this function to resume a
*              task that is waiting for an event with timeout.  This would make the task look
*              like a timeout occurred.
*
* Arguments  : prio                      specifies the priority of the task to resume
*
* Returns    : OS_ERR_NONE               Task has been resumed
*              OS_ERR_PRIO_INVALID       if the priority you specify is higher that the maximum allowed
*                                        (i.e. &gt;= OS_LOWEST_PRIO)
*              OS_ERR_TIME_NOT_DLY       Task is not waiting for time to expire
*              OS_ERR_TASK_NOT_EXIST     The desired task has not been created or has been assigned to a Mutex.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_DLY_RESUME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTimeDlyResume</span> <span class="token punctuation">(</span>INT8U prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                                   </span><span class="token comment">/* Storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>                                 <span class="token comment">/* Make sure that task exist            */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>                        <span class="token comment">/* The task does not exist              */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>                        <span class="token comment">/* The task does not exist              */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                                <span class="token comment">/* See if task is delayed               */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TIME_NOT_DLY<span class="token punctuation">)</span><span class="token punctuation">;</span>                          <span class="token comment">/* Indicate that task was not delayed   */</span>
    <span class="token punctuation">}</span>

    ptcb<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>                                       <span class="token comment">/* Clear the time delay                 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;</span> OS_STAT_PEND_ANY<span class="token punctuation">)</span> <span class="token operator">!=</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBStat     <span class="token operator">&amp;=</span> <span class="token operator">~</span>OS_STAT_PEND_ANY<span class="token punctuation">;</span>              <span class="token comment">/* Yes, Clear status flag               */</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBStatPend  <span class="token operator">=</span>  OS_STAT_PEND_TO<span class="token punctuation">;</span>               <span class="token comment">/* Indicate PEND timeout                */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBStatPend  <span class="token operator">=</span>  OS_STAT_PEND_OK<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;</span> OS_STAT_SUSPEND<span class="token punctuation">)</span> <span class="token operator">==</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">/* Is task suspended?                   */</span>
        OSRdyGrp               <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>             <span class="token comment">/* No,  Make ready                      */</span>
        OSRdyTbl<span class="token punctuation">[</span>ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">]</span> <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                            <span class="token comment">/* See if this is new highest priority  */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                    <span class="token comment">/* Task may be suspended                */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-4-4-系统时间函数-ostimeget-和-ostimeset" tabindex="-1"><a class="header-anchor" href="#_4-4-4-系统时间函数-ostimeget-和-ostimeset" aria-hidden="true">#</a> 4.4.4 系统时间函数 - OSTimeGet() 和 OSTimeSet()</h3><p>时钟节拍每发生一次，OS 就会给一个 32-bit 计数器 <code>OSTime</code> + 1。这两个函数分别 get 或 set 这个计数器。这个全局变量是 32-bit 的，因此在 8-bit 的 CPU 上操作需要多条指令，这些指令需要一次执行完毕——因此需要在临界区中！</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                         GET CURRENT SYSTEM TIME
*
* Description: This function is used by your application to obtain the current value of the 32-bit
*              counter which keeps track of the number of clock ticks.
*
* Arguments  : none
*
* Returns    : The current value of OSTime
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_GET_SET_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT32U  <span class="token function">OSTimeGet</span> <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    INT32U     ticks<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    ticks <span class="token operator">=</span> OSTime<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>ticks<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                            SET SYSTEM CLOCK
*
* Description: This function sets the 32-bit counter which keeps track of the number of clock ticks.
*
* Arguments  : ticks      specifies the new value that OSTime needs to take.
*
* Returns    : none
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TIME_GET_SET_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
<span class="token keyword">void</span>  <span class="token function">OSTimeSet</span> <span class="token punctuation">(</span>INT32U ticks<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    OSTime <span class="token operator">=</span> ticks<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,58),i=[p];function c(o,l){return s(),a("div",null,i)}const r=n(t,[["render",c],["__file","Chapter 4 - 中断与时间管理.html.vue"]]);export{r as default};
