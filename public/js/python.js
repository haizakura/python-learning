/* python.js — 在浏览器里运行 Python（Skulpt），以及 Python 代码高亮。
 * Skulpt 是纯 JS 的 Python 3 实现，只需加载两个脚本文件，
 * 不需要 fetch/wasm，所以在 Claude Artifacts 的 CSP 下也能工作。
 * 限制：它是 Python 的一个子集（见 docs/ARCHITECTURE.md），课程代码都在其中测试过。 */
DSA.py = (() => {
  const CDN = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/';
  const TIME_LIMIT = 5000; // 毫秒，防止死循环卡死页面
  let loading = null;
  let queue = Promise.resolve(); // Skulpt 是全局单例，一次只跑一段代码
  let broken = null; // 运行环境不可用的原因

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('脚本加载失败：' + src));
      document.head.appendChild(s);
    });
  }

  // Skulpt 自带的 heapq 只是占位（会抛 NotImplementedError），换成纯 Python 实现
  const HEAPQ = `
def heappush(heap, item):
    heap.append(item)
    _siftdown(heap, 0, len(heap) - 1)

def heappop(heap):
    last = heap.pop()
    if heap:
        top = heap[0]
        heap[0] = last
        _siftup(heap, 0)
        return top
    return last

def heapify(x):
    for i in reversed(range(len(x) // 2)):
        _siftup(x, i)

def heappushpop(heap, item):
    if heap and heap[0] < item:
        item, heap[0] = heap[0], item
        _siftup(heap, 0)
    return item

def heapreplace(heap, item):
    top = heap[0]
    heap[0] = item
    _siftup(heap, 0)
    return top

def nsmallest(n, iterable):
    return sorted(iterable)[:n]

def nlargest(n, iterable):
    return sorted(iterable, reverse=True)[:n]

def _siftdown(heap, start, pos):
    item = heap[pos]
    while pos > start:
        parent = (pos - 1) // 2
        if item < heap[parent]:
            heap[pos] = heap[parent]
            pos = parent
            continue
        break
    heap[pos] = item

def _siftup(heap, pos):
    end = len(heap)
    start = pos
    item = heap[pos]
    child = 2 * pos + 1
    while child < end:
        right = child + 1
        if right < end and not heap[child] < heap[right]:
            child = right
        heap[pos] = heap[child]
        pos = child
        child = 2 * pos + 1
    heap[pos] = item
    _siftdown(heap, start, pos)
`;

  function load() {
    if (!loading) {
      loading = loadScript(CDN + 'skulpt.min.js')
        .then(() => loadScript(CDN + 'skulpt-stdlib.js'))
        .then(() => {
          globalThis.Sk.builtinFiles.files['src/lib/heapq.py'] = HEAPQ;
        })
        .catch((e) => {
          loading = null; // 允许下次重试
          throw e;
        });
    }
    return loading;
  }

  // 常见错误的白话解释，给零基础同学看
  const FRIENDLY = {
    SyntaxError: '语法错误：Python 读不懂这段代码。常见原因：if/for/def 那一行末尾漏了冒号 “:”；缩进没对齐（if/for/def 的下一行要多缩进 4 个空格）；括号或引号没有成对；用了中文标点。',
    IndentationError: '缩进错误：Python 用缩进表示“哪些代码属于同一块”。if/for/while/def 的下一行要多缩进 4 个空格，同一块里的行要对齐。',
    NameError: '名字错误：用到了一个还不存在的变量或函数。检查拼写（大小写也算），以及是不是在赋值之前就用了它。',
    IndexError: '下标越界：访问了列表里不存在的位置。长度为 n 的列表，合法下标是 0 到 n-1。',
    KeyError: '键不存在：字典里没有这个键。可以先用 `key in d` 判断，或者用 d.get(key)。',
    TypeError: '类型错误：对不合适的类型做了操作，比如把字符串和数字直接相加（"a" + 1），或者函数参数个数不对。',
    ValueError: '值错误：类型没问题，但值不合适，比如 int("abc")。',
    ZeroDivisionError: '除以零：除数不能是 0。',
    AttributeError: '属性错误：这个对象没有你要的属性或方法。检查拼写，或者变量是不是意外变成了 None。',
    RecursionError: '递归太深：函数一直在调用自己停不下来。检查是否写了基线条件（什么时候直接 return）。',
    TimeLimitError: `运行超过 ${TIME_LIMIT / 1000} 秒被自动停止：很可能出现了死循环，比如 while 的条件永远为真，或者忘了让循环变量变化。`,
    AssertionError: '测试没有通过：你的结果和预期不一致，看看下面的具体信息。',
  };

  function describe(e, userLines) {
    const Sk = globalThis.Sk;
    if (Sk && e instanceof Sk.builtin.BaseException) {
      const type = e.tp$name;
      const line = e.traceback && e.traceback.length ? e.traceback[0].lineno : null;
      const text = e.toString().replace(/ on line \d+$/, '');
      const inTests = userLines && line && line > userLines;
      return { type, line: inTests ? null : line, text, friendly: FRIENDLY[type] || '' };
    }
    if (e instanceof RangeError) return { type: 'RecursionError', line: null, text: 'RecursionError: 调用层数太多', friendly: FRIENDLY.RecursionError };
    return { type: 'Error', line: null, text: String(e && e.message ? e.message : e), friendly: '' };
  }

  async function exec(code, { onOut, userLines } = {}) {
    try {
      await load();
    } catch (e) {
      broken = '无法加载 Python 运行环境（可能是网络受限）。可以稍后重试，或把代码复制到本地的 Python 中运行。';
      return { ok: false, out: '', unavailable: broken };
    }
    const Sk = globalThis.Sk;
    let out = '';
    Sk.configure({
      output: (t) => {
        out += t;
        if (onOut) onOut(out);
      },
      read: (f) => {
        if (!Sk.builtinFiles || Sk.builtinFiles.files[f] === undefined) throw "File not found: '" + f + "'";
        return Sk.builtinFiles.files[f];
      },
      __future__: Sk.python3,
      execLimit: TIME_LIMIT,
      yieldLimit: 100, // 定期让出主线程，页面不会冻住
      inputfunTakesPrompt: true,
      inputfun: () => {
        throw new Sk.builtin.RuntimeError('在线运行不支持 input()，请直接给变量赋值，例如 name = "小明"');
      },
    });
    Sk.execStart = Date.now();
    try {
      await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true));
      return { ok: true, out };
    } catch (e) {
      if (e instanceof EvalError || /unsafe-eval/.test(String(e && e.message))) {
        broken = '当前页面的安全策略不允许在线运行 Python。可以把代码复制到本地的 Python 中运行。';
        return { ok: false, out, unavailable: broken };
      }
      return { ok: false, out, error: describe(e, userLines) };
    }
  }

  // 串行执行：上一段跑完再跑下一段
  function run(code, opts) {
    const p = queue.then(() => exec(code, opts));
    queue = p.catch(() => {});
    return p;
  }

  /* —— 语法高亮：一个够用的小型正则分词器 —— */
  const KW = 'def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|pass|break|continue|lambda|yield|with|try|except|finally|raise|global|nonlocal|assert|del';
  const BI = 'print|len|range|list|dict|set|tuple|int|str|float|bool|sorted|reversed|sum|min|max|abs|enumerate|zip|map|filter|any|all|round|divmod|isinstance|ord|chr|type|input|repr|hash|iter|next|super|self';
  const RE = new RegExp(
    String.raw`(#[^\n]*)|([rfbu]?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|\b(\d+(?:\.\d+)?)\b|\b(${KW})\b|\b(${BI})\b`,
    'g'
  );
  const CLS = ['c', 's', 'n', 'k', 'b'];
  function hl(code) {
    let html = '';
    let last = 0;
    String(code).replace(RE, (m, ...g) => {
      const off = g[5];
      const kind = CLS[g.slice(0, 5).findIndex((x) => x !== undefined)];
      html += DSA.esc(code.slice(last, off)) + `<span class="t-${kind}">${DSA.esc(m)}</span>`;
      last = off + m.length;
      return m;
    });
    return html + DSA.esc(code.slice(last));
  }

  return { run, load, hl, get unavailable() { return broken; } };
})();
