/* 03 Paste Special › Divide: animation (plan Appendix › 03-paste-special-math). One step = one click.
   Copy 60, select the seconds, Ctrl+Alt+V › Paste: Values + Operation: Divide → minutes in place.
   Paste: Values (not All) so the table keeps its own 0.00 format; All would also paste G2's General format. */
(function () {
  const ID = 'paste-special-math';
  const S = '.t-slide[data-trick="paste-special-math"] ';
  const CSS =
    S + '.dlg-btn[data-btn="Paste Link"] { margin-right: auto; }' +
    S + '.dlg-btn.t03-on { background: #107C41; color: #fff; border-color: #107C41; }' +
    S + '.t03-cols { display: grid; grid-template-columns: 1.15fr 1fr; gap: 0 18px; }' +
    S + '.t03-cols > div { display: flex; flex-direction: column; gap: 3px; }' +
    S + '.t03-sec { font-weight: 600; margin-bottom: 3px; padding-bottom: 2px; border-bottom: 1px solid #e3e3e3; }' +
    S + '.t03-cols .radio { white-space: nowrap; }' +
    S + '.t03-checks { display: flex; gap: 28px; margin-top: 10px; }';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + CSS + '</style>');
  }

  const ELEMENTS = ['Pick part', 'Load fixture', 'Weld', 'Inspect', 'Unload'];
  const SECONDS = [
    [12.6, 13.2, 12.0, 12.6],
    [18.0, 17.4, 18.6, 18.0],
    [24.6, 25.2, 24.0, 24.6],
    [9.0, 9.6, 9.0, 8.4],
    [6.6, 7.2, 6.6, 6.0]
  ];
  // Every observation is a multiple of 0.6 s, so s/60 is exact to 2 dp (12.6 → 0.21, 18.0 → 0.30).
  const MINUTES = SECONDS.map(r => r.map(v => Math.round((v / 60) * 100) / 100));
  const DATA = [['Element', 'Obs 1', 'Obs 2', 'Obs 3', 'Obs 4', '', '']].concat(ELEMENTS.map((e, i) => [e].concat(SECONDS[i])));
  const RX = 512;                 // right-hand column (grid ends at x≈500)
  const KEYS = { x: 12, y: 384 }; // keycaps below the grid

  // ---- helpers (local to this file) ----
  const TRANSIENT = '.ui-keys, .ui-dialog, .ui-ribbon, .ui-cursor, .ui-menu, .ui-callout, .ui-tag';
  function clear(ctx) { ctx.el.querySelectorAll(TRANSIENT).forEach(e => { if (!e.classList.contains('keep')) e.remove(); }); }
  function seq(ctx, animate, ms, fn) { if (animate) ctx.later(ms, fn); else fn(); }
  function delay(el, ms, animate) {
    if (!el || !animate) return el;
    el.style.animationDelay = ms + 'ms';
    el.querySelectorAll('kbd').forEach(k => { k.style.animationDelay = 'calc(' + ms + 'ms + .25s + var(--k) * var(--kd))'; });
    return el;
  }
  function pop(g, anchor, rows, animate, base, step) {
    g.cascade(anchor, rows, animate);
    if (!animate) return;
    const p = window.XGrid.parseRef(anchor);
    rows.forEach((row, i) => row.forEach((v, j) => {
      const el = g.cell(window.XGrid.refOf(p.r + i, p.c + j));
      if (el) el.style.animationDelay = (base + (i + j) * step) + 'ms';
    }));
  }
  function pressBtn(d, label, animate, ms) {
    const b = d.querySelector('[data-btn="' + label + '"]');
    if (!b) return;
    if (animate) { b.classList.add('press'); b.style.animationDelay = ms + 'ms'; } else b.classList.add('t03-on');
  }
  function unitTag(ctx, text, tone, animate) {
    ctx.el.querySelectorAll('.t03-unit').forEach(e => e.remove());
    const t = ctx.ui.tag(text, { x: 12, y: 14, tone, animate });
    t.classList.add('keep', 't03-unit');
    return t;
  }
  const radio = (t, on) => '<span class="radio' + (on ? ' on hl' : '') + '">' + t + '</span>';

  extendTrick('paste-special-math', {
    stage(ctx) {
      ctx.g = ctx.grid({
        x: 12, y: 52, cols: 7, rows: 7, fontSize: 16, colWidths: [120, 62, 62, 62, 62, 18, 62], title: 'Time study',
        data: DATA, formats: { 'B2:E6': '0.00' }
      });
      ctx.g.select('A1');
      unitTag(ctx, 'Unit: seconds', 'info', false);
    },
    steps: [
      // 1. The problem
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.select('B2:E6');
        g.mark('B2:E6', 'hl-yellow');
        ctx.caption('Recorded in seconds; the standard needs minutes.');
      },
      // 2. Type 60 in G2, Ctrl+C → marching ants
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('hl-yellow');
        if (animate) {
          g.type('G2', '60', true);
          ctx.later(450, () => { g.enter('G2', 60, null, false); g.select('G2'); });
        } else {
          g.enter('G2', 60, null, false);
          g.select('G2');
        }
        delay(ctx.ui.keys(['Ctrl', 'C'], KEYS), 550, animate);
        seq(ctx, animate, 900, () => g.mark('G2', 'ants'));
        ctx.caption('Type 60 in a spare cell, then copy it: Ctrl+C.');
      },
      // 3. Select B2:E6 (ants stay on)
      (ctx, animate) => {
        clear(ctx);
        ctx.g.select('B2:E6');
        ctx.caption('Select the seconds. The 60 is still on the clipboard.');
      },
      // 4. Ctrl+Alt+V → Paste Special: Values + Divide → OK
      (ctx, animate) => {
        clear(ctx);
        delay(ctx.ui.keys(['Ctrl', 'Alt', 'V'], KEYS), 0, animate);
        const paste = ['All', 'Formulas', 'Values', 'Formats', 'Comments and Notes', 'Validation'];
        const ops = ['None', 'Add', 'Subtract', 'Multiply', 'Divide'];
        const d = delay(ctx.ui.dialog({
          title: 'Paste Special', x: RX, y: 36, w: 396, buttons: ['Paste Link', 'OK', 'Cancel'], primary: 'OK',
          body: '<div class="t03-cols"><div><div class="t03-sec">Paste</div>' + paste.map(t => radio(t, t === 'Values')).join('') +
            '</div><div><div class="t03-sec">Operation</div>' + ops.map(t => radio(t, t === 'Divide')).join('') + '</div></div>' +
            '<div class="t03-checks"><span class="check">Skip blanks</span><span class="check">Transpose</span></div>'
        }), 450, animate);
        pressBtn(d, 'OK', animate, 1700);
        ctx.caption('Paste: Values + Operation: Divide keeps your formatting.');
      },
      // 5. Values change in place
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        pop(g, 'B2', MINUTES, animate, 0, 60);
        g.select('B2:E6');
        unitTag(ctx, 'Unit: minutes', 'good', animate);
        ctx.caption('In place: 12.60 s → 0.21 min. No helper column, no formulas.');
      },
      // 6. Other uses
      (ctx, animate) => {
        clear(ctx);
        delay(ctx.ui.callout({
          text: 'Multiply by 1 turns text-numbers into numbers; ×1.1 = +10% on a whole price list.',
          x: RX, y: 110, w: 360, tone: 'info' }), 0, animate);
        ctx.caption('Add, Subtract, Multiply, Divide: a whole range in one paste.');
      }
    ]
  });
})();
