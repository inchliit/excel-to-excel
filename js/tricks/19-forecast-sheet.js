registerTrick({
  n: 19, id: 'forecast-sheet', act: 4,
  title: 'Forecast Sheet',
  tagline: 'Seasonal demand forecast in one click',
  version: '2016+',
  keys: null,
  formula: null,
  ribbon: 'Data › Forecast › Forecast Sheet',
  why: 'Turn 24 months of seasonal demand into a 6-month forecast with a confidence band for capacity and material planning.',
  alt: 'Mac / web: no Forecast Sheet button; type the FORECAST.ETS function yourself',
  notes: `- Hook: plan production for the next 6 months. Demand is seasonal and trending, so a straight trend line misses the peaks.
- The move: select both columns, month and demand. Data › Forecast › Forecast Sheet. In the Create Forecast Worksheet preview, set Forecast End 6 months out. Options: Confidence Interval 95%, Seasonality Detect Automatically. Create.
- Result: a new sheet with your history, the forecast, lower and upper confidence bounds, and the chart. The numbers on this slide are illustrative.
- Behind it: Excel writes =FORECAST.ETS(A26,$B$2:$B$25,$A$2:$A$25,1,1) for the forecast and FORECAST.ETS.CONFINT for the band: exponential smoothing that learns the seasonal pattern.
- IE use: plan capacity on the upper bound and materials on the forecast.
- Gotcha: dates must be evenly spaced, one per month. More history means a better seasonal estimate; two full years is a sensible minimum.
- Mac, web and older Excel: the Forecast Sheet button is Windows Excel 2016+. On Mac or the web, type FORECAST.ETS yourself; Excel 2013 and older have no ETS functions.`
});
