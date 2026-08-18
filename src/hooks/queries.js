import { useQuery } from '@tanstack/react-query'
import { getBestPrediction, getPredictions, getStats } from '../services/predictions.js'

export function usePredictions({ offset = 0, limit = 10 } = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['predictions', offset, limit],
    queryFn: ({ signal }) => getPredictions({ offset, limit }, signal),
  })

  return { predictions: data ?? [], loading: isLoading, error }
}

export function useBestPrediction({ offset = 0, limit = 10 } = {}) {
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

  return { stats: data ?? {}, loading: isLoading, error }
}
