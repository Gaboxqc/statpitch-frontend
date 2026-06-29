import { ArrowIcon, ChartIcon, TargetIcon, ThunderIcon, TrophyIcon } from '../assets/icons/index.js'

export function buildStats(stats) {
  return [
    {
      icon: <ChartIcon className={'text-accent'} />,
      label: 'Predictions today',
      value: stats.predictions_today,
      color: 'text-foreground',
    },
    {
      icon: <ArrowIcon className={'text-accent'} />,
      label: 'High confidence',
      value: stats.high_confidence_today,
      color: 'text-foreground',
    },
    {
      icon: <TrophyIcon className={'text-accent'} />,
      label: 'Value bets today',
      value: stats.value_bets_today,
      color: 'text-primary',
    },
    {
      icon: <TargetIcon className={'text-accent'} />,
      label: '30d model accuracy',
      value: 69.2 + '%',
      color: 'text-primary',
    },
    {
      icon: <ThunderIcon className={'text-accent'} />,
      label: '30d ROI',
      value: stats.roi_30d + '%',
      color: 'text-primary',
    },
  ]
}
