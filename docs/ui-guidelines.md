# UI Guidelines

This document summarizes current CVBuddy frontend UI conventions.

## Current Styling

- Tailwind CSS v4 is imported in `src/index.css`.
- Design tokens use CSS custom properties in `:root`.
- Class merging uses `cn` from `src/utils/cn.ts`.
- Local UI primitives live in `src/components/ui`.

## Existing Primitives

- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`
- `Select`
- `Form`, `FormGroup`
- Small inline SVG icons in `icons.tsx`

## Rules

- Reuse existing primitives before creating new components.
- Keep screens responsive and readable on mobile and desktop.
- Include loading, empty, error, and success states for interactive UI.
- Keep UI changes scoped to the requested screen or component.
- Do not introduce a new UI library unless explicitly requested.

## Design source of truth

`src/index.css` is the source of truth for the frontend visual system.

Use the existing CSS variables, color palette, spacing, border radius, shadows, typography, and shared utility patterns from `src/index.css` before adding new styles.

Avoid hard-coded colors such as `#ffffff`, `#000000`, custom hex colors, or one-off shadow/radius values inside components when a matching token already exists.

When creating or updating UI, preserve the existing CVBuddy visual direction unless the task explicitly asks for a redesign.