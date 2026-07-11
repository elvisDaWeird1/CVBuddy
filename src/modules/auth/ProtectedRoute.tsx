import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthSession } from './useAuthSession'

export function ProtectedRoute() {
  const location = useLocation()
  const { token } = useAuthSession()

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
