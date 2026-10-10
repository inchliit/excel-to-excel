/* 17 · What-If Data Table (Act 4): total inventory cost for every order quantity at once (EOQ bracket). */
(function () {
  const P = '.t-slide[data-trick="data-table"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-data-table')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-data-table">' +
      P + '.t17-dlg{font-size:17px}' +
      P + '.t17-dlg .dlg-body{padding:14px 18px}' +
      P + '.t17-dlg .dlg-row{margin:9px 0}' +
      P + '.t17-dlg .t17-l{display:inline-block;width:160px}' +
      P + '.t17-dlg .dlg-field{font-size:17px;font-weight:700;min-width:150px;min-height:1.5em}' +
      P + '.t17-dlg.anim .t17-v{animation:t17-in .3s ease-out both;animation-delay:var(--d,0s)}' +
      P + '.t17-out{animation:t17-out .2s ease-in .25s forwards!important}' +
      P + '.t17-eoq text{font:700 13px "Segoe UI",system-ui,sans-serif}' +
      P + '.xc.anim .t17-eoq{animation:t17-fade .5s ease-out 1.5s both}' +
      P + '.t17-math{display:block;margin-top:6px;font:600 15px var(--mono);color:#3b4a57}' +
      '@keyframes t17-in{from{opacity:0;transform:translateY(6px)}}' +
      '@keyframes t17-out{to{opacity:0;transform:scale(.96)}}' +
      '@keyframes t17-fade{from{opacity:0}}' +
      '</style>');
  }

  const D = 12000, S = 1500, H = 30;                 // demand /yr, cost per order, holding per unit-yr
  const tc = q => D / q * S + q / 2 * H;             // = B1/B4*B2+B4/2*B3
  const QS = [400, 600, 800, 1000, 1200, 1400, 1600, 1800];
  const TC = QS.map(tc);                             // 51000 39000 34500 33000 33000 33857.1 35250 37000
  const EOQ = Math.sqrt(2 * D * S / H);              // 1095.4
  const TC_EOQ = tc(EOQ);                            // 32863.4
  const TABLE_F = '{=TABLE(,B4)}';
  const NS = 'http://www.w3.org/2000/svg';

  const at = (ctx, animate, ms, fn) => (animate ? ctx.later(ms, fn) : fn());

  function dismiss(ctx, el, animate) {
    if (!el || !el.isConnected) return;
    if (!animate) { el.remove(); return; }
    ctx.ui.press(el, null, true);
    el.classList.add('t17-out');
    ctx.later(450, () => el.remove());
  }

  function svgEl(parent, tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  // chart geometry (mirrors charts.line: L 50, R 70, T = title 32 + 6, B 30)
  const CH = { x: 514, y: 16, w: 394, h: 320, yMin: 28000, yMax: 52000 };
  const CO_W = CH.w - 33;                            // ui-callout width is content-box (+28 padding, +5 border)

  extendTrick('data-table', {
    stage(ctx) {
      ctx.g = ctx.grid({
        x: 16, y: 16, cols: 5, rows: 15, header: false, fontSize: 15, colWidths: [170, 78, 26, 80, 92],
        data: [
          ['Demand D (/yr)', D],
          ['Order cost S', S],
          ['Holding H (/unit-yr)', H],
          ['Order qty Q', 800],
          ['Total cost TC', { v: tc(800), f: '=B1/B4*B2+B4/2*B3' }]
        ],
        formats: { 'B1:B5': '#,##0', 'D8:D15': '#,##0', 'E7:E15': '#,##0' }
      });
      ctx.g.mark('A5:B5', 'bold');
      ctx.g.select('B5');
      ctx.caption('TC = ordering + holding cost. Q = 800 costs 34,500 a year.');
    },
    steps: [
      // 1 · list Q = 400…1800 in D8:D15, link E7 to the TC cell
      (ctx, animate) => {
        const g = ctx.g;
        g.set('D6', 'Q');
        g.set('E6', 'TC');
        g.mark('D6:E6', 'bold');
        g.fill('D8:D9', 'D8:D15', QS.map(q => [q]), animate);
        at(ctx, animate, 1300, () => {
          g.enter('E7', tc(800), '=B5');
          g.select('E7');
          g.refBox('B5', 0);
        });
        ctx.caption('Cheapest order quantity? Try them all.');
      },
      // 2 · select D7:E15 → Data › What-If Analysis › Data Table (column input B4)
      (ctx, animate) => {
        const g = ctx.g;
        g.clearRefs();
        g.select('D7:E15');
        g.refBox('B4', 1);
        ctx.rb = ctx.ui.ribbon({ tab: 'Data', path: ['What-If Analysis', 'Data Table…'], x: 514, y: 24 });
        ctx.dlg = ctx.ui.dialog({ title: 'Data Table', x: 514, y: 84, w: 394, buttons: ['OK', 'Cancel'],
          body: '<div class="dlg-row"><span class="t17-l">Row input cell:</span><span class="dlg-field t17-v" style="--d:1.3s"></span></div>' +
            '<div class="dlg-row"><span class="t17-l">Column input cell:</span><span class="dlg-field on t17-v" style="--d:1.6s;color:#C0504D">B4</span></div>' });
        ctx.dlg.classList.add('t17-dlg');
        ctx.tip = ctx.ui.callout({ x: 514, y: 318, w: CO_W, tone: 'info',
          text: 'Q values run <b>down a column</b> → use <b>Column input cell</b> = B4, the Q cell. Row input stays blank.' });
        if (animate) { ctx.dlg.style.animationDelay = '.95s'; ctx.tip.style.animationDelay = '2.1s'; }
        ctx.caption('Select D7:E15 → Data Table. Column input cell = B4, the Q cell.');
      },
      // 3 · OK → every TC at once; the block is one {=TABLE(,B4)}
      (ctx, animate) => {
        const g = ctx.g;
        [ctx.rb, ctx.tip].forEach(e => e && e.remove());
        g.clearRefs();
        dismiss(ctx, ctx.dlg, animate);
        at(ctx, animate, 400, () => {
          g.cascade('E8:E15', TC.map(v => [{ v, f: TABLE_F }]), animate);
          g.select('E8:E15');
        });
        ctx.caption('Every Q at once. The bar shows {=TABLE(,B4)}: one live block.');
      },
      // 4 · minimum rows glow, U-curve, EOQ callout
      (ctx, animate) => {
        const g = ctx.g;
        g.mark('D11:E12', 'hl-green');
        g.mark('D11:E12', 'bold');
        g.select('E11');
        const ch = ctx.charts.line({ x: CH.x, y: CH.y, w: CH.w, h: CH.h, title: 'Total cost vs order quantity Q',
          series: [{ values: TC, color: '#2f6fd6' }], labels: QS.map(q => q.toLocaleString('en-US')),
          highlight: [3, 4], yMin: CH.yMin, yMax: CH.yMax });
        ch.querySelectorAll('circle.hot').forEach(c => { c.style.fill = '#2b8a3e'; });
        // EOQ marker drawn into the chart's own SVG (same geometry as charts.line)
        const svg = ch.querySelector('svg');
        const L = 50, T = 38, W = CH.w - 50 - 70, Hh = CH.h - T - 30;
        const X = q => L + W * (q - QS[0]) / (QS[QS.length - 1] - QS[0]);
        const Y = v => T + Hh - Hh * (v - CH.yMin) / (CH.yMax - CH.yMin);
        const grp = svgEl(svg, 'g', { class: 't17-eoq' });
        const ex = X(EOQ), ey = Y(TC_EOQ);
        svgEl(grp, 'line', { x1: ex, x2: ex, y1: T + 26, y2: T + Hh, stroke: '#2b8a3e', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
        svgEl(grp, 'path', { d: 'M' + ex + ' ' + (ey - 7) + ' l7 7 l-7 7 l-7 -7 z', fill: '#2b8a3e', stroke: '#fff', 'stroke-width': 1.5 });
        svgEl(grp, 'text', { x: ex, y: T + 18, 'text-anchor': 'middle', style: 'fill:#2b8a3e' }, 'EOQ ≈ 1,095');
        const co = ctx.ui.callout({ x: CH.x, y: CH.y + CH.h + 18, w: CO_W, tone: 'good',
          text: 'EOQ = √(2DS/H) ≈ 1,095 — the table brackets it (TC ≈ 32,863).' +
            '<span class="t17-math">√(2 × 12,000 × 1,500 ÷ 30) = √1,200,000</span>' });
        if (animate) co.style.animationDelay = '1.8s';
        ctx.caption('Lowest cost at Q = 1,000–1,200. The formula agrees: EOQ ≈ 1,095.');
      }
    ]
  });
})();
