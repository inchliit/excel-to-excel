registerTrick({
  n: 20, id: 'monte-carlo', act: 4,
  title: 'Monte Carlo',
  tagline: 'Simulate variability, not averages',
  version: 'All',
  keys: ['F9'],
  formula: '=NORM.INV(RAND(),12,1.5)',
  ribbon: null,
  why: 'Averages hide variability: simulate station times to see how often the line really meets a 42-minute promise.',
  alt: null,
  notes: `- Hook: three stations average 12 + 18 + 9 = 39 minutes, and the customer promise is 42. The average says we are fine. How often do we actually make it?
- The move: =NORM.INV(RAND(), 12, 1.5). RAND gives a random probability between 0 and 1; NORM.INV turns it into a station time with mean 12 and SD 1.5. Same for 18 / 2.5 and 9 / 1.0, plus a total.
- Press F9 and every random number re-rolls: one simulated job each time.
- Scale up: fill 1,000 rows, then =COUNTIF(E2:E1001,"<=42")/1000 gives about 83.5% on time. Theory agrees: σ = √9.5 ≈ 3.08, z ≈ 0.97.
- IE use: cut station 2's SD from 2.5 to 1.5 and on-time rises to about 90%. Reduce variability, not just averages.
- Gotcha: RAND recalculates on every edit, so the % moves by a point or two between runs. Paste as values to freeze one run.
- Older Excel: Excel 2007 used NORMINV, with the same arguments.`
});
