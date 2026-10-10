/* anim/11-filter-sort.js — #11 FILTER + SORT (Act 2 · Formulas that think).
   Clicks: the daily question → FILTER spills at H2 (passing rows glow, others dim) → wrap in SORT (rows slide into
   ascending OEE) → M-07's OEE drops to 79.0% and it slides into the spill. */
extendTrick('filter-sort', (function () {
  const S = '.t-slide[data-trick="filter-sort"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-filter-sort')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-filter-sort">' + [
      S + '.xg-cell.fs-slide{position:relative;z-index:3;animation:fsSlide .8s cubic-bezier(.3,.7,.25,1) both;animation-delay:var(--fd,0ms)}',
      '@keyframes fsSlide{from{transform:translateY(var(--dy));background:#dbe9ff}}',
      S + '.xg-cell.fs-new{animation:fsNew .9s ease-out both;animation-delay:.35s}',
      '@keyframes fsNew{0%{opacity:0;transform:translateX(-24px);background:#fff2a8}60%{opacity:1;transform:none;background:#fff2a8}}',
      S + '.ui-callout code{font:700 15px var(--mono);background:rgba(0,0,0,.06);padding:0 4px;border-radius:4px}'
    ].join('\n') + '</style>');
  }

  // ---- data: OEE = Availability × Performance × Quality, stored rounded to 3 decimals ----
  const HEAD = ['Machine', 'Line', 'Avail', 'Perf', 'Quality', 'OEE'];
  const r3 = x => Math.round(x * 1000) / 1000;
  const MACH = [
    ['M-01', 'L1', 0.95, 0.93, 0.99], ['M-02', 'L1', 0.88, 0.90, 0.98], ['M-03', 'L1', 0.97, 0.94, 0.99],
    ['M-04', 'L2', 0.91, 0.86, 0.97], ['M-05', 'L2', 0.96, 0.95, 0.97], ['M-06', 'L2', 0.93, 0.92, 0.97],
    ['M-07', 'L2', 0.95, 0.95, 0.99], ['M-08', 'L3', 0.99, 0.95, 0.98], ['M-09', 'L3', 0.90, 0.92, 0.98],
    ['M-10', 'L3', 0.98, 0.91, 0.99]
  ];
  const withOEE = m => m.slice(0, 5).concat([r3(m[2] * m[3] * m[4])]);
  const ROWS = MACH.map(withOEE);                              // 87.5, 77.6, 90.3, 75.9, 88.5, 83.0, 89.3, 92.2, 81.1, 88.3 %
  const LIMIT = 0.85;
  const pass = r => r[5] < LIMIT;
  const filter = rows => rows.filter(pass);                    // FILTER keeps source order
  const sortAsc = rows => rows.slice().sort((a, b) => a[5] - b[5]);   // SORT(…, 6, 1)
  // the change in click 4: M-07 availability 95% → 84%  ⇒ OEE 0.84 × 0.95 × 0.99 = 0.790
  const CH_ROW = 8, CH_AVAIL = 0.84;
  const ROWS2 = ROWS.map((r, i) => (i === CH_ROW - 2 ? withOEE([r[0], r[1], CH_AVAIL, r[3], r[4]]) : r));

  const F_FILTER = '=FILTER(A2:F11,F2:F11<0.85)';
  const F_SORT = '=SORT(FILTER(A2:F11,F2:F11<0.85),6,1)';
  const typeMs = t => t.length * Math.max(18, Math.min(55, 1600 / Math.max(1, t.length)));

  function typeThen(ctx, g, ref, text, animate, commit) {
    if (!animate) { commit(); return; }
    g.type(ref, text, true);
    ctx.later(typeMs(text) + 350, commit);
  }
  // Show a cell being edited through a list of intermediate texts, then commit.
  function editFrames(ctx, g, ref, frames, animate, commit) {
    if (!animate) { commit(); return; }
    const el = g.cell(ref);
    g.select(ref);
    el.classList.remove('num');
    el.classList.add('editing');
    const show = s => { el.textContent = s; g.formulaBar(s); };
    show(frames[0]);
    frames.forEach((s, i) => { if (i) ctx.later(400 + i * 80, () => show(s)); });
    ctx.later(400 + frames.length * 80 + 400, commit);
  }
  function clear(ctx) { ctx.el.querySelectorAll('.fs-tmp').forEach(e => e.remove()); }
  function note(ctx, text, tone, x = 50, w = 560) {
    const c = ctx.ui.callout({ text, x, y: 416, w, tone });
    c.classList.add('fs-tmp');
    return c;
  }
  function glowDim(g, rows) {
    rows.forEach((r, i) => {
      const rng = 'A' + (i + 2) + ':F' + (i + 2);
      g.unmark('hl-yellow', rng); g.unmark('dim', rng);
      g.mark(rng, pass(r) ? 'hl-yellow' : 'dim');
    });
  }
  // Write `after` into the spill at H2; when animating, each row slides from where it was in `before`.
  function placeSpill(g, before, after, animate) {
    g.spill('H2', after, false);
    if (!animate) return;
    after.forEach((row, j) => {
      const k = before.findIndex(b => b[0] === row[0]);
      for (let c = 0; c < 6; c++) {
        const el = g.cell(String.fromCharCode(72 + c) + (j + 2));
        if (k < 0) { el.classList.add('fs-new'); continue; }
        if (k === j) continue;
        el.style.setProperty('--dy', ((k - j) * g.rowH) + 'px');
        el.classList.add('fs-slide');
      }
    });
  }

  return {
    stage(ctx) {
      const g = ctx.g = ctx.grid({
        x: 50, y: 14, cols: 13, rows: 11, colWidths: [74, 50, 62, 58, 72, 66, 18, 74, 50, 62, 58, 72, 66],
        data: [HEAD.concat([''], HEAD)].concat(ROWS),
        formats: { 'C2:E11': '0%', 'F2:F11': '0.0%', 'J2:L11': '0%', 'M2:M11': '0.0%' }
      });
      ROWS.forEach((r, i) => g.set('F' + (i + 2), { v: r[5], f: '=C' + (i + 2) + '*D' + (i + 2) + '*E' + (i + 2) }));
      g.select('H2');
      ctx.caption('OEE = Availability × Performance × Quality, for 10 machines.');
    },
    steps: [
      // 1 · the daily question
      (ctx, animate) => {
        const g = ctx.g;
        g.select('F2:F11');
        note(ctx, 'Today: filter, sort, copy, paste. Tomorrow: the same again.', 'warn', 50, 420);
        const t = ctx.ui.tag('World-class OEE ≈ 85%', { x: 520, y: 432, tone: 'info' });
        t.classList.add('fs-tmp');
        ctx.caption('Daily: which machines are under 85% OEE, worst first?');
      },
      // 2 · FILTER: passing rows glow, others dim → spill at H2
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.refBox('A2:F11', 0);
        g.refBox('F2:F11', 1);
        typeThen(ctx, g, 'H2', F_FILTER, animate, () => {
          g.clearRefs();
          glowDim(g, ROWS);
          const out = filter(ROWS);
          g.spill('H2', out);
          g.set('H2', { v: out[0][0], f: F_FILTER });
          g.select('H2');
          note(ctx, 'One formula in H2. The result <b>spills</b> into as many rows as it needs (blue dashed border).', 'good', 50, 600);
        });
        ctx.caption('FILTER keeps the rows where OEE &lt; 0.85 and spills them from H2.');
      },
      // 3 · wrap in SORT(…,6,1): rows slide into ascending OEE order
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        const before = filter(ROWS), after = sortAsc(before);
        const frames = [];
        for (let i = 0; i <= 5; i++) frames.push('=' + 'SORT('.slice(0, i) + F_FILTER.slice(1));
        for (let i = 1; i <= 5; i++) frames.push('=SORT(' + F_FILTER.slice(1) + ',6,1)'.slice(0, i));
        editFrames(ctx, g, 'H2', frames, animate, () => {
          placeSpill(g, before, after, animate);
          g.set('H2', { v: after[0][0], f: F_SORT });
          g.select('H2');
          note(ctx, '<code>SORT(array, 6, 1)</code>: by the 6th column (OEE); 1 = ascending, so the worst machine is on top.', 'good', 50, 640);
        });
        ctx.caption('Wrap it in SORT(…, 6, 1): ascending OEE, worst machine first.');
      },
      // 4 · M-07's availability drops → OEE 79.0% → it slides into the spill
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        const before = sortAsc(filter(ROWS)), after = sortAsc(filter(ROWS2));
        const row2 = ROWS2[CH_ROW - 2];
        typeThen(ctx, g, 'C' + CH_ROW, Math.round(CH_AVAIL * 100) + '%', animate, () => {
          g.enter('C' + CH_ROW, CH_AVAIL);
          g.set('F' + CH_ROW, { v: row2[5], f: '=C' + CH_ROW + '*D' + CH_ROW + '*E' + CH_ROW });
          g.flash('F' + CH_ROW);
          glowDim(g, ROWS2);
          placeSpill(g, before, after, animate);
          g.set('H2', { v: after[0][0], f: F_SORT });
          g.select('F' + CH_ROW);
          note(ctx, '<b>#SPILL!</b> = something blocks the spill range. Clear the cells in the way.', 'warn', 50, 600);
        });
        ctx.caption(row2[0] + ' availability drops to ' + Math.round(CH_AVAIL * 100) + '%: OEE ' + (row2[5] * 100).toFixed(1) + '%, so it joins the list.');
      }
    ],
    tryit: {
      sheet: [HEAD].concat(ROWS.map(r => r.slice())),          // plain numbers; OEE already rounded to 3 decimals
      task: 'List the machines with OEE below 0.85, worst first: one formula in H2 that spills all 6 columns.',
      target: 'H2',
      mode: 'spill',
      expected: sortAsc(filter(ROWS)).map(r => r.slice()),       // own JS: M-04 .759, M-02 .776, M-09 .811, M-06 .830
      mustUse: ['FILTER', 'SORT'],
      hint: 'Put FILTER inside SORT: SORT(FILTER(rows, OEE<0.85), 6, 1). 6 = the OEE column, 1 = ascending.',
      answer: '=SORT(FILTER(A2:F11,F2:F11<0.85),6,1)'
    }
  };
})());
