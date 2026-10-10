# Design spec: "Excel to Excel" interactive webinar deck

Date: 2026-10-10 · Requirements: `docs/brainstorm/2026-10-10-excel-tricks-webinar-requirements.md`
Deadline: webinar ~13:45 PST today; deck presentable by 12:30 PST; rehearsal 12:30–13:45.

## 1. Decisions (approved in chat)
| Topic | Decision |
|---|---|
| Slide engine | **reveal.js 5.2.1** from cdnjs: keyboard/click/swipe nav, fragments, speaker-notes window (S), URL hash, auto-scaling, `?print-pdf` |
| Formula engine | **HyperFormula 3.4.0** from jsDelivr (`hyperformula.full.min.js`), `licenseKey: 'gpl-v3'`, lazy-loaded on first try-it use |
| Hosting | Public repo **inchliit/excel-to-excel**, GitHub Pages from `main` root (+ `.nojekyll`) → `https://inchliit.github.io/excel-to-excel/` |
| Look | Dark slate background, Excel green (#107C41 / #21A366) accent, light Excel-like grid, large type for screen-share |
| Language | English |
| Git identity (repo-local) | `inchliit <65306965+inchliit@users.noreply.github.com>` so no work email lands in a public repo |
| Not used | Claude artifacts (Team-org share links block students), live Excel, polls, practice workbook, timer, jump menu |

## 2. File layout (repo root = `~/Documents/excel-webinar`)
```
index.html               reveal.js shell; loads css, libs, tricks, static slides, then build.js
.nojekyll
css/theme.css            deck theme, typography, slide layout primitives, version-tag pills
css/excel.css            mock Excel: grid, name box, formula bar, dialogs, ribbon bits, keycaps, try-it panel
js/lib/grid.js           XGrid: Excel-look grid component
js/lib/ui.js             mock dialogs, keycap overlay, callouts, ribbon snippets
js/lib/charts.js         SVG mini charts: pareto, sparkline, histogram, forecast band, bar
js/lib/steps.js          maps reveal fragments → trick steps (replay model)
js/lib/tryit.js          try-it boxes on HyperFormula
js/lib/build.js          renders static + trick slides, wires steps/try-its, Reveal.initialize
js/slides/static.js      title, agenda (clickable), act dividers, Power Query teaser, closing
js/tricks/NN-<id>.js     one file per trick (01…20)
tests/check-tryits.mjs   node: run every try-it answer through HyperFormula, compare to expected
package.json             devDependency hyperformula@3.4.0 (tests only)
```
All scripts are classic `<script>` tags (no ES modules), so the deck also runs from `file://` as the fallback.

## 3. Trick module contract
Each `js/tricks/NN-<id>.js` calls `registerTrick({...})` and touches nothing else:
```js
registerTrick({
  n: 7, id: 'sumifs', act: 2,
  title: 'SUMIFS / COUNTIFS',
  tagline: 'Defects by line AND shift in one formula',
  version: 'All',                 // 'All' | '2016+' | '2019+' | '365/2021'
  keys: ['Alt', '='] | null,      // shortcut keycaps, or null
  formula: '=SUMIFS(D:D, B:B, "L2", C:C, "Night")' | null,
  why: 'One formula replaces filter-then-sum every shift.',
  alt: null,                      // 365-only tricks: older-Excel alternative text
  stage(ctx) { /* build initial visuals: grid(s), chart, dialog placeholders */ },
  steps: [ (ctx, animate) => { ... }, ... ],   // one entry per presenter click
  notes: 'Speaker notes: talking points + exact keys to say aloud.',
  tryit: null | { data, task, target, expected, check?, hint, answer }
});
```
- `ctx` gives `ctx.grid(...)` (create XGrid), `ctx.ui` (dialogs, keycaps, callouts), `ctx.charts`, `ctx.caption(text)`,
  `ctx.wait(ms)`, and `ctx.el` (the slide's stage element).
- **Replay model:** at step *i*, `steps.js` clears the stage, runs `stage(ctx)`, then steps `0..i-1` with
  `animate=false` (instant), then step *i* with `animate=true`. Going back = same replay without animation.
  Steps must therefore be deterministic and not depend on timing.
- Each step adds one hidden reveal fragment so reveal counts presenter clicks; `fragmentshown`/`fragmenthidden`/
  `slidechanged` call the replay.
- `build.js` wraps every trick render in try/catch; a failing trick falls back to a static slide (title, formula/keys,
  tagline) so one bug never breaks the deck.

## 4. Slide anatomy (every trick slide)
Header: trick number + title + version pill. Left rail: tagline, keycaps/formula, "Why an IE cares", (365-only:
older-Excel alternative). Main stage: the animated mock-Excel demo with a caption line under it. Try-it tricks have
a "Try it" vertical sub-slide (reveal down-arrow) so the presenter flow stays horizontal and students can dive in.

## 5. Shared components
- **XGrid** (`grid.js`): `new XGrid(el, {cols, rows, data, widths, nameBox, formulaBar})`; methods `select(range)`,
  `setValue(ref, v)`, `setValues(range, 2D)`, `typeFormula(text, animate)`, `flash(range, cls)`, `spill(anchor, 2D, animate)`,
  `mark(range, cls)` / `clear(cls)`, `fillHandleDrag(fromRange, toRange, animate)`, `cell(ref)`. A1 refs throughout.
- **ui.js**: `keycaps(['Ctrl','E'])` press animation; `dialog(kind, opts)` for Go To Special, Paste Special,
  Data Validation, Goal Seek, Solver, Data Table, Forecast Sheet; `callout(target, text)`; `ribbon(tab, button)`.
- **charts.js**: `pareto(el, data)`, `sparkline(el, series)`, `histogram(el, values, bins)`, `forecast(el, hist, fc, band)`,
  `bars(el, data)`. Plain SVG, animated via CSS.

## 6. Try-it boxes (P1)
Tricks **#6, 7, 8, 9, 10, 11, 12, 20**. Panel = editable-looking grid with the trick's IE data + task text + formula
input + Enter. HyperFormula evaluates the student's formula in the target cell.
- **Check by value**, not text: number equality (1e-9), array equality for spills (#11), the highlighted-cell set for
  #12 (rule evaluated per row), all filled cells for #6 (formula copied across the grid with HyperFormula
  copy/paste so relative refs shift exactly as in Excel), and for #20 the formula must return a number and contain
  `NORM.INV` + `RAND` (then "Run 500 trials" draws a histogram).
- Wrong → hint; buttons: **Show answer**, **Reset**.
- HyperFormula fails to load → panel shows "Try this in Excel: `<answer>` → `<expected>`".
- Datasets avoid engine edge cases (no empty FILTER results, no ties in SORT keys).

## 7. Speaker notes
`<aside class="notes">` per slide from each module's `notes`; presenter presses **S** for reveal's notes window
(notes, timer, next-slide preview) and screen-shares only the deck window.

## 8. Build order (deck presentable after each tier)
| By (PST) | Tier | Content |
|---|---|---|
| ~09:45 | T0 | Shell, theme, all shared libs, static slides, all 20 tricks as end-state slides with notes; push + Pages live |
| ~11:15 | T1 | Step animations, act by act (parallel subagents, one per act, own trick files only); push after each act |
| ~12:00 | T2 | 8 try-its + `tests/check-tryits.mjs` passing |
| ~12:30 | T3 | Only if time: clickable slicer (#14), Goal Seek slider (#16), live dropdown (#5), PDF backup |

Shared libs are frozen after T0; a subagent needing a new helper defines it inside its own trick file.

## 9. Verification
- Browser pane on a local static server: step through every slide/fragment forward and backward; console clean.
- `node tests/check-tryits.mjs` green for all 8 try-its.
- Phone viewport (375×812): slides scale, try-it input usable.
- Pages URL returns 200 with no login (curl), deck loads from the public URL.
- Accuracy pass: every shortcut, menu path and version tag checked against Excel behaviour.

## 10. Out of scope
Live Excel switching, polls/quizzes, practice workbook, timer, jump menu, analytics, recording.
