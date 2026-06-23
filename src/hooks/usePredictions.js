import { useQuery } from '@tanstack/react-query'
import { getPredictions } from '../services/prections.js'

const usePredictions = ({ offset = 0, limit = 10 } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['predictions', offset, limit],
    queryFn: ({ signal }) => getPredictions({ offset, limit }, signal),
    retry: 2,
  })

  return { predictions: data ?? [], loading: isLoading, error: error?.message ?? null }
}

export default usePredictions
