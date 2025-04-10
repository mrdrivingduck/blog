import{_ as s,c as n,a,o as i}from"./app-CT9FvwxE.js";const l="/blog/assets/git-cherry-pick-D03Z8MIc.gif",t={};function r(c,e){return i(),n("div",null,e[0]||(e[0]=[a('<h1 id="git-cherry-pick" tabindex="-1"><a class="header-anchor" href="#git-cherry-pick"><span>Git - Cherry Pick</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 05 / 21 17:36</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p>这条命令用于把一个分支中的 <strong>某几次</strong> commit 挑选出来，接到另一个分支的 commit 链表上。如果要将分支中的所有 commit 转移到另一个分支上，那么等效于 <code>git merge</code>。</p><p>示意动画 (来源于 <a href="https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1" target="_blank" rel="noopener noreferrer">Lydia Hallie, CS Visualized: Useful Git Commands</a>)：</p><p><img src="'+l+`" alt="git-cherry-pick"></p><h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h2><h3 id="commit-hash" tabindex="-1"><a class="header-anchor" href="#commit-hash"><span>Commit Hash</span></a></h3><p>基本用法很简单：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token operator">&lt;</span>commit_hash<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>如下图所示。如果想要把 <code>Feature</code> 分支上的 <code>f</code> commit 单独挑出来，应用到 <code>Master</code> 分支上，那么只需要获得 <code>Feature</code> 分支上 <code>f</code> 的 commit hash，然后输入上述命令即可。产生的效果如图所示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">a - b - c - d        Master</span>
<span class="line">         \\</span>
<span class="line">          e - f - g  Feature</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">a - b - c - d - f    Master</span>
<span class="line">         \\</span>
<span class="line">          e - f - g  Feature</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>转移后，commit 的 diff 不变，但是 commit hash 将会发生改变。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git checkout feature_new</span>
<span class="line">Switched to branch &#39;feature_new&#39;</span>
<span class="line">Your branch is up to date with &#39;origin/feature_new&#39;.</span>
<span class="line"></span>
<span class="line">$ git log</span>
<span class="line">commit e4d682751dcc729c7d3501bf18ccd2a832b19d7b (HEAD -&gt; feature_new, origin/feature_new)</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Fri May 21 11:40:01 2021 +0800</span>
<span class="line"></span>
<span class="line">    New feature</span>
<span class="line"></span>
<span class="line">$ git checkout main</span>
<span class="line">Switched to branch &#39;main&#39;</span>
<span class="line"></span>
<span class="line">$ git cherry-pick e4d682751dcc729c7d3501bf18ccd2a832b19d7b</span>
<span class="line">Auto-merging a.c</span>
<span class="line">[main a63e606] New feature</span>
<span class="line"> Date: Fri May 21 11:40:01 2021 +0800</span>
<span class="line"> 1 file changed, 1 insertion(+), 1 deletion(-)</span>
<span class="line"></span>
<span class="line">$ git log</span>
<span class="line">commit a63e6063ee07cea80b98b2cf9843505423f7386d (HEAD -&gt; main)</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Fri May 21 11:40:01 2021 +0800</span>
<span class="line"></span>
<span class="line">    New feature</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="branch-name" tabindex="-1"><a class="header-anchor" href="#branch-name"><span>Branch Name</span></a></h3><p>当然，也可以直接使用 <strong>分支名</strong>。此时命令的含义是，转移这个分支的最新一次 commit 到当前分支：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token operator">&lt;</span>branch_name<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="multiple-commit" tabindex="-1"><a class="header-anchor" href="#multiple-commit"><span>Multiple Commit</span></a></h3><p>这条命令支持转移多个独立的提交：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token operator">&lt;</span>hash_A<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>hash_B<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>如果想要转移几个连续的提交，那么可以这样 (其中 commit A 不包含)：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token operator">&lt;</span>hash_A<span class="token operator">&gt;</span><span class="token punctuation">..</span><span class="token operator">&lt;</span>hash_B<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>如果想要连同 commit A 包含在一起：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token operator">&lt;</span>hash_A<span class="token operator">&gt;</span>^<span class="token punctuation">..</span><span class="token operator">&lt;</span>hash_B<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="conflict" tabindex="-1"><a class="header-anchor" href="#conflict"><span>Conflict</span></a></h2><p>如果从其它分支上转移过来的 commit 与本分支之前的 commit 产生了冲突导致合并无法继续进行怎么办？Cherry-pick 会停下来让用户选择怎么办</p><h3 id="continue" tabindex="-1"><a class="header-anchor" href="#continue"><span>Continue</span></a></h3><p>用户手动解决冲突后，继续进行：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span></span>
<span class="line"><span class="token function">git</span> cherry-pick <span class="token parameter variable">--continue</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="abort" tabindex="-1"><a class="header-anchor" href="#abort"><span>Abort</span></a></h3><p>放弃合并，回滚到合并前的样子：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token parameter variable">--abort</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="quit" tabindex="-1"><a class="header-anchor" href="#quit"><span>Quit</span></a></h3><p>保留冲突，不继续合并，也不回滚：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> cherry-pick <span class="token parameter variable">--quit</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="between-different-repositories" tabindex="-1"><a class="header-anchor" href="#between-different-repositories"><span>Between Different Repositories</span></a></h2><p>也可以在不同代码库之间的分支上进行转移。首先将另一个库作为远程仓库添加到本地仓库，然后将远程仓库的代码拉到本地。通过 <code>git log</code> 查看 commit hash 后，用类似的方法转移 commit。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> <span class="token function">add</span> remote <span class="token punctuation">..</span>.</span>
<span class="line"><span class="token function">git</span> fetch</span>
<span class="line"><span class="token function">git</span> cherry-pick <span class="token punctuation">..</span>.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="http://www.ruanyifeng.com/blog/2020/04/git-cherry-pick.html" target="_blank" rel="noopener noreferrer">阮一峰的网络日志 - git cherry-pick 教程</a></p><p><a href="https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1" target="_blank" rel="noopener noreferrer">Lydia Hallie - 🌳🚀 CS Visualized: Useful Git Commands</a></p>`,45)]))}const d=s(t,[["render",r],["__file","Git Cherry Pick.html.vue"]]),o=JSON.parse('{"path":"/notes/Git/Git%20Cherry%20Pick.html","title":"Git - Cherry Pick","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Usage","slug":"usage","link":"#usage","children":[{"level":3,"title":"Commit Hash","slug":"commit-hash","link":"#commit-hash","children":[]},{"level":3,"title":"Branch Name","slug":"branch-name","link":"#branch-name","children":[]},{"level":3,"title":"Multiple Commit","slug":"multiple-commit","link":"#multiple-commit","children":[]}]},{"level":2,"title":"Conflict","slug":"conflict","link":"#conflict","children":[{"level":3,"title":"Continue","slug":"continue","link":"#continue","children":[]},{"level":3,"title":"Abort","slug":"abort","link":"#abort","children":[]},{"level":3,"title":"Quit","slug":"quit","link":"#quit","children":[]}]},{"level":2,"title":"Between Different Repositories","slug":"between-different-repositories","link":"#between-different-repositories","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Cherry Pick.md"}');export{d as comp,o as data};
