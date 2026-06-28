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
