/* views.js — 可视化渲染器。
 * 约定：DSA.views[type](el, data, hl, opts)
 *   el   容器元素（同一个播放器内会被反复传入，可在上面缓存东西）
 *   data 该视图对应的状态（state[key]）
 *   hl   高亮信息：hl 里任何“数组或单值”的键都会变成 CSS 类 m-<键名>，
 *        例如 {cmp: [2, 3]} 给第 2、3 个元素加上 m-cmp；hl.ptr = {i: 2} 在下标 2 下方显示指针 i。
 *   opts 视图配置（来自课程里的 views 声明）
 * 列表类视图按下标高亮，树/图按节点 id 高亮。 */
(() => {
  const V = DSA.views;
  const esc = DSA.esc;
  const same = (a, b) => String(a) === String(b);

  function marks(hl, key) {
    const out = [];
    for (const k in hl) {
      if (k === 'ptr') continue;
      const v = hl[k];
      if (Array.isArray(v) ? v.some((x) => !Array.isArray(x) && same(x, key)) : v !== null && typeof v !== 'object' && same(v, key)) out.push('m-' + k);
    }
    return out.join(' ');
  }
  // 哈希表这类二维位置 [桶, 序号] 的高亮
  function pairMarks(hl, i, j) {
    const out = [];
    for (const k in hl) {
      const v = hl[k];
      if (Array.isArray(v) && v.length === 2 && v[0] === i && v[1] === j) out.push('m-' + k);
    }
    return out.join(' ');
  }
  function ptrNames(hl, i) {
    const p = (hl && hl.ptr) || {};
    return Object.keys(p).filter((name) => same(p[name], i));
  }

  /* FLIP 动画：记录元素旧位置 → 更新 DOM → 从旧位置平滑过渡到新位置 */
  function flip(container, update) {
    const before = new Map();
    container.querySelectorAll('[data-id]').forEach((e) => before.set(e.dataset.id, e.getBoundingClientRect()));
    update();
    container.querySelectorAll('[data-id]').forEach((e) => {
      const b = before.get(e.dataset.id);
      if (!b) return;
      const a = e.getBoundingClientRect();
      const dx = b.left - a.left;
      const dy = b.top - a.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      e.style.transition = 'none';
      e.style.transform = `translate(${dx}px, ${dy}px)`;
      void e.offsetWidth; // 强制浏览器先应用反向位移
      e.style.transition = '';
      e.style.transform = '';
    });
  }

  /* 按 id 复用子元素，只在顺序变化时移动节点 */
  function keyed(parent, list, make, patch) {
    const old = new Map();
    for (const c of parent.children) old.set(c.dataset.id, c);
    let ref = parent.firstChild;
    list.forEach((it, i) => {
      let e = old.get(String(it.id));
      if (e) old.delete(String(it.id));
      else {
        e = make(it);
        e.dataset.id = it.id;
        e.classList.add('enter');
        e.addEventListener('animationend', () => e.classList.remove('enter'), { once: true });
      }
      patch(e, it, i);
      if (e === ref) ref = ref.nextSibling;
      else parent.insertBefore(e, ref);
    });
    for (const e of old.values()) e.remove();
  }
  const keep = (e, cls) => cls + (e.classList.contains('enter') ? ' enter' : '');

  /* 数组：格子或柱状图（opts.bars） */
  V.array = function (el, items, hl, o) {
    items = items || [];
    if (!el._rows) {
      el.classList.add('v-array');
      if (o.bars) el.classList.add('bars');
      el.innerHTML = '<div class="row items"></div><div class="row idx"></div><div class="row ptrs"></div>';
      el._rows = [...el.children];
    }
    const [rowItems, rowIdx, rowPtr] = el._rows;
    const n = items.length;
    el.style.setProperty('--n', Math.max(n, 1));
    const nums = items.map((it) => (typeof it.v === 'number' ? it.v : 0));
    const max = o.max || Math.max(1, ...nums);
    flip(rowItems, () =>
      keyed(
        rowItems,
        items,
        () => {
          const e = document.createElement('div');
          e.innerHTML = '<span class="val"></span>';
          return e;
        },
        (e, it, i) => {
          const empty = it.v === null || it.v === undefined;
          e.className = keep(e, 'cell ' + marks(hl, i) + (empty ? ' empty' : ''));
          e.firstChild.textContent = empty ? '' : it.v;
          if (o.bars) e.style.height = Math.max(14,((typeof it.v === 'number' ? it.v : 0) / max) * 100) + '%';
        }
      )
    );
    rowItems.dataset.empty = o.empty || '（空）';
    rowIdx.hidden = o.index === false || n === 0;
    rowIdx.innerHTML = items.map((_, i) => `<span>${i}</span>`).join('');
    const anyPtr = hl && hl.ptr && Object.keys(hl.ptr).length;
    rowPtr.hidden = !anyPtr;
    if (anyPtr) {
      // 指针可能指向 n（越界位置），多留一格
      const cols = Math.max(n, ...Object.values(hl.ptr).map((p) => (typeof p === 'number' ? p + 1 : 0)));
      el.style.setProperty('--n', Math.max(cols, 1));
      rowPtr.innerHTML = Array.from({ length: cols }, (_, i) => `<span>${ptrNames(hl, i).map((p) => `<b>${esc(p)}</b>`).join('')}</span>`).join('');
    }
  };

  /* 栈：竖直排列，最后一个元素在最上面 */
  V.stack = function (el, items, hl, o) {
    items = items || [];
    if (!el._box) {
      el.classList.add('v-stack');
      el.innerHTML = '<div class="stk"></div>';
      el._box = el.firstChild;
    }
    const box = el._box;
    box.dataset.empty = o.empty || '（空栈）';
    flip(box, () =>
      keyed(
        box,
        items,
        () => document.createElement('div'),
        (e, it, i) => {
          const top = i === items.length - 1;
          e.className = keep(e, 'frame ' + marks(hl, i) + (top ? ' top' : ''));
          e.dataset.top = top ? o.topLabel || '← 栈顶' : '';
          e.textContent = it.v;
        }
      )
    );
  };

  /* 链表：head → [值|next] → ... → None；floating 是还没接入链表的新节点 */
  V.linked = function (el, st, hl) {
    st = st || { nodes: [] };
    el.className = 'v-linked';
    const node = (nd, cls, ptrs) =>
      `<div class="ll-node ${cls}"><span class="v">${esc(nd.v)}</span><span class="nx" aria-hidden="true"></span>${
        ptrs.length ? `<span class="ll-ptr">${ptrs.map(esc).join(' ')}</span>` : ''
      }</div>`;
    const f = st.floating;
    el.innerHTML =
      (f ? `<div class="ll-float"><span class="lbl">${esc(f.label || 'node')}</span>${node(f, 'm-new', [])}<span class="note">${esc(f.note || '')}</span></div>` : '') +
      '<div class="ll-row"><span class="lbl">head</span><span class="arrow">→</span>' +
      st.nodes.map((nd, i) => node(nd, marks(hl, i), ptrNames(hl, i)) + '<span class="arrow">→</span>').join('') +
      '<span class="none">None</span></div>';
  };

  /* 哈希表：每个桶一行，冲突的元素串成链 */
  V.hash = function (el, buckets, hl) {
    el.className = 'v-hash';
    el.innerHTML = (buckets || [])
      .map(
        (b, i) =>
          `<div class="hb${same(hl.row, i) ? ' m-active' : ''}"><span class="hi">${i}</span>${
            b.length ? b.map((it, j) => `<span class="arrow">→</span><span class="hitem ${pairMarks(hl, i, j)}">${esc(it.v)}</span>`).join('') : '<span class="hnone">空</span>'
          }</div>`
      )
      .join('');
  };

  /* 二叉树（SVG）：中序位置决定横坐标，深度决定纵坐标 */
  function drawTree(el, nodes, root, hl, o) {
    el.className = 'v-tree';
    if (root === null || root === undefined || !nodes[root]) {
      el.innerHTML = `<div class="v-empty">${esc(o.empty || '（空树）')}</div>`;
      return;
    }
    const pos = {};
    let x = 0;
    let depth = 0;
    (function walk(id, d) {
      if (id === null || id === undefined || !nodes[id]) return;
      walk(nodes[id].l, d + 1);
      pos[id] = { x: x++, d };
      depth = Math.max(depth, d);
      walk(nodes[id].r, d + 1);
    })(root, 0);
    const GX = 46, GY = 62, R = 18, PAD = 24;
    const W = x * GX + PAD;
    const H = depth * GY + 2 * PAD + (o.showIndex ? 14 : 0);
    const cx = (id) => PAD / 2 + pos[id].x * GX + GX / 2;
    const cy = (id) => PAD + pos[id].d * GY;
    let edges = '';
    let circles = '';
    for (const id in pos) {
      for (const c of [nodes[id].l, nodes[id].r]) {
        if (c !== null && c !== undefined && pos[c]) {
          edges += `<line class="${marks(hl, c).includes('m-path') ? 'm-path' : ''}" x1="${cx(id)}" y1="${cy(id)}" x2="${cx(c)}" y2="${cy(c)}"/>`;
        }
      }
      circles += `<g class="tn ${marks(hl, id)}"><circle cx="${cx(id)}" cy="${cy(id)}" r="${R}"/><text x="${cx(id)}" y="${cy(id)}">${esc(nodes[id].v)}</text>${
        o.showIndex ? `<text class="ti" x="${cx(id)}" y="${cy(id) + R + 12}">[${esc(id)}]</text>` : ''
      }</g>`;
    }
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.25}px" role="img" aria-label="${esc(o.title || '二叉树')}">${edges}${circles}</svg>`;
  }
  V.tree = (el, t, hl, o) => drawTree(el, (t && t.nodes) || {}, t && t.root, hl, o);

  /* 堆：用数组下标推出树结构，i 的孩子是 2i+1 和 2i+2 */
  V.heaptree = function (el, items, hl, o) {
    items = items || [];
    const nodes = {};
    items.forEach((it, i) => {
      nodes[i] = { v: it.v, l: 2 * i + 1 < items.length ? 2 * i + 1 : null, r: 2 * i + 2 < items.length ? 2 * i + 2 : null };
    });
    drawTree(el, nodes, items.length ? 0 : null, hl, { ...o, showIndex: true, empty: '（空堆）' });
  };

  /* 图：节点坐标固定在 400×260 的画布里 */
  V.graph = function (el, g, hl) {
    el.className = 'v-graph';
    const at = {};
    g.nodes.forEach((n) => (at[n.id] = n));
    const isEdge = (e, a, b) => Array.isArray(e) && ((same(e[0], a) && same(e[1], b)) || (same(e[0], b) && same(e[1], a)));
    const edges = g.edges
      .map(([a, b]) => `<line class="${isEdge(hl.edge, a, b) ? 'm-edge' : ''}" x1="${at[a].x}" y1="${at[a].y}" x2="${at[b].x}" y2="${at[b].y}"/>`)
      .join('');
    const nodes = g.nodes
      .map((n) => `<g class="tn ${marks(hl, n.id)}"><circle cx="${n.x}" cy="${n.y}" r="19"/><text x="${n.x}" y="${n.y}">${esc(n.id)}</text></g>`)
      .join('');
    el.innerHTML = `<svg viewBox="0 0 400 260" role="img" aria-label="图">${edges}${nodes}</svg>`;
  };

  /* 输出 / 结果：一排小标签 */
  V.out = function (el, val, hl, o) {
    el.className = 'v-out';
    const arr = Array.isArray(val) ? val : val === null || val === undefined || val === '' ? [] : [val];
    el.innerHTML = arr.length
      ? arr.map((x, i) => `<span class="chip ${marks(hl, i)}">${esc(x)}</span>`).join('')
      : `<span class="v-empty">${esc(o.empty || '（暂无）')}</span>`;
  };
})();
