import { describe, expect, it } from 'vitest'
import { countByDay, filterFixtures, topOutcomeProb } from './filterFixtures'
import { fixtureFixture, pickedFixtureFixture } from '../test/fixtures'
import type { Fixture, ThreeDayWindow } from '../types/api'

const WINDOW: ThreeDayWindow = {
  yesterday: '2026-08-17',
  today: '2026-08-18',
  tomorrow: '2026-08-19',
}

const on = (date: string, overrides: Partial<Fixture> = {}): Fixture => ({
  ...fixtureFixture,
  match_date: date,
  ...overrides,
})

const base = { day: 'today' as const, window: WINDOW, confidence: null, valueBetsOnly: false }

describe('topOutcomeProb', () => {
  // The draw is excluded on purpose: a likely draw is not a confident match.
  it('ignores the draw', () => {
    expect(topOutcomeProb({ ...fixtureFixture, draw_prob: 0.99 })).toBeCloseTo(0.7283, 4)
  })
})

describe('filterFixtures', () => {
  it('buckets by the window rather than the browser clock', () => {
    const fixtures = [on('2026-08-17'), on('2026-08-18'), on('2026-08-19')]

    expect(filterFixtures(fixtures, base)).toHaveLength(1)
    expect(filterFixtures(fixtures, { ...base, day: 'yesterday' })[0].match_date).toBe('2026-08-17')
    expect(filterFixtures(fixtures, { ...base, day: 'tomorrow' })[0].match_date).toBe('2026-08-19')
  })

  // Without the window there is no way to know which date "today" means, and
  // guessing would ask for a day the cache may not hold.
  it('does not invent a day when the window is missing', () => {
    const fixtures = [on('2026-08-17'), on('2026-08-18')]
    expect(filterFixtures(fixtures, { ...base, window: null })).toHaveLength(2)
  })

  it('filters on the stronger of home and away', () => {
    const fixtures = [
      on('2026-08-18', { home_win_prob: 0.75, away_win_prob: 0.1 }),
      on('2026-08-18', { home_win_prob: 0.4, away_win_prob: 0.35 }),
    ]
    expect(filterFixtures(fixtures, { ...base, confidence: 0.7 })).toHaveLength(1)
  })

  it('keeps only fixtures carrying a selection', () => {
    const fixtures = [on('2026-08-18'), { ...pickedFixtureFixture, match_date: '2026-08-18' }]
    expect(filterFixtures(fixtures, { ...base, valueBetsOnly: true })).toHaveLength(1)
  })

  /**
   * Ranking on Kelly rather than EV is deliberate: a 5% shot at 25.0 carries
   * +25% EV and a stake far too small to be worth the variance.
   */
  it('orders value bets by Kelly, not EV', () => {
    const lottery = {
      ...pickedFixtureFixture,
      id: 90,
      match_date: '2026-08-18',
      best_overall_ev: 0.25,
      best_overall_kelly: 0.002,
    }
    const sound = {
      ...pickedFixtureFixture,
      id: 91,
      match_date: '2026-08-18',
      best_overall_ev: 0.04,
      best_overall_kelly: 0.06,
    }

    const ranked = filterFixtures([lottery, sound], { ...base, valueBetsOnly: true })
    expect(ranked.map((fixture) => fixture.id)).toEqual([91, 90])
  })

  it('does not mutate the array it was given', () => {
    const fixtures = [
      { ...pickedFixtureFixture, id: 1, match_date: '2026-08-18', best_overall_kelly: 0.01 },
      { ...pickedFixtureFixture, id: 2, match_date: '2026-08-18', best_overall_kelly: 0.09 },
    ]
    filterFixtures(fixtures, { ...base, valueBetsOnly: true })
    expect(fixtures.map((fixture) => fixture.id)).toEqual([1, 2])
  })
})

describe('countByDay', () => {
  it('counts each day of the window', () => {
    const fixtures = [on('2026-08-17'), on('2026-08-19'), on('2026-08-19')]
    expect(countByDay(fixtures, WINDOW)).toEqual({ yesterday: 1, today: 0, tomorrow: 2 })
  })

  it('reports zeroes rather than throwing before the window loads', () => {
    expect(countByDay([on('2026-08-18')], null)).toEqual({
      yesterday: 0,
      today: 0,
      tomorrow: 0,
    })
  })
})
