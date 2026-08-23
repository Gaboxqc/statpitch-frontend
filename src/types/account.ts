/**
 * Mirrors the AccountRead / ApiKeyRead schemas at `/openapi.json`. Entirely
 * separate from the portfolio's admin login — these are StatPitch customers.
 */

/** What a caller is entitled to. An unrecognised value resolves to `free` server-side. */
export type Tier = 'free' | 'pro' | 'elite'

/**
 * The account as its owner sees it. Returned by every account route, which is
 * why each one is also an opportunity to refresh the CSRF token.
 */
export interface Account {
  email: string
  /**
   * The **effective** tier. A lapsed subscription already reads `free` here,
   * so nothing client-side compares dates to decide what to show.
   */
  tier: Tier
  /** Still sent once lapsed, so "Pro until 3 March" remains renderable. */
  tier_expires_at: string | null
  /**
   * Whether a trial has ever been granted on this account. Once true, never
   * false again — an admin reset is what clears it.
   */
  trial_used: boolean
  /** Always false today — email verification is not built. */
  email_verified: boolean
  last_login_at: string | null
  /**
   * Echoed back on every unsafe request. Travels in the body because both
   * cookies involved are unreadable from the page.
   */
  csrf_token: string
}

/**
 * Where an account's trial request stands. `null` from the API means it has
 * never asked, which is a fourth state and the only one that offers the button.
 */
export type TrialRequestStatus = 'pending' | 'approved' | 'declined'

/**
 * A request for the trial, as its owner sees it.
 *
 * Asking grants nothing. An admin approves or declines, so the account holds a
 * request rather than a trial — and the honest button says "request", not
 * "start", because pressing it changes nothing about what they can read.
 */
export interface TrialRequest {
  id: number
  status: TrialRequestStatus
  /** What the account said when asking. Up to 500 characters, and optional. */
  message: string | null
  requested_at: string
  decided_at: string | null
  /** Written for the account to read, so it is rendered as it arrives. */
  decision_reason: string | null
}

/** The API caps the note at 500 characters and answers 422 above it. */
export const MAX_TRIAL_MESSAGE_LENGTH = 500

export interface Credentials {
  email: string
  password: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
}

/** An issued key as its owner sees it afterwards — never the key itself. */
export interface ApiKey {
  id: number
  name: string
  /** The leading, non-secret part, e.g. `sp_live_7f3a`. Enough to tell keys apart. */
  prefix: string
  created_at: string
  last_used_at: string | null
  revoked: boolean
}

/**
 * The one response carrying the secret, returned exactly once at creation.
 * Nothing stores the raw key, so a lost one is replaced rather than recovered.
 */
export interface IssuedApiKey extends ApiKey {
  key: string
}

/** The API rejects anything shorter with a 422, so the form can say so first. */
export const MIN_PASSWORD_LENGTH = 12
