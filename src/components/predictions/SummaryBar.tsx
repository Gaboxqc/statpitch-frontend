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
      <Icon className={'text-ink-subtle'} />
      <p className={'text-xs'}>{label}</p>
      <p className={`numeric text-sm font-semibold ${color}`}>{value}</p>
    </li>
  )
}

function SummaryBar() {
  const { stats, loading } = useStats()
  const items = buildStats(stats)

  if (loading) return <div className={'h-11 bg-secondary border-b border-line animate-pulse'}></div>

  return (
    <div className={'bg-secondary border-b border-line'}>
      <div
        className={
          'measure flex w-full items-center gap-x-6 gap-y-2 py-3 lg:flex-wrap lg:justify-between'
        }
      >
        {/* The marquee needs two identical copies to loop seamlessly. */}
        <div className={'flex w-full overflow-hidden lg:hidden'}>
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className={'flex shrink-0 animate-marquee gap-6 text-sm text-ink-muted pr-6'}
              aria-hidden={copy === 1}
            >
              {items.map((item) => (
                <StatItem key={item.id} {...item} />
              ))}
            </ul>
          ))}
        </div>

        {/* The strip takes the room the disclaimer button leaves and wraps inside
            it, so a sixth stat costs a line of the strip rather than a row of the
            whole band. */}
        <ul
          className={
            'hidden lg:flex lg:min-w-0 lg:flex-1 lg:flex-wrap text-ink-muted gap-x-6 gap-y-2 text-sm'
          }
        >
          {items.map((item) => (
            <StatItem key={item.id} {...item} />
          ))}
        </ul>

        <div className={'relative flex items-center gap-2 group'}>
          <button
            className={
              'hidden lg:flex items-center gap-2 text-ink-subtle bg-secondary py-1 px-2 rounded-md shrink-0 cursor-pointer'
            }
          >
            <InfoIcon className={'h-4 w-4'} />
            <span className={'eyebrow'}>Disclaimer</span>
          </button>
          <div
            className={
              'text-xs bg-secondary p-4 w-100 rounded-lg absolute top-9 right-0 border border-line hidden group-hover:block'
            }
          >
            <p>{DISCLAIMER.short}</p>
            <p className={'text-xs text-ink-subtle mt-2'}>{DISCLAIMER.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
