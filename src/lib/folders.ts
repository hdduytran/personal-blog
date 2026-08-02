import fs from "node:fs"
import path from "node:path"
import { slugify, pathToSlug } from "./slug"
import { getAllPosts } from "./content"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface FolderPost {
  slug: string
  title: string
}

export interface FolderNode {
  name: string
  path: string
  slug: string
  depth: number
  count: number
  posts: FolderPost[]
  children: FolderNode[]
}

export interface Folder {
  name: string
  path: string
  slug: string
  count: number
}

const EXCLUDED = new Set(["terms", "notes", "views", "attachments"])

function isFolderDir(entry: fs.Dirent): boolean {
  return entry.isDirectory() && !entry.name.startsWith(".") && !EXCLUDED.has(entry.name)
}

function buildChildren(dir: string, relPath: string, depth: number, posts: Awaited<ReturnType<typeof getAllPosts>>): FolderNode[] {
  const children: FolderNode[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter(isFolderDir).sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    const childRel = relPath ? `${relPath}/${entry.name}` : entry.name
    const childSlug = pathToSlug(childRel)
    const direct = posts
      .filter((p) => p.folderSlug === childSlug)
      .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
      .map((p) => ({ slug: p.slug, title: p.title }))
    const count = direct.length + posts.filter((p) => p.folderSlug.startsWith(childSlug + "/")).length
    children.push({
      name: entry.name,
      path: childRel,
      slug: childSlug,
      depth,
      count,
      posts: direct,
      children: buildChildren(path.join(dir, entry.name), childRel, depth + 1, posts),
    })
  }
  return children
}

export async function getFolderTree(): Promise<FolderNode[]> {
  if (!fs.existsSync(CONTENT_DIR)) return []
  const posts = await getAllPosts()
  const roots = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter(isFolderDir).sort((a, b) => a.name.localeCompare(b.name))
  return roots.map((root) => {
    const rel = root.name
    const slug = slugify(rel)
    const direct = posts
      .filter((p) => p.folderSlug === slug)
      .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
      .map((p) => ({ slug: p.slug, title: p.title }))
    const count = direct.length + posts.filter((p) => p.folderSlug.startsWith(slug + "/")).length
    return {
      name: root.name,
      path: rel,
      slug,
      depth: 0,
      count,
      posts: direct,
      children: buildChildren(path.join(CONTENT_DIR, root.name), rel, 1, posts),
    }
  })
}

export async function getFolders(): Promise<Folder[]> {
  const tree = await getFolderTree()
  const flat: Folder[] = []
  const walk = (nodes: FolderNode[]) => {
    for (const n of nodes) {
      flat.push({ name: n.name, path: n.path, slug: n.slug, count: n.count })
      walk(n.children)
    }
  }
  walk(tree)
  return flat
}

export async function getFolderBySlug(slug: string): Promise<FolderNode | undefined> {
  const tree = await getFolderTree()
  const walk = (nodes: FolderNode[]): FolderNode | undefined => {
    for (const n of nodes) {
      if (n.slug === slug) return n
      const found = walk(n.children)
      if (found) return found
    }
    return undefined
  }
  return walk(tree)
}
