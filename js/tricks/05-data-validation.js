registerTrick({
  n: 5, id: 'data-validation', act: 1,
  title: 'Data Validation dropdowns',
  tagline: "Stop 'scrtch' before it starts",
  version: 'All',
  keys: ['Alt', 'A', 'V', 'V'],
  formula: null,
  ribbon: 'Data › Data Tools › Data Validation',
  why: 'Standard defect codes at the point of entry keep QC counts, pivots and Pareto charts right without any cleanup.',
  alt: null,
  notes: `- Hook: five operators, five spellings: scratch, Scratch, scrtch… The typo becomes its own defect in your pivot, so the counts split. Stop it at entry.
- The move: select D2:D12, then Data › Data Tools › Data Validation (keyboard: Alt, A, V, V). Allow: List. Source: =$H$2:$H$6. Keep In-cell dropdown ticked. OK.
- Now every cell has a dropdown arrow; Alt + down arrow opens it from the keyboard. Pick Crack.
- Type crak and Excel refuses: This value doesn't match the data validation restrictions defined for this cell.
- Old bad entries stay until you find them: Data › Data Validation dropdown arrow › Circle Invalid Data rings them in red.
- IE use: QC check sheets, downtime cause codes, machine IDs, shift names: any column you will later count or pivot.
- Gotcha: validation checks typing, not pasting; a paste can overwrite the rule. Mac: there are no Alt key tips, so use Data › Data Validation.`
});
