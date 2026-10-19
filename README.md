# Susi Air Pilot App

Technical test for a mobile pilot app. The NestJS backend is in [`nest/`](nest/README.md); the Nuxt frontend is the next stage.

The API serves one pilot, seeded flight hours, document expiry states, and monthly schedules. Business calculations use **15 May 2026**, as required by the brief. No database is needed.

See the [backend README](nest/README.md) for setup, endpoint contracts, tests, and Railway/Render deployment settings. The JSON files at the repository root are the data as supplied; the API reads its own copies in `nest/src/data`.

The backend is intended to be deployed as its own service with `nest` as the service root. Live deployment and frontend integration are pending.
