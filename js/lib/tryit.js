/* tryit.js — live "Try it" boxes. Students type a formula; HyperFormula evaluates it; we check by value.
   window.TRYCORE: pure evaluation core (no DOM; also used by tests/check-tryits.mjs with the npm build).
   window.TRYIT.mount(section, trick): builds the Try-it sub-slide UI on first visit. */
(function (root) {
  const HF_URL = 'https://cdn.jsdelivr.net/npm/hyperformula@3.4.0/dist/hyperformula.full.min.js';
  const ERRORS = {
    '#NAME?': 'Excel doesn\'t recognise a name. Check the function spelling, and put text in "quotes".',
    '#N/A': 'Nothing found, or ranges of different sizes.',
    '#VALUE!': 'Wrong kind of argument: text where a number is expected?',
    '#REF!': 'A reference points outside the sheet.',
    '#DIV/0!': 'Division by zero.',
    '#ERROR!': 'Excel can\'t read this formula. Check commas, brackets and quotes.',
    '#CYCLE!': 'Circular reference: the formula refers to its own cell.',
    '#NUM!': 'A number is out of range for this function.',
    '#SPILL!': 'The result needs more room to spill.'
  };

  // ---------- references ----------
  function colIdx(s) { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
  function colName(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function ref(a1) { const m = /^([A-Z]+)(\d+)$/.exec(String(a1).toUpperCase().replace(/\$/g, '')); return { row: +m[2] - 1, col: colIdx(m[1]) }; }
  function range(r) { const [a, b] = String(r).split(':'); const p = ref(a), q = ref(b || a); return { r0: Math.min(p.row, q.row), r1: Math.max(p.row, q.row), c0: Math.min(p.col, q.col), c1: Math.max(p.col, q.col) }; }
  const a1 = (row, col) => colName(col) + (row + 1);

  // ---------- formula clean-up: forgiving, Excel-like input ----------
  function normalize(raw) {
    let f = String(raw == null ? '' : raw).trim();
    if (!f) return '';
    f = f.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'");
    if (!f.startsWith('=')) f = '=' + f;
    return f.split('"').map((seg, i) => (i % 2 ? seg : seg
      .replace(/;/g, ',')
      .replace(/\b(TRUE|FALSE)\b(?!\s*\()/gi, (m) => m.toUpperCase() + '()')
    )).join('"');
  }
  function functionsIn(f) {
    const out = new Set();
    String(f).split('"').forEach((seg, i) => { if (i % 2 === 0) (seg.match(/[A-Za-z][A-Za-z0-9.]*(?=\s*\()/g) || []).forEach(n => out.add(n.toUpperCase())); });
    return out;
  }

  // ---------- Excel-semantics FILTER(array, include, [if_empty]) ----------
  let pluginReady = false;
  function installPlugins(NS) {
    if (pluginReady) return;
    const HF = NS.HyperFormula || NS;
    const { FunctionPlugin, FunctionArgumentType, SimpleRangeValue, ArraySize, CellError, ErrorType } = NS;
    if (!FunctionPlugin) { pluginReady = true; return; }
    const truthy = v => v === true || (typeof v === 'number' && v !== 0) || (typeof v === 'string' && v.toUpperCase() === 'TRUE');
    class ExcelFilter extends FunctionPlugin {
      xlfilter(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('FILTER'), (arr, inc, ifEmpty) => {
          const data = arr.data, flags = inc.data, h = arr.height(), w = arr.width();
          let out;
          if (inc.width() === 1 && inc.height() === h) out = data.filter((row, i) => truthy(flags[i][0]));
          else if (inc.height() === 1 && inc.width() === w) { const keep = flags[0].map(truthy); out = data.map(row => row.filter((_, j) => keep[j])).filter(r => r.length); }
          else return new CellError(ErrorType.VALUE, 'FILTER: include must be one row or column matching the array');
          if (!out.length || !out[0].length) return ifEmpty !== undefined ? ifEmpty : new CellError(ErrorType.NA, 'FILTER found nothing (Excel shows #CALC!)');
          return SimpleRangeValue.onlyValues(out);
        });
      }
      xlfilterSize(ast, state) {
        if (ast.args.length < 2) return ArraySize.error();
        return this.arraySizeForAst(ast.args[0], state);
      }
    }
    ExcelFilter.implementedFunctions = {
      FILTER: {
        method: 'xlfilter', sizeOfResultArrayMethod: 'xlfilterSize', enableArrayArithmeticForArguments: true, vectorizationForbidden: true,
        parameters: [{ argumentType: FunctionArgumentType.RANGE }, { argumentType: FunctionArgumentType.RANGE }, { argumentType: FunctionArgumentType.ANY, optionalArg: true }]
      }
    };
    try { HF.unregisterFunction('FILTER'); } catch (e) { /* not registered */ }
    HF.registerFunction('FILTER', ExcelFilter, { enGB: { FILTER: 'FILTER' }, enUS: { FILTER: 'FILTER' } });
    pluginReady = true;
  }

  // ---------- evaluation ----------
  function build(NS, sheet) {
    installPlugins(NS);
    const HF = NS.HyperFormula || NS;
    const data = (sheet || []).map(r => r.map(v => (v === '' || v === undefined ? null : v)));
    return HF.buildFromArray(data, { licenseKey: 'gpl-v3', useArrayArithmetic: true });
  }
  const isErr = v => v && typeof v === 'object' && 'type' in v && 'value' in v;
  const empty = v => v === null || v === undefined || v === '';
  function display(v) {
    if (isErr(v)) return v.value;
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') return String(+v.toFixed(4));
    return empty(v) ? '' : String(v);
  }
  function same(a, b) {
    if (typeof b === 'number') return typeof a === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
    if (typeof b === 'boolean') return a === b || (typeof a === 'number' && (a !== 0) === b);
    if (typeof b === 'string') return typeof a === 'string' && a.trim().toUpperCase() === b.trim().toUpperCase();
    return empty(a) && empty(b);
  }
  function errorResult(v) {
    return { status: 'error', title: v.value, message: ERRORS[v.value] || 'Excel would show ' + v.value + '.' };
  }

  function evaluate(NS, ti, raw) {
    const f = normalize(raw);
    if (!f || f === '=') return { status: 'empty', title: 'Type a formula first', message: 'Start with = and press Enter.' };
    const hf = build(NS, ti.sheet);
    const t = ref(ti.target);
    const A = (row, col) => ({ sheet: 0, row, col });
    const cells = {};
    try {
      hf.setCellContents(A(t.row, t.col), [[f]]);
      if (ti.mode === 'fill' || ti.mode === 'cf') {
        const g = range(ti.fill);
        hf.copy({ start: A(t.row, t.col), end: A(t.row, t.col) });
        for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) if (r !== t.row || c !== t.col) hf.paste(A(r, c));
      }
    } catch (e) {
      return { status: 'error', title: '#ERROR!', message: ERRORS['#ERROR!'], cells };
    }
    const get = (row, col) => hf.getCellValue(A(row, col));
    let ok = true, firstErr = null, result;

    if (ti.mode === 'value' || ti.mode === 'random') {
      const v = get(t.row, t.col);
      cells[ti.target] = display(v);
      if (isErr(v)) return Object.assign(errorResult(v), { cells });
      if (ti.mode === 'value') ok = same(v, ti.expected);
      else {
        if (typeof v !== 'number') return { status: 'wrong', title: 'Not a number', message: 'The formula should return a time in minutes.', cells };
        const n = (ti.random && ti.random.trials) || 500, samples = [];
        for (let i = 0; i < n; i++) { hf.setCellContents(A(t.row, t.col), [[f]]); const x = get(t.row, t.col); if (typeof x === 'number') samples.push(x); }
        const mean = samples.reduce((s, x) => s + x, 0) / Math.max(1, samples.length);
        const sd = Math.sqrt(samples.reduce((s, x) => s + (x - mean) * (x - mean), 0) / Math.max(1, samples.length - 1));
        ok = samples.length === n && Math.abs(mean - ti.random.mean) <= 0.1 * Math.abs(ti.random.mean);
        result = { samples, mean, sd };
      }
    } else if (ti.mode === 'spill') {
      const exp = ti.expected;
      for (let i = 0; i < exp.length; i++) for (let j = 0; j < exp[i].length; j++) {
        const v = get(t.row + i, t.col + j);
        cells[a1(t.row + i, t.col + j)] = display(v);
        if (isErr(v) && !firstErr) firstErr = v;
        if (!same(v, exp[i][j])) ok = false;
      }
      const below = get(t.row + exp.length, t.col);
      if (!empty(below) && !isErr(below)) { ok = false; cells[a1(t.row + exp.length, t.col)] = display(below); }
      if (firstErr && !ok) return Object.assign(errorResult(firstErr), { cells });
    } else {
      const g = range(ti.fill);
      for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) {
        const v = get(r, c);
        cells[a1(r, c)] = display(v);
        if (isErr(v) && !firstErr) firstErr = v;
        if (!same(v, ti.expected[r - g.r0][c - g.c0])) ok = false;
      }
      if (firstErr && !ok) return Object.assign(errorResult(firstErr), { cells });
    }

    const out = { status: ok ? 'ok' : 'wrong', cells, formula: f };
    if (result) Object.assign(out, result);
    if (ti.mode === 'cf') {
      const g = range(ti.fill);
      out.cfRows = [];
      for (let r = g.r0; r <= g.r1; r++) if (get(r, g.c0) === true) out.cfRows.push(r);
    }
    if (ok) {
      const used = functionsIn(f);
      const missing = (ti.mustUse || []).filter(fn => !used.has(fn.toUpperCase()));
      out.title = 'Correct!';
      out.message = ti.mode === 'fill' ? 'Every cell matches, and the $ signs did their job.' : ti.mode === 'cf' ? 'Exactly the out-of-control rows light up.' : 'That\'s exactly what Excel returns.';
      if (missing.length) out.nudge = 'Right answer! Now try it with ' + missing.join(' + ') + ', the trick from this slide.';
    } else {
      out.title = 'Not quite';
      out.message = ti.hint || 'Compare your result with the task.';
    }
    return out;
  }

  root.TRYCORE = { evaluate, normalize, functionsIn, display, ref, range, a1, HF_URL };

  // ---------- DOM: the Try-it sub-slide ----------
  if (typeof document === 'undefined') return;

  let hfPromise = null;
  function loadHF() {
    if (root.HyperFormula) return Promise.resolve(root.HyperFormula);
    if (hfPromise) return hfPromise;
    const params = new URLSearchParams(location.search);
    const url = params.get('hfurl') === 'bad' ? 'https://invalid.invalid/hyperformula.js' : HF_URL;
    hfPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      const timer = setTimeout(() => reject(new Error('timeout')), 8000);
      s.src = url;
      s.onload = () => { clearTimeout(timer); root.HyperFormula ? resolve(root.HyperFormula) : reject(new Error('missing')); };
      s.onerror = () => { clearTimeout(timer); reject(new Error('blocked')); };
      document.head.appendChild(s);
    });
    hfPromise.catch(() => {});
    return hfPromise;
  }

  function expectedText(ti) {
    if (ti.mode === 'random') return 'a random time around ' + ti.random.mean + ' min';
    if (ti.mode === 'value') return display(ti.expected);
    return 'the highlighted results';
  }

  function mount(section, trick) {
    if (!trick || !trick.tryit || section.dataset.mounted) return;
    section.dataset.mounted = '1';
    const ti = trick.tryit;
    const esc = s => window.DECK.esc(s);
    const rootEl = section.querySelector('.tryit-root');
    rootEl.innerHTML =
      '<div class="ti-sheet"></div>' +
      '<div class="ti-side">' +
      '<div class="ti-task"><b>Your task</b>' + esc(ti.task) + '</div>' +
      '<div class="ti-input-row"><input class="ti-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
      'placeholder="=formula for ' + esc(ti.target) + '" aria-label="Formula for ' + esc(ti.target) + '"><button class="ti-btn primary ti-go">Enter</button></div>' +
      '<div class="ti-btns"><button class="ti-btn ti-hint">Hint</button><button class="ti-btn ti-show">Show answer</button><button class="ti-btn ti-reset">Reset</button></div>' +
      '<div class="ti-msg">Type your formula and press <b>Enter</b>.</div>' +
      (ti.mode === 'random' ? '<button class="ti-btn ti-run" disabled>Run 500 trials</button><div class="ti-hist"></div>' : '') +
      '<div class="ti-status">Formula engine: not loaded yet</div>' +
      '</div>';
    const input = rootEl.querySelector('.ti-input');
    const msg = rootEl.querySelector('.ti-msg');
    const status = rootEl.querySelector('.ti-status');
    const sheetEl = rootEl.querySelector('.ti-sheet');
    let grid = null, last = null;

    // grid sized to the sheet plus target / fill / spill area
    const sheet = ti.sheet;
    const t = ref(ti.target);
    let rows = sheet.length, cols = Math.max(...sheet.map(r => r.length));
    if (ti.fill) { const g = range(ti.fill); rows = Math.max(rows, g.r1 + 1); cols = Math.max(cols, g.c1 + 1); }
    if (ti.mode === 'spill' && Array.isArray(ti.expected)) { rows = Math.max(rows, t.row + ti.expected.length + 1); cols = Math.max(cols, t.col + ti.expected[0].length); }
    rows = Math.max(rows, t.row + 2); cols = Math.max(cols, t.col + 1);
    const widths = Array.from({ length: cols }, (_, c) => {
      let len = 3;
      sheet.forEach(r => { if (r[c] != null) len = Math.max(len, String(r[c]).length); });
      return Math.max(58, Math.min(150, len * 9 + 18));
    });
    const fakeCtx = { el: sheetEl, animate: false, alive: () => true, later() {} };
    function drawGrid() {
      sheetEl.innerHTML = '';
      grid = new window.XGrid(fakeCtx, { cols, rows, colWidths: widths, data: sheet, fontSize: 14 });
      grid.cell(ti.target).classList.add('ti-target');
      grid.select(ti.target);
    }
    drawGrid();

    function setStatus(s) { status.textContent = 'Formula engine: ' + s; }
    function ensure() {
      setStatus('loading…');
      return loadHF().then(ns => { setStatus('ready'); return ns; }, err => { setStatus('offline'); throw err; });
    }
    function show(kind, html) { msg.className = 'ti-msg' + (kind ? ' ' + kind : ''); msg.innerHTML = html; }

    function check(formula) {
      ensure().then(NS => {
        drawGrid();
        const r = evaluate(NS, ti, formula);
        last = r;
        Object.keys(r.cells || {}).forEach(k => {
          const el = grid.cell(k);
          if (!el) return;
          el.textContent = r.cells[k];
          el.classList.toggle('ti-err', /^#/.test(r.cells[k]));
        });
        grid.formulaBar(r.formula || normalize(formula));
        if (r.cfRows && ti.cfRange) {
          const g = range(ti.cfRange);
          r.cfRows.forEach(row => { for (let c = g.c0; c <= g.c1; c++) { const el = grid.cell(a1(row, c)); if (el) el.classList.add('ti-cf'); } });
        }
        if (r.status === 'ok') show(r.nudge ? 'tip' : 'ok', '<b>' + esc(r.title) + '</b> ' + esc(r.nudge || r.message));
        else if (r.status === 'error') show('bad', '<b>' + esc(r.title) + '</b> ' + esc(r.message));
        else if (r.status === 'empty') show('', esc(r.message));
        else show('bad', '<b>' + esc(r.title) + '.</b> Hint: ' + esc(r.message));
        const run = rootEl.querySelector('.ti-run');
        if (run) run.disabled = r.status !== 'ok';
      }).catch(() => {
        show('tip', 'The live checker couldn\'t load (network). Try this in Excel instead: <code>' + esc(ti.answer) + '</code> → ' + esc(expectedText(ti)));
      });
    }

    // Prefetch the engine when the slide opens so it is ready before students type; fall back right away if blocked.
    ensure().catch(() => show('tip', 'The live checker couldn\'t load (network). Try this in Excel instead: <code>' + esc(ti.answer) + '</code> → ' + esc(expectedText(ti))));
    input.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); check(input.value); } });
    ['keyup', 'keypress'].forEach(type => input.addEventListener(type, e => e.stopPropagation()));
    rootEl.querySelector('.ti-go').addEventListener('click', () => check(input.value));
    rootEl.querySelector('.ti-hint').addEventListener('click', () => show('tip', '<b>Hint:</b> ' + esc(ti.hint)));
    rootEl.querySelector('.ti-show').addEventListener('click', () => { input.value = ti.answer; check(ti.answer); });
    rootEl.querySelector('.ti-reset').addEventListener('click', () => { input.value = ''; drawGrid(); show('', 'Type your formula and press <b>Enter</b>.'); const h = rootEl.querySelector('.ti-hist'); if (h) h.innerHTML = ''; });
    const run = rootEl.querySelector('.ti-run');
    if (run) run.addEventListener('click', () => {
      if (!last || !last.samples) return;
      const hist = rootEl.querySelector('.ti-hist');
      hist.innerHTML = '';
      const hctx = { el: hist, animate: true, alive: () => true, later(ms, fn) { setTimeout(fn, ms); } };
      hctx.box = ({ x = 0, y = 0, w = null, h = null, cls = '', html = '' } = {}) => {
        const d = document.createElement('div'); d.className = ('box ' + cls).trim(); d.style.position = 'absolute';
        d.style.left = x + 'px'; d.style.top = y + 'px'; if (w != null) d.style.width = w + 'px'; if (h != null) d.style.height = h + 'px';
        d.innerHTML = html; hist.appendChild(d); return d;
      };
      window.XCharts(hctx).histogram({ x: 0, y: 0, w: hist.clientWidth || 340, h: 170, values: last.samples, bins: 18,
        title: '500 trials · mean ' + last.mean.toFixed(2) + ' · SD ' + last.sd.toFixed(2) });
    });
  }

  root.TRYIT = { mount, loadHF };
})(typeof window !== 'undefined' ? window : globalThis);
