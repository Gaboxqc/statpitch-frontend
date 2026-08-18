import { ArrowIcon, BrainIcon, ChartIcon, ThunderIcon } from '../assets/icons/index'
import PricingCard from '../components/pricing/PricingCard'
import { pricingPlans } from '../utils/pricingPlans'
import ExpandableCard from '../components/ui/ExpandableCard'
import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { MARKETING_STATS } from '../constants/content'

function PricingPage() {
  useDocumentTitle('Pricing')

  return (
    <section className={'container mx-auto px-2 py-14'}>
      <div className={'mt-12 flex flex-col items-center gap-4 text-center'}>
        <div
          className={
            'flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/15 p-2 text-sm font-bold text-primary'
          }
        >
          <BrainIcon className={'h-4 w-4 text-primary'} />
          <p>ML-POWERED PREDICTIONS</p>
        </div>
        <div>
          <h1 className={'text-3xl font-bold'}>
            Transparent Pricing
            <span className={'block text-primary'}>No dark patterns</span>
          </h1>
        </div>
        <p className={'text-sm text-secondary-foreground/60'}>
          Choose the plan that matches your edge. Every tier includes a confidence score and
          probability breakdown — no black boxes.
        </p>
      </div>
      <div>
        <p className={'my-12 text-center'}>Monthly</p>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
      <div
        className={
          'grid grid-cols-2 gap-4 mt-24 bg-accent/10 p-4 rounded-lg border border-accent/20'
        }
      >
        <div className={'flex flex-col items-center gap-2'}>
          <ChartIcon className={'h-4 w-4 text-accent'} />
          <p className={'text-2xl font-bold text-primary'}>
            {MARKETING_STATS.predictionsPublished}
          </p>
          <p className={'text-secondary-foreground/50 text-xs'}>Predictions published</p>
        </div>
        <div className={'flex flex-col items-center gap-2'}>
          <BrainIcon className={'h-4 w-4 text-accent'} />
          <p className={'text-2xl font-bold text-primary'}>{MARKETING_STATS.accuracy}</p>
          <p className={'text-secondary-foreground/50 text-xs'}>Model accuracy (90d)</p>
        </div>
        <div className={'flex flex-col items-center gap-2'}>
          <ArrowIcon className={'h-4 w-4 text-accent'} />
          <p className={'text-2xl font-bold text-primary'}>{MARKETING_STATS.roi}</p>
          <p className={'text-secondary-foreground/50 text-xs'}>Avg. tracked ROI</p>
        </div>
        <div className={'flex flex-col items-center gap-2'}>
          <ThunderIcon className={'h-4 w-4 text-accent'} />
          <p className={'text-2xl font-bold text-primary'}>{MARKETING_STATS.leagues}</p>
          <p className={'text-secondary-foreground/50 text-xs'}>Leagues monitored</p>
        </div>
      </div>
      <div className={'mt-24 flex flex-col items-center gap-4 text-center'}>
        <h2 className={'text-xl font-bold'}>Frequently asked questions</h2>
        <ExpandableCard
          title={'How accurate is the model?'}
          description={`Over the past 90 days, our ensemble model achieved a ${MARKETING_STATS.accuracy} accuracy rate on 1X2 predictions with a confidence threshold above 70%. ROI on tracked selections sits at ${MARKETING_STATS.roi} for the rolling 30-day window. Past performance does not guarantee future results.`}
        />
        <ExpandableCard
          title={'What models powers the prediction?'}
          description={
            'StatPitch uses a stacked ensemble: a Gradient Boosting classifier (XGBoost), a Recurrent Neural Network for form sequences, and a Poisson regression layer for scoreline distributions. Outputs are calibrated with Platt Scaling before being published.'
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
        <p className={'text-xs text-foreground/40'}>
          Start free — no card needed. Upgrade when the edge speaks for itself.
        </p>
        <Link
          to={'/login'}
          className={'p-3 bg-primary text-background rounded-md flex items-center gap-2 my-4'}
        >
          <BrainIcon className={'h-4 w-4 text-background'} />
          <span className={'text-sm font-bold'}>Start free trial</span>
        </Link>
      </div>
    </section>
  )
}

export default PricingPage
