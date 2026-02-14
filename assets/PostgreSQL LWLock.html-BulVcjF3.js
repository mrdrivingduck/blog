import{_ as i,c as t,b as s,f as a,d as p,e as l,a as c,r as o,o as u}from"./app-BeHGwf2X.js";const r={};function d(k,n){const e=o("RouteLink");return u(),t("div",null,[n[5]||(n[5]=s("h1",{id:"postgresql-lwlock",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#postgresql-lwlock"},[s("span",null,"PostgreSQL - LWLock")])],-1)),n[6]||(n[6]=s("p",null,"Created by: Mr Dk.",-1)),n[7]||(n[7]=s("p",null,"2023 / 11 / 29 16:40",-1)),n[8]||(n[8]=s("p",null,"Hangzhou, Zhejiang, China",-1)),n[9]||(n[9]=s("hr",null,null,-1)),n[10]||(n[10]=s("h2",{id:"background",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#background"},[s("span",null,"Background")])],-1)),s("p",null,[n[2]||(n[2]=a("PostgreSQL 中的轻量级锁 LWLock（Light Weight Lock）用于互斥访问共享内存中的数据结构。与 ")),p(e,{to:"/notes/PostgreSQL/PostgreSQL%20Atomics.html"},{default:l(()=>n[0]||(n[0]=[a("原子操作")])),_:1}),n[3]||(n[3]=a(" 和 ")),p(e,{to:"/notes/PostgreSQL/PostgreSQL%20Spinlock.html"},{default:l(()=>n[1]||(n[1]=[a("自旋锁")])),_:1}),n[4]||(n[4]=a(" 不同，LWLock 引入了读写访问模式，使其可以被不同进程共享访问或排它访问。实际上 LWLock 就是结合原子操作和自旋实现的，也引入了信号量。另外 LWLock 也支持对某个共享变量的值进行修改和监视，但应用场景相对较少。"))]),n[11]||(n[11]=c(`<p>本文基于 PostgreSQL <code>master</code> 分支（PostgreSQL 17 under dev）当前的 <code>HEAD</code> 版本分析原子操作的实现：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit 15c9ac3629936a9bb5010155d3656e913027ccb7</span>
<span class="line">Author: Thomas Munro &lt;tmunro@postgresql.org&gt;</span>
<span class="line">Date:   Wed Nov 29 16:44:19 2023 +1300</span>
<span class="line"></span>
<span class="line">    Optimize pg_readv/pg_pwritev single vector case.</span>
<span class="line"></span>
<span class="line">    For the trivial case of iovcnt == 1, kernels are measurably slower at</span>
<span class="line">    dealing with the more complex arguments of preadv/pwritev than the</span>
<span class="line">    equivalent plain old pread/pwrite.  The overheads are worth it for</span>
<span class="line">    iovcnt &gt; 1, but for 1 let&#39;s just redirect to the cheaper calls.  While</span>
<span class="line">    we could leave it to callers to worry about that, we already have to</span>
<span class="line">    have our own pg_ wrappers for portability reasons so it seems</span>
<span class="line">    reasonable to centralize this knowledge there (thanks to Heikki for this</span>
<span class="line">    suggestion).  Try to avoid function call overheads by making them</span>
<span class="line">    inlinable, which might also allow the compiler to avoid the branch in</span>
<span class="line">    some cases.  For systems that don&#39;t have preadv and pwritev (currently:</span>
<span class="line">    Windows and [closed] Solaris), we might as well pull the replacement</span>
<span class="line">    functions up into the static inline functions too.</span>
<span class="line"></span>
<span class="line">    Reviewed-by: Heikki Linnakangas &lt;hlinnaka@iki.fi&gt;</span>
<span class="line">    Discussion: https://postgr.es/m/CA+hUKGJkOiOCa+mag4BF+zHo7qo=o9CFheB8=g6uT5TUm2gkvA@mail.gmail.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="data-structure-and-states" tabindex="-1"><a class="header-anchor" href="#data-structure-and-states"><span>Data Structure And States</span></a></h2><p>LWLock 的数据结构如下：</p><ul><li><code>tranche</code>：每种 LWLock 预定义 id，每个 id 都对应一个锁名称</li><li><code>state</code>：32 位的原子变量，表示锁状态</li><li><code>waiters</code>：双向链表，链接了正在等待当前锁的进程 <code>PGPROC</code></li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Code outside of lwlock.c should not manipulate the contents of this</span>
<span class="line"> * structure directly, but we have to declare it here to allow LWLocks to be</span>
<span class="line"> * incorporated into other data structures.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">LWLock</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint16      tranche<span class="token punctuation">;</span>        <span class="token comment">/* tranche ID */</span></span>
<span class="line">    pg_atomic_uint32 state<span class="token punctuation">;</span>     <span class="token comment">/* state of exclusive/nonexclusive lockers */</span></span>
<span class="line">    proclist_head waiters<span class="token punctuation">;</span>      <span class="token comment">/* list of waiting PGPROCs */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LOCK_DEBUG</span></span></span>
<span class="line">    pg_atomic_uint32 nwaiters<span class="token punctuation">;</span>  <span class="token comment">/* number of waiters */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">PGPROC</span> <span class="token operator">*</span>owner<span class="token punctuation">;</span>       <span class="token comment">/* last exclusive owner of the lock */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span> LWLock<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>LWLock 的锁模式：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">LWLockMode</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LW_EXCLUSIVE<span class="token punctuation">,</span></span>
<span class="line">    LW_SHARED<span class="token punctuation">,</span></span>
<span class="line">    LW_WAIT_UNTIL_FREE<span class="token punctuation">,</span>         <span class="token comment">/* A special mode used in PGPROC-&gt;lwWaitMode,</span>
<span class="line">                                 * when waiting for lock to become free. Not</span>
<span class="line">                                 * to be used as LWLockAcquire argument */</span></span>
<span class="line"><span class="token punctuation">}</span> LWLockMode<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>LWLock 的锁状态位：</p><ul><li><code>LW_FLAG_HAS_WAITERS</code>：是否存在等待进程</li><li><code>LW_FLAG_RELEASE_OK</code>：在释放锁时立刻唤醒等待进程</li><li><code>LW_FLAG_LOCKED</code>：正在修改 LWLock 内的等待进程列表</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">LW_FLAG_HAS_WAITERS</span>         <span class="token expression"><span class="token punctuation">(</span><span class="token punctuation">(</span>uint32<span class="token punctuation">)</span> <span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token number">30</span><span class="token punctuation">)</span></span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">LW_FLAG_RELEASE_OK</span>          <span class="token expression"><span class="token punctuation">(</span><span class="token punctuation">(</span>uint32<span class="token punctuation">)</span> <span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token number">29</span><span class="token punctuation">)</span></span></span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">LW_FLAG_LOCKED</span>              <span class="token expression"><span class="token punctuation">(</span><span class="token punctuation">(</span>uint32<span class="token punctuation">)</span> <span class="token number">1</span> <span class="token operator">&lt;&lt;</span> <span class="token number">28</span><span class="token punctuation">)</span></span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="operations" tabindex="-1"><a class="header-anchor" href="#operations"><span>Operations</span></a></h2><h3 id="initialization" tabindex="-1"><a class="header-anchor" href="#initialization"><span>Initialization</span></a></h3><p>对 LWLock 初始化工作包含：赋值锁 id，将锁状态初始化为 0 并设置 <code>LW_FLAG_RELEASE_OK</code> 标志位，初始化锁的等待链表：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * LWLockInitialize - initialize a new lwlock; it&#39;s initially unlocked</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockInitialize</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">,</span> <span class="token keyword">int</span> tranche_id<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">pg_atomic_init_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_FLAG_RELEASE_OK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LOCK_DEBUG</span></span></span>
<span class="line">    <span class="token function">pg_atomic_init_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>nwaiters<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line">    lock<span class="token operator">-&gt;</span>tranche <span class="token operator">=</span> tranche_id<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">proclist_init</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>waiters<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="lock-up" tabindex="-1"><a class="header-anchor" href="#lock-up"><span>Lock Up</span></a></h3><p>以指定的锁模式对 LWLock 上锁。虽然锁模式的定义中除了 <code>LW_EXCLUSIVE</code> / <code>LW_SHARED</code> 以外还有 <code>LW_WAIT_UNTIL_FREE</code>，但这里只允许以前两种模式作为参数上锁。这也是被其它模块使用得最多的函数。</p><p>首先，在开始操作共享内存之前需要先屏蔽中断，防止中断信号处理函数干扰。然后进入一个循环中：</p><ol><li>原子地试图获取一次锁，如果成功，那么返回</li><li>原子地把进程自己的 <code>PGPROC</code> 结构原子地加入到锁的等待列表中</li><li>再原子地试图获取一次锁，如果成功，那么把当前进程从等待列表中移除并返回</li><li>阻塞在信号量上等待被唤醒，被唤醒后重试</li></ol><p>获得锁以后，释放阻塞过程中锁住的所有信号量并返回。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * LWLockAcquire - acquire a lightweight lock in the specified mode</span>
<span class="line"> *</span>
<span class="line"> * If the lock is not available, sleep until it is.  Returns true if the lock</span>
<span class="line"> * was available immediately, false if we had to sleep.</span>
<span class="line"> *</span>
<span class="line"> * Side effect: cancel/die interrupts are held off until lock release.</span>
<span class="line"> */</span></span>
<span class="line">bool</span>
<span class="line"><span class="token function">LWLockAcquire</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">,</span> LWLockMode mode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PGPROC     <span class="token operator">*</span>proc <span class="token operator">=</span> MyProc<span class="token punctuation">;</span></span>
<span class="line">    bool        result <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         extraWaits <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">    lwlock_stats <span class="token operator">*</span>lwstats<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    lwstats <span class="token operator">=</span> <span class="token function">get_lwlock_stats_entry</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_SHARED <span class="token operator">||</span> mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">PRINT_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">    <span class="token comment">/* Count lock acquisition attempts */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">        lwstats<span class="token operator">-&gt;</span>ex_acquire_count<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        lwstats<span class="token operator">-&gt;</span>sh_acquire_count<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span>                          <span class="token comment">/* LWLOCK_STATS */</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We can&#39;t wait if we haven&#39;t got a PGPROC.  This should only occur</span>
<span class="line">     * during bootstrap or shared memory initialization.  Put an Assert here</span>
<span class="line">     * to catch unsafe coding practices.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>proc <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> IsUnderPostmaster<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Ensure we will have room to remember the lock */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>num_held_lwlocks <span class="token operator">&gt;=</span> MAX_SIMUL_LWLOCKS<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;too many LWLocks taken&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Lock out cancel/die interrupts until we exit the code section protected</span>
<span class="line">     * by the LWLock.  This ensures that interrupts will not interfere with</span>
<span class="line">     * manipulations of data structures in shared memory.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">HOLD_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Loop here to try to acquire lock after each time we are signaled by</span>
<span class="line">     * LWLockRelease.</span>
<span class="line">     *</span>
<span class="line">     * NOTE: it might seem better to have LWLockRelease actually grant us the</span>
<span class="line">     * lock, rather than retrying and possibly having to go back to sleep. But</span>
<span class="line">     * in practice that is no good because it means a process swap for every</span>
<span class="line">     * lock acquisition when two or more processes are contending for the same</span>
<span class="line">     * lock.  Since LWLocks are normally used to protect not-very-long</span>
<span class="line">     * sections of computation, a process needs to be able to acquire and</span>
<span class="line">     * release the same lock many times during a single CPU time slice, even</span>
<span class="line">     * in the presence of contention.  The efficiency of being able to do that</span>
<span class="line">     * outweighs the inefficiency of sometimes wasting a process dispatch</span>
<span class="line">     * cycle because the lock is not free when a released waiter finally gets</span>
<span class="line">     * to run.  See pgsql-hackers archives for 29-Dec-01.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        bool        mustwait<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Try to grab the lock the first time, we&#39;re not in the waitqueue</span>
<span class="line">         * yet/anymore.</span>
<span class="line">         */</span></span>
<span class="line">        mustwait <span class="token operator">=</span> <span class="token function">LWLockAttemptLock</span><span class="token punctuation">(</span>lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>mustwait<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;immediately acquired lock&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span>              <span class="token comment">/* got the lock */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Ok, at this point we couldn&#39;t grab the lock on the first try. We</span>
<span class="line">         * cannot simply queue ourselves to the end of the list and wait to be</span>
<span class="line">         * woken up because by now the lock could long have been released.</span>
<span class="line">         * Instead add us to the queue and try to grab the lock again. If we</span>
<span class="line">         * succeed we need to revert the queuing and be happy, otherwise we</span>
<span class="line">         * recheck the lock. If we still couldn&#39;t grab it, we know that the</span>
<span class="line">         * other locker will see our queue entries when releasing since they</span>
<span class="line">         * existed before we checked for the lock.</span>
<span class="line">         */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* add to the queue */</span></span>
<span class="line">        <span class="token function">LWLockQueueSelf</span><span class="token punctuation">(</span>lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* we&#39;re now guaranteed to be woken up if necessary */</span></span>
<span class="line">        mustwait <span class="token operator">=</span> <span class="token function">LWLockAttemptLock</span><span class="token punctuation">(</span>lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* ok, grabbed the lock the second time round, need to undo queueing */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>mustwait<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;acquired, undoing queue&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">LWLockDequeueSelf</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Wait until awakened.</span>
<span class="line">         *</span>
<span class="line">         * It is possible that we get awakened for a reason other than being</span>
<span class="line">         * signaled by LWLockRelease.  If so, loop back and wait again.  Once</span>
<span class="line">         * we&#39;ve gotten the LWLock, re-increment the sema by the number of</span>
<span class="line">         * additional signals received.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;waiting&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">        lwstats<span class="token operator">-&gt;</span>block_count<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">        <span class="token function">LWLockReportWaitStart</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_WAIT_START_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">TRACE_POSTGRESQL_LWLOCK_WAIT_START</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token function">PGSemaphoreLock</span><span class="token punctuation">(</span>proc<span class="token operator">-&gt;</span>sem<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>proc<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">==</span> LW_WS_NOT_WAITING<span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">            extraWaits<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Retrying, allow LWLockRelease to release waiters again. */</span></span>
<span class="line">        <span class="token function">pg_atomic_fetch_or_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_FLAG_RELEASE_OK<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LOCK_DEBUG</span></span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/* not waiting anymore */</span></span>
<span class="line">            uint32      nwaiters PG_USED_FOR_ASSERTS_ONLY <span class="token operator">=</span> <span class="token function">pg_atomic_fetch_sub_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>nwaiters<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">Assert</span><span class="token punctuation">(</span>nwaiters <span class="token operator">&lt;</span> MAX_BACKENDS<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_WAIT_DONE_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">TRACE_POSTGRESQL_LWLOCK_WAIT_DONE</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">LWLockReportWaitEnd</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;awakened&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Now loop back and try to acquire lock again. */</span></span>
<span class="line">        result <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_ACQUIRE_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">TRACE_POSTGRESQL_LWLOCK_ACQUIRE</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Add lock to list of locks held by this backend */</span></span>
<span class="line">    held_lwlocks<span class="token punctuation">[</span>num_held_lwlocks<span class="token punctuation">]</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> lock<span class="token punctuation">;</span></span>
<span class="line">    held_lwlocks<span class="token punctuation">[</span>num_held_lwlocks<span class="token operator">++</span><span class="token punctuation">]</span><span class="token punctuation">.</span>mode <span class="token operator">=</span> mode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Fix the process wait semaphore&#39;s count for any absorbed wakeups.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>extraWaits<span class="token operator">--</span> <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">PGSemaphoreUnlock</span><span class="token punctuation">(</span>proc<span class="token operator">-&gt;</span>sem<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，原子地尝试上锁的逻辑是纯 CPU 操作：</p><ol><li>原子地读取共享内存中的锁状态</li><li>根据锁状态和当前要上锁的模式决定能否上锁，如果可以的话，修改锁状态</li><li>将修改后（也可能是没修改）的锁状态通过 CAS 交换到共享内存中的锁状态内存地址上</li><li>如果没能成功 CAS，则回到 1 重新做；如果成功，则根据锁状态和模式返回是否需要重试加锁</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Internal function that tries to atomically acquire the lwlock in the passed</span>
<span class="line"> * in mode.</span>
<span class="line"> *</span>
<span class="line"> * This function will not block waiting for a lock to become free - that&#39;s the</span>
<span class="line"> * callers job.</span>
<span class="line"> *</span>
<span class="line"> * Returns true if the lock isn&#39;t free and we need to wait.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">LWLockAttemptLock</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">,</span> LWLockMode mode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint32      old_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_EXCLUSIVE <span class="token operator">||</span> mode <span class="token operator">==</span> LW_SHARED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Read once outside the loop, later iterations will get the newer value</span>
<span class="line">     * via compare &amp; exchange.</span>
<span class="line">     */</span></span>
<span class="line">    old_state <span class="token operator">=</span> <span class="token function">pg_atomic_read_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* loop until we&#39;ve determined whether we could acquire the lock or not */</span></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>true<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        uint32      desired_state<span class="token punctuation">;</span></span>
<span class="line">        bool        lock_free<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        desired_state <span class="token operator">=</span> old_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            lock_free <span class="token operator">=</span> <span class="token punctuation">(</span>old_state <span class="token operator">&amp;</span> LW_LOCK_MASK<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>lock_free<span class="token punctuation">)</span></span>
<span class="line">                desired_state <span class="token operator">+=</span> LW_VAL_EXCLUSIVE<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            lock_free <span class="token operator">=</span> <span class="token punctuation">(</span>old_state <span class="token operator">&amp;</span> LW_VAL_EXCLUSIVE<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>lock_free<span class="token punctuation">)</span></span>
<span class="line">                desired_state <span class="token operator">+=</span> LW_VAL_SHARED<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Attempt to swap in the state we are expecting. If we didn&#39;t see</span>
<span class="line">         * lock to be free, that&#39;s just the old value. If we saw it as free,</span>
<span class="line">         * we&#39;ll attempt to mark it acquired. The reason that we always swap</span>
<span class="line">         * in the value is that this doubles as a memory barrier. We could try</span>
<span class="line">         * to be smarter and only swap in values if we saw the lock as free,</span>
<span class="line">         * but benchmark haven&#39;t shown it as beneficial so far.</span>
<span class="line">         *</span>
<span class="line">         * Retry if the value changed since we last looked at it.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">pg_atomic_compare_exchange_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span></span>
<span class="line">                                           <span class="token operator">&amp;</span>old_state<span class="token punctuation">,</span> desired_state<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>lock_free<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/* Great! Got the lock. */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LOCK_DEBUG</span></span></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">                    lock<span class="token operator">-&gt;</span>owner <span class="token operator">=</span> MyProc<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line">                <span class="token keyword">return</span> false<span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                <span class="token keyword">return</span> true<span class="token punctuation">;</span>    <span class="token comment">/* somebody else has the lock */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token function">pg_unreachable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>把当前进程加入到锁的等待列表中包含三个步骤：</p><ol><li>对等待队列加锁（原子操作 + 自旋）</li><li>将当前进程加入到等待队列中</li><li>对等待队列解锁（原子操作）</li></ol><p>把当前进程从等待列表中移除的流程类似，不再赘述。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Add ourselves to the end of the queue.</span>
<span class="line"> *</span>
<span class="line"> * NB: Mode can be LW_WAIT_UNTIL_FREE here!</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockQueueSelf</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">,</span> LWLockMode mode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If we don&#39;t have a PGPROC structure, there&#39;s no way to wait. This</span>
<span class="line">     * should never occur, since MyProc should only be null during shared</span>
<span class="line">     * memory initialization.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>MyProc <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>PANIC<span class="token punctuation">,</span> <span class="token string">&quot;cannot wait without a PGPROC structure&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>MyProc<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">!=</span> LW_WS_NOT_WAITING<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>PANIC<span class="token punctuation">,</span> <span class="token string">&quot;queueing for lock while waiting on another one&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">LWLockWaitListLock</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* setting the flag is protected by the spinlock */</span></span>
<span class="line">    <span class="token function">pg_atomic_fetch_or_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_FLAG_HAS_WAITERS<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    MyProc<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">=</span> LW_WS_WAITING<span class="token punctuation">;</span></span>
<span class="line">    MyProc<span class="token operator">-&gt;</span>lwWaitMode <span class="token operator">=</span> mode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* LW_WAIT_UNTIL_FREE waiters are always at the front of the queue */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_WAIT_UNTIL_FREE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">proclist_push_head</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>waiters<span class="token punctuation">,</span> MyProc<span class="token operator">-&gt;</span>pgprocno<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        <span class="token function">proclist_push_tail</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>waiters<span class="token punctuation">,</span> MyProc<span class="token operator">-&gt;</span>pgprocno<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Can release the mutex now */</span></span>
<span class="line">    <span class="token function">LWLockWaitListUnlock</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LOCK_DEBUG</span></span></span>
<span class="line">    <span class="token function">pg_atomic_fetch_add_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>nwaiters<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对等待队列加锁的操作类似于自旋锁的实现，通过尝试、随机退避，将 <code>LW_FLAG_LOCKED</code> 设置到共享内存里的锁状态上：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Lock the LWLock&#39;s wait list against concurrent activity.</span>
<span class="line"> *</span>
<span class="line"> * NB: even though the wait list is locked, non-conflicting lock operations</span>
<span class="line"> * may still happen concurrently.</span>
<span class="line"> *</span>
<span class="line"> * Time spent holding mutex should be short!</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockWaitListLock</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint32      old_state<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">    lwlock_stats <span class="token operator">*</span>lwstats<span class="token punctuation">;</span></span>
<span class="line">    uint32      delays <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    lwstats <span class="token operator">=</span> <span class="token function">get_lwlock_stats_entry</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">while</span> <span class="token punctuation">(</span>true<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* always try once to acquire lock directly */</span></span>
<span class="line">        old_state <span class="token operator">=</span> <span class="token function">pg_atomic_fetch_or_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_FLAG_LOCKED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>old_state <span class="token operator">&amp;</span> LW_FLAG_LOCKED<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span>              <span class="token comment">/* got lock */</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* and then spin without atomic operations until lock is released */</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            SpinDelayStatus delayStatus<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">init_local_spin_delay</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>delayStatus<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">while</span> <span class="token punctuation">(</span>old_state <span class="token operator">&amp;</span> LW_FLAG_LOCKED<span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token function">perform_spin_delay</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>delayStatus<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                old_state <span class="token operator">=</span> <span class="token function">pg_atomic_read_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">            delays <span class="token operator">+=</span> delayStatus<span class="token punctuation">.</span>delays<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line">            <span class="token function">finish_spin_delay</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>delayStatus<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Retry. The lock might obviously already be re-acquired by the time</span>
<span class="line">         * we&#39;re attempting to get it again.</span>
<span class="line">         */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">LWLOCK_STATS</span></span></span>
<span class="line">    lwstats<span class="token operator">-&gt;</span>spin_delay_count <span class="token operator">+=</span> delays<span class="token punctuation">;</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对等待队列解锁相对来说简单些，原子地将 <code>LW_FLAG_LOCKED</code> 复位即可：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Unlock the LWLock&#39;s wait list.</span>
<span class="line"> *</span>
<span class="line"> * Note that it can be more efficient to manipulate flags and release the</span>
<span class="line"> * locks in a single atomic operation.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockWaitListUnlock</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint32      old_state PG_USED_FOR_ASSERTS_ONLY<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    old_state <span class="token operator">=</span> <span class="token function">pg_atomic_fetch_and_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> <span class="token operator">~</span>LW_FLAG_LOCKED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>old_state <span class="token operator">&amp;</span> LW_FLAG_LOCKED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="conditional-lock-up" tabindex="-1"><a class="header-anchor" href="#conditional-lock-up"><span>Conditional Lock Up</span></a></h3><p><code>LWLockAcquire</code> 确保了返回时上锁一定是成功的；<code>LWLockConditionalAcquire</code> 只做尝试上锁这一步并返回结果，由调用者的代码来处理上锁成功或失败后的情况：</p><ol><li>屏蔽中断</li><li>尝试上锁</li><li>如果成功，直接返回；如果失败，恢复响应中断并返回</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * LWLockConditionalAcquire - acquire a lightweight lock in the specified mode</span>
<span class="line"> *</span>
<span class="line"> * If the lock is not available, return false with no side-effects.</span>
<span class="line"> *</span>
<span class="line"> * If successful, cancel/die interrupts are held off until lock release.</span>
<span class="line"> */</span></span>
<span class="line">bool</span>
<span class="line"><span class="token function">LWLockConditionalAcquire</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">,</span> LWLockMode mode<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    bool        mustwait<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_SHARED <span class="token operator">||</span> mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">PRINT_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockConditionalAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Ensure we will have room to remember the lock */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>num_held_lwlocks <span class="token operator">&gt;=</span> MAX_SIMUL_LWLOCKS<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;too many LWLocks taken&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Lock out cancel/die interrupts until we exit the code section protected</span>
<span class="line">     * by the LWLock.  This ensures that interrupts will not interfere with</span>
<span class="line">     * manipulations of data structures in shared memory.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">HOLD_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Check for the lock */</span></span>
<span class="line">    mustwait <span class="token operator">=</span> <span class="token function">LWLockAttemptLock</span><span class="token punctuation">(</span>lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>mustwait<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Failed to get lock, so release interrupt holdoff */</span></span>
<span class="line">        <span class="token function">RESUME_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockConditionalAcquire&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;failed&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_CONDACQUIRE_FAIL_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">TRACE_POSTGRESQL_LWLOCK_CONDACQUIRE_FAIL</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Add lock to list of locks held by this backend */</span></span>
<span class="line">        held_lwlocks<span class="token punctuation">[</span>num_held_lwlocks<span class="token punctuation">]</span><span class="token punctuation">.</span>lock <span class="token operator">=</span> lock<span class="token punctuation">;</span></span>
<span class="line">        held_lwlocks<span class="token punctuation">[</span>num_held_lwlocks<span class="token operator">++</span><span class="token punctuation">]</span><span class="token punctuation">.</span>mode <span class="token operator">=</span> mode<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_CONDACQUIRE_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">TRACE_POSTGRESQL_LWLOCK_CONDACQUIRE</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token operator">!</span>mustwait<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="lock-or-wait" tabindex="-1"><a class="header-anchor" href="#lock-or-wait"><span>Lock Or Wait</span></a></h3><p>实现思路和上述两种上锁方式差不多，只是语义上有区别。如果能够上锁成功，那么直接上锁并返回；如果无法上锁成功，那么等到能够上锁的时候才返回，但不上锁。区别在于将进程加入等待列表时，锁模式使用的是 <code>LW_WAIT_UNTIL_FREE</code>，并且当前进程的 <code>PGPROC</code> 将会被插入等待列表的队头而不是队尾。后续当锁可用时，这些进程将会被优先唤醒。</p><h3 id="release" tabindex="-1"><a class="header-anchor" href="#release"><span>Release</span></a></h3><p>释放 LWLock 时：</p><ol><li>根据上锁时所使用的锁模式，原子地修改锁状态</li><li>如果当前锁已经无人使用，而又有等待进程的话，唤醒所有能够获取该锁的进程</li><li>恢复响应中断</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * LWLockRelease - release a previously acquired lock</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockRelease</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    LWLockMode  mode<span class="token punctuation">;</span></span>
<span class="line">    uint32      oldstate<span class="token punctuation">;</span></span>
<span class="line">    bool        check_waiters<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         i<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Remove lock from list of locks held.  Usually, but not always, it will</span>
<span class="line">     * be the latest-acquired lock; so search array backwards.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> num_held_lwlocks<span class="token punctuation">;</span> <span class="token operator">--</span>i <span class="token operator">&gt;=</span> <span class="token number">0</span><span class="token punctuation">;</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>lock <span class="token operator">==</span> held_lwlocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>lock<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>i <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;lock %s is not held&quot;</span><span class="token punctuation">,</span> <span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    mode <span class="token operator">=</span> held_lwlocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>mode<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    num_held_lwlocks<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> num_held_lwlocks<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line">        held_lwlocks<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> held_lwlocks<span class="token punctuation">[</span>i <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">PRINT_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockRelease&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Release my hold on lock, after that it can immediately be acquired by</span>
<span class="line">     * others, even if we still have to wakeup other waiters.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>mode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">        oldstate <span class="token operator">=</span> <span class="token function">pg_atomic_sub_fetch_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_VAL_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        oldstate <span class="token operator">=</span> <span class="token function">pg_atomic_sub_fetch_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> LW_VAL_SHARED<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* nobody else can have that kind of lock */</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token operator">!</span><span class="token punctuation">(</span>oldstate <span class="token operator">&amp;</span> LW_VAL_EXCLUSIVE<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">TRACE_POSTGRESQL_LWLOCK_RELEASE_ENABLED</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">TRACE_POSTGRESQL_LWLOCK_RELEASE</span><span class="token punctuation">(</span><span class="token function">T_NAME</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We&#39;re still waiting for backends to get scheduled, don&#39;t wake them up</span>
<span class="line">     * again.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>oldstate <span class="token operator">&amp;</span> <span class="token punctuation">(</span>LW_FLAG_HAS_WAITERS <span class="token operator">|</span> LW_FLAG_RELEASE_OK<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span></span>
<span class="line">        <span class="token punctuation">(</span>LW_FLAG_HAS_WAITERS <span class="token operator">|</span> LW_FLAG_RELEASE_OK<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">        <span class="token punctuation">(</span>oldstate <span class="token operator">&amp;</span> LW_LOCK_MASK<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        check_waiters <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        check_waiters <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * As waking up waiters requires the spinlock to be acquired, only do so</span>
<span class="line">     * if necessary.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>check_waiters<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* XXX: remove before commit? */</span></span>
<span class="line">        <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockRelease&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;releasing waiters&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">LWLockWakeup</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Now okay to allow cancel/die interrupts.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">RESUME_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，唤醒所有能够获取该锁的进程的流程如下：</p><ol><li>由于需要操作锁的等待列表，所以通过原子操作 + 自旋对等待列表加锁</li><li>遍历等待列表，将符合唤醒条件的进程从等待列表中移除，加入到唤醒列表中，并修改进程的等待状态为 <code>LW_WS_PENDING_WAKEUP</code>；如果当前已经准备唤醒一个想要独占锁的进程，就不再唤醒更多进程了</li><li>通过 CAS 操作原子地修改锁的状态直至成功</li><li>遍历唤醒列表，修改所有进程的等待状态为 <code>LW_WS_NOT_WAITING</code>，并释放信号量唤醒阻塞在信号量上的进程</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Wakeup all the lockers that currently have a chance to acquire the lock.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">LWLockWakeup</span><span class="token punctuation">(</span>LWLock <span class="token operator">*</span>lock<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    bool        new_release_ok<span class="token punctuation">;</span></span>
<span class="line">    bool        wokeup_somebody <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line">    proclist_head wakeup<span class="token punctuation">;</span></span>
<span class="line">    proclist_mutable_iter iter<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">proclist_init</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>wakeup<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    new_release_ok <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* lock wait list while collecting backends to wake up */</span></span>
<span class="line">    <span class="token function">LWLockWaitListLock</span><span class="token punctuation">(</span>lock<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">proclist_foreach_modify</span><span class="token punctuation">(</span>iter<span class="token punctuation">,</span> <span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>waiters<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        PGPROC     <span class="token operator">*</span>waiter <span class="token operator">=</span> <span class="token function">GetPGProcByNumber</span><span class="token punctuation">(</span>iter<span class="token punctuation">.</span>cur<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>wokeup_somebody <span class="token operator">&amp;&amp;</span> waiter<span class="token operator">-&gt;</span>lwWaitMode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">proclist_delete</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>waiters<span class="token punctuation">,</span> iter<span class="token punctuation">.</span>cur<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">proclist_push_tail</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>wakeup<span class="token punctuation">,</span> iter<span class="token punctuation">.</span>cur<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>waiter<span class="token operator">-&gt;</span>lwWaitMode <span class="token operator">!=</span> LW_WAIT_UNTIL_FREE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Prevent additional wakeups until retryer gets to run. Backends</span>
<span class="line">             * that are just waiting for the lock to become free don&#39;t retry</span>
<span class="line">             * automatically.</span>
<span class="line">             */</span></span>
<span class="line">            new_release_ok <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Don&#39;t wakeup (further) exclusive locks.</span>
<span class="line">             */</span></span>
<span class="line">            wokeup_somebody <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Signal that the process isn&#39;t on the wait list anymore. This allows</span>
<span class="line">         * LWLockDequeueSelf() to remove itself of the waitlist with a</span>
<span class="line">         * proclist_delete(), rather than having to check if it has been</span>
<span class="line">         * removed from the list.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>waiter<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">==</span> LW_WS_WAITING<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        waiter<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">=</span> LW_WS_PENDING_WAKEUP<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Once we&#39;ve woken up an exclusive lock, there&#39;s no point in waking</span>
<span class="line">         * up anybody else.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>waiter<span class="token operator">-&gt;</span>lwWaitMode <span class="token operator">==</span> LW_EXCLUSIVE<span class="token punctuation">)</span></span>
<span class="line">            <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span><span class="token function">proclist_is_empty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>wakeup<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token function">pg_atomic_read_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">)</span> <span class="token operator">&amp;</span> LW_FLAG_HAS_WAITERS<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* unset required flags, and release lock, in one fell swoop */</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        uint32      old_state<span class="token punctuation">;</span></span>
<span class="line">        uint32      desired_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        old_state <span class="token operator">=</span> <span class="token function">pg_atomic_read_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">while</span> <span class="token punctuation">(</span>true<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            desired_state <span class="token operator">=</span> old_state<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* compute desired flags */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>new_release_ok<span class="token punctuation">)</span></span>
<span class="line">                desired_state <span class="token operator">|=</span> LW_FLAG_RELEASE_OK<span class="token punctuation">;</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">                desired_state <span class="token operator">&amp;=</span> <span class="token operator">~</span>LW_FLAG_RELEASE_OK<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">proclist_is_empty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>wakeup<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                desired_state <span class="token operator">&amp;=</span> <span class="token operator">~</span>LW_FLAG_HAS_WAITERS<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            desired_state <span class="token operator">&amp;=</span> <span class="token operator">~</span>LW_FLAG_LOCKED<span class="token punctuation">;</span>   <span class="token comment">/* release lock */</span></span>
<span class="line"></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">pg_atomic_compare_exchange_u32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>lock<span class="token operator">-&gt;</span>state<span class="token punctuation">,</span> <span class="token operator">&amp;</span>old_state<span class="token punctuation">,</span></span>
<span class="line">                                               desired_state<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Awaken any waiters I removed from the queue. */</span></span>
<span class="line">    <span class="token function">proclist_foreach_modify</span><span class="token punctuation">(</span>iter<span class="token punctuation">,</span> <span class="token operator">&amp;</span>wakeup<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        PGPROC     <span class="token operator">*</span>waiter <span class="token operator">=</span> <span class="token function">GetPGProcByNumber</span><span class="token punctuation">(</span>iter<span class="token punctuation">.</span>cur<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">LOG_LWDEBUG</span><span class="token punctuation">(</span><span class="token string">&quot;LWLockRelease&quot;</span><span class="token punctuation">,</span> lock<span class="token punctuation">,</span> <span class="token string">&quot;release waiter&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">proclist_delete</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>wakeup<span class="token punctuation">,</span> iter<span class="token punctuation">.</span>cur<span class="token punctuation">,</span> lwWaitLink<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Guarantee that lwWaiting being unset only becomes visible once the</span>
<span class="line">         * unlink from the link has completed. Otherwise the target backend</span>
<span class="line">         * could be woken up for other reason and enqueue for a new lock - if</span>
<span class="line">         * that happens before the list unlink happens, the list would end up</span>
<span class="line">         * being corrupted.</span>
<span class="line">         *</span>
<span class="line">         * The barrier pairs with the LWLockWaitListLock() when enqueuing for</span>
<span class="line">         * another lock.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">pg_write_barrier</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        waiter<span class="token operator">-&gt;</span>lwWaiting <span class="token operator">=</span> LW_WS_NOT_WAITING<span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">PGSemaphoreUnlock</span><span class="token punctuation">(</span>waiter<span class="token operator">-&gt;</span>sem<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,45))])}const m=i(r,[["render",d],["__file","PostgreSQL LWLock.html.vue"]]),b=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20LWLock.html","title":"PostgreSQL - LWLock","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Data Structure And States","slug":"data-structure-and-states","link":"#data-structure-and-states","children":[]},{"level":2,"title":"Operations","slug":"operations","link":"#operations","children":[{"level":3,"title":"Initialization","slug":"initialization","link":"#initialization","children":[]},{"level":3,"title":"Lock Up","slug":"lock-up","link":"#lock-up","children":[]},{"level":3,"title":"Conditional Lock Up","slug":"conditional-lock-up","link":"#conditional-lock-up","children":[]},{"level":3,"title":"Lock Or Wait","slug":"lock-or-wait","link":"#lock-or-wait","children":[]},{"level":3,"title":"Release","slug":"release","link":"#release","children":[]}]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL LWLock.md"}');export{m as comp,b as data};
