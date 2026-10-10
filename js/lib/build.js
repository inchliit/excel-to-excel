/* build.js — renders STATIC + TRICKS into reveal slides, then wires fragments to the step engine. */
(function () {
  const { esc, keycapsHTML } = window.DECK;
  const PILL = { 'All': 'v-all', '2016+': 'v-2016', '2019+': 'v-2019', '365/2021': 'v-365' };
  const params = new URLSearchParams(location.search);
  const pad = n => String(n).padStart(2, '0');
  const slideId = t => 't' + pad(t.n) + '-' + t.id;
  window.DECK.slideId = slideId;

  function notesHTML(text) {
    if (!text) return '';
    const items = String(text).split('\n').map(s => s.trim()).filter(Boolean)
      .map(l => '<li>' + esc(l.replace(/^[-•]\s*/, '')) + '</li>').join('');
    return '<aside class="notes"><ul>' + items + '</ul></aside>';
  }

  function pill(v) { return '<span class="pill ' + (PILL[v] || '') + '">' + esc(v) + '</span>'; }

  function trickSection(t) {
    const steps = Array.isArray(t.steps) ? t.steps : [];
    let how = '';
    if (t.keys && t.keys.length) how += '<div class="how-keys">' + keycapsHTML(t.keys) + '</div>';
    if (t.formula) how += '<div class="how-formula"><code>' + esc(t.formula) + '</code></div>';
    if (t.ribbon) how += '<div class="how-ribbon">' + esc(t.ribbon) + '</div>';
    let alt = '';
    if (t.alt) {
      const m = /^([^:]{3,30}):\s+(.*)$/.exec(t.alt);
      alt = '<div class="rail-alt"><b>' + esc(m ? m[1] : 'Older Excel') + '</b>' + esc(m ? m[2] : t.alt) + '</div>';
    }
    const frags = steps.map((_, k) => '<span class="fragment step" data-fragment-index="' + k + '"></span>').join('');
    const badge = t.tryit ? '<span class="try-badge">↓ Try it yourself</span>' : '';
    return '<section class="t-slide act' + t.act + '" id="' + slideId(t) + '" data-trick="' + esc(t.id) + '">' +
      '<header class="t-head"><span class="t-num">' + pad(t.n) + '</span><h2>' + esc(t.title) + '</h2>' + badge + pill(t.version) + '</header>' +
      '<aside class="rail"><p class="tagline">' + esc(t.tagline) + '</p><div class="how">' + how + '</div>' +
      '<div class="why"><span class="lbl">Why an IE cares</span>' + esc(t.why) + '</div>' + alt + '</aside>' +
      '<div class="stage"></div><div class="caption"></div>' + frags + notesHTML(t.notes) + '</section>';
  }

  function tryitSection(t) {
    return '<section class="tryit-slide act' + t.act + '" id="try-' + slideId(t) + '" data-tryit="' + esc(t.id) + '">' +
      '<header class="t-head"><span class="t-num">' + pad(t.n) + '</span><h2>Try it · ' + esc(t.title) + '</h2>' + pill(t.version) + '</header>' +
      '<div class="tryit-root"></div>' +
      '<div class="ti-print"><p><b>Your task</b>' + esc(t.tryit.task) + '</p><p><b>Answer</b><code>' + esc(t.tryit.answer) + '</code></p>' +
      '<p><b>Hint</b>' + esc(t.tryit.hint) + '</p></div>' +
      notesHTML('- Give students 60–90 seconds here.\n- Type the formula in the box and press Enter. Hint and Show answer are there if stuck.\n- Press ↑ to go back to the demo.') +
      '</section>';
  }

  function staticSection(s) {
    return '<section class="s-slide ' + (s.cls || '') + '"' + (s.id ? ' id="' + s.id + '"' : '') + '>' + s.html + notesHTML(s.notes) + '</section>';
  }

  function build() {
    const S = window.STATIC;
    const tricks = (window.TRICKS || []).slice().sort((a, b) => a.n - b.n);
    tricks.forEach(t => { const ext = (window.TRICK_EXT || {})[t.id]; if (ext) Object.assign(t, ext); });
    const byId = {};
    tricks.forEach(t => { byId[t.id] = t; });
    let html = '';
    if (params.has('dev') && window.DEV_TRICK) {
      const d = window.DEV_TRICK;
      byId[d.id] = d;
      html += d.tryit ? '<section>' + trickSection(d) + tryitSection(d) + '</section>' : trickSection(d);
    }
    S.intro(tricks).forEach(s => { html += staticSection(s); });
    [1, 2, 3, 4].forEach(act => {
      const inAct = tricks.filter(t => t.act === act);
      html += staticSection(S.divider(act, inAct));
      inAct.forEach(t => { html += t.tryit ? '<section>' + trickSection(t) + tryitSection(t) + '</section>' : trickSection(t); });
    });
    S.outro(tricks).forEach(s => { html += staticSection(s); });
    document.querySelector('.reveal .slides').innerHTML = html;
    // host logo, small, bottom-left of every slide (stacks get it on each of their inner slides)
    document.querySelectorAll('.reveal .slides section').forEach(sec => {
      if (!sec.querySelector('section')) sec.insertAdjacentHTML('beforeend', '<div class="brand"><img src="assets/logo.png" alt="Ask Lex PH Academy"></div>');
    });
    return byId;
  }

  function start() {
    const byId = build();
    const trickIn = el => (el && el.dataset && el.dataset.trick ? el : (el && el.querySelector ? el.querySelector('section[data-trick]') : null));
    const indexOf = section => section.querySelectorAll('.fragment.step.visible').length - 1;
    const renderSection = (section, animate) => {
      if (!section || !section.dataset.trick) return;
      const t = byId[section.dataset.trick];
      if (t) window.DECK.render(t, indexOf(section), animate, section);
    };
    function onSlide() {
      const { h } = Reveal.getIndices();
      [Reveal.getSlide(h - 1), Reveal.getSlide(h + 1)].forEach(s => renderSection(trickIn(s), false));
      const cur = Reveal.getCurrentSlide();
      if (cur.dataset.tryit && window.TRYIT) window.TRYIT.mount(cur, byId[cur.dataset.tryit]);
      if (window.TRYIT && window.TRYIT.sync) window.TRYIT.sync(cur);
      renderSection(cur.dataset.trick ? cur : null, false);
    }
    Reveal.initialize({
      hash: true, fragmentInURL: false, scrollActivationWidth: null, width: 1280, height: 720, margin: 0.04, minScale: 0.2, maxScale: 2.0, center: false,
      controls: true, controlsTutorial: false, progress: true, slideNumber: 'c/t',
      transition: 'slide', transitionSpeed: 'fast', backgroundTransition: 'fade', pdfSeparateFragments: false,
      plugins: window.RevealNotes ? [window.RevealNotes] : []
    }).then(() => {
      const pdf = /print-pdf/.test(location.search);
      document.querySelectorAll('section[data-trick]').forEach(s => {
        const t = byId[s.dataset.trick];
        if (pdf && t) window.DECK.render(t, (t.steps || []).length - 1, false, s);
        else renderSection(s, false);
      });
      if (pdf) { document.documentElement.classList.add('deck-ready'); return; }
      onSlide();
      Reveal.on('slidechanged', onSlide);
      Reveal.on('fragmentshown', e => { if (e.fragment.classList.contains('step')) renderSection(Reveal.getCurrentSlide(), true); });
      Reveal.on('fragmenthidden', e => { if (e.fragment.classList.contains('step')) renderSection(Reveal.getCurrentSlide(), false); });
      document.documentElement.classList.add('deck-ready');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
