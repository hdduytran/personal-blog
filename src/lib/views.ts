import fs from "node:fs"
import path from "node:path"
import { load as yamlLoad } from "js-yaml"
import { slugify } from "./slug"
import { getAllPosts, type Post } from "./content"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ViewDoc {
  name: string
  slug: string
  icon: string | null
  color: string | null
  filters?: FilterGroup
}

const VIEWS_DIR = path.join(process.cwd(), "content", "views")

export interface View {
  name: string
  slug: string
  icon: string | null
  color: string | null
  count: number
}

interface FilterCondition {
  field: string
  op: string
  value?: unknown
  regex?: boolean
}

interface FilterGroup {
  all?: FilterCondition[]
  any?: FilterCondition[]
}

function matchCondition(post: Post, cond: FilterCondition): boolean {
  const { field, op, value, regex } = cond
  let target: unknown
  if (field === "tags") target = post.tags
  else if (field === "title") target = post.title
  else if (field === "body") target = post.raw
  else if (field === "type") target = post.type
  else if (field === "folder") target = post.folder
  else target = (post as any)[field]

  const strTarget = Array.isArray(target) ? target.join(" ") : String(target ?? "")
  const strValue = Array.isArray(value) ? value.join(" ") : String(value ?? "")

  switch (op) {
    case "equals":
      if (regex) return new RegExp(String(value), "i").test(strTarget)
      return strTarget.toLowerCase() === strValue.toLowerCase()
    case "not_equals":
      if (regex) return !new RegExp(String(value), "i").test(strTarget)
      return strTarget.toLowerCase() !== strValue.toLowerCase()
    case "contains":
      if (regex) return new RegExp(String(value), "i").test(strTarget)
      return strTarget.toLowerCase().includes(strValue.toLowerCase())
    case "not_contains":
      if (regex) return !new RegExp(String(value), "i").test(strTarget)
      return !strTarget.toLowerCase().includes(strValue.toLowerCase())
    case "any_of":
      return Array.isArray(value) && value.some((v) => strTarget.toLowerCase().includes(String(v).toLowerCase()))
    case "none_of":
      return Array.isArray(value) && !value.some((v) => strTarget.toLowerCase().includes(String(v).toLowerCase()))
    case "is_empty":
      return strTarget.trim() === ""
    case "is_not_empty":
      return strTarget.trim() !== ""
    default:
      return false
  }
}

function matchGroup(post: Post, group?: FilterGroup): boolean {
  if (!group) return true
  if (group.all) return group.all.every((c) => matchCondition(post, c))
  if (group.any) return group.any.some((c) => matchCondition(post, c))
  return true
}

export async function getViews(): Promise<View[]> {
  if (!fs.existsSync(VIEWS_DIR)) return []
  const posts = await getAllPosts()
  const views: View[] = []
  for (const entry of fs.readdirSync(VIEWS_DIR)) {
    if (!entry.endsWith(".yml") && !entry.endsWith(".yaml")) continue
    const raw = fs.readFileSync(path.join(VIEWS_DIR, entry), "utf8")
    let doc: any
    try {
      doc = yamlLoad(raw)
    } catch {
      continue
    }
    if (!doc || typeof doc !== "object") continue
    const filters = doc.filters as FilterGroup | undefined
    const count = posts.filter((p) => matchGroup(p, filters)).length
    views.push({
      name: doc.name ?? entry,
      slug: slugify(entry.replace(/\.ya?ml$/, "")),
      icon: doc.icon ?? null,
      color: doc.color ?? null,
      count,
    })
  }
  views.sort((a, b) => a.name.localeCompare(b.name))
  return views
}

async function loadViewDocs(): Promise<ViewDoc[]> {
  if (!fs.existsSync(VIEWS_DIR)) return []
  const docs: ViewDoc[] = []
  for (const entry of fs.readdirSync(VIEWS_DIR)) {
    if (!entry.endsWith(".yml") && !entry.endsWith(".yaml")) continue
    const raw = fs.readFileSync(path.join(VIEWS_DIR, entry), "utf8")
    let doc: any
    try {
      doc = yamlLoad(raw)
    } catch {
      continue
    }
    if (!doc || typeof doc !== "object") continue
    docs.push({
      name: doc.name ?? entry,
      slug: slugify(entry.replace(/\.ya?ml$/, "")),
      icon: doc.icon ?? null,
      color: doc.color ?? null,
      filters: doc.filters as FilterGroup | undefined,
    })
  }
  return docs
}

export async function getViewPosts(slug: string): Promise<{ view: View; posts: Post[] } | null> {
  const docs = await loadViewDocs()
  const doc = docs.find((d) => d.slug === slug)
  if (!doc) return null
  const posts = (await getAllPosts()).filter((p) => matchGroup(p, doc.filters))
  const view: View = {
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    color: doc.color,
    count: posts.length,
  }
  return { view, posts }
}
