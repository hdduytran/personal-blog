import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeStringify from "rehype-stringify"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"
import type { Root, Text, Element } from "hast"
import type { Plugin } from "unified"

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TocItem {
  depth: number
  text: string
  id: string
}

export interface RenderOptions {
  wikilinkResolver?: (title: string) => string | null
  /** Remove the first inline image from the rendered body (used when it doubles as the cover). */
  stripCover?: boolean
}

export interface RenderResult {
  html: string
  toc: TocItem[]
  cover?: string
}

function textContent(node: any): string {
  if (!node) return ""
  if (node.type === "text") return node.value
  if (Array.isArray(node.children)) return node.children.map(textContent).join("")
  return ""
}

// Collect h2-h4 headings (after rehype-slug has assigned ids).
const collectToc: Plugin<[], Root> = () => (tree, file) => {
  const toc: TocItem[] = ((file as any).data.toc ||= []) as TocItem[]
  visit(tree, "element", (node: Element) => {
    if (/^h[2-4]$/.test(node.tagName)) {
      const id = (node.properties?.id as string) || ""
      toc.push({ depth: Number(node.tagName[1]), text: textContent(node), id })
    }
  })
}

// Rewrite Tolaria attachment references to the served /media route and record the
// first image as the post cover. When `stripCover` is set, that cover image is also
// removed from the body so it doesn't render twice (hero + inline). Assumes vault
// media lives in <root>/attachments.
const remarkMedia: Plugin<[{ out?: { cover?: string }; stripCover?: boolean }]> = (
  options
) => (tree: any) => {
  const out = options?.out
  const stripCover = options?.stripCover
  visit(tree, "image", (node: any, index, parent) => {
    const raw: string = String(node.url || "")
    const src = raw.replace(/\\/g, "/")
    // Only rewrite local vault references (e.g. attachments/foo.png, ../../attachments/foo.png).
    if (!/^(https?:)?\/\//i.test(src)) {
      const stripped = src.replace(/^(?:\.\.?\/)+/, "")
      const idx = stripped.indexOf("attachments/")
      node.url =
        idx >= 0 ? `/media/${stripped.slice(idx + "attachments/".length)}` : src
    }
    if (out && !out.cover && /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(node.url)) {
      out.cover = node.url
      if (stripCover && parent && typeof index === "number") {
        parent.children.splice(index, 1)
      }
    }
  })
}

// Turn ```mermaid fenced blocks into placeholders so shiki ignores them.
const remarkMermaid: Plugin = () => (tree: any) => {
  visit(tree, "code", (node: any, index, parent) => {
    if (node.lang !== "mermaid") return
    const code = String(node.value || "")
    const encoded = encodeURIComponent(code)
    const safe = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    const htmlNode = {
      type: "html",
      value: `<div class="mermaid-block" data-code="${encoded}"><pre>${safe}</pre></div>`,
    }
    if (parent && typeof index === "number") parent.children[index] = htmlNode
  })
}

// Resolve [[Wikilinks]] in paragraph/heading text.
const remarkWikilink: Plugin<[RenderOptions?]> = (options) => (tree: any) => {
  const resolve = options?.wikilinkResolver
  visit(tree, "text", (node: Text, index, parent) => {
    if (!parent || typeof index !== "number") return
    const value = node.value as string
    if (!value.includes("[[")) return
    const parts = value.split(/(\[\[[^\]]+\]\])/g)
    if (parts.length === 1) return
    const nodes: any[] = []
    for (const part of parts) {
      const m = part.match(/^\[\[([^\]]+)\]\]$/)
      if (m) {
        const inner = m[1]
        const [target, display] = inner.split("|").map((s) => s.trim())
        const label = display || target
        const href = resolve ? resolve(target) : null
        if (href) {
          nodes.push({
            type: "link",
            url: href,
            children: [{ type: "text", value: label }],
            data: { hProperties: { className: "wikilink" } },
          })
        } else {
          nodes.push({ type: "text", value: label })
        }
      } else if (part) {
        nodes.push({ type: "text", value: part })
      }
    }
    parent.children.splice(index, 1, ...nodes)
  })
}

function buildProcessor(options: RenderOptions, out?: { cover?: string }) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikilink, options)
    .use(remarkMedia, { out, stripCover: options.stripCover })
    .use(remarkMermaid)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(collectToc)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
      content: () => ({ type: "text", value: "#" }),
    })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: true,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
}

export async function renderMarkdown(
  raw: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const out: { cover?: string } = {}
  const proc = buildProcessor(options, out)
  const file = await proc.process(raw)
  const toc = ((file as any).data?.toc as TocItem[]) || []
  return { html: String(file), toc, cover: out.cover }
}

// Reading time from raw markdown (strip code fences + markdown syntax).
export function estimateReadingTime(raw: string): number {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~-]/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function plainTextExcerpt(raw: string, max = 160): string {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}
