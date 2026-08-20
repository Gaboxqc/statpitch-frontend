import DonutChart from '../ui/DonutChart'
import { BrainIcon, ChartIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import OutcomeBar from '../ui/OutcomeBar'
import { useBestToday } from '../../hooks/queries'
import { useElapsed } from '../../hooks/useElapsed'
import { COLD_START_HINT_MS } from '../../services/api'
import { buildPredictionView } from '../../utils/predictionView'
import { useId, useState } from 'react'
import FixtureDetail from './FixtureDetail'
import QueryError from '../ui/QueryError'
import TeamCrest from '../ui/TeamCrest'
import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import { competitionName } from '../../constants/competitions'
import { predictionSource } from '../../utils/humanise'
import { describeKickoffLong } from '../../utils/datetime'

function MatchDayCard() {
  // Highest win probability today, which is not the same as the best bet —
  // this fixture can be unpriced and carry no selection at all.
  const { fixture: prediction, loading, error } = useBestToday()
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
  if (!prediction) return <p className={'text-center mt-8'}>No prediction available.</p>

  const { markets, bestBet, bestMarket, winner } = buildPredictionView(prediction)
  const kickoff = describeKickoffLong(prediction)

  return (
    <div className={'border border-emerald-500/20 bg-zinc-900/60 rounded-lg'}>
      <div
        className={
          'flex flex-col bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 p-6'
        }
      >
        <div className={'w-full'}>
          <div className={'grid grid-cols-1  md:grid-cols-2'}>
            <div className={'flex items-center gap-2 pb-2'}>
              <div className={'h-1 w-1 bg-primary rounded-full animate-pulse'}></div>
              <h2 className={'eyebrow text-ink-muted'}>Match of the day</h2>
            </div>

            <div
              className={
                'flex justify-between items-center py-4 text-ink-muted md:justify-end md:gap-4'
              }
            >
              <div>
                <p className={'text-xs'}>{competitionName(prediction.competition_id)}</p>
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

          <div className={'flex justify-center gap-4 text-ink mt-4'}>
            <div className={'flex flex-col items-center'}>
              <TeamCrest
                name={prediction.home_team}
                url={prediction.home_crest_url}
                className={'w-20 h-20 md:w-40 md:h-40 text-4xl md:text-6xl'}
              />
              <p className={'text-sm font-medium mt-2 text-center'}>{prediction.home_team}</p>
              <p className={'numeric text-xl md:text-2xl text-primary font-semibold'}>
                {formatFraction(prediction.home_win_prob)}
              </p>
              <p className={'eyebrow text-ink-subtle'}>Win</p>
              <div
                className={
                  'flex gap-2 mt-2 text-xs bg-accent/40 py-1 px-2 rounded-md border border-accent/80'
                }
              >
                <p className={'eyebrow text-ink-muted'}>xG</p>
                <p className={'numeric text-primary font-semibold'}>
                  {formatDecimal(prediction.home_xg)}
                </p>
              </div>
            </div>
            <div className={'flex flex-col items-center justify-center gap-4 mx-4'}>
              <p className={'eyebrow text-ink-subtle'}>vs</p>
              <div
                className={
                  'flex flex-col items-center bg-accent/40 border border-accent/80 px-4 py-2 rounded-lg'
                }
              >
                <p className={'eyebrow text-ink-subtle'}>Draw</p>
                <p className={'numeric text-lg text-ink-muted'}>
                  {formatFraction(prediction.draw_prob)}
                </p>
              </div>
            </div>
            <div className={'flex flex-col items-center'}>
              <TeamCrest
                name={prediction.away_team}
                url={prediction.away_crest_url}
                className={'w-20 h-20 md:w-40 md:h-40 text-4xl md:text-6xl'}
              />
              <p className={'text-sm font-medium mt-2 text-center'}>{prediction.away_team}</p>
              <p className={'numeric text-xl md:text-2xl font-semibold text-chart-2'}>
                {formatFraction(prediction.away_win_prob)}
              </p>
              <p className={'eyebrow text-ink-subtle'}>Win</p>
              <div
                className={
                  'flex gap-2 mt-2 text-xs bg-accent/40 py-1 px-2 rounded-md border border-accent/80'
                }
              >
                <p className={'eyebrow text-ink-muted'}>xG</p>
                <p className={'numeric text-chart-2 font-semibold'}>
                  {formatDecimal(prediction.away_xg)}
                </p>
              </div>
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
                'flex justify-between items-center text-xs gap-3 mt-6 border border-primary/20 rounded-lg px-4 py-3 bg-primary/10'
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
            // Two different reasons produce no pick, and they mean different
            // things: no market to bet into, versus a market with no edge in it.
            <p
              className={
                'mt-6 text-xs text-ink-subtle border border-secondary-foreground/15 rounded-lg px-4 py-3'
              }
            >
              {prediction.odds_coverage
                ? 'Priced, but no selection cleared the minimum stake. Prediction only.'
                : 'No odds matched this fixture, so nothing can be priced. Prediction only.'}
            </p>
          )}

          <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'}>
            <div className={'mt-4 text-ink-subtle flex gap-4'}>
              <DonutChart value={winner.prob} />
              <div>
                <p className={'eyebrow'}>AI confidence</p>
                <div className={'flex items-center gap-2'}>
                  <BrainIcon className={`text-primary`} />
                  <p className={`text-sm text-ink`}>
                    Prediction:
                    <span className={`font-semibold text-primary`}> {winner.name} win</span>
                  </p>
                </div>
                <p className={'text-xs shrink-0'}>
                  Model <span className={'numeric'}>{prediction.model_version}</span> ·{' '}
                  {predictionSource(prediction.prediction_source)?.label ?? 'unknown source'}
                </p>
              </div>
            </div>

            <button
              className={
                'mt-4 px-4 max-h-12 lg:justify-self-end bg-accent/40 border border-accent/80 text-ink rounded-md py-2 flex items-center justify-center gap-2 text-sm'
              }
              onClick={() => setIsOpened((prev) => !prev)}
              type='button'
              aria-expanded={isOpened}
              aria-controls={marketsId}
            >
              <ChartIcon className={'h-4 w-4 text-primary'} />
              <p className={'font-medium'}>Market breakdown</p>
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
