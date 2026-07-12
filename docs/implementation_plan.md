# 🏗️ Implementation Plan v3 — Personal IT Blog (Template)

## Reference Screenshots

Thiết kế bám sát phiên bản gốc hunghuc.work:

````carousel
![Home page — 3-column layout, left sidebar nav, activity feed center, newsletter right](/Users/hdduytran/.gemini/antigravity/brain/70b6de6c-b95c-4300-8627-a490cb1ababf/home_reference.png)
<!-- slide -->
![Article list — horizontal cards with thumbnails, same 3-column layout](/Users/hdduytran/.gemini/antigravity/brain/70b6de6c-b95c-4300-8627-a490cb1ababf/article_reference.png)
````

---

## Decisions Log

| Quyết định | Lựa chọn |
|---|---|
| Content Pipeline | Git Submodule — Tolaria vault riêng, mount vào Next.js repo |
| Dark Mode | Light-first, toggle sang dark |
| Search | Chưa cần (thêm sau khi có nhiều bài) |
| Mermaid | Có — render mermaid code blocks thành diagrams |
| Design | **Clean minimalist zinc** — bám sát hunghuc.work (monochrome zinc palette, Inter font, subtle borders) |
| Ngôn ngữ | Tiếng Việt chính, đôi khi tiếng Anh |
| Personal Data | **KHÔNG** hardcode trong source — tất cả lấy từ `profile.mdx` trong submodule |
| Template | Source code là **reusable template** — fork về, thay submodule, chạy |
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

---

## User Review Required

> [!IMPORTANT]
> **Source code = Template**: Source code blog sẽ **không chứa bất kỳ thông tin cá nhân nào**. Tên blog, avatar, bio, social links, contact info... tất cả được lấy từ file `profile.mdx` trong git submodule. Khi fork template, chỉ cần thay submodule content.

> [!IMPORTANT]
> **Submodule rendering rules**:
> - Chỉ render thư mục nằm trong folder `IT/` (Tolaria vault structure)
> - Chỉ render file `profile.mdx` ở root của submodule
> - **Bỏ render** các file khác nằm ngoài folder (`architecture.md`, `note.md`, `type.md`, `AGENTS.md`) — đây là Tolaria system files
> - Term dictionary cũng nằm trong submodule (folder `IT/terms/`)

> [!WARNING]
> **Cấu trúc submodule hiện tại** chỉ có `content/IT/Architectures/` với 3 bài. Cần tạo thêm cấu trúc folders cho terms, notes, và file `profile.mdx`.

---

## Open Questions

> [!IMPORTANT]
> 1. **Tolaria Views**: Bạn có muốn tạo Tolaria saved views (`.yml` files trong `views/` folder) để tự động classify content, hay chỉ dựa vào folder structure trong `IT/`?
> 2. **Sidebar "Views" items**: Bạn muốn các mục Views (giống "Luyên thuyên", "AI x Ecommerce") được **tự động phát hiện** từ Tolaria `views/*.yml` files, hay **hardcode tên** từ `profile.mdx`?
> 3. **Profile MDX content**: File `profile.mdx` cần chứa những gì ngoài: name, avatar, bio, social links, contact? Ví dụ: newsletter config, custom sidebar items?
> 4. **Newsletter**: Bạn có muốn giữ newsletter subscribe (sidebar phải) như bản gốc không? Nếu có, newsletter provider nào (Kit.com, Buttondown, etc.)?

---

## Submodule Content Structure

```
content/                              ← Git submodule → Tolaria vault repo
├── profile.mdx                       ← 🔑 User profile (BẮT BUỘC)
│
├── IT/                               ← 📂 Main content root (CHỈ render folder này)
│   ├── Architectures/                ← Folder level 1 → sidebar nav
│   │   ├── Apache APISIX.md
│   │   ├── Voice Agent Architecture.md
│   │   └── identity-and-access-management.md
│   ├── AI/                           ← Folder level 1 → sidebar nav
│   │   └── llm-overview.md
│   ├── DevOps/                       ← Folder level 1 → sidebar nav
│   │   └── ...
│   ├── terms/                        ← 📘 Term dictionary entries
│   │   ├── api-gateway.md
│   │   ├── microservices.md
│   │   └── etcd.md
│   └── notes/                        ← 📝 Short-form notes
│       └── til-2026-07.md
│
├── views/                            ← Tolaria saved views (KHÔNG render)
│   └── *.yml
├── architecture.md                   ← Tolaria Type (KHÔNG render)
├── note.md                           ← Tolaria Type (KHÔNG render)
├── type.md                           ← Tolaria Type (KHÔNG render)
└── AGENTS.md                         ← Tolaria config (KHÔNG render)
```

### `profile.mdx` Schema

```mdx
---
# Blog Identity
blog_name: "hunghuc.work"
blog_tagline: "Blog của Hùng Hà. Ở đây chỉ có Ecom & các thứ xoay quanh Ecom."

# Author Info
author_name: "Hùng Hà"
author_display_name: "I'm hùng"
avatar: "/avatar.jpg"          # path relative to submodule attachments/ or URL

# Social Links
social:
  - platform: x
    url: "https://x.com/username"
  - platform: facebook
    url: "https://facebook.com/username"
  - platform: github
    url: "https://github.com/username"

# Contact
email: "hello@example.com"

# Sidebar custom items (under WORK section)
sidebar_work:
  - label: "About"
    icon: "heart"
    href: "/about"
  - label: "#WorkWithMe"
    icon: "globe"
    href: "#"

# Newsletter (optional)
newsletter:
  enabled: true
  provider: "kit"
  form_id: "12345"
  heading: "Thư gửi cuối tuần"
  description: "Blog này lướt là chính chữ tôi biết cũng đ.ai đọc đâu..."
  cta: "Subscribe"
  note: "Mỗi sáng chủ nhật!"

# SEO
seo:
  title: "hunghuc.work"
  description: "Blog về Ecommerce, AI và các thứ xoay quanh"
  og_image: "/og-default.png"
---

# Về tôi & hunghuc.work

Nội dung trang About được viết ở đây dưới dạng MDX.
Có thể dùng React components, images, etc.

## Tại sao lại có hunghuc.work?

(Content trang About...)

## Liên hệ

(Contact info...)
```

> [!NOTE]
> Source code blog đọc `profile.mdx` tại build time. Mọi text hiển thị (tên, bio, social links) đều đến từ file này. **Không hardcode** bất cứ thông tin cá nhân nào trong source.

---

## Left Sidebar Hierarchy

Sidebar trái tuân theo thứ tự **chính xác** như bản gốc, nhưng mở rộng với folder navigation:

```
┌─────────────────────────────────────────────┐
│  🧑 [Avatar] [Display Name]                 │  ← Từ profile.mdx
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  🏠 Home                                    │  ← Tầng 1: Home (cố định)
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  📋 VIEWS (từ Tolaria views/*.yml)          │  ← Tầng 2: Views
│     📄 Luyên thuyên              10         │     Mỗi view = 1 nav item
│     📝 Notes                     22         │     Badge = số bài match filter
│     🤖 AI x Ecommerce            3         │
│     💻 Vibe coding               2         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  📁 FOLDERS (từ content/IT/*)               │  ← Tầng 3: Folder-based nav
│     📂 Architectures             3         │     Auto-detect từ IT/ subfolders
│     📂 AI                        1         │     Exclude: terms/, notes/
│     📂 DevOps                    0         │     Badge = số file .md trong folder
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  👤 WORK (từ profile.mdx sidebar_work)      │  ← Tầng 4: Writer profile/contact
│     ❤️  About                               │     Items lấy từ profile.mdx
│     🌐 #WorkWithMe                          │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  🏷️ TAGS                                    │  ← Tầng 5: Tags
│     #mindset  #ai  #marketing              │     Auto-generated từ all posts
│     #ecommerce  #focus  #ads               │     Click → filter by tag page
│     #creative  #gu                         │
│                                             │
└─────────────────────────────────────────────┘
```

### Sidebar data flow

| Tầng | Source | Logic |
|---|---|---|
| Avatar + Name | `profile.mdx` → `author_display_name`, `avatar` | Static read at build |
| Home | Hardcode | Always present |
| Views | `content/views/*.yml` | Scan `.yml` files, use `name` field, count matching notes |
| Folders | `content/IT/*/` | Scan top-level dirs inside `IT/`, exclude `terms/`, `notes/`, count `.md` files |
| Work | `profile.mdx` → `sidebar_work[]` | Static read at build |
| Tags | All `.md` files in `IT/` | Collect unique tags from frontmatter, deduplicate |

---

## Project Structure (Updated)

```
personal-blog/                          ← Next.js repo (TEMPLATE — no personal data)
├── content/                            ← Git submodule → Tolaria vault repo
│   ├── profile.mdx                     ← 🔑 User profile + About page content
│   ├── IT/                             ← Content root (chỉ render folder này)
│   │   ├── Architectures/
│   │   ├── AI/
│   │   ├── terms/                      ← Term dictionary
│   │   └── notes/                      ← Short notes
│   ├── views/                          ← Tolaria views (sidebar nav items)
│   │   └── *.yml
│   └── (other files — KHÔNG render)
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
│   │   ├── folder/[slug]/
│   │   │   └── page.tsx                ← Posts filtered by folder
│   │   ├── tag/[slug]/
│   │   │   └── page.tsx                ← Tag page
│   │   ├── view/[slug]/
│   │   │   └── page.tsx                ← Tolaria view page
│   │   ├── terms/
│   │   │   └── page.tsx                ← Dictionary browse page
│   │   ├── about/
│   │   │   └── page.tsx                ← About page (renders profile.mdx body)
│   │   ├── rss.xml/
│   │   │   └── route.ts                ← RSS feed
│   │   └── og/
│   │       └── route.tsx               ← OG Image generation
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SidebarLeft.tsx         ← 5-tier navigation sidebar
│   │   │   ├── SidebarRight.tsx        ← Newsletter + quotes wrapper
│   │   │   ├── MobileHeader.tsx        ← Mobile hamburger header
│   │   │   └── Footer.tsx
│   │   ├── content/
│   │   │   ├── ArticleCard.tsx         ← Horizontal article card
│   │   │   ├── NoteCard.tsx            ← Short note card (tweet-style)
│   │   │   ├── ActivityFeed.tsx        ← Mixed timeline
│   │   │   ├── SeriesNav.tsx           ← Series navigation
│   │   │   └── RelatedPosts.tsx        ← Related posts section
│   │   ├── article/
│   │   │   ├── TableOfContents.tsx     ← Sticky TOC with active tracking
│   │   │   ├── CopyHeadingLink.tsx     ← Click heading → copy anchor
│   │   │   ├── CodeBlock.tsx           ← Syntax highlight + copy + filename
│   │   │   ├── MermaidDiagram.tsx      ← Client-side mermaid render
│   │   │   └── SocialShare.tsx         ← Share buttons
│   │   ├── terms/
│   │   │   ├── TermHighlighter.tsx     ← Wrap matched terms in post body
│   │   │   └── TermPopup.tsx           ← Floating popup/dialog for term
│   │   ├── ui/
│   │   │   ├── ThemeToggle.tsx         ← Light/Dark mode switch
│   │   │   ├── BackToTop.tsx           ← Scroll to top button
│   │   │   ├── Breadcrumb.tsx          ← Folder > Post
│   │   │   ├── TagBadge.tsx            ← Tag pill
│   │   │   └── ReadingTime.tsx         ← "X phút đọc"
│   │   └── seo/
│   │       └── JsonLd.tsx              ← Structured data
│   │
│   └── lib/
│       ├── profile.ts                  ← 🔑 Read & parse profile.mdx
│       ├── content.ts                  ← Content query helpers (IT/ only)
│       ├── terms.ts                    ← Term matching logic
│       ├── views.ts                    ← Parse Tolaria views/*.yml
│       ├── folders.ts                  ← Scan IT/ folder structure
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

## Design System — Bám sát phiên bản gốc

### Color Palette (từ analysis hunghuc.work)

| Mục đích | Light | Dark |
|---|---|---|
| Background | `#ffffff` | `#09090b` |
| Background secondary | `#fafafa` | `#18181b` |
| Hover background | `#f4f4f5` | `#27272a` |
| Text primary | `#18181b` | `#fafafa` |
| Text secondary | `#71717a` | `#a1a1aa` |
| Text muted/meta | `#a1a1aa` | `#71717a` |
| Border/Divider | `#f4f4f5` | `#27272a` |
| Accent (links) | `#2563eb` | `#3b82f6` |

> [!NOTE]
> Palette **monochrome zinc** giống bản gốc. Không gradient, không màu sặc sỡ. Border dùng zinc rất nhạt (`#f4f4f5`) thay vì box-shadow nặng.

### Layout dimensions (từ screenshot)

| Element | Size |
|---|---|
| Sidebar left width | `260px` |
| Sidebar right width | `280px` |
| Content max-width | Fluid (space between sidebars) |
| Thumbnail desktop | `144×96px` |
| Thumbnail mobile | `96×64px` |
| Avatar hero | `96×96px` |
| Avatar feed | `32×32px` |
| Border radius cards | `12-16px` |
| Border radius avatar | `50%` (circle) |

### Micro-animations (từ analysis)

- Hover transitions: `transition: all 0.2s`
- Restack card scale: `transform: scale(1.008)`
- Card hover: background change + subtle lift
- No heavy shadows — mainly `border-bottom` dividers

---

## Phase 1: Project Setup

### Mục tiêu
Next.js 16 + Tailwind CSS v4 + Git submodule + Velite chạy được.

---

#### [EXISTING] `package.json`
Cài thêm dependencies:
- `velite` — content parsing
- `shiki` — syntax highlighting
- `rehype-shiki`, `remark-gfm`, `remark-math` — markdown plugins
- `lucide-react` — icons
- `mermaid` — diagrams
- `gray-matter` — parse profile.mdx frontmatter
- `js-yaml` — parse Tolaria view files
- `glob` — scan folder structure

#### [VERIFY] `.gitmodules`
Submodule đã config, verify path `content/` trỏ đúng vault repo.

#### [NEW] `velite.config.ts`
Velite schema cho content **chỉ từ `content/IT/`**:

**Post schema** (từ `content/IT/*/` — exclude `terms/` và `notes/`):
```typescript
{
  slug, title, description, tags, folder,    // folder = tên thư mục cha
  series, series_order, published, featured,
  cover_image, created, updated,
  body, raw, toc, readingTime,
  type                                       // Tolaria type field
}
```

**Note schema** (từ `content/IT/notes/`):
```typescript
{ slug, created, published, tags, body }
```

**Term schema** (từ `content/IT/terms/`):
```typescript
{ slug, title, aliases, definition, tags, related, body }
```

> [!IMPORTANT]
> Velite pattern paths:
> - Posts: `content/IT/!(terms|notes)/**/*.md`
> - Notes: `content/IT/notes/**/*.md`
> - Terms: `content/IT/terms/**/*.md`
> - **Exclude**: `content/*.md`, `content/views/`, `content/AGENTS.md`

#### [NEW] `next.config.ts`
- Velite plugin integration
- Git submodule content path
- Turbopack (default in Next.js 16)
- Image optimization config

---

## Phase 2: Profile System & Design

### Mục tiêu
Profile reader + Tailwind v4 theme + 3-column layout + dark mode — bám sát design gốc.

---

#### [NEW] `src/lib/profile.ts`
```typescript
// Đọc và parse content/profile.mdx tại build time
getProfile(): {
  blog_name, blog_tagline,
  author_name, author_display_name, avatar,
  social: { platform, url }[],
  email,
  sidebar_work: { label, icon, href }[],
  newsletter: { enabled, provider, form_id, heading, description, cta, note },
  seo: { title, description, og_image },
  aboutContent: string  // MDX body
}
```

> [!NOTE]
> Hàm này dùng `gray-matter` để parse frontmatter + body. Kết quả được cache tại build time. Source code KHÔNG chứa bất kỳ thông tin cá nhân nào.

#### [NEW] `src/lib/views.ts`
```typescript
// Đọc content/views/*.yml → parse sang sidebar nav items
getViews(): { name, icon, color, slug, count }[]
```

#### [NEW] `src/lib/folders.ts`
```typescript
// Scan content/IT/* top-level folders
// Exclude: terms/, notes/, views/
getFolders(): { name, slug, count }[]
```

#### [NEW] `src/app/globals.css`
Tailwind v4 CSS-native config — **zinc monochrome palette bám sát bản gốc**:

```css
@import "tailwindcss";

@theme {
  /* Monochrome Zinc — EXACT match hunghuc.work */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-hover: #f4f4f5;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-muted: #a1a1aa;
  --color-border: #f4f4f5;        /* Very light — divider style */
  --color-accent: #2563eb;

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Layout */
  --spacing-sidebar: 260px;
  --spacing-sidebar-right: 280px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

[data-theme="dark"] {
  --color-bg-primary: #09090b;
  --color-bg-secondary: #18181b;
  --color-bg-hover: #27272a;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-border: #27272a;
  --color-accent: #3b82f6;
}
```

#### [NEW] `src/app/layout.tsx`
- Root layout: `<html lang="vi" data-theme="light">`
- `next/font` cho Inter (variable, no layout shift)
- 3-column Tailwind grid layout (match screenshot exactly)
- Profile data injected via `getProfile()`
- `<SidebarLeft>` + `<main>` + `<SidebarRight>`

#### [NEW] `src/components/layout/SidebarLeft.tsx`
**5-tier sidebar** — data-driven, no hardcoded personal info:

1. **Header**: Avatar + display name (từ `profile.mdx`)
2. **Home**: Fixed nav item
3. **Views**: Auto-loaded từ `views/*.yml` (name + badge count)
4. **Folders**: Auto-detected từ `IT/` subfolders (name + badge count)
5. **Work**: Items từ `profile.mdx` `sidebar_work` array
6. **Tags**: Auto-generated từ all post tags

Mobile: slide-in drawer with backdrop.

#### [NEW] `src/components/layout/SidebarRight.tsx`
- Newsletter box (config từ `profile.mdx`)
- Quote highlights (random trích dẫn từ posts)
- Footer: `© {year} {blog_name}` (từ profile)
- Context-aware: Article page → TOC + Related thay thế newsletter

#### [NEW] `src/components/layout/MobileHeader.tsx`
- Sticky top bar: avatar + display name + hamburger
- All data từ `profile.mdx`

#### [NEW] `src/components/layout/Footer.tsx`
- `© {year} {profile.blog_name}. Build with Next.js`

#### [NEW] `src/components/ui/ThemeToggle.tsx`
- Sun ↔ Moon icon, `localStorage` persistence
- Respects `prefers-color-scheme`

---

## Phase 3: Core Pages

### Mục tiêu
Tất cả routes chính render content từ Velite — chỉ từ `IT/` folder.

---

#### [NEW] `src/lib/content.ts`
```typescript
// CHỈ query content từ content/IT/ — filtered by Velite patterns
getAllPosts()               // posts từ IT/!(terms|notes), sorted by date
getPostBySlug(slug)
getAllNotes()               // từ IT/notes/
getPostsByFolder(folder)   // posts trong 1 folder cụ thể
getPostsByTag(tag)
getPostsBySeries(series)
getAllSeries()
getAllTags()
getFeaturedPosts()
```

#### [NEW] `src/app/page.tsx` — Homepage
- Hero section: avatar, blog name, bio, social links ← **all from `profile.mdx`**
- Tab navigation: Activity | Articles | Notes
- Activity tab: mixed timeline (notes + articles)
- Articles tab: horizontal article cards
- Notes tab: note cards only

#### [NEW] `src/app/articles/page.tsx`
- All published articles (từ `IT/` folders)

#### [NEW] `src/app/p/[slug]/page.tsx` — Article Detail ⭐
- Breadcrumb: Home > Folder > Post title
- Meta bar: date, last updated, reading time, tags
- Series nav (if applicable)
- Article body: Shiki code blocks, Mermaid, Term highlights
- Right sidebar: TOC + Related posts

#### [NEW] `src/app/notes/page.tsx`
- All notes (từ `IT/notes/`)

#### [NEW] `src/app/folder/[slug]/page.tsx`
- Posts filtered by folder (e.g., `/folder/architectures`)

#### [NEW] `src/app/view/[slug]/page.tsx`
- Posts filtered by Tolaria view (e.g., `/view/luyen-thuyen`)
- Uses view filter logic to match posts

#### [NEW] `src/app/tag/[slug]/page.tsx`
- Posts filtered by tag

#### [NEW] `src/app/about/page.tsx`
- **Renders `profile.mdx` body content** as About page
- No hardcoded About text in source

#### Content components
- [NEW] `src/components/content/ArticleCard.tsx` — Horizontal card (match screenshot)
- [NEW] `src/components/content/NoteCard.tsx` — Tweet-style card
- [NEW] `src/components/content/ActivityFeed.tsx` — Mixed timeline

---

## Phase 4: Article Features

### Mục tiêu
TOC, code blocks, mermaid, related posts, series nav.

---

- [NEW] `src/lib/toc.ts` — Extract h2-h4 headings
- [NEW] `src/components/article/TableOfContents.tsx` — Sticky, active tracking
- [NEW] `src/lib/related.ts` — Scoring algorithm (series +10, folder +5, tag +2)
- [NEW] `src/components/content/RelatedPosts.tsx` — Grid of 2-4 cards
- [NEW] `src/components/article/CodeBlock.tsx` — Shiki + copy + filename
- [NEW] `src/components/article/MermaidDiagram.tsx` — Client-side render
- [NEW] `src/components/article/CopyHeadingLink.tsx` — Click → copy anchor
- [NEW] `src/components/article/SocialShare.tsx` — X, Facebook, LinkedIn
- [NEW] `src/components/content/SeriesNav.tsx` — ← Prev | Part 3/5 | Next →

---

## Phase 5: Term Dictionary (Popup/Dialog)

### Mục tiêu
Auto-match thuật ngữ IT trong bài viết. **Terms nằm trong submodule** tại `content/IT/terms/`.

---

### UX Flow (giữ nguyên v2)

```
Đọc bài → gặp "API Gateway" (dotted underline) → click → floating popup
┌─────────────────────────────────┐
│  📘 API Gateway                 │
│  Một reverse proxy đứng trước   │
│  backend services...            │
│  Tags: #architecture #micro...  │
│  [Xem chi tiết →]  [Đóng ✕]   │
└─────────────────────────────────┘
Click ngoài / ESC → dismiss, scroll position không đổi
```

- [NEW] `src/lib/terms.ts` — Match terms, skip code blocks/headings/links
- [NEW] `src/components/terms/TermHighlighter.tsx` — Server component wrapper
- [NEW] `src/components/terms/TermPopup.tsx` — Client floating popup
- [NEW] `src/app/terms/page.tsx` — Dictionary browse page (optional)

---

## Phase 6: SEO & Extras

- [NEW] `src/app/og/route.tsx` — OG Image generation (title, folder từ post, blog name từ profile)
- [NEW] `src/app/rss.xml/route.ts` — RSS feed (blog metadata từ `profile.mdx`)
- [NEW] `src/components/seo/JsonLd.tsx` — Structured data (author info từ profile)
- [NEW] `src/components/ui/Breadcrumb.tsx` — Home > Folder > Post
- [NEW] `src/components/ui/BackToTop.tsx` — Scroll to top
- [NEW] `src/components/ui/ReadingTime.tsx` — "X phút đọc"

---

## Phase 7: Polish & Deploy

### Tasks
- [ ] Responsive testing: mobile, tablet, desktop
- [ ] Lighthouse audit: target 95+
- [ ] Image optimization: `next/image`, WebP, lazy loading
- [ ] Font: `next/font` Inter variable
- [ ] Dark mode: verify all pages
- [ ] Mobile hamburger menu
- [ ] Vercel deployment (enable Git submodules)
- [ ] Test: push content in vault → auto rebuild
- [ ] **Verify template reusability**: fork repo, replace submodule, change profile.mdx → site works

---

## Verification Plan

### Automated
```bash
npm run build     # Turbopack build
npx tsc --noEmit  # Type check
npm run lint      # Lint
```

### Template Verification
- [ ] Clone fresh repo → add submodule with different profile.mdx → blog renders correctly
- [ ] No hardcoded personal info in source (grep for names/emails/URLs)
- [ ] Sidebar reflects profile.mdx + views + folders correctly

### Manual Checklist
- [ ] Homepage: Hero shows profile data, tabs work
- [ ] Sidebar: 5-tier hierarchy renders correctly (Home → Views → Folders → Work → Tags)
- [ ] Article detail: TOC, code blocks, mermaid, term popup
- [ ] About page: renders profile.mdx body content
- [ ] Dark mode: toggle works, persists
- [ ] RSS/OG: blog metadata from profile
- [ ] Submodule: only IT/ folder content renders
- [ ] Submodule: root files (architecture.md, note.md, etc.) NOT rendered
- [ ] Terms: popup shows on click, doesn't interrupt scroll
- [ ] Mobile: responsive, hamburger menu
