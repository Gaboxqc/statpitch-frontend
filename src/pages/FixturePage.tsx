import { Link, useParams } from 'react-router'
import TeamCrest from '../components/ui/TeamCrest'
import ProbabilityTiles from '../components/ui/ProbabilityTiles'
import ConfidenceBadge from '../components/ui/ConfidenceBadge'
import FixtureDetail from '../components/predictions/FixtureDetail'
import QueryError from '../components/ui/QueryError'
import Upsell from '../components/ui/Upsell'
import { ShortArrowIcon } from '../assets/icons/index'
import { useFixture } from '../hooks/queries'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { buildPredictionView, certainty } from '../utils/predictionView'
import { hasFullDetail, hasProbabilities } from '../utils/entitlement'
import { describeKickoffLong } from '../utils/datetime'
import { competitionName } from '../constants/competitions'
import { displayName } from '../utils/teamName'
import { formatDecimal, formatFraction } from '../utils/format'
import type { Fixture } from '../types/api'

function Side({ name, crest, xg }: { name: string; crest: string | null; xg: number | null }) {
  return (
    <div className={'flex min-w-0 flex-1 flex-col items-center gap-2 text-center'}>
      <TeamCrest name={name} url={crest} className={'w-16 h-16'} />
      <p className={'text-sm font-medium'} title={name}>
        {displayName(name)}
      </p>
      {xg !== null && (
        <p className={'text-xs text-ink-subtle'}>
          xG <span className={'numeric text-ink-muted'}>{formatDecimal(xg)}</span>
        </p>
      )}
    </div>
  )
}

function Loaded({ fixture }: { fixture: Fixture }) {
  const view = buildPredictionView(fixture)
  const kickoff = describeKickoffLong(fixture)
  const predicted = hasProbabilities(fixture) ? fixture : null
  const full = hasFullDetail(fixture) ? fixture : null
  const matchCertainty = predicted ? certainty(predicted) : null

  return (
    <>
      <header className={'flex flex-col gap-2'}>
        <div className={'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle'}>
          <span>{competitionName(fixture.competition_id)}</span>
          <span aria-hidden={true}>·</span>
          <time dateTime={kickoff.dateTime} className={'numeric'}>
            {kickoff.text}
          </time>
          <ConfidenceBadge fixture={fixture} showWhenClean={true} />
        </div>
        <h1 className={'text-xl font-semibold'}>
          {displayName(fixture.home_team)} <span className={'text-ink-subtle'}>versus</span>{' '}
          {displayName(fixture.away_team)}
        </h1>
      </header>

      <section className={'flex flex-col gap-6 rounded-lg border border-line bg-card p-6'}>
        <div className={'flex items-start justify-center gap-4'}>
          <Side
            name={fixture.home_team}
            crest={fixture.home_crest_url}
            xg={full ? full.home_xg : null}
          />
          <p className={'eyebrow pt-6 text-ink-subtle'}>vs</p>
          <Side
            name={fixture.away_team}
            crest={fixture.away_crest_url}
            xg={full ? full.away_xg : null}
          />
        </div>

        {predicted && view.winner && (
          <ProbabilityTiles prediction={predicted} winner={view.winner} variant={'wide'} />
        )}

        {matchCertainty && (
          <p className={'text-xs text-ink-muted'}>
            {matchCertainty.label}
            <span className={'text-ink-subtle'}>
              {' · '}
              <span className={'numeric'}>{formatFraction(matchCertainty.margin, 0)}</span> clear of
              the next outcome
            </span>
          </p>
        )}

        {/* The prediction itself is what the plan buys, so its absence is
            stated plainly rather than left as a gap on the page. */}
        {fixture.locked && (
          <Upsell
            title={'The prediction for this fixture is locked.'}
            detail={
              'Win, draw and away probabilities, the market breakdown and the model’s own reasoning.'
            }
          />
        )}
      </section>

      {/* Nothing to expand: the page exists to show all of it at once. */}
      <FixtureDetail
        fixture={fixture}
        isOpened={true}
      />
    </>
  )
}

/**
 * One fixture at its own address. Everything here was previously reachable only
 * by opening a disclosure inside a list, which meant a prediction could not be
 * linked, sent to anyone, or returned to — while `/fixtures/{id}` sat unused on
 * the API.
 */
function FixturePage() {
  const { id } = useParams()
  const numericId = Number(id)
  const { fixture, loading, error } = useFixture(Number.isFinite(numericId) ? numericId : null)

  useDocumentTitle(
    fixture ? `${displayName(fixture.home_team)} v ${displayName(fixture.away_team)}` : 'Fixture',
  )

  return (
    <div className={'measure flex flex-col gap-8 pt-10 pb-24'}>
      <Link
        to={'/'}
        className={'flex w-fit items-center gap-2 text-xs text-ink-muted hover:text-ink'}
      >
        <ShortArrowIcon className={'h-4 w-4 rotate-90'} />
        All predictions
      </Link>

      {loading && <div className={'h-64 animate-pulse rounded-lg bg-secondary'} />}
      {error && <QueryError error={error} />}

      {/* Two different fixtures answer 404 here and the API will not say which:
          one pruned three days after kick-off, one in a competition outside the
          reader's plan. That is deliberate — a 403 would confirm the fixture
          exists, and which fixtures exist in the other seven competitions is
          part of what Pro is selling. So this states the fact and offers the
          likely reason without asserting it, and never turns into an upsell. */}
      {!loading && !error && !fixture && (
        <p className={'py-12 text-center text-sm text-ink-muted'}>
          This fixture is not available. The published window holds yesterday, today and tomorrow.
        </p>
      )}

      {fixture && <Loaded fixture={fixture} />}
    </div>
  )
}

export default FixturePage
