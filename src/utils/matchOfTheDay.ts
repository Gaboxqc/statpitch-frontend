import { topOutcomeProb } from './filterFixtures'
import { competition } from '../constants/competitions'
import type { Fixture } from '../types/api'

interface Rank {
  /** A competition with an odds market, which is where the API draws its own pick from. */
  priced: boolean
  prob: number
}

function rank(fixture: Fixture): Rank | null {
  const prob = topOutcomeProb(fixture)
  if (prob === null) return null
  return { priced: competition(fixture.competition_id)?.priced === true, prob }
}

const beats = (candidate: Rank, best: Rank): boolean =>
  candidate.priced === best.priced ? candidate.prob > best.prob : candidate.priced

/**
 * The day's strongest call, for the days the API does not choose one for.
 *
 * `/fixtures/today/best` exists and is authoritative — it is fixed by the day's
 * first sync so it cannot move under a reader — but there is no `/tomorrow/best`
 * or `/yesterday/best`, and there never was. So the other two days are decided
 * here, on the list already fetched, by the same rule: the highest single
 * outcome, drawn from a priced competition where one is available.
 *
 * Null when nothing on the day carries a prediction at all — which is every day
 * but today for an anonymous or free reader, since those payloads are teasers.
 * That is a real answer and the card is expected to disappear on it, rather than
 * feature a match it has nothing to say about.
 *
 * Ties keep the earlier fixture, because the list arrives ordered by kick-off
 * and a pick that reshuffled between renders would be no pick at all.
 */
export function pickMatchOfTheDay(fixtures: Fixture[]): Fixture | null {
  let best: Fixture | null = null
  let bestRank: Rank | null = null

  for (const fixture of fixtures) {
    const candidate = rank(fixture)
    if (candidate === null) continue
    if (bestRank === null || beats(candidate, bestRank)) {
      best = fixture
      bestRank = candidate
    }
  }

  return best
}
