import { useId, useState } from 'react'
import { Link } from 'react-router'
import DonutChart from '../ui/DonutChart'
import ProbabilityTiles from '../ui/ProbabilityTiles'
import FixtureDetail from './FixtureDetail'
import FinalScore from './FinalScore'
import { ClockIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import TeamCrest from '../ui/TeamCrest'
import ReliabilityBadge from '../ui/ReliabilityBadge'
import Upsell from '../ui/Upsell'
import { buildPredictionView } from '../../utils/predictionView'
import { hasFullDetail, hasProbabilities } from '../../utils/entitlement'
import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import { describeKickoff } from '../../utils/datetime'
import { competitionName } from '../../constants/competitions'
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
      <TeamCrest name={name} url={crest} />
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
 * Why there is nothing to place, said once, where the pick would have been.
 * Both answers are about the market, so neither is sayable without it.
 */
function ForecastNote({ fixture }: { fixture: Fixture }) {
  if (!hasFullDetail(fixture)) return null

  return fixture.odds_coverage ? (
    <p
      className={'eyebrow shrink-0 text-ink-subtle'}
      title={'Priced, but no selection cleared the minimum stake'}
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

function MatchCard({ prediction }: { prediction: Fixture }) {
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
      <header className={'flex items-center justify-between gap-3 text-ink-muted'}>
        <p className={'truncate'}>{competitionName(prediction.competition_id)}</p>

        <div className={'flex shrink-0 items-center gap-3'}>
          <ReliabilityBadge fixture={prediction} />
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
          <Link
            to={`/fixture/${prediction.id}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Open ${prediction.home_team} versus ${prediction.away_team}`}
            className={'eyebrow rounded-md px-1 text-ink-subtle hover:text-ink'}
          >
            Open
          </Link>
        </div>
      </header>

      <div className={'flex items-center justify-between gap-4'}>
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

        <div className={'flex shrink-0 items-center gap-3'}>
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

      <FixtureDetail
        id={marketsId}
        fixture={prediction}
        markets={view.markets}
        bestBet={view.bestBet}
        isOpened={isOpened}
      />
    </article>
  )
}

export default MatchCard
