# Task: Admin dashboard sidebar

## Goal

Refactor the existing Admin metrics screen into a responsive dashboard layout with an Admin-only sidebar, while keeping its route, authorization and API behavior unchanged.

## Scope

In:
- Admin-only layout, sidebar navigation, account profile/menu and responsive drawer.
- Visual redesign of the existing User Overview metrics presentation.

Out:
- Backend, API, endpoint, auth-policy and metric-model changes.
- New Admin routes or unavailable menu items.

## Files touched

- `src/layouts/AdminLayout/*`
- `src/routes/app-router.tsx`
- `src/modules/admin/Home.tsx`

## Notes

- Existing pattern used: `ProtectedRoute`, `useAuthSession`, `AuthAvatarMenu`, local `Button` and `Card` primitives.
- API/UI states considered: existing loading, error, empty, ready and refresh states remain in `Home.tsx`.
- Intentional tradeoff: only the existing `/admin` Overview route is shown in navigation.

## Validation

- `npm run lint`: pass.
- Canonical Node test command: 36 passed, 0 failed. (`npm test` is blocked on this machine by a broken local npm launcher.)
- `npm run build`: pass.

## Follow-up

- Add further navigation items only when their corresponding Admin routes/features exist.
