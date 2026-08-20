import { useId, useState } from 'react'
import DonutChart from '../ui/DonutChart'
import ProbabilityTiles from '../ui/ProbabilityTiles'
import FixtureDetail from './FixtureDetail'
import FinalScore from './FinalScore'
import { ClockIcon, ShortArrowIcon, ThunderIcon } from '../../assets/icons/index'
import TeamCrest from '../ui/TeamCrest'
import { buildPredictionView } from '../../utils/predictionView'
import { formatDecimal, formatSignedFraction } from '../../utils/format'
import { describeKickoff } from '../../utils/datetime'
import { competitionName } from '../../constants/competitions'
import type { Fixture } from '../../types/api'

function MatchCard({ prediction }: { prediction: Fixture }) {
  const [isOpened, setIsOpened] = useState(false)
  const { markets, bestBet, bestMarket, winner } = buildPredictionView(prediction)
  const kickoff = describeKickoff(prediction)
  const marketsId = useId()
  const toggle = () => setIsOpened((prev) => !prev)

  return (
    // Clicking anywhere on the card is a mouse convenience; the chevron below is
    // the real control and carries the keyboard and screen-reader semantics.
    <div
      className={
        'py-2 lg:py-2 flex flex-col items-center justify-center bg-secondary/40 text-ink text-xs rounded-md border border-secondary-foreground/20'
      }
      onClick={toggle}
    >
      <div className={'flex flex-col items-center justify-between w-full m-2 gap-2'}>
        <div className={'flex items-center px-2 self-end w-full justify-between lg:px-4'}>
          <p>{competitionName(prediction.competition_id)}</p>

          <div className={'flex items-center gap-1'}>
            <div
              className={`gap-2 items-center p-1 shrink-0 bg-primary/10 rounded-sm text-xs text-primary border border-primary/50 mr-1 ${bestBet ? 'flex' : 'hidden'}`}
            >
              <ThunderIcon className={'h-3 w-3 text-primary'} />
              <p className={'font-medium'}>
                {bestMarket?.market}{' '}
                <span className={'numeric'}>{formatSignedFraction(bestMarket?.ev)} EV</span>
              </p>
            </div>
            {/* No odds event matched, so there is a prediction but nothing to bet against. */}
            {!prediction.odds_coverage && (
              <p
                className={
                  'p-1 mr-1 shrink-0 rounded-sm text-xs text-ink-subtle border border-secondary-foreground/20'
                }
              >
                Prediction only
              </p>
            )}
            {prediction.home_score !== null && <FinalScore fixture={prediction} />}
            <ClockIcon className={'h-4 w-4 text-ink-subtle'} />
            <time
              dateTime={kickoff.dateTime}
              className={`numeric text-xs ${kickoff.provisional ? 'text-ink-subtle italic' : 'text-ink-subtle'}`}
            >
              {kickoff.text}
            </time>
          </div>
        </div>

        <div className={'flex items-center justify-between w-full'}>
          <div className={'flex flex-col gap-2 ml-4 w-full'}>
            <div className={'flex items-center gap-2'}>
              <TeamCrest name={prediction.home_team} url={prediction.home_crest_url} />

              <p className={'text-sm font-medium w-min'}>{prediction.home_team}</p>
              <p className='text-xs text-ink-muted shrink-0'>
                <span className={'eyebrow'}>xG</span>{' '}
                <span className={'numeric'}>{formatDecimal(prediction.home_xg)}</span>
              </p>
            </div>
            <div className={'flex items-center gap-2'}>
              <TeamCrest name={prediction.away_team} url={prediction.away_crest_url} />

              <p className={'text-sm font-medium'}>{prediction.away_team}</p>
              <p className='text-xs text-ink-muted shrink-0'>
                <span className={'eyebrow'}>xG</span>{' '}
                <span className={'numeric'}>{formatDecimal(prediction.away_xg)}</span>
              </p>
            </div>
          </div>

          <div className={'flex items-center gap-2 w-full px-4 justify-end'}>
            <ProbabilityTiles prediction={prediction} winner={winner} variant={'compact'} />
            <div className={'flex items-center gap-2 justify-end'}>
              <DonutChart value={winner.prob} size={50} />
              <button
                type='button'
                aria-expanded={isOpened}
                aria-controls={marketsId}
                aria-label={`Market analysis for ${prediction.home_team} versus ${prediction.away_team}`}
                className={'p-1 cursor-pointer'}
                onClick={(event) => {
                  event.stopPropagation()
                  toggle()
                }}
              >
                <ShortArrowIcon
                  className={`h-4 w-4 text-ink-subtle ${isOpened ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProbabilityTiles
        prediction={prediction}
        winner={winner}
        variant={'wide'}
        className={'mt-2 px-4 mb-2'}
      />

      <div className={'w-full px-4'}>
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

export default MatchCard
