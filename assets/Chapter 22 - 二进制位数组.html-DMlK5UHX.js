import{_ as e,c as i,a,o}from"./app-CT9FvwxE.js";const n={};function l(r,t){return o(),i("div",null,t[0]||(t[0]=[a('<h1 id="chapter-22-二进制位数组" tabindex="-1"><a class="header-anchor" href="#chapter-22-二进制位数组"><span>Chapter 22 - 二进制位数组</span></a></h1><p>Created by : Mr Dk.</p><p>2020 / 06 / 13 13:38</p><p>Nanjing, Jiangsu, China</p><hr><p>Redis 提供四个命令用于操作位数组 (与 bitmap 类似)。</p><h2 id="representation-of-bit-array" tabindex="-1"><a class="header-anchor" href="#representation-of-bit-array"><span>Representation of Bit Array</span></a></h2><p>Redis 使用字符串对象 (SDS) 来表示 bit array。从 SDS 的 <code>[0]</code> 的第一个 bit 开始存放最低位。每次以字节为单位对位数组进行扩展。</p><h2 id="implementation-of-getbit" tabindex="-1"><a class="header-anchor" href="#implementation-of-getbit"><span>Implementation of GETBIT</span></a></h2><p><code>GETBIT</code> 返回 bit array 在指定 offset 上的二进制位的值：</p><ul><li>首先，计算 <code>offset / 8</code> 得到对应的 bit 在哪一个字节上</li><li>计算 <code>offset % 8</code> 得到对应的 bit 在字节中的哪个 bit 上</li><li>返回这个 bit 上的数值</li></ul><p>所有计算可以在常数时间内完成，因此算法复杂度为 <code>O(1)</code>。</p><h2 id="implementation-of-setbit" tabindex="-1"><a class="header-anchor" href="#implementation-of-setbit"><span>Implementation of SETBIT</span></a></h2><p><code>SETBIT</code> 用于设置 bit array 在 offset 偏移量上的 bit：</p><ul><li>计算 <code>offset / 8</code> 得到 bit 在哪一个字节上</li><li>如果这个字节已经超出了 SDS 的长度，则需要将 SDS 字符串扩展到这个长度 (SDS 的空间预分配策略还会额外分配 2B 的空闲空间)</li><li>计算 <code>offset % 8</code> 得到对应的 bit 在字节中的哪个 bit 上</li><li>首先保存这个 bit 上的旧值，然后在这个 bit 上设置新值</li><li>返回旧值</li></ul><h2 id="implementation-of-bitcount" tabindex="-1"><a class="header-anchor" href="#implementation-of-bitcount"><span>Implementation of BITCOUNT</span></a></h2><p><code>BITCOUNT</code> 命令用于统计给定的 bit array 中值为 1 的 bit 的数量。</p><p>显然，最简单的算法是遍历整个 bit array，统计其中值为 1 的 bit 数量。但是这个算法的效率与 bit array 的长度有关，可能效率会非常低。</p><p><strong>查表算法</strong> 是一种以空间换时间的优化操作：比如，提前将一个字节中所有可能的位排列，以及对应的 <code>1</code> 个数放到一张表中。那么，对于一个字节 (8-bit)，只需要查一次表就能得到 8 个 bit 中有多少个 1：</p><table><thead><tr><th>Bit Array</th><th>Count of <code>1</code></th></tr></thead><tbody><tr><td>0000 0000</td><td>0</td></tr><tr><td>0000 0001</td><td>1</td></tr><tr><td>0000 0010</td><td>1</td></tr><tr><td>...</td><td></td></tr><tr><td>1111 1110</td><td>7</td></tr><tr><td>1111 1111</td><td>8</td></tr></tbody></table><p>表所支持的位数越多，表空间就越大，但是可以节约的时间就越多。这种典型的以空间换时间的策略是一种折衷：</p><ol><li>表空间不能超过服务器所能接受的内存开销</li><li>表越大那么 CPU cache miss 的几率也就越高，最终也会影响效率</li></ol><p>因此目前只能考虑 8-bit 的表 (数百 B) 或 16-bit 的表 (数百 KB)。一个 32-bit 的表需要 (10GB+)。</p><p>对于这个问题 (计算 Hamming Weight) 效率最高的算法是 <em>variable-precision SWAR</em> 算法，可以在常数时间内计算多个字节的 Hamming Weight，并且不需要额外内存。但是具体流程没看懂。。。</p><p>Redis 在实现中使用了查表算法和 variable-precision SWAR 算法：</p><ul><li>查表算法的 key 为 8-bit</li><li>variable-precision SWAR 算法每次循环载入 128-bit，调用四次算法来计算</li></ul><p>执行 <code>BITCOUNT</code> 时，程序根据剩余未处理的二进制位数量来决定使用哪个算法：</p><ul><li>如果 &gt;= 128-bit，则使用 variable-precision SWAR 算法</li><li>如果 &lt; 128-bit，则使用查表算法</li></ul><h2 id="implementation-of-bitop" tabindex="-1"><a class="header-anchor" href="#implementation-of-bitop"><span>Implementation of BITOP</span></a></h2><p><code>BITOP</code> 命令对两个 bit array 直接进行 <code>&amp;</code> / <code>|</code> / <code>^</code> / <code>~</code> 操作，C 语言的位操作直接支持这些运算。Redis 首先会创建一个空白的 bit array 用于保存结果，然后直接进行运算。</p>',30)]))}const d=e(n,[["render",l],["__file","Chapter 22 - 二进制位数组.html.vue"]]),c=JSON.parse('{"path":"/redis-implementation-notes/Part%204%20-%20%E7%8B%AC%E7%AB%8B%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0/Chapter%2022%20-%20%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%BD%8D%E6%95%B0%E7%BB%84.html","title":"Chapter 22 - 二进制位数组","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Representation of Bit Array","slug":"representation-of-bit-array","link":"#representation-of-bit-array","children":[]},{"level":2,"title":"Implementation of GETBIT","slug":"implementation-of-getbit","link":"#implementation-of-getbit","children":[]},{"level":2,"title":"Implementation of SETBIT","slug":"implementation-of-setbit","link":"#implementation-of-setbit","children":[]},{"level":2,"title":"Implementation of BITCOUNT","slug":"implementation-of-bitcount","link":"#implementation-of-bitcount","children":[]},{"level":2,"title":"Implementation of BITOP","slug":"implementation-of-bitop","link":"#implementation-of-bitop","children":[]}],"git":{},"filePathRelative":"redis-implementation-notes/Part 4 - 独立功能的实现/Chapter 22 - 二进制位数组.md"}');export{d as comp,c as data};
