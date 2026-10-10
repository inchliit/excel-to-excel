/* dev.js — component test slide, shown first only with ?dev. Exercises every XGrid / ui / charts method. */
window.DEV_TRICK = {
  n: 0, id: 'dev', act: 0, title: 'DEV: component check', tagline: 'Every shared helper, one step each.',
  version: 'All', keys: ['Ctrl', 'Alt', 'V'], formula: '=SUMIFS(D2:D7,B2:B7,"L2")', ribbon: 'Data › What-If Analysis › Goal Seek',
  why: 'If this slide looks right forward and backward, the libs are fine.', alt: null, notes: '- dev only',
  stage(ctx) {
    ctx.g = ctx.grid({ x: 20, y: 20, cols: 5, rows: 8, colWidths: [70, 60, 70, 80, 90], title: 'Production',
      data: [['Date', 'Line', 'Shift', 'Defects', 'Yield'], ['Mon', 'L1', 'Day', 6, 0.985], ['Mon', 'L2', 'Night', 9, 0.98],
        ['Tue', 'L2', 'Day', 4, 0.99], ['Tue', 'L1', 'Night', 8, 0.979], ['Wed', 'L2', 'Night', 7, 0.985], ['Wed', 'L3', 'Day', 5, 0.988]],
      formats: { 'E2:E8': '0.0%' } });
    ctx.caption('Initial state: grid only');
  },
  steps: [
    (ctx) => { ctx.g.select('D2:D7'); ctx.g.mark('B2:B7', 'hl-yellow'); ctx.caption('select + mark'); },
    (ctx) => { ctx.g.type('G2', '=SUMIFS(D2:D7,B2:B7,"L2")'); ctx.caption('type (G2 is off-grid: nothing)'); ctx.g.type('D8', '=SUMIFS(D2:D7,B2:B7,"L2")'); },
    (ctx) => { ctx.g.enter('D8', 20, '=SUMIFS(D2:D7,B2:B7,"L2")'); ctx.g.refBox('D2:D7', 0); ctx.g.refBox('B2:B7', 1); ctx.caption('enter + refBox'); },
    (ctx) => { ctx.g.fill('E2', 'E2:E7', [[0.9], [0.91], [0.92], [0.93], [0.94], [0.95]]); ctx.g.mark('A2:A3', 'ants'); ctx.caption('fill + ants'); },
    (ctx) => { ctx.g.spill('A8', [['Thu', 'L3', 'Night']]); ctx.ui.keys(['Ctrl', 'Alt', 'V']); ctx.caption('spill + chord keys'); },
    (ctx) => { ctx.ui.keys(['Alt', 'A', 'V', 'V'], { x: 450, y: 300 }); ctx.ui.ribbon({ tab: 'Data', path: ['What-If Analysis', 'Goal Seek…'], x: 470, y: 20 }); ctx.caption('sequence keys + ribbon'); },
    (ctx) => {
      const d = ctx.ui.dialog({ title: 'Goal Seek', x: 470, y: 70, w: 300,
        body: '<div class="dlg-row">Set cell: <span class="dlg-field">B3</span></div><div class="dlg-row">To value: <span class="dlg-field on">480</span></div><div class="dlg-row"><span class="radio on">Blanks</span> <span class="check on">My table has headers</span></div>' });
      ctx.ui.press(d);
      ctx.ui.callout({ text: '<b>Callout</b> pointing left', x: 470, y: 260, arrow: 'left', tone: 'good' });
      ctx.ui.cursor({ x: 700, y: 200, click: true });
      ctx.ui.tag('tag', { x: 780, y: 20, tone: 'warn' });
      ctx.ui.menu({ items: ['Highlight Cells Rules', 'New Rule…', 'Manage Rules…'], on: 'New Rule…', x: 650, y: 330 });
      ctx.caption('dialog + press + callout + cursor + tag + menu');
    },
    (ctx) => { ctx.el.innerHTML = ''; ctx.charts.pareto({ x: 10, y: 10, w: 440, h: 260, title: 'Pareto', data: [{ label: 'Misalign', value: 142 }, { label: 'Scratch', value: 96 }, { label: 'Burr', value: 51 }, { label: 'Dent', value: 27 }, { label: 'Crack', value: 14 }, { label: 'Porosity', value: 9 }, { label: 'Other', value: 6 }] });
      ctx.charts.bars({ x: 470, y: 10, w: 430, h: 260, title: 'Bars', data: [{ label: 'L1', value: 412 }, { label: 'L2', value: 455 }, { label: 'L3', value: 389 }] }); ctx.caption('pareto + bars'); },
    (ctx) => { ctx.el.innerHTML = '';
      ctx.charts.line({ x: 10, y: 10, w: 440, h: 260, title: 'Line + band + hlines', series: [{ values: [25.01, 24.99, 25.02, 25.08, 25.0, 24.92, 25.03] }], hlines: [{ y: 25.06, label: 'UCL' }, { y: 24.94, label: 'LCL' }], band: { start: 4, lo: [24.97, 24.96, 24.95], hi: [25.03, 25.04, 25.05] }, highlight: [3, 5] });
      const vals = Array.from({ length: 500 }, (_, i) => 39 + 3.08 * Math.sqrt(-2 * Math.log((i + 0.5) / 500)) * Math.cos(2 * Math.PI * ((i * 0.618) % 1)));
      ctx.charts.histogram({ x: 470, y: 10, w: 430, h: 260, title: 'Histogram', values: vals, bins: 24, marker: 42, markerLabel: '42 min', shadeBelow: true });
      const g = ctx.grid({ x: 10, y: 300, cols: 3, rows: 3, colWidths: [60, 60, 140], data: [['Line', 'Mon', 'Trend'], ['L1', 400, ''], ['L4', 380, '']] });
      ctx.charts.sparkline(g.cell('C2'), [400, 410, 405, 420, 415, 430, 428], { high: true, low: true });
      ctx.charts.sparkline(g.cell('C3'), [430, 420, 418, 405, 398, 390, 380], { type: 'column', high: true, low: true });
      ctx.caption('line + histogram + sparklines'); }
  ]
};
