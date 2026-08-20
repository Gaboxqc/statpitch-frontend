import { BrainIcon } from '../../assets/icons/index'
import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import type { Market, MarketKey } from '../../types/api'

/**
 * The model's price against the book's, on one track. The gap between the two
 * markers is the edge — the entire product — and it used to be something the
 * reader worked out by subtracting "FAIR ODDS 1.85" from "BOOK 2.10" in their
 * head. Decorative on purpose: both figures sit in the columns beside it.
 */
function EdgeAxis({ prob, odds }: { prob: number; odds: number | null }) {
  const model = prob * 100
  const implied = odds !== null && odds > 0 ? (1 / odds) * 100 : null
  const value = implied !== null && model > implied

  return (
    <span
      aria-hidden={true}
      className={'relative block h-4 w-24 rounded-full bg-secondary sm:w-32'}
    >
      {implied !== null && (
        <span
          className={`absolute inset-y-1 rounded-full ${value ? 'bg-primary/30' : 'bg-negative/30'}`}
          style={{
            left: `${Math.min(model, implied)}%`,
            width: `${Math.abs(model - implied)}%`,
          }}
        />
      )}
      {implied !== null && (
        <span
          className={'absolute inset-y-0.5 w-0.5 rounded-full bg-ink-subtle'}
          style={{ left: `${implied}%` }}
        />
      )}
      <span
        className={'absolute inset-y-0 w-0.5 rounded-full bg-primary'}
        style={{ left: `${model}%` }}
      />
    </span>
  )
}

/**
 * Three different things end in "don't bet", and calling them all "no positive
 * edge" is wrong: a market can carry a real positive EV and still be skipped
 * because the stake it justifies is too small to be worth the variance. That is
 * what a null Kelly against a positive EV means. The column is narrow, so the
 * distinction lives in the label and the reason lives in the title.
 */
function Stake({
  kelly,
  ev,
  priced,
}: {
  kelly: number | null
  ev: number | null
  priced: boolean
}) {
  if (!priced) return <span title={'No price quoted for this market'}>—</span>

  if (kelly === null || kelly <= 0) {
    const positiveEdge = ev !== null && ev > 0
    return positiveEdge ? (
      <span
        className={'text-ink-subtle'}
        title={'A real edge, but the stake it justifies is too small to be worth the variance'}
      >
        Too small
      </span>
    ) : (
      <span className={'text-ink-subtle'} title={'The book is not offering an edge here'}>
        No edge
      </span>
    )
  }

  return <span className={'numeric font-semibold text-primary'}>{formatFraction(kelly)}</span>
}

const TH = 'eyebrow whitespace-nowrap px-2 py-2 text-left font-medium text-ink-subtle'
const TD = 'whitespace-nowrap px-2 py-2 align-middle'

interface MarketListProps {
  markets: Market[]
  bestBet: MarketKey | null
  isOpened: boolean
  id?: string
}

/**
 * Eleven markets, and the task is comparing them. As stacked blocks you could
 * never see two at once; as rows the whole board reads at a glance and the
 * unpriced markets sit in the same order as the priced ones instead of being
 * dropped — the model prices every market whether or not a bookmaker did.
 */
function MarketList({ markets, bestBet, isOpened, id }: MarketListProps) {
  return (
    <div id={id} className={`flex-col gap-3 w-full ${isOpened ? 'flex' : 'hidden'}`}>
      <div className={'flex items-center gap-2 text-ink-subtle'}>
        <BrainIcon className={'h-4 w-4 text-primary'} />
        <p className={'eyebrow'}>Market analysis</p>
      </div>

      <div className={'overflow-x-auto rounded-lg border border-line'}>
        <table className={'w-full border-collapse text-xs'}>
          <caption className={'sr-only'}>
            Every market the model prices, with the book&apos;s price where one was quoted, the
            resulting edge and the stake it justifies.
          </caption>
          <thead>
            <tr className={'border-b border-line bg-secondary'}>
              <th scope={'col'} className={TH}>
                Market
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Model
              </th>
              <th scope={'col'} className={`${TH} hidden sm:table-cell`}>
                Model vs book
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Book
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
            {markets.map(({ key, market, ev, odds, prob, kelly }) => {
              const priced = odds !== null && odds > 0
              const isBest = key === bestBet

              return (
                <tr
                  key={key}
                  className={`border-b border-line last:border-b-0 ${isBest ? 'bg-primary/10' : ''}`}
                >
                  <td className={`${TD} font-medium`}>
                    <span className={'flex items-center gap-2'}>
                      {market}
                      {isBest && <span className={'eyebrow text-primary'}>Best bet</span>}
                    </span>
                  </td>
                  <td className={`${TD} numeric text-right`}>{formatFraction(prob)}</td>
                  <td className={`${TD} hidden sm:table-cell`}>
                    <EdgeAxis prob={prob} odds={odds} />
                  </td>
                  <td className={`${TD} numeric text-right text-ink-muted`}>
                    {priced ? formatDecimal(odds) : '—'}
                  </td>
                  {/* EV arrives as a 0-1 fraction: 0.0617 is a +6.17% edge. */}
                  <td
                    className={`${TD} numeric text-right font-semibold ${
                      ev === null ? 'text-ink-subtle' : ev > 0 ? 'text-primary' : 'text-ink-muted'
                    }`}
                  >
                    {ev === null ? '—' : formatSignedFraction(ev)}
                  </td>
                  <td className={`${TD} text-right`}>
                    <Stake kelly={kelly} ev={ev} priced={priced} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className={'text-xs text-ink-subtle'}>
        Model is the probability the model gives. Book is the decimal price quoted. Edge is what the
        two are worth against each other, and stake is the fraction of a bankroll that justifies.
      </p>
    </div>
  )
}

export default MarketList
