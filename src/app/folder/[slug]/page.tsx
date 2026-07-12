import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getFolders } from "@/lib/folders"
import { getPostsByFolder } from "@/lib/content"
import { ArticleCard } from "@/components/content/ArticleCard"
import { MainLayout } from "@/components/layout/MainLayout"
import Link from "next/link"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export async function generateStaticParams() {
  const folders = await getFolders()
  return folders.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const folders = await getFolders()
  const folder = folders.find((f) => f.slug === slug)
  return { title: folder ? folder.name : "Folder" }
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const folders = await getFolders()
  const folder = folders.find((f) => f.slug === slug)
  if (!folder) notFound()
  const posts = await getPostsByFolder(slug)

  return (
    <MainLayout right={<NewsletterBox />}>
      <BreadcrumbItems folder={folder.name} />
      <h1 className="mb-6 text-2xl font-bold text-ink">{folder.name}</h1>
      <p className="mb-6 text-sm text-ink-mute">{posts.length} articles</p>
      <div className="space-y-4">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} showFolder={false} />
        ))}
      </div>
    </MainLayout>
  )
}

function BreadcrumbItems({ folder }: { folder: string }) {
  return (
    <nav className="mb-4 text-sm text-ink-mute">
      <Link href="/" className="hover:text-ink">
        Home
      </Link>
      <span className="mx-1.5">/</span>
      <span className="text-ink-soft">{folder}</span>
    </nav>
  )
}
