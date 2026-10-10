registerTrick({
  n: 9, id: 'xlookup', act: 2,
  title: 'XLOOKUP',
  tagline: 'Lookups without column numbers',
  version: '365/2021',
  keys: null,
  formula: '=XLOOKUP(F2,A2:A9,C2:C9,"Not found")',
  ribbon: null,
  why: 'Look up standard time or work center by part number, even to the left, with a friendly message when a part is missing.',
  alt: 'Older Excel: =IFERROR(INDEX(C2:C9,MATCH(F2,A2:A9,0)),"Not found")',
  notes: `- Hook: VLOOKUP pain: you count the column number, it cannot look left, and a missing part gives #N/A.
- The move: =XLOOKUP(F2, A2:A9, C2:C9). Three parts: what to find, where to look, what to return. No column number.
- Left lookup: =XLOOKUP("Weld bracket", B2:B9, A2:A9) searches the Description column and returns the Part No to its left. VLOOKUP cannot do that.
- Not found: set F2 to P-999 and you get #N/A. Add a 4th argument, "Not found", and the cell shows friendly text instead.
- IE use: standard time and work center by part number for routing sheets, capacity loading and labor estimates.
- Gotcha: XLOOKUP is exact match by default, while VLOOKUP defaults to approximate. Keep the return range the same height as the lookup range.
- Older Excel (2019 and earlier): =IFERROR(INDEX(C2:C9, MATCH(F2,A2:A9,0)), "Not found"). XLOOKUP formulas show #NAME? in those versions.`
});
