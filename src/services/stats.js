import { api } from './api'

export const getStats = (signal) => {
  return api.get(`/stats`, { signal }).then((res) => res.data)
}
