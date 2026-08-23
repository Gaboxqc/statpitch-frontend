import type { Account, TrialRequest } from '../types/account'

/**
 * What the trial offers this reader right now, decided in one place because two
 * surfaces ask — the pricing card and the account page — and they must never
 * disagree about whether somebody has a request outstanding.
 */
export type TrialState =
  | { kind: 'request'; label: string; detail: string }
  | { kind: 'pending'; label: string; detail: string }
  | { kind: 'declined'; label: string; detail: string | null }
  | { kind: 'used'; detail: string }
  | { kind: 'none' }

const ASK = 'No payment details. Once per account, so it is worth asking when you will use it.'

/**
 * The trial is **requested, not taken**. Asking grants nothing and an admin
 * decides, so the copy never says "start" — a button that promised Pro and
 * delivered a queue position would be the dark pattern the pricing page claims
 * not to use.
 *
 * Order matters. A pending request outranks everything: it is the answer to
 * "can I ask", whatever else is true. Above the free tier there is nothing to
 * ask for at all.
 */
export function describeTrial(
  account: Account | null,
  request: TrialRequest | null,
): TrialState {
  if (account === null || account.tier !== 'free') return { kind: 'none' }

  if (request?.status === 'pending')
    return {
      kind: 'pending',
      label: 'Awaiting review',
      detail: 'Your request is with an administrator. Nothing is granted until it is approved.',
    }

  // Granted once already — a lapsed trial reads `free` again, and the offer does
  // not come back with it. Only an admin reset returns it.
  if (account.trial_used)
    return {
      kind: 'used',
      detail: 'The trial has been used on this account.',
    }

  if (request?.status === 'declined')
    return {
      kind: 'declined',
      label: 'Request again',
      detail: request.decision_reason,
    }

  return { kind: 'request', label: 'Request 14-day trial', detail: ASK }
}
