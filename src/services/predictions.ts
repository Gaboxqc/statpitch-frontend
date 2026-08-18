import { api, isNotFound, totalFromHeaders } from './api'
import type {
  DayKey,
  Fixture,
  FixtureQuery,
  LedgerQuery,
  Page,
  SettledBet,
  Stats,
  ThreeDayWindow,
} from '../types/api'

/** Drops undefined entries so an unset filter is absent rather than the string "undefined". */
function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

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

/** Already ordered by Kelly descending, which is the API's deliberate ranking. */
export const getValueBetsToday = (signal?: AbortSignal): Promise<Fixture[]> =>
  api.get<Fixture[]>('/fixtures/today/value-bets', { signal }).then((res) => res.data)

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
