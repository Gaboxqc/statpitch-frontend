import { useId, useState } from 'react'
import { useChangePassword } from '../../hooks/useAccount'
import { describeError } from '../../services/api'
import { MIN_PASSWORD_LENGTH } from '../../types/account'

const FIELD = 'w-full p-2.5 rounded-md bg-secondary border border-line-strong text-sm'

/**
 * Changing the password also closes every other session and issues this tab a
 * fresh one, which is worth saying before rather than after — somebody signed
 * in on a phone is about to be signed out of it.
 */
function PasswordForm() {
  const change = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const hintId = useId()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (next.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    // A no-op change would be accepted and would still close every other
    // session, which is a surprising amount to happen for nothing.
    if (next === current) {
      setLocalError('That is already your password.')
      return
    }

    change.mutate(
      { current_password: current, new_password: next },
      {
        onSuccess: () => {
          setCurrent('')
          setNext('')
        },
      },
    )
  }

  const error = localError ?? (change.error !== null ? describeError(change.error) : null)

  return (
    <form
      onSubmit={onSubmit}
      className={'flex flex-col gap-4 rounded-lg border border-line bg-card p-6'}
    >
      <p className={'text-xs text-ink-subtle'}>
        Changing this signs you out on every other device. You will stay signed in here.
      </p>

      <div className={'flex flex-col gap-1'}>
        <label htmlFor={'current-password'} className={'eyebrow text-ink-subtle'}>
          Current password
        </label>
        <input
          id={'current-password'}
          type={'password'}
          autoComplete={'current-password'}
          required
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          className={FIELD}
        />
      </div>

      <div className={'flex flex-col gap-1'}>
        <label htmlFor={'new-password'} className={'eyebrow text-ink-subtle'}>
          New password
        </label>
        <input
          id={'new-password'}
          type={'password'}
          autoComplete={'new-password'}
          required
          value={next}
          onChange={(event) => setNext(event.target.value)}
          aria-describedby={hintId}
          className={FIELD}
        />
        <p id={hintId} className={'text-xs text-ink-subtle'}>
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>

      {error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {error}
        </p>
      )}

      {change.isSuccess && error === null && (
        <p role={'status'} className={'text-xs text-primary'}>
          Password changed. Every other session has been signed out.
        </p>
      )}

      <button
        type={'submit'}
        disabled={change.isPending}
        className={
          'w-fit rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
        }
      >
        {change.isPending ? 'Changing…' : 'Change password'}
      </button>
    </form>
  )
}

export default PasswordForm
