/* ui.js — overlays drawn on the stage: keycaps, Excel-style dialogs, ribbon paths, callouts, cursor, tags, menus.
   window.XUI(ctx) → helpers bound to that render. Coordinates are stage px. Text params accept trusted HTML. */
(function () {
  window.XUI = function (ctx) {
    const esc = s => window.DECK.esc(s);
    const A = () => !!ctx.animate;
    const anim = on => (on ? ' anim' : '');

    return {
      keys(labels, { x = null, y = 16, animate = A() } = {}) {
        const chord = window.DECK.isChord(labels);
        const d = ctx.box({ x: x == null ? 0 : x, y, cls: 'ui-keys' + anim(animate), html: window.DECK.keycapsHTML(labels) });
        if (x == null) { d.style.left = 'auto'; d.style.right = '16px'; }
        d.style.setProperty('--kd', chord ? '0s' : '.45s');
        d.querySelectorAll('kbd').forEach((k, i) => k.style.setProperty('--k', chord ? 0 : i));
        return d;
      },

      dialog({ title = '', body = '', buttons = ['OK', 'Cancel'], primary = 'OK', x = 240, y = 80, w = 380, animate = A() } = {}) {
        const foot = buttons.length
          ? '<div class="dlg-foot">' + buttons.map(b => '<span class="dlg-btn' + (b === primary ? ' primary' : '') + '" data-btn="' + esc(b) + '">' + esc(b) + '</span>').join('') + '</div>'
          : '';
        return ctx.box({ x, y, w, cls: 'ui-dialog' + anim(animate),
          html: '<div class="dlg-title"><span>' + esc(title) + '</span><i>✕</i></div><div class="dlg-body">' + body + '</div>' + foot });
      },

      // press(dialogEl) presses its primary button; press(dialogEl, 'Special…') a named one; press(buttonEl) that button.
      press(el, label = null, animate = A()) {
        if (!el) return null;
        let btn = el;
        if (el.classList.contains('ui-dialog')) {
          btn = label ? el.querySelector('[data-btn="' + label + '"]') : el.querySelector('.dlg-btn.primary');
        }
        if (btn && animate) btn.classList.add('press');
        return btn;
      },

      ribbon({ tab, path = [], x = 16, y = 16, animate = A() } = {}) {
        const items = [tab].concat(path);
        const html = items.map((t, i) =>
          (i ? '<span class="sep" style="--i:' + (i - 0.5) + '">›</span>' : '') +
          '<span class="rb' + (i === 0 ? ' tab' : '') + (i === items.length - 1 && i > 0 ? ' last' : '') + '" style="--i:' + i + '">' + esc(t) + '</span>').join('');
        return ctx.box({ x, y, cls: 'ui-ribbon' + anim(animate), html });
      },

      callout({ text = '', x = 20, y = 20, w = 260, tone = 'info', arrow = null, animate = A() } = {}) {
        return ctx.box({ x, y, w, cls: 'ui-callout ' + tone + (arrow ? ' ar-' + arrow : '') + anim(animate), html: text });
      },

      cursor({ x = 0, y = 0, click = false, animate = A() } = {}) {
        return ctx.box({ x, y, cls: 'ui-cursor' + (click ? ' click' : '') + anim(animate),
          html: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l7 19 2.6-7.6L21 10.8z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>' });
      },

      tag(text, { x = 0, y = 0, tone = 'info', animate = A() } = {}) {
        return ctx.box({ x, y, cls: 'ui-tag ' + tone + anim(animate), html: esc(text) });
      },

      menu({ items = [], on = null, x = 0, y = 0, w = 220, animate = A() } = {}) {
        return ctx.box({ x, y, w, cls: 'ui-menu' + anim(animate),
          html: items.map(it => '<div' + (it === on ? ' class="on"' : '') + '>' + esc(it) + '</div>').join('') });
      },

      panel({ title = '', html = '', x = 0, y = 0, w = 260, animate = A() } = {}) {
        return this.dialog({ title, body: html, buttons: [], x, y, w, animate });
      }
    };
  };
})();
