import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Upsell from './Upsell'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as accounts from '../../services/accounts'
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

afterEach(() => vi.restoreAllMocks())

describe('Upsell', () => {
  /**
   * The funnel step, and the reason this component exists rather than a hard
   * link. Signing up is what reveals the first prediction, so an anonymous
   * reader is asked to register — sending them to a price list would ask for
   * money before they have seen the product work once.
   */
  it('asks an anonymous reader to register, not to subscribe', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    renderWithQuery(<Upsell title={'Locked'} />)

    const link = await screen.findByRole('link', { name: /sign up free/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('/login?new=1'))
  })

  // A free account has already spent its three, so the price list is where the
  // next thing they want actually is.
  it('sends a signed-in free account to the plans', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(FREE)
    renderWithQuery(<Upsell title={'Locked'} />)

    const link = await screen.findByRole('link', { name: /see plans/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('/pricing'))
  })

  it('states what is withheld and why it is worth having', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    renderWithQuery(<Upsell title={'The prediction is locked.'} detail={'Win probabilities.'} />)

    expect(await screen.findByText('The prediction is locked.')).toBeInTheDocument()
    expect(screen.getByText('Win probabilities.')).toBeInTheDocument()
  })

  // Guessing would offer a subscription to somebody one render from being told
  // to sign up. Occupying the slot is not the same as guessing.
  it('holds the inline slot without committing to an action', () => {
    vi.spyOn(accounts, 'getMe').mockReturnValue(new Promise(() => null))
    renderWithQuery(<Upsell variant={'inline'} />)

    expect(screen.getByText('Locked')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('offers no action from a panel it cannot yet address', () => {
    vi.spyOn(accounts, 'getMe').mockReturnValue(new Promise(() => null))
    renderWithQuery(<Upsell title={'Locked'} />)

    expect(screen.getByText('Locked')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
