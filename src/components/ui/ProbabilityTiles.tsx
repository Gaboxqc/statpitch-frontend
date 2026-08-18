import { formatFraction } from '../../utils/format'
import type { Fixture } from '../../types/api'
import type { PredictionView } from '../../utils/predictionView'

const VARIANTS = {
  compact: {
    wrapper: 'hidden lg:flex items-center gap-2',
    tile: 'flex flex-col justify-center items-center h-14 w-14 border rounded-lg text-xs',
  },
  wide: {
    wrapper: 'grid grid-cols-3 gap-4 w-full lg:hidden',
    tile: 'flex justify-center gap-2 border rounded-md px-8 py-2',
  },
}

interface ProbabilityTilesProps {
  prediction: Fixture
  winner: PredictionView['winner']
  variant?: keyof typeof VARIANTS
  className?: string
}

function ProbabilityTiles({
  prediction,
  winner,
  variant = 'compact',
  className = '',
}: ProbabilityTilesProps) {
  const styles = VARIANTS[variant]

  const tiles = [
    { label: 'Home', value: prediction.home_win_prob, highlighted: winner.isHome },
    { label: 'Draw', value: prediction.draw_prob, highlighted: false },
    { label: 'Away', value: prediction.away_win_prob, highlighted: !winner.isHome },
  ]

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {tiles.map(({ label, value, highlighted }) => (
        <div
          key={label}
          className={`${styles.tile} ${
            highlighted ? 'bg-primary/10 border-primary/50' : 'border-secondary-foreground/20'
          }`}
        >
          <p className={'text-secondary-foreground/60'}>{label}</p>
          <p className={`font-bold ${highlighted ? 'text-primary' : 'text-secondary-foreground'}`}>
            {formatFraction(value)}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ProbabilityTiles
