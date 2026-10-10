/* anim/06-mixed-refs.js — #06 Mixed references with F4 (Act 2). Storyboard: plan appendix, one step per click.
   Wrong fill (=B2*C1) is computed for real: each cell = left neighbour × cell above, shown in Excel's General
   format (≤ 11 chars, scientific above 11 digits); G6 overflows past 1.8E+308, so Excel shows #NUM!. */
(function () {
  const ID = 'mixed-refs';
  const S = '.t-slide[data-trick="' + ID + '"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + `
${S}.t06-qty{color:#b8c7d3;font:600 15px var(--font);text-align:center;padding-bottom:5px;border-bottom:2px solid rgba(159,176,191,.55);letter-spacing:.02em}
${S}.t06-lens{display:flex;align-items:stretch;height:70px;background:#fff;color:#1f1f1f;border-radius:8px;box-shadow:0 12px 34px rgba(0,0,0,.45);overflow:hidden}
${S}.t06-lens .fx{display:flex;align-items:center;padding:0 16px;font:italic 700 24px Georgia,serif;color:#777;border-right:1px solid #ddd}
${S}.t06-lens code{display:flex;align-items:center;padding:0 18px;font:600 34px var(--mono);white-space:pre}
${S}.t06-lens .tok{background:#fff2a8;border-radius:4px;box-shadow:0 0 0 2px #f2c94c}
${S}.t06-lens .tok::after{content:"";display:inline-block;width:2px;height:30px;margin-left:2px;vertical-align:-4px;background:#111;animation:caret 1s steps(1) infinite}
${S}b.d{color:#d9480f;font-weight:800}
${S}.t06-strip{display:flex;align-items:flex-start;gap:6px}
${S}.t06-strip .ch{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:96px;padding:7px 10px;border-radius:10px;background:var(--panel2);border:1px solid var(--line);color:var(--ink)}
${S}.t06-strip .ch code{font:700 22px var(--mono)}
${S}.t06-strip .ch small{font:700 12px var(--font);color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
${S}.t06-strip .ch.on{background:#fff2a8;border-color:#f2c94c;color:#1f1f1f}
${S}.t06-strip .ch.on small{color:#6b5600}
${S}.t06-strip .ar{color:var(--muted);font:700 20px var(--font);padding-top:12px}
${S}.xg-cell.t06-err{justify-content:center}
${S}.xg-cell.t06-alarm{animation:t06alarm .5s ease-in-out 3}
@keyframes t06alarm{50%{background:#ff6b6b;color:#fff}}
` + '</style>');
  }

  // ---- data (IE: cost of a batch = unit cost × batch quantity) ----
  const PARTS = ['Bracket', 'Housing', 'Shaft', 'Gear', 'Bolt kit'];
  const COST = [12.5, 8.75, 4.2, 22, 1.35];
  const QTY = [100, 250, 500, 1000, 2500];
  const QCOL = ['C', 'D', 'E', 'F', 'G'];
  const round = v => Math.round(v * 1e6) / 1e6;
  const RIGHT = COST.map(c => QTY.map(q => round(c * q)));                 // =$B2*C$1 filled
  const WRONG = COST.map(() => QTY.map(() => 0));                           // =B2*C1 filled
  COST.forEach((c, i) => QTY.forEach((q, j) => { WRONG[i][j] = (j ? WRONG[i][j - 1] : c) * (i ? WRONG[i - 1][j] : q); }));
  const fWrong = (i, j) => '=' + (j ? QCOL[j - 1] : 'B') + (i + 2) + '*' + QCOL[j] + (i + 1);
  const fRight = (i, j) => '=$B' + (i + 2) + '*' + QCOL[j] + '$1';

  // Excel "General" display in a cell: up to 11 characters, scientific from 12 digits on, #NUM! past 1.8E+308.
  function general(v) {
    if (!isFinite(v)) return '#NUM!';
    if (Math.abs(v) < 1e11) return String(+v.toPrecision(10));
    const e = Math.floor(Math.log10(Math.abs(v)));
    const es = 'E+' + (e < 10 ? '0' + e : e);
    return (v / Math.pow(10, e)).toFixed(11 - es.length - 2).replace(/0+$/, '').replace(/\.$/, '') + es;
  }

  // ---- helpers ----
  const GX = 20, GY = 44, LY = 336;                     // grid origin; y of the lens / callout row
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hiD = s => esc(s).replace(/\$/g, '<b class="d">$</b>');
  const rm = el => { if (el && el.remove) el.remove(); };
  // beats: [[delay after previous, fn], ...] — run in order now (replay) or spaced out (animated step)
  function beats(ctx, animate, list) {
    let t = 0;
    list.forEach(([d, fn]) => { t += animate ? d : 0; if (t === 0) fn(); else ctx.later(t, fn); });
  }
  function typeInto(ctx, g, ref, from, to, animate) {
    const el = g.cell(ref);
    g.select(ref);
    el.classList.add('editing');
    el.classList.remove('num');
    if (!animate) { el.textContent = to; g.formulaBar(to); return 0; }
    el.textContent = from;
    g.formulaBar(from);
    for (let i = from.length + 1; i <= to.length; i++) {
      const s = to.slice(0, i);
      ctx.later((i - from.length) * 45, () => { el.textContent = s; g.formulaBar(s); });
    }
    return (to.length - from.length) * 45;
  }
  function editShow(g, ref, text) {
    const el = g.cell(ref);
    el.classList.add('editing');
    el.classList.remove('num');
    el.textContent = text;
    g.formulaBar(text);
  }
  function lens(ctx, pre, tok, post) {
    const el = ctx.box({ x: GX, y: LY, w: 380, cls: 't06-lens', html: '<span class="fx">fx</span><code></code>' });
    setLens(el, pre, tok, post);
    return el;
  }
  function setLens(el, pre, tok, post) {
    el.querySelector('code').innerHTML = hiD(pre) + '<span class="tok">' + hiD(tok) + '</span>' + hiD(post);
  }
  function strip(ctx, states, labels) {
    return ctx.box({ x: GX, y: LY + 90, cls: 't06-strip',
      html: states.map((s, k) => (k ? '<span class="ar">→</span>' : '') + '<div class="ch"><code>' + hiD(s) + '</code><small>' + labels[k] + '</small></div>').join('') });
  }
  function setStrip(el, k) { el.querySelectorAll('.ch').forEach((c, i) => c.classList.toggle('on', i === k)); }
  function showWrong(g) {
    WRONG.forEach((row, i) => row.forEach((v, j) => {
      const el = g.cell(QCOL[j] + (i + 2));
      el.textContent = general(v);
      if (!isFinite(v)) el.classList.add('t06-err');
    }));
  }

  extendTrick(ID, {
    stage(ctx) {
      ctx.g = ctx.grid({ x: GX, y: GY, cols: 7, rows: 7, colWidths: [92, 92, 112, 112, 112, 112, 112],
        data: [['Part', 'Unit cost'].concat(QTY)].concat(PARTS.map((p, i) => [p, COST[i]])),
        formats: { 'B2:B6': '0.00' } });
      ctx.box({ x: GX + 1 + 38 + 92 + 92, y: 12, w: 560, cls: 't06-qty', html: 'Batch quantity (pcs) →' });
      ctx.caption('Unit cost per part in column B, batch quantities in row 1.');
    },
    steps: [
      // 1 · the job
      (ctx) => {
        const g = ctx.g;
        g.mark('B2:B6', 'hl-blue');
        g.mark('C1:G1', 'hl-yellow');
        g.select('C2:G6');
        ctx.t06c = ctx.ui.callout({ x: GX, y: LY, w: 500,
          text: 'Cost = <b>unit cost</b> (column B) × <b>batch qty</b> (row 1).<br>25 cells. Can ONE formula fill them all?' });
        ctx.caption('Cost = unit cost × quantity, for 25 cells.');
      },
      // 2 · relative refs: right once, wrong everywhere else
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('=B2*C1 gives 1,250. Fill it to G6: relative refs slide and break.');
        beats(ctx, animate, [
          [0, () => {
            g.unmark('hl-blue'); g.unmark('hl-yellow'); rm(ctx.t06c);
            typeInto(ctx, g, 'C2', '', '=B2*C1', animate);
            g.refBox('B2', 0); g.refBox('C1', 1);
          }],
          [650, () => { g.clearRefs(); g.enter('C2', 1250, '=B2*C1'); g.select('C2'); }],
          [700, () => {
            g.fill('C2', 'C2:G6', WRONG.map((row, i) => row.map((v, j) => ({ v, f: fWrong(i, j) }))));
            showWrong(g);
          }],
          [1150, () => {
            g.mark('C3:C6', 'hl-red'); g.mark('D2:G6', 'hl-red');
            if (animate) { g.mark('C3:C6', 't06-alarm'); g.mark('D2:G6', 't06-alarm'); }
          }],
          [900, () => {
            g.select('D3'); g.refBox('C3', 0); g.refBox('D2', 1);
            ctx.t06c = ctx.ui.callout({ x: GX, y: LY, w: 600, tone: 'warn',
              text: 'D3 now holds <b>=C3*D2</b>: both refs slid with the fill.<br>It should be B3 × D1 = 8.75 × 250 = 2,187.5' });
          }]
        ]);
      },
      // 3 · F4 ×3 on B2: B2 → $B$2 → B$2 → $B2
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('Cursor on B2 in the formula, press F4: B2 → $B$2 → B$2 → $B2');
        rm(ctx.t06c);
        g.clearRefs();
        g.select('C2');
        g.refBox('B2', 0); g.refBox('C1', 1);
        const st = ['B2', '$B$2', 'B$2', '$B2'];
        ctx.t06lens = lens(ctx, '=', st[0], '*C1');
        ctx.t06strip = strip(ctx, st, ['relative', 'absolute', 'row locked', 'column locked']);
        ctx.t06keys = ctx.ui.keys(['F4', 'F4', 'F4'], { x: 600, y: LY });
        ctx.t06mac = ctx.ui.tag('Mac: Cmd+T  ·  laptop: Fn+F4', { x: 600, y: LY + 70, tone: 'info' });
        const show = k => { setLens(ctx.t06lens, '=', st[k], '*C1'); setStrip(ctx.t06strip, k); editShow(g, 'C2', '=' + st[k] + '*C1'); };
        beats(ctx, animate, [[0, () => show(0)], [480, () => show(1)], [450, () => show(2)], [450, () => show(3)]]);
      },
      // 4 · F4 ×2 on C1 → C$1; what the $ means
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('Same on C1: F4 twice → C$1. The formula is now =$B2*C$1');
        rm(ctx.t06strip); rm(ctx.t06keys);
        const st = ['C1', '$C$1', 'C$1'];
        ctx.t06strip = strip(ctx, st, ['relative', 'absolute', 'row locked']);
        ctx.t06keys = ctx.ui.keys(['F4', 'F4'], { x: 600, y: LY });
        const show = k => { setLens(ctx.t06lens, '=$B2*', st[k], ''); setStrip(ctx.t06strip, k); editShow(g, 'C2', '=$B2*' + st[k]); };
        beats(ctx, animate, [[0, () => show(0)], [480, () => show(1)], [450, () => show(2)],
          [550, () => {
            g.clearRefs(); g.refBox('B2:B6', 0); g.refBox('C1:G1', 1);
            ctx.t06c = ctx.ui.callout({ x: 600, y: LY + 112, w: 270, tone: 'good',
              text: '<b class="d">$</b>B: always the cost column<br><b class="d">$</b>1: always the qty row' });
          }]]);
      },
      // 5 · fill again: all 25 right
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('Enter, fill to G6: all 25 costs right, from ONE formula.');
        [ctx.t06lens, ctx.t06strip, ctx.t06keys, ctx.t06mac, ctx.t06c].forEach(rm);
        g.clearRefs();
        beats(ctx, animate, [
          [0, () => {
            g.unmark('hl-red'); g.unmark('t06-alarm'); g.unmark('t06-err');
            g.enter('C2', 1250, '=$B2*C$1'); g.select('C2');
          }],
          [450, () => g.fill('C2', 'C2:G6', RIGHT.map((row, i) => row.map((v, j) => ({ v, f: fRight(i, j) }))))],
          [1100, () => {
            g.mark('C2:G6', 'hl-green');
            ctx.t06c = ctx.ui.callout({ x: GX, y: LY, w: 560, tone: 'good',
              text: 'G6 = <b>$B6*G$1</b> = 1.35 × 2,500 = 3,375 ✓<br>Column B and row 1 stayed put; everything else moved.' });
          }]
        ]);
      }
    ],
    // expected: plain JS, unit cost × qty (rounded to 6 dp to drop float noise), checked by hand:
    // 12.5×100=1250 … 8.75×250=2187.5 … 1.35×2500=3375
    tryit: {
      sheet: [['Part', 'Unit cost'].concat(QTY)].concat(PARTS.map((p, i) => [p, COST[i]])),
      task: 'Cost = unit cost (column B) × batch quantity (row 1). Type ONE formula in C2 that is still right when filled to G6.',
      target: 'C2',
      mode: 'fill',
      fill: 'C2:G6',
      expected: RIGHT,
      mustUse: [],
      hint: 'Lock the column of the cost ($B) and the row of the qty ($1).',
      answer: '=$B2*C$1'
    }
  });
})();
