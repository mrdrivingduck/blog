import{_ as s,c as a,a as e,o as p}from"./app-BeHGwf2X.js";const t={};function l(i,n){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="postgresql-copy-from" tabindex="-1"><a class="header-anchor" href="#postgresql-copy-from"><span>PostgreSQL - COPY FROM</span></a></h1><p>Created by: Mr Dk.</p><p>2023 / 09 / 28 00:04</p><p>Qingdao, Shandong, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>PostgreSQL 的 <code>COPY FROM</code> 语法用于将来自外部 <em>文件</em>（磁盘文件 / 网络管道 / IPC 管道）的数据导入到数据库的表中。<code>COPY FROM</code> 支持只导入指定的部分列，其它列被填充为默认值。<code>COPY FROM</code> 还支持带有 <code>WHERE</code> 子句，只允许满足条件的行被导入到表中。</p><p><code>COPY FROM</code> 的实现逻辑比 <code>COPY TO</code> 相对复杂一些。其原因在于，<code>COPY TO</code> 是要把数据库中的数据导出到外部，其中获取数据这一步及其并行优化，很大程度上借助了优化器和执行器的能力，复用了很多代码；而 <code>COPY FROM</code> 是要把外部数据导入数据库，其中写入数据库的行为因需要更高效的定制实现，而不能复用 <code>INSERT</code> 相关的执行器代码了。</p><p>本文基于当前 PostgreSQL 主干开发分支（PostgreSQL 17 under devel）源代码对这个过程进行分析。分析过程中发现 <code>COPY FROM</code> 的代码存在一些小小的问题（真的是很小的问题..），于是误打误撞地向 PostgreSQL 社区贡献了自己的第一个 patch：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">commit e434e21e114b423e919324ad6ce1f3f079ca2a03</span>
<span class="line">Author: Michael Paquier &lt;michael@paquier.xyz&gt;</span>
<span class="line">Date:   Sat Sep 9 21:12:41 2023 +0900</span>
<span class="line"></span>
<span class="line">    Remove redundant assignments in copyfrom.c</span>
<span class="line"></span>
<span class="line">    The tuple descriptor and the number of attributes are assigned twice to</span>
<span class="line">    the same values in BeginCopyFrom(), for what looks like a small thinko</span>
<span class="line">    coming from the refactoring done in c532d15dddff1.</span>
<span class="line"></span>
<span class="line">    Author: Jingtang Zhang</span>
<span class="line">    Discussion: https://postgr.es/m/CAPsk3_CrYeXUVHEiaWAYxY9BKiGvGT3AoXo_+Jm0xP_s_VmXCA@mail.gmail.com</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-statement" tabindex="-1"><a class="header-anchor" href="#copy-statement"><span>COPY Statement</span></a></h2><p>如对 <code>COPY TO</code> 的分析所述，此类语法被视为一种 DDL。在执行器开始处理之前，语法解析器已经把与 <code>COPY</code> 相关的参数设置在 <code>CopyStmt</code> 结构中了。其中：</p><ul><li><code>relation</code>：将要被导入的表</li><li><code>attlist</code>：将要导入的列名列表</li><li><code>is_from</code>：当前执行的是 <code>COPY TO</code> 还是 <code>COPY FROM</code></li><li><code>is_program</code>：导入的来源端是否是一个进程（管道）</li><li><code>filename</code>：导入来源端的文件名/程序名（为 <code>NULL</code> 意味着从 <code>STDIN</code> 导入）</li><li><code>options</code>：导入选项</li></ul><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* ----------------------</span>
<span class="line"> *      Copy Statement</span>
<span class="line"> *</span>
<span class="line"> * We support &quot;COPY relation FROM file&quot;, &quot;COPY relation TO file&quot;, and</span>
<span class="line"> * &quot;COPY (query) TO file&quot;.  In any given CopyStmt, exactly one of &quot;relation&quot;</span>
<span class="line"> * and &quot;query&quot; must be non-NULL.</span>
<span class="line"> * ----------------------</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyStmt</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    NodeTag     type<span class="token punctuation">;</span></span>
<span class="line">    RangeVar   <span class="token operator">*</span>relation<span class="token punctuation">;</span>       <span class="token comment">/* the relation to copy */</span></span>
<span class="line">    Node       <span class="token operator">*</span>query<span class="token punctuation">;</span>          <span class="token comment">/* the query (SELECT or DML statement with</span>
<span class="line">                                 * RETURNING) to copy, as a raw parse tree */</span></span>
<span class="line">    List       <span class="token operator">*</span>attlist<span class="token punctuation">;</span>        <span class="token comment">/* List of column names (as Strings), or NIL</span>
<span class="line">                                 * for all columns */</span></span>
<span class="line">    bool        is_from<span class="token punctuation">;</span>        <span class="token comment">/* TO or FROM */</span></span>
<span class="line">    bool        is_program<span class="token punctuation">;</span>     <span class="token comment">/* is &#39;filename&#39; a program to popen? */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>filename<span class="token punctuation">;</span>       <span class="token comment">/* filename, or NULL for STDIN/STDOUT */</span></span>
<span class="line">    List       <span class="token operator">*</span>options<span class="token punctuation">;</span>        <span class="token comment">/* List of DefElem nodes */</span></span>
<span class="line">    Node       <span class="token operator">*</span>whereClause<span class="token punctuation">;</span>    <span class="token comment">/* WHERE condition (or NULL) */</span></span>
<span class="line"><span class="token punctuation">}</span> CopyStmt<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="权限检查" tabindex="-1"><a class="header-anchor" href="#权限检查"><span>权限检查</span></a></h2><p>进入到 <code>DoCopy</code> 函数后，需要进行初步的权限检查。首先需要做判断的是从文件/进程导入的场景：如果是从文件导入，那么当前用户需要有读文件的权限；如果是从程序导入，那么当前用户需要有执行程序的权限：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">bool        pipe <span class="token operator">=</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>filename <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Disallow COPY to/from file or program except to users with the</span>
<span class="line"> * appropriate role.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>pipe<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>is_program<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_EXECUTE_SERVER_PROGRAM<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY to or from an external program&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY to or from an external program.&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pg_execute_server_program&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span></span>
<span class="line">                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>is_from <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_READ_SERVER_FILES<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY from a file&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY from a file.&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pg_read_server_files&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span></span>
<span class="line">                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>is_from <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_WRITE_SERVER_FILES<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY to a file&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY to a file.&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                               <span class="token string">&quot;pg_write_server_files&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span></span>
<span class="line">                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下一步是对将要导入的数据库表进行准备。对于 <code>COPY FROM</code> 来说，需要对表施加 <code>RowExclusiveLock</code> 级别的锁。这个级别与其它 DML 所施加的锁等级一致：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">LOCKMODE    lockmode <span class="token operator">=</span> is_from <span class="token operator">?</span> RowExclusiveLock <span class="token operator">:</span> AccessShareLock<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* Open and lock the relation, using the appropriate lock type. */</span></span>
<span class="line">rel <span class="token operator">=</span> <span class="token function">table_openrv</span><span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>relation<span class="token punctuation">,</span> lockmode<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果指定了 <code>WHERE</code> 子句，那么还需要将其处理为布尔表达式：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* add nsitem to query namespace */</span></span>
<span class="line">    <span class="token function">addNSItemToQuery</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> nsitem<span class="token punctuation">,</span> false<span class="token punctuation">,</span> true<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Transform the raw expression tree */</span></span>
<span class="line">    whereClause <span class="token operator">=</span> <span class="token function">transformExpr</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">,</span> EXPR_KIND_COPY_WHERE<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Make sure it yields a boolean result. */</span></span>
<span class="line">    whereClause <span class="token operator">=</span> <span class="token function">coerce_to_boolean</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> whereClause<span class="token punctuation">,</span> <span class="token string">&quot;WHERE&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* we have to fix its collations too */</span></span>
<span class="line">    <span class="token function">assign_expr_collations</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    whereClause <span class="token operator">=</span> <span class="token function">eval_const_expressions</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    whereClause <span class="token operator">=</span> <span class="token punctuation">(</span>Node <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">canonicalize_qual</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> whereClause<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    whereClause <span class="token operator">=</span> <span class="token punctuation">(</span>Node <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">make_ands_implicit</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于 <code>COPY FROM</code> 来说，需要确保对被导入的列具有插入权限。此外，不支持行级别安全策略：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">perminfo <span class="token operator">=</span> nsitem<span class="token operator">-&gt;</span>p_perminfo<span class="token punctuation">;</span></span>
<span class="line">perminfo<span class="token operator">-&gt;</span>requiredPerms <span class="token operator">=</span> <span class="token punctuation">(</span>is_from <span class="token operator">?</span> ACL_INSERT <span class="token operator">:</span> ACL_SELECT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">tupDesc <span class="token operator">=</span> <span class="token function">RelationGetDescr</span><span class="token punctuation">(</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">attnums <span class="token operator">=</span> <span class="token function">CopyGetAttnums</span><span class="token punctuation">(</span>tupDesc<span class="token punctuation">,</span> rel<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>attlist<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token function">foreach</span><span class="token punctuation">(</span>cur<span class="token punctuation">,</span> attnums<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">int</span>         attno<span class="token punctuation">;</span></span>
<span class="line">    Bitmapset <span class="token operator">*</span><span class="token operator">*</span>bms<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    attno <span class="token operator">=</span> <span class="token function">lfirst_int</span><span class="token punctuation">(</span>cur<span class="token punctuation">)</span> <span class="token operator">-</span> FirstLowInvalidHeapAttributeNumber<span class="token punctuation">;</span></span>
<span class="line">    bms <span class="token operator">=</span> is_from <span class="token operator">?</span> <span class="token operator">&amp;</span>perminfo<span class="token operator">-&gt;</span>insertedCols <span class="token operator">:</span> <span class="token operator">&amp;</span>perminfo<span class="token operator">-&gt;</span>selectedCols<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token operator">*</span>bms <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span><span class="token operator">*</span>bms<span class="token punctuation">,</span> attno<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token function">ExecCheckPermissions</span><span class="token punctuation">(</span>pstate<span class="token operator">-&gt;</span>p_rtable<span class="token punctuation">,</span> <span class="token function">list_make1</span><span class="token punctuation">(</span>perminfo<span class="token punctuation">)</span><span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，执行器逻辑开始处理 <code>COPY FROM</code> 的具体事宜。与 <code>COPY TO</code> 类似，<code>BeginCopyFrom</code> / <code>CopyFrom</code> / <code>EndCopyFrom</code> 三个函数分别对应了三个执行阶段：</p><ol><li>准备</li><li>执行</li><li>结束</li></ol><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>is_from<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    CopyFromState cstate<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* check read-only transaction and parallel mode */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>XactReadOnly <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>rel<span class="token operator">-&gt;</span>rd_islocaltemp<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">PreventCommandIfReadOnly</span><span class="token punctuation">(</span><span class="token string">&quot;COPY FROM&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    cstate <span class="token operator">=</span> <span class="token function">BeginCopyFrom</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> rel<span class="token punctuation">,</span> whereClause<span class="token punctuation">,</span></span>
<span class="line">                           stmt<span class="token operator">-&gt;</span>filename<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>is_program<span class="token punctuation">,</span></span>
<span class="line">                           <span class="token constant">NULL</span><span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>attlist<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>options<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token operator">*</span>processed <span class="token operator">=</span> <span class="token function">CopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* copy from file to database */</span></span>
<span class="line">    <span class="token function">EndCopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* COPY TO */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-from-准备阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-准备阶段"><span>COPY FROM 准备阶段</span></a></h2><p><code>BeginCopyFrom</code> 完成 <code>COPY FROM</code> 的准备工作，主要是初始化一个 <code>CopyFromState</code> 结构：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * This struct contains all the state variables used throughout a COPY FROM</span>
<span class="line"> * operation.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyFromStateData</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* low-level state data */</span></span>
<span class="line">    CopySource  copy_src<span class="token punctuation">;</span>       <span class="token comment">/* type of copy source */</span></span>
<span class="line">    FILE       <span class="token operator">*</span>copy_file<span class="token punctuation">;</span>      <span class="token comment">/* used if copy_src == COPY_FILE */</span></span>
<span class="line">    StringInfo  fe_msgbuf<span class="token punctuation">;</span>      <span class="token comment">/* used if copy_src == COPY_FRONTEND */</span></span>
<span class="line"></span>
<span class="line">    EolType     eol_type<span class="token punctuation">;</span>       <span class="token comment">/* EOL type of input */</span></span>
<span class="line">    <span class="token keyword">int</span>         file_encoding<span class="token punctuation">;</span>  <span class="token comment">/* file or remote side&#39;s character encoding */</span></span>
<span class="line">    bool        need_transcoding<span class="token punctuation">;</span>   <span class="token comment">/* file encoding diff from server? */</span></span>
<span class="line">    Oid         conversion_proc<span class="token punctuation">;</span>    <span class="token comment">/* encoding conversion function */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* parameters from the COPY command */</span></span>
<span class="line">    Relation    rel<span class="token punctuation">;</span>            <span class="token comment">/* relation to copy from */</span></span>
<span class="line">    List       <span class="token operator">*</span>attnumlist<span class="token punctuation">;</span>     <span class="token comment">/* integer list of attnums to copy */</span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>filename<span class="token punctuation">;</span>       <span class="token comment">/* filename, or NULL for STDIN */</span></span>
<span class="line">    bool        is_program<span class="token punctuation">;</span>     <span class="token comment">/* is &#39;filename&#39; a program to popen? */</span></span>
<span class="line">    copy_data_source_cb data_source_cb<span class="token punctuation">;</span> <span class="token comment">/* function for reading data */</span></span>
<span class="line"></span>
<span class="line">    CopyFormatOptions opts<span class="token punctuation">;</span></span>
<span class="line">    bool       <span class="token operator">*</span>convert_select_flags<span class="token punctuation">;</span>   <span class="token comment">/* per-column CSV/TEXT CS flags */</span></span>
<span class="line">    Node       <span class="token operator">*</span>whereClause<span class="token punctuation">;</span>    <span class="token comment">/* WHERE condition (or NULL) */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* these are just for error messages, see CopyFromErrorCallback */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_relname<span class="token punctuation">;</span>    <span class="token comment">/* table name for error messages */</span></span>
<span class="line">    uint64      cur_lineno<span class="token punctuation">;</span>     <span class="token comment">/* line number for error messages */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_attname<span class="token punctuation">;</span>    <span class="token comment">/* current att for error messages */</span></span>
<span class="line">    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_attval<span class="token punctuation">;</span>     <span class="token comment">/* current att value for error messages */</span></span>
<span class="line">    bool        relname_only<span class="token punctuation">;</span>   <span class="token comment">/* don&#39;t output line number, att, etc. */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Working state</span>
<span class="line">     */</span></span>
<span class="line">    MemoryContext copycontext<span class="token punctuation">;</span>  <span class="token comment">/* per-copy execution context */</span></span>
<span class="line"></span>
<span class="line">    AttrNumber  num_defaults<span class="token punctuation">;</span>   <span class="token comment">/* count of att that are missing and have</span>
<span class="line">                                 * default value */</span></span>
<span class="line">    FmgrInfo   <span class="token operator">*</span>in_functions<span class="token punctuation">;</span>   <span class="token comment">/* array of input functions for each attrs */</span></span>
<span class="line">    Oid        <span class="token operator">*</span>typioparams<span class="token punctuation">;</span>    <span class="token comment">/* array of element types for in_functions */</span></span>
<span class="line">    <span class="token keyword">int</span>        <span class="token operator">*</span>defmap<span class="token punctuation">;</span>         <span class="token comment">/* array of default att numbers related to</span>
<span class="line">                                 * missing att */</span></span>
<span class="line">    ExprState <span class="token operator">*</span><span class="token operator">*</span>defexprs<span class="token punctuation">;</span>       <span class="token comment">/* array of default att expressions for all</span>
<span class="line">                                 * att */</span></span>
<span class="line">    bool       <span class="token operator">*</span>defaults<span class="token punctuation">;</span>       <span class="token comment">/* if DEFAULT marker was found for</span>
<span class="line">                                 * corresponding att */</span></span>
<span class="line">    bool        volatile_defexprs<span class="token punctuation">;</span>  <span class="token comment">/* is any of defexprs volatile? */</span></span>
<span class="line">    List       <span class="token operator">*</span>range_table<span class="token punctuation">;</span>    <span class="token comment">/* single element list of RangeTblEntry */</span></span>
<span class="line">    List       <span class="token operator">*</span>rteperminfos<span class="token punctuation">;</span>   <span class="token comment">/* single element list of RTEPermissionInfo */</span></span>
<span class="line">    ExprState  <span class="token operator">*</span>qualexpr<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    TransitionCaptureState <span class="token operator">*</span>transition_capture<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * These variables are used to reduce overhead in COPY FROM.</span>
<span class="line">     *</span>
<span class="line">     * attribute_buf holds the separated, de-escaped text for each field of</span>
<span class="line">     * the current line.  The CopyReadAttributes functions return arrays of</span>
<span class="line">     * pointers into this buffer.  We avoid palloc/pfree overhead by re-using</span>
<span class="line">     * the buffer on each cycle.</span>
<span class="line">     *</span>
<span class="line">     * In binary COPY FROM, attribute_buf holds the binary data for the</span>
<span class="line">     * current field, but the usage is otherwise similar.</span>
<span class="line">     */</span></span>
<span class="line">    StringInfoData attribute_buf<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* field raw data pointers found by COPY FROM */</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">int</span>         max_fields<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">char</span>      <span class="token operator">*</span><span class="token operator">*</span>raw_fields<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Similarly, line_buf holds the whole input line being processed. The</span>
<span class="line">     * input cycle is first to read the whole line into line_buf, and then</span>
<span class="line">     * extract the individual attribute fields into attribute_buf.  line_buf</span>
<span class="line">     * is preserved unmodified so that we can display it in error messages if</span>
<span class="line">     * appropriate.  (In binary mode, line_buf is not used.)</span>
<span class="line">     */</span></span>
<span class="line">    StringInfoData line_buf<span class="token punctuation">;</span></span>
<span class="line">    bool        line_buf_valid<span class="token punctuation">;</span> <span class="token comment">/* contains the row being processed? */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * input_buf holds input data, already converted to database encoding.</span>
<span class="line">     *</span>
<span class="line">     * In text mode, CopyReadLine parses this data sufficiently to locate line</span>
<span class="line">     * boundaries, then transfers the data to line_buf. We guarantee that</span>
<span class="line">     * there is a \\0 at input_buf[input_buf_len] at all times.  (In binary</span>
<span class="line">     * mode, input_buf is not used.)</span>
<span class="line">     *</span>
<span class="line">     * If encoding conversion is not required, input_buf is not a separate</span>
<span class="line">     * buffer but points directly to raw_buf.  In that case, input_buf_len</span>
<span class="line">     * tracks the number of bytes that have been verified as valid in the</span>
<span class="line">     * database encoding, and raw_buf_len is the total number of bytes stored</span>
<span class="line">     * in the buffer.</span>
<span class="line">     */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">INPUT_BUF_SIZE</span> <span class="token expression"><span class="token number">65536</span>    </span><span class="token comment">/* we palloc INPUT_BUF_SIZE+1 bytes */</span></span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>input_buf<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         input_buf_index<span class="token punctuation">;</span>    <span class="token comment">/* next byte to process */</span></span>
<span class="line">    <span class="token keyword">int</span>         input_buf_len<span class="token punctuation">;</span>  <span class="token comment">/* total # of bytes stored */</span></span>
<span class="line">    bool        input_reached_eof<span class="token punctuation">;</span>  <span class="token comment">/* true if we reached EOF */</span></span>
<span class="line">    bool        input_reached_error<span class="token punctuation">;</span>    <span class="token comment">/* true if a conversion error happened */</span></span>
<span class="line">    <span class="token comment">/* Shorthand for number of unconsumed bytes available in input_buf */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name function">INPUT_BUF_BYTES</span><span class="token expression"><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>input_buf_len <span class="token operator">-</span> <span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>input_buf_index<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * raw_buf holds raw input data read from the data source (file or client</span>
<span class="line">     * connection), not yet converted to the database encoding.  Like with</span>
<span class="line">     * &#39;input_buf&#39;, we guarantee that there is a \\0 at raw_buf[raw_buf_len].</span>
<span class="line">     */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RAW_BUF_SIZE</span> <span class="token expression"><span class="token number">65536</span>      </span><span class="token comment">/* we palloc RAW_BUF_SIZE+1 bytes */</span></span></span>
<span class="line">    <span class="token keyword">char</span>       <span class="token operator">*</span>raw_buf<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">int</span>         raw_buf_index<span class="token punctuation">;</span>  <span class="token comment">/* next byte to process */</span></span>
<span class="line">    <span class="token keyword">int</span>         raw_buf_len<span class="token punctuation">;</span>    <span class="token comment">/* total # of bytes stored */</span></span>
<span class="line">    bool        raw_reached_eof<span class="token punctuation">;</span>    <span class="token comment">/* true if we reached EOF */</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* Shorthand for number of unconsumed bytes available in raw_buf */</span></span>
<span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name function">RAW_BUF_BYTES</span><span class="token expression"><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>raw_buf_len <span class="token operator">-</span> <span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>raw_buf_index<span class="token punctuation">)</span></span></span></span>
<span class="line"></span>
<span class="line">    uint64      bytes_processed<span class="token punctuation">;</span>    <span class="token comment">/* number of bytes processed so far */</span></span>
<span class="line"><span class="token punctuation">}</span> CopyFromStateData<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyFromStateData</span> <span class="token operator">*</span>CopyFromState<span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中具体需要被初始化的结构包括：</p><ul><li>执行器内存上下文</li><li>将要被处理的列编号</li><li>输入格式解析选项</li><li>输入端的编码格式，已经是否需要转换编码，编码转换函数指针</li><li>执行状态</li><li>输入缓冲区及其指针和标志位 <ul><li><code>raw_buf</code>：存放从输入端接收到的裸字节</li><li><code>input_buf</code>：（文本模式下）存放从裸字节经过编码转换以后的字符</li><li><code>line_buf</code>：（文本模式下）存放一行数据的完整字符</li><li><code>attribute_buf</code>：存放当前一行数据解除转义以后按列分隔的内容</li></ul></li><li>每个列的输入转换函数（将字符串格式转为内部格式）和默认值</li><li>输入文件描述符 <ul><li>如果来自于客户端，那么向对方发送 <code>G</code> 协议，表明要接收的列和格式</li><li>如果来自于程序，那么 <code>popen</code> 启动程序</li><li>如果来自于文件，那么 <code>open</code> 打开文件，并 <code>fstat</code> 确认文件存在且不是目录</li></ul></li></ul><h2 id="copy-from-执行阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-执行阶段"><span>COPY FROM 执行阶段</span></a></h2><p><code>CopyFrom</code> 函数完成每一行数据的收集和写入，最终返回处理数据的总行数。</p><h3 id="表类型检查" tabindex="-1"><a class="header-anchor" href="#表类型检查"><span>表类型检查</span></a></h3><p>首先进行的是表类型检查。只有普通表、外部表、分区表，或其它带有 <code>INSTEAD OF INSERT</code> 行触发器的目标才可以进行 <code>COPY FROM</code>：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * The target must be a plain, foreign, or partitioned relation, or have</span>
<span class="line"> * an INSTEAD OF INSERT row trigger.  (Currently, such triggers are only</span>
<span class="line"> * allowed on views, so we only hint about them in the view case.)</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_RELATION <span class="token operator">&amp;&amp;</span></span>
<span class="line">    cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_FOREIGN_TABLE <span class="token operator">&amp;&amp;</span></span>
<span class="line">    cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_PARTITIONED_TABLE <span class="token operator">&amp;&amp;</span></span>
<span class="line">    <span class="token operator">!</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>trigdesc <span class="token operator">&amp;&amp;</span></span>
<span class="line">      cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>trigdesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_VIEW<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to view \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;To enable copying to a view, provide an INSTEAD OF INSERT trigger.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_MATVIEW<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to materialized view \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_SEQUENCE<span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to sequence \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to non-table relation \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="元组可见性优化" tabindex="-1"><a class="header-anchor" href="#元组可见性优化"><span>元组可见性优化</span></a></h3><p>接下来是对 <code>INSERT</code> 标志位的优化。如果被 <code>COPY FROM</code> 的目标是当前事务中新建的，那么加上 <code>TABLE_INSERT_SKIP_FSM</code>，插入时就不必检查并重用空闲空间了；如果目标是当前子事务中新建的，加上 <code>TABLE_INSERT_FROZEN</code> 使插入的行立刻冻结。</p><h3 id="初始化执行器状态" tabindex="-1"><a class="header-anchor" href="#初始化执行器状态"><span>初始化执行器状态</span></a></h3><p>如果 <code>COPY FROM</code> 的目标是一个外表，那么调用 FDW API 的 <code>BeginForeignInsert</code> 使外表准备好被插入；如果外表支持批量插入，那么通过 FDW API 的 <code>GetForeignModifyBatchSize</code> 获取批量插入的大小，否则默认每次插入一行：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>BeginForeignInsert <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">BeginForeignInsert</span><span class="token punctuation">(</span>mtstate<span class="token punctuation">,</span></span>
<span class="line">                                                     resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Also, if the named relation is a foreign table, determine if the FDW</span>
<span class="line"> * supports batch insert and determine the batch size (a FDW may support</span>
<span class="line"> * batching, but it may be disabled for the server/table).</span>
<span class="line"> *</span>
<span class="line"> * If the FDW does not support batching, we set the batch size to 1.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>GetForeignModifyBatchSize <span class="token operator">&amp;&amp;</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>ExecForeignBatchInsert<span class="token punctuation">)</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">=</span></span>
<span class="line">        resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">GetForeignModifyBatchSize</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">else</span></span>
<span class="line">    resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token function">Assert</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">&gt;=</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="初始化分区路由" tabindex="-1"><a class="header-anchor" href="#初始化分区路由"><span>初始化分区路由</span></a></h3><p>如果 <code>COPY FROM</code> 的目标是分区表，那么初始化分区表的元组路由：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * If the named relation is a partitioned table, initialize state for</span>
<span class="line"> * CopyFrom tuple routing.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_PARTITIONED_TABLE<span class="token punctuation">)</span></span>
<span class="line">    proute <span class="token operator">=</span> <span class="token function">ExecSetupPartitionTupleRouting</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="初始化过滤条件" tabindex="-1"><a class="header-anchor" href="#初始化过滤条件"><span>初始化过滤条件</span></a></h3><p>如果 <code>COPY FROM</code> 指定了 <code>WHERE</code> 子句，那么初始化过滤条件：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span></span>
<span class="line">    cstate<span class="token operator">-&gt;</span>qualexpr <span class="token operator">=</span> <span class="token function">ExecInitQual</span><span class="token punctuation">(</span><span class="token function">castNode</span><span class="token punctuation">(</span>List<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                                    <span class="token operator">&amp;</span>mtstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="批量写入准备" tabindex="-1"><a class="header-anchor" href="#批量写入准备"><span>批量写入准备</span></a></h3><p>接下来是 <strong>批量写入</strong> 的优化。对于数据库表和外部表的写入，具有两种 AM 接口：</p><ul><li>单行写入：<code>table_tuple_insert()</code> / <code>ExecForeignInsert</code></li><li>批量写入：<code>table_multi_insert()</code> / <code>ExecForeignBatchInsert</code></li></ul><p>通常来说，批量写入是更高效的，因为页面锁定频率和 WAL 记录数都更少了。</p><blockquote><p>如果表上有索引，那么堆表元组是批量写入的，而索引元组的写入依旧是随机的。这可能会成为影响性能的因素。</p></blockquote><p>不是所有场景下都能安全使用批量写入的，所以接下来要把无法安全使用的场景挑出来：</p><ul><li>表上有 <code>BEFORE</code> 或 <code>INSTEAD OF</code> 触发器：因为在插入时会顺带查询表，攒批会导致本应该能查询到的行还未被写入</li><li>是一个外表，但不支持批量写入，或强制不使用批量写入</li><li>是一个分区表，并且具有 <code>INSERT</code> 触发器</li><li>表上具有 <code>VOLATILE</code> 的默认值表达式：因为该表达式也有可能去查询表</li><li><code>WHERE</code> 子句中带有 <code>VOLATILE</code> 函数</li><li>是一个分区表，但分区中具有不支持批量插入的外部表</li></ul><p>对于可以进行批量写入的场景，初始化批量写入需要用到的内存缓冲区和相关指针；否则，初始化单行写入需要用到的结构。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * It&#39;s generally more efficient to prepare a bunch of tuples for</span>
<span class="line"> * insertion, and insert them in one</span>
<span class="line"> * table_multi_insert()/ExecForeignBatchInsert() call, than call</span>
<span class="line"> * table_tuple_insert()/ExecForeignInsert() separately for every tuple.</span>
<span class="line"> * However, there are a number of reasons why we might not be able to do</span>
<span class="line"> * this.  These are explained below.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">    <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_before_row <span class="token operator">||</span></span>
<span class="line">     resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Can&#39;t support multi-inserts when there are any BEFORE/INSTEAD OF</span>
<span class="line">     * triggers on the table. Such triggers might query the table we&#39;re</span>
<span class="line">     * inserting into and act differently if the tuples that have already</span>
<span class="line">     * been processed and prepared for insertion are not there.</span>
<span class="line">     */</span></span>
<span class="line">    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">         resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Can&#39;t support multi-inserts to a foreign table if the FDW does not</span>
<span class="line">     * support batching, or it&#39;s disabled for the server or foreign table.</span>
<span class="line">     */</span></span>
<span class="line">    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>proute <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">         resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_new_table<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * For partitioned tables we can&#39;t support multi-inserts when there</span>
<span class="line">     * are any statement level insert triggers. It might be possible to</span>
<span class="line">     * allow partitioned tables with such triggers in the future, but for</span>
<span class="line">     * now, CopyMultiInsertInfoFlush expects that any after row insert and</span>
<span class="line">     * statement level insert triggers are on the same relation.</span>
<span class="line">     */</span></span>
<span class="line">    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>volatile_defexprs<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Can&#39;t support multi-inserts if there are any volatile default</span>
<span class="line">     * expressions in the table.  Similarly to the trigger case above,</span>
<span class="line">     * such expressions may query the table we&#39;re inserting into.</span>
<span class="line">     *</span>
<span class="line">     * Note: It does not matter if any partitions have any volatile</span>
<span class="line">     * default expressions as we use the defaults from the target of the</span>
<span class="line">     * COPY command.</span>
<span class="line">     */</span></span>
<span class="line">    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">contain_volatile_functions</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Can&#39;t support multi-inserts if there are any volatile function</span>
<span class="line">     * expressions in WHERE clause.  Similarly to the trigger case above,</span>
<span class="line">     * such expressions may query the table we&#39;re inserting into.</span>
<span class="line">     */</span></span>
<span class="line">    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * For partitioned tables, we may still be able to perform bulk</span>
<span class="line">     * inserts.  However, the possibility of this depends on which types</span>
<span class="line">     * of triggers exist on the partition.  We must disable bulk inserts</span>
<span class="line">     * if the partition is a foreign table that can&#39;t use batching or it</span>
<span class="line">     * has any before row insert or insert instead triggers (same as we</span>
<span class="line">     * checked above for the parent table).  Since the partition&#39;s</span>
<span class="line">     * resultRelInfos are initialized only when we actually need to insert</span>
<span class="line">     * the first tuple into them, we must have the intermediate insert</span>
<span class="line">     * method of CIM_MULTI_CONDITIONAL to flag that we must later</span>
<span class="line">     * determine if we can use bulk-inserts for the partition being</span>
<span class="line">     * inserted into.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>proute<span class="token punctuation">)</span></span>
<span class="line">        insertMethod <span class="token operator">=</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">        insertMethod <span class="token operator">=</span> CIM_MULTI<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">CopyMultiInsertInfoInit</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> cstate<span class="token punctuation">,</span></span>
<span class="line">                            estate<span class="token punctuation">,</span> mycid<span class="token punctuation">,</span> ti_options<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * If not using batch mode (which allocates slots as needed) set up a</span>
<span class="line"> * tuple slot too. When inserting into a partitioned table, we also need</span>
<span class="line"> * one, even if we might batch insert, to read the tuple in the root</span>
<span class="line"> * partition&#39;s form.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    singleslot <span class="token operator">=</span> <span class="token function">table_slot_create</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">,</span></span>
<span class="line">                                   <span class="token operator">&amp;</span>estate<span class="token operator">-&gt;</span>es_tupleTable<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    bistate <span class="token operator">=</span> <span class="token function">GetBulkInsertState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="处理每一行输入数据" tabindex="-1"><a class="header-anchor" href="#处理每一行输入数据"><span>处理每一行输入数据</span></a></h3><p>接下来是处理每一行数据的大循环，循环将会在没有任何数据输入时退出。</p><p>首先，不管是单行写入模式还是批量写入模式，都要获取一个用于保存当前元组的槽位。如果是单行写入，那么直接使用刚才调用 <code>table_slot_create</code> 创建出来的槽位就可以了，并且后面的每一行也都一直复用这个槽位；如果是批量写入，那么从内存缓冲区里获取一个槽位：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* select slot to (initially) load row into */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> proute<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    myslot <span class="token operator">=</span> singleslot<span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>myslot <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"><span class="token keyword">else</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>resultRelInfo <span class="token operator">==</span> target_resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">Assert</span><span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    myslot <span class="token operator">=</span> <span class="token function">CopyMultiInsertInfoNextFreeSlot</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                             resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从输入文件描述符中获取一行数据，根据其格式，通过初始化阶段中准备好的转换函数和默认值表达式，转换为数据库内部的元组表示形式（此处省略内部细节），并存储在槽位中：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Directly store the values/nulls array in the slot */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">NextCopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">,</span> econtext<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_values<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_isnull<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">break</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token function">ExecStoreVirtualTuple</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/*</span>
<span class="line"> * Constraints and where clause might reference the tableoid column,</span>
<span class="line"> * so (re-)initialize tts_tableOid before evaluating them.</span>
<span class="line"> */</span></span>
<span class="line">myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>target_resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果指定了 <code>WHERE</code> 子句，那么将这行数据根据过滤条件进行判断，略过不符合条件的行，直接进行下轮循环：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    econtext<span class="token operator">-&gt;</span>ecxt_scantuple <span class="token operator">=</span> myslot<span class="token punctuation">;</span></span>
<span class="line">    <span class="token comment">/* Skip items that don&#39;t match COPY&#39;s WHERE clause */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecQual</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>qualexpr<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Report that this tuple was filtered out by the WHERE</span>
<span class="line">         * clause.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_COPY_TUPLES_EXCLUDED<span class="token punctuation">,</span></span>
<span class="line">                                     <span class="token operator">++</span>excluded<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">continue</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果 <code>COPY FROM</code> 的目标是一个分区表，那么接下来需要确认当前元组真正将会被插入的子分区，并确认这个子分区是否可以使用批量写入。如果可以批量写入，而本次要写入的子分区与上一个子分区不同时，需要先把上一个子分区攒批的缓存元组刷入磁盘，然后将当前元组写入槽位。由于子分区和父分区的列编号可能是不一致的，所以需要获取一个 <code>TupleConversionMap</code> 结构，该结构能够根据列名称，将子分区和父分区对应同一个列的编号相互映射。在写入槽位时，需要以该映射作为参数，保证数据的正确性。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Determine the partition to insert the tuple into */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>proute<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    TupleConversionMap <span class="token operator">*</span>map<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * Attempt to find a partition suitable for this tuple.</span>
<span class="line">     * ExecFindPartition() will raise an error if none can be found or</span>
<span class="line">     * if the found partition is not suitable for INSERTs.</span>
<span class="line">     */</span></span>
<span class="line">    resultRelInfo <span class="token operator">=</span> <span class="token function">ExecFindPartition</span><span class="token punctuation">(</span>mtstate<span class="token punctuation">,</span> target_resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                      proute<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevResultRelInfo <span class="token operator">!=</span> resultRelInfo<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Determine which triggers exist on this partition */</span></span>
<span class="line">        has_before_insert_row_trig <span class="token operator">=</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">&amp;&amp;</span></span>
<span class="line">                                      resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_before_row<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        has_instead_insert_row_trig <span class="token operator">=</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">&amp;&amp;</span></span>
<span class="line">                                       resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Disable multi-inserts when the partition has BEFORE/INSTEAD</span>
<span class="line">         * OF triggers, or if the partition is a foreign table that</span>
<span class="line">         * can&#39;t use batching.</span>
<span class="line">         */</span></span>
<span class="line">        leafpart_use_multi_insert <span class="token operator">=</span> insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token operator">!</span>has_before_insert_row_trig <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token operator">!</span>has_instead_insert_row_trig <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span></span>
<span class="line">             resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Set the multi-insert buffer to use for this partition. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>leafpart_use_multi_insert<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_CopyMultiInsertBuffer <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">CopyMultiInsertInfoSetupBuffer</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                               resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL <span class="token operator">&amp;&amp;</span></span>
<span class="line">                 <span class="token operator">!</span><span class="token function">CopyMultiInsertInfoIsEmpty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * Flush pending inserts if this partition can&#39;t use</span>
<span class="line">             * batching, so rows are visible to triggers etc.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                     resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                     <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>bistate <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ReleaseBulkInsertStatePin</span><span class="token punctuation">(</span>bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        prevResultRelInfo <span class="token operator">=</span> resultRelInfo<span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If we&#39;re capturing transition tuples, we might need to convert</span>
<span class="line">     * from the partition rowtype to root rowtype. But if there are no</span>
<span class="line">     * BEFORE triggers on the partition that could change the tuple,</span>
<span class="line">     * we can just remember the original unconverted tuple to avoid a</span>
<span class="line">     * needless round trip conversion.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>transition_capture <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        cstate<span class="token operator">-&gt;</span>transition_capture<span class="token operator">-&gt;</span>tcs_original_insert_tuple <span class="token operator">=</span></span>
<span class="line">            <span class="token operator">!</span>has_before_insert_row_trig <span class="token operator">?</span> myslot <span class="token operator">:</span> <span class="token constant">NULL</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We might need to convert from the root rowtype to the partition</span>
<span class="line">     * rowtype.</span>
<span class="line">     */</span></span>
<span class="line">    map <span class="token operator">=</span> <span class="token function">ExecGetRootToChildMap</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> <span class="token operator">!</span>leafpart_use_multi_insert<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* non batch insert */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            TupleTableSlot <span class="token operator">*</span>new_slot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            new_slot <span class="token operator">=</span> resultRelInfo<span class="token operator">-&gt;</span>ri_PartitionTupleSlot<span class="token punctuation">;</span></span>
<span class="line">            myslot <span class="token operator">=</span> <span class="token function">execute_attr_map_slot</span><span class="token punctuation">(</span>map<span class="token operator">-&gt;</span>attrMap<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> new_slot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Prepare to queue up tuple for later batch insert into</span>
<span class="line">         * current partition.</span>
<span class="line">         */</span></span>
<span class="line">        TupleTableSlot <span class="token operator">*</span>batchslot<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* no other path available for partitioned table */</span></span>
<span class="line">        <span class="token function">Assert</span><span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        batchslot <span class="token operator">=</span> <span class="token function">CopyMultiInsertInfoNextFreeSlot</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                                    resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">            myslot <span class="token operator">=</span> <span class="token function">execute_attr_map_slot</span><span class="token punctuation">(</span>map<span class="token operator">-&gt;</span>attrMap<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span></span>
<span class="line">                                           batchslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * This looks more expensive than it is (Believe me, I</span>
<span class="line">             * optimized it away. Twice.). The input is in virtual</span>
<span class="line">             * form, and we&#39;ll materialize the slot below - for most</span>
<span class="line">             * slot types the copy performs the work materialization</span>
<span class="line">             * would later require anyway.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>batchslot<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            myslot <span class="token operator">=</span> batchslot<span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/* ensure that triggers etc see the right relation  */</span></span>
<span class="line">    myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后终于到了完成写入的环节：</p><ul><li>如果表上有 <code>BEFORE ROW INSERT</code> 触发器，那么先执行一遍，如果执行的结果是 do nothing，就直接跳过写入</li><li>如果表上有 <code>INSTEAD OF INSERT ROW</code> 触发器，那么把这个元组交给触发器处理</li></ul><p>然后进行一些写入前检查：</p><ul><li>计算生成列的列值</li><li>检查元组是否符合表上的约束</li><li>检查元组是否符合分区约束</li></ul><p>根据当前元组是单行写入还是批量写入，将元组写入 AM 或内存缓冲区中。如果表上有索引，还需要创建并插入相应的索引元组。最后调用 <code>AFTER ROW INSERT</code> 触发器。</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line">skip_tuple <span class="token operator">=</span> false<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/* BEFORE ROW INSERT Triggers */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>has_before_insert_row_trig<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecBRInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        skip_tuple <span class="token operator">=</span> true<span class="token punctuation">;</span>  <span class="token comment">/* &quot;do nothing&quot; */</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>skip_tuple<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * If there is an INSTEAD OF INSERT ROW trigger, let it handle the</span>
<span class="line">     * tuple.  Otherwise, proceed with inserting the tuple into the</span>
<span class="line">     * table or foreign table.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>has_instead_insert_row_trig<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ExecIRInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">/* Compute stored generated columns */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr <span class="token operator">&amp;&amp;</span></span>
<span class="line">            resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr<span class="token operator">-&gt;</span>has_generated_stored<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecComputeStoredGenerated</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span></span>
<span class="line">                                       CMD_INSERT<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * If the target is a plain table, check the constraints of</span>
<span class="line">         * the tuple.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span></span>
<span class="line">            resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr<span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecConstraints</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/*</span>
<span class="line">         * Also check the tuple against the partition constraint, if</span>
<span class="line">         * there is one; except that if we got here via tuple-routing,</span>
<span class="line">         * we don&#39;t need to if there&#39;s no BR trigger defined on the</span>
<span class="line">         * partition.</span>
<span class="line">         */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relispartition <span class="token operator">&amp;&amp;</span></span>
<span class="line">            <span class="token punctuation">(</span>proute <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> has_before_insert_row_trig<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ExecPartitionCheck</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">/* Store the slot in the multi-insert buffer, when enabled. */</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI <span class="token operator">||</span> leafpart_use_multi_insert<span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * The slot previously might point into the per-tuple</span>
<span class="line">             * context. For batching it needs to be longer lived.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token function">ExecMaterializeSlot</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* Add this tuple to the tuple buffer */</span></span>
<span class="line">            <span class="token function">CopyMultiInsertInfoStore</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                     resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span></span>
<span class="line">                                     cstate<span class="token operator">-&gt;</span>line_buf<span class="token punctuation">.</span>len<span class="token punctuation">,</span></span>
<span class="line">                                     cstate<span class="token operator">-&gt;</span>cur_lineno<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * If enough inserts have queued up, then flush all</span>
<span class="line">             * buffers out to their tables.</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">CopyMultiInsertInfoIsFull</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">                <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span></span>
<span class="line">                                         resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                         <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/*</span>
<span class="line">             * We delay updating the row counter and progress of the</span>
<span class="line">             * COPY command until after writing the tuples stored in</span>
<span class="line">             * the buffer out to the table, as in single insert mode.</span>
<span class="line">             * See CopyMultiInsertBufferFlush().</span>
<span class="line">             */</span></span>
<span class="line">            <span class="token keyword">continue</span><span class="token punctuation">;</span>   <span class="token comment">/* next tuple please */</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">        <span class="token keyword">else</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">            List       <span class="token operator">*</span>recheckIndexes <span class="token operator">=</span> NIL<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* OK, store the tuple */</span></span>
<span class="line">            <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                myslot <span class="token operator">=</span> resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">ExecForeignInsert</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span></span>
<span class="line">                                                                         resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                                                         myslot<span class="token punctuation">,</span></span>
<span class="line">                                                                         <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>myslot <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token comment">/* &quot;do nothing&quot; */</span></span>
<span class="line">                    <span class="token keyword">continue</span><span class="token punctuation">;</span>   <span class="token comment">/* next tuple please */</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">/*</span>
<span class="line">                 * AFTER ROW Triggers might reference the tableoid</span>
<span class="line">                 * column, so (re-)initialize tts_tableOid before</span>
<span class="line">                 * evaluating them.</span>
<span class="line">                 */</span></span>
<span class="line">                myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">            <span class="token keyword">else</span></span>
<span class="line">            <span class="token punctuation">{</span></span>
<span class="line">                <span class="token comment">/* OK, store the tuple and create index entries for it */</span></span>
<span class="line">                <span class="token function">table_tuple_insert</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">,</span></span>
<span class="line">                                   myslot<span class="token punctuation">,</span> mycid<span class="token punctuation">,</span> ti_options<span class="token punctuation">,</span> bistate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_NumIndices <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span></span>
<span class="line">                    recheckIndexes <span class="token operator">=</span> <span class="token function">ExecInsertIndexTuples</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span></span>
<span class="line">                                                           myslot<span class="token punctuation">,</span></span>
<span class="line">                                                           estate<span class="token punctuation">,</span></span>
<span class="line">                                                           false<span class="token punctuation">,</span></span>
<span class="line">                                                           false<span class="token punctuation">,</span></span>
<span class="line">                                                           <span class="token constant">NULL</span><span class="token punctuation">,</span></span>
<span class="line">                                                           NIL<span class="token punctuation">,</span></span>
<span class="line">                                                           false<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">            <span class="token comment">/* AFTER ROW INSERT Triggers */</span></span>
<span class="line">            <span class="token function">ExecARInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span></span>
<span class="line">                                 recheckIndexes<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>transition_capture<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">            <span class="token function">list_free</span><span class="token punctuation">(</span>recheckIndexes<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token punctuation">}</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">/*</span>
<span class="line">     * We count only tuples not suppressed by a BEFORE INSERT trigger</span>
<span class="line">     * or FDW; this is the same definition used by nodeModifyTable.c</span>
<span class="line">     * for counting tuples inserted by an INSERT command.  Update</span>
<span class="line">     * progress of the COPY command as well.</span>
<span class="line">     */</span></span>
<span class="line">    <span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_COPY_TUPLES_PROCESSED<span class="token punctuation">,</span></span>
<span class="line">                                 <span class="token operator">++</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="后处理" tabindex="-1"><a class="header-anchor" href="#后处理"><span>后处理</span></a></h3><p>此时大循环的执行已经结束，这意味着所有的元组已经被处理。接下来进行一些后处理，最重要的是将最后一批在内存中缓存的元组刷下去：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/* Flush any remaining buffered tuples */</span></span>
<span class="line"><span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">!=</span> CIM_SINGLE<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">CopyMultiInsertInfoIsEmpty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-from-结束阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-结束阶段"><span>COPY FROM 结束阶段</span></a></h2><p><code>EndCopyFrom</code> 完成 <code>COPY FROM</code> 的收尾清理工作。主要是关闭文件描述符，并销毁内存上下文：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token comment">/*</span>
<span class="line"> * Clean up storage and release resources for COPY FROM.</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">void</span></span>
<span class="line"><span class="token function">EndCopyFrom</span><span class="token punctuation">(</span>CopyFromState cstate<span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">/* No COPY FROM related resources except memory. */</span></span>
<span class="line">    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>is_program<span class="token punctuation">)</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token function">ClosePipeFromProgram</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line">    <span class="token keyword">else</span></span>
<span class="line">    <span class="token punctuation">{</span></span>
<span class="line">        <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>filename <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> <span class="token function">FreeFile</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>copy_file<span class="token punctuation">)</span><span class="token punctuation">)</span></span>
<span class="line">            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token punctuation">(</span><span class="token function">errcode_for_file_access</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;could not close file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span></span>
<span class="line">                            cstate<span class="token operator">-&gt;</span>filename<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">pgstat_progress_end_command</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token function">MemoryContextDelete</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>copycontext<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token function">pfree</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.postgresql.org/docs/current/sql-copy.html" target="_blank" rel="noopener noreferrer">PostgreSQL Documentation: COPY</a></p>`,80)]))}const c=s(t,[["render",l],["__file","PostgreSQL COPY FROM.html.vue"]]),r=JSON.parse('{"path":"/notes/PostgreSQL/PostgreSQL%20COPY%20FROM.html","title":"PostgreSQL - COPY FROM","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"COPY Statement","slug":"copy-statement","link":"#copy-statement","children":[]},{"level":2,"title":"权限检查","slug":"权限检查","link":"#权限检查","children":[]},{"level":2,"title":"COPY FROM 准备阶段","slug":"copy-from-准备阶段","link":"#copy-from-准备阶段","children":[]},{"level":2,"title":"COPY FROM 执行阶段","slug":"copy-from-执行阶段","link":"#copy-from-执行阶段","children":[{"level":3,"title":"表类型检查","slug":"表类型检查","link":"#表类型检查","children":[]},{"level":3,"title":"元组可见性优化","slug":"元组可见性优化","link":"#元组可见性优化","children":[]},{"level":3,"title":"初始化执行器状态","slug":"初始化执行器状态","link":"#初始化执行器状态","children":[]},{"level":3,"title":"初始化分区路由","slug":"初始化分区路由","link":"#初始化分区路由","children":[]},{"level":3,"title":"初始化过滤条件","slug":"初始化过滤条件","link":"#初始化过滤条件","children":[]},{"level":3,"title":"批量写入准备","slug":"批量写入准备","link":"#批量写入准备","children":[]},{"level":3,"title":"处理每一行输入数据","slug":"处理每一行输入数据","link":"#处理每一行输入数据","children":[]},{"level":3,"title":"后处理","slug":"后处理","link":"#后处理","children":[]}]},{"level":2,"title":"COPY FROM 结束阶段","slug":"copy-from-结束阶段","link":"#copy-from-结束阶段","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/PostgreSQL/PostgreSQL COPY FROM.md"}');export{c as comp,r as data};
