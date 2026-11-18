/* player.js — 动画播放器：把“步骤生成器”录成帧，提供播放/暂停/单步/倒退，
 * 并同步高亮 Python 代码行、显示变量表。
 *
 * 课程里的写法（详见 docs/ADDING_LESSONS.md）：
 * { type: 'player', title, views: [{type:'array', key:'arr', title:'数组', bars:true}],
 *   init: () => ({ arr: DSA.items([5, 3, 8]) }),
 *   actions: [{ label: '开始排序', input: {kind:'nums', value:'5, 3, 8'}, fresh: true,
 *               code: PY, run: function* (s, arg) { ... yield {at:'cmp', msg:'…', hl:{cmp:[0,1]}, vars:{i:0}} } }] } */
(() => {
  const esc = DSA.esc;
  let speed = 800; // 所有播放器共享的速度（毫秒/步）

  function parseInput(inp, raw) {
    if (inp.parse) return inp.parse(raw);
    if (inp.kind === 'nums') return DSA.parseNums(raw, inp);
    if (inp.kind === 'num') return DSA.parseNum(raw, inp);
    const t = String(raw).trim();
    if (!t) throw new Error('请先输入内容');
    if (t.length > (inp.maxLen || 12)) throw new Error(`最多 ${inp.maxLen || 12} 个字符`);
    return t;
  }
  DSA.parseInput = parseInput; // 测试脚本也用它解析默认输入

  DSA.blocks.player = function (b, ctx) {
    const el = DSA.h('section', 'player');
    el.innerHTML = `
      ${b.title ? `<h3 class="pl-title">${esc(b.title)}</h3>` : ''}
      <div class="pl-actions"></div>
      <div class="pl-stage"></div>
      <p class="pl-msg" aria-live="polite"></p>
      <div class="pl-transport">
        <button type="button" data-k="first" aria-label="回到第一步" title="回到第一步">⏮</button>
        <button type="button" data-k="prev" aria-label="上一步" title="上一步">◀</button>
        <button type="button" data-k="play" class="primary pl-play">▶ 播放</button>
        <button type="button" data-k="next" aria-label="下一步" title="下一步">▶</button>
        <button type="button" data-k="last" aria-label="跳到最后一步" title="跳到最后一步">⏭</button>
        <span class="pl-step"></span>
        <label class="pl-speed">速度
          <select id="${ctx.key}-speed">
            <option value="1400">慢</option><option value="800">中</option><option value="350">快</option>
          </select>
        </label>
      </div>
      <div class="pl-panels">
        <div class="pl-code" role="region" aria-label="Python 代码"></div>
        <div class="pl-vars" role="region" aria-label="变量"></div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const actionsEl = $('.pl-actions');
    const stage = $('.pl-stage');
    const msgEl = $('.pl-msg');
    const codeEl = $('.pl-code');
    const varsEl = $('.pl-vars');
    const playBtn = $('.pl-play');
    const stepEl = $('.pl-step');
    const speedSel = $('select');
    speedSel.value = String(speed);
    speedSel.onchange = () => (speed = Number(speedSel.value));

    // 视图
    const bodies = b.views.map((v) => {
      const fig = DSA.h('figure', 'vw vw-' + v.type);
      if (v.title) fig.append(DSA.h('figcaption', '', esc(v.title)));
      const body = DSA.h('div', 'vbody');
      fig.append(body);
      stage.append(fig);
      return body;
    });

    let state = DSA.clone(b.init());
    let frames = [];
    let idx = 0;
    let timer = null;
    let codeAction = null;

    function renderState(s, hl) {
      b.views.forEach((v, i) => {
        const vhl = (hl && hl[v.key]) || (i === 0 ? hl : null) || {};
        DSA.views[v.type](bodies[i], s[v.key], vhl, v);
      });
    }
    function setMsg(text, kind) {
      msgEl.className = 'pl-msg' + (kind ? ' ' + kind : '');
      msgEl.innerHTML = text;
    }
    function setCode(act) {
      if (codeAction === act) return;
      codeAction = act;
      const c = DSA.parseCode(act.code || b.code || '');
      codeEl.hidden = !c.text;
      codeEl.innerHTML = c.lines
        .map((ln, i) => `<div class="ln"><span class="no">${i + 1}</span><code>${DSA.py.hl(ln) || ' '}</code></div>`)
        .join('');
    }
    function markLine(n) {
      const old = codeEl.querySelector('.ln.cur');
      if (old) old.classList.remove('cur');
      const ln = n ? codeEl.children[n - 1] : null;
      if (!ln) return;
      ln.classList.add('cur');
      // 只滚动代码面板自身，不带动整页滚动
      const top = ln.offsetTop - codeEl.clientHeight / 2 + ln.offsetHeight / 2;
      codeEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    function setVars(vars) {
      const keys = vars ? Object.keys(vars) : [];
      varsEl.hidden = !keys.length;
      varsEl.innerHTML =
        '<div class="vars-h">变量</div>' +
        keys.map((k) => `<div class="var"><span class="k">${esc(k)}</span><span class="v">${esc(DSA.pyRepr(vars[k]))}</span></div>`).join('');
    }
    function updateTransport() {
      const has = frames.length > 0;
      stepEl.textContent = has ? `第 ${idx + 1} / ${frames.length} 步` : '';
      el.querySelectorAll('.pl-transport button').forEach((btn) => (btn.disabled = !has));
      playBtn.textContent = timer ? '⏸ 暂停' : idx >= frames.length - 1 && has ? '↻ 重播' : '▶ 播放';
    }
    function go(i) {
      if (!frames.length) return;
      idx = Math.max(0, Math.min(frames.length - 1, i));
      const f = frames[idx];
      renderState(f.s, f.hl);
      setMsg(f.msg);
      markLine(f.line);
      setVars(f.vars);
      updateTransport();
    }
    function stop() {
      clearTimeout(timer);
      timer = null;
      updateTransport();
    }
    function tick() {
      if (!el.isConnected) return stop(); // 已离开本页
      if (idx < frames.length - 1) {
        go(idx + 1);
        timer = setTimeout(tick, speed);
      } else stop();
    }
    function play() {
      if (!frames.length) return;
      if (idx >= frames.length - 1) go(0);
      timer = setTimeout(tick, speed);
      updateTransport();
    }

    function start(act, input) {
      stop();
      let arg;
      try {
        if (act.input) arg = parseInput(act.input, input.value);
        const rec = DSA.record(act, act.fresh ? b.init() : state, arg);
        state = rec.final;
        frames = rec.frames;
      } catch (e) {
        setMsg(esc(e.message), 'err');
        return;
      }
      setCode(act);
      if (!frames.length) {
        renderState(state, {});
        updateTransport();
        return;
      }
      go(0);
      play();
    }

    // 操作按钮（每个动作一个，带输入框的放在一起）
    b.actions.forEach((act, i) => {
      const wrap = DSA.h('span', 'pl-act');
      let input = null;
      if (act.input) {
        const id = `${ctx.key}-a${i}`;
        wrap.innerHTML = `<label class="sr" for="${id}">${esc(act.input.label || act.label)}</label>
          <input id="${id}" type="text" autocomplete="off" spellcheck="false" placeholder="${esc(act.input.placeholder || '')}" style="width:${act.input.width || (act.input.kind === 'nums' ? 13 : 7)}em">`;
        input = wrap.querySelector('input');
        input.value = act.input.value ?? '';
        input.addEventListener('keydown', (e) => e.key === 'Enter' && start(act, input));
      }
      const btn = DSA.h('button', i === 0 ? 'primary' : '', esc(act.label));
      btn.type = 'button';
      btn.onclick = () => start(act, input);
      wrap.append(btn);
      if (act.input && act.input.random) {
        const r = DSA.h('button', 'ghost', '随机');
        r.type = 'button';
        r.title = '生成一组随机数据';
        r.onclick = () => (input.value = act.input.random());
        wrap.append(r);
      }
      actionsEl.append(wrap);
    });
    if (b.actions.some((a) => !a.fresh)) {
      const r = DSA.h('button', 'ghost', '恢复初始状态');
      r.type = 'button';
      r.onclick = () => {
        stop();
        state = DSA.clone(b.init());
        frames = [];
        renderState(state, {});
        setVars(null);
        markLine(0);
        setMsg('已恢复到初始状态。');
        updateTransport();
      };
      actionsEl.append(r);
    }

    el.querySelector('.pl-transport').addEventListener('click', (e) => {
      const k = e.target.closest('button') && e.target.closest('button').dataset.k;
      if (!k) return;
      if (k === 'play') return timer ? stop() : play();
      stop();
      go({ first: 0, prev: idx - 1, next: idx + 1, last: frames.length - 1 }[k]);
    });

    renderState(state, {});
    setCode(b.actions[0]);
    setVars(null);
    setMsg(b.hint || '点击上方按钮开始演示。可以随时暂停、单步前进或后退，对照右边的代码看每一步在做什么。');
    updateTransport();
    return el;
  };
})();
