import { Link } from 'react-router'
import { useAccount, useRequestTrial, useTrialRequest } from '../../hooks/useAccount'
import { describeError } from '../../services/api'
import { describeTrial } from '../../utils/trialState'
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
  // Only the Pro card can offer the trial, so only it asks where the request stands.
  const { request } = useTrialRequest(isSignedIn && plan === 'pro')
  const ask = useRequestTrial()
  const trial = describeTrial(account, request)

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

  // A request already with an administrator is not a button. Saying so where the
  // button was is the only place the reader will look for the answer.
  if (plan === 'pro' && trial.kind === 'pending') return <p className={STATIC}>{trial.label}</p>

  if (plan === 'pro' && (trial.kind === 'request' || trial.kind === 'declined'))
    return (
      <div className={'my-2 flex flex-col gap-1'}>
        <button
          type={'button'}
          onClick={() => ask.mutate(undefined)}
          disabled={ask.isPending}
          className={`${PRIMARY} my-0`}
        >
          {ask.isPending ? 'Requesting…' : trial.label}
        </button>
        {/* Why the last one was turned down, in the words it was turned down in. */}
        {trial.kind === 'declined' && trial.detail !== null && (
          <p className={'text-xs text-ink-subtle'}>{trial.detail}</p>
        )}
        {ask.error !== null && (
          <p role={'alert'} className={'text-xs text-negative'}>
            {describeError(ask.error)}
          </p>
        )}
      </div>
    )

  // No payment provider, so an upgrade is arranged by hand. Saying so is
  // better than a button that cannot do it.
  return <p className={STATIC}>Contact us to upgrade</p>
}

export default PlanAction
