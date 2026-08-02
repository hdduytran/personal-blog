# Codebase Summary

## 1. Repository Layout

```
personal-blog/
├── content/                  # git submodule (ignored by .gitignore) — Markdown vault
│   ├── profile.md            # site identity (name, author, socials, SEO, newsletter)
│   ├── IT/
│   │   ├── Architectures/*.md  # blog posts
│   │   ├── notes/*.md          # notes / TIL
│   │   └── terms/*.md          # glossary terms
│   └── views/*.yml           # curated content views (Tolaria filters)
├── docs/                     # project documentation (this suite)
├── public/                   # static assets (next.svg, vercel.svg, favicon)
├── src/
│   ├── app/                  # Next.js App Router routes + global styles
│   ├── components/           # React components (layout, content, article, terms, seo, ui)
│   └── lib/                  # build-time content layer
├── next.config.ts            # reactCompiler: true
├── tsconfig.json             # strict, @/* → ./src/*
├── eslint.config.mjs         # next core-web-vitals + typescript
└── package.json
```

## 2. LOC Table

Measured with `wc -l` across TypeScript/TSX sources (totals ~2,442 lines).

| Directory | LOC | Notes |
| --------- | --- | ----- |
| `src/lib` | 774 | Content + markdown + profile + views + helpers |
| `src/app` | 694 | Routes (TS/TSX) + 207 LOC `globals.css` |
| `src/components` | 974 | Layout, content, article, terms, seo, ui |
| **Total** | **~2,442** | excludes CSS (207) |

### Key modules

| File | LOC | Responsibility |
| ---- | --- | -------------- |
| `src/lib/content.ts` | 246 | Loads posts/notes/terms from `content/IT/**`, parses gray-matter, extracts title from first H1, renders markdown, sorts, exports query helpers, caches in a module promise |
| `src/lib/markdown.ts` | 154 | unified pipeline (remark/rehype), custom `collectToc`/`remarkMermaid`/`remarkWikilink` plugins, `estimateReadingTime`, `plainTextExcerpt` |
| `src/lib/profile.ts` | 102 | Reads `content/profile.md` → `Profile` object; neutral `FALLBACK` if missing |
| `src/lib/views.ts` | 150 | YAML view definitions with `all`/`any` filter groups and operators |
| `src/lib/folders.ts` | 27 | Folder listing from `content/IT` subdirs (excludes `terms`/`notes`/`views`/`attachments`) |
| `src/lib/terms.ts` | 51 | `buildTermMatches` + `highlightTerms` (wraps phrases in `.term-link` spans) |
| `src/lib/related.ts` | 30 | `scoreRelated` + `getRelatedPosts` heuristic scoring |
| `src/lib/slug.ts` | 14 | Unicode-aware `slugify` + `fileToSlug` |

## 3. Data Flow

```
content/ (Markdown + YAML + YML)
   │  fs.readFileSync at build time
   ▼
src/lib/content.ts, profile.ts, views.ts, folders.ts
   │  gray-matter frontmatter + extractTitle (first H1)
   ▼
src/lib/markdown.ts  (unified: remark → rehype)
   │  GFM, wikilinks, mermaid placeholders, slugs, TOC, Shiki highlight
   ▼
Post[] / Note[] / Term[] / Profile / View[]  (cached in module promise)
   │  consumed by server components
   ▼
src/app/*  routes (SSG at build) + src/components/* (render)
   │
   ├── client interactivity (ArticleBody, HomeTabs, ThemeToggle, AppFrame…)
   └── special routes: /og/[slug] (ImageResponse), /rss.xml (XML Response)
```

All content is read **once** and cached: `content.ts` caches the loaded `Data` in a
module-level promise, and `profile.ts` caches the parsed `Profile`. Every route helper
(`getAllPosts`, `getPostBySlug`, etc.) awaits the same cache.

## 4. Module Responsibilities

### src/lib

- **content.ts** — Recursively walks `content/IT`, splitting files into posts (everything
  except `terms/` and `notes/`), notes (`notes/`), and terms (`terms/`). Strips the first
  H1 as the title, runs the markdown pipeline, normalizes dates, and builds a
  `titleMap` used for `[[wikilink]]` resolution. Query helpers: `getAllPosts`,
  `getPostBySlug`, `getAllNotes`, `getPostsByFolder`, `getPostsByTag`,
  `getPostsBySeries`, `getAllSeries`, `getAllTags`, `getFeaturedPosts`, `getAllTerms`,
  `getTermBySlug`. Unpublished posts (`published: false`) are filtered from public queries.
- **markdown.ts** — Builds a unified processor: `remarkParse` → `remarkGfm` →
  `remarkWikilink` (resolves `[[Title]]`/`[[Title|label]]` to `/p/slug`) →
  `remarkMermaid` (turns ```mermaid fences into placeholder divs so Shiki ignores them) →
  `remarkRehype` → `rehypeSlug` → `collectToc` (h2–h4) → `rehypeAutolinkHeadings` →
  `rehypePrettyCode` (Shiki, github-light/github-dark) → `rehypeStringify`.
- **profile.ts** — Parses `content/profile.md` into a typed `Profile`. Merges
  `blog_name`/`blog_tagline`/`author_*`/`avatar`/`social`/`email`/`sidebar_work`/
  `newsletter`/`seo`, and exposes the markdown body as `aboutContent` (used by `/about`).
- **views.ts** — Loads `content/views/*.{yml,yaml}`. Supports a root `all` or `any`
  filter group; conditions target `tags`, `title`, `body`, `type`, `folder` or any post
  field with operators `equals`, `not_equals`, `contains`, `not_contains`, `any_of`,
  `none_of`, `is_empty`, `is_not_empty`, plus optional `regex: true`. `getViews`
  returns `View[]` with post counts; `getViewPosts` returns the filtered posts.
- **folders.ts** — Lists subdirectories of `content/IT` (excluding `terms`, `notes`,
  `views`, `attachments`) with per-folder post counts, for sidebar navigation.
- **terms.ts** — Builds a phrase list from each term's title + aliases (deduped,
  longest-first) and rewrites article HTML text nodes, wrapping matches in
  `<span class="term-link" data-term-slug="…">` (skipping HTML tags).
- **related.ts** — Scores candidate posts: same series `+10`, same folder `+5`,
  shared tags `×2`; returns top 4 with a recent-posts fallback when fewer than 3 match.
- **slug.ts** — `slugify` (lowercase, unicode-aware, non-alphanumeric stripped,
  spaces → hyphens) and `fileToSlug` (strips `.md`/`.mdx`).

### src/app (routes)

See `docs/system-architecture.md` for the full routing map and SSG strategy.

### src/components

| Group | Components | Role |
| ----- | ---------- | ---- |
| `layout/` | `AppFrame` (client, mobile drawer + theme init), `MainLayout` (3-col grid), `SidebarLeft` (server nav), `NewsletterBox` | Page chrome |
| `content/` | `ActivityFeed`, `ArticleCard`, `NoteCard`, `HomeTabs` (client), `RelatedPosts`, `SeriesNav` | Content listings |
| `article/` | `SocialShare` (client), `TableOfContents` (client, scroll-spy) | Article extras |
| `terms/` | `ArticleBody` (client — term popup, copy-heading-link, mermaid) | Article body shell |
| `seo/` | `JsonLd` | Injects `application/ld+json` |
| `ui/` | `ActiveLink`, `BackToTop`, `Breadcrumb`, `Icon`, `ReadingTime`, `ThemeToggle`, `brand-icons` | Reusable atoms |

## 5. Known Caveats

- The RSS route (`src/app/rss.xml/route.ts`) currently hardcodes `siteUrl = "https://example.com"`
  in feed `<link>`s. This is a template placeholder to replace when forking (see roadmap).
- The root layout sets `lang="vi"` and the default theme via `data-theme="light"` on
  `<html>`; the theme is then overridden by the inline init script and `ThemeToggle`.
- `ArticleBody.tsx` and `SocialShare.tsx` use emoji/`✓` glyphs inside the popup and
  copy feedback — a deliberate stylistic choice, not a data source.
