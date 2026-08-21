import { buildMarkets } from './buildMarkets'
import { hasFullDetail, hasProbabilities } from './entitlement'
import { toPercentValue } from './format'
import type { Fixture, FreeFixture, Market, MarketKey } from '../types/api'

/**
 * What a card is for. These are four different things and used to render as
 * near-identical cards separated by a small chip: one has a bet to place, one
 * is a forecast with nothing to act on, one already happened, and one is
 * withheld until the reader pays for it.
 */
export type FixtureState = 'settled' | 'locked' | 'actionable' | 'forecast'

export interface Winner {
  isHome: boolean
  name: string
  prob: number
}

export interface PredictionView {
  /** Empty unless the caller is entitled to the market breakdown. */
  markets: Market[]
  bestBet: MarketKey | null
  bestMarket: Market | undefined
  /** Null when the payload carries no probabilities to pick a leader from. */
  winner: Winner | null
  state: FixtureState
}

/**
 * A result outranks everything: once a match is played, whether the published
 * selection landed is the only thing left worth saying about it — and the score
 * is on every shape, so even a withheld prediction has a real result to show.
 */
export function fixtureState(fixture: Fixture): FixtureState {
  if (fixture.home_score !== null) return 'settled'
  if (!hasProbabilities(fixture)) return 'locked'
  if (!hasFullDetail(fixture)) return 'forecast'
  return fixture.best_overall_bet !== null ? 'actionable' : 'forecast'
}

/** The leader, and by how much. Excludes the draw, which is not a side to back. */
function leader(prediction: FreeFixture): Winner {
  const isHome = prediction.home_win_prob > prediction.away_win_prob
  return {
    isHome,
    name: isHome ? prediction.home_team : prediction.away_team,
    prob: toPercentValue(isHome ? prediction.home_win_prob : prediction.away_win_prob),
  }
}

/**
 * Derives everything both match cards need from a raw prediction payload,
 * whichever shape it arrived in. A plain function rather than a hook, so
 * callers can run it after their loading/error guards without breaking the
 * rules of hooks.
 *
 * A caller that has already narrowed to a payload carrying probabilities gets
 * a non-null `winner` back, so it never has to invent a fallback for a value
 * that cannot be missing.
 */
export function buildPredictionView(prediction: FreeFixture): PredictionView & { winner: Winner }
export function buildPredictionView(prediction: Fixture): PredictionView
export function buildPredictionView(prediction: Fixture): PredictionView {
  const markets = hasFullDetail(prediction) ? buildMarkets(prediction) : []
  const bestBet = hasFullDetail(prediction) ? prediction.best_overall_bet : null
  const bestMarket = markets.find((market) => market.key === bestBet)
  const winner = hasProbabilities(prediction) ? leader(prediction) : null

  return { markets, bestBet, bestMarket, winner, state: fixtureState(prediction) }
}

/**
 * How settled the match is, which is what a reader hears when a card says
 * "confidence" — and it is not the top outcome's probability. A 40/35/25
 * fixture and a 40/10/50 fixture share a leader on 40% and are nothing alike;
 * the gap back to second place is what separates them.
 */
export function certainty(fixture: FreeFixture): { margin: number; label: string } {
  const [first, second] = [fixture.home_win_prob, fixture.draw_prob, fixture.away_win_prob].sort(
    (a, b) => b - a,
  )
  const margin = first - second

  if (margin >= 0.3) return { margin, label: 'Clear favourite' }
  if (margin >= 0.12) return { margin, label: 'Leaning' }
  return { margin, label: 'Close call' }
}
