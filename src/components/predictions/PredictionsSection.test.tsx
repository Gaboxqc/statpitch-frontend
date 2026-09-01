import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
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
    expect(await screen.findAllByText('Atlético de Madrid')).not.toHaveLength(0)
  })

  // The whole window arrives in one request; the day is chosen locally.
  it('shows only the selected day', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.today, home_team: 'Today FC' },
      { ...fixtureFixture, id: 2, match_date: WINDOW.tomorrow, home_team: 'Tomorrow FC' },
    ])
    renderWithQuery(<PredictionsSection />, { route: '/?day=tomorrow' })

    expect(await screen.findAllByText('Tomorrow')).not.toHaveLength(0)
    expect(screen.queryAllByText('Today')).toHaveLength(0)
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

  it('drops fixtures without a selection when one strategy is asked for', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.today, home_team: 'No Pick FC' },
      { ...pickedFixtureFixture, id: 2, match_date: WINDOW.today, home_team: 'Picked FC' },
    ])
    renderWithQuery(<PredictionsSection />, { route: '/?picks=overall' })

    expect(await screen.findAllByText('Picked')).not.toHaveLength(0)
    expect(screen.queryAllByText('No Pick')).toHaveLength(0)
    // The heading names whose selections these are, not how narrow the filter is.
    expect(screen.getByRole('heading', { name: /1 all markets/i })).toBeInTheDocument()
  })

  /**
   * `value=1` was this filter before there was more than one strategy, and
   * links carrying it are already out there. It still reads, as what it always
   * meant: our best pick across every market.
   */
  it('still honours the address the filter used to have', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, id: 1, match_date: WINDOW.today, home_team: 'No Pick FC' },
      { ...pickedFixtureFixture, id: 2, match_date: WINDOW.today, home_team: 'Picked FC' },
    ])
    renderWithQuery(<PredictionsSection />, { route: '/?value=1' })

    expect(await screen.findAllByText('Picked')).not.toHaveLength(0)
    expect(screen.queryAllByText('No Pick')).toHaveLength(0)
  })

  // The payload names its own competition in every shape, so nothing here
  // depends on a local table being up to date with the API.
  it('heads each league with the name the payload gives it', async () => {
    mockWindow()
    mockFixtures([
      { ...fixtureFixture, match_date: WINDOW.today },
      { ...pickedFixtureFixture, match_date: WINDOW.today },
    ])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByRole('heading', { name: 'LALIGA' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Premier League' })).toBeInTheDocument()
  })

  // Ranking across leagues is the whole question a ranked sort asks, so the
  // headings that would break it up are not drawn.
  it('does not group when the list is ranked rather than ordered by kick-off', async () => {
    mockWindow()
    mockFixtures([{ ...fixtureFixture, match_date: WINDOW.today }])
    renderWithQuery(<PredictionsSection />, { route: '/?sort=edge' })

    expect(await screen.findAllByText('Atlético de Madrid')).not.toHaveLength(0)
    expect(screen.queryByRole('heading', { name: 'LALIGA' })).not.toBeInTheDocument()
  })

  /**
   * A server failure and a day with no matches are opposite claims, and only one
   * of them is true. Rendering a 500 as "nothing scheduled" tells the reader the
   * fixtures do not exist when in fact nobody could ask.
   */
  it('does not pass a server failure off as an empty day', async () => {
    mockWindow()
    vi.spyOn(service, 'getFixtures').mockRejectedValue(
      new AxiosError('Request failed', '500', {} as InternalAxiosRequestConfig, {}, {
        status: 500,
        statusText: '',
        data: 'Internal Server Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse),
    )
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(/nothing scheduled/i)).not.toBeInTheDocument()
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
