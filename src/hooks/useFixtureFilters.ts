import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { defaultSort, isSort } from '../utils/sortFixtures'
import type { SortKey } from '../utils/sortFixtures'
import type { DayKey } from '../types/api'

export const DAYS: DayKey[] = ['yesterday', 'today', 'tomorrow']

/** Client-side confidence tiers. The API only exposes its own single threshold. */
export const CONFIDENCE_TIERS = [0.8, 0.7, 0.6] as const

export interface FixtureFilters {
  day: DayKey
  /** A competition_id, or null for all of them. */
  competitionId: string | null
  /** A 0–1 probability floor, or null for no floor. */
  confidence: number | null
  valueBetsOnly: boolean
  /** Always resolved: absent from the URL means the default for this view. */
  sort: SortKey
}

const isDay = (value: string | null): value is DayKey =>
  value !== null && (DAYS as string[]).includes(value)

/**
 * Filters live in the URL rather than component state, so a filtered view can
 * be linked and survives a reload. Only the two the API understands are sent to
 * it; day and confidence are applied client-side against a single window fetch.
 */
export function useFixtureFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<FixtureFilters>(() => {
    const rawConfidence = Number(searchParams.get('confidence'))
    const rawSort = searchParams.get('sort')
    const valueBetsOnly = searchParams.get('value') === '1'
    return {
      day: isDay(searchParams.get('day')) ? (searchParams.get('day') as DayKey) : 'today',
      competitionId: searchParams.get('competition'),
      confidence: Number.isFinite(rawConfidence) && rawConfidence > 0 ? rawConfidence : null,
      valueBetsOnly,
      // Filtering to value bets changes what a sensible order is, so the
      // default follows the filter until the reader picks one for themselves.
      sort: isSort(rawSort) ? rawSort : defaultSort(valueBetsOnly),
    }
  }, [searchParams])

  const setFilters = useCallback(
    (next: Partial<FixtureFilters>) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          const merged = { ...filters, ...next }

          // Defaults stay out of the URL so the common case has a clean address.
          if (merged.day === 'today') params.delete('day')
          else params.set('day', merged.day)

          if (merged.competitionId) params.set('competition', merged.competitionId)
          else params.delete('competition')

          if (merged.confidence) params.set('confidence', String(merged.confidence))
          else params.delete('confidence')

          if (merged.valueBetsOnly) params.set('value', '1')
          else params.delete('value')

          // Only an explicit choice is worth an address, and only the caller
          // can say it was one — `filters.sort` is always resolved, so writing
          // it back would freeze the derived default and leave a value-bet list
          // ordered by kick-off because that was the default before the toggle.
          if (next.sort !== undefined) {
            if (next.sort === defaultSort(merged.valueBetsOnly)) params.delete('sort')
            else params.set('sort', next.sort)
          }

          return params
        },
        { replace: true },
      )
    },
    [filters, setSearchParams],
  )

  return { filters, setFilters }
}
