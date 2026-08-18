import MarketList from './MarketList'
import CorrectScores from './CorrectScores'
import ExplanationBreakdown from './ExplanationBreakdown'
import FixtureMeta from './FixtureMeta'
import FinalScore from './FinalScore'
import type { Fixture, Market, MarketKey } from '../../types/api'

interface FixtureDetailProps {
  fixture: Fixture
  markets: Market[]
  bestBet: MarketKey | null
  isOpened: boolean
  id?: string
}

/**
 * Everything behind a card's disclosure. The market table used to be the only
 * thing here, which left the scoreline distribution and the model's own feature
 * attributions unused despite arriving on every fixture.
 */
function FixtureDetail({ fixture, markets, bestBet, isOpened, id }: FixtureDetailProps) {
  return (
    <div id={id} className={`flex-col gap-8 w-full ${isOpened ? 'flex' : 'hidden'}`}>
      {fixture.home_score !== null && (
        <div className={'mt-8'}>
          <FinalScore fixture={fixture} variant={'full'} />
        </div>
      )}

      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'}>
        <CorrectScores
          scores={fixture.correct_scores}
          homeTeam={fixture.home_team}
          awayTeam={fixture.away_team}
        />
        <FixtureMeta fixture={fixture} />
      </div>

      <ExplanationBreakdown
        explanation={fixture.explanation}
        homeTeam={fixture.home_team}
        awayTeam={fixture.away_team}
      />

      <MarketList markets={markets} bestBet={bestBet} isOpened={true} />
    </div>
  )
}

export default FixtureDetail
