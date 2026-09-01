import { MARKET_LABELS } from '../../utils/buildMarkets'
import { competitionName } from '../../constants/competitions'
import { BASIS_LABELS } from '../../constants/bases'
import { displayName } from '../../utils/teamName'
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

const TH = 'eyebrow text-left text-ink-subtle py-2 px-2 whitespace-nowrap'
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
      <p className={'text-sm text-ink-subtle py-8 text-center'}>
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
            <tr className={'border-b border-line'}>
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
              <tr key={bet.id} className={'border-b border-line'}>
                <td className={`${TD} numeric text-ink-subtle whitespace-nowrap`}>
                  {formatMatchDay(bet.match_date)}
                </td>
                <td className={TD}>
                  <span
                    className={'text-ink font-medium'}
                    title={`${bet.home_team} v ${bet.away_team}`}
                  >
                    {displayName(bet.home_team)} v {displayName(bet.away_team)}
                  </span>
                  <br />
                  <span className={'text-ink-subtle'}>
                    {competitionName(bet.competition_id)} · {bet.home_score}&ndash;{bet.away_score}
                  </span>
                </td>
                <td className={TD}>{MARKET_LABELS[bet.selection] ?? bet.selection}</td>
                <td className={`${TD} text-ink-subtle`}>{BASIS_LABELS[bet.basis] ?? bet.basis}</td>
                <td className={`${TD} numeric text-right`}>{formatDecimal(bet.odds_taken)}</td>
                <td className={`${TD} numeric text-right text-ink-subtle`}>
                  {formatFraction(bet.probability, 1)}
                </td>
                <td className={`${TD} text-right`}>
                  <span className={`font-medium ${bet.won ? 'text-primary' : 'text-negative'}`}>
                    {bet.won ? 'Won' : 'Lost'}
                  </span>
                </td>
                <td
                  className={`${TD} numeric text-right ${bet.won ? 'text-primary' : 'text-negative'}`}
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
        <p className={'numeric text-ink-subtle'}>
          {from}&ndash;{to} of {total}
        </p>
        <div className={'flex items-center gap-2'}>
          <button
            type={'button'}
            disabled={offset === 0}
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
            className={
              'px-3 py-1.5 rounded-md border border-line-strong disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
            }
          >
            Previous
          </button>
          <button
            type={'button'}
            disabled={to >= total}
            onClick={() => onOffsetChange(offset + limit)}
            className={
              'px-3 py-1.5 rounded-md border border-line-strong disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
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
