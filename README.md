# Personal IT Blog Template

A content-driven personal IT blog built with **Next.js 16** (App Router, Turbopack), **Tailwind CSS v4**, and a Markdown/MDX content layer. All site identity lives in a `profile.mdx` file — no personal data is hardcoded in the source.

## Concept

- **Content-first.** Posts, notes, glossary terms, and curated "views" are plain Markdown files under `content/`. The app reads them at build time.
- **Zero hardcoded identity.** Blog name, author, bio, and social links all come from `content/profile.mdx`. Rebrand by editing one file.
- **Rich article experience.** Table of contents, social share, related posts, series navigation, term-dictionary popups, `[[wikilinks]]`, Mermaid diagrams, dark mode, RSS feed, and dynamically generated OG images.
- **Tolaria-style content layout.** Content is organized as `IT/Architectures`, `IT/Notes`, `IT/Terms`, plus `profile.mdx` and `views/*.yml` (curated filters).

## Tech Stack

| Area        | Choice                                              |
| ----------- | --------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)                  |
| UI          | React 19, Tailwind CSS v4                           |
| Content     | `gray-matter` + `unified`/`remark`/`rehype`         |
| Code blocks | `rehype-pretty-code` + `shiki` (dual light/dark)   |
| Icons       | `lucide-react` + inline brand SVGs                  |

## Project Structure

```
content/                 # your content repo (git submodule) — not included here
  profile.mdx            # site identity (name, author, bio, socials)
  IT/
    Architectures/*.md   # blog posts (frontmatter-driven)
    Notes/*.md           # short notes / TIL
    Terms/*.md           # glossary entries (popups on hover/click)
  views/*.yml            # curated content "views" (Tolaria filters)
src/
  app/                   # routes (home, articles, notes, terms, folder, tag, view, og, rss)
  components/            # layout, content, article, terms, seo, ui
  lib/                   # content layer, markdown, terms, views, related, profile
```

## Getting Started (local)

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Content as a Git submodule (recommended)

This repository intentionally does **not** include the `content/` folder. Bring your own content repository so you can manage posts separately (e.g. from Obsidian):

```bash
# if a local content/ folder already exists, remove it first
rm -rf content

# add your content repo as a submodule
git submodule add <your-content-repo-url> content

git commit -m "chore: add content submodule"
```

> Use a **public HTTPS** URL for the submodule (e.g. `https://github.com/you/content.git`) so hosting platforms can clone it without credentials.

**Content file conventions:**

| File | Purpose | Key frontmatter |
| ---- | ------- | --------------- |
| `content/profile.mdx` | Site identity | `blog_name`, `author`, `bio`, `socials[]` |
| `content/IT/Architectures/*.md` | Posts | `title`, `created`, `tags[]`, `series?`, `featured?`, `summary?` |
| `content/IT/Notes/*.md` | Notes / TIL | `title`, `created`, `tags[]` |
| `content/IT/Terms/*.md` | Glossary terms | `title`, `aliases?`, `tags[]`, `excerpt` |
| `content/views/*.yml` | Curated views | Tolaria filters (`match: all|any` on `tags`/`series`/`folder`) |

### Without a submodule (quick local)

You can also just drop a plain `content/` directory at the repo root. The app reads it identically — a submodule is only required if you want to keep content in a separate repository.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Deploy on Vercel

1. Push this repository to GitHub (public).
2. In Vercel, **Add New → Project** and import the GitHub repo.
3. Framework preset is auto-detected as **Next.js**. Build command `next build`, output handled automatically. No environment variables are required.
4. **If you use a content submodule:**
   - Make sure the submodule URL is a **public HTTPS** URL (Vercel must be able to clone it without auth).
   - In the Vercel project **Settings → General**, enable **"Include submodules"** so Vercel runs `git submodule update --init --recursive` during the build. (This reads your `content/` so the build can render posts.)
   - If you prefer an explicit build command, set it to:
     ```bash
     git submodule update --init --recursive && next build
     ```
5. Deploy. OG images (`/og/[slug]`) and the RSS feed (`/rss.xml`) are generated at build/request time.

### Notes

- **Dark mode** is controlled by a `data-theme` attribute on `<html>`, toggled in the UI and persisted in `localStorage`.
- **Rebrand** by editing only `content/profile.mdx` — no source changes needed.
- **Term popups** are triggered by clicking any highlighted term in an article; the glossary is built from `content/IT/Terms`.
