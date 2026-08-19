import { FilterIcon } from '../../assets/icons/index'
import { useFixtures, useWindow } from '../../hooks/queries'
import { CONFIDENCE_TIERS, DAYS, useFixtureFilters } from '../../hooks/useFixtureFilters'
import { countByDay } from '../../utils/filterFixtures'
import { COMPETITIONS } from '../../constants/competitions'
import { formatFraction } from '../../utils/format'
import type { DayKey } from '../../types/api'

const DAY_LABELS: Record<DayKey, string> = {
  yesterday: 'Yesterday',
  today: 'Today',
  tomorrow: 'Tomorrow',
}

const PILL = 'text-xs font-medium p-1 rounded-sm border md:px-2 shrink-0 cursor-pointer'
const PILL_ON = 'bg-primary/20 border-primary/50 text-primary'
const PILL_OFF = 'border-transparent text-secondary-foreground hover:border-secondary-foreground/20'

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
  const { filters, setFilters } = useFixtureFilters()
  const { window } = useWindow()
  // Same query key as the list below, so this reads from cache rather than refetching.
  const { fixtures } = useFixtures({
    competition_id: filters.competitionId ?? undefined,
  })
  const counts = countByDay(fixtures, window)

  return (
    <div
      className={
        'flex items-center py-2 px-2 border-b border-secondary-foreground/10 overflow-x-scroll md:overflow-x-hidden md:py-4'
      }
    >
      <div className={'container mx-auto px-2 flex items-center gap-6'}>
        <FilterIcon className={'text-accent h-4 w-4 shrink-0'} aria-hidden={true} />

        <div className={'flex items-center gap-2'} role={'group'} aria-label={'Match day'}>
          {DAYS.map((day) => (
            <Pill
              key={day}
              active={filters.day === day}
              onClick={() => setFilters({ day })}
              label={`${DAY_LABELS[day]}, ${counts[day]} fixtures`}
            >
              {DAY_LABELS[day]}{' '}
              <span className={'numeric text-secondary-foreground/50'}>{counts[day]}</span>
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

        <label className={'flex items-center gap-2 shrink-0 text-xs text-secondary-foreground'}>
          <span className={'sr-only'}>Competition</span>
          <select
            value={filters.competitionId ?? ''}
            onChange={(event) => setFilters({ competitionId: event.target.value || null })}
            className={
              'text-xs bg-accent/60 border border-accent text-foreground rounded-sm p-1 md:px-2 cursor-pointer'
            }
          >
            <option value={''}>All competitions</option>
            {COMPETITIONS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {/* The cups have no odds market, so they can never produce a bet. */}
                {entry.short}
                {entry.priced ? '' : ' · no odds'}
              </option>
            ))}
          </select>
        </label>

        <Pill
          active={filters.valueBetsOnly}
          onClick={() => setFilters({ valueBetsOnly: !filters.valueBetsOnly })}
          label={'Only fixtures with a qualifying selection'}
        >
          Value bets only
        </Pill>
      </div>
    </div>
  )
}

export default FiltersBar
