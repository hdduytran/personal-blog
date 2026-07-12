import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

export interface SocialLink {
  platform: string
  url: string
}

export interface SidebarWorkItem {
  label: string
  icon: string
  href: string
}

export interface NewsletterConfig {
  enabled: boolean
  provider?: string
  form_id?: string
  heading?: string
  description?: string
  cta?: string
  note?: string
}

export interface SeoConfig {
  title?: string
  description?: string
  og_image?: string
}

export interface Profile {
  blog_name: string
  blog_tagline: string
  author_name: string
  author_display_name: string
  avatar: string
  social: SocialLink[]
  email?: string
  sidebar_work: SidebarWorkItem[]
  newsletter: NewsletterConfig
  seo: SeoConfig
  aboutContent: string
}

const CONTENT_DIR = path.join(process.cwd(), "content")
const PROFILE_PATH = path.join(CONTENT_DIR, "profile.mdx")

const FALLBACK: Profile = {
  blog_name: "My Blog",
  blog_tagline: "A personal blog built with Next.js.",
  author_name: "Author",
  author_display_name: "Author",
  avatar: "",
  social: [],
  email: undefined,
  sidebar_work: [
    { label: "About", icon: "heart", href: "/about" },
    { label: "#WorkWithMe", icon: "globe", href: "#" },
  ],
  newsletter: { enabled: false },
  seo: { title: "My Blog", description: "A personal blog." },
  aboutContent: "# About\n\nThis is a template blog. Replace `profile.mdx` to make it yours.",
}

let cached: Profile | null = null

export function getProfile(): Profile {
  if (cached) return cached
  if (!fs.existsSync(PROFILE_PATH)) {
    cached = FALLBACK
    return cached
  }
  const raw = fs.readFileSync(PROFILE_PATH, "utf8")
  const { data, content } = matter(raw)
  cached = {
    blog_name: data.blog_name ?? FALLBACK.blog_name,
    blog_tagline: data.blog_tagline ?? FALLBACK.blog_tagline,
    author_name: data.author_name ?? FALLBACK.author_name,
    author_display_name: data.author_display_name ?? data.author_name ?? FALLBACK.author_display_name,
    avatar: data.avatar ?? FALLBACK.avatar,
    social: Array.isArray(data.social) ? data.social : [],
    email: data.email,
    sidebar_work: Array.isArray(data.sidebar_work) ? data.sidebar_work : FALLBACK.sidebar_work,
    newsletter: {
      enabled: Boolean(data.newsletter?.enabled),
      provider: data.newsletter?.provider,
      form_id: data.newsletter?.form_id,
      heading: data.newsletter?.heading,
      description: data.newsletter?.description,
      cta: data.newsletter?.cta,
      note: data.newsletter?.note,
    },
    seo: {
      title: data.seo?.title ?? data.blog_name,
      description: data.seo?.description ?? data.blog_tagline,
      og_image: data.seo?.og_image,
    },
    aboutContent: content,
  }
  return cached
}
