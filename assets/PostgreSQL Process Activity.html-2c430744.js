import{_ as a,r as e,o as t,c as i,a as n,b as c,d as l,e as o}from"./app-25fa875f.js";const p={},d=o(`<h1 id="postgresql-process-activity" tabindex="-1"><a class="header-anchor" href="#postgresql-process-activity" aria-hidden="true">#</a> PostgreSQL - Process Activity</h1><p>Created by : Mr Dk.</p><p>2023 / 03 / 06 00:07</p><p>Hangzhou, Zhejiang, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p>PostgreSQL 是一个多进程架构的数据库。在数据库运行过程中，PostgreSQL 提供了丰富的系统视图来展示目前系统的运行状况，涵盖了系统的方方面面。这些视图主要分为两类：</p><ul><li>用于展示系统当前运行情况的视图</li><li>用于展示系统截至目前累积的统计信息的视图</li></ul><p>前者展示的是某个瞬间的系统状态，后者展示的是截止目前的一个时间段内的系统状态。这些系统视图全部以 <code>pg_stat_</code> 开头。本文将分析其中最为常用的 <code>pg_stat_activity</code> 系统视图的实现，该视图用于展示某一时刻 PostgreSQL 所有服务器进程的活动状态，可被用于查询实时连接数、慢 SQL 的执行状态等。</p><p>本文基于 PostgreSQL 15 稳定分支 <code>REL_15_STABLE</code> 的如下版本号作分析：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>commit f61e60102f08305f3cb9e55a7958b8036a02fe39
Author: Tom Lane &lt;tgl@sss.pgh.pa.us&gt;
Date:   Sat Mar 4 13:32:35 2023 -0500

    Avoid failure when altering state of partitioned foreign-key triggers.
    
    Beginning in v15, if you apply ALTER TABLE ENABLE/DISABLE TRIGGER to
    a partitioned table, it also affects the partitions&#39; cloned versions
    of the affected trigger(s).  The initial implementation of this
    located the clones by name, but that fails on foreign-key triggers
    which have names incorporating their own OIDs.  We can fix that, and
    also make the behavior more bulletproof in the face of user-initiated
    trigger renames, by identifying the cloned triggers by tgparentid.
    
    Following the lead of earlier commits in this area, I took care not
    to break ABI in the v15 branch, even though I rather doubt there
    are any external callers of EnableDisableTrigger.
    
    While here, update the documentation, which was not touched when
    the semantics were changed.
    
    Per bug #17817 from Alan Hodgson.  Back-patch to v15; older versions
    do not have this behavior.
    
    Discussion: https://postgr.es/m/17817-31dfb7c2100d9f3d@postgresql.org
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="view-definition" tabindex="-1"><a class="header-anchor" href="#view-definition" aria-hidden="true">#</a> View Definition</h2><p><code>pg_stat_activity</code> 是一个系统视图，其视图定义如下：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">VIEW</span> pg_stat_activity <span class="token keyword">AS</span>
    <span class="token keyword">SELECT</span>
            S<span class="token punctuation">.</span>datid <span class="token keyword">AS</span> datid<span class="token punctuation">,</span>
            D<span class="token punctuation">.</span>datname <span class="token keyword">AS</span> datname<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>pid<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>leader_pid<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>usesysid<span class="token punctuation">,</span>
            U<span class="token punctuation">.</span>rolname <span class="token keyword">AS</span> usename<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>application_name<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>client_addr<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>client_hostname<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>client_port<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>backend_start<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>xact_start<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>query_start<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>state_change<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>wait_event_type<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>wait_event<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>state<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>backend_xid<span class="token punctuation">,</span>
            s<span class="token punctuation">.</span>backend_xmin<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>query_id<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>query<span class="token punctuation">,</span>
            S<span class="token punctuation">.</span>backend_type
    <span class="token keyword">FROM</span> pg_stat_get_activity<span class="token punctuation">(</span><span class="token boolean">NULL</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> S
        <span class="token keyword">LEFT</span> <span class="token keyword">JOIN</span> pg_database <span class="token keyword">AS</span> D <span class="token keyword">ON</span> <span class="token punctuation">(</span>S<span class="token punctuation">.</span>datid <span class="token operator">=</span> D<span class="token punctuation">.</span>oid<span class="token punctuation">)</span>
        <span class="token keyword">LEFT</span> <span class="token keyword">JOIN</span> pg_authid <span class="token keyword">AS</span> U <span class="token keyword">ON</span> <span class="token punctuation">(</span>S<span class="token punctuation">.</span>usesysid <span class="token operator">=</span> U<span class="token punctuation">.</span>oid<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从视图定义中可以看出，视图中的主要信息来自 <code>pg_stat_get_activity</code> 函数，辅以将函数中输出的每个进程连接到的数据库 oid 与用户 oid 分别与 <code>pg_database</code> 和 <code>pg_authid</code> 两张系统表进行连接，从而得到每个进程连接到的数据库名和用户名。所以接下来简要分析 <code>pg_stat_get_activity</code> 函数的实现。</p><h2 id="implementation" tabindex="-1"><a class="header-anchor" href="#implementation" aria-hidden="true">#</a> Implementation</h2><h3 id="backend-status-array" tabindex="-1"><a class="header-anchor" href="#backend-status-array" aria-hidden="true">#</a> Backend Status Array</h3><p><code>pg_stat_get_activity</code> 函数是一个 set returning function，返回的每一行都是一个进程的活动信息。其信息的来源是，PostgreSQL 的每一个进程（包括服务客户端连接的后端进程，以及其它后台辅助进程）都会在共享内存中维护一个 <code>PgBackendStatus</code> 结构体，其中记录了这个进程正在进行的活动，其定义如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------
 * PgBackendStatus
 *
 * Each live backend maintains a PgBackendStatus struct in shared memory
 * showing its current activity.  (The structs are allocated according to
 * BackendId, but that is not critical.)  Note that this is unrelated to the
 * cumulative stats system (i.e. pgstat.c et al).
 *
 * Each auxiliary process also maintains a PgBackendStatus struct in shared
 * memory.
 * ----------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PgBackendStatus</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * To avoid locking overhead, we use the following protocol: a backend
     * increments st_changecount before modifying its entry, and again after
     * finishing a modification.  A would-be reader should note the value of
     * st_changecount, copy the entry into private memory, then check
     * st_changecount again.  If the value hasn&#39;t changed, and if it&#39;s even,
     * the copy is valid; otherwise start over.  This makes updates cheap
     * while reads are potentially expensive, but that&#39;s the tradeoff we want.
     *
     * The above protocol needs memory barriers to ensure that the apparent
     * order of execution is as it desires.  Otherwise, for example, the CPU
     * might rearrange the code so that st_changecount is incremented twice
     * before the modification on a machine with weak memory ordering.  Hence,
     * use the macros defined below for manipulating st_changecount, rather
     * than touching it directly.
     */</span>
    <span class="token keyword">int</span>         st_changecount<span class="token punctuation">;</span>

    <span class="token comment">/* The entry is valid iff st_procpid &gt; 0, unused if st_procpid == 0 */</span>
    <span class="token keyword">int</span>         st_procpid<span class="token punctuation">;</span>

    <span class="token comment">/* Type of backends */</span>
    BackendType st_backendType<span class="token punctuation">;</span>

    <span class="token comment">/* Times when current backend, transaction, and activity started */</span>
    TimestampTz st_proc_start_timestamp<span class="token punctuation">;</span>
    TimestampTz st_xact_start_timestamp<span class="token punctuation">;</span>
    TimestampTz st_activity_start_timestamp<span class="token punctuation">;</span>
    TimestampTz st_state_start_timestamp<span class="token punctuation">;</span>

    <span class="token comment">/* Database OID, owning user&#39;s OID, connection client address */</span>
    Oid         st_databaseid<span class="token punctuation">;</span>
    Oid         st_userid<span class="token punctuation">;</span>
    SockAddr    st_clientaddr<span class="token punctuation">;</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>st_clienthostname<span class="token punctuation">;</span>  <span class="token comment">/* MUST be null-terminated */</span>

    <span class="token comment">/* Information about SSL connection */</span>
    bool        st_ssl<span class="token punctuation">;</span>
    PgBackendSSLStatus <span class="token operator">*</span>st_sslstatus<span class="token punctuation">;</span>

    <span class="token comment">/* Information about GSSAPI connection */</span>
    bool        st_gss<span class="token punctuation">;</span>
    PgBackendGSSStatus <span class="token operator">*</span>st_gssstatus<span class="token punctuation">;</span>

    <span class="token comment">/* current state */</span>
    BackendState st_state<span class="token punctuation">;</span>

    <span class="token comment">/* application name; MUST be null-terminated */</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>st_appname<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Current command string; MUST be null-terminated. Note that this string
     * possibly is truncated in the middle of a multi-byte character. As
     * activity strings are stored more frequently than read, that allows to
     * move the cost of correct truncation to the display side. Use
     * pgstat_clip_activity() to truncate correctly.
     */</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>st_activity_raw<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Command progress reporting.  Any command which wishes can advertise
     * that it is running by setting st_progress_command,
     * st_progress_command_target, and st_progress_param[].
     * st_progress_command_target should be the OID of the relation which the
     * command targets (we assume there&#39;s just one, as this is meant for
     * utility commands), but the meaning of each element in the
     * st_progress_param array is command-specific.
     */</span>
    ProgressCommandType st_progress_command<span class="token punctuation">;</span>
    Oid         st_progress_command_target<span class="token punctuation">;</span>
    int64       st_progress_param<span class="token punctuation">[</span>PGSTAT_NUM_PROGRESS_PARAM<span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token comment">/* query identifier, optionally computed using post_parse_analyze_hook */</span>
    uint64      st_query_id<span class="token punctuation">;</span>
<span class="token punctuation">}</span> PgBackendStatus<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到其中记录了进程的 pid、进程的类型、进程正在进行的活动，以及客户端连接 / 事务 / 查询 / 状态开始的时间。在共享内存中，所有进程的这个结构被维护在一个数组中：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> PgBackendStatus <span class="token operator">*</span>BackendStatusArray <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>既然是存放在共享内存中，就可能同时被多个进程读写，所以需要一定的进程同步机制。这个结构体的进程同步机制是使用结构体中的 <code>st_changecount</code> 计数器实现的。当一个进程需要修改该结构体中的信息时，首先需要自增这个计数器；在修改完毕以后，也需要自增这个计数器。当进程想要读取这个结构时，首先需要记录下该结构的计数器数值，然后将共享内存中的结构拷贝到进程私有内存后，再次检查这个计数器的值。如果计数器的值没有变，并且是一个偶数，那么说明进程私有内存中的结构体副本是安全可用的；否则说明结构在拷贝过程中发生了并发更新，需要重新到共享内存中拷贝一个正确的副本。在这个并发协议中，<strong>更新这个结构的开销比读取这个结构的开销要低</strong>，这正是设计者想要获得的 trade off：每一个进程在进入不同的状态时都需要更新这个结构，频率极高，并且每个进程只更新自己的结构；而对该结构的访问只会出现在显式调用 <code>pg_stat_get_activity</code> 时，其频率相对来说是很低的。</p><h3 id="local-backend-status-table" tabindex="-1"><a class="header-anchor" href="#local-backend-status-table" aria-hidden="true">#</a> Local Backend Status Table</h3><p>在某个进程想要获取共享内存中 <code>BackendStatusArray</code> 数组的所有内容时，就需要把整个数组中的内容拷贝一份到该进程私有的内存中，再进行后续的操作。这个过程由 <code>pgstat_read_current_status</code> 函数实现：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------
 * pgstat_read_current_status() -
 *
 *  Copy the current contents of the PgBackendStatus array to local memory,
 *  if not already done in this transaction.
 * ----------
 */</span>
<span class="token keyword">static</span> <span class="token keyword">void</span>
<span class="token function">pgstat_read_current_status</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">volatile</span> PgBackendStatus <span class="token operator">*</span>beentry<span class="token punctuation">;</span>
    LocalPgBackendStatus <span class="token operator">*</span>localtable<span class="token punctuation">;</span>
    LocalPgBackendStatus <span class="token operator">*</span>localentry<span class="token punctuation">;</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>localappname<span class="token punctuation">,</span>
               <span class="token operator">*</span>localclienthostname<span class="token punctuation">,</span>
               <span class="token operator">*</span>localactivity<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">USE_SSL</span></span>
    PgBackendSSLStatus <span class="token operator">*</span>localsslstatus<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">ENABLE_GSS</span></span>
    PgBackendGSSStatus <span class="token operator">*</span>localgssstatus<span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
    <span class="token keyword">int</span>         i<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>localBackendStatusTable<span class="token punctuation">)</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>                 <span class="token comment">/* already done */</span>

    <span class="token function">pgstat_setup_backend_status_context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * Allocate storage for local copy of state data.  We can presume that
     * none of these requests overflow size_t, because we already calculated
     * the same values using mul_size during shmem setup.  However, with
     * probably-silly values of pgstat_track_activity_query_size and
     * max_connections, the localactivity buffer could exceed 1GB, so use
     * &quot;huge&quot; allocation for that one.
     */</span>
    localtable <span class="token operator">=</span> <span class="token punctuation">(</span>LocalPgBackendStatus <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAlloc</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                           <span class="token keyword">sizeof</span><span class="token punctuation">(</span>LocalPgBackendStatus<span class="token punctuation">)</span> <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
    localappname <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAlloc</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                           NAMEDATALEN <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
    localclienthostname <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAlloc</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                           NAMEDATALEN <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
    localactivity <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAllocHuge</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                               pgstat_track_activity_query_size <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">USE_SSL</span></span>
    localsslstatus <span class="token operator">=</span> <span class="token punctuation">(</span>PgBackendSSLStatus <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAlloc</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                           <span class="token keyword">sizeof</span><span class="token punctuation">(</span>PgBackendSSLStatus<span class="token punctuation">)</span> <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifdef</span> <span class="token expression">ENABLE_GSS</span></span>
    localgssstatus <span class="token operator">=</span> <span class="token punctuation">(</span>PgBackendGSSStatus <span class="token operator">*</span><span class="token punctuation">)</span>
        <span class="token function">MemoryContextAlloc</span><span class="token punctuation">(</span>backendStatusSnapContext<span class="token punctuation">,</span>
                           <span class="token keyword">sizeof</span><span class="token punctuation">(</span>PgBackendGSSStatus<span class="token punctuation">)</span> <span class="token operator">*</span> NumBackendStatSlots<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    localNumBackends <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

    beentry <span class="token operator">=</span> BackendStatusArray<span class="token punctuation">;</span>
    localentry <span class="token operator">=</span> localtable<span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> NumBackendStatSlots<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * Follow the protocol of retrying if st_changecount changes while we
         * copy the entry, or if it&#39;s odd.  (The check for odd is needed to
         * cover the case where we are able to completely copy the entry while
         * the source backend is between increment steps.)  We use a volatile
         * pointer here to ensure the compiler doesn&#39;t try to get cute.
         */</span>

        <span class="token comment">/* ... */</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Set the pointer only after completion of a valid table */</span>
    localBackendStatusTable <span class="token operator">=</span> localtable<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该函数会从共享内存的 <code>BackendStatusArray</code> 结构体中复制一份到进程私有内存中，保存在如下数组里：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Status for backends including auxiliary */</span>
<span class="token keyword">static</span> LocalPgBackendStatus <span class="token operator">*</span>localBackendStatusTable <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

<span class="token comment">/* Total number of backends including auxiliary */</span>
<span class="token keyword">static</span> <span class="token keyword">int</span>  localNumBackends <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>进程私有内存中的 <code>LocalPgBackendStatus</code> 结构体相比于共享内存中的 <code>PgBackendStatus</code> 结构体，除了原有的所有信息，还新增了事务相关的信息：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------
 * LocalPgBackendStatus
 *
 * When we build the backend status array, we use LocalPgBackendStatus to be
 * able to add new values to the struct when needed without adding new fields
 * to the shared memory. It contains the backend status as a first member.
 * ----------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">LocalPgBackendStatus</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Local version of the backend status entry.
     */</span>
    PgBackendStatus backendStatus<span class="token punctuation">;</span>

    <span class="token comment">/*
     * The xid of the current transaction if available, InvalidTransactionId
     * if not.
     */</span>
    TransactionId backend_xid<span class="token punctuation">;</span>

    <span class="token comment">/*
     * The xmin of the current session if available, InvalidTransactionId if
     * not.
     */</span>
    TransactionId backend_xmin<span class="token punctuation">;</span>
<span class="token punctuation">}</span> LocalPgBackendStatus<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="get-activity" tabindex="-1"><a class="header-anchor" href="#get-activity" aria-hidden="true">#</a> Get Activity</h3><p>最终，<code>pg_stat_get_activity</code> 函数利用了上述 <code>pgstat_read_current_status</code> 函数的支持，从共享内存中拷贝所有进程的状态信息到进程私有内存中，然后依次把私有内存中每一个进程的状态信息进行进一步的加工，然后组装为元组返回。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * Returns activity of PG backends.
 */</span>
Datum
<span class="token function">pg_stat_get_activity</span><span class="token punctuation">(</span>PG_FUNCTION_ARGS<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">PG_STAT_GET_ACTIVITY_COLS</span>   <span class="token expression"><span class="token number">30</span></span></span>
    <span class="token keyword">int</span>         num_backends <span class="token operator">=</span> <span class="token function">pgstat_fetch_stat_numbackends</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span>         curr_backend<span class="token punctuation">;</span>
    <span class="token keyword">int</span>         pid <span class="token operator">=</span> <span class="token function">PG_ARGISNULL</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token operator">:</span> <span class="token function">PG_GETARG_INT32</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    ReturnSetInfo <span class="token operator">*</span>rsinfo <span class="token operator">=</span> <span class="token punctuation">(</span>ReturnSetInfo <span class="token operator">*</span><span class="token punctuation">)</span> fcinfo<span class="token operator">-&gt;</span>resultinfo<span class="token punctuation">;</span>

    <span class="token function">InitMaterializedSRF</span><span class="token punctuation">(</span>fcinfo<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* 1-based index */</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>curr_backend <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> curr_backend <span class="token operator">&lt;=</span> num_backends<span class="token punctuation">;</span> curr_backend<span class="token operator">++</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/* for each row */</span>
        Datum       values<span class="token punctuation">[</span>PG_STAT_GET_ACTIVITY_COLS<span class="token punctuation">]</span><span class="token punctuation">;</span>
        bool        nulls<span class="token punctuation">[</span>PG_STAT_GET_ACTIVITY_COLS<span class="token punctuation">]</span><span class="token punctuation">;</span>

        <span class="token comment">/* ... */</span>

        <span class="token function">tuplestore_putvalues</span><span class="token punctuation">(</span>rsinfo<span class="token operator">-&gt;</span>setResult<span class="token punctuation">,</span> rsinfo<span class="token operator">-&gt;</span>setDesc<span class="token punctuation">,</span> values<span class="token punctuation">,</span> nulls<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/* If only a single backend was requested, and we found it, break. */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>pid <span class="token operator">!=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token punctuation">(</span>Datum<span class="token punctuation">)</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在当前版本（PostgreSQL 15）中，该函数返回的每一行都包含 30 个列，其中的信息为：</p><ol><li>进程连接到的数据库 oid</li><li>进程的 pid</li><li>通过该进程登录的用户 ID</li><li>连接到该进程的应用名称</li><li>进程当前状态</li><li>进程当前正在执行的 SQL</li><li>进程当前的等待事件类型</li><li>进程当前的等待事件</li><li>进程进入当前事务的开始时间</li><li>进程进入当前活动的开始时间</li><li>当前进程启动的时间</li><li>进程进入当前状态的开始时间</li><li>客户端 IP 地址</li><li>客户端域名</li><li>客户端端口号</li><li>进程当前事务的事务 ID</li><li>进程当前的 xmin</li><li>后台进程类型（如果这个进程是一个后台进程）</li><li>是否启用了 SSL</li><li>SSL 版本</li><li>SSL 加密套件</li><li>SSL bits</li><li>SSL 客户端 DN</li><li>SSL 客户端序列号</li><li>SSL 发放方 DN</li><li>是否启用了 GSS</li><li>GSS Principle</li><li>GSS 是否启用加密</li><li>进程的并行组 leader 的 pid</li><li>查询标识符</li></ol><p>其中，暴露到 <code>pg_stat_activity</code> 视图中的只有其中的部分列。另外，部分列做了权限控制，只有 superuser 或具有 <code>pg_read_all_stats</code> 角色的用户才可以看到所有进程这些列的信息。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,36),r={href:"https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW",target:"_blank",rel:"noopener noreferrer"};function u(v,k){const s=e("ExternalLinkIcon");return t(),i("div",null,[d,n("p",null,[n("a",r,[c("PostgreSQL Documentation - 28.2. The Cumulative Statistics System"),l(s)])])])}const b=a(p,[["render",u],["__file","PostgreSQL Process Activity.html.vue"]]);export{b as default};
