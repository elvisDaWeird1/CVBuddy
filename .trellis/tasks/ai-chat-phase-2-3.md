# Task: AI Chat Phase 2–3

## Goal

Connect the protected AI CV Assistant page to the existing CV list and Node AI endpoints. Applicants can select a CV, provide analysis context, and review independent score and feedback results with safe partial/error states.

## Scope

In:
- CV selection from `getMyCvs`.
- Typed score and feedback API helpers through the shared `httpClient`.
- Defensive result adapter for structured `data.aiResult.result` and legacy `resultText`.
- Score, feedback, processing, empty, loading, retry, and responsive states.

Out:
- Translation, AI result history, chat/conversation UI, streaming, uploads, backend/FastAPI changes, dependency changes, commit, and push.

## Files touched

- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/aiApi.ts`
- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/components/AiProcessingState.tsx`
- `src/modules/ai/components/FeedbackPanel.tsx`
- `src/modules/ai/components/ScoreOverview.tsx`

## Notes

- Existing pattern used: local state plus `getMyCvs`, the shared `httpClient`, local Card/Button/Input/Select/Form primitives, and `VITE_API_URL` configuration.
- API contract verified: `GET /api/cvs` uses `data.cvs`; score/feedback use `POST /api/ai/cvs/:cvId/score|feedback`; action data is `data.aiResult`; structured output is `data.aiResult.result`; score is `data.aiResult.score` with `resultText` as compatibility fallback.
- API/UI states considered: CV list loading, empty, failed/retry, unavailable CV, form validation, two independent pending requests, one-request failure with the other result retained, malformed/partial result, and mapped backend statuses.
- Intentional tradeoffs: score and feedback remain two independent AI analyses because the backend has separate routes and persisted AIResult records. `Promise.allSettled` preserves either successful result; no new combined endpoint or caching was introduced.

## Validation

- Command: `npm run build`
- Result: Passed.
- Command: `npm run lint`
- Result: Passed.
- Command: `git diff --check`
- Result: Passed; Git only reported the existing LF/CRLF normalization notice for the modified page.
- Browser/manual check: Guest navigation to `/ai-chat` redirected to `/login`. Applicant/API states were not exercised because no authenticated session or running backend fixture was available.

## Follow-up

- Add translation and AIResult history in their planned phases when their frontend interaction contract is ready.
