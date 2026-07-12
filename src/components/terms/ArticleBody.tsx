"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

interface TermInfo {
  slug: string
  title: string
  excerpt: string
  tags: string[]
}

export function ArticleBody({ html, terms }: { html: string; terms: TermInfo[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<{ term: TermInfo; top: number; left: number } | null>(null)
  const termsRef = useRef<TermInfo[]>(terms)
  termsRef.current = terms

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const termMap = new Map(termsRef.current.map((t) => [t.slug, t]))

    function openTerm(node: HTMLElement) {
      const slug = node.dataset.termSlug || ""
      const term = termMap.get(slug)
      if (!term) return
      const rect = node.getBoundingClientRect()
      const left = Math.min(rect.left, window.innerWidth - 340)
      const top = rect.bottom + 8
      setPopup({ term, top, left: Math.max(8, left) })
    }

    // --- Delegated click handler (registered once) ---
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const termNode = target.closest<HTMLElement>(".term-link")
      if (termNode) {
        e.preventDefault()
        openTerm(termNode)
        return
      }

      // Ignore clicks inside the popup card itself (buttons handle their own logic).
      if (target.closest(".term-popup")) return

      // Click anywhere else closes any open popup.
      if (document.querySelector(".term-popup")) setPopup(null)
    }

    el.addEventListener("click", onClick)

    // --- Copy heading links ---
    el.querySelectorAll<HTMLAnchorElement>("a.heading-anchor").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault()
        const id = a.getAttribute("href") || ""
        const url = window.location.origin + window.location.pathname + id
        navigator.clipboard?.writeText(url)
        const prev = a.textContent
        a.textContent = "✓"
        setTimeout(() => (a.textContent = prev), 1200)
      })
    })

    // --- Mermaid ---
    const blocks = el.querySelectorAll<HTMLElement>(".mermaid-block")
    if (blocks.length > 0) {
      import("mermaid").then((mod) => {
        const mermaid = (mod as any).default || mod
        const isDark = document.documentElement.dataset.theme === "dark"
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
        })
        let i = 0
        blocks.forEach((block) => {
          const code = decodeURIComponent(block.dataset.code || "")
          const id = `mermaid-${i++}`
          mermaid.default
            .render(id, code)
            .then((res: any) => {
              block.innerHTML = res?.svg ?? res
            })
            .catch(() => {
              block.innerHTML = `<pre>${code}</pre>`
            })
        })
      })
    }

    return () => {
      el.removeEventListener("click", onClick)
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopup(null)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <div className="prose" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      {popup && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div
            className="term-popup pointer-events-auto absolute w-80 rounded-xl border border-line bg-canvas p-4 shadow-lg"
            style={{ top: popup.top, left: popup.left }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-ink">📘 {popup.term.title}</h4>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPopup(null)}
                className="text-ink-mute hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{popup.term.excerpt}</p>
            {popup.term.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {popup.term.tags.map((t) => (
                  <span key={t} className="rounded-full bg-hover px-2 py-0.5 text-xs text-ink-soft">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <Link
              href={`/terms/${popup.term.slug}`}
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              View details →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
