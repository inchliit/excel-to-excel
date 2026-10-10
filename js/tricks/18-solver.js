registerTrick({
  n: 18, id: 'solver', act: 4,
  title: 'Solver product mix',
  tagline: 'Let Excel do the LP',
  version: 'All',
  keys: null,
  formula: null,
  ribbon: 'Data › Analyze › Solver',
  why: 'Find the profit-maximizing product mix under machine-hour limits: the LP from your operations research class, solved in Excel.',
  alt: null,
  notes: `- Hook: a bracket earns 40 and needs 2 machining hours and 1 assembly hour; a housing earns 30 and needs 1 of each. We have 100 machining hours and 80 assembly hours. How many of each? It is the LP from your OR class.
- Model: decision cells B2:C2 start at 0. Objective D3 = SUMPRODUCT(B2:C2,B3:C3). Hours used in D5:D6, limits in F5:F6.
- The move: Data › Analyze › Solver. Set Objective $D$3, To: Max, By Changing Variable Cells $B$2:$C$2. Add the constraint $D$5:$D$6 <= $F$5:$F$6. Tick Make Unconstrained Variables Non-Negative. Solving Method: Simplex LP. Solve.
- Result: 20 brackets and 60 housings, profit 2,600, both resources 100% used. Message: Solver found a solution. All Constraints and optimality conditions are satisfied. On the graph it is the corner point (20, 60).
- Bonus: in the Solver Results dialog, pick the Sensitivity report. Shadow prices: one more assembly hour is worth 20, one more machining hour 10.
- Enable once: File › Options › Add-ins › Manage: Excel Add-ins › Go › tick Solver Add-in › OK. Mac: Tools menu › Excel Add-ins › tick Solver Add-In.
- Gotcha: need whole units? Add an int constraint. Simplex LP needs a linear model; if Solver says the linearity conditions are not satisfied, switch to GRG Nonlinear.`
});
