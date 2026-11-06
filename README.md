# Mosquito Dashboard — Frontend

Web dashboard for the Mosquito Surveillance Dashboard: maps, sensor readings,
mosquito detections, devices and clusters, reports, notifications, users and
system health. All data comes from the backend API
([mosquito_dashboard_be](https://github.com/Ackahkelvin45/mosquito_dashboard_be)).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- TanStack Query (server state), Zustand (auth/client state)
- Leaflet / react-leaflet (maps), Recharts (charts), jsPDF (PDF export)

## Running locally

Needs Node.js 20 (the version the Dockerfile uses) and a running backend.

```bash
npm ci
# create .env with NEXT_PUBLIC_BACKEND_API_URL (see below)
npm run dev
```

Open http://localhost:3000.

`next.config.ts` sets `output: 'standalone'`; the Docker image runs the
standalone server (`node server.js`).

### With Docker

```bash
docker compose up -d --build                         # port 3000, built with .env
docker compose -f docker-compose.test.yml up -d --build   # port 3001, built with .env.test
```

`NEXT_PUBLIC_*` values are inlined at **build** time, so rebuild the image
after changing them.

## Environment variables

Names and purpose only; never commit `.env` (it is gitignored).

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_BACKEND_API_URL` | Base URL of the backend API, e.g. `http://localhost:8000`. Required: API calls fail without it |
| `NEXT_PUBLIC_INACTIVITY_TIMEOUT` | Optional. Idle time (ms) before the auto-logout warning appears (default 60000) |
| `NEXT_PUBLIC_INACTIVITY_COUNTDOWN` | Optional. Countdown (ms) shown before auto-logout (default 60000) |

## Tests and checks

There is no automated test suite in this repo yet. CI
(`.github/workflows/ci.yml`) runs on every push and pull request:

```bash
npm ci
npx next typegen      # generates next-env.d.ts (gitignored) and route types
npx tsc --noEmit
npm run build
```

`npm run lint` exists but currently reports errors, so it is not part of CI yet.

## Database migrations

The frontend has no database. Migrations belong to the backend
(`alembic upgrade head`, see the backend README).

## API documentation

- Backend Swagger UI: `<NEXT_PUBLIC_BACKEND_API_URL>/docs`
- Public data API reference page: `public/api-reference.html`, served at
  `/api-reference.html` and linked from the dashboard's APIs page
- Backend's public API doc: `docs/public_api.md` in the backend repo

## MQTT

The frontend does not connect to MQTT. Devices publish to the backend's broker
(topics `mosquito_dashboard/<device_uuid>/sensor_data` and
`.../mosquito_data`, see the backend README). The System Health page shows the
backend's MQTT status, traffic and errors via `/monitoring/mqtt/*`.

## Backend connection

All requests go through `apiFetch` in `api/base.ts`:

- URL: `NEXT_PUBLIC_BACKEND_API_URL` + endpoint path
- Auth: `Authorization: Bearer <access token>` from the Zustand auth store
- On a 401 it calls `POST /auth/refresh-token` once (shared across concurrent
  requests) and retries; if refresh fails the user is logged out
- Browser push: the service worker `public/sw.js` is registered and the
  subscription is sent to the backend's `/push` endpoints

The backend must allow this app's origin in its `CORS_ORIGINS` setting.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)

## Licence

To be decided.
