# Task: AI chat scaffold

## Goal

Expose a protected applicant entry point for the task-based AI CV assistant and record a codebase-aligned UI plan before API integration begins.

## Scope

In:
- Applicant Header navigation item.
- Protected /ai-chat route and lightweight page scaffold.
- Detailed local UI plan based on existing frontend components, tokens, and backend AI contract.

Out:
- AI API calls, loading real CV data, mutations, chat backend, streaming, or new dependencies.

## Files touched

- src/layouts/ClientLayout/ApplicantHeader.tsx
- src/routes/app-router.tsx
- src/modules/ai/AiChatPage.tsx
- docs/ai-chat-ui-plan.local.md

## Notes

- Existing pattern used: createBrowserRouter, ProtectedRoute, ApplicantShell, ApplicantHeader, Card primitives and CSS tokens.
- Root SKILL.md is absent; used repo-local frontend-cvb-patterns and frontend-taste skills referenced by AGENTS.md.
- API/UI states considered: current backend exposes task results, not free-form chat, threads, or streaming.

## Validation

- Command:
- Result:

## Follow-up

- Phase 2 begins with CV selection and analysis form after an approved API integration task.