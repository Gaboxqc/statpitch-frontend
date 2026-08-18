import { describe, expect, it } from 'vitest'
import { buildPredictionView } from './predictionView'
import { fixtureFixture, pickedFixtureFixture } from '../test/fixtures'

describe('buildPredictionView', () => {
  it('builds every published market', () => {
    const { markets } = buildPredictionView(fixtureFixture)
    expect(markets).toHaveLength(11)
    expect(markets.map((m) => m.key)).toContain('btts_yes')
  })

  it('keeps a market whose odds were never quoted, with a null price', () => {
    const { markets } = buildPredictionView(fixtureFixture)
    const overs = markets.find((m) => m.key === 'over_2_5')
    // The model prices every market even when no book did.
    expect(overs?.prob).toBeGreaterThan(0)
    expect(overs?.odds).toBeNull()
    expect(overs?.ev).toBeNull()
  })

  it('resolves the best market from best_overall_bet', () => {
    const { bestMarket, bestBet } = buildPredictionView(pickedFixtureFixture)
    expect(bestBet).toBe('btts_yes')
    expect(bestMarket?.market).toBe('Both Teams to Score (Yes)')
  })

  // A fully priced fixture can still carry no pick: the edge failed the Kelly minimum.
  it('leaves bestMarket undefined when a priced fixture produced no selection', () => {
    const { bestMarket, bestBet } = buildPredictionView(fixtureFixture)
    expect(bestBet).toBeNull()
    expect(bestMarket).toBeUndefined()
  })

  it('names the winner and scales the probability to 0-100', () => {
    const { winner } = buildPredictionView(fixtureFixture)
    expect(winner).toEqual({ isHome: true, name: 'Club Atlético de Madrid', prob: 72.83 })
  })

  it('picks the away side when it leads', () => {
    const { winner } = buildPredictionView({
      ...fixtureFixture,
      home_win_prob: 0.2,
      away_win_prob: 0.55,
    })
    expect(winner.isHome).toBe(false)
    expect(winner.name).toBe('Málaga CF')
  })
})
