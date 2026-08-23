import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExplanationBreakdown from './ExplanationBreakdown'
import type { Explanation } from '../../types/api'

const explanation: Explanation = {
  units: 'log goal rate',
  home: [
    { feature: 'elo_diff', feature_value: 120, contribution: 0.28, multiplier: 1.32 },
    { feature: 'rest_days', feature_value: -1, contribution: -0.14, multiplier: 0.87 },
  ],
  away: [{ feature: 'other', feature_value: null, contribution: 0.0001, multiplier: 1.0 }],
}

/** The bars are the only thing here with no accessible name of their own. */
const bars = (container: HTMLElement) =>
  [...container.querySelectorAll('span[style]')] as HTMLElement[]

describe('ExplanationBreakdown', () => {
  /**
   * A divergence chart says "this much, measured from zero". A pill rounded at
   * both ends pulls away from the line it is measured from, which reads as a bar
   * that starts somewhere else.
   */
  it('rounds only the end away from the centre line', () => {
    const { container } = render(
      <ExplanationBreakdown explanation={explanation} homeTeam={'Home FC'} awayTeam={'Away FC'} />,
    )

    const positive = bars(container).find((bar) => bar.style.left === '50%')
    const negative = bars(container).find((bar) => bar.style.right === '50%')

    expect(positive?.className).toContain('rounded-r-full')
    expect(positive?.className).not.toContain('rounded-l-full')
    expect(negative?.className).toContain('rounded-l-full')
    expect(negative?.className).not.toContain('rounded-r-full')
  })

  // A contribution too small to draw is still not the same as no row at all.
  it('keeps a floor width so a negligible contribution is still visible', () => {
    const { container } = render(
      <ExplanationBreakdown explanation={explanation} homeTeam={'Home FC'} awayTeam={'Away FC'} />,
    )

    const widths = bars(container).map((bar) => Number.parseFloat(bar.style.width))
    expect(Math.min(...widths)).toBeGreaterThan(0)
  })

  it('renders nothing when the payload withholds the explanation', () => {
    const { container } = render(
      <ExplanationBreakdown explanation={null} homeTeam={'Home FC'} awayTeam={'Away FC'} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('labels each side with the club it belongs to', () => {
    render(
      <ExplanationBreakdown explanation={explanation} homeTeam={'Home FC'} awayTeam={'Away FC'} />,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Away')).toBeInTheDocument()
  })
})
