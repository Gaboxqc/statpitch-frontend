import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminGate from './AdminGate'
import { renderWithQuery } from '../../test/renderWithQuery'
import * as admin from '../../services/admin'
import type { AdminUser } from '../../types/admin'

const ADMIN: AdminUser = { username: 'gabox', last_login_at: null, csrf_token: 'admin-token' }

const user = userEvent.setup({ delay: null })

afterEach(() => vi.restoreAllMocks())

describe('AdminGate', () => {
  /**
   * The whole point of the gate. `/login` opens a `statpitch_session` for a
   * customer, and no customer session — Elite included — opens a single route
   * behind here. Redirecting there would hand an admin a working sign-in that
   * leaves them exactly as locked out as before.
   */
  it('asks for the portfolio account in place, never redirecting to the customer login', async () => {
    vi.spyOn(admin, 'getAdmin').mockResolvedValue(null)
    renderWithQuery(
      <AdminGate>
        <p>behind the gate</p>
      </AdminGate>,
    )

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.queryByText('behind the gate')).not.toBeInTheDocument()
    expect(
      screen.getByText(/a statpitch subscription does not open these pages/i),
    ).toBeInTheDocument()
  })

  /**
   * Showing the form first would flash a sign-in at somebody already signed in;
   * showing the panel first would flash account data at somebody who is not.
   */
  it('commits to neither state until the session settles', () => {
    vi.spyOn(admin, 'getAdmin').mockReturnValue(new Promise(() => null))
    renderWithQuery(
      <AdminGate>
        <p>behind the gate</p>
      </AdminGate>,
    )

    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByText('behind the gate')).not.toBeInTheDocument()
  })

  it('opens the panel once a portfolio session answers', async () => {
    vi.spyOn(admin, 'getAdmin').mockResolvedValue(ADMIN)
    renderWithQuery(
      <AdminGate>
        <p>behind the gate</p>
      </AdminGate>,
    )

    expect(await screen.findByText('behind the gate')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('signs in with what was typed', async () => {
    vi.spyOn(admin, 'getAdmin').mockResolvedValue(null)
    const login = vi.spyOn(admin, 'adminLogin').mockResolvedValue(ADMIN)
    renderWithQuery(
      <AdminGate>
        <p>behind the gate</p>
      </AdminGate>,
    )

    await user.type(await screen.findByLabelText(/username/i), 'gabox')
    await user.type(screen.getByLabelText(/password/i), 'not-a-real-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(login).toHaveBeenCalledWith({ username: 'gabox', password: 'not-a-real-password' })
  })
})
