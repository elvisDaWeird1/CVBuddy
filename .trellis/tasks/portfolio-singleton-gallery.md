# Singleton Portfolio gallery and public sharing

## Objective

Replace the collection-first Portfolio frontend with one applicant-owned Portfolio, render every image directly in a responsive gallery, and keep public sharing backed by the authenticated visibility APIs.

## Verified contract

- Owner profile: `GET|PUT /api/portfolio/me`.
- Visibility: `PATCH /api/portfolio/me/publish` and `/unpublish`.
- Owner media: `GET /api/portfolio/moments`, `POST /api/portfolio/moments`, `DELETE /api/portfolio/moments/:id`.
- Public read: `GET /api/portfolio/public/:slug`; private and unknown slugs return `404` without private data.
- The public browser route is `/p/:slug`; `/portfolio` remains the protected owner route.

## Implementation plan

1. Refactor `/portfolio` from a collection list to a singleton workspace with loading, no-Portfolio, error, and populated states.
2. Reuse the existing domain API and Moment creation/edit flows; remove collection create/manage routes from the router.
3. Add a presentational gallery that flattens every image asset, uses a four-column desktop flex layout with centered wrapped rows, responsive tablet/mobile sizing, image fallbacks, and an accessible lightbox.
4. Add an owner-only visibility control with pending/success/error feedback, no optimistic state, and a copyable `/p/:slug` URL only while public.
5. Reuse the gallery on the unauthenticated public page without upload/edit/delete/visibility actions and retain private/not-found protection.
6. Align the backend singleton behavior: a read must not create a Portfolio, additional collection creation must be rejected, and the applicant uniqueness index must be represented in code and an explicit safe migration.
7. Validate owner/public authorization, Portfolio absence/creation, visibility transitions, gallery row counts (0, <4, 4, 5-7, multiple rows), failed images, direct public-route refresh, and desktop/tablet/mobile layouts.

## Validation

- Frontend: `npm run lint`, `npm run build`.
- Backend: `npm test`, `npm run build`, singleton migration/index check, and direct HTTP contract checks.
- Browser: owner and public routes at desktop, tablet, and mobile widths; keyboard lightbox and private public-route behavior.

## Guardrails

- Do not edit or commit `.env` files or secrets.
- Do not delete or rewrite existing Portfolio media during migration.
- Do not commit unrelated dirty AI, landing-page, upload, server, Cloudinary, or test work.
