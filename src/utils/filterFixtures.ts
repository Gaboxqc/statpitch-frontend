import { hasFullDetail, hasProbabilities } from './entitlement'
import type { Basis, DayKey, Fixture, ThreeDayWindow } from '../types/api'

/**
 * The strongest outcome the model backs, excluding the draw. A likely draw is
 * not a confident match, which is the same reasoning the API applies to its own
 * `high_confidence_today` count.
 *
 * Null when the payload carries no prediction at all, which is not the same as
 * a weak one and must not be ranked or filtered as though it were.
 */
export function topOutcomeProb(fixture: Fixture): number | null {
  if (!hasProbabilities(fixture)) return null
  return Math.max(fixture.home_win_prob, fixture.away_win_prob)
}

export interface FilterOptions {
  day: DayKey
  window: ThreeDayWindow | null
  confidence: number | null
  /** Whose selections to keep, or null for every fixture. */
  picks: Basis | null
}

/**
 * What it means for a fixture to carry a selection, per strategy.
 *
 * These are not narrower and wider views of one thing — they are three
 * different strategies over the same fixtures, so a fixture can qualify under
 * one and not another. `rule` reads StatPitch's own priced rows: above zero is
 * a recommendation, and everything else on the card was assessed and declined.
 */
const CARRIES_A_PICK: Record<Basis, (fixture: Fixture) => boolean> = {
  '1x2': (fixture) => hasFullDetail(fixture) && fixture.best_bet !== null,
  overall: (fixture) => hasFullDetail(fixture) && fixture.best_overall_bet !== null,
  rule: (fixture) =>
    hasFullDetail(fixture) && fixture.selections.some((row) => row.stake_fraction > 0),
}

/**
 * Applies the filters the API does not take as parameters. The whole three-day
 * window arrives in one request, so switching day is a local operation rather
 * than another round trip.
 */
export function filterFixtures(fixtures: Fixture[], options: FilterOptions): Fixture[] {
  const { day, window, confidence, picks } = options

  // Without the window there is no way to say which date "today" means, and
  // guessing from the browser clock would ask for a day the cache may not hold.
  const target = window?.[day] ?? null
  let result = target ? fixtures.filter((fixture) => fixture.match_date === target) : fixtures

  // A locked fixture is dropped rather than kept: the filter asks for matches
  // the model is confident about, and there is no honest way to say a withheld
  // prediction clears the bar.
  if (confidence !== null) {
    result = result.filter((fixture) => {
      const top = topOutcomeProb(fixture)
      return top !== null && top >= confidence
    })
  }

  // Ordering is no longer decided here. It used to happen only inside this
  // branch, which left the default view — the one everybody lands on — in
  // whatever order the API returned. See sortFixtures.
  if (picks !== null) {
    result = result.filter(CARRIES_A_PICK[picks])
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
