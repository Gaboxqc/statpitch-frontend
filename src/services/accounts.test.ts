import { afterEach, describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { api } from './api'
import { getMe, login, logout, register, revokeAllSessions } from './accounts'
import { getCsrfToken, setCsrfToken } from './session'
import type { Account } from '../types/account'

const ACCOUNT: Account = {
  email: 'reader@example.com',
  tier: 'pro',
  tier_expires_at: '2026-09-03T00:00:00',
  trial_used: true,
  email_verified: false,
  last_login_at: '2026-08-20T18:02:11',
  csrf_token: 'issued-token',
}

afterEach(() => {
  setCsrfToken(null)
  api.defaults.adapter = undefined
})

/** Answers every request with `data` at `status`, recording what it saw. */
function stubAdapter(status: number, data: unknown) {
  const seen: InternalAxiosRequestConfig[] = []
  const adapter: AxiosAdapter = (config) => {
    seen.push(config)
    const response = { status, statusText: '', data, headers: {}, config } as AxiosResponse
    return status < 400
      ? Promise.resolve(response)
      : Promise.reject(new AxiosError('failed', String(status), config, {}, response))
  }
  api.defaults.adapter = adapter
  return seen
}

describe('the account routes', () => {
  // Every one of them returns a token, and the next unsafe request needs the
  // newest — a password change reissues it and invalidates what came before.
  it('adopt the token from whichever response carried it', async () => {
    stubAdapter(200, ACCOUNT)

    await login({ email: 'reader@example.com', password: 'a-long-enough-one' })
    expect(getCsrfToken()).toBe('issued-token')

    setCsrfToken(null)
    await register({ email: 'reader@example.com', password: 'a-long-enough-one' })
    expect(getCsrfToken()).toBe('issued-token')

    setCsrfToken(null)
    expect(await getMe()).toEqual(ACCOUNT)
    expect(getCsrfToken()).toBe('issued-token')
  })

  it('drop the token once the session is over', async () => {
    setCsrfToken('issued-token')
    stubAdapter(204, null)

    await logout()
    expect(getCsrfToken()).toBe(null)
  })

  // Revoking everywhere includes the tab that asked, so it ends this session too.
  it('treat revoking every session as a sign-out here as well', async () => {
    setCsrfToken('issued-token')
    stubAdapter(204, null)

    await revokeAllSessions()
    expect(getCsrfToken()).toBe(null)
  })
})

describe('getMe', () => {
  // Anonymous is a state the app renders, not a failure it reports.
  it('reads a missing session as nobody rather than an error', async () => {
    stubAdapter(401, { detail: 'Sign in to continue.' })
    expect(await getMe()).toBe(null)
  })

  it('still throws when the API is genuinely broken', async () => {
    stubAdapter(500, 'Internal Server Error')
    await expect(getMe()).rejects.toMatchObject({ code: '500' })
  })
})
