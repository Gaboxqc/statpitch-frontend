import { useQuery } from '@tanstack/react-query'
import { getBestPrediction, getPredictions, getStats } from '../services/predictions'
import type { Pagination, Prediction, Stats } from '../types/api'

export function usePredictions({ offset = 0, limit = 10 }: Pagination = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['predictions', offset, limit],
    queryFn: ({ signal }) => getPredictions({ offset, limit }, signal),
  })

  return { predictions: data ?? ([] as Prediction[]), loading: isLoading, error }
}

export function useBestPrediction({ offset = 0, limit = 10 }: Pagination = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bestPrediction', offset, limit],
    queryFn: ({ signal }) => getBestPrediction({ offset, limit }, signal),
  })

  return { prediction: data ?? null, loading: isLoading, error }
}

export function useStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => getStats(signal),
  })

  return { stats: (data ?? {}) as Partial<Stats>, loading: isLoading, error }
}
