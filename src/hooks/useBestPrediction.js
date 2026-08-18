import { useQuery } from '@tanstack/react-query'
import { getBestPrediction } from '../services/bestPrediction.js'

const useBestPrediction = ({ offset = 0, limit = 10 } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bestPrediction', offset, limit],
    queryFn: ({ signal }) => getBestPrediction({ offset, limit }, signal),
  })

  return { prediction: data ?? null, loading: isLoading, error }
}

export default useBestPrediction
