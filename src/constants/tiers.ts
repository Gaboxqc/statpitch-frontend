import type { Tier } from '../types/account'

/** How a tier is written wherever a reader sees one. One spelling, everywhere. */
export const TIER_LABELS: Record<Tier, string> = { free: 'Free', pro: 'Pro', elite: 'Elite' }
