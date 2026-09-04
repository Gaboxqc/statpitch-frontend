import { useId, useState } from 'react'
import { Link } from 'react-router'
import DonutChart from '../ui/DonutChart'
import ProbabilityTiles from '../ui/ProbabilityTiles'
import FixtureDetail from './FixtureDetail'
import FinalScore from './FinalScore'
import { ClockIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import TeamCrest from '../ui/TeamCrest'
import ConfidenceBadge from '../ui/ConfidenceBadge'
import Upsell from '../ui/Upsell'
import { useCompetitionScope } from '../../hooks/queries'
import { OUTSIDE_SCOPE } from '../../constants/content'
import { buildPredictionView } from '../../utils/predictionView'
import { hasFullDetail, hasProbabilities } from '../../utils/entitlement'
import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import { describeKickoff } from '../../utils/datetime'
import { fixtureCompetition } from '../../constants/competitions'
import { displayName } from '../../utils/teamName'
import type { PredictionView } from '../../utils/predictionView'
import type { Fixture } from '../../types/api'

/**
 * The state is carried by the card's own border, because it is the one thing
 * that has to read before anything is actually read. Everything else stays on
 * the shared surface: three states, not three designs.
 */
const SHELL: Record<PredictionView['state'], string> = {
  actionable: 'border-primary/40',
  settled: 'border-line',
  forecast: 'border-line',
  locked: 'border-line',
}

/** `xg` is null when the payload withholds it, and then the line is absent. */
function TeamRow({ name, crest, xg }: { name: string; crest: string | null; xg: number | null }) {
  return (
    <li className={'flex min-w-0 items-center gap-2'}>
      <TeamCrest name={name} url={crest} dense={true} />
      {/* Narrow enough and the club name and its xG cannot share a line without
          one of them being clipped, and a clipped club name is not a name. */}
      <div className={'flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-2'}>
        <p className={'text-sm font-medium'} title={name}>
          {displayName(name)}
        </p>
        {xg !== null && (
          <p className={'text-xs text-ink-subtle shrink-0'}>
            xG <span className={'numeric text-ink-muted'}>{formatDecimal(xg)}</span>
          </p>
        )}
      </div>
    </li>
  )
}

/**
 * One slot, three answers, and only one of them can be true at a time: the bet
 * to place, the result it produced, or — when there is neither — how sure the
 * model is. The donut used to sit on every card regardless, which spent the
 * loudest element on the cards with the least to say.
 */
function Verdict({ fixture, view }: { fixture: Fixture; view: PredictionView }) {
  if (view.state === 'settled') return <FinalScore fixture={fixture} />

  // The slot still has to say something, or a locked card reads as one that
  // failed to load. It is also the only place on this card with room to say it.
  if (view.state === 'locked' || view.winner === null) return <Upsell variant={'inline'} />

  if (view.state === 'actionable') {
    return (
      <div
        className={
          'flex shrink-0 flex-col gap-0.5 rounded-md border border-primary/40 bg-primary/10 py-1 px-2 text-right'
        }
      >
        <p className={'flex items-center justify-end gap-1 eyebrow text-primary'}>
          <ThunderIcon className={'h-3 w-3'} />
          {view.bestMarket?.market}
        </p>
        <p className={'numeric text-sm font-semibold text-primary'}>
          {formatSignedFraction(view.bestMarket?.ev)} EV
        </p>
        {view.bestMarket?.kelly ? (
          <p className={'numeric text-xs text-ink-muted'}>
            {formatFraction(view.bestMarket.kelly)} stake
          </p>
        ) : null}
      </div>
    )
  }

  return <DonutChart value={view.winner.prob} size={44} />
}

/**
 * What stands in the pick's place, said once, where the pick would have been.
 *
 * "No pick" only ever meant *ours* — no selection of ours cleared the minimum
 * stake. That was unambiguous while ours were the only selections there were.
 * Now that the list can be narrowed to StatPitch's rule, a card claiming "no
 * pick" inside that view contradicts the reason it is on screen, so a staked
 * StatPitch row is named instead of denied.
 */
function ForecastNote({ fixture }: { fixture: Fixture }) {
  const { isPriced, isStakeable } = useCompetitionScope()

  if (!hasFullDetail(fixture)) return null

  if (fixture.selections.some((row) => row.stake_fraction > 0)) {
    return (
      <p
        className={'eyebrow shrink-0 text-primary'}
        title={'StatPitch staked a selection here, though none of ours cleared the minimum'}
      >
        Value pick
      </p>
    )
  }

  // Strictly the gap between priced and stakeable, and only once the payload has
  // been given its say: a staked row above outranks this, because a scope that
  // says otherwise is a table disagreeing with the day in front of it. A cup has
  // no market at all and keeps its own, more specific reason below.
  if (isPriced(fixture.competition_id) && !isStakeable(fixture.competition_id)) {
    return (
      <p className={'eyebrow shrink-0 text-ink-subtle'} title={OUTSIDE_SCOPE.title}>
        {OUTSIDE_SCOPE.short}
      </p>
    )
  }

  return fixture.odds_coverage ? (
    <p
      className={'eyebrow shrink-0 text-ink-subtle'}
      title={'Priced, but no selection of ours cleared the minimum stake'}
    >
      No pick
    </p>
  ) : (
    <p
      className={'eyebrow shrink-0 text-ink-subtle'}
      title={'No odds matched this fixture, so nothing could be priced'}
    >
      No odds
    </p>
  )
}

/**
 * `showCompetition` is false inside a grouped list, where the heading above the
 * card has already said which league this is. Repeating it on every card cost
 * the header a third of its width and clipped the name to "Premier Leag…".
 */
function MatchCard({
  prediction,
  showCompetition = true,
}: {
  prediction: Fixture
  showCompetition?: boolean
}) {
  const [isOpened, setIsOpened] = useState(false)
  const view = buildPredictionView(prediction)
  const predicted = hasProbabilities(prediction) ? prediction : null
  const full = hasFullDetail(prediction) ? prediction : null
  const kickoff = describeKickoff(prediction)
  const marketsId = useId()
  const toggle = () => setIsOpened((prev) => !prev)

  return (
    // Clicking anywhere on the card is a mouse convenience; the chevron below is
    // the real control and carries the keyboard and screen-reader semantics.
    <article
      className={`flex flex-col gap-3 rounded-lg border bg-card p-4 text-ink text-xs ${SHELL[view.state]}`}
      onClick={toggle}
    >
      {/* Five things used to share one line, which at 375px left the league
          clipped and the kick-off pressed against the link. They wrap now, and
          the league — when it is here at all — takes the first row to itself. */}
      <header
        className={'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-ink-muted'}
      >
        {showCompetition && (
          <p className={'min-w-0 basis-full truncate sm:basis-auto'}>
            {fixtureCompetition(prediction).short}
          </p>
        )}

        <div className={'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1'}>
          <ConfidenceBadge fixture={prediction} />
          {view.state === 'forecast' && <ForecastNote fixture={prediction} />}
          <span className={'flex items-center gap-1 text-ink-subtle'}>
            <ClockIcon className={'h-4 w-4'} />
            <time
              dateTime={kickoff.dateTime}
              className={`numeric ${kickoff.provisional ? 'italic' : ''}`}
            >
              {kickoff.text}
            </time>
          </span>
        </div>

        {/* This was 37×16 of muted grey with no edge — the one control that
            opens the fixture, and the least visible thing on the card. It is
            outlined rather than filled so it still sits below the upsell. */}
        <Link
          to={`/fixture/${prediction.id}`}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Open ${prediction.home_team} versus ${prediction.away_team}`}
          className={
            'flex min-h-9 shrink-0 items-center gap-1 rounded-md border border-line-strong bg-secondary px-2.5 text-2xs font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary pointer-coarse:min-h-11'
          }
        >
          Open
          <ShortArrowIcon className={'h-3.5 w-3.5 -rotate-90'} />
        </Link>
      </header>

      {/* Below `sm` the verdict drops under the teams instead of competing with
          them for the same row, which is what clipped "Internazionale". */}
      <div
        className={'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'}
      >
        <ul className={'flex min-w-0 flex-col gap-2'}>
          <TeamRow
            name={prediction.home_team}
            crest={prediction.home_crest_url}
            xg={full ? full.home_xg : null}
          />
          <TeamRow
            name={prediction.away_team}
            crest={prediction.away_crest_url}
            xg={full ? full.away_xg : null}
          />
        </ul>

        <div className={'flex shrink-0 items-center justify-end gap-3'}>
          {predicted && view.winner && (
            <ProbabilityTiles prediction={predicted} winner={view.winner} variant={'compact'} />
          )}
          <Verdict fixture={prediction} view={view} />
          <button
            type='button'
            aria-expanded={isOpened}
            aria-controls={marketsId}
            aria-label={`Market analysis for ${prediction.home_team} versus ${prediction.away_team}`}
            className={'cursor-pointer p-1'}
            onClick={(event) => {
              event.stopPropagation()
              toggle()
            }}
          >
            <ShortArrowIcon className={`h-4 w-4 text-ink-subtle ${isOpened ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {predicted && view.winner && (
        <ProbabilityTiles prediction={predicted} winner={view.winner} variant={'wide'} />
      )}

      <FixtureDetail id={marketsId} fixture={prediction} isOpened={isOpened} />
    </article>
  )
}

export default MatchCard
