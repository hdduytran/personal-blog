import Link from "next/link"
import type { Post } from "@/lib/content"

export function SeriesNav({ series, posts }: { series: string; posts: Post[] }) {
  const idx = posts.findIndex((p) => p.series === series)
  const ordered = posts.filter((p) => p.series === series)
  const currentIndex = ordered.findIndex((p) => p.slug === posts[idx]?.slug)
  const prev = currentIndex > 0 ? ordered[currentIndex - 1] : null
  const next = currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null

  return (
    <div className="my-8 rounded-xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
        Series · {series}
      </p>
      <div className="mt-3 flex items-center justify-between gap-4">
        {prev ? (
          <Link href={`/p/${prev.slug}`} className="text-sm text-ink-soft hover:text-accent">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs text-ink-mute">
          {currentIndex + 1} / {ordered.length}
        </span>
        {next ? (
          <Link href={`/p/${next.slug}`} className="text-sm text-ink-soft hover:text-accent">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
