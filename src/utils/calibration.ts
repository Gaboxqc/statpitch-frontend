import type { SettledBet } from '../types/api'

/**
 * Below this the buckets are noise dressed as a chart: four bets in a bucket can
 * land 4-0 or 0-4 on a perfectly calibrated model, and either would look like a
 * finding. The interval below stays honest at any n, but a chart nobody should
 * read conclusions from is better not drawn.
 */
export const MIN_BETS = 20

/** 95%, the interval a reader assumes when none is stated. */
const Z = 1.96

const EDGES = [0, 0.2, 0.4, 0.6, 0.8, 1]

export interface CalibrationBucket {
  from: number
  to: number
  bets: number
  wins: number
  /** Mean probability the model gave the selections in this bucket. */
  predicted: number
  /** Share of them that actually won. */
  realised: number
  /** Wilson score interval on `realised`. Asymmetric near 0 and 1, unlike a
   *  normal approximation, which is the whole reason to use it on small n. */
  low: number
  high: number
}

/**
 * The Wilson score interval. The textbook `p ± z·sqrt(p(1-p)/n)` produces
 * intervals that run past 0 and 1 and collapse to zero width on a bucket that
 * went 4-0, which is exactly the case a reader needs warning about.
 */
export function wilson(wins: number, bets: number, z = Z): { low: number; high: number } {
  if (bets === 0) return { low: 0, high: 1 }

  const p = wins / bets
  const denominator = 1 + (z * z) / bets
  const centre = (p + (z * z) / (2 * bets)) / denominator
  const spread = (z / denominator) * Math.sqrt((p * (1 - p)) / bets + (z * z) / (4 * bets * bets))

  return { low: Math.max(0, centre - spread), high: Math.min(1, centre + spread) }
}

export interface Calibration {
  buckets: CalibrationBucket[]
  total: number
  /** Whether there is enough here to draw at all. */
  readable: boolean
}

/**
 * Predicted against realised, which is the only claim a probability product can
 * actually be held to. Note what the ledger is: bets that were placed, selected
 * for having an edge. This measures the calibration of the published
 * selections, not of every probability the model ever produced — a distinction
 * the caption has to make, because the chart cannot.
 */
export function buildCalibration(bets: SettledBet[]): Calibration {
  const buckets: CalibrationBucket[] = []

  for (let index = 0; index < EDGES.length - 1; index += 1) {
    const from = EDGES[index]
    const to = EDGES[index + 1]
    // The top bucket owns its upper edge; every other one is half-open, so a
    // probability lands in exactly one bucket.
    const inBucket = bets.filter(
      (bet) =>
        bet.probability >= from &&
        (index === EDGES.length - 2 ? bet.probability <= to : bet.probability < to),
    )
    if (inBucket.length === 0) continue

    const wins = inBucket.filter((bet) => bet.won).length
    const predicted = inBucket.reduce((sum, bet) => sum + bet.probability, 0) / inBucket.length

    buckets.push({
      from,
      to,
      bets: inBucket.length,
      wins,
      predicted,
      realised: wins / inBucket.length,
      ...wilson(wins, inBucket.length),
    })
  }

  return { buckets, total: bets.length, readable: bets.length >= MIN_BETS }
}
