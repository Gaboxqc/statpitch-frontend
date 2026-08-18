import { useQuery } from '@tanstack/react-query'
import { getStats } from '../services/stats.js'

const useStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => getStats(signal),
  })

  return { stats: data ?? {}, loading: isLoading, error }
}

export default useStats
