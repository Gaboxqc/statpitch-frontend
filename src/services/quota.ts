/**
 * How many free-tier unlocks are left today.
 *
 * Every fixture response carries the count, so rather than threading it back
 * through each query it is recorded here as responses land and read with
 * `useSyncExternalStore`. That matters because the endpoint that *spends* an
 * unlock — opening a single fixture — is not the one the counter is rendered
 * beside, and a value passed through the list query would be a step behind from
 * the moment the reader opened anything.
 *
 * `null` means the count is unknown, which is not zero. Zero is a real state
 * that withholds the next prediction; unknown is what a header that never
 * arrived looks like, and nothing should be rendered from it.
 */
export type Quota = number | 'unlimited' | null

let remaining: Quota = null
const listeners = new Set<() => void>()

export const getQuota = (): Quota => remaining

export function setQuota(next: Quota): void {
  if (next === remaining) return
  remaining = next
  for (const listener of listeners) listener()
}

export function subscribeToQuota(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Signing in or out changes the entitlement, so the old count means nothing. */
export const clearQuota = (): void => setQuota(null)
