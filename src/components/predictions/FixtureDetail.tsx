import MarketList from './MarketList'
import CorrectScores from './CorrectScores'
import ExplanationBreakdown from './ExplanationBreakdown'
import FixtureMeta from './FixtureMeta'
import FinalScore from './FinalScore'
import { hasFullDetail } from '../../utils/entitlement'
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
 *
 * Most of that arrives only on a full payload. What survives a teaser is the
 * result and the fixture's own provenance, so the panel narrows rather than
 * emptying — a second column of blanks would read as a loading failure.
 */
function FixtureDetail({ fixture, markets, bestBet, isOpened, id }: FixtureDetailProps) {
  const full = hasFullDetail(fixture) ? fixture : null

  return (
    <div id={id} className={`flex-col gap-8 w-full ${isOpened ? 'flex' : 'hidden'}`}>
      {fixture.home_score !== null && (
        <div className={'mt-8'}>
          <FinalScore fixture={fixture} variant={'full'} />
        </div>
      )}

      <div className={`grid grid-cols-1 gap-8 mt-8 ${full ? 'lg:grid-cols-2' : ''}`}>
        {full && (
          <CorrectScores
            scores={full.correct_scores}
            homeTeam={full.home_team}
            awayTeam={full.away_team}
          />
        )}
        <FixtureMeta fixture={fixture} />
      </div>

      {full && (
        <ExplanationBreakdown
          explanation={full.explanation}
          homeTeam={full.home_team}
          awayTeam={full.away_team}
        />
      )}

      {full && <MarketList markets={markets} bestBet={bestBet} isOpened={true} />}
    </div>
  )
}

export default FixtureDetail
