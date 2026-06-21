import DonutChart from './ui/DonutChart.jsx'
import { ClockIcon } from '../assets/icons/index.js'

function MatchCard() {
  return (
    <div
      className={
        'h-30 flex items-center justify-between bg-secondary text-foreground text-xs rounded-md border border-secondary-foreground/20'
      }
    >
      <div className={'flex flex-col gap-2 mx-4'}>
        <p>FIFA World Cup</p>
        <div className={'flex items-center gap-2'}>
          <div className={'bg-zinc-800 p-1 rounded-md border border-secondary-foreground/20'}>
            <p className={'text-xs'}>ARS</p>
          </div>
          <p className={'text-sm'}>Arsenal</p>
        </div>
        <div className={'flex items-center gap-2'}>
          <div className={'bg-zinc-800 p-1 rounded-md border border-secondary-foreground/20'}>
            <p className='text-xs'>LIV</p>
          </div>
          <p className={'text-sm'}>Liverpool</p>
        </div>
      </div>

      <div className={'flex items-center gap-4 mr-4'}>
        <div className={'flex flex-col items-center gap-1'}>
          <ClockIcon className={'h-4 w-4 text-secondary-foreground'} />
          <p>17:30</p>
        </div>
        <DonutChart value={74} />
      </div>
    </div>
  )
}
export default MatchCard
