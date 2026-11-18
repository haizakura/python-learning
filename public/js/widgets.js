/* widgets.js — 不适合“步骤播放器”的独立交互组件。
 * 课程里写 { type: 'widget', name: 'guess' } 即可使用。 */
(() => {
  const W = DSA.widgets;
  const esc = DSA.esc;

  /* 猜数字：体会“每次排除一半”的策略（第一课的引子，也是二分查找的直觉） */
  W.guess = function (el, b, ctx) {
    const id = ctx.key + '-guess';
    el.classList.add('w-guess');
    el.innerHTML = `
      <div class="w-h">小游戏 · 猜数字</div>
      <div class="g-bar" aria-hidden="true"><div class="g-live"></div></div>
      <div class="g-scale"><span>1</span><span class="g-range"></span><span>100</span></div>
      <form class="g-form">
        <label for="${id}">你的猜测</label>
        <input id="${id}" type="number" min="1" max="100" inputmode="numeric" required>
        <button class="primary">猜</button>
        <button type="button" class="ghost g-mid">帮我猜中间的数</button>
      </form>
      <p class="g-msg" aria-live="polite"></p>
      <button type="button" class="ghost g-again" hidden>再来一局</button>`;
    const $ = (s) => el.querySelector(s);
    let secret, lo, hi, tries, over;
    const draw = (text) => {
      $('.g-live').style.left = lo - 1 + '%';
      $('.g-live').style.width = hi - lo + 1 + '%';
      $('.g-range').textContent = `答案在 ${lo} ~ ${hi} 之间（还剩 ${hi - lo + 1} 个可能）`;
      $('.g-msg').innerHTML = text;
      $('.g-again').hidden = !over;
    };
    const reset = () => {
      secret = 1 + Math.floor(Math.random() * 100);
      lo = 1;
      hi = 100;
      tries = 0;
      over = false;
      $('input').value = '';
      draw('我心里想好了一个 1 到 100 之间的整数。你来猜，我会告诉你猜大了还是猜小了。');
    };
    const guess = (g) => {
      if (over) return;
      if (!Number.isInteger(g) || g < 1 || g > 100) return draw('请输入 1 到 100 之间的整数。');
      tries++;
      if (g === secret) {
        over = true;
        lo = hi = g;
        draw(
          `猜中了，就是 <b>${g}</b>！你用了 <b>${tries}</b> 次。<br>` +
            (tries <= 7 ? '很棒。' : '') +
            '如果每次都猜“剩余范围的中间”，每猜一次就能排除一半，100 个数最多 7 次一定能猜中。这样一套固定的解题步骤，就叫<b>算法</b>。'
        );
      } else if (g < secret) {
        lo = Math.max(lo, g + 1);
        draw(`${g} <b>小了</b>，往大了猜。已经猜了 ${tries} 次。`);
      } else {
        hi = Math.min(hi, g - 1);
        draw(`${g} <b>大了</b>，往小了猜。已经猜了 ${tries} 次。`);
      }
    };
    $('form').onsubmit = (e) => {
      e.preventDefault();
      guess(Number($('input').value));
    };
    $('.g-mid').onclick = () => {
      const m = Math.floor((lo + hi) / 2);
      $('input').value = m;
      guess(m);
    };
    $('.g-again').onclick = reset;
    reset();
  };

  /* 复杂度曲线：看 O(1) … O(2ⁿ) 随 n 增长的速度，并换算成真实耗时 */
  W.complexity = function (el, b, ctx) {
    const FN = [
      { k: 'c1', name: 'O(1)', f: () => 1 },
      { k: 'c2', name: 'O(log n)', f: (n) => Math.max(1, Math.log2(n)) },
      { k: 'c3', name: 'O(n)', f: (n) => n },
      { k: 'c4', name: 'O(n log n)', f: (n) => n * Math.max(1, Math.log2(n)) },
      { k: 'c5', name: 'O(n²)', f: (n) => n * n },
      { k: 'c6', name: 'O(2ⁿ)', f: (n) => Math.pow(2, n) },
    ];
    const NS = [1, 2, 4, 8, 16, 32, 64, 100, 1000, 10000, 1e6];
    const id = ctx.key + '-n';
    el.classList.add('w-cx');
    el.innerHTML = `
      <div class="w-h">互动图表 · 操作次数随 n 增长</div>
      <div class="cx-chart"></div>
      <div class="cx-ctl"><label for="${id}">数据量 n =</label><input id="${id}" type="range" min="0" max="${NS.length - 1}" value="4"><b class="cx-n"></b></div>
      <div class="table-wrap"><table class="cx-table"><thead><tr><th>复杂度</th><th>操作次数</th><th>每步 1 微秒时的耗时</th></tr></thead><tbody></tbody></table></div>`;
    // 图表：x ∈ [1, 32]，y ∈ [0, 256]，超出部分裁掉
    const X0 = 44, Y0 = 16, PW = 440, PH = 220, XMAX = 32, YMAX = 256;
    const px = (n) => X0 + ((n - 1) / (XMAX - 1)) * PW;
    const py = (v) => Y0 + PH - (Math.min(v, YMAX * 1.2) / YMAX) * PH;
    let svg = `<svg viewBox="0 0 540 270" role="img" aria-label="六种复杂度的增长曲线"><defs><clipPath id="${id}-clip"><rect x="${X0}" y="${Y0}" width="${PW}" height="${PH}"/></clipPath></defs>`;
    for (let v = 0; v <= YMAX; v += 64) svg += `<line class="grid" x1="${X0}" x2="${X0 + PW}" y1="${py(v)}" y2="${py(v)}"/><text class="ax" x="${X0 - 6}" y="${py(v) + 4}" text-anchor="end">${v}</text>`;
    for (const n of [1, 8, 16, 24, 32]) svg += `<text class="ax" x="${px(n)}" y="${Y0 + PH + 16}" text-anchor="middle">${n}</text>`;
    svg += `<text class="ax" x="${X0 + PW}" y="${Y0 + PH + 30}" text-anchor="end">n（数据量）</text>`;
    let labels = '';
    FN.forEach((fn, i) => {
      const pts = [];
      for (let n = 1; n <= XMAX; n += 0.25) pts.push(`${px(n).toFixed(1)},${py(fn.f(n)).toFixed(1)}`);
      svg += `<polyline class="${fn.k}" clip-path="url(#${id}-clip)" points="${pts.join(' ')}"/>`;
      // 标签放在曲线离开图表的位置或右端
      let n = XMAX;
      while (n > 1 && fn.f(n) > YMAX) n -= 0.25;
      const ly = Math.max(Y0 + 10, py(fn.f(n)) - 4);
      labels += `<text class="lbl ${fn.k}" x="${Math.min(px(n) + 4, X0 + PW - 4)}" y="${ly + (i === 1 ? -12 : 0)}" text-anchor="${n >= XMAX - 2 ? 'end' : 'start'}">${fn.name}</text>`;
    });
    svg += `<line class="cx-mark" y1="${Y0}" y2="${Y0 + PH}"/>${labels}</svg>`;
    el.querySelector('.cx-chart').innerHTML = svg;
    const mark = el.querySelector('.cx-mark');
    const fmtNum = (v) => (v >= 1e15 ? '天文数字' : v >= 1e4 ? Math.round(v).toLocaleString('zh-CN') : String(Math.round(v * 10) / 10));
    const fmtTime = (us) => {
      if (!isFinite(us) || us > 3.15e7 * 1e6 * 1e10) return '比宇宙年龄还长';
      const s = us / 1e6;
      if (us < 1000) return `${Math.round(us * 10) / 10} 微秒`;
      if (s < 1) return `${Math.round(us / 100) / 10} 毫秒`;
      if (s < 60) return `${Math.round(s * 10) / 10} 秒`;
      if (s < 3600) return `${Math.round(s / 6) / 10} 分钟`;
      if (s < 86400) return `${Math.round(s / 360) / 10} 小时`;
      if (s < 3.15e7) return `${Math.round(s / 8640) / 10} 天`;
      return `${fmtNum(s / 3.15e7)} 年`;
    };
    const input = el.querySelector('input');
    const update = () => {
      const n = NS[input.value];
      el.querySelector('.cx-n').textContent = n.toLocaleString('zh-CN');
      mark.setAttribute('x1', px(Math.min(n, XMAX)));
      mark.setAttribute('x2', px(Math.min(n, XMAX)));
      mark.style.opacity = n <= XMAX ? 1 : 0;
      el.querySelector('tbody').innerHTML = FN.map((fn) => {
        const v = fn.f(n);
        return `<tr><td><span class="dot ${fn.k}"></span>${fn.name}</td><td>${fmtNum(v)}</td><td>${fmtTime(v)}</td></tr>`;
      }).join('');
    };
    input.oninput = update;
    update();
  };

  /* 排序大比拼：同一组数据，比较各排序算法的比较次数和移动次数 */
  W.sortRace = function (el, b, ctx) {
    const ALGOS = [
      ['bubble', '冒泡排序'],
      ['selection', '选择排序'],
      ['insertion', '插入排序'],
      ['merge', '归并排序'],
      ['quick', '快速排序'],
    ];
    el.classList.add('w-race');
    el.innerHTML = `
      <div class="w-h">排序大比拼</div>
      <div class="race-ctl">
        <label>数据量 <select id="${ctx.key}-n"><option>10</option><option selected>20</option><option>40</option></select></label>
        <label>数据特点 <select id="${ctx.key}-kind"><option value="rand">完全随机</option><option value="near">几乎有序</option><option value="rev">完全逆序</option></select></label>
        <button type="button" class="primary">开始比赛</button>
      </div>
      <div class="race-out"></div>
      <p class="muted race-note">比较次数：比较两个元素大小的次数；移动次数：交换或挪动元素的次数。数字越小越快。</p>`;
    const [nSel, kSel] = el.querySelectorAll('select');
    const race = () => {
      const n = Number(nSel.value);
      let nums = DSA.randNums(n, 1, 99);
      if (kSel.value !== 'rand') nums.sort((a, c) => a - c);
      if (kSel.value === 'rev') nums.reverse();
      if (kSel.value === 'near') for (let k = 0; k < Math.max(1, n / 10); k++) {
        const i = Math.floor(Math.random() * (n - 1));
        [nums[i], nums[i + 1]] = [nums[i + 1], nums[i]];
      }
      const rows = ALGOS.map(([id, name]) => {
        const { frames } = DSA.record({ run: DSA.algo[id] }, { arr: DSA.items(nums) }, null, 50000);
        return {
          name,
          cmp: frames.filter((f) => f.at === 'cmp').length,
          mv: frames.filter((f) => /^(swap|shift|place|take|write)/.test(f.at || '')).length,
        };
      });
      const max = Math.max(1, ...rows.map((r) => Math.max(r.cmp, r.mv)));
      const best = Math.min(...rows.map((r) => r.cmp + r.mv));
      el.querySelector('.race-out').innerHTML =
        `<div class="race-data">数据：${esc(nums.join(', '))}</div>` +
        rows
          .map(
            (r) => `<div class="race-row${r.cmp + r.mv === best ? ' best' : ''}"><span class="race-name">${r.name}</span><div class="race-bars">
              <div class="race-bar cmp" style="width:${(r.cmp / max) * 100}%"><span>比较 ${r.cmp}</span></div>
              <div class="race-bar mv" style="width:${(r.mv / max) * 100}%"><span>移动 ${r.mv}</span></div></div></div>`
          )
          .join('');
    };
    el.querySelector('button').onclick = race;
    race();
  };
})();
