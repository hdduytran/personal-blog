# 🏗️ Implementation Plan v2 — Personal IT Blog

## Decisions Log

| Quyết định | Lựa chọn |
|---|---|
| Content Pipeline | Git Submodule — vault riêng, mount vào Next.js repo |
| Dark Mode | Light-first, toggle sang dark |
| Search | Chưa cần (thêm sau khi có nhiều bài) |
| Mermaid | Có — render mermaid code blocks thành diagrams |
| Design | Clean minimalist zinc, light-first + dark toggle |
| Ngôn ngữ | Tiếng Việt chính, đôi khi tiếng Anh |
| Features bổ sung | RSS, OG Image gen, Reading time, Copy heading link, Social sharing, Back to top, Breadcrumb, Last updated, **Term Dictionary (popup/dialog)** |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | **Next.js 16** (Turbopack, `use cache`, React 19.2) | `16.2.x` |
| **Content** | **Tolaria** (Markdown + Frontmatter) via Git Submodule | — |
| **Content Parsing** | **Velite** (type-safe content at build time) | latest |
| **Markdown → HTML** | **unified** ecosystem: remark + rehype + **Shiki** | latest |
| **Styling** | **Tailwind CSS v4** (CSS-native `@theme`, Oxide engine) | `4.3.x` |
| **Font** | **Inter** via `next/font` (no layout shift) | variable |
| **Icons** | **Lucide React** | latest |
| **Mermaid** | **mermaid** (client-side render) | latest |
| **OG Images** | **@vercel/og** (Satori) | latest |
| **Deploy** | **Vercel** (SSG + ISR, Turbopack builds) | — |
| **Search (future)** | **Pagefind** (khi cần) | — |

### Tại sao Next.js 16?

- **Turbopack** là default bundler → 2-5x faster builds, 10x faster Fast Refresh
- **`use cache` directive** → explicit caching thay vì PPR, phù hợp cho static blog + ISR
- **React 19.2** → View Transitions (page transitions mượt), `<Activity>` component
- **`proxy.ts`** thay middleware → cleaner architecture
- **React Compiler** → auto memoization, không cần `useMemo`/`useCallback`

### Tại sao Tailwind CSS v4?

- **Oxide Engine (Rust)** → 5x faster full builds, 100x faster incremental
- **CSS-native config** → `@theme` blocks thay vì `tailwind.config.js`
- **No PostCSS/Autoprefixer needed** → built-in Lightning CSS
- **`@property` support** → smooth dark mode transitions
- **Container queries** → responsive components không phụ thuộc viewport

---

## Project Structure

```
personal-blog/                          ← Next.js repo
├── content/                            ← Git submodule → Tolaria vault repo
│   ├── posts/                          ← Long-form articles
│   │   ├── architecture/
│   │   │   ├── apache-apisix.md
│   │   │   └── voice-agent.md
│   │   └── ai/
│   │       └── llm-overview.md
│   ├── notes/                          ← Short-form notes
│   │   └── til-2026-07.md
│   ├── terms/                          ← Term dictionary entries
│   │   ├── api-gateway.md
│   │   ├── microservices.md
│   │   └── etcd.md
│   └── AGENTS.md                       ← Tolaria vault config
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout (3-column)
│   │   ├── page.tsx                    ← Homepage (Activity feed)
│   │   ├── globals.css                 ← Tailwind v4 @theme + base styles
│   │   │
│   │   ├── articles/
│   │   │   └── page.tsx                ← All articles list
│   │   ├── p/[slug]/
│   │   │   └── page.tsx                ← Article detail + TOC + Related
│   │   ├── notes/
│   │   │   └── page.tsx                ← All notes
│   │   ├── series/
│   │   │   ├── page.tsx                ← All series
│   │   │   └── [slug]/
│   │   │       └── page.tsx            ← Series landing page
│   │   ├── category/[slug]/
│   │   │   └── page.tsx                ← Category page
│   │   ├── tag/[slug]/
│   │   │   └── page.tsx                ← Tag page
│   │   ├── terms/
│   │   │   └── page.tsx                ← Dictionary browse page (optional)
│   │   ├── about/
│   │   │   └── page.tsx                ← About page
│   │   ├── rss.xml/
│   │   │   └── route.ts                ← RSS feed
│   │   └── og/
│   │       └── route.tsx               ← OG Image generation
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SidebarLeft.tsx         ← Navigation sidebar
│   │   │   ├── SidebarRight.tsx        ← TOC + Related posts wrapper
│   │   │   ├── MobileHeader.tsx        ← Mobile hamburger header
│   │   │   └── Footer.tsx
│   │   ├── content/
│   │   │   ├── ArticleCard.tsx         ← Horizontal article card
│   │   │   ├── NoteCard.tsx            ← Short note card (tweet-style)
│   │   │   ├── ActivityFeed.tsx        ← Mixed timeline
│   │   │   ├── SeriesNav.tsx           ← ← Prev | Part 3/5 | Next →
│   │   │   ├── SeriesCard.tsx          ← Series overview card
│   │   │   └── RelatedPosts.tsx        ← Related posts section
│   │   ├── article/
│   │   │   ├── TableOfContents.tsx     ← Sticky TOC with active tracking
│   │   │   ├── CopyHeadingLink.tsx     ← Click heading → copy anchor
│   │   │   ├── CodeBlock.tsx           ← Syntax highlight + copy + filename
│   │   │   ├── MermaidDiagram.tsx      ← Client-side mermaid render
│   │   │   ├── HtmlVisualization.tsx   ← Raw HTML embed (sandboxed)
│   │   │   └── SocialShare.tsx         ← Share buttons
│   │   ├── terms/
│   │   │   ├── TermHighlighter.tsx     ← Wrap matched terms in post body
│   │   │   └── TermPopup.tsx           ← Floating popup/dialog for term
│   │   ├── ui/
│   │   │   ├── ThemeToggle.tsx         ← Light/Dark mode switch
│   │   │   ├── BackToTop.tsx           ← Scroll to top button
│   │   │   ├── Breadcrumb.tsx          ← Category > Series > Post
│   │   │   ├── TagBadge.tsx            ← Tag pill
│   │   │   └── ReadingTime.tsx         ← "X phút đọc"
│   │   └── seo/
│   │       └── JsonLd.tsx              ← Structured data
│   │
│   └── lib/
│       ├── content.ts                  ← Content query helpers
│       ├── terms.ts                    ← Term matching logic
│       ├── reading-time.ts             ← Word count → minutes
│       ├── toc.ts                      ← Extract headings
│       └── related.ts                  ← Related posts algorithm
│
├── velite.config.ts                    ← Velite content schema
├── next.config.ts                      ← Next.js 16 config
├── .gitmodules                         ← Git submodule config
├── package.json
└── tsconfig.json
```

---

## Phase 1: Project Setup

### Mục tiêu
Next.js 16 + Tailwind CSS v4 + Git submodule + Velite chạy được.

---

#### [NEW] `package.json`
Khởi tạo Next.js 16 project:
```bash
npx -y create-next-app@latest ./ --typescript --tailwind --app --src-dir --turbopack --no-eslint
```
Cài thêm dependencies:
- `velite` — content parsing
- `shiki` — syntax highlighting
- `rehype-shiki`, `remark-gfm`, `remark-math` — markdown plugins
- `lucide-react` — icons
- `mermaid` — diagrams
- `isomorphic-dompurify` — HTML sanitization

#### [NEW] `.gitmodules`
```
[submodule "content"]
    path = content
    url = git@github.com:<user>/second-brain.git
    branch = main
```

#### [NEW] `velite.config.ts`
Velite schema definitions cho 3 content types:

**Post schema:**
```typescript
{
  slug, title, description, tags, category,
  series, series_order, published, featured,
  cover_image, created, updated,
  body, raw, toc, readingTime
}
```

**Note schema:**
```typescript
{ slug, created, published, tags, body }
```

**Term schema:**
```typescript
{ slug, title, aliases, definition, tags, related, body }
```

#### [NEW] `next.config.ts`
- Velite plugin integration
- Git submodule content path
- Turbopack (default in Next.js 16)
- Image optimization config

#### [NEW] `tsconfig.json`
Path aliases: `@/*` → `./src/*`

---

## Phase 2: Design System & Layout

### Mục tiêu
Tailwind v4 theme + component classes + 3-column layout + dark mode.

---

#### [NEW] `src/app/globals.css`

Tailwind v4 CSS-native config:

```css
@import "tailwindcss";

/* ===== Design System Theme ===== */
@theme {
  /* Colors — Zinc-based palette */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-hover: #f4f4f5;
  --color-text-primary: #18181b;
  --color-text-secondary: #52525b;
  --color-text-muted: #a1a1aa;
  --color-border: #e4e4e7;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Spacing */
  --spacing-sidebar: 260px;
  --spacing-sidebar-right: 280px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

/* ===== Dark Mode Override ===== */
[data-theme="dark"] {
  --color-bg-primary: #09090b;
  --color-bg-secondary: #18181b;
  --color-bg-hover: #27272a;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-border: #27272a;
  --color-accent: #3b82f6;
  --color-accent-hover: #60a5fa;
}

/* ===== Component classes ===== */

/* Layout */
.layout-main { /* 3-column grid */ }
.sidebar-left { /* fixed left nav */ }
.sidebar-right { /* sticky right panel */ }
.content-area { /* center content */ }

/* Cards */
.card-article { /* horizontal article card */ }
.card-note { /* tweet-style note card */ }
.card-series { /* series overview card */ }

/* Article prose */
.prose-article { /* article body typography */ }
.prose-article h2 { /* ... */ }
.prose-article pre { /* code block wrapper */ }
.prose-article code { /* inline code */ }

/* Code blocks */
.code-block { /* shiki code container */ }
.code-block-header { /* filename tab */ }
.code-block-copy { /* copy button */ }

/* TOC */
.toc-container { /* sticky toc wrapper */ }
.toc-item { /* toc entry */ }
.toc-item-active { /* active heading */ }

/* Term popup */
.term-highlight { /* underline style in prose */ }
.term-popup { /* floating dialog */ }
```

> [!NOTE]
> Tailwind v4 cho phép dùng cả utility classes (`flex`, `gap-4`, `text-sm`...) VÀ custom component classes (`.card-article`, `.prose-article`...) trong cùng một hệ thống. Component classes dùng `@apply` hoặc viết CSS thuần với theme tokens.

#### [NEW] `src/app/layout.tsx`
- Root layout: `<html lang="vi" data-theme="light">`
- `next/font` cho Inter (variable, no layout shift)
- 3-column Tailwind grid layout
- `<SidebarLeft>` + `<main>` + slot cho `<SidebarRight>`

#### [NEW] `src/components/layout/SidebarLeft.tsx`
- Logo/avatar + blog name
- Nav sections: Home, Articles, Notes, Series, Terms (Dictionary)
- WORK section: About
- Tags section (bottom, auto-generated from all posts)
- Badge count per nav item
- Mobile: slide-in drawer with backdrop

#### [NEW] `src/components/layout/SidebarRight.tsx`
- Context-aware wrapper (React Server Component)
- Article page → render `<TableOfContents>` + `<RelatedPosts>`
- Other pages → render featured posts hoặc hidden

#### [NEW] `src/components/layout/MobileHeader.tsx`
- Sticky top bar: avatar + blog name + hamburger toggle
- Tailwind responsive: `lg:hidden`

#### [NEW] `src/components/layout/Footer.tsx`
- Copyright + "Built with Next.js & Tolaria"

#### [NEW] `src/components/ui/ThemeToggle.tsx`
- Client component (`'use client'`)
- Sun ↔ Moon icon animation
- `localStorage` persistence
- Respects `prefers-color-scheme` on first load
- Sets `data-theme` on `<html>` element

---

## Phase 3: Core Pages

### Mục tiêu
Tất cả routes chính render content từ Velite.

---

#### [NEW] `src/lib/content.ts`
```typescript
getAllPosts()           // sorted by date, published only
getPostBySlug(slug)
getAllNotes()
getPostsByCategory(category)
getPostsByTag(tag)
getPostsBySeries(series)
getAllSeries()          // unique series + metadata + post count
getAllCategories()      // unique categories + counts
getAllTags()            // unique tags + counts
getFeaturedPosts()     // featured: true
```

#### [NEW] `src/app/page.tsx` — Homepage
- Hero section: avatar, blog name, bio, social links (X, GitHub, LinkedIn)
- **Tab navigation**: Activity | Articles | Notes (client-side tab switch)
- Activity tab: mixed timeline (notes + articles interleaved by date)
- Articles tab: horizontal article cards
- Notes tab: note cards only

#### [NEW] `src/components/content/ArticleCard.tsx`
- Horizontal layout: thumbnail (left) + content (right)
- Title (font-bold), description (line-clamp-2, hidden on mobile), meta (date · reading time)
- Series badge if applicable: "Part 3 · System Design"
- Premium lock icon (nếu có)
- Hover: background change + subtle scale

#### [NEW] `src/components/content/NoteCard.tsx`
- Twitter/Threads style: avatar (32px) + author + relative time
- Text content (multi-paragraph)
- Optional: restack card (embedded article link with cover image + gradient overlay)

#### [NEW] `src/components/content/ActivityFeed.tsx`
- Merges notes + articles by date
- Renders appropriate card type per item

#### [NEW] `src/app/articles/page.tsx`
- All published articles, newest first
- Optional category filter tabs

#### [NEW] `src/app/p/[slug]/page.tsx` — Article Detail ⭐

Đây là trang phức tạp nhất:
- `generateStaticParams()` → pre-render all post slugs
- `generateMetadata()` → dynamic title, description, OG image
- **Breadcrumb**: Home > Category > [Series >] Post title
- **Meta bar**: date, last updated, reading time, tags
- **Series nav** (if in series): ← Prev | "Part 3 of 5" | Next →
- **Article body**: rendered HTML with:
  - Shiki code blocks (copy button, filename tab, line highlight)
  - Mermaid diagrams (auto-detected from ```mermaid blocks)
  - HTML visualizations (from `<!-- viz:xxx -->` markers)
  - **Term highlights** (auto-matched terms with popup on click)
  - Copy anchor link on headings (h2-h4)
- **Social share** buttons (bottom)
- **Related posts** (bottom, below article)

Right sidebar on this page:
- **Table of Contents** (sticky, active tracking)
- **Related Posts** (below TOC)

#### [NEW] `src/app/notes/page.tsx`
- All notes, newest first

#### [NEW] `src/app/series/page.tsx`
- Grid of series cards
- Each card: series name, post count, last updated, short description

#### [NEW] `src/app/series/[slug]/page.tsx`
- Series landing: ordered list of posts
- Visual progress (numbered, with links)

#### [NEW] `src/app/category/[slug]/page.tsx`
- Posts filtered by category

#### [NEW] `src/app/tag/[slug]/page.tsx`
- Posts filtered by tag

#### [NEW] `src/app/about/page.tsx`
- About the author, intro, contact

---

## Phase 4: Article Features

### Mục tiêu
TOC, code blocks, mermaid, related posts, series nav.

---

#### [NEW] `src/lib/toc.ts`
- Parse rendered HTML → extract h2, h3, h4
- Return `{ id, text, level, children }[]` nested tree

#### [NEW] `src/components/article/TableOfContents.tsx`
- Client component
- Render heading tree as nested list
- `IntersectionObserver` → highlight active heading
- Tailwind: `sticky top-24` positioning
- Smooth scroll on click
- Responsive: floating drawer on mobile (`lg:block hidden`)

#### [NEW] `src/lib/related.ts`
Algorithm (no database needed):
```
Score each post:
  +10  same series (adjacent parts)
  +5   same category
  +2   per overlapping tag
  +3   wikilink relationship
Sort by score desc → return top 4
```

#### [NEW] `src/components/content/RelatedPosts.tsx`
- Grid of 2-4 related post cards (compact variant)

#### [NEW] `src/components/article/CodeBlock.tsx`
- Shiki syntax highlighting (build-time via rehype-shiki plugin)
- File name tab header (if specified)
- Copy to clipboard button (top-right)
- Line numbers (optional)
- Line highlighting (`// [!code highlight]`)
- Diff support (`// [!code ++]` / `// [!code --]`)

#### [NEW] `src/components/article/MermaidDiagram.tsx`
- Client component, `next/dynamic` with `ssr: false`
- Detect ```mermaid code blocks → render SVG
- Theme-aware (light/dark mermaid theme)

#### [NEW] `src/components/article/HtmlVisualization.tsx`
- Parse `<!-- viz:xxx -->` markers in markdown
- Load HTML from `/content/visualizations/xxx.html`
- Render via `dangerouslySetInnerHTML` + DOMPurify
- Wrapped in styled container with border

#### [NEW] `src/components/article/CopyHeadingLink.tsx`
- Rehype plugin adds anchor `id` to h2-h4
- On hover: show link icon
- On click: copy `window.location.origin + path + #id` → toast "Đã copy!"

#### [NEW] `src/components/article/SocialShare.tsx`
- Buttons: X (Twitter), Facebook, LinkedIn
- Pre-populated share intent URLs

#### [NEW] `src/components/content/SeriesNav.tsx`
- Sticky or inline series navigation
- "← Bài trước | Phần 3/5 | Bài tiếp →"
- Small progress bar visual
- Link to series landing page

---

## Phase 5: Term Dictionary (Popup/Dialog)

### Mục tiêu
Auto-match thuật ngữ IT trong bài viết, hiển thị popup/dialog khi click — **không gián đoạn reading flow**.

---

### UX Flow

```
Người đọc đang đọc bài viết
    ↓
Gặp từ "API Gateway" (có đường gạch chấm dưới, nhẹ nhàng)
    ↓
Click hoặc hover
    ↓
Floating popup xuất hiện NGAY TẠI VỊ TRÍ con trỏ
    ↓
┌─────────────────────────────────┐
│  📘 API Gateway                 │
│                                 │
│  Một reverse proxy đứng trước   │
│  backend services, xử lý        │
│  routing, auth, rate limiting.   │
│                                 │
│  Tags: #architecture #micro...  │
│                                 │
│  [Xem chi tiết →]              │
│  [Đóng ✕]                      │
└─────────────────────────────────┘
    ↓
Click ngoài popup hoặc nhấn ESC → popup biến mất
Người đọc tiếp tục đọc bài (scroll position không đổi)
```

> [!IMPORTANT]
> **Nguyên tắc**: Popup **floating** (Popover API hoặc absolute positioning), **KHÔNG phải modal full-screen**. Người đọc không bị redirect, không bị mất vị trí đọc. "Xem chi tiết →" mở sang tab mới nếu cần đọc sâu hơn.

---

#### [NEW] Term content schema (trong `velite.config.ts`)

```yaml
# /content/terms/api-gateway.md
---
type: Term
title: API Gateway
aliases:
  - "api gateway"
  - "API GW"
definition: "Một reverse proxy đứng trước backend services, xử lý routing, auth, rate limiting."
tags:
  - architecture
  - microservices
related:
  - "[[microservices]]"
  - "[[load-balancer]]"
---

# API Gateway

(Nội dung chi tiết cho trang dictionary — optional)
```

#### [NEW] `src/lib/terms.ts`
Build-time processing:
1. Load all term entries (title + aliases + definition)
2. Build sorted list of patterns (longest first, case-insensitive)
3. `matchTermsInHtml(html, terms)`:
   - Regex match term titles + aliases trong text nodes
   - **Skip**: code blocks (`<pre>`, `<code>`), headings (`<h1>`-`<h6>`), existing links (`<a>`), existing term spans
   - Wrap matched text: `<span class="term-highlight" data-term-slug="api-gateway" data-term-title="API Gateway" data-term-def="...">`
   - Only match **first occurrence** per term per article (avoid noise)

#### [NEW] `src/components/terms/TermHighlighter.tsx`
- Server component wrapper
- Receives post HTML + all terms
- Calls `matchTermsInHtml()` → outputs modified HTML
- Styling: subtle dotted underline (`border-bottom: 1px dotted var(--color-accent)`)

#### [NEW] `src/components/terms/TermPopup.tsx`
- Client component (`'use client'`)
- Global event listener trên `[data-term-slug]` elements
- **On click**: show floating popup anchored to clicked element
  - Sử dụng CSS `anchor()` positioning (modern) hoặc JS positioning fallback
  - Content: term title, definition, tags, "Xem chi tiết →" link (opens new tab)
- **On click outside / ESC / scroll away**: dismiss popup
- **Animation**: fade-in + slight scale (`opacity 0→1, scale 0.95→1`)
- **Mobile**: popup hiện ở bottom (như bottom sheet nhỏ) để dễ đọc

#### [NEW] `src/app/terms/page.tsx` (Optional browse page)
- Alphabetical list of all terms, grouped by letter
- Client-side filter input
- Click term → expand inline definition (accordion)
- Dùng cho người muốn "browse dictionary" chứ không bắt buộc navigate đến

---

## Phase 6: SEO & Extras

### Mục tiêu
OG images, RSS, structured data, breadcrumbs.

---

#### [NEW] `src/app/og/route.tsx`
- `@vercel/og` (Satori) OG image generation
- Template: dark background + blog logo + post title + category badge
- URL: `/og?title=...&category=...`
- Referenced in `generateMetadata()` of each post

#### [NEW] `src/app/rss.xml/route.ts`
- RSS 2.0 feed from all published posts
- title, description, pubDate, link, content snippet

#### [NEW] `src/components/seo/JsonLd.tsx`
- Reusable JSON-LD component
- Types: Person, WebSite, BlogPosting, BreadcrumbList, Article

#### [NEW] `src/components/ui/Breadcrumb.tsx`
- Home > Category > [Series] > Post title
- Schema.org BreadcrumbList markup
- Tailwind: muted text, hover accent

#### [NEW] `src/components/ui/BackToTop.tsx`
- Floating button, appears after `scrollY > 300`
- Smooth scroll to top
- Tailwind: `fixed bottom-6 right-6`, fade animation

#### [NEW] `src/components/ui/ReadingTime.tsx`
- "X phút đọc" badge

---

## Phase 7: Polish & Deploy

### Mục tiêu
Responsive, performance, deployment.

---

### Tasks

- [ ] Responsive testing: mobile (`< 768px`), tablet (`768-1024`), desktop (`> 1024`)
- [ ] Lighthouse audit: target 95+ on Performance, Accessibility, SEO
- [ ] Image optimization: `next/image`, WebP, lazy loading, priority for above-fold
- [ ] Font: `next/font` Inter variable (no layout shift, no FOUT)
- [ ] Turbopack: verify dev + build work correctly
- [ ] Vercel deployment:
  - Enable Git submodules in Settings > Git
  - Configure build command
  - Custom domain (nếu có)
- [ ] Test Git workflow:
  - Write content in Tolaria → commit → push vault repo
  - Verify Vercel auto-rebuilds
- [ ] Dark mode: verify all pages/components render correctly in both modes
- [ ] Mobile hamburger menu: slide animation, backdrop, body scroll lock

---

## Verification Plan

### Automated
```bash
# Build check (Turbopack)
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Manual Checklist
- [ ] Homepage: Activity, Articles, Notes tabs switch correctly
- [ ] Article detail: TOC tracks active heading on scroll
- [ ] Article detail: code blocks have copy button, syntax highlighting works
- [ ] Article detail: mermaid diagrams render correctly
- [ ] Article detail: HTML visualizations render safely
- [ ] Article detail: **term popup** shows on click, dismisses on outside click/ESC
- [ ] Article detail: term popup doesn't interrupt scroll position
- [ ] Series navigation: prev/next links work, series landing shows all parts
- [ ] Dark mode: toggle persists across refreshes, respects system preference
- [ ] RSS feed validates (W3C Feed Validator)
- [ ] OG images generate correctly (preview on X/Facebook/LinkedIn)
- [ ] Mobile: hamburger menu works, layout is single-column
- [ ] Mobile: TOC is accessible via floating button/drawer
- [ ] Mobile: term popup shows as bottom sheet
- [ ] Git submodule: content push → Vercel auto rebuild
- [ ] Breadcrumbs show correct hierarchy on all pages
- [ ] Social sharing links generate correct share URLs
- [ ] Related posts show relevant suggestions
- [ ] Back to top button appears and works
- [ ] Reading time displays correctly
- [ ] Copy heading link works (click → copy URL with anchor)
