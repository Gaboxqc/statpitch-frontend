import { useQuery } from '@tanstack/react-query'
import { getPredictions } from '../services/predictions.js'

const usePredictions = ({ offset = 0, limit = 10 } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['predictions', offset, limit],
    queryFn: ({ signal }) => getPredictions({ offset, limit }, signal),
  })

  return { predictions: data ?? [], loading: isLoading, error }
}

export default usePredictions
