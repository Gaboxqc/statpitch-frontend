import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as accounts from '../../services/accounts'
import * as admin from '../../services/admin'
import type { Account } from '../../types/account'
import type { AdminUser } from '../../types/admin'

const PRO: Account = {
  email: 'reader@example.com',
  tier: 'pro',
  tier_expires_at: '2026-09-03T00:00:00',
  trial_used: true,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

const ADMIN: AdminUser = {
  username: 'gabox',
  last_login_at: null,
  csrf_token: 'admin-token',
}

const user = userEvent.setup({ delay: null })

/** The navbar asks once per session whether an admin session is open. */
const noAdmin = () => vi.spyOn(admin, 'getAdmin').mockResolvedValue(null)

afterEach(() => vi.restoreAllMocks())

describe('Navbar', () => {
  it('invites a visitor with no session to sign in', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    noAdmin()
    renderWithQuery(<Navbar />)

    expect(await screen.findByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /get started/i })).not.toHaveLength(0)
  })

  it('names the tier and offers the way out once signed in', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(PRO)
    noAdmin()
    renderWithQuery(<Navbar />)

    expect(await screen.findByText('Pro')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /sign out/i })).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument()
  })

  // Rendering the signed-out chrome first would flash the wrong identity at
  // somebody who is already signed in, on every single page load.
  it('commits to neither state until /me settles', () => {
    vi.spyOn(accounts, 'getMe').mockReturnValue(new Promise(() => null))
    noAdmin()
    renderWithQuery(<Navbar />)

    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })

  /**
   * A price list is written for somebody deciding whether to buy. Somebody who
   * already has is deciding whether to move up, and the entry has to say which
   * question it answers.
   */
  it('offers pricing to a visitor and an upgrade to a subscriber', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    noAdmin()
    const { unmount } = renderWithQuery(<Navbar />)

    expect(await screen.findAllByRole('link', { name: 'Pricing' })).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Upgrade' })).not.toBeInTheDocument()
    unmount()

    vi.spyOn(accounts, 'getMe').mockResolvedValue(PRO)
    renderWithQuery(<Navbar />)

    expect(await screen.findAllByRole('link', { name: 'Upgrade' })).not.toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument()
  })

  // There is no tier above Elite, so an invitation to move up would be a lie.
  it('offers an Elite subscriber nothing to upgrade to', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue({ ...PRO, tier: 'elite' })
    noAdmin()
    renderWithQuery(<Navbar />)

    expect(await screen.findByText('Elite')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Upgrade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument()
  })

  /**
   * Administration is a different identity from any StatPitch tier, so the entry
   * follows the portfolio session and nothing else — an Elite customer is not an
   * admin, and an admin need not be a customer at all.
   */
  it('shows the administration entry only to a portfolio session', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue({ ...PRO, tier: 'elite' })
    noAdmin()
    const { unmount } = renderWithQuery(<Navbar />)

    expect(await screen.findByText('Elite')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
    unmount()

    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    vi.spyOn(admin, 'getAdmin').mockResolvedValue(ADMIN)
    renderWithQuery(<Navbar />)

    expect(await screen.findAllByRole('link', { name: 'Admin' })).not.toHaveLength(0)
  })

  it('signs out on request', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(PRO)
    noAdmin()
    const signOut = vi.spyOn(accounts, 'logout').mockResolvedValue(null)
    renderWithQuery(<Navbar />)

    await user.click((await screen.findAllByRole('button', { name: /sign out/i }))[0])

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1))
  })
})
