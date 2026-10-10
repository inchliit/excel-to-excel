registerTrick({
  n: 10, id: 'ifs', act: 2,
  title: 'IFS for ABC classes',
  tagline: 'ABC inventory without nested-IF pain',
  version: '2019+',
  keys: null,
  formula: '=IFS(C2<=0.8,"A",C2<=0.95,"B",TRUE,"C")',
  ribbon: null,
  why: 'Classify SKUs into A, B and C inventory classes by cumulative share of usage value with one readable formula.',
  alt: 'Older Excel: nested IF, =IF(C2<=0.8,"A",IF(C2<=0.95,"B","C"))',
  notes: `- Hook: ABC analysis. A = the SKUs that make up the first 80% of annual usage value, B = up to 95%, C = the rest. Nested IFs work… until you start counting brackets.
- The old way: =IF(C2<=0.8,"A",IF(C2<=0.95,"B","C")). One IF inside another, and the closing brackets pile up at the end.
- The move: =IFS(C2<=0.8,"A", C2<=0.95,"B", TRUE,"C"). Read it as pairs: test, result; test, result. Fill D2:D11.
- Result: 3 A items (cumulative 42%, 63%, 77%), 3 B items, 4 C items. Tight control and frequent cycle counts go to the A items.
- Gotcha: IFS stops at the first TRUE, so order matters: test 0.8 before 0.95. The final TRUE,"C" is the else; forget it and unmatched rows return #N/A.
- Older Excel: standalone Excel 2016 and earlier have no IFS, so use the nested IF.`
});
