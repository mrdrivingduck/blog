import{_ as a,r as e,o as t,c as o,a as n,b as p,d as i,e as c}from"./app-25fa875f.js";const l={},u=c(`<h1 id="postgresql-copy-from" tabindex="-1"><a class="header-anchor" href="#postgresql-copy-from" aria-hidden="true">#</a> PostgreSQL - COPY FROM</h1><p>Created by: Mr Dk.</p><p>2023 / 09 / 28 00:04</p><p>Qingdao, Shandong, China</p><hr><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background" aria-hidden="true">#</a> Background</h2><p>PostgreSQL 的 <code>COPY FROM</code> 语法用于将来自外部 <em>文件</em>（磁盘文件 / 网络管道 / IPC 管道）的数据导入到数据库的表中。<code>COPY FROM</code> 支持只导入指定的部分列，其它列被填充为默认值。<code>COPY FROM</code> 还支持带有 <code>WHERE</code> 子句，只允许满足条件的行被导入到表中。</p><p><code>COPY FROM</code> 的实现逻辑比 <code>COPY TO</code> 相对复杂一些。其原因在于，<code>COPY TO</code> 是要把数据库中的数据导出到外部，其中获取数据这一步及其并行优化，很大程度上借助了优化器和执行器的能力，复用了很多代码；而 <code>COPY FROM</code> 是要把外部数据导入数据库，其中写入数据库的行为因需要更高效的定制实现，而不能复用 <code>INSERT</code> 相关的执行器代码了。</p><p>本文基于当前 PostgreSQL 主干开发分支（PostgreSQL 17 under devel）源代码对这个过程进行分析。分析过程中发现 <code>COPY FROM</code> 的代码存在一些小小的问题（真的是很小的问题..），于是误打误撞地向 PostgreSQL 社区贡献了自己的第一个 patch：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>commit e434e21e114b423e919324ad6ce1f3f079ca2a03
Author: Michael Paquier &lt;michael@paquier.xyz&gt;
Date:   Sat Sep 9 21:12:41 2023 +0900

    Remove redundant assignments in copyfrom.c

    The tuple descriptor and the number of attributes are assigned twice to
    the same values in BeginCopyFrom(), for what looks like a small thinko
    coming from the refactoring done in c532d15dddff1.

    Author: Jingtang Zhang
    Discussion: https://postgr.es/m/CAPsk3_CrYeXUVHEiaWAYxY9BKiGvGT3AoXo_+Jm0xP_s_VmXCA@mail.gmail.com
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-statement" tabindex="-1"><a class="header-anchor" href="#copy-statement" aria-hidden="true">#</a> COPY Statement</h2><p>如对 <code>COPY TO</code> 的分析所述，此类语法被视为一种 DDL。在执行器开始处理之前，语法解析器已经把与 <code>COPY</code> 相关的参数设置在 <code>CopyStmt</code> 结构中了。其中：</p><ul><li><code>relation</code>：将要被导入的表</li><li><code>attlist</code>：将要导入的列名列表</li><li><code>is_from</code>：当前执行的是 <code>COPY TO</code> 还是 <code>COPY FROM</code></li><li><code>is_program</code>：导入的来源端是否是一个进程（管道）</li><li><code>filename</code>：导入来源端的文件名/程序名（为 <code>NULL</code> 意味着从 <code>STDIN</code> 导入）</li><li><code>options</code>：导入选项</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* ----------------------
 *      Copy Statement
 *
 * We support &quot;COPY relation FROM file&quot;, &quot;COPY relation TO file&quot;, and
 * &quot;COPY (query) TO file&quot;.  In any given CopyStmt, exactly one of &quot;relation&quot;
 * and &quot;query&quot; must be non-NULL.
 * ----------------------
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyStmt</span>
<span class="token punctuation">{</span>
    NodeTag     type<span class="token punctuation">;</span>
    RangeVar   <span class="token operator">*</span>relation<span class="token punctuation">;</span>       <span class="token comment">/* the relation to copy */</span>
    Node       <span class="token operator">*</span>query<span class="token punctuation">;</span>          <span class="token comment">/* the query (SELECT or DML statement with
                                 * RETURNING) to copy, as a raw parse tree */</span>
    List       <span class="token operator">*</span>attlist<span class="token punctuation">;</span>        <span class="token comment">/* List of column names (as Strings), or NIL
                                 * for all columns */</span>
    bool        is_from<span class="token punctuation">;</span>        <span class="token comment">/* TO or FROM */</span>
    bool        is_program<span class="token punctuation">;</span>     <span class="token comment">/* is &#39;filename&#39; a program to popen? */</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>filename<span class="token punctuation">;</span>       <span class="token comment">/* filename, or NULL for STDIN/STDOUT */</span>
    List       <span class="token operator">*</span>options<span class="token punctuation">;</span>        <span class="token comment">/* List of DefElem nodes */</span>
    Node       <span class="token operator">*</span>whereClause<span class="token punctuation">;</span>    <span class="token comment">/* WHERE condition (or NULL) */</span>
<span class="token punctuation">}</span> CopyStmt<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="权限检查" tabindex="-1"><a class="header-anchor" href="#权限检查" aria-hidden="true">#</a> 权限检查</h2><p>进入到 <code>DoCopy</code> 函数后，需要进行初步的权限检查。首先需要做判断的是从文件/进程导入的场景：如果是从文件导入，那么当前用户需要有读文件的权限；如果是从程序导入，那么当前用户需要有执行程序的权限：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>bool        pipe <span class="token operator">=</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>filename <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*
 * Disallow COPY to/from file or program except to users with the
 * appropriate role.
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>pipe<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>is_program<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_EXECUTE_SERVER_PROGRAM<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY to or from an external program&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY to or from an external program.&quot;</span><span class="token punctuation">,</span>
                               <span class="token string">&quot;pg_execute_server_program&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span>
                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>is_from <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_READ_SERVER_FILES<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY from a file&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY from a file.&quot;</span><span class="token punctuation">,</span>
                               <span class="token string">&quot;pg_read_server_files&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span>
                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>is_from <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">has_privs_of_role</span><span class="token punctuation">(</span><span class="token function">GetUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> ROLE_PG_WRITE_SERVER_FILES<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_INSUFFICIENT_PRIVILEGE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;permission denied to COPY to a file&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errdetail</span><span class="token punctuation">(</span><span class="token string">&quot;Only roles with privileges of the \\&quot;%s\\&quot; role may COPY to a file.&quot;</span><span class="token punctuation">,</span>
                               <span class="token string">&quot;pg_write_server_files&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;Anyone can COPY to stdout or from stdin. &quot;</span>
                             <span class="token string">&quot;psql&#39;s \\\\copy command also works for anyone.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下一步是对将要导入的数据库表进行准备。对于 <code>COPY FROM</code> 来说，需要对表施加 <code>RowExclusiveLock</code> 级别的锁。这个级别与其它 DML 所施加的锁等级一致：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>LOCKMODE    lockmode <span class="token operator">=</span> is_from <span class="token operator">?</span> RowExclusiveLock <span class="token operator">:</span> AccessShareLock<span class="token punctuation">;</span>

<span class="token comment">/* Open and lock the relation, using the appropriate lock type. */</span>
rel <span class="token operator">=</span> <span class="token function">table_openrv</span><span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>relation<span class="token punctuation">,</span> lockmode<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果指定了 <code>WHERE</code> 子句，那么还需要将其处理为布尔表达式：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>stmt<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* add nsitem to query namespace */</span>
    <span class="token function">addNSItemToQuery</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> nsitem<span class="token punctuation">,</span> false<span class="token punctuation">,</span> true<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* Transform the raw expression tree */</span>
    whereClause <span class="token operator">=</span> <span class="token function">transformExpr</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">,</span> EXPR_KIND_COPY_WHERE<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* Make sure it yields a boolean result. */</span>
    whereClause <span class="token operator">=</span> <span class="token function">coerce_to_boolean</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> whereClause<span class="token punctuation">,</span> <span class="token string">&quot;WHERE&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* we have to fix its collations too */</span>
    <span class="token function">assign_expr_collations</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span>

    whereClause <span class="token operator">=</span> <span class="token function">eval_const_expressions</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span>

    whereClause <span class="token operator">=</span> <span class="token punctuation">(</span>Node <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">canonicalize_qual</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> whereClause<span class="token punctuation">,</span> false<span class="token punctuation">)</span><span class="token punctuation">;</span>
    whereClause <span class="token operator">=</span> <span class="token punctuation">(</span>Node <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token function">make_ands_implicit</span><span class="token punctuation">(</span><span class="token punctuation">(</span>Expr <span class="token operator">*</span><span class="token punctuation">)</span> whereClause<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于 <code>COPY FROM</code> 来说，需要确保对被导入的列具有插入权限。此外，不支持行级别安全策略：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>perminfo <span class="token operator">=</span> nsitem<span class="token operator">-&gt;</span>p_perminfo<span class="token punctuation">;</span>
perminfo<span class="token operator">-&gt;</span>requiredPerms <span class="token operator">=</span> <span class="token punctuation">(</span>is_from <span class="token operator">?</span> ACL_INSERT <span class="token operator">:</span> ACL_SELECT<span class="token punctuation">)</span><span class="token punctuation">;</span>

tupDesc <span class="token operator">=</span> <span class="token function">RelationGetDescr</span><span class="token punctuation">(</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span>
attnums <span class="token operator">=</span> <span class="token function">CopyGetAttnums</span><span class="token punctuation">(</span>tupDesc<span class="token punctuation">,</span> rel<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>attlist<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">foreach</span><span class="token punctuation">(</span>cur<span class="token punctuation">,</span> attnums<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">int</span>         attno<span class="token punctuation">;</span>
    Bitmapset <span class="token operator">*</span><span class="token operator">*</span>bms<span class="token punctuation">;</span>

    attno <span class="token operator">=</span> <span class="token function">lfirst_int</span><span class="token punctuation">(</span>cur<span class="token punctuation">)</span> <span class="token operator">-</span> FirstLowInvalidHeapAttributeNumber<span class="token punctuation">;</span>
    bms <span class="token operator">=</span> is_from <span class="token operator">?</span> <span class="token operator">&amp;</span>perminfo<span class="token operator">-&gt;</span>insertedCols <span class="token operator">:</span> <span class="token operator">&amp;</span>perminfo<span class="token operator">-&gt;</span>selectedCols<span class="token punctuation">;</span>

    <span class="token operator">*</span>bms <span class="token operator">=</span> <span class="token function">bms_add_member</span><span class="token punctuation">(</span><span class="token operator">*</span>bms<span class="token punctuation">,</span> attno<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token function">ExecCheckPermissions</span><span class="token punctuation">(</span>pstate<span class="token operator">-&gt;</span>p_rtable<span class="token punctuation">,</span> <span class="token function">list_make1</span><span class="token punctuation">(</span>perminfo<span class="token punctuation">)</span><span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接下来，执行器逻辑开始处理 <code>COPY FROM</code> 的具体事宜。与 <code>COPY TO</code> 类似，<code>BeginCopyFrom</code> / <code>CopyFrom</code> / <code>EndCopyFrom</code> 三个函数分别对应了三个执行阶段：</p><ol><li>准备</li><li>执行</li><li>结束</li></ol><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>is_from<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    CopyFromState cstate<span class="token punctuation">;</span>

    <span class="token function">Assert</span><span class="token punctuation">(</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">/* check read-only transaction and parallel mode */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>XactReadOnly <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>rel<span class="token operator">-&gt;</span>rd_islocaltemp<span class="token punctuation">)</span>
        <span class="token function">PreventCommandIfReadOnly</span><span class="token punctuation">(</span><span class="token string">&quot;COPY FROM&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    cstate <span class="token operator">=</span> <span class="token function">BeginCopyFrom</span><span class="token punctuation">(</span>pstate<span class="token punctuation">,</span> rel<span class="token punctuation">,</span> whereClause<span class="token punctuation">,</span>
                           stmt<span class="token operator">-&gt;</span>filename<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>is_program<span class="token punctuation">,</span>
                           <span class="token constant">NULL</span><span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>attlist<span class="token punctuation">,</span> stmt<span class="token operator">-&gt;</span>options<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token operator">*</span>processed <span class="token operator">=</span> <span class="token function">CopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">/* copy from file to database */</span>
    <span class="token function">EndCopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* COPY TO */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-from-准备阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-准备阶段" aria-hidden="true">#</a> COPY FROM 准备阶段</h2><p><code>BeginCopyFrom</code> 完成 <code>COPY FROM</code> 的准备工作，主要是初始化一个 <code>CopyFromState</code> 结构：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * This struct contains all the state variables used throughout a COPY FROM
 * operation.
 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyFromStateData</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* low-level state data */</span>
    CopySource  copy_src<span class="token punctuation">;</span>       <span class="token comment">/* type of copy source */</span>
    FILE       <span class="token operator">*</span>copy_file<span class="token punctuation">;</span>      <span class="token comment">/* used if copy_src == COPY_FILE */</span>
    StringInfo  fe_msgbuf<span class="token punctuation">;</span>      <span class="token comment">/* used if copy_src == COPY_FRONTEND */</span>

    EolType     eol_type<span class="token punctuation">;</span>       <span class="token comment">/* EOL type of input */</span>
    <span class="token keyword">int</span>         file_encoding<span class="token punctuation">;</span>  <span class="token comment">/* file or remote side&#39;s character encoding */</span>
    bool        need_transcoding<span class="token punctuation">;</span>   <span class="token comment">/* file encoding diff from server? */</span>
    Oid         conversion_proc<span class="token punctuation">;</span>    <span class="token comment">/* encoding conversion function */</span>

    <span class="token comment">/* parameters from the COPY command */</span>
    Relation    rel<span class="token punctuation">;</span>            <span class="token comment">/* relation to copy from */</span>
    List       <span class="token operator">*</span>attnumlist<span class="token punctuation">;</span>     <span class="token comment">/* integer list of attnums to copy */</span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>filename<span class="token punctuation">;</span>       <span class="token comment">/* filename, or NULL for STDIN */</span>
    bool        is_program<span class="token punctuation">;</span>     <span class="token comment">/* is &#39;filename&#39; a program to popen? */</span>
    copy_data_source_cb data_source_cb<span class="token punctuation">;</span> <span class="token comment">/* function for reading data */</span>

    CopyFormatOptions opts<span class="token punctuation">;</span>
    bool       <span class="token operator">*</span>convert_select_flags<span class="token punctuation">;</span>   <span class="token comment">/* per-column CSV/TEXT CS flags */</span>
    Node       <span class="token operator">*</span>whereClause<span class="token punctuation">;</span>    <span class="token comment">/* WHERE condition (or NULL) */</span>

    <span class="token comment">/* these are just for error messages, see CopyFromErrorCallback */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_relname<span class="token punctuation">;</span>    <span class="token comment">/* table name for error messages */</span>
    uint64      cur_lineno<span class="token punctuation">;</span>     <span class="token comment">/* line number for error messages */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_attname<span class="token punctuation">;</span>    <span class="token comment">/* current att for error messages */</span>
    <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span>cur_attval<span class="token punctuation">;</span>     <span class="token comment">/* current att value for error messages */</span>
    bool        relname_only<span class="token punctuation">;</span>   <span class="token comment">/* don&#39;t output line number, att, etc. */</span>

    <span class="token comment">/*
     * Working state
     */</span>
    MemoryContext copycontext<span class="token punctuation">;</span>  <span class="token comment">/* per-copy execution context */</span>

    AttrNumber  num_defaults<span class="token punctuation">;</span>   <span class="token comment">/* count of att that are missing and have
                                 * default value */</span>
    FmgrInfo   <span class="token operator">*</span>in_functions<span class="token punctuation">;</span>   <span class="token comment">/* array of input functions for each attrs */</span>
    Oid        <span class="token operator">*</span>typioparams<span class="token punctuation">;</span>    <span class="token comment">/* array of element types for in_functions */</span>
    <span class="token keyword">int</span>        <span class="token operator">*</span>defmap<span class="token punctuation">;</span>         <span class="token comment">/* array of default att numbers related to
                                 * missing att */</span>
    ExprState <span class="token operator">*</span><span class="token operator">*</span>defexprs<span class="token punctuation">;</span>       <span class="token comment">/* array of default att expressions for all
                                 * att */</span>
    bool       <span class="token operator">*</span>defaults<span class="token punctuation">;</span>       <span class="token comment">/* if DEFAULT marker was found for
                                 * corresponding att */</span>
    bool        volatile_defexprs<span class="token punctuation">;</span>  <span class="token comment">/* is any of defexprs volatile? */</span>
    List       <span class="token operator">*</span>range_table<span class="token punctuation">;</span>    <span class="token comment">/* single element list of RangeTblEntry */</span>
    List       <span class="token operator">*</span>rteperminfos<span class="token punctuation">;</span>   <span class="token comment">/* single element list of RTEPermissionInfo */</span>
    ExprState  <span class="token operator">*</span>qualexpr<span class="token punctuation">;</span>

    TransitionCaptureState <span class="token operator">*</span>transition_capture<span class="token punctuation">;</span>

    <span class="token comment">/*
     * These variables are used to reduce overhead in COPY FROM.
     *
     * attribute_buf holds the separated, de-escaped text for each field of
     * the current line.  The CopyReadAttributes functions return arrays of
     * pointers into this buffer.  We avoid palloc/pfree overhead by re-using
     * the buffer on each cycle.
     *
     * In binary COPY FROM, attribute_buf holds the binary data for the
     * current field, but the usage is otherwise similar.
     */</span>
    StringInfoData attribute_buf<span class="token punctuation">;</span>

    <span class="token comment">/* field raw data pointers found by COPY FROM */</span>

    <span class="token keyword">int</span>         max_fields<span class="token punctuation">;</span>
    <span class="token keyword">char</span>      <span class="token operator">*</span><span class="token operator">*</span>raw_fields<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Similarly, line_buf holds the whole input line being processed. The
     * input cycle is first to read the whole line into line_buf, and then
     * extract the individual attribute fields into attribute_buf.  line_buf
     * is preserved unmodified so that we can display it in error messages if
     * appropriate.  (In binary mode, line_buf is not used.)
     */</span>
    StringInfoData line_buf<span class="token punctuation">;</span>
    bool        line_buf_valid<span class="token punctuation">;</span> <span class="token comment">/* contains the row being processed? */</span>

    <span class="token comment">/*
     * input_buf holds input data, already converted to database encoding.
     *
     * In text mode, CopyReadLine parses this data sufficiently to locate line
     * boundaries, then transfers the data to line_buf. We guarantee that
     * there is a \\0 at input_buf[input_buf_len] at all times.  (In binary
     * mode, input_buf is not used.)
     *
     * If encoding conversion is not required, input_buf is not a separate
     * buffer but points directly to raw_buf.  In that case, input_buf_len
     * tracks the number of bytes that have been verified as valid in the
     * database encoding, and raw_buf_len is the total number of bytes stored
     * in the buffer.
     */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">INPUT_BUF_SIZE</span> <span class="token expression"><span class="token number">65536</span>    </span><span class="token comment">/* we palloc INPUT_BUF_SIZE+1 bytes */</span></span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>input_buf<span class="token punctuation">;</span>
    <span class="token keyword">int</span>         input_buf_index<span class="token punctuation">;</span>    <span class="token comment">/* next byte to process */</span>
    <span class="token keyword">int</span>         input_buf_len<span class="token punctuation">;</span>  <span class="token comment">/* total # of bytes stored */</span>
    bool        input_reached_eof<span class="token punctuation">;</span>  <span class="token comment">/* true if we reached EOF */</span>
    bool        input_reached_error<span class="token punctuation">;</span>    <span class="token comment">/* true if a conversion error happened */</span>
    <span class="token comment">/* Shorthand for number of unconsumed bytes available in input_buf */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name function">INPUT_BUF_BYTES</span><span class="token expression"><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>input_buf_len <span class="token operator">-</span> <span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>input_buf_index<span class="token punctuation">)</span></span></span>

    <span class="token comment">/*
     * raw_buf holds raw input data read from the data source (file or client
     * connection), not yet converted to the database encoding.  Like with
     * &#39;input_buf&#39;, we guarantee that there is a \\0 at raw_buf[raw_buf_len].
     */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">RAW_BUF_SIZE</span> <span class="token expression"><span class="token number">65536</span>      </span><span class="token comment">/* we palloc RAW_BUF_SIZE+1 bytes */</span></span>
    <span class="token keyword">char</span>       <span class="token operator">*</span>raw_buf<span class="token punctuation">;</span>
    <span class="token keyword">int</span>         raw_buf_index<span class="token punctuation">;</span>  <span class="token comment">/* next byte to process */</span>
    <span class="token keyword">int</span>         raw_buf_len<span class="token punctuation">;</span>    <span class="token comment">/* total # of bytes stored */</span>
    bool        raw_reached_eof<span class="token punctuation">;</span>    <span class="token comment">/* true if we reached EOF */</span>

    <span class="token comment">/* Shorthand for number of unconsumed bytes available in raw_buf */</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name function">RAW_BUF_BYTES</span><span class="token expression"><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>raw_buf_len <span class="token operator">-</span> <span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token operator">-&gt;</span>raw_buf_index<span class="token punctuation">)</span></span></span>

    uint64      bytes_processed<span class="token punctuation">;</span>    <span class="token comment">/* number of bytes processed so far */</span>
<span class="token punctuation">}</span> CopyFromStateData<span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">CopyFromStateData</span> <span class="token operator">*</span>CopyFromState<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中具体需要被初始化的结构包括：</p><ul><li>执行器内存上下文</li><li>将要被处理的列编号</li><li>输入格式解析选项</li><li>输入端的编码格式，已经是否需要转换编码，编码转换函数指针</li><li>执行状态</li><li>输入缓冲区及其指针和标志位 <ul><li><code>raw_buf</code>：存放从输入端接收到的裸字节</li><li><code>input_buf</code>：（文本模式下）存放从裸字节经过编码转换以后的字符</li><li><code>line_buf</code>：（文本模式下）存放一行数据的完整字符</li><li><code>attribute_buf</code>：存放当前一行数据解除转义以后按列分隔的内容</li></ul></li><li>每个列的输入转换函数（将字符串格式转为内部格式）和默认值</li><li>输入文件描述符 <ul><li>如果来自于客户端，那么向对方发送 <code>G</code> 协议，表明要接收的列和格式</li><li>如果来自于程序，那么 <code>popen</code> 启动程序</li><li>如果来自于文件，那么 <code>open</code> 打开文件，并 <code>fstat</code> 确认文件存在且不是目录</li></ul></li></ul><h2 id="copy-from-执行阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-执行阶段" aria-hidden="true">#</a> COPY FROM 执行阶段</h2><p><code>CopyFrom</code> 函数完成每一行数据的收集和写入，最终返回处理数据的总行数。</p><h3 id="表类型检查" tabindex="-1"><a class="header-anchor" href="#表类型检查" aria-hidden="true">#</a> 表类型检查</h3><p>首先进行的是表类型检查。只有普通表、外部表、分区表，或其它带有 <code>INSTEAD OF INSERT</code> 行触发器的目标才可以进行 <code>COPY FROM</code>：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * The target must be a plain, foreign, or partitioned relation, or have
 * an INSTEAD OF INSERT row trigger.  (Currently, such triggers are only
 * allowed on views, so we only hint about them in the view case.)
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_RELATION <span class="token operator">&amp;&amp;</span>
    cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_FOREIGN_TABLE <span class="token operator">&amp;&amp;</span>
    cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">!=</span> RELKIND_PARTITIONED_TABLE <span class="token operator">&amp;&amp;</span>
    <span class="token operator">!</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>trigdesc <span class="token operator">&amp;&amp;</span>
      cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>trigdesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_VIEW<span class="token punctuation">)</span>
        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to view \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span>
                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                 <span class="token function">errhint</span><span class="token punctuation">(</span><span class="token string">&quot;To enable copying to a view, provide an INSTEAD OF INSERT trigger.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_MATVIEW<span class="token punctuation">)</span>
        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to materialized view \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span>
                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_SEQUENCE<span class="token punctuation">)</span>
        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to sequence \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span>
                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                <span class="token punctuation">(</span><span class="token function">errcode</span><span class="token punctuation">(</span>ERRCODE_WRONG_OBJECT_TYPE<span class="token punctuation">)</span><span class="token punctuation">,</span>
                 <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;cannot copy to non-table relation \\&quot;%s\\&quot;&quot;</span><span class="token punctuation">,</span>
                        <span class="token function">RelationGetRelationName</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="元组可见性优化" tabindex="-1"><a class="header-anchor" href="#元组可见性优化" aria-hidden="true">#</a> 元组可见性优化</h3><p>接下来是对 <code>INSERT</code> 标志位的优化。如果被 <code>COPY FROM</code> 的目标是当前事务中新建的，那么加上 <code>TABLE_INSERT_SKIP_FSM</code>，插入时就不必检查并重用空闲空间了；如果目标是当前子事务中新建的，加上 <code>TABLE_INSERT_FROZEN</code> 使插入的行立刻冻结。</p><h3 id="初始化执行器状态" tabindex="-1"><a class="header-anchor" href="#初始化执行器状态" aria-hidden="true">#</a> 初始化执行器状态</h3><p>如果 <code>COPY FROM</code> 的目标是一个外表，那么调用 FDW API 的 <code>BeginForeignInsert</code> 使外表准备好被插入；如果外表支持批量插入，那么通过 FDW API 的 <code>GetForeignModifyBatchSize</code> 获取批量插入的大小，否则默认每次插入一行：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>BeginForeignInsert <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">BeginForeignInsert</span><span class="token punctuation">(</span>mtstate<span class="token punctuation">,</span>
                                                     resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*
 * Also, if the named relation is a foreign table, determine if the FDW
 * supports batch insert and determine the batch size (a FDW may support
 * batching, but it may be disabled for the server/table).
 *
 * If the FDW does not support batching, we set the batch size to 1.
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>GetForeignModifyBatchSize <span class="token operator">&amp;&amp;</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span>ExecForeignBatchInsert<span class="token punctuation">)</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">=</span>
        resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">GetForeignModifyBatchSize</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">else</span>
    resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token function">Assert</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">&gt;=</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="初始化分区路由" tabindex="-1"><a class="header-anchor" href="#初始化分区路由" aria-hidden="true">#</a> 初始化分区路由</h3><p>如果 <code>COPY FROM</code> 的目标是分区表，那么初始化分区表的元组路由：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * If the named relation is a partitioned table, initialize state for
 * CopyFrom tuple routing.
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>rel<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relkind <span class="token operator">==</span> RELKIND_PARTITIONED_TABLE<span class="token punctuation">)</span>
    proute <span class="token operator">=</span> <span class="token function">ExecSetupPartitionTupleRouting</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>rel<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="初始化过滤条件" tabindex="-1"><a class="header-anchor" href="#初始化过滤条件" aria-hidden="true">#</a> 初始化过滤条件</h3><p>如果 <code>COPY FROM</code> 指定了 <code>WHERE</code> 子句，那么初始化过滤条件：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span>
    cstate<span class="token operator">-&gt;</span>qualexpr <span class="token operator">=</span> <span class="token function">ExecInitQual</span><span class="token punctuation">(</span><span class="token function">castNode</span><span class="token punctuation">(</span>List<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span><span class="token punctuation">,</span>
                                    <span class="token operator">&amp;</span>mtstate<span class="token operator">-&gt;</span>ps<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="批量写入准备" tabindex="-1"><a class="header-anchor" href="#批量写入准备" aria-hidden="true">#</a> 批量写入准备</h3><p>接下来是 <strong>批量写入</strong> 的优化。对于数据库表和外部表的写入，具有两种 AM 接口：</p><ul><li>单行写入：<code>table_tuple_insert()</code> / <code>ExecForeignInsert</code></li><li>批量写入：<code>table_multi_insert()</code> / <code>ExecForeignBatchInsert</code></li></ul><p>通常来说，批量写入是更高效的，因为页面锁定频率和 WAL 记录数都更少了。</p><blockquote><p>如果表上有索引，那么堆表元组是批量写入的，而索引元组的写入依旧是随机的。这可能会成为影响性能的因素。</p></blockquote><p>不是所有场景下都能安全使用批量写入的，所以接下来要把无法安全使用的场景挑出来：</p><ul><li>表上有 <code>BEFORE</code> 或 <code>INSTEAD OF</code> 触发器：因为在插入时会顺带查询表，攒批会导致本应该能查询到的行还未被写入</li><li>是一个外表，但不支持批量写入，或强制不使用批量写入</li><li>是一个分区表，并且具有 <code>INSERT</code> 触发器</li><li>表上具有 <code>VOLATILE</code> 的默认值表达式：因为该表达式也有可能去查询表</li><li><code>WHERE</code> 子句中带有 <code>VOLATILE</code> 函数</li><li>是一个分区表，但分区中具有不支持批量插入的外部表</li></ul><p>对于可以进行批量写入的场景，初始化批量写入需要用到的内存缓冲区和相关指针；否则，初始化单行写入需要用到的结构。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * It&#39;s generally more efficient to prepare a bunch of tuples for
 * insertion, and insert them in one
 * table_multi_insert()/ExecForeignBatchInsert() call, than call
 * table_tuple_insert()/ExecForeignInsert() separately for every tuple.
 * However, there are a number of reasons why we might not be able to do
 * this.  These are explained below.
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
    <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_before_row <span class="token operator">||</span>
     resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Can&#39;t support multi-inserts when there are any BEFORE/INSTEAD OF
     * triggers on the table. Such triggers might query the table we&#39;re
     * inserting into and act differently if the tuples that have already
     * been processed and prepared for insertion are not there.
     */</span>
    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
         resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Can&#39;t support multi-inserts to a foreign table if the FDW does not
     * support batching, or it&#39;s disabled for the server or foreign table.
     */</span>
    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>proute <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
         resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_new_table<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * For partitioned tables we can&#39;t support multi-inserts when there
     * are any statement level insert triggers. It might be possible to
     * allow partitioned tables with such triggers in the future, but for
     * now, CopyMultiInsertInfoFlush expects that any after row insert and
     * statement level insert triggers are on the same relation.
     */</span>
    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>volatile_defexprs<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Can&#39;t support multi-inserts if there are any volatile default
     * expressions in the table.  Similarly to the trigger case above,
     * such expressions may query the table we&#39;re inserting into.
     *
     * Note: It does not matter if any partitions have any volatile
     * default expressions as we use the defaults from the target of the
     * COPY command.
     */</span>
    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">contain_volatile_functions</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * Can&#39;t support multi-inserts if there are any volatile function
     * expressions in WHERE clause.  Similarly to the trigger case above,
     * such expressions may query the table we&#39;re inserting into.
     */</span>
    insertMethod <span class="token operator">=</span> CIM_SINGLE<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * For partitioned tables, we may still be able to perform bulk
     * inserts.  However, the possibility of this depends on which types
     * of triggers exist on the partition.  We must disable bulk inserts
     * if the partition is a foreign table that can&#39;t use batching or it
     * has any before row insert or insert instead triggers (same as we
     * checked above for the parent table).  Since the partition&#39;s
     * resultRelInfos are initialized only when we actually need to insert
     * the first tuple into them, we must have the intermediate insert
     * method of CIM_MULTI_CONDITIONAL to flag that we must later
     * determine if we can use bulk-inserts for the partition being
     * inserted into.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>proute<span class="token punctuation">)</span>
        insertMethod <span class="token operator">=</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">;</span>
    <span class="token keyword">else</span>
        insertMethod <span class="token operator">=</span> CIM_MULTI<span class="token punctuation">;</span>

    <span class="token function">CopyMultiInsertInfoInit</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> cstate<span class="token punctuation">,</span>
                            estate<span class="token punctuation">,</span> mycid<span class="token punctuation">,</span> ti_options<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">/*
 * If not using batch mode (which allocates slots as needed) set up a
 * tuple slot too. When inserting into a partitioned table, we also need
 * one, even if we might batch insert, to read the tuple in the root
 * partition&#39;s form.
 */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    singleslot <span class="token operator">=</span> <span class="token function">table_slot_create</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">,</span>
                                   <span class="token operator">&amp;</span>estate<span class="token operator">-&gt;</span>es_tupleTable<span class="token punctuation">)</span><span class="token punctuation">;</span>
    bistate <span class="token operator">=</span> <span class="token function">GetBulkInsertState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="处理每一行输入数据" tabindex="-1"><a class="header-anchor" href="#处理每一行输入数据" aria-hidden="true">#</a> 处理每一行输入数据</h3><p>接下来是处理每一行数据的大循环，循环将会在没有任何数据输入时退出。</p><p>首先，不管是单行写入模式还是批量写入模式，都要获取一个用于保存当前元组的槽位。如果是单行写入，那么直接使用刚才调用 <code>table_slot_create</code> 创建出来的槽位就可以了，并且后面的每一行也都一直复用这个槽位；如果是批量写入，那么从内存缓冲区里获取一个槽位：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* select slot to (initially) load row into */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> proute<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    myslot <span class="token operator">=</span> singleslot<span class="token punctuation">;</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span>myslot <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">else</span>
<span class="token punctuation">{</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span>resultRelInfo <span class="token operator">==</span> target_resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">Assert</span><span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI<span class="token punctuation">)</span><span class="token punctuation">;</span>

    myslot <span class="token operator">=</span> <span class="token function">CopyMultiInsertInfoNextFreeSlot</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                             resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从输入文件描述符中获取一行数据，根据其格式，通过初始化阶段中准备好的转换函数和默认值表达式，转换为数据库内部的元组表示形式（此处省略内部细节），并存储在槽位中：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Directly store the values/nulls array in the slot */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">NextCopyFrom</span><span class="token punctuation">(</span>cstate<span class="token punctuation">,</span> econtext<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_values<span class="token punctuation">,</span> myslot<span class="token operator">-&gt;</span>tts_isnull<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token keyword">break</span><span class="token punctuation">;</span>

<span class="token function">ExecStoreVirtualTuple</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*
 * Constraints and where clause might reference the tableoid column,
 * so (re-)initialize tts_tableOid before evaluating them.
 */</span>
myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>target_resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果指定了 <code>WHERE</code> 子句，那么将这行数据根据过滤条件进行判断，略过不符合条件的行，直接进行下轮循环：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>whereClause<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    econtext<span class="token operator">-&gt;</span>ecxt_scantuple <span class="token operator">=</span> myslot<span class="token punctuation">;</span>
    <span class="token comment">/* Skip items that don&#39;t match COPY&#39;s WHERE clause */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecQual</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>qualexpr<span class="token punctuation">,</span> econtext<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * Report that this tuple was filtered out by the WHERE
         * clause.
         */</span>
        <span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_COPY_TUPLES_EXCLUDED<span class="token punctuation">,</span>
                                     <span class="token operator">++</span>excluded<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">continue</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果 <code>COPY FROM</code> 的目标是一个分区表，那么接下来需要确认当前元组真正将会被插入的子分区，并确认这个子分区是否可以使用批量写入。如果可以批量写入，而本次要写入的子分区与上一个子分区不同时，需要先把上一个子分区攒批的缓存元组刷入磁盘，然后将当前元组写入槽位。由于子分区和父分区的列编号可能是不一致的，所以需要获取一个 <code>TupleConversionMap</code> 结构，该结构能够根据列名称，将子分区和父分区对应同一个列的编号相互映射。在写入槽位时，需要以该映射作为参数，保证数据的正确性。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Determine the partition to insert the tuple into */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>proute<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    TupleConversionMap <span class="token operator">*</span>map<span class="token punctuation">;</span>

    <span class="token comment">/*
     * Attempt to find a partition suitable for this tuple.
     * ExecFindPartition() will raise an error if none can be found or
     * if the found partition is not suitable for INSERTs.
     */</span>
    resultRelInfo <span class="token operator">=</span> <span class="token function">ExecFindPartition</span><span class="token punctuation">(</span>mtstate<span class="token punctuation">,</span> target_resultRelInfo<span class="token punctuation">,</span>
                                      proute<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevResultRelInfo <span class="token operator">!=</span> resultRelInfo<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/* Determine which triggers exist on this partition */</span>
        has_before_insert_row_trig <span class="token operator">=</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">&amp;&amp;</span>
                                      resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_before_row<span class="token punctuation">)</span><span class="token punctuation">;</span>

        has_instead_insert_row_trig <span class="token operator">=</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc <span class="token operator">&amp;&amp;</span>
                                       resultRelInfo<span class="token operator">-&gt;</span>ri_TrigDesc<span class="token operator">-&gt;</span>trig_insert_instead_row<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Disable multi-inserts when the partition has BEFORE/INSTEAD
         * OF triggers, or if the partition is a foreign table that
         * can&#39;t use batching.
         */</span>
        leafpart_use_multi_insert <span class="token operator">=</span> insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL <span class="token operator">&amp;&amp;</span>
            <span class="token operator">!</span>has_before_insert_row_trig <span class="token operator">&amp;&amp;</span>
            <span class="token operator">!</span>has_instead_insert_row_trig <span class="token operator">&amp;&amp;</span>
            <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span>
             resultRelInfo<span class="token operator">-&gt;</span>ri_BatchSize <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/* Set the multi-insert buffer to use for this partition. */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>leafpart_use_multi_insert<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_CopyMultiInsertBuffer <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
                <span class="token function">CopyMultiInsertInfoSetupBuffer</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                               resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL <span class="token operator">&amp;&amp;</span>
                 <span class="token operator">!</span><span class="token function">CopyMultiInsertInfoIsEmpty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * Flush pending inserts if this partition can&#39;t use
             * batching, so rows are visible to triggers etc.
             */</span>
            <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                     resultRelInfo<span class="token punctuation">,</span>
                                     <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>bistate <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
            <span class="token function">ReleaseBulkInsertStatePin</span><span class="token punctuation">(</span>bistate<span class="token punctuation">)</span><span class="token punctuation">;</span>
        prevResultRelInfo <span class="token operator">=</span> resultRelInfo<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * If we&#39;re capturing transition tuples, we might need to convert
     * from the partition rowtype to root rowtype. But if there are no
     * BEFORE triggers on the partition that could change the tuple,
     * we can just remember the original unconverted tuple to avoid a
     * needless round trip conversion.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>transition_capture <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        cstate<span class="token operator">-&gt;</span>transition_capture<span class="token operator">-&gt;</span>tcs_original_insert_tuple <span class="token operator">=</span>
            <span class="token operator">!</span>has_before_insert_row_trig <span class="token operator">?</span> myslot <span class="token operator">:</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/*
     * We might need to convert from the root rowtype to the partition
     * rowtype.
     */</span>
    map <span class="token operator">=</span> <span class="token function">ExecGetRootToChildMap</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_SINGLE <span class="token operator">||</span> <span class="token operator">!</span>leafpart_use_multi_insert<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/* non batch insert */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            TupleTableSlot <span class="token operator">*</span>new_slot<span class="token punctuation">;</span>

            new_slot <span class="token operator">=</span> resultRelInfo<span class="token operator">-&gt;</span>ri_PartitionTupleSlot<span class="token punctuation">;</span>
            myslot <span class="token operator">=</span> <span class="token function">execute_attr_map_slot</span><span class="token punctuation">(</span>map<span class="token operator">-&gt;</span>attrMap<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> new_slot<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/*
         * Prepare to queue up tuple for later batch insert into
         * current partition.
         */</span>
        TupleTableSlot <span class="token operator">*</span>batchslot<span class="token punctuation">;</span>

        <span class="token comment">/* no other path available for partitioned table */</span>
        <span class="token function">Assert</span><span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI_CONDITIONAL<span class="token punctuation">)</span><span class="token punctuation">;</span>

        batchslot <span class="token operator">=</span> <span class="token function">CopyMultiInsertInfoNextFreeSlot</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                                    resultRelInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>map <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
            myslot <span class="token operator">=</span> <span class="token function">execute_attr_map_slot</span><span class="token punctuation">(</span>map<span class="token operator">-&gt;</span>attrMap<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span>
                                           batchslot<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">else</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * This looks more expensive than it is (Believe me, I
             * optimized it away. Twice.). The input is in virtual
             * form, and we&#39;ll materialize the slot below - for most
             * slot types the copy performs the work materialization
             * would later require anyway.
             */</span>
            <span class="token function">ExecCopySlot</span><span class="token punctuation">(</span>batchslot<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">;</span>
            myslot <span class="token operator">=</span> batchslot<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* ensure that triggers etc see the right relation  */</span>
    myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后终于到了完成写入的环节：</p><ul><li>如果表上有 <code>BEFORE ROW INSERT</code> 触发器，那么先执行一遍，如果执行的结果是 do nothing，就直接跳过写入</li><li>如果表上有 <code>INSTEAD OF INSERT ROW</code> 触发器，那么把这个元组交给触发器处理</li></ul><p>然后进行一些写入前检查：</p><ul><li>计算生成列的列值</li><li>检查元组是否符合表上的约束</li><li>检查元组是否符合分区约束</li></ul><p>根据当前元组是单行写入还是批量写入，将元组写入 AM 或内存缓冲区中。如果表上有索引，还需要创建并插入相应的索引元组。最后调用 <code>AFTER ROW INSERT</code> 触发器。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>skip_tuple <span class="token operator">=</span> false<span class="token punctuation">;</span>

<span class="token comment">/* BEFORE ROW INSERT Triggers */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>has_before_insert_row_trig<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">ExecBRInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">)</span>
        skip_tuple <span class="token operator">=</span> true<span class="token punctuation">;</span>  <span class="token comment">/* &quot;do nothing&quot; */</span>
<span class="token punctuation">}</span>

<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>skip_tuple<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/*
     * If there is an INSTEAD OF INSERT ROW trigger, let it handle the
     * tuple.  Otherwise, proceed with inserting the tuple into the
     * table or foreign table.
     */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>has_instead_insert_row_trig<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">ExecIRInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span>
    <span class="token punctuation">{</span>
        <span class="token comment">/* Compute stored generated columns */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr <span class="token operator">&amp;&amp;</span>
            resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr<span class="token operator">-&gt;</span>has_generated_stored<span class="token punctuation">)</span>
            <span class="token function">ExecComputeStoredGenerated</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span>
                                       CMD_INSERT<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * If the target is a plain table, check the constraints of
         * the tuple.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span>
            resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_att<span class="token operator">-&gt;</span>constr<span class="token punctuation">)</span>
            <span class="token function">ExecConstraints</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/*
         * Also check the tuple against the partition constraint, if
         * there is one; except that if we got here via tuple-routing,
         * we don&#39;t need to if there&#39;s no BR trigger defined on the
         * partition.
         */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token operator">-&gt;</span>rd_rel<span class="token operator">-&gt;</span>relispartition <span class="token operator">&amp;&amp;</span>
            <span class="token punctuation">(</span>proute <span class="token operator">==</span> <span class="token constant">NULL</span> <span class="token operator">||</span> has_before_insert_row_trig<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">ExecPartitionCheck</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span> estate<span class="token punctuation">,</span> true<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">/* Store the slot in the multi-insert buffer, when enabled. */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">==</span> CIM_MULTI <span class="token operator">||</span> leafpart_use_multi_insert<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/*
             * The slot previously might point into the per-tuple
             * context. For batching it needs to be longer lived.
             */</span>
            <span class="token function">ExecMaterializeSlot</span><span class="token punctuation">(</span>myslot<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">/* Add this tuple to the tuple buffer */</span>
            <span class="token function">CopyMultiInsertInfoStore</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                     resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span>
                                     cstate<span class="token operator">-&gt;</span>line_buf<span class="token punctuation">.</span>len<span class="token punctuation">,</span>
                                     cstate<span class="token operator">-&gt;</span>cur_lineno<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * If enough inserts have queued up, then flush all
             * buffers out to their tables.
             */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">CopyMultiInsertInfoIsFull</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span>
                                         resultRelInfo<span class="token punctuation">,</span>
                                         <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">/*
             * We delay updating the row counter and progress of the
             * COPY command until after writing the tuples stored in
             * the buffer out to the table, as in single insert mode.
             * See CopyMultiInsertBufferFlush().
             */</span>
            <span class="token keyword">continue</span><span class="token punctuation">;</span>   <span class="token comment">/* next tuple please */</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">else</span>
        <span class="token punctuation">{</span>
            List       <span class="token operator">*</span>recheckIndexes <span class="token operator">=</span> NIL<span class="token punctuation">;</span>

            <span class="token comment">/* OK, store the tuple */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
            <span class="token punctuation">{</span>
                myslot <span class="token operator">=</span> resultRelInfo<span class="token operator">-&gt;</span>ri_FdwRoutine<span class="token operator">-&gt;</span><span class="token function">ExecForeignInsert</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span>
                                                                         resultRelInfo<span class="token punctuation">,</span>
                                                                         myslot<span class="token punctuation">,</span>
                                                                         <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                <span class="token keyword">if</span> <span class="token punctuation">(</span>myslot <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token comment">/* &quot;do nothing&quot; */</span>
                    <span class="token keyword">continue</span><span class="token punctuation">;</span>   <span class="token comment">/* next tuple please */</span>

                <span class="token comment">/*
                 * AFTER ROW Triggers might reference the tableoid
                 * column, so (re-)initialize tts_tableOid before
                 * evaluating them.
                 */</span>
                myslot<span class="token operator">-&gt;</span>tts_tableOid <span class="token operator">=</span> <span class="token function">RelationGetRelid</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">else</span>
            <span class="token punctuation">{</span>
                <span class="token comment">/* OK, store the tuple and create index entries for it */</span>
                <span class="token function">table_tuple_insert</span><span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_RelationDesc<span class="token punctuation">,</span>
                                   myslot<span class="token punctuation">,</span> mycid<span class="token punctuation">,</span> ti_options<span class="token punctuation">,</span> bistate<span class="token punctuation">)</span><span class="token punctuation">;</span>

                <span class="token keyword">if</span> <span class="token punctuation">(</span>resultRelInfo<span class="token operator">-&gt;</span>ri_NumIndices <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span>
                    recheckIndexes <span class="token operator">=</span> <span class="token function">ExecInsertIndexTuples</span><span class="token punctuation">(</span>resultRelInfo<span class="token punctuation">,</span>
                                                           myslot<span class="token punctuation">,</span>
                                                           estate<span class="token punctuation">,</span>
                                                           false<span class="token punctuation">,</span>
                                                           false<span class="token punctuation">,</span>
                                                           <span class="token constant">NULL</span><span class="token punctuation">,</span>
                                                           NIL<span class="token punctuation">,</span>
                                                           false<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">/* AFTER ROW INSERT Triggers */</span>
            <span class="token function">ExecARInsertTriggers</span><span class="token punctuation">(</span>estate<span class="token punctuation">,</span> resultRelInfo<span class="token punctuation">,</span> myslot<span class="token punctuation">,</span>
                                 recheckIndexes<span class="token punctuation">,</span> cstate<span class="token operator">-&gt;</span>transition_capture<span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token function">list_free</span><span class="token punctuation">(</span>recheckIndexes<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/*
     * We count only tuples not suppressed by a BEFORE INSERT trigger
     * or FDW; this is the same definition used by nodeModifyTable.c
     * for counting tuples inserted by an INSERT command.  Update
     * progress of the COPY command as well.
     */</span>
    <span class="token function">pgstat_progress_update_param</span><span class="token punctuation">(</span>PROGRESS_COPY_TUPLES_PROCESSED<span class="token punctuation">,</span>
                                 <span class="token operator">++</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="后处理" tabindex="-1"><a class="header-anchor" href="#后处理" aria-hidden="true">#</a> 后处理</h3><p>此时大循环的执行已经结束，这意味着所有的元组已经被处理。接下来进行一些后处理，最重要的是将最后一批在内存中缓存的元组刷下去：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Flush any remaining buffered tuples */</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>insertMethod <span class="token operator">!=</span> CIM_SINGLE<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">CopyMultiInsertInfoIsEmpty</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token function">CopyMultiInsertInfoFlush</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>multiInsertInfo<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>processed<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="copy-from-结束阶段" tabindex="-1"><a class="header-anchor" href="#copy-from-结束阶段" aria-hidden="true">#</a> COPY FROM 结束阶段</h2><p><code>EndCopyFrom</code> 完成 <code>COPY FROM</code> 的收尾清理工作。主要是关闭文件描述符，并销毁内存上下文：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * Clean up storage and release resources for COPY FROM.
 */</span>
<span class="token keyword">void</span>
<span class="token function">EndCopyFrom</span><span class="token punctuation">(</span>CopyFromState cstate<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* No COPY FROM related resources except memory. */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>is_program<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">ClosePipeFromProgram</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>filename <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token operator">&amp;&amp;</span> <span class="token function">FreeFile</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>copy_file<span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token function">ereport</span><span class="token punctuation">(</span>ERROR<span class="token punctuation">,</span>
                    <span class="token punctuation">(</span><span class="token function">errcode_for_file_access</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
                     <span class="token function">errmsg</span><span class="token punctuation">(</span><span class="token string">&quot;could not close file \\&quot;%s\\&quot;: %m&quot;</span><span class="token punctuation">,</span>
                            cstate<span class="token operator">-&gt;</span>filename<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token function">pgstat_progress_end_command</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token function">MemoryContextDelete</span><span class="token punctuation">(</span>cstate<span class="token operator">-&gt;</span>copycontext<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">pfree</span><span class="token punctuation">(</span>cstate<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references" aria-hidden="true">#</a> References</h2>`,79),r={href:"https://www.postgresql.org/docs/current/sql-copy.html",target:"_blank",rel:"noopener noreferrer"};function d(k,v){const s=e("ExternalLinkIcon");return t(),o("div",null,[u,n("p",null,[n("a",r,[p("PostgreSQL Documentation: COPY"),i(s)])])])}const b=a(l,[["render",d],["__file","PostgreSQL COPY FROM.html.vue"]]);export{b as default};
