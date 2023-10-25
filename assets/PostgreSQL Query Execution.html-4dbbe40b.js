import{_ as n,o as s,c as e,e as a}from"./app-25fa875f.js";const t={},o=a(`<h1 id="postgresql-query-execution" tabindex="-1"><a class="header-anchor" href="#postgresql-query-execution" aria-hidden="true">#</a> PostgreSQL - Query Execution</h1><p>Created by : Mr Dk.</p><p>2021 / 06 / 20 22:12</p><p>Hangzhou, Zhejiang, China</p><hr><p>周日，带着电脑去了公司。从流程和数据结构的角度分析一下 PostgreSQL 执行器的大致工作过程。查询计划的具体物理执行留作后续分析。</p><h2 id="portal" tabindex="-1"><a class="header-anchor" href="#portal" aria-hidden="true">#</a> Portal</h2><p>经过查询编译器的工作，用户提交的 SQL 语句已经成为 <strong>查询计划</strong>。接下来，由执行器根据计划对数据进行提取、处理、存储等。在函数 <code>exec_simple_query()</code> 中，在 SQL 被编译为 parse tree 后，依次调用以下几个函数完成 SQL 语句的 <strong>执行</strong>：</p><ul><li><code>CreatePortal()</code>：创建一个干净的 <code>Portal</code>，初始化内存上下文</li><li><code>PortalDefineQuery()</code>：将查询编译器输出的查询计划初始化到 <code>Portal</code> 中</li><li><code>PortalStart()</code>：为 <code>Portal</code> 选择执行策略，并进行与执行策略相关的初始化 (描述符)</li><li><code>PortalRun()</code>：根据执行策略调用执行部件，执行计划</li><li><code>PortalDrop()</code>：清理/释放资源</li></ul><p>其中，<code>Portal</code> 是核心的数据结构。定义如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PortalData</span> <span class="token operator">*</span>Portal<span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PortalData</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* Bookkeeping data */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">;</span>           <span class="token comment">/* portal&#39;s name */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>prepStmtName<span class="token punctuation">;</span>   <span class="token comment">/* source prepared statement (NULL if none) */</span>
    MemoryContext portalContext<span class="token punctuation">;</span>    <span class="token comment">/* subsidiary memory for portal */</span>
    ResourceOwner resowner<span class="token punctuation">;</span>     <span class="token comment">/* resources owned by portal */</span>
    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>cleanup<span class="token punctuation">)</span> <span class="token punctuation">(</span>Portal portal<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* cleanup hook */</span>

    <span class="token comment">/*
     * State data for remembering which subtransaction(s) the portal was
     * created or used in.  If the portal is held over from a previous
     * transaction, both subxids are InvalidSubTransactionId.  Otherwise,
     * createSubid is the creating subxact and activeSubid is the last subxact
     * in which we ran the portal.
     */</span>
    SubTransactionId createSubid<span class="token punctuation">;</span>   <span class="token comment">/* the creating subxact */</span>
    SubTransactionId activeSubid<span class="token punctuation">;</span>   <span class="token comment">/* the last subxact with activity */</span>

    <span class="token comment">/* The query or queries the portal will execute */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>sourceText<span class="token punctuation">;</span>     <span class="token comment">/* text of query (as of 8.4, never NULL) */</span>
    CommandTag  commandTag<span class="token punctuation">;</span>     <span class="token comment">/* command tag for original query */</span>
    QueryCompletion qc<span class="token punctuation">;</span>         <span class="token comment">/* command completion data for executed query */</span>
    List       <span class="token operator">*</span>stmts<span class="token punctuation">;</span>          <span class="token comment">/* list of PlannedStmts */</span>
    CachedPlan <span class="token operator">*</span>cplan<span class="token punctuation">;</span>          <span class="token comment">/* CachedPlan, if stmts are from one */</span>

    ParamListInfo portalParams<span class="token punctuation">;</span> <span class="token comment">/* params to pass to query */</span>
    QueryEnvironment <span class="token operator">*</span>queryEnv<span class="token punctuation">;</span> <span class="token comment">/* environment for query */</span>

    <span class="token comment">/* Features/options */</span>
    PortalStrategy strategy<span class="token punctuation">;</span>    <span class="token comment">/* see above */</span>
    <span class="token keyword">int</span>         cursorOptions<span class="token punctuation">;</span>  <span class="token comment">/* DECLARE CURSOR option bits */</span>
    bool        run_once<span class="token punctuation">;</span>       <span class="token comment">/* portal will only be run once */</span>

    <span class="token comment">/* Status data */</span>
    PortalStatus status<span class="token punctuation">;</span>        <span class="token comment">/* see above */</span>
    bool        portalPinned<span class="token punctuation">;</span>   <span class="token comment">/* a pinned portal can&#39;t be dropped */</span>
    bool        autoHeld<span class="token punctuation">;</span>       <span class="token comment">/* was automatically converted from pinned to
                                 * held (see HoldPinnedPortals()) */</span>

    <span class="token comment">/* If not NULL, Executor is active; call ExecutorEnd eventually: */</span>
    QueryDesc  <span class="token operator">*</span>queryDesc<span class="token punctuation">;</span>      <span class="token comment">/* info needed for executor invocation */</span>

    <span class="token comment">/* If portal returns tuples, this is their tupdesc: */</span>
    TupleDesc   tupDesc<span class="token punctuation">;</span>        <span class="token comment">/* descriptor for result tuples */</span>
    <span class="token comment">/* and these are the format codes to use for the columns: */</span>
    int16      <span class="token operator">*</span>formats<span class="token punctuation">;</span>        <span class="token comment">/* a format code for each column */</span>

    <span class="token comment">/*
     * Outermost ActiveSnapshot for execution of the portal&#39;s queries.  For
     * all but a few utility commands, we require such a snapshot to exist.
     * This ensures that TOAST references in query results can be detoasted,
     * and helps to reduce thrashing of the process&#39;s exposed xmin.
     */</span>
    Snapshot    portalSnapshot<span class="token punctuation">;</span> <span class="token comment">/* active snapshot, or NULL if none */</span>

    <span class="token comment">/*
     * Where we store tuples for a held cursor or a PORTAL_ONE_RETURNING or
     * PORTAL_UTIL_SELECT query.  (A cursor held past the end of its
     * transaction no longer has any active executor state.)
     */</span>
    Tuplestorestate <span class="token operator">*</span>holdStore<span class="token punctuation">;</span> <span class="token comment">/* store for holdable cursors */</span>
    MemoryContext holdContext<span class="token punctuation">;</span>  <span class="token comment">/* memory containing holdStore */</span>

    <span class="token comment">/*
     * Snapshot under which tuples in the holdStore were read.  We must keep a
     * reference to this snapshot if there is any possibility that the tuples
     * contain TOAST references, because releasing the snapshot could allow
     * recently-dead rows to be vacuumed away, along with any toast data
     * belonging to them.  In the case of a held cursor, we avoid needing to
     * keep such a snapshot by forcibly detoasting the data.
     */</span>
    Snapshot    holdSnapshot<span class="token punctuation">;</span>   <span class="token comment">/* registered snapshot, or NULL if none */</span>

    <span class="token comment">/*
     * atStart, atEnd and portalPos indicate the current cursor position.
     * portalPos is zero before the first row, N after fetching N&#39;th row of
     * query.  After we run off the end, portalPos = # of rows in query, and
     * atEnd is true.  Note that atStart implies portalPos == 0, but not the
     * reverse: we might have backed up only as far as the first row, not to
     * the start.  Also note that various code inspects atStart and atEnd, but
     * only the portal movement routines should touch portalPos.
     */</span>
    bool        atStart<span class="token punctuation">;</span>
    bool        atEnd<span class="token punctuation">;</span>
    uint64      portalPos<span class="token punctuation">;</span>

    <span class="token comment">/* Presentation data, primarily used by the pg_cursors system view */</span>
    TimestampTz creation_time<span class="token punctuation">;</span>  <span class="token comment">/* time at which this portal was defined */</span>
    bool        visible<span class="token punctuation">;</span>        <span class="token comment">/* include this portal in pg_cursors? */</span>
<span class="token punctuation">}</span>           PortalData<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中很重要的是 <code>List *stmts</code>，这是查询编译器输出的 <strong>原子操作节点</strong> 的链表，链表的每个节点保存了 (可能包含查询计划树在内的) 操作。其中，可能带有查询计划树的原子操作节点只有 <code>PlannedStmt</code> 和 <code>Query</code> 两类节点。这两类节点中通过 <code>CmdType</code> 字段指示了当前原子操作对应的命令类型：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * CmdType -
 *    enums for type of operation represented by a Query or PlannedStmt
 *
 * This is needed in both parsenodes.h and plannodes.h, so put it here...
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">CmdType</span>
<span class="token punctuation">{</span>
    CMD_UNKNOWN<span class="token punctuation">,</span>
    CMD_SELECT<span class="token punctuation">,</span>                 <span class="token comment">/* select stmt */</span>
    CMD_UPDATE<span class="token punctuation">,</span>                 <span class="token comment">/* update stmt */</span>
    CMD_INSERT<span class="token punctuation">,</span>                 <span class="token comment">/* insert stmt */</span>
    CMD_DELETE<span class="token punctuation">,</span>
    CMD_UTILITY<span class="token punctuation">,</span>                <span class="token comment">/* cmds like create, destroy, copy, vacuum,
                                 * etc. */</span>
    CMD_NOTHING                 <span class="token comment">/* dummy command for instead nothing rules
                                 * with qual */</span>
<span class="token punctuation">}</span> CmdType<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution-strategy" tabindex="-1"><a class="header-anchor" href="#execution-strategy" aria-hidden="true">#</a> Execution Strategy</h2><p>对于一个刚被创建好的 <code>Portal</code>，经过一定的初始化后，查询编译器输出的原子操作链表将会被设置到 <code>Portal</code> 中。在 <code>PortalStart()</code> 函数里，对 <code>Portal</code> 进行执行前的最后一步初始化：根据操作的类型选择 <strong>执行策略</strong> (实现于函数 <code>ChoosePortalStrategy()</code>)：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * We have several execution strategies for Portals, depending on what
 * query or queries are to be executed.  (Note: in all cases, a Portal
 * executes just a single source-SQL query, and thus produces just a
 * single result from the user&#39;s viewpoint.  However, the rule rewriter
 * may expand the single source query to zero or many actual queries.)
 *
 * PORTAL_ONE_SELECT: the portal contains one single SELECT query.  We run
 * the Executor incrementally as results are demanded.  This strategy also
 * supports holdable cursors (the Executor results can be dumped into a
 * tuplestore for access after transaction completion).
 *
 * PORTAL_ONE_RETURNING: the portal contains a single INSERT/UPDATE/DELETE
 * query with a RETURNING clause (plus possibly auxiliary queries added by
 * rule rewriting).  On first execution, we run the portal to completion
 * and dump the primary query&#39;s results into the portal tuplestore; the
 * results are then returned to the client as demanded.  (We can&#39;t support
 * suspension of the query partway through, because the AFTER TRIGGER code
 * can&#39;t cope, and also because we don&#39;t want to risk failing to execute
 * all the auxiliary queries.)
 *
 * PORTAL_ONE_MOD_WITH: the portal contains one single SELECT query, but
 * it has data-modifying CTEs.  This is currently treated the same as the
 * PORTAL_ONE_RETURNING case because of the possibility of needing to fire
 * triggers.  It may act more like PORTAL_ONE_SELECT in future.
 *
 * PORTAL_UTIL_SELECT: the portal contains a utility statement that returns
 * a SELECT-like result (for example, EXPLAIN or SHOW).  On first execution,
 * we run the statement and dump its results into the portal tuplestore;
 * the results are then returned to the client as demanded.
 *
 * PORTAL_MULTI_QUERY: all other cases.  Here, we do not support partial
 * execution: the portal&#39;s queries will be run to completion on first call.
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">PortalStrategy</span>
<span class="token punctuation">{</span>
    PORTAL_ONE_SELECT<span class="token punctuation">,</span>
    PORTAL_ONE_RETURNING<span class="token punctuation">,</span>
    PORTAL_ONE_MOD_WITH<span class="token punctuation">,</span>
    PORTAL_UTIL_SELECT<span class="token punctuation">,</span>
    PORTAL_MULTI_QUERY
<span class="token punctuation">}</span> PortalStrategy<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>PORTAL_ONE_SELECT</code> 处理仅包含一个原子操作的情况 (<code>SELECT</code> 查询)</li><li><code>PORTAL_ONE_RETURNING</code> 处理带有 <code>RETURNING</code> 子句的 DML 操作：先对元组进行修改，然后返回结果</li><li><code>PORTAL_UTIL_SELECT</code> 处理 DDL，返回结果</li><li><code>PORTAL_MULTI_QUERY</code> 处理上述三种操作以外的情况，能处理一个或多个原子操作</li></ul><p>PostgreSQL 执行器中提供两个子模块处理不同类型的操作：</p><ul><li>Executor 模块执行前两类策略 (DQL + DML)，统称为 <em>可优化语句</em>，查询编译器会为这类操作生成计划树</li><li>ProcessUtility 模块执行后两类策略 (DDL 及其它)，主要是一些功能性操作</li></ul><h2 id="ddl-execution" tabindex="-1"><a class="header-anchor" href="#ddl-execution" aria-hidden="true">#</a> DDL Execution</h2><p>DDL 的执行比较简单。执行流程进入 ProcessUtility 模块后，通过判断操作的类型，直接分发进入不同操作的处理函数中。核心逻辑是一个 <code>switch</code> 语句：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>parsetree<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
        <span class="token comment">/*
         * ******************** transactions ********************
         */</span>
    <span class="token keyword">case</span> T_TransactionStmt<span class="token operator">:</span>
        <span class="token punctuation">{</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Portal (cursor) manipulation
         */</span>
    <span class="token keyword">case</span> T_DeclareCursorStmt<span class="token operator">:</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_ClosePortalStmt<span class="token operator">:</span>
        <span class="token punctuation">{</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_FetchStmt<span class="token operator">:</span>
        <span class="token function">PerformPortalFetch</span><span class="token punctuation">(</span><span class="token punctuation">(</span>FetchStmt <span class="token operator">*</span><span class="token punctuation">)</span> parsetree<span class="token punctuation">,</span> dest<span class="token punctuation">,</span> qc<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_DoStmt<span class="token operator">:</span>
        <span class="token function">ExecuteDoStmt</span><span class="token punctuation">(</span><span class="token punctuation">(</span>DoStmt <span class="token operator">*</span><span class="token punctuation">)</span> parsetree<span class="token punctuation">,</span> isAtomicContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token comment">/* ... */</span>

    <span class="token keyword">default</span><span class="token operator">:</span>
        <span class="token comment">/* All other statement types have event trigger support */</span>
        <span class="token function">ProcessUtilitySlow</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> pstmt<span class="token punctuation">,</span> queryString<span class="token punctuation">,</span>
                            context<span class="token punctuation">,</span> params<span class="token punctuation">,</span> queryEnv<span class="token punctuation">,</span>
                            dest<span class="token punctuation">,</span> qc<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="optimizable-statement-execution" tabindex="-1"><a class="header-anchor" href="#optimizable-statement-execution" aria-hidden="true">#</a> Optimizable Statement Execution</h2><p>可优化语句由 Executor 模块处理。对查询计划树的处理，最终转换为 <strong>对查询计划树上每一个节点</strong> 的处理。每一种节点对应一种 <em>物理代数</em> 操作 (我理解的是每一种节点都对应一个算子：扫描算子/排序算子/连接算子等)，计划节点以二叉树的形式构成计划树。父节点从 (左右) 孩子节点获取元组作为输入，经过本节点的算子操作后，返回给更上层的节点。因此，实际执行将会从根节点开始层层向下递归，直到叶子节点。对计划树的遍历完成，也就意味着一次查询执行的完成。</p><p>Executor 模块的核心数据结构为 <code>QueryDesc</code>，是所有 Executor 模块接口函数的输入参数。它是在 <code>PortalStart()</code> 函数中通过 <code>CreateQueryDesc()</code> 创建出来的，该函数主要工作是将 <code>Portal</code> 结构中的 <code>stmts</code> 设置到了 <code>QueryDesc</code> 中。其结构定义如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      query descriptor:
 *
 *  a QueryDesc encapsulates everything that the executor
 *  needs to execute the query.
 *
 *  For the convenience of SQL-language functions, we also support QueryDescs
 *  containing utility statements; these must not be passed to the executor
 *  however.
 * ---------------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">QueryDesc</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* These fields are provided by CreateQueryDesc */</span>
    CmdType     operation<span class="token punctuation">;</span>      <span class="token comment">/* CMD_SELECT, CMD_UPDATE, etc. */</span>
    PlannedStmt <span class="token operator">*</span>plannedstmt<span class="token punctuation">;</span>   <span class="token comment">/* planner&#39;s output (could be utility, too) */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>sourceText<span class="token punctuation">;</span>     <span class="token comment">/* source text of the query */</span>
    Snapshot    snapshot<span class="token punctuation">;</span>       <span class="token comment">/* snapshot to use for query */</span>
    Snapshot    crosscheck_snapshot<span class="token punctuation">;</span>    <span class="token comment">/* crosscheck for RI update/delete */</span>
    DestReceiver <span class="token operator">*</span>dest<span class="token punctuation">;</span>         <span class="token comment">/* the destination for tuple output */</span>
    ParamListInfo params<span class="token punctuation">;</span>       <span class="token comment">/* param values being passed in */</span>
    QueryEnvironment <span class="token operator">*</span>queryEnv<span class="token punctuation">;</span> <span class="token comment">/* query environment passed in */</span>
    <span class="token keyword">int</span>         instrument_options<span class="token punctuation">;</span> <span class="token comment">/* OR of InstrumentOption flags */</span>

    <span class="token comment">/* These fields are set by ExecutorStart */</span>
    TupleDesc   tupDesc<span class="token punctuation">;</span>        <span class="token comment">/* descriptor for result tuples */</span>
    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span>         <span class="token comment">/* executor&#39;s query-wide state */</span>
    PlanState  <span class="token operator">*</span>planstate<span class="token punctuation">;</span>      <span class="token comment">/* tree of per-plan-node state */</span>

    <span class="token comment">/* This field is set by ExecutorRun */</span>
    bool        already_executed<span class="token punctuation">;</span>   <span class="token comment">/* true if previously executed */</span>

    <span class="token comment">/* This is always set NULL by the core system, but plugins can change it */</span>
    <span class="token keyword">struct</span> <span class="token class-name">Instrumentation</span> <span class="token operator">*</span>totaltime<span class="token punctuation">;</span>  <span class="token comment">/* total time spent in ExecutorRun */</span>
<span class="token punctuation">}</span> QueryDesc<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Executor 模块的三个核心入口分别在以下三个函数中被调用，是否被调用的依据是 <code>Portal</code> 结构体中的 <code>PortalStrategy</code>：</p><ul><li><code>ExecutorStart()</code>：从 <code>PortalStart()</code> 中对可优化语句调用 <ul><li>初始化执行器当前执行任务时的全局状态 <code>EState</code>，并设置到 <code>QueryDesc</code> 中</li><li>调用 <code>InitPlan()</code>，内部调用 <code>ExecInitNode()</code> 从根节点开始递归创建每个计划节点对应的状态 <code>PlanState</code></li></ul></li><li><code>ExecutorRun()</code>：从 <code>PortalRun()</code> 中对可优化语句调用 <ul><li>调用 <code>ExecutePlan()</code>，内部调用 <code>ExecProcNode()</code> 从根节点开始递归执行计划</li></ul></li><li><code>ExecutorEnd()</code>：从 <code>PortalEnd()</code> 中对可优化语句调用 <ul><li>调用 <code>ExecEndPlan()</code>，内部调用 <code>ExecEndNode()</code> 从根节点开始递归清理每个计划节点对应的 <code>PlanState</code></li><li>释放全局状态 <code>EState</code></li></ul></li></ul><h3 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state" aria-hidden="true">#</a> Plan State</h3><p><code>ExecInitNode()</code> 函数根据计划节点的类型调用相应的 <code>ExecInitXXX()</code> 函数，并返回指向该计划节点对应 <code>PlanState</code> 结构的指针。其核心也是一个 <code>switch</code> 语句：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
        <span class="token comment">/*
         * control nodes
         */</span>
    <span class="token keyword">case</span> T_Result<span class="token operator">:</span>
        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitResult</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Result <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span>
                                                estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_ProjectSet<span class="token operator">:</span>
        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitProjectSet</span><span class="token punctuation">(</span><span class="token punctuation">(</span>ProjectSet <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span>
                                                    estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_ModifyTable<span class="token operator">:</span>
        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitModifyTable</span><span class="token punctuation">(</span><span class="token punctuation">(</span>ModifyTable <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span>
                                                    estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token keyword">case</span> T_Append<span class="token operator">:</span>
        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitAppend</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Append <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span>
                                                estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>

    <span class="token comment">/* ... */</span>

    <span class="token keyword">default</span><span class="token operator">:</span>
        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>      <span class="token comment">/* keep compiler quiet */</span>
        <span class="token keyword">break</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在每一种计划节点对应的 <code>ExecInitXXX()</code> 函数中，又会递归调用 <code>ExecInitNode()</code> 函数构造子节点的 <code>PlanState</code>，然后设置到当前节点 <code>PlanState</code> 的左右孩子指针上，再返回上层。看看 <code>PlanState</code> 的结构定义吧：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------
 *      PlanState node
 *
 * We never actually instantiate any PlanState nodes; this is just the common
 * abstract superclass for all PlanState-type nodes.
 * ----------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PlanState</span>
<span class="token punctuation">{</span>
    NodeTag        type<span class="token punctuation">;</span>

    Plan       <span class="token operator">*</span>plan<span class="token punctuation">;</span>           <span class="token comment">/* associated Plan node */</span>

    EState     <span class="token operator">*</span>state<span class="token punctuation">;</span>          <span class="token comment">/* at execution time, states of individual
                                 * nodes point to one EState for the whole
                                 * top-level plan */</span>

    ExecProcNodeMtd ExecProcNode<span class="token punctuation">;</span>   <span class="token comment">/* function to return next tuple */</span>
    ExecProcNodeMtd ExecProcNodeReal<span class="token punctuation">;</span>   <span class="token comment">/* actual function, if above is a
                                         * wrapper */</span>

    <span class="token comment">/* ... */</span>

     <span class="token operator">*</span> Common structural data <span class="token keyword">for</span> all Plan types<span class="token punctuation">.</span>  These links to subsidiary
     <span class="token operator">*</span> state trees parallel links in the associated plan <span class="token function">tree</span> <span class="token punctuation">(</span>except <span class="token keyword">for</span> the
     <span class="token operator">*</span> subPlan list<span class="token punctuation">,</span> which does not exist in the plan tree<span class="token punctuation">)</span><span class="token punctuation">.</span>
     <span class="token operator">*</span><span class="token operator">/</span>
    ExprState  <span class="token operator">*</span>qual<span class="token punctuation">;</span>           <span class="token comment">/* boolean qual condition */</span>
    <span class="token keyword">struct</span> <span class="token class-name">PlanState</span> <span class="token operator">*</span>lefttree<span class="token punctuation">;</span> <span class="token comment">/* input plan tree(s) */</span>
    <span class="token keyword">struct</span> <span class="token class-name">PlanState</span> <span class="token operator">*</span>righttree<span class="token punctuation">;</span>

    <span class="token comment">/* ... */</span>

<span class="token punctuation">}</span> PlanState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中 <code>plan</code> 指针指向对应的计划树节点，<code>state</code> 指向执行器的全局状态。<code>lefttree</code> 和 <code>righttree</code> 指针分别指向左右孩子节点的 <code>PlanState</code>。与查询计划树类似，<code>PlanState</code> 也构成了一棵结构相同的二叉树。</p><h3 id="execution" tabindex="-1"><a class="header-anchor" href="#execution" aria-hidden="true">#</a> Execution</h3><p>在 <code>ExecutorRun()</code> 中，对根计划节点调用 <code>ExecProcNode()</code> 开始递归执行查询。该函数以函数指针的形式，设置在了计划节点对应的 <code>PlanState</code> 中。显然，每类不同的计划节点有着不同的 <code>ExecProcXXX()</code> 实现。但是思想上肯定还是递归的：</p><ul><li>对孩子节点递归调用 <code>ExecProcNode()</code> 获取输入数据 (一般是元组)</li><li>在当前节点层次中完成对元组的处理，并进行选择运算 + 投影运算</li><li>向上层节点返回处理后的元组指针</li></ul><p>一般来说，叶子计划节点的类型都是扫描节点 (顺序扫描 / 索引扫描)，能向上层节点提供元组。</p><p>当 <code>ExecutePlan()</code> 对根计划节点调用 <code>ExecProcNode()</code> 并最终返回一条元组后，根据整个语句的操作类型，进行最终处理。(？)</p><blockquote><p>这里源码和书对不上了，代码应该是重构过了。</p></blockquote><h3 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up" aria-hidden="true">#</a> Clean Up</h3><p><code>ExecEndPlan()</code> 与前面思想类似：对根节点调用 <code>ExecEndNode()</code>。该函数中根据计划节点的 <code>nodeTag</code> 做了一个 <code>switch</code>，分别进入各个类型计划节点的 <code>ExecEndXXX()</code> 中。</p><h2 id="more" tabindex="-1"><a class="header-anchor" href="#more" aria-hidden="true">#</a> More</h2><p>后续具体看看每种类型计划节点的结构定义 (以及其中继承关系)，以及各类节点分别如何实现 <code>ExecInitNode()</code> / <code>ExecProcNode()</code> / <code>ExecEndNode()</code>。</p>`,44),i=[o];function c(l,p){return s(),e("div",null,i)}const r=n(t,[["render",c],["__file","PostgreSQL Query Execution.html.vue"]]);export{r as default};
