import { describe, expect, it } from 'vitest'
import { countByDay, filterFixtures, topOutcomeProb } from './filterFixtures'
import { fixtureFixture, pickedFixtureFixture, teaserFixtureFixture } from '../test/fixtures'
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

describe('filters against a withheld prediction', () => {
  // Keeping it would be a claim about a number nobody has: the reader asked
  // for matches the model is confident about, and this one says nothing.
  it('drops a locked fixture from a confidence filter', () => {
    const result = filterFixtures([teaserFixtureFixture, fixtureFixture], {
      day: 'today',
      window: null,
      confidence: 0.6,
      valueBetsOnly: false,
    })

    expect(result).toEqual([fixtureFixture])
  })

  it('drops a locked fixture from the value-bet filter', () => {
    const result = filterFixtures([teaserFixtureFixture, pickedFixtureFixture], {
      day: 'today',
      window: null,
      confidence: null,
      valueBetsOnly: true,
    })

    expect(result).toEqual([pickedFixtureFixture])
  })

  // Without a filter asking about predictions, a locked fixture is an ordinary
  // fixture — it still has teams, a kick-off and a result.
  it('keeps it when nothing asked about the prediction', () => {
    const result = filterFixtures([teaserFixtureFixture], {
      day: 'today',
      window: null,
      confidence: null,
      valueBetsOnly: false,
    })

    expect(result).toHaveLength(1)
  })
})

describe('topOutcomeProb', () => {
  it('is null rather than zero when the prediction is withheld', () => {
    expect(topOutcomeProb(teaserFixtureFixture)).toBeNull()
    expect(topOutcomeProb(fixtureFixture)).toBeCloseTo(0.7282, 3)
  })
})
