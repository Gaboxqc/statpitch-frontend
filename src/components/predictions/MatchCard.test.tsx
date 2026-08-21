import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import * as accounts from '../../services/accounts'
import MatchCard from './MatchCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import {
  fixtureFixture,
  freeFixtureFixture,
  pickedFixtureFixture,
  settledFixtureFixture,
  settledTeaserFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../../test/fixtures'

const card = () => screen.getByRole('article')

afterEach(() => vi.restoreAllMocks())

/**
 * The three states used to render as near-identical cards separated by a small
 * chip. Each one now owns the same slot, and only one of them can fill it.
 */
describe('MatchCard states', () => {
  // The market breakdown below also talks about EV and stakes, so the assertions
  // key on the verdict's own phrasing ("4.20% stake"), not on the words.
  it('leads an actionable fixture with the bet, not the confidence ring', () => {
    renderWithQuery(<MatchCard prediction={pickedFixtureFixture} />)

    expect(within(card()).getByText(/%\s*stake$/)).toBeInTheDocument()
    expect(within(card()).queryByText(/^No pick$|^No odds$/)).not.toBeInTheDocument()
    expect(within(card()).queryByText('FT')).not.toBeInTheDocument()
  })

  it('says why a priced fixture carries no bet', () => {
    renderWithQuery(<MatchCard prediction={fixtureFixture} />)

    expect(within(card()).getByText('No pick')).toBeInTheDocument()
    expect(within(card()).queryByText(/%\s*stake$/)).not.toBeInTheDocument()
  })

  // Never priced and priced-but-no-edge are both forecasts, and the reason is
  // the part that differs.
  it('distinguishes a fixture that was never priced', () => {
    renderWithQuery(<MatchCard prediction={unpricedFixtureFixture} />)

    expect(within(card()).getByText('No odds')).toBeInTheDocument()
  })

  it('leads a played fixture with the result', () => {
    renderWithQuery(<MatchCard prediction={settledFixtureFixture} />)

    expect(within(card()).getByText('3–1')).toBeInTheDocument()
    expect(within(card()).getByText('FT')).toBeInTheDocument()
    // The pick is settled, so it is a verdict rather than an invitation.
    expect(within(card()).queryByText(/%\s*stake$/)).not.toBeInTheDocument()
  })

  it('keeps the model view on every state', () => {
    renderWithQuery(<MatchCard prediction={unpricedFixtureFixture} />)

    expect(within(card()).getAllByText(/home|draw|away/i).length).toBeGreaterThan(0)
  })
})

/**
 * The same card, at the three depths the API will actually hand it over. What
 * matters here is that the missing parts are absent rather than rendered as
 * blanks, dashes or zeroes — a withheld number and a measured zero must never
 * look alike.
 */
describe('MatchCard across the payload shapes', () => {
  it('still names both clubs when the prediction is withheld', () => {
    renderWithQuery(<MatchCard prediction={teaserFixtureFixture} />)

    expect(within(card()).getByText('Atlético de Madrid')).toBeInTheDocument()
    expect(within(card()).getByText('Málaga')).toBeInTheDocument()
  })

  it('shows no probability and no xG on a teaser', () => {
    renderWithQuery(<MatchCard prediction={teaserFixtureFixture} />)

    expect(within(card()).queryByText(/xG/)).not.toBeInTheDocument()
    expect(within(card()).queryByText(/%$/)).not.toBeInTheDocument()
  })

  // The slot has to say something, or the card reads as one that failed to load.
  it('says the prediction is locked rather than leaving the verdict empty', () => {
    vi.spyOn(accounts, 'getMe').mockReturnValue(new Promise(() => null))
    renderWithQuery(<MatchCard prediction={teaserFixtureFixture} />)

    expect(within(card()).getByText('Locked')).toBeInTheDocument()
  })

  // Once it is known who is asking, the same slot becomes the way out of it.
  it('turns the locked slot into the way out once the session is known', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    renderWithQuery(<MatchCard prediction={teaserFixtureFixture} />)

    expect(await within(card()).findByRole('link', { name: /sign up free/i })).toBeInTheDocument()
  })

  // Both answers are about the market, and a teaser has no market to describe.
  it('offers no explanation for a missing pick it cannot see', () => {
    renderWithQuery(<MatchCard prediction={teaserFixtureFixture} />)

    expect(within(card()).queryByText(/^No pick$|^No odds$/)).not.toBeInTheDocument()
  })

  it('shows the 1X2 call on a free fixture but still no xG', () => {
    renderWithQuery(<MatchCard prediction={freeFixtureFixture} />)

    expect(within(card()).getAllByText(/%$/).length).toBeGreaterThan(0)
    expect(within(card()).queryByText(/xG/)).not.toBeInTheDocument()
    expect(within(card()).queryByText('Locked')).not.toBeInTheDocument()
  })

  // The result is public on every shape; the pick published against it is not.
  it('gives a played teaser its score and no verdict on the pick', () => {
    renderWithQuery(<MatchCard prediction={settledTeaserFixture} />)

    expect(within(card()).getByText('2–0')).toBeInTheDocument()
    expect(within(card()).getByText('FT')).toBeInTheDocument()
    expect(within(card()).queryByText(/^Won$|^Lost$/)).not.toBeInTheDocument()
  })

  it('does settle the pick when the payload carried one', () => {
    renderWithQuery(<MatchCard prediction={settledFixtureFixture} />)

    expect(within(card()).getByText(/^Won$|^Lost$/)).toBeInTheDocument()
  })

  it('keeps the full card intact', () => {
    renderWithQuery(<MatchCard prediction={fixtureFixture} />)

    expect(within(card()).getAllByText(/xG/).length).toBe(2)
  })
})
