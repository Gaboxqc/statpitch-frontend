import { MARKET_LABELS } from '../../utils/buildMarkets'
import { competitionName } from '../../constants/competitions'
import { formatDecimal, formatFraction } from '../../utils/format'
import { formatMatchDay } from '../../utils/datetime'
import type { SettledBet } from '../../types/api'

interface LedgerTableProps {
  bets: SettledBet[]
  total: number
  offset: number
  limit: number
  onOffsetChange: (offset: number) => void
}

const TH = 'text-left font-normal text-secondary-foreground/50 py-2 px-2 whitespace-nowrap'
const TD = 'py-2 px-2 align-top'

/**
 * The permanent record, newest first. Every row is a bet that was actually
 * placed at a real price, which is what separates this from the fixture cache
 * — fixtures are pruned after three days, these are kept forever.
 */
function LedgerTable({ bets, total, offset, limit, onOffsetChange }: LedgerTableProps) {
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)

  if (bets.length === 0) {
    return (
      <p className={'text-sm text-secondary-foreground/60 py-8 text-center'}>
        No settled bets match this filter yet.
      </p>
    )
  }

  return (
    <div className={'flex flex-col gap-3'}>
      <div className={'overflow-x-auto'}>
        <table className={'w-full text-xs border-collapse'}>
          <caption className={'sr-only'}>
            Settled bets, newest first, showing {from} to {to} of {total}.
          </caption>
          <thead>
            <tr className={'border-b border-secondary-foreground/15'}>
              <th scope={'col'} className={TH}>
                Date
              </th>
              <th scope={'col'} className={TH}>
                Match
              </th>
              <th scope={'col'} className={TH}>
                Selection
              </th>
              <th scope={'col'} className={TH}>
                Basis
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Odds
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Model
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                Result
              </th>
              <th scope={'col'} className={`${TH} text-right`}>
                P&amp;L
              </th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className={'border-b border-secondary-foreground/10'}>
                <td className={`${TD} text-secondary-foreground/60 whitespace-nowrap`}>
                  {formatMatchDay(bet.match_date)}
                </td>
                <td className={TD}>
                  <span className={'text-foreground'}>
                    {bet.home_team} v {bet.away_team}
                  </span>
                  <br />
                  <span className={'text-secondary-foreground/50'}>
                    {competitionName(bet.competition_id)} · {bet.home_score}&ndash;{bet.away_score}
                  </span>
                </td>
                <td className={TD}>{MARKET_LABELS[bet.selection] ?? bet.selection}</td>
                <td className={`${TD} text-secondary-foreground/60`}>
                  {bet.basis === '1x2' ? '1X2' : 'Overall'}
                </td>
                <td className={`${TD} text-right tabular-nums`}>{formatDecimal(bet.odds_taken)}</td>
                <td className={`${TD} text-right tabular-nums text-secondary-foreground/60`}>
                  {formatFraction(bet.probability, 1)}
                </td>
                <td className={`${TD} text-right`}>
                  <span className={bet.won ? 'text-primary' : 'text-chart-5'}>
                    {bet.won ? 'Won' : 'Lost'}
                  </span>
                </td>
                <td
                  className={`${TD} text-right tabular-nums ${bet.won ? 'text-primary' : 'text-chart-5'}`}
                >
                  {bet.pnl_units >= 0 ? '+' : ''}
                  {bet.pnl_units.toFixed(2)}u
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={'flex items-center justify-between text-xs'}>
        <p className={'text-secondary-foreground/50'}>
          {from}&ndash;{to} of {total}
        </p>
        <div className={'flex items-center gap-2'}>
          <button
            type={'button'}
            disabled={offset === 0}
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
            className={
              'px-2 py-1 rounded-sm border border-secondary-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
            }
          >
            Previous
          </button>
          <button
            type={'button'}
            disabled={to >= total}
            onClick={() => onOffsetChange(offset + limit)}
            className={
              'px-2 py-1 rounded-sm border border-secondary-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default LedgerTable
