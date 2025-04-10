import{_ as i,c as a,a as s,o as n}from"./app-CT9FvwxE.js";const l="/blog/assets/inodes-BvHrSPDS.png",o={};function d(t,e){return n(),a("div",null,e[0]||(e[0]=[s(`<h1 id="chapter-4-3-4-5-swap-space-inside-a-traditional-filesystem" tabindex="-1"><a class="header-anchor" href="#chapter-4-3-4-5-swap-space-inside-a-traditional-filesystem"><span>Chapter 4.3-4.5 - Swap Space &amp; Inside a Traditional Filesystem</span></a></h1><p>Created by : Mr Dk.</p><p>2019 / 06 / 22 09:16</p><p>CRH Train G7687 @Somewhere in Anhui, China</p><hr><h2 id="_4-3-swap-space" tabindex="-1"><a class="header-anchor" href="#_4-3-swap-space"><span>4.3 Swap Space</span></a></h2><p>不是每一个磁盘分区上都有文件系统。RAM 空间与磁盘空间进行对换也是有可能的。如果真实内存用尽，Linux 虚拟内存系统会自动将一些内存片段放入磁盘空间：<em>swapping</em>。</p><ul><li>将一些空闲的程序换到磁盘</li><li>将一些活跃的程序换到内存</li></ul><p>磁盘空间上用于存储内存页的区域叫做 <em>swap space (swap)</em>。<code>free</code> 命令能够输出目前交换空间的使用情况 (kB)。</p><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ free</span>
<span class="line">              total        used        free      shared  buff/cache   available</span>
<span class="line">Mem:        8311928     4298916     3783660       17720      229352     3879280</span>
<span class="line">Swap:      23314172      105696    23208476</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-1-using-a-disk-partition-as-swap-space" tabindex="-1"><a class="header-anchor" href="#_4-3-1-using-a-disk-partition-as-swap-space"><span>4.3.1 Using a Disk Partition as Swap Space</span></a></h3><ol><li>一个空白的分区</li><li><code>mkswap dev</code> - <code>dev</code> 为分区设备，该命令会将分区标记为交换分区</li><li><code>swapon dev</code> - 为内核注册交换分区</li></ol><p>在 <code>/etc/fstab</code> 中加入新的条目。</p><h3 id="_4-3-2-using-a-file-as-swap-space" tabindex="-1"><a class="header-anchor" href="#_4-3-2-using-a-file-as-swap-space"><span>4.3.2 Using a File as Swap Space</span></a></h3><p>如果在当前情况下不能对磁盘进行重新分区，可以使用一个文件作为交换分区。</p><ol><li>创建一个指定大小的空文件</li><li>初始化为交换分区</li><li>将其加入交换分区池</li></ol><div class="language-console line-numbers-mode" data-highlighter="prismjs" data-ext="console" data-title="console"><pre><code><span class="line">$ dd if=/dev/zero of=&lt;swap_file&gt; bs=1024k count=&lt;num_mb&gt;</span>
<span class="line">$ mkswap &lt;swap_file&gt;</span>
<span class="line">$ swapon &lt;swap_file&gt;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-3-how-much-swap-do-you-need" tabindex="-1"><a class="header-anchor" href="#_4-3-3-how-much-swap-do-you-need"><span>4.3.3 How Much Swap Do You Need?</span></a></h3><p>在以前，swap 分区通常要设定为两倍于内存左右的大小空间。现在，一方面由于内存越来越大，另一方面由于磁盘空间也越来越大。因此，并不一定要满足这一传统规则了。</p><hr><h2 id="_4-4-looking-forward-disks-and-user-space" tabindex="-1"><a class="header-anchor" href="#_4-4-looking-forward-disks-and-user-space"><span>4.4 Looking Forward: Disks and User Space</span></a></h2><hr><h2 id="_4-5-inside-a-traditional-filesystem" tabindex="-1"><a class="header-anchor" href="#_4-5-inside-a-traditional-filesystem"><span>4.5 Inside a Traditional Filesystem</span></a></h2><p>传统的 Unix 文件系统有两个主要组成部分：</p><ul><li>数据块池 - 用于存放数据</li><li>一个数据库系统 - 用于管理数据池</li></ul><p>数据库系统以 <strong>inode</strong> 数据结构为中心。这是一种数据结构，描述一个特定文件/目录、类型、权限，以及数据存放在数据块池中的哪些位置。Inodes 由 inode table 中的编号被识别，文件名和目录也由 inode 实现，包含了目录下一系列的文件名和目录名，和这些子目录子文件对应的 inode 的链接信息。</p><p><img src="`+l+'" alt="inodes"></p><p>寻找一个文件的过程：</p><ol><li>将文件的路径根据 <code>/</code> 逐级拆分</li><li>在 inode table 中找到 root inode 的条目，查找 root inode 在数据块池中的位置</li><li>在 root inode 中找到对应的文件或目录，得到下一级的 inode 编号</li><li>在 inode table 中找到该 inode 编号对应在数据块池中的位置，找到对应的 inode</li><li>重复上述过程，直到找到最终的 inode</li></ol><p>注意：目录的 inodes 中还包含了对于自身 inode 和上一级 inode 的引用。</p><h3 id="_4-5-1-viewing-inode-details" tabindex="-1"><a class="header-anchor" href="#_4-5-1-viewing-inode-details"><span>4.5.1 Viewing Inode Details</span></a></h3><p>查看任何一个目录的 inode 编号 - <code>ls -i</code>。Hard-link - <code>ln A B</code>，只是在 inode table 中创建了一个条目，指向了一个已经存在的 inode，不会额外创建新的 inode。</p><p>删除时怎么办？</p><ul><li>删除 inode 条目时，数据块池中对应的 inode 也被删除</li><li>硬链接的另一个 inode 条目将无法引用到 inode</li></ul><p>inode table 中存在 <strong>link count</strong> 域：</p><ul><li>创建目录 inode 时，link count 初始化为 2 <ul><li>inode 自身引用</li><li>父目录引用</li></ul></li><li>创建文件 inode 时，link count 初始化为 3 <ul><li>父目录引用</li></ul></li><li>创建硬链接时，直接将 link count + 1</li><li>删除文件或目录时，根据 link count 的具体值来决定要不要删除 inode <ul><li>比如删除硬链接文件时，只将 link count - 1</li><li>若 link count 为 0 再删除 inode</li></ul></li><li>一个例外：root inode 的 link count 会多一个 <ul><li>文件系统的 superblock 的引用</li><li>用于寻找 root inode</li></ul></li></ul><p>之前使用的 <code>fsck</code> 文件系统检查程序会遍历所有的 inode，重新计算所有的 link count，并与已有的 link count 进行比较。如果不匹配，会将存在问题的 inode 放在 <code>lost+found</code> 目录下。</p><h3 id="_4-5-2-working-with-filesystems-in-user-space" tabindex="-1"><a class="header-anchor" href="#_4-5-2-working-with-filesystems-in-user-space"><span>4.5.2 Working with Filesystems in User Space</span></a></h3><p>虽然用户空间有权限查看 inode 等信息 - 通过 <code>stat()</code> 系统调用。但用户不需要关心文件系统的实现细节，不是所有 Linux 支持的文件系统都有这样的实现方式。Linux 的 <em>Virtual File System (VFS)</em> 接口保证了系统调用每次返回 inode 和 link count，但不能保证返回的值有意义。也不能在 FAT 文件系统上使用 <code>ln</code> 创建硬链接。</p><h3 id="_4-5-3-the-evolution-of-filesystems" tabindex="-1"><a class="header-anchor" href="#_4-5-3-the-evolution-of-filesystems"><span>4.5.3 The Evolution of Filesystems</span></a></h3><p>文件系统的技术在不断变化。<code>Btrfs</code> 是下一代文件系统，正在开发中。新的文件系统数据结构肯定会不太一样。此外，对 SSD 的优化文件系统也在不断进化。但是，文件系统的不断进化没有改变其原有的本质功能。</p><hr>',42)]))}const r=i(o,[["render",d],["__file","Chapter 4.3-4.5 - Swap Space _ Inside a Traditional Filesystem.html.vue"]]),c=JSON.parse('{"path":"/how-linux-works-notes/Chapter%204.3-4.5%20-%20Swap%20Space%20_%20Inside%20a%20Traditional%20Filesystem.html","title":"Chapter 4.3-4.5 - Swap Space & Inside a Traditional Filesystem","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"4.3 Swap Space","slug":"_4-3-swap-space","link":"#_4-3-swap-space","children":[{"level":3,"title":"4.3.1 Using a Disk Partition as Swap Space","slug":"_4-3-1-using-a-disk-partition-as-swap-space","link":"#_4-3-1-using-a-disk-partition-as-swap-space","children":[]},{"level":3,"title":"4.3.2 Using a File as Swap Space","slug":"_4-3-2-using-a-file-as-swap-space","link":"#_4-3-2-using-a-file-as-swap-space","children":[]},{"level":3,"title":"4.3.3 How Much Swap Do You Need?","slug":"_4-3-3-how-much-swap-do-you-need","link":"#_4-3-3-how-much-swap-do-you-need","children":[]}]},{"level":2,"title":"4.4 Looking Forward: Disks and User Space","slug":"_4-4-looking-forward-disks-and-user-space","link":"#_4-4-looking-forward-disks-and-user-space","children":[]},{"level":2,"title":"4.5 Inside a Traditional Filesystem","slug":"_4-5-inside-a-traditional-filesystem","link":"#_4-5-inside-a-traditional-filesystem","children":[{"level":3,"title":"4.5.1 Viewing Inode Details","slug":"_4-5-1-viewing-inode-details","link":"#_4-5-1-viewing-inode-details","children":[]},{"level":3,"title":"4.5.2 Working with Filesystems in User Space","slug":"_4-5-2-working-with-filesystems-in-user-space","link":"#_4-5-2-working-with-filesystems-in-user-space","children":[]},{"level":3,"title":"4.5.3 The Evolution of Filesystems","slug":"_4-5-3-the-evolution-of-filesystems","link":"#_4-5-3-the-evolution-of-filesystems","children":[]}]}],"git":{},"filePathRelative":"how-linux-works-notes/Chapter 4.3-4.5 - Swap Space & Inside a Traditional Filesystem.md"}');export{r as comp,c as data};
