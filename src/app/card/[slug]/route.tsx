import { ImageResponse } from "next/og"
import { getPostBySlug, getAllPosts } from "@/lib/content"
import { getProfile } from "@/lib/profile"

export const runtime = "nodejs"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

// Parse "#rgb"/"#rrggbb"/named fallback into {r,g,b}; returns null if the color is
// not a hex so we can gracefully fall back to the site accent.
function hexToRgb(value?: string): { r: number; g: number; b: number } | null {
  if (!value) return null
  const m = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  const hex = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1]
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const ACCENT = { r: 59, g: 130, b: 246 } // #3b82f6

function rgba(c: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const profile = getProfile()

  const title = post?.title ?? profile.blog_name
  const folder = (post?.folder || "Post").split("/").pop() || "Post"
  const accent = hexToRgb(post?.color) ?? ACCENT
  const icon = post?.icon?.trim()
  const isEmoji = Boolean(icon && /^\p{Extended_Pictographic}/u.test(icon))

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#0b0b0f",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        {/* Color-tinted glow, top-left */}
        <div
          style={{
            position: "absolute",
            left: -70,
            top: -110,
            width: 430,
            height: 430,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(accent, 0.45)} 0%, ${rgba(accent, 0)})`,
          }}
        />
        {/* Faint emoji watermark, bottom-right */}
        {isEmoji && (
          <div
            style={{
              position: "absolute",
              right: -18,
              bottom: -30,
              fontSize: 110,
              opacity: 0.22,
              transform: "rotate(-8deg)",
            }}
          >
            {icon}
          </div>
        )}
        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "26px 28px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                fontWeight: 600,
                color: rgba(accent, 1),
                border: `1px solid ${rgba(accent, 0.35)}`,
                borderRadius: 999,
                padding: "4px 11px",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {folder}
            </span>
            <span style={{ fontSize: 14, color: "#a1a1aa" }}>{profile.blog_name}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 23,
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: -0.3,
                // trim to two lines
                maxHeight: 56,
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: 12,
                width: 44,
                height: 5,
                borderRadius: 999,
                background: rgba(accent, 1),
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 384,
      height: 216,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  )
}