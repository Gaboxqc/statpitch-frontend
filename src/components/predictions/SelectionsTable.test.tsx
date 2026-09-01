import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import SelectionsTable from './SelectionsTable'
import { selectionsFixture } from '../../test/fixtures'
import type { Selection } from '../../types/api'

const show = (selections: Selection[] = selectionsFixture) =>
  render(<SelectionsTable selections={selections} />)

const rowFor = (name: string | RegExp) => screen.getByRole('row', { name })

describe('SelectionsTable', () => {
  /**
   * Only `odds` is a price anybody can take. Collapsing the four into one would
   * throw away the reader's only evidence for whether taking it is any good, so
   * every one of them keeps a column.
   */
  it('keeps the four prices apart', () => {
    show()

    const row = rowFor(/home win/i)
    expect(within(row).getByText('1.75')).toBeInTheDocument()
    expect(within(row).getByText('1.68')).toBeInTheDocument()
    expect(within(row).getByText('1.65')).toBeInTheDocument()
    expect(within(row).getByText('1.73')).toBeInTheDocument()
  })

  it('names which of them can actually be taken', () => {
    show()
    expect(screen.getByText(/the only one you could take/i)).toBeInTheDocument()
  })

  // Above zero is advice; zero is an assessment that declined to become advice,
  // and the difference is the whole point of the column.
  it('marks only the staked row as a pick', () => {
    show()

    expect(within(rowFor(/home win/i)).getByText('Value pick')).toBeInTheDocument()
    expect(within(rowFor(/^Draw/i)).queryByText('Value pick')).not.toBeInTheDocument()
    expect(screen.getAllByText('Not staked')).toHaveLength(2)
  })

  it('carries the refusal reason on a row that was not staked', () => {
    show()

    expect(within(rowFor(/^Draw/i)).getByTitle(/no edge to take/i)).toBeInTheDocument()
  })

  // `reasons` is `array | null` on the wire even though the sample shows `[]`.
  it('survives a refusal with no reason attached', () => {
    show([{ ...selectionsFixture[1], reasons: null }])

    expect(screen.getByText('Not staked')).toBeInTheDocument()
  })

  /**
   * `model_edge` is 0.0 on every live row, because selections come from a price
   * disagreement rather than the model out-predicting the market. A column of
   * zeroes would invite exactly the reading that is wrong.
   */
  it('gives model edge no column of zeroes', () => {
    show()
    expect(screen.queryByText(/model edge/i)).not.toBeInTheDocument()
  })

  /**
   * These are price disagreements. "Model pick", "AI pick" and "model call" all
   * claim the model beat the market, which is the one thing this data cannot
   * support — `p_used` equals `q_fair` on every row.
   */
  it('never calls a selection a model pick', () => {
    const { container } = show()
    const text = container.textContent ?? ''

    expect(text).not.toMatch(/model pick/i)
    expect(text).not.toMatch(/ai pick/i)
    expect(text).not.toMatch(/model call/i)
  })

  it('reports how many of the priced outcomes were staked', () => {
    const { container } = show()
    // The figures sit in their own spans, so the sentence only reads as one
    // from the element that holds them.
    expect(container.textContent).toMatch(/1 of 3 priced outcomes staked/)
  })

  /**
   * Prices publish per matchday block, so a fixture days out has none. That is
   * an ordinary state and must not read as an error or as a loading spinner.
   */
  it('explains an unpriced fixture rather than showing an empty table', () => {
    show([])

    expect(screen.getByText(/no prices published for this fixture yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  // The rule can be promoted to `fitted` later, and a pick has to keep reading
  // as whatever it was recommended under.
  it('carries the provenance the row was recommended under', () => {
    show()

    expect(screen.getByText(/experimental/)).toBeInTheDocument()
    expect(screen.getByText(/odds_pinnacle/)).toBeInTheDocument()
  })
})
