import type { Term } from "./content"

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

interface TermMatch {
  phrase: string
  slug: string
}

export function buildTermMatches(terms: Term[]): TermMatch[] {
  const matches: TermMatch[] = []
  const seen = new Set<string>()
  for (const term of terms) {
    const candidates = [term.title, ...term.aliases].filter(Boolean)
    for (const c of candidates) {
      const key = c.trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      matches.push({ phrase: c.trim(), slug: term.slug })
    }
  }
  // Longest phrases first so "API Gateway" wins over "API".
  matches.sort((a, b) => b.phrase.length - a.phrase.length)
  return matches
}

export function highlightTerms(html: string, terms: Term[]): string {
  const matches = buildTermMatches(terms)
  if (matches.length === 0) return html

  const alternation = matches
    .map((m) => escapeRegExp(m.phrase))
    .join("|")
  const matcher = new RegExp(`(?<![\\p{L}\\p{N}])(${alternation})(?![\\p{L}\\p{N}])`, "giu")
  const slugByLower = new Map(matches.map((m) => [m.phrase.toLowerCase(), m.slug]))

  // Only replace inside text segments (outside of HTML tags).
  const segments = html.split(/(<[^>]+>)/g)
  return segments
    .map((segment) => {
      if (segment.startsWith("<")) return segment
      return segment.replace(matcher, (whole) => {
        const slug = slugByLower.get(whole.toLowerCase())
        if (!slug) return whole
        return `<span class="term-link" data-term-slug="${slug}">${whole}</span>`
      })
    })
    .join("")
}
