import { api, isNotFound } from './api'

export const getPredictions = ({ offset = 0, limit = 10 } = {}, signal) => {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  return api
    .get(`/today?${params}`, { signal })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return []
      throw error
    })
}
