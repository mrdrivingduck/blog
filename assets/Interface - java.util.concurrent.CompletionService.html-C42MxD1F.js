import{_ as s,c as a,a as e,o as t}from"./app-aVGbliEg.js";const p={};function l(c,n){return t(),a("div",null,n[0]||(n[0]=[e(`<h1 id="interface-java-util-concurrent-completionservice" tabindex="-1"><a class="header-anchor" href="#interface-java-util-concurrent-completionservice"><span>Interface - java.util.concurrent.CompletionService</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 02 / 16 🧧 19:03</p><p>Ningbo, Zhejiang, China</p><hr><h2 id="definition" tabindex="-1"><a class="header-anchor" href="#definition"><span>Definition</span></a></h2><p>该接口将 <strong>提交新的异步任务</strong> 与 <strong>消费已完成任务产生的结果</strong> 解耦。生产者调用 <code>submit()</code> 提交任务，消费者调用 <code>take()</code> 按照任务完成的顺序获取完成的任务并处理结果。该接口的实现类可用于管理异步 I/O：</p><ul><li>读取任务在程序的某个部分被提交到该服务中</li><li>程序的另一部分处理读取完成后的结果</li></ul><p>本接口的实现类内部依赖于一个独立的执行器来真正执行任务，本接口定义的函数仅用于管理内部的 <strong>完成队列</strong> - 队列中存放所有已完成的任务。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * A service that decouples the production of new asynchronous tasks</span>
<span class="line"> * from the consumption of the results of completed tasks.  Producers</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">submit</span></span><span class="token punctuation">}</span> tasks for execution. Consumers <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">take</span></span><span class="token punctuation">}</span></span>
<span class="line"> * completed tasks and process their results in the order they</span>
<span class="line"> * complete.  A <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CompletionService</span></span></span><span class="token punctuation">}</span> can for example be used to</span>
<span class="line"> * manage asynchronous I/O, in which tasks that perform reads are</span>
<span class="line"> * submitted in one part of a program or system, and then acted upon</span>
<span class="line"> * in a different part of the program when the reads complete,</span>
<span class="line"> * possibly in a different order than they were requested.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Typically, a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CompletionService</span></span></span><span class="token punctuation">}</span> relies on a separate</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">Executor</span></span><span class="token punctuation">}</span> to actually execute the tasks, in which case the</span>
<span class="line"> * <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CompletionService</span></span></span><span class="token punctuation">}</span> only manages an internal completion</span>
<span class="line"> * queue. The <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">ExecutorCompletionService</span></span><span class="token punctuation">}</span> class provides an</span>
<span class="line"> * implementation of this approach.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>Memory consistency effects: Actions in a thread prior to</span>
<span class="line"> * submitting a task to a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">CompletionService</span></span></span><span class="token punctuation">}</span></span>
<span class="line"> * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>package-summary.html#MemoryVisibility<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>i</span><span class="token punctuation">&gt;</span></span>happen-before<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>i</span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * actions taken by that task, which in turn <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>i</span><span class="token punctuation">&gt;</span></span>happen-before<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>i</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"> * actions following a successful return from the corresponding <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span>.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">CompletionService</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="submit" tabindex="-1"><a class="header-anchor" href="#submit"><span>Submit</span></a></h2><p>将任务提交给执行器执行，并返回一个 <code>Future</code> 对象。当任务完成后，将可以从完成队列中取出。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Submits a value-returning task for execution and returns a Future</span>
<span class="line"> * representing the pending results of the task.  Upon completion,</span>
<span class="line"> * this task may be taken or polled.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">task</span> the task to submit</span>
<span class="line"> * <span class="token keyword">@return</span> a Future representing pending completion of the task</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> if the task cannot be</span>
<span class="line"> *         scheduled for execution</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the task is null</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token function">submit</span><span class="token punctuation">(</span><span class="token class-name">Callable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> task<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Submits a Runnable task for execution and returns a Future</span>
<span class="line"> * representing that task.  Upon completion, this task may be</span>
<span class="line"> * taken or polled.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">task</span> the task to submit</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">result</span> the result to return upon successful completion</span>
<span class="line"> * <span class="token keyword">@return</span> a Future representing pending completion of the task,</span>
<span class="line"> *         and whose <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span></span><span class="token punctuation">}</span> method will return the given</span>
<span class="line"> *         result value upon completion</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">RejectedExecutionException</span></span> if the task cannot be</span>
<span class="line"> *         scheduled for execution</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">NullPointerException</span></span> if the task is null</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token function">submit</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">,</span> <span class="token class-name">V</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="take" tabindex="-1"><a class="header-anchor" href="#take"><span>Take</span></a></h2><p>从完成队列中取得并移除下一个已经完成的任务。如果队列中暂时没有任何已完成任务，则阻塞等待。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Retrieves and removes the Future representing the next</span>
<span class="line"> * completed task, waiting if none are yet present.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the Future representing the next completed task</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if interrupted while waiting</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="poll" tabindex="-1"><a class="header-anchor" href="#poll"><span>Poll</span></a></h2><p>从完成队列中取得并移除下一个已经完成的任务。如果队列中暂时没有任何已完成任务，则返回 <code>null</code>。可选超时参数，使函数阻塞到超时时间再返回。</p><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java" data-title="java"><pre><code><span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Retrieves and removes the Future representing the next</span>
<span class="line"> * completed task, or <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if none are present.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@return</span> the Future representing the next completed task, or</span>
<span class="line"> *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if none are present</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token function">poll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token doc-comment comment">/**</span>
<span class="line"> * Retrieves and removes the Future representing the next</span>
<span class="line"> * completed task, waiting if necessary up to the specified wait</span>
<span class="line"> * time if none are yet present.</span>
<span class="line"> *</span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">timeout</span> how long to wait before giving up, in units of</span>
<span class="line"> *        <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">unit</span></span><span class="token punctuation">}</span></span>
<span class="line"> * <span class="token keyword">@param</span> <span class="token parameter">unit</span> a <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token class-name">TimeUnit</span></span></span><span class="token punctuation">}</span> determining how to interpret the</span>
<span class="line"> *        <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java">timeout</span></span><span class="token punctuation">}</span> parameter</span>
<span class="line"> * <span class="token keyword">@return</span> the Future representing the next completed task or</span>
<span class="line"> *         <span class="token punctuation">{</span><span class="token keyword">@code</span> <span class="token code-section"><span class="token code language-java"><span class="token keyword">null</span></span></span><span class="token punctuation">}</span> if the specified waiting time elapses</span>
<span class="line"> *         before one is present</span>
<span class="line"> * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">InterruptedException</span></span> if interrupted while waiting</span>
<span class="line"> */</span></span>
<span class="line"><span class="token class-name">Future</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token function">poll</span><span class="token punctuation">(</span><span class="token keyword">long</span> timeout<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>`,20)]))}const o=s(p,[["render",l],["__file","Interface - java.util.concurrent.CompletionService.html.vue"]]),r=JSON.parse('{"path":"/jdk-source-code-analysis/java.util.concurrent/Interface%20-%20java.util.concurrent.CompletionService.html","title":"Interface - java.util.concurrent.CompletionService","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Definition","slug":"definition","link":"#definition","children":[]},{"level":2,"title":"Submit","slug":"submit","link":"#submit","children":[]},{"level":2,"title":"Take","slug":"take","link":"#take","children":[]},{"level":2,"title":"Poll","slug":"poll","link":"#poll","children":[]}],"git":{},"filePathRelative":"jdk-source-code-analysis/java.util.concurrent/Interface - java.util.concurrent.CompletionService.md"}');export{o as comp,r as data};