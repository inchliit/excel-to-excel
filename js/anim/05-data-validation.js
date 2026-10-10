/* 05 Data Validation dropdowns: animation (plan Appendix › 05-data-validation). One step = one presenter click.
   List validation on D2:D12 from H2:H6: dropdown to pick, typos refused, Circle Invalid Data flags old entries.
   The messy entries are typos and a stray trailing space ("Dent "), not case: pivots/COUNTIF ignore case. */
(function () {
  const ID = 'data-validation';
  const S = '.t-slide[data-trick="data-validation"] ';
  const CSS =
    S + '.t05-sp { display: inline-block; width: 8px; height: 13px; margin-left: 1px; border-bottom: 2px solid #e03131; }' +
    S + '.dlg-btn[data-btn="Clear All"] { margin-right: auto; }' +
    S + '.dlg-btn.t05-on { background: #107C41; color: #fff; border-color: #107C41; }' +
    S + '.t05-tabs { display: flex; gap: 2px; margin: -4px 0 10px; border-bottom: 1px solid #cfcfcf; font-size: 13.5px; }' +
    S + '.t05-tabs span { padding: 3px 9px; border: 1px solid transparent; border-bottom: 0; color: #555; }' +
    S + '.t05-tabs span.on { border-color: #cfcfcf; background: #fff; color: #111; margin-bottom: -1px; font-weight: 600; }' +
    S + '.t05-sec { font-weight: 600; margin-bottom: 4px; }' +
    S + '.t05-lab { width: 58px; }' +
    S + '.t05-ind { margin-left: 66px; }' +
    S + '.t05-dd { position: absolute; z-index: 6; width: 20px; box-sizing: border-box; background: #f3f3f3; border: 1px solid #9a9a9a;' +
      ' display: flex; align-items: center; justify-content: center; font-size: 11px; color: #333; pointer-events: none; }' +
    S + '.ui-menu.t05-list { min-width: 0; padding: 2px 0; border-radius: 2px; border-color: #8a8a8a; font-size: 15px; }' +
    S + '.ui-menu.t05-list div { padding: 3px 10px; }' +
    S + '.ui-menu.t05-list div.on { background: #cde8ff; box-shadow: none; font-weight: 400; }' +
    S + '.t05-err { display: flex; gap: 14px; align-items: center; font-size: 15px; line-height: 1.4; }' +
    S + '.t05-x { flex: none; width: 32px; height: 32px; border-radius: 50%; background: #d13438; color: #fff; display: flex; align-items: center;' +
      ' justify-content: center; font-weight: 700; font-size: 17px; }' +
    S + '.t05-oval { position: absolute; z-index: 7; pointer-events: none; box-sizing: content-box; border: 2.5px solid #e03131; border-radius: 50%;' +
      ' padding: 3px 7px; margin: -5.5px 0 0 -9.5px; }' +
    S + '.t05-oval.anim { animation: t05in .45s ease-out both; }' +
    '@keyframes t05in { from { opacity: 0; transform: scale(1.5); } }' +
    S + '.ui-callout .t05-v { font-family: var(--mono); font-weight: 700; color: #9b1c1c; }';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + CSS + '</style>');
  }

  const LIST = ['Scratch', 'Dent', 'Crack', 'Misalignment', 'Burr'];   // H2:H6
  const ROWS = [
    ['6-Oct', 'L1', 'BRK-12', 'Scratch', 3],
    ['6-Oct', 'L2', 'HSG-40', 'scrtch', 2],
    ['6-Oct', 'L3', 'SFT-08', 'Dent', 1],
    ['7-Oct', 'L1', 'BRK-12', 'Crack', 4],
    ['7-Oct', 'L2', 'HSG-40', 'Scrach', 2],
    ['7-Oct', 'L3', 'SFT-08', 'Dent ', 5],   // trailing space: looks like Dent, counts as a different value
    ['8-Oct', 'L1', 'BRK-12', 'Crak', 1],
    ['8-Oct', 'L2', 'HSG-40', 'Misalignment', 2],
    ['8-Oct', 'L3', 'SFT-08', '', 3],        // row 10: pick Crack from the dropdown
    ['9-Oct', 'L1', 'BRK-12', '', 2]         // row 11: try to type "crak"
  ];
  const DATA = [['Date', 'Line', 'Part', 'Defect', 'Qty', '', '', 'Defect list']]
    .concat(ROWS.map((r, i) => r.concat(['', '', i < LIST.length ? LIST[i] : ''])));
  // Entries that fail the list rule (exact match against H2:H6): scrtch, Scrach, "Dent ", Crak → D3, D6, D7, D8.
  const INVALID = ROWS.map((r, i) => (r[3] !== '' && !LIST.includes(r[3]) ? 'D' + (i + 2) : null)).filter(Boolean);
  const GX = 12, GY = 12, ROWH = 30, SHEET_TOP = GY + 1 + 33;   // stage y of the column-header row
  const COLW = [64, 46, 76, 124, 46, 20, 20, 124];
  const RX = 588;                                              // right-hand column (grid ends at x≈572)

  // ---- helpers (local to this file) ----
  const TRANSIENT = '.ui-keys, .ui-dialog, .ui-ribbon, .ui-cursor, .ui-menu, .ui-callout, .ui-tag';
  function clear(ctx) { ctx.el.querySelectorAll(TRANSIENT).forEach(e => { if (!e.classList.contains('keep')) e.remove(); }); }
  function seq(ctx, animate, ms, fn) { if (animate) ctx.later(ms, fn); else fn(); }
  function delay(el, ms, animate) {
    if (!el || !animate) return el;
    el.style.animationDelay = ms + 'ms';
    el.querySelectorAll('kbd').forEach(k => { k.style.animationDelay = 'calc(' + ms + 'ms + .25s + var(--k) * var(--kd))'; });
    el.querySelectorAll('.rb, .sep').forEach(k => { k.style.animationDelay = 'calc(' + ms + 'ms + var(--i) * .3s)'; });
    return el;
  }
  function pressBtn(d, label, animate, ms) {
    const b = d.querySelector('[data-btn="' + label + '"]');
    if (!b) return;
    if (animate) { b.classList.add('press'); b.style.animationDelay = ms + 'ms'; } else b.classList.add('t05-on');
  }
  // Stage coordinates of a cell (no layout reads: same arithmetic as XGrid.box).
  function cellXY(g, ref) { const b = g.box(ref); return { x: GX + 1 + b.left, y: SHEET_TOP + b.top, w: b.width, h: b.height }; }
  function showSpace(g) {   // make the invisible trailing space visible for the audience
    const el = g.cell('D7');
    el.innerHTML = 'Dent<span class="t05-sp" title="trailing space"></span>';
  }

  extendTrick('data-validation', {
    stage(ctx) {
      ctx.g = ctx.grid({ x: GX, y: GY, cols: 8, rows: 12, fontSize: 15, colWidths: COLW, data: DATA });
      ctx.g.select('A1');
    },
    steps: [
      // 1. The mess
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        INVALID.forEach(ref => g.mark(ref, 'hl-red'));
        showSpace(g);
        delay(ctx.ui.callout({
          text: '3 defects, 7 spellings:<br><span class="t05-v">Scratch · scrtch · Scrach</span><br>' +
            '<span class="t05-v">Dent · Dent<span class="t05-sp"></span></span> (stray space)<br><span class="t05-v">Crack · Crak</span>',
          x: RX, y: 40, w: 288, tone: 'warn' }), 400, animate);
        ctx.caption('Typos and stray spaces split one defect into many → wrong counts.');
      },
      // 2. Select D2:D12, Data › Data Tools › Data Validation: List, =$H$2:$H$6 → OK
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('hl-red');
        g.select('D2:D12');
        delay(ctx.ui.ribbon({ tab: 'Data', path: ['Data Tools', 'Data Validation'], x: GX, y: 460 }), 0, animate);
        seq(ctx, animate, 1000, () => g.mark('H2:H6', 'ants'));
        const d = delay(ctx.ui.dialog({
          title: 'Data Validation', x: RX, y: 24, w: 320, buttons: ['Clear All', 'OK', 'Cancel'], primary: 'OK',
          body: '<div class="t05-tabs"><span class="on">Settings</span><span>Input Message</span><span>Error Alert</span></div>' +
            '<div class="t05-sec">Validation criteria</div>' +
            '<div class="dlg-row"><span class="t05-lab">Allow:</span><span class="dlg-field on">List ▾</span></div>' +
            '<div class="dlg-row t05-ind"><span class="check on">Ignore blank</span></div>' +
            '<div class="dlg-row t05-ind"><span class="check on hl">In-cell dropdown</span></div>' +
            '<div class="dlg-row"><span class="t05-lab">Source:</span><span class="dlg-field on" style="flex:1">=$H$2:$H$6</span></div>'
        }), 900, animate);
        pressBtn(d, 'OK', animate, 2300);
        ctx.caption('Allow: List · Source: =$H$2:$H$6 · In-cell dropdown ticked.');
      },
      // 3. Click a cell → dropdown arrow → list opens → pick Crack
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.unmark('ants');
        g.select('D10');
        const b = g.box('D10');
        const dd = document.createElement('div');
        dd.className = 't05-dd';
        Object.assign(dd.style, { left: (b.left + b.width + 1) + 'px', top: b.top + 'px', height: b.height + 'px' });
        dd.textContent = '▾';
        g.sheet.appendChild(dd);
        const c = cellXY(g, 'D10');
        const list = delay(ctx.ui.menu({ items: LIST, on: 'Crack', x: c.x, y: c.y + c.h, w: c.w }), 800, animate);
        list.classList.add('t05-list');
        const onCrack = { x: c.x + 60, y: c.y + c.h + 2 + 2 * 27 + 8 };   // over the 3rd list item
        if (animate) {
          const cur = ctx.ui.cursor({ x: c.x + c.w + 6, y: c.y + 10, click: true });
          ctx.later(1300, () => { cur.style.transition = 'left .45s ease, top .45s ease'; cur.style.left = onCrack.x + 'px'; cur.style.top = onCrack.y + 'px'; });
        } else {
          ctx.ui.cursor({ x: onCrack.x, y: onCrack.y });
        }
        ctx.caption('Every cell gets a dropdown: click the arrow, pick Crack.');
      },
      // 4. Crack is in; typing "crak" is refused
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.sheet.querySelectorAll('.t05-dd').forEach(e => e.remove());
        g.enter('D10', 'Crack', null, animate);
        g.type('D11', 'crak', animate);
        delay(ctx.ui.dialog({
          title: 'Microsoft Excel', x: 384, y: 262, w: 470, buttons: ['Retry', 'Cancel', 'Help'], primary: 'Retry',
          body: '<div class="t05-err"><span class="t05-x">✕</span><span>This value doesn\'t match the data validation restrictions defined for this cell.</span></div>'
        }), 800, animate);
        ctx.caption('Type “crak” and Excel refuses it: only list values get in.');
      },
      // 5. Data Validation › Circle Invalid Data
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.set('D11', '');
        g.select('D11');
        delay(ctx.ui.ribbon({ tab: 'Data', path: ['Data Tools', 'Data Validation ▾', 'Circle Invalid Data'], x: GX, y: 460 }), 0, animate);
        INVALID.forEach((ref, i) => {
          const o = g.overlay(ref, 't05-oval');
          if (animate) { o.classList.add('anim'); o.style.animationDelay = (1300 + i * 180) + 'ms'; }
        });
        delay(ctx.ui.tag(INVALID.length + ' old entries break the rule', { x: RX, y: 160, tone: 'warn' }), 2200, animate);
        ctx.caption('Old bad entries? Circle Invalid Data rings them in red.');
      }
    ]
  });
})();
