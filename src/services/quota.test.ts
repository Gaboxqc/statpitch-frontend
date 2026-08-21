import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosHeaders } from 'axios'
import type { AxiosAdapter, AxiosResponse } from 'axios'
import { api } from './api'
import { clearQuota, getQuota, setQuota, subscribeToQuota } from './quota'

afterEach(() => {
  clearQuota()
  api.defaults.adapter = undefined
})

/** Answers any request with the given headers, as the real transport would. */
function stubAdapter(headers: Record<string, string>) {
  const adapter: AxiosAdapter = (config) =>
    Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: [],
      headers: new AxiosHeaders(headers),
      config,
    } as AxiosResponse)
  api.defaults.adapter = adapter
}

describe('the quota store', () => {
  it('starts unknown, which is not zero', () => {
    expect(getQuota()).toBe(null)
  })

  it('notifies subscribers only when the figure moves', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToQuota(listener)

    setQuota(2)
    setQuota(2)
    setQuota(1)

    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()

    setQuota(0)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  // Signing in or out changes the entitlement, so a stale count would promise
  // three unlocks to somebody who just subscribed.
  it('forgets the count on request', () => {
    setQuota(3)
    clearQuota()
    expect(getQuota()).toBe(null)
  })
})

describe('reading the quota off a response', () => {
  it('records the count from any fixture response', async () => {
    stubAdapter({ 'x-predictions-remaining': '2' })
    await api.get('/fixtures')

    expect(getQuota()).toBe(2)
  })

  /**
   * The call that spends an unlock is not the one the counter is rendered
   * beside, so it has to update the figure too — otherwise the strip keeps
   * claiming the unlock the reader just used.
   */
  it('updates from the call that spends one', async () => {
    stubAdapter({ 'x-predictions-remaining': '2' })
    await api.get('/fixtures')

    stubAdapter({ 'x-predictions-remaining': '1' })
    await api.get('/fixtures/3')

    expect(getQuota()).toBe(1)
  })

  it('reads the paid tiers as unlimited rather than as a number', async () => {
    stubAdapter({ 'x-predictions-remaining': 'unlimited' })
    await api.get('/fixtures')

    expect(getQuota()).toBe('unlimited')
  })

  // A header blocked by CORS is indistinguishable from one never sent, and
  // neither means the reader has run out.
  it('leaves the figure alone when no header arrived', async () => {
    setQuota(3)
    stubAdapter({})
    await api.get('/fixtures')

    expect(getQuota()).toBe(3)
  })

  it('does record a genuine zero', async () => {
    stubAdapter({ 'x-predictions-remaining': '0' })
    await api.get('/fixtures')

    expect(getQuota()).toBe(0)
  })
})
