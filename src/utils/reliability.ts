import { eloSource } from './humanise'
import { hasFullDetail } from './entitlement'
import type { Fixture } from '../types/api'

export type ReliabilityLevel = 'measured' | 'partial' | 'fallback'

export interface Reliability {
  level: ReliabilityLevel
  label: string
  /** Why the prediction is as strong or as weak as it is, in one sentence. */
  hint: string
}

/**
 * How much this particular prediction is worth, which is not the same question
 * as how one-sided the match is. The card used to answer the second question
 * under the heading "AI confidence" while the answer to the first — a prior
 * standing in for a missing Elo, or the weaker model having produced the
 * numbers at all — sat in 11px grey behind a disclosure.
 *
 * The weakest link decides: a fixture is only as well founded as its worst
 * input, so a fallback model outranks everything and an unrated side outranks a
 * clean run.
 *
 * Null when the payload cannot answer. Which model ran is published on every
 * shape, but the Elo evidence behind it is not, and silence is the honest
 * result there — a teaser is not a clean bill of health.
 */
export function reliability(fixture: Fixture): Reliability | null {
  if (fixture.prediction_source === 'elo-poisson') {
    return {
      level: 'fallback',
      label: 'Fallback model',
      hint: 'This fixture missed the last precompute run, so the numbers come from the measurably weaker Elo-Poisson estimate rather than the fitted goal model.',
    }
  }

  if (!hasFullDetail(fixture)) return null

  const tiers = [fixture.home_elo_source, fixture.away_elo_source]
    .map((source) => eloSource(source)?.tier ?? 4)
    .filter((tier) => tier > 1)

  if (!fixture.fully_rated || tiers.length > 0) {
    return {
      level: 'partial',
      label: 'Prior rating',
      hint: 'At least one club had no measured Elo and fell back to a prior. The prediction is still well formed, but it is a weaker claim than a fully rated fixture.',
    }
  }

  return {
    level: 'measured',
    label: 'Fully rated',
    hint: 'Both clubs carry a measured Elo rating and the fitted goal model produced the prediction.',
  }
}
