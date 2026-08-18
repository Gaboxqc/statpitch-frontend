import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarketBlock from './MarketBlock'

const base = {
  market: 'Both Teams to Score (Yes)',
  prob: 0.4924885428311951,
  ev: 0.032,
  odds: 1.83,
  kelly: 0.0049,
  isBest: false,
}

describe('MarketBlock', () => {
  it('scales EV from the fraction the API sends', () => {
    render(<MarketBlock {...base} />)
    expect(screen.getByText('+3.20% EV')).toBeInTheDocument()
  })

  // A market can be genuinely +EV and still not worth staking. Calling that
  // "no positive edge" contradicts the number printed next to it.
  it('separates a too-small edge from a negative one', () => {
    render(<MarketBlock {...base} ev={0.0617} kelly={null} />)
    expect(screen.getByText(/edge too small to stake/i)).toBeInTheDocument()
  })

  it('still calls a negative edge what it is', () => {
    render(<MarketBlock {...base} ev={-0.0562} kelly={null} />)
    expect(screen.getByText(/no positive edge/i)).toBeInTheDocument()
  })

  /**
   * The model prices every market whether or not a book did, so an unquoted
   * market keeps its probability instead of disappearing from the list.
   */
  it('keeps an unquoted market, with the model view but no price', () => {
    render(<MarketBlock {...base} ev={null} odds={null} kelly={null} />)

    expect(screen.getByText('Not priced')).toBeInTheDocument()
    expect(screen.getByText(/no price quoted/i)).toBeInTheDocument()
    // The model probability appears in both the summary row and the bar legend.
    expect(screen.getAllByText('49.25%').length).toBeGreaterThan(0)
    expect(screen.queryByText(/^BOOK/)).not.toBeInTheDocument()
    expect(screen.queryByText(/implied/i)).not.toBeInTheDocument()
  })

  it('recommends a stake only when Kelly qualifies', () => {
    render(<MarketBlock {...base} />)
    expect(screen.getByText(/stake 0.49% of bankroll/i)).toBeInTheDocument()
  })
})
