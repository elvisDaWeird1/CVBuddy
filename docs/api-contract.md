# API Contract

This document is the frontend API integration reference for CVBuddy. Backend API docs and backend route/controller code are the final authority when available.

## Current Frontend Client

- Shared Axios client: `src/apis/httpClient.ts`.
- Axios config: `src/apis/axios.config.ts`.
- API base URL config: `src/config/index.ts`.
- Current frontend code uses `VITE_API_URL` for the API base URL.
- Google Identity Services (GIS) uses `VITE_GOOGLE_CLIENT_ID` (public OAuth 2.0 Web Client ID matching backend `GOOGLE_CLIENT_ID`). Never place a Google Client Secret in frontend environment variables or repository files.
- Do not rename environment variables unless explicitly requested.
- `.env.example` uses `VITE_API_URL=http://localhost:5000/api`; the code fallback is `/api`.
- Portfolio service request paths start at `/portfolio/...`, so the final URL is `/api/portfolio/...` without a duplicated `/api` segment.

## Google Authentication

- `POST /api/auth/google` with `{ idToken }` verifies the Google ID token on the backend.
  - `201` (new applicant) or `200` (returning Google user) returns `{ token, account, profile, isNewAccount, needsProfileCompletion }`.
  - When `data.needsProfileCompletion === true` (or `data.profile.isComplete === false`), the frontend redirects the applicant to `/profile/edit`; otherwise it redirects to `/profile`.
  - `409 GOOGLE_ACCOUNT_LINK_REQUIRED` returns `{ requireLink: true, email, linkToken }` without issuing a session token. The frontend opens the accessible account-linking modal (`role="dialog"`, `aria-labelledby`, `aria-describedby`, password autofocus, Escape-to-close when idle, `role="alert"` error live region).
- `POST /api/auth/google/link` with `{ idToken, password, linkToken }` confirms the user's current CVBuddy password and short-lived challenge token to atomically link the Google identity.
- `GET /api/auth/me` returns `{ needsProfileCompletion, account: { ..., authMethods, needsProfileCompletion }, profile: { ..., isComplete } }` so `AuthSessionBoundary` preserves Google profile-completion metadata across page reloads.
- On logout (`clearAuthSession`), the frontend calls `window.google.accounts.id.disableAutoSelect()` when GIS is loaded.
- Authorized JavaScript origins required in Google Cloud Console: `http://localhost:5173` (and `http://127.0.0.1:5173`) for local development, and the exact HTTPS frontend origin for staging/production.

## Portfolio

- Each Applicant owns at most one Portfolio.
- `GET /api/portfolio/me` returns `data.portfolio: null` before creation and must not create data as a side effect.
- `PUT /api/portfolio/me` creates or updates the authenticated Applicant's Portfolio.
- `PATCH /api/portfolio/me/publish` and `/unpublish` persist visibility; the UI does not update optimistically.
- `GET /api/portfolio/moments?limit=100` supplies owner gallery media; pagination is followed when more than 100 Moments exist.
- `GET /api/portfolio/public/:slug` is unauthenticated and returns only public-ready content. Private and unknown slugs both return `404`.
- Frontend routes: protected owner workspace `/portfolio`; unauthenticated public view `/p/:slug`.

## AI request contract

- Frontend calls the authenticated Node `/api/ai/...` routes only; it never calls FastAPI or sends `X-AI-Internal-Key`.
- Targeted analysis sends camelCase career context: `{ industrySlug, verticalSlug, targetRole }`. All three values are required for review and translate-and-score; the AI workspace also supplies all three when scoring a selected target.
- Optional `jdExtract` contains `company_name` plus the required string arrays `required_keywords`, `preferred_keywords`, and `responsibilities`. The frontend does not send `role_title`; Node derives it from `targetRole`.
- Optional `llmModel` is limited to `qwen/qwen3.8-27b` or `openai/gpt-oss-120b`. When no model is selected, the field is omitted and Node sends `llm_model: null` internally.
- `tier`, plan, credits, credit cost, extracted `sections`, and `local_metrics` are server-controlled or extraction-owned and must never be sent by the browser.

## Response Shape

Backend responses are expected to use:

```ts
{
  success: boolean
  message: string
  data?: unknown
  errors?: unknown[]
  code?: string
  requestId?: string
}
```

## Rules

- Do not hardcode backend URLs in components.
- Use API helper modules plus `httpClient` for backend calls.
- Confirm endpoint paths against backend docs before integration.
- Do not change backend API contracts from this repo.
