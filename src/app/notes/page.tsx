import type { Metadata } from "next"
import { getAllNotes } from "@/lib/content"
import { NoteCard } from "@/components/content/NoteCard"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export const metadata: Metadata = { title: "Notes" }

export default async function NotesPage() {
  const notes = await getAllNotes()
  return (
    <MainLayout right={<NewsletterBox />}>
      <h1 className="mb-6 text-2xl font-bold text-ink">Notes</h1>
      {notes.length === 0 ? (
        <p className="text-sm text-ink-mute">No notes yet.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((n) => (
            <NoteCard key={n.slug} note={n} />
          ))}
        </div>
      )}
    </MainLayout>
  )
}
