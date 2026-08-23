import type { AxiosResponse } from 'axios'
import { adminAuthApi, api, isUnauthenticated, queryString, totalFromHeaders } from './api'
import { setAdminCsrfToken } from './adminSession'
import type { ApiKey, TrialRequestStatus } from '../types/account'
import type { Page } from '../types/api'
import type {
  AdminAccount,
  AdminAccountCreated,
  AdminAccountQuery,
  AdminCredentials,
  AdminSession,
  AdminTrialRequest,
  AdminUser,
  TierGrant,
  TierGrantRequest,
} from '../types/admin'

/**
 * Administration of StatPitch customers, behind the portfolio's own admin guard.
 *
 * Two credentials open these routes: the `gabox_session` cookie the functions
 * below establish, or the master `X-API-KEY`. The key is deliberately never
 * referenced here — anything a browser sends, a browser can be made to show, and
 * a master key in a bundle is a master key in the hands of whoever opens
 * devtools.
 */

/** Both auth routes answer with the admin plus a current CSRF token. */
function adopt(res: AxiosResponse<AdminUser>): AdminUser {
  setAdminCsrfToken(res.data.csrf_token)
  return res.data
}

export const adminLogin = (credentials: AdminCredentials): Promise<AdminUser> =>
  adminAuthApi.post<AdminUser>('/auth/login', credentials).then(adopt)

export const adminLogout = async (): Promise<null> => {
  await adminAuthApi.post('/auth/logout')
  setAdminCsrfToken(null)
  return null
}

/**
 * Whether an admin session is live, and the token to sign writes with. Signed
 * out is `null` rather than a thrown error — the gate renders a sign-in form for
 * it, which is a state and not a failure.
 */
export const getAdmin = (signal?: AbortSignal): Promise<AdminUser | null> =>
  adminAuthApi
    .get<AdminUser>('/auth/me', { signal })
    .then(adopt)
    .catch((error: unknown) => {
      if (isUnauthenticated(error)) return null
      throw error
    })

/** Paginated, and the only admin collection that sets `X-Total-Count`. */
export const listAccounts = async (
  { tier, email, is_active, offset = 0, limit = 25 }: AdminAccountQuery = {},
  signal?: AbortSignal,
): Promise<Page<AdminAccount>> => {
  const res = await api.get<AdminAccount[]>(
    `/admin/accounts${queryString({ tier, email, is_active, offset, limit })}`,
    { signal },
  )
  return { items: res.data, total: totalFromHeaders(res.headers, res.data.length) }
}

/** The same row as the list, plus live session and key counts. */
export const getAccount = (id: number, signal?: AbortSignal): Promise<AdminAccount> =>
  api.get<AdminAccount>(`/admin/accounts/${id}`, { signal }).then((res) => res.data)

/**
 * Creates an account on the free tier. The `201` carries the password it was
 * created with, and that response is the only place it will ever appear.
 */
export const createAccount = (email: string): Promise<AdminAccountCreated> =>
  api.post<AdminAccountCreated>('/admin/accounts', { email }).then((res) => res.data)

/** Disabling closes every live session; the account itself survives. */
export const setAccountActive = (id: number, is_active: boolean): Promise<AdminAccount> =>
  api.patch<AdminAccount>(`/admin/accounts/${id}`, { is_active }).then((res) => res.data)

/** Irreversible, and the ledger it leaves behind is not undone with it. */
export const deleteAccount = async (id: number): Promise<void> => {
  await api.delete(`/admin/accounts/${id}`)
}

/** `reason` is required by the API. A grant nobody explained is one nobody can audit. */
export const grantTier = (id: number, grant: TierGrantRequest): Promise<AdminAccount> =>
  api.patch<AdminAccount>(`/admin/accounts/${id}/tier`, grant).then((res) => res.data)

/** Every tier the account has held, newest first. */
export const listGrants = (id: number, signal?: AbortSignal): Promise<TierGrant[]> =>
  api.get<TierGrant[]>(`/admin/accounts/${id}/grants`, { signal }).then((res) => res.data)

/** Lets an account ask for a trial again after one was used. */
export const resetTrial = (id: number): Promise<AdminAccount> =>
  api.post<AdminAccount>(`/admin/accounts/${id}/trial/reset`).then((res) => res.data)

/** Live and closed both, with the IP and user agent each was opened from. */
export const listSessions = (id: number, signal?: AbortSignal): Promise<AdminSession[]> =>
  api.get<AdminSession[]>(`/admin/accounts/${id}/sessions`, { signal }).then((res) => res.data)

/** Signs the account out everywhere. The account stays usable — it can sign back in. */
export const revokeAllSessions = (id: number): Promise<AdminAccount> =>
  api.post<AdminAccount>(`/admin/accounts/${id}/sessions/revoke-all`).then((res) => res.data)

/** Never the key itself: prefix, name, last used, revoked. */
export const listAccountKeys = (id: number, signal?: AbortSignal): Promise<ApiKey[]> =>
  api.get<ApiKey[]>(`/admin/accounts/${id}/keys`, { signal }).then((res) => res.data)

/** Turns off a leaked key by its id, whoever owns it. */
export const revokeKey = async (keyId: number): Promise<void> => {
  await api.delete(`/admin/keys/${keyId}`)
}

/** The queue, oldest first. Nobody is granted a trial without passing through it. */
export const listTrialRequests = (
  status?: TrialRequestStatus,
  signal?: AbortSignal,
): Promise<AdminTrialRequest[]> =>
  api
    .get<AdminTrialRequest[]>(`/admin/trial-requests${queryString({ status })}`, { signal })
    .then((res) => res.data)

/**
 * Both decisions take the same body, and the API requires one — so a decision
 * with nothing to say still sends `{}` rather than no body at all.
 */
export const approveTrialRequest = (id: number, reason?: string): Promise<AdminTrialRequest> =>
  api
    .post<AdminTrialRequest>(`/admin/trial-requests/${id}/approve`, { reason: reason ?? null })
    .then((res) => res.data)

/** Grants nothing. The reason reaches the account, so it is written for them to read. */
export const declineTrialRequest = (id: number, reason: string): Promise<AdminTrialRequest> =>
  api
    .post<AdminTrialRequest>(`/admin/trial-requests/${id}/decline`, { reason })
    .then((res) => res.data)
