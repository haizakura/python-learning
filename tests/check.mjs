// 课程内容自检：node tests/check.mjs
// 1. 结构检查：课程 id、内容块类型、测验答案下标、组件名
// 2. 动画检查：每个播放器动作都能用默认输入（和随机输入）跑完，#@标记都能找到对应代码行
// 3. 算法检查：排序结果正确、堆始终满足堆性质
// 4. Python 检查：用本机 python3 运行所有示例代码（核对预期输出）、动画代码的测试、
//    练习的参考答案（必须通过）和初始代码（必须不通过）
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !s.endsWith('app.js'));

const ctx = vm.createContext({ console });
for (const s of scripts) vm.runInContext(readFileSync(join(root, s), 'utf8'), ctx, { filename: s });
const DSA = ctx.DSA;

let failures = 0;
let checks = 0;
const fail = (where, msg) => {
  failures++;
  console.error(`✗ ${where}: ${msg}`);
};
const ok = (cond, where, msg) => {
  checks++;
  if (!cond) fail(where, msg);
};

/* ———— 1. 结构 ———— */
const TYPES = ['text', 'tip', 'code', 'player', 'widget', 'quiz', 'exercise'];
const ids = new Set();
for (const l of DSA.lessons) {
  ok(/^[a-z0-9-]+$/.test(l.id), l.id, 'id 只能包含小写字母、数字和连字符');
  ok(l.id !== 'home', l.id, 'id 不能是 home（首页占用）');
  ok(!ids.has(l.id), l.id, 'id 重复');
  ids.add(l.id);
  ok(l.title && l.part && Array.isArray(l.blocks) && l.blocks.length, l.id, '缺少 title / part / blocks');
  l.blocks.forEach((b, i) => {
    const where = `${l.id}:${i}`;
    ok(TYPES.includes(b.type), where, `未知的块类型 ${b.type}`);
    if (b.type === 'quiz') ok(Number.isInteger(b.answer) && b.answer >= 0 && b.answer < b.options.length, where, '测验答案下标越界');
    if (b.type === 'widget') ok(typeof DSA.widgets[b.name] === 'function', where, `组件 ${b.name} 不存在`);
    if (b.type === 'exercise') ok(b.starter && b.tests && b.solution && b.prompt, where, '练习缺少 starter / tests / solution / prompt');
    if (b.type === 'player') b.views.forEach((v) => ok(typeof DSA.views[v.type] === 'function', where, `视图 ${v.type} 不存在`));
  });
}

/* ———— 2. 动画 ———— */
function runAction(where, b, act, state, raw) {
  let arg;
  try {
    if (act.input) arg = DSA.parseInput(act.input, raw);
  } catch (e) {
    fail(where, `默认输入 "${raw}" 解析失败：${e.message}`);
    return state;
  }
  try {
    const { frames, final } = DSA.record(act, act.fresh ? b.init() : state, arg);
    ok(frames.length > 0, where, '没有产生任何动画帧');
    const code = DSA.parseCode(act.code || '');
    for (const f of frames) {
      if (f.at) ok(code.at[f.at] > 0, where, `#@${f.at} 在代码中找不到`);
      ok(typeof f.msg === 'string' && f.msg.length > 0, where, '有一帧没有说明文字');
    }
    return final;
  } catch (e) {
    fail(where, `运行出错：${e.stack}`);
    return state;
  }
}
for (const l of DSA.lessons) {
  l.blocks.forEach((b, i) => {
    if (b.type !== 'player') return;
    let state = b.init();
    // 依次执行每个动作两轮，覆盖“对已修改过的状态再操作”的情况（例如连续出栈直到为空）
    for (let round = 0; round < 3; round++) {
      b.actions.forEach((act, j) => {
        const where = `${l.id}:${i} 动作「${act.label}」`;
        state = runAction(where, b, act, state, act.input ? (round === 2 && act.input.random ? act.input.random() : act.input.value) : undefined);
      });
    }
  });
}

/* ———— 3. 算法正确性 ———— */
const sorted = (a) => a.slice().sort((x, y) => x - y);
for (const name of ['bubble', 'selection', 'insertion', 'merge', 'quick']) {
  const cases = [[], [1], [2, 1], [1, 2, 3], [3, 2, 1], [5, 5, 5], [2, 1, 2, 1]];
  for (let k = 0; k < 200; k++) cases.push(DSA.randNums(Math.floor(Math.random() * 13), 1, 20));
  for (const nums of cases) {
    const { final } = DSA.record({ run: DSA.algo[name] }, { arr: DSA.items(nums) });
    ok(JSON.stringify(DSA.vals(final.arr)) === JSON.stringify(sorted(nums)), `排序 ${name}`, `输入 [${nums}] 结果错误：[${DSA.vals(final.arr)}]`);
  }
}
{
  const heapLesson = DSA.lessons.find((l) => l.id === 'heap');
  const b = heapLesson.blocks.find((x) => x.type === 'player');
  const [push, pop] = b.actions;
  let st = b.init();
  const isHeap = (h) => h.every((it, i) => i === 0 || h[(i - 1) >> 1].v <= it.v);
  for (let k = 0; k < 300; k++) {
    if (Math.random() < 0.6 && st.h.length < 15) st = DSA.record(push, st, DSA.randNums(1, 1, 99)[0]).final;
    else if (st.h.length) {
      const min = Math.min(...DSA.vals(st.h));
      st = DSA.record(pop, st).final;
      ok(st.out[st.out.length - 1] === min, '堆 pop', '弹出的不是最小值');
    }
    ok(isHeap(st.h), '堆', `不满足堆性质：[${DSA.vals(st.h)}]`);
  }
}

/* ———— 4. Python ———— */
const py = spawnSync('python3', ['--version'], { encoding: 'utf8' });
if (py.status !== 0) {
  console.warn('⚠ 找不到 python3，跳过 Python 检查');
} else {
  const dir = mkdtempSync(join(tmpdir(), 'pyalgo-'));
  let n = 0;
  const runPy = (code) => {
    const file = join(dir, `s${n++}.py`);
    writeFileSync(file, code);
    const r = spawnSync('python3', ['-I', file], { encoding: 'utf8', timeout: 8000 });
    return { ok: r.status === 0, out: r.stdout, err: r.stderr || (r.error ? String(r.error) : '') };
  };
  const P = DSA.TEST_PRELUDE;
  for (const l of DSA.lessons) {
    l.blocks.forEach((b, i) => {
      const where = `${l.id}:${i}`;
      if (b.type === 'code') {
        const r = runPy(DSA.parseCode(b.code).text);
        ok(r.ok, where, `示例代码运行失败：\n${r.err}`);
        if (b.out !== undefined) ok(r.out === b.out, where, `输出不一致\n  预期：${JSON.stringify(b.out)}\n  实际：${JSON.stringify(r.out)}`);
      }
      if (b.type === 'player') {
        for (const act of b.actions) {
          const code = DSA.parseCode(act.code || '').text;
          if (!code) continue;
          const r = act.test ? runPy(code + '\n' + P + '\n' + act.test) : runPy(`compile(${JSON.stringify(code)}, "<code>", "exec")`);
          ok(r.ok, `${where} 动作「${act.label}」`, `动画代码${act.test ? '测试' : '语法检查'}失败：\n${r.err}`);
        }
      }
      if (b.type === 'exercise') {
        const good = runPy(b.solution + '\n' + P + '\n' + b.tests);
        ok(good.ok, where, `参考答案没有通过测试：\n${good.err}`);
        const bad = runPy(b.starter + '\n' + P + '\n' + b.tests);
        ok(!bad.ok, where, '初始代码竟然直接通过了测试（测试太弱？）');
      }
    });
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`运行了 ${n} 段 Python 代码`);
}

console.log(`\n${DSA.lessons.length} 课，${checks} 项检查，${failures ? `✗ ${failures} 项失败` : '全部通过 ✓'}`);
process.exit(failures ? 1 : 0);
