import MatchCard from './MatchCard'
import { useFixtures, useWindow } from '../../hooks/queries'
import { useElapsed } from '../../hooks/useElapsed'
import { useFixtureFilters } from '../../hooks/useFixtureFilters'
import { filterFixtures } from '../../utils/filterFixtures'
import QueryError from '../ui/QueryError'
import { COLD_START_HINT_MS } from '../../services/api'
import { competitionName } from '../../constants/competitions'
import { DISCLAIMER } from '../../constants/content'
import { formatMatchDay } from '../../utils/datetime'

const DAY_LABELS = { yesterday: 'yesterday', today: 'today', tomorrow: 'tomorrow' } as const

function PredictionsSection() {
  const { filters } = useFixtureFilters()
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
    valueBetsOnly: false,
  })
  const visible = filterFixtures(fixtures, {
    day: filters.day,
    window,
    confidence: filters.confidence,
    valueBetsOnly: filters.valueBetsOnly,
  })

  if (loading)
    return (
      <div className={'w-full flex flex-col gap-4 mt-12'}>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
        {slow && (
          <p className={'text-center text-xs text-ink-subtle'} role={'status'}>
            Waking the prediction service. This can take up to a minute.
          </p>
        )}
      </div>
    )
  if (error) return <QueryError error={error} className={'mx-2 mt-12 lg:w-2/3 lg:mx-auto'} />

  // An empty day and an over-narrow filter are different problems, and only one
  // of them is the user's to fix.
  const narrowed = onThisDay.length > 0 && visible.length === 0

  return (
    <div className={'mt-12 flex flex-col gap-4 mx-2 lg:w-2/3 lg:mx-auto'}>
      <h2 className={'text-ink text-lg font-semibold ml-2'}>
        <span className={'numeric text-ink-muted'}>{visible.length}</span>{' '}
        {filters.valueBetsOnly ? 'Value bets' : 'Predictions'}
        <span className={'text-ink-subtle font-normal text-sm'}>
          {' · '}
          {window ? formatMatchDay(window[filters.day]) : DAY_LABELS[filters.day]}
          {filters.competitionId ? ` · ${competitionName(filters.competitionId)}` : ''}
        </span>
      </h2>

      {visible.length === 0 && (
        <p className={'text-center mt-8 text-ink-muted'}>
          {narrowed
            ? 'No fixtures match these filters. Try widening them.'
            : `Nothing scheduled ${DAY_LABELS[filters.day]}.`}
        </p>
      )}

      {visible.map((fixture) => (
        <MatchCard key={fixture.id} prediction={fixture} />
      ))}

      <div
        className={
          'flex flex-col gap-4 lg:flex-row lg:justify-between border-t border-secondary-foreground/10 pt-4 text-start mt-8'
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
