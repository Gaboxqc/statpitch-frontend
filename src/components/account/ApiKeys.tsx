import { useState } from 'react'
import { Link } from 'react-router'
import QueryError from '../ui/QueryError'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../../hooks/useApiKeys'
import { describeError } from '../../services/api'
import { formatLongDate, formatRelativeTime } from '../../utils/datetime'
import type { IssuedApiKey } from '../../types/account'

/**
 * The one and only sight of a secret.
 *
 * Nothing stores the raw key, so this cannot be fetched again — which is the
 * property that makes the stored hash worth anything. It stays on screen until
 * dismissed rather than disappearing on the next render, and says plainly that
 * it will not come back.
 */
function IssuedKey({ issued, onDismiss }: { issued: IssuedApiKey; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      role={'status'}
      className={'flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4'}
    >
      <p className={'text-sm font-medium text-ink'}>Copy this key now</p>
      <p className={'text-xs text-ink-muted'}>
        It is not stored anywhere and cannot be shown again. If you lose it, revoke it and issue
        another.
      </p>
      <code className={'numeric break-all rounded-md border border-line bg-secondary p-2 text-xs'}>
        {issued.key}
      </code>
      <div className={'flex items-center gap-3'}>
        <button
          type={'button'}
          onClick={() => {
            void navigator.clipboard?.writeText(issued.key).then(() => setCopied(true))
          }}
          className={
            'rounded-md border border-line-strong py-1 px-2 text-xs text-ink-muted hover:text-ink cursor-pointer'
          }
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type={'button'}
          onClick={onDismiss}
          className={'text-xs text-ink-subtle cursor-pointer'}
        >
          I have saved it
        </button>
      </div>
    </div>
  )
}

/**
 * Keys an account has issued, and the controls to add and revoke them.
 *
 * Issuing is Elite only, but listing and revoking are not: a subscription that
 * lapses must still let its owner turn off what it left behind, so those stay
 * available at every tier.
 */
function ApiKeys({ canIssue }: { canIssue: boolean }) {
  const { keys, loading, error } = useApiKeys()
  const create = useCreateApiKey()
  const revoke = useRevokeApiKey()
  const [name, setName] = useState('')
  const [issued, setIssued] = useState<IssuedApiKey | null>(null)

  const onCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    create.mutate(name.trim(), {
      onSuccess: (key) => {
        setIssued(key)
        setName('')
      },
    })
  }

  return (
    <div className={'flex flex-col gap-4 rounded-lg border border-line bg-card p-6'}>
      {canIssue ? (
        <p className={'text-xs text-ink-subtle'}>
          Authenticate with <code>Authorization: Bearer sp_live_…</code>. A key carries your own
          tier, so it reads exactly what you can read.
        </p>
      ) : (
        <p className={'text-xs text-ink-subtle'}>
          Issuing keys is part of Elite. <Link to={'/pricing'}>See plans</Link> — any keys you have
          already issued stay listed and revocable here.
        </p>
      )}

      {issued && <IssuedKey issued={issued} onDismiss={() => setIssued(null)} />}

      {canIssue && (
        <form onSubmit={onCreate} className={'flex flex-wrap items-end gap-2'}>
          <div className={'flex flex-col gap-1'}>
            <label htmlFor={'key-name'} className={'eyebrow text-ink-subtle'}>
              Name
            </label>
            <input
              id={'key-name'}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={64}
              placeholder={'Laptop, cron job, …'}
              className={'p-2 rounded-md bg-secondary border border-line-strong text-sm'}
            />
          </div>
          <button
            type={'submit'}
            disabled={create.isPending}
            className={
              'rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
            }
          >
            {create.isPending ? 'Issuing…' : 'Issue key'}
          </button>
        </form>
      )}

      {create.error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(create.error)}
        </p>
      )}

      {loading && <div className={'h-16 animate-pulse rounded-md bg-secondary'} />}
      {error !== null && !loading && <QueryError error={error} />}

      {!loading && error === null && keys.length === 0 && (
        <p className={'text-xs text-ink-subtle'}>No keys issued.</p>
      )}

      {keys.length > 0 && (
        <ul className={'flex flex-col divide-y divide-line'}>
          {keys.map((key) => (
            <li key={key.id} className={'flex flex-wrap items-center justify-between gap-2 py-3'}>
              <div className={'flex min-w-0 flex-col gap-0.5'}>
                <p className={'text-sm text-ink'}>
                  {key.name}
                  {key.revoked && <span className={'text-ink-subtle'}> · revoked</span>}
                </p>
                <p className={'numeric text-xs text-ink-subtle'}>
                  {key.prefix}… · issued {formatLongDate(key.created_at)}
                  {/* Never used and used long ago are different facts, and only
                      one of them is a reason to leave a key alone. */}
                  {key.last_used_at === null
                    ? ' · never used'
                    : ` · last used ${formatRelativeTime(key.last_used_at)}`}
                </p>
              </div>
              {!key.revoked && (
                <button
                  type={'button'}
                  onClick={() => revoke.mutate(key.id)}
                  disabled={revoke.isPending}
                  className={
                    'shrink-0 rounded-md border border-line-strong py-1 px-2 text-xs text-ink-muted hover:text-negative cursor-pointer disabled:cursor-progress'
                  }
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {revoke.error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(revoke.error)}
        </p>
      )}
    </div>
  )
}

export default ApiKeys
