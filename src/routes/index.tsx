import { lazy } from 'react'
const Home = lazy(() => import('@/modules/admin/Home.tsx') as Promise<{ default: React.FC }>)
const NotFound = lazy(() => import('@/modules/admin/NotFound.tsx') as Promise<{ default: React.FC }>)

export const routeConfig = [
  { path: '/', element: <Home /> },
  { path: '*', element: <NotFound /> },
] as const
