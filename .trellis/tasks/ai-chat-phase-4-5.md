# Task: AI Chat Phase 4–5

## Goal

Let applicants translate a selected CV for read-only review and copy, then browse persisted AI results without introducing a conversation model.

## Scope

In:
- Typed translation, history list, and history detail calls through the shared Node `httpClient`.
- Defensive translation and history adapters for structured results, legacy `resultText`, malformed records, missing CVs, and unknown type/status values.
- Translation idle/loading/success/partial/malformed/error states with clipboard feedback.
- Recent AI result history with responsive list/detail flow for score, feedback, and translation records.
- Trellis record and API smoke validation using a temporary applicant, PDF fixture, FastAPI mock, Node backend, and MongoDB cleanup.

Out:
- Free-form chat, conversation threads, streaming, WebSocket/SSE, new CV files, downloads, backend/FastAPI/database changes, dependency changes, commit, and push.

## Contract verified

- `POST /api/ai/cvs/:cvId/translate-to-english` accepts the frontend request body `{}`; the Node service extracts CV content from `CVDocument` or its stored file. The frontend sends no raw CV text or file.
- Translation returns `data.aiResult`; the real mock result used `data.aiResult.result = { translated, notes, meta }` and persisted `resultText`.
- `GET /api/ai/results` returns summary records in `data.aiResults`, supports only `aiType` and `status` filters, and has no pagination in the current backend.
- `GET /api/ai/results/:id` returns detail in `data.aiResult`, including `result`, `resultText`, and `errorMessage` where available.
- Backend types are `CV_SCORING`, `CV_FEEDBACK`, `CV_TRANSLATION`, `JOB_RECOMMENDATION`; statuses are `PENDING`, `COMPLETED`, `FAILED`. The current serializer exposes `createdAt` and `completedAt`, but not `updatedAt`.

## Files touched

- `src/modules/ai/aiApi.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/aiHistoryAdapter.ts`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/components/TranslationPanel.tsx`
- `src/modules/ai/components/AiResultHistory.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`

## Notes

- Existing pattern used: local state/effects, shared `httpClient`, Card/Button/Input/Select primitives, tokenized CSS, and no new dependency.
- Translation is explicit and read-only; opening history fetches detail only and does not trigger an AI mutation.
- The history list joins `cvDocumentId` to the loaded CV list and uses `CV no longer available` when the source CV is gone.
- Score and feedback remain two independent backend AI flows. This phase does not change the backend's repeated extraction/analyze behavior.
- `docs/ai-chat-ui-plan.local.md` already matched the verified translation/history contract, so no contract correction was required there.

## Validation

- Real API smoke: score, feedback, and translation completed through Node → FastAPI mock → MongoDB; history grew from 2 to 3 records; detail read-back kept the same ID and did not add a record.
- Real translation response: `translated`, `notes`, `meta`; adapter produced readable text with no `[object Object]` or raw JSON.
- Adapter checks: actual response, legacy JSON `resultText`, partial sections, malformed result, and invalid history record.
- Error checks: backend 400 query validation, 404 detail, and 503 while FastAPI was stopped; FastAPI and backend were restarted and returned 200 health responses.
- `npm run build`: Passed.
- `npm run lint`: Passed.
- `git diff --check`: Passed.
- No frontend automated test framework is configured; adapter checks ran as a temporary pure-function script and were removed.

## Follow-up

- Perform authenticated browser click-through when a browser runtime/session is available.
- Consider a safe timeout harness for a real 504 check if backend test configuration exposes one.
