import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

const ATTACHMENTS_DIR = path.join(process.cwd(), "content", "attachments")

export const runtime = "nodejs"

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const parts = (await params).path

  // Prevent path traversal outside the attachments directory.
  const filePath = path.join(ATTACHMENTS_DIR, ...parts)
  if (!filePath.startsWith(path.join(ATTACHMENTS_DIR))) {
    return new NextResponse("Not found", { status: 404 })
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse("Not found", { status: 404 })
  }

  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  return new NextResponse(data, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}