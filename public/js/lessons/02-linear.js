/* 第二部分 · 线性结构：数组、链表、栈、队列、哈希表 */
(() => {
  const P = '线性数据结构';
  const R = DSA.range;
  const uid = DSA.uid;
  const full = (n, max, what) => (n >= max ? { msg: `${what}已经有 ${max} 个元素了，画面快放不下，先点“恢复初始状态”吧。` } : null);

  /* ———————————— 数组 ———————————— */
  DSA.lesson({
    id: 'array',
    part: P,
    title: '数组（Python 列表）',
    glyph: '[ ]',
    minutes: 15,
    summary: '连续存放：按下标读取很快，中间插入很慢',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>数组</strong>把数据一个挨一个地存放在<b>连续的内存</b>里，就像电影院里连号的一排座位。Python 的列表（list）底层就是一个能自动扩容的数组。</p>
<h2>为什么按下标读取是 O(1)</h2>
<p>知道第一个座位在哪、每个座位多宽，第 i 个座位的位置就能直接算出来：<code>起始位置 + i × 每格大小</code>。不需要从头数，所以无论列表多长，<code>arr[i]</code> 都只要一步。</p>
<h2>为什么在中间插入是 O(n)</h2>
<p>座位是连续的，要在中间加一个人，后面所有人都得往后挪一个位置。删除也一样，后面的人要往前补位。只有在<b>末尾</b>追加和删除才不用挪动别人。</p>`,
      },
      {
        type: 'player',
        title: '数组的五种操作',
        views: [{ type: 'array', key: 'arr', title: 'arr' }],
        init: () => ({ arr: DSA.items([12, 5, 8, 20, 3]) }),
        hint: '先试试“在位置 i 插入”，填 <code>0, 99</code> 表示在最前面插入 99，数一数要挪动几个元素。',
        actions: [
          {
            label: '读取 arr[i]',
            input: { kind: 'num', value: '3', max: 12, label: '下标 i', width: 4 },
            code: `value = arr[i]    # 直接算出位置，一步到位 O(1) #@read`,
            run: function* (s, i) {
              if (i >= s.arr.length) return yield { at: 'read', msg: `下标 ${i} 越界了（合法范围 0 ~ ${s.arr.length - 1}），Python 会报 IndexError。`, vars: { i } };
              yield { at: 'read', msg: `直接定位到下标 ${i}，取到 ${s.arr[i].v}。只用了 1 步。`, hl: { found: [i], ptr: { i } }, vars: { i, value: s.arr[i].v } };
            },
          },
          {
            label: '在位置 i 插入 x',
            input: {
              label: '位置和值，例如 1, 99',
              value: '1, 99',
              width: 6,
              parse: (t) => {
                const [i, x] = DSA.parseNums(t, { minLen: 2, maxLen: 2 });
                return [i, x];
              },
            },
            code: `def insert(arr, i, x):
    arr.append(None)          # 末尾先多占一个位置 #@grow
    j = len(arr) - 1
    while j > i:              #@loop
        arr[j] = arr[j - 1]   # 元素往右挪一格 #@shift
        j -= 1
    arr[i] = x                # 放入新元素 #@put`,
            test: `a = [1, 2, 3]
insert(a, 1, 9)
expect(a, [1, 9, 2, 3], "insert")
insert(a, 4, 7)
expect(a, [1, 9, 2, 3, 7], "insert at end")`,
            run: function* (s, [i, x]) {
              const a = s.arr;
              const stop = full(a.length, 10, '数组');
              if (stop) return yield stop;
              if (i > a.length) return yield { msg: `位置 ${i} 超出范围了，只能是 0 ~ ${a.length}。` };
              a.push({ id: uid(), v: null });
              yield { at: 'grow', msg: '先在末尾多开一个空位。', hl: { new: [a.length - 1] }, vars: { i, x } };
              let j = a.length - 1;
              let moves = 0;
              while (j > i) {
                yield { at: 'loop', msg: `j = ${j} 还在 i = ${i} 右边，需要把左边的元素挪过来。`, hl: { cmp: [j - 1], ptr: { i, j } }, vars: { i, x, j } };
                [a[j], a[j - 1]] = [a[j - 1], a[j]];
                moves++;
                yield { at: 'shift', msg: `arr[${j}] = arr[${j - 1}]：${a[j].v} 往右挪一格。（已挪动 ${moves} 个元素）`, hl: { swap: [j], ptr: { i, j } }, vars: { i, x, j } };
                j--;
              }
              a[i].v = x;
              yield { at: 'put', msg: `arr[${i}] = ${x}，插入完成。一共挪动了 <b>${moves}</b> 个元素，越靠前插入挪得越多，最坏 O(n)。`, hl: { new: [i] }, vars: { i, x, j } };
            },
          },
          {
            label: '删除位置 i',
            input: { kind: 'num', value: '1', max: 12, label: '要删除的下标', width: 4 },
            code: `def pop_at(arr, i):
    value = arr[i]                      # 记下要删除的值 #@take
    for j in range(i, len(arr) - 1):    #@loop
        arr[j] = arr[j + 1]             # 后面的元素往前补位 #@shift
    arr.pop()                           # 去掉末尾多出来的位置 #@shrink
    return value`,
            test: `a = [1, 2, 3, 4]
expect(pop_at(a, 1), 2, "pop_at 返回值")
expect(a, [1, 3, 4], "pop_at 之后的列表")`,
            run: function* (s, i) {
              const a = s.arr;
              if (!a.length) return yield { msg: '数组已经空了。' };
              if (i >= a.length) return yield { msg: `下标 ${i} 越界了，合法范围 0 ~ ${a.length - 1}。` };
              const value = a[i].v;
              yield { at: 'take', msg: `要删除的是 arr[${i}] = ${value}。`, hl: { del: [i] }, vars: { i, value } };
              a[i].v = null;
              let moves = 0;
              for (let j = i; j < a.length - 1; j++) {
                yield { at: 'loop', msg: `j = ${j}：把右边的 ${a[j + 1].v} 挪到这个空位。`, hl: { cmp: [j + 1], ptr: { j } }, vars: { i, value, j } };
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                moves++;
                yield { at: 'shift', msg: `arr[${j}] = arr[${j + 1}]（已挪动 ${moves} 个元素）`, hl: { swap: [j], ptr: { j } }, vars: { i, value, j } };
              }
              a.pop();
              yield { at: 'shrink', msg: `去掉末尾的空位，删除完成，挪动了 <b>${moves}</b> 个元素。`, vars: { i, value } };
            },
          },
          {
            label: '末尾追加 x',
            input: { kind: 'num', value: '42', label: '要追加的值', width: 4 },
            code: `arr.append(x)     # 末尾直接放，不用挪动别人 O(1) #@append`,
            run: function* (s, x) {
              const stop = full(s.arr.length, 10, '数组');
              if (stop) return yield stop;
              s.arr.push({ id: uid(), v: x });
              yield { at: 'append', msg: `${x} 直接放到末尾，没有挪动任何元素。`, hl: { new: [s.arr.length - 1] }, vars: { x } };
            },
          },
          {
            label: '查找值 x',
            input: { kind: 'num', value: '20', label: '要查找的值', width: 4 },
            code: `def find(arr, x):
    for i in range(len(arr)):     #@loop
        if arr[i] == x:           #@cmp
            return i              #@found
    return -1                     # 没找到 #@none`,
            test: `expect(find([4, 5, 6], 6), 2, "find")
expect(find([4, 5, 6], 1), -1, "find 不存在")`,
            run: function* (s, x) {
              const a = s.arr;
              for (let i = 0; i < a.length; i++) {
                yield { at: 'cmp', msg: `arr[${i}] = ${a[i].v}，等于 ${x} 吗？`, hl: { cmp: [i], dim: R(0, i), ptr: { i } }, vars: { x, i } };
                if (a[i].v === x) return yield { at: 'found', msg: `找到了，在下标 ${i}。比较了 ${i + 1} 次。`, hl: { found: [i], ptr: { i } }, vars: { x, i } };
              }
              yield { at: 'none', msg: `所有 ${a.length} 个元素都比较过了，没有 ${x}，返回 -1。值查找需要逐个比较，是 O(n)。`, hl: { dim: R(0, a.length) }, vars: { x } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>Python 列表常用操作的复杂度</h2>
<div class="table-wrap"><table>
<tr><th>操作</th><th>写法</th><th>复杂度</th></tr>
<tr><td>按下标读 / 改</td><td><code>arr[i]</code>、<code>arr[i] = x</code></td><td>O(1)</td></tr>
<tr><td>末尾追加</td><td><code>arr.append(x)</code></td><td>O(1)</td></tr>
<tr><td>删除末尾</td><td><code>arr.pop()</code></td><td>O(1)</td></tr>
<tr><td>中间插入</td><td><code>arr.insert(i, x)</code></td><td>O(n)</td></tr>
<tr><td>删除开头或中间</td><td><code>arr.pop(0)</code>、<code>arr.pop(i)</code></td><td>O(n)</td></tr>
<tr><td>按值查找</td><td><code>x in arr</code>、<code>arr.index(x)</code></td><td>O(n)</td></tr>
</table></div>`,
      },
      {
        type: 'code',
        title: '这些操作在 Python 里都有现成的写法',
        code: `arr = [12, 5, 8]
arr.insert(0, 99)    # 在下标 0 插入 99
print(arr)
arr.pop(1)           # 删除下标 1 的元素
print(arr)
print(8 in arr, arr.index(8))
print(arr[1:3])      # 切片：取下标 1 到 2 的部分`,
        out: '[99, 12, 5, 8]\n[99, 5, 8]\nTrue 2\n[5, 8]\n',
      },
      {
        type: 'quiz',
        q: '在一个有 100 万个元素的列表里，读取 <code>arr[500000]</code> 需要大约多少步？',
        options: ['1 步', '50 万步', '100 万步', '20 步'],
        answer: 0,
        explain: '<p>数组可以直接算出第 i 个元素的位置，是 O(1)，和列表长度无关。</p>',
      },
      {
        type: 'quiz',
        q: '下面哪个操作最慢？',
        options: ['<code>arr.append(x)</code>', '<code>arr[0]</code>', '<code>arr.insert(0, x)</code>', '<code>arr.pop()</code>'],
        answer: 2,
        explain: '<p>在开头插入，后面所有元素都要往右挪一格，是 O(n)。其余三个都是 O(1)。</p>',
      },
      {
        type: 'exercise',
        title: '反转列表',
        prompt: '<p>完成 <code>reverse_list(arr)</code>，返回一个<b>新列表</b>，元素顺序和 <code>arr</code> 相反。不要使用 <code>reversed()</code>、<code>[::-1]</code> 或 <code>.reverse()</code>，用循环自己实现。</p>',
        starter: `def reverse_list(arr):
    result = []
    # 从最后一个下标 len(arr) - 1 倒着走到 0，依次 append 到 result

    return result

print(reverse_list([1, 2, 3]))`,
        solution: `def reverse_list(arr):
    result = []
    for i in range(len(arr) - 1, -1, -1):
        result.append(arr[i])
    return result`,
        tests: `expect(reverse_list([1, 2, 3]), [3, 2, 1], "reverse_list([1, 2, 3])")
expect(reverse_list([]), [], "reverse_list([])")
expect(reverse_list([5]), [5], "reverse_list([5])")
expect(reverse_list([4, 4, 1]), [1, 4, 4], "reverse_list([4, 4, 1])")`,
        hints: [
          '<code>range(start, stop, step)</code> 的第三个参数是步长，<code>range(4, -1, -1)</code> 会产生 4, 3, 2, 1, 0。',
          '循环写成 <code>for i in range(len(arr) - 1, -1, -1):</code>，循环体是 <code>result.append(arr[i])</code>。',
        ],
      },
    ],
  });

  /* ———————————— 链表 ———————————— */
  const LL = (vals) => ({ list: { nodes: DSA.items(vals), floating: null } });
  DSA.lesson({
    id: 'linked-list',
    part: P,
    title: '链表',
    glyph: '→',
    minutes: 18,
    summary: '用“指针”串起来的节点，插入快、查找慢',
    blocks: [
      {
        type: 'text',
        html: `
<p>数组要求连续的空间，插入时还得挪动别人。<strong>链表</strong>换了一种思路：每个元素（叫<strong>节点</strong>）可以放在内存的任何地方，节点里除了数据，还存着<b>下一个节点在哪</b>。</p>`,
      },
      {
        type: 'tip',
        kind: 'analogy',
        html: '<p>链表像寻宝游戏：每张纸条上写着一条线索和“下一张纸条藏在哪里”。拿到第一张（<b>头节点</b> head），就能顺着找到所有纸条；但想直接拿到第 5 张，只能从第 1 张开始一张张找。</p>',
      },
      {
        type: 'text',
        html: `
<h2>用类来定义节点</h2>
<p>Python 没有内置链表，我们用<strong>类</strong>（class）自己定义节点。类就像一个模具：<code>Node(3)</code> 会按模具造出一个节点对象。<code>__init__</code> 在创建时自动执行，<code>self</code> 指正在创建的这个对象。</p>`,
      },
      {
        type: 'code',
        code: `class Node:
    def __init__(self, val):
        self.val = val      # 节点存的数据
        self.next = None    # 指向下一个节点，一开始没有

# 手动串起 3 → 7 → 1
a = Node(3)
b = Node(7)
c = Node(1)
a.next = b
b.next = c

cur = a                     # 从头节点出发
while cur is not None:      # 走到 None 就说明到底了
    print(cur.val)
    cur = cur.next`,
        out: '3\n7\n1\n',
      },
      {
        type: 'player',
        title: '链表的插入、查找和删除',
        views: [{ type: 'linked', key: 'list', title: '链表' }],
        init: () => LL([3, 7, 1]),
        hint: '对比一下：“头部插入”只要 3 步，“尾部追加”却要从头走到尾。',
        actions: [
          {
            label: '头部插入',
            input: { kind: 'num', value: '5', label: '新节点的值', width: 4 },
            code: `def push_front(head, val):
    node = Node(val)      # 创建新节点 #@new
    node.next = head      # 新节点指向原来的头 #@link
    return node           # 新节点成为新的头 #@head`,
            run: function* (s, x) {
              const L = s.list;
              const stop = full(L.nodes.length, 8, '链表');
              if (stop) return yield stop;
              L.floating = { id: uid(), v: x, label: 'node', note: 'next = None' };
              yield { at: 'new', msg: `创建一个新节点 ${x}，它还没有连到链表上。`, vars: { val: x } };
              L.floating.note = `next → ${L.nodes.length ? L.nodes[0].v : 'None'}（原来的头）`;
              yield { at: 'link', msg: '让新节点的 next 指向原来的头节点。', hl: { cur: [0] }, vars: { val: x } };
              L.nodes.unshift({ id: L.floating.id, v: x });
              L.floating = null;
              yield { at: 'head', msg: '新节点成为新的 head。不管链表多长都只要这几步：<b>O(1)</b>。', hl: { new: [0] }, vars: { val: x } };
            },
          },
          {
            label: '尾部追加',
            input: { kind: 'num', value: '9', label: '新节点的值', width: 4 },
            code: `def append(head, val):
    node = Node(val)               #@new
    if head is None:
        return node                #@empty
    cur = head                     #@start
    while cur.next is not None:    #@loop
        cur = cur.next             # 一路走到最后一个节点 #@next
    cur.next = node                # 挂在末尾 #@link
    return head`,
            test: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
h = append(None, 1)
h = append(h, 2)
h = append(h, 3)
expect([h.val, h.next.val, h.next.next.val], [1, 2, 3], "append")`,
            run: function* (s, x) {
              const L = s.list;
              const stop = full(L.nodes.length, 8, '链表');
              if (stop) return yield stop;
              L.floating = { id: uid(), v: x, label: 'node', note: 'next = None' };
              yield { at: 'new', msg: `创建新节点 ${x}。`, vars: { val: x } };
              if (!L.nodes.length) {
                L.nodes.push({ id: L.floating.id, v: x });
                L.floating = null;
                return yield { at: 'empty', msg: '链表是空的，新节点直接成为 head。', hl: { new: [0] }, vars: { val: x } };
              }
              let i = 0;
              yield { at: 'start', msg: '只能从 head 出发往后找。', hl: { cur: [0], ptr: { cur: 0 } }, vars: { val: x } };
              while (i < L.nodes.length - 1) {
                yield { at: 'loop', msg: `cur 的 next 不是 None，还没到尾。`, hl: { cur: [i], ptr: { cur: i } }, vars: { val: x, 'cur.val': L.nodes[i].v } };
                i++;
                yield { at: 'next', msg: `cur 往后走一步，来到 ${L.nodes[i].v}。`, hl: { cur: [i], ptr: { cur: i } }, vars: { val: x, 'cur.val': L.nodes[i].v } };
              }
              yield { at: 'loop', msg: 'cur.next 是 None，cur 就是最后一个节点。', hl: { cur: [i], ptr: { cur: i } }, vars: { val: x, 'cur.val': L.nodes[i].v } };
              L.nodes.push({ id: L.floating.id, v: x });
              L.floating = null;
              yield { at: 'link', msg: `把新节点挂到末尾。走了 ${i} 步才找到尾巴，所以尾部追加是 <b>O(n)</b>。`, hl: { new: [i + 1] }, vars: { val: x } };
            },
          },
          {
            label: '查找',
            input: { kind: 'num', value: '7', label: '要查找的值', width: 4 },
            code: `def find(head, target):
    cur = head                   #@start
    while cur is not None:       #@loop
        if cur.val == target:    #@cmp
            return cur           #@found
        cur = cur.next           #@next
    return None                  #@none`,
            run: function* (s, x) {
              const N = s.list.nodes;
              yield { at: 'start', msg: '从 head 开始。', hl: { ptr: { cur: 0 } }, vars: { target: x } };
              for (let i = 0; i < N.length; i++) {
                yield { at: 'cmp', msg: `cur.val = ${N[i].v}，是 ${x} 吗？`, hl: { cmp: [i], ptr: { cur: i } }, vars: { target: x, 'cur.val': N[i].v } };
                if (N[i].v === x) return yield { at: 'found', msg: `找到了！一共看了 ${i + 1} 个节点。`, hl: { found: [i], ptr: { cur: i } }, vars: { target: x } };
                if (i < N.length - 1) yield { at: 'next', msg: '不是，沿着 next 走到下一个节点。', hl: { ptr: { cur: i + 1 } }, vars: { target: x } };
              }
              yield { at: 'none', msg: `走到 None 了，链表里没有 ${x}。查找是 <b>O(n)</b>。`, vars: { target: x } };
            },
          },
          {
            label: '删除',
            input: { kind: 'num', value: '7', label: '要删除的值', width: 4 },
            code: `def delete(head, target):
    if head is None:
        return None
    if head.val == target:              #@headcmp
        return head.next                # 删除头节点：head 后移 #@headdel
    prev = head
    while prev.next is not None:        #@loop
        if prev.next.val == target:     #@cmp
            prev.next = prev.next.next  # 跳过被删节点 #@unlink
            return head
        prev = prev.next                #@next
    return head                         # 没找到，原样返回 #@none`,
            test: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
a = Node(1)
a.next = Node(2)
a.next.next = Node(3)
h = delete(a, 2)
expect([h.val, h.next.val, h.next.next], [1, 3, None], "删除中间节点")
expect(delete(h, 1).val, 3, "删除头节点")`,
            run: function* (s, x) {
              const N = s.list.nodes;
              if (!N.length) return yield { msg: '链表是空的。' };
              yield { at: 'headcmp', msg: `先看头节点 ${N[0].v} 是不是要删的。`, hl: { cmp: [0] }, vars: { target: x } };
              if (N[0].v === x) {
                yield { at: 'headdel', msg: '要删的就是头节点：让 head 指向第二个节点即可。', hl: { del: [0] }, vars: { target: x } };
                N.shift();
                return yield { at: 'headdel', msg: '删除完成，O(1)。', vars: { target: x } };
              }
              for (let p = 0; p < N.length - 1; p++) {
                yield { at: 'cmp', msg: `prev = ${N[p].v}，看它的下一个 ${N[p + 1].v} 是不是要删的。`, hl: { cmp: [p + 1], ptr: { prev: p } }, vars: { target: x, 'prev.val': N[p].v } };
                if (N[p + 1].v === x) {
                  yield { at: 'unlink', msg: `是它！让 ${N[p].v} 的 next 直接跳过 ${x}，指向它后面的节点。`, hl: { del: [p + 1], ptr: { prev: p } }, vars: { target: x, 'prev.val': N[p].v } };
                  N.splice(p + 1, 1);
                  return yield { at: 'unlink', msg: '被跳过的节点就从链表里消失了。没有挪动任何元素，但找到它花了 O(n)。', hl: { ptr: { prev: p } }, vars: { target: x } };
                }
                yield { at: 'next', msg: 'prev 往后走一步。', hl: { ptr: { prev: p + 1 } }, vars: { target: x } };
              }
              yield { at: 'none', msg: `没有找到 ${x}，链表保持不变。`, vars: { target: x } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>数组和链表怎么选</h2>
<div class="table-wrap"><table>
<tr><th>操作</th><th>数组（列表）</th><th>链表</th></tr>
<tr><td>按位置访问第 i 个</td><td>O(1)</td><td>O(n)，要从头走</td></tr>
<tr><td>在开头插入 / 删除</td><td>O(n)，要挪动</td><td>O(1)，改指针</td></tr>
<tr><td>按值查找</td><td>O(n)</td><td>O(n)</td></tr>
<tr><td>内存</td><td>连续、紧凑</td><td>分散，每个节点多存一个指针</td></tr>
</table></div>
<p>日常写 Python 时大多直接用列表。链表的价值在于它的思想：<b>用指针把分散的东西连起来</b>。后面的树和图都建立在这个思想上。</p>`,
      },
      {
        type: 'quiz',
        q: '在链表中访问第 k 个节点，时间复杂度是？',
        options: ['O(1)', 'O(log n)', 'O(k)，也就是最坏 O(n)', 'O(n²)'],
        answer: 2,
        explain: '<p>链表只能从 head 开始一个个沿着 next 走，走 k 步才能到第 k 个。</p>',
      },
      {
        type: 'quiz',
        q: '删除链表中间的某个节点（已经拿到它的前一个节点 prev），只需要做什么？',
        options: ['把后面的节点全部往前挪', '<code>prev.next = prev.next.next</code>', '<code>prev = None</code>', '重新创建整个链表'],
        answer: 1,
        explain: '<p>让前一个节点直接指向被删节点的下一个，被删节点就从链表中“断开”了。</p>',
      },
      {
        type: 'exercise',
        title: '数一数有几个节点',
        prompt: '<p>完成 <code>count_nodes(head)</code>，返回链表中节点的个数。空链表（head 为 None）返回 0。</p>',
        starter: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def count_nodes(head):
    count = 0
    # 从 head 出发，沿着 next 一路走到 None，每经过一个节点 count 加 1

    return count

a = Node(3)
a.next = Node(7)
print(count_nodes(a))`,
        solution: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def count_nodes(head):
    count = 0
    cur = head
    while cur is not None:
        count += 1
        cur = cur.next
    return count`,
        tests: `n1 = Node(1)
n1.next = Node(2)
n1.next.next = Node(3)
expect(count_nodes(n1), 3, "count_nodes(1 → 2 → 3)")
expect(count_nodes(None), 0, "count_nodes(None)")
expect(count_nodes(Node(9)), 1, "count_nodes(9)")`,
        hints: ['参考上面“手动串起 3 → 7 → 1”的遍历代码。', '用 <code>cur = head</code> 和 <code>while cur is not None:</code>，循环里 <code>count += 1</code>、<code>cur = cur.next</code>。'],
      },
    ],
  });

  /* ———————————— 栈 ———————————— */
  DSA.lesson({
    id: 'stack',
    part: P,
    title: '栈：后进先出',
    glyph: '⊤',
    minutes: 15,
    summary: '只在一端进出，撤销、括号匹配都靠它',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>栈</strong>（stack）只允许在一端（栈顶）放入和取出数据。最后放进去的，最先被拿出来，这叫<b>后进先出</b>（LIFO, Last In First Out）。</p>
<p>生活和软件里到处都是栈：叠起来的盘子、浏览器的“后退”按钮、编辑器的“撤销”（Ctrl+Z）、程序里函数的层层调用。</p>
<p>Python 的列表天然就能当栈用：<code>append()</code> 是放入（<b>压栈 push</b>），<code>pop()</code> 是取出（<b>弹栈 pop</b>），<code>stack[-1]</code> 是偷看栈顶（<b>peek</b>）。这三个操作都是 O(1)。</p>`,
      },
      {
        type: 'player',
        title: '压栈与弹栈',
        views: [{ type: 'stack', key: 'st', title: 'stack' }],
        init: () => ({ st: DSA.items([4, 9]) }),
        actions: [
          {
            label: 'push 压栈',
            input: { kind: 'num', value: '6', label: '要压栈的值', width: 4 },
            code: `stack.append(x)    # 压栈：放到最上面 #@push`,
            run: function* (s, x) {
              const stop = full(s.st.length, 7, '栈');
              if (stop) return yield stop;
              s.st.push({ id: uid(), v: x });
              yield { at: 'push', msg: `${x} 放到了栈顶。`, hl: { new: [s.st.length - 1] }, vars: { x } };
            },
          },
          {
            label: 'pop 弹栈',
            code: `if stack:                # 先确认栈不是空的 #@check
    top = stack.pop()    # 弹栈：拿走最上面的 #@pop`,
            run: function* (s) {
              if (!s.st.length) return yield { at: 'check', msg: '栈是空的，不能再弹了。对空列表调用 pop() 会报 IndexError。' };
              const i = s.st.length - 1;
              yield { at: 'check', msg: '栈不为空，可以弹出。', hl: { pop: [i] } };
              const top = s.st.pop().v;
              yield { at: 'pop', msg: `拿走了栈顶的 ${top}。只能拿最上面的，下面的必须等它走了才轮得到。`, vars: { top } };
            },
          },
          {
            label: 'peek 看栈顶',
            code: `top = stack[-1]    # 只看不拿 #@peek`,
            run: function* (s) {
              if (!s.st.length) return yield { at: 'peek', msg: '栈是空的，没有栈顶。' };
              const i = s.st.length - 1;
              yield { at: 'peek', msg: `栈顶是 ${s.st[i].v}，它还留在栈里。`, hl: { cur: [i] }, vars: { top: s.st[i].v } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>经典应用：括号匹配</h2>
<p>代码编辑器怎么知道括号有没有写对？规则是：每个右括号必须和<b>离它最近的、还没配对的</b>左括号配对。“最近的、还没配对的”正好就是栈顶！</p>
<p>做法：从左到右扫描，遇到左括号就压栈；遇到右括号，就看栈顶是不是与它配对的左括号，是就弹出，不是就说明写错了。最后栈必须是空的。</p>`,
      },
      {
        type: 'player',
        title: '用栈检查括号',
        views: [
          { type: 'array', key: 'chars', title: '字符串', index: false },
          { type: 'stack', key: 'st', title: 'stack' },
        ],
        init: () => ({ chars: DSA.items('{[()()]}'.split('')), st: [] }),
        hint: '试试 <code>([)]</code> 或 <code>(()</code> 这样写错的括号，看看在哪一步被发现。',
        actions: [
          {
            label: '检查括号',
            fresh: true,
            input: {
              value: '{[()()]}',
              width: 9,
              label: '括号字符串',
              parse: (t) => {
                t = t.replace(/\s+/g, '');
                if (!t) throw new Error('请输入括号，例如 {[()]}');
                if (!/^[()[\]{}]+$/.test(t)) throw new Error('只能包含 ( ) [ ] { } 这几种括号');
                if (t.length > 12) throw new Error('最多 12 个括号');
                return t;
              },
            },
            code: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:                                    #@loop
        if ch in "([{":
            stack.append(ch)        # 左括号：压栈等待配对 #@push
        else:
            if not stack or stack[-1] != pairs[ch]: #@check
                return False        # 配不上，写错了 #@fail
            stack.pop()             # 配对成功，弹出 #@pop
    return len(stack) == 0          # 栈空了才算全部配对 #@end`,
            test: `expect(is_valid("{[()()]}"), True, "is_valid")
expect(is_valid("([)]"), False, "is_valid 交叉")
expect(is_valid("(()"), False, "is_valid 多左括号")
expect(is_valid(")"), False, "is_valid 多右括号")`,
            run: function* (s, text) {
              const pairs = { ')': '(', ']': '[', '}': '{' };
              s.chars = DSA.items(text.split(''));
              s.st = [];
              const ok = [];
              for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                const base = { chars: { active: [i], done: ok.slice() } };
                yield { at: 'loop', msg: `读到第 ${i + 1} 个字符 <code>${ch}</code>。`, hl: base, vars: { ch, stack: DSA.vals(s.st) } };
                if ('([{'.includes(ch)) {
                  s.st.push({ id: s.chars[i].id + 's', v: ch, i });
                  yield { at: 'push', msg: `<code>${ch}</code> 是左括号，压栈等待配对。`, hl: { ...base, st: { new: [s.st.length - 1] } }, vars: { ch, stack: DSA.vals(s.st) } };
                } else {
                  const topItem = s.st[s.st.length - 1];
                  const top = topItem ? topItem.v : null;
                  const topI = s.st.length - 1;
                  yield { at: 'check', msg: `<code>${ch}</code> 是右括号，需要栈顶是 <code>${pairs[ch]}</code>。栈顶是 ${top ? `<code>${top}</code>` : '空的'}。`, hl: { ...base, st: { cmp: [topI] } }, vars: { ch, stack: DSA.vals(s.st) } };
                  if (top !== pairs[ch]) return yield { at: 'fail', msg: '配不上，括号写错了，返回 <b>False</b>。', hl: { chars: { err: [i], done: ok }, st: { err: [topI] } }, vars: { ch, stack: DSA.vals(s.st) } };
                  s.st.pop();
                  ok.push(topItem.i, i);
                  yield { at: 'pop', msg: `配对成功，弹出 <code>${top}</code>。`, hl: { chars: { done: ok.slice() } }, vars: { ch, stack: DSA.vals(s.st) } };
                }
              }
              const good = s.st.length === 0;
              yield {
                at: 'end',
                msg: good ? '扫描结束，栈是空的，所有括号都配对了，返回 <b>True</b>。' : `扫描结束，栈里还剩 ${s.st.length} 个左括号没配对，返回 <b>False</b>。`,
                hl: { chars: good ? { done: R(0, text.length) } : { done: ok }, st: good ? {} : { err: R(0, s.st.length) } },
                vars: { stack: DSA.vals(s.st) },
              };
            },
          },
        ],
      },
      {
        type: 'quiz',
        q: '依次 push 1、2、3，然后 pop 两次，栈里还剩什么？',
        options: ['[1]', '[3]', '[1, 2]', '[2, 3]'],
        answer: 0,
        explain: '<p>后进先出：先弹出 3，再弹出 2，只剩 1。</p>',
      },
      {
        type: 'quiz',
        q: '下面哪个功能最适合用栈来实现？',
        options: ['银行叫号', '编辑器的“撤销”', '按姓名查电话', '打印机按顺序打印'],
        answer: 1,
        explain: '<p>撤销总是先撤销<b>最近</b>的一次操作，正是后进先出。叫号和打印是先来先服务，用队列。</p>',
      },
      {
        type: 'exercise',
        title: '用栈反转字符串',
        prompt: '<p>完成 <code>reverse_string(s)</code>：先把每个字符依次压栈，再不断弹栈拼成新字符串并返回。例如 <code>reverse_string("abc")</code> 返回 <code>"cba"</code>。</p>',
        starter: `def reverse_string(s):
    stack = []
    # 1. 把 s 的每个字符压栈

    result = ""
    # 2. 栈不空时不断弹栈，把弹出的字符加到 result 后面

    return result

print(reverse_string("abc"))`,
        solution: `def reverse_string(s):
    stack = []
    for ch in s:
        stack.append(ch)
    result = ""
    while stack:
        result += stack.pop()
    return result`,
        tests: `expect(reverse_string("abc"), "cba", 'reverse_string("abc")')
expect(reverse_string(""), "", 'reverse_string("")')
expect(reverse_string("上海自来水"), "水来自海上", 'reverse_string("上海自来水")')`,
        hints: ['第一步：<code>for ch in s: stack.append(ch)</code>。', '第二步：<code>while stack:</code> 表示“栈不空就继续”，循环里写 <code>result += stack.pop()</code>。'],
      },
    ],
  });

  /* ———————————— 队列 ———————————— */
  const qhl = (n, extra) => ({ ...extra, ptr: n ? { 队首: 0, 队尾: n - 1 } : {} });
  DSA.lesson({
    id: 'queue',
    part: P,
    title: '队列：先进先出',
    glyph: '⇥',
    minutes: 15,
    summary: '排队的数据结构，用 deque 实现',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>队列</strong>（queue）就是排队：新来的排到<b>队尾</b>，从<b>队首</b>离开。先来的先走，叫<b>先进先出</b>（FIFO, First In First Out）。</p>
<p>打印机的打印任务、餐厅的叫号、网站处理请求、后面要学的广度优先搜索（BFS），都是队列。</p>`,
      },
      {
        type: 'player',
        title: '入队与出队',
        views: [{ type: 'array', key: 'q', title: 'queue', index: false, empty: '（空队列）' }],
        init: () => ({ q: DSA.items([3, 8, 5]) }),
        actions: [
          {
            label: '入队',
            input: { kind: 'num', value: '7', label: '入队的值', width: 4 },
            code: `queue.append(x)          # 入队：排到队尾 #@enq`,
            run: function* (s, x) {
              const stop = full(s.q.length, 9, '队列');
              if (stop) return yield stop;
              s.q.push({ id: uid(), v: x });
              yield { at: 'enq', msg: `${x} 排到了队尾。`, hl: qhl(s.q.length, { new: [s.q.length - 1] }), vars: { x } };
            },
          },
          {
            label: '出队',
            code: `if queue:
    first = queue.popleft()  # 出队：队首离开 #@deq`,
            run: function* (s) {
              if (!s.q.length) return yield { at: 'deq', msg: '队列是空的。' };
              yield { at: 'deq', msg: `队首的 ${s.q[0].v} 最先来，所以最先离开。`, hl: qhl(s.q.length, { pop: [0] }) };
              const first = s.q.shift().v;
              yield { at: 'deq', msg: `${first} 出队了，后面的人整体往前一位。`, hl: qhl(s.q.length, {}), vars: { first } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>为什么用 deque 而不是 list</h2>
<p>用列表当队列时，出队要写 <code>queue.pop(0)</code>：删掉开头元素后，后面所有元素都要往前挪，是 O(n)。Python 标准库的 <code>collections.deque</code>（双端队列）两头进出都是 O(1)，所以队列请用 deque。</p>`,
      },
      {
        type: 'code',
        title: '一个简单的叫号系统',
        code: `from collections import deque

queue = deque()
for name in ["小明", "小红", "小刚"]:
    queue.append(name)          # 依次取号
    print(name, "取号，前面有", len(queue) - 1, "人")

while queue:                    # 队列不空就继续叫号
    print("请", queue.popleft(), "到窗口办理")`,
        out: '小明 取号，前面有 0 人\n小红 取号，前面有 1 人\n小刚 取号，前面有 2 人\n请 小明 到窗口办理\n请 小红 到窗口办理\n请 小刚 到窗口办理\n',
      },
      {
        type: 'quiz',
        q: '依次入队 A、B、C，然后出队一次，出来的是？',
        options: ['A', 'B', 'C', '都有可能'],
        answer: 0,
        explain: '<p>先进先出，最早入队的 A 最先出队。如果是栈，出来的就是 C。</p>',
      },
      {
        type: 'quiz',
        q: '用 Python 列表实现队列时，<code>queue.pop(0)</code> 的复杂度是？',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 2,
        explain: '<p>删除开头元素后，后面所有元素都要往前挪一格。所以队列要用 deque，它的 <code>popleft()</code> 是 O(1)。</p>',
      },
      {
        type: 'exercise',
        title: '约瑟夫环：谁留到最后',
        prompt: `<p>n 个人围成一圈，编号 1 到 n。从 1 号开始报数，报到 k 的人出局，下一个人重新从 1 开始报数，直到只剩一个人。完成 <code>last_one(n, k)</code>，返回最后留下的人的编号。</p>
<p>思路：用队列模拟这个圈。报数时，前 k-1 个人从队首出来、重新排到队尾；第 k 个人出队后不再回来。</p>`,
        starter: `from collections import deque

def last_one(n, k):
    queue = deque(range(1, n + 1))   # 1, 2, ..., n 依次排队
    while len(queue) > 1:
        # 前 k-1 个人：从队首出来，排到队尾

        # 第 k 个人：出局
        pass
    return queue[0]

print(last_one(5, 2))   # 应该是 3`,
        solution: `from collections import deque

def last_one(n, k):
    queue = deque(range(1, n + 1))
    while len(queue) > 1:
        for _ in range(k - 1):
            queue.append(queue.popleft())
        queue.popleft()
    return queue[0]`,
        tests: `expect(last_one(5, 2), 3, "last_one(5, 2)")
expect(last_one(7, 3), 4, "last_one(7, 3)")
expect(last_one(1, 4), 1, "last_one(1, 4)")
expect(last_one(6, 1), 6, "last_one(6, 1)")`,
        hints: [
          '“从队首出来、排到队尾”只要一行：<code>queue.append(queue.popleft())</code>。',
          '把上面这一行放进 <code>for _ in range(k - 1):</code> 循环，然后再写一行 <code>queue.popleft()</code> 让第 k 个人出局，并删掉 <code>pass</code>。',
        ],
      },
    ],
  });

  /* ———————————— 哈希表 ———————————— */
  const SIZE = 7;
  const hsum = (key) => [...key].reduce((a, ch) => a + ch.codePointAt(0), 0);
  const hinit = () => {
    const b = Array.from({ length: SIZE }, () => []);
    for (const k of ['cat', 'dog']) b[hsum(k) % SIZE].push({ id: uid(), v: k });
    return { tb: b };
  };
  const keyInput = { kind: 'text', maxLen: 8, width: 6 };
  function* hashSteps(key) {
    const total = hsum(key);
    const parts = [...key].slice(0, 4).map((ch) => `ord('${ch}')=${ch.codePointAt(0)}`).join(' + ');
    yield { at: 'sum', msg: `把每个字符的编号加起来：${parts}${key.length > 4 ? ' + …' : ''}，总和 = ${total}`, vars: { key, total } };
    yield { at: 'mod', msg: `${total} % ${SIZE} = <b>${total % SIZE}</b>，所以 "${key}" 属于 ${total % SIZE} 号桶。`, hl: { row: total % SIZE }, vars: { key, total } };
    return total % SIZE;
  }
  DSA.lesson({
    id: 'hash-table',
    part: P,
    title: '哈希表（字典与集合）',
    glyph: '#',
    minutes: 18,
    summary: '用哈希函数直接算出位置，查找平均 O(1)',
    blocks: [
      {
        type: 'text',
        html: `
<p>在列表里找一个值要逐个比较，O(n)。有没有办法像数组下标一样<b>一步定位</b>？<strong>哈希表</strong>的想法是：用一个函数把“键”直接换算成一个位置编号。</p>`,
      },
      {
        type: 'tip',
        kind: 'analogy',
        html: '<p>图书馆有 7 个书架。规定一个计算规则：把书名每个字的编号加起来，除以 7 取余数，余几就放第几号书架。找书时用同样的规则一算，直接去那个书架找，不用把整个图书馆翻一遍。这个规则就叫<b>哈希函数</b>，书架叫<b>桶</b>。</p>',
      },
      {
        type: 'player',
        title: '哈希表的存入与查找（7 个桶）',
        views: [{ type: 'hash', key: 'tb', title: 'table' }],
        init: hinit,
        hint: '表里已经有 cat 和 dog。试试存入 <code>act</code>：它和 cat 字母相同、总和相同，会落进同一个桶，这就是<b>哈希冲突</b>。',
        actions: [
          {
            label: '存入',
            input: { ...keyInput, value: 'act', label: '要存入的键' },
            code: `def my_hash(key, size):
    total = 0
    for ch in key:
        total += ord(ch)          # ord() 取字符的编号 #@sum
    return total % size           # 取余数，结果落在 0 ~ size-1 #@mod

def put(table, key):
    i = my_hash(key, len(table))  #@hash
    if key not in table[i]:       # 只需检查这一个桶 #@check
        table[i].append(key)      # 放进第 i 号桶 #@append`,
            test: `t = [[] for _ in range(7)]
put(t, "cat")
put(t, "act")
put(t, "cat")
expect(t[4], ["cat", "act"], "put 冲突")`,
            run: function* (s, key) {
              const i = yield* hashSteps(key);
              const b = s.tb[i];
              if (b.length >= 5) return yield { msg: '这个桶已经很满了，先点“恢复初始状态”吧。' };
              yield { at: 'hash', msg: `去 ${i} 号桶。`, hl: { row: i }, vars: { key, i } };
              for (let j = 0; j < b.length; j++) {
                yield { at: 'check', msg: `桶里已经有 "${b[j].v}"，和 "${key}" 一样吗？`, hl: { row: i, cmp: [i, j] }, vars: { key, i } };
                if (b[j].v === key) return yield { at: 'check', msg: `"${key}" 已经存在，不重复存入。`, hl: { found: [i, j] }, vars: { key, i } };
              }
              b.push({ id: uid(), v: key });
              yield {
                at: 'append',
                msg: b.length > 1 ? `放进 ${i} 号桶。这个桶里有 ${b.length} 个键：不同的键算出了同一个位置，叫<b>哈希冲突</b>，用链把它们串起来就好。` : `放进 ${i} 号桶。`,
                hl: { row: i, new: [i, b.length - 1] },
                vars: { key, i },
              };
            },
          },
          {
            label: '查找',
            input: { ...keyInput, value: 'dog', label: '要查找的键' },
            code: `def contains(table, key):
    i = my_hash(key, len(table))  # 同一个哈希函数 #@hash
    for item in table[i]:         # 只在这一个桶里找 #@loop
        if item == key:           #@cmp
            return True           #@found
    return False                  #@none`,
            run: function* (s, key) {
              const total = hsum(key);
              const i = total % SIZE;
              yield { at: 'hash', msg: `用同样的规则算：总和 ${total}，${total} % ${SIZE} = ${i}，直接去 ${i} 号桶。`, hl: { row: i }, vars: { key, i } };
              const b = s.tb[i];
              for (let j = 0; j < b.length; j++) {
                yield { at: 'cmp', msg: `比较 "${b[j].v}" 和 "${key}"。`, hl: { row: i, cmp: [i, j] }, vars: { key, i, item: b[j].v } };
                if (b[j].v === key) return yield { at: 'found', msg: `找到了！其他 ${SIZE - 1} 个桶完全不用看。`, hl: { found: [i, j] }, vars: { key, i } };
              }
              yield { at: 'none', msg: `${i} 号桶里没有 "${key}"，所以整张表里都没有。`, hl: { row: i }, vars: { key, i } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<p>只要哈希函数把键分散得足够均匀，每个桶里只有很少几个元素，存入、查找、删除的<b>平均复杂度都是 O(1)</b>。（如果所有键都挤进同一个桶，就退化成 O(n)，所以哈希函数的设计很重要。）</p>
<h2>Python 的 dict 和 set</h2>
<p>你不需要自己实现哈希表：Python 的<strong>字典</strong> <code>dict</code> 和<strong>集合</strong> <code>set</code> 就是高度优化过的哈希表。字典存“键 → 值”的对应关系，集合只存键，常用来去重和快速判断“在不在”。</p>`,
      },
      {
        type: 'code',
        title: '字典：键 → 值',
        code: `ages = {"小明": 18, "小红": 17}
ages["小刚"] = 19            # 添加或修改
print(ages["小明"])          # 按键查找，平均 O(1)
print("小红" in ages)        # 判断键是否存在
for name, age in ages.items():
    print(name, age)

# 统计每个字母出现的次数
counts = {}
for ch in "abracadabra":
    counts[ch] = counts.get(ch, 0) + 1   # get 取不到时返回默认值 0
print(counts)`,
        out: "18\nTrue\n小明 18\n小红 17\n小刚 19\n{'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1}\n",
      },
      {
        type: 'code',
        title: '集合：把“有没有重复”从 O(n²) 降到 O(n)',
        code: `def has_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:      # 集合查找平均 O(1)
            return True
        seen.add(x)
    return False

print(has_duplicate([3, 1, 4, 1]), has_duplicate([1, 2, 3]))`,
        out: 'True False\n',
      },
      {
        type: 'quiz',
        q: '两个不同的键经过哈希函数算出了同一个桶号，这叫什么？',
        options: ['哈希冲突', '下标越界', '死循环', '递归'],
        answer: 0,
        explain: '<p>冲突无法完全避免。常见的处理方法是让一个桶里串一条链（本课动画用的就是这种方法）。</p>',
      },
      {
        type: 'quiz',
        q: '判断一个元素是否在集合 <code>set</code> 中，平均时间复杂度是？',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 0,
        explain: '<p>集合基于哈希表，算出桶号就能直接查。而 <code>x in list</code> 是 O(n)。</p>',
      },
      {
        type: 'exercise',
        title: '两数之和',
        prompt: `<p>给定列表 <code>nums</code> 和目标值 <code>target</code>，找出和为 target 的<b>两个不同位置</b>，返回它们的下标 <code>[i, j]</code>（i &lt; j）。题目保证恰好有一个答案。</p>
<p>要求用字典做到 O(n)：遍历时，用字典记住“见过的数 → 它的下标”。对当前的数 x，如果 <code>target - x</code> 已经见过，就找到了答案。</p>`,
        starter: `def two_sum(nums, target):
    seen = {}                      # 见过的数 → 下标
    for i in range(len(nums)):
        x = nums[i]
        # 如果 target - x 在 seen 里，返回 [它的下标, i]

        # 否则把 x 记进 seen

    return []

print(two_sum([2, 7, 11, 15], 9))   # 应该是 [0, 1]`,
        solution: `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        x = nums[i]
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
        tests: `expect(two_sum([2, 7, 11, 15], 9), [0, 1], "two_sum([2, 7, 11, 15], 9)")
expect(two_sum([3, 2, 4], 6), [1, 2], "two_sum([3, 2, 4], 6)")
expect(two_sum([3, 3], 6), [0, 1], "two_sum([3, 3], 6)")
expect(two_sum([1, 5, 8, 2], 10), [2, 3], "two_sum([1, 5, 8, 2], 10)")`,
        hints: [
          '判断写成 <code>if target - x in seen:</code>，成立时 <code>return [seen[target - x], i]</code>。',
          '记录写成 <code>seen[x] = i</code>，注意要放在判断<b>之后</b>，这样同一个元素不会和自己配对。',
        ],
      },
    ],
  });
})();
