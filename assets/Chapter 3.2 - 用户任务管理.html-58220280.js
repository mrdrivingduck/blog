import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="chapter-3-2-用户任务管理" tabindex="-1"><a class="header-anchor" href="#chapter-3-2-用户任务管理" aria-hidden="true">#</a> Chapter 3.2 - 用户任务管理</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 18 22:54</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_3-2-1-任务栈管理" tabindex="-1"><a class="header-anchor" href="#_3-2-1-任务栈管理" aria-hidden="true">#</a> 3.2.1 任务栈管理</h2><p>三种堆栈：</p><ul><li>CPU 硬件堆栈 (系统栈或硬件栈)：保存中断或函数调用返回的 PC 以及其它 CPU 寄存器值</li><li>可重入函数的仿真堆栈</li><li>任务堆栈 (任务栈或用户栈)</li></ul><p>任务栈可以静态或动态分配。任务栈的初始化仅为任务的第一次运行做准备，除了 PC 外，其余寄存器的值没有任何意义。</p><h2 id="_3-2-2-建立任务-ostaskcreate-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-2-建立任务-ostaskcreate-函数" aria-hidden="true">#</a> 3.2.2 建立任务 - OSTaskCreate() 函数</h2><p>将任务的 <strong>代码地址</strong> 和 <strong>参数</strong> 传递给内核：</p><ul><li>判断优先级的有效性，是否被占用</li><li>分配并初始化任务的 TCB</li><li>该函数可以在多任务启动前或启动后调用 <ul><li>如果在多任务启动后调用</li><li>还需要判断一下是否高于当前程序的优先级</li><li>如果高于当前优先级，则发生任务切换，挂起当前任务</li></ul></li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                            CREATE A TASK
*
* Description: This function is used to have uC/OS-II manage the execution of a task.  Tasks can either
*              be created prior to the start of multitasking or by a running task.  A task cannot be
*              created by an ISR.
*
* Arguments  : task     is a pointer to the task&#39;s code
*
*              p_arg    is a pointer to an optional data area which can be used to pass parameters to
*                       the task when the task first executes.  Where the task is concerned it thinks
*                       it was invoked and passed the argument &#39;p_arg&#39; as follows:
*
*                           void Task (void *p_arg)
*                           {
*                               for (;;) {
*                                   Task code;
*                               }
*                           }
*
*              ptos     is a pointer to the task&#39;s top of stack.  If the configuration constant
*                       OS_STK_GROWTH is set to 1, the stack is assumed to grow downward (i.e. from high
*                       memory to low memory).  &#39;pstk&#39; will thus point to the highest (valid) memory
*                       location of the stack.  If OS_STK_GROWTH is set to 0, &#39;pstk&#39; will point to the
*                       lowest memory location of the stack and the stack will grow with increasing
*                       memory locations.
*
*              prio     is the task&#39;s priority.  A unique priority MUST be assigned to each task and the
*                       lower the number, the higher the priority.
*
* Returns    : OS_ERR_NONE             if the function was successful.
*              OS_PRIO_EXIT            if the task priority already exist
*                                      (each task MUST have a unique priority).
*              OS_ERR_PRIO_INVALID     if the priority you specify is higher that the maximum allowed
*                                      (i.e. &gt;= OS_LOWEST_PRIO)
*              OS_ERR_TASK_CREATE_ISR  if you tried to create a task from an ISR.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_CREATE_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskCreate</span> <span class="token punctuation">(</span><span class="token keyword">void</span>   <span class="token punctuation">(</span><span class="token operator">*</span>task<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>p_arg<span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token keyword">void</span>    <span class="token operator">*</span>p_arg<span class="token punctuation">,</span>
                     OS_STK  <span class="token operator">*</span>ptos<span class="token punctuation">,</span>
                     INT8U    prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_STK    <span class="token operator">*</span>psp<span class="token punctuation">;</span>
    INT8U      err<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                 </span><span class="token comment">/* Allocate storage for CPU status register               */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL_IEC61508</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSSafetyCriticalStartFlag <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* Make sure priority is within allowable range           */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* Make sure we don&#39;t create the task from within an ISR  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_CREATE_ISR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Make sure task doesn&#39;t already exist at this priority  */</span>
        OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">=</span> OS_TCB_RESERVED<span class="token punctuation">;</span><span class="token comment">/* Reserve the priority to prevent others from doing ...  */</span>
                                             <span class="token comment">/* ... the same thing until task is created.              */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        psp <span class="token operator">=</span> <span class="token function">OSTaskStkInit</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> p_arg<span class="token punctuation">,</span> ptos<span class="token punctuation">,</span> <span class="token number">0u</span><span class="token punctuation">)</span><span class="token punctuation">;</span>             <span class="token comment">/* Initialize the task&#39;s stack         */</span>
        err <span class="token operator">=</span> <span class="token function">OS_TCBInit</span><span class="token punctuation">(</span>prio<span class="token punctuation">,</span> psp<span class="token punctuation">,</span> <span class="token punctuation">(</span>OS_STK <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0u</span><span class="token punctuation">,</span> <span class="token number">0u</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0u</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>err <span class="token operator">==</span> OS_ERR_NONE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* Find highest priority task if multitasking has started */</span>
                <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span><span class="token comment">/* Make this priority available to others                 */</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>err<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-3-建立任务-ostaskcreateext-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-3-建立任务-ostaskcreateext-函数" aria-hidden="true">#</a> 3.2.3 建立任务 - OSTaskCreateExt() 函数</h2><p>前一个函数的扩展版本，总体上逻辑类似：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                     CREATE A TASK (Extended Version)
*
* Description: This function is used to have uC/OS-II manage the execution of a task.  Tasks can either
*              be created prior to the start of multitasking or by a running task.  A task cannot be
*              created by an ISR.  This function is similar to OSTaskCreate() except that it allows
*              additional information about a task to be specified.
*
* Arguments  : task      is a pointer to the task&#39;s code
*
*              p_arg     is a pointer to an optional data area which can be used to pass parameters to
*                        the task when the task first executes.  Where the task is concerned it thinks
*                        it was invoked and passed the argument &#39;p_arg&#39; as follows:
*
*                            void Task (void *p_arg)
*                            {
*                                for (;;) {
*                                    Task code;
*                                }
*                            }
*
*              ptos      is a pointer to the task&#39;s top of stack.  If the configuration constant
*                        OS_STK_GROWTH is set to 1, the stack is assumed to grow downward (i.e. from high
*                        memory to low memory).  &#39;ptos&#39; will thus point to the highest (valid) memory
*                        location of the stack.  If OS_STK_GROWTH is set to 0, &#39;ptos&#39; will point to the
*                        lowest memory location of the stack and the stack will grow with increasing
*                        memory locations.  &#39;ptos&#39; MUST point to a valid &#39;free&#39; data item.
*
*              prio      is the task&#39;s priority.  A unique priority MUST be assigned to each task and the
*                        lower the number, the higher the priority.
*
*              id        is the task&#39;s ID (0..65535)
*
*              pbos      is a pointer to the task&#39;s bottom of stack.  If the configuration constant
*                        OS_STK_GROWTH is set to 1, the stack is assumed to grow downward (i.e. from high
*                        memory to low memory).  &#39;pbos&#39; will thus point to the LOWEST (valid) memory
*                        location of the stack.  If OS_STK_GROWTH is set to 0, &#39;pbos&#39; will point to the
*                        HIGHEST memory location of the stack and the stack will grow with increasing
*                        memory locations.  &#39;pbos&#39; MUST point to a valid &#39;free&#39; data item.
*
*              stk_size  is the size of the stack in number of elements.  If OS_STK is set to INT8U,
*                        &#39;stk_size&#39; corresponds to the number of bytes available.  If OS_STK is set to
*                        INT16U, &#39;stk_size&#39; contains the number of 16-bit entries available.  Finally, if
*                        OS_STK is set to INT32U, &#39;stk_size&#39; contains the number of 32-bit entries
*                        available on the stack.
*
*              pext      is a pointer to a user supplied memory location which is used as a TCB extension.
*                        For example, this user memory can hold the contents of floating-point registers
*                        during a context switch, the time each task takes to execute, the number of times
*                        the task has been switched-in, etc.
*
*              opt       contains additional information (or options) about the behavior of the task.  The
*                        LOWER 8-bits are reserved by uC/OS-II while the upper 8 bits can be application
*                        specific.  See OS_TASK_OPT_??? in uCOS-II.H.  Current choices are:
*
*                        OS_TASK_OPT_STK_CHK      Stack checking to be allowed for the task
*                        OS_TASK_OPT_STK_CLR      Clear the stack when the task is created
*                        OS_TASK_OPT_SAVE_FP      If the CPU has floating-point registers, save them
*                                                 during a context switch.
*
* Returns    : OS_ERR_NONE             if the function was successful.
*              OS_PRIO_EXIT            if the task priority already exist
*                                      (each task MUST have a unique priority).
*              OS_ERR_PRIO_INVALID     if the priority you specify is higher that the maximum allowed
*                                      (i.e. &gt; OS_LOWEST_PRIO)
*              OS_ERR_TASK_CREATE_ISR  if you tried to create a task from an ISR.
*********************************************************************************************************
*/</span>
<span class="token comment">/*$PAGE*/</span>\f
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_CREATE_EXT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskCreateExt</span> <span class="token punctuation">(</span><span class="token keyword">void</span>   <span class="token punctuation">(</span><span class="token operator">*</span>task<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>p_arg<span class="token punctuation">)</span><span class="token punctuation">,</span>
                        <span class="token keyword">void</span>    <span class="token operator">*</span>p_arg<span class="token punctuation">,</span>
                        OS_STK  <span class="token operator">*</span>ptos<span class="token punctuation">,</span>
                        INT8U    prio<span class="token punctuation">,</span>
                        INT16U   id<span class="token punctuation">,</span>
                        OS_STK  <span class="token operator">*</span>pbos<span class="token punctuation">,</span>
                        INT32U   stk_size<span class="token punctuation">,</span>
                        <span class="token keyword">void</span>    <span class="token operator">*</span>pext<span class="token punctuation">,</span>
                        INT16U   opt<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_STK    <span class="token operator">*</span>psp<span class="token punctuation">;</span>
    INT8U      err<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                 </span><span class="token comment">/* Allocate storage for CPU status register               */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL_IEC61508</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSSafetyCriticalStartFlag <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* Make sure priority is within allowable range           */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* Make sure we don&#39;t create the task from within an ISR  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_CREATE_ISR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Make sure task doesn&#39;t already exist at this priority  */</span>
        OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">=</span> OS_TCB_RESERVED<span class="token punctuation">;</span><span class="token comment">/* Reserve the priority to prevent others from doing ...  */</span>
                                             <span class="token comment">/* ... the same thing until task is created.              */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_TASK_STAT_STK_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
        <span class="token function">OS_TaskStkClr</span><span class="token punctuation">(</span>pbos<span class="token punctuation">,</span> stk_size<span class="token punctuation">,</span> opt<span class="token punctuation">)</span><span class="token punctuation">;</span>                    <span class="token comment">/* Clear the task stack (if needed)     */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

        psp <span class="token operator">=</span> <span class="token function">OSTaskStkInit</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> p_arg<span class="token punctuation">,</span> ptos<span class="token punctuation">,</span> opt<span class="token punctuation">)</span><span class="token punctuation">;</span>           <span class="token comment">/* Initialize the task&#39;s stack          */</span>
        err <span class="token operator">=</span> <span class="token function">OS_TCBInit</span><span class="token punctuation">(</span>prio<span class="token punctuation">,</span> psp<span class="token punctuation">,</span> pbos<span class="token punctuation">,</span> id<span class="token punctuation">,</span> stk_size<span class="token punctuation">,</span> pext<span class="token punctuation">,</span> opt<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>err <span class="token operator">==</span> OS_ERR_NONE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* Find HPT if multitasking has started */</span>
                <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                  <span class="token comment">/* Make this priority avail. to others  */</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>err<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-4-优先级变更-ostaskchangeprio-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-4-优先级变更-ostaskchangeprio-函数" aria-hidden="true">#</a> 3.2.4 优先级变更 - OSTaskChangePrio() 函数</h2><p>调该函数可以动态改变任务的优先级，调用者只能是任务。实现：</p><ul><li>根据原任务处于就绪态还是等待态，在就绪表或等待表中用新优先级替换原优先级</li><li>修改 TCB</li><li>优先级变更后，会调用调度函数，可能会发生一次任务切换</li></ul><p>新优先级必须是没有用过的。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        CHANGE PRIORITY OF A TASK
*
* Description: This function allows you to change the priority of a task dynamically.  Note that the new
*              priority MUST be available.
*
* Arguments  : oldp     is the old priority
*
*              newp     is the new priority
*
* Returns    : OS_ERR_NONE            is the call was successful
*              OS_ERR_PRIO_INVALID    if the priority you specify is higher that the maximum allowed
*                                     (i.e. &gt;= OS_LOWEST_PRIO)
*              OS_ERR_PRIO_EXIST      if the new priority already exist.
*              OS_ERR_PRIO            there is no task with the specified OLD priority (i.e. the OLD task does
*                                     not exist.
*              OS_ERR_TASK_NOT_EXIST  if the task is assigned to a Mutex PIP.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_CHANGE_PRIO_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskChangePrio</span> <span class="token punctuation">(</span>INT8U  oldprio<span class="token punctuation">,</span>
                         INT8U  newprio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_EN<span class="token punctuation">)</span></span></span>
    OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_MULTI_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    OS_EVENT <span class="token operator">*</span><span class="token operator">*</span>pevents<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
    INT8U      y_new<span class="token punctuation">;</span>
    INT8U      x_new<span class="token punctuation">;</span>
    INT8U      y_old<span class="token punctuation">;</span>
    OS_PRIO    bity_new<span class="token punctuation">;</span>
    OS_PRIO    bitx_new<span class="token punctuation">;</span>
    OS_PRIO    bity_old<span class="token punctuation">;</span>
    OS_PRIO    bitx_old<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span></span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>                                 <span class="token comment">/* Storage for CPU status register         */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>


<span class="token comment">/*$PAGE*/</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>oldprio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>oldprio <span class="token operator">!=</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>newprio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSTCBPrioTbl<span class="token punctuation">[</span>newprio<span class="token punctuation">]</span> <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* New priority must not already exist     */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>oldprio <span class="token operator">==</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* See if changing self                    */</span>
        oldprio <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBPrio<span class="token punctuation">;</span>                      <span class="token comment">/* Yes, get priority                       */</span>
    <span class="token punctuation">}</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>oldprio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* Does task to change exist?              */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                 <span class="token comment">/* No, can&#39;t change its priority!          */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* Is task assigned to Mutex               */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                 <span class="token comment">/* No, can&#39;t change its priority!          */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_LOWEST_PRIO <span class="token operator">&lt;=</span> <span class="token number">63u</span></span></span>
    y_new                 <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>newprio <span class="token operator">&gt;&gt;</span> <span class="token number">3u</span><span class="token punctuation">)</span><span class="token punctuation">;</span>         <span class="token comment">/* Yes, compute new TCB fields             */</span>
    x_new                 <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>newprio <span class="token operator">&amp;</span> <span class="token number">0x07u</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">else</span></span>
    y_new                 <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>newprio <span class="token operator">&gt;&gt;</span> <span class="token number">4u</span><span class="token punctuation">)</span> <span class="token operator">&amp;</span> <span class="token number">0x0Fu</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    x_new                 <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>newprio <span class="token operator">&amp;</span> <span class="token number">0x0Fu</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    bity_new              <span class="token operator">=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token number">1uL</span> <span class="token operator">&lt;&lt;</span> y_new<span class="token punctuation">)</span><span class="token punctuation">;</span>
    bitx_new              <span class="token operator">=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token number">1uL</span> <span class="token operator">&lt;&lt;</span> x_new<span class="token punctuation">)</span><span class="token punctuation">;</span>

    OSTCBPrioTbl<span class="token punctuation">[</span>oldprio<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                    <span class="token comment">/* Remove TCB from old priority            */</span>
    OSTCBPrioTbl<span class="token punctuation">[</span>newprio<span class="token punctuation">]</span> <span class="token operator">=</span>  ptcb<span class="token punctuation">;</span>                          <span class="token comment">/* Place pointer to TCB @ new priority     */</span>
    y_old                 <span class="token operator">=</span>  ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">;</span>
    bity_old              <span class="token operator">=</span>  ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>
    bitx_old              <span class="token operator">=</span>  ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OSRdyTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">&amp;</span>   bitx_old<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* If task is ready make it not            */</span>
         OSRdyTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bitx_old<span class="token punctuation">;</span>
         <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRdyTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
             OSRdyGrp <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bity_old<span class="token punctuation">;</span>
         <span class="token punctuation">}</span>
         OSRdyGrp        <span class="token operator">|=</span> bity_new<span class="token punctuation">;</span>                       <span class="token comment">/* Make new priority ready to run          */</span>
         OSRdyTbl<span class="token punctuation">[</span>y_new<span class="token punctuation">]</span> <span class="token operator">|=</span> bitx_new<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_EN<span class="token punctuation">)</span></span></span>
    pevent <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBEventPtr<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bitx_old<span class="token punctuation">;</span>    <span class="token comment">/* Remove old task prio from wait list     */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            pevent<span class="token operator">-&gt;</span>OSEventGrp    <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bity_old<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        pevent<span class="token operator">-&gt;</span>OSEventGrp        <span class="token operator">|=</span> bity_new<span class="token punctuation">;</span>              <span class="token comment">/* Add    new task prio to   wait list     */</span>
        pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_new<span class="token punctuation">]</span> <span class="token operator">|=</span> bitx_new<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_MULTI_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBEventMultiPtr <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        pevents <span class="token operator">=</span>  ptcb<span class="token operator">-&gt;</span>OSTCBEventMultiPtr<span class="token punctuation">;</span>
        pevent  <span class="token operator">=</span> <span class="token operator">*</span>pevents<span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>pevent <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bitx_old<span class="token punctuation">;</span>   <span class="token comment">/* Remove old task prio from wait lists */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_old<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                pevent<span class="token operator">-&gt;</span>OSEventGrp    <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>bity_old<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            pevent<span class="token operator">-&gt;</span>OSEventGrp        <span class="token operator">|=</span> bity_new<span class="token punctuation">;</span>          <span class="token comment">/* Add    new task prio to   wait lists    */</span>
            pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span>y_new<span class="token punctuation">]</span> <span class="token operator">|=</span> bitx_new<span class="token punctuation">;</span>
            pevents<span class="token operator">++</span><span class="token punctuation">;</span>
            pevent                     <span class="token operator">=</span> <span class="token operator">*</span>pevents<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    ptcb<span class="token operator">-&gt;</span>OSTCBPrio <span class="token operator">=</span> newprio<span class="token punctuation">;</span>                              <span class="token comment">/* Set new task priority                   */</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBY    <span class="token operator">=</span> y_new<span class="token punctuation">;</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBX    <span class="token operator">=</span> x_new<span class="token punctuation">;</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBBitY <span class="token operator">=</span> bity_new<span class="token punctuation">;</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBBitX <span class="token operator">=</span> bitx_new<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                         <span class="token comment">/* Find new highest priority task          */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-5-删除任务-ostaskdel-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-5-删除任务-ostaskdel-函数" aria-hidden="true">#</a> 3.2.5 删除任务 - OSTaskDel() 函数</h2><p>不删除任务代码</p><ul><li>使任务返回并处于休眠</li><li>任务的代码不再被 OS 管理，除非重新启动</li></ul><p>调用后，下一个就绪的最高优先级任务开始运行，发生一次任务切换。可以删除自己，但是在删除占用系统资源的任务时要小心。</p><p>具体实现：</p><ul><li>将该任务从内核中的所有地方移走 <ul><li>如果就绪，就从就绪表中移走</li><li>如果在等待，就从等待列表中移走</li></ul></li><li>将 TCB 设置后，从链表中删除</li><li>重新调度</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                            DELETE A TASK
*
* Description: This function allows you to delete a task.  The calling task can delete itself by
*              its own priority number.  The deleted task is returned to the dormant state and can be
*              re-activated by creating the deleted task again.
*
* Arguments  : prio    is the priority of the task to delete.  Note that you can explicitely delete
*                      the current task without knowing its priority level by setting &#39;prio&#39; to
*                      OS_PRIO_SELF.
*
* Returns    : OS_ERR_NONE             if the call is successful
*              OS_ERR_TASK_DEL_IDLE    if you attempted to delete uC/OS-II&#39;s idle task
*              OS_ERR_PRIO_INVALID     if the priority you specify is higher that the maximum allowed
*                                      (i.e. &gt;= OS_LOWEST_PRIO) or, you have not specified OS_PRIO_SELF.
*              OS_ERR_TASK_DEL         if the task is assigned to a Mutex PIP.
*              OS_ERR_TASK_NOT_EXIST   if the task you want to delete does not exist.
*              OS_ERR_TASK_DEL_ISR     if you tried to delete a task from an ISR
*
* Notes      : 1) To reduce interrupt latency, OSTaskDel() &#39;disables&#39; the task:
*                    a) by making it not ready
*                    b) by removing it from any wait lists
*                    c) by preventing OSTimeTick() from making the task ready to run.
*                 The task can then be &#39;unlinked&#39; from the miscellaneous structures in uC/OS-II.
*              2) The function OS_Dummy() is called after OS_EXIT_CRITICAL() because, on most processors,
*                 the next instruction following the enable interrupt instruction is ignored.
*              3) An ISR cannot delete a task.
*              4) The lock nesting counter is incremented because, for a brief instant, if the current
*                 task is being deleted, the current task would not be able to be rescheduled because it
*                 is removed from the ready list.  Incrementing the nesting counter prevents another task
*                 from being schedule.  This means that an ISR would return to the current task which is
*                 being deleted.  The rest of the deletion would thus be able to be completed.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_DEL_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskDel</span> <span class="token punctuation">(</span>INT8U prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_FLAG_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>OS_MAX_FLAGS <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    OS_FLAG_NODE <span class="token operator">*</span>pnode<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    OS_TCB       <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                            </span><span class="token comment">/* Allocate storage for CPU status register    */</span></span>
    OS_CPU_SR     cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* See if trying to delete from ISR            */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_DEL_ISR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_TASK_IDLE_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Not allowed to delete idle task             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_DEL_IDLE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                       <span class="token comment">/* Task priority valid ?                       */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">!=</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token comment">/*$PAGE*/</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* See if requesting to delete self            */</span>
        prio <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBPrio<span class="token punctuation">;</span>                     <span class="token comment">/* Set priority to delete to current           */</span>
    <span class="token punctuation">}</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* Task to delete must exist                   */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>                      <span class="token comment">/* Must not be assigned to Mutex               */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_DEL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    OSRdyTbl<span class="token punctuation">[</span>ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRdyTbl<span class="token punctuation">[</span>ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* Make task not ready                         */</span>
        OSRdyGrp           <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_EN<span class="token punctuation">)</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBEventPtr <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_EventTaskRemove</span><span class="token punctuation">(</span>ptcb<span class="token punctuation">,</span> ptcb<span class="token operator">-&gt;</span>OSTCBEventPtr<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* Remove this task from any event   wait list */</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_MULTI_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBEventMultiPtr <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>   <span class="token comment">/* Remove this task from any events&#39; wait lists*/</span>
        <span class="token function">OS_EventTaskRemoveMulti</span><span class="token punctuation">(</span>ptcb<span class="token punctuation">,</span> ptcb<span class="token operator">-&gt;</span>OSTCBEventMultiPtr<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_FLAG_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>OS_MAX_FLAGS <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    pnode <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBFlagNode<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pnode <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* If task is waiting on event flag            */</span>
        <span class="token function">OS_FlagUnlink</span><span class="token punctuation">(</span>pnode<span class="token punctuation">)</span><span class="token punctuation">;</span>                           <span class="token comment">/* Remove from wait list                       */</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    ptcb<span class="token operator">-&gt;</span>OSTCBDly      <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>                           <span class="token comment">/* Prevent OSTimeTick() from updating          */</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBStat     <span class="token operator">=</span> OS_STAT_RDY<span class="token punctuation">;</span>                  <span class="token comment">/* Prevent task from being resumed             */</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBStatPend <span class="token operator">=</span> OS_STAT_PEND_OK<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&lt;</span> <span class="token number">255u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* Make sure we don&#39;t context switch           */</span>
        OSLockNesting<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                 <span class="token comment">/* Enabling INT. ignores next instruc.         */</span>
    <span class="token function">OS_Dummy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                         <span class="token comment">/* ... Dummy ensures that INTs will be         */</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                <span class="token comment">/* ... disabled HERE!                          */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                           <span class="token comment">/* Remove context switch lock                  */</span>
        OSLockNesting<span class="token operator">--</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OSTaskDelHook</span><span class="token punctuation">(</span>ptcb<span class="token punctuation">)</span><span class="token punctuation">;</span>                                <span class="token comment">/* Call user defined hook                      */</span>
    OSTaskCtr<span class="token operator">--</span><span class="token punctuation">;</span>                                        <span class="token comment">/* One less task being managed                 */</span>
    OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                   <span class="token comment">/* Clear old priority entry                    */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBPrev <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Remove from TCB chain                       */</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBNext<span class="token operator">-&gt;</span>OSTCBPrev <span class="token operator">=</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
        OSTCBList                  <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBNext<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBPrev<span class="token operator">-&gt;</span>OSTCBNext <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBNext<span class="token punctuation">;</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBNext<span class="token operator">-&gt;</span>OSTCBPrev <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBPrev<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBNext     <span class="token operator">=</span> OSTCBFreeList<span class="token punctuation">;</span>                <span class="token comment">/* Return TCB to free TCB list                 */</span>
    OSTCBFreeList       <span class="token operator">=</span> ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    ptcb<span class="token operator">-&gt;</span>OSTCBTaskName <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                     <span class="token comment">/* Find new highest priority task              */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-6-请求删除任务-ostaskdelreq-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-6-请求删除任务-ostaskdelreq-函数" aria-hidden="true">#</a> 3.2.6 请求删除任务 - OSTaskDelReq() 函数</h2><p>系统资源可能因为被某个被删除任务持有而丢失。该函数可以使任务在使用完资源后，先释放，再被删除。具体实现：</p><ul><li>确保要删除的优先级有效</li><li>若任务存在，则在 TCB 中设置标志</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                    REQUEST THAT A TASK DELETE ITSELF
*
* Description: This function is used to:
*                   a) notify a task to delete itself.
*                   b) to see if a task requested that the current task delete itself.
*              This function is a little tricky to understand.  Basically, you have a task that needs
*              to be deleted however, this task has resources that it has allocated (memory buffers,
*              semaphores, mailboxes, queues etc.).  The task cannot be deleted otherwise these
*              resources would not be freed.  The requesting task calls OSTaskDelReq() to indicate that
*              the task needs to be deleted.  Deleting of the task is however, deferred to the task to
*              be deleted.  For example, suppose that task #10 needs to be deleted.  The requesting task
*              example, task #5, would call OSTaskDelReq(10).  When task #10 gets to execute, it calls
*              this function by specifying OS_PRIO_SELF and monitors the returned value.  If the return
*              value is OS_ERR_TASK_DEL_REQ, another task requested a task delete.  Task #10 would look like
*              this:
*
*                   void Task(void *p_arg)
*                   {
*                       .
*                       .
*                       while (1) {
*                           OSTimeDly(1);
*                           if (OSTaskDelReq(OS_PRIO_SELF) == OS_ERR_TASK_DEL_REQ) {
*                               Release any owned resources;
*                               De-allocate any dynamic memory;
*                               OSTaskDel(OS_PRIO_SELF);
*                           }
*                       }
*                   }
*
* Arguments  : prio    is the priority of the task to request the delete from
*
* Returns    : OS_ERR_NONE            if the task exist and the request has been registered
*              OS_ERR_TASK_NOT_EXIST  if the task has been deleted.  This allows the caller to know whether
*                                     the request has been executed.
*              OS_ERR_TASK_DEL        if the task is assigned to a Mutex.
*              OS_ERR_TASK_DEL_IDLE   if you requested to delete uC/OS-II&#39;s idle task
*              OS_ERR_PRIO_INVALID    if the priority you specify is higher that the maximum allowed
*                                     (i.e. &gt;= OS_LOWEST_PRIO) or, you have not specified OS_PRIO_SELF.
*              OS_ERR_TASK_DEL_REQ    if a task (possibly another task) requested that the running task be
*                                     deleted.
*********************************************************************************************************
*/</span>
<span class="token comment">/*$PAGE*/</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_DEL_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskDelReq</span> <span class="token punctuation">(</span>INT8U prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    INT8U      stat<span class="token punctuation">;</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_TASK_IDLE_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* Not allowed to delete idle task     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_DEL_IDLE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* Task priority valid ?               */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">!=</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>                                 <span class="token comment">/* See if a task is requesting to ...  */</span>
        <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                    <span class="token comment">/* ... this task to delete itself      */</span>
        stat <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBDelReq<span class="token punctuation">;</span>                           <span class="token comment">/* Return request status to caller     */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>stat<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                                  <span class="token comment">/* Task to delete must exist           */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>                         <span class="token comment">/* Task must already be deleted        */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* Must NOT be assigned to a Mutex     */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_DEL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBDelReq <span class="token operator">=</span> OS_ERR_TASK_DEL_REQ<span class="token punctuation">;</span>                    <span class="token comment">/* Set flag indicating task to be DEL. */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-7-堆栈检验-ostaskstkchk-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-7-堆栈检验-ostaskstkchk-函数" aria-hidden="true">#</a> 3.2.7 堆栈检验 - OSTaskStkChk() 函数</h2><p>检查任务所需任务栈的空间大小。</p><h2 id="_3-2-8-任务挂起-ostasksuspend-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-8-任务挂起-ostasksuspend-函数" aria-hidden="true">#</a> 3.2.8 任务挂起 - OSTaskSuspend() 函数</h2><p>无条件挂起一个任务：</p><ul><li>必须和任务恢复函数 <code>OSTaskResume()</code> 成对使用</li><li>任务可以挂起自己，或其它任务</li><li>本任务被挂起后，只能由其它任务恢复</li></ul><p>原理：</p><ul><li>检查任务是否就绪，如果就绪，则移出就绪表</li><li>在 TCB 中设置标志，表示任务被挂起</li><li>重新调度</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                            SUSPEND A TASK
*
* Description: This function is called to suspend a task.  The task can be the calling task if the
*              priority passed to OSTaskSuspend() is the priority of the calling task or OS_PRIO_SELF.
*
* Arguments  : prio     is the priority of the task to suspend.  If you specify OS_PRIO_SELF, the
*                       calling task will suspend itself and rescheduling will occur.
*
* Returns    : OS_ERR_NONE               if the requested task is suspended
*              OS_ERR_TASK_SUSPEND_IDLE  if you attempted to suspend the idle task which is not allowed.
*              OS_ERR_PRIO_INVALID       if the priority you specify is higher that the maximum allowed
*                                        (i.e. &gt;= OS_LOWEST_PRIO) or, you have not specified OS_PRIO_SELF.
*              OS_ERR_TASK_SUSPEND_PRIO  if the task to suspend does not exist
*              OS_ERR_TASK_NOT_EXITS     if the task is assigned to a Mutex PIP
*
* Note       : You should use this function with great care.  If you suspend a task that is waiting for
*              an event (i.e. a message, a semaphore, a queue ...) you will prevent this task from
*              running when the event arrives.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_SUSPEND_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskSuspend</span> <span class="token punctuation">(</span>INT8U prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    BOOLEAN    self<span class="token punctuation">;</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
    INT8U      y<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_TASK_IDLE_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* Not allowed to suspend idle task    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_SUSPEND_IDLE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* Task priority valid ?               */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">!=</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>                                 <span class="token comment">/* See if suspend SELF                 */</span>
        prio <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBPrio<span class="token punctuation">;</span>
        self <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBPrio<span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if suspending self              */</span>
        self <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        self <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                                        <span class="token comment">/* No suspending another task          */</span>
    <span class="token punctuation">}</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                                  <span class="token comment">/* Task to suspend must exist          */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_SUSPEND_PRIO<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* See if assigned to Mutex            */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    y            <span class="token operator">=</span> ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">;</span>
    OSRdyTbl<span class="token punctuation">[</span>y<span class="token punctuation">]</span> <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>                   <span class="token comment">/* Make task not ready                 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRdyTbl<span class="token punctuation">[</span>y<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        OSRdyGrp <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_PRIO<span class="token punctuation">)</span><span class="token operator">~</span>ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">|=</span> OS_STAT_SUSPEND<span class="token punctuation">;</span>                         <span class="token comment">/* Status of task is &#39;SUSPENDED&#39;       */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>self <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* Context switch only if SELF         */</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                             <span class="token comment">/* Find new highest priority task      */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-9-任务恢复-ostaskresume-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-9-任务恢复-ostaskresume-函数" aria-hidden="true">#</a> 3.2.9 任务恢复 - OSTaskResume() 函数</h2><p>唯一能唤醒被挂起任务的函数。原理：</p><ul><li>清除 TCB 中的挂起标志</li><li>若任务就绪，则将任务加入就绪表</li><li>重新调度</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        RESUME A SUSPENDED TASK
*
* Description: This function is called to resume a previously suspended task.  This is the only call that
*              will remove an explicit task suspension.
*
* Arguments  : prio     is the priority of the task to resume.
*
* Returns    : OS_ERR_NONE                if the requested task is resumed
*              OS_ERR_PRIO_INVALID        if the priority you specify is higher that the maximum allowed
*                                         (i.e. &gt;= OS_LOWEST_PRIO)
*              OS_ERR_TASK_RESUME_PRIO    if the task to resume does not exist
*              OS_ERR_TASK_NOT_EXIST      if the task is assigned to a Mutex PIP
*              OS_ERR_TASK_NOT_SUSPENDED  if the task to resume has not been suspended
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_SUSPEND_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskResume</span> <span class="token punctuation">(</span>INT8U prio<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                                  </span><span class="token comment">/* Storage for CPU status register       */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;=</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                             <span class="token comment">/* Make sure task priority is valid      */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                                <span class="token comment">/* Task to suspend must exist            */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_RESUME_PRIO<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>                            <span class="token comment">/* See if assigned to Mutex              */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;</span> OS_STAT_SUSPEND<span class="token punctuation">)</span> <span class="token operator">!=</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Task must be suspended                */</span>
        ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token operator">~</span><span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span>OS_STAT_SUSPEND<span class="token punctuation">;</span>    <span class="token comment">/* Remove suspension                     */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBStat <span class="token operator">==</span> OS_STAT_RDY<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if task is now ready              */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb<span class="token operator">-&gt;</span>OSTCBDly <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                OSRdyGrp               <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitY<span class="token punctuation">;</span>    <span class="token comment">/* Yes, Make task ready to run           */</span>
                OSRdyTbl<span class="token punctuation">[</span>ptcb<span class="token operator">-&gt;</span>OSTCBY<span class="token punctuation">]</span> <span class="token operator">|=</span> ptcb<span class="token operator">-&gt;</span>OSTCBBitX<span class="token punctuation">;</span>
                <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>OSRunning <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find new highest priority task        */</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                              <span class="token comment">/* Must be pending on event              */</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_SUSPENDED<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-2-10-任务信息的获取-ostaskquery-函数" tabindex="-1"><a class="header-anchor" href="#_3-2-10-任务信息的获取-ostaskquery-函数" aria-hidden="true">#</a> 3.2.10 任务信息的获取 - OSTaskQuery() 函数</h2><p>获取自身或其它任务的信息，其实是返回任务 TCB 的一个拷贝。所以任务需要分配一个 <code>OS_TCB</code> 类型的空间</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                            QUERY A TASK
*
* Description: This function is called to obtain a copy of the desired task&#39;s TCB.
*
* Arguments  : prio         is the priority of the task to obtain information from.
*
*              p_task_data  is a pointer to where the desired task&#39;s OS_TCB will be stored.
*
* Returns    : OS_ERR_NONE            if the requested task is suspended
*              OS_ERR_PRIO_INVALID    if the priority you specify is higher that the maximum allowed
*                                     (i.e. &gt; OS_LOWEST_PRIO) or, you have not specified OS_PRIO_SELF.
*              OS_ERR_PRIO            if the desired task has not been created
*              OS_ERR_TASK_NOT_EXIST  if the task is assigned to a Mutex PIP
*              OS_ERR_PDATA_NULL      if &#39;p_task_data&#39; is a NULL pointer
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_TASK_QUERY_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSTaskQuery</span> <span class="token punctuation">(</span>INT8U    prio<span class="token punctuation">,</span>
                    OS_TCB  <span class="token operator">*</span>p_task_data<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_TCB    <span class="token operator">*</span>ptcb<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">&gt;</span> OS_LOWEST_PRIO<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* Task priority valid ?                              */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">!=</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO_INVALID<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>p_task_data <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>            <span class="token comment">/* Validate &#39;p_task_data&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PDATA_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prio <span class="token operator">==</span> OS_PRIO_SELF<span class="token punctuation">)</span> <span class="token punctuation">{</span>                  <span class="token comment">/* See if suspend SELF                                */</span>
        prio <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBPrio<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    ptcb <span class="token operator">=</span> OSTCBPrioTbl<span class="token punctuation">[</span>prio<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> <span class="token punctuation">(</span>OS_TCB <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* Task to query must exist                           */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PRIO<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ptcb <span class="token operator">==</span> OS_TCB_RESERVED<span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Task to query must not be assigned to a Mutex      */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_TASK_NOT_EXIST<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
                                                 <span class="token comment">/* Copy TCB into user storage area                    */</span>
    <span class="token function">OS_MemCopy</span><span class="token punctuation">(</span><span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span>p_task_data<span class="token punctuation">,</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span>ptcb<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>OS_TCB<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>从总体上来说，μC/OS-II 的逻辑比 Linux 简单多了。主要的差别在于没有那些复杂的内存管理机制，也没有复杂的调度算法。TCB 也比 Linux 简单很多。优美源自于简单吧 🥱</p>`,49),o=[p];function i(c,l){return s(),a("div",null,o)}const r=n(t,[["render",i],["__file","Chapter 3.2 - 用户任务管理.html.vue"]]);export{r as default};
