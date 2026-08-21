import type { Tier } from '../types/account'

export interface PricingPlan {
  /** Which tier this card sells, so the CTA can be decided from the account. */
  id: Tier
  name: string
  description: string
  price: string
  period: string | null
  isPopular: boolean
  buttonText: string
  buttonLink: string
  availableFeatures: string[]
  notAvailableFeatures: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get a feel for the model',
    price: 'Free',
    period: null,
    isPopular: false,
    buttonText: 'Start free',
    buttonLink: '/login',
    availableFeatures: [
      '3 predictions per day',
      'The 5 priced leagues only',
      '1X2 win probabilities',
      'Match of the Day pick',
    ],
    notAvailableFeatures: [
      'Market breakdown (Book vs ML)',
      'Edge & value indicators',
      'AI confidence scoring',
      'Settled bet ledger & ROI',
      'API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious bettors',
    price: '$29',
    period: '/mo',
    isPopular: true,
    buttonText: 'Start 14-day trial',
    buttonLink: '/login',
    availableFeatures: [
      'Unlimited predictions',
      'All 12 competitions',
      '1X2 win probabilities',
      'Match of the Day pick',
      'Market breakdown (Book vs ML)',
      'Edge & value indicators',
      'AI confidence scoring',
      'Settled bet ledger & ROI',
    ],
    notAvailableFeatures: ['API access'],
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Maximum edge, raw access',
    price: '$79',
    period: '/mo',
    isPopular: false,
    buttonText: 'Contact us',
    buttonLink: '/login',
    availableFeatures: [
      'Unlimited predictions',
      'All 12 competitions',
      '1X2 win probabilities',
      'Match of the Day pick',
      'Market breakdown (Book vs ML)',
      'Edge & value indicators',
      'AI confidence scoring',
      'Settled bet ledger & ROI',
      'API access',
    ],
    notAvailableFeatures: [],
  },
]
