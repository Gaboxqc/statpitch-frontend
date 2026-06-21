import { ArrowIcon, ChartIcon, InfoIcon, TargetIcon, ThunderIcon } from '../assets/icons/index.js'

function SummaryBar() {
  return (
    <div
      className={
        'flex items-center py-2 px-2 bg-accent/20 border-y border-secondary-foreground/20 overflow-x-scroll md:overflow-x-hidden'
      }
    >
      <div className={'container mx-auto px-2 flex items-center justify-between'}>
        <ul className={'flex w-full text-zinc-500 gap-6 text-sm '}>
          <li className={'flex items-center gap-2 shrink-0'}>
            <ChartIcon className={'text-accent'} />
            <p className={'text-xs'}>Predictions today</p>
            <p className={'text-md text-foreground font-bold'}>6</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <ArrowIcon className={'text-accent'} />
            <p className={'text-xs'}>High confidence</p>
            <p className={'text-md text-foreground font-bold'}>2</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <TargetIcon className={'text-accent'} />
            <p className={'text-xs'}>30d model accuracy</p>
            <p className={'text-md text-primary font-bold'}>71.4%</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <ThunderIcon className={'text-accent'} />
            <p className={'text-xs'}>30d ROI</p>
            <p className={'text-md text-primary font-bold'}>+8.3%</p>
          </li>
        </ul>

        <button
          className={
            'hidden items-center gap-2 text-secondary-foreground/50 text-sm bg-accent/50 py-1 px-2 rounded-md md:flex'
          }
        >
          <InfoIcon className={'h-4 w-4'} />
          DISCLAIMER
        </button>
      </div>
    </div>
  )
}
export default SummaryBar
