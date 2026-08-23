import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminLogin, adminLogout, getAdmin } from '../services/admin'
import type { AdminCredentials, AdminUser } from '../types/admin'

/**
 * The portfolio admin session, kept in the query cache the way the customer
 * session is in `useAccount` — one source of truth, deduplicated, invalidatable
 * from anywhere.
 *
 * It is a separate key from `ACCOUNT_KEY` on purpose. Signing in as an admin
 * changes nothing about what the customer session is entitled to, and signing
 * out of one must not drop the other: the same browser can quite reasonably be
 * both the person running StatPitch and a subscriber to it.
 */
export const ADMIN_KEY = ['admin', 'session'] as const

export interface AdminSessionState {
  admin: AdminUser | null
  isAdmin: boolean
  /** True until the first `/auth/me` settles. Chrome that would flicker should wait. */
  loading: boolean
  error: unknown
}

export function useAdminSession(): AdminSessionState {
  const { data, isLoading, error } = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: ({ signal }) => getAdmin(signal),
    /**
     * Unlike `/accounts/me`, nothing about entitlement is read from here — it
     * answers one question, whether an admin session is open, and that does not
     * change under anybody mid-session. Holding it means the navbar and the gate
     * share one request instead of asking on every mount, and a token that does
     * go stale is refreshed by the 403 interceptor anyway.
     */
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const admin = data ?? null
  return { admin, isAdmin: admin !== null, loading: isLoading, error }
}

export function useAdminLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: AdminCredentials) => adminLogin(credentials),
    onSuccess: (admin) => queryClient.setQueryData(ADMIN_KEY, admin),
  })
}

/**
 * Ends the admin session and drops everything read with it. The customer cache
 * is untouched — nothing under `['admin', …]` was ever entitlement the reader's
 * own session decided.
 */
export function useAdminLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminLogout(),
    onSuccess: () => {
      // Everything admin except the session itself, which is written from here
      // rather than refetched only to be told it is gone.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] !== 'session',
      })
      queryClient.setQueryData(ADMIN_KEY, null)
    },
  })
}
