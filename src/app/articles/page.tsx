import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content"
import { ArticleCard } from "@/components/content/ArticleCard"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export const metadata: Metadata = { title: "Articles" }

export default async function ArticlesPage() {
  const posts = await getAllPosts()
  return (
    <MainLayout right={<NewsletterBox />}>
      <h1 className="mb-6 text-2xl font-bold text-ink">Articles</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-ink-mute">No articles yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <ArticleCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </MainLayout>
  )
}
