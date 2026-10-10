registerTrick({
  n: 1, id: 'flash-fill', act: 1,
  title: 'Flash Fill',
  tagline: 'Split messy codes by typing ONE example',
  version: 'All',
  keys: ['Ctrl', 'E'],
  formula: null,
  ribbon: 'Data › Flash Fill',
  why: 'Machine and MES exports cram line, operator and shift into one code; split them in seconds so you can sort and pivot by line and shift.',
  alt: null,
  notes: `- Hook: the machine export gives you codes like L2-OP0423-NIGHT, but you need Line, Operator and Shift in separate columns. Fine by hand for 8 rows. Not for 8,000.
- The move: type L2 in B2 as one example, select B3 and press Ctrl+E. Excel fills B3 to B9. Then OP0423 in C2, Ctrl+E. Then Night in D2, Ctrl+E. Ribbon route: Data › Flash Fill.
- Look at column D: the source says NIGHT, we typed Night, and Excel copies that proper case for Day and Swing too.
- IE use: split work-order, lot, machine or operator codes from MES and machine exports so you can sort, filter and pivot by line and shift.
- Gotcha: the results are plain values, not formulas. New or changed codes will not update, so run Ctrl+E again. Spot-check the results: one odd code can fool it. If it guesses wrong, give it one more example.
- No suggestions at all? File › Options › Advanced › tick Automatically Flash Fill.
- Older Excel: Flash Fill arrived in Excel 2013. Before that, use Data › Text to Columns or LEFT / MID / FIND formulas.`
});
