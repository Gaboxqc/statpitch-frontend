import DonutChart from './ui/DonutChart.jsx'
import { ClockIcon, ShortArrowIcon, ThunderIcon } from '../assets/icons/index.js'
import { useState } from 'react'
import { buildMarkets } from '../utils/buildMarkets.js'
import MatchCardContainer from './MatchCardContainer.jsx'

function MatchCard({ prediction }) {
  const [isOpened, setIsOpened] = useState(false)
  const markets = buildMarkets(prediction)
  const bestBet = prediction.best_overall_bet
  const bestMarket = markets.find((market) => market.key === bestBet)

  const isHomeWin = prediction.home_win_prob > prediction.away_win_prob
  const winner = isHomeWin
    ? { isHome: true, name: 'Home', prob: (prediction.home_win_prob * 100).toFixed(2) }
    : { isHome: false, name: 'Away', prob: (prediction.away_win_prob * 100).toFixed(2) }

  return (
    <div
      className={
        'py-2 lg:py-2 flex flex-col items-center justify-center bg-secondary/40 text-foreground text-xs rounded-md border border-secondary-foreground/20'
      }
      onClick={() => setIsOpened((prev) => !prev)}
    >
      <div className={'flex flex-col items-center justify-between w-full m-2 gap-2'}>
        <div className={'flex items-center px-2 self-end w-full justify-between lg:px-4'}>
          <p>FIFA World Cup</p>

          <div className={'flex items-center gap-1'}>
            <div
              className={`gap-2 items-center p-1 shrink-0 bg-primary/10 rounded-sm text-xs text-primary border border-primary/50 mr-1 ${bestBet ? 'flex' : 'hidden'}`}
            >
              <ThunderIcon className={'h-3 w-3 text-primary'} />
              <p>
                {bestMarket?.market} {bestMarket?.ev?.toFixed(2)}% EV
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
                alt='Home flag'
                className={'w-6 h-6 object-contain rounded-sm'}
              />

              <p className={'text-sm w-min'}>{prediction.home_team}</p>
              <p className='text-xs text-secondary-foreground shrink-0'>
                xG {prediction.home_xg.toFixed(2)}
              </p>
            </div>
            <div className={'flex items-center gap-2'}>
              <img
                src={prediction.away_flag_url}
                alt='Home flag'
                className={'w-6 h-6 object-contain rounded-sm'}
              />

              <p className={'text-sm'}>{prediction.away_team}</p>
              <p className='text-xs text-secondary-foreground shrink-0'>
                xG {prediction.away_xg.toFixed(2)}
              </p>
            </div>
          </div>

          <div className={'flex items-center gap-2 w-full px-4 justify-end'}>
            <div className={'hidden lg:flex items-center gap-2'}>
              <div
                className={`flex flex-col justify-center items-center h-14 w-14 border rounded-lg text-xs ${winner.isHome ? 'bg-primary/10 border-primary/50' : 'border-secondary-foreground/20'}`}
              >
                <p className={'text-secondary-foreground/60'}>Home</p>
                <p
                  className={`font-bold ${winner.isHome ? 'text-primary ' : 'text-secondary-foreground'}`}
                >
                  {(prediction.home_win_prob * 100).toFixed(2)}%
                </p>
              </div>
              <div
                className={
                  'flex flex-col justify-center items-center h-14 w-14 border border-secondary-foreground/20 rounded-lg p-4'
                }
              >
                <p className={'text-secondary-foreground/60'}>Draw</p>
                <p className={'font-bold text-secondary-foreground'}>
                  {(prediction.draw_prob * 100).toFixed(2)}
                </p>
              </div>
              <div
                className={`flex flex-col justify-center items-center h-14 w-14 border rounded-lg p-4 ${winner.isHome ? 'border-secondary-foreground/20' : 'bg-primary/10 border-primary/50'}`}
              >
                <p className={'text-secondary-foreground/60'}>Away</p>
                <p
                  className={`font-bold ${winner.isHome ? 'text-secondary-foreground' : 'text-primary '}`}
                >
                  {(prediction.away_win_prob * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            <div className={'flex items-center gap-2 justify-end'}>
              <DonutChart value={winner.prob} size={50} />
              <ShortArrowIcon
                className={`h-4 w-4 text-secondary-foreground/60 ${isOpened ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={'grid grid-cols-3 mt-2 gap-4 w-full px-4 mb-2 lg:hidden'}>
        <div
          className={`flex justify-center gap-2 border rounded-md px-8 py-2 ${winner.isHome ? 'bg-primary/10 border-primary/50' : 'border-secondary-foreground/20'}`}
        >
          <p className={'text-secondary-foreground/60'}>Home</p>
          <p
            className={`font-bold ${winner.isHome ? 'text-primary ' : 'text-secondary-foreground'}`}
          >
            {(prediction.home_win_prob * 100).toFixed(2)}%
          </p>
        </div>
        <div
          className={`flex justify-center gap-2 border border-secondary-foreground/20 rounded-md px-8 py-2`}
        >
          <p className={'text-secondary-foreground/60 '}>Draw</p>
          <p className={'font-bold text-secondary-foreground'}>
            {(prediction.draw_prob * 100).toFixed(2)}%
          </p>
        </div>
        <div
          className={`flex justify-center gap-2 border rounded-lg px-8 py-2 ${winner.isHome ? 'border-secondary-foreground/20' : 'bg-primary/10 border-primary/50'}`}
        >
          <p className={'text-secondary-foreground/60'}>Away</p>
          <p
            className={`font-bold ${winner.isHome ? 'text-secondary-foreground' : 'text-primary '}`}
          >
            {(prediction.away_win_prob * 100).toFixed(2)}%
          </p>
        </div>
      </div>
      <div className={'w-full px-4'}>
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
export default MatchCard
