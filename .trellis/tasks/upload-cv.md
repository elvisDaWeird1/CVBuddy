# Task: Upload CV frontend

## Goal

Add applicant CV upload from the frontend through the backend CV management API.

## Scope

In:
- Upload PDF/DOCX CV files through `POST /cvs`.
- Show basic uploaded CV list from `GET /cvs`.
- Handle loading, empty, success, validation, auth, and error states.

Out:
- CV delete/detail/AI flows.
- Standalone `POST /uploads/cv` flow.

## Files touched

- `src/apis/axios.config.ts`
- `src/modules/applicant/cvApi.ts`
- `src/modules/applicant/CvPage.tsx`
- `src/modules/applicant/ApplicantProfilePage.tsx`
- `src/routes/app-router.tsx`

## Notes

- Existing pattern used: `httpClient`, local UI primitives, applicant route shell.
- API/UI states considered: file missing, invalid type, size over 10MB, upload success, backend validation errors, 401, network/list errors.
- Intentional tradeoffs: CV management uses `POST /cvs` because backend stores database records there; standalone `POST /uploads/cv` is not used.

## Validation

- Command: `npm run build`
- Result: Pass. Vite reported an existing chunk-size warning.
- Command: `npm run lint`
- Result: Pass.

## Follow-up

- Add CV detail/delete actions when that slice is requested.
