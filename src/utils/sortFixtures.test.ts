import { describe, expect, it } from 'vitest'
import { defaultSort, sortFixtures } from './sortFixtures'
import { fixtureFixture } from '../test/fixtures'
import type { Fixture } from '../types/api'

const make = (id: number, over: Partial<Fixture>): Fixture => ({ ...fixtureFixture, id, ...over })

const ids = (fixtures: Fixture[]) => fixtures.map((fixture) => fixture.id)

describe('sortFixtures', () => {
  it('puts the next kick-off first', () => {
    const list = [
      make(1, { commence_time: '2026-08-19T21:00:00' }),
      make(2, { commence_time: '2026-08-19T13:00:00' }),
      make(3, { commence_time: '2026-08-19T17:00:00' }),
    ]

    expect(ids(sortFixtures(list, 'kickoff'))).toEqual([2, 3, 1])
  })

  // A matchday placeholder has no time at all, and guessing one would file it
  // among the confirmed fixtures as though it were the first match of the day.
  it('sends fixtures with no confirmed time to the end', () => {
    const list = [
      make(1, { date_confirmed: false, commence_time: null }),
      make(2, { commence_time: '2026-08-19T21:00:00' }),
      make(3, { commence_time: '2026-08-19T13:00:00' }),
    ]

    expect(ids(sortFixtures(list, 'kickoff'))).toEqual([3, 2, 1])
  })

  it('ranks the biggest stake first', () => {
    const list = [
      make(1, { best_overall_kelly: 0.004 }),
      make(2, { best_overall_kelly: 0.031 }),
      make(3, { best_overall_kelly: null }),
    ]

    expect(ids(sortFixtures(list, 'stake'))).toEqual([2, 1, 3])
  })

  // An unpriced fixture has no edge; treating that as zero would file it above
  // every fixture the book has priced against us.
  it('does not read a missing edge as a zero edge', () => {
    const list = [
      make(1, { best_overall_ev: -0.08 }),
      make(2, { best_overall_ev: null }),
      make(3, { best_overall_ev: 0.062 }),
    ]

    expect(ids(sortFixtures(list, 'edge'))).toEqual([3, 1, 2])
  })

  /**
   * The case the stake ordering exists for: EV alone cannot separate a sound bet
   * from a lottery ticket, since a 5% shot at 25.0 carries +25% EV and a stake
   * far too small to be worth the variance.
   */
  it('ranks a sound bet above a lottery ticket', () => {
    const lottery = make(90, { best_overall_ev: 0.25, best_overall_kelly: 0.002 })
    const sound = make(91, { best_overall_ev: 0.04, best_overall_kelly: 0.06 })

    expect(ids(sortFixtures([lottery, sound], 'stake'))).toEqual([91, 90])
    // The same pair ranks the other way round on edge, which is the point of
    // offering both.
    expect(ids(sortFixtures([sound, lottery], 'edge'))).toEqual([90, 91])
  })

  it('ranks on the strongest outcome, which is never the draw', () => {
    const list = [
      make(1, { home_win_prob: 0.4, draw_prob: 0.5, away_win_prob: 0.1 }),
      make(2, { home_win_prob: 0.72, draw_prob: 0.2, away_win_prob: 0.08 }),
    ]

    expect(ids(sortFixtures(list, 'confidence'))).toEqual([2, 1])
  })

  // Two unpriced fixtures compare equal on stake, so without a tiebreak their
  // order would depend on the sort implementation and could change per render.
  it('breaks ties on kick-off so the order is total', () => {
    const list = [
      make(1, { best_overall_kelly: null, commence_time: '2026-08-19T21:00:00' }),
      make(2, { best_overall_kelly: null, commence_time: '2026-08-19T13:00:00' }),
    ]

    expect(ids(sortFixtures(list, 'stake'))).toEqual([2, 1])
  })

  it('leaves the input array alone', () => {
    const list = [make(1, { commence_time: '2026-08-19T21:00:00' }), make(2, {})]
    sortFixtures(list, 'kickoff')

    expect(ids(list)).toEqual([1, 2])
  })
})

describe('defaultSort', () => {
  it('ranks by stake once the list is filtered to value bets', () => {
    expect(defaultSort(true)).toBe('stake')
    expect(defaultSort(false)).toBe('kickoff')
  })
})
