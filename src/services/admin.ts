import type { AxiosResponse } from 'axios'
import { adminAuthApi, api, isNotFound, isUnauthenticated, queryString, totalFromHeaders } from './api'
import { setAdminCsrfToken } from './adminSession'
import type { ApiKey } from '../types/account'
import type { Page } from '../types/api'
import type {
  AdminAccount,
  AdminAccountCreated,
  AdminAccountQuery,
  AdminCredentials,
  AdminSession,
  AdminUser,
  TierGrant,
  TierGrantRequest,
  TrialRequest,
  TrialRequestStatus,
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

/**
 * The trial queue.
 *
 * Documented in the backend contract and not yet served — it is absent from
 * `/openapi.json` on the deployed API. So the surface is written against the
 * contract and gated on a probe: a 404 means this build of the API does not have
 * it, and the page is simply not offered. Anything else is a real error and is
 * reported as one.
 */
export const probeTrialRequests = (signal?: AbortSignal): Promise<boolean> =>
  api
    .get('/admin/trial-requests', { params: { limit: 1 }, signal })
    .then(() => true)
    .catch((error: unknown) => {
      if (isNotFound(error)) return false
      throw error
    })

export const listTrialRequests = (
  status?: TrialRequestStatus,
  signal?: AbortSignal,
): Promise<TrialRequest[]> =>
  api
    .get<TrialRequest[]>(`/admin/trial-requests${queryString({ status })}`, { signal })
    .then((res) => res.data)

/** Grants Pro for 14 days. */
export const approveTrialRequest = (id: number): Promise<TrialRequest> =>
  api.post<TrialRequest>(`/admin/trial-requests/${id}/approve`).then((res) => res.data)

/** Grants nothing. The reason is shown to the account, so it is written for them. */
export const declineTrialRequest = (id: number, decision_reason: string): Promise<TrialRequest> =>
  api
    .post<TrialRequest>(`/admin/trial-requests/${id}/decline`, { decision_reason })
    .then((res) => res.data)
