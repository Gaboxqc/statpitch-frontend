import { useQuery } from '@tanstack/react-query'
import { getBestPrediction } from '../services/bestPrediction.js'

const useBestPrediction = ({ offset = 0, limit = 10 } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['prediction', offset, limit],
    queryFn: ({ signal }) => getBestPrediction({ offset, limit }, signal),
    retry: 2,
  })

  return { prediction: data ?? [], loading: isLoading, error: error?.message ?? null }
}

export default useBestPrediction
