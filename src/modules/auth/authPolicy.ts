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
}

const AUTH_ROLE_VALUES = Object.values(AUTH_ROLES) as string[]

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

export function isRoleAllowed(role: AuthRole, allowedRoles?: readonly AuthRole[]): boolean {
  return !allowedRoles?.length || allowedRoles.includes(role)
}

export function classifySessionVerificationFailure(status?: number): SessionVerificationFailure {
  return status === 401 || status === 403 ? 'invalid-session' : 'verification-unavailable'
}
