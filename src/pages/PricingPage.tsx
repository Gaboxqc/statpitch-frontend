import { BrainIcon } from '../assets/icons/index'
import PricingCard from '../components/pricing/PricingCard'
import PlanAction from '../components/pricing/PlanAction'
import { pricingPlans } from '../utils/pricingPlans'
import ExpandableCard from '../components/ui/ExpandableCard'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import LiveRoi from '../components/track-record/LiveRoi'
import { TIER_LABELS } from '../constants/tiers'
import { useAccount } from '../hooks/useAccount'
import { useCompetitionScope } from '../hooks/queries'
import type { Tier } from '../types/account'

/**
 * What the reader is still missing, in what it gets them rather than in tier
 * names. Elite is the top of the ladder and has nothing above it, which is worth
 * saying plainly instead of leaving the page silently unchanged.
 */
const WHAT_IS_MISSING: Record<Tier, string> = {
  free: 'Pro opens the market breakdown, the edge and value indicators, the confidence bands, and the settled ledger behind the track record.',
  pro: 'Elite adds a REST API over everything Pro already gives you. The predictions themselves are byte-identical.',
  elite: 'You are on the top tier. Everything StatPitch publishes is already yours.',
}

function PricingPage() {
  const { tier, isSignedIn, loading } = useAccount()
  const { counts } = useCompetitionScope()
  useDocumentTitle(isSignedIn ? 'Upgrade' : 'Pricing')

  return (
    <section className={'measure pt-10 pb-24'}>
      {/* A price list is written for somebody deciding whether to buy. Somebody
          who already has is asking a different question — what am I missing —
          and answering the first one at them is just asking again for money
          they have already paid. */}
      {/* Neither hero until `/me` settles. Guessing wrong here pitches the price
          list at somebody who has already paid, for as long as the first request
          takes — and on a cold start that is seconds, not a flicker. */}
      {loading ? (
        <div className={'mt-12 flex flex-col items-center gap-4'}>
          <div className={'h-8 w-56 animate-pulse rounded-full bg-secondary'} />
          <div className={'h-16 w-full max-w-md animate-pulse rounded-lg bg-secondary'} />
          <div className={'h-12 w-full max-w-xl animate-pulse rounded-lg bg-secondary'} />
        </div>
      ) : (
        <div className={'mt-12 flex flex-col items-center gap-4 text-center'}>
          <div
            className={
              'eyebrow flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary'
            }
          >
            <BrainIcon className={'h-4 w-4 text-primary'} />
            <p>{isSignedIn ? `You are on ${TIER_LABELS[tier]}` : 'ML-powered predictions'}</p>
          </div>
          <div>
            <h1 className={'text-2xl font-semibold md:text-3xl'}>
              {isSignedIn ? (
                <>
                  Your plan
                  <span className={'block text-primary'}>
                    {tier === 'elite' ? 'Nothing above this one' : 'And what is above it'}
                  </span>
                </>
              ) : (
                <>
                  Transparent Pricing
                  <span className={'block text-primary'}>No dark patterns</span>
                </>
              )}
            </h1>
          </div>
          <p className={'max-w-xl text-base text-ink-subtle'}>
            {isSignedIn
              ? WHAT_IS_MISSING[tier]
              : 'Choose the plan that matches your edge. Every tier includes a confidence score and probability breakdown — no black boxes.'}
          </p>
        </div>
      )}
      <div>
        <p className={'eyebrow my-12 text-center text-ink-muted'}>Monthly</p>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              {...plan}
              action={<PlanAction plan={plan.id} isPopular={plan.isPopular} />}
            />
          ))}
        </div>
      </div>
      <div className={'mt-24 bg-card p-6 rounded-lg border border-line'}>
        <LiveRoi />
        {/* Counted from the API rather than from a table here, and three
            numbers rather than two: "only priced competitions can produce a
            selection" stopped being the whole truth when two priced leagues
            turned out to sit outside the rule's measured scope. */}
        <p className={'text-ink-subtle text-xs mt-4'}>
          {counts.total} competitions covered, {counts.priced} of them priced against a bookmaker
          market, and {counts.stakeable} where a selection is possible at all.
        </p>
      </div>
      <div className={'mt-24 flex flex-col items-center gap-4 text-center'}>
        <h2 className={'text-xl font-semibold'}>Frequently asked questions</h2>
        <ExpandableCard
          title={'How is performance measured?'}
          description={
            'Every selection is published before kick-off, staked at one unit, and settled against the closing result at the price actually available. The rolling 7- and 30-day ROI on the track record page is computed from that ledger, which is append-only. Three figures are always shown — 1X2 alone, all markets, and the StatPitch rule — because they are different strategies and averaging them would answer none of them. Past performance does not guarantee future results.'
          }
        />
        <ExpandableCard
          title={'What model powers the predictions?'}
          description={
            'A fitted goal model producing scoreline distributions, rated primarily on club Elo alongside recent venue form, rest days and head-to-head history. Each fixture reports which model version produced it, and flags when it fell back to the weaker Elo-Poisson estimate or to a prior rating for an unrated club.'
          }
        />
        <ExpandableCard
          title={'Can I cancel anytime?'}
          description={
            'Yes. No contracts, no lock-in. Cancel from your dashboard at any point and your access continues until the end of the billing period.'
          }
        />
        <ExpandableCard
          title={'What does the API access include?'}
          description={
            'Elite subscribers get a REST API with endpoints for match predictions, probability distributions, and market edge scores. Rate limit is 2,000 requests/day. Full OpenAPI spec provided.'
          }
        />
        <ExpandableCard
          title={'Is this available for in-play / live predictions?'}
          description={
            'Live in-play predictions are on the roadmap for Q3 2026. Pro and Elite subscribers will get early access when the feature launches.'
          }
        />
      </div>
      {/* Sending somebody who is already signed in to a sign-in page is the one
          thing this block used to do. Nothing is offered to Elite, who has
          nothing left to be offered. */}
      {!loading && tier !== 'elite' && (
        <div
          className={
            'my-24 flex flex-col items-center gap-4 text-center bg-secondary p-6 rounded-lg border border-line'
          }
        >
          <div className={'h-1.5 w-1.5 bg-primary rounded-full animate-pulse'}></div>
          <p>{isSignedIn ? 'Not ready to decide?' : 'Still not sure?'}</p>
          <p className={'text-xs text-ink-subtle'}>
            {isSignedIn
              ? 'Your plan, the trial and your API keys all live on your account page.'
              : 'Start free — no card needed. Upgrade when the edge speaks for itself.'}
          </p>
          <Link
            to={isSignedIn ? '/account' : '/login'}
            className={'p-3 bg-primary text-background rounded-md flex items-center gap-2 my-4'}
          >
            <BrainIcon className={'h-4 w-4 text-background'} />
            <span className={'text-sm font-semibold'}>
              {isSignedIn ? 'Go to your account' : 'Start free trial'}
            </span>
          </Link>
        </div>
      )}
    </section>
  )
}

export default PricingPage
