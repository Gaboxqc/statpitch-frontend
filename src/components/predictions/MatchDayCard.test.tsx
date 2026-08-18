import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MatchDayCard from './MatchDayCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import { predictionFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'

afterEach(() => vi.restoreAllMocks())

describe('MatchDayCard', () => {
  it('reports the empty state when there is no best bet today', async () => {
    vi.spyOn(service, 'getBestPrediction').mockResolvedValue(null)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no prediction available/i)).toBeInTheDocument()
  })

  it('renders the fixture without crashing on derived values', async () => {
    vi.spyOn(service, 'getBestPrediction').mockResolvedValue(predictionFixture)
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByRole('heading', { name: /match of the day/i })).toBeInTheDocument()
    // The win probability appears in both the hero figure and the outcome tiles.
    expect(screen.getAllByText('48.21%').length).toBeGreaterThan(0)
    // Kelly is a 0-1 fraction: scaled before rounding, not after.
    expect(screen.getByText('18.75%')).toBeInTheDocument()
  })

  it('exposes the market breakdown as a keyboard-operable disclosure', async () => {
    vi.spyOn(service, 'getBestPrediction').mockResolvedValue(predictionFixture)
    renderWithQuery(<MatchDayCard />)

    const toggle = await screen.findByRole('button', { name: /market breakdown/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
