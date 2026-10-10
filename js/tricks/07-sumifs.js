registerTrick({
  n: 7, id: 'sumifs', act: 2,
  title: 'SUMIFS / COUNTIFS',
  tagline: 'Defects by line AND shift',
  version: 'All',
  keys: null,
  formula: '=SUMIFS(D2:D13,B2:B13,"L2",C2:C13,"Night")',
  ribbon: null,
  why: 'Total defects, downtime or output for any line AND shift combination in one formula, with no filtering by hand.',
  alt: null,
  notes: `- Hook: the boss asks: total defects for Line 2, Night shift? You filter, select, read the status bar… then she asks for Line 3.
- The move: =SUMIFS(D2:D13, B2:B13, "L2", C2:C13, "Night"). Sum range first, then pairs of criteria range and criteria. A row is added only when every pair matches.
- Counting: =COUNTIFS(C2:C13, "Night", D2:D13, ">5") counts Night rows with more than 5 defects. Comparison operators go inside the quotes.
- IE use: scrap by part and supplier, downtime minutes by cause and line, output by machine and week. AVERAGEIFS works the same way.
- Gotcha: SUMIFS puts the sum range FIRST; the older SUMIF puts it LAST. All ranges must be the same size.
- Tip: put L2 and Night in cells and point the criteria at them, so one formula answers any combination. To compare with a cell, join the operator on: ">"&H2.`
});
