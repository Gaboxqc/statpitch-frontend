import {
  ArrowIcon,
  ChartIcon,
  ClockIcon,
  InfoIcon,
  TargetIcon,
  ThunderIcon,
  TrophyIcon,
} from '../../assets/icons/index'
import { useStats } from '../../hooks/queries'
import { buildStats } from '../../utils/buildStats'
import { DISCLAIMER } from '../../constants/content'
import type { StatItemData } from '../../utils/buildStats'
import type { FunctionComponent, SVGProps } from 'react'

const STAT_ICONS: Record<string, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  fixturesToday: ChartIcon,
  fixturesTomorrow: ClockIcon,
  highConfidence: ArrowIcon,
  valueBets: TrophyIcon,
  roi1x2: TargetIcon,
  roiOverall: ThunderIcon,
}

function StatItem({ id, label, value, color, hint }: StatItemData) {
  const Icon = STAT_ICONS[id] ?? ChartIcon
  return (
    <li className={'flex items-center gap-2 shrink-0'} title={hint}>
      <Icon className={'text-accent'} />
      <p className={'text-xs'}>{label}</p>
      <p className={`numeric text-sm font-semibold ${color}`}>{value}</p>
    </li>
  )
}

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
        {/* The marquee needs two identical copies to loop seamlessly. */}
        <div className={'flex w-full overflow-hidden lg:hidden'}>
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className={'flex shrink-0 animate-marquee gap-6 text-sm text-zinc-500 px-4'}
              aria-hidden={copy === 1}
            >
              {items.map((item) => (
                <StatItem key={item.id} {...item} />
              ))}
            </ul>
          ))}
        </div>

        <ul className={'hidden lg:flex w-full text-zinc-500 gap-6 text-sm'}>
          {items.map((item) => (
            <StatItem key={item.id} {...item} />
          ))}
        </ul>

        <div className={'relative flex items-center gap-2 group'}>
          <button
            className={
              'hidden lg:flex items-center gap-2 text-secondary-foreground/50 bg-accent/50 py-1 px-2 rounded-md shrink-0 cursor-pointer'
            }
          >
            <InfoIcon className={'h-4 w-4'} />
            <span className={'eyebrow'}>Disclaimer</span>
          </button>
          <div
            className={
              'text-xs bg-secondary p-2 w-100 rounded-sm absolute top-8 right-0 border border-secondary-foreground/10 hidden group-hover:block'
            }
          >
            <p>{DISCLAIMER.short}</p>
            <p className={'text-xs text-foreground/50 mt-2'}>{DISCLAIMER.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
