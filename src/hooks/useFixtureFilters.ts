import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
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
    return {
      day: isDay(searchParams.get('day')) ? (searchParams.get('day') as DayKey) : 'today',
      competitionId: searchParams.get('competition'),
      confidence: Number.isFinite(rawConfidence) && rawConfidence > 0 ? rawConfidence : null,
      valueBetsOnly: searchParams.get('value') === '1',
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

          return params
        },
        { replace: true },
      )
    },
    [filters, setSearchParams],
  )

  return { filters, setFilters }
}
