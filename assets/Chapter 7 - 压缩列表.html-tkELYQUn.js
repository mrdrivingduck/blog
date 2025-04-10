import{_ as e,c as d,a as i,o as n}from"./app-CT9FvwxE.js";const o={};function a(r,t){return n(),d("div",null,t[0]||(t[0]=[i('<h1 id="chapter-7-压缩列表" tabindex="-1"><a class="header-anchor" href="#chapter-7-压缩列表"><span>Chapter 7 - 压缩列表</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 01 16:45</p><p>Nanjing, Jiangsu, China</p><hr><h2 id="ziplist-definition" tabindex="-1"><a class="header-anchor" href="#ziplist-definition"><span>Ziplist Definition</span></a></h2><p>当列表项中要么是 <strong>小整数值</strong>，要么是 <strong>较短的字符串</strong> 时，Redis 使用压缩列表来作为列表键的底层实现。压缩列表由一系列特殊编码的连续内存块组成的顺序结构，其中可以包含任意多个结点，每个结点可以用于保存一个字节数组或整数值。</p><table><thead><tr><th>Attribute</th><th>Type</th><th>Length</th><th>Description</th></tr></thead><tbody><tr><td><code>zlbytes</code></td><td><code>uint32_t</code></td><td>4B</td><td>记录整个压缩列表的字节长度</td></tr><tr><td><code>zltail</code></td><td><code>uint32_t</code></td><td>4B</td><td>列表中最后一个结点距离列表起始地址的偏移 (不需遍历就能确定表尾结点位置)</td></tr><tr><td><code>zllen</code></td><td><code>uint16_t</code></td><td>2B</td><td>列表中的结点数量 (当数量超过其能表示的最大范围时，需要遍历整个列表才能得到结果)</td></tr><tr><td><code>entryX</code></td><td>列表结点</td><td>不一定</td><td>各个结点</td></tr><tr><td><code>zlend</code></td><td><code>uint8_t</code></td><td>1B</td><td><code>0xFF</code>，标记压缩列表末端</td></tr></tbody></table><h2 id="ziplist-node-definition" tabindex="-1"><a class="header-anchor" href="#ziplist-node-definition"><span>Ziplist Node Definition</span></a></h2><ul><li><code>previous_entry_length</code> - 前一结点长度 (这样就可以通过当前结点计算出前一个结点的位置)</li><li><code>encoding</code> - 当前结点的编码方式</li><li><code>content</code> - 当前结点的内容</li></ul><p>如果前一结点的长度小于 254B，<code>previous_entry_length</code> 用一个字节来表示；否则，就使用五个字节 - 第一字节为 <code>0xFE</code>，剩余四个字节表示长度。编码方式也类似，不同的编码方式对应了不同的长度。</p><h2 id="连锁更新" tabindex="-1"><a class="header-anchor" href="#连锁更新"><span>连锁更新</span></a></h2><p>当前一结点的长度超过 254B 阈值时，后续结点就需要将 1B 的 <code>previous_entry_length</code> 修改为 5B 的表示形式，从而引发后续结点也变长了。如果比较倒霉，后续结点又会发生连锁的更新。类似地，从列表中删除元素时，也存在这种可能。但是在实际的使用中，发生这种情况的概率很低。</p><blockquote><p>疑问</p><p>结点的内容是直接存在列表中，还是只在列表中保存了指向内容的指针？如果结点的内容发生变化，长度发生变化，那么后续结点的内容是不是也会跟着在内存中后移？这样会不会存在性能问题？</p></blockquote>',14)]))}const c=e(o,[["render",a],["__file","Chapter 7 - 压缩列表.html.vue"]]),s=JSON.parse('{"path":"/redis-implementation-notes/Part%201%20-%20%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E5%AF%B9%E8%B1%A1/Chapter%207%20-%20%E5%8E%8B%E7%BC%A9%E5%88%97%E8%A1%A8.html","title":"Chapter 7 - 压缩列表","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Ziplist Definition","slug":"ziplist-definition","link":"#ziplist-definition","children":[]},{"level":2,"title":"Ziplist Node Definition","slug":"ziplist-node-definition","link":"#ziplist-node-definition","children":[]},{"level":2,"title":"连锁更新","slug":"连锁更新","link":"#连锁更新","children":[]}],"git":{},"filePathRelative":"redis-implementation-notes/Part 1 - 数据结构与对象/Chapter 7 - 压缩列表.md"}');export{c as comp,s as data};
