import { describe, expect, it } from 'vitest'
import { groupByCompetition } from './groupByCompetition'
import {
  fixtureFixture,
  pickedFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../test/fixtures'
import type { Fixture } from '../types/api'

describe('groupByCompetition', () => {
  it('keeps the order the list arrived in', () => {
    const groups = groupByCompetition([
      pickedFixtureFixture, // ENG.PL
      fixtureFixture, // ESP.LALIGA
      unpricedFixtureFixture, // UEFA.UCL
    ])

    expect(groups.map((group) => group.id)).toEqual(['ENG.PL', 'ESP.LALIGA', 'UEFA.UCL'])
  })

  // Otherwise a competition whose fixtures are not adjacent would open a second
  // heading further down saying the same thing.
  it('gathers a competition into one group however scattered it is', () => {
    const groups = groupByCompetition([
      pickedFixtureFixture,
      fixtureFixture,
      { ...pickedFixtureFixture, id: 99 },
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].fixtures.map((fixture) => fixture.id)).toEqual([
      pickedFixtureFixture.id,
      99,
    ])
  })

  it('names the group from the payload rather than a local table', () => {
    const [group] = groupByCompetition([pickedFixtureFixture])

    expect(group.name).toBe('English Premier League')
    expect(group.short).toBe('Premier League')
    expect(group.icon).toContain('eng-pl')
  })

  // A teaser carries the competition too — a heading is not a paid line.
  it('groups a locked list the same way', () => {
    const [group] = groupByCompetition([teaserFixtureFixture])

    expect(group.short).toBe('LALIGA')
    expect(group.fixtures).toHaveLength(1)
  })

  it('falls back to the local table when the payload names nothing', () => {
    const nameless = {
      ...pickedFixtureFixture,
      competition_name: '',
      competition_short_name: '',
      competition_icon_url: null,
    } as Fixture
    const [group] = groupByCompetition([nameless])

    expect(group.short).toBe('Premier League')
    expect(group.icon).toBe(null)
  })

  it('has nothing to group in an empty list', () => {
    expect(groupByCompetition([])).toEqual([])
  })
})
