import { ArrowIcon, ChartIcon, InfoIcon, TrophyIcon } from '../../assets/icons/index'
import { useFixtures, useStats } from '../../hooks/queries'
import { useFixtureFilters } from '../../hooks/useFixtureFilters'
import { useQuota } from '../../hooks/useQuota'
import { useAccount } from '../../hooks/useAccount'
import { buildStats } from '../../utils/buildStats'
import { shortModelVersion } from '../../utils/format'
import { formatRelativeTime } from '../../utils/datetime'
import { DISCLAIMER } from '../../constants/content'
import type { StatItemData } from '../../utils/buildStats'
import type { Fixture } from '../../types/api'
import type { FunctionComponent, SVGProps } from 'react'

const STAT_ICONS: Record<string, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  highConfidence: ArrowIcon,
  valueBets: TrophyIcon,
}

const SHELL = 'flex items-center gap-2 shrink-0 rounded-md border py-1 px-2 text-xs'
const ON = 'bg-primary/10 border-primary/40 text-primary'
const OFF = 'border-transparent text-ink-muted hover:border-line-strong cursor-pointer'
const EMPTY = 'border-transparent text-ink-subtle'

/**
 * A count you cannot act on is decoration, so each of these is the control for
 * the view it describes. A count of zero is the exception: it stays readable but
 * stops being a button, because the only place it could take you is an empty
 * list.
 */
function Stat({
  item,
  pressed,
  onSelect,
}: {
  item: StatItemData
  pressed: boolean
  onSelect: () => void
}) {
  const Icon = STAT_ICONS[item.id] ?? ChartIcon

  if (item.count === 0) {
    return (
      <li className={`${SHELL} ${EMPTY}`} title={item.hint}>
        <Icon className={'h-4 w-4 text-ink-subtle'} />
        {item.label}
        <span className={'numeric text-sm font-semibold text-ink-subtle'}>{item.value}</span>
      </li>
    )
  }

  return (
    <li className={'shrink-0'}>
      <button
        type={'button'}
        aria-pressed={pressed}
        title={item.hint}
        onClick={onSelect}
        className={`${SHELL} ${pressed ? ON : OFF}`}
      >
        <Icon className={`h-4 w-4 ${pressed ? 'text-primary' : 'text-ink-subtle'}`} />
        {item.label}
        <span className={`numeric text-sm font-semibold ${item.color}`}>{item.value}</span>
      </button>
    </li>
  )
}

/** The most recent sync across the window, which is what "how fresh is this" means. */
function latestSync(fixtures: Fixture[]): string | null {
  return fixtures.reduce<string | null>(
    (latest, fixture) =>
      latest === null || fixture.synced_at > latest ? fixture.synced_at : latest,
    null,
  )
}

/**
 * Unlocks left today. Running out is not an error — the fixture still returns,
 * in teaser shape — so this is a countdown rather than a warning, and it says
 * nothing at all until the API has reported a figure.
 *
 * Nothing for an anonymous visitor either, even though the API honestly reports
 * zero: they have not spent three, they never had three, and "0 left" would
 * describe a loss rather than an offer. The locked cards below already say what
 * signing up is for.
 */
function QuotaChip() {
  const remaining = useQuota()
  const { isSignedIn } = useAccount()

  if (!isSignedIn) return null
  if (remaining === null || remaining === 'unlimited') return null

  return (
    <li className={`${SHELL} ${remaining === 0 ? 'border-line text-ink-muted' : EMPTY}`}>
      <span className={'numeric text-sm font-semibold text-ink'}>{remaining}</span>
      {remaining === 1 ? 'prediction left today' : 'predictions left today'}
    </li>
  )
}

function SummaryBar() {
  const { stats, loading } = useStats()
  const { filters, setFilters } = useFixtureFilters()
  // Same query key as the list below, so this reads from cache rather than refetching.
  const { fixtures } = useFixtures({ competition_id: filters.competitionId ?? undefined })
  const items = buildStats(stats)

  const isPressed = (item: StatItemData) =>
    (item.filter.confidence === undefined || filters.confidence === item.filter.confidence) &&
    (item.filter.picks === undefined || filters.picks === item.filter.picks) &&
    filters.day === (item.filter.day ?? filters.day)

  // Pressing an active stat puts the view back, so the pair reads as a toggle
  // rather than a one-way trip into a filter you then have to go and undo.
  const toggle = (item: StatItemData) =>
    setFilters(
      isPressed(item)
        ? { confidence: null, picks: null }
        : { ...item.filter, confidence: item.filter.confidence ?? null },
    )

  const version = fixtures[0]?.model_version ?? null
  const synced = latestSync(fixtures)

  // A 402 settles as an error rather than data, so the strip stops waiting and
  // renders what it does have: the model line, and the quota.
  if (loading) return <div className={'h-11 bg-secondary border-b border-line animate-pulse'}></div>

  return (
    <div className={'bg-secondary border-b border-line'}>
      <div className={'measure flex items-center justify-between gap-4 py-2'}>
        <ul className={'flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 lg:flex-nowrap'}>
          {items.map((item) => (
            <Stat
              key={item.id}
              item={item}
              pressed={isPressed(item)}
              onSelect={() => toggle(item)}
            />
          ))}
          <QuotaChip />
        </ul>

        <div className={'flex shrink-0 items-center gap-3'}>
          {/* What the whole page is a claim from, rather than a per-card footnote. */}
          {version && (
            <p className={'hidden items-center gap-2 text-xs text-ink-subtle md:flex'}>
              <span className={'numeric'} title={version}>
                {shortModelVersion(version)}
              </span>
              {synced && (
                <>
                  <span aria-hidden={true}>·</span>
                  <span>synced {formatRelativeTime(synced)}</span>
                </>
              )}
            </p>
          )}

          {/* Hover alone would leave this unreachable by keyboard and on touch. */}
          <div className={'group relative flex items-center'}>
            <button
              type={'button'}
              aria-label={'Disclaimer'}
              className={'rounded-md p-1 text-ink-subtle hover:text-ink-muted cursor-pointer'}
            >
              <InfoIcon className={'h-4 w-4'} />
            </button>
            <div
              role={'note'}
              className={
                'absolute top-8 right-0 z-10 hidden w-80 rounded-lg border border-line bg-card p-4 text-xs group-hover:block group-focus-within:block'
              }
            >
              <p>{DISCLAIMER.short}</p>
              <p className={'mt-2 text-ink-subtle'}>{DISCLAIMER.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryBar
