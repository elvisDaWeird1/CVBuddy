# API Contract

This document is the frontend API integration reference for CVBuddy. Backend API docs and backend route/controller code are the final authority when available.

## Current Frontend Client

- Shared Axios client: `src/apis/httpClient.ts`.
- Axios config: `src/apis/axios.config.ts`.
- API base URL config: `src/config/index.ts`.
- Current frontend code uses `VITE_API_URL`.
- `FRONTEND_MVP_PLAN.md` may mention `VITE_API_BASE_URL` as older planning language.
- Do not rename environment variables unless explicitly requested.
- Current fallback base URL in code: `http://localhost:3000/api`.

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
