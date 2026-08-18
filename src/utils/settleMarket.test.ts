import { describe, expect, it } from 'vitest'
import { didMarketWin, outcomeFromScore } from './settleMarket'
import type { MarketKey } from '../types/api'

describe('didMarketWin', () => {
  it('settles the 1X2 markets', () => {
    expect(didMarketWin('home_win', 3, 1)).toBe(true)
    expect(didMarketWin('away_win', 3, 1)).toBe(false)
    expect(didMarketWin('draw', 1, 1)).toBe(true)
    expect(didMarketWin('home_win', 1, 1)).toBe(false)
  })

  it('settles both-teams-to-score', () => {
    expect(didMarketWin('btts_yes', 3, 1)).toBe(true)
    expect(didMarketWin('btts_yes', 3, 0)).toBe(false)
    expect(didMarketWin('btts_no', 3, 0)).toBe(true)
    expect(didMarketWin('btts_no', 0, 0)).toBe(true)
  })

  // The line sits on a half goal, so a total can never push.
  it('settles the goal lines on the right side of the half', () => {
    expect(didMarketWin('over_2_5', 2, 1)).toBe(true)
    expect(didMarketWin('over_2_5', 1, 1)).toBe(false)
    expect(didMarketWin('under_2_5', 1, 1)).toBe(true)
    expect(didMarketWin('over_3_5', 2, 2)).toBe(true)
    expect(didMarketWin('under_1_5', 1, 0)).toBe(true)
    expect(didMarketWin('under_1_5', 1, 1)).toBe(false)
  })

  it('is exhaustive over every published market', () => {
    const keys: MarketKey[] = [
      'home_win',
      'draw',
      'away_win',
      'btts_yes',
      'btts_no',
      'over_1_5',
      'over_2_5',
      'over_3_5',
      'under_1_5',
      'under_2_5',
      'under_3_5',
    ]
    for (const key of keys) {
      expect(typeof didMarketWin(key, 2, 1)).toBe('boolean')
    }
  })

  it('never says both a market and its opposite won', () => {
    expect(didMarketWin('over_2_5', 2, 1)).not.toBe(didMarketWin('under_2_5', 2, 1))
    expect(didMarketWin('btts_yes', 1, 0)).not.toBe(didMarketWin('btts_no', 1, 0))
  })
})

describe('outcomeFromScore', () => {
  it('reads the outcome off the goals', () => {
    expect(outcomeFromScore(3, 1)).toBe('home')
    expect(outcomeFromScore(1, 3)).toBe('away')
    expect(outcomeFromScore(2, 2)).toBe('draw')
  })
})
