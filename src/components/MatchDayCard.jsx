import DonutChart from './ui/DonutChart.jsx'
import { BrainIcon } from '../assets/icons/index.js'

function MatchDayCard() {
  return (
    <div className={'border border-emerald-500/20 bg-zinc-900/60 m-2 rounded-md mt-4'}>
      <div className={'bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 p-4'}>
        <div className={'flex items-center gap-2 pb-2'}>
          <div className={'h-1 w-1 bg-primary rounded-full animate-pulse'}></div>
          <p className={'text-secondary-foreground text-xs'}>MATCH OF THE DAY</p>
        </div>

        <div className={'flex justify-between items-center py-4 text-secondary-foreground'}>
          <div>
            <p className={'text-xs'}>FIFA World Cup</p>
          </div>
          <div>
            <p className={'text-xs'}>Tonight, 21:00 CET</p>
          </div>
        </div>

        <div className={'flex justify-center gap-4 text-foreground mt-4'}>
          <div className={'flex flex-col items-center'}>
            <div
              className={
                'bg-zinc-800/80 border border-zinc-700/80  flex justify-center items-center h-14 w-14 rounded-xl'
              }
            >
              <p className={''}>RMA</p>
            </div>
            <p className={'text-sm mt-2'}>Real Madrid</p>
            <p className={'text-2xl text-primary font-bold'}>52%</p>
            <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
          </div>
          <div className={'flex flex-col items-center justify-center gap-4'}>
            <p className={'text-xs'}>vs</p>
            <div className={'flex flex-col items-center bg-secondary/60 px-8 py-2 rounded-xl'}>
              <p className={'text-xs text-secondary-foreground/60'}>DRAW</p>
              <p className={'text-md'}>19%</p>
            </div>
          </div>
          <div className={'flex flex-col items-center'}>
            <div
              className={
                'bg-zinc-800/80 border border-zinc-700/80 flex justify-center items-center h-14 w-14 rounded-xl'
              }
            >
              <p className={''}>BAY</p>
            </div>
            <p className={'text-sm mt-2'}>FC Barcelona</p>
            <p className={'text-2xl font-bold text-chart-2'}>29%</p>
            <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
          </div>
        </div>

        <div className={'flex justify-center items-center mt-4'}>
          <div className={'h-1 w-52 bg-primary rounded-l-full'}></div>
          <div className={'h-1 w-19 bg-secondary-foreground/50'}></div>
          <div className={'h-1 w-29 bg-chart-2 rounded-r-full'}></div>
        </div>

        <div className={'mt-4 text-secondary-foreground/50 flex gap-4'}>
          <DonutChart value={82} />
          <div>
            <p className={'text-xs'}>AI CONFIDENCE</p>
            <div className={'flex items-center gap-2'}>
              <BrainIcon />
              <p className={'text-sm text-foreground'}>
                Prediction: <span className={'text-primary font-bold '}>Home Win</span>
              </p>
            </div>
            <p className={'text-xs shrink-0'}>Gradient Boost - Neuronal Net Ensemble</p>
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
