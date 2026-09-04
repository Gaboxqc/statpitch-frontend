import SelectionsTable from './SelectionsTable'
import ForecastMarkets from './ForecastMarkets'
import CorrectScores from './CorrectScores'
import ExplanationBreakdown from './ExplanationBreakdown'
import FixtureMeta from './FixtureMeta'
import FinalScore from './FinalScore'
import { hasFullDetail } from '../../utils/entitlement'
import { BAND_STYLE } from '../../utils/confidence'
import type { Confidence, Fixture } from '../../types/api'

const BAND_LABELS: Record<Confidence, string> = { low: 'Low', medium: 'Medium', high: 'High' }

/**
 * The API's own account of how much this prediction is worth, in its own
 * sentences. They are written to be rendered as they arrive, so they are — a
 * tooltip would put them out of reach of touch and keyboard both.
 */
function ConfidenceReasons({ band, reasons }: { band: Confidence; reasons: string[] }) {
  return (
    <section className={'flex w-full flex-col gap-2'}>
      <h3 className={'eyebrow text-ink-subtle'}>Confidence</h3>
      <p>
        <span className={`eyebrow rounded-md border py-0.5 px-2 ${BAND_STYLE[band]}`}>
          {BAND_LABELS[band]}
        </span>
      </p>
      {reasons.length > 0 && (
        <ul className={'flex flex-col gap-1'}>
          {reasons.map((reason) => (
            <li key={reason} className={'text-xs text-ink-muted'}>
              {reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface FixtureDetailProps {
  fixture: Fixture
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
function FixtureDetail({ fixture, isOpened, id }: FixtureDetailProps) {
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

      {full && <ConfidenceReasons band={full.confidence} reasons={full.confidence_reasons} />}

      {full && (
        <ExplanationBreakdown
          explanation={full.explanation}
          homeTeam={full.home_team}
          awayTeam={full.away_team}
        />
      )}

      {/* What StatPitch priced and staked, then the markets it predicts but
          nobody prices. Two different kinds of claim, kept apart. */}
      {full && <SelectionsTable selections={full.selections} competitionId={full.competition_id} />}

      {full && <ForecastMarkets fixture={full} />}
    </div>
  )
}

export default FixtureDetail
