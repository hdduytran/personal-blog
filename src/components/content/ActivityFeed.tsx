import type { Post, Note } from "@/lib/content"
import { ArticleCard } from "./ArticleCard"
import { NoteCard } from "./NoteCard"

interface ActivityItem {
  kind: "article" | "note"
  date?: string
  node: React.ReactNode
}

function formatDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function ActivityFeed({ posts, notes }: { posts: Post[]; notes: Note[] }) {
  const items: ActivityItem[] = [
    ...posts.map((p) => ({
      kind: "article" as const,
      date: p.created,
      node: <ArticleCard post={p} />,
    })),
    ...notes.map((n) => ({
      kind: "note" as const,
      date: n.created,
      node: <NoteCard note={n} />,
    })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  if (items.length === 0) {
    return <p className="text-sm text-ink-mute">No activity yet.</p>
  }

  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="relative pl-6">
          <span className="absolute left-0 top-3 h-2 w-2 rounded-full bg-line" />
          <span className="absolute left-[3px] top-5 bottom-[-1rem] w-px bg-line" />
          {it.node}
        </div>
      ))}
    </div>
  )
}

export { formatDate }
