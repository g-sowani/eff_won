# APEXF1

A Formula 1 hub: live next-race countdown, season calendar with per-race detail pages, latest race/qualifying results, driver & constructor standings, and an all-time-records archive.

This is a monorepo with two independent subprojects:

- **`frontend/`** — Next.js (App Router, TypeScript) site. See `frontend/README.md` for setup and run instructions.
- **`backend/`** — FastAPI service, currently a scaffold (health check only) reserved for future ML models and backend functionality. See `backend/README.md` for setup and run instructions.

The frontend and backend are not yet wired together — the frontend fetches F1 data directly from the [Jolpica-F1 API](https://api.jolpi.ca/ergast/f1).

See `CLAUDE.md` for architecture details.
