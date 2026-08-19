import { featureLabel } from '../../utils/humanise'
import { formatDecimal } from '../../utils/format'
import type { Explanation, FeatureContribution } from '../../types/api'

/** Bars diverge from a centre line, so each half can use at most half the width. */
const HALF_WIDTH = 50

function ContributionRow({ row, scale }: { row: FeatureContribution; scale: number }) {
  const positive = row.contribution >= 0
  const width = (Math.abs(row.contribution) / scale) * HALF_WIDTH

  return (
    <li className={'flex items-center gap-2 text-xs'}>
      <span className={'w-32 shrink-0 text-secondary-foreground/70 truncate'} title={row.feature}>
        {featureLabel(row.feature)}
      </span>

      <span className={'relative flex-1 h-3 min-w-16'}>
        {/* The zero line is the competition's own goal environment. */}
        <span className={'absolute inset-y-0 left-1/2 w-px bg-secondary-foreground/25'} />
        <span
          className={`absolute inset-y-0.5 rounded-sm ${positive ? 'bg-primary/60' : 'bg-chart-5/60'}`}
          style={
            positive ? { left: '50%', width: `${width}%` } : { right: '50%', width: `${width}%` }
          }
        />
      </span>

      <span
        className={`numeric w-14 shrink-0 text-right ${positive ? 'text-primary' : 'text-chart-5'}`}
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
      <h4 className={'text-xs font-medium text-foreground truncate'}>{team}</h4>
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
      <h3 className={'eyebrow text-secondary-foreground/50'}>What drove this prediction</h3>

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4'}>
        <TeamColumn team={homeTeam} rows={home} scale={scale} />
        <TeamColumn team={awayTeam} rows={away} scale={scale} />
      </div>

      {explanation.units && (
        <p className={'text-xs text-secondary-foreground/40'}>{explanation.units}</p>
      )}
    </section>
  )
}

export default ExplanationBreakdown
