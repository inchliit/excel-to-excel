registerTrick({
  n: 15, id: 'pareto', act: 3,
  title: 'Built-in Pareto chart',
  tagline: '80/20 in two clicks',
  version: '2016+',
  keys: null,
  formula: null,
  ribbon: 'Insert › Insert Statistic Chart › Pareto',
  why: 'Show which few defect causes create most of the scrap, so the improvement team attacks those first.',
  alt: 'Excel 2013 or older: sort descending, add a cumulative % column, then a column + line combo chart',
  notes: `- Hook: 7 defect causes, 345 defects. Which few should the improvement team attack first?
- The move: select A1:B8, then Insert › Insert Statistic Chart (the histogram icon) › Pareto. Excel sorts the bars largest first and adds the cumulative % line on a second axis.
- Read it: Misalignment alone is 41.2%; add Scratch and it is 69.0%; add Burr and it is 83.8%. 3 of 7 causes = 84% of defects, so fix these first.
- No sorting and no cumulative % column needed: the chart does both for you.
- IE use: defect causes, downtime causes from the pivot in trick 14, customer complaints, scrap by part.
- Gotcha: Excel draws no 80% line; read it off the right-hand % axis.
- Older Excel (2013 and earlier): sort descending, add a cumulative % column, then build a column + line combo chart with the line on the secondary axis.`
});
