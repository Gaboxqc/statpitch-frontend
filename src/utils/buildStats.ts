import { formatCount, formatFraction } from './format'
import type { DayKey, Stats } from '../types/api'

/** The view a stat describes. Selecting the stat is how you get to it. */
export interface StatFilter {
  day?: DayKey
  confidence?: number | null
  valueBetsOnly?: boolean
}

export interface StatItemData {
  id: string
  label: string
  value: string
  /** The raw figure, so a caller can tell an empty count from a formatted one. */
  count: number
  color: string
  /** Longer explanation, surfaced as a title so the compact strip stays short. */
  hint: string
  filter: StatFilter
}

/**
 * The two figures nothing else on the page carries.
 *
 * The day counts used to live here too, forty pixels above the day pills that
 * already show them — two controls for the same thing. The 30-day ROI pair used
 * to as well, at 287px of a 823px strip, rendering as an em-dash until a bet
 * settles; it belongs to the track record, which is a page about exactly that.
 * What is left is today's two insight numbers, and they are filters rather than
 * a ticker: a count you cannot act on is decoration.
 */
export function buildStats(stats: Stats | null): StatItemData[] {
  if (!stats) return []

  const threshold = formatFraction(stats.high_confidence_threshold, 0)

  return [
    {
      id: 'highConfidence',
      label: `High confidence (${threshold}+)`,
      value: formatCount(stats.high_confidence_today),
      count: stats.high_confidence_today,
      color: 'text-ink',
      hint: 'Home or away probability at or above the threshold. A likely draw is not a confident match.',
      filter: { day: 'today', confidence: stats.high_confidence_threshold },
    },
    {
      id: 'valueBets',
      label: 'Value bets',
      value: formatCount(stats.value_bets_today),
      count: stats.value_bets_today,
      color: 'text-primary',
      hint: 'Selections clearing the minimum fractional Kelly.',
      filter: { day: 'today', valueBetsOnly: true },
    },
  ]
}
