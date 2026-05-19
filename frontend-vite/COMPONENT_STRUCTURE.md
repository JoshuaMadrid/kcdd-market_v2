# Homepage Component Structure

This document outlines the component structure and semantic HTML usage for the homepage.

## File Organization

### Main Page
- **Location:** `src/pages/HomePage.tsx`
- **Purpose:** Main page wrapper that composes all sections
- **Semantic Element:** `<main>`

### Section Components

All section components are located in `src/components/home/`:

#### 1. HeroSection.tsx
- **Purpose:** Primary hero section with decorative image grids and main CTA buttons
- **Semantic Elements:**
  - `<section>` - Main container
  - `<aside>` - Decorative image grids (with `aria-hidden="true"`)
  - `<figure>` - Individual image containers
  - `<h1>` - Main heading with `id="hero-heading"`
  - `<nav>` - Button container with `aria-label="Primary actions"`

#### 2. FeaturesSection.tsx
- **Purpose:** Displays 3 main features (CBOs Submit, Donors Claim, Fulfillment Tracking)
- **Semantic Elements:**
  - `<section>` - Main container with `aria-labelledby="features-heading"`
  - `<h2>` - Screen-reader only heading (`.sr-only`)
  - `<article>` - Individual feature cards
  - `<h3>` - Feature titles

#### 3. StatsSection.tsx
- **Purpose:** Statistics and metrics with dark teal background
- **Semantic Elements:**
  - `<section>` - Main container with `aria-labelledby="stats-heading"`
  - `<h2>` - Section heading
  - `<article>` - Content block on the right
  - ARIA role `text` for stat values

#### 4. ContentBlockSection.tsx
- **Purpose:** Content section with image and CTA buttons on dark background
- **Semantic Elements:**
  - `<section>` - Main container with `aria-labelledby="content-block-heading"`
  - `<figure>` - Image placeholder with `aria-label`
  - `<article>` - Text content container
  - `<h2>` - Section heading
  - `<nav>` - Button container with `aria-label="Secondary actions"`
  - `<ul>` - Unordered list

## Semantic HTML Benefits

### Accessibility
- **ARIA Labels:** All sections have proper `aria-labelledby` or `aria-label` attributes
- **Screen Reader Support:** Hidden decorative elements use `aria-hidden="true"`
- **Heading Hierarchy:** Proper `<h1>` → `<h2>` → `<h3>` structure
- **Focus Management:** Buttons have visible focus rings for keyboard navigation

### SEO
- **Semantic Structure:** Search engines can better understand page structure
- **Meaningful Elements:** `<article>`, `<section>`, `<nav>` provide context
- **Heading Tags:** Proper hierarchy helps search ranking

### Maintainability
- **Clear Component Boundaries:** Each section is a separate, reusable component
- **Meaningful Names:** Components and elements have descriptive names
- **Comments:** Each component has location comments

## Component Props

Currently, all components are static. Future enhancements could include:

```typescript
// Example future props
interface HeroSectionProps {
  title: string
  subtitle: string
  primaryCTA: { label: string; href: string }
  secondaryCTA: { label: string; href: string }
}

interface Feature {
  icon: React.ComponentType
  title: string
  description: string
}

interface FeaturesSectionProps {
  features: Feature[]
}
```

## Button States

All buttons include:
- **Default State:** Filled or outlined
- **Hover State:** Becomes outline version
- **Focus State:** Visible ring (WCAG compliant)
- **Active State:** Slight scale down for feedback
- **Transitions:** Smooth 200ms animations

## Testing

```bash
# Build test
npm run build

# Dev server
npm run dev
```

## File Structure

```
frontend-vite/
├── src/
│   ├── pages/
│   │   └── HomePage.tsx           # Main page (uses <main>)
│   └── components/
│       └── home/
│           ├── HeroSection.tsx          # <section> with hero content
│           ├── FeaturesSection.tsx      # <section> with <article>s
│           ├── StatsSection.tsx         # <section> with stats
│           └── ContentBlockSection.tsx  # <section> with content
```

## Next Steps

To modify content:
1. **Hero Section:** Edit `HeroSection.tsx` - change title, subtitle, or button text
2. **Features:** Edit `FeaturesSection.tsx` - modify the `features` array
3. **Stats:** Edit `StatsSection.tsx` - update the `stats` array
4. **Content Block:** Edit `ContentBlockSection.tsx` - replace placeholder text

Each component is self-contained and can be modified independently!

