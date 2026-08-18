import { describe, expect, it } from 'vitest'
import { buildPredictionView } from './predictionView'
import { predictionFixture } from '../test/fixtures'

describe('buildPredictionView', () => {
  it('builds every published market', () => {
    const { markets } = buildPredictionView(predictionFixture)
    expect(markets).toHaveLength(11)
    expect(markets.map((m) => m.key)).toContain('btts_yes')
  })

  it('resolves the best market from best_overall_bet', () => {
    const { bestMarket, bestBet } = buildPredictionView(predictionFixture)
    expect(bestBet).toBe('btts_yes')
    expect(bestMarket?.market).toBe('Both Teams to Score (Yes)')
  })

  it('leaves bestMarket undefined when no bet is flagged', () => {
    const { bestMarket } = buildPredictionView({
      ...predictionFixture,
      best_overall_bet: null,
    })
    expect(bestMarket).toBeUndefined()
  })

  it('names the winner and scales the probability to 0-100', () => {
    const { winner } = buildPredictionView(predictionFixture)
    expect(winner).toEqual({ isHome: true, name: 'Brazil', prob: 48.21 })
  })

  it('picks the away side when it leads', () => {
    const { winner } = buildPredictionView({
      ...predictionFixture,
      home_win_prob: 0.2,
      away_win_prob: 0.55,
    })
    expect(winner.isHome).toBe(false)
    expect(winner.name).toBe('Argentina')
  })
})
