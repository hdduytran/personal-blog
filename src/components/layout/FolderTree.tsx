"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type { FolderNode } from "@/lib/folders"
import { Icon } from "@/components/ui/Icon"

function FolderRow({
  node,
  indent,
  expanded,
  pathname,
  isExpanded,
  onToggle,
}: {
  node: FolderNode
  indent: number
  expanded: boolean
  pathname: string
  isExpanded: (slug: string) => boolean
  onToggle: (slug: string) => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(node.slug)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-hover hover:text-ink"
        style={{ paddingLeft: 10 + indent * 14 }}
      >
        <ChevronRight
          size={14}
          className={`shrink-0 text-ink-mute transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        <Icon name="folder" size={16} className={`shrink-0 ${expanded ? "text-accent" : "text-ink-soft"}`} />
        <span className="flex-1 truncate text-left font-medium">{node.name}</span>
        <span className="shrink-0 text-xs text-ink-mute">{node.count}</span>
      </button>
      {expanded && (
        <div>
          {node.children.map((child) => (
            <FolderRow
              key={child.slug}
              node={child}
              indent={indent + 1}
              expanded={isExpanded(child.slug)}
              pathname={pathname}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          ))}
          {node.posts.map((p) => {
            const active = pathname === `/p/${p.slug}`
            return (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                title={p.title}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-hover font-medium text-ink"
                    : "text-ink-mute hover:bg-hover hover:text-ink"
                }`}
                style={{ paddingLeft: 10 + (indent + 1) * 14 }}
              >
                <Icon name="file" size={16} className="shrink-0 text-ink-soft" />
                <span className="truncate">{p.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function FolderTree({ nodes }: { nodes: FolderNode[] }) {
  const pathname = usePathname()

  const autoExpanded = useMemo(() => {
    const expanded = new Set<string>()
    const walk = (list: FolderNode[], ancestors: string[]) => {
      for (const n of list) {
        const chain = [...ancestors, n.slug]
        const isActiveFolder =
          pathname === `/folder/${n.slug}` || pathname.startsWith(`/folder/${n.slug}/`)
        const containsActivePost = n.posts.some((p) => pathname === `/p/${p.slug}`)
        if (isActiveFolder || containsActivePost) {
          for (const s of chain) expanded.add(s)
        }
        walk(n.children, chain)
      }
    }
    walk(nodes, [])
    return expanded
  }, [pathname, nodes])

  const [expanded, setExpanded] = useState<Set<string>>(() => autoExpanded)

  const isExpanded = (slug: string) => expanded.has(slug)

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <div className="px-1 py-1">
      {nodes.map((node) => (
        <FolderRow
          key={node.slug}
          node={node}
          indent={0}
          expanded={isExpanded(node.slug)}
          pathname={pathname}
          isExpanded={isExpanded}
          onToggle={toggle}
        />
      ))}
      {nodes.length === 0 && <p className="px-3 py-2 text-xs text-ink-mute">No folders yet.</p>}
    </div>
  )
}
