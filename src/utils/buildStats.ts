import { formatCount, formatFraction, formatSignedPercent } from './format'
import type { Basis, Stats, WindowRoi } from '../types/api'

export interface StatItemData {
  id: string
  label: string
  value: string
  color: string
  /** Longer explanation, surfaced as a title so the compact strip stays short. */
  hint?: string
}

const EMPTY_WINDOW = 'No bets settled yet'

function findBasis(stats: Stats, basis: Basis): WindowRoi | undefined {
  return stats.roi.find((entry) => entry.basis === basis)?.month
}

/**
 * `roi_pct` arrives already on a 0–100 scale, unlike every probability and EV
 * on a fixture, which are 0–1 fractions. It is also null rather than 0.0 when
 * nothing settled — rendering that as break-even would claim a result that was
 * never measured.
 */
function roiItem(id: string, label: string, roi: WindowRoi | undefined): StatItemData {
  const settled = roi && roi.bets > 0 && roi.roi_pct !== null
  return {
    id,
    label,
    value: settled ? formatSignedPercent(roi.roi_pct, 1) : '—',
    color: !settled
      ? 'text-secondary-foreground/50'
      : roi.roi_pct! >= 0
        ? 'text-primary'
        : 'text-chart-5',
    hint: settled
      ? `${roi.bets} bets, ${roi.wins} won, ${roi.pnl_units.toFixed(2)}u`
      : EMPTY_WINDOW,
  }
}

export function buildStats(stats: Stats | null): StatItemData[] {
  if (!stats) return []

  const threshold = formatFraction(stats.high_confidence_threshold, 0)

  return [
    {
      id: 'fixturesToday',
      label: 'Fixtures today',
      value: formatCount(stats.fixtures_today),
      color: 'text-foreground',
      hint: `${stats.date_confirmed_today} with a confirmed kickoff`,
    },
    {
      id: 'fixturesTomorrow',
      label: 'Tomorrow',
      value: formatCount(stats.fixtures_tomorrow),
      color: 'text-foreground',
    },
    {
      id: 'highConfidence',
      label: `High confidence (${threshold}+)`,
      value: formatCount(stats.high_confidence_today),
      color: 'text-foreground',
      hint: 'Home or away probability at or above the threshold. A likely draw is not a confident match.',
    },
    {
      id: 'valueBets',
      label: 'Value bets today',
      value: formatCount(stats.value_bets_today),
      color: 'text-primary',
      hint: 'Selections clearing the minimum fractional Kelly.',
    },
    // The two series measure different strategies and are never averaged.
    roiItem('roi1x2', '30d ROI · 1X2', findBasis(stats, '1x2')),
    roiItem('roiOverall', '30d ROI · Overall', findBasis(stats, 'overall')),
  ]
}
