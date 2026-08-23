import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveTrialRequest,
  declineTrialRequest,
  listTrialRequests,
  probeTrialRequests,
} from '../services/admin'
import type { TrialRequest, TrialRequestStatus } from '../types/admin'

const EMPTY: TrialRequest[] = []

/**
 * Whether this build of the API serves the trial queue at all.
 *
 * The queue is in the published contract but not in the deployed
 * `/openapi.json`, so the frontend cannot assume either way. A 404 is an answer
 * rather than a failure — it means "not on this build" — and the surface hides
 * itself rather than offering a page that would only ever error.
 */
export function useTrialRequestsAvailable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'trial-requests', 'available'],
    queryFn: ({ signal }) => probeTrialRequests(signal),
    // Endpoints do not appear mid-session; asking once per session is enough.
    staleTime: Infinity,
    retry: false,
  })

  return { available: data === true, loading: isLoading }
}

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
