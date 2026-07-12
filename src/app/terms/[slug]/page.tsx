import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getAllTerms, getTermBySlug, type Term } from "@/lib/content"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"
import { Breadcrumb } from "@/components/ui/Breadcrumb"

export async function generateStaticParams() {
  const terms = await getAllTerms()
  return terms.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const term = await getTermBySlug(slug)
  if (!term) return {}
  return { title: term.title, description: term.excerpt }
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const term = await getTermBySlug(slug)
  if (!term) notFound()

  const allTerms = await getAllTerms()
  const relatedTerms = term.related
    .map((r) => allTerms.find((t) => t.title.toLowerCase() === r.toLowerCase()))
    .filter((t): t is Term => t !== undefined && t.slug !== term.slug)

  return (
    <MainLayout right={<NewsletterBox />}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dictionary", href: "/terms" }, { label: term.title }]} />
      <h1 className="text-3xl font-bold tracking-tight text-ink">{term.title}</h1>
      {term.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {term.tags.map((t) => (
            <span key={t} className="rounded-full bg-hover px-2.5 py-0.5 text-xs text-ink-soft">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: term.bodyHtml }} />
      {relatedTerms.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-mute">Related</h2>
          <ul className="mt-3 space-y-2">
            {relatedTerms.map((t) => (
              <li key={t.slug}>
                <Link href={`/terms/${t.slug}`} className="text-sm text-accent hover:underline">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MainLayout>
  )
}
