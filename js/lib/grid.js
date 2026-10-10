/* grid.js — XGrid: an Excel-look mini sheet for animated demos. Created via ctx.grid(opts).
   Overlay geometry is computed from column widths / row height (no layout reads), so it is correct
   even while a slide is hidden. Animation classes are only added when the current step animates. */
(function () {
  const REF_COLORS = ['#4472C4', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'];

  function colIdx(letters) { let n = 0; for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
  function colName(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function parseRef(ref) {
    const m = /^([A-Z]+)(\d+)$/.exec(String(ref).replace(/\$/g, '').toUpperCase());
    if (!m) throw new Error('bad ref ' + ref);
    return { c: colIdx(m[1]), r: +m[2] - 1 };
  }
  function parseRange(rng) {
    const [a, b] = String(rng).split(':');
    const p = parseRef(a), q = parseRef(b || a);
    return { r0: Math.min(p.r, q.r), r1: Math.max(p.r, q.r), c0: Math.min(p.c, q.c), c1: Math.max(p.c, q.c) };
  }
  function refOf(r, c) { return colName(c) + (r + 1); }

  function fmt(v, f) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v !== 'number' || f === 'text') return String(v);
    switch (f) {
      case '0': return String(Math.round(v));
      case '0.0': return v.toFixed(1);
      case '0.00': return v.toFixed(2);
      case '0.000': return v.toFixed(3);
      case '0%': return Math.round(v * 100) + '%';
      case '0.0%': return (v * 100).toFixed(1) + '%';
      case '#,##0': return Math.round(v).toLocaleString('en-US');
      case '#,##0.00': return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default: return Number.isInteger(v) ? String(v) : String(+v.toPrecision(10));
    }
  }

  // Colour A1 refs in a formula the way Excel does while editing.
  function colorize(text) {
    const esc = window.DECK.esc;
    if (!String(text).startsWith('=')) return esc(text);
    let i = 0;
    const seen = {};
    const refs = seg => seg.replace(/(\$?[A-Z]{1,2}\$?\d{1,4}(?::\$?[A-Z]{1,2}\$?\d{1,4})?)(?![A-Za-z(])/g, m => {
      const key = m.replace(/\$/g, '');
      if (!(key in seen)) seen[key] = i++ % REF_COLORS.length;
      return '<span class="xg-r" style="color:' + REF_COLORS[seen[key]] + '">' + m + '</span>';
    });
    // only colour references outside "quoted text" (e.g. the criterion "L2" is text, not a cell)
    return String(text).split('"').map((seg, k) => (k % 2 ? esc(seg) : refs(esc(seg)))).join('&quot;');
  }

  class XGrid {
    constructor(ctx, o = {}) {
      this.ctx = ctx;
      this.cols = o.cols || 6;
      this.rows = o.rows || 8;
      this.fs = o.fontSize || 15;
      this.rowH = Math.round(this.fs * 2);
      this.headH = 24;
      this.rowHeadW = 38;
      this.widths = Array.from({ length: this.cols }, (_, i) => (o.colWidths && o.colWidths[i]) || 90);
      this.formats = o.formats || {};
      this.header = o.header !== false;
      this.vals = {};
      this.forms = {};
      this.cells = {};
      this.typing = {};

      const root = document.createElement('div');
      root.className = 'xg box';
      root.style.left = (o.x || 0) + 'px';
      root.style.top = (o.y || 0) + 'px';
      root.style.fontSize = this.fs + 'px';
      const bar = o.formulaBar === false ? '' :
        '<div class="xg-bar">' + (o.nameBox === false ? '' : '<div class="xg-namebox"></div>') +
        '<div class="xg-fx">fx</div><div class="xg-fx-text"></div></div>';
      root.innerHTML = bar + '<div class="xg-sheet"></div>' + (o.title ? '<div class="xg-tab"><span>' + window.DECK.esc(o.title) + '</span></div>' : '');
      const sheet = root.querySelector('.xg-sheet');
      sheet.style.gridTemplateColumns = this.rowHeadW + 'px ' + this.widths.map(w => w + 'px').join(' ');
      sheet.style.gridTemplateRows = this.headH + 'px repeat(' + this.rows + ', ' + this.rowH + 'px)';
      let html = '<div class="xg-corner"></div>';
      for (let c = 0; c < this.cols; c++) html += '<div class="xg-colhead" data-col="' + c + '">' + colName(c) + '</div>';
      for (let r = 0; r < this.rows; r++) {
        html += '<div class="xg-rowhead" data-row="' + (r + 1) + '">' + (r + 1) + '</div>';
        for (let c = 0; c < this.cols; c++) html += '<div class="xg-cell' + (this.header && r === 0 ? ' head' : '') + '" data-ref="' + refOf(r, c) + '"></div>';
      }
      sheet.innerHTML = html + '<div class="xg-sel" style="display:none"><i class="xg-handle"></i></div>';
      sheet.querySelectorAll('.xg-cell').forEach(el => { this.cells[el.dataset.ref] = el; });
      this.el = root;
      this.sheet = sheet;
      this.selEl = sheet.querySelector('.xg-sel');
      this.nameEl = root.querySelector('.xg-namebox');
      this.fxEl = root.querySelector('.xg-fx-text');
      ctx.el.appendChild(root);
      (o.data || []).forEach((row, r) => row.forEach((v, c) => { if (r < this.rows && c < this.cols) this.set(refOf(r, c), v); }));
    }

    get animating() { return !!this.ctx.animate; }
    formatOf(ref) {
      const { r, c } = parseRef(ref);
      for (const k in this.formats) {
        const g = parseRange(k);
        if (r >= g.r0 && r <= g.r1 && c >= g.c0 && c <= g.c1) return this.formats[k];
      }
      return null;
    }
    eachRef(rng, fn) {
      const g = parseRange(rng);
      let i = 0;
      for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) fn(refOf(r, c), i++, r - g.r0, c - g.c0);
    }
    box(rng) {
      const g = parseRange(rng);
      let left = this.rowHeadW;
      for (let c = 0; c < g.c0; c++) left += this.widths[c];
      let width = 0;
      for (let c = g.c0; c <= g.c1; c++) width += this.widths[c];
      return { left, top: this.headH + g.r0 * this.rowH, width, height: (g.r1 - g.r0 + 1) * this.rowH };
    }
    overlay(rng, cls, color) {
      const b = this.box(rng);
      const d = document.createElement('div');
      d.className = cls;
      Object.assign(d.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
      if (color) d.style.setProperty('--rc', color);
      this.sheet.appendChild(d);
      return d;
    }

    cell(ref) { return this.cells[String(ref).replace(/\$/g, '')]; }
    value(ref) { return this.vals[String(ref).replace(/\$/g, '')]; }
    set(ref, v) {
      ref = String(ref).replace(/\$/g, '');
      const el = this.cells[ref];
      if (!el) return;
      let formula = null;
      if (v && typeof v === 'object' && 'v' in v) { formula = v.f || null; v = v.v; }
      this.vals[ref] = v;
      if (formula) this.forms[ref] = formula; else delete this.forms[ref];
      el.textContent = fmt(v, this.formatOf(ref));
      el.classList.toggle('num', typeof v === 'number');
      el.classList.remove('editing');
      // A value set while type() is still animating this cell wins: cancel the typing timers, show the full content.
      const t = this.typing[ref];
      if (t && t.active) { t.active = false; t.token++; this.formulaBar(this.contentOf(ref)); }
    }
    setRange(anchor, rows) {
      const a = parseRef(anchor);
      rows.forEach((row, i) => row.forEach((v, j) => this.set(refOf(a.r + i, a.c + j), v)));
    }
    contentOf(ref) {
      ref = String(ref).replace(/\$/g, '');
      if (this.forms[ref]) return this.forms[ref];
      const v = this.vals[ref];
      return v === undefined || v === null ? '' : (typeof v === 'number' ? String(v) : fmt(v, 'text'));
    }
    formulaBar(text) { if (this.fxEl) this.fxEl.innerHTML = colorize(text || ''); }
    select(rng) {
      const b = this.box(rng);
      Object.assign(this.selEl.style, { display: 'block', left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
      const anchor = String(rng).split(':')[0].replace(/\$/g, '');
      if (this.nameEl) this.nameEl.textContent = anchor;
      this.formulaBar(this.contentOf(anchor));
      const g = parseRange(rng);
      this.sheet.querySelectorAll('.xg-colhead, .xg-rowhead').forEach(h => {
        const on = h.dataset.col != null ? (+h.dataset.col >= g.c0 && +h.dataset.col <= g.c1) : (+h.dataset.row - 1 >= g.r0 && +h.dataset.row - 1 <= g.r1);
        h.classList.toggle('act', on);
      });
    }
    deselect() { this.selEl.style.display = 'none'; this.sheet.querySelectorAll('.act').forEach(h => h.classList.remove('act')); }
    type(ref, text, animate = this.animating) {
      const el = this.cell(ref);
      if (!el) return;
      this.select(ref);
      el.classList.add('editing');
      el.classList.remove('num');
      if (!animate) { el.textContent = text; this.formulaBar(text); return; }
      const ctx = this.ctx;
      const key = String(ref).replace(/\$/g, '');
      const t = this.typing[key] || (this.typing[key] = { token: 0, active: false });
      const token = ++t.token;
      t.active = true;
      const step = Math.max(18, Math.min(55, 1600 / Math.max(1, text.length)));
      el.textContent = '';
      if (this.fxEl) this.fxEl.textContent = '';
      for (let i = 1; i <= text.length; i++) {
        ctx.later(i * step, () => {
          if (t.token !== token) return;
          el.textContent = text.slice(0, i);
          if (this.fxEl) { if (i === text.length) this.formulaBar(text); else this.fxEl.textContent = text.slice(0, i); }
          if (i === text.length) t.active = false;
        });
      }
    }
    enter(ref, display, formula = null, animate = this.animating) {
      this.set(ref, formula ? { v: display, f: formula } : display);
      if (animate) this.flash(ref);
    }
    mark(rng, cls) {
      if (cls === 'ants') { this.overlay(rng, 'xg-ants'); return; }
      this.eachRef(rng, ref => { const el = this.cells[ref]; if (el) el.classList.add(cls); });
    }
    unmark(cls, rng = null) {
      if (cls === 'ants') { this.sheet.querySelectorAll('.xg-ants').forEach(e => e.remove()); return; }
      if (rng) this.eachRef(rng, ref => { const el = this.cells[ref]; if (el) el.classList.remove(cls); });
      else this.sheet.querySelectorAll('.' + cls).forEach(el => el.classList.remove(cls));
    }
    refBox(rng, i = 0) { return this.overlay(rng, 'xg-ref', REF_COLORS[i % REF_COLORS.length]); }
    clearRefs() { this.sheet.querySelectorAll('.xg-ref').forEach(e => e.remove()); }
    flash(rng) {
      if (!this.animating) return;
      const els = [];
      this.eachRef(rng, ref => { const el = this.cells[ref]; if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); els.push(el); } });
      this.ctx.later(1200, () => els.forEach(el => el.classList.remove('flash')));
    }
    cascade(rng, rows, animate) {
      const a = String(rng).split(':')[0];
      const p = parseRef(a);
      rows.forEach((row, i) => row.forEach((v, j) => {
        const ref = refOf(p.r + i, p.c + j);
        this.set(ref, v);
        if (animate && this.cells[ref]) {
          const el = this.cells[ref];
          el.style.animationDelay = ((i + j) * 70) + 'ms';
          el.classList.add('pop');
        }
      }));
    }
    fill(fromRef, toRange, rows, animate = this.animating) {
      if (animate) {
        this.select(fromRef);
        void this.selEl.offsetWidth;
        this.selEl.classList.add('dragging');
      }
      this.cascade(toRange, rows, animate);
      this.select(toRange);
    }
    spill(anchor, rows, animate = this.animating) {
      const p = parseRef(anchor);
      const end = refOf(p.r + rows.length - 1, p.c + Math.max(...rows.map(r => r.length)) - 1);
      this.cascade(anchor, rows, animate);
      this.eachRef(anchor + ':' + end, ref => { const el = this.cells[ref]; if (el) el.classList.add('spill'); });
      this.sheet.querySelectorAll('.xg-spill').forEach(e => e.remove());
      this.overlay(anchor + ':' + end, 'xg-spill');
    }
  }

  XGrid.parseRef = parseRef;
  XGrid.parseRange = parseRange;
  XGrid.refOf = refOf;
  XGrid.colName = colName;
  XGrid.fmt = fmt;
  XGrid.colorize = colorize;
  XGrid.REF_COLORS = REF_COLORS;
  window.XGrid = XGrid;
})();
