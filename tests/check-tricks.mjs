// node tests/check-tricks.mjs : validates every js/tricks/NN-id.js against the trick contract.
import fs from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../js/tricks/', import.meta.url);
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter(f => /^\d\d-[a-z0-9-]+\.js$/.test(f)).sort()
  : [];
const VERSIONS = ['All', '2016+', '2019+', '365/2021'];
const MODES = ['value', 'spill', 'fill', 'cf', 'random'];
const ACT_OF = n => (n <= 5 ? 1 : n <= 11 ? 2 : n <= 15 ? 3 : 4);
const REF = /^[A-Z]{1,2}[0-9]{1,4}$/;
const RANGE = /^[A-Z]{1,2}[0-9]{1,4}:[A-Z]{1,2}[0-9]{1,4}$/;

const tricks = [];
const fail = [];
const sandbox = vm.createContext({ registerTrick: t => tricks.push(t), window: {}, console, Math });

for (const f of files) {
  const before = tricks.length;
  try {
    vm.runInContext(fs.readFileSync(new URL(f, dir), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    fail.push(`${f}: throws on load: ${e.message}`);
    continue;
  }
  if (tricks.length !== before + 1) { fail.push(`${f}: must call registerTrick exactly once`); continue; }
  tricks[tricks.length - 1].__file = f;
}

if (tricks.length !== 20) fail.push(`expected 20 tricks, found ${tricks.length}`);
const seen = new Set();
for (const t of tricks) {
  const f = t.__file;
  const want = `${String(t.n).padStart(2, '0')}-${t.id}.js`;
  if (f !== want) fail.push(`${f}: file name should be ${want}`);
  if (!Number.isInteger(t.n) || t.n < 1 || t.n > 20) fail.push(`${f}: n must be 1-20`);
  if (seen.has(t.n)) fail.push(`${f}: duplicate n ${t.n}`);
  seen.add(t.n);
  if (t.act !== ACT_OF(t.n)) fail.push(`${f}: act should be ${ACT_OF(t.n)}`);
  if (!VERSIONS.includes(t.version)) fail.push(`${f}: version "${t.version}" not in ${VERSIONS.join(' | ')}`);
  for (const k of ['title', 'tagline', 'why', 'notes']) {
    if (typeof t[k] !== 'string' || !t[k].trim()) fail.push(`${f}: ${k} required`);
  }
  const hasKeys = Array.isArray(t.keys) && t.keys.length > 0;
  const hasFormula = typeof t.formula === 'string' && t.formula.startsWith('=');
  const hasRibbon = typeof t.ribbon === 'string' && t.ribbon.trim() !== '';
  if (!hasKeys && !hasFormula && !hasRibbon) fail.push(`${f}: needs keys, formula or ribbon`);
  if ((t.version === '365/2021' || t.version === '2019+') && !(typeof t.alt === 'string' && t.alt.trim())) {
    fail.push(`${f}: ${t.version} trick needs an older-Excel alt`);
  }
  if (t.steps !== undefined) {
    if (!Array.isArray(t.steps) || t.steps.some(s => typeof s !== 'function')) fail.push(`${f}: steps must be functions`);
    else if (t.steps.length && typeof t.stage !== 'function') fail.push(`${f}: stage required when steps exist`);
  }
  const ti = t.tryit;
  if (ti != null) {
    if (!Array.isArray(ti.sheet) || !ti.sheet.every(Array.isArray)) fail.push(`${f}: tryit.sheet must be 2D`);
    if (typeof ti.task !== 'string' || !ti.task.trim()) fail.push(`${f}: tryit.task required`);
    if (!REF.test(ti.target || '')) fail.push(`${f}: tryit.target must be an A1 ref`);
    if (!MODES.includes(ti.mode)) fail.push(`${f}: tryit.mode must be one of ${MODES.join(', ')}`);
    if (typeof ti.answer !== 'string' || !ti.answer.startsWith('=')) fail.push(`${f}: tryit.answer must be a formula`);
    if (typeof ti.hint !== 'string' || !ti.hint.trim()) fail.push(`${f}: tryit.hint required`);
    if ((ti.mode === 'fill' || ti.mode === 'cf') && !RANGE.test(ti.fill || '')) fail.push(`${f}: tryit.fill range required`);
    if (ti.mode === 'cf' && !RANGE.test(ti.cfRange || '')) fail.push(`${f}: tryit.cfRange required`);
    if (ti.mode === 'random' && !(ti.random && ti.random.trials > 0)) fail.push(`${f}: tryit.random required`);
    if (ti.mode !== 'random' && ti.expected === undefined) fail.push(`${f}: tryit.expected required`);
  }
}

if (fail.length) {
  console.error(`check-tricks: FAIL (${fail.length})\n- ` + fail.join('\n- '));
  process.exit(1);
}
const withSteps = tricks.filter(t => t.steps && t.steps.length).length;
const withTry = tricks.filter(t => t.tryit).length;
console.log(`check-tricks: PASS — 20 tricks, ${withSteps} animated, ${withTry} try-its`);
