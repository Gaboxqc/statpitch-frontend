import { didMarketWin } from '../../utils/settleMarket'
import { MARKET_LABELS } from '../../utils/buildMarkets'
import type { Fixture } from '../../types/api'

interface FinalScoreProps {
  fixture: Fixture
  /** The compact form drops the pick verdict and keeps only the score. */
  variant?: 'badge' | 'full'
}

/**
 * A finished match. Whether the published pick landed is the whole point of
 * showing yesterday at all, so it is settled from the score rather than hidden.
 */
function FinalScore({ fixture, variant = 'badge' }: FinalScoreProps) {
  const { home_score: home, away_score: away, best_overall_bet: pick } = fixture
  if (home === null || away === null) return null

  const won = pick ? didMarketWin(pick, home, away) : null

  if (variant === 'badge') {
    return (
      <span
        className={
          'flex items-center gap-2 shrink-0 p-1 md:px-2 rounded-sm text-xs border border-secondary-foreground/25 bg-accent/30'
        }
      >
        <span className={'font-bold tabular-nums'}>
          {home}&ndash;{away}
        </span>
        <span className={'text-secondary-foreground/50'}>FT</span>
        {won !== null && (
          <span className={won ? 'text-primary' : 'text-chart-5'}>{won ? 'WON' : 'LOST'}</span>
        )}
      </span>
    )
  }

  return (
    <section className={'flex flex-col gap-2 w-full'}>
      <h3 className={'text-xs text-secondary-foreground/50'}>RESULT</h3>
      <p className={'text-sm'}>
        <span className={'font-bold tabular-nums'}>
          {fixture.home_team} {home}&ndash;{away} {fixture.away_team}
        </span>
      </p>
      {pick && (
        <p className={'text-xs text-secondary-foreground'}>
          Published pick <span className={'text-foreground'}>{MARKET_LABELS[pick] ?? pick}</span>{' '}
          <span className={won ? 'text-primary' : 'text-chart-5'}>{won ? 'won' : 'lost'}</span>.
        </p>
      )}
    </section>
  )
}

export default FinalScore
