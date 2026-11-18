/* core.js — 全局命名空间与纯函数工具。
 * 不访问 DOM，可以在 Node 测试（tests/check.mjs）里直接加载。 */
var DSA = (globalThis.DSA = {
  lessons: [],   // 按注册顺序排列的课程
  views: {},     // 可视化渲染器：DSA.views[type](el, data, hl, opts)
  widgets: {},   // 独立交互组件：DSA.widgets[name](el, block, ctx)
  blocks: {},    // 课程内容块渲染器：DSA.blocks[type](block, ctx) -> Element
  algo: {},      // 共享的算法步骤生成器（如排序，供课程与“排序大比拼”复用）
});

DSA.lesson = (def) => DSA.lessons.push(def);

// 状态都是纯 JSON，深拷贝足够
DSA.clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

let _uid = 0;
DSA.uid = () => 'n' + ++_uid;
DSA.items = (vals) => vals.map((v) => ({ id: DSA.uid(), v }));
DSA.vals = (items) => items.map((it) => it.v);
DSA.range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

DSA.esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Python 代码里的行尾标记 `#@name` 用来给动画定位行号，展示时去掉。
 * 这样改代码时不用手动维护行号。 */
const _codeCache = new Map();
DSA.parseCode = function (src) {
  if (_codeCache.has(src)) return _codeCache.get(src);
  const at = {};
  const lines = String(src || '').replace(/^\n+|\s+$/g, '').split('\n').map((line, i) => {
    const m = line.match(/\s*#@([\w-]+)\s*$/);
    if (!m) return line;
    at[m[1]] = i + 1;
    return line.slice(0, m.index);
  });
  const res = { text: lines.join('\n'), lines, at };
  _codeCache.set(src, res);
  return res;
};

/* 运行一个动作的步骤生成器，录制每一帧（状态快照 + 高亮 + 代码行 + 说明）。
 * 生成器直接修改 state，并 yield {at|line, msg, hl, vars}。 */
DSA.record = function (action, state, arg, maxFrames = 4000) {
  const work = DSA.clone(state);
  const code = DSA.parseCode(action.code || '');
  const frames = [];
  for (const f of action.run(work, arg)) {
    if (frames.length >= maxFrames) throw new Error('演示步骤过多，请换一组更小的输入');
    frames.push({
      s: DSA.clone(work),
      hl: DSA.clone(f.hl) || {},
      line: f.at ? code.at[f.at] : f.line || 0,
      at: f.at,
      msg: f.msg || '',
      vars: DSA.clone(f.vars) || null,
    });
  }
  return { frames, final: work };
};

/* 解析用户输入。失败时抛出带中文提示的 Error。 */
DSA.parseNums = function (str, { min = 0, max = 99, maxLen = 12, minLen = 1 } = {}) {
  const parts = String(str).split(/[\s,，、]+/).filter(Boolean);
  if (parts.length < minLen) throw new Error(`请至少输入 ${minLen} 个数字，用逗号分隔`);
  if (parts.length > maxLen) throw new Error(`最多 ${maxLen} 个数字，不然画面放不下`);
  return parts.map((p) => {
    const n = Number(p);
    if (!Number.isInteger(n)) throw new Error(`“${p}” 不是整数`);
    if (n < min || n > max) throw new Error(`数字要在 ${min} 到 ${max} 之间`);
    return n;
  });
};
DSA.parseNum = (str, opts) => DSA.parseNums(str, { ...opts, maxLen: 1 })[0];

/* 练习题测试代码前面自动拼上的辅助函数（Node 测试和浏览器共用同一份） */
DSA.TEST_PRELUDE = `
def expect(got, want, label):
    if got != want:
        raise AssertionError(label + " 应该得到 " + repr(want) + "，你的结果是 " + repr(got))
`;

/* 把 JS 值显示成 Python 的写法：null→None、true→True、数组→[1, 2] */
DSA.pyRepr = function pyRepr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return "'" + v + "'";
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  if (typeof v === 'object') return '{' + Object.keys(v).map((k) => pyRepr(k) + ': ' + pyRepr(v[k])).join(', ') + '}';
  return String(v);
};

/* 小型 DOM 工具（只在浏览器里调用） */
DSA.h = function (tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

DSA.randNums = (n, lo = 1, hi = 99) => Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
DSA.randInput = (n, lo, hi) => () => DSA.randNums(n, lo, hi).join(', ');
