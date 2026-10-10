/* 12 · Conditional formatting with a formula (Act 3): SPC alarms that light themselves. Storyboard: plan appendix.
   Stage: 20 sample means in A1:B21, control limits in F2:F3, an X-bar control chart floating over the sheet. */
(function () {
  // Sample means (mm). With UCL 25.06 / LCL 24.94 only #7 (25.080) and #15 (24.920) are out.
  // #18 (25.055) goes out once the UCL is tightened to 25.05. Every other mean sits inside 24.96–25.04.
  const MEANS = [25.012, 24.987, 25.021, 25.004, 24.978, 25.033, 25.080, 25.009, 24.991, 25.018,
    24.966, 25.027, 25.002, 24.983, 24.920, 24.995, 25.024, 25.055, 25.011, 24.989];
  const UCL = 25.06, LCL = 24.94, UCL2 = 25.05, CL = 25.0;
  const RULE = '=OR($B2>$F$2,$B2<$F$3)';
  // The rule evaluated row by row in plain JS (independent of any formula engine).
  const flags = (ucl, lcl) => MEANS.map(v => v > ucl || v < lcl);
  const outIdx = (ucl, lcl) => flags(ucl, lcl).reduce((a, f, i) => (f ? a.concat(i) : a), []);

  const GX = 21, GY = 12, ROW_H = 22;                       // 22 px = Excel's own default row height
  const COLW = [66, 104, 28, 28, 60, 72, 80, 80, 80, 80, 80, 80];
  const CH = { x: 238, y: 166, w: 652, h: 358, lo: 24.9, hi: 25.1 };
  const DLG = { x: 432, y: 52, w: 476 };
  const CF_MENU = ['Highlight Cells Rules', 'Top/Bottom Rules', 'Data Bars', 'Color Scales', 'Icon Sets', 'New Rule…', 'Clear Rules', 'Manage Rules…'];
  const HAS_SUB = ['Highlight Cells Rules', 'Top/Bottom Rules', 'Data Bars', 'Color Scales', 'Icon Sets', 'Clear Rules'];
  const RULE_TYPES = ['Format all cells based on their values', 'Format only cells that contain',
    'Format only top or bottom ranked values', 'Format only values that are above or below average',
    'Format only unique or duplicate values', 'Use a formula to determine which cells to format'];

  const P = '.t-slide[data-trick="cf-formula"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-cf-formula')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-cf-formula">' +
      P + '.t12-dlg .dlg-body{padding:10px 14px}' +
      P + '.t12-lbl{font-weight:600;margin:0 0 3px}' +
      P + '.t12-list{border:1px solid #a9a9a9;padding:2px;margin:0 0 8px;background:#fff}' +
      P + '.t12-list div{padding:0 8px;line-height:1.55;white-space:nowrap}' +
      P + '.t12-list div::before{content:"\\25B8\\00a0\\00a0";color:#666}' +
      P + '.t12-list div.on{background:#cce4f7;box-shadow:inset 0 0 0 1px #5b9bd5;font-weight:600}' +
      P + '.t12-desc{border:1px solid #d6d6d6;background:#fafafa;padding:8px 10px}' +
      P + '.ui-dialog .t12-field{display:flex;align-items:center;min-height:34px;margin:4px 0 10px;font-size:17px;font-weight:600;white-space:pre}' +
      P + '.t12-field.typing::after{content:"";width:1px;height:1.1em;background:#111;margin-left:1px;animation:caret 1s steps(1) infinite}' +
      P + '.t12-prev{display:flex;align-items:center;gap:10px}' +
      P + '.t12-sw{flex:1;border:1px solid #c8c8c8;background:#fff;color:#666;text-align:center;padding:4px 0}' +
      P + '.t12-sw.red{background:#ffc7ce;color:#9c0006}' +
      P + '.ui-dialog .t12-fmt{min-width:0}' +
      P + '.t12-leg div{display:flex;gap:10px;align-items:baseline;margin:3px 0}' +
      P + '.t12-code{font:700 16px var(--mono);background:rgba(0,0,0,.06);border-radius:4px;padding:0 5px;white-space:nowrap}' +
      P + '.ui-menu .t12-sub::after{content:"\\203A";float:right;color:#777;margin-left:18px}' +
      P + '.ui-menu .t12-sep{border-top:1px solid #ddd;margin-top:3px}' +
      P + '.ui-menu.t12-flash{animation:t12-menu 1.75s ease-out both}' +
      P + '.ui-dialog.anim.t12-late{animation:popIn .3s ease-out 1.6s both}' +
      P + '.xc circle.pt{transform-box:fill-box;transform-origin:center}' +
      '@keyframes t12-menu{0%,22%{opacity:0;transform:translateY(-6px)}30%,86%{opacity:1;transform:none}100%{opacity:0}}' +
      '@keyframes t12-out{to{opacity:0;transform:scale(.96)}}' +
      '@keyframes t12-lit{from{background:#fff;color:#1f1f1f}}' +
      '@keyframes t12-hot{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.8)}100%{transform:none}}' +
      '@keyframes t12-slide{from{transform:translateY(var(--dy))}}' +
      '</style>');
  }

  function sheetRows() {
    const rows = [['Sample', 'Mean (mm)', null, null, 'Limit', 'Value']];
    MEANS.forEach((m, i) => rows.push([i + 1, m]));
    rows[1].push(null, null, 'UCL', UCL);
    rows[2].push(null, null, 'LCL', LCL);
    return rows;
  }

  const NFR_BODY =
    '<div class="t12-lbl">Select a Rule Type:</div>' +
    '<div class="t12-list">' + RULE_TYPES.map((t, i) => '<div' + (i === 5 ? ' class="on"' : '') + '>' + t + '</div>').join('') + '</div>' +
    '<div class="t12-lbl">Edit the Rule Description:</div>' +
    '<div class="t12-desc"><div>Format values where this formula is true:</div>' +
    '<div class="dlg-field on t12-field"></div>' +
    '<div class="t12-prev"><span>Preview:</span><span class="t12-sw">No Format Set</span>' +
    '<span class="dlg-btn t12-fmt" data-btn="Format…">Format…</span></div></div>';

  const LEGEND = '<div class="t12-leg">' +
    '<div><span class="t12-code" style="color:#4472C4">$B</span>always the Mean column</div>' +
    '<div><span class="t12-code" style="color:#4472C4">2</span>no $, so it moves down the rows</div>' +
    '<div><span class="t12-code" style="color:#C0504D">$F$2</span><span class="t12-code" style="color:#9BBB59">$F$3</span>fixed limits</div></div>';

  function drawChart(ctx, ucl, hot) {
    if (ctx.chart) ctx.chart.remove();
    const c = ctx.chart = ctx.charts.line({
      x: CH.x, y: CH.y, w: CH.w, h: CH.h, title: 'Control chart: sample mean diameter (mm)',
      series: [{ values: MEANS, color: '#2f6fd6' }],
      hlines: [{ y: ucl, label: 'UCL ' + ucl.toFixed(2) }, { y: CL, label: 'CL', color: '#2b8a3e', dashed: false }, { y: LCL, label: 'LCL ' + LCL.toFixed(2) }],
      highlight: hot, labels: MEANS.map((_, i) => String(i + 1)), yMin: CH.lo, yMax: CH.hi, animate: false
    });
    const cl = c.querySelectorAll('line.hline')[1];
    if (cl) cl.style.strokeDasharray = 'none';      // centre line solid (the CSS default dashes every hline)
    return c;
  }

  function popPoints(ctx, idx, delay) {
    const pts = ctx.chart.querySelectorAll('circle.pt');
    idx.forEach(i => { if (pts[i]) pts[i].style.animation = 't12-hot .6s ease-out ' + delay + 's both'; });
  }

  // CF result on one sample row (A:B); with a delay the red fill fades in when the step animates.
  function light(ctx, i, delay) {
    const r = i + 2;
    ctx.g.mark('A' + r + ':B' + r, 'hl-red');
    if (delay != null) ['A', 'B'].forEach(c => { ctx.g.cell(c + r).style.animation = 't12-lit .5s ease-out ' + delay + 's both'; });
  }

  function typeInto(ctx, el, text, animate) {
    const done = () => { el.innerHTML = window.XGrid.colorize(text); el.classList.remove('typing'); };
    if (!animate) { done(); return; }
    el.textContent = '';
    el.classList.add('typing');
    const step = Math.max(18, Math.min(55, 1600 / text.length));
    for (let i = 1; i <= text.length; i++) ctx.later(i * step, () => { if (i === text.length) done(); else el.textContent = text.slice(0, i); });
  }

  extendTrick('cf-formula', {
    stage(ctx) {
      const g = ctx.g = ctx.grid({ x: GX, y: GY, cols: COLW.length, rows: 21, fontSize: 14, colWidths: COLW, data: sheetRows(),
        formats: { 'B2:B21': '0.000', 'F2:F3': '0.00' } });
      g.rowH = ROW_H;                               // compact rows so all 20 samples fit the stage (overlays use rowH)
      g.sheet.style.gridTemplateRows = g.headH + 'px repeat(' + g.rows + ', ' + ROW_H + 'px)';
      g.mark('E2:E3', 'bold');
      drawChart(ctx, UCL, []);
      ctx.caption('20 sample means. Control limits: UCL 25.06, LCL 24.94 mm.');
    },
    steps: [
      // 1 · the question
      (ctx) => {
        ctx.g.mark('E2:F3', 'hl-blue');
        ctx.tip = ctx.ui.callout({ text: 'The limits live in cells F2 and F3', x: 436, y: 90, w: 320, arrow: 'left' });
        ctx.caption('Which samples are out of control? Eyeball 20 rows… or 2,000?');
      },
      // 2 · select A2:B21 › Home › Conditional Formatting › New Rule… › "Use a formula…"
      (ctx, animate) => {
        if (ctx.tip) { ctx.tip.remove(); ctx.tip = null; }
        ctx.g.select('A2:B21');
        ctx.rb = ctx.ui.ribbon({ tab: 'Home', path: ['Conditional Formatting', 'New Rule…'], x: DLG.x, y: 8 });
        if (animate) {
          const m = ctx.ui.menu({ items: CF_MENU, on: 'New Rule…', x: 520, y: 46, w: 236 });
          m.querySelectorAll('div').forEach(d => {
            if (HAS_SUB.includes(d.textContent)) d.classList.add('t12-sub');
            if (d.textContent === 'New Rule…') d.classList.add('t12-sep');
          });
          m.classList.add('t12-flash');
          ctx.later(1800, () => m.remove());
        }
        ctx.dlg = ctx.ui.dialog({ title: 'New Formatting Rule', body: NFR_BODY, x: DLG.x, y: DLG.y, w: DLG.w });
        ctx.dlg.classList.add('t12-dlg');
        if (animate) ctx.dlg.classList.add('t12-late');
        ctx.caption('Select A2:B21 › Home › Conditional Formatting › New Rule…');
      },
      // 3 · type the rule for the first row; what each $ does
      (ctx, animate) => {
        typeInto(ctx, ctx.dlg.querySelector('.t12-field'), RULE, animate);
        const boxes = [ctx.g.refBox('B2', 0), ctx.g.refBox('F2', 1), ctx.g.refBox('F3', 2)];
        if (animate) [0.4, 0.68, 1.18].forEach((d, i) => { boxes[i].style.animation = 'refIn .3s ease-out ' + d + 's both'; });
        ctx.leg = ctx.ui.callout({ text: LEGEND, x: DLG.x + 14, y: 380, w: 336, arrow: 'up' });
        if (animate) ctx.leg.style.animationDelay = '1.35s';
        ctx.caption('Write the rule for row 2, the first row: Excel moves it down.');
      },
      // 4 · Format… › red fill › OK → samples 7 and 15 light up, chart points turn red
      (ctx, animate) => {
        if (ctx.leg) { ctx.leg.remove(); ctx.leg = null; }
        if (ctx.rb) { ctx.rb.remove(); ctx.rb = null; }
        ctx.g.clearRefs();
        const d = ctx.dlg;
        ctx.dlg = null;
        if (animate) {
          ctx.ui.press(d, 'Format…', true);
          ctx.later(450, () => { const s = d.querySelector('.t12-sw'); s.textContent = 'AaBbCcYyZz'; s.classList.add('red'); });
          ctx.later(900, () => ctx.ui.press(d, 'OK', true));
          d.style.animation = 't12-out .3s ease-in 1.25s both';
          ctx.later(1650, () => d.remove());
        } else d.remove();
        const hot = outIdx(UCL, LCL);
        hot.forEach(i => light(ctx, i, animate ? 1.45 : null));
        drawChart(ctx, UCL, hot);
        if (animate) popPoints(ctx, hot, 1.6);
        ctx.caption('Format… › light red fill › OK: samples 7 and 15 light up.');
      },
      // 5 · tighten the UCL → the 25.055 sample lights up by itself
      (ctx, animate) => {
        const before = outIdx(UCL, LCL), after = outIdx(UCL2, LCL);
        const fresh = after.filter(i => !before.includes(i));
        ctx.g.enter('F2', UCL2);
        ctx.g.select('F2');
        fresh.forEach(i => light(ctx, i, animate ? 0.75 : null));
        drawChart(ctx, UCL2, after);
        if (animate) {
          const H = CH.h - 38 - 30;                    // plot height inside charts.line (title on)
          const ln = ctx.chart.querySelectorAll('line.hline')[0];
          [ln, ln && ln.nextElementSibling].forEach(e => {
            if (!e) return;
            e.style.setProperty('--dy', (-H * (UCL - UCL2) / (CH.hi - CH.lo)).toFixed(1) + 'px');
            e.style.animation = 't12-slide .8s ease-in-out .15s both';
          });
          popPoints(ctx, fresh, 0.9);
        }
        ctx.ui.callout({ text: 'Same trick for maintenance: <span class="t12-code">=$E2&lt;TODAY()</span> lights up overdue PMs.',
          x: 446, y: 62, w: 410, tone: 'good' });
        ctx.caption('Tighten the UCL to 25.05: sample 18 (25.055) lights up by itself.');
      }
    ],
    tryit: {
      sheet: (() => { const s = sheetRows(); s[0].push(null, 'Out?'); return s; })(),
      task: 'In H2, write a rule that is TRUE when the mean in B2 is above the UCL (F2) or below the LCL (F3). ' +
        'It is copied down to H21, and rows where it is TRUE light up red.',
      target: 'H2',
      mode: 'cf',
      fill: 'H2:H21',
      cfRange: 'A2:B21',
      expected: flags(UCL, LCL).map(f => [f]),
      hint: 'Use OR(test1, test2). $B2 keeps column B but lets the row move; $F$2 and $F$3 never move.',
      answer: RULE
    }
  });
})();
