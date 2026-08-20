import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CalibrationChart from './CalibrationChart'
import { MIN_BETS } from '../../utils/calibration'
import { settledBetFixture } from '../../test/fixtures'
import type { SettledBet } from '../../types/api'

const ledger = (count: number, probability: number, wins: number): SettledBet[] =>
  Array.from({ length: count }, (_, index) => ({
    ...settledBetFixture,
    id: index,
    probability,
    won: index < wins,
  }))

describe('CalibrationChart', () => {
  // A chart nobody should draw conclusions from is worse than no chart.
  it('refuses to draw a calibration from a handful of bets', () => {
    render(<CalibrationChart bets={ledger(MIN_BETS - 1, 0.5, 10)} />)

    expect(screen.getByText(/not enough settled bets/i)).toBeInTheDocument()
    expect(screen.getByText(`${MIN_BETS - 1} of ${MIN_BETS}`)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  // Twenty selections the model gave 70%, of which twelve landed: predicted and
  // realised have to be separately legible, because the gap is the finding.
  it('draws once there is enough to read', () => {
    render(<CalibrationChart bets={ledger(MIN_BETS, 0.7, 12)} />)

    const row = within(screen.getByRole('table')).getByRole('row', { name: /60%–80%/ })
    const [band, bets, predicted, actual] = within(row).getAllByRole('cell')

    expect(band).toHaveTextContent('60%–80%')
    expect(bets).toHaveTextContent('12/20')
    expect(predicted).toHaveTextContent('70%')
    // Realised, with the interval that says how little twenty bets settles.
    expect(actual.textContent).toMatch(/^60% ±\d+%$/)
  })

  // The point's position is the claim: predicted on x, realised on y.
  it('places the point where the numbers put it', () => {
    const { container } = render(<CalibrationChart bets={ledger(MIN_BETS, 0.7, 12)} />)
    const dot = container.querySelector('circle')!

    // Predicted 0.7 on x, realised 0.6 on y — below the diagonal, which is what
    // "the model was optimistic here" looks like.
    expect(Number(dot.getAttribute('cx'))).toBeCloseTo(40 + 0.7 * 228, 0)
    expect(Number(dot.getAttribute('cy'))).toBeCloseTo(12 + (1 - 0.6) * 236, 0)
  })

  // The ledger holds bets that were placed, chosen for having an edge — not a
  // sample of every probability the model produced.
  it('says what the sample actually is', () => {
    render(<CalibrationChart bets={ledger(MIN_BETS, 0.7, 12)} />)
    expect(screen.getByText(/chosen for having an edge/i)).toBeInTheDocument()
  })
})
