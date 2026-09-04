import { api, isNotFound, queryString, totalFromHeaders } from './api'
import type {
  BetsToday,
  CompetitionInfo,
  DayKey,
  Fixture,
  FixtureQuery,
  LedgerQuery,
  Page,
  SettledBet,
  Stats,
  ThreeDayWindow,
} from '../types/api'

/**
 * All twelve, with the names and icons the filter strip renders — and
 * `free_tier` per row, so the cups can read as something to upgrade for rather
 * than as a selection that quietly returns nothing.
 */
export const getCompetitions = (signal?: AbortSignal): Promise<CompetitionInfo[]> =>
  api.get<CompetitionInfo[]>('/competitions', { signal }).then((res) => res.data)

/**
 * The whole three-day window in one call, ordered by date then kickoff.
 * Cheaper than three day-specific requests, and the caller can bucket by
 * `match_date` against the dates from `getWindow`.
 */
export const getFixtures = async (
  query: FixtureQuery = {},
  signal?: AbortSignal,
): Promise<Page<Fixture>> => {
  const res = await api.get<Fixture[]>(`/fixtures${queryString({ ...query })}`, { signal })
  return { items: res.data, total: totalFromHeaders(res.headers, res.data.length) }
}

/** The three dates the API considers live. Never derive these from the browser clock. */
export const getWindow = (signal?: AbortSignal): Promise<ThreeDayWindow> =>
  api.get<ThreeDayWindow>('/fixtures/window', { signal }).then((res) => res.data)

/**
 * One complete day. These routes do not set `X-Total-Count` — they are already
 * the whole day — and an empty day is a 200 with `[]`, not a 404.
 */
export const getFixturesForDay = (day: DayKey, signal?: AbortSignal): Promise<Fixture[]> =>
  api.get<Fixture[]>(`/fixtures/${day}`, { signal }).then((res) => res.data)

/**
 * The highest win probability today — which is not the same as the best bet.
 * This fixture can be unpriced and carry no selection at all.
 */
export const getBestToday = (signal?: AbortSignal): Promise<Fixture | null> =>
  api
    .get<Fixture>('/fixtures/today/best', { signal })
    .then((res) => res.data)
    .catch((error: unknown) => {
      if (isNotFound(error)) return null
      throw error
    })

/**
 * StatPitch's own picks for today, served from its cache rather than proxied.
 * Pro and above — below that the caller gets a 402, which is a state the page
 * renders rather than an error it reports.
 *
 * An empty day is a `200` carrying a `reason`, never a `404`, so nothing here
 * catches a not-found: there is no such thing.
 */
export const getBetsToday = (signal?: AbortSignal): Promise<BetsToday> =>
  api.get<BetsToday>('/bets/today', { signal }).then((res) => res.data)

export const getFixture = (id: number, signal?: AbortSignal): Promise<Fixture | null> =>
  api
    .get<Fixture>(`/fixtures/${id}`, { signal })
    .then((res) => res.data)
    .catch((error: unknown) => {
      if (isNotFound(error)) return null
      throw error
    })

export const getStats = (signal?: AbortSignal): Promise<Stats> =>
  api.get<Stats>('/stats', { signal }).then((res) => res.data)

/** The permanent record. Newest first, and the only paginated collection. */
export const getLedger = async (
  { basis, competition_id, offset = 0, limit = 10 }: LedgerQuery = {},
  signal?: AbortSignal,
): Promise<Page<SettledBet>> => {
  const res = await api.get<SettledBet[]>(
    `/ledger${queryString({ basis, competition_id, offset, limit })}`,
    { signal },
  )
  return { items: res.data, total: totalFromHeaders(res.headers, res.data.length) }
}
