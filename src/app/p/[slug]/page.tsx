import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllPosts, getPostBySlug, getAllTerms } from "@/lib/content"
import { getRelatedPosts } from "@/lib/related"
import { highlightTerms } from "@/lib/terms"
import { MainLayout } from "@/components/layout/MainLayout"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ArticleBody } from "@/components/terms/ArticleBody"
import { TableOfContents } from "@/components/article/TableOfContents"
import { RelatedPosts } from "@/components/content/RelatedPosts"
import { SocialShare } from "@/components/article/SocialShare"
import { SeriesNav } from "@/components/content/SeriesNav"
import { BackToTop } from "@/components/ui/BackToTop"
import { ReadingTime } from "@/components/ui/ReadingTime"
import { JsonLd } from "@/components/seo/JsonLd"
import { getPostsBySeries } from "@/lib/content"

function formatDate(d?: string) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [allPosts, allTerms] = await Promise.all([getAllPosts(), getAllTerms()])
  const related = getRelatedPosts(post, allPosts)
  const html = highlightTerms(post.bodyHtml, allTerms)
  const termData = allTerms.map((t) => ({
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    bodyHtml: t.bodyHtml,
    tags: t.tags,
  }))

  const seriesPosts = post.series ? await getPostsBySeries(post.series) : []

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.created,
    dateModified: post.updated || post.created,
    articleBody: post.excerpt,
  }

  return (
    <MainLayout
      right={
        <>
          <TableOfContents items={post.toc} />
          <RelatedPosts posts={related} />
        </>
      }
    >
      <JsonLd data={jsonLd} />
      <BackToTop />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: post.folder, href: `/folder/${post.folderSlug}` },
          { label: post.title },
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-ink">{post.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-mute">
        {post.created && <span>{formatDate(post.created)}</span>}
        {post.updated && post.updated !== post.created && (
          <span>· Updated {formatDate(post.updated)}</span>
        )}
        <ReadingTime minutes={post.readingTime} />
      </div>

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <a
              key={t}
              href={`/tag/${encodeURIComponent(t)}`}
              className="rounded-full bg-hover px-2.5 py-0.5 text-xs text-ink-soft transition-colors hover:text-accent"
            >
              #{t}
            </a>
          ))}
        </div>
      )}

      {post.series && <SeriesNav series={post.series} posts={seriesPosts} />}

      <ArticleBody html={html} terms={termData} />

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <span className="text-sm text-ink-mute">Share this post</span>
        <SocialShare title={post.title} />
      </div>
    </MainLayout>
  )
}
