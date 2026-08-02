# Code Standards

This document defines the structural and style conventions for `personal-blog`.
Follow these when adding or modifying code in `src/`.

## 1. Language & Compiler

- **TypeScript 5, strict mode** (`strict: true` in `tsconfig.json`).
- ES2017 target, `moduleResolution: "bundler"`, `isolatedModules: true`.
- **Path alias `@/*` → `./src/*`** for all imports. Never use relative imports
  that cross into `src/` top-level groups when an alias is cleaner
  (e.g. `import { getAllPosts } from "@/lib/content"`).
- React 19 with the **React Compiler** enabled via `reactCompiler: true` in
  `next.config.ts` — do not add manual memoization where the compiler handles it.

## 2. File & Folder Naming

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Files & directories | kebab-case | `content/`, `sidebar-left.tsx`, `activity-feed.tsx` |
| React component files | kebab-case file, **PascalCase export** | `file: src/components/content/ArticleCard.tsx` |
| Helper/lib modules | kebab-case | `src/lib/markdown.ts` |
| Dynamic route folders | `[param]` lowercase, `[...path]` for catch-alls | `src/app/folder/[...path]/page.tsx` |
| CSS | single global `globals.css` + Tailwind utilities | — |

## 3. Directory Boundaries

```
src/
├── app/          # Next.js App Router: page.tsx / layout.tsx / route.tsx / route.ts
├── components/   # Presentational + client components, grouped by domain
│   ├── layout/   # page chrome (AppFrame, MainLayout, SidebarLeft, NewsletterBox)
│   ├── content/  # listings & feeds (cards, tabs, related, series)
│   ├── article/  # article extras (TOC, social share)
│   ├── terms/    # term dictionary client behavior (ArticleBody)
│   ├── seo/      # JSON-LD helpers
│   └── ui/       # generic atoms (Icon, Breadcrumb, ThemeToggle, …)
└── lib/          # build-time data layer (no React, Node fs only)
```

Components in `src/components/ui/` are generic and should not import from
`src/lib/profile` or page routes. Domain components (e.g. `SidebarLeft`) may read
from `src/lib/*`.

## 4. TypeScript Conventions

- Prefer explicit interfaces for shared shapes (see `Post`, `Note`, `Term`,
  `Profile`, `View` in `src/lib/*`).
- Use `import type` for type-only imports.
- In the unified plugin layer, `unist-util-visit`/Hast nodes are loosely typed;
  the codebase permits `/* eslint-disable @typescript-eslint/no-explicit-any */` in
  `src/lib/markdown.ts`, `src/lib/views.ts`, and `src/components/terms/ArticleBody.tsx`.
  Keep that escape hatch scoped to those files only.
- New public lib functions should return typed results (no `any` leaking out).

## 5. Server / Client Split

- **Default: server components.** Routes and layout components are async server
  components that read `src/lib/*` at build/render time.
- **Client components must start with `"use client"`.** Current client components:
  `AppFrame`, `HomeTabs`, `ArticleBody`, `SocialShare`, `TableOfContents`,
  `ActiveLink`, `BackToTop`, `ThemeToggle`.
- Client components may receive server-rendered data as props (e.g. `HomeTabs`
  receives `activity`/`articles`/`notes` React nodes; `ArticleBody` receives pre-
  highlighted HTML + term data). Do not move data fetching into client components.

## 6. Route Patterns

Every dynamic route follows this shape:

```tsx
export async function generateStaticParams() {
  const items = await getItems()          // list of slugs
  return items.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params            // params is a Promise in Next.js 16
  const item = await getBySlug(slug)
  return { title: item?.title ?? "Fallback" }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getBySlug(slug)
  if (!item) notFound()
  // …
}
```

- `params` (and `searchParams`) are **Promises** in Next.js 16 — always `await` them.
- Use `notFound()` for missing content, never throw raw 500s.
- Prefer `generateStaticParams` so pages are statically generated at build time.

## 7. Styling

- **Tailwind CSS v4** with `@theme` tokens defined in `src/app/globals.css`.
  Reference semantic tokens (`bg-canvas`, `text-ink-soft`, `border-line`,
  `bg-hover`, `text-accent`, `bg-surface`) instead of raw hex values in markup.
- Arbitrary values (e.g. `max-w-[1480px]`, `w-[280px]`) are acceptable for layout
  constants; prefer `--sidebar-w`/`--sidebar-right-w` tokens where available.
- Dark mode is driven by `[data-theme="dark"]` on `<html>`; CSS uses
  `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
  so Tailwind `dark:` variants work, and Shiki tokens switch via
  `var(--shiki-light)`/`var(--shiki-dark)`.
- Article typography lives in the `.prose` ruleset in `globals.css` — extend there,
  not with per-page overrides.

## 8. Data & Identity

- **Never hardcode personal data** (names, URLs, emails, handles) in `src/`. All
  identity flows through `src/lib/profile.ts` from `content/profile.md`.
- Keep the `content/` directory out of source control (`/content/` in `.gitignore`).
- Content is read with `node:fs` at build time only; do not add runtime network
  calls or a database.

## 9. Linting & Formatting

- ESLint via `eslint.config.mjs`: `eslint-config-next/core-web-vitals` +
  `eslint-config-next/typescript`. Run `npm run lint`.
- There is **no formatter (Prettier) and no test runner** configured. Keep code
  consistent with surrounding files by inspection; follow existing 2-space indent,
  semicolon-less style (the codebase currently omits semicolons in most files).
- Components use `function` declarations + named exports; avoid default exports.

## 10. Modularization Guidance

- If a `src/lib/*` or component file exceeds **~200 lines**, consider splitting it:
  - Separate concerns (e.g. extraction of a pipeline vs. helpers).
  - Check for an existing module that already owns the concern (e.g. slug helpers
    live in `slug.ts`, date formatting is duplicated per-component — consider a
    shared util when consolidating).
  - Use long, self-documenting kebab-case filenames (e.g.
    `highlight-terms.ts`) even if the name is long.
- Keep prose components small; push imperative DOM logic (observers, popup
  positioning, copy handlers) into `"use client"` components with
  `useEffect`-based setup, as `ArticleBody` and `TableOfContents` already do.

## 11. Documentation

- Keep this repo's user-facing docs in `docs/` (kebab-case filenames, English).
- Update `docs/codebase-summary.md` LOC tables and module tables when the
  `src/lib` surface changes materially.
- Do not add comments to application code unless they clarify non-obvious
  behavior (existing code keeps comments minimal and in English).
