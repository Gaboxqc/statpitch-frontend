import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveTrialRequest, declineTrialRequest, listTrialRequests } from '../services/admin'
import type { TrialRequestStatus } from '../types/account'
import type { AdminTrialRequest } from '../types/admin'

const EMPTY: AdminTrialRequest[] = []

export function useTrialRequests(status?: TrialRequestStatus) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'trial-requests', status ?? null],
    queryFn: ({ signal }) => listTrialRequests(status, signal),
    staleTime: 0,
  })

  return { requests: data ?? EMPTY, loading: isLoading, error }
}

function useQueueRefresh() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'admin' &&
        (query.queryKey[1] === 'trial-requests' || query.queryKey[1] === 'accounts'),
    })
  }
}

/** Grants Pro for fourteen days, so the account list is a tier out of date after it. */
export function useApproveTrialRequest() {
  const refresh = useQueueRefresh()
  return useMutation({ mutationFn: (id: number) => approveTrialRequest(id), onSuccess: refresh })
}

/** Grants nothing. The reason reaches the account, so it is written for them to read. */
export function useDeclineTrialRequest() {
  const refresh = useQueueRefresh()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => declineTrialRequest(id, reason),
    onSuccess: refresh,
  })
}
