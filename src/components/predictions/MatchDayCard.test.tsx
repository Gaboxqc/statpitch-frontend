import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MatchDayCard from './MatchDayCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import { fixtureFixture, pickedFixtureFixture, unpricedFixtureFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'

afterEach(() => vi.restoreAllMocks())

describe('MatchDayCard', () => {
  it('reports the empty state when there is nothing today', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(null)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no prediction available/i)).toBeInTheDocument()
  })

  it('renders the fixture without crashing on derived values', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByRole('heading', { name: /match of the day/i })).toBeInTheDocument()
    expect(screen.getAllByText('72.83%').length).toBeGreaterThan(0)
    // Kelly is a 0-1 fraction: scaled before rounding, not after.
    expect(screen.getAllByText('0.49%').length).toBeGreaterThan(0)
  })

  // Regression: EV was formatted as though it were already a percentage, so a
  // +3.20% edge rendered as "+0.03%".
  it('scales EV from the fraction the API sends', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    renderWithQuery(<MatchDayCard />)

    expect((await screen.findAllByText('+3.20%')).length).toBeGreaterThan(0)
  })

  it('explains a priced fixture that produced no selection', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(fixtureFixture)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no selection cleared the minimum stake/i)).toBeInTheDocument()
  })

  it('distinguishes an unpriced fixture from one with no edge', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(unpricedFixtureFixture)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no odds matched this fixture/i)).toBeInTheDocument()
    // A matchday placeholder must never render as a specific kick-off time.
    expect(screen.getByText(/time TBC/i)).toBeInTheDocument()
  })

  it('exposes the market breakdown as a keyboard-operable disclosure', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    renderWithQuery(<MatchDayCard />)

    const toggle = await screen.findByRole('button', { name: /market breakdown/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
