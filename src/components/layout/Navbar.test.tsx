import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as accounts from '../../services/accounts'
import type { Account } from '../../types/account'

const PRO: Account = {
  email: 'reader@example.com',
  tier: 'pro',
  tier_expires_at: '2026-09-03T00:00:00',
  trial_used: true,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

const user = userEvent.setup({ delay: null })

afterEach(() => vi.restoreAllMocks())

describe('Navbar', () => {
  it('invites a visitor with no session to sign in', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    renderWithQuery(<Navbar />)

    expect(await screen.findByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /get started/i })).not.toHaveLength(0)
  })

  it('names the tier and offers the way out once signed in', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(PRO)
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
    renderWithQuery(<Navbar />)

    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })

  it('signs out on request', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(PRO)
    const signOut = vi.spyOn(accounts, 'logout').mockResolvedValue(null)
    renderWithQuery(<Navbar />)

    await user.click((await screen.findAllByRole('button', { name: /sign out/i }))[0])

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1))
  })
})
