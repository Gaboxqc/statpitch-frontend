import { afterEach, describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  adminAuthApi,
  api,
  describeError,
  detailOf,
  isConflict,
  isPaymentRequired,
  isRateLimited,
  isUnauthenticated,
  isUnprocessable,
  predictionsRemaining,
  retryAfterSeconds,
} from './api'
import { getCsrfToken, setCsrfToken } from './session'
import { getAdminCsrfToken, setAdminCsrfToken } from './adminSession'

/** An error shaped the way axios shapes one, without going near the network. */
function apiError(
  status: number,
  { data, headers }: { data?: unknown; headers?: Record<string, string> } = {},
): AxiosError {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
  const response = {
    status,
    statusText: '',
    data,
    headers: headers ?? {},
    config,
  } as AxiosResponse
  return new AxiosError('Request failed', String(status), config, {}, response)
}

describe('status helpers', () => {
  it('names each status the UI has to branch on', () => {
    expect(isUnauthenticated(apiError(401))).toBe(true)
    expect(isPaymentRequired(apiError(402))).toBe(true)
    expect(isConflict(apiError(409))).toBe(true)
    expect(isUnprocessable(apiError(422))).toBe(true)
    expect(isRateLimited(apiError(429))).toBe(true)
  })

  // 401 and 402 are the pair most easily conflated, and they mean opposite
  // things: one is "sign in", the other is "you are signed in and it is paid".
  it('does not confuse being signed out with being on a free tier', () => {
    expect(isUnauthenticated(apiError(402))).toBe(false)
    expect(isPaymentRequired(apiError(401))).toBe(false)
  })

  it('ignores errors that never reached the API', () => {
    expect(isPaymentRequired(new Error('boom'))).toBe(false)
    expect(retryAfterSeconds(new Error('boom'))).toBe(null)
    expect(detailOf(new Error('boom'))).toBe(null)
  })
})

describe('retryAfterSeconds', () => {
  it('reads the header the API sends with a 429', () => {
    expect(retryAfterSeconds(apiError(429, { headers: { 'retry-after': '900' } }))).toBe(900)
  })

  it('is null when the header is missing or not a number', () => {
    expect(retryAfterSeconds(apiError(429))).toBe(null)
    expect(retryAfterSeconds(apiError(429, { headers: { 'retry-after': 'later' } }))).toBe(null)
  })
})

describe('detailOf', () => {
  it('takes the sentence the API wrote', () => {
    expect(detailOf(apiError(402, { data: { detail: 'This is a Pro feature.' } }))).toBe(
      'This is a Pro feature.',
    )
  })

  // FastAPI writes a list of objects for validation errors, which is not copy.
  it('refuses a detail that is not a sentence', () => {
    expect(detailOf(apiError(422, { data: { detail: [{ msg: 'too short' }] } }))).toBe(null)
    expect(detailOf(apiError(500, { data: 'Internal Server Error' }))).toBe(null)
  })
})

describe('describeError', () => {
  it('prefers the wording the API chose to anything invented here', () => {
    expect(
      describeError(apiError(409, { data: { detail: 'That email is already registered.' } })),
    ).toBe('That email is already registered.')
  })

  // The wait is the only part of a 429 the reader can act on, and the detail
  // the API sends does not carry it.
  it('turns a rate limit into a wait', () => {
    expect(describeError(apiError(429, { headers: { 'retry-after': '900' } }))).toContain(
      '15 minutes',
    )
    expect(describeError(apiError(429))).toContain('a few minutes')
  })

  it('still explains a cold start ahead of any status', () => {
    const timeout = new AxiosError('timeout', 'ECONNABORTED')
    expect(describeError(timeout)).toContain('wake up')
  })
})

describe('predictionsRemaining', () => {
  it('reads a count', () => {
    expect(predictionsRemaining({ 'x-predictions-remaining': '2' })).toBe(2)
    expect(predictionsRemaining({ 'x-predictions-remaining': '0' })).toBe(0)
  })

  it('reads the sentinel the paid tiers send', () => {
    expect(predictionsRemaining({ 'x-predictions-remaining': 'unlimited' })).toBe('unlimited')
  })

  // An unexposed header is indistinguishable from an absent one, and neither
  // means zero — zero is a real state that hides the prediction.
  it('is null when the header did not arrive', () => {
    expect(predictionsRemaining({})).toBe(null)
    expect(predictionsRemaining(undefined)).toBe(null)
    expect(predictionsRemaining({ 'x-predictions-remaining': 'soon' })).toBe(null)
  })
})

describe('the CSRF interceptors', () => {
  afterEach(() => {
    setCsrfToken(null)
    api.defaults.adapter = undefined
  })

  /** Answers each request from `replies`, recording the configs it saw. */
  function stubAdapter(replies: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>) {
    const seen: InternalAxiosRequestConfig[] = []
    const adapter: AxiosAdapter = (config) => {
      seen.push(config)
      return replies(config)
    }
    api.defaults.adapter = adapter
    return seen
  }

  const ok = (config: InternalAxiosRequestConfig, data: unknown = {}): Promise<AxiosResponse> =>
    Promise.resolve({ status: 200, statusText: 'OK', data, headers: {}, config } as AxiosResponse)

  const rejectWith = (status: number, config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
    Promise.reject(
      new AxiosError('Request failed', String(status), config, {}, {
        status,
        statusText: '',
        data: {},
        headers: {},
        config,
      } as AxiosResponse),
    )

  it('sends the token on unsafe methods only', async () => {
    setCsrfToken('token-1')
    const seen = stubAdapter((config) => ok(config))

    await api.get('/fixtures')
    await api.post('/accounts/trial')

    expect(seen[0].headers.get('X-CSRF-Token')).toBeUndefined()
    expect(seen[1].headers.get('X-CSRF-Token')).toBe('token-1')
  })

  it('sends nothing when no token has been issued', async () => {
    const seen = stubAdapter((config) => ok(config))
    await api.post('/accounts/trial')
    expect(seen[0].headers.get('X-CSRF-Token')).toBeUndefined()
  })

  // A stale token is recoverable, and the caller should never learn it happened.
  it('refreshes a stale token from /me and retries once', async () => {
    setCsrfToken('stale')
    let trialAttempts = 0
    const seen = stubAdapter((config) => {
      if (config.url === '/accounts/me') return ok(config, { csrf_token: 'fresh' })
      trialAttempts += 1
      return trialAttempts === 1 ? rejectWith(403, config) : ok(config, { granted: true })
    })

    const res = await api.post('/accounts/trial')

    expect(res.data).toEqual({ granted: true })
    expect(getCsrfToken()).toBe('fresh')
    expect(seen.map((config) => config.url)).toEqual([
      '/accounts/trial',
      '/accounts/me',
      '/accounts/trial',
    ])
    expect(seen[2].headers.get('X-CSRF-Token')).toBe('fresh')
  })

  it('gives up rather than looping when the retry fails too', async () => {
    setCsrfToken('stale')
    const seen = stubAdapter((config) =>
      config.url === '/accounts/me' ? ok(config, { csrf_token: 'fresh' }) : rejectWith(403, config),
    )

    await expect(api.post('/accounts/trial')).rejects.toMatchObject({ code: '403' })
    expect(seen.filter((config) => config.url === '/accounts/me')).toHaveLength(1)
  })

  // Without a session there is no token to refresh, so the 403 is the answer.
  it('surfaces the 403 when /me cannot reissue', async () => {
    setCsrfToken('stale')
    stubAdapter((config) =>
      config.url === '/accounts/me' ? rejectWith(401, config) : rejectWith(403, config),
    )

    await expect(api.post('/accounts/trial')).rejects.toMatchObject({ code: '403' })
  })

  it('drops the token when the session itself ends', async () => {
    setCsrfToken('token-1')
    stubAdapter((config) => rejectWith(401, config))

    await expect(api.get('/accounts/me')).rejects.toMatchObject({ code: '401' })
    expect(getCsrfToken()).toBe(null)
  })
})

/**
 * Two identities share this transport, and the whole point of separating them is
 * that neither can sign for the other. Types cannot catch a swap here — both
 * tokens are strings — so it is asserted.
 */
describe('the two sessions', () => {
  afterEach(() => {
    setCsrfToken(null)
    setAdminCsrfToken(null)
    api.defaults.adapter = undefined
    adminAuthApi.defaults.adapter = undefined
  })

  const ok = (config: InternalAxiosRequestConfig, data: unknown = {}): Promise<AxiosResponse> =>
    Promise.resolve({ status: 200, statusText: 'OK', data, headers: {}, config } as AxiosResponse)

  const failWith = (status: number, config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
    Promise.reject(
      new AxiosError('Request failed', String(status), config, {}, {
        status,
        statusText: '',
        data: {},
        headers: {},
        config,
      } as AxiosResponse),
    )

  function record(instance: typeof api) {
    const seen: InternalAxiosRequestConfig[] = []
    instance.defaults.adapter = (config) => {
      seen.push(config)
      return ok(config)
    }
    return seen
  }

  it('signs an admin route with the admin token and a customer route with the customer one', async () => {
    setCsrfToken('customer')
    setAdminCsrfToken('admin')
    const seen = record(api)

    await api.patch('/admin/accounts/1/tier', {})
    await api.post('/accounts/password', {})

    expect(seen[0].headers.get('X-CSRF-Token')).toBe('admin')
    expect(seen[1].headers.get('X-CSRF-Token')).toBe('customer')
  })

  // A customer with no admin session must not have their own token borrowed to
  // sign an admin write — it would be refused, and the 403 would say nothing.
  it('sends no token on an admin route when only a customer session exists', async () => {
    setCsrfToken('customer')
    const seen = record(api)

    await api.post('/admin/accounts', {})

    expect(seen[0].headers.get('X-CSRF-Token')).toBeUndefined()
  })

  it('drops only the session that ended', async () => {
    setCsrfToken('customer')
    setAdminCsrfToken('admin')
    api.defaults.adapter = (config) => failWith(401, config)

    await expect(api.get('/admin/accounts')).rejects.toMatchObject({ code: '401' })

    expect(getAdminCsrfToken()).toBe(null)
    expect(getCsrfToken()).toBe('customer')
  })

  it('refreshes a stale admin token from /auth/me rather than /accounts/me', async () => {
    setAdminCsrfToken('stale')
    let attempts = 0
    const seen: InternalAxiosRequestConfig[] = []
    api.defaults.adapter = (config) => {
      seen.push(config)
      attempts += 1
      return attempts === 1 ? failWith(403, config) : ok(config, { granted: true })
    }
    const auth = record(adminAuthApi)
    adminAuthApi.defaults.adapter = (config) => {
      auth.push(config)
      return ok(config, { csrf_token: 'fresh' })
    }

    const res = await api.patch('/admin/accounts/1/tier', {})

    expect(res.data).toEqual({ granted: true })
    expect(auth.map((config) => config.url)).toEqual(['/auth/me'])
    expect(getAdminCsrfToken()).toBe('fresh')
    expect(seen[1].headers.get('X-CSRF-Token')).toBe('fresh')
  })
})
