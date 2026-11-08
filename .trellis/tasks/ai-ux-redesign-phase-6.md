# Task: AI Evaluation UX Redesign (Phase 6 — AI-UX-001 to AI-UX-003)

## Goal

Split AI request configuration (`/ai`), saved history (`/ai/history`), and result-first detail (`/ai/results/:resultId`) into dedicated Applicant routes with a `/ai-chat` compatibility redirect, rename user-facing "AI Chatting" to "CV Analysis", and implement a deterministic 11-step result priority hierarchy without changing backend contracts or adding dependencies.

## Scope

In:
- `src/routes/app-router.tsx`
- `src/layouts/ClientLayout/ApplicantHeader.tsx`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/components/AiRequestComposer.tsx`
- `src/modules/ai/aiHistoryAdapter.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/components/ScoreOverview.tsx`
- `src/modules/ai/components/AiResultHistory.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`
- `package.json`
- `tests/aiUx.test.ts`
- `tests/e2e/04-ai-scoring-translation.spec.ts`

Out:
- Backend, FastAPI, or database changes
- `AI-UX-003` AI response schema v2
- Phase 7 helpfulness feedback (`AI-FB-001`, `AI-FB-002`, `AI-FB-003`)
- Unsupported actions (Download AI result, Analyze with JD, disabled "coming soon" buttons)
- New npm dependencies, global state libraries, or UI frameworks
- Uncommitted Google Auth / Phase 5 files in the working tree

## Files touched

- `src/routes/app-router.tsx`
- `src/layouts/ClientLayout/ApplicantHeader.tsx`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/components/AiRequestComposer.tsx`
- `src/modules/ai/aiHistoryAdapter.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/components/ScoreOverview.tsx`
- `src/modules/ai/components/AiResultHistory.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`
- `package.json`
- `tests/aiUx.test.ts`
- `tests/e2e/04-ai-scoring-translation.spec.ts`

## Notes

- Existing pattern used: React Router route config (`appRoutes`), `httpClient` / `aiApi` helpers (`getAiResults`, `getAiResultById`, `scoreCv`, `translateCv`), existing retry/idempotency policy (`aiRetryPolicy.ts`), and local UI primitives (`Card`, `Button`, `Form`, `Input`, `Select`).
- API/UI states considered: CV loading/empty/error/retry, AI request processing/retry with idempotency key reuse policy, result detail loading/completed/pending/failed/403/404/partial/malformed states, query string prefill validation against `getMyCvs()`, and legacy vs structured AI results.
- Intentional tradeoffs: Derived `priorityGroups` and `strongestArea` deterministically in `aiResultAdapter.ts` from existing `layout_ats`, `language`, `keywords`, and `jd_fit` dimensions; no synthetic severity ("Critical") or fabricated strengths.

## Validation

- Command: `npm test`, `npm run lint`, `npm run build`, `npx playwright test tests/e2e/04-ai-scoring-translation.spec.ts`, `git diff --check`, `git status --short`
- Result:
  - `npm test`: Passed 75/75 (including 14 new tests in `tests/aiUx.test.ts` covering all 15 required assertions).
  - `npm run lint`: Passed (0 errors, 0 warnings).
  - `npm run build`: Passed (`tsc -b && vite build` exited 0).
  - `npx playwright test tests/e2e/04-ai-scoring-translation.spec.ts`: Browser steps 1–6 passed (register, login, upload CV, `/ai-chat` -> `/ai` redirect, `CV Analysis` nav & heading, select CV/action/career context via `selectOption`, submit); blocked at `POST /api/ai/cvs/:cvId/score` by local E2E backend environment (`500 INTERNAL_ERROR` / `MongoServerError` on standalone `MongoMemoryServer` transaction + FastAPI AI service on `localhost:8001` not running).

## Follow-up

- Helpfulness prompt (`AI-FB-002`) is blocked by `AI-FB-001` because `PUT /api/ai/results/:id/feedback` and `GET /api/ai/results/:id/feedback` are not implemented yet.
- `AI-UX-003` schema v2 is deferred because deterministic frontend-derived ranking is sufficient for MVP.
- Only open schema v2 if later evaluation proves the frontend cannot derive the required hierarchy accurately.
