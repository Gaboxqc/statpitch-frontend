import { describe, expect, it } from 'vitest'
import { assess } from './confidence'
import {
  fixtureFixture,
  freeFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../test/fixtures'

describe('assess on a full payload', () => {
  it('takes the API’s band rather than deriving one', () => {
    expect(assess(fixtureFixture)?.band).toBe('high')
    expect(assess(unpricedFixtureFixture)?.band).toBe('low')
  })

  it('carries the API’s own sentences through untouched', () => {
    const assessment = assess(unpricedFixtureFixture)

    expect(assessment?.reasons).toEqual(unpricedFixtureFixture.confidence_reasons)
    expect(assessment?.reasons[0]).toMatch(/no measured Elo rating/i)
  })

  /**
   * Data quality vetoes decisiveness, so a low band is the one that changes
   * what a reader should do with the number beside it. Most fixtures sit at
   * medium until odds land, which is why medium is not worth a badge in a list.
   */
  it('marks only a low band as worth saying unprompted', () => {
    expect(assess(unpricedFixtureFixture)?.notable).toBe(true)
    expect(assess({ ...fixtureFixture, confidence: 'medium' })?.notable).toBe(false)
    expect(assess(fixtureFixture)?.notable).toBe(false)
  })

  // A lopsided scoreline built on a prior is still a weak claim, and the API
  // is the one that knows which inputs went in.
  it('does not let a decisive number raise the band', () => {
    const lopsided = { ...unpricedFixtureFixture, home_win_prob: 0.95 }
    expect(assess(lopsided)?.band).toBe('low')
  })
})

describe('assess below a full payload', () => {
  /**
   * Which model ran is published on every shape, so the one judgement that can
   * be made without a subscription still is.
   */
  it('falls back to the model provenance a teaser does carry', () => {
    const assessment = assess({ ...teaserFixtureFixture, prediction_source: 'elo-poisson' })

    expect(assessment?.band).toBe('fallback')
    expect(assessment?.reasons[0]).toMatch(/Elo-Poisson/i)
    expect(assessment?.notable).toBe(true)
  })

  // Silence is the honest answer: a teaser from the usual model carries no
  // evidence either way, and no badge is not a clean bill of health.
  it('says nothing when the payload holds no evidence', () => {
    expect(assess(teaserFixtureFixture)).toBe(null)
    expect(assess(freeFixtureFixture)).toBe(null)
  })
})
