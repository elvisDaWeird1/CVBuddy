import { createElement, lazy, type ComponentType } from 'react'
import { Navigate } from 'react-router-dom'

const lazyRouteElement = (loader: () => Promise<{ default: ComponentType }>) =>
  createElement(lazy(loader))

export const routeConfig = [
  { path: '/', element: lazyRouteElement(() => import('@/modules/pages/LandingPage.tsx')) },
  { path: '/home', element: createElement(Navigate, { to: '/#home', replace: true }) },
  { path: '/about-us', element: createElement(Navigate, { to: '/#about-us', replace: true }) },
  { path: '/project', element: createElement(Navigate, { to: '/#project', replace: true }) },
  { path: '/ai-buddy', element: createElement(Navigate, { to: '/#ai-buddy', replace: true }) },
  { path: '/form', element: createElement(Navigate, { to: '/#form', replace: true }) },
  { path: '/coming-soon', element: lazyRouteElement(() => import('@/modules/pages/ComingSoon.tsx')) },
  { path: '/login', element: lazyRouteElement(() => import('@/modules/auth/LoginPage.tsx')) },
  { path: '/register/applicant', element: lazyRouteElement(() => import('@/modules/auth/RegisterApplicantPage.tsx')) },
  { path: '/applicant/profile', element: lazyRouteElement(() => import('@/modules/applicant/ApplicantProfilePage.tsx')) },
  { path: '/applicant/profile/edit', element: lazyRouteElement(() => import('@/modules/applicant/EditProfilePage.tsx')) },
  { path: '/change-password', element: lazyRouteElement(() => import('@/modules/settings/ChangePasswordPage.tsx')) },
  { path: '*', element: lazyRouteElement(() => import('@/modules/admin/NotFound.tsx')) },
] as const
