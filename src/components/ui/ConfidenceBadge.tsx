import { assess, BAND_STYLE } from '../../utils/confidence'
import type { Fixture } from '../../types/api'

interface ConfidenceBadgeProps {
  fixture: Fixture
  /**
   * Whether to say so when there is nothing wrong. Off in a list, where most
   * fixtures sit at medium until odds land and a badge on every card would
   * carry no information; on for a single fixture, where the band is itself
   * one of the things the reader came for.
   */
  showWhenClean?: boolean
}

/**
 * What this prediction is worth, on the face of the card — which is not the
 * same question as how one-sided the match is. A 0.95 built on a prior bands
 * low, not high, and only this says so.
 */
function ConfidenceBadge({ fixture, showWhenClean = false }: ConfidenceBadgeProps) {
  const assessment = assess(fixture)
  if (assessment === null) return null
  if (!assessment.notable && !showWhenClean) return null

  return (
    <span
      title={assessment.reasons.join(' ')}
      className={`eyebrow shrink-0 rounded-md border py-0.5 px-2 ${BAND_STYLE[assessment.band]}`}
    >
      {assessment.label}
    </span>
  )
}

export default ConfidenceBadge
