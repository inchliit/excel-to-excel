// node tests/check-workbook.mjs : recalculates the practice workbook's formulas with HyperFormula (an Excel-compatible
// engine) from tools/workbook-verify.json (written by tools/make_workbook.py) and checks:
//   1. blank workbook: no formula returns an error, and no Check cell claims success yet
//   2. each sheet solved (answer formula filled in, or the menu trick's result values): its Check cell shows ✓
//   3. a wrong answer is not accepted
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { HyperFormula } = require('hyperformula');
const root = new URL('../', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('tools/workbook-verify.json', root), 'utf8'));
const core = {};
new Function('window', fs.readFileSync(new URL('js/lib/tryit.js', root), 'utf8'))(core);
const normalize = core.TRYCORE.normalize;

const colIdx = s => [...s].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
const parse = ref => { const m = /^([A-Z]+)(\d+)$/.exec(ref.replace(/\$/g, '')); return { row: +m[2] - 1, col: colIdx(m[1]) }; };
const box = rng => { const [a, b] = rng.split(':'); const p = parse(a), q = parse(b || a); return { r0: Math.min(p.row, q.row), r1: Math.max(p.row, q.row), c0: Math.min(p.col, q.col), c1: Math.max(p.col, q.col) }; };
const isErr = v => v && typeof v === 'object' && 'type' in v;
const show = v => (isErr(v) ? v.value : JSON.stringify(v));

function buildHF() {
  const sheets = {};
  for (const [name, cells] of Object.entries(spec.sheets)) {
    const grid = [];
    for (const [ref, { v, t }] of Object.entries(cells)) {
      if (t === 's' && typeof v === 'string' && v.startsWith('=')) continue;   // answer notes stored as text
      const { row, col } = parse(ref);
      while (grid.length <= row) grid.push([]);
      grid[row][col] = v;
    }
    sheets[name] = grid.map(r => Array.from({ length: r.length }, (_, i) => (r[i] === undefined ? null : r[i])));
  }
  return HyperFormula.buildFromSheets(sheets, { licenseKey: 'gpl-v3', useArrayArithmetic: true });
}

const fail = [];
let formulas = 0;

// 1. blank state
{
  const hf = buildHF();
  for (const [name, cells] of Object.entries(spec.sheets)) {
    const sid = hf.getSheetId(name);
    for (const [ref, { t }] of Object.entries(cells)) {
      if (t !== 'f') continue;
      formulas++;
      const v = hf.getCellValue({ sheet: sid, ...parse(ref) });
      if (isErr(v)) fail.push(`${name}!${ref} blank workbook: ${v.value} ${v.message || ''}`);
    }
  }
  for (const c of spec.checks.filter(c => c.check)) {
    const v = hf.getCellValue({ sheet: hf.getSheetId(c.sheet), ...parse(c.check) });
    if (typeof v === 'string' && v.startsWith('✓')) fail.push(`${c.sheet}!${c.check} says ✓ before anything is done`);
  }
}

// 2. solved state, one sheet at a time
function apply(hf, sid, sol) {
  const at = ref => ({ sheet: sid, ...parse(ref) });
  if (sol.kind === 'formula') hf.setCellContents(at(sol.target), [[normalize(sol.formula)]]);
  else if (sol.kind === 'formula-fill') {
    hf.setCellContents(at(sol.target), [[normalize(sol.formula)]]);
    const b = box(sol.range), t = parse(sol.target);
    hf.copy({ start: { sheet: sid, ...t }, end: { sheet: sid, ...t } });
    for (let r = b.r0; r <= b.r1; r++) for (let c = b.c0; c <= b.c1; c++) if (r !== t.row || c !== t.col) hf.paste({ sheet: sid, row: r, col: c });
  } else {
    const b = box(sol.kind === 'spill-values' ? sol.range : sol.range);
    hf.setCellContents({ sheet: sid, row: b.r0, col: b.c0 }, sol.values);
  }
}
let solved = 0;
for (const c of spec.checks.filter(c => c.check && c.solution)) {
  const hf = buildHF();
  const sid = hf.getSheetId(c.sheet);
  apply(hf, sid, c.solution);
  const v = hf.getCellValue({ sheet: sid, ...parse(c.check) });
  if (!(typeof v === 'string' && v.startsWith('✓'))) fail.push(`${c.sheet}!${c.check} solved: expected ✓, got ${show(v)}`);
  else solved++;
}

// 3. a wrong answer must not pass (07 SUMIFS with one criterion missing)
{
  const c = spec.checks.find(x => x.id === 'sumifs');
  const hf = buildHF();
  const sid = hf.getSheetId(c.sheet);
  hf.setCellContents({ sheet: sid, ...parse(c.solution.target) }, [['=SUMIFS(D2:D13,B2:B13,"L2")']]);
  const v = hf.getCellValue({ sheet: sid, ...parse(c.check) });
  if (!(typeof v === 'string' && v.startsWith('✗'))) fail.push(`wrong SUMIFS answer should show ✗, got ${show(v)}`);
}

const withCheck = spec.checks.filter(c => c.check).length;
if (solved !== withCheck) fail.push(`only ${solved} of ${withCheck} Check cells were verified as solvable`);
if (fail.length) { console.error(`check-workbook: FAIL (${fail.length})\n- ` + fail.join('\n- ')); process.exit(1); }
console.log(`check-workbook: PASS — ${Object.keys(spec.sheets).length} sheets, ${formulas} formulas error-free, ${solved}/${withCheck} Check cells turn ✓ when solved, wrong answer → ✗`);
