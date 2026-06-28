# CVBuddy Frontend MVP Plan

## 1. Purpose

This document is the main frontend implementation plan for the **CVBuddy MVP**.

CVBuddy is a career support platform for applicants, early-career users, and companies. The frontend must provide user interfaces for:

- Public landing page.
- Authentication for Applicant, Company, and Admin.
- Applicant profile management.
- CV upload and CV management.
- AI CV feedback, CV scoring, CV translation, and AI result history.
- Portfolio creation and portfolio item management.
- Mobile-photo-style portfolio upload flow.
- Job listing and job detail.
- Company job management.
- Applicant job application flow.
- Notifications.
- Feedback form.

This frontend repository is separate from the backend repository. Do not edit backend files from this repo.

---

## 2. Source of Truth

Frontend Codex must read these files first:

1. `README.md`
2. `FRONTEND_MVP_PLAN.md`
3. Backend API documentation, if copied into this frontend repo
4. Backend `BACKEND_MVP_PLAN.md`, if copied into `docs/`
5. Backend `.env.example` or API base URL note, if available

Important rule:

- `FRONTEND_MVP_PLAN.md` is the source of truth for frontend implementation.
- Backend documentation is only used to understand API endpoints, response format, roles, and MVP scope.
- Do not change backend database design.
- Do not add frontend features outside MVP unless approved.

---

## 3. Current Naming Rule

CVBuddy originally used `student` in some older documents. The project has shifted to a broader audience, so the main user role must now be called:

```txt
Applicant
```

Use these names in frontend code:

```txt
applicant
Applicant
APPLICANT
applicantProfile
ApplicantProfile
```

Do not use these names in new code:

```txt
student
Student
STUDENT
studentProfile
StudentProfile
student_profiles
student_profile_id
```

If an old backend document still contains `student`, treat it as legacy wording and map it to `applicant` in frontend code.

---

## 4. Frontend Stack

Use the existing frontend stack if already configured.

If the frontend is not set up yet, use:

```txt
React
Vite
TypeScript
React Router
Axios
Tailwind CSS
Zod
```

Optional later, only if needed:

```txt
React Hook Form
TanStack Query
Lucide React
```

Do not add heavy UI frameworks unless the user approves.

---

## 5. MVP Roles

The frontend must support these roles:

```txt
APPLICANT
COMPANY
ADMIN
```

Role meaning:

- `APPLICANT`: main user who manages CV, AI results, portfolio, job applications, and notifications.
- `COMPANY`: company/recruiter who manages company profile, jobs, applicants, and application statuses.
- `ADMIN`: system admin. Admin UI is not a priority in the first frontend phases unless requested.

---

## 6. MVP Modules

Frontend MVP scope includes:

1. Public pages
2. Authentication
3. Applicant profile
4. Company profile
5. CV management
6. AI result pages
7. Portfolio
8. Portfolio item/photo upload
9. Jobs
10. Applications
11. Notifications
12. Feedback

Do not implement future features unless requested:

- OAuth login
- Forgot password
- Email verification
- Admin dashboard
- Job approval
- Company verification
- Saved jobs
- CV versioning
- AI matched candidates
- Advanced moderation
- Reports
- System announcements
- Complex analytics

---

## 7. Suggested Folder Structure

If no frontend structure exists, use this structure:

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  components/
    common/
      Button.tsx
      Input.tsx
      Loading.tsx
      EmptyState.tsx
      ErrorState.tsx
    layout/
      MainLayout.tsx
      AuthLayout.tsx
      DashboardLayout.tsx
      ProtectedRoute.tsx

  constants/
    roles.ts
    routes.ts
    storageKeys.ts

  features/
    auth/
      api/
        authApi.ts
      pages/
        LoginPage.tsx
        RegisterApplicantPage.tsx
        RegisterCompanyPage.tsx
      types/
        auth.types.ts

    applicantProfile/
      api/
        applicantProfileApi.ts
      pages/
        ApplicantProfilePage.tsx
      types/
        applicantProfile.types.ts

    companyProfile/
      api/
        companyProfileApi.ts
      pages/
        CompanyProfilePage.tsx
      types/
        companyProfile.types.ts

    cvs/
      api/
        cvApi.ts
      pages/
        CVListPage.tsx
        CVDetailPage.tsx
      types/
        cv.types.ts

    ai/
      api/
        aiApi.ts
      pages/
        AIResultsPage.tsx
        AIResultDetailPage.tsx
      types/
        ai.types.ts

    portfolios/
      api/
        portfolioApi.ts
      pages/
        PortfolioPage.tsx
        PublicPortfolioPage.tsx
      types/
        portfolio.types.ts

    jobs/
      api/
        jobApi.ts
      pages/
        JobListPage.tsx
        JobDetailPage.tsx
        CompanyJobManagementPage.tsx
      types/
        job.types.ts

    applications/
      api/
        applicationApi.ts
      pages/
        MyApplicationsPage.tsx
        CompanyApplicationsPage.tsx
      types/
        application.types.ts

    notifications/
      api/
        notificationApi.ts
      pages/
        NotificationsPage.tsx
      types/
        notification.types.ts

    feedbacks/
      api/
        feedbackApi.ts
      pages/
        FeedbackPage.tsx
      types/
        feedback.types.ts

  lib/
    api/
      apiClient.ts
      endpoints.ts
      apiResponse.types.ts
    auth/
      tokenStorage.ts
      authStorage.ts
    utils/
      formatDate.ts
      formatFileSize.ts
      cn.ts

  pages/
    LandingPage.tsx
    NotFoundPage.tsx

  styles/
    globals.css

  main.tsx
```

If a structure already exists, keep it and adapt this plan to the current structure.

---

## 8. Environment Variables

Create `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Local `.env` example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Rules:

- Do not hardcode the backend URL in components.
- Do not commit real secret values.
- Frontend should only store public config values.

---

## 9. API Client Plan

Create:

```txt
src/lib/api/apiClient.ts
```

Requirements:

- Use Axios.
- Base URL comes from `import.meta.env.VITE_API_BASE_URL`.
- Attach token if available.
- Use `Authorization: Bearer <token>`.
- Handle 401 globally if possible.
- Keep API error shape consistent.
- Do not call backend directly from components if there is a feature API file.

Example structure:

```txt
components/pages -> feature api -> apiClient -> backend
```

---

## 10. Token Storage Plan

Create:

```txt
src/lib/auth/tokenStorage.ts
```

Required functions:

```ts
getAccessToken()
setAccessToken(token: string)
removeAccessToken()
```

For MVP, token can be stored in `localStorage`.

Use a constant key:

```ts
CVBUDDY_ACCESS_TOKEN
```

---

## 11. Shared Types

Create shared response type:

```txt
src/lib/api/apiResponse.types.ts
```

Backend response format:

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
};
```

Pagination format:

```ts
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
};
```

---

## 12. Route Constants

Create:

```txt
src/constants/routes.ts
```

Routes:

```ts
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER_APPLICANT: "/register/applicant",
  REGISTER_COMPANY: "/register/company",

  APPLICANT_PROFILE: "/applicant/profile",
  COMPANY_PROFILE: "/company/profile",

  CVS: "/cvs",
  CV_DETAIL: "/cvs/:cvId",

  AI_RESULTS: "/ai/results",
  AI_RESULT_DETAIL: "/ai/results/:aiResultId",

  PORTFOLIO: "/portfolio",
  PUBLIC_PORTFOLIO: "/portfolio/public/:portfolioId",

  JOBS: "/jobs",
  JOB_DETAIL: "/jobs/:jobId",
  COMPANY_JOBS: "/company/jobs",

  MY_APPLICATIONS: "/applications/me",
  COMPANY_APPLICATIONS: "/company/applications",

  NOTIFICATIONS: "/notifications",
  FEEDBACK: "/feedback",
} as const;
```

---

## 13. Role Constants

Create:

```txt
src/constants/roles.ts
```

```ts
export const ROLES = {
  APPLICANT: "APPLICANT",
  COMPANY: "COMPANY",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
```

Do not use `STUDENT`.

---

## 14. Pages in MVP

### Public pages

- `LandingPage`
- `LoginPage`
- `RegisterApplicantPage`
- `RegisterCompanyPage`
- `JobListPage`
- `JobDetailPage`
- `PublicPortfolioPage`
- `FeedbackPage`
- `NotFoundPage`

### Applicant pages

- `ApplicantProfilePage`
- `CVListPage`
- `CVDetailPage`
- `AIResultsPage`
- `AIResultDetailPage`
- `PortfolioPage`
- `MyApplicationsPage`
- `NotificationsPage`

### Company pages

- `CompanyProfilePage`
- `CompanyJobManagementPage`
- `CompanyApplicationsPage`
- `NotificationsPage`

### Admin pages

Admin pages are not required in the first frontend MVP unless requested.

---

## 15. Frontend API Endpoints Reference

Use these endpoint names as frontend reference. Confirm with backend before final integration.

### Auth

```txt
POST /api/auth/register/applicant
POST /api/auth/register/company
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PATCH /api/auth/change-password
```

### Applicant profile

```txt
GET   /api/applicant-profile/me
PATCH /api/applicant-profile/me
```

### Company profile

```txt
GET   /api/company-profile/me
PATCH /api/company-profile/me
```

### CV

```txt
POST   /api/cvs
GET    /api/cvs
GET    /api/cvs/:id
DELETE /api/cvs/:id
```

### AI

```txt
POST /api/ai/cvs/:cvId/feedback
POST /api/ai/cvs/:cvId/score
POST /api/ai/cvs/:cvId/translate-to-english
POST /api/ai/jobs/recommendations
GET  /api/ai/results
GET  /api/ai/results/:id
```

### Portfolio

```txt
POST  /api/portfolios
GET   /api/portfolios/me
PATCH /api/portfolios/me
GET   /api/portfolios/public/:portfolioId
PATCH /api/portfolios/me/visibility
```

### Portfolio items and mobile photo upload

```txt
POST   /api/portfolio-items
GET    /api/portfolio-items/me
GET    /api/portfolio-items/:id
PATCH  /api/portfolio-items/:id
DELETE /api/portfolio-items/:id
POST   /api/mobile/portfolio/photos
```

### Jobs

```txt
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
PATCH  /api/jobs/:id
PATCH  /api/jobs/:id/close
DELETE /api/jobs/:id
```

### Applications

```txt
POST  /api/applications
GET   /api/applications/me
GET   /api/company/applications
GET   /api/company/jobs/:jobId/applications
PATCH /api/company/applications/:id/status
```

### Notifications

```txt
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

### Feedback

```txt
POST /api/feedbacks
GET  /api/feedbacks
```

If the backend implementation differs, frontend must follow the implemented backend contract.

---

## 16. Frontend Phase Plan

### Phase FE-1: Frontend setup and foundation

Goal:

- Set up React/Vite/TypeScript if needed.
- Set up React Router.
- Set up Tailwind.
- Set up API client.
- Set up token storage.
- Set up route constants and role constants.
- Create basic layouts.
- Create placeholder pages.
- Make sure all routes render without errors.

Do not implement real feature forms yet.

### Phase FE-2: Authentication UI and integration

Goal:

- Login form.
- Register Applicant form.
- Register Company form.
- Auth API integration.
- Store token.
- Fetch current account using `/api/auth/me`.
- Basic auth state.
- Logout.
- Protected route.
- Role-based redirect.

### Phase FE-3: Applicant and Company Profile

Goal:

- Applicant profile view/edit page.
- Company profile view/edit page.
- Profile API integration.
- Form validation using Zod.
- Loading, success, and error states.

### Phase FE-4: CV Management

Goal:

- CV list.
- CV upload.
- CV detail/preview metadata.
- Delete CV.
- File validation on frontend.
- Loading, empty, and error states.

### Phase FE-5: AI CV Features

Goal:

- Request AI feedback.
- Request CV scoring.
- Request CV translation.
- View AI results.
- View AI result detail.
- Show score and AI text output clearly.
- Display AI advisory disclaimer.

### Phase FE-6: Portfolio

Goal:

- Create portfolio.
- View own portfolio.
- Edit portfolio.
- Public portfolio view.
- Portfolio visibility.
- Portfolio item list.
- Add/edit/delete portfolio item.
- Upload image item from web.
- Optional UI for mobile-photo-style upload endpoint.

### Phase FE-7: Jobs and Applications

Goal:

- Public job list.
- Job detail.
- Company job management.
- Company create/edit/close job.
- Applicant apply to job.
- Applicant application history.
- Company applicant list.
- Company update application status.

### Phase FE-8: Notifications and Feedback

Goal:

- Notification list.
- Mark notification as read.
- Mark all as read.
- Feedback form.
- Basic admin-only feedback list if backend supports it.

---

## 17. UI/UX Rules

- Keep UI simple and clean.
- Prioritize functionality over complex visuals.
- Use responsive layout.
- Use clear empty states.
- Use visible loading states.
- Use friendly error messages.
- Do not expose technical backend errors directly to users.
- AI output must show an advisory notice.

Suggested AI notice:

```txt
AI feedback is for reference only. Please review and edit the content before using it professionally.
```

---

## 18. Validation Rules

Use Zod where forms are implemented.

Minimum validation:

### Register Applicant

```txt
email: required, valid email
password: required, minimum 6 characters
fullName: required
```

### Register Company

```txt
email: required, valid email
password: required, minimum 6 characters
companyName: required
```

### Login

```txt
email: required, valid email
password: required
```

### Applicant profile

```txt
fullName: required or non-empty when updated
phone: optional
university: optional
major: optional
location: optional
headline: optional
summary: optional
careerGoal: optional
avatarUrl: optional URL
```

### CV upload

```txt
title: required
file: required
file type: PDF or DOCX
file size: follow backend limit
```

### Portfolio

```txt
title: required
introduction: optional
visibility: PRIVATE or PUBLIC
```

### Job

```txt
title: required
description: required
status: DRAFT, ACTIVE, CLOSED
```

---

## 19. Protected Route Rules

- Guest can access public pages.
- Applicant can access applicant pages.
- Company can access company pages.
- Admin routes are not required initially.
- If token is missing, redirect to `/login`.
- If role is not allowed, show access denied or redirect to home.
- Do not rely only on frontend role checking for security; backend is the final authority.

---

## 20. Error Handling Rules

Frontend should handle:

- 400 validation errors
- 401 unauthenticated
- 403 forbidden
- 404 not found
- 500 server errors
- network errors
- file upload errors
- AI failure result

Display user-friendly messages.

Do not show raw stack traces.

---

## 21. Testing Checklist

### Setup

- `npm install` works.
- `npm run dev` works.
- No TypeScript errors.
- No import errors.
- Tailwind styles apply.
- Router works.

### Routes

Check these routes:

```txt
/
 /login
 /register/applicant
 /register/company
 /applicant/profile
 /company/profile
 /cvs
 /ai/results
 /portfolio
 /portfolio/public/:portfolioId
 /jobs
 /jobs/:jobId
 /applications/me
 /company/jobs
 /company/applications
 /notifications
 /feedback
```

### API client

- `VITE_API_BASE_URL` is read correctly.
- Token is attached to protected requests.
- 401 responses can be handled.

### Naming

Search project for old terms:

```txt
student
Student
STUDENT
studentProfile
StudentProfile
student_profiles
student_profile_id
```

If any remain, explain why. If not needed, replace with applicant naming.

---

## 22. Definition of Done for Frontend MVP

Frontend MVP is complete when:

1. App runs successfully.
2. Routing works.
3. Auth flow works.
4. Applicant registration and login work.
5. Company registration and login work.
6. Protected route works.
7. Applicant profile view/edit works.
8. Company profile view/edit works.
9. CV upload/list/detail/delete works.
10. AI feedback/scoring/translation request works.
11. AI result list/detail works.
12. Portfolio create/view/edit works.
13. Portfolio item upload/list/edit/delete works.
14. Public portfolio view works.
15. Job list/detail works.
16. Company job management works.
17. Applicant application flow works.
18. Company application management works.
19. Notifications work.
20. Feedback form works.
21. Naming uses applicant, not student.
22. README is updated.
23. Code does not include frontend features outside MVP without approval.

---

## 23. Final Reminder for Codex

This repo is the frontend repo only.

Do not edit backend code.

Do not change database design.

Do not add features outside MVP.

Use `FRONTEND_MVP_PLAN.md` as the main implementation guide.
