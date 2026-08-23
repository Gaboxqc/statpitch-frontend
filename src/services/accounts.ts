import type { AxiosResponse } from 'axios'
import { api, isUnauthenticated } from './api'
import { setCsrfToken } from './session'
import type {
  Account,
  ApiKey,
  Credentials,
  IssuedApiKey,
  PasswordChange,
  TrialRequest,
} from '../types/account'

/**
 * Every account route answers with the whole account, including a current CSRF
 * token. Taking it here means no caller has to remember to, and the token is
 * never a step behind a password change that reissued it.
 */
function adopt(res: AxiosResponse<Account>): Account {
  setCsrfToken(res.data.csrf_token)
  return res.data
}

/** `201`, and signs the new account straight in on the free tier. */
export const register = (credentials: Credentials): Promise<Account> =>
  api.post<Account>('/accounts/register', credentials).then(adopt)

export const login = (credentials: Credentials): Promise<Account> =>
  api.post<Account>('/accounts/login', credentials).then(adopt)

export const logout = async (): Promise<null> => {
  await api.post('/accounts/logout')
  setCsrfToken(null)
  return null
}

/**
 * The source of truth for entitlement, and the only way to recover a session
 * after a reload. Signed out is `null` rather than a thrown error: anonymous is
 * a state the app renders, not a failure it reports.
 */
export const getMe = (signal?: AbortSignal): Promise<Account | null> =>
  api
    .get<Account>('/accounts/me', { signal })
    .then(adopt)
    .catch((error: unknown) => {
      if (isUnauthenticated(error)) return null
      throw error
    })

/**
 * Asks for the trial. Grants **nothing**.
 *
 * There is no self-serve route any more — `POST /accounts/trial`, which granted
 * Pro outright, is gone — because no paid tier should be grantable by the person
 * receiving it. An admin approves or declines, so this opens a request and the
 * answer arrives later.
 */
export const requestTrial = (message?: string): Promise<TrialRequest> =>
  api
    .post<TrialRequest>('/accounts/trial/request', { message: message?.trim() || null })
    .then((res) => res.data)

/**
 * Where the account's request stands, or `null` if it has never asked. Null is a
 * 200 rather than a 404: never having asked is a state, not a missing resource.
 */
export const getTrialRequest = (signal?: AbortSignal): Promise<TrialRequest | null> =>
  api
    .get<TrialRequest | null>('/accounts/trial/request', { signal })
    .then((res) => res.data ?? null)
    .catch((error: unknown) => {
      // Anonymous visitors have no request and are not asked to care.
      if (isUnauthenticated(error)) return null
      throw error
    })

/** Closes every other session and returns a fresh one for this tab. */
export const changePassword = (change: PasswordChange): Promise<Account> =>
  api.post<Account>('/accounts/password', change).then(adopt)

/** Signs out everywhere, this session included — so treat it as a logout. */
export const revokeAllSessions = async (): Promise<null> => {
  await api.post('/accounts/sessions/revoke-all')
  setCsrfToken(null)
  return null
}

export const listApiKeys = (signal?: AbortSignal): Promise<ApiKey[]> =>
  api.get<ApiKey[]>('/accounts/keys', { signal }).then((res) => res.data)

/**
 * Elite only. The response is the one and only sight of the secret — show it
 * before anything can navigate away, because it cannot be fetched again.
 */
export const createApiKey = (name: string): Promise<IssuedApiKey> =>
  api.post<IssuedApiKey>('/accounts/keys', { name }).then((res) => res.data)

/** `204`. Works after a subscription lapses, so a key can always be turned off. */
export const revokeApiKey = async (id: number): Promise<void> => {
  await api.delete(`/accounts/keys/${id}`)
}
