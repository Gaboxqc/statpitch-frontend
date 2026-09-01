import { formatFraction } from '../../utils/format'
import type { FullFixture } from '../../types/api'

/**
 * The markets the model still predicts but nobody prices any more.
 *
 * StatPitch publishes 1X2 prices only, and we no longer buy bookmaker markets,
 * so every odds, EV and Kelly field for totals and both-teams-to-score is null
 * indefinitely. The **probabilities** are unaffected — these are real
 * predictions, not missing data — so they are shown as a forecast with no bet
 * attached rather than as eight rows of dashes in a table about betting.
 *
 * The unders are the complement of the overs, which is why the API publishes
 * only one side and this shows both.
 */
function ForecastMarkets({ fixture }: { fixture: FullFixture }) {
  const rows = [
    { label: 'Over 1.5 goals', prob: fixture.over_1_5 },
    { label: 'Over 2.5 goals', prob: fixture.over_2_5 },
    { label: 'Over 3.5 goals', prob: fixture.over_3_5 },
    { label: 'Both teams score', prob: fixture.btts_yes },
  ]

  return (
    <section className={'flex w-full flex-col gap-3'}>
      <h3 className={'eyebrow text-ink-subtle'}>Goals forecast</h3>

      <ul className={'grid grid-cols-2 gap-2 sm:grid-cols-4'}>
        {rows.map(({ label, prob }) => (
          <li
            key={label}
            className={'flex flex-col gap-0.5 rounded-md border border-line bg-secondary p-3'}
          >
            <span className={'text-2xs text-ink-subtle'}>{label}</span>
            <span className={'numeric text-sm font-semibold text-ink'}>{formatFraction(prob)}</span>
          </li>
        ))}
      </ul>

      {/* Said once here rather than as a dash in every cell: there is nothing to
          bet on these, and that is a fact about the market, not about the model. */}
      <p className={'text-xs text-ink-subtle'}>
        Predictions only — no prices are published for goals or both-teams-to-score markets, so
        there is nothing to stake against them.
      </p>
    </section>
  )
}

export default ForecastMarkets
