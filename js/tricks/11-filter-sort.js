registerTrick({
  n: 11, id: 'filter-sort', act: 2,
  title: 'FILTER + SORT',
  tagline: "A live 'worst machines' list",
  version: '365/2021',
  keys: null,
  formula: '=SORT(FILTER(A2:F11,F2:F11<0.85),6,1)',
  ribbon: null,
  why: 'A live list of machines under 85% OEE, worst first, that rebuilds itself whenever the data changes.',
  alt: 'Older Excel: AutoFilter (Ctrl+Shift+L) + Sort, by hand each time',
  notes: `- Hook: the daily stand-up question: which machines are under 85% OEE, worst first? Today you filter, sort, copy and paste. Tomorrow, again.
- The move: =FILTER(A2:F11, F2:F11<0.85) keeps only the rows whose OEE is below 85%. The result spills into as many rows as it needs (blue border).
- Wrap it: =SORT(FILTER(A2:F11,F2:F11<0.85), 6, 1). Sort by the 6th column, OEE; 1 means ascending, so the worst machine is on top.
- Live: change one machine's OEE to 0.79 and it slides into the list. No refresh, no re-filtering.
- IE use: OEE watch lists, late orders, parts below reorder point, lots out of spec.
- Gotcha: #SPILL! means something is in the way of the output range, so clear those cells. If no machine is under 85%, you get #CALC!, the empty-result error.
- Older Excel (2019 and earlier): AutoFilter (Ctrl+Shift+L) + Sort, by hand each time.`
});
