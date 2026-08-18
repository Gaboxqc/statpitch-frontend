import type { MarketKey } from '../types/api'

/**
 * Whether a market would have won, worked out from the final score.
 *
 * The score is used rather than `actual_result` on purpose: the API does not
 * publish that field's value set, and no settled fixture existed to sample it
 * from, so trusting an unknown vocabulary would risk marking a winning pick as
 * a loss. Goals are unambiguous.
 */
export function didMarketWin(key: MarketKey, homeScore: number, awayScore: number): boolean {
  const total = homeScore + awayScore

  switch (key) {
    case 'home_win':
      return homeScore > awayScore
    case 'draw':
      return homeScore === awayScore
    case 'away_win':
      return awayScore > homeScore
    case 'btts_yes':
      return homeScore > 0 && awayScore > 0
    case 'btts_no':
      return homeScore === 0 || awayScore === 0
    case 'over_1_5':
      return total > 1.5
    case 'over_2_5':
      return total > 2.5
    case 'over_3_5':
      return total > 3.5
    case 'under_1_5':
      return total < 1.5
    case 'under_2_5':
      return total < 2.5
    case 'under_3_5':
      return total < 3.5
  }
}

export type Outcome = 'home' | 'draw' | 'away'

export function outcomeFromScore(homeScore: number, awayScore: number): Outcome {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'draw'
}
