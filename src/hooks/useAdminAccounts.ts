import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  createAccount,
  deleteAccount,
  getAccount,
  grantTier,
  listAccountKeys,
  listAccounts,
  listGrants,
  listSessions,
  resetTrial,
  revokeAllSessions,
  revokeKey,
  setAccountActive,
} from '../services/admin'
import type { AdminAccount, AdminAccountQuery, TierGrantRequest } from '../types/admin'
import type { ApiKey } from '../types/account'
import type { AdminSession, TierGrant } from '../types/admin'

const EMPTY_ACCOUNTS: AdminAccount[] = []
const EMPTY_GRANTS: TierGrant[] = []
const EMPTY_SESSIONS: AdminSession[] = []
const EMPTY_KEYS: ApiKey[] = []

/**
 * Every key here starts with `admin`, so invalidating after a write can be
 * scoped to this subtree. `resetEntitledData` in `useAccount` is the opposite
 * tool — it drops everything a tier change could have altered — and reusing it
 * would blow away the reader's own fixture cache because somebody else's account
 * was edited.
 */
const accountKey = (id: number) => ['admin', 'account', id] as const

/** One account's row, and everything hanging off it, after a write to it. */
function refreshAccount(queryClient: QueryClient, id: number): void {
  void queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === 'admin' &&
      (query.queryKey[1] === 'accounts' ||
        (query.queryKey[2] === id && query.queryKey[1] !== 'session')),
  })
}

export function useAdminAccounts(query: AdminAccountQuery = {}) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      'admin',
      'accounts',
      query.tier ?? null,
      query.email ?? null,
      query.is_active ?? null,
      query.offset ?? 0,
      query.limit ?? 25,
    ],
    queryFn: ({ signal }) => listAccounts(query, signal),
    // A list held stale would show a tier somebody else just changed.
    staleTime: 0,
    // Paging should not blank the table it is paging.
    placeholderData: (previous) => previous,
  })

  return {
    accounts: data?.items ?? EMPTY_ACCOUNTS,
    total: data?.total ?? 0,
    loading: isLoading,
    fetching: isFetching,
    error,
  }
}

export function useAdminAccount(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: accountKey(id as number),
    queryFn: ({ signal }) => getAccount(id as number, signal),
    enabled: id !== null,
    staleTime: 0,
  })

  return { account: data ?? null, loading: isLoading, error }
}

export function useAdminGrants(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'grants', id],
    queryFn: ({ signal }) => listGrants(id as number, signal),
    enabled: id !== null,
  })

  return { grants: data ?? EMPTY_GRANTS, loading: isLoading, error }
}

export function useAdminSessions(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sessions', id],
    queryFn: ({ signal }) => listSessions(id as number, signal),
    enabled: id !== null,
  })

  return { sessions: data ?? EMPTY_SESSIONS, loading: isLoading, error }
}

export function useAdminKeys(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'keys', id],
    queryFn: ({ signal }) => listAccountKeys(id as number, signal),
    enabled: id !== null,
  })

  return { keys: data ?? EMPTY_KEYS, loading: isLoading, error }
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => createAccount(email),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'accounts',
      })
    },
  })
}

/**
 * A tier change is the one write with a required reason, and the history below
 * it is the record of every one — so both refresh together or the panel would
 * show a new tier above a history that does not mention it.
 */
export function useGrantTier(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (grant: TierGrantRequest) => grantTier(id, grant),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKey(id), account)
      refreshAccount(queryClient, id)
    },
  })
}

/** Disabling closes every live session, so the session list is stale the moment it lands. */
export function useSetAccountActive(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (is_active: boolean) => setAccountActive(id, is_active),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKey(id), account)
      refreshAccount(queryClient, id)
    },
  })
}

export function useResetTrial(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => resetTrial(id),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKey(id), account)
      refreshAccount(queryClient, id)
    },
  })
}

export function useRevokeAccountSessions(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => revokeAllSessions(id),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKey(id), account)
      refreshAccount(queryClient, id)
    },
  })
}

export function useRevokeAccountKey(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keyId: number) => revokeKey(keyId),
    onSuccess: () => refreshAccount(queryClient, id),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'accounts',
      })
    },
  })
}
