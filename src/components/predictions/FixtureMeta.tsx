import { eloSource, humanise, predictionSource } from '../../utils/humanise'
import { formatRelativeTime } from '../../utils/datetime'
import type { EloSource, Fixture } from '../../types/api'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={'flex items-baseline gap-2 text-xs'}>
      <dt className={'text-secondary-foreground/50 w-24 shrink-0'}>{label}</dt>
      <dd className={'text-secondary-foreground'}>{children}</dd>
    </div>
  )
}

function EloValue({ rating, source }: { rating: number | null; source: EloSource | null }) {
  const described = eloSource(source)
  if (rating === null) {
    return (
      <span className={'text-secondary-foreground/50'} title={described?.hint}>
        unrated{described ? ` · ${described.label}` : ''}
      </span>
    )
  }
  return (
    <span title={described?.hint}>
      {Math.round(rating)}
      {described && described.tier > 1 && (
        <span className={'text-secondary-foreground/50'}> · {described.label}</span>
      )}
    </span>
  )
}

/**
 * The provenance the API publishes but the card never showed: which tier of
 * evidence backed each Elo, which model produced the numbers, and how stale
 * they are. A well-formed prediction from a pooled prior is a much weaker claim
 * than the same number from a measured rating, and only this says so.
 */
function FixtureMeta({ fixture }: { fixture: Fixture }) {
  const model = predictionSource(fixture.prediction_source)
  const eloGap =
    fixture.home_elo !== null && fixture.away_elo !== null
      ? Math.round(fixture.home_elo - fixture.away_elo)
      : null

  return (
    <section className={'flex flex-col gap-2 w-full'}>
      <h3 className={'eyebrow text-secondary-foreground/50'}>Fixture detail</h3>

      <dl className={'flex flex-col gap-1 tabular-nums'}>
        <Row label={'Elo'}>
          <EloValue rating={fixture.home_elo} source={fixture.home_elo_source} />
          <span className={'text-secondary-foreground/40'}> vs </span>
          <EloValue rating={fixture.away_elo} source={fixture.away_elo_source} />
          {eloGap !== null && (
            <span className={'text-secondary-foreground/50'}>
              {' '}
              ({eloGap >= 0 ? '+' : ''}
              {eloGap} home)
            </span>
          )}
        </Row>

        {(fixture.stage || fixture.format) && (
          <Row label={'Stage'}>
            {[fixture.stage, fixture.format]
              .filter((part): part is string => Boolean(part))
              .map(humanise)
              .join(' · ')}
          </Row>
        )}

        {fixture.season && <Row label={'Season'}>{fixture.season}</Row>}

        {/* Only worth saying when it is true — a home venue is the default. */}
        {fixture.neutral_venue && <Row label={'Venue'}>Neutral</Row>}

        {model && (
          <Row label={'Model'}>
            <span title={model.hint}>{model.label}</span>
            <span className={'text-secondary-foreground/40'}> · {fixture.model_version}</span>
          </Row>
        )}

        <Row label={'Updated'}>{formatRelativeTime(fixture.synced_at)}</Row>
      </dl>

      {!fixture.fully_rated && (
        <p className={'text-xs text-secondary-foreground/60'}>
          At least one club had no measured Elo and fell back to a prior. The prediction is still
          well formed, but it is a weaker claim than a fully rated fixture.
        </p>
      )}
    </section>
  )
}

export default FixtureMeta
