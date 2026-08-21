import { Link } from 'react-router'
import { useAccount, useStartTrial } from '../../hooks/useAccount'
import { describeError } from '../../services/api'
import type { Tier } from '../../types/account'

const BUTTON = 'w-full p-2.5 rounded-md text-sm text-center font-semibold my-2'
const PRIMARY = `${BUTTON} bg-primary text-background cursor-pointer disabled:cursor-progress disabled:opacity-70`
const QUIET = `${BUTTON} bg-secondary text-ink border border-line`
const STATIC = `${BUTTON} border border-line text-ink-subtle`

const RANK: Record<Tier, number> = { free: 0, pro: 1, elite: 2 }

/**
 * What each pricing card's button should do for the reader looking at it.
 *
 * There is no checkout to send anyone to — Stripe is not built — so the only
 * paths that actually exist are registering, starting the one free trial, and
 * asking. Rendering a "Subscribe" button that leads nowhere would be the dark
 * pattern the page above it claims not to use.
 */
function PlanAction({ plan, isPopular }: { plan: Tier; isPopular: boolean }) {
  const { account, tier, isSignedIn, loading } = useAccount()
  const trial = useStartTrial()

  // The chrome shifts once the session is known, so it renders nothing rather
  // than offering the wrong thing first.
  if (loading) return <div className={`${BUTTON} h-10 animate-pulse rounded-md bg-secondary`} />

  if (!isSignedIn)
    return (
      <Link to={'/login?new=1'} className={isPopular ? PRIMARY : QUIET}>
        {plan === 'free' ? 'Start free' : 'Create account'}
      </Link>
    )

  if (tier === plan) return <p className={STATIC}>Current plan</p>

  // Everything a lower tier sells is already included further up.
  if (RANK[tier] > RANK[plan]) return <p className={STATIC}>Included</p>

  if (plan === 'pro' && account !== null && !account.trial_used)
    return (
      <div className={'my-2 flex flex-col gap-1'}>
        <button
          type={'button'}
          onClick={() => trial.mutate()}
          disabled={trial.isPending}
          className={`${PRIMARY} my-0`}
        >
          {trial.isPending ? 'Starting…' : 'Start 14-day trial'}
        </button>
        {trial.error !== null && (
          <p role={'alert'} className={'text-xs text-negative'}>
            {describeError(trial.error)}
          </p>
        )}
      </div>
    )

  // No payment provider, so an upgrade is arranged by hand. Saying so is
  // better than a button that cannot do it.
  return <p className={STATIC}>Contact us to upgrade</p>
}

export default PlanAction
