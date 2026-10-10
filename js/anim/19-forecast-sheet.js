/* 19 · Forecast Sheet (Act 4): Data › Forecast › Forecast Sheet. Storyboard: plan appendix.
   History = fixed formula (no randomness): 1000 + 12·t + 180·sin(2πt/12) + 20·sin(2.4t), t = 1 (Oct 2024) … 24 (Sep 2026).
   Forecast and band (Oct 2026 – Mar 2027) are illustrative: the smooth trend + season continued, band ±40·√h. */
(function () {
  const P = '.t-slide[data-trick="forecast-sheet"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-forecast-sheet')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-forecast-sheet">' +
      P + '.fs-zone rect{fill:rgba(255,209,102,.2);stroke:#e8590c;stroke-width:1.5;stroke-dasharray:6 4}' +
      P + '.xc text.fs-zt{font-weight:700;fill:#c2410c}' +
      P + '.xc text.fs-q{font-size:46px;font-weight:800;fill:#e8590c}' +
      P + '.xc text.fs-end{font-size:13px;font-weight:700;fill:#c2410c}' +
      P + '.fs-pop{animation:fs-fade .45s ease-out .2s both}' +
      P + '.fs-in{animation:fs-fade .9s ease-out .55s both}' +
      P + '.ui-dialog.fs-out{animation:fs-out .3s ease-in .45s forwards}' +
      P + '.fs-dlg .dlg-body{padding:10px 14px 8px}' +
      P + '.fs-prev{position:relative;border:1px solid #d6d6d6;border-radius:4px;background:#fff;margin-bottom:6px}' +
      P + '.fs-prev svg{display:block}' +
      P + '.fs-prev text{font:10.5px "Segoe UI",system-ui,sans-serif;fill:#666}' +
      P + '.fs-leg{display:flex;justify-content:center;gap:14px;font-size:11px;color:#555;padding:0 0 5px}' +
      P + '.fs-leg i{display:inline-block;width:16px;height:0;border-top:2px solid;vertical-align:middle;margin-right:5px}' +
      P + '.fs-types{position:absolute;right:8px;top:6px;display:flex;gap:4px}' +
      P + '.fs-types b{display:flex;width:26px;height:22px;align-items:center;justify-content:center;border:1px solid #c8c8c8;border-radius:3px;background:#fff}' +
      P + '.fs-types b.on{border-color:#107C41;background:#e6f4ec}' +
      P + '.fs-dd{color:#666;margin-left:8px;font-size:11px}' +
      P + '.fs-opt{font-weight:600;color:#0e6b39;margin:4px 0 2px}' +
      P + '.fs-cols{display:grid;grid-template-columns:1fr 1.22fr;gap:0 22px;font-size:14px}' +
      P + '.fs-cols .dlg-row{margin:1px 0;min-height:26px}' +
      P + '.fs-r .dlg-row{justify-content:space-between}' +
      P + '.fs-cols .dlg-field{min-width:0;font-size:13px;padding:2px 7px}' +
      P + '.fs-cl{font-size:16px}' +
      P + '.fs-fx{display:flex;align-items:center;background:#fff;border:1px solid #c8c8c8;border-radius:4px;margin:7px 0;font-weight:400}' +
      P + '.fs-fx i{font:italic 700 15px Georgia,serif;color:#777;padding:5px 10px;border-right:1px solid #ddd}' +
      P + '.fs-fx code{font:600 16px var(--mono);padding:5px 10px;color:#222;white-space:nowrap}' +
      P + '.fs-fx em{margin-left:auto;padding:0 10px;font:700 13px var(--font);color:#c2410c;font-style:normal}' +
      P + '.fs-cl code.fs-c{font:600 14px var(--mono)}' +
      P + '.fs-note{font-size:14px;font-weight:600;color:#555;margin-top:3px}' +
      '@keyframes fs-fade{from{opacity:0}}' +
      '@keyframes fs-out{to{opacity:0;transform:scale(.97)}}' +
      '</style>');
  }

  // ---- data -------------------------------------------------------------------------------------------
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = t => { const m = 8 + t; return MON[m % 12] + ' ' + (2024 + Math.floor(m / 12)); }; // t=1 → Oct 2024
  const model = t => 1000 + 12 * t + 180 * Math.sin(2 * Math.PI * t / 12);
  const HIST = Array.from({ length: 24 }, (_, i) => Math.round(model(i + 1) + 20 * Math.sin(2.4 * (i + 1))));
  const LAST = HIST[23];                                                           // Sep 2026
  const FC = Array.from({ length: 6 }, (_, i) => Math.round(model(25 + i)));     // Oct 2026 … Mar 2027
  const HW = Array.from({ length: 6 }, (_, i) => Math.round(40 * Math.sqrt(i + 1)));
  const LO = FC.map((v, i) => v - HW[i]);
  const HI = FC.map((v, i) => v + HW[i]);

  // ---- geometry (mirrors charts.line: title → T = 38, L 50, R 70, B 30) --------------------------------------
  const N = 30, Y0 = 800, Y1 = 1600;
  const CH = { x: 258, y: 16, w: 646, h: 318 };
  const GL = 50, GT = 38, GW = CH.w - 120, GH = CH.h - GT - 30;
  const X = i => GL + GW * i / (N - 1);
  const Y = v => GT + GH - GH * (v - Y0) / (Y1 - Y0);
  const AXIS = Array.from({ length: N }, (_, i) => ([3, 9, 15, 21, 27].includes(i) ? monthLabel(i + 1) : ''));
  const SVGNS = 'http://www.w3.org/2000/svg';

  function add(parent, tag, attrs, text) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  function drawChart(ctx, withForecast, animate) {
    const series = [{ values: HIST, color: '#2f6fd6', markers: false }];
    // zero-width band at the last slot: only stretches the x-axis to 30 months so the future has room
    let band = { start: N - 1, lo: [1200], hi: [1200] };
    if (withForecast) {
      series.push({ values: [LAST].concat(FC), start: 23, color: '#e8590c', markers: false });
      band = { start: 23, lo: [LAST].concat(LO), hi: [LAST].concat(HI) };
    }
    const box = ctx.charts.line({ x: CH.x, y: CH.y, w: CH.w, h: CH.h, title: 'Monthly demand (units)', series, band,
      labels: AXIS, yMin: Y0, yMax: Y1, animate: false });
    if (withForecast) {
      const svg = box.querySelector('svg');
      const fc = svg.querySelectorAll('path.ln')[1];
      fc.removeAttribute('pathLength');
      fc.style.strokeDasharray = '9 6';
      fc.style.strokeWidth = '3';
      const ends = [['Upper', HI[5]], ['Forecast', FC[5]], ['Lower', LO[5]]]
        .map(([t, v]) => add(svg, 'text', { x: GL + GW + 6, y: Y(v) + 4, class: 'fs-end' }, t));
      if (animate) [svg.querySelector('.band'), fc].concat(ends).forEach(e => e.classList.add('fs-in'));
    }
    return box;
  }

  function addZone(chart, animate) {
    const svg = chart.querySelector('svg');
    const x0 = X(23) + 6, x1 = X(N - 1) + 8, cx = (x0 + x1) / 2;
    const g = add(svg, 'g', { class: 'fs-zone' + (animate ? ' fs-pop' : '') });
    add(g, 'rect', { x: x0, y: GT, width: x1 - x0, height: GH, rx: 6 });
    add(g, 'text', { x: cx, y: GT + 18, 'text-anchor': 'middle', class: 'fs-zt' }, 'next 6 months');
    add(g, 'text', { x: cx, y: GT + GH / 2 + 16, 'text-anchor': 'middle', class: 'fs-q' }, '?');
  }

  // Excel's preview chart inside the dialog: history (blue), forecast (orange), thin confidence bounds
  function previewHTML() {
    const w = 590, h = 118, L = 40, R = 74, T = 10, B = 12, W = w - L - R, H = h - T - B;
    const px = i => (L + W * i / (N - 1)).toFixed(1);
    const py = v => (T + H - H * (v - Y0) / (Y1 - Y0)).toFixed(1);
    const poly = (vals, start, color, sw) => '<polyline fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linejoin="round" points="' +
      vals.map((v, i) => px(start + i) + ',' + py(v)).join(' ') + '"/>';
    let s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
    for (let k = 0; k <= 4; k++) {
      const v = Y0 + (Y1 - Y0) * k / 4;
      s += '<line x1="' + L + '" x2="' + (L + W) + '" y1="' + py(v) + '" y2="' + py(v) + '" stroke="' + (k ? '#eee' : '#bbb') + '"/>' +
        '<text x="' + (L - 5) + '" y="' + (+py(v) + 3.5) + '" text-anchor="end">' + v.toLocaleString('en-US') + '</text>';
    }
    s += poly(HIST, 0, '#4472C4', 2) + poly([LAST].concat(HI), 23, '#ED7D31', 1) + poly([LAST].concat(LO), 23, '#ED7D31', 1) +
      poly([LAST].concat(FC), 23, '#ED7D31', 2) + '</svg>';
    const icon = col => '<svg width="18" height="14" viewBox="0 0 18 14">' + (col
      ? '<rect x="1" y="7" width="4" height="7" fill="#777"/><rect x="7" y="3" width="4" height="11" fill="#777"/><rect x="13" y="5" width="4" height="9" fill="#777"/>'
      : '<polyline points="1,12 6,6 10,9 17,2" fill="none" stroke="#107C41" stroke-width="2"/>') + '</svg>';
    const leg = [['#4472C4', 'Demand'], ['#ED7D31', 'Forecast'], ['#ED7D31', 'Lower Confidence Bound'], ['#ED7D31', 'Upper Confidence Bound']]
      .map(([c, t]) => '<span><i style="border-color:' + c + '"></i>' + t + '</span>').join('');
    return '<div class="fs-prev">' + s + '<div class="fs-leg">' + leg + '</div><div class="fs-types"><b class="on">' + icon(false) + '</b><b>' + icon(true) + '</b></div></div>';
  }

  function dialogBody() {
    const dd = '<span class="fs-dd">▾</span>';
    return previewHTML() +
      '<div class="dlg-row">Forecast End <span class="dlg-field on">3/1/2027' + dd + '</span></div>' +
      '<div class="fs-opt">▾ Options</div>' +
      '<div class="fs-cols"><div>' +
        '<div class="dlg-row">Forecast Start <span class="dlg-field">9/1/2026' + dd + '</span></div>' +
        '<div class="dlg-row"><span class="check on">Confidence Interval</span><span class="dlg-field hl">95%</span></div>' +
        '<div class="dlg-row">Seasonality <span class="radio on hl">Detect Automatically</span></div>' +
        '<div class="dlg-row"><span class="radio">Set Manually</span><span class="dlg-field" style="width:46px">&nbsp;</span></div>' +
        '<div class="dlg-row"><span class="check">Include forecast statistics</span></div>' +
      '</div><div class="fs-r">' +
        '<div class="dlg-row">Timeline Range <span class="dlg-field">$A$2:$A$25</span></div>' +
        '<div class="dlg-row">Values Range <span class="dlg-field">$B$2:$B$25</span></div>' +
        '<div class="dlg-row">Fill Missing Points Using <span class="dlg-field">Interpolation' + dd + '</span></div>' +
        '<div class="dlg-row">Aggregate Duplicates Using <span class="dlg-field">Average' + dd + '</span></div>' +
      '</div></div>';
  }

  extendTrick('forecast-sheet', {
    stage(ctx) {
      const data = [['Month', 'Demand']].concat(HIST.map((v, i) => [monthLabel(i + 1), v]));
      ctx.g = ctx.grid({ x: 16, y: 16, cols: 2, rows: 15, colWidths: [104, 84], data, formats: { 'B2:B25': '#,##0' } });
      for (let r = 2; r <= 15; r++) ctx.g.cell('A' + r).classList.add('num');   // real dates sit right-aligned
      ctx.chart = drawChart(ctx, false, false);
      ctx.caption('24 months of demand: rising trend + a yearly peak');
    },
    steps: [
      // 1 · hook + select the data
      (ctx, animate) => {
        ctx.g.select('A1:B25');
        ctx.tip = ctx.ui.tag('Select A1:B25 (dates + demand). Tip: one cell inside is enough', { x: CH.x, y: 352, tone: 'info' });
        addZone(ctx.chart, animate);
        ctx.caption('Plan production for the next 6 months.');
      },
      // 2 · ribbon path → Create Forecast Worksheet preview + options
      (ctx, animate) => {
        ctx.tip.remove();
        ctx.rib = ctx.ui.ribbon({ tab: 'Data', path: ['Forecast', 'Forecast Sheet'], x: 272, y: 10 });
        ctx.dlg = ctx.ui.dialog({ title: 'Create Forecast Worksheet', x: 272, y: 54, w: 620, body: dialogBody(),
          buttons: ['Create', 'Cancel'], primary: 'Create' });
        ctx.dlg.classList.add('fs-dlg');
        if (animate) ctx.dlg.style.animationDelay = '.95s';     // pops up after the ribbon chips
        ctx.caption('Forecast End = Mar 2027 · 95% interval · season found for you');
      },
      // 3 · Create → forecast line + shaded confidence band
      (ctx, animate) => {
        ctx.rib.remove();
        const dlg = ctx.dlg;
        if (animate) { ctx.ui.press(dlg, 'Create', true); dlg.classList.add('fs-out'); ctx.later(800, () => dlg.remove()); }
        else dlg.remove();
        ctx.chart.remove();
        ctx.chart = drawChart(ctx, true, animate);
        ctx.ui.tag('New sheet: Forecast + Lower / Upper Confidence Bound columns + chart', { x: CH.x, y: 352, tone: 'good' });
        ctx.caption('Create: forecast + shaded 95% confidence band, next 6 months');
      },
      // 4 · the formulas Excel writes
      (ctx) => {
        const fx = window.XGrid.colorize('=FORECAST.ETS(A26,$B$2:$B$25,$A$2:$A$25,1,1)');
        ctx.ui.callout({ x: CH.x, y: 394, w: CH.w - 33, tone: 'info',   // callout box = w + 33 px padding/border
          text: '<div class="fs-cl">Excel writes the formulas (new sheet, row 26 = Oct 2026):' +
            '<div class="fs-fx"><i>fx</i><code>' + fx + '</code><em>Forecast</em></div>' +
            'Upper / Lower = forecast ± <code class="fs-c">FORECAST.ETS.CONFINT(A26,…,0.95,1,1)</code>' +
            '<div class="fs-note">The two 1s: detect seasonality automatically · fill missing points</div></div>' });
        ctx.caption('Plan capacity on the upper bound, materials on the forecast.');
      }
    ]
  });
})();
