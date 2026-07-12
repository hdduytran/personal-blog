import type { Metadata } from "next"
import { getProfile } from "@/lib/profile"
import { renderMarkdown } from "@/lib/markdown"
import { MainLayout } from "@/components/layout/MainLayout"
import { NewsletterBox } from "@/components/layout/NewsletterBox"

export async function generateMetadata(): Promise<Metadata> {
  const profile = getProfile()
  return { title: "About", description: profile.blog_tagline }
}

export default async function AboutPage() {
  const profile = getProfile()
  const { html } = await renderMarkdown(profile.aboutContent)

  return (
    <MainLayout right={<NewsletterBox />}>
      <h1 className="mb-6 text-2xl font-bold text-ink">About</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </MainLayout>
  )
}
