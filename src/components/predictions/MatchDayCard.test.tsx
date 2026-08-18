import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MatchDayCard from './MatchDayCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import { pickedFixtureFixture } from '../../test/fixtures'
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
    expect(screen.getByText('0.49%')).toBeInTheDocument()
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
