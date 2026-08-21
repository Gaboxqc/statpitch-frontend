# StatPitch

Frontend for a football prediction model. It publishes calibrated win / draw /
both-teams-to-score probabilities for the day's fixtures, alongside expected
value and Kelly staking for every market.

The app is read-only: it renders whatever the prediction API returns and does
not place, broker, or facilitate bets.

## Stack

React 19 · Vite · TypeScript · Tailwind 4 · TanStack Query · React Router · Vitest

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`. The one required variable is the API origin:

```
VITE_API_URL=https://api.gabrielmayorga.dev/statpitch
```

### Signing in locally

The session cookie is host-only and `SameSite=Lax`, so the browser sends it
only on same-site requests. That holds in production — the app and the API
share the `gabrielmayorga.dev` registrable domain — but `localhost` is a
different site, and a direct call from the dev server authenticates as nobody.

To work on anything behind a session, route the calls through Vite instead:

```
VITE_API_URL=/api/statpitch
VITE_API_PROXY_TARGET=https://api.gabrielmayorga.dev
```

The proxy strips the cookie's `Domain` so it is reissued for `localhost`, and
because the request is then same-origin, CORS stops applying at all.

## Scripts

| Script                  | What it does                      |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Dev server on port 5173           |
| `npm run build`         | Type-check, then build to `dist/` |
| `npm run typecheck`     | TypeScript only, no emit          |
| `npm test`              | Run the test suite once           |
| `npm run test:watch`    | Watch mode                        |
| `npm run test:coverage` | Coverage report                   |
| `npm run lint`          | ESLint                            |
| `npm run format`        | Prettier write                    |

CI runs format, lint, typecheck, test and build on every pull request.

## Layout

```
src/
  components/
    layout/       Navbar, Footer, ErrorBoundary
    predictions/  Match cards, market breakdown, stats and filter bars
    pricing/      Pricing card
    ui/           Reusable presentational pieces (charts, tiles, disclosures)
  constants/      Copy, model strings, marketing figures
  hooks/          TanStack Query wrappers, document title
  services/       Axios client and API calls
  types/          API response types
  utils/          Pure helpers: formatting, dates, derived view models
```

## Conventions

- **Deploy path.** `base` in `vite.config.ts` is the single source of truth; the
  router derives its `basename` from it, so links stay relative (`/pricing`).
- **Empty vs error.** `/today` and `/today/best` answer 404 when there are no
  fixtures, which the services translate into an empty state. A 404 from
  `/stats` is a genuine error and is surfaced as one, and so is a 5xx from
  `/today/best` — an empty day and a broken backend never share a code path.
- **Error copy comes from the API.** Every 4xx carries a `detail` written in
  the second person. `describeError` prefers it; only a timeout and a rate
  limit are worded here, because neither is something `detail` can say.
- **The CSRF token lives in memory.** Both cookies involved are unreadable to
  the page, so the token is taken from whichever account response last carried
  one. A stale token is refreshed from `/accounts/me` and the request retried
  once, inside the axios interceptor, so callers never see a 403.
- **Units.** The API returns rates as 0–1 fractions. Use `formatFraction` for
  those and `formatPercent` for values already on a 0–100 scale — scaling
  before rounding matters, and there are tests pinning it.
- **Missing values** render as an em dash, never as `null%` or a crash.
- **Icons** are decorative by default; `aria-hidden` is applied once via the
  SVGR config in `vite.config.ts`.

## Disclaimer

For informational purposes only. StatPitch does not facilitate, encourage, or
endorse any form of gambling or wagering. All probability outputs are generated
by statistical models and are not guarantees of future results.
