import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SummaryBar from './SummaryBar'
import { renderWithQuery } from '../../test/renderWithQuery'
import { emptyStatsFixture, pickedFixtureFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'
import type { Stats } from '../../types/api'

const withCounts = (confident: number, value: number): Stats => ({
  ...emptyStatsFixture,
  high_confidence_today: confident,
  value_bets_today: value,
})

const mock = (stats: Stats) => {
  vi.spyOn(service, 'getStats').mockResolvedValue(stats)
  vi.spyOn(service, 'getFixtures').mockResolvedValue({
    items: [pickedFixtureFixture],
    total: 1,
  })
}

afterEach(() => vi.restoreAllMocks())

describe('SummaryBar', () => {
  it('carries the two counts and the provenance of the page', async () => {
    mock(withCounts(3, 2))
    renderWithQuery(<SummaryBar />)

    expect(await screen.findByRole('button', { name: /high confidence/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /value bets/i })).toBeInTheDocument()
    // The commit hash is trimmed off, and kept in the title.
    expect(screen.getByText('goals-20260813')).toBeInTheDocument()
  })

  // A count is only worth showing if it takes you to what it counted.
  it('applies the filter the stat describes', async () => {
    mock(withCounts(3, 2))
    renderWithQuery(<SummaryBar />)

    const button = await screen.findByRole('button', { name: /value bets/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)

    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
  })

  it('puts the view back when an active stat is pressed again', async () => {
    mock(withCounts(3, 2))
    renderWithQuery(<SummaryBar />, { route: '/?value=1' })

    const button = await screen.findByRole('button', { name: /value bets/i })
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(button)

    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'))
  })

  // Nothing to act on, so it stops being a control rather than becoming a
  // button that leads to an empty list.
  it('shows a zero count without offering it as a filter', async () => {
    mock(withCounts(0, 0))
    renderWithQuery(<SummaryBar />)

    expect(await screen.findByText(/high confidence/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /high confidence/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /value bets/i })).not.toBeInTheDocument()
  })
})
