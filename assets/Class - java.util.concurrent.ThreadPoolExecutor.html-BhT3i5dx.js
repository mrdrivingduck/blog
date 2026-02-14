import{_ as p,c as l,b as s,f as a,d as t,e as c,a as i,r as o,o as u}from"./app-BeHGwf2X.js";const r={};function d(k,n){const e=o("RouteLink");return u(),l("div",null,[n[3]||(n[3]=s("h1",{id:"class-java-util-concurrent-threadpoolexecutor",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#class-java-util-concurrent-threadpoolexecutor"},[s("span",null,"Class - java.util.concurrent.ThreadPoolExecutor")])],-1)),n[4]||(n[4]=s("p",null,"Created by : Mr Dk.",-1)),n[5]||(n[5]=s("p",null,"2020 / 11 / 02 21:12",-1)),n[6]||(n[6]=s("p",null,"Nanjing, Jiangsu, China",-1)),n[7]||(n[7]=s("hr",null,null,-1)),n[8]||(n[8]=s("h2",{id:"definition",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#definition"},[s("span",null,"Definition")])],-1)),s("p",null,[n[1]||(n[1]=a("线程池的实现类。由于这个类的源码和注释较多，因此决定直接根据功能分模块进行简要分析。线程池的概要可以参阅另一篇 ")),t(e,{to:"/notes/Java/Java%20Thread%20Pool.html"},{default:c(()=>n[0]||(n[0]=[a("笔记")])),_:1}),n[2]||(n[2]=a("。"))]),n[9]||(n[9]=i(`<div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ThreadPoolExecutor</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractExecutorService</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="thread-pool-life-cycle" tabindex="-1"><a class="header-anchor" href="#thread-pool-life-cycle"><span>Thread Pool Life Cycle</span></a></h2><p>线程池的运行状态由线程池对象自行维护，主要包含两个数值：</p><ul><li>线程池运行状态</li><li>线程池内的线程数量</li></ul><p>这两者共同使用一个原子 Integer 变量，其中线程池运行状态使用 <strong>高 3 位</strong>，线程池内线程数量使用 <strong>低 29 位</strong>，两个数值在变量内互相独立不干扰。共用一个变量省去了为了维护两个数值的一致性而需要占用的锁资源。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * The main pool control state, ctl, is an atomic integer packing</span>
<span class="line"> * two conceptual fields</span>
<span class="line"> *   workerCount, indicating the effective number of threads</span>
<span class="line"> *   runState,    indicating whether running, shutting down etc</span>
<span class="line"> *</span>
<span class="line"> * In order to pack them into one int, we limit workerCount to</span>
<span class="line"> * (2^29)-1 (about 500 million) threads rather than (2^31)-1 (2</span>
<span class="line"> * billion) otherwise representable. If this is ever an issue in</span>
<span class="line"> * the future, the variable can be changed to be an AtomicLong,</span>
<span class="line"> * and the shift/mask constants below adjusted. But until the need</span>
<span class="line"> * arises, this code is a bit faster and simpler using an int.</span>
<span class="line"> *</span>
<span class="line"> * The workerCount is the number of workers that have been</span>
<span class="line"> * permitted to start and not permitted to stop.  The value may be</span>
<span class="line"> * transiently different from the actual number of live threads,</span>
<span class="line"> * for example when a ThreadFactory fails to create a thread when</span>
<span class="line"> * asked, and when exiting threads are still performing</span>
<span class="line"> * bookkeeping before terminating. The user-visible pool size is</span>
<span class="line"> * reported as the current size of the workers set.</span>
<span class="line"> *</span>
<span class="line"> * The runState provides the main lifecycle control, taking on values:</span>
<span class="line"> *</span>
<span class="line"> *   RUNNING:  Accept new tasks and process queued tasks</span>
<span class="line"> *   SHUTDOWN: Don&#39;t accept new tasks, but process queued tasks</span>
<span class="line"> *   STOP:     Don&#39;t accept new tasks, don&#39;t process queued tasks,</span>
<span class="line"> *             and interrupt in-progress tasks</span>
<span class="line"> *   TIDYING:  All tasks have terminated, workerCount is zero,</span>
<span class="line"> *             the thread transitioning to state TIDYING</span>
<span class="line"> *             will run the terminated() hook method</span>
<span class="line"> *   TERMINATED: terminated() has completed</span>
<span class="line"> *</span>
<span class="line"> * The numerical order among these values matters, to allow</span>
<span class="line"> * ordered comparisons. The runState monotonically increases over</span>
<span class="line"> * time, but need not hit each state. The transitions are:</span>
<span class="line"> *</span>
<span class="line"> * RUNNING -&gt; SHUTDOWN</span>
<span class="line"> *    On invocation of shutdown(), perhaps implicitly in finalize()</span>
<span class="line"> * (RUNNING or SHUTDOWN) -&gt; STOP</span>
<span class="line"> *    On invocation of shutdownNow()</span>
<span class="line"> * SHUTDOWN -&gt; TIDYING</span>
<span class="line"> *    When both queue and pool are empty</span>
<span class="line"> * STOP -&gt; TIDYING</span>
<span class="line"> *    When pool is empty</span>
<span class="line"> * TIDYING -&gt; TERMINATED</span>
<span class="line"> *    When the terminated() hook method has completed</span>
<span class="line"> *</span>
<span class="line"> * Threads waiting in awaitTermination() will return when the</span>
<span class="line"> * state reaches TERMINATED.</span>
<span class="line"> *</span>
<span class="line"> * Detecting the transition from SHUTDOWN to TIDYING is less</span>
<span class="line"> * straightforward than you&#39;d like because the queue may become</span>
<span class="line"> * empty after non-empty and vice versa during SHUTDOWN state, but</span>
<span class="line"> * we can only terminate if, after seeing that it is empty, we see</span>
<span class="line"> * that workerCount is 0 (which sometimes entails a recheck -- see</span>
<span class="line"> * below).</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">AtomicInteger</span> ctl <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AtomicInteger</span><span class="token punctuation">(</span><span class="token function">ctlOf</span><span class="token punctuation">(</span><span class="token constant">RUNNING</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">COUNT_BITS</span> <span class="token operator">=</span> <span class="token class-name">Integer</span><span class="token punctuation">.</span><span class="token constant">SIZE</span> <span class="token operator">-</span> <span class="token number">3</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">CAPACITY</span>   <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// runState is stored in the high-order bits</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">RUNNING</span>    <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">SHUTDOWN</span>   <span class="token operator">=</span>  <span class="token number">0</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">STOP</span>       <span class="token operator">=</span>  <span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">TIDYING</span>    <span class="token operator">=</span>  <span class="token number">2</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">int</span> <span class="token constant">TERMINATED</span> <span class="token operator">=</span>  <span class="token number">3</span> <span class="token operator">&lt;&lt;</span> <span class="token constant">COUNT_BITS</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// Packing and unpacking ctl</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span>     <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&amp;</span> <span class="token operator">~</span><span class="token constant">CAPACITY</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span>  <span class="token punctuation">{</span> <span class="token keyword">return</span> c <span class="token operator">&amp;</span> <span class="token constant">CAPACITY</span><span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">int</span> <span class="token function">ctlOf</span><span class="token punctuation">(</span><span class="token keyword">int</span> rs<span class="token punctuation">,</span> <span class="token keyword">int</span> wc<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> rs <span class="token operator">|</span> wc<span class="token punctuation">;</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Bit field accessors that don&#39;t require unpacking ctl.</span>
<span class="line"> * These depend on the bit layout and on workerCount being never negative.</span>
<span class="line"> */</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">runStateLessThan</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">,</span> <span class="token keyword">int</span> s<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> c <span class="token operator">&lt;</span> s<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">runStateAtLeast</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">,</span> <span class="token keyword">int</span> s<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> c <span class="token operator">&gt;=</span> s<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">isRunning</span><span class="token punctuation">(</span><span class="token keyword">int</span> c<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> c <span class="token operator">&lt;</span> <span class="token constant">SHUTDOWN</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，根据 <code>ctl</code> 域高三位的定义，线程池的状态可以为如下几种：</p><ul><li><code>RUNNING</code> - 线程池运行中，能接收新提交的任务，也能处理工作队列中的任务</li><li><code>SHUTDOWN</code> - 关闭状态，停止接收新任务，但可以继续处理工作队列中滞留的任务</li><li><code>STOP</code> - 停止状态，不接收新任务，也不处理工作队列中的任务，并中断所有正在处理中的线程</li><li><code>TIDYING</code> - 所有任务都已终止</li><li><code>TERMINATED</code></li></ul><p>在线程池正常运行 (<code>RUNNING</code>) 状态后，调用 <code>shutdown()</code> 和 <code>shutdownNow()</code> 后将分别进入 <code>SHUTDOWN</code> 或 <code>STOP</code> 状态，然后同时进入 <code>TIDYING</code> 状态。在 <code>terminated()</code> 函数结束后，线程池进入 <code>TERMINATED</code> 状态。</p><h2 id="task-scheduling" tabindex="-1"><a class="header-anchor" href="#task-scheduling"><span>Task Scheduling</span></a></h2><p>最核心的 <code>execute()</code> 函数实现自 <code>Executor</code> 接口，完成了线程池调度任务和核心功能。</p><ol><li>如果线程池内线程数量低于 <code>corePoolSize</code>，那么创建新的线程处理输入的任务</li><li>如果线程数量达到 <code>corePoolSize</code>，则任务进入工作队列暂存 (需要 recheck)</li><li>如果线程数量达到 <code>corePoolSize</code>，且任务无法进入工作队列 (队列已满)，则试图建立新的线程</li><li>如果无法建立新的线程 (达到 <code>maxPoolSize</code>)，那么用相应的策略拒绝任务</li></ol><p>以这个逻辑看 <code>execute()</code> 函数就很明白了：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Executes the given task sometime in the future.  The task</span>
<span class="line"> * may execute in a new thread or in an existing pooled thread.</span>
<span class="line"> *</span>
<span class="line"> * If the task cannot be submitted for execution, either because this</span>
<span class="line"> * executor has been shutdown or because its capacity has been reached,</span>
<span class="line"> * the task is handled by the current <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionHandler</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">command</span> the task to execute</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> at discretion of</span>
<span class="line"> *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionHandler</span></span></span><span class="token punctuation">}</span>, if the task</span>
<span class="line"> *         cannot be accepted for execution</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">command</span></span><span class="token punctuation">}</span> is null</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> command<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>command <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">NullPointerException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Proceed in 3 steps:</span>
<span class="line">     *</span>
<span class="line">     * 1. If fewer than corePoolSize threads are running, try to</span>
<span class="line">     * start a new thread with the given command as its first</span>
<span class="line">     * task.  The call to addWorker atomically checks runState and</span>
<span class="line">     * workerCount, and so prevents false alarms that would add</span>
<span class="line">     * threads when it shouldn&#39;t, by returning false.</span>
<span class="line">     *</span>
<span class="line">     * 2. If a task can be successfully queued, then we still need</span>
<span class="line">     * to double-check whether we should have added a thread</span>
<span class="line">     * (because existing ones died since last checking) or that</span>
<span class="line">     * the pool shut down since entry into this method. So we</span>
<span class="line">     * recheck state and if necessary roll back the enqueuing if</span>
<span class="line">     * stopped, or start a new thread if there are none.</span>
<span class="line">     *</span>
<span class="line">     * 3. If we cannot queue task, then we try to add a new</span>
<span class="line">     * thread.  If it fails, we know we are shut down or saturated</span>
<span class="line">     * and so reject the task.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&lt;</span> corePoolSize<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">addWorker</span><span class="token punctuation">(</span>command<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line">        c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">isRunning</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> workQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span> recheck <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span> <span class="token function">isRunning</span><span class="token punctuation">(</span>recheck<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token function">remove</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">reject</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>recheck<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">addWorker</span><span class="token punctuation">(</span>command<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">reject</span><span class="token punctuation">(</span>command<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="worker-management" tabindex="-1"><a class="header-anchor" href="#worker-management"><span>Worker Management</span></a></h2><h3 id="add-worker" tabindex="-1"><a class="header-anchor" href="#add-worker"><span>Add Worker</span></a></h3><p>线程池内部的工作线程被称为 worker。在上述函数中可以看到，<code>addWorker()</code> 函数负责新建线程：</p><ul><li><code>firstTask</code> - 创建线程后直接开始执行的初始任务</li><li><code>core</code> - 判断是否可以继续创建线程的标准是 <code>corePoolSize</code> 还是 <code>maximumPoolSize</code></li></ul><p>首先在一个死循环中，根据线程池的当前运行状态和线程数来决定是否可以创建新线程。成功通过 CAS 将线程数 +1 的线程将退出死循环。之后，新建一个线程，在获得线程池的 <code>mainLock</code> 锁后，将线程加入到线程池的维护中。同时还会更新 <code>largestPoolSize</code>，该变量追踪线程池达到过的最大尺寸。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Checks if a new worker can be added with respect to current</span>
<span class="line"> * pool state and the given bound (either core or maximum). If so,</span>
<span class="line"> * the worker count is adjusted accordingly, and, if possible, a</span>
<span class="line"> * new worker is created and started, running firstTask as its</span>
<span class="line"> * first task. This method returns false if the pool is stopped or</span>
<span class="line"> * eligible to shut down. It also returns false if the thread</span>
<span class="line"> * factory fails to create a thread when asked.  If the thread</span>
<span class="line"> * creation fails, either due to the thread factory returning</span>
<span class="line"> * null, or due to an exception (typically OutOfMemoryError in</span>
<span class="line"> * Thread.start()), we roll back cleanly.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">firstTask</span> the task the new thread should run first (or</span>
<span class="line"> * null if none). Workers are created with an initial first task</span>
<span class="line"> * (in method execute()) to bypass queuing when there are fewer</span>
<span class="line"> * than corePoolSize threads (in which case we always start one),</span>
<span class="line"> * or when the queue is full (in which case we must bypass queue).</span>
<span class="line"> * Initially idle threads are usually created via</span>
<span class="line"> * prestartCoreThread or to replace other dying workers.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">core</span> if true use corePoolSize as bound, else</span>
<span class="line"> * maximumPoolSize. (A boolean indicator is used here rather than a</span>
<span class="line"> * value to ensure reads of fresh values after checking other pool</span>
<span class="line"> * state).</span>
<span class="line"> * <span class="token keyword">@return</span> true if successful</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">boolean</span> <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> firstTask<span class="token punctuation">,</span> <span class="token keyword">boolean</span> core<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    retry<span class="token operator">:</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// Check if queue empty only if necessary.</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token operator">!</span> <span class="token punctuation">(</span>rs <span class="token operator">==</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                firstTask <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                <span class="token operator">!</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">int</span> wc <span class="token operator">=</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>wc <span class="token operator">&gt;=</span> <span class="token constant">CAPACITY</span> <span class="token operator">||</span></span>
<span class="line">                wc <span class="token operator">&gt;=</span> <span class="token punctuation">(</span>core <span class="token operator">?</span> corePoolSize <span class="token operator">:</span> maximumPoolSize<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndIncrementWorkerCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span> retry<span class="token punctuation">;</span></span>
<span class="line">            c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// Re-read ctl</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">!=</span> rs<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">continue</span> retry<span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">// else CAS failed due to workerCount change; retry inner loop</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">boolean</span> workerStarted <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">boolean</span> workerAdded <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">Worker</span> w <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">        w <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Worker</span><span class="token punctuation">(</span>firstTask<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">final</span> <span class="token class-name">Thread</span> t <span class="token operator">=</span> w<span class="token punctuation">.</span>thread<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>t <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">final</span> <span class="token class-name">ReentrantLock</span> mainLock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>mainLock<span class="token punctuation">;</span></span>
<span class="line">            mainLock<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">// Recheck while holding lock.</span></span>
<span class="line">                <span class="token comment">// Back out on ThreadFactory failure or if</span></span>
<span class="line">                <span class="token comment">// shut down before lock acquired.</span></span>
<span class="line">                <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&lt;</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">||</span></span>
<span class="line">                    <span class="token punctuation">(</span>rs <span class="token operator">==</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span> firstTask <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>t<span class="token punctuation">.</span><span class="token function">isAlive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">// precheck that t is startable</span></span>
<span class="line">                        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalThreadStateException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">int</span> s <span class="token operator">=</span> workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token keyword">if</span> <span class="token punctuation">(</span>s <span class="token operator">&gt;</span> largestPoolSize<span class="token punctuation">)</span></span>
<span class="line">                        largestPoolSize <span class="token operator">=</span> s<span class="token punctuation">;</span></span>
<span class="line">                    workerAdded <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">                mainLock<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>workerAdded<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                t<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                workerStarted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span> workerStarted<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">addWorkerFailed</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> workerStarted<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-definition" tabindex="-1"><a class="header-anchor" href="#worker-definition"><span>Worker Definition</span></a></h3><p>在 worker 的具体定义中可以看到，worker 结点继承自 AQS，并且在对象内部持有一个线程与初始任务。使用 AQS 的目的是为了简化工作线程执行每个任务前后的加锁和解锁。没有使用 <code>ReentrantLock</code> 的原因是，在调用线程池控制函数时，不希望锁能被重入。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Class Worker mainly maintains interrupt control state for</span>
<span class="line"> * threads running tasks, along with other minor bookkeeping.</span>
<span class="line"> * This class opportunistically extends AbstractQueuedSynchronizer</span>
<span class="line"> * to simplify acquiring and releasing a lock surrounding each</span>
<span class="line"> * task execution.  This protects against interrupts that are</span>
<span class="line"> * intended to wake up a worker thread waiting for a task from</span>
<span class="line"> * instead interrupting a task being run.  We implement a simple</span>
<span class="line"> * non-reentrant mutual exclusion lock rather than use</span>
<span class="line"> * ReentrantLock because we do not want worker tasks to be able to</span>
<span class="line"> * reacquire the lock when they invoke pool control methods like</span>
<span class="line"> * setCorePoolSize.  Additionally, to suppress interrupts until</span>
<span class="line"> * the thread actually starts running tasks, we initialize lock</span>
<span class="line"> * state to a negative value, and clear it upon start (in</span>
<span class="line"> * runWorker).</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">Worker</span></span>
<span class="line">    <span class="token keyword">extends</span> <span class="token class-name">AbstractQueuedSynchronizer</span></span>
<span class="line">    <span class="token keyword">implements</span> <span class="token class-name">Runnable</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">        * This class will never be serialized, but we provide a</span>
<span class="line">        * serialVersionUID to suppress a javac warning.</span>
<span class="line">        */</span></span>
<span class="line">    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token number">6138294804551838833L</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/** Thread this worker is running in.  Null if factory fails. */</span></span>
<span class="line">    <span class="token keyword">final</span> <span class="token class-name">Thread</span> thread<span class="token punctuation">;</span></span>
<span class="line">    <span class="token doc-comment comment">/** Initial task to run.  Possibly null. */</span></span>
<span class="line">    <span class="token class-name">Runnable</span> firstTask<span class="token punctuation">;</span></span>
<span class="line">    <span class="token doc-comment comment">/** Per-thread task counter */</span></span>
<span class="line">    <span class="token keyword">volatile</span> <span class="token keyword">long</span> completedTasks<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-maintainess" tabindex="-1"><a class="header-anchor" href="#worker-maintainess"><span>Worker Maintainess</span></a></h3><p>线程池通过一个 <code>HashSet</code> 来持有所有 worker 的引用。这个集合只有在持有线程池 <code>mainLock</code> 的前提下才能被操作。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Set containing all worker threads in pool. Accessed only when</span>
<span class="line"> * holding mainLock.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Worker</span><span class="token punctuation">&gt;</span></span> workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Worker</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="get-task" tabindex="-1"><a class="header-anchor" href="#get-task"><span>Get Task</span></a></h3><p>对每一个 worker 来说，获取任务的过程中，需要判断线程池的状态以及目前线程池中的线程数量。如下几种情况会造成 worker 的退出并返回 <code>null</code>：</p><ol><li>当前线程数超出 <code>maximumPoolSize</code></li><li>线程池被停止</li><li>线程池被关闭，且工作队列已经为空</li><li>Worker 等待任务超时，主动终结 (<code>allowCoreThreadTimeOut || workerCount &gt; corePoolSize</code>)</li></ol><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Performs blocking or timed wait for a task, depending on</span>
<span class="line"> * current configuration settings, or returns null if this worker</span>
<span class="line"> * must exit because of any of:</span>
<span class="line"> * 1. There are more than maximumPoolSize workers (due to</span>
<span class="line"> *    a call to setMaximumPoolSize).</span>
<span class="line"> * 2. The pool is stopped.</span>
<span class="line"> * 3. The pool is shutdown and the queue is empty.</span>
<span class="line"> * 4. This worker timed out waiting for a task, and timed-out</span>
<span class="line"> *    workers are subject to termination (that is,</span>
<span class="line"> *    <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">allowCoreThreadTimeOut <span class="token operator">||</span> workerCount <span class="token operator">&gt;</span> corePoolSize</span></span><span class="token punctuation">}</span>)</span>
<span class="line"> *    both before and after the timed wait, and if the queue is</span>
<span class="line"> *    non-empty, this worker is not the last thread in the pool.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> task, or null if the worker must exit, in which case</span>
<span class="line"> *         workerCount is decremented</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token class-name">Runnable</span> <span class="token function">getTask</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">boolean</span> timedOut <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span> <span class="token comment">// Did the last poll() time out?</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">int</span> rs <span class="token operator">=</span> <span class="token function">runStateOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// Check if queue empty only if necessary.</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">SHUTDOWN</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>rs <span class="token operator">&gt;=</span> <span class="token constant">STOP</span> <span class="token operator">||</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">decrementWorkerCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">int</span> wc <span class="token operator">=</span> <span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// Are workers subject to culling?</span></span>
<span class="line">        <span class="token keyword">boolean</span> timed <span class="token operator">=</span> allowCoreThreadTimeOut <span class="token operator">||</span> wc <span class="token operator">&gt;</span> corePoolSize<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>wc <span class="token operator">&gt;</span> maximumPoolSize <span class="token operator">||</span> <span class="token punctuation">(</span>timed <span class="token operator">&amp;&amp;</span> timedOut<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>wc <span class="token operator">&gt;</span> <span class="token number">1</span> <span class="token operator">||</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">compareAndDecrementWorkerCount</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token class-name">Runnable</span> r <span class="token operator">=</span> timed <span class="token operator">?</span></span>
<span class="line">                workQueue<span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">.</span><span class="token constant">NANOSECONDS</span><span class="token punctuation">)</span> <span class="token operator">:</span></span>
<span class="line">                workQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>r <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span> r<span class="token punctuation">;</span></span>
<span class="line">            timedOut <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> retry<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            timedOut <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>allowCoreThreadTimeout</code> 变量如果为 <code>true</code>，那么核心线程在空闲超过 <code>keepAliveTime</code> 后会自动终结：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Timeout in nanoseconds for idle threads waiting for work.</span>
<span class="line"> * Threads use this timeout when there are more than corePoolSize</span>
<span class="line"> * present or if allowCoreThreadTimeOut. Otherwise they wait</span>
<span class="line"> * forever for new work.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * If false (default), core threads stay alive even when idle.</span>
<span class="line"> * If true, core threads use keepAliveTime to time out waiting</span>
<span class="line"> * for work.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> allowCoreThreadTimeOut<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="worker-main-loop" tabindex="-1"><a class="header-anchor" href="#worker-main-loop"><span>Worker Main Loop</span></a></h3><p>每个 worker 要执行的任务来源于两处：</p><ol><li>初始任务</li><li>工作队列</li></ol><p>在一个循环中，不断将当前任务执行完毕，然后从工作队列中获取新的任务执行。直到 worker 消亡，进行资源清理。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Main worker run loop.  Repeatedly gets tasks from queue and</span>
<span class="line"> * executes them, while coping with a number of issues:</span>
<span class="line"> *</span>
<span class="line"> * 1. We may start out with an initial task, in which case we</span>
<span class="line"> * don&#39;t need to get the first one. Otherwise, as long as pool is</span>
<span class="line"> * running, we get tasks from getTask. If it returns null then the</span>
<span class="line"> * worker exits due to changed pool state or configuration</span>
<span class="line"> * parameters.  Other exits result from exception throws in</span>
<span class="line"> * external code, in which case completedAbruptly holds, which</span>
<span class="line"> * usually leads processWorkerExit to replace this thread.</span>
<span class="line"> *</span>
<span class="line"> * 2. Before running any task, the lock is acquired to prevent</span>
<span class="line"> * other pool interrupts while the task is executing, and then we</span>
<span class="line"> * ensure that unless pool is stopping, this thread does not have</span>
<span class="line"> * its interrupt set.</span>
<span class="line"> *</span>
<span class="line"> * 3. Each task run is preceded by a call to beforeExecute, which</span>
<span class="line"> * might throw an exception, in which case we cause thread to die</span>
<span class="line"> * (breaking loop with completedAbruptly true) without processing</span>
<span class="line"> * the task.</span>
<span class="line"> *</span>
<span class="line"> * 4. Assuming beforeExecute completes normally, we run the task,</span>
<span class="line"> * gathering any of its thrown exceptions to send to afterExecute.</span>
<span class="line"> * We separately handle RuntimeException, Error (both of which the</span>
<span class="line"> * specs guarantee that we trap) and arbitrary Throwables.</span>
<span class="line"> * Because we cannot rethrow Throwables within Runnable.run, we</span>
<span class="line"> * wrap them within Errors on the way out (to the thread&#39;s</span>
<span class="line"> * UncaughtExceptionHandler).  Any thrown exception also</span>
<span class="line"> * conservatively causes thread to die.</span>
<span class="line"> *</span>
<span class="line"> * 5. After task.run completes, we call afterExecute, which may</span>
<span class="line"> * also throw an exception, which will also cause thread to</span>
<span class="line"> * die. According to JLS Sec 14.20, this exception is the one that</span>
<span class="line"> * will be in effect even if task.run throws.</span>
<span class="line"> *</span>
<span class="line"> * The net effect of the exception mechanics is that afterExecute</span>
<span class="line"> * and the thread&#39;s UncaughtExceptionHandler have as accurate</span>
<span class="line"> * information as we can provide about any problems encountered by</span>
<span class="line"> * user code.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">w</span> the worker</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">runWorker</span><span class="token punctuation">(</span><span class="token class-name">Worker</span> w<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token class-name">Thread</span> wt <span class="token operator">=</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> w<span class="token punctuation">.</span>firstTask<span class="token punctuation">;</span></span>
<span class="line">    w<span class="token punctuation">.</span>firstTask <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">    w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// allow interrupts</span></span>
<span class="line">    <span class="token keyword">boolean</span> completedAbruptly <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">while</span> <span class="token punctuation">(</span>task <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">||</span> <span class="token punctuation">(</span>task <span class="token operator">=</span> <span class="token function">getTask</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            w<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token comment">// If pool is stopping, ensure thread is interrupted;</span></span>
<span class="line">            <span class="token comment">// if not, ensure thread is not interrupted.  This</span></span>
<span class="line">            <span class="token comment">// requires a recheck in second case to deal with</span></span>
<span class="line">            <span class="token comment">// shutdownNow race while clearing interrupt</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token function">runStateAtLeast</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span> <span class="token operator">||</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">interrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                    <span class="token function">runStateAtLeast</span><span class="token punctuation">(</span>ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">                <span class="token operator">!</span>wt<span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                wt<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">beforeExecute</span><span class="token punctuation">(</span>wt<span class="token punctuation">,</span> task<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token class-name">Throwable</span> thrown <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">                    task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">RuntimeException</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> x<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Error</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> x<span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Throwable</span> x<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    thrown <span class="token operator">=</span> x<span class="token punctuation">;</span> <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token function">afterExecute</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> thrown<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line">            <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">                task <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span></span>
<span class="line">                w<span class="token punctuation">.</span>completedTasks<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">                w<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        completedAbruptly <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">processWorkerExit</span><span class="token punctuation">(</span>w<span class="token punctuation">,</span> completedAbruptly<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 <code>finally</code> 块中执行的 <code>processWorkerExit()</code> 对线程进行清理。将 worker 的引用从线程池中解除，并将线程完成执行的任务数统计到线程池中。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Performs cleanup and bookkeeping for a dying worker. Called</span>
<span class="line"> * only from worker threads. Unless completedAbruptly is set,</span>
<span class="line"> * assumes that workerCount has already been adjusted to account</span>
<span class="line"> * for exit.  This method removes thread from worker set, and</span>
<span class="line"> * possibly terminates the pool or replaces the worker if either</span>
<span class="line"> * it exited due to user task exception or if fewer than</span>
<span class="line"> * corePoolSize workers are running or queue is non-empty but</span>
<span class="line"> * there are no workers.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">w</span> the worker</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">completedAbruptly</span> if the worker died due to user exception</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">processWorkerExit</span><span class="token punctuation">(</span><span class="token class-name">Worker</span> w<span class="token punctuation">,</span> <span class="token keyword">boolean</span> completedAbruptly<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>completedAbruptly<span class="token punctuation">)</span> <span class="token comment">// If abrupt, then workerCount wasn&#39;t adjusted</span></span>
<span class="line">        <span class="token function">decrementWorkerCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">final</span> <span class="token class-name">ReentrantLock</span> mainLock <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>mainLock<span class="token punctuation">;</span></span>
<span class="line">    mainLock<span class="token punctuation">.</span><span class="token function">lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">try</span> <span class="token punctuation">{</span></span>
<span class="line">        completedTaskCount <span class="token operator">+=</span> w<span class="token punctuation">.</span>completedTasks<span class="token punctuation">;</span></span>
<span class="line">        workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>w<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span></span>
<span class="line">        mainLock<span class="token punctuation">.</span><span class="token function">unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">tryTerminate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">int</span> c <span class="token operator">=</span> ctl<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">runStateLessThan</span><span class="token punctuation">(</span>c<span class="token punctuation">,</span> <span class="token constant">STOP</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>completedAbruptly<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">int</span> min <span class="token operator">=</span> allowCoreThreadTimeOut <span class="token operator">?</span> <span class="token number">0</span> <span class="token operator">:</span> corePoolSize<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>min <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span> workQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                min <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">workerCountOf</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token operator">&gt;=</span> min<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">return</span><span class="token punctuation">;</span> <span class="token comment">// replacement not needed</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token function">addWorker</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="reject-strategies" tabindex="-1"><a class="header-anchor" href="#reject-strategies"><span>Reject Strategies</span></a></h2><p>当线程池中的线程数量已经达到 <code>maxPoolSize</code>，且工作队列已满，此时线程池不再接收任何新任务，而是使用指定的策略拒绝调用线程。拒绝策略需要实现 <code>RejectedExecutionHandler</code> 接口，其中的 <code>rejectedExecution()</code> 函数会被线程池对象调用：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Method that may be invoked by a <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ThreadPoolExecutor</span></span><span class="token punctuation">}</span> when</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ThreadPoolExecutor</span><span class="token punctuation">#</span><span class="token field">execute</span></span> execute<span class="token punctuation">}</span> cannot accept a</span>
<span class="line"> * task.  This may occur when no more threads or queue slots are</span>
<span class="line"> * available because their bounds would be exceeded, or upon</span>
<span class="line"> * shutdown of the Executor.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>In the absence of other alternatives, the method may throw</span>
<span class="line"> * an unchecked <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span><span class="token punctuation">}</span>, which will be</span>
<span class="line"> * propagated to the caller of <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span>.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">executor</span> the executor attempting to execute this task</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> if there is no remedy</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> executor<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，线程池默认实现了四种策略：</p><ul><li><code>AbortPolicy</code> - 抛出异常，拒绝执行任务</li><li><code>DiscardPolicy</code> - 丢弃请求</li><li><code>DiscardOldestPolicy</code> - 丢弃最老的未处理请求 (工作队列队头) 并重试</li><li><code>CallerRunsPolicy</code> - 直接由调用者线程执行任务</li></ul><p>这几种策略的实现方式都还挺简单的：</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token comment">/* Predefined RejectedExecutionHandlers */</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A handler for rejected tasks that runs the rejected task</span>
<span class="line"> * directly in the calling thread of the <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span> method,</span>
<span class="line"> * unless the executor has been shut down, in which case the task</span>
<span class="line"> * is discarded.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">CallerRunsPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CallerRunsPolicy</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">CallerRunsPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Executes task r in the caller&#39;s thread, unless the executor</span>
<span class="line">     * has been shut down, in which case the task is discarded.</span>
<span class="line">     *</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>e<span class="token punctuation">.</span><span class="token function">isShutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            r<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A handler for rejected tasks that throws a</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">RejectedExecutionException</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">AbortPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Creates an <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">AbortPolicy</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">AbortPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Always throws RejectedExecutionException.</span>
<span class="line">     *</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task</span>
<span class="line">     * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> always</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RejectedExecutionException</span><span class="token punctuation">(</span><span class="token string">&quot;Task &quot;</span> <span class="token operator">+</span> r<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span></span>
<span class="line">                                                <span class="token string">&quot; rejected from &quot;</span> <span class="token operator">+</span></span>
<span class="line">                                                e<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A handler for rejected tasks that silently discards the</span>
<span class="line"> * rejected task.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">DiscardPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">DiscardPolicy</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">DiscardPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Does nothing, which has the effect of discarding task r.</span>
<span class="line">     *</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A handler for rejected tasks that discards the oldest unhandled</span>
<span class="line"> * request and then retries <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">execute</span></span><span class="token punctuation">}</span>, unless the executor</span>
<span class="line"> * is shut down, in which case the task is discarded.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">DiscardOldestPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Creates a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">DiscardOldestPolicy</span></span></span><span class="token punctuation">}</span> for the given executor.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token class-name">DiscardOldestPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token doc-comment comment">/**</span>
<span class="line">     * Obtains and ignores the next task that the executor</span>
<span class="line">     * would otherwise execute, if one is immediately available,</span>
<span class="line">     * and then retries execution of task r, unless the executor</span>
<span class="line">     * is shut down, in which case task r is instead discarded.</span>
<span class="line">     *</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">r</span> the runnable task requested to be executed</span>
<span class="line">     * <span class="token keyword">@param</span> <span class="token parameter">e</span> the executor attempting to execute this task</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> r<span class="token punctuation">,</span> <span class="token class-name">ThreadPoolExecutor</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>e<span class="token punctuation">.</span><span class="token function">isShutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            e<span class="token punctuation">.</span><span class="token function">getQueue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            e<span class="token punctuation">.</span><span class="token function">execute</span><span class="token punctuation">(</span>r<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://zhuanlan.zhihu.com/p/123328822" target="_blank" rel="noopener noreferrer">知乎专栏 - 美团技术团队 - Java 线程池实现原理及其在美团业务中的实践</a></p><hr>`,51))])}const m=p(r,[["render",d],["__file","Class - java.util.concurrent.ThreadPoolExecutor.html.vue"]]),b=JSON.parse('{"path":"/jdk-source-code-analysis/java.util.concurrent/Class%20-%20java.util.concurrent.ThreadPoolExecutor.html","title":"Class - java.util.concurrent.ThreadPoolExecutor","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Thread Pool Life Cycle","slug":"thread-pool-life-cycle","link":"#thread-pool-life-cycle","children":[]},{"level":2,"title":"Task Scheduling","slug":"task-scheduling","link":"#task-scheduling","children":[]},{"level":2,"title":"Worker Management","slug":"worker-management","link":"#worker-management","children":[{"level":3,"title":"Add Worker","slug":"add-worker","link":"#add-worker","children":[]},{"level":3,"title":"Worker Definition","slug":"worker-definition","link":"#worker-definition","children":[]},{"level":3,"title":"Worker Maintainess","slug":"worker-maintainess","link":"#worker-maintainess","children":[]},{"level":3,"title":"Get Task","slug":"get-task","link":"#get-task","children":[]},{"level":3,"title":"Worker Main Loop","slug":"worker-main-loop","link":"#worker-main-loop","children":[]}]},{"level":2,"title":"Reject Strategies","slug":"reject-strategies","link":"#reject-strategies","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.util.concurrent/Class - java.util.concurrent.ThreadPoolExecutor.md"}');export{m as comp,b as data};
