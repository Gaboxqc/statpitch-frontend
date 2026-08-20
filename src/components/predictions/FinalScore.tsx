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
        <span className={'numeric font-semibold'}>
          {home}&ndash;{away}
        </span>
        <span className={'eyebrow text-ink-subtle'}>FT</span>
        {won !== null && (
          <span className={`eyebrow ${won ? 'text-primary' : 'text-negative'}`}>
            {won ? 'Won' : 'Lost'}
          </span>
        )}
      </span>
    )
  }

  return (
    <section className={'flex flex-col gap-2 w-full'}>
      <h3 className={'eyebrow text-ink-subtle'}>Result</h3>
      <p className={'text-sm font-medium tabular-nums'}>
        {fixture.home_team} {home}&ndash;{away} {fixture.away_team}
      </p>
      {pick && (
        <p className={'text-xs text-ink-muted'}>
          Published pick <span className={'text-ink'}>{MARKET_LABELS[pick] ?? pick}</span>{' '}
          <span className={won ? 'text-primary' : 'text-negative'}>{won ? 'won' : 'lost'}</span>.
        </p>
      )}
    </section>
  )
}

export default FinalScore
