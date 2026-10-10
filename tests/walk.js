// Integration walk (run with the Playwright MCP: browser_run_code_unsafe { filename: this file }).
// Steps every trick slide forward and back; reports fallbacks, missing captions, stage overflow and page errors.
// Public deck: first run `async () => { globalThis.WALK_URL = 'https://inchliit.github.io/excel-to-excel/index.html'; }`.
async (page) => {
  const p = await page.context().newPage();
  await p.bringToFront();  // background pages get no animation frames, which stalls reveal and rAF polling
  await p.setViewportSize({ width: 1280, height: 720 });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const base = globalThis.WALK_URL || 'http://127.0.0.1:8797/index.html';  // set WALK_URL to walk the public deck
  await p.goto(base + '?r=' + Date.now() + '#/title');
  await p.waitForFunction(() => document.documentElement.classList.contains('deck-ready'), null, { polling: 250, timeout: 45000 });
  const report = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [];
    for (const s of document.querySelectorAll('section[data-trick]')) {
      const idx = Reveal.getIndices(s);
      const n = s.querySelectorAll('.fragment.step').length;
      const issues = [];
      Reveal.slide(idx.h, idx.v, -1);
      await wait(60);
      const animated = !s.querySelector('.stage .fallback');
      if (animated) {
        for (let k = 0; k < n; k++) {
          Reveal.slide(idx.h, idx.v, k);
          await wait(40);
          if (s.querySelector('.stage .fallback')) issues.push('fallback at step ' + k);
          if (!s.querySelector('.caption').textContent.trim()) issues.push('no caption at step ' + k);
        }
        Reveal.slide(idx.h, idx.v, n - 1);
        await wait(1600);
        const st = s.querySelector('.stage').getBoundingClientRect();
        const over = [];
        s.querySelectorAll('.stage > *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width && (r.left < st.left - 2 || r.top < st.top - 2 || r.right > st.right + 2 || r.bottom > st.bottom + 2)) over.push((el.className || el.tagName).toString().slice(0, 30));
        });
        if (over.length) issues.push('overflow at final step: ' + over.join(', '));
        for (let k = n - 2; k >= -1; k--) {
          Reveal.slide(idx.h, idx.v, k);
          await wait(30);
          if (s.querySelector('.stage .fallback')) { issues.push('fallback going back at ' + k); break; }
        }
      }
      out.push((animated ? '' : '[static] ') + s.dataset.trick + ' steps=' + n + (issues.length ? ' ISSUES: ' + issues.join(' | ') : ' ok'));
    }
    return out;
  });
  await p.close();
  return JSON.stringify({ url: base, errors, report }, null, 1);
}
