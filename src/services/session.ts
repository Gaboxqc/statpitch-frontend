/**
 * The CSRF token for the current session, held in memory only.
 *
 * It cannot be read from anywhere else. The session cookie is `httpOnly`, and
 * the `statpitch_csrf` cookie the API also sets is scoped to `api.` — invisible
 * to a page served from the apex. So the token has to be taken out of the body
 * of whichever account response last carried one, and kept here.
 *
 * A reload loses it, which is correct: `/accounts/me` reissues one, and that
 * call is how the app recovers the session anyway.
 */
let csrfToken: string | null = null

export const getCsrfToken = (): string | null => csrfToken

export const setCsrfToken = (token: string | null): void => {
  csrfToken = token
}
