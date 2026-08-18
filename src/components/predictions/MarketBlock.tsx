import ProbabilityBar from '../ui/ProbabilityBar'
import type { Market } from '../../types/api'
import {
  formatDecimal,
  formatFraction,
  formatSignedFraction,
  toPercentValue,
} from '../../utils/format'

function getEVColor(ev: number | null) {
  if (ev === null) return 'text-secondary-foreground/40'
  return ev > 0 ? 'text-primary' : 'text-secondary-foreground/50'
}

/**
 * Three different things end in "don't bet", and calling them all "no positive
 * edge" is wrong: a market can carry a real positive EV and still be skipped
 * because the stake it justifies is too small to be worth the variance. That is
 * what a null Kelly against a positive EV means.
 */
function getKellyRender(kelly: number | null, ev: number | null, priced: boolean) {
  if (!priced)
    return (
      <p className={'text-xs text-secondary-foreground/30'}>→ No price quoted for this market</p>
    )
  if (kelly === null || kelly <= 0) {
    const positiveEdge = ev !== null && ev > 0
    return (
      <p className={'text-xs text-secondary-foreground/30'}>
        {positiveEdge ? '→ Skip | Edge too small to stake' : '→ Skip | No positive edge'}
      </p>
    )
  }
  return (
    <p
      className={
        'text-xs text-secondary-foreground/70 p-2 bg-primary/10 border border-primary/20 rounded-sm'
      }
    >
      CONSIDER{' '}
      <span className={'text-primary font-bold'}>Stake {formatFraction(kelly)} of bankroll</span>
    </p>
  )
}

function getMarketNameRender(market: string, isBest: boolean) {
  if (isBest)
    return (
      <div className={'flex items-center gap-2'}>
        <p>{market}</p>
        <p className={'text-xs p-1 bg-primary/10 border border-primary/20 rounded-sm text-primary'}>
          BEST BET
        </p>
      </div>
    )
  return <p>{market}</p>
}

interface MarketBlockProps extends Omit<Market, 'key'> {
  isBest: boolean
}

/**
 * The model prices every market whether or not a bookmaker did, so an unquoted
 * market still has a probability worth showing. Hiding the row entirely would
 * drop eight of the eleven markets whenever the quota is set to `h2h` only.
 */
function MarketBlock({ market, prob, ev, odds, kelly, isBest }: MarketBlockProps) {
  const priced = odds !== null && odds > 0
  const fairOdds = prob > 0 ? formatDecimal(1 / prob) : '—'

  return (
    <div className={'flex flex-col justify-center items-center'}>
      <div className={'bg-accent/15 h-0.5 my-4 w-full'}></div>
      <div className={'flex w-full items-center justify-center'}>
        <div className={`${isBest ? 'block' : 'hidden'} h-50 w-0.5 bg-primary mr-4`}></div>
        <div className={'flex flex-col gap-4 w-full'}>
          <div className={'flex justify-between items-center gap-2 text-sm'}>
            {getMarketNameRender(market, isBest)}
            <p className={`${getEVColor(ev)} font-bold`}>
              {/* EV arrives as a 0-1 fraction: 0.0617 is a +6.17% edge. */}
              {ev === null ? 'Not priced' : `${formatSignedFraction(ev)} EV`}
            </p>
          </div>
          {getKellyRender(kelly, ev, priced)}
          <div className={'flex items-center gap-2 text-xs text-secondary-foreground/50'}>
            {priced && (
              <p>
                BOOK <span className={'text-foreground'}>{formatDecimal(odds)}</span> |{' '}
              </p>
            )}
            <p>
              FAIR ODDS <span className={'text-foreground'}>{fairOdds}</span> |{' '}
            </p>
            <p>
              MODEL <span className={'text-foreground'}>{formatFraction(prob)}</span>{' '}
            </p>
          </div>
          <div className={'flex flex-col gap-2'}>
            <ProbabilityBar prob={toPercentValue(prob)} />
            <div
              className={'flex justify-between items-center text-xs text-secondary-foreground/50'}
            >
              {priced && (
                <p>
                  Implied <span>{formatFraction(1 / odds)}</span>
                </p>
              )}
              <p>
                Model <span>{formatFraction(prob)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketBlock
