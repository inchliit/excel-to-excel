/* 20 · Monte Carlo (Act 4): =NORM.INV(RAND(),mean,SD) per station, F9, fill 1,000 rows, COUNTIF. Storyboard: plan appendix.
   No Math.random: the demo row uses two hand-picked RAND() rolls; the 1,000 jobs use the R3 low-discrepancy
   sequence (offset 0.55) pushed through an inverse normal (Acklam). Result: 835 of 1,000 totals ≤ 42 → 83.5%. */
(function () {
  const P = '.t-slide[data-trick="monte-carlo"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-monte-carlo')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-monte-carlo">' +
      P + '.mc-card{background:#fff;border-radius:8px;box-shadow:0 12px 34px rgba(0,0,0,.4)}' +
      P + '.mc-card.anim{animation:mc-fade .35s ease-out both}' +
      P + '.mc-card svg{display:block}' +
      P + '.mc-card text{font:12px "Segoe UI",system-ui,sans-serif;fill:#444}' +
      P + '.mc-card text.mc-ttl{font-size:14px;font-weight:700;fill:#222}' +
      P + '.mc-card text.mc-ttl tspan{font-family:var(--mono);fill:#0e6b39}' +
      P + '.mc-card text.mc-ax{font-weight:700;fill:#555}' +
      P + '.mc-card .ax{stroke:#bbb}' +
      P + '.mc-card .gridl{stroke:#eee}' +
      P + '.mc-curve{fill:none;stroke:#107C41;stroke-width:3}' +
      P + '.mc-guide{stroke:#e8590c;stroke-width:2;stroke-dasharray:6 4}' +
      P + '.mc-dot{fill:#e8590c;stroke:#fff;stroke-width:2}' +
      P + '.mc-card text.mc-lbl{font-size:14px;font-weight:700;fill:#c2410c}' +
      P + '.mc-map.anim .mc-a1{animation:mc-fade .3s ease-out .3s both}' +
      P + '.mc-map.anim .mc-h{transform-box:fill-box;transform-origin:left center;animation:mc-gx .5s ease-out .6s both}' +
      P + '.mc-map.anim .mc-c{animation:mc-fade .25s ease-out 1.05s both}' +
      P + '.mc-map.anim .mc-v{transform-box:fill-box;transform-origin:center top;animation:mc-gy .45s ease-in 1.15s both}' +
      P + '.mc-map.anim .mc-a2{animation:mc-fade .3s ease-out 1.6s both}' +
      P + '.xc text.mc-pct{font-size:14px;font-weight:800}' +
      P + '.xc text.mc-pct.on{fill:#0e6b39}' +
      P + '.xc text.mc-pct.late{fill:#6b7a88}' +
      P + '.mc-pct.anim{animation:mc-fade .4s ease-out 1.6s both}' +
      '@keyframes mc-fade{from{opacity:0}}' +
      '@keyframes mc-gx{from{transform:scaleX(0)}}' +
      '@keyframes mc-gy{from{transform:scaleY(0)}}' +
      '</style>');
  }

  // ---- maths (deterministic) -----------------------------------------------------------------------------
  function invNorm(p) {   // Acklam's rational approximation of the standard normal quantile (|rel err| < 1.2e-9)
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const tail = q => (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)));
    if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function cdf(z) {       // standard normal CDF (Abramowitz–Stegun 7.1.26), only used to draw the S-curve
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + e) / 2 : (1 - e) / 2;
  }
  const r2 = v => Math.round(v * 100) / 100;
  const ST = [[12, 1.5], [18, 2.5], [9, 1]];                       // station mean, SD (min)
  const FORM = ST.map(([m, s]) => '=NORM.INV(RAND(),' + m + ',' + s + ')');
  const stationTime = (k, p) => r2(ST[k][0] + ST[k][1] * invNorm(p));
  // demo row: roll 0 (after Enter) is on time, roll 1 (after F9) is late
  const ROLLS = [[0.73, 0.38, 0.64], [0.81, 0.93, 0.47]].map(ps => {
    const v = ps.map((p, k) => stationTime(k, p));
    return { p: ps, v, total: r2(v[0] + v[1] + v[2]) };      // 12.92+17.24+9.36 = 39.52 · 13.32+21.69+8.92 = 43.93
  });
  // 1,000 jobs: R3 sequence u_i = frac(0.55 + i·α), α = (1/φ3, 1/φ3², 1/φ3³), φ3 = plastic-ratio root of x⁴ = x + 1
  const PHI3 = 1.2207440846057596;
  const ALPHA = [1 / PHI3, 1 / (PHI3 * PHI3), 1 / (PHI3 * PHI3 * PHI3)];
  const JOBS = Array.from({ length: 1000 }, (_, i) => {
    const v = ALPHA.map((a, k) => stationTime(k, (0.55 + (i + 1) * a) % 1));
    return v.concat(r2(v[0] + v[1] + v[2]));
  });
  const TOTALS = JOBS.map(j => j[3]);
  const ON_TIME = TOTALS.filter(t => t <= 42).length / 1000;     // 0.835

  // ---- layout ----------------------------------------------------------------------------------------------
  const PANEL = { x: 358, y: 16, w: 546, h: 246 };                  // S-curve card, later the histogram
  const C = { L: 58, T: 54, W: PANEL.w - 58 - 22, H: PANEL.h - 54 - 40, x0: 7, x1: 17 };
  const CX = x => C.L + C.W * (x - C.x0) / (C.x1 - C.x0);
  const CY = p => C.T + C.H * (1 - p);
  const RIGHT = 566;                                                // free column right of the simulation grid
  const SVGNS = 'http://www.w3.org/2000/svg';

  function add(parent, tag, attrs, text) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  function cdfCard(ctx, animate) {
    const box = ctx.box({ x: PANEL.x, y: PANEL.y, w: PANEL.w, h: PANEL.h, cls: 'mc-card' + (animate ? ' anim' : '') });
    const svg = add(box, 'svg', { width: PANEL.w, height: PANEL.h, viewBox: '0 0 ' + PANEL.w + ' ' + PANEL.h });
    const ttl = add(svg, 'text', { x: 14, y: 22, class: 'mc-ttl' }, 'How ');
    add(ttl, 'tspan', {}, 'NORM.INV(RAND(),12,1.5)');
    ttl.appendChild(document.createTextNode(' turns a probability into a time'));
    for (let i = 0; i <= 4; i++) {
      const yy = CY(i / 4);
      add(svg, 'line', { x1: C.L, x2: C.L + C.W, y1: yy, y2: yy, class: i ? 'gridl' : 'ax' });
      add(svg, 'text', { x: C.L - 7, y: yy + 4, 'text-anchor': 'end' }, String(i / 4));
    }
    [8, 10, 12, 14, 16].forEach(x => add(svg, 'text', { x: CX(x), y: C.T + C.H + 16, 'text-anchor': 'middle' }, String(x)));
    add(svg, 'line', { x1: C.L, x2: C.L, y1: C.T, y2: C.T + C.H, class: 'ax' });
    add(svg, 'text', { x: C.L - 7, y: C.T - 10, 'text-anchor': 'middle', class: 'mc-ax' }, 'RAND()');
    add(svg, 'text', { x: C.L + C.W, y: C.T + C.H + 33, 'text-anchor': 'end', class: 'mc-ax' }, 'Station 1 time (min)');
    let d = '';
    for (let k = 0; k <= 100; k++) {
      const x = C.x0 + (C.x1 - C.x0) * k / 100;
      d += (k ? ' L' : 'M') + CX(x).toFixed(1) + ' ' + CY(cdf((x - 12) / 1.5)).toFixed(1);
    }
    add(svg, 'path', { d, class: 'mc-curve' });
    return box;
  }

  // the RAND() → time mapping: dot on the y-axis, across to the curve, down to the time axis
  function setMapping(card, p, v, animate) {
    const svg = card.querySelector('svg');
    const old = svg.querySelector('.mc-map');
    if (old) old.remove();
    const g = add(svg, 'g', { class: 'mc-map' + (animate ? ' anim' : '') });
    const xv = CX(v), yp = CY(p), yb = C.T + C.H;
    const a1 = add(g, 'g', { class: 'mc-a1' });
    add(a1, 'circle', { cx: C.L, cy: yp, r: 6, class: 'mc-dot' });
    add(a1, 'text', { x: C.L + 10, y: yp - 9, class: 'mc-lbl' }, 'RAND() = ' + p.toFixed(2));
    add(g, 'line', { x1: C.L, x2: xv, y1: yp, y2: yp, class: 'mc-guide mc-h' });
    add(g, 'circle', { cx: xv, cy: yp, r: 5, class: 'mc-dot mc-c' });
    add(g, 'line', { x1: xv, x2: xv, y1: yp, y2: yb, class: 'mc-guide mc-v' });
    const a2 = add(g, 'g', { class: 'mc-a2' });
    add(a2, 'circle', { cx: xv, cy: yb, r: 6, class: 'mc-dot' });
    add(a2, 'text', { x: xv + 10, y: yb - 10, class: 'mc-lbl' }, v.toFixed(2) + ' min');
  }

  // type a formula, then Enter (value appears); on replay the cell is committed straight away
  function typeEnter(ctx, g, ref, formula, value, animate) {
    if (!animate) { g.enter(ref, value, formula, false); g.select(ref); return; }
    g.type(ref, formula, true);
    const ms = Math.max(18, Math.min(55, 1600 / formula.length)) * formula.length + 250;
    ctx.later(ms, () => { g.enter(ref, value, formula, true); g.select(ref); });
  }

  function showRoll(ctx, k, animate) {
    const g = ctx.gSim, r = ROLLS[k], ok = r.total <= 42;
    r.v.forEach((v, i) => g.set('BCD'[i] + '2', { v, f: FORM[i] }));
    g.set('E2', { v: r.total, f: '=SUM(B2:D2)' });
    g.unmark('good', 'E2');
    g.unmark('bad', 'E2');
    g.mark('E2', ok ? 'good' : 'bad');
    g.select('B2:E2');
    if (animate) g.flash('B2:E2');
    if (ctx.verdict) ctx.verdict.remove();
    ctx.verdict = ctx.ui.tag('Job 1: ' + r.total.toFixed(2) + (ok ? ' min ≤ 42 → on time ✓' : ' min > 42 → late ✗'),
      { x: RIGHT, y: 366, tone: ok ? 'good' : 'warn', animate });
    if (ctx.cdf) setMapping(ctx.cdf, r.p[0], r.v[0], animate);
  }

  function histLabels(hist, animate) {
    // histogram geometry (charts.histogram: title → T = 38, L 40, R 12) — marker x for 42 on a 27–51 axis
    const svg = hist.querySelector('svg');
    const mx = 40 + (PANEL.w - 52) * (42 - 27) / (51 - 27);
    const on = (ON_TIME * 100).toFixed(1), late = (100 - ON_TIME * 100).toFixed(1);
    const cls = animate ? ' anim' : '';
    add(svg, 'text', { x: mx - 10, y: 72, 'text-anchor': 'end', class: 'mc-pct on' + cls }, on + '% on time');
    add(svg, 'text', { x: mx + 10, y: 72, class: 'mc-pct late' + cls }, late + '% late');
  }

  extendTrick('monte-carlo', {
    stage(ctx) {
      ctx.gIn = ctx.grid({ x: 16, y: 16, cols: 3, rows: 6, colWidths: [104, 100, 84], formulaBar: false,
        data: [['Station', 'Mean (min)', 'SD (min)'], ['Station 1', 12, 1.5], ['Station 2', 18, 2.5], ['Station 3', 9, 1],
          ['Total', { v: 39, f: '=SUM(B2:B4)' }, ''], ['Promise', 42, '']],
        formats: { 'B2:B6': '0', 'C2:C4': '0.0' } });
      ctx.gIn.mark('A5:B6', 'bold');
      ctx.gSim = ctx.grid({ x: 16, y: 276, cols: 7, rows: 6, colWidths: [46, 86, 86, 86, 80, 22, 92],
        data: [['Job', 'Station 1', 'Station 2', 'Station 3', 'Total', '', ''], [1], [2], [3], [4], [5]],
        formats: { 'B2:E6': '0.00', 'G2': '0.0%' } });
      ctx.caption('Three stations in a row; each time varies around its mean');
    },
    steps: [
      // 1 · hook: averages vs the promise
      (ctx) => {
        ctx.gIn.mark('B5', 'hl-blue');
        ctx.gIn.mark('B6', 'hl-yellow');
        ctx.gIn.mark('C2:C4', 'hl-red');
        ctx.hook = ctx.ui.callout({ x: 372, y: 62, w: 330, tone: 'warn', arrow: 'left',
          text: '39 min is only the average. Every station varies (SD), so some jobs run past 42.' });
        ctx.caption('Average says 39 min. Promise is 42. How often do we make it?');
      },
      // 2 · NORM.INV(RAND(),12,1.5): a random height on the S-curve becomes a time
      (ctx, animate) => {
        ctx.hook.remove();
        ['hl-blue', 'hl-yellow', 'hl-red'].forEach(c => ctx.gIn.unmark(c));
        ctx.gIn.mark('A2:C2', 'hl-green');
        ctx.cdf = cdfCard(ctx, animate);
        setMapping(ctx.cdf, ROLLS[0].p[0], ROLLS[0].v[0], animate);
        typeEnter(ctx, ctx.gSim, 'B2', FORM[0], ROLLS[0].v[0], animate);
        ctx.caption('RAND() picks a height 0–1; the S-curve turns it into a time');
      },
      // 3 · the whole row (3 stations + total), then F9 re-rolls every RAND()
      (ctx, animate) => {
        ctx.gIn.unmark('hl-green');
        ctx.f9 = ctx.ui.keys(['F9'], { x: RIGHT, y: 292 });
        if (animate) {
          showRoll(ctx, 0, false);
          ctx.f9.querySelector('kbd').style.animationDelay = '1.05s';
          ctx.later(1300, () => showRoll(ctx, 1, true));
        } else showRoll(ctx, 1, false);
        ctx.caption('F9 re-rolls every RAND(): each press is a new simulated job');
      },
      // 4 · fill 1,000 rows → histogram of the totals
      (ctx, animate) => {
        ctx.f9.remove();
        ctx.verdict.remove();
        ctx.verdict = null;
        ctx.cdf.remove();
        ctx.cdf = null;
        const g = ctx.gSim;
        g.unmark('good');
        g.unmark('bad');
        const rows = JOBS.slice(0, 5).map((j, i) => FORM.map((f, k) => ({ v: j[k], f })).concat({ v: j[3], f: '=SUM(B' + (i + 2) + ':D' + (i + 2) + ')' }));
        g.fill('B2:E2', 'B2:E1001', rows, animate);
        JOBS.slice(0, 5).forEach((j, i) => { if (j[3] > 42) g.mark('E' + (i + 2), 'bad'); });
        ctx.fillTag = ctx.ui.tag('B2:E2 filled down to row 1,001', { x: RIGHT, y: 300, tone: 'info' });
        ctx.hist = ctx.charts.histogram({ x: PANEL.x, y: PANEL.y, w: PANEL.w, h: PANEL.h, title: '1,000 simulated jobs: total time (min)',
          values: TOTALS, bins: 24, min: 27, max: 51, marker: 42, markerLabel: 'Promise 42', shadeBelow: true });
        ctx.caption('Fill 1,000 rows: the totals pile up into a bell around 39 min');
      },
      // 5 · COUNTIF → share of jobs on time
      (ctx, animate) => {
        ctx.fillTag.remove();
        const g = ctx.gSim;
        g.set('G1', 'On time');
        g.refBox('E2:E1001', 0);
        typeEnter(ctx, g, 'G2', '=COUNTIF(E2:E1001,"<=42")/1000', ON_TIME, animate);
        histLabels(ctx.hist, animate);
        ctx.ui.callout({ x: RIGHT, y: 356, w: 338 - 33, tone: 'good',   // callout box = w + 33 px padding/border
          text: 'Cut station-2 variability and on-time jumps: SD 2.5 → 1.5 gives ≈ 90%.' });
        ctx.caption('≈ 83.5% on time. Theory: σ = √9.5 ≈ 3.08, z ≈ 0.97 → 83.5%');
      }
    ],
    tryit: {
      sheet: [['Station', 'Mean (min)', 'SD (min)', 'Simulated (min)'], ['Station 1', 12, 1.5], ['Station 2', 18, 2.5], ['Station 3', 9, 1]],
      task: 'Simulate one Station-2 time (mean 18, SD 2.5 min) → D3',
      target: 'D3',
      mode: 'random',
      random: { trials: 500, mean: 18, sd: 2.5 },
      mustUse: ['NORM.INV', 'RAND'],
      hint: 'NORM.INV(probability, mean, SD): use RAND() as the probability.',
      answer: '=NORM.INV(RAND(),18,2.5)'
    }
  });
})();
