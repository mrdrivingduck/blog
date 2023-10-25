import{_ as n,o as s,c as a,e}from"./app-25fa875f.js";const t={},p=e(`<h1 id="chapter-7-2-消息队列管理" tabindex="-1"><a class="header-anchor" href="#chapter-7-2-消息队列管理" aria-hidden="true">#</a> Chapter 7.2 - 消息队列管理</h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 20 21:16</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_7-2-1-概述" tabindex="-1"><a class="header-anchor" href="#_7-2-1-概述" aria-hidden="true">#</a> 7.2.1 概述</h2><p>消息队列是一种以消息链表为方式进行通信的机制。从本质上来说，消息队列是一个邮箱阵列，消息队列可以在编译前被剪裁。</p><h2 id="_7-2-2-实现消息队列所需要的各种数据结构" tabindex="-1"><a class="header-anchor" href="#_7-2-2-实现消息队列所需要的各种数据结构" aria-hidden="true">#</a> 7.2.2 实现消息队列所需要的各种数据结构</h2><p>ECB 是必须的，需要在编译前定义消息队列中的最大消息数 <code>OS_MAX_QS</code>。需要一个与消息队列最大消息数相同大小的 <strong>指针数组</strong>，分别指向每一条消息。还需要一个队列控制块 <code>OS_Q</code>，并链接到 ECB 的 <code>OS_EventPtr</code> 域上，其中维护了队列的 metadata。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">os_q</span> <span class="token punctuation">{</span>                   <span class="token comment">/* QUEUE CONTROL BLOCK                                         */</span>
    <span class="token keyword">struct</span> <span class="token class-name">os_q</span>   <span class="token operator">*</span>OSQPtr<span class="token punctuation">;</span>              <span class="token comment">/* Link to next queue control block in list of free blocks     */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span><span class="token operator">*</span>OSQStart<span class="token punctuation">;</span>            <span class="token comment">/* Pointer to start of queue data                              */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span><span class="token operator">*</span>OSQEnd<span class="token punctuation">;</span>              <span class="token comment">/* Pointer to end   of queue data                              */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span><span class="token operator">*</span>OSQIn<span class="token punctuation">;</span>               <span class="token comment">/* Pointer to where next message will be inserted  in   the Q  */</span>
    <span class="token keyword">void</span>         <span class="token operator">*</span><span class="token operator">*</span>OSQOut<span class="token punctuation">;</span>              <span class="token comment">/* Pointer to where next message will be extracted from the Q  */</span>
    INT16U         OSQSize<span class="token punctuation">;</span>             <span class="token comment">/* Size of queue (maximum number of entries)                   */</span>
    INT16U         OSQEntries<span class="token punctuation">;</span>          <span class="token comment">/* Current number of entries in the queue                      */</span>
<span class="token punctuation">}</span> OS_Q<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>OSQPtr</code> 用于链接空闲队列控制块，一旦控制块被取下来，就没用了</li><li><code>OSQStart</code> / <code>OSQEnd</code> 指向指针数组的起始地址和最后一个地址的下一个地址</li><li><code>OSQIn</code> / <code>OSQOut</code> 指向队列的头和尾</li><li><code>QSQSize</code> 队列中总的单元数</li><li><code>QSQEntries</code> 队列中当前的消息数量</li></ul><p>消息队列的核心就是一个循环缓冲区。</p><h2 id="_7-2-3-建立消息队列-osqcreate-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-3-建立消息队列-osqcreate-函数" aria-hidden="true">#</a> 7.2.3 建立消息队列 - OSQCreate() 函数</h2><p>建立一个消息队列，需要将消息队列指针数组的首地址和消息指针队列的长度作为参数。</p><p>原理：</p><ul><li>从空闲 ECB 链表和空闲队列控制块链表中各取一个控制块</li><li>初始化，将队列控制块链接到 ECB 上</li><li>返回 ECB 的指针</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        CREATE A MESSAGE QUEUE
*
* Description: This function creates a message queue if free event control blocks are available.
*
* Arguments  : start         is a pointer to the base address of the message queue storage area.  The
*                            storage area MUST be declared as an array of pointers to &#39;void&#39; as follows
*
*                            void *MessageStorage[size]
*
*              size          is the number of elements in the storage area
*
* Returns    : != (OS_EVENT *)0  is a pointer to the event control clock (OS_EVENT) associated with the
*                                created queue
*              == (OS_EVENT *)0  if no event control blocks were available or an error was detected
*********************************************************************************************************
*/</span>

OS_EVENT  <span class="token operator">*</span><span class="token function">OSQCreate</span> <span class="token punctuation">(</span><span class="token keyword">void</span>    <span class="token operator">*</span><span class="token operator">*</span>start<span class="token punctuation">,</span>
                      INT16U    size<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">;</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
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
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* See if we have an event control block              */</span>
        <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        pq <span class="token operator">=</span> OSQFreeList<span class="token punctuation">;</span>                        <span class="token comment">/* Get a free queue control block                     */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pq <span class="token operator">!=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* Were we able to get a queue control block ?        */</span>
            OSQFreeList            <span class="token operator">=</span> OSQFreeList<span class="token operator">-&gt;</span>OSQPtr<span class="token punctuation">;</span> <span class="token comment">/* Yes, Adjust free list pointer to next free*/</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            pq<span class="token operator">-&gt;</span>OSQStart           <span class="token operator">=</span> start<span class="token punctuation">;</span>               <span class="token comment">/*      Initialize the queue                 */</span>
            pq<span class="token operator">-&gt;</span>OSQEnd             <span class="token operator">=</span> <span class="token operator">&amp;</span>start<span class="token punctuation">[</span>size<span class="token punctuation">]</span><span class="token punctuation">;</span>
            pq<span class="token operator">-&gt;</span>OSQIn              <span class="token operator">=</span> start<span class="token punctuation">;</span>
            pq<span class="token operator">-&gt;</span>OSQOut             <span class="token operator">=</span> start<span class="token punctuation">;</span>
            pq<span class="token operator">-&gt;</span>OSQSize            <span class="token operator">=</span> size<span class="token punctuation">;</span>
            pq<span class="token operator">-&gt;</span>OSQEntries         <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
            pevent<span class="token operator">-&gt;</span>OSEventType    <span class="token operator">=</span> OS_EVENT_TYPE_Q<span class="token punctuation">;</span>
            pevent<span class="token operator">-&gt;</span>OSEventCnt     <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
            pevent<span class="token operator">-&gt;</span>OSEventPtr     <span class="token operator">=</span> pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
            pevent<span class="token operator">-&gt;</span>OSEventName    <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
            <span class="token function">OS_EventWaitListInit</span><span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>                 <span class="token comment">/*      Initalize the wait list              */</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            pevent<span class="token operator">-&gt;</span>OSEventPtr <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span>OSEventFreeList<span class="token punctuation">;</span> <span class="token comment">/* No,  Return event control block on error  */</span>
            OSEventFreeList    <span class="token operator">=</span> pevent<span class="token punctuation">;</span>
            <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            pevent <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-4-删除消息队列-osqdel-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-4-删除消息队列-osqdel-函数" aria-hidden="true">#</a> 7.2.4 删除消息队列 - OSQDel() 函数</h2><p>删除消息队列。依旧可以指定删除选项：</p><ul><li><code>OS_DEL_NO_PEND</code></li><li><code>OS_DEL_ALWAYS</code></li></ul><p>原理：将 ECB 和队列控制块设置为初始状态，并归还到空闲链表中。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        DELETE A MESSAGE QUEUE
*
* Description: This function deletes a message queue and readies all tasks pending on the queue.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired
*                            queue.
*
*              opt           determines delete options as follows:
*                            opt == OS_DEL_NO_PEND   Delete the queue ONLY if no task pending
*                            opt == OS_DEL_ALWAYS    Deletes the queue even if tasks are waiting.
*                                                    In this case, all the tasks pending will be readied.
*
*              perr          is a pointer to an error code that can contain one of the following values:
*                            OS_ERR_NONE             The call was successful and the queue was deleted
*                            OS_ERR_DEL_ISR          If you tried to delete the queue from an ISR
*                            OS_ERR_INVALID_OPT      An invalid option was specified
*                            OS_ERR_TASK_WAITING     One or more tasks were waiting on the queue
*                            OS_ERR_EVENT_TYPE       If you didn&#39;t pass a pointer to a queue
*                            OS_ERR_PEVENT_NULL      If &#39;pevent&#39; is a NULL pointer.
*
* Returns    : pevent        upon error
*              (OS_EVENT *)0 if the queue was successfully deleted.
*
* Note(s)    : 1) This function must be used with care.  Tasks that would normally expect the presence of
*                 the queue MUST check the return code of OSQPend().
*              2) OSQAccept() callers will not know that the intended queue has been deleted unless
*                 they check &#39;pevent&#39; to see that it&#39;s a NULL pointer.
*              3) This call can potentially disable interrupts for a long time.  The interrupt disable
*                 time is directly proportional to the number of tasks waiting on the queue.
*              4) Because ALL tasks pending on the queue will be readied, you MUST be careful in
*                 applications where the queue is used for mutual exclusion because the resource(s)
*                 will no longer be guarded by the queue.
*              5) If the storage for the message queue was allocated dynamically (i.e. using a malloc()
*                 type call) then your application MUST release the memory storage by call the counterpart
*                 call of the dynamic allocation scheme used.  If the queue storage was created statically
*                 then, the storage can be reused.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_DEL_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
OS_EVENT  <span class="token operator">*</span><span class="token function">OSQDel</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                   INT8U      opt<span class="token punctuation">,</span>
                   INT8U     <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    BOOLEAN    tasks_waiting<span class="token punctuation">;</span>
    OS_EVENT  <span class="token operator">*</span>pevent_return<span class="token punctuation">;</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
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
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Validate event block type                */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                               <span class="token comment">/* See if called from ISR ...               */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_DEL_ISR<span class="token punctuation">;</span>                            <span class="token comment">/* ... can&#39;t DELETE from an ISR             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                        <span class="token comment">/* See if any tasks waiting on queue        */</span>
        tasks_waiting <span class="token operator">=</span> OS_TRUE<span class="token punctuation">;</span>                           <span class="token comment">/* Yes                                      */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        tasks_waiting <span class="token operator">=</span> OS_FALSE<span class="token punctuation">;</span>                          <span class="token comment">/* No                                       */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>opt<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">case</span> OS_DEL_NO_PEND<span class="token operator">:</span>                               <span class="token comment">/* Delete queue only if no task waiting     */</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_FALSE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
                 pevent<span class="token operator">-&gt;</span>OSEventName    <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
                 pq                     <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>  <span class="token comment">/* Return OS_Q to free list     */</span>
                 pq<span class="token operator">-&gt;</span>OSQPtr             <span class="token operator">=</span> OSQFreeList<span class="token punctuation">;</span>
                 OSQFreeList            <span class="token operator">=</span> pq<span class="token punctuation">;</span>
                 pevent<span class="token operator">-&gt;</span>OSEventType    <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
                 pevent<span class="token operator">-&gt;</span>OSEventPtr     <span class="token operator">=</span> OSEventFreeList<span class="token punctuation">;</span> <span class="token comment">/* Return Event Control Block to free list  */</span>
                 pevent<span class="token operator">-&gt;</span>OSEventCnt     <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
                 OSEventFreeList        <span class="token operator">=</span> pevent<span class="token punctuation">;</span>          <span class="token comment">/* Get next free event control block        */</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr                  <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
                 pevent_return          <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>   <span class="token comment">/* Queue has been deleted                   */</span>
             <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                 <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                 <span class="token operator">*</span>perr                  <span class="token operator">=</span> OS_ERR_TASK_WAITING<span class="token punctuation">;</span>
                 pevent_return          <span class="token operator">=</span> pevent<span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">case</span> OS_DEL_ALWAYS<span class="token operator">:</span>                                <span class="token comment">/* Always delete the queue                  */</span>
             <span class="token keyword">while</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>            <span class="token comment">/* Ready ALL tasks waiting for queue        */</span>
                 <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">,</span> OS_STAT_Q<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_EVENT_NAME_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
             pevent<span class="token operator">-&gt;</span>OSEventName    <span class="token operator">=</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token string">&quot;?&quot;</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
             pq                     <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>   <span class="token comment">/* Return OS_Q to free list        */</span>
             pq<span class="token operator">-&gt;</span>OSQPtr             <span class="token operator">=</span> OSQFreeList<span class="token punctuation">;</span>
             OSQFreeList            <span class="token operator">=</span> pq<span class="token punctuation">;</span>
             pevent<span class="token operator">-&gt;</span>OSEventType    <span class="token operator">=</span> OS_EVENT_TYPE_UNUSED<span class="token punctuation">;</span>
             pevent<span class="token operator">-&gt;</span>OSEventPtr     <span class="token operator">=</span> OSEventFreeList<span class="token punctuation">;</span>     <span class="token comment">/* Return Event Control Block to free list  */</span>
             pevent<span class="token operator">-&gt;</span>OSEventCnt     <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
             OSEventFreeList        <span class="token operator">=</span> pevent<span class="token punctuation">;</span>              <span class="token comment">/* Get next free event control block        */</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token keyword">if</span> <span class="token punctuation">(</span>tasks_waiting <span class="token operator">==</span> OS_TRUE<span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Reschedule only if task(s) were waiting  */</span>
                 <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find highest priority task ready to run  */</span>
             <span class="token punctuation">}</span>
             <span class="token operator">*</span>perr                  <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
             pevent_return          <span class="token operator">=</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>       <span class="token comment">/* Queue has been deleted                   */</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token keyword">default</span><span class="token operator">:</span>
             <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
             <span class="token operator">*</span>perr                  <span class="token operator">=</span> OS_ERR_INVALID_OPT<span class="token punctuation">;</span>
             pevent_return          <span class="token operator">=</span> pevent<span class="token punctuation">;</span>
             <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pevent_return<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-5-等待消息队列中的一则消息-osqpend-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-5-等待消息队列中的一则消息-osqpend-函数" aria-hidden="true">#</a> 7.2.5 等待消息队列中的一则消息 - OSQPend() 函数</h2><p>等待队列中的消息：</p><ul><li>如果队列中已存在消息，那么返回该消息，并将消息从队列中删除</li><li>如果队列中没有消息，则挂起当前任务，直到消息到来或超时时间满</li><li>如果有多个任务等待消息，则默认最高优先级的任务取得消息</li></ul><p>调用者只能是任务。</p><p>原理：</p><ul><li>从 ECB 中取得队列控制块</li><li>如果队列中的消息大于 0，则取出消息并递减消息数量</li><li>否则挂起任务</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                     PEND ON A QUEUE FOR A MESSAGE
*
* Description: This function waits for a message to be sent to a queue
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired queue
*
*              timeout       is an optional timeout period (in clock ticks).  If non-zero, your task will
*                            wait for a message to arrive at the queue up to the amount of time
*                            specified by this argument.  If you specify 0, however, your task will wait
*                            forever at the specified queue or, until a message arrives.
*
*              perr          is a pointer to where an error message will be deposited.  Possible error
*                            messages are:
*
*                            OS_ERR_NONE         The call was successful and your task received a
*                                                message.
*                            OS_ERR_TIMEOUT      A message was not received within the specified &#39;timeout&#39;.
*                            OS_ERR_PEND_ABORT   The wait on the queue was aborted.
*                            OS_ERR_EVENT_TYPE   You didn&#39;t pass a pointer to a queue
*                            OS_ERR_PEVENT_NULL  If &#39;pevent&#39; is a NULL pointer
*                            OS_ERR_PEND_ISR     If you called this function from an ISR and the result
*                                                would lead to a suspension.
*                            OS_ERR_PEND_LOCKED  If you called this function with the scheduler is locked
*
* Returns    : != (void *)0  is a pointer to the message received
*              == (void *)0  if you received a NULL pointer message or,
*                            if no message was received or,
*                            if &#39;pevent&#39; is a NULL pointer or,
*                            if you didn&#39;t pass a pointer to a queue.
*
* Note(s)    : As of V2.60, this function allows you to receive NULL pointer messages.
*********************************************************************************************************
*/</span>

<span class="token keyword">void</span>  <span class="token operator">*</span><span class="token function">OSQPend</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                INT32U     timeout<span class="token punctuation">,</span>
                INT8U     <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">;</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Validate &#39;pevent&#39;                                  */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEVENT_NULL<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token comment">/* Validate event block type                          */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSIntNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* See if called from ISR ...                         */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_ISR<span class="token punctuation">;</span>                 <span class="token comment">/* ... can&#39;t PEND from an ISR                         */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>OSLockNesting <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* See if called with scheduler locked ...            */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEND_LOCKED<span class="token punctuation">;</span>              <span class="token comment">/* ... can&#39;t PEND when locked                         */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>             <span class="token comment">/* Point at queue control block                       */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if any messages in the queue                   */</span>
        pmsg <span class="token operator">=</span> <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQOut<span class="token operator">++</span><span class="token punctuation">;</span>                    <span class="token comment">/* Yes, extract oldest message from the queue         */</span>
        pq<span class="token operator">-&gt;</span>OSQEntries<span class="token operator">--</span><span class="token punctuation">;</span>                        <span class="token comment">/* Update the number of entries in the queue          */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Wrap OUT pointer if we are at the end of the queue */</span>
            pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>pmsg<span class="token punctuation">)</span><span class="token punctuation">;</span>                           <span class="token comment">/* Return message received                            */</span>
    <span class="token punctuation">}</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStat     <span class="token operator">|=</span> OS_STAT_Q<span class="token punctuation">;</span>        <span class="token comment">/* Task will have to pend for a message to be posted  */</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend  <span class="token operator">=</span> OS_STAT_PEND_OK<span class="token punctuation">;</span>
    OSTCBCur<span class="token operator">-&gt;</span>OSTCBDly       <span class="token operator">=</span> timeout<span class="token punctuation">;</span>          <span class="token comment">/* Load timeout into TCB                              */</span>
    <span class="token function">OS_EventTaskWait</span><span class="token punctuation">(</span>pevent<span class="token punctuation">)</span><span class="token punctuation">;</span>                    <span class="token comment">/* Suspend task until event or timeout occurs         */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                  <span class="token comment">/* Find next highest priority task ready to run       */</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>OSTCBCur<span class="token operator">-&gt;</span>OSTCBStatPend<span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/* See if we timed-out or aborted                */</span>
        <span class="token keyword">case</span> OS_STAT_PEND_OK<span class="token operator">:</span>                         <span class="token comment">/* Extract message from TCB (Put there by QPost) */</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-6-向消息队列发送一则-fifo-消息-osqpost-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-6-向消息队列发送一则-fifo-消息-osqpost-函数" aria-hidden="true">#</a> 7.2.6 向消息队列发送一则 FIFO 消息 - OSQPost() 函数</h2><p>向消息队列中加入消息：</p><ul><li>若队列已满，则丢弃新消息</li><li>若队列不满，则将消息放入队列中</li><li>如果有任务在等待消息，则最高优先级任务得到这个消息；如果等待消息的任务的优先级高于当前任务，则发生任务切换</li></ul><p>原理：</p><ul><li>逻辑上，应该先检查 ECB 的等待任务列表中是否有任务在等待消息</li><li>如果没有，再判断队列是否已满</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        POST MESSAGE TO A QUEUE
*
* Description: This function sends a message to a queue
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired queue
*
*              pmsg          is a pointer to the message to send.
*
* Returns    : OS_ERR_NONE           The call was successful and the message was sent
*              OS_ERR_Q_FULL         If the queue cannot accept any more messages because it is full.
*              OS_ERR_EVENT_TYPE     If you didn&#39;t pass a pointer to a queue.
*              OS_ERR_PEVENT_NULL    If &#39;pevent&#39; is a NULL pointer
*
* Note(s)    : As of V2.60, this function allows you to send NULL pointer messages.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_POST_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSQPost</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                           </span><span class="token comment">/* Allocate storage for CPU status register     */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Validate &#39;pevent&#39;                            */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* Validate event block type                    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* See if any task pending on queue             */</span>
                                                       <span class="token comment">/* Ready highest priority task waiting on event */</span>
        <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_Q<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                    <span class="token comment">/* Find highest priority task ready to run      */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>                   <span class="token comment">/* Point to queue control block                 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;=</span> pq<span class="token operator">-&gt;</span>OSQSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Make sure queue is not full                  */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_Q_FULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQIn<span class="token operator">++</span> <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                               <span class="token comment">/* Insert message into queue                    */</span>
    pq<span class="token operator">-&gt;</span>OSQEntries<span class="token operator">++</span><span class="token punctuation">;</span>                                  <span class="token comment">/* Update the nbr of entries in the queue       */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQIn <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Wrap IN ptr if we are at end of queue        */</span>
        pq<span class="token operator">-&gt;</span>OSQIn <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-7-向消息队列发送一则-lifo-消息-osqpostfront-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-7-向消息队列发送一则-lifo-消息-osqpostfront-函数" aria-hidden="true">#</a> 7.2.7 向消息队列发送一则 LIFO 消息 - OSQPostFront() 函数</h2><p>与上一个函数基本类似，差别是将消息插入到队列的最前端而不是最后端。</p><p>原理：</p><ul><li>同样，应该先检查是否有任务在等待消息 (这种情况不需要对队列进行操作)</li><li>如果没有，再检查队列是否已满</li><li>若队列未满，则将消息插入队列的最前端 (下一个出队的就是这条消息)</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                   POST MESSAGE TO THE FRONT OF A QUEUE
*
* Description: This function sends a message to a queue but unlike OSQPost(), the message is posted at
*              the front instead of the end of the queue.  Using OSQPostFront() allows you to send
*              &#39;priority&#39; messages.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired queue
*
*              pmsg          is a pointer to the message to send.
*
* Returns    : OS_ERR_NONE           The call was successful and the message was sent
*              OS_ERR_Q_FULL         If the queue cannot accept any more messages because it is full.
*              OS_ERR_EVENT_TYPE     If you didn&#39;t pass a pointer to a queue.
*              OS_ERR_PEVENT_NULL    If &#39;pevent&#39; is a NULL pointer
*
* Note(s)    : As of V2.60, this function allows you to send NULL pointer messages.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_POST_FRONT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSQPostFront</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                     <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">/* Validate event block type                     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if any task pending on queue              */</span>
                                                      <span class="token comment">/* Ready highest priority task waiting on event  */</span>
        <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_Q<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                                   <span class="token comment">/* Find highest priority task ready to run       */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>                  <span class="token comment">/* Point to queue control block                  */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;=</span> pq<span class="token operator">-&gt;</span>OSQSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>              <span class="token comment">/* Make sure queue is not full                   */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_Q_FULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">)</span> <span class="token punctuation">{</span>                 <span class="token comment">/* Wrap OUT ptr if we are at the 1st queue entry */</span>
        pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pq<span class="token operator">-&gt;</span>OSQOut<span class="token operator">--</span><span class="token punctuation">;</span>
    <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                               <span class="token comment">/* Insert message into queue                     */</span>
    pq<span class="token operator">-&gt;</span>OSQEntries<span class="token operator">++</span><span class="token punctuation">;</span>                                 <span class="token comment">/* Update the nbr of entries in the queue        */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-8-以可选方式-fifo-或-lifo-向消息队列发一则消息-osqpostopt" tabindex="-1"><a class="header-anchor" href="#_7-2-8-以可选方式-fifo-或-lifo-向消息队列发一则消息-osqpostopt" aria-hidden="true">#</a> 7.2.8 以可选方式 (FIFO 或 LIFO) 向消息队列发一则消息 - OSQPostOpt()</h2><ul><li>选项可以指定 LIFO 或 FIFO</li><li>还可以指定最高优先级的任务得到消息，还是所有等待的任务都得到消息</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        POST MESSAGE TO A QUEUE
*
* Description: This function sends a message to a queue.  This call has been added to reduce code size
*              since it can replace both OSQPost() and OSQPostFront().  Also, this function adds the
*              capability to broadcast a message to ALL tasks waiting on the message queue.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired queue
*
*              pmsg          is a pointer to the message to send.
*
*              opt           determines the type of POST performed:
*                            OS_POST_OPT_NONE         POST to a single waiting task
*                                                     (Identical to OSQPost())
*                            OS_POST_OPT_BROADCAST    POST to ALL tasks that are waiting on the queue
*                            OS_POST_OPT_FRONT        POST as LIFO (Simulates OSQPostFront())
*                            OS_POST_OPT_NO_SCHED     Indicates that the scheduler will NOT be invoked
*
* Returns    : OS_ERR_NONE           The call was successful and the message was sent
*              OS_ERR_Q_FULL         If the queue cannot accept any more messages because it is full.
*              OS_ERR_EVENT_TYPE     If you didn&#39;t pass a pointer to a queue.
*              OS_ERR_PEVENT_NULL    If &#39;pevent&#39; is a NULL pointer
*
* Warning    : Interrupts can be disabled for a long time if you do a &#39;broadcast&#39;.  In fact, the
*              interrupt disable time is proportional to the number of tasks waiting on the queue.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_POST_OPT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSQPostOpt</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                   <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">,</span>
                   INT8U      opt<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">/* Validate event block type                     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0x00u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/* See if any task pending on queue              */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>opt <span class="token operator">&amp;</span> OS_POST_OPT_BROADCAST<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0x00u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* Do we need to post msg to ALL waiting tasks ? */</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">!=</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>        <span class="token comment">/* Yes, Post to ALL tasks waiting on queue       */</span>
                <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_Q<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                      <span class="token comment">/* No,  Post to HPT waiting on queue             */</span>
            <span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span><span class="token function">OS_EventTaskRdy</span><span class="token punctuation">(</span>pevent<span class="token punctuation">,</span> pmsg<span class="token punctuation">,</span> OS_STAT_Q<span class="token punctuation">,</span> OS_STAT_PEND_OK<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>opt <span class="token operator">&amp;</span> OS_POST_OPT_NO_SCHED<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>	  <span class="token comment">/* See if scheduler needs to be invoked          */</span>
            <span class="token function">OS_Sched</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Find highest priority task ready to run       */</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>                  <span class="token comment">/* Point to queue control block                  */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;=</span> pq<span class="token operator">-&gt;</span>OSQSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>              <span class="token comment">/* Make sure queue is not full                   */</span>
        <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_Q_FULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>opt <span class="token operator">&amp;</span> OS_POST_OPT_FRONT<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0x00u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>         <span class="token comment">/* Do we post to the FRONT of the queue?         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">)</span> <span class="token punctuation">{</span>             <span class="token comment">/* Yes, Post as LIFO, Wrap OUT pointer if we ... */</span>
            pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">;</span>                  <span class="token comment">/*      ... are at the 1st queue entry           */</span>
        <span class="token punctuation">}</span>
        pq<span class="token operator">-&gt;</span>OSQOut<span class="token operator">--</span><span class="token punctuation">;</span>
        <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                           <span class="token comment">/*      Insert message into queue                */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>                                          <span class="token comment">/* No,  Post as FIFO                             */</span>
        <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQIn<span class="token operator">++</span> <span class="token operator">=</span> pmsg<span class="token punctuation">;</span>                          <span class="token comment">/*      Insert message into queue                */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQIn <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">)</span> <span class="token punctuation">{</span>                <span class="token comment">/*      Wrap IN ptr if we are at end of queue    */</span>
            pq<span class="token operator">-&gt;</span>OSQIn <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    pq<span class="token operator">-&gt;</span>OSQEntries<span class="token operator">++</span><span class="token punctuation">;</span>                                 <span class="token comment">/* Update the nbr of entries in the queue        */</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-9-无等待地从消息队列中获取一则消息-osqaccept-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-9-无等待地从消息队列中获取一则消息-osqaccept-函数" aria-hidden="true">#</a> 7.2.9 无等待地从消息队列中获取一则消息 - OSQAccept() 函数</h2><p>检查消息队列中是否已经有消息，不挂起任务，立刻返回。调用者可以是任务，也可以是中断。</p><p>原理：查询 ECB 对应的消息控制块的 <code>OSQEntries</code> 是否大于 0</p><ul><li>大于 0，递减该变量，返回消息指针</li><li>等于 0，则返回空指针</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                      ACCEPT MESSAGE FROM QUEUE
*
* Description: This function checks the queue to see if a message is available.  Unlike OSQPend(),
*              OSQAccept() does not suspend the calling task if a message is not available.
*
* Arguments  : pevent        is a pointer to the event control block
*
*              perr          is a pointer to where an error message will be deposited.  Possible error
*                            messages are:
*
*                            OS_ERR_NONE         The call was successful and your task received a
*                                                message.
*                            OS_ERR_EVENT_TYPE   You didn&#39;t pass a pointer to a queue
*                            OS_ERR_PEVENT_NULL  If &#39;pevent&#39; is a NULL pointer
*                            OS_ERR_Q_EMPTY      The queue did not contain any messages
*
* Returns    : != (void *)0  is the message in the queue if one is available.  The message is removed
*                            from the so the next time OSQAccept() is called, the queue will contain
*                            one less entry.
*              == (void *)0  if you received a NULL pointer message
*                            if the queue is empty or,
*                            if &#39;pevent&#39; is a NULL pointer or,
*                            if you passed an invalid event type
*
* Note(s)    : As of V2.60, you can now pass NULL pointers through queues.  Because of this, the argument
*              &#39;perr&#39; has been added to the API to tell you about the outcome of the call.
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_ACCEPT_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
<span class="token keyword">void</span>  <span class="token operator">*</span><span class="token function">OSQAccept</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                  INT8U     <span class="token operator">*</span>perr<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">void</span>      <span class="token operator">*</span>pmsg<span class="token punctuation">;</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                     </span><span class="token comment">/* Allocate storage for CPU status register           */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">OS_SAFETY_CRITICAL</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>perr <span class="token operator">==</span> <span class="token punctuation">(</span>INT8U <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">OS_SAFETY_CRITICAL_EXCEPTION</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>               <span class="token comment">/* Validate &#39;pevent&#39;                                  */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_PEVENT_NULL<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token comment">/* Validate event block type                          */</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_EVENT_TYPE<span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>             <span class="token comment">/* Point at queue control block                       */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                   <span class="token comment">/* See if any messages in the queue                   */</span>
        pmsg <span class="token operator">=</span> <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQOut<span class="token operator">++</span><span class="token punctuation">;</span>                    <span class="token comment">/* Yes, extract oldest message from the queue         */</span>
        pq<span class="token operator">-&gt;</span>OSQEntries<span class="token operator">--</span><span class="token punctuation">;</span>                        <span class="token comment">/* Update the number of entries in the queue          */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">==</span> pq<span class="token operator">-&gt;</span>OSQEnd<span class="token punctuation">)</span> <span class="token punctuation">{</span>          <span class="token comment">/* Wrap OUT pointer if we are at the end of the queue */</span>
            pq<span class="token operator">-&gt;</span>OSQOut <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_NONE<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token operator">*</span>perr <span class="token operator">=</span> OS_ERR_Q_EMPTY<span class="token punctuation">;</span>
        pmsg  <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>                       <span class="token comment">/* Queue is empty                                     */</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>pmsg<span class="token punctuation">)</span><span class="token punctuation">;</span>                               <span class="token comment">/* Return message received (or NULL)                  */</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-10-清空消息队列-osqflush-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-10-清空消息队列-osqflush-函数" aria-hidden="true">#</a> 7.2.10 清空消息队列 - OSQFlush() 函数</h2><p>清空消息队列。</p><p>原理：</p><ul><li>将头指针和尾指针都调整到缓冲区起始单元</li><li>清空消息数量计数器</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                             FLUSH QUEUE
*
* Description : This function is used to flush the contents of the message queue.
*
* Arguments   : none
*
* Returns     : OS_ERR_NONE         upon success
*               OS_ERR_EVENT_TYPE   If you didn&#39;t pass a pointer to a queue
*               OS_ERR_PEVENT_NULL  If &#39;pevent&#39; is a NULL pointer
*
* WARNING     : You should use this function with great care because, when to flush the queue, you LOOSE
*               the references to what the queue entries are pointing to and thus, you could cause
*               &#39;memory leaks&#39;.  In other words, the data you are pointing to that&#39;s being referenced
*               by the queue entries should, most likely, need to be de-allocated (i.e. freed).
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_FLUSH_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSQFlush</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span>pevent<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_Q      <span class="token operator">*</span>pq<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                          </span><span class="token comment">/* Allocate storage for CPU status register      */</span></span>
    OS_CPU_SR  cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                    <span class="token comment">/* Validate &#39;pevent&#39;                             */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>     <span class="token comment">/* Validate event block type                     */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    pq             <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>      <span class="token comment">/* Point to queue storage structure              */</span>
    pq<span class="token operator">-&gt;</span>OSQIn      <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
    pq<span class="token operator">-&gt;</span>OSQOut     <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQStart<span class="token punctuation">;</span>
    pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-2-11-查询一个消息队列的状态-osqquery-函数" tabindex="-1"><a class="header-anchor" href="#_7-2-11-查询一个消息队列的状态-osqquery-函数" aria-hidden="true">#</a> 7.2.11 查询一个消息队列的状态 - OSQQuery() 函数</h2><p>查询一个消息队列的当前状态。将 ECB 和队列控制块中的变量复制到 <code>OS_Q_DATA</code> 数据结构中。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
*********************************************************************************************************
*                                        QUERY A MESSAGE QUEUE
*
* Description: This function obtains information about a message queue.
*
* Arguments  : pevent        is a pointer to the event control block associated with the desired queue
*
*              p_q_data      is a pointer to a structure that will contain information about the message
*                            queue.
*
* Returns    : OS_ERR_NONE         The call was successful and the message was sent
*              OS_ERR_EVENT_TYPE   If you are attempting to obtain data from a non queue.
*              OS_ERR_PEVENT_NULL  If &#39;pevent&#39;   is a NULL pointer
*              OS_ERR_PDATA_NULL   If &#39;p_q_data&#39; is a NULL pointer
*********************************************************************************************************
*/</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_Q_QUERY_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
INT8U  <span class="token function">OSQQuery</span> <span class="token punctuation">(</span>OS_EVENT  <span class="token operator">*</span>pevent<span class="token punctuation">,</span>
                 OS_Q_DATA <span class="token operator">*</span>p_q_data<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    OS_Q       <span class="token operator">*</span>pq<span class="token punctuation">;</span>
    INT8U       i<span class="token punctuation">;</span>
    OS_PRIO    <span class="token operator">*</span>psrc<span class="token punctuation">;</span>
    OS_PRIO    <span class="token operator">*</span>pdest<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_CRITICAL_METHOD <span class="token operator">==</span> <span class="token number">3u</span>                           </span><span class="token comment">/* Allocate storage for CPU status register     */</span></span>
    OS_CPU_SR   cpu_sr <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>



<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression">OS_ARG_CHK_EN <span class="token operator">&gt;</span> <span class="token number">0u</span></span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent <span class="token operator">==</span> <span class="token punctuation">(</span>OS_EVENT <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                     <span class="token comment">/* Validate &#39;pevent&#39;                            */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PEVENT_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>p_q_data <span class="token operator">==</span> <span class="token punctuation">(</span>OS_Q_DATA <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>                  <span class="token comment">/* Validate &#39;p_q_data&#39;                          */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_PDATA_NULL<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pevent<span class="token operator">-&gt;</span>OSEventType <span class="token operator">!=</span> OS_EVENT_TYPE_Q<span class="token punctuation">)</span> <span class="token punctuation">{</span>      <span class="token comment">/* Validate event block type                    */</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_EVENT_TYPE<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">OS_ENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    p_q_data<span class="token operator">-&gt;</span>OSEventGrp <span class="token operator">=</span> pevent<span class="token operator">-&gt;</span>OSEventGrp<span class="token punctuation">;</span>         <span class="token comment">/* Copy message queue wait list                 */</span>
    psrc                 <span class="token operator">=</span> <span class="token operator">&amp;</span>pevent<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    pdest                <span class="token operator">=</span> <span class="token operator">&amp;</span>p_q_data<span class="token operator">-&gt;</span>OSEventTbl<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0u</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> OS_EVENT_TBL_SIZE<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token operator">*</span>pdest<span class="token operator">++</span> <span class="token operator">=</span> <span class="token operator">*</span>psrc<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    pq <span class="token operator">=</span> <span class="token punctuation">(</span>OS_Q <span class="token operator">*</span><span class="token punctuation">)</span>pevent<span class="token operator">-&gt;</span>OSEventPtr<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>pq<span class="token operator">-&gt;</span>OSQEntries <span class="token operator">&gt;</span> <span class="token number">0u</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        p_q_data<span class="token operator">-&gt;</span>OSMsg <span class="token operator">=</span> <span class="token operator">*</span>pq<span class="token operator">-&gt;</span>OSQOut<span class="token punctuation">;</span>                 <span class="token comment">/* Get next message to return if available      */</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        p_q_data<span class="token operator">-&gt;</span>OSMsg <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    p_q_data<span class="token operator">-&gt;</span>OSNMsgs <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQEntries<span class="token punctuation">;</span>
    p_q_data<span class="token operator">-&gt;</span>OSQSize <span class="token operator">=</span> pq<span class="token operator">-&gt;</span>OSQSize<span class="token punctuation">;</span>
    <span class="token function">OS_EXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>OS_ERR_NONE<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span>                                                 <span class="token comment">/* OS_Q_QUERY_EN                                */</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary" aria-hidden="true">#</a> Summary</h2><p>核心多出来的一个数据结构 - 队列控制块，用于维护一个消息的循环队列。还需要注意发送消息时，可以单播，也可以广播。</p>`,58),o=[p];function c(i,l){return s(),a("div",null,o)}const r=n(t,[["render",c],["__file","Chapter 7.2 - 消息队列管理.html.vue"]]);export{r as default};
