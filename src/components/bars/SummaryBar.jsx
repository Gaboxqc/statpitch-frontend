import { InfoIcon } from '../../assets/icons/index.js'
import useStats from '../../hooks/useStats.js'
import { buildStats } from '../../utils/buildStats.jsx'

function SummaryBar() {
  const { stats, loading } = useStats()
  const items = buildStats(stats)

  if (loading)
    return (
      <div
        className={'h-10 bg-accent/20 border-y border-secondary-foreground/20 mt-14 animate-pulse'}
      ></div>
    )
  return (
    <div
      className={
        'flex items-center py-2 px-2 bg-accent/20 border-y border-secondary-foreground/20 mt-14'
      }
    >
      <div
        className={'flex w-full lg:container lg:mx-auto lg:px-2 lg:justify-between lg:items-center'}
      >
        <div className={'flex w-full overflow-hidden lg:hidden'}>
          {[0, 1].map((i) => (
            <ul
              key={i}
              className={'flex shrink-0 animate-marquee gap-6 text-sm text-zinc-500 px-4'}
            >
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

        <ul className={'hidden lg:flex w-full text-zinc-500 gap-6 text-sm'}>
          {items.map(({ icon, label, value, color }) => (
            <li key={label} className={'flex items-center gap-2 shrink-0'}>
              {icon}
              <p className={'text-xs'}>{label}</p>
              <p className={`text-md font-bold ${color}`}>{value}</p>
            </li>
          ))}
        </ul>

        <div className={'relative flex items-center gap-2 group'}>
          <button
            className={
              'hidden lg:flex items-center gap-2 text-secondary-foreground/50 text-sm bg-accent/50 py-1 px-2 rounded-md shrink-0 cursor-pointer'
            }
          >
            <InfoIcon className={'h-4 w-4'} />
            DISCLAIMER
          </button>
          <div
            className={
              'text-xs bg-secondary p-2 w-100 rounded-sm absolute top-8 right-0 border border-secondary-foreground/10 hidden group-hover:block'
            }
          >
            <p>For informational purposes only.</p>
            <p className={'text-xs text-foreground/50 mt-2'}>
              StatPitch does not facilitate or endorse gambling. All outputs are statistical models
              — not predictions of future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
