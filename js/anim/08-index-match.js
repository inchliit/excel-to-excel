/* anim/08-index-match.js — #08 INDEX + MATCH two-way lookup (Act 2). Storyboard: plan appendix, one step per click. */
(function () {
  const ID = 'index-match';
  const S = '.t-slide[data-trick="' + ID + '"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-' + ID)) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-' + ID + '">' + `
${S}.t08-scan{position:absolute;z-index:7;pointer-events:none;box-sizing:border-box;border:3px solid #f08c00;background:rgba(255,209,102,.28);border-radius:3px;transition:left .28s ease,top .28s ease}
${S}.t08-badge{position:absolute;z-index:8;width:20px;height:20px;border-radius:50%;background:#e9ecef;color:#495057;font:700 12px var(--font);display:flex;align-items:center;justify-content:center;pointer-events:none}
${S}.t08-bubble{position:absolute;z-index:9;width:28px;height:28px;border-radius:50%;background:#f08c00;color:#fff;font:800 16px var(--font);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none}
${S}.t08-bubble.anim{animation:t08pop .45s cubic-bezier(.2,1.6,.4,1) both}
@keyframes t08pop{from{transform:scale(0)}}
@keyframes t08popx{from{transform:translateX(-50%) scale(0)}to{transform:translateX(-50%) scale(1)}}
${S}.xg-cell.t08-cross{background:#dbe9ff}
${S}.xg-cell.t08-hit{background:#ffd166;font-weight:800;box-shadow:inset 0 0 0 2px #e67700}
${S}.xg-cell.t08-hit.t08-pulse{animation:t08hit .5s ease-in-out 3}
@keyframes t08hit{50%{background:#ffb703}}
${S}.t08-lens{box-sizing:border-box;background:#fff;color:#1f1f1f;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.5);padding:14px 18px 12px}
${S}.t08-lens .ln{font:600 23px var(--mono);white-space:pre;line-height:1.35}
${S}.t08-lens .p{position:relative;display:inline-block;border-radius:6px;transition:opacity .3s,background .3s}
${S}.t08-lens .p.fade{opacity:.28}
${S}.t08-lens .p.hi{background:#fff2a8;box-shadow:0 0 0 3px #fff2a8}
${S}.t08-lens .rf{font-weight:800}
${S}.t08-lens .res{position:absolute;left:50%;top:100%;margin-top:6px;transform:translateX(-50%);font:800 16px var(--font);font-style:normal;color:#fff;background:#f08c00;border-radius:999px;padding:2px 12px;white-space:nowrap}
${S}.t08-lens .res.anim{animation:t08popx .45s cubic-bezier(.2,1.6,.4,1) both}
${S}.t08-lens .red{margin-top:44px;font:600 21px var(--mono);color:#333;white-space:pre}
${S}.t08-lens .red b{color:#0e6b39;font-size:25px}
${S}.t08-lens .red.anim{animation:popIn .3s ease-out both}
${S}.t08-lens .red .lbl{font:600 14px var(--font);color:#777;margin-left:14px}
${S}.t08-vl{box-sizing:border-box;background:#fff;color:#1f1f1f;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.5);padding:16px 18px;font:600 23px var(--mono);white-space:pre}
${S}.t08-vl b.bad{display:inline-block;color:#c62828;border:3px solid #e03131;border-radius:50%;width:36px;height:36px;line-height:30px;text-align:center;box-sizing:border-box}
${S}.t08-vl small{display:block;margin-top:8px;font:600 14px var(--font);color:#777}
` + '</style>');
  }

  // ---- data: capacity matrix (units/shift), machines × shifts ----
  const MACH = ['M-101', 'M-102', 'M-103', 'M-104', 'M-105', 'M-106'];
  const SHIFT = ['Day', 'Swing', 'Night'];
  const CAP = [[420, 405, 360], [380, 352, 318], [455, 437, 398], [312, 296, 274], [498, 471, 446], [350, 333, 301]];
  const SC = ['B', 'C', 'D'];
  const look = (m, s) => CAP[MACH.indexOf(m)][SHIFT.indexOf(s)];   // plain-JS two-way lookup
  const F = '=INDEX(B2:D7,MATCH(G2,A2:A7,0),MATCH(G3,B1:D1,0))';
  const FA = '=INDEX(B2:D7,MATCH(G2,A2:A7,0),';
  const RN = MACH.indexOf('M-104') + 1;            // 4
  const CN = SHIFT.indexOf('Night') + 1;           // 3
  const CD = SHIFT.indexOf('Day') + 1;             // 1
  const V1 = look('M-104', 'Night');               // 274
  const V2 = look('M-104', 'Day');                 // 312

  // ---- helpers ----
  const GX = 12, GY = 10;
  const RC = ['#4472C4', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'];
  const rm = el => { if (el && el.remove) el.remove(); };
  function beats(ctx, animate, list) {
    let t = 0;
    list.forEach(([d, fn]) => { t += animate ? d : 0; if (t === 0) fn(); else ctx.later(t, fn); });
  }
  function typeInto(ctx, g, ref, from, to, animate) {
    const el = g.cell(ref);
    g.select(ref);
    el.classList.add('editing');
    el.classList.remove('num');
    if (!animate) { el.textContent = to; g.formulaBar(to); fitSel(g, ref, to); return 0; }
    el.textContent = from;
    g.formulaBar(from);
    fitSel(g, ref, from);
    for (let i = from.length + 1; i <= to.length; i++) {
      const s = to.slice(0, i);
      ctx.later((i - from.length) * 36, () => { el.textContent = s; g.formulaBar(s); fitSel(g, ref, s); });
    }
    return (to.length - from.length) * 36;
  }
  // Excel's in-cell editor grows to the right over empty cells: stretch the selection box to the typed text
  // (monospace .9em of 15px ≈ 8.1px per char; select() resets it to the cell on Enter)
  function fitSel(g, ref, text) { g.selEl.style.width = Math.max(g.box(ref).width, Math.ceil(text.length * 8.2) + 14) + 'px'; }
  // small circle at the right edge of a cell (inside the sheet, so it follows the grid geometry)
  function dot(g, ref, cls, text, size, animate) {
    const b = g.box(ref);
    const d = document.createElement('div');
    d.className = cls + (animate ? ' anim' : '');
    d.textContent = text;
    d.style.left = (b.left + b.width - size - 4) + 'px';
    d.style.top = (b.top + (b.height - size) / 2) + 'px';
    g.sheet.appendChild(d);
    return d;
  }
  const SCAN_MS = 380;
  function scan(ctx, g, refs, animate) {
    if (!animate) return;
    const box = g.overlay(refs[0], 't08-scan');
    refs.forEach((r, k) => {
      if (k) ctx.later(k * SCAN_MS, () => { const b = g.box(r); box.style.left = b.left + 'px'; box.style.top = b.top + 'px'; });
    });
    ctx.later(refs.length * SCAN_MS + 150, () => box.remove());
  }
  function cross(g, rowN, colN, animate) {
    g.unmark('t08-cross'); g.unmark('t08-hit'); g.unmark('t08-pulse');
    const row = rowN + 1, col = SC[colN - 1];
    g.mark('B' + row + ':D' + row, 't08-cross');
    g.mark(col + '2:' + col + '7', 't08-cross');
    g.mark(col + row, 't08-hit');
    if (animate) g.mark(col + row, 't08-pulse');
  }
  // the formula, piece by piece: st = { hi, fade[], r, c, val, anim }
  function lens(ctx, st, animate) {
    rm(ctx.t08lens);
    const Rf = (t, i) => '<span class="rf" style="color:' + RC[i] + '">' + t + '</span>';
    const cls = k => 'p' + (st.hi === k ? ' hi' : '') + ((st.fade || []).includes(k) ? ' fade' : '');
    const chip = (v, key, lbl) => (v == null ? '' : '<i class="res' + (animate && st.anim === key ? ' anim' : '') + '">' + lbl + ' ' + v + '</i>');
    let html = '<div class="ln">' +
      '<span class="' + cls('ix') + '">=INDEX(' + Rf('B2:D7', 0) + ', </span>' +
      '<span class="' + cls('m1') + '">MATCH(' + Rf('G2', 1) + ', ' + Rf('A2:A7', 2) + ', 0)' + chip(st.r, 'r', 'row') + '</span>' +
      '<span class="' + cls('ix') + '">, </span>' +
      '<span class="' + cls('m2') + '">MATCH(' + Rf('G3', 3) + ', ' + Rf('B1:D1', 4) + ', 0)' + chip(st.c, 'c', 'column') + '</span>' +
      '<span class="' + cls('ix') + '">)</span></div>';
    html += st.val == null ? '<div class="red"> </div>' :
      '<div class="red' + (animate && st.anim === 'val' ? ' anim' : '') + '">= INDEX(' + Rf('B2:D7', 0) + ', ' + st.r + ', ' + st.c + ') = <b>' + st.val + '</b><span class="lbl">row ' + st.r + ', column ' + st.c + ' of the matrix</span></div>';
    ctx.t08lens = ctx.box({ x: GX, y: 322, w: 888, cls: 't08-lens', html });
  }

  extendTrick(ID, {
    stage(ctx) {
      const g = ctx.g = ctx.grid({ x: GX, y: GY, cols: 9, rows: 7, colWidths: [80, 80, 80, 80, 18, 90, 84, 178, 160], title: 'Capacity (units/shift)',
        data: [['Machine'].concat(SHIFT)].concat(MACH.map((m, i) => [m].concat(CAP[i]))) });
      g.setRange('F2', [['Machine', 'M-104'], ['Shift', 'Night'], ['Capacity', '']]);
      g.mark('F2:F4', 'bold');
      ctx.caption('Capacity matrix: 6 machines × 3 shifts. Inputs in G2 and G3.');
    },
    steps: [
      // 1 · why not VLOOKUP
      (ctx) => {
        const g = ctx.g;
        g.mark('G2:G3', 'hl-yellow');
        ctx.t08tag = ctx.ui.tag('← two inputs: machine and shift', { x: 572, y: 112, tone: 'info' });
        ctx.t08vl = ctx.box({ x: GX, y: 322, w: 480, cls: 't08-vl',
          html: '=VLOOKUP(G2, A2:D7, <b class="bad">4</b>, FALSE)<small>Night = 4th column of A:D, counted and typed by hand</small>' });
        ctx.t08c = ctx.ui.callout({ x: 512, y: 330, w: 356, tone: 'warn', arrow: 'left',
          text: 'Ask for Day and the 4 must become 2. Insert a column and it silently points at the wrong one.' });
        ctx.caption('VLOOKUP needs a hard-coded column number. Two inputs? Two MATCHes.');
      },
      // 2 · MATCH(G2,A2:A7,0) scans down → 4
      (ctx, animate) => {
        const g = ctx.g;
        [ctx.t08vl, ctx.t08c, ctx.t08tag].forEach(rm);
        ctx.caption('MATCH(G2, A2:A7, 0) walks down the list: M-104 is item ' + RN + '.');
        const d = typeInto(ctx, g, 'G4', '', FA, animate);
        lens(ctx, { hi: 'm1', fade: ['ix', 'm2'] }, animate);
        beats(ctx, animate, [
          [d + 100, () => {
            g.refBox('B2:D7', 0); g.refBox('G2', 1); g.refBox('A2:A7', 2);
            MACH.forEach((m, k) => dot(g, 'A' + (k + 2), 't08-badge', String(k + 1), 20, false));
          }],
          [250, () => scan(ctx, g, MACH.slice(0, RN).map((m, k) => 'A' + (k + 2)), animate)],
          [RN * SCAN_MS, () => {
            g.mark('A' + (RN + 1), 'hl-green');
            ctx.t08b1 = dot(g, 'A' + (RN + 1), 't08-bubble', String(RN), 28, animate);
            lens(ctx, { hi: 'm1', fade: ['ix', 'm2'], r: RN, anim: 'r' }, animate);
          }]
        ]);
      },
      // 3 · MATCH(G3,B1:D1,0) scans across → 3
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('MATCH(G3, B1:D1, 0) walks across the headers: Night is column ' + CN + '.');
        const d = typeInto(ctx, g, 'G4', FA, F, animate);
        lens(ctx, { hi: 'm2', fade: ['ix'], r: RN }, animate);
        beats(ctx, animate, [
          [d + 100, () => {
            g.refBox('G3', 3); g.refBox('B1:D1', 4);
            SHIFT.forEach((s, k) => dot(g, SC[k] + '1', 't08-badge', String(k + 1), 20, false));
          }],
          [250, () => scan(ctx, g, SC.slice(0, CN).map(c => c + '1'), animate)],
          [CN * SCAN_MS, () => {
            g.mark(SC[CN - 1] + '1', 'hl-green');
            ctx.t08b2 = dot(g, SC[CN - 1] + '1', 't08-bubble', String(CN), 28, animate);
            lens(ctx, { hi: 'm2', fade: ['ix'], r: RN, c: CN, anim: 'c' }, animate);
          }]
        ]);
      },
      // 4 · INDEX(B2:D7,4,3) crosshair → G4
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('INDEX(B2:D7, ' + RN + ', ' + CN + '): row ' + RN + ', column ' + CN + ' of the matrix → ' + V1 + '.');
        beats(ctx, animate, [
          [0, () => {
            g.clearRefs(); g.refBox('B2:D7', 0);
            cross(g, RN, CN, animate);
            lens(ctx, { hi: 'ix', r: RN, c: CN }, animate);
          }],
          [900, () => {
            g.clearRefs();
            g.enter('G4', V1, F);
            g.select('G4');
            lens(ctx, { hi: 'ix', r: RN, c: CN, val: V1, anim: 'val' }, animate);
          }]
        ]);
      },
      // 5 · change the input → recompute
      (ctx, animate) => {
        const g = ctx.g;
        ctx.caption('G3 = Day: MATCH gives ' + CD + ', INDEX jumps to ' + V2 + '. Same formula.');
        const d = typeInto(ctx, g, 'G3', '', 'Day', animate);
        beats(ctx, animate, [
          [d + 350, () => {
            g.enter('G3', 'Day');
            g.unmark('hl-green', SC[CN - 1] + '1');
            rm(ctx.t08b2);
            g.mark(SC[CD - 1] + '1', 'hl-green');
            ctx.t08b2 = dot(g, SC[CD - 1] + '1', 't08-bubble', String(CD), 28, animate);
            cross(g, RN, CD, animate);
            lens(ctx, { hi: 'm2', r: RN, c: CD, val: V2, anim: 'c' }, animate);
          }],
          [600, () => {
            g.enter('G4', V2, F);
            g.select('G4');
            ctx.ui.callout({ x: GX, y: 462, w: 640, tone: 'info',
              text: '0 = exact match, always.<br><span style="font-weight:500">Leave it out and MATCH assumes a sorted list: wrong row, no error.</span>' });
          }]
        ]);
      }
    ],
    // expected: plain JS lookup in CAP: row M-105 (5th), column Swing (2nd) → 471 (checked by hand)
    tryit: {
      sheet: [['Machine'].concat(SHIFT)].concat(MACH.map((m, i) => [m].concat(CAP[i])))
        .map((row, r) => (r >= 1 && r <= 3 ? row.concat([null], [['Machine', 'M-105'], ['Shift', 'Swing'], ['Capacity']][r - 1]) : row)),
      task: 'Inputs are set: machine M-105 in G2, shift Swing in G3. In G4, return its capacity with INDEX and two MATCHes that point at G2 and G3.',
      target: 'G4',
      mode: 'value',
      expected: look('M-105', 'Swing'),
      mustUse: ['INDEX', 'MATCH'],
      hint: 'INDEX(B2:D7, row, column). Row = MATCH(G2, A2:A7, 0); column = MATCH(G3, B1:D1, 0). Always end MATCH with 0.',
      answer: '=INDEX(B2:D7,MATCH(G2,A2:A7,0),MATCH(G3,B1:D1,0))'
    }
  });
})();
