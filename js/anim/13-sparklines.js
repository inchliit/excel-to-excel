/* 13 · Sparklines (Act 3): a chart in every cell. Storyboard: plan appendix.
   Stage: daily output of lines L1–L5 (Mon–Sun) with an empty Trend column I; L4 slides all week. */
(function () {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const LINES = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const OUT = {                                     // units/day; one unique high and low per row (clean markers)
    L1: [452, 461, 448, 470, 457, 466, 459],
    L2: [438, 429, 445, 436, 450, 441, 447],
    L3: [405, 418, 412, 421, 409, 425, 431],
    L4: [468, 455, 447, 430, 418, 401, 386],        // the slide: down every single day
    L5: [476, 470, 482, 468, 479, 473, 485]
  };
  const GX = 10, GY = 16, FS = 17;                  // fontSize 17 → 34 px rows
  const COLW = [58, 56, 56, 56, 56, 56, 56, 56, 152];
  const ROW_TOP = r => GY + 1 + 32 + 24 + (r - 1) * Math.round(FS * 2);   // stage y of sheet row r
  const LOW = { x: GX, y: 292 };                    // ribbon / dialog area under the grid

  const P = '.t-slide[data-trick="sparklines"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-sparklines')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-sparklines">' +
      P + '.t13-dlg .dlg-body{padding:12px 16px}' +
      P + '.t13-sub{font-weight:600;margin:6px 0 2px}' +
      P + '.t13-ind{padding-left:18px}' +
      P + '.t13-ind .t13-l{display:inline-block;width:118px}' +
      P + '.t13-dlg .dlg-field{font-size:15px;min-width:150px}' +
      P + '.ui-dialog.anim.t13-late{animation:popIn .3s ease-out 1s both}' +
      P + '.t13-rib{background:#fff;color:#1f1f1f;border:1px solid #b8bec4;border-radius:8px;box-shadow:0 14px 40px rgba(0,0,0,.45);font:14px "Segoe UI",system-ui,sans-serif;overflow:hidden}' +
      P + '.t13-rib.anim{animation:popIn .3s ease-out both}' +
      P + '.t13-tabs{display:flex;gap:2px;padding:6px 10px 0;background:#f3f3f3;border-bottom:1px solid #d4d4d4}' +
      P + '.t13-tabs span{padding:5px 12px;color:#555}' +
      P + '.t13-tabs span.on{background:#fff;color:#0e6b39;font-weight:700;border:1px solid #d4d4d4;border-bottom:2px solid #107C41;border-radius:4px 4px 0 0;margin-bottom:-1px}' +
      P + '.t13-groups{display:flex;padding:10px 4px 6px}' +
      P + '.t13-grp{display:flex;flex-direction:column;justify-content:space-between;padding:0 14px;border-right:1px solid #e1e1e1}' +
      P + '.t13-grp:last-child{border-right:0}' +
      P + '.t13-type{display:flex;gap:6px}' +
      P + '.t13-tb{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 8px;border:1px solid transparent;border-radius:4px;min-width:60px;transition:background .3s,border-color .3s}' +
      P + '.t13-tb svg{width:30px;height:20px}' +
      P + '.t13-tb polyline{fill:none;stroke:#2f6fd6;stroke-width:2.2}' +
      P + '.t13-tb rect{fill:#2f6fd6}' +
      P + '.t13-tb.on{background:#d3f0e0;border-color:#107C41;font-weight:700}' +
      P + '.t13-show{display:grid;grid-template-rows:repeat(3,auto);grid-auto-flow:column;gap:5px 22px}' +
      P + '.t13-cb{display:flex;align-items:center;gap:7px;white-space:nowrap;border-radius:4px;padding:0 4px}' +
      P + '.t13-cb::before{content:"";width:13px;height:13px;border:1.5px solid #555;border-radius:2px;box-sizing:border-box;flex:none}' +
      P + '.t13-cb.on{font-weight:700}' +
      P + '.t13-cb.on::before{background:#107C41;border-color:#107C41;box-shadow:inset 0 0 0 2px #fff}' +
      P + '.t13-gl{text-align:center;color:#666;font-size:12.5px;margin-top:8px}' +
      P + '.t13-flash{animation:t13-flash 1.2s ease-out .25s both}' +
      P + '.spark.t13-wipe{animation:t13-wipe .9s ease-out .55s both}' +
      P + '.spark.t13-wipe .ln{stroke-dasharray:none;stroke-dashoffset:0;animation:none}' +
      P + '.spark ellipse{transform-box:fill-box;transform-origin:center}' +
      P + '.spark ellipse.t13-pop{animation:t13-pop .5s ease-out .35s both}' +
      '@keyframes t13-flash{0%,100%{background:transparent}25%,60%{background:#fff2a8}}' +
      '@keyframes t13-pop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.9)}100%{transform:none}}' +
      '@keyframes t13-out{to{opacity:0;transform:scale(.96)}}' +
      '@keyframes t13-wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}' +
      '</style>');
  }

  const DLG_BODY =
    '<div class="t13-sub">Choose the data that you want</div>' +
    '<div class="dlg-row t13-ind"><span class="t13-l">Data Range:</span><span class="dlg-field">B2:H6</span></div>' +
    '<div class="t13-sub">Choose where you want the sparklines to be placed</div>' +
    '<div class="dlg-row t13-ind"><span class="t13-l">Location Range:</span><span class="dlg-field on">$I$2:$I$6</span></div>';

  const RIBBON =
    '<div class="t13-tabs"><span>Home</span><span>Insert</span><span>Data</span><span>View</span><span class="on">Sparkline</span></div>' +
    '<div class="t13-groups">' +
    '<div class="t13-grp"><div class="t13-type">' +
    '<span class="t13-tb on" data-t="line"><svg viewBox="0 0 30 20"><polyline points="2,15 9,7 16,11 28,3"/></svg>Line</span>' +
    '<span class="t13-tb" data-t="column"><svg viewBox="0 0 30 20"><rect x="3" y="9" width="6" height="10"/><rect x="12" y="3" width="6" height="16"/><rect x="21" y="7" width="6" height="12"/></svg>Column</span>' +
    '<span class="t13-tb" data-t="winloss"><svg viewBox="0 0 30 20"><rect x="3" y="3" width="6" height="7"/><rect x="12" y="10" width="6" height="7"/><rect x="21" y="3" width="6" height="7"/></svg>Win/Loss</span>' +
    '</div><div class="t13-gl">Type</div></div>' +
    '<div class="t13-grp"><div class="t13-show">' +
    ['High Point', 'Low Point', 'Negative Points', 'First Point', 'Last Point', 'Markers']
      .map(k => '<span class="t13-cb" data-k="' + k + '">' + k + '</span>').join('') +
    '</div><div class="t13-gl">Show</div></div></div>';

  function drawSparks(ctx, opts, animate) {
    LINES.forEach((ln, r) => ctx.charts.sparkline(ctx.g.cell('I' + (r + 2)), OUT[ln], Object.assign({}, opts, { animate })));
  }

  extendTrick('sparklines', {
    stage(ctx) {
      ctx.g = ctx.grid({ x: GX, y: GY, cols: 9, rows: 6, fontSize: FS, colWidths: COLW,
        data: [['Line'].concat(DAYS, ['Trend'])].concat(LINES.map(l => [l].concat(OUT[l]))) });
      ctx.caption('Daily output (units) of five lines over one week');
    },
    steps: [
      // 1 · the question
      (ctx, animate) => {
        ctx.tag = ctx.ui.tag('35 numbers', { x: 680, y: ROW_TOP(2) + 6, tone: 'info' });
        if (animate) ctx.g.flash('B2:H6');
        ctx.caption('35 numbers. Which line is sliding?');
      },
      // 2 · select B2:H6 › Insert › Sparklines › Line → Create Sparklines dialog
      (ctx, animate) => {
        if (ctx.tag) { ctx.tag.remove(); ctx.tag = null; }
        ctx.g.select('B2:H6');
        ctx.g.mark('I2:I6', 'ants');
        ctx.rb = ctx.ui.ribbon({ tab: 'Insert', path: ['Sparklines', 'Line'], x: 480, y: LOW.y + 6 });
        ctx.dlg = ctx.ui.dialog({ title: 'Create Sparklines', body: DLG_BODY, x: LOW.x, y: LOW.y, w: 450 });
        ctx.dlg.classList.add('t13-dlg');
        if (animate) ctx.dlg.classList.add('t13-late');
        ctx.caption('Select B2:H6 › Insert › Sparklines › Line. Location: I2:I6.');
      },
      // 3 · OK → one sparkline per row
      (ctx, animate) => {
        const d = ctx.dlg;
        ctx.dlg = null;
        if (animate) {
          ctx.ui.press(d, 'OK', true);
          d.style.animation = 't13-out .3s ease-in .45s both';
          ctx.later(800, () => d.remove());
        } else d.remove();
        if (ctx.rb) { ctx.rb.remove(); ctx.rb = null; }
        ctx.g.unmark('ants');
        ctx.g.select('I2:I6');
        drawSparks(ctx, { type: 'line' }, animate);
        if (animate) ctx.g.el.querySelectorAll('svg.spark').forEach(sv => sv.classList.add('t13-wipe'));   // clean left→right reveal
        ctx.caption('OK: a mini line chart in every row, right next to its numbers.');
      },
      // 4 · Sparkline tab › Show › High Point + Low Point
      (ctx, animate) => {
        ctx.rib = ctx.box({ x: LOW.x, y: LOW.y, w: 540, cls: 't13-rib' + (animate ? ' anim' : ''), html: RIBBON });
        ['High Point', 'Low Point'].forEach(k => {
          const cb = ctx.rib.querySelector('[data-k="' + k + '"]');
          cb.classList.add('on');
          if (animate) cb.classList.add('t13-flash');
        });
        drawSparks(ctx, { type: 'line', high: true, low: true }, false);
        if (animate) ctx.g.el.querySelectorAll('.spark ellipse').forEach(e => e.classList.add('t13-pop'));
        ctx.caption('Sparkline › Show › High Point + Low Point: best and worst day.');
      },
      // 5 · Sparkline tab › Type › Column
      (ctx, animate) => {
        ctx.rib.querySelectorAll('.t13-tb').forEach(b => b.classList.toggle('on', b.dataset.t === 'column'));
        if (animate) ctx.rib.querySelector('[data-t="column"]').classList.add('t13-flash');
        drawSparks(ctx, { type: 'column', high: true, low: true }, animate);
        ctx.caption('Sparkline › Type › Column: the same week as tiny bars.');
      },
      // 6 · read it: L4
      (ctx) => {
        ctx.g.mark('A5:H5', 'hl-yellow');
        ctx.g.refBox('A5:I5', 1);
        ctx.ui.callout({ text: 'Spot it in a second — prints with the report.', x: 672, y: ROW_TOP(5) - 6, w: 204, arrow: 'left', tone: 'warn' });
        ctx.caption('L4 drops every day: 468 on Monday, 386 on Sunday.');
      }
    ]
  });
})();
