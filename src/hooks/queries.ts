import { useQuery } from '@tanstack/react-query'
import {
  getBestToday,
  getFixture,
  getFixtures,
  getLedger,
  getStats,
  getValueBetsToday,
  getWindow,
} from '../services/predictions'
import type { DayKey, Fixture, FixtureQuery, LedgerQuery, SettledBet } from '../types/api'

const EMPTY_FIXTURES: Fixture[] = []
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

/** Highest win probability today. May be unpriced and carry no selection. */
export function useBestToday() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bestToday'],
    queryFn: ({ signal }) => getBestToday(signal),
  })

  return { fixture: data ?? null, loading: isLoading, error }
}

/** Already ordered by Kelly descending. */
export function useValueBetsToday() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['valueBetsToday'],
    queryFn: ({ signal }) => getValueBetsToday(signal),
  })

  return { fixtures: data ?? EMPTY_FIXTURES, loading: isLoading, error }
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
