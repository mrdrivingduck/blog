import{_ as s,c as a,a as e,o as l}from"./app-BeHGwf2X.js";const t={};function p(i,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-query-execution" tabindex="-1"><a class="header-anchor" href="#postgresql-query-execution"><span>PostgreSQL - Query Execution</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 06 / 20 22:12</p><p>Hangzhou, Zhejiang, China</p><hr><p>周日，带着电脑去了公司。从流程和数据结构的角度分析一下 PostgreSQL 执行器的大致工作过程。查询计划的具体物理执行留作后续分析。</p><h2 id="portal" tabindex="-1"><a class="header-anchor" href="#portal"><span>Portal</span></a></h2><p>经过查询编译器的工作，用户提交的 SQL 语句已经成为 <strong>查询计划</strong>。接下来，由执行器根据计划对数据进行提取、处理、存储等。在函数 <code>exec_simple_query()</code> 中，在 SQL 被编译为 parse tree 后，依次调用以下几个函数完成 SQL 语句的 <strong>执行</strong>：</p><ul><li><code>CreatePortal()</code>：创建一个干净的 <code>Portal</code>，初始化内存上下文</li><li><code>PortalDefineQuery()</code>：将查询编译器输出的查询计划初始化到 <code>Portal</code> 中</li><li><code>PortalStart()</code>：为 <code>Portal</code> 选择执行策略，并进行与执行策略相关的初始化 (描述符)</li><li><code>PortalRun()</code>：根据执行策略调用执行部件，执行计划</li><li><code>PortalDrop()</code>：清理/释放资源</li></ul><p>其中，<code>Portal</code> 是核心的数据结构。定义如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PortalData</span> <span class="token operator">*</span>Portal<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PortalData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* Bookkeeping data */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>name<span class="token punctuation">;</span>           <span class="token comment">/* portal&#39;s name */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>prepStmtName<span class="token punctuation">;</span>   <span class="token comment">/* source prepared statement (NULL if none) */</span></span>
<span class="line">    MemoryContext portalContext<span class="token punctuation">;</span>    <span class="token comment">/* subsidiary memory for portal */</span></span>
<span class="line">    ResourceOwner resowner<span class="token punctuation">;</span>     <span class="token comment">/* resources owned by portal */</span></span>
<span class="line">    <span class="token keyword">void</span>        <span class="token punctuation">(</span><span class="token operator">*</span>cleanup<span class="token punctuation">)</span> <span class="token punctuation">(</span>Portal portal<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* cleanup hook */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * State data for remembering which subtransaction(s) the portal was</span>
<span class="line">     * created or used in.  If the portal is held over from a previous</span>
<span class="line">     * transaction, both subxids are InvalidSubTransactionId.  Otherwise,</span>
<span class="line">     * createSubid is the creating subxact and activeSubid is the last subxact</span>
<span class="line">     * in which we ran the portal.</span>
<span class="line">     */</span></span>
<span class="line">    SubTransactionId createSubid<span class="token punctuation">;</span>   <span class="token comment">/* the creating subxact */</span></span>
<span class="line">    SubTransactionId activeSubid<span class="token punctuation">;</span>   <span class="token comment">/* the last subxact with activity */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* The query or queries the portal will execute */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>sourceText<span class="token punctuation">;</span>     <span class="token comment">/* text of query (as of 8.4, never NULL) */</span></span>
<span class="line">    CommandTag  commandTag<span class="token punctuation">;</span>     <span class="token comment">/* command tag for original query */</span></span>
<span class="line">    QueryCompletion qc<span class="token punctuation">;</span>         <span class="token comment">/* command completion data for executed query */</span></span>
<span class="line">    List       <span class="token operator">*</span>stmts<span class="token punctuation">;</span>          <span class="token comment">/* list of PlannedStmts */</span></span>
<span class="line">    CachedPlan <span class="token operator">*</span>cplan<span class="token punctuation">;</span>          <span class="token comment">/* CachedPlan, if stmts are from one */</span></span>
<span class="line"></span>
<span class="line">    ParamListInfo portalParams<span class="token punctuation">;</span> <span class="token comment">/* params to pass to query */</span></span>
<span class="line">    QueryEnvironment <span class="token operator">*</span>queryEnv<span class="token punctuation">;</span> <span class="token comment">/* environment for query */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Features/options */</span></span>
<span class="line">    PortalStrategy strategy<span class="token punctuation">;</span>    <span class="token comment">/* see above */</span></span>
<span class="line">    <span class="token keyword">int</span>         cursorOptions<span class="token punctuation">;</span>  <span class="token comment">/* DECLARE CURSOR option bits */</span></span>
<span class="line">    bool        run_once<span class="token punctuation">;</span>       <span class="token comment">/* portal will only be run once */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Status data */</span></span>
<span class="line">    PortalStatus status<span class="token punctuation">;</span>        <span class="token comment">/* see above */</span></span>
<span class="line">    bool        portalPinned<span class="token punctuation">;</span>   <span class="token comment">/* a pinned portal can&#39;t be dropped */</span></span>
<span class="line">    bool        autoHeld<span class="token punctuation">;</span>       <span class="token comment">/* was automatically converted from pinned to</span>
<span class="line">                                 * held (see HoldPinnedPortals()) */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* If not NULL, Executor is active; call ExecutorEnd eventually: */</span></span>
<span class="line">    QueryDesc  <span class="token operator">*</span>queryDesc<span class="token punctuation">;</span>      <span class="token comment">/* info needed for executor invocation */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* If portal returns tuples, this is their tupdesc: */</span></span>
<span class="line">    TupleDesc   tupDesc<span class="token punctuation">;</span>        <span class="token comment">/* descriptor for result tuples */</span></span>
<span class="line">    <span class="token comment">/* and these are the format codes to use for the columns: */</span></span>
<span class="line">    int16      <span class="token operator">*</span>formats<span class="token punctuation">;</span>        <span class="token comment">/* a format code for each column */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Outermost ActiveSnapshot for execution of the portal&#39;s queries.  For</span>
<span class="line">     * all but a few utility commands, we require such a snapshot to exist.</span>
<span class="line">     * This ensures that TOAST references in query results can be detoasted,</span>
<span class="line">     * and helps to reduce thrashing of the process&#39;s exposed xmin.</span>
<span class="line">     */</span></span>
<span class="line">    Snapshot    portalSnapshot<span class="token punctuation">;</span> <span class="token comment">/* active snapshot, or NULL if none */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Where we store tuples for a held cursor or a PORTAL_ONE_RETURNING or</span>
<span class="line">     * PORTAL_UTIL_SELECT query.  (A cursor held past the end of its</span>
<span class="line">     * transaction no longer has any active executor state.)</span>
<span class="line">     */</span></span>
<span class="line">    Tuplestorestate <span class="token operator">*</span>holdStore<span class="token punctuation">;</span> <span class="token comment">/* store for holdable cursors */</span></span>
<span class="line">    MemoryContext holdContext<span class="token punctuation">;</span>  <span class="token comment">/* memory containing holdStore */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Snapshot under which tuples in the holdStore were read.  We must keep a</span>
<span class="line">     * reference to this snapshot if there is any possibility that the tuples</span>
<span class="line">     * contain TOAST references, because releasing the snapshot could allow</span>
<span class="line">     * recently-dead rows to be vacuumed away, along with any toast data</span>
<span class="line">     * belonging to them.  In the case of a held cursor, we avoid needing to</span>
<span class="line">     * keep such a snapshot by forcibly detoasting the data.</span>
<span class="line">     */</span></span>
<span class="line">    Snapshot    holdSnapshot<span class="token punctuation">;</span>   <span class="token comment">/* registered snapshot, or NULL if none */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * atStart, atEnd and portalPos indicate the current cursor position.</span>
<span class="line">     * portalPos is zero before the first row, N after fetching N&#39;th row of</span>
<span class="line">     * query.  After we run off the end, portalPos = # of rows in query, and</span>
<span class="line">     * atEnd is true.  Note that atStart implies portalPos == 0, but not the</span>
<span class="line">     * reverse: we might have backed up only as far as the first row, not to</span>
<span class="line">     * the start.  Also note that various code inspects atStart and atEnd, but</span>
<span class="line">     * only the portal movement routines should touch portalPos.</span>
<span class="line">     */</span></span>
<span class="line">    bool        atStart<span class="token punctuation">;</span></span>
<span class="line">    bool        atEnd<span class="token punctuation">;</span></span>
<span class="line">    uint64      portalPos<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Presentation data, primarily used by the pg_cursors system view */</span></span>
<span class="line">    TimestampTz creation_time<span class="token punctuation">;</span>  <span class="token comment">/* time at which this portal was defined */</span></span>
<span class="line">    bool        visible<span class="token punctuation">;</span>        <span class="token comment">/* include this portal in pg_cursors? */</span></span>
<span class="line"><span class="token punctuation">}</span>           PortalData<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中很重要的是 <code>List *stmts</code>，这是查询编译器输出的 <strong>原子操作节点</strong> 的链表，链表的每个节点保存了 (可能包含查询计划树在内的) 操作。其中，可能带有查询计划树的原子操作节点只有 <code>PlannedStmt</code> 和 <code>Query</code> 两类节点。这两类节点中通过 <code>CmdType</code> 字段指示了当前原子操作对应的命令类型：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * CmdType -</span>
<span class="line"> *    enums for type of operation represented by a Query or PlannedStmt</span>
<span class="line"> *</span>
<span class="line"> * This is needed in both parsenodes.h and plannodes.h, so put it here...</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">CmdType</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    CMD_UNKNOWN<span class="token punctuation">,</span></span>
<span class="line">    CMD_SELECT<span class="token punctuation">,</span>                 <span class="token comment">/* select stmt */</span></span>
<span class="line">    CMD_UPDATE<span class="token punctuation">,</span>                 <span class="token comment">/* update stmt */</span></span>
<span class="line">    CMD_INSERT<span class="token punctuation">,</span>                 <span class="token comment">/* insert stmt */</span></span>
<span class="line">    CMD_DELETE<span class="token punctuation">,</span></span>
<span class="line">    CMD_UTILITY<span class="token punctuation">,</span>                <span class="token comment">/* cmds like create, destroy, copy, vacuum,</span>
<span class="line">                                 * etc. */</span></span>
<span class="line">    CMD_NOTHING                 <span class="token comment">/* dummy command for instead nothing rules</span>
<span class="line">                                 * with qual */</span></span>
<span class="line"><span class="token punctuation">}</span> CmdType<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="execution-strategy" tabindex="-1"><a class="header-anchor" href="#execution-strategy"><span>Execution Strategy</span></a></h2><p>对于一个刚被创建好的 <code>Portal</code>，经过一定的初始化后，查询编译器输出的原子操作链表将会被设置到 <code>Portal</code> 中。在 <code>PortalStart()</code> 函数里，对 <code>Portal</code> 进行执行前的最后一步初始化：根据操作的类型选择 <strong>执行策略</strong> (实现于函数 <code>ChoosePortalStrategy()</code>)：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * We have several execution strategies for Portals, depending on what</span>
<span class="line"> * query or queries are to be executed.  (Note: in all cases, a Portal</span>
<span class="line"> * executes just a single source-SQL query, and thus produces just a</span>
<span class="line"> * single result from the user&#39;s viewpoint.  However, the rule rewriter</span>
<span class="line"> * may expand the single source query to zero or many actual queries.)</span>
<span class="line"> *</span>
<span class="line"> * PORTAL_ONE_SELECT: the portal contains one single SELECT query.  We run</span>
<span class="line"> * the Executor incrementally as results are demanded.  This strategy also</span>
<span class="line"> * supports holdable cursors (the Executor results can be dumped into a</span>
<span class="line"> * tuplestore for access after transaction completion).</span>
<span class="line"> *</span>
<span class="line"> * PORTAL_ONE_RETURNING: the portal contains a single INSERT/UPDATE/DELETE</span>
<span class="line"> * query with a RETURNING clause (plus possibly auxiliary queries added by</span>
<span class="line"> * rule rewriting).  On first execution, we run the portal to completion</span>
<span class="line"> * and dump the primary query&#39;s results into the portal tuplestore; the</span>
<span class="line"> * results are then returned to the client as demanded.  (We can&#39;t support</span>
<span class="line"> * suspension of the query partway through, because the AFTER TRIGGER code</span>
<span class="line"> * can&#39;t cope, and also because we don&#39;t want to risk failing to execute</span>
<span class="line"> * all the auxiliary queries.)</span>
<span class="line"> *</span>
<span class="line"> * PORTAL_ONE_MOD_WITH: the portal contains one single SELECT query, but</span>
<span class="line"> * it has data-modifying CTEs.  This is currently treated the same as the</span>
<span class="line"> * PORTAL_ONE_RETURNING case because of the possibility of needing to fire</span>
<span class="line"> * triggers.  It may act more like PORTAL_ONE_SELECT in future.</span>
<span class="line"> *</span>
<span class="line"> * PORTAL_UTIL_SELECT: the portal contains a utility statement that returns</span>
<span class="line"> * a SELECT-like result (for example, EXPLAIN or SHOW).  On first execution,</span>
<span class="line"> * we run the statement and dump its results into the portal tuplestore;</span>
<span class="line"> * the results are then returned to the client as demanded.</span>
<span class="line"> *</span>
<span class="line"> * PORTAL_MULTI_QUERY: all other cases.  Here, we do not support partial</span>
<span class="line"> * execution: the portal&#39;s queries will be run to completion on first call.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">enum</span> <span class="token class-name">PortalStrategy</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    PORTAL_ONE_SELECT<span class="token punctuation">,</span></span>
<span class="line">    PORTAL_ONE_RETURNING<span class="token punctuation">,</span></span>
<span class="line">    PORTAL_ONE_MOD_WITH<span class="token punctuation">,</span></span>
<span class="line">    PORTAL_UTIL_SELECT<span class="token punctuation">,</span></span>
<span class="line">    PORTAL_MULTI_QUERY</span>
<span class="line"><span class="token punctuation">}</span> PortalStrategy<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>PORTAL_ONE_SELECT</code> 处理仅包含一个原子操作的情况 (<code>SELECT</code> 查询)</li><li><code>PORTAL_ONE_RETURNING</code> 处理带有 <code>RETURNING</code> 子句的 DML 操作：先对元组进行修改，然后返回结果</li><li><code>PORTAL_UTIL_SELECT</code> 处理 DDL，返回结果</li><li><code>PORTAL_MULTI_QUERY</code> 处理上述三种操作以外的情况，能处理一个或多个原子操作</li></ul><p>PostgreSQL 执行器中提供两个子模块处理不同类型的操作：</p><ul><li>Executor 模块执行前两类策略 (DQL + DML)，统称为 <em>可优化语句</em>，查询编译器会为这类操作生成计划树</li><li>ProcessUtility 模块执行后两类策略 (DDL 及其它)，主要是一些功能性操作</li></ul><h2 id="ddl-execution" tabindex="-1"><a class="header-anchor" href="#ddl-execution"><span>DDL Execution</span></a></h2><p>DDL 的执行比较简单。执行流程进入 ProcessUtility 模块后，通过判断操作的类型，直接分发进入不同操作的处理函数中。核心逻辑是一个 <code>switch</code> 语句：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>parsetree<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * ******************** transactions ********************</span>
<span class="line">         */</span></span>
<span class="line">    <span class="token keyword">case</span> T_TransactionStmt<span class="token operator">:</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Portal (cursor) manipulation</span>
<span class="line">         */</span></span>
<span class="line">    <span class="token keyword">case</span> T_DeclareCursorStmt<span class="token operator">:</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_ClosePortalStmt<span class="token operator">:</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_FetchStmt<span class="token operator">:</span></span>
<span class="line">        <span class="token function">PerformPortalFetch</span><span class="token punctuation">(</span><span class="token punctuation">(</span>FetchStmt <span class="token operator">*</span><span class="token punctuation">)</span> parsetree<span class="token punctuation">,</span> dest<span class="token punctuation">,</span> qc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_DoStmt<span class="token operator">:</span></span>
<span class="line">        <span class="token function">ExecuteDoStmt</span><span class="token punctuation">(</span><span class="token punctuation">(</span>DoStmt <span class="token operator">*</span><span class="token punctuation">)</span> parsetree<span class="token punctuation">,</span> isAtomicContext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">        <span class="token comment">/* All other statement types have event trigger support */</span></span>
<span class="line">        <span class="token function">ProcessUtilitySlow</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> pstmt<span class="token punctuation">,</span> queryString<span class="token punctuation">,</span></span>
<span class="line">                            context<span class="token punctuation">,</span> params<span class="token punctuation">,</span> queryEnv<span class="token punctuation">,</span></span>
<span class="line">                            dest<span class="token punctuation">,</span> qc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="optimizable-statement-execution" tabindex="-1"><a class="header-anchor" href="#optimizable-statement-execution"><span>Optimizable Statement Execution</span></a></h2><p>可优化语句由 Executor 模块处理。对查询计划树的处理，最终转换为 <strong>对查询计划树上每一个节点</strong> 的处理。每一种节点对应一种 <em>物理代数</em> 操作 (我理解的是每一种节点都对应一个算子：扫描算子/排序算子/连接算子等)，计划节点以二叉树的形式构成计划树。父节点从 (左右) 孩子节点获取元组作为输入，经过本节点的算子操作后，返回给更上层的节点。因此，实际执行将会从根节点开始层层向下递归，直到叶子节点。对计划树的遍历完成，也就意味着一次查询执行的完成。</p><p>Executor 模块的核心数据结构为 <code>QueryDesc</code>，是所有 Executor 模块接口函数的输入参数。它是在 <code>PortalStart()</code> 函数中通过 <code>CreateQueryDesc()</code> 创建出来的，该函数主要工作是将 <code>Portal</code> 结构中的 <code>stmts</code> 设置到了 <code>QueryDesc</code> 中。其结构定义如下：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      query descriptor:</span>
<span class="line"> *</span>
<span class="line"> *  a QueryDesc encapsulates everything that the executor</span>
<span class="line"> *  needs to execute the query.</span>
<span class="line"> *</span>
<span class="line"> *  For the convenience of SQL-language functions, we also support QueryDescs</span>
<span class="line"> *  containing utility statements; these must not be passed to the executor</span>
<span class="line"> *  however.</span>
<span class="line"> * ---------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">QueryDesc</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* These fields are provided by CreateQueryDesc */</span></span>
<span class="line">    CmdType     operation<span class="token punctuation">;</span>      <span class="token comment">/* CMD_SELECT, CMD_UPDATE, etc. */</span></span>
<span class="line">    PlannedStmt <span class="token operator">*</span>plannedstmt<span class="token punctuation">;</span>   <span class="token comment">/* planner&#39;s output (could be utility, too) */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>sourceText<span class="token punctuation">;</span>     <span class="token comment">/* source text of the query */</span></span>
<span class="line">    Snapshot    snapshot<span class="token punctuation">;</span>       <span class="token comment">/* snapshot to use for query */</span></span>
<span class="line">    Snapshot    crosscheck_snapshot<span class="token punctuation">;</span>    <span class="token comment">/* crosscheck for RI update/delete */</span></span>
<span class="line">    DestReceiver <span class="token operator">*</span>dest<span class="token punctuation">;</span>         <span class="token comment">/* the destination for tuple output */</span></span>
<span class="line">    ParamListInfo params<span class="token punctuation">;</span>       <span class="token comment">/* param values being passed in */</span></span>
<span class="line">    QueryEnvironment <span class="token operator">*</span>queryEnv<span class="token punctuation">;</span> <span class="token comment">/* query environment passed in */</span></span>
<span class="line">    <span class="token keyword">int</span>         instrument_options<span class="token punctuation">;</span> <span class="token comment">/* OR of InstrumentOption flags */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* These fields are set by ExecutorStart */</span></span>
<span class="line">    TupleDesc   tupDesc<span class="token punctuation">;</span>        <span class="token comment">/* descriptor for result tuples */</span></span>
<span class="line">    EState     <span class="token operator">*</span>estate<span class="token punctuation">;</span>         <span class="token comment">/* executor&#39;s query-wide state */</span></span>
<span class="line">    PlanState  <span class="token operator">*</span>planstate<span class="token punctuation">;</span>      <span class="token comment">/* tree of per-plan-node state */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* This field is set by ExecutorRun */</span></span>
<span class="line">    bool        already_executed<span class="token punctuation">;</span>   <span class="token comment">/* true if previously executed */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* This is always set NULL by the core system, but plugins can change it */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">Instrumentation</span> <span class="token operator">*</span>totaltime<span class="token punctuation">;</span>  <span class="token comment">/* total time spent in ExecutorRun */</span></span>
<span class="line"><span class="token punctuation">}</span> QueryDesc<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Executor 模块的三个核心入口分别在以下三个函数中被调用，是否被调用的依据是 <code>Portal</code> 结构体中的 <code>PortalStrategy</code>：</p><ul><li><code>ExecutorStart()</code>：从 <code>PortalStart()</code> 中对可优化语句调用 <ul><li>初始化执行器当前执行任务时的全局状态 <code>EState</code>，并设置到 <code>QueryDesc</code> 中</li><li>调用 <code>InitPlan()</code>，内部调用 <code>ExecInitNode()</code> 从根节点开始递归创建每个计划节点对应的状态 <code>PlanState</code></li></ul></li><li><code>ExecutorRun()</code>：从 <code>PortalRun()</code> 中对可优化语句调用 <ul><li>调用 <code>ExecutePlan()</code>，内部调用 <code>ExecProcNode()</code> 从根节点开始递归执行计划</li></ul></li><li><code>ExecutorEnd()</code>：从 <code>PortalEnd()</code> 中对可优化语句调用 <ul><li>调用 <code>ExecEndPlan()</code>，内部调用 <code>ExecEndNode()</code> 从根节点开始递归清理每个计划节点对应的 <code>PlanState</code></li><li>释放全局状态 <code>EState</code></li></ul></li></ul><h3 id="plan-state" tabindex="-1"><a class="header-anchor" href="#plan-state"><span>Plan State</span></a></h3><p><code>ExecInitNode()</code> 函数根据计划节点的类型调用相应的 <code>ExecInitXXX()</code> 函数，并返回指向该计划节点对应 <code>PlanState</code> 结构的指针。其核心也是一个 <code>switch</code> 语句：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">switch</span> <span class="token punctuation">(</span><span class="token function">nodeTag</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * control nodes</span>
<span class="line">         */</span></span>
<span class="line">    <span class="token keyword">case</span> T_Result<span class="token operator">:</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitResult</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Result <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span></span>
<span class="line">                                                estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_ProjectSet<span class="token operator">:</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitProjectSet</span><span class="token punctuation">(</span><span class="token punctuation">(</span>ProjectSet <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span></span>
<span class="line">                                                    estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_ModifyTable<span class="token operator">:</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitModifyTable</span><span class="token punctuation">(</span><span class="token punctuation">(</span>ModifyTable <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span></span>
<span class="line">                                                    estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">case</span> T_Append<span class="token operator">:</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token punctuation">(</span>PlanState <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">ExecInitAppend</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Append <span class="token operator">*</span><span class="token punctuation">)</span> node<span class="token punctuation">,</span></span>
<span class="line">                                                estate<span class="token punctuation">,</span> eflags<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">default</span><span class="token operator">:</span></span>
<span class="line">        <span class="token function">elog</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span> <span class="token string">&quot;unrecognized node type: %d&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> <span class="token function">nodeTag</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        result <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>      <span class="token comment">/* keep compiler quiet */</span></span>
<span class="line">        <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在每一种计划节点对应的 <code>ExecInitXXX()</code> 函数中，又会递归调用 <code>ExecInitNode()</code> 函数构造子节点的 <code>PlanState</code>，然后设置到当前节点 <code>PlanState</code> 的左右孩子指针上，再返回上层。看看 <code>PlanState</code> 的结构定义吧：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------</span>
<span class="line"> *      PlanState node</span>
<span class="line"> *</span>
<span class="line"> * We never actually instantiate any PlanState nodes; this is just the common</span>
<span class="line"> * abstract superclass for all PlanState-type nodes.</span>
<span class="line"> * ----------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">PlanState</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    NodeTag        type<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    Plan       <span class="token operator">*</span>plan<span class="token punctuation">;</span>           <span class="token comment">/* associated Plan node */</span></span>
<span class="line"></span>
<span class="line">    EState     <span class="token operator">*</span>state<span class="token punctuation">;</span>          <span class="token comment">/* at execution time, states of individual</span>
<span class="line">                                 * nodes point to one EState for the whole</span>
<span class="line">                                 * top-level plan */</span></span>
<span class="line"></span>
<span class="line">    ExecProcNodeMtd ExecProcNode<span class="token punctuation">;</span>   <span class="token comment">/* function to return next tuple */</span></span>
<span class="line">    ExecProcNodeMtd ExecProcNodeReal<span class="token punctuation">;</span>   <span class="token comment">/* actual function, if above is a</span>
<span class="line">                                         * wrapper */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line">     <span class="token operator">*</span> Common structural data <span class="token keyword">for</span> all Plan types<span class="token punctuation">.</span>  These links to subsidiary</span>
<span class="line">     <span class="token operator">*</span> state trees parallel links in the associated plan <span class="token function">tree</span> <span class="token punctuation">(</span>except <span class="token keyword">for</span> the</span>
<span class="line">     <span class="token operator">*</span> subPlan list<span class="token punctuation">,</span> which does not exist in the plan tree<span class="token punctuation">)</span><span class="token punctuation">.</span></span>
<span class="line">     <span class="token operator">*</span><span class="token operator">/</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>qual<span class="token punctuation">;</span>           <span class="token comment">/* boolean qual condition */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">PlanState</span> <span class="token operator">*</span>lefttree<span class="token punctuation">;</span> <span class="token comment">/* input plan tree(s) */</span></span>
<span class="line">    <span class="token keyword">struct</span> <span class="token class-name">PlanState</span> <span class="token operator">*</span>righttree<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ... */</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">}</span> PlanState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中 <code>plan</code> 指针指向对应的计划树节点，<code>state</code> 指向执行器的全局状态。<code>lefttree</code> 和 <code>righttree</code> 指针分别指向左右孩子节点的 <code>PlanState</code>。与查询计划树类似，<code>PlanState</code> 也构成了一棵结构相同的二叉树。</p><h3 id="execution" tabindex="-1"><a class="header-anchor" href="#execution"><span>Execution</span></a></h3><p>在 <code>ExecutorRun()</code> 中，对根计划节点调用 <code>ExecProcNode()</code> 开始递归执行查询。该函数以函数指针的形式，设置在了计划节点对应的 <code>PlanState</code> 中。显然，每类不同的计划节点有着不同的 <code>ExecProcXXX()</code> 实现。但是思想上肯定还是递归的：</p><ul><li>对孩子节点递归调用 <code>ExecProcNode()</code> 获取输入数据 (一般是元组)</li><li>在当前节点层次中完成对元组的处理，并进行选择运算 + 投影运算</li><li>向上层节点返回处理后的元组指针</li></ul><p>一般来说，叶子计划节点的类型都是扫描节点 (顺序扫描 / 索引扫描)，能向上层节点提供元组。</p><p>当 <code>ExecutePlan()</code> 对根计划节点调用 <code>ExecProcNode()</code> 并最终返回一条元组后，根据整个语句的操作类型，进行最终处理。(？)</p><blockquote><p>这里源码和书对不上了，代码应该是重构过了。</p></blockquote><h3 id="clean-up" tabindex="-1"><a class="header-anchor" href="#clean-up"><span>Clean Up</span></a></h3><p><code>ExecEndPlan()</code> 与前面思想类似：对根节点调用 <code>ExecEndNode()</code>。该函数中根据计划节点的 <code>nodeTag</code> 做了一个 <code>switch</code>，分别进入各个类型计划节点的 <code>ExecEndXXX()</code> 中。</p><h2 id="more" tabindex="-1"><a class="header-anchor" href="#more"><span>More</span></a></h2><p>后续具体看看每种类型计划节点的结构定义 (以及其中继承关系)，以及各类节点分别如何实现 <code>ExecInitNode()</code> / <code>ExecProcNode()</code> / <code>ExecEndNode()</code>。</p>`,44)]))}const o=s(t,[["render",p],["__file","PostgreSQL Query Execution.html.vue"]]),d=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20Query%20Execution.html","title":"PostgreSQL - Query Execution","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Portal","slug":"portal","link":"#portal","children":[]},{"level":2,"title":"Execution Strategy","slug":"execution-strategy","link":"#execution-strategy","children":[]},{"level":2,"title":"DDL Execution","slug":"ddl-execution","link":"#ddl-execution","children":[]},{"level":2,"title":"Optimizable Statement Execution","slug":"optimizable-statement-execution","link":"#optimizable-statement-execution","children":[{"level":3,"title":"Plan State","slug":"plan-state","link":"#plan-state","children":[]},{"level":3,"title":"Execution","slug":"execution","link":"#execution","children":[]},{"level":3,"title":"Clean Up","slug":"clean-up","link":"#clean-up","children":[]}]},{"level":2,"title":"More","slug":"more","link":"#more","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL Query Execution.md"}');export{o as comp,d as data};
