import { FilterIcon } from '../../assets/icons/index'
import { Link } from 'react-router'
import { useCompetitions, useCompetitionScope, useFixtures, useWindow } from '../../hooks/queries'
import { useAccount } from '../../hooks/useAccount'
import { CONFIDENCE_TIERS, DAYS, useFixtureFilters } from '../../hooks/useFixtureFilters'
import { countByDay } from '../../utils/filterFixtures'
import { COMPETITIONS } from '../../constants/competitions'
import { BASES, BASIS_DETAIL } from '../../constants/bases'
import { formatFraction } from '../../utils/format'
import type { Basis, DayKey } from '../../types/api'
import type { CompetitionScope } from '../../hooks/queries'

const DAY_LABELS: Record<DayKey, string> = {
  yesterday: 'Yesterday',
  today: 'Today',
  tomorrow: 'Tomorrow',
}

/**
 * What a Pro reader is told a competition cannot do. Nothing at all when it can
 * do everything, and the two refusals are different facts: no market to quote
 * against, or a market quoted in full that the rule was never measured on.
 */
function marker(id: string, scope: CompetitionScope): string {
  if (!scope.isPriced(id)) return ' · no odds'
  if (!scope.isStakeable(id)) return ' · predictions only'
  return ''
}

const PILL = 'text-xs font-medium py-1 px-2 rounded-md border shrink-0 cursor-pointer'
const PILL_ON = 'bg-primary/10 border-primary/40 text-primary'
const PILL_OFF = 'border-transparent text-ink-muted hover:border-line'

function Pill({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  label?: string
}) {
  return (
    <button
      type={'button'}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`${PILL} ${active ? PILL_ON : PILL_OFF}`}
    >
      {children}
    </button>
  )
}

function FiltersBar() {
  const { isPro, loading: accountLoading } = useAccount()
  const { filters, setFilters } = useFixtureFilters()
  const { window } = useWindow()
  // Same query key as the list below, so this reads from cache rather than refetching.
  const { fixtures } = useFixtures({
    competition_id: filters.competitionId ?? undefined,
  })
  const counts = countByDay(fixtures, window)
  const { competitions } = useCompetitions()
  const scope = useCompetitionScope()

  /**
   * One marker per row, and which one depends on who is reading.
   *
   * Below Pro the useful fact is that a competition is not included at all —
   * selecting it would empty the list, and an empty list reads as "nothing on
   * today" rather than "not yours".
   *
   * At Pro everything is included and the marker names what the competition
   * cannot do instead. Two answers, not one: the cups carry no odds market at
   * all, while the Primeira Liga and Eredivisie are priced in full and simply
   * sit outside the rule's measured scope. Labelling the second pair "no odds"
   * is the thing this used to do, and it was wrong in both directions.
   */
  const options = (
    competitions.length > 0
      ? competitions.map((entry) => ({
          id: entry.competition_id,
          short: entry.short_name,
          free: entry.free_tier,
        }))
      : COMPETITIONS.map((entry) => ({ id: entry.id, short: entry.short, free: entry.free }))
  ).map((entry) => ({
    ...entry,
    note: !isPro && !entry.free ? ' · Pro' : marker(entry.id, scope),
  }))

  return (
    <div className={'border-b border-line'}>
      <div className={'measure flex flex-wrap items-center gap-x-6 gap-y-3 py-3 md:py-4'}>
        <FilterIcon className={'text-ink-muted h-4 w-4 shrink-0'} aria-hidden={true} />

        <div className={'flex items-center gap-2'} role={'group'} aria-label={'Match day'}>
          {DAYS.map((day) => (
            <Pill
              key={day}
              active={filters.day === day}
              onClick={() => setFilters({ day })}
              label={`${DAY_LABELS[day]}, ${counts[day]} fixtures`}
            >
              {DAY_LABELS[day]} <span className={'numeric text-ink-subtle'}>{counts[day]}</span>
            </Pill>
          ))}
        </div>

        <div
          className={'flex items-center gap-2'}
          role={'group'}
          aria-label={'Minimum win probability'}
        >
          <Pill
            active={filters.confidence === null}
            onClick={() => setFilters({ confidence: null })}
          >
            All
          </Pill>
          {CONFIDENCE_TIERS.map((tier) => (
            <Pill
              key={tier}
              active={filters.confidence === tier}
              onClick={() => setFilters({ confidence: tier })}
              label={`Win probability at or above ${formatFraction(tier, 0)}`}
            >
              <span className={'numeric'}>{formatFraction(tier, 0)}+</span>
            </Pill>
          ))}
        </div>

        <label className={'flex items-center gap-2 shrink-0 text-xs text-ink-muted'}>
          <span className={'sr-only'}>Competition</span>
          <select
            value={filters.competitionId ?? ''}
            onChange={(event) => setFilters({ competitionId: event.target.value || null })}
            className={
              'text-xs bg-secondary border border-line-strong text-ink rounded-md py-1 px-2 cursor-pointer'
            }
          >
            <option value={''}>All competitions</option>
            {options.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.short}
                {entry.note}
              </option>
            ))}
          </select>
        </label>

        {/* Whose selections, not how narrow a filter. Ours and StatPitch's are
            different strategies over the same fixtures — a fixture can carry one
            pick and not the other — so this names the source rather than
            implying one set contains the other.

            A selection is a fact about the market, and the market is a paid
            line, so below Pro every option here could only empty the list. An
            empty list would read as "no value today" rather than "not
            included", which is why the control becomes the reason instead. */}
        {accountLoading ? null : isPro ? (
          <label className={'flex shrink-0 items-center gap-2 text-xs text-ink-muted'}>
            <span className={'sr-only'}>Selections</span>
            <select
              value={filters.picks ?? ''}
              onChange={(event) =>
                setFilters({ picks: (event.target.value || null) as Basis | null })
              }
              className={
                'text-xs bg-secondary border border-line-strong text-ink rounded-md py-1 px-2 cursor-pointer'
              }
            >
              {/* Fixed options only: an unknown basis is a 422 upstream. */}
              <option value={''}>All predictions</option>
              {BASES.map((basis) => (
                <option key={basis} value={basis}>
                  {BASIS_DETAIL[basis].title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Link
            to={'/pricing'}
            title={'Selections are part of Pro'}
            className={`${PILL} border-transparent text-ink-subtle hover:border-line`}
          >
            Selections · <span className={'text-primary'}>Pro</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default FiltersBar
