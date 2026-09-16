# Frontend redesign handoff

Updated: 16 September 2026 (second pass). Work is uncommitted.

## 1. What the owner wants

These are the current instructions, in order of clarification:

- Redesign the **whole frontend**, not only recolor the CSS.
- Preserve the existing content and scientific data. Change how the material is presented so the site tells a story through its data.
- The owner explicitly permits a full visual rebrand, different themes, layouts, and whatever frontend changes are needed.
- “Forest-and-ember” was an initial proposal, **not a required identity**. The owner explicitly allows replacing it.
- **The website background in light mode must always be pure white.** Preserve `--background: #ffffff`; keep the body, page canvas, header, and footer white. Restrained tinted controls or data surfaces can provide hierarchy, but do not return to a cream/colored page canvas.
- The UI must feel **premium, high class, creative, and unusual**. A conventional dashboard, generic split hero, or simple color swap is insufficient.
- The owner has not approved the present visual direction as final. Treat it as a working iteration and exercise design judgment without asking again for permission to redesign.

The most recent request was to stop implementation and prepare this handoff. No new task, commit, publication, or deployment was requested.

## 2. Instructions and repository state

Project: `/Users/raedin/Projects/algeria-fires/algeria-fires`.

Read `AGENTS.md` and `PROGRESS.md`, inspect `git status` and recent history, and inspect the independently modified `Fires/` checkout before proceeding. `AGENTS.md` has older monochrome/chrome-color restrictions; the owner's explicit rebranding instructions above supersede those visual restrictions. Preserve the other relevant rules:

- Arabic, RTL, western digits, isolated LTR coordinates/identifiers.
- IBM Plex Sans Arabic via `next/font`; IBM Plex Mono for numerical data.
- Existing shadcn/Radix components only; no parallel UI library.
- Motion from `motion/react`; accessible reduced-motion behavior.
- Semantic theme tokens, usable light and dark modes.
- Read the installed Next.js documentation before changing APIs. Installed Next is 16.3.3, Tailwind v4, React 19, shadcn radix-nova.
- Preserve URLs, source IDs, metadata, controls, filters, downloads, report/print behavior, and map fallback.
- Do not silently revise the editorial claims to reconcile them with older documentation. This task preserves the currently published words, including owner edits.

Before this session, `skills-lock.json` was modified and many `.agents/skills/*` and `.claude/skills/*` entries were untracked. **Those are owner changes; do not stage, revert, or clean them as redesign work.**

`Fires/` has extensive owner changes, including reports, forensic data, scripts, and MSG output. None were changed during this session. `content/`, `public/generated/`, `package.json`, and `package-lock.json` also remain unchanged by this redesign. Do not run `npm run data:build` merely to validate frontend styling: it republishes scientific assets.

Latest repository commit at start: `0fd3eb3` (`Dialogue improved`). No commits were created.

## 3. Current state (second pass, 16 September 2026)

The first pass (green/rust editorial styling) was replaced. Midway through this pass the owner reviewed a restrained monochrome dossier version and called it **boring, not creative or premium, and not helping readers understand the content**. The design below answers that feedback; it has not yet been approved by the owner.

### Identity: "thermal record"

- `app/globals.css` rewritten. Pure white canvas (`--background: #ffffff`, header/footer/body white), blue-black ink `#0b0e17`, two signal colours with fixed meaning: **ember** `--signal` = fire/heat, **orbit blue** `--orbit` = satellite measurement/timing. `--heat-1…5` is the FRP ramp (darker on paper, glowing in dark mode). Old `--story-*` tokens and the unlayered `@media screen` override block are gone; the component layer only holds skip link, figure counters, scroll margins and the comparison divider. MapLibre and print rules kept (print now hides `.site-header/.site-footer/.skip-link`, no longer every `<header>`, which had hidden the print document's own title block).
- **Night islands**: any element with class `dark` re-scopes the tokens, so dark data surfaces (event panels, story stage) sit inside the white page. They are data surfaces, not page canvas.
- New mark (`site-mark.tsx`, `app/icon.svg`): satellite-pixel registration frame with one ember detection cell.
- `components/editorial.tsx`: `Masthead` (file strip, title, lede, optional `panel`, `MetaLedger`), `NightPanel`, `Kicker`, `Dossier` (sticky side index + mobile `SectionNavigator`), `IndexNav`, `SectionLabel`, `StatStrip`/`Measure` (number in LTR island, unit outside), `EdgePanel` with tones, auto-numbered `DataFigure` ("شكل 01"), `Timeline`, `ClaimBasis`, `ContinueLinks`.
- shadcn sources adjusted in place: `ui/table.tsx` (quiet header, and containers become focusable only when they overflow), `ui/alert.tsx` (start-edge rule), `ui/slider.tsx` (square thumb), `ui/tabs.tsx` (ember indicator).

### Data-driven signature components (all numbers from published files)

- `lib/sentinel-frame.ts`: reproduces the UTM 31N envelope of `Fires/scripts/08_sentinel2.py` (verified: 4946 × 2700 px at 20 m, identical to `burn-severity.png`) so origin coordinates are placed on the S2 rasters to ~1 native pixel.
- `components/thermal-record.tsx` (server SVG): all 958 MSG quarter-hour slots, sqrt height + heat colour, measured ignition windows in orbit blue, optional day links.
- `components/story-stage.tsx` (client): home scrollytelling. Sticky full-bleed stage; the six existing timeline entries scroll over it. Each step shows origins reached by that day, highlights the origins its text names, and switches scene **pre-fire (18.08) → post-fire (28.08) → dNBR**, labelled on the image so no step shows a post-fire image before the fire. Daily detections and a mini thermal record with the current day window.
- `components/origin-frame.tsx`: post-fire scene with 10 in-frame origins, north arrow, 10 km scale from the grid, and a 12-origin register (investigation station 02).
- `components/evidence-plates.tsx`: the six suspicion indicators each with a micro-visual built from numbers stated in their text or the origins CSV (bearing 262° vs wind 33–35°, 11–30 min vs 49 min, 6/12, elevations with O03 = 55 m, 4/12 night, 1.5%).
- `components/chronology.tsx`: every day gets a 24-hour ruler of that day's MSG slots (common peak scale) with its moments placed at their times; `components/day-navigator.tsx` is a sticky 8-day bar.
- `components/section-navigator.tsx`: sticky current-section bar with progress and a bottom sheet index (< lg).
- `components/hypothesis-matrix.tsx`: full weight bar + softened-weight tick.
- `lib/published-csv.ts`: shared CSV reader (moved out of `/data`).

### Routes

- `/`: answer-first cover (headline, lede, two anchors, night event panel with key figures + thermal record) → three-step verdict ladder with confidence meters → limits panel → **story stage** → dossier chapters 02–09 (daily chart, comparison slider, S2 panels, Chekfa/Texenna diagram, evidence table, hypotheses, evidence plates, findings accordion, closing panel, continue links).
- Every other route: `Masthead` + route-specific `NightPanel`: chronology (thermal record with day links + stats), investigation (station confidence scoreboard; confidence values in `stationBasis`), map (layer counts + daily detections), data (file inventory + ZIP), report (chapter-length bars linking to chapters), methodology (processing chain), sources (family composition + unavailable/quarantine).
- `not-found.tsx`/`error.tsx` no longer render a nested `<main>`.

Content: every original Arabic string is still in source (`/tmp/jijel-browser-tools/content-check-global.cjs`, 0 missing; the old sidebar label «بيانات الملف» now comes from `Masthead`). New Arabic text is limited to navigation labels, figure captions and data readouts; no editorial claim was rewritten. `Fires/`, `public/generated`, `public/maplibre`, `content/`, package manifests and owner skill files are untouched.

## 4. Verification (final state)

- `npm run lint`, `npm run typecheck`, `npm run test`: pass.
- `npm run build` (webpack, network available): pass; 16 static routes; gate 9,100 · 4,451 · 12 · 17.
- `qa.cjs`: 8 routes × 360/768/1440 × light/dark = 48 cases, all HTTP 200, RTL, 0 horizontal overflow, 0 broken images, 0 page errors.
- `focused.cjs` (axe WCAG 2.1 A/AA) now covers **all 8 routes × both themes**: 0 violations. The script waits 1.2 s after toggling theme; without it axe reads mid-transition colours.
- `interactions2.cjs`: 17 checks pass, 0 runtime errors — white canvas/header/footer, reduced motion, skip link, story stage (26 → 28–29, dNBR layer), side index state, comparison slider keys, chart tabs, accordion, theme persistence, **source search scoped to `.source-register-table`** (the old assertion counted every table), empty state, origin filter (6 Jijel rows) + sort, day navigator, mobile menu, mobile section navigator, **no-WebGL fallback**, **style-provider 503 fallback**, print (white paper, chrome hidden, document title kept, 114-page A4 PDF renders).
- Not done: Vercel preview / real devices / screen-reader pass; formatting with Prettier (new files follow house style by hand).

## 5. Next steps

1. Owner review of the new direction on the running dev server; iterate on feedback.
2. Commit only the redesign files (not `skills-lock.json`, `.agents/`, `.claude/skills/`) when the owner asks.
3. Phase 9 release checks remain separate (domain, Vercel preview).

## 6. Runtime and temporary tooling

Dev server: `http://127.0.0.1:3000`. Temporary tooling in `/tmp/jijel-browser-tools/` (not a project dependency): Playwright, axe, and scripts `qa.cjs`, `focused.cjs`, `interactions2.cjs`, `shots.cjs <route> <width> <light|dark> <screens|all> <height>` (writes to `$OUT`), `story.cjs`, `scrollto.cjs`, `mapshot.cjs`, `content-check-global.cjs`. Baseline of original Arabic strings: `/tmp/jijel-content-baseline.json` (do not regenerate). `interactions.cjs` is the superseded first-pass script.

```sh
node /tmp/jijel-browser-tools/qa.cjs
node /tmp/jijel-browser-tools/focused.cjs
node /tmp/jijel-browser-tools/interactions2.cjs
node /tmp/jijel-browser-tools/content-check-global.cjs
npm run lint && npm run typecheck && npm run test && npm run build
```
