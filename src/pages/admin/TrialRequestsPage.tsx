import { useState } from 'react'
import { Link } from 'react-router'
import QueryError from '../../components/ui/QueryError'
import {
  useApproveTrialRequest,
  useDeclineTrialRequest,
  useTrialRequests,
} from '../../hooks/useTrialRequests'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { describeError } from '../../services/api'
import { formatLongDate, formatRelativeTime } from '../../utils/datetime'
import type { TrialRequestStatus } from '../../types/account'
import type { AdminTrialRequest } from '../../types/admin'

const FIELD = 'rounded-md border border-line-strong bg-secondary py-1 px-2 text-xs text-ink'

const STATUS_STYLE: Record<TrialRequestStatus, string> = {
  pending: 'text-chart-3',
  approved: 'text-primary',
  declined: 'text-ink-subtle',
}

/**
 * One request, and the two things that can be done about it.
 *
 * Declining takes a reason because the account is shown it. Approving does not:
 * fourteen days of Pro needs no explanation to the person receiving it.
 */
function Request({ request }: { request: AdminTrialRequest }) {
  const approve = useApproveTrialRequest()
  const decline = useDeclineTrialRequest()
  const [reason, setReason] = useState('')
  const [declining, setDeclining] = useState(false)

  const pending = request.status === 'pending'

  return (
    <li className={'flex flex-col gap-3 py-4'}>
      <div className={'flex flex-wrap items-baseline justify-between gap-2'}>
        <p className={'text-sm text-ink'}>
          <Link to={`/admin/accounts/${request.account_id}`} className={'hover:text-primary'}>
            {request.account_email}
          </Link>
        </p>
        <p className={'text-2xs text-ink-subtle'}>
          <span className={STATUS_STYLE[request.status]}>{request.status}</span> · asked{' '}
          {formatRelativeTime(request.requested_at)}
        </p>
      </div>

      {/* What they said when asking, and what they were told after. */}
      {request.message !== null && (
        <p className={'text-xs text-ink-muted italic'}>&ldquo;{request.message}&rdquo;</p>
      )}

      {request.decision_reason !== null && (
        <p className={'text-xs text-ink-muted'}>{request.decision_reason}</p>
      )}

      {request.decided_at !== null && (
        <p className={'text-2xs text-ink-subtle'}>
          {request.decided_by ?? 'decided'} · {formatLongDate(request.decided_at)}
        </p>
      )}

      {pending &&
        (declining ? (
          <div className={'flex flex-wrap items-end gap-2'}>
            <label className={'flex min-w-56 flex-1 flex-col gap-1'}>
              <span className={'eyebrow text-ink-subtle'}>Reason</span>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={'Shown to the account'}
                className={FIELD}
              />
            </label>
            <button
              type={'button'}
              disabled={reason.trim().length === 0 || decline.isPending}
              onClick={() => decline.mutate({ id: request.id, reason: reason.trim() })}
              className={
                'rounded-md border border-negative/40 bg-negative/10 py-1.5 px-3 text-xs font-semibold text-negative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              {decline.isPending ? 'Declining…' : 'Decline'}
            </button>
            <button
              type={'button'}
              onClick={() => setDeclining(false)}
              className={'text-xs text-ink-muted cursor-pointer'}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className={'flex items-center gap-3'}>
            <button
              type={'button'}
              onClick={() => approve.mutate(request.id)}
              disabled={approve.isPending}
              className={
                'rounded-md bg-primary py-1.5 px-3 text-xs font-semibold text-background cursor-pointer disabled:cursor-progress disabled:opacity-70'
              }
            >
              {approve.isPending ? 'Approving…' : 'Approve · 14 days Pro'}
            </button>
            <button
              type={'button'}
              onClick={() => setDeclining(true)}
              className={'text-xs text-ink-muted hover:text-ink cursor-pointer'}
            >
              Decline
            </button>
          </div>
        ))}

      {(approve.error !== null || decline.error !== null) && (
        <p role={'alert'} className={'text-xs text-negative'}>
          {describeError(approve.error ?? decline.error)}
        </p>
      )}
    </li>
  )
}

function TrialRequestsPage() {
  useDocumentTitle('Trial requests · Admin')
  const [status, setStatus] = useState<TrialRequestStatus | ''>('pending')
  const { requests, loading, error } = useTrialRequests(status === '' ? undefined : status)

  return (
    <div className={'measure flex flex-col gap-6 pt-10 pb-24'}>
      <header className={'flex flex-col gap-2'}>
        <h1 className={'text-xl font-semibold text-ink'}>Trial requests</h1>
        <p className={'text-sm text-ink-muted'}>
          Oldest first. Approving grants Pro for fourteen days; declining grants nothing and lets
          them ask again.
        </p>
      </header>

      <label className={'flex w-fit flex-col gap-1'}>
        <span className={'eyebrow text-ink-subtle'}>Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TrialRequestStatus | '')}
          className={`${FIELD} cursor-pointer`}
        >
          <option value={'pending'}>Pending</option>
          <option value={'approved'}>Approved</option>
          <option value={'declined'}>Declined</option>
          <option value={''}>All</option>
        </select>
      </label>

      {loading && <div className={'h-32 animate-pulse rounded-lg bg-secondary'} />}
      {error !== null && !loading && <QueryError error={error} />}

      {!loading && error === null && requests.length === 0 && (
        <p className={'text-sm text-ink-muted'}>Nothing in the queue.</p>
      )}

      {requests.length > 0 && (
        <ul className={'flex flex-col divide-y divide-line rounded-lg border border-line bg-card px-6'}>
          {requests.map((request) => (
            <Request key={request.id} request={request} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default TrialRequestsPage
