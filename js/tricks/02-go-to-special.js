registerTrick({
  n: 2, id: 'go-to-special', act: 1,
  title: 'Go To Special › Blanks + Ctrl+Enter',
  tagline: 'Fill every gap in one go',
  version: 'All',
  keys: ['F5', '=', '↑', 'Ctrl', 'Enter'],
  formula: null,
  ribbon: 'Home › Find & Select › Go To Special › Blanks',
  why: 'Exported shift and ERP reports print each group label only once; fill the gaps before you sort, filter or pivot, or the totals go wrong.',
  alt: null,
  notes: `- Hook: this shift report prints the Line only once per group. Sort it or pivot it as is, and every blank row loses its line, so the totals go wrong.
- The move: select A2:A9, press F5 (or Ctrl+G) to open Go To, click Special…, choose Blanks, OK. Only the empty cells stay selected, and the active cell is A3.
- Next: type = and press the up arrow, so A3 reads =A2. Now press Ctrl+Enter, not Enter: the formula goes into every selected blank, and each one points at the cell above it. L1, L1, L2, L2, L3.
- Ribbon route: Home › Find & Select › Go To Special.
- IE use: shift reports, BOM and routing exports, ERP printouts with grouped labels. Fill them before any sort, filter or pivot.
- Gotcha: the filled cells are formulas, so freeze them before sorting: select the column, Ctrl+C, then Ctrl+Alt+V › Values › OK. Also, a cell holding a space is not blank, so Go To Special skips it.
- Works in every Excel version.`
});
