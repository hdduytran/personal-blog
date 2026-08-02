# Design Guidelines

The visual design is a monochrome **zinc** palette with a single blue accent.
Light mode is the default; dark mode is a first-class variant.

## 1. Color System

Tokens are defined in `src/app/globals.css` via Tailwind v4 `@theme` and overridden
under `[data-theme="dark"]`.

### Light theme

| Token | Hex | Usage |
| ----- | --- | ----- |
| `canvas` | `#ffffff` | Page background |
| `surface` | `#fafafa` | Cards, raised panels, table headers |
| `hover` | `#f4f4f5` | Hover fills, tag chips, code inline bg |
| `ink` | `#18181b` | Primary text |
| `ink-soft` | `#71717a` | Secondary text, meta |
| `ink-mute` | `#a1a1aa` | Muted text, icons, labels |
| `line` | `#f4f4f5` | Borders, dividers |
| `accent` | `#2563eb` | Links, active states, CTA, focus |

### Dark theme (`data-theme="dark"`)

| Token | Hex | Usage |
| ----- | --- | ----- |
| `canvas` | `#09090b` | Page background |
| `surface` | `#18181b` | Cards, raised panels |
| `hover` | `#27272a` | Hover fills, chips |
| `ink` | `#fafafa` | Primary text |
| `ink-soft` | `#a1a1aa` | Secondary text |
| `ink-mute` | `#71717a` | Muted text |
| `line` | `#27272a` | Borders |
| `accent` | `#3b82f6` | Links, active states |

> Use semantic tokens (`bg-canvas`, `text-ink-soft`, `border-line`, `text-accent`)
> in markup — never raw hex values.

## 2. Typography

- **Inter** — body and UI text (`--font-sans` via `next/font`).
- **Roboto Mono** — code and monospace (`--font-mono`).
- Loaded with `next/font` (`src/app/fonts.ts`) with `display: swap`, exposed as
  `--font-inter` / `--font-mono-inter` CSS variables.
- Article body (`.prose`): `1rem` / `1.75` line-height, headings `2em`–`2.2em`
  top margins, `tracking-tight` on page titles, uppercase `tracking-wider` labels
  for section headings (Views / Folders / Work / On this page / Related).
- Font sizes: page H1 `text-3xl`, section H1 `text-2xl`, card titles `text-base`
  (semibold), meta `text-xs`–`text-sm`, code `0.875rem`.

## 3. Spacing, Radii & Layout

| Element | Value |
| ------- | ----- |
| Sidebar width | `--sidebar-w: 260px` (left), `--sidebar-right-w: 280px` (right) |
| Max content width | `max-w-[1480px]` |
| Grid | `lg:grid-cols-[minmax(0,1fr)_var(--sidebar-right-w)]`, `gap-10` |
| Card radius | `rounded-xl` (12px) / `rounded-2xl` (16px) |
| Card border | `border border-line`, hover `hover:bg-hover` |
| Chip/pill radius | `rounded-full`, padding `px-2.5 py-0.5`, `text-xs` |
| Stack spacing | `space-y-4` (listings), `space-y-6` (right rail) |
| Content padding | page `px-4 py-8`, articles `pb-8` section rhythm |
| Section divider | `border-b border-line` / `.divider` |
| Avatar | `rounded-full border border-line`, 48px (sidebar) / 64px (home) |

## 4. Component Inventory

### Layout

| Component | File | Behavior |
| --------- | ---- | -------- |
| `AppFrame` | `src/components/layout/AppFrame.tsx` | Sticky mobile header (menu + title + theme toggle), desktop sidebar, mobile drawer overlay, inline theme-init script |
| `MainLayout` | `src/components/layout/MainLayout.tsx` | Center column + optional sticky right rail |
| `SidebarLeft` | `src/components/layout/SidebarLeft.tsx` | Profile header, Views, Folders, Work, Tags, copyright + theme toggle |
| `NewsletterBox` | `src/components/layout/NewsletterBox.tsx` | Kit.com signup form; renders `null` when disabled in `profile.md` |

### Content

| Component | File | Behavior |
| --------- | ---- | -------- |
| `ActivityFeed` | `src/components/content/ActivityFeed.tsx` | Merged post+note timeline with dot/line markers |
| `ArticleCard` | `src/components/content/ArticleCard.tsx` | Folder letter tile, meta row, title, excerpt, tags |
| `NoteCard` | `src/components/content/NoteCard.tsx` | Inline rendered note body |
| `HomeTabs` | `src/components/content/HomeTabs.tsx` | Activity / Articles / Notes tabs (accent underline active) |
| `RelatedPosts` | `src/components/content/RelatedPosts.tsx` | Right-rail "Related" list |
| `SeriesNav` | `src/components/content/SeriesNav.tsx` | prev / next + `n / total` series progress |

### Article & Terms

| Component | File | Behavior |
| --------- | ---- | -------- |
| `ArticleBody` | `src/components/terms/ArticleBody.tsx` | Term popup (positioned, Escape/outside-click close), copy-heading-link (`✓` feedback), mermaid render |
| `TableOfContents` | `src/components/article/TableOfContents.tsx` | "On this page", indented by depth, scroll-spy highlight |
| `SocialShare` | `src/components/article/SocialShare.tsx` | X / Facebook / LinkedIn / copy-link circular buttons |
| `Breadcrumb` | `src/components/ui/Breadcrumb.tsx` | Home / folder / title with `/` separators |

### UI atoms

| Component | File | Behavior |
| --------- | ---- | -------- |
| `ThemeToggle` | `src/components/ui/ThemeToggle.tsx` | Sun/Moon icon, toggles `data-theme` + `localStorage` |
| `BackToTop` | `src/components/ui/BackToTop.tsx` | Fixed bottom-right, appears after 400px scroll |
| `ActiveLink` | `src/components/ui/ActiveLink.tsx` | Sidebar nav active highlight (exact or prefix) |
| `Icon` | `src/components/ui/Icon.tsx` | Name→lucide-react map with inline brand SVGs |
| `ReadingTime` | `src/components/ui/ReadingTime.tsx` | `· N min read` |

## 5. Dark Mode

- Controlled by `data-theme` on `<html>` (values `light` / `dark`), default `light`.
- Persisted in `localStorage['theme']`; falls back to `prefers-color-scheme`.
- An inline script in `AppFrame` applies the theme pre-paint to avoid flash.
- Tailwind `dark:` variants work via `@custom-variant dark`; Shiki code blocks swap
  via `--shiki-light` / `--shiki-dark`.
- OG image generator uses the dark palette (`#09090b` bg, `#fafafa` ink, `#3b82f6`
  accent) regardless of viewer theme.

## 6. Responsive Behavior

| Breakpoint | Behavior |
| ---------- | -------- |
| `< lg` (mobile/tablet) | Sidebar hidden; sticky header with hamburger → 280px drawer; right rail hidden; cards stack full-width |
| `>= lg` (desktop) | 3-column layout: 260px sticky sidebar + fluid center + 280px sticky right rail |
| Article page | H1 `text-3xl` on all sizes; prose scales naturally; tables scroll horizontally (`.prose table { overflow-x: auto }`) |

## 7. Motion & Micro-Interactions

- Subtle `transition-colors` on links, cards, chips, and icon buttons.
- Hover: cards get `bg-hover`, links get `text-accent` (cards' titles too).
- Active sidebar item: `bg-hover text-ink font-medium`.
- `scroll-behavior: smooth` + `scroll-padding-top: 80px` for anchor jumps.
- Term popup and mobile drawer: instant show/hide (no entrance animation).
- Back-to-top fades in/out via opacity.

## 8. Content Styling Rules (`.prose`)

- First paragraph uses default spacing; `> * + *` adds `1.1em` margins.
- `h2`/`h3`/`h4` get `scroll-margin-top: 80px` so anchored sections clear the
  sticky mobile header.
- Code blocks: `bg-surface`, `border-line`, 12px radius, `0.875rem`; inline code:
  `bg-hover`, 6px radius.
- Blockquotes: left 3px `line` border, `ink-soft` text.
- Images: 12px radius + `border-line`.
- Term links: accent color, dotted underline, `cursor: help`.
