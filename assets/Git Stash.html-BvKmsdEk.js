import{_ as n,c as e,a,o as i}from"./app-BeHGwf2X.js";const l={};function t(d,s){return i(),e("div",null,s[0]||(s[0]=[a(`<h1 id="git-stash" tabindex="-1"><a class="header-anchor" href="#git-stash"><span>Git - Stash</span></a></h1><p>Created by : Mr Dk.</p><p>2021 / 12 / 05 21:38</p><p>Nanjing, Jiangsu, China</p><hr><p>这是一篇拖了很久的更新。Stash 是一个很实用但经常被我忽视的知识点，但之前不知道有这么一个功能，实际上该功能也可以用其它命令组合实现。但是存在即合理，stash 命令既然存在就有它的意义。</p><p>Git 中对文件的修改记录包含三个层面。由于并不熟悉 Git 的内部实现，所以就从用户的视角来总结：</p><ul><li>工作目录：真实文件系统中的文件版本</li><li>暂存区：已被 Git 纳入追踪，但尚未成为一个正式版本</li><li>版本库：通过 commit 进入 Git 的版本控制记录中，成为一个正式版本</li></ul><p>在特性开发时，绝大部分时间都会在前两步中。而当我们想在版本库的正式版本之间切换时（同一个分支的前进或回退，不同分支版本的切换），Git 不允许工作目录或暂存区中有已被追踪的中间状态文件（已修改，未提交），否则将会在版本切换时引入冲突。所以看起来只有两种做法：</p><ul><li>将对已追踪文件的修改丢弃（老子辛辛苦苦改半天呢，怎么能丢掉呢？）</li><li>将已追踪的文件修改做一次 commit，成为一个正式版本（目前已暂存的文件修改并不构成一个版本）</li></ul><blockquote><p>未被 Git 追踪的文件（比如新增文件）不会被 stash 命令影响，因为版本进退不会使该文件发生冲突。</p></blockquote><p>这里就体现了 stash 命令的作用：将当前工作目录中的本地修改记录下来，并将工作目录恢复到 HEAD 指针指向版本的干净状态。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">Changes not staged for commit:</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to update what will be committed)</span>
<span class="line">  (use &quot;git restore &lt;file&gt;...&quot; to discard changes in working directory)</span>
<span class="line">        modified:   a.txt</span>
<span class="line"></span>
<span class="line">Untracked files:</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to include in what will be committed)</span>
<span class="line">        b.txt</span>
<span class="line"></span>
<span class="line">no changes added to commit (use &quot;git add&quot; and/or &quot;git commit -a&quot;)</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用 <code>git stash save &quot;xxx&quot;</code> 对这次 stash 添加注释并保存；如果没有 <code>save &quot;xxx&quot;</code>，则将会自动生成注释：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git stash</span>
<span class="line">Saved working directory and index state WIP on master: fe2f029 Initial commit</span>
<span class="line"></span>
<span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">Untracked files:</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to include in what will be committed)</span>
<span class="line">        b.txt</span>
<span class="line"></span>
<span class="line">nothing added to commit but untracked files present (use &quot;git add&quot; to track)</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，由于 <code>b.txt</code> 还没有被 Git 追踪，所以 stash 对其不起作用。将其纳入 Git 的管理之下即可起作用：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git add .</span>
<span class="line"></span>
<span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">Changes to be committed:</span>
<span class="line">  (use &quot;git restore --staged &lt;file&gt;...&quot; to unstage)</span>
<span class="line">        new file:   b.txt</span>
<span class="line"></span>
<span class="line">$ git stash save &quot;save b&quot;</span>
<span class="line">Saved working directory and index state On master: save b</span>
<span class="line"></span>
<span class="line">$ git status</span>
<span class="line">On branch master</span>
<span class="line">nothing to commit, working tree clean</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在工作目录已经是干净的了，HEAD 指针可以随意移动以切换版本。通过以下命令可以查看 stash 记录：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git stash list</span>
<span class="line">stash@{0}: On master: save b</span>
<span class="line">stash@{1}: WIP on master: fe2f029 Initial commit</span>
<span class="line"></span>
<span class="line">$ git stash show stash@{1}</span>
<span class="line"> a.txt | 2 +-</span>
<span class="line"> 1 file changed, 1 insertion(+), 1 deletion(-)</span>
<span class="line"></span>
<span class="line">$ git stash show stash@{0}</span>
<span class="line"> b.txt | 1 +</span>
<span class="line"> 1 file changed, 1 insertion(+)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>切换版本后把 stash 中的记录恢复到工作目录时，Git 会以栈序（后保存先恢复）依次恢复文件状态。<code>stash pop</code> 将会依次恢复文件状态，并从 stash 记录中移除条目；<code>stash apply</code> 将会依次恢复文件状态，但不从 stash 记录中移除条目。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git stash pop</span>
<span class="line">On branch master</span>
<span class="line">Changes to be committed:</span>
<span class="line">  (use &quot;git restore --staged &lt;file&gt;...&quot; to unstage)</span>
<span class="line">        new file:   b.txt</span>
<span class="line"></span>
<span class="line">Dropped refs/stash@{0} (555468a845a50c6030cf12cb64e4897ca61d21bb)</span>
<span class="line"></span>
<span class="line">$ git stash pop</span>
<span class="line">On branch master</span>
<span class="line">Changes to be committed:</span>
<span class="line">  (use &quot;git restore --staged &lt;file&gt;...&quot; to unstage)</span>
<span class="line">        new file:   b.txt</span>
<span class="line"></span>
<span class="line">Changes not staged for commit:</span>
<span class="line">  (use &quot;git add &lt;file&gt;...&quot; to update what will be committed)</span>
<span class="line">  (use &quot;git restore &lt;file&gt;...&quot; to discard changes in working directory)</span>
<span class="line">        modified:   a.txt</span>
<span class="line"></span>
<span class="line">Dropped refs/stash@{0} (5ba8b1cf02959f7b9929fced318186faab2615fc)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外，丢弃某次或全部 stash 记录：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ git stash drop stash@{0}</span>
<span class="line">Dropped stash@{0} (8df2f8dc92fafff3559341c9b6127c1e7462164d)</span>
<span class="line"></span>
<span class="line">$ git stash clear</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://www.cnblogs.com/zndxall/archive/2018/09/04/9586088.html" target="_blank" rel="noopener noreferrer">博客园 - git stash 用法总结和注意点</a></p><p><a href="https://git-scm.com/docs/git-stash" target="_blank" rel="noopener noreferrer">Git Docs: git-stash</a></p>`,26)]))}const r=n(l,[["render",t],["__file","Git Stash.html.vue"]]),p=JSON.parse('{"path":"/notes/Git/Git%20Stash.html","title":"Git - Stash","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Git/Git Stash.md"}');export{r as comp,p as data};
