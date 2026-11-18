/* 第三部分 · 算法思想：递归、二分查找 */
(() => {
  const P = '算法思想';
  const R = DSA.range;
  const uid = DSA.uid;

  /* ———————————— 递归 ———————————— */
  DSA.lesson({
    id: 'recursion',
    part: P,
    title: '递归：自己调用自己',
    glyph: '↺',
    minutes: 18,
    summary: '把大问题拆成同样的小问题',
    blocks: [
      {
        type: 'text',
        html: `<p><strong>递归</strong>是指一个函数在内部调用它自己。听起来像绕口令，但它是解决很多问题最自然的方式：把一个大问题，拆成<b>同样类型、但规模更小</b>的问题。</p>`,
      },
      {
        type: 'tip',
        kind: 'analogy',
        html: '<p>在漆黑的电影院里，你想知道自己坐第几排。你问前一排的人：“你是第几排？”他也不知道，于是又问他前一排……一直问到第一排，那个人说“我是第 1 排”。答案再一排排传回来，每个人在听到的数字上加 1，最后传到你这里。</p>',
      },
      {
        type: 'text',
        html: `
<p>每个递归函数都由两部分组成：</p>
<ul>
  <li><b>基线条件</b>：问题已经小到可以直接回答，不再调用自己（第一排的人直接说“1”）。</li>
  <li><b>递归条件</b>：把问题变小一点，调用自己去解决，再用它的结果算出当前的答案（“前一排的答案 + 1”）。</li>
</ul>`,
      },
      {
        type: 'code',
        title: '倒计时',
        code: `def countdown(n):
    if n == 0:            # 基线条件
        print("发射！")
        return
    print(n)
    countdown(n - 1)      # 递归条件：问题规模变小

countdown(3)`,
        out: '3\n2\n1\n发射！\n',
      },
      {
        type: 'text',
        html: `
<h2>调用栈：递归背后的秘密</h2>
<p>阶乘 <code>n! = n × (n-1) × … × 1</code> 可以写成 <code>fact(n) = n × fact(n-1)</code>。函数调用自己时，当前这一层并没有结束，而是<b>暂停</b>下来等结果。电脑用一个栈（就是上一部分学的栈）来记住所有暂停的调用，叫<strong>调用栈</strong>。</p>`,
      },
      {
        type: 'player',
        title: '看调用栈一层层压入、再一层层返回',
        views: [
          { type: 'stack', key: 'calls', title: '调用栈', topLabel: '← 正在执行', empty: '（空）' },
          { type: 'out', key: 'result', title: '结果', empty: '（还没算完）' },
        ],
        init: () => ({ calls: [], result: null }),
        actions: [
          {
            label: '计算 fact(n)',
            fresh: true,
            input: { kind: 'num', value: '4', min: 1, max: 6, label: 'n（1 到 6）', width: 4 },
            code: `def fact(n):
    if n <= 1:                 # 基线条件：不再往下调用 #@base
        return 1               #@ret1
    return n * fact(n - 1)     # 递归调用：问题规模变小 #@call`,
            test: `expect(fact(5), 120, "fact(5)")
expect(fact(1), 1, "fact(1)")`,
            run: function* (s, n) {
              s.calls = [];
              s.result = null;
              const vars = () => ({ 调用层数: s.calls.length });
              function* call(k) {
                s.calls.push({ id: uid(), v: `fact(${k})` });
                const top = s.calls.length - 1;
                yield { at: 'base', msg: `调用 fact(${k})，新的一层压入调用栈。先检查 ${k} <= 1 吗？`, hl: { calls: { active: [top] } }, vars: { n: k, ...vars() } };
                if (k <= 1) {
                  s.calls[top].v = `fact(${k}) = 1`;
                  yield { at: 'ret1', msg: '到达<b>基线条件</b>，直接返回 1，不再继续调用。', hl: { calls: { done: [top] } }, vars: { n: k, ...vars() } };
                  s.calls.pop();
                  return 1;
                }
                s.calls[top].v = `fact(${k}) = ${k} × fact(${k - 1})`;
                yield { at: 'call', msg: `${k} > 1，需要先算出 fact(${k - 1})。fact(${k}) 暂停，等待结果。`, hl: { calls: { cmp: [top] } }, vars: { n: k, ...vars() } };
                const sub = yield* call(k - 1);
                const r = k * sub;
                s.calls[top].v = `fact(${k}) = ${k} × ${sub} = ${r}`;
                yield { at: 'call', msg: `fact(${k - 1}) 返回了 ${sub}，fact(${k}) 继续执行：${k} × ${sub} = ${r}。`, hl: { calls: { done: [top] } }, vars: { n: k, ...vars() } };
                s.calls.pop();
                return r;
              }
              const r = yield* call(n);
              s.result = [`fact(${n}) = ${r}`];
              yield { msg: `最外层返回，调用栈清空。最终结果 <b>${r}</b>。`, hl: { result: { found: [0] } }, vars: { 结果: r } };
            },
          },
        ],
      },
      {
        type: 'tip',
        kind: 'warn',
        html: '<p>忘记写基线条件，或者问题规模没有变小，递归就会无限进行，调用栈越压越高，最终报 <b>RecursionError</b>（Python 默认最多约 1000 层）。</p>',
      },
      {
        type: 'text',
        html: `
<h2>递归的陷阱：重复计算</h2>
<p>斐波那契数列 0, 1, 1, 2, 3, 5, 8 … 每个数是前两个数之和：<code>fib(n) = fib(n-1) + fib(n-2)</code>。直接写成递归非常简洁，但看看下面的调用树：同一个 <code>fib(2)</code> 被算了好多遍。n 每增加 1，调用次数差不多翻一倍，是 O(2ⁿ)。</p>`,
      },
      {
        type: 'player',
        title: 'fib(n) 的调用树',
        views: [
          { type: 'tree', key: 't', title: '调用树（fk 表示调用 fib(k)）', empty: '（点击按钮开始）' },
          { type: 'out', key: 'info', title: '统计', empty: '（还没算完）' },
        ],
        init: () => ({ t: { nodes: {}, root: null }, info: null }),
        actions: [
          {
            label: '计算 fib(n)',
            fresh: true,
            input: { kind: 'num', value: '4', min: 1, max: 5, label: 'n（1 到 5）', width: 4 },
            code: `def fib(n):
    if n <= 1:                         # 基线条件 #@base
        return n
    return fib(n - 1) + fib(n - 2)     # 两次递归调用 #@call`,
            test: `expect(fib(10), 55, "fib(10)")`,
            run: function* (s, n) {
              s.t = { nodes: {}, root: null };
              let calls = 0;
              const count = {};
              const done = [];
              const path = [];
              const hl = (id) => ({ cur: id, path: path.slice(), done: done.slice() });
              function* fib(k, parent, side) {
                const id = 'f' + calls++;
                count[k] = (count[k] || 0) + 1;
                s.t.nodes[id] = { v: 'f' + k, l: null, r: null };
                if (parent === null) s.t.root = id;
                else s.t.nodes[parent][side] = id;
                path.push(id);
                yield { at: 'base', msg: `调用 fib(${k})${count[k] > 1 ? `，这已经是第 ${count[k]} 次计算 fib(${k}) 了` : ''}。`, hl: hl(id), vars: { n: k, 总调用次数: calls } };
                let r = k;
                if (k > 1) {
                  yield { at: 'call', msg: `fib(${k}) = fib(${k - 1}) + fib(${k - 2})，先去算 fib(${k - 1})。`, hl: hl(id), vars: { n: k, 总调用次数: calls } };
                  const a = yield* fib(k - 1, id, 'l');
                  yield { at: 'call', msg: `fib(${k - 1}) = ${a}，再去算 fib(${k - 2})。`, hl: hl(id), vars: { n: k, 总调用次数: calls } };
                  const b = yield* fib(k - 2, id, 'r');
                  r = a + b;
                }
                path.pop();
                done.push(id);
                yield { at: k > 1 ? 'call' : 'base', msg: `fib(${k}) 返回 ${r}。`, hl: { cur: id, path: path.slice(), done: done.slice() }, vars: { n: k, 返回值: r, 总调用次数: calls } };
                return r;
              }
              const r = yield* fib(n, null, null);
              const rep = Object.keys(count).filter((k) => count[k] > 1).map((k) => `fib(${k}) 算了 ${count[k]} 次`);
              s.info = [`fib(${n}) = ${r}`, `共调用 ${calls} 次`, ...rep];
              yield { msg: `算完了。为了得到 fib(${n})，函数一共被调用了 <b>${calls}</b> 次，其中很多是重复劳动。`, hl: { done: done.slice() }, vars: { 结果: r, 总调用次数: calls } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: '<p>解决办法很简单：把算过的结果存进字典，下次直接查。这个技巧叫<strong>记忆化</strong>，它把 fib 从 O(2ⁿ) 降到了 O(n)，也是以后学习“动态规划”的起点。</p>',
      },
      {
        type: 'code',
        title: '记忆化：算过的就别再算了',
        code: `memo = {}

def fib(n):
    if n <= 1:
        return n
    if n in memo:                  # 算过，直接查表
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(50))                     # 不加记忆化的话，要算到天荒地老`,
        out: '12586269025\n',
      },
      {
        type: 'quiz',
        q: '递归函数中“基线条件”的作用是？',
        options: ['让函数运行得更快', '告诉递归什么时候停下来', '让函数可以调用自己', '保存计算结果'],
        answer: 1,
        explain: '<p>基线条件是最小、能直接回答的情况。没有它，递归永远不会停止。</p>',
      },
      {
        type: 'quiz',
        q: '计算 <code>fact(4)</code> 时，调用栈最多同时有几层？',
        options: ['1 层', '2 层', '4 层', '24 层'],
        answer: 2,
        explain: '<p>fact(4) → fact(3) → fact(2) → fact(1)，最深时 4 层同时在栈里，然后从 fact(1) 开始逐层返回。</p>',
      },
      {
        type: 'exercise',
        title: '递归求和',
        prompt: `<p>用递归完成 <code>sum_list(nums)</code>，返回列表所有元素的和。不要用 for / while 循环，也不要用 <code>sum()</code>。</p>
<p>思路：空列表的和是 0（基线条件）；否则，和 = 第一个元素 + 剩下部分的和（递归条件）。<code>nums[1:]</code> 表示去掉第一个元素后剩下的列表。</p>`,
        starter: `def sum_list(nums):
    # 基线条件：nums 为空时返回 0

    # 递归条件：第一个元素 + sum_list(剩下的部分)
    return 0

print(sum_list([1, 2, 3]))   # 应该是 6`,
        solution: `def sum_list(nums):
    if len(nums) == 0:
        return 0
    return nums[0] + sum_list(nums[1:])`,
        tests: `expect(sum_list([1, 2, 3]), 6, "sum_list([1, 2, 3])")
expect(sum_list([]), 0, "sum_list([])")
expect(sum_list([10]), 10, "sum_list([10])")
expect(sum_list([5, -2, 7, 1]), 11, "sum_list([5, -2, 7, 1])")`,
        hints: ['基线条件：<code>if len(nums) == 0: return 0</code>。', '最后一行改成 <code>return nums[0] + sum_list(nums[1:])</code>。'],
      },
    ],
  });

  /* ———————————— 二分查找 ———————————— */
  const SORTED = [3, 8, 12, 17, 21, 25, 30, 34, 39, 42, 48, 53, 60, 66, 71];
  DSA.lesson({
    id: 'binary-search',
    part: P,
    title: '二分查找',
    glyph: '½',
    minutes: 15,
    summary: '在有序数据里，每次排除一半',
    blocks: [
      {
        type: 'text',
        html: `
<p>还记得第一课的猜数字吗？“每次猜中间”的策略，用在<b>有序</b>的列表上就是<strong>二分查找</strong>：</p>
<ol>
  <li>看查找范围正中间的元素。</li>
  <li>正好是目标：找到了。</li>
  <li>比目标小：目标只可能在右半边，把左半边全部扔掉。</li>
  <li>比目标大：目标只可能在左半边，把右半边全部扔掉。</li>
  <li>在剩下的范围里重复，直到找到，或者范围变空。</li>
</ol>
<p>我们用两个变量 <code>lo</code> 和 <code>hi</code> 标记当前查找范围的左右边界，<code>mid</code> 是中间位置。</p>`,
      },
      {
        type: 'player',
        title: '二分查找 vs 顺序查找',
        views: [{ type: 'array', key: 'arr', title: '有序数组 arr' }],
        init: () => ({ arr: DSA.items(SORTED) }),
        hint: '先用二分查找找 42，再用顺序查找找 42，比较一下各自比较了多少次。也可以找一个不存在的数，比如 40。',
        actions: [
          {
            label: '二分查找',
            input: { kind: 'num', value: '42', label: '要找的数', width: 4 },
            code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1           #@init
    while lo <= hi:                    #@loop
        mid = (lo + hi) // 2           #@mid
        if arr[mid] == target:         #@cmp
            return mid                 #@found
        elif arr[mid] < target:        #@less
            lo = mid + 1               # 目标在右半边 #@right
        else:
            hi = mid - 1               # 目标在左半边 #@left
    return -1                          #@none`,
            test: `a = [1, 3, 5, 7, 9, 11]
expect(binary_search(a, 7), 3, "找到 7")
expect(binary_search(a, 1), 0, "找到第一个")
expect(binary_search(a, 11), 5, "找到最后一个")
expect(binary_search(a, 4), -1, "找不到")
expect(binary_search([], 4), -1, "空列表")`,
            run: function* (s, t) {
              const a = s.arr;
              const n = a.length;
              let lo = 0;
              let hi = n - 1;
              let steps = 0;
              const dim = () => R(0, n).filter((i) => i < lo || i > hi);
              yield { at: 'init', msg: `一开始，查找范围是整个数组：lo = 0，hi = ${hi}。`, hl: { ptr: { lo, hi } }, vars: { target: t, lo, hi } };
              while (lo <= hi) {
                yield { at: 'loop', msg: `lo <= hi，范围里还有 ${hi - lo + 1} 个元素。`, hl: { dim: dim(), ptr: { lo, hi } }, vars: { target: t, lo, hi } };
                const mid = (lo + hi) >> 1;
                yield { at: 'mid', msg: `取中间：mid = (${lo} + ${hi}) // 2 = ${mid}`, hl: { dim: dim(), active: [mid], ptr: { lo, mid, hi } }, vars: { target: t, lo, hi, mid } };
                steps++;
                yield { at: 'cmp', msg: `第 ${steps} 次比较：arr[${mid}] = ${a[mid].v}，目标是 ${t}。`, hl: { dim: dim(), cmp: [mid], ptr: { lo, mid, hi } }, vars: { target: t, lo, hi, mid } };
                if (a[mid].v === t) return yield { at: 'found', msg: `找到了，在下标 ${mid}！只比较了 <b>${steps}</b> 次。`, hl: { found: [mid], dim: R(0, n).filter((i) => i !== mid) }, vars: { target: t, mid } };
                if (a[mid].v < t) {
                  yield { at: 'less', msg: `${a[mid].v} < ${t}，目标只可能在 mid 右边。`, hl: { dim: dim(), cmp: [mid], ptr: { lo, mid, hi } }, vars: { target: t, lo, hi, mid } };
                  lo = mid + 1;
                  yield { at: 'right', msg: `lo = mid + 1 = ${lo}，左边一半全部排除。`, hl: { dim: dim(), ptr: { lo, hi } }, vars: { target: t, lo, hi, mid } };
                } else {
                  yield { at: 'less', msg: `${a[mid].v} > ${t}，目标只可能在 mid 左边。`, hl: { dim: dim(), cmp: [mid], ptr: { lo, mid, hi } }, vars: { target: t, lo, hi, mid } };
                  hi = mid - 1;
                  yield { at: 'left', msg: `hi = mid - 1 = ${hi}，右边一半全部排除。`, hl: { dim: dim(), ptr: { lo, hi } }, vars: { target: t, lo, hi, mid } };
                }
              }
              yield { at: 'none', msg: `lo = ${lo} > hi = ${hi}，范围空了，说明 ${t} 不在数组里，返回 -1。一共比较了 <b>${steps}</b> 次。`, hl: { dim: R(0, n) }, vars: { target: t, lo, hi } };
            },
          },
          {
            label: '顺序查找',
            input: { kind: 'num', value: '42', label: '要找的数', width: 4 },
            code: `def linear_search(arr, target):
    for i in range(len(arr)):          #@loop
        if arr[i] == target:           #@cmp
            return i                   #@found
    return -1                          #@none`,
            run: function* (s, t) {
              const a = s.arr;
              for (let i = 0; i < a.length; i++) {
                yield { at: 'cmp', msg: `第 ${i + 1} 次比较：arr[${i}] = ${a[i].v}`, hl: { cmp: [i], dim: R(0, i), ptr: { i } }, vars: { target: t, i } };
                if (a[i].v === t) return yield { at: 'found', msg: `找到了，在下标 ${i}。比较了 <b>${i + 1}</b> 次。`, hl: { found: [i], dim: R(0, i) }, vars: { target: t, i } };
              }
              yield { at: 'none', msg: `全部 ${a.length} 个都比较完了，没找到。`, hl: { dim: R(0, a.length) }, vars: { target: t } };
            },
          },
          {
            label: '换一组数据',
            input: { kind: 'nums', value: SORTED.join(', '), maxLen: 15, label: '新的数组（会自动排序去重）', random: () => DSA.randNums(15, 1, 99).join(', ') },
            code: `arr = sorted(set(nums))   # 二分查找要求数据有序 #@sort`,
            run: function* (s, nums) {
              s.arr = DSA.items([...new Set(nums)].sort((x, y) => x - y));
              yield { at: 'sort', msg: '数据已排序并去重。二分查找<b>必须</b>在有序数据上进行。' };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>为什么这么快</h2>
<p>每比较一次，范围就缩小一半。n 个元素最多比较约 log₂ n 次：</p>
<div class="table-wrap"><table>
<tr><th>元素个数 n</th><th>顺序查找最多比较</th><th>二分查找最多比较</th></tr>
<tr><td>15</td><td>15 次</td><td>4 次</td></tr>
<tr><td>1,000</td><td>1,000 次</td><td>10 次</td></tr>
<tr><td>1,000,000</td><td>1,000,000 次</td><td>20 次</td></tr>
<tr><td>1,000,000,000</td><td>10 亿次</td><td>30 次</td></tr>
</table></div>
<p>代价是数据必须先排好序。如果数据经常变化、或者只查一次，排序的成本可能比顺序查找还高。Python 标准库的 <code>bisect</code> 模块提供了现成的二分查找。</p>`,
      },
      {
        type: 'tip',
        kind: 'warn',
        html: '<p>二分查找最容易写错的是边界：循环条件是 <code>lo &lt;= hi</code>（等号不能少，否则只剩一个元素时会漏掉它），更新时要写 <code>mid + 1</code> 和 <code>mid - 1</code>（否则可能死循环）。</p>',
      },
      {
        type: 'quiz',
        q: '使用二分查找的前提条件是？',
        options: ['数据量必须很大', '数据必须有序', '数据不能有负数', '数据必须存放在链表中'],
        answer: 1,
        explain: '<p>只有有序时，才能根据中间元素的大小判断目标在哪一半。另外，它需要按下标随机访问，所以用数组而不是链表。</p>',
      },
      {
        type: 'quiz',
        q: '在 1000 个有序元素中用二分查找，最多大约需要比较几次？',
        options: ['约 10 次', '约 100 次', '约 500 次', '1000 次'],
        answer: 0,
        explain: '<p>2¹⁰ = 1024 ≥ 1000，每次减半，约 10 次就能把范围缩到 1 个。</p>',
      },
      {
        type: 'exercise',
        title: '实现二分查找',
        prompt: '<p>完成 <code>binary_search(arr, target)</code>：<code>arr</code> 是从小到大排好序的列表，找到 target 时返回它的下标，找不到返回 <code>-1</code>。请用二分查找实现（不要用 <code>in</code> 或 <code>index()</code>）。</p>',
        starter: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        # 比较 arr[mid] 和 target，决定返回、去右半边还是去左半边
        pass
    return -1

print(binary_search([1, 3, 5, 7, 9], 7))   # 应该是 3`,
        solution: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        tests: `a = [1, 3, 5, 7, 9, 11, 13]
expect(binary_search(a, 7), 3, "binary_search(a, 7)")
expect(binary_search(a, 1), 0, "binary_search(a, 1)")
expect(binary_search(a, 13), 6, "binary_search(a, 13)")
expect(binary_search(a, 8), -1, "binary_search(a, 8)")
expect(binary_search([], 3), -1, "binary_search([], 3)")`,
        hints: [
          '这份初始代码直接运行会死循环（lo 和 hi 永远不变），本站会在 5 秒后自动停止它。把 <code>pass</code> 换成 if / elif / else 判断。',
          '三种情况：相等时 <code>return mid</code>；<code>arr[mid] &lt; target</code> 时 <code>lo = mid + 1</code>；否则 <code>hi = mid - 1</code>。',
        ],
      },
    ],
  });
})();
