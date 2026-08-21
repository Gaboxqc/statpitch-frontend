import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import PlanAction from './PlanAction'
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

const as = (account: Account | null) => vi.spyOn(accounts, 'getMe').mockResolvedValue(account)

afterEach(() => vi.restoreAllMocks())

describe('PlanAction', () => {
  it('asks an anonymous reader to create an account, whichever plan', async () => {
    as(null)
    renderWithQuery(<PlanAction plan={'pro'} isPopular={true} />)

    expect(await screen.findByRole('link', { name: /create account/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/login?new=1'),
    )
  })

  it('names the plan the reader is already on', async () => {
    as({ ...FREE, tier: 'pro' })
    renderWithQuery(<PlanAction plan={'pro'} isPopular={true} />)

    expect(await screen.findByText('Current plan')).toBeInTheDocument()
  })

  // Everything a lower tier sells is already in the higher one, so there is
  // nothing to buy and nothing to be told about.
  it('says a lower plan is included rather than offering it', async () => {
    as({ ...FREE, tier: 'elite' })
    renderWithQuery(<PlanAction plan={'pro'} isPopular={true} />)

    expect(await screen.findByText('Included')).toBeInTheDocument()
  })

  it('offers the trial on Pro to a free account that has not used it', async () => {
    as(FREE)
    renderWithQuery(<PlanAction plan={'pro'} isPopular={true} />)

    expect(await screen.findByRole('button', { name: /start 14-day trial/i })).toBeInTheDocument()
  })

  /**
   * There is no checkout to send anyone to. A "Subscribe" button that leads
   * nowhere would be exactly the dark pattern the page above it disclaims.
   */
  it('says upgrades are arranged by hand rather than faking a checkout', async () => {
    as({ ...FREE, trial_used: true })
    renderWithQuery(<PlanAction plan={'pro'} isPopular={true} />)

    expect(await screen.findByText(/contact us to upgrade/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('never offers the trial as a route to Elite', async () => {
    as(FREE)
    renderWithQuery(<PlanAction plan={'elite'} isPopular={false} />)

    expect(await screen.findByText(/contact us to upgrade/i)).toBeInTheDocument()
  })
})
