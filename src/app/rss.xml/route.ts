import { getAllPosts } from "@/lib/content"
import { getProfile } from "@/lib/profile"

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const profile = getProfile()
  const posts = await getAllPosts()
  const siteUrl = "https://example.com"
  const buildDate = new Date().toUTCString()

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/p/${p.slug}`
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <category>${escapeXml(p.folder)}</category>
      ${p.created ? `<pubDate>${new Date(p.created).toUTCString()}</pubDate>` : ""}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(profile.seo.title || profile.blog_name)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(profile.seo.description || profile.blog_tagline)}</description>
    <language>vi</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
