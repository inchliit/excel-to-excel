registerTrick({
  n: 8, id: 'index-match', act: 2,
  title: 'INDEX + MATCH',
  tagline: 'Two-way lookup',
  version: 'All',
  keys: null,
  formula: '=INDEX(B2:D7,MATCH(G2,A2:A7,0),MATCH(G3,B1:D1,0))',
  ribbon: null,
  why: 'Pull the capacity for any machine and shift (or the setup time for any product pair) from a matrix, with no hard-coded column numbers.',
  alt: null,
  notes: `- Hook: VLOOKUP needs a column number typed by hand, and inserting a column silently breaks it. Here we have two inputs, machine and shift, so we use two MATCHes.
- MATCH(G2, A2:A7, 0) looks for M-104 down the machine list and returns its position: 4.
- MATCH(G3, B1:D1, 0) looks for Night across the header row: 3.
- INDEX(B2:D7, 4, 3) returns row 4, column 3 of the capacity matrix. Full formula: =INDEX(B2:D7, MATCH(G2,A2:A7,0), MATCH(G3,B1:D1,0)). Change G3 to Day and it recomputes.
- IE use: capacity by machine and shift, standard time by part and operation, changeover time from one product to the next.
- Gotcha: always type the 0 for exact match. Leave it out and MATCH does an approximate search that returns the wrong row on unsorted data, with no error.
- Works in every Excel version, so it is the safe choice for files you share.`
});
