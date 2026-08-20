import { formatFraction, toPercentValue } from '../../utils/format'
import type { CorrectScore } from '../../types/api'

/** Enough to show the shape of the distribution without turning into a table. */
const SHOWN = 6

interface CorrectScoresProps {
  scores: CorrectScore[] | null
  homeTeam: string
  awayTeam: string
}

/**
 * The model's most likely scorelines. Worth showing because the 1X2 view
 * flattens it: two fixtures can share a 73% home win and disagree completely on
 * whether that means 1-0 or 4-1.
 */
function CorrectScores({ scores, homeTeam, awayTeam }: CorrectScoresProps) {
  if (!scores || scores.length === 0) return null

  const top = [...scores].sort((a, b) => b.probability - a.probability).slice(0, SHOWN)
  // Scaled against the most likely scoreline, not against 100%, so the bars
  // stay legible when the distribution is flat.
  const peak = top[0].probability

  return (
    <section className={'flex flex-col gap-2 w-full'}>
      <h3 className={'eyebrow text-ink-subtle'}>Likely scorelines</h3>
      <p className={'sr-only'}>
        Scores are given as {homeTeam} first, {awayTeam} second.
      </p>
      <ul className={'flex flex-col gap-1'}>
        {top.map((score) => (
          <li key={`${score.home}-${score.away}`} className={'flex items-center gap-3 text-xs'}>
            <span className={'numeric font-semibold w-10 shrink-0'}>
              {score.home}&ndash;{score.away}
            </span>
            <span className={'h-2 flex-1 bg-accent/30 rounded-full overflow-hidden'}>
              <span
                className={'block h-full bg-primary/60 rounded-full'}
                style={{ width: `${(score.probability / peak) * 100}%` }}
              />
            </span>
            <span className={'numeric text-ink-subtle w-12 text-right shrink-0'}>
              {formatFraction(score.probability, 1)}
            </span>
          </li>
        ))}
      </ul>
      <p className={'text-xs text-ink-subtle'}>
        Top {top.length} of {scores.length} scorelines, covering{' '}
        {formatFraction(
          top.reduce((sum, score) => sum + score.probability, 0),
          0,
        )}{' '}
        of the distribution. Bars are relative to the most likely score (
        {toPercentValue(peak).toFixed(1)}%).
      </p>
    </section>
  )
}

export default CorrectScores
