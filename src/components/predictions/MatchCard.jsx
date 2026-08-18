import { useState } from 'react'
import DonutChart from '../ui/DonutChart.jsx'
import ProbabilityTiles from '../ui/ProbabilityTiles.jsx'
import MarketList from './MarketList.jsx'
import { ClockIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index.js'
import { buildPredictionView } from '../../utils/predictionView.js'
import { formatDecimal, formatPercent } from '../../utils/format.js'
import { DEFAULT_COMPETITION } from '../../constants/content.js'

function MatchCard({ prediction }) {
  const [isOpened, setIsOpened] = useState(false)
  const { markets, bestBet, bestMarket, winner } = buildPredictionView(prediction)

  return (
    <div
      className={
        'py-2 lg:py-2 flex flex-col items-center justify-center bg-secondary/40 text-foreground text-xs rounded-md border border-secondary-foreground/20'
      }
      onClick={() => setIsOpened((prev) => !prev)}
    >
      <div className={'flex flex-col items-center justify-between w-full m-2 gap-2'}>
        <div className={'flex items-center px-2 self-end w-full justify-between lg:px-4'}>
          <p>{DEFAULT_COMPETITION}</p>

          <div className={'flex items-center gap-1'}>
            <div
              className={`gap-2 items-center p-1 shrink-0 bg-primary/10 rounded-sm text-xs text-primary border border-primary/50 mr-1 ${bestBet ? 'flex' : 'hidden'}`}
            >
              <ThunderIcon className={'h-3 w-3 text-primary'} />
              <p>
                {bestMarket?.market} {formatPercent(bestMarket?.ev)} EV
              </p>
            </div>
            <ClockIcon className={'h-4 w-4 text-secondary-foreground/60'} />
            <p className={'text-xs text-secondary-foreground/60'}>
              {new Date(prediction.commence_time).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
            </p>
          </div>
        </div>

        <div className={'flex items-center justify-between w-full'}>
          <div className={'flex flex-col gap-2 ml-4 w-full'}>
            <div className={'flex items-center gap-2'}>
              <img
                src={prediction.home_flag_url}
                alt={`${prediction.home_team} flag`}
                className={'w-6 h-6 object-contain rounded-sm'}
              />

              <p className={'text-sm w-min'}>{prediction.home_team}</p>
              <p className='text-xs text-secondary-foreground shrink-0'>
                xG {formatDecimal(prediction.home_xg)}
              </p>
            </div>
            <div className={'flex items-center gap-2'}>
              <img
                src={prediction.away_flag_url}
                alt={`${prediction.away_team} flag`}
                className={'w-6 h-6 object-contain rounded-sm'}
              />

              <p className={'text-sm'}>{prediction.away_team}</p>
              <p className='text-xs text-secondary-foreground shrink-0'>
                xG {formatDecimal(prediction.away_xg)}
              </p>
            </div>
          </div>

          <div className={'flex items-center gap-2 w-full px-4 justify-end'}>
            <ProbabilityTiles prediction={prediction} winner={winner} variant={'compact'} />
            <div className={'flex items-center gap-2 justify-end'}>
              <DonutChart value={winner.prob} size={50} />
              <ShortArrowIcon
                className={`h-4 w-4 text-secondary-foreground/60 ${isOpened ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      <ProbabilityTiles
        prediction={prediction}
        winner={winner}
        variant={'wide'}
        className={'mt-2 px-4 mb-2'}
      />

      <div className={'w-full px-4'}>
        <MarketList markets={markets} isOpened={isOpened} bestBet={bestBet} />
      </div>
    </div>
  )
}

export default MatchCard
