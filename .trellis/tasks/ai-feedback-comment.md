# Task: AI feedback comment card

## Goal

Show `company_model_feedback` as a dedicated comment for the current CV analysis and saved AI result details.

## Scope

In:
- Adapt comment data from `aiResult.result` and JSON `aiResult.resultText`.
- Prefer the scoring comment, then fall back to the feedback comment for the current analysis.
- Render the comment once in a semantic, responsive card for current and historical results.
- Keep a neutral state for missing comments and hide malformed raw JSON.

Out:
- Backend contract or endpoint changes.
- Route, auth, environment, or unrelated AI screen changes.

## Files touched

- `src/modules/ai/aiResultAdapter.ts`
- `src/modules/ai/AiChatPage.tsx`
- `src/modules/ai/components/AiCommentCard.tsx`
- `src/modules/ai/components/AiResultHistoryDetail.tsx`

## Notes

- Existing pattern used: typed result adapters, local Card primitives, CSS design tokens.
- API/UI states considered: loading, score/feedback partial success, missing comment, malformed payload, history detail.
- Intentional tradeoffs: unstructured legacy text remains separate feedback; only contract-backed `company_model_feedback` populates the dedicated comment.

## Validation

- Command: `npm run lint`
- Result: passed.
- Command: `npm run build`
- Result: passed; Vite retained its existing large-chunk warning.
- Command: read-only Node adapter acceptance checks via Vite Oxc.
- Result: passed for object/resultText mapping, score priority, feedback fallback, deduplication, multiline text, and malformed JSON.

## Follow-up

- Browser click-through was not run in this task.

