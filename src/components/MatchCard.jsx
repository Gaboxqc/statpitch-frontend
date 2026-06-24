import DonutChart from './ui/DonutChart.jsx'
import { ClockIcon } from '../assets/icons/index.js'

function MatchCard({
  home,
  away,
  home_xg,
  away_xg,
  home_win_prob,
  away_win_prob,
  draw_prob,
  home_flag_url,
  away_flag_url,
}) {
  let winner = {}
  if (home_win_prob > away_win_prob) {
    winner = { isHome: true, name: 'Home', prob: (home_win_prob * 100).toFixed(2) }
  } else {
    winner = { isHome: false, name: 'Away', prob: (away_win_prob * 100).toFixed(2) }
  }
  return (
    <div
      className={
        'h-40 md:h-30 flex flex-col items-center justify-center bg-secondary text-foreground text-xs rounded-md border border-secondary-foreground/20'
      }
    >
      <div className={'flex items-center justify-between w-full m-2'}>
        <div className={'flex flex-col gap-2 mx-4'}>
          <p>FIFA World Cup</p>
          <div className={'flex items-center gap-2'}>
            <div className={'w-4 h-4'}>
              <img
                src={home_flag_url}
                alt='Home flag'
                className={'w-full h-full object-contain rounded-sm'}
              />
            </div>
            <p className={'text-sm w-min'}>{home}</p>
            <p className='text-xs text-secondary-foreground'>xG {home_xg}</p>
          </div>
          <div className={'flex items-center gap-2'}>
            <div className={'w-4 h-4'}>
              <img
                src={away_flag_url}
                alt='Home flag'
                className={'w-full h-full object-contain rounded-sm'}
              />
            </div>
            <p className={'text-sm'}>{away}</p>
            <p className='text-xs text-secondary-foreground'>xG {away_xg}</p>
          </div>
        </div>

        <div className={'flex items-center '}>
          <div className={'justify-between gap-2 w-full px-4 hidden md:flex'}>
            <div
              className={`flex flex-col justify-center items-center h-14 w-14 border rounded-lg text-xs ${winner.isHome ? 'bg-primary/10 border-primary/50' : 'border-secondary-foreground/20'}`}
            >
              <p className={'text-secondary-foreground/60'}>1</p>
              <p
                className={`font-bold ${winner.isHome ? 'text-primary ' : 'text-secondary-foreground'}`}
              >
                {(home_win_prob * 100).toFixed(2)}%
              </p>
            </div>
            <div
              className={
                'flex flex-col justify-center items-center h-14 w-14 border border-secondary-foreground/20 rounded-lg p-4'
              }
            >
              <p className={'text-secondary-foreground/60'}>X</p>
              <p className={'font-bold text-secondary-foreground'}>
                {(draw_prob * 100).toFixed(2)}
              </p>
            </div>
            <div
              className={`flex flex-col justify-center items-center h-14 w-14 border rounded-lg p-4 ${winner.isHome ? 'border-secondary-foreground/20' : 'bg-primary/10 border-primary/50'}`}
            >
              <p className={'text-secondary-foreground/60'}>2</p>
              <p
                className={`font-bold ${winner.isHome ? 'text-secondary-foreground' : 'text-primary '}`}
              >
                {(away_win_prob * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className={'flex flex-col items-center gap-4 mr-4'}>
            <div className={'flex items-center gap-1'}>
              <ClockIcon className={'h-4 w-4 text-secondary-foreground/60'} />
              <p className={'text-xs text-secondary-foreground/60'}>17:30</p>
            </div>
            <DonutChart value={winner.prob} />
          </div>
        </div>
      </div>

      <div className={'grid grid-cols-3 gap-4 w-full px-4 mb-2 md:hidden'}>
        <div
          className={`flex justify-center gap-2 border rounded-md px-8 py-2 ${winner.isHome ? 'bg-primary/10 border-primary/50' : 'border-secondary-foreground/20'}`}
        >
          <p className={'text-secondary-foreground/60'}>1</p>
          <p
            className={`font-bold ${winner.isHome ? 'text-primary ' : 'text-secondary-foreground'}`}
          >
            {(home_win_prob * 100).toFixed(2)}%
          </p>
        </div>
        <div
          className={`flex justify-center gap-2 border border-secondary-foreground/20 rounded-md px-8 py-2`}
        >
          <p className={'text-secondary-foreground/60 '}>X</p>
          <p className={'font-bold text-secondary-foreground'}>{(draw_prob * 100).toFixed(2)}%</p>
        </div>
        <div
          className={`flex justify-center gap-2 border rounded-lg px-8 py-2 ${winner.isHome ? 'border-secondary-foreground/20' : 'bg-primary/10 border-primary/50'}`}
        >
          <p className={'text-secondary-foreground/60'}>2</p>
          <p
            className={`font-bold ${winner.isHome ? 'text-secondary-foreground' : 'text-primary '}`}
          >
            {(away_win_prob * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  )
}
export default MatchCard
