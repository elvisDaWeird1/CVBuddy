import type { AuthAccount, AuthSessionData } from './authApi'

const AUTH_TOKEN_KEY = 'cvbuddy.auth.token'
const AUTH_ACCOUNT_KEY = 'cvbuddy.auth.account'

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function saveAuthSession(session: AuthSessionData) {
  if (session.token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, session.token)
  }

  if (session.account) {
    window.localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(session.account))
  }
}

export function getStoredAccount(): AuthAccount | null {
  const storedAccount = window.localStorage.getItem(AUTH_ACCOUNT_KEY)

  if (!storedAccount) {
    return null
  }

  try {
    return JSON.parse(storedAccount) as AuthAccount
  } catch {
    window.localStorage.removeItem(AUTH_ACCOUNT_KEY)
    return null
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_ACCOUNT_KEY)
}
