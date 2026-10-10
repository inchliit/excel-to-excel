registerTrick({
  n: 4, id: 'tables', act: 1,
  title: 'Ctrl+T Tables',
  tagline: 'Formulas and charts that grow with your log',
  version: 'All',
  keys: ['Ctrl', 'T'],
  formula: '=1-[@Defects]/[@Units]',
  ribbon: 'Insert › Table',
  why: 'Production and downtime logs grow every shift; a Table carries formulas, charts and pivot sources to each new row automatically.',
  alt: null,
  notes: `- Hook: every day you paste new production rows, copy the formulas down and drag the chart range by hand. What if the sheet did that for you?
- The move: click any cell in the data and press Ctrl+T (or Insert › Table). Check the range, keep My table has headers ticked, OK. You get banded rows and filter buttons.
- Formula: in E2 type =1-[@Defects]/[@Units]. [@Defects] means the Defects value on this row. One Enter fills the whole column: 98.5%, 99.0%, 98.0% and so on.
- New data: type a row right under the table, 455 units and 7 defects. It joins the table, Yield 98.5% appears and the chart gains a bar.
- Totals: Ctrl+Shift+T toggles a total row. Rename the table in Table Design › Table Name, for example tblProd, and =SUM(tblProd[Units]) always includes new rows.
- IE use: production, downtime and QC logs, anything that grows every shift. A pivot built on a Table picks up the new rows when you refresh it.
- Gotcha: a blank row or column inside the data cuts off the range Excel guesses, so check the range in the Create Table dialog.`
});
