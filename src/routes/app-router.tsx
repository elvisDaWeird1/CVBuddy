import { createBrowserRouter, Navigate } from 'react-router'
import { MainLayout } from '@/layouts/ClientLayout/ClientLayout'
import { AuthShell } from '@/layouts/ClientLayout/AuthShell'
import { ApplicantShell } from '@/layouts/ClientLayout/ApplicantShell'
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute'
import LandingPage from '@/modules/pages/LandingPage'
import ComingSoonPage from '@/modules/pages/ComingSoon'
import LoginPage from '@/modules/auth/LoginPage'
import RegisterApplicantPage from '@/modules/auth/RegisterApplicantPage'
import ApplicantProfilePage from '@/modules/applicant/ApplicantProfilePage'
import EditProfilePage from '@/modules/applicant/EditProfilePage'
import ChangePasswordPage from '@/modules/settings/ChangePasswordPage'
import NotFound from '@/modules/admin/NotFound'
import { ApplicantSectionPage } from '@/modules/applicant/ApplicantSectionPage'

const appRoutes = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'home', element: <Navigate to="/#home" replace /> },
      { path: 'about-us', element: <Navigate to="/#about-us" replace /> },
      { path: 'project', element: <Navigate to="/#project" replace /> },
      { path: 'ai-buddy', element: <Navigate to="/#ai-buddy" replace /> },
      { path: 'form', element: <Navigate to="/#form" replace /> },
      { path: 'coming-soon', element: <ComingSoonPage /> },
    ],
  },
  {
    element: <AuthShell />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterApplicantPage /> },
      { path: 'register/applicant', element: <RegisterApplicantPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ApplicantShell />,
        children: [
          {
            path: 'explore',
            element: (
              <ApplicantSectionPage
                title="Explore"
                description="Start from your applicant workspace and move into profile, CV, or portfolio updates."
                primaryLabel="Open Profile"
                primaryTo="/profile"
                secondaryLabel="Open CV"
                secondaryTo="/cv"
              />
            ),
          },
          { path: 'profile', element: <ApplicantProfilePage /> },
          { path: 'applicant/profile', element: <ApplicantProfilePage /> },
          {
            path: 'cv',
            element: (
              <ApplicantSectionPage
                title="CV"
                description="Your CV workspace is ready for the next implementation step."
                primaryLabel="Back to Profile"
                primaryTo="/profile"
                secondaryLabel="Go to Portfolio"
                secondaryTo="/portfolio"
              />
            ),
          },
          {
            path: 'portfolio',
            element: (
              <ApplicantSectionPage
                title="Portfolio"
                description="Your portfolio workspace is ready for the next implementation step."
                primaryLabel="Back to Profile"
                primaryTo="/profile"
                secondaryLabel="Go to CV"
                secondaryTo="/cv"
              />
            ),
          },
          { path: 'applicant/cv', element: <Navigate to="/cv" replace /> },
          { path: 'applicant/portfolio', element: <Navigate to="/portfolio" replace /> },
          { path: 'profile/edit', element: <EditProfilePage /> },
          { path: 'applicant/profile/edit', element: <EditProfilePage /> },
          { path: 'change-password', element: <ChangePasswordPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]

export const appRouter = createBrowserRouter(appRoutes)