import { topOutcomeProb } from './filterFixtures'
import type { Fixture } from '../types/api'

export const SORTS = ['kickoff', 'stake', 'edge', 'confidence'] as const
export type SortKey = (typeof SORTS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  kickoff: 'Kick-off',
  stake: 'Stake',
  edge: 'Edge',
  confidence: 'Confidence',
}

export const isSort = (value: string | null): value is SortKey =>
  value !== null && (SORTS as readonly string[]).includes(value)

/**
 * Ranking on stake rather than edge is deliberate, and it is why `stake` is the
 * default the moment the list is filtered to value bets: EV alone cannot
 * separate a sound bet from a lottery ticket, since a 5% shot at 25.0 carries
 * +25% EV and a stake far too small to be worth the variance. Edge is still
 * offered, because it answers a different question — where is the book most
 * wrong — and that is worth being able to ask.
 */
export const defaultSort = (valueBetsOnly: boolean): SortKey =>
  valueBetsOnly ? 'stake' : 'kickoff'

/** Kick-off as a sortable instant. Unconfirmed fixtures have no time to sort on. */
function kickoffAt(fixture: Fixture): number | null {
  if (!fixture.date_confirmed || !fixture.commence_time) return null
  const parsed = Date.parse(`${fixture.commence_time}Z`)
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * Every comparison here can be missing on a perfectly valid fixture — an
 * unpriced market has no edge, a matchday placeholder has no kick-off — and a
 * missing value is not a small one. Nulls sort to the end of every order rather
 * than being coerced to zero, which would file an unpriced fixture among the
 * negative edges and a date-TBC fixture at the top of the day.
 */
function compare(a: number | null, b: number | null, direction: 'asc' | 'desc'): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return direction === 'asc' ? a - b : b - a
}

const KEYS: Record<SortKey, (fixture: Fixture) => number | null> = {
  kickoff: kickoffAt,
  stake: (fixture) => fixture.best_overall_kelly,
  edge: (fixture) => fixture.best_overall_ev,
  confidence: topOutcomeProb,
}

/**
 * The list had no order at all unless the value-bet filter was on, which meant
 * the default view — the one everybody lands on — was whatever order the API
 * happened to return.
 */
export function sortFixtures(fixtures: Fixture[], sort: SortKey): Fixture[] {
  const read = KEYS[sort]
  const direction = sort === 'kickoff' ? 'asc' : 'desc'

  // Ties are broken by kick-off so the order is total: two fixtures with no
  // price would otherwise swap places between renders.
  return [...fixtures].sort(
    (a, b) =>
      compare(read(a), read(b), direction) || compare(kickoffAt(a), kickoffAt(b), 'asc') || 0,
  )
}
