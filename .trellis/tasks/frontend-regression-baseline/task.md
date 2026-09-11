# DEP-012 — Frontend regression baseline

## Outcome

Extended the canonical frontend test command with release-critical checks for the
public Portfolio route/client boundary and publish/unpublish success and failure
states. Existing auth/session, CV preflight, upload, and admin dashboard tests stay
in the same deterministic Node/Vite runner.

## Verification

- `npm test`
- `npm run lint`
- `npm run build`
