import DonutChart from '../ui/DonutChart'
import { BrainIcon, ChartIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import OutcomeBar from '../ui/OutcomeBar'
import { useBestToday } from '../../hooks/queries'
import { useElapsed } from '../../hooks/useElapsed'
import { COLD_START_HINT_MS } from '../../services/api'
import { buildPredictionView } from '../../utils/predictionView'
import { useId, useState } from 'react'
import MarketList from './MarketList'
import QueryError from '../ui/QueryError'
import TeamCrest from '../ui/TeamCrest'
import { formatDecimal, formatFraction, formatSignedFraction } from '../../utils/format'
import { DEFAULT_COMPETITION, MODEL } from '../../constants/content'
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
      <div className={'mt-4'}>
        <div className={'h-120 w-10/12 mx-auto bg-secondary animate-pulse rounded-md'}></div>
        {slow && (
          <p className={'text-center text-xs text-secondary-foreground/60 mt-2'} role={'status'}>
            Waking the prediction service. This can take up to a minute.
          </p>
        )}
      </div>
    )
  if (error) return <QueryError error={error} className={'m-2 mt-4 lg:w-2/3 lg:mx-auto'} />
  if (!prediction) return <p className={'text-center mt-8'}>No prediction available.</p>

  const { markets, bestBet, bestMarket, winner } = buildPredictionView(prediction)
  const kickoff = describeKickoffLong(prediction)

  return (
    <div
      className={
        'border border-emerald-500/20 bg-zinc-900/60 m-2 rounded-md mt-4 lg:w-2/3 mx-2 lg:mx-auto'
      }
    >
      <div
        className={
          'flex flex-col bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 p-4'
        }
      >
        <div className={'w-full'}>
          <div className={'grid grid-cols-1  md:grid-cols-2'}>
            <div className={'flex items-center gap-2 pb-2'}>
              <div className={'h-1 w-1 bg-primary rounded-full animate-pulse'}></div>
              <h2 className={'text-secondary-foreground text-xs'}>MATCH OF THE DAY</h2>
            </div>

            <div
              className={
                'flex justify-between items-center py-4 text-secondary-foreground md:justify-end md:gap-4'
              }
            >
              <div>
                <p className={'text-xs'}>{DEFAULT_COMPETITION}</p>
              </div>
              <div>
                <time
                  dateTime={kickoff.dateTime}
                  className={`text-xs ${kickoff.provisional ? 'italic opacity-70' : ''}`}
                >
                  {kickoff.text}
                </time>
              </div>
            </div>
          </div>

          <div className={'flex justify-center gap-4 text-foreground mt-4'}>
            <div className={'flex flex-col items-center'}>
              <TeamCrest
                name={prediction.home_team}
                url={prediction.home_crest_url}
                className={'w-20 h-20 md:w-40 md:h-40 text-4xl md:text-6xl'}
              />
              <p className={'text-sm mt-2 text-center'}>{prediction.home_team}</p>
              <p className={'text-2xl text-primary font-bold'}>
                {formatFraction(prediction.home_win_prob)}
              </p>
              <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
              <div
                className={
                  'flex gap-2 mt-2 text-xs bg-accent/40 p-1 rounded-sm border border-accent/80'
                }
              >
                <p className={'text-secondary-foreground/70'}>XG</p>
                <p className={'text-primary font-bold'}>{formatDecimal(prediction.home_xg)}</p>
              </div>
            </div>
            <div className={'flex flex-col items-center justify-center gap-4 mx-4'}>
              <p className={'text-xs'}>vs</p>
              <div
                className={
                  'flex flex-col items-center bg-accent/40 border border-accent/80 px-4 py-2 rounded-xl'
                }
              >
                <p className={'text-xs text-secondary-foreground/60'}>DRAW</p>
                <p className={'text-md text-secondary-foreground'}>
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
              <p className={'text-sm mt-2 text-center'}>{prediction.away_team}</p>
              <p className={'text-2xl font-bold text-chart-2'}>
                {formatFraction(prediction.away_win_prob)}
              </p>
              <p className={'text-xs text-secondary-foreground/60'}>WIN</p>
              <div
                className={
                  'flex gap-2 mt-2 text-xs bg-accent/40 p-1 rounded-sm border border-accent/80'
                }
              >
                <p className={'text-secondary-foreground/70'}>XG</p>
                <p className={'text-chart-2 font-bold'}>{formatDecimal(prediction.away_xg)}</p>
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
                'flex justify-between items-center text-xs gap-2 mt-4 border border-primary/20 rounded-md px-2 py-3 bg-primary/10'
              }
            >
              <div className={'flex items-center gap-2'}>
                <ThunderIcon className={'h-4 w-4 text-primary'} />
                <div className={'flex flex-col gap-1'}>
                  <p className={'text-xs text-secondary-foreground/60'}>
                    TOP PICK · MODEL {prediction.model_version}
                  </p>
                  <p className={'text-sm'}>{bestMarket?.market}</p>
                </div>
              </div>
              <div className={'flex gap-4'}>
                <div className={'text-center'}>
                  <p className={'text-xs text-secondary-foreground/60 mb-1'}>EV</p>
                  {/* A 0-1 fraction from the API, and already signed by the formatter. */}
                  <p className={'text-primary font-bold text-sm'}>
                    {formatSignedFraction(bestMarket?.ev)}
                  </p>
                </div>
                <div className={'text-center'}>
                  <p className={'text-xs text-secondary-foreground/60 mb-1'}>Kelly Stake</p>
                  <p className={'text-sm'}>{formatFraction(bestMarket?.kelly)}</p>
                </div>
              </div>
            </div>
          ) : (
            // Two different reasons produce no pick, and they mean different
            // things: no market to bet into, versus a market with no edge in it.
            <p
              className={
                'mt-4 text-xs text-secondary-foreground/60 border border-secondary-foreground/15 rounded-md px-2 py-3'
              }
            >
              {prediction.odds_coverage
                ? 'Priced, but no selection cleared the minimum stake. Prediction only.'
                : 'No odds matched this fixture, so nothing can be priced. Prediction only.'}
            </p>
          )}

          <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'}>
            <div className={'mt-4 text-secondary-foreground/50 flex gap-4'}>
              <DonutChart value={winner.prob} />
              <div>
                <p className={'text-xs'}>AI CONFIDENCE</p>
                <div className={'flex items-center gap-2'}>
                  <BrainIcon className={`text-primary`} />
                  <p className={`text-sm text-foreground`}>
                    Prediction:
                    <span className={`font-bold text-primary`}> {winner.name} Win</span>
                  </p>
                </div>
                <p className={'text-xs shrink-0'}>
                  Model {prediction.model_version} · {MODEL.ensemble}
                </p>
              </div>
            </div>

            <button
              className={
                'mt-4 p-4 max-h-12 lg:justify-self-end bg-accent/40 border border-accent/80 text-foreground rounded-md py-2 flex items-center justify-center gap-2 text-sm'
              }
              onClick={() => setIsOpened((prev) => !prev)}
              type='button'
              aria-expanded={isOpened}
              aria-controls={marketsId}
            >
              <ChartIcon className={'h-4 w-4 text-primary'} />
              <p>Market Breakdown</p>
              <ShortArrowIcon className={`h-4 w-4 ${isOpened ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        <MarketList id={marketsId} markets={markets} isOpened={isOpened} bestBet={bestBet} />
      </div>
    </div>
  )
}

export default MatchDayCard
