# Pilot App (frontend)

Frontend for my Susi Air technical test submission, built with Nuxt 3, Pinia and SCSS. Pilots can sign in, check flight hours against duty limits, see document expiry, and browse the monthly schedule. Every value comes from the [Pilot API](../nest/README.md); there is no mock data in the frontend.

## Run locally

From `nuxt/`, with Node 22 (see `.node-version`):

```sh
npm ci
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm run dev
```

The app runs on `http://localhost:3000`. Sign in with `johndoe` / `susiairtest`.

By default it talks to a local API on `http://localhost:3001` (start it from `nest/`). To use the live API instead, set `NUXT_PUBLIC_API_BASE` in `.env`:

| Variable               | Meaning                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `NUXT_PUBLIC_API_BASE` | Base URL of the Pilot API, no trailing slash. Default `http://localhost:3001`. |

The API only accepts browser requests from origins listed in its `CORS_ORIGINS`. `http://localhost:3000` is allowed on the live API.

## Screens

| Route               | What it shows                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/sign-in`          | Login form. Empty fields, wrong credentials, an unreachable server and an ended session each get their own message.              |
| `/home`             | Greeting and total hours, four limit cards, the rolling-sum chart with the `1w`–`1y` toggle, and documents with expiry badges.   |
| `/schedule`         | Monthly calendar coloured by duty, a tick or the number of duties left per day, the legend, and the next day with duties to log. |
| `/schedule/:date`   | Placeholder for the day detail, with a way back to the same month.                                                               |
| `/logbook`, `/more` | Placeholders for the other tabs. More also has Sign out.                                                                         |

On screens 1024 px and wider the bottom navigation becomes a left rail, the limit cards sit in one row, and the chart and documents share a row.

## Notes

- **Client-side only (`ssr: false`).** Every screen is behind a login and the token lives in the browser, so server rendering wouldn't show anything earlier.
- **Session.** The token is kept in `localStorage` with its expiry. A global route middleware sends signed-out users to `/sign-in`, and any 401 from the API clears the session.
- **API client and stores.** One `$fetch.create` plugin adds the base URL and Bearer token. Three Pinia stores: `session` (token and profile), `home` (summary and documents) and `schedule` (one response per month; every month change still calls `/schedules`).
- **The server does the maths.** Rolling sums, chart bounds and document status come from the API. The chart is plain SVG and still draws values above the limit.
- **Fixed date, UTC.** Schedule logic uses `2026-05-15` as today, like the API, and API dates are parsed in UTC so no timezone shifts a day. Only token expiry uses the device clock.
- **Colours.** Calendar days use each entry's `base_color`, with navy or white text picked by contrast. Limit cards are red over 100%, amber from 90%, green otherwise.
- **Styling.** SCSS design tokens in `assets/scss/_tokens.scss`, Lucide icons, no UI library. The logo and brand colours come from [susiair.com](https://susiair.com) and are used only for this test.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

`npm test` covers the helpers with real logic: the calendar grid and next duty, limit card states, chart ticks and date/number formatting.

## Deploy on Vercel

Import the GitHub repository in Vercel and set:

| Setting          | Value                                         |
| ---------------- | --------------------------------------------- |
| Root Directory   | `nuxt`                                        |
| Framework Preset | Nuxt (detected)                               |
| Environment      | `NUXT_PUBLIC_API_BASE` = the deployed API URL |

Then add the Vercel domain to the API's `CORS_ORIGINS`, for example `http://localhost:3000,https://your-app.vercel.app`.

## With more time

- Component tests for the chart and calendar, and an end-to-end run of the sign-in → home → schedule flow.
- A real day detail page and the Logbook tab.
- A refresh-token flow instead of signing in again after eight hours, and keeping the token out of JavaScript's reach (an httpOnly cookie set by the API).
- Offline support for the schedule, since pilots are often on poor connections at remote bases.
