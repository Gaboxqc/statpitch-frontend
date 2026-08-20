import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import MarketList from './MarketList'
import type { Market } from '../../types/api'

const market = (over: Partial<Market> = {}): Market => ({
  key: 'btts_yes',
  market: 'Both Teams to Score (Yes)',
  prob: 0.4924885428311951,
  ev: 0.032,
  odds: 1.83,
  kelly: 0.0049,
  ...over,
})

const show = (markets: Market[], bestBet: Market['key'] | null = null) =>
  render(<MarketList markets={markets} bestBet={bestBet} isOpened={true} />)

const rowFor = (name: string | RegExp) => screen.getByRole('row', { name })

describe('MarketList', () => {
  it('scales EV from the fraction the API sends', () => {
    show([market()])
    expect(screen.getByText('+3.20%')).toBeInTheDocument()
  })

  // A market can be genuinely +EV and still not worth staking. Calling that
  // "no edge" would contradict the number printed next to it.
  it('separates a too-small edge from a negative one', () => {
    show([market({ ev: 0.0617, kelly: null })])
    expect(screen.getByText('Too small')).toBeInTheDocument()
  })

  it('still calls a negative edge what it is', () => {
    show([market({ ev: -0.0562, kelly: null })])
    expect(screen.getByText('No edge')).toBeInTheDocument()
  })

  /**
   * The model prices every market whether or not a book did, so an unquoted
   * market keeps its probability and its place in the order instead of
   * disappearing from the table.
   */
  it('keeps an unquoted market, with the model view but no price', () => {
    show([market({ ev: null, odds: null, kelly: null })])

    const row = rowFor(/both teams to score/i)
    expect(within(row).getByText('49.25%')).toBeInTheDocument()
    // Book, edge and stake are all unknown rather than zero.
    expect(within(row).getAllByText('—')).toHaveLength(3)
  })

  it('reports the stake a qualifying market justifies', () => {
    show([market()])
    expect(screen.getByText('0.49%')).toBeInTheDocument()
  })

  it('marks the published pick', () => {
    show([market({ key: 'btts_yes' })], 'btts_yes')
    expect(within(rowFor(/both teams to score/i)).getByText('Best bet')).toBeInTheDocument()
  })

  // Comparing markets is the whole task, so every one of them is a row.
  it('lists every market it is given', () => {
    show([
      market({ key: 'home_win', market: 'Home Win' }),
      market({ key: 'draw', market: 'Draw' }),
      market({ key: 'over_2_5', market: 'Over 2.5 Goals' }),
    ])

    // Three markets plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })
})
