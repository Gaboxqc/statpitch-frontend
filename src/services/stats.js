import { api } from './api'

// Unlike /today, a 404 here means the route is missing, not that there is no data.
// It is surfaced as an error; the summary bar degrades to placeholders on its own.
export const getStats = (signal) => {
  return api.get(`/stats`, { signal }).then((res) => res.data)
}
