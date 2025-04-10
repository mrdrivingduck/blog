import{_ as l,c as i,a as n,o}from"./app-CT9FvwxE.js";const r={};function a(t,e){return o(),i("div",null,e[0]||(e[0]=[n('<h1 id="innodb-checkpoint" tabindex="-1"><a class="header-anchor" href="#innodb-checkpoint"><span>InnoDB - Checkpoint</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 10 / 09 21:05</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="checkpoint" tabindex="-1"><a class="header-anchor" href="#checkpoint"><span>Checkpoint</span></a></h2><p>基于磁盘的数据库存储引擎使用 <strong>内存缓冲区</strong> 协调 CPU 与磁盘之间的速度鸿沟。当 DML 语句改变了页中的记录时，该页将会变为 <strong>脏页</strong>。数据库需要将这样的页写回到磁盘上，以持久化 DML 语句对数据的改动。这一过程引出了两个问题：</p><ol><li>性能问题</li><li>持久性问题</li></ol><p>性能问题体现在，如果每当页面变成脏页时，就将内存页同步写回磁盘，将会带来大量的 I/O 开销，尤其是 DML 仅操作几个热点数据所在页面时。那么，以什么样的频率将内存页同步写回磁盘上呢？</p><p>持久性问题体现在，如果数据库出现意外 crash，内存中的脏页还没有来得及写回磁盘，也就是说磁盘上的数据是过时的。那么下次启动数据库时，如何将数据库的状态恢复到 crash 前的状态 (磁盘 + 内存中脏页)？</p><p>当前的事务数据库系统普遍使用 <em>Write Ahead Log</em> 策略，即当事务提交时，先写 redo log，然后再修改内存页。当数据库 crash 时，通过 redo log 可以将数据库恢复到正确的状态。理论上给定两个极端条件：</p><ol><li>内存足够大，能够缓存整个数据库的数据 - 那么理论上不需要写回磁盘，因为用于缓存的空闲页足够</li><li>Redo log 的文件大小无限大 - 理论上可以将数据库的状态从头到尾恢复出来</li></ol><p>条件一在目前的硬件条件下很难满足，TB 级的 MySQL 数据规模 (磁盘上) 已不少见，但 TB 级的内存很少见。对于第二个条件，看起来没问题，但是从头开始恢复数据库状态是一个很费时的过程，类似于 Redis 的 AOF 持久化；并且，也无法预测 redo log 什么时候接近磁盘空间的可用阈值。</p><p>Checkpoint (检查点) 技术用于解决上述问题：</p><ul><li>缩短数据库恢复时间</li><li>脏页写回的时机问题</li><li>Redo log 的容量问题</li></ul><p>在检查点之前的页面都已经被持久化到磁盘中，当数据库 crash 时，只需要根据检查点之后的 redo log 进行恢复，因而恢复时间大大缩短。</p><p>当内存缓冲池不够用时，如果根据 LRU 算法选出的淘汰页是脏页，那么将强制执行一次 checkpoint，将脏页写回磁盘。Redo log 也是循环使用的 (ring buffer ?)，当 checkpoint 之前的数据已经被写入磁盘后，相应的 redo log 就没啥用了 (数据库 crash 后的恢复并不需要这部分 redo log)，可以被之后的 redo log 覆盖；如果 redo log 中的空间不够了，那么也会强制执行一次 checkpoint，腾出 redo log 中的空间。</p><p>Checkpoint 发生的时间、条件、脏页选择的机制十分复杂，因为需要决定以下参数：</p><ul><li>每次写回多少个脏页到磁盘上</li><li>每次从哪里取脏页</li><li>什么时间触发 checkpoint</li></ul><p>在 InnoDB 中，有两种 checkpoint：</p><ul><li>Sharp checkpoint - 将所有的脏页写回磁盘 (发生在数据库关闭时)</li><li>Fuzzy checkpoint - 只将一部分的脏页写回磁盘，包含以下几种类型： <ul><li>Master thread checkpoint - 以固定频率写回一些脏页，异步 (用户查询线程不会阻塞)</li><li>Flush LRU list checkpoint - 内存缓冲池中空闲页不够，从 LRU 列表的尾端淘汰页面，如果其中有脏页，则写回</li><li>Async/Sync flush checkpoint - redo log 不可用时，需要强制将一些页面写回磁盘，保证 redo log 的循环可用性</li><li>Dirty page too much checkpoint - 脏页数量太多，强制写回以保证缓冲池中有足够空闲页</li></ul></li></ul><p>以上触发阈值都应该有相应的参数可以进行配置。</p><h2 id="master-thread" tabindex="-1"><a class="header-anchor" href="#master-thread"><span>Master Thread</span></a></h2><h3 id="before-innodb-1-0-x" tabindex="-1"><a class="header-anchor" href="#before-innodb-1-0-x"><span>Before InnoDB 1.0.x</span></a></h3><p>这个线程拥有最高的线程优先级，内部由多个循环组成。</p><p>Loop 是主循环，大多数操作都发生在这个循环中，主要分为每秒发生一次的操作和每十秒发生一次的操作 (在负载较大的情况下可能会有延迟)。每秒一次的操作包含：</p><ul><li>将日志缓冲写入磁盘 (总是)</li><li>合并插入缓冲 (当 I/O 压力小时)</li><li>最多将 100 个脏页写回磁盘 (脏页比例较高时)</li><li>切换到 background loop (如果没有用户活动)</li></ul><p>每十秒的操作包含：</p><ul><li>将 100 个脏页写回磁盘 (磁盘有足够 I/O 能力时)</li><li>合并插入缓冲 (总是)</li><li>将日志缓冲写入磁盘 (总是)</li><li>删除没用的 undo 页 (full purge 操作) (总是)</li><li>刷新 100 个或 10% 的脏页到磁盘 (判断脏页比例)</li></ul><p>在数据库空闲或关闭时会切换到 background 循环，执行以下操作：</p><ul><li>删除没用的 undo 页 (总是)</li><li>合并 20 个插入缓冲 (总是)</li><li>跳回主循环 (如果不空闲)</li><li>不断将 100 个脏页写回磁盘，直到符合条件 (跳转到 flush loop)</li></ul><h3 id="before-innodb-1-2-x" tabindex="-1"><a class="header-anchor" href="#before-innodb-1-2-x"><span>Before InnoDB 1.2.x</span></a></h3><ul><li>将写回脏页的数量以及合并插入缓冲的个数，由原来的 hard code，变为参数化</li><li>脏页写回的触发比例调优</li><li>InnoDB 会通过判断产生 undo log 的速度来决定最合适的刷新脏页数量 (自适应写回)</li><li>参数化控制每次 full purge 回收 undo 页的数量</li></ul><h3 id="innodb-1-2-x" tabindex="-1"><a class="header-anchor" href="#innodb-1-2-x"><span>InnoDB 1.2.x</span></a></h3><p>对于刷新脏页的操作，独立到了 page cleaner thread 中，减轻 master thread 的工作，提高系统并发性。</p><hr>',36)]))}const h=l(r,[["render",a],["__file","InnoDB Checkpoint.html.vue"]]),c=JSON.parse('{"path":"/notes/MySQL/InnoDB%20Checkpoint.html","title":"InnoDB - Checkpoint","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Checkpoint","slug":"checkpoint","link":"#checkpoint","children":[]},{"level":2,"title":"Master Thread","slug":"master-thread","link":"#master-thread","children":[{"level":3,"title":"Before InnoDB 1.0.x","slug":"before-innodb-1-0-x","link":"#before-innodb-1-0-x","children":[]},{"level":3,"title":"Before InnoDB 1.2.x","slug":"before-innodb-1-2-x","link":"#before-innodb-1-2-x","children":[]},{"level":3,"title":"InnoDB 1.2.x","slug":"innodb-1-2-x","link":"#innodb-1-2-x","children":[]}]}],"git":{},"filePathRelative":"notes/MySQL/InnoDB Checkpoint.md"}');export{h as comp,c as data};
