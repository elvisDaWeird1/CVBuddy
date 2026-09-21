# API Integration Spec

`docs/api-contract.md` is the frontend API integration reference. Backend route/controller code or backend API docs remain the final authority when available.

## Current Pattern

- API base URL comes from `src/config/index.ts` as `API_BASE_URL`.
- Current environment variable: `VITE_API_URL`.
- Axios config lives in `src/apis/axios.config.ts`.
- Shared client lives in `src/apis/httpClient.ts`.

## Rules

Do not hardcode backend URLs in components. Keep API calls behind API helpers/services. Do not change backend contracts from this repo.
