import { describe, expect, it } from 'vitest'
import { describeKickoff, formatMatchDay, formatRelativeTime, toISOString } from './datetime'
import { fixtureFixture, unpricedFixtureFixture } from '../test/fixtures'

describe("parsing the API's timestamps", () => {
  // Regression: the API serialises UTC instants without a Z, and JavaScript
  // reads an offsetless date-time as local, so every viewer outside UTC saw
  // the wrong kick-off.
  it('reads an offsetless instant as UTC', () => {
    expect(toISOString('2026-08-19T19:00:00')).toBe('2026-08-19T19:00:00.000Z')
  })

  it('leaves an instant that already carries an offset alone', () => {
    expect(toISOString('2026-08-19T19:00:00Z')).toBe('2026-08-19T19:00:00.000Z')
  })

  it('returns undefined rather than an invalid date', () => {
    expect(toISOString(null)).toBeUndefined()
    expect(toISOString('not a date')).toBeUndefined()
  })
})

describe('formatMatchDay', () => {
  // Regression: `new Date('2026-08-19')` lands on UTC midnight, which renders
  // as the 18th for any viewer behind UTC — including America/Managua, the
  // timezone the date was resolved in.
  it('keeps the calendar day whatever the viewer offset', () => {
    expect(formatMatchDay('2026-08-19')).toContain('19')
    expect(formatMatchDay('2026-08-19')).toContain('Aug')
  })

  it('falls back rather than rendering an invalid date', () => {
    expect(formatMatchDay(null)).toBe('—')
    expect(formatMatchDay('2026-08')).toBe('—')
  })
})

describe('describeKickoff', () => {
  it('gives a real time for a confirmed fixture', () => {
    const label = describeKickoff(fixtureFixture)
    expect(label.provisional).toBe(false)
    expect(label.dateTime).toBe('2026-08-19T19:00:00.000Z')
    expect(label.text).toMatch(/^\d{2}:\d{2}$/)
  })

  // Most fixtures upstream sit on a matchday placeholder, and rendering one as
  // a specific time would invent information the API does not have.
  it('never claims a time for a provisional date', () => {
    const label = describeKickoff(unpricedFixtureFixture)
    expect(label.provisional).toBe(true)
    expect(label.text).toContain('TBC')
    expect(label.dateTime).toBeUndefined()
  })
})

describe('formatRelativeTime', () => {
  it('describes how stale the sync is', () => {
    const now = Date.parse('2026-08-18T11:42:06Z')
    expect(formatRelativeTime('2026-08-18T07:42:06.933578', now)).toBe('4 hours ago')
  })

  it('falls back when the sync time is missing', () => {
    expect(formatRelativeTime(null)).toBe('—')
  })
})
