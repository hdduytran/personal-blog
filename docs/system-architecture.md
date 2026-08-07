# System Architecture

## 1. High-Level Diagram

```mermaid
flowchart LR
    subgraph ContentRepo["content/ (git submodule)"]
        P[profile.md]
        POSTS[<top-level-dir>/** posts]
        NOTES[notes/*.md]
        TERMS[terms/*.md glossary]
        VIEWS[views/*.yml]
    end

    subgraph Lib["src/lib (build-time)"]
        CONTENT[content.ts]
        MD[markdown.ts]
        PROF[profile.ts]
        VIEW[views.ts]
        FOLDERS[folders.ts]
        TERMLIB[terms.ts]
        RELATED[related.ts]
    end

    subgraph App["src/app (routes, SSG)"]
        HOME[/]
        ART[/articles/ /notes/ /terms/]
        FOLDER[/folder/[...path]/]
        TAG[/tag/[slug]/]
        VIEWPAGE[/view/[slug]/]
        POST[/p/[slug]/]
        TERMPAGE[/terms/[slug]/]
        OG[/og/[slug]/]
        RSS[/rss.xml/]
    end

    subgraph Client["Client-side interactivity"]
        BODY[ArticleBody: term popup, copy links, mermaid]
        TOC[TableOfContents: scroll-spy]
        TABS[HomeTabs]
        THEME[ThemeToggle + AppFrame theme init]
    end

    P --> PROF
    POSTS --> CONTENT
    NOTES --> CONTENT
    TERMS --> CONTENT
    VIEWS --> VIEW
    CONTENT --> MD
    CONTENT --> TERMLIB
    CONTENT --> RELATED
    MD --> POST & ART & HOME
    PROF --> HOME & POST & OG & RSS
    VIEW --> VIEWPAGE & HOME
    CONTENT --> FOLDER & TAG & ART & POST
    TERMLIB --> POST
    CONTENT --> TERMPAGE
    POST --> BODY & TOC & THEME
    ART --> TABS
    POST --> OG
    POST --> RSS
```

ASCII fallback:

```
 content/ ──read at build time──▶ src/lib ──▶ src/app (SSG) ──▶ static HTML
   │                                 │                            │
   ├─ profile.md ─▶ profile.ts      │   routes: / /about /articles /notes
   ├─ <dir>/** ──▶ content.ts ───┐  │   /folder/[...path] /tag/[slug] /view/[slug]
   ├─ notes/*.md ─▶ content.ts   │  │   /terms /terms/[slug] /p/[slug]
   ├─ terms/*.md ─▶ terms.ts     │  │   /og/[slug]  /rss.xml
   └─ views/*.yml ─▶ views.ts    │  │
                                 │  │
   markdown.ts (unified) ◀───────┘  │
   related.ts, folders.ts, slug.ts  └── client: ArticleBody / TableOfContents /
                                         HomeTabs / AppFrame / ThemeToggle
```

## 2. Build-Time Content Pipeline

The site is **fully static**: every route renders once at build time from the file
system. There is no runtime API layer.

```
1. fs.readFileSync  →  raw Markdown/YAML from content/
2. gray-matter       →  frontmatter (data) + body (content)
3. extractTitle      →  first "# H1" becomes the title, removed from body
4. unified pipeline  →  remarkParse → remarkGfm → remarkWikilink → remarkMermaid
                     →  remarkRehype → rehypeSlug → collectToc → rehypeAutolinkHeadings
                     →  rehypePrettyCode (Shiki) → rehypeStringify
5. enrich           →  reading time, plain-text excerpt, toc, wikilink titleMap
6. cache            →  module-level promise in content.ts
```

### 2.1 Custom plugins (`src/lib/markdown.ts`)

| Plugin | Behavior |
| ------ | -------- |
| `collectToc` | Records `h2`–`h4` headings (with ids from `rehype-slug`) into `file.data.toc` |
| `remarkMermaid` | Replaces ```mermaid fenced blocks with `<div class="mermaid-block" data-code="…">` placeholders so Shiki skips them; rendered client-side |
| `remarkWikilink` | Resolves `[[Title]]` / `[[Title|label]]` via the `titleMap` resolver to `/p/slug` links |

### 2.2 Syntax highlighting

`rehype-pretty-code` + **Shiki v4** with a dual theme: `github-light` for
`[data-theme="light"]` and `github-dark` for `[data-theme="dark"]`, wired in
`globals.css` through `--shiki-light` / `--shiki-dark` variables.

## 3. Routing Map

| Route | Type | Data source | Generation |
| ----- | ---- | ----------- | ---------- |
| `/` | page | posts + notes + profile | SSG (static) |
| `/about` | page | `profile.aboutContent` | SSG |
| `/articles` | page | `getAllPosts()` | SSG |
| `/notes` | page | `getAllNotes()` | SSG |
| `/folder/[...path]` | page | `getFolderTree()`/`getFolderBySlug()` → `getPostsByFolder()` (folder + descendants) | SSG (`generateStaticParams`) |
| `/tag/[slug]` | page | `getPostsByTag()` | SSR-on-demand (dynamic, no static params) |
| `/view/[slug]` | page | `getViews()` → `getViewPosts()` | SSG (`generateStaticParams`) |
| `/terms` | page | `getAllTerms()` | SSG |
| `/terms/[slug]` | page | `getTermBySlug()` + related terms | SSG (`generateStaticParams`) |
| `/p/[slug]` | page | `getPostBySlug()` + related + terms | SSG (`generateStaticParams`) |
| `/og/[slug]` | route | `getPostBySlug()` + profile (next/og `ImageResponse`) | Static params, nodejs runtime |
| `/card/[slug]` | route | `getPostBySlug()` + profile (next/og `ImageResponse`, 384×216 card thumbnail) | Static params, nodejs runtime |
| `/rss.xml` | route | `getAllPosts()` + profile (XML `Response`) | Dynamic (on-request), cached |
| `/media/[...path]` | route | File read from `content/attachments/<path>` | Dynamic file stream, immutable cache |

### 3.1 SSR/SSG strategy

- Everything that can be enumerated is **statically generated** at build time via
  `generateStaticParams` (posts, folders, views, terms, OG images).
- `/tag/[slug]` has no static param list and is rendered on demand by the server
  (still no runtime data dependencies; cached output).
- `/rss.xml` is generated on request with `Cache-Control: s-maxage=3600,
  stale-while-revalidate`.
- The root layout injects a tiny inline script in `AppFrame` to apply the persisted
  theme before paint (avoids dark-mode flash).

## 4. Caching

- **`content.ts`**: `cachePromise` — the first `load()` kickstarts `doLoad()` and all
  query helpers share the resolved `Data` object for the lifetime of the build/server.
- **`profile.ts`**: `cached` module variable for the parsed `Profile`.
- **Next.js**: `generateStaticParams` + static rendering means most pages are emitted
  as plain HTML at build time; `rss.xml` opts into `s-maxage` CDN caching.

## 5. Client-Side Interactivity

The static HTML is progressively enhanced by a handful of `"use client"` components:

| Component | Responsibility |
| --------- | -------------- |
| `ArticleBody` | Delegated click handler for `.term-link` popup (positioned, closes on outside click/Escape), copy-heading-link buttons, lazy `import("mermaid")` rendering of `.mermaid-block` placeholders |
| `TableOfContents` | `IntersectionObserver` scroll-spy to highlight the active heading in the right rail |
| `HomeTabs` | Client-side tab switching between Activity / Articles / Notes |
| `SocialShare` | Builds X/Facebook/LinkedIn share URLs and copy-link button |
| `AppFrame` | Mobile drawer state + inline theme-init script |
| `ThemeToggle` | Sets `data-theme` on `<html>` and persists to `localStorage` |
| `ActiveLink` | Highlights current route in the sidebar using `usePathname` |

## 6. Theme (Dark Mode) Architecture

```
<html data-theme="light">   ← set by server (layout.tsx)
  │
  ├─ AppFrame inline script: read localStorage['theme'] or prefers-color-scheme,
  │     then set document.documentElement.dataset.theme (pre-paint, no flash)
  │
  ├─ ThemeToggle (client): toggles data-theme, writes localStorage
  │
  └─ globals.css: [data-theme="dark"] overrides @theme CSS variables;
        @custom-variant dark makes Tailwind dark: variants work
```

## 7. External Integrations

- **Runtime:** none. The site makes no external API calls at runtime.
- **Build time:** `next/font` fetches Inter + Roboto Mono at build from Google Fonts.
- **Newsletter:** optional — `NewsletterBox` posts to `https://app.kit.com/forms/<form_id>/subscriptions`
  (Kit form) only when `newsletter.enabled` is set in `profile.md`. Static form HTML, no SDK.
- **Social share:** pure client-side share URLs to X, Facebook, LinkedIn.

## 8. Security Notes

- `remarkRehype` runs with `allowDangerousHtml: true` and `rehypeStringify` with the
  same flag, and `ArticleBody`/`NoteCard`/`AboutPage` use `dangerouslySetInnerHTML`.
  Content is authored by the blog owner (a trusted vault), but treat vault content as
  trusted-only; do not render untrusted user input through this pipeline.
- Mermaid runs with `securityLevel: "loose"` (needed for interactive features) inside
  a single-page component.
- No secrets, env vars, or credentials are used or required.
