import type { Basis } from '../types/api'

/**
 * The three strategies, in the order they are always shown.
 *
 * Enumerated once because the compiler cannot check an array the way it checks
 * a `Record<Basis, …>` — the curve builder and the URL guard both listed two
 * bases and went on compiling when a third arrived.
 */
export const BASES: Basis[] = ['1x2', 'overall', 'rule']

/** Short form, for a table cell or a chart legend. */
export const BASIS_LABELS: Record<Basis, string> = {
  '1x2': '1X2',
  overall: 'Overall',
  rule: 'Rule',
}

/** What each strategy actually is, wherever there is room to say it. */
export const BASIS_DETAIL: Record<Basis, { title: string; blurb: string }> = {
  '1x2': { title: '1X2 only', blurb: 'Our best home, draw or away pick.' },
  overall: {
    title: 'All markets',
    blurb: 'Our best pick across 1X2, over/under and both-teams-to-score.',
  },
  rule: {
    title: 'StatPitch rule',
    blurb: "StatPitch's own pick, taken where a book's price disagrees with the benchmark.",
  },
}
