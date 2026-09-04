import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrialRequestsPage from './TrialRequestsPage'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as admin from '../../services/admin'
import type { AdminTrialRequest } from '../../types/admin'

const REQUEST: AdminTrialRequest = {
  id: 3,
  account_id: 7,
  account_email: 'reader@example.com',
  status: 'pending',
  message: 'I want to check the ledger before subscribing.',
  requested_at: '2026-09-01T09:00:00',
  decided_at: null,
  decided_by: null,
  decision_reason: null,
}

const user = userEvent.setup({ delay: null })

const serve = (requests: AdminTrialRequest[] = [REQUEST]) =>
  vi.spyOn(admin, 'listTrialRequests').mockResolvedValue(requests)

afterEach(() => vi.restoreAllMocks())

describe('TrialRequestsPage', () => {
  it('shows what the account said when asking', async () => {
    serve()
    renderWithQuery(<TrialRequestsPage />)

    expect(await screen.findByText(/check the ledger before subscribing/i)).toBeInTheDocument()
    expect(screen.getByText('reader@example.com')).toBeInTheDocument()
  })

  /**
   * Fourteen days of Pro needs no explanation to the person receiving it, so
   * approving is one press.
   */
  it('approves without demanding a reason', async () => {
    serve()
    const approve = vi.spyOn(admin, 'approveTrialRequest').mockResolvedValue(REQUEST)
    renderWithQuery(<TrialRequestsPage />)

    await user.click(await screen.findByRole('button', { name: /approve/i }))
    expect(approve).toHaveBeenCalledWith(3)
  })

  /**
   * Declining is the opposite: the reason reaches the account, so there has to
   * be one. A refusal with no explanation is the thing that makes people ask
   * again with no idea what to change.
   */
  it('will not decline without a reason', async () => {
    serve()
    const decline = vi.spyOn(admin, 'declineTrialRequest').mockResolvedValue(REQUEST)
    renderWithQuery(<TrialRequestsPage />)

    await user.click(await screen.findByRole('button', { name: /^decline$/i }))

    const confirm = screen.getByRole('button', { name: /^decline$/i })
    expect(confirm).toBeDisabled()
    await user.click(confirm)
    expect(decline).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/reason/i), 'Ask again once the season is under way.')
    expect(confirm).toBeEnabled()

    await user.click(confirm)
    // The hook takes an object; the service beneath it takes the pair.
    expect(decline).toHaveBeenCalledWith(3, 'Ask again once the season is under way.')
  })

  // A decision already made is a record, not a queue item.
  it('offers no decision on a request already settled', async () => {
    serve([
      {
        ...REQUEST,
        status: 'declined',
        decided_at: '2026-09-02T09:00:00',
        decided_by: 'gabox',
        decision_reason: 'Not this season.',
      },
    ])
    renderWithQuery(<TrialRequestsPage />)

    expect(await screen.findByText('Not this season.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^decline$/i })).not.toBeInTheDocument()
  })

  it('says the queue is empty rather than rendering nothing', async () => {
    serve([])
    renderWithQuery(<TrialRequestsPage />)

    expect(await screen.findByText(/nothing in the queue/i)).toBeInTheDocument()
  })
})
