import { eloSource, humanise, predictionSource } from '../../utils/humanise'
import { formatRelativeTime } from '../../utils/datetime'
import { hasFullDetail } from '../../utils/entitlement'
import type { EloSource, Fixture } from '../../types/api'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={'flex items-baseline gap-2 text-xs'}>
      <dt className={'text-ink-subtle w-24 shrink-0'}>{label}</dt>
      <dd className={'text-ink-muted'}>{children}</dd>
    </div>
  )
}

function EloValue({ rating, source }: { rating: number | null; source: EloSource | null }) {
  const described = eloSource(source)
  if (rating === null) {
    return (
      <span className={'text-ink-subtle'} title={described?.hint}>
        unrated{described ? ` · ${described.label}` : ''}
      </span>
    )
  }
  return (
    <span title={described?.hint}>
      {Math.round(rating)}
      {described && described.tier > 1 && (
        <span className={'text-ink-subtle'}> · {described.label}</span>
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
  // Ratings are part of what a subscription buys, so the row is absent rather
  // than empty when they are withheld.
  const rated = hasFullDetail(fixture) ? fixture : null
  const eloGap =
    rated && rated.home_elo !== null && rated.away_elo !== null
      ? Math.round(rated.home_elo - rated.away_elo)
      : null

  return (
    <section className={'flex flex-col gap-2 w-full'}>
      <h3 className={'eyebrow text-ink-subtle'}>Fixture detail</h3>

      <dl className={'flex flex-col gap-1 tabular-nums'}>
        {rated && (
          <Row label={'Elo'}>
            <EloValue rating={rated.home_elo} source={rated.home_elo_source} />
            <span className={'text-ink-subtle'}> vs </span>
            <EloValue rating={rated.away_elo} source={rated.away_elo_source} />
            {eloGap !== null && (
              <span className={'text-ink-subtle'}>
                {' '}
                ({eloGap >= 0 ? '+' : ''}
                {eloGap} home)
              </span>
            )}
          </Row>
        )}

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
            <span className={'text-ink-subtle'}> · {fixture.model_version}</span>
          </Row>
        )}

        <Row label={'Updated'}>{formatRelativeTime(fixture.synced_at)}</Row>
      </dl>

      {/* The prior standing in for a measured Elo used to be spelled out here.
          The API now says the same thing in its confidence reasons, in the same
          panel, and names the club while doing it — so the row above carries
          the evidence and the sentence is left to whoever says it better. */}
    </section>
  )
}

export default FixtureMeta
