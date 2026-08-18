import { api, isNotFound } from './api'

const paginationParams = ({ offset = 0, limit = 10 } = {}) =>
  new URLSearchParams({ offset: String(offset), limit: String(limit) })

/** A 404 here means there are no fixtures today, which is an empty state. */
export const getPredictions = (pagination, signal) =>
  api
    .get(`/today?${paginationParams(pagination)}`, { signal })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return []
      throw error
    })

export const getBestPrediction = (pagination, signal) =>
  api
    .get(`/today/best?${paginationParams(pagination)}`, { signal })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return null
      throw error
    })

/** Unlike the fixture endpoints, a 404 here means the route is missing, so it surfaces as an error. */
export const getStats = (signal) => api.get(`/stats`, { signal }).then((res) => res.data)
