import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MatchDayCard from './MatchDayCard'
import { renderWithQuery } from '../../test/renderWithQuery'
import {
  fixtureFixture,
  freeFixtureFixture,
  pickedFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../../test/fixtures'
import * as service from '../../services/predictions'
import type { Fixture } from '../../types/api'

const WINDOW = { yesterday: '2026-08-17', today: '2026-08-18', tomorrow: '2026-08-19' }

/**
 * The card falls back to deriving a pick from the window list, so both of those
 * calls have to answer even in the tests where the API's own pick is what is
 * being rendered.
 */
const mockWindow = (items: Fixture[] = []) => {
  vi.spyOn(service, 'getWindow').mockResolvedValue(WINDOW)
  vi.spyOn(service, 'getFixtures').mockResolvedValue({ items, total: items.length })
}

afterEach(() => vi.restoreAllMocks())

describe('MatchDayCard', () => {
  // Nothing to feature is a state, not a failure: the card goes away rather
  // than standing there saying it has nothing to say.
  it('disappears when the day has no pick', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(null)
    mockWindow()
    const { container } = renderWithQuery(<MatchDayCard />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  // There is no `/tomorrow/best`, so the pick is derived from the list — and a
  // list of teasers, which is what an anonymous reader gets, yields none.
  it('features the strongest call on the day being viewed', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(null)
    mockWindow([
      { ...freeFixtureFixture, id: 20, match_date: WINDOW.tomorrow, home_win_prob: 0.4 },
      {
        ...freeFixtureFixture,
        id: 21,
        match_date: WINDOW.tomorrow,
        home_team: 'Strongest FC',
        home_win_prob: 0.81,
      },
    ])
    renderWithQuery(<MatchDayCard />, { route: '/?day=tomorrow' })

    expect(await screen.findByRole('heading', { name: /tomorrow's pick/i })).toBeInTheDocument()
    expect(screen.getAllByText('Strongest').length).toBeGreaterThan(0)
  })

  it('takes the day it has nothing for away rather than showing yesterday', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(null)
    mockWindow([teaserFixtureFixture])
    const { container } = renderWithQuery(<MatchDayCard />, { route: '/?day=tomorrow' })

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('renders the fixture without crashing on derived values', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    mockWindow()
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByRole('heading', { name: /match of the day/i })).toBeInTheDocument()
    expect(screen.getAllByText('72.83%').length).toBeGreaterThan(0)
    // Kelly is a 0-1 fraction: scaled before rounding, not after.
    expect(screen.getAllByText('0.49%').length).toBeGreaterThan(0)
  })

  // Regression: EV was formatted as though it were already a percentage, so a
  // +3.20% edge rendered as "+0.03%".
  it('scales EV from the fraction the API sends', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    mockWindow()
    renderWithQuery(<MatchDayCard />)

    expect((await screen.findAllByText('+3.20%')).length).toBeGreaterThan(0)
  })

  it('explains a priced fixture that produced no selection', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(fixtureFixture)
    mockWindow()
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no selection cleared the minimum stake/i)).toBeInTheDocument()
  })

  it('distinguishes an unpriced fixture from one with no edge', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(unpricedFixtureFixture)
    mockWindow()
    renderWithQuery(<MatchDayCard />)

    expect(await screen.findByText(/no odds matched this fixture/i)).toBeInTheDocument()
    // A matchday placeholder must never render as a specific kick-off time.
    expect(screen.getByText(/time TBC/i)).toBeInTheDocument()
  })

  it('exposes the market breakdown as a keyboard-operable disclosure', async () => {
    vi.spyOn(service, 'getBestToday').mockResolvedValue(pickedFixtureFixture)
    mockWindow()
    renderWithQuery(<MatchDayCard />)

    const toggle = await screen.findByRole('button', { name: /market breakdown/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
