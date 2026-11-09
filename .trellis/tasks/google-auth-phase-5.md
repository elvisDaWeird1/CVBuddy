# Task: Google Authentication Frontend UX (Phase 5 — AUTH-G-004)

## Goal

Complete frontend Google Sign-In UX (`AUTH-G-004`), including additive profile-completion redirect to `/profile/edit`, accessible account-linking dialog (initial password focus, Escape close when idle, focus restoration, `aria-labelledby`/`aria-describedby`, live error alert, duplicate submission/callback lockout), clear GIS configuration/load error feedback, and unit + E2E test coverage.

## Scope

In:
- `src/modules/auth/authPolicy.ts`
- `src/modules/auth/authApi.ts`
- `src/modules/auth/googleIdentity.ts`
- `src/modules/auth/GoogleAuthSection.tsx`
- `.env.example`
- `docs/api-contract.md`
- `tests/authPolicy.test.ts`
- `tests/e2e/07-google-auth.spec.ts`

Out:
- New UI or state libraries
- Unrelated working-tree files

## Files touched

- `src/modules/auth/authPolicy.ts`
- `src/modules/auth/authApi.ts`
- `src/modules/auth/authStorage.ts`
- `src/modules/auth/AuthSessionBoundary.tsx`
- `src/modules/auth/ProtectedRoute.tsx`
- `src/modules/auth/googleIdentity.ts`
- `src/modules/auth/GoogleAuthSection.tsx`
- `playwright.config.ts`
- `Dockerfile`
- `.env.example`
- `docs/api-contract.md`
- `tests/authPolicy.test.ts`
- `tests/e2e/01-applicant-auth-profile.spec.ts`
- `tests/e2e/07-google-auth.spec.ts`
- `tests/e2e/fixtures.ts`

## Notes

- Existing pattern used: `authPolicy.ts` pure helpers + `GoogleAuthSection` local modal and `httpClient` API helpers.
- API/UI states considered: unconfigured GIS (`VITE_GOOGLE_CLIENT_ID` missing), GIS script load failure, authenticating lockout, 409 link-required modal with `Tab`/`Shift+Tab` focus trap, wrong password / expired challenge alert, incomplete profile redirect (`/profile/edit`) preserved across browser reloads via `/api/auth/me`, complete profile redirect (`/profile`).
- Intentional tradeoffs: No new testing dependencies added; pure logic tested via `node:test` and browser interactions via Playwright.

## Validation

- Command: `npm run test:auth`, `npm test`, `npm run lint`, `npm run build`, and `npx playwright test tests/e2e/07-google-auth.spec.ts tests/e2e/01-applicant-auth-profile.spec.ts`
- Result: `npm run test:auth` passed 14/14; `npm test` passed 61/61; `npm run lint` and `npm run build` exited 0; Playwright E2E passed 8/8.

## Follow-up

- Staging browser E2E with real Google OAuth client requires authorized JavaScript origins configured in Google Cloud Console.
