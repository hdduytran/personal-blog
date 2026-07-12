import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getViewPosts } from "@/lib/views"
import { ArticleCard } from "@/components/content/ArticleCard"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"
import { Icon } from "@/components/ui/Icon"
import Link from "next/link"

export async function generateStaticParams() {
  const { getViews } = await import("@/lib/views")
  const views = await getViews()
  return views.map((v) => ({ slug: v.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getViewPosts(slug)
  return { title: result ? result.view.name : "View" }
}

export default async function ViewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getViewPosts(slug)
  if (!result) notFound()
  const { view, posts } = result

  return (
    <MainLayout right={<NewsletterBox />}>
      <nav className="mb-4 text-sm text-ink-mute">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-soft">{view.name}</span>
      </nav>
      <div className="mb-6 flex items-center gap-2">
        <Icon name={view.icon || "book"} size={20} className="text-ink-soft" />
        <h1 className="text-2xl font-bold text-ink">{view.name}</h1>
      </div>
      <p className="mb-6 text-sm text-ink-mute">{posts.length} articles</p>
      <div className="space-y-4">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </MainLayout>
  )
}
