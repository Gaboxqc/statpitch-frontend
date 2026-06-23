import { api } from './api'

export const getBestPrediction = ({ offset = 0, limit = 10 } = {}, signal) => {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  return api.get(`/today/best?${params}`, { signal }).then((res) => res.data)
}
