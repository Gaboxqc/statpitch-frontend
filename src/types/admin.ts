/**
 * Mirrors the AdminRead / AdminAccountRead / TierGrantRead / AdminSessionRead
 * schemas at `/openapi.json`.
 *
 * These are the portfolio owner's view of StatPitch customers, not a customer's
 * own view of themselves — a different identity reading a different shape of the
 * same account. Nothing here is reachable with a StatPitch session, however high
 * the tier.
 */

import type { Tier } from './account'

/** Whoever runs the portfolio. The only credential the admin routes accept from a browser. */
export interface AdminUser {
  username: string
  last_login_at: string | null
  /** Echoed back on every unsafe admin request. Kept apart from the customer's. */
  csrf_token: string
}

export interface AdminCredentials {
  username: string
  password: string
}

/**
 * One customer account as an admin sees it.
 *
 * `tier` is what was granted; `effective_tier` is what the account actually
 * reads as right now. They disagree exactly when a grant has lapsed, which is
 * the one thing this page can say that `/accounts/me` cannot — so both are
 * shown whenever they differ rather than picking one and losing the fact.
 */
export interface AdminAccount {
  id: number
  email: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
  email_verified: boolean
  /** The granted tier, expiry ignored. A raw string: an unknown value is not a crash. */
  tier: string
  /** What entitlement resolves to today. Fails closed to `free`. */
  effective_tier: Tier
  tier_expires_at: string | null
  /** How the tier was arrived at — `trial`, `admin`, `default`, and so on. */
  tier_source: string
  tier_updated_at: string | null
  tier_updated_by: string | null
  trial_used: boolean
  trial_used_at: string | null
  active_sessions: number
  live_api_keys: number
}

/**
 * The `201` from creating an account, and the one and only sight of the
 * password it was created with. Nothing stores it in the clear afterwards.
 */
export interface AdminAccountCreated extends AdminAccount {
  temporary_password: string
}

/** One entry in an account's tier history. Append-only, like the ledger. */
export interface TierGrant {
  id: number
  from_tier: string
  to_tier: string
  expires_at: string | null
  reason: string
  granted_by: string
  granted_at: string
}

/**
 * A tier change. `reason` is required by the API — a 422 otherwise — because a
 * grant nobody wrote a reason for is indistinguishable later from a mistake.
 */
export interface TierGrantRequest {
  tier: Tier
  /** Null or absent means it does not expire. */
  expires_at?: string | null
  /** 3–200 characters. */
  reason: string
}

export const REASON_MIN_LENGTH = 3
export const REASON_MAX_LENGTH = 200

/** One of an account's sessions, live or closed. */
export interface AdminSession {
  id: number
  created_at: string
  last_used_at: string
  expires_at: string
  revoked: boolean
  /** Neither revoked nor expired — the sessions a revoke-all would actually end. */
  live: boolean
  ip_address: string | null
  user_agent: string | null
}

export interface AdminAccountQuery {
  /** Filters on the *granted* tier, not the effective one. */
  tier?: string
  /** Case-insensitive substring. */
  email?: string
  is_active?: boolean
  offset?: number
  limit?: number
}

/**
 * A trial request awaiting a decision. Documented in the backend contract but
 * not yet served — see `probeTrialRequests` in `services/admin.ts`.
 */
export type TrialRequestStatus = 'pending' | 'approved' | 'declined'

export interface TrialRequest {
  id: number
  account_id: number
  email: string
  status: TrialRequestStatus
  requested_at: string
  decided_at: string | null
  decided_by: string | null
  decision_reason: string | null
}
