import { lazy } from 'react'

const Home = lazy(() => import('@/modules/pages/Home.tsx'))
const AboutUs = lazy(() => import('@/modules/pages/AboutUs.tsx'))
const Project = lazy(() => import('@/modules/pages/Project.tsx'))
const AiBuddy = lazy(() => import('@/modules/pages/AiBuddy.tsx'))
const FormPage = lazy(() => import('@/modules/pages/FormPage.tsx'))
const ComingSoon = lazy(() => import('@/modules/pages/ComingSoon.tsx'))
const NotFound = lazy(() => import('@/modules/admin/NotFound.tsx'))

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
