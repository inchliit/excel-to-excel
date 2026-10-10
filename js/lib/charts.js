/* charts.js — small SVG charts on the stage. window.XCharts(ctx) → { bars, pareto, line, histogram, sparkline }.
   Every chart returns its container element. Animation classes only when the step animates. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function fmtNum(v) {
    if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString('en-US');
    return String(+(+v).toPrecision(4));
  }

  window.XCharts = function (ctx) {
    const A = () => !!ctx.animate;

    function frame({ x = 0, y = 0, w = 420, h = 260, title = '' }, animate) {
      const box = ctx.box({ x, y, w, h, cls: 'xc' + (animate ? ' anim' : '') });
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      box.appendChild(svg);
      const add = (tag, attrs = {}, text = null, parent = svg) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (text != null) e.textContent = text;
        parent.appendChild(e);
        return e;
      };
      if (title) add('text', { x: 12, y: 20, class: 'ttl' }, title);
      return { box, svg, add, top: title ? 32 : 14 };
    }

    function axes(f, L, T, W, H, yMax, ticks = 4, fmt = fmtNum) {
      for (let i = 0; i <= ticks; i++) {
        const yy = T + H - (H * i) / ticks;
        f.add('line', { x1: L, x2: L + W, y1: yy, y2: yy, class: i ? 'gridl' : 'ax' });
        f.add('text', { x: L - 6, y: yy + 4, 'text-anchor': 'end' }, fmt((yMax * i) / ticks));
      }
    }

    return {
      bars({ x, y, w = 420, h = 260, data = [], title = '', color = null, animate = A() } = {}) {
        const f = frame({ x, y, w, h, title }, animate);
        const L = 46, R = 12, T = f.top, B = 34, W = w - L - R, H = h - T - B;
        const yMax = niceMax(Math.max(...data.map(d => d.value)));
        axes(f, L, T, W, H, yMax);
        const slot = W / data.length, bw = slot * 0.62;
        data.forEach((d, i) => {
          const bh = (H * d.value) / yMax, bx = L + slot * i + (slot - bw) / 2;
          const r = f.add('rect', { x: bx, y: T + H - bh, width: bw, height: bh, class: 'bar' + (d.cls ? ' ' + d.cls : ''), style: '--i:' + i });
          if (color) r.style.fill = color;
          f.add('text', { x: bx + bw / 2, y: T + H + 16, 'text-anchor': 'middle' }, d.label);
          f.add('text', { x: bx + bw / 2, y: T + H - bh - 5, 'text-anchor': 'middle', class: 'lbl' }, fmtNum(d.value));
        });
        return f.box;
      },

      pareto({ x, y, w = 460, h = 300, data = [], line80 = true, title = '', animate = A() } = {}) {
        const f = frame({ x, y, w, h, title }, animate);
        const sorted = data.slice().sort((a, b) => b.value - a.value);
        const total = sorted.reduce((s, d) => s + d.value, 0);
        let run = 0;
        const cum = sorted.map(d => (run += d.value) / total);
        const L = 46, R = 46, T = f.top + 6, B = 40, W = w - L - R, H = h - T - B;
        const yMax = niceMax(sorted[0] ? sorted[0].value : 1);
        axes(f, L, T, W, H, yMax);
        for (let i = 0; i <= 4; i++) f.add('text', { x: L + W + 6, y: T + H - (H * i) / 4 + 4 }, (i * 25) + '%');
        const slot = W / sorted.length, bw = slot * 0.8;
        sorted.forEach((d, i) => {
          const bh = (H * d.value) / yMax, bx = L + slot * i + (slot - bw) / 2;
          f.add('rect', { x: bx, y: T + H - bh, width: bw, height: bh, class: 'bar' + (cum[i] <= 0.8 || i === 0 || cum[i - 1] < 0.8 ? '' : ' alt'), style: '--i:' + i });
          f.add('text', { x: bx + bw / 2, y: T + H + 15, 'text-anchor': 'middle', style: 'font-size:11px' }, d.label);
        });
        const pts = cum.map((c, i) => [L + slot * i + slot / 2, T + H - H * c]);
        f.add('path', { d: 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), class: 'ln', stroke: '#e8590c', pathLength: 1 });
        pts.forEach((p, i) => {
          f.add('circle', { cx: p[0], cy: p[1], r: 4, fill: '#e8590c', class: 'pt' });
          f.add('text', { x: p[0], y: p[1] - 9, 'text-anchor': 'middle', class: 'lbl', style: 'font-size:11px;font-weight:700;fill:#c2410c' }, (cum[i] * 100).toFixed(1) + '%');
        });
        if (line80) {
          const yy = T + H - H * 0.8;
          f.add('line', { x1: L, x2: L + W, y1: yy, y2: yy, class: 'hline', stroke: '#e03131' });
          f.add('text', { x: L + 4, y: yy - 5, class: 'lbl', style: 'fill:#e03131;font-weight:700' }, '80%');
        }
        f.box.dataset.cum = JSON.stringify(cum.map(c => +(c * 100).toFixed(1)));
        return f.box;
      },

      line({ x, y, w = 480, h = 280, series = [], hlines = [], band = null, highlight = [], labels = null, yMin = null, yMax = null, title = '', animate = A() } = {}) {
        const f = frame({ x, y, w, h, title }, animate);
        const L = 50, R = 70, T = f.top + 6, B = 30, W = w - L - R, H = h - T - B;
        const all = [];
        series.forEach(s => all.push(...s.values));
        hlines.forEach(l => all.push(l.y));
        if (band) all.push(...band.lo, ...band.hi);
        const lo = yMin != null ? yMin : Math.min(...all), hi = yMax != null ? yMax : Math.max(...all);
        const pad = (hi - lo) * 0.08 || 1;
        const y0 = yMin != null ? yMin : lo - pad, y1 = yMax != null ? yMax : hi + pad;
        const n = Math.max(...series.map(s => s.values.length), band ? band.start + band.lo.length : 0);
        const X = i => L + (n <= 1 ? W / 2 : (W * i) / (n - 1));
        const Y = v => T + H - (H * (v - y0)) / (y1 - y0);
        for (let i = 0; i <= 4; i++) {
          const v = y0 + ((y1 - y0) * i) / 4, yy = Y(v);
          f.add('line', { x1: L, x2: L + W, y1: yy, y2: yy, class: i ? 'gridl' : 'ax' });
          f.add('text', { x: L - 6, y: yy + 4, 'text-anchor': 'end' }, fmtNum(+v.toPrecision(4)));
        }
        if (labels) labels.forEach((t, i) => { if (t) f.add('text', { x: X(i), y: T + H + 16, 'text-anchor': 'middle', style: 'font-size:11px' }, t); });
        if (band) {
          const up = band.hi.map((v, i) => X(band.start + i) + ',' + Y(v));
          const dn = band.lo.map((v, i) => X(band.start + i) + ',' + Y(v)).reverse();
          f.add('polygon', { points: up.concat(dn).join(' '), class: 'band' });
        }
        hlines.forEach(l => {
          f.add('line', { x1: L, x2: L + W, y1: Y(l.y), y2: Y(l.y), class: 'hline', stroke: l.color || '#e03131', 'stroke-dasharray': l.dashed === false ? 'none' : '6 4' });
          if (l.label) f.add('text', { x: L + W + 6, y: Y(l.y) + 4, style: 'font-weight:700;fill:' + (l.color || '#e03131') }, l.label);
        });
        series.forEach(s => {
          const off = s.start || 0;
          const d = 'M' + s.values.map((v, i) => X(off + i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' L');
          const p = f.add('path', { d, class: 'ln', stroke: s.color || '#2f6fd6', pathLength: 1 });
          if (s.dashed) p.setAttribute('style', 'stroke-dasharray:0.012 0.008');
          if (s.markers !== false) s.values.forEach((v, i) => f.add('circle', { cx: X(off + i), cy: Y(v), r: highlight.includes(off + i) ? 6 : 3.2, fill: highlight.includes(off + i) ? '#e03131' : (s.color || '#2f6fd6'), class: 'pt' + (highlight.includes(off + i) ? ' hot' : '') }));
        });
        return f.box;
      },

      histogram({ x, y, w = 460, h = 260, values = [], bins = 20, min = null, max = null, marker = null, markerLabel = null, shadeBelow = false, title = '', animate = A() } = {}) {
        const f = frame({ x, y, w, h, title }, animate);
        const L = 40, R = 12, T = f.top + 6, B = 30, W = w - L - R, H = h - T - B;
        const lo = min != null ? min : Math.min(...values), hi = max != null ? max : Math.max(...values);
        const width = (hi - lo) / bins || 1;
        const counts = new Array(bins).fill(0);
        values.forEach(v => { const k = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / width))); counts[k]++; });
        const yMax = niceMax(Math.max(1, ...counts));
        axes(f, L, T, W, H, yMax, 4, v => String(Math.round(v)));
        const bw = W / bins;
        counts.forEach((c, i) => {
          const bh = (H * c) / yMax, mid = lo + width * (i + 0.5);
          const below = marker == null || mid <= marker;
          f.add('rect', { x: L + bw * i + 1, y: T + H - bh, width: Math.max(1, bw - 2), height: bh, class: 'bar' + (shadeBelow && !below ? ' alt' : ''), style: '--i:' + i });
        });
        for (let i = 0; i <= 4; i++) {
          const v = lo + ((hi - lo) * i) / 4;
          f.add('text', { x: L + (W * i) / 4, y: T + H + 16, 'text-anchor': 'middle' }, fmtNum(+v.toPrecision(3)));
        }
        if (marker != null) {
          const mx = L + (W * (marker - lo)) / (hi - lo);
          f.add('line', { x1: mx, x2: mx, y1: T - 4, y2: T + H, class: 'hline', stroke: '#e03131' });
          f.add('text', { x: mx + 5, y: T + 8, class: 'lbl', style: 'font-weight:700;fill:#e03131' }, markerLabel || String(marker));
        }
        return f.box;
      },

      sparkline(cellEl, values, { type = 'line', high = false, low = false, animate = A() } = {}) {
        const n = values.length, lo = Math.min(...values), hi = Math.max(...values);
        const X = i => 4 + (92 * i) / Math.max(1, n - 1), Y = v => 26 - (22 * (v - lo)) / ((hi - lo) || 1);
        const iHi = values.indexOf(hi), iLo = values.indexOf(lo);
        let body = '';
        if (type === 'column') {
          const bw = 92 / n * 0.7;
          values.forEach((v, i) => {
            const cls = high && i === iHi ? 'col hi' : low && i === iLo ? 'col lo' : 'col';
            const top = Y(v) - 2, x0 = 4 + (92 * i) / n;
            body += '<rect class="' + cls + '" x="' + x0.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (28 - top).toFixed(1) + '" style="animation-delay:' + i * 50 + 'ms"/>';
          });
        } else {
          body += '<path class="ln" pathLength="1" vector-effect="non-scaling-stroke" d="M' + values.map((v, i) => X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' L') + '"/>';
          if (high) body += '<ellipse class="hi" cx="' + X(iHi) + '" cy="' + Y(hi) + '" rx="2.6" ry="3.4"/>';
          if (low) body += '<ellipse class="lo" cx="' + X(iLo) + '" cy="' + Y(lo) + '" rx="2.6" ry="3.4"/>';
        }
        cellEl.innerHTML = '<svg class="spark' + (animate ? ' anim' : '') + '" viewBox="0 0 100 30" preserveAspectRatio="none">' + body + '</svg>';
        cellEl.classList.remove('num');
        return cellEl;
      }
    };
  };
})();
