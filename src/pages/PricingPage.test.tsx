import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import PricingPage from './PricingPage'
import { renderWithQuery } from '../test/renderWithQuery'
import * as accounts from '../services/accounts'
import * as predictions from '../services/predictions'
import type { Account } from '../types/account'

const FREE: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

/** The live ROI panel sits on this page and is a paid route below Pro. */
const noStats = () =>
  vi.spyOn(predictions, 'getStats').mockRejectedValue(new Error('Payment required'))

afterEach(() => vi.restoreAllMocks())

describe('PricingPage', () => {
  it('sells the product to a visitor with no session', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    noStats()
    renderWithQuery(<PricingPage />)

    expect(await screen.findByRole('heading', { name: /transparent pricing/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start free trial/i })).toBeInTheDocument()
  })

  /**
   * Somebody who has already signed up is not deciding whether to buy — they are
   * asking what they are missing. The closing block used to send them to a login
   * form they were already past.
   */
  it('tells a subscriber what is above them instead of pitching a price list', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(FREE)
    noStats()
    renderWithQuery(<PricingPage />)

    expect(await screen.findByRole('heading', { name: /your plan/i })).toBeInTheDocument()
    expect(screen.getByText(/you are on free/i)).toBeInTheDocument()
    expect(screen.getByText(/pro opens the market breakdown/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /start free trial/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to your account/i })).toBeInTheDocument()
  })

  // Nothing is above Elite, so nothing is offered.
  it('offers Elite nothing further', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue({ ...FREE, tier: 'elite' })
    noStats()
    renderWithQuery(<PricingPage />)

    expect(await screen.findByText(/you are on the top tier/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /go to your account/i })).not.toBeInTheDocument()
  })
})
