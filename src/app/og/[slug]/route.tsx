import { ImageResponse } from "next/og"
import { getPostBySlug, getAllPosts } from "@/lib/content"
import { getProfile } from "@/lib/profile"

export const runtime = "nodejs"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const profile = getProfile()

  const title = post?.title ?? profile.blog_name
  const folder = post?.folder ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#fafafa",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>{profile.blog_name}</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#3b82f6" }}>{folder}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
