# Task: AI Chat Contract Alignment

## Goal

Align the applicant AI workspace with the verified Node-to-FastAPI contract and render every supported analysis and translation field without exposing raw objects or technical JSON.

## Scope

In:
- Source-backed AI API handoff at `docs/ai-api-frontend-handoff.local.md`.
- Typed request/result contracts, extended AI timeouts, defensive result normalization, and structured analysis type guards.
- Task-oriented score/review and English-translation flows using real backend endpoints.
- Responsive score dimensions, issues, fixes, keywords, role-fit gaps, bilingual rewrites, notes, Markdown fallback, metadata, pending/error states, retry-as-new-request, and persisted history detail.
- Source review plus real local FastAPI, Node, MongoDB, and HTTP contract checks.

Out:
- Free-form chat, conversation threads, streaming, job recommendations, delete/cancel, or a backend retry endpoint because none of those public contracts exist.
- Backend, FastAPI, database schema, dependency, commit, or push changes.

## Files touched

- `docs/ai-api-frontend-handoff.local.md` (intentionally ignored by `*.local.md`)
- `src/modules/ai/aiApi.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/aiHistoryAdapter.ts`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/components/AiRichText.tsx`
- `src/modules/ai/components/AiCommentCard.tsx`
- `src/modules/ai/components/AiProcessingState.tsx`
- `src/modules/ai/components/AiResultHistory.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`
- `src/modules/ai/components/FeedbackPanel.tsx`
- `src/modules/ai/components/ScoreOverview.tsx`
- `src/modules/ai/components/TranslationPanel.tsx`

## Notes

- Existing pattern used: shared Axios client, local React state/effects, Card/Button/Form/Input/Select primitives, Tailwind v4 utility classes, and existing CSS tokens.
- API/UI states considered: no CV, unauthenticated/forbidden, idle, pending, completed, failed, network/timeout, empty and filtered history, missing history detail, full/partial/malformed structured result, legacy plain `resultText`, translation copy feedback, and unavailable source CV.
- History summaries intentionally do not read `result`, `resultText`, or `errorMessage`; opening an item fetches the detail contract.
- Retry buttons submit a new supported AI request. They do not imply a nonexistent backend retry endpoint.
- The screen remains task-oriented because the backend exposes no free-form message or conversation API.
- No browser runtime was available in the Codex in-app Browser session, so visual click-through and console inspection could not be automated.

## Validation

- FastAPI `pytest`: 83 passed.
- Node backend `npm test`: 35 passed.
- Node AI end-to-end smoke: passed through Node → FastAPI mock → MongoDB.
- Real HTTP contract smoke: score action, history summary, result detail, and invalid review validation verified; temporary records and files cleaned.
- Frontend adapter contract check: 27 assertions passed for full, partial, legacy text, malformed JSON, bilingual rewrites, translation notes, and metadata.
- Frontend `npm run lint`: passed.
- Frontend `npm run build`: passed; existing large-chunk warning remains.
- Frontend/backend/FastAPI health checks: HTTP 200.

## Follow-up

- Run an authenticated browser click-through at desktop and mobile widths when an in-app browser runtime is available.
- Add pagination to the backend history contract before introducing pagination controls in the frontend.
