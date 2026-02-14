import{_ as s,c as e,a as i,o as a}from"./app-BeHGwf2X.js";const l={};function d(t,n){return a(),e("div",null,n[0]||(n[0]=[i(`<h1 id="git-commit" tabindex="-1"><a class="header-anchor" href="#git-commit"><span>Git - Commit</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 03 / 26 16:12</p><p>Ningbo, Zhejiang, China</p><hr><p><em>Diff</em> 是一个 Unix 上的很古老的工具，用于比较两个文本文件的差异。在其一路演变的过程中，共产生了三种输出格式：</p><ol><li>Normal diff</li><li>Context diff</li><li>Unified diff</li></ol><p>同样，Git 中也有类似的 diff 功能，用于比较两个版本之间的文件差异。虽然很少敲这个命令，但是在 IDE 的 Git 插件中已经通过 <code>modified</code> 的形式显示出来了。</p><h2 id="normal-diff" tabindex="-1"><a class="header-anchor" href="#normal-diff"><span>Normal Diff</span></a></h2><p>这是最早期版本的 Unix 中的 diff 的输出格式：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff f1 f2</span>
<span class="line">30,31c30</span>
<span class="line">&lt;             System.out.println(hunk.getToFileRange().getLineStart());</span>
<span class="line">&lt;             System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line">---</span>
<span class="line">&gt;             return;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出分为两部分。第一部分是两对数字和中间的字母。中间的字母表示动作，包括：</p><ul><li><code>c</code> - change - 内容改变</li><li><code>a</code> - addition - 内容增加</li><li><code>d</code> - deletion - 内容删除</li></ul><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff f1 f2</span>
<span class="line">31a32</span>
<span class="line">&gt;             return;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff f1 f2</span>
<span class="line">30,31d29</span>
<span class="line">&lt;             System.out.println(hunk.getToFileRange().getLineStart());</span>
<span class="line">&lt;             System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两对数字中，左边的部分是修改前版本中的行号，右边的部分是修改后版本中的行号。</p><p>第二部分是修改的详细内容。如果是同时有增加有删除的，那么就用 <code>---</code> 隔开，<code>&lt;</code> 代表删除的行，<code>&gt;</code> 代表增加的行。修改后的行号即由第一部分的两组数字所示。</p><p>一个文件如果有多处发生了修改，就会有多份这样的两部分的 diff。</p><h2 id="context-diff" tabindex="-1"><a class="header-anchor" href="#context-diff"><span>Context Diff</span></a></h2><p>在 <em>UC Berkeley</em> 开发的 BSD 推出时，提出 diff 的显示过于简单，最好能显示修改位置的前后信息，即上下文，以便于理解发生的修改。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff -c f1 f2</span>
<span class="line">*** f1  2020-03-26 15:44:46.142999800 +0800</span>
<span class="line">--- f2  2020-03-26 15:44:51.056000000 +0800</span>
<span class="line">***************</span>
<span class="line">*** 27,34 ****</span>
<span class="line">              System.out.println(&quot;Hunk***************&quot;);</span>
<span class="line">              System.out.println(hunk.getFromFileRange().getLineStart());</span>
<span class="line">              System.out.println(hunk.getFromFileRange().getLineCount());</span>
<span class="line">              System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line">-             return;</span>
<span class="line"></span>
<span class="line">              System.out.println(hunk.getLines().size());</span>
<span class="line">          }</span>
<span class="line">--- 27,34 ----</span>
<span class="line">              System.out.println(&quot;Hunk***************&quot;);</span>
<span class="line">              System.out.println(hunk.getFromFileRange().getLineStart());</span>
<span class="line">              System.out.println(hunk.getFromFileRange().getLineCount());</span>
<span class="line">+             System.out.println(hunk.getToFileRange().getLineStart());</span>
<span class="line">              System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line"></span>
<span class="line">              System.out.println(hunk.getLines().size());</span>
<span class="line">          }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一部分表示发生变动的文件，及其修改时间。<code>***</code> 表示修改前的文件，<code>---</code> 表示修改后的文件。</p><p>第二部分和第三部分分别为 <strong>修改前文件版本中的变动</strong> 和 <strong>修改后文件版本的变动</strong>，每个部分内，包含了变动部分的行号，和变动的具体内容。每处变动开始于变动位置的前三行，结束于变动位置的后三行 (如例子所示，显示了第 27 行到第 34 行的信息，变动发生于第 31 行)。</p><h2 id="unified-diff" tabindex="-1"><a class="header-anchor" href="#unified-diff"><span>Unified Diff</span></a></h2><p>如果文件修改前后变动的部分不多，上述方式将会带来大量的重复显示。GNU diff 率先推出了合并格式的 diff，将 f1 和 f2 的上下文合并在一起显示，从而避免了冗余的显示信息：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff -u f1 f2</span>
<span class="line">--- f1  2020-03-26 15:44:46.142999800 +0800</span>
<span class="line">+++ f2  2020-03-26 15:44:51.056000000 +0800</span>
<span class="line">@@ -27,8 +27,8 @@</span>
<span class="line">             System.out.println(&quot;Hunk***************&quot;);</span>
<span class="line">             System.out.println(hunk.getFromFileRange().getLineStart());</span>
<span class="line">             System.out.println(hunk.getFromFileRange().getLineCount());</span>
<span class="line">+            System.out.println(hunk.getToFileRange().getLineStart());</span>
<span class="line">             System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line">-            return;</span>
<span class="line"></span>
<span class="line">             System.out.println(hunk.getLines().size());</span>
<span class="line">         }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一部分是变动前的文件和变动后的文件，及其修改时间。<code>---</code> 表示修改前文件，<code>+++</code> 表示修改后文件。</p><p>第二部分由 <code>@@ @@</code> 包裹起来的部分是变动的位置。<code>-</code> 开头的是修改前的文件，<code>+</code> 开头的是修改后的文件。数字的含义是，从第 27 行开始的 8 行。可以看到上下文显示的信息是最上面一处修改位置的前三行，和最后一处修改位置的后三行。</p><p>如果相邻两处修改的距离超过了六行 (即前一个修改位置的后三行，后一个修改位置的前三行)，那么改动将会被拆分为两个部分。试想，如果两处修改之间距离成百上千行，那么中间不变的部分就可以不显示了：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ diff -u f1 f2</span>
<span class="line">--- f1  2020-03-26 15:44:46.142999800 +0800</span>
<span class="line">+++ f2  2020-03-26 15:56:50.124400600 +0800</span>
<span class="line">@@ -22,7 +22,7 @@</span>
<span class="line">         System.out.println(diffFile.getFromFileName());</span>
<span class="line">         System.out.println(diffFile.getToFileName());</span>
<span class="line"></span>
<span class="line">-        List&lt;Hunk&gt; hunks = diffFile.getHunks();</span>
<span class="line">+        List&lt;Hunk&gt; hunks = diffFile.getHunks()</span>
<span class="line">         for (Hunk hunk : hunks) {</span>
<span class="line">             System.out.println(&quot;Hunk***************&quot;);</span>
<span class="line">             System.out.println(hunk.getFromFileRange().getLineStart());</span>
<span class="line">@@ -31,6 +31,7 @@</span>
<span class="line">             return;</span>
<span class="line"></span>
<span class="line">             System.out.println(hunk.getLines().size());</span>
<span class="line">+            return;</span>
<span class="line">         }</span>
<span class="line"></span>
<span class="line">     }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="git-diff" tabindex="-1"><a class="header-anchor" href="#git-diff"><span>Git Diff</span></a></h2><p>Git 使用的是 unified diff 的一种变体。比较对象不再是两个文件，而是同一个文件的两个版本：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git diff</span>
<span class="line">diff --git a/src/main/java/edu/nuaa/zjt/avatar/App.java b/src/main/java/edu/nuaa/zjt/avatar/App.java</span>
<span class="line">index f7b1066..0419171 100644</span>
<span class="line">--- a/src/main/java/edu/nuaa/zjt/avatar/App.java</span>
<span class="line">+++ b/src/main/java/edu/nuaa/zjt/avatar/App.java</span>
<span class="line">@@ -20,7 +20,7 @@ public final class App {</span>
<span class="line"></span>
<span class="line">         Diff diffFile = diffs.get(0);</span>
<span class="line">         System.out.println(diffFile.getFromFileName());</span>
<span class="line">-        System.out.println(diffFile.getToFileName());</span>
<span class="line">+        System.out.println(diffFile.getToFileName())</span>
<span class="line"></span>
<span class="line">         List&lt;Hunk&gt; hunks = diffFile.getHunks();</span>
<span class="line">         for (Hunk hunk : hunks) {</span>
<span class="line">@@ -29,6 +29,7 @@ public final class App {</span>
<span class="line">             System.out.println(hunk.getFromFileRange().getLineCount());</span>
<span class="line">             System.out.println(hunk.getToFileRange().getLineStart());</span>
<span class="line">             System.out.println(hunk.getToFileRange().getLineCount());</span>
<span class="line">+            return;</span>
<span class="line"></span>
<span class="line">             System.out.println(hunk.getLines().size());</span>
<span class="line">         }</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其中，第一部分依旧是修改前版本和修改后版本的文件名，<code>a/</code> 代表修改前版本，<code>b/</code> 代表修改后版本。</p><p>第二部分是两个文件版本的 Git hash 值，<code>100644</code> 表示对象的模式 (普通文件，权限 <code>644</code>)。</p><p>之后的部分就与 unified diff 的输出含义一致了。<code>---</code> 和 <code>+++</code> 分别代表修改前后的文件，之后是发生变动的位置，与发生变动的详情。</p>`,36)]))}const p=s(l,[["render",d],["__file","Git Diff.html.vue"]]),r=JSON.parse('{"path":"/notes/Git/Git%20Diff.html","title":"Git - Commit","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Normal Diff","slug":"normal-diff","link":"#normal-diff","children":[]},{"level":2,"title":"Context Diff","slug":"context-diff","link":"#context-diff","children":[]},{"level":2,"title":"Unified Diff","slug":"unified-diff","link":"#unified-diff","children":[]},{"level":2,"title":"Git Diff","slug":"git-diff","link":"#git-diff","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Diff.md"}');export{p as comp,r as data};
