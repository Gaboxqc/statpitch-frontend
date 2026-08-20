import { describe, expect, it } from 'vitest'
import { buildCalibration, MIN_BETS, wilson } from './calibration'
import { settledBetFixture } from '../test/fixtures'
import type { SettledBet } from '../types/api'

const bet = (probability: number, won: boolean, id = 0): SettledBet => ({
  ...settledBetFixture,
  id,
  probability,
  won,
})

const many = (count: number, probability: number, wins: number): SettledBet[] =>
  Array.from({ length: count }, (_, index) => bet(probability, index < wins, index))

describe('wilson', () => {
  // The textbook interval collapses to zero width on a bucket that went 4-0,
  // which is exactly the case a reader needs warning about.
  it('keeps a real interval on a bucket that won every bet', () => {
    const { low, high } = wilson(4, 4)
    expect(high).toBe(1)
    expect(low).toBeLessThan(0.75)
  })

  it('never runs past 0 or 1', () => {
    expect(wilson(0, 3).low).toBe(0)
    expect(wilson(3, 3).high).toBe(1)
  })

  it('tightens as the sample grows', () => {
    const small = wilson(5, 10)
    const large = wilson(50, 100)
    expect(large.high - large.low).toBeLessThan(small.high - small.low)
  })

  it('says nothing at all about an empty bucket', () => {
    expect(wilson(0, 0)).toEqual({ low: 0, high: 1 })
  })
})

describe('buildCalibration', () => {
  it('puts each probability in exactly one bucket', () => {
    const { buckets } = buildCalibration([bet(0.2, true, 1), bet(0.4, false, 2), bet(1, true, 3)])

    expect(buckets.map((b) => [b.from, b.to])).toEqual([
      [0.2, 0.4],
      [0.4, 0.6],
      [0.8, 1],
    ])
    expect(buckets.every((b) => b.bets === 1)).toBe(true)
  })

  it('reports predicted against realised for each bucket', () => {
    const { buckets } = buildCalibration(many(10, 0.7, 6))

    expect(buckets).toHaveLength(1)
    expect(buckets[0].predicted).toBeCloseTo(0.7)
    expect(buckets[0].realised).toBeCloseTo(0.6)
  })

  // A bucket nothing landed in is not a bucket that went 0%.
  it('leaves out buckets with no bets rather than drawing them at zero', () => {
    const { buckets } = buildCalibration(many(4, 0.9, 2))
    expect(buckets).toHaveLength(1)
    expect(buckets[0].from).toBe(0.8)
  })

  it('refuses to call a handful of bets a calibration', () => {
    expect(buildCalibration(many(MIN_BETS - 1, 0.5, 10)).readable).toBe(false)
    expect(buildCalibration(many(MIN_BETS, 0.5, 10)).readable).toBe(true)
  })

  it('survives an empty ledger', () => {
    expect(buildCalibration([])).toEqual({ buckets: [], total: 0, readable: false })
  })
})
