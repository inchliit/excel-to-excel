/* 14 · Pivot Table + Slicers (Act 3): downtime by cause, one click per line. Storyboard: plan appendix.
   Stage: a 16-row downtime log (Sheet1). The pivot goes to a new sheet; every total is summed from LOG below. */
(function () {
  const LOG = [                                      // Date | Line | Cause | Minutes  (Mon 5 – Fri 9 Oct)
    ['5-Oct', 'L1', 'Changeover', 45], ['5-Oct', 'L2', 'Breakdown', 70], ['5-Oct', 'L3', 'Material wait', 35],
    ['6-Oct', 'L1', 'Minor stops', 18], ['6-Oct', 'L2', 'Changeover', 40], ['6-Oct', 'L3', 'Quality hold', 25],
    ['7-Oct', 'L1', 'Breakdown', 30], ['7-Oct', 'L2', 'Breakdown', 55], ['7-Oct', 'L3', 'Material wait', 40],
    ['8-Oct', 'L1', 'Changeover', 50], ['8-Oct', 'L2', 'Minor stops', 22], ['8-Oct', 'L3', 'Changeover', 30],
    ['9-Oct', 'L1', 'Quality hold', 20], ['9-Oct', 'L2', 'Material wait', 15], ['9-Oct', 'L3', 'Minor stops', 16],
    ['9-Oct', 'L1', 'Changeover', 35]
  ];
  const TOTAL = LOG.reduce((s, r) => s + r[3], 0);   // 546

  // The pivot: Sum of Minutes by Cause (only rows of `line` when a slicer button is picked), sorted largest first.
  function pivot(line) {
    const sum = {};
    LOG.forEach(r => { if (!line || r[1] === line) sum[r[2]] = (sum[r[2]] || 0) + r[3]; });
    const rows = Object.keys(sum).map(c => [c, sum[c]]).sort((a, b) => b[1] - a[1]);
    return { rows, total: rows.reduce((s, r) => s + r[1], 0) };
  }

  const PV = { x: 10, y: 10, fs: 15, rowH: 30, w: [168, 150, 90, 90] };
  const PV_ROW = r => PV.y + 1 + 32 + 24 + (r - 1) * PV.rowH;           // stage y of pivot-sheet row r
  const FL = { x: 562, y: 10, w: 348, h: 520 };
  const SL = { x: 384, y: 128, w: 152, head: 36, btn: 34, gap: 6, pad: 8 };
  const SL_BTN_Y = i => SL.y + SL.pad + SL.head + i * (SL.btn + SL.gap); // stage y of slicer button i

  const ICON = {
    filters: '<svg viewBox="0 0 16 16"><path d="M2 3h12l-4.5 5v4.5l-3 1.5V8z" fill="none" stroke="#555" stroke-width="1.3"/></svg>',
    columns: '<svg viewBox="0 0 16 16"><path d="M3 2v12M8 2v12M13 2v12" stroke="#555" stroke-width="2"/></svg>',
    rows: '<svg viewBox="0 0 16 16"><path d="M2 3h12M2 8h12M2 13h12" stroke="#555" stroke-width="2"/></svg>',
    values: '<b>Σ</b>',
    multi: '<svg viewBox="0 0 16 16"><path d="M2 4h3M2 8h3M2 12h3M7 4h7M7 8h7M7 12h7" stroke="#444" stroke-width="1.5"/></svg>',
    clear: '<svg viewBox="0 0 16 16"><path d="M1.5 2.5h9l-3.6 4.2v4.5l-1.8 1v-5.5z" fill="none" stroke="#555" stroke-width="1.2"/><path d="M10 9.5l4.5 4.5M14.5 9.5L10 14" stroke="#d13438" stroke-width="1.6"/></svg>',
    funnel: '<svg class="t14-fun" viewBox="0 0 16 16"><path d="M2 3h12l-4.5 5v4.5l-3 1.5V8z" fill="#2f6fd6"/></svg>'
  };

  const P = '.t-slide[data-trick="pivot-slicers"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-pivot-slicers')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-pivot-slicers">' +
      P + '.t14-dlg .dlg-body{padding:10px 16px;line-height:1.35}' +
      P + '.t14-sub{font-weight:600;margin:8px 0 2px}' +
      P + '.t14-sub:first-child{margin-top:0}' +
      P + '.t14-ind{padding-left:22px}' +
      P + '.t14-dlg .dlg-field{font-size:14.5px;min-width:200px}' +
      P + '.t14-dim{color:#9a9a9a}' +
      P + '.ui-dialog.anim.t14-late{animation:popIn .3s ease-out .9s both}' +
      P + '.xg-tab span.t14-tab2{background:transparent;border-bottom-color:transparent;color:#666;font-weight:400}' +
      P + '.t14-ph{position:absolute;z-index:3;box-sizing:border-box;border:1px solid #c7c7c7;background:#f7f9fb;display:flex;align-items:center;justify-content:center;text-align:center;color:#555;font-size:14px;line-height:1.5}' +
      P + '.t14-ph b{color:#333;font-size:15px}' +
      P + '.xg-cell.t14-h{font-weight:700;background:#dde7f3;box-shadow:inset 0 -1px 0 #8eaadb}' +
      P + '.xg-cell.t14-t{font-weight:700;background:#dde7f3;box-shadow:inset 0 1px 0 #8eaadb}' +
      P + '.t14-dd{font-style:normal;margin-left:auto;border:1px solid #aab4be;border-radius:2px;font-size:10px;line-height:1;padding:2px 3px;color:#444;background:#fff}' +
      P + '.t14-fl{background:#fff;color:#1f1f1f;border:1px solid #b8bec4;border-radius:6px;box-shadow:0 14px 40px rgba(0,0,0,.45);font:14px "Segoe UI",system-ui,sans-serif;padding:10px 12px;box-sizing:border-box}' +
      P + '.t14-flh{display:flex;justify-content:space-between;align-items:center;font-size:17px;margin-bottom:6px}' +
      P + '.t14-flh span{color:#777;font-size:14px}' +
      P + '.t14-fls{font-size:13px;color:#444;margin:6px 0}' +
      P + '.t14-search{border:1px solid #c8c8c8;color:#999;font-size:13px;padding:4px 8px}' +
      P + '.t14-fields{margin:6px 0 4px}' +
      P + '.t14-f{display:flex;align-items:center;gap:8px;height:28px;padding:0 4px}' +
      P + '.t14-f i{width:13px;height:13px;border:1.5px solid #555;border-radius:2px;box-sizing:border-box}' +
      P + '.t14-f.on{font-weight:700}' +
      P + '.t14-f.on i{background:#107C41;border-color:#107C41;box-shadow:inset 0 0 0 2px #fff}' +
      P + '.t14-fun{width:13px;height:13px}' +
      P + '.t14-areas{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      P + '.t14-a{border:1px solid #c8c8c8;height:118px;padding:5px 6px;box-sizing:border-box}' +
      P + '.t14-ah{display:flex;align-items:center;gap:6px;font-size:13px;color:#444;margin-bottom:6px}' +
      P + '.t14-ah svg{width:14px;height:14px}' +
      P + '.t14-chip{display:flex;justify-content:space-between;background:#eef3f8;border:1px solid #a9bcd0;border-radius:2px;padding:3px 6px;font-size:13.5px}' +
      P + '.t14-fly{z-index:35;background:#eef3f8;border:1px solid #2f6fd6;border-radius:3px;padding:3px 10px;font:600 14px "Segoe UI",system-ui,sans-serif;color:#1f1f1f;box-shadow:0 6px 16px rgba(0,0,0,.35);animation:t14-fly .7s ease-in-out both}' +
      P + '.t14-sl{background:#fff;color:#1f1f1f;border:1px solid #9aa3ab;border-radius:4px;box-shadow:0 12px 30px rgba(0,0,0,.45);padding:' + SL.pad + 'px;box-sizing:border-box;font:15px "Segoe UI",system-ui,sans-serif}' +
      P + '.t14-sl.t14-in{animation:popIn .3s ease-out 1.45s both}' +
      P + '.t14-slh{height:' + SL.head + 'px;display:flex;justify-content:space-between;align-items:flex-start;font-weight:600}' +
      P + '.t14-slh span{display:flex;gap:6px}' +
      P + '.t14-slh svg{width:16px;height:16px}' +
      P + '.t14-sl .t14-clr{opacity:.3}' +
      P + '.t14-sl.filtered .t14-clr{opacity:1}' +
      P + '.t14-sb{height:' + SL.btn + 'px;margin-bottom:' + SL.gap + 'px;display:flex;align-items:center;justify-content:center;border:1px solid #d0d0d0;border-radius:3px;background:#fff;color:#8a8a8a;transition:background .25s,color .25s,border-color .25s}' +
      P + '.t14-sb.on{background:#cfe0f5;border-color:#8eaadb;color:#1f1f1f;font-weight:600}' +
      P + '.t14-sb:last-child{margin-bottom:0}' +
      '@keyframes t14-out{to{opacity:0;transform:scale(.97)}}' +
      '@keyframes t14-fly{0%{opacity:0;transform:none}15%{opacity:1;transform:none}100%{opacity:1;transform:translate(var(--dx),var(--dy))}}' +
      '@keyframes t14-sort{0%{opacity:0;transform:translateY(var(--from))}12%{opacity:1;transform:translateY(var(--from))}55%{transform:translateY(var(--from))}100%{transform:none}}' +
      '@keyframes t14-menu{0%{opacity:0}15%,80%{opacity:1}100%{opacity:0}}' +
      '</style>');
  }

  const CREATE_BODY =
    '<div class="t14-sub">Choose the data that you want to analyze</div>' +
    '<div class="dlg-row"><span class="radio on">Select a table or range</span></div>' +
    '<div class="dlg-row t14-ind">Table/Range: <span class="dlg-field on">Sheet1!$A$1:$D$17</span></div>' +
    '<div class="dlg-row"><span class="radio">Use an external data source</span></div>' +
    '<div class="t14-sub">Choose where you want the PivotTable report to be placed</div>' +
    '<div class="dlg-row"><span class="radio on hl">New Worksheet</span></div>' +
    '<div class="dlg-row"><span class="radio">Existing Worksheet</span></div>' +
    '<div class="dlg-row t14-ind t14-dim">Location: <span class="dlg-field">&nbsp;</span></div>' +
    '<div class="t14-sub">Choose whether you want to analyze multiple tables</div>' +
    '<div class="dlg-row"><span class="check">Add this data to the Data Model</span></div>';

  const FIELDS_HTML =
    '<div class="t14-flh"><b>PivotTable Fields</b><span>⚙&nbsp;&nbsp;✕</span></div>' +
    '<div class="t14-fls">Choose fields to add to report:</div>' +
    '<div class="t14-search">Search</div>' +
    '<div class="t14-fields">' + ['Date', 'Line', 'Cause', 'Minutes'].map(f => '<div class="t14-f" data-f="' + f + '"><i></i>' + f + '</div>').join('') + '</div>' +
    '<div class="t14-fls">Drag fields between areas below:</div>' +
    '<div class="t14-areas">' +
    [['filters', 'Filters'], ['columns', 'Columns'], ['rows', 'Rows'], ['values', 'Values']]
      .map(([k, t]) => '<div class="t14-a" data-a="' + k + '"><div class="t14-ah">' + ICON[k] + t + '</div></div>').join('') +
    '</div>';

  const SLICER_HTML =
    '<div class="t14-slh">Line<span>' + ICON.multi + '<i class="t14-clr">' + ICON.clear + '</i></span></div>' +
    ['L1', 'L2', 'L3'].map(l => '<div class="t14-sb on" data-v="' + l + '">' + l + '</div>').join('');

  const fadeOut = (ctx, el, delay, ms) => { el.style.animation = 't14-out .3s ease-in ' + delay + 's both'; ctx.later(ms, () => el.remove()); };

  function chip(area, text) {
    area.insertAdjacentHTML('beforeend', '<div class="t14-chip">' + text + '<span>▾</span></div>');
    return area.lastElementChild;
  }

  // A field label flying from its row in the field list to an area box (cosmetic, only while animating; reads layout).
  function fly(ctx, label, from, to, delay) {
    const fx = FL.x + from.offsetLeft + 22, fy = FL.y + from.offsetTop + 2;
    const tx = FL.x + to.offsetLeft + 8, ty = FL.y + to.offsetTop + 28;
    const el = ctx.box({ x: fx, y: fy, cls: 't14-fly', html: label });
    el.style.setProperty('--dx', (tx - fx) + 'px');
    el.style.setProperty('--dy', (ty - fy) + 'px');
    el.style.animationDelay = delay + 's';
    ctx.later((delay + 0.75) * 1000, () => el.remove());
  }

  function writePivot(ctx, line, animate) {
    const p = ctx.pv, res = pivot(line);
    for (let r = 4; r <= 9; r++) ['A', 'B'].forEach(c => { p.set(c + r, null); p.cell(c + r).classList.remove('t14-t'); });
    res.rows.forEach(([cause, min], i) => { p.set('A' + (4 + i), cause); p.set('B' + (4 + i), min); });
    const tr = 4 + res.rows.length;
    p.set('A' + tr, 'Grand Total');
    p.set('B' + tr, res.total);
    p.mark('A' + tr + ':B' + tr, 't14-t');
    if (animate) p.flash('B4:B' + tr);
    return res;
  }

  function pick(ctx, line, animate) {
    if (ctx.rb) { ctx.rb.remove(); ctx.rb = null; }
    ctx.sl.classList.add('filtered');
    ctx.sl.querySelectorAll('.t14-sb').forEach(b => b.classList.toggle('on', b.dataset.v === line));
    const lf = ctx.fl.querySelector('[data-f="Line"]');
    if (!lf.querySelector('.t14-fun')) lf.insertAdjacentHTML('beforeend', ICON.funnel);
    if (ctx.cur) ctx.cur.remove();
    ctx.cur = ctx.ui.cursor({ x: SL.x + 92, y: SL_BTN_Y(['L1', 'L2', 'L3'].indexOf(line)) + 12, click: true, animate });
    writePivot(ctx, line, animate);
    ctx.pv.select('B4');
  }

  extendTrick('pivot-slicers', {
    stage(ctx) {
      const g = ctx.log = ctx.grid({ x: 10, y: 9, cols: 4, rows: 17, fontSize: 14, colWidths: [78, 54, 128, 82], title: 'Sheet1',
        data: [['Date', 'Line', 'Cause', 'Minutes']].concat(LOG) });
      g.rowH = 26;                                  // compact rows: header + 16 log rows fit the stage
      g.sheet.style.gridTemplateRows = g.headH + 'px repeat(' + g.rows + ', 26px)';
      ctx.caption('Downtime log: one row per stop, 5 days, 3 lines');
    },
    steps: [
      // 1 · the question
      (ctx) => {
        ctx.log.mark('D2:D17', 'hl-yellow');
        ctx.tip = ctx.ui.callout({ text: TOTAL + ' minutes lost Mon–Fri.<br>Which cause? Which line?', x: 413, y: 264, w: 300, arrow: 'left', tone: 'warn' });
        ctx.caption('Where is our downtime going?');
      },
      // 2 · click in the log › Insert › PivotTable → 'PivotTable from table or range' (Microsoft 365 title; Excel 2013–2021: 'Create PivotTable')
      (ctx, animate) => {
        if (ctx.tip) { ctx.tip.remove(); ctx.tip = null; }
        ctx.log.unmark('hl-yellow');
        ctx.log.select('C5');
        ctx.log.mark('A1:D17', 'ants');
        ctx.rb = ctx.ui.ribbon({ tab: 'Insert', path: ['PivotTable'], x: 420, y: 12 });
        ctx.dlg = ctx.ui.dialog({ title: 'PivotTable from table or range', body: CREATE_BODY, x: 420, y: 60, w: 480 });
        ctx.dlg.classList.add('t14-dlg');
        if (animate) ctx.dlg.classList.add('t14-late');
        ctx.caption('Click in the log › Insert › PivotTable: Excel finds the whole range.');
      },
      // 3 · OK → new worksheet with an empty pivot + the PivotTable Fields pane
      (ctx, animate) => {
        const d = ctx.dlg, log = ctx.log;
        ctx.dlg = null;
        if (ctx.rb) { ctx.rb.remove(); ctx.rb = null; }
        if (animate) { ctx.ui.press(d, 'OK', true); fadeOut(ctx, d, 0.45, 800); fadeOut(ctx, log.el, 0.45, 800); }
        else { d.remove(); log.el.remove(); }
        const p = ctx.pv = ctx.grid({ x: PV.x, y: PV.y, cols: 4, rows: 13, fontSize: PV.fs, colWidths: PV.w, header: false, title: 'Sheet2' });
        p.el.querySelector('.xg-tab').insertAdjacentHTML('beforeend', '<span class="t14-tab2">Sheet1</span>');
        p.select('A3');
        ctx.ph = p.overlay('A3:C13', 't14-ph');
        ctx.ph.innerHTML = '<div><b>PivotTable1</b><br>To build a report, choose fields<br>from the PivotTable Field List</div>';
        ctx.fl = ctx.box({ x: FL.x, y: FL.y, w: FL.w, h: FL.h, cls: 't14-fl', html: FIELDS_HTML });
        if (animate) [p.el, ctx.fl].forEach(e => { e.style.animation = 'popIn .3s ease-out .6s both'; });
        ctx.caption('OK: a new sheet with an empty pivot and the PivotTable Fields pane.');
      },
      // 4 · Cause → Rows, Minutes → Values, then Sort Largest to Smallest
      (ctx, animate) => {
        const p = ctx.pv, fl = ctx.fl;
        if (ctx.ph) { ctx.ph.remove(); ctx.ph = null; }
        const fCause = fl.querySelector('[data-f="Cause"]'), fMin = fl.querySelector('[data-f="Minutes"]');
        const aRows = fl.querySelector('[data-a="rows"]'), aVals = fl.querySelector('[data-a="values"]');
        fCause.classList.add('on');
        fMin.classList.add('on');
        const c1 = chip(aRows, 'Cause'), c2 = chip(aVals, 'Sum of Minutes');
        p.set('A3', 'Row Labels');
        p.cell('A3').insertAdjacentHTML('beforeend', '<i class="t14-dd">▾</i>');
        p.set('B3', 'Sum of Minutes');
        p.mark('A3:B3', 't14-h');
        const res = writePivot(ctx, null, false);
        if (animate) ctx.later(1650, () => p.select('B4')); else p.select('B4');   // right-click a value → Sort
        if (animate) {
          fly(ctx, 'Cause', fCause, aRows, 0);
          fly(ctx, 'Minutes', fMin, aVals, 0.5);
          c1.style.animation = 'popIn .2s ease-out .7s both';
          c2.style.animation = 'popIn .2s ease-out 1.2s both';
          // pivot appears in Excel's default A→Z order, then re-sorts largest to smallest
          const az = res.rows.map(r => r[0]).sort();
          res.rows.forEach(([cause], i) => ['A', 'B'].forEach(c => {
            const el = p.cell(c + (4 + i));
            el.style.setProperty('--from', ((az.indexOf(cause) - i) * PV.rowH) + 'px');
            el.style.animation = 't14-sort 2.4s ease-in-out 1.3s both';
          }));
          const tr = 4 + res.rows.length;
          ['A3', 'B3', 'A' + tr, 'B' + tr].forEach(ref => { p.cell(ref).style.animation = 'popIn .3s ease-out 1.3s both'; });
          const m = ctx.ui.menu({ items: ['Sort Smallest to Largest', 'Sort Largest to Smallest', 'More Sort Options…'], on: 'Sort Largest to Smallest', x: 372, y: PV_ROW(4) + 6, w: 196 });
          m.style.animation = 't14-menu 1.5s ease-out 1.7s both';
          ctx.later(3300, () => m.remove());
        }
        ctx.caption('Cause → Rows, Minutes → Values, then Sort Largest to Smallest.');
      },
      // 5 · PivotTable Analyze › Insert Slicer › ☑ Line
      (ctx, animate) => {
        ctx.rb = ctx.ui.ribbon({ tab: 'PivotTable Analyze', path: ['Insert Slicer'], x: 24, y: PV_ROW(12) + 4 });
        if (animate) {
          const d = ctx.ui.dialog({ title: 'Insert Slicers', x: 330, y: 70, w: 210,
            body: ['Date', 'Line', 'Cause', 'Minutes'].map(f => '<div class="dlg-row"><span class="check' + (f === 'Line' ? ' on' : '') + '">' + f + '</span></div>').join('') });
          d.style.animation = 'popIn .25s ease-out .6s both';
          ctx.later(1150, () => { ctx.ui.press(d, 'OK', true); fadeOut(ctx, d, 0.2, 600); });
        }
        ctx.sl = ctx.box({ x: SL.x, y: SL.y, w: SL.w, cls: 't14-sl' + (animate ? ' t14-in' : ''), html: SLICER_HTML });
        ctx.caption('PivotTable Analyze › Insert Slicer › Line: one button per line.');
      },
      // 6 · click L2
      (ctx, animate) => {
        pick(ctx, 'L2', animate);
        ctx.caption('Click L2: on Line 2 it is breakdowns, not changeovers.');
      },
      // 7 · click L3
      (ctx, animate) => {
        pick(ctx, 'L3', animate);
        ctx.caption('Click L3: Line 3 loses most of its time waiting for material.');
      },
      // 8 · refresh
      (ctx) => {
        ctx.ui.callout({ text: 'New data? <kbd>Alt</kbd>+<kbd>F5</kbd> refreshes this pivot; <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F5</kbd> refreshes all.',
          x: 24, y: PV_ROW(10), w: 500, tone: 'info' });
        ctx.caption('A pivot does not update by itself when the log grows: refresh it.');
      }
    ]
  });
})();
