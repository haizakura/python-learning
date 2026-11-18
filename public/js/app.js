/* app.js — 页面骨架：路由（#课程id）、侧边目录、首页、课程页、进度恢复。 */
(() => {
  const S = DSA.store;
  const L = DSA.lessons;
  const esc = DSA.esc;
  const $ = (s) => document.querySelector(s);
  const main = $('#main');
  const nav = $('#nav');
  let current = null; // 当前课程 id，首页为 null

  document.documentElement.lang = 'zh-CN';
  // 字体不阻塞首屏：加载失败时使用系统字体
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap';
  document.head.append(font);

  // 简单事件：测验/练习完成后刷新目录和页脚统计
  const listeners = [];
  DSA.emit = (name) => listeners.forEach((fn) => fn(name));
  listeners.push(() => {
    renderNav();
    if (current) renderFooterStats();
  });

  function stats(l) {
    const d = S.data;
    const q = [], ex = [];
    l.blocks.forEach((b, i) => {
      const key = l.id + ':' + i;
      if (b.type === 'quiz') q.push(d.quiz[key] === b.answer);
      if (b.type === 'exercise') ex.push(!!d.ex[key]);
    });
    return { q: [q.filter(Boolean).length, q.length], ex: [ex.filter(Boolean).length, ex.length] };
  }
  const doneCount = () => L.filter((l) => S.data.done[l.id]).length;
  const nextUp = () => {
    const last = L.find((l) => l.id === S.data.last);
    if (last && !S.data.done[last.id]) return last;
    return L.find((l) => !S.data.done[l.id]) || null;
  };

  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* —— 侧边目录 —— */
  function renderNav() {
    const n = doneCount();
    $('#nav-progress').innerHTML = `<div class="np-text"><span>学习进度</span><b>${n} / ${L.length}</b></div><div class="np-bar"><div style="width:${(n / L.length) * 100}%"></div></div>`;
    let html = `<a href="#home" class="nav-home${current ? '' : ' cur'}">课程首页</a>`;
    let part = null;
    L.forEach((l, i) => {
      if (l.part !== part) {
        if (part !== null) html += '</ol>';
        part = l.part;
        html += `<div class="nav-part">${esc(part)}</div><ol>`;
      }
      const st = S.status(l.id);
      html += `<li><a href="#${l.id}" class="nav-l st-${st}${l.id === current ? ' cur' : ''}"${l.id === current ? ' aria-current="page"' : ''}>
        <span class="nav-dot" aria-label="${{ done: '已完成', doing: '学习中', todo: '未开始' }[st]}"></span><span class="nav-no">${i + 1}</span><span>${esc(l.title)}</span></a></li>`;
    });
    nav.innerHTML = html + '</ol>';
    $('#store-warn').hidden = S.available;
  }

  /* —— 首页 —— */
  function renderHome() {
    current = null;
    document.title = 'Python 图解算法';
    const n = doneCount();
    const up = nextUp();
    const totalMin = L.reduce((a, l) => a + (l.minutes || 10), 0);
    let parts = '';
    let part = null;
    L.forEach((l, i) => {
      if (l.part !== part) {
        if (part !== null) parts += '</div></section>';
        part = l.part;
        parts += `<section class="rm-part"><h3>${esc(part)}</h3><div class="rm-grid">`;
      }
      const st = S.status(l.id);
      parts += `<a class="rm-card st-${st}" href="#${l.id}">
        <span class="rm-glyph" aria-hidden="true">${esc(l.glyph || '·')}</span>
        <span class="rm-body"><span class="rm-no">第 ${i + 1} 课 · 约 ${l.minutes || 10} 分钟</span><b>${esc(l.title)}</b><span class="rm-sum">${esc(l.summary || '')}</span></span>
        <span class="rm-st">${{ done: '已完成', doing: '学习中', todo: '' }[st]}</span></a>`;
    });
    parts += '</div></section>';
    main.innerHTML = `
      <section class="hero">
        <div class="eyebrow">零基础 · 图解动画 · 在线写 Python</div>
        <h1>Python 图解算法</h1>
        <p class="lead">用动画看懂数据结构与算法，再用 Python 亲手写出来。不需要安装任何软件，打开浏览器就能学；学习进度自动保存在这台设备的浏览器里，下次打开会接着上次的位置。</p>
        <div class="hero-cta">
          ${up ? `<a class="btn primary" href="#${up.id}">${n || S.data.last ? '继续学习' : '开始第一课'}：${esc(up.title)}</a>` : `<a class="btn primary" href="#${L[L.length - 1].id}">全部完成，回顾总结</a>`}
          <span class="muted">共 ${L.length} 课，约 ${Math.round(totalMin / 6) / 10} 小时 · 已完成 ${n} 课</span>
        </div>
      </section>
      <section class="howto">
        <h2>每一课怎么学</h2>
        <ol class="howto-steps">
          <li><b>读图文</b><span>用生活里的例子理解概念，不需要任何基础。</span></li>
          <li><b>看动画</b><span>一步一步播放算法过程，代码会同步高亮正在执行的那一行。</span></li>
          <li><b>跑代码</b><span>点“运行”就能执行 Python，改一改再运行，看看结果有什么变化。</span></li>
          <li><b>做练习</b><span>小测验检查理解，编程练习会自动判题，卡住了可以看提示。</span></li>
        </ol>
      </section>
      <section class="roadmap"><h2>学习路线</h2>${parts}</section>
      <section class="reset-box">
        <div><b>重新开始</b><p class="muted">清空这台设备上的全部学习记录（完成状态、测验答案和练习代码）。</p></div>
        <button type="button" class="ghost danger" id="reset-btn">清空学习进度</button>
      </section>`;
    const btn = $('#reset-btn');
    let armed = false;
    btn.onclick = () => {
      if (!armed) {
        armed = true;
        btn.textContent = '确定清空？再点一次';
        btn.classList.add('armed');
        setTimeout(() => {
          armed = false;
          btn.textContent = '清空学习进度';
          btn.classList.remove('armed');
        }, 3000);
        return;
      }
      S.reset();
      toast('学习进度已清空');
      renderHome();
      renderNav();
    };
  }

  /* —— 课程页 —— */
  function renderFooterStats() {
    const el = $('#lesson-stats');
    const l = L.find((x) => x.id === current);
    if (!el || !l) return;
    const s = stats(l);
    const parts = [];
    if (s.q[1]) parts.push(`小测验答对 ${s.q[0]} / ${s.q[1]}`);
    if (s.ex[1]) parts.push(`编程练习通过 ${s.ex[0]} / ${s.ex[1]}`);
    el.textContent = parts.join(' · ');
    const btn = $('#complete-btn');
    if (btn) btn.textContent = S.data.done[l.id] ? (L[L.indexOf(l) + 1] ? '已完成 ✓ 进入下一课' : '已完成 ✓ 回到首页') : '完成本课' + (L[L.indexOf(l) + 1] ? '，进入下一课' : '');
  }

  function renderLesson(l, restore) {
    current = l.id;
    S.visit(l.id);
    document.title = `${l.title} · Python 图解算法`;
    const i = L.indexOf(l);
    const prev = L[i - 1];
    const next = L[i + 1];
    main.innerHTML = `<header class="lesson-head">
        <div class="eyebrow">第 ${i + 1} 课 · ${esc(l.part)}</div>
        <h1>${esc(l.title)}</h1>
        <p class="muted">约 ${l.minutes || 10} 分钟${l.summary ? ' · ' + esc(l.summary) : ''}</p>
      </header>`;
    const body = DSA.h('div', 'lesson-body');
    l.blocks.forEach((b, bi) => {
      const ctx = { lesson: l, key: l.id + ':' + bi };
      try {
        body.append(DSA.blocks[b.type](b, ctx));
      } catch (e) {
        console.error(e);
        body.append(DSA.h('div', 'run-err', `这一部分内容加载失败：${esc(e.message)}`));
      }
    });
    main.append(body);
    const foot = DSA.h('footer', 'lesson-foot');
    foot.innerHTML = `
      <div class="lf-main"><p id="lesson-stats" class="muted"></p><button type="button" class="primary big" id="complete-btn"></button></div>
      <nav class="lf-nav" aria-label="上一课和下一课">
        ${prev ? `<a href="#${prev.id}">← ${esc(prev.title)}</a>` : '<a href="#home">← 课程首页</a>'}
        ${next ? `<a href="#${next.id}">${esc(next.title)} →</a>` : '<a href="#home">课程首页 →</a>'}
      </nav>`;
    main.append(foot);
    renderFooterStats();
    $('#complete-btn').onclick = () => {
      const first = !S.data.done[l.id];
      if (first) S.complete(l.id);
      if (first) toast(next ? `第 ${i + 1} 课完成！继续加油` : '恭喜你学完了全部课程！');
      location.hash = next ? next.id : 'home';
    };
    // 同步滚动即可（scrollTo 会触发排版）；requestAnimationFrame 在后台标签页里不会执行
    scrollTo(0, restore ? S.data.scroll[l.id] || 0 : 0);
  }

  function route(restore) {
    const id = decodeURIComponent(location.hash.slice(1));
    const l = L.find((x) => x.id === id);
    if (l) renderLesson(l, restore);
    else renderHome();
    if (!l) scrollTo(0, 0);
    renderNav();
    document.body.classList.remove('nav-open');
    main.focus({ preventScroll: true });
  }

  // 记住每课的滚动位置，用于下次打开时恢复
  let scrollTimer = null;
  addEventListener('scroll', () => {
    if (!current || scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      if (current) {
        S.data.scroll[current] = Math.round(scrollY);
        S.saveSoon();
      }
    }, 300);
  }, { passive: true });

  addEventListener('hashchange', () => route(false));
  $('#menu-btn').onclick = () => document.body.classList.toggle('nav-open');
  $('#skip-btn').onclick = () => main.focus();
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');

  // 启动：没有指定页面时，自动回到上次学习的课程和位置
  S.load();
  const last = L.find((l) => l.id === S.data.last);
  if (!location.hash && last) {
    try {
      history.replaceState(null, '', '#' + last.id);
    } catch (e) {
      /* 某些沙箱环境不允许修改地址，直接渲染即可 */
    }
    renderLesson(last, true);
    renderNav();
    toast(`已回到上次学习的位置：${last.title}`);
  } else route(false);
})();
