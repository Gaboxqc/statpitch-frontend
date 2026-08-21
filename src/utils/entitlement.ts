import type { Fixture, FreeFixture, FullFixture } from '../types/api'

/**
 * Narrowing for the three payload shapes.
 *
 * The API withholds by **omitting keys**, so presence is the entitlement test
 * and `in` is the only correct operator. `fixture.odds_home !== null` asks a
 * different question: null is a real, meaningful value there — no bookmaker
 * quoted that market, which happens on cup ties every week — and a locked
 * fixture would answer it identically to a priced one.
 *
 * Each guard keys off a field that is non-nullable within its shape, so the
 * check can never be confused by a legitimately empty value.
 */

/** The 1X2 call is present: a free account that spent an unlock, or better. */
export const hasProbabilities = (fixture: Fixture): fixture is FreeFixture =>
  'home_win_prob' in fixture

/** Odds, EV, Kelly, xG, Elo, the scoreline distribution and the confidence band. */
export const hasFullDetail = (fixture: Fixture): fixture is FullFixture => 'confidence' in fixture
