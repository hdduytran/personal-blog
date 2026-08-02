# Project Roadmap

Status legend: **Done** · *In progress* · Planned (parking-lot ideas).

## 1. Done — Template v1 (current)

| Item | Notes |
| ---- | ----- |
| Next.js 16 + App Router + Turbopack + React Compiler | `reactCompiler: true` in `next.config.ts` |
| Tailwind CSS v4 with zinc `@theme` tokens | Light-first, `data-theme` dark mode, persisted in `localStorage` |
| Content layer | Posts, notes, terms, profile, views — all build-time, file-system based |
| Tolaria-style 3-column layout | 260px sidebar / center / 280px right rail, mobile drawer |
| Markdown pipeline | GFM, `[[wikilinks]]`, mermaid placeholders, Shiki dual-theme, autolink headings |
| Article page | TOC, reading time, dates, tags, series nav, related posts, social share, breadcrumb, back-to-top, JSON-LD |
| Term dictionary | `content/terms` → highlighted `.term-link`s + click popup in `ArticleBody` + `/terms` index + `/terms/[slug]` pages |
| Views | YAML-curated filters (`content/views/*.yml`) with `all`/`any` groups |
| RSS 2.0 feed | `/rss.xml` |
| Dynamic OG images | `/og/[slug]` via `next/og` |
| Profile-driven identity | No hardcoded personal data; neutral fallback if `profile.md` missing |
| Content submodule workflow | `/content/` ignored in git; deployment instructions |

## 2. Near Term (next release)

| Item | Rationale | Suggested approach |
| ---- | --------- | ------------------ |
| Deploy to Vercel | Template ships with a deploy button | See `docs/deployment-guide.md` |
| Make RSS `siteUrl` configurable | `/rss.xml` currently hardcodes `https://example.com`; feeds will point at the wrong domain until fixed | Add `site_url` to `profile.md` (or `NEXT_PUBLIC_SITE_URL`), fall back to `example.com` |
| SEO audit | Validate metadata, OG, canonical URLs, sitemap, robots | Add canonical links in `generateMetadata`; verify OG images per post |
| Site search | Navigation only reaches tagged/curated content today | Client-side index over `Post[]` (e.g. fuse.js) or a `/search` page |
| Lint/build verification in CI | Repo has lint + build scripts but no CI | GitHub Actions: `npm ci`, `npm run lint`, `npm run build` |
| Local tests | No test runner configured | Add Vitest for `src/lib` pure functions (slug, related scoring, views matching, term highlighting) |

## 3. Long Term (parking lot)

| Item | Notes |
| ---- | ----- |
| Sitemap + robots.txt | Complement RSS/SEO; trivial with Next metadata routes |
| Analytics | Optional privacy-friendly option; keep out of the template core or behind a flag |
| Comments | Requires a runtime/database or third-party embed (giscus) — conflicts with the zero-dependency goal, so gate behind a flag |
| View counters / reading stats | Needs persistence; likely out of scope for the static template |
| i18n / multi-language content | Content is `lang="vi"` by default; routing per locale is a larger change |
| MDX custom components | Currently all Markdown; MDX would allow per-post embedded components |
| Publish workflow / draft management | `published: false` already hides posts; a small CLI to scaffold a new post would help |
| Better folder/type taxonomy | `content/<top-level-dir>/**` with nested folders already forms a tree at `/folder/[...path]`; consider aligning post type tags with Tolaria `type:` field |

## 4. Guiding Principles for New Work

1. **Stay static-first.** Prefer build-time generation over runtime services; the
   template's selling point is zero-ops deployment.
2. **Zero hardcoded identity.** New features must read from `content/profile.md` or
   vault files, never from constants in `src/`.
3. **Content is a submodule.** New content-shaped features must not assume the
   `content/` folder is committed to this repo.
4. **Template ergonomics first.** Features that require a fork owner to configure
   should degrade gracefully (as `NewsletterBox` does when disabled).
5. **Keep docs in sync.** Update `docs/codebase-summary.md` and
   `docs/system-architecture.md` when the module surface changes.
