import type { DayKey, Fixture, ThreeDayWindow } from '../types/api'

/**
 * The strongest outcome the model backs, excluding the draw. A likely draw is
 * not a confident match, which is the same reasoning the API applies to its own
 * `high_confidence_today` count.
 */
export function topOutcomeProb(fixture: Fixture): number {
  return Math.max(fixture.home_win_prob, fixture.away_win_prob)
}

export interface FilterOptions {
  day: DayKey
  window: ThreeDayWindow | null
  confidence: number | null
  valueBetsOnly: boolean
}

/**
 * Applies the filters the API does not take as parameters. The whole three-day
 * window arrives in one request, so switching day is a local operation rather
 * than another round trip.
 */
export function filterFixtures(fixtures: Fixture[], options: FilterOptions): Fixture[] {
  const { day, window, confidence, valueBetsOnly } = options

  // Without the window there is no way to say which date "today" means, and
  // guessing from the browser clock would ask for a day the cache may not hold.
  const target = window?.[day] ?? null
  let result = target ? fixtures.filter((fixture) => fixture.match_date === target) : fixtures

  if (confidence !== null) {
    result = result.filter((fixture) => topOutcomeProb(fixture) >= confidence)
  }

  if (valueBetsOnly) {
    result = result.filter((fixture) => fixture.best_overall_bet !== null)
    // Ranking on Kelly rather than EV is deliberate: EV alone cannot separate a
    // sound bet from a lottery ticket, since a 5% shot at 25.0 carries +25% EV
    // and a stake far too small to be worth the variance.
    result = [...result].sort((a, b) => (b.best_overall_kelly ?? 0) - (a.best_overall_kelly ?? 0))
  }

  return result
}

/** How many fixtures each day holds, for the tab labels. */
export function countByDay(
  fixtures: Fixture[],
  window: ThreeDayWindow | null,
): Record<DayKey, number> {
  const count = (day: DayKey) =>
    window ? fixtures.filter((fixture) => fixture.match_date === window[day]).length : 0

  return { yesterday: count('yesterday'), today: count('today'), tomorrow: count('tomorrow') }
}
