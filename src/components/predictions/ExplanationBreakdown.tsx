import { featureLabel } from '../../utils/humanise'
import { formatDecimal } from '../../utils/format'
import { displayName } from '../../utils/teamName'
import type { Explanation, FeatureContribution } from '../../types/api'

/** Bars diverge from a centre line, so each half can use at most half the width. */
const HALF_WIDTH = 50

/**
 * A contribution too small to draw is still not nothing, and a bar of zero width
 * reads as a missing row rather than a negligible one.
 */
const MIN_WIDTH = 0.6

function ContributionRow({ row, scale }: { row: FeatureContribution; scale: number }) {
  const positive = row.contribution >= 0
  const width = Math.max((Math.abs(row.contribution) / scale) * HALF_WIDTH, MIN_WIDTH)

  return (
    <li className={'flex items-center gap-2 text-xs'}>
      <span className={'w-32 shrink-0 text-ink-muted truncate'} title={row.feature}>
        {featureLabel(row.feature)}
      </span>

      <span className={'relative flex-1 h-3 min-w-16'}>
        {/* Only the outer end is rounded. A pill rounded at both ends pulls away
            from the zero line it is measured from, which reads as a bar that
            starts somewhere other than zero — the one thing a divergence chart
            must not say. It grows out of the line, flush against it. */}
        <span
          className={`absolute inset-y-0.5 ${positive ? 'rounded-r-full' : 'rounded-l-full'} ${positive ? 'bg-primary/60' : 'bg-chart-5/60'}`}
          style={
            positive ? { left: '50%', width: `${width}%` } : { right: '50%', width: `${width}%` }
          }
        />
        {/* The zero line is the competition's own goal environment. Painted last
            so the flat edge of every bar reads against it. */}
        <span className={'absolute inset-y-0 left-1/2 w-px bg-line-strong'} />
      </span>

      <span
        className={`numeric w-14 shrink-0 text-right ${positive ? 'text-primary' : 'text-negative'}`}
      >
        &times;{formatDecimal(row.multiplier)}
      </span>
    </li>
  )
}

function TeamColumn({
  team,
  rows,
  scale,
}: {
  team: string
  rows: FeatureContribution[]
  scale: number
}) {
  return (
    <div className={'flex flex-col gap-2 min-w-0'}>
      <h4 className={'text-xs font-medium text-ink truncate'} title={team}>
        {displayName(team)}
      </h4>
      <ul className={'flex flex-col gap-1'}>
        {rows.map((row) => (
          <ContributionRow key={row.feature} row={row} scale={scale} />
        ))}
      </ul>
    </div>
  )
}

interface ExplanationBreakdownProps {
  explanation: Explanation | null
  homeTeam: string
  awayTeam: string
}

/**
 * What actually moved each side's goal rate. The API returns per-feature
 * attributions rather than prose, so this is the model's own account of the
 * prediction — the one part of the payload that answers "why".
 */
function ExplanationBreakdown({ explanation, homeTeam, awayTeam }: ExplanationBreakdownProps) {
  if (!explanation) return null

  const byImpact = (rows: FeatureContribution[]) =>
    [...rows].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

  const home = byImpact(explanation.home ?? [])
  const away = byImpact(explanation.away ?? [])
  if (home.length === 0 && away.length === 0) return null

  // One scale across both sides, so a bar on the left means the same as a bar
  // on the right. Guarded against an all-zero payload.
  const scale =
    Math.max(...[...home, ...away].map((row) => Math.abs(row.contribution)), Number.EPSILON) ||
    Number.EPSILON

  return (
    <section className={'flex flex-col gap-3 w-full'}>
      <h3 className={'eyebrow text-ink-subtle'}>What drove this prediction</h3>

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4'}>
        <TeamColumn team={homeTeam} rows={home} scale={scale} />
        <TeamColumn team={awayTeam} rows={away} scale={scale} />
      </div>

      {explanation.units && <p className={'text-xs text-ink-subtle'}>{explanation.units}</p>}
    </section>
  )
}

export default ExplanationBreakdown
