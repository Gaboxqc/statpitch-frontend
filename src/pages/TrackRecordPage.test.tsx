import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import TrackRecordPage from './TrackRecordPage'
import { renderWithQuery } from '../test/renderWithQuery'
import * as accounts from '../services/accounts'
import * as predictions from '../services/predictions'
import { settledStatsFixture } from '../test/fixtures'

function apiError(status: number, detail: string): AxiosError {
  const config = {} as InternalAxiosRequestConfig
  return new AxiosError('failed', String(status), config, {}, {
    status,
    statusText: '',
    data: { detail },
    headers: {},
    config,
  } as AxiosResponse)
}

/** Every route this page reads is Pro, so below Pro they all refuse together. */
function mockPaywalled() {
  vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
  vi.spyOn(predictions, 'getStats').mockRejectedValue(
    apiError(402, 'This is a Pro feature. Upgrade to see it.'),
  )
  vi.spyOn(predictions, 'getLedger').mockRejectedValue(
    apiError(402, 'This is a Pro feature. Upgrade to see it.'),
  )
}

afterEach(() => vi.restoreAllMocks())

describe('TrackRecordPage below Pro', () => {
  it('answers the paywall once rather than section by section', async () => {
    mockPaywalled()
    renderWithQuery(<TrackRecordPage />)

    expect(await screen.findByText(/settled record is part of pro/i)).toBeInTheDocument()
    expect(screen.getAllByText(/part of pro/i)).toHaveLength(1)
  })

  // A paid route refusing is a fact about the plan, not a failure to load, and
  // an alert would tell the reader something has gone wrong when nothing has.
  it('does not report it as an error', async () => {
    mockPaywalled()
    renderWithQuery(<TrackRecordPage />)

    await screen.findByText(/settled record is part of pro/i)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText(/couldn't load/i)).not.toBeInTheDocument()
  })

  it('keeps the page’s own explanation of what the record is', async () => {
    mockPaywalled()
    renderWithQuery(<TrackRecordPage />)

    expect(await screen.findByRole('heading', { name: /track record/i })).toBeInTheDocument()
  })
})

describe('TrackRecordPage on Pro', () => {
  it('still reports a genuine failure as one', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    vi.spyOn(predictions, 'getStats').mockRejectedValue(apiError(502, 'Upstream is unreachable.'))
    vi.spyOn(predictions, 'getLedger').mockResolvedValue({ items: [], total: 0 })
    renderWithQuery(<TrackRecordPage />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(/part of pro/i)).not.toBeInTheDocument()
  })

  it('shows the record when the API hands it over', async () => {
    vi.spyOn(accounts, 'getMe').mockResolvedValue(null)
    vi.spyOn(predictions, 'getStats').mockResolvedValue(settledStatsFixture)
    vi.spyOn(predictions, 'getLedger').mockResolvedValue({ items: [], total: 0 })
    renderWithQuery(<TrackRecordPage />)

    expect(await screen.findByText(/return on investment/i)).toBeVisible()
    expect(screen.queryByText(/part of pro/i)).not.toBeInTheDocument()
  })
})
