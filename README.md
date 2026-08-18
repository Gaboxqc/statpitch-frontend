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

Create a `.env` with the API origin:

```
VITE_API_URL=https://api.example.com/statpitch/predictions
```

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
  `/stats` is a genuine error and is surfaced as one.
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
