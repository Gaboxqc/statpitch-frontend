import { describe, expect, it } from 'vitest'
import { buildStats } from './buildStats'
import { emptyStatsFixture, settledStatsFixture } from '../test/fixtures'

const byId = (stats: Parameters<typeof buildStats>[0]) =>
  Object.fromEntries(buildStats(stats).map((s) => [s.id, s.value]))

describe('buildStats', () => {
  it('shows a placeholder while nothing has settled, never a break-even zero', () => {
    const values = byId(emptyStatsFixture)
    expect(values.roi1x2).toBe('—')
    expect(values.roiOverall).toBe('—')
    expect(values.fixturesToday).toBe('0')
  })

  it('explains the empty ROI rather than leaving a bare dash', () => {
    const item = buildStats(emptyStatsFixture).find((s) => s.id === 'roi1x2')
    expect(item?.hint).toMatch(/no bets settled yet/i)
  })

  // roi_pct arrives already on a 0-100 scale, unlike every other rate the API returns.
  it('treats roi_pct as a percentage, not a fraction', () => {
    expect(byId(settledStatsFixture).roiOverall).toBe('+12.7%')
  })

  it('keeps the sign on a losing series', () => {
    expect(byId(settledStatsFixture).roi1x2.startsWith('-')).toBe(true)
  })

  // The two bases measure different strategies, so both must survive to the bar.
  it('reports both bases separately', () => {
    const values = byId(settledStatsFixture)
    expect(values.roi1x2).not.toBe(values.roiOverall)
  })

  it('reads the confidence threshold out of the payload', () => {
    const item = buildStats(emptyStatsFixture).find((s) => s.id === 'highConfidence')
    expect(item?.label).toContain('70%')
  })

  it('survives a missing payload', () => {
    expect(() => buildStats(null)).not.toThrow()
    expect(buildStats(null)).toEqual([])
  })
})
