<p align="center"><img src=".github/susi-air-logo.svg" alt="Susi Air" width="240"></p>

# Susi Air Pilot App

My submission for the Susi Air Full Stack Developer technical test. It's a small mobile-first app where a pilot can sign in, check flight hours against duty limits, see when documents expire, and browse the monthly schedule.

- **Live app:** https://pilot-app-susi-air-test.vercel.app
- **Live API:** https://susi-pilot-app-production.up.railway.app ([Postman collection](nest/postman/susi-air-pilot-api.postman_collection.json)). It runs on a Railway trial that ends around 19 November 2026; after that, the app can still be run locally (see below).
- **Demo login:** `johndoe` / `susiairtest`

## Stack

- **Frontend** ([`nuxt/`](nuxt/README.md)): Nuxt 3, Pinia, SCSS, TypeScript
- **Backend** ([`nest/`](nest/README.md)): NestJS, TypeScript, JWT auth

The backend loads the three JSON files from the brief at startup and keeps them in memory, so there is no database. The frontend gets all of its data from the API.

## Running locally

You need Node 22 (see `.node-version`). Run each app in its own terminal.

```sh
# Terminal 1: API on http://localhost:3001
cd nest
npm ci
cp .env.example .env   # then set JWT_SECRET (32+ characters)
npm run start:dev
```

```sh
# Terminal 2: app on http://localhost:3000
cd nuxt
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item` instead of `cp`. Environment variables, endpoints and deployment are described in the [backend](nest/README.md) and [frontend](nuxt/README.md) READMEs.

## Notes

- **"Today" is 15 May 2026**, as the brief asks, in both apps. `mock-documents.json` says 31 May; I went with the brief.
- **Rolling sums are calculated on the server.** The frontend only draws what `/flight-hours/summary` returns.
- **No root route on the API.** Only `POST /auth/login` is public, so opening the base URL returns the standard 404 JSON error.
- **Duty codes come from the data.** The JSON legend uses `DTY`, `RLV`, `TRD`, `TRX` and `ULV`, which differ slightly from the codes in the brief, so the calendar shows whatever the API returns.
- **Placeholders:** the day detail page, Logbook and More are placeholders, as allowed by the brief.
- **Logo and brand colours** are taken from susiair.com and used only for this test.

## With more time

- Real pilot accounts and persistent per-pilot data instead of one hardcoded user and JSON files.
- A refresh-token flow, with the token in an httpOnly cookie rather than `localStorage`.
- End-to-end tests for sign in → Home → Schedule, plus the real day detail and Logbook screens.
- Rate limiting on login, request logging and a health check.

More detail in the [backend](nest/README.md#with-more-time) and [frontend](nuxt/README.md#with-more-time) READMEs.

## Tests

```sh
cd nest && npm run check   # typecheck, tests, build, smoke test
cd nuxt && npm test && npm run typecheck
```
