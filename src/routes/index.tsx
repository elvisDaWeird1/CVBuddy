import { lazy } from 'react'

const Home = lazy(() => import('@/modules/pages/Home.tsx') as Promise<{ default: React.FC }>)
const AboutUs = lazy(() => import('@/modules/pages/AboutUs.tsx') as Promise<{ default: React.FC }>)
const Project = lazy(() => import('@/modules/pages/Project.tsx') as Promise<{ default: React.FC }>)
const AiBuddy = lazy(() => import('@/modules/pages/AiBuddy.tsx') as Promise<{ default: React.FC }>)
const FormPage = lazy(() => import('@/modules/pages/FormPage.tsx') as Promise<{ default: React.FC }>)
const ComingSoon = lazy(() => import('@/modules/pages/ComingSoon.tsx') as Promise<{ default: React.FC }>)
const NotFound = lazy(() => import('@/modules/admin/NotFound.tsx') as Promise<{ default: React.FC }>)

export const routeConfig = [
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/about-us', element: <AboutUs /> },
  { path: '/project', element: <Project /> },
  { path: '/ai-buddy', element: <AiBuddy /> },
  { path: '/form', element: <FormPage /> },
  { path: '/coming-soon', element: <ComingSoon /> },
  { path: '*', element: <NotFound /> },
] as const
