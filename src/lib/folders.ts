import fs from "node:fs"
import path from "node:path"
import { slugify } from "./slug"
import { getAllPosts } from "./content"

const IT_DIR = path.join(process.cwd(), "content", "IT")

export interface Folder {
  name: string
  slug: string
  count: number
}

const EXCLUDE = new Set(["terms", "notes", "views", "attachments"])

export async function getFolders(): Promise<Folder[]> {
  if (!fs.existsSync(IT_DIR)) return []
  const posts = await getAllPosts()
  const folders: Folder[] = []
  for (const entry of fs.readdirSync(IT_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || EXCLUDE.has(entry.name)) continue
    const count = posts.filter((p) => p.folderSlug === slugify(entry.name)).length
    folders.push({ name: entry.name, slug: slugify(entry.name), count })
  }
  folders.sort((a, b) => a.name.localeCompare(b.name))
  return folders
}
