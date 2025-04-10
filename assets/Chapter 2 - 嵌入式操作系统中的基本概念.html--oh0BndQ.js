import{_ as e,c as a,a as i,o as n}from"./app-CT9FvwxE.js";const h={};function s(r,l){return n(),a("div",null,l[0]||(l[0]=[i('<h1 id="chapter-2-嵌入式操作系统中的基本概念" tabindex="-1"><a class="header-anchor" href="#chapter-2-嵌入式操作系统中的基本概念"><span>Chapter 2 - 嵌入式操作系统中的基本概念</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 11 / 06 21:50</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="_2-1-前后台系统" tabindex="-1"><a class="header-anchor" href="#_2-1-前后台系统"><span>2.1 前后台系统</span></a></h2><p>指无 OS 支撑的计算机系统</p><ul><li>后台指一个无限循环的应用程序</li><li>前台是中断服务程序</li></ul><p>中断服务提供的信息不能马上得到处理，要等到后台程序运行到相应任务时才能处理。处理信息的及时性较差，最坏情况取决于整个循环的执行时间。</p><h2 id="_2-2-调度" tabindex="-1"><a class="header-anchor" href="#_2-2-调度"><span>2.2 调度</span></a></h2><h2 id="_2-3-临界区" tabindex="-1"><a class="header-anchor" href="#_2-3-临界区"><span>2.3 临界区</span></a></h2><p>任何时候都只允许一个任务访问的资源成为临界资源。</p><h2 id="_2-4-进程与线程" tabindex="-1"><a class="header-anchor" href="#_2-4-进程与线程"><span>2.4 进程与线程</span></a></h2><h2 id="_2-5-任务与多任务" tabindex="-1"><a class="header-anchor" href="#_2-5-任务与多任务"><span>2.5 任务与多任务</span></a></h2><p>大多数嵌入式系统不具备面向进程操作系统的内存开销，绝大多数嵌入式 RTOS 都采用线程模式。多任务 OS 的核心是系统调度器，使用 <strong>任务控制块 (Task Control Block, TCB)</strong> 管理任务调度，需要保存：</p><ul><li>任务当前状态</li><li>优先级</li><li>等待的事件或资源</li><li>任务程序代码的起始地址</li><li>初始堆栈指针</li></ul><p>当任务 CPU 使用权被剥夺时，TCB 用于保存任务状态；反之，用于恢复状态。TCB 全部驻留在内存中。</p><h2 id="_2-6-任务切换" tabindex="-1"><a class="header-anchor" href="#_2-6-任务切换"><span>2.6 任务切换</span></a></h2><p>任务切换模拟一次中断过程，从而实现 CPU 使用权的转移。任务切换所需要的时间成为 <strong>任务切换时间</strong>——取决于 CPU 有多少寄存器要进出堆栈。</p><h2 id="_2-7-死锁" tabindex="-1"><a class="header-anchor" href="#_2-7-死锁"><span>2.7 死锁</span></a></h2><p>在嵌入式系统中不易出现</p><h2 id="_2-8-不可剥夺型内核" tabindex="-1"><a class="header-anchor" href="#_2-8-不可剥夺型内核"><span>2.8 不可剥夺型内核</span></a></h2><p>运行中的任务占有 CPU 的绝对使用权。若不自我放弃，准备就绪的高优先级任务不能抢占 CPU 使用权。正在运行的任务允许被中断打断，但中断返回后还是回到原来的任务中，直到任务主动释放 CPU。不可剥夺型内核的最大缺陷在于响应时间慢，当前运行任务的 CPU 使用时间无法确定，任务响应时间仍然不可知。商业软件几乎没有不可剥夺型内核。</p><h2 id="_2-9-可剥夺型内核" tabindex="-1"><a class="header-anchor" href="#_2-9-可剥夺型内核"><span>2.9 可剥夺型内核</span></a></h2><p>一旦有更高优先级的任务准备就绪，当前正在运行的低优先级任务的 CPU 使用权立即被剥夺，准备就绪的最高优先级任务总能得到 CPU 的使用权。若高优先级的任务不自我挂起，低优先级的任务永远没有运行的机会。可剥夺型内核的 CPU 使用权是可预测和可确定的，任务级响应得以优化。μC/OS-II 以及绝大多数商业实时内核都是可剥夺型内核。</p><h2 id="_2-10-可重入型" tabindex="-1"><a class="header-anchor" href="#_2-10-可重入型"><span>2.10 可重入型</span></a></h2><p>可以被多个任务并发使用，数据不会遭到破坏。若想使函数具有可重入性：</p><ul><li>使用局部变量</li><li>调用前关中断，调用后开中断</li><li>调用过程中，使用信号量独占该函数</li></ul><h2 id="_2-11-优先级反转" tabindex="-1"><a class="header-anchor" href="#_2-11-优先级反转"><span>2.11 优先级反转</span></a></h2><ul><li>静态优先级：任务在创建时就确定优先级。运行过程中不再动态改变优先级，各任务的时间约束在编译时已知</li><li>动态优先级：任务优先级根据需要而改变</li></ul><p>优先级反转：低优先级任务抢占了高优先级任务的资源，中优先级任务抢占了低优先级任务的 CPU 使用权，中优先级任务与高优先级任务的优先级反转。</p><p>防止发生优先级反转的方法：</p><ul><li>优先级继承算法</li><li>优先级天花板算法</li></ul><p>μC/OS-II 不支持这两种算法。</p><h2 id="_2-12-事件" tabindex="-1"><a class="header-anchor" href="#_2-12-事件"><span>2.12 事件</span></a></h2><ul><li>信号量</li><li>消息邮箱</li><li>消息队列</li><li>事件标志组</li></ul><h2 id="_2-13-互斥" tabindex="-1"><a class="header-anchor" href="#_2-13-互斥"><span>2.13 互斥</span></a></h2><ul><li>关中断：CPU 不响应任何中断，保证任务不会切换</li><li>禁止调度（禁止抢占）：中断依旧开放，中断返回原任务继续执行</li><li>信号量：信号量的请求和释放开销相当大</li><li>测试并置位：Test and Set</li></ul><h2 id="_2-14-同步" tabindex="-1"><a class="header-anchor" href="#_2-14-同步"><span>2.14 同步</span></a></h2><p>中断不能与任务同步。</p><h2 id="_2-15-通信" tabindex="-1"><a class="header-anchor" href="#_2-15-通信"><span>2.15 通信</span></a></h2><p><strong>任务与任务</strong> 或 <strong>任务与中断服务</strong> 之间的信息传递。手段：</p><ul><li>全局变量</li><li>信号量</li><li>消息邮箱</li><li>消息队列</li><li>事件标志组</li><li>内存块</li></ul><p>中断服务子程序保证独占的唯一方法：关中断。</p><p>任务与中断服务子程序通信的唯一方法：全局变量。</p><h2 id="_2-16-对存储器的要求" tabindex="-1"><a class="header-anchor" href="#_2-16-对存储器的要求"><span>2.16 对存储器的要求</span></a></h2><blockquote><p>去死吧！</p></blockquote><h2 id="summary" tabindex="-1"><a class="header-anchor" href="#summary"><span>Summary</span></a></h2><p>大部分概念在操作系统课上已经学过</p>',49)]))}const p=e(h,[["render",s],["__file","Chapter 2 - 嵌入式操作系统中的基本概念.html.vue"]]),_=JSON.parse('{"path":"/uc-os-ii-code-notes/Chapter%202%20-%20%E5%B5%8C%E5%85%A5%E5%BC%8F%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E4%B8%AD%E7%9A%84%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5.html","title":"Chapter 2 - 嵌入式操作系统中的基本概念","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"2.1 前后台系统","slug":"_2-1-前后台系统","link":"#_2-1-前后台系统","children":[]},{"level":2,"title":"2.2 调度","slug":"_2-2-调度","link":"#_2-2-调度","children":[]},{"level":2,"title":"2.3 临界区","slug":"_2-3-临界区","link":"#_2-3-临界区","children":[]},{"level":2,"title":"2.4 进程与线程","slug":"_2-4-进程与线程","link":"#_2-4-进程与线程","children":[]},{"level":2,"title":"2.5 任务与多任务","slug":"_2-5-任务与多任务","link":"#_2-5-任务与多任务","children":[]},{"level":2,"title":"2.6 任务切换","slug":"_2-6-任务切换","link":"#_2-6-任务切换","children":[]},{"level":2,"title":"2.7 死锁","slug":"_2-7-死锁","link":"#_2-7-死锁","children":[]},{"level":2,"title":"2.8 不可剥夺型内核","slug":"_2-8-不可剥夺型内核","link":"#_2-8-不可剥夺型内核","children":[]},{"level":2,"title":"2.9 可剥夺型内核","slug":"_2-9-可剥夺型内核","link":"#_2-9-可剥夺型内核","children":[]},{"level":2,"title":"2.10 可重入型","slug":"_2-10-可重入型","link":"#_2-10-可重入型","children":[]},{"level":2,"title":"2.11 优先级反转","slug":"_2-11-优先级反转","link":"#_2-11-优先级反转","children":[]},{"level":2,"title":"2.12 事件","slug":"_2-12-事件","link":"#_2-12-事件","children":[]},{"level":2,"title":"2.13 互斥","slug":"_2-13-互斥","link":"#_2-13-互斥","children":[]},{"level":2,"title":"2.14 同步","slug":"_2-14-同步","link":"#_2-14-同步","children":[]},{"level":2,"title":"2.15 通信","slug":"_2-15-通信","link":"#_2-15-通信","children":[]},{"level":2,"title":"2.16 对存储器的要求","slug":"_2-16-对存储器的要求","link":"#_2-16-对存储器的要求","children":[]},{"level":2,"title":"Summary","slug":"summary","link":"#summary","children":[]}],"git":{},"filePathRelative":"uc-os-ii-code-notes/Chapter 2 - 嵌入式操作系统中的基本概念.md"}');export{p as comp,_ as data};
