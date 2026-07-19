import type { AuthAccount, AuthSessionData } from './authApi'

const AUTH_TOKEN_KEY = 'cvbuddy.auth.token'
const AUTH_ACCOUNT_KEY = 'cvbuddy.auth.account'
const AUTH_MESSAGE_KEY = 'cvbuddy.auth.message'
const AUTH_CHANGE_EVENT = 'cvbuddy-auth-session-changed'

export interface AuthSnapshot {
  token: string | null
  account: AuthAccount | null
}

let authSnapshot: AuthSnapshot | null = null

function readAuthSnapshot(): AuthSnapshot {
  return {
    token: getAuthToken(),
    account: getStoredAccount(),
  }
}

function notifyAuthSessionChange() {
  authSnapshot = readAuthSnapshot()
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

  notifyAuthSessionChange()
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
  window.localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify({ ...current, ...patch }))
  notifyAuthSessionChange()
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_ACCOUNT_KEY)
  notifyAuthSessionChange()
}

export function getAuthSnapshot(): AuthSnapshot {
  if (!authSnapshot) {
    authSnapshot = readAuthSnapshot()
  }

  return authSnapshot
}

export function subscribeAuthSession(listener: () => void) {
  const handleAuthChange = () => {
    authSnapshot = readAuthSnapshot()
    listener()
  }

  window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
  window.addEventListener('storage', handleAuthChange)

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    window.removeEventListener('storage', handleAuthChange)
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
