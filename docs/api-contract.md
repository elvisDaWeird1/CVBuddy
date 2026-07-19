# API Contract

This document is the frontend API integration reference for CVBuddy. Backend API docs and backend route/controller code are the final authority when available.

## Current Frontend Client

- Shared Axios client: `src/apis/httpClient.ts`.
- Axios config: `src/apis/axios.config.ts`.
- API base URL config: `src/config/index.ts`.
- Current frontend code uses `VITE_API_URL` for the API base URL.
- Do not rename environment variables unless explicitly requested.
- `.env.example` uses `VITE_API_URL=http://localhost:5000/api`; the code fallback is `/api`.
- Portfolio service request paths start at `/portfolio/...`, so the final URL is `/api/portfolio/...` without a duplicated `/api` segment.

## Portfolio

- Each Applicant owns at most one Portfolio.
- `GET /api/portfolio/me` returns `data.portfolio: null` before creation and must not create data as a side effect.
- `PUT /api/portfolio/me` creates or updates the authenticated Applicant's Portfolio.
- `PATCH /api/portfolio/me/publish` and `/unpublish` persist visibility; the UI does not update optimistically.
- `GET /api/portfolio/moments?limit=100` supplies owner gallery media; pagination is followed when more than 100 Moments exist.
- `GET /api/portfolio/public/:slug` is unauthenticated and returns only public-ready content. Private and unknown slugs both return `404`.
- Frontend routes: protected owner workspace `/portfolio`; unauthenticated public view `/p/:slug`.

## Response Shape

Backend responses are expected to use:

```ts
{
  success: boolean
  message: string
  data?: unknown
  errors?: unknown[]
}
```

## Rules

- Do not hardcode backend URLs in components.
- Use API helper modules plus `httpClient` for backend calls.
- Confirm endpoint paths against backend docs before integration.
- Do not change backend API contracts from this repo.
