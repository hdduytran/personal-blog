# Project Overview & Product Development Requirements (PDR)

## 1. Project Identity

| Attribute | Value |
| --------- | ----- |
| Name | personal-blog |
| Package | `personal-blog` v0.1.0 |
| Type | Content-driven personal IT blog **template** |
| Repository | https://github.com/hdduytran/personal-blog (branch `main`) |
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| UI | React 19, Tailwind CSS v4 |
| Content layer | File-system Markdown read at build time (`content/`) |
| Language | TypeScript 5 (strict), path alias `@/*` → `./src/*` |
| Tests | None |
| Lint | ESLint (`eslint-config-next` core-web-vitals + typescript) |

## 2. Vision

Provide a **forkable, zero-config personal IT blog template**. Clone the repo, point
the `content/` submodule at your own Markdown vault, edit a single `profile.md` file,
and you have a production-ready blog with RSS, social sharing, a term dictionary,
and dynamically generated Open Graph images — without touching a line of application code.

The template is designed to be a **starting point, not a CMS**: content is plain
Markdown kept in a separate repository, and the source code ships with no personal data.

## 3. Target Users

| Persona | Needs | How the template serves them |
| ------- | ----- | ---------------------------- |
| Developer starting a tech blog | Low setup friction, looks professional out of the box | Vercel one-click deploy, sensible default content vault, no env vars required |
| Content owner who wants separation of code and content | Manage posts from Obsidian or a dedicated repo | `content/` is a git submodule; posts are plain Markdown files |
| Rebrander / forker | Swap identity quickly | All identity (name, bio, socials, SEO, newsletter) in `content/profile.md` |
| Reader | Fast, readable, searchable-by-navigation articles | Tolaria-style 3-column layout, TOC, related posts, series nav, dark mode |

## 4. Core Concepts

### 4.1 Content-first

All content lives under `content/` as plain Markdown with YAML frontmatter:

| Path | Content type | Required frontmatter |
| ---- | ------------ | -------------------- |
| `content/profile.md` | Site identity | `blog_name`, `author_*`, `social[]`, `seo` |
| `content/<top-level-dir>/**/*.md` | Blog posts | `title` (first H1), `created`, `tags[]`; optional `series`, `series_order`, `featured`, `published`, `cover_image`, `updated`, `type`, `description`, `icon`, `color` |
| `content/notes/*.md` | Notes / TIL | `created`, `tags[]` |
| `content/terms/*.md` | Glossary terms | `title`, `aliases[]?`, `definition?`, `tags[]`, `related[]?` |
| `content/views/*.yml` | Curated views | `name`, `filters` (Tolaria-style `all`/`any` groups) |

The `content/` directory is a **git submodule** by design (see
`docs/deployment-guide.md`). It is read at build time by `src/lib/*` and is never
served as static routes. Posts live in **any** top-level directory under `content/`
(except `terms/`, `notes/`, `views/`, and `attachments/`); nested subdirectories
form a hierarchical folder tree surfaced at `/folder/<path>`. The sample vault uses
`IT/` as the post root and `IT/Architectures/` for its architecture posts.

### 4.2 Zero hardcoded identity

The application source contains **no personal data**. Blog name, author name, avatar,
social links, sidebar "Work" items, newsletter configuration, SEO title/description,
and the About page body all come from `content/profile.md`. If the file is missing,
`src/lib/profile.ts` returns a neutral fallback so the app still boots.

### 4.3 Rich article experience

Articles get a first-class reading experience without any per-post setup:

- Table of contents (collected from `h2`–`h4`, with scroll-spy highlighting)
- Social share (X, Facebook, LinkedIn, copy-link)
- Related posts (heuristic scoring, see `docs/codebase-summary.md`)
- Series navigation (prev / next within `series`, ordered by `series_order`)
- Term-dictionary popups (`content/terms/*` matched in article body)
- `[[wikilinks]]` resolved to article URLs
- Mermaid diagram rendering (client-side)
- Syntax-highlighted code blocks (Shiki, dual light/dark theme)
- Reading time, published/updated dates, breadcrumb, back-to-top, copy-heading-link

### 4.4 Tolaria-style layout

A Tolaria-style 3-column layout:

- **Left sidebar (260px)** — profile header, Views, Folders, Work, Tags, theme toggle. Sticky on desktop, drawer on mobile.
- **Center column** — page content (cards, article body, tabs).
- **Right rail (280px)** — newsletter, table of contents, related posts. Sticky, hidden on mobile.

### 4.5 Cover images & icons (Tolaria-aligned)

Post and note thumbnails follow the **Tolaria vault convention** so content stays
readable and reusable outside the site. Each post/note may carry an optional
`icon` + `color` (both `_icon`/`_color` are also accepted) and an cover:

| Frontmatter | Meaning |
| ----------- | ------- |
| `cover_image` | Explicit cover path (e.g. `/media/banner.png`) |
| `icon` / `_icon` | Per-note icon: lucide/Phosphor kebab-case name, an emoji, or an image URL |
| `color` / `_color` | Accent color for the fallback badge (e.g. `#3b82f6` or `blue`) |

**Resolution order** for a thumbnail:

1. `cover_image`, else the **first inline image** found in the note body;
2. if no image, the **auto-generated card** at `/card/<slug>` (built with `next/og`,
   reuse of the OG generator): renders the note title on a dark tile tinted by
   `color`, with the Tolaria `icon` when it's an emoji;
3. if image generation is unavailable, fall back to the CSS badge: `icon` (emoji
   first, then a lucide icon by name), else the first letter of the folder name,
   tinted with `color`.

**Where it shows** — the list card (`ArticleCard`/`PostThumb`) always resolves the
thumbnail above; the article hero on the post page only renders when a **real**
image exists (`cover_image` or a body image), never the generated card. This lets
you manage a post's "cover" purely by dropping a lead image in the body or by
setting `icon`/`color` in frontmatter, with no code changes.

**Vault media:** `content/attachments/**` is served as static files at
`/media/<path>` (see `src/app/media/[...path]/route.ts`). Image refs written as
`attachments/foo.png` in markdown are automatically rewritten to `/media/foo.png`
during render (`src/lib/markdown.ts`), so the same file works locally and on the
deployed site. Unlike note directories, `attachments/` is never scanned as posts.

## 5. Feature List

| Area | Feature | Implementation |
| ---- | ------- | -------------- |
| Content | Posts, Notes, Terms, Views | `src/lib/content.ts`, `views.ts` |
| Rendering | Markdown → HTML | unified/remark/rehype pipeline (`src/lib/markdown.ts`) |
| SEO | Dynamic metadata, JSON-LD (`BlogPosting`) | `generateMetadata`, `JsonLd.tsx` |
| SEO | Open Graph images | `src/app/og/[slug]/route.tsx` (next/og) |
| Content | Auto-generated card thumbnails | `src/app/card/[slug]/route.tsx` (next/og) |
| Distribution | RSS 2.0 feed | `src/app/rss.xml/route.ts` |
| UX | Dark mode | `data-theme` attribute + `localStorage` |
| UX | Term dictionary popups | `src/lib/terms.ts` + `ArticleBody.tsx` |
| UX | Reading time | `src/lib/markdown.ts` |
| UX | Back-to-top, breadcrumb, copy heading links | `src/components/ui/*`, `ArticleBody.tsx` |
| Icons | lucide-react + inline brand SVGs | `Icon.tsx`, `brand-icons.tsx` |

## 6. Non-Goals

The template deliberately does **not** provide:

- A database, ORM, or runtime server (content is file-based, build-time only)
- Authentication / admin UI / CMS dashboard
- Comments, analytics, or view counters
- Multi-language (i18n) content routing
- Full-text site search
- MDX custom components / interactive widgets authored per-post
- A publish workflow (posts are committed to the content repo directly)

## 7. Acceptance Criteria

The template is considered "done" when a forker can go from clone to live blog with
only content changes:

1. `git clone` the template, add a public content submodule at `content/`, and edit
   `content/profile.md` to their identity.
2. `npm install && npm run build && npm run start` builds and serves successfully
   with **no environment variables** and **no source edits**.
3. The home page shows Activity / Articles / Notes tabs populated from the vault.
4. Every post in any `content/<top-level-dir>/**` is reachable at `/p/[slug]` with a generated article
   page (breadcrumb, dates, reading time, tags, series nav, share, TOC, related).
5. Glossary terms from `content/terms` render as highlighted, clickable popups in
   article bodies and as pages under `/terms/[slug]`.
6. `/rss.xml` returns a valid RSS 2.0 feed of published posts.
7. `/og/[slug]` returns a generated 1200×630 Open Graph image for each post.
8. `data-theme="dark"` toggles the full zinc palette and persists across reloads.
9. Sidebar navigation (Views, Folders, Work, Tags) reflects profile and vault data
   without code changes.
10. `npm run lint` passes on the shipped source.
