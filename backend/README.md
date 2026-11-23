# F1 For You Backend

FastAPI service. Currently a scaffold (health check only) — the foundation for future ML models and backend functionality. Not yet consumed by `frontend/`, which fetches F1 data directly from the Jolpica-F1 API.

## Setup

```
uv sync
```

## Run

```
uv run uvicorn app.main:app --reload --port 8000
```

Then check:

```
curl http://localhost:8000/health
```

## Test

```
uv run pytest
```

## Adding new endpoints

Add a router module under `app/routers/` (see `health.py` for the pattern), then wire it into `app/main.py` via `app.include_router(...)`. Pydantic request/response schemas go in `app/models/`; inference or other service logic goes in `app/services/`.
