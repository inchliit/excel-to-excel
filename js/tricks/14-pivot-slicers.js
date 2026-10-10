registerTrick({
  n: 14, id: 'pivot-slicers', act: 3,
  title: 'Pivot Table + Slicers',
  tagline: 'Downtime by cause, one click per line',
  version: 'All',
  keys: ['Alt', 'F5'],
  formula: null,
  ribbon: 'Insert › PivotTable',
  why: 'See which causes eat the most downtime minutes, then filter by line with one click, without writing a single formula.',
  alt: null,
  notes: `- Hook: where is our downtime going? 16 log rows today; thousands by the end of the year.
- The move: click in the log, Insert › PivotTable, keep Table/Range and New Worksheet, OK. Drag Cause to Rows and Minutes to Values. Right-click a total › Sort › Sort Largest to Smallest.
- Slicer: PivotTable Analyze › Insert Slicer › tick Line. Click L2, then L3: the totals update instantly. Hold Ctrl and click to pick several lines.
- Refresh: a pivot does NOT update by itself. New data? Alt+F5 refreshes this pivot; Ctrl+Alt+F5 refreshes everything in the workbook.
- IE use: downtime by cause, scrap by part, overtime by department. Sorted largest first, it is the input for a Pareto chart, the next trick.
- Gotcha: build the pivot on a Table (Ctrl+T, trick 4) so new rows are included when you refresh. If it shows Count of Minutes instead of Sum, the column has blanks or text.`
});
