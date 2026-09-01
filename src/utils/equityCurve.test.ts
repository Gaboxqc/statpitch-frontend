import { describe, expect, it } from 'vitest'
import { buildEquityCurves } from './equityCurve'
import { settledBetFixture } from '../test/fixtures'
import type { Basis, SettledBet } from '../types/api'

const bet = (id: number, date: string, basis: Basis, pnl: number): SettledBet => ({
  ...settledBetFixture,
  id,
  match_date: date,
  basis,
  pnl_units: pnl,
  won: pnl > 0,
})

describe('buildEquityCurves', () => {
  it('accumulates profit and loss in date order, not payload order', () => {
    const curves = buildEquityCurves([
      bet(2, '2026-07-03', 'overall', -1),
      bet(1, '2026-07-01', 'overall', 0.72),
    ])

    expect(curves.dates).toEqual(['2026-07-01', '2026-07-03'])
    const overall = curves.series.find((s) => s.basis === 'overall')!
    expect(overall.cumulative).toEqual([0.72, -0.28])
  })

  /**
   * The bases bet the same fixtures under different rules, so a combined total
   * would double-count the match. They stay separate lines — and a strategy that
   * has never settled a bet still gets a line, flat at zero, rather than
   * disappearing as though it did not exist.
   */
  it('keeps the strategies apart', () => {
    const curves = buildEquityCurves([
      bet(1, '2026-07-01', '1x2', 1),
      bet(2, '2026-07-01', 'overall', -1),
      bet(3, '2026-07-01', 'rule', 0.62),
    ])

    expect(curves.series).toHaveLength(3)
    expect(curves.series.find((s) => s.basis === '1x2')!.final).toBe(1)
    expect(curves.series.find((s) => s.basis === 'overall')!.final).toBe(-1)
    expect(curves.series.find((s) => s.basis === 'rule')!.final).toBe(0.62)
  })

  // A gap means "no bet that day", not "no data", so the total holds flat.
  it('carries a strategy forward on days it did not bet', () => {
    const curves = buildEquityCurves([
      bet(1, '2026-07-01', '1x2', 1),
      bet(2, '2026-07-02', 'overall', 0.5),
      bet(3, '2026-07-03', '1x2', 0.5),
    ])

    const oneXTwo = curves.series.find((s) => s.basis === '1x2')!
    expect(oneXTwo.cumulative).toEqual([1, 1, 1.5])
    expect(oneXTwo.bets).toEqual([1, 1, 2])
  })

  // Cropping zero out of frame would flatter a losing run.
  it('always keeps break-even in frame', () => {
    const winning = buildEquityCurves([bet(1, '2026-07-01', '1x2', 3)])
    expect(winning.min).toBe(0)

    const losing = buildEquityCurves([bet(1, '2026-07-01', '1x2', -3)])
    expect(losing.max).toBe(0)
    expect(losing.min).toBe(-3)
  })

  it('survives an empty ledger', () => {
    const curves = buildEquityCurves([])
    expect(curves.dates).toEqual([])
    expect(curves.series.every((s) => s.final === 0)).toBe(true)
  })
})
