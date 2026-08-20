import { Link } from 'react-router'
import { CheckIcon } from '../../assets/icons/index'
import type { PricingPlan } from '../../utils/pricingPlans'

function PricingCard({
  name,
  description,
  price,
  period,
  availableFeatures,
  notAvailableFeatures,
  isPopular,
  buttonText,
  buttonLink,
}: PricingPlan) {
  return (
    <div
      className={`flex flex-col p-5 border rounded-lg gap-5 relative ${
        isPopular ? 'border-primary bg-primary/10' : 'border-line bg-secondary'
      }`}
    >
      {isPopular && (
        <span className='absolute -top-3 left-1/2 -translate-x-1/2 eyebrow bg-primary text-primary-foreground px-3 py-1 rounded-full'>
          Most popular
        </span>
      )}

      <div>
        <p className={'text-sm font-medium text-ink'}>{name}</p>
        <p className={'text-xs text-ink-muted'}>{description}</p>
      </div>

      <p className={'numeric text-2xl font-semibold'}>
        {price}
        {period && <span className={'text-sm font-normal text-ink-muted'}>{period}</span>}
      </p>

      <Link
        to={buttonLink}
        className={`w-full p-2.5 rounded-md text-sm text-center font-semibold my-2 ${isPopular ? 'bg-primary text-background' : 'bg-secondary text-ink border border-line'}`}
      >
        {buttonText}
      </Link>

      <ul className={'flex flex-col gap-2'}>
        {availableFeatures.map((feature: string) => (
          <li key={feature} className={'flex items-center gap-2'}>
            <div
              className={`h-4 w-4 bg-secondary rounded-md border flex items-center justify-center ${isPopular ? 'bg-primary/10 border-primary/40' : 'bg-secondary border-line'}`}
            >
              <CheckIcon
                className={`h-2.5 w-2.5 ${isPopular ? 'text-primary' : 'text-ink-muted'}`}
              />
            </div>
            <p className={'text-xs text-ink'}>{feature}</p>
          </li>
        ))}

        {notAvailableFeatures.map((feature: string) => (
          <li key={feature} className={'flex items-center gap-2'}>
            <div className='h-4 w-4 bg-card rounded-md border border-line flex items-center justify-center' />
            <p className={'text-xs text-ink-subtle'}>{feature}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PricingCard
