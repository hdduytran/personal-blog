import Link from "next/link"
import type { Post } from "@/lib/content"

function formatDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-mute">
        Related
      </h3>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/p/${p.slug}`} className="group block">
              <p className="text-sm font-medium text-ink group-hover:text-accent">{p.title}</p>
              <p className="text-xs text-ink-mute">
                {p.folder}
                {p.created ? ` · ${formatDate(p.created)}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
