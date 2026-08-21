import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApiKey, listApiKeys, revokeApiKey } from '../services/accounts'
import type { ApiKey } from '../types/account'

const KEYS_KEY = ['apiKeys'] as const
const EMPTY: ApiKey[] = []

/**
 * The keys this account has issued — never the secrets themselves.
 *
 * Listing is open to any signed-in account, not just Elite, which is
 * deliberate on the API's part: a subscription that lapses must still let its
 * owner see and revoke what it left behind. So a 402 here would be a bug, and
 * is surfaced rather than swallowed.
 */
export function useApiKeys() {
  const { data, isLoading, error } = useQuery({
    queryKey: KEYS_KEY,
    queryFn: ({ signal }) => listApiKeys(signal),
    retry: false,
  })

  return { keys: data ?? EMPTY, loading: isLoading, error }
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createApiKey(name),
    // The list is refreshed, but the secret in the returned object is not in
    // it and never will be — the caller has to show that one itself.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS_KEY }),
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => revokeApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS_KEY }),
  })
}
