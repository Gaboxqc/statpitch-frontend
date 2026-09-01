import { formatSignedPercent } from '../../utils/format'
import { MIN_BETS } from '../../utils/calibration'
import { BASES, BASIS_DETAIL } from '../../constants/bases'
import type { BasisRoi, WindowRoi } from '../../types/api'

function Window({ label, roi }: { label: string; roi: WindowRoi }) {
  // roi_pct is null, not 0.0, when nothing settled. Rendering an unmeasured
  // window as break-even would claim a result that was never taken.
  const settled = roi.bets > 0 && roi.roi_pct !== null
  // +14.2% off twelve bets used to render exactly like +14.2% off four hundred,
  // with the sample size in 11px underneath. Below the threshold the figure
  // keeps its sign and loses its colour: it is a running total, not a result.
  const meaningful = settled && roi.bets >= MIN_BETS

  const tone = !settled
    ? 'text-ink-subtle'
    : !meaningful
      ? 'text-ink-muted'
      : roi.roi_pct! >= 0
        ? 'text-primary'
        : 'text-negative'

  return (
    <div className={'flex flex-col gap-1'}>
      <p className={'eyebrow text-ink-subtle'}>{label}</p>
      <p className={`numeric text-xl font-semibold ${tone}`}>
        {settled ? formatSignedPercent(roi.roi_pct, 1) : '—'}
      </p>
      {settled && !meaningful && (
        <p className={'eyebrow text-ink-subtle'} title={`Fewer than ${MIN_BETS} settled bets`}>
          Provisional
        </p>
      )}
      <p className={'text-xs tabular-nums text-ink-subtle'}>
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
 * The series measure different strategies over overlapping fixtures, so they sit
 * side by side and are never averaged — that would answer none of them. Kept in
 * a fixed order so the comparison reads the same every time.
 */
function RoiSummary({ roi }: { roi: BasisRoi[] }) {
  const ordered = BASES.map((basis) => roi.find((entry) => entry.basis === basis)).filter(
    (entry): entry is BasisRoi => entry !== undefined,
  )

  const ours = ordered.filter((entry) => entry.basis !== 'rule')

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
        {ordered.map((entry) => (
          <section
            key={entry.basis}
            className={'border border-line rounded-lg p-5 bg-card flex flex-col gap-5'}
          >
            <div>
              <h3 className={'text-sm font-medium text-ink'}>{BASIS_DETAIL[entry.basis].title}</h3>
              <p className={'text-xs text-ink-subtle'}>{BASIS_DETAIL[entry.basis].blurb}</p>
            </div>
            <div className={'grid grid-cols-2 gap-4'}>
              <Window label={'Last 7 days'} roi={entry.week} />
              <Window label={'Last 30 days'} roi={entry.month} />
            </div>
          </section>
        ))}
      </div>

      {/* Only the 1X2 family carries a price, so these two strategies select the
          same bet every time and their figures match. Said out loud, because two
          identical columns otherwise read as a bug — or worse, as a comparison
          the reader is invited to draw a conclusion from. */}
      {ours.length === 2 && (
        <p className={'text-xs text-ink-subtle'}>
          {BASIS_DETAIL['1x2'].title} and {BASIS_DETAIL.overall.title} will read the same until
          over/under and both-teams-to-score carry prices: today every priced market is 1X2, so both
          pick the same bet.
        </p>
      )}
    </div>
  )
}

export default RoiSummary
