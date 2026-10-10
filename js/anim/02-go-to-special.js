/* 02 Go To Special › Blanks + Ctrl+Enter: animation (plan Appendix › 02-go-to-special). One step = one click.
   F5 › Special… › Blanks selects only the empty cells; = ↑ then Ctrl+Enter fills each with "=cell above". */
(function () {
  const ID = 'go-to-special';
  const S = '.t-slide[data-trick="go-to-special"] ';
  const CSS =
    S + '.t02-gap { position: absolute; z-index: 3; pointer-events: none; box-sizing: border-box; border: 2px dashed #e03131; background: rgba(224,49,49,.10); }' +
    S + '.t02-gap.anim { animation: t02in .45s ease-out both; }' +
    '@keyframes t02in { from { opacity: 0; transform: scale(1.3); } }' +
    S + '.dlg-btn[data-btn="Special…"] { margin-right: auto; }' +
    S + '.dlg-btn.t02-on { background: #107C41; color: #fff; border-color: #107C41; }' +
    S + '.t02-lbl { margin: 0 0 4px; }' +
    S + '.t02-list { height: 92px; border: 1px solid #8a8a8a; background: #fff; margin-bottom: 10px; }' +
    S + '.t02-sec { font-weight: 600; margin-bottom: 6px; }' +
    S + '.t02-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; font-size: 14px; }' +
    S + '.t02-cols > div { display: flex; flex-direction: column; gap: 4px; }' +
    S + '.t02-cols .radio { white-space: nowrap; }' +
    S + '.ui-tag.t02-f { font-family: var(--mono); font-size: 15px; }' +
    S + '.ui-callout kbd { font-size: .85em; }';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + CSS + '</style>');
  }

  const DATA = [
    ['Line', 'Shift', 'Machine', 'Output'],
    ['L1', 'Day', 'M-101', 412],
    ['', 'Day', 'M-102', 398],
    ['', 'Night', 'M-101', 371],
    ['L2', 'Day', 'M-201', 455],
    ['', 'Night', 'M-202', 430],
    ['', 'Night', 'M-203', 402],
    ['L3', 'Day', 'M-301', 389],
    ['', 'Swing', 'M-302', 377]
  ];
  // Blank Line cells and what "=cell above" resolves to after Ctrl+Enter (A3=A2 → L1, A4=A3 → L1, …).
  const FILLS = [];
  let last = '';
  DATA.slice(1).forEach((row, i) => {
    const r = i + 2;
    if (row[0] === '') FILLS.push({ ref: 'A' + r, f: '=A' + (r - 1), v: last, row: r });
    else last = row[0];
  });
  const BLANKS = FILLS.map(b => b.ref);                       // A3, A4, A6, A7, A9
  const GX = 24, GY = 24, ROWH = 36, SHEET_TOP = GY + 1 + 33; // stage y of the column-header row
  const rowY = r => SHEET_TOP + 24 + (r - 1) * ROWH;          // stage y of sheet row r
  const RX = 476;                                             // right-hand column (grid ends at x≈452)

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
  // Press a dialog button: animated press when animating, static "pressed" look on replay.
  function pressBtn(d, label, animate, ms) {
    const b = d.querySelector('[data-btn="' + label + '"]');
    if (!b) return;
    if (animate) { b.classList.add('press'); b.style.animationDelay = ms + 'ms'; } else b.classList.add('t02-on');
  }
  const radio = (t, on) => '<span class="radio' + (on ? ' on hl' : '') + '">' + t + '</span>';

  extendTrick('go-to-special', {
    stage(ctx) {
      ctx.g = ctx.grid({ x: GX, y: GY, cols: 4, rows: 9, fontSize: 18, colWidths: [84, 96, 112, 96], title: 'Shift report', data: DATA });
      ctx.g.select('A1');
    },
    steps: [
      // 1. The gaps
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        BLANKS.forEach((ref, i) => {
          const o = g.overlay(ref, 't02-gap');
          if (animate) { o.classList.add('anim'); o.style.animationDelay = (i * 120) + 'ms'; }
        });
        delay(ctx.ui.callout({ text: 'A blank here means “same line as above”.<br>Excel doesn’t know that.', x: RX, y: 132, w: 330, tone: 'warn' }), 700, animate);
        ctx.caption('Sort or pivot this and the totals go wrong.');
      },
      // 2. Select A2:A9, F5 → Go To → Special…
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.select('A2:A9');
        delay(ctx.ui.keys(['F5'], { x: RX, y: 20 }), 300, animate);
        const d = delay(ctx.ui.dialog({
          title: 'Go To', x: RX, y: 104, w: 330, buttons: ['Special…', 'OK', 'Cancel'], primary: 'OK',
          body: '<div class="t02-lbl">Go to:</div><div class="t02-list"></div>' +
            '<div class="dlg-row">Reference: <span class="dlg-field" style="flex:1">&nbsp;</span></div>'
        }), 800, animate);
        pressBtn(d, 'Special…', animate, 1700);
        ctx.caption('F5 (or Ctrl+G) opens Go To. Click Special…');
      },
      // 3. Go To Special › Blanks › OK
      (ctx, animate) => {
        clear(ctx);
        const left = ['Notes', 'Constants', 'Formulas', 'Blanks', 'Current region', 'Current array', 'Objects'];
        const right = ['Row differences', 'Column differences', 'Precedents', 'Dependents', 'Last cell',
          'Visible cells only', 'Conditional formats', 'Data validation'];
        const d = ctx.ui.dialog({
          title: 'Go To Special', x: RX - 6, y: 40, w: 424, buttons: ['OK', 'Cancel'], primary: 'OK',
          body: '<div class="t02-sec">Select</div><div class="t02-cols"><div>' + left.map(t => radio(t, t === 'Blanks')).join('') +
            '</div><div>' + right.map(t => radio(t, false)).join('') + '</div></div>'
        });
        pressBtn(d, 'OK', animate, 1500);
        ctx.caption('Go To Special › Blanks › OK: Excel finds every empty cell.');
      },
      // 4. Blanks selected, active cell A3
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.sheet.querySelectorAll('.t02-gap').forEach(e => e.remove());
        BLANKS.slice(1).forEach(ref => g.mark(ref, 'hl-blue'));
        g.select('A3');
        delay(ctx.ui.tag('5 blanks selected · active cell A3', { x: RX, y: rowY(3) + 4, tone: 'info' }), 300, animate);
        ctx.caption('Only the 5 empty cells are selected; A3 is the active cell.');
      },
      // 5. = then ↑ → =A2
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        delay(ctx.ui.keys(['=', '↑'], { x: RX, y: 20 }), 0, animate);
        if (animate) {
          g.type('A3', '', false);
          ctx.later(260, () => g.type('A3', '=', false));
          ctx.later(720, () => { g.type('A3', '=A2', false); g.refBox('A2', 0); });
        } else {
          g.type('A3', '=A2', false);
          g.refBox('A2', 0);
        }
        ctx.caption('Type = then press ↑: A3 now says =A2, the cell above.');
      },
      // 6. Ctrl+Enter fills every selected blank
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.clearRefs();
        delay(ctx.ui.keys(['Ctrl', 'Enter'], { x: RX, y: 20 }), 0, animate);
        FILLS.forEach((b, i) => {
          g.set(b.ref, { v: b.v, f: b.f });
          const ms = 550 + i * 160;
          if (animate) { const el = g.cell(b.ref); el.style.animationDelay = ms + 'ms'; el.classList.add('pop'); }
          const t = delay(ctx.ui.tag(b.ref + '  ' + b.f, { x: RX, y: rowY(b.row) + 4, tone: 'good' }), ms, animate);
          t.classList.add('t02-f');
        });
        g.select('A3');
        ctx.caption('Ctrl+Enter fills every selected blank with =cell above.');
      },
      // 7. Freeze as values
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('hl-blue');
        g.select('A4');
        delay(ctx.ui.tag('← a formula, not a value', { x: 196, y: 28, tone: 'warn' }), 100, animate);
        delay(ctx.ui.callout({
          text: 'Freeze it: <kbd>Ctrl</kbd>+<kbd>C</kbd>, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd> › Values.',
          x: RX, y: 132, w: 340, tone: 'info' }), 350, animate);
        ctx.caption('They are formulas: freeze them as values before you sort.');
      }
    ]
  });
})();
