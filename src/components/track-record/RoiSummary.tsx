import { formatSignedPercent } from '../../utils/format'
import type { Basis, BasisRoi, WindowRoi } from '../../types/api'

const BASIS_LABELS: Record<Basis, { title: string; blurb: string }> = {
  '1x2': { title: '1X2 only', blurb: 'The best home, draw or away pick.' },
  overall: {
    title: 'All markets',
    blurb: 'The best pick across 1X2, over/under and both-teams-to-score.',
  },
}

function Window({ label, roi }: { label: string; roi: WindowRoi }) {
  // roi_pct is null, not 0.0, when nothing settled. Rendering an unmeasured
  // window as break-even would claim a result that was never taken.
  const settled = roi.bets > 0 && roi.roi_pct !== null

  return (
    <div className={'flex flex-col gap-1'}>
      <p className={'eyebrow text-secondary-foreground/50'}>{label}</p>
      <p
        className={`numeric text-xl font-semibold ${
          !settled
            ? 'text-secondary-foreground/40'
            : roi.roi_pct! >= 0
              ? 'text-primary'
              : 'text-chart-5'
        }`}
      >
        {settled ? formatSignedPercent(roi.roi_pct, 1) : '—'}
      </p>
      <p className={'text-xs tabular-nums text-secondary-foreground/60'}>
        {settled ? (
          <>
            {roi.bets} bets · {roi.wins} won ({formatSignedPercent(roi.hit_rate_pct, 0).slice(1)})
            <br />
            {roi.pnl_units >= 0 ? '+' : ''}
            {roi.pnl_units.toFixed(2)}u on {roi.staked_units.toFixed(0)}u staked
          </>
        ) : (
          'No bets settled yet'
        )}
      </p>
    </div>
  )
}

/**
 * The two series measure different strategies over overlapping fixtures, so
 * they sit side by side and are never averaged — that would answer neither
 * question. Kept in a fixed order so the comparison reads the same every time.
 */
function RoiSummary({ roi }: { roi: BasisRoi[] }) {
  const ordered = (['1x2', 'overall'] as Basis[])
    .map((basis) => roi.find((entry) => entry.basis === basis))
    .filter((entry): entry is BasisRoi => entry !== undefined)

  return (
    <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
      {ordered.map((entry) => (
        <section
          key={entry.basis}
          className={
            'border border-secondary-foreground/15 rounded-md p-4 bg-card flex flex-col gap-4'
          }
        >
          <div>
            <h3 className={'text-sm font-medium text-foreground'}>
              {BASIS_LABELS[entry.basis].title}
            </h3>
            <p className={'text-xs text-secondary-foreground/50'}>
              {BASIS_LABELS[entry.basis].blurb}
            </p>
          </div>
          <div className={'grid grid-cols-2 gap-4'}>
            <Window label={'Last 7 days'} roi={entry.week} />
            <Window label={'Last 30 days'} roi={entry.month} />
          </div>
        </section>
      ))}
    </div>
  )
}

export default RoiSummary
