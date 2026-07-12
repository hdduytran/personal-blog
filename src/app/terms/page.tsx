import type { Metadata } from "next"
import Link from "next/link"
import { getAllTerms } from "@/lib/content"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export const metadata: Metadata = { title: "Dictionary" }

export default async function TermsPage() {
  const terms = await getAllTerms()
  return (
    <MainLayout right={<NewsletterBox />}>
      <h1 className="mb-2 text-2xl font-bold text-ink">Dictionary</h1>
      <p className="mb-6 text-sm text-ink-mute">
        Technical terms used across the blog. Click any underlined term in an article to peek at its definition.
      </p>
      {terms.length === 0 ? (
        <p className="text-sm text-ink-mute">No terms yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {terms.map((t) => (
            <Link
              key={t.slug}
              href={`/terms/${t.slug}`}
              className="group rounded-xl border border-line p-4 transition-colors hover:bg-hover"
            >
              <h3 className="font-semibold text-ink group-hover:text-accent">{t.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{t.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  )
}
