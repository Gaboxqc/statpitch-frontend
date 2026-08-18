import { formatCount, formatFraction } from './format'
import type { Stats } from '../types/api'

export interface StatItemData {
  id: string
  label: string
  value: string
  color: string
}

// The API expresses rates as 0–1 fractions (cf. `high_confidence_threshold: 0.7`).
// Null values render as an em dash rather than "null%".
export function buildStats(stats: Partial<Stats>): StatItemData[] {
  return [
    {
      id: 'predictionsToday',
      label: 'Predictions today',
      value: formatCount(stats.predictions_today),
      color: 'text-foreground',
    },
    {
      id: 'highConfidence',
      label: 'High confidence',
      value: formatCount(stats.high_confidence_today),
      color: 'text-foreground',
    },
    {
      id: 'valueBets',
      label: 'Value bets today',
      value: formatCount(stats.value_bets_today),
      color: 'text-primary',
    },
    {
      id: 'accuracy30d',
      label: '30d model accuracy',
      value: formatFraction(stats.accuracy_30d, 1),
      color: 'text-primary',
    },
    {
      id: 'roi30d',
      label: '30d ROI',
      value: formatFraction(stats.roi_30d, 1),
      color: 'text-primary',
    },
  ]
}
