registerTrick({
  n: 17, id: 'data-table', act: 4,
  title: 'What-If Data Table',
  tagline: 'Every order quantity at once',
  version: 'All',
  keys: null,
  formula: null,
  ribbon: 'Data › What-If Analysis › Data Table',
  why: 'See the total inventory cost of every order quantity at once and bracket the cheapest one: EOQ sensitivity in one table.',
  alt: null,
  notes: `- Hook: demand is 12,000 a year, each order costs 1,500, holding costs 30 per unit-year. Ordering 800 at a time costs 34,500 a year. Is there a cheaper order quantity? Try them all at once.
- Setup: list Q from 400 to 1,800 in steps of 200 in D8:D15. In E7, one row above the first Q and one column to the right, put =B5, the total-cost cell.
- The move: select D7:E15. Data › What-If Analysis › Data Table. Row input cell: leave blank. Column input cell: B4, the Q cell. OK.
- Result: 51,000 · 39,000 · 34,500 · 33,000 · 33,000 · 33,857 · 35,250 · 37,000. A U-curve with the minimum between 1,000 and 1,200. EOQ = √(2DS/H) ≈ 1,095 with TC ≈ 32,863, and the table brackets it.
- IE use: any sensitivity question: batch size vs setup cost, staffing level vs waiting time. Add a second input across the top row (Row input cell) for a two-way table.
- Gotcha: the results are one block, {=TABLE(,B4)}, so you cannot edit a single cell of it. The input cell must be on the same sheet. Big tables slow recalculation: Formulas › Calculation Options › Automatic Except for Data Tables.`
});
