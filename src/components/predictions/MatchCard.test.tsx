import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import MatchCard from './MatchCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import {
  fixtureFixture,
  pickedFixtureFixture,
  settledFixtureFixture,
  unpricedFixtureFixture,
} from '../../test/fixtures'

const card = () => screen.getByRole('article')

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
    expect(within(card()).queryByText(/^No edge$|^No odds$/)).not.toBeInTheDocument()
    expect(within(card()).queryByText('FT')).not.toBeInTheDocument()
  })

  it('says why a priced fixture carries no bet', () => {
    renderWithQuery(<MatchCard prediction={fixtureFixture} />)

    expect(within(card()).getByText('No edge')).toBeInTheDocument()
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
