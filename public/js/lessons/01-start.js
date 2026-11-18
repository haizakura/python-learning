/* 第一部分 · 起步：欢迎、Python 入门（上/下）、时间复杂度 */
(() => {
  const P = '起步';
  const R = DSA.range;

  DSA.lesson({
    id: 'welcome',
    part: P,
    title: '什么是数据结构与算法',
    glyph: 'Hi',
    minutes: 8,
    summary: '用生活中的例子认识两个核心概念',
    blocks: [
      {
        type: 'text',
        html: `
<p>欢迎！这门课写给<strong>完全没有编程基础</strong>的你。我们会用动画把每一步画出来，再用 Python 亲手实现。遇到不懂的词也别担心，第一次出现时都会解释。</p>
<h2>数据结构：数据怎么摆放</h2>
<p>同样一堆东西，摆放方式不同，用起来的方便程度天差地别。<strong>数据结构</strong>就是在电脑里组织数据的方式。你其实早就见过它们：</p>
<div class="figure-row">
  <figure><svg viewBox="0 0 200 120" aria-hidden="true">
    <rect class="soft" x="60" y="86" width="80" height="14" rx="4"/><rect class="soft" x="60" y="68" width="80" height="14" rx="4"/>
    <rect class="soft" x="60" y="50" width="80" height="14" rx="4"/><rect class="acc" x="60" y="32" width="80" height="14" rx="4"/>
    <text x="148" y="43">← 只能拿最上面</text></svg>
    <figcaption><b>栈</b>：一摞盘子，后放上去的先拿走</figcaption></figure>
  <figure><svg viewBox="0 0 200 120" aria-hidden="true">
    <circle class="acc" cx="40" cy="60" r="14"/><circle class="soft" cx="76" cy="60" r="14"/><circle class="soft" cx="112" cy="60" r="14"/><circle class="soft" cx="148" cy="60" r="14"/>
    <path class="ln" d="M24 92 H176"/><path class="ln" d="M30 86 L22 92 L30 98"/><text x="20" y="28">先来的先走</text></svg>
    <figcaption><b>队列</b>：排队买奶茶，先到先得</figcaption></figure>
  <figure><svg viewBox="0 0 200 120" aria-hidden="true">
    <path class="ln" d="M100 26 L60 64 M100 26 L140 64 M60 64 L40 100 M60 64 L80 100 M140 64 L160 100"/>
    <circle class="acc" cx="100" cy="26" r="12"/><circle class="soft" cx="60" cy="64" r="12"/><circle class="soft" cx="140" cy="64" r="12"/>
    <circle class="soft" cx="40" cy="100" r="10"/><circle class="soft" cx="80" cy="100" r="10"/><circle class="soft" cx="160" cy="100" r="10"/></svg>
    <figcaption><b>树</b>：家谱、公司组织架构、电脑里的文件夹</figcaption></figure>
</div>
<h2>算法：解决问题的步骤</h2>
<p><strong>算法</strong>就是一套明确的、一步一步的解题方法，像一份菜谱：按顺序照做，就能得到结果。查字典时先翻到大概的位置再前后调整，这就是一种算法。</p>
<p>好的数据结构配上好的算法，程序就能又快又省。比如在 100 万个名字里找一个人，笨办法要比较 100 万次，好办法只要 20 次左右。下面的小游戏能让你亲身感受这个差距。</p>`,
      },
      { type: 'widget', name: 'guess' },
      {
        type: 'tip',
        kind: 'key',
        html: '<p>猜数字时，“每次猜中间”比“从 1 开始挨个猜”快得多。这两种方法就是两种不同的算法。第 11 课会把它写成真正的代码：<b>二分查找</b>。</p>',
      },
      {
        type: 'text',
        html: `
<h2>这门课怎么学</h2>
<p>每一课都按同样的节奏进行：</p>
<ol>
  <li><b>图文讲解</b>：用生活中的类比引出概念。</li>
  <li><b>动画演示</b>：点“播放”看算法一步步执行，右侧的 Python 代码会高亮当前执行的那一行，变量表会显示每个变量此刻的值。</li>
  <li><b>运行代码</b>：每个代码框都能直接运行，也能点“修改代码”自己改着玩。</li>
  <li><b>测验与练习</b>：小测验检查理解，编程练习会自动判断你写得对不对。</li>
</ol>
<p>你的学习进度（学到哪一课、测验答案、练习代码）会<b>自动保存在这台设备的浏览器里</b>。下次打开网页，会直接回到上次的位置。换浏览器或清除浏览数据后进度会丢失。</p>`,
      },
      {
        type: 'quiz',
        q: '下面哪个生活场景最像“栈”？',
        options: ['在食堂排队打饭', '一摞叠起来的盘子', '按拼音排好的字典', '城市之间的地铁线路'],
        answer: 1,
        explain: '<p>叠盘子时，最后放上去的在最上面，也最先被拿走，这叫<b>后进先出</b>，正是栈的特点。排队是“先进先出”的队列。</p>',
      },
      {
        type: 'quiz',
        q: '关于“算法”，哪一句说得对？',
        options: ['算法只能由电脑执行', '算法就是数学公式', '算法是解决问题的明确步骤', '只有程序员才会用到算法'],
        answer: 2,
        explain: '<p>算法是一套明确的步骤。人也可以执行算法，比如你刚才“每次猜中间”的策略。</p>',
      },
    ],
  });

  DSA.lesson({
    id: 'python-basics-1',
    part: P,
    title: 'Python 入门（上）：变量、运算与列表',
    glyph: 'x=1',
    minutes: 15,
    summary: '写下第一行代码，认识变量和列表',
    blocks: [
      {
        type: 'text',
        html: `
<p>编程就是给电脑写一份清晰的指令清单。Python 是最适合入门的编程语言之一：语法简洁，读起来接近英语。这一课不需要安装任何软件，代码直接在网页里运行。</p>
<h2>第一行代码</h2>
<p><code>print()</code> 的作用是把括号里的内容显示出来。点击下面的 <b>▶ 运行</b> 试试，然后点“修改代码”，把文字换成你的名字再运行一次。</p>`,
      },
      { type: 'code', code: 'print("你好，算法！")', out: '你好，算法！\n' },
      {
        type: 'text',
        html: `
<h2>变量：贴了名字的盒子</h2>
<p><strong>变量</strong>用来存放数据。<code>age = 18</code> 的意思是：把 18 放进一个叫 <code>age</code> 的盒子里。这里的 <code>=</code> 不是“等于”，而是<b>赋值</b>：把右边的值存到左边的名字里。</p>
<p>文字要用引号包起来，叫做<strong>字符串</strong>；数字不用引号。<code>#</code> 后面的内容是<strong>注释</strong>，写给人看的，电脑会忽略它。</p>`,
      },
      {
        type: 'code',
        title: '变量可以重新赋值',
        code: `age = 18
name = "小明"
print(name, "今年", age, "岁")
age = age + 1   # 先算右边 18 + 1，再把结果 19 存回 age
print("明年", age, "岁")`,
        out: '小明 今年 18 岁\n明年 19 岁\n',
      },
      {
        type: 'text',
        html: `
<h2>算术运算</h2>
<p>后面的算法课里，<code>//</code>（整除）和 <code>%</code>（取余数）会经常出现，先混个脸熟。</p>`,
      },
      {
        type: 'code',
        code: `print(7 + 3)    # 加
print(7 - 3)    # 减
print(7 * 3)    # 乘
print(7 / 2)    # 除，结果是小数
print(7 // 2)   # 整除：只要整数部分
print(7 % 2)    # 取余数：7 除以 2 余 1
print(2 ** 10)  # 乘方：2 的 10 次方`,
        out: '10\n4\n21\n3.5\n3\n1\n1024\n',
      },
      {
        type: 'text',
        html: `
<h2>列表：一排带编号的格子</h2>
<p><strong>列表</strong>（list）用方括号把多个数据按顺序装在一起，比如 <code>nums = [5, 3, 8, 1]</code>。每个格子都有一个编号，叫<strong>下标</strong>（也叫索引）。</p>
<p>最重要的一点：<b>下标从 0 开始</b>。第一个元素是 <code>nums[0]</code>，第二个是 <code>nums[1]</code>。负数下标从末尾往前数：<code>nums[-1]</code> 是最后一个。</p>`,
      },
      {
        type: 'player',
        title: '动手试试：列表的下标',
        views: [{ type: 'array', key: 'nums', title: 'nums' }],
        init: () => ({ nums: DSA.items([5, 3, 8, 1, 9]) }),
        hint: '在输入框里填一个下标（可以是负数），点“读取”看看取到的是哪个元素；也可以往末尾追加新元素。',
        actions: [
          {
            label: '读取 nums[i]',
            input: { kind: 'num', value: '2', min: -12, max: 12, label: '下标 i', width: 4 },
            code: `value = nums[i]   #@read
print(value)      #@print`,
            run: function* (s, i) {
              const n = s.nums.length;
              if (i < -n || i >= n) {
                yield { at: 'read', msg: `列表只有 ${n} 个元素，合法下标是 0 ~ ${n - 1}（或 -${n} ~ -1）。nums[${i}] 越界了，Python 会报 <b>IndexError</b>。`, hl: { err: [] }, vars: { i } };
                return;
              }
              const real = i < 0 ? n + i : i;
              if (i < 0) yield { at: 'read', msg: `负数下标从末尾数：nums[${i}] 就是倒数第 ${-i} 个，相当于 nums[${n} - ${-i}] = nums[${real}]。`, hl: { ptr: { i: real } }, vars: { i } };
              yield { at: 'read', msg: `直接跳到下标 ${real} 的格子取值，不需要从头数。`, hl: { active: [real], ptr: { i: real } }, vars: { i } };
              yield { at: 'print', msg: `打印出 ${s.nums[real].v}`, hl: { found: [real], ptr: { i: real } }, vars: { i, value: s.nums[real].v } };
            },
          },
          {
            label: 'nums.append(x)',
            input: { kind: 'num', value: '7', label: '要追加的数 x', width: 4 },
            code: `nums.append(x)   # 放到列表末尾 #@append
print(nums)      #@print`,
            run: function* (s, x) {
              if (s.nums.length >= 10) {
                yield { at: 'append', msg: '格子快放不下了，先点“恢复初始状态”吧。' };
                return;
              }
              s.nums.push({ id: DSA.uid(), v: x });
              const i = s.nums.length - 1;
              yield { at: 'append', msg: `${x} 被放到末尾，下标是 ${i}。列表长度变成 ${s.nums.length}。`, hl: { new: [i] }, vars: { x } };
              yield { at: 'print', msg: `nums = ${DSA.pyRepr(DSA.vals(s.nums))}`, hl: {}, vars: { x } };
            },
          },
        ],
      },
      {
        type: 'code',
        title: '列表的常用操作',
        code: `nums = [5, 3, 8, 1]
print(nums[0])      # 第一个元素
print(nums[-1])     # 最后一个元素
print(len(nums))    # len() 求长度
nums.append(9)      # 在末尾添加
nums[1] = 30        # 修改下标 1 的元素
print(nums)`,
        out: '5\n1\n4\n[5, 30, 8, 1, 9]\n',
      },
      {
        type: 'tip',
        kind: 'warn',
        html: '<p>代码里的标点必须是<b>英文半角</b>的：引号 <code>"</code>、逗号 <code>,</code>、括号 <code>()</code>。用中文标点会出现 SyntaxError（语法错误）。</p>',
      },
      {
        type: 'quiz',
        q: '<code>nums = [10, 20, 30, 40]</code>，那么 <code>nums[1]</code> 是多少？',
        options: ['10', '20', '30', '40'],
        answer: 1,
        explain: '<p>下标从 0 开始：nums[0] 是 10，nums[1] 是 20。</p>',
      },
      {
        type: 'quiz',
        q: '<code>print(17 % 5)</code> 会输出什么？',
        options: ['3.4', '3', '2', '85'],
        answer: 2,
        explain: '<p><code>%</code> 是取余数：17 = 5 × 3 + 2，余数是 2。<code>17 // 5</code> 才是 3。</p>',
      },
      {
        type: 'exercise',
        title: '算一算总价',
        prompt: '<p>购物车里有三件商品，价格存在列表 <code>prices</code> 里。请用<b>下标</b>取出这三个价格，相加后存进变量 <code>total</code>。</p>',
        starter: `prices = [12, 30, 18]
# 用 prices[0]、prices[1]、prices[2] 取出价格，相加后存进 total
total = 0
print(total)`,
        solution: `prices = [12, 30, 18]
total = prices[0] + prices[1] + prices[2]
print(total)`,
        tests: `expect(total, 60, "total")`,
        hints: ['第一个价格是 <code>prices[0]</code>，下标从 0 开始。', '把 <code>total = 0</code> 改成 <code>total = prices[0] + prices[1] + prices[2]</code>。'],
      },
    ],
  });

  DSA.lesson({
    id: 'python-basics-2',
    part: P,
    title: 'Python 入门（下）：条件、循环与函数',
    glyph: 'for',
    minutes: 20,
    summary: '让程序会判断、会重复、能复用',
    blocks: [
      {
        type: 'text',
        html: `
<h2>条件判断：if / elif / else</h2>
<p>程序经常需要“如果……就……否则……”。注意两件事：条件后面要有<b>冒号</b> <code>:</code>，属于这个条件的代码要<b>缩进 4 个空格</b>。Python 就是靠缩进来判断哪些代码是一组的。</p>`,
      },
      {
        type: 'code',
        code: `score = 85
if score >= 90:
    print("优秀")
elif score >= 60:      # elif 是 else if 的缩写
    print("及格")
else:
    print("要加油")`,
        out: '及格\n',
      },
      {
        type: 'text',
        html: `
<p>常用的比较和逻辑运算：</p>
<div class="table-wrap"><table>
<tr><th>写法</th><th>含义</th><th>例子（结果）</th></tr>
<tr><td><code>==</code></td><td>等于（两个等号！）</td><td><code>3 == 3</code>（True）</td></tr>
<tr><td><code>!=</code></td><td>不等于</td><td><code>3 != 4</code>（True）</td></tr>
<tr><td><code>&lt;  &gt;  &lt;=  &gt;=</code></td><td>大小比较</td><td><code>5 &lt;= 4</code>（False）</td></tr>
<tr><td><code>and  or  not</code></td><td>并且、或者、取反</td><td><code>1 &lt; 2 and 2 &lt; 3</code>（True）</td></tr>
</table></div>
<h2>for 循环：对每个元素做同样的事</h2>
<p><code>for x in 列表:</code> 会依次把列表里的每个元素放进变量 <code>x</code>，再执行一遍缩进的代码。<code>range(5)</code> 会产生 0, 1, 2, 3, 4 这 5 个数（不包括 5），<code>range(2, 5)</code> 产生 2, 3, 4。</p>`,
      },
      {
        type: 'code',
        code: `fruits = ["苹果", "香蕉", "橙子"]
for f in fruits:
    print("我喜欢" + f)

for i in range(3):
    print("第", i, "次")`,
        out: '我喜欢苹果\n我喜欢香蕉\n我喜欢橙子\n第 0 次\n第 1 次\n第 2 次\n',
      },
      {
        type: 'text',
        html: '<p>下面这个动画逐行执行一个“求和”程序。注意观察右侧变量表里 <code>x</code> 和 <code>total</code> 的变化，这是理解循环最好的办法。</p>',
      },
      {
        type: 'player',
        title: '循环是怎么一步步执行的',
        views: [{ type: 'array', key: 'nums', title: 'nums' }],
        init: () => ({ nums: DSA.items([3, 1, 4, 1, 5]) }),
        actions: [
          {
            label: '逐行运行',
            fresh: true,
            input: { kind: 'nums', value: '3, 1, 4, 1, 5', maxLen: 8, label: '列表内容', random: DSA.randInput(5, 1, 9) },
            code: `nums = [3, 1, 4, 1, 5]
total = 0              #@init
for x in nums:         #@loop
    total = total + x  #@add
print(total)           #@print`,
            run: function* (s, nums) {
              s.nums = DSA.items(nums);
              let total = 0;
              yield { at: 'init', msg: '准备一个变量 <code>total</code> 用来累加，初始值是 0。', vars: { total } };
              for (let i = 0; i < nums.length; i++) {
                const x = nums[i];
                yield { at: 'loop', msg: `for 循环取出第 ${i + 1} 个元素，放进 x：x = ${x}`, hl: { active: [i], done: R(0, i) }, vars: { total, x } };
                total += x;
                yield { at: 'add', msg: `计算 total + x = ${total - x} + ${x} = ${total}，再存回 total。`, hl: { cmp: [i], done: R(0, i) }, vars: { total, x } };
              }
              yield { at: 'print', msg: `所有元素都取完了，循环结束。打印 total：<b>${total}</b>`, hl: { done: R(0, nums.length) }, vars: { total } };
            },
          },
        ],
      },
      {
        type: 'text',
        html: `
<h2>while 循环：条件成立就一直重复</h2>
<p>当你不知道要循环几次、只知道“什么时候停”时，用 <code>while</code>。一定要确保循环里有东西在变化，最终让条件变成 False，否则就成了停不下来的<b>死循环</b>（本站会在 5 秒后自动停止它）。</p>`,
      },
      {
        type: 'code',
        title: '不断翻倍，直到超过 100',
        code: `n = 1
while n < 100:
    n = n * 2
print(n)`,
        out: '128\n',
      },
      {
        type: 'text',
        html: `
<h2>函数：把一段代码打包起来反复用</h2>
<p>用 <code>def</code> 定义函数。括号里是<strong>参数</strong>（函数需要的输入），<code>return</code> 把结果交回给调用者。定义好以后，写 <code>函数名(参数)</code> 就能使用它。后面每个算法，我们都会写成一个函数。</p>`,
      },
      {
        type: 'code',
        code: `def find_max(nums):
    best = nums[0]          # 先假设第一个最大
    for x in nums:
        if x > best:        # 遇到更大的就更新
            best = x
    return best

print(find_max([3, 9, 2, 7]))
print(find_max([-5, -1, -8]))`,
        out: '9\n-1\n',
      },
      {
        type: 'tip',
        kind: 'info',
        html: '<p>代码出错时不要慌。运行结果里会显示错误类型、出错的行号，以及一段白话解释。读懂错误信息是程序员最重要的技能之一。</p>',
      },
      {
        type: 'quiz',
        q: '<code>for i in range(1, 4): print(i)</code> 会打印出哪些数？',
        options: ['1 2 3 4', '1 2 3', '0 1 2 3', '0 1 2 3 4'],
        answer: 1,
        explain: '<p><code>range(a, b)</code> 从 a 开始，到 b 之前结束（不包括 b）。</p>',
      },
      {
        type: 'quiz',
        q: '下面关于 Python 缩进的说法，哪个正确？',
        options: ['缩进只是为了好看，可有可无', '缩进决定了哪些代码属于 if / for / def', '缩进必须用 Tab 键', '只有函数需要缩进'],
        answer: 1,
        explain: '<p>Python 用缩进表示代码块。if、for、while、def 下面属于它们的代码都要缩进，一般用 4 个空格。</p>',
      },
      {
        type: 'exercise',
        title: '从 1 加到 n',
        prompt: '<p>完成函数 <code>sum_to(n)</code>，返回 1 + 2 + … + n 的结果。例如 <code>sum_to(4)</code> 应该返回 10。</p>',
        starter: `def sum_to(n):
    total = 0
    # 用 for 循环和 range，把 1 到 n 依次加到 total 上

    return total

print(sum_to(4))`,
        solution: `def sum_to(n):
    total = 0
    for i in range(1, n + 1):
        total = total + i
    return total`,
        tests: `expect(sum_to(1), 1, "sum_to(1)")
expect(sum_to(4), 10, "sum_to(4)")
expect(sum_to(100), 5050, "sum_to(100)")`,
        hints: ['<code>range(1, n + 1)</code> 会产生 1, 2, …, n。', '循环里写 <code>total = total + i</code>，注意这一行要比 for 多缩进一层。'],
      },
      {
        type: 'exercise',
        title: '数一数有几个偶数',
        prompt: '<p>完成函数 <code>count_even(nums)</code>，返回列表里偶数的个数。偶数就是除以 2 余数为 0 的数，可以用 <code>x % 2 == 0</code> 判断。</p>',
        starter: `def count_even(nums):
    count = 0
    # 遍历 nums，遇到偶数就让 count 加 1

    return count

print(count_even([1, 2, 3, 4, 6]))`,
        solution: `def count_even(nums):
    count = 0
    for x in nums:
        if x % 2 == 0:
            count = count + 1
    return count`,
        tests: `expect(count_even([1, 2, 3, 4, 6]), 3, "count_even([1, 2, 3, 4, 6])")
expect(count_even([1, 3, 5]), 0, "count_even([1, 3, 5])")
expect(count_even([]), 0, "count_even([])")`,
        hints: ['先写 <code>for x in nums:</code>，再在循环里写 <code>if x % 2 == 0:</code>。'],
      },
    ],
  });

  DSA.lesson({
    id: 'complexity',
    part: P,
    title: '时间复杂度：怎样衡量快慢',
    glyph: 'O(n)',
    minutes: 15,
    summary: '用大 O 表示法比较算法的效率',
    blocks: [
      {
        type: 'text',
        html: `
<p>两个程序都能完成任务，哪个更好？最直接的想法是比谁跑得快。但同一段代码在新电脑和旧电脑上的耗时不一样，所以我们换个角度：<b>数一数它要做多少步</b>，以及<b>数据变多时，步数增长得有多快</b>。</p>
<h2>大 O 表示法</h2>
<p>我们用 <code>n</code> 表示数据量（比如列表长度），用 <strong>O(…)</strong> 描述步数随 n 增长的趋势。只看增长最快的那一项，忽略常数：</p>
<ul>
  <li>步数是 <code>3n + 5</code>：n 很大时，5 和系数 3 都不重要，记作 <b>O(n)</b>。</li>
  <li>步数是 <code>n² / 2 + n</code>：n² 增长最快，记作 <b>O(n²)</b>。</li>
  <li>不管 n 多大都只要固定几步：记作 <b>O(1)</b>。</li>
</ul>`,
      },
      {
        type: 'code',
        title: '四种常见的复杂度',
        code: `def get_first(nums):              # O(1)：不管列表多长，都只做一步
    return nums[0]

def total(nums):                  # O(n)：每个元素看一遍
    s = 0
    for x in nums:
        s += x
    return s

def has_pair_sum(nums, target):   # O(n²)：两层循环，两两组合
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return True
    return False

def halving(n):                   # O(log n)：每次减半
    steps = 0
    while n > 1:
        n = n // 2
        steps += 1
    return steps

print(get_first([7, 8, 9]), total([1, 2, 3]), has_pair_sum([1, 4, 6], 10), halving(1024))`,
        out: '7 6 True 10\n',
      },
      {
        type: 'text',
        html: '<p>拖动下面的滑块改变 n，看看不同复杂度的操作次数差距有多大。表格最后一列假设电脑每步需要 1 微秒（百万分之一秒）。</p>',
      },
      { type: 'widget', name: 'complexity' },
      {
        type: 'text',
        html: `
<p>从快到慢的常见复杂度：</p>
<div class="table-wrap"><table>
<tr><th>复杂度</th><th>叫法</th><th>典型例子</th></tr>
<tr><td>O(1)</td><td>常数时间</td><td>用下标访问列表元素、字典查找</td></tr>
<tr><td>O(log n)</td><td>对数时间</td><td>二分查找（每次排除一半）</td></tr>
<tr><td>O(n)</td><td>线性时间</td><td>遍历列表、找最大值</td></tr>
<tr><td>O(n log n)</td><td>线性对数</td><td>归并排序、快速排序</td></tr>
<tr><td>O(n²)</td><td>平方时间</td><td>两层嵌套循环、冒泡排序</td></tr>
<tr><td>O(2ⁿ)</td><td>指数时间</td><td>不加优化的递归求斐波那契数</td></tr>
</table></div>
<p>除了时间，算法占用的额外内存叫<strong>空间复杂度</strong>，也用大 O 表示。比如复制一份列表需要 O(n) 的额外空间。</p>`,
      },
      {
        type: 'code',
        title: '亲眼看看 O(n²) 的增长',
        code: `def count_steps(n):
    steps = 0
    for i in range(n):
        for j in range(n):
            steps += 1
    return steps

for n in [10, 100, 300]:
    print(n, count_steps(n))`,
        out: '10 100\n100 10000\n300 90000\n',
      },
      {
        type: 'tip',
        kind: 'key',
        html: '<p>判断复杂度的经验：一层遍历 n 个元素的循环是 O(n)；两层嵌套是 O(n²)；每次把问题规模减半是 O(log n)。</p>',
      },
      {
        type: 'quiz',
        q: '一个函数里有<b>两层嵌套</b>的 for 循环，每层都遍历整个长度为 n 的列表。它的时间复杂度是？',
        options: ['O(1)', 'O(n)', 'O(2n)', 'O(n²)'],
        answer: 3,
        explain: '<p>外层每走一步，内层都要走 n 步，一共 n × n = n² 步。</p>',
      },
      {
        type: 'quiz',
        q: '<code>while n > 1: n = n // 2</code> 这个循环大约执行多少次？',
        options: ['n 次', 'n / 2 次', 'log₂ n 次', 'n² 次'],
        answer: 2,
        explain: '<p>每次除以 2，1024 只需要 10 次就降到 1（2¹⁰ = 1024）。这就是 O(log n)，增长极慢。</p>',
      },
      {
        type: 'quiz',
        q: '步数为 <code>5n + 100</code> 的算法，用大 O 表示是？',
        options: ['O(5n + 100)', 'O(n)', 'O(100)', 'O(5)'],
        answer: 1,
        explain: '<p>大 O 只关心增长趋势，常数系数和常数项都省略。</p>',
      },
      {
        type: 'exercise',
        title: '有没有重复元素',
        prompt: '<p>完成 <code>has_duplicate(nums)</code>：如果列表中有两个位置的值相同，返回 <code>True</code>，否则返回 <code>False</code>。这一课先用两层循环（O(n²)）实现，学到哈希表时我们会用更快的 O(n) 方法。</p>',
        starter: `def has_duplicate(nums):
    # 用两层循环比较每一对元素 nums[i] 和 nums[j]（j > i）

    return False

print(has_duplicate([3, 1, 4, 1]))`,
        solution: `def has_duplicate(nums):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`,
        tests: `expect(has_duplicate([3, 1, 4, 1]), True, "has_duplicate([3, 1, 4, 1])")
expect(has_duplicate([1, 2, 3]), False, "has_duplicate([1, 2, 3])")
expect(has_duplicate([]), False, "has_duplicate([])")
expect(has_duplicate([7, 7]), True, "has_duplicate([7, 7])")`,
        hints: ['参考上面代码里的 <code>has_pair_sum</code>，结构几乎一样。', '内层循环从 <code>i + 1</code> 开始，避免拿元素和它自己比较。'],
      },
    ],
  });
})();
