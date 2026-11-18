/* 第六部分 · 总结 */
(() => {
  DSA.lesson({
    id: 'summary',
    part: '总结',
    title: '总结与下一步',
    glyph: '✓',
    minutes: 10,
    summary: '复杂度速查表、排序大比拼和进阶路线',
    blocks: [
      {
        type: 'text',
        html: `
<p>恭喜你走到这里！回顾一下：我们从一行 <code>print</code> 开始，学会了用大 O 衡量效率，认识了数组、链表、栈、队列、哈希表、树、堆和图，掌握了递归、二分查找和五种排序算法。</p>
<h2>数据结构速查表</h2>
<div class="table-wrap"><table>
<tr><th>数据结构</th><th>Python 写法</th><th>擅长</th><th>关键操作的复杂度</th></tr>
<tr><td>数组 / 列表</td><td><code>list</code></td><td>按位置访问</td><td>访问 O(1)，末尾增删 O(1)，中间插入 O(n)</td></tr>
<tr><td>链表</td><td>自定义 <code>Node</code> 类</td><td>头部插入删除</td><td>头部增删 O(1)，访问第 k 个 O(n)</td></tr>
<tr><td>栈</td><td><code>list</code> 的 append / pop</td><td>后进先出：撤销、括号匹配、递归</td><td>push / pop O(1)</td></tr>
<tr><td>队列</td><td><code>collections.deque</code></td><td>先进先出：排队、BFS</td><td>入队 / 出队 O(1)</td></tr>
<tr><td>哈希表</td><td><code>dict</code>、<code>set</code></td><td>按键快速查找、去重、计数</td><td>增删查平均 O(1)</td></tr>
<tr><td>二叉搜索树</td><td>自定义 <code>TreeNode</code> 类</td><td>有序数据的动态查找</td><td>平衡时 O(log n)，退化时 O(n)</td></tr>
<tr><td>堆</td><td><code>heapq</code></td><td>反复取最小值：优先队列、Top K</td><td>取最小 O(1)，入堆 / 出堆 O(log n)</td></tr>
<tr><td>图</td><td>邻接表 <code>dict</code></td><td>关系网络、路径问题</td><td>BFS / DFS O(V + E)</td></tr>
</table></div>
<h2>排序算法速查表</h2>
<div class="table-wrap"><table>
<tr><th>算法</th><th>平均</th><th>最坏</th><th>额外空间</th><th>一句话</th></tr>
<tr><td>冒泡排序</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>相邻比较，大的往后冒</td></tr>
<tr><td>选择排序</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>每轮选最小的放前面</td></tr>
<tr><td>插入排序</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>像整理扑克牌，几乎有序时很快</td></tr>
<tr><td>归并排序</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>拆成两半，排好再合并</td></tr>
<tr><td>快速排序</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>按基准分区，实际最常用</td></tr>
</table></div>
<h2>排序大比拼</h2>
<p>用同一组数据让五种排序算法比一比。切换“几乎有序”和“完全逆序”，看看插入排序和快速排序的表现怎么变化。</p>`,
      },
      { type: 'widget', name: 'sortRace' },
      {
        type: 'quiz',
        q: '要频繁判断“某个用户名是否已经被注册”，最合适的数据结构是？',
        options: ['列表 list', '集合 set', '栈', '链表'],
        answer: 1,
        explain: '<p>集合基于哈希表，判断存在平均 O(1)。用列表的话每次都要 O(n) 地从头找。</p>',
      },
      {
        type: 'quiz',
        q: '游戏里要不断取出“距离最近的敌人”（敌人位置会不断变化、新增），最合适的是？',
        options: ['每次都对全部敌人排序', '堆（优先队列）', '栈', '队列'],
        answer: 1,
        explain: '<p>堆可以在 O(log n) 内加入新元素、取出最小值，比每次 O(n log n) 排序快得多。</p>',
      },
      {
        type: 'quiz',
        q: '在地铁线路图中找“换乘次数最少”的路线，应该用？',
        options: ['DFS', 'BFS', '二分查找', '冒泡排序'],
        answer: 1,
        explain: '<p>每次换乘看作走一步，BFS 由近到远逐层扩展，第一次到达终点时就是步数最少的路线。</p>',
      },
      {
        type: 'text',
        html: `
<h2>接下来学什么</h2>
<p>这门课覆盖了数据结构与算法的基础。如果你想继续深入，推荐的方向：</p>
<ul>
  <li><b>动态规划</b>：递归 + 记忆化的进阶，用来解决最优化问题（背包问题、最长公共子序列）。</li>
  <li><b>贪心算法</b>：每一步都做当前看起来最好的选择（找零钱、活动安排）。</li>
  <li><b>回溯</b>：DFS 的延伸，用来穷举所有可能（全排列、N 皇后）。</li>
  <li><b>最短路径</b>：带权图上的 Dijkstra 算法，用到了这一课学的堆。</li>
  <li><b>更多数据结构</b>：平衡树、字典树（Trie）、并查集。</li>
</ul>
<p>学算法最好的方法是<b>多写代码</b>。可以在 LeetCode（力扣）上从“简单”难度的题目开始练习，遇到题目先想一想：用哪种数据结构？暴力解法的复杂度是多少？能不能更快？</p>
<p>点击下面的按钮完成最后一课。之后随时可以回到任何一课复习，你的进度和练习代码都会保存在这个浏览器里。</p>`,
      },
    ],
  });
})();
