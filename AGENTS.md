# CVBuddy Frontend Agent Guide

This repository is the CVBuddy frontend web app. It uses React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS v4, class-variance-authority, and local UI primitives. React Hook Form and Zod are installed, but inspect existing form code before assuming a form pattern.

## Read Before Coding

Read only the context needed for the task.

For any code or documentation change:

1. `AGENTS.md`
2. `package.json`
3. The files directly touched by the task

For API-related frontend work, also read:

- `docs/api-contract.md`
- Relevant files under `src/apis`, `src/config`, and the touched route or component
- Backend API docs copied into this repo, if they are needed for the endpoint being integrated

For UI, layout, or polish work, also read:

- `docs/ui-guidelines.md`
- Relevant local UI primitives and the touched screen or component
- Stitch reference files only when the task explicitly involves matching Stitch UI

For large features, scope questions, or phase planning, also read:

- The relevant section of `FRONTEND_MVP_PLAN.md`
- A short Trellis task note under `.trellis/tasks/` when the work is substantial

For bug fixes, read only the files needed to reproduce and understand the bug. Expand scope only when the bug points to shared API, routing, layout, or state behavior.

`.trellis/spec/*.md` files are optional historical references. Do not require them for small tasks.

## Source Of Truth

- `package.json` is the source of truth for scripts and installed dependencies.
- Current source code patterns are the source of truth for implementation style.
- `docs/api-contract.md` and backend API docs are the source of truth for API integration behavior.
- Current frontend code uses `VITE_API_URL`; do not rename environment variables unless explicitly requested.
- Current repo structure takes priority over older plan examples.
- If docs conflict with code, stop and call out the mismatch before changing behavior.

## Ponytail Frontend Rules

- Make the smallest useful change that solves the task.
- Prefer existing routes, components, hooks, API helpers, CSS tokens, and file structure.
- Do not add new libraries, global state, architecture, or abstractions unless the task clearly needs them.
- Keep components readable before making them clever.
- Keep API calls out of UI components; use existing API helpers and `httpClient`.
- Handle loading, empty, error, and success states when the user can trigger async work.
- Preserve route names, env vars, auth flow, and domain terms unless explicitly asked to change them.
- Validate with the narrowest relevant script from `package.json`.
- Update docs only when behavior, contract, or workflow actually changes.

## Local Patterns

Follow the existing React/Vite/TypeScript patterns. Reuse existing components, hooks, services, layouts, styles, routes, API utilities, and CSS tokens before creating new structure.

Keep API calls aligned with the backend API contract. Use the existing `httpClient` and `VITE_API_URL`; do not hardcode backend URLs in components. Do not change public API contracts, route names, auth flow, environment variables, or shared domain terms unless explicitly requested.

Keep UI changes focused. Do not redesign unrelated screens while fixing one page. Check loading, empty, error, and success states when working on interactive UI. Do not introduce new state management or UI libraries unless explicitly requested.

## Validation

Inspect `package.json` before choosing validation commands. Current scripts are:

- `npm run dev` - run `vite`
- `npm run build` - run `tsc -b && vite build`
- `npm run lint` - run `eslint .`
- `npm run preview` - run `vite preview`

After edits, run the narrowest relevant validation command. Prefer `npm run build` for TypeScript or bundling changes and `npm run lint` for lint-sensitive code changes. Documentation-only edits usually do not need app validation.

## Trellis Notes

Use `.trellis/tasks/` for short notes on substantial frontend work. Trellis should record meaningful work done, changed files, validation, and follow-up notes; it should not become a second specification system.

Keep `.trellis/workspace/journal.md` as a short project history. Use `.trellis/tasks/_template/task.md` for new task notes.

## Repo-Local Skills

Repo-local skills live under `.agents/skills/`. They may not auto-load in every Codex surface, so future prompts should explicitly mention the skill name or path when a specific workflow should be used.

Examples:

- Use `.agents/skills/frontend-cvb-patterns` for frontend implementation.
- Use `.agents/skills/frontend-taste` for UI polish and interaction quality.
- Use `.agents/skills/api-integration` for backend API integration.
- Use `.agents/skills/phase-implementation` for planned phase work.

## Stitch UI Reference

Before implementing or modifying UI from Stitch, read:

- `stitch-reference/design-notes.md`
- `stitch-reference/screenshots/`
- `stitch-reference/exported-code/` if present

The Stitch files are visual/design references, not final production code. Rebuild the UI using the existing project stack and conventions. Reuse existing components where possible, keep API integration compatible with the current backend contract, and validate with the scripts defined in `package.json`.
