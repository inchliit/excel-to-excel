registerTrick({
  n: 16, id: 'goal-seek', act: 4,
  title: 'Goal Seek',
  tagline: 'Work backwards to your takt time',
  version: 'All',
  keys: null,
  formula: null,
  ribbon: 'Data › What-If Analysis › Goal Seek',
  why: 'Work backwards from a daily demand target to the cycle time (takt) the line must hit, with no algebra.',
  alt: null,
  notes: `- Hook: we need 480 units a day. Available time is 450 minutes, 27,000 seconds. At a 62 s cycle time we make 435.5. What cycle time do we need?
- The move: Data › What-If Analysis › Goal Seek. Set cell: B3. To value: 480. By changing cell: B2. OK.
- Result: B2 walks down to 56.25 s and B3 hits 480. Status: Goal Seeking with Cell B3 found a solution. OK keeps the answer; Cancel puts 62 back.
- IE use: 56.25 s is the takt time, available time ÷ demand. Same move for any single input: the yield, uptime or staffing level that still meets the target.
- Gotcha: the Set cell must contain a formula and the changing cell a typed value. Goal Seek solves one input for one target; several inputs plus limits is a job for Solver, trick 18.`
});
