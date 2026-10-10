/* 18 · Solver product mix (Act 4): max 40x + 30y s.t. 2x + y ≤ 100 (machining h), x + y ≤ 80 (assembly h), x, y ≥ 0.
   Optimum (20, 60), profit 2,600, both constraints binding. Graphical LP view is our own SVG. */
(function () {
  const P = '.t-slide[data-trick="solver"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-solver')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-solver">' +
      // model card
      P + '.t18-model{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 16px;color:var(--ink)}' +
      P + '.t18-model h4{margin:0 0 6px;font:800 13px var(--font);letter-spacing:.1em;text-transform:uppercase;color:var(--xl3)}' +
      P + '.t18-eq{display:grid;grid-template-columns:44px 150px 1fr;align-items:baseline;line-height:1.75}' +
      P + '.t18-eq .k{font:700 15px var(--mono);color:var(--muted)}' +
      P + '.t18-eq code{font:700 18px var(--mono);color:#fff}' +
      P + '.t18-eq i{font-style:normal;font-size:15.5px;color:#c8d5df}' +
      P + '.t18-eq b{font-family:var(--mono)}' +
      P + '.t18-model.anim{animation:t18-up .4s ease-out .2s both}' +
      // dialogs
      P + '.t18-dlg .dlg-body{padding:10px 14px}' +
      P + '.t18-dlg .dlg-field{font-size:15px;font-weight:700}' +
      P + '.t18-r{display:flex;align-items:center;gap:10px;margin:6px 0}' +
      P + '.t18-l{width:104px;flex:none}' +
      P + '.t18-grow{flex:1}' +
      P + '.t18-tiny{min-width:34px!important;color:#888}' +
      P + '.t18-lab{margin:8px 0 2px}' +
      P + '.t18-cons{display:flex;gap:8px;margin-bottom:6px}' +
      P + '.t18-list{flex:1;border:1px solid #8a8a8a;height:122px;padding:4px;font:700 15px var(--mono)}' +
      P + '.t18-item{background:#dbeafe;padding:2px 6px;border-radius:2px}' +
      P + '.t18-btns{display:flex;flex-direction:column;gap:4px;width:82px}' +
      P + '.t18-btns span,' + P + '.t18-sb{border:1px solid #adadad;border-radius:4px;background:#fdfdfd;padding:1px 6px;font-size:13px;text-align:center}' +
      P + '.t18-sb{padding:3px 10px}' +
      P + '.t18-dlg.anim .t18-v{animation:t18-in .3s ease-out both;animation-delay:var(--d,0s)}' +
      P + '.t18-out{animation:t18-out .2s ease-in .25s forwards!important}' +
      P + '.t18-msg{font-weight:700;font-size:15.5px;line-height:1.4;margin-bottom:10px}' +
      P + '.t18-two{display:flex;gap:12px;justify-content:space-between}' +
      P + '.t18-two .radio,' + P + '.t18-two .check{display:block;margin:3px 0;font-size:14px}' +
      P + '.t18-gap{margin-top:10px!important}' +
      P + '.t18-rep{display:flex;flex-direction:column;border:1px solid #8a8a8a;width:96px;font-size:14px;padding:2px 0;align-self:flex-start}' +
      P + '.t18-rep span{padding:1px 8px}' +
      P + '.t18-rep .t18-rh{font-weight:700;color:#555;border-bottom:1px solid #ddd}' +
      P + '.t18-note{margin-top:10px;font-size:13.5px;line-height:1.35;color:#444;border-top:1px solid #eee;padding-top:8px}' +
      // LP graph
      P + '.t18-lp{z-index:3;background:#fff;border-radius:8px;box-shadow:0 12px 34px rgba(0,0,0,.4)}' +
      P + '.t18-lp svg{display:block}' +
      P + '.t18-lp text{font:12.5px "Segoe UI",system-ui,sans-serif;fill:#444}' +
      P + '.t18-lp .at{font-weight:700;font-size:14px;fill:#222}' +
      P + '.t18-lp .gl{stroke:#eee;stroke-width:1}' +
      P + '.t18-lp .ax{stroke:#999;stroke-width:1.2}' +
      P + '.t18-lp .fr{fill:rgba(33,163,102,.22);stroke:#21A366;stroke-width:1.5}' +
      P + '.t18-lp .frl{fill:#1b7a4b;font-weight:700;font-style:italic;font-size:14px}' +
      P + '.t18-lp .cl{fill:none;stroke-width:2.8;stroke-linecap:round}' +
      P + '.t18-lp .mach{stroke:#C0504D}' + P + '.t18-lp .asm{stroke:#4472C4}' +
      P + '.t18-lp .iso{fill:none;stroke:#2b8a3e;stroke-width:3}' +
      P + '.t18-lp .iso.ghost{stroke-width:1.8;stroke-dasharray:7 5;opacity:.45}' +
      P + '.t18-lp .vx{fill:#1f1f1f;stroke:#fff;stroke-width:1.5}' +
      P + '.t18-lp .vxl{font-weight:700;fill:#333}' +
      P + '.t18-lp .opt{fill:#ffd166;stroke:#8a5a00;stroke-width:2}' +
      P + '.t18-lp .ring{fill:none;stroke:#e8590c;stroke-width:2.5}' +
      P + '.t18-lp .optl{font-weight:800;font-size:16px;fill:#1f1f1f}' +
      P + '.t18-lp .optl2{font-weight:700;font-size:14px;fill:#2b8a3e}' +
      P + '.t18-lp .lgt{font-size:12.5px;fill:#333}' +
      P + '.t18-lp.anim{animation:t18-pop .3s ease-out .35s both}' +
      P + '.t18-lp.anim .cl{stroke-dasharray:1;stroke-dashoffset:1;animation:t18-draw .8s ease-out .6s forwards}' +
      P + '.t18-lp.anim .fr,' + P + '.t18-lp.anim .frl{animation:t18-fade .5s ease-out 1.3s both}' +
      P + '.t18-lp.anim .vx,' + P + '.t18-lp.anim .vxl,' + P + '.t18-lp.anim .lg{animation:t18-fade .4s ease-out 1.5s both}' +
      P + '.t18-lp.anim .iso.ghost{animation:t18-fade .4s ease-out both;animation-delay:calc(1.8s + var(--o) * .4s)}' +
      P + '.t18-lp.anim .iso.main{animation:t18-slide 1.7s ease-in-out 1.8s both}' +
      P + '.t18-lp.anim .opt,' + P + '.t18-lp.anim .optl,' + P + '.t18-lp.anim .optl2{animation:t18-fade .4s ease-out 3.4s both}' +
      P + '.t18-lp.anim .ring{transform-box:fill-box;transform-origin:center;animation:t18-ring .9s ease-out 3.4s both}' +
      P + '.t18-mac{display:block;margin-top:4px;font-size:15px;font-weight:600;color:#555}' +
      '@keyframes t18-in{from{opacity:0;transform:translateY(5px)}}' +
      '@keyframes t18-up{from{opacity:0;transform:translateY(10px)}}' +
      '@keyframes t18-out{to{opacity:0;transform:scale(.96)}}' +
      '@keyframes t18-pop{from{opacity:0;transform:scale(.96)}}' +
      '@keyframes t18-draw{to{stroke-dashoffset:0}}' +
      '@keyframes t18-fade{from{opacity:0}}' +
      '@keyframes t18-slide{from{transform:translateX(var(--dx))}to{transform:none}}' +
      '@keyframes t18-ring{0%{opacity:0;transform:scale(2.4)}60%{opacity:1}100%{transform:scale(1)}}' +
      '</style>');
  }

  // Excel ref colours: 0 blue B2:C2 · 1 red D5:D6 · 2 green D3 · 3 purple F5:F6 (dark text variants for dialogs,
  // light variants for the dark model card)
  const DK = { b: '#2f5597', r: '#a33a37', g: '#4f7a1f', p: '#5f4b8b' };
  const LT = { b: '#8fb4ff', r: '#ff9a95', g: '#b9dc7c', p: '#c9b3ff' };
  let uid = 0;

  const at = (ctx, animate, ms, fn) => (animate ? ctx.later(ms, fn) : fn());

  function dismiss(ctx, el, animate) {
    if (!el || !el.isConnected) return;
    if (!animate) { el.remove(); return; }
    ctx.ui.press(el, null, true);
    el.classList.add('t18-out');
    ctx.later(450, () => el.remove());
  }

  // write a mix (x brackets, y housings) and everything that depends on it
  function setMix(g, x, y) {
    g.set('B2', x);
    g.set('C2', y);
    g.set('D3', { v: 40 * x + 30 * y, f: '=SUMPRODUCT(B2:C2,B3:C3)' });
    g.set('D5', { v: 2 * x + y, f: '=SUMPRODUCT($B$2:$C$2,B5:C5)' });
    g.set('D6', { v: x + y, f: '=SUMPRODUCT($B$2:$C$2,B6:C6)' });
    g.set('G5', { v: (2 * x + y) / 100, f: '=D5/F5' });
    g.set('G6', { v: (x + y) / 80, f: '=D6/F6' });
  }

  const PARAMS =
    '<div class="t18-r"><span class="t18-l">Set Objective:</span><span class="dlg-field t18-grow t18-v" style="--d:1.2s;color:' + DK.g + '">$D$3</span></div>' +
    '<div class="t18-r"><span>To:</span><span class="radio on t18-v" style="--d:1.4s">Max</span><span class="radio">Min</span><span class="radio">Value Of:</span><span class="dlg-field t18-tiny">0</span></div>' +
    '<div class="t18-lab">By Changing Variable Cells:</div>' +
    '<div class="t18-r"><span class="dlg-field t18-grow t18-v" style="--d:1.65s;color:' + DK.b + '">$B$2:$C$2</span></div>' +
    '<div class="t18-lab">Subject to the Constraints:</div>' +
    '<div class="t18-cons"><div class="t18-list"><div class="t18-item t18-v" style="--d:1.95s"><span style="color:' + DK.r + '">$D$5:$D$6</span> &lt;= <span style="color:' + DK.p + '">$F$5:$F$6</span></div></div>' +
    '<div class="t18-btns"><span>Add</span><span>Change</span><span>Delete</span><span>Reset All</span><span>Load/Save</span></div></div>' +
    '<div class="t18-r"><span class="check on t18-v" style="--d:2.25s">Make Unconstrained Variables Non-Negative</span></div>' +
    '<div class="t18-r"><span>Select a Solving Method:</span><span class="dlg-field t18-v" style="--d:2.5s">Simplex LP ▾</span><span class="t18-sb">Options</span></div>';

  const RESULTS =
    '<div class="t18-msg">Solver found a solution. All Constraints and optimality conditions are satisfied.</div>' +
    '<div class="t18-two"><div><div class="radio on">Keep Solver Solution</div><div class="radio">Restore Original Values</div>' +
    '<div class="check t18-gap">Return to Solver Parameters Dialog</div><div class="check">Outline Reports</div></div>' +
    '<div class="t18-rep"><span class="t18-rh">Reports</span><span>Answer</span><span>Sensitivity</span><span>Limits</span></div></div>' +
    '<div class="t18-note">When Simplex LP is used, this means Solver has found a global optimal solution.</div>';

  // Graphical LP: axes Brackets (x) / Housings (y), both constraint lines, feasible region, vertices,
  // iso-profit line 40x + 30y = k sliding from k = 800 out to k = 2,600 where it touches (20, 60).
  function lpGraph(ctx, animate) {
    const Wd = 390, Ht = 520, L = 56, R = 16, T = 44, B = 52, PW = Wd - L - R, PH = Ht - T - B;
    const XMAX = 90, YMAX = 110, sx = PW / XMAX, sy = PH / YMAX;
    const X = x => +(L + x * sx).toFixed(1), Y = y => +(T + PH - y * sy).toFixed(1);
    const id = 't18clip' + (++uid);
    const iso = k => 'M' + X(-60) + ' ' + Y((k + 2400) / 30) + ' L' + X(110) + ' ' + Y((k - 4400) / 30);   // y = (k − 40x)/30
    let s = '<defs><clipPath id="' + id + '"><rect x="' + L + '" y="' + T + '" width="' + PW + '" height="' + PH + '"/></clipPath></defs>';
    for (let v = 10; v <= XMAX; v += 10) s += '<line class="gl" x1="' + X(v) + '" x2="' + X(v) + '" y1="' + T + '" y2="' + (T + PH) + '"/>';
    for (let v = 10; v <= YMAX; v += 10) s += '<line class="gl" x1="' + L + '" x2="' + (L + PW) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>';
    s += '<line class="ax" x1="' + L + '" x2="' + (L + PW) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    s += '<line class="ax" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + Y(0) + '"/>';
    [0, 20, 40, 60, 80].forEach(v => { s += '<text x="' + X(v) + '" y="' + (Y(0) + 18) + '" text-anchor="middle">' + v + '</text>'; });
    [20, 40, 60, 100].forEach(v => { s += '<text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>'; });
    s += '<text class="at" x="' + (L + PW / 2) + '" y="' + (Ht - 12) + '" text-anchor="middle">Brackets (x)</text>';
    s += '<text class="at" x="14" y="' + (T - 18) + '">Housings (y)</text>';
    // feasible region + constraint lines
    s += '<polygon class="fr" points="' + [[0, 0], [50, 0], [20, 60], [0, 80]].map(p => X(p[0]) + ',' + Y(p[1])).join(' ') + '"/>';
    s += '<text class="frl" x="' + X(9) + '" y="' + Y(22) + '">feasible</text>';
    s += '<path class="cl mach" pathLength="1" d="M' + X(0) + ' ' + Y(100) + ' L' + X(50) + ' ' + Y(0) + '"/>';
    s += '<path class="cl asm" pathLength="1" d="M' + X(0) + ' ' + Y(80) + ' L' + X(80) + ' ' + Y(0) + '"/>';
    // iso-profit lines (clipped to the plot)
    s += '<g clip-path="url(#' + id + ')">' +
      '<path class="iso ghost" style="--o:0" d="' + iso(800) + '"/>' +
      '<path class="iso ghost" style="--o:1" d="' + iso(1600) + '"/>' +
      '<path class="iso main" style="--dx:' + (-(2600 - 800) / 40 * sx).toFixed(1) + 'px" d="' + iso(2600) + '"/></g>';
    // vertices
    [[0, 0], [50, 0], [0, 80]].forEach(p => { s += '<circle class="vx" cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="5"/>'; });
    s += '<text class="vxl" x="' + (X(0) + 8) + '" y="' + (Y(0) - 8) + '">(0, 0)</text>';
    s += '<text class="vxl" x="' + (X(50) - 12) + '" y="' + (Y(0) - 8) + '" text-anchor="end">(50, 0)</text>';
    s += '<text class="vxl" x="' + (L - 8) + '" y="' + (Y(80) + 5) + '" text-anchor="end">(0, 80)</text>';
    s += '<circle class="ring" cx="' + X(20) + '" cy="' + Y(60) + '" r="12"/>';
    s += '<circle class="opt" cx="' + X(20) + '" cy="' + Y(60) + '" r="7"/>';
    s += '<text class="optl" x="' + X(24) + '" y="' + Y(65) + '">(20, 60)</text>';
    s += '<text class="optl2" x="' + X(24) + '" y="' + (Y(65) + 18) + '">profit 2,600 = max</text>';
    // legend (top-right corner of the plot is empty)
    const lx = X(40), ly = T + 16;
    const lg = (dy, cls, extra, label) => '<line class="' + cls + '" x1="' + lx + '" x2="' + (lx + 22) + '" y1="' + (ly + dy) + '" y2="' + (ly + dy) + '"' + extra + '/>' +
      '<text class="lgt" x="' + (lx + 28) + '" y="' + (ly + dy + 4) + '">' + label + '</text>';
    s += '<g class="lg">' +
      lg(0, 'mach', ' style="stroke-width:3"', 'machining 2x + y ≤ 100') +
      lg(20, 'asm', ' style="stroke-width:3"', 'assembly x + y ≤ 80') +
      lg(40, '', ' style="stroke:#2b8a3e;stroke-width:3"', 'profit 40x + 30y = k') + '</g>';
    const box = ctx.box({ x: 522, y: 12, w: Wd, h: Ht, cls: 't18-lp' + (animate ? ' anim' : ''),
      html: '<svg width="' + Wd + '" height="' + Ht + '" viewBox="0 0 ' + Wd + ' ' + Ht + '">' + s + '</svg>' });
    return box;
  }

  extendTrick('solver', {
    stage(ctx) {
      ctx.g = ctx.grid({
        x: 10, y: 12, cols: 7, rows: 6, fontSize: 15, colWidths: [96, 80, 82, 62, 30, 50, 66],
        data: [
          ['', 'Brackets', 'Housings', 'Total', '', '', ''],
          ['Quantity', 0, 0, '', '', '', ''],
          ['Profit/unit', 40, 30, { v: 0, f: '=SUMPRODUCT(B2:C2,B3:C3)' }, '', '', ''],
          ['Hours/unit', '', '', 'Used', '', 'Limit', '% used'],
          ['Machining', 2, 1, { v: 0, f: '=SUMPRODUCT($B$2:$C$2,B5:C5)' }, '<=', 100, { v: 0, f: '=D5/F5' }],
          ['Assembly', 1, 1, { v: 0, f: '=SUMPRODUCT($B$2:$C$2,B6:C6)' }, '<=', 80, { v: 0, f: '=D6/F6' }]
        ],
        formats: { D3: '#,##0', 'G5:G6': '0%' }
      });
      ctx.g.mark('A4:G4', 'bold');
      ctx.g.select('D3');
      ctx.caption('Decisions in B2:C2, profit in D3, hours used vs limits below.');
    },
    steps: [
      // 1 · the question + the LP mapped onto cells
      (ctx, animate) => {
        const g = ctx.g;
        g.refBox('B2:C2', 0);
        g.refBox('D3', 2);
        g.refBox('D5:D6', 1);
        g.refBox('F5:F6', 3);
        ctx.box({ x: 10, y: 262, w: 504, cls: 't18-model' + (animate ? ' anim' : ''),
          html: '<h4>The LP behind the sheet</h4><div class="t18-eq">' +
            '<span class="k">max</span><code>40x + 30y</code><i>profit → <b style="color:' + LT.g + '">D3</b></i>' +
            '<span class="k">s.t.</span><code>2x + y ≤ 100</code><i>machining → <b style="color:' + LT.r + '">D5</b> ≤ <b style="color:' + LT.p + '">F5</b></i>' +
            '<span class="k"></span><code>x + y ≤ 80</code><i>assembly → <b style="color:' + LT.r + '">D6</b> ≤ <b style="color:' + LT.p + '">F6</b></i>' +
            '<span class="k"></span><code>x, y ≥ 0</code><i>x brackets, y housings → <b style="color:' + LT.b + '">B2:C2</b></i></div>' });
        ctx.caption('Max profit with 100 machining h and 80 assembly h: how many of each?');
      },
      // 2 · Data › Analyze › Solver → Solver Parameters
      (ctx, animate) => {
        ctx.rb = ctx.ui.ribbon({ tab: 'Data', path: ['Analyze', 'Solver'], x: 522, y: 12 });
        ctx.dlg = ctx.ui.dialog({ title: 'Solver Parameters', x: 522, y: 56, w: 390, buttons: ['Help', 'Solve', 'Close'], primary: 'Solve', body: PARAMS });
        ctx.dlg.classList.add('t18-dlg');
        if (animate) ctx.dlg.style.animationDelay = '.8s';
        ctx.caption('Objective D3 → Max, change B2:C2, hours used <= limits, Simplex LP.');
      },
      // 3 · Solve → 20 and 60, profit 2,600, both constraints 100% used; Solver Results
      (ctx, animate) => {
        const g = ctx.g;
        if (ctx.rb) ctx.rb.remove();
        dismiss(ctx, ctx.dlg, animate);
        g.clearRefs();
        setMix(g, 20, 60);                           // final state
        g.mark('B2:C2', 'hl-green');
        g.mark('D3', 'hl-green');
        g.mark('D5:D6', 'hl-yellow');
        g.mark('G5:G6', 'hl-yellow');
        g.mark('B2:G6', 'bold');
        g.unmark('bold', 'A5:C6');
        g.unmark('bold', 'E5:F6');
        g.select('B2:C2');
        ctx.res = ctx.ui.dialog({ title: 'Solver Results', x: 522, y: 56, w: 390, buttons: ['OK', 'Cancel', 'Save Scenario…'], primary: 'OK', body: RESULTS });
        ctx.res.classList.add('t18-dlg');
        if (animate) {                               // cosmetic count-up 0 → (20, 60)
          setMix(g, 0, 0);
          const N = 8;
          for (let k = 1; k <= N; k++) {
            ctx.later(450 + 110 * k, () => {
              setMix(g, Math.round(20 * k / N), Math.round(60 * k / N));
              if (k === N) ['B2:C2', 'D3', 'D5:D6', 'G5:G6'].forEach(r => g.flash(r));
            });
          }
          ctx.res.style.animationDelay = '1.6s';
        }
        ctx.caption('Solve: 20 brackets + 60 housings = 2,600. Both resources 100% used.');
      },
      // 4 · graphical view: feasible region, iso-profit line slides out to the corner (20, 60)
      (ctx, animate) => {
        dismiss(ctx, ctx.res, animate);
        lpGraph(ctx, animate);
        ctx.caption('Push the profit line out: its last touch is the corner (20, 60).');
      },
      // 5 · enabling the add-in
      (ctx, animate) => {
        at(ctx, animate, 0, () => {
          ctx.ui.callout({ x: 10, y: 440, w: 504, tone: 'info',
            text: 'Enable once: File › Options › Add-ins › Manage Excel Add-ins › Go › ☑ Solver Add-in.' +
              '<span class="t18-mac">Mac: Tools › Excel Add-ins › ☑ Solver Add-In</span>' });
        });
        ctx.caption('Solver is a free add-in that ships with Excel. Turn it on once.');
      }
    ]
  });
})();
