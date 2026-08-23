import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import QueryError from '../../components/ui/QueryError'
import TierBadge from '../../components/admin/TierBadge'
import { TIER_LABELS } from '../../constants/tiers'
import {
  useAdminAccount,
  useAdminGrants,
  useAdminKeys,
  useAdminSessions,
  useDeleteAccount,
  useGrantTier,
  useResetTrial,
  useRevokeAccountKey,
  useRevokeAccountSessions,
  useSetAccountActive,
} from '../../hooks/useAdminAccounts'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { describeError } from '../../services/api'
import { formatLongDate, formatRelativeTime } from '../../utils/datetime'
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from '../../types/admin'
import type { AdminAccount } from '../../types/admin'
import type { Tier } from '../../types/account'

const PANEL = 'flex flex-col gap-4 rounded-lg border border-line bg-card p-6'
const FIELD = 'rounded-md border border-line-strong bg-secondary p-2 text-sm text-ink'
const QUIET =
  'rounded-md border border-line-strong py-1.5 px-3 text-xs text-ink-muted hover:text-ink cursor-pointer disabled:cursor-progress disabled:opacity-60'
const DANGER =
  'rounded-md border border-negative/40 bg-negative/10 py-1.5 px-3 text-xs font-semibold text-negative cursor-pointer disabled:cursor-progress disabled:opacity-60'

function Panel({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className={PANEL}>
      <div className={'flex flex-col gap-1'}>
        <h2 className={'text-sm font-medium text-ink'}>{title}</h2>
        {hint && <p className={'text-xs text-ink-subtle'}>{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Error({ error }: { error: unknown }) {
  if (error === null || error === undefined) return null
  return (
    <p role={'alert'} className={'text-xs text-negative'}>
      {describeError(error)}
    </p>
  )
}

/**
 * A tier change, and the reason it happened.
 *
 * The API rejects a blank reason with a 422, but the reason it insists on one is
 * not validation: a grant with no explanation is indistinguishable six months
 * later from a mistake, and this is the only record anyone will have. So the
 * form asks for it in its own words rather than waiting for the server to.
 */
function GrantTier({ account }: { account: AdminAccount }) {
  const grant = useGrantTier(account.id)
  const [tier, setTier] = useState<Tier>(account.effective_tier)
  const [expires, setExpires] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)

  const valid = reason.trim().length >= REASON_MIN_LENGTH

  const submit = () => {
    grant.mutate(
      {
        tier,
        // A blank field means no expiry, which is not the same as an invalid date.
        expires_at: expires === '' ? null : new Date(expires).toISOString(),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setReason('')
          setConfirming(false)
        },
      },
    )
  }

  return (
    <Panel
      title={'Grant a tier'}
      hint={'Takes effect immediately. Leave the expiry empty for a tier that does not lapse.'}
    >
      <div className={'flex flex-wrap gap-3'}>
        <label className={'flex flex-col gap-1'}>
          <span className={'eyebrow text-ink-subtle'}>Tier</span>
          <select
            value={tier}
            onChange={(event) => setTier(event.target.value as Tier)}
            className={`${FIELD} cursor-pointer`}
          >
            <option value={'free'}>Free</option>
            <option value={'pro'}>Pro</option>
            <option value={'elite'}>Elite</option>
          </select>
        </label>

        <label className={'flex flex-col gap-1'}>
          <span className={'eyebrow text-ink-subtle'}>Expires</span>
          <input
            type={'datetime-local'}
            value={expires}
            onChange={(event) => setExpires(event.target.value)}
            className={FIELD}
          />
        </label>

        <label className={'flex min-w-56 flex-1 flex-col gap-1'}>
          <span className={'eyebrow text-ink-subtle'}>Reason</span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            minLength={REASON_MIN_LENGTH}
            maxLength={REASON_MAX_LENGTH}
            placeholder={'Paid by transfer, support goodwill, …'}
            className={FIELD}
          />
        </label>
      </div>

      {confirming ? (
        <div className={'flex flex-wrap items-center gap-3'}>
          <p className={'text-xs text-ink-muted'}>
            Move <span className={'text-ink'}>{account.email}</span> to{' '}
            <span className={'text-ink'}>{TIER_LABELS[tier]}</span>?
          </p>
          <button type={'button'} onClick={submit} disabled={grant.isPending} className={DANGER}>
            {grant.isPending ? 'Granting…' : 'Yes, grant it'}
          </button>
          <button
            type={'button'}
            onClick={() => setConfirming(false)}
            className={'text-xs text-ink-muted cursor-pointer'}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className={'flex items-center gap-3'}>
          <button
            type={'button'}
            onClick={() => setConfirming(true)}
            disabled={!valid}
            className={
              'rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
            }
          >
            Grant
          </button>
          {!valid && (
            <p className={'text-xs text-ink-subtle'}>
              A reason of at least {REASON_MIN_LENGTH} characters is required.
            </p>
          )}
        </div>
      )}

      <Error error={grant.error} />
    </Panel>
  )
}

function GrantHistory({ id }: { id: number }) {
  const { grants, loading, error } = useAdminGrants(id)

  return (
    <Panel title={'Tier history'} hint={'Append-only. Every tier this account has ever held.'}>
      {loading && <div className={'h-16 animate-pulse rounded-md bg-secondary'} />}
      {error !== null && !loading && <QueryError error={error} />}
      {!loading && error === null && grants.length === 0 && (
        <p className={'text-xs text-ink-subtle'}>No tier has been granted by hand.</p>
      )}

      {grants.length > 0 && (
        <ul className={'flex flex-col divide-y divide-line'}>
          {grants.map((entry) => (
            <li key={entry.id} className={'flex flex-col gap-0.5 py-3'}>
              <p className={'text-xs text-ink'}>
                <span className={'text-ink-subtle'}>{entry.from_tier}</span> →{' '}
                <span className={'font-medium'}>{entry.to_tier}</span>
                {entry.expires_at !== null && (
                  <span className={'text-ink-subtle'}>
                    {' '}
                    until {formatLongDate(entry.expires_at)}
                  </span>
                )}
              </p>
              <p className={'text-xs text-ink-muted'}>{entry.reason}</p>
              <p className={'text-2xs text-ink-subtle'}>
                {entry.granted_by} · {formatLongDate(entry.granted_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function Sessions({ account }: { account: AdminAccount }) {
  const { sessions, loading, error } = useAdminSessions(account.id)
  const revoke = useRevokeAccountSessions(account.id)
  const [confirming, setConfirming] = useState(false)

  return (
    <Panel
      title={'Sessions'}
      hint={'Thirty days absolute, seven idle. Revoking signs the account out everywhere.'}
    >
      {loading && <div className={'h-16 animate-pulse rounded-md bg-secondary'} />}
      {error !== null && !loading && <QueryError error={error} />}
      {!loading && error === null && sessions.length === 0 && (
        <p className={'text-xs text-ink-subtle'}>No session has ever been opened.</p>
      )}

      {sessions.length > 0 && (
        <ul className={'flex flex-col divide-y divide-line'}>
          {sessions.map((session) => (
            <li key={session.id} className={'flex flex-wrap justify-between gap-2 py-3'}>
              <div className={'flex min-w-0 flex-col gap-0.5'}>
                <p className={'text-xs text-ink'}>
                  {session.live ? (
                    <span className={'text-primary'}>Live</span>
                  ) : (
                    <span className={'text-ink-subtle'}>
                      {session.revoked ? 'Revoked' : 'Expired'}
                    </span>
                  )}
                  <span className={'text-ink-subtle'}>
                    {' · '}
                    {session.ip_address ?? 'no address'}
                  </span>
                </p>
                <p className={'truncate text-2xs text-ink-subtle'} title={session.user_agent ?? ''}>
                  {session.user_agent ?? 'no user agent'}
                </p>
              </div>
              <p className={'shrink-0 text-2xs text-ink-subtle'}>
                used {formatRelativeTime(session.last_used_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {account.active_sessions > 0 &&
        (confirming ? (
          <div className={'flex flex-wrap items-center gap-3'}>
            <p className={'text-xs text-ink-muted'}>
              End {account.active_sessions} live{' '}
              {account.active_sessions === 1 ? 'session' : 'sessions'}?
            </p>
            <button
              type={'button'}
              onClick={() => revoke.mutate(undefined, { onSuccess: () => setConfirming(false) })}
              disabled={revoke.isPending}
              className={DANGER}
            >
              {revoke.isPending ? 'Revoking…' : 'Yes, sign them out'}
            </button>
            <button
              type={'button'}
              onClick={() => setConfirming(false)}
              className={'text-xs text-ink-muted cursor-pointer'}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button type={'button'} onClick={() => setConfirming(true)} className={`${QUIET} self-start`}>
            Sign out everywhere
          </button>
        ))}

      <Error error={revoke.error} />
    </Panel>
  )
}

function Keys({ id }: { id: number }) {
  const { keys, loading, error } = useAdminKeys(id)
  const revoke = useRevokeAccountKey(id)

  return (
    <Panel title={'API keys'} hint={'The prefix only — the key itself is never stored in the clear.'}>
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
                <p className={'text-xs text-ink'}>
                  {key.name}
                  {key.revoked && <span className={'text-ink-subtle'}> · revoked</span>}
                </p>
                <p className={'numeric text-2xs text-ink-subtle'}>
                  {key.prefix}… · issued {formatLongDate(key.created_at)}
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
                  className={`${QUIET} shrink-0 hover:text-negative`}
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Error error={revoke.error} />
    </Panel>
  )
}

/**
 * Deleting is offered last, phrased worst, and gated behind typing the address —
 * because deactivating does everything it does except the part that cannot be
 * undone. The account keeps its ledger; the person keeps their history.
 */
function Danger({ account }: { account: AdminAccount }) {
  const navigate = useNavigate()
  const setActive = useSetAccountActive(account.id)
  const remove = useDeleteAccount()
  const [typed, setTyped] = useState('')
  const [arming, setArming] = useState(false)

  return (
    <Panel
      title={'Danger'}
      hint={'Deactivating closes every live session and can be undone. Deleting cannot.'}
    >
      <button
        type={'button'}
        onClick={() => setActive.mutate(!account.is_active)}
        disabled={setActive.isPending}
        className={`${QUIET} self-start`}
      >
        {setActive.isPending
          ? 'Saving…'
          : account.is_active
            ? 'Deactivate account'
            : 'Reactivate account'}
      </button>
      <Error error={setActive.error} />

      {arming ? (
        <div className={'flex flex-col items-start gap-2 border-t border-line pt-4'}>
          <p className={'text-xs text-ink-muted'}>
            Type <span className={'text-ink'}>{account.email}</span> to confirm.
          </p>
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            className={`${FIELD} w-full max-w-sm`}
            aria-label={'Confirm the account email'}
          />
          <div className={'flex items-center gap-3'}>
            <button
              type={'button'}
              disabled={typed !== account.email || remove.isPending}
              onClick={() =>
                remove.mutate(account.id, { onSuccess: () => void navigate('/admin') })
              }
              className={`${DANGER} disabled:cursor-not-allowed`}
            >
              {remove.isPending ? 'Deleting…' : 'Delete permanently'}
            </button>
            <button
              type={'button'}
              onClick={() => {
                setArming(false)
                setTyped('')
              }}
              className={'text-xs text-ink-muted cursor-pointer'}
            >
              Cancel
            </button>
          </div>
          <Error error={remove.error} />
        </div>
      ) : (
        <button
          type={'button'}
          onClick={() => setArming(true)}
          className={'self-start text-xs text-ink-subtle hover:text-negative cursor-pointer'}
        >
          Delete this account
        </button>
      )}
    </Panel>
  )
}

function AdminAccountPage() {
  const { id } = useParams()
  const numericId = Number(id)
  const accountId = Number.isFinite(numericId) ? numericId : null
  const { account, loading, error } = useAdminAccount(accountId)
  const resetTrial = useResetTrial(accountId ?? 0)
  useDocumentTitle(account ? `${account.email} · Admin` : 'Account · Admin')

  if (loading)
    return (
      <div className={'measure pt-10 pb-24'}>
        <div className={'h-96 animate-pulse rounded-lg bg-secondary'} />
      </div>
    )

  if (error !== null)
    return (
      <div className={'measure pt-10 pb-24'}>
        <QueryError error={error} />
      </div>
    )

  if (!account)
    return (
      <div className={'measure flex flex-col gap-4 pt-10 pb-24'}>
        <p className={'text-sm text-ink-muted'}>No such account.</p>
        <Link to={'/admin'} className={'text-sm text-primary'}>
          Back to accounts
        </Link>
      </div>
    )

  return (
    <div className={'measure flex flex-col gap-6 pt-10 pb-24'}>
      <Link to={'/admin'} className={'text-xs text-ink-subtle hover:text-ink'}>
        ← Accounts
      </Link>

      <header className={'flex flex-wrap items-start justify-between gap-4'}>
        <div className={'flex flex-col gap-2'}>
          <h1 className={'text-xl font-semibold text-ink'}>{account.email}</h1>
          <div className={'flex flex-wrap items-center gap-3 text-xs text-ink-subtle'}>
            <TierBadge account={account} />
            <span>via {account.tier_source}</span>
            {!account.is_active && <span className={'text-negative'}>disabled</span>}
            <span>joined {formatLongDate(account.created_at)}</span>
            <span>
              {account.last_login_at === null
                ? 'never signed in'
                : `last seen ${formatRelativeTime(account.last_login_at)}`}
            </span>
          </div>
        </div>
      </header>

      <GrantTier account={account} />
      <GrantHistory id={account.id} />

      <Panel
        title={'Trial'}
        hint={'One per account, ever. Resetting lets them ask for another one.'}
      >
        <p className={'text-xs text-ink-muted'}>
          {account.trial_used
            ? `Used${account.trial_used_at ? ` on ${formatLongDate(account.trial_used_at)}` : ''}.`
            : 'Not used.'}
        </p>
        {account.trial_used && (
          <button
            type={'button'}
            onClick={() => resetTrial.mutate()}
            disabled={resetTrial.isPending}
            className={`${QUIET} self-start`}
          >
            {resetTrial.isPending ? 'Resetting…' : 'Reset the trial'}
          </button>
        )}
        <Error error={resetTrial.error} />
      </Panel>

      <Sessions account={account} />
      <Keys id={account.id} />
      <Danger account={account} />
    </div>
  )
}

export default AdminAccountPage
