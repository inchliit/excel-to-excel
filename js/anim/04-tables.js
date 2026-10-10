/* 04 Ctrl+T Tables: animation (plan Appendix › 04-tables). One step = one presenter click.
   Ctrl+T turns the log into a Table: banded rows, filter buttons, a calculated column with structured refs,
   and a chart that picks up the new row. Table look = Excel's default blue table style, drawn with local CSS. */
(function () {
  const ID = 'tables';
  const S = '.t-slide[data-trick="tables"] ';
  const CSS =
    S + '.xg-cell.t04-th { background: #4472C4; color: #fff; border-right-color: #6a8fd3; position: relative; padding-right: 21px; }' +
    S + '.xg-cell.t04-band { background: #D9E1F2; }' +
    S + '.xg-cell.t04-row { border-bottom-color: #b4c6e7; }' +
    S + '.t04-fb { position: absolute; right: 3px; top: 50%; margin-top: -8px; width: 16px; height: 16px; box-sizing: border-box; background: #fff;' +
      ' border: 1px solid #8a99b8; border-radius: 2px; color: #333; font: 400 11px/15px "Segoe UI", system-ui, sans-serif; text-align: center; }' +
    S + '.dlg-btn.t04-on { background: #107C41; color: #fff; border-color: #107C41; }' +
    S + '.t04-q { margin-bottom: 8px; }' +
    S + '.xc .bar.t04-grow { transform-box: fill-box; transform-origin: bottom; animation: t04grow .7s cubic-bezier(.2,.8,.2,1) both; }' +
    S + '.xc .t04-fade { animation: t04fade .4s ease-out both; }' +
    '@keyframes t04grow { from { transform: scaleY(0); } }' +
    '@keyframes t04fade { from { opacity: 0; } }' +
    S + '.ui-callout code { font: 700 15px var(--mono); background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px; }' +
    S + '.ui-callout kbd { font-size: .85em; }';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + CSS + '</style>');
  }

  const HEAD = ['Date', 'Line', 'Units', 'Defects', 'Yield'];
  const ROWS = [
    ['6-Oct', 'L1', 412, 6],
    ['6-Oct', 'L2', 398, 4],
    ['6-Oct', 'L3', 455, 9],
    ['7-Oct', 'L1', 430, 5],
    ['7-Oct', 'L2', 389, 8],
    ['7-Oct', 'L3', 377, 3]
  ];
  const NEW = ['8-Oct', 'L1', 455, 7];
  const FORMULA = '=1-[@Defects]/[@Units]';
  const yieldOf = r => 1 - r[3] / r[2];   // 98.5%, 99.0%, 98.0%, 98.8%, 97.9%, 99.2%; new row 98.5%
  const CHART = { x: 588, y: 24, w: 318, h: 250, title: 'Units' };
  const RX = 588;                       // right-hand column (grid ends at x≈576)
  const KEYS = { x: 24, y: 412 };       // keycaps below the grid

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
  function popCell(g, ref, v, animate, ms) {
    g.set(ref, v);
    if (animate) { const el = g.cell(ref); el.style.animationDelay = ms + 'ms'; el.classList.add('pop'); }
  }
  function pressBtn(d, label, animate, ms) {
    const b = d.querySelector('[data-btn="' + label + '"]');
    if (!b) return;
    if (animate) { b.classList.add('press'); b.style.animationDelay = ms + 'ms'; } else b.classList.add('t04-on');
  }
  // Dates are real dates in Excel: right-aligned like numbers.
  function dateAlign(g, ref) { const el = g.cell(ref); if (el) el.classList.add('num'); }
  // Table styling for one data row (r = sheet row number); data rows alternate band / white.
  function styleRow(g, r, animate, ms) {
    ['A', 'B', 'C', 'D', 'E'].forEach(c => {
      const el = g.cell(c + r);
      if (animate) el.style.transitionDelay = ms + 'ms';
      el.classList.add('t04-row');
      if ((r - 2) % 2 === 0) el.classList.add('t04-band');
    });
  }
  function chart(ctx, rows, newIdx, animate) {
    ctx.el.querySelectorAll('.t04-chart').forEach(e => e.remove());
    const data = rows.map((r, i) => ({ label: r[1], value: r[2], cls: i === newIdx ? 'hot' : '' }));
    const box = ctx.charts.bars(Object.assign({ data, animate: false }, CHART));
    box.classList.add('t04-chart');
    if (newIdx != null && animate) {
      const bars = box.querySelectorAll('rect.bar'), lbls = box.querySelectorAll('text.lbl');
      const b = bars[bars.length - 1], l = lbls[lbls.length - 1];
      b.classList.add('t04-grow'); b.style.animationDelay = '950ms';
      l.classList.add('t04-fade'); l.style.animationDelay = '1500ms';
    }
    return box;
  }

  extendTrick('tables', {
    stage(ctx) {
      const g = ctx.g = ctx.grid({
        x: 24, y: 24, cols: 6, rows: 9, fontSize: 16, colWidths: [80, 64, 76, 92, 84, 116], title: 'Production',
        data: [HEAD].concat(ROWS), formats: { 'E2:E9': '0.0%' }
      });
      for (let r = 2; r <= 7; r++) dateAlign(g, 'A' + r);
      g.select('A1');
      chart(ctx, ROWS, null, false);
    },
    steps: [
      // 1. The daily chore
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.deselect();
        g.refBox('C1', 1);
        g.refBox('B2:B7', 3);
        g.refBox('C2:C7', 0);
        delay(ctx.ui.tag('Chart range stuck at C2:C7', { x: RX, y: 288, tone: 'warn' }), 300, animate);
        delay(ctx.ui.tag('Yield: copy the formula down… again', { x: RX, y: 326, tone: 'warn' }), 600, animate);
        ctx.caption('Every day: copy formulas down, fix chart ranges by hand.');
      },
      // 2. Click A1, Ctrl+T → Create Table → OK
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.clearRefs();
        g.select('A1');
        delay(ctx.ui.keys(['Ctrl', 'T'], KEYS), 0, animate);
        seq(ctx, animate, 450, () => g.mark('A1:E7', 'ants'));
        const d = delay(ctx.ui.dialog({
          title: 'Create Table', x: RX, y: 290, w: 312, buttons: ['OK', 'Cancel'], primary: 'OK',
          body: '<div class="t04-q">Where is the data for your table?</div>' +
            '<div class="dlg-row"><span class="dlg-field on" style="flex:1">=$A$1:$E$7</span></div>' +
            '<div class="dlg-row"><span class="check on hl">My table has headers</span></div>'
        }), 450, animate);
        pressBtn(d, 'OK', animate, 1700);
        ctx.caption('Click A1, Ctrl+T: check the range, keep “My table has headers”.');
      },
      // 3. Banded table + filter buttons
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('ants');
        HEAD.forEach((h, i) => {
          const el = g.cell(window.XGrid.colName(i) + '1');
          el.classList.add('t04-th');
          el.insertAdjacentHTML('beforeend', '<i class="t04-fb">▾</i>');
        });
        for (let r = 2; r <= 7; r++) styleRow(g, r, animate, (r - 2) * 70);
        g.select('A1');
        delay(ctx.ui.tag('Table Design › Table Name: tblProd', { x: RX, y: 288, tone: 'info' }), 600, animate);
        ctx.caption('One keystroke: banded rows, filter buttons, a named Table.');
      },
      // 4. Structured-reference formula fills the whole column
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        const commit = () => {
          g.clearRefs();
          ROWS.forEach((r, i) => popCell(g, 'E' + (i + 2), { v: yieldOf(r), f: FORMULA }, animate, i * 110));
          g.select('E3');
        };
        if (animate) {
          g.type('E2', FORMULA, true);
          ctx.later(420, () => g.refBox('D2', 0));
          ctx.later(900, () => g.refBox('C2', 1));
          ctx.later(1700, commit);
        } else {
          commit();
        }
        delay(ctx.ui.tag('[@Defects] = Defects on this row', { x: RX, y: 288, tone: 'info' }), 500, animate);
        delay(ctx.ui.tag('One Enter fills the whole column', { x: RX, y: 326, tone: 'good' }), 1900, animate);
        ctx.caption('Readable refs: [@Defects] = this row’s Defects. One Enter fills all.');
      },
      // 5. New row joins the table; Yield and chart follow
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.select('A8');
        NEW.forEach((v, i) => popCell(g, window.XGrid.colName(i) + '8', v, animate, i * 160));
        dateAlign(g, 'A8');
        styleRow(g, 8, animate, 0);
        popCell(g, 'E8', { v: yieldOf(NEW), f: FORMULA }, animate, 800);
        seq(ctx, animate, 800, () => g.select('E8'));
        chart(ctx, ROWS.concat([NEW]), ROWS.length, animate);
        delay(ctx.ui.tag('Yield 98.5% filled in by itself', { x: RX, y: 288, tone: 'good' }), 900, animate);
        delay(ctx.ui.tag('Chart range grew to row 8', { x: RX, y: 326, tone: 'good' }), 1300, animate);
        ctx.caption('Type below the table: it joins, Yield fills, the chart grows.');
      },
      // 6. Total row + structured SUM
      (ctx, animate) => {
        clear(ctx);
        delay(ctx.ui.tag('Table Design › Table Name: tblProd', { x: RX, y: 288, tone: 'info' }), 0, animate);
        delay(ctx.ui.callout({
          text: '<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> = total row.<br><code>=SUM(tblProd[Units])</code> always includes new rows.',
          x: RX, y: 330, w: 284, tone: 'info' }), 250, animate);
        ctx.caption('Name it once: formulas and charts follow every new row.');
      }
    ]
  });
})();
