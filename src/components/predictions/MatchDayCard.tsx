import DonutChart from '../ui/DonutChart'
import { BrainIcon, ChartIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import OutcomeBar from '../ui/OutcomeBar'
import { useMatchOfTheDay } from '../../hooks/queries'
import { useFixtureFilters } from '../../hooks/useFixtureFilters'
import { useElapsed } from '../../hooks/useElapsed'
import { COLD_START_HINT_MS } from '../../services/api'
import { buildPredictionView, certainty } from '../../utils/predictionView'
import { hasFullDetail, hasProbabilities } from '../../utils/entitlement'
import { useId, useState } from 'react'
import FixtureDetail from './FixtureDetail'
import QueryError from '../ui/QueryError'
import TeamCrest from '../ui/TeamCrest'
import ConfidenceBadge from '../ui/ConfidenceBadge'
import {
  formatDecimal,
  formatFraction,
  formatSignedFraction,
  shortModelVersion,
} from '../../utils/format'
import { fixtureCompetition } from '../../constants/competitions'
import { displayName } from '../../utils/teamName'
import { describeKickoffLong } from '../../utils/datetime'
import type { DayKey } from '../../types/api'

/** The card is a claim about a specific day, so its heading has to say which. */
const HEADINGS: Record<DayKey, string> = {
  yesterday: "Yesterday's match",
  today: 'Match of the day',
  tomorrow: "Tomorrow's pick",
}

function MatchDayCard() {
  // The strongest call on the day being viewed, which is not the same as the
  // best bet — this fixture can be unpriced and carry no selection at all.
  const { filters } = useFixtureFilters()
  const { fixture: prediction, loading, error } = useMatchOfTheDay(filters.day)
  const [isOpened, setIsOpened] = useState(false)
  const slow = useElapsed(COLD_START_HINT_MS)
  const marketsId = useId()

  if (loading)
    return (
      <div>
        <div className={'h-120 w-full bg-secondary animate-pulse rounded-lg'}></div>
        {slow && (
          <p className={'text-center text-xs text-ink-subtle mt-2'} role={'status'}>
            Waking the prediction service. This can take up to a minute.
          </p>
        )}
      </div>
    )
  if (error) return <QueryError error={error} />

  /**
   * No pick is a state, not a failure, and the honest response to it is to take
   * the card away. A day with no fixtures has nothing to feature; a day whose
   * fixtures are all teasers — every day but today, for a reader who is not
   * paying — has nothing to say about the one it would pick. The list below is
   * where those days are read anyway.
   */
  if (!prediction) return null

  // Today's pick is always returned unlocked, on every tier and to anonymous
  // visitors, and a derived pick is only ever chosen from fixtures that carry a
  // prediction. The guard is here because the type cannot know that.
  if (!hasProbabilities(prediction)) return null

  const { markets, bestBet, bestMarket, winner } = buildPredictionView(prediction)
  const matchCertainty = certainty(prediction)
  const kickoff = describeKickoffLong(prediction)
  // Everything the market paid for: xG, the pick, and why there is not one.
  const full = hasFullDetail(prediction) ? prediction : null

  return (
    <div className={'border border-line bg-card rounded-lg'}>
      <div className={'flex flex-col p-4 sm:p-6'}>
        <div className={'w-full'}>
          <div className={'grid grid-cols-1  md:grid-cols-2'}>
            <div className={'flex items-center gap-2 pb-2'}>
              <div className={'h-1 w-1 bg-primary rounded-full animate-pulse'}></div>
              <h2 className={'eyebrow text-ink-muted'}>{HEADINGS[filters.day]}</h2>
            </div>

            <div
              className={
                'flex justify-between items-center py-4 text-ink-muted md:justify-end md:gap-4'
              }
            >
              <div>
                <p className={'text-xs'}>{fixtureCompetition(prediction).short}</p>
              </div>
              <div>
                <time
                  dateTime={kickoff.dateTime}
                  className={`numeric text-xs ${kickoff.provisional ? 'italic opacity-70' : ''}`}
                >
                  {kickoff.text}
                </time>
              </div>
            </div>
          </div>

          <div className={'flex justify-center gap-2 text-ink mt-4 sm:gap-4'}>
            <div className={'flex min-w-0 flex-col items-center'}>
              <TeamCrest
                name={prediction.home_team}
                url={prediction.home_crest_url}
                className={'w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28'}
              />
              <p className={'text-sm font-medium mt-2 text-center'} title={prediction.home_team}>
                {displayName(prediction.home_team)}
              </p>
              <p className={'numeric text-xl md:text-2xl text-primary font-semibold'}>
                {formatFraction(prediction.home_win_prob)}
              </p>
              <p className={'eyebrow text-ink-subtle'}>Win</p>
              {full && (
                <div
                  className={
                    'flex gap-2 mt-2 text-xs bg-secondary py-1 px-2 rounded-md border border-line'
                  }
                >
                  <p className={'text-xs text-ink-subtle'}>xG</p>
                  <p className={'numeric text-primary font-semibold'}>
                    {formatDecimal(full.home_xg)}
                  </p>
                </div>
              )}
            </div>
            <div className={'flex shrink-0 flex-col items-center justify-center gap-4 mx-1 sm:mx-4'}>
              <p className={'eyebrow text-ink-subtle'}>vs</p>
              <div
                className={
                  'flex flex-col items-center bg-secondary border border-line px-3 py-2 rounded-lg sm:px-4'
                }
              >
                <p className={'eyebrow text-ink-subtle'}>Draw</p>
                <p className={'numeric text-lg text-ink-muted'}>
                  {formatFraction(prediction.draw_prob)}
                </p>
              </div>
            </div>
            <div className={'flex min-w-0 flex-col items-center'}>
              <TeamCrest
                name={prediction.away_team}
                url={prediction.away_crest_url}
                className={'w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28'}
              />
              <p className={'text-sm font-medium mt-2 text-center'} title={prediction.away_team}>
                {displayName(prediction.away_team)}
              </p>
              <p className={'numeric text-xl md:text-2xl font-semibold text-chart-2'}>
                {formatFraction(prediction.away_win_prob)}
              </p>
              <p className={'eyebrow text-ink-subtle'}>Win</p>
              {full && (
                <div
                  className={
                    'flex gap-2 mt-2 text-xs bg-secondary py-1 px-2 rounded-md border border-line'
                  }
                >
                  <p className={'text-xs text-ink-subtle'}>xG</p>
                  <p className={'numeric text-chart-2 font-semibold'}>
                    {formatDecimal(full.away_xg)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <OutcomeBar
            home={prediction.home_win_prob * 100}
            away={prediction.away_win_prob * 100}
            draw={prediction.draw_prob * 100}
          />

          {bestBet ? (
            <div
              className={
                'flex justify-between items-center text-xs gap-3 mt-6 border border-primary/40 rounded-lg px-4 py-3 bg-primary/10'
              }
            >
              <div className={'flex items-center gap-2'}>
                <ThunderIcon className={'h-4 w-4 text-primary'} />
                <div className={'flex flex-col gap-1'}>
                  <p className={'eyebrow text-ink-subtle'}>
                    Top pick <span className={'numeric'}>· {prediction.model_version}</span>
                  </p>
                  <p className={'text-sm font-medium'}>{bestMarket?.market}</p>
                </div>
              </div>
              <div className={'flex gap-4'}>
                <div className={'text-center'}>
                  <p className={'eyebrow text-ink-subtle mb-1'}>EV</p>
                  {/* A 0-1 fraction from the API, and already signed by the formatter. */}
                  <p className={'numeric text-primary font-semibold text-sm'}>
                    {formatSignedFraction(bestMarket?.ev)}
                  </p>
                </div>
                <div className={'text-center'}>
                  <p className={'eyebrow text-ink-subtle mb-1'}>Kelly stake</p>
                  <p className={'numeric text-sm font-semibold'}>
                    {formatFraction(bestMarket?.kelly)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            full && (
              // Two different reasons produce no pick, and they mean different
              // things: no market to bet into, versus a market with no edge in
              // it. Neither is sayable without the market itself.
              <p className={'mt-6 text-xs text-ink-subtle border border-line rounded-lg px-4 py-3'}>
                {full.odds_coverage
                  ? 'Priced, but no selection cleared the minimum stake. Prediction only.'
                  : 'No odds matched this fixture, so nothing can be priced. Prediction only.'}
              </p>
            )
          )}

          <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'}>
            <div className={'mt-4 text-ink-subtle flex gap-4'}>
              <DonutChart value={winner.prob} />
              <div className={'flex flex-col gap-1'}>
                {/* "AI confidence" used to head a ring showing the top outcome's
                    probability — a fact about the match, not about the model.
                    The gap back to second place says how settled the match is,
                    and the badge says what the prediction is worth. */}
                <p className={'eyebrow text-ink-subtle'}>Model view</p>
                <div className={'flex items-center gap-2'}>
                  <BrainIcon className={`text-primary`} />
                  <p className={`text-sm text-ink`}>
                    Prediction:
                    <span className={`font-semibold text-primary`}>
                      {' '}
                      {displayName(winner.name)} win
                    </span>
                  </p>
                </div>
                <p className={'text-xs text-ink-muted'}>
                  {matchCertainty.label}
                  <span className={'text-ink-subtle'}>
                    {' · '}
                    <span className={'numeric'}>
                      {formatFraction(matchCertainty.margin, 0)}
                    </span>{' '}
                    clear of the next outcome
                  </span>
                </p>
                <div className={'flex flex-wrap items-center gap-2 text-xs text-ink-subtle'}>
                  <ConfidenceBadge fixture={prediction} showWhenClean={true} />
                  <span className={'numeric'} title={prediction.model_version}>
                    {shortModelVersion(prediction.model_version)}
                  </span>
                </div>
              </div>
            </div>

            <button
              className={
                'mt-4 w-full px-4 lg:w-auto lg:justify-self-end bg-secondary border border-line text-ink rounded-md py-2.5 flex items-center justify-center gap-2 text-sm'
              }
              onClick={() => setIsOpened((prev) => !prev)}
              type='button'
              aria-expanded={isOpened}
              aria-controls={marketsId}
            >
              <ChartIcon className={'h-4 w-4 text-primary'} />
              {/* The market is a paid line. Without it the panel still holds
                  the fixture's provenance, so the button opens the same
                  disclosure under a name that matches what is inside it. */}
              <p className={'font-medium'}>{full ? 'Market breakdown' : 'Fixture detail'}</p>
              <ShortArrowIcon className={`h-4 w-4 ${isOpened ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        <FixtureDetail
          id={marketsId}
          fixture={prediction}
          markets={markets}
          bestBet={bestBet}
          isOpened={isOpened}
        />
      </div>
    </div>
  )
}

export default MatchDayCard
