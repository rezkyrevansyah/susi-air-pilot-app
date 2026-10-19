# Pilot App (frontend)

Nuxt 3, Pinia and SCSS. A mobile-first web app for pilots: sign in, check flight hours against duty limits, see document expiry, and browse the monthly schedule. Every value comes from the [Pilot API](../nest/README.md); the frontend keeps no mock data.

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

## Decisions and why

- **Client-side rendering (`ssr: false`).** Every screen sits behind a login and the token lives in the browser, so server rendering would add a cookie hand-off and hydration concerns without showing anything earlier. The build is a static bundle.
- **Token in `localStorage` with its expiry.** A global route middleware sends signed-out users to `/sign-in`. Any 401 from the API clears the session and shows "Your session has ended".
- **One `$api` client.** A `$fetch.create` plugin adds the base URL and Bearer token in one place. Stores call it; pages never build URLs.
- **Three small Pinia stores.** `session` (token and pilot profile, which the header and desktop rail both need), `home` (summary and documents) and `schedule` (the last response per month, so a month seen before appears instantly; every month change still calls `/schedules`, as the brief asks).
- **The server does the maths.** Rolling sums, chart bounds, document status and the reference date all come from the API. The frontend only turns them into colours, labels and the chart.
- **Chart in plain SVG.** The chart has 15 points, a limit line, a "Today" marker and a tooltip, which is little enough to draw directly and match the design exactly. It redraws at the card's real width instead of scaling, so text stays sharp. Values above the chart maximum are still drawn. Tap a point, hover it, or use the arrow keys to read a day.
- **Fixed business date.** Schedule logic uses `2026-05-15` as today, the same as the API. Only the eight-hour token expiry uses the device clock; even the greeting is fixed, so every reviewer sees the same screen.
- **Dates in UTC.** API dates are calendar days, so they are parsed and formatted in UTC and a pilot in another timezone sees the same days.
- **Colours from the API.** Calendar cells use each entry's `base_color`, and the text on top switches between navy and white by contrast. Legend codes and labels come from the API too.
- **Limit card states.** Over 100% is red, from 90% amber, otherwise green. This matches the design states; the API doesn't define a "near" threshold.
- **Lucide icons and no UI library.** Design tokens from the design file live in `assets/scss/_tokens.scss` and are available in every component.

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
