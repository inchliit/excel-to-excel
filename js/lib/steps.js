/* steps.js — replays a trick's steps onto its slide stage (deterministic replay model).
   render(trick, i): clear stage → stage(ctx) → steps 0..i-1 instantly → step i animated.
   Any render bumps the generation, so timers from older renders die (ctx.alive() === false). */
(function () {
  let generation = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  const MODIFIERS = ['Ctrl', 'Shift', 'Alt', 'Cmd', '⌘', 'Option', 'Fn', 'Win'];
  // Chord (Ctrl+Alt+V) when every key but the last is a modifier; otherwise a sequence (Alt, A, V, V).
  function isChord(keys) { return keys.slice(0, -1).every(k => MODIFIERS.includes(k)); }
  function keycapsHTML(keys) {
    if (!keys || !keys.length) return '';
    const chord = isChord(keys);
    const sep = chord ? '<span class="kplus">+</span>' : '<span class="kthen">,</span>';
    return '<span class="keys">' + keys.map(k => '<kbd>' + esc(k) + '</kbd>').join(sep) + '</span>';
  }

  function fallback(trick) {
    const d = document.createElement('div');
    d.className = 'fallback';
    let how = '';
    if (trick.formula) how += '<div class="fb-formula"><span class="fx">fx</span><code>' + esc(trick.formula) + '</code></div>';
    if (trick.keys && trick.keys.length) how += '<div class="fb-keys">' + keycapsHTML(trick.keys) + '</div>';
    if (trick.ribbon) how += '<div class="fb-ribbon">' + esc(trick.ribbon) + '</div>';
    d.innerHTML = how + '<p class="fb-tagline">' + esc(trick.tagline) + '</p>';
    return d;
  }

  function makeCtx(slideEl, stageEl, captionEl, gen) {
    const ctx = {
      el: stageEl,
      slide: slideEl,
      animate: false,
      alive: () => gen === generation,
      later(ms, fn) { setTimeout(() => { if (ctx.alive()) fn(); }, ms); },
      caption(text) {
        captionEl.innerHTML = text || '';
        captionEl.classList.toggle('show', !!text);
        captionEl.classList.remove('cap-in');
        if (text && ctx.animate) { void captionEl.offsetWidth; captionEl.classList.add('cap-in'); }
      },
      box({ x = 0, y = 0, w = null, h = null, cls = '', html = '' } = {}) {
        const d = document.createElement('div');
        d.className = ('box ' + cls).trim();
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        if (w != null) d.style.width = w + 'px';
        if (h != null) d.style.height = h + 'px';
        d.innerHTML = html;
        stageEl.appendChild(d);
        return d;
      },
      grid(opts) { return new window.XGrid(ctx, opts); }
    };
    ctx.ui = window.XUI ? window.XUI(ctx) : null;
    ctx.charts = window.XCharts ? window.XCharts(ctx) : null;
    return ctx;
  }

  function render(trick, index, animate, slideEl) {
    const gen = ++generation;
    const stageEl = slideEl.querySelector('.stage');
    const captionEl = slideEl.querySelector('.caption') || document.createElement('div');
    stageEl.innerHTML = '';
    captionEl.innerHTML = '';
    captionEl.classList.remove('show', 'cap-in');
    stageEl.classList.add('instant');
    const ctx = makeCtx(slideEl, stageEl, captionEl, gen);
    const steps = Array.isArray(trick.steps) ? trick.steps : [];
    const last = Math.min(index, steps.length - 1);
    try {
      if (typeof trick.stage !== 'function') throw new Error('no stage');
      trick.stage(ctx, false);
      for (let k = 0; k < last; k++) steps[k](ctx, false);
      if (last >= 0) {
        if (animate) {
          void stageEl.offsetWidth;
          stageEl.classList.remove('instant');
          ctx.animate = true;
        }
        steps[last](ctx, !!animate);
      }
    } catch (err) {
      if (err.message !== 'no stage') console.error('[deck] trick "' + (trick.id || '?') + '" failed at step ' + index, err);
      stageEl.innerHTML = '';
      captionEl.innerHTML = '';
      stageEl.appendChild(fallback(trick));
    }
    return ctx;
  }

  window.DECK = { render, fallback, keycapsHTML, isChord, esc };
})();
