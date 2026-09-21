# Task: Authenticated workspace restyle and applicant API handoff

## Goal

Restyle and complete the authenticated Profile, CV, AI, and multi-Portfolio workflows using the verified backend handoff while preserving authentication and legacy compatibility routes.

## Implemented

- Profile name/phone validation plus avatar click-to-select, MIME/5 MB validation, Canvas compression, preview confirmation, Axios progress, cancellation, and header/session synchronization.
- Compact CV upload without title input; PDF/DOC/DOCX validation at 5 MB; binary PDF preview, filename-safe download, confirmed delete, and CV_IN_USE handling.
- AI Results history plus a four-step analysis flow using the synchronous translate-and-score workflow and single-result review endpoint. Career target is validated and partial workflow failures preserve completed output.
- Multi-portfolio list, create/edit/detail/delete, PUBLIC/PRIVATE visibility, backend-provided public URL, copy feedback, and the new public slug route.
- Portfolio Moment upload scoped by portfolio ID with image validation, compression, preview, progress, cleanup, and responsive moment/experience grids.
- Existing legacy Portfolio experience/moment routes remain available; no backend, authentication, token, or dependency changes.

## Contract used

- Avatar: `PATCH /applicant-profile/me/avatar`, multipart `avatar`.
- CV: `POST /cvs`; `GET /cvs/:id/preview`; `GET /cvs/:id/download`; `DELETE /cvs/:id`.
- AI: `POST /ai/cvs/:cvId/translate-and-score`; `POST /ai/cvs/:cvId/review`; result list/detail endpoints.
- Portfolio: `/portfolios` CRUD, `/:portfolioId/visibility`, nested experiences/moments, and `GET /public/portfolios/:slug`.

## Validation

- `npm run lint`: pass, 0 errors/warnings.
- `npm run build`: pass; TypeScript and Vite production build succeed.
- `git diff --check`: pass; Windows LF/CRLF notices only.
- Tests/typecheck: no standalone scripts in `package.json`; build includes `tsc -b`.
- Browser visual QA: unavailable because the session exposed no browser instance. No fake auth/session was introduced.

## Remaining notes

- Portfolio cover upload is intentionally absent because backend only whitelists title/description.
- DOC/DOCX preview is intentionally disabled; backend preview supports PDF only.
- DOC can be stored/downloaded but is not accepted by the AI extraction service.
- Creating a second portfolio on legacy data still depends on backend running `npm run migrate:multiple-portfolios`.
- Vite retains its existing warning for a JavaScript chunk larger than 500 kB.
