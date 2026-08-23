import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  changePassword,
  getMe,
  login,
  logout,
  register,
  getTrialRequest,
  requestTrial,
  revokeAllSessions,
} from '../services/accounts'
import { clearQuota } from '../services/quota'
import type { Account, Credentials, PasswordChange, Tier, TrialRequest } from '../types/account'

/**
 * The session lives in the query cache rather than in a context. There is one
 * source of truth either way, and this one already deduplicates the request,
 * survives remounting, and can be invalidated from anywhere.
 */
export const ACCOUNT_KEY = ['account'] as const

/**
 * Signing in or out changes the shape of every gated payload already cached —
 * a fixture list fetched anonymously holds teasers, and holding onto it would
 * show a paying subscriber the wall they just paid to clear. So everything
 * except the account itself is dropped; the account was just written from the
 * response and needs no round trip to confirm.
 */
function resetEntitledData(queryClient: QueryClient, account: Account | null): void {
  // The old count belonged to the old entitlement, and would otherwise sit
  // there claiming three unlocks to somebody who just subscribed.
  clearQuota()
  queryClient.setQueryData(ACCOUNT_KEY, account)
  void queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] !== ACCOUNT_KEY[0],
  })
}

export interface AccountState {
  account: Account | null
  /** The effective tier. Anonymous and free are both `free` — see `isSignedIn`. */
  tier: Tier
  isSignedIn: boolean
  isPro: boolean
  isElite: boolean
  /** True until the first `/me` settles. Chrome that would flicker should wait. */
  loading: boolean
  error: unknown
}

export function useAccount(): AccountState {
  const { data, isLoading, error } = useQuery({
    queryKey: ACCOUNT_KEY,
    queryFn: ({ signal }) => getMe(signal),
    /**
     * This is where an expiry, a started trial, or a tier granted by hand
     * becomes visible, so it is never served stale.
     */
    staleTime: 0,
  })

  const account = data ?? null
  const tier = account?.tier ?? 'free'

  return {
    account,
    tier,
    isSignedIn: account !== null,
    isPro: tier === 'pro' || tier === 'elite',
    isElite: tier === 'elite',
    loading: isLoading,
    error,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: Credentials) => login(credentials),
    onSuccess: (account) => resetEntitledData(queryClient, account),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: Credentials) => register(credentials),
    onSuccess: (account) => resetEntitledData(queryClient, account),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => resetEntitledData(queryClient, null),
  })
}

/** The key is separate from the account: a decision changes one without the other. */
export const TRIAL_REQUEST_KEY = ['trialRequest'] as const

/**
 * Where this account's trial request stands, or `null` if it has never asked.
 *
 * Read alongside the account rather than folded into it, because they answer
 * different questions — `trial_used` says a trial was once granted, this says
 * whether one is currently being considered.
 */
export function useTrialRequest(enabled = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: TRIAL_REQUEST_KEY,
    queryFn: ({ signal }) => getTrialRequest(signal),
    enabled,
    // An admin decision lands here without anything on this side happening.
    staleTime: 0,
  })

  return { request: (data ?? null) as TrialRequest | null, loading: enabled && isLoading, error }
}

/**
 * Asks for the trial. Grants **nothing** — an admin decides, so nothing about
 * this reader's entitlement changes on success and the fixture cache is left
 * alone. Only the request itself is written.
 */
export function useRequestTrial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message?: string) => requestTrial(message),
    onSuccess: (request) => {
      queryClient.setQueryData(TRIAL_REQUEST_KEY, request)
    },
  })
}

/**
 * Closes every other session and returns a fresh one for this tab, so the
 * reader stays signed in here. The new CSRF token rides in on the response and
 * is adopted by the service.
 */
export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: PasswordChange) => changePassword(change),
    onSuccess: (account) => {
      queryClient.setQueryData(ACCOUNT_KEY, account)
    },
  })
}

/** Signs out everywhere, this tab included — so it is a logout, not a setting. */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => revokeAllSessions(),
    onSuccess: () => resetEntitledData(queryClient, null),
  })
}
