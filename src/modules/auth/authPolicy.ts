export const AUTH_ROLES = {
  APPLICANT: 'APPLICANT',
  COMPANY: 'COMPANY',
  ADMIN: 'ADMIN',
} as const

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES]
export type AuthSessionStatus = 'anonymous' | 'checking' | 'authenticated' | 'unavailable'
export type SessionVerificationFailure = 'invalid-session' | 'verification-unavailable'

interface AccountWithRole {
  role?: unknown
  authMethods?: unknown
  fullName?: unknown
  isComplete?: unknown
  needsProfileCompletion?: unknown
}

export interface GoogleProfileCompletionCandidate {
  needsProfileCompletion?: boolean
  account?: AccountWithRole | null
  profile?: {
    fullName?: string | null
    isComplete?: boolean
  } | null
}

const AUTH_ROLE_VALUES = Object.values(AUTH_ROLES) as string[]
const PLACEHOLDER_FULL_NAME = 'applicant'

export function getInitialAuthStatus(token: string | null): AuthSessionStatus {
  return token ? 'checking' : 'anonymous'
}

export function getAuthRole(account: AccountWithRole | null | undefined): AuthRole | null {
  const role = account?.role
  return typeof role === 'string' && AUTH_ROLE_VALUES.includes(role) ? role as AuthRole : null
}

export function getWorkspacePathForRole(role: AuthRole): string {
  switch (role) {
    case AUTH_ROLES.ADMIN:
      return '/admin'
    case AUTH_ROLES.COMPANY:
      return '/company'
    case AUTH_ROLES.APPLICANT:
      return '/profile'
  }
}

export function getWorkspacePathForAccount(account: AccountWithRole | null | undefined): string {
  const role = getAuthRole(account)
  return role ? getWorkspacePathForRole(role) : '/login'
}

export function isGoogleProfileIncomplete(
  data?: GoogleProfileCompletionCandidate | null,
): boolean {
  const role = getAuthRole(data?.account)
  if (role !== AUTH_ROLES.APPLICANT) return false

  const authMethods = Array.isArray(data?.account?.authMethods)
    ? data.account.authMethods.filter((method): method is string => typeof method === 'string')
    : null
  const hasGoogleMethod = authMethods ? authMethods.includes('GOOGLE') : false
  const explicitNeedsCompletion =
    data?.needsProfileCompletion === true || data?.account?.needsProfileCompletion === true

  if (authMethods && !hasGoogleMethod && !explicitNeedsCompletion) {
    return false
  }

  if (explicitNeedsCompletion) return true
  if (data?.profile?.isComplete === false || data?.account?.isComplete === false) return true

  const hasProfileOrGoogleContext =
    Boolean(data && 'profile' in data && data.profile !== undefined) ||
    typeof data?.account?.fullName === 'string' ||
    hasGoogleMethod

  if (hasProfileOrGoogleContext) {
    const rawFullName =
      typeof data?.profile?.fullName === 'string'
        ? data.profile.fullName
        : typeof data?.account?.fullName === 'string'
          ? data.account.fullName
          : ''
    const fullName = rawFullName.trim()
    if (fullName.length < 2 || fullName.toLowerCase() === PLACEHOLDER_FULL_NAME) {
      return true
    }
  }
  return false
}

export function hydrateAccountWithProfile<TAccount extends Record<string, unknown>>(
  account: TAccount,
  profile?: Record<string, unknown> | null,
  needsProfileCompletion?: boolean,
): TAccount {
  const hydrated: Record<string, unknown> = { ...account }

  if (profile && typeof profile === 'object') {
    const profileFields = ['fullName', 'companyName', 'avatarUrl'] as const
    for (const field of profileFields) {
      if (typeof profile[field] === 'string') {
        hydrated[field] = profile[field]
      }
    }
    if (typeof profile.isComplete === 'boolean') {
      hydrated.isComplete = profile.isComplete
    }
  }

  if (typeof needsProfileCompletion === 'boolean') {
    hydrated.needsProfileCompletion = needsProfileCompletion
  } else if (typeof account.needsProfileCompletion === 'boolean') {
    hydrated.needsProfileCompletion = account.needsProfileCompletion
  } else if (Array.isArray(hydrated.authMethods) && hydrated.authMethods.includes('GOOGLE')) {
    hydrated.needsProfileCompletion = isGoogleProfileIncomplete({
      account: hydrated as AccountWithRole,
      profile: {
        fullName: typeof hydrated.fullName === 'string' ? hydrated.fullName : undefined,
        isComplete: typeof hydrated.isComplete === 'boolean' ? hydrated.isComplete : undefined,
      },
    })
  }

  return hydrated as TAccount
}

export function getGooglePostAuthRedirectPath(
  data?: GoogleProfileCompletionCandidate | null,
): string {
  const role = getAuthRole(data?.account)
  if (!role) return '/login'
  if (isGoogleProfileIncomplete(data)) {
    return '/profile/edit'
  }
  return getWorkspacePathForRole(role)
}

export function isRoleAllowed(role: AuthRole, allowedRoles?: readonly AuthRole[]): boolean {
  return !allowedRoles?.length || allowedRoles.includes(role)
}

export function classifySessionVerificationFailure(status?: number): SessionVerificationFailure {
  return status === 401 || status === 403 ? 'invalid-session' : 'verification-unavailable'
}

export interface GoogleLinkChallenge {
  email: string
  linkToken?: string
}

export function extractGoogleLinkChallenge(source: unknown): GoogleLinkChallenge | null {
  if (typeof source !== 'object' || source === null) return null

  const candidate = 'response' in source
    ? (source as { response?: { status?: unknown; data?: unknown } }).response?.data
    : source

  if (typeof candidate !== 'object' || candidate === null) return null

  const record = candidate as Record<string, unknown>
  const nestedData = typeof record.data === 'object' && record.data !== null
    ? (record.data as Record<string, unknown>)
    : null

  const requireLink = record.requireLink === true
    || nestedData?.requireLink === true
    || record.code === 'GOOGLE_ACCOUNT_LINK_REQUIRED'

  if (!requireLink) return null

  const email = typeof nestedData?.email === 'string' && nestedData.email.trim()
    ? nestedData.email.trim()
    : typeof record.email === 'string' && record.email.trim()
      ? record.email.trim()
      : ''

  if (!email) return null

  const linkToken = typeof nestedData?.linkToken === 'string' && nestedData.linkToken.trim()
    ? nestedData.linkToken.trim()
    : typeof record.linkToken === 'string' && record.linkToken.trim()
      ? record.linkToken.trim()
      : undefined

  return { email, linkToken }
}
