import{_ as o,c as l,a as n,o as d}from"./app-aVGbliEg.js";const i={};function a(r,e){return d(),l("div",null,e[0]||(e[0]=[n('<h1 id="innodb-files" tabindex="-1"><a class="header-anchor" href="#innodb-files"><span>InnoDB - Files</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 10 / 10 15:17</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="参数文件" tabindex="-1"><a class="header-anchor" href="#参数文件"><span>参数文件</span></a></h2><p>MySQL 实例启动时，会到配置文件中读取一些初始化参数。MySQL 实例可以不需要参数文件，使用默认配置。</p><p>数据库参数类似 key-value pair，主要分为以下两种类型：</p><ul><li>静态参数 - MySQL 实例运行时只读</li><li>动态参数 - MySQL 实例运行时可以进行修改 (通过 <code>SET</code> 命令，但是不会对文件中的配置修改)</li></ul><h2 id="日志文件" tabindex="-1"><a class="header-anchor" href="#日志文件"><span>日志文件</span></a></h2><h3 id="错误日志" tabindex="-1"><a class="header-anchor" href="#错误日志"><span>错误日志</span></a></h3><p>对 MySQL 的启动、运行、关闭过程进行记录。当 MySQL 无法启动时，首先应当查找错误日志文件。</p><h3 id="慢查询日志" tabindex="-1"><a class="header-anchor" href="#慢查询日志"><span>慢查询日志</span></a></h3><p>可以帮助 DBA 定位可能存在问题的 SQL 语句，并进行优化。在 MySQL 启动时，可以设置一个阈值，将执行时间超过该值的 SQL 语句记录到慢查询日志中。默认情况下，MySQL 不启动它。当慢查询日志中的内容越来越多时，就需要使用 <code>mysqldumpslow</code> 工具来进行慢查询日志的分析。</p><p>慢查询日志的输出格式默认是 <strong>文件</strong>，但也可以将其设置为 <strong>表</strong>。</p><h3 id="查询日志" tabindex="-1"><a class="header-anchor" href="#查询日志"><span>查询日志</span></a></h3><p>记录了所有对 MySQL 数据库请求的信息，无论请求是否得到了正确执行。</p><h3 id="二进制日志" tabindex="-1"><a class="header-anchor" href="#二进制日志"><span>二进制日志</span></a></h3><p>记录了对 MySQL 数据库 <strong>执行更改</strong> 的所有操作 (即不包括 <code>SELECT</code> 或 <code>SHOW</code> 等)，仅在事务提交前提交。主要用于：</p><ul><li>恢复</li><li>复制 (主从实时同步)</li><li>审计 (是否存在数据库注入攻击)</li></ul><p>二进制日志文件在默认情况下不启动，需要手动指定参数来启动。MySQL 官方手册中的测试表明，开启二进制日志会使性能有 1% 的下降，是可以被接受的。</p><p>参数 <code>max_binlog_size</code> 指定了单个二进制日志文件的最大值，如果超过该值，则将要产生新的二进制日志文件。当存储引擎开始执行一个事务时，二进制日志将会被记录到专门为事务分配的大小为 <code>binlog_cache_size</code> 的缓存中；超出后，缓冲的二进制日志将会被写入一个临时文件中。</p><p>默认情况下，二进制日志并不是在每次写入的时候就写回磁盘，当 OS crash 时，可能部分二进制日志还没有落到磁盘上。参数 <code>sync_binlog</code> 表示每向内存缓冲写多少次就同步一次磁盘 - 当这个值为 <code>1</code> 时，相当于使用 <strong>同步写磁盘</strong> 的方式来写二进制日志。</p><p><code>binlog_format</code> 参数影响着记录二进制日志的格式，对表的存储引擎支持有限制。它是一个动态参数。</p><ul><li><code>STATEMENT</code> - 记录的是日志的逻辑 SQL 语句</li><li><code>ROW</code> - 记录表的行更改情况 (占用磁盘空间多)</li><li><code>MIXED</code> - 混合使用</li></ul><p>查看二进制日志文件的内容必须使用 <code>mysqlbinlog</code>。</p><h2 id="套接字文件" tabindex="-1"><a class="header-anchor" href="#套接字文件"><span>套接字文件</span></a></h2><p>在 UNIX 系统下本地连接 MySQL 可以使用 UNIX 域套接字 - 读写该文件即可。</p><h2 id="pid-文件" tabindex="-1"><a class="header-anchor" href="#pid-文件"><span>PID 文件</span></a></h2><p>MySQL 实例启动时，会将自身的进程 ID 写入该文件中。</p><h2 id="表结构定义文件" tabindex="-1"><a class="header-anchor" href="#表结构定义文件"><span>表结构定义文件</span></a></h2><p>MySQL 数据的存储是根据表进行的，每个表都会有一个与之对应的文件，无论采用何种存储引擎，都会有一个以 <code>.frm</code> 为后缀名的文件，其中记录了表结构定义。另外，<code>.frm</code> 还用来存放 <strong>视图</strong> 的定义。</p><h2 id="innodb-存储引擎文件" tabindex="-1"><a class="header-anchor" href="#innodb-存储引擎文件"><span>InnoDB 存储引擎文件</span></a></h2><h3 id="表空间文件" tabindex="-1"><a class="header-anchor" href="#表空间文件"><span>表空间文件</span></a></h3><p>InnoDB 将存储的数据按 <em>表空间 (tablespace)</em> 进行存放。用户可以用多个文件组成一个表空间，若多个文件在不同的磁盘上，磁盘的负载可能被平均，从而可以提高数据库的整体性能。设置 <code>innodb_data_file_path</code> 后，所有基于 InnoDB 存储引擎的表数据都会记录到 <strong>共享表空间</strong> 中；而若设置了 <code>innodb_file_per_table</code>，则用户可以为每一个基于 InnoDB 存储引擎的表产生一个 <strong>独立表空间</strong>，命名规则为 <code>表名.ibd</code>。</p><p>单独的表空间仅存储该表的数据、索引、插入缓冲 bitmap 等信息，其余信息还是存放在默认的表空间中。</p><h3 id="redo-日志文件" tabindex="-1"><a class="header-anchor" href="#redo-日志文件"><span>Redo 日志文件</span></a></h3><p>默认情况下，InnoDB 存储引擎的数据目录下会有两个文件：<code>ib_logfile0</code> 和 <code>ib_logfile1</code>，即 redo log 文件。当实例或介质失败时，redo log 能够将数据库恢复到掉电前的时刻，以保护数据完整性。</p><p>每个 InnoDB 存储引擎至少有一个 <strong>redo log 文件组</strong>，每个文件组下至少有两个 <strong>redo log 文件</strong>。为了提供 redo log 的高可用性，可以在不同磁盘上设置多个镜像文件组。文件组中的每个 redo log 文件大小一致，以循环写入的方式运行：先写文件 1，满了以后再写文件 2，满了以后再写文件 1。</p><ul><li><code>innodb_log_file_size</code> - 指定每个 redo log 文件的大小</li><li><code>innodb_log_files_in_group</code> - 指定文件组中 redo log 文件的数量</li><li><code>innodb_mirrored_log_groups</code> - 指定文件组的数量 (如果磁盘本身已经高可用，比如 RAID，那么无需使用镜像)</li><li><code>innodb_log_group_home_dir</code> - 指定文件组所在的路径</li></ul><p>Redo log 文件大小的设置对 InnoDB 存储引擎的性能有着非常大的影响：</p><ul><li>如果太大，那么恢复将会耗费很长的时间</li><li>如果太小，一个事务的日志可能需要多次切换 redo log 文件，或频繁发生 checkpoint</li></ul><p>MySQL 的二进制日志会记录所有与 MySQL 数据库有关的操作，包括其它存储引擎；而 InnoDB 的 redo log 显然只记录以 InnoDB 为存储引擎的表操作。另外，InnoDB redo log 记录的是每个页更改的物理情况，而不是逻辑情况。</p><p>写入 redo log 时并不是直接写入磁盘，而是先写入一个 redo log buffer 中，然后按一定的条件顺序写入日志文件：</p><ul><li>Master thread 每秒例程</li><li>参数 <code>innodb_flush_log_at_trx_commit</code> 控制在事务提交时处理 redo log 的方式 <ul><li><code>0</code> - 不写入文件，等待 master thread 的每秒例程</li><li><code>1</code> - 将 redo log buffer 同步写回磁盘 (<code>fsync</code>)</li><li><code>2</code> - 将 redo log buffer 异步写回磁盘 (由 OS 文件系统负责，OS 不 crash 就没事)</li></ul></li></ul><p>如果要保证事务 ACID 特性中的 <strong>持久性</strong>，必须将上述参数设置为 <code>1</code>，保证事务提交时所有操作都已写入磁盘上的 redo log 文件。当数据库 crash 时，可以保证能够恢复已经提交的事务。</p><hr>',47)]))}const c=o(i,[["render",a],["__file","InnoDB Files.html.vue"]]),t=JSON.parse('{"path":"/notes/MySQL/InnoDB%20Files.html","title":"InnoDB - Files","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"参数文件","slug":"参数文件","link":"#参数文件","children":[]},{"level":2,"title":"日志文件","slug":"日志文件","link":"#日志文件","children":[{"level":3,"title":"错误日志","slug":"错误日志","link":"#错误日志","children":[]},{"level":3,"title":"慢查询日志","slug":"慢查询日志","link":"#慢查询日志","children":[]},{"level":3,"title":"查询日志","slug":"查询日志","link":"#查询日志","children":[]},{"level":3,"title":"二进制日志","slug":"二进制日志","link":"#二进制日志","children":[]}]},{"level":2,"title":"套接字文件","slug":"套接字文件","link":"#套接字文件","children":[]},{"level":2,"title":"PID 文件","slug":"pid-文件","link":"#pid-文件","children":[]},{"level":2,"title":"表结构定义文件","slug":"表结构定义文件","link":"#表结构定义文件","children":[]},{"level":2,"title":"InnoDB 存储引擎文件","slug":"innodb-存储引擎文件","link":"#innodb-存储引擎文件","children":[{"level":3,"title":"表空间文件","slug":"表空间文件","link":"#表空间文件","children":[]},{"level":3,"title":"Redo 日志文件","slug":"redo-日志文件","link":"#redo-日志文件","children":[]}]}],"git":{},"filePathRelative":"notes/MySQL/InnoDB Files.md"}');export{c as comp,t as data};