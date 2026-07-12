import Link from "next/link"
import type { Post } from "@/lib/content"
import { ReadingTime } from "@/components/ui/ReadingTime"

function formatDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function ArticleCard({ post, showFolder = true }: { post: Post; showFolder?: boolean }) {
  return (
    <Link
      href={`/p/${post.slug}`}
      className="group flex gap-4 rounded-xl border border-line p-4 transition-colors hover:bg-hover"
    >
      <div className="hidden h-24 w-36 shrink-0 items-center justify-center rounded-lg bg-hover text-2xl font-semibold text-ink-mute sm:flex">
        {post.folder.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-ink-mute">
          {showFolder && <span className="font-medium text-ink-soft">{post.folder}</span>}
          {post.created && <span>· {formatDate(post.created)}</span>}
          <ReadingTime minutes={post.readingTime} />
        </div>
        <h3 className="mt-1 truncate text-base font-semibold text-ink group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-hover px-2 py-0.5 text-xs text-ink-soft">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
