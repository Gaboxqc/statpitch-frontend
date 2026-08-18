import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import PredictionsSection from './PredictionsSection'
import { renderWithQuery } from '../../test/renderWithQuery'
import { predictionFixture } from '../../test/fixtures'
import * as service from '../../services/predictions'

afterEach(() => vi.restoreAllMocks())

describe('PredictionsSection', () => {
  it('reports the empty state when the API returns no fixtures', async () => {
    vi.spyOn(service, 'getPredictions').mockResolvedValue([])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByText(/no more predictions available/i)).toBeInTheDocument()
  })

  it('lists the fixtures it receives', async () => {
    vi.spyOn(service, 'getPredictions').mockResolvedValue([predictionFixture])
    renderWithQuery(<PredictionsSection />)

    expect(await screen.findByText('Brazil')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /1 predictions/i })).toBeInTheDocument()
  })

  // Regression: the hook returned a string but the component read `error.message`,
  // so a failure rendered a bare "Error:" with nothing after it.
  it('surfaces the error message on failure', async () => {
    vi.spyOn(service, 'getPredictions').mockRejectedValue(new Error('Network down'))
    renderWithQuery(<PredictionsSection />)

    const alert = await screen.findByRole('alert')
    await waitFor(() => expect(alert).toHaveTextContent('Network down'))
  })
})
