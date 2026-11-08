const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

export interface GoogleCredentialResponse {
  credential?: string
  select_by?: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    ux_mode?: 'popup' | 'redirect'
    context?: 'signin' | 'signup' | 'use'
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon'
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
      shape?: 'rectangular' | 'pill' | 'circle' | 'square'
      width?: number
      logo_alignment?: 'left' | 'center'
    },
  ) => void
  prompt: (momentListener?: (notification: { isNotDisplayed?: () => boolean; isSkippedMoment?: () => boolean }) => void) => void
  disableAutoSelect: () => void
}

declare global {
  interface Window {
    __CVBUDDY_GOOGLE_CLIENT_ID__?: string | null
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
  }
}

export function resolveGoogleClientId(rawValue?: unknown): string | null {
  if (typeof rawValue !== 'string') return null
  const trimmed = rawValue.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getConfiguredGoogleClientId(): string | null {
  if (typeof window !== 'undefined' && '__CVBUDDY_GOOGLE_CLIENT_ID__' in window) {
    return resolveGoogleClientId(window.__CVBUDDY_GOOGLE_CLIENT_ID__)
  }
  const envValue = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_GOOGLE_CLIENT_ID
  return resolveGoogleClientId(envValue)
}

let scriptLoadPromise: Promise<GoogleAccountsId> | null = null

export function loadGoogleIdentityScript(): Promise<GoogleAccountsId> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Google Identity Services requires a browser environment.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id)
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`)
    if (existingScript && existingScript.dataset.gisLoadFailed === 'true') {
      existingScript.remove()
    }

    const activeScript = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`)

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id)
      } else {
        scriptLoadPromise = null
        reject(new Error('Google Sign-In failed to initialize.'))
      }
    }

    const handleError = (event?: Event) => {
      if (event?.currentTarget instanceof HTMLScriptElement) {
        event.currentTarget.dataset.gisLoadFailed = 'true'
      }
      scriptLoadPromise = null
      reject(new Error('Unable to load Google Sign-In script. Check your network connection and try again.'))
    }

    if (activeScript) {
      activeScript.addEventListener('load', handleLoad, { once: true })
      activeScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function disableGoogleAutoSelect() {
  if (typeof window === 'undefined') return
  try {
    window.google?.accounts?.id?.disableAutoSelect?.()
  } catch {
    // Ignore errors if GIS script has not been loaded yet
  }
}
