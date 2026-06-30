import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthToken } from './authStorage'

export function ProtectedRoute() {
  const location = useLocation()

  if (!getAuthToken()) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}