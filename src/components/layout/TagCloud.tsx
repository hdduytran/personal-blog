"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function TagCloud({ tags }: { tags: string[] }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-3">
      {tags.map((t) => {
        const href = `/tag/${encodeURIComponent(t)}`
        const active = pathname === href
        return (
          <Link
            key={t}
            href={href}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              active
                ? "border-accent bg-accent text-white"
                : "border-line text-ink-soft hover:border-accent hover:text-accent"
            }`}
          >
            #{t}
          </Link>
        )
      })}
    </div>
  )
}
