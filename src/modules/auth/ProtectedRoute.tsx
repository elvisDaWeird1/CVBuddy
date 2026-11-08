import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  getAuthRole,
  getGooglePostAuthRedirectPath,
  getWorkspacePathForRole,
  isRoleAllowed,
  type AuthRole,
} from './authPolicy'
import { useAuthSession } from './useAuthSession'

interface ProtectedRouteProps {
  allowedRoles?: readonly AuthRole[]
}

const PROFILE_EDIT_PATHS = new Set(['/profile/edit', '/applicant/profile/edit'])

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { token, account, status } = useAuthSession()

  if (!token || !account || status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  const role = getAuthRole(account)
  if (!role) return <Navigate replace to="/login" />

  const targetWorkspacePath =
    account.authMethods?.includes('GOOGLE') || typeof account.needsProfileCompletion === 'boolean'
      ? getGooglePostAuthRedirectPath({
          needsProfileCompletion:
            typeof account.needsProfileCompletion === 'boolean' ? account.needsProfileCompletion : undefined,
          account,
          profile: {
            fullName: typeof account.fullName === 'string' ? account.fullName : undefined,
            isComplete: typeof account.isComplete === 'boolean' ? account.isComplete : undefined,
          },
        })
      : getWorkspacePathForRole(role)

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Navigate replace to={targetWorkspacePath} />
  }

  if (
    targetWorkspacePath === '/profile/edit' &&
    !PROFILE_EDIT_PATHS.has(location.pathname)
  ) {
    return <Navigate replace to="/profile/edit" />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { token, account, status } = useAuthSession()
  const role = status === 'authenticated' && token ? getAuthRole(account) : null

  if (!role) return <Outlet />

  const redirectTo =
    account?.authMethods?.includes('GOOGLE') || typeof account?.needsProfileCompletion === 'boolean'
      ? getGooglePostAuthRedirectPath({
          needsProfileCompletion:
            typeof account?.needsProfileCompletion === 'boolean' ? account.needsProfileCompletion : undefined,
          account,
          profile: {
            fullName: typeof account?.fullName === 'string' ? account.fullName : undefined,
            isComplete: typeof account?.isComplete === 'boolean' ? account.isComplete : undefined,
          },
        })
      : getWorkspacePathForRole(role)

  return <Navigate replace to={redirectTo} />
}
