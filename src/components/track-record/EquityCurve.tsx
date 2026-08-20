import { useId, useState } from 'react'
import { buildEquityCurves } from '../../utils/equityCurve'
import { formatMatchDay } from '../../utils/datetime'
import type { Basis, SettledBet } from '../../types/api'

const WIDTH = 720
const HEIGHT = 260
const PAD = { top: 16, right: 84, bottom: 28, left: 44 }

const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom

/**
 * Colour follows the strategy, not its rank, so filtering one out never
 * repaints the other. Both are validated against the card surface.
 */
const SERIES_STYLE: Record<Basis, { stroke: string; label: string; text: string }> = {
  '1x2': { stroke: 'var(--series-1x2)', label: '1X2', text: 'text-series-1x2' },
  overall: { stroke: 'var(--series-overall)', label: 'Overall', text: 'text-series-overall' },
}

const formatUnits = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}u`

function EquityCurve({ bets }: { bets: SettledBet[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const titleId = useId()

  const { dates, series, min, max } = buildEquityCurves(bets)

  if (dates.length === 0) {
    return (
      <p className={'text-sm text-ink-subtle py-8 text-center'}>
        No bets have settled yet, so there is no curve to draw.
      </p>
    )
  }

  // A flat run would otherwise divide by zero and collapse the plot.
  const span = max - min || 1
  const x = (index: number) =>
    PAD.left + (dates.length === 1 ? PLOT_W / 2 : (index / (dates.length - 1)) * PLOT_W)
  const y = (value: number) => PAD.top + PLOT_H - ((value - min) / span) * PLOT_H

  const active = hovered !== null ? hovered : null

  return (
    <figure className={'flex flex-col gap-3 m-0'}>
      <div className={'flex items-center gap-4 text-xs'}>
        {series.map((entry) => (
          <span key={entry.basis} className={'flex items-center gap-2'}>
            <span
              aria-hidden={true}
              className={'h-0.5 w-4 rounded-sm'}
              style={{ background: SERIES_STYLE[entry.basis].stroke }}
            />
            <span className={'text-ink-muted'}>
              {SERIES_STYLE[entry.basis].label}
              <span className={'numeric text-ink-subtle'}>
                {' '}
                {formatUnits(entry.final)} · {entry.totalBets} bets
              </span>
            </span>
          </span>
        ))}
      </div>

      <div className={'relative w-full'}>
        {/* Every string drawn inside the plot is a figure, so the plot is mono. */}
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={'w-full h-auto font-mono'}
          role={'img'}
          aria-labelledby={titleId}
          onMouseLeave={() => setHovered(null)}
        >
          <title id={titleId}>
            Cumulative profit and loss in units, by settlement date, for each strategy. A table of
            the same figures follows.
          </title>

          {/* Break-even. The reference the whole chart is read against. */}
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(0)}
            y2={y(0)}
            stroke={'var(--color-secondary-foreground)'}
            strokeOpacity={0.55}
            strokeDasharray={'3 3'}
          />
          <text
            x={PAD.left - 8}
            y={y(0)}
            textAnchor={'end'}
            dominantBaseline={'middle'}
            className={'fill-ink-subtle'}
            fontSize={10}
          >
            0u
          </text>
          <text
            x={PAD.left - 8}
            y={y(max)}
            textAnchor={'end'}
            dominantBaseline={'middle'}
            className={'fill-ink-subtle'}
            fontSize={10}
          >
            {formatUnits(max)}
          </text>
          {min < 0 && (
            <text
              x={PAD.left - 8}
              y={y(min)}
              textAnchor={'end'}
              dominantBaseline={'middle'}
              className={'fill-ink-subtle'}
              fontSize={10}
            >
              {formatUnits(min)}
            </text>
          )}

          {series.map((entry) => (
            <g key={entry.basis}>
              <polyline
                fill={'none'}
                stroke={SERIES_STYLE[entry.basis].stroke}
                strokeWidth={2}
                strokeLinejoin={'round'}
                strokeLinecap={'round'}
                points={entry.cumulative.map((value, i) => `${x(i)},${y(value)}`).join(' ')}
              />
              {/* Direct label, so identity never rests on colour alone. */}
              <text
                x={WIDTH - PAD.right + 8}
                y={y(entry.final)}
                dominantBaseline={'middle'}
                fill={SERIES_STYLE[entry.basis].stroke}
                fontSize={11}
              >
                {SERIES_STYLE[entry.basis].label}
              </text>
            </g>
          ))}

          {active !== null && (
            <g>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={PAD.top + PLOT_H}
                stroke={'var(--color-secondary-foreground)'}
                strokeOpacity={0.4}
              />
              {series.map((entry) => (
                <circle
                  key={entry.basis}
                  cx={x(active)}
                  cy={y(entry.cumulative[active])}
                  r={4}
                  fill={SERIES_STYLE[entry.basis].stroke}
                  stroke={'var(--color-card)'}
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Hit targets are far wider than the marks they select. */}
          {dates.map((date, index) => (
            <rect
              key={date}
              x={x(index) - PLOT_W / Math.max(dates.length - 1, 1) / 2}
              y={PAD.top}
              width={PLOT_W / Math.max(dates.length - 1, 1)}
              height={PLOT_H}
              fill={'transparent'}
              onMouseEnter={() => setHovered(index)}
            />
          ))}

          <text x={PAD.left} y={HEIGHT - 8} className={'fill-ink-subtle'} fontSize={10}>
            {formatMatchDay(dates[0])}
          </text>
          {dates.length > 1 && (
            <text
              x={WIDTH - PAD.right}
              y={HEIGHT - 8}
              textAnchor={'end'}
              className={'fill-ink-subtle'}
              fontSize={10}
            >
              {formatMatchDay(dates.at(-1))}
            </text>
          )}
        </svg>

        {active !== null && (
          <div
            className={
              'absolute top-0 -translate-x-1/2 pointer-events-none bg-card border border-secondary-foreground/20 rounded-sm px-2 py-1 text-xs whitespace-nowrap'
            }
            style={{ left: `${(x(active) / WIDTH) * 100}%` }}
          >
            <p className={'numeric text-ink-subtle'}>{formatMatchDay(dates[active])}</p>
            {series.map((entry) => (
              <p key={entry.basis} className={'numeric text-ink'}>
                <span className={SERIES_STYLE[entry.basis].text}>■</span>{' '}
                {SERIES_STYLE[entry.basis].label} {formatUnits(entry.cumulative[active])}
                <span className={'text-ink-subtle'}> · {entry.bets[active]} bets</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <figcaption className={'text-xs text-ink-subtle'}>
        Cumulative profit and loss at one unit per bet. The two strategies are shown separately and
        never combined — they bet the same fixtures on different rules.
      </figcaption>
    </figure>
  )
}

export default EquityCurve
