import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import PasswordForm from './PasswordForm'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as accounts from '../../services/accounts'
import type { Account } from '../../types/account'

const ACCOUNT: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'reissued-token',
}

const user = userEvent.setup({ delay: null })

afterEach(() => vi.restoreAllMocks())

const fill = async (current: string, next: string) => {
  await user.type(screen.getByLabelText(/current password/i), current)
  await user.type(screen.getByLabelText(/new password/i), next)
  await user.click(screen.getByRole('button', { name: /change password/i }))
}

describe('PasswordForm', () => {
  it('sends both passwords the API asks for', async () => {
    const change = vi.spyOn(accounts, 'changePassword').mockResolvedValue(ACCOUNT)
    renderWithQuery(<PasswordForm />)

    await fill('the-old-one-here', 'a-long-enough-one')

    await waitFor(() =>
      expect(change).toHaveBeenCalledWith({
        current_password: 'the-old-one-here',
        new_password: 'a-long-enough-one',
      }),
    )
  })

  // The API answers a short password with a 422, and the round trip tells the
  // reader nothing they could not be told first.
  it('refuses a short password without asking', async () => {
    const change = vi.spyOn(accounts, 'changePassword').mockResolvedValue(ACCOUNT)
    renderWithQuery(<PasswordForm />)

    await fill('the-old-one-here', 'short')

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 12 characters/i)
    expect(change).not.toHaveBeenCalled()
  })

  /**
   * Setting the password to what it already is would be accepted, and would
   * still close every other session — a surprising amount to happen in exchange
   * for nothing changing.
   */
  it('refuses a change that would change nothing', async () => {
    const change = vi.spyOn(accounts, 'changePassword').mockResolvedValue(ACCOUNT)
    renderWithQuery(<PasswordForm />)

    await fill('a-long-enough-one', 'a-long-enough-one')

    expect(await screen.findByRole('alert')).toHaveTextContent(/already your password/i)
    expect(change).not.toHaveBeenCalled()
  })

  // Somebody signed in on a phone is about to be signed out of it.
  it('warns that other sessions end before it happens', () => {
    renderWithQuery(<PasswordForm />)

    expect(screen.getByText(/signs you out on every other device/i)).toBeInTheDocument()
  })

  it('confirms afterwards and clears the fields', async () => {
    vi.spyOn(accounts, 'changePassword').mockResolvedValue(ACCOUNT)
    renderWithQuery(<PasswordForm />)

    await fill('the-old-one-here', 'a-long-enough-one')

    expect(await screen.findByRole('status')).toHaveTextContent(/password changed/i)
    expect(screen.getByLabelText(/current password/i)).toHaveValue('')
  })

  it('shows the API’s wording when the current password is wrong', async () => {
    const config = {} as InternalAxiosRequestConfig
    vi.spyOn(accounts, 'changePassword').mockRejectedValue(
      new AxiosError('failed', '422', config, {}, {
        status: 422,
        statusText: '',
        data: { detail: 'That is not your current password.' },
        headers: {},
        config,
      } as AxiosResponse),
    )
    renderWithQuery(<PasswordForm />)

    await fill('the-wrong-one-x', 'a-long-enough-one')

    expect(await screen.findByRole('alert')).toHaveTextContent('That is not your current password.')
  })
})
