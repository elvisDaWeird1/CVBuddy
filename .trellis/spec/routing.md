# Routing Spec

Routing currently uses `react-router-dom` with `BrowserRouter`, `Routes`, `Route`, and a `routeConfig` array.

## Current Routes

- `/` renders `src/modules/admin/Home.tsx`.
- `*` renders `src/modules/admin/NotFound.tsx`.

## Rules

Add or change routes through `src/routes/index.tsx` unless the user explicitly asks for a router architecture change. Do not rename public route paths unless requested.
