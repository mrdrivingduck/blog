import{_ as o,c as t,a,o as l}from"./app-aVGbliEg.js";const r="/blog/assets/bloom-filter-DAsBvd4i.png",i="/blog/assets/bloom-filter-parameter-tYRBgdgF.png",n={};function p(s,e){return l(),t("div",null,e[0]||(e[0]=[a('<h1 id="algorithm-bloom-filter" tabindex="-1"><a class="header-anchor" href="#algorithm-bloom-filter"><span>Algorithm - Bloom Filter</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 12 / 08 22:43</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="about" tabindex="-1"><a class="header-anchor" href="#about"><span>About</span></a></h2><p><strong>布隆过滤器</strong> 是一个空间利用率较高的概率性数据结构，由 <a href="https://en.wikipedia.org/w/index.php?title=Burton_Howard_Bloom&amp;action=edit&amp;redlink=1" target="_blank" rel="noopener noreferrer"><em>Burton Howard Bloom</em></a> 在 1970 年提出，其主要用途是，<strong>判断一个元素是否属于一个集合</strong>。</p><p>这是一个概率性数据结构是因为，返回的结果中可能存在 false positive，但不可能存在 false negative：即，返回的结果只可能是 <strong>可能在集合中</strong> 和 <strong>肯定不在集合中</strong>。也就是说，如果没有得到 <em>肯定不在集合中</em> 的答案，并不代表集合中一定有这个元素。其空间利用率高是因为，使用了 bitmap 来压缩空间。另外，元素被加到一个集合中，就不能再删除了。</p><p>上述特性与布隆过滤器的实现密切相关。</p><h2 id="implementation" tabindex="-1"><a class="header-anchor" href="#implementation"><span>Implementation</span></a></h2><p><img src="'+r+'" alt="bloom-filter"></p><p>首先，布隆过滤器包含如下两个部分：</p><ul><li>一个巨大的 bitmap，长度为 <code>m</code>，其中的每一位不是 0 就是 1</li><li><code>k</code> 个 <strong>相互独立</strong> 的 hash 函数</li></ul><p>对于每一个要添加到集合中的元素，分别用 <code>k</code> 个 hash 对该元素进行散列，然后将得到的结果对 <code>m</code> 取余，即：<code>index = hash(input) % m</code>。将 bitmap 中这 <code>k</code> 个下标上的位 set 为 <code>1</code>。</p><p>要判断一个元素是否在集合中时，对该元素使用同样的 <code>k</code> 个 hash 函数，并对 <code>m</code> 取余：</p><ul><li>如果得到的 <code>k</code> 个下标对应的位 <strong>只要有一个为 <code>0</code></strong>，就可以确定该元素不在集合中 (因为如果元素存在，这些位必不为 <code>0</code>)</li><li>如果下标对应的所有位都为 <code>1</code>，那么只能说明该元素可能存在于集合中，也有可能不存在，因为可能只是集合中的其它元素的存在把该元素对应的所有下标位给碰撞了</li></ul><p>布隆过滤器节省空间体现在，对于数量为 <code>n</code> 的数据，bitmap 只需要 <code>n / 8</code> 个字节就能存放。另外，布隆过滤器的时间复杂度低下：只需要计算 <code>k</code> 个 hash 的值，然后就可以进行 O(1) 复杂度的查询。</p><p>既然这是一个概率模型，该如何保证预测的失误率呢？</p><h2 id="parameters" tabindex="-1"><a class="header-anchor" href="#parameters"><span>Parameters</span></a></h2><p>预测的准确率与以下几个因素有关：</p><ul><li>Bitmap 的大小 - bitmap 较小，则发生 hash 碰撞的概率就会变高，预测将更加不准确</li><li>Hash 函数的个数 - hash 函数越多，添加每个元素时 set 的位数量越多，越可能发生碰撞</li></ul><p>有以下的计算公式：</p><ul><li><code>m</code> 为 bitmap 的大小</li><li><code>k</code> 为 hash 函数的个数</li><li><code>p</code> 为可容忍的误判率</li></ul><p><img src="'+i+'" alt="bloom-filter-parameter"></p><h2 id="application" tabindex="-1"><a class="header-anchor" href="#application"><span>Application</span></a></h2><p>布隆过滤器可以用于防止 <em>缓存穿透</em>。对于 <em>Redis</em> 等缓存来说，其主要作用在于将海量请求挡在数据库以外。对于缓存中没有的数据，从数据库中将数据 fetch 到缓存内后，缓存应当可以将之后所有对该数据的访问挡在数据库外。如果有恶意请求利用这个特性，偏偏专门访问一个数据库中不存在的数据，从而可以每次都穿透缓存，访问数据库，降低系统性能。</p><p>在这种情况下，就可以使用布隆过滤器将这类请求挡掉：将数据库中的所有 key 加入到布隆过滤器中，并将过滤器挡在缓存之前。对于确定不存在的数据，甚至连缓存都不需要查，直接返回不存在即可。</p><hr><h2 id="references" tabindex="-1"><a class="header-anchor" href="#references"><span>References</span></a></h2><p><a href="https://zhuanlan.zhihu.com/p/72378274" target="_blank" rel="noopener noreferrer">知乎专栏 - 数学之美：布隆过滤器</a></p><p><a href="https://en.wikipedia.org/wiki/Bloom_filter" target="_blank" rel="noopener noreferrer">Wikipedia - Bloom Filter</a></p>',31)]))}const m=o(n,[["render",p],["__file","Algorithm Bloom Filter.html.vue"]]),d=JSON.parse('{"path":"/notes/Algorithm/Algorithm%20Bloom%20Filter.html","title":"Algorithm - Bloom Filter","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"About","slug":"about","link":"#about","children":[]},{"level":2,"title":"Implementation","slug":"implementation","link":"#implementation","children":[]},{"level":2,"title":"Parameters","slug":"parameters","link":"#parameters","children":[]},{"level":2,"title":"Application","slug":"application","link":"#application","children":[]},{"level":2,"title":"References","slug":"references","link":"#references","children":[]}],"git":{},"filePathRelative":"notes/Algorithm/Algorithm Bloom Filter.md"}');export{m as comp,d as data};