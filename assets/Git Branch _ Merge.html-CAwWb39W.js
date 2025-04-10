import{_ as s,a as n}from"./git-merge-no-fast-forward-BXcIqlWy.js";import{_ as i,c as a,a as t,o as l}from"./app-CT9FvwxE.js";const c="/blog/assets/git-work-tree-AHUfU6wV.png",r="/blog/assets/git-head-Dk7rUZDp.png",d="/blog/assets/git-branch-D5VqmMJI.png",o="/blog/assets/git-checkout-jJzs7gXK.png",p="/blog/assets/git-branch-commit-DG5uUn0H.png",g="/blog/assets/git-iss53-Dduyw61u.png",m="/blog/assets/git-branch-hotfix-kOpZ7UIj.png",u="/blog/assets/git-fast-forward-DSf7_-yp.png",h="/blog/assets/git-branch-go-on-DZ2iO4Tq.png",v="/blog/assets/git-before-merge-ME8k0lPA.png",b="/blog/assets/git-after-merge-Cu3WfBbv.png",f="/blog/assets/git-merge-conflict-BdPVkc7I.gif",_={};function x(k,e){return l(),a("div",null,e[0]||(e[0]=[t('<h1 id="git-branch-merge" tabindex="-1"><a class="header-anchor" href="#git-branch-merge"><span>Git - Branch &amp; Merge</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 04 / 19 17:49</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p>Git 这个东西想法很独特。每一次提交，会产生指向上一个提交对象的指针，每个 <strong>提交对象</strong> 指向版本快照，版本快照记录本次提交的一些元数据，产生了哪些变化等等：</p><p><img src="'+c+'" alt="git-work-tree"></p><p>默认会有一个 <code>master</code> 分支指针指向 <strong>提交对象</strong>，会有一个 <code>HEAD</code> 指针指向当前操作的分支：</p><p><img src="'+r+`" alt="git-head"></p><h2 id="branch" tabindex="-1"><a class="header-anchor" href="#branch"><span>Branch</span></a></h2><p>创建一个新的分支：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git branch &lt;branch_name&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>实际上创建了一个新的分支指针，指向当前提交对象：</p><p><img src="`+d+`" alt="git-branch"></p><p>在分支之间切换，实际上是将 <code>HEAD</code> 指针指向了对应的分支指针：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git checkout &lt;branch_name&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+o+'" alt="git-checkout"></p><p>之后可以在对应分支上进行 <code>commit</code>，分支指针就会向前移动：</p><p><img src="'+p+'" alt="git-branch-commit"></p><h2 id="merge" tabindex="-1"><a class="header-anchor" href="#merge"><span>Merge</span></a></h2><p>Git 的官方网站给出了一个便于理解的实际应用场景：</p><p>项目的生产环境服务器上使用的是 <code>master</code> 分支的版本。突然，有人提出 <code>#53 issue</code> 中的功能需要被实现。因此，从 <code>master</code> 分支上派生出 <code>iss53</code> 分支用于开发，并将更新 commit 到 <code>iss53</code> 分支上</p><p><img src="'+g+'" alt="git-iss53"></p><p>此时，突然有人报告，生产环境中的另一个地方出现 BUG 需要被立刻修复，但是 <code>iss53</code> 中的需求还没有被实现完。此时，只需要切换回 <code>master</code> 分支，Git 将状态恢复到 <code>C2</code>，从 <code>C2</code> 状态派生出一个新的紧急修补分支 <code>hotfix</code>，并进行 BUG 修复：</p><p><img src="'+m+`" alt="git-branch-hotfix"></p><p>此时，<code>hotfix</code> 分支上的 commit 已经修复了 BUG。因此，需要将生产服务器上的版本更新为修复 BUG 后 - 即需要合并 <code>master</code> 和 <code>hotfix</code> 分支。由于从 <code>master</code> 分支的 <code>C2</code> 状态可以无需回退而直接到达 <code>C4</code> 状态，因此这种合并方式称为 <strong>Fast Forward</strong>，即只需要将 <code>master</code> 分支指针右移：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git merge hotfix</span>
<span class="line">Updating f42c576..3a0874c</span>
<span class="line">Fast-forward</span>
<span class="line"> index.html | 2 ++</span>
<span class="line"> 1 file changed, 2 insertions(+)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+u+'" alt="git-fast-forward"></p><p><img src="'+s+'" alt="git-merge-fast-forward"></p><p><code>hotfix</code> 分支指针已经完成了使命，可以被删除了。目前生产环境服务器使用的是 <code>C4</code> 状态的版本，然后就可以重新转到 <code>iss53</code> 分支上，继续新功能的开发：</p><p><img src="'+h+'" alt="git-branch-go-on"></p><p>当新功能开发完成后，<code>iss53</code> 需要和 <code>master</code> 合并时，问题出现了：并不能使用 fast-forward 的合并方式。Git 会找到它们的共同祖先，进行三方合并 (两个分支 + 一个共同祖先) 计算：</p><p><img src="'+v+`" alt="git-before-merge"></p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git merge iss53</span>
<span class="line">Merge made by the &#39;recursive&#39; strategy.</span>
<span class="line">index.html |    1 +</span>
<span class="line">1 file changed, 1 insertion(+)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Git 会将合并后的结果生成为一个新的状态。此时 <code>iss53</code> 的使命也完成了，可以被删除：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git branch -d &lt;branch_name&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><img src="`+b+'" alt="git-after-merge"></p><p><img src="'+n+`" alt="git-merge-no-fast-forward"></p><h2 id="conflict" tabindex="-1"><a class="header-anchor" href="#conflict"><span>Conflict</span></a></h2><p>合并操作并不一定像上述过程一样顺利。如果两个分支都修改了同一个文件，那么 Git 对 <code>C6</code> 状态的生成一定会是矛盾的：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git merge iss53</span>
<span class="line">Auto-merging index.html</span>
<span class="line">CONFLICT (content): Merge conflict in index.html</span>
<span class="line">Automatic merge failed; fix conflicts and then commit the result.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">You have unmerged paths.</span>
<span class="line">  (fix conflicts and run &quot;git commit&quot;)</span>
<span class="line"></span>
<span class="line">Unmerged paths:</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to mark resolution)</span>
<span class="line"></span>
<span class="line">    both modified:      index.html</span>
<span class="line"></span>
<span class="line">no changes added to commit (use &quot;git add&quot; and/or &quot;git commit -a&quot;)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>到底该使用 <code>C4</code> 版本的状态还是 <code>C5</code> 版本的状态呢？此时需要人为裁决：</p><ul><li>二选一</li><li>手动整合两个冲突</li></ul><p>显示 <strong>both modified</strong> 的文件就是发生冲突的文件。Git 会自动在文件中将冲突位置标识，vim 我是真的懒得用，用 Visual Studio Code 打开文件就会有显示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD:index.html</span>
<span class="line">&lt;div id=&quot;footer&quot;&gt;contact : email.support@github.com&lt;/div&gt;</span>
<span class="line">=======</span>
<span class="line">&lt;div id=&quot;footer&quot;&gt;</span>
<span class="line"> please contact us at support@github.com</span>
<span class="line">&lt;/div&gt;</span>
<span class="line">&gt;&gt;&gt;&gt;&gt;&gt;&gt; iss53:index.html</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> 指示的是 <code>HEAD</code> 版本</li><li><code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> 指示的是 <code>iss53</code> 版本</li><li><code>=======</code> 指示的是分割线，区分两个版本</li></ul><p>在 Visual Studio Code 中可以直接点击按钮二选一，或同时合并；也可以人为进行编辑：</p><ul><li>先编辑成想要合并后的样子</li><li>然后将 <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>、<code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>、<code>=======</code> 全部删掉（不然会有语法错误 🤨）</li></ul><p>修改完成后，保存。然后通过 <code>git add</code> 将该文件送入 stage：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> <span class="token function">add</span> index.html</span>
<span class="line"><span class="token function">git</span> merge <span class="token parameter variable">--continue</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+f+'" alt="git-merge-conflict"></p><p>尽可能不要修改同一个文件才是正解叭。</p><hr><h2 id="reference" tabindex="-1"><a class="header-anchor" href="#reference"><span>Reference</span></a></h2><p><a href="https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%AE%80%E4%BB%8B" target="_blank" rel="noopener noreferrer">Git 分支 - 分支简介</a></p><p><a href="https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E6%96%B0%E5%BB%BA%E4%B8%8E%E5%90%88%E5%B9%B6" target="_blank" rel="noopener noreferrer">Git 分支 - 分支的新建与合并</a></p><p><a href="https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1" target="_blank" rel="noopener noreferrer">Lydia Hallie - 🌳🚀 CS Visualized: Useful Git Commands</a></p>',59)]))}const E=i(_,[["render",x],["__file","Git Branch _ Merge.html.vue"]]),C=JSON.parse('{"path":"/notes/Git/Git%20Branch%20_%20Merge.html","title":"Git - Branch & Merge","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Branch","slug":"branch","link":"#branch","children":[]},{"level":2,"title":"Merge","slug":"merge","link":"#merge","children":[]},{"level":2,"title":"Conflict","slug":"conflict","link":"#conflict","children":[]},{"level":2,"title":"Reference","slug":"reference","link":"#reference","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Branch & Merge.md"}');export{E as comp,C as data};
