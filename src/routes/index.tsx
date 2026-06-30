import { createElement, lazy, type ComponentType } from 'react'

const lazyRouteElement = (loader: () => Promise<{ default: ComponentType }>) =>
  createElement(lazy(loader))

export const routeConfig = [
  { path: '/', element: lazyRouteElement(() => import('@/modules/pages/Home.tsx')) },
  { path: '/coming-soon', element: lazyRouteElement(() => import('@/modules/pages/ComingSoon.tsx')) },
  { path: '/login', element: lazyRouteElement(() => import('@/modules/auth/LoginPage.tsx')) },
  { path: '/register/applicant', element: lazyRouteElement(() => import('@/modules/auth/RegisterApplicantPage.tsx')) },
  { path: '/applicant/profile', element: lazyRouteElement(() => import('@/modules/applicant/ApplicantProfilePage.tsx')) },
  { path: '/applicant/profile/edit', element: lazyRouteElement(() => import('@/modules/applicant/EditProfilePage.tsx')) },
  { path: '/change-password', element: lazyRouteElement(() => import('@/modules/settings/ChangePasswordPage.tsx')) },
  { path: '*', element: lazyRouteElement(() => import('@/modules/admin/NotFound.tsx')) },
] as const
