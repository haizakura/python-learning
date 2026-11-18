# 新增与修改课程

课程都在 `public/js/lessons/` 下，每个文件是一个“部分”，里面调用 `DSA.lesson({...})` 注册若干课。课程按 `index.html` 中脚本的顺序、以及文件内的调用顺序排列。新增一个部分时，记得在 `index.html` 里 `app.js` 之前加一行 `<script>`。

改完运行 `node tests/check.mjs`，再在浏览器 Console 运行一次 `tests/skulpt-selftest.js`。

## 课程定义

```js
DSA.lesson({
  id: 'bubble-sort',       // 唯一；只能用小写字母、数字、连字符；也是网址里的 #bubble-sort
  part: '排序算法',         // 所属部分，相邻课程的 part 相同会分到一组
  title: '冒泡排序',
  glyph: '↥',              // 首页卡片上的小图标文字（1~4 个字符）
  minutes: 12,             // 预计学习时间
  summary: '相邻两两比较，大的往后冒',
  blocks: [ /* 内容块，见下 */ ],
});
```

`id` 不能用 `home`（首页的网址是 `#home`）。

> 测验答案和练习代码按 `课程id:块序号` 保存。给已发布的课程在中间插入块，会让之后块的已存进度错位，尽量往末尾追加。

## 内容块

### text：图文

```js
{ type: 'text', html: '<p>……</p><h2>小标题</h2><p>……</p>' }
```

可以使用 `<h2>`、`<h3>`、`<p>`、`<ul>`、`<ol>`、`<code>`、`<b>`。表格要包一层 `<div class="table-wrap">`，窄屏时才能横向滚动。插图可以写内联 SVG，参考第 1 课的 `figure-row`（可用的类：`soft`、`acc`、`ln`）。

### tip：提示框

```js
{ type: 'tip', kind: 'key', html: '<p>……</p>' }
```

`kind` 可选 `info`（提示）、`key`（重点）、`warn`（易错点）、`analogy`（打个比方）。

### code：可运行的代码

```js
{
  type: 'code',
  title: '可选的标题',
  code: `print("你好")`,
  out: '你好\n',        // 预期输出（建议填写）：测试会核对；网页里 Python 不可用时显示它
  run: false,           // 可选：设为 false 则只展示、不能运行
}
```

### quiz：单选测验

```js
{
  type: 'quiz',
  q: '问题（可以含 HTML）',
  options: ['选项 A', '选项 B', '选项 C'],
  answer: 1,            // 正确选项的下标，从 0 开始
  explain: '<p>答对后显示的解释</p>',
  hint: '答错时追加的一句提示（可选）',
}
```

### exercise：编程练习

```js
{
  type: 'exercise',
  title: '从 1 加到 n',
  prompt: '<p>题目说明</p>',
  starter: `def sum_to(n):\n    ...`,   // 初始代码：必须不能通过测试
  solution: `def sum_to(n):\n    ...`,  // 参考答案：必须通过测试
  tests: `expect(sum_to(4), 10, "sum_to(4)")`,
  hints: ['第一个提示', '第二个提示'],  // 逐个显示
}
```

“提交检查”会运行 `用户代码 + 测试辅助函数 + tests`。测试里用 `expect(实际值, 期望值, "说明")`，不通过时会显示“说明 应该得到 …，你的结果是 …”。用户代码的行号保持不变，报错定位到的就是用户写的那一行。

### widget：独立组件

```js
{ type: 'widget', name: 'complexity' }
```

已有：`guess`（猜数字）、`complexity`（复杂度曲线）、`sortRace`（排序大比拼）。新组件写在 `widgets.js`：`DSA.widgets.名字 = function (el, block, ctx) { … }`，在 `el` 里渲染即可。需要 id 的表单控件请用 `ctx.key` 拼出唯一 id。

### player：步骤动画

这是最核心的块。

```js
{
  type: 'player',
  title: '冒泡排序动画',
  hint: '初始说明文字（可选）',
  views: [
    { type: 'array', key: 'arr', title: 'arr', bars: true },
  ],
  init: () => ({ arr: DSA.items([5, 3, 8]) }),   // 初始状态，必须是纯 JSON
  actions: [
    {
      label: '开始排序',
      fresh: true,       // 每次都从 init() 开始；不写则在上一次的结果上继续
      input: { kind: 'nums', value: '5, 3, 8', maxLen: 12, random: DSA.randInput(8, 5, 99) },
      code: PY_CODE,     // 右侧显示的 Python 代码，用 #@标记 定位行
      test: PY_TEST,     // 可选：对 code 的 Python 测试，由 tests/check.mjs 运行
      run: function* (s, nums) {
        s.arr = DSA.items(nums);
        yield { at: 'cmp', msg: '比较……', hl: { cmp: [0, 1] }, vars: { i: 0, j: 0 } };
      },
    },
  ],
}
```

#### 代码行标记

在 Python 代码某一行末尾写 `#@名字`，展示时会被去掉，生成器里用 `at: '名字'` 就会高亮这一行：

```python
if arr[j] > arr[j + 1]:          #@cmp
    arr[j], arr[j + 1] = arr[j + 1], arr[j]   # 交换 #@swap
```

测试会检查每个 `at` 都能在代码里找到。

#### 生成器每一帧

| 字段 | 说明 |
| --- | --- |
| `at` | 代码行标记名 |
| `msg` | 这一步的说明（可含 HTML，必填） |
| `hl` | 高亮，见下 |
| `vars` | 变量表 `{名字: 值}`，值按 Python 写法显示（`null` → `None`，数组 → `[1, 2]`） |

生成器直接修改 `s`，每次 `yield` 时播放器会给 `s` 拍一张快照。可以用 `yield*` 调用子生成器来写递归动画（参考 `recursion`、`merge-sort`、`graph` 课）。

#### 输入框

| 写法 | 结果 |
| --- | --- |
| `{ kind: 'nums', value, min, max, maxLen }` | 逗号分隔的整数数组 |
| `{ kind: 'num', value, min, max }` | 一个整数 |
| `{ kind: 'text', value, maxLen }` | 字符串 |
| `{ parse: (text) => 值, value }` | 自定义解析；输入不合法时 `throw new Error('中文提示')` |

可选：`label`（屏幕阅读器标签）、`width`（输入框宽度，单位 em）、`random`（返回随机输入字符串的函数，会显示“随机”按钮）。

#### 高亮 hl

`hl` 里每个键都会变成 CSS 类 `m-键名`，值是**下标数组**（列表类视图）或**节点 id**（树、图）：

| 键 | 样式 | 常见用途 |
| --- | --- | --- |
| `cmp` | 黄 | 正在比较 |
| `swap` / `pop` / `del` / `err` | 红 | 交换、移动、删除、出错 |
| `done` / `visited` | 绿 | 已完成、已访问 |
| `found` | 实心绿 | 找到了 |
| `active` / `cur` | 蓝 / 黄（树） | 当前位置 |
| `new` / `min` / `pivot` / `key` | 紫 | 新元素、当前最小值、基准；`key` 还会上浮 |
| `frontier` | 黄色虚线 | 在队列里等待（图） |
| `path` | 黄色描边 | 递归路径上的节点（树、图） |
| `dim` | 变淡 | 不在当前范围内 |

特殊的键：

- `ptr: { lo: 0, mid: 3 }`：在数组下标下方显示指针名。
- `edge: ['A', 'B']`：高亮图中的一条边。
- `row: 3`：高亮哈希表的第 3 个桶；哈希表的元素用 `[桶, 序号]` 表示，例如 `cmp: [3, 0]`。

**多个视图时**，`hl` 按视图的 `key` 分开写：`hl: { chars: { active: [2] }, st: { new: [0] } }`。只有第一个视图时可以省略这一层，直接写 `hl: { cmp: [0, 1] }`。

#### 视图类型与数据格式

| type | `s[key]` 的格式 | 选项 |
| --- | --- | --- |
| `array` | `[{id, v}]`，用 `DSA.items()` 生成；`v` 为 `null` 显示为空格 | `bars`（柱状图）、`index: false`（隐藏下标）、`empty`（空时的文字） |
| `stack` | `[{id, v}]`，最后一个在最上面 | `topLabel`、`empty` |
| `linked` | `{ nodes: [{id, v}], floating: {id, v, label, note} \| null }` | — |
| `hash` | `[[{id, v}], …]`，每个桶一个数组 | — |
| `tree` | `{ nodes: {id: {v, l, r}}, root }`，`l`/`r` 是孩子 id 或 `null` | `empty` |
| `heaptree` | `[{id, v}]`，按堆的下标关系画成树（下标就是节点 id） | — |
| `graph` | `{ nodes: [{id, x, y}], edges: [[a, b]] }`，坐标在 400×260 画布内 | — |
| `out` | 值的数组，显示成一排标签 | `empty` |

同一份数据可以用两个视图显示，例如堆：`{type: 'heaptree', key: 'h'}` 和 `{type: 'array', key: 'h'}`。

新增视图类型：在 `views.js` 里写 `DSA.views.名字 = function (el, data, hl, opts) {…}`，在 `style.css` 里加样式。可以复用里面的 `marks(hl, key)` 生成高亮类名。

## 排序算法与“排序大比拼”

五种排序的生成器在 `04-sorting.js` 的 `DSA.algo` 上，课程播放器和总结课的 `sortRace` 组件共用。大比拼按帧的 `at` 计数：

- 每比较一次两个元素，yield 一次 `at: 'cmp'`
- 每交换 / 挪动 / 写入一次元素，yield 一次 `at` 以 `swap`、`shift`、`place`、`take` 开头的帧

新增排序算法时遵守这个约定，再把它加到 `widgets.js` 的 `ALGOS` 和 `tests/check.mjs` 的排序列表里。

## 写给零基础读者的约定

- 每个新概念第一次出现时加粗并解释，尽量配一个生活中的类比（`tip` 的 `analogy`）。
- 代码注释写“为什么”，并且只用课程里已经讲过的语法。
- 动画的每一帧 `msg` 都要说清楚“这一步在做什么、为什么”。
- 练习要提供 1~2 个逐步具体的提示，最后一个提示可以接近答案。
- 避免使用 Skulpt 不支持的 `nonlocal`，以及 `input()`。
