/* store.js — 学习进度，保存在浏览器 localStorage（不跨设备同步）。
 * 数据结构见 docs/ARCHITECTURE.md「进度存储」。 */
DSA.store = (() => {
  const KEY = 'pyalgo-progress-v1';
  const blank = () => ({ v: 1, last: null, scroll: {}, visited: {}, done: {}, quiz: {}, ex: {}, code: {} });
  let d = blank();
  let ok = true; // localStorage 是否可用
  let timer = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.v === 1) d = Object.assign(blank(), parsed);
    } catch (e) {
      ok = false; // 隐私模式 / 禁用存储 / 数据损坏：用空进度继续
    }
    return d;
  }
  function save() {
    clearTimeout(timer);
    timer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
      ok = true;
    } catch (e) {
      ok = false;
    }
  }
  function saveSoon() {
    if (!timer) timer = setTimeout(save, 400);
  }
  // 关闭或切走页面时把未写入的改动立刻写下去
  if (typeof addEventListener === 'function') {
    addEventListener('pagehide', () => timer && save());
    addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && timer && save());
  }

  return {
    get data() { return d; },
    get available() { return ok; },
    load,
    save,
    saveSoon,
    reset() { d = blank(); save(); },
    visit(id) { d.last = id; d.visited[id] = d.visited[id] || Date.now(); save(); },
    complete(id) { d.done[id] = Date.now(); save(); },
    status(id) { return d.done[id] ? 'done' : d.visited[id] ? 'doing' : 'todo'; },
  };
})();
