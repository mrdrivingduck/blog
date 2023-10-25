import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const p={},t=e(`<h1 id="chapter-8-事件标志组" tabindex="-1"><a class="header-anchor" href="#chapter-8-事件标志组" aria-hidden="true">#</a> Chapter 8 - 事件标志组</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 20 22:07</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_8-1-概述" tabindex="-1"><a class="header-anchor" href="#_8-1-概述" aria-hidden="true">#</a> 8.1 概述</h2><p>书上的描述给人整晕了，我决定在自己描述一下。与 Linux 的信号位图类似，在 μC/OS-II 中可以分配一个由多个 bit 组成的事件标志组，提供函数可以对其中的某位或某几位标志置位或复位，代表事件发生。每个任务可以等待某个事件标志组的某位或某几位标志置位或复位。</p><p>事件标志组数据结构 <code>OS_FLAG_GRP</code>：所有的事件标志记录在这个结构体中。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">os_flag_grp</span> <span class="token punctuation">{</span>                <span class="token comment">/* Event Flag Group                                        */</span>
    INT8U         OSFlagType<span class="token punctuation">;</span>               <span class="token comment">/* Should be set to OS_EVENT_TYPE_FLAG                     */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span>OSFlagWaitList<span class="token punctuation">;</span>           <span class="token comment">/* Pointer to first NODE of task waiting on event flag     */</span>
    OS_FLAGS      OSFlagFlags<span class="token punctuation">;</span>              <span class="token comment">/* 8, 16 or 32 bit flags                                   */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    INT8U        <span class="token operator">*</span>OSFlagName<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token punctuation">}</span> OS_FLAG_GRP<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中的 <code>OSFlagFlags</code> 可以是 8、16 或 32 位。<code>OSFlagWaitList</code> 指向每个任务对该标志组的等待信息形成的链表。每个任务的等待信息保存在第二个数据结构 <code>OS_FLAG_NODE</code> 中。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">os_flag_node</span> <span class="token punctuation">{</span>               <span class="token comment">/* Event Flag Wait List Node                               */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span>OSFlagNodeNext<span class="token punctuation">;</span>           <span class="token comment">/* Pointer to next     NODE in wait list                   */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span>OSFlagNodePrev<span class="token punctuation">;</span>           <span class="token comment">/* Pointer to previous NODE in wait list                   */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span>OSFlagNodeTCB<span class="token punctuation">;</span>            <span class="token comment">/* Pointer to TCB of waiting task                          */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span>OSFlagNodeFlagGrp<span class="token punctuation">;</span>        <span class="token comment">/* Pointer to Event Flag Group                             */</span>
    OS_FLAGS      OSFlagNodeFlags<span class="token punctuation">;</span>          <span class="token comment">/* Event flag to wait on                                   */</span>
    INT8U         OSFlagNodeWaitType<span class="token punctuation">;</span>       <span class="token comment">/* Type of wait:                                           */</span>
                                            <span class="token comment">/*      OS_FLAG_WAIT_AND                                   */</span>
                                            <span class="token comment">/*      OS_FLAG_WAIT_ALL                                   */</span>
                                            <span class="token comment">/*      OS_FLAG_WAIT_OR                                    */</span>
                                            <span class="token comment">/*      OS_FLAG_WAIT_ANY                                   */</span>
<span class="token punctuation">}</span> OS_FLAG_NODE<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>OSFlagNodeNext</code> 和 <code>OSFlagNodePrev</code> 维护各个任务的等待信息的双向链表</li><li><code>OSFlagNodeTCB</code> 指向等待事件标志组的 TCB</li><li><code>OSFlagNodeFlagGrp</code> 指向等待的事件标志组</li><li><code>OSFlagNodeFlags</code> 记录了该任务等待时间标志组中的哪几位</li><li><code>OSFlagNodeWaitType</code> 记录了等待方式 <ul><li><code>OS_FLAG_WAIT_CLR_ALL</code> / <code>OS_FLAG_WAIT_CLR_AND</code> - 所有指定事件标志清 0</li><li><code>OS_FLAG_WAIT_CLR_ANY</code> / <code>OS_FLAG_WAIT_CLR_OR</code> - 任意指定事件标志清 0</li><li><code>OS_FLAG_WAIT_SET_ALL</code> / <code>OS_FLAG_WAIT_SET_AND</code> - 所有指定事件标志置 1</li><li><code>OS_FLAG_WAIT_SET_ANY</code> / <code>OS_FLAG_WAIT_SET_OR</code> - 任意指定事件标志置 1</li></ul></li></ul><blockquote><p>总结一下，<code>OS_FLAG_GRP</code> 维护事件标志组本身，每个任务可以注册 <code>OS_FLAG_NODE</code>，串接到 <code>OS_FLAG_GRP</code> 上。<code>OS_FLAG_NODE</code> 随着对事件的请求，和事件的发生，而被动态创建或撤销。</p></blockquote><h2 id="_8-2-建立事件标志组-osflagcreate-函数" tabindex="-1"><a class="header-anchor" href="#_8-2-建立事件标志组-osflagcreate-函数" aria-hidden="true">#</a> 8.2 建立事件标志组 - OSFlagCreate() 函数</h2><p>从空闲事件标志组链表中取一个 <code>OS_FLAG_GRP</code> 变量，并用提供的 flag 参数进行初始化。返回指向这个 <code>OS_FLAG_GRP</code> 的指针。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                           CREATE AN EVENT FLAG
*
* Description: This function is called to create an event flag group.
*
* Arguments  : flags         Contains the initial value to store in the event flag group.
*
*              perr          is a pointer to an error code which will be returned to your application:
*                               OS_ERR_NONE               if the call was successful.
*                               OS_ERR_CREATE_ISR         if you attempted to create an Event Flag from an
*                                                         ISR.
*                               OS_ERR_FLAG_GRP_DEPLETED  if there are no more event flag groups
*
* Returns    : A pointer to an event flag group or a NULL pointer if no more groups are available.
*
* Called from: Task ONLY
*********************************************************************************************************
*/</span>

OS_FLAG_GRP  <span class="token operator">*</span><span class="token function">OSFlagCreate</span> <span class="token punctuation">(</span>OS_FLAGS  flags<span class="token punctuation">,</span>
                            INT8U    <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_FLAG_GRP <span class="token operator">*</span>pgrp<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                        </span><span class="token comment">/* Allocate storage for CPU status register        */</span></span>
    OS_CPU_SR    cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL_IEC61508</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSSafetyCriticalStartFlag <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* See if called from ISR ...                      */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_CREATE_ISR<span class="token punctuation">;</span>                  <span class="token comment">/* ... can&#39;t CREATE from an ISR                    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pgrp <span class="token operator">=</span> OSFlagFreeList<span class="token punctuation">;</span>                          <span class="token comment">/* Get next free event flag                        */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we have event flag groups available      */</span>
                                                    <span class="token comment">/* Adjust free list                                */</span>
        OSFlagFreeList       <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span>OSFlagFreeList<span class="token operator">-&gt;</span>OSFlagWaitList<span class="token punctuation">;</span>
        pgrp<span class="token operator">-&gt;</span>OSFlagType     <span class="token operator">=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">;</span>  <span class="token comment">/* Set to event flag group type                    */</span>
        pgrp<span class="token operator">-&gt;</span>OSFlagFlags    <span class="token operator">=</span> flags<span class="token punctuation">;</span>               <span class="token comment">/* Set to desired initial value                    */</span>
        pgrp<span class="token operator">-&gt;</span>OSFlagWaitList <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>           <span class="token comment">/* Clear list of tasks waiting on flags            */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
        pgrp<span class="token operator">-&gt;</span>OSFlagName     <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token operator">*</span>perr                <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token operator">*</span>perr                <span class="token operator">=</span> OS_ERR_FLAG_GRP_DEPLETED<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pgrp<span class="token punctuation">)</span><span class="token punctuation">;</span>                                  <span class="token comment">/* Return pointer to event flag group              */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-3-等待事件标志-osflagpend-函数" tabindex="-1"><a class="header-anchor" href="#_8-3-等待事件标志-osflagpend-函数" aria-hidden="true">#</a> 8.3 等待事件标志 - OSFlagPend() 函数</h2><p>等待事件标志组中的事件标志位。参数中需要给定一个 bitmap，哪位置 1 说明需要检查哪位，置 0 表示忽略。还需要给定等待事件标志的方式：</p><ul><li>全都清 0</li><li>任意清 0</li><li>全都置 1</li><li>任意置 1</li></ul><p>另外，在等待类型中，还可以在后面 <code>OS_FLAG_WAIT_SET_ANY + OS_FLAG_CONSUME</code>，使对应的事件标志在使用后被消费。如果事件标志不能被满足，则挂起调用者。挂起的过程中，需要用一个 <code>OS_FLAG_NODE</code> 记录任务需求和等待方式，链接到 <code>OS_FLAG_GRP</code> 上。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        WAIT ON AN EVENT FLAG GROUP
*
* Description: This function is called to wait for a combination of bits to be set in an event flag
*              group.  Your application can wait for ANY bit to be set or ALL bits to be set.
*
* Arguments  : pgrp          is a pointer to the desired event flag group.
*
*              flags         Is a bit pattern indicating which bit(s) (i.e. flags) you wish to wait for.
*                            The bits you want are specified by setting the corresponding bits in
*                            &#39;flags&#39;.  e.g. if your application wants to wait for bits 0 and 1 then
*                            &#39;flags&#39; would contain 0x03.
*
*              wait_type     specifies whether you want ALL bits to be set or ANY of the bits to be set.
*                            You can specify the following argument:
*
*                            OS_FLAG_WAIT_CLR_ALL   You will wait for ALL bits in &#39;mask&#39; to be clear (0)
*                            OS_FLAG_WAIT_SET_ALL   You will wait for ALL bits in &#39;mask&#39; to be set   (1)
*                            OS_FLAG_WAIT_CLR_ANY   You will wait for ANY bit  in &#39;mask&#39; to be clear (0)
*                            OS_FLAG_WAIT_SET_ANY   You will wait for ANY bit  in &#39;mask&#39; to be set   (1)
*
*                            NOTE: Add OS_FLAG_CONSUME if you want the event flag to be &#39;consumed&#39; by
*                                  the call.  Example, to wait for any flag in a group AND then clear
*                                  the flags that are present, set &#39;wait_type&#39; to:
*
*                                  OS_FLAG_WAIT_SET_ANY + OS_FLAG_CONSUME
*
*              timeout       is an optional timeout (in clock ticks) that your task will wait for the
*                            desired bit combination.  If you specify 0, however, your task will wait
*                            forever at the specified event flag group or, until a message arrives.
*
*              perr          is a pointer to an error code and can be:
*                            OS_ERR_NONE               The desired bits have been set within the specified
*                                                      &#39;timeout&#39;.
*                            OS_ERR_PEND_ISR           If you tried to PEND from an ISR
*                            OS_ERR_FLAG_INVALID_PGRP  If &#39;pgrp&#39; is a NULL pointer.
*                            OS_ERR_EVENT_TYPE         You are not pointing to an event flag group
*                            OS_ERR_TIMEOUT            The bit(s) have not been set in the specified
*                                                      &#39;timeout&#39;.
*                            OS_ERR_PEND_ABORT         The wait on the flag was aborted.
*                            OS_ERR_FLAG_WAIT_TYPE     You didn&#39;t specify a proper &#39;wait_type&#39; argument.
*
* Returns    : The flags in the event flag group that made the task ready or, 0 if a timeout or an error
*              occurred.
*
* Called from: Task ONLY
*
* Note(s)    : 1) IMPORTANT, the behavior of this function has changed from PREVIOUS versions.  The
*                 function NOW returns the flags that were ready INSTEAD of the current state of the
*                 event flags.
*********************************************************************************************************
*/</span>

OS_FLAGS  <span class="token function">OSFlagPend</span> <span class="token punctuation">(</span>OS_FLAG_GRP  <span class="token operator">*</span>pgrp<span class="token punctuation">,</span>
                      OS_FLAGS      flags<span class="token punctuation">,</span>
                      INT8U         wait_type<span class="token punctuation">,</span>
                      INT32U        timeout<span class="token punctuation">,</span>
                      INT8U        <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_FLAG_NODE  node<span class="token punctuation">;</span>
    OS_FLAGS      flags_rdy<span class="token punctuation">;</span>
    INT8U         result<span class="token punctuation">;</span>
    INT8U         pend_stat<span class="token punctuation">;</span>
    BOOLEAN       consume<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR     cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">==</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* Validate &#39;pgrp&#39;                          */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_PGRP<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* See if called from ISR ...               */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_ISR<span class="token punctuation">;</span>                           <span class="token comment">/* ... can&#39;t PEND from an ISR               */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* See if called with scheduler locked ...  */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_LOCKED<span class="token punctuation">;</span>                        <span class="token comment">/* ... can&#39;t PEND when locked               */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagType <span class="token operator">!=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Validate event block type                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    result <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>wait_type <span class="token operator">&amp;</span> OS_FLAG_CONSUME<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>result <span class="token operator">!=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* See if we need to consume the flags      */</span>
        wait_type <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token operator">~</span><span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span>OS_FLAG_CONSUME<span class="token punctuation">;</span>
        consume    <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        consume    <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token comment">/*$PAGE*/</span>\f
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>wait_type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ALL<span class="token operator">:</span>                         <span class="token comment">/* See if all required flags are set        */</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span>   <span class="token comment">/* Extract only the bits we want     */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> flags<span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Must match ALL the bits that we want     */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags_rdy<span class="token punctuation">;</span>   <span class="token comment">/* Clear ONLY the flags we wanted    */</span>
                 <span class="token punctuation">}</span>
                 OSTCBCur<span class="token operator">-&gt;</span>OSTCBFlagsRdy <span class="token operator">=</span> flags_rdy<span class="token punctuation">;</span>      <span class="token comment">/* Save flags that were ready               */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                       <span class="token comment">/* Yes, condition met, return to caller     */</span>
                 <span class="token operator">*</span>perr                   <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* Block task until events occur or timeout */</span>
                 <span class="token function">OS_FlagBlock</span><span class="token punctuation">(</span>pgrp<span class="token punctuation">,</span> <span class="token operator">&amp;</span>node<span class="token punctuation">,</span> flags<span class="token punctuation">,</span> wait_type<span class="token punctuation">,</span> timeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ANY<span class="token operator">:</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span>    <span class="token comment">/* Extract only the bits we want    */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if any flag set                      */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags_rdy<span class="token punctuation">;</span>    <span class="token comment">/* Clear ONLY the flags that we got */</span>
                 <span class="token punctuation">}</span>
                 OSTCBCur<span class="token operator">-&gt;</span>OSTCBFlagsRdy <span class="token operator">=</span> flags_rdy<span class="token punctuation">;</span>      <span class="token comment">/* Save flags that were ready               */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                       <span class="token comment">/* Yes, condition met, return to caller     */</span>
                 <span class="token operator">*</span>perr                   <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* Block task until events occur or timeout */</span>
                 <span class="token function">OS_FlagBlock</span><span class="token punctuation">(</span>pgrp<span class="token punctuation">,</span> <span class="token operator">&amp;</span>node<span class="token punctuation">,</span> flags<span class="token punctuation">,</span> wait_type<span class="token punctuation">,</span> timeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_WAIT_CLR_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
        <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ALL<span class="token operator">:</span>                         <span class="token comment">/* See if all required flags are cleared    */</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">;</span>    <span class="token comment">/* Extract only the bits we want     */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> flags<span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Must match ALL the bits that we want     */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span> flags_rdy<span class="token punctuation">;</span>       <span class="token comment">/* Set ONLY the flags that we wanted        */</span>
                 <span class="token punctuation">}</span>
                 OSTCBCur<span class="token operator">-&gt;</span>OSTCBFlagsRdy <span class="token operator">=</span> flags_rdy<span class="token punctuation">;</span>      <span class="token comment">/* Save flags that were ready               */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                       <span class="token comment">/* Yes, condition met, return to caller     */</span>
                 <span class="token operator">*</span>perr                   <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* Block task until events occur or timeout */</span>
                 <span class="token function">OS_FlagBlock</span><span class="token punctuation">(</span>pgrp<span class="token punctuation">,</span> <span class="token operator">&amp;</span>node<span class="token punctuation">,</span> flags<span class="token punctuation">,</span> wait_type<span class="token punctuation">,</span> timeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ANY<span class="token operator">:</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">;</span>   <span class="token comment">/* Extract only the bits we want      */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if any flag cleared                  */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span> flags_rdy<span class="token punctuation">;</span>       <span class="token comment">/* Set ONLY the flags that we got           */</span>
                 <span class="token punctuation">}</span>
                 OSTCBCur<span class="token operator">-&gt;</span>OSTCBFlagsRdy <span class="token operator">=</span> flags_rdy<span class="token punctuation">;</span>      <span class="token comment">/* Save flags that were ready               */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                       <span class="token comment">/* Yes, condition met, return to caller     */</span>
                 <span class="token operator">*</span>perr                   <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* Block task until events occur or timeout */</span>
                 <span class="token function">OS_FlagBlock</span><span class="token punctuation">(</span>pgrp<span class="token punctuation">,</span> <span class="token operator">&amp;</span>node<span class="token punctuation">,</span> flags<span class="token punctuation">,</span> wait_type<span class="token punctuation">,</span> timeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
             <span class="token operator">*</span>perr      <span class="token operator">=</span> OS_ERR_FLAG_WAIT_TYPE<span class="token punctuation">;</span>
             <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token comment">/*$PAGE*/</span>\f
    <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                            <span class="token comment">/* Find next HPT ready to run               */</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend <span class="token operator">!=</span> OS_STAT_PEND_OK<span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* Have we timed-out or aborted?            */</span>
        pend_stat                <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend<span class="token punctuation">;</span>
        OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend  <span class="token operator">=</span> OS_STAT_PEND_OK<span class="token punctuation">;</span>
        <span class="token function">OS_FlagUnlink</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>node<span class="token punctuation">)</span><span class="token punctuation">;</span>
        OSTCBCur<span class="token operator">-&gt;</span>OSTCBStat      <span class="token operator">=</span> OS_STAT_RDY<span class="token punctuation">;</span>            <span class="token comment">/* Yes, make task ready-to-run              */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        flags_rdy                <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">switch</span> <span class="token punctuation">(</span>pend_stat<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">case</span> OS_STAT_PEND_ABORT<span class="token operator">:</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_ABORT<span class="token punctuation">;</span>                <span class="token comment">/* Indicate that we aborted   waiting       */</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">case</span> OS_STAT_PEND_TO<span class="token operator">:</span>
            <span class="token keyword">default</span><span class="token operator">:</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_TIMEOUT<span class="token punctuation">;</span>                   <span class="token comment">/* Indicate that we timed-out waiting       */</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    flags_rdy <span class="token operator">=</span> OSTCBCur<span class="token operator">-&gt;</span>OSTCBFlagsRdy<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* See if we need to consume the flags      */</span>
        <span class="token keyword">switch</span> <span class="token punctuation">(</span>wait_type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ALL<span class="token operator">:</span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ANY<span class="token operator">:</span>                     <span class="token comment">/* Clear ONLY the flags we got              */</span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags_rdy<span class="token punctuation">;</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_WAIT_CLR_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ALL<span class="token operator">:</span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ANY<span class="token operator">:</span>                     <span class="token comment">/* Set   ONLY the flags we got              */</span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span>  flags_rdy<span class="token punctuation">;</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
            <span class="token keyword">default</span><span class="token operator">:</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_WAIT_TYPE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>                                   <span class="token comment">/* Event(s) must have occurred              */</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-4-设置事件标志-osflagpost-函数" tabindex="-1"><a class="header-anchor" href="#_8-4-设置事件标志-osflagpost-函数" aria-hidden="true">#</a> 8.4 设置事件标志 - OSFlagPost() 函数</h2><p>用于设置事件标志组中的事件标志位，对指定的标志位 <strong>置位</strong> 或 <strong>复位</strong>。</p><p>原理：</p><ul><li>对 <code>OS_FLAG_GRP</code> 中的成员变量 <code>OSFlagFlags</code> 按照参数的要求进行置位或复位</li><li>检查是否有任务正在等待事件标志组，如果有，则依次判断条件是否满足 <ul><li>如果满足，则使任务转为就绪</li><li>(将 <code>OS_FLAG_NODE</code> 从等待链表中移出？)</li></ul></li></ul><blockquote><p>令我奇怪的是，好像没看到对 <code>OS_FLAG_CONSUME</code> 的处理啊。emm...好像不必在这里处理？因为在 <code>OSFlagPend()</code> 中已经处理过了？</p></blockquote><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                         POST EVENT FLAG BIT(S)
*
* Description: This function is called to set or clear some bits in an event flag group.  The bits to
*              set or clear are specified by a &#39;bit mask&#39;.
*
* Arguments  : pgrp          is a pointer to the desired event flag group.
*
*              flags         If &#39;opt&#39; (see below) is OS_FLAG_SET, each bit that is set in &#39;flags&#39; will
*                            set the corresponding bit in the event flag group.  e.g. to set bits 0, 4
*                            and 5 you would set &#39;flags&#39; to:
*
*                                0x31     (note, bit 0 is least significant bit)
*
*                            If &#39;opt&#39; (see below) is OS_FLAG_CLR, each bit that is set in &#39;flags&#39; will
*                            CLEAR the corresponding bit in the event flag group.  e.g. to clear bits 0,
*                            4 and 5 you would specify &#39;flags&#39; as:
*
*                                0x31     (note, bit 0 is least significant bit)
*
*              opt           indicates whether the flags will be:
*                                set     (OS_FLAG_SET) or
*                                cleared (OS_FLAG_CLR)
*
*              perr          is a pointer to an error code and can be:
*                            OS_ERR_NONE                The call was successfull
*                            OS_ERR_FLAG_INVALID_PGRP   You passed a NULL pointer
*                            OS_ERR_EVENT_TYPE          You are not pointing to an event flag group
*                            OS_ERR_FLAG_INVALID_OPT    You specified an invalid option
*
* Returns    : the new value of the event flags bits that are still set.
*
* Called From: Task or ISR
*
* WARNING(s) : 1) The execution time of this function depends on the number of tasks waiting on the event
*                 flag group.
*              2) The amount of time interrupts are DISABLED depends on the number of tasks waiting on
*                 the event flag group.
*********************************************************************************************************
*/</span>
OS_FLAGS  <span class="token function">OSFlagPost</span> <span class="token punctuation">(</span>OS_FLAG_GRP  <span class="token operator">*</span>pgrp<span class="token punctuation">,</span>
                      OS_FLAGS      flags<span class="token punctuation">,</span>
                      INT8U         opt<span class="token punctuation">,</span>
                      INT8U        <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_FLAG_NODE <span class="token operator">*</span>pnode<span class="token punctuation">;</span>
    BOOLEAN       sched<span class="token punctuation">;</span>
    OS_FLAGS      flags_cur<span class="token punctuation">;</span>
    OS_FLAGS      flags_rdy<span class="token punctuation">;</span>
    BOOLEAN       rdy<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                         </span><span class="token comment">/* Allocate storage for CPU status register       */</span></span>
    OS_CPU_SR     cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">==</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                  <span class="token comment">/* Validate &#39;pgrp&#39;                                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_PGRP<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagType <span class="token operator">!=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">)</span> <span class="token punctuation">{</span>    <span class="token comment">/* Make sure we are pointing to an event flag grp */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token comment">/*$PAGE*/</span>\f
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>opt<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_FLAG_CLR<span class="token operator">:</span>
             pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags<span class="token punctuation">;</span>  <span class="token comment">/* Clear the flags specified in the group         */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_FLAG_SET<span class="token operator">:</span>
             pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span>  flags<span class="token punctuation">;</span>            <span class="token comment">/* Set   the flags specified in the group         */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                     <span class="token comment">/* INVALID option                                 */</span>
             <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_OPT<span class="token punctuation">;</span>
             <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    sched <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                                <span class="token comment">/* Indicate that we don&#39;t need rescheduling       */</span>
    pnode <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span>pgrp<span class="token operator">-&gt;</span>OSFlagWaitList<span class="token punctuation">;</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span>pnode <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* Go through all tasks waiting on event flag(s)  */</span>
        <span class="token keyword">switch</span> <span class="token punctuation">(</span>pnode<span class="token operator">-&gt;</span>OSFlagNodeWaitType<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ALL<span class="token operator">:</span>               <span class="token comment">/* See if all req. flags are set for current node */</span>
                 flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                     rdy <span class="token operator">=</span> <span class="token function">OS_FlagTaskRdy</span><span class="token punctuation">(</span>pnode<span class="token punctuation">,</span> flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* Make task RTR, event(s) Rx&#39;d          */</span>
                     <span class="token keyword">if</span> <span class="token punctuation">(</span>rdy <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                         sched <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                     <span class="token comment">/* When done we will reschedule          */</span>
                     <span class="token punctuation">}</span>
                 <span class="token punctuation">}</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ANY<span class="token operator">:</span>               <span class="token comment">/* See if any flag set                            */</span>
                 flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                     rdy <span class="token operator">=</span> <span class="token function">OS_FlagTaskRdy</span><span class="token punctuation">(</span>pnode<span class="token punctuation">,</span> flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* Make task RTR, event(s) Rx&#39;d          */</span>
                     <span class="token keyword">if</span> <span class="token punctuation">(</span>rdy <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                         sched <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                     <span class="token comment">/* When done we will reschedule          */</span>
                     <span class="token punctuation">}</span>
                 <span class="token punctuation">}</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_WAIT_CLR_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
            <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ALL<span class="token operator">:</span>               <span class="token comment">/* See if all req. flags are set for current node */</span>
                 flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">;</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                     rdy <span class="token operator">=</span> <span class="token function">OS_FlagTaskRdy</span><span class="token punctuation">(</span>pnode<span class="token punctuation">,</span> flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* Make task RTR, event(s) Rx&#39;d          */</span>
                     <span class="token keyword">if</span> <span class="token punctuation">(</span>rdy <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                         sched <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                     <span class="token comment">/* When done we will reschedule          */</span>
                     <span class="token punctuation">}</span>
                 <span class="token punctuation">}</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>

            <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ANY<span class="token operator">:</span>               <span class="token comment">/* See if any flag set                            */</span>
                 flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> pnode<span class="token operator">-&gt;</span>OSFlagNodeFlags<span class="token punctuation">;</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                     rdy <span class="token operator">=</span> <span class="token function">OS_FlagTaskRdy</span><span class="token punctuation">(</span>pnode<span class="token punctuation">,</span> flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* Make task RTR, event(s) Rx&#39;d          */</span>
                     <span class="token keyword">if</span> <span class="token punctuation">(</span>rdy <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                         sched <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                     <span class="token comment">/* When done we will reschedule          */</span>
                     <span class="token punctuation">}</span>
                 <span class="token punctuation">}</span>
                 <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
            <span class="token keyword">default</span><span class="token operator">:</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_WAIT_TYPE<span class="token punctuation">;</span>
                 <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        pnode <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span>pnode<span class="token operator">-&gt;</span>OSFlagNodeNext<span class="token punctuation">;</span> <span class="token comment">/* Point to next task waiting for event flag(s) */</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>sched <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    flags_cur <span class="token operator">=</span> pgrp<span class="token operator">-&gt;</span>OSFlagFlags<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token operator">*</span>perr     <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_cur<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-5-删除事件标志组-osflagdel-函数" tabindex="-1"><a class="header-anchor" href="#_8-5-删除事件标志组-osflagdel-函数" aria-hidden="true">#</a> 8.5 删除事件标志组 - OSFlagDel() 函数</h2><p>删除事件标志组。与之前一样，可以指明删除条件</p><p>原理：</p><ul><li>将 <code>OS_FLAG_GRP</code> 置为未使用，并归还给空闲链表</li><li>遍历所有等待标志组的任务，使所有任务就绪</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                     DELETE AN EVENT FLAG GROUP
*
* Description: This function deletes an event flag group and readies all tasks pending on the event flag
*              group.
*
* Arguments  : pgrp          is a pointer to the desired event flag group.
*
*              opt           determines delete options as follows:
*                            opt == OS_DEL_NO_PEND   Deletes the event flag group ONLY if no task pending
*                            opt == OS_DEL_ALWAYS    Deletes the event flag group even if tasks are
*                                                    waiting.  In this case, all the tasks pending will be
*                                                    readied.
*
*              perr          is a pointer to an error code that can contain one of the following values:
*                            OS_ERR_NONE               The call was successful and the event flag group was
*                                                      deleted
*                            OS_ERR_DEL_ISR            If you attempted to delete the event flag group from
*                                                      an ISR
*                            OS_ERR_FLAG_INVALID_PGRP  If &#39;pgrp&#39; is a NULL pointer.
*                            OS_ERR_EVENT_TYPE         If you didn&#39;t pass a pointer to an event flag group
*                            OS_ERR_INVALID_OPT        An invalid option was specified
*                            OS_ERR_TASK_WAITING       One or more tasks were waiting on the event flag
*                                                      group.
*
* Returns    : pgrp          upon error
*              (OS_EVENT *)0 if the event flag group was successfully deleted.
*
* Note(s)    : 1) This function must be used with care.  Tasks that would normally expect the presence of
*                 the event flag group MUST check the return code of OSFlagAccept() and OSFlagPend().
*              2) This call can potentially disable interrupts for a long time.  The interrupt disable
*                 time is directly proportional to the number of tasks waiting on the event flag group.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_DEL_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
OS_FLAG_GRP  <span class="token operator">*</span><span class="token function">OSFlagDel</span> <span class="token punctuation">(</span>OS_FLAG_GRP  <span class="token operator">*</span>pgrp<span class="token punctuation">,</span>
                         INT8U         opt<span class="token punctuation">,</span>
                         INT8U        <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    BOOLEAN       tasks_waiting<span class="token punctuation">;</span>
    OS_FLAG_NODE <span class="token operator">*</span>pnode<span class="token punctuation">;</span>
    OS_FLAG_GRP  <span class="token operator">*</span>pgrp_return<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR     cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">==</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* Validate &#39;pgrp&#39;                          */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_PGRP<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pgrp<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* See if called from ISR ...               */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_DEL_ISR<span class="token punctuation">;</span>                            <span class="token comment">/* ... can&#39;t DELETE from an ISR             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pgrp<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagType <span class="token operator">!=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Validate event group type                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pgrp<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagWaitList <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if any tasks waiting on event flags  */</span>
        tasks_waiting <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                           <span class="token comment">/* Yes                                      */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        tasks_waiting <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                          <span class="token comment">/* No                                       */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>opt<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_DEL_NO_PEND<span class="token operator">:</span>                               <span class="token comment">/* Delete group if no task waiting          */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_FALSE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagName     <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagType     <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagWaitList <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span>OSFlagFreeList<span class="token punctuation">;</span> <span class="token comment">/* Return group to free list           */</span>
                 pgrp<span class="token operator">-&gt;</span>OSFlagFlags    <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
                 OSFlagFreeList       <span class="token operator">=</span> pgrp<span class="token punctuation">;</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr                <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 pgrp_return          <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>  <span class="token comment">/* Event Flag Group has been deleted        */</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr                <span class="token operator">=</span> OS_ERR_TASK_WAITING<span class="token punctuation">;</span>
                 pgrp_return          <span class="token operator">=</span> pgrp<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_DEL_ALWAYS<span class="token operator">:</span>                                <span class="token comment">/* Always delete the event flag group       */</span>
             pnode <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span>pgrp<span class="token operator">-&gt;</span>OSFlagWaitList<span class="token punctuation">;</span>
             <span class="token keyword">while</span> <span class="token punctuation">(</span>pnode <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Ready ALL tasks waiting for flags        */</span>
                 <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_FlagTaskRdy</span><span class="token punctuation">(</span>pnode<span class="token punctuation">,</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 pnode <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_NODE <span class="token operator">*</span><span class="token punctuation">)</span>pnode<span class="token operator">-&gt;</span>OSFlagNodeNext<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
             pgrp<span class="token operator">-&gt;</span>OSFlagName     <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
             pgrp<span class="token operator">-&gt;</span>OSFlagType     <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
             pgrp<span class="token operator">-&gt;</span>OSFlagWaitList <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span>OSFlagFreeList<span class="token punctuation">;</span><span class="token comment">/* Return group to free list                */</span>
             pgrp<span class="token operator">-&gt;</span>OSFlagFlags    <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
             OSFlagFreeList       <span class="token operator">=</span> pgrp<span class="token punctuation">;</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Reschedule only if task(s) were waiting  */</span>
                 <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find highest priority task ready to run  */</span>
             <span class="token punctuation">}</span>
             <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
             pgrp_return          <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>      <span class="token comment">/* Event Flag Group has been deleted        */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token operator">*</span>perr                <span class="token operator">=</span> OS_ERR_INVALID_OPT<span class="token punctuation">;</span>
             pgrp_return          <span class="token operator">=</span> pgrp<span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pgrp_return<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-6-无等待地获得事件标志-osflagaccept-函数" tabindex="-1"><a class="header-anchor" href="#_8-6-无等待地获得事件标志-osflagaccept-函数" aria-hidden="true">#</a> 8.6 无等待地获得事件标志 - OSFlagAccept() 函数</h2><p>检查事件标志组中的标志位是置位还是复位。可以检查某一位，也可以检查所有的位：传入一个参数，检查所有置 1 的位即可。不挂起调用者，所以任务和中断都可以调用。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                              CHECK THE STATUS OF FLAGS IN AN EVENT FLAG GROUP
*
* Description: This function is called to check the status of a combination of bits to be set or cleared
*              in an event flag group.  Your application can check for ANY bit to be set/cleared or ALL
*              bits to be set/cleared.
*
*              This call does not block if the desired flags are not present.
*
* Arguments  : pgrp          is a pointer to the desired event flag group.
*
*              flags         Is a bit pattern indicating which bit(s) (i.e. flags) you wish to check.
*                            The bits you want are specified by setting the corresponding bits in
*                            &#39;flags&#39;.  e.g. if your application wants to wait for bits 0 and 1 then
*                            &#39;flags&#39; would contain 0x03.
*
*              wait_type     specifies whether you want ALL bits to be set/cleared or ANY of the bits
*                            to be set/cleared.
*                            You can specify the following argument:
*
*                            OS_FLAG_WAIT_CLR_ALL   You will check ALL bits in &#39;flags&#39; to be clear (0)
*                            OS_FLAG_WAIT_CLR_ANY   You will check ANY bit  in &#39;flags&#39; to be clear (0)
*                            OS_FLAG_WAIT_SET_ALL   You will check ALL bits in &#39;flags&#39; to be set   (1)
*                            OS_FLAG_WAIT_SET_ANY   You will check ANY bit  in &#39;flags&#39; to be set   (1)
*
*                            NOTE: Add OS_FLAG_CONSUME if you want the event flag to be &#39;consumed&#39; by
*                                  the call.  Example, to wait for any flag in a group AND then clear
*                                  the flags that are present, set &#39;wait_type&#39; to:
*
*                                  OS_FLAG_WAIT_SET_ANY + OS_FLAG_CONSUME
*
*              perr          is a pointer to an error code and can be:
*                            OS_ERR_NONE               No error
*                            OS_ERR_EVENT_TYPE         You are not pointing to an event flag group
*                            OS_ERR_FLAG_WAIT_TYPE     You didn&#39;t specify a proper &#39;wait_type&#39; argument.
*                            OS_ERR_FLAG_INVALID_PGRP  You passed a NULL pointer instead of the event flag
*                                                      group handle.
*                            OS_ERR_FLAG_NOT_RDY       The desired flags you are waiting for are not
*                                                      available.
*
* Returns    : The flags in the event flag group that made the task ready or, 0 if a timeout or an error
*              occurred.
*
* Called from: Task or ISR
*
* Note(s)    : 1) IMPORTANT, the behavior of this function has changed from PREVIOUS versions.  The
*                 function NOW returns the flags that were ready INSTEAD of the current state of the
*                 event flags.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_ACCEPT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
OS_FLAGS  <span class="token function">OSFlagAccept</span> <span class="token punctuation">(</span>OS_FLAG_GRP  <span class="token operator">*</span>pgrp<span class="token punctuation">,</span>
                        OS_FLAGS      flags<span class="token punctuation">,</span>
                        INT8U         wait_type<span class="token punctuation">,</span>
                        INT8U        <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_FLAGS      flags_rdy<span class="token punctuation">;</span>
    INT8U         result<span class="token punctuation">;</span>
    BOOLEAN       consume<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR     cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">==</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* Validate &#39;pgrp&#39;                          */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_PGRP<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagType <span class="token operator">!=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Validate event block type                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    result <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token punctuation">(</span>wait_type <span class="token operator">&amp;</span> OS_FLAG_CONSUME<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>result <span class="token operator">!=</span> <span class="token punctuation">(</span>INT8U<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                              <span class="token comment">/* See if we need to consume the flags      */</span>
        wait_type <span class="token operator">&amp;=</span> <span class="token operator">~</span>OS_FLAG_CONSUME<span class="token punctuation">;</span>
        consume    <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        consume    <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token comment">/*$PAGE*/</span>\f
    <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>                                   <span class="token comment">/* Assume NO error until proven otherwise.  */</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>wait_type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ALL<span class="token operator">:</span>                         <span class="token comment">/* See if all required flags are set        */</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span>     <span class="token comment">/* Extract only the bits we want   */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> flags<span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Must match ALL the bits that we want     */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags_rdy<span class="token punctuation">;</span>     <span class="token comment">/* Clear ONLY the flags we wanted  */</span>
                 <span class="token punctuation">}</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_NOT_RDY<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_FLAG_WAIT_SET_ANY<span class="token operator">:</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">)</span><span class="token punctuation">;</span>     <span class="token comment">/* Extract only the bits we want   */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if any flag set                      */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>flags_rdy<span class="token punctuation">;</span>     <span class="token comment">/* Clear ONLY the flags we got     */</span>
                 <span class="token punctuation">}</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_NOT_RDY<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_WAIT_CLR_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
        <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ALL<span class="token operator">:</span>                         <span class="token comment">/* See if all required flags are cleared    */</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">;</span>    <span class="token comment">/* Extract only the bits we want     */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">==</span> flags<span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Must match ALL the bits that we want     */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span> flags_rdy<span class="token punctuation">;</span>       <span class="token comment">/* Set ONLY the flags that we wanted        */</span>
                 <span class="token punctuation">}</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_NOT_RDY<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_FLAG_WAIT_CLR_ANY<span class="token operator">:</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token operator">~</span>pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">&amp;</span> flags<span class="token punctuation">;</span>   <span class="token comment">/* Extract only the bits we want      */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>flags_rdy <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if any flag cleared                  */</span>
                 <span class="token keyword">if</span> <span class="token punctuation">(</span>consume <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* See if we need to consume the flags      */</span>
                     pgrp<span class="token operator">-&gt;</span>OSFlagFlags <span class="token operator">|=</span> flags_rdy<span class="token punctuation">;</span>       <span class="token comment">/* Set ONLY the flags that we got           */</span>
                 <span class="token punctuation">}</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_NOT_RDY<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             flags_rdy <span class="token operator">=</span> <span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
             <span class="token operator">*</span>perr     <span class="token operator">=</span> OS_ERR_FLAG_WAIT_TYPE<span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>flags_rdy<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-7-查询事件标志组的状态-osflagquery-函数" tabindex="-1"><a class="header-anchor" href="#_8-7-查询事件标志组的状态-osflagquery-函数" aria-hidden="true">#</a> 8.7 查询事件标志组的状态 - OSFlagQuery() 函数</h2><p>查询事件标志组当前的状态，只返回事件标志组中的 flag。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                           QUERY EVENT FLAG
*
* Description: This function is used to check the value of the event flag group.
*
* Arguments  : pgrp         is a pointer to the desired event flag group.
*
*              perr          is a pointer to an error code returned to the called:
*                            OS_ERR_NONE                The call was successfull
*                            OS_ERR_FLAG_INVALID_PGRP   You passed a NULL pointer
*                            OS_ERR_EVENT_TYPE          You are not pointing to an event flag group
*
* Returns    : The current value of the event flag group.
*
* Called From: Task or ISR
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_FLAG_QUERY_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
OS_FLAGS  <span class="token function">OSFlagQuery</span> <span class="token punctuation">(</span>OS_FLAG_GRP  <span class="token operator">*</span>pgrp<span class="token punctuation">,</span>
                       INT8U        <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_FLAGS   flags<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                      </span><span class="token comment">/* Allocate storage for CPU status register          */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp <span class="token operator">==</span> <span class="token punctuation">(</span>OS_FLAG_GRP <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Validate &#39;pgrp&#39;                                   */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_FLAG_INVALID_PGRP<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pgrp<span class="token operator">-&gt;</span>OSFlagType <span class="token operator">!=</span> OS_EVENT_TYPE_FLAG<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Validate event block type                         */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_FLAGS<span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    flags <span class="token operator">=</span> pgrp<span class="token operator">-&gt;</span>OSFlagFlags<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>flags<span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Return the current value of the event flags       */</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>这个通信机制的实现方式和之前几个有些不一样，主要是数据结构上的变化吧，理清关系就行。</p>`,40),o=[t];function c(i,l){return s(),a("div",null,o)}const r=n(p,[["render",c],["__file","Chapter 8 - 事件标志组.html.vue"]]);export{r as default};
