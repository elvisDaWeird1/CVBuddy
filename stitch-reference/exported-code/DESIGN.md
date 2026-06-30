---
name: Applicant First
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404752'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707883'
  outline-variant: '#bfc7d4'
  surface-tint: '#0061a4'
  primary: '#0061a4'
  on-primary: '#ffffff'
  primary-container: '#2196f3'
  on-primary-container: '#002c4f'
  inverse-primary: '#9ecaff'
  secondary: '#526069'
  on-secondary: '#ffffff'
  secondary-container: '#d3e2ed'
  on-secondary-container: '#56656e'
  tertiary: '#005faf'
  on-tertiary: '#ffffff'
  tertiary-container: '#4593f1'
  on-tertiary-container: '#002b55'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9ecaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497d'
  secondary-fixed: '#d6e5ef'
  secondary-fixed-dim: '#bac9d3'
  on-secondary-fixed: '#0f1d25'
  on-secondary-fixed-variant: '#3b4951'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is centered on the concept of "Guided Clarity." It aims to reduce the anxiety associated with job hunting for students and early-career professionals by presenting a calm, supportive, and highly organized interface. 

The aesthetic is **Corporate Modern with a Friendly Twist**. It avoids the stiffness of traditional HR software by utilizing high-quality whitespace, a soft color palette, and approachable geometry. The emotional response should be one of "I can do this"—transforming a complex task into a series of manageable, inviting steps. The visual style leans into subtle depth and soft transitions to create a tactile, trustworthy experience.

## Colors
The palette uses a monochromatic blue foundation to establish trust and professional reliability while maintaining a "light" feel.

- **Primary (#2196F3):** Used for main actions and active states. It provides high visibility without being aggressive.
- **Secondary (#E3F2FD):** A soft "Sky" tint used for large background areas, card headers, or hover states to keep the UI feeling airy.
- **Tertiary (#1976D2):** Reserved for high-contrast moments, links, and heavy-duty interactive elements.
- **Neutrals:** Crisp white (#FFFFFF) is the primary surface color. Light gray (#F8F9FA) is used for background grouping to create subtle separation between content zones.

## Typography
This design system utilizes **Plus Jakarta Sans** across all levels. Its soft, rounded terminals and modern geometric proportions make it exceptionally friendly for a student audience while remaining highly legible for resume data.

- **Headlines:** Use tight letter spacing (-0.02em) on larger sizes to maintain a "contained" and modern look.
- **Body:** Generous line heights (1.6) are mandatory to ensure long application descriptions are easy to scan.
- **Labels:** Use semi-bold weights and slight tracking for metadata and form headers to create a clear hierarchy against body text.

## Layout & Spacing
The layout follows a **8px soft-grid** system. The content should be housed in a fixed-width container (1200px) on desktop to prevent eye strain across wide monitors.

- **Desktop (1024px+):** 12-column grid with 24px gutters. Use wide 40px - 64px margins between major sections.
- **Tablet (768px - 1023px):** 8-column grid with 24px gutters.
- **Mobile (Under 768px):** 4-column grid with 16px gutters and 16px side margins. 
- **Grouping:** Use the "sm" (16px) unit for elements within a component (e.g., icon to text) and "md" (24px) for padding inside cards.

## Elevation & Depth
The design system employs **Ambient Shadows** to create a sense of organized layers without the harshness of heavy borders.

- **Level 0 (Base):** Background color #F8F9FA.
- **Level 1 (Cards/Surface):** White background with a very soft, diffused shadow: `0 4px 20px rgba(33, 150, 243, 0.08)`. Note the subtle blue tint in the shadow to maintain brand harmony.
- **Level 2 (Hover/Active):** Increased elevation with `0 8px 30px rgba(33, 150, 243, 0.12)`.
- **Interaction:** Elements should subtly lift on hover using a transform transition (`translateY(-2px)`) to provide tactile feedback to the applicant.

## Shapes
The shape language is consistently **Rounded**. This reinforces the "friendly" and "accessible" brand pillars.

- **Standard Elements:** 8px (0.5rem) for small items like tags or input fields.
- **Primary Containers:** 16px (1rem) for cards and main content areas.
- **Buttons:** 12px (0.75rem) to strike a balance between professional and soft.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use a solid #2196F3 background with white text and a 12px radius. Secondary buttons should be ghost-style with a #2196F3 border and light #E3F2FD hover fill.
- **Cards:** The core of the UI. Must have a 16px radius, Level 1 shadow, and 24px internal padding. Headers within cards should have a subtle bottom border of 1px #E3F2FD.
- **Input Fields:** Use a 8px radius with a light gray background (#F8F9FA). On focus, the border shifts to Primary Blue with a 2px outer glow.
- **Chips/Tags:** Used for "Skills" or "Job Type." These should have a 100px radius (pill), using #E3F2FD background and #1976D2 text.
- **Progress Steppers:** For application forms, use a horizontal line with rounded circles. Completed steps should be solid Primary Blue; current steps should have a blue ring.
- **Navigation:** A clean top bar with a white background and Level 1 shadow. Links use Body-MD typography with Primary Blue for the active state indicator (a 3px bottom bar).