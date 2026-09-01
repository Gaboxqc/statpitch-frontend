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

const base = { day: 'today' as const, window: WINDOW, confidence: null, picks: null }

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
    expect(filterFixtures(fixtures, { ...base, picks: 'overall' })).toHaveLength(1)
  })

  /**
   * Three strategies over the same fixtures, not one filter at three widths. A
   * fixture can carry StatPitch's pick and none of ours, so each basis has to
   * select on its own field rather than on a shared "has a bet" flag.
   */
  it('selects on each strategy independently', () => {
    const ours = {
      ...pickedFixtureFixture,
      id: 1,
      match_date: '2026-08-18',
      selections: fixtureFixture.selections.map((row) => ({ ...row, stake_fraction: 0 })),
    }
    const theirs = {
      ...fixtureFixture,
      id: 2,
      match_date: '2026-08-18',
      best_bet: null,
      best_overall_bet: null,
    }
    const fixtures = [ours, theirs]

    expect(filterFixtures(fixtures, { ...base, picks: 'overall' }).map((f) => f.id)).toEqual([1])
    expect(filterFixtures(fixtures, { ...base, picks: '1x2' }).map((f) => f.id)).toEqual([1])
    // `theirs` carries a staked selection and neither of our picks.
    expect(filterFixtures(fixtures, { ...base, picks: 'rule' }).map((f) => f.id)).toEqual([2])
  })

  /**
   * The backend states this outright: only the 1X2 family carries a price, so
   * these two strategies select the same fixture every time and will until
   * totals ship upstream. Worth pinning — if the predicates ever diverge, the
   * track record starts inviting a comparison there is no basis for.
   */
  it('has 1x2 and overall selecting alike while only 1X2 is priced', () => {
    const fixtures = [
      { ...pickedFixtureFixture, id: 1, match_date: '2026-08-18' },
      { ...fixtureFixture, id: 2, match_date: '2026-08-18' },
    ]

    const ourBest = filterFixtures(fixtures, { ...base, picks: 'overall' }).map((f) => f.id)
    const our1x2 = filterFixtures(fixtures, { ...base, picks: '1x2' }).map((f) => f.id)

    expect(ourBest).toEqual(our1x2)
  })

  // Everything in `selections[]` was priced and graded; only a stake above zero
  // is a recommendation.
  it('ignores a StatPitch row that was assessed and refused', () => {
    const refused = {
      ...fixtureFixture,
      match_date: '2026-08-18',
      selections: fixtureFixture.selections.map((row) => ({ ...row, stake_fraction: 0 })),
    }

    expect(filterFixtures([refused], { ...base, picks: 'rule' })).toHaveLength(0)
  })

  it('does not mutate the array it was given', () => {
    const fixtures = [
      { ...pickedFixtureFixture, id: 1, match_date: '2026-08-18', best_overall_kelly: 0.01 },
      { ...pickedFixtureFixture, id: 2, match_date: '2026-08-18', best_overall_kelly: 0.09 },
    ]
    filterFixtures(fixtures, { ...base, picks: 'overall' })
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
      picks: null,
    })

    expect(result).toEqual([fixtureFixture])
  })

  it('drops a locked fixture from the value-bet filter', () => {
    const result = filterFixtures([teaserFixtureFixture, pickedFixtureFixture], {
      day: 'today',
      window: null,
      confidence: null,
      picks: 'overall',
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
      picks: null,
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
