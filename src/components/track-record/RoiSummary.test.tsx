import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoiSummary from './RoiSummary'
import { emptyStatsFixture, settledStatsFixture } from '../../test/fixtures'

describe('RoiSummary', () => {
  it('shows both strategies rather than one blended figure', () => {
    render(<RoiSummary roi={settledStatsFixture.roi} />)

    expect(screen.getByRole('heading', { name: '1X2 only' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'All markets' })).toBeInTheDocument()
  })

  it('treats roi_pct as an already-scaled percentage', () => {
    render(<RoiSummary roi={settledStatsFixture.roi} />)

    // 1X2: +45.0 over the week, -11.25 over the month.
    expect(screen.getByText('+45.0%')).toBeInTheDocument()
    expect(screen.getByText('-11.3%')).toBeInTheDocument()
  })

  // An unmeasured window rendered as 0.0% would claim a result nobody took.
  it('distinguishes an empty window from break-even', () => {
    render(<RoiSummary roi={emptyStatsFixture.roi} />)

    expect(screen.getAllByText('—')).toHaveLength(4)
    expect(screen.getAllByText(/no bets settled yet/i)).toHaveLength(4)
    expect(screen.queryByText('+0.0%')).not.toBeInTheDocument()
  })

  it('reports the bets behind each figure', () => {
    render(<RoiSummary roi={settledStatsFixture.roi} />)
    expect(screen.getByText(/8 bets · 3 won/)).toBeInTheDocument()
  })
})

describe('RoiSummary sample size', () => {
  // +14.2% off twelve bets used to render exactly like +14.2% off four hundred.
  it('marks a figure that has too few bets behind it', () => {
    render(<RoiSummary roi={settledStatsFixture.roi} />)
    expect(screen.getAllByText('Provisional').length).toBeGreaterThan(0)
  })

  it('drops the marker once the sample is worth reading', () => {
    const bulked = settledStatsFixture.roi.map((entry) => ({
      ...entry,
      week: { ...entry.week, bets: 40, wins: 22 },
      month: { ...entry.month, bets: 120, wins: 61 },
    }))
    render(<RoiSummary roi={bulked} />)

    expect(screen.queryByText('Provisional')).not.toBeInTheDocument()
  })
})
