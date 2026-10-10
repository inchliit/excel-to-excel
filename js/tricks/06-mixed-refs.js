registerTrick({
  n: 6, id: 'mixed-refs', act: 2,
  title: 'Mixed references with F4',
  tagline: 'One formula, whole cost grid',
  version: 'All',
  keys: ['F4'],
  formula: '=$B2*C$1',
  ribbon: null,
  why: 'Build a whole part × batch-size cost grid (or any rate × quantity table) from one formula filled across and down.',
  alt: null,
  notes: `- Hook: cost = unit cost × quantity, for 5 parts and 5 batch sizes. That is 25 formulas… or one.
- First try: =B2*C1 in C2 gives 1,250, which is right. Fill it to G6 and the numbers go wrong, because both references slide as they move.
- The move: put the cursor on B2 inside the formula and press F4 three times: B2, $B$2, B$2, $B2. Then on C1 press F4 twice: C$1. The formula is now =$B2*C$1.
- Say it aloud: $B means always the cost column; $1 means always the quantity row. Fill C2:G6 and all 25 cells are right.
- IE use: rate × quantity grids: cost by part and batch size, machine hours by part and volume, labor minutes by operation and order size.
- Gotcha: on many laptops F4 is a media key, so press Fn+F4. Outside edit mode, F4 repeats your last action instead.
- Mac: Cmd+T toggles the $ signs.`
});
