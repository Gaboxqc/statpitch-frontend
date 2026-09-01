import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import type { Selection } from '../../types/api'

const TH = 'eyebrow whitespace-nowrap px-2 py-2 text-left font-medium text-ink-subtle'
const TD = 'whitespace-nowrap px-2 py-2 align-middle'

/**
 * The model's probability against the market's, on one track. The gap between
 * the two markers is what a selection is made of, and unlike the price columns
 * beside it, it asks no arithmetic of the reader.
 */
function ProbabilityAxis({ model, market }: { model: number | null; market: number | null }) {
  if (model === null || market === null) return null

  const m = model * 100
  const q = market * 100
  const rich = m > q

  return (
    <span aria-hidden={true} className={'relative block h-4 w-24 rounded-full bg-secondary sm:w-32'}>
      <span
        className={`absolute inset-y-1 rounded-full ${rich ? 'bg-primary/30' : 'bg-negative/30'}`}
        style={{ left: `${Math.min(m, q)}%`, width: `${Math.abs(m - q)}%` }}
      />
      <span
        className={'absolute inset-y-0.5 w-0.5 rounded-full bg-ink-subtle'}
        style={{ left: `${q}%` }}
      />
      <span
        className={'absolute inset-y-0 w-0.5 rounded-full bg-primary'}
        style={{ left: `${m}%` }}
      />
    </span>
  )
}

/**
 * Above zero is a recommendation. Zero is an assessment that declined to become
 * one, and the row says why in its own words rather than showing a dash.
 */
function Stake({ row }: { row: Selection }) {
  if (row.stake_fraction > 0) {
    return (
      <span className={'numeric font-semibold text-primary'}>
        {formatFraction(row.stake_fraction)}
      </span>
    )
  }

  const reason = row.reasons?.[0] ?? null
  return (
    <span className={'text-ink-subtle'} title={reason ?? 'This selection was not staked'}>
      Not staked
    </span>
  )
}

/**
 * What StatPitch priced on this fixture, and what it did about it.
 *
 * Four prices per row, deliberately not collapsed into one: only `odds` is a
 * price anybody can take, and the other three are the evidence for whether
 * taking it is any good. A single "odds" column would throw that away.
 *
 * `model_edge` has no column. It is 0.0 on every live row — these selections
 * come from a price disagreement between a book and the benchmark, not from the
 * model out-predicting the market — and a column of zeroes would invite exactly
 * the reading that is wrong.
 */
function SelectionsTable({ selections }: { selections: Selection[] }) {
  if (selections.length === 0) {
    return (
      <section className={'flex w-full flex-col gap-2'}>
        <h3 className={'eyebrow text-ink-subtle'}>Value selections</h3>
        {/* Neither an error nor a loading state: prices publish per matchday
            block, so a fixture days out simply has none yet. */}
        <p className={'text-xs text-ink-subtle'}>
          No prices published for this fixture yet. They arrive per matchday block, usually close to
          kick-off.
        </p>
      </section>
    )
  }

  const staked = selections.filter((row) => row.stake_fraction > 0).length
  const provenance = selections[0]

  return (
    <section className={'flex w-full flex-col gap-3'}>
      <div className={'flex flex-wrap items-baseline justify-between gap-2'}>
        <h3 className={'eyebrow text-ink-subtle'}>Value selections</h3>
        <p className={'text-xs text-ink-subtle'}>
          <span className={'numeric'}>{staked}</span> of{' '}
          <span className={'numeric'}>{selections.length}</span> priced outcomes staked
        </p>
      </div>

      <div className={'overflow-x-auto rounded-lg border border-line'}>
        <table className={'w-full border-collapse text-xs'}>
          <caption className={'sr-only'}>
            Every outcome StatPitch priced on this fixture: the model&apos;s probability against the
            market&apos;s, the four prices behind it, and the stake it justified.
          </caption>
          <thead>
            <tr className={'border-b border-line bg-secondary'}>
              <th scope={'col'} className={TH}>
                Outcome
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Model
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Market
              </th>
              <th scope={'col'} className={`${TH} hidden sm:table-cell`}>
                Model vs market
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Best price
              </th>
              <th scope={'col'} className={`${TH} hidden text-right md:table-cell`}>
                Benchmark
              </th>
              <th scope={'col'} className={`${TH} hidden text-right lg:table-cell`}>
                Consensus
              </th>
              <th scope={'col'} className={`${TH} hidden text-right lg:table-cell`}>
                Fair
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Edge
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Stake
              </th>
            </tr>
          </thead>
          <tbody>
            {selections.map((row) => (
              <tr
                key={row.selection}
                className={`border-b border-line last:border-b-0 ${
                  row.stake_fraction > 0 ? 'bg-primary/10' : ''
                }`}
              >
                <td className={`${TD} font-medium`}>
                  <span className={'flex items-center gap-2'}>
                    {row.description ?? row.selection}
                    {row.stake_fraction > 0 && (
                      <span className={'eyebrow text-primary'}>Value pick</span>
                    )}
                  </span>
                </td>
                <td className={`${TD} numeric text-right`}>{formatFraction(row.p_model)}</td>
                <td className={`${TD} numeric text-right text-ink-muted`}>
                  {formatFraction(row.q_fair)}
                </td>
                <td className={`${TD} hidden sm:table-cell`}>
                  <ProbabilityAxis model={row.p_model} market={row.q_fair} />
                </td>
                <td className={`${TD} numeric text-right`}>{formatDecimal(row.odds)}</td>
                <td className={`${TD} numeric hidden text-right text-ink-muted md:table-cell`}>
                  {formatDecimal(row.reference_odds)}
                </td>
                <td className={`${TD} numeric hidden text-right text-ink-subtle lg:table-cell`}>
                  {formatDecimal(row.consensus_odds)}
                </td>
                <td className={`${TD} numeric hidden text-right text-ink-subtle lg:table-cell`}>
                  {formatDecimal(row.fair_odds)}
                </td>
                <td
                  className={`${TD} numeric text-right font-semibold ${
                    (row.rule_edge ?? 0) > 0 ? 'text-primary' : 'text-ink-muted'
                  }`}
                >
                  {formatSignedFraction(row.rule_edge)}
                </td>
                <td className={`${TD} text-right`}>
                  <Stake row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Only one of the four prices is takeable, so the legend says which. */}
      <p className={'text-xs text-ink-subtle'}>
        Best price is the highest quote on the panel, and the only one you could take. Benchmark is
        the book the rule measures against, consensus the panel mean, and fair that consensus with
        the margin removed. Edge is the rule&apos;s: how far the best price sits from the benchmark.
      </p>

      {/* Provenance rides on the row rather than the response, because the rule
          can be promoted later and a pick has to keep reading as whatever it was
          recommended under. */}
      {provenance.selection_rule_status !== null && (
        <p className={'text-2xs text-ink-subtle'}>
          Selection rule: {provenance.selection_rule_status}
          {provenance.selection_rule_reference !== null &&
            ` · benchmark ${provenance.selection_rule_reference}`}
          {provenance.config_status !== null && ` · config ${provenance.config_status}`}
        </p>
      )}
    </section>
  )
}

export default SelectionsTable
