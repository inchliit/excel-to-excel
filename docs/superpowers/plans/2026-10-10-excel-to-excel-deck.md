# Excel to Excel Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public, animation-led reveal.js deck teaching 20 Excel tricks to IE students, with live try-it boxes, presentable by 12:30 PST today.

**Architecture:** Classic-script static site. reveal.js renders slides that `build.js` generates from one file per trick
(`js/tricks/NN-id.js` → `registerTrick({...})`). Each presenter click is a hidden reveal fragment that replays the trick's
step functions onto a stage using shared visual libs (XGrid, ui, charts). Try-it boxes evaluate student formulas with
HyperFormula. Hosted on GitHub Pages.

**Tech Stack:** reveal.js 5.2.1 (cdnjs), HyperFormula 3.4.0 (jsDelivr, GPL-3.0 `licenseKey:'gpl-v3'`), vanilla JS/CSS/SVG,
Node 26 for checks, `gh` for publishing.

**Spec:** `docs/superpowers/specs/2026-10-10-excel-to-excel-deck-design.md`
(requirements: `docs/brainstorm/2026-10-10-excel-tricks-webinar-requirements.md`)

## Global Constraints
- CDN URLs, exactly:
  `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.min.css`,
  `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/reveal.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.2.1/plugin/notes/notes.min.js`,
  `https://cdn.jsdelivr.net/npm/hyperformula@3.4.0/dist/hyperformula.full.min.js`. No other runtime dependencies.
- Classic `<script>` tags only (no ES modules, no build step); deck must run from `file://` too.
- reveal canvas 1280×720. Trick slide: header 0–84px, left rail x 24–324, **stage** x 340–1260 / y 96–640 (920×544),
  caption bar y 650–700. All stage coordinates are relative to the stage's top-left.
- Version pills, exactly one of: `All` (works in Excel 2016+), `2016+`, `2019+`, `365/2021`.
- Every example uses IE data (production, inventory, QC/SPC, time study, scheduling, optimization). No currency symbols.
- English copy. Title: **Excel to Excel**. Subtitle: **20 Excel tricks you don't know — for Industrial Engineers**.
- Steps are deterministic: a step sets final state synchronously; timed effects are cosmetic and cancel on replay.
- After Task 2, `css/*` and `js/lib/*` are frozen for subagents; trick-specific visuals live in the trick's own file.
- Theme tokens (css/theme.css `:root`): `--bg:#0f1720 --panel:#16212c --ink:#e8eef3 --muted:#9fb0bf --xl:#107C41
  --xl2:#21A366 --accent:#ffd166 --bad:#ff6b6b --good:#2ecc71 --info:#4dabf7`; grid: `--g-bg:#fff --g-line:#d4d4d4
  --g-head:#f3f3f3 --g-ink:#1f1f1f`.
- Commit after every task; push to `main` only in Tasks 4, 10, 11 (and optional 12–13).

## Review Focus
1. **Fast clicking / backtracking mid-animation** → stage must equal a fresh render of that step (no stale timers).
   Test in Task 1: `tests/check-replay.html` steps a dummy trick 0→3→1 quickly and compares `stage.innerHTML` to a clean render of step 1.
2. **Keys typed in a try-it input navigating the deck** (Space, arrows, `F`, `S`) → keystrokes stay in the input.
   Test in Task 9: focus the input, dispatch Space/ArrowRight, assert `Reveal.getIndices()` unchanged.
3. **Student formula variants** (lowercase names, extra spaces, `80%` literals, typos → `#NAME?`) → variants pass,
   errors show an Excel-style error + hint, never a crash. Test in Task 9: `check-tryits.mjs` runs a lowercase/spaced
   variant of every answer and one `#NAME?` typo.
4. **HyperFormula blocked or slow on student networks** → fallback "Try this in Excel: … → …" within 8 s; slides unaffected.
   Test in Task 9: load `index.html?hfurl=bad` and assert the fallback renders.
5. **Phone portrait (375×812)** → deck scales, try-it input font-size ≥ 16px (no iOS zoom), buttons ≥ 40px.
   Test in Task 10: browser-pane mobile preset screenshot of a try-it sub-slide.

---

## Interfaces (shared contract — every task reads this)

**Registry** (`js/lib/registry.js`): `window.TRICKS = []; function registerTrick(t){ window.TRICKS.push(t); }`

**Trick object** (`js/tricks/NN-id.js`, file name = two-digit `n` + `-` + `id`):
```js
registerTrick({
  n: 7, id: 'sumifs', act: 2,                 // n 1–20 unique; act 1–4
  title: 'SUMIFS / COUNTIFS', tagline: 'Defects by line AND shift in one formula',
  version: 'All', keys: null, formula: '=SUMIFS(D2:D13, B2:B13, "L2", C2:C13, "Night")',
  why: 'One formula replaces filter-then-sum every shift.', alt: null,   // alt: older-Excel alternative (365/2019 tricks)
  notes: 'Bulleted talking points + exact keys/menu path to say aloud.',
  stage(ctx) {},                // optional until Tasks 5–8: draws the initial state
  steps: [],                    // optional until Tasks 5–8: (ctx, animate) => void, one per presenter click
  tryit: null                   // or a Tryit object (below)
});
```
If `stage`/`steps` are missing or throw, `build.js` shows the **fallback slide**: big keys/formula, tagline, why.

**ctx** (made by `steps.js` per render): `ctx.el` stage element · `ctx.grid(opts)→XGrid` · `ctx.ui` · `ctx.charts` ·
`ctx.caption(text)` · `ctx.box({x,y,w,h,cls,html})→HTMLElement` · `ctx.alive()→bool` (false once a newer render started) ·
`ctx.animate` (bool, same as the step's 2nd arg).

**XGrid** (`js/lib/grid.js`), created via `ctx.grid({x=0,y=0,cols,rows,colWidths=[],data=[[]],header=true,
formulaBar=true,nameBox=true,fontSize=15,formats={},title=null})`; refs are A1 strings; `data` row 0 = Excel row 1.
`formats` maps range → `'0'|'0.0'|'0.00'|'0.0%'|'#,##0'|'text'`.
Methods: `cell(ref)→El` · `value(ref)` · `set(ref,v)` · `setRange(anchor,rows2D)` · `select(range)` (green border,
name box, formula bar) · `formulaBar(text)` · `type(ref,text,animate)` (char-by-char into cell + bar) ·
`enter(ref,display,formula=null,animate)` · `mark(range,cls)` / `unmark(cls,range=null)` with cls in
`hl-yellow hl-green hl-blue hl-red dim ants spill bold` · `refBox(range,i)` (Excel's coloured formula-ref border, i 0–5) ·
`flash(range)` · `fill(fromRef,toRange,rows2D,animate)` (fill-handle drag + cascade) · `spill(anchor,rows2D,animate)`.

**ui** (`js/lib/ui.js`), coordinates in stage px: `keys(labels[], {x,y,animate})` keycap press ·
`dialog({title,body,buttons=['OK','Cancel'],primary='OK',x,y,w,animate})→El` · `press(buttonEl)` ·
`ribbon({tab,path[],x,y,animate})` (Tab › Group › Button chips lighting in order) ·
`callout({text,x,y,w=260,tone='info'|'good'|'warn',arrow=null|'left'|'right'|'up'|'down',animate})` ·
`cursor({x,y,click=false,animate})` · `tag(text,{x,y,tone})`.

**charts** (`js/lib/charts.js`), SVG: `bars({x,y,w,h,data:[{label,value}],animate})` ·
`pareto({x,y,w,h,data,line80=true,animate})` (sorts desc, cumulative % line, 80% guide) ·
`line({x,y,w,h,series:[{values,color,dashed,label}],hlines:[{y,label,color,dashed}],band:{start,lo[],hi[]},highlight:[idx],animate})` ·
`histogram({x,y,w,h,values,bins=20,marker=null,shadeBelow=false,animate})` ·
`sparkline(cellEl,values,{type='line'|'column',high=false,low=false,animate})`.

**Tryit object** (consumed by `js/lib/tryit.js`, checked by `tests/check-tryits.mjs`):
```js
{ sheet: [[...], ...],        // 2D from A1; numbers, strings, booleans, '=formulas'
  task: 'Total defects for Line L2, Night shift → put it in H2',
  target: 'H2',               // where the student's formula goes
  mode: 'value' | 'spill' | 'fill' | 'cf' | 'random',
  fill: 'C2:G6',              // fill/cf: target formula copied over this range (Excel-style ref shifting)
  cfRange: 'A2:B21',          // cf: rows highlighted where the filled formula is TRUE
  expected: 37,               // value; 2D array for spill (from target) and fill/cf (whole fill range)
  random: { trials: 500, mean: 18, sd: 2.5 },   // random mode: pass if sample mean within ±10% of mean
  mustUse: ['SUMIFS'],        // optional soft nudge if the right value came from a different formula
  hint: 'Sum range first, then (criteria range, criteria) pairs.',
  answer: '=SUMIFS(D2:D13,B2:B13,"L2",C2:C13,"Night")' }
```

---

## T0: static deck live (target ~09:50)

### Task 1: Shell, theme, registry, step engine, builder, static slides (lead)
**Files:** Create `index.html`, `.nojekyll`, `css/theme.css`, `js/lib/registry.js`, `js/lib/steps.js`, `js/lib/build.js`,
`js/slides/static.js`, `tests/check-tricks.mjs`, `tests/check-replay.html`, `.claude/launch.json`, `.gitignore`
**Interfaces:** Produces registry, ctx, fallback slide, `window.DECK = { render(trick, i, animate) }`.
- [ ] `tests/check-tricks.mjs`: loads every `js/tricks/*.js` in a `vm` context with `registerTrick` shim; asserts 20 tricks,
      `n` = 1..20 unique, file name matches `n`/`id`, act ∈ 1–4, version ∈ pill set, non-empty title/tagline/why/notes,
      `keys` or `formula` present, `steps` (if present) all functions, `stage` present when `steps` non-empty. Run → FAIL (0 tricks).
- [ ] `index.html`: reveal shell + CSS/JS tags in order: reveal css, theme.css, excel.css, reveal.js, notes.js, registry.js,
      grid.js, ui.js, charts.js, steps.js, tryit.js, tricks 01–20, static.js, build.js. Missing lib files must not break load.
- [ ] `static.js`: title (+ big public URL), "How to follow along" (←/→, ↓ for Try-it, link), version-pill legend
      ("check yours: File › Account › About Excel"), clickable agenda (4 acts, trick numbers link to `#/<slide-id>`),
      act dividers (1 Capture & clean · 2 Formulas that think · 3 See the problem · 4 Decide & optimize),
      Power Query teaser (Data › Get Data › From File › From Folder → Combine → Refresh All), recap grid of 20, Q&A.
- [ ] `build.js`: intro → per act: divider + trick slides sorted by `n` (each trick is a vertical stack: main slide +
      Try-it sub-slide when `tryit`) → outro; `<aside class="notes">` per slide; one hidden `.fragment.step` per step;
      `Reveal.initialize({hash:true,width:1280,height:720,margin:0.04,controls:true,progress:true,slideNumber:'c/t',
      transition:'slide',plugins:[RevealNotes]})`; on `ready/slidechanged/fragmentshown/fragmenthidden` → `DECK.render`.
- [ ] `steps.js`: `render(trick,i,animate)` = new generation token → clear stage → `stage(ctx)` → steps `0..i-1` instant
      (stage gets class `instant`, transitions off) → step `i` animated. try/catch → fallback slide content.
- [ ] `theme.css`: tokens from Global Constraints, slide anatomy, version pills, fallback slide, act divider, `.instant *{transition:none!important;animation:none!important}`.
- [ ] `tests/check-replay.html` (Review Focus 1) passes in the browser pane.
- [ ] Verify: `.claude/launch.json` static server (`python3 -m http.server 8765`), preview, console clean, notes window opens with **S**.
- [ ] Commit `feat: deck shell, step engine, static slides`.

### Task 2: Shared visual libs (lead)
**Files:** Create `css/excel.css`, `js/lib/grid.js`, `js/lib/ui.js`, `js/lib/charts.js`; dev slide via `?dev` in `build.js`.
**Interfaces:** Produces XGrid, ui, charts exactly as in Interfaces.
- [ ] XGrid look: name box + fx bar, grey column letters/row numbers, white cells, green 2px selection with fill-handle
      square, Excel's ref colours (`#4472C4 #C0504D #9BBB59 #8064A2 #4BACC6 #F79646`), spill = blue dashed border.
- [ ] ui + charts per Interfaces; all animations are CSS classes so `.instant` disables them.
- [ ] `?dev` slide exercises every method; step through it forward/back; console clean.
- [ ] Commit `feat: XGrid, ui and chart components`.

### Task 3: Trick metadata + speaker notes for all 20 (subagent A, parallel with Tasks 1–2)
**Files:** Create `js/tricks/01-flash-fill.js` … `20-monte-carlo.js` (names in the storyboard appendix).
**Interfaces:** Consumes `registerTrick`. Produces 20 trick objects with metadata + `notes`, no `stage`/`steps`/`tryit`.
- [ ] Write each file from the storyboard appendix: `n,id,act,title,tagline,version,keys,formula,why,alt,notes`.
      Notes: 4–7 bullets (hook, the move with exact keys/menu path, IE use case, gotcha, Mac/older-Excel note).
- [ ] `node tests/check-tricks.mjs` → PASS (if Task 1 not done yet, run the same assertions inline).
- [ ] Commit `feat: trick metadata and speaker notes`.

### Task 4: Publish to GitHub Pages (lead)
- [ ] `GH_TOKEN=$(gh auth token --user inchliit) gh repo create inchliit/excel-to-excel --public --source . --push`
      (does not switch the active `gh` account).
- [ ] Enable Pages: `GH_TOKEN=… gh api -X POST repos/inchliit/excel-to-excel/pages -f "source[branch]=main" -f "source[path]=/"`.
- [ ] Wait until `curl -s -o /dev/null -w '%{http_code}' https://inchliit.github.io/excel-to-excel/` → `200`; open it in the browser pane.
- [ ] Later pushes: `git -c credential.helper= -c credential.helper='!f(){ echo username=inchliit; echo "password=$(gh auth token --user inchliit)"; }; f' push`.

## T1 + T2: animations and try-its (target ~11:30)

### Tasks 5–8: Act animations (subagents B–E in parallel, one act each)
**Files:** Modify only the act's own trick files (Act 1: 01–05 · Act 2: 06–11 · Act 3: 12–15 · Act 4: 16–20).
**Interfaces:** Consumes ctx/XGrid/ui/charts (frozen). Produces `stage`, `steps`, and `tryit` for #6–#12 and #20.
- [ ] For each trick: build `stage(ctx)` (initial state) + `steps` exactly per its storyboard (one entry per bullet).
- [ ] Try-it tricks: add the `tryit` object; compute `expected` by hand/JS independently of HyperFormula.
- [ ] Verify each trick in the browser pane: every step forward, then all the way back; console clean; nothing
      overflows the stage; text readable at 1280×720.
- [ ] `node tests/check-tricks.mjs` PASS; `node tests/check-tryits.mjs` PASS for this act's try-its (once Task 9 lands).
- [ ] Commit `feat(act N): animations` (one commit per act; agents never edit shared files; report needed helper gaps).

### Task 9: Try-it engine + checks (lead, parallel with Tasks 5–8)
**Files:** Create `js/lib/tryit.js`, `tests/check-tryits.mjs`, `package.json` (devDependency `hyperformula@3.4.0`).
- [ ] `check-tryits.mjs` first: for every trick with `tryit`, build an HF sheet, place `answer` at `target`, apply
      `fill` via `hf.copy`/`hf.paste`, compare to `expected` (1e-9; 2D for spill/fill/cf; random: mean ±10% over 500
      recalcs); also run a lowercase + extra-spaces variant (must pass) and a `#NAME?` typo (must error, not throw).
- [ ] `tryit.js`: renders the Try-it sub-slide (task, mini grid from `sheet`, formula input ≥16px font, Enter / Check,
      Show answer, Reset); lazy-loads HF on first focus (8 s timeout → fallback text); value check + `mustUse` nudge +
      hint; spill/fill/cf rendering; random mode "Run 500 trials" histogram + mean/SD readout.
      Stop key events in the input from reaching reveal (Review Focus 2). `?hfurl=bad` forces the fallback (Review Focus 4).
- [ ] Commit `feat: try-it engine and checks`.

### Task 10: Integrate, verify, publish (lead)
- [ ] Merge act work; `node tests/check-tricks.mjs && node tests/check-tryits.mjs` → both PASS.
- [ ] Browser pane: walk every slide and step forward and back; console clean; screenshot one slide per act.
- [ ] Mobile preset (375×812): title, one trick slide, one try-it (Review Focus 5); reset viewport to desktop.
- [ ] Push; public URL returns 200 and loads the new version.

## Final (mandatory, ~11:30–12:15)

### Task 11: Accuracy review + publish
- [ ] Fresh reviewer subagent reads every trick file against the storyboard + Excel facts: shortcuts, menu paths, version
      pills, numbers in captions, typos. Fix findings. Push. Share the link with the presenter.

## T3: optional, only if time remains before 12:30
### Task 12: Clickable sims — #5 real dropdown, #14 clickable slicer buttons, #16 Goal Seek cycle-time slider.
### Task 13: PDF backup (`?print-pdf` → headless Chrome print to `excel-to-excel.pdf`) + QR code of the URL on the title slide.

---

## Appendix: Trick storyboards (one bullet = one presenter click after the initial `stage`)

Act 1: Capture & clean data
**01-flash-fill** · Flash Fill · `All` (2013+) · keys Ctrl+E · tagline "Split messy codes by typing ONE example".
Stage: col A "Log Code" = L2-OP0423-NIGHT, L1-OP0187-DAY, L3-OP0552-SWING, L2-OP0311-DAY, L1-OP0629-NIGHT,
L3-OP0098-DAY, L2-OP0740-SWING, L1-OP0415-DAY; empty B Line, C Operator, D Shift.
- Highlight A2:A9: "Machine export jams line, operator and shift into one code."
- Type `L2` in B2. · Select B3, keys Ctrl+E → B3:B9 cascade-fill. Caption "Excel learns the pattern from one example."
- C2 `OP0423`, Ctrl+E → fills C. · D2 `Night` (proper case), Ctrl+E → Day/Swing… "It even fixes the case."
- Callout: "Result = plain values, not formulas. Spot-check: inconsistent rows fool it."
Notes: Data › Flash Fill also works; File › Options › Advanced › Automatically Flash Fill.

**02-go-to-special** · Go To Special › Blanks + Ctrl+Enter · `All` · keys F5 › Special… (or Ctrl+G) · "Fill every gap in one go".
Stage: Line | Shift | Machine | Output; rows: L1/Day/M-101/412, (blank)/Day/M-102/398, (blank)/Night/M-101/371,
L2/Day/M-201/455, (blank)/Night/M-202/430, (blank)/Night/M-203/402, L3/Day/M-301/389, (blank)/Swing/M-302/377.
- Red dashed marks on the blanks: "Sort or pivot this and the totals go wrong."
- Select A2:A9; keys F5 → "Go To" dialog → press "Special…".
- "Go To Special" dialog (radio list: Comments, Constants, Formulas, **Blanks**, Current region…) → OK → blanks selected, active A3.
- Keys `=` then `↑` → formula bar `=A2`. · Keys Ctrl+Enter → every blank fills (=cell above) cascading L1, L1, L2, L2, L3.
- Callout: "Freeze it: Ctrl+C, then Ctrl+Alt+V › Values."

**03-paste-special-math** · Paste Special › Divide · `All` · keys Ctrl+Alt+V (Mac Cmd+Ctrl+V) · "Convert a whole time study in place".
Stage: Element | Obs1–Obs4 (seconds): Pick part 12.6 13.2 12.0 12.6 · Load fixture 18.0 17.4 18.6 18.0 ·
Weld 24.6 25.2 24.0 24.6 · Inspect 9.0 9.6 9.0 8.4 · Unload 6.6 7.2 6.6 6.0. Spare cell G2.
- Highlight B2:E6: "Recorded in seconds; the standard needs minutes."
- Type 60 in G2, keys Ctrl+C → marching ants. · Select B2:E6.
- Keys Ctrl+Alt+V → Paste Special dialog (Paste: All · Operation: **Divide**) → OK.
- Values change in place (12.6 → 0.21, 18.0 → 0.30 …, show 2 dp). "No helper column, no formulas."
- Callout: "Multiply by 1 turns text-numbers into numbers; ×1.1 = +10% on a whole price list."

**04-tables** · Ctrl+T Tables · `All` · keys Ctrl+T · "Formulas and charts that grow with your log".
Stage: Date | Line | Units | Defects | Yield; 6 rows (412/6, 398/4, 455/9, 430/5, 389/8, 377/3) + small bar chart of Units.
- "Every day: copy formulas down, fix chart ranges by hand."
- Click A1, keys Ctrl+T → "Create Table" dialog (`=$A$1:$E$7`, ☑ My table has headers) → OK → banded table, filter buttons.
- Type `=1-[@Defects]/[@Units]` in E2 → whole column fills (98.5%, 99.0%, 98.0%, 98.8%, 97.9%, 99.2%). "Readable refs."
- New row 8: 455 units, 7 defects → joins table, Yield 98.5% appears, chart gains a bar.
- Callout: "Ctrl+Shift+T = total row. =SUM(tblProd[Units]) always includes new rows."

**05-data-validation** · Data Validation dropdowns · `All` · keys Alt, A, V, V · "Stop 'scrtch' before it starts".
Stage: QC sheet Date | Line | Part | Defect | Qty with Defect values scratch, Scratch, scrtch, dent, Dent, Crack…; list H2:H6
= Scratch, Dent, Crack, Misalignment, Burr.
- Red marks: "5 spellings of 2 defects → pivot counts are wrong."
- Select D2:D12; ribbon Data › Data Tools › Data Validation → dialog (Allow: **List**, Source `=$H$2:$H$6`, ☑ In-cell dropdown) → OK.
- Click a cell → dropdown arrow; list opens; pick Crack.
- Type `crak` → error box: "This value doesn't match the data validation restrictions defined for this cell."
- Data Validation › Circle Invalid Data → red ellipses on old bad entries.

Act 2: Formulas that think
**06-mixed-refs** · Mixed references with F4 · `All` · keys F4 (Mac Cmd+T) · formula `=$B2*C$1` · "One formula, whole cost grid".
Stage: A2:A6 parts (Bracket, Housing, Shaft, Gear, Bolt kit), B2:B6 unit cost 12.5, 8.75, 4.2, 22, 1.35; C1:G1 qty 100, 250, 500, 1000, 2500.
- "Cost = unit cost × quantity for 25 cells."
- C2 `=B2*C1` → 1,250; fill to G6 → wrong numbers flash red. "Relative refs slide and break."
- Keys F4 ×3 on B2 in the bar: B2 → $B$2 → B$2 → $B2. · Same on C1 → C$1. Callout "$B: always the cost column · $1: always the qty row".
- Fill C2:G6 → correct values cascade green.
Try-it (mode `fill`): target C2, fill C2:G6, expected = cost×qty grid, mustUse none, hint "Lock the column of the cost ($B) and the row of the qty ($1).", answer `=$B2*C$1`.

**07-sumifs** · SUMIFS / COUNTIFS · `All` · formula `=SUMIFS(D2:D13,B2:B13,"L2",C2:C13,"Night")` · "Defects by line AND shift".
Stage: Date | Line | Shift | Defects, 12 rows (lines L1–L3, shifts Day/Night; no ties needed).
- "Boss: total defects for Line 2, Night shift?"
- Type `=SUMIFS(D2:D13,` → refBox D (sum range). · `B2:B13,"L2",` → L2 rows yellow. · `C2:C13,"Night")` → Night rows green, intersection glows → result.
- `=COUNTIFS(C2:C13,"Night",D2:D13,">5")` → count. Callout "SUMIFS: sum range FIRST (SUMIF puts it last)."
Try-it (value): target G2 (any free cell), expected = L2+Night total, mustUse ['SUMIFS'].

**08-index-match** · INDEX + MATCH · `All` · formula `=INDEX(B2:D7,MATCH(G2,A2:A7,0),MATCH(G3,B1:D1,0))` · "Two-way lookup".
Stage: capacity matrix machines M-101..M-106 × Day/Swing/Night (units/shift); inputs G2 `M-104`, G3 `Night`.
- "VLOOKUP needs a hard-coded column number. Two inputs? Use two MATCHes."
- MATCH(G2,A2:A7,0): scan down A → bubble 4. · MATCH(G3,B1:D1,0): scan across → bubble 3.
- INDEX(B2:D7,4,3): row/column crosshair → value pops to G4.
- Change G3 to `Day` → recompute. Callout "0 = exact match, always."
Try-it (value): inputs preset M-105/Swing, expected = that cell, mustUse ['INDEX','MATCH'].

**09-xlookup** · XLOOKUP · `365/2021` · formula `=XLOOKUP(F2,A2:A9,C2:C9,"Not found")` · alt "Older Excel: =IFERROR(INDEX(C2:C9,MATCH(F2,A2:A9,0)),"Not found")" · "Lookups without column numbers".
Stage: Part No | Description | Std Time (min) | Work Center, 8 parts (P-1001…); F2 = P-1043.
- "VLOOKUP pain: column numbers, can't look left, #N/A."
- `=XLOOKUP(F2,A2:A9,C2:C9)` with refBoxes → result. · Left lookup `=XLOOKUP("Weld bracket",B2:B9,A2:A9)` → arrow leftward.
- F2 = P-999 → #N/A red → add `"Not found"` → friendly text. Callout "Exact match is the default."
Try-it (value): expected std time of a given part, mustUse ['XLOOKUP'].

**10-ifs** · IFS for ABC classes · `2019+` · formula `=IFS(C2<=0.8,"A",C2<=0.95,"B",TRUE,"C")` · alt "Older Excel: nested IF" · "ABC inventory without nested-IF pain".
Stage: 10 SKUs sorted by annual usage value with cumulative % in C (e.g. 42%, 63%, 77%, 85%, 90%, 94%, 96%, 98%, 99%, 100%); D Class empty.
- Ghost nested IF `=IF(C2<=0.8,"A",IF(C2<=0.95,"B","C"))` with bracket counting, fades.
- Type IFS with test→result pairs colour-coded. · Fill D2:D11 → A/B/C chips (green/amber/grey).
- Callout "Checks in order, stops at first TRUE. TRUE at the end = else; forget it → #N/A."
Try-it (fill): target D2, fill D2:D11, expected classes column, answer as formula above, hint "Pairs of test, result… end with TRUE,"C"".

**11-filter-sort** · FILTER + SORT · `365/2021` · formula `=SORT(FILTER(A2:F11,F2:F11<0.85),6,1)` · alt "Older Excel: AutoFilter (Ctrl+Shift+L) + Sort, by hand each time" · "A live 'worst machines' list".
Stage: Machine | Line | Avail | Perf | Quality | OEE (=A×P×Q, distinct values), 10 rows, 4 below 85%.
- "Daily: which machines are under 85% OEE, worst first?"
- FILTER(A2:F11,F2:F11<0.85): passing rows glow, others dim → spill at H2 (blue border).
- Wrap SORT(…,6,1) → spilled rows slide into ascending OEE order.
- Change one OEE to 0.79 → new row slides into the spill. Callout "#SPILL! = something blocks the spill range."
Try-it (spill): target H2, expected = sorted 2D rows, mustUse ['FILTER','SORT'].

Act 3: See the problem
**12-cf-formula** · Conditional formatting with a formula · `All` · formula `=OR($B2>$F$2,$B2<$F$3)` · "SPC alarms that light themselves".
Stage: Sample 1–20, Mean diameter mm (around 25.00; sample 7 = 25.08, sample 15 = 24.92), F2 UCL 25.06, F3 LCL 24.94; small control chart with dashed UCL/LCL.
- "Which samples are out of control? Eyeball 20 rows… or 2,000?"
- Select A2:B21; ribbon Home › Conditional Formatting › New Rule › "Use a formula to determine which cells to format".
- Type rule; callouts "$B = always the Mean column · 2 = moves down rows · $F$2 = fixed limit".
- Red fill → OK → rows 7 and 15 light up, chart points turn red.
- UCL → 25.05 → one more row lights (pick a sample at 25.055). Callout "Same trick: =$E2<TODAY() for overdue PMs."
Try-it (cf): target H2, fill H2:H21, cfRange A2:B21, expected booleans, answer as formula above.

**13-sparklines** · Sparklines · `All` (2010+) · ribbon Insert › Sparklines › Line · "A chart in every cell".
Stage: L1–L5 × Mon–Sun daily output (L4 trending down); column I "Trend".
- "35 numbers. Which line is sliding?" · Select B2:H6; ribbon Insert › Sparklines › Line → dialog (Data Range B2:H6, Location Range $I$2:$I$6) → OK.
- Sparklines draw. · Sparkline tab › Show: ☑ High Point, ☑ Low Point → markers. · Switch to Column type.
- Callout on L4: "Spot it in a second — prints with the report."

**14-pivot-slicers** · Pivot Table + Slicers · `All` · ribbon Insert › PivotTable; refresh Alt+F5 · "Downtime by cause, one click per line".
Stage: downtime log Date | Line | Cause | Minutes (16 rows; causes Changeover, Breakdown, Material wait, Quality hold, Minor stops).
- "Where is our downtime going?" · Insert › PivotTable dialog (Table/Range, New Worksheet) → field list appears.
- Drag Cause → Rows, Minutes → Values; sort largest to smallest.
- PivotTable Analyze › Insert Slicer › ☑ Line → slicer L1/L2/L3. · Click L2 → totals animate. · Click L3 → totals animate.
- Callout "New data? Alt+F5 refreshes this pivot; Ctrl+Alt+F5 refreshes all."

**15-pareto** · Built-in Pareto chart · `2016+` · ribbon Insert › Insert Statistic Chart › Pareto · "80/20 in two clicks".
Stage: Cause | Count: Misalignment 142, Scratch 96, Burr 51, Dent 27, Crack 14, Porosity 9, Other 6 (total 345).
- "Which few causes make most defects?" · Select A1:B8; ribbon path → Pareto chart animates (bars desc + cumulative line).
- 80% guide; top 3 causes highlighted: 41.2%, 69.0%, 83.8%. · Callout "3 of 7 causes = 84% of defects → fix these first."
- Callout "Excel sorts and computes cumulative % for you. Older Excel: sort + cum% column + combo chart."

Act 4: Decide & optimize
**16-goal-seek** · Goal Seek · `All` · ribbon Data › What-If Analysis › Goal Seek · "Work backwards to your takt time".
Stage: B1 Available time (s) 27000 (450 min × 60), B2 Cycle time (s) 62, B3 Units/day `=B1/B2` → 435.5. Target 480.
- "Need 480 units/day. What cycle time?" · Ribbon path → dialog (Set cell B3 · To value 480 · By changing cell B2).
- OK → B2 ticks 62 → 58.9 → 57.1 → 56.25, B3 → 480. Status: "Goal Seeking with Cell B3 found a solution. Target value: 480 Current value: 480".
- Callout "56.25 s = takt time. One input, one target. Several inputs + limits → Solver."

**17-data-table** · What-If Data Table · `All` · ribbon Data › What-If Analysis › Data Table · "Every order quantity at once".
Stage: D=12000/yr, S=1500 per order, H=30 per unit-yr, Q (B4)=800, TC (B5) `=B1/B4*B2+B4/2*B3` = 34,500.
- "Cheapest order quantity? Try them all." · Q list D8:D15 = 400…1800 step 200; E7 `=B5`.
- Select D7:E15; ribbon path → dialog (Row input cell blank · Column input cell B4) → OK.
- Cascade: 51,000 · 39,000 · 34,500 · 33,000 · 33,000 · 33,857 · 35,250 · 37,000; bar shows `{=TABLE(,B4)}`.
- Min rows glow + U-curve line chart; callout "EOQ = √(2DS/H) ≈ 1,095 — the table brackets it (TC ≈ 32,863)."

**18-solver** · Solver product mix · `All` (add-in) · ribbon Data › Analyze › Solver · "Let Excel do the LP".
Stage: decision B2:C2 (Brackets, Housings) = 0; profit/unit 40, 30; D3 `=SUMPRODUCT(B2:C2,B3:C3)`; Machining 2,1 ≤ 100; Assembly 1,1 ≤ 80.
- "How many of each to maximize profit with 100 machining h and 80 assembly h?"
- Solver Parameters dialog: Set Objective $D$3 · To: Max · By Changing Variable Cells $B$2:$C$2 · Subject to the Constraints $D$5:$D$6 <= $F$5:$F$6 · ☑ Make Unconstrained Variables Non-Negative · Solving Method: Simplex LP.
- Solve → B2:C2 animate to 20 and 60, profit 2,600, both constraints 100% used. Message: "Solver found a solution. All Constraints and optimality conditions are satisfied."
- Graphical view: feasible region, iso-profit line slides to vertex (20, 60).
- Callout "Enable once: File › Options › Add-ins › Manage Excel Add-ins › Go › ☑ Solver Add-in."

**19-forecast-sheet** · Forecast Sheet · `2016+` · ribbon Data › Forecast › Forecast Sheet · "Seasonal demand forecast in one click".
Stage: 24 months of seasonal, trending demand + line chart.
- "Plan production for the next 6 months." · Select both columns; ribbon path → "Create Forecast Worksheet" preview (Options: Confidence Interval 95%, Seasonality Detect Automatically).
- Create → forecast line + shaded confidence band animate (illustrative values).
- Callout: generated formula `=FORECAST.ETS(A26,$B$2:$B$25,$A$2:$A$25,1,1)` + FORECAST.ETS.CONFINT. "Plan capacity on the upper bound, materials on the forecast."
Notes: Forecast Sheet button is Excel 2016+ for Windows; on Mac/web use the FORECAST.ETS function.

**20-monte-carlo** · Monte Carlo · `All` · formula `=NORM.INV(RAND(),12,1.5)` · "Simulate variability, not averages".
Stage: 3 stations mean/SD: 12/1.5, 18/2.5, 9/1.0 (min); total mean 39; customer promise 42.
- "Average says 39 min. Promise is 42. How often do we make it?"
- `=NORM.INV(RAND(),12,1.5)`: animation of a random 0–1 point on the y-axis mapping through the S-shaped normal CDF to a time.
- Row of 3 station times + total; keys F9 → numbers re-roll.
- Fill 1,000 rows → histogram builds into a bell; 42 marker, shade below.
- `=COUNTIF(E2:E1001,"<=42")/1000` → ≈ 83.5% (theory: σ = √9.5 ≈ 3.08, z ≈ 0.97). Callout "Cut station-2 variability and on-time jumps."
Try-it (random): target B2, expected none, random {trials:500, mean:18, sd:2.5}, mustUse ['NORM.INV','RAND'], answer `=NORM.INV(RAND(),18,2.5)`.
