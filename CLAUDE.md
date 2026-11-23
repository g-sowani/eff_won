# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

F1 For You is a Formula 1 site: a hero landing page plus live sections for the next race weekend, a season calendar with per-race detail pages, latest race/qualifying results, driver & constructor standings, and a static all-time-records archive.

This is a monorepo with two independent subprojects:

- **`frontend/`** — Next.js (App Router, TypeScript) site. This is where all current functionality lives.
- **`backend/`** — FastAPI service. Currently a scaffold (health check only), reserved as the foundation for future ML models and backend functionality. **Not yet wired into the frontend's data flow** — see "Live data flow" below.

See each subproject's own README for setup details.

## Running locally

```
cd frontend && npm run dev       # http://localhost:3000
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

These are currently two independent, unconnected dev servers.

## Architecture (`frontend/`)

- `app/` — Next.js App Router routes.
  - `layout.tsx` — root layout: `next/font/google` (Orbitron + Inter) wired to generate the `--font-display`/`--font-body` CSS variables that `globals.css` expects, imports `globals.css`, and renders `Loader`/`Navbar`/`{children}`/`Footer`.
  - `globals.css` — near-verbatim port of the original static site's stylesheet. **Deliberately kept as one global stylesheet, not fragmented into CSS Modules** — the file is already well organized into commented blocks and fully class-based (no ID selectors), so don't split it up. Design tokens (colors, easing) are CSS custom properties on `:root` — change theme colors there.
  - `page.tsx` — home page, composes the section components from `components/home/`.
  - `race/[season]/[round]/page.tsx` — race details page (see below).
- `components/layout/` — `Loader`, `Navbar`, `Footer`.
- `components/ui/` — shared building blocks: `Reveal` (scroll-reveal wrapper), `SessionChip`, `ResultsTabs`, `RaceResultsTable`, `QualifyingResultsTable` (the last two are shared between the home page's Results section and the race details page), `CircuitTrack`, `DitherField` (animated dot-matrix track scene; see "Scroll journey" below).
- `components/home/` — home-page section components, each owning its own client-side fetch (`NextRaceSection`, `CalendarSection`, `ResultsSection`, `StandingsSection`, `RecordsSection`), plus their per-item components (`NextRaceCard`, `CircuitCard`, `StandingRow`, `RecordCard`) and `Hero`/`CtaSection`. The hero is deliberately graphic, not copy-heavy: `StartLights` (five-light sequence on load), the wordmark + one tagline, and `HeroPitWall` (a dark live panel: next race countdown, championship leader, last winner — follows the live data-flow pattern below).
- **Scroll journey (home page):** `app/page.tsx` renders one fixed, full-viewport `<DitherField className="track-backdrop" finishSelector=".cta-section">` behind every section. Scroll position is distance traveled down the track: kerbs rush past, corners come and go, dusk turns to starry night, the scene dims behind the data sections, and a checkered finish line arrives when the bottom of `.cta-section` reaches the bottom of the viewport. Because of this, home sections are transparent (`.section-alt` has no fill) and content must sit on solid surfaces (`--surface`); give any new see-through control a background. The race details page has no backdrop.
- `components/race/` — race details page components: `RaceDetailsView` (fetch orchestration), `RaceHeader`, `SessionSchedule`, `RaceResultsPanel`.
- `hooks/` — `useRevealOnScroll` (backs `<Reveal>`), `useMountReveal` (force-reveal-on-mount, used by grid cards inserted after a fetch), `useCountdown`, `useScrollProgress`, `useBarFillOnScroll`.
- `lib/` — `api.ts` (`getJSON`), `types.ts`, `sessions.ts` (shared session-schedule building, used by both the next-race card and the race details page), `svg/roundedPolygonPath.ts`, `constants/` (`teamColors.ts`, `countryFlags.ts`, `circuitTracks.ts`, `records.ts`).

### Race details page

Clicking a circuit card in the Calendar section (`components/home/CircuitCard.tsx`) navigates to `/race/[season]/[round]` — `race.season`/`race.round` already come from the calendar's fetched data, no extra fetch needed to build the link. The route shows the race header (name/circuit/date), session schedule, and race/qualifying results tables — for a future race with no results yet, the results tables just render their existing "not available yet" fallback; for a nonexistent season/round, an inline "not found" message is shown. All client-rendered, consistent with the data flow below.

### Live data flow

All live content (next race, season calendar, latest/per-race results, latest/per-race qualifying, driver/constructor standings) is fetched **client-side** from the **Jolpica-F1 API** (an Ergast-compatible, CORS-open, no-auth-required API) at `https://api.jolpi.ca/ergast/f1`, via `getJSON()` in `frontend/lib/api.ts`. Key endpoints in use:

- `current/next.json` — next race + session schedule
- `current.json` — full season calendar
- `current/last/results.json`, `current/last/qualifying.json` — most recent race/qualifying results
- `current/driverstandings.json`, `current/constructorstandings.json`
- `{season}/{round}.json`, `{season}/{round}/results.json`, `{season}/{round}/qualifying.json` — race details page (past or future race, by season+round)

Each fetch has its own try/catch and renders its own inline loading/error state — a failed standings fetch doesn't affect the results or next-race sections. When adding a new live section, follow this pattern: a client component fetches in a `useEffect`, tracks status (`loading`/`error`/`ready`) in state, and renders accordingly.

**Auto-refresh:** every live section puts `useLiveRefreshTick()` (`hooks/useRefreshTick.ts`) in its fetch effect's dependency list. It re-fetches every 5 minutes during a race weekend (2h before FP1 until 24h after the race start, computed in `lib/raceWeekend.ts` from the season calendar) and hourly otherwise. It pauses in background tabs and catches up immediately when the tab is shown again. The season calendar is fetched **once per visit** via `getSeasonCalendar()` (a shared, memoized promise used by both `CalendarSection` and the scheduler), not refreshed. The race details page passes `enabled: false` (`useLiveRefreshTick(!settled)`) once its race is more than 3 days old (`isRaceSettled`), since those results are final. A background refresh must not flash back to "loading" or replace good data with an error — in catch blocks, only set `error` if the status isn't already `ready` (e.g. `setStatus((s) => (s === "ready" ? s : "error"))`). `getJSON` uses `cache: "no-store"` so refreshes actually hit the API.

**The FastAPI backend does not yet participate in this data flow** — it's a standalone scaffold for now. If/when the frontend starts calling it, update this section.

Team colors (for the colored dot next to constructor names) are hardcoded in `frontend/lib/constants/teamColors.ts`, keyed by the API's `constructorId` (e.g. `red_bull`, `rb`, `mercedes`). New teams/liveries need a manual entry here.

The **Records** section (`frontend/lib/constants/records.ts`) is static, hand-maintained trivia (most wins, poles, titles, etc.) — it is not fetched from any API and needs manual updates over time as records change.

### Animation conventions

- `<Reveal as="..." className="...">` (`components/ui/Reveal.tsx`) backs fade/slide-in-on-scroll elements — it renders the actual target element via the `as` prop (not a wrapper div), which matters because some CSS rules key off the element's own class plus `.reveal` (e.g. `.hero-title.reveal{ --d: 80 }`). Use it instead of ad-hoc scroll listeners.
- `useMountReveal` is for dynamically-inserted grid cards (`CircuitCard`, `RecordCard`) that should force-fade-in as soon as they render, regardless of real scroll position — this intentionally mirrors the original site's actual `observeReveal()` behavior (not an idealized "wait for real intersection" version).
- `useCountdown`'s effect cleanup clears its `setInterval` whenever the `target` Date changes or the component unmounts — this is what guarantees the "clear before re-arm" invariant. Note `target` must be a referentially-stable `Date` (e.g. via `useMemo` keyed on the underlying date/time strings) or the effect will tear down and rebuild the interval on every render.
- Respect the existing `prefers-reduced-motion` block at the bottom of `globals.css` when adding new animations.
- The design is flat: no CSS gradients (`linear-`/`radial-gradient`) or gradient text. Use solid colors or translucent tints instead. `DitherField` fits this rule: it draws only solid-color dots from a small palette (ordered dithering), with separate palettes per theme in `PALETTES`.

## Backend (`backend/`)

FastAPI app in `backend/app/`, managed with `uv`. `app/main.py` wires up CORS (allowing `localhost:3000`) and includes routers from `app/routers/` — currently just `health.py` (`GET /health`). Add new endpoints as a router module in `app/routers/`, wired into `app/main.py` via `app.include_router(...)`; request/response schemas go in `app/models/`, inference or other service logic in `app/services/`. This is where future ML models and backend functionality should be added.
