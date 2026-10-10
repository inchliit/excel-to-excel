/* 16 · Goal Seek (Act 4): work backwards from 480 units/day to the cycle time (takt). Storyboard: plan appendix. */
(function () {
  const P = '.t-slide[data-trick="goal-seek"] ';
  if (typeof document !== 'undefined' && !document.getElementById('css-goal-seek')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="css-goal-seek">' +
      P + '.t16-dlg{font-size:17px}' +
      P + '.t16-dlg .dlg-body{padding:14px 18px}' +
      P + '.t16-dlg .dlg-row{margin:9px 0}' +
      P + '.t16-dlg .t16-l{display:inline-block;width:150px}' +
      P + '.t16-dlg .dlg-field{font-size:17px;font-weight:700;min-width:160px}' +
      P + '.t16-dlg.anim .t16-v{animation:t16-in .3s ease-out both;animation-delay:var(--d,0s)}' +
      P + '.t16-out{animation:t16-out .2s ease-in .25s forwards!important}' +
      P + '.t16-st{display:flex;gap:16px;align-items:flex-start}' +
      P + '.t16-st .t16-txt{flex:1;line-height:1.45}' +
      P + '.t16-side{display:flex;flex-direction:column;gap:6px}' +
      P + '.t16-side span{border:1px solid #cfcfcf;border-radius:4px;padding:3px 12px;color:#a3a3a3;text-align:center;min-width:66px;font-size:15px}' +
      P + '.t16-kv{display:grid;grid-template-columns:130px auto;margin-top:12px;row-gap:4px}' +
      P + '.t16-kv b{font-family:var(--mono)}' +
      P + '.t16-gauge{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 16px 30px;color:var(--ink)}' +
      P + '.t16-gh{display:flex;justify-content:space-between;align-items:baseline;font-size:17px;font-weight:600;margin-bottom:10px}' +
      P + '.t16-gh b{font:800 26px var(--font);color:var(--accent);font-variant-numeric:tabular-nums}' +
      P + '.t16-gh b small{font-size:16px;color:var(--muted);font-weight:600}' +
      P + '.t16-track{position:relative;height:18px;border-radius:9px;background:#0b1218;border:1px solid var(--line)}' +
      P + '.t16-fill{position:absolute;left:0;top:0;bottom:0;border-radius:9px;background:var(--accent);transition:width .3s ease,background .3s}' +
      P + '.t16-tgt{position:absolute;top:-7px;bottom:-7px;width:3px;margin-left:-1px;background:#fff;border-radius:2px}' +
      P + '.t16-tgt em{position:absolute;top:34px;left:50%;transform:translateX(-50%);font-style:normal;font-size:14px;font-weight:700;color:#fff;white-space:nowrap}' +
      P + '.t16-gauge.hit .t16-gh b{color:var(--good)}' +
      P + '.t16-gauge.hit .t16-fill{background:var(--good)}' +
      P + '.t16-takt{background:var(--panel);border:1px solid var(--line);border-left:5px solid var(--accent);border-radius:10px;padding:12px 16px;font-size:17px;line-height:1.5;color:var(--ink)}' +
      P + '.t16-takt b{font:800 22px var(--mono);color:#fff}' +
      P + '.t16-takt span{color:var(--muted);font-size:16px}' +
      P + '.t16-takt.anim{animation:t16-in .4s ease-out .45s both}' +
      '@keyframes t16-in{from{opacity:0;transform:translateY(6px)}}' +
      '@keyframes t16-out{to{opacity:0;transform:scale(.96)}}' +
      '</style>');
  }

  const AVAIL = 27000;          // 450 min × 60 s
  const SCALE = 520;            // gauge full width = 520 units/day
  const TARGET = 480;

  // run fn now on replay, after `ms` when the step animates (cosmetic choreography only)
  const at = (ctx, animate, ms, fn) => (animate ? ctx.later(ms, fn) : fn());

  function dismiss(ctx, el, animate) {
    if (!el || !el.isConnected) return;
    if (!animate) { el.remove(); return; }
    ctx.ui.press(el, null, true);
    el.classList.add('t16-out');
    ctx.later(450, () => el.remove());
  }

  function setGauge(el, v) {
    el.querySelector('.t16-gv').innerHTML = v.toFixed(1) + ' <small>/ ' + TARGET + '</small>';
    el.querySelector('.t16-fill').style.width = (Math.min(v, SCALE) / SCALE * 100).toFixed(2) + '%';
    el.classList.toggle('hit', v >= TARGET - 0.05);
  }

  function setCycle(ctx, ct) {
    const v = AVAIL / ct;
    ctx.g.set('B2', ct);
    ctx.g.set('B3', { v, f: '=B1/B2' });
    setGauge(ctx.gauge, v);
  }

  function field(label, val, d, color, on) {
    return '<div class="dlg-row"><span class="t16-l">' + label + '</span><span class="dlg-field t16-v' + (on ? ' on' : '') +
      '" style="--d:' + d + 's' + (color ? ';color:' + color : '') + '">' + val + '</span></div>';
  }

  extendTrick('goal-seek', {
    stage(ctx) {
      ctx.g = ctx.grid({
        x: 24, y: 108, cols: 2, rows: 3, header: false, fontSize: 20, colWidths: [230, 120],
        data: [['Available time (s)', AVAIL], ['Cycle time (s)', 62], ['Units/day', { v: AVAIL / 62, f: '=B1/B2' }]],
        formats: { B1: '#,##0', B3: '0.0' }
      });
      ctx.g.select('B3');
      ctx.gauge = ctx.box({ x: 24, y: 330, w: 388, cls: 't16-gauge',
        html: '<div class="t16-gh"><span>Units per day</span><b class="t16-gv"></b></div>' +
          '<div class="t16-track"><i class="t16-fill"></i><i class="t16-tgt" style="left:' + (TARGET / SCALE * 100).toFixed(2) + '%"><em>target ' + TARGET + '</em></i></div>' });
      setGauge(ctx.gauge, AVAIL / 62);
      ctx.caption('450 min × 60 = 27,000 s. At 62 s per unit: 435.5 units a day.');
    },
    steps: [
      // 1 · the question → Data › What-If Analysis › Goal Seek dialog
      (ctx, animate) => {
        const g = ctx.g;
        g.select('B3');
        g.refBox('B3', 0);
        g.refBox('B2', 1);
        ctx.rb = ctx.ui.ribbon({ tab: 'Data', path: ['What-If Analysis', 'Goal Seek…'], x: 470, y: 46 });
        ctx.dlg = ctx.ui.dialog({ title: 'Goal Seek', x: 470, y: 108, w: 390, buttons: ['OK', 'Cancel'],
          body: field('Set cell:', 'B3', 1.3, '#4472C4') + field('To value:', '480', 1.6) + field('By changing cell:', 'B2', 1.9, '#C0504D', true) });
        ctx.dlg.classList.add('t16-dlg');
        if (animate) ctx.dlg.style.animationDelay = '.95s';
        ctx.caption('Need 480 units/day. What cycle time?');
      },
      // 2 · OK → B2 walks 62 → 58.9 → 57.1 → 56.25, B3 → 480, Goal Seek Status
      (ctx, animate) => {
        const g = ctx.g;
        if (ctx.rb) ctx.rb.remove();
        g.clearRefs();
        dismiss(ctx, ctx.dlg, animate);
        setCycle(ctx, 56.25);                       // final state: B2 = 56.25, B3 = 480
        g.select('B3');
        ctx.st = ctx.ui.dialog({ title: 'Goal Seek Status', x: 470, y: 108, w: 390, buttons: ['OK', 'Cancel'],
          body: '<div class="t16-st"><div class="t16-txt">Goal Seeking with Cell B3<br>found a solution.' +
            '<div class="t16-kv"><span>Target value:</span><b>480</b><span>Current value:</span><b>480.0</b></div></div>' +
            '<div class="t16-side"><span>Step</span><span>Pause</span></div></div>' });
        ctx.st.classList.add('t16-dlg');
        if (animate) {                              // cosmetic: show the search ticking down
          const frames = [62, 58.9, 57.1, 56.25];
          setCycle(ctx, frames[0]);
          frames.slice(1).forEach((ct, k) => ctx.later(600 + 420 * k, () => { setCycle(ctx, ct); g.flash('B2:B3'); }));
          ctx.st.style.animationDelay = '1.95s';
        }
        ctx.caption('Goal Seek tries cycle times until B3 = 480: B2 = 56.25 s.');
      },
      // 3 · takt time callout
      (ctx, animate) => {
        const g = ctx.g;
        dismiss(ctx, ctx.st, animate);
        g.mark('B2', 'hl-green');
        g.select('B2');
        at(ctx, animate, 300, () => {
          ctx.ui.callout({ x: 470, y: 108, w: 400, tone: 'good',
            text: '<b>56.25 s = takt time.</b><br>One input, one target. Several inputs + limits → Solver.' });
          ctx.box({ x: 470, y: 236, w: 400, cls: 't16-takt' + (animate ? ' anim' : ''),
            html: 'Takt = available time ÷ demand<br><b>27,000 ÷ 480 = 56.25 s</b><br><span>vs 62 s today: cut 5.75 s per unit (−9.3%)</span>' });
        });
        ctx.caption('56.25 s is the takt time: 27,000 s ÷ 480 units.');
      }
    ]
  });
})();
