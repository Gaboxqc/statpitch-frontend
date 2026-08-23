import { TIER_LABELS } from '../../constants/tiers'
import { formatLongDate } from '../../utils/datetime'
import type { AdminAccount } from '../../types/admin'
import type { Tier } from '../../types/account'

const TIER_STYLE: Record<Tier, string> = {
  free: 'border-line-strong text-ink-muted',
  pro: 'border-primary/40 bg-primary/10 text-primary',
  elite: 'border-chart-3/40 bg-chart-3/10 text-chart-3',
}

/**
 * What the account reads as, and — when they disagree — what it was granted.
 *
 * `tier` and `effective_tier` diverge for exactly one reason: the grant has run
 * out. That is the fact this page exists to show and `/accounts/me` cannot, so
 * both are rendered rather than picking the tidier one and losing it.
 */
function TierBadge({ account }: { account: AdminAccount }) {
  const lapsed = account.tier !== account.effective_tier

  return (
    <span className={'flex flex-wrap items-baseline gap-x-2 gap-y-0.5'}>
      <span
        className={`eyebrow shrink-0 rounded-md border py-0.5 px-1.5 ${TIER_STYLE[account.effective_tier]}`}
      >
        {TIER_LABELS[account.effective_tier]}
      </span>
      {lapsed && (
        <span
          className={'text-2xs text-ink-subtle'}
          title={`Granted ${account.tier}, expired ${formatLongDate(account.tier_expires_at)}`}
        >
          {account.tier} lapsed
        </span>
      )}
      {!lapsed && account.tier_expires_at !== null && (
        <span className={'text-2xs text-ink-subtle'}>
          until {formatLongDate(account.tier_expires_at)}
        </span>
      )}
    </span>
  )
}

export default TierBadge
