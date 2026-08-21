import { describe, expect, it } from 'vitest'
import { hasFullDetail, hasProbabilities } from './entitlement'
import {
  fixtureFixture,
  freeFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../test/fixtures'

describe('hasProbabilities', () => {
  it('separates a withheld prediction from a published one', () => {
    expect(hasProbabilities(teaserFixtureFixture)).toBe(false)
    expect(hasProbabilities(freeFixtureFixture)).toBe(true)
    expect(hasProbabilities(fixtureFixture)).toBe(true)
  })
})

describe('hasFullDetail', () => {
  it('holds only for the paid shape', () => {
    expect(hasFullDetail(teaserFixtureFixture)).toBe(false)
    expect(hasFullDetail(freeFixtureFixture)).toBe(false)
    expect(hasFullDetail(fixtureFixture)).toBe(true)
  })

  /**
   * The distinction the whole scheme rests on. A fixture nobody quoted carries
   * `odds_home: null` and is still fully paid for; a withheld one has no such
   * key at all. A null check cannot tell those apart, and would have called
   * this unpriced Champions League tie locked.
   */
  it('is not fooled by a fixture that simply carried no market', () => {
    expect(unpricedFixtureFixture.odds_home).toBe(null)
    expect(hasFullDetail(unpricedFixtureFixture)).toBe(true)
  })

  it('reads absence, not emptiness', () => {
    expect('odds_home' in teaserFixtureFixture).toBe(false)
    expect('odds_home' in unpricedFixtureFixture).toBe(true)
  })
})

describe('the shapes themselves', () => {
  // Pinned against a live payload. A field added upstream should land here as
  // a failure rather than quietly widening what a teaser gives away.
  it('carry the key counts the API publishes', () => {
    expect(Object.keys(teaserFixtureFixture)).toHaveLength(23)
    expect(Object.keys(freeFixtureFixture)).toHaveLength(26)
  })

  it('nest, so anything a teaser shows a full payload shows too', () => {
    const teaserKeys = Object.keys(teaserFixtureFixture)
    expect(teaserKeys.every((key) => key in fixtureFixture)).toBe(true)
  })

  it('mark a teaser locked and an unlocked fixture not', () => {
    expect(teaserFixtureFixture.locked).toBe(true)
    expect(freeFixtureFixture.locked).toBe(false)
    expect(fixtureFixture.locked).toBe(false)
  })
})
