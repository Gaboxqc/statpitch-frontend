import { buildMarkets } from './buildMarkets.js'
import { toPercentValue } from './format.js'

/**
 * Derives everything both match cards need from a raw prediction payload.
 * A plain function rather than a hook, so callers can run it after their
 * loading/error guards without breaking the rules of hooks.
 */
export function buildPredictionView(prediction) {
  const markets = buildMarkets(prediction)
  const bestBet = prediction.best_overall_bet
  const bestMarket = markets.find((market) => market.key === bestBet)

  const isHome = prediction.home_win_prob > prediction.away_win_prob
  const winner = {
    isHome,
    name: isHome ? prediction.home_team : prediction.away_team,
    prob: toPercentValue(isHome ? prediction.home_win_prob : prediction.away_win_prob),
  }

  return { markets, bestBet, bestMarket, winner }
}
