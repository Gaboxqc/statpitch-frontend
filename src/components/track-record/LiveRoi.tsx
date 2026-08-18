import { Link } from 'react-router'
import { useStats } from '../../hooks/queries'
import { formatSignedPercent } from '../../utils/format'
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

  if (loading) return <div className={`h-24 bg-accent/20 animate-pulse rounded-md ${className}`} />
  // A marketing surface is not the place to raise an API error; showing nothing
  // is better than showing a number that was never measured.
  if (error || !stats) return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={'grid grid-cols-2 gap-4'}>
        {stats.roi.map((entry) => {
          const settled = entry.month.bets > 0 && entry.month.roi_pct !== null
          return (
            <div
              key={entry.basis}
              className={'flex flex-col gap-1 bg-accent/20 border border-accent/40 rounded-md p-4'}
            >
              <p
                className={`text-xl font-bold ${
                  !settled
                    ? 'text-secondary-foreground/40'
                    : entry.month.roi_pct! >= 0
                      ? 'text-primary'
                      : 'text-chart-5'
                }`}
              >
                {settled ? formatSignedPercent(entry.month.roi_pct, 1) : '—'}
              </p>
              <p className={'text-sm'}>{LABELS[entry.basis]}</p>
              <p className={'text-xs text-foreground/40'}>
                {settled ? `30-day ROI · ${entry.month.bets} bets` : 'No bets settled yet'}
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
