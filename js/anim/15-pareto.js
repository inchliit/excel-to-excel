/* 15 · Built-in Pareto chart (Act 3): 80/20 in two clicks. Storyboard: plan appendix.
   Stage: defect counts by cause in A1:B8, deliberately NOT sorted (the chart does the sorting). */
(function () {
  const DATA = [['Scratch', 96], ['Dent', 27], ['Misalignment', 142], ['Burr', 51], ['Crack', 14], ['Porosity', 9], ['Other', 6]];
  const TOTAL = DATA.reduce((s, d) => s + d[1], 0);                      // 345
  const SORTED = DATA.slice().sort((a, b) => b[1] - a[1]);
  const CUM = (() => { let run = 0; return SORTED.map(d => (run += d[1]) / TOTAL); })();   // .412 .690 .838 …
  const TOP = CUM.findIndex(c => c >= 0.8) + 1;                          // 3 causes reach 80%
  const pct = c => (c * 100).toFixed(1) + '%';
  const CH = { x: 290, y: 58, w: 620, h: 420 };

  const P = '.t-slide[data-trick="pareto"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-pareto')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-pareto">' +
      P + '.xc.anim.t15-late{animation:popIn .3s ease-out 1.2s both}' +
      P + '.xc.anim.t15-late .bar{animation-delay:calc(1.35s + var(--i) * 80ms)}' +
      P + '.xc.anim.t15-late .ln{animation-delay:1.9s}' +
      P + '.xc.anim.t15-late .pt{animation-delay:2.7s}' +
      P + '.xc .bar.t15-grey{animation:t15-grey .7s ease-out .2s both}' +
      P + '.xc .t15-in{animation:fadeIn .4s ease-out both}' +
      P + '.xc text.t15-cum{font-size:15px!important;font-weight:800;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}' +
      P + '.ui-menu.t15-flash{animation:t15-menu 1.2s ease-out .45s both}' +
      P + '.t15-big{font-size:20px;line-height:1.3}' +
      P + '.t15-big b{color:#0e6b39}' +
      '@keyframes t15-grey{from{fill:#21A366}}' +
      '@keyframes t15-menu{0%{opacity:0;transform:translateY(-6px)}20%,82%{opacity:1;transform:none}100%{opacity:0}}' +
      '</style>');
  }

  // Pareto via the shared chart (it sorts and accumulates itself); larger category labels for the room.
  function drawPareto(ctx, line80, animate) {
    if (ctx.chart) ctx.chart.remove();
    const c = ctx.chart = ctx.charts.pareto({ x: CH.x, y: CH.y, w: CH.w, h: CH.h, title: 'Defects by cause',
      data: DATA.map(d => ({ label: d[0], value: d[1] })), line80, animate });
    c.querySelectorAll('text').forEach(t => { if (!t.classList.contains('lbl') && /11px/.test(t.getAttribute('style') || '')) t.style.fontSize = '13px'; });
    return c;
  }
  const cumLabels = c => Array.from(c.querySelectorAll('text.lbl')).filter(t => /%$/.test(t.textContent) && t.textContent !== '80%');

  extendTrick('pareto', {
    stage(ctx) {
      ctx.g = ctx.grid({ x: 10, y: 10, cols: 2, rows: 8, fontSize: 16, colWidths: [140, 80],
        data: [['Cause', 'Count']].concat(DATA) });
      ctx.caption('Defect log for the month: count by cause');
    },
    steps: [
      // 1 · the question
      (ctx) => {
        ctx.tag = ctx.ui.tag('7 causes · ' + TOTAL + ' defects', { x: 12, y: 340, tone: 'info' });
        ctx.caption('Which few causes make most of the defects?');
      },
      // 2 · select A1:B8 › Insert › Insert Statistic Chart › Pareto → chart (as Excel draws it: no labels, one colour)
      (ctx, animate) => {
        ctx.g.select('A1:B8');
        ctx.rb = ctx.ui.ribbon({ tab: 'Insert', path: ['Insert Statistic Chart', 'Pareto'], x: CH.x, y: 12 });
        if (animate) {
          const m = ctx.ui.menu({ items: ['Histogram', 'Pareto', 'Box and Whisker'], on: 'Pareto', x: CH.x + 220, y: 50, w: 200 });
          m.classList.add('t15-flash');
          ctx.later(1700, () => m.remove());
        }
        const c = drawPareto(ctx, false, animate);
        c.querySelectorAll('rect.bar').forEach(b => b.classList.remove('alt'));
        cumLabels(c).forEach(t => { t.style.display = 'none'; });
        if (animate) c.classList.add('t15-late');
        ctx.caption('Excel sorts the bars largest first and adds the cumulative % line.');
      },
      // 3 · 80% guide; the top 3 causes highlighted with their cumulative %
      (ctx, animate) => {
        if (ctx.rb) { ctx.rb.remove(); ctx.rb = null; }
        const c = drawPareto(ctx, true, false);
        // Excel's Pareto chart has no 80% line: label ours so nobody hunts for it in Excel
        const g80 = Array.from(c.querySelectorAll('text.lbl')).find(t => t.textContent === '80%');
        if (g80) g80.textContent = '80% guide (we added it)';
        const bars = c.querySelectorAll('rect.bar');
        bars.forEach((b, i) => { b.classList.toggle('alt', i >= TOP); if (animate && i >= TOP) b.classList.add('t15-grey'); });
        cumLabels(c).forEach((t, i) => {
          if (i >= TOP) { t.style.display = 'none'; return; }
          t.classList.add('t15-cum');
          if (animate) { t.classList.add('t15-in'); t.style.animationDelay = (0.5 + 0.35 * i) + 's'; }
        });
        if (animate) {
          const hl = c.querySelector('line.hline'), lab = g80;
          [hl, lab].forEach(e => { if (e) e.classList.add('t15-in'); });
        }
        SORTED.slice(0, TOP).forEach(([cause]) => {
          const r = DATA.findIndex(d => d[0] === cause) + 2;
          ctx.g.mark('A' + r + ':B' + r, 'hl-green');
        });
        ctx.caption('Cumulative: ' + CUM.slice(0, TOP).map(pct).join(' → ') + '. Top ' + TOP + ' pass our 80% guide.');
      },
      // 4 · the decision
      (ctx) => {
        ctx.ui.callout({ text: '<div class="t15-big"><b>' + TOP + ' of ' + DATA.length + ' causes</b> = ' + Math.round(CUM[TOP - 1] * 100) +
          '% of defects → fix these first.</div>', x: 556, y: 196, w: 268, tone: 'good' });
        ctx.caption(SORTED.slice(0, TOP).map(d => d[0]).join(', ').replace(/, (?=[^,]*$)/, ' and ') + ': the vital few. Fix these first.');
      },
      // 5 · what Excel did for you
      (ctx) => {
        if (ctx.tag) { ctx.tag.remove(); ctx.tag = null; }
        ctx.ui.callout({ text: 'Excel sorts and computes cumulative % for you.<br><br><b>Older Excel:</b> sort + cum% column + combo chart.',
          x: 10, y: 340, w: 240, tone: 'info' });
        ctx.caption('No helper columns: Excel 2016+ does the sorting and the math.');
      }
    ]
  });
})();
