import { BASES } from '../constants/bases'
import type { Basis, SettledBet } from '../types/api'

export interface EquitySeries {
  basis: Basis
  /** Cumulative P&L in units, aligned index-for-index with the shared date axis. */
  cumulative: number[]
  /** How many bets had settled by each date, for the tooltip. */
  bets: number[]
  final: number
  totalBets: number
}

export interface EquityCurves {
  /** The union of settlement dates across every strategy, ascending. */
  dates: string[]
  series: EquitySeries[]
  min: number
  max: number
}

/**
 * Cumulative P&L per strategy, on one shared date axis.
 *
 * The bases stay separate lines and are never summed: they measure different
 * strategies over overlapping fixtures, so a combined total would double-count
 * the same match and answer none of the three questions.
 *
 * Days where a strategy placed no bet carry its previous total forward, so a
 * flat stretch reads as "no bets", not "no data".
 */
export function buildEquityCurves(bets: SettledBet[]): EquityCurves {
  const dates = [...new Set(bets.map((bet) => bet.match_date))].sort()

  const series = BASES.map<EquitySeries>((basis) => {
    const rows = bets.filter((bet) => bet.basis === basis)
    const byDate = new Map<string, { pnl: number; count: number }>()

    for (const row of rows) {
      const entry = byDate.get(row.match_date) ?? { pnl: 0, count: 0 }
      entry.pnl += row.pnl_units
      entry.count += 1
      byDate.set(row.match_date, entry)
    }

    let runningPnl = 0
    let runningBets = 0
    const cumulative: number[] = []
    const counts: number[] = []

    for (const date of dates) {
      const entry = byDate.get(date)
      if (entry) {
        runningPnl += entry.pnl
        runningBets += entry.count
      }
      cumulative.push(Number(runningPnl.toFixed(4)))
      counts.push(runningBets)
    }

    return {
      basis,
      cumulative,
      bets: counts,
      final: cumulative.at(-1) ?? 0,
      totalBets: rows.length,
    }
  })

  const values = series.flatMap((entry) => entry.cumulative)
  // Zero is always in frame: the break-even line is the reference the whole
  // chart is read against, so cropping it would flatter a losing run.
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)

  return { dates, series, min, max }
}
