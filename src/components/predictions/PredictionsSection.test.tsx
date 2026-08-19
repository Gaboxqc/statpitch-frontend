import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import PredictionsSection from './PredictionsSection'
import { renderWithQuery } from '../../test/renderWithQuery'
import { fixtureFixture, pickedFixtureFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'
import type { Fixture } from '../../types/api'

const WINDOW = { yesterday: '2026-08-17', today: '2026-08-18', tomorrow: '2026-08-19' }

const mockWindow = () => vi.spyOn(service, 'getWindow').mockResolvedValue(WINDOW)
const mockFixtures = (items: Fixture[]) =>
  vi.spyOn(service, 'getFixtures').mockResolvedValue({ items, total: items.length })

afterEach(() => vi.restoreAllMocks())

describe('PredictionsSection', () => {
  // An empty day is a 200 with [], not a 404, so this is the ordinary path.
  it('reports the empty state when the API returns no fixtures', async () => {
    mockWindow()
    mockFixtures([])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByText(/nothing scheduled today/i)).toBeInTheDocument()
  })

  it('lists the fixtures it receives', async () => {
    mockWindow()
    mockFixtures([{ ...fixtureFixture, match_date: WINDOW.today }])
    renderWithQuery(<PredictionsSection />)

    // The team name also appears inside the (collapsed) detail panel.
    expect(await screen.findAllByText('Club Atlético de Madrid')).not.toHaveLength(0)
  })

  // The whole window arrives in one request; the day is chosen locally.
  it('shows only the selected day', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.today, home_team: 'Today FC' },
      { ...fixtureFixture, id: 2, match_date: WINDOW.tomorrow, home_team: 'Tomorrow FC' },
    ])
    renderWithQuery(<PredictionsSection />, { route: '/?day=tomorrow' })

    expect(await screen.findAllByText('Tomorrow FC')).not.toHaveLength(0)
    expect(screen.queryAllByText('Today FC')).toHaveLength(0)
  })

  // An empty day and an over-narrow filter are different problems.
  it('distinguishes an over-narrow filter from an empty day', async () => {
    mockWindow()
    mockFixtures([{ ...fixtureFixture, match_date: WINDOW.today }])
    renderWithQuery(<PredictionsSection />, { route: '/?confidence=0.8' })

    expect(await screen.findByText(/no fixtures match these filters/i)).toBeInTheDocument()
  })

  /**
   * Regression, caught against the live API: the window held fixtures on other
   * days while today held none, and the day was being counted as a filter — so
   * an empty day was blamed on the user's filters.
   */
  it('calls an empty day empty, even when other days have fixtures', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.yesterday },
      { ...fixtureFixture, id: 2, match_date: WINDOW.tomorrow },
    ])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByText(/nothing scheduled today/i)).toBeInTheDocument()
    expect(screen.queryByText(/no fixtures match these filters/i)).not.toBeInTheDocument()
  })

  it('names no model version when there is nothing to name one for', async () => {
    mockWindow()
    mockFixtures([])
    renderWithQuery(<PredictionsSection />)

    await screen.findByText(/nothing scheduled today/i)
    expect(screen.queryByText(/model unknown/i)).not.toBeInTheDocument()
  })

  it('drops fixtures without a selection when value bets are requested', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.today, home_team: 'No Pick FC' },
      { ...pickedFixtureFixture, id: 2, match_date: WINDOW.today, home_team: 'Picked FC' },
    ])
    renderWithQuery(<PredictionsSection />, { route: '/?value=1' })

    expect(await screen.findAllByText('Picked FC')).not.toHaveLength(0)
    expect(screen.queryAllByText('No Pick FC')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: /1 value bets/i })).toBeInTheDocument()
  })

  it('names the competition from the fixture rather than a hardcoded default', async () => {
    mockWindow()
    mockFixtures([{ ...fixtureFixture, match_date: WINDOW.today }])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByText('La Liga')).toBeInTheDocument()
  })

  // Regression: the hook returned a string but the component read `error.message`,
  // so a failure rendered a bare "Error:" with nothing after it.
  it('surfaces the error message on failure', async () => {
    mockWindow()
    vi.spyOn(service, 'getFixtures').mockRejectedValue(new Error('Network down'))
    renderWithQuery(<PredictionsSection />)

    const alert = await screen.findByRole('alert')
    await waitFor(() => expect(alert).toHaveTextContent('Network down'))
  })
})
