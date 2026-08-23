import { describe, expect, it } from 'vitest'
import { describeTrial } from './trialState'
import type { Account, TrialRequest } from '../types/account'

const FREE: Account = {
  email: 'reader@example.com',
  tier: 'free',
  tier_expires_at: null,
  trial_used: false,
  email_verified: false,
  last_login_at: null,
  csrf_token: 'issued-token',
}

const REQUEST: TrialRequest = {
  id: 1,
  status: 'pending',
  message: null,
  requested_at: '2026-08-20T09:00:00',
  decided_at: null,
  decision_reason: null,
}

describe('describeTrial', () => {
  it('offers the request to a free account that has never asked', () => {
    expect(describeTrial(FREE, null)).toMatchObject({
      kind: 'request',
      label: 'Request 14-day trial',
    })
  })

  // Asking grants nothing, so the copy must never say "start".
  it('never promises the trial in the label', () => {
    const state = describeTrial(FREE, null)
    expect(state.kind === 'request' && state.label.toLowerCase()).not.toContain('start')
  })

  it('reports a request already under review instead of offering another', () => {
    expect(describeTrial(FREE, REQUEST)).toMatchObject({ kind: 'pending' })
  })

  it('lets a declined account ask again, and says why it was refused', () => {
    const state = describeTrial(FREE, {
      ...REQUEST,
      status: 'declined',
      decision_reason: 'Not this season.',
    })

    expect(state).toMatchObject({ kind: 'declined', label: 'Request again' })
    expect(state.kind === 'declined' && state.detail).toBe('Not this season.')
  })

  // A lapsed trial reads `free` again, and the offer does not come back with it.
  it('withdraws the offer once a trial has been granted', () => {
    expect(describeTrial({ ...FREE, trial_used: true }, null)).toMatchObject({ kind: 'used' })
  })

  /**
   * The order matters: a request outstanding is the answer to "can I ask",
   * whatever else is true of the account.
   */
  it('puts a pending request ahead of a trial already used', () => {
    expect(describeTrial({ ...FREE, trial_used: true }, REQUEST)).toMatchObject({ kind: 'pending' })
  })

  it('offers nothing above the free tier, or to nobody at all', () => {
    expect(describeTrial({ ...FREE, tier: 'pro' }, null)).toEqual({ kind: 'none' })
    expect(describeTrial({ ...FREE, tier: 'elite' }, REQUEST)).toEqual({ kind: 'none' })
    expect(describeTrial(null, null)).toEqual({ kind: 'none' })
  })
})
