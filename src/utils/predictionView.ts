import { buildMarkets } from './buildMarkets'
import { toPercentValue } from './format'
import type { Fixture, Market } from '../types/api'

/**
 * What a card is for. These are three different things and used to render as
 * near-identical cards separated by a small chip: one has a bet to place, one
 * is a forecast with nothing to act on, and one already happened.
 */
export type FixtureState = 'settled' | 'actionable' | 'forecast'

export interface PredictionView {
  markets: Market[]
  bestBet: Fixture['best_overall_bet']
  bestMarket: Market | undefined
  winner: { isHome: boolean; name: string; prob: number }
  state: FixtureState
}

/**
 * A result outranks a pick: once a match is played, whether the published
 * selection landed is the only thing left worth saying about it.
 */
export function fixtureState(fixture: Fixture): FixtureState {
  if (fixture.home_score !== null) return 'settled'
  return fixture.best_overall_bet !== null ? 'actionable' : 'forecast'
}

/**
 * Derives everything both match cards need from a raw prediction payload.
 * A plain function rather than a hook, so callers can run it after their
 * loading/error guards without breaking the rules of hooks.
 */
export function buildPredictionView(prediction: Fixture): PredictionView {
  const markets = buildMarkets(prediction)
  const bestBet = prediction.best_overall_bet
  const bestMarket = markets.find((market) => market.key === bestBet)

  const isHome = prediction.home_win_prob > prediction.away_win_prob
  const winner = {
    isHome,
    name: isHome ? prediction.home_team : prediction.away_team,
    prob: toPercentValue(isHome ? prediction.home_win_prob : prediction.away_win_prob),
  }

  return { markets, bestBet, bestMarket, winner, state: fixtureState(prediction) }
}
