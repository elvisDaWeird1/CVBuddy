# Task: Portfolio frontend domain

## Goal

Implement the applicant Portfolio domain UI and API integration for Portfolio, Experience, Moment, Evidence, featured work, publish flow, and public `/p/:slug` viewing.

## Scope

In:
- Frontend-only implementation using the existing React, Axios, router, auth, and UI primitives.
- Domain API contract under `/api/portfolio`.
- Responsive applicant and public portfolio screens.

Out:
- Backend changes, Cloudinary direct uploads, CV conversion, social-network features, and automated tests (no test script exists in `package.json`).

## Files touched

- `src/routes/app-router.tsx`
- `src/apis/httpClient.ts`
- `src/components/ui/icons.tsx`
- `src/modules/portfolio/*`
- `docs/portfolio-frontend-implementation.local.md`

## Notes

- Existing pattern used: `httpClient`, auth interceptor/storage, `ProtectedRoute`, `ApplicantShell`, local UI primitives, React page state, React Hook Form and Zod.
- API/UI states considered: loading, empty, not found, validation, 409 slug conflict, upload constraints, success/error notices, confirm before destructive actions, camera fallback, public API 401/404 handling, stale-request guards, and media URL cleanup.
- Intentional tradeoffs: inline notices and native confirm are used because the repo has no toast/dialog primitive; no new state library was added. Evidence edit uses one inline editor and can replace the uploaded file when the backend supports multipart update.

## Validation

- Command: `npm run build`
- Result: passed; Vite emitted only the existing large-chunk warning.
- Command: `npm run lint`
- Result: passed with 0 errors and 0 warnings.
- Runtime: protected `/portfolio` redirected to `/login`; public `/p/not-a-real-slug` stayed public and showed an error state after the backend request timeout.

## Follow-up

- Add a shared toast/dialog primitive if the product wants consistent global notifications.
- Add frontend automated tests when a test runner is introduced.
- Add an Evidence asset picker if that flow becomes required; backend also supports selecting an existing `assetId` for covers.
