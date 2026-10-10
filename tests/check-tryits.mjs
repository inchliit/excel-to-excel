// node tests/check-tryits.mjs : runs every try-it answer (and fixtures) through the real try-it core + HyperFormula.
// Review Focus 3: lowercase/spaced variants must pass; a typo must give #NAME? (not throw).
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const NS = require('hyperformula');
const root = new URL('../', import.meta.url);

// ---- load the browser try-it core in a DOM-less sandbox ----
// Same realm as HyperFormula (a vm context would make arrays fail its instanceof checks).
const sandbox = {};
new Function('window', fs.readFileSync(new URL('js/lib/tryit.js', root), 'utf8'))(sandbox);
const Core = sandbox.TRYCORE;
if (!Core || typeof Core.evaluate !== 'function') {
  console.error('check-tryits: FAIL\n- js/lib/tryit.js must define window.TRYCORE.evaluate');
  process.exit(1);
}

// ---- load trick metadata + animation extensions ----
const tricks = [];
const ext = {};
const tsb = vm.createContext({ registerTrick: t => tricks.push(t), extendTrick: (id, e) => { ext[id] = e; }, window: {}, console, Math });
for (const dir of ['js/tricks/', 'js/anim/']) {
  const d = new URL(dir, root);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(f => /^\d\d-[a-z0-9-]+\.js$/.test(f)).sort()) {
    try { vm.runInContext(fs.readFileSync(new URL(f, d), 'utf8'), tsb, { filename: dir + f }); } catch (e) { /* check-tricks reports load errors */ }
  }
}
tricks.forEach(t => { if (ext[t.id]) Object.assign(t, ext[t.id]); });

// ---- fixtures: exercise every mode independently of the agents' data ----
const log = [['Date', 'Line', 'Shift', 'Defects'], ['Mon', 'L1', 'Day', 6], ['Mon', 'L2', 'Night', 9], ['Tue', 'L2', 'Day', 4], ['Tue', 'L2', 'Night', 7], ['Wed', 'L3', 'Night', 5]];
const oee = [['Machine', 'Line', 'Avail', 'Perf', 'Qual', 'OEE'], ['M1', 'L1', 0.9, 0.9, 0.99, 0.802], ['M2', 'L1', 0.95, 0.95, 0.99, 0.893],
  ['M3', 'L2', 0.85, 0.9, 0.98, 0.75], ['M4', 'L2', 0.97, 0.96, 0.99, 0.922], ['M5', 'L3', 0.88, 0.9, 0.97, 0.768]];
const fixtures = [
  { id: 'fx-value', tryit: { sheet: log, target: 'G2', mode: 'value', expected: 16, mustUse: ['SUMIFS'], answer: '=SUMIFS(D2:D6,B2:B6,"L2",C2:C6,"Night")' } },
  { id: 'fx-spill', tryit: { sheet: oee, target: 'H2', mode: 'spill', mustUse: ['FILTER', 'SORT'], answer: '=SORT(FILTER(A2:F6,F2:F6<0.85),6,1)',
    expected: [['M3', 'L2', 0.85, 0.9, 0.98, 0.75], ['M5', 'L3', 0.88, 0.9, 0.97, 0.768], ['M1', 'L1', 0.9, 0.9, 0.99, 0.802]] } },
  { id: 'fx-fill', tryit: { sheet: [['Item', 'Value', 'Cum', 'Class'], ['S1', 9, 0.42, ''], ['S2', 8, 0.85, ''], ['S3', 1, 0.99, '']], target: 'D2', mode: 'fill', fill: 'D2:D4',
    expected: [['A'], ['B'], ['C']], answer: '=IFS(C2<=0.8,"A",C2<=0.95,"B",TRUE,"C")' } },
  { id: 'fx-grid', tryit: { sheet: [['Part', 'Cost', 100, 250], ['Bracket', 12.5, '', ''], ['Bolt', 1.35, '', '']], target: 'C2', mode: 'fill', fill: 'C2:D3',
    expected: [[1250, 3125], [135, 337.5]], answer: '=$B2*C$1' } },
  { id: 'fx-cf', tryit: { sheet: [['Sample', 'Mean', '', '', 'UCL', 25.06], ['1', 25.01, '', '', 'LCL', 24.94], ['2', 25.08, '', '', '', ''], ['3', 24.92, '', '', '', '']],
    target: 'H2', mode: 'cf', fill: 'H2:H4', cfRange: 'A2:B4', expected: [[false], [true], [true]], answer: '=OR($B2>$F$1,$B2<$F$2)' } },
  { id: 'fx-random', tryit: { sheet: [['Station', 'Mean', 'SD'], ['S2', 18, 2.5]], target: 'E2', mode: 'random', random: { trials: 500, mean: 18, sd: 2.5 },
    mustUse: ['NORM.INV', 'RAND'], answer: '=NORM.INV(RAND(),18,2.5)' } }
];

const fail = [];
const lowerOutsideQuotes = f => f.split('"').map((seg, i) => (i % 2 ? seg : seg.toLowerCase().replace(/,/g, ', '))).join('"');
const typo = f => f.replace(/([A-Z][A-Z.]+)\(/, '$1X(');
const all = fixtures.concat(tricks.filter(t => t.tryit).map(t => ({ id: t.id, tryit: t.tryit })));

for (const { id, tryit } of all) {
  const run = (formula, label) => {
    try { return Core.evaluate(NS, tryit, formula); } catch (e) { fail.push(`${id} ${label}: threw ${e.message}`); return null; }
  };
  const r = run(tryit.answer, 'answer');
  if (r && (r.status !== 'ok' || r.nudge)) fail.push(`${id} answer: ${r.status}${r.nudge ? ' (nudge: ' + r.nudge + ')' : ''}: ${r.title || ''} ${r.message || ''}`);
  const v = run(lowerOutsideQuotes(tryit.answer), 'lowercase');
  if (v && v.status !== 'ok') fail.push(`${id} lowercase variant: ${v.status}: ${v.title || ''} ${v.message || ''}`);
  if (typo(tryit.answer) !== tryit.answer) {
    const e = run(typo(tryit.answer), 'typo');
    if (e && !(e.status === 'error' && /#NAME\?/.test(e.title || ''))) fail.push(`${id} typo: expected #NAME? error, got ${e.status} ${e.title || ''}`);
  }
}

// top-level FILTER must spill (not #VALUE!): unsorted is "wrong" for the sorted task, and "ok" for a FILTER-only task
const bare = Core.evaluate(NS, fixtures[1].tryit, '=FILTER(A2:F6,F2:F6<0.85)');
if (!bare || bare.status !== 'wrong') fail.push('top-level FILTER on sorted task should be "wrong", got ' + (bare && bare.status) + ' ' + (bare && bare.title));
const filterOnly = Object.assign({}, fixtures[1].tryit, { mustUse: ['FILTER'], answer: '=FILTER(A2:F6,F2:F6<0.85)',
  expected: [['M1', 'L1', 0.9, 0.9, 0.99, 0.802], ['M3', 'L2', 0.85, 0.9, 0.98, 0.75], ['M5', 'L3', 0.88, 0.9, 0.97, 0.768]] });
const fo = Core.evaluate(NS, filterOnly, filterOnly.answer);
if (!fo || fo.status !== 'ok') fail.push('top-level FILTER-only task should be "ok", got ' + (fo && fo.status) + ' ' + (fo && fo.title) + ' ' + (fo && fo.message));

// random mode must not claim the random value is "exactly what Excel returns"
const rnd = Core.evaluate(NS, fixtures[5].tryit, fixtures[5].tryit.answer);
if (!rnd || /exactly what Excel returns/.test(rnd.message || '')) fail.push('random-mode success message should talk about randomness, got: ' + (rnd && rnd.message));

// wrong answers must be marked wrong (not ok)
const wrong = Core.evaluate(NS, fixtures[0].tryit, '=SUMIFS(D2:D6,B2:B6,"L1")');
if (!wrong || wrong.status !== 'wrong') fail.push('fx-value wrong answer should be "wrong", got ' + (wrong && wrong.status));
const relGrid = Core.evaluate(NS, fixtures[3].tryit, '=B2*C1');
if (!relGrid || relGrid.status !== 'wrong') fail.push('fx-grid unanchored refs should be "wrong", got ' + (relGrid && relGrid.status));
const noEq = Core.evaluate(NS, fixtures[0].tryit, 'SUMIFS(D2:D6,B2:B6,"L2",C2:C6,"Night")');
if (!noEq || noEq.status !== 'ok') fail.push('missing "=" should still evaluate, got ' + (noEq && noEq.status));
const curly = Core.evaluate(NS, fixtures[0].tryit, '=SUMIFS(D2:D6,B2:B6,“L2”,C2:C6,“Night”)');
if (!curly || curly.status !== 'ok') fail.push('smart quotes should be accepted, got ' + (curly && curly.status));

if (fail.length) {
  console.error(`check-tryits: FAIL (${fail.length})\n- ` + fail.join('\n- '));
  process.exit(1);
}
console.log(`check-tryits: PASS — ${fixtures.length} fixtures + ${all.length - fixtures.length} deck try-its (answer, lowercase, typo each)`);
