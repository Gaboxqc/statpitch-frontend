import { FilterIcon } from '../assets/icons/index.js'

function FiltersBar() {
  return (
    <div
      className={
        'flex items-center py-2 px-2 border-b border-secondary-foreground/10 overflow-x-scroll md:overflow-x-hidden md:py-4'
      }
    >
      <div className={'container mx-auto px-2 flex items-center gap-8'}>
        <ul className={'flex text-secondary-foreground gap-6 text-sm '}>
          <li className={'flex items-center gap-4 shrink-0'}>
            <FilterIcon className={'text-accent h-4 w-4'} />
            <p
              className={
                'text-xs bg-primary/20 p-1 rounded-sm border border-primary/50 text-primary md:px-2'
              }
            >
              All
            </p>
          </li>
          <li className={'flex items-center shrink-0'}>
            <p className={'text-xs'}>80%+</p>
          </li>
          <li className={'flex items-center shrink-0'}>
            <p className={'text-xs'}>70%+</p>
          </li>
          <li className={'flex items-center shrink-0'}>
            <p className={'text-xs'}>60%+</p>
          </li>
        </ul>

        <ul className={'flex text-secondary-foreground gap-6 text-sm '}>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p
              className={
                'text-xs bg-accent/60 p-1 rounded-sm border border-accent text-foreground md:px-2'
              }
            >
              All Leagues
            </p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>Premier League</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>La Liga</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>Bundesliga</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>Serie A</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>Ligue 1</p>
          </li>
          <li className={'flex items-center gap-2 shrink-0'}>
            <p className={'text-xs'}>UCL</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
export default FiltersBar
