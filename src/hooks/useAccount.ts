import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  changePassword,
  getMe,
  login,
  logout,
  register,
  revokeAllSessions,
  startTrial,
} from '../services/accounts'
import { clearQuota } from '../services/quota'
import type { Account, Credentials, PasswordChange, Tier } from '../types/account'

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

/**
 * Fourteen days of Pro, once per account ever. The response is the account at
 * its new tier, so the cache is written from it and everything gated refetched
 * — the fixture list the reader was just looking at is a tier out of date the
 * moment this succeeds.
 */
export function useStartTrial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => startTrial(),
    onSuccess: (account) => resetEntitledData(queryClient, account),
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
