import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="chapter-7-1-消息邮箱管理" tabindex="-1"><a class="header-anchor" href="#chapter-7-1-消息邮箱管理" aria-hidden="true">#</a> Chapter 7.1 - 消息邮箱管理</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 20 11:01</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_7-1-1-概述" tabindex="-1"><a class="header-anchor" href="#_7-1-1-概述" aria-hidden="true">#</a> 7.1.1 概述</h2><p>邮箱是一种通信机制，使任务或中断服务向另一个任务发送一个 <strong>指针型变量</strong>，该指针指向包含消息的数据结构。使用邮箱的目的：</p><ul><li>通知一个事件的发生：邮箱初始化为 NULL</li><li>作二值信号量用：邮箱初始化为一个非 NULL 指针</li></ul><p>邮箱只能接受和发送一个消息，邮箱为满时，新消息丢失。邮箱相关的函数可以全部被剪裁。</p><h2 id="_7-1-2-建立消息邮箱-osmboxcreate-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-2-建立消息邮箱-osmboxcreate-函数" aria-hidden="true">#</a> 7.1.2 建立消息邮箱 - OSMboxCreate() 函数</h2><p>建立并初始化一个消息邮箱，可以选择带一个参数，指向消息的指针，作为邮箱中的初始消息（当然也可以初始化空邮箱）。</p><p>原理：</p><ul><li>从空闲 ECB 链表中找到一个空闲 ECB</li><li>调整 <code>OSEventFreeList</code> 指针指向下一个空闲 ECB</li><li>初始化为消息邮箱 ECB，存入邮箱消息初始值</li><li>对等待任务列表进行初始化</li><li>返回 ECB 指针</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        CREATE A MESSAGE MAILBOX
*
* Description: This function creates a message mailbox if free event control blocks are available.
*
* Arguments  : pmsg          is a pointer to a message that you wish to deposit in the mailbox.  If
*                            you set this value to the NULL pointer (i.e. (void *)0) then the mailbox
*                            will be considered empty.
*
* Returns    : != (OS_EVENT *)0  is a pointer to the event control clock (OS_EVENT) associated with the
*                                created mailbox
*              == (OS_EVENT *)0  if no event control blocks were available
*********************************************************************************************************
*/</span>

OS_EVENT  <span class="token operator">*</span><span class="token function">OSMboxCreate</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>pmsg<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL_IEC61508</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSSafetyCriticalStartFlag <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* See if called from ISR ...                         */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                  <span class="token comment">/* ... can&#39;t CREATE from an ISR                       */</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pevent <span class="token operator">=</span> OSEventFreeList<span class="token punctuation">;</span>                    <span class="token comment">/* Get next free event control block                  */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSEventFreeList <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* See if pool of free ECB pool was empty             */</span>
        OSEventFreeList <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span>OSEventFreeList<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        pevent<span class="token operator">-&gt;</span>OSEventType    <span class="token operator">=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">;</span>
        pevent<span class="token operator">-&gt;</span>OSEventCnt     <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
        pevent<span class="token operator">-&gt;</span>OSEventPtr     <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>           <span class="token comment">/* Deposit message in event control block             */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
        pevent<span class="token operator">-&gt;</span>OSEventName    <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
        <span class="token function">OS_EventWaitListInit</span><span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>                             <span class="token comment">/* Return pointer to event control block              */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="删除消息邮箱-osmboxdel-函数" tabindex="-1"><a class="header-anchor" href="#删除消息邮箱-osmboxdel-函数" aria-hidden="true">#</a> 删除消息邮箱 - OSMboxDel() 函数</h2><p>删除消息邮箱。还是有两个条件选项：</p><ul><li><code>OS_DEL_NO_PEND</code>：没有任何任务等待该邮箱的消息时，才删除邮箱</li><li><code>OS_DEL_ALWAYS</code>：不管有没有任务在等待消息，都删除邮箱</li></ul><p>如果删除失败，可以通过错误码查询原因。</p><p>原理：将 ECB 置为未使用状态，并归还给空闲链表。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                         DELETE A MAIBOX
*
* Description: This function deletes a mailbox and readies all tasks pending on the mailbox.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired
*                            mailbox.
*
*              opt           determines delete options as follows:
*                            opt == OS_DEL_NO_PEND   Delete the mailbox ONLY if no task pending
*                            opt == OS_DEL_ALWAYS    Deletes the mailbox even if tasks are waiting.
*                                                    In this case, all the tasks pending will be readied.
*
*              perr          is a pointer to an error code that can contain one of the following values:
*                            OS_ERR_NONE             The call was successful and the mailbox was deleted
*                            OS_ERR_DEL_ISR          If you attempted to delete the mailbox from an ISR
*                            OS_ERR_INVALID_OPT      An invalid option was specified
*                            OS_ERR_TASK_WAITING     One or more tasks were waiting on the mailbox
*                            OS_ERR_EVENT_TYPE       If you didn&#39;t pass a pointer to a mailbox
*                            OS_ERR_PEVENT_NULL      If &#39;pevent&#39; is a NULL pointer.
*
* Returns    : pevent        upon error
*              (OS_EVENT *)0 if the mailbox was successfully deleted.
*
* Note(s)    : 1) This function must be used with care.  Tasks that would normally expect the presence of
*                 the mailbox MUST check the return code of OSMboxPend().
*              2) OSMboxAccept() callers will not know that the intended mailbox has been deleted!
*              3) This call can potentially disable interrupts for a long time.  The interrupt disable
*                 time is directly proportional to the number of tasks waiting on the mailbox.
*              4) Because ALL tasks pending on the mailbox will be readied, you MUST be careful in
*                 applications where the mailbox is used for mutual exclusion because the resource(s)
*                 will no longer be guarded by the mailbox.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_MBOX_DEL_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
OS_EVENT  <span class="token operator">*</span><span class="token function">OSMboxDel</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                      INT8U      opt<span class="token punctuation">,</span>
                      INT8U     <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    BOOLEAN    tasks_waiting<span class="token punctuation">;</span>
    OS_EVENT  <span class="token operator">*</span>pevent_return<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* Validate &#39;pevent&#39;                        */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEVENT_NULL<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>       <span class="token comment">/* Validate event block type                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* See if called from ISR ...               */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_DEL_ISR<span class="token punctuation">;</span>                            <span class="token comment">/* ... can&#39;t DELETE from an ISR             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* See if any tasks waiting on mailbox      */</span>
        tasks_waiting <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                           <span class="token comment">/* Yes                                      */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        tasks_waiting <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                          <span class="token comment">/* No                                       */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>opt<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_DEL_NO_PEND<span class="token operator">:</span>                               <span class="token comment">/* Delete mailbox only if no task waiting   */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_FALSE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
                 pevent<span class="token operator">-&gt;</span>OSEventName <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
                 pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
                 pevent<span class="token operator">-&gt;</span>OSEventPtr  <span class="token operator">=</span> OSEventFreeList<span class="token punctuation">;</span>    <span class="token comment">/* Return Event Control Block to free list  */</span>
                 pevent<span class="token operator">-&gt;</span>OSEventCnt  <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
                 OSEventFreeList     <span class="token operator">=</span> pevent<span class="token punctuation">;</span>             <span class="token comment">/* Get next free event control block        */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr               <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 pevent_return       <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>      <span class="token comment">/* Mailbox has been deleted                 */</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr               <span class="token operator">=</span> OS_ERR_TASK_WAITING<span class="token punctuation">;</span>
                 pevent_return       <span class="token operator">=</span> pevent<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_DEL_ALWAYS<span class="token operator">:</span>                                <span class="token comment">/* Always delete the mailbox                */</span>
             <span class="token keyword">while</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>            <span class="token comment">/* Ready ALL tasks waiting for mailbox      */</span>
                 <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">,</span> OS_STAT_MBOX<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
             pevent<span class="token operator">-&gt;</span>OSEventName    <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
             pevent<span class="token operator">-&gt;</span>OSEventType    <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
             pevent<span class="token operator">-&gt;</span>OSEventPtr     <span class="token operator">=</span> OSEventFreeList<span class="token punctuation">;</span>     <span class="token comment">/* Return Event Control Block to free list  */</span>
             pevent<span class="token operator">-&gt;</span>OSEventCnt     <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
             OSEventFreeList        <span class="token operator">=</span> pevent<span class="token punctuation">;</span>              <span class="token comment">/* Get next free event control block        */</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Reschedule only if task(s) were waiting  */</span>
                 <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find highest priority task ready to run  */</span>
             <span class="token punctuation">}</span>
             <span class="token operator">*</span>perr         <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
             pevent_return <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                <span class="token comment">/* Mailbox has been deleted                 */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token operator">*</span>perr         <span class="token operator">=</span> OS_ERR_INVALID_OPT<span class="token punctuation">;</span>
             pevent_return <span class="token operator">=</span> pevent<span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent_return<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-1-4-等待邮箱中的信息-osmboxpend-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-4-等待邮箱中的信息-osmboxpend-函数" aria-hidden="true">#</a> 7.1.4 等待邮箱中的信息 - OSMboxPend() 函数</h2><p>用于等待邮箱中的信息：</p><ul><li>如果邮箱中已有信息，那么将消息返回调用者，并清除消息</li><li>如果邮箱中没有信息，则挂起当前任务，直到有信息来或超时</li><li>如果多个任务等待同一个消息，则交给优先级最高的任务并转为就绪</li><li>由 <code>OSTaskSuspend()</code> 函数挂起的任务也可以接受消息，但维持挂起状态不变</li></ul><p>原理：从 ECB 中读取 <code>OSEventPtr</code></p><ul><li>若不为空，则直接返回消息指针</li><li>若为空，则任务挂起等待消息</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                      PEND ON MAILBOX FOR A MESSAGE
*
* Description: This function waits for a message to be sent to a mailbox
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired mailbox
*
*              timeout       is an optional timeout period (in clock ticks).  If non-zero, your task will
*                            wait for a message to arrive at the mailbox up to the amount of time
*                            specified by this argument.  If you specify 0, however, your task will wait
*                            forever at the specified mailbox or, until a message arrives.
*
*              perr          is a pointer to where an error message will be deposited.  Possible error
*                            messages are:
*
*                            OS_ERR_NONE         The call was successful and your task received a
*                                                message.
*                            OS_ERR_TIMEOUT      A message was not received within the specified &#39;timeout&#39;.
*                            OS_ERR_PEND_ABORT   The wait on the mailbox was aborted.
*                            OS_ERR_EVENT_TYPE   Invalid event type
*                            OS_ERR_PEND_ISR     If you called this function from an ISR and the result
*                                                would lead to a suspension.
*                            OS_ERR_PEVENT_NULL  If &#39;pevent&#39; is a NULL pointer
*                            OS_ERR_PEND_LOCKED  If you called this function when the scheduler is locked
*
* Returns    : != (void *)0  is a pointer to the message received
*              == (void *)0  if no message was received or,
*                            if &#39;pevent&#39; is a NULL pointer or,
*                            if you didn&#39;t pass the proper pointer to the event control block.
*********************************************************************************************************
*/</span>
<span class="token comment">/*$PAGE*/</span>\f
<span class="token keyword">void</span>  <span class="token operator">*</span><span class="token function">OSMboxPend</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                   INT32U     timeout<span class="token punctuation">,</span>
                   INT8U     <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEVENT_NULL<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">/* Validate event block type                     */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* See if called from ISR ...                    */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_ISR<span class="token punctuation">;</span>                      <span class="token comment">/* ... can&#39;t PEND from an ISR                    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* See if called with scheduler locked ...       */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_LOCKED<span class="token punctuation">;</span>                   <span class="token comment">/* ... can&#39;t PEND when locked                    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pmsg <span class="token operator">=</span> pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pmsg <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* See if there is already a message             */</span>
        pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>               <span class="token comment">/* Clear the mailbox                             */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pmsg<span class="token punctuation">)</span><span class="token punctuation">;</span>                                <span class="token comment">/* Return the message received (or NULL)         */</span>
    <span class="token punctuation">}</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStat     <span class="token operator">|=</span> OS_STAT_MBOX<span class="token punctuation">;</span>          <span class="token comment">/* Message not available, task will pend         */</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend  <span class="token operator">=</span> OS_STAT_PEND_OK<span class="token punctuation">;</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBDly       <span class="token operator">=</span> timeout<span class="token punctuation">;</span>               <span class="token comment">/* Load timeout in TCB                           */</span>
    <span class="token function">OS_EventTaskWait</span><span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>                         <span class="token comment">/* Suspend task until event or timeout occurs    */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                       <span class="token comment">/* Find next highest priority task ready to run  */</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend<span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/* See if we timed-out or aborted                */</span>
        <span class="token keyword">case</span> OS_STAT_PEND_OK<span class="token operator">:</span>
             pmsg <span class="token operator">=</span>  OSTCBCur<span class="token operator">-&gt;</span>OSTCBMsg<span class="token punctuation">;</span>
            <span class="token operator">*</span>perr <span class="token operator">=</span>  OS_ERR_NONE<span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_STAT_PEND_ABORT<span class="token operator">:</span>
             pmsg <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
            <span class="token operator">*</span>perr <span class="token operator">=</span>  OS_ERR_PEND_ABORT<span class="token punctuation">;</span>               <span class="token comment">/* Indicate that we aborted                      */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_STAT_PEND_TO<span class="token operator">:</span>
        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EventTaskRemove</span><span class="token punctuation">(</span>OSTCBCur<span class="token punctuation">,</span> pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
             pmsg <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
            <span class="token operator">*</span>perr <span class="token operator">=</span>  OS_ERR_TIMEOUT<span class="token punctuation">;</span>                  <span class="token comment">/* Indicate that we didn&#39;t get event within TO   */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStat          <span class="token operator">=</span>  OS_STAT_RDY<span class="token punctuation">;</span>      <span class="token comment">/* Set   task  status to ready                   */</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend      <span class="token operator">=</span>  OS_STAT_PEND_OK<span class="token punctuation">;</span>  <span class="token comment">/* Clear pend  status                            */</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBEventPtr      <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>    <span class="token comment">/* Clear event pointers                          */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token punctuation">(</span>OS_EVENT_MULTI_EN <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span></span></span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBEventMultiPtr <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBMsg           <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span>      <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>    <span class="token comment">/* Clear  received message                       */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pmsg<span class="token punctuation">)</span><span class="token punctuation">;</span>                                    <span class="token comment">/* Return received message                       */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-1-5-发出邮箱消息-osmboxpost-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-5-发出邮箱消息-osmboxpost-函数" aria-hidden="true">#</a> 7.1.5 发出邮箱消息 - OSMboxPost() 函数</h2><ul><li>如果邮箱中已有消息，则立刻返回调用者，并丢弃新消息</li><li>如果邮箱中没有消息 <ul><li>如果有任务在等待消息，则最高优先级任务得到这个消息</li><li>如果没有任务等待消息，则消息的指针被保存在邮箱中</li></ul></li></ul><p>调用者可以是任务或中断。</p><p>原理：</p><ul><li>检查 ECB 的 <code>OSEventPtr</code> 是否为空咯</li><li>检查 ECB 的等待任务列表检查是否有任务等待消息咯</li><li>投递消息或丢弃消息咯</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                       POST MESSAGE TO A MAILBOX
*
* Description: This function sends a message to a mailbox
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired mailbox
*
*              pmsg          is a pointer to the message to send.  You MUST NOT send a NULL pointer.
*
* Returns    : OS_ERR_NONE          The call was successful and the message was sent
*              OS_ERR_MBOX_FULL     If the mailbox already contains a message.  You can can only send one
*                                   message at a time and thus, the message MUST be consumed before you
*                                   are allowed to send another one.
*              OS_ERR_EVENT_TYPE    If you are attempting to post to a non mailbox.
*              OS_ERR_PEVENT_NULL   If &#39;pevent&#39; is a NULL pointer
*              OS_ERR_POST_NULL_PTR If you are attempting to post a NULL pointer
*
* Note(s)    : 1) HPT means Highest Priority Task
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_MBOX_POST_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSMboxPost</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                   <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pmsg <span class="token operator">==</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* Make sure we are not posting a NULL pointer   */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_POST_NULL_PTR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">/* Validate event block type                     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if any task pending on mailbox            */</span>
                                                      <span class="token comment">/* Ready HPT waiting on event                    */</span>
        <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_MBOX<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                   <span class="token comment">/* Find highest priority task ready to run       */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>            <span class="token comment">/* Make sure mailbox doesn&#39;t already have a msg  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_MBOX_FULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                        <span class="token comment">/* Place message in mailbox                      */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-1-6-发出邮箱消息-osmboxpostopt-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-6-发出邮箱消息-osmboxpostopt-函数" aria-hidden="true">#</a> 7.1.6 发出邮箱消息 - OSMboxPostOpt() 函数</h2><p>与上个函数的逻辑基本相同。不同的是，如果有任务在等待邮箱里的信息，提供了两种选项对信息进行处理：</p><ul><li><code>OS_POST_OPT_NONE</code>：让最高优先级的任务得到这则消息</li><li><code>OS_POST_OPT_BROADCAST</code>：让所有等待消息的任务得到这则消息</li></ul><p>原理：</p><ul><li>检查 ECB 的等待任务列表</li><li>将所有或最高优先级任务置为就绪</li><li>如果没有任务正在等待消息，则保存至 ECB 中</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                       POST MESSAGE TO A MAILBOX
*
* Description: This function sends a message to a mailbox
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired mailbox
*
*              pmsg          is a pointer to the message to send.  You MUST NOT send a NULL pointer.
*
*              opt           determines the type of POST performed:
*                            OS_POST_OPT_NONE         POST to a single waiting task
*                                                     (Identical to OSMboxPost())
*                            OS_POST_OPT_BROADCAST    POST to ALL tasks that are waiting on the mailbox
*
*                            OS_POST_OPT_NO_SCHED     Indicates that the scheduler will NOT be invoked
*
* Returns    : OS_ERR_NONE          The call was successful and the message was sent
*              OS_ERR_MBOX_FULL     If the mailbox already contains a message.  You can can only send one
*                                   message at a time and thus, the message MUST be consumed before you
*                                   are allowed to send another one.
*              OS_ERR_EVENT_TYPE    If you are attempting to post to a non mailbox.
*              OS_ERR_PEVENT_NULL   If &#39;pevent&#39; is a NULL pointer
*              OS_ERR_POST_NULL_PTR If you are attempting to post a NULL pointer
*
* Note(s)    : 1) HPT means Highest Priority Task
*
* Warning    : Interrupts can be disabled for a long time if you do a &#39;broadcast&#39;.  In fact, the
*              interrupt disable time is proportional to the number of tasks waiting on the mailbox.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_MBOX_POST_OPT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSMboxPostOpt</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                      <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">,</span>
                      INT8U      opt<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pmsg <span class="token operator">==</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                          <span class="token comment">/* Make sure we are not posting a NULL pointer   */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_POST_NULL_PTR<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>  <span class="token comment">/* Validate event block type                     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if any task pending on mailbox            */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>opt <span class="token operator">&amp;</span> OS_POST_OPT_BROADCAST<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0x00u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Do we need to post msg to ALL waiting tasks ? */</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>        <span class="token comment">/* Yes, Post to ALL tasks waiting on mailbox     */</span>
                <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_MBOX<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* No,  Post to HPT waiting on mbox              */</span>
            <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_MBOX<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>opt <span class="token operator">&amp;</span> OS_POST_OPT_NO_SCHED<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">/* See if scheduler needs to be invoked          */</span>
            <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find HPT ready to run                         */</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">!=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>            <span class="token comment">/* Make sure mailbox doesn&#39;t already have a msg  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_MBOX_FULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                        <span class="token comment">/* Place message in mailbox                      */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-1-7-无等待地从邮箱中获取消息-osmboxaccept-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-7-无等待地从邮箱中获取消息-osmboxaccept-函数" aria-hidden="true">#</a> 7.1.7 无等待地从邮箱中获取消息 - OSMboxAccept() 函数</h2><p>查看指定的邮箱中是否有需要的消息，且不挂起任务。调用者可以是任务，也可以是中断。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                     ACCEPT MESSAGE FROM MAILBOX
*
* Description: This function checks the mailbox to see if a message is available.  Unlike OSMboxPend(),
*              OSMboxAccept() does not suspend the calling task if a message is not available.
*
* Arguments  : pevent        is a pointer to the event control block
*
* Returns    : != (void *)0  is the message in the mailbox if one is available.  The mailbox is cleared
*                            so the next time OSMboxAccept() is called, the mailbox will be empty.
*              == (void *)0  if the mailbox is empty or,
*                            if &#39;pevent&#39; is a NULL pointer or,
*                            if you didn&#39;t pass the proper event pointer.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_MBOX_ACCEPT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
<span class="token keyword">void</span>  <span class="token operator">*</span><span class="token function">OSMboxAccept</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span>pevent<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                              </span><span class="token comment">/* Allocate storage for CPU status register  */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* Validate &#39;pevent&#39;                         */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* Validate event block type                 */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pmsg               <span class="token operator">=</span> pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>
    pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                       <span class="token comment">/* Clear the mailbox                         */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pmsg<span class="token punctuation">)</span><span class="token punctuation">;</span>                                        <span class="token comment">/* Return the message received (or NULL)     */</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-1-8-查询邮箱的状态-osmboxquery-函数" tabindex="-1"><a class="header-anchor" href="#_7-1-8-查询邮箱的状态-osmboxquery-函数" aria-hidden="true">#</a> 7.1.8 查询邮箱的状态 - OSMboxQuery() 函数</h2><p>将 ECB 中的邮箱状态复制到一个简单的数据结构 <code>OS_MBOX_DATA</code> 中并返回。无需等待，所以调用者可以是任务也可以是中断。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        QUERY A MESSAGE MAILBOX
*
* Description: This function obtains information about a message mailbox.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired mailbox
*
*              p_mbox_data   is a pointer to a structure that will contain information about the message
*                            mailbox.
*
* Returns    : OS_ERR_NONE         The call was successful and the message was sent
*              OS_ERR_EVENT_TYPE   If you are attempting to obtain data from a non mailbox.
*              OS_ERR_PEVENT_NULL  If &#39;pevent&#39;      is a NULL pointer
*              OS_ERR_PDATA_NULL   If &#39;p_mbox_data&#39; is a NULL pointer
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_MBOX_QUERY_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSMboxQuery</span> <span class="token punctuation">(</span>OS_EVENT      <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                    OS_MBOX_DATA  <span class="token operator">*</span>p_mbox_data<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    INT8U       i<span class="token punctuation">;</span>
    OS_PRIO    <span class="token operator">*</span>psrc<span class="token punctuation">;</span>
    OS_PRIO    <span class="token operator">*</span>pdest<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                               </span><span class="token comment">/* Allocate storage for CPU status register */</span></span>
    OS_CPU_SR   cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                         <span class="token comment">/* Validate &#39;pevent&#39;                        */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>p_mbox_data <span class="token operator">==</span> <span class="token punctuation">(</span>OS_MBOX_DATA <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/* Validate &#39;p_mbox_data&#39;                   */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PDATA_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_MBOX<span class="token punctuation">)</span> <span class="token punctuation">{</span>       <span class="token comment">/* Validate event block type                */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    p_mbox_data<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">=</span> pevent<span class="token operator">-&gt;</span>OSEventGrp<span class="token punctuation">;</span>          <span class="token comment">/* Copy message mailbox wait list           */</span>
    psrc                    <span class="token operator">=</span> <span class="token operator">&amp;</span>pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    pdest                   <span class="token operator">=</span> <span class="token operator">&amp;</span>p_mbox_data<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> OS_EVENT_TBL_SIZE<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token operator">*</span>pdest<span class="token operator">++</span> <span class="token operator">=</span> <span class="token operator">*</span>psrc<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    p_mbox_data<span class="token operator">-&gt;</span>OSMsg <span class="token operator">=</span> pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>               <span class="token comment">/* Get message from mailbox                 */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span>                                                     <span class="token comment">/* OS_MBOX_QUERY_EN                         */</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>仔细一想，邮箱和信号量并没有什么卵区别，一个是数，一个是指针罢了。不过邮箱中比较特殊的一点就是，新消息不能覆盖旧消息，而是被丢弃了。</p>`,46),o=[p];function i(c,l){return s(),a("div",null,o)}const u=n(t,[["render",i],["__file","Chapter 7.1 - 消息邮箱管理.html.vue"]]);export{u as default};
