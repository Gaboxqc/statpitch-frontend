import axios from 'axios'

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
})

const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined

/** Only `/fixtures/{id}` and `/fixtures/today/best` 404; both promise a single resource. */
export const isNotFound = (error: unknown): boolean => statusOf(error) === 404

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
  if (isUpstreamDown(error)) return 'The prediction service is unreachable right now.'
  if (isPricingUnavailable(error)) return 'Odds are unavailable, so nothing can be priced today.'
  if (statusOf(error) === 422) return 'That filter combination is not one the API accepts.'
  if (axios.isAxiosError(error) && !error.response)
    return 'No response from the API. Check your connection.'
  return error instanceof Error ? error.message : 'Something went wrong.'
}

/** The API sets `X-Total-Count` on `/fixtures` and `/ledger`, but not on the day routes. */
export function totalFromHeaders(headers: unknown, fallback: number): number {
  const raw = (headers as Record<string, unknown> | undefined)?.['x-total-count']
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}
