import{_ as l,c as i,b as n,e as a,d as p,w as c,a as r,r as t,o}from"./app-DfFNXaa-.js";const u={};function d(v,s){const e=t("RouteLink");return o(),i("div",null,[s[3]||(s[3]=n("h1",{id:"postgresql-vacuum-eager-scan",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#postgresql-vacuum-eager-scan"},[n("span",null,"PostgreSQL - VACUUM Eager Scan")])],-1)),s[4]||(s[4]=n("p",null,"Created by: Mr Dk.",-1)),s[5]||(s[5]=n("p",null,"Co-authored by: Claude Opus 4.6",-1)),s[6]||(s[6]=n("p",null,"2026 / 06 / 05 19:00",-1)),s[7]||(s[7]=n("p",null,"Hangzhou, Zhejiang, China",-1)),s[8]||(s[8]=n("hr",null,null,-1)),s[9]||(s[9]=n("h2",{id:"背景",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#背景"},[n("span",null,"背景")])],-1)),n("p",null,[s[1]||(s[1]=a("PostgreSQL 的 ",-1)),p(e,{to:"/notes/PostgreSQL/PostgreSQL%20VACUUM.html"},{default:c(()=>[...s[0]||(s[0]=[a("VACUUM",-1)])]),_:1}),s[2]||(s[2]=a(" 机制负责回收死亡元组、冻结旧事务 ID、维护 Visibility Map。其中，冻结（freeze）是防止事务 ID 回卷的关键操作。然而，冻结机制存在一个长期困扰用户的性能问题：aggressive vacuum I/O 风暴。",-1))]),s[10]||(s[10]=r(`<p>生产环境中常见这样的场景：一个数据库平稳运行了几周甚至几个月，监控指标一切正常。某天凌晨，autovacuum 突然触发了一次 aggressive vacuum，磁盘 I/O 瞬间飙升，导致前台查询的延迟出现明显毛刺甚至超时。日志显示某张大表的事务 ID 老化到了阈值，触发了一次全表级别的冻结扫描。</p><p>这不是偶发现象，而是 PostgreSQL MVCC 冻结机制的结构性问题。根源在于日常的 normal vacuum 只关心回收死亡元组的空间，顺手把页面标记为 all-visible，但并不急着冻结页面上元组的事务 ID。于是，表中会静默积累大量 &quot;可见但未冻结&quot; 的页面。这些页面对 normal vacuum 来说不再有工作需要做了，因此是可以被跳过的。然而一旦表的冻结水位线老化到阈值，aggressive vacuum 被触发，它的所有未冻结页面都需要被扫描一遍。更糟糕的是，这些页面可能长期不被访问，早已从 buffer pool 甚至 OS page cache 中被淘汰，扫描它们意味着大量的冷读 I/O，甚至可能冲击到前台业务。</p><p>PostgreSQL 18 引入了 eager scan 机制来解决这个问题。核心思路是：在每次 normal vacuum 中，&quot;顺手&quot; 扫描一部分 all-visible 但未 all-frozen 的页面并尝试冻结它们，将 aggressive vacuum 的冻结负担分摊到多次 normal vacuum 中。这个设计最初由核心开发者 Robert Haas 提出，经过 Andres Freund、Tomas Vondra 和 Melanie Plageman 的改进完善，最终由 Melanie Plageman 提交：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">commit 052026c9b903380b428a4c9ba2ec90726db81288</span>
<span class="line">Author: Melanie Plageman &lt;melanieplageman@gmail.com&gt;</span>
<span class="line">Date:   Tue Feb 11 13:52:19 2025 -0500</span>
<span class="line"></span>
<span class="line">    Eagerly scan all-visible pages to amortize aggressive vacuum</span>
<span class="line"></span>
<span class="line">    Aggressive vacuums must scan every unfrozen tuple in order to advance</span>
<span class="line">    the relfrozenxid/relminmxid. Because data is often vacuumed before it is</span>
<span class="line">    old enough to require freezing, relations may build up a large backlog</span>
<span class="line">    of pages that are set all-visible but not all-frozen in the visibility</span>
<span class="line">    map. When an aggressive vacuum is triggered, all of these pages must be</span>
<span class="line">    scanned. These pages have often been evicted from shared buffers and</span>
<span class="line">    even from the kernel buffer cache. Thus, aggressive vacuums often incur</span>
<span class="line">    large amounts of extra I/O at the expense of foreground workloads.</span>
<span class="line"></span>
<span class="line">    To amortize the cost of aggressive vacuums, eagerly scan some</span>
<span class="line">    all-visible but not all-frozen pages during normal vacuums.</span>
<span class="line"></span>
<span class="line">    All-visible pages that are eagerly scanned and set all-frozen in the</span>
<span class="line">    visibility map are counted as successful eager freezes and those not</span>
<span class="line">    frozen are counted as failed eager freezes.</span>
<span class="line"></span>
<span class="line">    If too many eager scans fail in a row, eager scanning is temporarily</span>
<span class="line">    suspended until a later portion of the relation. The number of failures</span>
<span class="line">    tolerated is configurable globally and per table.</span>
<span class="line"></span>
<span class="line">    To effectively amortize aggressive vacuums, we cap the number of</span>
<span class="line">    successes as well. Capping eager freeze successes also limits the amount</span>
<span class="line">    of potentially wasted work if these pages are modified again before the</span>
<span class="line">    next aggressive vacuum. Once we reach the maximum number of blocks</span>
<span class="line">    successfully eager frozen, eager scanning is disabled for the remainder</span>
<span class="line">    of the vacuum of the relation.</span>
<span class="line"></span>
<span class="line">    Original design idea from Robert Haas, with enhancements from</span>
<span class="line">    Andres Freund, Tomas Vondra, and me</span>
<span class="line"></span>
<span class="line">    Reviewed-by: Robert Haas &lt;robertmhaas@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Masahiko Sawada &lt;sawada.mshk@gmail.com&gt;</span>
<span class="line">    Reviewed-by: Andres Freund &lt;andres@anarazel.de&gt;</span>
<span class="line">    Reviewed-by: Robert Treat &lt;rob@xzilla.net&gt;</span>
<span class="line">    Reviewed-by: Bilal Yavuz &lt;byavuz81@gmail.com&gt;</span>
<span class="line">    Discussion: https://postgr.es/m/flat/CAAKRu_ZF_KCzZuOrPrOqjGVe8iRVWEAJSpzMgRQs%3D5-v84cXUg%40mail.gmail.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>本文先回顾 vacuum 中的各个阈值，再分析 eager scan 的设计思路和配额机制。</p><h2 id="xid-阈值体系" tabindex="-1"><a class="header-anchor" href="#xid-阈值体系"><span>XID 阈值体系</span></a></h2><p>要理解 eager scan 的触发条件，需要先理清 vacuum 中几个关键的 XID 阈值。下图展示了 XID 时间线上各阈值的相对位置，从老到新依次为：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">XID timeline (old → new)</span>
<span class="line"></span>
<span class="line"> failsafe  anti-wraparound  aggressiveXIDCutoff  FreezeLimit  OldestXmin  NextXID</span>
<span class="line">     |            |                  |                 |            |          |</span>
<span class="line">     v            v                  v                 v            v          v</span>
<span class="line">─────┼────────────┼──────────────────┼─────────────────┼────────────┼──────────┼──→</span>
<span class="line">     |            |                  |                 |            |          |</span>
<span class="line">     |            |                  |                 |&lt;-- freeze_min_age ---&gt;|</span>
<span class="line">     |            |                  |                 |                       |</span>
<span class="line">     |            |                  |&lt;---- freeze_table_age (default 150M)---&gt;|</span>
<span class="line">     |            |                                                            |</span>
<span class="line">     |            |&lt;-------- autovacuum_freeze_max_age (default 200M) --------&gt;|</span>
<span class="line">     |                                                                         |</span>
<span class="line">     |&lt;------------ failsafe_age (default 1.6B, &gt;= max_age * 1.05) -----------&gt;|</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些 XID 阈值的比较对象是 <code>relfrozenxid</code>——这是记录在 <code>pg_class</code> 中的表级属性，保证该表的元组头部中不存在任何小于该值的未冻结事务 ID。表的 <code>relfrozenxid</code> 与最新事务 ID 的距离可以理解为表的 &quot;冻结年龄&quot;。</p><p>各阈值的具体含义：</p><ul><li>NextXID：下一个将要分配的事务 ID，是时间线的&quot;当前位置&quot;。</li><li>OldestXmin：vacuum 的回收边界。只有 XID 小于此值的已提交事务所删除的元组，才能被 vacuum 安全回收——因为不会再有任何活跃事务需要看到它们。</li><li>FreezeLimit：vacuum 的冻结边界。当元组头部的事务 ID（xmin、xmax 等）小于此值时，vacuum 扫描到该元组会将其冻结。由 <code>vacuum_freeze_min_age</code>（默认 5000 万）控制，意味着元组至少要存活 5000 万个事务之后才有资格被冻结。</li><li>aggressiveXIDCutoff：aggressive vacuum 的触发线。当表的冻结年龄超过此值时，vacuum 进入 aggressive 模式，必须扫描所有未冻结页面来推进 <code>relfrozenxid</code>。由 <code>vacuum_freeze_table_age</code>（默认 1.5 亿）控制，但会被限制在 <code>autovacuum_freeze_max_age * 0.95</code> 以内，以确保用户手动调度的 vacuum 有机会在 anti-wraparound autovacuum 介入之前完成冻结工作。</li><li>Anti-wraparound 阈值：autovacuum 强制介入的触发线。当表的冻结年龄超过此值时，autovacuum 会强制对该表发起 vacuum，无论表上有多少死亡元组。由 <code>autovacuum_freeze_max_age</code>（默认 2 亿）控制。这是防止 XID 回卷的最后一道常规防线。</li><li>Failsafe 阈值：XID 回卷灾难前的最后兜底机制。当表的冻结年龄超过此值时，vacuum 进入 failsafe 模式——跳过索引清理，全力推进冻结。由 <code>vacuum_failsafe_age</code>（默认 16 亿）控制，但不会低于 <code>autovacuum_freeze_max_age * 1.05</code>。</li></ul><p>MultiXact 有一套类似的阈值体系（<code>OldestMxact</code>、<code>MultiXactCutoff</code>、<code>relminmxid</code>），逻辑对称，不再赘述。</p><h2 id="normal-vacuum-与-aggressive-vacuum" tabindex="-1"><a class="header-anchor" href="#normal-vacuum-与-aggressive-vacuum"><span>Normal VACUUM 与 Aggressive VACUUM</span></a></h2><p>Normal vacuum 和 aggressive vacuum 走的是同一套代码路径，但目标不同。这导致两者对 all-visible 页面的处理策略不同：</p><ul><li>Normal vacuum 利用 Visibility Map 跳过 all-visible 的页面，因为这些页面上没有死亡元组需要清理。Normal vacuum 的目标是回收空间，冻结只是 &quot;顺手做&quot; 的事情：在回收某个页面的空间时，如果恰好上面的元组足够老，就冻结它们。</li><li>Aggressive vacuum 不能跳过 all-visible 但未 all-frozen 的页面，它的目标是推进 <code>relfrozenxid</code>。而要安全推进这个值，就必须确保表中所有旧元组都被冻结。只有 all-frozen 的页面才能被 aggressive vacuum 跳过。</li></ul><p>Aggressive vacuum 一旦触发就需要扫描所有不是 all-frozen 的页面。对于一张长期被 normal vacuum 维护的大表，可能有大量页面处于 all-visible 但未 all-frozen 的状态——这些页面上的元组早就不再被修改，但因为 &quot;不够老&quot;，之前的 normal vacuum 扫描它们时没有做冻结。等到 aggressive vacuum 终于到来，这些页面可能已经被淘汰出 buffer pool，读取它们需要消耗大量的物理 I/O。</p><p>这就是 aggressive vacuum 问题的本质：冻结工作长期推迟，最终集中爆发。</p><h2 id="eager-scan-的设计" tabindex="-1"><a class="header-anchor" href="#eager-scan-的设计"><span>Eager Scan 的设计</span></a></h2><p>Eager scan 的核心思想是，在 normal vacuum 中，主动扫描一部分原本可以跳过的 all-visible 但未 all-frozen 页面，尝试冻结它们。如果冻结成功，那么下一次 aggressive vacuum 就可以跳过它们。相当于把 aggressive vacuum 的冻结负担，分摊到了多次 normal vacuum 中。</p><p>Eager scan 带来的收益是削平 I/O 峰值：aggressive vacuum 需要扫描的页面数量减少，I/O 负载更平滑。</p><p>但 eager scan 不是免费的午餐，它在 normal vacuum 中引入了额外的 I/O 和 CPU 开销。更重要的是：如果一个页面被 eager scan 冻结后，在下一次 aggressive vacuum 之前又被修改了（比如有新的 UPDATE），那么这个页面的 all-frozen 状态会被清除，冻结工作等于白做了。这种场景下 eager scan 的开销变成了纯粹的浪费。</p><p>因此，eager scan 的设计需要在两个方向上做限制：</p><ol><li>限制成功次数：不要一次冻结太多页面。Eager scan 的初衷是为了分摊，而不是包揽。另外冻结太多页面，浪费的概率也会上升。</li><li>限制失败次数：如果某个区域的页面因为元组太新而无法冻结，继续在这个区域尝试大概率也是浪费，应该及时止损。</li></ol><h2 id="配额设计" tabindex="-1"><a class="header-anchor" href="#配额设计"><span>配额设计</span></a></h2><p>Eager scan 的配额系统用两个独立的计数器分别限制成功和失败的次数，并且两者的作用域不同。这一选择充分体现了工程上的妥协艺术。</p><h3 id="成功上限-全局配额" tabindex="-1"><a class="header-anchor" href="#成功上限-全局配额"><span>成功上限：全局配额</span></a></h3><p>成功上限是单次 vacuum 内对整张表的全局配额。这是为了避免一次 normal vacuum 就可能把所有能冻结的页面都处理完，那和 aggressive vacuum 就没有区别了。计算公式为：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token function">visibilitymap_count</span><span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>rel<span class="token punctuation">,</span> <span class="token operator">&amp;</span>allvisible<span class="token punctuation">,</span> <span class="token operator">&amp;</span>allfrozen<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_successes <span class="token operator">=</span></span>
<span class="line">    <span class="token punctuation">(</span>BlockNumber<span class="token punctuation">)</span> <span class="token punctuation">(</span>MAX_EAGER_FREEZE_SUCCESS_RATE <span class="token operator">*</span></span>
<span class="line">                   <span class="token punctuation">(</span>allvisible <span class="token operator">-</span> allfrozen<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>MAX_EAGER_FREEZE_SUCCESS_RATE</code> 硬编码为 0.2（20%）。也就是说，一次 normal vacuum 最多冻结表中 all-visible 但未 all-frozen 页面数的 20%。每成功冻结一个页面，计数器减一。当计数器归零时，本次 vacuum 的 eager scan 永久关闭：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>vm_page_frozen<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_successes <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_successes<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_successes <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If we hit our success cap, permanently disable eager</span>
<span class="line">         * scanning by setting the other eager scan management</span>
<span class="line">         * fields to their disabled values.</span>
<span class="line">         */</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start <span class="token operator">=</span> InvalidBlockNumber<span class="token punctuation">;</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>eager_scan_max_fails_per_region <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails<span class="token operator">--</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="失败上限-按区域配额" tabindex="-1"><a class="header-anchor" href="#失败上限-按区域配额"><span>失败上限：按区域配额</span></a></h3><p>与成功上限不同，失败上限采用按区域的配额。表被划分为多个大小为 <code>EAGER_SCAN_REGION_SIZE</code>（4096 块，即 32 MB）的区域，每个区域有独立的失败计数器。</p><p>这是因为表中不同区域的数据年龄往往相近——如果某个区域的元组太新无法冻结，那么这个区域内的其他页面大概率也是如此，继续尝试只会浪费 I/O。但表的其他区域可能包含年龄更老的数据，还是值得去尝试的。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line">vacrel<span class="token operator">-&gt;</span>eager_scan_max_fails_per_region <span class="token operator">=</span></span>
<span class="line">    params<span class="token operator">-&gt;</span>max_eager_freeze_failure_rate <span class="token operator">*</span></span>
<span class="line">    EAGER_SCAN_REGION_SIZE<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>vacuum_max_eager_freeze_failure_rate</code> 是一个 GUC 参数，默认 0.03（3%），也可以通过表级存储参数覆盖。以默认值计算，每个 4096 块的区域中允许最多 122 次失败（4096 × 0.03 ≈ 122）。当 eager scan 在某个区域的失败次数耗尽时，eager scan 在该区域内被临时挂起——<code>eager_scan_remaining_fails</code> 归零后，all-visible 但非 all-frozen 的页面会被跳过：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token comment">/*</span>
<span class="line"> * Normal vacuums with eager scanning enabled only skip all-visible</span>
<span class="line"> * but not all-frozen pages if they have hit the failure limit for the</span>
<span class="line"> * current eager scan region.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    next_unskippable_eager_scanned <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>进入下一个区域时，失败计数器重置，eager scan 恢复运行：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>next_unskippable_block <span class="token operator">&gt;=</span> vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">=</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>eager_scan_max_fails_per_region<span class="token punctuation">;</span></span>
<span class="line">    vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start <span class="token operator">+=</span> EAGER_SCAN_REGION_SIZE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="随机起始偏移" tabindex="-1"><a class="header-anchor" href="#随机起始偏移"><span>随机起始偏移</span></a></h3><p>Eager scan 的失败探索是分区域的。其中，第一个失败探索区域的结束位置是随机确定的：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line">randseed <span class="token operator">=</span> <span class="token function">pg_prng_uint32</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>pg_global_prng_state<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start <span class="token operator">=</span> randseed <span class="token operator">%</span> EAGER_SCAN_REGION_SIZE<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>这个随机偏移使得每次 vacuum 的 eager scan 区域边界都不同。如图所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">Block number:</span>
<span class="line">0                    4096                 8192                12288</span>
<span class="line">|--------------------|--------------------|--------------------|---&gt;</span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">VACUUM #1 (offset = 1000):</span>
<span class="line">|----|--------------------|--------------------|-----------...</span>
<span class="line">0  1000                 5096                 9192</span>
<span class="line"></span>
<span class="line">VACUUM #2 (offset = 3500):</span>
<span class="line">|------------|--------------------|--------------------|-...</span>
<span class="line">0          3500                 7596                 11692</span>
<span class="line"></span>
<span class="line">VACUUM #3 (offset = 500):</span>
<span class="line">|--|--------------------|--------------------|--------------...</span>
<span class="line">0 500                 4596                 8692</span>
<span class="line">     &lt;--- 4096 blks ---&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果区域边界固定，某些还不够老的页面每次都落在某个区域的开头，每次都消耗该区域的失败配额，导致该区域后面的页面永远没有机会被尝试冻结。随机偏移能让这些页面每次落在区域内的不同位置上，因而能够让其他页面得到被尝试冻结的机会。</p><h3 id="启用条件" tabindex="-1"><a class="header-anchor" href="#启用条件"><span>启用条件</span></a></h3><p>Eager scan 不是无条件启用的。<code>heap_vacuum_eager_scan_setup()</code> 中有几个前置检查：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token comment">/* If eager scanning is explicitly disabled, just return. */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>params<span class="token operator">-&gt;</span>max_eager_freeze_failure_rate <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>aggressive<span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>rel_pages <span class="token operator">&lt;</span> <span class="token number">2</span> <span class="token operator">*</span> EAGER_SCAN_REGION_SIZE<span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>oldest_unfrozen_before_cutoff<span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* If every all-visible page is frozen, eager scanning is disabled. */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_successes <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">return</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol><li>未被显式禁用：<code>vacuum_max_eager_freeze_failure_rate</code> 设为 0 时禁用。</li><li>不是 aggressive vacuum：aggressive vacuum 本身就会扫描所有未冻结页面，eager scan 的概念不适用。</li><li>表足够大：小于 <code>2 × EAGER_SCAN_REGION_SIZE</code>（8192 块，64 MB）的表被跳过——小表的 aggressive vacuum 本身就很快，不值得分摊。</li><li>数据足够老：只有当 <code>relfrozenxid &lt; FreezeLimit</code> 或 <code>relminmxid &lt; MultiXactCutoff</code> 时才启用。这意味着表中确实存在已经超过冻结年龄的元组，eager scan 去扫描才有可能成功冻结。如果表中最老的元组还没到冻结年龄，eager scan 也冻结不了什么，纯属浪费。</li><li>存在可冻结的页面：如果 VM 中所有 all-visible 页面都已经是 all-frozen，那么就没有工作可做了。</li></ol><p>这些条件的组合确保 eager scan 只在 &quot;有必要且有可能成功&quot; 的场景下运行。</p><h2 id="实现概览" tabindex="-1"><a class="header-anchor" href="#实现概览"><span>实现概览</span></a></h2><p>Eager scan 的状态通过 <code>LVRelState</code> 中的几个字段跟踪：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token comment">/*</span>
<span class="line"> * next_eager_scan_region_start is the block number of the first block</span>
<span class="line"> * eligible for resumed eager scanning.</span>
<span class="line"> *</span>
<span class="line"> * When eager scanning is permanently disabled, either initially</span>
<span class="line"> * (including for aggressive vacuum) or due to hitting the success cap,</span>
<span class="line"> * this is set to InvalidBlockNumber.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber next_eager_scan_region_start<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * The remaining number of blocks a normal vacuum will consider eager</span>
<span class="line"> * scanning when it is successful. When eager scanning is enabled, this</span>
<span class="line"> * is initialized to MAX_EAGER_FREEZE_SUCCESS_RATE of the total number</span>
<span class="line"> * of all-visible but not all-frozen pages. For each eager freeze</span>
<span class="line"> * success, this is decremented. Once it hits 0, eager scanning is</span>
<span class="line"> * permanently disabled.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber eager_scan_remaining_successes<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * The maximum number of blocks which may be eagerly scanned and not</span>
<span class="line"> * frozen before eager scanning is temporarily suspended. Calculated as</span>
<span class="line"> * vacuum_max_eager_freeze_failure_rate of EAGER_SCAN_REGION_SIZE</span>
<span class="line"> * blocks. It is 0 when eager scanning is disabled.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber eager_scan_max_fails_per_region<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * The number of eagerly scanned blocks vacuum failed to freeze (due to</span>
<span class="line"> * age) in the current eager scan region. Vacuum resets it to</span>
<span class="line"> * eager_scan_max_fails_per_region each time it enters a new region of</span>
<span class="line"> * the relation. If eager_scan_remaining_fails hits 0, eager scanning</span>
<span class="line"> * is suspended until the next region.</span>
<span class="line"> */</span></span>
<span class="line">BlockNumber eager_scan_remaining_fails<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在页面扫描循环中，<code>find_next_unskippable_block()</code> 是决定哪些页面需要被扫描的核心函数。引入 eager scan 后，它的跳过逻辑变为：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c"><pre><code class="language-c"><span class="line"><span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span> next_unskippable_block<span class="token operator">++</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    uint8 mapbits <span class="token operator">=</span> <span class="token function">visibilitymap_get_status</span><span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>rel<span class="token punctuation">,</span></span>
<span class="line">                                             next_unskippable_block<span class="token punctuation">,</span></span>
<span class="line">                                             <span class="token operator">&amp;</span>next_unskippable_vmbuffer<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* 进入新区域时，重置失败计数器 */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>next_unskippable_block <span class="token operator">&gt;=</span> vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">=</span></span>
<span class="line">            vacrel<span class="token operator">-&gt;</span>eager_scan_max_fails_per_region<span class="token punctuation">;</span></span>
<span class="line">        vacrel<span class="token operator">-&gt;</span>next_eager_scan_region_start <span class="token operator">+=</span> EAGER_SCAN_REGION_SIZE<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* 非 all-visible：必须扫描（可能有死亡元组） */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>mapbits <span class="token operator">&amp;</span> VISIBILITYMAP_ALL_VISIBLE<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* all-frozen：所有模式都可以安全跳过 */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>mapbits <span class="token operator">&amp;</span> VISIBILITYMAP_ALL_FROZEN<span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* aggressive vacuum：必须扫描所有未冻结页面 */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>aggressive<span class="token punctuation">)</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* eager scan：失败配额未耗尽，不跳过 */</span></span>
<span class="line">    <span class="token comment">/* 条件隐含成功配额也未耗尽 */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>vacrel<span class="token operator">-&gt;</span>eager_scan_remaining_fails <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        next_unskippable_eager_scanned <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* normal vacuum 默认行为：跳过 all-visible 但非 all-frozen 的页面 */</span></span>
<span class="line">    <span class="token operator">*</span>skipsallvis <span class="token operator">=</span> true<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>需要注意的是，如果因为锁竞争无法获取 cleanup lock，那么这个页面不算成功也不算失败，不影响配额计数。这避免了因偶发的锁冲突而错误地消耗配额。</p><p>Vacuum 结束后的日志中会记录 eager scan 的统计信息，包括 eagerly scanned 的页面数。用户可以通过这些日志判断 eager scan 是否在有效工作。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>Eager scan 的设计体现了几个重要的工程权衡，这也是系统软件设计中最精妙的部分：</p><ul><li>抹平两种 vacuum 之间的代价差异：冻结事务 ID 本身是一件不可避免的工作，问题在于应该在什么时候做。Eager scan 利用 normal vacuum 已经在扫描表的时机，以较低的边际成本 &quot;搭便车&quot; 完成冻结——相比 aggressive vacuum 从冷存储中重新读取页面，代价小得多。</li><li>用配额来限制探索性工作的不确定性：eager scan 本质上是一种投机行为——扫描一个 all-visible 页面，赌它上面的元组够老可以冻结。投机这种不确定性的代价需要被约束在可控范围内，否则 normal vacuum 本身的代价会变得不可预测。配额机制为这种探索性工作设定了明确的边界：成功上限控制总工作量，失败上限控制无效尝试。</li><li>非对称的配额设计：成功上限是全局的，失败上限是按区域的。这不是随意的选择，而是反映了两者代价的不对称性：为了成功冻结而消耗的 I/O 与位置无关，而失败具有空间局部性，同一区域的数据年龄大概率相近，一个页面冻结不了，相邻页面大概率也不行。</li><li>用随机性打破周期性：区域边界的随机偏移是一种简易而有效的去相关手段——不需要记录历史状态，不需要复杂的调度逻辑，仅靠一次随机数生成就能避免多次 vacuum 之间的系统性盲区。</li></ul><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><ul><li><a href="https://git.postgresql.org/gitweb/?p=postgresql.git;a=commit;h=052026c9b903380b428a4c9ba2ec90726db81288" target="_blank" rel="noopener noreferrer">PostgreSQL commit 052026c9b</a> - Eagerly scan all-visible pages to amortize aggressive vacuum</li><li><a href="https://www.postgresql.org/message-id/flat/CAAKRu_ZF_KCzZuOrPrOqjGVe8iRVWEAJSpzMgRQs%3D5-v84cXUg%40mail.gmail.com" target="_blank" rel="noopener noreferrer">Mailing list discussion</a></li><li><a href="https://github.com/postgres/postgres/blob/master/src/backend/access/heap/vacuumlazy.c" target="_blank" rel="noopener noreferrer">PostgreSQL Source - src/backend/access/heap/vacuumlazy.c</a></li><li><a href="https://github.com/postgres/postgres/blob/master/src/backend/commands/vacuum.c" target="_blank" rel="noopener noreferrer">PostgreSQL Source - src/backend/commands/vacuum.c</a></li><li><a href="https://www.postgresql.org/docs/current/routine-vacuuming.html" target="_blank" rel="noopener noreferrer">PostgreSQL Documentation - Routine Vacuuming</a></li></ul>`,61))])}const g=l(u,[["render",d]]),b=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20VACUUM%20Eager%20Scan.html","title":"PostgreSQL - VACUUM Eager Scan","lang":"en-US","frontmatter":{},"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL VACUUM Eager Scan.md"}');export{g as comp,b as data};
