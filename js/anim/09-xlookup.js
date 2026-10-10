/* anim/09-xlookup.js — #09 XLOOKUP (Act 2 · Formulas that think).
   Clicks: VLOOKUP pain → XLOOKUP with ref boxes → left lookup (arrow ←) → P-999 gives #N/A → "Not found". */
extendTrick('xlookup', (function () {
  const S = '.t-slide[data-trick="xlookup"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-xlookup')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-xlookup">' + [
      S + '.xl-card{background:#fff;color:#1f1f1f;border-radius:10px;box-shadow:0 12px 34px rgba(0,0,0,.45);padding:10px 16px 12px;border-left:5px solid #107C41}',
      S + '.xl-card.old{border-left-color:#c62828}',
      S + '.xl-card.old .xl-f{color:#5b6670}',
      S + '.xl-lbl{font:800 12px var(--font);letter-spacing:.1em;text-transform:uppercase;color:#6b7785;margin-bottom:6px}',
      S + '.xl-f{font:600 22px/1.3 var(--mono);white-space:nowrap}',
      S + '.xl-card.anat .xl-f{padding-bottom:22px}',
      S + '.xl-a{position:relative;display:inline-block;font-weight:800}',
      S + '.xl-a i{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;font:700 13px var(--font);font-style:normal;white-space:nowrap}',
      S + '.xl-a.lit{color:#1f1f1f}',
      S + '.xl-a.lit i{color:#5b6670}',
      S + '.xl-a.nf{color:#7a4c00;background:#fff2a8;border-radius:4px}',
      S + '.xl-a.nf i{color:#7a4c00}',
      S + '.xl-bad{color:#c62828;background:#ffe3e3;border-radius:4px;padding:0 2px;font-weight:800}',
      S + '.xl-pains{display:flex;flex-direction:column;gap:9px}',
      S + '.xl-pain{background:#3d1515;border:1px solid #ff6b6b;color:#ffd6d6;border-radius:10px;padding:8px 12px;font:600 17px/1.3 var(--font)}',
      S + '.xl-pain b{color:#fff}',
      S + '.xl-pains.anim .xl-pain{animation:popIn .3s ease-out both}',
      S + '.xl-pains.anim .xl-pain:nth-child(2){animation-delay:.5s}',
      S + '.xl-pains.anim .xl-pain:nth-child(3){animation-delay:1s}',
      S + '.xl-bub{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#5c6b7a;color:#fff;font:800 12px/18px var(--font);text-align:center;z-index:7}',
      S + '.xl-bub.hot{background:#c62828}',
      S + '.xl-bubs.anim .xl-bub{animation:popIn .25s ease-out both;animation-delay:calc(var(--i) * .2s)}',
      S + '.xl-arrow{position:absolute;z-index:7;pointer-events:none}',
      S + '.xl-arrow svg{display:block;overflow:visible}',
      S + '.xl-arrow .halo{fill:none;stroke:#fff;stroke-width:8;stroke-linecap:round;opacity:.9}',
      S + '.xl-arrow .ln{fill:none;stroke:#e8590c;stroke-width:3.5;stroke-linecap:round}',
      S + '.xl-arrow .hd{fill:#e8590c;stroke:#fff;stroke-width:1.5;stroke-linejoin:round}',
      S + '.xl-arrow.anim .ln,' + S + '.xl-arrow.anim .halo{stroke-dasharray:1;stroke-dashoffset:1;animation:xlDraw .7s ease-out forwards}',
      S + '.xl-arrow.anim .hd{animation:fadeIn .3s ease-out .6s both}',
      '@keyframes xlDraw{to{stroke-dashoffset:0}}',
      S + '.xg-cell.xl-err{justify-content:center;color:#c62828;font-weight:700}',
      S + '.xg-cell.xl-hdr{font-weight:700;background:#f7faf8}',
      S + '.ui-callout code{font:700 15px var(--mono);background:rgba(0,0,0,.06);padding:0 4px;border-radius:4px}'
    ].join('\n') + '</style>');
  }

  // ---- data: parts master (Std Time in minutes) ----
  const HEAD = ['Part No', 'Description', 'Std Time (min)', 'Work Center'];
  const PARTS = [
    ['P-1001', 'Motor mount', 6.4, 'Machining'],
    ['P-1012', 'Cover plate', 3.2, 'Press'],
    ['P-1027', 'Weld bracket', 8.5, 'Welding'],
    ['P-1043', 'Gear housing', 12.6, 'Machining'],
    ['P-1058', 'Drive shaft', 9.8, 'Lathe'],
    ['P-1066', 'Hinge pin', 2.4, 'Lathe'],
    ['P-1079', 'Frame rail', 14.2, 'Welding'],
    ['P-1085', 'Pump cover', 5.7, 'Assembly']
  ];
  const F1 = '=XLOOKUP(F2,A2:A9,C2:C9)';
  const F_LEFT = '=XLOOKUP("Weld bracket",B2:B9,A2:A9)';
  const F_NF = '=XLOOKUP(F2,A2:A9,C2:C9,"Not found")';
  const RC = ['#4472C4', '#C0504D', '#9BBB59', '#8064A2'];   // Excel's formula-ref colours, same order as XGrid

  // Our own exact-match lookup: every value on the stage comes from here (not hand-typed).
  function xlookup(key, inCol, outCol, ifNotFound) {
    const row = PARTS.find(p => p[inCol] === key);
    if (row) return row[outCol];
    return ifNotFound === undefined ? '#N/A' : ifNotFound;
  }
  const rowOf = (key, inCol) => PARTS.findIndex(p => p[inCol] === key) + 2;   // sheet row number

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const typeMs = t => t.length * Math.max(18, Math.min(55, 1600 / Math.max(1, t.length)));

  // Type a formula (cosmetic), then commit. Instant replays commit synchronously → same final state.
  function typeThen(ctx, g, ref, text, animate, commit) {
    if (!animate) { commit(); return; }
    g.type(ref, text, true);
    ctx.later(typeMs(text) + 350, commit);
  }
  // Edit an existing formula: insert `ins` between `before` and `after` (as if clicked into the formula bar).
  function editThen(ctx, g, ref, before, ins, after, animate, commit) {
    if (!animate) { commit(); return; }
    const el = g.cell(ref);
    g.select(ref);
    el.classList.remove('num', 'xl-err');
    el.classList.add('editing');
    const show = s => { el.textContent = s; g.formulaBar(s); };
    show(before + after);
    const step = 75;
    for (let i = 1; i <= ins.length; i++) ctx.later(450 + i * step, () => show(before + ins.slice(0, i) + after));
    ctx.later(450 + ins.length * step + 450, commit);
  }

  function clear(ctx) {
    const g = ctx.g;
    g.clearRefs();
    ['hl-yellow', 'hl-green'].forEach(c => g.unmark(c));
    ctx.el.querySelectorAll('.xl-tmp').forEach(e => e.remove());
  }

  // White "zoomed formula bar" card. parts: [{t, c: ref colour idx, lbl, cls}]
  function card(ctx, { title, parts, old = false, animate }) {
    const anat = parts.some(p => p.lbl);
    const html = '<div class="xl-lbl">' + esc(title) + '</div><div class="xl-f">' + parts.map(p => {
      if (p.bad) return '<span class="xl-bad">' + esc(p.t) + '</span>';
      if (!p.lbl && p.c == null && !p.cls) return esc(p.t);
      const style = p.c != null ? ' style="color:' + RC[p.c] + '"' : '';
      const lbl = p.lbl ? '<i' + (p.c != null ? ' style="color:' + RC[p.c] + '"' : '') + '>' + esc(p.lbl) + '</i>' : '';
      return '<span class="xl-a' + (p.cls ? ' ' + p.cls : '') + '"' + style + '>' + esc(p.t) + lbl + '</span>';
    }).join('') + '</div>';
    const d = ctx.box({ x: 20, y: 362, w: 500, cls: 'xl-card xl-tmp' + (old ? ' old' : '') + (anat ? ' anat' : ''), html });
    if (animate) d.style.animation = 'popIn .3s ease-out both';
    return d;
  }
  function note(ctx, text, tone, y = 362) {
    const c = ctx.ui.callout({ text, x: 572, y, w: 300, tone });   // content-box: +33px padding/border
    c.classList.add('xl-tmp');
    return c;
  }

  // Column-number bubbles 1–4 over A–D (VLOOKUP's col_index_num); "3" in red.
  function bubbles(ctx, g, animate) {
    const wrap = document.createElement('div');
    wrap.className = 'xl-bubs xl-tmp' + (animate ? ' anim' : '');
    for (let c = 0; c < 4; c++) {
      const b = g.box(String.fromCharCode(65 + c) + '1');
      const d = document.createElement('div');
      d.className = 'xl-bub' + (c === 2 ? ' hot' : '');
      d.style.left = (b.left + b.width / 2 + 9) + 'px';
      d.style.setProperty('--i', c);
      d.textContent = String(c + 1);
      wrap.appendChild(d);
    }
    g.sheet.appendChild(wrap);
  }

  // Curved arrow from the found description (B) back LEFT to its Part No (A).
  function leftArrow(ctx, g, row, animate) {
    const b = g.box('B' + row), a = g.box('A' + row);
    const x1 = b.left + 50, x2 = a.left + 30, yTop = b.top;
    const left = x2 - 16, top = yTop - 28, w = x1 - left + 16, h = 40;
    const sx = x1 - left, sy = 30, ex = x2 - left, ey = 30, cx = (sx + ex) / 2, cy = -6;
    const ang = Math.atan2(ey - cy, ex - cx), L = 12, W = 7;
    const p = (dx, dy) => (ex - L * Math.cos(ang) + dx).toFixed(1) + ',' + (ey - L * Math.sin(ang) + dy).toFixed(1);
    const head = 'M' + ex + ',' + ey + ' L' + p(W * Math.sin(ang), -W * Math.cos(ang)) + ' L' + p(-W * Math.sin(ang), W * Math.cos(ang)) + ' Z';
    const curve = 'M' + sx + ',' + sy + ' Q' + cx + ',' + cy + ' ' + ex + ',' + ey;
    const d = document.createElement('div');
    d.className = 'xl-arrow xl-tmp' + (animate ? ' anim' : '');
    Object.assign(d.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' });
    d.innerHTML = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<path class="halo" pathLength="1" d="' + curve + '"/><path class="ln" pathLength="1" d="' + curve + '"/><path class="hd" d="' + head + '"/></svg>';
    g.sheet.appendChild(d);
  }

  const ANAT = (findLbl) => [
    { t: '=XLOOKUP(' }, { t: 'F2', c: 0, lbl: findLbl }, { t: ',' }, { t: 'A2:A9', c: 1, lbl: 'look in' }, { t: ',' },
    { t: 'C2:C9', c: 2, lbl: 'return' }];

  return {
    stage(ctx) {
      const g = ctx.g = ctx.grid({
        x: 20, y: 14, cols: 8, rows: 9, colWidths: [80, 124, 124, 104, 16, 84, 140, 160],
        data: [HEAD.concat(['', 'Part No', 'Std Time (min)', ''])].concat(PARTS),
        formats: { 'C2:C9': '0.0', 'G2:G3': '0.0' }
      });
      g.set('F2', 'P-1043');
      g.select('F2');
      ctx.caption('Parts master: Std Time and Work Center for each part number.');
    },
    steps: [
      // 1 · VLOOKUP pain
      (ctx, animate) => {
        const g = ctx.g;
        g.select('G2');
        g.refBox('F2', 0);
        g.refBox('A2:D9', 1);
        bubbles(ctx, g, animate);
        card(ctx, { title: 'The old way: VLOOKUP', old: true, animate,
          parts: [{ t: '=VLOOKUP(F2,A2:D9,' }, { t: '3', bad: true }, { t: ',FALSE)' }] });
        ctx.box({ x: 572, y: 362, w: 328, cls: 'xl-pains xl-tmp' + (animate ? ' anim' : ''),
          html: '<div class="xl-pain">① Count the columns by hand: <b>3</b></div>' +
                '<div class="xl-pain">② Can’t look <b>left</b> of column A</div>' +
                '<div class="xl-pain">③ Missing part → <b>#N/A</b></div>' });
        ctx.caption('VLOOKUP pain: column numbers, can’t look left, #N/A.');
      },
      // 2 · XLOOKUP(F2, A2:A9, C2:C9) with ref boxes → 12.6
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.refBox('F2', 0);
        g.refBox('A2:A9', 1);
        g.refBox('C2:C9', 2);
        card(ctx, { title: 'XLOOKUP: no column number', parts: ANAT('find').concat([{ t: ')' }]), animate });
        typeThen(ctx, g, 'G2', F1, animate, () => {
          const r = rowOf('P-1043', 0);
          g.mark('A' + r, 'hl-yellow');
          g.mark('C' + r, 'hl-green');
          g.enter('G2', xlookup('P-1043', 0, 2), F1);
          g.select('G2');
          note(ctx, 'Finds <b>P-1043</b> in column A, returns its Std Time: <b>' + xlookup('P-1043', 0, 2).toFixed(1) + ' min</b>.', 'good');
        });
        ctx.caption('Say what to find, where to look, and what to return.');
      },
      // 3 · Left lookup: description → Part No (arrow points LEFT)
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        g.refBox('B2:B9', 0);
        g.refBox('A2:A9', 1);
        card(ctx, { title: 'Look left', animate, parts: [
          { t: '=XLOOKUP(' }, { t: '"Weld bracket"', cls: 'lit', lbl: 'find this' }, { t: ',' },
          { t: 'B2:B9', c: 0, lbl: 'look in' }, { t: ',' }, { t: 'A2:A9', c: 1, lbl: '← return' }, { t: ')' }] });
        g.set('G4', 'Part No');
        g.mark('G4', 'xl-hdr');
        typeThen(ctx, g, 'G5', F_LEFT, animate, () => {
          const r = rowOf('Weld bracket', 1);
          g.mark('B' + r, 'hl-yellow');
          g.mark('A' + r, 'hl-green');
          leftArrow(ctx, g, r, animate);
          g.enter('G5', xlookup('Weld bracket', 1, 0), F_LEFT);
          g.select('G5');
          note(ctx, 'The return column sits to the <b>left</b> of the lookup column. VLOOKUP can’t do that.', 'good');
        });
        ctx.caption('Look left: find the description, return its Part No.');
      },
      // 4 · F2 = P-999 → #N/A in red
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        card(ctx, { title: 'Part not in the list', animate, parts: ANAT('P-999').concat([{ t: ')' }]) });
        typeThen(ctx, g, 'F2', 'P-999', animate, () => {
          g.enter('F2', 'P-999');
          g.enter('G2', xlookup('P-999', 0, 2), F1);
          g.mark('G2', 'xl-err');
          g.select('G2');
          note(ctx, '<b>#N/A</b> looks broken, and any SUM that includes it turns into #N/A too.', 'warn');
        });
        ctx.caption('P-999 isn’t in the list, so XLOOKUP returns #N/A.');
      },
      // 5 · add "Not found" (4th argument) → friendly text
      (ctx, animate) => {
        const g = ctx.g;
        clear(ctx);
        card(ctx, { title: '4th argument: if not found', animate,
          parts: ANAT('P-999').concat([{ t: ',' }, { t: '"Not found"', cls: 'nf', lbl: 'if missing' }, { t: ')' }]) });
        editThen(ctx, g, 'G2', '=XLOOKUP(F2,A2:A9,C2:C9', ',"Not found"', ')', animate, () => {
          g.unmark('xl-err');
          g.enter('G2', xlookup('P-999', 0, 2, 'Not found'), F_NF);
          g.mark('G2', 'hl-yellow');
          g.select('G2');
        });
        note(ctx, '<b>Exact match is the default.</b><br>VLOOKUP defaults to approximate: you must add <code>FALSE</code>.', 'info');
        ctx.caption('Add "Not found" as the 4th argument: friendly text, no #N/A.');
      }
    ],
    tryit: {
      sheet: [
        HEAD.concat([null, 'Part No', 'Std Time (min)']),
        PARTS[0].concat([null, 'P-1058'])
      ].concat(PARTS.slice(1)),
      task: 'Part P-1058 is in F2. Use XLOOKUP in G2 to return its Std Time (min) from column C.',
      target: 'G2',
      mode: 'value',
      expected: xlookup('P-1058', 0, 2),   // own lookup → 9.8 (row 6: Drive shaft)
      mustUse: ['XLOOKUP'],
      hint: 'Three parts: what to find (F2), where to look (A2:A9), what to return (C2:C9).',
      answer: '=XLOOKUP(F2,A2:A9,C2:C9)'
    }
  };
})());
