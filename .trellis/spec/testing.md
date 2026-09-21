# Testing And Validation Spec

`package.json` is the source of truth for available scripts. `AGENTS.md` contains current validation guidance.

## Guidance

Documentation-only changes usually do not require a build. For TypeScript, route, API, or UI changes, inspect `package.json` and run the narrowest relevant script. Prefer `npm run build` for compile/bundle validation and `npm run lint` for lint-sensitive changes.
