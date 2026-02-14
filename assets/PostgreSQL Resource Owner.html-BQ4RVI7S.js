import{_ as s,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const p={};function i(c,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-resource-owner" tabindex="-1"><a class="header-anchor" href="#postgresql-resource-owner"><span>PostgreSQL - Resource Owner</span></a></h1><p>Created by: Mr Dk.</p><p>2025 / 05 / 24 15:49</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="背景" tabindex="-1"><a class="header-anchor" href="#背景"><span>背景</span></a></h2><p>在数据库运行的过程中，需要动态获取各种资源，比如锁、buffer、快照、文件句柄等。为了防止这些资源未被按时归还，从而引发泄漏，需要一种可靠的机制来记录并追踪已经分配的资源：在应当释放资源的时机进行释放，或检查资源是否已被释放。由此可以避免有限的资源逐渐被泄漏完，引发数据库异常。</p><p>一类较为经典的易泄漏资源就是堆内存。PostgreSQL 由 C 语言实现，而堆内存管理一直是 C 语言中一个令人头疼的问题。在堆上动态分配内存后，开发者需要谨慎地留意指针的生命周期：把指向某段堆内存的指针传递赋值了几次后，可能就忘记这段内存是否需要被释放，是否已经被释放了。带来的问题是各种各样的 memory leak、double free、use after free。PostgreSQL 通过引入 <a href="https://github.com/postgres/postgres/blob/master/src/backend/utils/mmgr/README" target="_blank" rel="noopener noreferrer">Memory Context</a> 对象解决这个问题。Memory Context 组织了一个树状的内存分配结构，在进入某个代码模块时，从当前的 Memory Context 对象中创建一个子对象，分配一大段内存，并记录到树中：该模块内的所有内存分配都从这个子对象中进行；当离开这个模块时，递归释放掉这个子对象的所有内存并把子对象从树中移除。这样，离开这个模块时就不必担心该模块存在堆内存泄漏。</p><p>类似地，各种数据库级别的对象也可以用这种方式管理起来。区别是这些对象的分配或释放方式各不相同，释放的时机也各不相同 (比如根据 2PL 协议，表锁需要在事务结束时才释放)。PostgreSQL 使用 Resource Owner 模块来统一追踪和管理这些资源：为一个事务创建一个 Resource Owner 对象，事务执行期间还可以创建更多子对象；在事务异常中止时，释放已经分配的所有资源；在事务正常提交时，检查是否存在残留资源未被释放。</p><p>PostgreSQL 17 对 Resource Owner 模块做了大幅重构，用通用化的设计统一追踪各类资源，解决了之前版本中与各类资源处理逻辑紧耦合的问题，提升了可扩展性。未来想要追踪新的资源类型将会更加容易：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit b8bff07daa85c837a2747b4d35cd5a27e73fb7b2</span>
<span class="line">Author: Heikki Linnakangas &lt;heikki.linnakangas@iki.fi&gt;</span>
<span class="line">Date:   Wed Nov 8 13:30:50 2023 +0200</span>
<span class="line"></span>
<span class="line">    Make ResourceOwners more easily extensible.</span>
<span class="line"></span>
<span class="line">    Instead of having a separate array/hash for each resource kind, use a</span>
<span class="line">    single array and hash to hold all kinds of resources. This makes it</span>
<span class="line">    possible to introduce new resource &quot;kinds&quot; without having to modify</span>
<span class="line">    the ResourceOwnerData struct. In particular, this makes it possible</span>
<span class="line">    for extensions to register custom resource kinds.</span>
<span class="line"></span>
<span class="line">    The old approach was to have a small array of resources of each kind,</span>
<span class="line">    and if it fills up, switch to a hash table. The new approach also uses</span>
<span class="line">    an array and a hash, but now the array and the hash are used at the</span>
<span class="line">    same time. The array is used to hold the recently added resources, and</span>
<span class="line">    when it fills up, they are moved to the hash. This keeps the access to</span>
<span class="line">    recent entries fast, even when there are a lot of long-held resources.</span>
<span class="line"></span>
<span class="line">    All the resource-specific ResourceOwnerEnlarge*(),</span>
<span class="line">    ResourceOwnerRemember*(), and ResourceOwnerForget*() functions have</span>
<span class="line">    been replaced with three generic functions that take resource kind as</span>
<span class="line">    argument. For convenience, we still define resource-specific wrapper</span>
<span class="line">    macros around the generic functions with the old names, but they are</span>
<span class="line">    now defined in the source files that use those resource kinds.</span>
<span class="line"></span>
<span class="line">    The release callback no longer needs to call ResourceOwnerForget on</span>
<span class="line">    the resource being released. ResourceOwnerRelease unregisters the</span>
<span class="line">    resource from the owner before calling the callback. That needed some</span>
<span class="line">    changes in bufmgr.c and some other files, where releasing the</span>
<span class="line">    resources previously always called ResourceOwnerForget.</span>
<span class="line"></span>
<span class="line">    Each resource kind specifies a release priority, and</span>
<span class="line">    ResourceOwnerReleaseAll releases the resources in priority order. To</span>
<span class="line">    make that possible, we have to restrict what you can do between</span>
<span class="line">    phases. After calling ResourceOwnerRelease(), you are no longer</span>
<span class="line">    allowed to remember any more resources in it or to forget any</span>
<span class="line">    previously remembered resources by calling ResourceOwnerForget.  There</span>
<span class="line">    was one case where that was done previously. At subtransaction commit,</span>
<span class="line">    AtEOSubXact_Inval() would handle the invalidation messages and call</span>
<span class="line">    RelationFlushRelation(), which temporarily increased the reference</span>
<span class="line">    count on the relation being flushed. We now switch to the parent</span>
<span class="line">    subtransaction&#39;s resource owner before calling AtEOSubXact_Inval(), so</span>
<span class="line">    that there is a valid ResourceOwner to temporarily hold that relcache</span>
<span class="line">    reference.</span>
<span class="line"></span>
<span class="line">    Other end-of-xact routines make similar calls to AtEOXact_Inval()</span>
<span class="line">    between release phases, but I didn&#39;t see any regression test failures</span>
<span class="line">    from those, so I&#39;m not sure if they could reach a codepath that needs</span>
<span class="line">    remembering extra resources.</span>
<span class="line"></span>
<span class="line">    There were two exceptions to how the resource leak WARNINGs on commit</span>
<span class="line">    were printed previously: llvmjit silently released the context without</span>
<span class="line">    printing the warning, and a leaked buffer io triggered a PANIC. Now</span>
<span class="line">    everything prints a WARNING, including those cases.</span>
<span class="line"></span>
<span class="line">    Add tests in src/test/modules/test_resowner.</span>
<span class="line"></span>
<span class="line">    Reviewed-by: Aleksander Alekseev, Michael Paquier, Julien Rouhaud</span>
<span class="line">    Reviewed-by: Kyotaro Horiguchi, Hayato Kuroda, Álvaro Herrera, Zhihong Yu</span>
<span class="line">    Reviewed-by: Peter Eisentraut, Andres Freund</span>
<span class="line">    Discussion: https://www.postgresql.org/message-id/cbfabeb0-cd3c-e951-a572-19b365ed314d%40iki.fi</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="层次化管理结构" tabindex="-1"><a class="header-anchor" href="#层次化管理结构"><span>层次化管理结构</span></a></h2><p>Resource Owner 对象的数据结构通过父级、同级、子级三个指针来记录层次关系：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">struct</span> <span class="token class-name">ResourceOwnerData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ResourceOwner parent<span class="token punctuation">;</span>       <span class="token comment">/* NULL if no parent (toplevel owner) */</span></span>
<span class="line">    ResourceOwner firstchild<span class="token punctuation">;</span>   <span class="token comment">/* head of linked list of children */</span></span>
<span class="line">    ResourceOwner nextchild<span class="token punctuation">;</span>    <span class="token comment">/* next child of same parent */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">;</span>           <span class="token comment">/* name (just for debugging) */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">extern</span> ResourceOwner <span class="token function">ResourceOwnerCreate</span><span class="token punctuation">(</span>ResourceOwner parent<span class="token punctuation">,</span></span>
<span class="line">                                         <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">extern</span> <span class="token keyword">void</span> <span class="token function">ResourceOwnerDelete</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>ResourceOwnerCreate</code> 接口创建 Resource Owner 对象时，父级对象将会被记录到新对象的 <code>parent</code> 中，同时新对象也将父级对象原先的 <code>firstchild</code> 记录到自己的 <code>nextchild</code> 中，然后将自己记录为父级对象的 <code>firstchild</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * ResourceOwnerCreate</span>
<span class="line"> *      Create an empty ResourceOwner.</span>
<span class="line"> *</span>
<span class="line"> * All ResourceOwner objects are kept in TopMemoryContext, since they should</span>
<span class="line"> * only be freed explicitly.</span>
<span class="line"> */</span></span>
<span class="line">ResourceOwner</span>
<span class="line"><span class="token function">ResourceOwnerCreate</span><span class="token punctuation">(</span>ResourceOwner parent<span class="token punctuation">,</span> <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    ResourceOwner owner<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    owner <span class="token operator">=</span> <span class="token punctuation">(</span>ResourceOwner<span class="token punctuation">)</span> <span class="token function">MemoryContextAllocZero</span><span class="token punctuation">(</span>TopMemoryContext<span class="token punctuation">,</span></span>
<span class="line">                                                   <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">ResourceOwnerData</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    owner<span class="token operator">-&gt;</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>parent<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        owner<span class="token operator">-&gt;</span>parent <span class="token operator">=</span> parent<span class="token punctuation">;</span></span>
<span class="line">        owner<span class="token operator">-&gt;</span>nextchild <span class="token operator">=</span> parent<span class="token operator">-&gt;</span>firstchild<span class="token punctuation">;</span></span>
<span class="line">        parent<span class="token operator">-&gt;</span>firstchild <span class="token operator">=</span> owner<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">return</span> owner<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>后续对 Resource Owner 对象进行资源释放时，可以通过这几个指针递归释放所有子对象持有的资源。</p><h2 id="资源动态追踪" tabindex="-1"><a class="header-anchor" href="#资源动态追踪"><span>资源动态追踪</span></a></h2><p>有了 Resource Owner 对象后，通过下面的接口可以追踪资源：</p><ul><li><code>ResourceOwnerRemember</code> 用于记录资源分配</li><li><code>ResourceOwnerForget</code> 用于在资源归还时移除记录</li><li><code>ResourceOwnerEnlarge</code> 用于在记录资源前确保 Resource Owner 的空间能够追踪这个资源</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">extern</span> <span class="token keyword">void</span> <span class="token function">ResourceOwnerEnlarge</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">extern</span> <span class="token keyword">void</span> <span class="token function">ResourceOwnerRemember</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> Datum value<span class="token punctuation">,</span> <span class="token keyword">const</span> ResourceOwnerDesc <span class="token operator">*</span>kind<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">extern</span> <span class="token keyword">void</span> <span class="token function">ResourceOwnerForget</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> Datum value<span class="token punctuation">,</span> <span class="token keyword">const</span> ResourceOwnerDesc <span class="token operator">*</span>kind<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 Resource Owner 内部通过一个定长数组 + <a href="https://en.wikipedia.org/wiki/Open_addressing" target="_blank" rel="noopener noreferrer">开放寻址</a> 的哈希表来记录资源：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Size of the fixed-size array to hold most-recently remembered resources.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RESOWNER_ARRAY_SIZE</span> <span class="token expression"><span class="token number">32</span></span></span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Initially allocated size of a ResourceOwner&#39;s hash table.  Must be power of</span>
<span class="line"> * two because we use (capacity - 1) as mask for hashing.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RESOWNER_HASH_INIT_SIZE</span> <span class="token expression"><span class="token number">64</span></span></span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">struct</span> <span class="token class-name">ResourceOwnerData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Number of items in the locks cache, array, and hash table respectively.</span>
<span class="line">     * (These are packed together to avoid padding in the struct.)</span>
<span class="line">     */</span></span>
<span class="line">    uint8       nlocks<span class="token punctuation">;</span>         <span class="token comment">/* number of owned locks */</span></span>
<span class="line">    uint8       narr<span class="token punctuation">;</span>           <span class="token comment">/* how many items are stored in the array */</span></span>
<span class="line">    uint32      nhash<span class="token punctuation">;</span>          <span class="token comment">/* how many items are stored in the hash */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The fixed-size array for recent resources.</span>
<span class="line">     *</span>
<span class="line">     * If &#39;sorted&#39; is set, the contents are sorted by release priority.</span>
<span class="line">     */</span></span>
<span class="line">    ResourceElem arr<span class="token punctuation">[</span>RESOWNER_ARRAY_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * The hash table.  Uses open-addressing.  &#39;nhash&#39; is the number of items</span>
<span class="line">     * present; if it would exceed &#39;grow_at&#39;, we enlarge it and re-hash.</span>
<span class="line">     * &#39;grow_at&#39; should be rather less than &#39;capacity&#39; so that we don&#39;t waste</span>
<span class="line">     * too much time searching for empty slots.</span>
<span class="line">     *</span>
<span class="line">     * If &#39;sorted&#39; is set, the contents are no longer hashed, but sorted by</span>
<span class="line">     * release priority.  The first &#39;nhash&#39; elements are occupied, the rest</span>
<span class="line">     * are empty.</span>
<span class="line">     */</span></span>
<span class="line">    ResourceElem <span class="token operator">*</span>hash<span class="token punctuation">;</span></span>
<span class="line">    uint32      capacity<span class="token punctuation">;</span>       <span class="token comment">/* allocated length of hash[] */</span></span>
<span class="line">    uint32      grow_at<span class="token punctuation">;</span>        <span class="token comment">/* grow hash when reach this */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The local locks cache. */</span></span>
<span class="line">    LOCALLOCK  <span class="token operator">*</span>locks<span class="token punctuation">[</span>MAX_RESOWNER_LOCKS<span class="token punctuation">]</span><span class="token punctuation">;</span>  <span class="token comment">/* list of owned locks */</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当需要记录资源时，先将资源放入定长数组中；如果数组满了，就将定长数组中的所有内容移入哈希表；当哈希表的容量达到阈值时还需要扩容哈希表。在查找资源时，需要搜索定长数组和哈希表。</p><p>设置一个定长数组的原因是，大部分资源使用的生命周期很短，因此可以在定长数组中快速地线性搜索资源并移除记录。</p><h2 id="资源释放和泄漏检测" tabindex="-1"><a class="header-anchor" href="#资源释放和泄漏检测"><span>资源释放和泄漏检测</span></a></h2><p>事务结束时，通过下面的函数确保资源释放：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">extern</span> <span class="token keyword">void</span> <span class="token function">ResourceOwnerRelease</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span></span>
<span class="line">                                 ResourceReleasePhase phase<span class="token punctuation">,</span></span>
<span class="line">                                 bool isCommit<span class="token punctuation">,</span></span>
<span class="line">                                 bool isTopLevel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>具体地，分为两种情况：</p><ul><li>事务提交：意味着资源分配和资源释放的代码都被完整执行了，此时 Resource Owner 对象内不应该残留未被释放的资源；如果有，则意味着内核代码有问题</li><li>事务中止：意味着代码执行到某个位置后发生异常，不再向下执行；此时已经分配并记录在 Resource Owner 对象中的资源需要被全部释放</li></ul><p>此外，每类资源释放的阶段和优先级也有细微区别。有些资源分别需要在表锁被释放之前/之后释放，在同一个阶段释放的资源也有先后关系。所以每一类对象都需要注册自己的释放阶段、释放优先级，以及释放本类资源的回调函数；如果检测到资源泄漏，还可以注册一个打印泄漏资源信息的回调函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Resource releasing is done in three phases: pre-locks, locks, and</span>
<span class="line"> * post-locks.  The pre-lock phase must release any resources that are visible</span>
<span class="line"> * to other backends (such as pinned buffers); this ensures that when we</span>
<span class="line"> * release a lock that another backend may be waiting on, it will see us as</span>
<span class="line"> * being fully out of our transaction.  The post-lock phase should be used for</span>
<span class="line"> * backend-internal cleanup.</span>
<span class="line"> *</span>
<span class="line"> * Within each phase, resources are released in priority order.  Priority is</span>
<span class="line"> * just an integer specified in ResourceOwnerDesc.  The priorities of built-in</span>
<span class="line"> * resource types are given below, extensions may use any priority relative to</span>
<span class="line"> * those or RELEASE_PRIO_FIRST/LAST.  RELEASE_PRIO_FIRST is a fine choice if</span>
<span class="line"> * your resource doesn&#39;t depend on any other resources.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    RESOURCE_RELEASE_BEFORE_LOCKS <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">,</span></span>
<span class="line">    RESOURCE_RELEASE_LOCKS<span class="token punctuation">,</span></span>
<span class="line">    RESOURCE_RELEASE_AFTER_LOCKS<span class="token punctuation">,</span></span>
<span class="line"><span class="token punctuation">}</span> ResourceReleasePhase<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * In order to track an object, resowner.c needs a few callbacks for it.</span>
<span class="line"> * The callbacks for resources of a specific kind are encapsulated in</span>
<span class="line"> * ResourceOwnerDesc.</span>
<span class="line"> *</span>
<span class="line"> * Note that the callbacks occur post-commit or post-abort, so the callback</span>
<span class="line"> * functions can only do noncritical cleanup and must not fail.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">ResourceOwnerDesc</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">;</span>           <span class="token comment">/* name for the object kind, for debugging */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* when are these objects released? */</span></span>
<span class="line">    ResourceReleasePhase release_phase<span class="token punctuation">;</span></span>
<span class="line">    ResourceReleasePriority release_priority<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Release resource.</span>
<span class="line">     *</span>
<span class="line">     * This is called for each resource in the resource owner, in the order</span>
<span class="line">     * specified by &#39;release_phase&#39; and &#39;release_priority&#39; when the whole</span>
<span class="line">     * resource owner is been released or when ResourceOwnerReleaseAllOfKind()</span>
<span class="line">     * is called.  The resource is implicitly removed from the owner, the</span>
<span class="line">     * callback function doesn&#39;t need to call ResourceOwnerForget.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>ReleaseResource<span class="token punctuation">)</span> <span class="token punctuation">(</span>Datum res<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Format a string describing the resource, for debugging purposes.  If a</span>
<span class="line">     * resource has not been properly released before commit, this is used to</span>
<span class="line">     * print a WARNING.</span>
<span class="line">     *</span>
<span class="line">     * This can be left to NULL, in which case a generic &quot;[resource name]: %p&quot;</span>
<span class="line">     * format is used.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>DebugPrint<span class="token punctuation">)</span> <span class="token punctuation">(</span>Datum res<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span> ResourceOwnerDesc<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="示例-追踪文件句柄资源" tabindex="-1"><a class="header-anchor" href="#示例-追踪文件句柄资源"><span>示例：追踪文件句柄资源</span></a></h3><p>以 <strong>文件句柄</strong> 这个资源为例。在文件句柄被打开和关闭时，分别使用 <code>ResourceOwnerRememberFile</code> 和 <code>ResourceOwnerForgetFile</code> 在 Resource Owner 对象中记录和移除文件句柄。如果事务异常中止，那么在释放掉表锁之后，通过注册的 <code>ResOwnerReleaseFile</code> 回调函数关闭文件句柄；如果事务提交时检测到文件句柄存在残留，则释放资源后通过 <code>ResOwnerPrintFile</code> 回调函数打印警告信息：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">const</span> ResourceOwnerDesc file_resowner_desc <span class="token operator">=</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">.</span>name <span class="token operator">=</span> <span class="token string">&quot;File&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>release_phase <span class="token operator">=</span> RESOURCE_RELEASE_AFTER_LOCKS<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>release_priority <span class="token operator">=</span> RELEASE_PRIO_FILES<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>ReleaseResource <span class="token operator">=</span> ResOwnerReleaseFile<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>DebugPrint <span class="token operator">=</span> ResOwnerPrintFile</span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* Convenience wrappers over ResourceOwnerRemember/Forget */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResourceOwnerRememberFile</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">ResourceOwnerRemember</span><span class="token punctuation">(</span>owner<span class="token punctuation">,</span> <span class="token function">Int32GetDatum</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>file_resowner_desc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResourceOwnerForgetFile</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> File file<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">ResourceOwnerForget</span><span class="token punctuation">(</span>owner<span class="token punctuation">,</span> <span class="token function">Int32GetDatum</span><span class="token punctuation">(</span>file<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>file_resowner_desc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="资源释放顺序" tabindex="-1"><a class="header-anchor" href="#资源释放顺序"><span>资源释放顺序</span></a></h3><p>由于 Resource Owner 对象需要按照资源注册的释放阶段和释放优先级进行按序释放，所以在事务结束前，或后台工作进程退出前，需要调用 <code>ResourceOwnerRelease</code> 三次，分别释放三个阶段中的所有资源。以事务中止为例：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> *  AbortTransaction</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">AbortTransaction</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Post-abort cleanup.  See notes in CommitTransaction() concerning</span>
<span class="line">     * ordering.  We can skip all of it if the transaction failed before</span>
<span class="line">     * creating a resource owner.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>TopTransactionResourceOwner <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">        <span class="token function">ResourceOwnerRelease</span><span class="token punctuation">(</span>TopTransactionResourceOwner<span class="token punctuation">,</span></span>
<span class="line">                             RESOURCE_RELEASE_BEFORE_LOCKS<span class="token punctuation">,</span></span>
<span class="line">                             false<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">        <span class="token function">ResourceOwnerRelease</span><span class="token punctuation">(</span>TopTransactionResourceOwner<span class="token punctuation">,</span></span>
<span class="line">                             RESOURCE_RELEASE_LOCKS<span class="token punctuation">,</span></span>
<span class="line">                             false<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token function">ResourceOwnerRelease</span><span class="token punctuation">(</span>TopTransactionResourceOwner<span class="token punctuation">,</span></span>
<span class="line">                             RESOURCE_RELEASE_AFTER_LOCKS<span class="token punctuation">,</span></span>
<span class="line">                             false<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * State remains TRANS_ABORT until CleanupTransaction().</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">RESUME_INTERRUPTS</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，在 Resource Owner 对象开始做第一次释放之前，需要先对当前对象内记录的所有资源进行排序。具体的方式是将定长数组和哈希表中的资源全部汇聚到一起，然后按照释放阶段和释放优先级进行快速排序，并通过 <code>sorted</code> 字段标记当前对象内的所有资源已被排序，下一阶段的释放不再需要重复排序：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResourceOwnerReleaseInternal</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span></span>
<span class="line">                             ResourceReleasePhase phase<span class="token punctuation">,</span></span>
<span class="line">                             bool isCommit<span class="token punctuation">,</span></span>
<span class="line">                             bool isTopLevel<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Recurse to handle descendants */</span></span>
<span class="line">    <span class="token keyword">for</span> <span class="token punctuation">(</span>child <span class="token operator">=</span> owner<span class="token operator">-&gt;</span>firstchild<span class="token punctuation">;</span> child <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span> child <span class="token operator">=</span> child<span class="token operator">-&gt;</span>nextchild<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ResourceOwnerReleaseInternal</span><span class="token punctuation">(</span>child<span class="token punctuation">,</span> phase<span class="token punctuation">,</span> isCommit<span class="token punctuation">,</span> isTopLevel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>owner<span class="token operator">-&gt;</span>sorted<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ResourceOwnerSort</span><span class="token punctuation">(</span>owner<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        owner<span class="token operator">-&gt;</span>sorted <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Comparison function to sort by release phase and priority</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">int</span></span>
<span class="line"><span class="token function">resource_priority_cmp</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>a<span class="token punctuation">,</span> <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>b<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">const</span> ResourceElem <span class="token operator">*</span>ra <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">const</span> ResourceElem <span class="token operator">*</span><span class="token punctuation">)</span> a<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">const</span> ResourceElem <span class="token operator">*</span>rb <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">const</span> ResourceElem <span class="token operator">*</span><span class="token punctuation">)</span> b<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Note: reverse order */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>ra<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_phase <span class="token operator">==</span> rb<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_phase<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token function">pg_cmp_u32</span><span class="token punctuation">(</span>rb<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_priority<span class="token punctuation">,</span> ra<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_priority<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>ra<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_phase <span class="token operator">&gt;</span> rb<span class="token operator">-&gt;</span>kind<span class="token operator">-&gt;</span>release_phase<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        <span class="token keyword">return</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="完整示例-追踪-buffer-pin-资源" tabindex="-1"><a class="header-anchor" href="#完整示例-追踪-buffer-pin-资源"><span>完整示例：追踪 Buffer Pin 资源</span></a></h2><p>在使用一个 Buffer Pool 中的 buffer 之前，需要先 pin 住这个 buffer，防止其它进程将这个 buffer 换出 Buffer Pool；在使用完毕后，应当及时 unpin，否则这个 buffer 将永远无法被换出 Buffer Pool。当 Buffer Pool 中全是这样的 buffer 时，其它数据页面将永远无法被访问了。因此，buffer pin 是一个需要被谨慎追踪的资源。</p><p>PostgreSQL 定义了对 buffer pin 资源的追踪函数：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">const</span> ResourceOwnerDesc buffer_pin_resowner_desc <span class="token operator">=</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token punctuation">.</span>name <span class="token operator">=</span> <span class="token string">&quot;buffer pin&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>release_phase <span class="token operator">=</span> RESOURCE_RELEASE_BEFORE_LOCKS<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>release_priority <span class="token operator">=</span> RELEASE_PRIO_BUFFER_PINS<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>ReleaseResource <span class="token operator">=</span> ResOwnerReleaseBufferPin<span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">.</span>DebugPrint <span class="token operator">=</span> ResOwnerPrintBufferPin</span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* Convenience wrappers over ResourceOwnerRemember/Forget */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResourceOwnerRememberBuffer</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> Buffer buffer<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">ResourceOwnerRemember</span><span class="token punctuation">(</span>owner<span class="token punctuation">,</span> <span class="token function">Int32GetDatum</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>buffer_pin_resowner_desc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">inline</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResourceOwnerForgetBuffer</span><span class="token punctuation">(</span>ResourceOwner owner<span class="token punctuation">,</span> Buffer buffer<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">ResourceOwnerForget</span><span class="token punctuation">(</span>owner<span class="token punctuation">,</span> <span class="token function">Int32GetDatum</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>buffer_pin_resowner_desc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这两个函数会分别在 pin / unpin buffer 时被调用：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * PinBuffer -- make buffer unavailable for replacement.</span>
<span class="line"> *</span>
<span class="line"> * ...</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> bool</span>
<span class="line"><span class="token function">PinBuffer</span><span class="token punctuation">(</span>BufferDesc <span class="token operator">*</span>buf<span class="token punctuation">,</span> BufferAccessStrategy strategy<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    ref<span class="token operator">-&gt;</span>refcount<span class="token operator">++</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>ref<span class="token operator">-&gt;</span>refcount <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">ResourceOwnerRememberBuffer</span><span class="token punctuation">(</span>CurrentResourceOwner<span class="token punctuation">,</span> b<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">return</span> result<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * UnpinBuffer -- make buffer available for replacement.</span>
<span class="line"> *</span>
<span class="line"> * This should be applied only to shared buffers, never local ones.  This</span>
<span class="line"> * always adjusts CurrentResourceOwner.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">UnpinBuffer</span><span class="token punctuation">(</span>BufferDesc <span class="token operator">*</span>buf<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Buffer      b <span class="token operator">=</span> <span class="token function">BufferDescriptorGetBuffer</span><span class="token punctuation">(</span>buf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">ResourceOwnerForgetBuffer</span><span class="token punctuation">(</span>CurrentResourceOwner<span class="token punctuation">,</span> b<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">UnpinBufferNoOwner</span><span class="token punctuation">(</span>buf<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当 pin 住一个 buffer 后出现异常时，<code>UnpinBuffer</code> 就没有机会被执行了，那么其中的 <code>ResourceOwnerForgetBuffer</code> 也不会被执行，Resource Owner 对象中就残留了这个 buffer pin 资源。在后续由 Resource Owner 主导的资源释放过程中，buffer pin 资源注册的 <code>ResOwnerReleaseBufferPin</code> 函数将会被回调，从而释放这个 buffer pin 资源：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">static</span> <span class="token keyword">void</span></span>
<span class="line"><span class="token function">ResOwnerReleaseBufferPin</span><span class="token punctuation">(</span>Datum res<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    Buffer      buffer <span class="token operator">=</span> <span class="token function">DatumGetInt32</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Like ReleaseBuffer, but don&#39;t call ResourceOwnerForgetBuffer */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">BufferIsValid</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;bad buffer ID: %d&quot;</span><span class="token punctuation">,</span> buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">BufferIsLocal</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">UnpinLocalBufferNoOwner</span><span class="token punctuation">(</span>buffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        <span class="token function">UnpinBufferNoOwner</span><span class="token punctuation">(</span><span class="token function">GetBufferDescriptor</span><span class="token punctuation">(</span>buffer <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>综上，不管事务运行过程中是否出现异常，buffer pin 资源都能够被释放，从而保证 Buffer Pool 的正确运转。</p><h2 id="相关信息" tabindex="-1"><a class="header-anchor" href="#相关信息"><span>相关信息</span></a></h2><ul><li><p><a href="https://github.com/postgres/postgres/blob/master/src/backend/utils/resowner/README" target="_blank" rel="noopener noreferrer">Notes About Resource Owners</a></p></li><li><p><a href="https://www.postgresql.org/message-id/flat/cbfabeb0-cd3c-e951-a572-19b365ed314d%40iki.fi" target="_blank" rel="noopener noreferrer">ResourceOwner refactoring</a></p></li></ul>`,51)]))}const o=s(p,[["render",i],["__file","PostgreSQL Resource Owner.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Resource%20Owner.html","title":"PostgreSQL - Resource Owner","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"背景","slug":"背景","link":"#背景","children":[]},{"level":2,"title":"层次化管理结构","slug":"层次化管理结构","link":"#层次化管理结构","children":[]},{"level":2,"title":"资源动态追踪","slug":"资源动态追踪","link":"#资源动态追踪","children":[]},{"level":2,"title":"资源释放和泄漏检测","slug":"资源释放和泄漏检测","link":"#资源释放和泄漏检测","children":[{"level":3,"title":"示例：追踪文件句柄资源","slug":"示例-追踪文件句柄资源","link":"#示例-追踪文件句柄资源","children":[]},{"level":3,"title":"资源释放顺序","slug":"资源释放顺序","link":"#资源释放顺序","children":[]}]},{"level":2,"title":"完整示例：追踪 Buffer Pin 资源","slug":"完整示例-追踪-buffer-pin-资源","link":"#完整示例-追踪-buffer-pin-资源","children":[]},{"level":2,"title":"相关信息","slug":"相关信息","link":"#相关信息","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Resource Owner.md"}');export{o as comp,r as data};
