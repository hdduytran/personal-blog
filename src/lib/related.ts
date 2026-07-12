import type { Post } from "./content"

export function scoreRelated(current: Post, candidates: Post[]): Post[] {
  return candidates
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0
      if (p.series && p.series === current.series) score += 10
      if (p.folder === current.folder) score += 5
      const sharedTags = p.tags.filter((t) => current.tags.includes(t)).length
      score += sharedTags * 2
      return { post: p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.post)
}

export function getRelatedPosts(current: Post, all: Post[]): Post[] {
  const related = scoreRelated(current, all)
  // Fallback: fill with recent posts if not enough related.
  if (related.length < 3) {
    const extra = all
      .filter((p) => p.slug !== current.slug && !related.find((r) => r.slug === p.slug))
      .slice(0, 3 - related.length)
    return [...related, ...extra]
  }
  return related
}
