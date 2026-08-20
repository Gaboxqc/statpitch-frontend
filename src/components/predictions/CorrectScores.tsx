import { formatFraction } from '../../utils/format'
import { displayName } from '../../utils/teamName'
import type { CorrectScore } from '../../types/api'

/** Beyond this the model's own top-N never reaches, and the grid stops being readable. */
const MAX_GOALS = 5

/**
 * A continuous ramp that never crosses the band where neither light nor dark
 * text holds 4.5:1 on it. At full strength the cell is primary at 0.6, which
 * measures 4.64:1 against the ink it carries; every fainter cell is better.
 */
const intensityToAlpha = (intensity: number) => 0.06 + intensity * 0.54

interface CorrectScoresProps {
  scores: CorrectScore[] | null
  homeTeam: string
  awayTeam: string
}

/**
 * The model's scoreline distribution, as the two-dimensional thing it actually
 * is. A ranked list of six flattened it: 73% home tells you nothing about
 * whether that means grinding 1-0s or 4-1s, and the shape of the grid answers
 * exactly that at a glance — a column hugging the left edge is a clean sheet, a
 * diagonal smear is a shootout.
 */
function CorrectScores({ scores, homeTeam, awayTeam }: CorrectScoresProps) {
  if (!scores || scores.length === 0) return null

  const shown = scores.filter((score) => score.home <= MAX_GOALS && score.away <= MAX_GOALS)
  if (shown.length === 0) return null

  const maxHome = Math.max(...shown.map((score) => score.home))
  const maxAway = Math.max(...shown.map((score) => score.away))
  const peak = Math.max(...shown.map((score) => score.probability))
  const covered = shown.reduce((sum, score) => sum + score.probability, 0)

  const byScore = new Map(shown.map((score) => [`${score.home}-${score.away}`, score.probability]))
  const homeGoals = Array.from({ length: maxHome + 1 }, (_, index) => index)
  const awayGoals = Array.from({ length: maxAway + 1 }, (_, index) => index)

  return (
    <section className={'flex w-full flex-col gap-2'}>
      <h3 className={'eyebrow text-ink-subtle'}>Likely scorelines</h3>
      <p className={'text-xs text-ink-subtle'}>
        <span className={'text-ink-muted'}>{displayName(homeTeam)}</span> down,{' '}
        <span className={'text-ink-muted'}>{displayName(awayTeam)}</span> across
      </p>

      <div className={'overflow-x-auto'}>
        <table className={'border-collapse text-2xs'}>
          <caption className={'sr-only'}>
            Probability of each scoreline. Rows are goals scored by {homeTeam}, columns are goals
            scored by {awayTeam}.
          </caption>
          <thead>
            <tr>
              <td className={'p-1'} />
              {awayGoals.map((away) => (
                <th
                  key={away}
                  scope={'col'}
                  className={'numeric w-12 p-1 text-center font-normal text-ink-subtle'}
                >
                  {away}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {homeGoals.map((home) => (
              <tr key={home}>
                <th
                  scope={'row'}
                  className={'numeric p-1 pr-2 text-right font-normal text-ink-subtle'}
                >
                  {home}
                </th>
                {awayGoals.map((away) => {
                  const probability = byScore.get(`${home}-${away}`)
                  if (probability === undefined) {
                    return (
                      <td key={away} className={'p-0.5'}>
                        <span className={'block rounded-md border border-line py-1.5'} />
                      </td>
                    )
                  }
                  return (
                    <td key={away} className={'p-0.5'}>
                      <span
                        className={'numeric block rounded-md py-1.5 text-center text-ink'}
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--primary) ${
                            intensityToAlpha(probability / peak) * 100
                          }%, var(--card))`,
                        }}
                        title={`${home}–${away}: ${formatFraction(probability, 1)}`}
                      >
                        {formatFraction(probability, 1)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The grid only holds what the model published, so it never adds to 100%. */}
      <p className={'text-xs text-ink-subtle'}>
        The <span className={'numeric'}>{shown.length}</span> scorelines the model publishes, worth{' '}
        <span className={'numeric'}>{formatFraction(covered, 0)}</span> of the distribution between
        them. An empty cell is a scoreline outside that set, not one with no chance.
      </p>
    </section>
  )
}

export default CorrectScores
