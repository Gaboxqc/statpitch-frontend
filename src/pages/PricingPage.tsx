import { BrainIcon } from '../assets/icons/index'
import PricingCard from '../components/pricing/PricingCard'
import { pricingPlans } from '../utils/pricingPlans'
import ExpandableCard from '../components/ui/ExpandableCard'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import LiveRoi from '../components/track-record/LiveRoi'
import { COMPETITIONS } from '../constants/competitions'

function PricingPage() {
  useDocumentTitle('Pricing')

  return (
    <section className={'container mx-auto px-2 py-14'}>
      <div className={'mt-12 flex flex-col items-center gap-4 text-center'}>
        <div
          className={
            'eyebrow flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-3 py-1.5 text-primary'
          }
        >
          <BrainIcon className={'h-4 w-4 text-primary'} />
          <p>ML-powered predictions</p>
        </div>
        <div>
          <h1 className={'text-2xl font-semibold md:text-3xl'}>
            Transparent Pricing
            <span className={'block text-primary'}>No dark patterns</span>
          </h1>
        </div>
        <p className={'max-w-xl text-base text-ink-subtle'}>
          Choose the plan that matches your edge. Every tier includes a confidence score and
          probability breakdown — no black boxes.
        </p>
      </div>
      <div>
        <p className={'eyebrow my-12 text-center text-ink-muted'}>Monthly</p>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
      <div className={'mt-24 bg-accent/10 p-4 rounded-lg border border-accent/20'}>
        <LiveRoi />
        <p className={'text-ink-subtle text-xs mt-4'}>
          {COMPETITIONS.length} competitions covered,{' '}
          {COMPETITIONS.filter((entry) => entry.priced).length} of them priced against a bookmaker
          market. Only priced competitions can produce a selection.
        </p>
      </div>
      <div className={'mt-24 flex flex-col items-center gap-4 text-center'}>
        <h2 className={'text-xl font-semibold'}>Frequently asked questions</h2>
        <ExpandableCard
          title={'How is performance measured?'}
          description={
            'Every selection is published before kick-off, staked at one unit, and settled against the closing result at the price actually available. The rolling 7- and 30-day ROI on the track record page is computed from that ledger, which is append-only. Two figures are always shown — 1X2 alone and all markets — because they are different strategies and averaging them would answer neither. Past performance does not guarantee future results.'
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
      <div
        className={
          'my-24 flex flex-col items-center gap-4 text-center bg-accent/20 p-4 rounded-lg border border-accent/30'
        }
      >
        <div className={'h-1.5 w-1.5 bg-primary rounded-full animate-pulse'}></div>
        <p>Still not sure?</p>
        <p className={'text-xs text-ink-subtle'}>
          Start free — no card needed. Upgrade when the edge speaks for itself.
        </p>
        <Link
          to={'/login'}
          className={'p-3 bg-primary text-background rounded-md flex items-center gap-2 my-4'}
        >
          <BrainIcon className={'h-4 w-4 text-background'} />
          <span className={'text-sm font-semibold'}>Start free trial</span>
        </Link>
      </div>
    </section>
  )
}

export default PricingPage
