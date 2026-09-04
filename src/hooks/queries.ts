import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getBestToday,
  getBetsToday,
  getCompetitions,
  getFixture,
  getFixtures,
  getLedger,
  getStats,
  getWindow,
} from '../services/predictions'
import { COMPETITIONS } from '../constants/competitions'
import { pickMatchOfTheDay } from '../utils/matchOfTheDay'
import type {
  BetsToday,
  CompetitionInfo,
  DayKey,
  Fixture,
  FixtureQuery,
  LedgerQuery,
  SettledBet,
} from '../types/api'

const EMPTY_FIXTURES: Fixture[] = []
const EMPTY_COMPETITIONS: CompetitionInfo[] = []
const EMPTY_LEDGER: SettledBet[] = []

/**
 * The whole window in one request. Callers filter by day client-side against
 * `useWindow`, so switching day tabs costs no extra round trip.
 */
export function useFixtures(query: FixtureQuery = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'fixtures',
      query.day ?? null,
      query.competition_id ?? null,
      query.value_bets_only ?? false,
    ],
    queryFn: ({ signal }) => getFixtures(query, signal),
  })

  return {
    fixtures: data?.items ?? EMPTY_FIXTURES,
    total: data?.total ?? 0,
    loading: isLoading,
    error,
  }
}

/** The competition list turns over once a season, so it is held for the session. */
export function useCompetitions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['competitions'],
    queryFn: ({ signal }) => getCompetitions(signal),
    staleTime: Infinity,
  })

  return { competitions: data ?? EMPTY_COMPETITIONS, loading: isLoading, error }
}

export interface CompetitionScope {
  /** How many competitions are served, priced and stakeable, in that order. */
  counts: { total: number; priced: number; stakeable: number }
  /** Whether a free account sees this competition at all. */
  isFree: (id: string) => boolean
  /** Whether a market exists to quote it against. */
  isPriced: (id: string) => boolean
  /** Whether the selection rule was measured to earn there. */
  isStakeable: (id: string) => boolean
  /** The filter-strip label, falling back to the raw id rather than to nothing. */
  shortName: (id: string) => string
}

/**
 * The three flags, for any competition id, from the API where it has answered
 * and the local table until then.
 *
 * An id neither knows is read as **no claim either way**: priced and stakeable
 * both come back true, so a league added upstream renders the way it always did
 * rather than being told it is outside a scope nobody has measured it against.
 * `isFree` is the exception and fails closed, because it gates rather than
 * describes.
 */
export function useCompetitionScope(): CompetitionScope {
  const { competitions } = useCompetitions()

  return useMemo(() => {
    const rows =
      competitions.length > 0
        ? competitions.map((entry) => ({
            id: entry.competition_id,
            short: entry.short_name,
            free: entry.free_tier,
            priced: entry.priced,
            stakeable: entry.stakeable,
          }))
        : COMPETITIONS.map((entry) => ({
            id: entry.id,
            short: entry.short,
            free: entry.free,
            priced: entry.priced,
            stakeable: entry.stakeable,
          }))
    const byId = new Map(rows.map((row) => [row.id, row]))

    return {
      counts: {
        total: rows.length,
        priced: rows.filter((row) => row.priced).length,
        stakeable: rows.filter((row) => row.stakeable).length,
      },
      isFree: (id) => byId.get(id)?.free ?? false,
      isPriced: (id) => byId.get(id)?.priced ?? true,
      isStakeable: (id) => byId.get(id)?.stakeable ?? true,
      shortName: (id) => byId.get(id)?.short ?? id,
    }
  }, [competitions])
}

/** The three live dates, straight from the API's own timezone. */
export function useWindow() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['window'],
    queryFn: ({ signal }) => getWindow(signal),
    // The window only turns over at local midnight, so it is worth holding longer.
    staleTime: 30 * 60 * 1000,
  })

  return { window: data ?? null, loading: isLoading, error }
}

/**
 * Highest win probability today. May be unpriced and carry no selection.
 *
 * `enabled` exists because this route only covers today — asking it while the
 * reader is looking at tomorrow would spend a request on an answer about the
 * wrong day.
 */
export function useBestToday(enabled = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bestToday'],
    queryFn: ({ signal }) => getBestToday(signal),
    enabled,
  })

  return { fixture: data ?? null, loading: enabled && isLoading, error }
}

/**
 * The featured match for whichever day the reader is on.
 *
 * Today comes from the API, which fixes its pick at the day's first sync and
 * always returns it unlocked without spending an unlock. The other two days have
 * no such route, so they are derived from the window list already in cache —
 * and that derivation doubles as the fallback for a today route that fails,
 * which is not hypothetical: it currently answers 500.
 *
 * Null fixture is a state, not a failure. The card is expected to disappear.
 */
export function useMatchOfTheDay(day: DayKey) {
  const isToday = day === 'today'
  const best = useBestToday(isToday)
  const { window, loading: windowLoading } = useWindow()
  // No competition filter: the featured match is a fact about the day, not
  // about the filters below it — and unfiltered, this shares the list's cache.
  const { fixtures, loading: listLoading, error: listError } = useFixtures()

  const target = window?.[day] ?? null
  const derived = target
    ? pickMatchOfTheDay(fixtures.filter((fixture) => fixture.match_date === target))
    : null

  const fixture = isToday ? (best.fixture ?? derived) : derived

  // Today is ready the moment the API answers; the window list is only waited
  // on when that answer was missing and the pick has to be derived instead.
  const loading = isToday
    ? best.loading || (best.fixture === null && (listLoading || windowLoading))
    : listLoading || windowLoading

  // Only a failure that left nothing to show is worth reporting: if the day's
  // pick was derived instead, the reader has the thing they came for.
  const error = fixture === null && !loading ? (listError ?? (isToday ? best.error : null)) : null

  return { fixture, loading, error }
}

/**
 * StatPitch's staked picks for today. The 402 below Pro settles as an error, and
 * the page renders the upsell from it rather than treating it as a failure.
 */
export function useBetsToday() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['betsToday'],
    queryFn: ({ signal }) => getBetsToday(signal),
  })

  return { bets: (data ?? null) as BetsToday | null, loading: isLoading, error }
}

export function useFixture(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['fixture', id],
    queryFn: ({ signal }) => getFixture(id as number, signal),
    enabled: id !== null,
  })

  return { fixture: data ?? null, loading: isLoading, error }
}

export function useStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => getStats(signal),
  })

  return { stats: data ?? null, loading: isLoading, error }
}

export function useLedger({ basis, competition_id, offset = 0, limit = 10 }: LedgerQuery = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ledger', basis ?? null, competition_id ?? null, offset, limit],
    queryFn: ({ signal }) => getLedger({ basis, competition_id, offset, limit }, signal),
  })

  return {
    bets: data?.items ?? EMPTY_LEDGER,
    total: data?.total ?? 0,
    loading: isLoading,
    error,
  }
}

export type { DayKey }
