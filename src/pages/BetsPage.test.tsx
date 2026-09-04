import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import BetsPage from './BetsPage'
import { renderWithQuery } from '../test/renderWithQuery'
import { selectionsFixture } from '../test/fixtures'
import * as service from '../services/predictions'
import type { BetPick, BetsToday } from '../types/api'

const pick: BetPick = {
  ...selectionsFixture[0],
  fixture_id: 'ENG.PL|2026-2027|Arsenal FC|Chelsea FC',
  competition_id: 'ENG.PL',
  competition_name: 'English Premier League',
  competition_short_name: 'Premier League',
  competition_icon_url: null,
  home_team: 'Arsenal FC',
  away_team: 'Chelsea FC',
  home_crest_url: null,
  away_crest_url: null,
  match_date: '2026-09-01',
  commence_time: '2026-09-01T14:00:00',
}

const day = (over: Partial<BetsToday> = {}): BetsToday => ({
  match_date: '2026-09-01',
  bets: [],
  count: 0,
  caveat: null,
  confidence_caveat: null,
  disclaimer: 'Advisory only. No bookmaker integration, no wagers, no funds held.',
  reason: 'No fixture today carries a published price.',
  empty_because: { cause: 'fixtures_today_carry_no_price' },
  binding_constraint: null,
  assessed: 0,
  qualified_by_rule: 0,
  total_exposure: 0,
  selection_rule: null,
  selection_rule_status: 'experimental',
  config_status: 'experimental',
  by_basis: null,
  model_version: 'goals-20260813',
  config_version: null,
  generated_at: null,
  synced_at: null,
  ...over,
})

const serve = (bets: BetsToday) => vi.spyOn(service, 'getBetsToday').mockResolvedValue(bets)

const withPicks = () =>
  day({
    bets: [pick],
    count: 1,
    caveat: 'The rule carries five seasons of measured value; this book panel does not.',
    assessed: 91,
    qualified_by_rule: 4,
    total_exposure: 0.00125,
  })

afterEach(() => vi.restoreAllMocks())

describe('BetsPage', () => {
  /**
   * The common case by a wide margin, and the one most likely to be read as a
   * failure. An empty day is a 200 with a reason, never a 404.
   */
  it('explains an empty day instead of reporting an error', async () => {
    serve(day())
    renderWithQuery(<BetsPage />)

    expect(
      await screen.findByText(/no fixture today carries a published price/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // `fixtures_today_carry_no_price` means there are matches today and the feed
  // has not published their block — worth saying in words.
  it('reads the structured cause back in plain language', async () => {
    serve(day())
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText(/fixtures today carry no price/i)).toBeInTheDocument()
  })

  /**
   * The whole point of the page. A pick without the caveat claims more than the
   * evidence supports, so it renders above the picks where it cannot be scrolled
   * past on the way to the numbers.
   */
  it('shows the caveat with the picks', async () => {
    const bets = withPicks()
    serve(bets)
    const { container } = renderWithQuery(<BetsPage />)

    const caveat = await screen.findByText(/five seasons of measured value/i)
    expect(caveat).toBeInTheDocument()

    const body = container.textContent ?? ''
    expect(body.indexOf('five seasons')).toBeLessThan(body.indexOf('Value pick'))
  })

  // The guarantee is the backend's, not the type's. A missing caveat must not
  // take the page down with it.
  it('still renders a pick whose caveat went missing', async () => {
    serve({ ...withPicks(), caveat: null })
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText('Value pick')).toBeInTheDocument()
  })

  /**
   * Only `odds` is takeable; the other three are the evidence for whether taking
   * it is worth anything. Collapsing them would throw that away.
   */
  it('keeps the four prices apart', async () => {
    serve(withPicks())
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText('1.75')).toBeInTheDocument()
    expect(screen.getByText('1.68')).toBeInTheDocument()
    expect(screen.getByText('1.65')).toBeInTheDocument()
    expect(screen.getByText('1.73')).toBeInTheDocument()
  })

  // Three from ninety-one assessed is the honest frame for three picks.
  it('puts the picks in the context of everything assessed', async () => {
    serve(withPicks())
    const { container } = renderWithQuery(<BetsPage />)

    await screen.findByText('Value pick')
    expect(container.textContent).toMatch(/91/)
    expect(container.textContent).toMatch(/Cleared the rule/)
  })

  /**
   * These come from a price disagreement, not from the model out-predicting the
   * market — `p_used` equals `q_fair` on every row.
   */
  it('never calls a pick a model pick', async () => {
    serve(withPicks())
    const { container } = renderWithQuery(<BetsPage />)

    await screen.findByText('Value pick')
    const body = container.textContent ?? ''
    expect(body).not.toMatch(/model pick/i)
    expect(body).not.toMatch(/ai pick/i)
    expect(body).not.toMatch(/model call/i)
  })

  /**
   * Once a reader knows today produced nothing, the next question is what
   * stopped it — and the API answers that in a field of its own.
   */
  it('names the limit that stopped more picks being taken', async () => {
    serve(day({ binding_constraint: 'daily_exposure_cap' }))
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText(/limited by daily exposure cap/i)).toBeInTheDocument()
  })

  /**
   * `selection_rule` is an untyped object on the wire. Each field is read for
   * what it is rather than trusted to be there, so a partial or oddly-shaped
   * one degrades to less detail instead of a crash.
   */
  it('reports the rule parameters it can actually read', async () => {
    serve({
      ...withPicks(),
      selection_rule: { reference: 'odds_pinnacle', threshold: 0.004, max_per_day: 3 },
    })
    const { container } = renderWithQuery(<BetsPage />)

    await screen.findByText('Value pick')
    expect(container.textContent).toMatch(/benchmark odds_pinnacle/)
    expect(container.textContent).toMatch(/at most 3 a day/)
  })

  it('skips rule parameters that are not the shape they should be', async () => {
    serve({
      ...withPicks(),
      selection_rule: { reference: { nested: true }, threshold: null, max_per_day: 3 },
    })
    const { container } = renderWithQuery(<BetsPage />)

    await screen.findByText('Value pick')
    // "Benchmark" is also a price column and appears in the page's own copy, so
    // this keys on the provenance line's phrasing.
    expect(container.textContent).not.toMatch(/benchmark \w/)
    expect(container.textContent).toMatch(/at most 3 a day/)
  })

  it('renders the advisory notice', async () => {
    serve(withPicks())
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText(/no wagers, no funds held/i)).toBeInTheDocument()
  })

  // Below Pro the route answers 402, which is a state the page renders rather
  // than a failure it reports.
  it('offers the upgrade below Pro instead of an error', async () => {
    vi.spyOn(service, 'getBetsToday').mockRejectedValue(
      new AxiosError('Payment required', '402', {} as InternalAxiosRequestConfig, {}, {
        status: 402,
        statusText: '',
        data: {},
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse),
    )
    renderWithQuery(<BetsPage />)

    expect(await screen.findByText(/part of Pro/i)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
