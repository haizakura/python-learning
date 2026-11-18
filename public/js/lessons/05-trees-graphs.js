/* 第五部分 · 树与图：二叉树、二叉搜索树、堆、图 */
(() => {
  const P = '树与图';
  const uid = DSA.uid;

  const TREE_CLASS = `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None     # 左孩子
        self.right = None    # 右孩子`;

  /* ———————————— 二叉树 ———————————— */
  const SAMPLE = () => ({
    nodes: {
      A: { v: 'A', l: 'B', r: 'C' },
      B: { v: 'B', l: 'D', r: 'E' },
      C: { v: 'C', l: null, r: 'F' },
      D: { v: 'D', l: null, r: null },
      E: { v: 'E', l: 'G', r: null },
      F: { v: 'F', l: null, r: null },
      G: { v: 'G', l: null, r: null },
    },
    root: 'A',
  });
  const ORDER_NAME = { pre: '前序', in: '中序', post: '后序' };
  const traversal = (order, code) => ({
    label: ORDER_NAME[order] + '遍历',
    fresh: true,
    code,
    run: function* (s) {
      const N = s.t.nodes;
      s.out = [];
      const done = [];
      const path = [];
      const hl = (id, out) => ({ t: { cur: id, path: path.slice(), done: done.slice() }, out: out || {} });
      const steps = { pre: ['visit', 'left', 'right'], in: ['left', 'visit', 'right'], post: ['left', 'right', 'visit'] }[order];
      function* go(id) {
        path.push(id);
        for (const st of steps) {
          if (st === 'visit') {
            s.out.push(N[id].v);
            done.push(id);
            yield { at: 'visit', msg: `访问节点 ${id}，输出它。`, hl: hl(id, { new: [s.out.length - 1] }), vars: { 'node.val': N[id].v } };
          } else {
            const child = N[id][st === 'left' ? 'l' : 'r'];
            const name = st === 'left' ? '左' : '右';
            if (child) {
              yield { at: st, msg: `递归处理 ${id} 的${name}子树（从 ${child} 开始）。`, hl: hl(id), vars: { 'node.val': N[id].v } };
              yield* go(child);
            } else yield { at: st, msg: `${id} 没有${name}孩子（None），直接返回。`, hl: hl(id), vars: { 'node.val': N[id].v } };
          }
        }
        path.pop();
      }
      yield* go(s.t.root);
      yield { msg: `${ORDER_NAME[order]}遍历结果：<b>${s.out.join(' ')}</b>`, hl: { t: { done: done.slice() } } };
    },
  });
  const trCode = (first, second, third) => `def traverse(node):
    if node is None:          # 空节点直接返回
        return
${first}
${second}
${third}`;
  const VISIT = '    print(node.val)           # 访问当前节点 #@visit';
  const LEFT = '    traverse(node.left)       # 遍历左子树 #@left';
  const RIGHT = '    traverse(node.right)      # 遍历右子树 #@right';

  DSA.lesson({
    id: 'binary-tree',
    part: P,
    title: '二叉树与遍历',
    glyph: '⋔',
    minutes: 18,
    summary: '前序、中序、后序和层序四种走法',
    blocks: [
      {
        type: 'text',
        html: `
<p>链表的每个节点只指向一个“下一个”。如果允许一个节点指向<b>多个</b>节点，就得到了<strong>树</strong>。家谱、公司组织架构、电脑里的文件夹，都是树形结构。</p>
<p>每个节点最多有两个孩子（左孩子、右孩子）的树，叫<strong>二叉树</strong>。几个常用的词：</p>
<ul>
  <li><b>根节点</b>：最上面的节点，没有父节点（下图的 A）。</li>
  <li><b>父节点 / 子节点</b>：B 是 D 和 E 的父节点，D 和 E 是 B 的子节点。</li>
  <li><b>叶子节点</b>：没有孩子的节点（D、G、F）。</li>
  <li><b>深度 / 高度</b>：从根往下数的层数。下图的树高度是 4（A → B → E → G）。</li>
</ul>`,
      },
      {
        type: 'code',
        title: '用代码搭出一棵树',
        code: `${TREE_CLASS}

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
print(root.val, root.left.val, root.right.val, root.left.left.val)
print(root.right.left)    # C 没有左孩子`,
        out: 'A B C D\nNone\n',
      },
      {
        type: 'text',
        html: `
<h2>深度优先遍历：前序、中序、后序</h2>
<p><strong>遍历</strong>就是按某种顺序把每个节点都访问一遍。用递归最自然：处理一个节点 = 访问它自己 + 遍历左子树 + 遍历右子树。三者的先后顺序不同，就得到三种遍历：</p>
<ul>
  <li><b>前序</b>：根 → 左 → 右（先访问根）</li>
  <li><b>中序</b>：左 → 根 → 右（根在中间）</li>
  <li><b>后序</b>：左 → 右 → 根（根最后）</li>
</ul>
<p>“前、中、后”说的都是<b>根</b>被访问的时机。切换下面的三个按钮，注意代码里三行的顺序变化。</p>`,
      },
      {
        type: 'player',
        title: '三种深度优先遍历',
        views: [
          { type: 'tree', key: 't', title: '二叉树' },
          { type: 'out', key: 'out', title: '输出顺序', empty: '（还没有输出）' },
        ],
        init: () => ({ t: SAMPLE(), out: [] }),
        actions: [traversal('pre', trCode(VISIT, LEFT, RIGHT)), traversal('in', trCode(LEFT, VISIT, RIGHT)), traversal('post', trCode(LEFT, RIGHT, VISIT))],
      },
      {
        type: 'text',
        html: `
<h2>层序遍历：一层一层来</h2>
<p>如果想从上到下、每层从左到右访问，就需要借助<b>队列</b>：先把根放进队列；每次从队首取出一个节点访问，再把它的左右孩子排到队尾。因为先进先出，上一层的节点总是比下一层先被访问。</p>`,
      },
      {
        type: 'player',
        title: '层序遍历（借助队列）',
        views: [
          { type: 'tree', key: 't', title: '二叉树' },
          { type: 'array', key: 'q', title: 'queue（左边是队首）', index: false, empty: '（空）' },
          { type: 'out', key: 'out', title: '输出顺序', empty: '（还没有输出）' },
        ],
        init: () => ({ t: SAMPLE(), q: [], out: [] }),
        actions: [
          {
            label: '层序遍历',
            fresh: true,
            code: `from collections import deque

def level_order(root):
    queue = deque([root])               #@init
    while queue:                        #@loop
        node = queue.popleft()          # 取出队首 #@pop
        print(node.val)                 #@visit
        if node.left:
            queue.append(node.left)     # 左孩子排到队尾 #@pushL
        if node.right:
            queue.append(node.right)    # 右孩子排到队尾 #@pushR`,
            run: function* (s) {
              const N = s.t.nodes;
              s.q = [{ id: 'q' + s.t.root, v: s.t.root }];
              s.out = [];
              const done = [];
              const qids = () => s.q.map((x) => x.v);
              yield { at: 'init', msg: '把根节点 A 放进队列。', hl: { t: { frontier: qids() }, q: { new: [0] } } };
              while (s.q.length) {
                const id = s.q.shift().v;
                yield { at: 'pop', msg: `取出队首 ${id}。`, hl: { t: { cur: id, done: done.slice(), frontier: qids() } } };
                s.out.push(id);
                done.push(id);
                yield { at: 'visit', msg: `访问 ${id}，输出它。`, hl: { t: { cur: id, done: done.slice(), frontier: qids() }, out: { new: [s.out.length - 1] } } };
                for (const [side, at] of [['l', 'pushL'], ['r', 'pushR']]) {
                  const c = N[id][side];
                  if (!c) continue;
                  s.q.push({ id: 'q' + c, v: c });
                  yield { at, msg: `${id} 的${side === 'l' ? '左' : '右'}孩子 ${c} 排到队尾。`, hl: { t: { cur: id, done: done.slice(), frontier: qids() }, q: { new: [s.q.length - 1] } } };
                }
              }
              yield { at: 'loop', msg: `队列空了，遍历结束：<b>${s.out.join(' ')}</b>，正好是一层一层的顺序。`, hl: { t: { done } } };
            },
          },
        ],
      },
      {
        type: 'quiz',
        q: '对上面动画里的树做<b>中序遍历</b>，第一个输出的节点是？',
        options: ['A', 'B', 'D', 'G'],
        answer: 2,
        explain: '<p>中序是“左 → 根 → 右”，要一直往左走到底，最左边的 D 最先输出。</p>',
      },
      {
        type: 'quiz',
        q: '层序遍历借助的数据结构是？',
        options: ['栈', '队列', '哈希表', '不需要任何辅助结构'],
        answer: 1,
        explain: '<p>队列先进先出，保证上一层的节点先被访问。（前序/中序/后序的递归，背后用的是调用栈。）</p>',
      },
      {
        type: 'exercise',
        title: '树的最大深度',
        prompt: `<p>完成 <code>max_depth(root)</code>，返回二叉树的层数。空树深度为 0，只有一个节点深度为 1。</p>
<p>递归思路：一棵树的深度 = 1 + 左右子树深度中较大的那个。</p>`,
        starter: `${TREE_CLASS}

def max_depth(root):
    if root is None:
        return 0
    # 分别求左、右子树的深度，取较大值再加 1
    return 1

t = TreeNode(1)
t.left = TreeNode(2)
t.left.left = TreeNode(3)
print(max_depth(t))   # 应该是 3`,
        solution: `${TREE_CLASS}

def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
        tests: `t = TreeNode(1)
t.left = TreeNode(2)
t.right = TreeNode(3)
t.left.right = TreeNode(4)
t.left.right.left = TreeNode(5)
expect(max_depth(t), 4, "max_depth(5 个节点的树)")
expect(max_depth(None), 0, "max_depth(None)")
expect(max_depth(TreeNode(7)), 1, "max_depth(单个节点)")`,
        hints: ['左子树深度是 <code>max_depth(root.left)</code>，右子树同理。', '<code>return 1 + max(max_depth(root.left), max_depth(root.right))</code>'],
      },
    ],
  });

  /* ———————————— 二叉搜索树 ———————————— */
  function bstInsert(T, x) {
    const id = 'v' + x;
    const node = { v: x, l: null, r: null };
    if (T.root === null) {
      T.nodes[id] = node;
      T.root = id;
      return id;
    }
    let cur = T.root;
    for (;;) {
      const n = T.nodes[cur];
      if (x === n.v) return null;
      const side = x < n.v ? 'l' : 'r';
      if (n[side] === null) {
        T.nodes[id] = node;
        n[side] = id;
        return id;
      }
      cur = n[side];
    }
  }
  const bstFrom = (vals) => {
    const T = { nodes: {}, root: null };
    vals.forEach((v) => bstInsert(T, v));
    return T;
  };
  const height = (T, id = T.root) => (id === null || id === undefined ? 0 : 1 + Math.max(height(T, T.nodes[id].l), height(T, T.nodes[id].r)));
  const BST_INIT = [50, 30, 70, 20, 40, 60, 80];
  const numIn = (value, label) => ({ kind: 'num', value, min: 1, max: 99, label, width: 4 });

  DSA.lesson({
    id: 'bst',
    part: P,
    title: '二叉搜索树',
    glyph: '≶',
    minutes: 15,
    summary: '左小右大，查找像二分一样快',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>二叉搜索树</strong>（Binary Search Tree, BST）是一种特殊的二叉树，每个节点都满足：</p>
<p style="text-align:center"><b>左子树的所有值 &lt; 节点的值 &lt; 右子树的所有值</b></p>
<p>有了这条规则，查找时每到一个节点比较一次，就知道该往左还是往右，另一半子树可以直接忽略。这和二分查找的思路一模一样，但树还支持高效的插入和删除。</p>`,
      },
      {
        type: 'player',
        title: '在 BST 中插入和查找',
        views: [
          { type: 'tree', key: 't', title: '二叉搜索树' },
          { type: 'out', key: 'out', title: '中序遍历结果', empty: '（点“中序遍历”查看）' },
        ],
        init: () => ({ t: bstFrom(BST_INIT), out: [] }),
        hint: '试试插入 45、查找 60。再用“依次插入建树”输入 <code>10, 20, 30, 40, 50</code>，看看按顺序插入会让树变成什么样。',
        actions: [
          {
            label: '插入',
            input: numIn('45', '要插入的值'),
            code: `def insert(node, val):
    if node is None:
        return TreeNode(val)                  # 找到空位，放这里 #@new
    if val < node.val:                        #@cmp
        node.left = insert(node.left, val)    # 比它小，往左走 #@goL
    elif val > node.val:
        node.right = insert(node.right, val)  # 比它大，往右走 #@goR
    return node                               # 相等则不重复插入 #@ret`,
            test: `${TREE_CLASS}
r = None
for v in [5, 3, 8, 4, 3]:
    r = insert(r, v)
expect([r.val, r.left.val, r.right.val, r.left.right.val, r.left.left], [5, 3, 8, 4, None], "insert")`,
            run: function* (s, x) {
              const T = s.t;
              if (Object.keys(T.nodes).length >= 15) return yield { msg: '树已经有 15 个节点了，先点“恢复初始状态”吧。' };
              if (T.root === null) {
                bstInsert(T, x);
                return yield { at: 'new', msg: `树是空的，${x} 成为根节点。`, hl: { t: { new: T.root } }, vars: { val: x } };
              }
              let cur = T.root;
              const path = [];
              for (;;) {
                const n = T.nodes[cur];
                path.push(cur);
                yield { at: 'cmp', msg: `${x} 和节点 ${n.v} 比较。`, hl: { t: { cur, path: path.slice() } }, vars: { val: x, 'node.val': n.v } };
                if (x === n.v) return yield { at: 'ret', msg: `${x} 已经在树里了，BST 不存重复值。`, hl: { t: { found: cur } }, vars: { val: x } };
                const side = x < n.v ? 'l' : 'r';
                yield { at: side === 'l' ? 'goL' : 'goR', msg: `${x} ${side === 'l' ? '<' : '>'} ${n.v}，往${side === 'l' ? '左' : '右'}走。`, hl: { t: { cur, path: path.slice() } }, vars: { val: x, 'node.val': n.v } };
                if (n[side] === null) {
                  const id = bstInsert(T, x);
                  return yield { at: 'new', msg: `${side === 'l' ? '左' : '右'}边是空位（None），把 ${x} 放在这里。只比较了 ${path.length} 次。`, hl: { t: { new: id, path } }, vars: { val: x } };
                }
                cur = n[side];
              }
            },
          },
          {
            label: '查找',
            input: numIn('60', '要查找的值'),
            code: `def search(node, target):
    while node is not None:          #@loop
        if target == node.val:       #@cmp
            return node              #@found
        if target < node.val:
            node = node.left         # 往左找 #@goL
        else:
            node = node.right        # 往右找 #@goR
    return None                      #@none`,
            test: `${TREE_CLASS}
r = TreeNode(5)
r.left = TreeNode(3)
r.right = TreeNode(8)
expect(search(r, 8).val, 8, "search 找到")
expect(search(r, 4), None, "search 找不到")`,
            run: function* (s, x) {
              const T = s.t;
              let cur = T.root;
              const path = [];
              while (cur !== null) {
                const n = T.nodes[cur];
                path.push(cur);
                yield { at: 'cmp', msg: `${x} 等于 ${n.v} 吗？`, hl: { t: { cur, path: path.slice() } }, vars: { target: x, 'node.val': n.v } };
                if (x === n.v) return yield { at: 'found', msg: `找到了！比较了 ${path.length} 次。`, hl: { t: { found: cur, path } }, vars: { target: x } };
                const side = x < n.v ? 'l' : 'r';
                yield { at: side === 'l' ? 'goL' : 'goR', msg: `${x} ${side === 'l' ? '<' : '>'} ${n.v}，只需要在${side === 'l' ? '左' : '右'}子树里找，另一边整个忽略。`, hl: { t: { cur, path: path.slice() } }, vars: { target: x, 'node.val': n.v } };
                cur = n[side];
              }
              yield { at: 'none', msg: `走到了空位，说明 ${x} 不在树里。`, hl: { t: { path } }, vars: { target: x } };
            },
          },
          {
            label: '中序遍历',
            code: `def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.val)          # 左 → 根 → 右 #@visit
    inorder(node.right)`,
            run: function* (s) {
              const T = s.t;
              s.out = [];
              const done = [];
              function* go(id) {
                if (id === null) return;
                yield* go(T.nodes[id].l);
                s.out.push(T.nodes[id].v);
                done.push(id);
                yield { at: 'visit', msg: `输出 ${T.nodes[id].v}`, hl: { t: { cur: id, done: done.slice() }, out: { new: [s.out.length - 1] } } };
                yield* go(T.nodes[id].r);
              }
              yield* go(T.root);
              yield { msg: '中序遍历 BST，得到的正好是<b>从小到大排好序</b>的序列。', hl: { t: { done } } };
            },
          },
          {
            label: '依次插入建树',
            input: { kind: 'nums', value: BST_INIT.join(', '), min: 1, max: 99, maxLen: 10, label: '按顺序插入的数字', random: DSA.randInput(8, 1, 99) },
            code: `root = None
for x in nums:
    root = insert(root, x)    # 按顺序逐个插入 #@new`,
            run: function* (s, nums) {
              s.t = { nodes: {}, root: null };
              s.out = [];
              for (const x of nums) {
                const id = bstInsert(s.t, x);
                yield { at: 'new', msg: id ? `插入 ${x}。` : `${x} 重复了，跳过。`, hl: { t: { new: id } }, vars: { x } };
              }
              const n = Object.keys(s.t.nodes).length;
              const h = height(s.t);
              yield {
                msg: `建好了：${n} 个节点，高度 ${h}。` + (n > 2 && h === n ? '每个节点都只有一个孩子，树<b>退化成了链表</b>，查找变成 O(n)！' : h <= Math.ceil(Math.log2(n + 1)) + 1 ? '树比较“矮胖”，查找很快。' : ''),
                vars: { 节点数: n, 高度: h },
              };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>复杂度取决于树的高度</h2>
<p>查找和插入都是从根走到某个节点，步数等于树的高度 h，所以是 <b>O(h)</b>。</p>
<ul>
  <li>树比较平衡（矮胖）时，h ≈ log₂ n，操作是 O(log n)，100 万个节点只要约 20 步。</li>
  <li>如果按从小到大的顺序插入，每个新节点都挂在最右边，树退化成一条链，h = n，操作变成 O(n)。</li>
</ul>
<p>为了避免退化，人们发明了能自动保持平衡的树，比如 AVL 树和红黑树。它们的规则更复杂，但核心思想就是这一课的“左小右大”。</p>`,
      },
      {
        type: 'quiz',
        q: '对一棵二叉搜索树做<b>中序遍历</b>，得到的序列有什么特点？',
        options: ['是随机的', '从小到大有序', '从大到小有序', '根节点总是第一个'],
        answer: 1,
        explain: '<p>中序是“左 → 根 → 右”，而 BST 中左边都比根小、右边都比根大，所以输出正好有序。</p>',
      },
      {
        type: 'quiz',
        q: '依次插入 1, 2, 3, 4, 5 得到的 BST，查找 5 需要比较几次？',
        options: ['1 次', '3 次', '5 次', '25 次'],
        answer: 2,
        explain: '<p>按顺序插入会让树退化成一条向右的链，5 在最底下，要从根开始比较 5 次。</p>',
      },
      {
        type: 'exercise',
        title: '找最小值',
        prompt: '<p>完成 <code>find_min(root)</code>，返回二叉搜索树中的最小值（树不为空）。想一想：最小的值一定在哪里？</p>',
        starter: `${TREE_CLASS}

def find_min(root):
    node = root
    # 根据“左小右大”，一路往某个方向走到底

    return node.val

r = TreeNode(50)
r.left = TreeNode(30)
r.left.left = TreeNode(20)
print(find_min(r))   # 应该是 20`,
        solution: `${TREE_CLASS}

def find_min(root):
    node = root
    while node.left is not None:
        node = node.left
    return node.val`,
        tests: `r = TreeNode(50)
r.left = TreeNode(30)
r.right = TreeNode(70)
r.left.left = TreeNode(20)
r.left.left.right = TreeNode(25)
expect(find_min(r), 20, "find_min")
expect(find_min(TreeNode(8)), 8, "find_min(单个节点)")
r2 = TreeNode(5)
r2.right = TreeNode(9)
expect(find_min(r2), 5, "find_min(没有左孩子)")`,
        hints: ['比根小的都在左边，所以一直往左走，直到没有左孩子为止。', '<code>while node.left is not None: node = node.left</code>'],
      },
    ],
  });

  /* ———————————— 堆 ———————————— */
  DSA.lesson({
    id: 'heap',
    part: P,
    title: '堆与优先队列',
    glyph: '△',
    minutes: 15,
    summary: '随时取出最小值，用数组存一棵树',
    blocks: [
      {
        type: 'text',
        html: `
<p>医院急诊不是按先来后到看病，而是<b>病情最重的先看</b>。这种“每次取出优先级最高的元素”的结构叫<strong>优先队列</strong>，它通常用<strong>堆</strong>来实现。</p>
<p><strong>最小堆</strong>是一棵满足下面两条规则的二叉树：</p>
<ul>
  <li><b>形状规则</b>：除了最后一层，每层都是满的，最后一层从左往右排（叫完全二叉树）。</li>
  <li><b>大小规则</b>：每个节点都<b>不大于</b>它的孩子。所以最小值永远在根（堆顶）。</li>
</ul>
<p>因为形状很规整，堆可以直接存在一个<b>数组</b>里，不需要指针：下标 i 的节点，左孩子在 <code>2*i + 1</code>，右孩子在 <code>2*i + 2</code>，父节点在 <code>(i - 1) // 2</code>。动画里同时画出了树的样子和实际的数组。</p>`,
      },
      {
        type: 'player',
        title: '入堆（上浮）与出堆（下沉）',
        views: [
          { type: 'heaptree', key: 'h', title: '堆（树的样子，方括号里是数组下标）' },
          { type: 'array', key: 'h', title: '堆（实际存储的数组）' },
          { type: 'out', key: 'out', title: '已弹出的值', empty: '（还没有）' },
        ],
        init: () => ({ h: DSA.items([2, 5, 3, 9, 7, 8, 4]), out: [] }),
        hint: '先入堆一个 1，看它怎么一路“上浮”到堆顶；再连续出堆几次，弹出的值总是当前最小的。',
        actions: [
          {
            label: '入堆 push',
            input: numIn('1', '要加入的值'),
            code: `def push(heap, x):
    heap.append(x)                         # 先放到末尾 #@append
    i = len(heap) - 1
    while i > 0:                           #@loop
        parent = (i - 1) // 2              #@parent
        if heap[i] >= heap[parent]:        #@cmp
            break                          # 不比父节点小，停止 #@stop
        heap[i], heap[parent] = heap[parent], heap[i]   # 上浮 #@swap
        i = parent`,
            test: `h = []
for v in [5, 3, 8, 1]:
    push(h, v)
expect(h[0], 1, "push 后堆顶是最小值")
expect(len(h), 4, "push 后的长度")`,
            run: function* (s, x) {
              const h = s.h;
              if (h.length >= 15) return yield { msg: '堆已经有 15 个元素了，先出堆几次吧。' };
              h.push({ id: uid(), v: x });
              let i = h.length - 1;
              yield { at: 'append', msg: `先把 ${x} 放到数组末尾，也就是树的最后一个位置。`, hl: { h: { new: [i] } }, vars: { x, i } };
              while (i > 0) {
                const p = (i - 1) >> 1;
                yield { at: 'parent', msg: `它的父节点下标是 (${i} - 1) // 2 = ${p}，值是 ${h[p].v}。`, hl: { h: { new: [i], active: [p] } }, vars: { x, i, parent: p } };
                yield { at: 'cmp', msg: `${h[i].v} >= ${h[p].v} 吗？`, hl: { h: { cmp: [i, p] } }, vars: { x, i, parent: p } };
                if (h[i].v >= h[p].v) return yield { at: 'stop', msg: '不比父节点小，堆的规则已经满足，停止上浮。', hl: { h: { done: [i] } }, vars: { x, i } };
                [h[i], h[p]] = [h[p], h[i]];
                yield { at: 'swap', msg: `${h[p].v} 比父节点小，交换，往上浮一层。`, hl: { h: { swap: [i, p] } }, vars: { x, i, parent: p } };
                i = p;
              }
              yield { at: 'loop', msg: `已经浮到堆顶（下标 0），${x} 是新的最小值。上浮最多走树的高度那么多步：O(log n)。`, hl: { h: { done: [0] } }, vars: { x, i } };
            },
          },
          {
            label: '出堆 pop',
            code: `def pop(heap):
    top = heap[0]                          # 堆顶就是最小值 #@top
    last = heap.pop()                      # 取下末尾元素 #@last
    if heap:
        heap[0] = last                     # 放到堆顶 #@move
        i = 0
        while True:
            small = i
            l, r = 2 * i + 1, 2 * i + 2
            if l < len(heap) and heap[l] < heap[small]:    #@cmpL
                small = l
            if r < len(heap) and heap[r] < heap[small]:    #@cmpR
                small = r
            if small == i:
                break                      # 比孩子都小，停止 #@stop
            heap[i], heap[small] = heap[small], heap[i]    # 下沉 #@swap
            i = small
    return top                             #@ret`,
            test: `h = [1, 3, 2, 7, 4, 5]
out = [pop(h) for _ in range(6)]
expect(out, [1, 2, 3, 4, 5, 7], "连续 pop 得到有序序列")`,
            run: function* (s) {
              const h = s.h;
              if (!h.length) return yield { msg: '堆已经空了。' };
              const top = h[0].v;
              yield { at: 'top', msg: `堆顶 ${top} 就是最小值，把它取出来。`, hl: { h: { pop: [0] } }, vars: { top } };
              s.out.push(top);
              const last = h.pop();
              if (!h.length) return yield { at: 'ret', msg: `堆空了，返回 ${top}。`, hl: { out: { new: [s.out.length - 1] } }, vars: { top } };
              yield { at: 'last', msg: `取下末尾元素 ${last.v}，准备用它填补堆顶的空缺。`, hl: { h: { pop: [0] }, out: { new: [s.out.length - 1] } }, vars: { top, last: last.v } };
              h[0] = last;
              yield { at: 'move', msg: `${last.v} 放到堆顶。它可能比孩子大，需要“下沉”。`, hl: { h: { active: [0] } }, vars: { top, last: last.v } };
              let i = 0;
              for (;;) {
                const l = 2 * i + 1;
                const r = 2 * i + 2;
                let small = i;
                if (l < h.length) {
                  yield { at: 'cmpL', msg: `和左孩子 ${h[l].v} 比较。`, hl: { h: { active: [i], cmp: [small, l] } }, vars: { i, small } };
                  if (h[l].v < h[small].v) small = l;
                }
                if (r < h.length) {
                  yield { at: 'cmpR', msg: `再和右孩子 ${h[r].v} 比较，找出三者中最小的。`, hl: { h: { active: [i], cmp: [small, r] } }, vars: { i, small } };
                  if (h[r].v < h[small].v) small = r;
                }
                if (small === i) {
                  yield { at: 'stop', msg: l < h.length ? '它不比任何孩子大，停止下沉。' : '它已经没有孩子了，停止下沉。', hl: { h: { done: [i] } }, vars: { i } };
                  break;
                }
                [h[i], h[small]] = [h[small], h[i]];
                yield { at: 'swap', msg: `和更小的孩子 ${h[i].v} 交换，往下沉一层。`, hl: { h: { swap: [i, small] } }, vars: { i, small } };
                i = small;
              }
              yield { at: 'ret', msg: `返回 ${top}。堆顶现在是新的最小值 ${h[0].v}。下沉同样是 O(log n)。`, hl: { h: { found: [0] }, out: { new: [s.out.length - 1] } }, vars: { top } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<div class="table-wrap"><table>
<tr><th>操作</th><th>复杂度</th></tr>
<tr><td>查看最小值 <code>heap[0]</code></td><td>O(1)</td></tr>
<tr><td>入堆 / 出堆</td><td>O(log n)</td></tr>
<tr><td>把整个列表变成堆 <code>heapify</code></td><td>O(n)</td></tr>
</table></div>
<p>Python 的 <code>heapq</code> 模块就是最小堆，直接在普通列表上操作。把元组放进堆时，会先比较第一个元素，所以常写成 <code>(优先级, 内容)</code>。</p>`,
      },
      {
        type: 'code',
        title: '用 heapq 实现任务优先队列',
        code: `import heapq

tasks = []
heapq.heappush(tasks, (3, "写作业"))
heapq.heappush(tasks, (1, "吃饭"))
heapq.heappush(tasks, (2, "洗澡"))
while tasks:
    priority, name = heapq.heappop(tasks)   # 每次取出数字最小的
    print(priority, name)

nums = [5, 1, 8, 3, 9, 2]
heapq.heapify(nums)          # 把列表原地变成堆
print(nums[0])               # 堆顶是最小值`,
        out: '1 吃饭\n2 洗澡\n3 写作业\n1\n',
      },
      {
        type: 'quiz',
        q: '堆存放在数组里，下标为 5 的节点，它的父节点下标是？',
        options: ['1', '2', '3', '4'],
        answer: 1,
        explain: '<p>父节点下标 = (5 - 1) // 2 = 2。反过来，下标 2 的孩子是 5 和 6。</p>',
      },
      {
        type: 'quiz',
        q: '最小堆中，下面哪个说法一定成立？',
        options: ['数组是从小到大排好序的', '堆顶是最小值', '左孩子一定比右孩子小', '最大值一定在最后一个位置'],
        answer: 1,
        explain: '<p>堆只保证每个节点不大于它的孩子，所以根最小；但兄弟之间、不同分支之间没有大小关系，数组整体也不是有序的。</p>',
      },
      {
        type: 'exercise',
        title: '最小的 k 个数',
        prompt: '<p>完成 <code>k_smallest(nums, k)</code>，返回列表中最小的 k 个数（从小到大）。请使用 <code>heapq</code>：先把列表变成堆，再弹出 k 次。不要修改传入的 <code>nums</code>，先复制一份：<code>heap = nums[:]</code>。</p>',
        starter: `import heapq

def k_smallest(nums, k):
    heap = nums[:]            # 复制一份，不改动原列表
    # 1. 用 heapq.heapify 把 heap 变成堆
    # 2. 弹出 k 次，依次放进 result
    result = []
    return result

print(k_smallest([5, 1, 8, 3, 9, 2], 3))   # 应该是 [1, 2, 3]`,
        solution: `import heapq

def k_smallest(nums, k):
    heap = nums[:]
    heapq.heapify(heap)
    result = []
    for _ in range(k):
        result.append(heapq.heappop(heap))
    return result`,
        tests: `data = [5, 1, 8, 3, 9, 2]
expect(k_smallest(data, 3), [1, 2, 3], "k_smallest(data, 3)")
expect(data, [5, 1, 8, 3, 9, 2], "原列表 data 不应该被修改")
expect(k_smallest([4, 4, 1], 2), [1, 4], "k_smallest([4, 4, 1], 2)")
expect(k_smallest([7], 0), [], "k_smallest([7], 0)")`,
        hints: ['第 1 步：<code>heapq.heapify(heap)</code>。', '第 2 步：<code>for _ in range(k): result.append(heapq.heappop(heap))</code>。'],
      },
    ],
  });

  /* ———————————— 图 ———————————— */
  const GRAPH = {
    nodes: [
      { id: 'A', x: 45, y: 130 },
      { id: 'B', x: 135, y: 55 },
      { id: 'C', x: 135, y: 205 },
      { id: 'D', x: 225, y: 130 },
      { id: 'E', x: 270, y: 40 },
      { id: 'F', x: 270, y: 220 },
      { id: 'G', x: 360, y: 130 },
    ],
    edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'D'], ['C', 'F'], ['D', 'G'], ['E', 'G'], ['F', 'G']],
  };
  const ADJ = {};
  GRAPH.nodes.forEach((n) => (ADJ[n.id] = []));
  GRAPH.edges.forEach(([a, b]) => {
    ADJ[a].push(b);
    ADJ[b].push(a);
  });
  Object.values(ADJ).forEach((l) => l.sort());
  const ADJ_PY = 'graph = {\n' + Object.keys(ADJ).map((k) => `    "${k}": [${ADJ[k].map((x) => `"${x}"`).join(', ')}],`).join('\n') + '\n}';
  const startIn = {
    value: 'A',
    width: 3,
    label: '起点（A~G）',
    parse: (t) => {
      t = t.trim().toUpperCase();
      if (!ADJ[t]) throw new Error('起点请输入 A 到 G 中的一个字母');
      return t;
    },
  };

  DSA.lesson({
    id: 'graph',
    part: P,
    title: '图：广度优先与深度优先',
    glyph: '◇',
    minutes: 20,
    summary: '地图和社交网络，BFS 与 DFS 两种搜索',
    blocks: [
      {
        type: 'text',
        html: `
<p>树有严格的上下级关系。如果任意两个点之间都可以相连，就得到了<strong>图</strong>：地铁线路、社交网络里的好友关系、网页之间的链接，都是图。</p>
<ul>
  <li><b>顶点</b>（节点）：图中的点，比如地铁站。</li>
  <li><b>边</b>：两个顶点之间的连线，比如两站之间的轨道。边可以有方向（有向图，像微博关注），也可以有权重（带权图，像两站之间的距离）。</li>
  <li><b>邻居</b>：和某个顶点直接相连的顶点。</li>
</ul>
<p>在 Python 里，最常用的表示方法是<strong>邻接表</strong>：一个字典，键是顶点，值是它的邻居列表。</p>`,
      },
      {
        type: 'code',
        title: '下面动画里那张图的邻接表',
        code: `${ADJ_PY}

print(graph["B"])        # B 的邻居
print(len(graph))        # 顶点个数
print("G" in graph["A"]) # A 和 G 直接相连吗？`,
        out: "['A', 'D', 'E']\n7\nFalse\n",
      },
      {
        type: 'text',
        html: `
<h2>广度优先搜索（BFS）</h2>
<p>往平静的水面扔一颗石子，波纹一圈圈向外扩散。<strong>BFS</strong> 就是这样：先访问起点，再访问所有离起点 1 步的顶点，然后是 2 步的……它借助<b>队列</b>实现，并用 <code>visited</code> 集合记住已经发现过的顶点，避免绕圈子重复访问。</p>`,
      },
      {
        type: 'player',
        title: 'BFS：一圈一圈向外扩散',
        views: [
          { type: 'graph', key: 'g', title: '图' },
          { type: 'array', key: 'fr', title: 'queue（左边是队首）', index: false, empty: '（空）' },
          { type: 'out', key: 'order', title: '访问顺序', empty: '（还没有）' },
        ],
        init: () => ({ g: GRAPH, fr: [], order: [] }),
        hint: '黄色虚线 = 在队列里排队，黄色实线 = 正在处理，绿色 = 已访问。',
        actions: [
          {
            label: 'BFS 遍历',
            fresh: true,
            input: startIn,
            code: `from collections import deque

def bfs(graph, start):
    visited = {start}                  # 已经发现过的顶点 #@init
    queue = deque([start])
    order = []
    while queue:                       #@loop
        node = queue.popleft()         # 取出队首 #@pop
        order.append(node)             #@visit
        for nb in graph[node]:         # 看每个邻居
            if nb not in visited:      #@check
                visited.add(nb)
                queue.append(nb)       # 没发现过的邻居排到队尾 #@push
    return order                       #@done`,
            test: `${ADJ_PY}
expect(bfs(graph, "A"), ["A", "B", "C", "D", "E", "F", "G"], "bfs 从 A 出发")`,
            run: function* (s, start) {
              s.fr = [{ id: 'q' + start, v: start }];
              s.order = [];
              const visited = new Set([start]);
              const hl = (cur, extra) => ({ g: { cur, visited: s.order.slice(), frontier: s.fr.map((x) => x.v), ...extra } });
              yield { at: 'init', msg: `从 ${start} 出发：标记 ${start} 为已发现，放进队列。`, hl: { ...hl(null), fr: { new: [0] } }, vars: { visited: [...visited] } };
              while (s.fr.length) {
                const node = s.fr.shift().v;
                yield { at: 'pop', msg: `取出队首 ${node}。`, hl: hl(node), vars: { node, visited: [...visited] } };
                s.order.push(node);
                yield { at: 'visit', msg: `访问 ${node}。`, hl: { ...hl(node), order: { new: [s.order.length - 1] } }, vars: { node, visited: [...visited] } };
                for (const nb of ADJ[node]) {
                  const seen = visited.has(nb);
                  yield { at: 'check', msg: `${node} 的邻居 ${nb}：${seen ? '已经发现过了，跳过。' : '还没发现过。'}`, hl: hl(node, { edge: [node, nb] }), vars: { node, nb, visited: [...visited] } };
                  if (!seen) {
                    visited.add(nb);
                    s.fr.push({ id: 'q' + nb, v: nb });
                    yield { at: 'push', msg: `${nb} 标记为已发现，排到队尾。`, hl: { ...hl(node, { edge: [node, nb] }), fr: { new: [s.fr.length - 1] } }, vars: { node, nb, visited: [...visited] } };
                  }
                }
              }
              yield { at: 'done', msg: `队列空了，遍历结束：<b>${s.order.join(' → ')}</b>。顶点是按离 ${start} 由近到远的顺序被访问的。`, hl: hl(null), vars: { visited: [...visited] } };
            },
          },
        ],
      },
      {
        type: 'tip',
        kind: 'key',
        html: '<p>因为 BFS 是由近到远一层层扩展的，在边没有权重的图里，<b>BFS 第一次到达某个顶点时走的就是最短路径</b>。导航软件找“换乘最少”的路线，用的就是这个思路。</p>',
      },
      {
        type: 'text',
        html: `
<h2>深度优先搜索（DFS）</h2>
<p>走迷宫时，你可能会选一条路一直走到底，走不通了再退回上一个路口，换另一条路。这就是<strong>DFS</strong>：沿着一个邻居一直深入，直到没有新的顶点可去，再<b>回溯</b>。用递归写非常简洁，背后依靠的是调用栈。</p>`,
      },
      {
        type: 'player',
        title: 'DFS：一条路走到底，再回头',
        views: [
          { type: 'graph', key: 'g', title: '图' },
          { type: 'stack', key: 'calls', title: '调用栈', topLabel: '← 正在执行', empty: '（空）' },
          { type: 'out', key: 'order', title: '访问顺序', empty: '（还没有）' },
        ],
        init: () => ({ g: GRAPH, calls: [], order: [] }),
        actions: [
          {
            label: 'DFS 遍历',
            fresh: true,
            input: startIn,
            code: `def dfs(graph, node, visited):
    visited.append(node)               # 访问当前顶点 #@visit
    for nb in graph[node]:
        if nb not in visited:          #@check
            dfs(graph, nb, visited)    # 深入这个邻居 #@call
    return visited                     # 邻居都看完了，回溯 #@ret`,
            test: `${ADJ_PY}
expect(dfs(graph, "A", []), ["A", "B", "D", "C", "F", "G", "E"], "dfs 从 A 出发")`,
            run: function* (s, start) {
              s.calls = [];
              s.order = [];
              const stackIds = () => s.calls.map((c) => c.node);
              const hl = (cur, extra) => ({ g: { cur, visited: s.order.slice(), path: stackIds(), ...extra }, calls: { active: [s.calls.length - 1] } });
              function* dfs(node) {
                s.calls.push({ id: 'c' + node, v: `dfs(${node})`, node });
                s.order.push(node);
                yield { at: 'visit', msg: `访问 ${node}。`, hl: { ...hl(node), order: { new: [s.order.length - 1] } }, vars: { node, visited: s.order.slice() } };
                for (const nb of ADJ[node]) {
                  const seen = s.order.includes(nb);
                  yield { at: 'check', msg: `${node} 的邻居 ${nb}：${seen ? '已经访问过，跳过。' : '还没访问过，深入它！'}`, hl: hl(node, { edge: [node, nb] }), vars: { node, nb, visited: s.order.slice() } };
                  if (!seen) {
                    yield { at: 'call', msg: `调用 dfs(${nb})，${node} 暂停等待。`, hl: hl(node, { edge: [node, nb] }), vars: { node, nb, visited: s.order.slice() } };
                    yield* dfs(nb);
                    yield { at: 'check', msg: `dfs(${nb}) 返回了，回到 ${node}，继续看它的下一个邻居。`, hl: hl(node), vars: { node, visited: s.order.slice() } };
                  }
                }
                yield { at: 'ret', msg: `${node} 的邻居都处理完了，返回（回溯）。`, hl: hl(node), vars: { node, visited: s.order.slice() } };
                s.calls.pop();
              }
              yield* dfs(start);
              yield { msg: `遍历结束：<b>${s.order.join(' → ')}</b>。和 BFS 的顺序不同：DFS 会先沿着一条路走得很深。`, hl: { g: { visited: s.order.slice() } } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<div class="table-wrap"><table>
<tr><th></th><th>BFS 广度优先</th><th>DFS 深度优先</th></tr>
<tr><td>辅助结构</td><td>队列</td><td>栈（通常是递归的调用栈）</td></tr>
<tr><td>访问顺序</td><td>由近到远，一层一层</td><td>一条路走到底，再回溯</td></tr>
<tr><td>擅长</td><td>无权图的最短路径、按层处理</td><td>走迷宫、找所有路径、判断连通</td></tr>
<tr><td>复杂度</td><td colspan="2">都是 O(V + E)：每个顶点和每条边各处理常数次（V 是顶点数，E 是边数）</td></tr>
</table></div>`,
      },
      {
        type: 'quiz',
        q: 'BFS 用来记录“接下来要访问哪些顶点”的数据结构是？',
        options: ['栈', '队列', '堆', '二叉搜索树'],
        answer: 1,
        explain: '<p>先发现的顶点先访问，先进先出，所以是队列。把队列换成栈，访问顺序就变成深度优先了。</p>',
      },
      {
        type: 'quiz',
        q: '为什么 BFS 和 DFS 都需要 visited 来记录访问过的顶点？',
        options: ['为了让代码更短', '图里可能有环，不记录的话会绕圈子无限重复', '为了按字母顺序输出', 'Python 语法要求'],
        answer: 1,
        explain: '<p>比如 A-B-D-C-A 形成了一个环，不记录的话会在里面一直转下去。树没有环，所以遍历树时不需要 visited。</p>',
      },
      {
        type: 'exercise',
        title: '两个顶点之间有路吗',
        prompt: '<p>完成 <code>has_path(graph, start, goal)</code>：如果从 start 出发能走到 goal，返回 <code>True</code>，否则返回 <code>False</code>。可以在 BFS 的基础上修改：取出一个顶点时，如果它就是 goal，直接返回 True。</p>',
        starter: `from collections import deque

def has_path(graph, start, goal):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        # 1. 如果 node 就是 goal，返回 True

        # 2. 把没访问过的邻居标记并排进队列

    return False

g = {"A": ["B"], "B": ["A", "C"], "C": ["B"], "D": []}
print(has_path(g, "A", "C"))   # 应该是 True`,
        solution: `from collections import deque

def has_path(graph, start, goal):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == goal:
            return True
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return False`,
        tests: `g = {"A": ["B"], "B": ["A", "C"], "C": ["B"], "D": ["E"], "E": ["D"]}
expect(has_path(g, "A", "C"), True, 'has_path(g, "A", "C")')
expect(has_path(g, "A", "D"), False, 'has_path(g, "A", "D")')
expect(has_path(g, "D", "E"), True, 'has_path(g, "D", "E")')
expect(has_path(g, "B", "B"), True, 'has_path(g, "B", "B")')`,
        hints: ['第 1 步：<code>if node == goal: return True</code>。', '第 2 步和动画里的 BFS 一样：<code>for nb in graph[node]:</code>，没在 visited 里就 <code>visited.add(nb)</code> 并 <code>queue.append(nb)</code>。'],
      },
    ],
  });
})();
