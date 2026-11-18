/* 第四部分 · 排序算法：冒泡、选择、插入、归并、快速。
 * 排序的步骤生成器放在 DSA.algo 上，供课程播放器和“排序大比拼”组件共用。
 * 约定（排序大比拼按这个计数）：每次比较两个元素 yield 一次 at:'cmp'；
 * 每次交换/挪动/写入元素 yield 一次 at 以 swap / shift / place / take 开头的帧。 */
(() => {
  const P = '排序算法';
  const R = DSA.range;
  const A = DSA.algo;
  const outside = (n, lo, hi) => R(0, n).filter((i) => i < lo || i > hi);

  A.bubble = function* (s) {
    const a = s.arr;
    const n = a.length;
    const done = [];
    for (let i = 0; i < n - 1; i++) {
      yield { at: 'outer', msg: `第 ${i + 1} 轮：从左到右两两比较，把还没排好的部分里最大的数“冒泡”到最右边。`, hl: { done: done.slice() }, vars: { i } };
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        yield { at: 'cmp', msg: `比较 arr[${j}] = ${a[j].v} 和 arr[${j + 1}] = ${a[j + 1].v}。`, hl: { cmp: [j, j + 1], done: done.slice() }, vars: { i, j, swapped } };
        if (a[j].v > a[j + 1].v) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swapped = true;
          yield { at: 'swap', msg: `${a[j + 1].v} > ${a[j].v}，左边的大，交换它们。`, hl: { swap: [j, j + 1], done: done.slice() }, vars: { i, j, swapped } };
        }
      }
      done.unshift(n - 1 - i);
      if (!swapped) return yield { at: 'early', msg: '这一轮一次交换都没有，说明已经全部有序，提前结束！', hl: { done: R(0, n) }, vars: { i, swapped } };
    }
    yield { at: 'done', msg: '排序完成！', hl: { done: R(0, n) } };
  };

  A.selection = function* (s) {
    const a = s.arr;
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      yield { at: 'init', msg: `第 ${i + 1} 轮：在下标 ${i} 之后找最小的数。先假设 arr[${i}] = ${a[i].v} 最小。`, hl: { done: R(0, i), min: [m], ptr: { i, min_i: m } }, vars: { i, min_i: m } };
      for (let j = i + 1; j < n; j++) {
        yield { at: 'cmp', msg: `arr[${j}] = ${a[j].v} 比当前最小的 ${a[m].v} 还小吗？`, hl: { done: R(0, i), min: [m], cmp: [j], ptr: { i, j, min_i: m } }, vars: { i, j, min_i: m } };
        if (a[j].v < a[m].v) {
          m = j;
          yield { at: 'newmin', msg: `是，记住新的最小值 ${a[m].v} 的位置：min_i = ${m}。`, hl: { done: R(0, i), min: [m], ptr: { i, j, min_i: m } }, vars: { i, j, min_i: m } };
        }
      }
      [a[i], a[m]] = [a[m], a[i]];
      yield { at: 'swap', msg: i === m ? `最小的就是 arr[${i}] 本身，位置不变。` : `把最小值 ${a[i].v} 和 arr[${i}] 交换，放到前面。`, hl: { done: R(0, i + 1), swap: i === m ? [] : [i, m] }, vars: { i, min_i: m } };
    }
    yield { at: 'done', msg: '排序完成！', hl: { done: R(0, n) } };
  };

  A.insertion = function* (s) {
    const a = s.arr;
    const n = a.length;
    for (let i = 1; i < n; i++) {
      const key = a[i].v;
      let k = i;
      yield { at: 'key', msg: `拿起 arr[${i}] = ${key}，要把它插入左边已经排好序的部分。`, hl: { key: [k], dim: R(i + 1, n) }, vars: { i, key } };
      let j = i - 1;
      while (j >= 0) {
        yield { at: 'cmp', msg: `${a[j].v} > ${key} 吗？`, hl: { key: [k], cmp: [j], dim: R(i + 1, n) }, vars: { i, j, key } };
        if (a[j].v <= key) break;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        k = j;
        yield { at: 'shift', msg: `${a[j + 1].v} 比 ${key} 大，往右挪一格，给 ${key} 腾位置。`, hl: { key: [k], swap: [j + 1], dim: R(i + 1, n) }, vars: { i, j, key } };
        j--;
      }
      yield { at: 'place', msg: `${j < 0 ? '左边已经没有数了' : `${a[j].v} 不比 ${key} 大`}，把 ${key} 放进下标 ${j + 1}。左边 ${i + 1} 个数现在是有序的。`, hl: { new: [j + 1], dim: R(i + 1, n) }, vars: { i, j, key } };
    }
    yield { at: 'done', msg: '排序完成！', hl: { done: R(0, n) } };
  };

  A.merge = function* (s) {
    const a = s.arr;
    const n = a.length;
    function* sort(lo, hi) {
      // 处理下标 lo ~ hi（含 hi）
      if (hi <= lo) {
        if (hi === lo) yield { at: 'base', msg: `下标 ${lo} 这一段只有一个元素 ${a[lo].v}，天然有序。`, hl: { dim: outside(n, lo, hi), active: [lo] } };
        return;
      }
      const mid = (lo + hi + 1) >> 1;
      yield { at: 'split', msg: `把下标 ${lo}~${hi} 分成两半：${lo}~${mid - 1} 和 ${mid}~${hi}，分别排序。`, hl: { dim: outside(n, lo, hi), ptr: { lo, mid, hi } } };
      yield* sort(lo, mid - 1);
      yield* sort(mid, hi);
      const left = a.slice(lo, mid);
      const right = a.slice(mid, hi + 1);
      let i = 0;
      let j = 0;
      const res = [];
      const show = () => a.splice(lo, hi - lo + 1, ...res, ...left.slice(i), ...right.slice(j));
      const hl = (extra) => ({ dim: outside(n, lo, hi), done: R(lo, lo + res.length), ...extra });
      yield { at: 'merge', msg: `两半都排好了，现在合并：左边 [${DSA.vals(left)}]，右边 [${DSA.vals(right)}]。`, hl: hl({}) };
      while (i < left.length && j < right.length) {
        const pi = lo + res.length;
        const pj = pi + left.length - i;
        yield { at: 'cmp', msg: `比较左边最小的 ${left[i].v} 和右边最小的 ${right[j].v}。`, hl: hl({ cmp: [pi, pj] }), vars: { i, j } };
        if (left[i].v <= right[j].v) {
          res.push(left[i++]);
          show();
          yield { at: 'takeL', msg: `${res[res.length - 1].v} 更小（或相等），先放进结果。`, hl: hl({}), vars: { i, j } };
        } else {
          res.push(right[j++]);
          show();
          yield { at: 'takeR', msg: `${res[res.length - 1].v} 更小，先放进结果。`, hl: hl({}), vars: { i, j } };
        }
      }
      if (i < left.length || j < right.length) {
        res.push(...left.slice(i), ...right.slice(j));
        i = left.length;
        j = right.length;
        show();
        yield { at: 'takeRest', msg: '有一边已经取完了，另一边剩下的本来就有序，直接接到后面。', hl: hl({}), vars: { i, j } };
      }
    }
    yield* sort(0, n - 1);
    yield { msg: '排序完成！', hl: { done: R(0, n) } };
  };

  A.quick = function* (s) {
    const a = s.arr;
    const n = a.length;
    const done = [];
    function* qs(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) {
          done.push(lo);
          yield { at: 'base', msg: `下标 ${lo} 这一段只有一个元素，它已经在正确的位置。`, hl: { done: done.slice(), dim: outside(n, lo, hi) } };
        }
        return;
      }
      yield { at: 'part', msg: `对下标 ${lo}~${hi} 这一段做分区。`, hl: { dim: outside(n, lo, hi), done: done.slice(), ptr: { lo, hi } } };
      const pv = a[hi].v;
      let i = lo;
      const hl = (extra) => ({ pivot: [hi], dim: outside(n, lo, hi), done: done.slice(), ...extra });
      yield { at: 'pivot', msg: `选这一段最后一个元素 ${pv} 作为<b>基准</b>（pivot）。目标：比它小的放左边，其余放右边。`, hl: hl({ ptr: { i } }), vars: { pivot: pv, i } };
      for (let j = lo; j < hi; j++) {
        yield { at: 'cmp', msg: `arr[${j}] = ${a[j].v} 比基准 ${pv} 小吗？`, hl: hl({ cmp: [j], ptr: { i, j } }), vars: { pivot: pv, i, j } };
        if (a[j].v < pv) {
          [a[i], a[j]] = [a[j], a[i]];
          yield { at: 'swap', msg: i === j ? `是。它正好在左边区域的末尾，i 往后移一位。` : `是，和 arr[${i}] 交换，把它放进左边“比基准小”的区域。`, hl: hl({ swap: i === j ? [i] : [i, j], ptr: { i, j } }), vars: { pivot: pv, i, j } };
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      done.push(i);
      yield { at: 'place', msg: `把基准 ${pv} 换到下标 ${i}：它左边都比它小，右边都不比它小，所以它的最终位置确定了！`, hl: { done: done.slice(), dim: outside(n, lo, hi), ptr: { i } }, vars: { pivot: pv, i } };
      yield* qs(lo, i - 1);
      yield* qs(i + 1, hi);
    }
    yield* qs(0, n - 1);
    yield { msg: '排序完成！', hl: { done: R(0, n) } };
  };

  const DEFAULT = '38, 27, 43, 3, 9, 82, 10, 51';
  const sortPlayer = (algo, code, test, title) => ({
    type: 'player',
    title,
    views: [{ type: 'array', key: 'arr', title: 'arr', bars: true }],
    init: () => ({ arr: DSA.items(DEFAULT.split(', ').map(Number)) }),
    hint: '点“开始排序”播放；可以输入自己的数字（最多 12 个，1~99），或点“随机”。黄色 = 正在比较，红色 = 交换/移动，绿色 = 已到最终位置。',
    actions: [
      {
        label: '开始排序',
        fresh: true,
        input: { kind: 'nums', value: DEFAULT, min: 1, max: 99, maxLen: 12, label: '要排序的数字', random: DSA.randInput(8, 5, 99) },
        code,
        test,
        run: function* (s, nums) {
          s.arr = DSA.items(nums);
          yield* A[algo](s);
        },
      },
    ],
  });
  const SORT_TEST = (fn) => `expect(${fn}([38, 27, 43, 3, 9, 82, 10]), [3, 9, 10, 27, 38, 43, 82], "${fn}")
expect(${fn}([]), [], "${fn} 空列表")
expect(${fn}([1]), [1], "${fn} 一个元素")
expect(${fn}([2, 1, 2, 1]), [1, 1, 2, 2], "${fn} 有重复")`;

  /* ———————————— 冒泡排序 ———————————— */
  DSA.lesson({
    id: 'bubble-sort',
    part: P,
    title: '冒泡排序',
    glyph: '↥',
    minutes: 12,
    summary: '相邻两两比较，大的往后冒',
    blocks: [
      {
        type: 'text',
        html: `
<p>排序是最基础也最常用的算法之一：成绩排名、商品按价格排序、文件按时间排序……接下来五课，我们学习五种经典的排序算法，并比较它们的快慢。</p>
<p><strong>冒泡排序</strong>的想法最直接：从左到右，<b>两两比较相邻的元素</b>，如果左边比右边大就交换。走完一轮，最大的数就像气泡一样“冒”到了最右边。再对剩下的部分重复，直到全部有序。</p>`,
      },
      sortPlayer(
        'bubble',
        `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):                         #@outer
        swapped = False
        for j in range(n - 1 - i):                 # 最后 i 个已经排好
            if arr[j] > arr[j + 1]:                #@cmp
                arr[j], arr[j + 1] = arr[j + 1], arr[j]   # 交换 #@swap
                swapped = True
        if not swapped:                            # 一轮没交换，已经有序 #@early
            break
    return arr                                     #@done`,
        SORT_TEST('bubble_sort'),
        '冒泡排序动画'
      ),
      {
        type: 'text',
        html: `
<p>Python 交换两个变量只需要一行：<code>a, b = b, a</code>。代码里的 <code>swapped</code> 是一个小优化：如果某一轮一次交换都没有，说明已经有序，可以提前结束。</p>
<div class="table-wrap"><table>
<tr><th>情况</th><th>时间复杂度</th><th>说明</th></tr>
<tr><td>最好</td><td>O(n)</td><td>本来就有序，一轮没交换就结束</td></tr>
<tr><td>平均 / 最坏</td><td>O(n²)</td><td>两层循环，约 n²/2 次比较</td></tr>
<tr><td>额外空间</td><td>O(1)</td><td>原地排序，不需要额外的列表</td></tr>
</table></div>`,
      },
      {
        type: 'quiz',
        q: '冒泡排序第一轮结束后，可以确定什么？',
        options: ['最小的数在最左边', '最大的数在最右边', '整个数组已经有序', '中间的数在中间'],
        answer: 1,
        explain: '<p>每次比较都把较大的往右推，所以第一轮结束时，最大的数一定被推到了最右边。</p>',
      },
      {
        type: 'quiz',
        q: '对一个<b>已经排好序</b>的列表执行带 swapped 优化的冒泡排序，复杂度是？',
        options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
        answer: 1,
        explain: '<p>第一轮比较 n-1 次，没有发生交换，于是提前结束。</p>',
      },
      {
        type: 'exercise',
        title: '从大到小排序',
        prompt: '<p>修改冒泡排序，完成 <code>bubble_sort_desc(arr)</code>，把列表按<b>从大到小</b>排序并返回。只需要改动一个地方。</p>',
        starter: `def bubble_sort_desc(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:     # 想一想：从大到小时，什么情况下需要交换？
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

print(bubble_sort_desc([3, 1, 4, 1, 5]))`,
        solution: `def bubble_sort_desc(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] < arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
        tests: `expect(bubble_sort_desc([3, 1, 4, 1, 5]), [5, 4, 3, 1, 1], "bubble_sort_desc([3, 1, 4, 1, 5])")
expect(bubble_sort_desc([]), [], "bubble_sort_desc([])")
expect(bubble_sort_desc([1, 2, 3]), [3, 2, 1], "bubble_sort_desc([1, 2, 3])")`,
        hints: ['从大到小时，如果左边比右边<b>小</b>，就要交换。', '把 <code>&gt;</code> 改成 <code>&lt;</code>。'],
      },
    ],
  });

  /* ———————————— 选择排序 ———————————— */
  DSA.lesson({
    id: 'selection-sort',
    part: P,
    title: '选择排序',
    glyph: '↧',
    minutes: 12,
    summary: '每轮选出最小的，放到前面',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>选择排序</strong>像体育课排队：老师每次从没排好的同学里<b>挑出最矮的</b>，让他站到队伍最前面的空位。重复这个过程，队伍就从矮到高排好了。</p>
<p>具体做法：第 i 轮，在下标 i 到末尾之间找最小值的位置 <code>min_i</code>，然后把它和 <code>arr[i]</code> 交换。</p>`,
      },
      sortPlayer(
        'selection',
        `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_i = i                          # 先假设 i 位置最小 #@init
        for j in range(i + 1, n):
            if arr[j] < arr[min_i]:        #@cmp
                min_i = j                  # 发现更小的，记住位置 #@newmin
        arr[i], arr[min_i] = arr[min_i], arr[i]   # 放到前面 #@swap
    return arr                             #@done`,
        SORT_TEST('selection_sort'),
        '选择排序动画'
      ),
      {
        type: 'text',
        html: `
<p>选择排序的比较次数是固定的：无论数据原来什么样，都要比较约 n²/2 次，所以最好、平均、最坏都是 <b>O(n²)</b>。它的优点是交换次数少，最多 n-1 次。</p>`,
      },
      {
        type: 'tip',
        kind: 'key',
        html: '<p>对比冒泡排序：冒泡是边比较边交换，选择是先找到最小的、最后只交换一次。两者都是 O(n²)，适合理解排序的思想，但数据一多就太慢了。</p>',
      },
      {
        type: 'quiz',
        q: '对 <code>[5, 2, 8, 1]</code> 做选择排序，第一轮结束后列表变成？',
        options: ['[1, 2, 8, 5]', '[2, 5, 8, 1]', '[2, 5, 1, 8]', '[1, 2, 5, 8]'],
        answer: 0,
        explain: '<p>第一轮找到最小值 1（下标 3），和 arr[0] = 5 交换，得到 [1, 2, 8, 5]。</p>',
      },
      {
        type: 'quiz',
        q: '选择排序在<b>最好情况</b>（已经有序）下的时间复杂度是？',
        options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
        answer: 3,
        explain: '<p>即使已经有序，每一轮仍然要扫描剩下的所有元素才能确认谁最小。</p>',
      },
      {
        type: 'exercise',
        title: '每轮选最大的放到后面',
        prompt: '<p>换个方向实现选择排序：第 i 轮在<b>还没排好的前半部分</b>里找<b>最大值</b>，把它交换到这部分的<b>末尾</b>。完成 <code>selection_sort_max(arr)</code>，结果仍然是从小到大。</p>',
        starter: `def selection_sort_max(arr):
    n = len(arr)
    for end in range(n - 1, 0, -1):       # end 是本轮要放最大值的位置
        max_i = 0
        # 在下标 0 ~ end 之间找最大值的下标 max_i

        # 把 arr[max_i] 和 arr[end] 交换

    return arr

print(selection_sort_max([3, 1, 4, 1, 5]))`,
        solution: `def selection_sort_max(arr):
    n = len(arr)
    for end in range(n - 1, 0, -1):
        max_i = 0
        for j in range(1, end + 1):
            if arr[j] > arr[max_i]:
                max_i = j
        arr[max_i], arr[end] = arr[end], arr[max_i]
    return arr`,
        tests: SORT_TEST('selection_sort_max'),
        hints: ['找最大值：<code>for j in range(1, end + 1):</code>，如果 <code>arr[j] &gt; arr[max_i]</code> 就更新 <code>max_i = j</code>。', '交换：<code>arr[max_i], arr[end] = arr[end], arr[max_i]</code>（写在内层循环外面）。'],
      },
    ],
  });

  /* ———————————— 插入排序 ———————————— */
  DSA.lesson({
    id: 'insertion-sort',
    part: P,
    title: '插入排序',
    glyph: '⇤',
    minutes: 12,
    summary: '像整理扑克牌一样，逐个插入',
    blocks: [
      {
        type: 'text',
        html: `
<p>打扑克时你是怎么整理手牌的？每摸一张新牌，就把它<b>插入</b>到手里已经排好的牌中合适的位置。<strong>插入排序</strong>就是这样：</p>
<ol>
  <li>把第一个元素看作一手已经排好的牌。</li>
  <li>拿起下一个元素（叫 <code>key</code>），从右往左和手里的牌比较，比它大的都往右挪一格。</li>
  <li>遇到不比它大的牌（或者到头了），就把 key 放进空出来的位置。</li>
</ol>`,
      },
      sortPlayer(
        'insertion',
        `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]                       # 拿起一张牌 #@key
        j = i - 1
        while j >= 0 and arr[j] > key:     #@cmp
            arr[j + 1] = arr[j]            # 比它大的往右挪 #@shift
            j -= 1
        arr[j + 1] = key                   # 放进空位 #@place
    return arr                             #@done`,
        SORT_TEST('insertion_sort'),
        '插入排序动画'
      ),
      {
        type: 'text',
        html: `
<p>插入排序平均和最坏情况都是 <b>O(n²)</b>，但它有一个很实用的特点：数据<b>越接近有序就越快</b>，完全有序时只要 O(n)。所以很多实际使用的排序算法（包括 Python 内置的 Timsort）在处理小段数据时会用插入排序。</p>`,
      },
      {
        type: 'quiz',
        q: '插入排序在什么情况下最快？',
        options: ['数据完全随机', '数据完全逆序', '数据几乎有序', '数据全是负数'],
        answer: 2,
        explain: '<p>几乎有序时，每个 key 只需要和左边比较一两次就能找到位置。完全逆序时最慢，每个 key 都要挪到最前面。</p>',
      },
      {
        type: 'quiz',
        q: '插入排序执行到第 i 轮开始时（拿起 arr[i] 之前），关于 <code>arr[0..i-1]</code> 哪句话正确？',
        options: ['它们是整个列表中最小的 i 个数', '它们已经按从小到大排好了', '它们都比 arr[i] 小', '什么也不能确定'],
        answer: 1,
        explain: '<p>左边部分是“已经整理好的手牌”，一定有序；但它们不一定是全局最小的，后面还可能有更小的牌插进来。</p>',
      },
      {
        type: 'exercise',
        title: '把一个数插入有序列表',
        prompt: '<p>这是插入排序的核心一步。<code>arr</code> 已经从小到大排好序，完成 <code>insert_sorted(arr, x)</code>：把 x 插入到正确位置，使列表仍然有序，并返回这个列表。不要使用 <code>sort()</code>、<code>sorted()</code> 或 <code>insert()</code>。</p>',
        starter: `def insert_sorted(arr, x):
    arr.append(x)            # 先放到末尾
    j = len(arr) - 2         # 从 x 左边的元素开始往左比较
    # 比 x 大的元素依次往右挪一格，最后把 x 放进空位

    return arr

print(insert_sorted([1, 3, 5, 7], 4))   # 应该是 [1, 3, 4, 5, 7]`,
        solution: `def insert_sorted(arr, x):
    arr.append(x)
    j = len(arr) - 2
    while j >= 0 and arr[j] > x:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = x
    return arr`,
        tests: `expect(insert_sorted([1, 3, 5, 7], 4), [1, 3, 4, 5, 7], "insert_sorted([1, 3, 5, 7], 4)")
expect(insert_sorted([1, 3], 0), [0, 1, 3], "insert_sorted([1, 3], 0)")
expect(insert_sorted([1, 3], 9), [1, 3, 9], "insert_sorted([1, 3], 9)")
expect(insert_sorted([], 2), [2], "insert_sorted([], 2)")`,
        hints: ['和动画里的代码一样：<code>while j &gt;= 0 and arr[j] &gt; x:</code>，循环里 <code>arr[j + 1] = arr[j]</code>、<code>j -= 1</code>。', '循环结束后写 <code>arr[j + 1] = x</code>。'],
      },
    ],
  });

  /* ———————————— 归并排序 ———————————— */
  DSA.lesson({
    id: 'merge-sort',
    part: P,
    title: '归并排序',
    glyph: '⋈',
    minutes: 15,
    summary: '分而治之：拆成两半，排好再合并',
    blocks: [
      {
        type: 'text',
        html: `
<p>前三种排序都是 O(n²)。要更快，需要一种新的思路：<strong>分而治之</strong>。把大问题拆成两个小问题，分别解决，再把结果合起来。</p>
<p><strong>归并排序</strong>正是这样：</p>
<ol>
  <li><b>拆</b>：把列表从中间分成两半。</li>
  <li><b>递归</b>：对两半分别做归并排序（一直拆到只剩 1 个元素，1 个元素天然有序）。</li>
  <li><b>合</b>：把两个<b>有序</b>的半边合并成一个有序的列表。</li>
</ol>`,
      },
      {
        type: 'tip',
        kind: 'analogy',
        html: '<p>合并两个有序列表，就像把两摞已经按分数排好的试卷合成一摞：每次只看两摞最上面的那张，拿走分数低的放到新的一摞上。因为两摞各自有序，最上面的就是各自最小的。</p>',
      },
      sortPlayer(
        'merge',
        `def merge_sort(arr):
    if len(arr) <= 1:                     # 只有一个元素，天然有序 #@base
        return arr
    mid = len(arr) // 2                    #@split
    left = merge_sort(arr[:mid])           # 排好左半边
    right = merge_sort(arr[mid:])          # 排好右半边
    return merge(left, right)              #@merge

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:            # 比较两边最小的 #@cmp
            result.append(left[i])         #@takeL
            i += 1
        else:
            result.append(right[j])        #@takeR
            j += 1
    result += left[i:] + right[j:]         # 剩下的直接接上 #@takeRest
    return result`,
        SORT_TEST('merge_sort'),
        '归并排序动画'
      ),
      {
        type: 'text',
        html: `
<h2>为什么是 O(n log n)</h2>
<p>列表每次对半拆，拆到单个元素需要 log₂ n 层；每一层的合并操作总共要处理 n 个元素。所以总工作量约 n × log₂ n。n = 100 万时，n² 是 1 万亿，而 n log n 只有约 2000 万。</p>
<div class="table-wrap"><table>
<tr><th>特点</th><th>说明</th></tr>
<tr><td>时间复杂度</td><td>最好、平均、最坏都是 O(n log n)，非常稳定</td></tr>
<tr><td>额外空间</td><td>O(n)，合并时需要新的列表</td></tr>
<tr><td>稳定性</td><td>稳定：相等的元素保持原来的先后顺序（因为合并时用的是 <code>&lt;=</code>）</td></tr>
</table></div>`,
      },
      {
        type: 'quiz',
        q: '归并排序“分而治之”中，真正完成排序工作的是哪一步？',
        options: ['拆分', '合并', '递归到只剩一个元素', '选基准'],
        answer: 1,
        explain: '<p>拆分只是把列表切开，并不比较大小；所有的比较都发生在合并两个有序列表的时候。</p>',
      },
      {
        type: 'quiz',
        q: '归并排序的最坏时间复杂度是？',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        answer: 1,
        explain: '<p>不管输入是什么样，归并排序都是 log n 层、每层 O(n)，所以总是 O(n log n)。</p>',
      },
      {
        type: 'exercise',
        title: '合并两个有序列表',
        prompt: '<p>完成 <code>merge(left, right)</code>：<code>left</code> 和 <code>right</code> 都已经从小到大排好序，返回一个包含两者所有元素的新的有序列表。不要使用 <code>sort()</code> 或 <code>sorted()</code>。</p>',
        starter: `def merge(left, right):
    result = []
    i = 0    # 指向 left 中还没取的第一个元素
    j = 0    # 指向 right 中还没取的第一个元素
    # 1. 当两边都还有元素时：比较 left[i] 和 right[j]，小的放进 result

    # 2. 把剩下的部分接到 result 后面

    return result

print(merge([1, 4, 9], [2, 3, 10]))   # 应该是 [1, 2, 3, 4, 9, 10]`,
        solution: `def merge(left, right):
    result = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result += left[i:] + right[j:]
    return result`,
        tests: `expect(merge([1, 4, 9], [2, 3, 10]), [1, 2, 3, 4, 9, 10], "merge([1, 4, 9], [2, 3, 10])")
expect(merge([], [1, 2]), [1, 2], "merge([], [1, 2])")
expect(merge([5], []), [5], "merge([5], [])")
expect(merge([1, 1], [1]), [1, 1, 1], "merge([1, 1], [1])")`,
        hints: ['第 1 步用 <code>while i &lt; len(left) and j &lt; len(right):</code>，取走哪边的元素就让哪边的指针加 1。', '第 2 步一行就够：<code>result += left[i:] + right[j:]</code>（其中一个一定是空列表）。'],
      },
    ],
  });

  /* ———————————— 快速排序 ———————————— */
  DSA.lesson({
    id: 'quick-sort',
    part: P,
    title: '快速排序',
    glyph: '⇄',
    minutes: 15,
    summary: '选一个基准，小的放左边，大的放右边',
    blocks: [
      {
        type: 'text',
        html: `
<p><strong>快速排序</strong>也是分而治之，但思路和归并排序相反：先花力气<b>分好</b>，之后就不用合并了。</p>
<ol>
  <li>选一个元素作为<b>基准</b>（pivot），这里选每段的最后一个。</li>
  <li><b>分区</b>：把比基准小的都挪到左边，其余的留在右边，最后把基准放到两者中间。这时基准就在它最终的位置上了。</li>
  <li>对基准左边和右边的两段，分别递归做快速排序。</li>
</ol>`,
      },
      sortPlayer(
        'quick',
        `def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:                           # 0 或 1 个元素，不用排 #@base
        return arr
    p = partition(arr, lo, hi)             # 分区，基准归位 #@part
    quick_sort(arr, lo, p - 1)             # 排左边（都比基准小）
    quick_sort(arr, p + 1, hi)             # 排右边（都不比基准小）
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]                        # 选最后一个作基准 #@pivot
    i = lo                                 # i 左边都是比基准小的
    for j in range(lo, hi):
        if arr[j] < pivot:                 #@cmp
            arr[i], arr[j] = arr[j], arr[i]    #@swap
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]      # 基准放到中间 #@place
    return i`,
        SORT_TEST('quick_sort'),
        '快速排序动画'
      ),
      {
        type: 'text',
        html: `
<h2>快速排序快在哪，又怕什么</h2>
<p>如果每次基准都能把数据分成差不多大的两半，就和归并排序一样是 log n 层，平均 <b>O(n log n)</b>，而且原地交换、不需要额外列表，实际运行通常比归并排序还快。</p>
<p>但如果数据<b>已经有序</b>，每次选最后一个当基准，它总是最大的，分区后一边是空的、另一边只少了一个元素，就退化成 <b>O(n²)</b>。可以在动画里输入 <code>1, 2, 3, 4, 5, 6, 7, 8</code> 看看。实际使用时，常用“随机选基准”来避免这种情况。</p>
<h2>实际写代码时</h2>
<p>Python 内置的 <code>sorted()</code> 和 <code>list.sort()</code> 使用 Timsort 算法（结合了归并排序和插入排序），O(n log n) 且稳定。日常开发直接用它们就好；学习排序算法是为了理解其中的思想。</p>`,
      },
      {
        type: 'code',
        title: '内置排序的常见用法',
        code: `nums = [38, 27, 43, 3, 9]
print(sorted(nums))                 # 返回新列表，原列表不变
print(sorted(nums, reverse=True))   # 从大到小
nums.sort()                         # 原地排序
print(nums)

words = ["banana", "kiwi", "apple"]
print(sorted(words, key=len))       # 按长度排序`,
        out: "[3, 9, 27, 38, 43]\n[43, 38, 27, 9, 3]\n[3, 9, 27, 38, 43]\n['kiwi', 'apple', 'banana']\n",
      },
      {
        type: 'quiz',
        q: '一次分区（partition）完成后，可以确定什么？',
        options: ['整个数组有序', '基准元素已经在它最终的位置上', '左右两段长度相等', '最大值在最右边'],
        answer: 1,
        explain: '<p>基准左边都比它小，右边都不比它小，所以排好序后它就应该在这个位置。</p>',
      },
      {
        type: 'quiz',
        q: '总是选最后一个元素作基准时，什么样的输入会让快速排序最慢？',
        options: ['完全随机的数据', '已经排好序的数据', '只有两个元素', '所有元素都不相同'],
        answer: 1,
        explain: '<p>有序时基准总是当前段最大的数，每次分区只能减少一个元素，退化成 O(n²)。</p>',
      },
      {
        type: 'exercise',
        title: '用列表推导式写快速排序',
        prompt: `<p>Python 可以用<strong>列表推导式</strong>快速筛选元素：<code>[x for x in nums if x &lt; 5]</code> 表示“nums 中所有小于 5 的 x 组成的新列表”。</p>
<p>用它写一个简洁版的快速排序 <code>quick_sort(arr)</code>：取第一个元素作基准，把其余元素分成“比基准小”和“不比基准小”两组，分别递归排序后拼起来。</p>`,
        starter: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    rest = arr[1:]
    smaller = []      # 用列表推导式：rest 中比 pivot 小的
    larger = []       # 用列表推导式：rest 中不比 pivot 小的
    return quick_sort(smaller) + [pivot] + quick_sort(larger)

print(quick_sort([3, 6, 1, 8, 2, 9, 2]))`,
        solution: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    rest = arr[1:]
    smaller = [x for x in rest if x < pivot]
    larger = [x for x in rest if x >= pivot]
    return quick_sort(smaller) + [pivot] + quick_sort(larger)`,
        tests: SORT_TEST('quick_sort'),
        hints: ['<code>smaller = [x for x in rest if x &lt; pivot]</code>', '<code>larger = [x for x in rest if x &gt;= pivot]</code>，注意等号，否则和基准相等的元素会丢失。'],
      },
    ],
  });
})();
