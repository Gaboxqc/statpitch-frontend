import { useState } from 'react'
import { Link } from 'react-router'
import ApiKeys from '../components/account/ApiKeys'
import PasswordForm from '../components/account/PasswordForm'
import { useAccount, useRequestTrial, useRevokeAllSessions, useTrialRequest } from '../hooks/useAccount'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useQuota } from '../hooks/useQuota'
import { describeError } from '../services/api'
import { formatLongDate, formatRelativeTime } from '../utils/datetime'
import { TIER_LABELS } from '../constants/tiers'
import { describeTrial } from '../utils/trialState'
import { MAX_TRIAL_MESSAGE_LENGTH } from '../types/account'
import type { Account } from '../types/account'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={'flex flex-col gap-4'}>
      <h2 className={'text-sm font-medium text-ink-muted'}>{title}</h2>
      {children}
    </section>
  )
}

/**
 * What the reader is on, and until when.
 *
 * `tier` is already the *effective* tier — a lapsed subscription reads `free`
 * here the moment it expires — so nothing on this page compares dates to decide
 * what someone is entitled to. The expiry is shown because "Pro until 3 March"
 * is worth knowing, not because anything is computed from it.
 */
/**
 * Asking for the trial, and what came of asking.
 *
 * The button used to say "Start 14-day Pro trial" and grant it outright. There
 * is no such route any more, by design: no paid tier should be grantable by the
 * person receiving it. So this asks, and then reports where the asking got to.
 */
function Trial({ account }: { account: Account }) {
  const { request } = useTrialRequest()
  const ask = useRequestTrial()
  const [message, setMessage] = useState('')
  const trial = describeTrial(account, request)

  if (trial.kind === 'none') return null

  if (trial.kind === 'used')
    return (
      <p className={'text-xs text-ink-subtle'}>
        {trial.detail} <Link to={'/pricing'}>See plans</Link> for what Pro carries.
      </p>
    )

  if (trial.kind === 'pending')
    return (
      <div className={'flex flex-col gap-1 rounded-md border border-line bg-secondary p-3'}>
        <p className={'text-sm text-ink'}>{trial.label}</p>
        <p className={'text-xs text-ink-subtle'}>{trial.detail}</p>
        {request !== null && (
          <p className={'text-2xs text-ink-subtle'}>
            Asked {formatRelativeTime(request.requested_at)}
          </p>
        )}
      </div>
    )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        ask.mutate(message, { onSuccess: () => setMessage('') })
      }}
      className={'flex flex-col items-start gap-2'}
    >
      {/* A declined request is worth showing above the one replacing it: asking
          again without knowing why the last one failed is just guessing. */}
      {trial.kind === 'declined' && trial.detail !== null && (
        <p className={'text-xs text-ink-muted'}>
          Your last request was declined: <span className={'text-ink'}>{trial.detail}</span>
        </p>
      )}

      <label className={'flex w-full max-w-md flex-col gap-1'}>
        <span className={'eyebrow text-ink-subtle'}>Anything to add? (optional)</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={MAX_TRIAL_MESSAGE_LENGTH}
          rows={2}
          placeholder={'What you would use it for.'}
          className={'rounded-md border border-line-strong bg-secondary p-2 text-sm text-ink'}
        />
      </label>

      <button
        type={'submit'}
        disabled={ask.isPending}
        className={
          'rounded-md bg-primary py-2 px-4 text-sm font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
        }
      >
        {ask.isPending ? 'Requesting…' : trial.label}
      </button>

      <p className={'text-xs text-ink-subtle'}>
        {trial.kind === 'request'
          ? trial.detail
          : 'An administrator reviews every request. Asking grants nothing on its own.'}
      </p>

      {ask.error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(ask.error)}
        </p>
      )}
    </form>
  )
}

function Plan({ account }: { account: Account }) {
  const quota = useQuota()
  const isFree = account.tier === 'free'
  const lapsed = isFree && account.tier_expires_at !== null

  return (
    <div className={'flex flex-col gap-4 rounded-lg border border-line bg-card p-6'}>
      <div className={'flex flex-wrap items-baseline justify-between gap-2'}>
        <p className={'text-lg font-semibold text-ink'}>{TIER_LABELS[account.tier]}</p>
        <p className={'text-xs text-ink-subtle'}>{account.email}</p>
      </div>

      {account.tier_expires_at !== null && (
        <p className={'text-xs text-ink-muted'}>
          {lapsed ? 'Expired on ' : `${TIER_LABELS[account.tier]} until `}
          <span className={'text-ink'}>{formatLongDate(account.tier_expires_at)}</span>
        </p>
      )}

      {isFree && typeof quota === 'number' && (
        <p className={'text-xs text-ink-muted'}>
          <span className={'numeric text-ink'}>{quota}</span>
          {quota === 1 ? ' prediction left today' : ' predictions left today'}
          <span className={'text-ink-subtle'}> · the count resets daily</span>
        </p>
      )}

      <Trial account={account} />
    </div>
  )
}

/**
 * Signing out everywhere. Separated from the password form because it is not a
 * setting — it ends this session too, and the reader should know that before
 * pressing it rather than by being returned to the logged-out page.
 */
function Sessions() {
  const revoke = useRevokeAllSessions()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className={'flex flex-col items-start gap-2 rounded-lg border border-line bg-card p-6'}>
      <p className={'text-sm text-ink'}>Sign out of every device</p>
      <p className={'text-xs text-ink-subtle'}>
        Sessions last 30 days, or 7 idle. This ends all of them — including this one, so you will be
        signed out here too.
      </p>

      {confirming ? (
        <div className={'mt-1 flex items-center gap-2'}>
          <button
            type={'button'}
            onClick={() => revoke.mutate()}
            disabled={revoke.isPending}
            className={
              'rounded-md border border-negative/40 bg-negative/10 py-1.5 px-3 text-xs font-semibold text-negative cursor-pointer disabled:cursor-progress'
            }
          >
            {revoke.isPending ? 'Signing out…' : 'Yes, sign out everywhere'}
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
        <button
          type={'button'}
          onClick={() => setConfirming(true)}
          className={
            'mt-1 rounded-md border border-line-strong py-1.5 px-3 text-xs text-ink-muted hover:text-ink cursor-pointer'
          }
        >
          Sign out everywhere
        </button>
      )}

      {revoke.error !== null && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(revoke.error)}
        </p>
      )}
    </div>
  )
}

function AccountPage() {
  useDocumentTitle('Account')
  const { account, isElite, loading } = useAccount()

  if (loading)
    return (
      <div className={'measure pt-10 pb-24'}>
        <div className={'h-64 animate-pulse rounded-lg bg-secondary'} />
      </div>
    )

  // The route is only reachable from signed-in chrome, but a bookmark is not.
  if (!account)
    return (
      <div className={'measure flex flex-col gap-4 pt-10 pb-24'}>
        <h1 className={'text-xl font-semibold text-ink'}>Account</h1>
        <p className={'text-sm text-ink-muted'}>
          <Link to={'/login'}>Sign in</Link> to see your plan.
        </p>
      </div>
    )

  return (
    <div className={'measure flex flex-col gap-12 pt-10 pb-24'}>
      <header className={'flex flex-col gap-2'}>
        <h1 className={'text-xl font-semibold text-ink'}>Account</h1>
        <p className={'text-sm text-ink-muted'}>Your plan, your password, and your API keys.</p>
      </header>

      <Section title={'Plan'}>
        <Plan account={account} />
      </Section>

      <Section title={'Password'}>
        <PasswordForm />
      </Section>

      <Section title={'Sessions'}>
        <Sessions />
      </Section>

      {/* Listing stays available to a lapsed account so it can always revoke
          what it left behind; only issuing a new key is an Elite action. */}
      <Section title={'API keys'}>
        <ApiKeys canIssue={isElite} />
      </Section>
    </div>
  )
}

export default AccountPage
