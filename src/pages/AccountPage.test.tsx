import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import AccountPage from './AccountPage'
import { renderWithQuery } from '../test/renderWithQuery'
import * as accounts from '../services/accounts'
import { setQuota } from '../services/quota'
import { formatLongDate } from '../utils/datetime'
import type { Account, TrialRequest } from '../types/account'

const FREE: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

const PRO: Account = { ...FREE, tier: 'pro', tier_expires_at: '2027-03-03T00:00:00' }
const ELITE: Account = { ...FREE, tier: 'elite', trial_used: true }

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

const user = userEvent.setup({ delay: null })

const REQUEST: TrialRequest = {
  id: 1,
  status: 'pending',
  message: null,
  requested_at: '2026-08-20T09:00:00',
  decided_at: null,
  decision_reason: null,
}

function signedInAs(account: Account | null, request: TrialRequest | null = null) {
  vi.spyOn(accounts, 'getMe').mockResolvedValue(account)
  vi.spyOn(accounts, 'listApiKeys').mockResolvedValue([])
  vi.spyOn(accounts, 'getTrialRequest').mockResolvedValue(request)
}

afterEach(() => {
  vi.restoreAllMocks()
  setQuota(null)
})

describe('the plan', () => {
  it('names the tier and when it runs out', async () => {
    signedInAs(PRO)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText('Pro')).toBeInTheDocument()
    expect(screen.getByText(formatLongDate(PRO.tier_expires_at))).toBeInTheDocument()
  })

  /**
   * `tier` is the effective tier, so a lapsed subscription already reads free.
   * The date is then a past event and must not be phrased as a future one.
   */
  it('reads a past expiry as expired rather than as a promise', async () => {
    signedInAs({ ...FREE, tier_expires_at: '2026-01-09T00:00:00' })
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/expired on/i)).toBeInTheDocument()
    expect(screen.queryByText(/free until/i)).not.toBeInTheDocument()
  })

  /**
   * Asking is not taking. The button says "request" because pressing it changes
   * nothing about what the reader can see until somebody approves it.
   */
  it('offers to request the trial for an account that has never had one', async () => {
    signedInAs(FREE)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByRole('button', { name: /request 14-day trial/i })).toBeInTheDocument()
  })

  it('withdraws the offer once a trial has been granted', async () => {
    signedInAs({ ...FREE, trial_used: true })
    renderWithQuery(<AccountPage />)

    await screen.findByText(/trial has been used/i)
    expect(screen.queryByRole('button', { name: /request 14-day/i })).not.toBeInTheDocument()
  })

  // A request already with an administrator is not something to send again.
  it('reports a request that is still being reviewed instead of offering another', async () => {
    signedInAs(FREE, REQUEST)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/awaiting review/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /request 14-day/i })).not.toBeInTheDocument()
  })

  // Asking again without knowing why the last one failed is just guessing.
  it('shows why a request was declined, and lets them ask again', async () => {
    signedInAs(FREE, {
      ...REQUEST,
      status: 'declined',
      decided_at: '2026-08-21T09:00:00',
      decision_reason: 'Ask again once the season is under way.',
    })
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/ask again once the season/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request again/i })).toBeInTheDocument()
  })

  it('sends the note along with the request', async () => {
    signedInAs(FREE)
    const ask = vi.spyOn(accounts, 'requestTrial').mockResolvedValue(REQUEST)
    renderWithQuery(<AccountPage />)

    await user.type(await screen.findByRole('textbox', { name: /anything to add/i }), 'Testing it')
    await user.click(screen.getByRole('button', { name: /request 14-day trial/i }))

    await waitFor(() => expect(ask).toHaveBeenCalledWith('Testing it'))
  })

  it('shows the API’s own refusal if the request is rejected', async () => {
    signedInAs(FREE)
    vi.spyOn(accounts, 'requestTrial').mockRejectedValue(
      apiError(409, 'This account has already used its trial.'),
    )
    renderWithQuery(<AccountPage />)

    await user.click(await screen.findByRole('button', { name: /request 14-day trial/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This account has already used its trial.',
    )
  })

  it('counts down the free tier’s remaining unlocks', async () => {
    signedInAs(FREE)
    setQuota(2)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/predictions left today/i)).toBeInTheDocument()
  })
})

describe('signing out everywhere', () => {
  // It ends this session too, which is a surprise worth confirming first.
  it('confirms before ending every session', async () => {
    signedInAs(PRO)
    const revoke = vi.spyOn(accounts, 'revokeAllSessions').mockResolvedValue(null)
    renderWithQuery(<AccountPage />)

    await user.click(await screen.findByRole('button', { name: /^sign out everywhere$/i }))
    expect(revoke).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /yes, sign out everywhere/i }))
    await waitFor(() => expect(revoke).toHaveBeenCalledTimes(1))
  })
})

describe('API keys', () => {
  it('lets Elite issue one', async () => {
    signedInAs(ELITE)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByRole('button', { name: /issue key/i })).toBeInTheDocument()
  })

  /**
   * Listing and revoking stay open at every tier on purpose: a subscription
   * that lapses must still let its owner turn off what it left behind.
   */
  it('explains the limit below Elite without hiding the list', async () => {
    signedInAs(PRO)
    vi.spyOn(accounts, 'listApiKeys').mockResolvedValue([
      {
        id: 1,
        name: 'Old laptop',
        prefix: 'sp_live_7f3a',
        created_at: '2026-05-02T00:00:00',
        last_used_at: null,
        revoked: false,
      },
    ])
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/issuing keys is part of elite/i)).toBeInTheDocument()
    // The copy above is static; the list is not, so it has to be awaited.
    expect(await screen.findByText('Old laptop')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /issue key/i })).not.toBeInTheDocument()
  })

  // Nothing stores the raw key, so this is the only time it can ever be read.
  it('shows a new secret once and says it will not return', async () => {
    signedInAs(ELITE)
    vi.spyOn(accounts, 'createApiKey').mockResolvedValue({
      id: 2,
      name: 'Cron',
      prefix: 'sp_live_9c21',
      created_at: '2026-08-21T00:00:00',
      last_used_at: null,
      revoked: false,
      key: 'sp_live_9c21_the_only_time_you_see_this',
    })
    renderWithQuery(<AccountPage />)

    await user.type(await screen.findByLabelText(/name/i), 'Cron')
    await user.click(screen.getByRole('button', { name: /issue key/i }))

    expect(await screen.findByText('sp_live_9c21_the_only_time_you_see_this')).toBeInTheDocument()
    expect(screen.getByText(/cannot be shown again/i)).toBeInTheDocument()
  })

  it('distinguishes a key never used from one used long ago', async () => {
    signedInAs(ELITE)
    vi.spyOn(accounts, 'listApiKeys').mockResolvedValue([
      {
        id: 1,
        name: 'Never',
        prefix: 'sp_live_aaaa',
        created_at: '2026-05-02T00:00:00',
        last_used_at: null,
        revoked: false,
      },
    ])
    renderWithQuery(<AccountPage />)

    expect(await screen.findByText(/never used/i)).toBeInTheDocument()
  })
})

describe('arriving without a session', () => {
  it('asks the reader to sign in rather than showing an empty plan', async () => {
    signedInAs(null)
    renderWithQuery(<AccountPage />)

    expect(await screen.findByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByText(/change password/i)).not.toBeInTheDocument()
  })
})
