import { describe, expect, it } from 'vitest'
import { buildStats } from './buildStats'
import { emptyStatsFixture } from '../test/fixtures'

describe('buildStats', () => {
  it('shows a placeholder while nothing has settled', () => {
    const byId = Object.fromEntries(buildStats(emptyStatsFixture).map((s) => [s.id, s.value]))
    expect(byId.accuracy30d).toBe('—')
    expect(byId.roi30d).toBe('—')
    expect(byId.predictionsToday).toBe('0')
  })

  it('renders fractions as percentages', () => {
    const byId = Object.fromEntries(
      buildStats({ ...emptyStatsFixture, accuracy_30d: 0.692, roi_30d: 0.083 }).map((s) => [
        s.id,
        s.value,
      ]),
    )
    expect(byId.accuracy30d).toBe('69.2%')
    expect(byId.roi30d).toBe('8.3%')
  })

  it('survives an empty payload', () => {
    expect(() => buildStats({})).not.toThrow()
    expect(buildStats({}).every((s) => s.value === '—')).toBe(true)
  })
})
