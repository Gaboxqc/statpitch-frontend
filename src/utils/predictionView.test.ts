import { describe, expect, it } from 'vitest'
import { buildPredictionView, certainty, fixtureState } from './predictionView'
import {
  fixtureFixture,
  freeFixtureFixture,
  pickedFixtureFixture,
  settledTeaserFixture,
  teaserFixtureFixture,
} from '../test/fixtures'

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

  // A free payload has a leader but nothing to bet into, and the two are
  // separate questions.
  it('names a winner without a market when only probabilities arrived', () => {
    const { winner, markets, bestBet } = buildPredictionView(freeFixtureFixture)

    expect(winner?.name).toBe('Club Atlético de Madrid')
    expect(markets).toEqual([])
    expect(bestBet).toBeNull()
  })

  it('has nothing to say about a withheld prediction', () => {
    const { winner, markets, bestMarket } = buildPredictionView(teaserFixtureFixture)

    expect(winner).toBeNull()
    expect(markets).toEqual([])
    expect(bestMarket).toBeUndefined()
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

  it('calls a withheld prediction locked', () => {
    expect(fixtureState(teaserFixtureFixture)).toBe('locked')
  })

  // The score is on every shape, so a played fixture has a real result to show
  // whether or not its prediction was ever visible.
  it('lets a result outrank the lock', () => {
    expect(fixtureState(settledTeaserFixture)).toBe('settled')
  })

  // A free payload has a prediction and no market: nothing to place, which is
  // exactly what a forecast is.
  it('calls an unlocked free fixture a forecast', () => {
    expect(fixtureState(freeFixtureFixture)).toBe('forecast')
  })
})

describe('certainty', () => {
  // Both fixtures below lead on 50% and are nothing alike, which is the whole
  // reason the top outcome cannot stand in for confidence.
  it('measures the gap back to second place, not the leader', () => {
    const open = certainty({
      ...fixtureFixture,
      home_win_prob: 0.5,
      draw_prob: 0.45,
      away_win_prob: 0.05,
    })
    const settled = certainty({
      ...fixtureFixture,
      home_win_prob: 0.5,
      draw_prob: 0.25,
      away_win_prob: 0.25,
    })

    expect(open.label).toBe('Close call')
    expect(settled.label).toBe('Leaning')
  })

  it('calls a runaway fixture what it is', () => {
    expect(certainty(fixtureFixture).label).toBe('Clear favourite')
  })

  // The draw can be the thing in second place, and often is.
  it('counts the draw as a contender', () => {
    const result = certainty({
      ...fixtureFixture,
      home_win_prob: 0.45,
      draw_prob: 0.44,
      away_win_prob: 0.11,
    })
    expect(result.label).toBe('Close call')
    expect(result.margin).toBeCloseTo(0.01)
  })
})
