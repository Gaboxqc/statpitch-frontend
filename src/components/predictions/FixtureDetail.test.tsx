import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import FixtureDetail from './FixtureDetail'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as service from '../../services/predictions'
import {
  competitionsFixture,
  fixtureFixture,
  settledFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../../test/fixtures'
import type { Fixture } from '../../types/api'

const renderDetail = (fixture: Fixture) =>
  renderWithQuery(<FixtureDetail fixture={fixture} isOpened={true} />)

beforeEach(() => vi.spyOn(service, 'getCompetitions').mockResolvedValue(competitionsFixture))
afterEach(() => vi.restoreAllMocks())

describe('FixtureDetail', () => {
  // A ranked list flattened the distribution; the grid keeps both axes, so a
  // 2-0 is findable by its own coordinates rather than by its rank.
  it('places each scoreline at its own coordinates', () => {
    renderDetail(fixtureFixture)

    const grid = screen.getByRole('table', { name: /probability of each scoreline/i })
    // Two goals for the home side is a row; none for the away side is a column.
    const twoScored = within(grid).getByRole('row', { name: /^2 / })
    expect(within(twoScored).getByTitle('2–0: 12.1%')).toHaveTextContent('12.1%')
  })

  // The model publishes a top-N, so most of the grid has no figure at all —
  // and an empty cell is a scoreline outside that set, not an impossible one.
  it('leaves scorelines the model did not publish blank', () => {
    renderDetail(fixtureFixture)

    expect(screen.getByText(/not one with no chance/i)).toBeInTheDocument()
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

  /**
   * A prediction from a pooled prior is a much weaker claim than the same
   * number from a measured rating. This panel used to say so in a sentence of
   * its own, directly above the API saying it better — naming the club. The
   * evidence stayed; the duplicate prose did not.
   */
  it('flags a fixture that fell back to a prior Elo', () => {
    renderDetail(unpricedFixtureFixture)

    expect(screen.getByText(/pooled prior/i)).toBeInTheDocument()
    expect(screen.getByText(/elo-poisson fallback/i)).toBeInTheDocument()
    expect(screen.getByText(/had no measured Elo rating/i)).toBeInTheDocument()
  })

  it('says it once rather than twice', () => {
    renderDetail(unpricedFixtureFixture)

    expect(screen.queryByText(/fell back to a prior/i)).not.toBeInTheDocument()
  })

  it('settles the published pick against the final score', () => {
    renderDetail(settledFixtureFixture)

    // The club type comes off the name; the full name stays in the title.
    expect(screen.getByText(/arsenal 3–1 everton/i)).toBeInTheDocument()
    // btts_yes on a 3-1 is a winner.
    expect(screen.getByText('won')).toBeInTheDocument()
  })

  it('says nothing about a result before the match is played', () => {
    renderDetail(fixtureFixture)
    expect(screen.queryByRole('heading', { name: /^result$/i })).not.toBeInTheDocument()
  })
})

describe('the confidence panel', () => {
  /**
   * The reasons are plain sentences the API wrote to be read. Behind a tooltip
   * they are out of reach of touch and keyboard both, and the panel has room.
   */
  it('reads out the reasons rather than hiding them in a title', () => {
    renderDetail(unpricedFixtureFixture)

    for (const reason of unpricedFixtureFixture.confidence_reasons) {
      expect(screen.getByText(reason)).toBeInTheDocument()
    }
  })

  it('names the band alongside them', () => {
    renderDetail(unpricedFixtureFixture)

    const panel = screen.getByRole('heading', { name: /^confidence$/i }).parentElement
    expect(within(panel as HTMLElement).getByText('Low')).toBeInTheDocument()
  })

  // The band is part of what a subscription buys, so it is absent rather than
  // guessed at when the payload does not carry it.
  it('is absent from a withheld payload', () => {
    renderDetail(teaserFixtureFixture)

    expect(screen.queryByRole('heading', { name: /^confidence$/i })).not.toBeInTheDocument()
  })
})
