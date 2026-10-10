registerTrick({
  n: 12, id: 'cf-formula', act: 3,
  title: 'Conditional formatting with a formula',
  tagline: 'SPC alarms that light themselves',
  version: 'All',
  keys: null,
  formula: '=OR($B2>$F$2,$B2<$F$3)',
  ribbon: 'Home › Conditional Formatting › New Rule',
  why: 'Out-of-control SPC samples (or overdue PMs) highlight themselves the moment the data or the control limits change.',
  alt: null,
  notes: `- Hook: which samples are out of control? Easy to eyeball in 20 rows. Not in 2,000.
- The move: select A2:B21 with A2 as the active cell. Home › Conditional Formatting › New Rule › Use a formula to determine which cells to format.
- Type =OR($B2>$F$2,$B2<$F$3), click Format…, pick a red fill, OK. $B = always the Mean column; the 2 has no $, so it moves down row by row; $F$2 and $F$3 = the fixed UCL and LCL cells.
- Result: samples 7 (25.08) and 15 (24.92) light up. Tighten the UCL to 25.05 and the 25.055 sample lights up too, live.
- IE use: SPC control limits, overdue preventive maintenance with =$E2<TODAY(), late orders, stock below the reorder point.
- Gotcha: write the formula for the first row of the selection, as if it sat in the active cell. A wrong $ highlights the wrong rows. Edit rules in Home › Conditional Formatting › Manage Rules.`
});
