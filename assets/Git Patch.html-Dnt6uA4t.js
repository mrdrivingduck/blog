import{_ as s,c as a,a as e,o as i}from"./app-BeHGwf2X.js";const l={};function c(d,n){return i(),a("div",null,n[0]||(n[0]=[e(`<h1 id="git-patch" tabindex="-1"><a class="header-anchor" href="#git-patch"><span>Git - Patch</span></a></h1><p>Created by : Mr Dk.</p><p>2022 / 01 / 12 22:29</p><p>Nanjing, Jiangsu, China</p><hr><p>试水 Git 的补丁导出和补丁应用功能：</p><ul><li>从代码库中导出文本形式的补丁文件以便分发</li><li>将文本形式的补丁应用到另一个代码库中，并解决潜在的冲突</li></ul><p>该功能可以解决跨代码库的代码变更移植问题，甚至可以解决跨代码库重命名源文件的移植问题。</p><h2 id="background" tabindex="-1"><a class="header-anchor" href="#background"><span>Background</span></a></h2><p>某个项目 A 的目录结构如图所示：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ tree A</span>
<span class="line">A</span>
<span class="line">└── src</span>
<span class="line">    └── backend</span>
<span class="line">        └── foo.c</span>
<span class="line"></span>
<span class="line">2 directories, 1 file</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在另一个项目 B 中，也使用了项目 A <code>src/backend/</code> 中的 <code>foo.c</code> 源代码，但是放到了另一个目录 <code>src/another/</code> 下：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ tree B</span>
<span class="line">B</span>
<span class="line">└── src</span>
<span class="line">    └── another</span>
<span class="line">        └── foo.c</span>
<span class="line"></span>
<span class="line">2 directories, 1 file</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>随着项目 A 中 <code>foo.c</code> 文件的不断演变，想要使项目 B 的 <code>foo.c</code> 也能够及时追踪这些变动。由于这两个文件属于不同的代码库，且文件所在的目录也发生了变化，因此不能直接使用 <code>cherry-pick</code> 解决这个问题。</p><p>拟解决的方法是：</p><ol><li>从项目 A 的 commit 记录中导出文本形式的补丁，补丁中包含了 commit 信息</li><li>编辑文本形式的补丁，将 diff 里项目 A 的文件路径改为项目 B 的文件路径</li><li>将补丁应用到项目 B 当中</li></ol><h2 id="format-patch" tabindex="-1"><a class="header-anchor" href="#format-patch"><span>Format Patch</span></a></h2><p>Git 的 <code>format-patch</code> 命令可以将一次 commit 的 diff 导出为文本格式。在导出的文件中，包含了：</p><ul><li>补丁作者信息</li><li>补丁 commit 时间</li><li>补丁 commit message</li><li>补丁具体的 diff</li><li>Git 版本号</li></ul><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git format-patch -1 82058795ae3b65276004bdbaf965dc6568af1408</span>
<span class="line">0001-Project-A-add-sth.patch</span>
<span class="line"></span>
<span class="line">$ cat 0001-Project-A-add-sth.patch</span>
<span class="line">From 82058795ae3b65276004bdbaf965dc6568af1408 Mon Sep 17 00:00:00 2001</span>
<span class="line">From: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date: Wed, 12 Jan 2022 21:47:13 +0800</span>
<span class="line">Subject: [PATCH] Project A add sth.</span>
<span class="line"></span>
<span class="line">---</span>
<span class="line"> src/backend/foo.c | 3 +++</span>
<span class="line"> 1 file changed, 3 insertions(+)</span>
<span class="line"></span>
<span class="line">diff --git a/src/backend/foo.c b/src/backend/foo.c</span>
<span class="line">index 263cf7e..480f9e7 100644</span>
<span class="line">--- a/src/backend/foo.c</span>
<span class="line">+++ b/src/backend/foo.c</span>
<span class="line">@@ -2,6 +2,9 @@</span>
<span class="line"></span>
<span class="line"> int main()</span>
<span class="line"> {</span>
<span class="line">+    // Project A add sth. start</span>
<span class="line">+    //</span>
<span class="line">+    // Project A add sth. end</span>
<span class="line">     return 0;</span>
<span class="line"> }</span>
<span class="line"></span>
<span class="line">--</span>
<span class="line">2.25.1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>也可以直接导出某次 commit 之后所有 commit 的补丁，会自动按照从 <code>0001</code> 开始的编号来排列。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git log</span>
<span class="line"></span>
<span class="line">commit 0917a83586ec8eb89a62dab616ee634fc2f9ad79 (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:48:01 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project A add sth. again</span>
<span class="line"></span>
<span class="line">commit 82058795ae3b65276004bdbaf965dc6568af1408</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:47:13 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project A add sth.</span>
<span class="line"></span>
<span class="line">commit 28188a533e874eae1160e71be339922b0a9655aa</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:46:45 2022 +0800</span>
<span class="line"></span>
<span class="line">    Initial commit</span>
<span class="line"></span>
<span class="line">$ git format-patch 28188a533e874eae1160e71be339922b0a9655aa</span>
<span class="line">0001-Project-A-add-sth.patch</span>
<span class="line">0002-Project-A-add-sth.-again.patch</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="am" tabindex="-1"><a class="header-anchor" href="#am"><span>Am</span></a></h2><p>从项目 A 中导出的两个补丁分别对 <code>foo.c</code> 进行了如下更改：</p><div class="language-diff line-numbers-mode" data-highlighter="prismjs" data-ext="diff" data-title="diff"><pre><code><span class="line">diff --git a/src/backend/foo.c b/src/backend/foo.c</span>
<span class="line">index 263cf7e..480f9e7 100644</span>
<span class="line"><span class="token coord">--- a/src/backend/foo.c</span></span>
<span class="line"><span class="token coord">+++ b/src/backend/foo.c</span></span>
<span class="line"><span class="token coord">@@ -2,6 +2,9 @@</span></span>
<span class="line"></span>
<span class="line"><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">int main()</span>
<span class="line"></span><span class="token prefix unchanged"> </span><span class="token line">{</span>
<span class="line"></span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line">    // Project A add sth. start</span>
<span class="line"></span><span class="token prefix inserted">+</span><span class="token line">    //</span>
<span class="line"></span><span class="token prefix inserted">+</span><span class="token line">    // Project A add sth. end</span>
<span class="line"></span></span><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">    return 0;</span>
<span class="line"></span><span class="token prefix unchanged"> </span><span class="token line">}</span>
<span class="line"></span></span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-diff line-numbers-mode" data-highlighter="prismjs" data-ext="diff" data-title="diff"><pre><code><span class="line">diff --git a/src/backend/foo.c b/src/backend/foo.c</span>
<span class="line">index 480f9e7..68071af 100644</span>
<span class="line"><span class="token coord">--- a/src/backend/foo.c</span></span>
<span class="line"><span class="token coord">+++ b/src/backend/foo.c</span></span>
<span class="line">@@ -5,6 +5,8 @@ int main()</span>
<span class="line"><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">    // Project A add sth. start</span>
<span class="line"></span><span class="token prefix unchanged"> </span><span class="token line">    //</span>
<span class="line"></span><span class="token prefix unchanged"> </span><span class="token line">    // Project A add sth. end</span>
<span class="line"></span></span><span class="token inserted-sign inserted"><span class="token prefix inserted">+</span><span class="token line"></span>
<span class="line"></span><span class="token prefix inserted">+</span><span class="token line">    // Project A add sth. again</span>
<span class="line"></span></span><span class="token unchanged"><span class="token prefix unchanged"> </span><span class="token line">    return 0;</span>
<span class="line"></span><span class="token prefix unchanged"> </span><span class="token line">}</span>
<span class="line"></span></span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 Git 的 <code>am</code> 命令可以将补丁应用到代码库中。但是项目 B 的文件路径为 <code>src/another/foo.c</code>，不同于项目 A 及其 patch 中的 <code>src/backend/foo.c</code>。这怎么办呢？</p><p>那就直接编辑 <code>.patch</code> 文件中的 diff，将 <code>src/backend/foo.c</code> 改为 <code>src/another/foo.c</code>，然后应用补丁：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git am ../A/0001-Project-A-add-sth.patch</span>
<span class="line">Applying: Project A add sth.</span>
<span class="line"></span>
<span class="line">$ git am ../A/0002-Project-A-add-sth.-again.patch</span>
<span class="line">Applying: Project A add sth. again</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时，项目 B 的 commit 记录与项目 A 如出一辙：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git log</span>
<span class="line"></span>
<span class="line">commit caa028bb5e0341cf551d95908d3380eb7230fb57 (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:48:01 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project A add sth. again</span>
<span class="line"></span>
<span class="line">commit 3abadbc2da7dccd54c9f0910a87c714938626ee2</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:47:13 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project A add sth.</span>
<span class="line"></span>
<span class="line">commit b3a2dec42fd0e569cf5dbedaea67bcf86624615c</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 22:02:50 2022 +0800</span>
<span class="line"></span>
<span class="line">    Initial commit for B</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="conflict" tabindex="-1"><a class="header-anchor" href="#conflict"><span>Conflict</span></a></h2><p>应用补丁时遇到冲突了怎么办？假设项目 B 的 <code>foo.c</code> 文件在应用补丁之前已经进行了如下修改：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git show b945780884fc69e526789ce29a1c078a6573d9d0</span>
<span class="line"></span>
<span class="line">commit b945780884fc69e526789ce29a1c078a6573d9d0 (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 22:06:15 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project B add sth.</span>
<span class="line"></span>
<span class="line">diff --git a/src/another/foo.c b/src/another/foo.c</span>
<span class="line">index 263cf7e..01d45db 100644</span>
<span class="line">--- a/src/another/foo.c</span>
<span class="line">+++ b/src/another/foo.c</span>
<span class="line">@@ -2,6 +2,7 @@</span>
<span class="line"></span>
<span class="line"> int main()</span>
<span class="line"> {</span>
<span class="line">+    // Project B add sth.</span>
<span class="line">     return 0;</span>
<span class="line"> }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>显然，这与项目 A 导出的两个补丁将会冲突。<code>git am</code> 命令提供了类似 <code>git merge</code> 的冲突处理方式来解决冲突。其中，<code>-3</code> 的含义为使用 <strong>三方合并</strong> 算法：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">-3, --3way, --no-3way</span>
<span class="line">    When the patch does not apply cleanly, fall back on 3-way merge if the patch records the</span>
<span class="line">    identity of blobs it is supposed to apply to and we have those blobs available locally.</span>
<span class="line">    --no-3way can be used to override am.threeWay configuration variable. For more information, see</span>
<span class="line">    am.threeWay in git-config(1).</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git am -3 ../A/0001-Project-A-add-sth.patch</span>
<span class="line">Applying: Project A add sth.</span>
<span class="line">Using index info to reconstruct a base tree...</span>
<span class="line">M       src/another/foo.c</span>
<span class="line">Falling back to patching base and 3-way merge...</span>
<span class="line">Auto-merging src/another/foo.c</span>
<span class="line">CONFLICT (content): Merge conflict in src/another/foo.c</span>
<span class="line">error: Failed to merge in the changes.</span>
<span class="line">Patch failed at 0001 Project A add sth.</span>
<span class="line">hint: Use &#39;git am --show-current-patch&#39; to see the failed patch</span>
<span class="line">When you have resolved this problem, run &quot;git am --continue&quot;.</span>
<span class="line">If you prefer to skip this patch, run &quot;git am --skip&quot; instead.</span>
<span class="line">To restore the original branch and stop patching, run &quot;git am --abort&quot;.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时，在 <code>foo.c</code> 中，已经出现了待解决的冲突标志：</p><div class="language-c line-numbers-mode" data-highlighter="prismjs" data-ext="c" data-title="c"><pre><code><span class="line"><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdio.h&gt;</span></span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token punctuation">{</span></span>
<span class="line"><span class="token operator">&lt;&lt;</span><span class="token operator">&lt;&lt;</span><span class="token operator">&lt;&lt;</span><span class="token operator">&lt;</span> HEAD</span>
<span class="line">    <span class="token comment">// Project B add sth.</span></span>
<span class="line"><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span></span>
<span class="line">    <span class="token comment">// Project A add sth. start</span></span>
<span class="line">    <span class="token comment">//</span></span>
<span class="line">    <span class="token comment">// Project A add sth. end</span></span>
<span class="line"><span class="token operator">&gt;&gt;</span><span class="token operator">&gt;&gt;</span><span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> Project A add sth<span class="token punctuation">.</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>解决冲突后，保存文件：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">You are in the middle of an am session.</span>
<span class="line">  (fix conflicts and then run &quot;git am --continue&quot;)</span>
<span class="line">  (use &quot;git am --skip&quot; to skip this patch)</span>
<span class="line">  (use &quot;git am --abort&quot; to restore the original branch)</span>
<span class="line"></span>
<span class="line">Unmerged paths:</span>
<span class="line">  (use &quot;git restore --staged &lt;file&gt;...&quot; to unstage)</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to mark resolution)</span>
<span class="line">        both modified:   src/another/foo.c</span>
<span class="line"></span>
<span class="line">no changes added to commit (use &quot;git add&quot; and/or &quot;git commit -a&quot;)</span>
<span class="line"></span>
<span class="line">$ git add src/another/foo.c</span>
<span class="line"></span>
<span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">You are in the middle of an am session.</span>
<span class="line">  (fix conflicts and then run &quot;git am --continue&quot;)</span>
<span class="line">  (use &quot;git am --skip&quot; to skip this patch)</span>
<span class="line">  (use &quot;git am --abort&quot; to restore the original branch)</span>
<span class="line"></span>
<span class="line">Changes to be committed:</span>
<span class="line">  (use &quot;git restore --staged &lt;file&gt;...&quot; to unstage)</span>
<span class="line">        modified:   src/another/foo.c</span>
<span class="line"></span>
<span class="line">$ git am --continue</span>
<span class="line">Applying: Project A add sth.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就成功在项目 B 中应用了项目 A 导出的补丁：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git log</span>
<span class="line"></span>
<span class="line">commit 6dc46e2199bc53eb28a7b6ccb79fb383a5e9ad3c (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 21:47:13 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project A add sth.</span>
<span class="line"></span>
<span class="line">commit b945780884fc69e526789ce29a1c078a6573d9d0</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 22:06:15 2022 +0800</span>
<span class="line"></span>
<span class="line">    Project B add sth.</span>
<span class="line"></span>
<span class="line">commit b3a2dec42fd0e569cf5dbedaea67bcf86624615c</span>
<span class="line">Author: mrdrivingduck &lt;562655624@qq.com&gt;</span>
<span class="line">Date:   Wed Jan 12 22:02:50 2022 +0800</span>
<span class="line"></span>
<span class="line">    Initial commit for B</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="am-three-way-issue" tabindex="-1"><a class="header-anchor" href="#am-three-way-issue"><span>AM Three-Way Issue</span></a></h2><p>在 <code>git am -3</code> 的时候出现以下错误：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">fatal: sha1 information is lacking or useless (xxx/xxx).</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在 <a href="https://stackoverflow.com/questions/16572024/get-error-message-fatal-sha1-information-is-lacking-or-useless-when-apply-a" target="_blank" rel="noopener noreferrer">这个回答</a> 中，答者指出在带有与 patch 不相关历史的 Git 仓库内进行 <code>git am -3</code> 会出现这个问题，因为与 patch 中改动相关的文件 hash 不在当前代码库中。解决方式是把 patch 的来源代码库作为 remote 来源添加到当前代码库中，并且 <code>git fetch</code>。</p><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://git-scm.com/docs/git-format-patch" target="_blank" rel="noopener noreferrer">Git Documentations - format-patch</a></p><p><a href="https://git-scm.com/docs/git-am" target="_blank" rel="noopener noreferrer">Git Documentations - am</a></p><p><a href="https://stackoverflow.com/questions/12240154/what-is-the-difference-between-git-am-and-git-apply" target="_blank" rel="noopener noreferrer">Stackoverflow - What is the difference between git am and git apply?</a></p><p><a href="https://stackoverflow.com/questions/6658313/how-can-i-generate-a-git-patch-for-a-specific-commit" target="_blank" rel="noopener noreferrer">Stackoverflow - How can I generate a Git patch for a specific commit?</a></p>`,52)]))}const p=s(l,[["render",c],["__file","Git Patch.html.vue"]]),r=JSON.parse('{"path":"/notes/Git/Git%20Patch.html","title":"Git - Patch","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Background","slug":"background","link":"#background","children":[]},{"level":2,"title":"Format Patch","slug":"format-patch","link":"#format-patch","children":[]},{"level":2,"title":"Am","slug":"am","link":"#am","children":[]},{"level":2,"title":"Conflict","slug":"conflict","link":"#conflict","children":[]},{"level":2,"title":"AM Three-Way Issue","slug":"am-three-way-issue","link":"#am-three-way-issue","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Patch.md"}');export{p as comp,r as data};
