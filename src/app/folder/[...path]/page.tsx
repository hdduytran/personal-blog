import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getFolders, getFolderBySlug } from "@/lib/folders"
import { getPostsByFolder } from "@/lib/content"
import { ArticleCard } from "@/components/content/ArticleCard"
import { MainLayout } from "@/components/layout/MainLayout"
import Link from "next/link"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export async function generateStaticParams() {
  const folders = await getFolders()
  return folders.map((f) => ({ path: f.slug.split("/") }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>
}): Promise<Metadata> {
  const { path } = await params
  const folder = await getFolderBySlug(path.join("/"))
  return { title: folder ? folder.name : "Folder" }
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ path: string[] }>
}) {
  const { path } = await params
  const slug = path.join("/")
  const folder = await getFolderBySlug(slug)
  if (!folder) notFound()
  const posts = await getPostsByFolder(slug)

  const segments = folder.path.split("/")
  const crumbs = segments.map((seg, i) => ({
    label: seg,
    href: `/folder/${segments.slice(0, i + 1).join("/")}`,
  }))

  return (
    <MainLayout right={<NewsletterBox />}>
      <nav className="mb-4 text-sm text-ink-mute">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        {crumbs.map((c, i) => (
          <span key={c.href}>
            <span className="mx-1.5">/</span>
            {i === crumbs.length - 1 ? (
              <span className="text-ink-soft">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-ink">
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
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
