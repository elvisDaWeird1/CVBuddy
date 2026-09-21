# State Management Spec

No global state management library is currently implemented.

## Current Pattern

- `src/stores/index.ts` exists as a placeholder only.
- Local component state and future small hooks are preferred until a task requires broader shared state.
- API client interceptors currently only log 401 responses.

## Rules

Do not add Redux, Zustand, TanStack Query, or another state/data library unless explicitly requested. Keep auth/token state changes aligned with the planned auth flow and backend contract.
