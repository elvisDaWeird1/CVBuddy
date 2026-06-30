# CVBuddy Frontend Agent Guide

This repository is the CVBuddy frontend web app. It currently uses React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS v4, class-variance-authority, and local UI primitives. React Hook Form and Zod are installed dependencies, but future agents should inspect existing form code before assuming an established form pattern.

## Read Before Coding

Before making code changes, read only the relevant parts of:

1. `AGENTS.md`
2. `README.md`
3. `FRONTEND_MVP_PLAN.md`
4. `package.json`
5. `tsconfig*.json`
6. `vite.config.ts`
7. `.trellis/spec/*.md`
8. `docs/api-contract.md` for API integration behavior
9. `docs/ui-guidelines.md` for UI/style behavior
10. Existing files in the touched route, component, API service, layout, hook, style, or module

If `PROJECT_CONTEXT.md` or backend API docs are added later, read the relevant parts before work that touches API contracts, auth, or domain scope.

## Source Of Truth

- `package.json` is the source of truth for scripts and installed dependencies.
- Current source code patterns are the source of truth for implementation style.
- Backend API contract/docs are the source of truth for API behavior.
- Current frontend code uses `VITE_API_URL`; `FRONTEND_MVP_PLAN.md` may mention `VITE_API_BASE_URL` as older planning language. Do not rename environment variables unless explicitly requested.
- If docs conflict with code, stop and call out the mismatch before changing behavior.

## Local Patterns

Follow the detected React/Vite/TypeScript patterns. Reuse existing components, hooks, services, layouts, styles, routes, API utilities, and CSS tokens before creating new architecture.

Keep API calls aligned with the backend API contract. Use the existing `httpClient` and `VITE_API_URL`; do not hardcode backend URLs in components. Do not change public API contracts, route names, auth flow, environment variables, or shared domain terms unless explicitly requested.

Keep UI changes focused. Do not redesign unrelated screens while fixing one page. Check loading, empty, error, and success states when working on UI. Do not introduce new state management or UI libraries unless explicitly requested.

Keep changes small and testable. Use Ponytail-style implementation discipline: make the smallest useful change, preserve existing contracts, validate immediately, and document intentional behavior changes.

## Scripts

Inspect `package.json` before choosing validation commands. Detected scripts are currently:

- `npm run dev` - run `vite`
- `npm run build` - run `tsc -b && vite build`
- `npm run lint` - run `eslint .`
- `npm run preview` - run `vite preview`

After edits, run the narrowest relevant validation command. Prefer `npm run build` for TypeScript or bundling changes and `npm run lint` for lint-sensitive code changes. Documentation-only edits usually do not need a build.

## Repo-Local Skills

Repo-local skills live under `.agents/skills/`. They may not auto-load in every Codex surface, so future prompts should explicitly mention the skill name or path when a specific workflow should be used.

Examples:

- Use `.agents/skills/frontend-cvb-patterns` for frontend implementation.
- Use `.agents/skills/frontend-taste` for UI polish and interaction quality.
- Use `.agents/skills/api-integration` for backend API integration.
- Use `.agents/skills/phase-implementation` for planned phase work.

Use `.trellis/tasks/` for short task notes before larger changes. Keep task files short and delete nothing unless the user asks.

## Stitch UI Reference

Before implementing or modifying frontend UI, read:

- `stitch-reference/design-notes.md`
- `stitch-reference/screenshots/`
- `stitch-reference/exported-code/` if present

The Stitch files are visual/design references, not final production code.

Rules:
- Match the Stitch layout, spacing, color direction, border radius, typography feel, and component hierarchy.
- Do not blindly paste Stitch code if it conflicts with the current React/Vite project structure.
- Rebuild the UI using the existing project stack and conventions.
- Reuse existing components when possible.
- Keep API integration compatible with the current backend contract.
- Do not rename environment variables, routes, or API functions unless required.
- After coding, run the validation commands defined in `package.json`.

### UI / styling tasks

For any UI, layout, component styling, visual polish, or responsive design task, read:

- `docs/ui-guidelines.md`
- `src/index.css`
- the touched component/page files

`src/index.css` is the source of truth for the frontend color palette, CSS variables, spacing, radius, shadows, and shared visual tokens. Do not introduce new hard-coded colors or visual styles when an existing token/pattern is available.