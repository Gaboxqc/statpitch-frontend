import { useSyncExternalStore } from 'react'
import { getQuota, subscribeToQuota } from '../services/quota'
import type { Quota } from '../services/quota'

/**
 * Unlocks left today, as last reported by the API. Null until a fixture
 * response has been seen — and null in production until the API adds
 * `X-Predictions-Remaining` to its CORS `expose_headers`, because a header the
 * browser is not allowed to read is indistinguishable from one never sent.
 */
export function useQuota(): Quota {
  return useSyncExternalStore(subscribeToQuota, getQuota, getQuota)
}
