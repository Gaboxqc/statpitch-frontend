import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LedgerTable from './LedgerTable'
import { settledBetFixture } from '../../test/fixtures'
import type { Basis } from '../../types/api'

const row = (id: number, basis: Basis) => ({ ...settledBetFixture, id, basis })

const renderRows = (bets: ReturnType<typeof row>[]) =>
  render(
    <LedgerTable bets={bets} total={bets.length} offset={0} limit={10} onOffsetChange={vi.fn()} />,
  )

describe('LedgerTable', () => {
  /**
   * The column used to be a two-way test — `'1x2' ? '1X2' : 'Overall'` — so the
   * first settled StatPitch bet would have been filed under a strategy that did
   * not pick it. `basis` is a bare string on the wire, so nothing upstream would
   * have caught it.
   */
  it('names every strategy it can be handed', () => {
    renderRows([row(1, '1x2'), row(2, 'overall'), row(3, 'rule')])

    expect(screen.getByText('1X2')).toBeInTheDocument()
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('Rule')).toBeInTheDocument()
  })

  // A basis the frontend has never heard of is shown as itself rather than
  // silently attributed to one it recognises.
  it('shows an unknown strategy rather than guessing', () => {
    renderRows([{ ...settledBetFixture, id: 4, basis: 'confidence' as Basis }])

    expect(screen.getByText('confidence')).toBeInTheDocument()
    expect(screen.queryByText('Overall')).not.toBeInTheDocument()
  })

  it('says so when a filter matches nothing, rather than rendering an empty table', () => {
    renderRows([])

    expect(screen.getByText(/no settled bets match this filter/i)).toBeInTheDocument()
  })
})
