import type { AuthAccount, AuthSessionData } from './authApi'
import { getInitialAuthStatus, type AuthSessionStatus } from './authPolicy'

const AUTH_TOKEN_KEY = 'cvbuddy.auth.token'
const AUTH_ACCOUNT_KEY = 'cvbuddy.auth.account'
const AUTH_MESSAGE_KEY = 'cvbuddy.auth.message'
const AUTH_CHANGE_EVENT = 'cvbuddy-auth-session-changed'

export interface AuthSnapshot {
  token: string | null
  account: AuthAccount | null
  status: AuthSessionStatus
}

let authSnapshot: AuthSnapshot | null = null

function readAuthSnapshot(): AuthSnapshot {
  const token = getAuthToken()

  return {
    token,
    account: getStoredAccount(),
    status: getInitialAuthStatus(token),
  }
}

function publishAuthSnapshot(nextSnapshot: AuthSnapshot) {
  authSnapshot = nextSnapshot
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

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

  const token = session.token ?? getAuthToken()
  const account = session.account ?? getStoredAccount()
  publishAuthSnapshot({
    token,
    account,
    status: token && account ? 'authenticated' : getInitialAuthStatus(token),
  })
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

export function updateStoredAccount(patch: Partial<AuthAccount>) {
  const current = getStoredAccount()
  if (!current) return
  const account = { ...current, ...patch }
  const token = getAuthToken()
  window.localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(account))
  publishAuthSnapshot({
    token,
    account,
    status: token ? getAuthSnapshot().status : 'anonymous',
  })
}

export function confirmAuthSession(expectedToken: string, account: AuthAccount) {
  if (getAuthToken() !== expectedToken) return false

  window.localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(account))
  publishAuthSnapshot({ token: expectedToken, account, status: 'authenticated' })
  return true
}

export function retryAuthSessionVerification(expectedToken: string) {
  if (getAuthToken() !== expectedToken) return false

  publishAuthSnapshot({
    token: expectedToken,
    account: getStoredAccount(),
    status: 'checking',
  })
  return true
}

export function markAuthSessionUnavailable(expectedToken: string) {
  if (getAuthToken() !== expectedToken) return false

  publishAuthSnapshot({
    token: expectedToken,
    account: getStoredAccount(),
    status: 'unavailable',
  })
  return true
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_ACCOUNT_KEY)
  publishAuthSnapshot({ token: null, account: null, status: 'anonymous' })
}

export function getAuthSnapshot(): AuthSnapshot {
  if (!authSnapshot) {
    authSnapshot = readAuthSnapshot()
  }

  return authSnapshot
}

export function subscribeAuthSession(listener: () => void) {
  const handleAuthChange = () => listener()
  const handleStorageChange = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return
    if (event.key && event.key !== AUTH_TOKEN_KEY && event.key !== AUTH_ACCOUNT_KEY) return

    authSnapshot = readAuthSnapshot()
    listener()
  }

  window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

export function setAuthMessage(message: string) {
  window.sessionStorage.setItem(AUTH_MESSAGE_KEY, message)
}

export function getAuthMessage() {
  return window.sessionStorage.getItem(AUTH_MESSAGE_KEY)
}

export function clearAuthMessage() {
  window.sessionStorage.removeItem(AUTH_MESSAGE_KEY)
}
