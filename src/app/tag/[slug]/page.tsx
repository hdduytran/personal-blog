import type { Metadata } from "next"
import { getPostsByTag } from "@/lib/content"
import { ArticleCard } from "@/components/content/ArticleCard"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"
import Link from "next/link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: `#${decodeURIComponent(slug)}` }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tag = decodeURIComponent(slug)
  const posts = await getPostsByTag(tag)

  return (
    <MainLayout right={<NewsletterBox />}>
      <nav className="mb-4 text-sm text-ink-mute">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-soft">#{tag}</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-ink">#{tag}</h1>
      <p className="mb-6 text-sm text-ink-mute">{posts.length} articles</p>
      <div className="space-y-4">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </MainLayout>
  )
}
