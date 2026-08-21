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
  /** False means the trial button is worth showing. Once true, never false again. */
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
