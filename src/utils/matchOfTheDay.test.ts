import { describe, expect, it } from 'vitest'
import { pickMatchOfTheDay } from './matchOfTheDay'
import {
  freeFixtureFixture,
  settledTeaserFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../test/fixtures'

describe('pickMatchOfTheDay', () => {
  it('takes the strongest single outcome', () => {
    const weak = { ...freeFixtureFixture, id: 10, home_win_prob: 0.4, away_win_prob: 0.3 }
    const strong = { ...freeFixtureFixture, id: 11, home_win_prob: 0.72, away_win_prob: 0.1 }

    expect(pickMatchOfTheDay([weak, strong])?.id).toBe(11)
  })

  // A likely draw is not a confident match, which is the same reasoning the API
  // applies to its own high-confidence count.
  it('ignores the draw when judging how strong a call is', () => {
    const draw = { ...freeFixtureFixture, id: 12, home_win_prob: 0.2, draw_prob: 0.7, away_win_prob: 0.1 }
    const home = { ...freeFixtureFixture, id: 13, home_win_prob: 0.5, draw_prob: 0.3, away_win_prob: 0.2 }

    expect(pickMatchOfTheDay([draw, home])?.id).toBe(13)
  })

  /**
   * The API draws its own pick from the competitions a free reader can see, so
   * the derived one does too — a cup tie nobody can price is not the match to
   * lead the page with, however lopsided the model thinks it is.
   */
  it('prefers a priced competition over a stronger call in an unpriced one', () => {
    const cup = { ...unpricedFixtureFixture, id: 14, home_win_prob: 0.95 }
    const league = { ...freeFixtureFixture, id: 15, home_win_prob: 0.6 }

    expect(pickMatchOfTheDay([cup, league])?.id).toBe(15)
  })

  it('still picks from an unpriced competition when there is nothing else', () => {
    const cup = { ...unpricedFixtureFixture, id: 16 }

    expect(pickMatchOfTheDay([cup])?.id).toBe(16)
  })

  // Every payload on a day that is not today is a teaser for anyone not paying,
  // and a teaser says nothing that could be featured.
  it('picks nothing from a list that carries no prediction', () => {
    expect(pickMatchOfTheDay([teaserFixtureFixture, settledTeaserFixture])).toBe(null)
  })

  it('picks nothing from an empty day', () => {
    expect(pickMatchOfTheDay([])).toBe(null)
  })

  // The list arrives ordered by kick-off, and a pick that swapped between
  // renders would not be a pick at all.
  it('keeps the earlier fixture when two calls are equally strong', () => {
    const first = { ...freeFixtureFixture, id: 17 }
    const second = { ...freeFixtureFixture, id: 18 }

    expect(pickMatchOfTheDay([first, second])?.id).toBe(17)
  })
})
