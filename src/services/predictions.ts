import { api, isNotFound } from './api'
import type { Pagination, Prediction, Stats } from '../types/api'

const paginationParams = ({ offset = 0, limit = 10 }: Pagination = {}) =>
  new URLSearchParams({ offset: String(offset), limit: String(limit) })

/** A 404 here means there are no fixtures today, which is an empty state. */
export const getPredictions = (
  pagination?: Pagination,
  signal?: AbortSignal,
): Promise<Prediction[]> =>
  api
    .get<Prediction[]>(`/today?${paginationParams(pagination)}`, { signal })
    .then((res) => res.data)
    .catch((error: unknown) => {
      if (isNotFound(error)) return []
      throw error
    })

export const getBestPrediction = (
  pagination?: Pagination,
  signal?: AbortSignal,
): Promise<Prediction | null> =>
  api
    .get<Prediction>(`/today/best?${paginationParams(pagination)}`, { signal })
    .then((res) => res.data)
    .catch((error: unknown) => {
      if (isNotFound(error)) return null
      throw error
    })

/** Unlike the fixture endpoints, a 404 here means the route is missing, so it surfaces as an error. */
export const getStats = (signal?: AbortSignal): Promise<Stats> =>
  api.get<Stats>(`/stats`, { signal }).then((res) => res.data)
