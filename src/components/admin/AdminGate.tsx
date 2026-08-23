import { useState } from 'react'
import { useAdminLogin, useAdminSession } from '../../hooks/useAdminSession'
import { describeError } from '../../services/api'

/**
 * Signing in as the person who runs StatPitch, not as somebody who subscribes
 * to it.
 *
 * This is deliberately a form rather than a redirect to `/login`. That page
 * opens a `statpitch_session` for a customer, and no customer session — Elite
 * included — opens a single route behind this gate. Sending an admin there would
 * hand them a working sign-in that leaves them exactly as locked out as before.
 */
function AdminLogin({ error }: { error: unknown }) {
  const login = useAdminLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const field = 'rounded-md border border-line-strong bg-secondary p-2 text-sm text-ink'

  return (
    <div className={'measure flex flex-col gap-6 pt-10 pb-24'}>
      <header className={'flex flex-col gap-2'}>
        <h1 className={'text-xl font-semibold text-ink'}>Administration</h1>
        <p className={'text-sm text-ink-muted'}>
          Sign in with the portfolio administrator account. A StatPitch subscription does not open
          these pages, whatever tier it is on.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          login.mutate({ username, password })
        }}
        className={'flex max-w-sm flex-col gap-4 rounded-lg border border-line bg-card p-6'}
      >
        <div className={'flex flex-col gap-1'}>
          <label htmlFor={'admin-username'} className={'eyebrow text-ink-subtle'}>
            Username
          </label>
          <input
            id={'admin-username'}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete={'username'}
            required
            maxLength={64}
            className={field}
          />
        </div>

        <div className={'flex flex-col gap-1'}>
          <label htmlFor={'admin-password'} className={'eyebrow text-ink-subtle'}>
            Password
          </label>
          <input
            id={'admin-password'}
            type={'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={'current-password'}
            required
            maxLength={256}
            className={field}
          />
        </div>

        <button
          type={'submit'}
          disabled={login.isPending}
          className={
            'rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
          }
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>

        {login.error !== null && (
          <p role={'alert'} className={'text-xs text-negative'}>
            {describeError(login.error)}
          </p>
        )}

        {/* A failure reaching `/auth/me` at all is a different problem from
            being signed out, and only one of them is fixed by signing in. */}
        {login.error === null && error !== null && error !== undefined && (
          <p role={'alert'} className={'text-xs text-negative'}>
            {describeError(error)}
          </p>
        )}
      </form>
    </div>
  )
}

/**
 * Everything under `/admin` renders inside this. While `/auth/me` is in flight
 * nothing is decided — showing the form first would flash a sign-in at somebody
 * who is already signed in, and showing the panel first would flash account data
 * at somebody who is not.
 */
function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, error } = useAdminSession()

  if (loading)
    return (
      <div className={'measure pt-10 pb-24'}>
        <div className={'h-64 animate-pulse rounded-lg bg-secondary'} />
      </div>
    )

  if (!isAdmin) return <AdminLogin error={error} />

  return <>{children}</>
}

export default AdminGate
