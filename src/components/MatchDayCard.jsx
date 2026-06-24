import DonutChart from './ui/DonutChart.jsx'
import { BrainIcon } from '../assets/icons/index.js'
import BarChart from './ui/BarChart.jsx'
import useBestPrediction from '../hooks/useBestPrediction.js'

function MatchDayCard() {
  const { prediction, loading, error } = useBestPrediction({ limit: 10, offset: 0 })

  // eslint-disable-next-line no-useless-assignment
  let winner = {}
  if (prediction.home_win_prob > prediction.away_win_prob) {
    winner = { isHome: true, name: 'Home', prob: (prediction.home_win_prob * 100).toFixed(2) }
  } else {
    winner = { isHome: false, name: 'Away', prob: (prediction.away_win_prob * 100).toFixed(2) }
  }

  return (
    <div className={'border border-emerald-500/20 bg-zinc-900/60 m-2 rounded-md mt-4'}>
      <div
        className={
          'flex flex-col bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 p-4'
        }
      >
        <div className={'grid grid-cols-1  md:grid-cols-2'}>
          <div className={'flex items-center gap-2 pb-2'}>
            <div className={'h-1 w-1 bg-primary rounded-full animate-pulse'}></div>
            <p className={'text-secondary-foreground text-xs'}>MATCH OF THE DAY</p>
          </div>

          <div
            className={
              'flex justify-between items-center py-4 text-secondary-foreground md:justify-end md:gap-4'
            }
          >
            <div>
              <p className={'text-xs'}>FIFA World Cup</p>
            </div>
            <div>
              <p className={'text-xs'}>Tonight, 21:00 CET</p>
            </div>
          </div>
        </div>

        <div className={'flex justify-center gap-4 text-foreground mt-4'}>
          <div className={'flex flex-col items-center'}>
            <div className={'w-20 h-20 md:w-40 md:h-40'}>
              <img
                src={prediction.home_flag_url}
                alt='Home flag'
                className={'w-full h-full object-contain rounded-sm'}
              />
            </div>
            <p className={'text-sm mt-2'}>{prediction.home_team}</p>
            <p className={'text-2xl text-primary font-bold'}>
              {(prediction.home_win_prob * 100).toFixed(2)}%
            </p>
            <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
            <div
              className={
                'flex gap-2 mt-2 text-xs bg-accent/40 p-1 rounded-sm border border-accent/80'
              }
            >
              <p className={'text-secondary-foreground/70'}>XG</p>
              <p className={'text-primary font-bold'}>{prediction.home_xg}</p>
            </div>
          </div>
          <div className={'flex flex-col items-center justify-center gap-4 mx-4'}>
            <p className={'text-xs'}>vs</p>
            <div
              className={
                'flex flex-col items-center bg-accent/40 border border-accent/80 px-4 py-2 rounded-xl'
              }
            >
              <p className={'text-xs text-secondary-foreground/60'}>DRAW</p>
              <p className={'text-md text-secondary-foreground'}>
                {(prediction.draw_prob * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <div className={'flex flex-col items-center'}>
            <div className={'w-20 h-20 md:w-40 md:h-40'}>
              <img
                src={prediction.away_flag_url}
                alt='Away flag'
                className={'w-full h-full object-contain rounded-sm'}
              />
            </div>
            <p className={'text-sm mt-2'}>{prediction.away_team}</p>
            <p className={'text-2xl font-bold text-chart-2'}>
              {(prediction.away_win_prob * 100).toFixed(2)}%
            </p>
            <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
            <div
              className={
                'flex gap-2 mt-2 text-xs bg-accent/40 p-1 rounded-sm border border-accent/80'
              }
            >
              <p className={'text-secondary-foreground/70'}>XG</p>
              <p className={'text-chart-2 font-bold'}>{prediction.away_xg}</p>
            </div>
          </div>
        </div>

        <BarChart
          home={prediction.home_win_prob * 100}
          away={prediction.away_win_prob * 100}
          draw={prediction.draw_prob * 100}
        />

        <div className={'mt-4 text-secondary-foreground/50 flex gap-4'}>
          <DonutChart value={winner.prob} />
          <div>
            <p className={'text-xs'}>AI CONFIDENCE</p>
            <div className={'flex items-center gap-2'}>
              <BrainIcon className={`${winner.isHome ? 'text-primary' : 'text-chart-2'}`} />
              <p className={`${winner.isHome ? 'text-primary' : 'text-chart-2'} text-sm`}>
                Prediction:
                <span className={`font-bold `}> {winner.name} Win</span>
              </p>
            </div>
            <p className={'text-xs shrink-0'}>
              Model {prediction.model_version} - Gradient Boost - Neuronal Net Ensemble
            </p>
          </div>
        </div>

        <button className={'hidden mt-4 w-full bg-primary/10 text-primary rounded-md py-2'}>
          <p>Market Breakdown</p>
        </button>
      </div>
    </div>
  )
}

export default MatchDayCard
