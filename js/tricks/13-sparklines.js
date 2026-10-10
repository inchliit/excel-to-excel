registerTrick({
  n: 13, id: 'sparklines', act: 3,
  title: 'Sparklines',
  tagline: 'A chart in every cell',
  version: 'All',
  keys: null,
  formula: null,
  ribbon: 'Insert › Sparklines › Line',
  why: "Spot which line's daily output is sliding at a glance, right next to the numbers, on a report that prints.",
  alt: null,
  notes: `- Hook: 35 numbers, 5 lines × 7 days. Which line is sliding? Squint at the table… or put a tiny chart in every row.
- The move: select B2:H6, then Insert › Sparklines › Line. Data Range B2:H6, Location Range I2:I6, OK.
- Polish: on the Sparkline tab, under Show, tick High Point and Low Point. Switch the type to Column if you prefer bars.
- Read it: L4 slides down all week. You see it in a second, and the sparklines print with the report.
- IE use: daily output, scrap rate or cycle time per line or machine on a one-page shift report.
- Gotcha: each sparkline scales to its own min and max, so a small wobble can look like a crash. Sparkline › Axis › Same for All Sparklines (minimum and maximum) makes rows comparable. The Delete key does not remove sparklines; use Sparkline › Clear.
- Version: Excel 2010 and later.`
});
