import { useEffect, useState } from 'react'

/**
 * True once `delayMs` has passed since mount. Used to explain a wait only when
 * there is actually a wait — the upstream prediction service sleeps, so the
 * first request of the day can cost tens of seconds, and a skeleton pulsing
 * silently that long reads as a hang rather than a cold start.
 *
 * Mount-based rather than driven by a loading flag: the hint is only ever read
 * inside a loading branch, which unmounts as soon as the data arrives.
 */
export function useElapsed(delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  return elapsed
}
