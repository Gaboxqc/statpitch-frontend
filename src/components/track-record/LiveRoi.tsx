import { Link } from 'react-router'
import { useStats } from '../../hooks/queries'
import { formatSignedPercent } from '../../utils/format'
import { MIN_BETS } from '../../utils/calibration'
import type { Basis } from '../../types/api'

const LABELS: Record<Basis, string> = { '1x2': '1X2 only', overall: 'All markets' }

interface LiveRoiProps {
  className?: string
  /** Whether to link through to the full record. Off inside the record itself. */
  linked?: boolean
}

/**
 * The 30-day ROI, read from `/statpitch/stats` at render time rather than
 * hardcoded. Both strategies are shown because they measure different things
 * and the API never averages them; picking the flattering one would be a claim
 * the endpoint does not make.
 */
function LiveRoi({ className = '', linked = true }: LiveRoiProps) {
  const { stats, loading, error } = useStats()

  if (loading) return <div className={`h-24 bg-secondary animate-pulse rounded-lg ${className}`} />
  // A marketing surface is not the place to raise an API error; showing nothing
  // is better than showing a number that was never measured.
  if (error || !stats) return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={'grid grid-cols-2 gap-4'}>
        {stats.roi.map((entry) => {
          const settled = entry.month.bets > 0 && entry.month.roi_pct !== null
          const meaningful = settled && entry.month.bets >= MIN_BETS
          return (
            <div
              key={entry.basis}
              className={'flex flex-col gap-1 bg-secondary border border-line rounded-lg p-4'}
            >
              <p
                className={`numeric text-xl font-semibold ${
                  !settled
                    ? 'text-ink-subtle'
                    : !meaningful
                      ? 'text-ink-muted'
                      : entry.month.roi_pct! >= 0
                        ? 'text-primary'
                        : 'text-negative'
                }`}
              >
                {settled ? formatSignedPercent(entry.month.roi_pct, 1) : '—'}
              </p>
              <p className={'text-sm font-medium'}>{LABELS[entry.basis]}</p>
              <p className={'text-xs text-ink-subtle'}>
                {settled
                  ? `30-day ROI · ${entry.month.bets} bets${meaningful ? '' : ' · provisional'}`
                  : 'No bets settled yet'}
              </p>
            </div>
          )
        })}
      </div>
      {linked && (
        <Link to={'/track-record'} className={'text-xs text-primary underline w-fit'}>
          See every settled bet
        </Link>
      )}
    </div>
  )
}

export default LiveRoi
