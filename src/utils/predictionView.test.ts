import { describe, expect, it } from 'vitest'
import { buildPredictionView, fixtureState } from './predictionView'
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

describe('fixtureState', () => {
  it('calls a fixture with a qualifying selection actionable', () => {
    expect(fixtureState(pickedFixtureFixture)).toBe('actionable')
  })

  // Priced with no qualifying stake and never priced at all are both forecasts:
  // there is nothing to place either way.
  it('calls a fixture with no pick a forecast', () => {
    expect(fixtureState(fixtureFixture)).toBe('forecast')
    expect(fixtureState({ ...fixtureFixture, odds_coverage: false })).toBe('forecast')
  })

  // A played match outranks its own pick — whether the selection landed is the
  // only thing left worth saying.
  it('calls a played fixture settled, pick or no pick', () => {
    expect(fixtureState({ ...pickedFixtureFixture, home_score: 3, away_score: 1 })).toBe('settled')
    expect(fixtureState({ ...fixtureFixture, home_score: 0, away_score: 0 })).toBe('settled')
  })
})
