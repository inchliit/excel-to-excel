/* 01 Flash Fill: animation (plan Appendix › 01-flash-fill). One step = one presenter click.
   Type ONE example, Ctrl+E fills the rest. Columns B, C, D are split out of the MES log code in column A. */
(function () {
  const ID = 'flash-fill';
  const S = '.t-slide[data-trick="flash-fill"] ';
  const CSS =
    S + '.t01-l { color: #1c5fd4; }' +
    S + '.t01-o { color: #0b7a3b; }' +
    S + '.t01-s { color: #c2410c; }' +
    S + '.t01-code b { font-weight: 700; }' +
    S + '.t01-code i { font-style: normal; color: #8a8a8a; }' +
    S + '.xg-cell.head.t01-l, ' + S + '.xg-cell.head.t01-o, ' + S + '.xg-cell.head.t01-s { box-shadow: inset 0 -3px 0 currentColor; }' +
    S + '.ui-callout .t01-l, ' + S + '.ui-callout .t01-o, ' + S + '.ui-callout .t01-s { font-family: var(--mono); font-weight: 800; }';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + CSS + '</style>');
  }

  const CODES = ['L2-OP0423-NIGHT', 'L1-OP0187-DAY', 'L3-OP0552-SWING', 'L2-OP0311-DAY',
    'L1-OP0629-NIGHT', 'L3-OP0098-DAY', 'L2-OP0740-SWING', 'L1-OP0415-DAY'];
  const PARTS = CODES.map(c => c.split('-'));
  const proper = s => s.charAt(0) + s.slice(1).toLowerCase();
  // What Flash Fill returns for rows 2-9 of each column (D: proper case, as in the typed example "Night").
  const COL = { B: PARTS.map(p => [p[0]]), C: PARTS.map(p => [p[1]]), D: PARTS.map(p => [proper(p[2])]) };
  const RX = 604;   // right-hand annotation column (grid ends at x≈578)

  // ---- helpers (local to this file) ----
  const TRANSIENT = '.ui-keys, .ui-dialog, .ui-ribbon, .ui-cursor, .ui-menu, .ui-callout, .ui-tag';
  function clear(ctx) { ctx.el.querySelectorAll(TRANSIENT).forEach(e => { if (!e.classList.contains('keep')) e.remove(); }); }
  // Cosmetic sequencing: runs later while animating, instantly on replay (final state is identical).
  function seq(ctx, animate, ms, fn) { if (animate) ctx.later(ms, fn); else fn(); }
  // Delay an overlay's entrance animation (and its keycap presses) by ms. No-op on replay.
  function delay(el, ms, animate) {
    if (!el || !animate) return el;
    el.style.animationDelay = ms + 'ms';
    el.querySelectorAll('kbd').forEach(k => { k.style.animationDelay = 'calc(' + ms + 'ms + .25s + var(--k) * var(--kd))'; });
    return el;
  }
  // Set values now; when animating they pop in one by one starting at `base` ms.
  function pop(g, anchor, rows, animate, base, step) {
    g.cascade(anchor, rows, animate);
    if (!animate) return;
    const p = window.XGrid.parseRef(anchor);
    rows.forEach((row, i) => row.forEach((v, j) => {
      const el = g.cell(window.XGrid.refOf(p.r + i, p.c + j));
      if (el) el.style.animationDelay = (base + (i + j) * step) + 'ms';
    }));
  }
  function colorCodes(g) {
    PARTS.forEach((p, i) => {
      g.cell('A' + (i + 2)).innerHTML = '<span class="t01-code"><b class="t01-l">' + p[0] + '</b><i>-</i><b class="t01-o">' +
        p[1] + '</b><i>-</i><b class="t01-s">' + p[2] + '</b></span>';
    });
    g.cell('B1').classList.add('t01-l');
    g.cell('C1').classList.add('t01-o');
    g.cell('D1').classList.add('t01-s');
  }
  // One click: type the example in row 2, Enter, then Ctrl+E fills rows 3-9.
  function flashColumn(ctx, col, animate) {
    const g = ctx.g, vals = COL[col], first = col + '2';
    if (animate) {
      g.type(first, vals[0][0], true);
      ctx.later(650, () => { g.enter(first, vals[0][0], null, false); g.select(col + '3'); g.formulaBar(''); });
    } else {
      g.enter(first, vals[0][0], null, false);
    }
    delay(ctx.ui.keys(['Ctrl', 'E'], { x: RX, y: 20 }), 800, animate);
    pop(g, col + '3', vals.slice(1), animate, 1250, 90);
    seq(ctx, animate, 1250, () => g.select(col + '3:' + col + '9'));
  }

  extendTrick('flash-fill', {
    stage(ctx) {
      ctx.g = ctx.grid({
        x: 24, y: 24, cols: 4, rows: 9, fontSize: 18, colWidths: [220, 84, 116, 92], title: 'MES export',
        data: [['Log Code', 'Line', 'Operator', 'Shift']].concat(CODES.map(c => [c]))
      });
      ctx.g.select('A1');
    },
    steps: [
      // 1. The problem
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.select('A2:A9');
        g.mark('A2:A9', 'hl-yellow');
        colorCodes(g);
        delay(ctx.ui.callout({
          text: 'One code, three fields:<br><span class="t01-l">L2</span> = Line<br><span class="t01-o">OP0423</span> = Operator<br><span class="t01-s">NIGHT</span> = Shift',
          x: RX, y: 96, w: 280, tone: 'info' }), 300, animate);
        ctx.caption('Machine export jams line, operator and shift into one code.');
      },
      // 2. Type one example
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('hl-yellow');
        g.type('B2', 'L2', animate);
        ctx.caption('Type ONE example of what you want: L2 in B2.');
      },
      // 3. Select B3, Ctrl+E: B3:B9 cascade
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.enter('B2', 'L2', null, false);
        g.select('B3');
        delay(ctx.ui.keys(['Ctrl', 'E'], { x: RX, y: 20 }), 0, animate);
        pop(g, 'B3', COL.B.slice(1), animate, 650, 90);
        seq(ctx, animate, 650, () => g.select('B3:B9'));
        ctx.caption('Excel learns the pattern from one example.');
      },
      // 4. Operator column
      (ctx, animate) => {
        clear(ctx);
        flashColumn(ctx, 'C', animate);
        ctx.caption('Same move for the operator: type OP0423, then Ctrl+E.');
      },
      // 5. Shift column, proper case
      (ctx, animate) => {
        clear(ctx);
        flashColumn(ctx, 'D', animate);
        delay(ctx.ui.tag('NIGHT → Night: case fixed too', { x: RX, y: 100, tone: 'good' }), 2000, animate);
        ctx.caption('It even fixes the case: NIGHT becomes Night.');
      },
      // 6. Gotcha callout
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.select('C5');
        delay(ctx.ui.tag('← plain text, no formula', { x: 236, y: 28, tone: 'info' }), 150, animate);
        delay(ctx.ui.callout({
          text: 'Result = plain values, not formulas.<br>Spot-check: inconsistent rows fool it.',
          x: RX - 4, y: 96, w: 276, tone: 'warn' }), 400, animate);
        ctx.caption('New or changed codes? Run Ctrl+E again, then spot-check.');
      }
    ]
  });
})();
