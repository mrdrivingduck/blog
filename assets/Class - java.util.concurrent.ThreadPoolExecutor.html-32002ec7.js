import{_ as p,r as a,o as c,c as i,a as n,b as s,d as e,w as l,e as u}from"./app-25fa875f.js";const r={},d=n("h1",{id:"class-java-util-concurrent-threadpoolexecutor",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#class-java-util-concurrent-threadpoolexecutor","aria-hidden":"true"},"#"),s(" Class - java.util.concurrent.ThreadPoolExecutor")],-1),k=n("p",null,"Created by : Mr Dk.",-1),v=n("p",null,"2020 / 11 / 02 21:12",-1),m=n("p",null,"Nanjing, Jiangsu, China",-1),b=n("hr",null,null,-1),h=n("h2",{id:"definition",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#definition","aria-hidden":"true"},"#"),s(" Definition")],-1),w=u(`<div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ThreadPoolExecutor</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractExecutorService</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="thread-pool-life-cycle" tabindex="-1"><a class="header-anchor" href="#thread-pool-life-cycle" aria-hidden="true">#</a> Thread Pool Life Cycle</h2><p>线程池的运行状态由线程池对象自行维护，主要包含两个数值：</p><ul><li>线程池运行状态</li><li>线程池内的线程数量</li></ul><p>这两者共同使用一个原子 Integer 变量，其中线程池运行状态使用 <strong>高 3 位</strong>，线程池内线程数量使用 <strong>低 29 位</strong>，两个数值在变量内互相独立不干扰。共用一个变量省去了为了维护两个数值的一致性而需要占用的锁资源。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * The main pool control state, ctl, is an atomic integer packing
 * two conceptual fields
 *   workerCount, indicating the effective number of threads
 *   runState,    indicating whether running, shutting down etc
 *
 * In order to pack them into one int, we limit workerCount to
 * (2^29)-1 (about 500 million) threads rather than (2^31)-1 (2
 * billion) otherwise representable. If this is ever an issue in
 * the future, the variable can be changed to be an AtomicLong,
 * and the shift/mask constants below adjusted. But until the need
 * arises, this code is a bit faster and simpler using an int.
 *
 * The workerCount is the number of workers that have been
 * permitted to start and not permitted to stop.  The value may be
 * transiently different from the actual number of live threads,
 * for example when a ThreadFactory fails to create a thread when
 * asked, and when exiting threads are still performing
 * bookkeeping before terminating. The user-visible pool size is
 * reported as the current size of the workers set.
 *
 * The runState provides the main lifecycle control, taking on values:
 *
 *   RUNNING:  Accept new tasks and process queued tasks
 *   SHUTDOWN: Don&#39;t accept new tasks, but process queued tasks
 *   STOP:     Don&#39;t accept new tasks, don&#39;t process queued tasks,
 *             and interrupt in-progress tasks
 *   TIDYING:  All tasks have terminated, workerCount is zero,
 *             the thread transitioning to state TIDYING
 *             will run the terminated() hook method
 *   TERMINATED: terminated() has completed
 *
 * The numerical order among these values matters, to allow
 * ordered comparisons. The runState monotonically increases over
 * time, but need not hit each state. The transitions are:
 *
 * RUNNING -&gt; SHUTDOWN
 *    On invocation of shutdown(), perhaps implicitly in finalize()
 * (RUNNING or SHUTDOWN) -&gt; STOP
 *    On invocation of shutdownNow()
 * SHUTDOWN -&gt; TIDYING
 *    When both queue and pool are empty
 * STOP -&gt; TIDYING
 *    When pool is empty
 * TIDYING -&gt; TERMINATED
 *    When the terminated() hook method has completed
 *
 * Threads waiting in awaitTermination() will return when the
 * state reaches TERMINATED.
 *
 * Detecting the transition from SHUTDOWN to TIDYING is less
 * straightforward than you&#39;d like because the queue may become
 * empty after non-empty and vice versa during SHUTDOWN state, but
 * we can only terminate if, after seeing that it is empty, we see
 * that workerCount is 0 (which sometimes entails a recheck -- see
 * below).
 */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">AtomicInteger</span> ctl <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AtomicInteger</span><span class="token punctuation">(</span><span class="token function">ctlOf</span><span class="token punctuation">(</span><span class="token constant">RUNNING</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">COUNT_BITS</span> <span class="token operator">=</span> <span class="token class-name">Integer</span><span class="token punctuation">.</span><span class="token constant">SIZE</span> <span class="token operator">-</span> <span class="token number">3</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">CAPACITY</span>   <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token comment">// runState is stored in the high-order bits</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">RUNNING</span>    <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">SHUTDOWN</span>   <span class="token operator">=</span>  <span class="token number">0</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">STOP</span>       <span class="token operator">=</span>  <span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">TIDYING</span>    <span class="token operator">=</span>  <span class="token number">2</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">TERMINATED</span> <span class="token operator">=</span>  <span class="token number">3</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span>

<span class="token comment">// Packing and unpacking ctl</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span>     <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token constant">CAPACITY</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span>  <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&amp;</span> <span class="token constant">CAPACITY</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">ctlOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> rs<span class="token punctuation">,</span> <span class="token keyword">int</span> wc<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> rs <span class="token operator">|</span> wc<span class="token punctuation">;</span> <span class="token punctuation">}</span>

<span class="token comment">/*
 * Bit field accessors that don&#39;t require unpacking ctl.
 * These depend on the bit layout and on workerCount being never negative.
 */</span>

<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">runStateLessThan</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">,</span> <span class="token keyword">int</span> s<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> c <span class="token operator">&lt;</span> s<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">runStateAtLeast</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">,</span> <span class="token keyword">int</span> s<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> c <span class="token operator">&gt;=</span> s<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">isRunning</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> c <span class="token operator">&lt;</span> <span class="token constant">SHUTDOWN</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，根据 <code>ctl</code> 域高三位的定义，线程池的状态可以为如下几种：</p><ul><li><code>RUNNING</code> - 线程池运行中，能接收新提交的任务，也能处理工作队列中的任务</li><li><code>SHUTDOWN</code> - 关闭状态，停止接收新任务，但可以继续处理工作队列中滞留的任务</li><li><code>STOP</code> - 停止状态，不接收新任务，也不处理工作队列中的任务，并中断所有正在处理中的线程</li><li><code>TIDYING</code> - 所有任务都已终止</li><li><code>TERMINATED</code></li></ul><p>在线程池正常运行 (<code>RUNNING</code>) 状态后，调用 <code>shutdown()</code> 和 <code>shutdownNow()</code> 后将分别进入 <code>SHUTDOWN</code> 或 <code>STOP</code> 状态，然后同时进入 <code>TIDYING</code> 状态。在 <code>terminated()</code> 函数结束后，线程池进入 <code>TERMINATED</code> 状态。</p><h2 id="task-scheduling" tabindex="-1"><a class="header-anchor" href="#task-scheduling" aria-hidden="true">#</a> Task Scheduling</h2><p>最核心的 <code>execute()</code> 函数实现自 <code>Executor</code> 接口，完成了线程池调度任务和核心功能。</p><ol><li>如果线程池内线程数量低于 <code>corePoolSize</code>，那么创建新的线程处理输入的任务</li><li>如果线程数量达到 <code>corePoolSize</code>，则任务进入工作队列暂存 (需要 recheck)</li><li>如果线程数量达到 <code>corePoolSize</code>，且任务无法进入工作队列 (队列已满)，则试图建立新的线程</li><li>如果无法建立新的线程 (达到 <code>maxPoolSize</code>)，那么用相应的策略拒绝任务</li></ol><p>以这个逻辑看 <code>execute()</code> 函数就很明白了：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Executes the given task sometime in the future.  The task
 * may execute in a new thread or in an existing pooled thread.
 *
 * If the task cannot be submitted for execution, either because this
 * executor has been shutdown or because its capacity has been reached,
 * the task is handled by the current <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionHandler</span></span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">command</span> the task to execute
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> at discretion of
 *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionHandler</span></span></span><span class="token punctuation">}</span>, if the task
 *         cannot be accepted for execution
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">command</span></span><span class="token punctuation">}</span> is null
 */</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> command<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>command <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/*
     * Proceed in 3 steps:
     *
     * 1. If fewer than corePoolSize threads are running, try to
     * start a new thread with the given command as its first
     * task.  The call to addWorker atomically checks runState and
     * workerCount, and so prevents false alarms that would add
     * threads when it shouldn&#39;t, by returning false.
     *
     * 2. If a task can be successfully queued, then we still need
     * to double-check whether we should have added a thread
     * (because existing ones died since last checking) or that
     * the pool shut down since entry into this method. So we
     * recheck state and if necessary roll back the enqueuing if
     * stopped, or start a new thread if there are none.
     *
     * 3. If we cannot queue task, then we try to add a new
     * thread.  If it fails, we know we are shut down or saturated
     * and so reject the task.
     */</span>
    <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&lt;</span> corePoolSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">addWorker</span><span class="token punctuation">(</span>command<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span><span class="token punctuation">;</span>
        c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">isRunning</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> workQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> recheck <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span> <span class="token function">isRunning</span><span class="token punctuation">(</span>recheck<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token function">remove</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">reject</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>recheck<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
            <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">addWorker</span><span class="token punctuation">(</span>command<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token function">reject</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="worker-management" tabindex="-1"><a class="header-anchor" href="#worker-management" aria-hidden="true">#</a> Worker Management</h2><h3 id="add-worker" tabindex="-1"><a class="header-anchor" href="#add-worker" aria-hidden="true">#</a> Add Worker</h3><p>线程池内部的工作线程被称为 worker。在上述函数中可以看到，<code>addWorker()</code> 函数负责新建线程：</p><ul><li><code>firstTask</code> - 创建线程后直接开始执行的初始任务</li><li><code>core</code> - 判断是否可以继续创建线程的标准是 <code>corePoolSize</code> 还是 <code>maximumPoolSize</code></li></ul><p>首先在一个死循环中，根据线程池的当前运行状态和线程数来决定是否可以创建新线程。成功通过 CAS 将线程数 +1 的线程将退出死循环。之后，新建一个线程，在获得线程池的 <code>mainLock</code> 锁后，将线程加入到线程池的维护中。同时还会更新 <code>largestPoolSize</code>，该变量追踪线程池达到过的最大尺寸。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Checks if a new worker can be added with respect to current
 * pool state and the given bound (either core or maximum). If so,
 * the worker count is adjusted accordingly, and, if possible, a
 * new worker is created and started, running firstTask as its
 * first task. This method returns false if the pool is stopped or
 * eligible to shut down. It also returns false if the thread
 * factory fails to create a thread when asked.  If the thread
 * creation fails, either due to the thread factory returning
 * null, or due to an exception (typically OutOfMemoryError in
 * Thread.start()), we roll back cleanly.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">firstTask</span> the task the new thread should run first (or
 * null if none). Workers are created with an initial first task
 * (in method execute()) to bypass queuing when there are fewer
 * than corePoolSize threads (in which case we always start one),
 * or when the queue is full (in which case we must bypass queue).
 * Initially idle threads are usually created via
 * prestartCoreThread or to replace other dying workers.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">core</span> if true use corePoolSize as bound, else
 * maximumPoolSize. (A boolean indicator is used here rather than a
 * value to ensure reads of fresh values after checking other pool
 * state).
 * <span class="token keyword">@return</span> true if successful
 */</span>
<span class="token keyword">private</span> <span class="token keyword">boolean</span> <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> firstTask<span class="token punctuation">,</span> <span class="token keyword">boolean</span> core<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    retry<span class="token operator">:</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Check if queue empty only if necessary.</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span>
            <span class="token operator">!</span> <span class="token punctuation">(</span>rs <span class="token operator">==</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span>
                firstTask <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span>
                <span class="token operator">!</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">int</span> wc <span class="token operator">=</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>wc <span class="token operator">&gt;=</span> <span class="token constant">CAPACITY</span> <span class="token operator">||</span>
                wc <span class="token operator">&gt;=</span> <span class="token punctuation">(</span>core <span class="token operator">?</span> corePoolSize <span class="token operator">:</span> maximumPoolSize<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndIncrementWorkerCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">break</span> retry<span class="token punctuation">;</span>
            c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// Re-read ctl</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">!=</span> rs<span class="token punctuation">)</span>
                <span class="token keyword">continue</span> retry<span class="token punctuation">;</span>
            <span class="token comment">// else CAS failed due to workerCount change; retry inner loop</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">boolean</span> workerStarted <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> workerAdded <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token class-name">Worker</span> w <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        w <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Worker</span><span class="token punctuation">(</span>firstTask<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">final</span> <span class="token class-name">Thread</span> t <span class="token operator">=</span> w<span class="token punctuation">.</span>thread<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>t <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">final</span> <span class="token class-name">ReentrantLock</span> mainLock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>mainLock<span class="token punctuation">;</span>
            mainLock<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
                <span class="token comment">// Recheck while holding lock.</span>
                <span class="token comment">// Back out on ThreadFactory failure or if</span>
                <span class="token comment">// shut down before lock acquired.</span>
                <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&lt;</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">||</span>
                    <span class="token punctuation">(</span>rs <span class="token operator">==</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span> firstTask <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>t<span class="token punctuation">.</span><span class="token function">isAlive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">// precheck that t is startable</span>
                        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalThreadStateException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">int</span> s <span class="token operator">=</span> workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">&gt;</span> largestPoolSize<span class="token punctuation">)</span>
                        largestPoolSize <span class="token operator">=</span> s<span class="token punctuation">;</span>
                    workerAdded <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                mainLock<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>workerAdded<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                t<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                workerStarted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span> workerStarted<span class="token punctuation">)</span>
            <span class="token function">addWorkerFailed</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> workerStarted<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-definition" tabindex="-1"><a class="header-anchor" href="#worker-definition" aria-hidden="true">#</a> Worker Definition</h3><p>在 worker 的具体定义中可以看到，worker 结点继承自 AQS，并且在对象内部持有一个线程与初始任务。使用 AQS 的目的是为了简化工作线程执行每个任务前后的加锁和解锁。没有使用 <code>ReentrantLock</code> 的原因是，在调用线程池控制函数时，不希望锁能被重入。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Class Worker mainly maintains interrupt control state for
 * threads running tasks, along with other minor bookkeeping.
 * This class opportunistically extends AbstractQueuedSynchronizer
 * to simplify acquiring and releasing a lock surrounding each
 * task execution.  This protects against interrupts that are
 * intended to wake up a worker thread waiting for a task from
 * instead interrupting a task being run.  We implement a simple
 * non-reentrant mutual exclusion lock rather than use
 * ReentrantLock because we do not want worker tasks to be able to
 * reacquire the lock when they invoke pool control methods like
 * setCorePoolSize.  Additionally, to suppress interrupts until
 * the thread actually starts running tasks, we initialize lock
 * state to a negative value, and clear it upon start (in
 * runWorker).
 */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">Worker</span>
    <span class="token keyword">extends</span> <span class="token class-name">AbstractQueuedSynchronizer</span>
    <span class="token keyword">implements</span> <span class="token class-name">Runnable</span>
<span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
        * This class will never be serialized, but we provide a
        * serialVersionUID to suppress a javac warning.
        */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">6138294804551838833L</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/** Thread this worker is running in.  Null if factory fails. */</span>
    <span class="token keyword">final</span> <span class="token class-name">Thread</span> thread<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/** Initial task to run.  Possibly null. */</span>
    <span class="token class-name">Runnable</span> firstTask<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/** Per-thread task counter */</span>
    <span class="token keyword">volatile</span> <span class="token keyword">long</span> completedTasks<span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-maintainess" tabindex="-1"><a class="header-anchor" href="#worker-maintainess" aria-hidden="true">#</a> Worker Maintainess</h3><p>线程池通过一个 <code>HashSet</code> 来持有所有 worker 的引用。这个集合只有在持有线程池 <code>mainLock</code> 的前提下才能被操作。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Set containing all worker threads in pool. Accessed only when
 * holding mainLock.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Worker</span><span class="token punctuation">&gt;</span></span> workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Worker</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="get-task" tabindex="-1"><a class="header-anchor" href="#get-task" aria-hidden="true">#</a> Get Task</h3><p>对每一个 worker 来说，获取任务的过程中，需要判断线程池的状态以及目前线程池中的线程数量。如下几种情况会造成 worker 的退出并返回 <code>null</code>：</p><ol><li>当前线程数超出 <code>maximumPoolSize</code></li><li>线程池被停止</li><li>线程池被关闭，且工作队列已经为空</li><li>Worker 等待任务超时，主动终结 (<code>allowCoreThreadTimeOut || workerCount &gt; corePoolSize</code>)</li></ol><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Performs blocking or timed wait for a task, depending on
 * current configuration settings, or returns null if this worker
 * must exit because of any of:
 * 1. There are more than maximumPoolSize workers (due to
 *    a call to setMaximumPoolSize).
 * 2. The pool is stopped.
 * 3. The pool is shutdown and the queue is empty.
 * 4. This worker timed out waiting for a task, and timed-out
 *    workers are subject to termination (that is,
 *    <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">allowCoreThreadTimeOut <span class="token operator">||</span> workerCount <span class="token operator">&gt;</span> corePoolSize</span></span><span class="token punctuation">}</span>)
 *    both before and after the timed wait, and if the queue is
 *    non-empty, this worker is not the last thread in the pool.
 *
 * <span class="token keyword">@return</span> task, or null if the worker must exit, in which case
 *         workerCount is decremented
 */</span>
<span class="token keyword">private</span> <span class="token class-name">Runnable</span> <span class="token function">getTask</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">boolean</span> timedOut <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span> <span class="token comment">// Did the last poll() time out?</span>

    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Check if queue empty only if necessary.</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">STOP</span> <span class="token operator">||</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">decrementWorkerCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">int</span> wc <span class="token operator">=</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// Are workers subject to culling?</span>
        <span class="token keyword">boolean</span> timed <span class="token operator">=</span> allowCoreThreadTimeOut <span class="token operator">||</span> wc <span class="token operator">&gt;</span> corePoolSize<span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>wc <span class="token operator">&gt;</span> maximumPoolSize <span class="token operator">||</span> <span class="token punctuation">(</span>timed <span class="token operator">&amp;&amp;</span> timedOut<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>wc <span class="token operator">&gt;</span> <span class="token number">1</span> <span class="token operator">||</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndDecrementWorkerCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
            <span class="token keyword">continue</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token class-name">Runnable</span> r <span class="token operator">=</span> timed <span class="token operator">?</span>
                workQueue<span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">.</span><span class="token constant">NANOSECONDS</span><span class="token punctuation">)</span> <span class="token operator">:</span>
                workQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> r<span class="token punctuation">;</span>
            timedOut <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> retry<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            timedOut <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>allowCoreThreadTimeout</code> 变量如果为 <code>true</code>，那么核心线程在空闲超过 <code>keepAliveTime</code> 后会自动终结：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Timeout in nanoseconds for idle threads waiting for work.
 * Threads use this timeout when there are more than corePoolSize
 * present or if allowCoreThreadTimeOut. Otherwise they wait
 * forever for new work.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * If false (default), core threads stay alive even when idle.
 * If true, core threads use keepAliveTime to time out waiting
 * for work.
 */</span>
<span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> allowCoreThreadTimeOut<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-main-loop" tabindex="-1"><a class="header-anchor" href="#worker-main-loop" aria-hidden="true">#</a> Worker Main Loop</h3><p>每个 worker 要执行的任务来源于两处：</p><ol><li>初始任务</li><li>工作队列</li></ol><p>在一个循环中，不断将当前任务执行完毕，然后从工作队列中获取新的任务执行。直到 worker 消亡，进行资源清理。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Main worker run loop.  Repeatedly gets tasks from queue and
 * executes them, while coping with a number of issues:
 *
 * 1. We may start out with an initial task, in which case we
 * don&#39;t need to get the first one. Otherwise, as long as pool is
 * running, we get tasks from getTask. If it returns null then the
 * worker exits due to changed pool state or configuration
 * parameters.  Other exits result from exception throws in
 * external code, in which case completedAbruptly holds, which
 * usually leads processWorkerExit to replace this thread.
 *
 * 2. Before running any task, the lock is acquired to prevent
 * other pool interrupts while the task is executing, and then we
 * ensure that unless pool is stopping, this thread does not have
 * its interrupt set.
 *
 * 3. Each task run is preceded by a call to beforeExecute, which
 * might throw an exception, in which case we cause thread to die
 * (breaking loop with completedAbruptly true) without processing
 * the task.
 *
 * 4. Assuming beforeExecute completes normally, we run the task,
 * gathering any of its thrown exceptions to send to afterExecute.
 * We separately handle RuntimeException, Error (both of which the
 * specs guarantee that we trap) and arbitrary Throwables.
 * Because we cannot rethrow Throwables within Runnable.run, we
 * wrap them within Errors on the way out (to the thread&#39;s
 * UncaughtExceptionHandler).  Any thrown exception also
 * conservatively causes thread to die.
 *
 * 5. After task.run completes, we call afterExecute, which may
 * also throw an exception, which will also cause thread to
 * die. According to JLS Sec 14.20, this exception is the one that
 * will be in effect even if task.run throws.
 *
 * The net effect of the exception mechanics is that afterExecute
 * and the thread&#39;s UncaughtExceptionHandler have as accurate
 * information as we can provide about any problems encountered by
 * user code.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">w</span> the worker
 */</span>
<span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">runWorker</span><span class="token punctuation">(</span><span class="token class-name">Worker</span> w<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Thread</span> wt <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> w<span class="token punctuation">.</span>firstTask<span class="token punctuation">;</span>
    w<span class="token punctuation">.</span>firstTask <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// allow interrupts</span>
    <span class="token keyword">boolean</span> completedAbruptly <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>task <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">||</span> <span class="token punctuation">(</span>task <span class="token operator">=</span> <span class="token function">getTask</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            w<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// If pool is stopping, ensure thread is interrupted;</span>
            <span class="token comment">// if not, ensure thread is not interrupted.  This</span>
            <span class="token comment">// requires a recheck in second case to deal with</span>
            <span class="token comment">// shutdownNow race while clearing interrupt</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">runStateAtLeast</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span> <span class="token operator">||</span>
                    <span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">interrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
                    <span class="token function">runStateAtLeast</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
                <span class="token operator">!</span>wt<span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                wt<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
                <span class="token function">beforeExecute</span><span class="token punctuation">(</span>wt<span class="token punctuation">,</span> task<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token class-name">Throwable</span> thrown <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">RuntimeException</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> x<span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Error</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> x<span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Throwable</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                    <span class="token function">afterExecute</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> thrown<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                task <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
                w<span class="token punctuation">.</span>completedTasks<span class="token operator">++</span><span class="token punctuation">;</span>
                w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        completedAbruptly <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        <span class="token function">processWorkerExit</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> completedAbruptly<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 <code>finally</code> 块中执行的 <code>processWorkerExit()</code> 对线程进行清理。将 worker 的引用从线程池中解除，并将线程完成执行的任务数统计到线程池中。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Performs cleanup and bookkeeping for a dying worker. Called
 * only from worker threads. Unless completedAbruptly is set,
 * assumes that workerCount has already been adjusted to account
 * for exit.  This method removes thread from worker set, and
 * possibly terminates the pool or replaces the worker if either
 * it exited due to user task exception or if fewer than
 * corePoolSize workers are running or queue is non-empty but
 * there are no workers.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">w</span> the worker
 * <span class="token keyword">@param</span> <span class="token parameter">completedAbruptly</span> if the worker died due to user exception
 */</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">processWorkerExit</span><span class="token punctuation">(</span><span class="token class-name">Worker</span> w<span class="token punctuation">,</span> <span class="token keyword">boolean</span> completedAbruptly<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>completedAbruptly<span class="token punctuation">)</span> <span class="token comment">// If abrupt, then workerCount wasn&#39;t adjusted</span>
        <span class="token function">decrementWorkerCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">final</span> <span class="token class-name">ReentrantLock</span> mainLock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>mainLock<span class="token punctuation">;</span>
    mainLock<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        completedTaskCount <span class="token operator">+=</span> w<span class="token punctuation">.</span>completedTasks<span class="token punctuation">;</span>
        workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
        mainLock<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token function">tryTerminate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">runStateLessThan</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>completedAbruptly<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">int</span> min <span class="token operator">=</span> allowCoreThreadTimeOut <span class="token operator">?</span> <span class="token number">0</span> <span class="token operator">:</span> corePoolSize<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>min <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                min <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&gt;=</span> min<span class="token punctuation">)</span>
                <span class="token keyword">return</span><span class="token punctuation">;</span> <span class="token comment">// replacement not needed</span>
        <span class="token punctuation">}</span>
        <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="reject-strategies" tabindex="-1"><a class="header-anchor" href="#reject-strategies" aria-hidden="true">#</a> Reject Strategies</h2><p>当线程池中的线程数量已经达到 <code>maxPoolSize</code>，且工作队列已满，此时线程池不再接收任何新任务，而是使用指定的策略拒绝调用线程。拒绝策略需要实现 <code>RejectedExecutionHandler</code> 接口，其中的 <code>rejectedExecution()</code> 函数会被线程池对象调用：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * Method that may be invoked by a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ThreadPoolExecutor</span></span><span class="token punctuation">}</span> when
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ThreadPoolExecutor</span><span class="token punctuation">#</span><span class="token field">execute</span></span> execute<span class="token punctuation">}</span> cannot accept a
 * task.  This may occur when no more threads or queue slots are
 * available because their bounds would be exceeded, or upon
 * shutdown of the Executor.
 *
 * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In the absence of other alternatives, the method may throw
 * an unchecked <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span><span class="token punctuation">}</span>, which will be
 * propagated to the caller of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span>.
 *
 * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed
 * <span class="token keyword">@param</span> <span class="token parameter">executor</span> the executor attempting to execute this task
 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> if there is no remedy
 */</span>
<span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> executor<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，线程池默认实现了四种策略：</p><ul><li><code>AbortPolicy</code> - 抛出异常，拒绝执行任务</li><li><code>DiscardPolicy</code> - 丢弃请求</li><li><code>DiscardOldestPolicy</code> - 丢弃最老的未处理请求 (工作队列队头) 并重试</li><li><code>CallerRunsPolicy</code> - 直接由调用者线程执行任务</li></ul><p>这几种策略的实现方式都还挺简单的：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">/* Predefined RejectedExecutionHandlers */</span>

<span class="token doc-comment comment">/**
 * A handler for rejected tasks that runs the rejected task
 * directly in the calling thread of the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span> method,
 * unless the executor has been shut down, in which case the task
 * is discarded.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">CallerRunsPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CallerRunsPolicy</span></span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">CallerRunsPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Executes task r in the caller&#39;s thread, unless the executor
     * has been shut down, in which case the task is discarded.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed
     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>e<span class="token punctuation">.</span><span class="token function">isShutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            r<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * A handler for rejected tasks that throws a
 * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionException</span></span></span><span class="token punctuation">}</span>.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">AbortPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * Creates an <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbortPolicy</span></span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">AbortPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Always throws RejectedExecutionException.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed
     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task
     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> always
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RejectedExecutionException</span><span class="token punctuation">(</span><span class="token string">&quot;Task &quot;</span> <span class="token operator">+</span> r<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span>
                                                <span class="token string">&quot; rejected from &quot;</span> <span class="token operator">+</span>
                                                e<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * A handler for rejected tasks that silently discards the
 * rejected task.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">DiscardPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">DiscardPolicy</span></span></span><span class="token punctuation">}</span>.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">DiscardPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Does nothing, which has the effect of discarding task r.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed
     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token doc-comment comment">/**
 * A handler for rejected tasks that discards the oldest unhandled
 * request and then retries <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span>, unless the executor
 * is shut down, in which case the task is discarded.
 */</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">DiscardOldestPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">DiscardOldestPolicy</span></span></span><span class="token punctuation">}</span> for the given executor.
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">DiscardOldestPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * Obtains and ignores the next task that the executor
     * would otherwise execute, if one is immediately available,
     * and then retries execution of task r, unless the executor
     * is shut down, in which case task r is instead discarded.
     *
     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed
     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>e<span class="token punctuation">.</span><span class="token function">isShutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            e<span class="token punctuation">.</span><span class="token function">getQueue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            e<span class="token punctuation">.</span><span class="token function">execute</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,49),y={href:"https://zhuanlan.zhihu.com/p/123328822",target:"_blank",rel:"noopener noreferrer"},f=n("hr",null,null,-1);function g(x,T){const t=a("RouterLink"),o=a("ExternalLinkIcon");return c(),i("div",null,[d,k,v,m,b,h,n("p",null,[s("线程池的实现类。由于这个类的源码和注释较多，因此决定直接根据功能分模块进行简要分析。线程池的概要可以参阅另一篇 "),e(t,{to:"/notes/Java/Java%20Thread%20Pool.html"},{default:l(()=>[s("笔记")]),_:1}),s("。")]),w,n("p",null,[n("a",y,[s("知乎专栏 - 美团技术团队 - Java 线程池实现原理及其在美团业务中的实践"),e(o)])]),f])}const j=p(r,[["render",g],["__file","Class - java.util.concurrent.ThreadPoolExecutor.html.vue"]]);export{j as default};
