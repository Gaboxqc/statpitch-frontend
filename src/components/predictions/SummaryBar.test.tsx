import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SummaryBar from './SummaryBar'
import { renderWithQuery } from '../../test/renderWithQuery'
import { emptyStatsFixture, pickedFixtureFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'
import * as accounts from '../../services/accounts'
import { setQuota } from '../../services/quota'
import type { Stats } from '../../types/api'
import type { Account } from '../../types/account'

const FREE: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

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

afterEach(() => {
  vi.restoreAllMocks()
  setQuota(null)
})

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

describe('the quota chip', () => {
  it('counts down what a free account has left today', async () => {
    mock(withCounts(0, 0))
    vi.spyOn(accounts, 'getMe').mockResolvedValue(FREE)
    setQuota(2)
    renderWithQuery(<SummaryBar />)

    // Scoped to the chip: the stat pills carry bare numbers of their own.
    expect(await screen.findByText(/predictions left today/i)).toHaveTextContent('2')
  })

  // Running out is not an error: the fixture still returns, in teaser shape.
  it('reports a genuine zero to somebody who spent it', async () => {
    mock(withCounts(0, 0))
    vi.spyOn(accounts, 'getMe').mockResolvedValue(FREE)
    setQuota(0)
    renderWithQuery(<SummaryBar />)

    expect(await screen.findByText(/predictions left today/i)).toHaveTextContent('0')
  })

  /**
   * The API honestly reports zero for an anonymous visitor, but they have not
   * spent three — they never had three. "0 left" would describe a loss where
   * the truth is an offer they have not taken up.
   */
  it('says nothing to a visitor who never had a quota', async () => {
    mock(withCounts(0, 0))
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    setQuota(0)
    renderWithQuery(<SummaryBar />)

    await waitFor(() => expect(screen.queryByText(/predictions left/i)).not.toBeInTheDocument())
  })

  it('says nothing on a plan with no limit to count', async () => {
    mock(withCounts(0, 0))
    vi.spyOn(accounts, 'getMe').mockResolvedValue({ ...FREE, tier: 'pro' })
    setQuota('unlimited')
    renderWithQuery(<SummaryBar />)

    await waitFor(() => expect(screen.queryByText(/predictions left/i)).not.toBeInTheDocument())
  })

  // A header blocked by CORS looks exactly like one never sent, and neither is
  // a reason to tell the reader anything.
  it('says nothing when the count never arrived', async () => {
    mock(withCounts(0, 0))
    vi.spyOn(accounts, 'getMe').mockResolvedValue(FREE)
    renderWithQuery(<SummaryBar />)

    await waitFor(() => expect(screen.queryByText(/predictions left/i)).not.toBeInTheDocument())
  })
})
