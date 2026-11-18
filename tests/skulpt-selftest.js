// 浏览器内自检：确认课程里的 Python 代码在 Skulpt（网页里的 Python 运行环境）中也能正确运行。
// 用法：打开网站任意页面，把本文件全部内容粘贴到浏览器开发者工具的 Console 中回车，
// 等待约 10 秒，会打印出不一致或失败的条目。（tests/check.mjs 用的是本机 CPython，二者互补。）
(async () => {
  const P = DSA.TEST_PRELUDE;
  const problems = [];
  let n = 0;
  for (const l of DSA.lessons) {
    for (const [i, b] of l.blocks.entries()) {
      const where = `${l.id}:${i}`;
      const jobs = [];
      if (b.type === 'code' && b.run !== false) jobs.push({ code: DSA.parseCode(b.code).text, expect: b.out, pass: true });
      if (b.type === 'exercise') {
        jobs.push({ code: b.solution + '\n' + P + '\n' + b.tests, pass: true, what: '参考答案' });
        if (!/while lo <= hi/.test(b.starter)) jobs.push({ code: b.starter + '\n' + P + '\n' + b.tests, pass: false, what: '初始代码' });
      }
      if (b.type === 'player') for (const a of b.actions) if (a.test) jobs.push({ code: DSA.parseCode(a.code).text + '\n' + P + '\n' + a.test, pass: true, what: a.label });
      for (const j of jobs) {
        n++;
        const r = await DSA.py.run(j.code);
        if (r.unavailable) return console.error('Python 运行环境不可用：' + r.unavailable);
        if (r.ok !== j.pass) problems.push(`${where} ${j.what || ''} 期望${j.pass ? '通过' : '失败'}，实际${r.ok ? '通过' : '失败：' + (r.error && r.error.text)}`);
        else if (j.expect !== undefined && r.out !== j.expect) problems.push(`${where} 输出不一致\n  预期 ${JSON.stringify(j.expect)}\n  实际 ${JSON.stringify(r.out)}`);
      }
    }
  }
  const summary = `Skulpt 自检：运行 ${n} 段代码，${problems.length ? problems.length + ' 处问题' : '全部一致 ✓'}`;
  console.log([summary, ...problems].join('\n'));
  return [summary, ...problems].join('\n');
})();
