import { reliability } from '../../utils/reliability'
import type { ReliabilityLevel } from '../../utils/reliability'
import type { Fixture } from '../../types/api'

const STYLE: Record<ReliabilityLevel, string> = {
  measured: 'border-line text-ink-subtle',
  partial: 'border-chart-3/40 text-chart-3',
  fallback: 'border-negative/40 text-negative',
}

interface ReliabilityBadgeProps {
  fixture: Fixture
  /**
   * Whether to say so when there is nothing wrong. Off in a list, where a badge
   * on every card would say nothing; on for a single fixture, where the clean
   * bill of health is itself worth stating.
   */
  showWhenClean?: boolean
}

/**
 * How much this prediction is worth, on the face of the card. All three signals
 * behind it — a prior standing in for a measured Elo, an unrated club, the
 * weaker model having produced the numbers — used to be reachable only by
 * opening the disclosure, while the loudest element on the card was a ring
 * showing the top outcome's probability, which says nothing about any of them.
 */
function ReliabilityBadge({ fixture, showWhenClean = false }: ReliabilityBadgeProps) {
  const rated = reliability(fixture)
  if (rated === null) return null
  const { level, label, hint } = rated
  if (level === 'measured' && !showWhenClean) return null

  return (
    <span title={hint} className={`eyebrow shrink-0 rounded-md border py-0.5 px-2 ${STYLE[level]}`}>
      {label}
    </span>
  )
}

export default ReliabilityBadge
