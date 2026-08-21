import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import LoginPage from './LoginPage'
import { renderWithQuery } from '../test/renderWithQuery'
import * as accounts from '../services/accounts'
import * as predictions from '../services/predictions'
import type { Account } from '../types/account'

const ACCOUNT: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

/** Signed out, and the marketing ROI panel silenced — neither is under test. */
function mockAnonymous() {
  vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
  vi.spyOn(predictions, 'getStats').mockRejectedValue(new Error('not for this test'))
}

function apiError(status: number, detail: string): AxiosError {
  const config = {} as InternalAxiosRequestConfig
  return new AxiosError('failed', String(status), config, {}, {
    status,
    statusText: '',
    data: { detail },
    headers: {},
    config,
  } as AxiosResponse)
}

/**
 * The toggle and the submit button deliberately share a label — one switches
 * sides, the other sends the form — so every query says which it means.
 */
const toggle = (name: RegExp) =>
  within(screen.getByRole('group', { name: /authentication mode/i })).getByRole('button', { name })

const submit = (container: HTMLElement, name: RegExp) =>
  within(container.querySelector('form') as HTMLElement).getByRole('button', { name })

/**
 * No inter-keystroke delay. The default is realistic typing, which on a form
 * this size costs seconds per test and buys nothing being asserted here.
 */
const user = userEvent.setup({ delay: null })

afterEach(() => vi.restoreAllMocks())

describe('LoginPage', () => {
  it('signs in with what was typed', async () => {
    mockAnonymous()
    const signIn = vi.spyOn(accounts, 'login').mockResolvedValue(ACCOUNT)
    const { container } = renderWithQuery(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'reader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'a-long-enough-one')
    await user.click(submit(container, /sign in/i))

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({
        email: 'reader@example.com',
        password: 'a-long-enough-one',
      }),
    )
  })

  it('registers instead when that side of the toggle is open', async () => {
    mockAnonymous()
    const signUp = vi.spyOn(accounts, 'register').mockResolvedValue(ACCOUNT)
    const { container } = renderWithQuery(<LoginPage />, { route: '/login?new=1' })

    await user.type(screen.getByLabelText(/email/i), 'reader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'a-long-enough-one')
    await user.click(submit(container, /create account/i))

    await waitFor(() => expect(signUp).toHaveBeenCalledTimes(1))
  })

  // The API answers a short password with a 422, and the round trip tells the
  // reader nothing they could not be told before it.
  it('refuses a short password without asking the API', async () => {
    mockAnonymous()
    const signUp = vi.spyOn(accounts, 'register').mockResolvedValue(ACCOUNT)
    const { container } = renderWithQuery(<LoginPage />, { route: '/login?new=1' })

    await user.type(screen.getByLabelText(/email/i), 'reader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'short')
    await user.click(submit(container, /create account/i))

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 12 characters/i)
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows the API’s own wording when it refuses', async () => {
    mockAnonymous()
    vi.spyOn(accounts, 'register').mockRejectedValue(
      apiError(409, 'That email is already registered.'),
    )
    const { container } = renderWithQuery(<LoginPage />, { route: '/login?new=1' })

    await user.type(screen.getByLabelText(/email/i), 'reader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'a-long-enough-one')
    await user.click(submit(container, /create account/i))

    expect(await screen.findByRole('alert')).toHaveTextContent('That email is already registered.')
  })

  // A complaint about the other side of the toggle is not about this form.
  it('drops the error when the toggle moves', async () => {
    mockAnonymous()
    vi.spyOn(accounts, 'register').mockRejectedValue(
      apiError(409, 'That email is already registered.'),
    )
    const { container } = renderWithQuery(<LoginPage />, { route: '/login?new=1' })

    await user.type(screen.getByLabelText(/email/i), 'reader@example.com')
    await user.type(screen.getByLabelText(/password/i), 'a-long-enough-one')
    await user.click(submit(container, /create account/i))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.click(toggle(/sign in/i))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('offers no field the API has nowhere to put', async () => {
    mockAnonymous()
    renderWithQuery(<LoginPage />, { route: '/login?new=1' })

    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
  })

  // An enabled control that quietly does nothing reads as a bug.
  it('disables the sign-in methods the backend does not have', async () => {
    mockAnonymous()
    renderWithQuery(<LoginPage />)

    expect(screen.getByRole('button', { name: /google/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /github/i })).toBeDisabled()
  })
})
