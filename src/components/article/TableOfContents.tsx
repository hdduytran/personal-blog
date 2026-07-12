"use client"

import { useEffect, useState } from "react"

interface Item {
  depth: number
  text: string
  id: string
}

export function TableOfContents({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    )
    for (const it of items) {
      const el = document.getElementById(it.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-mute">
        On this page
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((it) => (
          <li key={it.id} style={{ paddingLeft: (it.depth - 2) * 12 }}>
            <a
              href={`#${it.id}`}
              className={`block truncate transition-colors ${
                active === it.id ? "text-accent" : "text-ink-soft hover:text-ink"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
