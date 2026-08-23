import { useState } from 'react'
import { Link } from 'react-router'
import QueryError from '../../components/ui/QueryError'
import TierBadge from '../../components/admin/TierBadge'
import { useAdminAccounts, useCreateAccount } from '../../hooks/useAdminAccounts'
import { useAdminLogout, useAdminSession } from '../../hooks/useAdminSession'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { describeError } from '../../services/api'
import { formatLongDate, formatRelativeTime } from '../../utils/datetime'
import type { AdminAccountCreated } from '../../types/admin'

const PAGE_SIZE = 25

const FIELD = 'rounded-md border border-line-strong bg-secondary py-1 px-2 text-xs text-ink'

/**
 * The one and only sight of a password.
 *
 * Same treatment as an issued API key: it is not stored anywhere in the clear,
 * so it cannot be shown again, and it stays on screen until dismissed rather
 * than vanishing on the next render.
 */
function TemporaryPassword({
  created,
  onDismiss,
}: {
  created: AdminAccountCreated
  onDismiss: () => void
}) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      role={'status'}
      className={'flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4'}
    >
      <p className={'text-sm font-medium text-ink'}>Send this password to {created.email}</p>
      <p className={'text-xs text-ink-muted'}>
        It is not stored anywhere and cannot be shown again. If it is lost, the account holder
        changes it from their own account page.
      </p>
      <code className={'numeric break-all rounded-md border border-line bg-secondary p-2 text-xs'}>
        {created.temporary_password}
      </code>
      <div className={'flex items-center gap-3'}>
        <button
          type={'button'}
          onClick={() => {
            void navigator.clipboard?.writeText(created.temporary_password).then(() => {
              setCopied(true)
            })
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
          I have sent it
        </button>
      </div>
    </div>
  )
}

function NewAccount() {
  const create = useCreateAccount()
  const [email, setEmail] = useState('')
  const [created, setCreated] = useState<AdminAccountCreated | null>(null)

  return (
    <div className={'flex flex-col gap-4 rounded-lg border border-line bg-card p-6'}>
      <div className={'flex flex-col gap-1'}>
        <h2 className={'text-sm font-medium text-ink'}>New account</h2>
        <p className={'text-xs text-ink-subtle'}>
          Created on the free tier with a password generated here. Grant a tier afterwards from the
          account itself, where the reason is recorded.
        </p>
      </div>

      {created && <TemporaryPassword created={created} onDismiss={() => setCreated(null)} />}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate(email.trim(), {
            onSuccess: (account) => {
              setCreated(account)
              setEmail('')
            },
          })
        }}
        className={'flex flex-wrap items-end gap-2'}
      >
        <div className={'flex min-w-56 flex-1 flex-col gap-1'}>
          <label htmlFor={'new-account-email'} className={'eyebrow text-ink-subtle'}>
            Email
          </label>
          <input
            id={'new-account-email'}
            type={'email'}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            minLength={3}
            maxLength={254}
            className={'rounded-md border border-line-strong bg-secondary p-2 text-sm text-ink'}
          />
        </div>
        <button
          type={'submit'}
          disabled={create.isPending}
          className={
            'rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
          }
        >
          {create.isPending ? 'Creating…' : 'Create account'}
        </button>
      </form>

      {create.error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(create.error)}
        </p>
      )}
    </div>
  )
}

function AccountsPage() {
  useDocumentTitle('Accounts · Admin')
  const { admin } = useAdminSession()
  const signOut = useAdminLogout()

  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('')
  const [active, setActive] = useState('')
  const [offset, setOffset] = useState(0)

  const { accounts, total, loading, fetching, error } = useAdminAccounts({
    email: email.trim() || undefined,
    tier: tier || undefined,
    is_active: active === '' ? undefined : active === 'true',
    offset,
    limit: PAGE_SIZE,
  })

  // Any change of filter is a different result set, so the page it was on is
  // meaningless against it.
  const narrow = (apply: () => void) => {
    apply()
    setOffset(0)
  }

  const shown = accounts.length
  const from = shown === 0 ? 0 : offset + 1

  return (
    <div className={'measure flex flex-col gap-8 pt-10 pb-24'}>
      <header className={'flex flex-wrap items-start justify-between gap-4'}>
        <div className={'flex flex-col gap-2'}>
          <h1 className={'text-xl font-semibold text-ink'}>Accounts</h1>
          <p className={'text-sm text-ink-muted'}>
            Every StatPitch customer, what they are entitled to, and why.
          </p>
        </div>
        <div className={'flex shrink-0 items-center gap-3'}>
          <Link to={'/admin/trial-requests'} className={'text-xs text-primary'}>
            Trial requests
          </Link>
          {admin && <p className={'text-xs text-ink-subtle'}>{admin.username}</p>}
          <button
            type={'button'}
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className={
              'rounded-md border border-line-strong py-1.5 px-3 text-xs text-ink-muted hover:text-ink cursor-pointer disabled:cursor-progress'
            }
          >
            Sign out
          </button>
        </div>
      </header>

      <NewAccount />

      <div className={'flex flex-col gap-4'}>
        <div className={'flex flex-wrap items-end gap-3'}>
          <label className={'flex flex-col gap-1'}>
            <span className={'eyebrow text-ink-subtle'}>Email</span>
            <input
              value={email}
              onChange={(event) => narrow(() => setEmail(event.target.value))}
              placeholder={'substring'}
              className={FIELD}
            />
          </label>

          <label className={'flex flex-col gap-1'}>
            <span className={'eyebrow text-ink-subtle'}>Granted tier</span>
            <select
              value={tier}
              onChange={(event) => narrow(() => setTier(event.target.value))}
              className={`${FIELD} cursor-pointer`}
            >
              <option value={''}>Any</option>
              <option value={'free'}>Free</option>
              <option value={'pro'}>Pro</option>
              <option value={'elite'}>Elite</option>
            </select>
          </label>

          <label className={'flex flex-col gap-1'}>
            <span className={'eyebrow text-ink-subtle'}>Status</span>
            <select
              value={active}
              onChange={(event) => narrow(() => setActive(event.target.value))}
              className={`${FIELD} cursor-pointer`}
            >
              <option value={''}>Any</option>
              <option value={'true'}>Active</option>
              <option value={'false'}>Disabled</option>
            </select>
          </label>

          <p className={'ml-auto text-xs text-ink-subtle'}>
            {fetching && !loading ? (
              'Loading…'
            ) : (
              <>
                <span className={'numeric text-ink-muted'}>{total}</span>{' '}
                {total === 1 ? 'account' : 'accounts'}
              </>
            )}
          </p>
        </div>

        {loading && <div className={'h-64 animate-pulse rounded-lg bg-secondary'} />}
        {error !== null && !loading && <QueryError error={error} />}

        {!loading && error === null && shown === 0 && (
          <p className={'text-sm text-ink-muted'}>No account matches these filters.</p>
        )}

        {shown > 0 && (
          <div className={'overflow-x-auto rounded-lg border border-line bg-card'}>
            <table className={'w-full min-w-3xl text-left text-xs'}>
              <thead>
                <tr className={'border-b border-line text-ink-subtle'}>
                  <th className={'eyebrow p-3 font-medium'}>Email</th>
                  <th className={'eyebrow p-3 font-medium'}>Tier</th>
                  <th className={'eyebrow p-3 font-medium'}>Source</th>
                  <th className={'eyebrow p-3 font-medium'}>Sessions</th>
                  <th className={'eyebrow p-3 font-medium'}>Keys</th>
                  <th className={'eyebrow p-3 font-medium'}>Last login</th>
                  <th className={'eyebrow p-3 font-medium'}>Created</th>
                </tr>
              </thead>
              <tbody className={'divide-y divide-line'}>
                {accounts.map((account) => (
                  <tr key={account.id} className={'text-ink-muted hover:bg-secondary'}>
                    <td className={'p-3'}>
                      <Link
                        to={`/admin/accounts/${account.id}`}
                        className={'text-ink hover:text-primary'}
                      >
                        {account.email}
                      </Link>
                      {!account.is_active && (
                        <span className={'ml-2 text-2xs text-negative'}>disabled</span>
                      )}
                    </td>
                    <td className={'p-3'}>
                      <TierBadge account={account} />
                    </td>
                    <td className={'p-3'}>{account.tier_source}</td>
                    <td className={'numeric p-3'}>{account.active_sessions}</td>
                    <td className={'numeric p-3'}>{account.live_api_keys}</td>
                    <td className={'p-3'}>
                      {account.last_login_at === null
                        ? 'never'
                        : formatRelativeTime(account.last_login_at)}
                    </td>
                    <td className={'p-3'}>{formatLongDate(account.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className={'flex items-center justify-between gap-4 text-xs text-ink-subtle'}>
            <p className={'numeric'}>
              {from}–{offset + shown} of {total}
            </p>
            <div className={'flex items-center gap-2'}>
              <button
                type={'button'}
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className={
                  'rounded-md border border-line-strong py-1 px-2 text-ink-muted hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'
                }
              >
                Previous
              </button>
              <button
                type={'button'}
                disabled={offset + shown >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className={
                  'rounded-md border border-line-strong py-1 px-2 text-ink-muted hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsPage
