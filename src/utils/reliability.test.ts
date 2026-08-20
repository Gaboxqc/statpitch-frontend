import { describe, expect, it } from 'vitest'
import { reliability } from './reliability'
import { fixtureFixture } from '../test/fixtures'

describe('reliability', () => {
  it('calls a fixture fully rated only when nothing was estimated', () => {
    expect(reliability(fixtureFixture).level).toBe('measured')
  })

  it('flags a club whose Elo came from a prior', () => {
    const partial = reliability({ ...fixtureFixture, away_elo_source: 'pooled_prior' })
    expect(partial.level).toBe('partial')
    expect(partial.hint).toMatch(/weaker claim/i)
  })

  // fully_rated and the per-club sources can disagree; either one is enough.
  it('trusts the fully_rated flag on its own', () => {
    expect(reliability({ ...fixtureFixture, fully_rated: false }).level).toBe('partial')
  })

  // The weakest link decides: a fallback model outranks a rating problem,
  // because it changes where every number came from.
  it('reports the fallback model above everything else', () => {
    const weak = reliability({
      ...fixtureFixture,
      fully_rated: false,
      prediction_source: 'elo-poisson',
    })
    expect(weak.level).toBe('fallback')
  })
})
