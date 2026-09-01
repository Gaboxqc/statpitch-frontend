import MatchCard from './MatchCard'
import CompetitionHeading from './CompetitionHeading'
import { groupByCompetition } from '../../utils/groupByCompetition'
import { BASIS_DETAIL } from '../../constants/bases'
import { useFixtures, useWindow } from '../../hooks/queries'
import { useElapsed } from '../../hooks/useElapsed'
import { useFixtureFilters } from '../../hooks/useFixtureFilters'
import { filterFixtures } from '../../utils/filterFixtures'
import { SORTS, SORT_LABELS, sortFixtures } from '../../utils/sortFixtures'
import type { SortKey } from '../../utils/sortFixtures'
import QueryError from '../ui/QueryError'
import { COLD_START_HINT_MS } from '../../services/api'
import { competitionName } from '../../constants/competitions'
import { DISCLAIMER } from '../../constants/content'
import { formatMatchDay } from '../../utils/datetime'

const DAY_LABELS = { yesterday: 'yesterday', today: 'today', tomorrow: 'tomorrow' } as const

function PredictionsSection() {
  const { filters, setFilters } = useFixtureFilters()
  const { window } = useWindow()
  // Only the competition goes to the API. Day, confidence and the value-bet
  // filter are applied to the single window response, so switching them is free.
  const { fixtures, loading, error } = useFixtures({
    competition_id: filters.competitionId ?? undefined,
  })
  const slow = useElapsed(COLD_START_HINT_MS)

  // The day is not a filter the user can widen — it always selects a subset —
  // so it is applied first and the narrowing check runs against what that day
  // actually holds. Comparing against the whole window told a genuinely empty
  // day that its filters were too narrow.
  const onThisDay = filterFixtures(fixtures, {
    day: filters.day,
    window,
    confidence: null,
    picks: null,
  })
  const visible = sortFixtures(
    filterFixtures(fixtures, {
      day: filters.day,
      window,
      confidence: filters.confidence,
      picks: filters.picks,
    }),
    filters.sort,
  )

  if (loading)
    return (
      <div className={'w-full flex flex-col gap-4'}>
        <div className={'h-30 w-full bg-secondary animate-pulse rounded-lg'}></div>
        <div className={'h-30 w-full bg-secondary animate-pulse rounded-lg'}></div>
        {slow && (
          <p className={'text-center text-xs text-ink-subtle'} role={'status'}>
            Waking the prediction service. This can take up to a minute.
          </p>
        )}
      </div>
    )
  if (error) return <QueryError error={error} />

  // An empty day and an over-narrow filter are different problems, and only one
  // of them is the user's to fix.
  const narrowed = onThisDay.length > 0 && visible.length === 0

  /**
   * Grouping is worth it only when the list is in the order the day happens in.
   * Every other sort is a ranking, and the question a ranking answers — where is
   * the strongest bet today — is asked across competitions, not within one. A
   * single selected competition needs no headings either: they would announce
   * the same league over and over above a list that cannot contain another.
   */
  const grouped = filters.sort === 'kickoff' && filters.competitionId === null

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2'}>
        <h2 className={'text-ink text-lg font-semibold'}>
          <span className={'numeric text-ink-muted'}>{visible.length}</span>{' '}
          {filters.picks === null ? 'Predictions' : BASIS_DETAIL[filters.picks].title}
          <span className={'text-ink-subtle font-normal text-sm'}>
            {' · '}
            {window ? formatMatchDay(window[filters.day]) : DAY_LABELS[filters.day]}
            {filters.competitionId ? ` · ${competitionName(filters.competitionId)}` : ''}
          </span>
        </h2>

        {/* The order belongs to the list, not to the filter bar: it is not a
            filter, and it has to be visible because the list is always in one
            order whether or not anyone chose it. */}
        <label className={'flex shrink-0 items-center gap-2 text-xs text-ink-subtle'}>
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => setFilters({ sort: event.target.value as SortKey })}
            className={
              'cursor-pointer rounded-md border border-line-strong bg-secondary py-1 px-2 text-xs text-ink'
            }
          >
            {SORTS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 && (
        <p className={'text-center mt-8 text-ink-muted'}>
          {narrowed
            ? 'No fixtures match these filters. Try widening them.'
            : `Nothing scheduled ${DAY_LABELS[filters.day]}.`}
        </p>
      )}

      {/* Grouped, the heading carries the competition and the cards below it
          stop repeating what it just said. Flat, each card has to say it for
          itself, because its neighbour is from somewhere else. */}
      {grouped
        ? groupByCompetition(visible).map((group) => (
            <section key={group.id} className={'flex flex-col gap-4'}>
              <CompetitionHeading group={group} />
              {group.fixtures.map((fixture) => (
                <MatchCard key={fixture.id} prediction={fixture} showCompetition={false} />
              ))}
            </section>
          ))
        : visible.map((fixture) => <MatchCard key={fixture.id} prediction={fixture} />)}

      <div
        className={
          'flex flex-col gap-4 lg:flex-row lg:justify-between border-t border-line pt-6 text-start mt-8'
        }
      >
        <p className={'text-xs text-ink-subtle'}>
          {visible.length > 0 ? (
            <span className={'numeric'}>Model {visible[0].model_version}</span>
          ) : (
            ''
          )}
        </p>
        <p className={'text-xs text-ink-subtle'}>{DISCLAIMER.short}</p>
      </div>
    </div>
  )
}
export default PredictionsSection
