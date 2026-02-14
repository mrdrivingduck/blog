import{_ as n,c as a,a as e,o as i}from"./app-BeHGwf2X.js";const l="/blog/assets/travis-settings-C9FEzM60.png",p="/blog/assets/travis-example-N5YAef56.png",c={};function d(t,s){return i(),a("div",null,s[0]||(s[0]=[e('<h1 id="devops-travis-ci" tabindex="-1"><a class="header-anchor" href="#devops-travis-ci"><span>DevOps - Travis CI</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 16 0:34</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="what-is-travis-ci" tabindex="-1"><a class="header-anchor" href="#what-is-travis-ci"><span>What is Travis CI?</span></a></h2><p>持续集成 (Continuous Integration) 是一种自动化的软件运维服务，在代码发生变更时，自动运行构建、测试、部署，并反馈结果。这样，每次提交代码都可以看到构建、测试和部署结果，避免了合并一大堆代码后的人工查错。</p><p><a href="https://www.travis-ci.org/" target="_blank" rel="noopener noreferrer">Travis CI</a> 是一个与 GitHub 集成的开源持续集成工具。只需要将一个 <code>.travis.yml</code> 配置文件放到 GitHub 仓库中，每次对这个仓库的 push 或 pull request 都会触发 Travis CI 的构建、测试、部署的工作。在 Travis CI 的官网上可以看到构建、测试、部署的结果。很多知名项目仓库中的 README 里都有 Travis CI 构建状态的图标 (build failed 或 build pass)，其实就是一个指向 Travis CI 官网中该仓库构建状态的图标。</p><p>Travis CI 每次被触发时，都会根据 <code>.travis.yml</code> 中指明的配置，创建一个运行环境，然后运行 <code>.travis.yml</code> 中写好的脚本进行构建、测试。最后，还可以运行脚本进行自动部署、自动代码合并等。</p><h2 id="example-github-pages" tabindex="-1"><a class="header-anchor" href="#example-github-pages"><span>Example: GitHub Pages</span></a></h2><p>这是一个很实际的例子。用 Vue.js 实现了一个博客网站。一个 Vue.js 工程需要在 Node.js 环境中运行 <code>npm install</code> 安装依赖，然后运行 <code>npm run build</code> 在工程目录的 <code>dist/</code> 下生成网站的静态资源。</p><p>想要在 GitHub Pages 上托管这个博客，需要每次自行运行 <code>npm run build</code> 后，将 <code>dist/</code> 目录下的静态资源 push 到 <code>gh-pages</code> 分支上。Travis 能够对这个过程完全自动化。带来的效果就是：</p><ul><li>每次改好 Vue.js 的代码并 push 到仓库里后，触发 Travis CI</li><li>Travis CI 自动创建一个 Node.js 的运行环境，通过 Git 从项目仓库 clone 代码</li><li>分别运行 <code>npm install</code> 和 <code>npm run build</code></li><li>自动将 <code>dist/</code> 目录下的所有资源 push 到 <code>gh-pages</code> 分支上</li></ul><p>首先，GitHub 的账号需要和 Travis CI 进行关联，这样 Travis CI 才能够访问 GitHub 账号下的所有仓库，并开启对用户指定的仓库进行监视。另外，由于部署操作需要对 GitHub 账号下的仓库进行 <code>git push</code> 操作，因此需要在 GitHub 中为 Travis CI 生成一个带有 <em>repo</em> 权限的 <em>Personal Access Token (PAT)</em>。这个 PAT 会被设置在 Travis CI 为这个 GitHub 仓库提供的环境变量中：</p><p><img src="'+l+`" alt="travis-settings"></p><p>仓库中的 <code>.travis.yml</code> 配置为如下形式：</p><div class="language-yaml line-numbers-mode" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre><code><span class="line"><span class="token key atrule">language</span><span class="token punctuation">:</span> node_js</span>
<span class="line"><span class="token key atrule">node_js</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token punctuation">-</span> <span class="token string">&quot;node&quot;</span></span>
<span class="line"></span>
<span class="line"><span class="token key atrule">cache</span><span class="token punctuation">:</span> npm</span>
<span class="line"></span>
<span class="line"><span class="token key atrule">script</span><span class="token punctuation">:</span> npm run build</span>
<span class="line"></span>
<span class="line"><span class="token key atrule">deploy</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token key atrule">provider</span><span class="token punctuation">:</span> pages</span>
<span class="line">  <span class="token key atrule">skip_cleanup</span><span class="token punctuation">:</span> <span class="token boolean important">true</span></span>
<span class="line">  <span class="token key atrule">token</span><span class="token punctuation">:</span> $GITHUB_TOKEN</span>
<span class="line">  <span class="token key atrule">keep_history</span><span class="token punctuation">:</span> <span class="token boolean important">true</span></span>
<span class="line">  <span class="token key atrule">target_branch</span><span class="token punctuation">:</span> gh<span class="token punctuation">-</span>pages</span>
<span class="line">  <span class="token key atrule">local_dir</span><span class="token punctuation">:</span> ./dist/</span>
<span class="line">  <span class="token key atrule">on</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">branch</span><span class="token punctuation">:</span> master</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当这个仓库的 Travis CI 被触发后，首先，根据配置文件，Travis CI 会创建一个 Node.js 的运行环境。然后运行 <code>script</code> 中的命令进行构建。最终，根据 <code>deploy</code> 中的选项完成部署：</p><ul><li><code>on branch master</code> - 在 <code>master</code> 分支变动时触发部署</li><li><code>local_dir</code> - 被部署的资源在项目根目录下的相对路径</li><li><code>target_branch</code> - 目标部署分支</li><li><code>keep_history</code> - 对部署分支进行增量式的 commit，而不是 force push</li><li><code>token</code> - 使 Travis CI 环境有权限向目标分支 push 的 GitHub PAT</li><li><code>skip_cleanup</code> - Travis CI 是否清理构建过程中产生的文件 (比如 <code>dist/</code>)，对于这个场景来说显然不能清理</li></ul><p>触发 Travis CI 后，进行了一次自动构建和自动部署。产生的日志如下：</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">Worker information</span>
<span class="line"></span>
<span class="line">Build system information</span>
<span class="line"></span>
<span class="line">$ git clone --depth=50 --branch=master</span>
<span class="line"></span>
<span class="line">$ nvm install node</span>
<span class="line"></span>
<span class="line">Setting up build cache</span>
<span class="line"></span>
<span class="line">$ npm ci</span>
<span class="line"></span>
<span class="line">$ npm run build</span>
<span class="line"></span>
<span class="line">The command &quot;npm run build&quot; exited with 0.</span>
<span class="line"></span>
<span class="line">store build cache</span>
<span class="line"></span>
<span class="line">$ rvm $(travis_internal_ruby) --fuzzy do ruby -S gem install dpl</span>
<span class="line"></span>
<span class="line">Installing deploy dependencies</span>
<span class="line">Logged in as @mrdrivingduck (Mr Dk.)</span>
<span class="line">Preparing deploy</span>
<span class="line">Deploying application</span>
<span class="line">cd /tmp/d20200615-7023-1ks2h9e/work</span>
<span class="line">Initialized empty Git repository in /tmp/d20200615-7023-1ks2h9e/work/.git/</span>
<span class="line">Switched to a new branch &#39;gh-pages&#39;</span>
<span class="line">cd -</span>
<span class="line">cd /tmp/d20200615-7023-1ks2h9e/work</span>
<span class="line">commit 0a6cf084bc66ca259f9fd76d465dec442b9ed5ce</span>
<span class="line">Author: Deployment Bot (from Travis CI) &lt;deploy@travis-ci.org&gt;</span>
<span class="line">Date:   Mon Jun 15 14:30:37 2020 +0000</span>
<span class="line">    Deploy mrdrivingduck/blogtravistest to github.com/mrdrivingduck/blogtravistest.git:gh-pages</span>
<span class="line"> LICENSE                         |  21 +++++++++++++++++++++</span>
<span class="line"> avatar.jpg                      | Bin 0 -&gt; 177873 bytes</span>
<span class="line"> black.jpg                       | Bin 0 -&gt; 9532 bytes</span>
<span class="line"> css/app.a5901a0a.css            |   1 +</span>
<span class="line"> css/chunk-0b2cb087.d8034c97.css |   1 +</span>
<span class="line"> css/chunk-25341c1c.de855032.css |   1 +</span>
<span class="line"> css/chunk-2ede58bc.107a4fa0.css |   1 +</span>
<span class="line"> css/chunk-4a4f0973.4909dcbd.css |   1 +</span>
<span class="line"> css/chunk-6084b0d6.2d581108.css |   1 +</span>
<span class="line"> css/chunk-620092d0.238f4f55.css |   1 +</span>
<span class="line"> ...</span>
<span class="line"> 83 files changed, 197 insertions(+)</span>
<span class="line">cd -</span>
<span class="line">Done. Your build exited with 0.</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行完成后，显示了表示成功状态的绿色：</p><p><img src="`+p+'" alt="travis-example"></p>',23)]))}const o=n(c,[["render",d],["__file","DevOps Travis CI.html.vue"]]),v=JSON.parse('{"path":"/notes/DevOps/DevOps%20Travis%20CI.html","title":"DevOps - Travis CI","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"What is Travis CI?","slug":"what-is-travis-ci","link":"#what-is-travis-ci","children":[]},{"level":2,"title":"Example: GitHub Pages","slug":"example-github-pages","link":"#example-github-pages","children":[]}],"git":{},"filePathRelative":"notes/DevOps/DevOps Travis CI.md"}');export{o as comp,v as data};
