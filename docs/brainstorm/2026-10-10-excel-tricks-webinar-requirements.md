# Requirements: "20 Excel Tricks You Don't Know" interactive webinar deck

Date: 2026-10-10 · Stage: Requirements (sc:brainstorm) · Next: Design (superpowers:brainstorming)

## Hard constraint: deadline

The webinar is **today, about 5 hours from 08:45 (around 13:45 local)**. The build must be done and presentable
with **at least 1 hour of rehearsal buffer**, so plan for a working deck in about 3 hours. Every requirement below
is ranked so the build can stop at any tier and still ship something usable.

## Goal

A browser-based, animation-led presentation that teaches Industrial Engineering (IE) students 20 lesser-known Excel
tricks through IE scenarios. Students also open the same link and try the formula tricks themselves.

## Settled decisions

| Topic | Decision |
|---|---|
| Audience | IE students, basic–intermediate Excel (SUM, IF, basic charts, maybe VLOOKUP) |
| Format | Live webinar, 90 minutes, presenter screen-shares the deck |
| Live Excel | **None.** The deck carries every demo, with no switching to the Excel app |
| Interactivity | Step-by-step animations + in-browser "try it" boxes; **no** quizzes/polls; **no** practice workbook |
| Student access | Students open the same deck link on their own devices during "try it" moments |
| Devices | Unknown. Laptop first, phones must stay usable (readable, no broken layout) |
| Examples | IE scenarios throughout (production, inventory, QC/SPC, time study, scheduling, optimization) |
| Excel versions | Mixed/unknown. Every trick shows a version tag; only 2 of 20 need Microsoft 365 |
| Presenter aids | Speaker notes only (no timer, no jump menu requested) |

## The 20 tricks (approved), suggested running order

Act 1: Capture & clean data
1. Flash Fill (Ctrl+E): split operator codes `L2-OP0423-NIGHT` into line / operator / shift. *All*
2. Go To Special → Blanks + Ctrl+Enter: fill the gaps in an exported shift report. *All*
3. Paste Special → Multiply/Divide: convert a time study from seconds to minutes in place. *All*
4. Ctrl+T Tables: a production log whose formulas and charts extend automatically. *All*
5. Data Validation dropdowns: standard defect codes on a QC entry sheet. *All*

Act 2: Formulas that think
6. Mixed references ($A2*B$1, F4): a whole cost grid from one formula. *All*
7. SUMIFS / COUNTIFS: defects by line *and* shift. *All*
8. INDEX + MATCH two-way lookup: machine × shift capacity matrix. *All*
9. XLOOKUP: standard time by part number, with a not-found default and left lookup. *365/2021*
10. IFS: ABC inventory classification. *2019+*
11. FILTER + SORT: live list of machines under 85% OEE, worst first. *365/2021*

Act 3: See the problem
12. Conditional formatting with a formula: flag SPC points outside UCL/LCL. *All*
13. Sparklines: each line's daily output trend in one cell. *All*
14. Pivot Table + Slicers: downtime by cause, filtered by line with one click. *All*
15. Built-in Pareto chart: 80/20 of defect causes. *2016+*

Act 4: Decide & optimize
16. Goal Seek: what cycle time hits 480 units/day? *All*
17. What-If Data Table: inventory cost vs. order quantity (EOQ sensitivity). *All*
18. Solver: product-mix LP, maximize profit under machine-hour limits. *All (add-in)*
19. Forecast Sheet / FORECAST.ETS: demand forecast with a confidence band. *2016+*
20. Monte Carlo (RAND + NORM.INV): assembly completion-time variability. *All*

Closing teaser (not counted): Power Query, merge 12 monthly CSVs with one refresh.

Cut from the candidate list: UNIQUE/Remove Duplicates, LET, NETWORKDAYS/WORKDAY, Watch Window/Trace Precedents.

### Suggested time budget (90 min)
Intro 5 · Act 1 ~17 · Act 2 ~21 · Act 3 ~14 · Act 4 ~18 · Power Query teaser 2 · Q&A/wrap 13.
About 3.5 minutes per trick on average.

## Functional requirements

### P0: must ship (deck is unusable without these)
- **FR-1 Slide per trick**, each with: trick name, keyboard shortcut or formula, version tag, IE scenario, a
  "why it matters for an IE" one-liner, and the step-by-step demo.
- **FR-2 Step-by-step animations** advanced by the presenter (click / arrow / space): highlight cells, build a
  formula piece by piece, move data into place, show the result. Each "step" is one presenter click so pacing
  matches the talk.
- **FR-3 Mock spreadsheet visuals** that look recognisably like Excel (grid, column letters, row numbers,
  formula bar), so students connect the animation to the real app.
- **FR-4 Keyboard navigation** across slides and steps; works when screen-shared at 1080p.
- **FR-5 Speaker notes** per slide: talking points + the exact keys/clicks to say aloud. Visible to the presenter
  only (separate view or toggle) and never shown on the shared screen by accident.
- **FR-6 Shareable link** that students can open in a normal browser **without logging in**, in time for the session.
- **FR-7 Title, agenda, section dividers and closing slides** (with the Power Query teaser).

### P1: should ship (the "interactive" promise)
- **FR-8 Try-it boxes on the formula tricks** (at minimum #6, #7, #8, #9, #10, #11, #12, #20): a small editable grid
  pre-loaded with the IE dataset where a student types the formula and sees a **real computed result**. Correct
  answers get a confirmation and wrong ones get a hint. Results must match what Excel would return.
- **FR-9 Students can move independently**: a student on the link can browse and try things without following
  the presenter's current slide.
- **FR-10 Phone-usable**: slides readable and try-it boxes operable (even if awkward) on a phone browser.

### P2: nice to have (only if time remains)
- **FR-11 Interactive simulations for UI tricks** (e.g. clickable slicer on #14, sliders on #16 Goal Seek / #18
  Solver, a dropdown that actually drops on #5) instead of animation only.
- **FR-12 "Reset" per try-it box** and a "show answer" button.
- **FR-13 PDF or static backup** of the deck in case the link or network fails mid-webinar.

## Non-functional requirements
- **NFR-1 Reliability over flash**: if the try-it engine fails to load, slides and animations must still work.
- **NFR-2 Fast load**: the link opens in a few seconds on student mobile data, with no heavy dependencies.
- **NFR-3 Legible when screen-shared**: large type, high contrast, works in Zoom/Meet/Teams compression.
- **NFR-4 Accuracy**: every formula, shortcut and version tag must be correct for real Excel. Students will try them.
- **NFR-5 Self-contained**: one deck at one URL, with no build step needed on the presenter's machine.

## User stories & acceptance criteria
- *As the presenter*, I can advance every animation step by step with the keyboard and read notes privately.
  **AC:** all 20 trick slides advance cleanly from first step to last step, and notes never appear on the shared view.
- *As a student*, I can open the link with no login, find the trick being taught, type the formula and get the
  same answer Excel would. **AC:** each P1 try-it box accepts the canonical formula and shows the correct value.
- *As a student with older Excel*, I know which tricks I can use at home. **AC:** every trick shows a version tag,
  and the 365-only tricks (#9, #11) show an older-Excel alternative (INDEX/MATCH, AutoFilter + Sort).

## Out of scope
Live switching to the Excel app, polls/quizzes, a downloadable practice workbook, a pacing timer, a jump-to-trick
menu, recording/editing the webinar.

## Open questions / risks (for Design)
1. **Hosting a no-login public link**: which host gives students a link they can open with no account in under
   5 hours? This must be verified early, not assumed.
2. **Formula engine for try-it boxes**: does a browser engine support XLOOKUP / FILTER / SORT / IFS, or do some
   try-its need a hand-rolled evaluator or answer checking?
3. **Branding**: the title slide reads **"Excel to Excel"** (webinar name, a play on "excel at Excel").
   No presenter name or org logo was given, so keep the title slide unbranded apart from that.
4. **Language**: assumed English on the slides.
5. **Build order under deadline**: P0 for all 20 first, then P1, then P2, so the deck is presentable at every point.
