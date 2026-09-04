import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import AdminAccountPage from './AccountPage'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as admin from '../../services/admin'
import type { AdminAccount } from '../../types/admin'

const ACCOUNT: AdminAccount = {
  id: 7,
  email: 'reader@example.com',
  is_active: true,
  created_at: '2026-08-01T10:00:00',
  last_login_at: '2026-09-01T10:00:00',
  email_verified: false,
  tier: 'pro',
  effective_tier: 'pro',
  tier_expires_at: null,
  tier_source: 'manual',
  tier_updated_at: null,
  tier_updated_by: 'gabox',
  trial_used: false,
  trial_used_at: null,
  active_sessions: 2,
  live_api_keys: 0,
}

const user = userEvent.setup({ delay: null })

/** The page fans out into five panels; each has its own request. */
function serve(account: AdminAccount = ACCOUNT) {
  vi.spyOn(admin, 'getAccount').mockResolvedValue(account)
  vi.spyOn(admin, 'listGrants').mockResolvedValue([])
  vi.spyOn(admin, 'listSessions').mockResolvedValue([])
  vi.spyOn(admin, 'listAccountKeys').mockResolvedValue([])
}

/**
 * The page reads its id from the route, so it needs a real match rather than a
 * bare render — `useParams` returns nothing without one, and the page then
 * correctly refuses to ask for account `NaN`.
 */
const show = () =>
  renderWithQuery(
    <Routes>
      <Route path={'/admin/accounts/:id'} element={<AdminAccountPage />} />
    </Routes>,
    { route: '/admin/accounts/7' },
  )

afterEach(() => vi.restoreAllMocks())

describe('the tier grant', () => {
  /**
   * The API rejects a blank reason with a 422, but that is not why the form
   * insists: a grant nobody explained is indistinguishable later from a
   * mistake, and this is the only record anyone will have of why it happened.
   */
  it('will not submit without a reason', async () => {
    serve()
    const grant = vi.spyOn(admin, 'grantTier').mockResolvedValue(ACCOUNT)
    show()

    const button = await screen.findByRole('button', { name: /^grant$/i })
    expect(button).toBeDisabled()
    expect(screen.getByText(/a reason of at least 3 characters is required/i)).toBeInTheDocument()

    await user.click(button)
    expect(grant).not.toHaveBeenCalled()
  })

  // A tier change is not a thing to do by a stray click, so it is confirmed by
  // name before it is sent.
  it('confirms against the account before granting', async () => {
    serve()
    const grant = vi.spyOn(admin, 'grantTier').mockResolvedValue(ACCOUNT)
    show()

    await user.type(await screen.findByLabelText(/reason/i), 'Paid by transfer')
    await user.click(screen.getByRole('button', { name: /^grant$/i }))

    // Still nothing sent — the button only armed the confirmation, and the
    // confirmation names both the account and the tier it is moving to. (The
    // email is also the page heading, so this keys on the prompt's wording.)
    expect(grant).not.toHaveBeenCalled()
    expect(screen.getByText(/^Move/)).toHaveTextContent('Move reader@example.com to Pro?')

    await user.click(screen.getByRole('button', { name: /yes, grant it/i }))
    expect(grant).toHaveBeenCalledWith(7, expect.objectContaining({ reason: 'Paid by transfer' }))
  })

  // Null means perpetual, which is not the same as an unset field being sent
  // as an invalid date.
  it('sends no expiry as null rather than an empty string', async () => {
    serve()
    const grant = vi.spyOn(admin, 'grantTier').mockResolvedValue(ACCOUNT)
    show()

    await user.type(await screen.findByLabelText(/reason/i), 'Perpetual comp')
    await user.click(screen.getByRole('button', { name: /^grant$/i }))
    await user.click(screen.getByRole('button', { name: /yes, grant it/i }))

    expect(grant).toHaveBeenCalledWith(7, expect.objectContaining({ expires_at: null }))
  })
})

describe('the danger zone', () => {
  /**
   * Deleting is irreversible and the ledger it leaves behind is not undone with
   * it. Nothing should be one click away from that.
   */
  it('keeps delete behind the account address, typed out', async () => {
    serve()
    const remove = vi.spyOn(admin, 'deleteAccount').mockResolvedValue(undefined)
    show()

    await user.click(await screen.findByRole('button', { name: /delete this account/i }))

    const confirm = screen.getByRole('button', { name: /delete permanently/i })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByLabelText(/confirm the account email/i), 'reader@example.co')
    expect(confirm).toBeDisabled()

    await user.type(screen.getByLabelText(/confirm the account email/i), 'm')
    expect(confirm).toBeEnabled()

    await user.click(confirm)
    expect(remove).toHaveBeenCalledWith(7)
  })

  // Reversible and irreversible should not read alike, so the reversible one is
  // offered first and plainly.
  it('offers deactivation as the reversible option', async () => {
    serve()
    const setActive = vi.spyOn(admin, 'setAccountActive').mockResolvedValue(ACCOUNT)
    show()

    await user.click(await screen.findByRole('button', { name: /deactivate account/i }))
    expect(setActive).toHaveBeenCalledWith(7, false)
  })

  it('offers to bring a disabled account back', async () => {
    serve({ ...ACCOUNT, is_active: false })
    show()

    expect(await screen.findByRole('button', { name: /reactivate account/i })).toBeInTheDocument()
  })
})

describe('the account header', () => {
  // `tier` and `effective_tier` diverge for exactly one reason — the grant ran
  // out — and that is the fact this page exists to show.
  it('says when a granted tier has lapsed', async () => {
    serve({
      ...ACCOUNT,
      tier: 'pro',
      effective_tier: 'free',
      tier_expires_at: '2026-08-20T00:00:00',
    })
    show()

    expect(await screen.findByText(/pro lapsed/i)).toBeInTheDocument()
  })

  it('offers the trial reset only once a trial has been used', async () => {
    serve()
    show()

    await screen.findByRole('heading', { name: 'reader@example.com' })
    expect(screen.queryByRole('button', { name: /reset the trial/i })).not.toBeInTheDocument()

    vi.restoreAllMocks()
    serve({ ...ACCOUNT, trial_used: true, trial_used_at: '2026-08-10T00:00:00' })
    show()

    expect(await screen.findAllByRole('button', { name: /reset the trial/i })).not.toHaveLength(0)
  })
})

describe('revoking sessions', () => {
  it('names how many live sessions it is about to end', async () => {
    serve()
    const revoke = vi.spyOn(admin, 'revokeAllSessions').mockResolvedValue(ACCOUNT)
    show()

    await user.click(await screen.findByRole('button', { name: /sign out everywhere/i }))
    expect(screen.getByText(/end 2 live sessions/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /yes, sign them out/i }))
    expect(revoke).toHaveBeenCalledWith(7)
  })

  // Nothing to revoke, nothing to offer.
  it('offers nothing when no session is live', async () => {
    serve({ ...ACCOUNT, active_sessions: 0 })
    show()

    await screen.findByRole('heading', { name: 'reader@example.com' })
    expect(screen.queryByRole('button', { name: /sign out everywhere/i })).not.toBeInTheDocument()
  })
})

describe('an account that is not there', () => {
  it('says so rather than rendering an empty shell', async () => {
    vi.spyOn(admin, 'getAccount').mockRejectedValue(
      new Error('Request failed with status code 404'),
    )
    vi.spyOn(admin, 'listGrants').mockResolvedValue([])
    vi.spyOn(admin, 'listSessions').mockResolvedValue([])
    vi.spyOn(admin, 'listAccountKeys').mockResolvedValue([])
    show()

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText(/couldn't load this data/i)).toBeInTheDocument()
  })
})
