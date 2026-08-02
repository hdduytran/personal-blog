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
        <div className="space-y-6">
          {terms.map((t) => (
            <article key={t.slug} className="rounded-xl border border-line p-5 transition-colors hover:bg-hover">
              <h2 className="text-lg font-semibold text-ink">
                <Link href={`/terms/${t.slug}`} className="hover:text-accent">
                  {t.title}
                </Link>
              </h2>
              {t.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-hover px-2.5 py-0.5 text-xs text-ink-soft">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="prose mt-3" dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />
            </article>
          ))}
        </div>
      )}
    </MainLayout>
  )
}
