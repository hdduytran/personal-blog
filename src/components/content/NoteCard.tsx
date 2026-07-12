import type { Note } from "@/lib/content"

function formatDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="rounded-xl border border-line p-4 transition-colors hover:bg-hover">
      <div
        className="prose text-sm"
        dangerouslySetInnerHTML={{ __html: note.bodyHtml }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
        {note.created && <span>{formatDate(note.created)}</span>}
        {note.tags.map((t) => (
          <span key={t} className="rounded-full bg-hover px-2 py-0.5">
            #{t}
          </span>
        ))}
      </div>
    </article>
  )
}
