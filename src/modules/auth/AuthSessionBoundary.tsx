import { useEffect, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { getAuthApiErrorStatus, getCurrentAuthSession, type AuthAccount } from './authApi'
import {
  clearAuthSession,
  confirmAuthSession,
  markAuthSessionUnavailable,
  retryAuthSessionVerification,
  setAuthMessage,
} from './authStorage'
import { classifySessionVerificationFailure, getAuthRole } from './authPolicy'
import { useAuthSession } from './useAuthSession'

interface AuthSessionBoundaryProps {
  children: ReactNode
}

let pendingVerification: { token: string; request: ReturnType<typeof getCurrentAuthSession> } | null = null

function verifyToken(token: string) {
  if (pendingVerification?.token === token) return pendingVerification.request

  const request = getCurrentAuthSession().finally(() => {
    if (pendingVerification?.request === request) pendingVerification = null
  })
  pendingVerification = { token, request }
  return request
}

function hydrateAccount(account: AuthAccount, profile?: Record<string, unknown> | null): AuthAccount {
  if (!profile) return account

  const profileFields = ['fullName', 'companyName', 'avatarUrl'] as const
  const hydratedAccount = { ...account }

  for (const field of profileFields) {
    if (typeof profile[field] === 'string') hydratedAccount[field] = profile[field]
  }

  return hydratedAccount
}

export function AuthSessionBoundary({ children }: AuthSessionBoundaryProps) {
  const { token, status } = useAuthSession()

  useEffect(() => {
    if (!token || status !== 'checking') return

    let active = true

    void verifyToken(token)
      .then((response) => {
        if (!active) return

        const account = response.data?.account
        if (!response.success || !account || !getAuthRole(account)) {
          setAuthMessage('Your session could not be verified. Please sign in again.')
          clearAuthSession()
          return
        }

        confirmAuthSession(token, hydrateAccount(account, response.data?.profile))
      })
      .catch((error) => {
        if (!active) return

        const failure = classifySessionVerificationFailure(getAuthApiErrorStatus(error))
        if (failure === 'invalid-session') {
          setAuthMessage(
            getAuthApiErrorStatus(error) === 403
              ? 'Your account is not available. Please contact support or sign in with another account.'
              : 'Your session is invalid or has expired. Please sign in again.',
          )
          clearAuthSession()
          return
        }

        markAuthSessionUnavailable(token)
      })

    return () => {
      active = false
    }
  }, [status, token])

  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)] px-4" aria-busy="true">
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-teal)]" aria-hidden="true" />
          <p className="mt-4 font-semibold text-[var(--color-navy)]">Verifying your session...</p>
        </div>
      </main>
    )
  }

  if (status === 'unavailable' && token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)] px-4">
        <section className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-6 text-center shadow-[var(--shadow-lg)]" aria-labelledby="session-unavailable-title">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]" id="session-unavailable-title">We could not verify your session</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            CVBuddy may be temporarily unavailable. Retry without losing your saved sign-in, or sign out on this device.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => retryAuthSessionVerification(token)} type="button">Retry verification</Button>
            <Button onClick={clearAuthSession} type="button" variant="secondary">Sign out</Button>
          </div>
        </section>
      </main>
    )
  }

  return children
}
