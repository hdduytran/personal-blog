import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { fileToSlug, pathToSlug } from "./slug"
import { renderMarkdown, estimateReadingTime, plainTextExcerpt } from "./markdown"

const CONTENT_DIR = path.join(process.cwd(), "content")

const EXCLUDED_DIRS = new Set(["terms", "notes", "views", "attachments"])

export interface Post {
  slug: string
  title: string
  description?: string
  tags: string[]
  folder: string
  folderSlug: string
  series?: string
  seriesOrder?: number
  published: boolean
  featured: boolean
  coverImage?: string
  created?: string
  updated?: string
  bodyHtml: string
  raw: string
  toc: { depth: number; text: string; id: string }[]
  readingTime: number
  excerpt: string
  type?: string
}

export interface Note {
  slug: string
  created?: string
  published: boolean
  tags: string[]
  bodyHtml: string
  raw: string
  readingTime: number
  excerpt: string
}

export interface Term {
  slug: string
  title: string
  aliases: string[]
  definition?: string
  tags: string[]
  related: string[]
  bodyHtml: string
  excerpt: string
}

interface Data {
  posts: Post[]
  notes: Note[]
  terms: Term[]
  titleMap: Map<string, string>
}

function extractTitle(raw: string, fallback: string): { title: string; rest: string } {
  const lines = raw.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)$/)
    if (m) {
      const rest = [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n")
      return { title: m[1].trim(), rest }
    }
  }
  return { title: fallback, rest: raw }
}

function readMarkdownFiles(dir: string): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || EXCLUDED_DIRS.has(entry.name)) continue
        walk(full)
      } else if (/\.mdx?$/i.test(entry.name)) out.push(full)
    }
  }
  walk(dir)
  return out
}

function buildWikilinkResolver(titleMap: Map<string, string>) {
  return (title: string): string | null => {
    const key = title.trim().toLowerCase()
    const slug = titleMap.get(key)
    return slug ? `/p/${slug}` : null
  }
}

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "string") return value
  return undefined
}

async function doLoad(): Promise<Data> {
  const posts: Post[] = []
  const notes: Note[] = []
  const terms: Term[] = []
  const titleMap = new Map<string, string>()

  if (!fs.existsSync(CONTENT_DIR)) return { posts, notes, terms, titleMap }

  const resolver = buildWikilinkResolver(titleMap)

  // Posts: markdown under every top-level directory except reserved ones
  const postFiles = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !EXCLUDED_DIRS.has(e.name))
    .flatMap((e) => readMarkdownFiles(path.join(CONTENT_DIR, e.name)))

  for (const file of postFiles) {
    const rawFile = fs.readFileSync(file, "utf8")
    const { data, content } = matter(rawFile)
    const { title, rest } = extractTitle(content, path.basename(file))
    const folder = path.relative(CONTENT_DIR, path.dirname(file)).split(path.sep).join("/")
    const slug = fileToSlug(path.basename(file))
    const { html, toc } = await renderMarkdown(rest, { wikilinkResolver: resolver })
    posts.push({
      slug,
      title,
      description: data.description,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      folder,
      folderSlug: pathToSlug(folder),
      series: data.series,
      seriesOrder: data.series_order ?? data.seriesOrder,
      published: data.published !== false,
      featured: Boolean(data.featured),
      coverImage: data.cover_image ?? data.coverImage,
      created: normalizeDate(data.created),
      updated: normalizeDate(data.updated),
      bodyHtml: html,
      raw: rest,
      toc,
      readingTime: estimateReadingTime(rest),
      excerpt: plainTextExcerpt(rest),
      type: data.type,
    })
    titleMap.set(title.toLowerCase(), slug)
  }

  // Notes
  const notesDir = path.join(CONTENT_DIR, "notes")
  for (const file of readMarkdownFiles(notesDir)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"))
    const { rest } = extractTitle(content, path.basename(file))
    const { html } = await renderMarkdown(rest, { wikilinkResolver: resolver })
    notes.push({
      slug: fileToSlug(path.basename(file)),
      created: normalizeDate(data.created),
      published: data.published !== false,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      bodyHtml: html,
      raw: rest,
      readingTime: estimateReadingTime(rest),
      excerpt: plainTextExcerpt(rest),
    })
  }

  // Terms
  const termsDir = path.join(CONTENT_DIR, "terms")
  for (const file of readMarkdownFiles(termsDir)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"))
    const { title, rest } = extractTitle(content, path.basename(file))
    const { html } = await renderMarkdown(rest, { wikilinkResolver: resolver })
    terms.push({
      slug: fileToSlug(path.basename(file)),
      title,
      aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
      definition: data.definition,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      related: Array.isArray(data.related) ? data.related.map(String) : [],
      bodyHtml: html,
      excerpt: data.definition ?? plainTextExcerpt(rest),
    })
  }

  posts.sort((a, b) => (b.created || "").localeCompare(a.created || ""))
  notes.sort((a, b) => (b.created || "").localeCompare(a.created || ""))
  terms.sort((a, b) => a.title.localeCompare(b.title))

  return { posts, notes, terms, titleMap }
}

let cachePromise: Promise<Data> | null = null

function load(): Promise<Data> {
  if (!cachePromise) cachePromise = doLoad()
  return cachePromise
}

export async function getAllPosts(): Promise<Post[]> {
  return (await load()).posts.filter((p) => p.published)
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await load()).posts.find((p) => p.slug === slug && p.published)
}

export async function getAllNotes(): Promise<Note[]> {
  return (await load()).notes.filter((n) => n.published)
}

export async function getPostsByFolder(folderSlug: string): Promise<Post[]> {
  return (await getAllPosts()).filter(
    (p) => p.folderSlug === folderSlug || p.folderSlug.startsWith(folderSlug + "/")
  )
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const t = tag.toLowerCase()
  return (await getAllPosts()).filter((p) => p.tags.some((x) => x.toLowerCase() === t))
}

export async function getPostsBySeries(series: string): Promise<Post[]> {
  return (await getAllPosts())
    .filter((p) => p.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
}

export async function getAllSeries(): Promise<{ name: string; count: number }[]> {
  const map = new Map<string, number>()
  for (const p of await getAllPosts()) {
    if (p.series) map.set(p.series, (map.get(p.series) || 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }))
}

export async function getAllTags(): Promise<string[]> {
  const set = new Set<string>()
  for (const p of await getAllPosts()) for (const t of p.tags) set.add(t)
  return [...set].sort()
}

export async function getFeaturedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.featured)
}

export async function getAllTerms(): Promise<Term[]> {
  return (await load()).terms
}

export async function getTermBySlug(slug: string): Promise<Term | undefined> {
  return (await load()).terms.find((t) => t.slug === slug)
}
