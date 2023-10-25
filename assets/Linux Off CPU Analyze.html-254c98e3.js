import{_ as i,r as l,o as d,c,a as e,b as n,d as s,e as r}from"./app-25fa875f.js";const t={},o=r(`<h1 id="linux-performance-off-cpu-analyze" tabindex="-1"><a class="header-anchor" href="#linux-performance-off-cpu-analyze" aria-hidden="true">#</a> Linux Performance - Off CPU Analyze</h1><p>Created by: Mr Dk.</p><p>2023 / 09 / 24 00:08</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p>性能问题可以被分为两类：</p><ul><li>On CPU：进程运行在 CPU 上所耗费的时间</li><li>Off CPU：进程被阻塞而离开 CPU 的时间，比如 I/O、锁、定时器等</li></ul><p>常规的 CPU 采样只能够收集 On CPU 的统计信息，但无法统计 Off CPU 的统计信息。</p><h2 id="differences" tabindex="-1"><a class="header-anchor" href="#differences" aria-hidden="true">#</a> Differences</h2><h3 id="cpu-sampling" tabindex="-1"><a class="header-anchor" href="#cpu-sampling" aria-hidden="true">#</a> CPU Sampling</h3><p>On CPU 的采样如下图所示。Perf 相关工具的采样原理是，以固定的频率采集当时 CPU 上的进程堆栈信息。当进程因各种因素离开 CPU 时，就不再会被采样了：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    CPU Sampling -----------------------------------------------&gt;
     |  |  |  |  |  |  |                      |  |  |  |  |
     A  A  A  A  B  B  B                      B  A  A  A  A
    A(---------.                                .----------)
               |                                |
               B(--------.                   .--)
                         |                   |         user-land
   - - - - - - - - - - syscall - - - - - - - - - - - - - - - - -
                         |                   |         kernel
                         X     Off-CPU       |
                       block . . . . . interrupt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="application-tracing" tabindex="-1"><a class="header-anchor" href="#application-tracing" aria-hidden="true">#</a> Application Tracing</h3><p>应用程序内部可以自己实现 Off CPU 统计，但问题在于，追踪所有函数的开销极大，而追踪部分函数又可能丢失真正想追踪的目标：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    App Tracing ------------------------------------------------&gt;
    |          |                                |          |
    A(         B(                               B)         A)

    A(---------.                                .----------)
               |                                |
               B(--------.                   .--)
                         |                   |         user-land
   - - - - - - - - - - syscall - - - - - - - - - - - - - - - - -
                         |                   |         kernel
                         X     Off-CPU       |
                       block . . . . . interrupt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="off-cpu-tracing" tabindex="-1"><a class="header-anchor" href="#off-cpu-tracing" aria-hidden="true">#</a> Off-CPU Tracing</h3><p>只追踪 OS 内核将线程从 CPU 上换出的函数，并记录当时的时间戳和用户态堆栈。相对来说，开销小了很多：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    Off-CPU Tracing --------------------------------------------&gt;
                         |                   |
                         B                   B
                         A                   A
    A(---------.                                .----------)
               |                                |
               B(--------.                   .--)
                         |                   |         user-land
   - - - - - - - - - - syscall - - - - - - - - - - - - - - - - -
                         |                   |         kernel
                         X     Off-CPU       |
                       block . . . . . interrupt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="overhead" tabindex="-1"><a class="header-anchor" href="#overhead" aria-hidden="true">#</a> Overhead</h2><p>开销是性能追踪中最重要的因素。相对来说，Perf 需要将追踪得到的数据返回用户态并写入文件中，所以产生的数据量和追踪的时间成正比，并且可能受到磁盘 I/O 的限制；而使用 eBPF 则会在内核态捕获并追踪 <strong>唯一</strong> 的堆栈，这意味着追踪数据量并不会随着时间而线性增长。</p>`,21),p={href:"https://ebpf.io/",target:"_blank",rel:"noopener noreferrer"},u={href:"https://github.com/iovisor/bcc",target:"_blank",rel:"noopener noreferrer"},v=e("code",null,"offcputime",-1),h=r(`<h2 id="off-cpu-sampling" tabindex="-1"><a class="header-anchor" href="#off-cpu-sampling" aria-hidden="true">#</a> Off CPU Sampling</h2><p>使用 BCC 工具 <code>offcputime</code> 采样：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>/usr/share/bcc/tools/offcputime <span class="token parameter variable">-df</span> <span class="token parameter variable">-p</span> PID <span class="token number">30</span> <span class="token operator">&gt;</span> out.stacks
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>采样完毕后，使用火焰图工具生成火焰图：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://github.com/brendangregg/FlameGraph
<span class="token builtin class-name">cd</span> FlameGraph
./flamegraph.pl <span class="token parameter variable">--color</span><span class="token operator">=</span>io <span class="token parameter variable">--title</span><span class="token operator">=</span><span class="token string">&quot;Off-CPU Time Flame Graph&quot;</span> <span class="token parameter variable">--countname</span><span class="token operator">=</span>us <span class="token operator">&lt;</span> out.stacks <span class="token operator">&gt;</span> out.svg
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,6),f={href:"https://www.brendangregg.com/offcpuanalysis.html",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.brendangregg.com/FlameGraphs/offcpuflamegraphs.html",target:"_blank",rel:"noopener noreferrer"},b={href:"https://www.brendangregg.com/blog/2015-02-26/linux-perf-off-cpu-flame-graph.html",target:"_blank",rel:"noopener noreferrer"};function g(_,k){const a=l("ExternalLinkIcon");return d(),c("div",null,[o,e("p",null,[n("比如，通过 "),e("a",p,[n("eBPF"),s(a)]),n("/"),e("a",u,[n("BCC"),s(a)]),n(" 工具 "),v,n("，可以直接得到 Flame Graph 工具能够接受的输入格式，生成 Off CPU 火焰图。当然用 Perf 也可以，就是开销大一点啦。")]),h,e("p",null,[e("a",f,[n("Off-CPU Analysis"),s(a)])]),e("p",null,[e("a",m,[n("Off-CPU Flame Graphs"),s(a)])]),e("p",null,[e("a",b,[n("Linux perf_events Off-CPU Time Flame Graph"),s(a)])])])}const C=i(t,[["render",g],["__file","Linux Off CPU Analyze.html.vue"]]);export{C as default};
