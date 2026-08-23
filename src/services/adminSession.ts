/**
 * The CSRF token for the portfolio admin session, held in memory only.
 *
 * There are two of these because there are two identities. `statpitch_session`
 * belongs to a customer and is what every tier check reads; `gabox_session`
 * belongs to whoever runs the portfolio, and is the only credential the
 * `/statpitch/admin/*` routes accept from a browser. An Elite subscriber is not
 * an admin, and no amount of upgrading makes them one — so the tokens cannot
 * share a slot, or an admin write would be signed with a customer's token and
 * refused with a 403 that says nothing about why.
 *
 * A reload loses it, which is correct: `/auth/me` reissues one, and that call is
 * how the gate recovers the session anyway.
 */
let adminCsrfToken: string | null = null

export const getAdminCsrfToken = (): string | null => adminCsrfToken

export const setAdminCsrfToken = (token: string | null): void => {
  adminCsrfToken = token
}
