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
import CvPage from '@/modules/applicant/CvPage'
import AiChatPage from '@/modules/ai/AiChatPage'
import ChangePasswordPage from '@/modules/settings/ChangePasswordPage'
import NotFound from '@/modules/admin/NotFound'
import { ApplicantSectionPage } from '@/modules/applicant/ApplicantSectionPage'
import PortfolioPage from '@/modules/portfolio/PortfolioPage'
import PortfolioFormPage from '@/modules/portfolio/PortfolioFormPage'
import { ExperienceDetailPage, ExperienceFormPage, ExperienceListPage } from '@/modules/portfolio/ExperiencePages'
import { MomentCreatePage, MomentDetailPage, MomentListPage } from '@/modules/portfolio/MomentPages'
import PublicPortfolioPage from '@/modules/portfolio/PublicPortfolioPage'
import {
  PortfolioCollectionDetailPage,
  PortfolioCollectionFormPage,
} from '@/modules/portfolio/PortfolioCollectionPages'

const appRoutes = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'home', element: <Navigate to="/#home" replace /> },
      { path: 'about-us', element: <Navigate to="/#about-us" replace /> },
      { path: 'project', element: <Navigate to="/#project" replace /> },
      { path: 'ai-buddy', element: <Navigate to="/#ai-buddy" replace /> },
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
  { path: 'p/:slug', element: <PublicPortfolioPage /> },
  { path: 'portfolio/:slug', element: <PublicPortfolioPage /> },
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
          { path: 'cv', element: <CvPage /> },
          { path: 'ai-chat', element: <AiChatPage /> },
          { path: 'portfolio', element: <PortfolioPage /> },
          { path: 'portfolio/new', element: <PortfolioCollectionFormPage /> },
          { path: 'portfolio/manage/:portfolioId', element: <PortfolioCollectionDetailPage /> },
          { path: 'portfolio/manage/:portfolioId/edit', element: <PortfolioCollectionFormPage /> },
          { path: 'portfolio/edit', element: <PortfolioFormPage /> },
          { path: 'portfolio/experiences', element: <ExperienceListPage /> },
          { path: 'portfolio/experiences/new', element: <ExperienceFormPage /> },
          { path: 'portfolio/experiences/:experienceId/edit', element: <ExperienceFormPage /> },
          { path: 'portfolio/experiences/:experienceId', element: <ExperienceDetailPage /> },
          { path: 'portfolio/moments', element: <MomentListPage /> },
          { path: 'portfolio/moments/new', element: <MomentCreatePage /> },
          { path: 'portfolio/moments/:momentId', element: <MomentDetailPage /> },
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
