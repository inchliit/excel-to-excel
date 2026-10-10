/* anim/10-ifs.js — #10 IFS for ABC classes (Act 2 · Formulas that think).
   Clicks: ghost nested IF (count the brackets) → IFS typed as colour-coded pairs → fill-down A/B/C chips → "stops at first TRUE". */
extendTrick('ifs', (function () {
  const S = '.t-slide[data-trick="ifs"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-ifs')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-ifs">' + [
      S + '.ab-card{background:#fff;color:#1f1f1f;border-radius:10px;box-shadow:0 12px 34px rgba(0,0,0,.45);padding:9px 12px 10px;border-left:5px solid #107C41}',
      S + '.ab-lbl{font:800 12px var(--font);letter-spacing:.09em;text-transform:uppercase;color:#6b7785;margin-bottom:6px}',
      S + '.ab-code{font:600 17px/1.6 var(--mono);white-space:pre}',
      S + '.ab-foot{font:600 14px/1.35 var(--font);color:#5b6670;margin-top:4px}',
      S + '.ab-foot b{font-family:var(--mono);color:#c62828}',
      S + '.ab-legend .ab-chips{display:flex;gap:10px;align-items:center;font:600 15px var(--font);flex-wrap:wrap}',
      S + '.ab-chips span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}',
      S + '.abc-chip{display:inline-block;min-width:24px;padding:0 7px;border-radius:999px;font:800 14px/1.45 var(--font);text-align:center}',
      S + '.abc-chip.A,' + S + '.xg-cell.abc-A span{background:#2b8a3e;color:#fff}',
      S + '.abc-chip.B,' + S + '.xg-cell.abc-B span{background:#f59f00;color:#1f1f1f}',
      S + '.abc-chip.C,' + S + '.xg-cell.abc-C span{background:#868e96;color:#fff}',
      S + '.xg-cell.abc{justify-content:center}',
      S + '.xg-cell.abc span{display:inline-block;min-width:28px;padding:0 8px;border-radius:999px;font-weight:800;text-align:center;line-height:1.4}',
      // ghost nested IF
      S + '.ab-ghost{border-left-color:#c62828;transition:opacity .8s,filter .8s}',
      S + '.ab-ghost.faded{opacity:.38;filter:grayscale(1)}',
      S + '.ab-ghost .br{position:relative;display:inline-block;font-weight:800;border-radius:4px}',
      S + '.ab-ghost .br.d1{color:#2f6fd6}',
      S + '.ab-ghost .br.d2{color:#e8590c}',
      S + '.ab-ghost .br::after{content:attr(data-n);position:absolute;left:50%;top:78%;transform:translateX(-50%);font:800 10px var(--font)}',
      S + '.ab-ghost.anim .br{animation:abPulse .55s ease-out both;animation-delay:calc(.7s + var(--k) * .55s)}',
      '@keyframes abPulse{0%{background:transparent}45%{background:#fff2a8;transform:scale(1.35)}100%{background:transparent}}',
      S + '.ab-ghost.anim .ab-foot{animation:fadeIn .4s ease-out 3s both}',
      // IFS pairs
      S + '.ab-ifs .pr{display:block;border-radius:5px;padding:0 4px;margin:2px 0;border-left:4px solid transparent;position:relative}',
      S + '.ab-ifs .pr.A{background:rgba(43,138,62,.12);border-left-color:#2b8a3e}',
      S + '.ab-ifs .pr.B{background:rgba(245,159,0,.16);border-left-color:#f59f00}',
      S + '.ab-ifs .pr.C{background:rgba(134,142,150,.16);border-left-color:#868e96}',
      S + '.ab-ifs .pr .res{font-weight:800}',
      S + '.ab-ifs .pr.A .res{color:#2b8a3e}',
      S + '.ab-ifs .pr.B .res{color:#b36b00}',
      S + '.ab-ifs .pr.C .res{color:#5f666d}',
      S + '.ab-ifs .mk{position:absolute;right:6px;top:0;font:800 16px/1.6 var(--font)}',
      S + '.ab-ifs .mk.no{color:#c62828}',
      S + '.ab-ifs .mk.yes{color:#2b8a3e}',
      S + '.ab-ifs .mk.skip{color:#9aa3ab}',
      S + '.ab-ifs .pr.skip{opacity:.45}',
      S + '.ab-ifs.anim .ln{animation:popIn .25s ease-out both;animation-delay:var(--t)}',
      S + '.ab-sum{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:7px 12px;font:600 16px var(--font);color:#e8eef3;display:flex;gap:14px;align-items:center}',
      S + '.ab-sum .abc-chip{margin-right:4px}'
    ].join('\n') + '</style>');
  }

  // ---- data: 10 SKUs sorted by annual usage value; C = cumulative share (stored as the exact decimals shown) ----
  const SKUS = [
    ['SKU-118', 252300, 0.42], ['SKU-104', 125900, 0.63], ['SKU-131', 84100, 0.77], ['SKU-122', 47600, 0.85],
    ['SKU-109', 30200, 0.90], ['SKU-140', 23800, 0.94], ['SKU-127', 12400, 0.96], ['SKU-113', 11700, 0.98],
    ['SKU-136', 6300, 0.99], ['SKU-101', 5700, 1]
  ];
  const classOf = c => (c <= 0.8 ? 'A' : c <= 0.95 ? 'B' : 'C');      // the IFS rule, in plain JS
  const CLASSES = SKUS.map(s => classOf(s[2]));
  const F = r => '=IFS(C' + r + '<=0.8,"A",C' + r + '<=0.95,"B",TRUE,"C")';
  const pct = v => Math.round(v * 100) + '%';
  const typeMs = t => t.length * Math.max(18, Math.min(55, 1600 / Math.max(1, t.length)));

  const X = 670, W = 238;            // right-hand column for the formula cards

  function chip(g, ref) {
    const el = g.cell(ref), v = g.value(ref);
    el.classList.remove('abc-A', 'abc-B', 'abc-C');
    el.classList.add('abc', 'abc-' + v);
    el.innerHTML = '<span>' + v + '</span>';
  }

  function ghost(ctx, animate) {
    let k = 0;
    const br = (ch, d, n) => '<b class="br d' + d + '" data-n="' + n + '" style="--k:' + (k++) + '">' + ch + '</b>';
    const code = '=IF' + br('(', 1, 1) + 'C2&lt;=0.8,"A",\n' +
                 '  IF' + br('(', 2, 2) + 'C2&lt;=0.95,"B",\n' +
                 '    "C"' + br(')', 2, 2) + br(')', 1, 1);
    return ctx.box({ x: X, y: 98, w: W, cls: 'ab-card ab-ghost' + (animate ? ' anim' : ''),
      html: '<div class="ab-lbl">Old way · nested IF</div><div class="ab-code">' + code + '</div>' +
            '<div class="ab-foot">2 IFs → 2 brackets to close: <b>))</b></div>' });
  }

  // IFS card. trace = { row, c } adds ✗ / ✓ / – marks for that row's value.
  function ifsCard(ctx, { row = 2, trace = null, animate = false } = {}) {
    ctx.el.querySelectorAll('.ab-ifs').forEach(e => e.remove());
    const c = 'C' + row;
    const pairs = [
      { k: 'A', test: c + '&lt;=0.8', res: '"A"', ok: v => v <= 0.8 },
      { k: 'B', test: c + '&lt;=0.95', res: '"B"', ok: v => v <= 0.95 },
      { k: 'C', test: 'TRUE', res: '"C"', ok: () => true }
    ];
    let hit = false;
    const t = typeMs(F(2)) / F(2).length;            // ms per typed character (matches XGrid.type)
    const ends = [17, 30, 39];                         // pair end positions in =IFS(C2<=0.8,"A",C2<=0.95,"B",TRUE,"C")
    const lines = pairs.map((p, i) => {
      let mk = '', extra = '';
      if (trace) {
        if (hit) { mk = '<span class="mk skip">–</span>'; extra = ' skip'; }
        else if (p.ok(trace.c)) { mk = '<span class="mk yes">✓</span>'; hit = true; }
        else mk = '<span class="mk no">✗</span>';
      }
      return '<span class="pr ln ' + p.k + extra + '" style="--t:' + Math.round(ends[i] * t) + 'ms">  ' + p.test + ', <span class="res">' + p.res + '</span>' +
        (i < 2 ? ',' : ')') + mk + '</span>';
    });
    const title = trace ? 'Row ' + row + ': ' + c + ' = ' + pct(trace.c) + ' → ' + classOf(trace.c) : 'IFS · test, result pairs';
    return ctx.box({ x: X, y: 262, w: W, cls: 'ab-card ab-ifs' + (animate ? ' anim' : ''),
      html: '<div class="ab-lbl">' + title + '</div><div class="ab-code"><span class="ln" style="--t:0ms">=IFS(</span>' + lines.join('') + '</div>' +
            '<div class="ab-foot">' + (trace ? 'Stops at the first TRUE.' : 'Last pair TRUE,"C" = everything else.') + '</div>' });
  }

  return {
    stage(ctx) {
      const g = ctx.g = ctx.grid({
        x: 12, y: 14, cols: 6, rows: 11, colWidths: [80, 116, 72, 64, 136, 136],
        data: [['SKU', 'Usage value', 'Cum %', 'Class', '', '']].concat(SKUS),
        formats: { 'B2:B11': '#,##0', 'C2:C11': '0%' }
      });
      g.select('D2');
      ctx.box({ x: X, y: 14, w: W, cls: 'ab-card ab-legend',
        html: '<div class="ab-lbl">ABC rule · cum % of value</div><div class="ab-chips">' +
              '<span><i class="abc-chip A">A</i>≤ 80%</span><span><i class="abc-chip B">B</i>≤ 95%</span><span><i class="abc-chip C">C</i>rest</span></div>' });
      ctx.caption('ABC: SKUs sorted by usage value; column C is the cumulative %.');
    },
    steps: [
      // 1 · ghost nested IF with bracket counting
      (ctx, animate) => {
        ctx.g.select('D2');
        ghost(ctx, animate);
        ctx.caption('The old way: an IF inside an IF. Count the brackets…');
      },
      // 2 · ghost fades; IFS typed in D2 as colour-coded test → result pairs
      (ctx, animate) => {
        const g = ctx.g;
        ctx.el.querySelector('.ab-ghost').classList.add('faded');
        ifsCard(ctx, { animate });
        const commit = () => { g.enter('D2', classOf(SKUS[0][2]), F(2)); chip(g, 'D2'); g.select('D2'); };
        if (animate) { g.type('D2', F(2), true); ctx.later(typeMs(F(2)) + 350, commit); } else commit();
        ctx.caption('IFS: test, result, test, result… one bracket to close.');
      },
      // 3 · fill down D2:D11 → A/B/C chips
      (ctx, animate) => {
        const g = ctx.g;
        g.fill('D2', 'D2:D11', CLASSES.map(c => [c]), animate);
        SKUS.forEach((s, i) => { const r = i + 2; g.set('D' + r, { v: CLASSES[i], f: F(r) }); chip(g, 'D' + r); });
        g.select('D2:D11');
        const n = k => CLASSES.filter(c => c === k).length;
        // share of total usage value per class, from the raw values (not the rounded C column)
        const total = SKUS.reduce((a, s) => a + s[1], 0);
        const share = k => Math.round(SKUS.reduce((a, s, i) => a + (CLASSES[i] === k ? s[1] : 0), 0) / total * 100) + '%';
        const sum = ctx.box({ x: 12, y: 416, w: 642, cls: 'ab-sum',
          html: ['A', 'B', 'C'].map(k => '<span><i class="abc-chip ' + k + '">' + k + '</i>' + n(k) + ' SKUs = ' + share(k) + ' of value</span>').join('') });
        if (animate) sum.style.animation = 'popIn .3s ease-out .9s both';
        ctx.caption('Fill down: every SKU gets its class. ' + n('A') + ' A, ' + n('B') + ' B, ' + n('C') + ' C.');
      },
      // 4 · checks in order, stops at the first TRUE
      (ctx, animate) => {
        const g = ctx.g;
        const row = 5, c = SKUS[row - 2][2];          // SKU-122, 85% → B
        g.select('D' + row);
        ifsCard(ctx, { row, trace: { c }, animate: false });
        ctx.ui.callout({ text: 'Checks in order, stops at the first TRUE. <b>TRUE</b> at the end = else; forget it → <b>#N/A</b>.',
          x: 12, y: 466, w: 642, tone: 'info' });
        ctx.caption('IFS checks the tests in order and stops at the first TRUE.');
      }
    ],
    tryit: {
      sheet: [['SKU', 'Usage value', 'Cum %', 'Class']].concat(SKUS.map(s => s.slice())),
      task: 'Class each SKU in D2: "A" if Cum % ≤ 0.8, "B" if ≤ 0.95, otherwise "C". Your formula is filled down to D11.',
      target: 'D2',
      mode: 'fill',
      fill: 'D2:D11',
      expected: CLASSES.map(c => [c]),               // own JS rule → A,A,A,B,B,B,C,C,C,C
      mustUse: ['IFS'],
      hint: 'Pairs of test, result… end with TRUE,"C"',
      answer: '=IFS(C2<=0.8,"A",C2<=0.95,"B",TRUE,"C")'
    }
  };
})());
