import { useId } from 'react'
import { buildCalibration, MIN_BETS } from '../../utils/calibration'
import { formatFraction } from '../../utils/format'
import type { SettledBet } from '../../types/api'

const SIZE = 280
const PAD = { top: 12, right: 12, bottom: 32, left: 40 }
const PLOT = SIZE - PAD.left - PAD.right
const PLOT_H = SIZE - PAD.top - PAD.bottom

const x = (value: number) => PAD.left + value * PLOT
const y = (value: number) => PAD.top + (1 - value) * PLOT_H

/** A bucket of two bets and a bucket of forty should not be the same dot. */
const radius = (bets: number, most: number) => 3 + (bets / most) * 5

function CalibrationChart({ bets }: { bets: SettledBet[] }) {
  const { buckets, total, readable } = buildCalibration(bets)
  const titleId = useId()

  if (!readable) {
    return (
      <p className={'py-8 text-center text-sm text-ink-subtle'}>
        Not enough settled bets to say anything about calibration yet —{' '}
        <span className={'numeric text-ink-muted'}>
          {total} of {MIN_BETS}
        </span>
        . A handful of bets can land any way at all on a perfectly calibrated model, so this stays
        blank rather than showing a shape that would read as a finding.
      </p>
    )
  }

  const most = Math.max(...buckets.map((bucket) => bucket.bets))

  return (
    <figure className={'m-0 flex flex-col gap-3'}>
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-start'}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className={'w-full max-w-[280px] font-mono'}
          role={'img'}
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            Predicted probability against the share that actually won, in five bands. A table of the
            same figures follows.
          </title>

          {/* Perfect calibration. Every point's distance from this line is the
              claim the chart makes. */}
          <line
            x1={x(0)}
            y1={y(0)}
            x2={x(1)}
            y2={y(1)}
            stroke={'var(--color-ink-subtle)'}
            strokeDasharray={'3 3'}
            strokeOpacity={0.7}
          />

          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT}
            height={PLOT_H}
            fill={'none'}
            stroke={'var(--color-line)'}
          />

          {[0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <text
                x={PAD.left - 6}
                y={y(tick)}
                textAnchor={'end'}
                dominantBaseline={'middle'}
                className={'fill-ink-subtle'}
                fontSize={10}
              >
                {tick * 100}
              </text>
              <text
                x={x(tick)}
                y={SIZE - 12}
                textAnchor={'middle'}
                className={'fill-ink-subtle'}
                fontSize={10}
              >
                {tick * 100}
              </text>
            </g>
          ))}

          {buckets.map((bucket) => (
            <g key={bucket.from}>
              {/* The interval, not just the point: a bucket of three bets is
                  almost no evidence and has to look like it. */}
              <line
                x1={x(bucket.predicted)}
                x2={x(bucket.predicted)}
                y1={y(bucket.low)}
                y2={y(bucket.high)}
                stroke={'var(--color-primary)'}
                strokeOpacity={0.4}
                strokeWidth={2}
                strokeLinecap={'round'}
              />
              <circle
                cx={x(bucket.predicted)}
                cy={y(bucket.realised)}
                r={radius(bucket.bets, most)}
                fill={'var(--color-primary)'}
                stroke={'var(--color-card)'}
                strokeWidth={1.5}
              />
            </g>
          ))}

          <text
            x={PAD.left + PLOT / 2}
            y={SIZE - 1}
            textAnchor={'middle'}
            className={'fill-ink-subtle'}
            fontSize={10}
          >
            predicted %
          </text>
        </svg>

        <div className={'min-w-0 flex-1 overflow-x-auto'}>
          <table className={'w-full border-collapse text-xs'}>
            <caption className={'sr-only'}>
              Predicted probability against realised win rate, by band.
            </caption>
            <thead>
              <tr className={'border-b border-line'}>
                <th scope={'col'} className={'eyebrow py-2 pr-2 text-left text-ink-subtle'}>
                  Band
                </th>
                <th scope={'col'} className={'eyebrow py-2 pr-2 text-right text-ink-subtle'}>
                  Bets
                </th>
                <th scope={'col'} className={'eyebrow py-2 pr-2 text-right text-ink-subtle'}>
                  Predicted
                </th>
                <th scope={'col'} className={'eyebrow py-2 text-right text-ink-subtle'}>
                  Actual
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.from} className={'border-b border-line last:border-b-0'}>
                  <td className={'numeric py-2 pr-2 text-ink-muted'}>
                    {formatFraction(bucket.from, 0)}&ndash;{formatFraction(bucket.to, 0)}
                  </td>
                  <td className={'numeric py-2 pr-2 text-right text-ink-muted'}>
                    {bucket.wins}/{bucket.bets}
                  </td>
                  <td className={'numeric py-2 pr-2 text-right'}>
                    {formatFraction(bucket.predicted, 0)}
                  </td>
                  <td className={'numeric py-2 text-right'}>
                    {formatFraction(bucket.realised, 0)}
                    <span className={'text-ink-subtle'}>
                      {' '}
                      ±{formatFraction((bucket.high - bucket.low) / 2, 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <figcaption className={'text-xs text-ink-subtle'}>
        Each point is a band of published selections: where the model said they would land, against
        where they did. The dashed line is perfect calibration, the bar is a 95% interval, and the
        dot grows with the number of bets behind it. This measures the selections that were
        published, which were chosen for having an edge — not every probability the model produces.
      </figcaption>
    </figure>
  )
}

export default CalibrationChart
