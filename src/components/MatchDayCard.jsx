import DonutChart from './ui/DonutChart.jsx'
import { BrainIcon, ChartIcon, ShortArrowIcon, ThunderIcon } from '../assets/icons/index.js'
import BarChart from './ui/BarChart.jsx'
import useBestPrediction from '../hooks/useBestPrediction.js'
import MarketBlock from './MarketBlock.jsx'
import { buildMarkets } from '../utils/buildMarkets.js'
import { useState } from 'react'
import MatchCardContainer from './MatchCardContainer.jsx'

function MatchDayCard() {
  const { prediction, loading, error } = useBestPrediction({ limit: 10, offset: 0 })
  const [isOpened, setIsOpened] = useState(false)
  const markets = buildMarkets(prediction)
  const bestBet = prediction.best_overall_bet
  const bestMarket = markets.find((market) => market.key === bestBet)

  const isHomeWin = prediction.home_win_prob > prediction.away_win_prob
  const winner = isHomeWin
    ? {
        isHome: true,
        name: prediction.home_team,
        prob: (prediction.home_win_prob * 100).toFixed(2),
      }
    : {
        isHome: false,
        name: prediction.away_team,
        prob: (prediction.away_win_prob * 100).toFixed(2),
      }

  if (loading)
    return <div className={'h-120 w-90 mt-4 mx-auto bg-secondary animate-pulse rounded-md'}></div>
  if (error) return <p>Error: {error.message}</p>
  if (!prediction || prediction.length === 0) return <p>No prediction available.</p>

  return (
    <div
      className={
        'border border-emerald-500/20 bg-zinc-900/60 m-2 rounded-md mt-4 lg:w-2/3 mx-2 lg:mx-auto'
      }
    >
      <div
        className={
          'flex flex-col bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 p-4'
        }
      >
        <div className={'w-full'}>
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
                <p className={'text-xs'}>
                  Tonight,{' '}
                  {new Date(prediction.commence_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  GMT-6
                </p>
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
              <p className={'text-sm mt-2 text-center'}>{prediction.home_team}</p>
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
                <p className={'text-primary font-bold'}>{prediction.home_xg.toFixed(2)}</p>
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
              <p className={'text-sm mt-2 text-center'}>{prediction.away_team}</p>
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
                <p className={'text-chart-2 font-bold'}>{prediction.away_xg.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <BarChart
            home={prediction.home_win_prob * 100}
            away={prediction.away_win_prob * 100}
            draw={prediction.draw_prob * 100}
          />

          <div
            className={`justify-between items-center text-xs gap-2 mt-4 border border-primary/20 rounded-md px-2 py-3 bg-primary/10 ${
              prediction.best_overall_bet ? 'flex' : 'hidden'
            }`}
          >
            <div className={'flex items-center gap-2'}>
              <ThunderIcon className={'h-4 w-4 text-primary'} />
              <div className={'flex flex-col gap-1'}>
                <p className={'text-xs text-secondary-foreground/60'}>TOP PICK MODEL V3</p>
                <p className={'text-sm'}>{bestMarket?.market}</p>
              </div>
            </div>
            <div className={'flex gap-4'}>
              <div className={'text-center'}>
                <p className={'text-xs text-secondary-foreground/60 mb-1'}>EV</p>
                <p className={'text-primary font-bold text-sm'}>+{bestMarket?.ev.toFixed(2)}%</p>
              </div>
              <div className={'text-center'}>
                <p className={'text-xs text-secondary-foreground/60 mb-1'}>Kelly Stake</p>
                <p className={'text-sm'}>{bestMarket?.kelly.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'}>
            <div className={'mt-4 text-secondary-foreground/50 flex gap-4'}>
              <DonutChart value={winner.prob} />
              <div>
                <p className={'text-xs'}>AI CONFIDENCE</p>
                <div className={'flex items-center gap-2'}>
                  <BrainIcon className={`text-primary`} />
                  <p className={`text-sm text-foreground`}>
                    Prediction:
                    <span className={`font-bold text-primary`}> {winner.name} Win</span>
                  </p>
                </div>
                <p className={'text-xs shrink-0'}>
                  Model {prediction.model_version} - Gradient Boost - Neuronal Net Ensemble
                </p>
              </div>
            </div>

            <button
              className={
                'mt-4 p-4 max-h-12 lg:justify-self-end bg-accent/40 border border-accent/80 text-foreground rounded-md py-2 flex items-center justify-center gap-2 text-sm'
              }
              onClick={() => setIsOpened((prev) => !prev)}
            >
              <ChartIcon className={'h-4 w-4 text-primary'} />
              <p>Market Breakdown</p>
              <ShortArrowIcon className={`h-4 w-4 ${isOpened ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        <MatchCardContainer
          markets={markets}
          prediction={prediction}
          isOpened={isOpened}
          bestBet={bestBet}
        />
      </div>
    </div>
  )
}

export default MatchDayCard
