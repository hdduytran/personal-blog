# Deployment Guide (Vercel)

The template is designed to deploy on **Vercel with zero configuration and zero
environment variables**. This guide assumes you have forked/cloned the repo and want
to go live.

## 1. Prerequisites

- A **public** GitHub repository containing this template (`git push` to `origin`).
- A **public HTTPS** content repository to use as the `content/` submodule
  (e.g. `https://github.com/you/content.git`). Vercel must be able to clone it
  without credentials.
- The submodule added locally:

  ```bash
  # remove any local content/ folder first
  rm -rf content
  git submodule add <your-content-repo-url> content
  git commit -m "chore: add content submodule"
  git push
  ```

  > The template repo intentionally does **not** commit `content/` (see
  > `.gitignore` → `/content/`).

## 2. Import the Project

1. Go to **https://vercel.com/new** → **Add New → Project**.
2. Import the GitHub repository (grant Vercel access if prompted).
3. Vercel **auto-detects Next.js** from `package.json`. No framework override is needed.
4. **No environment variables are required.** The site reads `content/` from the file
   system at build time and everything else from `content/profile.md`.
5. Click **Deploy**.

## 3. Content Submodule Setup (required for posts)

Because `content/` is a git submodule, tell Vercel to fetch it during the build:

1. In the Vercel project, go to **Settings → General → Build & Development Settings**.
2. Enable **"Include submodules"**. This makes Vercel run
   `git submodule update --init --recursive` before the build so your posts are
   present when `next build` runs.
3. Optionally set the **Build Command** explicitly:

   ```bash
   git submodule update --init --recursive && next build
   ```

4. Re-deploy (trigger a new build).

> **Troubleshooting:** if a deploy succeeds but pages show "No articles yet", the
> submodule was probably not fetched — confirm "Include submodules" is on and the
> submodule URL is public HTTPS. Vercel cannot authenticate to a private submodule.

## 4. Runtime Behavior

- **Static pages** (`/`, `/about`, `/articles`, `/notes`, `/folder/[...path]`,
  `/view/[slug]`, `/terms`, `/terms/[slug]`, `/p/[slug]`) are generated at build time
  and served from Vercel's CDN.
- **OG images** (`/og/[slug]`) are rendered by `next/og` at build/request time.
- **RSS feed** (`/rss.xml`) is generated on request with `Cache-Control:
  s-maxage=3600, stale-while-revalidate`.

## 5. After Deployment

1. Open your deployed URL and verify the home page, an article, `/rss.xml`, and
   `/og/<slug>`.
2. **Fix the RSS site URL.** The feed currently hardcodes `https://example.com`
   (see roadmap). Update `src/app/rss.xml/route.ts` to your domain or make it
   configurable from `profile.md` before publishing.
3. (Optional) Add a custom domain under **Settings → Domains**.

## 6. Non-Vercel Hosting

Because the output is fully static, the same build works on any Node host that can
run `npm install && npm run build && npm start`. For purely static serving (Netlify,
GitHub Pages), you would need a `next export`-compatible setup — the template is
optimized for Next.js-managed hosting, so Vercel (or Next's built-in `next start`)
is the supported path.

## 7. Commands Recap

| Step | Command |
| ---- | ------- |
| Local dev | `npm run dev` |
| Production build | `npm run build` (optionally prefixed with the submodule update) |
| Serve build | `npm run start` |
| Lint | `npm run lint` |
