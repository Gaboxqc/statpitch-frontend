import { describe, expect, it } from 'vitest'
import { buildStats } from './buildStats'
import { emptyStatsFixture, settledStatsFixture } from '../test/fixtures'

const byId = (stats: Parameters<typeof buildStats>[0]) =>
  Object.fromEntries(buildStats(stats).map((s) => [s.id, s]))

describe('buildStats', () => {
  // The 30-day ROI pair used to live here and moved to the track record, which
  // is a whole page about exactly that. RoiSummary.test covers the 0-100 scale
  // and the empty-window placeholder that used to be asserted here.
  it('carries only the figures nothing else on the page shows', () => {
    expect(buildStats(emptyStatsFixture).map((item) => item.id)).toEqual([
      'highConfidence',
      'valueBets',
      'ruleBets',
    ])
  })

  /**
   * Two strategies, not a total and a subset: a fixture can carry a value bet
   * without a StatPitch pick and the other way round, so neither count bounds
   * the other and the pair must never be added up.
   */
  it('counts our selections and theirs separately', () => {
    const stats = byId(settledStatsFixture)
    expect(stats.valueBets.count).toBe(settledStatsFixture.value_bets_today)
    expect(stats.ruleBets.count).toBe(settledStatsFixture.rule_bets_today)
  })

  // The list below the bar is ours. StatPitch's picks have their own page, so
  // this count is not a filter and must not pretend to be one.
  it('leaves the StatPitch count unfiltered', () => {
    expect(byId(settledStatsFixture).ruleBets.filter).toEqual({})
  })

  it('reads the confidence threshold out of the payload', () => {
    expect(byId(emptyStatsFixture).highConfidence.label).toContain('70%')
  })

  // The label says "70%+" and the filter has to ask for the same number, or the
  // count and the list it opens disagree.
  it('filters on the threshold it names', () => {
    expect(byId(emptyStatsFixture).highConfidence.filter).toEqual({
      day: 'today',
      confidence: emptyStatsFixture.high_confidence_threshold,
    })
  })

  it('sends the value-bet stat to today, since that is what it counted', () => {
    expect(byId(settledStatsFixture).valueBets.filter).toEqual({
      day: 'today',
      valueBetsOnly: true,
    })
  })

  // A formatted "0" and a formatted "—" both read as falsy strings, so the raw
  // count rides along to let the bar tell an empty day from a missing payload.
  it('keeps the raw count beside the formatted one', () => {
    const item = byId(emptyStatsFixture).highConfidence
    expect(item.value).toBe('0')
    expect(item.count).toBe(0)
  })

  it('survives a missing payload', () => {
    expect(() => buildStats(null)).not.toThrow()
    expect(buildStats(null)).toEqual([])
  })
})
