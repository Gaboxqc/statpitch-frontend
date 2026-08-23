import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getCsrfToken, setCsrfToken } from './session'
import { getAdminCsrfToken, setAdminCsrfToken } from './adminSession'
import { setQuota } from './quota'

/**
 * The upstream prediction service runs on an instance that sleeps, and the API
 * gives it 60s of its own before giving up. A shorter timeout here would abort
 * a cold start that was going to succeed.
 */
export const REQUEST_TIMEOUT_MS = 65_000

/** How long a request may run before the UI starts explaining the wait. */
export const COLD_START_HINT_MS = 4_000

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  /**
   * Without this the session cookie never travels and every request reads as
   * anonymous — which looks like a broken tier rather than a broken fetch.
   */
  withCredentials: true,
})

/**
 * The portfolio's own auth routes live at the API root, outside the `/statpitch`
 * prefix everything else here shares — so they need their own instance rather
 * than a relative path climbing out of the base URL. This is the only place the
 * admin identity is established; the `/statpitch/admin/*` routes themselves ride
 * the instance above.
 */
export const adminAuthApi = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '').replace(/\/statpitch\/?$/, ''),
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
})

/** GET and HEAD are exempt from CSRF; everything else must echo the token back. */
const SAFE_METHODS = new Set(['get', 'head', 'options'])

const isSafe = (config: InternalAxiosRequestConfig): boolean =>
  SAFE_METHODS.has((config.method ?? 'get').toLowerCase())

/**
 * Which of the two sessions a request belongs to, decided by path because that
 * is what the server decides it by. `/admin/*` and `/auth/*` are the portfolio
 * admin; everything else is the StatPitch customer.
 */
const isAdminRoute = (config: InternalAxiosRequestConfig): boolean => {
  const url = config.url ?? ''
  return url.startsWith('/admin') || url.startsWith('/auth')
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set on requests that must not trigger CSRF recovery, or it would recurse. */
    skipCsrfRecovery?: boolean
  }
}

/**
 * The quota rides on every fixture response, including the one that spends it.
 * Recording it here means the counter is current whichever call last ran,
 * rather than only after the list happens to refetch.
 */
api.interceptors.response.use((response) => {
  const remaining = predictionsRemaining(response.headers)
  if (remaining !== null) setQuota(remaining)
  return response
})

/** The right token for the identity the path belongs to, and never the other one. */
function attachCsrf(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (isSafe(config)) return config
  const token = isAdminRoute(config) ? getAdminCsrfToken() : getCsrfToken()
  if (token !== null) config.headers.set('X-CSRF-Token', token)
  return config
}

api.interceptors.request.use(attachCsrf)
adminAuthApi.interceptors.request.use(attachCsrf)

/**
 * A 403 means the token is missing or stale, not that the session is gone —
 * a password change, for instance, issues a new one. The identity's own `me`
 * route reissues it, so the failure is recoverable once, silently, before the
 * caller ever sees it. A 401 is the opposite: the session itself is over, so
 * drop the token rather than replay it against the next session.
 */
function recoverCsrf(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error
    const status = error.response?.status
    const config = error.config

    // Which session ended is decided by the same rule that signed the request,
    // so a dead admin session never drops the customer's token or the reverse.
    const admin = config !== undefined && isAdminRoute(config)

    if (status === 401) {
      if (admin) setAdminCsrfToken(null)
      else setCsrfToken(null)
    }

    if (status !== 403 || config === undefined || config.skipCsrfRecovery === true) throw error

    config.skipCsrfRecovery = true
    const refreshed = admin
      ? await adminAuthApi
          .get<{ csrf_token?: string }>('/auth/me', { skipCsrfRecovery: true })
          .then((res) => res.data.csrf_token ?? null)
          .catch(() => null)
      : await api
          .get<{ csrf_token?: string }>('/accounts/me', { skipCsrfRecovery: true })
          .then((res) => res.data.csrf_token ?? null)
          .catch(() => null)

    if (refreshed === null) throw error
    if (admin) setAdminCsrfToken(refreshed)
    else setCsrfToken(refreshed)
    return instance.request(config)
  })
}

recoverCsrf(api)
recoverCsrf(adminAuthApi)

const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined

/**
 * Only `/fixtures/{id}` and `/fixtures/today/best` 404; both promise a single
 * resource. On `/fixtures/{id}` a 404 also covers a fixture outside the tier's
 * competitions — deliberately indistinguishable from one that never existed,
 * so it must never be rendered as an upsell.
 */
export const isNotFound = (error: unknown): boolean => statusOf(error) === 404

/** No session, or a revoked key. Not the same as being on the free tier. */
export const isUnauthenticated = (error: unknown): boolean => statusOf(error) === 401

/** The route itself is paid. Render the upgrade prompt in place of the panel. */
export const isPaymentRequired = (error: unknown): boolean => statusOf(error) === 402

/** Email already registered, or a trial already spent. */
export const isConflict = (error: unknown): boolean => statusOf(error) === 409

/** A field the API rejected — short password, malformed email, bad `basis`. */
export const isUnprocessable = (error: unknown): boolean => statusOf(error) === 422

/** Five failed logins per email or per IP in fifteen minutes. */
export const isRateLimited = (error: unknown): boolean => statusOf(error) === 429

/** The `Retry-After` the API sends with a 429, in seconds. Null when absent. */
export function retryAfterSeconds(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null
  const raw = error.response?.headers?.['retry-after']
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * The API writes its own `detail` for every 4xx, in the second person and
 * already fit to show. Prefer it over anything invented here — it is the only
 * copy that knows which field was wrong.
 */
export function detailOf(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null
  const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
  return typeof detail === 'string' ? detail : null
}

/**
 * 503 means the odds provider is unreachable or out of quota. Predictions are
 * unaffected — this is the same partial state as an unpriced fixture, not a
 * failure of the page.
 */
export const isPricingUnavailable = (error: unknown): boolean => statusOf(error) === 503

/** 502 means StatPitch itself is unreachable, or refused with a reason code. */
export const isUpstreamDown = (error: unknown): boolean => statusOf(error) === 502

export const isTimeout = (error: unknown): boolean =>
  axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')

/**
 * Error copy the user can act on. The API distinguishes a dead upstream from an
 * exhausted odds quota, so the UI should too rather than saying "failed" twice.
 */
export function describeError(error: unknown): string {
  if (isTimeout(error)) return 'The prediction service took too long to wake up. Try again shortly.'
  if (isRateLimited(error)) {
    const wait = retryAfterSeconds(error)
    return wait === null
      ? 'Too many attempts. Wait a few minutes and try again.'
      : `Too many attempts. Try again in ${Math.ceil(wait / 60)} minutes.`
  }
  const detail = detailOf(error)
  if (detail !== null) return detail
  if (isUpstreamDown(error)) return 'The prediction service is unreachable right now.'
  if (isPricingUnavailable(error)) return 'Odds are unavailable, so nothing can be priced today.'
  if (statusOf(error) === 422) return 'That filter combination is not one the API accepts.'
  if (axios.isAxiosError(error) && !error.response)
    return 'No response from the API. Check your connection.'
  return error instanceof Error ? error.message : 'Something went wrong.'
}

/**
 * How many free-tier unlocks are left today, from the header every fixture
 * response carries. `'unlimited'` on a paid tier, and null only if the header
 * did not survive CORS — it is not exposed by default, and an unexposed header
 * is invisible to the browser however plainly it arrived over the wire.
 */
export function predictionsRemaining(headers: unknown): number | 'unlimited' | null {
  const raw = (headers as Record<string, unknown> | undefined)?.['x-predictions-remaining']
  if (raw === undefined || raw === null) return null
  if (String(raw).trim() === 'unlimited') return 'unlimited'
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

/** Drops undefined entries so an unset filter is absent rather than the string "undefined". */
export function queryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** The API sets `X-Total-Count` on `/fixtures` and `/ledger`, but not on the day routes. */
export function totalFromHeaders(headers: unknown, fallback: number): number {
  const raw = (headers as Record<string, unknown> | undefined)?.['x-total-count']
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}
