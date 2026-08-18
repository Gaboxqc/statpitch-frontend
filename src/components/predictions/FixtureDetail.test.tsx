import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import FixtureDetail from './FixtureDetail'
import { buildPredictionView } from '../../utils/predictionView'
import { fixtureFixture, settledFixtureFixture, unpricedFixtureFixture } from '../../test/fixtures'
import type { Fixture } from '../../types/api'

const renderDetail = (fixture: Fixture) => {
  const { markets, bestBet } = buildPredictionView(fixture)
  return render(
    <FixtureDetail fixture={fixture} markets={markets} bestBet={bestBet} isOpened={true} />,
  )
}

describe('FixtureDetail', () => {
  it('ranks the scoreline distribution by probability', () => {
    renderDetail(fixtureFixture)

    const scores = screen.getByRole('heading', { name: /likely scorelines/i }).parentElement!
    const rows = within(scores).getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('2–0')
    expect(rows[0]).toHaveTextContent('12.1%')
  })

  it('shows the model attribution for both sides', () => {
    renderDetail(fixtureFixture)

    expect(screen.getByRole('heading', { name: /what drove this prediction/i })).toBeInTheDocument()
    // Named, not left as the raw snake_case feature key.
    expect(screen.getAllByText('Elo difference').length).toBe(2)
    expect(screen.getByText('Home rest days')).toBeInTheDocument()
    expect(screen.getByText('Everything else')).toBeInTheDocument()
  })

  it('reports the Elo gap and humanises the stage', () => {
    renderDetail(fixtureFixture)

    expect(screen.getByText(/1828/)).toBeInTheDocument()
    expect(screen.getByText(/\+259 home/)).toBeInTheDocument()
    expect(screen.getByText('Matchday 1 · Round robin')).toBeInTheDocument()
  })

  // A prediction from a pooled prior is a much weaker claim than the same
  // number from a measured rating, and nothing else on the card says so.
  it('flags a fixture that fell back to a prior Elo', () => {
    renderDetail(unpricedFixtureFixture)

    expect(screen.getByText(/fell back to a prior/i)).toBeInTheDocument()
    expect(screen.getByText(/pooled prior/i)).toBeInTheDocument()
    expect(screen.getByText(/elo-poisson fallback/i)).toBeInTheDocument()
  })

  it('settles the published pick against the final score', () => {
    renderDetail(settledFixtureFixture)

    expect(screen.getByText(/arsenal fc 3–1 everton fc/i)).toBeInTheDocument()
    // btts_yes on a 3-1 is a winner.
    expect(screen.getByText('won')).toBeInTheDocument()
  })

  it('says nothing about a result before the match is played', () => {
    renderDetail(fixtureFixture)
    expect(screen.queryByRole('heading', { name: /^result$/i })).not.toBeInTheDocument()
  })
})
