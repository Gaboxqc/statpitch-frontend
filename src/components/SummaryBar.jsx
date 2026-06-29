import { ArrowIcon, ChartIcon, InfoIcon, TargetIcon, ThunderIcon } from '../assets/icons/index.js'

const items = [
  {
    icon: <ChartIcon className={'text-accent'} />,
    label: 'Predictions today',
    value: '6',
    color: 'text-foreground',
  },
  {
    icon: <ArrowIcon className={'text-accent'} />,
    label: 'High confidence',
    value: '2',
    color: 'text-foreground',
  },
  {
    icon: <TargetIcon className={'text-accent'} />,
    label: '30d model accuracy',
    value: '71.4%',
    color: 'text-primary',
  },
  {
    icon: <ThunderIcon className={'text-accent'} />,
    label: '30d ROI',
    value: '+8.3%',
    color: 'text-primary',
  },
]

function SummaryBar() {
  return (
    <div
      className={
        'flex items-center py-2 px-2 bg-accent/20 border-y border-secondary-foreground/20 overflow-hidden'
      }
    >
      <div
        className={'flex w-full lg:container lg:mx-auto lg:px-2 lg:justify-between lg:items-center'}
      >
        <div className={'flex w-full overflow-hidden lg:hidden'}>
          {[0, 1].map((i) => (
            <ul key={i} className={'flex shrink-0 animate-marquee gap-6 text-sm text-zinc-500'}>
              {items.map(({ icon, label, value, color }) => (
                <li key={label} className={'flex items-center gap-2 shrink-0'}>
                  {icon}
                  <p className={'text-xs'}>{label}</p>
                  <p className={`text-md font-bold ${color}`}>{value}</p>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Desktop: static */}
        <ul className={'hidden lg:flex w-full text-zinc-500 gap-6 text-sm'}>
          {items.map(({ icon, label, value, color }) => (
            <li key={label} className={'flex items-center gap-2 shrink-0'}>
              {icon}
              <p className={'text-xs'}>{label}</p>
              <p className={`text-md font-bold ${color}`}>{value}</p>
            </li>
          ))}
        </ul>

        <button
          className={
            'hidden lg:flex items-center gap-2 text-secondary-foreground/50 text-sm bg-accent/50 py-1 px-2 rounded-md shrink-0'
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
