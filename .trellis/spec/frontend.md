# Frontend Spec

CVBuddy frontend is a React 19 + TypeScript + Vite web app.

## Current Structure

- `src/main.tsx` mounts React with `StrictMode`.
- `src/App.tsx` wraps `BrowserRouter`, `Suspense`, and mapped routes.
- `src/routes/index.tsx` contains `routeConfig`.
- `src/apis` contains the Axios client and API config.
- `src/components/ui` contains local UI primitives.
- `src/modules/admin` currently contains placeholder `Home` and `NotFound` pages.
- `src/index.css` contains Tailwind import and design tokens.

## Rules

Keep changes small and compatible with the current structure unless a task explicitly asks for a larger reorganization. Do not introduce new state, UI, routing, or data-fetching libraries without approval.
