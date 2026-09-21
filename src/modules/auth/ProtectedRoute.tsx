import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthRole, getWorkspacePathForRole, isRoleAllowed, type AuthRole } from './authPolicy'
import { useAuthSession } from './useAuthSession'

interface ProtectedRouteProps {
  allowedRoles?: readonly AuthRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { token, account, status } = useAuthSession()

  if (!token || !account || status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  const role = getAuthRole(account)
  if (!role) return <Navigate replace to="/login" />

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Navigate replace to={getWorkspacePathForRole(role)} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { token, account, status } = useAuthSession()
  const role = status === 'authenticated' && token ? getAuthRole(account) : null

  return role ? <Navigate replace to={getWorkspacePathForRole(role)} /> : <Outlet />
}
