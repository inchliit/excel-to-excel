/* static.js — title, follow-along, versions, agenda, act dividers, Power Query teaser, recap, Q&A. */
(function () {
  const URL_TEXT = 'inchliit.github.io/excel-to-excel';
  const ACTS = {
    1: { title: 'Capture & clean data', sub: 'Get messy shop-floor data into shape in seconds.' },
    2: { title: 'Formulas that think', sub: 'Lookups, conditions and live lists that update themselves.' },
    3: { title: 'See the problem', sub: 'Make out-of-control points, trends and big losses jump out.' },
    4: { title: 'Decide & optimize', sub: 'What-if, optimization, forecasting and simulation: the IE toolkit.' }
  };
  const esc = s => window.DECK.esc(s);
  const pad = n => String(n).padStart(2, '0');
  const link = t => '<a class="ag-item" href="#/' + window.DECK.slideId(t) + '"><span class="ag-n">' + pad(t.n) + '</span>' + esc(t.title) + '</a>';

  function titleGrid() {
    let cells = '';
    for (let i = 0; i < 96; i++) cells += '<i style="--d:' + ((i * 37) % 23) / 10 + 's"></i>';
    return '<div class="title-grid" aria-hidden="true">' + cells + '</div>';
  }

  window.STATIC = {
    acts: ACTS,
    url: URL_TEXT,

    intro(tricks) {
      return [
        {
          id: 'title', cls: 'title-slide',
          html: titleGrid() +
            '<div class="title-text">' +
            '<div class="eyebrow">Webinar · Industrial Engineering</div>' +
            '<h1>Excel <span class="to">to</span> <span class="xl">Excel</span></h1>' +
            '<p class="sub">20 Excel tricks you don\'t know — for Industrial Engineers</p>' +
            '<div class="url-card"><span>Follow along</span><b>' + URL_TEXT + '</b></div>' +
            '</div>',
          notes: '- Welcome everyone. Today: 20 Excel tricks most people never learn, all with IE data.\n' +
            '- Ask them to open the link now: ' + URL_TEXT + '. Same slides, and they can try formulas themselves.\n' +
            '- Format: 4 acts, about 3–4 minutes per trick, Q&A at the end.'
        },
        {
          id: 'follow', cls: 'follow-slide',
          html: '<h2 class="s-title">How to follow along</h2>' +
            '<div class="cards3">' +
            '<div class="card"><div class="card-ico"><kbd>←</kbd><kbd>→</kbd></div><h3>Move between tricks</h3><p>Arrow keys, or swipe on a phone.</p></div>' +
            '<div class="card"><div class="card-ico"><kbd>↓</kbd></div><h3>Try it yourself</h3><p>On tricks with a <b>↓ Try it</b> badge, go down to type the formula in a live mini-sheet.</p></div>' +
            '<div class="card"><div class="card-ico link-ico">🔗</div><h3>Open the deck</h3><p><b>' + URL_TEXT + '</b><br>Best on a laptop. On a phone, turn it sideways.</p></div>' +
            '</div>',
          notes: '- Show the three controls: left/right to move, down for Try-it boxes.\n' +
            '- Students can browse at their own pace; the link stays up after the webinar.'
        },
        {
          id: 'versions', cls: 'versions-slide',
          html: '<h2 class="s-title">Will it work in <em>my</em> Excel?</h2>' +
            '<div class="ver-grid">' +
            '<div class="ver"><span class="pill v-all">All</span><p>Excel 2016 and newer (most of today)</p></div>' +
            '<div class="ver"><span class="pill v-2016">2016+</span><p>Excel 2016, 2019, 2021, Microsoft 365</p></div>' +
            '<div class="ver"><span class="pill v-2019">2019+</span><p>Excel 2019, 2021, Microsoft 365</p></div>' +
            '<div class="ver"><span class="pill v-365">365/2021</span><p>Microsoft 365 or Excel 2021+: each slide shows an older-Excel way too</p></div>' +
            '</div>' +
            '<p class="ver-check">Check yours: <b>File › Account › About Excel</b></p>',
          notes: '- Every trick carries a version tag (top right of each slide).\n' +
            '- Most work in any Excel from 2016. Only XLOOKUP and FILTER/SORT need Microsoft 365 or 2021, and those slides show the older way.\n' +
            '- Many universities give students Microsoft 365 for free with their school email.'
        },
        {
          id: 'agenda', cls: 'agenda-slide',
          html: '<h2 class="s-title">Today: 20 tricks in 4 acts</h2><div class="agenda">' +
            [1, 2, 3, 4].map(a => '<div class="ag-col act' + a + '"><div class="ag-act">Act ' + a + '</div><h3>' + esc(ACTS[a].title) + '</h3>' +
              tricks.filter(t => t.act === a).map(link).join('') + '</div>').join('') +
            '</div>',
          notes: '- Quick tour of the 4 acts: capture & clean, formulas, visuals, decisions.\n' +
            '- The list is clickable, so students can jump to any trick.'
        }
      ];
    },

    divider(act, tricks) {
      const a = ACTS[act];
      return {
        id: 'act' + act, cls: 'act-slide act' + act,
        html: '<div class="act-num">Act ' + act + '</div><h2 class="act-title">' + esc(a.title) + '</h2>' +
          '<p class="act-sub">' + esc(a.sub) + '</p>' +
          '<div class="act-list">' + tricks.map(t => '<span class="chip"><b>' + pad(t.n) + '</b> ' + esc(t.title) + '</span>').join('') + '</div>',
        notes: '- Act ' + act + ': ' + a.title + '. ' + a.sub + '\n- ' + tricks.length + ' tricks in this act.'
      };
    },

    outro(tricks) {
      return [
        {
          id: 'power-query', cls: 'pq-slide',
          html: '<div class="pq-head"><span class="t-num">+1</span><h2>Bonus: Power Query</h2><span class="pill v-2016">2016+</span></div>' +
            '<p class="pq-sub">12 monthly production CSVs → one clean table. Next month: one click.</p>' +
            '<div class="pq-flow">' +
            '<div class="pq-files">' + Array.from({ length: 12 }, (_, i) => '<span class="pq-file" style="--i:' + i + '">' +
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] + '.csv</span>').join('') + '</div>' +
            '<div class="pq-arrow">→</div>' +
            '<div class="pq-table"><div class="pq-row h"><span>Month</span><span>Line</span><span>Units</span></div>' +
            '<div class="pq-row"><span>Jan</span><span>L1</span><span>9,820</span></div><div class="pq-row"><span>Jan</span><span>L2</span><span>10,410</span></div>' +
            '<div class="pq-row"><span>…</span><span>…</span><span>…</span></div><div class="pq-row"><span>Dec</span><span>L3</span><span>9,975</span></div></div>' +
            '</div>' +
            '<ol class="pq-steps"><li><b>Data › Get Data › From File › From Folder</b></li><li><b>Combine &amp; Transform</b>, clean once</li>' +
            '<li><b>Close &amp; Load</b></li><li>New month? Drop the file in the folder → <b>Data › Refresh All</b> (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F5</kbd>)</li></ol>',
          notes: '- Bonus teaser, too big for 3 minutes, but the next thing to learn.\n' +
            '- Power Query records your cleaning steps once and replays them on every refresh.\n' +
            '- Path: Data › Get Data › From File › From Folder, then Combine & Transform.\n' +
            '- Built into Excel 2016 and newer.'
        },
        {
          id: 'recap', cls: 'recap-slide',
          html: '<h2 class="s-title">20 tricks, recap</h2><div class="recap">' +
            tricks.map(t => '<a class="rc act' + t.act + '" href="#/' + window.DECK.slideId(t) + '"><b>' + pad(t.n) + '</b>' + esc(t.title) + '</a>').join('') +
            '</div>',
          notes: '- Recap: pick the 3 you will use this week.\n- Every tile links back to its slide.'
        },
        {
          id: 'qa', cls: 'qa-slide',
          html: '<h1 class="qa-title">Questions?</h1><p class="qa-sub">Practice anytime: every <b>↓ Try it</b> box stays online.</p>' +
            '<div class="url-card big"><span>Deck</span><b>' + URL_TEXT + '</b></div>',
          notes: '- Open the floor for Q&A.\n- Remind them the link stays up for practice.'
        }
      ];
    }
  };
})();
