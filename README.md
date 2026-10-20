# Susi Air Pilot App

A full-stack implementation of the Susi Air Fullstack Developer technical test. This focused pilot dashboard brings flight-hour limits, document expiry, and monthly duties into one mobile-first interface. It uses the supplied data and a fixed business date so reviewers see the same results every time.

**[Open the live app](https://pilot-app-susi-air-test.vercel.app)** · **[Run API requests](nest/postman/susi-air-pilot-api.postman_collection.json)** · [Frontend details](nuxt/README.md) · [Backend details](nest/README.md)

> **Demo account:** `johndoe` / `susiairtest`
>
> **Reference date:** 15 May 2026, as required by the brief.

## What to review

1. **Sign in** with the demo account. Authentication errors and expired sessions have distinct feedback.
2. **Open Home** to compare daily, weekly, monthly, and annual hours against their limits. Change the chart range to see server-calculated rolling totals, including values above a limit. Document badges reflect expiry relative to the reference date.
3. **Open Schedule** to browse months, inspect duty colors and completion counts, and follow a date to its placeholder detail page.

The Logbook and More tabs are present to complete the requested navigation; Logbook and the date detail are intentionally placeholders within the test scope.

## Project at a glance

| Area                                                                      | Implementation                  | Responsibility                                                                   |
| ------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| [Frontend](nuxt/README.md)                                                | Nuxt 3, Vue 3, Pinia, SCSS      | Responsive screens, session handling, chart and calendar presentation            |
| [Backend](nest/README.md)                                                 | NestJS 12, TypeScript, JWT      | Authentication, validation, flight-hour calculations, document status, schedules |
| [Data](nest/src/data)                                                     | Three validated JSON seed files | In-memory pilot, flight, document, and schedule data; no database                |
| [API collection](nest/postman/susi-air-pilot-api.postman_collection.json) | Postman                         | Runnable requests against the live API or a local server                         |

The frontend fetches domain data from the API. The API owns rolling-hour calculations, chart bounds, and document status, so those rules have one implementation and can be tested independently of the UI. Seed files are validated when the backend starts and are served from memory.

## Run locally

Use **Node.js 22.22.3 or later within the 22.x line** and npm. Start each app in its own terminal. The commands below use PowerShell; on macOS or Linux, use `cp` in place of `Copy-Item`.

**Terminal 1 — API**

```powershell
cd nest
npm ci
Copy-Item .env.example .env
```

Set `JWT_SECRET` in `nest/.env` to a random value of at least 32 characters. You can generate one with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm run start:dev
```

The API listens on `http://localhost:3001`.

**Terminal 2 — frontend**

```powershell
cd nuxt
npm ci
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:3000` and sign in with the demo account.

| Variable               | Where       | Purpose                                                                       |
| ---------------------- | ----------- | ----------------------------------------------------------------------------- |
| `JWT_SECRET`           | `nest/.env` | **Required.** Signs access tokens; minimum 32 characters.                     |
| `PORT`                 | `nest/.env` | API port; defaults to `3001`.                                                 |
| `CORS_ORIGINS`         | `nest/.env` | Comma-separated, exact frontend origins; defaults to `http://localhost:3000`. |
| `NUXT_PUBLIC_API_BASE` | `nuxt/.env` | API base URL; defaults to `http://localhost:3001`.                            |

The example environment files contain the local defaults. For deployment settings, see the [frontend](nuxt/README.md#deploy-on-vercel) and [backend](nest/README.md#deploy-on-railway-or-render) guides.

## API surface

`POST /auth/login` is public. Every other route requires `Authorization: Bearer <accessToken>`. Dates use `YYYY-MM-DD`; there is no `/api` prefix.

| Method | Route                                         | Purpose                                                                                          |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `POST` | `/auth/login`                                 | Exchange the demo credentials for an eight-hour JWT.                                             |
| `GET`  | `/pilot/me`                                   | Pilot profile and total flight hours.                                                            |
| `GET`  | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Daily hours within an inclusive date range.                                                      |
| `GET`  | `/flight-hours/summary?range=1w`              | Four limit cards and a 15-point rolling-hours chart; range also supports `1m`, `3m`, `6m`, `1y`. |
| `GET`  | `/documents`                                  | Documents, days remaining, and expiry status.                                                    |
| `GET`  | `/schedules?year=2026&month=05`               | Monthly duties and their legend.                                                                 |

The [backend README](nest/README.md#endpoints) documents response shapes, calculation rules, and errors. The [Postman collection](nest/postman/susi-air-pilot-api.postman_collection.json) signs in automatically and can target the local API by setting `baseUrl` to `http://localhost:3001`.

## Decisions and trade-offs

- **Deterministic review:** Both apps use 15 May 2026 for business logic. The supplied document metadata names a different date; the brief takes precedence. Token expiry still uses real elapsed time.
- **Server-owned calculations:** Each rolling window includes its end date. Missing days count as zero, and future chart points use the supplied seed values. The frontend renders values above a limit without clipping the data.
- **Small, explicit backend:** NestJS modules separate auth, data, flight hours, documents, pilot, and schedules. A global JWT guard protects the five non-login routes; request validation and a shared exception filter keep errors consistent.
- **Scope boundaries:** The demo has one hardcoded account, immutable JSON data, and no database. Logbook and date detail remain placeholders. These choices match the exercise scope; they are not a production pilot-record workflow.
- **Session trade-off:** The frontend stores its eight-hour token in `localStorage` and clears it on expiry or a `401`. A production system would need a reviewed account model and session strategy.

## Verification

Run the checks from each package directory:

```powershell
cd nest
npm run check
npm run format:check
```

`npm run check` runs backend type checking, Vitest tests, a build, and a smoke test of the compiled server.

```powershell
cd nuxt
npm run typecheck
npm test
npm run build
```

The backend tests cover seed validation, calculation boundaries, document thresholds, routes, auth, CORS, and error responses. The frontend tests cover calendar, limit, chart, and formatting helpers. These commands verify the local build; the live app should also be reviewed in a browser at mobile and desktop widths.

## If this moved beyond the test

The first priorities would be per-pilot accounts and persistent records, then browser tests for the sign-in → Home → Schedule journey. I would also resolve the conflicting metadata in the supplied seed files before treating it as operational data. The package READMEs list additional frontend and backend improvements.
