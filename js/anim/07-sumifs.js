/* anim/07-sumifs.js — #07 SUMIFS / COUNTIFS (Act 2). Storyboard: plan appendix, one step per click.
   Note: XGrid's formula-bar colouriser also colours "L2" inside quotes as a cell ref, so this file colours the
   bar itself (refs outside quotes only), matching the refBox colours: D blue, B red, C green. */
(function () {
  const ID = 'sumifs';
  const S = '.t-slide[data-trick="' + ID + '"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + `
${S}.t07-lens{box-sizing:border-box;background:#fff;color:#1f1f1f;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.5);padding:10px 16px 12px;border-top:4px solid #107C41}
${S}.t07-lens .fn{font:700 22px var(--mono)}
${S}.t07-lens .arg{display:flex;flex-direction:column;margin:6px 0 2px 12px;padding:2px 0 2px 14px;border-left:3px solid #d9d9d9}
${S}.t07-lens .arg code{font:700 21px var(--mono);color:#333;white-space:pre}
${S}.t07-lens .arg small{font:600 13.5px var(--font);color:#666}
${S}.t07-lens .new{animation:popIn .3s ease-out both}
${S}.t07-lens .res{margin-top:10px;font:700 21px var(--font);color:#0e6b39;background:#e6f4ec;border-radius:8px;padding:6px 12px}
${S}.t07-glow{position:absolute;pointer-events:none;z-index:6;box-sizing:border-box;border:2.5px solid #f08c00;border-radius:3px;box-shadow:0 0 12px 2px rgba(240,140,0,.7)}
${S}.t07-glow.anim{animation:t07glow .8s ease-in-out 2}
@keyframes t07glow{50%{box-shadow:0 0 22px 7px rgba(240,140,0,.95)}}
${S}.xg-cell.t07-hit{font-weight:800;color:#7a3e00;background:#ffe3a3}
` + '</style>');
  }

  // ---- data: shift defect log (Date | Line | Shift | Defects), rows 2–13 ----
  const LOG = [
    ['5-Oct', 'L1', 'Day', 4], ['5-Oct', 'L2', 'Day', 6], ['5-Oct', 'L2', 'Night', 9], ['5-Oct', 'L3', 'Night', 3],
    ['6-Oct', 'L1', 'Night', 7], ['6-Oct', 'L2', 'Day', 5], ['6-Oct', 'L2', 'Night', 12], ['6-Oct', 'L3', 'Day', 2],
    ['7-Oct', 'L1', 'Day', 8], ['7-Oct', 'L2', 'Night', 6], ['7-Oct', 'L3', 'Night', 10], ['7-Oct', 'L1', 'Night', 4]
  ];
  const rowsWhere = pred => LOG.map((r, i) => (pred(r) ? i + 2 : 0)).filter(Boolean);   // sheet row numbers
  const L2 = rowsWhere(r => r[1] === 'L2');                    // 3 4 7 8 11
  const NIGHT = rowsWhere(r => r[2] === 'Night');              // 4 5 6 8 11 12 13
  const OVER5 = rowsWhere(r => r[3] > 5);                      // 3 4 6 8 10 11 12
  const HIT = L2.filter(r => NIGHT.includes(r));               // 4 8 11
  const HIT2 = NIGHT.filter(r => OVER5.includes(r));           // 4 6 8 11 12
  const SUM = HIT.reduce((s, r) => s + LOG[r - 2][3], 0);      // 9 + 12 + 6 = 27
  const SUMTXT = HIT.map(r => LOG[r - 2][3]).join(' + ') + ' = ' + SUM;
  const CNT = HIT2.length;                                     // 5
  const F1 = '=SUMIFS(D2:D13,', F2 = F1 + 'B2:B13,"L2",', F3 = F2 + 'C2:C13,"Night")';
  const FC = '=COUNTIFS(C2:C13,"Night",D2:D13,">5")';

  // ---- helpers ----
  const GX = 12, GY = 10;
  const RC = ['#4472C4', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rm = el => { if (el && el.remove) el.remove(); };
  function colorize(text) {
    text = String(text);
    if (!text.startsWith('=')) return esc(text);
    const seen = {};
    let n = 0;
    return text.split('"').map((seg, i) => (i % 2 ? esc(seg) : esc(seg).replace(/(\$?[A-Z]{1,2}\$?\d{1,4}(?::\$?[A-Z]{1,2}\$?\d{1,4})?)(?![A-Za-z(])/g, m => {
      const k = m.replace(/\$/g, '');
      if (!(k in seen)) seen[k] = n++ % RC.length;
      return '<span class="xg-r" style="color:' + RC[seen[k]] + '">' + m + '</span>';
    }))).join('&quot;');
  }
  function setBar(g, text) { if (g.fxEl) g.fxEl.innerHTML = colorize(text); }
  function beats(ctx, animate, list) {
    let t = 0;
    list.forEach(([d, fn]) => { t += animate ? d : 0; if (t === 0) fn(); else ctx.later(t, fn); });
  }
  function typeInto(ctx, g, ref, from, to, animate) {
    const el = g.cell(ref);
    g.select(ref);
    el.classList.add('editing');
    el.classList.remove('num');
    if (!animate) { el.textContent = to; setBar(g, to); fitSel(g, ref, to); return 0; }
    el.textContent = from;
    setBar(g, from);
    fitSel(g, ref, from);
    for (let i = from.length + 1; i <= to.length; i++) {
      const s = to.slice(0, i);
      ctx.later((i - from.length) * 38, () => { el.textContent = s; setBar(g, s); fitSel(g, ref, s); });
    }
    return (to.length - from.length) * 38;
  }
  // Excel's in-cell editor grows to the right over empty cells: stretch the selection box to the typed text
  // (monospace .9em of 15px ≈ 8.1px per char; select() resets it to the cell on Enter)
  function fitSel(g, ref, text) { g.selEl.style.width = Math.max(g.box(ref).width, Math.ceil(text.length * 8.2) + 14) + 'px'; }
  const R = (t, i) => '<span style="color:' + RC[i] + '">' + t + '</span>';
  const ARGS_S = [
    { code: R('D2:D13', 0) + ',', role: 'sum_range · the numbers to add (FIRST!)' },
    { code: R('B2:B13', 1) + ', "L2",', role: 'criteria_range1, criteria1' },
    { code: R('C2:C13', 2) + ', "Night")', role: 'criteria_range2, criteria2' }
  ];
  const ARGS_C = [
    { code: R('C2:C13', 0) + ', "Night",', role: 'criteria_range1, criteria1' },
    { code: R('D2:D13', 1) + ', "&gt;5")', role: 'criteria_range2, criteria2 (no sum range)' }
  ];
  function lens(ctx, fn, args, result, animate) {
    rm(ctx.t07lens);
    const html = '<div class="fn">=' + fn + '(</div>' +
      args.map((a, k) => '<div class="arg' + (animate && !result && k === args.length - 1 ? ' new' : '') + '"><code>' + a.code + '</code><small>' + a.role + '</small></div>').join('') +
      (result ? '<div class="res' + (animate ? ' new' : '') + '">' + result + '</div>' : '');
    ctx.t07lens = ctx.box({ x: 480, y: 172, w: 420, cls: 't07-lens', html });
  }
  function glow(g, row, animate) { g.overlay('A' + row + ':D' + row, 't07-glow' + (animate ? ' anim' : '')); }
  function unglow(g) { g.sheet.querySelectorAll('.t07-glow').forEach(e => e.remove()); }

  extendTrick(ID, {
    stage(ctx) {
      const g = ctx.g = ctx.grid({ x: GX, y: GY, cols: 9, rows: 13, colWidths: [76, 56, 70, 82, 18, 112, 72, 182, 180],
        data: [['Date', 'Line', 'Shift', 'Defects', '', 'Question', 'Answer']].concat(LOG.map(r => r.slice())) });
      LOG.forEach((r, i) => g.cell('A' + (i + 2)).classList.add('num'));   // real dates: right-aligned
      g.set('F2', 'L2, Night');
      ctx.caption('Shift defect log: 12 rows, lines L1–L3, Day and Night shifts.');
    },
    steps: [
      // 1 · the question
      (ctx) => {
        ctx.g.select('G2');
        ctx.t07boss = ctx.ui.callout({ x: 480, y: 176, w: 400, tone: 'warn',
          text: 'Boss: “Total defects for Line 2, Night shift?”<br><span style="font-weight:500">Filter, select, read the status bar… then she asks for Line 3.</span>' });
        ctx.caption('Boss: total defects for Line 2, Night shift?');
      },
      // 2 · =SUMIFS(D2:D13,  — sum range first
      (ctx, animate) => {
        const g = ctx.g;
        rm(ctx.t07boss);
        ctx.caption('=SUMIFS( takes the SUM range FIRST: the Defects column.');
        const d = typeInto(ctx, g, 'G2', '', F1, animate);
        lens(ctx, 'SUMIFS', ARGS_S.slice(0, 1), null, animate);
        beats(ctx, animate, [[d + 100, () => g.refBox('D2:D13', 0)]]);
      },
      // 3 · B2:B13,"L2",  — first criteria pair
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('Then pairs: criteria range, criteria. Line must be "L2".');
        const d = typeInto(ctx, g, 'G2', F1, F2, animate);
        lens(ctx, 'SUMIFS', ARGS_S.slice(0, 2), null, animate);
        beats(ctx, animate, [[d + 100, () => { g.refBox('B2:B13', 1); L2.forEach(r => g.mark('B' + r, 'hl-yellow')); }]]);
      },
      // 4 · C2:C13,"Night")  — second pair, intersection, result
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('Add Night: only rows matching BOTH pairs count. ' + SUMTXT);
        const d = typeInto(ctx, g, 'G2', F2, F3, animate);
        lens(ctx, 'SUMIFS', ARGS_S, null, animate);
        beats(ctx, animate, [
          [d + 100, () => { g.refBox('C2:C13', 2); NIGHT.forEach(r => g.mark('C' + r, 'hl-green')); }],
          [750, () => {
            HIT.forEach(r => { glow(g, r, animate); g.mark('D' + r, 't07-hit'); });
            LOG.forEach((x, i) => { if (!HIT.includes(i + 2)) g.mark('D' + (i + 2), 'dim'); });
          }],
          [1000, () => {
            g.clearRefs();
            g.enter('G2', SUM, F3);
            g.select('G2');
            setBar(g, F3);
            lens(ctx, 'SUMIFS', ARGS_S, SUMTXT.replace(/= (\d+)$/, '= <b>$1</b> defects'), animate);
          }]
        ]);
      },
      // 5 · COUNTIFS + the order gotcha
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('COUNTIFS counts rows where every pair matches: ' + CNT + ' Night rows over 5.');
        ['hl-yellow', 'hl-green', 'dim', 't07-hit'].forEach(c => g.unmark(c));
        unglow(g);
        g.set('F3', 'Night, >5');
        const d = typeInto(ctx, g, 'G3', '', FC, animate);
        lens(ctx, 'COUNTIFS', ARGS_C, null, animate);
        beats(ctx, animate, [
          [d + 100, () => {
            g.refBox('C2:C13', 0); g.refBox('D2:D13', 1);
            NIGHT.forEach(r => g.mark('C' + r, 'hl-green'));
            OVER5.forEach(r => g.mark('D' + r, 'hl-yellow'));
          }],
          [750, () => HIT2.forEach(r => glow(g, r, animate))],
          [900, () => {
            g.clearRefs();
            g.enter('G3', CNT, FC);
            g.select('G3');
            setBar(g, FC);
            lens(ctx, 'COUNTIFS', ARGS_C, '<b>' + CNT + '</b> rows match both', animate);
            ctx.ui.callout({ x: GX, y: 474, w: 600, tone: 'info',
              text: 'SUMIFS: sum range FIRST (SUMIF puts it last).<br><span style="font-weight:500">All ranges must be the same size: D2:D13, B2:B13, C2:C13.</span>' });
          }]
        ]);
      }
    ],
    // expected: plain JS over LOG: rows with Line "L2" AND Shift "Night" are 4, 8, 11 → 9 + 12 + 6 = 27 (checked by hand)
    tryit: {
      sheet: [['Date', 'Line', 'Shift', 'Defects']].concat(LOG.map(r => r.slice())),
      task: 'Total defects for Line L2 on the Night shift. Type one formula in G2.',
      target: 'G2',
      mode: 'value',
      expected: SUM,
      mustUse: ['SUMIFS'],
      hint: 'Sum range first (D2:D13), then pairs of criteria range and criteria: B2:B13 with "L2", C2:C13 with "Night".',
      answer: '=SUMIFS(D2:D13,B2:B13,"L2",C2:C13,"Night")'
    }
  });
})();
