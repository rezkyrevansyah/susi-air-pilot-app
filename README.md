# Susi Air Pilot App

Technical test: a small part of the Susi Air Pilot App, where pilots check their flight hours against duty limits, their document expiry dates and their monthly schedule.

| App                       | Stack                 | Live                                             |
| ------------------------- | --------------------- | ------------------------------------------------ |
| [`nuxt/`](nuxt/README.md) | Nuxt 3, Pinia, SCSS   | https://pilot-app-susi-air-test.vercel.app       |
| [`nest/`](nest/README.md) | NestJS 12, TypeScript | https://susi-pilot-app-production.up.railway.app |

Sign in with `johndoe` / `susiairtest`. Both apps treat **15 May 2026** as today, as the brief requires.

## Run both locally

You need Node 22. In two terminals:

```sh
cd nest
npm ci
cp .env.example .env    # then set JWT_SECRET, see nest/README.md
npm run start:dev       # http://localhost:3001
```

```sh
cd nuxt
npm ci
cp .env.example .env
npm run dev             # http://localhost:3000
```

Each README covers its environment variables, the main decisions and what I would change with more time:

- [Frontend README](nuxt/README.md): screens, state, chart and calendar choices, Vercel deploy.
- [Backend README](nest/README.md): endpoint contract, rolling-sum rules, error shape, Railway/Render deploy.

A Postman collection for the API is in [`nest/postman/`](nest/postman/susi-air-pilot-api.postman_collection.json). It points at the live API and signs in by itself.

## How the work is split

The API does every calculation: rolling sums, chart bounds, document status and the reference date. The frontend only fetches and presents what the API returns, so the rules live in one place and are covered by the backend tests.

The JSON files at the repository root are the data as supplied; the API reads its own copies in `nest/src/data`.
