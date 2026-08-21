import { hasFullDetail } from './entitlement'
import { reliability } from './reliability'
import type { Confidence, Fixture } from '../types/api'

/**
 * How much the API says this particular prediction is worth.
 *
 * This supersedes the local `reliability` heuristic wherever a full payload is
 * available, because it is computed from strictly more: the same Elo and model
 * provenance, plus whether a bookmaker price existed to compare against, plus
 * how decisive the outcome is. Two badges saying overlapping things about the
 * same fixture would be exactly the noise the card was cleaned up to remove.
 *
 * `reliability` is still the answer below a full payload, where it can report
 * the one thing a teaser does carry — which model produced the numbers.
 */
export type Band = Confidence | 'fallback'

export interface Assessment {
  band: Band
  label: string
  /** Why it bands where it does. From the API when it says; ours otherwise. */
  reasons: string[]
  /**
   * Whether this is worth saying in a list. Most fixtures sit at medium until
   * odds land, so a badge on every card would carry no information — only a
   * warning does.
   */
  notable: boolean
}

const LABELS: Record<Band, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
  fallback: 'Fallback model',
}

export const BAND_STYLE: Record<Band, string> = {
  low: 'border-negative/40 text-negative',
  medium: 'border-chart-3/40 text-chart-3',
  high: 'border-primary/40 text-primary',
  fallback: 'border-negative/40 text-negative',
}

/**
 * Null when nothing can honestly be said — a teaser whose numbers came from the
 * usual model carries no evidence either way, and silence is not a clean bill
 * of health.
 */
export function assess(fixture: Fixture): Assessment | null {
  if (hasFullDetail(fixture)) {
    return {
      band: fixture.confidence,
      label: LABELS[fixture.confidence],
      reasons: fixture.confidence_reasons,
      // Data quality vetoes decisiveness, so a low band is the one that
      // changes what a reader should do with the number beside it.
      notable: fixture.confidence === 'low',
    }
  }

  const rated = reliability(fixture)
  if (rated === null) return null

  return {
    band: 'fallback',
    label: LABELS.fallback,
    reasons: [rated.hint],
    notable: true,
  }
}
