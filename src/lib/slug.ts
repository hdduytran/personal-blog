export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function fileToSlug(filename: string): string {
  const base = filename.replace(/\.mdx?$/i, "")
  return slugify(base)
}
