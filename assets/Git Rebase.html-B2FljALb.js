import{a as e,_ as n}from"./git-merge-no-fast-forward-BXcIqlWy.js";import{_ as i,c as a,a as l,o as t}from"./app-Bd4F3609.js";const c="/blog/assets/git-rebase-branch-DgjknoKP.gif",m="/blog/assets/git-rebase-interactive-squash-BK7Bdkmd.gif",r="/blog/assets/git-rebase-interactive-drop-Dq7q_V1-.gif",d={};function p(o,s){return t(),a("div",null,s[0]||(s[0]=[l('<h1 id="git-rebase" tabindex="-1"><a class="header-anchor" href="#git-rebase"><span>Git - Rebase</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 10 / 17 0:15</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p><code>git rebase</code> 命令有着两种不同的效果：</p><ul><li>分支变基</li><li>重写分支历史</li></ul><p>可以说是 Git 中最魔法的命令了。</p><h2 id="rebase-for-a-branch" tabindex="-1"><a class="header-anchor" href="#rebase-for-a-branch"><span>Rebase for a Branch</span></a></h2><p>场景：一个子分支从主分支的某一次 commit 上分叉，子分支和主分支都分别有独立的 commit。</p><p><code>git merge</code> 的操作是将两个分支的最新一次 commit 和两个分支的公共祖先进行一次 <strong>三方合并</strong>，并生成一次新的 commit：</p><p><img src="'+e+'" alt="git-merge-no-fast-forward"></p><p><code>git rebase</code> 的做法：找到主分支和子分支的分叉 commit，将子分支基于这次 commit 的修改保存为临时文件。然后将分支的 base 指向主分支的最新一次 commit，并对这次 commit 应用之前保存的修改。结果如下：</p><p><img src="'+c+'" alt="git-rebase-branch"></p><p>之后从主分支 merge 子分支就是一次 fast forward 的合并了：</p><p><img src="'+n+`" alt="git-merge-fast-forward"></p><p>变基是有风险的。由于被 rebase 分支的祖先 commit 变了，那么该分支内的每一次 commit 的 SHA 都会发生改变。在多人协作时，可不能瞎 rebase。</p><blockquote><p>目前遇到的比较多的变基用途是，将自己的独立开发分支与被保护的主分支 rebase，以便对齐团队里所有人 merge 到主分支上的工作。</p></blockquote><h2 id="rewriting-history" tabindex="-1"><a class="header-anchor" href="#rewriting-history"><span>Rewriting History</span></a></h2><p>对于一个没有分叉的分支，也可以通过 <code>git rebase -i &lt;SHA&gt;</code> 命令 (<code>i</code> 表示 interactive，交互式) 来重写任意的 commit 历史。此时输入的参数不再是一个分支名了，而是想要从当前分支历史中开始改写历史的起始 commit 的前一次 commit (想象对链表中的某个节点开始操作则需要先找到它的前驱节点)。如果是希望从分支的第一次 commit 开始改写 (没有前驱节点)，则需要使用特殊的命令：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> rebase <span class="token parameter variable">-i</span> <span class="token parameter variable">--root</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>在交互式的 rebase 中，Git 会将从参数指定 commit 开始的每一次 commit 信息载入，并让用户选择如何处理每一次 commit。默认的处理是 <code>pick</code>，即保留这次 commit。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line"># Commands:</span>
<span class="line"># p, pick &lt;commit&gt; = use commit</span>
<span class="line"># r, reword &lt;commit&gt; = use commit, but edit the commit message</span>
<span class="line"># e, edit &lt;commit&gt; = use commit, but stop for amending</span>
<span class="line"># s, squash &lt;commit&gt; = use commit, but meld into previous commit</span>
<span class="line"># f, fixup &lt;commit&gt; = like &quot;squash&quot;, but discard this commit&#39;s log message</span>
<span class="line"># x, exec &lt;command&gt; = run command (the rest of the line) using shell</span>
<span class="line"># b, break = stop here (continue rebase later with &#39;git rebase --continue&#39;)</span>
<span class="line"># d, drop &lt;commit&gt; = remove commit</span>
<span class="line"># l, label &lt;label&gt; = label current HEAD with a name</span>
<span class="line"># t, reset &lt;label&gt; = reset HEAD to a label</span>
<span class="line"># m, merge [-C &lt;commit&gt; | -c &lt;commit&gt;] &lt;label&gt; [# &lt;oneline&gt;]</span>
<span class="line"># .       create a merge commit using the original merge commit&#39;s</span>
<span class="line"># .       message (or the oneline, if no original merge commit was</span>
<span class="line"># .       specified). Use -c &lt;commit&gt; to reword the commit message.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上为所有可选的命令：</p><ul><li>pick (p) 表示保留这次 commit</li><li>reword (r) 表示保留这次 commit，但是编辑 commit 信息</li><li>edit (e) 表示使用这次 commit，但重新修订它 (编辑 commit 信息 / 添加或移除 commit 的文件)，可被用于拆分提交</li><li>squash (s) 表示使用这次 commit，但是把这次 commit 合并到前一次 commit 中</li><li>fixup (f) 与 squash 类似，但是丢弃掉 commit log</li><li>exec (x) 在这次 commit 上执行 shell 命令</li><li>break (b) 表示停在这次 commit 上 (使用 <code>git rebase --continue</code> 继续)</li><li>drop (d) 表示移除这次 commit</li><li>label (l) 表示给当前 commit 打上标签</li><li>reset (t) 表示将当前 commit 恢复标签</li><li>merge (m) 表示创建一个 merge commit</li></ul><p>通过在交互式命令行中编辑每次 commit 之前的命令，就可以对每一次 commit 实现相应的动作。包括但不限于：</p><ul><li>合并几次 commit 为一次 <img src="`+m+'" alt="git-rebase-interactive-squash"></li><li>拆分一次 commit 为多次</li><li>删除某次 commit <img src="'+r+`" alt="git-rebase-interactive-drop"></li><li>编辑某次 commit 的 commit message</li><li>在每次 commit 上修改 commit 邮箱地址</li><li>...</li></ul><p>最近新学习到一条开发规范。从主分支拉出一条分支用于开发 feature 之后，在合入主分支之前，要把 feature 分支上的所有 commit 压缩为一个 commit，再合入。</p><p>为什么要这样干？查了查 <em>ZhiHu</em>，总结了一下：</p><ol><li>很多 commit 只是带有实验性质或暂存性质，并没有必要真正成为一次 commit</li><li>将逻辑上相似的多个 commit 压缩到一次 commit 里，可以给它一个描述性很强的 commit message</li><li>其它分支上的开发者并没有必要了解你的分支内的 <code>fix</code> / <code>fix again</code></li><li>好的 commit 应当能够简洁明了地反映一个项目是如何被开发出来的</li></ol><p>提问中还给出了 <a href="https://www.zhihu.com/question/61283395/answer/186725319" target="_blank" rel="noopener noreferrer">Vue.js 的 commit 历史</a> 作为范本。我认为值得学习。我觉得自己以前有着太多的无效 commit 了，特别是有几个反复的 fix。现在想来幸亏是自己一个人的项目，不然让别人看也是够无语的。</p><p>合并多次 commit 的直接做法就是 <code>git rebase</code> 命令：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> rebase <span class="token parameter variable">-i</span> <span class="token operator">&lt;</span>commit_id<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>这里的 commit id 为要合并的几个 commit 的再前一个 commit。相当于要对链表中的三个节点进行合并，你必须找到这三个节点的前一个节点。不然如何将合并后的新节点链回去呢？</p><p>例子：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git log</span>
<span class="line">commit c44d371b4e8fe65ed515b1fe3986b7a5b7eb0a83 (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:52 2021 +0800</span>
<span class="line"></span>
<span class="line">    Commit 4</span>
<span class="line"></span>
<span class="line">commit 488e75ec020761a176688ed071c2049f3ebf6073</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:40 2021 +0800</span>
<span class="line"></span>
<span class="line">    Commit 3</span>
<span class="line"></span>
<span class="line">commit ffe162164d4bdeaf1da285852f90860c3c0dc2a2</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:23 2021 +0800</span>
<span class="line"></span>
<span class="line">    Commit 2</span>
<span class="line"></span>
<span class="line">commit 298e31375c1acab77eccfea320c7646cd2dbddea</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:06 2021 +0800</span>
<span class="line"></span>
<span class="line">    Commit 1</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在想把最新的三个 commit (2、3、4) 合并。那么首先需要这三个 commit 的之前一次 commit (Commit 1) 的 commit hash。</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> rebase <span class="token parameter variable">-i</span> 298e31375c1acab77eccfea320c7646cd2dbddea</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>这时，会出来一个文件编辑界面：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">pick ffe1621 Commit 2</span>
<span class="line">pick 488e75e Commit 3</span>
<span class="line">pick c44d371 Commit 4</span>
<span class="line"></span>
<span class="line"># Rebase 298e313..c44d371 onto 298e313 (3 commands)</span>
<span class="line">#</span>
<span class="line"># Commands:</span>
<span class="line"># p, pick &lt;commit&gt; = use commit</span>
<span class="line"># r, reword &lt;commit&gt; = use commit, but edit the commit message</span>
<span class="line"># e, edit &lt;commit&gt; = use commit, but stop for amending</span>
<span class="line"># s, squash &lt;commit&gt; = use commit, but meld into previous commit</span>
<span class="line"># f, fixup &lt;commit&gt; = like &quot;squash&quot;, but discard this commit&#39;s log message</span>
<span class="line"># x, exec &lt;command&gt; = run command (the rest of the line) using shell</span>
<span class="line"># b, break = stop here (continue rebase later with &#39;git rebase --continue&#39;)</span>
<span class="line"># d, drop &lt;commit&gt; = remove commit</span>
<span class="line"># l, label &lt;label&gt; = label current HEAD with a name</span>
<span class="line"># t, reset &lt;label&gt; = reset HEAD to a label</span>
<span class="line"># m, merge [-C &lt;commit&gt; | -c &lt;commit&gt;] &lt;label&gt; [# &lt;oneline&gt;]</span>
<span class="line"># .       create a merge commit using the original merge commit&#39;s</span>
<span class="line"># .       message (or the oneline, if no original merge commit was</span>
<span class="line"># .       specified). Use -c &lt;commit&gt; to reword the commit message.</span>
<span class="line">#</span>
<span class="line"># These lines can be re-ordered; they are executed from top to bottom.</span>
<span class="line">#</span>
<span class="line"># If you remove a line here THAT COMMIT WILL BE LOST.</span>
<span class="line">#</span>
<span class="line"># However, if you remove everything, the rebase will be aborted.</span>
<span class="line">#</span>
<span class="line"># Note that empty commits are commented out</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最开头列出了将要操作的 commit，以及操作命令。带 <code>#</code> 的是注释，里面详细解释了操作命令。对于合并，我们应该 <strong>pick</strong> 最老的一次 commit，然后将后面的两次 commit <strong>squash</strong> 到前面的 commit 中。因此，编辑这个文件，将后两个 <code>pick</code> 改为 <code>squash</code> 或 <code>s</code>，保存。</p><p>保存后，将会进入下一个文件编辑界面：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line"># This is a combination of 3 commits.</span>
<span class="line"># This is the 1st commit message:</span>
<span class="line"></span>
<span class="line">Commit 2</span>
<span class="line"></span>
<span class="line"># This is the commit message #2:</span>
<span class="line"></span>
<span class="line">Commit 3</span>
<span class="line"></span>
<span class="line"># This is the commit message #3:</span>
<span class="line"></span>
<span class="line">Commit 4</span>
<span class="line"></span>
<span class="line"># Please enter the commit message for your changes. Lines starting</span>
<span class="line"># with &#39;#&#39; will be ignored, and an empty message aborts the commit.</span>
<span class="line">#</span>
<span class="line"># Date:      Sat May 29 10:44:23 2021 +0800</span>
<span class="line">#</span>
<span class="line"># interactive rebase in progress; onto 298e313</span>
<span class="line"># Last commands done (3 commands done):</span>
<span class="line">#    s 488e75e Commit 3</span>
<span class="line">#    s c44d371 Commit 4</span>
<span class="line"># No commands remaining.</span>
<span class="line"># You are currently rebasing branch &#39;master&#39; on &#39;298e313&#39;.</span>
<span class="line">#</span>
<span class="line"># Changes to be committed:</span>
<span class="line">#       modified:   a.txt</span>
<span class="line">#</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除去注释外，这里实际上包含了三次 commit 的 commit message。编辑这个文件，删掉原有的 commit message，为合并后的 commit 指定一条 commit message，保存：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line"># This is a combination of 3 commits.</span>
<span class="line">Merged commit!</span>
<span class="line"></span>
<span class="line"># Please enter the commit message for your changes. Lines starting</span>
<span class="line"># with &#39;#&#39; will be ignored, and an empty message aborts the commit.</span>
<span class="line">#</span>
<span class="line"># Date:      Sat May 29 10:44:23 2021 +0800</span>
<span class="line">#</span>
<span class="line"># interactive rebase in progress; onto 298e313</span>
<span class="line"># Last commands done (3 commands done):</span>
<span class="line">#    s 488e75e Commit 3</span>
<span class="line">#    s c44d371 Commit 4</span>
<span class="line"># No commands remaining.</span>
<span class="line"># You are currently rebasing branch &#39;master&#39; on &#39;298e313&#39;.</span>
<span class="line">#</span>
<span class="line"># Changes to be committed:</span>
<span class="line">#       modified:   a.txt</span>
<span class="line">#</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后，rebase 操作就成功了：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git rebase -i 298e31375c1acab77eccfea320c7646cd2dbddea</span>
<span class="line">[detached HEAD 2a81aad] Merged commit!</span>
<span class="line"> Date: Sat May 29 10:44:23 2021 +0800</span>
<span class="line"> 1 file changed, 2 insertions(+)</span>
<span class="line">Successfully rebased and updated refs/heads/master.</span>
<span class="line"></span>
<span class="line">$ git log</span>
<span class="line">commit 2a81aadb7c1168e8c34af735b1686c617e7d5be3 (HEAD -&gt; master)</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:23 2021 +0800</span>
<span class="line"></span>
<span class="line">    Merged commit!</span>
<span class="line"></span>
<span class="line">commit 298e31375c1acab77eccfea320c7646cd2dbddea</span>
<span class="line">Author: mrdrivingduck &lt;xxxxxxxxx@qq.com&gt;</span>
<span class="line">Date:   Sat May 29 10:44:06 2021 +0800</span>
<span class="line"></span>
<span class="line">    Commit 1</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%8F%98%E5%9F%BA" target="_blank" rel="noopener noreferrer">3.6 Git 分支 - 变基</a></p><p><a href="https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E9%87%8D%E5%86%99%E5%8E%86%E5%8F%B2" target="_blank" rel="noopener noreferrer">7.6 Git 工具 - 重写历史</a></p><p><a href="https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1" target="_blank" rel="noopener noreferrer">Lydia Hallie - 🌳🚀 CS Visualized: Useful Git Commands</a></p><p><a href="https://yonghaowu.github.io/2017/06/18/TheGitYouShouldKnow/" target="_blank" rel="noopener noreferrer">工作中必备 git 技能详解</a></p>`,53)]))}const u=i(d,[["render",p],["__file","Git Rebase.html.vue"]]),g=JSON.parse('{"path":"/notes/Git/Git%20Rebase.html","title":"Git - Rebase","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Rebase for a Branch","slug":"rebase-for-a-branch","link":"#rebase-for-a-branch","children":[]},{"level":2,"title":"Rewriting History","slug":"rewriting-history","link":"#rewriting-history","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Rebase.md"}');export{u as comp,g as data};
