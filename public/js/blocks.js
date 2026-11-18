/* blocks.js — 课程内容块：text / tip / code / quiz / exercise / widget（player 在 player.js）。
 * 每个渲染器签名：DSA.blocks[type](block, ctx) -> Element
 * ctx = { lesson, key }，key 形如 "array:3"（课程 id + 块序号），用来在进度里存答案和代码。 */
(() => {
  const B = DSA.blocks;
  const esc = DSA.esc;
  const S = () => DSA.store;

  B.text = (b) => DSA.h('div', 'prose', b.html);

  const TIP = { info: '提示', key: '重点', warn: '易错点', analogy: '打个比方' };
  B.tip = (b) => DSA.h('aside', 'tip tip-' + (b.kind || 'info'), `<div class="tip-h">${TIP[b.kind || 'info']}</div><div class="prose">${b.html}</div>`);

  B.widget = (b, ctx) => {
    const e = DSA.h('div', 'widget');
    DSA.widgets[b.name](e, b, ctx);
    return e;
  };

  /* —— 代码编辑器：textarea + 适合新手的缩进行为 —— */
  DSA.editor = function (value, { id, onChange, onRun } = {}) {
    const ta = DSA.h('textarea', 'editor');
    if (id) ta.id = id;
    ta.value = value;
    ta.spellcheck = false;
    ta.setAttribute('autocapitalize', 'off');
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('wrap', 'off');
    ta.setAttribute('aria-label', 'Python 代码编辑器（Tab 缩进，按 Esc 后再按 Tab 可以离开编辑器）');
    let escaped = false;
    const fit = () => (ta.rows = Math.min(24, Math.max(4, ta.value.split('\n').length + 1)));
    const insert = (text) => {
      // execCommand 能保留撤销记录；不支持时退回 setRangeText
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    };
    ta.addEventListener('keydown', (e) => {
      const { selectionStart: s, selectionEnd: end, value: v } = ta;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (e.key === 'Escape') return (escaped = true);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return onRun && onRun();
      }
      if (e.key === 'Tab' && !escaped) {
        e.preventDefault();
        if (e.shiftKey) {
          const n = (v.slice(lineStart).match(/^ {1,4}/) || [''])[0].length;
          if (n) {
            ta.setSelectionRange(lineStart, lineStart + n);
            insert('');
            ta.setSelectionRange(s - n, end - n);
          }
        } else insert('    ');
        return;
      }
      escaped = false;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const indent = before.match(/^\s*/)[0] + (/:\s*$/.test(before) ? '    ' : '');
        insert('\n' + indent);
      } else if (e.key === 'Backspace' && s === end && before.length && /^ +$/.test(before) && before.length % 4 === 0) {
        e.preventDefault();
        ta.setSelectionRange(s - 4, s);
        insert('');
      }
    });
    ta.addEventListener('input', () => {
      fit();
      if (onChange) onChange(ta.value);
    });
    fit();
    return ta;
  };

  /* —— 显示运行结果 —— */
  DSA.showRun = function (outEl, res, { expected, success } = {}) {
    outEl.hidden = false;
    if (res.unavailable) {
      outEl.innerHTML =
        `<div class="run-warn">${esc(res.unavailable)}</div>` +
        (expected !== undefined ? `<div class="out-h">预期输出</div><pre class="out">${esc(expected)}</pre>` : '');
      return;
    }
    let html = '';
    if (res.out || res.ok) html += `<div class="out-h">输出</div><pre class="out">${res.out ? esc(res.out) : '<span class="muted">（没有输出。想看到结果，可以用 print()）</span>'}</pre>`;
    if (res.ok && success) html += `<div class="run-ok">${success}</div>`;
    if (res.error) {
      const er = res.error;
      html += `<div class="run-err"><div class="err-h"><b>${esc(er.type)}</b>${er.line ? ` · 第 ${er.line} 行` : ''}</div>${
        er.friendly ? `<p>${esc(er.friendly)}</p>` : ''
      }<code>${esc(er.text)}</code></div>`;
    }
    outEl.innerHTML = html;
  };
  async function runInto(outEl, code, opts) {
    outEl.hidden = false;
    outEl.innerHTML = `<div class="muted">${globalThis.Sk ? '运行中…' : '正在加载 Python 运行环境（约 1MB，只在第一次需要）…'}</div>`;
    const res = await DSA.py.run(code, opts);
    DSA.showRun(outEl, res, opts);
    return res;
  }

  /* —— 可运行的代码块 —— */
  B.code = function (b, ctx) {
    const e = DSA.h('div', 'codeblock');
    const runnable = b.run !== false;
    e.innerHTML = `<div class="cb-bar"><span class="cb-lang">Python</span>${b.title ? `<span class="cb-title">${esc(b.title)}</span>` : ''}<span class="sp"></span>${
      runnable ? '<button type="button" class="ghost cb-edit">修改代码</button><button type="button" class="primary cb-run">▶ 运行</button>' : ''
    }</div><pre class="cb-pre"><code>${DSA.py.hl(DSA.parseCode(b.code).text)}</code></pre><div class="cb-out" hidden></div>`;
    if (!runnable) return e;
    const out = e.querySelector('.cb-out');
    let editor = null;
    const run = () => runInto(out, editor ? editor.value : DSA.parseCode(b.code).text, { expected: b.out });
    e.querySelector('.cb-run').onclick = run;
    e.querySelector('.cb-edit').onclick = (ev) => {
      if (editor) {
        // 还原
        editor.replaceWith(Object.assign(DSA.h('pre', 'cb-pre'), { innerHTML: `<code>${DSA.py.hl(DSA.parseCode(b.code).text)}</code>` }));
        editor = null;
        ev.target.textContent = '修改代码';
        return;
      }
      editor = DSA.editor(DSA.parseCode(b.code).text, { id: ctx.key + '-ed', onRun: run });
      e.querySelector('.cb-pre').replaceWith(editor);
      editor.focus();
      ev.target.textContent = '还原代码';
    };
    return e;
  };

  /* —— 单选小测验 —— */
  B.quiz = function (b, ctx) {
    const e = DSA.h('div', 'quiz');
    e.innerHTML = `<div class="q-h">小测验</div><div class="q prose">${b.q}</div><div class="q-opts" role="group"></div><div class="q-fb" aria-live="polite"></div>`;
    const opts = e.querySelector('.q-opts');
    const fb = e.querySelector('.q-fb');
    const render = () => {
      const pick = S().data.quiz[ctx.key];
      [...opts.children].forEach((btn, i) => {
        btn.className = 'q-opt' + (pick === i ? (i === b.answer ? ' right' : ' wrong') : '');
        btn.setAttribute('aria-pressed', pick === i);
      });
      if (pick === undefined) fb.innerHTML = '';
      else if (pick === b.answer) fb.innerHTML = `<div class="run-ok">回答正确！</div>${b.explain ? `<div class="prose">${b.explain}</div>` : ''}`;
      else fb.innerHTML = `<div class="run-warn">还不对，再想想。${b.hint ? esc(b.hint) : ''}</div>`;
    };
    b.options.forEach((o, i) => {
      const btn = DSA.h('button', 'q-opt', `<span class="q-letter">${'ABCDEF'[i]}</span><span>${o}</span>`);
      btn.type = 'button';
      btn.onclick = () => {
        S().data.quiz[ctx.key] = i;
        S().save();
        render();
        DSA.emit && DSA.emit('progress');
      };
      opts.append(btn);
    });
    render();
    return e;
  };

  /* —— 编程练习：写代码 → 运行 → 提交检查（隐藏测试） —— */
  B.exercise = function (b, ctx) {
    const st = S().data;
    const e = DSA.h('div', 'exercise');
    e.innerHTML = `
      <div class="ex-h"><span>编程练习</span><b>${esc(b.title)}</b><span class="ex-badge" hidden>已通过</span></div>
      <div class="prose">${b.prompt}</div>
      <div class="ex-ed"></div>
      <div class="ex-btns">
        <button type="button" class="ghost ex-run">▶ 运行</button>
        <button type="button" class="primary ex-check">提交检查</button>
        <button type="button" class="ghost ex-hint">提示</button>
        <span class="sp"></span>
        <button type="button" class="ghost ex-reset">重置代码</button>
        <button type="button" class="ghost ex-sol">看参考答案</button>
      </div>
      <div class="ex-hints"></div>
      <div class="cb-out" hidden></div>
      <div class="ex-solution" hidden></div>`;
    const $ = (s) => e.querySelector(s);
    const out = $('.cb-out');
    const badge = $('.ex-badge');
    const showBadge = () => (badge.hidden = !st.ex[ctx.key]);
    const editor = DSA.editor(st.code[ctx.key] ?? b.starter.replace(/^\n+/, ''), {
      id: ctx.key + '-ed',
      onChange: (v) => {
        st.code[ctx.key] = v;
        S().saveSoon();
      },
      onRun: () => check(),
    });
    $('.ex-ed').append(editor);
    showBadge();

    $('.ex-run').onclick = () => runInto(out, editor.value);
    const check = async () => {
      const code = editor.value;
      const res = await runInto(out, code + '\n' + DSA.TEST_PRELUDE + '\n' + b.tests, {
        userLines: code.split('\n').length,
        success: '全部测试通过！做得好。',
      });
      if (res.ok) {
        st.ex[ctx.key] = true;
        S().save();
        showBadge();
        DSA.emit && DSA.emit('progress');
      }
    };
    $('.ex-check').onclick = check;

    let shown = 0;
    const hints = b.hints || [];
    const hintBtn = $('.ex-hint');
    hintBtn.hidden = !hints.length;
    hintBtn.onclick = () => {
      if (shown >= hints.length) return;
      $('.ex-hints').append(DSA.h('div', 'tip tip-info', `<div class="tip-h">提示 ${shown + 1}</div><div class="prose">${hints[shown]}</div>`));
      shown++;
      hintBtn.textContent = shown < hints.length ? `再给一个提示（${hints.length - shown}）` : '没有更多提示了';
      hintBtn.disabled = shown >= hints.length;
    };

    // 用“再点一次确认”代替浏览器弹窗，不打断学习
    const resetBtn = $('.ex-reset');
    const solBtn = $('.ex-sol');
    const twoStep = (btn, label, ask, action) => {
      let armed = false;
      btn.onclick = () => {
        if (!armed) {
          armed = true;
          btn.textContent = ask;
          btn.classList.add('armed');
          setTimeout(() => {
            armed = false;
            btn.textContent = label;
            btn.classList.remove('armed');
          }, 3000);
          return;
        }
        armed = false;
        btn.textContent = label;
        btn.classList.remove('armed');
        action();
      };
    };
    twoStep(resetBtn, '重置代码', '确定清空？再点一次', () => {
      editor.value = b.starter.replace(/^\n+/, '');
      editor.dispatchEvent(new Event('input'));
    });
    twoStep(solBtn, '看参考答案', '先自己试试？再点一次查看', () => {
      const sol = $('.ex-solution');
      sol.hidden = false;
      sol.innerHTML = `<div class="out-h">参考答案</div><pre class="cb-pre"><code>${DSA.py.hl(b.solution.trim())}</code></pre>`;
      solBtn.hidden = true;
    });
    return e;
  };
})();
