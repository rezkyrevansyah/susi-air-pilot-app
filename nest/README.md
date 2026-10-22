# Pilot API

Backend for my Susi Air technical test submission, built with NestJS 12 and TypeScript on Node 22. The three JSON files from the brief are loaded and validated once at startup and kept in memory, so there is no database.

## Run locally

From `nest/`, with Node 22 (see `.node-version`):

```sh
npm ci
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
```

Put a random secret in `JWT_SECRET`, for example:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Then start the server:

```sh
npm run start:dev
```

The API runs on `http://localhost:3001`. Login is `johndoe` / `susiairtest`, as fixed by the brief.

| Variable       | Required | Meaning                                                                                                                   |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET`   | Yes      | Signing secret, at least 32 characters. The server refuses to start without it.                                           |
| `PORT`         | No       | Defaults to `3001`. Railway and Render set it for you.                                                                    |
| `CORS_ORIGINS` | No       | Comma-separated frontend origins, exact match (no wildcard, path or trailing slash). Defaults to `http://localhost:3000`. |

## Endpoints

Everything except `POST /auth/login` needs `Authorization: Bearer <accessToken>`. There is no `/api` prefix. Dates are `YYYY-MM-DD`.

| Method | Path                             | Returns                                                                   |
| ------ | -------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/auth/login`                    | `{ accessToken, tokenType, expiresIn }` (HS256 JWT, valid 8 hours)        |
| GET    | `/pilot/me`                      | `{ name, totalFlightHours, avatarUrl }`                                   |
| GET    | `/flight-hours?from=&to=`        | `{ from, to, days: [{ date, hours }] }`, both ends inclusive              |
| GET    | `/flight-hours/summary?range=1w` | Four limit cards plus the rolling-sum chart (see below)                   |
| GET    | `/documents`                     | `{ asOf, documents: [{ id, label, expiryDate, daysRemaining, status }] }` |
| GET    | `/schedules?year=2026&month=05`  | `{ year, month, legend, schedules }`                                      |

`range` is `1w`, `1m`, `3m`, `6m` or `1y` and defaults to `1w`.

**Summary response**, shortened:

```json
{
  "asOf": "2026-05-15",
  "range": "1w",
  "cards": [
    {
      "period": "weekly",
      "windowDays": 7,
      "hours": 25.2,
      "limit": 40,
      "remainingHours": 14.8,
      "usagePercent": 63
    }
  ],
  "chart": {
    "windowDays": 7,
    "limit": 40,
    "yMax": 45,
    "points": [
      { "date": "2026-05-18", "rollingHours": 42.8, "isOverLimit": true }
    ],
    "peak": { "date": "2026-05-20", "rollingHours": 44.7 },
    "overLimitDays": 4
  }
}
```

The real response has all four cards (daily, weekly, monthly, annual) and 15 chart points, from 7 days before to 7 days after 15 May. Cards always describe 15 May; the range toggle only changes the chart window, limit and Y max.

**Documents:** `status` is `expired` when `daysRemaining <= 0`, `soon` for 1–30 days, otherwise `safe`.

**Errors** always have the same shape:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": ["month must be between 01 and 12"]
}
```

Codes: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `NOT_FOUND`, `INTERNAL_ERROR`. A 500 never leaks a stack trace.

## Notes

- **Today is 15 May 2026.** One constant shared by every service, so results don't depend on the server clock. `mock-documents.json` says 31 May; I followed the brief.
- **Rolling window.** A window ending on day D covers D and the `windowDays - 1` days before it. Missing days, and days before the dataset starts, count as 0. Future dates use the values already in the seed data. This lives in `FlightHoursService.calculateRollingHours()`, and values are never clamped so the chart can show points above the limit.
- **Total flight hours** (`1444.5`) is read from the seed profile as supplied.
- **Duty codes** come straight from the JSON legend (`DTY`, `RLV`, `TRD`, `TRX`, `ULV`), which differs from the codes written in the brief. Each entry's `base_color` is passed through unchanged.
- **Auth.** One hardcoded pilot and a global guard; only login is marked `@Public()`. The guard checks signature, issuer, audience, subject and expiry. Because only login may be public, there is no health endpoint.
- **Avatar** is an inline SVG data URL with the initials `JD`, so there is no image to host.
- **Vitest + SWC** for tests, since NestJS 12's ESM packages don't play well with the default Jest setup.

## Checks

```sh
npm run check          # typecheck, tests, build, smoke test of the compiled server
npm run format:check
```

Tests cover seed validation, window edges, document thresholds, all six endpoints, bad input, token failures, CORS and the error shape.

### Postman

Import `postman/susi-air-pilot-api.postman_collection.json`. It points at the live API and logs in by itself when it has no token. For a local server, set `baseUrl` to `http://localhost:3001`, or from the command line:

```sh
postman collection run postman/susi-air-pilot-api.postman_collection.json --env-var baseUrl=http://localhost:3001
```

## Deploy on Railway or Render

Create a Node web service with `nest` as the root directory.

| Setting      | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Build        | `npm ci --include=dev && npm run build`                  |
| Start        | `npm run start:prod`                                     |
| Environment  | `JWT_SECRET`, `CORS_ORIGINS` (the deployed frontend URL) |
| Health check | Leave unset                                              |

`--include=dev` keeps the Nest CLI and TypeScript available for the build even if the platform sets `NODE_ENV=production`.

After deploying, check login, each protected route, a bad token, all five chart ranges, and CORS from the real frontend.

## With more time

- Real accounts and persistent per-pilot data instead of one hardcoded user and JSON files.
- A single trusted source for the conflicting seed metadata (the document `today` and the duty codes).
- Rate limiting on login, request logging, and a health check under an agreed auth policy.
