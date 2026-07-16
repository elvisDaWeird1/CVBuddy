# Task: Landing page restyle

## Goal

Modernize the CVBuddy Landing Page while preserving existing authentication, applicant routes, and working feature flows.

## Scope

In:
- Make Guest and Applicant header logos return to the top of the Landing Page.
- Centralize Landing navigation and add Portfolio after AI Buddy.
- Restyle About Us with six explicit neutral team placeholders.
- Restyle AI Buddy around translation, scoring, and feedback.
- Add a mobile capture-to-portfolio feature section with a CSS phone mockup.
- Remove the Landing survey section, navigation, legacy redirect, public allowlist entry, and unused page file.

Out:
- Portfolio or AI business-logic changes.
- Backend/API contract changes.
- New guest-only feature routes or non-functional CTAs.

## Files touched

- `src/modules/pages/LandingPage.tsx`
- `src/modules/pages/landingNavigation.ts`
- `src/layouts/ClientLayout/Header.tsx`
- `src/layouts/ClientLayout/ApplicantHeader.tsx`
- `src/layouts/ClientLayout/Footer.tsx`
- `src/routes/app-router.tsx`
- `src/apis/httpClient.ts`
- `src/modules/pages/FormPage.tsx` (removed after confirming it had no imports)

## Notes

- Existing pattern used: Landing `SectionShell`, `SectionIntro`, `SoftCard`, local Card/icon primitives, and CSS design tokens.
- API/UI states considered: guest/authenticated header variants, desktop/mobile navigation, hash scrolling from current and external routes, sticky-header offset, and 1/2/3-column responsive grids.
- Intentional tradeoffs: Portfolio is informational only and has no CTA to the protected workspace; team names, roles, and photos remain explicit placeholders.

## Validation

- Command: `npm run lint`
- Result: passed.
- Command: `npm run build`
- Result: passed; Vite retained the existing large-chunk warning.
- Command: Vite dev-server HTTP smoke check.
- Result: `200`, root mount and Vite client present.
- Browser check: unavailable because the browser runtime exposed no browser session.

## Follow-up

- Replace the six `teamMembers` placeholder names, roles, and `image` values when final team data is available.
- Run a visual click-through when a browser session is available.

