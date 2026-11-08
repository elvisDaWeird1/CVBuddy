import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LockIcon } from '@/components/ui/icons'
import {
  authenticateWithGoogle,
  extractGoogleLinkChallenge,
  getAuthApiErrorMessage,
  linkGoogleAccount,
  type GoogleAuthResponseData,
} from './authApi'
import { getAuthRole, getGooglePostAuthRedirectPath } from './authPolicy'
import { saveAuthSession } from './authStorage'
import {
  getConfiguredGoogleClientId,
  loadGoogleIdentityScript,
  type GoogleCredentialResponse,
} from './googleIdentity'

export interface GoogleAuthSectionProps {
  mode?: 'signin' | 'signup'
  onStatusChange?: (status: { type: 'success' | 'error'; message: string } | null) => void
}

interface PendingLinkState {
  idToken: string
  email: string
  linkToken?: string
}

const GIS_UNCONFIGURED_MESSAGE =
  'Google Sign-In is not configured in this environment (VITE_GOOGLE_CLIENT_ID is missing).'
const FOCUSABLE_SELECTOR =
  'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

function getDialogFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  )
}
const GIS_LOAD_FAILED_MESSAGE =
  'Unable to load Google Sign-In. Please check your network connection or use email and password.'

function GoogleLogoIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  )
}

export function GoogleAuthSection({ mode = 'signin', onStatusChange }: GoogleAuthSectionProps) {
  const navigate = useNavigate()
  const sectionContainerRef = useRef<HTMLDivElement | null>(null)
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const fallbackButtonRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)
  const isBusyRef = useRef(false)

  const clientId = getConfiguredGoogleClientId()

  const [isSdkReady, setIsSdkReady] = useState(false)
  const [sdkLoadError, setSdkLoadError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [pendingLink, setPendingLink] = useState<PendingLinkState | null>(null)
  const [linkPassword, setLinkPassword] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)

  const captureFocusBeforeModal = useCallback(() => {
    if (
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
    ) {
      triggerElementRef.current = document.activeElement
      return
    }
    triggerElementRef.current = fallbackButtonRef.current ?? sectionContainerRef.current
  }, [])

  const restoreFocusAfterModal = useCallback(() => {
    const target =
      triggerElementRef.current && document.contains(triggerElementRef.current)
        ? triggerElementRef.current
        : fallbackButtonRef.current ??
          buttonContainerRef.current?.querySelector<HTMLElement>('button, [role="button"], iframe') ??
          sectionContainerRef.current

    if (target && typeof target.focus === 'function') {
      target.focus()
    }
  }, [])

  const openPendingLinkModal = useCallback(
    (nextState: PendingLinkState) => {
      captureFocusBeforeModal()
      setPendingLink(nextState)
      setLinkPassword('')
      setLinkError(null)
    },
    [captureFocusBeforeModal],
  )

  const completeAuthenticatedSession = useCallback(
    (data?: GoogleAuthResponseData) => {
      const role = getAuthRole(data?.account)
      if (!data?.token || !data.account || !role) {
        throw new Error('Unable to complete Google sign-in. Please try again.')
      }

      const enrichedAccount = {
        ...data.account,
        ...(data.profile?.fullName ? { fullName: data.profile.fullName } : {}),
        ...(data.profile?.avatarUrl ? { avatarUrl: data.profile.avatarUrl } : {}),
        ...(typeof data.profile?.isComplete === 'boolean' ? { isComplete: data.profile.isComplete } : {}),
        ...(typeof data.needsProfileCompletion === 'boolean'
          ? { needsProfileCompletion: data.needsProfileCompletion }
          : {}),
      }

      saveAuthSession({
        token: data.token,
        account: enrichedAccount,
        needsProfileCompletion: data.needsProfileCompletion,
        profile: data.profile,
      })

      navigate(getGooglePostAuthRedirectPath(data), { replace: true })
    },
    [navigate],
  )

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (isBusyRef.current) {
        return
      }

      const idToken = response?.credential?.trim()
      if (!idToken) {
        onStatusChange?.({
          type: 'error',
          message: 'Google sign-in was cancelled or did not return a valid credential.',
        })
        return
      }

      isBusyRef.current = true
      onStatusChange?.(null)
      setIsAuthenticating(true)

      try {
        const result = await authenticateWithGoogle({ idToken })
        const challenge = extractGoogleLinkChallenge(result)
        if (challenge) {
          openPendingLinkModal({
            idToken,
            email: challenge.email,
            linkToken: challenge.linkToken,
          })
          return
        }

        completeAuthenticatedSession(result.data)
      } catch (error) {
        const challenge = extractGoogleLinkChallenge(error)
        if (challenge) {
          openPendingLinkModal({
            idToken,
            email: challenge.email,
            linkToken: challenge.linkToken,
          })
          return
        }

        onStatusChange?.({
          type: 'error',
          message: getAuthApiErrorMessage(
            error,
            'Unable to sign in with Google right now. Please try again.',
          ),
        })
      } finally {
        isBusyRef.current = false
        setIsAuthenticating(false)
      }
    },
    [completeAuthenticatedSession, onStatusChange, openPendingLinkModal],
  )

  useEffect(() => {
    if (!clientId) return

    let isMounted = true

    loadGoogleIdentityScript()
      .then((googleId) => {
        if (!isMounted || !buttonContainerRef.current) return

        setSdkLoadError(null)
        googleId.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode === 'signup' ? 'signup' : 'signin',
        })

        buttonContainerRef.current.innerHTML = ''
        googleId.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(buttonContainerRef.current.clientWidth || 360, 400),
          logo_alignment: 'left',
        })

        setIsSdkReady(true)
      })
      .catch(() => {
        if (isMounted) {
          setIsSdkReady(false)
          setSdkLoadError(GIS_LOAD_FAILED_MESSAGE)
          onStatusChange?.({
            type: 'error',
            message: GIS_LOAD_FAILED_MESSAGE,
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [clientId, handleGoogleCredential, mode, onStatusChange])

  const closeLinkModal = useCallback(() => {
    if (isLinking || isBusyRef.current) return
    setPendingLink(null)
    setLinkPassword('')
    setLinkError(null)
    queueMicrotask(() => {
      restoreFocusAfterModal()
    })
  }, [isLinking, restoreFocusAfterModal])

  useEffect(() => {
    if (!pendingLink) return

    const focusTimer = window.setTimeout(() => {
      const initialTarget =
        passwordInputRef.current && !passwordInputRef.current.disabled
          ? passwordInputRef.current
          : getDialogFocusableElements(dialogRef.current)[0] ?? dialogRef.current
      initialTarget?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isLinking && !isBusyRef.current) {
          closeLinkModal()
        }
        return
      }

      if (event.key === 'Tab') {
        const dialogElement = dialogRef.current
        const focusables = getDialogFocusableElements(dialogElement)
        if (focusables.length === 0) {
          event.preventDefault()
          dialogElement?.focus()
          return
        }

        const firstElement = focusables[0]
        const lastElement = focusables[focusables.length - 1]
        const activeElement = document.activeElement as HTMLElement | null
        const isInsideDialog = Boolean(activeElement && dialogElement?.contains(activeElement))

        if (event.shiftKey) {
          if (!isInsideDialog || activeElement === firstElement || activeElement === dialogElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else if (!isInsideDialog || activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      const dialogElement = dialogRef.current
      const target = event.target as Node | null
      if (!dialogElement || !target || dialogElement.contains(target)) {
        return
      }
      const fallbackTarget =
        passwordInputRef.current && !passwordInputRef.current.disabled
          ? passwordInputRef.current
          : getDialogFocusableElements(dialogElement)[0] ?? dialogElement
      fallbackTarget?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [pendingLink, isLinking, closeLinkModal])

  const handleFallbackClick = () => {
    if (isBusyRef.current || isAuthenticating || isLinking) {
      return
    }

    if (!clientId) {
      onStatusChange?.({
        type: 'error',
        message: GIS_UNCONFIGURED_MESSAGE,
      })
      return
    }

    if (sdkLoadError) {
      onStatusChange?.({
        type: 'error',
        message: sdkLoadError,
      })
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
      return
    }

    onStatusChange?.({
      type: 'error',
      message: 'Google Sign-In is still loading. Please check your connection and try again.',
    })
  }

  const handleLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pendingLink || isLinking || isBusyRef.current) return

    if (!linkPassword.trim()) {
      setLinkError('Please enter your current CVBuddy password to confirm account linking.')
      return
    }

    if (!pendingLink.linkToken?.trim()) {
      setLinkError('Google account link session is invalid or has expired. Please sign in with Google again.')
      return
    }

    isBusyRef.current = true
    setLinkError(null)
    setIsLinking(true)

    try {
      const response = await linkGoogleAccount({
        idToken: pendingLink.idToken,
        password: linkPassword,
        linkToken: pendingLink.linkToken,
      })

      setPendingLink(null)
      setLinkPassword('')
      completeAuthenticatedSession(response.data)
    } catch (error) {
      setLinkError(
        getAuthApiErrorMessage(
          error,
          'Unable to link your Google account. Please verify your password and try again.',
        ),
      )
    } finally {
      isBusyRef.current = false
      setIsLinking(false)
    }
  }

  return (
    <div ref={sectionContainerRef} tabIndex={-1} className="mt-4 outline-none">
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-[var(--color-border)]" />
        <span className="bg-[var(--color-white)] px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          Or
        </span>
        <div className="w-full border-t border-[var(--color-border)]" />
      </div>

      <div className="flex flex-col items-center">
        <div
          ref={buttonContainerRef}
          className={
            clientId && isSdkReady
              ? `flex w-full justify-center ${
                  isAuthenticating || isLinking ? 'pointer-events-none opacity-60' : ''
                }`
              : 'hidden'
          }
          aria-busy={isAuthenticating || isLinking}
        />

        {(!clientId || !isSdkReady) && (
          <Button
            ref={fallbackButtonRef}
            type="button"
            variant="outline"
            loading={isAuthenticating}
            disabled={isAuthenticating || isLinking}
            onClick={handleFallbackClick}
            className="h-11 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-white)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]"
            iconLeft={<GoogleLogoIcon />}
          >
            Continue with Google
          </Button>
        )}
      </div>

      {pendingLink && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-link-dialog-title"
          aria-describedby="google-link-dialog-description"
        >
          <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-xl)]">
            <h3
              id="google-link-dialog-title"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              Link Google to your existing account
            </h3>
            <p
              id="google-link-dialog-description"
              className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]"
            >
              An account for <strong className="text-[var(--color-text-primary)]">{pendingLink.email}</strong> already
              exists. Enter your current CVBuddy password once to link Google Sign-In to this account.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleLinkSubmit} noValidate>
              <Input
                ref={passwordInputRef}
                id="google-link-password"
                label="Current Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your CVBuddy password"
                size="md"
                disabled={isLinking}
                aria-invalid={Boolean(linkError)}
                aria-describedby={
                  linkError
                    ? 'google-link-dialog-description google-link-error'
                    : 'google-link-dialog-description'
                }
                leftIcon={<LockIcon className="h-5 w-5" />}
                value={linkPassword}
                onChange={(event) => setLinkPassword(event.target.value)}
                state={linkError ? 'error' : 'default'}
                className="border-transparent bg-[var(--color-bg-main)] text-base focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)]"
              />

              {linkError && (
                <p
                  id="google-link-error"
                  role="alert"
                  aria-live="assertive"
                  className="rounded-[var(--radius-lg)] bg-[var(--color-bg-soft)] px-3 py-2 text-xs font-medium text-[var(--color-error)]"
                >
                  {linkError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLinking}
                  onClick={closeLinkModal}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isLinking} disabled={isLinking}>
                  Confirm &amp; Link Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
