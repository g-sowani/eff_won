# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

APEXF1 is a static, vanilla HTML/CSS/JS Formula 1 site: a hero landing page plus live sections for the next race weekend, latest race/qualifying results, driver & constructor standings, and a static all-time-records archive. There is no build step, package manager, or framework — everything is hand-written and loaded directly by the browser.

## Running locally

There is no build/lint/test tooling in this repo. To view the site with working `fetch()` calls (opening `index.html` directly via `file://` can be blocked by the browser for cross-origin requests), serve the directory with any static file server, e.g.:

```
python3 -m http.server 8934
```

then open `http://localhost:8934/index.html`.

## Architecture

Three files, loaded in this order from `index.html`:

- `index.html` — page structure/sections only. Section containers (`#nextRaceCard`, `#raceTable`/`#qualiTable`, `#driverStandings`/`#constructorStandings`, `#recordsGrid`) start empty or with loading placeholders and are populated entirely by `js/main.js` at runtime.
- `css/styles.css` — all styling, organized in commented blocks (Loader, Navbar, Hero, Sections, Race Card, Tabs, Table, Standings, Records, Footer, Responsive). Design tokens (colors, fonts, easing) are CSS custom properties on `:root` in the first block — change theme colors there rather than hardcoding hex values elsewhere.
- `js/main.js` — a single IIFE with no external JS dependencies. All page behavior lives here: navbar scroll/progress state, `IntersectionObserver`-driven scroll-reveal (`.reveal` / `.reveal.in`), the race-card countdown timer, results tab switching, and standings bar-fill animation.

### Live data flow

All live content (next race, latest race results, latest qualifying results, driver/constructor standings) is fetched client-side from the **Jolpica-F1 API** (an Ergast-compatible, CORS-open, no-auth-required API) at `https://api.jolpi.ca/ergast/f1`, via the `getJSON()` helper in `main.js`. Key endpoints in use:

- `current/next.json` — next race + session schedule
- `current/last/results.json` — most recent race results
- `current/last/qualifying.json` — most recent qualifying results (Q1/Q2/Q3)
- `current/driverstandings.json`, `current/constructorstandings.json`

Each fetch has its own try/catch and renders an inline error message into its own DOM target on failure — a failed standings fetch doesn't affect the results or next-race sections. When adding a new live section, follow this pattern: fetch → render function that fully replaces the target's `innerHTML` → wire into the `Init` calls at the bottom of `main.js`.

Team colors (for the colored dot next to constructor names) are hardcoded in the `TEAM_COLORS` map in `main.js`, keyed by the API's `constructorId` (e.g. `red_bull`, `rb`, `mercedes`). New teams/liveries need a manual entry here.

The **Records** section (`RECORDS` array in `main.js`) is static, hand-maintained trivia (most wins, poles, titles, etc.) — it is not fetched from any API and needs manual updates over time as records change.

### Animation conventions

- Any element that should fade/slide in on scroll gets the `.reveal` class in HTML (or via `observeReveal(el)` for JS-inserted nodes); an `IntersectionObserver` adds `.in` once it enters the viewport. Do this instead of ad-hoc scroll listeners.
- The countdown timer (`tickCountdown`) is re-armed with `setInterval` every time `renderNextRace` runs, and the previous interval is cleared first — keep this pairing if you touch that function to avoid stacking intervals.
- Respect the existing `prefers-reduced-motion` block at the bottom of `styles.css` when adding new animations.
