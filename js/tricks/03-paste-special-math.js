registerTrick({
  n: 3, id: 'paste-special-math', act: 1,
  title: 'Paste Special › Divide',
  tagline: 'Convert a whole time study in place',
  version: 'All',
  keys: ['Ctrl', 'Alt', 'V'],
  formula: null,
  ribbon: 'Home › Paste › Paste Special › Divide',
  why: 'Convert a whole time study from seconds to minutes, or add an allowance to every element time, in place and with no helper column.',
  alt: null,
  notes: `- Hook: this time study was recorded in seconds, but the standard needs minutes. Helper column, =B2/60, copy, paste values, delete the helper? There is a one-shot way.
- The move: type 60 in a spare cell, G2, and press Ctrl+C. Select B2:E6. Press Ctrl+Alt+V for Paste Special, choose Divide under Operation, OK.
- Every observation is divided in place: 12.6 s becomes 0.21 min, 18.0 becomes 0.30. No helper column and no formulas left behind. Delete the 60 afterwards.
- Menu route: Home › Paste › Paste Special…, or right-click › Paste Special…
- IE use: unit conversions on a whole study (seconds to minutes, minutes to hours), or Multiply by 1.15 to add a 15% allowance to every normal time. Multiply by 1 turns numbers stored as text into real numbers.
- Gotcha: it overwrites the original values, so keep Ctrl+Z handy. Choose Paste: Values together with Divide if you want to keep the table's own formatting.
- Mac: Paste Special is Cmd+Ctrl+V.`
});
